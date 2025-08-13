#!/usr/bin/env node
/**
 * @fileoverview Advanced JSDoc checker for AI/neural/swarm coordination systems.
 *
 * Comprehensive documentation analysis for complex TypeScript architectures including:
 * - Neural network coordination patterns
 * - Swarm intelligence documentation
 * - Multi-language system interfaces (Rust/WASM/TypeScript)
 * - Advanced architectural patterns (DI, Event-driven, SPARC)
 * - AI/ML model documentation requirements
 *
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 1.2.0
 *
 * @example
 * ```bash
 * npm run lint:jsdoc-advanced
 * node scripts/check-jsdoc-advanced.js --strict --coverage-threshold=85
 * ```
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { extname, join, relative } from 'path';

/**
 * Advanced JSDoc analysis configuration for AI/neural systems.
 */
const CONFIG = {
  /** Minimum documentation coverage threshold for production-ready code */
  COVERAGE_THRESHOLD: 80,

  /** Maximum cyclomatic complexity before requiring detailed documentation */
  COMPLEXITY_THRESHOLD: 10,

  /** File size threshold (lines) requiring comprehensive documentation */
  SIZE_THRESHOLD: 200,

  /** Critical system patterns requiring mandatory documentation */
  CRITICAL_PATTERNS: [
    'neural',
    'swarm',
    'coordination',
    'orchestration',
    'agent',
    'wasm',
    'binding',
    'dspy',
    'llm',
    'ai',
    'ml',
    'cognitive',
    'memory',
    'learning',
    'inference',
    'training',
    'model',
  ],

  /** Directory classifications for different documentation standards */
  DIRECTORY_STANDARDS: {
    core: { threshold: 95, requireExamples: true, requireComplexity: true },
    coordination: {
      threshold: 90,
      requireExamples: true,
      requireComplexity: true,
    },
    neural: { threshold: 85, requireExamples: true, requireComplexity: false },
    intelligence: {
      threshold: 85,
      requireExamples: true,
      requireComplexity: false,
    },
    integration: {
      threshold: 75,
      requireExamples: false,
      requireComplexity: false,
    },
    utils: { threshold: 70, requireExamples: false, requireComplexity: false },
  },
};

/**
 * Advanced pattern recognition for AI/neural system documentation.
 */
const PATTERNS = {
  /** File header with comprehensive metadata */
  FILE_HEADER: /^\/\*\*\s*\n\s*\*\s*@fileoverview\s+.+/m,

  /** Standard JSDoc block patterns */
  JSDOC_START: /^\s*\/\*\*/,
  JSDOC_END: /^\s*\*\//,

  /** Function/method definitions requiring documentation */
  FUNCTION_DEF:
    /^(?:\s*(?:export\s+)?(?:async\s+)?(?:function\s+\w+|(?:const|let)\s+\w+\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|\([^)]*\)\s*:\s*[^=]+=\s*)))/,

  /** Class definitions */
  CLASS_DEF: /^\s*(?:export\s+)?(?:abstract\s+)?class\s+\w+/,

  /** Interface definitions */
  INTERFACE_DEF: /^\s*(?:export\s+)?interface\s+\w+/,

  /** Type definitions */
  TYPE_DEF: /^\s*(?:export\s+)?type\s+\w+\s*=/,

  /** Enum definitions */
  ENUM_DEF: /^\s*(?:export\s+)?enum\s+\w+/,

  /** Complex neural/AI patterns requiring detailed documentation */
  NEURAL_PATTERN:
    /(?:neural|swarm|agent|coordinator|orchestrat|intelligen|cognitive|learning|inference|training|model)/i,

  /** WASM/Rust binding patterns */
  WASM_PATTERN: /(?:wasm|rust|binding|ffi|extern)/i,

  /** Critical system interfaces */
  SYSTEM_INTERFACE: /(?:interface|abstract|implements|extends)/,

  /** JSDoc quality indicators */
  HAS_PARAM: /@param\s+\{[^}]+\}\s+\w+/,
  HAS_RETURNS: /@returns?\s+\{[^}]+\}/,
  HAS_EXAMPLE: /@example/,
  HAS_SINCE: /@since/,
  HAS_AUTHOR: /@author/,
  HAS_VERSION: /@version/,
  HAS_COMPLEXITY: /@complexity/,
  HAS_PERFORMANCE: /@performance/,
  HAS_THROWS: /@throws/,
  HAS_SEE: /@see/,
};

