#!/usr/bin/env node
/**
 * @fileoverview Quick LLMProvider Test - Single Call Only
 * 
 * **PURPOSE**: Fastest possible test to confirm LLMProvider works
 * Makes only ONE LLM call to verify functionality
 */

import { getGlobalLLM } from '@claude-zen/foundation';

async function quickLLMTest(): Promise<void> {
  console.log('⚡ QUICK LLMProvider Test');
  console.log('=======================\n');

  try {
    console.log('📋 Making single LLM call...');
    console.log('❓ Question: "What is 5 + 3? Just the number."');
    console.log('⏳ Please wait (this takes ~30-40 seconds)...\n');
    
    const llm = getGlobalLLM();
    llm.setRole('analyst');
    
    const startTime = Date.now();
    const response = await llm.complete("What is 5 + 3? Just the number.");
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    console.log('✅ SUCCESS!');
    console.log(`📥 Response: "${response}"`);
    console.log(`⏱️  Duration: ${duration} seconds`);
    console.log('🎉 LLMProvider is working correctly!\n');
    
    console.log('💡 Full workflow will take ~4-5 minutes (7 AI calls)');
    console.log('🚀 Ready to run: npm run iteration1');

  } catch (error) {
    console.error('❌ FAILED:');
    console.error(`💥 Error: ${error.message}\n`);
    
    console.log('🔧 Possible issues:');
    console.log('1. Claude Code CLI not available');
    console.log('2. Network connectivity issues');
    console.log('3. API rate limits or authentication issues');
    
    process.exit(1);
  }
}

// Self-executing when run directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  quickLLMTest().catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });
}

export { quickLLMTest };