#!/usr/bin/env tsx
/**
 * @fileoverview Persistent OTEL Receiver Server
 * 
 * Stays running indefinitely to receive OpenTelemetry traces
 */

import express from 'express';

class PersistentOTELReceiver {
  private app = express();
  private traces: any[] = [];
  private port = 4318;

  constructor() {
    this.setupGracefulShutdown();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupGracefulShutdown() {
    // Prevent the process from exiting
    process.on('SIGTERM', () => {
      console.log('\n🛑 Received SIGTERM, but staying alive...');
    });
    
    process.on('SIGINT', () => {
      console.log('\n🛑 Received SIGINT (Ctrl+C), shutting down gracefully...');
      process.exit(0);
    });
    
    // Keep the event loop alive
    setInterval(() => {
      // Do nothing, just keep alive
    }, 30000);
  }

  private setupMiddleware() {
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.raw({ type: 'application/x-protobuf', limit: '50mb' }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      next();
    });
  }

  private setupRoutes() {
    // Main OTLP endpoint
    this.app.post('/v1/traces', (req, res) => {
      const timestamp = new Date().toISOString();
      console.log(`\n📊 [${timestamp}] RECEIVED CLAUDE TRACE!`);
      console.log(`   Content-Type: ${req.headers['content-type']}`);
      console.log(`   Content-Length: ${req.headers['content-length']} bytes`);
      
      try {
        let traceData = req.body;
        
        // Handle different content types
        if (typeof req.body === 'string') {
          traceData = JSON.parse(req.body);
        }
        
        this.traces.push({
          timestamp,
          data: traceData
        });
        
        // Process and display the trace
        this.displayTrace(traceData, timestamp);
        
        res.status(200).json({ 
          partialSuccess: {},
          message: 'Trace received successfully'
        });
        
      } catch (error) {
        console.error('❌ Error processing trace:', error);
        res.status(200).json({ 
          partialSuccess: {},
          message: 'Trace received (parsing error occurred)'
        });
      }
    });

    // Health endpoint
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        uptime: process.uptime(),
        tracesReceived: this.traces.length,
        port: this.port
      });
    });

    // Dashboard
    this.app.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Claude OTEL Receiver - RUNNING</title>
          <meta http-equiv="refresh" content="5">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .status { background: #4CAF50; color: white; padding: 10px; border-radius: 5px; }
            .trace { background: white; border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
            .timestamp { color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="status">
            <h1>🎯 Claude OTEL Receiver - ACTIVE</h1>
            <p>Port: ${this.port} | Uptime: ${Math.floor(process.uptime())}s | Traces: ${this.traces.length}</p>
          </div>
          
          <h2>Recent Traces (Auto-refresh every 5s)</h2>
          ${this.traces.slice(-5).map(trace => `
            <div class="trace">
              <div class="timestamp">${trace.timestamp}</div>
              <div>Trace received and processed</div>
            </div>
          `).join('')}
          
          ${this.traces.length === 0 ? '<p><em>No traces received yet. Run Claude SDK tests to see traces here.</em></p>' : ''}
        </body>
        </html>
      `);
    });
  }

  private displayTrace(traceData: any, timestamp: string) {
    console.log(`🔍 PROCESSING CLAUDE TRACE [${timestamp}]:`);
    console.log('═'.repeat(60));
    
    try {
      if (traceData.resourceSpans) {
        console.log(`📦 Resource Spans: ${traceData.resourceSpans.length}`);
        
        traceData.resourceSpans.forEach((resourceSpan: any, index: number) => {
          console.log(`\n   Resource Span ${index + 1}:`);
          
          // Show service info
          if (resourceSpan.resource?.attributes) {
            const attrs = this.extractAttributes(resourceSpan.resource.attributes);
            console.log(`   🏷️  Service: ${attrs['service.name'] || 'unknown'}`);
            console.log(`   📊 Version: ${attrs['service.version'] || 'unknown'}`);
          }
          
          // Show spans
          if (resourceSpan.scopeSpans) {
            resourceSpan.scopeSpans.forEach((scopeSpan: any) => {
              if (scopeSpan.spans) {
                console.log(`   🔗 Spans: ${scopeSpan.spans.length}`);
                
                scopeSpan.spans.forEach((span: any, spanIndex: number) => {
                  const attrs = this.extractAttributes(span.attributes || []);
                  const duration = this.calculateDuration(span.startTimeUnixNano, span.endTimeUnixNano);
                  
                  console.log(`\n      Span ${spanIndex + 1}: ${span.name}`);
                  console.log(`         Duration: ${duration}ms`);
                  console.log(`         Status: ${span.status?.code === 1 ? '✅ OK' : '❌ ERROR'}`);
                  
                  // Show SAFe/Claude specific attributes
                  if (attrs['safe.role']) console.log(`         🏛️  SAFe Role: ${attrs['safe.role']}`);
                  if (attrs['safe.decision']) console.log(`         🏛️  Decision: ${attrs['safe.decision']}`);
                  if (attrs['claude.prompt.length']) console.log(`         💬 Prompt Length: ${attrs['claude.prompt.length']}`);
                  if (attrs['response.success']) console.log(`         ✅ Success: ${attrs['response.success']}`);
                  
                  // Show events
                  if (span.events && span.events.length > 0) {
                    console.log(`         📅 Events: ${span.events.length}`);
                    span.events.slice(0, 3).forEach((event: any, eventIndex: number) => {
                      console.log(`            ${eventIndex + 1}. ${event.name}`);
                    });
                    if (span.events.length > 3) {
                      console.log(`            ... and ${span.events.length - 3} more`);
                    }
                  }
                });
              }
            });
          }
        });
      } else {
        console.log('📄 Raw trace data received (no resourceSpans)');
      }
      
    } catch (error) {
      console.log('⚠️  Error displaying trace details:', error.message);
    }
    
    console.log('═'.repeat(60));
    console.log(`✅ Trace processed! Total traces: ${this.traces.length}\n`);
  }

  private extractAttributes(attributes: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    attributes.forEach(attr => {
      if (attr.value) {
        result[attr.key] = attr.value.stringValue || attr.value.intValue || attr.value.boolValue || attr.value;
      }
    });
    return result;
  }

  private calculateDuration(startNano: string, endNano: string): number {
    try {
      const start = parseInt(startNano);
      const end = parseInt(endNano);
      return Math.round((end - start) / 1_000_000); // Convert to milliseconds
    } catch {
      return 0;
    }
  }

  start() {
    const server = this.app.listen(this.port, '0.0.0.0', () => {
      console.log('🎯 PERSISTENT CLAUDE OTEL RECEIVER STARTED!');
      console.log('===========================================');
      console.log(`📡 Port: ${this.port}`);
      console.log(`🌐 OTLP HTTP: http://localhost:${this.port}/v1/traces`);
      console.log(`📊 Dashboard: http://localhost:${this.port}`);
      console.log(`💚 Health: http://localhost:${this.port}/health`);
      console.log('');
      console.log('🔄 This receiver will stay running indefinitely');
      console.log('📥 Ready to receive Claude SDK traces...');
      console.log('🛑 Press Ctrl+C to stop');
      console.log('═'.repeat(50));
    });
    
    server.keepAliveTimeout = 0;
    server.timeout = 0;
    
    // Keep the server alive
    setInterval(() => {
      console.log(`💓 Alive - Uptime: ${Math.floor(process.uptime())}s, Traces: ${this.traces.length}`);
    }, 30000);
  }
}

// Start the persistent receiver
if (import.meta.url === `file://${process.argv[1]}`) {
  const receiver = new PersistentOTELReceiver();
  receiver.start();
}

export { PersistentOTELReceiver };