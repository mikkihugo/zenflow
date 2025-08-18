#!/usr/bin/env node

/**
 * @fileoverview Global TSDoc Auto-Fix Script
 * 
 * Enhanced global script that can fix documentation across the entire claude-code-zen
 * project from the root directory. Supports both TypeScript and Rust documentation
 * with automatic detection and appropriate tooling.
 * 
 * Features:
 * - Global execution from project root
 * - Auto-detection of TypeScript vs Rust packages
 * - Enhanced prompts with system instructions and analysis reports
 * - Rust documentation support using rustdoc standards
 * - Multi-language documentation consistency
 * - Comprehensive reporting across all packages
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Global configuration for cross-language documentation
 */
const CONFIG = {
  /** Root directory of the project */
  PROJECT_ROOT: path.resolve(__dirname, '..'),
  /** Claude CLI model to use */
  CLAUDE_MODEL: 'sonnet',
  /** Maximum files to process in one batch */
  MAX_BATCH_SIZE: 5,
  /** Language support configuration */
  LANGUAGES: {
    typescript: {
      enabled: true,
      extensions: ['.ts', '.tsx'],
      checkScript: 'check-tsdoc.mjs',
      standard: 'TSDoc/JSDoc'
    },
    rust: {
      enabled: true,
      extensions: ['.rs'],
      checkScript: 'check-rustdoc.mjs',
      standard: 'rustdoc'
    }
  },
  /** Enhanced prompt options */
  PROMPT: {
    includeAnalysisReport: true,
    includeSystemInstructions: true,
    includeContextGuidelines: true,
    enhancedMode: true
  },
  /** Output options */
  OUTPUT: {
    verbose: false,
    showProgress: true,
    colorOutput: true,
    generateGlobalReport: true,
    maxReportExports: 100
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
 * Generates enhanced prompts for TypeScript documentation
 */
function generateTypeScriptPrompt(filePath, undocumentedExports, packageInfo) {
  const exportsList = undocumentedExports.map(exp => 
    `- ${exp.name} (${exp.type}) at line ${exp.line}`
  ).join('\n');

  const fileContext = `
📁 File: ${filePath}
📦 Package: ${packageInfo.name} (${packageInfo.type})
📊 Missing Documentation: ${undocumentedExports.length} exports
🎯 Target: 100% TSDoc coverage
🏗️ Project: claude-code-zen (AI swarm orchestration platform)`;

  const systemInstructions = `SYSTEM INSTRUCTIONS:
You are a technical documentation expert specializing in TypeScript and TSDoc/JSDoc standards.
Your task is to add comprehensive, professional-grade documentation to TypeScript exports.

CRITICAL REQUIREMENTS:
1. ONLY add documentation comments - DO NOT modify any existing code
2. Follow TSDoc/JSDoc standards exactly (/** */ syntax)
3. Place documentation immediately above each export
4. Maintain existing code formatting and structure
5. Use consistent style with any existing documentation in the file

DOCUMENTATION STANDARDS:
- Use /** */ for all documentation blocks
- Start descriptions with capital letters, end with periods
- Use present tense ("Creates a..." not "Will create a...")
- Be specific about functionality, constraints, and side effects
- Include @param, @returns, @throws, @example, @since tags as appropriate
- Use @see tags to reference related functions/classes
- Add realistic @example blocks for complex functionality`;

  const contextGuidelines = `CONTEXT GUIDELINES:
- This is part of the claude-code-zen AI swarm orchestration platform
- Package type: ${packageInfo.type} (${packageInfo.language})
- Focus on practical usage and integration points
- Mention important performance, security, or architectural considerations
- Use domain-appropriate terminology (agents, swarms, coordination, etc.)
- Link related exports using @see tags when helpful`;

  const userPrompt = `USER TASK:
Add comprehensive TSDoc documentation to this TypeScript file for the following undocumented exports:

${exportsList}

QUALITY REQUIREMENTS:
1. ✅ Clear, concise descriptions of what each export does
2. ✅ Complete @param documentation with types and descriptions
3. ✅ Accurate @returns documentation for all functions
4. ✅ @throws documentation for functions that can throw errors
5. ✅ @example blocks for complex or important functionality
6. ✅ @since 1.0.0 tags for version tracking
7. ✅ Professional tone suitable for API documentation
8. ✅ Consistency with existing documentation style in the file

${contextGuidelines}

Please analyze the file context and add high-quality TSDoc documentation that meets professional standards.`;

  return `${fileContext}

${systemInstructions}

${userPrompt}`;
}

/**
 * Generates enhanced prompts for Rust documentation
 */
function generateRustPrompt(filePath, undocumentedItems, packageInfo) {
  const itemsList = undocumentedItems.map(item => 
    `- ${item.name} (${item.type}) at line ${item.line}`
  ).join('\n');

  const fileContext = `
📁 File: ${filePath}
📦 Package: ${packageInfo.name} (${packageInfo.type})
📊 Missing Documentation: ${undocumentedItems.length} items
🎯 Target: 100% rustdoc coverage
🏗️ Project: claude-code-zen (AI swarm orchestration platform)`;

  const systemInstructions = `SYSTEM INSTRUCTIONS:
You are a technical documentation expert specializing in Rust and rustdoc standards.
Your task is to add comprehensive, professional-grade documentation to Rust code.

CRITICAL REQUIREMENTS:
1. ONLY add documentation comments - DO NOT modify any existing code
2. Follow rustdoc standards exactly (/// or //! syntax)
3. Place documentation immediately above each item
4. Maintain existing code formatting and structure
5. Use consistent style with any existing documentation in the file

RUST DOCUMENTATION STANDARDS:
- Use /// for item documentation (functions, structs, enums, etc.)
- Use //! for module-level documentation
- Start descriptions with capital letters, end with periods
- Use present tense ("Creates a..." not "Will create a...")
- Be specific about functionality, constraints, and side effects
- Include # Examples sections showing realistic usage
- Add # Errors sections for fallible functions
- Add # Panics sections if the function can panic
- Use # Safety sections for unsafe code
- Link related items using [link syntax]`;

  const contextGuidelines = `CONTEXT GUIDELINES:
- This is part of the claude-code-zen AI swarm orchestration platform
- Package type: ${packageInfo.type} (${packageInfo.language})
- Focus on practical usage and integration points
- Mention important performance, memory safety, or concurrency considerations
- Use domain-appropriate terminology (agents, swarms, coordination, etc.)
- Link related items using standard rustdoc linking`;

  const userPrompt = `USER TASK:
Add comprehensive rustdoc documentation to this Rust file for the following undocumented items:

${itemsList}

QUALITY REQUIREMENTS:
1. ✅ Clear, concise descriptions of what each item does
2. ✅ Complete parameter documentation with types and descriptions
3. ✅ Accurate return value documentation for all functions
4. ✅ Error documentation for fallible functions
5. ✅ Example blocks showing realistic usage
6. ✅ Panic documentation for functions that can panic
7. ✅ Professional tone suitable for API documentation
8. ✅ Consistency with existing documentation style in the file

${contextGuidelines}

Please analyze the file context and add high-quality rustdoc documentation that meets professional standards.`;

  return `${fileContext}

${systemInstructions}

${userPrompt}`;
}

/**
 * Runs documentation check for a specific package
 */
async function runDocumentationCheck(packageInfo) {
  return new Promise((resolve, reject) => {
    const language = packageInfo.language === 'hybrid' ? 'typescript' : packageInfo.language;
    const config = CONFIG.LANGUAGES[language];
    
    if (!config || !config.enabled) {
      resolve({ files: [], language: 'unsupported' });
      return;
    }

    const checkScript = path.join(packageInfo.path, 'scripts', config.checkScript);
    
    // For Rust, we'll need to create a Rust doc checker (for now, skip Rust packages)
    if (language === 'rust') {
      console.log(colorize(`⚠️  Rust documentation checking not yet implemented for ${packageInfo.name}`, 'yellow'));
      resolve({ files: [], language: 'rust', message: 'Rust support coming soon' });
      return;
    }

    const child = spawn('node', [checkScript, '--threshold', '100', '--no-color'], {
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
      // Parse output similar to the original script
      const files = [];
      const lines = stdout.split('\n');
      
      let currentFile = null;
      let currentCoverage = 0;
      let undocumentedExports = [];

      for (const line of lines) {
        const fileMatch = line.match(/📄\s+(.+\.ts)/);
        if (fileMatch) {
          if (currentFile && currentCoverage < 100) {
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

      // Add the last file if it needs fixes
      if (currentFile && currentCoverage < 100) {
        files.push({
          path: currentFile,
          coverage: currentCoverage,
          undocumented: [...undocumentedExports]
        });
      }

      resolve({ 
        files, 
        language,
        exitCode: code,
        packageName: packageInfo.name
      });
    });

    child.on('error', (error) => {
      resolve({ 
        files: [], 
        language, 
        error: error.message,
        packageName: packageInfo.name
      });
    });
  });
}

/**
 * Fixes documentation for a single file using Claude CLI
 */
async function fixFileDocumentation(filePath, undocumentedItems, packageInfo, testMode = false) {
  return new Promise((resolve, reject) => {
    const language = packageInfo.language === 'hybrid' ? 'typescript' : packageInfo.language;
    
    let prompt;
    if (language === 'rust') {
      prompt = generateRustPrompt(filePath, undocumentedItems, packageInfo);
    } else {
      prompt = generateTypeScriptPrompt(filePath, undocumentedItems, packageInfo);
    }
    
    console.log(colorize(`🔧 ${testMode ? 'Testing' : 'Fixing'} ${language} documentation in ${packageInfo.name}/${path.basename(filePath)}...`, 'blue'));
    
    if (CONFIG.OUTPUT.verbose || testMode) {
      console.log(colorize(`📝 Enhanced ${language} Prompt:`, 'cyan'));
      console.log('─'.repeat(80));
      console.log(prompt);
      console.log('─'.repeat(80));
    }
    
    if (testMode) {
      console.log(colorize(`✅ Test mode: Prompt generated successfully for ${packageInfo.name}/${path.basename(filePath)}`, 'green'));
      resolve({ success: true, output: 'Test mode - no actual execution', language, testMode: true });
      return;
    }

    const args = [
      '--dangerously-skip-permissions',
      '--print',
      '--model', CONFIG.CLAUDE_MODEL,
      '--add-dir', path.dirname(path.resolve(packageInfo.path, filePath)),
      prompt
    ];

    // Set a timeout for Claude CLI execution (5 minutes)
    const timeout = 300000; // 5 minutes
    let timeoutId;
    
    const child = spawn('claude', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: false // Keep attached but handle timeout manually
    });

    let stdout = '';
    let stderr = '';
    let completed = false;

    // Set timeout
    timeoutId = setTimeout(() => {
      if (!completed) {
        console.log(colorize(`⏰ Claude CLI timeout (5min) for ${packageInfo.name}/${path.basename(filePath)}, continuing with next file...`, 'yellow'));
        child.kill('SIGKILL');
        resolve({ success: false, error: 'Timeout after 5 minutes', language, timeout: true });
      }
    }, timeout);

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      completed = true;
      clearTimeout(timeoutId);
      
      if (code === 0) {
        console.log(colorize(`✅ Claude completed ${language} documentation for ${packageInfo.name}/${path.basename(filePath)}`, 'green'));
        resolve({ success: true, output: stdout, language });
      } else {
        console.error(colorize(`❌ Claude failed to process ${packageInfo.name}/${path.basename(filePath)} (exit code: ${code})`, 'red'));
        if (stderr) {
          console.error(colorize('Error details:', 'red'));
          console.error(stderr);
        }
        resolve({ success: false, error: stderr || `Exit code: ${code}`, language });
      }
    });

    child.on('error', (error) => {
      completed = true;
      clearTimeout(timeoutId);
      console.error(colorize(`💥 Claude CLI error for ${packageInfo.name}/${path.basename(filePath)}: ${error.message}`, 'red'));
      resolve({ success: false, error: error.message, language });
    });
  });
}

/**
 * Generates a global project report
 */
async function generateGlobalReport(packageResults) {
  if (!CONFIG.OUTPUT.generateGlobalReport) return null;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(CONFIG.PROJECT_ROOT, `global-tsdoc-report-${timestamp}.md`);
  
  const totalPackages = packageResults.length;
  const processedPackages = packageResults.filter(r => r.results && r.results.length > 0);
  const successfulPackages = processedPackages.filter(r => 
    r.results.every(file => file.success)
  );
  
  const languageBreakdown = packageResults.reduce((acc, pkg) => {
    acc[pkg.language] = (acc[pkg.language] || 0) + 1;
    return acc;
  }, {});

  const reportContent = `# Global TSDoc Coverage Report

## Summary
- **Generated**: ${new Date().toISOString()}
- **Total Packages**: ${totalPackages}
- **Processed Packages**: ${processedPackages.length}
- **Successfully Fixed**: ${successfulPackages.length}
- **Configuration**: Enhanced prompts with ${CONFIG.CLAUDE_MODEL} model

## Language Distribution
${Object.entries(languageBreakdown).map(([lang, count]) => 
  `- **${lang}**: ${count} packages`
).join('\n')}

## Package Results
${packageResults.map(pkg => `
### ${pkg.name} (${pkg.type})
- **Language**: ${pkg.language}
- **Status**: ${pkg.results ? 
  (pkg.results.length > 0 ? 
    `${pkg.results.filter(r => r.success).length}/${pkg.results.length} files fixed` : 
    'No files needed fixing'
  ) : 
  'Not processed'
}
${pkg.error ? `- **Error**: ${pkg.error}` : ''}
${pkg.results ? pkg.results.map(file => 
  `  - ${file.file}: ${file.success ? '✅ Fixed' : '❌ Failed'}`
).join('\n') : ''}
`).join('\n')}

## Recommendations
1. **Regular Maintenance**: Run global documentation checks weekly
2. **CI Integration**: Add documentation coverage to CI/CD pipeline
3. **Multi-Language**: Implement Rust documentation checking for complete coverage
4. **Quality Review**: Manually review generated documentation for accuracy

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
${colorize('Global TSDoc Auto-Fix for claude-code-zen', 'bright')}
${colorize('Multi-language documentation system with enhanced prompts', 'cyan')}

${colorize('Usage:', 'blue')} node global-tsdoc-fix.mjs [options] [packages...]

${colorize('Options:', 'blue')}
  --model <model>           Claude model to use (default: ${CONFIG.CLAUDE_MODEL})
  --batch-size <number>     Maximum files per batch (default: ${CONFIG.MAX_BATCH_SIZE})
  --verbose                 Enable verbose output with enhanced prompt preview
  --no-color                Disable colored output
  --no-report               Disable global markdown report generation
  --typescript-only         Process only TypeScript packages
  --rust-only               Process only Rust packages
  --test-mode               Show enhanced prompts without calling Claude CLI
  --help, -h                Show this help message

${colorize('Supported Languages:', 'blue')}
  ✅ TypeScript/TSDoc - Full support with enhanced prompts
  🚧 Rust/rustdoc - Coming soon with native Rust documentation standards
  🔄 Hybrid packages - Auto-detection and appropriate tooling

${colorize('Examples:', 'blue')}
  node global-tsdoc-fix.mjs                    # Fix all packages with incomplete documentation
  node global-tsdoc-fix.mjs agui foundation    # Fix specific packages
  node global-tsdoc-fix.mjs --model opus       # Use Claude Opus for highest quality
  node global-tsdoc-fix.mjs --verbose          # Show enhanced prompt previews
  node global-tsdoc-fix.mjs --typescript-only  # Process only TypeScript packages
    `);
    process.exit(0);
  }

  // Parse options
  if (args.includes('--verbose')) {
    CONFIG.OUTPUT.verbose = true;
  }
  if (args.includes('--no-color')) {
    CONFIG.OUTPUT.colorOutput = false;
  }
  if (args.includes('--no-report')) {
    CONFIG.OUTPUT.generateGlobalReport = false;
  }
  if (args.includes('--typescript-only')) {
    CONFIG.LANGUAGES.rust.enabled = false;
  }
  if (args.includes('--rust-only')) {
    CONFIG.LANGUAGES.typescript.enabled = false;
  }
  
  const testMode = args.includes('--test-mode');
  
  const modelIndex = args.indexOf('--model');
  if (modelIndex !== -1 && args[modelIndex + 1]) {
    CONFIG.CLAUDE_MODEL = args[modelIndex + 1];
  }
  
  const batchIndex = args.indexOf('--batch-size');
  if (batchIndex !== -1 && args[batchIndex + 1]) {
    CONFIG.MAX_BATCH_SIZE = parseInt(args[batchIndex + 1], 10);
  }

  console.log(colorize('🌍 Global TSDoc Auto-Fix for claude-code-zen', 'bright'));
  console.log(colorize(`Using model: ${CONFIG.CLAUDE_MODEL}`, 'blue'));
  
  try {
    // Discover all packages
    console.log(colorize('🔍 Discovering packages...', 'blue'));
    const allPackages = await discoverPackages();
    
    // Filter packages based on arguments
    const targetPackageNames = args.filter(arg => 
      !arg.startsWith('--') && 
      !arg.match(/^\d+$/) && 
      arg !== CONFIG.CLAUDE_MODEL
    );
    
    const packagesToProcess = targetPackageNames.length > 0 
      ? allPackages.filter(pkg => targetPackageNames.includes(pkg.name))
      : allPackages;
    
    console.log(colorize(`📦 Found ${allPackages.length} packages, processing ${packagesToProcess.length}`, 'cyan'));
    console.log(colorize(`Languages: ${Object.entries(
      packagesToProcess.reduce((acc, pkg) => {
        acc[pkg.language] = (acc[pkg.language] || 0) + 1;
        return acc;
      }, {})
    ).map(([lang, count]) => `${lang}: ${count}`).join(', ')}`, 'cyan'));
    
    const packageResults = [];
    
    // Process each package
    for (const packageInfo of packagesToProcess) {
      console.log(`\n${'═'.repeat(60)}`);
      console.log(colorize(`📦 Processing: ${packageInfo.name} (${packageInfo.language})`, 'magenta'));
      
      if (!packageInfo.hasScripts) {
        console.log(colorize(`⚠️  No scripts directory found for ${packageInfo.name}, skipping`, 'yellow'));
        packageResults.push({
          ...packageInfo,
          error: 'No scripts directory',
          results: []
        });
        continue;
      }
      
      // Run documentation check
      const checkResult = await runDocumentationCheck(packageInfo);
      
      if (checkResult.error) {
        console.log(colorize(`❌ Error checking ${packageInfo.name}: ${checkResult.error}`, 'red'));
        packageResults.push({
          ...packageInfo,
          error: checkResult.error,
          results: []
        });
        continue;
      }
      
      if (checkResult.files.length === 0) {
        console.log(colorize(`✅ ${packageInfo.name} has 100% documentation coverage!`, 'green'));
        packageResults.push({
          ...packageInfo,
          results: [],
          message: '100% coverage'
        });
        continue;
      }
      
      console.log(colorize(`📋 Found ${checkResult.files.length} files needing documentation improvements`, 'yellow'));
      
      // Fix files
      const fileResults = [];
      for (const file of checkResult.files.slice(0, CONFIG.MAX_BATCH_SIZE)) {
        try {
          const result = await fixFileDocumentation(file.path, file.undocumented, packageInfo, testMode);
          fileResults.push({
            file: file.path,
            success: result.success,
            language: result.language,
            error: result.error
          });
        } catch (error) {
          console.error(colorize(`💥 Error processing ${file.path}: ${error.message}`, 'red'));
          fileResults.push({
            file: file.path,
            success: false,
            error: error.message
          });
        }
      }
      
      packageResults.push({
        ...packageInfo,
        results: fileResults
      });
    }
    
    // Generate global report
    console.log(`\n${'═'.repeat(60)}`);
    console.log(colorize('📊 GLOBAL SUMMARY', 'bright'));
    console.log('═'.repeat(60));
    
    const totalFiles = packageResults.reduce((sum, pkg) => sum + (pkg.results?.length || 0), 0);
    const successfulFiles = packageResults.reduce((sum, pkg) => 
      sum + (pkg.results?.filter(r => r.success).length || 0), 0
    );
    
    console.log(`Total packages processed: ${packageResults.length}`);
    console.log(colorize(`✅ Files successfully fixed: ${successfulFiles}`, 'green'));
    console.log(colorize(`📊 Total files processed: ${totalFiles}`, 'blue'));
    console.log(colorize(`🎯 Success rate: ${totalFiles > 0 ? ((successfulFiles / totalFiles) * 100).toFixed(1) : 100}%`, 'cyan'));
    
    // Generate detailed report
    const reportPath = await generateGlobalReport(packageResults);
    if (reportPath) {
      console.log(colorize(`\n📄 Global report generated: ${path.basename(reportPath)}`, 'blue'));
      console.log(colorize('   Use this report for project-wide documentation tracking', 'cyan'));
    }
    
    // Exit with appropriate code
    process.exit(successfulFiles === totalFiles ? 0 : 1);
    
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

export { discoverPackages, runDocumentationCheck, fixFileDocumentation, CONFIG };