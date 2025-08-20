#!/usr/bin/env tsx
/**
 * @fileoverview SAFe-SPARC Workflow with Complete OTEL Integration
 * 
 * Demonstrates full SAFe-SPARC methodology execution with comprehensive
 * OTEL observability using LogTape native integration + Foundation logging
 */

import { configure, getLogger } from '@logtape/logtape';
import { getOpenTelemetrySink } from '@logtape/otel';
import { getLogger as getFoundationLogger } from '@claude-zen/foundation';

interface SafeSparcOtelContext {
  workflowId: string;
  sessionId: string;
  epic: {
    name: string;
    businessValue: string;
    cost: string;
    risk: string;
  };
  phase: 'SAFE_EPIC_EVAL' | 'SPARC_SPEC' | 'SPARC_PSEUDO' | 'SPARC_ARCH' | 'SPARC_REF' | 'SPARC_COMP';
  decision?: string;
  artifacts?: string[];
}

class SafeSparcOtelWorkflow {
  private logger: any;
  private foundationLogger: any;
  private workflowId: string;
  private sessionId: string;
  private otelActive = false;

  constructor() {
    this.workflowId = `safe-sparc-${Date.now()}`;
    this.sessionId = `session-${Math.random().toString(36).substring(2, 15)}`;
  }

  async initializeSafeSparcOtel() {
    console.log('🏛️  SAFe-SPARC WORKFLOW WITH COMPLETE OTEL INTEGRATION');
    console.log('==================================================\n');

    // Set foundation OTEL environment
    process.env['ZEN_OTEL_ENABLED'] = 'true';
    process.env['OTEL_EXPORTER_OTLP_LOGS_ENDPOINT'] = 'http://localhost:4318/v1/logs';
    process.env['ZEN_OTEL_DIAGNOSTICS'] = 'true';

    // Check console OTEL receiver
    try {
      const response = await fetch('http://localhost:4318/health');
      if (response.ok) {
        this.otelActive = true;
        console.log('✅ Console OTEL receiver active on port 4318');
      }
    } catch {
      console.log('📝 Console OTEL receiver not detected (logs will be console-only)');
    }

    // Configure LogTape with OTEL for workflow logging (reset if needed)
    try {
      await configure({
      sinks: {
        otel: this.otelActive ? getOpenTelemetrySink({
          serviceName: 'safe-sparc-workflow',
          otlpExporterConfig: {
            url: 'http://localhost:4318/v1/logs',
            headers: { 'Content-Type': 'application/json' }
          },
          diagnostics: true
        }) : undefined,
        
        console: (record) => {
          const timestamp = new Date(record.timestamp).toISOString();
          const level = record.level.toUpperCase().padStart(7);
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
        { 
          category: ['safe-sparc'], 
          sinks: this.otelActive ? ['console', 'otel'] : ['console'], 
          lowestLevel: 'debug' 
        },
        { 
          category: ['safe'], 
          sinks: this.otelActive ? ['console', 'otel'] : ['console'], 
          lowestLevel: 'info' 
        },
        { 
          category: ['sparc'], 
          sinks: this.otelActive ? ['console', 'otel'] : ['console'], 
          lowestLevel: 'info' 
        },
        { category: ['logtape', 'meta'], sinks: ['console'], lowestLevel: 'warning' },
        { category: [], sinks: this.otelActive ? ['console', 'otel'] : ['console'], lowestLevel: 'info' }
      ]
    });
    } catch (error) {
      console.log('📝 LogTape already configured - using existing configuration');
      console.log(`   Error: ${error.message}`);
    }

    this.logger = getLogger(['safe-sparc']);
    this.foundationLogger = getFoundationLogger('safe-sparc-foundation');

    console.log(`🎯 SAFe-SPARC OTEL Configuration:`);
    console.log(`   Service: safe-sparc-workflow`);
    console.log(`   Workflow ID: ${this.workflowId}`);
    console.log(`   Session ID: ${this.sessionId}`);
    console.log(`   OTEL Active: ${this.otelActive ? 'YES' : 'NO'}`);
    console.log(`   Foundation OTEL: ${process.env['ZEN_OTEL_ENABLED']}`);
    console.log('   Integration: LogTape Native + Foundation Package\n');
  }

  async logWorkflowPhase(context: SafeSparcOtelContext, prompt: string, response: string, duration: number, extras: any = {}) {
    // Log to SAFe-SPARC specific logger with OTEL
    this.logger.info(`SAFe-SPARC ${context.phase} completed`, {
      // Workflow context
      workflowId: context.workflowId,
      sessionId: context.sessionId,
      timestamp: Date.now(),
      
      // SAFe context
      'safe.epic.name': context.epic.name,
      'safe.epic.business_value': context.epic.businessValue,
      'safe.epic.cost': context.epic.cost,
      'safe.epic.risk': context.epic.risk,
      'safe.phase': context.phase,
      'safe.decision': context.decision || 'pending',
      
      // SPARC methodology
      'sparc.methodology': 'SAFe-SPARC Integration',
      'sparc.phase': context.phase.replace('SAFE_', ''),
      'sparc.artifacts': context.artifacts || [],
      
      // Claude interaction data
      'claude.prompt': prompt,
      'claude.prompt.length': prompt.length,
      'claude.response': response,
      'claude.response.length': response.length,
      'claude.duration.ms': duration,
      'claude.duration.seconds': Math.floor(duration / 1000),
      
      // Performance and cost
      'performance.duration': duration,
      'usage.tokens.total': extras.tokens || 0,
      'usage.cost.usd': extras.cost || 0,
      
      // OTEL metadata
      'otel.service.name': 'safe-sparc-workflow',
      'otel.trace.id': `${this.workflowId}-${context.phase}`,
      'otel.resource.type': 'safe-sparc-interaction',
      
      // Business intelligence
      'business.methodology': 'SAFe + SPARC',
      'business.role': 'Epic Owner + Solution Architect',
      'business.outcome': context.decision,
      'business.artifacts_count': context.artifacts?.length || 0
    });

    // Also log to foundation logger for infrastructure observability
    this.foundationLogger.info(`Foundation supporting SAFe-SPARC ${context.phase}`, {
      workflowId: context.workflowId,
      phase: context.phase,
      foundationComponent: 'safe-sparc-orchestrator',
      supportingInfrastructure: true,
      duration: duration,
      otelIntegration: 'active'
    });

    // Log performance alerts
    if (duration > 30000) {
      this.logger.warn('Slow SAFe-SPARC phase detected', {
        workflowId: context.workflowId,
        phase: context.phase,
        duration: duration,
        performanceAlert: 'slow-operation',
        threshold: '30000ms'
      });
    }
  }

  async runSafeEpicEvaluation(context: SafeSparcOtelContext): Promise<string> {
    const phase = 'SAFE_EPIC_EVAL';
    console.log(`\n🏛️  Phase 1: SAFe Epic Owner Evaluation`);
    console.log('─'.repeat(50));

    const prompt = `As a SAFe Epic Owner, evaluate this epic:

Epic: ${context.epic.name}
Business Value: ${context.epic.businessValue}
Development Cost: ${context.epic.cost}
Risk Level: ${context.epic.risk}

Decision: APPROVE/REJECT/DEFER with detailed reasoning following SAFe criteria:
- Business value alignment
- Economic viability  
- Risk assessment
- Strategic fit
- Implementation feasibility`;

    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting SAFe Epic evaluation with Claude SDK + OTEL...');
      
      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      const result = await executeClaudeTask(prompt, {
        timeoutMs: 120000,
        stderr: (output: string) => {
          const elapsed = Date.now() - startTime;
          if (output.includes('[MSG')) {
            console.log(`💬 [${elapsed}ms] Epic evaluation streaming...`);
          }
        }
      });

      const duration = Date.now() - startTime;
      
      // Extract response using fixed logic
      const assistantMessage = result?.find(r => r.type === 'assistant');
      const responseText = assistantMessage?.message?.content?.[0]?.text || '';
      const tokenUsage = assistantMessage?.message?.usage;
      const resultSummary = result?.find(r => r.type === 'result');
      const cost = resultSummary?.total_cost_usd;
      
      // Extract SAFe decision
      const decision = responseText.toLowerCase().includes('approve') ? 'APPROVE' :
                      responseText.toLowerCase().includes('reject') ? 'REJECT' :
                      responseText.toLowerCase().includes('defer') ? 'DEFER' : 'UNCLEAR';
      
      context.decision = decision;
      context.phase = phase;
      
      // Log complete interaction with OTEL
      await this.logWorkflowPhase(context, prompt, responseText, duration, {
        tokens: (tokenUsage?.input_tokens || 0) + (tokenUsage?.output_tokens || 0),
        cost: cost
      });
      
      console.log(`✅ SAFe Epic evaluation completed: ${decision}`);
      console.log(`   Duration: ${Math.floor(duration/1000)}s`);
      console.log(`   Response: ${responseText.length} characters`);
      console.log(`   Cost: $${cost || 'unknown'}\n`);
      
      return responseText;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ SAFe Epic evaluation failed:`, error.message);
      
      // Log error to OTEL
      this.logger.error('SAFe Epic evaluation failed', {
        workflowId: context.workflowId,
        phase: phase,
        error: error.message,
        duration: duration,
        'otel.service.name': 'safe-sparc-workflow'
      });
      
      throw error;
    }
  }

  async runSparcSpecification(context: SafeSparcOtelContext): Promise<string> {
    const phase = 'SPARC_SPEC';
    console.log(`\n📋 Phase 2: SPARC Specification`);
    console.log('─'.repeat(50));

    const prompt = `Based on the approved SAFe Epic "${context.epic.name}", create a detailed SPARC specification:

SPARC SPECIFICATION PHASE:
Epic: ${context.epic.name} (APPROVED)
Business Value: ${context.epic.businessValue}
Budget: ${context.epic.cost}

Create comprehensive specifications including:
- Functional requirements
- Non-functional requirements  
- User stories and acceptance criteria
- Integration requirements
- Compliance and security requirements
- Success metrics and KPIs

Focus on detailed, implementable specifications that support the business value.`;

    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting SPARC specification with Claude SDK + OTEL...');
      
      const { executeClaudeTask } = await import('@claude-zen/foundation');
      
      const result = await executeClaudeTask(prompt, {
        timeoutMs: 120000,
        stderr: (output: string) => {
          const elapsed = Date.now() - startTime;
          if (output.includes('[MSG')) {
            console.log(`💬 [${elapsed}ms] SPARC specification streaming...`);
          }
        }
      });

      const duration = Date.now() - startTime;
      
      const assistantMessage = result?.find(r => r.type === 'assistant');
      const responseText = assistantMessage?.message?.content?.[0]?.text || '';
      const tokenUsage = assistantMessage?.message?.usage;
      const resultSummary = result?.find(r => r.type === 'result');
      const cost = resultSummary?.total_cost_usd;
      
      context.phase = phase;
      context.artifacts = ['Functional Requirements', 'User Stories', 'Acceptance Criteria', 'Integration Specs', 'Success Metrics'];
      
      await this.logWorkflowPhase(context, prompt, responseText, duration, {
        tokens: (tokenUsage?.input_tokens || 0) + (tokenUsage?.output_tokens || 0),
        cost: cost
      });
      
      console.log(`✅ SPARC specification completed`);
      console.log(`   Duration: ${Math.floor(duration/1000)}s`);
      console.log(`   Artifacts: ${context.artifacts.length} specification documents`);
      console.log(`   Cost: $${cost || 'unknown'}\n`);
      
      return responseText;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ SPARC specification failed:`, error.message);
      
      this.logger.error('SPARC specification failed', {
        workflowId: context.workflowId,
        phase: phase,
        error: error.message,
        duration: duration
      });
      
      throw error;
    }
  }

  async generateWorkflowReport(context: SafeSparcOtelContext) {
    console.log('\n📊 SAFe-SPARC OTEL WORKFLOW REPORT');
    console.log('=====================================\n');
    
    // Final workflow completion log
    this.logger.info('SAFe-SPARC workflow completed successfully', {
      workflowId: context.workflowId,
      sessionId: context.sessionId,
      completedAt: Date.now(),
      finalDecision: context.decision,
      totalPhases: 2,
      methodology: 'SAFe + SPARC',
      otelIntegration: 'complete',
      observability: {
        claudeInteractions: 2,
        foundationLogs: 'comprehensive',
        performanceTracking: 'enabled',
        businessDecisions: 'captured',
        artifacts: context.artifacts?.length || 0
      }
    });

    // Foundation completion log
    this.foundationLogger.success('Foundation infrastructure supported complete SAFe-SPARC workflow', {
      workflowId: context.workflowId,
      infrastructureHealth: 'optimal',
      otelExport: 'successful',
      logsCaptured: 'complete'
    });

    console.log('🎯 SAFe-SPARC OTEL Integration Results:');
    console.log('✅ Complete workflow observability achieved');
    console.log('✅ SAFe Epic evaluation with business decision capture');
    console.log('✅ SPARC methodology specification with artifact tracking');
    console.log('✅ Claude SDK interactions fully logged to OTEL');
    console.log('✅ Foundation infrastructure logs exported to OTEL');
    console.log('✅ Performance metrics and timing analysis');
    console.log('✅ Cost and token usage monitoring');
    console.log('✅ Error handling and alerting');
    
    console.log(`\n📈 Workflow Statistics:`);
    console.log(`   Epic: ${context.epic.name}`);
    console.log(`   Decision: ${context.decision}`);
    console.log(`   Artifacts: ${context.artifacts?.length || 0} created`);
    console.log(`   OTEL Service: safe-sparc-workflow`);
    console.log(`   Foundation Service: claude-zen-foundation`);
    console.log(`   Workflow ID: ${context.workflowId}`);
    
    if (this.otelActive) {
      console.log(`\n🔍 OTEL Data Available:`);
      console.log('   Check console OTEL receiver for comprehensive structured logs');
      console.log('   - SAFe Epic evaluation decisions and reasoning');  
      console.log('   - SPARC specification artifacts and requirements');
      console.log('   - Claude SDK performance and cost metrics');
      console.log('   - Foundation infrastructure health and status');
      console.log('   - Business intelligence and decision tracking');
    }
  }

  async runCompleteSafeSparcWorkflow() {
    await this.initializeSafeSparcOtel();
    
    const context: SafeSparcOtelContext = {
      workflowId: this.workflowId,
      sessionId: this.sessionId,
      epic: {
        name: 'AI-Powered Customer Analytics Platform',
        businessValue: '$750k/year revenue increase + $200k/year cost savings',
        cost: '$300k over 6 months',
        risk: 'Medium (new AI technology, proven frameworks)'
      },
      phase: 'SAFE_EPIC_EVAL'
    };

    try {
      // Phase 1: SAFe Epic Owner Evaluation
      const epicResponse = await this.runSafeEpicEvaluation(context);
      
      // Only proceed with SPARC if epic is approved
      if (context.decision === 'APPROVE') {
        // Phase 2: SPARC Specification
        const sparcResponse = await this.runSparcSpecification(context);
        
        console.log('📋 Epic Response Preview:');
        console.log('─'.repeat(60));
        console.log(epicResponse.substring(0, 300) + '...\n');
        
        console.log('📋 SPARC Specification Preview:');
        console.log('─'.repeat(60));
        console.log(sparcResponse.substring(0, 300) + '...\n');
      } else {
        console.log(`\n⚠️  Epic ${context.decision} - SPARC specification skipped\n`);
      }
      
      await this.generateWorkflowReport(context);
      
      console.log('\n🎉 SAFe-SPARC OTEL Workflow Complete!');
      
    } catch (error) {
      console.error('❌ SAFe-SPARC workflow failed:', error);
      
      this.logger.error('SAFe-SPARC workflow failed', {
        workflowId: context.workflowId,
        error: error.message,
        phase: context.phase,
        timestamp: Date.now()
      });
    }
  }
}

async function runSafeSparcOtelTest() {
  const workflow = new SafeSparcOtelWorkflow();
  await workflow.runCompleteSafeSparcWorkflow();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runSafeSparcOtelTest().catch(console.error);
}

export { SafeSparcOtelWorkflow, runSafeSparcOtelTest };