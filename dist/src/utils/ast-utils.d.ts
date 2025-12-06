/**
 * AST 工具函式
 * 提供共用的 AST 遍歷和分析功能
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
 * 遍歷 AST 樹
 */
export declare function traverseAST(node: ASTNode | null | undefined, visitor: (node: ASTNode) => void): void;
/**
 * 取得節點名稱
 */
export declare function getNodeName(node: ASTNode | null | undefined): string;
/**
 * 取得節點值
 */
export declare function getNodeValue(node: ASTNode | null | undefined): any;
/**
 * 檢查節點是否是特定類型的函式
 */
export declare function isFunction(node: ASTNode): boolean;
/**
 * 檢查節點是否是 IIFE (立即執行函式表達式)
 */
export declare function isIIFE(node: ASTNode): boolean;
/**
 * 檢查是否是 error-first callback 模式
 * callback(err, result) 格式
 */
export declare function isErrorFirstCallback(params: ASTNode[]): boolean;
/**
 * 檢查是否是可轉換為陣列方法的 for 迴圈
 */
export declare function isConvertibleForLoop(node: ASTNode): {
    convertible: boolean;
    suggestedMethod?: 'map' | 'filter' | 'forEach' | 'reduce' | 'find' | 'some' | 'every';
    reason?: string;
};
/**
 * 生成位置資訊
 */
export declare function getLocation(node: ASTNode): {
    line: number;
    column: number;
} | undefined;
//# sourceMappingURL=ast-utils.d.ts.map