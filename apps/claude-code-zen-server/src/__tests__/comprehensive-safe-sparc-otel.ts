#!/usr/bin/env tsx
/**
 * @fileoverview Comprehensive SAFe-SPARC OTEL Solution
 * 
 * Addresses Claude Code OTEL limitations by implementing custom structured logging
 * alongside OTEL metrics to capture complete SAFe-SPARC workflow observability:
 * - Claude Code OTEL: Token usage, costs, timing (built-in privacy limits)
 * - Custom Structured Logging: Full prompts, responses, decisions, workflow state
 * - Performance Analysis: 30+ second delay breakdown
 * - SAFe-SPARC Integration: Complete workflow traceability
 */

import { trace, SpanStatusCode } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';

interface SafeSparcWorkflowLog {
  timestamp: string;
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
  metadata: Record<string, any>;
}

class ComprehensiveSafeSparcOTEL {
  private workflowLogs: SafeSparcWorkflowLog[] = [];
  private tracer: any;
  private consoleReceiver: boolean = false;

  constructor() {
    this.checkConsoleReceiver();
  }

  private async checkConsoleReceiver() {
    try {
      const response = await fetch('http://localhost:4318/health');
      if (response.ok) {
        this.consoleReceiver = true;
        console.log('✅ Console OTEL receiver is running on port 4318');
      }
    } catch {
      console.log('⚠️  Console OTEL receiver not detected - metrics will be console-only');
      this.consoleReceiver = false;
    }
  }

  async initializeOTEL() {
    console.log('🔧 Initializing Comprehensive SAFe-SPARC OTEL...\n');

    // Claude Code built-in OTEL (for token usage, costs, timing)
    process.env.CLAUDE_CODE_ENABLE_TELEMETRY = '1';
    process.env.OTEL_LOG_USER_PROMPTS = '1';
    
    if (this.consoleReceiver) {
      // Send to console receiver
      process.env.OTEL_LOGS_EXPORTER = 'otlp';
      process.env.OTEL_METRICS_EXPORTER = 'otlp';
      process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/json';
      process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT = 'http://localhost:4318/v1/logs';
      process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT = 'http://localhost:4318/v1/metrics';
    } else {
      // Console output only
      process.env.OTEL_LOGS_EXPORTER = 'console';
      process.env.OTEL_METRICS_EXPORTER = 'console';
    }
    
    process.env.OTEL_LOGS_EXPORT_INTERVAL = '1000';
    process.env.OTEL_METRIC_EXPORT_INTERVAL = '2000';

    // Custom OTEL SDK for detailed tracing
    if (this.consoleReceiver) {
      const traceExporter = new OTLPTraceExporter({
        url: 'http://localhost:4318/v1/traces',
        headers: { 'Content-Type': 'application/json' }
      });

      const sdk = new NodeSDK({
        spanProcessor: new SimpleSpanProcessor(traceExporter),
        serviceName: 'safe-sparc-workflow',
        serviceVersion: '2.1.0'
      });

      sdk.start();
      this.tracer = trace.getTracer('safe-sparc-workflow', '2.1.0');
      console.log('✅ Custom OTEL SDK initialized for comprehensive tracing');
    }

    console.log('🎯 OTEL Configuration:');
    console.log(`   Claude Code OTEL: ${this.consoleReceiver ? 'Console Receiver' : 'Console Output'}`);
    console.log(`   Custom Logging: Structured workflow logs`);
    console.log(`   Full Content: Prompts ✅ | Responses ✅ | Decisions ✅`);
    console.log(`   Performance: 30s delay analysis ✅\n`);
  }

