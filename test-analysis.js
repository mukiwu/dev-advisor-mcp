#!/usr/bin/env node

// 測試程式碼現代化分析功能
import { ModernizationAnalyzer } from './dist/src/analyzers/modernization.js';
import { CodeParser } from './dist/src/parsers/index.js';
import { ReportFormatter } from './dist/src/utils/report-formatter.js';

async function testAnalysis() {
  console.log('🔍 測試程式碼現代化分析功能...\n');

  try {
    // 初始化分析器
    const parser = new CodeParser();
    const analyzer = new ModernizationAnalyzer(parser);
    const formatter = new ReportFormatter();

    console.log('✅ 分析器初始化成功');

    // 測試解析單個檔案
    console.log('\n📄 測試檔案解析...');
    const testFile = './test-code/sample.js';
    const parsedFile = await parser.parseFile(testFile);

    if (parsedFile) {
      console.log(`✅ 成功解析檔案: ${testFile}`);
      console.log(`   - 發現 ${parsedFile.imports.length} 個 import`);
      console.log(`   - 發現 ${parsedFile.functions.length} 個函式`);
      console.log(`   - 發現 ${parsedFile.apiCalls.length} 個 API 呼叫`);
    }

    // 測試專案分析
    console.log('\n🔍 測試專案分析...');
    const analysis = await analyzer.analyze(
      './test-code',
      ['**/*.js'],
      ['node_modules/**']
    );

    console.log(`✅ 分析完成:`);
    console.log(`   - 掃描檔案: ${analysis.summary.totalFiles} 個`);
    console.log(`   - 發現建議: ${analysis.summary.totalSuggestions} 項`);
    console.log(`   - 效能提升: ${analysis.summary.potentialPerformanceGain}%`);
    console.log(`   - 風險等級: ${analysis.riskAssessment.overallRisk}`);

    // 測試報告生成
    console.log('\n📋 測試報告生成...');
    const markdownReport = formatter.formatModernizationReport(analysis, 'markdown');
    const jsonReport = formatter.formatModernizationReport(analysis, 'json');

    console.log(`✅ Markdown 報告生成成功 (${markdownReport.length} 字元)`);
    console.log(`✅ JSON 報告生成成功 (${jsonReport.length} 字元)`);

    // 顯示部分報告內容
    console.log('\n📊 報告摘要:');
    console.log('---'.repeat(20));
    console.log(markdownReport.substring(0, 500) + '...');
    console.log('---'.repeat(20));

    console.log('\n🎉 所有測試通過！開發決策顧問功能正常運作。');

  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAnalysis();