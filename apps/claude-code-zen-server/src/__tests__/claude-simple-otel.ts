#!/usr/bin/env tsx
/**
 * @fileoverview Simple Claude SDK with OTEL using existing packages
 * 
 * Uses only existing OTEL packages to send traces to console receiver
 */

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

async function claudeSimpleOTEL() {
  console.log('📡 Simple Claude SDK + OTEL → Console Receiver');
  console.log('===============================================\n');

  // Initialize OTEL to send to your console receiver on port 4318
  const traceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const sdk = new NodeSDK({
    spanProcessor: new SimpleSpanProcessor(traceExporter),
    serviceName: 'claude-zen-safe-sparc',
    serviceVersion: '2.1.0'
  });

  try {
    sdk.start();
    console.log('✅ OTEL SDK started, sending traces to localhost:4318\n');

    const tracer = trace.getTracer('claude-zen-safe-sparc', '2.1.0');

    return tracer.startActiveSpan('safe_epic_evaluation', async (mainSpan) => {
      // Set SAFe-specific attributes
      mainSpan.setAttributes({
        'safe.role': 'epic_owner',
        'safe.epic': 'customer_support_bot',
        'sparc.phase': 'specification',
        'operation.type': 'llm_evaluation'
      });

      console.log('🚀 Starting Claude SDK call (will send trace to console receiver)...');

      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      const prompt = `As a SAFe Epic Owner, evaluate this quickly:

Epic: Customer Support Bot
Value: $400k/year, Cost: $150k, Timeline: 4 months, Risk: Low

Decision: approve/reject/defer with brief reason.`;

      let messageCount = 0;
      const startTime = Date.now();

      mainSpan.addEvent('prompt_prepared', {
        'prompt.length': prompt.length,
        'prompt.type': 'safe_epic_evaluation'
      });

      console.log('\n📋 Making Claude call (no OTEL env vars to avoid JSON issues)...\n');

      const result = await executeClaudeTask(prompt, {
        timeoutMs: 120000,
        stderr: (output: string) => {
          messageCount++;
          const elapsed = Date.now() - startTime;

          // Categorize and log
          let messageType = 'debug';
          if (output.includes('Starting Claude')) {
            messageType = 'startup';
            console.log(`🚀 [${elapsed}ms] Claude starting...`);
          } else if (output.includes('[SYSTEM]')) {
            messageType = 'system';
            console.log(`⚙️  [${elapsed}ms] System message`);
          } else if (output.includes('[MSG')) {
            messageType = 'message';
            console.log(`💬 [${elapsed}ms] Response chunk ${messageCount}`);
          } else if (output.includes('[RESULT]')) {
            messageType = 'result';
            console.log(`✅ [${elapsed}ms] Result received`);
          }

          // Add event to span (will be sent to console receiver)
          mainSpan.addEvent(`claude_${messageType}`, {
            'message.elapsed_ms': elapsed,
            'message.sequence': messageCount,
            'message.type': messageType,
            'message.content_preview': output.substring(0, 30)
          });
        }
      });

      const totalTime = Date.now() - startTime;

      // Set final attributes
      mainSpan.setAttributes({
        'response.total_time_ms': totalTime,
        'response.message_count': messageCount,
        'response.success': !!result,
        'claude.model': 'claude-sonnet-4'
      });

      console.log(`\n⏱️  Total time: ${totalTime}ms`);
      console.log(`📊 Messages: ${messageCount}`);

      if (result && result.length > 0) {
        const content = result[0]?.message?.content;
        if (Array.isArray(content) && content[0]?.text) {
          const text = content[0].text;
          
          // Extract decision
          const decision = text.toLowerCase().includes('approve') ? 'approve' :
                          text.toLowerCase().includes('reject') ? 'reject' :
                          text.toLowerCase().includes('defer') ? 'defer' : 'unknown';

          // Add decision to span
          mainSpan.setAttributes({
            'safe.decision': decision,
            'response.text_length': text.length
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

      console.log(`\n📡 Trace sent to console receiver!`);
      console.log(`   🆔 Trace ID: ${mainSpan.spanContext().traceId}`);
      console.log(`   🎯 Span ID: ${mainSpan.spanContext().spanId}`);
      console.log(`   ⏱️  Duration: ${totalTime}ms`);
      console.log(`   📊 Events: ${messageCount + 3}`);
      
      mainSpan.end();
      
      // Force trace export before continuing
      console.log('\n📤 Forcing trace export...');
      await traceExporter.forceFlush();
      
      console.log('✅ Trace export completed!');
      console.log('👀 Check your console receiver window for the trace output');

      return result;
    });

  } catch (error) {
    console.error('\n❌ Simple OTEL test failed:', error);
    
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.recordException(error);
      activeSpan.setStatus({ code: SpanStatusCode.ERROR });
      activeSpan.end();
    }
    
    throw error;
  } finally {
    // Don't shutdown SDK too early - let traces export first
    console.log('⏳ Waiting for trace export...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await sdk.shutdown();
    console.log('🔌 OTEL SDK shutdown complete');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeSimpleOTEL().catch(console.error);
}

export { claudeSimpleOTEL };