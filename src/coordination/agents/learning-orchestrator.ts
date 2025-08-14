/**
 * Learning Orchestrator - Controls when and how swarms learn
 * Decides learning modes, triggers learning cycles, and manages learning resources
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
import type {
  IEventBus,
  ILogger,
} from '../../core/interfaces/base-interfaces.ts';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator.ts';

export interface LearningOrchestrationConfig {
  globalLearningEnabled: boolean;
  defaultLearningMode: 'passive' | 'active' | 'aggressive' | 'experimental';
  adaptiveLearning: boolean;
  learningSchedule: {
    realTimeThreshold: number; // Performance threshold to trigger learning
    coordinationInterval: number; // Minutes between coordination learning
    deepLearningInterval: number; // Hours between deep learning
  };
  resourceLimits: {
    maxLearningSwarms: number;
    learningCpuLimit: number;
    learningMemoryLimit: number;
  };
}

export interface SwarmLearningStatus {
  swarmId: string;
  commanderType: string;
  learningMode: 'passive' | 'active' | 'aggressive' | 'experimental';
  learningEnabled: boolean;
  performanceScore: number;
  lastLearningCycle: Date;
  learningEfficiency: number;
}

export interface LearningDecision {
  swarmId: string;
  newLearningMode: 'passive' | 'active' | 'aggressive' | 'experimental';
  reason: string;
  duration: number; // How long to maintain this mode
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Learning Orchestrator - THE COLLECTIVE's learning decision maker
 * 
 * RESPONSIBILITIES:
 * - Decide when swarms should enter different learning modes
 * - Monitor performance and adapt learning intensity
 * - Manage learning resources and scheduling
 * - Coordinate cross-swarm learning
 */
export class LearningOrchestrator extends EventEmitter {
  private logger: ILogger;
  private eventBus: IEventBus;
  private memoryCoordinator: MemoryCoordinator;
  private config: LearningOrchestrationConfig;
  
  private swarmLearningStatus = new Map<string, SwarmLearningStatus>();
  private learningDecisionHistory: LearningDecision[] = [];
  private performanceThresholds = {
    poor: 0.6,      // Switch to aggressive learning
    average: 0.75,  // Switch to active learning  
    good: 0.85,     // Switch to passive learning
    excellent: 0.95 // Switch to experimental learning
  };

  constructor(
    config: LearningOrchestrationConfig,
    eventBus: IEventBus,
    memoryCoordinator: MemoryCoordinator
  ) {
    super();
    
    this.config = config;
    this.eventBus = eventBus;
    this.memoryCoordinator = memoryCoordinator;
    this.logger = getLogger('LearningOrchestrator');
    
    this.setupEventHandlers();
    this.startLearningOrchestration();
    
    this.logger.info('Learning Orchestrator initialized - managing swarm intelligence');
  }

  /**
   * Setup event handlers for learning coordination
   */
  private setupEventHandlers(): void {
    // Listen to swarm task completions for performance analysis
    this.eventBus.on('swarm:*:task:completed', this.analyzeSwarmPerformance.bind(this));
    
    // Listen to Queen Coordinator requests for learning decisions
    this.eventBus.on('queen:coordinator:learning:request', this.handleLearningRequest.bind(this));
    
    // Listen to Cube Matron strategic decisions that might require learning
    this.eventBus.on('cube:matron:strategic:decision', this.evaluateStrategicLearning.bind(this));
    
    // Listen to system performance alerts
    this.eventBus.on('system:performance:degraded', this.handlePerformanceDegradation.bind(this));
  }

  /**
   * Start continuous learning orchestration
   */
  private startLearningOrchestration(): void {
    // Real-time performance monitoring
    setInterval(() => {
      this.monitorSwarmPerformance();
    }, 30000); // Every 30 seconds
    
    // Coordination learning cycles
    setInterval(() => {
      this.triggerCoordinationLearning();
    }, this.config.learningSchedule.coordinationInterval * 60 * 1000);
    
    // Deep learning cycles
    setInterval(() => {
      this.triggerDeepLearning();
    }, this.config.learningSchedule.deepLearningInterval * 60 * 60 * 1000);
  }

