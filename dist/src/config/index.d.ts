/**
 * 設定檔載入和管理
 * 支援 .devadvisorrc.json, .devadvisorrc, devadvisor.config.js 設定檔
 */
import { ModernizationRule } from '../data/modernization-rules.js';
/**
 * 規則覆寫設定
 */
export interface RuleOverride {
    enabled?: boolean;
    severity?: 'off' | 'low' | 'medium' | 'high';
    customMessage?: string;
}
/**
 * 自訂規則設定
 */
export interface CustomRule extends Partial<ModernizationRule> {
    name: string;
    modernAlternative: string;
    reason: string;
}
/**
 * Dev Advisor 設定
 */
export interface DevAdvisorConfig {
    extends?: string | string[];
    include?: string[];
    exclude?: string[];
    rules?: {
        builtin?: Record<string, RuleOverride>;
        customLibraries?: Record<string, CustomRule>;
        customApis?: Record<string, CustomRule>;
    };
    report?: {
        format?: 'markdown' | 'json' | 'html' | 'text';
        outputFile?: string;
        includePassedFiles?: boolean;
        maxSuggestionsPerFile?: number;
    };
    performance?: {
        useCache?: boolean;
        cacheDir?: string;
        maxCacheAge?: number;
        parallel?: boolean;
        maxWorkers?: number;
    };
    advanced?: {
        debug?: boolean;
        verbose?: boolean;
        strict?: boolean;
    };
}
/**
 * 預設設定
 */
export declare const defaultConfig: DevAdvisorConfig;
/**
 * 載入設定檔
 */
export declare function loadConfig(projectPath: string): Promise<DevAdvisorConfig>;
/**
 * 驗證設定
 */
export declare function validateConfig(config: unknown): config is DevAdvisorConfig;
/**
 * 生成範例設定檔
 */
export declare function generateExampleConfig(): string;
//# sourceMappingURL=index.d.ts.map