# 安裝與設定指南

## 🚀 快速安裝

### 方法一：透過 npm 安裝 (推薦)

```bash
# 全域安裝
npm install -g @muki/dev-advisor-mcp

# 或本地安裝
npm install @muki/dev-advisor-mcp
```

### 方法二：從源碼安裝

```bash
# 克隆專案
git clone https://github.com/mukiwu/dev-advisor-mcp.git
cd dev-advisor-mcp

# 安裝依賴並建置
npm install
npm run build
```

## ⚙️ Claude Code 整合設定

### 1. 找到 Claude Code 配置檔案

Claude Code 的配置檔案通常位於：
- **macOS**: `~/.claude/config.json`
- **Windows**: `%USERPROFILE%\.claude\config.json`
- **Linux**: `~/.claude/config.json`

如果檔案不存在，請建立一個新的。

### 2. 添加 MCP Server 設定

編輯配置檔案，加入開發決策顧問：

#### 全域安裝版本：
```json
{
  "mcpServers": {
    "dev-advisor": {
      "command": "dev-advisor"
    }
  }
}
```

#### 本地安裝版本：
```json
{
  "mcpServers": {
    "dev-advisor": {
      "command": "node",
      "args": ["./node_modules/@muki/dev-advisor-mcp/dist/src/server.js"]
    }
  }
}
```

#### 從源碼運行版本：
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

### 3. 重啟 Claude Code

設定完成後，重啟 Claude Code 讓新的 MCP Server 生效。

## ✅ 驗證安裝

在 Claude Code 中測試以下指令：

```
請使用 analyze_modernization 分析我的專案 ./my-project
```

如果看到類似以下輸出，表示安裝成功：
```
🔍 正在分析專案程式碼現代化機會...
📊 掃描檔案數量: X 個檔案
🚀 發現建議數量: Y 項
...
```

## 🔧 故障排除

### 常見問題

**Q: Claude Code 找不到 dev-advisor 指令？**
A: 確認已全域安裝套件，或使用完整路徑設定。

**Q: 權限錯誤？**
A: 在 Unix 系統上確保 server.js 有執行權限：
```bash
chmod +x /path/to/server.js
```

**Q: 模組載入失敗？**
A: 確認 Node.js 版本 >= 18，並正確安裝依賴。

### 調試設定

啟用詳細日誌：
```json
{
  "mcpServers": {
    "dev-advisor": {
      "command": "node",
      "args": ["/path/to/dev-advisor-mcp/dist/src/server.js"],
      "env": {
        "DEBUG": "dev-advisor:*"
      }
    }
  }
}
```

### 手動測試

直接測試 MCP Server：
```bash
# 運行測試腳本
node /path/to/dev-advisor-mcp/test-server.js

# 運行分析測試
node /path/to/dev-advisor-mcp/test-analysis.js
```

## 🔄 更新

### npm 安裝版本：
```bash
npm update -g @muki/dev-advisor-mcp
```

### 源碼版本：
```bash
cd /path/to/dev-advisor-mcp
git pull origin main
npm install
npm run build
```

## �‍💻 開發者指南

### 編譯 GitHub Action

如果你修改了 `action/` 目錄下的檔案或相關的分析器程式碼，需要重新編譯 GitHub Action：

```bash
# 編譯 TypeScript 並打包 Action
npm run build:action
```

這個指令會：
1. 執行 `tsc` 編譯 TypeScript
2. 使用 `@vercel/ncc` 將 `action/index.js` 和所有依賴打包成 `action/dist/index.js`

### 發布新版本

發布新版本時，請遵循以下步驟：

```bash
# 1. 更新 package.json 中的版本號
# 2. 編譯 Action
npm run build:action

# 3. 提交變更
git add -A
git commit -m "chore: release vX.X.X"
git push origin main

# 4. 建立版本標籤
git tag vX.X.X
git tag -f v1  # 更新 major version tag
git push origin vX.X.X
git push origin v1 -f
```

> **注意**：`v1` tag 應該永遠指向最新的 v1.x.x 版本，讓使用 `@v1` 的用戶自動獲得更新。

## �📞 支援

如果遇到問題，請：

1. 檢查 [故障排除](#故障排除) 章節
2. 查看 [USAGE.md](./USAGE.md) 使用說明
3. 提交 Issue 到 GitHub repository

---

安裝完成後，您就可以在 Claude Code 中使用智慧程式碼現代化分析功能了！🎉

