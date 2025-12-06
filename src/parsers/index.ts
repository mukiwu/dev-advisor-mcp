import { parse } from '@typescript-eslint/parser';
import * as recast from 'recast';
import { glob } from 'glob';
import { readFileSync, existsSync } from 'fs';
import { join, resolve, extname } from 'path';

/**
 * AST 節點類型定義
 */
export interface ASTNode {
  type: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  range?: [number, number];
  [key: string]: any;
}

/**
 * 檔案分析結果
 */
export interface ParsedFile {
  filePath: string;
  ast: ASTNode;
  imports: ImportInfo[];
  exports: ExportInfo[];
  functions: FunctionInfo[];
  apiCalls: ApiCallInfo[];
  dependencies: string[];
}

export interface ImportInfo {
  source: string;
  specifiers: Array<{
    imported: string;
    local: string;
    type: 'default' | 'named' | 'namespace';
  }>;
  isTypeOnly: boolean;
  loc?: { line: number; column: number };
}

export interface ExportInfo {
  name: string;
  type: 'default' | 'named';
  loc?: { line: number; column: number };
}

export interface FunctionInfo {
  name: string;
  parameters: string[];
  isAsync: boolean;
  isArrow: boolean;
  loc?: { line: number; column: number };
}

export interface ApiCallInfo {
  api: string;
  method?: string;
  arguments: any[];
  loc?: { line: number; column: number };
}

/**
 * TypeScript/JavaScript 程式碼解析器
 */
