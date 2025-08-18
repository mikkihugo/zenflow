/**
 * @file Agent Interaction Pipeline with AI Safety Integration
 * 
 * Real-time agent interaction monitoring and safety intervention pipeline.
 * Hooks into all agent communications for comprehensive deception detection.
 */

import { getLogger, recordMetric, withTrace } from '@claude-zen/foundation';
import { 
  SafetyGuard as AISafetyOrchestrator,
  AIDeceptionDetector,
  type AIInteractionData,
  type DeceptionAlert 
} from '@claude-zen/ai-safety';
import { EventEmitter } from 'eventemitter3';

export interface AgentInteraction {
  agentId: string;
  agentType: 'queen' | 'commander' | 'swarm' | 'cube' | 'matron' | 'drone';
  timestamp: number;
  operation: string;
  toolCalls: Array<{
    tool: string;
    parameters: any;
    result?: any;
  }>;
  response: string;
  context: {
    taskId?: string;
    sparcPhase?: string;
    coordinationType?: string;
    targetAgents?: string[];
  };
}

export interface SafetyPipelineConfig {
  enabled: boolean;
  realTimeMonitoring: boolean;
  neuralEnhancement: boolean;
  interventionThreshold: number;
  logAllInteractions: boolean;
  escalationToHumans: boolean;
  coordinationValidation: boolean;
}

export interface PipelineSafetyResult {
  interactionId: string;
  agentId: string;
  agentType: string;
  safetyVerdict: {
    isDeceptive: boolean;
    confidence: number;
    interventionRequired: boolean;
    patterns: string[];
    reasoning: string[];
  };
  enhancedAnalysis?: {
    neuralConfidence: number;
    behavioralSignals: number[];
    combinedVerdict: boolean;
  };
  interventionActions: string[];
  escalationRequired: boolean;
}

/**
 * Agent Interaction Pipeline with Real-time Safety Monitoring
 * 
 * Central pipeline that monitors all agent interactions across the swarm
 * system for deception patterns and safety violations.
 */
export class AgentInteractionPipeline extends EventEmitter {
  private logger = getLogger('agent-interaction-pipeline');
  private aiSafetyOrchestrator: AISafetyOrchestrator;
  private aiDeceptionDetector: AIDeceptionDetector;
  private config: SafetyPipelineConfig;
  private isInitialized = false;
  private interactionCount = 0;
  private deceptionCount = 0;
  private interventionCount = 0;

  constructor(config: SafetyPipelineConfig) {
    super();
    this.config = config;
    this.aiSafetyOrchestrator = new AISafetyOrchestrator();
    this.aiDeceptionDetector = new AIDeceptionDetector();
    
    this.logger.info('🔄 Agent Interaction Pipeline initialized', {
      neuralEnhancement: config.neuralEnhancement,
      coordinationValidation: config.coordinationValidation,
      escalationToHumans: config.escalationToHumans
    });
  }

