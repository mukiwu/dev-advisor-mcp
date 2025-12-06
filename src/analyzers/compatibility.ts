/**
 * API 相容性分析器
 * 分析專案中使用的 API 與目標瀏覽器的相容性
 */

import browserslist from 'browserslist';
import { CodeParser, ParsedFile, ApiCallInfo } from '../parsers/index.js';
import { CanIUseService, CompatibilityReport } from '../services/caniuse-service.js';
import { ReportFormat } from '../utils/report-formatter.js';

/**
 * 瀏覽器版本資訊
 */
export interface BrowserVersion {
  name: string;
  version: string;
  displayName: string;
}

/**
 * API 相容性問題
 */
export interface CompatibilityIssue {
  api: string;
  caniuseId: string;
  locations: Array<{ file: string; line: number; column: number }>;
  globalSupport: number;
  unsupportedBrowsers: string[];
  partiallySupportedBrowsers: string[];
  polyfillAvailable: boolean;
  polyfillUrl?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

/**
 * 相容性分析結果
 */
export interface CompatibilityAnalysis {
  summary: {
    totalApisAnalyzed: number;
    compatibleApis: number;
    incompatibleApis: number;
    partiallyCompatibleApis: number;
    overallCompatibility: number;
    polyfillsNeeded: number;
  };
  targetBrowsers: BrowserVersion[];
  browserslistQuery: string;
  issues: CompatibilityIssue[];
  polyfillRecommendations: PolyfillRecommendation[];
  fileAnalysis: FileCompatibilityResult[];
}

/**
 * Polyfill 建議
 */
export interface PolyfillRecommendation {
  api: string;
  polyfillUrl: string;
  cdnScript: string;
  npmPackage?: string;
  affectedBrowsers: string[];
}

/**
 * 單一檔案的相容性結果
 */
export interface FileCompatibilityResult {
  filePath: string;
  apisUsed: string[];
  issues: CompatibilityIssue[];
}

/**
 * API 到 Can I Use ID 的映射
 */
const API_TO_CANIUSE_MAP: Record<string, string> = {
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
  'WebAudioAPI': 'audio-api',
  
  // Graphics
  'canvas': 'canvas',
  'getContext': 'canvas',
  'WebGL': 'webgl',
  'WebGL2': 'webgl2',
  
  // Async
  'Promise': 'promises',
  'async': 'async-functions',
  'await': 'async-functions',
  'Worker': 'webworkers',
  'SharedWorker': 'sharedworkers',
  'ServiceWorker': 'serviceworkers',
  
  // URL
  'URL': 'url',
  'URLSearchParams': 'urlsearchparams',
  'history.pushState': 'history',
  'history.replaceState': 'history',
  
  // Events
  'CustomEvent': 'customevent',
  'BroadcastChannel': 'broadcastchannel',
  'WebSocket': 'websockets',
  'EventSource': 'eventsource',
  
  // File
  'FileReader': 'fileapi',
  'Blob': 'blobbuilder',
  'File': 'fileapi',
  'clipboard': 'async-clipboard',
  'navigator.clipboard': 'async-clipboard',
  
  // Location
  'geolocation': 'geolocation',
  'navigator.geolocation': 'geolocation',
  
  // Notification
  'Notification': 'notifications',
  
  // Intl
  'Intl.DateTimeFormat': 'internationalization',
  'Intl.NumberFormat': 'internationalization',
  'Intl.RelativeTimeFormat': 'mdn-javascript_builtins_intl_relativetimeformat',
  'Intl.PluralRules': 'intl-pluralrules',
  
  // Performance
  'performance.now': 'high-resolution-time',
  'performance.mark': 'user-timing',
  'performance.measure': 'user-timing',
  'PerformanceObserver': 'performance-observer',
  
  // Crypto
  'crypto.randomUUID': 'mdn-api_crypto_randomuuid',
  'crypto.subtle': 'cryptography',
  'SubtleCrypto': 'cryptography',
  
  // Animation
  'requestAnimationFrame': 'requestanimationframe',
  'animate': 'web-animation',
  'Animation': 'web-animation',
  
  // CSS Features (detected via API)
  'CSS.supports': 'css-supports-api',
  'matchMedia': 'matchmedia',
  
  // Other
  'Proxy': 'proxy',
  'Reflect': 'proxy',
  'Symbol': 'es6',
  'Map': 'es6',
  'Set': 'es6',
  'WeakMap': 'es6',
  'WeakSet': 'es6',
  'for...of': 'es6',
  'let': 'let',
  'const': 'const',
  'arrow functions': 'arrow-functions',
  'template literals': 'template-literals',
  'destructuring': 'es6',
  'spread operator': 'es6',
  'rest parameters': 'rest-parameters',
  'default parameters': 'es6',
  'class': 'es6-class',
  'Array.from': 'array-from',
  'Array.includes': 'array-includes',
  'Object.assign': 'object-assign',
  'Object.entries': 'object-entries',
  'Object.values': 'object-values',
  'String.includes': 'es6',
  'String.startsWith': 'es6',
  'String.endsWith': 'es6',
  'String.padStart': 'pad-start-end',
  'String.padEnd': 'pad-start-end',
  'Array.flat': 'array-flat',
  'Array.flatMap': 'array-flat',
  'Object.fromEntries': 'object-fromentries',
  'globalThis': 'mdn-javascript_builtins_globalthis',
  'BigInt': 'bigint',
  'Optional chaining': 'mdn-javascript_operators_optional_chaining',
  'Nullish coalescing': 'mdn-javascript_operators_nullish_coalescing',
};

/**
 * 已知的全域 Web API（單一識別符）
 * 這些是確定的瀏覽器原生 API，不是自訂函數
 */
const KNOWN_GLOBAL_APIS = new Set([
  'fetch',
  'Promise',
  'Worker',
  'SharedWorker',
  'ServiceWorker',
  'WebSocket',
  'EventSource',
  'Blob',
  'File',
  'FileReader',
  'URL',
  'URLSearchParams',
  'FormData',
  'Headers',
  'Request',
  'Response',
  'AbortController',
  'AbortSignal',
  'CustomEvent',
  'MutationObserver',
  'IntersectionObserver',
  'ResizeObserver',
  'PerformanceObserver',
  'MessageChannel',
  'MessagePort',
  'BroadcastChannel',
  'Notification',
  'Intl',
  'Map',
  'Set',
  'WeakMap',
  'WeakSet',
  'Symbol',
  'Proxy',
  'Reflect',
  'BigInt',
  'AudioContext',
  'MediaRecorder',
  'MediaStream',
  'ImageData',
  'ImageBitmap',
  'OffscreenCanvas',
  'TextEncoder',
  'TextDecoder',
  'DOMParser',
  'XMLSerializer',
  'XPathEvaluator',
]);

/**
 * 已知的 Web API 物件（用於方法呼叫判斷）
 */
const KNOWN_WEB_API_OBJECTS = new Set([
  'document',
  'window',
  'navigator',
  'location',
  'history',
  'screen',
  'console',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'crypto',
  'performance',
  'caches',
  'fetch',
  'Promise',
  'Array',
  'Object',
  'String',
  'Number',
  'Math',
  'Date',
  'JSON',
  'Intl',
  'Reflect',
  'Proxy',
  'URL',
  'URLSearchParams',
  'FormData',
  'Headers',
  'Request',
  'Response',
  'Blob',
  'File',
  'FileReader',
  'Worker',
  'WebSocket',
  'EventSource',
  'Notification',
  'AudioContext',
  'CanvasRenderingContext2D',
  'WebGLRenderingContext',
  'MediaRecorder',
]);

/**
 * 瀏覽器名稱映射
 */
const BROWSER_NAME_MAP: Record<string, string> = {
  'chrome': 'Chrome',
  'firefox': 'Firefox',
  'safari': 'Safari',
  'edge': 'Edge',
  'ie': 'Internet Explorer',
  'opera': 'Opera',
  'ios_saf': 'iOS Safari',
  'android': 'Android Browser',
  'samsung': 'Samsung Internet',
  'op_mini': 'Opera Mini',
  'op_mob': 'Opera Mobile',
  'and_chr': 'Chrome for Android',
  'and_ff': 'Firefox for Android',
  'and_uc': 'UC Browser',
  'kaios': 'KaiOS Browser',
};

/**
 * 相容性分析器
 */
export class CompatibilityAnalyzer {
  private parser: CodeParser;
  private canIUseService: CanIUseService;

