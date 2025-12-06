# 開發決策顧問 MCP Server

智慧開發決策顧問工具，提供程式碼現代化分析、瀏覽器相容性檢查、MDN 文件查詢等功能。透過 MCP (Model Context Protocol) 與 AI 工具深度整合。

## ✨ 功能特色

### 🔄 程式碼現代化分析器
- 掃描 JavaScript/TypeScript 專案，找出可被原生 API 替代的函式庫
- 檢測過時的程式碼模式（var、callback、IIFE、傳統 for 迴圈）
- 提供重構建議和預估效能提升
- 生成對比程式碼範例
- 支援 ES Module 和 CommonJS

### 🔍 MDN 文件即時查詢
- 搜尋 MDN Web Docs 取得最新 API 資訊
- 顯示 API 棄用狀態和實驗性標記
- 取得語法說明和瀏覽器相容性
- 支援多語言（en-US, zh-TW, zh-CN）

### 🌐 Can I Use 瀏覽器相容性檢查
- 即時查詢 Web API 的瀏覽器支援狀態
- 顯示各瀏覽器的支援版本
- 提供 Polyfill 建議和 CDN 連結
- 支援自訂目標瀏覽器版本

### 📚 豐富的規則資料庫
- **18 個函式庫規則**：jQuery、Moment.js、Lodash、Axios、Bluebird 等
- **16 個 API 規則**：XMLHttpRequest、eval、document.write、var 等
- 可透過設定檔自訂規則

## 🚀 安裝

### 從 npm 安裝

```bash
npm install -g @muki/dev-advisor-mcp
```

### 從原始碼安裝

```bash
git clone https://github.com/mukiwu/dev-advisor-mcp.git
cd dev-advisor-mcp
npm install
npm run build
```

## 🔧 GitHub Actions 整合

### 快速開始

在您的專案中創建 `.github/workflows/dev-advisor.yml`：

```yaml
name: Dev Advisor Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - uses: mukiwu/dev-advisor-mcp@v1
        with:
          project-path: '.'
          enable-modernization: true
          enable-compatibility: true
          comment-on-pr: true
```

### 輸入參數

| 參數 | 說明 | 預設值 | 必填 |
|------|------|--------|------|
| `project-path` | 專案目錄路徑 | `.` | ❌ |
| `include-patterns` | 包含的檔案模式（JSON 陣列） | `["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]` | ❌ |
| `exclude-patterns` | 排除的檔案模式（JSON 陣列） | `["node_modules/**", "dist/**", "build/**"]` | ❌ |
| `browserslist-config` | browserslist 配置字串 | `""` | ❌ |
| `enable-modernization` | 啟用現代化分析 | `true` | ❌ |
| `enable-compatibility` | 啟用相容性分析 | `true` | ❌ |
| `enable-browser-check` | 啟用瀏覽器支援檢查 | `true` | ❌ |
| `github-token` | GitHub Token | `${{ github.token }}` | ❌ |
| `comment-on-pr` | 是否在 PR 中留言 | `true` | ❌ |

### 進階使用

```yaml
- uses: mukiwu/dev-advisor-mcp@v1
  with:
    project-path: './src'
    include-patterns: '["src/**/*.js", "src/**/*.ts"]'
    exclude-patterns: '["**/*.test.ts", "**/*.spec.ts"]'
    browserslist-config: 'last 2 versions, > 1%, not dead'
    enable-modernization: true
    enable-compatibility: true
    enable-browser-check: false
    comment-on-pr: true
```

### 輸出

Action 會產生以下輸出：

- `modernization-report`: 現代化分析報告（Markdown）
- `compatibility-report`: 相容性分析報告（Markdown）
- `summary`: 分析摘要（JSON）

### 完整範例

查看 [examples/pr-check.yml](examples/pr-check.yml) 取得完整範例。

## ⚙️ MCP 配置

### Claude Desktop 配置

編輯 `~/.claude/config.json`：

```json
{
  "mcpServers": {
    "dev-advisor": {
      "command": "node",
      "args": ["/path/to/dev-advisor-mcp/dist/src/server.js"]
    }
  }
}
```

### Cursor IDE 配置

在 Cursor 設定中加入 MCP Server：

