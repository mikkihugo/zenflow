#!/usr/bin/env tsx
/**
 * @fileoverview Fast Claude SDK Test
 * 
 * Diagnose the 30s delay issue and test with shorter prompts
 */

async function fastClaudeTest() {
  console.log('⚡ Fast Claude SDK Test');
  console.log('======================\n');

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    // Test 1: Very short prompt
    console.log('🧪 Test 1: Very short prompt');
    console.log('-----------------------------');
    
    let startTime = Date.now();
    let messageCount = 0;
    let firstTokenTime = 0;
    
    const shortResult = await executeClaudeTask('What is 2+2? Answer briefly.', {
      timeoutMs: 30000,
      stderr: (output: string) => {
        messageCount++;
        const elapsed = Date.now() - startTime;
        
        if (messageCount === 1) {
          firstTokenTime = elapsed;
          console.log(`🎯 First token: ${elapsed}ms`);
        }
        
        if (output.includes('Starting Claude')) {
          console.log(`🚀 [${elapsed}ms] INIT: ${output}`);
        } else if (output.includes('[RESULT]')) {
          console.log(`✅ [${elapsed}ms] RESULT: Response received`);
        } else if (messageCount % 3 === 0) {
          console.log(`📝 [${elapsed}ms] MSG-${messageCount}: ...`);
        }
      }
    });
    
    const shortTime = Date.now() - startTime;
    console.log(`⏱️  Short prompt total: ${shortTime}ms`);
    console.log(`📊 Messages: ${messageCount}`);
    console.log(`🎯 Time to first token: ${firstTokenTime}ms\n`);
    
    // Test 2: Medium prompt (SAFe style but shorter)
    console.log('🧪 Test 2: Medium SAFe prompt');
    console.log('------------------------------');
    
    startTime = Date.now();
    messageCount = 0;
    firstTokenTime = 0;
    
    const mediumResult = await executeClaudeTask(`Epic: Mobile Enhancement
Value: $200k, Cost: $100k, Timeline: 3 months

As SAFe Epic Owner, approve/reject/defer?`, {
      timeoutMs: 60000,
      stderr: (output: string) => {
        messageCount++;
        const elapsed = Date.now() - startTime;
        
        if (messageCount === 1) {
          firstTokenTime = elapsed;
          console.log(`🎯 First token: ${elapsed}ms`);
        }
        
        if (output.includes('Starting Claude')) {
          console.log(`🚀 [${elapsed}ms] INIT: ${output}`);
        } else if (output.includes('[RESULT]')) {
          console.log(`✅ [${elapsed}ms] RESULT: Response received`);
        } else if (messageCount <= 5 || messageCount % 5 === 0) {
          console.log(`📝 [${elapsed}ms] MSG-${messageCount}: ${output.substring(0, 60)}...`);
        }
      }
    });
    
    const mediumTime = Date.now() - startTime;
    console.log(`⏱️  Medium prompt total: ${mediumTime}ms`);
    console.log(`📊 Messages: ${messageCount}`);
    console.log(`🎯 Time to first token: ${firstTokenTime}ms\n`);
    
    // Analysis
    console.log('📈 PERFORMANCE ANALYSIS:');
    console.log('========================');
    console.log(`Short prompt (${shortTime}ms):`);
    console.log(`  - Time to first token: ${firstTokenTime}ms`);
    console.log(`  - Response generation: ${shortTime - firstTokenTime}ms`);
    
    if (shortTime > 10000) {
      console.log('⚠️  ISSUE: Even short prompts are taking >10 seconds');
      console.log('   This suggests startup/initialization overhead');
    }
    
    if (firstTokenTime > 5000) {
      console.log('⚠️  ISSUE: High time-to-first-token (>5s)');
      console.log('   This could be:');
      console.log('   - Model loading/initialization');
      console.log('   - Network latency');
      console.log('   - Claude SDK startup overhead');
    }
    
    // Show responses
    if (shortResult && shortResult.length > 0) {
      const content = (shortResult[0] as any)?.content;
      if (Array.isArray(content) && content[0]?.text) {
        console.log(`\n📝 Short response: "${content[0].text}"`);
      }
    }
    
    console.log('\n🎊 Fast test completed!');
    
  } catch (error) {
    console.error('❌ Fast test failed:', error);
    
    if (error.message.includes('timeout')) {
      console.log('⚠️  TIMEOUT: Claude API is taking longer than expected');
      console.log('   Try: export ANTHROPIC_API_KEY=your_key');
    }
    
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  fastClaudeTest().catch(console.error);
}

export { fastClaudeTest };