#!/usr/bin/env tsx
/**
 * @fileoverview Claude Code with Proper OTEL Configuration
 * 
 * Uses correct Claude Code OTEL environment variables to send logs/events 
 * to console receiver on port 4318
 */

async function claudeProperOTEL() {
  console.log('🎯 Claude Code with Proper OTEL Configuration');
  console.log('==============================================\n');

  // Configure Claude Code's built-in OTEL properly for HTTP/JSON to port 4318
  process.env.CLAUDE_CODE_ENABLE_TELEMETRY = '1';
  process.env.OTEL_LOGS_EXPORTER = 'otlp';
  process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/json';
  process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://localhost:4318/v1/logs';
  process.env.OTEL_LOGS_EXPORT_INTERVAL = '2000';  // 2 seconds for faster export
  process.env.OTEL_LOG_USER_PROMPTS = '1';  // Include prompt content
  
  console.log('🔧 Claude Code OTEL Environment:');
  console.log(`   CLAUDE_CODE_ENABLE_TELEMETRY: ${process.env.CLAUDE_CODE_ENABLE_TELEMETRY}`);
  console.log(`   OTEL_LOGS_EXPORTER: ${process.env.OTEL_LOGS_EXPORTER}`);
  console.log(`   OTEL_EXPORTER_OTLP_PROTOCOL: ${process.env.OTEL_EXPORTER_OTLP_PROTOCOL}`);
  console.log(`   OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: ${process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`);
  console.log(`   OTEL_LOGS_EXPORT_INTERVAL: ${process.env.OTEL_LOGS_EXPORT_INTERVAL}`);
  console.log(`   OTEL_LOG_USER_PROMPTS: ${process.env.OTEL_LOG_USER_PROMPTS}\\n`);

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `As a SAFe Epic Owner, evaluate this quickly:

Epic: Customer Support Bot
Value: $400k/year, Cost: $150k, Timeline: 4 months, Risk: Low

Decision: approve/reject/defer with brief reason.`;

    console.log('🚀 Calling Claude with proper OTEL configuration...');
    console.log('📡 Should send logs/events to console receiver on port 4318\\n');
    
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
        
        // Show output but let Claude Code OTEL handle the telemetry
        if (output.includes('Starting Claude')) {
          console.log(`🚀 [INIT] [${elapsed}ms] ${output}`);
        } else if (output.includes('[SYSTEM]')) {
          console.log(`⚙️  [SYS]  [${elapsed}ms] System message`);  
        } else if (output.includes('[MSG')) {
          console.log(`💬 [MSG]  [${elapsed}ms] Response chunk ${messageCount}`);
        } else if (output.includes('[RESULT]')) {
          console.log(`✅ [RES]  [${elapsed}ms] Response received`);
        } else {
          console.log(`📝 [DBG]  [${elapsed}ms] Debug message`);
        }
      }
    });
    
    const totalTime = Date.now() - startTime;
    console.log(`\\n⏱️  Total execution: ${totalTime}ms`);
    console.log(`📊 Stream messages: ${messageCount}`);
    
    if (result && result.length > 0) {
      const content = result[0]?.message?.content;
      if (Array.isArray(content) && content[0]?.text) {
        const text = content[0].text;
        
        console.log(`\\n📄 SAFe Epic Owner Decision:`);
        console.log('═'.repeat(60));
        console.log(text);
        console.log('═'.repeat(60));
        
        // Extract decision
        const decision = text.toLowerCase().includes('approve') ? 'APPROVE' :
                        text.toLowerCase().includes('reject') ? 'REJECT' :
                        text.toLowerCase().includes('defer') ? 'DEFER' : 'UNCLEAR';
        
        console.log(`\\n🏛️  Decision: ${decision}`);
        console.log(`📊 Response length: ${text.length} characters`);
      }
    }
    
    console.log('\\n📡 Claude Code should have sent OTEL logs/events to console receiver!');
    console.log('👀 Check your console receiver window for:');
    console.log('   • claude_code.user_prompt events');
    console.log('   • claude_code.api_request events');  
    console.log('   • claude_code.tool_result events');
    console.log('   • Timing and cost information');
    
    // Give time for OTEL export
    console.log('\\n⏳ Waiting for OTEL export to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('✅ Claude Code proper OTEL test completed!');
    
  } catch (error) {
    console.error('\\n❌ Proper OTEL test failed:', error);
    
    if (error.message.includes('timeout')) {
      console.log('⚠️  API call timed out');
    }
    
    if (error.message.includes('JSON')) {
      console.log('💡 Try adjusting OTEL_EXPORTER_OTLP_PROTOCOL or endpoint');
    }
    
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeProperOTEL().catch(console.error);
}

export { claudeProperOTEL };