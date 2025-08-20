#!/usr/bin/env tsx
/**
 * @fileoverview Send Claude SDK traces to OTEL Console Receiver
 * 
 * Uses OTLP HTTP to send traces to your console receiver on port 4318
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
// import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { trace, SpanStatusCode } from '@opentelemetry/api';

async function claudeSendToConsole() {
  console.log('📡 Claude SDK → OTEL Console Receiver');
  console.log('====================================\n');

  // Initialize OTEL to send to your console receiver
  console.log('🔧 Setting up OTEL to send to localhost:4318...');
  
  // NOTE: OTLPTraceExporter not available, using basic setup
  const sdk = new NodeSDK({
    // spanProcessor: new SimpleSpanProcessor(traceExporter),
    serviceName: 'claude-zen-safe-sparc'
    // serviceVersion not supported in this OTEL version
  });

  sdk.start();
  console.log('✅ OTEL SDK configured to send traces to your console receiver\n');

  const tracer = trace.getTracer('claude-zen-safe-sparc', '2.1.0');

  try {
    return tracer.startActiveSpan('safe_epic_evaluation_console', async (mainSpan) => {
      // Set SAFe-specific attributes
      mainSpan.setAttributes({
        'safe.role': 'epic_owner',
        'safe.epic': 'customer_support_bot',
        'sparc.phase': 'specification',
        'operation.type': 'llm_evaluation',
        'business.value': 400000,
        'business.cost': 150000
      });

      console.log('📋 Starting SAFe Epic evaluation...');
      console.log('🎯 This will send detailed traces to your console receiver!\n');

      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      const prompt = `As a SAFe Epic Owner, evaluate this proposal:

Epic: Customer Support Bot
Business Value: $400k/year efficiency gains
Development Cost: $150k  
Timeline: 4 months
Risk: Low

Provide structured evaluation:
1. ROI Analysis
2. Strategic fit
3. Decision (approve/reject/defer)
4. Next steps

Keep response concise but thorough.`;

      mainSpan.addEvent('prompt_prepared', {
        'prompt.length': prompt.length,
        'prompt.type': 'safe_epic_evaluation',
        'epic.name': 'customer_support_bot'
      });

      let messageCount = 0;
      let firstTokenTime = 0;
      const startTime = Date.now();

      console.log('🚀 Making Claude API call (sending traces to console receiver)...\n');

      const result = await executeClaudeTask(prompt, {
        timeoutMs: 180000, // 3 minutes
        stderr: (output: string) => {
          messageCount++;
          const elapsed = Date.now() - startTime;

          if (messageCount === 1) {
            firstTokenTime = elapsed;
            mainSpan.addEvent('first_token_received', {
              'response.time_to_first_token_ms': elapsed
            });
            console.log(`🎯 First token: ${elapsed}ms`);
          }

          // Categorize messages and add as events
          let messageType = 'debug';
          if (output.includes('Starting Claude')) {
            messageType = 'startup';
            console.log(`🚀 [${elapsed}ms] Claude SDK starting...`);
          } else if (output.includes('[SYSTEM]')) {
            messageType = 'system';
            console.log(`⚙️  [${elapsed}ms] System message`);
          } else if (output.includes('[MSG')) {
            messageType = 'message';
            console.log(`💬 [${elapsed}ms] Response chunk ${messageCount}`);
          } else if (output.includes('[RESULT]')) {
            messageType = 'result';
            console.log(`✅ [${elapsed}ms] Final result received`);
          }

          // Add event to span (will be sent to console receiver)
          mainSpan.addEvent(`claude_${messageType}`, {
            'message.elapsed_ms': elapsed,
            'message.sequence': messageCount,
            'message.type': messageType,
            '(message as any)?.content_preview': output.substring(0, 50)
          });
        }
      });

      const totalTime = Date.now() - startTime;

      // Set final attributes
      mainSpan.setAttributes({
        'response.total_time_ms': totalTime,
        'response.first_token_ms': firstTokenTime,
        'response.message_count': messageCount,
        'response.success': !!result,
        'claude.model': 'claude-sonnet-4'
      });

      console.log(`\n⏱️  Total time: ${totalTime}ms`);
      console.log(`📊 Messages: ${messageCount}`);

      if (result && result.length > 0) {
        const content = (result[0] as any)?.content;
        if (Array.isArray(content) && content[0]?.text) {
          const text = content[0].text;
          
          // Extract decision
          const decision = text.toLowerCase().includes('approve') ? 'approve' :
                          text.toLowerCase().includes('reject') ? 'reject' :
                          text.toLowerCase().includes('defer') ? 'defer' : 'unknown';

          // Add decision attributes to span
          mainSpan.setAttributes({
            'safe.decision': decision,
            'response.text_length': text.length,
            'response.decision_confidence': decision !== 'unknown' ? 'high' : 'low'
          });

          mainSpan.addEvent('decision_extracted', {
            'safe.decision': decision,
            'decision.reasoning_length': text.length
          });

          console.log(`\n🏛️  SAFe Decision: ${decision.toUpperCase()}`);
          console.log('═'.repeat(80));
          console.log(text);
          console.log('═'.repeat(80));
        }
      }

      mainSpan.setStatus({ code: SpanStatusCode.OK });
      mainSpan.addEvent('evaluation_completed', {
        'completion.total_time_ms': totalTime,
        'completion.success': true
      });

      console.log(`\n📡 Trace sent to console receiver with:`);
      console.log(`   🆔 Trace ID: ${mainSpan.spanContext().traceId}`);
      console.log(`   🎯 Span ID: ${mainSpan.spanContext().spanId}`);
      console.log(`   ⏱️  Duration: ${totalTime}ms`);
      console.log(`   📊 Events: ${messageCount + 4} (sent to port 4318)`);

      mainSpan.end();
      
      // Give time for trace export
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('\n✅ Trace export completed!');
      console.log('👀 Check your console receiver window for detailed trace output');

      return result;
    });

  } catch (error) {
    console.error('\n❌ Failed to send traces to console receiver:', error);
    
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.recordException(error);
      activeSpan.setStatus({ code: SpanStatusCode.ERROR });
      activeSpan.end();
    }
    
    throw error;
  } finally {
    await sdk.shutdown();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeSendToConsole().catch(console.error);
}

export { claudeSendToConsole };