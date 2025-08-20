#!/usr/bin/env tsx
/**
 * @fileoverview Claude Code Built-in OpenTelemetry Test
 * 
 * Use Claude Code CLI's native OTEL support instead of our wrapper
 */

async function claudeBuiltinOTEL() {
  console.log('🎯 Claude Code Built-in OpenTelemetry Test');
  console.log('==========================================\n');

  // Enable Claude Code's built-in OTEL
  process.env.CLAUDE_CODE_ENABLE_TELEMETRY = '1';
  process.env.OTEL_LOGS_EXPORTER = 'console';
  process.env.OTEL_LOG_USER_PROMPTS = '1';
  process.env.ANTHROPIC_LOG = 'info';  // Not debug to avoid JSON parsing issues
  
  console.log('🔧 Claude Code OTEL Environment:');
  console.log(`   CLAUDE_CODE_ENABLE_TELEMETRY: ${process.env.CLAUDE_CODE_ENABLE_TELEMETRY}`);
  console.log(`   OTEL_LOGS_EXPORTER: ${process.env.OTEL_LOGS_EXPORTER}`);
  console.log(`   OTEL_LOG_USER_PROMPTS: ${process.env.OTEL_LOG_USER_PROMPTS}`);
  console.log(`   ANTHROPIC_LOG: ${process.env.ANTHROPIC_LOG}\n`);

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `As a SAFe Epic Owner, quickly evaluate:

Epic: Customer Support Bot
Value: $400k/year, Cost: $150k, Timeline: 4 months, Risk: Low

Decision: approve/reject/defer with brief reason.`;

    console.log('🚀 Calling Claude with built-in OTEL enabled...\n');
    console.log('📋 Prompt:');
    console.log('─'.repeat(50));
    console.log(prompt);
    console.log('─'.repeat(50));
    console.log();
    
    let messageCount = 0;
    const startTime = Date.now();
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 120000,
      stderr: (output: string) => {
        messageCount++;
        const elapsed = Date.now() - startTime;
        
        // Show Claude Code's built-in OTEL output
        if (output.includes('OTEL') || output.includes('otel') || output.includes('telemetry')) {
          console.log(`🔍 [OTEL] [${elapsed}ms] ${output}`);
        } else if (output.includes('Starting Claude')) {
          console.log(`🚀 [INIT] [${elapsed}ms] ${output}`);
        } else if (output.includes('[SYSTEM]')) {
          console.log(`⚙️  [SYS]  [${elapsed}ms] ${output}`);  
        } else if (output.includes('[MSG')) {
          console.log(`💬 [MSG]  [${elapsed}ms] ${output}`);
        } else if (output.includes('[RESULT]')) {
          console.log(`✅ [RES]  [${elapsed}ms] Response received`);
        } else {
          console.log(`📝 [DBG]  [${elapsed}ms] ${output}`);
        }
      }
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`\n⏱️  Total execution: ${totalTime}ms`);
    console.log(`📊 Stream messages: ${messageCount}`);
    
    if (result && result.length > 0) {
      const content = (result[0] as any)?.content;
      if (Array.isArray(content) && content[0]?.text) {
        const text = content[0].text;
        
        console.log(`\n📄 SAFe Epic Owner Decision:`);
        console.log('═'.repeat(60));
        console.log(text);
        console.log('═'.repeat(60));
        
        // Extract decision
        const decision = text.toLowerCase().includes('approve') ? 'APPROVE' :
                        text.toLowerCase().includes('reject') ? 'REJECT' :
                        text.toLowerCase().includes('defer') ? 'DEFER' : 'UNCLEAR';
        
        console.log(`\n🏛️  Decision: ${decision}`);
        console.log(`📊 Response length: ${text.length} characters`);
      }
    }
    
    console.log('\n🎊 Claude Code built-in OTEL test completed!');
    console.log('\nℹ️  Claude Code CLI should have exported OTEL data automatically');
    console.log('   Check console output above for any OTEL traces/metrics');
    
  } catch (error) {
    console.error('\n❌ Built-in OTEL test failed:', error);
    
    if (error.message.includes('timeout')) {
      console.log('⚠️  API call timed out');
    }
    
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeBuiltinOTEL().catch(console.error);
}

export { claudeBuiltinOTEL };