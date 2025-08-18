#!/usr/bin/env node

/**
 * @fileoverview Rust Documentation Coverage Checker
 * 
 * Analyzes Rust source files for missing rustdoc documentation and provides
 * coverage reports similar to the TypeScript TSDoc checker. Supports standard
 * rustdoc conventions and integrates with the global documentation system.
 * 
 * Features:
 * - Scans Rust source files for documentation coverage
 * - Identifies undocumented public items (functions, structs, enums, etc.)
 * - Provides detailed coverage reports with quality ratings
 * - Supports custom thresholds and verbose output
 * - Integrates with claude-code-zen global documentation workflow
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuration for Rust documentation analysis
 */
const CONFIG = {
  /** Default coverage threshold */
  DEFAULT_THRESHOLD: 90,
  /** File extensions to analyze */
  RUST_EXTENSIONS: ['.rs'],
  /** Output formatting options */
  OUTPUT: {
    colorOutput: true,
    verbose: false,
    showDocumented: false
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
 * Analyzes a Rust file for documentation coverage
 */
async function analyzeRustFile(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    
    const items = [];
    const documentedItems = new Set();
    
    // Simple regex patterns for Rust items (this is a basic implementation)
    const patterns = {
      function: /pub\s+fn\s+(\w+)/,
      struct: /pub\s+struct\s+(\w+)/,
      enum: /pub\s+enum\s+(\w+)/,
      trait: /pub\s+trait\s+(\w+)/,
      impl: /impl(?:\s*<[^>]*>)?\s+(\w+)/,
      const: /pub\s+const\s+(\w+)/,
      static: /pub\s+static\s+(\w+)/,
      type: /pub\s+type\s+(\w+)/,
      mod: /pub\s+mod\s+(\w+)/
    };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check for documentation comments
      if (line.startsWith('///') || line.startsWith('//!')) {
        // Look ahead to find what this documents
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          if (nextLine === '' || nextLine.startsWith('//')) continue;
          
          // Check if this line contains a documentable item
          for (const [type, pattern] of Object.entries(patterns)) {
            const match = nextLine.match(pattern);
            if (match) {
              documentedItems.add(`${match[1]}_${j + 1}`);
              break;
            }
          }
          break;
        }
      }
      
      // Check for public items
      for (const [type, pattern] of Object.entries(patterns)) {
        const match = line.match(pattern);
        if (match) {
          items.push({
            name: match[1],
            type: type,
            line: i + 1,
            documented: documentedItems.has(`${match[1]}_${i + 1}`)
          });
        }
      }
    }
    
    const totalItems = items.length;
    const documentedCount = items.filter(item => item.documented).length;
    const coverage = totalItems > 0 ? Math.round((documentedCount / totalItems) * 100) : 100;
    
    return {
      path: path.basename(filePath),
      fullPath: filePath,
      totalExports: totalItems,
      documentedExports: documentedCount,
      coverage: coverage,
      items: items,
      undocumentedItems: items.filter(item => !item.documented)
    };
    
  } catch (error) {
    return {
      path: path.basename(filePath),
      fullPath: filePath,
      error: error.message,
      totalExports: 0,
      documentedExports: 0,
      coverage: 0,
      items: [],
      undocumentedItems: []
    };
  }
}

/**
 * Gets quality rating based on coverage percentage
 */
function getQualityRating(coverage) {
  if (coverage >= 95) return 'excellent';
  if (coverage >= 80) return 'good';
  if (coverage >= 60) return 'fair';
  if (coverage >= 40) return 'poor';
  return 'critical';
}

/**
 * Finds all Rust files in a directory
 */
