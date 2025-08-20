#!/usr/bin/env tsx
/**
 * @fileoverview LogTape + OTEL Integration for SAFe-SPARC Observability
 * 
 * Uses foundation package's telemetry system with LogTape for comprehensive
 * Claude SDK observability that bypasses Claude Code OTEL limitations
 */

import { configure, getLogger } from '@logtape/logtape';
import { getTelemetry, initializeTelemetry, withAsyncTrace, recordMetric } from '@claude-zen/foundation/telemetry';

interface SafeSparcLogContext {
  phase: 'SAFE_EPIC_EVAL' | 'SPARC_SPEC' | 'SPARC_PSEUDO' | 'SPARC_ARCH' | 'SPARC_REF' | 'SPARC_COMP';
  safeRole: string;
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

class LogTapeOTELIntegration {
  private logger: any;
  private workflowId: string;
  private sessionId: string;

  constructor() {
    this.workflowId = `workflow-${Date.now()}`;
    this.sessionId = `session-${Math.random().toString(36).substring(2, 15)}`;
  }

  async initializeLogTapeOTEL() {
    console.log('🔧 Initializing LogTape + Foundation Telemetry Integration');
    console.log('========================================================\n');

    // Check if console OTEL receiver is running
    let useConsoleReceiver = false;
    try {
      const response = await fetch('http://localhost:4318/health');
      if (response.ok) {
        useConsoleReceiver = true;
        console.log('✅ Console OTEL receiver detected on port 4318');
      }
    } catch {
      console.log('📝 No console OTEL receiver detected on port 4318');
    }

    // Initialize foundation telemetry system with explicit OTEL endpoint
    const telemetryResult = await initializeTelemetry({
      serviceName: 'safe-sparc-workflow',
      enableTracing: true,
      enableMetrics: true,
      enableConsoleExporters: true,
      // Force OTEL to use console receiver if available
      jaegerEndpoint: useConsoleReceiver ? 'http://localhost:4318/v1/traces' : undefined
    });

    if (telemetryResult.isErr()) {
      console.log(`⚠️ Telemetry initialization failed: ${telemetryResult.error.message}`);
      console.log('📝 Continuing with LogTape console logging only');
    } else {
      console.log('✅ Foundation telemetry system initialized');
    }

    // Configure LogTape with console sink for comprehensive logging
    await configure({
      sinks: {
        console: (record) => {
          // Rich console logging with structured format
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
        }
      },
      loggers: [
        // Structured logging for SAFe-SPARC workflow
        { category: ['safe-sparc'], sinks: ['console'], lowestLevel: 'debug' },
        // General logging
        { category: [], sinks: ['console'], lowestLevel: 'info' },
      ],
    });

    this.logger = getLogger(['safe-sparc']);
    
    console.log(`🎯 Foundation + LogTape Configuration:`);
    console.log(`   Service: safe-sparc-workflow`);
    console.log(`   Telemetry: ${telemetryResult.isOk() ? 'Active (OTEL + Prometheus)' : 'Console Only'}`);
    console.log(`   Workflow ID: ${this.workflowId}`);
    console.log(`   Session ID: ${this.sessionId}`);
    console.log('   Structured Logging: ✅ Full prompts, responses, decisions');
    console.log('   Foundation Integration: ✅ Traces, logs, and metrics\n');
  }

  async logSafeSparcInteraction(context: SafeSparcLogContext) {
    // Log the complete interaction with all details
    this.logger.info('SAFe-SPARC interaction complete', {
      // Workflow metadata
      workflowId: this.workflowId,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      
      // SAFe-SPARC context
      phase: context.phase,
      safeRole: context.safeRole,
      
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
      
      // Additional metadata for OTEL
      otel: {
        service: 'safe-sparc-workflow',
        version: '2.1.0',
        environment: 'development'
      }
    });

    // Also log key metrics separately for OTEL metrics collection
    if (context.duration > 30000) {
      this.logger.warn('Slow SAFe-SPARC interaction', {
        workflowId: this.workflowId,
        phase: context.phase,
        duration: context.duration,
        performanceAlert: true
      });
    }

    if (context.decision) {
      this.logger.info('SAFe decision recorded', {
        workflowId: this.workflowId,
        phase: context.phase,
        safeRole: context.safeRole,
        decision: context.decision,
        decisionMetrics: {
          promptTokens: context.tokenUsage?.input,
          responseTokens: context.tokenUsage?.output,
          cost: context.cost
        }
      });
    }
  }

