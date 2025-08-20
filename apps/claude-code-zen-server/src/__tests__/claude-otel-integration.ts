#!/usr/bin/env tsx
/**
 * @fileoverview Claude SDK with OpenTelemetry Integration
 * 
 * Demonstrates how to integrate Claude SDK with OTEL for production monitoring
 */

// Simulated OTEL integration (would use @opentelemetry packages in production)
interface OTELSpan {
  name: string;
  startTime: number;
  endTime?: number;
  attributes: Record<string, any>;
  status: 'ok' | 'error';
  events: Array<{
    name: string;
    timestamp: number;
    attributes: Record<string, any>;
  }>;
}

class MockOTELTracer {
  private spans: OTELSpan[] = [];
  
  startSpan(name: string, attributes: Record<string, any> = {}): OTELSpan {
    const span: OTELSpan = {
      name,
      startTime: Date.now(),
      attributes,
      status: 'ok',
      events: []
    };
    this.spans.push(span);
    return span;
  }
  
  addEvent(span: OTELSpan, name: string, attributes: Record<string, any> = {}) {
    span.events.push({
      name,
      timestamp: Date.now(),
      attributes
    });
  }
  
  endSpan(span: OTELSpan, status: 'ok' | 'error' = 'ok') {
    span.endTime = Date.now();
    span.status = status;
  }
  
  exportSpans() {
    return this.spans;
  }
}

async function claudeWithOTELIntegration() {
  console.log('📡 Claude SDK with OpenTelemetry Integration');
  console.log('===========================================\n');

  const tracer = new MockOTELTracer();
  
  // Create main operation span
  const mainSpan = tracer.startSpan('safe_epic_evaluation', {
    'service.name': 'claude-zen-safe-sparc',
    'service.version': '2.1.0',
    'safe.role': 'epic_owner',
    'sparc.phase': 'specification'
  });

  try {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    const prompt = `As a SAFe Epic Owner, evaluate this proposal:

Epic: Customer Analytics Platform
Business Value: $750k/year increase in revenue
Development Cost: $250k
Timeline: 4 months
Risk: Medium

Provide structured evaluation with decision.`;

    tracer.addEvent(mainSpan, 'prompt_prepared', {
      'prompt.length': prompt.length,
      'prompt.type': 'safe_epic_evaluation'
    });

    console.log('🚀 Making Claude SDK call with OTEL tracing...\n');
    
    let messageCount = 0;
    let firstToken = false;
    
    const result = await executeClaudeTask(prompt, {
      timeoutMs: 120000,
      stderr: (output: string) => {
        messageCount++;
        const elapsed = Date.now() - mainSpan.startTime;
        
        if (!firstToken) {
          tracer.addEvent(mainSpan, 'first_token_received', {
            'response.time_to_first_token_ms': elapsed
          });
          firstToken = true;
          console.log(`🎯 First token: ${elapsed}ms`);
        }
        
        // Categorize and track different message types
        let messageType = 'debug';
        if (output.includes('Starting Claude')) messageType = 'startup';
        else if (output.includes('[SYSTEM]')) messageType = 'system';  
        else if (output.includes('[MSG')) messageType = 'message';
        else if (output.includes('[RESULT]')) messageType = 'result';
        
        tracer.addEvent(mainSpan, `claude_${messageType}`, {
          'message.elapsed_ms': elapsed,
          '(message as any)?.content': output.substring(0, 100), // Truncate for OTEL
          'message.sequence': messageCount
        });
        
        console.log(`📝 [${elapsed}ms] ${messageType.toUpperCase()}: ${output.substring(0, 80)}...`);
      }
    });
    
    tracer.addEvent(mainSpan, 'response_completed', {
      'response.total_messages': messageCount,
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
        
        tracer.addEvent(mainSpan, 'decision_extracted', {
          'safe.decision': decision,
          'response.length': text.length
        });
        
        console.log(`\n🏛️ SAFe Decision: ${decision.toUpperCase()}`);
        console.log('═'.repeat(60));
        console.log(text);
        console.log('═'.repeat(60));
      }
    }
    
    tracer.endSpan(mainSpan, 'ok');
    
    // Export OTEL data for learning
    const spans = tracer.exportSpans();
    const mainSpanData = spans[0];
    const totalTime = mainSpanData.endTime! - mainSpanData.startTime;
    
    console.log(`\n📊 OTEL Performance Metrics:`);
    console.log(`   Total duration: ${totalTime}ms`);
    console.log(`   Events tracked: ${mainSpanData.events.length}`);
    console.log(`   Status: ${mainSpanData.status}`);
    
    // Show structured OTEL data for learning systems
    console.log('\n🔍 OTEL TRACE DATA FOR LEARNING:');
    console.log(JSON.stringify({
      trace_id: 'mock-trace-12345',
      span_id: 'mock-span-67890',
      operation_name: mainSpanData.name,
      start_time: mainSpanData.startTime,
      duration_ms: totalTime,
      status: mainSpanData.status,
      attributes: mainSpanData.attributes,
      key_events: mainSpanData.events.map(e => ({
        name: e.name,
        timestamp: e.timestamp,
        key_attributes: e.attributes
      }))
    }, null, 2));
    
    console.log('\n🎊 OTEL integration test completed successfully!');
    return { spans, result };
    
  } catch (error) {
    tracer.addEvent(mainSpan, 'error_occurred', {
      'error.message': error.message,
      'error.type': error.constructor.name
    });
    tracer.endSpan(mainSpan, 'error');
    
    console.error('\n❌ OTEL integration test failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  claudeWithOTELIntegration().catch(console.error);
}

export { claudeWithOTELIntegration };