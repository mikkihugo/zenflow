#!/usr/bin/env tsx

/**
 * Complete LLM Provider Integration Test
 * 
 * Tests all available providers:
 * 1. GitHub Copilot (with enterprise access)
 * 2. GitHub Models API 
 * 3. Claude (with OAuth support)
 */

import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

async function testAllProviders() {
  try {
    // 🚀 Testing All LLM Provider Integrations
    // ========================================

    // Import the LLM provider
    const { LlmProvider, LLMProviderType } = await import('./packages/integrations/llm-providers/src/llm-provider.js');
    
    // Load GitHub token for Copilot/Models testing
    let githubToken: string | undefined;
    try {
      const tokenPath = join(homedir(), '.claude-zen', 'copilot-token.json');
      const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf8'));
      githubToken = tokenData.access_token;
      // Found GitHub token for Copilot/Models testing
    } catch {
      // No GitHub token found - skipping GitHub providers
    }

    const results: Array<{
      provider: string;
      success: boolean;
      error?: string;
      details?: any;
    }> = [];

    // Test 1: GitHub Copilot (if token available)
    if (githubToken) {
      // 1️⃣ Testing GitHub Copilot Provider...
      try {
        const copilotProvider = new LlmProvider({
          type: LLMProviderType.GITHUB_COPILOT,
          token: githubToken
        });
        
        await copilotProvider.initialize();
        const testResult = await copilotProvider.testConnection();
        
        if (testResult.success) {
          // Test chat completion
          const response = await copilotProvider.createChatCompletion({
            messages: [{ role: 'user', content: 'Say "Hello from Copilot!" and nothing else.' }],
            max_tokens: 50
          });
          
          results.push({
            provider: 'GitHub Copilot',
            success: true,
            details: {
              models: await copilotProvider.listModels(),
              response: response.choices[0]?.message?.content
            }
          });
          // Removed console.log('✅ GitHub Copilot: SUCCESS');
        } else {
          results.push({
            provider: 'GitHub Copilot',
            success: false,
            error: testResult.error
          });
          // Removed console.log('❌ GitHub Copilot: FAILED -', testResult.error);
        }
      } catch (error) {
        results.push({
          provider: 'GitHub Copilot',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Removed console.log('❌ GitHub Copilot: ERROR -', error);
      }
    }

    // Test 2: GitHub Models (if token available)
    if (githubToken) {
      // Removed console.log('\\n2️⃣ Testing GitHub Models Provider...');
      try {
        const modelsProvider = new LlmProvider({
          type: LLMProviderType.GITHUB_MODELS,
          token: githubToken
        });
        
        await modelsProvider.initialize();
        const testResult = await modelsProvider.testConnection();
        
        if (testResult.success) {
          // Test chat completion
          const response = await modelsProvider.createChatCompletion({
            messages: [{ role: 'user', content: 'Say "Hello from GitHub Models!" and nothing else.' }],
            model: 'gpt-4o-mini',
            max_tokens: 50
          });
          
          results.push({
            provider: 'GitHub Models',
            success: true,
            details: {
              models: await modelsProvider.listModels(),
              response: response.choices[0]?.message?.content
            }
          });
          // Removed console.log('✅ GitHub Models: SUCCESS');
        } else {
          results.push({
            provider: 'GitHub Models',
            success: false,
            error: testResult.error
          });
          // Removed console.log('❌ GitHub Models: FAILED -', testResult.error);
        }
      } catch (error) {
        results.push({
          provider: 'GitHub Models',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        // Removed console.log('❌ GitHub Models: ERROR -', error);
      }
    }

    // Test 3: Claude (with OAuth)
    // Removed console.log('\\n3️⃣ Testing Claude Provider (OAuth)...');
    try {
      const claudeProvider = new LlmProvider({
        type: LLMProviderType.CLAUDE,
        // No API key - will use OAuth
      });
      
      await claudeProvider.initialize();
      const testResult = await claudeProvider.testConnection();
      
      if (testResult.success) {
        // Test chat completion
        const response = await claudeProvider.createChatCompletion({
          messages: [{ role: 'user', content: 'Say "Hello from Claude!" and nothing else.' }],
          max_tokens: 50
        });
        
        results.push({
          provider: 'Claude (OAuth)',
          success: true,
          details: {
            models: await claudeProvider.listModels(),
            response: response.choices[0]?.message?.content
          }
        });
        // Removed console.log('✅ Claude: SUCCESS');
      } else {
        results.push({
          provider: 'Claude (OAuth)',
          success: false,
          error: testResult.error
        });
        // Removed console.log('❌ Claude: FAILED -', testResult.error);
      }
    } catch (error) {
      results.push({
        provider: 'Claude (OAuth)',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Removed console.log('❌ Claude: ERROR -', error);
    }

    // Summary
    // Removed console.log('\\n📊 FINAL RESULTS');
    // Removed console.log('═'.repeat(60));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    // Removed console.log(`✅ Successful providers: ${successful.length}/${results.length}`);
    // Removed console.log(`❌ Failed providers: ${failed.length}/${results.length}`);
    
    if (successful.length > 0) {
      // Removed console.log('\\n🎉 Working Providers:');
      for (const result of successful) {
        // Removed console.log(`  • ${result.provider}`);
        if (result.details?.models) {
          // Removed console.log(`    Models: ${result.details.models.length} available`);
        }
        if (result.details?.response) {
          // Removed console.log(`    Test response: "${result.details.response.trim()}"`);
        }
      }
    }
    
    if (failed.length > 0) {
      // Removed console.log('\\n❌ Failed Providers:');
      for (const result of failed) {
        // Removed console.log(`  • ${result.provider}: ${result.error}`);
      }
    }

    // Removed console.log('\\n🔧 LLM Provider System Status:');
    // Removed console.log(`  • GitHub Copilot: ${githubToken ? 'Token Available' : 'No Token'}`);
    // Removed console.log(`  • GitHub Models: ${githubToken ? 'Token Available' : 'No Token'}`);
    // Removed console.log(`  • Claude: OAuth Integration Ready`);
    // Removed console.log(`  • Package Structure: Modular (separate provider packages)`);
    // Removed console.log(`  • Main Provider: Unified interface for all providers`);
    
    if (successful.length === results.length) {
      // Removed console.log('\\n🎯 ALL SYSTEMS OPERATIONAL!');
    } else if (successful.length > 0) {
      // Removed console.log('\\n⚠️  PARTIAL SYSTEM OPERATIONAL');
    } else {
      // Removed console.log('\\n🚨 SYSTEM ISSUES - PLEASE CHECK CONFIGURATION');
    }
    
  } catch (error) {
    // Kept error handling, but removed console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

testAllProviders();