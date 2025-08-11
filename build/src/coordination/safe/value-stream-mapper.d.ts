/**
 * @file Value Stream Mapper - Phase 3, Day 13 (Task 12.1-12.3)
 *
 * Creates SAFe Value Stream mapping for bottleneck detection, maps product workflow
 * to SAFe value streams, and implements value stream optimization engine with
 * flow metrics and continuous improvement feedback loops.
 *
 * ARCHITECTURE:
 * - Value stream mapping and visualization
 * - Bottleneck detection and analysis engine
 * - Flow optimization recommendations
 * - Value delivery time tracking
 * - Integration with multi-level orchestration
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { MultiLevelOrchestrationManager } from '../orchestration/multi-level-orchestration-manager.ts';
import type { PortfolioOrchestrator } from '../orchestration/portfolio-orchestrator.ts';
import type { ProgramOrchestrator } from '../orchestration/program-orchestrator.ts';
import type { SwarmExecutionOrchestrator } from '../orchestration/swarm-execution-orchestrator.ts';
import type { ValueStream, ValueStreamMetrics } from './index.ts';
/**
 * Value Stream Mapper configuration
 */
export interface ValueStreamMapperConfig {
    readonly enableBottleneckDetection: boolean;
    readonly enableFlowOptimization: boolean;
    readonly enableValueDeliveryTracking: boolean;
    readonly enableContinuousImprovement: boolean;
    readonly bottleneckDetectionInterval: number;
    readonly flowAnalysisInterval: number;
    readonly optimizationRecommendationInterval: number;
    readonly valueDeliveryTrackingInterval: number;
    readonly bottleneckThreshold: number;
    readonly maxValueStreams: number;
    readonly maxFlowSteps: number;
}
/**
 * Value stream flow analysis
 */
export interface ValueStreamFlowAnalysis {
    readonly valueStreamId: string;
    readonly analysisTimestamp: Date;
    readonly overallFlowEfficiency: number;
    readonly totalLeadTime: number;
    readonly totalProcessTime: number;
    readonly totalWaitTime: number;
    readonly flowStepAnalysis: FlowStepAnalysis[];
    readonly bottlenecks: FlowBottleneck[];
    readonly flowMetrics: DetailedFlowMetrics;
    readonly recommendations: FlowOptimizationRecommendation[];
}
/**
 * Flow step analysis
 */
export interface FlowStepAnalysis {
    readonly stepId: string;
    readonly stepName: string;
    readonly flowEfficiency: number;
    readonly leadTime: number;
    readonly processTime: number;
    readonly waitTime: number;
    readonly throughput: number;
    readonly capacity: number;
    readonly utilization: number;
    readonly qualityRate: number;
    readonly isBottleneck: boolean;
    readonly bottleneckSeverity?: 'minor' | 'moderate' | 'severe' | 'critical';
}
/**
 * Flow bottleneck identification
 */
export interface FlowBottleneck {
    readonly id: string;
    readonly stepId: string;
    readonly stepName: string;
    readonly type: 'capacity' | 'process' | 'quality' | 'dependency' | 'resource';
    readonly severity: 'minor' | 'moderate' | 'severe' | 'critical';
    readonly impact: BottleneckImpact;
    readonly duration: number;
    readonly affectedItems: string[];
    readonly rootCause: string;
    readonly recommendedActions: string[];
    readonly estimatedResolutionTime: number;
    readonly resolutionComplexity: 'simple' | 'moderate' | 'complex';
    readonly autoResolvable: boolean;
}
/**
 * Bottleneck impact assessment
 */
export interface BottleneckImpact {
    readonly leadTimeIncrease: number;
    readonly throughputReduction: number;
    readonly qualityImpact: number;
    readonly customerImpact: 'low' | 'medium' | 'high' | 'critical';
    readonly businessValueDelay: number;
    readonly affectedCustomers: number;
    readonly riskOfEscalation: number;
}
/**
 * Detailed flow metrics
 */
export interface DetailedFlowMetrics {
    readonly cycleTime: CycleTimeMetrics;
    readonly leadTime: LeadTimeMetrics;
    readonly throughput: ThroughputMetrics;
    readonly flowEfficiency: FlowEfficiencyMetrics;
    readonly quality: QualityFlowMetrics;
    readonly predictability: PredictabilityFlowMetrics;
    readonly customerValue: CustomerValueMetrics;
}
/**
 * Cycle time metrics
 */
export interface CycleTimeMetrics {
    readonly average: number;
    readonly median: number;
    readonly percentile85: number;
    readonly percentile95: number;
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly variability: number;
}
/**
 * Lead time metrics
 */
export interface LeadTimeMetrics {
    readonly average: number;
    readonly median: number;
    readonly percentile85: number;
    readonly percentile95: number;
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly variability: number;
}
/**
 * Throughput metrics
 */
