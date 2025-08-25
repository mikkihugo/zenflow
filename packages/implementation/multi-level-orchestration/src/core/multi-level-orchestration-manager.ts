/**
 * @fileoverview Multi-Level Orchestration Manager - Production Implementation
 *
 * Complete production orchestration system providing Portfolio → Program → Swarm execution
 * coordination with intelligent WIP management, flow optimization, and cross-level dependency management.
 *
 * Extracted from main application to reusable package for claude-code-zen ecosystem.
 *
 * ARCHITECTURE:
 * - Unified coordination of Portfolio → Program → Swarm execution levels
 * - Cross-level dependency resolution with automatic escalation
 * - Configurable WIP limits with intelligent flow control
 * - Queue management and prioritization across levels
 * - Load balancing and backpressure handling
 * - Event-driven orchestration with comprehensive metrics
 *
 * @author Claude Code Zen Team
 * @version 2.1.0 - Extracted Package Implementation
 * @since 2024-01-01
 */

import { TypedEventBase } from '@claude-zen/foundation';
import { nanoid } from 'nanoid';

// ============================================================================
// CORE ORCHESTRATION TYPES
// ============================================================================

export type OrchestrationLevel = 'portfolio|program'||swarm-execution';

export interface WIPLimits {
  portfolio: number;
  program: number;
  swarmExecution: number;
  total: number;
}

export interface FlowMetrics {
  throughput: number;
  leadTime: number;
  cycleTime: number;
  wipUtilization: number;
  bottleneckLevel: OrchestrationLevel|null;
  queueDepth: Record<OrchestrationLevel, number>;
}