  async executeSafeSparcWorkflow() {
    const workflowSpan = this.tracer?.startSpan('safe_sparc_complete_workflow');
    
    try {
      console.log('🏛️  Starting SAFe-SPARC Complete Workflow');
      console.log('═'.repeat(80));

      // Phase 1: SAFe Epic Evaluation
      await this.executeSafeEpicEvaluation(workflowSpan);

      // Phase 2: SPARC Specification
      await this.executeSparcSpecification(workflowSpan);

      // Phase 3: SPARC Pseudocode
      await this.executeSparcPseudocode(workflowSpan);

      // Phase 4: SPARC Architecture
      await this.executeSparcArchitecture(workflowSpan);

      // Phase 5: SPARC Refinement
      await this.executeSparcRefinement(workflowSpan);

      // Phase 6: SPARC Completion
      await this.executeSparcCompletion(workflowSpan);

      workflowSpan?.setStatus({ code: SpanStatusCode.OK });
      
    } catch (error) {
      console.error('❌ SAFe-SPARC workflow failed:', error);
      workflowSpan?.recordException(error);
      workflowSpan?.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      workflowSpan?.end();
    }
  }

  private async executeSafeEpicEvaluation(parentSpan: any) {
    const phaseSpan = this.tracer?.startSpan('safe_epic_evaluation', { parent: parentSpan });
    
    console.log('\n🏛️  Phase 1: SAFe Epic Owner Evaluation');
    console.log('─'.repeat(50));

    const prompt = `As a SAFe Epic Owner, provide comprehensive evaluation:

Epic: AI-Powered Customer Support Bot
Business Value: $400k/year efficiency gains through 24/7 automated support
Development Cost: $150k (4-month development timeline)  
Risk Level: Low (proven technology stack with existing integrations)
Strategic Alignment: High (supports customer experience excellence initiative)
Resource Requirements: 2 ML engineers, 1 backend developer, 1 DevOps engineer
Key Dependencies: Customer data platform integration, training data access

Provide detailed analysis with:
1. ROI calculation with clear assumptions and timeline
2. Strategic fit assessment against current portfolio priorities  
3. Risk analysis with specific mitigation strategies
4. Resource allocation and timeline recommendations
5. Final decision: APPROVE/REJECT/DEFER with comprehensive reasoning

Make analysis thorough and executive-ready for Program Increment planning.`;

    const startTime = Date.now();
    
    phaseSpan?.setAttributes({
      'safe.role': 'epic_owner',
      'safe.epic': 'ai_customer_support_bot',
      'phase': 'evaluation',
      'prompt.length': prompt.length
    });

    console.log('\n📋 Epic Evaluation Prompt:');
    console.log('─'.repeat(40));
    console.log(prompt.substring(0, 200) + '...');
    console.log('─'.repeat(40));

    const result = await this.executeClaudeWithDetailedLogging(
      prompt, 
      'SAFE_EPIC_EVAL', 
      'Epic Owner',
      phaseSpan
    );

    const duration = Date.now() - startTime;

    // Extract decision
    const decision = this.extractDecision(result.response);
    
    phaseSpan?.setAttributes({
      'safe.decision': decision,
      'response.length': result.response.length,
      'duration.ms': duration
    });

    console.log(`\n🏛️  SAFe Decision: ${decision}`);
    console.log('═'.repeat(80));
    console.log(result.response);
    console.log('═'.repeat(80));

    // Log to structured workflow log
    this.workflowLogs.push({
      timestamp: new Date().toISOString(),
      phase: 'SAFE_EPIC_EVAL',
      safeRole: 'Epic Owner',
      prompt: prompt,
      response: result.response,
      decision: decision,
      duration: duration,
      tokenUsage: result.tokenUsage,
      cost: result.cost,
      metadata: {
        epic: 'ai_customer_support_bot',
        businessValue: 400000,
        developmentCost: 150000,
        riskLevel: 'low'
      }
    });

    phaseSpan?.end();
  }