  constructor(parser: CodeParser, canIUseService: CanIUseService) {
    this.parser = parser;
    this.canIUseService = canIUseService;
  }

  /**
   * 分析專案的 API 相容性
   */
  async analyze(
    projectPath: string,
    includePatterns: string[],
    excludePatterns: string[],
    browserslistConfig?: string
  ): Promise<CompatibilityAnalysis> {
    // 1. 解析 browserslist 配置，取得目標瀏覽器
    const { targetBrowsers, query } = this.parseBrowserslistConfig(
      projectPath,
      browserslistConfig
    );

    // 2. 解析專案程式碼
    const parsedFiles = await this.parser.parseProject(
      projectPath,
      includePatterns,
      excludePatterns
    );

    // 3. 收集所有使用的 API
    const apiUsageMap = this.collectApiUsage(parsedFiles);

    // 4. 轉換目標瀏覽器為 CanIUse 格式
    const browserVersions = this.convertBrowserVersions(targetBrowsers);

    // 5. 檢查每個 API 的相容性
    const issues: CompatibilityIssue[] = [];
    const fileAnalysis: FileCompatibilityResult[] = [];

    for (const [api, locations] of apiUsageMap.entries()) {
      const caniuseId = this.getCaniuseId(api);
      if (!caniuseId) continue;

      try {
        const compatibility = await this.canIUseService.checkCompatibility(
          caniuseId,
          browserVersions
        );

        if (compatibility.notSupported.length > 0 || compatibility.partialSupport.length > 0) {
          const issue = this.createIssue(api, caniuseId, locations, compatibility);
          issues.push(issue);
        }
      } catch (error) {
        // 忽略無法查詢的 API
        console.warn(`無法查詢 ${api} 的相容性:`, error);
      }
    }

    // 6. 按檔案分組問題
    for (const file of parsedFiles) {
      const fileIssues = issues.filter(issue =>
        issue.locations.some(loc => loc.file === file.filePath)
      );
      
      const apisUsed = Array.from(
        new Set(file.apiCalls.map(call => call.method ? `${call.api}.${call.method}` : call.api))
      );

      fileAnalysis.push({
        filePath: file.filePath,
        apisUsed,
        issues: fileIssues
      });
    }

    // 7. 生成 Polyfill 建議
    const polyfillRecommendations = this.generatePolyfillRecommendations(issues);

    // 8. 計算摘要
    const summary = this.generateSummary(apiUsageMap.size, issues);

    return {
      summary,
      targetBrowsers,
      browserslistQuery: query,
      issues,
      polyfillRecommendations,
      fileAnalysis
    };
  }

