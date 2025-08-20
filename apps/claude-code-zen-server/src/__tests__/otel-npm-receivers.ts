#!/usr/bin/env tsx
/**
 * @fileoverview Ready-made NPM OpenTelemetry Receivers
 * 
 * Use npm packages to run OTEL receivers directly in Node.js
 */

console.log('📦 Ready-made NPM OpenTelemetry Receivers');
console.log('=========================================\n');

const npmReceivers = {
  // 1. @opentelemetry/auto-instrumentations-node (Most Popular)
  autoInstrumentation: {
    package: '@opentelemetry/auto-instrumentations-node',
    install: 'pnpm add @opentelemetry/auto-instrumentations-node @opentelemetry/sdk-node',
    description: 'Automatic instrumentation for Node.js apps',
    setup: `
// packages/foundation/src/otel-auto.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();`
  },

  // 2. @opentelemetry/exporter-console (Development)
  consoleExporter: {
    package: '@opentelemetry/exporter-console',
    install: 'pnpm add @opentelemetry/exporter-console @opentelemetry/sdk-trace-node',
    description: 'Console output for development',
    setup: `
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();`
  },

  // 3. @opentelemetry/exporter-jaeger (Jaeger Integration)
  jaegerExporter: {
    package: '@opentelemetry/exporter-jaeger',
    install: 'pnpm add @opentelemetry/exporter-jaeger',
    description: 'Direct Jaeger export (no collector needed)',
    setup: `
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://localhost:14268/api/traces'
});

provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));`
  },

  // 4. @opentelemetry/exporter-otlp-http (OTLP HTTP)
  otlpHttpExporter: {
    package: '@opentelemetry/exporter-otlp-http',
    install: 'pnpm add @opentelemetry/exporter-otlp-http',
    description: 'HTTP OTLP endpoint (most flexible)',
    setup: `
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';

const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
  headers: {
    'Authorization': 'Bearer your-token',
    'X-Custom-Header': 'claude-zen-safe-sparc'
  }
});`
  },

  // 5. Custom Express/Fastify receiver
  customReceiver: {
    package: 'express + @opentelemetry/api',
    install: 'pnpm add express @opentelemetry/api',
    description: 'Custom HTTP receiver for learning',
    setup: `
// Custom receiver server
import express from 'express';
import { trace } from '@opentelemetry/api';

const app = express();
app.use(express.json());

app.post('/v1/traces', (req, res) => {
  const traces = req.body;
  console.log('📊 Received OTEL traces:', JSON.stringify(traces, null, 2));
  
  // Process for learning
  analyzeClaudeTraces(traces);
  
  res.status(200).json({ received: true });
});

app.listen(4318, () => console.log('🎯 OTEL receiver running on :4318'));`
  }
};

console.log('🚀 RECOMMENDED NPM APPROACH:');
console.log('============================\n');

console.log('1️⃣ Install core packages:');
console.log('pnpm add @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-console\n');

console.log('2️⃣ Create simple OTEL setup:');
const simpleOtelSetup = `
// packages/foundation/src/otel-simple.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';

export function initializeSimpleOTEL() {
  const sdk = new NodeSDK({
    traceExporter: new ConsoleSpanExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
      exportIntervalMillis: 5000,
    }),
    instrumentations: [getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // Disable noisy file system traces
      },
    })],
  });

  sdk.start();
  console.log('🎯 Simple OTEL SDK initialized');
  return sdk;
}

// Usage in Claude SDK
import { trace, context } from '@opentelemetry/api';

export async function executeClaudeTaskWithSimpleOTEL(prompt: string, options?: any) {
  const tracer = trace.getTracer('claude-zen-safe-sparc');
  
  return tracer.startActiveSpan('claude_safe_evaluation', async (span) => {
    span.setAttributes({
      'claude.prompt.length': prompt.length,
      'safe.role': 'epic_owner',
      'sparc.phase': 'specification'
    });
    
    try {
      const result = await executeClaudeTask(prompt, options);
      span.setAttributes({ 'claude.success': true });
      return result;
    } catch (error) {
      span.recordException(error);
      throw error;
    } finally {
      span.end();
    }
  });
}`;

