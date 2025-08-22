#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

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
  }
];

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

// Test on specific corrupted files
const testFiles = [
  '/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src/claude-zen-core.ts',
  '/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src/commands/auth-minimal.ts'
];

console.log('🧪 Testing repair patterns on corrupted files');

for (const filePath of testFiles) {
  try {
    console.log(`\n🔍 Testing: ${filePath.split('/').pop()}`);
    
    const originalContent = readFileSync(filePath, 'utf8');
    const { content: repairedContent, patternsApplied } = applyRepairs(originalContent);
    
    if (originalContent === repairedContent) {
      console.log('✨ No repairs needed');
    } else {
      console.log(`🔧 Applied patterns: ${patternsApplied.join(', ')}`);
      
      // Show a few examples of changes
      const lines = originalContent.split('\n');
      const repairedLines = repairedContent.split('\n');
      
      let changesFound = 0;
      for (let i = 0; i < Math.min(lines.length, repairedLines.length) && changesFound < 3; i++) {
        if (lines[i] !== repairedLines[i]) {
          console.log(`   Line ${i+1}:`);
          console.log(`   - ${lines[i].trim()}`);
          console.log(`   + ${repairedLines[i].trim()}`);
          changesFound++;
        }
      }
      
      // Write the repaired content
      writeFileSync(filePath, repairedContent, 'utf8');
      console.log('✅ File repaired and saved');
    }
    
  } catch (error) {
    console.error(`💥 Error processing ${filePath}:`, error.message);
  }
}

console.log('\n🎉 Pattern testing complete!');