/**
 * @fileoverview Compliance Monitoring Service - Automated compliance validation and monitoring.
 *
 * Provides specialized compliance monitoring with AI-powered validation,
 * automated compliance checking, and fact-based reasoning for regulatory requirements.
 *
 * Integrates with:
 * - @claude-zen/fact-system: Fact-based reasoning for compliance validation and rule checking
 * - @claude-zen/brain: BrainCoordinator for intelligent compliance analysis and recommendation
 * - @claude-zen/foundation: Performance tracking and telemetry
 * - @claude-zen/monitoring: Performance monitoring and compliance health tracking
 * - @claude-zen/workflows: WorkflowEngine for compliance workflow orchestration
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '@claude-zen/foundation';
export type { ComplianceRequirement, ControlRequirement, SystemDesign, } from '../../managers/system-solution-architecture-manager';
import type { SystemDesign } from '../../managers/system-solution-architecture-manager';
/**
 * Compliance monitoring configuration
 */
export interface ComplianceMonitoringConfig {
    readonly enableContinuousMonitoring: boolean;
    readonly enableAutomatedRemediation: boolean;
    readonly enableRealTimeAlerts: boolean;
    readonly monitoringInterval: number;
    readonly complianceThreshold: number;
    readonly criticalViolationThreshold: number;
    readonly supportedFrameworks: string[];
}
/**
 * Compliance validation result
 */
export interface ComplianceValidationResult {
    readonly systemDesignId: string;
    readonly validationId: string;
    readonly overallCompliance: number;
    readonly compliant: boolean;
    readonly violations: ComplianceViolation[];
    readonly recommendations: ComplianceRecommendation[];
    readonly validatedAt: Date;
    readonly nextValidationDue: Date;
}
/**
 * Compliance violation
 */
export interface ComplianceViolation {
    readonly violationId: string;
    readonly framework: string;
    readonly requirement: string;
    readonly severity: 'critical|high|medium|low;;
    readonly description: string;
    readonly evidenceGaps: string[];
    readonly impactAssessment: string;
    readonly remediationSteps: string[];
    readonly estimatedEffort: number;
    readonly businessRisk: 'critical|high|medium|low;;
}
/**
 * Compliance recommendation
 */
export interface ComplianceRecommendation {
    readonly recommendationId: string;
    readonly type: process_improvement | control_enhancement | technology_update | 'training;;
    readonly title: string;
    readonly description: string;
    readonly expectedImpact: string;
    readonly implementationPlan: ImplementationStep[];
    readonly priority: 'critical|high|medium|low;;
    readonly estimatedCost: number;
    readonly timeline: string;
}
/**
 * Implementation step for recommendations
 */
export interface ImplementationStep {
    readonly stepId: string;
    readonly description: string;
    readonly duration: number;
    readonly dependencies: string[];
    readonly owner: string;
    readonly deliverables: string[];
}
/**
 * Compliance analytics dashboard data
 */
export interface ComplianceDashboard {
    readonly overallComplianceRate: number;
    readonly complianceByFramework: Record<string, number>;
    readonly violationsByFramework: Record<string, number>;
    readonly violationsBySeverity: Record<string, number>;
    readonly complianceTrend: ComplianceTrendData[];
    readonly criticalViolations: ComplianceViolation[];
    readonly upcomingValidations: ValidationSchedule[];
    readonly remediationProgress: RemediationProgress[];
}
/**
 * Compliance trend data
 */
export interface ComplianceTrendData {
    readonly period: string;
    readonly complianceRate: number;
    readonly violationCount: number;
    readonly criticalViolations: number;
    readonly trend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
}
/**
 * Validation schedule
 */
export interface ValidationSchedule {
    readonly systemDesignId: string;
    readonly systemDesignName: string;
    readonly framework: string;
    readonly scheduledDate: Date;
    readonly validationType: 'scheduled' | 'triggered' | 'ad_hoc';
    readonly priority: 'critical|high|medium|low;;
}
/**
 * Remediation progress tracking
 */
export interface RemediationProgress {
    readonly violationId: string;
    readonly systemDesignId: string;
    readonly currentStep: number;
    readonly totalSteps: number;
    readonly progressPercentage: number;
    readonly estimatedCompletion: Date;
    readonly responsible: string;
    readonly status: 'not_started|in_progress|completed|blocked;;
}
/**
 * Compliance Monitoring Service - Automated compliance validation and monitoring
 *
 * Provides comprehensive compliance monitoring with AI-powered validation,
 * automated compliance checking, and fact-based reasoning for regulatory requirements.
 */
export declare class ComplianceMonitoringService {
    private readonly logger;
    private factSystem?;
    private brainCoordinator?;
    private performanceTracker?;
    private telemetryManager?;
    private monitoringSystem?;
    private workflowEngine?;
    private initialized;
    private validationResults;
    private activeViolations;
    private remediationTracking;
    private config;
    private monitoringTimer?;
    constructor(logger: Logger, config?: Partial<ComplianceMonitoringConfig>);
    /**
     * Initialize service with lazy-loaded dependencies
     */
    initialize(): Promise<void>;
    /**
     * Validate compliance with AI-powered analysis and fact-based reasoning
     */
    validateCompliance(systemDesign: SystemDesign, frameworks?: string[]): Promise<ComplianceValidationResult>;
    private generateComplianceRecommendations;
    private calculateComplianceScore;
    private assessViolationSeverity;
    private assessBusinessRisk;
    private calculateOverallComplianceRate;
    private groupComplianceByFramework;
    private groupViolationsByFramework;
    private groupViolationsBySeverity;
    private generateUpcomingValidations;
}
export default ComplianceMonitoringService;
//# sourceMappingURL=compliance-monitoring-service.d.ts.map