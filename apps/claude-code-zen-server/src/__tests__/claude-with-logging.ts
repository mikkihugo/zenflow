#!/usr/bin/env tsx
/**
 * @fileoverview Claude SDK with Enhanced Logging
 * 
 * Enable detailed logging to see exactly what's happening in Claude SDK calls
 */

async function claudeWithLogging() {
  console.log('📊 Claude SDK with Enhanced Logging');
  console.log('===================================\n');

  try {
    // Import and configure logging
    console.log('🔧 Setting up enhanced logging...');
    const { executeClaudeTask, getLogger } = await import('@claude-zen/foundation');
    
    // Get the Claude SDK logger and configure it for debug level
    const logger = getLogger('claude-code-sdk-integration');
    
    const prompt = `As a SAFe Epic Owner, quickly evaluate this proposal:

Epic: Customer Analytics Platform
Value: $750k/year, Cost: $250k, Timeline: 4 months, Risk: Medium

Provide:
1. ROI calculation
2. Risk assessment  
3. Decision (approve/reject/defer)

Keep response concise but thorough.`;

    console.log('🚀 Making Claude SDK call with full logging enabled...\n');
    
    let messageCount = 0;
    let firstToken = false;
    const startTime = Date.now();
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 180000,
      stderr: (output: string) => {
        messageCount++;
        const elapsed = Date.now() - startTime;
        
        if (!firstToken) {
          console.log(`🎯 First token received after ${elapsed}ms`);
          firstToken = true;
        }
        
        // Enhanced logging with details
        if (output.includes('[SYSTEM]')) {
          console.log(`📋 [${elapsed.toString().padStart(5)}ms] SYSTEM: ${output}`);
        } else if (output.includes('[MSG')) {
          console.log(`💬 [${elapsed.toString().padStart(5)}ms] MESSAGE: ${output}`);
        } else if (output.includes('[RESULT]')) {
          console.log(`✅ [${elapsed.toString().padStart(5)}ms] RESULT: Content received`);
        } else if (output.includes('Starting Claude')) {
          console.log(`🚀 [${elapsed.toString().padStart(5)}ms] INIT: ${output}`);
        } else {
          console.log(`📝 [${elapsed.toString().padStart(5)}ms] DEBUG: ${output}`);
        }
        
        // Show progress for long responses
        if (messageCount % 2 === 0) {
          process.stdout.write('.');
        }
      }
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`\n\n⏱️  Total execution time: ${totalTime}ms`);
    console.log(`📊 Stream messages received: ${messageCount}`);
    
    // Parse and display results
    if (result && result.length > 0) {
      console.log(`\n📋 Claude Response Analysis:`);
      console.log(`   Messages received: ${result.length}`);
      
      result.forEach((msg, index) => {
        console.log(`   Message ${index + 1}:`);
        console.log(`     Type: ${msg.type || 'unknown'}`);
        
        if (msg.message && msg.message.content) {
          const content = msg.message.content;
          
          if (Array.isArray(content) && content[0] && content[0].text) {
            const text = content[0].text;
            console.log(`     Content length: ${text.length} chars`);
            
            if (index === result.length - 1) { // Last message contains the analysis
              console.log(`\n📄 SAFe Epic Owner Decision:`);
              console.log('─'.repeat(60));
              console.log(text);
              console.log('─'.repeat(60));
            }
          }
        }
      });
      
      console.log('\n🎊 Analysis with enhanced logging completed!');
      
    } else {
      console.log('⚠️  No response content received');
    }
    
  } catch (error) {
    console.error('\n❌ Enhanced logging test failed:', error);
    
    // Show detailed error information
    if (error.stack) {
      console.log('\n🔍 Error Stack:');
      console.log(error.stack);
    }
    
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeWithLogging().catch(console.error);
}