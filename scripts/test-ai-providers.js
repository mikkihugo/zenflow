#!/usr/bin/env node

/**
 * Test AI Provider Selection System
 * Demonstrates --ai=claude vs --ai=gemini flag
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function testAIProviderSelection() {
  console.log('🧪 Testing AI Provider Selection System\n');

  // Test Claude (default)
  console.log('📋 Test 1: Default Claude AI');
  console.log('Command: node scripts/ai-eslint/zen-ai-fixer-complete.js --phase=compile --dry-run');

  // Test Gemini flag
  console.log('\n📋 Test 2: Gemini AI with --ai=gemini flag');
  console.log(
    'Command: node scripts/ai-eslint/zen-ai-fixer-complete.js --phase=compile --ai=gemini --dry-run'
  );

  console.log('\n🎯 Expected Outputs:');
  console.log('✅ Test 1 should show: "🤖 Using Claude AI for fixing"');
  console.log('✅ Test 2 should show: "🤖 Using Gemini AI for fixing"');

  console.log('\n📋 To test manually, run:');
  console.log('# Test Claude (default):');
  console.log('node scripts/ai-eslint/zen-ai-fixer-complete.js --phase=eslint --quick --dry-run');
  console.log('\n# Test Gemini:');
  console.log(
    'node scripts/ai-eslint/zen-ai-fixer-complete.js --phase=eslint --ai=gemini --quick --dry-run'
  );

  console.log(
    '\n🔄 Both commands should work with structured logging and show provider selection!'
  );
}

testAIProviderSelection();
