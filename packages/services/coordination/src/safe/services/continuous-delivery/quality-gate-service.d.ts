export type { CriterionResult, EscalationRule, NotificationRule, QualityGate, QualityGateCriterion, QualityGateResult, QualityGateType, } from './sparc-cd-mapping-service';
/**
 * Quality gate execution configuration
 */
export interface QualityGateExecutionConfig {
    readonly gateId: string;
    readonly pipelineId: string;
    readonly stageId: string;
    readonly context: QualityGateContext;
    readonly timeout: number;
    readonly retryPolicy: GateRetryPolicy;
    readonly escalationEnabled: boolean;
    readonly notificationEnabled: boolean;
}
/**
 * Quality gate context for execution
 */
export interface QualityGateContext {
    readonly projectId: string;
    '; : any;
    readonly environment: 'development' | ' staging' | ' production';
    readonly artifacts: QualityArtifact[];
    readonly metadata: Record<string, unknown>;
    readonly previousResults?: QualityGateResult[];
    readonly historicalData?: QualityHistoricalData;
}
/**
 * Quality artifact for evaluation
 */
export interface QualityArtifact {
    readonly id: string;
    readonly type: code | binary | test_results | security_scan | 'documentation';
    readonly location: string;
    readonly size: number;
    readonly checksum: string;
    readonly metadata: Record<string, unknown>;
    readonly createdAt: Date;
}
/**
 * Historical quality data
 */
export interface QualityHistoricalData {
    readonly previousScores: number[];
    readonly trends: QualityTrend[];
    readonly benchmarks: QualityBenchmark[];
    readonly improvements: QualityImprovement[];
}
/**
 * Quality trend analysis
 */
export interface QualityTrend {
    readonly metric: string;
    readonly direction: 'improving' | ' stable' | ' declining' | ' improving' | ' stable' | ' declining' | ' degrading';
    readonly change: number;
    readonly period: string;
    readonly confidence: number;
}
/**
 * Quality benchmark
 */
export interface QualityBenchmark {
    readonly metric: string;
    readonly industryAverage: number;
    readonly bestPractice: number;
    readonly organizationAverage: number;
    readonly currentValue: number;
}
/**
 * Quality improvement suggestion
 */
export interface QualityImprovement {
    readonly area: string;
    readonly suggestion: string;
    readonly impact: 'low' | ' medium' | ' high';
    readonly effort: 'low' | ' medium' | ' high';
    readonly priority: number;
}
/**
 * Gate retry policy
 */
export interface GateRetryPolicy {
    readonly enabled: boolean;
    readonly maxAttempts: number;
    readonly backoffStrategy: 'linear' | ' exponential' | ' fixed';
    readonly baseDelay: number;
    readonly maxDelay: number;
    readonly retryableFailures: string[];
}
/**
 * Quality gate templates for different scenarios
 */
export interface QualityGateTemplate {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly applicableStages: string[];
    readonly defaultCriteria: QualityGateCriterion[];
    readonly recommendedTimeout: number;
    readonly category: security | performance | quality | compliance | 'architecture';
}
/**
 * Quality gate optimization result
 */
export interface QualityGateOptimization {
    readonly gateId: string;
    readonly originalScore: number;
    readonly optimizedScore: number;
    readonly improvements: string[];
    readonly adjustedCriteria: QualityGateCriterion[];
    readonly recommendedActions: string[];
    readonly confidence: number;
}
import type { QualityGateCriterion, QualityGateResult } from './sparc-cd-mapping-service';
/**
 * Quality Gate Service - Automated quality gates and criteria management
 *
 * Provides comprehensive quality gate management with automated criteria evaluation,
 * intelligent scoring, AI-powered optimization, and human-in-loop approvals for critical decisions.
 */
export declare class QualityGateService {
    private readonly logger;
    private qualityGateTemplates;
    private executionHistory;
    constructor(logger: logger);
}
//# sourceMappingURL=quality-gate-service.d.ts.map