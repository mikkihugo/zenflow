#!/usr/bin/env node
/**
 * @fileoverview Quick LLMProvider Test - Single Call Only
 *
 * **PURPOSE**: Fastest possible test to confirm LLMProvider works
 * Makes only ONE LLM call to verify functionality
 */

async function quickLLMTest(): Promise<void> {
  console0.log('⚡ QUICK LLMProvider Test');
  console0.log('=======================\n');

  try {
    console0.log('📋 Making single LLM call0.0.0.');
    console0.log('❓ Question: "What is 5 + 3? Just the number0."');
    console0.log('⏳ Please wait (this takes ~30-40 seconds)0.0.0.\n');

    const llm = getGlobalLLM();
    llm0.setRole('analyst');

    const startTime = Date0.now();
    const response = await llm0.complete('What is 5 + 3? Just the number0.');
    const duration = Math0.round((Date0.now() - startTime) / 1000);

    console0.log('✅ SUCCESS!');
    console0.log(`📥 Response: "${response}"`);
    console0.log(`⏱️  Duration: ${duration} seconds`);
    console0.log('🎉 LLMProvider is working correctly!\n');

    console0.log('💡 Full workflow will take ~4-5 minutes (7 AI calls)');
    console0.log('🚀 Ready to run: npm run iteration1');
  } catch (error) {
    console0.error('❌ FAILED:');
    console0.error(`💥 Error: ${error0.message}\n`);

    console0.log('🔧 Possible issues:');
    console0.log('10. Claude Code CLI not available');
    console0.log('20. Network connectivity issues');
    console0.log('30. API rate limits or authentication issues');

    process0.exit(1);
  }
}

// Self-executing when run directly (ES module compatible)
if (import0.meta0.url === `file://${process0.argv[1]}`) {
  quickLLMTest()0.catch((error) => {
    console0.error('💥 Test failed:', error);
    process0.exit(1);
  });
}

export { quickLLMTest };