async function findRustFiles(dirPath) {
  const rustFiles = [];
  
  async function scanDirectory(currentPath) {
    try {
      const entries = await fs.promises.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'target') {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && CONFIG.RUST_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
          rustFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }
  
  await scanDirectory(dirPath);
  return rustFiles;
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  // Parse command line arguments
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colorize('Rust Documentation Coverage Checker', 'bright')}
${colorize('Analyzes Rust code for missing rustdoc documentation', 'cyan')}

${colorize('Usage:', 'blue')} node check-rustdoc.mjs [options] [files...]

${colorize('Options:', 'blue')}
  --threshold <number>      Minimum coverage threshold (default: ${CONFIG.DEFAULT_THRESHOLD})
  --verbose                 Show detailed analysis information
  --show-documented         Show documented items in output
  --no-color                Disable colored output
  --help, -h                Show this help message

${colorize('Examples:', 'blue')}
  node check-rustdoc.mjs                     # Check all Rust files
  node check-rustdoc.mjs src/lib.rs          # Check specific file
  node check-rustdoc.mjs --threshold 100     # Require 100% coverage
  node check-rustdoc.mjs --verbose           # Show detailed output
    `);
    process.exit(0);
  }

  // Parse options
  let threshold = CONFIG.DEFAULT_THRESHOLD;
  const thresholdIndex = args.indexOf('--threshold');
  if (thresholdIndex !== -1 && args[thresholdIndex + 1]) {
    threshold = parseInt(args[thresholdIndex + 1], 10);
  }
  
  if (args.includes('--verbose')) {
    CONFIG.OUTPUT.verbose = true;
  }
  if (args.includes('--show-documented')) {
    CONFIG.OUTPUT.showDocumented = true;
  }
  if (args.includes('--no-color')) {
    CONFIG.OUTPUT.colorOutput = false;
  }
  
  // Get target files
  const fileArgs = args.filter(arg => 
    !arg.startsWith('--') && 
    !arg.match(/^\d+$/) && 
    parseInt(arg) !== threshold
  );
  
  let targetFiles = [];
  if (fileArgs.length > 0) {
    // Specific files provided
    targetFiles = fileArgs;
  } else {
    // Find all Rust files in current directory
    targetFiles = await findRustFiles('.');
  }
  
  if (targetFiles.length === 0) {
    console.log(colorize('📦 No Rust files found to analyze', 'yellow'));
    process.exit(0);
  }
  
  console.log(colorize('🔍 Rust Documentation Coverage Analysis', 'bright'));
  console.log(colorize(`Analyzing ${targetFiles.length} files...`, 'blue'));
  
  const results = [];
  let totalItems = 0;
  let totalDocumented = 0;
  
  // Analyze each file
  for (const filePath of targetFiles) {
    const result = await analyzeRustFile(filePath);
    results.push(result);
    
    if (!result.error) {
      totalItems += result.totalExports;
      totalDocumented += result.documentedExports;
      
      console.log(`\n📄 ${colorize(result.path, 'cyan')}`);
      console.log('─'.repeat(50));
      console.log(`Total items: ${result.totalExports}`);
      console.log(`Documented: ${colorize(result.documentedExports.toString(), 'green')}`);
      console.log(`Coverage: ${colorize(`${result.coverage}%`, result.coverage >= threshold ? 'green' : 'red')}`);
      console.log(`Quality: ${colorize(getQualityRating(result.coverage), result.coverage >= 80 ? 'green' : result.coverage >= 60 ? 'yellow' : 'red')}`);
      
      if (result.undocumentedItems.length > 0) {
        console.log(`\n${colorize('❌ Missing rustdoc documentation:', 'red')}`);
        result.undocumentedItems.forEach(item => {
          console.log(`   • ${colorize(item.name, 'yellow')} (${item.type}, line ${item.line})`);
        });
      }
      
      if (CONFIG.OUTPUT.showDocumented && result.items.filter(i => i.documented).length > 0) {
        console.log(`\n${colorize('✅ Documented items:', 'green')}`);
        result.items.filter(i => i.documented).forEach(item => {
          console.log(`   • ${colorize(item.name, 'green')} (${item.type}, line ${item.line})`);
        });
      }
    } else {
      console.log(`\n📄 ${colorize(result.path, 'cyan')}`);
      console.log('─'.repeat(50));
      console.log(colorize(`❌ Error: ${result.error}`, 'red'));
    }
  }
  
  // Summary
  const overallCoverage = totalItems > 0 ? Math.round((totalDocumented / totalItems) * 100) : 100;
  const passesThreshold = overallCoverage >= threshold;
  
  console.log(`\n${'═'.repeat(60)}`);
  console.log(colorize('📊 RUST DOCUMENTATION COVERAGE SUMMARY', 'bright'));
  console.log('═'.repeat(60));
  console.log(`Files analyzed: ${results.filter(r => !r.error).length}`);
  console.log(`Total items: ${totalItems}`);
  console.log(`Total documented: ${colorize(totalDocumented.toString(), 'green')}`);
  console.log(`Overall coverage: ${colorize(`${overallCoverage}%`, passesThreshold ? 'green' : 'red')}`);
  
  if (passesThreshold) {
    console.log(`\n${colorize('🎉 EXCELLENT RUSTDOC COVERAGE! 🎉', 'green')}`);
  } else {
    console.log(`\n${colorize('📝 NEEDS IMPROVEMENT', 'red')} DOCUMENTATION COVERAGE! 📝`);
  }
  
  // Quality breakdown
  const qualityBreakdown = results.reduce((acc, result) => {
    if (!result.error) {
      const quality = getQualityRating(result.coverage);
      acc[quality] = (acc[quality] || 0) + 1;
    }
    return acc;
  }, {});
  
  console.log(`\n📈 File Quality Breakdown:`);
  Object.entries(qualityBreakdown).forEach(([quality, count]) => {
    const color = quality === 'excellent' || quality === 'good' ? 'green' : 
                  quality === 'fair' ? 'yellow' : 'red';
    console.log(`   ${colorize(quality, color)}: ${count} files`);
  });
  
  if (!passesThreshold) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(colorize('💡 TIP: For automated rustdoc improvements', 'cyan'));
    console.log(colorize('Run: pnpm docs:fix', 'bright') + colorize(' (uses enhanced Rust documentation prompts)', 'cyan'));
    console.log(colorize('Or use the global script: node scripts/global-tsdoc-fix.mjs --rust-only', 'bright'));
  }
  
  // Exit with appropriate code
  process.exit(passesThreshold ? 0 : 1);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(colorize(`💥 Unhandled error: ${error.message}`, 'red'));
    process.exit(1);
  });
}

export { analyzeRustFile, findRustFiles, CONFIG };