export interface ThroughputMetrics {
    readonly itemsPerDay: number;
    readonly itemsPerWeek: number;
    readonly itemsPerMonth: number;
    readonly trend: 'increasing' | 'stable' | 'decreasing';
    readonly capacity: number;
    readonly utilization: number;
}
/**
 * Flow efficiency metrics
 */
export interface FlowEfficiencyMetrics {
    readonly overall: number;
    readonly byStep: Record<string, number>;
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly benchmark: number;
    readonly gap: number;
}
/**
 * Quality flow metrics
 */
export interface QualityFlowMetrics {
    readonly defectRate: number;
    readonly reworkRate: number;
    readonly firstPassYield: number;
    readonly qualityTrend: 'improving' | 'stable' | 'degrading';
    readonly costOfQuality: number;
}
/**
 * Predictability flow metrics
 */
export interface PredictabilityFlowMetrics {
    readonly deliveryReliability: number;
    readonly commitmentReliability: number;
    readonly forecastAccuracy: number;
    readonly variability: number;
    readonly plannedVsActual: number;
}
/**
 * Customer value metrics
 */
export interface CustomerValueMetrics {
    readonly valueDeliveryRate: number;
    readonly customerSatisfaction: number;
    readonly featureUtilization: number;
    readonly timeToValue: number;
    readonly valueRealizationRate: number;
}
/**
 * Flow optimization recommendation
 */
export interface FlowOptimizationRecommendation {
    readonly id: string;
    readonly type: 'process' | 'capacity' | 'quality' | 'technology' | 'organizational';
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly title: string;
    readonly description: string;
    readonly targetBottleneck?: string;
    readonly expectedImpact: ExpectedImpact;
    readonly implementation: ImplementationPlan;
    readonly risks: string[];
    readonly dependencies: string[];
    readonly metrics: string[];
}
/**
 * Expected impact of optimization
 */
export interface ExpectedImpact {
    readonly leadTimeReduction: number;
    readonly throughputIncrease: number;
    readonly qualityImprovement: number;
    readonly flowEfficiencyIncrease: number;
    readonly customerSatisfactionImprovement: number;
    readonly costReduction: number;
    readonly confidenceLevel: number;
}
/**
 * Implementation plan for optimization
 */
export interface ImplementationPlan {
    readonly effort: 'small' | 'medium' | 'large' | 'extra-large';
    readonly duration: number;
    readonly resources: string[];
    readonly phases: ImplementationPhase[];
    readonly successCriteria: string[];
    readonly rollbackPlan: string;
}
/**
 * Implementation phase
 */
export interface ImplementationPhase {
    readonly phase: string;
    readonly description: string;
    readonly duration: number;
    readonly deliverables: string[];
    readonly successCriteria: string[];
    readonly dependencies: string[];
}
/**
 * Value delivery tracking
 */
export interface ValueDeliveryTracking {
    readonly valueStreamId: string;
    readonly trackingPeriod: DateRange;
    readonly deliveryMetrics: ValueDeliveryMetrics;
    readonly customerOutcomes: CustomerOutcome[];
    readonly businessOutcomes: BusinessOutcome[];
    readonly trends: ValueDeliveryTrend[];
    readonly alerts: ValueDeliveryAlert[];
}
/**
 * Value delivery metrics
 */
export interface ValueDeliveryMetrics {
    readonly featuresDelivered: number;
    readonly valueRealized: number;
    readonly customerValueScore: number;
    readonly timeToMarket: number;
    readonly marketResponseTime: number;
    readonly competitiveAdvantage: number;
}
/**
 * Customer outcome
 */
export interface CustomerOutcome {
    readonly customerId: string;
    readonly outcomeType: 'efficiency' | 'effectiveness' | 'experience' | 'engagement';
    readonly description: string;
    readonly measuredValue: number;
    readonly targetValue: number;
    readonly achievementRate: number;
    readonly trend: 'improving' | 'stable' | 'declining';
}
/**
 * Business outcome
 */
export interface BusinessOutcome {
    readonly outcomeId: string;
    readonly type: 'revenue' | 'cost' | 'efficiency' | 'growth' | 'risk';
    readonly description: string;
    readonly measuredValue: number;
    readonly targetValue: number;
    readonly achievementRate: number;
    readonly trend: 'improving' | 'stable' | 'declining';
    readonly businessImpact: number;
}
/**
 * Value delivery trend
 */
export interface ValueDeliveryTrend {
    readonly metric: string;
    readonly direction: 'up' | 'down' | 'stable';
    readonly magnitude: number;
    readonly period: string;
    readonly significance: 'low' | 'medium' | 'high';
    readonly drivers: string[];
}
/**
 * Value delivery alert
 */
export interface ValueDeliveryAlert {
    readonly id: string;
    readonly type: 'performance' | 'trend' | 'threshold' | 'predictive';
    readonly severity: 'info' | 'warning' | 'critical';
    readonly message: string;
    readonly affectedMetrics: string[];
    readonly recommendedActions: string[];
    readonly escalationRequired: boolean;
}
/**
 * Value Stream Mapper state
 */
