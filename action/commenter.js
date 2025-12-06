#!/usr/bin/env node

/**
 * GitHub PR 評論工具
 * 使用 GitHub API 在 PR 中發送評論
 */

import * as github from '@actions/github';
import * as core from '@actions/core';

const MAX_COMMENT_LENGTH = 65500; // GitHub 評論限制約 65536 字元，留一些緩衝

/**
 * 發送或更新 PR 評論
 */
export async function commentOnPR(token, report, commentOnPR = true) {
  if (!commentOnPR) {
    core.info('comment-on-pr 設為 false，跳過 PR 評論');
    return null;
  }

  const octokit = github.getOctokit(token);
  const context = github.context;

  // 檢查是否在 PR 環境中
  if (context.eventName !== 'pull_request') {
    core.warning('此 action 只能在 pull_request 事件中使用');
    return null;
  }

  const owner = context.repo.owner;
  const repo = context.repo.repo;
  const prNumber = context.payload.pull_request?.number;

  if (!prNumber) {
    core.warning('無法取得 PR 編號');
    return null;
  }

  try {
    // 查找現有的評論（由 bot 發送）
    const existingComment = await findExistingComment(octokit, owner, repo, prNumber);

    // 如果報告太長，分段處理
    const commentBody = formatCommentBody(report);

    if (existingComment) {
      // 更新現有評論
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: existingComment.id,
        body: commentBody
      });
      core.info(`已更新 PR #${prNumber} 的評論`);
      return existingComment.id;
    } else {
      // 創建新評論
      const { data } = await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: commentBody
      });
      core.info(`已在 PR #${prNumber} 中創建評論`);
      return data.id;
    }
  } catch (error) {
    core.error(`發送 PR 評論失敗: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 查找現有的評論
 */
async function findExistingComment(octokit, owner, repo, prNumber) {
  try {
    const { data: comments } = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber
    });

    // 查找由 bot 發送且包含特定標記的評論
    const botComment = comments.find(comment => {
      const body = comment.body || '';
      return body.includes('<!-- dev-advisor-mcp -->') &&
        comment.user?.type === 'Bot';
    });

    return botComment || null;
  } catch (error) {
    core.warning(`查找現有評論失敗: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

/**
 * 格式化評論內容
 */
function formatCommentBody(report) {
  let body = '<!-- dev-advisor-mcp -->\n\n';
  body += '# 🔍 開發決策顧問分析報告\n\n';
  body += `> 此報告由 [@mukiwu/dev-advisor-mcp](https://github.com/mukiwu/dev-advisor-mcp) 自動生成\n\n`;

  // 添加現代化分析報告
  if (report.modernization) {
    body += '## 📊 程式碼現代化分析\n\n';
    const modernizationReport = report.modernization.report;

    // 如果報告太長，截斷並添加提示
    if (modernizationReport.length > MAX_COMMENT_LENGTH - body.length - 1000) {
      const truncated = modernizationReport.substring(0, MAX_COMMENT_LENGTH - body.length - 1000);
      body += truncated;
      body += '\n\n---\n\n';
      body += '> ⚠️ 報告內容過長，已截斷。請查看完整的分析結果。\n\n';
    } else {
      body += modernizationReport;
      body += '\n\n---\n\n';
    }
  }

  // 添加相容性分析報告
  if (report.compatibility) {
    body += '## 🌐 API 相容性分析\n\n';
    const compatibilityReport = report.compatibility.report;

    // 檢查長度
    const remainingLength = MAX_COMMENT_LENGTH - body.length;
    if (compatibilityReport.length > remainingLength - 1000) {
      const truncated = compatibilityReport.substring(0, remainingLength - 1000);
      body += truncated;
      body += '\n\n---\n\n';
      body += '> ⚠️ 報告內容過長，已截斷。請查看完整的分析結果。\n\n';
    } else {
      body += compatibilityReport;
      body += '\n\n---\n\n';
    }
  }

  // 添加錯誤資訊
  if (report.errors && report.errors.length > 0) {
    body += '## ⚠️ 分析錯誤\n\n';
    for (const error of report.errors) {
      body += `- **${error.type}**: ${error.error}\n`;
    }
    body += '\n';
  }

  // 添加摘要
  if (report.modernization || report.compatibility) {
    body += '## 📋 分析摘要\n\n';

    if (report.modernization) {
      const summary = report.modernization.summary;
      body += '### 現代化分析\n';
      body += `- 掃描檔案: ${summary.totalFiles}\n`;
      body += `- 發現建議: ${summary.totalSuggestions}\n`;
      body += `- 效能提升: ${summary.performanceGain}%\n`;
      body += `- Bundle 減少: ${summary.bundleReduction}KB\n`;
      body += `- 風險等級: ${summary.risk}\n\n`;
    }

    if (report.compatibility) {
      const summary = report.compatibility.summary;
      body += '### 相容性分析\n';
      body += `- 分析的 API: ${summary.totalApis}\n`;
      body += `- 完全相容: ${summary.compatibleApis}\n`;
      body += `- 不相容: ${summary.incompatibleApis}\n`;
      body += `- 整體相容性: ${summary.overallCompatibility}%\n`;
      body += `- 需要 Polyfill: ${summary.polyfillsNeeded}\n\n`;
    }
  }

  body += '\n---\n';
  body += '*此評論由 [@mukiwu/dev-advisor-mcp](https://github.com/mukiwu/dev-advisor-mcp) 自動生成*\n';

  // 確保不超過長度限制
  if (body.length > MAX_COMMENT_LENGTH) {
    body = body.substring(0, MAX_COMMENT_LENGTH - 200);
    body += '\n\n---\n\n> ⚠️ 報告內容過長，已截斷。\n';
  }

  return body;
}

