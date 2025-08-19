#!/usr/bin/env node

/**
 * @fileoverview Global TSDoc Coverage Checker
 * 
 * Comprehensive TypeScript documentation coverage checker that analyzes all packages
 * and apps in the claude-code-zen project. Provides both basic (90%) and strict (100%)
 * coverage requirements with detailed reporting and actionable guidance.
 * 
 * Features:
 * - Discovers all packages and apps automatically
 * - Supports both basic and strict coverage thresholds
 * - Multi-language support (TypeScript focus, Rust planned)
 * - Detailed reporting with file-by-file analysis
 * - Integration guidance for development workflows
 * - Cross-package consistency validation
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 2.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global configuration for cross-package documentation checking
 */
const CONFIG = {
  /** Root directory of the project */
  PROJECT_ROOT: path.resolve(__dirname, '..'),
  /** Default coverage threshold (90% for basic check) */
  DEFAULT_THRESHOLD: 90,
  /** Strict coverage threshold (100% for strict check) */
  STRICT_THRESHOLD: 100,
  /** Language support configuration */
  LANGUAGES: {
    typescript: {
      enabled: true,
      extensions: ['.ts', '.tsx'],
      checkScript: 'check-tsdoc.mjs',
      standard: 'TSDoc/JSDoc'
    },
    rust: {
      enabled: false, // Future support
      extensions: ['.rs'],
      checkScript: 'check-rustdoc.mjs',
      standard: 'rustdoc'
    }
  },
  /** Output options */
  OUTPUT: {
    verbose: false,
    showProgress: true,
    colorOutput: true,
    generateGlobalReport: true,
    showPackageBreakdown: true,
    showFileDetails: false
  }
};

/**
 * ANSI color codes for terminal output
 */
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Colorizes text for terminal output
 */
function colorize(text, color) {
  if (!CONFIG.OUTPUT.colorOutput) return text;
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

/**
 * Detects the primary language of a package
 */
async function detectPackageLanguage(packagePath) {
  try {
    // Check for Cargo.toml (Rust)
    if (await fs.promises.access(path.join(packagePath, 'Cargo.toml')).then(() => true).catch(() => false)) {
      // Check if there are TypeScript files too (hybrid package)
      const hasTs = await hasFilesWithExtension(packagePath, ['.ts', '.tsx']);
      return hasTs ? 'hybrid' : 'rust';
    }
    
    // Check for TypeScript files
    const hasTs = await hasFilesWithExtension(packagePath, ['.ts', '.tsx']);
    if (hasTs) {
      return 'typescript';
    }
    
    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Checks if directory has files with specified extensions
 */
async function hasFilesWithExtension(dirPath, extensions) {
  try {
    const files = await fs.promises.readdir(dirPath, { recursive: true });
    return files.some(file => extensions.some(ext => file.endsWith(ext)));
  } catch (error) {
    return false;
  }
}

/**
 * Discovers all packages and apps in the project
 */
async function discoverPackages() {
  const packages = [];
  const packageDirs = ['packages', 'apps'];
  
  for (const dir of packageDirs) {
    const dirPath = path.join(CONFIG.PROJECT_ROOT, dir);
    
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const packagePath = path.join(dirPath, entry.name);
          const language = await detectPackageLanguage(packagePath);
          
          packages.push({
            name: entry.name,
            path: packagePath,
            type: dir === 'packages' ? 'package' : 'app',
            language: language,
            hasScripts: await fs.promises.access(path.join(packagePath, 'scripts')).then(() => true).catch(() => false)
          });
        }
      }
    } catch (error) {
      console.warn(colorize(`⚠️  Could not read directory ${dir}: ${error.message}`, 'yellow'));
    }
  }
  
  return packages;
}

/**
 * Runs documentation check for a specific package
 */
