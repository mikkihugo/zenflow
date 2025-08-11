/**
 * DSPy-Enhanced MCP Tools.
 *
 * Intelligent MCP tools powered by DSPy for:
 * - Smart project analysis and recommendations
 * - Intelligent code generation and fixes
 * - Automated workflow optimization
 * - Context-aware task orchestration.
 */
/**
 * @file Interface implementation: dspy-enhanced-tools.
 */
export interface MCPToolRequest {
    toolName: string;
    parameters: any;
    context?: {
        projectPath?: string;
        userIntent?: string;
        previousActions?: string[];
    };
}
export interface MCPToolResponse {
    success: boolean;
    result: any;
    reasoning?: string;
    suggestions?: string[];
    confidence?: number;
    followupActions?: string[];
}
export declare class DSPyEnhancedMCPTools {
    private dspy;
    private programs;
    private toolUsageHistory;
    constructor();
    private initializeMCPPrograms;
    /**
     * Enhanced project analysis tool.
     *
     * @param request
     */
    analyzeProject(request: MCPToolRequest): Promise<MCPToolResponse>;
    /**
     * Enhanced code generation tool.
     *
     * @param request
     */
    generateCode(request: MCPToolRequest): Promise<MCPToolResponse>;
    /**
     * Enhanced error resolution tool.
     *
     * @param request
     */
    resolveError(request: MCPToolRequest): Promise<MCPToolResponse>;
    /**
     * Enhanced workflow optimization tool.
     *
     * @param request
     */
    optimizeWorkflow(request: MCPToolRequest): Promise<MCPToolResponse>;
    /**
     * Enhanced task orchestration tool.
     *
     * @param request
     */
    orchestrateTask(request: MCPToolRequest): Promise<MCPToolResponse>;
    /**
     * Get enhanced tool usage statistics.
     */
    getToolStats(): {
        totalTools: number;
        availableTools: string[];
        recentUsage: number;
        successRate: number;
        popularTools: {
            tool: string;
            count: number;
        }[];
        totalUsageHistory: number;
    };
    /**
     * Learn from tool usage outcomes.
     *
     * @param toolName
     * @param parameters
     * @param success
     * @param actualResult
     */
    updateToolOutcome(toolName: string, parameters: any, success: boolean, actualResult?: any): void;
    private recordToolUsage;
    private trainProgramFromOutcome;
    private createErrorResponse;
    private classifyErrorType;
    private assessErrorSeverity;
    private generateFollowupActions;
    private calculateTimeSaving;
    private estimateTaskDuration;
}
export default DSPyEnhancedMCPTools;
//# sourceMappingURL=dspy-enhanced-tools.d.ts.map