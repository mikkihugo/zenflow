#!/usr/bin/env tsx
/**
 * @fileoverview Claude SDK with Full Debug Logging
 * 
 * Enable all possible logging to see complete Claude SDK execution flow
 */

async function claudeWithFullLogging() {
  console.log('🔬 Claude SDK with Full Debug Logging');
  console.log('====================================\n');

  // Set environment variables for maximum logging
  process.env.ANTHROPIC_LOG = 'debug';
  process.env.CLAUDE_CODE_ENABLE_TELEMETRY = '1';
  process.env.OTEL_LOGS_EXPORTER = 'console';
  process.env.OTEL_LOG_USER_PROMPTS = '1';

  console.log('🔧 Environment variables set:');
  console.log(`   ANTHROPIC_LOG: ${process.env.ANTHROPIC_LOG}`);
  console.log(`   CLAUDE_CODE_ENABLE_TELEMETRY: ${process.env.CLAUDE_CODE_ENABLE_TELEMETRY}`);
  console.log(`   OTEL_LOGS_EXPORTER: ${process.env.OTEL_LOGS_EXPORTER}`);
  console.log(`   OTEL_LOG_USER_PROMPTS: ${process.env.OTEL_LOG_USER_PROMPTS}\n`);

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `As a SAFe Epic Owner, evaluate this proposal:

Epic: Mobile App Enhancement
Business Value: $300k/year increase in user engagement  
Development Cost: $150k
Timeline: 3 months
Risk: Low

Provide:
1. Quick ROI analysis
2. Strategic fit assessment
3. Decision: approve/reject/defer

Keep response brief but decisive.`;

    console.log('🚀 Starting Claude SDK call with full debug logging...\n');
    console.log('📋 Prompt sent to Claude:');
    console.log('─'.repeat(50));
    console.log(prompt);
    console.log('─'.repeat(50));
    
    let totalMessages = 0;
    const startTime = Date.now();
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 120000,
      stderr: (output: string) => {
        totalMessages++;
        const elapsed = Date.now() - startTime;
        
        // Enhanced logging with categorization
        if (output.includes('Starting Claude')) {
          console.log(`🚀 [${elapsed}ms] STARTUP: ${output}`);
        } else if (output.includes('[SYSTEM]')) {
          console.log(`⚙️  [${elapsed}ms] SYSTEM: ${output}`);
        } else if (output.includes('[MSG')) {
          console.log(`💬 [${elapsed}ms] MESSAGE: ${output}`);
        } else if (output.includes('[RESULT]')) {
          console.log(`✅ [${elapsed}ms] RESULT: ${output.substring(0, 100)}...`);
        } else {
          console.log(`📝 [${elapsed}ms] DEBUG: ${output}`);
        }
      }
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️  Total execution: ${totalTime}ms`);
    console.log(`📊 Debug messages: ${totalMessages}`);
    
    // Extract and display the complete analysis
    if (result && result.length > 0) {
      console.log(`\n📄 Complete SAFe Epic Owner Decision:`);
      console.log('═'.repeat(80));
      
      result.forEach((msg, index) => {
        if (msg.message && msg.message.content) {
          const content = msg.message.content;
          
          if (Array.isArray(content)) {
            content.forEach((block, blockIndex) => {
              if (block.type === 'text' && block.text) {
                console.log(`\n[Message ${index + 1}, Block ${blockIndex + 1}]:`);
                console.log(block.text);
              }
            });
          }
        }
      });
      
      console.log('═'.repeat(80));
      
      // Calculate response statistics
      const totalChars = result.reduce((sum, msg) => {
        if (msg.message && msg.message.content) {
          return sum + JSON.stringify(msg.message.content).length;
        }
        return sum;
      }, 0);
      
      console.log(`\n📊 Response Statistics:`);
      console.log(`   Messages: ${result.length}`);
      console.log(`   Total characters: ${totalChars}`);
      console.log(`   Average response time: ${(totalTime / result.length).toFixed(0)}ms per message`);
      
    } else {
      console.log('⚠️  No response content received');
    }
    
    console.log('\n🎊 Full debug logging test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Debug logging test failed:', error);
    
    if (error.message.includes('timeout')) {
      console.log('⚠️  API call timed out');
    }
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeWithFullLogging().catch(console.error);
}