  /**
   * 解析 browserslist 配置
   */
  private parseBrowserslistConfig(
    projectPath: string,
    configString?: string
  ): { targetBrowsers: BrowserVersion[]; query: string } {
    let query: string;
    let browsers: string[];

    try {
      if (configString) {
        // 使用傳入的配置
        query = configString;
        browsers = browserslist(configString);
      } else {
        // 自動偵測專案配置
        browsers = browserslist(undefined, { path: projectPath });
        query = 'defaults (from project config)';
      }
    } catch (error) {
      // 使用預設配置
      query = 'defaults';
      browsers = browserslist('defaults');
    }

    // 解析瀏覽器版本
    const targetBrowsers: BrowserVersion[] = browsers.map(browser => {
      const [name, version] = browser.split(' ');
      return {
        name: name.toLowerCase(),
        version,
        displayName: `${BROWSER_NAME_MAP[name.toLowerCase()] || name} ${version}`
      };
    });

    // 去重並按瀏覽器名稱分組，只保留最低版本
    const browserMap = new Map<string, BrowserVersion>();
    for (const browser of targetBrowsers) {
      const existing = browserMap.get(browser.name);
      if (!existing || parseFloat(browser.version) < parseFloat(existing.version)) {
        browserMap.set(browser.name, browser);
      }
    }

    return {
      targetBrowsers: Array.from(browserMap.values()),
      query
    };
  }

  /**
   * 收集專案中使用的 API
   */
  private collectApiUsage(
    files: ParsedFile[]
  ): Map<string, Array<{ file: string; line: number; column: number }>> {
    const apiUsage = new Map<string, Array<{ file: string; line: number; column: number }>>();

    for (const file of files) {
      for (const call of file.apiCalls) {
        const apiName = call.method ? `${call.api}.${call.method}` : call.api;
        
        // 過濾掉明顯不是 Web API 的呼叫
        if (this.isWebApi(apiName)) {
          const locations = apiUsage.get(apiName) || [];
          locations.push({
            file: file.filePath,
            line: call.loc?.line || 0,
            column: call.loc?.column || 0
          });
          apiUsage.set(apiName, locations);
        }
      }
    }

    return apiUsage;
  }

