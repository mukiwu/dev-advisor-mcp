# 開發決策顧問使用指南

## 🚀 快速開始

### 1. 安裝和建置
```bash
# 安裝依賴
npm install

# 建置專案
npm run build

# 測試功能
node test-server.js
node test-analysis.js
```

### 2. 作為 MCP Server 使用

在您的 Claude 配置中添加此 MCP Server：

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

### 3. 開發模式運行
```bash
# 開發模式 (使用 tsx)
npm run dev
```

## 🔧 可用工具

### 1. analyze_modernization
分析專案程式碼，找出現代化機會

**參數：**
- `projectPath`: 專案目錄路徑 (必填)
- `includePatterns`: 要掃描的檔案模式 (可選)
- `excludePatterns`: 要排除的檔案模式 (可選)
- `reportFormat`: 報告格式 - `markdown`, `json`, `html`, `text` (可選，預設: `markdown`)

**範例：**
```
analyze_modernization --projectPath ./my-project --reportFormat markdown
```

**輸出：**
- 現代化建議清單
- 風險評估
- 效能影響分析
- 實作難度評估
- 詳細的程式碼對比

### 2. recommend_api_combination
根據自然語言需求推薦 API 技術組合 (開發中)

**參數：**
- `requirement`: 功能需求描述 (必填)
- `targetBrowsers`: 目標瀏覽器支援 (可選)
- `performanceRequirements`: 效能需求等級 (可選)

### 3. analyze_compatibility
分析 API 相容性風險並推薦 polyfill 方案 (開發中)

**參數：**
- `projectPath`: 專案目錄路徑 (必填)
- `browserslistConfig`: browserslist 配置 (可選)
- `reportFormat`: 報告格式 (可選)

## 📊 分析能力

### 支援的現代化模式

#### 🔄 API 現代化
- `XMLHttpRequest` → `fetch API`
- `setTimeout` 回調 → Promise 化
- `var` → `let/const`
- 傳統 for 迴圈 → Array methods

#### 📚 函式庫替換
- `jQuery` → 原生 DOM API
- `Moment.js` → Date-fns/Dayjs
- `Lodash` → 原生 JavaScript 方法
- `Request` → node-fetch/axios
- 過時的 polyfills

#### ✨ 語法現代化
- ES5 語法 → ES6+ 語法
- 回調函式 → Promise/async-await
- IIFE → ES6 模組

### 分析指標

- **效能提升百分比**: 預估的效能改善
- **檔案大小減少**: bundle 大小減少估算
- **維護性評分**: 1-5 分的維護性改善
- **實作難度**: trivial/simple/moderate/complex
- **破壞性變更**: 是否會破壞現有功能
- **風險等級**: low/medium/high

## 📁 專案結構

```
dev-advisor-mcp/
├── src/
│   ├── analyzers/          # 分析器
│   │   └── modernization.ts   # 程式碼現代化分析器
│   ├── parsers/            # AST 解析器
│   │   └── index.ts           # TypeScript/JavaScript 解析器
│   ├── data/               # 規則資料庫
│   │   └── modernization-rules.ts  # 現代化規則
│   ├── utils/              # 工具函式
│   │   └── report-formatter.ts     # 報告格式化器
│   └── server.ts           # MCP Server 主程式
├── test-code/              # 測試用程式碼
├── cli/                    # CLI 工具 (未來功能)
└── web/                    # Web 介面 (未來功能)
```

## 🎯 使用範例

### 分析 React 專案
```
analyze_modernization --projectPath ./my-react-app --includePatterns ["src/**/*.{js,jsx,ts,tsx}"] --excludePatterns ["node_modules/**", "build/**"]
```

### 分析 Node.js 專案
```
analyze_modernization --projectPath ./my-node-app --includePatterns ["**/*.js"] --reportFormat json
```

### 生成 HTML 報告
```
analyze_modernization --projectPath ./project --reportFormat html
```

## 🔮 未來功能

- **智慧 API 組合查詢引擎**: 完整實作自然語言需求分析
- **相容性與 Polyfill 智慧報告**: 基於 browserslist 的深度分析
- **CLI 獨立工具**: 不依賴 MCP 的命令列版本
- **Web 視覺化介面**: 圖形化的分析報告展示
- **自動重構建議**: 提供自動程式碼轉換
- **團隊協作功能**: 多人專案的現代化規劃

## 💡 最佳實踐

1. **逐步現代化**: 優先處理低風險、高影響的改善
2. **測試驅動**: 每次改變後運行測試套件
3. **持續監控**: 定期分析專案的現代化機會
4. **團隊協調**: 與團隊討論破壞性變更的時機

## 🐛 故障排除

### 常見問題

**Q: 解析失敗？**
A: 檢查檔案路徑和權限，確認專案目錄存在。

**Q: 建議太少？**
A: 調整 includePatterns 和 excludePatterns，確保掃描到目標檔案。

**Q: 報告格式錯誤？**
A: 確認 reportFormat 參數使用有效值：markdown、json、html、text。

### 調試模式
```bash
# 啟用詳細日誌
DEBUG=dev-advisor:* npm run dev
```

---

**開發決策顧問** - 讓程式碼現代化變得更智慧、更安全！