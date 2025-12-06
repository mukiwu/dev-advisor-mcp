/**
 * 設定檔載入和管理
 * 支援 .devadvisorrc.json, .devadvisorrc, devadvisor.config.js 設定檔
 */
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
/**
 * 預設設定
 */
export const defaultConfig = {
    include: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'],
    exclude: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '.git/**'],
    rules: {
        builtin: {}
    },
    report: {
        format: 'markdown',
        includePassedFiles: false,
        maxSuggestionsPerFile: 10
    },
    performance: {
        useCache: true,
        cacheDir: '.devadvisor-cache',
        maxCacheAge: 24 * 60 * 60 * 1000, // 24 hours
        parallel: true,
        maxWorkers: 4
    },
    advanced: {
        debug: false,
        verbose: false,
        strict: false
    }
};
/**
 * 支援的設定檔名稱
 */
const CONFIG_FILENAMES = [
    '.devadvisorrc.json',
    '.devadvisorrc',
    'devadvisor.config.json',
    '.devadvisor.json'
];
/**
 * 載入設定檔
 */
export async function loadConfig(projectPath) {
    const resolvedPath = resolve(projectPath);
    // 嘗試載入各種設定檔
    for (const filename of CONFIG_FILENAMES) {
        const configPath = join(resolvedPath, filename);
        if (existsSync(configPath)) {
            try {
                const content = readFileSync(configPath, 'utf-8');
                const userConfig = JSON.parse(content);
                // 處理 extends
                let baseConfig = { ...defaultConfig };
                if (userConfig.extends) {
                    baseConfig = await resolveExtends(userConfig.extends, resolvedPath, baseConfig);
                }
                // 合併設定
                return mergeConfig(baseConfig, userConfig);
            }
            catch (error) {
                console.error(`載入設定檔失敗 (${configPath}):`, error);
                // 繼續嘗試其他設定檔
            }
        }
    }
    // 沒有找到設定檔，使用預設設定
    return { ...defaultConfig };
}
/**
 * 解析 extends 設定
 */
async function resolveExtends(extends_, basePath, currentConfig) {
    const extendsList = Array.isArray(extends_) ? extends_ : [extends_];
    let config = { ...currentConfig };
    for (const extend of extendsList) {
        // 內建預設設定
        if (extend === 'recommended') {
            config = mergeConfig(config, getRecommendedConfig());
            continue;
        }
        if (extend === 'strict') {
            config = mergeConfig(config, getStrictConfig());
            continue;
        }
        // 外部設定檔
        const extendPath = resolve(basePath, extend);
        if (existsSync(extendPath)) {
            try {
                const content = readFileSync(extendPath, 'utf-8');
                const extendConfig = JSON.parse(content);
                config = mergeConfig(config, extendConfig);
            }
            catch (error) {
                console.error(`載入擴展設定失敗 (${extendPath}):`, error);
            }
        }
    }
    return config;
}
/**
 * 合併設定
 */
function mergeConfig(base, override) {
    return {
        ...base,
        ...override,
        include: override.include || base.include,
        exclude: override.exclude || base.exclude,
        rules: {
            ...base.rules,
            ...override.rules,
            builtin: {
                ...base.rules?.builtin,
                ...override.rules?.builtin
            },
            customLibraries: {
                ...base.rules?.customLibraries,
                ...override.rules?.customLibraries
            },
            customApis: {
                ...base.rules?.customApis,
                ...override.rules?.customApis
            }
        },
        report: {
            ...base.report,
            ...override.report
        },
        performance: {
            ...base.performance,
            ...override.performance
        },
        advanced: {
            ...base.advanced,
            ...override.advanced
        }
    };
}
/**
 * 推薦設定
 */
function getRecommendedConfig() {
    return {
        rules: {
            builtin: {
                // 停用一些過於嚴格的規則
                'document.getElementById': { severity: 'off' },
                'setTimeout': { severity: 'low' }
            }
        },
        report: {
            maxSuggestionsPerFile: 5
        }
    };
}
/**
 * 嚴格設定
 */
function getStrictConfig() {
    return {
        rules: {
            builtin: {
                // 所有規則都啟用為高嚴重性
                'eval': { severity: 'high' },
                'document.write': { severity: 'high' },
                'innerHTML': { severity: 'high' },
                'with': { severity: 'high' }
            }
        },
        advanced: {
            strict: true
        }
    };
}
/**
 * 驗證設定
 */
export function validateConfig(config) {
    if (!config || typeof config !== 'object') {
        return false;
    }
    const c = config;
    // 驗證 include/exclude
    if (c.include !== undefined && !Array.isArray(c.include)) {
        return false;
    }
    if (c.exclude !== undefined && !Array.isArray(c.exclude)) {
        return false;
    }
    // 驗證 report.format
    if (c.report && typeof c.report === 'object') {
        const report = c.report;
        const validFormats = ['markdown', 'json', 'html', 'text'];
        if (report.format && !validFormats.includes(report.format)) {
            return false;
        }
    }
    return true;
}
/**
 * 生成範例設定檔
 */
export function generateExampleConfig() {
    const example = {
        extends: 'recommended',
        include: ['src/**/*.{js,ts,jsx,tsx}'],
        exclude: ['node_modules/**', 'dist/**', '**/*.test.ts'],
        rules: {
            builtin: {
                'jquery': { enabled: true, severity: 'high' },
                'moment': { enabled: true, severity: 'high' },
                'lodash': { enabled: true, severity: 'medium' },
                'var': { enabled: true, severity: 'low' }
            },
            customLibraries: {
                'my-old-lib': {
                    name: 'my-old-lib',
                    modernAlternative: 'my-new-lib',
                    reason: '公司內部函式庫升級'
                }
            }
        },
        report: {
            format: 'markdown',
            maxSuggestionsPerFile: 10
        },
        performance: {
            useCache: true,
            parallel: true
        }
    };
    return JSON.stringify(example, null, 2);
}
//# sourceMappingURL=index.js.map