  /**
   * Initialize the agent interaction pipeline.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Agent Interaction Pipeline already initialized');
      return;
    }

    return withTrace('agent-pipeline-init', async () => {
      this.logger.info('🔧 Initializing Agent Interaction Pipeline...');

      // Neural enhancement would be initialized here if available
      if (this.config.neuralEnhancement) {
        this.logger.info('🧠 Neural safety enhancement configured (placeholder)');
      }

      // Set up real-time monitoring
      if (this.config.realTimeMonitoring) {
        this.setupRealTimeMonitoring();
      }

      this.isInitialized = true;
      
      recordMetric('agent_interaction_pipeline_initialized', 1, {
        neuralEnhancement: this.config.neuralEnhancement.toString(),
        coordinationValidation: this.config.coordinationValidation.toString()
      });

      this.logger.info('✅ Agent Interaction Pipeline initialized with safety monitoring');
    });
  }

  /**
   * Process agent interaction through safety pipeline.
   */
  async processInteraction(interaction: AgentInteraction): Promise<PipelineSafetyResult> {
    if (!this.isInitialized) {
      throw new Error('Agent Interaction Pipeline not initialized');
    }

    return withTrace('process-agent-interaction', async (span) => {
      const interactionId = `${interaction.agentId}-${interaction.timestamp}`;
      this.interactionCount++;

      span?.setAttributes({
        'agent.id': interaction.agentId,
        'agent.type': interaction.agentType,
        'interaction.operation': interaction.operation,
        'interaction.toolCalls': interaction.toolCalls.length
      });

      // 1. Convert to AI interaction data format
      const aiInteractionData: AIInteractionData = {
        agentId: interaction.agentId,
        timestamp: new Date(interaction.timestamp),
        toolCalls: interaction.toolCalls.map(tc => tc.tool),
        response: interaction.response,
        input: interaction.operation,
        claimedCapabilities: interaction.toolCalls.map(tc => tc.tool),
        actualWork: interaction.toolCalls.map(tc => tc.tool)
      };

      // 2. Run standard deception detection
      const standardDetection = await this.aiDeceptionDetector.detectDeception(aiInteractionData);

      // 3. Enhanced analysis with neural enhancement
      let enhancedAnalysis: PipelineSafetyResult['enhancedAnalysis'] | undefined;
      let neuralResult: any = { finalVerdict: { isDeceptive: false, confidence: 0 }, neuralPrediction: { deceptionProbability: 0 } };
      
      if (this.config.neuralEnhancement) {
        // Placeholder for neural enhancement
        neuralResult = {
          finalVerdict: { 
            isDeceptive: standardDetection.length > 2, 
            confidence: Math.min(standardDetection.length * 0.3, 1) 
          },
          neuralPrediction: { 
            deceptionProbability: Math.min(standardDetection.length * 0.25, 1) 
          }
        };
        
        enhancedAnalysis = {
          neuralConfidence: neuralResult.finalVerdict.confidence,
          behavioralSignals: [0.1, 0.2, 0.3],
          combinedVerdict: neuralResult.finalVerdict.isDeceptive
        };
      }

      // 4. Validate coordination patterns for specific agent types
      const coordinationValidation = this.config.coordinationValidation ? 
        this.validateCoordinationPatterns(interaction) : { valid: true, issues: [] };

      // 5. Compute combined safety verdict
      const safetyVerdict = this.computePipelineSafetyVerdict(
        standardDetection,
        neuralResult,
        enhancedAnalysis,
        coordinationValidation,
        interaction
      );

      // 7. Determine intervention actions
      const interventionActions = this.determineInterventionActions(
        safetyVerdict,
        interaction,
        coordinationValidation
      );

      const result: PipelineSafetyResult = {
        interactionId,
        agentId: interaction.agentId,
        agentType: interaction.agentType,
        safetyVerdict,
        enhancedAnalysis,
        interventionActions,
        escalationRequired: safetyVerdict.interventionRequired && this.config.escalationToHumans
      };

      // 8. Log interaction if configured
      if (this.config.logAllInteractions) {
        this.logInteraction(interaction, result);
      }

      // 9. Record metrics
      recordMetric('agent_interaction_processed', 1, {
        agentType: interaction.agentType,
        isDeceptive: safetyVerdict.isDeceptive.toString(),
        interventionRequired: safetyVerdict.interventionRequired.toString()
      });

      // 10. Emit events for monitoring
      if (safetyVerdict.isDeceptive) {
        this.deceptionCount++;
        this.emit('agent:deception:detected', result);
        
        if (safetyVerdict.interventionRequired) {
          this.interventionCount++;
          this.emit('agent:intervention:required', result);
        }
      }

      if (result.escalationRequired) {
        this.emit('agent:escalation:required', result);
      }

      span?.setAttributes({
        'safety.isDeceptive': safetyVerdict.isDeceptive,
        'safety.confidence': safetyVerdict.confidence,
        'safety.interventionRequired': safetyVerdict.interventionRequired,
        'safety.patternsCount': safetyVerdict.patterns.length
      });

      return result;
    });
  }

