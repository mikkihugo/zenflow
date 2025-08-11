/**
 * @file agent-gap-analysis implementation
 */
export interface GapAnalysis {
    missingCapabilities: string[];
    performanceGaps: string[];
    recommendations: string[];
}
export declare class AgentGapAnalyzer {
    analyzeCapabilityGaps(): GapAnalysis;
}
//# sourceMappingURL=agent-gap-analysis.d.ts.map