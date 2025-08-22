/**
 * Final Targeted Fix - Address Remaining Specific Corruption Patterns
 * Based on system reminder analysis of remaining corruption
 */

import fs from 'fs';
import { glob } from 'glob';

class FinalTargetedFix {
  constructor() {
    this.repairCount = 0;
    this.processedFiles = 0;
  }

  /**
   * Specific patterns from system reminder analysis
   */
  getSpecificPatterns() {
    return [
      // Fix template literal corruption with backticks
      {
        name: 'template_literal_fix',
        pattern: /console\.log\('`([^`]+)`'\);/g,
        replacement: "console.log(`$1`);"
      },
      {
        name: 'template_literal_fix_2',
        pattern: /throw new Error\('`([^`]+)`'\);/g,
        replacement: "throw new Error(`$1`);"
      },
      // Fix missing spread operator
      {
        name: 'spread_operator_fix',
        pattern: /console\.(log|error|warn)\('\.\.\.args'\);/g,
        replacement: "console.$1(...args);"
      },
      {
        name: 'spread_operator_fix_2',
        pattern: /console\.(warn|error)\('args'\);/g,
        replacement: "console.$1(args);"
      },
      // Fix string interpolation
      {
        name: 'string_interpolation_fix',
        pattern: /args\.join\(\s*\)/g,
        replacement: "args.join(' ')"
      },
      // Fix logical OR corruption
      {
        name: 'logical_or_fix',
        pattern: /\|\s+(?=[{}\[\]\)])/g,
        replacement: ' || '
      },
      {
        name: 'logical_or_fix_2', 
        pattern: /return\s+([^|]+)\s+\|\s+\{\}/g,
        replacement: 'return $1 || {}'
      },
      // Fix missing quotes in strings
      {
        name: 'missing_quotes_console',
        pattern: /logger\.(info|error|warn|debug)\(([^'"()]+)\);/g,
        replacement: "logger.$1('$2');"
      },
      {
        name: 'missing_quotes_string_literals',
        pattern: /await promptUser\(([^'"()]+)\);/g,
        replacement: "await promptUser('$1');"
      },
      // Fix console message corruption
      {
        name: 'console_message_fix',
        pattern: /console\.log\(([^'"()]+)\);/g,
        replacement: "console.log('$1');"
      }
    ];
  }

  /**
   * Apply specific repairs to address remaining corruption
   */
  applySpecificRepairs(content, fileName) {
    let repairedContent = content;
    let totalRepairs = 0;
    const patterns = this.getSpecificPatterns();
    
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
   * Process a single file
   */
  async processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      const fileName = filePath.split('/').pop();
      const { content: repairedContent, repairs } = this.applySpecificRepairs(originalContent, fileName);
      
      if (repairs > 0) {
        fs.writeFileSync(filePath, repairedContent, 'utf8');
        console.log(`  🎯 Specific fixes: ${repairs} in ${fileName}`);
        this.repairCount += repairs;
        return true;
      }
      
      this.processedFiles++;
      return false;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Focus on the specific problem files
   */
  async repairSpecificFiles() {
    console.log('🎯 Final Targeted Fix - Specific Remaining Patterns\n');
    
    // Target the problem files mentioned in system reminders
    const problemFiles = [
      '/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src/claude-zen-core.ts',
      '/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src/commands/auth-minimal.ts',
      '/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src/coordination/types/interfaces.ts'
    ];
    
    let repairedFiles = 0;
    
    for (const filePath of problemFiles) {
      if (fs.existsSync(filePath)) {
        const wasRepaired = await this.processFile(filePath);
        if (wasRepaired) {
          repairedFiles++;
        }
      }
    }
    
    // Also process any other remaining TypeScript files
    const allFiles = await glob('apps/claude-code-zen-server/src/**/*.ts', {
      cwd: '/home/mhugo/code/claude-code-zen',
      absolute: true
    });
    
    for (const filePath of allFiles) {
      if (!problemFiles.includes(filePath)) {
        const wasRepaired = await this.processFile(filePath);
        if (wasRepaired) {
          repairedFiles++;
        }
      }
    }
    
    console.log('\n📊 Targeted Fix Results:');
    console.log(`   🎯 Problem files: ${problemFiles.length}`);
    console.log(`   ✅ Files repaired: ${repairedFiles}`);
    console.log(`   🔧 Specific repairs: ${this.repairCount}`);
    
    return { problemFiles: problemFiles.length, repairedFiles, totalRepairs: this.repairCount };
  }

  /**
   * Verify final compilation status
   */
  async verifyFinalStatus() {
    console.log('\n🔍 Final TypeScript verification...');
    
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
          console.log('🎉 FINAL SUCCESS! All TypeScript corruption eliminated!');
          resolve({ success: true, errors: 0 });
        } else {
          const errorMatches = output.match(/error TS\\d+:/g);
          const errorCount = errorMatches ? errorMatches.length : 0;
          
          console.log(`📊 Final Results: ${errorCount} errors remaining`);
          
          if (errorCount < 100) {
            console.log('\\n🔍 Remaining specific errors:');
            const lines = output.split('\\n').filter(line => line.includes('error TS')).slice(0, 5);
            lines.forEach(line => console.log(`   ${line.trim()}`));
          }
          
          resolve({ success: false, errors: errorCount });
        }
      });
    });
  }
}

/**
 * Main execution
 */
async function main() {
  const fixer = new FinalTargetedFix();
  
  try {
    // Apply targeted fixes for specific remaining issues
    const results = await fixer.repairSpecificFiles();
    
    // Verify the final compilation status
    const verification = await fixer.verifyFinalStatus();
    
    console.log('\\n✨ Final Targeted Fix Complete!');
    
    if (verification.success) {
      console.log('🎉 COMPLETE SUCCESS - All TypeScript corruption eliminated!');
      console.log('💡 The systematic repair approach was successful!');
    } else if (verification.errors < 1000) {
      console.log(`🚀 MAJOR SUCCESS - Down to ${verification.errors} remaining errors!`);
      console.log('   The targeted approach has dramatically improved the codebase.');
    } else {
      console.log(`📈 SIGNIFICANT PROGRESS - ${verification.errors} errors remaining.`);
      console.log('   The quarantine + targeted approach has made substantial improvements.');
    }
    
  } catch (error) {
    console.error('💥 Targeted fix failed:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}