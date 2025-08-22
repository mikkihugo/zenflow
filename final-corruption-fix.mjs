#!/usr/bin/env node

/**
 * FINAL CORRUPTION FIX - Handle all remaining edge case patterns
 */

import { readFileSync, writeFileSync } from 'fs';

const finalPatterns = [
  // Pattern: 'technical | business' | 'resource' | 'external''
  {
    name: 'mixed_union_pattern',
    description: 'Fix mixed union with quotes inside strings',
    pattern: /'([^']*\|[^']*)'\s*\|\s*'([^']+)'\s*\|\s*'([^']+)''/g,
    replacement: (match, group1, group2, group3) => {
      const parts1 = group1.split('|').map(p => `'${p.trim()}'`);
      return `${parts1.join(' | ')} | '${group2}' | '${group3}'`;
    },
    confidence: 'high'
  },
  
  // Pattern: 'blocks | enables' | 'enhances'
  {
    name: 'triple_union_pattern',
    description: 'Fix triple union with embedded pipe',
    pattern: /'([^']*\|[^']*)'\s*\|\s*'([^']+)'/g,
    replacement: (match, group1, group2) => {
      const parts1 = group1.split('|').map(p => `'${p.trim()}'`);
      return `${parts1.join(' | ')} | '${group2}'`;
    },
    confidence: 'high'
  },
  
  // Pattern: 'low | medium' | 'high' | 'critical''
  {
    name: 'quad_union_trailing_quotes',
    description: 'Fix quad union with trailing quotes',
    pattern: /'([^']*\|[^']*)'\s*\|\s*'([^']+)'\s*\|\s*'([^']+)''/g,
    replacement: (match, group1, group2, group3) => {
      const parts1 = group1.split('|').map(p => `'${p.trim()}'`);
      return `${parts1.join(' | ')} | '${group2}' | '${group3}'`;
    },
    confidence: 'high'
  },

  // Pattern: 'pending | resolved' | 'blocked'
  {
    name: 'embedded_pipe_union',
    description: 'Fix union with embedded pipe in first element',
    pattern: /'([^|']+\|[^|']+)'\s*\|\s*'([^']+)'/g,
    replacement: (match, group1, group2) => {
      const parts1 = group1.split('|').map(p => `'${p.trim()}'`);
      return `${parts1.join(' | ')} | '${group2}'`;
    },
    confidence: 'high'
  },

  // Generic double quote corruption
  {
    name: 'generic_double_quote',
    description: 'Fix generic double quote corruption',
    pattern: /''([^']+)''/g,
    replacement: "'$1'",
    confidence: 'medium'
  },

  // Type annotation corruption: readonly type: 'a | b' | 'c' | 'd''
  {
    name: 'readonly_type_corruption',  
    description: 'Fix readonly type with trailing quote corruption',
    pattern: /readonly type: '([^']*\|[^']*)'\s*\|\s*'([^']+)'\s*\|\s*'([^']+)''/g,
    replacement: (match, group1, group2, group3) => {
      const parts1 = group1.split('|').map(p => `'${p.trim()}'`);
      return `readonly type: ${parts1.join(' | ')} | '${group2}' | '${group3}'`;
    },
    confidence: 'high'
  },

  // Event type corruption: readonly type:'' | '''cross.level.dependency.resolved'
  {
    name: 'event_type_corruption',
    description: 'Fix event type with empty string corruption',
    pattern: /readonly type:\s*''\s*\|\s*'''([^']+)'/g,
    replacement: "readonly type: '$1'",
    confidence: 'high'
  },

  // Empty string union corruption: type:'' | '''
  {
    name: 'empty_string_union_start',
    description: 'Fix empty string union at start of type',
    pattern: /type:\s*''\s*\|\s*'''/g,
    replacement: "type: '",
    confidence: 'high'
  }
];

async function applyFinalFix() {
  console.log('🎯 Applying final corruption fix patterns...');
  
  const filePath = '/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src/coordination/orchestration/multi-level-types.ts';
  
  let content = readFileSync(filePath, 'utf8');
  const originalContent = content;
  let totalFixes = 0;
  
  for (const pattern of finalPatterns) {
    const beforeContent = content;
    
    if (typeof pattern.replacement === 'function') {
      content = content.replace(pattern.pattern, pattern.replacement);
    } else {
      content = content.replace(pattern.pattern, pattern.replacement);
    }
    
    if (beforeContent !== content) {
      totalFixes++;
      console.log(`✅ Applied ${pattern.name}: ${pattern.description}`);
      
      // Show what changed for verification
      const lines = content.split('\n');
      const changedLines = lines.filter((line, idx) => {
        const originalLines = originalContent.split('\n');
        return originalLines[idx] !== line;
      });
      
      if (changedLines.length > 0 && changedLines.length <= 3) {
        console.log(`   → Sample: ${changedLines[0].trim()}`);
      }
    }
  }
  
  if (originalContent !== content) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`\n🏆 Final fix complete: ${totalFixes} patterns applied`);
    return true;
  } else {
    console.log('❌ No patterns matched');
    return false;
  }
}

async function testFinalFix() {
  console.log('\n🔍 Testing final fix...');
  try {
    const { execSync } = await import('child_process');
    const result = execSync('pnpm --filter @claude-zen/server type-check', { 
      cwd: '/home/mhugo/code/claude-code-zen', 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation successful!');
    console.log('🎉 ALL CORRUPTION FIXED!');
    return true;
  } catch (error) {
    console.log('📊 Remaining errors (first 10):');
    const lines = error.stdout.split('\n').slice(0, 10);
    lines.forEach(line => line.trim() && console.log(`   ${line}`));
    return false;
  }
}

async function main() {
  const success = await applyFinalFix();
  if (success) {
    const testSuccess = await testFinalFix();
    if (testSuccess) {
      console.log('\n🚀 COMPLETE SUCCESS!');
      console.log('💡 ESLint + Fresh pnpm + Source fixes = WORKING SYSTEM!');
    }
  }
}

main().catch(console.error);