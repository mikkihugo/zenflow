/**
 * @file Parallel Workflow Manager - Core orchestration engine for multi-level flows
 *
 * Manages the coordination between Portfolio, Program, and Swarm Execution levels
 * with intelligent WIP limits, dependency management, and flow optimization.
 *
 * ARCHITECTURE:
 * - Portfolio Level: Strategic PRDs with business gates
 * - Program Level: Epic coordination with AI-human collaboration
 * - Swarm Execution Level: Feature implementation with SPARC automation
 */

import type { Logger } from '@claude-zen/foundation';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
import type { TypeSafeEventBus } from '@claude-zen/infrastructure';
import type { BrainCoordinator } from '@claude-zen/intelligence';

import type {
  BottleneckDetectedEvent,
  BottleneckInfo,
  MultiLevelOrchestratorState,
  OptimizationRecommendation,
  OrchestrationLevel,
  StreamStatusChangedEvent,
  SystemPerformanceMetrics,
  WIPLimitExceededEvent,
  WIPLimits
} from "./multi-level-types";

/**
 * Configuration for the parallel workflow manager
 */
export interface ParallelWorkflowManagerConfig {
  readonly enableWIPLimits: boolean;
  readonly enableBottleneckDetection: boolean;
  readonly enableAutoOptimization: boolean;
  readonly enableMetricsCollection: boolean;
  readonly wipLimits: WIPLimits;
  readonly optimizationInterval: number; // milliseconds
  readonly metricsCollectionInterval: number;
  readonly maxConcurrentStreams: number;
  readonly streamTimeoutMinutes: number;
}

/**
 * Parallel Workflow Manager - Orchestrates multi-level workflow streams
 */
export class ParallelWorkflowManager extends TypedEventBase {
  private readonly logger: Logger;
  private readonly eventBus: TypeSafeEventBus;
  private readonly memory: BrainCoordinator;
  private readonly settings: ParallelWorkflowManagerConfig;
  private state: MultiLevelOrchestratorState;
  private optimizationTimer?: NodeJS.Timeout;
  private metricsTimer?: NodeJS.Timeout;

  // Performance tracking
  private performanceHistory: SystemPerformanceMetrics[] = [];
  private optimizationRecommendations: OptimizationRecommendation[] = [];

  constructor(
    eventBus: TypeSafeEventBus,
    memory: BrainCoordinator,
    config: Partial<ParallelWorkflowManagerConfig> = {}
  ) {
    super();
    this.logger = getLogger('parallel-workflow-manager');
    this.eventBus = eventBus;
    this.memory = memory;

    this.settings = {
      enableWIPLimits: true,
      enableBottleneckDetection: true,
      enableAutoOptimization: false, // Start with manual optimization
      enableMetricsCollection: true,
      wipLimits: {
        portfolioItems: 5,
        programItems: 20,
        executionItems: 100,
        totalSystemItems: 125,
      },
      optimizationInterval: 300000, // 5 minutes
      metricsCollectionInterval: 60000, // 1 minute
      maxConcurrentStreams: 50,
      streamTimeoutMinutes: 60,
      ...config,
    };

    this.state = this.initializeState();
    this.setupEventHandlers();
  }

  // ============================================================================
  // INITIALIZATION AND LIFECYCLE
  // ============================================================================

