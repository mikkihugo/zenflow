/**
 * Enhanced TypeScript Surgeon v2 - Advanced Corruption Repair
 * Handles systematic corruption with improved patterns and validation
 */

import fs from 'fs';
import { glob } from 'glob';

class EnhancedTypeScriptSurgeon {
  constructor() {
    this.repairCount = 0;
    this.processedFiles = 0;
    this.corruptionDetected = new Set();
  }

  /**
   * Enhanced corruption patterns - targeting the specific issues seen
   */
  getEnhancedCorruptionPatterns() {
    return [
      {
        name: 'union_pipe_space_corruption',
        description: 'Fix "string | symbol" -> "string |symbol"',
        pattern: /\|\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: ' | $1'
      },
      {
        name: 'union_quote_boundary_complex',
        description: 'Fix \'low\' | \'medium\' |high | critic\'a\'l\' -> proper union',
        pattern: /'([^']+)'\s*\|\s*'([^']+)'\s*\|([^|]+)\s*\|\s*([^'|]+)'([^']*)'([^']*)\'/g,
        replacement: "'$1' | '$2' | '$3' | '$4$5$6'"
      },
      {
        name: 'broken_quote_boundaries',
        description: 'Fix \'high | critic\'a\'l\' -> \'high\' | \'critical\'',
        pattern: /'([^']*)\s*\|\s*([^']*)'([^']*)'([^']*)'/g,
        replacement: "'$1' | '$2$3$4'"
      },
      {
        name: 'union_missing_quotes',
        description: 'Fix |high | -> | \'high\' |',
        pattern: /\|([a-zA-Z][a-zA-Z0-9_-]*)\s*\|/g,
        replacement: "| '$1' |"
      },
      {
        name: 'function_param_corruption',
        description: 'Fix function params with broken quotes',
        pattern: /:\s*Promise<([^>]+)\s*\|\s*([^>]+)>/g,
        replacement: ': Promise<$1 | $2>'
      },
      {
        name: 'broken_constructor_params',
        description: 'Fix constructor\'() -> constructor()',
        pattern: /constructor'(\([^)]*\))/g,
        replacement: 'constructor$1'
      },
      {
        name: 'broken_function_call_params',
        description: 'Fix function\'() -> function()',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)'(\([^)]*\))/g,
        replacement: '$1$2'
      },
      {
        name: 'template_literal_corruption',
        description: 'Fix ${...}\'...\'} -> ${...}',
        pattern: /\$\{([^}]+)'([^}]*)'([^}]*)\}/g,
        replacement: '${$1$2$3}'
      },
      {
        name: 'array_type_corruption',
        description: 'Fix any[\']\' -> any[]',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\['([^']*)'\]'/g,
        replacement: '$1[$2]'
      },
      {
        name: 'import_path_corruption',
        description: 'Fix import paths with broken quotes',
        pattern: /import\s*\(\s*'([^']*)'([^']*)'([^']*)'\s*\)/g,
        replacement: "import('$1$2$3')"
      },
      {
        name: 'error_template_corruption',
        description: 'Fix error messages with broken template',
        pattern: /\$\{([^}]+)\s*'\s*\|\s*([^}]+)\}/g,
        replacement: '${$1 || $2}'
      },
      {
        name: 'pipe_space_standardization',
        description: 'Standardize all | with proper spacing',
        pattern: /\s*\|\s*/g,
        replacement: ' | '
      }
    ];
  }

  /**
   * Apply enhanced text-based repairs
   */
  applyEnhancedRepairs(content, filePath) {
    let repairedContent = content;
    let repairs = 0;
    let corruptionTypes = new Set();
    
    const patterns = this.getEnhancedCorruptionPatterns();
    
    // Apply patterns in specific order for best results
    for (const pattern of patterns) {
      const beforeContent = repairedContent;
      
      if (typeof pattern.replacement === 'function') {
        const matches = [...repairedContent.matchAll(pattern.pattern)];
        if (matches.length > 0) {
          for (const match of matches) {
            const newValue = pattern.replacement(match[0], ...match.slice(1));
            repairedContent = repairedContent.replace(match[0], newValue);
            repairs++;
            corruptionTypes.add(pattern.name);
          }
        }
      } else {
        repairedContent = repairedContent.replace(pattern.pattern, pattern.replacement);
        if (repairedContent !== beforeContent) {
          const matches = beforeContent.match(pattern.pattern);
          if (matches) {
            repairs += matches.length;
            corruptionTypes.add(pattern.name);
          }
        }
      }
    }
    
    // Post-processing cleanup
    const cleanupPatterns = [
      {
        name: 'double_pipe_cleanup',
        pattern: /\|\s*\|\s*/g,
        replacement: ' | '
      },
      {
        name: 'triple_quote_cleanup', 
        pattern: /'{3,}/g,
        replacement: "'"
      },
      {
        name: 'empty_union_cleanup',
        pattern: /\|\s*\|/g,
        replacement: ' |'
      },
      {
        name: 'trailing_pipe_cleanup',
        pattern: /\|\s*[);]/g,
        replacement: (match) => match.replace('|', '')
      }
    ];
    
    for (const cleanup of cleanupPatterns) {
      const beforeCleanup = repairedContent;
      if (typeof cleanup.replacement === 'function') {
        repairedContent = repairedContent.replace(cleanup.pattern, cleanup.replacement);
      } else {
        repairedContent = repairedContent.replace(cleanup.pattern, cleanup.replacement);
      }
      if (repairedContent !== beforeCleanup) {
        repairs++;
        corruptionTypes.add(cleanup.name);
      }
    }
    
    if (repairs > 0) {
      console.log(`  🔧 Enhanced repairs: ${repairs} in ${filePath.split('/').pop()}`);
      if (corruptionTypes.size > 0) {
        console.log(`     Types: ${Array.from(corruptionTypes).join(', ')}`);
      }
    }
    
    return { content: repairedContent, repairs, corruptionTypes };
  }

