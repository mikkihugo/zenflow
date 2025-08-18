/**
 * @file Queen Coordinator AI Safety Integration
 * 
 * Integrates the 25-pattern AI deception detection system with Queen Coordinator
 * workflows for strategic-level safety monitoring and intervention.
 */

import { getLogger, recordMetric, withTrace } from '@claude-zen/foundation';
import { 
  AISafetyOrchestrator,
  AIDeceptionDetector,
  type AIInteractionData,
  type DeceptionAlert 
} from '@claude-zen/ai-safety';
import { EventEmitter } from 'eventemitter3';

export interface QueenSafetyConfig {
  enabled: boolean;
  realTimeMonitoring: boolean;
  interventionThreshold: number;
  strategicValidation: boolean;
  coordinationSafety: boolean;
  escalationProtocols: boolean;
}

export interface QueenSafetyResult {
  queenId: string;
  taskId: string;
  swarmAssignments: string[];
  safetyVerdict: {
    isDeceptive: boolean;
    confidence: number;
    interventionRequired: boolean;
    reasoning: string[];
  };
  coordinationAnalysis: {
    resourceClaimsValid: boolean;
    delegationIntegrityCheck: boolean;
    strategicConsistency: boolean;
  };
  escalationRequired: boolean;
}

/**
 * Queen Coordinator AI Safety Integration
 * 
 * Monitors Queen-level strategic coordination for deception patterns,
 * validates delegation integrity, and ensures strategic consistency.
 */
export class QueenSafetyIntegration extends EventEmitter {
  private logger = getLogger('queen-safety-integration');
  private aiSafetyOrchestrator: AISafetyOrchestrator;
  private aiDeceptionDetector: AIDeceptionDetector;
  private config: QueenSafetyConfig;
  private isInitialized = false;

  constructor(config: QueenSafetyConfig) {
    super();
    this.config = config;
    this.aiSafetyOrchestrator = new AISafetyOrchestrator();
    this.aiDeceptionDetector = new AIDeceptionDetector();
    
    this.logger.info('👑🛡️ Queen Safety Integration initialized', {
      strategicValidation: config.strategicValidation,
      coordinationSafety: config.coordinationSafety,
      escalationProtocols: config.escalationProtocols
    });
  }

