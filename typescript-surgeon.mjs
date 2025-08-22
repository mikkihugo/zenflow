/**
 * TypeScript Surgeon - Professional AST-based Corruption Repair
 * Handles 24,000+ systematic TypeScript syntax errors
 */

import { Project } from 'ts-morph';
import { glob } from 'glob';
import fs from 'fs';

class TypeScriptSurgeon {
  constructor() {
    this.project = new Project({
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        noEmitOnError: false,
        noEmit: true
      }
    });
    
    this.repairCount = 0;
    this.processedFiles = 0;
  }

  /**
   * Primary corruption patterns found in the codebase
   */
  getCorruptionPatterns() {
    return [
      {
        name: 'union_type_string_corruption',
        description: 'Fix string\' | \'symbol -> string | symbol',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\'\s*\|\s*\'([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: '$1 | $2'
      },
      {
        name: 'union_type_literal_corruption', 
        description: 'Fix \'value\' | \'other -> \'value\' | \'other\'',
        pattern: /'([^']+)'\s*\|\s*'([^']+)(?!')/g,
        replacement: "'$1' | '$2'"
      },
      {
        name: 'incomplete_union_closing',
        description: 'Fix \'high | critical) -> \'high\' | \'critical\')',
        pattern: /'([^']+)\s*\|\s*([^')|]+)\)/g,
        replacement: "'$1' | '$2')"
      },
      {
        name: 'malformed_function_params',
        description: 'Fix (event: string\' | \'symbol -> (event: string | symbol',
        pattern: /\(\s*([^:]+):\s*([a-zA-Z_][a-zA-Z0-9_]*)\'\s*\|\s*\'([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: '($1: $2 | $3'
      },
      {
        name: 'type_annotation_corruption',
        description: 'Fix : string\' | \'symbol -> : string | symbol',
        pattern: /:\s*([a-zA-Z_][a-zA-Z0-9_]*)\'\s*\|\s*\'([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: ': $1 | $2'
      },
      {
        name: 'property_type_corruption',
        description: 'Fix property: string\' | \'number -> property: string | number',
        pattern: /([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([a-zA-Z_][a-zA-Z0-9_]*)\'\s*\|\s*\'([a-zA-Z_][a-zA-Z0-9_]*)/g,
        replacement: '$1: $2 | $3'
      },
      {
        name: 'unterminated_string_literals',
        description: 'Fix unclosed strings in various contexts',
        pattern: /'([^']*[^'])\s*\|\s*'([^']*)/g,
        replacement: "'$1' | '$2'"
      },
      {
        name: 'broken_union_with_quotes',
        description: 'Fix \'a\' | \'b -> \'a\' | \'b\'',
        pattern: /'([^']+)'\s*\|\s*'([^']+)(?!['])/g,
        replacement: "'$1' | '$2'"
      }
    ];
  }

  /**
   * Apply text-based repairs before AST processing
   */
  applyTextRepairs(content, filePath) {
    let repairedContent = content;
    let repairs = 0;
    
    const patterns = this.getCorruptionPatterns();
    
    for (const pattern of patterns) {
      const beforeContent = repairedContent;
      repairedContent = repairedContent.replace(pattern.pattern, pattern.replacement);
      
      if (repairedContent !== beforeContent) {
        const matches = beforeContent.match(pattern.pattern);
        if (matches) {
          repairs += matches.length;
        }
      }
    }
    
    // Additional specific repairs for common corruption
    const specificRepairs = [
      {
        // Fix console.log('); -> console.log('');
        from: /console\.log\('\);/g,
        to: "console.log('');"
      },
      {
        // Fix broken conditional expressions
        from: /\|\s*\|\s*/g,
        to: ' || '
      },
      {
        // Fix malformed template literals
        from: /`([^`]*)\'\s*\|\s*\'([^`]*)`/g,
        to: '`$1 | $2`'
      }
    ];
    
    for (const repair of specificRepairs) {
      const beforeContent = repairedContent;
      repairedContent = repairedContent.replace(repair.from, repair.to);
      if (repairedContent !== beforeContent) {
        repairs++;
      }
    }
    
    if (repairs > 0) {
      console.log(`  🔧 Text repairs: ${repairs} in ${filePath.split('/').pop()}`);
    }
    
    return { content: repairedContent, repairs };
  }

  /**
   * Process a single TypeScript file
   */
  async processFile(filePath) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf8');
      
      // Apply text-based repairs first
      const { content: repairedContent, repairs: textRepairs } = 
        this.applyTextRepairs(originalContent, filePath);
      
      // If we made text repairs, write them back
      if (textRepairs > 0) {
        fs.writeFileSync(filePath, repairedContent);
        this.repairCount += textRepairs;
      }
      
      // Try to add to TS project for AST-based repairs
      try {
        const sourceFile = this.project.addSourceFileAtPath(filePath);
        
        // AST-based repairs (if the file is parseable)
        let astRepairs = 0;
        
        // Fix import declarations
        const importDeclarations = sourceFile.getImportDeclarations();
        for (const importDecl of importDeclarations) {
          const moduleSpecifier = importDecl.getModuleSpecifierValue();
          if (moduleSpecifier.includes("' | '")) {
            const fixed = moduleSpecifier.replace(/'\s*\|\s*'/g, '');
            importDecl.setModuleSpecifier(fixed);
            astRepairs++;
          }
        }
        
        // Fix type aliases with professional AST manipulation
        const typeAliases = sourceFile.getTypeAliases();
        for (const typeAlias of typeAliases) {
          const typeNode = typeAlias.getTypeNode();
          if (typeNode) {
            const typeText = typeNode.getText();
            if (typeText.includes("' | '") || typeText.match(/\w'\s*\|\s*'\w/)) {
              // Fix union types using AST
              const fixedType = typeText
                .replace(/(\w)'\s*\|\s*'(\w)/g, "$1' | '$2")
                .replace(/'\s*\|\s*'/g, "' | '");
              
              // Use ts-morph to properly set the type
              try {
                typeAlias.setType(fixedType);
                astRepairs++;
              } catch (astError) {
                // If AST fails, continue with text repairs
              }
            }
          }
        }
        
        // Fix interface properties
        const interfaces = sourceFile.getInterfaces();
        for (const iface of interfaces) {
          const properties = iface.getProperties();
          for (const prop of properties) {
            const typeNode = prop.getTypeNode();
            if (typeNode) {
              const typeText = typeNode.getText();
              if (typeText.includes("' | '") || typeText.match(/\w'\s*\|\s*'\w/)) {
                const fixedType = typeText
                  .replace(/(\w)'\s*\|\s*'(\w)/g, "$1' | '$2")
                  .replace(/'\s*\|\s*'/g, "' | '");
                
                try {
                  prop.setType(fixedType);
                  astRepairs++;
                } catch (astError) {
                  // Continue with text repairs if AST fails
                }
              }
            }
          }
        }
        
        if (astRepairs > 0) {
          sourceFile.save();
          console.log(`  ⚙️ AST repairs: ${astRepairs} in ${filePath.split('/').pop()}`);
          this.repairCount += astRepairs;
        }
        
      } catch (astError) {
        // File too corrupted for AST parsing, that's ok - text repairs help
        console.log(`  📝 AST skip: ${filePath.split('/').pop()} (text repairs applied)`);
      }
      
      this.processedFiles++;
      return textRepairs > 0;
      
    } catch (error) {
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Process all TypeScript files in the project
   */
  async repairProject() {
    console.log('🏥 TypeScript Surgeon - Professional Corruption Repair\n');
    
    const files = await glob('apps/claude-code-zen-server/src/**/*.ts', {
      cwd: '/home/mhugo/code/claude-code-zen',
      absolute: true
    });
    
    console.log(`📄 Found ${files.length} TypeScript files to repair\n`);
    
    let repairedFiles = 0;
    const batchSize = 10;
    
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
    
    console.log('\n📊 Surgery Results:');
    console.log(`   📄 Files processed: ${this.processedFiles}`);
    console.log(`   ✅ Files repaired: ${repairedFiles}`);
    console.log(`   🔧 Total repairs: ${this.repairCount}`);
    
    return { processedFiles: this.processedFiles, repairedFiles, totalRepairs: this.repairCount };
  }

  /**
   * Verify repair success by running TypeScript compiler
   */
  async verifyRepairs() {
    console.log('\n🔍 Verifying repairs with TypeScript compiler...');
    
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
          console.log('🎉 SURGERY SUCCESSFUL! TypeScript compilation clean!');
          resolve({ success: true, errors: 0 });
        } else {
          const errorMatches = output.match(/error TS\d+:/g);
          const errorCount = errorMatches ? errorMatches.length : 0;
          
          console.log(`📊 Surgery Progress: ${24082 - errorCount} errors fixed`);
          console.log(`   ⚠️  Remaining errors: ${errorCount}`);
          console.log(`   📈 Success rate: ${((24082 - errorCount) / 24082 * 100).toFixed(1)}%`);
          
          if (errorCount < 1000) {
            console.log('\n🔍 Sample remaining errors:');
            const lines = output.split('\n').filter(line => line.includes('error TS')).slice(0, 5);
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
  const surgeon = new TypeScriptSurgeon();
  
  try {
    // Perform the surgery
    const results = await surgeon.repairProject();
    
    // Verify the results
    const verification = await surgeon.verifyRepairs();
    
    console.log('\n✨ TypeScript Surgery Complete!');
    
    if (verification.success) {
      console.log('🎉 FULL RECOVERY - All syntax errors eliminated!');
    } else if (verification.errors < 5000) {
      console.log('🚀 MAJOR PROGRESS - Significant error reduction!');
      console.log('   Consider running the surgeon again for further improvements.');
    } else {
      console.log('📈 PROGRESS MADE - Continuing systematic repair needed.');
    }
    
  } catch (error) {
    console.error('💥 Surgery failed:', error.message);
    process.exit(1);
  }
}

// Execute if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}