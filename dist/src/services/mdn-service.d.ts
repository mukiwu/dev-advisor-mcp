/**
 * MDN Web Docs API 服務
 * 動態查詢 MDN 文件以獲取最新的 API 資訊
 */
/**
 * MDN 搜尋結果項目
 */
export interface MDNSearchResult {
    title: string;
    slug: string;
    locale: string;
    summary: string;
    url: string;
    score: number;
    highlight?: {
        body?: string[];
        title?: string[];
    };
}
/**
 * MDN 文件內容
 */
export interface MDNDocument {
    title: string;
    summary: string;
    url: string;
    browserCompat?: BrowserCompatData;
    deprecated?: boolean;
    experimental?: boolean;
    standardTrack?: boolean;
    syntax?: string;
    examples?: string[];
    seeAlso?: string[];
}
/**
 * 瀏覽器相容性資料
 */
export interface BrowserCompatData {
    chrome?: string | boolean;
    firefox?: string | boolean;
    safari?: string | boolean;
    edge?: string | boolean;
    ie?: string | boolean;
    opera?: string | boolean;
    nodejs?: string | boolean;
}
/**
 * MDN API 服務
 */
export declare class MDNService {
    private baseUrl;
    private apiUrl;
    private locale;
    constructor(locale?: string);
    /**
     * 搜尋 MDN 文件
     */
    search(query: string, limit?: number): Promise<MDNSearchResult[]>;
    /**
     * 取得特定 API 的詳細資訊
     */
    getAPIInfo(apiPath: string): Promise<MDNDocument | null>;
    /**
     * 從 slug 取得 API 資訊
     */
    private getAPIInfoFromSlug;
    /**
     * 解析 MDN 文件
     */
    private parseDocument;
    /**
     * 提取摘要
     */
    private extractSummary;
    /**
     * 檢查是否已棄用
     */
    private checkDeprecated;
    /**
     * 提取瀏覽器相容性
     */
    private extractBrowserCompat;
    /**
     * 格式化相容性版本
     */
    private formatCompatVersion;
    /**
     * 提取語法
     */
    private extractSyntax;
    /**
     * 提取相關連結
     */
    private extractSeeAlso;
    /**
     * 查詢已棄用的 API
     */
    searchDeprecatedAPIs(category?: string): Promise<MDNSearchResult[]>;
    /**
     * 取得 API 的現代替代方案
     */
    getModernAlternative(apiName: string): Promise<{
        deprecated: boolean;
        alternative?: string;
        reason?: string;
        mdnUrl?: string;
    }>;
    /**
     * 從摘要中找出替代方案
     */
    private findAlternativeInSummary;
}
/**
 * 建立 MDN 服務實例
 */
export declare function createMDNService(locale?: string): MDNService;
//# sourceMappingURL=mdn-service.d.ts.map