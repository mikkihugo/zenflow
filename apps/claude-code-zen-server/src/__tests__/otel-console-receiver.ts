#!/usr/bin/env tsx
/**
 * @fileoverview Console-only OTEL Receiver
 * 
 * Just listens and outputs to console - no web server
 */

import { createServer } from 'http';

class ConsoleOTELReceiver {
  private traces = 0;
  private port = 4318;

  constructor() {
    // Keep alive without web server overhead
    setInterval(() => {
      // Just keep process alive
    }, 30000);
    
    process.on('SIGINT', () => {
      console.log('\n👋 Console OTEL receiver shutting down...');
      process.exit(0);
    });
  }

  start() {
    const server = createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/v1/traces') {
        this.handleTrace(req, res);
      } else if (req.method === 'POST' && req.url === '/v1/logs') {
        this.handleLogs(req, res);
      } else if (req.method === 'POST' && req.url === '/v1/metrics') {
        this.handleMetrics(req, res);
      } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', traces: this.traces }));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(this.port, () => {
      console.log('📺 CONSOLE OTEL RECEIVER');
      console.log('========================');
      console.log(`🎯 Listening on port ${this.port}`);
      console.log('📥 Waiting for Claude SDK traces...');
      console.log('🛑 Press Ctrl+C to stop\n');
    });
  }

  private handleTrace(req: any, res: any) {
    let body = '';
    
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      this.traces++;
      const timestamp = new Date().toLocaleTimeString();
      
      console.log(`\n📊 [${timestamp}] CLAUDE TRACE #${this.traces} RECEIVED!`);
      console.log('─'.repeat(50));
      
      try {
        const traceData = JSON.parse(body);
        this.displayTrace(traceData);
      } catch (error) {
        console.log('📄 Raw trace data received');
        console.log(`   Size: ${body.length} bytes`);
      }
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('{"partialSuccess":{}}');
    });
  }

  private displayTrace(traceData: any) {
    if (traceData.resourceSpans) {
      traceData.resourceSpans.forEach((resourceSpan: any, rsIndex: number) => {
        console.log(`📦 Resource Span ${rsIndex + 1}:`);
        
        // Service info
        if (resourceSpan.resource?.attributes) {
          const attrs = this.extractAttributes(resourceSpan.resource.attributes);
          console.log(`   🏷️  Service: ${attrs['service.name'] || 'claude-zen-safe-sparc'}`);
          if (attrs['service.version']) {
            console.log(`   📊 Version: ${attrs['service.version']}`);
          }
        }
        
        // Process spans
        if (resourceSpan.scopeSpans) {
          resourceSpan.scopeSpans.forEach((scopeSpan: any) => {
            if (scopeSpan.spans) {
              console.log(`   🔗 Spans: ${scopeSpan.spans.length}`);
              
              scopeSpan.spans.forEach((span: any, spanIndex: number) => {
                const duration = this.calculateDuration(span.startTimeUnixNano, span.endTimeUnixNano);
                const attrs = this.extractAttributes(span.attributes || []);
                
                console.log(`\n      🎯 ${span.name} (${duration}ms)`);
                console.log(`         Status: ${span.status?.code === 1 ? '✅ Success' : '❌ Error'}`);
                
                // SAFe-specific info
                if (attrs['safe.role']) {
                  console.log(`         🏛️  SAFe Role: ${attrs['safe.role']}`);
                }
                if (attrs['safe.decision']) {
                  console.log(`         🏛️  Decision: ${attrs['safe.decision']}`);
                }
                if (attrs['sparc.phase']) {
                  console.log(`         📋 SPARC Phase: ${attrs['sparc.phase']}`);
                }
                
                // Claude SDK info
                if (attrs['claude.prompt.length']) {
                  console.log(`         💬 Prompt: ${attrs['claude.prompt.length']} chars`);
                }
                if (attrs['response.total_time_ms']) {
                  console.log(`         ⏱️  Response Time: ${attrs['response.total_time_ms']}ms`);
                }
                if (attrs['response.first_token_ms']) {
                  console.log(`         🎯 First Token: ${attrs['response.first_token_ms']}ms`);
                }
                
                // Show key events
                if (span.events && span.events.length > 0) {
                  console.log(`         📅 Key Events:`);
                  span.events.slice(0, 5).forEach((event: any) => {
                    const eventAttrs = this.extractAttributes(event.attributes || []);
                    console.log(`            • ${event.name}`);
                    if (eventAttrs['message.type']) {
                      console.log(`              Type: ${eventAttrs['message.type']}`);
                    }
                  });
                  
                  if (span.events.length > 5) {
                    console.log(`            ... and ${span.events.length - 5} more events`);
                  }
                }
              });
            }
          });
        }
      });
    }
    
    console.log('─'.repeat(50));
    console.log(`✅ Trace processed! Waiting for next trace...\n`);
  }

  private extractAttributes(attributes: any[]): Record<string, any> {
    const result: Record<string, any> = {};
    attributes.forEach(attr => {
      if (attr.value) {
        result[attr.key] = attr.value.stringValue || attr.value.intValue || attr.value.boolValue;
      }
    });
    return result;
  }

  private handleLogs(req: any, res: any) {
    let body = '';
    
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      this.traces++; // Count logs as traces for stats
      const timestamp = new Date().toLocaleTimeString();
      
      console.log(`\n📋 [${timestamp}] CLAUDE LOGS #${this.traces} RECEIVED!`);
      console.log('─'.repeat(50));
      
      try {
        const logsData = JSON.parse(body);
        this.displayLogs(logsData);
      } catch (error) {
        console.log('📄 Raw logs data received');
        console.log(`   Size: ${body.length} bytes`);
        if (body.length < 500) {
          console.log(`   Content: ${body}`);
        }
      }
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('{\"partialSuccess\":{}}');
    });
  }

  private displayLogs(logsData: any) {
    if (logsData.resourceLogs) {
      logsData.resourceLogs.forEach((resourceLog: any, index: number) => {
        console.log(`📦 Resource Log ${index + 1}:`);
        
        // Service info
        if (resourceLog.resource?.attributes) {
          const attrs = this.extractAttributes(resourceLog.resource.attributes);
          console.log(`   🏷️  Service: ${attrs['service.name'] || 'claude-code'}`);
          if (attrs['service.version']) {
            console.log(`   📊 Version: ${attrs['service.version']}`);
          }
        }
        
        // Process scope logs
        if (resourceLog.scopeLogs) {
          resourceLog.scopeLogs.forEach((scopeLog: any) => {
            if (scopeLog.logRecords) {
              console.log(`   📋 Log Records: ${scopeLog.logRecords.length}`);
              
              scopeLog.logRecords.forEach((logRecord: any, logIndex: number) => {
                const attrs = this.extractAttributes(logRecord.attributes || []);
                
                console.log(`\n      📝 Log Record ${logIndex + 1}:`);
                console.log(`         Body: ${logRecord.body?.stringValue || 'N/A'}`);
                console.log(`         Severity: ${logRecord.severityText || 'INFO'}`);
                
                // Claude-specific attributes
                if (attrs['event.name']) {
                  console.log(`         🎯 Event: ${attrs['event.name']}`);
                }
                if (attrs['prompt_length'] || attrs['PROMPT_LENGTH']) {
                  console.log(`         💬 Prompt Length: ${attrs['prompt_length'] || attrs['PROMPT_LENGTH']}`);
                }
                if (attrs['model']) {
                  console.log(`         🤖 Model: ${attrs['model']}`);
                }
                if (attrs['cost_usd']) {
                  console.log(`         💰 Cost: $${attrs['cost_usd']}`);
                }
                if (attrs['duration_ms']) {
                  console.log(`         ⏱️  Duration: ${attrs['duration_ms']}ms`);
                }
                if (attrs['input_tokens']) {
                  console.log(`         📥 Input Tokens: ${attrs['input_tokens']}`);
                }
                if (attrs['output_tokens']) {
                  console.log(`         📤 Output Tokens: ${attrs['output_tokens']}`);
                }

                // FULL CONTENT DISPLAY - This is what you want to see!
                if (attrs['PROMPT_TEXT'] || attrs['prompt'] || attrs['full_prompt']) {
                  const fullPrompt = attrs['PROMPT_TEXT'] || attrs['prompt'] || attrs['full_prompt'];
                  console.log(`         💭 FULL PROMPT:`);
                  console.log(`            "${fullPrompt}"`);
                }
                if (attrs['RESPONSE_TEXT'] || attrs['response'] || attrs['full_response']) {
                  const fullResponse = attrs['RESPONSE_TEXT'] || attrs['response'] || attrs['full_response'];
                  console.log(`         💬 FULL RESPONSE:`);
                  console.log(`            "${fullResponse.substring(0, 200)}..."`);
                  console.log(`            (Total: ${fullResponse.length} characters)`);
                }
                if (attrs['test_session_id'] || attrs['sessionId'] || attrs['workflowId']) {
                  console.log(`         🆔 SESSION IDs:`);
                  if (attrs['test_session_id']) console.log(`            Test Session: ${attrs['test_session_id']}`);
                  if (attrs['sessionId']) console.log(`            Session ID: ${attrs['sessionId']}`);
                  if (attrs['workflowId']) console.log(`            Workflow ID: ${attrs['workflowId']}`);
                }
                if (attrs['claude.prompt'] || attrs['claude.response']) {
                  console.log(`         🤖 CLAUDE CONVERSATION:`);
                  if (attrs['claude.prompt']) {
                    console.log(`            Prompt: "${attrs['claude.prompt'].substring(0, 100)}..."`);
                  }
                  if (attrs['claude.response']) {
                    console.log(`            Response: "${attrs['claude.response'].substring(0, 100)}..."`);
                  }
                }

                // DEBUG: Show ALL attributes to help debug what's actually being sent
                console.log(`         🔍 DEBUG - ALL ATTRIBUTES (${Object.keys(attrs).length} total):`);
                Object.entries(attrs).forEach(([key, value]) => {
                  if (typeof value === 'string' && value.length > 100) {
                    console.log(`            ${key}: "${value.substring(0, 100)}..." (${value.length} chars)`);
                  } else {
                    console.log(`            ${key}: ${JSON.stringify(value)}`);
                  }
                });
              });
            }
          });
        }
      });
    }
    
    console.log('─'.repeat(50));
    console.log(`✅ Logs processed! Waiting for next logs...\\n`);
  }

  private handleMetrics(req: any, res: any) {
    let body = '';
    
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      this.traces++; // Count metrics as traces for stats
      const timestamp = new Date().toLocaleTimeString();
      
      console.log(`\n📊 [${timestamp}] CLAUDE METRICS #${this.traces} RECEIVED!`);
      console.log('─'.repeat(50));
      
      try {
        const metricsData = JSON.parse(body);
        this.displayMetrics(metricsData);
      } catch (error) {
        console.log('📄 Raw metrics data received');
        console.log(`   Size: ${body.length} bytes`);
        if (body.length < 500) {
          console.log(`   Content: ${body}`);
        }
      }
      
      res.writeHead(200, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end('{\"partialSuccess\":{}}');
    });
  }

  private displayMetrics(metricsData: any) {
    if (metricsData.resourceMetrics) {
      metricsData.resourceMetrics.forEach((resourceMetric: any, index: number) => {
        console.log(`📦 Resource Metrics ${index + 1}:`);
        
        // Service info
        if (resourceMetric.resource?.attributes) {
          const attrs = this.extractAttributes(resourceMetric.resource.attributes);
          console.log(`   🏷️  Service: ${attrs['service.name'] || 'claude-code'}`);
          if (attrs['service.version']) {
            console.log(`   📊 Version: ${attrs['service.version']}`);
          }
          if (attrs['session.id']) {
            console.log(`   🆔 Session: ${attrs['session.id']}`);
          }
        }
        
        // Process scope metrics
        if (resourceMetric.scopeMetrics) {
          resourceMetric.scopeMetrics.forEach((scopeMetric: any) => {
            if (scopeMetric.metrics) {
              console.log(`   📈 Metrics: ${scopeMetric.metrics.length}`);
              
              scopeMetric.metrics.forEach((metric: any, metricIndex: number) => {
                console.log(`\n      📊 Metric ${metricIndex + 1}: ${metric.name}`);
                console.log(`         Description: ${metric.description || 'N/A'}`);
                console.log(`         Unit: ${metric.unit || 'N/A'}`);
                
                // Handle different metric types
                if (metric.sum) {
                  console.log(`         Type: Sum`);
                  metric.sum.dataPoints?.forEach((dataPoint: any, dpIndex: number) => {
                    const attrs = this.extractAttributes(dataPoint.attributes || []);
                    console.log(`            📍 DataPoint ${dpIndex + 1}: ${dataPoint.asInt || dataPoint.asDouble || 'N/A'}`);
                    
                    // Claude-specific metric attributes
                    if (attrs['model']) {
                      console.log(`               🤖 Model: ${attrs['model']}`);
                    }
                    if (attrs['type']) {
                      console.log(`               🔖 Type: ${attrs['type']}`);
                    }
                    if (attrs['tool']) {
                      console.log(`               🔧 Tool: ${attrs['tool']}`);
                    }
                    if (attrs['decision']) {
                      console.log(`               ⚖️  Decision: ${attrs['decision']}`);
                    }
                  });
                }
                
                if (metric.gauge) {
                  console.log(`         Type: Gauge`);
                  metric.gauge.dataPoints?.forEach((dataPoint: any, dpIndex: number) => {
                    console.log(`            📍 DataPoint ${dpIndex + 1}: ${dataPoint.asInt || dataPoint.asDouble || 'N/A'}`);
                  });
                }
              });
            }
          });
        }
      });
    }
    
    console.log('─'.repeat(50));
    console.log(`✅ Metrics processed! Waiting for next metrics...\\n`);
  }

  private calculateDuration(startNano: string, endNano: string): number {
    try {
      const start = parseInt(startNano);
      const end = parseInt(endNano);
      return Math.round((end - start) / 1_000_000);
    } catch {
      return 0;
    }
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  new ConsoleOTELReceiver().start();
}