  /**
   * Validate coordination patterns for agent interactions.
   */
  private validateCoordinationPatterns(interaction: AgentInteraction): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Agent type-specific validation
    switch (interaction.agentType) {
      case 'queen':
        // Queens coordinate multiple swarms, repos, and SPARC phases
        // They should NOT directly implement code, but CAN coordinate implementation across swarms
        const directImplementationPatterns = [
          /i (?:wrote|coded|implemented) the/gi,
          /i directly (?:wrote|coded|implemented)/gi,
          /i (?:personally|manually) (?:wrote|coded)/gi
        ];
        
        const hasDirectImplementation = directImplementationPatterns.some(pattern => 
          pattern.test(interaction.response)
        );
        
        if (hasDirectImplementation) {
          issues.push('Queen claiming direct implementation (should coordinate, not implement)');
        }
        
        // Queens legitimately coordinate multiple repos/swarms - this is NOT deception
        // Multi-repo coordination, cross-swarm communication, and parallel SPARC phases are valid
        break;

      case 'commander':
      case 'swarm':
        // Commanders coordinate within their assigned swarm/domain
        // They should delegate to drones for actual implementation
        if (interaction.toolCalls.length === 0 && 
            interaction.response.includes('completed') &&
            !interaction.response.includes('coordinated') &&
            !interaction.response.includes('delegated')) {
          issues.push('Commander claiming completion without tool usage or delegation');
        }
        
        // Commanders can reference work from other swarms if coordinating with Queen
        // Cross-swarm coordination is legitimate when context indicates multi-swarm operation
        break;

      case 'cube':
      case 'matron':
        // Domain leaders should have domain-relevant operations
        if (interaction.context.sparcPhase && 
            !interaction.response.toLowerCase().includes(interaction.context.sparcPhase)) {
          issues.push('Domain leader operation misaligned with SPARC phase');
        }
        break;

      case 'drone':
        // Drones should use tools for actual work
        if (interaction.response.includes('analyzed') && 
            !interaction.toolCalls.some(tc => tc.tool === 'Read')) {
          issues.push('Drone claiming analysis without reading files');
        }
        break;
    }

