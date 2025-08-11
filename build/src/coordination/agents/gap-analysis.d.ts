/**
 * Agent System Gap Analysis - Compare our 147+ agents vs claude-zen's 54.
 *
 * This utility provides comprehensive analysis of our agent system.
 * Capabilities compared to claude-zen and other systems.
 */
/**
 * @file Coordination system: gap-analysis.
 */
import type { AgentType } from '../types.ts';
export declare const CLAUDE_FLOW_AGENTS: Record<string, string[]>;
export declare const OUR_AGENT_CATEGORIES: Record<string, AgentType[]>;
export interface GapAnalysisResult {
    ourTotal: number;
    clauseFlowTotal: number;
    ourAdvantage: number;
    advantageRatio: number;
    categoryComparison: Record<string, {
        ours: number;
        theirs: number;
        advantage: number;
        ourAgents?: AgentType[];
        theirAgents?: string[];
    }>;
    missingCapabilities: string[];
    uniqueAdvantages: string[];
    recommendations: string[];
}
/**
 * Perform comprehensive gap analysis between our agent system and claude-zen.
 *
 * @example
 */
export declare function performGapAnalysis(): GapAnalysisResult;
/**
 * Generate a detailed comparison report.
 *
 * @example
 */
export declare function generateComparisonReport(): string;
/**
 * Audit current auto-assignment capabilities.
 *
 * @example
 */
export declare function auditAutoAssignmentCapabilities(): {
    hasIntelligentSelection: boolean;
    hasFileTypeMatching: boolean;
    hasWorkloadBalancing: boolean;
    hasPerformanceRanking: boolean;
    capabilities: string[];
    recommendations: string[];
};
//# sourceMappingURL=gap-analysis.d.ts.map