#!/usr/bin/env node

/**
 * Dev Advisor MCP Server 啟動腳本
 * 用於解決 npx 執行時的路徑問題
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 嘗試從不同路徑載入 server.js
let serverPath = resolve(__dirname, '../dist/src/server.js');

// 如果不存在，嘗試從 node_modules 載入
if (!existsSync(serverPath)) {
  try {
    // 使用 import.meta.resolve (Node.js 20.6+)
    const resolved = import.meta.resolve('@mukiwu/dev-advisor-mcp/dist/src/server.js');
    serverPath = resolved.replace('file://', '');
  } catch (error) {
    // 如果都失敗，使用相對路徑
    serverPath = resolve(__dirname, '../dist/src/server.js');
  }
}

// 載入並執行 server
import(serverPath);