  /**
   * WHO DECIDES: Analyze swarm performance and decide learning mode
   */
  private async analyzeSwarmPerformance(taskData: any): Promise<void> {
    const swarmId = taskData.swarmId || this.extractSwarmId(taskData);
    const performanceScore = taskData.metrics?.qualityScore || 0.8;
    
    let currentStatus = this.swarmLearningStatus.get(swarmId);
    if (!currentStatus) {
      currentStatus = {
        swarmId,
        commanderType: taskData.commanderType || 'general',
        learningMode: this.config.defaultLearningMode,
        learningEnabled: this.config.globalLearningEnabled,
        performanceScore: performanceScore,
        lastLearningCycle: new Date(),
        learningEfficiency: 0.75,
      };
    }
    
    // Update performance score with weighted average
    currentStatus.performanceScore = (currentStatus.performanceScore * 0.8) + (performanceScore * 0.2);
    
    // DECISION LOGIC: Who decides the learning mode
    const newLearningMode = this.decideLearningMode(currentStatus);
    
    if (newLearningMode !== currentStatus.learningMode) {
      const decision: LearningDecision = {
        swarmId,
        newLearningMode,
        reason: this.getLearningModeReason(currentStatus.performanceScore),
        duration: this.calculateLearningDuration(currentStatus.performanceScore),
        priority: this.calculateLearningPriority(currentStatus.performanceScore),
      };
      
      await this.implementLearningDecision(decision);
      this.learningDecisionHistory.push(decision);
      
      this.logger.info(`Learning mode changed for swarm ${swarmId}: ${currentStatus.learningMode} → ${newLearningMode} (${decision.reason})`);
    }
    
    this.swarmLearningStatus.set(swarmId, currentStatus);
  }

  /**
   * CORE DECISION ENGINE: Decide learning mode based on performance
   */
  private decideLearningMode(status: SwarmLearningStatus): 'passive' | 'active' | 'aggressive' | 'experimental' {
    const score = status.performanceScore;
    
    // Strategic decision tree
    if (score < this.performanceThresholds.poor) {
      return 'aggressive'; // Poor performance → Learn aggressively
    } else if (score < this.performanceThresholds.average) {
      return 'active';     // Average performance → Learn actively
    } else if (score < this.performanceThresholds.good) {
      return 'passive';    // Good performance → Learn passively
    } else if (score >= this.performanceThresholds.excellent && this.config.adaptiveLearning) {
      return 'experimental'; // Excellent performance → Try new approaches
    } else {
      return 'passive';    // Stable performance → Maintain learning
    }
  }

  /**
   * Get reason for learning mode decision
   */
  private getLearningModeReason(performanceScore: number): string {
    if (performanceScore < this.performanceThresholds.poor) {
      return 'poor_performance_requires_intensive_learning';
    } else if (performanceScore < this.performanceThresholds.average) {
      return 'average_performance_needs_active_improvement';
    } else if (performanceScore < this.performanceThresholds.good) {
      return 'good_performance_maintain_passive_learning';
    } else {
      return 'excellent_performance_experiment_with_new_approaches';
    }
  }

  /**
   * Calculate how long to maintain learning mode
   */
  private calculateLearningDuration(performanceScore: number): number {
    // Duration in minutes
    if (performanceScore < this.performanceThresholds.poor) {
      return 120; // 2 hours of intensive learning
    } else if (performanceScore < this.performanceThresholds.average) {
      return 60;  // 1 hour of active learning
    } else if (performanceScore < this.performanceThresholds.good) {
      return 30;  // 30 minutes of passive learning
    } else {
      return 90;  // 1.5 hours of experimental learning
    }
  }

  /**
   * Calculate learning priority
   */
  private calculateLearningPriority(performanceScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (performanceScore < 0.5) return 'critical';
    if (performanceScore < 0.7) return 'high';
    if (performanceScore < 0.8) return 'medium';
    return 'low';
  }

  /**
   * Implement learning decision by commanding swarms
   */
  private async implementLearningDecision(decision: LearningDecision): Promise<void> {
    this.eventBus.emit(`swarm:${decision.swarmId}:learning:mode:change`, {
      newMode: decision.newLearningMode,
      reason: decision.reason,
      duration: decision.duration,
      priority: decision.priority,
      orchestratorDecision: true,
    });
    
    // Store decision in memory for learning from our own decisions
    await this.memoryCoordinator.store(
      `learning_orchestrator_decision_${decision.swarmId}_${Date.now()}`,
      decision,
      {
        persistent: true,
        importance: 0.8,
        tags: ['learning', 'orchestration', 'decision', decision.priority],
      }
    );
  }

  /**
   * Handle direct learning requests from Queen Coordinators
   */
  private async handleLearningRequest(request: any): Promise<void> {
    this.logger.info(`Learning request from Queen Coordinator: ${request.reason}`);
    
    const decision: LearningDecision = {
      swarmId: request.swarmId,
      newLearningMode: request.requestedMode || 'active',
      reason: `queen_coordinator_request: ${request.reason}`,
      duration: request.duration || 60,
      priority: request.priority || 'medium',
    };
    
    await this.implementLearningDecision(decision);
    this.learningDecisionHistory.push(decision);
  }