```json
{
  "mcpServers": {
    "dev-advisor": {
      "command": "node",
      "args": ["/path/to/dev-advisor-mcp/dist/src/server.js"]
    }
  }
}
```

## 🛠️ 可用工具 (Tools)

### 1. `analyze_modernization`

分析專案程式碼的現代化機會。

**參數：**
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `projectPath` | string | ✅ | 專案目錄路徑 |
| `includePatterns` | string[] | ❌ | 掃描檔案模式，預設 `["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]` |
| `excludePatterns` | string[] | ❌ | 排除檔案模式，預設 `["node_modules/**", "dist/**"]` |
| `reportFormat` | string | ❌ | 報告格式：`markdown`、`json`、`html`、`text` |

**使用範例：**
```
分析 ./src 目錄的程式碼，找出可以用原生 Web API 替代的函式庫
```

**輸出內容：**
- 執行摘要（檔案數、建議數、效能提升預估）
- 風險評估（破壞性變更、預估工時）
- 函式庫替換建議（jQuery → 原生 DOM API）
- API 現代化建議（XMLHttpRequest → fetch）
- 語法現代化建議（var → let/const）
- 模式現代化建議（callback → Promise/async-await）

---

### 2. `search_mdn`

搜尋 MDN Web Docs 文件，取得最新的 API 資訊。

**參數：**
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `query` | string | ✅ | 搜尋關鍵字，如 `"fetch"`、`"Array.prototype.includes"` |
| `limit` | number | ❌ | 返回結果數量，預設 `5` |
| `locale` | string | ❌ | 語言：`en-US`、`zh-TW`、`zh-CN`，預設 `en-US` |

**使用範例：**
```
查詢 Promise.allSettled 的 MDN 文件
幫我找 IntersectionObserver 的用法
```

**輸出內容：**
- 搜尋結果列表
- API 詳細說明和語法
- 棄用/實驗性狀態標記
- 瀏覽器相容性資訊
- MDN 文件連結

---

### 3. `check_browser_support`

使用 Can I Use 資料庫檢查 Web API 的瀏覽器相容性。

**參數：**
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `feature` | string | ✅ | Web API 功能名稱，如 `"fetch"`、`"css-grid"`、`"webgl"` |
| `targetBrowsers` | object | ❌ | 目標瀏覽器版本，預設 `{ chrome: "90", firefox: "88", safari: "14", edge: "90" }` |

**使用範例：**
```
檢查 CSS Grid 的瀏覽器支援情況
ResizeObserver 在 Safari 12 有支援嗎？
```

**輸出內容：**
- 功能概覽和全球支援率
- 目標瀏覽器相容性報告
- 各瀏覽器支援版本詳情
- Polyfill 建議和 CDN 連結
- Can I Use 和 MDN 連結

---

### 4. `recommend_api_combination`

根據自然語言描述的需求，推薦最佳的 Web API 技術組合。

**參數：**
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `requirement` | string | ✅ | 功能需求描述，如 `"背景擷取影片畫面並分析"` |
| `targetBrowsers` | string[] | ❌ | 目標瀏覽器，如 `["chrome>=90", "firefox>=88"]`，預設現代瀏覽器 |
| `performanceRequirements` | string | ❌ | 效能需求：`low`、`medium`、`high`，預設 `medium` |

**使用範例：**
```
我想實作懶加載圖片功能，推薦用什麼 API？
幫我找適合做即時通訊的 Web API
```

**輸出內容：**
- 推薦 API 列表（按類別分組）
- 每個 API 的說明和程式碼範例
- 瀏覽器相容性報告
- 可取代的第三方函式庫
- Polyfill 建議
- 實作建議（可直接使用 / 需要 Polyfill / 需要替代方案）

**支援的 API 類別：**
- HTTP 請求：Fetch API、AbortController
- DOM 操作：querySelector、classList、MutationObserver
- 觀察者：IntersectionObserver、ResizeObserver
- 儲存：localStorage、sessionStorage、IndexedDB
- 媒體：getUserMedia、MediaRecorder、Web Audio API
- 圖形：Canvas API、WebGL
- 非同步：Promise、async/await、Web Workers
- 通訊：WebSocket、Server-Sent Events、BroadcastChannel
- 動畫：requestAnimationFrame、Web Animations API
- 其他：Clipboard API、Geolocation、Notification API

---

### 5. `analyze_compatibility`

