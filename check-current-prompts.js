#!/usr/bin/env node

/**
 * Inspect current prompts being used by zen-ai-fixer
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

console.log('🔍 Checking Current ESLint Fixer Prompts');

console.log('=======================================');

// Check if zen-ai-fixer is running
try {
  const processes = execSync('ps aux | grep zen-ai-fixer | grep -v grep', { encoding: 'utf8' });
  if (processes.trim()) {
    console.log('✅ zen-ai-fixer is currently running');

    console.log('Processes:', processes.trim());
  } else {
    console.log('❌ zen-ai-fixer is not running');
  }
} catch (_error) {
  console.log('❌ zen-ai-fixer is not running');
}

console.log('\n📋 Analyzing prompt generation in zen-ai-fixer.js...\n');

// Read the zen-ai-fixer file and find prompt generation
try {
  const fixerCode = fs.readFileSync('scripts/ai-eslint/zen-ai-fixer.js', 'utf8');

  // Extract the buildContextAwarePrompt function
  const promptMatch = fixerCode.match(
    /buildContextAwarePrompt\(violation\)\s*{[\s\S]*?return\s*`([\s\S]*?)`;/
  );

  if (promptMatch) {
    console.log('🎯 Current Prompt Template:');

    console.log('-'.repeat(60));

    console.log(promptMatch[1]);

    console.log('-'.repeat(60));

    // Check for potential issues
    const issues = [];

    if (promptMatch[1].includes(`\${relativeFilePath}`)) {
      console.log('✅ Uses relative file path correctly');
    } else {
      issues.push('❌ Missing relative file path variable');
    }

    if (promptMatch[1].includes('Edit tool')) {
      console.log('✅ References Edit tool correctly');
    } else {
      issues.push('❌ Missing Edit tool reference');
    }

    if (promptMatch[1].includes(`Line \${violation.line}`)) {
      console.log('✅ Includes line number');
    } else {
      issues.push('❌ Missing line number');
    }

    if (promptMatch[1].includes('**🎯 CRITICAL:')) {
      console.log('✅ Has critical instruction emphasis');
    } else {
      issues.push('⚠️ Missing critical instruction emphasis');
    }

    if (issues.length > 0) {
      console.log('\n🚨 Potential Issues Found:');

      issues.forEach((issue) => console.log(issue));
    } else {
      console.log('\n✅ Prompt template looks good structurally');
    }
  } else {
    console.log('❌ Could not find buildContextAwarePrompt function');
  }

  // Check for timeout configuration
  const timeoutMatch = fixerCode.match(/INACTIVITY_TIMEOUT\s*=\s*(\d+)/);
  if (timeoutMatch) {
    const timeout = parseInt(timeoutMatch[1]) / 1000;

    console.log(`\n⏱️ Current inactivity timeout: ${timeout} seconds`);
    if (timeout < 300) {
      console.log('⚠️ Timeout may be too short for complex violations');
    }
  }

  // Check for batch size
  const batchMatch = fixerCode.match(/BATCH_SIZE\s*=\s*(\d+)/);
  if (batchMatch) {
    console.log(`📦 Current batch size: ${batchMatch[1]} violations`);
  }
} catch (error) {
  console.error('❌ Error analyzing zen-ai-fixer.js:', error.message);
}

console.log('\n💡 Recommendations for prompt improvement:');

console.log('1. Ensure prompts are specific about exact files to edit');

console.log('2. Include clear violation context and surrounding code');

console.log('3. Specify exact line numbers and columns');

console.log('4. Use direct Edit tool commands rather than general instructions');

console.log('5. Test prompts with a single violation first');
