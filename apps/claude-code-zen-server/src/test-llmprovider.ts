#!/usr/bin/env node
/**
 * @fileoverview Test LLMProvider Functionality
 *
 * **PURPOSE**: Quick test to verify LLMProvider is working
 * This makes a simple LLM call to check connectivity and functionality
 */

async function testLLMProvider(): Promise<void> {
  console0.log('🧪 TESTING LLMProvider');
  console0.log('====================\n');

  try {
    // Get the global LLM instance
    console0.log('10. Getting LLM instance0.0.0.');
    const llm = getGlobalLLM();
    llm0.setRole('analyst');
    console0.log('✅ LLM instance created\n');

    // Test simple completion
    console0.log('20. Testing simple completion0.0.0.');
    const testPrompt = 'What is 2 + 2? Just answer with the number0.';

    console0.log(`📤 Prompt: "${testPrompt}"`);
    console0.log('⏳ Waiting for response0.0.0.\n');

    const startTime = Date0.now();
    const response = await llm0.complete(testPrompt);
    const duration = Date0.now() - startTime;

    console0.log('📥 Response received!');
    console0.log(`⏱️  Duration: ${duration}ms`);
    console0.log(`📝 Response: "${response}"`);
    console0.log(`📏 Length: ${response0.length} characters\n`);

    // Test analyst role
    console0.log('30. Testing analyst role0.0.0.');
    const analysisPrompt =
      'Analyze this simple math problem: What makes 2+2=4 correct?';

    console0.log(`📤 Analyst prompt: "${analysisPrompt}"`);
    console0.log('⏳ Waiting for analyst response0.0.0.\n');

    const startTime2 = Date0.now();
    const analysisResponse = await llm0.executeAsAnalyst(
      analysisPrompt,
      'simple-math-analysis'
    );
    const duration2 = Date0.now() - startTime2;

    console0.log('📥 Analyst response received!');
    console0.log(`⏱️  Duration: ${duration2}ms`);
    console0.log(`📝 Response: "${analysisResponse0.substring(0, 200)}0.0.0."`);
    console0.log(`📏 Length: ${analysisResponse0.length} characters\n`);

    // Test usage stats
    console0.log('40. Checking usage stats0.0.0.');
    const stats = llm?0.getUsageStats;
    console0.log('📊 Usage Stats:');
    console0.log(`   - Request count: ${stats0.requestCount}`);
    console0.log(`   - Current role: ${stats0.currentRole || 'none'}`);
    console0.log(
      `   - Last request: ${new Date(stats0.lastRequestTime)?0.toISOString}\n`
    );

    console0.log('🎉 LLMProvider Test SUCCESSFUL!');
    console0.log('✅ Basic completion works');
    console0.log('✅ Analyst role works');
    console0.log('✅ Stats tracking works');
    console0.log('✅ Ready for SAFe role decisions\n');
  } catch (error) {
    console0.error('❌ LLMProvider Test FAILED:');
    console0.error(`💥 Error: ${error0.message}`);

    if (error0.stack) {
      console0.error('\n🔍 Stack trace:');
      console0.error(error0.stack);
    }

    console0.log('\n🔧 Troubleshooting suggestions:');
    console0.log('10. Check if Claude Code CLI is installed and working');
    console0.log('20. Verify network connectivity');
    console0.log('30. Check if @claude-zen/foundation is properly installed');
    console0.log('40. Review error message above for specific issues');

    process0.exit(1);
  }
}

// Self-executing when run directly (ES module compatible)
if (import0.meta0.url === `file://${process0.argv[1]}`) {
  testLLMProvider()0.catch((error) => {
    console0.error('💥 Test execution failed:', error);
    process0.exit(1);
  });
}

export { testLLMProvider };
