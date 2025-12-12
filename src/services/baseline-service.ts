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
  since?: string; // 成為 newly available 的日期
  widelySince?: string; // 成為 widely available 的日期
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
  caniuse?: string; // Can I Use ID
  mdn?: {
    url?: string;
    slug?: string;
  };
  spec?: {
    url?: string;
    name?: string;
  };
  compat?: {
    chrome?: { since?: string; flags?: boolean };
    firefox?: { since?: string; flags?: boolean };
    safari?: { since?: string; flags?: boolean };
    edge?: { since?: string; flags?: boolean };
  };
}

/**
 * Baseline 服務
 */
export class BaselineService {
  private apiBaseUrl = 'https://api.webstatus.dev/v1';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheDuration = 24 * 60 * 60 * 1000; // 24 小時

  /**
   * 取得所有功能列表
   */
  async getAllFeatures(): Promise<WebFeature[]> {
    const cacheKey = 'all-features';
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/features/`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DevAdvisor-MCP/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`API 回應錯誤: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const features: WebFeature[] = Array.isArray(data) ? data : (data.features || []);

      this.cache.set(cacheKey, { data: features, timestamp: Date.now() });
      return features;
    } catch (error) {
      console.error('取得 Baseline 功能列表失敗:', error);
      throw error;
    }
  }

  /**
   * 根據 ID 或名稱搜尋功能
   */
  async searchFeature(query: string): Promise<WebFeature[]> {
    const allFeatures = await this.getAllFeatures();
    const lowerQuery = query.toLowerCase();

    return allFeatures.filter(feature => {
      const nameMatch = feature.name?.toLowerCase().includes(lowerQuery);
      const idMatch = feature.id?.toLowerCase().includes(lowerQuery);
      const descMatch = feature.description?.toLowerCase().includes(lowerQuery);
      const categoryMatch = feature.category?.toLowerCase().includes(lowerQuery);

      return nameMatch || idMatch || descMatch || categoryMatch;
    });
  }

  /**
   * 根據 ID 取得單一功能
   */
  async getFeature(featureId: string): Promise<WebFeature | null> {
    const cacheKey = `feature-${featureId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/features/${encodeURIComponent(featureId)}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DevAdvisor-MCP/1.0'
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`API 回應錯誤: ${response.status} ${response.statusText}`);
      }

      const feature: WebFeature = await response.json();
      this.cache.set(cacheKey, { data: feature, timestamp: Date.now() });
      return feature;
    } catch (error) {
      console.error(`取得功能 ${featureId} 失敗:`, error);
      return null;
    }
  }

  /**
   * 取得 Baseline 狀態標籤
   */
  getBaselineLabel(status: BaselineStatus): string {
    const labels: Record<BaselineStatus, string> = {
      'limited': 'Limited availability',
      'newly': 'Newly available',
      'widely': 'Widely available'
    };
    return labels[status] || status;
  }

  /**
   * 取得 Baseline 狀態描述
   */
  getBaselineDescription(status: BaselineStatus): string {
    const descriptions: Record<BaselineStatus, string> = {
      'limited': '尚未在所有核心瀏覽器中支援，建議謹慎使用或提供替代方案',
      'newly': '所有核心瀏覽器都支援，可安全使用（Chrome、Edge、Firefox、Safari）',
      'widely': '已廣泛支援至少 30 個月，非常穩定可靠'
    };
    return descriptions[status] || '';
  }

  /**
   * 取得 Baseline 狀態圖示
   */
  getBaselineIcon(status: BaselineStatus): string {
    const icons: Record<BaselineStatus, string> = {
      'limited': '⚠️',
      'newly': '✅',
      'widely': '🟢'
    };
    return icons[status] || '❓';
  }

  /**
   * 格式化 Baseline 資訊
   */
  formatBaselineInfo(feature: WebFeature): string {
    if (!feature.baseline) {
      return '❓ Baseline 狀態未知';
    }

    const { status, since, widelySince } = feature.baseline;
    const icon = this.getBaselineIcon(status);
    const label = this.getBaselineLabel(status);
    const description = this.getBaselineDescription(status);

    let info = `${icon} **${label}**\n\n${description}\n\n`;

    if (status === 'newly' && since) {
      info += `自 ${since} 起成為 newly available\n\n`;
    }

    if (status === 'widely' && widelySince) {
      info += `自 ${widelySince} 起成為 widely available\n\n`;
    }

    return info;
  }

  /**
   * 檢查功能是否可安全使用（newly 或 widely available）
   */
  isSafeToUse(feature: WebFeature): boolean {
    if (!feature.baseline) {
      return false;
    }
    return feature.baseline.status === 'newly' || feature.baseline.status === 'widely';
  }

  /**
   * 取得建議訊息
   */
  getRecommendation(feature: WebFeature): string {
    if (!feature.baseline) {
      return '⚠️ Baseline 狀態未知，建議查閱 Can I Use 或 MDN 文件確認相容性';
    }

    const { status } = feature.baseline;

    switch (status) {
      case 'widely':
        return '✅ 此功能已廣泛支援，可放心使用，無需 polyfill';
      case 'newly':
        return '✅ 此功能在所有核心瀏覽器中都支援，可安全使用';
      case 'limited':
        return '⚠️ 此功能尚未在所有核心瀏覽器中支援，建議：\n- 檢查目標瀏覽器支援情況\n- 考慮提供替代方案或 polyfill\n- 使用功能檢測（feature detection）';
      default:
        return '❓ Baseline 狀態不明';
    }
  }
}
