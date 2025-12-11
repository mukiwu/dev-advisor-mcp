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
export class MDNService {
  private baseUrl = 'https://developer.mozilla.org';
  private apiUrl = 'https://developer.mozilla.org/api/v1';
  private locale = 'en-US';

  constructor(locale: string = 'en-US') {
    this.locale = locale;
  }

  /**
   * 搜尋 MDN 文件
   */
  async search(query: string, limit: number = 10): Promise<MDNSearchResult[]> {
    try {
      const url = `${this.apiUrl}/search?q=${encodeURIComponent(query)}&locale=${this.locale}&size=${limit}`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DevAdvisor-MCP/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`MDN API 回應錯誤: ${response.status}`);
      }

      const data = await response.json();

      return (data.documents || []).map((doc: any) => ({
        title: doc.title,
        slug: doc.slug,
        locale: doc.locale,
        summary: doc.summary || '',
        url: `${this.baseUrl}/${doc.locale}/docs/${doc.slug}`,
        score: doc.score || 0,
        highlight: doc.highlight
      }));
    } catch (error) {
      console.error('MDN 搜尋失敗:', error);
      return [];
    }
  }

  /**
   * 取得特定 API 的詳細資訊
   */
  async getAPIInfo(apiPath: string): Promise<MDNDocument | null> {
    try {
      // 清理路徑
      const cleanPath = apiPath
        .replace(/^\//, '')
        .replace(/^docs\//, '')
        .replace(/^Web\//, 'Web/');

      const url = `${this.baseUrl}/${this.locale}/docs/${cleanPath}/index.json`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DevAdvisor-MCP/1.0'
        }
      });

      if (!response.ok) {
        // 嘗試搜尋
        const searchResults = await this.search(apiPath, 1);
        if (searchResults.length > 0) {
          return this.getAPIInfoFromSlug(searchResults[0].slug);
        }
        return null;
      }

      const data = await response.json();
      return this.parseDocument(data);
    } catch (error) {
      console.error('取得 MDN 文件失敗:', error);
      return null;
    }
  }

  /**
   * 從 slug 取得 API 資訊
   */
  private async getAPIInfoFromSlug(slug: string): Promise<MDNDocument | null> {
    try {
      const url = `${this.baseUrl}/${this.locale}/docs/${slug}/index.json`;

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DevAdvisor-MCP/1.0'
        }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return this.parseDocument(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * 解析 MDN 文件
   */
  private parseDocument(data: any): MDNDocument {
    const doc = data.doc || data;

    return {
      title: doc.title || '',
      summary: doc.summary || this.extractSummary(doc),
      url: `${this.baseUrl}/${this.locale}/docs/${doc.slug || doc.mdn_url?.replace('/docs/', '')}`,
      deprecated: doc.deprecated || this.checkDeprecated(doc),
      experimental: doc.experimental || false,
      standardTrack: doc.standard_track !== false,
      browserCompat: this.extractBrowserCompat(doc),
      syntax: this.extractSyntax(doc),
      seeAlso: this.extractSeeAlso(doc)
    };
  }

  /**
   * 提取摘要
   */
  private extractSummary(doc: any): string {
    if (doc.summary) return doc.summary;

    // 嘗試從 body 提取第一段
    const body = doc.body || doc.content || '';
    const match = body.match(/<p[^>]*>(.*?)<\/p>/i);
    if (match) {
      return match[1].replace(/<[^>]+>/g, '').trim();
    }

    return '';
  }

  /**
   * 檢查是否已棄用
   */
  private checkDeprecated(doc: any): boolean {
    const body = (doc.body || doc.content || '').toLowerCase();
    const title = (doc.title || '').toLowerCase();

    return body.includes('deprecated') ||
      body.includes('已棄用') ||
      title.includes('deprecated');
  }

  /**
   * 提取瀏覽器相容性
   */
  private extractBrowserCompat(doc: any): BrowserCompatData | undefined {
    const compat = doc.browserCompat || doc.browser_compat || doc.compat;

    if (!compat) return undefined;

    // 簡化相容性資料
    const result: BrowserCompatData = {};

    if (compat.chrome) result.chrome = this.formatCompatVersion(compat.chrome);
    if (compat.firefox) result.firefox = this.formatCompatVersion(compat.firefox);
    if (compat.safari) result.safari = this.formatCompatVersion(compat.safari);
    if (compat.edge) result.edge = this.formatCompatVersion(compat.edge);
    if (compat.ie) result.ie = this.formatCompatVersion(compat.ie);
    if (compat.opera) result.opera = this.formatCompatVersion(compat.opera);
    if (compat.nodejs) result.nodejs = this.formatCompatVersion(compat.nodejs);

    return Object.keys(result).length > 0 ? result : undefined;
  }

  /**
   * 格式化相容性版本
   */
  private formatCompatVersion(data: any): string | boolean {
    if (typeof data === 'boolean') return data;
    if (typeof data === 'string') return data;
    if (typeof data === 'number') return String(data);
    if (data?.version_added) return String(data.version_added);
    return false;
  }

  /**
   * 提取語法
   */
  private extractSyntax(doc: any): string | undefined {
    const body = doc.body || doc.content || '';
    const match = body.match(/<pre[^>]*class="[^"]*syntax[^"]*"[^>]*>(.*?)<\/pre>/is);
    if (match) {
      return match[1].replace(/<[^>]+>/g, '').trim();
    }
    return undefined;
  }

  /**
   * 提取相關連結
   */
  private extractSeeAlso(doc: any): string[] | undefined {
    const seeAlso = doc.seeAlso || doc.see_also;
    if (Array.isArray(seeAlso)) {
      return seeAlso.slice(0, 5);
    }
    return undefined;
  }

  /**
   * 查詢已棄用的 API
   */
  async searchDeprecatedAPIs(category: string = 'JavaScript'): Promise<MDNSearchResult[]> {
    const queries = [
      `${category} deprecated`,
      `${category} obsolete`,
    ];

    const results: MDNSearchResult[] = [];

    for (const query of queries) {
      const searchResults = await this.search(query, 20);
      results.push(...searchResults);
    }

    // 去重
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.slug)) return false;
      seen.add(r.slug);
      return true;
    });
  }

  /**
   * 取得 API 的現代替代方案
   */
  async getModernAlternative(apiName: string): Promise<{
    deprecated: boolean;
    alternative?: string;
    reason?: string;
    mdnUrl?: string;
  }> {
    const doc = await this.getAPIInfo(apiName);

    if (!doc) {
      return { deprecated: false };
    }

    return {
      deprecated: doc.deprecated || false,
      alternative: this.findAlternativeInSummary(doc.summary),
      reason: doc.deprecated ? `${apiName} 已被標記為棄用` : undefined,
      mdnUrl: doc.url
    };
  }

  /**
   * 從摘要中找出替代方案
   */
  private findAlternativeInSummary(summary: string): string | undefined {
    // 常見的替代方案提示模式
    const patterns = [
      /use\s+([A-Za-z0-9_.]+)\s+instead/i,
      /replaced\s+by\s+([A-Za-z0-9_.]+)/i,
      /建議使用\s+([A-Za-z0-9_.]+)/,
      /改用\s+([A-Za-z0-9_.]+)/,
    ];

    for (const pattern of patterns) {
      const match = summary.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }
}

/**
 * 建立 MDN 服務實例
 */
export function createMDNService(locale: string = 'en-US'): MDNService {
  return new MDNService(locale);
}




