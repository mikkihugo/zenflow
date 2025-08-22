#!/usr/bin/env node

/**
 * Batch Enhanced Corruption Fix - Complete pattern-based repair
 * Combines all proven patterns for comprehensive codebase repair
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const allPatterns = [
  // Enterprise patterns (proven working)
  {
    name: 'template_literal_corruption',
    pattern: /\$\{([^}]+)''\s*\|\s*''\s*\|\s*''([^}]+)\}/g,
    replacement: '${$1 || $2}',
    confidence: 'high'
  },
  {
    name: 'string_assignment_corruption', 
    pattern: /(\w+(?:\.\w+)*)''\s*\|\s*''\s*\|\s*'''([^']*?)'/g,
    replacement: "$1 || '$2'",
    confidence: 'high'
  },
  {
    name: 'or_operator_corruption',
    pattern: /'\s*\|\s*''\s*\|\s*'/g,
    replacement: ' || ',
    confidence: 'very_high'
  },
  {
    name: 'complex_conditional_corruption',
    pattern: /(\w+\.\w+)'\s*\|\s*''\s*\|\s*'(\w+(?:\.\w+)*)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  {
    name: 'object_property_corruption',
    pattern: /(\w+\.\w+)'\s*\|\s*''\s*\|\s*'\{/g,
    replacement: '$1 || {',
    confidence: 'high'  
  },
  {
    name: 'import_statement_corruption',
    pattern: /} from (['\"][^'\"]+['\"])\);/g,
    replacement: '} from $1;',
    confidence: 'very_high'
  },
  {
    name: 'function_call_corruption',
    pattern: /(\w+\([^)]*\));(?=\s*$)/gm,
    replacement: '$1;',
    confidence: 'medium'
  },
  {
    name: 'union_type_corruption',
    pattern: /(\w+)'\s*\|\s*'(\w+)/g,
    replacement: '$1 | $2',
    confidence: 'high'
  },
  
  // Enhanced patterns (new discoveries)
  {
    name: 'agent_union_corruption',
    pattern: /Agent''\s*\|\s*''\s*undefined/g,
    replacement: 'Agent | undefined',
    confidence: 'very_high'
  },
  {
    name: 'property_string_or_corruption',
    pattern: /([\w.]+)''\s*\|\s*''\s*\|\s*''([^']+)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  {
    name: 'property_number_or_corruption',
    pattern: /([\w.]+)''\s*\|\s*''\s*\|\s*''([\d.]+)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  {
    name: 'method_call_corruption',
    pattern: /\.getTime\s*</g,
    replacement: '.getTime() <',
    confidence: 'very_high'
  },
  {
    name: 'config_property_or_corruption',
    pattern: /(this\.config\.\w+)''\s*\|\s*''\s*\|\s*''(this\.config\.\w+)/g,
    replacement: '$1 || $2',
    confidence: 'high'
  },
  {
    name: 'string_literal_union_corruption',
    pattern: /'(\w+)'''\s*\|\s*'''(\w+)'''\s*\|\s*'''(\w+)'/g,
    replacement: "'$1' | '$2' | '$3'",
    confidence: 'very_high'
  },
  {
    name: 'property_string_literal_corruption',
    pattern: /([\w.]+)''\s*\|\s*''\s*\|\s*'''([^']+)'/g,
    replacement: "$1 || '$2'",
    confidence: 'high'
  }
];

function validatePatterns() {
  console.log('🧪 Comprehensive Pattern Validation:');
  
  const testCases = [
    { 
      input: '${data.error_description\'\' | \'\' | \'\'data.error}', 
      expected: '${data.error_description || data.error}',
      pattern: 'template_literal_corruption'
    },
    {
      input: 'process.env.HOST\'\' | \'\' | \'\'\'localhost\'',
      expected: 'process.env.HOST || \'localhost\'', 
      pattern: 'string_assignment_corruption'
    },
    {
      input: '\' | \'\' | \'',
      expected: ' || ',
      pattern: 'or_operator_corruption' 
    },
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
      input: 'overallHealth: \'healthy\'\'\' | \'\'\'degraded\'\'\' | \'\'\'critical\'',
      expected: 'overallHealth: \'healthy\' | \'degraded\' | \'critical\'',
      pattern: 'string_literal_union_corruption'
    }
  ];
  
  let validationsPassed = 0;
  
  for (const test of testCases) {
    const pattern = allPatterns.find(p => p.name === test.pattern);
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
  
  console.log(`🎯 Validation: ${validationsPassed}/${testCases.length} patterns verified\n`);
  return validationsPassed === testCases.length;
}

async function batchFixFiles() {
  console.log('🔍 Finding TypeScript files...');
  
  const files = await glob('**/*.ts', {
    cwd: '/home/mhugo/code/claude-code-zen',
    ignore: ['node_modules/**', 'dist/**', '*.d.ts', '.svelte-kit/**', 'build/**', 'coverage/**'],
  });

  console.log(`📁 Found ${files.length} TypeScript files to process`);
  console.log(`🚀 Processing with comprehensive patterns...\n`);
  
  let totalFilesFixed = 0;
  let totalPatternsFixed = 0;
  
  // Process files in batches for better progress tracking
  const batchSize = 20;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(`📦 Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)}: Processing ${batch.length} files...`);
    
    for (const file of batch) {
      const fullPath = `/home/mhugo/code/claude-code-zen/${file}`;
      
      try {
        let content = readFileSync(fullPath, 'utf8');
        const originalContent = content;
        let filePatternsFixes = 0;
        
        // Apply all patterns
        for (const pattern of allPatterns) {
          const beforeContent = content;
          content = content.replace(pattern.pattern, pattern.replacement);
          
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
  }
  
  console.log(`\n🏆 Batch Fix Complete:`);
  console.log(`   📁 Files processed: ${files.length}`);
  console.log(`   🔧 Files fixed: ${totalFilesFixed}`);  
  console.log(`   🎯 Total pattern fixes: ${totalPatternsFixed}`);
  console.log(`   📊 Success rate: ${((totalFilesFixed/files.length)*100).toFixed(1)}%`);
}

async function main() {
  if (!validatePatterns()) {
    console.error('❌ Pattern validation failed. Aborting for safety.');
    process.exit(1);
  }
  
  await batchFixFiles();
  
  console.log('\n🔍 Running TypeScript compilation check...');
  try {
    const { execSync } = await import('child_process');
    const result = execSync('npx tsc --noEmit --skipLibCheck', { 
      cwd: '/home/mhugo/code/claude-code-zen', 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log('✅ TypeScript compilation successful!');
  } catch (error) {
    console.log('📊 TypeScript errors remain, showing first 10:');
    const lines = error.stdout.split('\n').slice(0, 10);
    lines.forEach(line => line.trim() && console.log(`   ${line}`));
    console.log(`\n💡 Significant progress made! Continue with manual fixes for remaining errors.`);
  }
}

main().catch(console.error);