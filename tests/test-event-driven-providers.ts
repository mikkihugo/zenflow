#!/usr/bin/env tsx

/**
 * Event-Driven LLM Providers Test
 * 
 * Tests all providers using the EventBus pattern:
 * 1. Gemini (already event-driven)
 * 2. Claude (with context7 MCP integration)  
 * 3. GitHub Copilot (with auto token renewal)
 * 4. GitHub Models
 */

import { EventBus } from '@claude-zen/foundation';
import { generateUUID as uuid } from '@claude-zen/foundation/src/utilities/ids/index.js';

// Initialize EventBus
const bus = EventBus.getInstance();

interface TestResult {
  provider: string;
  success: boolean;
  error?: string;
  response?: string;
  timeMs?: number;
}

async function testEventDrivenProviders() {
  console.log('🚀 Testing Event-Driven LLM Providers');
  console.log('═'.repeat(60));

  const results: TestResult[] = [];

  // Register all provider handlers
  try {
    console.log('📡 Registering EventBus handlers...');
    
    // Register Gemini handlers (already implemented)
    const { registerGeminiHandlers } = await import('./packages/integrations/gemini-provider/src/index.js');
    await registerGeminiHandlers(bus);
    console.log('✅ Gemini handlers registered');

    // Register Claude handlers with context7 MCP
    const { registerClaudeHandlers } = await import('./packages/integrations/claude-provider/src/claude-events.js');
    await registerClaudeHandlers(bus);
    console.log('✅ Claude handlers registered');

    // Register Copilot handlers with auto-renewal
    const { registerCopilotHandlers } = await import('./packages/integrations/copilot-provider/src/copilot-events.js');
    await registerCopilotHandlers(bus);
    console.log('✅ Copilot handlers registered');

    // Register GitHub Models handlers
    const { registerGitHubModelsHandlers } = await import('./packages/integrations/github-models-provider/src/github-models-events.js');
    await registerGitHubModelsHandlers(bus);
    console.log('✅ GitHub Models handlers registered');

  } catch (error) {
    console.error('❌ Failed to register handlers:', error);
    process.exit(1);
  }

  // Test 1: Gemini Provider
  console.log('\n1️⃣ Testing Gemini Provider (Event-Driven)...');
  await testProvider(
    'Gemini', 
    'llm:gemini:chat:request', 
    'llm:gemini:chat:response',
    { 
      prompt: 'Say "Hello from Gemini!" and nothing else.',
      model: 'gemini-1.5-flash'
    },
    results
  );

  // Test 2: Claude Provider with Context7
  console.log('\n2️⃣ Testing Claude Provider with Context7 MCP...');
  await testProvider(
    'Claude + Context7', 
    'llm:claude:chat:request', 
    'llm:claude:chat:response',
    { 
      messages: [{ role: 'user', content: 'Say "Hello from Claude with Context7!" and nothing else.' }],
      model: 'claude-3-sonnet-20240229'
    },
    results
  );

  // Test 3: GitHub Copilot with Auto-Renewal
  console.log('\n3️⃣ Testing GitHub Copilot with Auto Token Renewal...');
  await testProvider(
    'GitHub Copilot', 
    'llm:copilot:chat:request', 
    'llm:copilot:chat:response',
    { 
      messages: [{ role: 'user', content: 'Say "Hello from Copilot!" and nothing else.' }]
    },
    results
  );

  // Test 4: GitHub Models
  console.log('\n4️⃣ Testing GitHub Models Provider...');
  await testProvider(
    'GitHub Models', 
    'llm:github-models:chat:request', 
    'llm:github-models:chat:response',
    { 
      messages: [{ role: 'user', content: 'Say "Hello from GitHub Models!" and nothing else.' }],
      model: 'gpt-4o-mini'
    },
    results
  );

  // Test Context7 tools
  console.log('\n🔧 Testing Context7 MCP Tools...');
  await testContext7Tools(results);

  // Display results
  console.log('\n📊 EVENT-DRIVEN PROVIDER RESULTS');
  console.log('═'.repeat(60));
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🎉 Working Providers:');
    for (const result of successful) {
      console.log(`  • ${result.provider} (${result.timeMs}ms)`);
      if (result.response) {
        console.log(`    Response: "${result.response.trim()}"`);
      }
    }
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Providers:');
    for (const result of failed) {
      console.log(`  • ${result.provider}: ${result.error}`);
    }
  }

  console.log('\n🔄 Event-Driven Architecture Benefits:');
  console.log('  • Automatic token renewal (Copilot)');
  console.log('  • Context7 MCP integration (Claude)');
  console.log('  • Event-based error handling');
  console.log('  • Streaming support');
  console.log('  • Provider isolation');

  if (successful.length === results.length) {
    console.log('\n🎯 ALL EVENT-DRIVEN PROVIDERS OPERATIONAL!');
  }
}

async function testProvider(
  providerName: string,
  requestEvent: string,
  responseEvent: string,
  payload: any,
  results: TestResult[]
): Promise<void> {
  return new Promise((resolve) => {
    const correlationId = uuid();
    const startTime = Date.now();
    
    // Set up response listener
    const timeout = setTimeout(() => {
      results.push({
        provider: providerName,
        success: false,
        error: 'Timeout after 30 seconds'
      });
      resolve();
    }, 30000);

    bus.once(responseEvent, (response: any) => {
      clearTimeout(timeout);
      
      if (response.correlationId === correlationId) {
        const timeMs = Date.now() - startTime;
        
        if (response.error) {
          results.push({
            provider: providerName,
            success: false,
            error: response.error,
            timeMs
          });
        } else {
          results.push({
            provider: providerName,
            success: true,
            response: response.text,
            timeMs
          });
        }
        resolve();
      }
    });

    // Send request
    bus.emit(requestEvent, {
      correlationId,
      ...payload
    });
  });
}

async function testContext7Tools(results: TestResult[]): Promise<void> {
  return new Promise((resolve) => {
    const correlationId = uuid();
    
    const timeout = setTimeout(() => {
      results.push({
        provider: 'Context7 Tools',
        success: false,
        error: 'Timeout - no MCP server available'
      });
      resolve();
    }, 10000);

    bus.once('llm:claude:context7:resources:response', (response: any) => {
      clearTimeout(timeout);
      
      if (response.correlationId === correlationId) {
        if (response.error) {
          results.push({
            provider: 'Context7 Tools',
            success: false,
            error: response.error
          });
        } else {
          results.push({
            provider: 'Context7 Tools',
            success: true,
            response: `${response.resources?.length || 0} resources available`
          });
        }
        resolve();
      }
    });

    // Request context7 resources
    bus.emit('llm:claude:context7:resources:request', {
      correlationId
    });
  });
}

// Note: UUID generation should always go through foundation utilities
// to respect import boundaries. No runtime package installation here.

testEventDrivenProviders().catch(console.error);