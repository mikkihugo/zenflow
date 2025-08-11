/**
 * @file Swarm Execution Orchestrator - Phase 2, Day 10 (Tasks 9.1-9.3)
 *
 * AI autonomous orchestration for swarm execution level with SPARC methodology integration,
 * parallel Feature stream execution, automated testing, and swarm health monitoring.
 * Integrates with existing HiveSwarmCoordinator and SPARCEngineCore.
 *
 * ARCHITECTURE:
 * - Feature implementation with SPARC automation
 * - Parallel SPARC execution management across projects
 * - Cross-SPARC project learning and optimization
 * - Swarm-level automation with error recovery
 * - Integration with WorkflowGatesManager for quality gates
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { Agent } from '../agents/agent.ts';
import type { HiveSwarmCoordinator } from '../swarm/hive-swarm-sync';
import type { SPARCEngineCore } from '../swarm/sparc';
import type { SPARCPhase, SPARCProject } from '../swarm/sparc/types/sparc-types.ts';
import type { AutomationConfig, ComplexityLevel, EffortEstimate, FlowMetrics, QualityGate, SwarmDependency, SwarmExecutionItem, SwarmTimeline, WorkflowStream } from './multi-level-types.ts';
import type { WorkflowGatesManager } from './workflow-gates.ts';
/**
 * Swarm execution orchestrator configuration
 */
export interface SwarmExecutionOrchestratorConfig {
    readonly enableAutomatedTesting: boolean;
    readonly enableDeploymentAutomation: boolean;
    readonly enableCrossProjectLearning: boolean;
    readonly enablePerformanceOptimization: boolean;
    readonly enableHealthMonitoring: boolean;
    readonly maxConcurrentFeatures: number;
    readonly maxParallelSPARCProjects: number;
    readonly sparcQualityThreshold: number;
    readonly automationLevel: 'minimal' | 'moderate' | 'aggressive';
    readonly errorRecoveryTimeout: number;
    readonly healthCheckInterval: number;
    readonly optimizationInterval: number;
}
/**
 * SPARC execution context
 */
export interface SPARCExecutionContext {
    readonly projectId: string;
    readonly currentPhase: SPARCPhase;
    readonly automation: SPARCAutomation;
    readonly qualityGates: QualityGate[];
    readonly metrics: SPARCMetrics;
    readonly dependencies: SwarmDependency[];
    readonly assignedAgents: string[];
    readonly parallelExecution: boolean;
    readonly crossProjectLearning: boolean;
}
/**
 * SPARC automation configuration
 */
export interface SPARCAutomation {
    readonly enabledPhases: SPARCPhase[];
    readonly qualityChecks: boolean;
    readonly codeGeneration: boolean;
    readonly testing: boolean;
    readonly deployment: boolean;
    readonly monitoring: boolean;
    readonly rollback: boolean;
    readonly humanIntervention: SPARCPhase[];
}
/**
 * SPARC metrics tracking
 */
export interface SPARCMetrics {
    readonly phaseCompletionRate: number;
    readonly qualityScore: number;
    readonly automationRate: number;
    readonly cycleTime: number;
    readonly defectRate: number;
    readonly learningEfficiency: number;
    readonly lastUpdated: Date;
}
/**
 * Cross-project learning context
 */
export interface CrossProjectLearning {
    readonly sourceProject: string;
    readonly targetProject: string;
    readonly learningType: 'pattern' | 'solution' | 'optimization' | 'error_prevention';
    readonly confidence: number;
    readonly applicability: number;
    readonly transferredKnowledge: KnowledgeTransfer[];
    readonly validation: LearningValidation;
}
/**
 * Knowledge transfer record
 */
export interface KnowledgeTransfer {
    readonly id: string;
    readonly type: string;
    readonly source: string;
    readonly target: string;
    readonly content: any;
    readonly effectiveness: number;
    readonly timestamp: Date;
}
/**
 * Learning validation
 */
export interface LearningValidation {
    readonly validated: boolean;
    readonly validationMethod: string;
    readonly score: number;
    readonly feedback: string;
    readonly improvements: string[];
}
/**
 * Swarm health indicators
 */
export interface SwarmHealth {
    readonly overallScore: number;
    readonly throughput: number;
    readonly qualityScore: number;
    readonly automationEfficiency: number;
    readonly errorRate: number;
    readonly learningRate: number;
    readonly resourceUtilization: number;
    readonly agentPerformance: AgentPerformance[];
    readonly bottlenecks: SwarmBottleneck[];
    readonly recommendations: SwarmRecommendation[];
    readonly lastUpdated: Date;
}
/**
 * Agent performance metrics
 */
