#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// More targeted repair patterns based on actual corruption found
const repairPatterns = [
  // Fix malformed union types in function signatures and interfaces
  {
    name: 'union_type_corruption',
    pattern: /(\w+:?\s*)(\w+)'(\s*\|\s*)'(\w+)/g,
    replacement: '$1$2 | $4'
  },
  // Fix conditional expressions with quote corruption
  {
    name: 'conditional_quote_corruption',
    pattern: /(\w+\.\w+)'(\s*\|\s*)'([^']*===['"]\w+['"])/g,
    replacement: '$1 || $3'
  },
  // Fix simple union types with embedded quotes
  {
    name: 'simple_union_quotes',
    pattern: /string'\s*\|\s*'symbol/g,
    replacement: 'string | symbol'
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
  },
  // Fix status assignment syntax
  {
    name: 'status_assignment_syntax',
    pattern: /status: ['"]([^'"]+)['"]\);/g,
    replacement: 'status: \'$1\''
  }
];

function runESLint(filePath) {
  try {
    const output = execSync(
      `cd /home/mhugo/code/claude-code-zen && npx eslint "${filePath}" --format json`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    
    const results = JSON.parse(output);
    const fileResult = results[0] || { errorCount: 0, warningCount: 0 };
    
    return {
      errorCount: fileResult.errorCount || 0,
      warningCount: fileResult.warningCount || 0
    };
  } catch (error) {
    if (error.stdout) {
      try {
        const results = JSON.parse(error.stdout);
        const fileResult = results[0] || { errorCount: 0, warningCount: 0 };
        return {
          errorCount: fileResult.errorCount || 0,
          warningCount: fileResult.warningCount || 0
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

async function fixTargetedFiles() {
  console.log('🎯 Starting targeted fix for specific corruption patterns');

  // Focus on the problematic files first
  const targetFiles = [
    'apps/claude-code-zen-server/src/claude-zen-core.ts',
    'apps/claude-code-zen-server/src/commands/auth-minimal.ts'
  ];

  let processedCount = 0;
  let improvedCount = 0;
  let stoppedEarly = false;

  for (const file of targetFiles) {
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
        console.error('🛑 STOPPING as requested');
        
        // Revert the change
        writeFileSync(fullPath, originalContent, 'utf8');
        console.log(`↩️ Reverted ${file} to original state`);
        
        stoppedEarly = true;
        break;
      }

      processedCount++;

    } catch (error) {
      console.error(`💥 Error processing ${file}:`, error.message);
      stoppedEarly = true;
      break;
    }
  }

  // Check TypeScript compilation after targeted fixes
  console.log('\n🔍 Checking TypeScript compilation...');
  try {
    execSync('cd /home/mhugo/code/claude-code-zen && npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful!');
  } catch (error) {
    console.log('❌ TypeScript compilation still has errors - need more fixes');
  }

  // Final summary
  console.log('\n🏁 TARGETED FIXING COMPLETE');
  console.log(`📈 Files processed: ${processedCount}/${targetFiles.length}`);
  console.log(`✅ Files improved: ${improvedCount}`);
  console.log(`🛑 Stopped early: ${stoppedEarly ? 'YES' : 'NO'}`);
}

fixTargetedFiles().catch(console.error);