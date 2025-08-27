/**
 * @fileoverview System Design Management Service - System design creation and lifecycle management.
 *
 * Provides specialized system design management with AI-powered design analysis,
 * automated pattern recognition, and intelligent design coordination.
 *
 * Integrates with:
 * - @claude-zen/brain: BrainCoordinator for intelligent design analysis and pattern recognition
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/knowledge: Knowledge management for design patterns and architectural knowledge
 * - @claude-zen/workflows: WorkflowEngine for design workflow orchestration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
export type { ArchitecturalConstraint, ArchitecturalDriver, BusinessContext, ComplianceRequirement, ComponentInterface, QualityAttributeSpec, SolutionArchitecturePattern, Stakeholder, SystemArchitectureType, SystemComponent, SystemDesign, SystemDesignStatus, } from '../../managers/system-solution-architecture-manager';
import type { BusinessContext, SolutionArchitecturePattern, SystemArchitectureType, SystemDesign, SystemDesignStatus } from '../../managers/system-solution-architecture-manager';
/**
 * System design management configuration
 */
export interface SystemDesignConfig {
    readonly maxSystemDesigns: number;
    readonly enableAIAnalysis: boolean;
    readonly enablePatternRecognition: boolean;
    readonly enableDesignValidation: boolean;
    readonly designValidationThreshold: number;
    readonly autoOptimizationEnabled: boolean;
}
/**
 * Design analytics dashboard data
 */
export interface SystemDesignDashboard {
    readonly totalDesigns: number;
    readonly designsByStatus: Record<SystemDesignStatus, number>;
    readonly designsByType: Record<string, number>;
    readonly designsByPattern: Record<string, number>;
    readonly averageDesignComplexity: number;
    readonly designQualityScore: number;
    readonly recentDesigns: SystemDesign[];
    readonly popularPatterns: PatternUsage[];
}
/**
 * Pattern usage analytics
 */
export interface PatternUsage {
    readonly pattern: SolutionArchitecturePattern;
    readonly usageCount: number;
    readonly successRate: number;
    readonly averageComplexity: number;
    readonly recommendationScore: number;
}
/**
 * System Design Management Service - System design creation and lifecycle management
 *
 * Provides comprehensive system design management with AI-powered analysis,
 * automated pattern recognition, and intelligent design coordination.
 */
export declare class SystemDesignManagementService {
    private readonly logger;
    private brainCoordinator?;
    private performanceTracker?;
    private telemetryManager?;
    private knowledgeManager?;
    private workflowEngine?;
    private initialized;
    private systemDesigns;
    private config;
    constructor(logger: Logger, config?: Partial<SystemDesignConfig>);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Create system design with AI-powered analysis and pattern recognition
     */
    createSystemDesign(name: string, type: SystemArchitectureType, pattern: SolutionArchitecturePattern, businessContext: BusinessContext): Promise<SystemDesign>;
}
//# sourceMappingURL=system-design-management-service.d.ts.map