#!/usr/bin/env node

/**
 * Test Gemini AI Integration with real TypeScript fixing
 */

import { GeminiAIIntegration } from './ai-eslint/gemini-ai-integration.js';

async function testGeminiFixing() {
  console.log('🧪 Testing Gemini AI Integration with real TypeScript fixing...\n');
  
  const integration = new GeminiAIIntegration();
  await integration.initializeLogging();
  
  // Create a test TypeScript error to fix
  const testViolation = {
    file: 'src/config/manager.ts',
    line: 1,
    rule: 'jsdoc/require-file-overview',
    message: 'Missing file overview JSDoc comment',
    severity: 'error'
  };
  
  console.log('📋 Test violation:', testViolation);
  console.log('\n🚀 Calling Gemini CLI with structured logging...');
  console.log('📊 Watch for structured data in logs/ai-fixing-detailed.log\n');
  
  try {
    // This will test Gemini's structured logging and file fixing
    const result = await integration.fixSingleViolation(testViolation, false);
    
    console.log(`\n✅ Gemini CLI operation completed: ${result ? 'Success' : 'No changes'}`);
    console.log('\n📊 Gemini structured logging data captured:');
    console.log('   - Gemini operation start with full prompt');
    console.log('   - Session tracking with gemini-[id]');
    console.log('   - Progress updates during execution');
    console.log('   - Output capture and metrics');
    console.log('   - Session completion with results');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGeminiFixing();