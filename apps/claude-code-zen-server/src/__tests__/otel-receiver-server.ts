#!/usr/bin/env tsx
/**
 * @fileoverview Simple OTEL Receiver Server
 * 
 * Run this to receive OpenTelemetry traces from Claude SDK
 */

import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';

interface OTELTrace {
  resourceSpans: Array<{
    resource: {
      attributes: Array<{
        key: string;
        value: { stringValue?: string; intValue?: number; boolValue?: boolean; };
      }>;
    };
    scopeSpans: Array<{
      spans: Array<{
        traceId: string;
        spanId: string;
        name: string;
        kind: number;
        startTimeUnixNano: string;
        endTimeUnixNano: string;
        attributes: Array<{
          key: string;
          value: { stringValue?: string; intValue?: number; boolValue?: boolean; };
        }>;
        events: Array<{
          timeUnixNano: string;
          name: string;
          attributes: Array<{
            key: string;
            value: { stringValue?: string; intValue?: number; boolValue?: boolean; };
          }>;
        }>;
        status: {
          code: number;
        };
      }>;
    }>;
  }>;
}

class OTELReceiverServer {
  private app = express();
  private traces: OTELTrace[] = [];
  private port: number;

  constructor(port = 4318) {
    this.port = port;
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.raw({ type: 'application/x-protobuf' }));
    