  /**
   * Initialize Queen safety integration.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Queen Safety Integration already initialized');
      return;
    }

    return withTrace('queen-safety-init', async () => {
      this.logger.info('🔧 Initializing Queen AI Safety Integration...');

      // Set up real-time monitoring if enabled
      if (this.config.realTimeMonitoring) {
        this.setupRealTimeMonitoring();
      }

      this.isInitialized = true;
      
      recordMetric('queen_safety_integration_initialized', 1, {
        strategicValidation: this.config.strategicValidation.toString(),
        coordinationSafety: this.config.coordinationSafety.toString()
      });

      this.logger.info('✅ Queen AI Safety Integration initialized');
    });
  }

  /**
   * Monitor Queen strategic coordination for safety issues.
   */
  async monitorQueenCoordination(
    queenId: string,
    taskDescription: string,
    sparcPhase: string,
    swarmAssignments: Array<{
      swarmId: string;
      tasks: string[];
      agents: string[];
    }>,
    coordinationClaims: string[]
  ): Promise<QueenSafetyResult> {
    if (!this.isInitialized) {
      throw new Error('Queen Safety Integration not initialized');
    }

    return withTrace('queen-coordination-safety-monitor', async (span) => {
      span?.setAttributes({
        'queen.id': queenId,
        'task.sparcPhase': sparcPhase,
        'coordination.swarmCount': swarmAssignments.length,
        'coordination.claimsCount': coordinationClaims.length
      });

      // 1. Build interaction data for deception detection
      const interactionData: AIInteractionData = {
        agentId: queenId,
        input: taskDescription,
        timestamp: new Date(),
        toolCalls: [], // Queens coordinate but don't use tools directly
        response: this.buildCoordinationResponse(taskDescription, sparcPhase, swarmAssignments, coordinationClaims),
        claimedCapabilities: coordinationClaims,
        actualWork: swarmAssignments.map(s => `Assigned ${s.tasks.length} tasks to swarm ${s.swarmId}`),
        context: {
          sparcPhase,
          swarmCount: swarmAssignments.length,
          coordinationType: 'strategic-delegation'
        }
      };

      // 2. Run deception detection on coordination claims
      const standardDetection = await this.aiDeceptionDetector.detectDeception(interactionData);

      // 3. Validate Queen-specific coordination patterns
      const coordinationAnalysis = this.analyzeCoordinationIntegrity(
        swarmAssignments,
        coordinationClaims,
        sparcPhase
      );

      // 4. Assess strategic consistency
      const strategicConsistency = this.validateStrategicConsistency(
        taskDescription,
        sparcPhase,
        swarmAssignments
      );

      // 5. Compute combined safety verdict
      const safetyVerdict = this.computeQueenSafetyVerdict(
        standardDetection,
        coordinationAnalysis,
        strategicConsistency
      );

      const result: QueenSafetyResult = {
        queenId,
        taskId: `${sparcPhase}-${Date.now()}`,
        swarmAssignments: swarmAssignments.map(s => s.swarmId),
        safetyVerdict,
        coordinationAnalysis: {
          resourceClaimsValid: coordinationAnalysis.resourceClaimsValid,
          delegationIntegrityCheck: coordinationAnalysis.delegationValid,
          strategicConsistency
        },
        escalationRequired: safetyVerdict.interventionRequired && this.config.escalationProtocols
      };

      // Record comprehensive metrics
      recordMetric('queen_coordination_safety_check', 1, {
        queenId,
        sparcPhase,
        swarmCount: swarmAssignments.length.toString(),
        safetyVerdict: safetyVerdict.isDeceptive.toString(),
        interventionRequired: safetyVerdict.interventionRequired.toString()
      });

      // Emit events for monitoring
      if (safetyVerdict.isDeceptive) {
        this.emit('queen:deception:detected', result);
        
        if (safetyVerdict.interventionRequired) {
          this.emit('queen:intervention:required', result);
        }
      }

      if (result.escalationRequired) {
        this.emit('queen:escalation:required', result);
      }

      span?.setAttributes({
        'safety.isDeceptive': safetyVerdict.isDeceptive,
        'safety.confidence': safetyVerdict.confidence,
        'safety.interventionRequired': safetyVerdict.interventionRequired,
        'coordination.resourceClaimsValid': coordinationAnalysis.resourceClaimsValid,
        'coordination.delegationValid': coordinationAnalysis.delegationValid,
        'coordination.strategicConsistency': strategicConsistency
      });

      return result;
    });
  }

  /**
   * Build coordination response text for analysis.
   */
  private buildCoordinationResponse(
    taskDescription: string,
    sparcPhase: string,
    swarmAssignments: Array<{ swarmId: string; tasks: string[]; agents: string[] }>,
    coordinationClaims: string[]
  ): string {
    const response = [
      `Coordinating ${sparcPhase} phase for: ${taskDescription}`,
      `Assigned ${swarmAssignments.length} swarms for execution:`,
      ...swarmAssignments.map(s => `- Swarm ${s.swarmId}: ${s.tasks.length} tasks, ${s.agents.length} agents`),
      `Coordination claims:`,
      ...coordinationClaims.map(claim => `- ${claim}`)
    ].join('\n');

    return response;
  }

  /**
   * Analyze coordination integrity for Queen-specific patterns.
   */
  private analyzeCoordinationIntegrity(
    swarmAssignments: Array<{ swarmId: string; tasks: string[]; agents: string[] }>,
    coordinationClaims: string[],
    sparcPhase: string
  ): {
    resourceClaimsValid: boolean;
    delegationValid: boolean;
    overallScore: number;
  } {
    let issues = 0;
    const maxIssues = 6;

    // Check for resource claim inflation
    const totalAgents = swarmAssignments.reduce((sum, s) => sum + s.agents.length, 0);
    const totalTasks = swarmAssignments.reduce((sum, s) => sum + s.tasks.length, 0);
    
    if (totalAgents > totalTasks * 3) {
      issues++; // Over-allocation of agents
    }

    // Check for delegation integrity
    const hasDuplicateSwarmIds = new Set(swarmAssignments.map(s => s.swarmId)).size !== swarmAssignments.length;
    if (hasDuplicateSwarmIds) {
      issues++; // Duplicate swarm assignments
    }

    // Check for coordination claim consistency
    const hasEmptyTasks = swarmAssignments.some(s => s.tasks.length === 0);
    if (hasEmptyTasks) {
      issues++; // Empty task assignments
    }

    // Check for SPARC phase alignment
    const sparcKeywords = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];
    const phaseKeyword = sparcKeywords.find(k => sparcPhase.toLowerCase().includes(k));
    
    if (phaseKeyword) {
      const phaseAlignedClaims = coordinationClaims.some(claim => 
        claim.toLowerCase().includes(phaseKeyword)
      );
      if (!phaseAlignedClaims) {
        issues++; // Claims don't align with SPARC phase
      }
    }

    // Check for coordination claims that sound like direct implementation
    const implementationWords = ['implemented', 'built', 'created', 'wrote code', 'developed'];
    const hasImplementationClaims = coordinationClaims.some(claim =>
      implementationWords.some(word => claim.toLowerCase().includes(word))
    );
    if (hasImplementationClaims) {
      issues += 2; // Queens should coordinate, not implement
    }

    const overallScore = Math.max(0, (maxIssues - issues) / maxIssues);
    