/**
 * Get all TypeScript files in directory with intelligent filtering.
 *
 * @param {string} dir - Directory to scan
 * @param {string[]} excludePaths - Paths to exclude from analysis
 * @returns {string[]} Array of TypeScript file paths
 */
function getTsFiles(dir, excludePaths = []) {
  const files = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const relativePath = relative('.', fullPath);

      // Skip excluded paths
      if (excludePaths.some((exclude) => relativePath.includes(exclude))) {
        continue;
      }

      const stat = statSync(fullPath);

      if (stat.isDirectory() && !isExcludedDirectory(item)) {
        files.push(...getTsFiles(fullPath, excludePaths));
      } else if (isTypeScriptFile(item, fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error scanning directory ${dir}:`, error.message);
  }

  return files;
}

/**
 * Check if directory should be excluded from analysis.
 */
function isExcludedDirectory(dirname) {
  const excluded = [
    'node_modules',
    'dist',
    'build',
    'target',
    'pkg',
    'coverage',
    'docs',
    '.git',
    'logs',
    'tmp',
    'qdrant_storage',
  ];
  return excluded.includes(dirname);
}

/**
 * Check if file is a TypeScript file requiring documentation analysis.
 */
function isTypeScriptFile(filename, fullPath) {
  if (!(filename.endsWith('.ts') || filename.endsWith('.tsx'))) {
    return false;
  }

  // Skip test files, config files, and declaration files
  if (
    filename.includes('.test.') ||
    filename.includes('.spec.') ||
    filename.includes('.config.') ||
    filename.endsWith('.d.ts')
  ) {
    return false;
  }

  return true;
}

/**
 * Determine documentation standard based on file path and content.
 *
 * @param {string} filepath - File path for analysis
 * @param {string} content - File content
 * @returns {Object} Documentation requirements for this file
 */
function getDocumentationStandard(filepath, content) {
  const relativePath = relative('.', filepath).toLowerCase();

  // Check directory-based standards
  for (const [dir, standard] of Object.entries(CONFIG.DIRECTORY_STANDARDS)) {
    if (relativePath.includes(dir)) {
      return {
        ...standard,
        category: dir,
        isCritical: isCriticalFile(filepath, content),
      };
    }
  }

  // Default standard
  return {
    threshold: 75,
    requireExamples: false,
    requireComplexity: false,
    category: 'general',
    isCritical: isCriticalFile(filepath, content),
  };
}

/**
 * Determine if file contains critical system patterns.
 */
function isCriticalFile(filepath, content) {
  const pathLower = filepath.toLowerCase();
  const contentLower = content.toLowerCase();

  return CONFIG.CRITICAL_PATTERNS.some(
    (pattern) => pathLower.includes(pattern) || contentLower.includes(pattern)
  );
}

/**
 * Advanced JSDoc analysis for AI/neural system files.
 *
 * @param {string} filepath - Path to TypeScript file
 * @returns {Object} Comprehensive documentation analysis results
 */
function analyzeFileDocumentation(filepath) {
  try {
    const content = readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    const standard = getDocumentationStandard(filepath, content);

    const analysis = {
      filepath,
      category: standard.category,
      isCritical: standard.isCritical,
      lineCount: lines.filter((line) => line.trim().length > 0).length,
      issues: [],
      quality: {
        hasFileHeader: false,
        documentedFunctions: 0,
        totalFunctions: 0,
        documentedClasses: 0,
        totalClasses: 0,
        documentedInterfaces: 0,
        totalInterfaces: 0,
        coverage: 0,
        qualityScore: 0,
      },
      suggestions: [],
    };

    let inJSDoc = false;
    let currentJSDoc = '';
    let hasRecentJSDoc = false;

    // Check file header
    analysis.quality.hasFileHeader = PATTERNS.FILE_HEADER.test(content);
    if (!analysis.quality.hasFileHeader && standard.isCritical) {
      analysis.issues.push({
        line: 1,
        severity: 'error',
        message: 'Missing @fileoverview header for critical system file',
      });
    }

    // Line-by-line analysis
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Track JSDoc blocks
      if (PATTERNS.JSDOC_START.test(line)) {
        inJSDoc = true;
        currentJSDoc = line + '\n';
        hasRecentJSDoc = true;
      } else if (PATTERNS.JSDOC_END.test(line)) {
        inJSDoc = false;
        currentJSDoc += line;
      } else if (inJSDoc) {
        currentJSDoc += line + '\n';
      } else if (!inJSDoc && line.trim() === '') {
        // Reset JSDoc flag on empty lines
        hasRecentJSDoc = false;
      }

      // Analyze function definitions
      if (!inJSDoc && PATTERNS.FUNCTION_DEF.test(line)) {
        analysis.quality.totalFunctions++;

        if (hasRecentJSDoc) {
          analysis.quality.documentedFunctions++;

          // Analyze JSDoc quality for functions
          const jsdocQuality = analyzeJSDocQuality(
            currentJSDoc,
            'function',
            standard
          );
          if (jsdocQuality.issues.length > 0) {
            jsdocQuality.issues.forEach((issue) =>
              analysis.issues.push({ ...issue, line: i + 1 })
            );
          }
        } else if (isPublicFunction(line) || standard.isCritical) {
          analysis.issues.push({
            line: i + 1,
            severity: standard.isCritical ? 'error' : 'warning',
            message: `Missing JSDoc for ${standard.isCritical ? 'critical' : 'public'} function`,
          });
        }

        hasRecentJSDoc = false;
      }

      // Analyze class definitions
      if (!inJSDoc && PATTERNS.CLASS_DEF.test(line)) {
        analysis.quality.totalClasses++;

        if (hasRecentJSDoc) {
          analysis.quality.documentedClasses++;
        } else {
          analysis.issues.push({
            line: i + 1,
            severity: 'warning',
            message: 'Missing JSDoc for class definition',
          });
        }

        hasRecentJSDoc = false;
      }

      // Analyze interface definitions
      if (!inJSDoc && PATTERNS.INTERFACE_DEF.test(line)) {
        analysis.quality.totalInterfaces++;

        if (hasRecentJSDoc) {
          analysis.quality.documentedInterfaces++;
        } else {
          analysis.issues.push({
            line: i + 1,
            severity: 'info',
            message: 'Consider adding JSDoc for interface definition',
          });
        }

        hasRecentJSDoc = false;
      }
    }

    // Calculate coverage and quality metrics
    const totalItems =
      analysis.quality.totalFunctions +
      analysis.quality.totalClasses +
      analysis.quality.totalInterfaces;

    const documentedItems =
      analysis.quality.documentedFunctions +
      analysis.quality.documentedClasses +
      analysis.quality.documentedInterfaces;

    analysis.quality.coverage =
      totalItems > 0 ? Math.round((documentedItems / totalItems) * 100) : 100;

    // Quality score calculation
    let qualityScore = analysis.quality.coverage;
    if (analysis.quality.hasFileHeader) qualityScore += 10;
    if (standard.isCritical && analysis.quality.coverage >= 90)
      qualityScore += 15;
    analysis.quality.qualityScore = Math.min(qualityScore, 100);

    // Generate suggestions
    generateSuggestions(analysis, standard);

    return analysis;
  } catch (error) {
    return {
      filepath,
      error: error.message,
      issues: [
        {
          line: 1,
          severity: 'error',
          message: `Analysis failed: ${error.message}`,
        },
      ],
    };
  }
}

/**
 * Analyze JSDoc quality for specific documentation blocks.
 */
function analyzeJSDocQuality(jsdoc, type, standard) {
  const issues = [];

  if (!jsdoc) {
    return { issues: [{ severity: 'error', message: 'Empty JSDoc block' }] };
  }

  // Check for required elements based on type and standard
  if (type === 'function') {
    if (!PATTERNS.HAS_PARAM.test(jsdoc) && jsdoc.includes('(')) {
      issues.push({
        severity: 'warning',
        message: 'Missing @param documentation',
      });
    }

    if (!(PATTERNS.HAS_RETURNS.test(jsdoc) || jsdoc.includes('void'))) {
      issues.push({
        severity: 'warning',
        message: 'Missing @returns documentation',
      });
    }

    if (standard.requireExamples && !PATTERNS.HAS_EXAMPLE.test(jsdoc)) {
      issues.push({
        severity: 'info',
        message: 'Consider adding @example for complex functions',
      });
    }

    if (standard.requireComplexity && !PATTERNS.HAS_COMPLEXITY.test(jsdoc)) {
      issues.push({
        severity: 'info',
        message: 'Consider adding @complexity annotation',
      });
    }
  }

  // Check for neural/AI specific documentation
  if (PATTERNS.NEURAL_PATTERN.test(jsdoc)) {
    if (!PATTERNS.HAS_PERFORMANCE.test(jsdoc)) {
      issues.push({
        severity: 'info',
        message: 'Consider adding @performance notes for neural operations',
      });
    }
  }

  return { issues };
}

/**
 * Check if function is public and requires documentation.
 */
function isPublicFunction(line) {
  return (
    line.includes('export') ||
    !(line.includes('private') || line.includes('protected'))
  );
}

/**
 * Generate intelligent suggestions for improving documentation.
 */
function generateSuggestions(analysis, standard) {
  const { quality, issues } = analysis;

  if (quality.coverage < standard.threshold) {
    analysis.suggestions.push(
      `📈 Increase documentation coverage from ${quality.coverage}% to ${standard.threshold}%`
    );
  }

  if (!quality.hasFileHeader && standard.isCritical) {
    analysis.suggestions.push(
      '📝 Add comprehensive @fileoverview header with system context'
    );
  }

  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  if (errorCount > 0) {
    analysis.suggestions.push(
      `🚨 Fix ${errorCount} critical documentation errors`
    );
  }

  if (warningCount > 5) {
    analysis.suggestions.push(
      `⚠️ Address ${warningCount} documentation warnings for production readiness`
    );
  }

  if (standard.category === 'neural' || standard.category === 'coordination') {
    analysis.suggestions.push(
      '🧠 Add AI/ML-specific documentation: @complexity, @performance, @algorithm'
    );
  }
}

/**
 * Generate comprehensive documentation report.
 */
function generateReport(analyses) {
  const totalFiles = analyses.length;
  const errorFiles = analyses.filter((a) =>
    a.issues?.some((i) => i.severity === 'error')
  ).length;
  const warningFiles = analyses.filter((a) =>
    a.issues?.some((i) => i.severity === 'warning')
  ).length;

  const totalCoverage =
    analyses.reduce((sum, a) => sum + (a.quality?.coverage || 0), 0) /
    totalFiles;
  const averageQuality =
    analyses.reduce((sum, a) => sum + (a.quality?.qualityScore || 0), 0) /
    totalFiles;

  const report = {
    summary: {
      totalFiles,
      errorFiles,
      warningFiles,
      overallCoverage: Math.round(totalCoverage),
      averageQuality: Math.round(averageQuality),
      timestamp: new Date().toISOString(),
    },
    categories: {},
    criticalIssues: [],
    recommendations: [],
  };

  // Categorize results
  analyses.forEach((analysis) => {
    const category = analysis.category || 'general';
    if (!report.categories[category]) {
      report.categories[category] = {
        files: 0,
        coverage: 0,
        quality: 0,
        issues: 0,
      };
    }

    const cat = report.categories[category];
    cat.files++;
    cat.coverage += analysis.quality?.coverage || 0;
    cat.quality += analysis.quality?.qualityScore || 0;
    cat.issues += analysis.issues?.length || 0;
  });

  // Average category metrics
  Object.keys(report.categories).forEach((cat) => {
    const category = report.categories[cat];
    category.coverage = Math.round(category.coverage / category.files);
    category.quality = Math.round(category.quality / category.files);
  });

  // Generate recommendations
  if (totalCoverage < 80) {
    report.recommendations.push(
      '🎯 Focus on increasing overall documentation coverage above 80%'
    );
  }

  if (errorFiles > totalFiles * 0.1) {
    report.recommendations.push(
      '🚨 Address critical documentation errors in core system files'
    );
  }

  const neuralFiles = analyses.filter(
    (a) => a.category === 'neural' || a.isCritical
  );
  if (neuralFiles.length > 0) {
    const neuralCoverage =
      neuralFiles.reduce((sum, a) => sum + (a.quality?.coverage || 0), 0) /
      neuralFiles.length;
    if (neuralCoverage < 85) {
      report.recommendations.push(
        '🧠 Prioritize AI/neural system documentation for production readiness'
      );
    }
  }

  return report;
}

/**
 * Main execution function for advanced JSDoc analysis.
 */
async function main() {
  console.log('🔍 Advanced JSDoc Analysis for AI/Neural Systems\n');
  console.log('📊 Analyzing multi-language coordination architecture...\n');

  const srcFiles = getTsFiles('src');
  console.log(`📁 Found ${srcFiles.length} TypeScript files for analysis\n`);

  if (srcFiles.length === 0) {
    console.log('⚠️ No TypeScript files found in src directory');
    return;
  }

  const analyses = [];

  // Analyze each file
  for (const file of srcFiles) {
    process.stdout.write(`📋 Analyzing ${relative('.', file)}... `);
    const analysis = analyzeFileDocumentation(file);
    analyses.push(analysis);

    const status = analysis.error
      ? '❌'
      : analysis.quality?.coverage >= 80
        ? '✅'
        : analysis.quality?.coverage >= 60
          ? '🟡'
          : '🔴';
    console.log(`${status} (${analysis.quality?.coverage || 0}%)`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📈 ADVANCED JSDOC ANALYSIS REPORT');
  console.log('='.repeat(80));

  // Generate and display report
  const report = generateReport(analyses);

  console.log(`\n📊 SUMMARY`);
  console.log(`   Files Analyzed: ${report.summary.totalFiles}`);
  console.log(`   Overall Coverage: ${report.summary.overallCoverage}%`);
  console.log(`   Average Quality Score: ${report.summary.averageQuality}/100`);
  console.log(`   Files with Errors: ${report.summary.errorFiles}`);
  console.log(`   Files with Warnings: ${report.summary.warningFiles}`);

  console.log(`\n📁 CATEGORY BREAKDOWN`);
  Object.entries(report.categories).forEach(([category, stats]) => {
    const status =
      stats.coverage >= 80 ? '✅' : stats.coverage >= 60 ? '🟡' : '🔴';
    console.log(
      `   ${status} ${category.toUpperCase()}: ${stats.files} files, ${stats.coverage}% coverage, ${stats.issues} issues`
    );
  });

  if (report.recommendations.length > 0) {
    console.log(`\n🎯 RECOMMENDATIONS`);
    report.recommendations.forEach((rec) => console.log(`   ${rec}`));
  }

  // Show detailed issues for critical files
  const criticalIssues = analyses.filter(
    (a) => a.isCritical && a.issues?.length > 0
  );
  if (criticalIssues.length > 0) {
    console.log(`\n🚨 CRITICAL SYSTEM ISSUES`);
    criticalIssues.slice(0, 5).forEach((analysis) => {
      console.log(`   📄 ${relative('.', analysis.filepath)}`);
      analysis.issues.slice(0, 3).forEach((issue) => {
        const icon =
          issue.severity === 'error'
            ? '❌'
            : issue.severity === 'warning'
              ? '⚠️'
              : 'ℹ️';
        console.log(`      ${icon} Line ${issue.line}: ${issue.message}`);
      });
    });
  }

  // Save detailed report
  const reportPath = 'docs/generated/advanced-jsdoc-report.json';
  try {
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
  } catch (error) {
    console.log(`\n⚠️ Could not save report: ${error.message}`);
  }

  console.log(`\n🎯 Analysis complete! Focus areas:`);
  console.log(
    `   • Core systems: ${report.categories.core?.coverage || 0}% documented`
  );
  console.log(
    `   • Coordination: ${report.categories.coordination?.coverage || 0}% documented`
  );
  console.log(
    `   • Neural systems: ${report.categories.neural?.coverage || 0}% documented`
  );

  // Exit with appropriate code
  const exitCode = report.summary.errorFiles > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { analyzeFileDocumentation, CONFIG, PATTERNS };
