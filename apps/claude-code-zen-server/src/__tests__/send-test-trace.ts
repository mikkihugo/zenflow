#!/usr/bin/env tsx
/**
 * @fileoverview Send a test trace to console receiver
 */

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

async function sendTestTrace() {
  console.log('📡 Sending Test Trace to Console Receiver');
  console.log('==========================================\n');

  const traceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const sdk = new NodeSDK({
    spanProcessor: new SimpleSpanProcessor(traceExporter),
    serviceName: 'test-service',
    serviceVersion: '1.0.0'
  });

  try {
    sdk.start();
    console.log('✅ OTEL SDK started');

    const tracer = trace.getTracer('test-service', '1.0.0');

    await tracer.startActiveSpan('test_operation', async (span) => {
      console.log('📊 Creating test span...');
      
      span.setAttributes({
        'test.attribute': 'test_value',
        'operation.type': 'test',
        'safe.role': 'epic_owner'
      });

      span.addEvent('test_event', {
        'event.type': 'test',
        'timestamp': Date.now()
      });

      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));

      span.setStatus({ code: SpanStatusCode.OK });
      span.addEvent('test_completed');

      console.log(`🎯 Test span created:`);
      console.log(`   Trace ID: ${span.spanContext().traceId}`);
      console.log(`   Span ID: ${span.spanContext().spanId}`);
      
      span.end();
    });

    // Give time for export
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ Test trace sent to console receiver!');
    console.log('👀 Check your console receiver window');

  } catch (error) {
    console.error('❌ Failed to send test trace:', error);
  } finally {
    await sdk.shutdown();
    console.log('🔌 SDK shutdown');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  sendTestTrace().catch(console.error);
}

export { sendTestTrace };