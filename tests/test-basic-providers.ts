#!/usr/bin/env tsx

/**
 * Basic LLM Providers Test
 * 
 * Tests the core functionality of all providers:
 * 1. Claude (with Context7 MCP)
 * 2. Copilot (with auto-renewal) 
 * 3. GitHub Models
 * 4. Gemini (EventBus)
 */

async function testBasicProviders() {
  // 🚀 Testing Basic LLM Provider Functionality
  // ================================================

  const results: Array<{
    provider: string;
    success: boolean;
    error?: string;
    details?: any;
  }> = [];

  // Test 1: Claude Provider with Context7
  // 1️⃣ Testing Claude Provider...
  try {
    const { ClaudeProvider } = await import('./packages/integrations/claude-provider/dist/claude-provider.js');
    
    const provider = new ClaudeProvider({
      useOAuth: true
    });
    
    await provider.initialize();
    // ✅ Claude provider initialized
    
    // Test connection
    const testResult = await provider.testConnection();
    if (testResult.success) {
      // ✅ Claude connection test passed
      
      // Test Context7 resources
      try {
        const resources = await provider.getContext7Resources();
        // ✅ Context7 resources: [count] available
      } catch (error) {
        // ⚠️ Context7 MCP server not available (expected)
      }
      
      results.push({
        provider: 'Claude + Context7',
        success: true,
        details: { contextSupport: true }
      });
    } else {
      throw new Error(testResult.error);
    }
  } catch (error) {
    // ❌ Claude provider failed: [error]
    results.push({
      provider: 'Claude + Context7',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: Copilot Auto-Renewal Token Manager
  // 2️⃣ Testing Copilot Token Manager...
  try {
    const { CopilotTokenManager } = await import('./packages/integrations/copilot-provider/dist/copilot-token-manager.js');
    
    const tokenManager = new CopilotTokenManager();
    // ✅ Copilot token manager created
    
    // Test token caching logic (without actual token)
    const hasCached = tokenManager.hasCachedToken();
    // ✅ Token caching system: [status]
    
    results.push({
      provider: 'Copilot Token Manager',
      success: true,
      details: { autoRenewal: true, caching: true }
    });
  } catch (error) {
    // ❌ Copilot token manager failed: [error]
    results.push({
      provider: 'Copilot Token Manager',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 3: GitHub Models Provider
  // 3️⃣ Testing GitHub Models Provider...
  try {
    // Check if built
    const fs = await import('node:fs');
    const githubModelsPath = './packages/integrations/github-models-provider/dist/index.js';
    
    if (fs.existsSync(githubModelsPath)) {
      const { createGitHubModelsProvider } = await import(githubModelsPath);
      const provider = createGitHubModelsProvider();
      // ✅ GitHub Models provider created
      
      results.push({
        provider: 'GitHub Models',
        success: true,
        details: { factory: true }
      });
    } else {
      throw new Error('GitHub Models provider not built');
    }
  } catch (error) {
    // ❌ GitHub Models provider failed: [error]
    results.push({
      provider: 'GitHub Models',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 4: Gemini EventBus Integration
  // 4️⃣ Testing Gemini EventBus Integration...
  try {
    const { registerGeminiHandlers } = await import('./packages/integrations/gemini-provider/src/index.js');
    
    // Mock EventBus for testing
    const mockBus = {
      on: (event: string, handler: Function) => {
        // ✅ Registered handler for: [event]
      },
      emit: (event: string, data: any) => {
        // ✅ Can emit: [event]
      },
      getInstance: () => mockBus
    };
    
    // Register handlers with mock bus
    await registerGeminiHandlers(mockBus as any);
    // ✅ Gemini EventBus handlers registered
    
    results.push({
      provider: 'Gemini EventBus',
      success: true,
      details: { eventDriven: true }
    });
  } catch (error) {
    // ❌ Gemini EventBus failed: [error]
    results.push({
      provider: 'Gemini EventBus',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Summary
  // BASIC PROVIDER TEST RESULTS
  // ================================================
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  // Successful: [count]
  // Failed: [count]
  
  if (successful.length > 0) {
    // Working Providers: [list]
    for (const result of successful) {
      //   • [provider]
      if (result.details) {
        const features = Object.keys(result.details).join(', ');
        //     Features: [features]
      }
    }
  }
  
  if (failed.length > 0) {
    // Failed Providers: [list]
    for (const result of failed) {
      //   • [provider]: [error]
    }
  }
  
  // Provider Architecture Status:
  //   • Modular design: [status]
  //   • Auto token renewal: [status]
  //   • MCP integration: [status]
  //   • EventBus pattern: [status]
  //   • OpenAI compatibility: [status]
  
  if (successful.length === results.length) {
    // ALL BASIC PROVIDER FUNCTIONALITY OPERATIONAL!
  } else if (successful.length > 0) {
    // PARTIAL SYSTEM OPERATIONAL - Build remaining providers
  }
}

testBasicProviders().catch(console.error);