  /**
   * 判斷是否是 Web API
   * 使用嚴格匹配，避免誤判專案自訂函數
   */
  private isWebApi(apiName: string): boolean {
    // 排除明顯的自訂函數（小寫字母開頭的單一函數名）
    if (/^[a-z][a-zA-Z0-9]*$/.test(apiName) && !KNOWN_GLOBAL_APIS.has(apiName)) {
      return false;
    }

    // 排除常見的自訂函數模式
    const excludePatterns = [
      /^(get|set|create|update|delete|fetch|load|save|handle|on|render|use)[A-Z]/,  // 自訂函數命名
      /^_/,  // 私有函數
      /\$$/,  // jQuery 風格
      /^(is|has|can|should|will|did)[A-Z]/,  // 判斷函數
      /^(init|setup|config|process|parse|format|validate|transform)/i,  // 工具函數
    ];

    // 如果是單一識別符（無點號），檢查是否為排除模式
    if (!apiName.includes('.')) {
      if (excludePatterns.some(pattern => pattern.test(apiName))) {
        return false;
      }
    }

    // 檢查是否在映射表中（精確匹配）
    if (API_TO_CANIUSE_MAP[apiName]) return true;

    // 檢查是否是已知的 Web API 物件方法呼叫
    const parts = apiName.split('.');
    if (parts.length >= 2) {
      const [obj, method] = parts;
      
      // 精確匹配物件名稱
      if (KNOWN_WEB_API_OBJECTS.has(obj)) {
        return true;
      }

      // 檢查完整的 API 路徑
      const fullPath = `${obj}.${method}`;
      if (API_TO_CANIUSE_MAP[fullPath]) {
        return true;
      }
    }

    return false;
  }

  /**
   * 取得 Can I Use ID
   * 使用精確匹配，避免誤判
   */
  private getCaniuseId(apiName: string): string | null {
    // 1. 直接精確匹配
    if (API_TO_CANIUSE_MAP[apiName]) {
      return API_TO_CANIUSE_MAP[apiName];
    }

    // 2. 嘗試匹配物件名稱（如 fetch, Promise）
    const parts = apiName.split('.');
    if (parts.length >= 1) {
      const obj = parts[0];
      if (API_TO_CANIUSE_MAP[obj]) {
        return API_TO_CANIUSE_MAP[obj];
      }
    }

    // 3. 嘗試匹配完整路徑（如 navigator.geolocation）
    if (parts.length >= 2) {
      const fullPath = `${parts[0]}.${parts[1]}`;
      if (API_TO_CANIUSE_MAP[fullPath]) {
        return API_TO_CANIUSE_MAP[fullPath];
      }
    }

    // 4. 不再使用模糊匹配，避免誤判
    return null;
  }

  /**
   * 轉換瀏覽器版本格式
   */
  private convertBrowserVersions(browsers: BrowserVersion[]): Record<string, string> {
    const versions: Record<string, string> = {};
    
    for (const browser of browsers) {
      // 只取主要瀏覽器
      if (['chrome', 'firefox', 'safari', 'edge', 'ie', 'opera', 'ios_saf', 'android'].includes(browser.name)) {
        versions[browser.name] = browser.version;
      }
    }

    return versions;
  }

  /**
   * 建立相容性問題
   */
  private createIssue(
    api: string,
    caniuseId: string,
    locations: Array<{ file: string; line: number; column: number }>,
    compatibility: CompatibilityReport
  ): CompatibilityIssue {
    // 計算嚴重程度
    let severity: 'low' | 'medium' | 'high' | 'critical';
    if (compatibility.notSupported.length >= 3) {
      severity = 'critical';
    } else if (compatibility.notSupported.length >= 1) {
      severity = 'high';
    } else if (compatibility.partialSupport.length >= 2) {
      severity = 'medium';
    } else {
      severity = 'low';
    }

    return {
      api,
      caniuseId,
      locations,
      globalSupport: compatibility.globalSupport,
      unsupportedBrowsers: compatibility.notSupported,
      partiallySupportedBrowsers: compatibility.partialSupport,
      polyfillAvailable: compatibility.polyfillAvailable,
      polyfillUrl: compatibility.polyfillUrl,
      severity,
      recommendation: compatibility.recommendation
    };
  }

