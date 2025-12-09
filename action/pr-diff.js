/**
 * PR Diff 取得工具
 * 使用 GitHub API 取得 PR 的變更內容
 */

import * as github from '@actions/github';

/**
 * 取得 PR 的 diff 內容
 * @param {string} token - GitHub Token
 * @returns {Promise<string>} PR 的 diff 內容
 */
export async function getPRDiff(token) {
  const context = github.context;

  // 檢查是否在 PR 環境中
  if (context.eventName !== 'pull_request') {
    throw new Error('此功能只能在 pull_request 事件中使用');
  }

  const prNumber = context.payload.pull_request?.number;
  if (!prNumber) {
    throw new Error('無法取得 PR 編號');
  }

  const octokit = github.getOctokit(token);
  const { owner, repo } = context.repo;

  // 使用 mediaType 取得 diff 格式
  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: {
      format: 'diff'
    }
  });

  return diff;
}

/**
 * 取得 PR 的檔案變更列表
 * @param {string} token - GitHub Token
 * @returns {Promise<Array>} 變更的檔案列表
 */
export async function getPRFiles(token) {
  const context = github.context;

  if (context.eventName !== 'pull_request') {
    throw new Error('此功能只能在 pull_request 事件中使用');
  }

  const prNumber = context.payload.pull_request?.number;
  if (!prNumber) {
    throw new Error('無法取得 PR 編號');
  }

  const octokit = github.getOctokit(token);
  const { owner, repo } = context.repo;

  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber
  });

  return files;
}

/**
 * 取得 PR 資訊
 * @param {string} token - GitHub Token
 * @returns {Promise<Object>} PR 資訊
 */
export async function getPRInfo(token) {
  const context = github.context;

  if (context.eventName !== 'pull_request') {
    return null;
  }

  const pr = context.payload.pull_request;
  if (!pr) {
    return null;
  }

  return {
    number: pr.number,
    title: pr.title,
    body: pr.body,
    author: pr.user?.login,
    baseBranch: pr.base?.ref,
    headBranch: pr.head?.ref,
    url: pr.html_url
  };
}
