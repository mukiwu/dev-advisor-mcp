/**
 * AI 服務
 * 支援 OpenAI、Anthropic、Google Gemini
 */

const SYSTEM_PROMPT = `你是一位專精於 Web API 現代化和瀏覽器相容性的資深前端專家。

請分析以下 PR 的程式碼變更，並專注於以下幾個方面：

## 分析重點

### 1. 函式庫替換建議
檢查是否使用了可被原生 Web API 替代的第三方函式庫：
- jQuery → 原生 DOM API (querySelector, classList, fetch 等)
- Moment.js → Date-fns / Dayjs / Temporal API
- Lodash → 原生陣列方法 (map, filter, reduce, find 等)
- Axios → 原生 fetch API
- Bluebird → 原生 Promise
- uuid → crypto.randomUUID()
- 其他可替代的 polyfill 函式庫

### 2. API 現代化建議
檢查是否使用了過時的 API 或語法：
- XMLHttpRequest → fetch API
- var → let/const
- callback → Promise/async-await
- document.write → DOM API
- eval → 安全替代方案
- for 迴圈 → map/filter/forEach
- arguments → rest parameters

### 3. 瀏覽器相容性檢查
指出可能有相容性問題的新 API：
- 標記需要 Polyfill 的 API
- 提供 Polyfill CDN 連結建議
- 建議檢查 Can I Use 的 API

### 4. 現代 Web API 推薦
針對特定需求推薦更好的原生 API：
- 懶加載 → IntersectionObserver
- 元件尺寸監聽 → ResizeObserver
- DOM 變化監聽 → MutationObserver
- 平滑動畫 → requestAnimationFrame / Web Animations API
- 剪貼簿操作 → Clipboard API

## 參考資料

提供建議時，請盡可能引用 MDN Web Docs 的資料作為參考來源，並附上相關連結。
例如：
- fetch API: https://developer.mozilla.org/docs/Web/API/Fetch_API
- IntersectionObserver: https://developer.mozilla.org/docs/Web/API/IntersectionObserver

## 輸出格式

請用繁體中文、條理分明地回覆，包含：
1. **變更摘要**：這個 PR 做了什麼
2. **現代化建議**：具體的改進建議（附程式碼範例和 MDN 連結）
3. **相容性注意事項**：需要注意的瀏覽器相容性問題（附 Can I Use 或 MDN 連結）
4. **整體評估**：這個 PR 的程式碼品質評估`;

// 提供者配置
const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    formatRequest: (model, systemPrompt, userPrompt, apiKey) => ({
      url: 'https://api.openai.com/v1/chat/completions',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4096
      }
    }),
    parseResponse: (response) => response.choices[0].message.content
  },

  anthropic: {
    name: 'Anthropic',
    url: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-sonnet-4-20250514',
    formatRequest: (model, systemPrompt, userPrompt, apiKey) => ({
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: {
        model: model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          { role: 'user', content: userPrompt }
        ]
      }
    }),
    parseResponse: (response) => response.content[0].text
  },

  gemini: {
    name: 'Google Gemini',
    defaultModel: 'gemini-2.5-flash',
    formatRequest: (model, systemPrompt, userPrompt, apiKey) => ({
      url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [{ text: userPrompt }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 8192
        }
      }
    }),
    parseResponse: (response) => {
      // 檢查回應結構
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('Gemini 回應中沒有 candidates');
      }

      const candidate = response.candidates[0];

      // 檢查是否有 content
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        // 檢查是否有錯誤訊息
        if (candidate.finishReason === 'SAFETY') {
          throw new Error('Gemini 因安全性原因拒絕回應');
        }
        throw new Error(`Gemini 回應格式異常: ${JSON.stringify(candidate)}`);
      }

      // 合併所有文字 parts
      const textParts = candidate.content.parts
        .filter(part => part.text)
        .map(part => part.text);

      if (textParts.length === 0) {
        throw new Error('Gemini 回應中沒有文字內容');
      }

      return textParts.join('\n');
    }
  }
};

/**
 * 呼叫 AI API 分析程式碼
 * @param {Object} options
 * @param {string} options.provider - AI 提供者 (openai, anthropic, gemini)
 * @param {string} options.model - 模型名稱（可選，使用預設）
 * @param {string} options.apiKey - API 金鑰
 * @param {string} options.diff - PR 的 diff 內容
 * @returns {Promise<string>} AI 生成的分析報告
 */
export async function analyzeWithAI({ provider, model, apiKey, diff }) {
  const providerConfig = PROVIDERS[provider];

  if (!providerConfig) {
    throw new Error(`不支援的 AI 提供者: ${provider}。支援的提供者: openai, anthropic, gemini`);
  }

  if (!apiKey) {
    throw new Error(`未提供 ${providerConfig.name} 的 API 金鑰`);
  }

  const modelToUse = model || providerConfig.defaultModel;
  const userPrompt = `請分析以下 PR 的程式碼變更：\n\n${diff}`;

  const request = providerConfig.formatRequest(modelToUse, SYSTEM_PROMPT, userPrompt, apiKey);

  try {
    const response = await fetch(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(request.body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${providerConfig.name} API 錯誤 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    return providerConfig.parseResponse(data);
  } catch (error) {
    if (error.message.includes('API 錯誤')) {
      throw error;
    }
    throw new Error(`呼叫 ${providerConfig.name} API 失敗: ${error.message}`);
  }
}

/**
 * 取得支援的提供者列表
 */
export function getSupportedProviders() {
  return Object.keys(PROVIDERS);
}

/**
 * 取得提供者的預設模型
 */
export function getDefaultModel(provider) {
  return PROVIDERS[provider]?.defaultModel || null;
}
