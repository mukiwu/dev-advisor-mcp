#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { ModernizationAnalyzer } from './analyzers/modernization.js';
import { CompatibilityAnalyzer, formatCompatibilityReport } from './analyzers/compatibility.js';
import { CodeParser } from './parsers/index.js';
import { ReportFormatter } from './utils/report-formatter.js';
import { ModernizationRules } from './data/modernization-rules.js';
import { MDNService } from './services/mdn-service.js';
import { CanIUseService } from './services/caniuse-service.js';
import { BaselineService } from './services/baseline-service.js';
import { ApiRecommendationKnowledge } from './data/api-recommendations.js';
/**
 * 驗證錯誤類別
 */
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
/**
 * 開發決策顧問 MCP Server
 * 提供程式碼現代化、API組合推薦、相容性分析功能
 */
class DevAdvisorServer {
    server;
    modernizationAnalyzer;
    compatibilityAnalyzer;
    codeParser;
    reportFormatter;
    rules;
    mdnService;
    canIUseService;
    baselineService;
    apiKnowledge;
    constructor() {
        this.server = new Server({
            name: 'dev-advisor',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
                resources: {},
                prompts: {},
            },
        });
        this.codeParser = new CodeParser();
        this.canIUseService = new CanIUseService();
        this.baselineService = new BaselineService();
        this.modernizationAnalyzer = new ModernizationAnalyzer(this.codeParser);
        this.compatibilityAnalyzer = new CompatibilityAnalyzer(this.codeParser, this.canIUseService);
        this.reportFormatter = new ReportFormatter();
        this.rules = new ModernizationRules();
        this.mdnService = new MDNService();
        this.apiKnowledge = new ApiRecommendationKnowledge();
        this.setupHandlers();
        this.setupResourceHandlers();
        this.setupPromptHandlers();
    }
    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'analyze_modernization',
                        description: '分析 JavaScript/TypeScript 程式碼現代化機會，找出可被瀏覽器原生 Web API 替代的第三方函式庫，減少 npm bundle 大小，包括 jQuery、Moment.js、Lodash、XMLHttpRequest 等過時模式的現代化建議',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectPath: {
                                    type: 'string',
                                    description: '專案目錄路徑',
                                },
                                includePatterns: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: '要掃描的檔案模式，支援 glob 語法，如 ["src/**/*.js", "src/**/*.ts"] 掃描 src 目錄下的 JavaScript/TypeScript 檔案',
                                    default: ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx']
                                },
                                excludePatterns: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: '要排除的檔案模式 (預設: ["node_modules/**", "dist/**", "build/**"])',
                                    default: ['node_modules/**', 'dist/**', 'build/**']
                                },
                                reportFormat: {
                                    type: 'string',
                                    description: '報告格式',
                                    enum: ['markdown', 'json', 'html', 'text'],
                                    default: 'markdown'
                                }
                            },
                            required: ['projectPath'],
                        },
                    },
                    {
                        name: 'recommend_api_combination',
                        description: '根據自然語言描述的需求，推薦最佳的 API 技術組合',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                requirement: {
                                    type: 'string',
                                    description: '功能需求描述 (例如：背景擷取影片畫面並分析)',
                                },
                                targetBrowsers: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    description: '目標瀏覽器支援 (預設: 現代瀏覽器)',
                                    default: ['chrome>=90', 'firefox>=88', 'safari>=14', 'edge>=90']
                                },
                                performanceRequirements: {
                                    type: 'string',
                                    description: '效能需求 (low/medium/high)',
                                    enum: ['low', 'medium', 'high'],
                                    default: 'medium'
                                }
                            },
                            required: ['requirement'],
                        },
                    },
                    {
                        name: 'analyze_compatibility',
                        description: '分析專案的 API 相容性風險，推薦 polyfill 方案',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectPath: {
                                    type: 'string',
                                    description: '專案目錄路徑',
                                },
                                browserslistConfig: {
                                    type: 'string',
                                    description: 'browserslist 配置字串或檔案路徑',
                                },
                                reportFormat: {
                                    type: 'string',
                                    description: '報告格式',
                                    enum: ['json', 'markdown', 'html'],
                                    default: 'markdown'
                                }
                            },
                            required: ['projectPath'],
                        },
                    },
                    {
                        name: 'search_mdn',
                        description: '搜尋 MDN Web Docs 文件，取得最新的 API 資訊、用法說明、棄用狀態和瀏覽器相容性',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: '搜尋關鍵字，如 "fetch", "Promise", "Array.prototype.includes"',
                                },
                                limit: {
                                    type: 'number',
                                    description: '返回結果數量 (預設: 5)',
                                    default: 5
                                },
                                locale: {
                                    type: 'string',
                                    description: '語言 (預設: en-US，可用: zh-TW, zh-CN)',
                                    default: 'en-US'
                                }
                            },
                            required: ['query'],
                        },
                    },
                    {
                        name: 'check_browser_support',
                        description: '使用 Can I Use 資料庫檢查 Web API 的瀏覽器相容性，取得支援版本和 polyfill 建議',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                feature: {
                                    type: 'string',
                                    description: 'Web API 功能名稱，如 "fetch", "flexbox", "css-grid", "webgl"',
                                },
                                targetBrowsers: {
                                    type: 'object',
                                    description: '目標瀏覽器版本 (預設: { chrome: "90", firefox: "88", safari: "14", edge: "90" })',
                                    default: { chrome: '90', firefox: '88', safari: '14', edge: '90' }
                                }
                            },
                            required: ['feature'],
                        },
                    },
                    {
                        name: 'list_api_categories',
                        description: '列出所有可用的 Web API 類別，從 Can I Use 資料庫中取得完整的類別列表',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                            required: [],
                        },
                    },
                ],
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            switch (request.params.name) {
                case 'analyze_modernization':
                    return await this.handleModernizationAnalysis(request.params.arguments);
                case 'recommend_api_combination':
                    return await this.handleApiRecommendation(request.params.arguments);
                case 'analyze_compatibility':
                    return await this.handleCompatibilityAnalysis(request.params.arguments);
                case 'search_mdn':
                    return await this.handleMDNSearch(request.params.arguments);
                case 'check_compatibility':
                    return await this.handleCompatibilityCheck(request.params.arguments);
                case 'list_api_categories':
                    return await this.handleListApiCategories(request.params.arguments);
                default:
                    throw new Error(`Unknown tool: ${request.params.name}`);
            }
        });
    }
    /**
     * 驗證現代化分析參數
     */
    validateModernizationArgs(args) {
        if (!args || typeof args !== 'object') {
            throw new ValidationError('參數格式錯誤，請提供有效的物件參數');
        }
        const { projectPath, includePatterns, excludePatterns, reportFormat } = args;
        // 驗證必填參數 projectPath
        if (typeof projectPath !== 'string' || !projectPath.trim()) {
            throw new ValidationError('projectPath 為必填欄位，請提供專案目錄路徑');
        }
        // 解析並驗證路徑
        const resolvedPath = resolve(projectPath);
        if (!existsSync(resolvedPath)) {
            throw new ValidationError(`專案目錄不存在: ${resolvedPath}`);
        }
        // 驗證 includePatterns
        if (includePatterns !== undefined) {
            if (!Array.isArray(includePatterns) || !includePatterns.every(p => typeof p === 'string')) {
                throw new ValidationError('includePatterns 必須是字串陣列');
            }
        }
        // 驗證 excludePatterns
        if (excludePatterns !== undefined) {
            if (!Array.isArray(excludePatterns) || !excludePatterns.every(p => typeof p === 'string')) {
                throw new ValidationError('excludePatterns 必須是字串陣列');
            }
        }
        // 驗證 reportFormat
        const validFormats = ['markdown', 'json', 'html', 'text'];
        if (reportFormat !== undefined && !validFormats.includes(reportFormat)) {
            throw new ValidationError(`reportFormat 必須是以下其中之一: ${validFormats.join(', ')}`);
        }
        return {
            projectPath: resolvedPath,
            includePatterns: includePatterns,
            excludePatterns: excludePatterns,
            reportFormat: reportFormat
        };
    }
    async handleModernizationAnalysis(args) {
        try {
            // 驗證輸入參數
            const validatedArgs = this.validateModernizationArgs(args);
            const { projectPath, includePatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'], excludePatterns = ['node_modules/**', 'dist/**', 'build/**'], reportFormat = 'markdown' } = validatedArgs;
            // 步驟 1: 先取得所有可用的 API 類別
            let allCategories = [];
            let apiCategoryMap = new Map(); // API 名稱 -> 類別列表
            try {
                allCategories = await this.canIUseService.getAllCategories();
                // 步驟 2: 分析專案中的現代化 API，找出它們的類別
                const analysis = await this.modernizationAnalyzer.analyze(projectPath, includePatterns, excludePatterns);
                // 收集所有提到的現代 API
                const modernApis = new Set();
                for (const file of analysis.fileAnalysis) {
                    for (const api of file.modernizableApis) {
                        modernApis.add(api.modernApi);
                    }
                }
                // 為每個現代 API 找出對應的類別
                for (const apiName of modernApis) {
                    const categories = [];
                    // 從知識庫中查找 API
                    const api = this.apiKnowledge.getApi(apiName);
                    if (api) {
                        categories.push(api.category);
                    }
                    else {
                        // 如果知識庫中沒有，嘗試從 Can I Use 資料庫查找
                        try {
                            // 嘗試搜尋 feature ID
                            const featureIds = await this.canIUseService.searchFeature(apiName);
                            if (featureIds.length > 0) {
                                const featureSupport = await this.canIUseService.getFeatureSupport(featureIds[0]);
                                if (featureSupport && featureSupport.categories) {
                                    categories.push(...featureSupport.categories);
                                }
                            }
                        }
                        catch (error) {
                            // 忽略錯誤，繼續處理下一個 API
                        }
                    }
                    if (categories.length > 0) {
                        apiCategoryMap.set(apiName, categories);
                    }
                }
                // 將類別資訊添加到分析結果中
                const enhancedAnalysis = {
                    ...analysis,
                    categoryInfo: {
                        totalCategories: allCategories.length,
                        apiCategories: Object.fromEntries(apiCategoryMap),
                        allCategories: allCategories.map(cat => ({
                            name: cat.name,
                            count: cat.count,
                            description: cat.description
                        }))
                    }
                };
                return {
                    content: [
                        {
                            type: 'text',
                            text: this.formatModernizationReport(enhancedAnalysis, reportFormat),
                        },
                    ],
                };
            }
            catch (categoryError) {
                // 如果取得類別失敗，仍然返回分析結果（不包含類別資訊）
                console.warn('無法取得類別資訊，將返回不含類別的分析結果:', categoryError);
                const analysis = await this.modernizationAnalyzer.analyze(projectPath, includePatterns, excludePatterns);
                return {
                    content: [
                        {
                            type: 'text',
                            text: this.formatModernizationReport(analysis, reportFormat),
                        },
                    ],
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof ValidationError
                ? `參數驗證失敗: ${error.message}`
                : `分析失敗: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [
                    {
                        type: 'text',
                        text: errorMessage,
                    },
                ],
                isError: true,
            };
        }
    }
    /**
     * 驗證 API 推薦參數
     */
    validateApiRecommendationArgs(args) {
        if (!args || typeof args !== 'object') {
            throw new ValidationError('參數格式錯誤，請提供有效的物件參數');
        }
        const { requirement, targetBrowsers, performanceRequirements } = args;
        // 驗證必填參數 requirement
        if (typeof requirement !== 'string' || !requirement.trim()) {
            throw new ValidationError('requirement 為必填欄位，請描述您的功能需求');
        }
        // 驗證 targetBrowsers
        if (targetBrowsers !== undefined) {
            if (!Array.isArray(targetBrowsers) || !targetBrowsers.every(b => typeof b === 'string')) {
                throw new ValidationError('targetBrowsers 必須是字串陣列');
            }
        }
        // 驗證 performanceRequirements
        const validPerf = ['low', 'medium', 'high'];
        if (performanceRequirements !== undefined && !validPerf.includes(performanceRequirements)) {
            throw new ValidationError(`performanceRequirements 必須是以下其中之一: ${validPerf.join(', ')}`);
        }
        return {
            requirement: requirement.trim(),
            targetBrowsers: targetBrowsers,
            performanceRequirements: performanceRequirements
        };
    }
    /**
     * 驗證相容性分析參數
     */
    validateCompatibilityArgs(args) {
        if (!args || typeof args !== 'object') {
            throw new ValidationError('參數格式錯誤，請提供有效的物件參數');
        }
        const { projectPath, browserslistConfig, reportFormat } = args;
        // 驗證必填參數 projectPath
        if (typeof projectPath !== 'string' || !projectPath.trim()) {
            throw new ValidationError('projectPath 為必填欄位，請提供專案目錄路徑');
        }
        // 解析並驗證路徑
        const resolvedPath = resolve(projectPath);
        if (!existsSync(resolvedPath)) {
            throw new ValidationError(`專案目錄不存在: ${resolvedPath}`);
        }
        // 驗證 browserslistConfig
        if (browserslistConfig !== undefined && typeof browserslistConfig !== 'string') {
            throw new ValidationError('browserslistConfig 必須是字串');
        }
        // 驗證 reportFormat
        const validFormats = ['markdown', 'json', 'html', 'text'];
        if (reportFormat !== undefined && !validFormats.includes(reportFormat)) {
            throw new ValidationError(`reportFormat 必須是以下其中之一: ${validFormats.join(', ')}`);
        }
        return {
            projectPath: resolvedPath,
            browserslistConfig: browserslistConfig,
            reportFormat: reportFormat
        };
    }
    async handleApiRecommendation(args) {
        try {
            const validatedArgs = this.validateApiRecommendationArgs(args);
            const { requirement, targetBrowsers, performanceRequirements } = validatedArgs;
            // 步驟 1: 先取得所有可用的 API 類別
            let allCategories = [];
            let matchedCategories = [];
            try {
                allCategories = await this.canIUseService.getAllCategories();
                // 根據需求描述匹配相關的類別
                const lowerReq = requirement.toLowerCase();
                matchedCategories = allCategories
                    .filter(cat => {
                    const catName = cat.name.toLowerCase();
                    const catDesc = (cat.description || '').toLowerCase();
                    return lowerReq.includes(catName) ||
                        catName.includes(lowerReq) ||
                        catDesc.includes(lowerReq) ||
                        this.matchCategoryKeywords(lowerReq, cat.name);
                })
                    .map(cat => cat.name);
            }
            catch (error) {
                console.warn('無法取得類別列表，將使用預定義知識庫:', error);
            }
            // 步驟 2: 從匹配的類別中找出相關的 API
            const apisFromCategories = new Set();
            for (const category of matchedCategories) {
                try {
                    const featureIds = await this.canIUseService.getFeaturesByCategory(category);
                    // 將 feature ID 轉換為 API 名稱（如果知識庫中有對應的）
                    for (const featureId of featureIds.slice(0, 10)) { // 限制每個類別最多 10 個
                        const api = this.apiKnowledge.getApiByCaniuseId(featureId);
                        if (api) {
                            apisFromCategories.add(api.name);
                        }
                    }
                }
                catch (error) {
                    console.warn(`無法取得類別 ${category} 的 API:`, error);
                }
            }
            // 步驟 3: 從知識庫中推薦 API（原有邏輯）
            const recommendedApis = this.apiKnowledge.recommendApis(requirement, performanceRequirements);
            // 步驟 4: 合併結果，優先使用知識庫的推薦，補充類別匹配的結果
            const apiMap = new Map();
            // 先加入知識庫推薦的 API
            for (const api of recommendedApis) {
                apiMap.set(api.name, api);
            }
            // 補充從類別匹配找到的 API（如果不在知識庫推薦中）
            for (const apiName of apisFromCategories) {
                const api = this.apiKnowledge.getApi(apiName);
                if (api && !apiMap.has(apiName)) {
                    // 檢查是否符合需求描述
                    const lowerReq = requirement.toLowerCase();
                    if (api.description.toLowerCase().includes(lowerReq) ||
                        api.useCases.some(uc => lowerReq.includes(uc.toLowerCase()))) {
                        apiMap.set(apiName, api);
                    }
                }
            }
            const finalRecommendedApis = Array.from(apiMap.values());
            if (finalRecommendedApis.length === 0) {
                let suggestionText = `# 🔍 API 推薦結果\n\n找不到與「${requirement}」相關的 API 推薦。\n\n`;
                if (matchedCategories.length > 0) {
                    suggestionText += `**相關類別**: ${matchedCategories.join(', ')}\n\n`;
                }
                suggestionText += `**建議：**\n`;
                suggestionText += `- 嘗試使用更具體的描述\n`;
                suggestionText += `- 使用英文關鍵字（如 fetch, animation, storage）\n`;
                suggestionText += `- 描述具體的使用場景\n`;
                suggestionText += `- 使用 \`list_api_categories\` 工具查看所有可用的 API 類別\n`;
                return {
                    content: [{
                            type: 'text',
                            text: suggestionText
                        }]
                };
            }
            // 解析目標瀏覽器版本
            const browserVersions = this.parseBrowserVersions(targetBrowsers);
            // 為每個推薦的 API 查詢相容性
            const apiWithCompatibility = await this.fetchApiCompatibility(finalRecommendedApis, browserVersions);
            // 生成報告（包含類別資訊）
            const report = this.generateApiRecommendationReport(requirement, apiWithCompatibility, browserVersions, performanceRequirements, matchedCategories, allCategories.length);
            return {
                content: [{
                        type: 'text',
                        text: report
                    }]
            };
        }
        catch (error) {
            const errorMessage = error instanceof ValidationError
                ? `參數驗證失敗: ${error.message}`
                : `推薦失敗: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{ type: 'text', text: errorMessage }],
                isError: true,
            };
        }
    }
    /**
     * 匹配類別關鍵字
     */
    matchCategoryKeywords(requirement, categoryName) {
        const categoryKeywords = {
            'CSS': ['css', '樣式', 'style', 'layout', '佈局', 'grid', 'flex'],
            'JavaScript': ['javascript', 'js', 'api', 'function', '函式'],
            'HTML': ['html', 'element', '元素', 'tag', '標籤'],
            'Media': ['media', 'video', 'audio', '影片', '音訊', 'stream', 'streaming'],
            'Storage': ['storage', 'store', '儲存', 'cache', '快取', 'database', '資料庫'],
            'Network': ['network', 'http', 'fetch', 'request', '請求', 'ajax'],
            'Security': ['security', 'crypto', '加密', 'secure', '安全'],
            'Performance': ['performance', '效能', 'speed', 'optimize', '優化'],
            'Graphics': ['graphics', 'canvas', 'webgl', 'draw', '繪圖', '圖形'],
            'DOM': ['dom', 'element', '元素', 'query', 'selector', '選擇器'],
            'Events': ['event', '事件', 'listener', '監聽'],
            'Forms': ['form', '表單', 'input', 'validate', '驗證']
        };
        const keywords = categoryKeywords[categoryName] || [];
        return keywords.some(keyword => requirement.includes(keyword));
    }
    /**
     * 解析目標瀏覽器版本
     */
    parseBrowserVersions(targetBrowsers) {
        const defaultVersions = {
            chrome: '90',
            firefox: '88',
            safari: '14',
            edge: '90'
        };
        if (!targetBrowsers || targetBrowsers.length === 0) {
            return defaultVersions;
        }
        const versions = {};
        for (const browser of targetBrowsers) {
            // 解析格式如 "chrome>=90" 或 "firefox>=88"
            const match = browser.match(/^(\w+)(?:>=?|>)(\d+)$/);
            if (match) {
                versions[match[1].toLowerCase()] = match[2];
            }
        }
        return Object.keys(versions).length > 0 ? versions : defaultVersions;
    }
    /**
     * 為推薦的 API 查詢相容性
     */
    async fetchApiCompatibility(apis, targetBrowsers) {
        const results = [];
        for (const api of apis) {
            let compatibility = null;
            let baseline = null;
            try {
                // 使用 Can I Use 查詢相容性
                const report = await this.canIUseService.checkCompatibility(api.caniuseId, targetBrowsers);
                compatibility = report;
            }
            catch (error) {
                console.warn(`無法取得 ${api.name} 的相容性資料:`, error);
            }
            // 查詢 Baseline 狀態
            try {
                const baselineMatches = await this.baselineService.searchFeature(api.name);
                if (baselineMatches.length > 0) {
                    const baselineFeature = await this.baselineService.getFeature(baselineMatches[0].id) || baselineMatches[0];
                    if (baselineFeature.baseline) {
                        baseline = {
                            status: baselineFeature.baseline.status,
                            label: this.baselineService.getBaselineLabel(baselineFeature.baseline.status),
                            description: this.baselineService.getBaselineDescription(baselineFeature.baseline.status),
                            icon: this.baselineService.getBaselineIcon(baselineFeature.baseline.status),
                            safeToUse: this.baselineService.isSafeToUse(baselineFeature),
                            recommendation: this.baselineService.getRecommendation(baselineFeature)
                        };
                    }
                }
            }
            catch (error) {
                console.warn(`無法取得 ${api.name} 的 Baseline 狀態:`, error);
            }
            results.push({ api, compatibility, baseline });
        }
        return results;
    }
    /**
     * 生成 API 推薦報告
     */
    generateApiRecommendationReport(requirement, apiWithCompatibility, targetBrowsers, performanceLevel, matchedCategories, totalCategoriesCount) {
        let report = `# 🎯 API 組合推薦\n\n`;
        report += `**需求**: ${requirement}\n`;
        report += `**目標瀏覽器**: ${Object.entries(targetBrowsers).map(([b, v]) => `${b} >= ${v}`).join(', ')}\n`;
        if (performanceLevel) {
            report += `**效能需求**: ${performanceLevel}\n`;
        }
        // 顯示類別分析資訊
        if (matchedCategories && matchedCategories.length > 0) {
            report += `**相關類別**: ${matchedCategories.join(', ')}\n`;
        }
        if (totalCategoriesCount) {
            report += `**可用類別總數**: ${totalCategoriesCount} 個（從 Can I Use 資料庫分析）\n`;
        }
        report += `\n---\n\n`;
        // 按類別分組
        const byCategory = new Map();
        for (const item of apiWithCompatibility) {
            const category = item.api.category;
            if (!byCategory.has(category)) {
                byCategory.set(category, []);
            }
            byCategory.get(category).push(item);
        }
        report += `## 📋 推薦 API 列表\n\n`;
        report += `共找到 **${apiWithCompatibility.length}** 個相關 API：\n\n`;
        for (const [category, items] of byCategory) {
            report += `### 📁 ${category}\n\n`;
            for (const { api, compatibility, baseline } of items) {
                // API 標題和支援狀態
                const supportIcon = compatibility
                    ? (compatibility.notSupported.length === 0 ? '✅' :
                        compatibility.supported.length > 0 ? '⚠️' : '❌')
                    : '❓';
                // 如果有 Baseline 狀態，優先使用 Baseline 圖示
                const displayIcon = baseline ? baseline.icon : supportIcon;
                report += `#### ${displayIcon} ${api.name}\n\n`;
                report += `${api.description}\n\n`;
                // Baseline 狀態
                if (baseline) {
                    report += `**📊 Baseline 狀態**: ${baseline.icon} **${baseline.label}**\n\n`;
                    report += `${baseline.description}\n\n`;
                    if (baseline.safeToUse) {
                        report += `✅ **可安全使用** - 此 API 在所有核心瀏覽器中都支援\n\n`;
                    }
                    else {
                        report += `⚠️ **需謹慎使用** - 建議檢查目標瀏覽器支援情況\n\n`;
                    }
                }
                // 用途
                report += `**適用場景**: ${api.useCases.join('、')}\n\n`;
                // 程式碼範例
                report += `**程式碼範例**:\n\`\`\`javascript\n${api.codeExample}\n\`\`\`\n\n`;
                // 可取代的函式庫
                if (api.replacesLibraries && api.replacesLibraries.length > 0) {
                    report += `**可取代函式庫**: ${api.replacesLibraries.map(l => `\`${l}\``).join(', ')}\n\n`;
                }
                // 相容性資訊
                if (compatibility) {
                    report += `**🌐 瀏覽器相容性**:\n\n`;
                    report += `- 全球支援率: **${compatibility.globalSupport.toFixed(1)}%**\n`;
                    if (compatibility.supported.length > 0) {
                        report += `- ✅ 支援: ${compatibility.supported.join(', ')}\n`;
                    }
                    if (compatibility.partialSupport.length > 0) {
                        report += `- ⚠️ 部分支援: ${compatibility.partialSupport.join(', ')}\n`;
                    }
                    if (compatibility.notSupported.length > 0) {
                        report += `- ❌ 不支援: ${compatibility.notSupported.join(', ')}\n`;
                    }
                    report += `\n${compatibility.recommendation}\n\n`;
                    // Polyfill 資訊
                    if (compatibility.polyfillAvailable) {
                        report += `**🔧 Polyfill 可用**`;
                        if (compatibility.polyfillUrl) {
                            report += `:\n\`\`\`html\n<script src="${compatibility.polyfillUrl}"></script>\n\`\`\``;
                        }
                        report += '\n\n';
                    }
                }
                else {
                    report += `**🌐 瀏覽器相容性**: 無法取得相容性資料，請參考 [Can I Use](https://caniuse.com/?search=${encodeURIComponent(api.caniuseId)})\n\n`;
                }
                // 相關 API
                if (api.relatedApis && api.relatedApis.length > 0) {
                    report += `**相關 API**: ${api.relatedApis.join(', ')}\n\n`;
                }
                report += `---\n\n`;
            }
        }
        // 總結建議
        report += `## 💡 實作建議\n\n`;
        // 添加類別分析說明
        if (matchedCategories && matchedCategories.length > 0) {
            report += `### 📊 類別分析\n\n`;
            report += `本推薦基於以下分析流程：\n\n`;
            report += `1. ✅ 從 Can I Use 資料庫取得所有 ${totalCategoriesCount || '可用'} 個 API 類別\n`;
            report += `2. ✅ 根據需求描述匹配相關類別：**${matchedCategories.join('**, **')}**\n`;
            report += `3. ✅ 從匹配類別中找出相關 API\n`;
            report += `4. ✅ 結合預定義知識庫的推薦結果\n`;
            report += `5. ✅ 查詢瀏覽器相容性並生成最終推薦\n\n`;
            report += `---\n\n`;
        }
        const fullySupported = apiWithCompatibility.filter(item => item.compatibility && item.compatibility.notSupported.length === 0);
        const needsPolyfill = apiWithCompatibility.filter(item => item.compatibility && item.compatibility.notSupported.length > 0 && item.compatibility.polyfillAvailable);
        const notSupported = apiWithCompatibility.filter(item => item.compatibility && item.compatibility.notSupported.length > 0 && !item.compatibility.polyfillAvailable);
        if (fullySupported.length > 0) {
            report += `### ✅ 可直接使用 (${fullySupported.length})\n`;
            report += `以下 API 在所有目標瀏覽器中都完全支援：\n`;
            for (const { api } of fullySupported) {
                report += `- ${api.name}\n`;
            }
            report += '\n';
        }
        if (needsPolyfill.length > 0) {
            report += `### ⚠️ 需要 Polyfill (${needsPolyfill.length})\n`;
            report += `以下 API 在部分目標瀏覽器中需要 polyfill：\n`;
            for (const { api, compatibility } of needsPolyfill) {
                report += `- ${api.name}`;
                if (compatibility?.polyfillUrl) {
                    report += ` - [Polyfill](${compatibility.polyfillUrl})`;
                }
                report += '\n';
            }
            report += '\n';
        }
        if (notSupported.length > 0) {
            report += `### ❌ 需要替代方案 (${notSupported.length})\n`;
            report += `以下 API 在部分目標瀏覽器中不支援且無 polyfill：\n`;
            for (const { api } of notSupported) {
                report += `- ${api.name} - 建議尋找替代方案或調整目標瀏覽器\n`;
            }
            report += '\n';
        }
        return report;
    }
    async handleCompatibilityAnalysis(args) {
        try {
            const validatedArgs = this.validateCompatibilityArgs(args);
            const { projectPath, browserslistConfig, reportFormat = 'markdown' } = validatedArgs;
            // 預設的檔案模式
            const includePatterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx'];
            const excludePatterns = ['node_modules/**', 'dist/**', 'build/**'];
            // 執行相容性分析
            const analysis = await this.compatibilityAnalyzer.analyze(projectPath, includePatterns, excludePatterns, browserslistConfig);
            // 格式化報告
            const report = formatCompatibilityReport(analysis, reportFormat);
            return {
                content: [
                    {
                        type: 'text',
                        text: report,
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof ValidationError
                ? `參數驗證失敗: ${error.message}`
                : `分析失敗: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{ type: 'text', text: errorMessage }],
                isError: true,
            };
        }
    }
    /**
     * 處理 MDN 搜尋請求
     */
    async handleMDNSearch(args) {
        try {
            if (!args || typeof args !== 'object') {
                throw new ValidationError('參數格式錯誤');
            }
            const { query, limit = 5, locale = 'en-US' } = args;
            if (typeof query !== 'string' || !query.trim()) {
                throw new ValidationError('query 為必填欄位，請提供搜尋關鍵字');
            }
            // 建立服務實例（支援不同語言）
            const mdnService = new MDNService(locale);
            // 搜尋 MDN
            const searchResults = await mdnService.search(query, limit);
            if (searchResults.length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: `🔍 MDN 搜尋結果\n\n找不到與 "${query}" 相關的文件。\n\n建議：\n- 嘗試使用英文關鍵字\n- 使用更具體的 API 名稱（如 "Array.prototype.map"）`
                        }]
                };
            }
            // 格式化結果
            let report = `# 🔍 MDN 搜尋結果: "${query}"\n\n`;
            report += `找到 ${searchResults.length} 個相關文件：\n\n`;
            for (const result of searchResults) {
                report += `## ${result.title}\n`;
                report += `📖 ${result.summary}\n`;
                report += `🔗 ${result.url}\n\n`;
            }
            // 嘗試取得第一個結果的詳細資訊
            if (searchResults.length > 0) {
                const detailed = await mdnService.getAPIInfo(searchResults[0].slug);
                if (detailed) {
                    report += `---\n\n## 📋 詳細資訊: ${detailed.title}\n\n`;
                    if (detailed.deprecated) {
                        report += `⚠️ **此 API 已被棄用**\n\n`;
                    }
                    if (detailed.experimental) {
                        report += `🧪 **此 API 為實驗性功能**\n\n`;
                    }
                    if (detailed.summary) {
                        report += `### 說明\n${detailed.summary}\n\n`;
                    }
                    if (detailed.syntax) {
                        report += `### 語法\n\`\`\`javascript\n${detailed.syntax}\n\`\`\`\n\n`;
                    }
                    if (detailed.browserCompat) {
                        report += `### 瀏覽器相容性\n`;
                        const compat = detailed.browserCompat;
                        if (compat.chrome)
                            report += `- Chrome: ${compat.chrome}\n`;
                        if (compat.firefox)
                            report += `- Firefox: ${compat.firefox}\n`;
                        if (compat.safari)
                            report += `- Safari: ${compat.safari}\n`;
                        if (compat.edge)
                            report += `- Edge: ${compat.edge}\n`;
                        if (compat.nodejs)
                            report += `- Node.js: ${compat.nodejs}\n`;
                        report += '\n';
                    }
                    report += `🔗 完整文件: ${detailed.url}\n`;
                }
            }
            return {
                content: [{
                        type: 'text',
                        text: report
                    }]
            };
        }
        catch (error) {
            const errorMessage = error instanceof ValidationError
                ? `參數驗證失敗: ${error.message}`
                : `MDN 搜尋失敗: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{ type: 'text', text: errorMessage }],
                isError: true,
            };
        }
    }
    /**
     * 處理相容性檢查請求（整合 Can I Use 和 Baseline）
     */
    async handleCompatibilityCheck(args) {
        try {
            if (!args || typeof args !== 'object') {
                throw new ValidationError('參數格式錯誤');
            }
            const { feature, targetBrowsers = { chrome: '90', firefox: '88', safari: '14', edge: '90' } } = args;
            if (typeof feature !== 'string' || !feature.trim()) {
                throw new ValidationError('feature 為必填欄位，請提供要檢查的 Web API 功能名稱');
            }
            // 同時查詢 Can I Use 和 Baseline
            const [caniuseMatches, baselineMatches] = await Promise.all([
                this.canIUseService.searchFeature(feature),
                this.baselineService.searchFeature(feature)
            ]);
            // 如果兩個來源都找不到
            if (caniuseMatches.length === 0 && baselineMatches.length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: `🔍 相容性查詢結果\n\n找不到與 "${feature}" 相關的功能。\n\n建議：\n- 嘗試使用不同的關鍵字\n- 常見功能名稱：fetch, flexbox, css-grid, webgl, es6-module, async-functions`
                        }]
                };
            }
            let report = `# 🌐 Web API 相容性報告: ${feature}\n\n`;
            // ========== Can I Use 資料 ==========
            if (caniuseMatches.length > 0) {
                const featureSupport = await this.canIUseService.getFeatureSupport(caniuseMatches[0]);
                if (featureSupport) {
                    const compatReport = await this.canIUseService.checkCompatibility(caniuseMatches[0], targetBrowsers);
                    report += `## 📊 概覽\n\n`;
                    report += `- **功能**: ${featureSupport.title}\n`;
                    report += `- **全球支援率**: ${compatReport.globalSupport.toFixed(1)}%\n`;
                    report += `- **標準狀態**: ${this.getStatusText(featureSupport.status)}\n`;
                    if (featureSupport.description) {
                        report += `\n### 說明\n${featureSupport.description}\n`;
                    }
                    report += `\n## 🎯 目標瀏覽器相容性\n\n`;
                    report += `${compatReport.recommendation}\n\n`;
                    if (compatReport.supported.length > 0) {
                        report += `### ✅ 支援的瀏覽器\n`;
                        for (const browser of compatReport.supported) {
                            report += `- ${browser}\n`;
                        }
                        report += '\n';
                    }
                    if (compatReport.partialSupport.length > 0) {
                        report += `### ⚠️ 部分支援\n`;
                        for (const browser of compatReport.partialSupport) {
                            report += `- ${browser}\n`;
                        }
                        report += '\n';
                    }
                    if (compatReport.notSupported.length > 0) {
                        report += `### ❌ 不支援\n`;
                        for (const browser of compatReport.notSupported) {
                            report += `- ${browser}\n`;
                        }
                        report += '\n';
                    }
                    // Polyfill 資訊
                    if (compatReport.polyfillAvailable) {
                        report += `## 🔧 Polyfill\n\n`;
                        report += `此功能有 polyfill 可用。\n`;
                        if (compatReport.polyfillUrl) {
                            report += `\n\`\`\`html\n<script src="${compatReport.polyfillUrl}"></script>\n\`\`\`\n`;
                        }
                        report += '\n';
                    }
                    // 各瀏覽器詳細支援版本
                    report += `## 📱 各瀏覽器支援版本\n\n`;
                    const browsers = featureSupport.browsers;
                    const browserNames = {
                        chrome: 'Chrome',
                        firefox: 'Firefox',
                        safari: 'Safari',
                        edge: 'Edge',
                        ie: 'Internet Explorer',
                        opera: 'Opera',
                        ios_saf: 'iOS Safari',
                        android: 'Android Browser',
                        samsung: 'Samsung Internet'
                    };
                    for (const [key, name] of Object.entries(browserNames)) {
                        const support = browsers[key];
                        if (support) {
                            const icon = support.supported ? '✅' : (support.partialSupport ? '⚠️' : '❌');
                            const version = support.sinceVersion ? `v${support.sinceVersion}+` : (support.supported ? '支援' : '不支援');
                            report += `| ${icon} ${name} | ${version} |\n`;
                        }
                    }
                    report += '\n';
                }
            }
            // ========== Baseline 狀態 ==========
            report += `## 📊 Baseline 狀態\n\n`;
            if (baselineMatches.length > 0) {
                const baselineInfo = await this.baselineService.getFeature(baselineMatches[0].id) || baselineMatches[0];
                if (baselineInfo.baseline) {
                    report += this.baselineService.formatBaselineInfo(baselineInfo);
                    report += `\n${this.baselineService.getRecommendation(baselineInfo)}\n\n`;
                    // Baseline 的瀏覽器支援資訊
                    if (baselineInfo.compat) {
                        report += `### Baseline 瀏覽器支援\n\n`;
                        const compat = baselineInfo.compat;
                        if (compat.chrome) {
                            const since = compat.chrome.since || '未知';
                            const flags = compat.chrome.flags ? ' (需要啟用實驗性功能)' : '';
                            report += `- **Chrome**: ${since}${flags}\n`;
                        }
                        if (compat.firefox) {
                            const since = compat.firefox.since || '未知';
                            const flags = compat.firefox.flags ? ' (需要啟用實驗性功能)' : '';
                            report += `- **Firefox**: ${since}${flags}\n`;
                        }
                        if (compat.safari) {
                            const since = compat.safari.since || '未知';
                            const flags = compat.safari.flags ? ' (需要啟用實驗性功能)' : '';
                            report += `- **Safari**: ${since}${flags}\n`;
                        }
                        if (compat.edge) {
                            const since = compat.edge.since || '未知';
                            const flags = compat.edge.flags ? ' (需要啟用實驗性功能)' : '';
                            report += `- **Edge**: ${since}${flags}\n`;
                        }
                        report += '\n';
                    }
                }
                else {
                    report += `❓ 此功能尚未有 Baseline 狀態資訊\n\n`;
                }
            }
            else {
                report += `❓ 在 Baseline 資料庫中找不到此功能\n\n`;
                report += `建議查閱 [web.dev/baseline](https://web.dev/baseline) 確認。\n\n`;
            }
            // ========== 相關連結 ==========
            report += `## 🔗 相關連結\n\n`;
            if (caniuseMatches.length > 0) {
                report += `- [Can I Use](https://caniuse.com/${caniuseMatches[0]})\n`;
            }
            if (baselineMatches.length > 0 && baselineMatches[0].mdn?.url) {
                report += `- [MDN 文件](${baselineMatches[0].mdn.url})\n`;
            }
            report += `- [Baseline 狀態](https://web.dev/baseline)\n`;
            // 其他相關功能
            const allMatches = [...new Set([...caniuseMatches.slice(1, 4), ...baselineMatches.slice(1, 4).map(m => m.name)])];
            if (allMatches.length > 0) {
                report += `\n## 🔍 其他相關功能\n\n`;
                report += `您可能也在尋找：\n`;
                for (const match of allMatches.slice(0, 5)) {
                    report += `- \`${typeof match === 'string' ? match : match}\`\n`;
                }
            }
            return {
                content: [{
                        type: 'text',
                        text: report
                    }]
            };
        }
        catch (error) {
            const errorMessage = error instanceof ValidationError
                ? `參數驗證失敗: ${error.message}`
                : `相容性檢查失敗: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{ type: 'text', text: errorMessage }],
                isError: true,
            };
        }
    }
    /**
     * 處理列出所有 API 類別的請求
     */
    async handleListApiCategories(args) {
        try {
            const categories = await this.canIUseService.getAllCategories();
            if (categories.length === 0) {
                return {
                    content: [{
                            type: 'text',
                            text: '# 📋 API 類別列表\n\n無法載入類別資料，請稍後再試。'
                        }]
                };
            }
            // 生成報告
            let report = '# 📋 Web API 類別列表\n\n';
            report += `本列表包含從 Can I Use 資料庫中提取的所有 Web API 類別。\n\n`;
            report += `**總共 ${categories.length} 個類別**\n\n`;
            report += `---\n\n`;
            // 按類別分組顯示
            for (const category of categories) {
                report += `## ${category.name}\n\n`;
                report += `- **功能數量**: ${category.count}\n`;
                if (category.description) {
                    report += `- **說明**: ${category.description}\n`;
                }
                report += '\n';
            }
            // 添加使用建議
            report += `---\n\n`;
            report += `## 💡 使用建議\n\n`;
            report += `您可以使用以下方式查詢特定類別的 API：\n\n`;
            report += `1. 使用 \`recommend_api_combination\` 工具，描述您的需求\n`;
            report += `2. 使用 \`search_mdn\` 工具搜尋特定的 API\n`;
            report += `3. 使用 \`check_browser_support\` 工具檢查特定 API 的瀏覽器支援\n\n`;
            report += `**注意**: \`recommend_api_combination\` 工具目前使用預定義的 API 知識庫，`;
            report += `類別可能與此列表不完全一致。此列表反映 Can I Use 資料庫中的實際類別分類。\n`;
            return {
                content: [{
                        type: 'text',
                        text: report
                    }]
            };
        }
        catch (error) {
            const errorMessage = `取得 API 類別列表失敗: ${error instanceof Error ? error.message : String(error)}`;
            return {
                content: [{
                        type: 'text',
                        text: errorMessage
                    }],
                isError: true,
            };
        }
    }
    /**
     * 取得狀態文字
     */
    getStatusText(status) {
        const statusMap = {
            'rec': '✅ W3C 推薦標準',
            'pr': '📋 提議推薦標準',
            'cr': '🔍 候選推薦標準',
            'wd': '📝 工作草案',
            'ls': '📚 Living Standard',
            'other': '📌 其他'
        };
        return statusMap[status] || status;
    }
    formatModernizationReport(analysis, format = 'markdown') {
        return this.reportFormatter.formatModernizationReport(analysis, format);
    }
    /**
     * 設定 Resources 處理器
     */
    setupResourceHandlers() {
        // 列出可用的 Resources
        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: [
                    {
                        uri: 'devadvisor://rules/libraries',
                        name: '函式庫現代化規則',
                        description: '所有可替換的函式庫清單和對應的現代化建議',
                        mimeType: 'application/json'
                    },
                    {
                        uri: 'devadvisor://rules/apis',
                        name: 'API 現代化規則',
                        description: '所有可現代化的 API 清單和對應的建議',
                        mimeType: 'application/json'
                    },
                    {
                        uri: 'devadvisor://rules/all',
                        name: '所有現代化規則',
                        description: '完整的現代化規則資料庫',
                        mimeType: 'application/json'
                    },
                    {
                        uri: 'devadvisor://stats',
                        name: '規則統計資訊',
                        description: '規則資料庫的統計資訊',
                        mimeType: 'application/json'
                    }
                ]
            };
        });
        // 讀取特定 Resource
        this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
            const uri = request.params.uri;
            switch (uri) {
                case 'devadvisor://rules/libraries': {
                    const libraryRules = this.rules.getAllLibraryRules();
                    const rulesArray = Array.from(libraryRules.entries()).map(([key, rule]) => ({
                        id: key,
                        ...rule
                    }));
                    return {
                        contents: [{
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(rulesArray, null, 2)
                            }]
                    };
                }
                case 'devadvisor://rules/apis': {
                    const apiRules = this.rules.getAllApiRules();
                    const rulesArray = Array.from(apiRules.entries()).map(([key, rule]) => ({
                        id: key,
                        ...rule
                    }));
                    return {
                        contents: [{
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(rulesArray, null, 2)
                            }]
                    };
                }
                case 'devadvisor://rules/all': {
                    const libraryRules = this.rules.getAllLibraryRules();
                    const apiRules = this.rules.getAllApiRules();
                    const allRules = {
                        libraries: Array.from(libraryRules.entries()).map(([key, rule]) => ({ id: key, ...rule })),
                        apis: Array.from(apiRules.entries()).map(([key, rule]) => ({ id: key, ...rule }))
                    };
                    return {
                        contents: [{
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(allRules, null, 2)
                            }]
                    };
                }
                case 'devadvisor://stats': {
                    const stats = this.rules.getStatistics();
                    return {
                        contents: [{
                                uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(stats, null, 2)
                            }]
                    };
                }
                default:
                    throw new Error(`Unknown resource: ${uri}`);
            }
        });
    }
    /**
     * 設定 Prompts 處理器
     */
    setupPromptHandlers() {
        // 列出可用的 Prompts
        this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
            return {
                prompts: [
                    {
                        name: 'analyze-project',
                        description: '分析專案的程式碼現代化機會',
                        arguments: [
                            {
                                name: 'projectPath',
                                description: '專案目錄路徑',
                                required: true
                            },
                            {
                                name: 'focus',
                                description: '分析重點: bundle-size, performance, security, all',
                                required: false
                            }
                        ]
                    },
                    {
                        name: 'migrate-library',
                        description: '取得特定函式庫的遷移指南',
                        arguments: [
                            {
                                name: 'library',
                                description: '要遷移的函式庫名稱 (如: jquery, moment, lodash)',
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'modernize-pattern',
                        description: '取得特定程式碼模式的現代化建議',
                        arguments: [
                            {
                                name: 'pattern',
                                description: '程式碼模式 (如: callback, var, for-loop, iife)',
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'quick-wins',
                        description: '取得低風險、高效益的快速改善建議',
                        arguments: [
                            {
                                name: 'projectPath',
                                description: '專案目錄路徑',
                                required: true
                            }
                        ]
                    },
                    {
                        name: 'analyze-pr',
                        description: '分析 Git PR 的程式碼變更，整合規則式分析和 AI 分析，提供現代化建議',
                        arguments: [
                            {
                                name: 'projectPath',
                                description: '專案目錄路徑',
                                required: true
                            },
                            {
                                name: 'prDiff',
                                description: 'PR 的 diff 內容（可選，如果提供則會用於 AI 分析）',
                                required: false
                            },
                            {
                                name: 'changedFiles',
                                description: 'PR 變更的檔案列表（JSON 陣列，如 ["src/file1.js", "src/file2.ts"]）',
                                required: false
                            }
                        ]
                    }
                ]
            };
        });
        // 取得特定 Prompt
        this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'analyze-project': {
                    const projectPath = args?.projectPath || '.';
                    const focus = args?.focus || 'all';
                    let focusText = '';
                    switch (focus) {
                        case 'bundle-size':
                            focusText = '，特別關注可以減少 bundle 大小的函式庫替換';
                            break;
                        case 'performance':
                            focusText = '，特別關注效能優化機會';
                            break;
                        case 'security':
                            focusText = '，特別關注安全性相關的過時 API (如 eval, innerHTML)';
                            break;
                        default:
                            focusText = '';
                    }
                    return {
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: `請使用 analyze_modernization 工具分析 "${projectPath}" 專案的程式碼現代化機會${focusText}。

分析後請提供：
1. 執行摘要：發現了多少現代化機會
2. 優先處理清單：按照「低風險高效益」排序的建議
3. 具體的程式碼範例：展示如何將舊程式碼改為現代寫法
4. 風險評估：哪些變更需要特別注意
5. 實作建議：建議的實施順序和時程估算`
                                }
                            }
                        ]
                    };
                }
                case 'migrate-library': {
                    const library = args?.library || 'jquery';
                    const rule = this.rules.getLibraryRule(library.toLowerCase());
                    if (rule) {
                        return {
                            messages: [
                                {
                                    role: 'user',
                                    content: {
                                        type: 'text',
                                        text: `請提供 ${rule.name} 的完整遷移指南。

根據規則資料庫，${rule.name} 可以用 ${rule.modernAlternative} 替代。

原因：${rule.reason}

遷移範例：
${rule.migrationExample}

請提供：
1. 詳細的遷移步驟
2. 常見的使用案例和對應的現代寫法
3. 可能遇到的問題和解決方案
4. 測試建議確保遷移成功`
                                    }
                                }
                            ]
                        };
                    }
                    else {
                        return {
                            messages: [
                                {
                                    role: 'user',
                                    content: {
                                        type: 'text',
                                        text: `請提供 ${library} 函式庫的現代化遷移建議。

我想了解：
1. ${library} 是否有原生替代方案或更現代的替代函式庫
2. 遷移的步驟和注意事項
3. 具體的程式碼範例`
                                    }
                                }
                            ]
                        };
                    }
                }
                case 'modernize-pattern': {
                    const pattern = args?.pattern || 'callback';
                    const patternGuides = {
                        'callback': `請說明如何將回調函式模式 (callback pattern) 現代化為 Promise/async-await。

包含：
1. 為什麼要從回調轉換為 Promise
2. 使用 util.promisify 包裝現有回調 API
3. 手動建立 Promise 包裝器
4. 使用 async/await 重構程式碼
5. 錯誤處理的最佳實踐`,
                        'var': `請說明如何將 var 宣告現代化為 let/const。

包含：
1. var 的問題：變數提升和作用域洩漏
2. let vs const 的選擇原則
3. 迴圈中的 var 陷阱
4. 自動化工具輔助轉換`,
                        'for-loop': `請說明如何將傳統 for 迴圈現代化為陣列方法。

包含：
1. forEach, map, filter, reduce 的使用時機
2. for...of 與傳統 for 的比較
3. 效能考量
4. 何時仍應使用傳統 for 迴圈`,
                        'iife': `請說明如何將 IIFE (立即執行函式表達式) 現代化為 ES6 模組。

包含：
1. IIFE 的原始用途：作用域隔離和模組模式
2. ES6 模組如何解決相同問題
3. 逐步遷移策略
4. 相容性考量`
                    };
                    const guide = patternGuides[pattern.toLowerCase()] ||
                        `請說明如何現代化 "${pattern}" 這種程式碼模式，包含範例和最佳實踐。`;
                    return {
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: guide
                                }
                            }
                        ]
                    };
                }
                case 'quick-wins': {
                    const projectPath = args?.projectPath || '.';
                    return {
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: `請分析 "${projectPath}" 專案，找出「低風險、高效益」的快速改善機會。

優先尋找：
1. 可直接用原生 API 替換的小型工具函式庫（如 is-number, left-pad, object-assign）
2. var 宣告改為 let/const（無破壞性）
3. 已棄用但有簡單替代方案的 API
4. 已有原生支援的 polyfill

排除：
- 需要大規模重構的建議
- 可能造成破壞性變更的建議

請使用 analyze_modernization 工具，然後篩選出符合「快速勝利」條件的建議。`
                                }
                            }
                        ]
                    };
                }
                case 'analyze-pr': {
                    const projectPath = args?.projectPath || '.';
                    const prDiff = args?.prDiff;
                    const changedFiles = args?.changedFiles;
                    // 構建檔案模式（如果提供了變更檔案列表）
                    let includePatternsText = '';
                    if (changedFiles) {
                        try {
                            const files = typeof changedFiles === 'string' ? JSON.parse(changedFiles) : changedFiles;
                            if (Array.isArray(files) && files.length > 0) {
                                includePatternsText = `\n\n**注意**：請使用 analyze_modernization 工具時，將 includePatterns 參數設為：\n\`\`\`json\n${JSON.stringify(files, null, 2)}\n\`\`\`\n\n這樣可以只分析 PR 變更的檔案，而不是整個專案。`;
                            }
                        }
                        catch (e) {
                            // 忽略解析錯誤
                        }
                    }
                    let prDiffSection = '';
                    if (prDiff) {
                        prDiffSection = `\n\n## PR Diff 內容\n\n以下是 PR 的程式碼變更：\n\n\`\`\`diff\n${prDiff}\n\`\`\`\n\n請仔細分析這些變更，找出可以優化的地方。`;
                    }
                    return {
                        messages: [
                            {
                                role: 'user',
                                content: {
                                    type: 'text',
                                    text: `請分析 Git PR 的程式碼變更，整合規則式分析和 AI 分析，提供完整的現代化建議。

## 分析步驟

### 步驟 1：取得完整的 Web API 列表
首先，請使用 \`list_api_categories\` 工具取得所有可用的 Web API 類別列表。這將幫助你了解有哪些現代 Web API 可以使用。

### 步驟 2：規則式分析（針對 PR 變更的檔案）
使用 \`analyze_modernization\` 工具分析 PR 變更的檔案${includePatternsText ? includePatternsText : '。如果提供了 changedFiles 參數，請只分析這些檔案；否則分析整個專案。'}${prDiffSection}

### 步驟 3：整合分析結果
結合以下資訊進行評估：
1. **規則式分析結果**：從 analyze_modernization 工具獲得的現代化建議
2. **Web API 列表**：從 list_api_categories 工具獲得的完整 API 類別
3. **PR Diff 內容**：實際的程式碼變更（如果提供）

### 步驟 4：提供綜合評估報告

請提供一份整合的分析報告，包含：

#### 1. PR 變更摘要
- 這個 PR 做了什麼變更
- 變更的檔案和範圍

#### 2. 現代化建議（整合規則式分析）
- **函式庫替換機會**：是否使用了可被原生 API 替代的函式庫（jQuery、Moment.js、Lodash 等）
- **API 現代化機會**：是否使用了過時的 API（XMLHttpRequest、var、callback 等）
- **語法現代化**：var → let/const、傳統 for 迴圈 → 陣列方法等

#### 3. Web API 優化建議（基於完整 API 列表）
- 針對 PR 中的功能需求，推薦更適合的現代 Web API
- 例如：如果 PR 涉及圖片懶加載，推薦使用 IntersectionObserver
- 如果涉及尺寸監聽，推薦使用 ResizeObserver
- 參考 list_api_categories 的結果，找出相關的 API 類別

#### 4. 瀏覽器相容性檢查
- 檢查建議的現代 API 是否需要 polyfill
- 使用 \`check_browser_support\` 工具檢查關鍵 API 的相容性
- 提供 polyfill 建議和 CDN 連結

#### 5. 風險評估
- 評估變更的風險等級（low/medium/high）
- 預估實施工時
- 是否為破壞性變更

#### 6. 優先順序建議
- 按照「低風險、高效益」排序建議
- 標記「快速勝利」項目（< 3 小時、低風險）
- 標記需要進一步規劃的項目

## 重要提示

- **只分析 PR 變更的檔案**：不要分析整個專案，專注於 PR 中的變更
- **整合兩種分析方式**：結合規則式分析（analyze_modernization）和 AI 分析（基於 PR diff）
- **參考完整的 Web API 列表**：使用 list_api_categories 的結果來推薦最適合的現代 API
- **提供具體的程式碼範例**：每個建議都應該包含「之前」和「之後」的程式碼對比
- **引用 MDN 文件**：使用 \`search_mdn\` 工具查詢相關 API 的文件，並在建議中附上連結

## 專案路徑

專案路徑：\`${projectPath}\`

現在請開始執行分析步驟。`
                                }
                            }
                        ]
                    };
                }
                default:
                    throw new Error(`Unknown prompt: ${name}`);
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('開發決策顧問 MCP Server 已啟動');
    }
}
// 啟動伺服器
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new DevAdvisorServer();
    server.run().catch((error) => {
        console.error('伺服器啟動失敗:', error);
        process.exit(1);
    });
}
export { DevAdvisorServer };
//# sourceMappingURL=server.js.map