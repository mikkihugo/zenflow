/**
 * DSPy Swarm MCP Tools.
 *
 * MCP tools for managing DSPy-based swarms where each agent is a DSPy program.
 * Provides intelligent coordination, optimization, and learning capabilities.
 */
/**
 * @file Coordination system: dspy-swarm-mcp-tools
 */
import type { AgentType } from '../types.ts';
/**
 * Initialize DSPy swarm with intelligent agents.
 */
export declare function dspy_swarm_init(params: {
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    model?: string;
    temperature?: number;
    maxAgents?: number;
    enableContinuousLearning?: boolean;
}): Promise<{
    success: boolean;
    swarmId: string;
    agents: Array<{
        id: string;
        name: string;
        type: AgentType;
        capabilities: string[];
    }>;
    topology: string;
    message: string;
}>;
/**
 * Execute task using DSPy swarm intelligence.
 */
export declare function dspy_swarm_execute_task(params: {
    type: string;
    description: string;
    input: any;
    requiredCapabilities?: string[];
    priority?: 'low' | 'medium' | 'high' | 'critical';
    complexity?: number;
}): Promise<{
    success: boolean;
    taskId: string;
    assignedAgent?: string;
    result?: any;
    executionTime?: number;
    learningApplied: boolean;
    message: string;
}>;
/**
 * Generate code using DSPy code generator agent.
 */
export declare function dspy_swarm_generate_code(params: {
    requirements: string;
    context?: string;
    styleGuide?: string;
    includeTests?: boolean;
    includeDocumentation?: boolean;
}): Promise<{
    success: boolean;
    code?: string;
    tests?: string[];
    documentation?: string;
    complexityScore?: number;
    qualityMetrics?: any;
    message: string;
}>;
/**
 * Analyze code using DSPy code analyzer agent.
 */
export declare function dspy_swarm_analyze_code(params: {
    code: string;
    filePath?: string;
    projectContext?: string;
    analysisDepth?: 'basic' | 'detailed' | 'comprehensive';
}): Promise<{
    success: boolean;
    qualityScore?: number;
    issues?: Array<{
        type: string;
        severity: string;
        message: string;
        line?: number;
        suggestion?: string;
    }>;
    suggestions?: string[];
    refactoringOpportunities?: string[];
    metrics?: any;
    message: string;
}>;
/**
 * Design architecture using DSPy architect agent.
 */
export declare function dspy_swarm_design_architecture(params: {
    requirements: string;
    constraints?: string[];
    domain?: string;
    scale?: string;
    includePatterns?: boolean;
}): Promise<{
    success: boolean;
    architecture?: any;
    components?: any[];
    patterns?: any[];
    tradeoffs?: string[];
    recommendations?: string[];
    message: string;
}>;
/**
 * Get DSPy swarm status and performance metrics.
 */
export declare function dspy_swarm_status(): Promise<{
    success: boolean;
    swarmActive: boolean;
    agents: Array<{
        id: string;
        name: string;
        type: AgentType;
        status: string;
        performance: any;
        learningExamples: number;
    }>;
    topology: any;
    tasks: {
        active: number;
        completed: number;
        successRate: number;
    };
    learning: {
        totalExamples: number;
        recentOptimizations: number;
    };
    overallPerformance: {
        averageAccuracy: number;
        averageResponseTime: number;
        successRate: number;
    };
    message: string;
}>;
/**
 * Optimize specific DSPy agent with new examples.
 */
export declare function dspy_swarm_optimize_agent(params: {
    agentId?: string;
    agentType?: AgentType;
    examples?: Array<{
        input: any;
        output: any;
    }>;
    forceOptimization?: boolean;
}): Promise<{
    success: boolean;
    agentId?: string;
    optimized: boolean;
    performanceGain?: number;
    newAccuracy?: number;
    message: string;
}>;
/**
 * Cleanup DSPy swarm resources.
 */
export declare function dspy_swarm_cleanup(): Promise<{
    success: boolean;
    message: string;
}>;
export declare const dspySwarmMCPTools: {
    dspy_swarm_init: typeof dspy_swarm_init;
    dspy_swarm_execute_task: typeof dspy_swarm_execute_task;
    dspy_swarm_generate_code: typeof dspy_swarm_generate_code;
    dspy_swarm_analyze_code: typeof dspy_swarm_analyze_code;
    dspy_swarm_design_architecture: typeof dspy_swarm_design_architecture;
    dspy_swarm_status: typeof dspy_swarm_status;
    dspy_swarm_optimize_agent: typeof dspy_swarm_optimize_agent;
    dspy_swarm_cleanup: typeof dspy_swarm_cleanup;
};
export default dspySwarmMCPTools;
//# sourceMappingURL=dspy-swarm-mcp-tools.d.ts.map