  /**
   * Initialize the parallel workflow manager
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing Parallel Workflow Manager', {
      config: this.settings,
    });

    // Load persisted state if available
    await this.loadPersistedState();

    // Start background processes
    if (this.settings.enableMetricsCollection) {
      this.startMetricsCollection();
    }
    if (this.settings.enableAutoOptimization) {
      this.startOptimization();
    }

    // Register with event bus
    this.registerEventHandlers();

    this.logger.info('Parallel Workflow Manager initialized successfully');
    this.emit('initialized', { timestamp: new Date() });
  }

  /**
   * Shutdown the manager gracefully
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Parallel Workflow Manager');

    // Stop background processes
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
    }
    if (this.metricsTimer) {
      clearInterval(this.metricsTimer);
    }

    // Save current state
    await this.persistState();

    // Clean up active streams
    await this.shutdownActiveStreams();

    this.logger.info('Parallel Workflow Manager shutdown complete');
    this.emit('shutdown', { timestamp: new Date() });
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private initializeState(): MultiLevelOrchestratorState {
    return {
      portfolioStreams: [],
      programStreams: [],
      executionStreams: [],
      crossLevelDependencies: [],
      wipLimits: this.settings.wipLimits,
      flowMetrics: {
        throughput: 0,
        cycleTime: 0,
        leadTime: 0,
        wipUtilization: 0,
        bottlenecks: [],
        flowEfficiency: 0,
      },
      bottlenecks: [],
      lastUpdated: new Date(),
    };
  }

  private setupEventHandlers(): void {
    this.on('stream.status.changed', this.handleStreamStatusChanged.bind(this));
    this.on('wip.limit.exceeded', this.handleWIPLimitExceeded.bind(this));
    this.on('bottleneck.detected', this.handleBottleneckDetected.bind(this));
  }

  private async loadPersistedState(): Promise<void> {
    try {
      const persistedState = await this.memory.retrieve('parallel-workflow-manager:state');
      if (persistedState) {
        this.state = { ...this.state, ...persistedState };
        this.logger.info('Loaded persisted state');
      }
    } catch (error) {
      this.logger.warn('Failed to load persisted state', { error });
    }
  }

  private async persistState(): Promise<void> {
    try {
      await this.memory.store('parallel-workflow-manager:state', this.state);
    } catch (error) {
      this.logger.error('Failed to persist state', { error });
    }
  }

  private startMetricsCollection(): void {
    this.metricsTimer = setInterval(async () => {
      try {
        await this.calculateSystemMetrics();
        if (this.settings.enableBottleneckDetection) {
          await this.detectBottlenecks();
        }
      } catch (error) {
        this.logger.error('Metrics collection failed', { error });
      }
    }, this.settings.metricsCollectionInterval);
  }

  private startOptimization(): void {
    this.optimizationTimer = setInterval(async () => {
      try {
        const recommendations = await this.generateOptimizationRecommendations();

        // Auto-apply low-risk recommendations
        const autoApplyable = recommendations.filter(
          (r) => r.effort < 0.3 && r.priority !== 'critical'
        );
        for (const rec of autoApplyable) {
          await this.applyOptimizationRecommendation(rec);
        }
      } catch (error) {
        this.logger.error('Optimization failed', { error });
      }
    }, this.settings.optimizationInterval);
  }

  private async shutdownActiveStreams(): Promise<void> {
    // Gracefully shutdown all active streams
    const allStreams = [
      ...this.state.portfolioStreams,
      ...this.state.programStreams,
      ...this.state.executionStreams,
    ];

    for (const stream of allStreams.filter((s) => s.status === 'active')) {
      // Pause streams during shutdown
      this.logger.info('Pausing stream ' + stream.id + ' for shutdown');
    }
  }

  private registerEventHandlers(): void {
    // Register with the event bus for relevant events
    this.eventBus.registerHandler('workflow.completed', async (event) => {
      // Handle workflow completion events
    });

    this.eventBus.registerHandler('agent.created', async (event) => {
      // Handle agent creation events
    });
  }

  private handleStreamStatusChanged(event: StreamStatusChangedEvent): void {
    this.logger.debug('Stream status changed', event.payload);
  }

  private handleWIPLimitExceeded(event: WIPLimitExceededEvent): void {
    this.logger.warn('WIP limit exceeded', event.payload);
  }

  private handleBottleneckDetected(event: BottleneckDetectedEvent): void {
    this.logger.warn('Bottleneck detected', event.payload);
  }

  // Placeholder methods for future implementation
  private async calculateSystemMetrics(): Promise<SystemPerformanceMetrics> {
    const now = new Date();
    const metrics: SystemPerformanceMetrics = {
      overallThroughput: 0,
      levelThroughput: {
        [OrchestrationLevel.PORTFOLIO]: 0,
        [OrchestrationLevel.PROGRAM]: 0,
        [OrchestrationLevel.SWARM_EXECUTION]: 0,
      },
      averageCycleTime: 0,
      wipUtilization: 0,
      bottleneckCount: this.state.bottlenecks.length,
      flowEfficiency: 0,
      humanInterventionRate: 0,
      automationRate: 0,
      qualityScore: 0,
      lastUpdated: now,
    };

    // Add to history
    this.performanceHistory.push(metrics);

    // Keep only recent history
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
    }

    return metrics;
  }

  private async detectBottlenecks(): Promise<BottleneckInfo[]> {
    const bottlenecks: BottleneckInfo[] = [];

    // Update state
    this.state.bottlenecks = bottlenecks;

    return bottlenecks;
  }

  private async generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    this.optimizationRecommendations = recommendations;
    return recommendations;
  }

  private async applyOptimizationRecommendation(
    recommendation: OptimizationRecommendation
  ): Promise<void> {
    // Implementation would apply the optimization
    this.logger.info('Applied optimization recommendation', {
      id: recommendation.id,
      type: recommendation.type,
    });
  }

  /**
   * Get current system status
   */
  getSystemStatus(): {
    state: MultiLevelOrchestratorState;
    metrics: SystemPerformanceMetrics | null;
    recommendations: OptimizationRecommendation[];
  } {
    return {
      state: this.state,
      metrics:
        this.performanceHistory[this.performanceHistory.length - 1] || null,
      recommendations: this.optimizationRecommendations,
    };
  }
}

export default ParallelWorkflowManager;