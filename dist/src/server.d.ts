#!/usr/bin/env node
/**
 * 開發決策顧問 MCP Server
 * 提供程式碼現代化、API組合推薦、相容性分析功能
 */
declare class DevAdvisorServer {
    private server;
    private modernizationAnalyzer;
    private compatibilityAnalyzer;
    private codeParser;
    private reportFormatter;
    private rules;
    private mdnService;
    private canIUseService;
    private apiKnowledge;
    constructor();
    private setupHandlers;
    /**
     * 驗證現代化分析參數
     */
    private validateModernizationArgs;
    private handleModernizationAnalysis;
    /**
     * 驗證 API 推薦參數
     */
    private validateApiRecommendationArgs;
    /**
     * 驗證相容性分析參數
     */
    private validateCompatibilityArgs;
    private handleApiRecommendation;
    /**
     * 解析目標瀏覽器版本
     */
    private parseBrowserVersions;
    /**
     * 為推薦的 API 查詢相容性
     */
    private fetchApiCompatibility;
    /**
     * 生成 API 推薦報告
     */
    private generateApiRecommendationReport;
    private handleCompatibilityAnalysis;
    /**
     * 處理 MDN 搜尋請求
     */
    private handleMDNSearch;
    /**
     * 處理瀏覽器支援檢查請求
     */
    private handleBrowserSupportCheck;
    /**
     * 取得狀態文字
     */
    private getStatusText;
    private formatModernizationReport;
    /**
     * 設定 Resources 處理器
     */
    private setupResourceHandlers;
    /**
     * 設定 Prompts 處理器
     */
    private setupPromptHandlers;
    run(): Promise<void>;
}
export { DevAdvisorServer };
//# sourceMappingURL=server.d.ts.map