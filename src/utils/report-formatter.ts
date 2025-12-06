import { ModernizationAnalysis, FileModernizationResult, ModernizationSuggestion } from '../analyzers/modernization.js';

/**
 * 報告格式類型
 */
export type ReportFormat = 'markdown' | 'json' | 'html' | 'text';

/**
 * 報告生成器
 */
export class ReportFormatter {

  /**
   * 格式化現代化分析報告
   */
  formatModernizationReport(analysis: ModernizationAnalysis, format: ReportFormat = 'markdown'): string {
    switch (format) {
      case 'markdown':
        return this.formatMarkdownReport(analysis);
      case 'json':
        return this.formatJsonReport(analysis);
      case 'html':
        return this.formatHtmlReport(analysis);
      case 'text':
        return this.formatTextReport(analysis);
      default:
        throw new Error(`不支援的格式: ${format}`);
    }
  }

  /**
   * 格式化為 Markdown 報告
   */
  private formatMarkdownReport(analysis: ModernizationAnalysis): string {
    const { summary, suggestions, fileAnalysis, riskAssessment } = analysis;

    let report = '# 程式碼現代化分析報告\n\n';

    // 執行摘要
    report += '## 📊 執行摘要\n\n';
    report += `- **掃描檔案數量**: ${summary.totalFiles} 個檔案\n`;
    report += `- **發現建議數量**: ${summary.totalSuggestions} 項\n`;
    report += `- **潛在效能提升**: ${summary.potentialPerformanceGain}%\n`;
    report += `- **檔案大小減少**: ${summary.bundleSizeReduction}KB\n\n`;

    // 風險評估
    report += '## ⚠️ 風險評估\n\n';
    report += `- **整體風險等級**: ${this.getRiskIcon(riskAssessment.overallRisk)} ${riskAssessment.overallRisk.toUpperCase()}\n`;
    report += `- **預估工時**: ${riskAssessment.migrationEffort.estimatedHours} 小時\n`;
    report += `- **複雜度**: ${riskAssessment.migrationEffort.complexity.toUpperCase()}\n`;
    report += `- **優先順序**: ${riskAssessment.migrationEffort.priority.toUpperCase()}\n\n`;

    if (riskAssessment.breakingChanges.length > 0) {
      report += '### 💥 破壞性變更警告\n\n';
      for (const change of riskAssessment.breakingChanges) {
        report += `- **${change.type}**: ${change.description}\n`;
        report += `  - 影響等級: ${change.impact.toUpperCase()}\n`;
        report += `  - 緩解方案: ${change.mitigation}\n\n`;
      }
    }

    // 現代化建議摘要
    if (suggestions.length > 0) {
      report += '## 🚀 主要現代化建議\n\n';

      // 按類型分組建議
      const groupedSuggestions = this.groupSuggestionsByType(suggestions);

      for (const [type, typeSuggestions] of groupedSuggestions) {
        report += `### ${this.getTypeIcon(type)} ${this.getTypeDisplayName(type)}\n\n`;

        for (const suggestion of typeSuggestions.slice(0, 5)) { // 只顯示前 5 個
          report += `#### ${suggestion.title}\n`;
          report += `${suggestion.description}\n\n`;

          report += '**目前程式碼:**\n';
          report += '```javascript\n';
          report += suggestion.currentCode;
          report += '\n```\n\n';

          report += '**現代化版本:**\n';
          report += '```javascript\n';
          report += suggestion.modernCode;
          report += '\n```\n\n';

          report += `- 💪 **效能提升**: ${suggestion.impact?.performance || 0}%\n`;
          report += `- 📦 **檔案減少**: ${suggestion.impact?.bundle || 0}KB\n`;
          report += `- 🛠️ **維護性**: ${suggestion.impact?.maintainability || 0}/5\n`;
          report += `- ⚡ **實作難度**: ${suggestion.difficulty.toUpperCase()}\n`;
          report += `- 💥 **破壞性變更**: ${suggestion.breaking ? '是' : '否'}\n\n`;

          if (suggestion.location) {
            report += `📍 位置: 第 ${suggestion.location.line} 行\n\n`;
          }

          report += '---\n\n';
        }

        if (typeSuggestions.length > 5) {
          report += `*以及其他 ${typeSuggestions.length - 5} 項 ${this.getTypeDisplayName(type)} 建議...*\n\n`;
        }
      }
    }

    // 檔案詳細分析
    if (fileAnalysis.length > 0) {
      report += '## 📁 檔案詳細分析\n\n';

      // 只顯示有建議的檔案，並限制數量
      const filesWithSuggestions = fileAnalysis
        .filter(file => file.suggestions.length > 0)
        .slice(0, 10); // 只顯示前 10 個檔案

      for (const file of filesWithSuggestions) {
        report += `### 📄 ${file.filePath}\n`;
        report += `發現 ${file.suggestions.length} 項現代化機會\n\n`;

        // 顯示該檔案的建議摘要
        const topSuggestions = file.suggestions.slice(0, 3);
        for (const suggestion of topSuggestions) {
          report += `- **${suggestion.title}** (難度: ${suggestion.difficulty})\n`;
        }

        if (file.suggestions.length > 3) {
          report += `- *以及其他 ${file.suggestions.length - 3} 項建議...*\n`;
        }

        report += '\n';
      }

      if (fileAnalysis.filter(f => f.suggestions.length > 0).length > 10) {
        const remaining = fileAnalysis.filter(f => f.suggestions.length > 0).length - 10;
        report += `*以及其他 ${remaining} 個檔案有現代化機會...*\n\n`;
      }
    }

    // 實作建議
    report += '## 📋 實作建議\n\n';
    report += '### 優先順序建議\n\n';

    const highPriority = suggestions.filter(s =>
      (s.impact?.performance || 0) > 15 ||
      (s.impact?.bundle || 0) > 30 ||
      s.type === 'library-replacement'
    );

    if (highPriority.length > 0) {
      report += '#### 🔥 高優先順序 (建議立即處理)\n';
      for (const suggestion of highPriority.slice(0, 5)) {
        report += `- ${suggestion.title}\n`;
      }
      report += '\n';
    }

    const lowRisk = suggestions.filter(s => !s.breaking && s.difficulty === 'trivial');
    if (lowRisk.length > 0) {
      report += '#### ✅ 低風險快速改善 (可先處理)\n';
      for (const suggestion of lowRisk.slice(0, 5)) {
        report += `- ${suggestion.title}\n`;
      }
      report += '\n';
    }

    // 結論
    report += '## 🎯 結論\n\n';
    if (summary.totalSuggestions === 0) {
      report += '🎉 恭喜！您的程式碼已經相當現代化，沒有發現需要立即處理的現代化機會。\n\n';
    } else if (riskAssessment.overallRisk === 'low') {
      report += '✨ 您的程式碼有不錯的現代化潛力，且風險相對較低。建議逐步實施這些改善。\n\n';
    } else {
      report += '⚡ 發現多項現代化機會，建議制定詳細的移轉計畫，優先處理高影響、低風險的項目。\n\n';
    }

    report += `總計可能節省 ${summary.bundleSizeReduction}KB 檔案大小，提升 ${summary.potentialPerformanceGain}% 效能。\n\n`;

    report += '---\n';
    report += '*此報告由 [@mukiwu/dev-advisor-mcp](https://github.com/mukiwu/dev-advisor-mcp) 自動生成*\n';

    return report;
  }