  /**
   * Evaluate if strategic decisions require learning mode changes
   */
  private async evaluateStrategicLearning(strategic: any): Promise<void> {
    if (strategic.requiresLearning || strategic.complexity === 'high') {
      // Strategic decisions may require enhanced learning
      for (const swarmId of strategic.affectedSwarms || []) {
        const decision: LearningDecision = {
          swarmId,
          newLearningMode: 'aggressive',
          reason: `strategic_decision_requires_enhanced_learning: ${strategic.decisionType}`,
          duration: 180, // 3 hours for strategic learning
          priority: 'high',
        };
        
        await this.implementLearningDecision(decision);
        this.learningDecisionHistory.push(decision);
      }
    }
  }

  /**
   * Handle system performance degradation
   */
  private async handlePerformanceDegradation(alert: any): Promise<void> {
    this.logger.warn(`System performance degraded: ${alert.reason}`);
    
    // Switch all swarms to aggressive learning mode
    for (const [swarmId, status] of this.swarmLearningStatus.entries()) {
      const decision: LearningDecision = {
        swarmId,
        newLearningMode: 'aggressive',
        reason: `system_performance_degradation: ${alert.reason}`,
        duration: 240, // 4 hours of intensive learning
        priority: 'critical',
      };
      
      await this.implementLearningDecision(decision);
      this.learningDecisionHistory.push(decision);
    }
  }

  /**
   * Monitor all swarm performance continuously
   */
  private monitorSwarmPerformance(): void {
    for (const [swarmId, status] of this.swarmLearningStatus.entries()) {
      // Check if learning duration has expired
      const learningAge = Date.now() - status.lastLearningCycle.getTime();
      const lastDecision = this.learningDecisionHistory
        .filter(d => d.swarmId === swarmId)
        .sort((a, b) => b.duration - a.duration)[0];
      
      if (lastDecision && learningAge > (lastDecision.duration * 60 * 1000)) {
        // Learning period expired, evaluate if we should continue or change mode
        this.evaluateLearningContinuation(swarmId, status);
      }
    }
  }

  /**
   * Evaluate whether to continue current learning or change
   */
  private async evaluateLearningContinuation(swarmId: string, status: SwarmLearningStatus): Promise<void> {
    const newMode = this.decideLearningMode(status);
    
    if (newMode !== status.learningMode) {
      const decision: LearningDecision = {
        swarmId,
        newLearningMode: newMode,
        reason: 'learning_period_expired_reevaluation',
        duration: this.calculateLearningDuration(status.performanceScore),
        priority: this.calculateLearningPriority(status.performanceScore),
      };
      
      await this.implementLearningDecision(decision);
      this.learningDecisionHistory.push(decision);
    }
  }

  /**
   * Trigger coordination learning cycle
   */
  private triggerCoordinationLearning(): void {
    this.eventBus.emit('learning:coordination:cycle', {
      timestamp: new Date(),
      swarms: Array.from(this.swarmLearningStatus.keys()),
      orchestrator: 'LearningOrchestrator',
    });
  }

  /**
   * Trigger deep learning cycle
   */
  private triggerDeepLearning(): void {
    this.eventBus.emit('learning:deep:cycle', {
      timestamp: new Date(),
      swarms: Array.from(this.swarmLearningStatus.keys()),
      orchestrator: 'LearningOrchestrator',
      neuralService: true,
    });
  }

  /**
   * Extract swarm ID from event data
   */
  private extractSwarmId(data: any): string {
    // Extract from event channel or data
    return data.swarmId || data.source || `swarm_${Date.now()}`;
  }

  /**
   * Get current learning orchestration status
   */
  public getLearningStatus(): {
    activeSwarms: number;
    learningModes: Record<string, number>;
    averagePerformance: number;
    recentDecisions: LearningDecision[];
  } {
    const learningModes = { passive: 0, active: 0, aggressive: 0, experimental: 0 };
    let totalPerformance = 0;
    
    for (const status of this.swarmLearningStatus.values()) {
      learningModes[status.learningMode]++;
      totalPerformance += status.performanceScore;
    }
    
    return {
      activeSwarms: this.swarmLearningStatus.size,
      learningModes,
      averagePerformance: totalPerformance / this.swarmLearningStatus.size || 0,
      recentDecisions: this.learningDecisionHistory.slice(-10),
    };
  }

  /**
   * Shutdown learning orchestrator
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down Learning Orchestrator');
    this.removeAllListeners();
  }
}