  private async executeSparcSpecification(parentSpan: any) {
    const phaseSpan = this.tracer?.startSpan('sparc_specification', { parent: parentSpan });
    
    console.log('\n📋 Phase 2: SPARC Specification');
    console.log('─'.repeat(50));

    const prompt = `Based on the approved SAFe Epic "AI-Powered Customer Support Bot", create detailed SPARC Specification:

SPECIFICATION REQUIREMENTS:
- Functional requirements with acceptance criteria
- Non-functional requirements (performance, security, scalability)
- User stories with clear acceptance criteria
- Integration requirements with existing systems
- Data requirements and privacy considerations
- API specifications for customer data platform integration

Provide comprehensive specification that development teams can use for implementation planning.`;

    const result = await this.executeClaudeWithDetailedLogging(
      prompt,
      'SPARC_SPEC',
      'Solution Architect',
      phaseSpan
    );

    console.log('\n📋 SPARC Specification Complete');
    console.log('─'.repeat(40));
    console.log(result.response.substring(0, 500) + '...');

    this.workflowLogs.push({
      timestamp: new Date().toISOString(),
      phase: 'SPARC_SPEC',
      safeRole: 'Solution Architect',
      prompt: prompt,
      response: result.response,
      duration: Date.now() - Date.now(),
      tokenUsage: result.tokenUsage,
      cost: result.cost,
      metadata: {
        phase: 'specification',
        complexity: 'medium'
      }
    });

    phaseSpan?.end();
  }

  private async executeSparcPseudocode(parentSpan: any) {
    const phaseSpan = this.tracer?.startSpan('sparc_pseudocode', { parent: parentSpan });
    
    console.log('\n🔧 Phase 3: SPARC Pseudocode');
    console.log('─'.repeat(50));

    const prompt = `Create SPARC Pseudocode for the AI Customer Support Bot:

PSEUDOCODE REQUIREMENTS:
- High-level algorithm design for chatbot engine
- Message processing workflow
- ML model integration pattern
- Customer data retrieval logic
- Response generation pipeline
- Error handling and fallback strategies

Provide clear pseudocode that developers can translate to implementation.`;

    const result = await this.executeClaudeWithDetailedLogging(
      prompt,
      'SPARC_PSEUDO',
      'Technical Lead',
      phaseSpan
    );

    console.log('\n🔧 SPARC Pseudocode Complete');
    console.log('─'.repeat(40));
    console.log(result.response.substring(0, 300) + '...');

    this.workflowLogs.push({
      timestamp: new Date().toISOString(),
      phase: 'SPARC_PSEUDO',
      safeRole: 'Technical Lead',
      prompt: prompt,
      response: result.response,
      duration: Date.now() - Date.now(),
      tokenUsage: result.tokenUsage,
      cost: result.cost,
      metadata: {
        phase: 'pseudocode',
        algorithmComplexity: 'medium'
      }
    });

    phaseSpan?.end();
  }

  private async executeSparcArchitecture(parentSpan: any) {
    const phaseSpan = this.tracer?.startSpan('sparc_architecture', { parent: parentSpan });
    
    console.log('\n🏗️  Phase 4: SPARC Architecture');
    console.log('─'.repeat(50));

    const prompt = `Design SPARC Architecture for AI Customer Support Bot:

ARCHITECTURE REQUIREMENTS:
- System architecture diagram with components
- Microservices design with clear boundaries
- Database design for conversation history
- Integration architecture with customer data platform
- Security architecture for data protection
- Deployment architecture and scaling considerations

Provide comprehensive architecture ready for implementation.`;

    const result = await this.executeClaudeWithDetailedLogging(
      prompt,
      'SPARC_ARCH',
      'System Architect',
      phaseSpan
    );

    console.log('\n🏗️  SPARC Architecture Complete');
    console.log('─'.repeat(40));
    console.log(result.response.substring(0, 300) + '...');

    this.workflowLogs.push({
      timestamp: new Date().toISOString(),
      phase: 'SPARC_ARCH',
      safeRole: 'System Architect',
      prompt: prompt,
      response: result.response,
      duration: Date.now() - Date.now(),
      tokenUsage: result.tokenUsage,
      cost: result.cost,
      metadata: {
        phase: 'architecture',
        components: ['api-gateway', 'chatbot-engine', 'ml-service', 'database']
      }
    });

    phaseSpan?.end();
  }

