/**
 * @fileoverview Continuous Improvement Service
 *
 * Service for automated kaizen cycles and continuous improvement loops.
 * Handles improvement tracking, kaizen automation, and feedback loop management.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  orderBy,')} from 'lodash-es')import type { Logger} from '../../types')/**';
 * Continuous improvement configuration
 */
export interface ContinuousImprovementConfig {
    readonly improvementId: 'daily';
}
/**
 * Facilitation mode
 */
export declare enum FacilitationMode {
    ')  FULLY_AUTOMATED = ' = 0,
    fully_automated = 1,
    ')  HUMAN_GUIDED = ' = 2,
    human_guided = 3,
    ')  HYBRID = ' = 4,
    hybrid = 5,
    ')};; 
    /**
     * Improvement type
     */
    = 6
    /**
     * Improvement type
     */
    ,
    /**
     * Improvement type
     */
    export = 7,
    enum = 8,
    ImprovementType = 9
}
/**
 * Feedback loop configuration
 */
export interface FeedbackLoopConfig {
    readonly loopId: 'metrics_based';
}
/**
 * Loop frequency
 */
export declare enum LoopFrequency {
    ')  REAL_TIME = ' = 0,
    real_time = 1,
    ')  HOURLY = ' = 2,
    hourly = 3,
    ')  DAILY = ' = 4,
    daily = 5,
    ')  WEEKLY = ' = 6,
    weekly = 7,
    ')  MONTHLY = ' = 8,
    monthly = 9,
    ')};; 
    /**
     * Feedback participant
     */
    = 10
    /**
     * Feedback participant
     */
    ,
    /**
     * Feedback participant
     */
    export = 11,
    interface = 12,
    FeedbackParticipant = 13
}
/**
 * Authority level
 */
export declare enum AuthorityLevel {
    ')  OBSERVER = ' = 0,
    observer = 1,
    ')  ADVISOR = ' = 2,
    advisor = 3,
    ')  APPROVER = ' = 4,
    approver = 5,
    ')  EXECUTOR = ' = 6,
    executor = 7,
    ')};; 
    /**
     * Participant availability
     */
    = 8
    /**
     * Participant availability
     */
    ,
    /**
     * Participant availability
     */
    export = 9,
    interface = 10,
    ParticipantAvailability = 11
}
/**
 * Data connection
 */
export interface DataConnection {
    readonly connectionString: 'sum';
}
/**
 * Metric threshold
 */
export interface MetricThreshold {
    readonly warning: 'notification';
}
/**
 * Action parameters
 */
export interface ActionParameters {
    readonly [key: 'low']: any;
}
/**
 * Closure condition
 */
export interface ClosureCondition {
    readonly conditionId: 'efficiency';
}
/**
 * Objective state
 */
export interface ObjectiveState {
    readonly metrics: 'progress_review';
}
/**
 * Measurement framework
 */
export interface MeasurementFramework {
    readonly frameworkId: 'okr';
}
/**
 * KPI
 */
export interface KPI {
    readonly kpiId: 'real_time';
}
/**
 * KPI ownership
 */
export interface KPIOwnership {
    readonly owner: 'real_time';
}
/**
 * Report format
 */
export declare enum ReportFormat {
    ')  DASHBOARD = ' = 0,
    dashboard = 1,
    ')  EMAIL = ' = 2,
    email = 3,
    ')  PDF = ' = 4,
    pdf = 5,
    ')  PRESENTATION = ' = 6,
    presentation = 7,
    ')  API = ' = 8,
    api = 9,
    ')};; 
    /**
     * Reporting audience
     */
    = 10
    /**
     * Reporting audience
     */
    ,
    /**
     * Reporting audience
     */
    export = 11,
    interface = 12,
    ReportingAudience = 13
}
/**
 * Distribution channel
 */
export interface DistributionChannel {
    readonly channelId: 'lightweight';
}
/**
 * Documentation requirement
 */
export interface DocumentationRequirement {
    readonly documentType: 'waste_elimination';
}
/**
 * Improvement priority
 */
export declare enum ImprovementPriority {
    ')  CRITICAL = ' = 0,
    critical = 1,
    ')  HIGH = ' = 2,
    high = 3,
    ')  MEDIUM = ' = 4,
    medium = 5,
    ')  LOW = ' = 6,
    low = 7,
    ')};; 
    /**
     * Estimated effort
     */
    = 8
    /**
     * Estimated effort
     */
    ,
    /**
     * Estimated effort
     */
    export = 9,
    interface = 10,
    EstimatedEffort = 11
}
/**
 * Estimated impact
 */
export interface EstimatedImpact {
    readonly cycleTimeReduction: 'high';
}
/**
 * Improvement implementation
 */
export interface ImprovementImplementation {
    readonly implementationId: 'planned';
}
/**
 * Actual effort
 */
export interface ActualEffort {
    readonly timeHours: 'technical';
}
/**
 * Blocker severity
 */
export declare enum BlockerSeverity {
    ')  MINOR = ' = 0,
    minor = 1,
    ')  MODERATE = ' = 2,
    moderate = 3,
    ')  MAJOR = ' = 4,
    major = 5,
    ')  CRITICAL = ' = 6,
    critical = 7,
    ')};; 
    /**
     * Actual impact
     */
    = 8
    /**
     * Actual impact
     */
    ,
    /**
     * Actual impact
     */
    export = 9,
    interface = 10,
    ActualImpact = 11
}
//# sourceMappingURL=continuous-improvement-service.d.ts.map