export interface AgentPerformance {
    readonly agentId: string;
    readonly agentType: string;
    readonly efficiency: number;
    readonly qualityScore: number;
    readonly tasksCompleted: number;
    readonly averageCompletionTime: number;
    readonly errorRate: number;
    readonly learningProgress: number;
    readonly specializations: string[];
}
/**
 * Swarm bottleneck identification
 */
export interface SwarmBottleneck {
    readonly type: 'resource' | 'dependency' | 'quality' | 'integration' | 'knowledge';
    readonly location: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly impact: number;
    readonly description: string;
    readonly suggestedActions: string[];
    readonly assignedTo?: string;
    readonly resolvedAt?: Date;
}
/**
 * Swarm recommendation
 */
export interface SwarmRecommendation {
    readonly type: 'optimization' | 'scaling' | 'quality' | 'automation' | 'learning';
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly description: string;
    readonly expectedBenefit: number;
    readonly effort: number;
    readonly actions: string[];
    readonly timeline: string;
    readonly metrics: string[];
}
/**
 * Feature execution plan
 */
export interface FeatureExecutionPlan {
    readonly featureId: string;
    readonly sparcProject: SPARCProject;
    readonly executionStrategy: 'sequential' | 'parallel' | 'hybrid';
    readonly automation: AutomationConfig;
    readonly qualityGates: QualityGate[];
    readonly dependencies: SwarmDependency[];
    readonly timeline: SwarmTimeline;
    readonly resources: FeatureResources;
    readonly riskMitigation: RiskMitigation[];
}
/**
 * Feature resources
 */
export interface FeatureResources {
    readonly assignedAgents: Agent[];
    readonly computeResources: ComputeResource[];
    readonly dataResources: DataResource[];
    readonly externalServices: ExternalService[];
}
/**
 * Compute resource
 */
export interface ComputeResource {
    readonly type: 'cpu' | 'memory' | 'storage' | 'gpu';
    readonly amount: number;
    readonly unit: string;
    readonly reserved: boolean;
    readonly cost: number;
}
/**
 * Data resource
 */
export interface DataResource {
    readonly type: 'database' | 'file' | 'stream' | 'api';
    readonly source: string;
    readonly accessLevel: 'read' | 'write' | 'admin';
    readonly schema?: string;
    readonly security: string[];
}
/**
 * External service dependency
 */
export interface ExternalService {
    readonly name: string;
    readonly endpoint: string;
    readonly authentication: string;
    readonly rateLimit?: number;
    readonly availability: number;
    readonly criticality: 'low' | 'medium' | 'high';
}
/**
 * Risk mitigation strategy
 */
export interface RiskMitigation {
    readonly riskType: string;
    readonly probability: number;
    readonly impact: number;
    readonly mitigation: string;
    readonly contingency: string;
    readonly owner: string;
    readonly status: 'planned' | 'implementing' | 'completed';
}
/**
 * Swarm execution orchestrator state
 */
export interface SwarmExecutionOrchestratorState {
    readonly swarmExecutionItems: Map<string, SwarmExecutionItem>;
    readonly activeStreams: Map<string, WorkflowStream<SwarmExecutionItem>>;
    readonly sparcProjects: Map<string, SPARCExecutionContext>;
    readonly crossProjectLearning: CrossProjectLearning[];
    readonly swarmHealth: SwarmHealth;
    readonly flowMetrics: FlowMetrics;
    readonly agentPool: Agent[];
    readonly activeOptimizations: SwarmOptimization[];
    readonly errorRecoveryLog: ErrorRecoveryRecord[];
    readonly lastUpdated: Date;
}
/**
 * Swarm optimization record
 */
export interface SwarmOptimization {
    readonly id: string;
    readonly type: 'performance' | 'quality' | 'resource' | 'learning';
    readonly target: string;
    readonly strategy: string;
    readonly startedAt: Date;
    readonly expectedCompletion: Date;
    readonly progress: number;
    readonly metrics: Record<string, number>;
    readonly status: 'active' | 'completed' | 'failed';
}
/**
 * Error recovery record
 */
export interface ErrorRecoveryRecord {
    readonly id: string;
    readonly timestamp: Date;
    readonly errorType: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly affectedComponents: string[];
    readonly recoveryStrategy: string;
    readonly recoveryTime: number;
    readonly success: boolean;
    readonly lessons: string[];
}
/**
 * Swarm Execution Orchestrator - AI autonomous orchestration for swarm execution
 */