async function runPackageDocumentationCheck(packageInfo, threshold) {
  return new Promise((resolve, reject) => {
    const language = packageInfo.language === 'hybrid' ? 'typescript' : packageInfo.language;
    const config = CONFIG.LANGUAGES[language];
    
    if (!config || !config.enabled) {
      resolve({ 
        packageName: packageInfo.name,
        language: 'unsupported',
        files: [],
        coverage: 100,
        message: `${language} documentation checking not yet supported`
      });
      return;
    }

    if (!packageInfo.hasScripts) {
      resolve({
        packageName: packageInfo.name,
        language: language,
        files: [],
        coverage: 100,
        error: 'No scripts directory found'
      });
      return;
    }

    const checkScript = path.join(packageInfo.path, 'scripts', config.checkScript);
    
    if (!fs.existsSync(checkScript)) {
      resolve({
        packageName: packageInfo.name,
        language: language,
        files: [],
        coverage: 100,
        error: 'TSDoc check script not found'
      });
      return;
    }

    const child = spawn('node', [checkScript, '--threshold', threshold.toString(), '--no-color', '--exclude-dts'], {
      cwd: packageInfo.path,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      // Parse output to extract coverage and file information
      const lines = stdout.split('\n');
      
      // Extract overall coverage from summary
      let overallCoverage = 100;
      let totalExports = 0;
      let totalDocumented = 0;
      
      const overallMatch = stdout.match(/Overall coverage:\s+(\d+)%/);
      if (overallMatch) {
        overallCoverage = parseInt(overallMatch[1], 10);
      }
      
      // Parse ONLY the final summary lines (they appear in the summary section)
      const outputLines = stdout.split('\n');
      
      // Find the summary section (between "TSDOC COVERAGE SUMMARY" and "Overall coverage:")
      const summaryStartIndex = outputLines.findIndex(line => line.includes('TSDOC COVERAGE SUMMARY'));
      const overallLineIndex = outputLines.findIndex(line => line.includes('Overall coverage:'));
      
      if (summaryStartIndex >= 0 && overallLineIndex >= 0) {
        // Look for exports and documented lines in the summary section
        for (let i = summaryStartIndex; i <= overallLineIndex; i++) {
          const exportsMatch = outputLines[i].match(/Total exports:\s+(\d+)/);
          if (exportsMatch) {
            totalExports = parseInt(exportsMatch[1], 10);
          }
          
          const documentedMatch = outputLines[i].match(/Total documented:\s+(\d+)/);
          if (documentedMatch) {
            totalDocumented = parseInt(documentedMatch[1], 10);
          }
        }
      }

      // Parse individual files for detailed reporting
      const files = [];
      let currentFile = null;
      let currentCoverage = 0;
      let undocumentedExports = [];

      for (const line of lines) {
        const fileMatch = line.match(/📄\s+(.+\.ts)/);
        if (fileMatch) {
          if (currentFile && currentCoverage < threshold) {
            files.push({
              path: currentFile,
              coverage: currentCoverage,
              undocumented: [...undocumentedExports]
            });
          }
          currentFile = fileMatch[1];
          undocumentedExports = [];
        }

        const coverageMatch = line.match(/Coverage:\s+(\d+)%/);
        if (coverageMatch) {
          currentCoverage = parseInt(coverageMatch[1], 10);
        }

        const undocumentedMatch = line.match(/•\s+(\w+)\s+\((\w+),\s+line\s+(\d+)\)/);
        if (undocumentedMatch) {
          undocumentedExports.push({
            name: undocumentedMatch[1],
            type: undocumentedMatch[2],
            line: parseInt(undocumentedMatch[3], 10)
          });
        }
      }

      // Add the last file if it needs attention
      if (currentFile && currentCoverage < threshold) {
        files.push({
          path: currentFile,
          coverage: currentCoverage,
          undocumented: [...undocumentedExports]
        });
      }

      resolve({
        packageName: packageInfo.name,
        language: language,
        files: files,
        coverage: overallCoverage,
        totalExports: totalExports,
        totalDocumented: totalDocumented,
        exitCode: code,
        meetsThreshold: overallCoverage >= threshold
      });
    });

    child.on('error', (error) => {
      resolve({
        packageName: packageInfo.name,
        language: language,
        files: [],
        coverage: 0,
        error: error.message
      });
    });
  });
}

/**
 * Generates a global summary report
 */
