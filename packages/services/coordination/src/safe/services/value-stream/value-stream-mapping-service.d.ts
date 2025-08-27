/**
 * @fileoverview Value Stream Mapping Service - SAFe value stream mapping and workflow integration.
 *
 * Provides specialized value stream mapping capabilities with workflow-to-value-stream conversion,
 * multi-level orchestration integration, and intelligent mapping optimization.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent mapping optimization
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/workflows: WorkflowEngine for process coordination
 * - @claude-zen/agui: Human-in-loop approvals for critical mapping decisions
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger, MultiLevelOrchestrationManager, ValueStream } from '../../types';
export interface ValueStreamMapperConfig {
    readonly enableIntelligentMapping: boolean;
    readonly enableWorkflowIntegration: boolean;
    readonly enableMultiLevelIntegration: boolean;
    readonly maxMappingComplexity: number;
    readonly optimizationThreshold: number;
    readonly mappingValidationEnabled: boolean;
}
export interface ValueStreamFlowAnalysis {
    readonly flowId: string;
    readonly name: string;
    readonly stepAnalysis: FlowStepAnalysis[];
    readonly metrics: DetailedFlowMetrics;
}
export interface FlowStepAnalysis {
    readonly stepId: string;
    readonly name: string;
    readonly duration: number;
    readonly type: value;
}
export interface DetailedFlowMetrics {
    readonly totalLeadTime: number;
    readonly totalProcessTime: number;
    readonly flowEfficiency: number;
    readonly valueAddedRatio: number;
}
export interface ValueStreamMapperState {
    readonly status: 'idle|mapping|optimizing|completed;;
    readonly progress: number;
    readonly currentStep?: string;
}
/**
 * Value stream mapping configuration
 */
export interface ValueStreamMappingConfig {
    readonly enableIntelligentMapping: boolean;
    readonly enableWorkflowIntegration: boolean;
    readonly enableMultiLevelIntegration: boolean;
    readonly maxMappingComplexity: number;
    readonly optimizationThreshold: number;
    readonly mappingValidationEnabled: boolean;
}
/**
 * Workflow to value stream mapping
 */
export interface WorkflowValueStreamMapping {
    readonly workflowId: string;
    readonly valueStreamId: string;
    readonly mappingType: 'direct' | 'composite' | 'distributed';
    readonly confidence: number;
    readonly mappingReason: string;
    readonly steps: WorkflowStepMapping[];
    readonly validatedAt: Date;
    readonly validatedBy?: string;
}
/**
 * Workflow step mapping
 */
export interface WorkflowStepMapping {
    readonly stepId: string;
    readonly valueStreamStep: string;
    readonly mappingReason: string;
    readonly confidence: number;
    readonly flowEfficiencyImpact: number;
}
/**
 * Value stream creation context
 */
export interface ValueStreamCreationContext {
    readonly workflowType: string;
    readonly complexity: 'simple|moderate|complex|enterprise;;
    readonly organizationalLevel: 'team|program|portfolio|enterprise;;
    readonly businessContext: BusinessContext;
    readonly technicalContext: TechnicalContext;
    readonly stakeholderContext: StakeholderContext;
}
/**
 * Business context for mapping
 */
export interface BusinessContext {
    readonly domain: string;
    readonly customerSegments: string[];
    readonly valuePropositions: string[];
    readonly revenueModel: string;
    readonly competitiveFactors: string[];
}
/**
 * Technical context for mapping
 */
export interface TechnicalContext {
    readonly architecture: string;
    readonly technologies: string[];
    readonly integrations: string[];
    readonly constraints: string[];
    readonly scalingRequirements: string[];
}
/**
 * Stakeholder context for mapping
 */
export interface StakeholderContext {
    readonly primaryStakeholders: string[];
    readonly secondaryStakeholders: string[];
    readonly decisionMakers: string[];
    readonly influencers: string[];
    readonly communicationPreferences: Record<string, string>;
}
/**
 * Mapping validation result
 */
export interface MappingValidationResult {
    readonly isValid: boolean;
    readonly validationScore: number;
    readonly issues: MappingValidationIssue[];
    readonly recommendations: string[];
    readonly approvalRequired: boolean;
    readonly validatedAt: Date;
}
/**
 * Mapping validation issue
 */
export interface MappingValidationIssue {
    readonly type: 'conflict|gap|redundancy|misalignment;;
    readonly severity: 'low|medium|high|critical;;
    readonly description: string;
    readonly affectedElements: string[];
    readonly suggestedResolution: string;
}
/**
 * Value Stream Mapping Service - SAFe value stream mapping and workflow integration
 *
 * Provides comprehensive value stream mapping with intelligent workflow-to-value-stream conversion,
 * multi-level orchestration integration, and AI-powered mapping optimization.
 */
export declare class ValueStreamMappingService {
    private readonly logger;
    private brainCoordinator?;
    private performanceTracker?;
    private workflowEngine?;
    private aguiService?;
    private initialized;
    constructor(logger: Logger);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Map product workflows to SAFe value streams with intelligent optimization
     */
    mapWorkflowsToValueStreams(orchestrationManager: MultiLevelOrchestrationManager): Promise<Map<string, ValueStream>>;
    /**
     * Create value stream from workflow context with AI optimization
     */
    createValueStreamFromWorkflow(workflowId: string, context: ValueStreamCreationContext): Promise<ValueStream>;
    const mapping: WorkflowValueStreamMapping;
}
export default ValueStreamMappingService;
//# sourceMappingURL=value-stream-mapping-service.d.ts.map