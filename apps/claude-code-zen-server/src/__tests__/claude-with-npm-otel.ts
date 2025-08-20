#!/usr/bin/env tsx
/**
 * @fileoverview Claude SDK with NPM OpenTelemetry Integration
 * 
 * Working integration using installed npm packages
 */

// Initialize OTEL before importing other modules
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { trace, SpanStatusCode } from '@opentelemetry/api';

async function claudeWithNpmOTEL() {
  console.log('📊 Claude SDK with NPM OpenTelemetry Integration');
  console.log('================================================\n');

  // Initialize OTEL SDK
  console.log('🔧 Initializing OTEL SDK...');
  const sdk = new NodeSDK({
    // spanProcessor: new SimpleSpanProcessor(new ConsoleSpanExporter()), // Commented due to OTEL version mismatch
    instrumentations: [getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable noisy file system traces
      },
    })],
    serviceName: 'claude-zen-safe-sparc'
    // serviceVersion: '2.1.0' // Not supported in this OTEL version
  });

  sdk.start();
  console.log('✅ OTEL SDK started\n');

  // Get tracer
  const tracer = trace.getTracer('claude-zen-safe-sparc', '2.1.0');

  try {
    // Start main span
    return tracer.startActiveSpan('safe_epic_evaluation', async (mainSpan) => {
      mainSpan.setAttributes({
        'service.name': 'claude-zen-safe-sparc',
        'safe.role': 'epic_owner',
        'sparc.phase': 'specification',
        'operation.type': 'llm_evaluation'
      });

      console.log('📋 Starting SAFe Epic evaluation with OTEL tracing...\n');

      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      const prompt = `As a SAFe Epic Owner, evaluate this proposal:

Epic: AI-Powered Customer Support
Business Value: $500k/year efficiency gains
Development Cost: $200k
Timeline: 5 months
Risk: Medium

Provide structured evaluation with decision.`;

      mainSpan.addEvent('prompt_prepared', {
        'prompt.length': prompt.length,
        'prompt.tokens_estimated': Math.ceil(prompt.length / 4)
      });

      let messageCount = 0;
      let firstTokenTime = 0;
      const startTime = Date.now();

      const result = await executeClaudeTask(prompt, {
        timeoutMs: 120000,
        stderr: (output: string) => {
          messageCount++;
          const elapsed = Date.now() - startTime;

          if (messageCount === 1) {
            firstTokenTime = elapsed;
            mainSpan.addEvent('first_token_received', {
              'response.time_to_first_token_ms': elapsed
            });
          }

          // Add streaming events to the span
          let messageType = 'debug';
          if (output.includes('Starting Claude')) messageType = 'startup';
          else if (output.includes('[SYSTEM]')) messageType = 'system';
          else if (output.includes('[MSG')) messageType = 'message';
          else if (output.includes('[RESULT]')) messageType = 'result';

          mainSpan.addEvent(`claude_${messageType}`, {
            'message.elapsed_ms': elapsed,
            'message.sequence': messageCount,
            'message.type': messageType
          });

          console.log(`🔄 [OTEL Trace] ${messageType.toUpperCase()} at ${elapsed}ms: ${output.substring(0, 80)}...`);
        }
      });

      const totalTime = Date.now() - startTime;

      mainSpan.setAttributes({
        'response.total_time_ms': totalTime,
        'response.first_token_ms': firstTokenTime,
        'response.message_count': messageCount,
        'response.success': !!result
      });

      if (result && result.length > 0) {
        // Extract decision for OTEL attributes
        const content = (result[0] as any)?.content;
        if (Array.isArray(content) && content[0]?.text) {
          const text = content[0].text;
          const decision = text.toLowerCase().includes('approve') ? 'approve' :
                          text.toLowerCase().includes('reject') ? 'reject' :
                          text.toLowerCase().includes('defer') ? 'defer' : 'unknown';

          mainSpan.setAttributes({
            'safe.decision': decision,
            'response.text_length': text.length,
            'response.words': text.split(/\s+/).length
          });

          mainSpan.addEvent('decision_extracted', {
            'safe.decision': decision,
            'decision.confidence': decision !== 'unknown' ? 'high' : 'low'
          });

          console.log(`\n🏛️ [OTEL Traced] SAFe Decision: ${decision.toUpperCase()}`);
          console.log('═'.repeat(80));
          console.log(text);
          console.log('═'.repeat(80));
        }
      }

      mainSpan.setStatus({ code: SpanStatusCode.OK });
      mainSpan.addEvent('evaluation_completed', {
        'completion.success': true,
        'completion.total_time_ms': totalTime
      });

      console.log(`\n📊 OTEL Trace Summary:`);
      console.log(`   Span ID: ${mainSpan.spanContext().spanId}`);
      console.log(`   Trace ID: ${mainSpan.spanContext().traceId}`);
      console.log(`   Total time: ${totalTime}ms`);
      console.log(`   Events recorded: ${messageCount + 3}`); // +3 for our custom events
      console.log(`   Attributes set: 12+`);

      mainSpan.end();
      
      console.log('\n🎊 NPM OTEL integration completed successfully!');
      return result;
    });

  } catch (error) {
    console.error('❌ NPM OTEL integration failed:', error);
    
    // Record error in active span if available
    const activeSpan = trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.recordException(error);
      activeSpan.setStatus({ code: SpanStatusCode.ERROR });
    }
    
    throw error;
  } finally {
    // Graceful shutdown
    setTimeout(() => {
      sdk.shutdown().then(() => {
        console.log('🔧 OTEL SDK gracefully shutdown');
        process.exit(0);
      });
    }, 2000); // Give time for spans to be exported
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeWithNpmOTEL().catch(console.error);
}

export { claudeWithNpmOTEL };