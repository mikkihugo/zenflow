/**
 * @fileoverview Continuous Improvement Service
 *
 * Service for automated kaizen cycles and continuous improvement loops.
 * Handles improvement tracking, kaizen automation, and feedback loop management.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  orderBy,')lodash-es')../../types');
 * Continuous improvement configuration
 */
export interface ContinuousImprovementConfig {
    readonly improvementId: 'daily';
}
/**
 * Facilitation mode
 */
export declare enum FacilitationMode {
    ') = 0,
    fully_automated = 1,
    ') = 2,
    human_guided = 3,
    ') = 4,
    hybrid = 5,
    ')metrics_based';
}
/**
 * Loop frequency
 */
export declare enum LoopFrequency {
    ') = 0,
    real_time = 1,
    ') = 2,
    hourly = 3,
    ') = 4,
    daily = 5,
    ') = 6,
    weekly = 7,
    ') = 8,
    monthly = 9,
    '))  OBSERVER = ' = 0,
    observer = 1,
    ') = 2,
    advisor = 3,
    ') = 4,
    approver = 5,
    ') = 6,
    executor = 7,
    ')sum';
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
    ') = 0,
    dashboard = 1,
    ') = 2,
    email = 3,
    ') = 4,
    pdf = 5,
    ') = 6,
    presentation = 7,
    ') = 8,
    api = 9,
    ')lightweight';
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
    ') = 0,
    critical = 1,
    ') = 2,
    high = 3,
    ') = 4,
    medium = 5,
    ') = 6,
    low = 7,
    ')high';
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
    ') = 0,
    minor = 1,
    ') = 2,
    moderate = 3,
    ') = 4,
    major = 5,
    ') = 6,
    critical = 7,
    ')}; 
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