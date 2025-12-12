/**
 * Can I Use API 服務
 * 動態查詢瀏覽器相容性資料
 */
/**
 * Can I Use 服務
 */
export class CanIUseService {
    // 官方 Can I Use GitHub 資料來源（主要）
    dataUrls = [
        'https://raw.githubusercontent.com/Fyrd/caniuse/main/data.json',
        'https://cdn.jsdelivr.net/npm/caniuse-db@latest/data.json',
        'https://raw.githubusercontent.com/nicxvan/caniuse/main/fulldata-json/data-2.0.json'
    ];
    cachedData = null;
    cacheTime = 0;
    cacheDuration = 24 * 60 * 60 * 1000; // 24 小時
    /**
     * 載入 Can I Use 資料（支援 fallback）
     */
    async loadData() {
        // 檢查快取
        if (this.cachedData && Date.now() - this.cacheTime < this.cacheDuration) {
            return this.cachedData;
        }
        let lastError = null;
        // 嘗試所有資料來源
        for (const url of this.dataUrls) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'DevAdvisor-MCP/1.0'
                    }
                });
                if (!response.ok) {
                    lastError = new Error(`Can I Use 資料載入失敗: ${response.status} (${url})`);
                    continue;
                }
                this.cachedData = await response.json();
                this.cacheTime = Date.now();
                return this.cachedData;
            }
            catch (error) {
                lastError = error;
                console.warn(`嘗試載入 ${url} 失敗，嘗試下一個來源...`);
            }
        }
        // 所有來源都失敗
        console.error('所有 Can I Use 資料來源都載入失敗:', lastError);
        throw new Error(`Can I Use 資料載入失敗: 所有資料來源都無法存取`);
    }
    /**
     * 搜尋功能
     */
    async searchFeature(query) {
        const data = await this.loadData();
        const features = data.data || {};
        const lowerQuery = query.toLowerCase();
        const matches = [];
        for (const [id, feature] of Object.entries(features)) {
            let score = 0;
            // 完全匹配 ID
            if (id.toLowerCase() === lowerQuery) {
                score = 100;
            }
            // ID 包含查詢
            else if (id.toLowerCase().includes(lowerQuery)) {
                score = 80;
            }
            // 標題匹配
            else if (feature.title?.toLowerCase().includes(lowerQuery)) {
                score = 60;
            }
            // 描述匹配
            else if (feature.description?.toLowerCase().includes(lowerQuery)) {
                score = 40;
            }
            // 關鍵字匹配
            else if (feature.keywords?.toLowerCase().includes(lowerQuery)) {
                score = 30;
            }
            if (score > 0) {
                matches.push({ id, score });
            }
        }
        // 按分數排序並返回 ID
        return matches
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(m => m.id);
    }
    /**
     * 取得功能的瀏覽器支援資料
     */
    async getFeatureSupport(featureId) {
        const data = await this.loadData();
        const feature = data.data?.[featureId];
        if (!feature) {
            // 嘗試搜尋
            const matches = await this.searchFeature(featureId);
            if (matches.length > 0) {
                return this.getFeatureSupport(matches[0]);
            }
            return null;
        }
        const browsers = data.agents || {};
        return {
            featureId,
            title: feature.title || featureId,
            description: feature.description || '',
            status: feature.status || 'other',
            usage: this.calculateGlobalUsage(feature, browsers),
            categories: feature.categories || [],
            browsers: this.parseBrowserSupport(feature.stats, browsers),
            notes: this.parseNotes(feature.notes_by_num),
            links: feature.links?.map((l) => ({ url: l.url, title: l.title })),
            mdnUrl: feature.mdn_url,
            specUrl: feature.spec
        };
    }
    /**
     * 計算全球使用率
     */
    calculateGlobalUsage(feature, browsers) {
        // 簡化計算：基於主要瀏覽器的支援狀況
        const stats = feature.stats || {};
        let supportedUsage = 0;
        const majorBrowsers = ['chrome', 'firefox', 'safari', 'edge'];
        for (const browser of majorBrowsers) {
            const browserStats = stats[browser] || {};
            const latestVersion = Object.keys(browserStats).pop();
            if (latestVersion) {
                const support = browserStats[latestVersion];
                if (support?.startsWith('y') || support === 'y') {
                    supportedUsage += 25; // 每個主要瀏覽器約 25%
                }
                else if (support?.startsWith('a')) {
                    supportedUsage += 15;
                }
            }
        }
        return Math.min(supportedUsage, 100);
    }
    /**
     * 解析瀏覽器支援資料
     */
    parseBrowserSupport(stats, browsers) {
        const browserList = ['chrome', 'firefox', 'safari', 'edge', 'ie', 'opera', 'ios_saf', 'android', 'samsung'];
        const result = {};
        for (const browser of browserList) {
            const browserStats = stats?.[browser] || {};
            const versions = Object.entries(browserStats);
            // 找到第一個支援的版本
            let sinceVersion;
            let currentSupport = 'n';
            let hasPartialSupport = false;
            for (const [version, support] of versions) {
                if (support.startsWith('y') && !sinceVersion) {
                    sinceVersion = version;
                }
                if (support.startsWith('a')) {
                    hasPartialSupport = true;
                }
            }
            // 取得最新版本的支援狀態
            const latestVersion = versions[versions.length - 1];
            if (latestVersion) {
                const [, support] = latestVersion;
                currentSupport = support.charAt(0) || 'u';
            }
            result[browser] = {
                supported: currentSupport === 'y' || currentSupport === 'a',
                partialSupport: hasPartialSupport || currentSupport === 'a',
                sinceVersion,
                currentSupport
            };
        }
        return result;
    }
    /**
     * 解析備註
     */
    parseNotes(notesByNum) {
        if (!notesByNum)
            return undefined;
        return Object.values(notesByNum).slice(0, 5);
    }
    /**
     * 檢查 API 在目標瀏覽器中的相容性
     */
    async checkCompatibility(featureId, targetBrowsers = {
        chrome: '90',
        firefox: '88',
        safari: '14',
        edge: '90'
    }) {
        const support = await this.getFeatureSupport(featureId);
        if (!support) {
            return {
                feature: featureId,
                globalSupport: 0,
                supported: [],
                notSupported: Object.keys(targetBrowsers),
                partialSupport: [],
                recommendation: `找不到 ${featureId} 的相容性資料，建議查詢 MDN 文件`,
                polyfillAvailable: false
            };
        }
        const supported = [];
        const notSupported = [];
        const partialSupport = [];
        for (const [browser, targetVersion] of Object.entries(targetBrowsers)) {
            const browserSupport = support.browsers[browser];
            if (!browserSupport) {
                notSupported.push(browser);
                continue;
            }
            if (browserSupport.supported) {
                if (browserSupport.sinceVersion) {
                    const sinceNum = parseFloat(browserSupport.sinceVersion);
                    const targetNum = parseFloat(targetVersion);
                    if (sinceNum <= targetNum) {
                        if (browserSupport.partialSupport) {
                            partialSupport.push(`${browser} >= ${browserSupport.sinceVersion}`);
                        }
                        else {
                            supported.push(`${browser} >= ${browserSupport.sinceVersion}`);
                        }
                    }
                    else {
                        notSupported.push(`${browser} < ${browserSupport.sinceVersion}`);
                    }
                }
                else {
                    supported.push(browser);
                }
            }
            else {
                notSupported.push(browser);
            }
        }
        // 生成建議
        let recommendation = '';
        if (notSupported.length === 0) {
            recommendation = '✅ 所有目標瀏覽器都支援此功能';
        }
        else if (supported.length === 0) {
            recommendation = '❌ 此功能在目標瀏覽器中不受支援，需要 polyfill 或替代方案';
        }
        else {
            recommendation = `⚠️ 部分瀏覽器不支援：${notSupported.join(', ')}。建議提供 fallback 或使用 polyfill`;
        }
        return {
            feature: support.title,
            globalSupport: support.usage,
            supported,
            notSupported,
            partialSupport,
            recommendation,
            polyfillAvailable: this.checkPolyfillAvailable(featureId),
            polyfillUrl: this.getPolyfillUrl(featureId)
        };
    }
    /**
     * 檢查是否有 polyfill
     */
    checkPolyfillAvailable(featureId) {
        const polyfillableFeatures = [
            'fetch', 'promise', 'array-includes', 'object-assign',
            'string-includes', 'array-find', 'array-from', 'symbol',
            'map', 'set', 'weakmap', 'weakset', 'proxy', 'reflect',
            'intersectionobserver', 'resizeobserver', 'mutationobserver',
            'customelements', 'shadowdom', 'template', 'dialog'
        ];
        return polyfillableFeatures.some(f => featureId.toLowerCase().includes(f));
    }
    /**
     * 取得 polyfill URL
     */
    getPolyfillUrl(featureId) {
        // polyfill.io 服務
        const polyfillIoFeatures = {
            'fetch': 'fetch',
            'promise': 'Promise',
            'array-includes': 'Array.prototype.includes',
            'object-assign': 'Object.assign',
            'string-includes': 'String.prototype.includes',
            'array-find': 'Array.prototype.find',
            'array-from': 'Array.from',
            'symbol': 'Symbol',
            'map': 'Map',
            'set': 'Set',
            'weakmap': 'WeakMap',
            'weakset': 'WeakSet',
            'intersectionobserver': 'IntersectionObserver',
            'resizeobserver': 'ResizeObserver',
        };
        for (const [key, polyfillName] of Object.entries(polyfillIoFeatures)) {
            if (featureId.toLowerCase().includes(key)) {
                return `https://polyfill.io/v3/polyfill.min.js?features=${polyfillName}`;
            }
        }
        return undefined;
    }
    /**
     * 批次檢查多個功能的相容性
     */
    async checkMultipleFeatures(featureIds, targetBrowsers) {
        const reports = [];
        for (const featureId of featureIds) {
            const report = await this.checkCompatibility(featureId, targetBrowsers);
            reports.push(report);
        }
        return reports;
    }
    /**
     * 取得特定類別的功能列表
     */
    async getFeaturesByCategory(category) {
        const data = await this.loadData();
        const features = data.data || {};
        const matches = [];
        const lowerCategory = category.toLowerCase();
        for (const [id, feature] of Object.entries(features)) {
            const categories = feature.categories || [];
            if (categories.some((c) => c.toLowerCase().includes(lowerCategory))) {
                matches.push(id);
            }
        }
        return matches;
    }
    /**
     * 取得所有可用的 API 類別
     * 從 Can I Use 資料庫中提取所有唯一的類別
     */
    async getAllCategories() {
        const data = await this.loadData();
        const features = data.data || {};
        // 統計每個類別的功能數量
        const categoryMap = new Map();
        for (const [, feature] of Object.entries(features)) {
            const categories = feature.categories || [];
            for (const category of categories) {
                const count = categoryMap.get(category) || 0;
                categoryMap.set(category, count + 1);
            }
        }
        // 轉換為陣列並排序
        const categories = Array.from(categoryMap.entries())
            .map(([name, count]) => ({
            name,
            count,
            description: this.getCategoryDescription(name)
        }))
            .sort((a, b) => b.count - a.count); // 按數量降序排列
        return categories;
    }
    /**
     * 取得類別的描述
     */
    getCategoryDescription(category) {
        const descriptions = {
            'CSS': 'CSS 相關功能，包括佈局、動畫、選擇器等',
            'HTML': 'HTML 元素和屬性',
            'JavaScript': 'JavaScript API 和語言特性',
            'SVG': 'SVG 圖形相關功能',
            'Canvas': 'Canvas 繪圖 API',
            'Security': '安全性相關 API',
            'Performance': '效能相關 API',
            'Network': '網路請求相關 API',
            'Storage': '資料儲存相關 API',
            'Media': '媒體處理相關 API（音訊、視訊）',
            'Graphics': '圖形渲染相關 API',
            'DOM': 'DOM 操作相關 API',
            'Events': '事件處理相關 API',
            'Forms': '表單相關 API',
            'Mobile': '行動裝置相關功能',
            'Other': '其他功能',
            'JS API': 'JavaScript API',
            'Misc': '雜項功能',
            'APIs': 'Web API',
            'HTML5': 'HTML5 功能',
            'CSS3': 'CSS3 功能'
        };
        return descriptions[category] || `包含 ${category} 相關的 Web API 和功能`;
    }
}
/**
 * API 名稱到 Can I Use ID 的映射
 * 用於從常見的 API 呼叫名稱查詢對應的 caniuse feature ID
 */