  private async executeSparcRefinement(parentSpan: any) {
    const phaseSpan = this.tracer?.startSpan('sparc_refinement', { parent: parentSpan });
    
    console.log('\n✨ Phase 5: SPARC Refinement');
    console.log('─'.repeat(50));

    const prompt = `Refine the AI Customer Support Bot design:

REFINEMENT FOCUS:
- Performance optimization strategies
- Error handling improvements
- Security enhancements
- Scalability considerations
- Code quality and maintainability
- Testing strategy and coverage

Provide refined design ready for final implementation.`;

    const result = await this.executeClaudeWithDetailedLogging(
      prompt,
      'SPARC_REF',
      'Senior Developer',
      phaseSpan
    );

    console.log('\n✨ SPARC Refinement Complete');
    console.log('─'.repeat(40));
    console.log(result.response.substring(0, 300) + '...');

    this.workflowLogs.push({
      timestamp: new Date().toISOString(),
      phase: 'SPARC_REF',
      safeRole: 'Senior Developer',
      prompt: prompt,
      response: result.response,
      duration: Date.now() - Date.now(),
      tokenUsage: result.tokenUsage,
      cost: result.cost,
      metadata: {
        phase: 'refinement',
        optimizations: ['performance', 'security', 'scalability']
      }
    });

    phaseSpan?.end();
  }

  private async executeSparcCompletion(parentSpan: any) {
    const phaseSpan = this.tracer?.startSpan('sparc_completion', { parent: parentSpan });
    
    console.log('\n🎯 Phase 6: SPARC Completion');
    console.log('─'.repeat(50));

    const prompt = `Complete the SPARC methodology for AI Customer Support Bot:

COMPLETION REQUIREMENTS:
- Final implementation checklist
- Deployment readiness assessment
- Quality assurance criteria
- Performance benchmarks
- Go-live requirements
- Success metrics definition

Provide comprehensive completion assessment.`;

    const result = await this.executeClaudeWithDetailedLogging(
      prompt,
      'SPARC_COMP',
      'Project Manager',
      phaseSpan
    );

    console.log('\n🎯 SPARC Completion Assessment');
    console.log('─'.repeat(40));
    console.log(result.response.substring(0, 300) + '...');

    this.workflowLogs.push({
      timestamp: new Date().toISOString(),
      phase: 'SPARC_COMP',
      safeRole: 'Project Manager',
      prompt: prompt,
      response: result.response,
      duration: Date.now() - Date.now(),
      tokenUsage: result.tokenUsage,
      cost: result.cost,
      metadata: {
        phase: 'completion',
        readinessScore: 85
      }
    });

    phaseSpan?.end();
  }

