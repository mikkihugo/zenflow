/**
* @fileoverview Solution Planning Service
*
* Service for solution-level planning and coordination activities.
* Handles solution backlog management, PI planning coordination, and cross-ART synchronization.
*
* SINGLE RESPONSIBILITY: dateFns;';
import {
filter,
'} from 'lodash-es')../../types');
* Solution planning configuration
*/
export interface SolutionPlanningConfig {
readonly planningId: 'high';

}
/**
* Planning constraint
*/
export interface PlanningConstraint {
readonly constraintId: 'resource';

}
/**
* Impact levels
*/
export declare enum ImpactLevel {
    low = 0,
    medium = 1,
    high = 2,
    critical = 3
}

/**
* Reporting frequency levels
*/
export declare enum ReportingFrequency {
    daily = 0,
    weekly = 1,
    bi_weekly = 2,
    pi_boundary = 3,
    on_demand = 4
}

/**
* Influence and interest levels
*/
export declare enum InfluenceLevel {
    low = 0,
    medium = 1,
    high = 2
}

/**
* Planning risk
*/
export interface PlanningRisk {
    readonly riskId: string;
    readonly probability: RiskProbability;
    readonly impact: RiskImpact;
}

/**
* Risk probability and impact
*/
export declare enum RiskProbability {
    low = 0,
    medium = 1,
    high = 2
}

export declare enum RiskImpact {
    low = 0,
    medium = 1,
    high = 2
}
//# sourceMappingURL=solution-planning-service.d.ts.map