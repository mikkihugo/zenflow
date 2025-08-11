/**
 * @file Multi-Level Orchestration Manager - Phase 2, Day 11 (Tasks 10.1-10.3)
 *
 * Integrates all orchestration levels (Portfolio, Program, Swarm Execution) into a unified
 * system with level transition management, cross-level dependency resolution, unified workflow
 * state management, WIP limits, and flow control with backpressure and load balancing.
 *
 * ARCHITECTURE:
 * - Unified coordination of Portfolio → Program → Swarm execution levels
 * - Cross-level dependency resolution with automatic escalation
 * - Configurable WIP limits with intelligent flow control
 * - Queue management and prioritization across levels
 * - Load balancing and backpressure handling
 * - Integration with ProductWorkflowEngine for complete workflow management
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { CrossLevelDependency, OrchestrationLevel, PortfolioItem, ProgramItem, SwarmExecutionItem, SystemPerformanceMetrics, WIPLimits } from './multi-level-types.ts';
import type { ParallelWorkflowManager } from './parallel-workflow-manager.ts';
import type { PortfolioOrchestrator } from './portfolio-orchestrator.ts';
import type { ProductWorkflowEngine } from './product-workflow-engine.ts';
import type { ProgramOrchestrator } from './program-orchestrator.ts';
import type { SwarmExecutionOrchestrator } from './swarm-execution-orchestrator.ts';
import type { WorkflowGatesManager } from './workflow-gates.ts';
/**
 * Multi-level orchestration manager configuration
 */
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
/**
 * Level transition configuration
 */
export interface LevelTransitionConfig {
    readonly fromLevel: OrchestrationLevel;
    readonly toLevel: OrchestrationLevel;
    readonly transitionTriggers: TransitionTrigger[];
    readonly requiredGates: string[];
    readonly transitionCriteria: TransitionCriterion[];
    readonly handoffProtocol: HandoffProtocol;
    readonly rollbackStrategy: RollbackStrategy;
}
/**
 * Transition trigger
 */
export interface TransitionTrigger {
    readonly event: string;
    readonly condition: (context: any) => Promise<boolean>;
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly timeout: number;
}
/**
 * Transition criterion
 */
export interface TransitionCriterion {
    readonly name: string;
    readonly evaluator: (fromItem: any, context: any) => Promise<number>;
    readonly threshold: number;
    readonly weight: number;
    readonly required: boolean;
}
/**
 * Handoff protocol
 */
export interface HandoffProtocol {
    readonly dataTransform: (fromData: any) => any;
    readonly validationRules: ValidationRule[];
    readonly notificationChannels: string[];
    readonly confirmationRequired: boolean;
}
/**
 * Validation rule
 */
export interface ValidationRule {
    readonly field: string;
    readonly validator: (value: any) => boolean;
    readonly errorMessage: string;
}
/**
 * Rollback strategy
 */
export interface RollbackStrategy {
    readonly enabled: boolean;
    readonly triggers: string[];
    readonly maxAttempts: number;
    readonly rollbackTimeout: number;
    readonly notificationRequired: boolean;
}
/**
 * Flow control metrics
 */
export interface FlowControlMetrics {
    readonly currentWIP: Record<OrchestrationLevel, number>;
    readonly wipUtilization: Record<OrchestrationLevel, number>;
    readonly throughput: Record<OrchestrationLevel, number>;
    readonly bottlenecks: FlowBottleneck[];
    readonly backpressureEvents: BackpressureEvent[];
    readonly loadBalance: LoadBalanceMetrics;
    readonly lastUpdated: Date;
}
/**
 * Flow bottleneck
 */
export interface FlowBottleneck {
    readonly level: OrchestrationLevel;
    readonly location: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly impact: number;
    readonly duration: number;
    readonly suggestedActions: string[];
    readonly autoResolution: boolean;
}
/**
 * Backpressure event
 */
export interface BackpressureEvent {
    readonly timestamp: Date;
    readonly source: OrchestrationLevel;
    readonly target: OrchestrationLevel;
    readonly reason: string;
    readonly magnitude: number;
    readonly resolution: string;
    readonly resolved: boolean;
}
/**
 * Load balance metrics
 */
