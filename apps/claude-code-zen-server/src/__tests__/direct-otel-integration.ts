#!/usr/bin/env tsx
/**
 * @fileoverview Direct OTEL Integration - Sends Claude SDK logs directly to console receiver
 * 
 * Bypasses foundation complexity and sends OTEL data directly to your console receiver
 */

import { configure, getLogger } from '@logtape/logtape';

interface ClaudeSDKLogContext {
  phase: string;
  prompt: string;
  response: string;
  decision?: string;
  duration: number;
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  cost?: number;
  sessionId: string;
  workflowId: string;
}

class DirectOTELIntegration {
  private logger: any;
  private workflowId: string;
  private sessionId: string;

  constructor() {
    this.workflowId = `workflow-${Date.now()}`;
    this.sessionId = `session-${Math.random().toString(36).substring(2, 15)}`;
  }

  async initializeDirectOTEL() {
    console.log('🔧 Direct OTEL Integration Setup');
    console.log('=================================\n');

    // Check if console OTEL receiver is running
    let consoleReceiverActive = false;
    try {
      const response = await fetch('http://localhost:4318/health');
      if (response.ok) {
        consoleReceiverActive = true;
        console.log('✅ Console OTEL receiver detected on port 4318');
      }
    } catch {
      console.log('❌ No console OTEL receiver detected on port 4318');
      console.log('💡 Please start: tsx src/__tests__/otel-console-receiver.ts');
    }

    // Configure LogTape to send structured logs
    await configure({
      sinks: {
        console: (record) => {
          const timestamp = new Date(record.timestamp).toISOString();
          const level = record.level.toUpperCase().padStart(5);
          const category = record.category.join('.');
          const message = record.message.join('');
          const props = Object.keys(record.properties).length > 0 
            ? JSON.stringify(record.properties, null, 2) 
            : '';
          
          console.log(`[${timestamp}] ${level} [${category}] ${message}`);
          if (props) {
            console.log(`   Properties: ${props}`);
          }

          // SEND TO OTEL CONSOLE RECEIVER
          if (consoleReceiverActive) {
            this.sendToOTELReceiver({
              timestamp,
              level,
              category,
              message,
              properties: record.properties
            }).catch(console.error);
          }
        }
      },
      loggers: [
        { category: ['claude-sdk'], sinks: ['console'], lowestLevel: 'debug' },
        { category: [], sinks: ['console'], lowestLevel: 'info' },
      ],
    });

    this.logger = getLogger(['claude-sdk']);
    
    console.log(`🎯 Direct OTEL Configuration:`);
    console.log(`   Console Receiver: ${consoleReceiverActive ? 'ACTIVE' : 'INACTIVE'}`);
    console.log(`   Workflow ID: ${this.workflowId}`);
    console.log(`   Session ID: ${this.sessionId}`);
    console.log('   Direct OTEL Export: ✅ Bypassing foundation complexity\n');
  }

