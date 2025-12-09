#!/usr/bin/env node

/**
 * GitHub Action 主執行檔
 * 執行分析並在 PR 中回覆結果
 * 支援規則式分析和 AI 分析兩種模式
 */

import * as core from '@actions/core';
import { runAllAnalyses } from './analyzer.js';
import { commentOnPR, commentAIReport } from './commenter.js';
import { analyzeWithAI } from './ai-service.js';
import { getPRDiff, getPRInfo } from './pr-diff.js';

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

    // AI 相關參數
    const aiEnabled = core.getBooleanInput('ai-enabled');
    const aiProvider = core.getInput('ai-provider') || 'openai';
    const aiModel = core.getInput('ai-model') || '';
    const aiApiKey = core.getInput('ai-api-key') || '';

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

    // AI 分析模式
    if (aiEnabled) {
      core.info('🤖 使用 AI 分析模式');
      core.info(`   - 提供者: ${aiProvider}`);
      core.info(`   - 模型: ${aiModel || '預設'}`);

      if (!aiApiKey) {
        core.setFailed('啟用 AI 分析時必須提供 ai-api-key');
        return;
      }

      try {
        // 取得 PR diff
        core.info('📥 取得 PR 變更內容...');
        const diff = await getPRDiff(githubToken);
        const prInfo = await getPRInfo(githubToken);

        if (!diff || diff.length === 0) {
          core.warning('PR 沒有程式碼變更，跳過 AI 分析');
          return;
        }

        // 限制 diff 大小（避免 token 超過限制）
        const maxDiffLength = 50000; // 約 50KB
        let truncatedDiff = diff;
        if (diff.length > maxDiffLength) {
          truncatedDiff = diff.substring(0, maxDiffLength) + '\n\n... (diff 內容過長，已截斷)';
          core.warning(`Diff 內容過長 (${diff.length} 字元)，已截斷至 ${maxDiffLength} 字元`);
        }

        core.info('🧠 呼叫 AI 分析中...');
        const aiReport = await analyzeWithAI({
          provider: aiProvider,
          model: aiModel,
          apiKey: aiApiKey,
          diff: truncatedDiff
        });

        core.info('✅ AI 分析完成');
        core.setOutput('ai-report', aiReport);

        // 在 PR 中留言
        if (githubToken && commentOnPRFlag) {
          try {
            await commentAIReport(githubToken, aiReport, aiProvider, aiModel, prInfo);
            core.info('✅ PR 評論已發送');
          } catch (error) {
            core.warning(`發送 PR 評論失敗: ${error instanceof Error ? error.message : String(error)}`);
          }
        }

        core.info('🎉 AI 分析完成！');
        return;
      } catch (error) {
        core.setFailed(`AI 分析失敗: ${error instanceof Error ? error.message : String(error)}`);
        return;
      }
    }

    // 規則式分析模式（原有邏輯）
    core.info('📊 使用規則式分析模式');
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
