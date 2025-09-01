/**
* @fileoverview Bottleneck Analysis Service
*
* Service for advanced bottleneck detection and root cause analysis.
* Handles deep bottleneck identification, contributing factor analysis, and impact assessment.
*
* SINGLE RESPONSIBILITY: Bottleneck analysis and root cause identification
*/

/**
* Advanced bottleneck analysis configuration
*/
export interface BottleneckAnalysisConfig {
  readonly analysisId: string;
}
/**
* Bottleneck severity levels
*/
export declare enum BottleneckSeverity {
  critical = 1,
  high = 3,
  medium = 5,
  low = 7
}

/**
* Impact assessment
*/
export interface ImpactAssessment {
  readonly assessmentId: string;
}
//# sourceMappingURL=bottleneck-analysis-service.d.ts.map