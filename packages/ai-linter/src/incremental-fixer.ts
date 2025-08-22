import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';
import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('IncrementalFixer');

interface ESLintResult {
  errorCount: number;
  warningCount: number;
  output: string;
}

interface RepairPattern {
  name: string;
  pattern: RegExp;
  replacement: string;
}

export class IncrementalAIFixer {
  private repairPatterns: RepairPattern[] = [
    // Fix malformed union types
    {
      name: 'malformed_union_types',
      pattern: /'([^']+)\s*\|\s*([^']+)'\s*\)/g,
      replacement: "'$1|$2'"
    },
    // Fix import statement syntax  
    {
      name: 'import_statement_syntax',
      pattern: /} from ['"]([^'"]+)['"]\);/g,
      replacement: "} from '$1';"
    },
    // Fix function call syntax
    {
      name: 'function_call_syntax',
      pattern: /(\w+)\(\)\);/g,
      replacement: '$1();'
    },
    // Fix status assignment syntax
    {
      name: 'status_assignment_syntax',
      pattern: /status: ['"]([^'"]+)['"]\);/g,
      replacement: "status: '$1'"
    },
    // Fix object property syntax
    {
      name: 'object_property_syntax',
      pattern: /(\w+): (['"][^'"]*['"])\);/g,
      replacement: '$1: $2'
    }
  ];

  private runESLint(filePath: string): ESLintResult {
    try {
      const output = execSync(
        `cd /home/mhugo/code/claude-code-zen && npx eslint "${filePath}" --format json`,
        { encoding: 'utf8', stdio: 'pipe'}
      );
      
      const results = JSON.parse(output);
      const fileResult = results[0] || { errorCount: 0, warningCount: 0 };
      
      return {
        errorCount: fileResult.errorCount || 0,
        warningCount: fileResult.warningCount || 0,
        output: JSON.stringify(results, null, 2)
      };
    } catch (error: any) {
      if (error.stdout) {
        try {
          const results = JSON.parse(error.stdout);
          const fileResult = results[0] || { errorCount: 0, warningCount: 0 };
          return {
            errorCount: fileResult.errorCount || 0,
            warningCount: fileResult.warningCount || 0,
            output: error.stdout
          };
        } catch {
          return {
            errorCount: 999,
            warningCount: 999,
            output: error.message
          };
        }
      }
      return {
        errorCount: 999,
        warningCount: 999,
        output: error.message
      };
    }
  }

  private applyRepairs(content: string): { content: string; patternsApplied: string[] } {
    let repairedContent = content;
    const patternsApplied: string[] = [];

    for (const pattern of this.repairPatterns) {
      const originalContent = repairedContent;
      repairedContent = repairedContent.replace(pattern.pattern, pattern.replacement);
      
      if (originalContent !== repairedContent) {
        patternsApplied.push(pattern.name);
      }
    }

    return { content: repairedContent, patternsApplied };
  }

  private calculateScore(result: ESLintResult): number {
    // Lower scores are better (fewer errors/warnings)
    return result.errorCount * 10 + result.warningCount;
  }

  public async fixIncrementally(): Promise<void> {
    logger.info('🔧 Starting incremental AI linter with ESLint validation');

    // Get all TypeScript files
    const files = await glob('**/*.ts', {
      cwd: '/home/mhugo/code/claude-code-zen',
      ignore: ['node_modules/**', 'dist/**', '*.d.ts', 'packages/ai-linter/self-repair-simple.mjs']
    });

    logger.info(`📁 Found ${files.length} TypeScript files to process`);

    let processedCount = 0;
    let improvedCount = 0;
    let stoppedEarly = false;

    for (const file of files) {
      const fullPath = `/home/mhugo/code/claude-code-zen/${file}`;
      
      try {
        logger.info(`\n🔍 Processing: ${file}`);
        
        // Step 1: Run ESLint BEFORE
        const beforeResult = this.runESLint(fullPath);
        const beforeScore = this.calculateScore(beforeResult);
        
        logger.info(`📊 BEFORE - Errors: ${beforeResult.errorCount}, Warnings: ${beforeResult.warningCount}, Score: ${beforeScore}`);

        // Step 2: Read and apply repairs
        const originalContent = readFileSync(fullPath, 'utf8');
        const { content: repairedContent, patternsApplied } = this.applyRepairs(originalContent);

        // Skip if no changes needed
        if (originalContent === repairedContent) {
          logger.info(`✨ No repairs needed for ${file}`);
          processedCount++;
          continue;
        }

        // Step 3: Write repaired content
        writeFileSync(fullPath, repairedContent, 'utf8');
        logger.info(`🔧 Applied patterns: ${patternsApplied.join(', ')}`);

        // Step 4: Run ESLint AFTER
        const afterResult = this.runESLint(fullPath);
        const afterScore = this.calculateScore(afterResult);
        
        logger.info(`📊 AFTER  - Errors: ${afterResult.errorCount}, Warnings: ${afterResult.warningCount}, Score: ${afterScore}`);

        // Step 5: Validate improvement
        if (afterScore <= beforeScore) {
          logger.info(`✅ IMPROVED: ${file} (score: ${beforeScore} → ${afterScore})`);
          improvedCount++;
        } else {
          logger.error(`❌ WORSE: ${file} (score: ${beforeScore} → ${afterScore})`);
          logger.error('🛑 STOPPING ALL OPERATIONS as requested');
          
          // Revert the change
          writeFileSync(fullPath, originalContent, 'utf8');
          logger.info(`↩️ Reverted ${file} to original state`);
          
          stoppedEarly = true;
          break;
        }

        processedCount++;

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        logger.error(`💥 Error processing ${file}:`, error);
        stoppedEarly = true;
        break;
      }
    }

    // Final summary
    logger.info('\n🏁 INCREMENTAL FIXING COMPLETE');
    logger.info(`📈 Files processed: ${processedCount}/${files.length}`);
    logger.info(`✅ Files improved: ${improvedCount}`);
    logger.info(`🛑 Stopped early: ${stoppedEarly ? 'YES' : 'NO'}`);

    if (stoppedEarly) {
      logger.warn('⚠️ Process stopped because a file got worse after fixing');
    } else {
      logger.info('🎉 All processed files were improved or unchanged');
    }
  }
}

// CLI execution
if (require.main === module) {
  const fixer = new IncrementalAIFixer();
  fixer.fixIncrementally().catch(console.error);
}