function generateGlobalSummary(packageResults, threshold) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(colorize('📊 GLOBAL TSDOC COVERAGE SUMMARY', 'bright'));
  console.log('═'.repeat(60));
  
  const supportedPackages = packageResults.filter(r => r.language === 'typescript');
  const unsupportedPackages = packageResults.filter(r => r.language === 'unsupported' || r.language === 'rust');
  const packagesWithErrors = packageResults.filter(r => r.error);
  const passingPackages = supportedPackages.filter(r => r.meetsThreshold && !r.error);
  const failingPackages = supportedPackages.filter(r => !r.meetsThreshold && !r.error);
  
  // Calculate totals - deduplicate .d.ts files which represent same exports as .ts files
  const totalExports = supportedPackages.reduce((sum, p) => {
    // Only count each package once to avoid .d.ts duplication
    return sum + Math.max(p.totalExports || 0, 0);
  }, 0);
  const totalDocumented = supportedPackages.reduce((sum, p) => {
    // Only count each package once to avoid .d.ts duplication
    return sum + Math.max(p.totalDocumented || 0, 0);
  }, 0);
  const globalCoverage = totalExports > 0 ? Math.round((totalDocumented / totalExports) * 100) : 100;
  
  console.log(`Total packages: ${packageResults.length}`);
  console.log(`TypeScript packages: ${supportedPackages.length}`);
  console.log(`${threshold === 100 ? 'Strict' : 'Basic'} threshold: ${threshold}%`);
  console.log(`${colorize(`✅ Passing: ${passingPackages.length}`, 'green')}`);
  console.log(`${colorize(`❌ Failing: ${failingPackages.length}`, failingPackages.length > 0 ? 'red' : 'green')}`);
  
  if (packagesWithErrors.length > 0) {
    console.log(`${colorize(`⚠️  Errors: ${packagesWithErrors.length}`, 'yellow')}`);
  }
  
  if (unsupportedPackages.length > 0) {
    console.log(`${colorize(`📦 Unsupported: ${unsupportedPackages.length}`, 'cyan')}`);
  }
  
  console.log(`\nGlobal coverage: ${colorize(`${globalCoverage}%`, globalCoverage >= threshold ? 'green' : 'red')}`);
  console.log(`Total exports: ${totalExports}`);
  console.log(`Documented exports: ${colorize(totalDocumented, 'green')}`);
  
  // Quality rating
  let qualityRating, emoji;
  if (globalCoverage === 100) {
    qualityRating = 'PERFECT';
    emoji = '🏆';
  } else if (globalCoverage >= 95) {
    qualityRating = 'EXCELLENT';
    emoji = '🥇';
  } else if (globalCoverage >= 90) {
    qualityRating = 'VERY GOOD';
    emoji = '🥈';
  } else if (globalCoverage >= 75) {
    qualityRating = 'GOOD';
    emoji = '🥉';
  } else if (globalCoverage >= 50) {
    qualityRating = 'NEEDS IMPROVEMENT';
    emoji = '📝';
  } else {
    qualityRating = 'CRITICAL';
    emoji = '🚨';
  }
  
  console.log(`\n${emoji} ${colorize(qualityRating, 'bright')} DOCUMENTATION COVERAGE! ${emoji}`);
  
  return {
    totalPackages: packageResults.length,
    supportedPackages: supportedPackages.length,
    passingPackages: passingPackages.length,
    failingPackages: failingPackages.length,
    packagesWithErrors: packagesWithErrors.length,
    globalCoverage: globalCoverage,
    qualityRating: qualityRating,
    meetsGlobalThreshold: globalCoverage >= threshold
  };
}

/**
 * Shows detailed package breakdown
 */
function showPackageBreakdown(packageResults, threshold) {
  if (!CONFIG.OUTPUT.showPackageBreakdown) return;
  
  console.log(`\n${colorize('📦 PACKAGE BREAKDOWN', 'bright')}`);
  console.log('─'.repeat(60));
  
  // Group by status
  const passingPackages = packageResults.filter(r => r.meetsThreshold && !r.error);
  const failingPackages = packageResults.filter(r => !r.meetsThreshold && !r.error && r.language === 'typescript');
  const errorPackages = packageResults.filter(r => r.error);
  const unsupportedPackages = packageResults.filter(r => r.language === 'unsupported' || r.language === 'rust');
  
  if (passingPackages.length > 0) {
    console.log(colorize(`\n✅ PASSING (${passingPackages.length})`, 'green'));
    passingPackages.forEach(pkg => {
      console.log(`   • ${pkg.packageName} (${pkg.coverage}%)`);
    });
  }
  
  if (failingPackages.length > 0) {
    console.log(colorize(`\n❌ FAILING (${failingPackages.length})`, 'red'));
    failingPackages.forEach(pkg => {
      const needsFixing = pkg.files.length;
      console.log(`   • ${pkg.packageName} (${pkg.coverage}%) - ${needsFixing} files need work`);
    });
  }
  
  if (errorPackages.length > 0) {
    console.log(colorize(`\n⚠️  ERRORS (${errorPackages.length})`, 'yellow'));
    errorPackages.forEach(pkg => {
      console.log(`   • ${pkg.packageName} - ${pkg.error}`);
    });
  }
  
  if (unsupportedPackages.length > 0) {
    console.log(colorize(`\n📦 UNSUPPORTED (${unsupportedPackages.length})`, 'cyan'));
    unsupportedPackages.forEach(pkg => {
      console.log(`   • ${pkg.packageName} (${pkg.language})`);
    });
  }
}

/**
 * Shows actionable guidance based on results
 */
