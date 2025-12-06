/**
 * API 相容性分析器
 * 分析專案中使用的 API 與目標瀏覽器的相容性
 */
import { CodeParser } from '../parsers/index.js';
import { CanIUseService } from '../services/caniuse-service.js';
import { ReportFormat } from '../utils/report-formatter.js';
/**
 * 瀏覽器版本資訊
 */
export interface BrowserVersion {
    name: string;
    version: string;
    displayName: string;
}
/**
 * API 相容性問題
 */
export interface CompatibilityIssue {
    api: string;
    caniuseId: string;
    locations: Array<{
        file: string;
        line: number;
        column: number;
    }>;
    globalSupport: number;
    unsupportedBrowsers: string[];
    partiallySupportedBrowsers: string[];
    polyfillAvailable: boolean;
    polyfillUrl?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    recommendation: string;
}
/**
 * 相容性分析結果
 */
export interface CompatibilityAnalysis {
    summary: {
        totalApisAnalyzed: number;
        compatibleApis: number;
        incompatibleApis: number;
        partiallyCompatibleApis: number;
        overallCompatibility: number;
        polyfillsNeeded: number;
    };
    targetBrowsers: BrowserVersion[];
    browserslistQuery: string;
    issues: CompatibilityIssue[];
    polyfillRecommendations: PolyfillRecommendation[];
    fileAnalysis: FileCompatibilityResult[];
}
/**
 * Polyfill 建議
 */
export interface PolyfillRecommendation {
    api: string;
    polyfillUrl: string;
    cdnScript: string;
    npmPackage?: string;
    affectedBrowsers: string[];
}
/**
 * 單一檔案的相容性結果
 */
export interface FileCompatibilityResult {
    filePath: string;
    apisUsed: string[];
    issues: CompatibilityIssue[];
}
/**
 * 相容性分析器
 */
export declare class CompatibilityAnalyzer {
    private parser;
    private canIUseService;
    constructor(parser: CodeParser, canIUseService: CanIUseService);
    /**
     * 分析專案的 API 相容性
     */
    analyze(projectPath: string, includePatterns: string[], excludePatterns: string[], browserslistConfig?: string): Promise<CompatibilityAnalysis>;
    /**
     * 解析 browserslist 配置
     */
    private parseBrowserslistConfig;
    /**
     * 收集專案中使用的 API
     */
    private collectApiUsage;
    /**
     * 判斷是否是 Web API
     * 使用嚴格匹配，避免誤判專案自訂函數
     */
    private isWebApi;
    /**
     * 取得 Can I Use ID
     * 使用精確匹配，避免誤判
     */
    private getCaniuseId;
    /**
     * 轉換瀏覽器版本格式
     */
    private convertBrowserVersions;
    /**
     * 建立相容性問題
     */
    private createIssue;
    /**
     * 生成 Polyfill 建議
     */
    private generatePolyfillRecommendations;
    /**
     * 取得 npm 套件名稱
     */
    private getNpmPackage;
    /**
     * 生成摘要資訊
     */
    private generateSummary;
}
/**
 * 格式化相容性報告
 */
export declare function formatCompatibilityReport(analysis: CompatibilityAnalysis, format?: ReportFormat): string;
//# sourceMappingURL=compatibility.d.ts.map