export class CodeParser {
  private readonly supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];

  /**
   * 解析專案中的所有支援的檔案
   */
  async parseProject(
    projectPath: string,
    includePatterns: string[] = ['**/*.{js,ts,jsx,tsx}'],
    excludePatterns: string[] = ['node_modules/**', 'dist/**', 'build/**']
  ): Promise<ParsedFile[]> {
    const files = await this.findFiles(projectPath, includePatterns, excludePatterns);
    const results: ParsedFile[] = [];

    for (const file of files) {
      try {
        const parsed = await this.parseFile(file);
        if (parsed) {
          results.push(parsed);
        }
      } catch (error) {
        console.warn(`無法解析檔案 ${file}:`, error instanceof Error ? error.message : error);
      }
    }

    return results;
  }

  /**
   * 解析單一檔案
   */
  async parseFile(filePath: string): Promise<ParsedFile | null> {
    if (!existsSync(filePath)) {
      throw new Error(`檔案不存在: ${filePath}`);
    }

    const ext = extname(filePath);
    if (!this.supportedExtensions.includes(ext)) {
      return null;
    }

    const content = readFileSync(filePath, 'utf-8');
    return this.parseCode(content, filePath);
  }

  /**
   * 解析程式碼字串
   */
  parseCode(code: string, filePath?: string): ParsedFile {
    try {
      // 使用 TypeScript ESLint Parser 解析
      const ast = parse(code, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
          globalReturn: false
        },
        loc: true,
        range: true,
        comment: true,
        attachComments: true
      }) as ASTNode;

      // 分析 AST 提取資訊
      const imports = this.extractImports(ast);
      const exports = this.extractExports(ast);
      const functions = this.extractFunctions(ast);
      const apiCalls = this.extractApiCalls(ast);
      const dependencies = this.extractDependencies(imports);

      return {
        filePath: filePath || '<unknown>',
        ast,
        imports,
        exports,
        functions,
        apiCalls,
        dependencies
      };
    } catch (error) {
      throw new Error(`解析失敗: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 搜尋檔案
   */
  private async findFiles(
    projectPath: string,
    includePatterns: string[],
    excludePatterns: string[]
  ): Promise<string[]> {
    const files: string[] = [];

    for (const pattern of includePatterns) {
      try {
        const matches = await glob(pattern, {
          cwd: resolve(projectPath),
          ignore: excludePatterns,
          absolute: true
        });
        files.push(...matches);
      } catch (error) {
        console.warn(`搜尋模式 ${pattern} 失敗:`, error);
      }
    }

    // 去重並排序
    return [...new Set(files)].sort();
  }

  /**
   * 提取 import 語句資訊 (支援 ES Module 和 CommonJS)
   */
  private extractImports(ast: ASTNode): ImportInfo[] {
    const imports: ImportInfo[] = [];

    this.traverseAST(ast, (node) => {
      // ES Module: import ... from '...'
      if (node.type === 'ImportDeclaration') {
        const source = node.source?.value as string;
        if (!source) return;

        const specifiers = (node.specifiers || []).map((spec: any) => {
          if (spec.type === 'ImportDefaultSpecifier') {
            return {
              imported: 'default',
              local: spec.local?.name || '',
              type: 'default' as const
            };
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            return {
              imported: '*',
              local: spec.local?.name || '',
              type: 'namespace' as const
            };
          } else if (spec.type === 'ImportSpecifier') {
            return {
              imported: spec.imported?.name || '',
              local: spec.local?.name || '',
              type: 'named' as const
            };
          }
          return null;
        }).filter(Boolean);

        imports.push({
          source,
          specifiers,
          isTypeOnly: node.importKind === 'type',
          loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
        });
      }

      // CommonJS: require('...')
      if (node.type === 'CallExpression' &&
        node.callee?.type === 'Identifier' &&
        node.callee.name === 'require' &&
        node.arguments?.[0]?.type === 'Literal' &&
        typeof node.arguments[0].value === 'string') {

        const source = node.arguments[0].value;
        let specifiers: ImportInfo['specifiers'] = [];

        // 檢查 require 的使用方式
        // 1. const x = require('...') - default import
        // 2. const { a, b } = require('...') - named imports
        // 3. require('...') - side effect import

        // 找到父節點來判斷使用方式
        const parent = this.findParentNode(ast, node);

        if (parent?.type === 'VariableDeclarator') {
          const id = parent.id;

          // const { a, b } = require('...')
          if (id?.type === 'ObjectPattern') {
            specifiers = (id.properties || [])
              .filter((prop: any) => prop.type === 'Property')
              .map((prop: any) => ({
                imported: prop.key?.name || prop.key?.value || '',
                local: prop.value?.name || prop.key?.name || '',
                type: 'named' as const
              }));
          }
          // const x = require('...')
          else if (id?.type === 'Identifier') {
            specifiers = [{
              imported: 'default',
              local: id.name,
              type: 'default' as const
            }];
          }
        }

        // 避免重複添加 (同一位置的 require)
        const existingImport = imports.find(
          imp => imp.source === source &&
            imp.loc?.line === node.loc?.start?.line
        );

        if (!existingImport) {
          imports.push({
            source,
            specifiers,
            isTypeOnly: false,
            loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
          });
        }
      }
    });

    return imports;
  }

  /**
   * 找到指定節點的父節點
   */
  private findParentNode(ast: ASTNode, targetNode: ASTNode): ASTNode | null {
    let parent: ASTNode | null = null;

    const search = (node: ASTNode, parentNode: ASTNode | null) => {
      if (node === targetNode) {
        parent = parentNode;
        return true;
      }

      for (const key in node) {
        const child = node[key];
        if (child && typeof child === 'object') {
          if (Array.isArray(child)) {
            for (const item of child) {
              if (item && typeof item === 'object' && item.type) {
                if (search(item, node)) return true;
              }
            }
          } else if (child.type) {
            if (search(child, node)) return true;
          }
        }
      }
      return false;
    };

    search(ast, null);
    return parent;
  }

  /**
   * 提取 export 語句資訊
   */
  private extractExports(ast: ASTNode): ExportInfo[] {
    const exports: ExportInfo[] = [];

    this.traverseAST(ast, (node) => {
      if (node.type === 'ExportDefaultDeclaration') {
        exports.push({
          name: 'default',
          type: 'default',
          loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
        });
      } else if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration) {
          // export function/class/variable
          const name = node.declaration.id?.name || node.declaration.name;
          if (name) {
            exports.push({
              name,
              type: 'named',
              loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
            });
          }
        } else if (node.specifiers) {
          // export { ... }
          for (const spec of node.specifiers) {
            if (spec.type === 'ExportSpecifier') {
              exports.push({
                name: spec.exported?.name || '',
                type: 'named',
                loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
              });
            }
          }
        }
      }
    });

    return exports;
  }

  /**
   * 提取函式資訊
   */
  private extractFunctions(ast: ASTNode): FunctionInfo[] {
    const functions: FunctionInfo[] = [];

    this.traverseAST(ast, (node) => {
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
        const name = node.id?.name || '<anonymous>';
        const parameters = (node.params || []).map((param: any) => param.name || param.type);

        functions.push({
          name,
          parameters,
          isAsync: node.async === true,
          isArrow: false,
          loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
        });
      } else if (node.type === 'ArrowFunctionExpression') {
        const parameters = (node.params || []).map((param: any) => param.name || param.type);

        functions.push({
          name: '<arrow>',
          parameters,
          isAsync: node.async === true,
          isArrow: true,
          loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
        });
      }
    });

    return functions;
  }

  /**
   * 提取 API 呼叫資訊
   */
  private extractApiCalls(ast: ASTNode): ApiCallInfo[] {
    const apiCalls: ApiCallInfo[] = [];

    this.traverseAST(ast, (node) => {
      if (node.type === 'CallExpression') {
        let api = '';
        let method: string | undefined;

        if (node.callee.type === 'Identifier') {
          // 函式呼叫: func()
          api = node.callee.name;
        } else if (node.callee.type === 'MemberExpression') {
          // 方法呼叫: obj.method()
          const object = this.getNodeName(node.callee.object);
          const property = this.getNodeName(node.callee.property);
          api = object;
          method = property;
        }

        if (api) {
          apiCalls.push({
            api,
            method,
            arguments: (node.arguments || []).map((arg: any) => this.getNodeValue(arg)),
            loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
          });
        }
      }
    });

    return apiCalls;
  }

  /**
   * 提取依賴項目
   */
  private extractDependencies(imports: ImportInfo[]): string[] {
    const deps = new Set<string>();

    for (const imp of imports) {
      // 只收集外部依賴 (不是相對路徑)
      if (!imp.source.startsWith('.') && !imp.source.startsWith('/')) {
        // 處理 scoped packages (如 @types/node)
        const parts = imp.source.split('/');
        if (parts[0].startsWith('@')) {
          deps.add(`${parts[0]}/${parts[1]}`);
        } else {
          deps.add(parts[0]);
        }
      }
    }

    return Array.from(deps).sort();
  }

  /**
   * 遍歷 AST
   */
  private traverseAST(node: ASTNode, visitor: (node: ASTNode) => void) {
    visitor(node);

    for (const key in node) {
      const child = node[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          for (const item of child) {
            if (item && typeof item === 'object' && item.type) {
              this.traverseAST(item, visitor);
            }
          }
        } else if (child.type) {
          this.traverseAST(child, visitor);
        }
      }
    }
  }

  /**
   * 取得節點名稱
   */
  private getNodeName(node: ASTNode): string {
    if (!node) return '';

    switch (node.type) {
      case 'Identifier':
        return node.name || '';
      case 'MemberExpression':
        const obj = this.getNodeName(node.object);
        const prop = this.getNodeName(node.property);
        return obj && prop ? `${obj}.${prop}` : '';
      case 'ThisExpression':
        return 'this';
      default:
        return node.type;
    }
  }

  /**
   * 取得節點值
   */
  private getNodeValue(node: ASTNode): any {
    if (!node) return null;

    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'Identifier':
        return node.name;
      case 'ArrayExpression':
        return (node.elements || []).map((el: any) => this.getNodeValue(el));
      case 'ObjectExpression':
        const obj: Record<string, any> = {};
        for (const prop of node.properties || []) {
          if (prop.type === 'Property') {
            const key = this.getNodeValue(prop.key);
            const value = this.getNodeValue(prop.value);
            obj[key] = value;
          }
        }
        return obj;
      default:
        return `<${node.type}>`;
    }
  }
}
