#!/usr/bin/env node

/**
 * Enhanced Corruption Fix - Targeted pattern fix
 * Based on remaining TypeScript errors analysis
 */

import { readFileSync, writeFileSync } from 'fs';

const enhancedPatterns = [
  // Fix Agent'' | ''undefined -> Agent | undefined
  {
    name: 'agent_union_corruption',
    pattern: /Agent''\s*\|\s*''\s*undefined/g,
    replacement: 'Agent | undefined',
    confidence: 'very_high'
  },
  // Fix prop'' | '''' | ''value -> prop || value (with strings)
  {
    name: 'property_string_or_corruption',
    pattern: /([\w.]+)''\s*\|\s*''\s*\|\s*''([^']+)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  // Fix prop'' | '''' | ''0.8 -> prop || 0.8
  {
    name: 'property_number_or_corruption',
    pattern: /([\w.]+)''\s*\|\s*''\s*\|\s*''([\d.]+)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  // Fix getTime < -> getTime() <
  {
    name: 'method_call_corruption',
    pattern: /\.getTime\s*</g,
    replacement: '.getTime() <',
    confidence: 'very_high'
  },
  // Fix this.config.enableNeuralOptimization'' | '''' | ''this.config.enableLoadBalancing
  {
    name: 'config_property_or_corruption',
    pattern: /(this\.config\.\w+)''\s*\|\s*''\s*\|\s*''(this\.config\.\w+)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  // Fix 'healthy''' | '''degraded''' | '''critical' -> 'healthy' | 'degraded' | 'critical'
  {
    name: 'string_literal_union_corruption',
    pattern: /'(\w+)'''\s*\|\s*'''(\w+)'''\s*\|\s*'''(\w+)'/g,
    replacement: "'$1' | '$2' | '$3'",
    confidence: 'very_high'
  },
  // Fix healthScore'' | '''' | '''unknown' -> healthScore || 'unknown'
  {
    name: 'property_string_literal_corruption',
    pattern: /([\w.]+)''\s*\|\s*''\s*\|\s*'''([^']+)'/g,
    replacement: "$1 || '$2'",
    confidence: 'high'
  }
];

function validatePatterns() {
  console.log('🧪 Enhanced Pattern Validation:');
  
  const testCases = [
    { 
      input: 'let selectedAgent: Agent\'\' | \'\'undefined;', 
      expected: 'let selectedAgent: Agent | undefined;',
      pattern: 'agent_union_corruption'
    },
    {
      input: 'healthScore\'\' | \'\' | \'\'1.0',
      expected: 'healthScore || 1.0', 
      pattern: 'property_string_or_corruption'
    },
    {
      input: 'agent.performancePrediction\'\' | \'\' | \'\'\.8',
      expected: 'agent.performancePrediction || .8',
      pattern: 'property_number_or_corruption'
    },
    {
      input: 'agent.lastHeartbeat?.getTime < 60000',
      expected: 'agent.lastHeartbeat?.getTime() < 60000',
      pattern: 'method_call_corruption'
    },
    {
      input: 'this.config.enableNeuralOptimization\'\' | \'\' | \'\'this.config.enableLoadBalancing',
      expected: 'this.config.enableNeuralOptimization || this.config.enableLoadBalancing',
      pattern: 'config_property_or_corruption'
    },
    {
      input: 'overallHealth: \'healthy\'\'\' | \'\'\'degraded\'\'\' | \'\'\'critical\'',
      expected: "overallHealth: 'healthy' | 'degraded' | 'critical'",
      pattern: 'string_literal_union_corruption'
    },
    {
      input: 'agentHealthScore: selectedAgent.healthScore\'\' | \'\' | \'\'\'unknown\'',
      expected: "agentHealthScore: selectedAgent.healthScore || 'unknown'",
      pattern: 'property_string_literal_corruption'
    }
  ];
  
  let validationsPassed = 0;
  
  for (const test of testCases) {
    const pattern = enhancedPatterns.find(p => p.name === test.pattern);
    if (pattern) {
      const result = test.input.replace(pattern.pattern, pattern.replacement);
      const passed = result === test.expected;
      console.log(`   ${passed ? '✅' : '❌'} ${test.pattern}: ${passed ? 'PASS' : 'FAIL'}`);
      if (passed) validationsPassed++;
      if (!passed) {
        console.log(`      Input:    ${test.input}`);
        console.log(`      Expected: ${test.expected}`);
        console.log(`      Got:      ${result}`);
      }
    }
  }
  
  console.log(`🎯 Enhanced Validation: ${validationsPassed}/${testCases.length} patterns verified\n`);
  return validationsPassed === testCases.length;
}

async function fixTargetFile(filePath) {
  console.log(`🔧 Fixing specific file: ${filePath}`);
  
  try {
    let content = readFileSync(filePath, 'utf8');
    const originalContent = content;
    let patternsFixed = 0;
    
    for (const pattern of enhancedPatterns) {
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
  if (!validatePatterns()) {
    console.error('❌ Enhanced pattern validation failed. Aborting.');
    process.exit(1);
  }
  
  const targetFile = '/home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src/coordination/manager.ts';
  
  console.log('🎯 Running enhanced fix on target file...');
  const fixed = await fixTargetFile(targetFile);
  
  if (fixed) {
    console.log('\n🔍 Testing TypeScript compilation on fixed file...');
    try {
      const { execSync } = await import('child_process');
      const result = execSync(`npx tsc --noEmit --skipLibCheck "${targetFile}"`, { 
        cwd: '/home/mhugo/code/claude-code-zen', 
        encoding: 'utf8',
        stdio: 'pipe'
      });
      console.log('✅ File compiles without errors!');
      console.log('🚀 Enhanced patterns are working - ready for batch processing');
    } catch (error) {
      console.log('📊 Remaining TypeScript errors (first 5):');
      const lines = error.stdout.split('\n').filter(line => line.includes('error')).slice(0, 5);
      lines.forEach(line => console.log(`   ${line}`));
      console.log('\n💡 Some patterns may need further enhancement');
    }
  }
}

main().catch(console.error);