export interface LoadBalanceMetrics {
    readonly portfolioLoad: number;
    readonly programLoad: number;
    readonly swarmLoad: number;
    readonly balanceScore: number;
    readonly rebalanceRecommendations: RebalanceRecommendation[];
}
/**
 * Rebalance recommendation
 */
export interface RebalanceRecommendation {
    readonly type: 'move' | 'split' | 'merge' | 'delay';
    readonly sourceLevel: OrchestrationLevel;
    readonly targetLevel: OrchestrationLevel;
    readonly itemIds: string[];
    readonly expectedImprovement: number;
    readonly effort: number;
    readonly risks: string[];
}
/**
 * Workflow state synchronization
 */
export interface WorkflowStateSynchronization {
    readonly portfolioState: Map<string, PortfolioItem>;
    readonly programState: Map<string, ProgramItem>;
    readonly swarmState: Map<string, SwarmExecutionItem>;
    readonly crossLevelMappings: CrossLevelMapping[];
    readonly inconsistencies: StateInconsistency[];
    readonly lastSyncAt: Date;
}
/**
 * Cross-level mapping
 */
export interface CrossLevelMapping {
    readonly portfolioId: string;
    readonly programIds: string[];
    readonly swarmIds: string[];
    readonly dependencies: CrossLevelDependency[];
    readonly syncStatus: 'synced' | 'pending' | 'conflict';
}
/**
 * State inconsistency
 */
export interface StateInconsistency {
    readonly type: 'missing' | 'duplicate' | 'mismatch' | 'orphaned';
    readonly level: OrchestrationLevel;
    readonly itemId: string;
    readonly description: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly autoResolvable: boolean;
    readonly resolution: string;
}
/**
 * Multi-level orchestration manager state
 */
export interface MultiLevelOrchestrationManagerState {
    readonly orchestratorStates: {
        portfolio: any;
        program: any;
        swarmExecution: any;
    };
    readonly levelTransitions: LevelTransitionConfig[];
    readonly activeTransitions: Map<string, ActiveTransition>;
    readonly crossLevelDependencies: CrossLevelDependency[];
    readonly wipLimits: WIPLimits;
    readonly flowControlMetrics: FlowControlMetrics;
    readonly workflowSync: WorkflowStateSynchronization;
    readonly systemMetrics: SystemPerformanceMetrics;
    readonly lastUpdated: Date;
}
/**
 * Active transition record
 */
export interface ActiveTransition {
    readonly id: string;
    readonly config: LevelTransitionConfig;
    readonly sourceItemId: string;
    readonly targetItemId?: string;
    readonly status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back';
    readonly startedAt: Date;
    readonly completedAt?: Date;
    readonly errors: string[];
    readonly attempts: number;
}
/**
 * Multi-Level Orchestration Manager - Unified coordination across all levels
 */
export declare class MultiLevelOrchestrationManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly config;
    private readonly portfolioOrchestrator;
    private readonly programOrchestrator;
    private readonly swarmExecutionOrchestrator;
    private readonly parallelWorkflowManager;
    private readonly workflowGatesManager;
    private readonly productWorkflowEngine;
    private state;
    private dependencyResolutionTimer?;
    private flowControlTimer?;
    private loadBalancingTimer?;
    private stateManagementTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, portfolioOrchestrator: PortfolioOrchestrator, programOrchestrator: ProgramOrchestrator, swarmExecutionOrchestrator: SwarmExecutionOrchestrator, parallelWorkflowManager: ParallelWorkflowManager, workflowGatesManager: WorkflowGatesManager, productWorkflowEngine: ProductWorkflowEngine, config?: Partial<MultiLevelOrchestrationConfig>);
    /**
     * Initialize the multi-level orchestration manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the orchestration manager
     */
    shutdown(): Promise<void>;
    /**
     * Execute level transition from Portfolio to Program
     */
    transitionPortfolioToProgram(portfolioItemId: string, transitionContext: PortfolioProgramTransitionContext): Promise<string[]>;
    /**
     * Execute level transition from Program to Swarm Execution
     */
    transitionProgramToSwarmExecution(programItemId: string, transitionContext: ProgramSwarmTransitionContext): Promise<string[]>;
    /**
     * Manage level transition rollbacks
     */
    executeTransitionRollback(transitionId: string, reason: string): Promise<void>;
    /**
     * Resolve cross-level dependencies automatically
     */
    resolveCrossLevelDependencies(): Promise<void>;
    /**
     * Add cross-level dependency
     */
    addCrossLevelDependency(fromLevel: OrchestrationLevel, fromItemId: string, toLevel: OrchestrationLevel, toItemId: string, type: 'blocks' | 'enables' | 'informs', impact?: number): Promise<string>;
    /**
     * Update dependency graph and detect cycles
     */
    updateDependencyGraph(): Promise<void>;
    /**
     * Synchronize workflow state across all levels
     */
    synchronizeWorkflowState(): Promise<void>;
    /**
     * Get unified workflow status
     */
    getUnifiedWorkflowStatus(): Promise<UnifiedWorkflowStatus>;
    /**
     * Enforce WIP limits across all levels
     */
    enforceWIPLimits(): Promise<void>;
    /**
     * Implement flow control with backpressure
     */
    implementFlowControl(): Promise<void>;
    /**
     * Balance load across orchestration levels
     */
    balanceLoadAcrossLevels(): Promise<void>;
    /**
     * Manage queues across all levels with intelligent prioritization
     */
    manageQueuesWithPrioritization(): Promise<void>;
    /**
     * Get system performance dashboard data
     */
    getPerformanceDashboard(): Promise<PerformanceDashboard>;
    private initializeState;
    private initializeOrchestrators;
    private shutdownOrchestrators;
    private loadPersistedState;
    private persistState;
    private startBackgroundProcesses;
    private stopBackgroundProcesses;
    private registerEventHandlers;
    private setupLevelTransitions;
    private integrateWithProductWorkflow;
    private createActiveTransition;
    private validateTransitionCriteria;
    private executePortfolioProgramHandoff;
    private executeProgramSwarmHandoff;
    private updateCrossLevelMappings;
    private completeTransition;
    private handleTransitionError;
}
export interface PortfolioProgramTransitionContext {
    readonly decompositionStrategy: 'functional' | 'technical' | 'hybrid';
    readonly targetComplexity: 'simple' | 'moderate' | 'complex';
    readonly resourceConstraints: any;
    readonly timelineConstraints: any;
}
export interface ProgramSwarmTransitionContext {
    readonly implementationStrategy: 'agile' | 'waterfall' | 'hybrid';
    readonly qualityRequirements: any;
    readonly automationLevel: 'minimal' | 'moderate' | 'aggressive';
    readonly integrationRequirements: any;
}
export interface UnifiedWorkflowStatus {
    readonly portfolioHealth: any;
    readonly programHealth: any;
    readonly swarmHealth: any;
    readonly overallHealth: number;
    readonly flowMetrics: FlowControlMetrics;
    readonly systemMetrics: SystemPerformanceMetrics;
    readonly activeTransitions: ActiveTransition[];
    readonly dependencyHealth: number;
    readonly lastUpdated: Date;
}
export interface PerformanceDashboard {
    readonly timestamp: Date;
    readonly systemHealth: UnifiedWorkflowStatus;
    readonly flowMetrics: FlowControlMetrics;
    readonly wipMetrics: any;
    readonly throughputMetrics: any;
    readonly bottleneckAnalysis: any;
    readonly recommendations: string[];
}
export default MultiLevelOrchestrationManager;
export type { MultiLevelOrchestrationConfig, LevelTransitionConfig, FlowControlMetrics, FlowBottleneck, BackpressureEvent, LoadBalanceMetrics, WorkflowStateSynchronization, MultiLevelOrchestrationManagerState, ActiveTransition, UnifiedWorkflowStatus, PerformanceDashboard, };
//# sourceMappingURL=multi-level-orchestration-manager.d.ts.map