export declare class SwarmExecutionOrchestrator extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly sparcEngine;
    private readonly hiveCoordinator;
    private readonly config;
    private state;
    private healthMonitorTimer?;
    private optimizationTimer?;
    private errorRecoveryTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, sparcEngine: SPARCEngineCore, hiveCoordinator: HiveSwarmCoordinator, config?: Partial<SwarmExecutionOrchestratorConfig>);
    /**
     * Initialize the swarm execution orchestrator
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the orchestrator
     */
    shutdown(): Promise<void>;
    /**
     * Create swarm execution for feature
     */
    createSwarmExecution(programItemId: string, featureTitle: string, complexity: ComplexityLevel, effort: EffortEstimate, requirements: FeatureRequirements): Promise<SwarmExecutionItem>;
    /**
     * Execute feature with SPARC methodology
     */
    executeFeatureWithSPARC(featureId: string): Promise<void>;
    /**
     * Execute parallel Feature streams
     */
    executeParallelFeatureStreams(featureIds: string[]): Promise<void>;
    /**
     * Manage parallel SPARC projects
     */
    manageParallelSPARCProjects(): Promise<void>;
    /**
     * Implement cross-SPARC learning
     */
    implementCrossProjectLearning(): Promise<void>;
    /**
     * Optimize SPARC performance
     */
    optimizeSPARCPerformance(): Promise<void>;
    /**
     * Implement automated testing integration
     */
    implementAutomatedTesting(featureId: string): Promise<TestingResults>;
    /**
     * Implement deployment automation
     */
    implementDeploymentAutomation(featureId: string): Promise<DeploymentResults>;
    /**
     * Implement autonomous error recovery
     */
    implementAutonomousErrorRecovery(): Promise<void>;
    /**
     * Monitor swarm health and optimize
     */
    monitorSwarmHealthAndOptimize(): Promise<void>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private startHealthMonitoring;
    private startOptimization;
    private startErrorRecovery;
    private registerEventHandlers;
    private calculateFeaturePriority;
    private createSPARCProject;
    private assignOptimalSwarm;
    private analyzeDependencies;
    private estimateSwarmTimeline;
    private createQualityGates;
    private createAutomationConfig;
    private initializeSwarmMetrics;
    private chunkArray;
    private initializeAgentPool;
    private setupSPARCIntegration;
    private setupHiveCoordination;
    private gracefulShutdownActiveStreams;
    private createFeatureExecutionPlan;
    private createSwarmWorkflowStream;
    private createSPARCExecutionContext;
    private assignAgentsAndResources;
    private updateSwarmItemStatus;
    private executeSPARCPhase;
    private checkQualityGates;
    private handleQualityGateFailure;
    private applyCrossProjectLearning;
    private extractAndShareLearnings;
    private handleExecutionError;
    private calculateSwarmHealth;
}
export interface FeatureRequirements {
    readonly functional: string[];
    readonly nonFunctional: string[];
    readonly constraints: string[];
    readonly integrations: string[];
}
export interface TestingResults {
    readonly featureId: string;
    readonly testSuites: TestSuite[];
    readonly overallCoverage: number;
    readonly passRate: number;
    readonly performance: PerformanceTestResult | null;
    readonly security: SecurityTestResult | null;
    readonly startedAt: Date;
    readonly completedAt: Date;
}
export interface TestSuite {
    readonly name: string;
    readonly type: 'unit' | 'integration' | 'system';
    readonly tests: TestCase[];
    readonly coverage: number;
    readonly passed: boolean;
}
export interface TestCase {
    readonly name: string;
    readonly status: 'passed' | 'failed' | 'skipped';
    readonly duration: number;
    readonly error?: string;
}
export interface PerformanceTestResult {
    readonly throughput: number;
    readonly latency: number;
    readonly resourceUsage: Record<string, number>;
    readonly passed: boolean;
}
export interface SecurityTestResult {
    readonly vulnerabilities: SecurityVulnerability[];
    readonly score: number;
    readonly passed: boolean;
}
export interface SecurityVulnerability {
    readonly type: string;
    readonly severity: 'low' | 'medium' | 'high' | 'critical';
    readonly description: string;
    readonly recommendation: string;
}
export interface DeploymentResults {
    readonly featureId: string;
    readonly stages: DeploymentStageResult[];
    readonly overallSuccess: boolean;
    readonly rollbackRequired: boolean;
    readonly startedAt: Date;
    readonly completedAt: Date;
}
export interface DeploymentStageResult {
    readonly stage: string;
    readonly success: boolean;
    readonly duration: number;
    readonly logs: string[];
    readonly error?: string;
}
export default SwarmExecutionOrchestrator;
export type { SwarmExecutionOrchestratorConfig, SPARCExecutionContext, SPARCAutomation, SPARCMetrics, CrossProjectLearning, SwarmHealth, AgentPerformance, SwarmBottleneck, SwarmRecommendation, FeatureExecutionPlan, SwarmExecutionOrchestratorState, FeatureRequirements, TestingResults, DeploymentResults, };
//# sourceMappingURL=swarm-execution-orchestrator.d.ts.map