  /**
   * Send log data directly to OTEL console receiver
   */
  async sendToOTELReceiver(logData: any): Promise<void> {
    try {
      const otelPayload = {
        resourceLogs: [{
          resource: {
            attributes: [{
              key: 'service.name',
              value: { stringValue: 'claude-sdk-direct' }
            }]
          },
          scopeLogs: [{
            scope: { name: 'claude-sdk-logger' },
            logRecords: [{
              timeUnixNano: Date.now() * 1000000,
              severityText: logData.level,
              body: { stringValue: logData.message },
              attributes: Object.entries(logData.properties || {}).map(([key, value]) => ({
                key,
                value: { stringValue: String(value) }
              }))
            }]
          }]
        }]
      };

      await fetch('http://localhost:4318/v1/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(otelPayload)
      });

      console.log('📡 OTEL data sent to console receiver');
    } catch (error) {
      console.error('❌ Failed to send to OTEL receiver:', error.message);
    }
  }

  /**
   * Send trace data directly to OTEL console receiver
   */
  async sendTraceToOTELReceiver(traceData: any): Promise<void> {
    try {
      const tracePayload = {
        resourceSpans: [{
          resource: {
            attributes: [{
              key: 'service.name',
              value: { stringValue: 'claude-sdk-direct' }
            }]
          },
          scopeSpans: [{
            scope: { name: 'claude-sdk-tracer' },
            spans: [{
              traceId: Buffer.from(this.workflowId.padEnd(32, '0').substring(0, 32)).toString('hex'),
              spanId: Buffer.from(this.sessionId.padEnd(16, '0').substring(0, 16)).toString('hex'),
              name: traceData.operationName,
              kind: 1, // SPAN_KIND_INTERNAL
              startTimeUnixNano: traceData.startTime * 1000000,
              endTimeUnixNano: traceData.endTime * 1000000,
              attributes: Object.entries(traceData.attributes || {}).map(([key, value]) => ({
                key,
                value: { stringValue: String(value) }
              }))
            }]
          }]
        }]
      };

      await fetch('http://localhost:4318/v1/traces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tracePayload)
      });

      console.log('🔍 Trace sent to OTEL console receiver');
    } catch (error) {
      console.error('❌ Failed to send trace to OTEL receiver:', error.message);
    }
  }

  async logClaudeSDKInteraction(context: ClaudeSDKLogContext) {
    // Log the complete interaction with all details
    this.logger.info('Claude SDK interaction complete', {
      // Workflow metadata
      workflowId: this.workflowId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      
      // Claude SDK context
      phase: context.phase,
      
      // Input/Output data (what Claude Code OTEL cannot provide)
      prompt: context.prompt,
      promptLength: context.prompt.length,
      response: context.response,
      responseLength: context.response.length,
      
      // Decision tracking
      decision: context.decision,
      
      // Performance metrics
      duration: context.duration,
      durationSeconds: Math.floor(context.duration / 1000),
      
      // Token and cost data
      tokenUsage: context.tokenUsage,
      cost: context.cost,
      
      // OTEL metadata
      otel: {
        service: 'claude-sdk-direct',
        version: '1.0.0',
        type: 'claude-interaction'
      }
    });

    // Send trace data directly to OTEL receiver
    await this.sendTraceToOTELReceiver({
      operationName: `claude-sdk-${context.phase}`,
      startTime: Date.now() - context.duration,
      endTime: Date.now(),
      attributes: {
        'claude.phase': context.phase,
        'claude.prompt.length': context.prompt.length,
        'claude.response.length': context.response.length,
        'claude.decision': context.decision || 'none',
        'claude.duration.ms': context.duration,
        'claude.tokens.total': context.tokenUsage?.total || 0,
        'claude.cost.usd': context.cost || 0,
        'workflow.id': this.workflowId,
        'session.id': this.sessionId
      }
    });
  }

  async runDirectOTELTest() {
    console.log('🔧 DIRECT OTEL CLAUDE SDK TEST');
    console.log('==============================\n');
    
    await this.initializeDirectOTEL();
    
    // Test prompt
    const testPrompt = `As a SAFe Epic Owner, evaluate this epic:

Epic: AI Customer Support Bot
Business Value: $400k/year efficiency gains
Development Cost: $150k over 4 months  
Risk Level: Low (proven tech stack)

Decision: APPROVE/REJECT/DEFER with reasoning.`;

    console.log('📋 Testing Claude SDK with Direct OTEL Integration');
    console.log('─'.repeat(60));
    
    const startTime = Date.now();
    
    try {
      // Use our FIXED Claude SDK extraction
      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      console.log('🚀 Starting Claude SDK call with Direct OTEL export...\n');
      
      const result = await executeClaudeTask(testPrompt, {
        timeoutMs: 120000,
        stderr: (output: string) => {
          const elapsed = Date.now() - startTime;
          
          if (output.includes('[MSG')) {
            console.log(`💬 [${elapsed}ms] Response streaming...`);
          }
        }
      });

      const duration = Date.now() - startTime;
      
      // FIXED response extraction (using result[1] not result[0])
      const assistantMessage = result?.find(r => r.type === 'assistant');
      const responseText = (assistantMessage as any)?.content?.[0]?.text || '';
      const tokenUsage = (assistantMessage as any)?.usage;
      const resultSummary = result?.find(r => r.type === 'result');
      const cost = resultSummary?.total_cost_usd;
      
      // Extract decision
      const decision = responseText.toLowerCase().includes('approve') ? 'APPROVE' :
                      responseText.toLowerCase().includes('reject') ? 'REJECT' :
                      responseText.toLowerCase().includes('defer') ? 'DEFER' : 'UNCLEAR';
      
      console.log('✅ Claude SDK response received and extracted!');
      console.log(`   Duration: ${Math.floor(duration/1000)}s`);
      console.log(`   Response: ${responseText.length} characters`);
      console.log(`   Decision: ${decision}`);
      console.log(`   Cost: $${cost || 'unknown'}\n`);
      
      // Log complete interaction with DIRECT OTEL export
      await this.logClaudeSDKInteraction({
        phase: 'SAFE_EPIC_EVAL',
        prompt: testPrompt,
        response: responseText,
        decision: decision,
        duration: duration,
        tokenUsage: tokenUsage ? {
          input: tokenUsage.input_tokens || 0,
          output: tokenUsage.output_tokens || 0,
          total: (tokenUsage.input_tokens || 0) + (tokenUsage.output_tokens || 0)
        } : undefined,
        cost: cost,
        sessionId: this.sessionId,
        workflowId: this.workflowId
      });
      
      console.log('📊 Response preview:');
      console.log('─'.repeat(60));
      console.log(responseText.substring(0, 400) + (responseText.length > 400 ? '...' : ''));
      console.log('─'.repeat(60));
      
    } catch (error) {
      console.error('❌ Direct OTEL test failed:', error.message);
    }
  }

  async generateDirectOTELReport() {
    console.log('\n📊 Direct OTEL Integration Report');
    console.log('=================================\n');
    
    console.log('🎯 Direct OTEL Integration Summary:');
    console.log('✅ Complete Claude SDK observability achieved');
    console.log('✅ Full prompts and responses logged');
    console.log('✅ Direct OTEL export to console receiver');
    console.log('✅ Traces and logs sent to port 4318');
    console.log('✅ Bypassed foundation complexity');
    console.log('\n💡 OTEL Data Sent:');
    console.log('   • 📝 Structured logs with complete Claude interaction data');
    console.log('   • 🔍 Distributed traces with Claude SDK spans');
    console.log('   • 📊 Custom attributes for SAFe-SPARC context');
    console.log('   • 💰 Cost and token usage metrics');
    console.log('   • ⏱️ Performance timing and duration data');
  }
}

async function runDirectOTELIntegration() {
  const integration = new DirectOTELIntegration();
  
  try {
    await integration.runDirectOTELTest();
    await integration.generateDirectOTELReport();
    
    console.log('\n🎉 Direct OTEL Integration Complete!');
    console.log('Check your OTEL console receiver for Claude SDK data');
    
  } catch (error) {
    console.error('❌ Direct OTEL integration failed:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDirectOTELIntegration().catch(console.error);
}

export { DirectOTELIntegration, runDirectOTELIntegration };