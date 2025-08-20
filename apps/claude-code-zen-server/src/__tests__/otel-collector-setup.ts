#!/usr/bin/env tsx
/**
 * @fileoverview OpenTelemetry Collector Setup Options
 * 
 * Demonstrates different OTEL receivers you can run to collect Claude SDK logging
 */

console.log('📡 OpenTelemetry Collector Options for Claude SDK');
console.log('===============================================\n');

const otelReceivers = {
  // 1. OTEL Collector (Most Popular)
  otelCollector: {
    name: 'OpenTelemetry Collector',
    setup: 'Docker or binary',
    ports: {
      otlp_grpc: 4317,
      otlp_http: 4318,
      jaeger: 14268,
      prometheus: 8888
    },
    config: `
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318
        cors:
          allowed_origins: ["*"]

processors:
  batch:
  memory_limiter:
    limit_mib: 512

exporters:
  # Console output for development
  logging:
    loglevel: debug
    
  # Jaeger for tracing
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
      
  # Prometheus for metrics  
  prometheus:
    endpoint: "0.0.0.0:8888"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [logging, jaeger]
    metrics:
      receivers: [otlp] 
      processors: [memory_limiter, batch]
      exporters: [logging, prometheus]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch] 
      exporters: [logging]`,
    docker: 'docker run -p 4317:4317 -p 4318:4318 -v ./otel-config.yaml:/etc/otel-config.yaml otel/opentelemetry-collector-contrib --config=/etc/otel-config.yaml'
  },

  // 2. Jaeger (Tracing focused)
  jaeger: {
    name: 'Jaeger (Uber)',
    setup: 'Docker all-in-one',
    ports: {
      ui: 16686,
      collector: 14268,
      agent: 6831
    },
    docker: 'docker run -p 16686:16686 -p 14268:14268 jaegertracing/all-in-one:latest',
    description: 'Best for distributed tracing visualization'
  },

  // 3. Grafana Stack
  grafana: {
    name: 'Grafana + Loki + Tempo',
    setup: 'Docker Compose',
    ports: {
      grafana: 3000,
      loki: 3100, 
      tempo: 3200
    },
    description: 'Full observability stack with dashboards'
  },

  // 4. Local Development Options
  local: {
    name: 'Local Development Receivers',
    options: [
      {
        name: 'Console Exporter',
        description: 'Direct console output (what we tested)',
        code: `exporters: { console: { verbosity: 'detailed' } }`
      },
      {
        name: 'File Exporter',
        description: 'Write to local files for analysis',
        code: `exporters: { file: { path: './otel-traces.json' } }`
      },
      {
        name: 'HTTP Endpoint',
        description: 'Custom webhook receiver',
        code: `exporters: { otlphttp: { endpoint: 'http://localhost:8080/traces' } }`
      }
    ]
  }
};

console.log('🐳 RECOMMENDED: Docker-based OTEL Collector');
console.log('==========================================');
console.log('Quick setup for immediate use:\n');

console.log('1️⃣ Create otel-config.yaml:');
console.log(otelReceivers.otelCollector.config);

console.log('\n2️⃣ Run OTEL Collector:');
console.log(otelReceivers.otelCollector.docker);

console.log('\n3️⃣ Access endpoints:');
Object.entries(otelReceivers.otelCollector.ports).forEach(([service, port]) => {
  console.log(`   ${service}: http://localhost:${port}`);
});

console.log('\n🔬 FOR CLAUDE-ZEN INTEGRATION:');
console.log('==============================');

const claudeZenIntegration = `
// packages/foundation/src/otel-integration.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-otlp-http';

export function initializeOTEL() {
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: 'http://localhost:4318/v1/traces',
      headers: {
        'service.name': 'claude-zen-safe-sparc',
        'service.version': '2.1.0'
      }
    }),
    logRecordProcessor: new BatchLogRecordProcessor(
      new OTLPLogExporter({
        url: 'http://localhost:4318/v1/logs'
      })
    ),
    instrumentations: [
      // Auto-instrument HTTP, fetch, etc.
      getNodeAutoInstrumentations()
    ]
  });
  
  sdk.start();
  return sdk;
}

// Usage in Claude SDK calls
export async function executeClaudeTaskWithOTEL(prompt: string, options?: any) {
  const tracer = trace.getTracer('claude-zen-sdk');
  
  return tracer.startActiveSpan('claude_safe_evaluation', async (span) => {
    span.setAttributes({
      'claude.prompt.length': prompt.length,
      'claude.model': 'claude-sonnet-4',
      'safe.role': 'epic_owner',
      'operation.type': 'llm_call'
    });
    
    try {
      const result = await executeClaudeTask(prompt, {
        ...options,
        stderr: (output) => {
          // Add events to the span
          span.addEvent('claude_message', {
            'message.content': output.substring(0, 100),
            'message.timestamp': Date.now()
          });
          
          if (options?.stderr) options.stderr(output);
        }
      });
      
      span.setAttributes({
        'claude.response.success': !!result,
        'claude.response.length': result?.length || 0
      });
      
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
      
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    }
  });
}`;

console.log(claudeZenIntegration);

console.log('\n🚀 QUICK START COMMANDS:');
console.log('========================');

console.log(`
# 1. Start OTEL Collector + Jaeger
docker network create otel-network
docker run -d --name jaeger --network otel-network -p 16686:16686 jaegertracing/all-in-one:latest

# 2. Create collector config and run
# (Save the YAML config above as otel-config.yaml)
docker run -d --name otel-collector --network otel-network \\
  -p 4317:4317 -p 4318:4318 -p 8888:8888 \\
  -v $(pwd)/otel-config.yaml:/etc/otelcol-contrib/config.yaml \\
  otel/opentelemetry-collector-contrib:latest

# 3. View traces at http://localhost:16686
# 4. View metrics at http://localhost:8888/metrics
`);

console.log('\n📊 WHAT YOU\'LL SEE:');
console.log('===================');
console.log('• Complete Claude SDK execution traces');
console.log('• SAFe role decision timing and flow');
console.log('• SPARC methodology phase transitions');
console.log('• Performance metrics and bottlenecks');
console.log('• Error patterns and success rates');
console.log('• Custom business metrics (ROI, decisions, etc.)');

console.log('\n✅ This gives you production-ready observability for the SAFe-SPARC workflow!');