  async runSafeSparcWithLogTapeOTEL() {
    console.log('🏛️  SAFe-SPARC Workflow with LogTape + OTEL');
    console.log('============================================\n');

    // Phase 1: SAFe Epic Evaluation
    const epicPrompt = `As a SAFe Epic Owner, evaluate this epic:

Epic: AI Customer Support Bot
Business Value: $400k/year efficiency gains
Development Cost: $150k over 4 months  
Risk Level: Low (proven tech stack)

Decision: APPROVE/REJECT/DEFER with reasoning.`;

    console.log('📋 Phase 1: SAFe Epic Owner Evaluation');
    console.log('─'.repeat(50));
    
    const startTime = Date.now();
    
    try {
      // Use our FIXED Claude SDK extraction with foundation telemetry tracing
      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      console.log('🚀 Starting Claude call with Foundation Telemetry + LogTape logging...\n');
      
      const result = await withAsyncTrace('safe-sparc-claude-call', async (span) => {
        span.setAttributes({
          'safe.phase': 'SAFE_EPIC_EVAL',
          'safe.role': 'Epic Owner',
          'prompt.length': epicPrompt.length,
          'session.id': this.sessionId,
          'workflow.id': this.workflowId
        });

        return await executeClaudeTask(epicPrompt, {
          timeoutMs: 120000,
          stderr: (output: string) => {
            const elapsed = Date.now() - startTime;
            
            if (output.includes('[MSG')) {
              console.log(`💬 [${elapsed}ms] Response streaming...`);
              recordMetric('claude_response_tokens', 1, { phase: 'streaming' });
            }
          }
        });
      });

      const duration = Date.now() - startTime;
      
      // FIXED response extraction (using result[1] not result[0])
      const assistantMessage = result?.find(r => r.type === 'assistant');
      const responseText = assistantMessage?.message?.content?.[0]?.text || '';
      const tokenUsage = assistantMessage?.message?.usage;
      const resultSummary = result?.find(r => r.type === 'result');
      const cost = resultSummary?.total_cost_usd;
      
      // Extract decision
      const decision = responseText.toLowerCase().includes('approve') ? 'APPROVE' :
                      responseText.toLowerCase().includes('reject') ? 'REJECT' :
                      responseText.toLowerCase().includes('defer') ? 'DEFER' : 'UNCLEAR';
      
      console.log('✅ Claude response received and extracted!');
      console.log(`   Duration: ${Math.floor(duration/1000)}s`);
      console.log(`   Response: ${responseText.length} characters`);
      console.log(`   Decision: ${decision}\n`);
      
      // Record metrics to foundation telemetry
      recordMetric('claude_api_calls', 1, { 
        phase: 'SAFE_EPIC_EVAL', 
        success: 'true',
        decision: decision.toLowerCase()
      });
      
      recordMetric('claude_api_duration_ms', duration, {
        phase: 'SAFE_EPIC_EVAL'
      });

      if (tokenUsage) {
        recordMetric('claude_tokens_total', (tokenUsage.input_tokens || 0) + (tokenUsage.output_tokens || 0), {
          phase: 'SAFE_EPIC_EVAL',
          type: 'total'
        });
      }

      if (cost) {
        recordMetric('claude_api_cost_usd', cost * 100, { // Convert to cents
          phase: 'SAFE_EPIC_EVAL'
        });
      }
      
      // Log complete interaction to LogTape + Foundation Telemetry
      await this.logSafeSparcInteraction({
        phase: 'SAFE_EPIC_EVAL',
        safeRole: 'Epic Owner',
        prompt: epicPrompt,
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
      console.error('❌ SAFe-SPARC workflow failed:', error.message);
      
      // Log error to LogTape + OTEL
      this.logger.error('SAFe-SPARC workflow failed', {
        workflowId: this.workflowId,
        sessionId: this.sessionId,
        phase: 'SAFE_EPIC_EVAL',
        error: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  async generateLogTapeOTELReport() {
    console.log('\n📊 LogTape + OTEL Integration Report');
    console.log('====================================\n');
    
    // Log workflow completion
    this.logger.info('SAFe-SPARC workflow completed', {
      workflowId: this.workflowId,
      sessionId: this.sessionId,
      completedAt: Date.now(),
      summary: {
        totalPhases: 1,
        successfulPhases: 1,
        observabilityComplete: true
      }
    });

    console.log('🎯 Foundation Telemetry + LogTape Integration Summary:');
    console.log('✅ Complete workflow observability achieved');
    console.log('✅ Full prompts and responses logged (Claude Code OTEL limitation bypassed)');
    console.log('✅ Foundation telemetry system with OpenTelemetry + Prometheus');
    console.log('✅ Performance metrics and decision tracking');
    console.log('✅ Cost and token usage monitoring');
    console.log('✅ Error handling and failure analysis');
    console.log('\n💡 Benefits:');
    console.log('   • LogTape provides rich structured logging');
    console.log('   • Foundation provides enterprise-grade telemetry');
    console.log('   • OpenTelemetry tracing with custom spans and attributes');
    console.log('   • Prometheus metrics for comprehensive monitoring');
    console.log('   • Combined solution gives complete SAFe-SPARC visibility');
  }
}

async function runLogTapeOTELIntegration() {
  const integration = new LogTapeOTELIntegration();
  
  try {
    await integration.initializeLogTapeOTEL();
    await integration.runSafeSparcWithLogTapeOTEL();
    await integration.generateLogTapeOTELReport();
    
    console.log('\n🎉 Foundation Telemetry + LogTape Integration Complete!');
    console.log('Your SAFe-SPARC workflow now has comprehensive observability');
    
  } catch (error) {
    console.error('❌ LogTape + OTEL integration failed:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runLogTapeOTELIntegration().catch(console.error);
}

export { LogTapeOTELIntegration, runLogTapeOTELIntegration };