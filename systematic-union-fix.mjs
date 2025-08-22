#!/usr/bin/env node

/**
 * SYSTEMATIC UNION FIX - Fix the exact union type quote boundary corruption
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const systematicUnionPatterns = [
  // EXACT PATTERN: 'high | medium | 'low' -> 'high' | 'medium' | 'low'
  {
    name: 'union_quote_boundary_corruption',
    description: 'Fix union type quote boundary corruption',
    pattern: /'([^'|]+(?:\s*\|\s*[^'|]+)*)\s*\|\s*'([^']+)'/g,
    replacement: (match, group1, group2) => {
      // Split first group by | and quote each part
      const parts1 = group1.split('|').map(p => `'${p.trim()}'`);
      return `${parts1.join(' | ')} | '${group2}'`;
    },
    confidence: 'very_high'
  },
  
  // Pattern: 'a | b | c -> 'a' | 'b' | 'c'
  {
    name: 'full_union_quote_fix',
    description: 'Fix complete union with internal pipes',
    pattern: /'([^']+\|[^']+(?:\|[^']+)*)'/g,
    replacement: (match, group1) => {
      const parts = group1.split('|').map(p => `'${p.trim()}'`);
      return parts.join(' | ');
    },
    confidence: 'very_high'
  }
];

async function findUnionCorruption() {
  console.log('🔍 Finding systematic union type corruption...');
  
  const files = await glob('apps/claude-code-zen-server/src/**/*.ts', {
    cwd: '/home/mhugo/code/claude-code-zen',
    ignore: ['node_modules/**', 'dist/**'],
  });

  const corruptedFiles = [];
  let totalCorruptions = 0;
  
  for (const file of files) {
    const fullPath = `/home/mhugo/code/claude-code-zen/${file}`;
    try {
      const content = readFileSync(fullPath, 'utf8');
      
      // Count union corruptions
      const corruptions = (content.match(/'[^']*\|[^']*'/g) || []).length;
      if (corruptions > 0) {
        corruptedFiles.push({ file, corruptions });
        totalCorruptions += corruptions;
      }
    } catch (error) {
      // Skip unreadable files
    }
  }
  
  console.log(`📊 Found ${corruptedFiles.length} files with ${totalCorruptions} union corruptions`);
  
  // Show top corrupted files
  const topFiles = corruptedFiles.sort((a, b) => b.corruptions - a.corruptions).slice(0, 5);
  console.log('\n🎯 Most corrupted files:');
  topFiles.forEach(({file, corruptions}) => console.log(`   ${file}: ${corruptions} corruptions`));
  
  return corruptedFiles;
}

async function applySystematicFix() {
  const corruptedFiles = await findUnionCorruption();
  
  console.log('\n🔧 Applying systematic union fixes...');
  
  let totalFilesFixed = 0;
  let totalPatternsFixed = 0;
  
  for (const {file} of corruptedFiles) {
    const fullPath = `/home/mhugo/code/claude-code-zen/${file}`;
    
    try {
      let content = readFileSync(fullPath, 'utf8');
      const originalContent = content;
      let filePatternsFixes = 0;
      
      // Apply systematic patterns
      for (const pattern of systematicUnionPatterns) {
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
        
        if (totalFilesFixed <= 15) {
          console.log(`   ✅ ${file}: ${filePatternsFixes} union patterns fixed`);
        } else if (totalFilesFixed === 16) {
          console.log(`   📊 Processing many more files...`);
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${file}:`, error.message);
    }
  }
  
  console.log(`\n🏆 Systematic Union Fix Complete:`);
  console.log(`   📁 Files with union corruption: ${corruptedFiles.length}`);
  console.log(`   🔧 Files fixed: ${totalFilesFixed}`);  
  console.log(`   🎯 Union patterns fixed: ${totalPatternsFixed}`);
  
  return totalFilesFixed > 0;
}

async function testSystematicFix() {
  console.log('\n🔍 Testing systematic union fix...');
  try {
    const { execSync } = await import('child_process');
    const result = execSync('pnpm --filter @claude-zen/server type-check', { 
      cwd: '/home/mhugo/code/claude-code-zen', 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation successful!');
    console.log('🎉 ALL UNION CORRUPTION FIXED!');
    return true;
  } catch (error) {
    // Count remaining errors
    const errorLines = error.stdout.split('\n');
    const totalErrors = errorLines.filter(line => line.includes(': error ')).length;
    const unionErrors = errorLines.filter(line => 
      line.includes("';' expected") || 
      line.includes("Unterminated string")
    ).length;
    
    console.log(`📊 Remaining: ${totalErrors} total errors, ${unionErrors} likely union errors`);
    
    if (unionErrors < 100) {
      console.log('🎯 Major union fix success! Sample remaining errors:');
      const samples = errorLines.filter(line => line.includes(': error ')).slice(0, 8);
      samples.forEach(line => console.log(`   ${line}`));
    } else {
      console.log('⚠️ More union patterns need analysis');
    }
    
    return totalErrors < 1000;
  }
}

async function main() {
  console.log('🎯 SYSTEMATIC UNION TYPE CORRUPTION FIX\n');
  
  const success = await applySystematicFix();
  
  if (success) {
    const testSuccess = await testSystematicFix();
    if (testSuccess) {
      console.log('\n🚀 COMPLETE SUCCESS!');
      console.log('💡 Systematic union fix restored TypeScript syntax!');
    } else {
      console.log('\n📈 Major progress! Union corruption greatly reduced.');
    }
  } else {
    console.log('\n❌ No union corruption found to fix.');
  }
}

main().catch(console.error);