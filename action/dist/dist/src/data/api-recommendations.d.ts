/**
 * API 推薦知識庫
 * 包含常見需求到現代 Web API 的映射，以及 Can I Use feature ID
 */
/**
 * 推薦的 API 資訊
 */
export interface RecommendedApi {
    name: string;
    description: string;
    caniuseId: string;
    category: string;
    useCases: string[];
    codeExample: string;
    replacesLibraries?: string[];
    relatedApis?: string[];
    performanceLevel: 'low' | 'medium' | 'high';
}
/**
 * 需求關鍵字到 API 的映射
 */
export interface KeywordMapping {
    keywords: string[];
    apis: string[];
}
/**
 * API 推薦知識庫
 */
export declare class ApiRecommendationKnowledge {
    private apis;
    private keywordMappings;
    constructor();
    /**
     * 初始化 API 資料
     */
    private initializeApis;
    /**
     * 初始化關鍵字映射
     */
    private initializeKeywordMappings;
    /**
     * 根據需求描述推薦 API
     */
    recommendApis(requirement: string, performanceLevel?: 'low' | 'medium' | 'high'): RecommendedApi[];
    /**
     * 取得 API 資訊
     */
    getApi(name: string): RecommendedApi | undefined;
    /**
     * 取得所有 API
     */
    getAllApis(): RecommendedApi[];
    /**
     * 根據 Can I Use ID 取得 API
     */
    getApiByCaniuseId(caniuseId: string): RecommendedApi | undefined;
}
//# sourceMappingURL=api-recommendations.d.ts.map