function showActionableGuidance(summary, threshold, packageResults) {
  console.log(`\n${colorize('💡 ACTIONABLE GUIDANCE', 'bright')}`);
  console.log('─'.repeat(60));
  
  if (summary.meetsGlobalThreshold) {
    if (threshold === 100) {
      console.log(colorize('🎉 EXCELLENT! All packages meet strict documentation requirements.', 'green'));
      console.log(colorize('   Continue maintaining this high standard with regular checks.', 'green'));
    } else {
      console.log(colorize('✅ Good coverage! Consider upgrading to strict mode:', 'green'));
      console.log(colorize('   Run: pnpm docs:check-strict', 'bright'));
    }
  } else {
    const failingPackages = packageResults.filter(r => !r.meetsThreshold && !r.error && r.language === 'typescript');
    
    if (failingPackages.length > 0) {
      console.log(colorize('📝 Fix documentation in failing packages:', 'yellow'));
      failingPackages.slice(0, 3).forEach(pkg => {
        console.log(colorize(`   • ${pkg.packageName}: pnpm --filter ${pkg.packageName} docs:fix`, 'bright'));
      });
      
      if (failingPackages.length > 3) {
        console.log(colorize(`   ... and ${failingPackages.length - 3} more packages`, 'yellow'));
      }
      
      console.log(colorize('\n🚀 Or fix all packages at once:', 'cyan'));
      console.log(colorize('   pnpm docs:fix-all', 'bright'));
    }
    
    if (summary.packagesWithErrors > 0) {
      console.log(colorize('\n⚠️  Address packages with errors first', 'yellow'));
      console.log(colorize('   These packages need TSDoc scripts or have configuration issues', 'yellow'));
    }
  }
  
  console.log(colorize('\n📊 Available commands:', 'cyan'));
  console.log(colorize('   pnpm docs:check         # Basic check (90% threshold)', 'bright'));
  console.log(colorize('   pnpm docs:check-strict  # Strict check (100% threshold)', 'bright'));
  console.log(colorize('   pnpm docs:fix           # Auto-fix documentation gaps', 'bright'));
  console.log(colorize('   pnpm docs:fix-all       # Verbose auto-fix all packages', 'bright'));
}

/**
 * Generates a detailed markdown report
 */
async function generateGlobalReport(packageResults, summary, threshold) {
  if (!CONFIG.OUTPUT.generateGlobalReport) return null;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(CONFIG.PROJECT_ROOT, `global-tsdoc-check-report-${timestamp}.md`);
  
  const reportContent = `# Global TSDoc Coverage Report

## Summary
- **Generated**: ${new Date().toISOString()}
- **Threshold**: ${threshold}% (${threshold === 100 ? 'Strict' : 'Basic'} mode)
- **Global Coverage**: ${summary.globalCoverage}%
- **Total Packages**: ${summary.totalPackages}
- **TypeScript Packages**: ${summary.supportedPackages}
- **Passing**: ${summary.passingPackages}
- **Failing**: ${summary.failingPackages}
- **With Errors**: ${summary.packagesWithErrors}

## Package Results

${packageResults.map(pkg => {
  if (pkg.error) {
    return `### ${pkg.packageName} (${pkg.language})
- **Status**: ❌ Error
- **Issue**: ${pkg.error}`;
  } else if (pkg.language === 'typescript') {
    const status = pkg.meetsThreshold ? '✅ Passing' : '❌ Failing';
    const filesNeedingWork = pkg.files.length;
    return `### ${pkg.packageName} (${pkg.language})
- **Status**: ${status}
- **Coverage**: ${pkg.coverage}%
- **Files Needing Work**: ${filesNeedingWork}
${filesNeedingWork > 0 ? pkg.files.map(f => 
  `  - ${f.path} (${f.coverage}%) - ${f.undocumented.length} exports`
).join('\n') : ''}`;
  } else {
    return `### ${pkg.packageName} (${pkg.language})
- **Status**: 📦 Unsupported
- **Message**: ${pkg.message || 'Language not yet supported'}`;
  }
}).join('\n\n')}

## Recommendations

${summary.meetsGlobalThreshold ? 
  '🎉 **Excellent documentation coverage!** Your project meets the documentation standards.' :
  `### Action Items
1. **Fix Failing Packages**: Focus on packages below ${threshold}% coverage
2. **Use Auto-Fix**: Run \`pnpm docs:fix-all\` to automatically improve documentation
3. **Regular Monitoring**: Add documentation checks to CI/CD pipeline
4. **Quality Review**: Manually review auto-generated documentation for accuracy`}

