/**
 * Baseline 服務
 * 查詢 Web Features API 取得 Baseline 狀態
 * API: https://api.webstatus.dev/v1/features/
 */
/**
 * Baseline 狀態
 */
export type BaselineStatus = 'limited' | 'newly' | 'widely';
/**
 * Baseline 狀態資訊
 */
export interface BaselineInfo {
    status: BaselineStatus;
    label: string;
    description: string;
    icon: string;
    since?: string;
    widelySince?: string;
}
/**
 * Web Feature 資訊
 */
export interface WebFeature {
    id: string;
    name: string;
    description?: string;
    category?: string;
    baseline?: BaselineInfo;
    caniuse?: string;
    mdn?: {
        url?: string;
        slug?: string;
    };
    spec?: {
        url?: string;
        name?: string;
    };
    compat?: {
        chrome?: {
            since?: string;
            flags?: boolean;
        };
        firefox?: {
            since?: string;
            flags?: boolean;
        };
        safari?: {
            since?: string;
            flags?: boolean;
        };
        edge?: {
            since?: string;
            flags?: boolean;
        };
    };
}
/**
 * Baseline 服務
 */
export declare class BaselineService {
    private apiBaseUrl;
    private cache;
    private cacheDuration;
    /**
     * 取得所有功能列表
     */
    getAllFeatures(): Promise<WebFeature[]>;
    /**
     * 根據 ID 或名稱搜尋功能
     */
    searchFeature(query: string): Promise<WebFeature[]>;
    /**
     * 根據 ID 取得單一功能
     */
    getFeature(featureId: string): Promise<WebFeature | null>;
    /**
     * 取得 Baseline 狀態標籤
     */
    getBaselineLabel(status: BaselineStatus): string;
    /**
     * 取得 Baseline 狀態描述
     */
    getBaselineDescription(status: BaselineStatus): string;
    /**
     * 取得 Baseline 狀態圖示
     */
    getBaselineIcon(status: BaselineStatus): string;
    /**
     * 格式化 Baseline 資訊
     */
    formatBaselineInfo(feature: WebFeature): string;
    /**
     * 檢查功能是否可安全使用（newly 或 widely available）
     */
    isSafeToUse(feature: WebFeature): boolean;
    /**
     * 取得建議訊息
     */
    getRecommendation(feature: WebFeature): string;
}
//# sourceMappingURL=baseline-service.d.ts.map