    // CORS for web requests
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
    });
  }

  private setupRoutes() {
    // OTLP HTTP endpoint
    this.app.post('/v1/traces', (req, res) => {
      console.log(`📊 Received OTEL trace data!`);
      console.log(`   Content-Type: ${req.headers['content-type']}`);
      console.log(`   Size: ${JSON.stringify(req.body).length} bytes`);
      
      try {
        let traceData: OTELTrace;
        
        if (typeof req.body === 'string') {
          traceData = JSON.parse(req.body);
        } else {
          traceData = req.body;
        }
        
        this.traces.push(traceData);
        this.processTrace(traceData);
        
        res.status(200).json({ 
          partialSuccess: {},
          message: `Received trace with ${traceData.resourceSpans?.length || 0} resource spans`
        });
        
      } catch (error) {
        console.error('❌ Error processing trace:', error);
        console.log('Raw body:', req.body);
        res.status(400).json({ error: 'Invalid trace data' });
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        tracesReceived: this.traces.length,
        uptime: process.uptime()
      });
    });

    // Get analytics
    this.app.get('/analytics', (req, res) => {
      const analytics = this.generateAnalytics();
      res.json(analytics);
    });

    // Get latest traces
    this.app.get('/traces', (req, res) => {
      const limit = parseInt(req.query.limit as string) || 10;
      res.json({
        traces: this.traces.slice(-limit),
        total: this.traces.length
      });
    });

    // Web dashboard
    this.app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Claude OTEL Receiver</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .trace { border: 1px solid #ccc; margin: 10px 0; padding: 10px; }
            .span { background: #f5f5f5; margin: 5px 0; padding: 5px; }
            pre { background: #f9f9f9; padding: 10px; overflow: auto; }
          </style>
        </head>
        <body>
          <h1>🎯 Claude OTEL Receiver Dashboard</h1>
          <p>Traces received: <span id="count">${this.traces.length}</span></p>
          <button onclick="location.reload()">Refresh</button>
          <a href="/analytics">Analytics</a>
          <a href="/traces">Raw Traces</a>
          
          <h2>Recent Activity</h2>
          <div id="activity">
            ${this.traces.slice(-5).map((trace, i) => `
              <div class="trace">
                <strong>Trace ${i + 1}</strong>
                <div>Resource Spans: ${trace.resourceSpans?.length || 0}</div>
                <div>Total Spans: ${this.countSpans(trace)}</div>
              </div>
            `).join('')}
          </div>
          
          <script>
            setInterval(() => location.reload(), 5000);
          </script>
        </body>
        </html>
      `);
    });
  }

  private processTrace(trace: OTELTrace) {
    console.log(`\n🔍 PROCESSING CLAUDE TRACE:`);
    console.log(`   Resource spans: ${trace.resourceSpans?.length || 0}`);
    
    if (trace.resourceSpans) {
      trace.resourceSpans.forEach((resourceSpan, rsIndex) => {
        console.log(`\n   📦 Resource Span ${rsIndex + 1}:`);
        
        // Show resource attributes
        if (resourceSpan.resource?.attributes) {
          const attrs = this.extractAttributes(resourceSpan.resource.attributes);
          console.log(`      Service: ${attrs['service.name'] || 'unknown'}`);
          console.log(`      Version: ${attrs['service.version'] || 'unknown'}`);
        }
        
        // Process scope spans
        if (resourceSpan.scopeSpans) {
          resourceSpan.scopeSpans.forEach((scopeSpan, ssIndex) => {
            console.log(`\n      🎯 Scope Span ${ssIndex + 1}: ${scopeSpan.spans?.length || 0} spans`);
            
            if (scopeSpan.spans) {
              scopeSpan.spans.forEach((span, spanIndex) => {
                const duration = this.calculateDuration(span.startTimeUnixNano, span.endTimeUnixNano);
                const attrs = this.extractAttributes(span.attributes || []);
                
                console.log(`\n         🔗 Span ${spanIndex + 1}: ${span.name}`);
                console.log(`            Trace ID: ${span.traceId}`);
                console.log(`            Duration: ${duration}ms`);
                console.log(`            Status: ${span.status?.code === 1 ? 'OK' : 'ERROR'}`);
                
                // Show SAFe-specific attributes
                if (attrs['safe.role']) {
                  console.log(`            🏛️  SAFe Role: ${attrs['safe.role']}`);
                }
                if (attrs['safe.decision']) {
                  console.log(`            🏛️  Decision: ${attrs['safe.decision']}`);
                }
                if (attrs['sparc.phase']) {
                  console.log(`            📋 SPARC Phase: ${attrs['sparc.phase']}`);
                }
                
                // Show events
                if (span.events && span.events.length > 0) {
                  console.log(`            📅 Events: ${span.events.length}`);
                  span.events.forEach((event, eventIndex) => {
                    console.log(`               ${eventIndex + 1}. ${event.name}`);
                  });
                }
              });
            }
          });
        }
      });
    }
    
    console.log(`\n✅ Trace processed successfully!`);
  }

  private extractAttributes(attributes: Array<{ key: string; value: any }>): Record<string, any> {
    const result: Record<string, any> = {};
    
    attributes.forEach(attr => {
      if (attr.value.stringValue !== undefined) {
        result[attr.key] = attr.value.stringValue;
      } else if (attr.value.intValue !== undefined) {
        result[attr.key] = attr.value.intValue;
      } else if (attr.value.boolValue !== undefined) {
        result[attr.key] = attr.value.boolValue;
      }
    });
    
    return result;
  }

  private calculateDuration(startNano: string, endNano: string): number {
    const start = parseInt(startNano);
    const end = parseInt(endNano);
    return Math.round((end - start) / 1_000_000); // Convert to milliseconds
  }

  private countSpans(trace: OTELTrace): number {
    let count = 0;
    if (trace.resourceSpans) {
      trace.resourceSpans.forEach(rs => {
        if (rs.scopeSpans) {
          rs.scopeSpans.forEach(ss => {
            count += ss.spans?.length || 0;
          });
        }
      });
    }
    return count;
  }

  private generateAnalytics() {
    return {
      totalTraces: this.traces.length,
      totalSpans: this.traces.reduce((sum, trace) => sum + this.countSpans(trace), 0),
      avgSpansPerTrace: this.traces.length > 0 
        ? this.traces.reduce((sum, trace) => sum + this.countSpans(trace), 0) / this.traces.length
        : 0,
      recentActivity: this.traces.slice(-10).map(trace => ({
        resourceSpans: trace.resourceSpans?.length || 0,
        totalSpans: this.countSpans(trace)
      }))
    };
  }

  async start() {
    // Create data directory
    await fs.mkdir('./otel-data', { recursive: true });
    
    this.app.listen(this.port, () => {
      console.log(`🎯 OTEL Receiver Server running!`);
      console.log(`   Port: ${this.port}`);
      console.log(`   OTLP HTTP: http://localhost:${this.port}/v1/traces`);
      console.log(`   Dashboard: http://localhost:${this.port}`);
      console.log(`   Health: http://localhost:${this.port}/health`);
      console.log(`   Analytics: http://localhost:${this.port}/analytics`);
      console.log(`\n📊 Ready to receive Claude SDK traces!`);
    });
  }
}

// Start the receiver server
if (import.meta.url === `file://${process.argv[1]}`) {
  const receiver = new OTELReceiverServer();
  receiver.start().catch(console.error);
}

export { OTELReceiverServer };