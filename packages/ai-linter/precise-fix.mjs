#!/usr/bin/env node

/**
 * PRECISE FIX - Target the exact corruption patterns found
 */

import { readFileSync, writeFileSync } from 'fs';

const precisePatterns = [
  // EXACT PATTERN from line 64
  {
    name: 'multiline_union_with_comments',
    description: 'Fix multi-line union types with embedded comments',
    pattern: /'([^']+)''\/\/([^']+)''\s*\|\s*'''([^']+)'\/\/([^']+)''\s*\|\s*'''([^']+)'\/\/([^']+)''\s*\|\s*'''([^']+)'\/\/([^']+)''\s*\|\s*'''([^']+)'/g,
    replacement: "'$1' // $2\n  | '$3' // $4\n  | '$5' // $6\n  | '$7' // $8\n  | '$9'",
    confidence: 'very_high'
  },
  
  // Pattern from line 590: BiomeRule'' | ''null
  {
    name: 'return_type_corruption',
    description: 'Fix return type corruption',
    pattern: /([A-Za-z]+)''\s*\|\s*''null/g,
    replacement: '$1 | null',
    confidence: 'very_high'
  },
  
  // Pattern from line 678: confidence'' | '''' | ''0
  {
    name: 'optional_chaining_corruption',
    description: 'Fix optional chaining with fallback corruption',
    pattern: /([a-zA-Z.]+)\?\\.([a-zA-Z]+)''\s*\|\s*''\s*\|\s*''([^;]+)/g,
    replacement: '$1?.$2 || $3',
    confidence: 'very_high'
  },
  
  // Array function call corruption from line 788
  {
    name: 'array_method_corruption',
    description: 'Fix array method call corruption',
    pattern: /\.values\(\)\(\)/g,
    replacement: '.values()',
    confidence: 'very_high'
  }
];

async function preciseFix() {
  console.log('🎯 PRECISE FIX - Targeting exact corruption patterns');
  
  const filePath = '/home/mhugo/code/claude-code-zen/packages/ai-linter/src/ai-rule-generator.ts';
  
  let content = readFileSync(filePath, 'utf8');
  const originalContent = content;
  let totalFixes = 0;
  
  for (const pattern of precisePatterns) {
    const beforeContent = content;
    content = content.replace(pattern.pattern, pattern.replacement);
    
    if (beforeContent !== content) {
      totalFixes++;
      console.log(`✅ Applied ${pattern.name}: ${pattern.description}`);
    }
  }
  
  if (originalContent !== content) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`\n🏆 Precise fix complete: ${totalFixes} patterns fixed`);
  } else {
    console.log('❌ No patterns matched - corruption might have different syntax');
  }
  
  return totalFixes > 0;
}

async function testPreciseFix() {
  console.log('\n🔍 Testing after precise fix...');
  try {
    const { execSync } = await import('child_process');
    const result = execSync('npx tsc --noEmit --skipLibCheck packages/ai-linter/src/ai-rule-generator.ts', { 
      cwd: '/home/mhugo/code/claude-code-zen', 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation successful!');
    return true;
  } catch (error) {
    console.log('📊 Remaining errors (first 5):');
    const lines = error.stdout.split('\n').slice(0, 5);
    lines.forEach(line => line.trim() && console.log(`   ${line}`));
    return false;
  }
}

async function main() {
  const success = await preciseFix();
  if (success) {
    const compilationSuccess = await testPreciseFix();
    if (compilationSuccess) {
      console.log('\n🎉 SUCCESS! Precise patterns fixed the corruption!');
    } else {
      console.log('\n⚠️  Partial success - some patterns remain.');
    }
  }
}

main().catch(console.error);