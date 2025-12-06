# Claude Code MCP Server 配置

## 開發決策顧問 MCP Server

這個專案是一個智慧的程式碼現代化分析工具，可以：

### 🔍 主要功能

1. **程式碼現代化分析** (`analyze_modernization`)
   - 掃描 JavaScript/TypeScript 檔案，識別可被原生 API 替代的函式庫
   - 找出可以移除的第三方依賴，改用瀏覽器原生 Web API
   - 檢測過時的程式碼模式（var、callback、IIFE、傳統 for 迴圈）
   - 提供風險評估和預估工時

2. **MDN 文件即時查詢** (`search_mdn`)
   - 搜尋 MDN Web Docs 取得最新 API 資訊
   - 顯示 API 棄用狀態和實驗性標記
   - 取得語法說明和瀏覽器相容性
   - 支援多語言（en-US, zh-TW, zh-CN）

3. **瀏覽器相容性檢查** (`check_browser_support`)
   - 使用 Can I Use 資料庫即時查詢
   - 顯示各瀏覽器的支援版本
   - 提供 Polyfill 建議和 CDN 連結
   - 支援自訂目標瀏覽器版本

### 🛠️ 可用工具

#### `analyze_modernization`
分析專案程式碼的現代化機會

**適用於以下自然語言查詢：**
- "分析 src 目錄下的 JavaScript 和 TypeScript 檔案，檢查這些 function 有沒有可以減輕 npm bundle，而改用瀏覽器原生的 web api"
- "掃描我的程式碼，找出過時的函式庫"
- "檢查是否還在使用 jQuery、Moment.js 等可以現代化的依賴"
- "分析程式碼中的 var 宣告、XMLHttpRequest 等過時模式"
- "生成程式碼現代化報告"

**參數：**
- `projectPath`: 專案目錄路徑 (必填)
- `includePatterns`: 要掃描的檔案模式（如 `["src/**/*.{js,ts,jsx,tsx}"]`）
- `excludePatterns`: 要排除的檔案模式（如 `["node_modules/**", "dist/**"]`）
- `reportFormat`: 報告格式（`markdown`, `json`, `html`, `text`）

#### `search_mdn`
搜尋 MDN Web Docs 文件

**適用於以下自然語言查詢：**
- "查詢 fetch API 的用法"
- "Promise.allSettled 怎麼用？"
- "IntersectionObserver 的 MDN 文件"
- "這個 API 是否已經棄用了？"
- "幫我找 Array.prototype.flat 的說明"

**參數：**
- `query`: 搜尋關鍵字 (必填)
- `limit`: 返回結果數量（預設 5）
- `locale`: 語言（`en-US`, `zh-TW`, `zh-CN`）

#### `check_browser_support`
檢查 Web API 的瀏覽器相容性

**適用於以下自然語言查詢：**
- "檢查 CSS Grid 的瀏覽器支援"
- "IntersectionObserver 在 Safari 12 有支援嗎？"
- "fetch 需要 polyfill 嗎？"
- "WebGL 的瀏覽器相容性"
- "ResizeObserver 什麼版本開始支援？"

**參數：**
- `feature`: 功能名稱（如 `"fetch"`, `"css-grid"`, `"webgl"`）(必填)
- `targetBrowsers`: 目標瀏覽器版本（如 `{ chrome: "80", safari: "12" }`）

#### `recommend_api_combination` (開發中)
根據自然語言需求推薦最佳 API 技術組合

#### `analyze_compatibility` (開發中)
分析 API 相容性風險並推薦 polyfill 方案

### 📊 使用範例

**當用戶提到以下關鍵詞時，應該調用對應工具：**

| 關鍵詞 | 工具 |
|--------|------|
| 現代化、modernization、bundle 大小、過時函式庫 | `analyze_modernization` |
| MDN、API 文件、語法說明、棄用狀態 | `search_mdn` |
| 瀏覽器支援、Can I Use、polyfill、相容性 | `check_browser_support` |

### 🎯 智慧調用邏輯

#### 範例 1：程式碼現代化分析
對於查詢 "分析 src 目錄下的 JavaScript 和 TypeScript 檔案，檢查這些 function 有沒有可以減輕 npm bundle，而改用瀏覽器原生的 web api"，應該調用：

```json
{
  "tool": "analyze_modernization",
  "arguments": {
    "projectPath": ".",
    "includePatterns": ["src/**/*.js", "src/**/*.ts", "src/**/*.jsx", "src/**/*.tsx"],
    "excludePatterns": ["node_modules/**", "dist/**", "build/**"],
    "reportFormat": "markdown"
  }
}
```

#### 範例 2：MDN 文件查詢
對於查詢 "Promise.allSettled 怎麼用"，應該調用：

```json
{
  "tool": "search_mdn",
  "arguments": {
    "query": "Promise.allSettled",
    "limit": 5
  }
}
```

#### 範例 3：瀏覽器相容性檢查
對於查詢 "IntersectionObserver 在 Safari 13 有支援嗎"，應該調用：

```json
{
  "tool": "check_browser_support",
  "arguments": {
    "feature": "IntersectionObserver",
    "targetBrowsers": {
      "safari": "13"
    }
  }
}
```

### 📦 可用資源 (Resources)

可以透過 MCP Resources 讀取規則資料：
- `devadvisor://rules/libraries` - 函式庫現代化規則
- `devadvisor://rules/apis` - API 現代化規則
- `devadvisor://rules/all` - 完整規則資料庫
- `devadvisor://stats` - 規則統計資訊

### 💡 可用提示模板 (Prompts)

- `analyze-project` - 分析專案的程式碼現代化機會
- `migrate-library` - 取得特定函式庫的遷移指南
- `modernize-pattern` - 取得程式碼模式的現代化建議
- `quick-wins` - 取得低風險、高效益的快速改善建議

### 📋 支援的現代化規則

**函式庫規則（18 個）：**
jQuery, Moment.js, Lodash, Underscore, Bluebird, Async.js, uuid, node-fetch, Request, left-pad, core-js, is-number, is-array, object-assign, array-flatten, classnames, querystring

**API 規則（16 個）：**
XMLHttpRequest, setTimeout (callback), document.getElementById, attachEvent, var, for, document.write, eval, with, arguments, innerHTML, new Array, new Object, substr, Date.parse

這個工具會分析程式碼中可以被原生 Web API 替代的第三方函式庫，提供減少 bundle 大小的具體建議，並可即時查詢 MDN 和 Can I Use 取得最新的 API 資訊。
