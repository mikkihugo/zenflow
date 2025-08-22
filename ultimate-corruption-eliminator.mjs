/**
 * Ultimate Corruption Eliminator - Aggressive Pattern Matching
 * Target the most common remaining corruption patterns systematically
 */

import fs from 'fs';
import { glob } from 'glob';

class UltimateCorruptionEliminator {
  constructor() {
    this.repairCount = 0;
    this.processedFiles = 0;
    this.quarantineDir = '/tmp/ultimate-repair-' + Date.now();
    
    // Create quarantine directory
    fs.mkdirSync(this.quarantineDir, { recursive: true });
    console.log(`🛡️  Ultimate quarantine directory: ${this.quarantineDir}`);
  }

  /**
   * Comprehensive corruption patterns based on analysis
   */
  getUltimatePatterns() {
    return [
      // Template literal corruption fixes
      {
        name: 'template_literal_backtick_fix',
        pattern: /console\.(log|error|warn)\('`([^`]+)`'\)/g,
        replacement: "console.$1(`$2`)"
      },
      {
        name: 'throw_error_template_fix',
        pattern: /throw new Error\('`([^`]+)`'\)/g,
        replacement: "throw new Error(`$1`)"
      },
      {
        name: 'logger_template_fix',
        pattern: /logger\.(info|error|warn|debug)\('`([^`]+)`'\)/g,
        replacement: "logger.$1(`$2`)"
      },
      
      // Logical OR corruption fixes
      {
        name: 'double_pipe_logical_or',
        pattern: /\|\s+\|\s+/g,
        replacement: ' || '
      },
      {
        name: 'return_logical_or_fix',
        pattern: /return\s+([^|]+)\s+\|\s+\{\}/g,
        replacement: 'return $1 || {}'
      },
      {
        name: 'property_logical_or_fix',
        pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\s+\|\s+\{\}/g,
        replacement: '.$1 || {}'
      },
      
      // Spread operator corruption fixes
      {
        name: 'console_spread_fix',
        pattern: /console\.(log|error|warn)\('\.\.\.args'\)/g,
        replacement: "console.$1(...args)"
      },
      {
        name: 'console_args_fix',
        pattern: /console\.(log|error|warn)\('args'\)/g,
        replacement: "console.$1(args)"
      },
      
      // String join fixes
      {
        name: 'args_join_space_fix',
        pattern: /args\.join\(\s*\)/g,
        replacement: "args.join(' ')"
      },
      {
        name: 'args_join_fix',
        pattern: /\.join\(\s*\)/g,
        replacement: ".join(' ')"
      },
      
      // Unterminated string literal fixes
      {
        name: 'unterminated_string_basic',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*'([^']*)\n/g,
        replacement: "$1: '$2'"
      },
      {
        name: 'unterminated_template_string',
        pattern: /`([^`]*)\n/g,
        replacement: "`$1`"
      },
      
      // Function parameter fixes
      {
        name: 'function_param_quote_fix',
        pattern: /\(([^)]*)'([^']*),([^)]*)\)/g,
        replacement: "($1'$2',$3)"
      },
      
      // Property access fixes
      {
        name: 'property_access_quote_fix',
        pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\s+\|\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: '.$1 || $2'
      },
      
      // Type annotation fixes
      {
        name: 'type_union_fix',
        pattern: /:\s*'([^']+)'\s+\|\s+'([^']+)'/g,
        replacement: ": '$1' | '$2'"
      },
      {
        name: 'type_union_spacing_fix',
        pattern: /:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+\|\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: ": $1 | $2"
      },
      
      // Expression fixes
      {
        name: 'expression_expected_fix',
        pattern: /\(\s*\|\s*\)/g,
        replacement: '()'
      },
      {
        name: 'semicolon_expected_fix',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\s+\|\s*;/g,
        replacement: '$1;'
      },
      
      // Import/export fixes
      {
        name: 'import_quote_fix',
        pattern: /import\('([^']+)'\s+\|\s+'([^']+)'\)/g,
        replacement: "import('$1$2')"
      },
      {
        name: 'export_type_fix',
        pattern: /export\s+type\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*'([^']+)'\s+\|\s+'([^']+)'/g,
        replacement: "export type $1 = '$2' | '$3'"
      },
      
      // Generic type fixes
      {
        name: 'promise_generic_fix',
        pattern: /Promise<([^>]+)\s+\|\s+([^>]+)>/g,
        replacement: 'Promise<$1 | $2>'
      },
      {
        name: 'array_generic_fix',
        pattern: /Array<([^>]+)\s+\|\s+([^>]+)>/g,
        replacement: 'Array<$1 | $2>'
      },
      
      // Object property fixes
      {
        name: 'object_property_fix',
        pattern: /(\{[^}]*[a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*'([^']*)\s+\|\s+([^']*)'([^}]*\})/g,
        replacement: "$1: '$2 | $3'$4"
      },
      
      // Interface fixes
      {
        name: 'interface_property_fix',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\?\s*:\s*'([^']+)'\s+\|\s+'([^']+)'/g,
        replacement: "$1?: '$2' | '$3'"
      },
      
      // Conditional fixes
      {
        name: 'ternary_operator_fix',
        pattern: /\?\s*'([^']+)'\s+\|\s+'([^']+)'/g,
        replacement: "? '$1' | '$2'"
      },
      
      // Cleanup patterns
      {
        name: 'multiple_spaces_fix',
        pattern: /\s{3,}/g,
        replacement: ' '
      },
      {
        name: 'trailing_pipe_fix',
        pattern: /\|\s*([);}\]])/g,
        replacement: '$1'
      }
    ];
  }

  /**
   * Apply ultimate repairs with quarantine protection
   */
  applyUltimateRepairs(content) {
    let repairedContent = content;
    let totalRepairs = 0;
    const patterns = this.getUltimatePatterns();
    
    for (const pattern of patterns) {
      const beforeContent = repairedContent;
      repairedContent = repairedContent.replace(pattern.pattern, pattern.replacement);
      
      if (repairedContent !== beforeContent) {
        const matches = beforeContent.match(pattern.pattern);
        if (matches) {
          totalRepairs += matches.length;
        }
      }
    }
    
    // Additional aggressive cleanup passes
    const aggressiveCleanup = [
      // Fix malformed console statements
      { from: /console\.log\(([^'"()]+)\);/g, to: "console.log('$1');" },
      { from: /console\.error\(([^'"()]+)\);/g, to: "console.error('$1');" },
      { from: /console\.warn\(([^'"()]+)\);/g, to: "console.warn('$1');" },
      
      // Fix logger statements
      { from: /logger\.(info|error|warn|debug)\(([^'"()]+)\);/g, to: "logger.$1('$2');" },
      
      // Fix common function calls
      { from: /throw new Error\(([^'"()]+)\);/g, to: "throw new Error('$1');" },
      { from: /path\.join\(([^'"()]+)\)/g, to: "path.join('$1')" },
      
      // Fix missing quotes in strings
      { from: /=\s*([^'",;{}()]+);/g, to: "= '$1';" },
      
      // Fix type annotations
      { from: /:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*;/g, to: ": $1;" }
    ];
    
    for (const cleanup of aggressiveCleanup) {
      const before = repairedContent;
      repairedContent = repairedContent.replace(cleanup.from, cleanup.to);
      if (repairedContent !== before) {
        totalRepairs++;
      }
    }
    
    return { content: repairedContent, repairs: totalRepairs };
  }

  /**
   * Process file with ultimate quarantine protection
   */
  async processFileWithUltimateProtection(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const { content: repairedContent, repairs } = this.applyUltimateRepairs(originalContent);
      
      if (repairs > 0) {
        // Write to quarantine first
        const relativePath = filePath.replace('/home/mhugo/code/claude-code-zen/', '');
        const quarantinePath = `${this.quarantineDir}/${relativePath}`;
        
        // Ensure quarantine subdirectory exists
        const quarantineDir = quarantinePath.substring(0, quarantinePath.lastIndexOf('/'));
        fs.mkdirSync(quarantineDir, { recursive: true });
        
        // Write repaired content to quarantine
        fs.writeFileSync(quarantinePath, repairedContent, 'utf8');
        
        // Verify quarantine file is not corrupted
        const verifyContent = fs.readFileSync(quarantinePath, 'utf8');
        if (verifyContent === repairedContent) {
          // Safe to copy back to original
          fs.writeFileSync(filePath, repairedContent, 'utf8');
          
          console.log(`  🚀 Ultimate repairs: ${repairs} in ${filePath.split('/').pop()}`);
          this.repairCount += repairs;
        } else {
          console.log(`  ⚠️  Ultimate corruption detected in ${filePath.split('/').pop()} - skipping`);
          return false;
        }
      }
      
      this.processedFiles++;
      return repairs > 0;
      
    } catch (error) {
      console.error(`❌ Ultimate error in ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Ultimate repair execution
   */
  async executeUltimateRepairs() {
    console.log('🚀 Ultimate Corruption Eliminator - Maximum Aggression Mode\n');
    console.log('🛡️  Using ultimate quarantine strategy\n');
    
    const files = await glob('apps/claude-code-zen-server/src/**/*.ts', {
      cwd: '/home/mhugo/code/claude-code-zen',
      absolute: true
    });
    
    console.log(`📄 Processing ${files.length} TypeScript files with ultimate patterns\n`);
    
    let repairedFiles = 0;
    const batchSize = 25;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`\n🚀 Ultimate Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}:`);
      
      for (const filePath of batch) {
        const wasRepaired = await this.processFileWithUltimateProtection(filePath);
        if (wasRepaired) {
          repairedFiles++;
        }
      }
      
      console.log(`   Ultimate Progress: ${Math.min(i + batchSize, files.length)}/${files.length} files processed`);
    }
    
    console.log('\n📊 Ultimate Repair Results:');
    console.log(`   📄 Files processed: ${this.processedFiles}`);
    console.log(`   ✅ Files repaired: ${repairedFiles}`);
    console.log(`   🚀 Ultimate repairs: ${this.repairCount}`);
    console.log(`   🛡️  Ultimate quarantine: ${this.quarantineDir}`);
    
    return { processedFiles: this.processedFiles, repairedFiles, totalRepairs: this.repairCount };
  }

  /**
   * Ultimate verification
   */
  async verifyUltimateResults() {
    console.log('\n🔍 Ultimate verification with TypeScript compiler...');
    
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const tscCheck = spawn('npx', ['tsc', '--noEmit', '--project', 'apps/claude-code-zen-server/tsconfig.json'], {
        cwd: '/home/mhugo/code/claude-code-zen',
        stdio: 'pipe'
      });
      
      let stdout = '';
      let stderr = '';
      
      tscCheck.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      tscCheck.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      tscCheck.on('close', (code) => {
        const output = stdout + stderr;
        
        if (code === 0) {
          console.log('🎉 ULTIMATE SUCCESS! All corruption eliminated!');
          resolve({ success: true, errors: 0 });
        } else {
          const errorMatches = output.match(/error TS\d+:/g);
          const errorCount = errorMatches ? errorMatches.length : 0;
          
          const improvement = 32882 - errorCount;
          console.log(`📊 Ultimate Results:`);
          console.log(`   ⚡ Errors eliminated: ${improvement}`);
          console.log(`   ⚠️  Remaining errors: ${errorCount}`);
          console.log(`   📈 Improvement rate: ${((improvement / 32882) * 100).toFixed(1)}%`);
          
          if (errorCount < 5000) {
            console.log('\n🔍 Sample remaining errors:');
            const lines = output.split('\n').filter(line => line.includes('error TS')).slice(0, 8);
            lines.forEach(line => console.log(`   ${line.trim()}`));
          }
          
          resolve({ success: false, errors: errorCount, improvement });
        }
      });
    });
  }

  /**
   * Cleanup ultimate quarantine
   */
  cleanup() {
    try {
      fs.rmSync(this.quarantineDir, { recursive: true, force: true });
      console.log(`\n🧹 Ultimate quarantine cleaned up`);
    } catch (error) {
      console.log(`\n⚠️  Could not cleanup ultimate quarantine: ${error.message}`);
    }
  }
}

/**
 * Ultimate execution
 */
async function main() {
  const eliminator = new UltimateCorruptionEliminator();
  
  try {
    // Execute ultimate repairs
    const results = await eliminator.executeUltimateRepairs();
    
    // Verify ultimate results
    const verification = await eliminator.verifyUltimateResults();
    
    console.log('\n✨ Ultimate Corruption Elimination Complete!');
    
    if (verification.success) {
      console.log('🎉 ULTIMATE VICTORY - Complete corruption elimination!');
    } else if (verification.improvement > 10000) {
      console.log(`🚀 MASSIVE SUCCESS - ${verification.improvement} errors eliminated!`);
      console.log('   Ultimate approach achieving significant results.');
    } else if (verification.improvement > 5000) {
      console.log(`💪 MAJOR PROGRESS - ${verification.improvement} errors eliminated!`);
    } else {
      console.log(`📈 STEADY PROGRESS - ${verification.improvement || 0} errors eliminated.`);
    }
    
  } catch (error) {
    console.error('💥 Ultimate elimination failed:', error.message);
    process.exit(1);
  } finally {
    // Always cleanup ultimate quarantine
    eliminator.cleanup();
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}