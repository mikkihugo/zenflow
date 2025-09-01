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
'} from 'lodash-es')../../types');
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
    readonly metricName: string;
    readonly threshold: number;
    readonly frequency: string;
}
/**
* Recommendation priority
*/
export declare enum RecommendationPriority {
    critical = 0,
    high = 1,
    medium = 2,
    low = 3
}

/**
* Implementation step
*/
export interface ImplementationStep {
    readonly stepId: string;
    readonly description: string;
    readonly duration: number;
}

/**
* Risk probability
*/
export declare enum RiskProbability {
    very_low = 0,
    low = 1,
    medium = 2,
    high = 3,
    very_high = 4
}

/**
* Risk impact
*/
export declare enum RiskImpact {
    very_low = 0,
    low = 1,
    medium = 2,
    high = 3,
    very_high = 4
}
//# sourceMappingURL=flow-optimization-service.d.ts.map