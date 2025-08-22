/**
 * AI Linter Self-Repair Utility
 * 
 * This utility fixes systematic syntax corruptions caused by bulk replacements
 * that went wrong in the AI linter processing. It repairs:
 * - Malformed union types ('a'' | ''b' instead of 'a' | 'b'')
 * - Import statement syntax errors ()'; instead of ;)
 * - Function call syntax errors
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { glob } from 'glob';

export interface RepairStats {
  filesProcessed: number;
  errorsFixed: number;
  patterns: Record<string, number>;
}

export class SelfRepairUtility {
  private stats: RepairStats = {
    filesProcessed: 0,
    errorsFixed: 0,
    patterns: {}
  };

  /**
   * Systematic patterns that need to be fixed
   */
  private repairPatterns = [
    // Fix malformed union types
    {
      name: 'malformed_union_types',
      pattern: /'([^']+)\s*\'' | ''\s*([^']+)'\s*\)/g,
      replacement: "'$1' | '$2''"
    },
    // Fix import statement syntax
    {
      name: 'import_statement_syntax',
      pattern: /} from ['"]([^'"]+)['"]\);/g,
      replacement: "} from '$1';"
    },
    // Fix function status assignments with extra parentheses
    {
      name: 'status_assignment_syntax',
      pattern: /(\w+\.status = ['"][^'"]+['"]\));/g,
      replacement: "$1;"
    },
    // Fix createHash function calls
    {
      name: 'createhash_syntax',
      pattern: /createHash\(([^)]+)\)\.update\(([^)]+)\)\.digest\(([^)]+)\);/g,
      replacement: "createHash($1).update($2).digest($3);"
    },
    // Fix algorithm union types
    {
      name: 'algorithm_union_types',  
      pattern: /algorithm:\s*'([^']+)\s*\'' | ''\s*([^']+)'\s*\'' | ''\s*'([^']+)'\s*\);/g,
      replacement: "algorithm: '$1' | '$2'''' | '''$3';"
    }
  ];

  /**
   * Repair all TypeScript files in the project
   */
  async repairProject(rootPath: string = process.cwd()): Promise<RepairStats> {
    console.log('🔧 Starting AI Linter Self-Repair...');
    
    // Find all TypeScript files
    const files = await glob(`${rootPath}/**/*.ts`, { 
      ignore: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    });

    console.log(`📁 Found ${files.length} TypeScript files to process`);

    for (const file of files) {
      await this.repairFile(file);
    }

    console.log('✅ Self-repair completed:');
    console.log(`   Files processed: ${this.stats.filesProcessed}`);
    console.log(`   Total errors fixed: ${this.stats.errorsFixed}`);
    console.log('   Patterns fixed:');
    Object.entries(this.stats.patterns).forEach(([pattern, count]) => {
      console.log(`     - ${pattern}: ${count}`);
    });

    return this.stats;
  }

  /**
   * Repair a single file
   */
  private async repairFile(filePath: string): Promise<void> {
    try {
      let content = readFileSync(filePath, 'utf-8');
      let modified = false;
      let fileErrors = 0;

      // Apply each repair pattern
      for (const pattern of this.repairPatterns) {
        const originalContent = content;
        content = content.replace(pattern.pattern, pattern.replacement);
        
        if (content !== originalContent) {
          const matches = originalContent.match(pattern.pattern);
          const fixCount = matches?.length'' | '''' | ''0;
          fileErrors += fixCount;
          this.stats.patterns[pattern.name] = (this.stats.patterns[pattern.name]'' | '''' | ''0) + fixCount;
          modified = true;
        }
      }

      // Write back if modified
      if (modified) {
        writeFileSync(filePath, content,'utf-8');
        console.log(`🔨 Fixed ${fileErrors} errors in ${filePath}`);
      }

      this.stats.filesProcessed++;
      this.stats.errorsFixed += fileErrors;

    } catch (error) {
      console.warn(`⚠️  Could not process ${filePath}:`, error);
    }
  }

  /**
   * Run TypeScript compilation check to verify repairs
   */
  async verifyRepairs(projectPath: string = process.cwd()): Promise<boolean> {
    try {
      console.log('🔍 Verifying repairs with TypeScript compilation...');
      execSync('npx tsc --noEmit', { 
        cwd: projectPath,
        stdio: 'pipe' 
      });
      console.log('✅ TypeScript compilation successful!');
      return true;
    } catch (error) {
      console.log('❌ TypeScript compilation still has errors');
      return false;
    }
  }
}

/**
 * CLI interface for self-repair utility
 */
export async function runSelfRepair(projectPath?: string): Promise<void> {
  const repair = new SelfRepairUtility();
  const stats = await repair.repairProject(projectPath);
  
  // Verify the repairs worked
  const success = await repair.verifyRepairs(projectPath);
  
  if (!success) {
    console.log('🔄 Some errors remain. May need additional manual fixes.');
  }
}

// Export for CLI usage
export default SelfRepairUtility;