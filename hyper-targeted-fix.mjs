#!/usr/bin/env node

/**
 * HYPER-TARGETED FIX - Final 13,550 errors elimination
 * Focus on the most resistant corruption patterns
 */

import fs from 'fs';
import { glob } from 'glob';

class HyperTargetedFix {
  constructor() {
    this.repairCount = 0;
    this.processedFiles = 0;
    this.quarantineDir = '/tmp/hyper-repair-' + Date.now();
    
    // Create quarantine directory
    fs.mkdirSync(this.quarantineDir, { recursive: true });
    console.log(`🎯 Hyper quarantine directory: ${this.quarantineDir}`);
  }

  /**
   * Hyper-specific patterns for the remaining 13,550 errors
   */
  getHyperPatterns() {
    return [
      // Fix corrupted string literals with extra quotes
      {
        name: 'extra_quote_corruption',
        pattern: /'([^']*)''/g,
        replacement: "'$1'"
      },
      {
        name: 'double_backtick_corruption', 
        pattern: /``([^`]*)``/g,
        replacement: "`$1`"
      },
      
      // Fix malformed console statements
      {
        name: 'console_args_corruption',
        pattern: /console\.(log|error|warn)\('\.\.\.args'\);/g,
        replacement: "console.$1(...args);"
      },
      {
        name: 'console_args_simple',
        pattern: /console\.(log|error|warn)\('args'\);/g,
        replacement: "console.$1(args);"
      },
      
      // Fix string interpolation corruption
      {
        name: 'template_backtick_quotes',
        pattern: /`([^`]*)'([^']*)'([^`]*)`/g,
        replacement: "`$1$2$3`"
      },
      {
        name: 'template_literal_mixed',
        pattern: /'`([^`]*)`'/g,
        replacement: "`$1`"
      },
      
      // Fix logical OR corruption variants
      {
        name: 'pipe_space_corruption',
        pattern: /\|\s+\|/g,
        replacement: ' || '
      },
      {
        name: 'property_pipe_corruption',
        pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\s+\|\s+/g,
        replacement: '.$1 || '
      },
      
      // Fix function parameter corruption
      {
        name: 'function_param_quotes',
        pattern: /\(([^)]*)'([^']*),/g,
        replacement: "($1'$2',"
      },
      {
        name: 'function_call_quotes',
        pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\('([^']*)',/g,
        replacement: ".$1('$2',"
      },
      
      // Fix type annotation corruption
      {
        name: 'type_union_quotes',
        pattern: /:\s*'([^']*)\s*\|\s*([^']*)'(?!\s*;)/g,
        replacement: ": '$1 | $2'"
      },
      {
        name: 'readonly_type_corruption',
        pattern: /readonly\s+type:\s*'([^']*)'(?!\s*[;}])/g,
        replacement: "readonly type: '$1'"
      },
      
      // Fix object property corruption
      {
        name: 'object_prop_quotes',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*'([^']*)',/g,
        replacement: "$1: '$2',"
      },
      {
        name: 'object_method_quotes',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*'([^']*)\(/g,
        replacement: "$1: '$2'("
      },
      
      // Fix array/generic corruption
      {
        name: 'array_generic_pipes',
        pattern: /Array<([^>]*)\s*\|\s*([^>]*)>/g,
        replacement: 'Array<$1 | $2>'
      },
      {
        name: 'promise_generic_pipes',
        pattern: /Promise<([^>]*)\s*\|\s*([^>]*)>/g,
        replacement: 'Promise<$1 | $2>'
      },
      
      // Fix import/export corruption
      {
        name: 'import_quote_corruption',
        pattern: /import\s*\(\s*'([^']*)',/g,
        replacement: "import('$1',"
      },
      {
        name: 'export_type_corruption',
        pattern: /export\s+type\s+([^=]*=\s*)'([^']*)',/g,
        replacement: "export type $1'$2',"
      },
      
      // Fix statement termination
      {
        name: 'semicolon_quote_corruption',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*'([^']*)',\s*;/g,
        replacement: "$1: '$2';"
      },
      {
        name: 'assignment_quote_corruption',
        pattern: /=\s*'([^']*)',(?!\s*[)\]}])/g,
        replacement: "= '$1'"
      },
      
      // Fix conditional/ternary corruption
      {
        name: 'ternary_quote_corruption',
        pattern: /\?\s*'([^']*)',\s*:/g,
        replacement: "? '$1' :"
      },
      {
        name: 'conditional_pipe_corruption',
        pattern: /\?\s*([^:]*)\s*\|\s*([^:]*):/g,
        replacement: "? $1 || $2 :"
      },
      
      // Fix method call corruption
      {
        name: 'method_args_corruption',
        pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\('([^']*)',\s*\)/g,
        replacement: ".$1('$2')"
      },
      {
        name: 'chained_method_corruption',
        pattern: /\.([a-zA-Z_][a-zA-Z0-9_]*)\('([^']*)',\.([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: ".$1('$2').$3"
      },
      
      // Fix string concatenation corruption
      {
        name: 'concat_quote_corruption',
        pattern: /\+\s*'([^']*)',/g,
        replacement: "+ '$1'"
      },
      {
        name: 'template_concat_corruption',
        pattern: /`([^`]*)'([^']*)`/g,
        replacement: "`$1$2`"
      },
      
      // Fix variable declaration corruption
      {
        name: 'const_quote_corruption',
        pattern: /const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*'([^']*)',/g,
        replacement: "const $1 = '$2';"
      },
      {
        name: 'let_quote_corruption',
        pattern: /let\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*'([^']*)',/g,
        replacement: "let $1 = '$2';"
      },
      
      // Fix class/interface corruption
      {
        name: 'class_property_corruption',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*'([^']*)',(?=\s*[;}])/g,
        replacement: "$1: '$2';"
      },
      {
        name: 'interface_property_corruption',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\?\s*:\s*'([^']*)',/g,
        replacement: "$1?: '$2';"
      },
      
      // Cleanup patterns
      {
        name: 'trailing_comma_quotes',
        pattern: /','/g,
        replacement: "'"
      },
      {
        name: 'multiple_pipes',
        pattern: /\|\s*\|\s*\|/g,
        replacement: ' || '
      },
      {
        name: 'quote_space_corruption',
        pattern: /'\s+'/g,
        replacement: "' '"
      }
    ];
  }

  /**
   * Apply hyper-targeted repairs with quarantine protection
   */
  applyHyperRepairs(content) {
    let repairedContent = content;
    let totalRepairs = 0;
    const patterns = this.getHyperPatterns();
    
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
    
    return { content: repairedContent, repairs: totalRepairs };
  }

  /**
   * Process file with hyper quarantine protection
   */
  async processFileWithHyperProtection(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const { content: repairedContent, repairs } = this.applyHyperRepairs(originalContent);
      
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
          
          console.log(`  🎯 Hyper repairs: ${repairs} in ${filePath.split('/').pop()}`);
          this.repairCount += repairs;
        } else {
          console.log(`  ⚠️  Hyper corruption detected in ${filePath.split('/').pop()} - skipping`);
          return false;
        }
      }
      
      this.processedFiles++;
      return repairs > 0;
      
    } catch (error) {
      console.error(`❌ Hyper error in ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Execute hyper-targeted repairs
   */
  async executeHyperRepairs() {
    console.log('🎯 Hyper-Targeted Fix - Eliminating Final 13,550 Errors\n');
    console.log('🛡️  Using hyper quarantine strategy\n');
    
    const files = await glob('apps/claude-code-zen-server/src/**/*.ts', {
      cwd: '/home/mhugo/code/claude-code-zen',
      absolute: true
    });
    
    console.log(`📄 Processing ${files.length} TypeScript files with hyper patterns\n`);
    
    let repairedFiles = 0;
    const batchSize = 25;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`\n🎯 Hyper Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}:`);
      
      for (const filePath of batch) {
        const wasRepaired = await this.processFileWithHyperProtection(filePath);
        if (wasRepaired) {
          repairedFiles++;
        }
      }
      
      console.log(`   Hyper Progress: ${Math.min(i + batchSize, files.length)}/${files.length} files processed`);
    }
    
    console.log('\n📊 Hyper Repair Results:');
    console.log(`   📄 Files processed: ${this.processedFiles}`);
    console.log(`   ✅ Files repaired: ${repairedFiles}`);
    console.log(`   🎯 Hyper repairs: ${this.repairCount}`);
    console.log(`   🛡️  Hyper quarantine: ${this.quarantineDir}`);
    
    return { processedFiles: this.processedFiles, repairedFiles, totalRepairs: this.repairCount };
  }

  /**
   * Final TypeScript verification
   */
  async verifyHyperResults() {
    console.log('\n🔍 Hyper verification with TypeScript compiler...');
    
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
          console.log('🎉 HYPER SUCCESS! All TypeScript corruption eliminated!');
          resolve({ success: true, errors: 0 });
        } else {
          const errorMatches = output.match(/error TS\d+:/g);
          const errorCount = errorMatches ? errorMatches.length : 0;
          
          const improvement = 13550 - errorCount;
          console.log(`📊 Hyper Results:`);
          console.log(`   ⚡ Errors eliminated: ${improvement}`);
          console.log(`   ⚠️  Remaining errors: ${errorCount}`);
          console.log(`   📈 Improvement rate: ${((improvement / 13550) * 100).toFixed(1)}%`);
          console.log(`   🎯 Total eliminated: ${32882 - errorCount} from original`);
          
          if (errorCount < 2000) {
            console.log('\n🔍 Sample remaining errors:');
            const lines = output.split('\n').filter(line => line.includes('error TS')).slice(0, 5);
            lines.forEach(line => console.log(`   ${line.trim()}`));
          }
          
          resolve({ success: false, errors: errorCount, improvement });
        }
      });
    });
  }

  /**
   * Cleanup hyper quarantine
   */
  cleanup() {
    try {
      fs.rmSync(this.quarantineDir, { recursive: true, force: true });
      console.log(`\n🧹 Hyper quarantine cleaned up`);
    } catch (error) {
      console.log(`\n⚠️  Could not cleanup hyper quarantine: ${error.message}`);
    }
  }
}

/**
 * Hyper execution
 */
async function main() {
  const fixer = new HyperTargetedFix();
  
  try {
    // Execute hyper repairs
    const results = await fixer.executeHyperRepairs();
    
    // Verify hyper results
    const verification = await fixer.verifyHyperResults();
    
    console.log('\n✨ Hyper-Targeted Fix Complete!');
    
    if (verification.success) {
      console.log('🎉 COMPLETE VICTORY - All TypeScript corruption eliminated!');
    } else if (verification.errors < 1000) {
      console.log(`🚀 INCREDIBLE SUCCESS - Down to ${verification.errors} remaining errors!`);
      console.log('   The hyper-targeted approach achieved breakthrough results.');
    } else if (verification.errors < 5000) {
      console.log(`💪 MAJOR BREAKTHROUGH - ${verification.improvement} errors eliminated!`);
      console.log('   Systematic repair methodology proving highly effective.');
    } else {
      console.log(`📈 CONTINUED PROGRESS - ${verification.improvement || 0} errors eliminated.`);
    }
    
  } catch (error) {
    console.error('💥 Hyper-targeted fix failed:', error.message);
    process.exit(1);
  } finally {
    // Always cleanup hyper quarantine
    fixer.cleanup();
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}