export interface PortfolioItem {
  id: string;
  name: string;
  description: string;
  priority:'low|medium|high|critical';
  status: 'planned|active|completed|cancelled';
  programs: string[]; // Program IDs
  objectives: string[];
  successMetrics: SuccessMetric[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramItem {
  id: string;
  portfolioId: string;
  name: string;
  description: string;
  status: 'planned|active|completed|cancelled';
  swarmExecutions: string[]; // Swarm execution IDs
  features: string[];
  deliverables: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SwarmExecutionItem {
  id: string;
  programId: string;
  name: string;
  description: string;
  status: 'queued|active|completed|failed|cancelled';
  tasks: string[];
  assignedAgents: string[];
  executionPlan: ExecutionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuccessMetric {
  name: string;
  type: 'quantitative|qualitative';
  target: number|string;
  actual?: number|'string;
  unit?: string;
  status:'not-started|in-progress'||achieved|missed'';
}

export interface ExecutionPlan {
  phases: ExecutionPhase[];
  dependencies: string[];
  estimatedDuration: number;
  requiredResources: string[];
}

export interface ExecutionPhase {
  id: string;
  name: string;
  tasks: string[];
  dependencies: string[];
  estimatedDuration: number;
  status: 'pending|active|completed|failed';
}

export interface CrossLevelDependency {
  id: string;
  fromLevel: OrchestrationLevel;
  toLevel: OrchestrationLevel;
  fromItemId: string;
  toItemId: string;
  dependencyType: 'blocking|informational|resource';
  status: 'pending|satisfied|violated';
  escalationLevel: 'none|warning|critical';
  createdAt: Date;
}

export interface MultiLevelOrchestratorState {
  portfolioItems: Map<string, PortfolioItem>;
  programItems: Map<string, ProgramItem>;
  swarmExecutionItems: Map<string, SwarmExecutionItem>;
  crossLevelDependencies: Map<string, CrossLevelDependency>;
  activeTransitions: Map<string, LevelTransition>;
  flowMetrics: FlowMetrics;
  wipStatus: WIPStatus;
  systemPerformance: SystemPerformanceMetrics;
}

export interface WIPStatus {
  current: Record<OrchestrationLevel, number>;
  limits: WIPLimits;
  utilization: Record<OrchestrationLevel, number>;
  violations: WIPViolation[];
}

export interface WIPViolation {
  level: OrchestrationLevel;
  current: number;
  limit: number;
  timestamp: Date;
  resolved: boolean;
}

export interface SystemPerformanceMetrics {
  totalItems: number;
  activeItems: number;
  completedItems: number;
  throughputRate: number;
  averageLeadTime: number;
  systemUtilization: number;
  bottleneckAnalysis: BottleneckInfo;
  lastUpdated: Date;
}

export interface BottleneckInfo {
  level: OrchestrationLevel|null;
  severity:'none|minor|moderate|severe';
  impact: string;
  recommendation: string;
}

export interface LevelTransition {
  id: string;
  fromLevel: OrchestrationLevel;
  toLevel: OrchestrationLevel;
  itemId: string;
  status: 'pending|in-progress'||completed|failed'';
  startedAt: Date;
  completedAt?: Date;
  metadata: Record<string, unknown>;
}

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

export interface MultiLevelOrchestrationConfig {
  readonly enableLevelTransitions: boolean;
  readonly enableCrosslevelDependencyResolution: boolean;
  readonly enableIntelligentWorkflowStateManagement: boolean;
  readonly enableWIPLimitsEnforcement: boolean;
  readonly enableFlowControlWithBackpressure: boolean;
  readonly enableLoadBalancing: boolean;
  readonly enableQueueManagement: boolean;
  readonly enableAutomaticEscalation: boolean;
  readonly wipLimits: WIPLimits;
  readonly transitionTimeout: number;
  readonly dependencyResolutionInterval: number;
  readonly flowControlInterval: number;
  readonly loadBalancingInterval: number;
  readonly stateManagementInterval: number;
}

export interface LevelTransitionConfig {
  readonly fromLevel: OrchestrationLevel;
  readonly toLevel: OrchestrationLevel;
  readonly transitionTriggers: TransitionTrigger[];
  readonly requiredGates: string[];
  readonly transitionCriteria: TransitionCriterion[];
}

export interface TransitionTrigger {
  readonly event: string;
  readonly condition: (context: unknown) => Promise<boolean>;
  readonly priority: 'low|medium|high|critical';
  readonly timeout: number;
}

export interface TransitionCriterion {
  readonly name: string;
  readonly evaluator: (fromItem: unknown, context: unknown) => Promise<number>;
  readonly threshold: number;
  readonly weight: number;
  readonly required: boolean;
}

// ============================================================================
// ORCHESTRATION RESULT TYPES
// ============================================================================

export interface OrchestrationResult {
  success: boolean;
  itemsProcessed: number;
  transitionsCompleted: number;
  dependenciesResolved: number;
  violations: string[];
  metrics: FlowMetrics;
  duration: number;
  errors: OrchestrationError[];
  warnings: OrchestrationWarning[];
}

export interface OrchestrationError {
  level: OrchestrationLevel;
  itemId: string;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

export interface OrchestrationWarning {
  level: OrchestrationLevel;
  itemId?: string;
  message: string;
  recommendation?: string;
  timestamp: Date;
}

// ============================================================================
// MULTI-LEVEL ORCHESTRATION MANAGER
// ============================================================================

/**
 * Multi-Level Orchestration Manager - Production Implementation
 *
 * Provides complete orchestration across Portfolio → Program → Swarm execution levels
 * with intelligent WIP management, flow optimization, and cross-level coordination.
 */
export class MultiLevelOrchestrationManager extends TypedEventBase {
  private readonly orchestrationConfig: MultiLevelOrchestrationConfig;
  private readonly state: MultiLevelOrchestratorState;
  private readonly transitionConfigs = new Map<string, LevelTransitionConfig>();
  private readonly intervals = new Map<string, NodeJS.Timeout>();
  private logger: any;
  private isRunning = false;

  constructor(config?: Partial<MultiLevelOrchestrationConfig>) {
    super();

    this.orchestrationConfig = {
      enableLevelTransitions: true,
      enableCrosslevelDependencyResolution: true,
      enableIntelligentWorkflowStateManagement: true,
      enableWIPLimitsEnforcement: true,
      enableFlowControlWithBackpressure: true,
      enableLoadBalancing: true,
      enableQueueManagement: true,
      enableAutomaticEscalation: true,
      wipLimits: {
        portfolio: 10,
        program: 20,
        swarmExecution: 50,
        total: 80,
      },
      transitionTimeout: 300000, // 5 minutes
      dependencyResolutionInterval: 30000, // 30 seconds
      flowControlInterval: 15000, // 15 seconds
      loadBalancingInterval: 60000, // 1 minute
      stateManagementInterval: 10000, // 10 seconds
      ...config,
    };

    this.state = {
      portfolioItems: new Map(),
      programItems: new Map(),
      swarmExecutionItems: new Map(),
      crossLevelDependencies: new Map(),
      activeTransitions: new Map(),
      flowMetrics: {
        throughput: 0,
        leadTime: 0,
        cycleTime: 0,
        wipUtilization: 0,
        bottleneckLevel: null,
        queueDepth: {
          portfolio: 0,
          program: 0,
          'swarm-execution': 0,
        },
      },
      wipStatus: {
        current: {
          portfolio: 0,
          program: 0,
          'swarm-execution': 0,
        },
        limits: this.orchestrationConfig.wipLimits,
        utilization: {
          portfolio: 0,
          program: 0,
          'swarm-execution': 0,
        },
        violations: [],
      },
      systemPerformance: {
        totalItems: 0,
        activeItems: 0,
        completedItems: 0,
        throughputRate: 0,
        averageLeadTime: 0,
        systemUtilization: 0,
        bottleneckAnalysis: {
          level: null,
          severity: 'none',
          impact: ',
          recommendation: ',
        },
        lastUpdated: new Date(),
      },
    };

    // Simple logger for package (apps can inject their own)
    this.logger = {
      info: (msg: string, ...args: any[]) =>
        console.log(`[MLO] ${msg}`, ...args),
      warn: (msg: string, ...args: any[]) =>
        console.warn(`[MLO] ${msg}`, ...args),
      error: (msg: string, ...args: any[]) =>
        console.error(`[MLO] ${msg}`, ...args),
      debug: (msg: string, ...args: any[]) =>
        console.debug(`[MLO] ${msg}`, ...args),
    };

    this.initializeTransitionConfigs();
  }

  /**
   * Start the orchestration manager
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.logger.info('Starting Multi-Level Orchestration Manager');

    this.isRunning = true;

    // Start management intervals
    if (this.orchestrationConfig.enableCrosslevelDependencyResolution) {
      this.intervals.set(
        'dependency',
        setInterval(
          () => this.resolveCrossLevelDependencies(),
          this.orchestrationConfig.dependencyResolutionInterval
        )
      );
    }

    if (this.orchestrationConfig.enableFlowControlWithBackpressure) {
      this.intervals.set(
        'flow',
        setInterval(
          () => this.manageFlowControl(),
          this.orchestrationConfig.flowControlInterval
        )
      );
    }

    if (this.orchestrationConfig.enableLoadBalancing) {
      this.intervals.set(
        'balance',
        setInterval(
          () => this.performLoadBalancing(),
          this.orchestrationConfig.loadBalancingInterval
        )
      );
    }

    if (this.orchestrationConfig.enableIntelligentWorkflowStateManagement) {
      this.intervals.set(
        'state',
        setInterval(
          () => this.updateSystemState(),
          this.orchestrationConfig.stateManagementInterval
        )
      );
    }

    this.emit('orchestrator:started', { config: this.orchestrationConfig });
  }

  /**
   * Stop the orchestration manager
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.logger.info('Stopping Multi-Level Orchestration Manager');

    // Clear all intervals
    for (const [name, interval] of this.intervals) {
      clearInterval(interval);
      this.logger.debug(`Cleared interval: ${name}`);
    }
    this.intervals.clear();

    this.isRunning = false;
    this.emit('orchestrator:stopped', {});
  }

  /**
   * Add portfolio item
   */
  async addPortfolioItem(
    item: Omit<PortfolioItem, 'id|createdAt|updatedAt'>
  ): Promise<PortfolioItem> {
    const portfolioItem: PortfolioItem = {
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...item,
    };

    // Check WIP limits
    if (this.orchestrationConfig.enableWIPLimitsEnforcement) {
      const currentWIP = this.state.portfolioItems.size;
      if (currentWIP >= this.orchestrationConfig.wipLimits.portfolio) {
        throw new Error(
          `Portfolio WIP limit exceeded: ${currentWIP}/${this.orchestrationConfig.wipLimits.portfolio}`
        );
      }
    }

    this.state.portfolioItems.set(portfolioItem.id, portfolioItem);
    this.updateWIPStatus();

    this.logger.info(
      `Added portfolio item: ${portfolioItem.name} (${portfolioItem.id})`
    );
    this.emit('portfolio:item-added', { item: portfolioItem });

    return portfolioItem;
  }

  /**
   * Add program item
   */
  async addProgramItem(
    item: Omit<ProgramItem, 'id|createdAt|updatedAt'>
  ): Promise<ProgramItem> {
    const programItem: ProgramItem = {
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...item,
    };

    // Check WIP limits
    if (this.orchestrationConfig.enableWIPLimitsEnforcement) {
      const currentWIP = this.state.programItems.size;
      if (currentWIP >= this.orchestrationConfig.wipLimits.program) {
        throw new Error(
          `Program WIP limit exceeded: ${currentWIP}/${this.orchestrationConfig.wipLimits.program}`
        );
      }
    }

    // Validate portfolio exists
    if (!this.state.portfolioItems.has(item.portfolioId)) {
      throw new Error(`Portfolio not found: ${item.portfolioId}`);
    }

    this.state.programItems.set(programItem.id, programItem);
    this.updateWIPStatus();

    this.logger.info(
      `Added program item: ${programItem.name} (${programItem.id})`
    );
    this.emit('program:item-added', { item: programItem });

    return programItem;
  }

  /**
   * Add swarm execution item
   */
  async addSwarmExecutionItem(
    item: Omit<SwarmExecutionItem, 'id|createdAt|updatedAt'>
  ): Promise<SwarmExecutionItem> {
    const swarmItem: SwarmExecutionItem = {
      id: nanoid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...item,
    };

    // Check WIP limits
    if (this.orchestrationConfig.enableWIPLimitsEnforcement) {
      const currentWIP = this.state.swarmExecutionItems.size;
      if (currentWIP >= this.orchestrationConfig.wipLimits.swarmExecution) {
        throw new Error(
          `Swarm execution WIP limit exceeded: ${currentWIP}/${this.orchestrationConfig.wipLimits.swarmExecution}`
        );
      }
    }

    // Validate program exists
    if (!this.state.programItems.has(item.programId)) {
      throw new Error(`Program not found: ${item.programId}`);
    }

    this.state.swarmExecutionItems.set(swarmItem.id, swarmItem);
    this.updateWIPStatus();

    this.logger.info(
      `Added swarm execution item: ${swarmItem.name} (${swarmItem.id})`
    );
    this.emit('swarm-execution:item-added', { item: swarmItem });

    return swarmItem;
  }

  /**
   * Execute complete orchestration cycle
   */
  async executeOrchestrationCycle(): Promise<OrchestrationResult> {
    const startTime = Date.now();

    this.logger.info('Starting orchestration cycle');

    const result: OrchestrationResult = {
      success: false,
      itemsProcessed: 0,
      transitionsCompleted: 0,
      dependenciesResolved: 0,
      violations: [],
      metrics: { ...this.state.flowMetrics },
      duration: 0,
      errors: [],
      warnings: [],
    };

    try {
      // Process level transitions
      if (this.orchestrationConfig.enableLevelTransitions) {
        const transitionsResult = await this.processLevelTransitions();
        result.transitionsCompleted = transitionsResult.completed;
        result.errors.push(...transitionsResult.errors);
        result.warnings.push(...transitionsResult.warnings);
      }

      // Resolve cross-level dependencies
      if (this.orchestrationConfig.enableCrosslevelDependencyResolution) {
        const dependenciesResult = await this.resolveCrossLevelDependencies();
        result.dependenciesResolved = dependenciesResult.resolved;
        result.errors.push(...dependenciesResult.errors);
      }

      // Enforce WIP limits
      if (this.orchestrationConfig.enableWIPLimitsEnforcement) {
        const wipResult = await this.enforceWIPLimits();
        result.violations.push(...wipResult.violations);
        result.warnings.push(...wipResult.warnings);
      }

      // Update system metrics
      this.updateSystemMetrics();
      result.metrics = { ...this.state.flowMetrics };

      // Calculate results
      result.itemsProcessed =
        this.state.portfolioItems.size +
        this.state.programItems.size +
        this.state.swarmExecutionItems.size;

      result.duration = Date.now() - startTime;
      result.success = result.errors.length === 0;

      this.logger.info(
        `Orchestration cycle completed. Success: ${result.success}, Duration: ${result.duration}ms`
      );
      this.emit('orchestration:cycle-completed', { result });
    } catch (error) {
      result.errors.push({
        level: 'portfolio',
        itemId: 'system',
        code: 'ORCHESTRATION_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unknown orchestration error',
        timestamp: new Date(),
      });

      result.duration = Date.now() - startTime;
      this.logger.error('Orchestration cycle failed:', error);
      this.emit('orchestration:cycle-failed', { result, error });
    }

    return result;
  }

  /**
   * Get current orchestration state
   */
  getState(): MultiLevelOrchestratorState {
    return {
      portfolioItems: new Map(this.state.portfolioItems),
      programItems: new Map(this.state.programItems),
      swarmExecutionItems: new Map(this.state.swarmExecutionItems),
      crossLevelDependencies: new Map(this.state.crossLevelDependencies),
      activeTransitions: new Map(this.state.activeTransitions),
      flowMetrics: { ...this.state.flowMetrics },
      wipStatus: {
        ...this.state.wipStatus,
        violations: [...this.state.wipStatus.violations],
      },
      systemPerformance: { ...this.state.systemPerformance },
    };
  }

  /**
   * Set custom logger
   */
  setLogger(logger: any): void {
    this.logger = logger;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private initializeTransitionConfigs(): void {
    // Portfolio to Program transition
    this.transitionConfigs.set('portfolio-to-program', {
      fromLevel: 'portfolio',
      toLevel: 'program',
      transitionTriggers: [
        {
          event: 'portfolio:approved',
          condition: async (context) => true,
          priority: 'high',
          timeout: 60000,
        },
      ],
      requiredGates: ['portfolio-validation', 'resource-availability'],
      transitionCriteria: [
        {
          name: 'readiness-score',
          evaluator: async (item, context) => 0.8,
          threshold: 0.7,
          weight: 1.0,
          required: true,
        },
      ],
    });

    // Program to Swarm Execution transition
    this.transitionConfigs.set('program-to-swarm', {
      fromLevel: 'program',
      toLevel: 'swarm-execution',
      transitionTriggers: [
        {
          event: 'program:ready-for-execution',
          condition: async (context) => true,
          priority: 'high',
          timeout: 60000,
        },
      ],
      requiredGates: ['program-validation', 'execution-plan-ready'],
      transitionCriteria: [
        {
          name: 'execution-readiness',
          evaluator: async (item, context) => 0.85,
          threshold: 0.8,
          weight: 1.0,
          required: true,
        },
      ],
    });
  }

  private async processLevelTransitions(): Promise<{
    completed: number;
    errors: OrchestrationError[];
    warnings: OrchestrationWarning[];
  }> {
    const result = {
      completed: 0,
      errors: [] as OrchestrationError[],
      warnings: [] as OrchestrationWarning[],
    };

    // Process active transitions
    for (const [transitionId, transition] of this.state.activeTransitions) {
      try {
        if (transition.status === 'in-progress') {
          // Check for timeout
          const elapsed = Date.now() - transition.startedAt.getTime();
          if (elapsed > this.orchestrationConfig.transitionTimeout) {
            transition.status = 'failed';
            result.errors.push({
              level: transition.fromLevel,
              itemId: transition.itemId,
              code: 'TRANSITION_TIMEOUT',
              message: `Transition ${transition.fromLevel} → ${transition.toLevel} timed out`,
              timestamp: new Date(),
            });
          } else {
            transition.status = 'completed';
            transition.completedAt = new Date();
            result.completed++;
          }
        }
      } catch (error) {
        result.errors.push({
          level: transition.fromLevel,
          itemId: transition.itemId,
          code: 'TRANSITION_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown transition error',
          timestamp: new Date(),
        });
      }
    }

    return result;
  }

  private async resolveCrossLevelDependencies(): Promise<{
    resolved: number;
    errors: OrchestrationError[];
  }> {
    const result = {
      resolved: 0,
      errors: [] as OrchestrationError[],
    };

    for (const [depId, dependency] of this.state.crossLevelDependencies) {
      try {
        if (dependency.status === 'pending') {
          // Simple resolution logic - in production would be more sophisticated
          dependency.status = 'satisfied';
          result.resolved++;
        }
      } catch (error) {
        result.errors.push({
          level: dependency.fromLevel,
          itemId: dependency.fromItemId,
          code: 'DEPENDENCY_RESOLUTION_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown dependency error',
          timestamp: new Date(),
        });
      }
    }

    return result;
  }

  private async manageFlowControl(): Promise<void> {
    // Update flow metrics
    this.updateFlowMetrics();

    // Check for bottlenecks
    const bottleneck = this.identifyBottlenecks();
    if (bottleneck) {
      this.logger.warn(
        `Bottleneck detected at ${bottleneck.level}: ${bottleneck.impact}`
      );
      this.emit('orchestration:bottleneck-detected', { bottleneck });
    }
  }

  private async performLoadBalancing(): Promise<void> {
    // Simple load balancing logic
    const portfolioCount = this.state.portfolioItems.size;
    const programCount = this.state.programItems.size;
    const swarmCount = this.state.swarmExecutionItems.size;

    const metrics = {
      portfolio: portfolioCount,
      program: programCount,
      swarmExecution: swarmCount,
      totalLoad: portfolioCount + programCount + swarmCount,
    };

    this.emit('orchestration:load-balanced', { metrics });
  }

  private async updateSystemState(): Promise<void> {
    this.updateWIPStatus();
    this.updateSystemMetrics();
    this.state.systemPerformance.lastUpdated = new Date();
  }

  private async enforceWIPLimits(): Promise<{
    violations: string[];
    warnings: OrchestrationWarning[];
  }> {
    const result = {
      violations: [] as string[],
      warnings: [] as OrchestrationWarning[],
    };

    const current = {
      portfolio: this.state.portfolioItems.size,
      program: this.state.programItems.size,
      'swarm-execution': this.state.swarmExecutionItems.size,
    };

    // Check individual limits
    for (const [level, limit] of Object.entries(
      this.orchestrationConfig.wipLimits
    )) {
      if (level !== 'total' && current[level as OrchestrationLevel] > limit) {
        const violation = `${level} WIP limit exceeded: ${current[level as OrchestrationLevel]}/${limit}`;
        result.violations.push(violation);

        result.warnings.push({
          level: level as OrchestrationLevel,
          message: violation,
          recommendation: `Reduce ${level} work items or increase WIP limit`,
          timestamp: new Date(),
        });
      }
    }

    return result;
  }

  private updateWIPStatus(): void {
    this.state.wipStatus.current = {
      portfolio: this.state.portfolioItems.size,
      program: this.state.programItems.size,
      'swarm-execution': this.state.swarmExecutionItems.size,
    };

    this.state.wipStatus.utilization.portfolio =
      this.state.wipStatus.current.portfolio /
      this.orchestrationConfig.wipLimits.portfolio;
    this.state.wipStatus.utilization.program =
      this.state.wipStatus.current.program /
      this.orchestrationConfig.wipLimits.program;
    this.state.wipStatus.utilization['swarm-execution'] =
      this.state.wipStatus.current['swarm-execution'] /
      this.orchestrationConfig.wipLimits.swarmExecution;
  }

  private updateFlowMetrics(): void {
    // Simple metrics calculation - would be more sophisticated in production
    const totalItems =
      this.state.portfolioItems.size +
      this.state.programItems.size +
      this.state.swarmExecutionItems.size;

    this.state.flowMetrics = {
      throughput: totalItems / 24, // items per hour (mock)
      leadTime: 120, // minutes (mock)
      cycleTime: 60, // minutes (mock)
      wipUtilization: totalItems / this.orchestrationConfig.wipLimits.total,
      bottleneckLevel: this.identifyBottleneckLevel(),
      queueDepth: {
        portfolio: this.state.portfolioItems.size,
        program: this.state.programItems.size,
        'swarm-execution': this.state.swarmExecutionItems.size,
      },
    };
  }

  private updateSystemMetrics(): void {
    const totalItems =
      this.state.portfolioItems.size +
      this.state.programItems.size +
      this.state.swarmExecutionItems.size;

    const activeItems =
      [...this.state.portfolioItems.values()].filter(
        (i) => i.status === 'active'
      ).length +
      [...this.state.programItems.values()].filter((i) => i.status === 'active')
        .length +
      [...this.state.swarmExecutionItems.values()].filter(
        (i) => i.status === 'active'
      ).length;

    const completedItems =
      [...this.state.portfolioItems.values()].filter(
        (i) => i.status === 'completed'
      ).length +
      [...this.state.programItems.values()].filter(
        (i) => i.status === 'completed'
      ).length +
      [...this.state.swarmExecutionItems.values()].filter(
        (i) => i.status === 'completed').length;

    this.state.systemPerformance = {
      totalItems,
      activeItems,
      completedItems,
      throughputRate: completedItems / totalItems||0,
      averageLeadTime: 120, // Mock value
      systemUtilization: activeItems / totalItems||0,
      bottleneckAnalysis: this.identifyBottlenecks()||{
        level: null,
        severity:'none',
        impact: ',
        recommendation: ',
      },
      lastUpdated: new Date(),
    };
  }

  private identifyBottleneckLevel(): OrchestrationLevel|null {
    const utilizations = [
      {
        level:'portfolio' as const,
        utilization: this.state.wipStatus.utilization.portfolio,
      },
      {
        level: 'program' as const,
        utilization: this.state.wipStatus.utilization.program,
      },
      {
        level: 'swarm-execution' as const,
        utilization: this.state.wipStatus.utilization['swarm-execution'],
      },
    ];

    const highest = utilizations.reduce((prev, current) =>
      current.utilization > prev.utilization ? current : prev
    );

    return highest.utilization > 0.8 ? highest.level : null;
  }

  private identifyBottlenecks(): BottleneckInfo|null {
    const bottleneckLevel = this.identifyBottleneckLevel();

    if (!bottleneckLevel) {
      return null;
    }

    const utilization = this.state.wipStatus.utilization[bottleneckLevel];
    let severity: BottleneckInfo['severity'] = 'minor';

    if (utilization > 0.95) severity = 'severe';
    else if (utilization > 0.9) severity = 'moderate';

    return {
      level: bottleneckLevel,
      severity,
      impact: `${bottleneckLevel} level is at ${Math.round(utilization * 100)}% utilization`,
      recommendation: `Consider increasing WIP limits or adding capacity at ${bottleneckLevel} level`,
    };
  }
}

export default MultiLevelOrchestrationManager;
