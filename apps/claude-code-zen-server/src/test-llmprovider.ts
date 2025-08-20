#!/usr/bin/env node
/**
 * @fileoverview Test LLMProvider Functionality
 * 
 * **PURPOSE**: Quick test to verify LLMProvider is working
 * This makes a simple LLM call to check connectivity and functionality
 */

import { getGlobalLLM } from '@claude-zen/foundation';

async function testLLMProvider(): Promise<void> {
  console.log('🧪 TESTING LLMProvider');
  console.log('====================\n');

  try {
    // Get the global LLM instance
    console.log('1. Getting LLM instance...');
    const llm = getGlobalLLM();
    llm.setRole('analyst');
    console.log('✅ LLM instance created\n');

    // Test simple completion
    console.log('2. Testing simple completion...');
    const testPrompt = "What is 2 + 2? Just answer with the number.";
    
    console.log(`📤 Prompt: "${testPrompt}"`);
    console.log('⏳ Waiting for response...\n');
    
    const startTime = Date.now();
    const response = await llm.complete(testPrompt);
    const duration = Date.now() - startTime;
    
    console.log('📥 Response received!');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📝 Response: "${response}"`);
    console.log(`📏 Length: ${response.length} characters\n`);

    // Test analyst role
    console.log('3. Testing analyst role...');
    const analysisPrompt = "Analyze this simple math problem: What makes 2+2=4 correct?";
    
    console.log(`📤 Analyst prompt: "${analysisPrompt}"`);
    console.log('⏳ Waiting for analyst response...\n');
    
    const startTime2 = Date.now();
    const analysisResponse = await llm.executeAsAnalyst(analysisPrompt, 'simple-math-analysis');
    const duration2 = Date.now() - startTime2;
    
    console.log('📥 Analyst response received!');
    console.log(`⏱️  Duration: ${duration2}ms`);
    console.log(`📝 Response: "${analysisResponse.substring(0, 200)}..."`);
    console.log(`📏 Length: ${analysisResponse.length} characters\n`);

    // Test usage stats
    console.log('4. Checking usage stats...');
    const stats = llm.getUsageStats();
    console.log('📊 Usage Stats:');
    console.log(`   - Request count: ${stats.requestCount}`);
    console.log(`   - Current role: ${stats.currentRole || 'none'}`);
    console.log(`   - Last request: ${new Date(stats.lastRequestTime).toISOString()}\n`);

    console.log('🎉 LLMProvider Test SUCCESSFUL!');
    console.log('✅ Basic completion works');
    console.log('✅ Analyst role works');
    console.log('✅ Stats tracking works');
    console.log('✅ Ready for SAFe role decisions\n');

  } catch (error) {
    console.error('❌ LLMProvider Test FAILED:');
    console.error(`💥 Error: ${error.message}`);
    
    if (error.stack) {
      console.error('\n🔍 Stack trace:');
      console.error(error.stack);
    }
    
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Check if Claude Code CLI is installed and working');
    console.log('2. Verify network connectivity');
    console.log('3. Check if @claude-zen/foundation is properly installed');
    console.log('4. Review error message above for specific issues');
    
    process.exit(1);
  }
}

// Self-executing when run directly (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  testLLMProvider().catch((error) => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}

export { testLLMProvider };