/**
 * @fileoverview Value Stream Mapper - SAFe value stream mapping and optimization facade.
 *
 * Provides comprehensive value stream mapping with bottleneck detection through delegation
 * to specialized services for mapping optimization and workflow integration.
 *
 * Delegates to:
 * - ValueStreamMappingService: Core mapping and workflow-to-value-stream conversion
 * - @claude-zen/brain: BrainCoordinator for intelligent mapping optimization
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for process coordination
 * - @claude-zen/agui: Human-in-loop approvals for critical mapping decisions
 *
 * REDUCTION: 1,062 → 448 lines (58% reduction) through service delegation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { EventBus } from '@claude-zen/foundation';
import type { MemorySystem, MultiLevelOrchestrationManager, TypeSafeEventBus, ValueStream, ValueStreamMetrics } from '../types';
export type { BusinessContext, MappingValidationIssue, MappingValidationResult, StakeholderContext, TechnicalContext, ValueStreamCreationContext, ValueStreamMappingConfig, WorkflowStepMapping, WorkflowValueStreamMapping, } from '../services/value-stream/value-stream-mapping-service';
/**
 * Value Stream Mapper configuration
 */
interface ValueStreamMapperConfig {
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
 * Value Stream Mapper state
 */
export interface ValueStreamMapperState {
    valueStreams: Map<string, ValueStream>;
    flowAnalyses: Map<string, any>;
    bottlenecks: Map<string, any[]>;
    optimizationRecommendations: Map<string, any[]>;
    valueDeliveryTracking: Map<string, any>;
    continuousImprovements: any[];
    lastAnalysis: Date;
    lastOptimization: Date;
}
/**
 * Value Stream Mapper - SAFe value stream mapping and optimization facade
 *
 * Provides comprehensive value stream mapping with intelligent workflow-to-value-stream conversion,
 * multi-level orchestration integration, and AI-powered mapping optimization through service delegation.
 */
export declare class ValueStreamMapper extends EventBus {
    private readonly logger;
    private readonly multilevelOrchestrator;
    private valueStreamMappingService?;
    private performanceTracker?;
    private telemetryManager?;
    private initialized;
    private state;
    private bottleneckDetectionTimer?;
    private flowAnalysisTimer?;
    private optimizationTimer?;
    private valueTrackingTimer?;
    constructor(_eventBus: TypeSafeEventBus, memory: MemorySystem, multilevelOrchestrator: MultiLevelOrchestrationManager, portfolioOrchestrator: unknown, programOrchestrator: unknown, swarmOrchestrator: unknown, config?: Partial<ValueStreamMapperConfig>);
    /**
     * Initialize with service delegation - LAZY LOADING
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the Value Stream Mapper
     */
    shutdown(): Promise<void>;
    /**
     * Map product workflow to SAFe value streams - Delegates to specialized service
     */
    mapWorkflowsToValueStreams(): Promise<Map<string, ValueStream>>;
    /**
     * Create value stream from workflow - Delegates to specialized service
     */
    createValueStreamFromWorkflow(workflowId: string, context: any): Promise<ValueStream>;
    /**
     * Get mapping insights - Delegates to specialized service
     */
    getMappingInsights(workflowId?: string): Promise<any>;
    /**
     * Identify value delivery bottlenecks and delays
     */
    identifyValueDeliveryBottlenecks(): Promise<Map<string, any[]>>;
    /**
     * Calculate value stream metrics
     */
    calculateValueStreamMetrics(valueStreamId: string): Promise<ValueStreamMetrics>;
}
//# sourceMappingURL=value-stream-mapper.d.ts.map