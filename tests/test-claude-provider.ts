#!/usr/bin/env tsx

/**
 * Simple Claude Provider Test
 * 
 * Tests the Claude Code SDK integration
 */


async function testClaudeProvider() {
  try {
    // 🚀 Testing Claude Code SDK Provider
    // ================================================

    // Import the Claude provider
    const { ClaudeProvider } = await import('./packages/integrations/claude-provider/src/claude-provider.js');
    
    // ✅ Claude Provider imported successfully

    // Test Claude with OAuth/SDK
    // 🧪 Testing Claude Code SDK Provider...
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
        
        // ✅ Claude Code SDK: SUCCESS
        //    Response: [content]
        
        // Test models
        const models = await claudeProvider.listModels();
        //    Available models: [count]
        
      } else {
        // ❌ Claude Code SDK: FAILED - [error]
      }
    } catch (error) {
      // ❌ Claude Code SDK: ERROR - [error]
    }
    
  } catch (error) {
    // ❌ Test suite failed
    process.exit(1);
  }
}

testClaudeProvider();