/**
 * DSPy-Powered Swarm Intelligence.
 *
 * Integrates DSPy into swarm coordination for:
 * - Intelligent agent selection and task assignment
 * - Dynamic topology optimization
 * - Self-improving coordination strategies.
 * - Predictive performance optimization.
 */
/**
 * @file Coordination system: dspy-swarm-intelligence.
 */
import type { AgentType } from '../types.ts';
export interface SwarmIntelligenceConfig {
    model?: string;
    temperature?: number;
    enableContinuousLearning?: boolean;
    optimizationInterval?: number;
}
export interface AgentPerformanceData {
    agentId: string;
    agentType: AgentType;
    tasksCompleted: number;
    averageResponseTime: number;
    successRate: number;
    capabilities: string[];
    currentLoad: number;
}
export interface TaskRequirements {
    taskType: string;
    complexity: number;
    requiredCapabilities: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
    estimatedDuration: number;
}
export declare class DSPySwarmIntelligence {
    private dspyWrapper;
    private config;
    private learningHistory;
    constructor(config?: SwarmIntelligenceConfig);
    /**
     * Initialize the DSPy wrapper.
     *
     * @private
     */
    private initializeWrapper;
    /**
     * Generic method to execute DSPy programs with fallback handling.
     *
     * @param signature
     * @param description
     * @param input
     * @param fallbackResult
     * @param programType
     * @private
     */
    private executeDSPyProgram;
    /**
     * Intelligently select agents for a task using DSPy wrapper.
     *
     * @param taskRequirements
     * @param availableAgents
     */
    selectOptimalAgents(taskRequirements: TaskRequirements, availableAgents: AgentPerformanceData[]): Promise<{
        selectedAgents: string[];
        reasoning: string;
        confidence: number;
        alternativeOptions?: string[];
    }>;
    /**
     * Optimize swarm topology based on current conditions using DSPy wrapper.
     *
     * @param currentTopology
     * @param taskLoad
     * @param agentPerformance
     * @param communicationPatterns
     */
    optimizeTopology(currentTopology: string, taskLoad: object, agentPerformance: AgentPerformanceData[], communicationPatterns: object): Promise<{
        optimalTopology: string;
        restructurePlan: object;
        performanceGain: number;
        implementationSteps: string[];
    }>;
    /**
     * Optimize load balancing across agents using DSPy wrapper.
     *
     * @param agentLoads
     * @param taskQueue
     * @param performanceMetrics
     */
    optimizeLoadBalancing(agentLoads: AgentPerformanceData[], taskQueue: any[], performanceMetrics: object): Promise<{
        loadDistribution: object;
        rebalancingActions: object[];
        efficiencyScore: number;
        urgentActions: string[];
    }>;
    /**
     * Predict swarm performance and identify potential issues using DSPy wrapper.
     *
     * @param historicalPerformance
     * @param currentState
     * @param upcomingTasks
     */
    predictPerformance(historicalPerformance: object[], currentState: object, upcomingTasks: any[]): Promise<{
        performancePrediction: object;
        bottleneckWarnings: string[];
        optimizationSuggestions: string[];
        confidence: number;
    }>;
    /**
     * Intelligently recover from failures using DSPy wrapper.
     *
     * @param failureContext
     * @param availableAgents
     * @param taskState
     */
    recoverFromFailure(failureContext: object, availableAgents: AgentPerformanceData[], taskState: object): Promise<{
        recoveryStrategy: object;
        agentReassignments: object[];
        riskMitigation: string[];
        estimatedRecoveryTime: number;
    }>;
    /**
     * Update success/failure of previous decisions for learning.
     *
     * @param decisionId
     * @param success
     * @param metrics
     */
    updateDecisionOutcome(decisionId: string, success: boolean, metrics: object): void;
    /**
     * Get swarm intelligence statistics.
     */
    getIntelligenceStats(): {
        totalPrograms: number;
        programTypes: string[];
        learningHistorySize: number;
        recentDecisions: number;
        successRate: number;
        continuousLearningEnabled: boolean | undefined;
        lmDriver: string;
    };
    private recordLearningExample;
    private startContinuousLearning;
    private performContinuousLearning;
    private fallbackAgentSelection;
    private generateImplementationSteps;
    private identifyUrgentActions;
    private assessPredictionConfidence;
    private estimateRecoveryTime;
    private parseAgentSelectionResponse;
    private createBalancedDistribution;
}
export default DSPySwarmIntelligence;
//# sourceMappingURL=dspy-swarm-intelligence.d.ts.map