export const API_NAME_TO_CANIUSE = {
    // Fetch & Network
    'fetch': 'fetch',
    'AbortController': 'abortcontroller',
    'Headers': 'fetch',
    'Request': 'fetch',
    'Response': 'fetch',
    // DOM APIs
    'querySelector': 'queryselector',
    'querySelectorAll': 'queryselector',
    'classList': 'classlist',
    'MutationObserver': 'mutationobserver',
    'IntersectionObserver': 'intersectionobserver',
    'ResizeObserver': 'resizeobserver',
    // Storage
    'localStorage': 'namevalue-storage',
    'sessionStorage': 'namevalue-storage',
    'indexedDB': 'indexeddb',
    'IndexedDB': 'indexeddb',
    // Media
    'getUserMedia': 'stream',
    'MediaRecorder': 'mediarecorder',
    'AudioContext': 'audio-api',
    // Graphics
    'canvas': 'canvas',
    'getContext': 'canvas',
    'WebGL': 'webgl',
    'WebGL2': 'webgl2',
    // Async
    'Promise': 'promises',
    'Worker': 'webworkers',
    'SharedWorker': 'sharedworkers',
    'ServiceWorker': 'serviceworkers',
    // URL
    'URL': 'url',
    'URLSearchParams': 'urlsearchparams',
    // Events
    'CustomEvent': 'customevent',
    'BroadcastChannel': 'broadcastchannel',
    'WebSocket': 'websockets',
    'EventSource': 'eventsource',
    // File
    'FileReader': 'fileapi',
    'Blob': 'blobbuilder',
    'File': 'fileapi',
    // Location & Notification
    'geolocation': 'geolocation',
    'Notification': 'notifications',
    // Intl
    'Intl.DateTimeFormat': 'internationalization',
    'Intl.NumberFormat': 'internationalization',
    // Crypto
    'crypto.randomUUID': 'mdn-api_crypto_randomuuid',
    'crypto.subtle': 'cryptography',
    // Animation
    'requestAnimationFrame': 'requestanimationframe',
    'animate': 'web-animation',
    // ES6+
    'Proxy': 'proxy',
    'Symbol': 'es6',
    'Map': 'es6',
    'Set': 'es6',
    'WeakMap': 'es6',
    'WeakSet': 'es6',
    'Array.from': 'array-from',
    'Array.includes': 'array-includes',
    'Object.assign': 'object-assign',
    'Object.entries': 'object-entries',
    'Object.values': 'object-values',
    'String.padStart': 'pad-start-end',
    'String.padEnd': 'pad-start-end',
    'Array.flat': 'array-flat',
    'Array.flatMap': 'array-flat',
    'BigInt': 'bigint',
};
/**
 * 從 API 名稱取得 Can I Use ID
 */
export function getCaniuseIdFromApiName(apiName) {
    // 直接匹配
    if (API_NAME_TO_CANIUSE[apiName]) {
        return API_NAME_TO_CANIUSE[apiName];
    }
    // 嘗試匹配部分名稱
    for (const [key, value] of Object.entries(API_NAME_TO_CANIUSE)) {
        if (apiName.includes(key) || key.includes(apiName)) {
            return value;
        }
    }
    return null;
}
/**
 * 建立 Can I Use 服務實例
 */
export function createCanIUseService() {
    return new CanIUseService();
}
//# sourceMappingURL=caniuse-service.js.map