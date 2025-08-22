#!/usr/bin/env node

/**
 * Final Targeted Fix - Handle remaining specific corruption patterns
 */

import { readFileSync, writeFileSync } from 'fs';

const finalPatterns = [
  // Fix a.healthScore'' | '''' | ''1.0 -> a.healthScore || 1.0 (exact format)
  {
    name: 'exact_property_access_or_corruption',
    pattern: /([\w.]+)''\s*\|\s*''''\s*\|\s*''([\d.]+)/g,
    replacement: '$1 || $2',
    confidence: 'very_high'
  },
  // Fix a.healthScore'' | '''' | ''1.0 -> a.healthScore || 1.0 (general case)
  {
    name: 'property_access_or_corruption',
    pattern: /([\w.]+)''\s*\|\s*''\s*\|\s*''([\d.]+)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  // Fix a.healthScore'' | '''' | '''unknown' -> a.healthScore || 'unknown' (exact format)
  {
    name: 'exact_property_access_string_or_corruption',
    pattern: /([\w.]+)''\s*\|\s*''''\s*\|\s*'''([^']+)'/g,
    replacement: "$1 || '$2'",
    confidence: 'very_high'
  },
  // Fix a.healthScore'' | '''' | '''unknown' -> a.healthScore || 'unknown' (general case)  
  {
    name: 'property_access_string_or_corruption',
    pattern: /([\w.]+)''\s*\|\s*''\s*\|\s*'''([^']+)'/g,
    replacement: "$1 || '$2'",
    confidence: 'high'
  },
  // Fix this.config.enableNeuralOptimization'' | '''' | ''this.config.enableLoadBalancing (exact format)
  {
    name: 'exact_config_boolean_or_corruption', 
    pattern: /(this\.config\.\w+)''\s*\|\s*''''\s*\|\s*''(this\.config\.\w+)/g,
    replacement: '$1 || $2',
    confidence: 'very_high'
  },
  // Fix this.config.enableNeuralOptimization'' | '''' | ''this.config.enableLoadBalancing (general case)
  {
    name: 'config_boolean_or_corruption', 
    pattern: /(this\.config\.\w+)''\s*\|\s*''\s*\|\s*''(this\.config\.\w+)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  // Fix agents?.values())() -> agents?.values()
  {
    name: 'method_call_double_parens',
    pattern: /([\w.?]+\(\))(\(\))/g,
    replacement: '$1',
    confidence: 'very_high'
  },
  // Fix Object.values()(aiStats) -> Object.values(aiStats)
  {
    name: 'object_values_call_corruption',
    pattern: /Object\.values\(\)\(/g,
    replacement: 'Object.values(',
    confidence: 'very_high'
  },
  // Fix agent.status ==='idle -> agent.status === 'idle'
  {
    name: 'comparison_operator_corruption',
    pattern: /([\w.]+)\s*===\s*'/g,
    replacement: "$1 === '",
    confidence: 'very_high'
  }
];

async function fixTargetFile(filePath) {
  console.log(`🔧 Final fix for: ${filePath}`);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    const originalContent = content;
    let patternsFixed = 0;
    
    for (const pattern of finalPatterns) {
      const beforeContent = content;
      content = content.replace(pattern.pattern, pattern.replacement);
      
      if (beforeContent !== content) {
        patternsFixed++;
        console.log(`   ✅ Applied: ${pattern.name}`);
      }
    }
    
    if (originalContent !== content) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`   🎯 Total patterns fixed: ${patternsFixed}`);
      return true;
    } else {
      console.log(`   ✨ No fixes needed`);
      return false;
    }
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  const targetFile = '/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src/coordination/manager.ts';
  
  console.log('🎯 Running final targeted fix...');
  const fixed = await fixTargetFile(targetFile);
  
  if (fixed) {
    console.log('\n🔍 Testing TypeScript compilation...');
    try {
      const { execSync } = await import('child_process');
      const result = execSync(`npx tsc --noEmit --skipLibCheck "${targetFile}"`, { 
        cwd: '/home/mhugo/code/claude-code-zen', 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ File compiles without errors!');
    } catch (error) {
      console.log('📊 Remaining TypeScript errors:');
      const lines = error.stdout.split('\n').filter(line => line.includes('manager.ts')).slice(0, 5);
      lines.forEach(line => console.log(`   ${line}`));
    }
  }
}

main().catch(console.error);