#!/usr/bin/env tsx
/**
 * @fileoverview Claude Code with FULL OTEL Configuration  
 * 
 * Captures ALL events: prompts, responses, tool results, API requests, etc.
 * Uses multiple exporters for comprehensive observability
 */

async function claudeFullOTEL() {
  console.log('🔥 Claude Code with FULL OTEL Configuration');
  console.log('===========================================\n');

  // COMPREHENSIVE OTEL CONFIGURATION for maximum visibility
  process.env.CLAUDE_CODE_ENABLE_TELEMETRY = '1';
  
  // Export BOTH logs AND metrics  
  process.env.OTEL_LOGS_EXPORTER = 'otlp,console';  // Send to both console receiver AND console
  process.env.OTEL_METRICS_EXPORTER = 'otlp,console';  // Metrics too
  
  // Protocol and endpoints
  process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/json';
  process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://localhost:4318/v1/logs';
  process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://localhost:4318/v1/metrics';
  
  // FAST export intervals for real-time monitoring
  process.env.OTEL_LOGS_EXPORT_INTERVAL = '1000';  // 1 second
  process.env.OTEL_METRIC_EXPORT_INTERVAL = '2000';  // 2 seconds
  
  // *** CRITICAL: Enable full content logging ***
  process.env.OTEL_LOG_USER_PROMPTS = '1';  // Include full prompt content
  
  // Include ALL session and version info
  process.env.OTEL_METRICS_INCLUDE_SESSION_ID = 'true';
  process.env.OTEL_METRICS_INCLUDE_VERSION = 'true';
  process.env.OTEL_METRICS_INCLUDE_ACCOUNT_UUID = 'true';
  
  console.log('🔧 FULL OTEL Environment:');
  console.log(`   CLAUDE_CODE_ENABLE_TELEMETRY: ${process.env.CLAUDE_CODE_ENABLE_TELEMETRY}`);
  console.log(`   OTEL_LOGS_EXPORTER: ${process.env.OTEL_LOGS_EXPORTER}`);
  console.log(`   OTEL_METRICS_EXPORTER: ${process.env.OTEL_METRICS_EXPORTER}`);
  console.log(`   OTEL_EXPORTER_OTLP_PROTOCOL: ${process.env.OTEL_EXPORTER_OTLP_PROTOCOL}`);
  console.log(`   OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: ${process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT}`);
  console.log(`   OTEL_LOGS_EXPORT_INTERVAL: ${process.env.OTEL_LOGS_EXPORT_INTERVAL}`);
  console.log(`   OTEL_LOG_USER_PROMPTS: ${process.env.OTEL_LOG_USER_PROMPTS} ⭐ FULL PROMPTS ENABLED`);
  console.log(`   OTEL_METRICS_INCLUDE_SESSION_ID: ${process.env.OTEL_METRICS_INCLUDE_SESSION_ID}`);
  console.log(`   OTEL_METRICS_INCLUDE_VERSION: ${process.env.OTEL_METRICS_INCLUDE_VERSION}\\n`);

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `As a SAFe Epic Owner, provide detailed evaluation:

Epic: AI-Powered Customer Support Bot
Business Value: $400k/year efficiency gains through 24/7 support
Development Cost: $150k (4-month timeline)  
Risk Level: Low (proven technology stack)
Strategic Alignment: High (customer experience focus)
Resource Requirements: 2 ML engineers, 1 backend dev, 1 DevOps
Dependencies: Customer data platform integration

Provide comprehensive analysis with:
1. Detailed ROI calculation with assumptions
2. Strategic fit assessment with corporate objectives  
3. Risk analysis and mitigation strategies
4. Resource allocation recommendations
5. Clear decision: APPROVE/REJECT/DEFER with detailed reasoning

Make your analysis thorough and actionable for executive review.`;

    console.log('🚀 Making Claude call with FULL OTEL telemetry...');
    console.log('📡 Will capture: prompts, responses, API requests, tool results, costs, tokens');
    console.log('👀 Check console receiver for complete telemetry data\\n');
    
    console.log('📋 Full SAFe Epic Evaluation Prompt:');
    console.log('═'.repeat(80));
    console.log(prompt);
    console.log('═'.repeat(80));
    console.log();
    
    let messageCount = 0;
    const startTime = Date.now();
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 180000, // 3 minutes for detailed response
      stderr: (output: string) => {
        messageCount++;
        const elapsed = Date.now() - startTime;
        
        // Detailed categorization
        if (output.includes('Starting Claude')) {
          console.log(`🚀 [INIT] [${elapsed}ms] Claude SDK initializing...`);
        } else if (output.includes('[SYSTEM]')) {
          console.log(`⚙️  [SYS]  [${elapsed}ms] System processing (${messageCount} msgs)`);  
        } else if (output.includes('[MSG')) {
          console.log(`💬 [MSG]  [${elapsed}ms] Response streaming chunk #${messageCount}`);
        } else if (output.includes('[RESULT]')) {
          console.log(`✅ [RES]  [${elapsed}ms] Final response received`);
        } else if (output.includes('claude_code.user_prompt')) {
          console.log(`📝 [OTEL] [${elapsed}ms] User prompt event logged`);
        } else if (output.includes('claude_code.api_request')) {
          console.log(`📊 [OTEL] [${elapsed}ms] API request event logged`);
        } else if (output.includes('claude_code.tool_result')) {
          console.log(`🔧 [OTEL] [${elapsed}ms] Tool result event logged`);
        } else {
          console.log(`📋 [DBG]  [${elapsed}ms] Debug: ${output.substring(0, 60)}`);
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
        
        console.log(`\\n📄 SAFe Epic Owner Detailed Analysis:`);
        console.log('═'.repeat(100));
        console.log(text);
        console.log('═'.repeat(100));
        
        // Extract decision
        const decision = text.toLowerCase().includes('approve') ? 'APPROVE' :
                        text.toLowerCase().includes('reject') ? 'REJECT' :
                        text.toLowerCase().includes('defer') ? 'DEFER' : 'UNCLEAR';
        
        console.log(`\\n🏛️  SAFe Decision: ${decision}`);
        console.log(`📊 Response length: ${text.length} characters`);
        console.log(`💰 Estimated API cost: ~$${(text.length * 0.00001).toFixed(4)}`);
      }
    }
    
    console.log('\\n📡 FULL OTEL telemetry sent to console receiver!');
    console.log('🎯 Expected events in console receiver:');
    console.log('   • claude_code.user_prompt - FULL prompt content');
    console.log('   • claude_code.api_request - Duration, tokens, cost');  
    console.log('   • claude_code.tool_result - Tool execution details');
    console.log('   • claude_code.session.count - Session metrics');
    console.log('   • claude_code.token.usage - Token breakdown');
    console.log('   • claude_code.cost.usage - Cost tracking');
    
    // Extended wait for full OTEL export
    console.log('\\n⏳ Waiting for complete OTEL export (both logs & metrics)...');
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    console.log('\\n🎉 FULL OTEL observability test completed!');
    console.log('📈 Check console receiver for comprehensive SAFe-SPARC telemetry');
    
  } catch (error) {
    console.error('\\n❌ Full OTEL test failed:', error);
    
    if (error.message.includes('timeout')) {
      console.log('⚠️  API call timed out - try increasing timeout for detailed responses');
    }
    
    if (error.message.includes('JSON')) {
      console.log('💡 OTEL parsing issue - check receiver configuration');
    }
    
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeFullOTEL().catch(console.error);
}

export { claudeFullOTEL };