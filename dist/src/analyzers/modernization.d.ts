import { CodeParser } from '../parsers/index.js';
import { ModernizationSuggestion } from '../data/modernization-rules.js';
export { ModernizationSuggestion, PerformanceImpact } from '../data/modernization-rules.js';
/**
 * 現代化分析結果
 */
export interface ModernizationAnalysis {
    summary: {
        totalFiles: number;
        totalSuggestions: number;
        potentialPerformanceGain: number;
        bundleSizeReduction: number;
    };
    suggestions: ModernizationSuggestion[];
    fileAnalysis: FileModernizationResult[];
    riskAssessment: RiskAssessment;
}
/**
 * 單一檔案的現代化結果
 */
export interface FileModernizationResult {
    filePath: string;
    suggestions: ModernizationSuggestion[];
    legacyPatterns: LegacyPattern[];
    modernizableApis: ModernizableApi[];
}
/**
 * 過時的程式碼模式
 */
export interface LegacyPattern {
    type: 'deprecated-api' | 'outdated-library' | 'inefficient-pattern' | 'compatibility-hack';
    pattern: string;
    description: string;
    location: {
        line: number;
        column: number;
    };
    severity: 'low' | 'medium' | 'high';
}
/**
 * 可現代化的 API
 */
export interface ModernizableApi {
    currentApi: string;
    modernApi: string;
    reason: string;
    compatibility: string;
    migrationComplexity: 'trivial' | 'simple' | 'moderate' | 'complex';
    location: {
        line: number;
        column: number;
    };
}
/**
 * 風險評估
 */
export interface RiskAssessment {
    overallRisk: 'low' | 'medium' | 'high';
    breakingChanges: BreakingChange[];
    compatibilityIssues: CompatibilityIssue[];
    migrationEffort: {
        estimatedHours: number;
        complexity: 'low' | 'medium' | 'high';
        priority: 'low' | 'medium' | 'high';
    };
}
export interface BreakingChange {
    type: string;
    description: string;
    impact: 'minor' | 'major' | 'critical';
    mitigation: string;
}
export interface CompatibilityIssue {
    api: string;
    browsers: string[];
    workaround?: string;
}
/**
 * 程式碼現代化分析器
 * 掃描程式碼找出可現代化的部分，提供升級建議
 */
export declare class ModernizationAnalyzer {
    private parser;
    private rules;
    constructor(parser: CodeParser);
    /**
     * 分析專案的現代化機會
     */
    analyze(projectPath: string, includePatterns: string[], excludePatterns: string[]): Promise<ModernizationAnalysis>;
    /**
     * 分析單一檔案
     */
    private analyzeFile;
    /**
     * 分析 import 語句
     */
    private analyzeImports;
    /**
     * 分析 API 呼叫
     */
    private analyzeApiCalls;
    /**
     * 分析程式碼模式
     */
    private analyzeCodePatterns;
    /**
     * 檢查回調函式模式，建議使用 Promise/async-await
     */
    private findCallbackPatterns;
    /**
     * 取得呼叫者名稱
     */
    private getCalleeName;
    /**
     * 檢查 var 宣告，建議使用 let/const
     */
    private findVarDeclarations;
    /**
     * 檢查 IIFE 模式，建議使用模組
     */
    private findIIFEPatterns;
    /**
     * 檢查是否有模組模式 (window.xxx = 或 global.xxx =)
     */
    private checkForModulePattern;
    /**
     * 檢查是否有私有變數宣告
     */
    private checkForPrivateVariables;
    /**
     * 檢查 for 迴圈，建議使用現代迭代方法
     */
    private findForLoopPatterns;
    /**
     * 分析 for 迴圈是否可轉換
     */
    private analyzeForLoop;
    /**
     * 生成現代迴圈程式碼
     */
    private generateModernLoopCode;
    /**
     * 生成摘要資訊
     */
    private generateSummary;
    /**
     * 評估現代化風險
     */
    private assessRisk;
    /**
     * 生成 API 呼叫程式碼
     */
    private generateApiCallCode;
    /**
     * 遍歷 AST
     */
    private traverseAST;
}
//# sourceMappingURL=modernization.d.ts.map