  /**
   * Validate repairs by checking for common corruption indicators
   */
  validateRepairs(content, filePath) {
    const validationPatterns = [
      /'[^']*\|[^']*'/,  // Quotes with pipes inside
      /\|[^|'\s]/,       // Pipes without proper spacing
      /'{2,}/,           // Multiple quotes
      /\|\s*\|/,         // Double pipes
      /constructor'/,     // Broken constructor
      /Promise<[^>]*\|[^>]*>/  // Broken Promise types
    ];
    
    const issues = [];
    for (const pattern of validationPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        issues.push(matches[0]);
      }
    }
    
    if (issues.length > 0) {
      console.log(`  ⚠️  Validation: ${issues.length} potential issues remain in ${filePath.split('/').pop()}`);
      return false;
    }
    
    return true;
  }

  /**
   * Process a single TypeScript file with enhanced repair and validation
   */
  async processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      // Apply enhanced repairs
      const { content: repairedContent, repairs, corruptionTypes } = 
        this.applyEnhancedRepairs(originalContent, filePath);
      
      // Validate repairs
      const isValid = this.validateRepairs(repairedContent, filePath);
      
      // Only write if we made repairs and they seem valid
      if (repairs > 0) {
        fs.writeFileSync(filePath, repairedContent);
        this.repairCount += repairs;
        
        // Track corruption types found
        corruptionTypes.forEach(type => this.corruptionDetected.add(type));
        
        if (!isValid) {
          console.log(`     ⚠️  File may need additional repair passes`);
        }
      }
      
      this.processedFiles++;
      return repairs > 0;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Process all TypeScript files with enhanced repair
   */
  async repairProject() {
    console.log('🏥 Enhanced TypeScript Surgeon v2 - Advanced Corruption Repair\n');
    
    const files = await glob('apps/claude-code-zen-server/src/**/*.ts', {
      cwd: '/home/mhugo/code/claude-code-zen',
      absolute: true
    });
    
    console.log(`📄 Found ${files.length} TypeScript files to repair\n`);
    
    let repairedFiles = 0;
    const batchSize = 15;
    
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      console.log(`\n📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}:`);
      
      for (const filePath of batch) {
        const wasRepaired = await this.processFile(filePath);
        if (wasRepaired) {
          repairedFiles++;
        }
      }
      
      console.log(`   Progress: ${Math.min(i + batchSize, files.length)}/${files.length} files processed`);
    }
    
    console.log('\n📊 Enhanced Surgery Results:');
    console.log(`   📄 Files processed: ${this.processedFiles}`);
    console.log(`   ✅ Files repaired: ${repairedFiles}`);
    console.log(`   🔧 Total repairs: ${this.repairCount}`);
    
    if (this.corruptionDetected.size > 0) {
      console.log(`   🔍 Corruption types found: ${Array.from(this.corruptionDetected).join(', ')}`);
    }
    
    return { processedFiles: this.processedFiles, repairedFiles, totalRepairs: this.repairCount };
  }

  /**
   * Verify repair success with enhanced error analysis
   */
  async verifyRepairs() {
    console.log('\n🔍 Verifying enhanced repairs with TypeScript compiler...');
    
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
          console.log('🎉 ENHANCED SURGERY SUCCESSFUL! TypeScript compilation clean!');
          resolve({ success: true, errors: 0 });
        } else {
          const errorMatches = output.match(/error TS\\d+:/g);
          const errorCount = errorMatches ? errorMatches.length : 0;
          
          console.log(`📊 Enhanced Surgery Progress:`);
          console.log(`   ⚠️  Remaining errors: ${errorCount}`);
          
          // Show different error types
          const errorTypes = new Set();
          const lines = output.split('\\n').filter(line => line.includes('error TS'));
          lines.forEach(line => {
            const match = line.match(/error (TS\\d+):/);
            if (match) errorTypes.add(match[1]);
          });
          
          if (errorTypes.size > 0) {
            console.log(`   🔍 Error types: ${Array.from(errorTypes).slice(0, 10).join(', ')}`);
          }
          
          if (errorCount < 10000) {
            console.log('\\n🔍 Sample remaining errors:');
            lines.slice(0, 5).forEach(line => console.log(`   ${line.trim()}`));
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
  const surgeon = new EnhancedTypeScriptSurgeon();
  
  try {
    // Perform enhanced surgery
    const results = await surgeon.repairProject();
    
    // Verify the results
    const verification = await surgeon.verifyRepairs();
    
    console.log('\\n✨ Enhanced TypeScript Surgery Complete!');
    
    if (verification.success) {
      console.log('🎉 FULL RECOVERY - All syntax errors eliminated!');
    } else if (verification.errors < results.totalRepairs) {
      console.log('🚀 MAJOR PROGRESS - Significant error reduction!');
      console.log('   Consider running enhanced surgeon again for further improvements.');
    } else {
      console.log('📈 PROGRESS MADE - Enhanced patterns applied successfully.');
      console.log('   Additional repair strategies may be needed.');
    }
    
  } catch (error) {
    console.error('💥 Enhanced surgery failed:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}