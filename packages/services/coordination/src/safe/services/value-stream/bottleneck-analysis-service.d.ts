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
} from 'lodash-es')../../types');
 * Advanced bottleneck analysis configuration
 */
export interface BottleneckAnalysisConfig {
    readonly analysisId: 'capacity';
}
/**
 * Bottleneck severity levels
 */
export declare enum BottleneckSeverity {
    ') = 0,
    critical = 1,
    ') = 2,
    high = 3,
    ') = 4,
    medium = 5,
    ') = 6,
    low = 7,
    ')resource_constraint';
}
/**
 * Impact assessment
 */
export interface ImpactAssessment {
    readonly assessmentId: new () => Map<string, AdvancedBottleneckAnalysis>;
    (): any;
}
//# sourceMappingURL=bottleneck-analysis-service.d.ts.map