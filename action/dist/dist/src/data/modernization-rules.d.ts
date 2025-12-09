/**
 * 效能影響評估
 */
export interface PerformanceImpact {
    performance: number;
    bundle: number;
    maintainability: number;
}
/**
 * 現代化建議
 */
export interface ModernizationSuggestion {
    id: string;
    type: 'library-replacement' | 'api-modernization' | 'syntax-modernization' | 'pattern-modernization';
    title: string;
    description: string;
    currentCode: string;
    modernCode: string;
    location?: {
        line: number;
        column: number;
    };
    impact: PerformanceImpact;
    difficulty: 'trivial' | 'simple' | 'moderate' | 'complex';
    breaking: boolean;
}
/**
 * 現代化規則
 */
export interface ModernizationRule {
    name: string;
    modernAlternative: string;
    reason: string;
    compatibility: string;
    impact: PerformanceImpact;
    difficulty: 'trivial' | 'simple' | 'moderate' | 'complex';
    breaking: boolean;
    deprecated: boolean;
    severity?: 'low' | 'medium' | 'high';
    migrationExample: string;
    references?: string[];
}
/**
 * 現代化規則資料庫
 */
export declare class ModernizationRules {
    private libraryRules;
    private apiRules;
    constructor();
    /**
     * 初始化函式庫規則
     */
    private initializeLibraryRules;
    /**
     * 初始化 API 規則
     */
    private initializeApiRules;
    /**
     * 取得函式庫規則
     */
    getLibraryRule(libraryName: string): ModernizationRule | undefined;
    /**
     * 取得 API 規則
     */
    getApiRule(apiName: string): ModernizationRule | undefined;
    /**
     * 取得所有函式庫規則
     */
    getAllLibraryRules(): Map<string, ModernizationRule>;
    /**
     * 取得所有 API 規則
     */
    getAllApiRules(): Map<string, ModernizationRule>;
    /**
     * 搜尋相關規則
     */
    searchRules(query: string): ModernizationRule[];
    /**
     * 新增自定義規則
     */
    addLibraryRule(name: string, rule: ModernizationRule): void;
    /**
     * 新增 API 規則
     */
    addApiRule(name: string, rule: ModernizationRule): void;
    /**
     * 取得統計資訊
     */
    getStatistics(): {
        totalRules: number;
        libraryRules: number;
        apiRules: number;
        deprecatedRules: number;
        highImpactRules: number;
    };
}
//# sourceMappingURL=modernization-rules.d.ts.map