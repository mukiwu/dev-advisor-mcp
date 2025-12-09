#!/usr/bin/env node

/**
 * GitHub Action 主執行檔
 * 執行分析並在 PR 中回覆結果
 */

import * as core from '@actions/core';
import { runAllAnalyses } from './analyzer.js';
import { commentOnPR } from './commenter.js';

async function main() {
  try {
    // 取得輸入參數
    const projectPath = core.getInput('project-path') || '.';
    const includePatternsStr = core.getInput('include-patterns') || '["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]';
    const excludePatternsStr = core.getInput('exclude-patterns') || '["node_modules/**", "dist/**", "build/**"]';
    const browserslistConfig = core.getInput('browserslist-config') || '';
    const enableModernization = core.getBooleanInput('enable-modernization');
    const enableCompatibility = core.getBooleanInput('enable-compatibility');
    const enableBrowserCheck = core.getBooleanInput('enable-browser-check');
    const githubToken = core.getInput('github-token');
    const commentOnPRFlag = core.getBooleanInput('comment-on-pr');

    // 解析 JSON 陣列
    let includePatterns, excludePatterns;
    try {
      includePatterns = JSON.parse(includePatternsStr);
      excludePatterns = JSON.parse(excludePatternsStr);
    } catch (error) {
      core.setFailed(`無法解析檔案模式: ${error instanceof Error ? error.message : String(error)}`);
      return;
    }

    core.info('🚀 開始執行開發決策顧問分析...');
    core.info(`📁 專案路徑: ${projectPath}`);
    core.info(`📝 包含模式: ${includePatterns.join(', ')}`);
    core.info(`🚫 排除模式: ${excludePatterns.join(', ')}`);
    core.info(`🔧 現代化分析: ${enableModernization ? '啟用' : '停用'}`);
    core.info(`🌐 相容性分析: ${enableCompatibility ? '啟用' : '停用'}`);
    core.info(`🔍 瀏覽器檢查: ${enableBrowserCheck ? '啟用' : '停用'}`);

    // 執行分析
    const results = await runAllAnalyses({
      projectPath,
      includePatterns,
      excludePatterns,
      browserslistConfig: browserslistConfig || undefined,
      enableModernization,
      enableCompatibility
    });

    // 設定輸出
    if (results.modernization) {
      core.setOutput('modernization-report', results.modernization.report);
      core.info('✅ 現代化分析完成');
      core.info(`   - 掃描檔案: ${results.modernization.summary.totalFiles}`);
      core.info(`   - 發現建議: ${results.modernization.summary.totalSuggestions}`);
    }

    if (results.compatibility) {
      core.setOutput('compatibility-report', results.compatibility.report);
      core.info('✅ 相容性分析完成');
      core.info(`   - 分析的 API: ${results.compatibility.summary.totalApis}`);
      core.info(`   - 整體相容性: ${results.compatibility.summary.overallCompatibility}%`);
    }

    // 生成摘要
    const summary = {
      modernization: results.modernization?.summary || null,
      compatibility: results.compatibility?.summary || null,
      errors: results.errors
    };
    core.setOutput('summary', JSON.stringify(summary));

    // 檢查錯誤
    if (results.errors.length > 0) {
      core.warning(`分析過程中發生 ${results.errors.length} 個錯誤:`);
      for (const error of results.errors) {
        core.warning(`  - ${error.type}: ${error.error}`);
      }
    }

    // 在 PR 中留言
    if (githubToken && commentOnPRFlag) {
      try {
        await commentOnPR(githubToken, results, commentOnPRFlag);
        core.info('✅ PR 評論已發送');
      } catch (error) {
        core.warning(`發送 PR 評論失敗: ${error instanceof Error ? error.message : String(error)}`);
        // 不因為評論失敗而讓整個 action 失敗
      }
    }

    core.info('🎉 分析完成！');
  } catch (error) {
    core.setFailed(`執行失敗: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      core.debug(error.stack);
    }
  }
}

// 執行主函數
main();