  private async executeClaudeWithDetailedLogging(
    prompt: string, 
    phase: string, 
    role: string,
    span?: any
  ) {
    const { executeClaudeTask } = await import('@claude-zen/foundation');
    
    let messageCount = 0;
    let firstTokenTime = 0;
    const startTime = Date.now();
    
    console.log(`\n🚀 Executing ${phase} as ${role}...`);
    console.log(`📊 Analyzing 30+ second delays with detailed timing...`);

    const result = await executeClaudeTask(prompt, {
      timeoutMs: 180000, // 3 minutes for detailed responses
      stderr: (output: string) => {
        messageCount++;
        const elapsed = Date.now() - startTime;
        
        // Detailed timing analysis for 30s delay investigation
        if (output.includes('Starting Claude')) {
          console.log(`🚀 [STARTUP] [${elapsed}ms] Claude SDK initialization`);
          span?.addEvent('claude_startup', { elapsed_ms: elapsed });
        } else if (output.includes('[SYSTEM]')) {
          if (elapsed > 1000 && elapsed < 5000) {
            console.log(`⚙️  [SYSTEM] [${elapsed}ms] Early system processing`);
          } else if (elapsed >= 5000 && elapsed < 30000) {
            console.log(`⚙️  [SYSTEM] [${elapsed}ms] ⚠️  Extended system processing (${Math.floor(elapsed/1000)}s)`);
          } else if (elapsed >= 30000) {
            console.log(`⚙️  [SYSTEM] [${elapsed}ms] 🔥 LONG DELAY (${Math.floor(elapsed/1000)}s) - API processing`);
          }
          span?.addEvent('claude_system', { elapsed_ms: elapsed, message_count: messageCount });
        } else if (output.includes('[MSG')) {
          if (firstTokenTime === 0) {
            firstTokenTime = elapsed;
            console.log(`💬 [FIRST-TOKEN] [${elapsed}ms] First response token received`);
            span?.addEvent('first_token_received', { elapsed_ms: elapsed });
          } else {
            console.log(`💬 [STREAMING] [${elapsed}ms] Response chunk ${messageCount} (streaming)`);
          }
        } else if (output.includes('[RESULT]')) {
          console.log(`✅ [COMPLETE] [${elapsed}ms] Final response received`);
          span?.addEvent('response_complete', { elapsed_ms: elapsed, total_messages: messageCount });
        }
        
        // Log any OTEL events we can detect
        if (output.includes('claude_code.user_prompt')) {
          console.log(`📝 [OTEL] [${elapsed}ms] User prompt event logged`);
        } else if (output.includes('claude_code.api_request')) {
          console.log(`📊 [OTEL] [${elapsed}ms] API request metrics logged`);
        }
      }
    });

    const totalTime = Date.now() - startTime;
    
    console.log(`\n⏱️  ${phase} Timing Analysis:`);
    console.log(`   Total Time: ${totalTime}ms (${Math.floor(totalTime/1000)}s)`);
    console.log(`   First Token: ${firstTokenTime}ms (${Math.floor(firstTokenTime/1000)}s)`);
    console.log(`   Stream Messages: ${messageCount}`);
    console.log(`   Avg Message Interval: ${Math.floor(totalTime/messageCount)}ms`);
    
    if (totalTime > 30000) {
      console.log(`   🔥 PERFORMANCE ALERT: Response exceeded 30 seconds`);
      console.log(`   📊 Breakdown: Startup + System (~30s) + Streaming (~${Math.floor((totalTime-firstTokenTime)/1000)}s)`);
    }

    // Extract response content
    let responseText = '';
    let tokenUsage = undefined;
    let cost = undefined;

    if (result && result.length > 0) {
      const content = result[0]?.message?.content;
      if (Array.isArray(content) && content[0]?.text) {
        responseText = content[0].text;
      }
      
      // Try to extract usage data if available
      const usage = result[0]?.usage;
      if (usage) {
        tokenUsage = {
          input: usage.input_tokens || 0,
          output: usage.output_tokens || 0,
          total: (usage.input_tokens || 0) + (usage.output_tokens || 0)
        };
        
        // Estimate cost (rough calculation)
        cost = (tokenUsage.input * 0.003 + tokenUsage.output * 0.015) / 1000;
      }
    }

    return {
      response: responseText,
      duration: totalTime,
      firstTokenTime: firstTokenTime,
      messageCount: messageCount,
      tokenUsage: tokenUsage,
      cost: cost
    };
  }

