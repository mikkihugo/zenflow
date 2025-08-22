#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const repairPatterns = [
  // Fix specific union type corruption: string' | 'symbol -> string | symbol
  {
    name: 'string_symbol_union_corruption',
    pattern: /string'\s*\|\s*'symbol/g,
    replacement: 'string | symbol'
  },
  // Fix malformed union types in function parameters: (event: string' | 'symbol
  {
    name: 'parameter_union_corruption',
    pattern: /(\w+:\s*)(\w+)'\s*\|\s*'(\w+)/g,
    replacement: '$1$2 | $3'
  },
  // Fix malformed union types with quotes
  {
    name: 'malformed_quoted_unions',
    pattern: /'([^']+)'\s*\|\s*'([^']+)'/g,
    replacement: '\'$1\' | \'$2\''
  },
  // Fix complex conditional corruption like: process.env.DEBUG_AUTH' | '' | 'process.env.NODE_ENV
  {
    name: 'complex_conditional_corruption',
    pattern: /(\w+\.\w+)'\s*\|\s*''\s*\|\s*'(\w+\.\w+)/g,
    replacement: '$1 || $2'
  },
  // Fix return value corruption: return projectConfig.auth' | '' | '{};
  {
    name: 'return_value_corruption',
    pattern: /(\w+\.\w+)'\s*\|\s*''\s*\|\s*'\{/g,
    replacement: '$1 || {'
  },
  // Fix simple OR operator corruption: ' | '' | '
  {
    name: 'or_operator_corruption',
    pattern: /'\s*\|\s*''\s*\|\s*'/g,
    replacement: ' || '
  },
  // Fix import statement syntax
  {
    name: 'import_statement_syntax',
    pattern: /} from ['"]([^'"]+)['"]\);/g,
    replacement: '} from \'$1\';'
  },
  // Fix function call syntax
  {
    name: 'function_call_syntax',
    pattern: /(\w+)\(\)\);/g,
    replacement: '$1();'
  }
];

function runESLint(filePath) {
  try {
    const output = execSync(
      `cd /home/mhugo/code/claude-code-zen && npx eslint "${filePath}" --format json`,
      { encoding: 'utf8', stdio: 'pipe' },
    );

    const results = JSON.parse(output);
    const fileResult = results[0] || { errorCount: 0, warningCount: 0 };

    return {
      errorCount: fileResult.errorCount || 0,
      warningCount: fileResult.warningCount || 0,
    };
  } catch (error) {
    if (error.stdout) {
      try {
        const results = JSON.parse(error.stdout);
        const fileResult = results[0] || { errorCount: 0, warningCount: 0 };
        return {
          errorCount: fileResult.errorCount || 0,
          warningCount: fileResult.warningCount || 0,
        };
      } catch {
        return { errorCount: 999, warningCount: 999 };
      }
    }
    return { errorCount: 999, warningCount: 999 };
  }
}

function applyRepairs(content) {
  let repairedContent = content;
  const patternsApplied = [];

  for (const pattern of repairPatterns) {
    const originalContent = repairedContent;
    repairedContent = repairedContent.replace(pattern.pattern, pattern.replacement);

    if (originalContent !== repairedContent) {
      patternsApplied.push(pattern.name);
    }
  }

  return { content: repairedContent, patternsApplied };
}

function calculateScore(result) {
  // Lower scores are better (fewer errors/warnings)
  return result.errorCount * 10 + result.warningCount;
}

async function fixIncrementally() {
  console.log('🔧 Starting incremental AI linter with ESLint validation');

  // Get all TypeScript files, excluding dependencies and build artifacts
  const allFiles = await glob('**/*.ts', {
    cwd: '/home/mhugo/code/claude-code-zen',
    ignore: ['node_modules/**', 'dist/**', '*.d.ts', '.svelte-kit/**', 'build/**', 'coverage/**'],
  });

  // Additional filtering to ensure no dependency files leak through
  const files = allFiles.filter(file =>
    !file.includes('node_modules/') &&
    !file.includes('dist/') &&
    !file.includes('.svelte-kit/') &&
    !file.includes('build/') &&
    !file.includes('coverage/') &&
    !file.endsWith('.d.ts'),
  );

  console.log(`📁 Found ${files.length} TypeScript files to process`);
  
  // Process small batch of files with enhanced patterns
  const filesToProcess = files.slice(0, 10);
  console.log(`🎯 Processing first ${filesToProcess.length} files with enhanced repair patterns`);

  let processedCount = 0;
  let improvedCount = 0;
  let stoppedEarly = false;

  for (const file of filesToProcess) {
    const fullPath = `/home/mhugo/code/claude-code-zen/${file}`;

    try {
      console.log(`\n🔍 Processing: ${file}`);

      // Step 1: Run ESLint BEFORE
      const beforeResult = runESLint(fullPath);
      const beforeScore = calculateScore(beforeResult);

      console.log(`📊 BEFORE - Errors: ${beforeResult.errorCount}, Warnings: ${beforeResult.warningCount}, Score: ${beforeScore}`);

      // Step 2: Read and apply repairs
      const originalContent = readFileSync(fullPath, 'utf8');
      const { content: repairedContent, patternsApplied } = applyRepairs(originalContent);

      // Skip if no changes needed
      if (originalContent === repairedContent) {
        console.log(`✨ No repairs needed for ${file}`);
        processedCount++;
        continue;
      }

      // Step 3: Write repaired content
      writeFileSync(fullPath, repairedContent, 'utf8');
      console.log(`🔧 Applied patterns: ${patternsApplied.join(', ')}`);

      // Step 4: Run ESLint AFTER
      const afterResult = runESLint(fullPath);
      const afterScore = calculateScore(afterResult);

      console.log(`📊 AFTER  - Errors: ${afterResult.errorCount}, Warnings: ${afterResult.warningCount}, Score: ${afterScore}`);

      // Step 5: Validate improvement
      if (afterScore <= beforeScore) {
        console.log(`✅ IMPROVED: ${file} (score: ${beforeScore} → ${afterScore})`);
        improvedCount++;
      } else {
        console.error(`❌ WORSE: ${file} (score: ${beforeScore} → ${afterScore})`);
        console.error('🛑 STOPPING ALL OPERATIONS as requested');

        // Revert the change
        writeFileSync(fullPath, originalContent, 'utf8');
        console.log(`↩️ Reverted ${file} to original state`);

        stoppedEarly = true;
        break;
      }

      processedCount++;

      // Small delay to prevent overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`💥 Error processing ${file}:`, error.message);
      stoppedEarly = true;
      break;
    }
  }

  // Final summary
  console.log('\n🏁 INCREMENTAL FIXING COMPLETE');
  console.log(`📈 Files processed: ${processedCount}/${filesToProcess.length}`);
  console.log(`✅ Files improved: ${improvedCount}`);
  console.log(`🛑 Stopped early: ${stoppedEarly ? 'YES' : 'NO'}`);
  console.log(`📊 Remaining files: ${files.length - filesToProcess.length}`);

  if (stoppedEarly) {
    console.warn('⚠️ Process stopped because a file got worse after fixing');
  } else if (improvedCount > 0) {
    console.log('🎉 Some files were improved - patterns are working!');
    console.log('💡 Run again to process next batch of files');
  } else {
    console.log('📝 No files needed repairs - patterns may need adjustment');
  }
}

fixIncrementally().catch(console.error);