分析專案中使用的 API 與目標瀏覽器的相容性，自動偵測 browserslist 配置。

**參數：**
| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `projectPath` | string | ✅ | 專案目錄路徑 |
| `browserslistConfig` | string | ❌ | browserslist 查詢字串，如 `"last 2 versions"`，預設讀取專案配置 |
| `reportFormat` | string | ❌ | 報告格式：`markdown`、`json`、`html`，預設 `markdown` |

**使用範例：**
```
分析這個專案的瀏覽器相容性風險
檢查專案是否支援 IE11
幫我找出需要 polyfill 的 API
```

**輸出內容：**
- 執行摘要（API 數量、相容性百分比）
- 目標瀏覽器列表（從 browserslist 自動偵測）
- 相容性問題（按嚴重程度分類）
  - 🔴 嚴重：多數瀏覽器不支援
  - 🟠 高風險：部分瀏覽器不支援
  - 🟡 中風險：需要 polyfill
  - 🟢 低風險：少量瀏覽器需要 polyfill
- Polyfill 建議（CDN 連結、npm 套件）
- 統一 Polyfill 方案（polyfill.io 整合）

**支援的 Browserslist 配置：**
- 自動讀取 `package.json` 的 `browserslist` 欄位
- 自動讀取 `.browserslistrc` 檔案
- 或直接傳入查詢字串，如 `"> 1%, last 2 versions, not dead"`

---

## 📦 可用資源 (Resources)

MCP Resources 讓 AI 可以直接讀取規則資料：

| URI | 說明 |
|-----|------|
| `devadvisor://rules/libraries` | 所有函式庫現代化規則 |
| `devadvisor://rules/apis` | 所有 API 現代化規則 |
| `devadvisor://rules/all` | 完整規則資料庫 |
| `devadvisor://stats` | 規則統計資訊 |

## 💡 可用提示模板 (Prompts)

預定義的分析提示模板：

| 名稱 | 說明 |
|------|------|
| `analyze-project` | 分析專案的程式碼現代化機會 |
| `migrate-library` | 取得特定函式庫的遷移指南 |
| `modernize-pattern` | 取得程式碼模式的現代化建議 |
| `quick-wins` | 取得低風險、高效益的快速改善建議 |

## 📋 支援的現代化規則

### 函式庫替換 (18 個規則)

| 函式庫 | 現代替代方案 | Bundle 減少 |
|--------|-------------|-------------|
| jQuery | 原生 DOM API | ~85KB |
| Moment.js | Date-fns / Dayjs / Temporal | ~65KB |
| Lodash | 原生 JavaScript 方法 | ~50KB |
| Axios | 原生 fetch (簡單場景) | ~15KB |
| Bluebird | 原生 Promise | ~45KB |
| Async.js | async/await | ~20KB |
| uuid | crypto.randomUUID() | ~8KB |
| node-fetch | 原生 fetch (Node.js 18+) | ~15KB |
| querystring | URLSearchParams | ~5KB |
| object-assign | Object.assign / 展開運算子 | ~2KB |
| array-flatten | Array.prototype.flat() | ~2KB |
| is-number | typeof + Number.isFinite() | ~1KB |
| is-array | Array.isArray() | ~1KB |
| left-pad | String.prototype.padStart() | ~1KB |

### API 現代化 (16 個規則)

| 舊 API | 現代替代方案 | 類型 |
|--------|-------------|------|
| XMLHttpRequest | fetch API | 網路請求 |
| document.write | DOM API | DOM 操作 |
| eval | Function / JSON.parse | 安全性 |
| with | 解構賦值 | 語法 |
| var | let / const | 變數宣告 |
| arguments | Rest parameters | 函式參數 |
| innerHTML | textContent / DOM API | 安全性 |
| attachEvent | addEventListener | 事件處理 |
| substr | substring / slice | 字串處理 |
| for 迴圈 | map / filter / forEach | 迭代 |
| for...in (陣列) | for...of / 陣列方法 | 迭代 |
| new Array() | 陣列字面量 [] | 建構 |
| new Object() | 物件字面量 {} | 建構 |
| Date 字串解析 | 明確日期格式 / Temporal | 日期處理 |

## 🔧 設定檔

在專案根目錄建立 `.devadvisorrc.json`：