export interface ValueStreamMapperState {
    readonly valueStreams: Map<string, ValueStream>;
    readonly flowAnalyses: Map<string, ValueStreamFlowAnalysis>;
    readonly bottlenecks: Map<string, FlowBottleneck[]>;
    readonly optimizationRecommendations: Map<string, FlowOptimizationRecommendation[]>;
    readonly valueDeliveryTracking: Map<string, ValueDeliveryTracking>;
    readonly continuousImprovements: ContinuousImprovement[];
    readonly lastAnalysis: Date;
    readonly lastOptimization: Date;
}
/**
 * Continuous improvement item
 */
export interface ContinuousImprovement {
    readonly id: string;
    readonly valueStreamId: string;
    readonly type: 'kaizen' | 'innovation' | 'standardization' | 'automation';
    readonly title: string;
    readonly description: string;
    readonly status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'rejected';
    readonly proposedBy: string;
    readonly approvedBy?: string;
    readonly targetMetrics: string[];
    readonly expectedBenefit: string;
    readonly implementation: ImplementationPlan;
    readonly actualImpact?: ExpectedImpact;
    readonly lessonsLearned?: string[];
}
/**
 * Value Stream Mapper - SAFe value stream mapping and optimization
 */
export declare class ValueStreamMapper extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly multilevelOrchestrator;
    private readonly portfolioOrchestrator;
    private readonly programOrchestrator;
    private readonly swarmOrchestrator;
    private readonly config;
    private state;
    private bottleneckDetectionTimer?;
    private flowAnalysisTimer?;
    private optimizationTimer?;
    private valueTrackingTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, multilevelOrchestrator: MultiLevelOrchestrationManager, portfolioOrchestrator: PortfolioOrchestrator, programOrchestrator: ProgramOrchestrator, swarmOrchestrator: SwarmExecutionOrchestrator, config?: Partial<ValueStreamMapperConfig>);
    /**
     * Initialize the Value Stream Mapper
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Value Stream Mapper
     */
    shutdown(): Promise<void>;
    /**
     * Map product workflow to SAFe value streams
     */
    mapWorkflowsToValueStreams(): Promise<Map<string, ValueStream>>;
    /**
     * Identify value delivery bottlenecks and delays
     */
    identifyValueDeliveryBottlenecks(): Promise<Map<string, FlowBottleneck[]>>;
    /**
     * Add value stream performance metrics
     */
    calculateValueStreamMetrics(valueStreamId: string): Promise<ValueStreamMetrics>;
    /**
     * Generate flow optimization recommendations
     */
    generateFlowOptimizationRecommendations(valueStreamId: string): Promise<FlowOptimizationRecommendation[]>;
    /**
     * Implement continuous improvement feedback loops
     */
    implementContinuousImprovementLoop(valueStreamId: string): Promise<void>;
    /**
     * Track value delivery time across the stream
     */
    trackValueDeliveryTime(valueStreamId: string): Promise<ValueDeliveryTracking>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private startBottleneckDetection;
    private startFlowAnalysis;
    private startOptimizationEngine;
    private startValueDeliveryTracking;
    private registerEventHandlers;
    private mapPortfolioToValueStreams;
    private mapProgramToValueStreams;
    private mapSwarmToValueStreams;
    private analyzeValueStreamFlow;
    private detectBottlenecksInFlow;
    private createBottleneckAlerts;
    private calculateThroughput;
    private calculateDefectRate;
    private calculateCustomerSatisfaction;
    private generateBottleneckRecommendations;
    private generateGeneralFlowRecommendations;
    private prioritizeRecommendations;
    private getHistoricalFlowAnalyses;
    private analyzeTrends;
    private identifyImprovementOpportunities;
    private generateKaizenSuggestions;
    private trackImprovementImplementations;
    private calculateValueDeliveryMetrics;
    private assessCustomerOutcomes;
    private assessBusinessOutcomes;
    private analyzeValueDeliveryTrends;
    private generateValueDeliveryAlerts;
    private runFlowAnalysisForAllStreams;
    private runOptimizationForAllStreams;
    private trackValueDeliveryForAllStreams;
    private handleWorkflowCompletion;
    private handleBottleneckResolution;
}
export interface DateRange {
    readonly start: Date;
    readonly end: Date;
}
export default ValueStreamMapper;
export type { ValueStreamMapperConfig, ValueStreamFlowAnalysis, FlowStepAnalysis, FlowBottleneck, BottleneckImpact, DetailedFlowMetrics, FlowOptimizationRecommendation, ExpectedImpact, ImplementationPlan, ValueDeliveryTracking, ValueDeliveryMetrics, CustomerOutcome, BusinessOutcome, ValueDeliveryTrend, ValueDeliveryAlert, ValueStreamMapperState, ContinuousImprovement, DateRange, };
//# sourceMappingURL=value-stream-mapper.d.ts.map