#!/usr/bin/env tsx
/**
 * @fileoverview Fixed Claude SDK + OTEL - Keep SDK alive during entire execution
 */

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

async function claudeFixedOTEL() {
  console.log('📡 Fixed Claude SDK + OTEL → Console Receiver');
  console.log('===============================================\n');

  // Initialize OTEL to send to console receiver
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

  let result;
  
  try {
    sdk.start();
    console.log('✅ OTEL SDK started, keeping alive during entire execution\n');

    const tracer = trace.getTracer('claude-zen-safe-sparc', '2.1.0');

    const span = tracer.startSpan('safe_epic_evaluation');
    
    // Set SAFe attributes
    span.setAttributes({
      'safe.role': 'epic_owner',
      'safe.epic': 'customer_support_bot',
      'sparc.phase': 'specification',
      'operation.type': 'llm_evaluation'
    });

    console.log('🚀 Starting Claude SDK call (SDK stays alive)...');

    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `As a SAFe Epic Owner, evaluate:

Epic: Customer Support Bot
Value: $400k/year, Cost: $150k, Timeline: 4 months, Risk: Low

Decision: approve/reject/defer with brief reason.`;

    let messageCount = 0;
    const startTime = Date.now();

    span.addEvent('prompt_prepared', {
      'prompt.length': prompt.length,
      'prompt.type': 'safe_epic_evaluation'
    });

    console.log('\n📋 Making Claude call...\n');

    result = await executeClaudeTask(prompt, {
      timeoutMs: 120000,
      stderr: (output: string) => {
        messageCount++;
        const elapsed = Date.now() - startTime;

        // Log and add events
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

        span.addEvent(`claude_${messageType}`, {
          'message.elapsed_ms': elapsed,
          'message.sequence': messageCount,
          'message.type': messageType
        });
      }
    });

    const totalTime = Date.now() - startTime;

    // Set final attributes
    span.setAttributes({
      'response.total_time_ms': totalTime,
      'response.message_count': messageCount,
      'response.success': !!result,
      'claude.model': 'claude-sonnet-4'
    });

    console.log(`\n⏱️  Total time: ${totalTime}ms`);
    console.log(`📊 Messages: ${messageCount}`);

    // Extract decision
    if (result && result.length > 0) {
      const content = result[0]?.message?.content;
      if (Array.isArray(content) && content[0]?.text) {
        const text = content[0].text;
        
        const decision = text.toLowerCase().includes('approve') ? 'approve' :
                        text.toLowerCase().includes('reject') ? 'reject' :
                        text.toLowerCase().includes('defer') ? 'defer' : 'unknown';

        span.setAttributes({
          'safe.decision': decision,
          'response.text_length': text.length
        });

        console.log(`\n🏛️  SAFe Decision: ${decision.toUpperCase()}`);
        console.log('═'.repeat(80));
        console.log(text);
        console.log('═'.repeat(80));
      }
    }

    span.setStatus({ code: SpanStatusCode.OK });
    span.addEvent('evaluation_completed', {
      'completion.total_time_ms': totalTime,
      'completion.success': true
    });

    console.log(`\n📡 Finishing span and forcing export...`);
    console.log(`   🆔 Trace ID: ${span.spanContext().traceId}`);
    console.log(`   🎯 Span ID: ${span.spanContext().spanId}`);
    console.log(`   ⏱️  Duration: ${totalTime}ms`);

    // End span BEFORE shutdown
    span.end();
    
    // Force export
    console.log('📤 Forcing trace export...');
    await traceExporter.forceFlush();
    
    console.log('✅ Trace exported! Check console receiver');

  } catch (error) {
    console.error('❌ OTEL test failed:', error);
    
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.recordException(error);
      activeSpan.setStatus({ code: SpanStatusCode.ERROR });
      activeSpan.end();
    }
    
    throw error;
  } finally {
    // Only shutdown after everything is complete
    console.log('⏳ Waiting before shutdown...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await sdk.shutdown();
    console.log('🔌 OTEL SDK shutdown complete');
  }
  
  return result;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeFixedOTEL().catch(console.error);
}

export { claudeFixedOTEL };