```json
{
  "extends": "recommended",
  "include": ["src/**/*.{js,ts,jsx,tsx}"],
  "exclude": ["node_modules/**", "dist/**", "**/*.test.ts"],
  "rules": {
    "builtin": {
      "jquery": { "enabled": true, "severity": "high" },
      "var": { "enabled": true, "severity": "low" }
    },
    "customLibraries": {
      "my-old-lib": {
        "name": "my-old-lib",
        "modernAlternative": "my-new-lib",
        "reason": "內部函式庫升級"
      }
    }
  },
  "report": {
    "format": "markdown",
    "maxSuggestionsPerFile": 10
  },
  "performance": {
    "useCache": true,
    "parallel": true
  }
}
```

## 🧪 開發

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置
npm run build

# 執行測試
npm test

# 測試分析功能
node test-analysis.js
```

## 📁 專案結構

```
dev-advisor-mcp/
├── src/
│   ├── server.ts              # MCP Server 主程式
│   ├── analyzers/
│   │   ├── modernization.ts   # 程式碼現代化分析器
│   │   └── compatibility.ts   # API 相容性分析器
│   ├── parsers/
│   │   └── index.ts           # AST 解析器 (ES Module + CommonJS)
│   ├── services/
│   │   ├── mdn-service.ts     # MDN API 服務
│   │   └── caniuse-service.ts # Can I Use API 服務
│   ├── data/
│   │   ├── modernization-rules.ts   # 現代化規則資料庫
│   │   └── api-recommendations.ts   # API 推薦知識庫
│   ├── config/
│   │   └── index.ts           # 設定檔載入
│   ├── utils/
│   │   ├── report-formatter.ts # 報告格式化器
│   │   ├── cache.ts           # 快取機制
│   │   └── ast-utils.ts       # AST 工具函式
│   └── __tests__/             # 單元測試
├── test-code/                 # 測試用程式碼
├── cli/                       # CLI 工具 (規劃中)
└── web/                       # Web 介面 (規劃中)
```

## 🎯 使用情境

### 情境 1：分析舊專案的現代化機會

```
請分析 ./legacy-project 專案，找出可以用現代 Web API 替代的函式庫，
幫我減少 bundle 大小
```

### 情境 2：查詢某個 API 是否安全使用

```
document.write 還能用嗎？有什麼替代方案？
```

### 情境 3：檢查新 API 的瀏覽器支援

```
我想用 IntersectionObserver，但需要支援 Safari 13，可以嗎？
需要 polyfill 嗎？
```

### 情境 4：遷移特定函式庫

```
我想把專案中的 Moment.js 換掉，有什麼建議？
```

### 情境 5：分析專案相容性

```
幫我分析這個專案的瀏覽器相容性，我們需要支援 Chrome 80+、Firefox 78+、Safari 13+
```

### 情境 6：尋找適合的 Web API

```
我需要實作：使用者在背景時仍能接收通知，有什麼原生 API 可以用？
```

## 📊 輸出範例

### Markdown 報告範例

```markdown
# 程式碼現代化分析報告

## 📊 執行摘要
- **掃描檔案數量**: 42 個檔案
- **發現建議數量**: 15 項
- **潛在效能提升**: 25%
- **檔案大小減少**: 150KB

## ⚠️ 風險評估
- **整體風險等級**: 🟡 MEDIUM
- **預估工時**: 16 小時

## 🚀 主要現代化建議

### 📚 函式庫替換
#### 升級 moment 到 Date-fns/Dayjs
Moment.js 體積過大且不支援 tree-shaking...
```

## 🔮 未來規劃

- [x] ~~智慧 API 組合查詢引擎~~ ✅ 已完成 (`recommend_api_combination`)
- [x] ~~基於 browserslist 的深度相容性分析~~ ✅ 已完成 (`analyze_compatibility`)
- [x] ~~GitHub Actions 整合~~ ✅ 已完成
- [ ] CLI 獨立工具
- [ ] Web 視覺化介面
- [ ] 自動重構程式碼轉換
- [ ] VS Code / Cursor 擴充套件
- [ ] 更多 API 規則覆蓋
- [ ] 自訂規則設定介面

## 📄 License

MIT

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

**開發決策顧問** - 讓程式碼現代化變得更智慧、更安全！ 🚀
