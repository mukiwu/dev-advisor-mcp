/**
 * AST 節點類型定義
 */
export interface ASTNode {
    type: string;
    loc?: {
        start: {
            line: number;
            column: number;
        };
        end: {
            line: number;
            column: number;
        };
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
    loc?: {
        line: number;
        column: number;
    };
}
export interface ExportInfo {
    name: string;
    type: 'default' | 'named';
    loc?: {
        line: number;
        column: number;
    };
}
export interface FunctionInfo {
    name: string;
    parameters: string[];
    isAsync: boolean;
    isArrow: boolean;
    loc?: {
        line: number;
        column: number;
    };
}
export interface ApiCallInfo {
    api: string;
    method?: string;
    arguments: any[];
    loc?: {
        line: number;
        column: number;
    };
}
/**
 * TypeScript/JavaScript 程式碼解析器
 */
export declare class CodeParser {
    private readonly supportedExtensions;
    /**
     * 解析專案中的所有支援的檔案
     */
    parseProject(projectPath: string, includePatterns?: string[], excludePatterns?: string[]): Promise<ParsedFile[]>;
    /**
     * 解析單一檔案
     */
    parseFile(filePath: string): Promise<ParsedFile | null>;
    /**
     * 解析程式碼字串
     */
    parseCode(code: string, filePath?: string): ParsedFile;
    /**
     * 搜尋檔案
     */
    private findFiles;
    /**
     * 提取 import 語句資訊 (支援 ES Module 和 CommonJS)
     */
    private extractImports;
    /**
     * 找到指定節點的父節點
     */
    private findParentNode;
    /**
     * 提取 export 語句資訊
     */
    private extractExports;
    /**
     * 提取函式資訊
     */
    private extractFunctions;
    /**
     * 提取 API 呼叫資訊
     */
    private extractApiCalls;
    /**
     * 提取依賴項目
     */
    private extractDependencies;
    /**
     * 遍歷 AST
     */
    private traverseAST;
    /**
     * 取得節點名稱
     */
    private getNodeName;
    /**
     * 取得節點值
     */
    private getNodeValue;
}
//# sourceMappingURL=index.d.ts.map