/**
 * Can I Use API 服務
 * 動態查詢瀏覽器相容性資料
 */
/**
 * 瀏覽器支援狀態
 */
export type SupportStatus = 'y' | 'n' | 'a' | 'p' | 'u' | 'x';
/**
 * 功能支援資料
 */
export interface FeatureSupport {
    featureId: string;
    title: string;
    description: string;
    status: 'rec' | 'pr' | 'cr' | 'wd' | 'ls' | 'other';
    usage: number;
    categories: string[];
    browsers: BrowserSupport;
    notes?: string[];
    links?: {
        url: string;
        title: string;
    }[];
    mdnUrl?: string;
    specUrl?: string;
}
/**
 * 各瀏覽器支援資料
 */
export interface BrowserSupport {
    chrome: BrowserVersionSupport;
    firefox: BrowserVersionSupport;
    safari: BrowserVersionSupport;
    edge: BrowserVersionSupport;
    ie: BrowserVersionSupport;
    opera: BrowserVersionSupport;
    ios_saf: BrowserVersionSupport;
    android: BrowserVersionSupport;
    samsung: BrowserVersionSupport;
}
/**
 * 瀏覽器版本支援
 */
export interface BrowserVersionSupport {
    supported: boolean;
    partialSupport: boolean;
    sinceVersion?: string;
    currentSupport: SupportStatus;
    notes?: string[];
}
/**
 * 相容性報告
 */
export interface CompatibilityReport {
    feature: string;
    globalSupport: number;
    supported: string[];
    notSupported: string[];
    partialSupport: string[];
    recommendation: string;
    polyfillAvailable: boolean;
    polyfillUrl?: string;
}
/**
 * Can I Use 服務
 */
export declare class CanIUseService {
    private dataUrls;
    private cachedData;
    private cacheTime;
    private cacheDuration;
    /**
     * 載入 Can I Use 資料（支援 fallback）
     */
    private loadData;
    /**
     * 搜尋功能
     */
    searchFeature(query: string): Promise<string[]>;
    /**
     * 取得功能的瀏覽器支援資料
     */
    getFeatureSupport(featureId: string): Promise<FeatureSupport | null>;
    /**
     * 計算全球使用率
     */
    private calculateGlobalUsage;
    /**
     * 解析瀏覽器支援資料
     */
    private parseBrowserSupport;
    /**
     * 解析備註
     */
    private parseNotes;
    /**
     * 檢查 API 在目標瀏覽器中的相容性
     */
    checkCompatibility(featureId: string, targetBrowsers?: Record<string, string>): Promise<CompatibilityReport>;
    /**
     * 檢查是否有 polyfill
     */
    private checkPolyfillAvailable;
    /**
     * 取得 polyfill URL
     */
    private getPolyfillUrl;
    /**
     * 批次檢查多個功能的相容性
     */
    checkMultipleFeatures(featureIds: string[], targetBrowsers?: Record<string, string>): Promise<CompatibilityReport[]>;
    /**
     * 取得特定類別的功能列表
     */
    getFeaturesByCategory(category: string): Promise<string[]>;
}
/**
 * API 名稱到 Can I Use ID 的映射
 * 用於從常見的 API 呼叫名稱查詢對應的 caniuse feature ID
 */
export declare const API_NAME_TO_CANIUSE: Record<string, string>;
/**
 * 從 API 名稱取得 Can I Use ID
 */
export declare function getCaniuseIdFromApiName(apiName: string): string | null;
/**
 * 建立 Can I Use 服務實例
 */
export declare function createCanIUseService(): CanIUseService;
//# sourceMappingURL=caniuse-service.d.ts.map