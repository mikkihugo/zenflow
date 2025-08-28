/**
 * @fileoverview Solution Planning Service
 *
 * Service for solution-level planning and coordination activities.
 * Handles solution backlog management, PI planning coordination, and cross-ART synchronization.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  filter,
} from 'lodash-es')import type { Logger} from '../../types')/**';
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
    ')  LOW = ' = 0,
    low = 1,
    ')  MEDIUM = ' = 2,
    medium = 3,
    ')  HIGH = ' = 4,
    high = 5,
    ')  CRITICAL = ' = 6,
    critical = 7,
    ')};; 
    /**
     * Planning horizon configuration
     */
    = 8
    /**
     * Planning horizon configuration
     */
    ,
    /**
     * Planning horizon configuration
     */
    export = 9,
    interface = 10,
    PlanningHorizon = 11
}
/**
 * Event frequency
 */
export declare enum EventFrequency {
    ')  DAILY = ' = 0,
    daily = 1,
    ')  WEEKLY = ' = 2,
    weekly = 3,
    ')  BI_WEEKLY = ' = 4,
    bi_weekly = 5,
    ')  PI_BOUNDARY = ' = 6,
    pi_boundary = 7,
    ')  ON_DEMAND = ' = 8,
    on_demand = 9,
    ')};; 
    /**
     * Event participant
     */
    = 10
    /**
     * Event participant
     */
    ,
    /**
     * Event participant
     */
    export = 11,
    interface = 12,
    EventParticipant = 13
}
/**
 * Agenda item
 */
export interface AgendaItem {
    readonly itemId: 'business_owner';
}
/**
 * Influence and interest levels
 */
export declare enum InfluenceLevel {
    ')  HIGH = ' = 0,
    high = 1,
    ')  MEDIUM = ' = 2,
    medium = 3,
    ')  LOW = ' = 4,
    low = 5,
    ')};; = 6,
    export = 7,
    enum = 8,
    InterestLevel = 9
}
/**
 * Solution commitment
 */
export interface SolutionCommitment {
    readonly commitmentId: 'high';
}
/**
 * Planning risk
 */
export interface PlanningRisk {
    readonly riskId: 'technical';
}
/**
 * Risk probability and impact
 */
export declare enum RiskProbability {
    ')  HIGH = ' = 0,
    high = 1,
    ')  MEDIUM = ' = 2,
    medium = 3,
    ')  LOW = ' = 4,
    low = 5,
    ')};; = 6,
    export = 7,
    enum = 8,
    RiskImpact = 9
}
//# sourceMappingURL=solution-planning-service.d.ts.map