  /**
   * 生成 Polyfill 建議
   */
  private generatePolyfillRecommendations(issues: CompatibilityIssue[]): PolyfillRecommendation[] {
    const recommendations: PolyfillRecommendation[] = [];
    const seen = new Set<string>();

    for (const issue of issues) {
      if (issue.polyfillAvailable && issue.polyfillUrl && !seen.has(issue.api)) {
        seen.add(issue.api);
        
        recommendations.push({
          api: issue.api,
          polyfillUrl: issue.polyfillUrl,
          cdnScript: `<script src="${issue.polyfillUrl}"></script>`,
          npmPackage: this.getNpmPackage(issue.api),
          affectedBrowsers: issue.unsupportedBrowsers
        });
      }
    }

    return recommendations;
  }

  /**
   * 取得 npm 套件名稱
   */
  private getNpmPackage(api: string): string | undefined {
    const npmPackages: Record<string, string> = {
      'fetch': 'whatwg-fetch',
      'Promise': 'es6-promise',
      'IntersectionObserver': 'intersection-observer',
      'ResizeObserver': 'resize-observer-polyfill',
      'MutationObserver': 'mutationobserver-shim',
      'URLSearchParams': 'url-search-params-polyfill',
      'AbortController': 'abortcontroller-polyfill',
      'CustomEvent': 'custom-event-polyfill',
      'Symbol': 'core-js/features/symbol',
      'Map': 'core-js/features/map',
      'Set': 'core-js/features/set',
      'Array.from': 'core-js/features/array/from',
      'Array.includes': 'core-js/features/array/includes',
      'Object.assign': 'core-js/features/object/assign',
      'Object.entries': 'core-js/features/object/entries',
      'String.includes': 'core-js/features/string/includes',
    };

    return npmPackages[api];
  }

  /**
   * 生成摘要資訊
   */
  private generateSummary(
    totalApis: number,
    issues: CompatibilityIssue[]
  ): CompatibilityAnalysis['summary'] {
    const incompatibleApis = issues.filter(i => i.unsupportedBrowsers.length > 0).length;
    const partiallyCompatibleApis = issues.filter(
      i => i.unsupportedBrowsers.length === 0 && i.partiallySupportedBrowsers.length > 0
    ).length;
    const compatibleApis = totalApis - incompatibleApis - partiallyCompatibleApis;
    const polyfillsNeeded = issues.filter(i => i.polyfillAvailable).length;

    // 計算整體相容性百分比
    const overallCompatibility = totalApis > 0
      ? Math.round((compatibleApis / totalApis) * 100)
      : 100;

    return {
      totalApisAnalyzed: totalApis,
      compatibleApis,
      incompatibleApis,
      partiallyCompatibleApis,
      overallCompatibility,
      polyfillsNeeded
    };
  }
}

/**
 * 格式化相容性報告
 */
export function formatCompatibilityReport(
  analysis: CompatibilityAnalysis,
  format: ReportFormat = 'markdown'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(analysis, null, 2);
    case 'html':
      return formatAsHtml(analysis);
    case 'text':
      return formatAsText(analysis);
    case 'markdown':
    default:
      return formatAsMarkdown(analysis);
  }
}

/**
 * 格式化為 Markdown
 */