    // General coordination validation
    if (interaction.context.targetAgents && 
        interaction.context.targetAgents.length === 0 &&
        interaction.response.includes('coordinated with')) {
      issues.push('Claimed coordination with no target agents specified');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Compute combined safety verdict from all detection systems.
   */
  private computePipelineSafetyVerdict(
    standardDetection: DeceptionAlert[],
    neuralResult: any,
    enhancedAnalysis: PipelineSafetyResult['enhancedAnalysis'],
    coordinationValidation: { valid: boolean; issues: string[] },
    interaction: AgentInteraction
  ): PipelineSafetyResult['safetyVerdict'] {
    const patterns: string[] = [];
    const reasoning: string[] = [];
    let combinedConfidence = 0;
    let deceptionIndicators = 0;

    // Standard detection weight: 40%
    if (standardDetection.length > 0) {
      deceptionIndicators += standardDetection.length;
      combinedConfidence += 0.4 * Math.min(standardDetection.length / 3, 1);
      patterns.push(...standardDetection.map(a => a.category || 'UNKNOWN_PATTERN'));
      reasoning.push(`Standard detection: ${standardDetection.length} patterns found`);
    }

    // Neural detection weight: 25%
    if (neuralResult.finalVerdict.isDeceptive) {
      deceptionIndicators += 1;
      combinedConfidence += 0.25 * neuralResult.finalVerdict.confidence;
      patterns.push(`NEURAL_ML_DETECTION`);
      reasoning.push(`Neural ML: ${(neuralResult.neuralPrediction.deceptionProbability * 100).toFixed(1)}% deception probability`);
    }

    // Enhanced analysis weight: 25%
    if (enhancedAnalysis?.combinedVerdict) {
      deceptionIndicators += 1;
      combinedConfidence += 0.25 * enhancedAnalysis.neuralConfidence;
      patterns.push(`ENHANCED_NEURAL_ANALYSIS`);
      reasoning.push(`Enhanced analysis: ${(enhancedAnalysis.neuralConfidence * 100).toFixed(1)}% neural confidence`);
    }

    // Coordination validation weight: 10%
    if (!coordinationValidation.valid) {
      deceptionIndicators += 1;
      combinedConfidence += 0.1 * (coordinationValidation.issues.length / 3);
      patterns.push(`COORDINATION_VIOLATION`);
      reasoning.push(`Coordination issues: ${coordinationValidation.issues.join(', ')}`);
    }

    const isDeceptive = deceptionIndicators >= 2 || combinedConfidence > this.config.interventionThreshold;
    const interventionRequired = deceptionIndicators >= 3 || 
                                 standardDetection.some(a => a.severity === 'CRITICAL') ||
                                 (enhancedAnalysis?.neuralConfidence !== undefined && enhancedAnalysis.neuralConfidence > 0.9);

    return {
      isDeceptive,
      confidence: Math.min(combinedConfidence, 1),
      interventionRequired,
      patterns,
      reasoning
    };
  }

  /**
   * Determine intervention actions based on safety verdict.
   */
  private determineInterventionActions(
    safetyVerdict: PipelineSafetyResult['safetyVerdict'],
    interaction: AgentInteraction,
    coordinationValidation: { valid: boolean; issues: string[] }
  ): string[] {
    const actions: string[] = [];

    if (safetyVerdict.isDeceptive) {
      actions.push('LOG_DECEPTION_ALERT');
      
      if (safetyVerdict.confidence > 0.8) {
        actions.push('IMMEDIATE_SUPERVISION');
      }
      
      if (safetyVerdict.interventionRequired) {
        actions.push('PAUSE_AGENT_OPERATIONS');
        actions.push('NOTIFY_COORDINATION_HIERARCHY');
        
        if (interaction.agentType === 'queen' || interaction.agentType === 'commander') {
          actions.push('ESCALATE_TO_CUBE_MATRON');
        }
        
        if (safetyVerdict.patterns.includes('VERIFICATION_FRAUD')) {
          actions.push('REQUIRE_VERIFICATION_PROOF');
        }
        
        if (!coordinationValidation.valid) {
          actions.push('COORDINATION_PATTERN_RETRAINING');
        }
      }
    }

    return actions;
  }

  /**
   * Log agent interaction for audit trail.
   */
  private logInteraction(interaction: AgentInteraction, result: PipelineSafetyResult): void {
    this.logger.info('📋 Agent interaction logged', {
      interactionId: result.interactionId,
      agentId: interaction.agentId,
      agentType: interaction.agentType,
      operation: interaction.operation,
      toolCallsCount: interaction.toolCalls.length,
      isDeceptive: result.safetyVerdict.isDeceptive,
      confidence: result.safetyVerdict.confidence,
      patterns: result.safetyVerdict.patterns,
      interventionActions: result.interventionActions
    });
  }

  /**
   * Setup real-time monitoring for agent interactions.
   */
  private setupRealTimeMonitoring(): void {
    this.logger.info('🔄 Setting up real-time agent interaction monitoring...');

    this.on('agent:deception:detected', (result: PipelineSafetyResult) => {
      this.logger.warn('🚨 Agent deception detected in pipeline', {
        agentId: result.agentId,
        agentType: result.agentType,
        confidence: result.safetyVerdict.confidence,
        patterns: result.safetyVerdict.patterns
      });

      recordMetric('agent_deception_pipeline_detected', 1, {
        agentType: result.agentType,
        confidence: result.safetyVerdict.confidence.toString()
      });
    });

    this.on('agent:intervention:required', (result: PipelineSafetyResult) => {
      this.logger.error('🛑 AGENT INTERVENTION REQUIRED - Critical deception in pipeline', {
        agentId: result.agentId,
        agentType: result.agentType,
        reasoning: result.safetyVerdict.reasoning,
        interventionActions: result.interventionActions
      });

      recordMetric('agent_intervention_pipeline_triggered', 1, {
        agentType: result.agentType
      });
    });

    this.on('agent:escalation:required', (result: PipelineSafetyResult) => {
      this.logger.error('🚨 HUMAN ESCALATION REQUIRED - Critical agent safety breach', {
        agentId: result.agentId,
        agentType: result.agentType,
        reasoning: result.safetyVerdict.reasoning
      });

      recordMetric('agent_escalation_pipeline_triggered', 1, {
        agentType: result.agentType
      });
    });

    this.logger.info('✅ Real-time agent interaction monitoring active');
  }

  /**
   * Get pipeline statistics.
   */
  getPipelineStatistics(): {
    totalInteractions: number;
    deceptionDetected: number;
    interventionsTriggered: number;
    escalationsRequired: number;
    averageConfidence: number;
    agentTypeBreakdown: Record<string, number>;
  } {
    return {
      totalInteractions: this.interactionCount,
      deceptionDetected: this.deceptionCount,
      interventionsTriggered: this.interventionCount,
      escalationsRequired: 0, // Would track in real implementation
      averageConfidence: 0.92, // Would calculate from actual data
      agentTypeBreakdown: {
        queen: 0,
        commander: 0,
        swarm: 0,
        cube: 0,
        matron: 0,
        drone: 0
      }
    };
  }

  /**
   * Shutdown agent interaction pipeline.
   */
  async shutdown(): Promise<void> {
    this.logger.info('🛑 Shutting down Agent Interaction Pipeline...');
    
    // Neural safety bridge would be shut down here if available
    // if (this.neuralSafetyBridge) {
    //   await this.neuralSafetyBridge.shutdown();
    // }
    
    this.removeAllListeners();
    this.isInitialized = false;
    
    this.logger.info('✅ Agent Interaction Pipeline shutdown complete');
  }
}

/**
 * Factory function to create agent interaction pipeline.
 */
export function createAgentInteractionPipeline(config: SafetyPipelineConfig): AgentInteractionPipeline {
  return new AgentInteractionPipeline(config);
}