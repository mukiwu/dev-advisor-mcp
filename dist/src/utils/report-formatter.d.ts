import { ModernizationAnalysis } from '../analyzers/modernization.js';
/**
 * 報告格式類型
 */
export type ReportFormat = 'markdown' | 'json' | 'html' | 'text';
/**
 * 報告生成器
 */
export declare class ReportFormatter {
    /**
     * 格式化現代化分析報告
     */
    formatModernizationReport(analysis: ModernizationAnalysis, format?: ReportFormat): string;
    /**
     * 格式化為 Markdown 報告
     */
    private formatMarkdownReport;
    /**
     * 格式化為 JSON 報告
     */
    private formatJsonReport;
    /**
     * 格式化為 HTML 報告
     */
    private formatHtmlReport;
    /**
     * 格式化為純文字報告
     */
    private formatTextReport;
    /**
     * 按類型分組建議
     */
    private groupSuggestionsByType;
    /**
     * 取得類型圖示
     */
    private getTypeIcon;
    /**
     * 取得類型顯示名稱
     */
    private getTypeDisplayName;
    /**
     * 取得風險圖示
     */
    private getRiskIcon;
    /**
     * HTML 轉義
     * 將特殊字元轉換為 HTML entities，防止 XSS 攻擊
     */
    private escapeHtml;
}
//# sourceMappingURL=report-formatter.d.ts.map