function formatAsMarkdown(analysis: CompatibilityAnalysis): string {
  const { summary, targetBrowsers, browserslistQuery, issues, polyfillRecommendations } = analysis;

  let report = `# 🔍 API 相容性分析報告\n\n`;

  // 摘要
  report += `## 📊 執行摘要\n\n`;
  report += createAsciiTable(
    ['指標', '數值'],
    [
      ['分析的 API 數量', String(summary.totalApisAnalyzed)],
      ['完全相容', String(summary.compatibleApis)],
      ['部分相容', String(summary.partiallyCompatibleApis)],
      ['不相容', String(summary.incompatibleApis)],
      ['整體相容性', `${summary.overallCompatibility}%`],
      ['需要 Polyfill', String(summary.polyfillsNeeded)],
    ]
  );
  report += `\n`;

  // 目標瀏覽器
  report += `## 🎯 目標瀏覽器\n\n`;
  report += `**Browserslist 查詢**: \`${browserslistQuery}\`\n\n`;
  
  if (targetBrowsers.length > 0) {
    report += createAsciiTable(
      ['瀏覽器', '最低版本'],
      targetBrowsers.map(browser => [
        BROWSER_NAME_MAP[browser.name] || browser.name,
        browser.version
      ])
    );
    report += `\n`;
  }

  // 相容性問題
  if (issues.length > 0) {
    report += `## ⚠️ 相容性問題\n\n`;

    // 按嚴重程度分組
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');
    const mediumIssues = issues.filter(i => i.severity === 'medium');
    const lowIssues = issues.filter(i => i.severity === 'low');

    if (criticalIssues.length > 0) {
      report += `### 🔴 嚴重問題 (${criticalIssues.length})\n\n`;
      report += formatIssueTable(criticalIssues);
    }

    if (highIssues.length > 0) {
      report += `### 🟠 高風險問題 (${highIssues.length})\n\n`;
      report += formatIssueTable(highIssues);
    }

    if (mediumIssues.length > 0) {
      report += `### 🟡 中風險問題 (${mediumIssues.length})\n\n`;
      report += formatIssueTable(mediumIssues);
    }

    if (lowIssues.length > 0) {
      report += `### 🟢 低風險問題 (${lowIssues.length})\n\n`;
      report += formatIssueTable(lowIssues);
    }
  } else {
    report += `## ✅ 無相容性問題\n\n`;
    report += `恭喜！所有使用的 API 在目標瀏覽器中都完全支援。\n\n`;
  }

  // Polyfill 建議
  if (polyfillRecommendations.length > 0) {
    report += `## 📦 Polyfill 建議\n\n`;
    
    for (const rec of polyfillRecommendations) {
      report += `### ${rec.api}\n\n`;
      report += `**受影響的瀏覽器**: ${rec.affectedBrowsers.join(', ')}\n\n`;
      report += `**CDN 引入**:\n\`\`\`html\n${rec.cdnScript}\n\`\`\`\n\n`;
      if (rec.npmPackage) {
        report += `**npm 套件**: \`${rec.npmPackage}\`\n\n`;
      }
    }

    // 統一 Polyfill 方案
    report += `### 💡 統一 Polyfill 方案\n\n`;
    report += `使用 [polyfill.io](https://polyfill.io) 自動按需載入 polyfill：\n\n`;
    report += `\`\`\`html\n<script src="https://polyfill.io/v3/polyfill.min.js?features=${polyfillRecommendations.map(r => r.api).join('%2C')}"></script>\n\`\`\`\n\n`;
  }

  // 結論
  report += `## 📝 總結\n\n`;
  if (summary.overallCompatibility >= 90) {
    report += `✅ 專案的 API 相容性良好，整體相容性達 ${summary.overallCompatibility}%。\n`;
  } else if (summary.overallCompatibility >= 70) {
    report += `⚠️ 專案存在一些相容性問題，建議加入必要的 polyfill。\n`;
  } else {
    report += `❌ 專案存在較多相容性問題，建議仔細評估目標瀏覽器需求或加入 polyfill。\n`;
  }

  if (polyfillRecommendations.length > 0) {
    report += `\n建議加入 ${polyfillRecommendations.length} 個 polyfill 以提升相容性。\n`;
  }

  return report;
}

/**
 * 建立 ASCII 表格（適用於 Cursor 等不支援 Markdown 表格的環境）
 */
function createAsciiTable(headers: string[], rows: string[][]): string {
  // 計算每欄的最大寬度
  const colWidths = headers.map((h, i) => {
    const cellWidths = rows.map(row => (row[i] || '').length);
    return Math.max(h.length, ...cellWidths);
  });

  // 建立分隔線
  const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
  
  // 建立行
  const formatRow = (cells: string[]) => {
    return '| ' + cells.map((cell, i) => (cell || '').padEnd(colWidths[i])).join(' | ') + ' |';
  };

  // 組合表格
  let table = '```\n';
  table += separator + '\n';
  table += formatRow(headers) + '\n';
  table += separator + '\n';
  for (const row of rows) {
    table += formatRow(row) + '\n';
  }
  table += separator + '\n';
  table += '```\n';

  return table;
}

/**
 * 格式化問題表格
 */
