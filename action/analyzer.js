#!/usr/bin/env node

/**
 * 分析執行器
 * 直接調用分析器類別，不依賴 MCP 協議
 */

import { ModernizationAnalyzer } from '../dist/src/analyzers/modernization.js';
import { CompatibilityAnalyzer, formatCompatibilityReport } from '../dist/src/analyzers/compatibility.js';
import { CodeParser } from '../dist/src/parsers/index.js';
import { ReportFormatter } from '../dist/src/utils/report-formatter.js';
import { CanIUseService } from '../dist/src/services/caniuse-service.js';

/**
 * 執行現代化分析
 */
export async function runModernizationAnalysis(projectPath, includePatterns, excludePatterns) {
  const parser = new CodeParser();
  const analyzer = new ModernizationAnalyzer(parser);
  const formatter = new ReportFormatter();

  const analysis = await analyzer.analyze(projectPath, includePatterns, excludePatterns);
  const report = formatter.formatModernizationReport(analysis, 'markdown');

  return {
    analysis,
    report,
    summary: {
      totalFiles: analysis.summary.totalFiles,
      totalSuggestions: analysis.summary.totalSuggestions,
      performanceGain: analysis.summary.potentialPerformanceGain,
      bundleReduction: analysis.summary.bundleSizeReduction,
      risk: analysis.riskAssessment.overallRisk
    }
  };
}

/**
 * 執行相容性分析
 */
export async function runCompatibilityAnalysis(projectPath, includePatterns, excludePatterns, browserslistConfig) {
  const parser = new CodeParser();
  const canIUseService = new CanIUseService();
  const analyzer = new CompatibilityAnalyzer(parser, canIUseService);

  const analysis = await analyzer.analyze(
    projectPath,
    includePatterns,
    excludePatterns,
    browserslistConfig || undefined
  );

  const report = formatCompatibilityReport(analysis, 'markdown');

  return {
    analysis,
    report,
    summary: {
      totalApis: analysis.summary.totalApisAnalyzed,
      compatibleApis: analysis.summary.compatibleApis,
      incompatibleApis: analysis.summary.incompatibleApis,
      overallCompatibility: analysis.summary.overallCompatibility,
      polyfillsNeeded: analysis.summary.polyfillsNeeded
    }
  };
}

/**
 * 執行所有分析
 */
export async function runAllAnalyses(options) {
  const {
    projectPath,
    includePatterns,
    excludePatterns,
    browserslistConfig,
    enableModernization,
    enableCompatibility
  } = options;

  const results = {
    modernization: null,
    compatibility: null,
    errors: []
  };

  // 執行現代化分析
  if (enableModernization) {
    try {
      results.modernization = await runModernizationAnalysis(
        projectPath,
        includePatterns,
        excludePatterns
      );
    } catch (error) {
      results.errors.push({
        type: 'modernization',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // 執行相容性分析
  if (enableCompatibility) {
    try {
      results.compatibility = await runCompatibilityAnalysis(
        projectPath,
        includePatterns,
        excludePatterns,
        browserslistConfig
      );
    } catch (error) {
      results.errors.push({
        type: 'compatibility',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return results;
}