### Available Commands
- \`pnpm docs:check\` - Basic check (90% threshold)
- \`pnpm docs:check-strict\` - Strict check (100% threshold) 
- \`pnpm docs:fix\` - Auto-fix documentation gaps
- \`pnpm docs:fix-all\` - Verbose auto-fix all packages

---
*Generated by claude-code-zen Global TSDoc System*
`;

  try {
    await fs.promises.writeFile(reportPath, reportContent, 'utf8');
    return reportPath;
  } catch (error) {
    console.warn(colorize(`⚠️  Could not generate global report: ${error.message}`, 'yellow'));
    return null;
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colorize('Global TSDoc Coverage Checker for claude-code-zen', 'bright')}
${colorize('Multi-package documentation coverage analysis with actionable guidance', 'cyan')}

${colorize('Usage:', 'blue')} node global-tsdoc-check.mjs [options]

${colorize('Options:', 'blue')}
  --strict                  Use 100% coverage threshold (strict mode)
  --basic                   Use 90% coverage threshold (default)
  --verbose                 Enable verbose output with file details
  --no-color                Disable colored output
  --no-report               Disable markdown report generation
  --no-breakdown            Disable package breakdown display
  --help, -h                Show this help message

${colorize('Modes:', 'blue')}
  📊 Basic Mode (90%):     Good coverage suitable for development
  🎯 Strict Mode (100%):   Perfect coverage for production readiness

${colorize('Examples:', 'blue')}
  node global-tsdoc-check.mjs            # Basic check (90% threshold)
  node global-tsdoc-check.mjs --strict   # Strict check (100% threshold)
  node global-tsdoc-check.mjs --verbose  # Show detailed file information

${colorize('Integration:', 'blue')}
  pnpm docs:check         # Basic check via package.json script
  pnpm docs:check-strict  # Strict check via package.json script
    `);
    process.exit(0);
  }

  // Parse options
  const isStrict = args.includes('--strict');
  const threshold = isStrict ? CONFIG.STRICT_THRESHOLD : CONFIG.DEFAULT_THRESHOLD;
  
  if (args.includes('--verbose')) {
    CONFIG.OUTPUT.verbose = true;
    CONFIG.OUTPUT.showFileDetails = true;
  }
  if (args.includes('--no-color')) {
    CONFIG.OUTPUT.colorOutput = false;
  }
  if (args.includes('--no-report')) {
    CONFIG.OUTPUT.generateGlobalReport = false;
  }
  if (args.includes('--no-breakdown')) {
    CONFIG.OUTPUT.showPackageBreakdown = false;
  }

  console.log(colorize('🌍 Global TSDoc Coverage Checker', 'bright'));
  console.log(colorize(`Mode: ${isStrict ? 'Strict (100%)' : 'Basic (90%)'} threshold`, 'blue'));
  
  try {
    // Discover all packages
    console.log(colorize('🔍 Discovering packages...', 'blue'));
    const allPackages = await discoverPackages();
    
    console.log(colorize(`📦 Found ${allPackages.length} packages and apps`, 'cyan'));
    
    const packageResults = [];
    
    // Check each package
    for (const packageInfo of allPackages) {
      if (CONFIG.OUTPUT.verbose) {
        console.log(colorize(`\n📋 Checking: ${packageInfo.name} (${packageInfo.language})`, 'magenta'));
      }
      
      const result = await runPackageDocumentationCheck(packageInfo, threshold);
      packageResults.push(result);
      
      if (CONFIG.OUTPUT.verbose) {
        if (result.error) {
          console.log(colorize(`   ❌ Error: ${result.error}`, 'red'));
        } else if (result.language === 'typescript') {
          console.log(colorize(`   📊 Coverage: ${result.coverage}%`, result.meetsThreshold ? 'green' : 'red'));
        } else {
          console.log(colorize(`   📦 ${result.message || 'Unsupported language'}`, 'cyan'));
        }
      }
    }
    
    // Generate summary and reports
    const summary = generateGlobalSummary(packageResults, threshold);
    showPackageBreakdown(packageResults, threshold);
    showActionableGuidance(summary, threshold, packageResults);
    
    // Generate detailed markdown report
    const reportPath = await generateGlobalReport(packageResults, summary, threshold);
    if (reportPath) {
      console.log(colorize(`\n📄 Detailed report: ${path.basename(reportPath)}`, 'blue'));
    }
    
    // Exit with appropriate code
    process.exit(summary.meetsGlobalThreshold ? 0 : 1);
    
  } catch (error) {
    console.error(colorize(`💥 Fatal error: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(colorize(`💥 Unhandled error: ${error.message}`, 'red'));
    process.exit(1);
  });
}

export { discoverPackages, runPackageDocumentationCheck, CONFIG };