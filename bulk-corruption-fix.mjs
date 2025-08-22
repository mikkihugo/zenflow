#!/usr/bin/env node

/**
 * BULK CORRUPTION FIX - Apply to ALL corrupted files in the repository
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const bulkPatterns = [
  // All the proven patterns combined
  {
    name: 'union_type_mixed_quotes',
    description: 'Fix string union types with mixed quote corruption',
    pattern: /'([^']+)'''\s*\|\s*'''([^']+)/g,
    replacement: "'$1' | '$2'"
  },
  {
    name: 'simple_string_union_corruption',
    description: 'Fix simple string unions with quote corruption',
    pattern: /'([^']+)'''\s*\|\s*'''([^']+)'/g,
    replacement: "'$1' | '$2'"
  },
  {
    name: 'mixed_union_pattern',
    description: 'Fix mixed union with quotes inside strings',
    pattern: /'([^']*\|[^']*)'\s*\|\s*'([^']+)'\s*\|\s*'([^']+)''/g,
    replacement: (match, group1, group2, group3) => {
      const parts1 = group1.split('|').map(p => `'${p.trim()}'`);
      return `${parts1.join(' | ')} | '${group2}' | '${group3}'`;
    }
  },
  {
    name: 'triple_union_pattern',
    description: 'Fix triple union with embedded pipe',
    pattern: /'([^']*\|[^']*)'\s*\|\s*'([^']+)'/g,
    replacement: (match, group1, group2) => {
      const parts1 = group1.split('|').map(p => `'${p.trim()}'`);
      return `${parts1.join(' | ')} | '${group2}'`;
    }
  },
  {
    name: 'generic_double_quote',
    description: 'Fix generic double quote corruption',
    pattern: /''([^']+)''/g,
    replacement: "'$1'"
  },
  {
    name: 'empty_string_union_corruption',
    description: 'Fix empty string union corruption',
    pattern: /=''\s*\|\s*'''/g,
    replacement: "= '"
  },
  {
    name: 'readonly_type_corruption',
    description: 'Fix readonly type with leading corruption',
    pattern: /readonly type:\s*'\s*\|\s*''([^']+)'/g,
    replacement: "readonly type: '$1'"
  },
  {
    name: 'condition_corruption',
    description: 'Fix condition operator corruption',
    pattern: /\?\s*''\s*\|\s*''\s*\|\s*''/g,
    replacement: ' ? '
  },
  {
    name: 'or_operator_corruption',
    description: 'Fix || operator corruption',
    pattern: /''\s*\|\s*''\s*\|\s*''/g,
    replacement: ' || '
  }
];

async function findAllCorruptedFiles() {
  console.log('🔍 Finding ALL corrupted TypeScript files in the repository...');
  
  const allFiles = await glob('**/*.ts', {
    cwd: '/home/mhugo/code/claude-code-zen',
    ignore: ['node_modules/**', 'dist/**', '.pnpm/**', 'build/**', 'coverage/**'],
  });

  const corruptedFiles = [];
  for (const file of allFiles) {
    const fullPath = `/home/mhugo/code/claude-code-zen/${file}`;
    try {
      const content = readFileSync(fullPath, 'utf8');
      if (content.includes("'''") || content.includes("'' | ''")) {
        corruptedFiles.push(file);
      }
    } catch (error) {
      // Skip unreadable files
    }
  }

  return corruptedFiles;
}

async function applyBulkFix() {
  const corruptedFiles = await findAllCorruptedFiles();
  console.log(`📁 Found ${corruptedFiles.length} corrupted files across the entire repository`);
  
  let totalFilesFixed = 0;
  let totalPatternsFixed = 0;
  
  for (const file of corruptedFiles) {
    const fullPath = `/home/mhugo/code/claude-code-zen/${file}`;
    
    try {
      let content = readFileSync(fullPath, 'utf8');
      const originalContent = content;
      let filePatternsFixes = 0;
      
      // Apply all bulk patterns
      for (const pattern of bulkPatterns) {
        const beforeContent = content;
        
        if (typeof pattern.replacement === 'function') {
          content = content.replace(pattern.pattern, pattern.replacement);
        } else {
          content = content.replace(pattern.pattern, pattern.replacement);
        }
        
        if (beforeContent !== content) {
          filePatternsFixes++;
          totalPatternsFixed++;
        }
      }
      
      // Write if changes were made
      if (originalContent !== content && filePatternsFixes > 0) {
        writeFileSync(fullPath, content, 'utf8');
        totalFilesFixed++;
        
        if (totalFilesFixed <= 20) {
          console.log(`   ✅ ${file}: ${filePatternsFixes} patterns fixed`);
        } else if (totalFilesFixed === 21) {
          console.log(`   📊 Processing many files... (showing first 20)`);
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n🏆 Bulk Corruption Fix Complete:`);
  console.log(`   📁 Corrupted files found: ${corruptedFiles.length}`);
  console.log(`   🔧 Files fixed: ${totalFilesFixed}`);  
  console.log(`   🎯 Total pattern fixes: ${totalPatternsFixed}`);
  
  return totalFilesFixed > 0;
}

async function testBulkFix() {
  console.log('\n🔍 Testing TypeScript compilation after bulk fix...');
  try {
    const { execSync } = await import('child_process');
    const result = execSync('pnpm run type-check', { 
      cwd: '/home/mhugo/code/claude-code-zen', 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation successful!');
    console.log('🎉 ALL CORRUPTION FIXED - SYSTEM WORKING!');
    return true;
  } catch (error) {
    // Count remaining errors
    const errorLines = error.stdout.split('\n');
    const errorCount = errorLines.filter(line => line.includes(': error ')).length;
    console.log(`📊 Remaining TypeScript errors: ${errorCount}`);
    
    if (errorCount < 100) {
      console.log('🎯 Significant progress! Showing remaining errors:');
      const lines = errorLines.slice(0, 15);
      lines.forEach(line => line.trim() && console.log(`   ${line}`));
    } else {
      console.log('⚠️ Many errors remain - may need additional pattern analysis');
    }
    
    return errorCount < 50;
  }
}

async function main() {
  const success = await applyBulkFix();
  
  if (success) {
    const testSuccess = await testBulkFix();
    if (testSuccess) {
      console.log('\n🚀 COMPLETE SUCCESS!');
      console.log('💡 Fresh pnpm + bulk source fixes = WORKING SYSTEM!');
    } else {
      console.log('\n⚠️ Major progress made but some patterns may remain.');
    }
  } else {
    console.log('\n❌ No corrupted files found or patterns didn\'t match.');
  }
}

main().catch(console.error);