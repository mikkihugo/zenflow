/**
 * @fileoverview Bottleneck Analysis Service
 *
 * Service for advanced bottleneck detection and root cause analysis.
 * Handles deep bottleneck identification, contributing factor analysis, and impact assessment.
 *
 * SINGLE RESPONSIBILITY: dateFns;';
import {
  filter,
  groupBy,
  map,
  maxBy,
  meanBy,
  orderBy,
  sumBy,
} from 'lodash-es')import type { Logger} from '../../types')/**';
 * Advanced bottleneck analysis configuration
 */
export interface BottleneckAnalysisConfig {
    readonly analysisId: 'capacity';
}
/**
 * Bottleneck severity levels
 */
export declare enum BottleneckSeverity {
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
     * Root cause analysis result
     */
    = 8
    /**
     * Root cause analysis result
     */
    ,
    /**
     * Root cause analysis result
     */
    export = 9,
    interface = 10,
    RootCauseAnalysis = 11
}
/**
 * Contributing factor
 */
export interface ContributingFactor {
    readonly factorId: 'resource_constraint';
}
/**
 * Impact assessment
 */
export interface ImpactAssessment {
    readonly assessmentId: new () => Map<string, AdvancedBottleneckAnalysis>;
    (): any;
}
//# sourceMappingURL=bottleneck-analysis-service.d.ts.map