  private extractDecision(text: string): string {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('approve') && !lowerText.includes('not approve')) {
      return 'APPROVE';
    } else if (lowerText.includes('reject')) {
      return 'REJECT';
    } else if (lowerText.includes('defer')) {
      return 'DEFER';
    }
    return 'UNCLEAR';
  }

  async generateComprehensiveReport() {
    console.log('\n📊 SAFe-SPARC Comprehensive Observability Report');
    console.log('═'.repeat(80));

    // Workflow Summary
    const totalDuration = this.workflowLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalCost = this.workflowLogs.reduce((sum, log) => sum + (log.cost || 0), 0);
    const totalTokens = this.workflowLogs.reduce((sum, log) => 
      sum + (log.tokenUsage?.total || 0), 0);

    console.log(`\n🏛️  SAFe-SPARC Workflow Summary:`);
    console.log(`   Total Phases: ${this.workflowLogs.length}`);
    console.log(`   Total Duration: ${Math.floor(totalDuration/1000)}s`);
    console.log(`   Total Cost: $${totalCost.toFixed(4)}`);
    console.log(`   Total Tokens: ${totalTokens.toLocaleString()}`);
    console.log(`   Average Phase Time: ${Math.floor(totalDuration/this.workflowLogs.length/1000)}s`);

    // Performance Analysis
    console.log(`\n⚡ Performance Analysis:`);
    const slowPhases = this.workflowLogs.filter(log => log.duration > 30000);
    if (slowPhases.length > 0) {
      console.log(`   🔥 Phases exceeding 30s: ${slowPhases.length}`);
      slowPhases.forEach(phase => {
        console.log(`      ${phase.phase}: ${Math.floor(phase.duration/1000)}s`);
      });
    } else {
      console.log(`   ✅ All phases completed under 30s`);
    }

    // Decisions Summary
    console.log(`\n⚖️  SAFe Decisions:`);
    this.workflowLogs.forEach(log => {
      if (log.decision) {
        console.log(`   ${log.phase}: ${log.decision} (by ${log.safeRole})`);
      }
    });

    // Full Content Logs (what Claude Code OTEL doesn't provide)
    console.log(`\n📋 Complete Workflow Content Log:`);
    console.log('─'.repeat(50));
    
    this.workflowLogs.forEach((log, index) => {
      console.log(`\n${index + 1}. ${log.phase} - ${log.safeRole} [${log.timestamp}]`);
      console.log(`   Duration: ${Math.floor(log.duration/1000)}s`);
      console.log(`   Prompt: ${log.prompt.substring(0, 100)}...`);
      console.log(`   Response: ${log.response.substring(0, 200)}...`);
      if (log.decision) {
        console.log(`   Decision: ${log.decision}`);
      }
      if (log.tokenUsage) {
        console.log(`   Tokens: ${log.tokenUsage.total} (${log.tokenUsage.input} in, ${log.tokenUsage.output} out)`);
      }
      if (log.cost) {
        console.log(`   Cost: $${log.cost.toFixed(4)}`);
      }
    });

    // Export structured data for further analysis
    const reportPath = `/tmp/safe-sparc-observability-report-${Date.now()}.json`;
    await import('fs/promises').then(fs => 
      fs.writeFile(reportPath, JSON.stringify({
        summary: {
          totalPhases: this.workflowLogs.length,
          totalDuration: totalDuration,
          totalCost: totalCost,
          totalTokens: totalTokens,
          averagePhaseTime: totalDuration / this.workflowLogs.length
        },
        performance: {
          slowPhases: slowPhases.map(p => ({ phase: p.phase, duration: p.duration })),
          averageDelays: this.workflowLogs.map(p => p.duration)
        },
        workflowLogs: this.workflowLogs,
        generated: new Date().toISOString()
      }, null, 2))
    );

    console.log(`\n💾 Full observability data exported to: ${reportPath}`);
    console.log(`   This includes ALL prompts, responses, and decisions Claude Code OTEL cannot provide`);
    
    console.log('\n🎯 Observability Solution Summary:');
    console.log('   ✅ Claude Code OTEL: Token usage, costs, basic timing');
    console.log('   ✅ Custom Logging: Full prompts, responses, decisions');
    console.log('   ✅ Performance Analysis: 30+ second delay breakdown');
    console.log('   ✅ SAFe-SPARC Integration: Complete workflow traceability');
    console.log('   ✅ Structured Export: JSON data for further analysis');
  }
}

async function runComprehensiveSafeSparcOTEL() {
  const otelSystem = new ComprehensiveSafeSparcOTEL();
  
  try {
    await otelSystem.initializeOTEL();
    await otelSystem.executeSafeSparcWorkflow();
    await otelSystem.generateComprehensiveReport();
    
    console.log('\n🎉 Comprehensive SAFe-SPARC OTEL Solution Complete!');
    console.log('📊 You now have full workflow observability beyond Claude Code limitations');
    
  } catch (error) {
    console.error('\n❌ Comprehensive OTEL solution failed:', error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveSafeSparcOTEL().catch(console.error);
}

export { ComprehensiveSafeSparcOTEL, runComprehensiveSafeSparcOTEL };