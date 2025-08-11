/**
 * @file Dspy-enhanced-operations implementation.
 */
export declare class DSPyEnhancedOperations {
    private dspyWrapper;
    private programs;
    constructor(dspyWrapper: DSPyWrapper);
    private initializePrograms;
    /**
     * Analyze code using DSPy intelligence.
     *
     * @param code
     * @param taskType
     */
    analyzeCode(code: string, taskType?: string): Promise<{
        analysis: any;
        suggestions: any;
        complexity: any;
        confidence: any;
    }>;
    /**
     * Diagnose errors using DSPy intelligence.
     *
     * @param errorMessage
     * @param codeContext
     * @param filePath
     */
    diagnoseError(errorMessage: string, codeContext: string, filePath: string): Promise<{
        diagnosis: any;
        fixSuggestions: any;
        confidence: any;
        severity: "low" | "medium" | "high" | "critical";
    }>;
    /**
     * Generate code using DSPy intelligence.
     *
     * @param requirements
     * @param context
     * @param styleGuide
     */
    generateCode(requirements: string, context: string, styleGuide?: string): Promise<{
        code: any;
        explanation: any;
        tests: any;
        estimatedComplexity: number;
    }>;
    /**
     * Orchestrate tasks using DSPy intelligence.
     *
     * @param taskDescription
     * @param availableAgents
     * @param projectContext
     */
    orchestrateTask(taskDescription: string, availableAgents: string[], projectContext: string): Promise<{
        execution_plan: any;
        agent_assignments: any;
        priority_order: any;
        estimatedDuration: string;
    }>;
    /**
     * Optimize swarm using DSPy intelligence.
     *
     * @param currentTopology
     * @param taskRequirements
     * @param performanceMetrics
     */
    optimizeSwarm(currentTopology: string, taskRequirements: string[], performanceMetrics: object): Promise<{
        optimizedTopology: any;
        agentRebalancing: any;
        performancePrediction: any;
        optimizationReasoning: any;
    }>;
    /**
     * Train DSPy programs with examples from successful operations.
     *
     * @param operationType
     * @param examples
     */
    trainFromSuccessfulOperations(operationType: string, examples: Array<{
        input: any;
        output: any;
        success: boolean;
    }>): Promise<void>;
    /**
     * Get DSPy program statistics.
     */
    getProgramStats(): {
        totalPrograms: number;
        programTypes: string[];
        readyPrograms: number;
    };
    private assessErrorSeverity;
    private estimateComplexity;
    private estimateDuration;
}
export default DSPyEnhancedOperations;
//# sourceMappingURL=dspy-enhanced-operations.d.ts.map