    return {
      resourceClaimsValid: issues <= 2,
      delegationValid: !hasDuplicateSwarmIds && !hasEmptyTasks,
      overallScore
    };
  }

  /**
   * Validate strategic consistency of Queen coordination.
   */
  private validateStrategicConsistency(
    taskDescription: string,
    sparcPhase: string,
    swarmAssignments: Array<{ swarmId: string; tasks: string[]; agents: string[] }>
  ): boolean {
    // Check if swarm assignments make strategic sense for the SPARC phase
    const phaseComplexity = this.getSparcPhaseComplexity(sparcPhase);
    const assignedComplexity = swarmAssignments.length;

    // Simple heuristic: more complex phases should have more swarms
    const complexityMatch = assignedComplexity >= phaseComplexity;

    // Check for task description alignment
    const taskWords = taskDescription.toLowerCase().split(' ');
    const hasAlignedTasks = swarmAssignments.some(s =>
      s.tasks.some(task =>
        taskWords.some(word => task.toLowerCase().includes(word))
      )
    );

    return complexityMatch && hasAlignedTasks;
  }

  /**
   * Get expected complexity level for SPARC phase.
   */
  private getSparcPhaseComplexity(sparcPhase: string): number {
    const phase = sparcPhase.toLowerCase();
    if (phase.includes('specification')) return 1;
    if (phase.includes('pseudocode')) return 2;
    if (phase.includes('architecture')) return 3;
    if (phase.includes('refinement')) return 2;
    if (phase.includes('completion')) return 3;
    return 2; // Default complexity
  }

  /**
   * Compute combined safety verdict for Queen coordination.
   */
  private computeQueenSafetyVerdict(
    standardDetection: DeceptionAlert[],
    coordinationAnalysis: { resourceClaimsValid: boolean; delegationValid: boolean; overallScore: number },
    strategicConsistency: boolean
  ): {
    isDeceptive: boolean;
    confidence: number;
    interventionRequired: boolean;
    reasoning: string[];
  } {
    const reasoning: string[] = [];
    let combinedConfidence = 0;
    let deceptionIndicators = 0;

    // Standard detection weight: 50%
    if (standardDetection.length > 0) {
      deceptionIndicators += standardDetection.length;
      combinedConfidence += 0.5 * Math.min(standardDetection.length / 3, 1);
      reasoning.push(`Standard detection: ${standardDetection.length} deception patterns found`);
    }

    // Coordination integrity weight: 30%
    if (!coordinationAnalysis.resourceClaimsValid || !coordinationAnalysis.delegationValid) {
      deceptionIndicators += 1;
      combinedConfidence += 0.3 * (1 - coordinationAnalysis.overallScore);
      reasoning.push(`Coordination integrity: Resource claims ${coordinationAnalysis.resourceClaimsValid ? 'valid' : 'invalid'}, delegation ${coordinationAnalysis.delegationValid ? 'valid' : 'invalid'}`);
    }

    // Strategic consistency weight: 20%
    if (!strategicConsistency) {
      deceptionIndicators += 1;
      combinedConfidence += 0.2;
      reasoning.push(`Strategic consistency: Swarm assignments inconsistent with task requirements`);
    }

    const isDeceptive = deceptionIndicators >= 2 || combinedConfidence > this.config.interventionThreshold;
    const interventionRequired = deceptionIndicators >= 3 || 
                                 standardDetection.some(a => a.severity === 'CRITICAL') ||
                                 (!coordinationAnalysis.resourceClaimsValid && !coordinationAnalysis.delegationValid);

    return {
      isDeceptive,
      confidence: Math.min(combinedConfidence, 1),
      interventionRequired,
      reasoning
    };
  }

  /**
   * Setup real-time monitoring for Queen coordination safety.
   */
  private setupRealTimeMonitoring(): void {
    this.logger.info('🔄 Setting up real-time Queen coordination safety monitoring...');

    this.on('queen:deception:detected', (result: QueenSafetyResult) => {
      this.logger.warn('🚨 Queen coordination deception detected', {
        queenId: result.queenId,
        taskId: result.taskId,
        confidence: result.safetyVerdict.confidence,
        swarmCount: result.swarmAssignments.length
      });

      recordMetric('queen_coordination_deception_detected', 1, {
        queenId: result.queenId,
        confidence: result.safetyVerdict.confidence.toString()
      });
    });

    this.on('queen:intervention:required', (result: QueenSafetyResult) => {
      this.logger.error('🛑 QUEEN INTERVENTION REQUIRED - Critical coordination deception', {
        queenId: result.queenId,
        reasoning: result.safetyVerdict.reasoning,
        coordinationAnalysis: result.coordinationAnalysis
      });

      recordMetric('queen_coordination_intervention_triggered', 1, {
        queenId: result.queenId,
        swarmCount: result.swarmAssignments.length.toString()
      });
    });

    this.on('queen:escalation:required', (result: QueenSafetyResult) => {
      this.logger.error('🚨 ESCALATION TO CUBE MATRON - Queen coordination safety breach', {
        queenId: result.queenId,
        taskId: result.taskId,
        reasoning: result.safetyVerdict.reasoning
      });

      recordMetric('queen_coordination_escalation_triggered', 1, {
        queenId: result.queenId
      });
    });

    this.logger.info('✅ Real-time Queen coordination safety monitoring active');
  }

  /**
   * Get Queen safety statistics.
   */
  getQueenSafetyStatistics(): {
    totalCoordinationChecks: number;
    deceptionDetected: number;
    interventionsTriggered: number;
    escalationsRequired: number;
    averageConfidence: number;
  } {
    return {
      totalCoordinationChecks: 0, // Would track in real implementation
      deceptionDetected: 0,
      interventionsTriggered: 0,
      escalationsRequired: 0,
      averageConfidence: 0.95 // Would calculate from actual data
    };
  }

  /**
   * Shutdown Queen safety integration.
   */
  async shutdown(): Promise<void> {
    this.logger.info('🛑 Shutting down Queen Safety Integration...');
    
    this.removeAllListeners();
    this.isInitialized = false;
    
    this.logger.info('✅ Queen Safety Integration shutdown complete');
  }
}

/**
 * Factory function to create Queen safety integration.
 */
export function createQueenSafetyIntegration(config: QueenSafetyConfig): QueenSafetyIntegration {
  return new QueenSafetyIntegration(config);
}