console.log(simpleOtelSetup);

console.log('\n3️⃣ Run with OTEL enabled:');
console.log('# Add to package.json scripts:');
console.log('"dev:otel": "node --require ./src/otel-simple.js ./src/index.js"');

console.log('\n📊 LEARNING-FOCUSED NPM RECEIVERS:');
console.log('==================================\n');

const learningReceiver = `
// src/__tests__/claude-learning-receiver.ts
import express from 'express';
import fs from 'fs/promises';
import path from 'path';

interface ClaudeTrace {
  traceID: string;
  spans: Array<{
    name: string;
    startTime: number;
    duration: number;
    attributes: Record<string, any>;
    events: Array<{
      name: string;
      timestamp: number;
      attributes: Record<string, any>;
    }>;
  }>;
}

class ClaudeLearningReceiver {
  private traces: ClaudeTrace[] = [];
  private app = express();
  
  constructor() {
    this.app.use(express.json());
    this.app.post('/v1/traces', this.handleTraces.bind(this));
    this.app.get('/analytics', this.getAnalytics.bind(this));
    this.app.get('/health', (req, res) => res.json({ status: 'ok' }));
  }
  
  private async handleTraces(req: any, res: any) {
    const trace: ClaudeTrace = req.body;
    this.traces.push(trace);
    
    console.log(\`📊 Received Claude trace: \${trace.traceID}\`);
    console.log(\`   Spans: \${trace.spans.length}\`);
    
    // Extract SAFe decision patterns
    const safeDecisions = this.extractSafeDecisions(trace);
    if (safeDecisions.length > 0) {
      console.log(\`🏛️  SAFe decisions: \${safeDecisions.map(d => d.decision).join(', ')}\`);
    }
    
    // Save for learning
    await this.saveForLearning(trace);
    
    res.json({ received: true, traceID: trace.traceID });
  }
  
  private extractSafeDecisions(trace: ClaudeTrace) {
    const decisions = [];
    
    for (const span of trace.spans) {
      if (span.attributes['safe.role'] && span.attributes['safe.decision']) {
        decisions.push({
          role: span.attributes['safe.role'],
          decision: span.attributes['safe.decision'],
          duration: span.duration,
          timestamp: span.startTime
        });
      }
    }
    
    return decisions;
  }
  
  private async saveForLearning(trace: ClaudeTrace) {
    const filename = \`./learning-data/trace-\${Date.now()}.json\`;
    await fs.mkdir('./learning-data', { recursive: true });
    await fs.writeFile(filename, JSON.stringify(trace, null, 2));
  }
  
  private getAnalytics(req: any, res: any) {
    const stats = {
      totalTraces: this.traces.length,
      avgDuration: this.traces.reduce((sum, t) => sum + t.spans.reduce((s, sp) => s + sp.duration, 0), 0) / this.traces.length,
      safeDecisions: this.traces.flatMap(t => this.extractSafeDecisions(t)),
      recentTraces: this.traces.slice(-10)
    };
    
    res.json(stats);
  }
  
  start(port = 4318) {
    this.app.listen(port, () => {
      console.log(\`🎯 Claude Learning Receiver running on port \${port}\`);
      console.log(\`   Traces endpoint: http://localhost:\${port}/v1/traces\`);
      console.log(\`   Analytics: http://localhost:\${port}/analytics\`);
    });
  }
}

// Start the receiver
new ClaudeLearningReceiver().start();`;

console.log(learningReceiver);

console.log('\n✅ BENEFITS OF NPM APPROACH:');
console.log('============================');
console.log('• No Docker overhead');
console.log('• Direct Node.js integration');
console.log('• Easy customization for learning');
console.log('• Fast startup and iteration');
console.log('• Can be part of your main application');
console.log('• Perfect for development and testing');

console.log('\nRun: pnpm add @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node');