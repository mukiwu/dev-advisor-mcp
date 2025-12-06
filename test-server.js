#!/usr/bin/env node

// 簡單的 MCP Server 測試腳本
import { DevAdvisorServer } from './dist/src/server.js';

console.log('正在啟動開發決策顧問 MCP Server...');

try {
  const server = new DevAdvisorServer();
  console.log('MCP Server 初始化成功!');

  // 測試基本功能 (不實際運行 server，只測試初始化)
  console.log('✅ 所有模組載入成功');
  console.log('✅ MCP Server 可以正常初始化');

  console.log('\n🎉 測試完成！MCP Server 已準備好使用。');
  console.log('\n使用方式:');
  console.log('1. 將此 MCP Server 加入您的 Claude 配置中');
  console.log('2. 使用 analyze_modernization 工具分析程式碼');
  console.log('3. 使用 recommend_api_combination 獲取 API 推薦');
  console.log('4. 使用 analyze_compatibility 分析相容性');

} catch (error) {
  console.error('❌ 測試失敗:', error.message);
  process.exit(1);
}