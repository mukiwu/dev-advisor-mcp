#!/usr/bin/env node

/**
 * Dev Advisor MCP Server 啟動腳本
 * 用於解決 npx 執行時的路徑問題
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 嘗試從不同路徑載入 server.js
let serverPath = resolve(__dirname, '../dist/src/server.js');

// 如果不存在，嘗試從 node_modules 載入
if (!existsSync(serverPath)) {
  try {
    // 嘗試從 node_modules 找到包
    const require = createRequire(import.meta.url);
    const pkgPath = require.resolve('@mukiwu/dev-advisor-mcp/package.json');
    const pkgDir = dirname(pkgPath);
    serverPath = resolve(pkgDir, 'dist/src/server.js');

    // 驗證路徑是否存在
    if (!existsSync(serverPath)) {
      throw new Error(`Server file not found at ${serverPath}`);
    }
  } catch (error) {
    // 如果都失敗，使用相對路徑
    serverPath = resolve(__dirname, '../dist/src/server.js');

    // 如果還是不存在，輸出錯誤
    if (!existsSync(serverPath)) {
      console.error(`Error: Cannot find server.js at ${serverPath}`);
      process.exit(1);
    }
  }
}

// 載入並執行 server（使用 file:// URL 格式）
const serverUrl = `file://${serverPath}`;
import(serverUrl).then(module => {
  // 如果模組導出了 DevAdvisorServer，手動啟動它
  if (module.DevAdvisorServer) {
    const server = new module.DevAdvisorServer();
    server.run().catch((error) => {
      console.error('伺服器啟動失敗:', error);
      process.exit(1);
    });
  }
}).catch(error => {
  console.error('Failed to load server:', error);
  process.exit(1);
});

