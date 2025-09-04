#!/usr/bin/env tsx

/**
 * Simple Claude Provider Test
 * 
 * Tests the Claude Code SDK integration
 */


async function testClaudeProvider() {
  try {
    console.log('🚀 Testing Claude Code SDK Provider');
    console.log('═'.repeat(60));

    // Import the Claude provider
    const { ClaudeProvider } = await import('./packages/integrations/claude-provider/src/claude-provider.js');
    
    console.log('✅ Claude Provider imported successfully');

    // Test Claude with OAuth/SDK
    console.log('\n🧪 Testing Claude Code SDK Provider...');
    try {
      const claudeProvider = new ClaudeProvider({
        useOAuth: true,
      });
      
      await claudeProvider.initialize();
      const testResult = await claudeProvider.testConnection();
      
      if (testResult.success) {
        // Test chat completion
        const response = await claudeProvider.createChatCompletion({
          messages: [{ role: 'user', content: 'Say "Hello from Claude Code SDK!" and nothing else.' }],
          max_tokens: 50
        });
        
        console.log('✅ Claude Code SDK: SUCCESS');
        console.log(`   Response: "${response.choices[0]?.message?.content}"`);
        
        // Test models
        const models = await claudeProvider.listModels();
        console.log(`   Available models: ${models.length}`);
        
      } else {
        console.log('❌ Claude Code SDK: FAILED -', testResult.error);
      }
    } catch (error) {
      console.log('❌ Claude Code SDK: ERROR -', error instanceof Error ? error.message : error);
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

testClaudeProvider();