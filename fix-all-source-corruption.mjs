#!/usr/bin/env node

/**
 * FIX ALL SOURCE CORRUPTION - Apply proven patterns to all corrupted source files
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const provenPatterns = [
  // Union type with mixed quotes  
  {
    name: 'union_type_mixed_quotes',
    description: 'Fix string union types with mixed quote corruption',
    pattern: /'([^']+)'''\s*\|\s*'''([^']+)/g,
    replacement: "'$1' | '$2'",
    confidence: 'very_high'
  },
  
  // Simple string union corruption
  {
    name: 'simple_string_union_corruption', 
    description: 'Fix simple string unions with quote corruption',
    pattern: /'([^']+)'''\s*\|\s*'''([^']+)'/g,
    replacement: "'$1' | '$2'",
    confidence: 'very_high'
  },

  // Export type with quote corruption
  {
    name: 'export_type_quote_corruption',
    description: 'Fix export type statements with embedded comments',
    pattern: /='\s*\|\s*'''([^']+)'\s*\/\/([^']+)''\s*\|\s*'''([^']+)/g,
    replacement: "= '$1' // $2\n  | '$3'",
    confidence: 'very_high'
  },

  // Multi-value union corruption like 'pending | approved' | 'rejected'''
  {
    name: 'multi_value_union_corruption',
    description: 'Fix union types with multiple values in single quotes',
    pattern: /'([^']*\|[^']*)'\s*\|\s*'([^']+)'''\s*\|\s*'''([^']+)'/g,
    replacement: (match, group1, group2, group3) => {
      // Split first group by | and quote each part
      const parts1 = group1.split('|').map(p => `'${p.trim()}'`);
      return `${parts1.join(' | ')} | '${group2}' | '${group3}'`;
    },
    confidence: 'high'
  },

  // Simple corruption pattern ='' | '''
  {
    name: 'empty_or_corruption',
    description: 'Fix empty string or pattern corruption',
    pattern: /=''\s*\|\s*'''/g,
    replacement: "= '",
    confidence: 'high'
  }
];

async function fixAllSourceCorruption() {
  console.log('🔍 Finding all corrupted TypeScript source files...');
  
  // Find all corrupted TypeScript files in apps/claude-code-zen-server/src
  const files = await glob('apps/claude-code-zen-server/src/**/*.ts', {
    cwd: '/home/mhugo/code/claude-code-zen',
    ignore: ['node_modules/**', 'dist/**', '*.d.ts'],
  });

  // Filter to only files with corruption
  const corruptedFiles = [];
  for (const file of files) {
    const fullPath = `/home/mhugo/code/claude-code-zen/${file}`;
    try {
      const content = readFileSync(fullPath, 'utf8');
      if (content.includes("'''")) {
        corruptedFiles.push(file);
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }

  console.log(`📁 Found ${corruptedFiles.length} corrupted files to fix`);
  
  let totalFilesFixed = 0;
  let totalPatternsFixed = 0;
  
  for (const file of corruptedFiles) {
    const fullPath = `/home/mhugo/code/claude-code-zen/${file}`;
    
    try {
      let content = readFileSync(fullPath, 'utf8');
      const originalContent = content;
      let filePatternsFixes = 0;
      
      // Apply proven patterns
      for (const pattern of provenPatterns) {
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
        console.log(`   ✅ ${file}: ${filePatternsFixes} patterns fixed`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n🏆 Source Corruption Fix Complete:`);
  console.log(`   📁 Corrupted files found: ${corruptedFiles.length}`);
  console.log(`   🔧 Files fixed: ${totalFilesFixed}`);  
  console.log(`   🎯 Total pattern fixes: ${totalPatternsFixed}`);
  
  return totalFilesFixed > 0;
}

async function testAfterFix() {
  console.log('\n🔍 Testing TypeScript compilation after source fix...');
  try {
    const { execSync } = await import('child_process');
    const result = execSync('pnpm run type-check', { 
      cwd: '/home/mhugo/code/claude-code-zen', 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation successful!');
    console.log('🎉 Source corruption fixed completely!');
    return true;
  } catch (error) {
    console.log('📊 Remaining errors after source fix (first 10):');
    const lines = error.stdout.split('\n').slice(0, 10);
    lines.forEach(line => line.trim() && console.log(`   ${line}`));
    return false;
  }
}

async function main() {
  const success = await fixAllSourceCorruption();
  
  if (success) {
    const compilationSuccess = await testAfterFix();
    if (compilationSuccess) {
      console.log('\n🚀 SUCCESS! All source corruption patterns fixed.');
      console.log('💡 pnpm + fresh install + source fixes = Working system!');
    } else {
      console.log('\n⚠️  Significant progress made. Some edge cases may remain.');
    }
  } else {
    console.log('\n❌ No corrupted files found or patterns didn\'t match.');
  }
}

main().catch(console.error);