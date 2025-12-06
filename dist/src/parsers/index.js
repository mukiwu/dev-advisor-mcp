import { parse } from '@typescript-eslint/parser';
import { glob } from 'glob';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
/**
 * TypeScript/JavaScript 程式碼解析器
 */
export class CodeParser {
    supportedExtensions = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'];
    /**
     * 解析專案中的所有支援的檔案
     */
    async parseProject(projectPath, includePatterns = ['**/*.{js,ts,jsx,tsx}'], excludePatterns = ['node_modules/**', 'dist/**', 'build/**']) {
        const files = await this.findFiles(projectPath, includePatterns, excludePatterns);
        const results = [];
        for (const file of files) {
            try {
                const parsed = await this.parseFile(file);
                if (parsed) {
                    results.push(parsed);
                }
            }
            catch (error) {
                console.warn(`無法解析檔案 ${file}:`, error instanceof Error ? error.message : error);
            }
        }
        return results;
    }
    /**
     * 解析單一檔案
     */
    async parseFile(filePath) {
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
    parseCode(code, filePath) {
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
            });
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
        }
        catch (error) {
            throw new Error(`解析失敗: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 搜尋檔案
     */
    async findFiles(projectPath, includePatterns, excludePatterns) {
        const files = [];
        for (const pattern of includePatterns) {
            try {
                const matches = await glob(pattern, {
                    cwd: resolve(projectPath),
                    ignore: excludePatterns,
                    absolute: true
                });
                files.push(...matches);
            }
            catch (error) {
                console.warn(`搜尋模式 ${pattern} 失敗:`, error);
            }
        }
        // 去重並排序
        return [...new Set(files)].sort();
    }
    /**
     * 提取 import 語句資訊 (支援 ES Module 和 CommonJS)
     */
    extractImports(ast) {
        const imports = [];
        this.traverseAST(ast, (node) => {
            // ES Module: import ... from '...'
            if (node.type === 'ImportDeclaration') {
                const source = node.source?.value;
                if (!source)
                    return;
                const specifiers = (node.specifiers || []).map((spec) => {
                    if (spec.type === 'ImportDefaultSpecifier') {
                        return {
                            imported: 'default',
                            local: spec.local?.name || '',
                            type: 'default'
                        };
                    }
                    else if (spec.type === 'ImportNamespaceSpecifier') {
                        return {
                            imported: '*',
                            local: spec.local?.name || '',
                            type: 'namespace'
                        };
                    }
                    else if (spec.type === 'ImportSpecifier') {
                        return {
                            imported: spec.imported?.name || '',
                            local: spec.local?.name || '',
                            type: 'named'
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
                let specifiers = [];
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
                            .filter((prop) => prop.type === 'Property')
                            .map((prop) => ({
                            imported: prop.key?.name || prop.key?.value || '',
                            local: prop.value?.name || prop.key?.name || '',
                            type: 'named'
                        }));
                    }
                    // const x = require('...')
                    else if (id?.type === 'Identifier') {
                        specifiers = [{
                                imported: 'default',
                                local: id.name,
                                type: 'default'
                            }];
                    }
                }
                // 避免重複添加 (同一位置的 require)
                const existingImport = imports.find(imp => imp.source === source &&
                    imp.loc?.line === node.loc?.start?.line);
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
    findParentNode(ast, targetNode) {
        let parent = null;
        const search = (node, parentNode) => {
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
                                if (search(item, node))
                                    return true;
                            }
                        }
                    }
                    else if (child.type) {
                        if (search(child, node))
                            return true;
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
    extractExports(ast) {
        const exports = [];
        this.traverseAST(ast, (node) => {
            if (node.type === 'ExportDefaultDeclaration') {
                exports.push({
                    name: 'default',
                    type: 'default',
                    loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                });
            }
            else if (node.type === 'ExportNamedDeclaration') {
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
                }
                else if (node.specifiers) {
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
    extractFunctions(ast) {
        const functions = [];
        this.traverseAST(ast, (node) => {
            if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
                const name = node.id?.name || '<anonymous>';
                const parameters = (node.params || []).map((param) => param.name || param.type);
                functions.push({
                    name,
                    parameters,
                    isAsync: node.async === true,
                    isArrow: false,
                    loc: node.loc ? { line: node.loc.start.line, column: node.loc.start.column } : undefined
                });
            }
            else if (node.type === 'ArrowFunctionExpression') {
                const parameters = (node.params || []).map((param) => param.name || param.type);
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
    extractApiCalls(ast) {
        const apiCalls = [];
        this.traverseAST(ast, (node) => {
            if (node.type === 'CallExpression') {
                let api = '';
                let method;
                if (node.callee.type === 'Identifier') {
                    // 函式呼叫: func()
                    api = node.callee.name;
                }
                else if (node.callee.type === 'MemberExpression') {
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
                        arguments: (node.arguments || []).map((arg) => this.getNodeValue(arg)),
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
    extractDependencies(imports) {
        const deps = new Set();
        for (const imp of imports) {
            // 只收集外部依賴 (不是相對路徑)
            if (!imp.source.startsWith('.') && !imp.source.startsWith('/')) {
                // 處理 scoped packages (如 @types/node)
                const parts = imp.source.split('/');
                if (parts[0].startsWith('@')) {
                    deps.add(`${parts[0]}/${parts[1]}`);
                }
                else {
                    deps.add(parts[0]);
                }
            }
        }
        return Array.from(deps).sort();
    }
    /**
     * 遍歷 AST
     */
    traverseAST(node, visitor) {
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
                }
                else if (child.type) {
                    this.traverseAST(child, visitor);
                }
            }
        }
    }
    /**
     * 取得節點名稱
     */
    getNodeName(node) {
        if (!node)
            return '';
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
    getNodeValue(node) {
        if (!node)
            return null;
        switch (node.type) {
            case 'Literal':
                return node.value;
            case 'Identifier':
                return node.name;
            case 'ArrayExpression':
                return (node.elements || []).map((el) => this.getNodeValue(el));
            case 'ObjectExpression':
                const obj = {};
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
//# sourceMappingURL=index.js.map