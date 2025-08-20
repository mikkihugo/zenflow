#!/usr/bin/env tsx
/**
 * @fileoverview Claude Code with Console OTEL - See OTEL directly in this console
 */

async function claudeConsoleOTEL() {
  console.log('📺 Claude Code with Console OTEL Output');
  console.log('======================================\n');

  // Set OTEL to output directly to THIS console (not the receiver)
  process.env.CLAUDE_CODE_ENABLE_TELEMETRY = '1';
  process.env.OTEL_LOGS_EXPORTER = 'console';  // Output here, not to receiver
  process.env.OTEL_METRICS_EXPORTER = 'console';  // Output here too
  process.env.OTEL_LOGS_EXPORT_INTERVAL = '1000';  // Fast export
  process.env.OTEL_METRIC_EXPORT_INTERVAL = '2000';
  process.env.OTEL_LOG_USER_PROMPTS = '1';  // Include prompts
  
  console.log('🔧 Console OTEL Environment:');
  console.log(`   CLAUDE_CODE_ENABLE_TELEMETRY: ${process.env.CLAUDE_CODE_ENABLE_TELEMETRY}`);
  console.log(`   OTEL_LOGS_EXPORTER: ${process.env.OTEL_LOGS_EXPORTER} ⭐ DIRECT TO CONSOLE`);
  console.log(`   OTEL_METRICS_EXPORTER: ${process.env.OTEL_METRICS_EXPORTER} ⭐ DIRECT TO CONSOLE`);
  console.log(`   OTEL_LOG_USER_PROMPTS: ${process.env.OTEL_LOG_USER_PROMPTS}\\n`);

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `As a SAFe Epic Owner, quickly evaluate:

Epic: Customer Support Bot  
Value: $400k/year, Cost: $150k, Risk: Low

Decision: approve/reject/defer with brief reason.`;

    console.log('🚀 Making Claude call with CONSOLE OTEL...');
    console.log('📺 OTEL events should appear directly below in THIS console\\n');
    
    console.log('📋 Prompt:');
    console.log('─'.repeat(40));
    console.log(prompt);
    console.log('─'.repeat(40));
    console.log();
    
    let messageCount = 0;
    const startTime = Date.now();
    
    console.log('🎬 Starting Claude execution - watch for OTEL events below...');
    console.log('═'.repeat(80));
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 120000,
      stderr: (output: string) => {
        messageCount++;
        const elapsed = Date.now() - startTime;
        
        console.log(`📝 [${elapsed.toString().padStart(5)}ms] ${output}`);
      }
    });
    
    console.log('═'.repeat(80));
    
    const totalTime = Date.now() - startTime;
    console.log(`\\n⏱️  Execution completed: ${totalTime}ms`);
    console.log(`📊 Messages: ${messageCount}`);
    
    if (result && result.length > 0) {
      const content = result[0]?.message?.content;
      if (Array.isArray(content) && content[0]?.text) {
        const text = content[0].text;
        
        console.log(`\\n📄 SAFe Decision:`);
        console.log('═'.repeat(60));
        console.log(text);
        console.log('═'.repeat(60));
      }
    }
    
    console.log('\\n⏳ Waiting for final OTEL exports...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('\\n✅ Console OTEL test completed!');
    console.log('💡 If you see OTEL events above, Claude Code telemetry is working');
    console.log('💡 If no OTEL events, there may be a configuration issue');
    
  } catch (error) {
    console.error('\\n❌ Console OTEL test failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeConsoleOTEL().catch(console.error);
}

export { claudeConsoleOTEL };