function formatIssueTable(issues: CompatibilityIssue[]): string {
  const headers = ['API', '全球支援率', '不支援的瀏覽器', 'Polyfill'];
  const rows = issues.map(issue => {
    const browsers = issue.unsupportedBrowsers.slice(0, 3).join(', ') || '-';
    const more = issue.unsupportedBrowsers.length > 3 ? ` (+${issue.unsupportedBrowsers.length - 3})` : '';
    const polyfill = issue.polyfillAvailable ? '✅ 可用' : '❌ 無';
    return [issue.api, `${issue.globalSupport.toFixed(1)}%`, `${browsers}${more}`, polyfill];
  });

  return createAsciiTable(headers, rows) + '\n';
}

/**
 * 格式化為純文字
 */
function formatAsText(analysis: CompatibilityAnalysis): string {
  const { summary, targetBrowsers, issues, polyfillRecommendations } = analysis;

  let report = `API 相容性分析報告\n`;
  report += `${'='.repeat(50)}\n\n`;

  report += `執行摘要\n`;
  report += `-`.repeat(30) + '\n';
  report += `分析的 API: ${summary.totalApisAnalyzed}\n`;
  report += `完全相容: ${summary.compatibleApis}\n`;
  report += `不相容: ${summary.incompatibleApis}\n`;
  report += `整體相容性: ${summary.overallCompatibility}%\n\n`;

  report += `目標瀏覽器\n`;
  report += `-`.repeat(30) + '\n';
  for (const browser of targetBrowsers) {
    report += `- ${BROWSER_NAME_MAP[browser.name] || browser.name} ${browser.version}\n`;
  }
  report += '\n';

  if (issues.length > 0) {
    report += `相容性問題 (${issues.length})\n`;
    report += `-`.repeat(30) + '\n';
    for (const issue of issues) {
      report += `[${issue.severity.toUpperCase()}] ${issue.api}\n`;
      report += `  不支援: ${issue.unsupportedBrowsers.join(', ')}\n`;
      report += `  Polyfill: ${issue.polyfillAvailable ? '可用' : '無'}\n\n`;
    }
  }

  return report;
}

/**
 * 格式化為 HTML
 */
function formatAsHtml(analysis: CompatibilityAnalysis): string {
  const { summary, targetBrowsers, issues, polyfillRecommendations } = analysis;

  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API 相容性分析報告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .stat { text-align: center; }
    .stat-value { font-size: 2em; font-weight: bold; color: #2563eb; }
    .stat-label { color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #f0f0f0; }
    .critical { background: #fee2e2; }
    .high { background: #fef3c7; }
    .medium { background: #fef9c3; }
    .low { background: #dcfce7; }
    code { background: #e5e7eb; padding: 2px 6px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>🔍 API 相容性分析報告</h1>
  
  <div class="summary">
    <h2>執行摘要</h2>
    <div class="summary-grid">
      <div class="stat">
        <div class="stat-value">${summary.totalApisAnalyzed}</div>
        <div class="stat-label">分析的 API</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="color: ${summary.overallCompatibility >= 80 ? '#16a34a' : '#dc2626'}">${summary.overallCompatibility}%</div>
        <div class="stat-label">整體相容性</div>
      </div>
      <div class="stat">
        <div class="stat-value">${summary.polyfillsNeeded}</div>
        <div class="stat-label">需要 Polyfill</div>
      </div>
    </div>
  </div>

  <h2>目標瀏覽器</h2>
  <table>
    <tr><th>瀏覽器</th><th>最低版本</th></tr>
    ${targetBrowsers.map(b => `<tr><td>${BROWSER_NAME_MAP[b.name] || b.name}</td><td>${b.version}</td></tr>`).join('')}
  </table>

  ${issues.length > 0 ? `
  <h2>相容性問題</h2>
  <table>
    <tr><th>API</th><th>嚴重程度</th><th>不支援的瀏覽器</th><th>Polyfill</th></tr>
    ${issues.map(i => `<tr class="${i.severity}"><td><code>${i.api}</code></td><td>${i.severity}</td><td>${i.unsupportedBrowsers.join(', ')}</td><td>${i.polyfillAvailable ? '✅' : '❌'}</td></tr>`).join('')}
  </table>
  ` : '<h2>✅ 無相容性問題</h2>'}

</body>
</html>`;
}

