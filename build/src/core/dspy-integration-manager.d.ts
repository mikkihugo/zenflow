/**
 * DSPy Integration Manager.
 *
 * Central coordination point for all DSPy-powered systems:
 * - Core operations (code analysis, generation, error diagnosis)
 * - Swarm intelligence (agent selection, topology optimization)
 * - MCP tools enhancement (intelligent project tools)
 * - Unified learning and optimization across all DSPy systems.
 */
/**
 * @file Dspy-integration management system.
 */
import type { DSPyConfig, DSPySystemStats } from '../neural/types/dspy-types.ts';
export interface DSPyUnifiedSystemStats extends DSPySystemStats {
    unified: {
        totalPrograms: number;
        totalDecisions: number;
        overallSuccessRate: number;
        learningVelocity: number;
        systemHealth: 'excellent' | 'good' | 'fair' | 'poor';
    };
}
export interface DSPyIntegrationConfig extends DSPyConfig {
    enableUnifiedLearning?: boolean;
    learningInterval?: number;
    maxHistorySize?: number;
}
export declare class DSPyIntegrationManager {
    private config;
    private dspyWrapper;
    private coreOperations;
    private swarmIntelligence;
    private mcpTools;
    private unifiedLearningHistory;
    constructor(config?: DSPyIntegrationConfig);
    private initializeSystems;
    /**
     * Analyze code with DSPy intelligence.
     *
     * @param code
     * @param taskType
     * @param context
     */
    analyzeCode(code: string, taskType?: string, context?: any): Promise<{
        enhancedInsights: string[];
        analysis: any;
        suggestions: any;
        complexity: any;
        confidence: any;
    }>;
    /**
     * Generate code with DSPy intelligence.
     *
     * @param requirements
     * @param context
     * @param styleGuide
     */
    generateCode(requirements: string, context: string, styleGuide?: string): Promise<{
        qualityScore: number;
        integrationRecommendations: string[];
        code: any;
        explanation: any;
        tests: any;
        estimatedComplexity: number;
    }>;
    /**
     * Diagnose errors with DSPy intelligence.
     *
     * @param errorMessage
     * @param codeContext
     * @param filePath
     */
    diagnoseError(errorMessage: string, codeContext: string, filePath: string): Promise<{
        similarIssues: string[];
        preventionStrategy: string[];
        diagnosis: any;
        fixSuggestions: any;
        confidence: any;
        severity: "low" | "medium" | "high" | "critical";
    }>;
    /**
     * Select optimal agents with DSPy intelligence.
     *
     * @param taskRequirements
     * @param availableAgents
     */
    selectOptimalAgents(taskRequirements: any, availableAgents: any[]): Promise<{
        performancePrediction: any;
        riskAssessment: any;
        selectedAgents: string[];
        reasoning: string;
        confidence: number;
        alternativeOptions?: string[];
    }>;
    /**
     * Optimize swarm topology with DSPy intelligence.
     *
     * @param currentTopology
     * @param taskLoad
     * @param agentPerformance
     * @param communicationPatterns
     */
    optimizeTopology(currentTopology: string, taskLoad: any, agentPerformance: any[], communicationPatterns: any): Promise<{
        migrationPlan: string[];
        rollbackStrategy: string[];
        optimalTopology: string;
        restructurePlan: object;
        performanceGain: number;
        implementationSteps: string[];
    }>;
    /**
     * Enhanced MCP tool execution.
     *
     * @param toolName
     * @param parameters
     * @param context
     */
    executeMCPTool(toolName: string, parameters: any, context?: any): Promise<{
        crossSystemInsights: string[];
        optimizationSuggestions: string[];
        success: boolean;
        result: any;
        reasoning?: string;
        suggestions?: string[];
        confidence?: number;
        followupActions?: string[];
    }>;
    /**
     * Update operation outcome for unified learning.
     *
     * @param system
     * @param operation
     * @param parameters
     * @param success
     * @param actualResult
     */
    updateOperationOutcome(system: 'core' | 'swarm' | 'mcp', operation: string, parameters: any, success: boolean, actualResult?: any): void;
    /**
     * Get comprehensive DSPy system statistics.
     */
    getSystemStats(): Promise<DSPyUnifiedSystemStats>;
    /**
     * Get system health report.
     */
    getHealthReport(): Promise<{
        overall: "excellent" | "good" | "fair" | "poor";
        systems: {
            core: string;
            swarm: string;
            mcp: string;
        };
        recommendations: string[];
        lastUpdate: Date;
    }>;
    private recordUnifiedLearning;
    private startUnifiedLearning;
    private performUnifiedLearning;
    private analyzeCrossSystemPatterns;
    private applyCrossSystemLearnings;
    private getEnhancedInsights;
    private assessCodeQuality;
    private getIntegrationRecommendations;
    private findSimilarIssues;
    private generatePreventionStrategy;
    private predictAgentPerformance;
    private assessSelectionRisk;
    private generateMigrationPlan;
    private generateRollbackStrategy;
    private getCrossSystemInsights;
    private getOptimizationSuggestions;
    private calculateLearningVelocity;
    private assessSystemHealth;
    private generateHealthRecommendations;
    private calculateSimilarity;
}
export default DSPyIntegrationManager;
//# sourceMappingURL=dspy-integration-manager.d.ts.map