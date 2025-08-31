/**
 * @fileoverview Flow Optimization Service
 *
 * Service for AI-powered flow optimization recommendations.
 * Handles optimization strategy generation, flow analysis, and recommendation scoring.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  meanBy,
  orderBy,
  sumBy,
} from 'lodash-es')../../types');
 * Flow optimization configuration
 */
export interface FlowOptimizationConfig {
    readonly optimizationId: 'low';
}
/**
 * Optimization scope
 */
export interface OptimizationScope {
    readonly includeStages: 'cycle_time';
}
/**
 * Optimization constraints
 */
export interface OptimizationConstraints {
    readonly budgetConstraint: 'low';
}
/**
 * Milestone
 */
export interface Milestone {
    readonly milestoneId: 'critical';
}
/**
 * Objective weight
 */
export interface ObjectiveWeight {
    readonly objectiveId: 'conservative';
}
/**
 * Change management preference
 */
export interface ChangeManagementPreference {
}
/**
 * Monitoring requirement
 */
export interface MonitoringRequirement {
    readonly metricName: 'process_optimization';
}
/**
 * Recommendation priority
 */
export declare enum RecommendationPriority {
    ') = 0,
    critical = 1,
    ') = 2,
    high = 3,
    ') = 4,
    medium = 5,
    ') = 6,
    low = 7,
    ')available';
}
/**
 * Implementation step
 */
export interface ImplementationStep {
    readonly stepId: 'technical';
}
/**
 * Risk probability
 */
export declare enum RiskProbability {
    ') = 0,
    very_low = 1,
    ') = 2,
    low = 3,
    ') = 4,
    medium = 5,
    ') = 6,
    high = 7,
    ') = 8,
    very_high = 9,
    ')}; 
    /**
     * Risk impact
     */
    = 10
    /**
     * Risk impact
     */
    ,
    /**
     * Risk impact
     */
    export = 11,
    enum = 12,
    RiskImpact = 13
}
//# sourceMappingURL=flow-optimization-service.d.ts.map