  /**
   * 格式化為 JSON 報告
   */
  private formatJsonReport(analysis: ModernizationAnalysis): string {
    return JSON.stringify(analysis, null, 2);
  }

  /**
   * 格式化為 HTML 報告
   */
  private formatHtmlReport(analysis: ModernizationAnalysis): string {
    const { summary, suggestions, riskAssessment } = analysis;

    let html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>程式碼現代化分析報告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; margin: 40px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2c3e50; }
        .suggestion { background: white; border: 1px solid #e1e5e9; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .code-block { background: #f6f8fa; border: 1px solid #e1e5e9; border-radius: 6px; padding: 16px; margin: 10px 0; overflow-x: auto; }
        .risk-high { color: #dc3545; }
        .risk-medium { color: #ffc107; }
        .risk-low { color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 程式碼現代化分析報告</h1>
        <p>智慧分析您的程式碼，發現現代化機會</p>
    </div>

    <div class="summary">
        <div class="metric">
            <div class="metric-value">${summary.totalFiles}</div>
            <div>掃描檔案</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.totalSuggestions}</div>
            <div>現代化建議</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.potentialPerformanceGain}%</div>
            <div>效能提升</div>
        </div>
        <div class="metric">
            <div class="metric-value">${summary.bundleSizeReduction}KB</div>
            <div>檔案減少</div>
        </div>
    </div>

    <h2>⚠️ 風險評估</h2>
    <p class="risk-${riskAssessment.overallRisk}">
        整體風險等級: <strong>${riskAssessment.overallRisk.toUpperCase()}</strong>
    </p>
    <p>預估工時: ${riskAssessment.migrationEffort.estimatedHours} 小時</p>
`;

    if (suggestions.length > 0) {
      html += '<h2>🎯 主要建議</h2>';
      for (const suggestion of suggestions.slice(0, 10)) {
        html += `
        <div class="suggestion">
            <h3>${suggestion.title}</h3>
            <p>${suggestion.description}</p>

            <h4>目前程式碼:</h4>
            <div class="code-block"><pre><code>${this.escapeHtml(suggestion.currentCode)}</code></pre></div>

            <h4>現代化版本:</h4>
            <div class="code-block"><pre><code>${this.escapeHtml(suggestion.modernCode)}</code></pre></div>

            <div style="display: flex; gap: 20px; margin-top: 15px;">
                <span>💪 效能: +${suggestion.impact?.performance || 0}%</span>
                <span>📦 檔案: -${suggestion.impact?.bundle || 0}KB</span>
                <span>⚡ 難度: ${suggestion.difficulty}</span>
                <span>💥 破壞性: ${suggestion.breaking ? '是' : '否'}</span>
            </div>
        </div>`;
      }
    }

    html += `
    <footer style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e1e5e9; color: #6c757d; text-align: center;">
        此報告由 [@mukiwu/dev-advisor-mcp](https://github.com/mukiwu/dev-advisor-mcp) 自動生成
    </footer>
</body>
</html>`;

    return html;
  }

  /**
   * 格式化為純文字報告
   */
  private formatTextReport(analysis: ModernizationAnalysis): string {
    const { summary, suggestions, riskAssessment } = analysis;

    let report = '程式碼現代化分析報告\n';
    report += '='.repeat(50) + '\n\n';

    report += '執行摘要:\n';
    report += `---------\n`;
    report += `掃描檔案數量: ${summary.totalFiles}\n`;
    report += `現代化建議: ${summary.totalSuggestions}\n`;
    report += `潜在效能提升: ${summary.potentialPerformanceGain}%\n`;
    report += `檔案大小減少: ${summary.bundleSizeReduction}KB\n\n`;

    report += `風險評估: ${riskAssessment.overallRisk.toUpperCase()}\n`;
    report += `預估工時: ${riskAssessment.migrationEffort.estimatedHours} 小時\n\n`;

    if (suggestions.length > 0) {
      report += '主要建議:\n';
      report += '---------\n';
      for (const suggestion of suggestions.slice(0, 5)) {
        report += `${suggestion.title}\n`;
        report += `${suggestion.description}\n`;
        report += `難度: ${suggestion.difficulty}, 破壞性: ${suggestion.breaking ? '是' : '否'}\n`;
        report += '-'.repeat(40) + '\n';
      }
    }

    return report;
  }

  /**
   * 按類型分組建議
   */
  private groupSuggestionsByType(suggestions: ModernizationSuggestion[]): Map<string, ModernizationSuggestion[]> {
    const groups = new Map<string, ModernizationSuggestion[]>();

    for (const suggestion of suggestions) {
      const type = suggestion.type;
      if (!groups.has(type)) {
        groups.set(type, []);
      }
      groups.get(type)!.push(suggestion);
    }

    // 按優先順序排序類型
    const sortedGroups = new Map<string, ModernizationSuggestion[]>();
    const typeOrder = ['library-replacement', 'api-modernization', 'syntax-modernization', 'pattern-modernization'];

    for (const type of typeOrder) {
      if (groups.has(type)) {
        sortedGroups.set(type, groups.get(type)!);
      }
    }

    return sortedGroups;
  }

  /**
   * 取得類型圖示
   */
  private getTypeIcon(type: string): string {
    const icons = {
      'library-replacement': '📚',
      'api-modernization': '🔄',
      'syntax-modernization': '✨',
      'pattern-modernization': '🎨'
    };
    return icons[type as keyof typeof icons] || '🔧';
  }

  /**
   * 取得類型顯示名稱
   */
  private getTypeDisplayName(type: string): string {
    const names = {
      'library-replacement': '函式庫替換',
      'api-modernization': 'API 現代化',
      'syntax-modernization': '語法現代化',
      'pattern-modernization': '模式現代化'
    };
    return names[type as keyof typeof names] || type;
  }

  /**
   * 取得風險圖示
   */
  private getRiskIcon(risk: string): string {
    const icons = {
      'low': '🟢',
      'medium': '🟡',
      'high': '🔴'
    };
    return icons[risk as keyof typeof icons] || '⚪';
  }

  /**
   * HTML 轉義
   * 將特殊字元轉換為 HTML entities，防止 XSS 攻擊
   */
  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
