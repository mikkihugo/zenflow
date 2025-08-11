/**
 * DSPy Swarm Coordinator.
 *
 * A DSPy-powered swarm where each agent is a DSPy program that learns and optimizes.
 * This creates an intelligent swarm where agents improve their performance over time.
 * Through DSPy's optimization capabilities.
 */
/**
 * @file Dspy-swarm coordination system.
 */
import type { DSPyProgram } from '../../neural/dspy-wrapper.ts';
import type { DSPyConfig } from '../../neural/types/dspy-types.ts';
import type { AgentType } from '../types.ts';
/**
 * DSPy Agent - Each agent is a DSPy program with specific capabilities.
 *
 * @example
 */
export interface DSPyAgent {
    id: string;
    type: AgentType;
    name: string;
    program: DSPyProgram;
    signature: string;
    capabilities: string[];
    performance: {
        accuracy: number;
        responseTime: number;
        successRate: number;
        learningExamples: number;
    };
    status: 'idle' | 'busy' | 'learning' | 'optimizing';
    lastOptimization: Date;
}
/**
 * Task Assignment for DSPy agents.
 *
 * @example
 */
export interface DSPyTask {
    id: string;
    type: string;
    description: string;
    input: any;
    requiredCapabilities: string[];
    complexity: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    assignedAgent?: string;
    result?: any;
    startTime?: Date;
    endTime?: Date;
    success?: boolean;
}
/**
 * Swarm Topology for DSPy coordination.
 *
 * @example
 */
export interface DSPySwarmTopology {
    type: 'mesh' | 'hierarchical' | 'ring' | 'star';
    agents: DSPyAgent[];
    connections: Array<{
        from: string;
        to: string;
        weight: number;
        messageTypes: string[];
    }>;
    coordinationStrategy: 'parallel' | 'sequential' | 'adaptive';
}
/**
 * Main DSPy Swarm Coordinator.
 *
 * @example
 */
export declare class DSPySwarmCoordinator {
    private dspyWrapper;
    private agents;
    private tasks;
    private topology;
    private coordinationProgram;
    private learningHistory;
    constructor(config?: DSPyConfig & {
        topology?: string;
    });
    /**
     * Initialize the DSPy swarm system.
     *
     * @param config
     */
    initialize(config?: DSPyConfig): Promise<void>;
    /**
     * Create and register specialized DSPy agents.
     */
    private initializeDefaultAgents;
    /**
     * Create a DSPy agent with specific capabilities.
     *
     * @param config
     * @param config.type
     * @param config.name
     * @param config.signature
     * @param config.description
     * @param config.capabilities
     */
    createDSPyAgent(config: {
        type: AgentType;
        name: string;
        signature: string;
        description: string;
        capabilities: string[];
    }): Promise<DSPyAgent>;
    /**
     * Execute a task using the best available DSPy agent.
     *
     * @param task
     */
    executeTask(task: Omit<DSPyTask, 'id'>): Promise<DSPyTask>;
    /**
     * Select optimal agent using DSPy coordination intelligence.
     *
     * @param task
     */
    private selectOptimalAgent;
    /**
     * Fallback agent selection based on capabilities.
     *
     * @param task
     */
    private fallbackAgentSelection;
    /**
     * Execute task with specific DSPy agent.
     *
     * @param task
     * @param agent
     */
    private executeWithAgent;
    /**
     * Record learning example for continuous improvement.
     *
     * @param task
     * @param agent
     * @param result
     * @param success
     */
    private recordLearningExample;
    /**
     * Update agent performance metrics and trigger optimization if needed.
     *
     * @param agent
     * @param task
     * @param success
     */
    private updateAgentPerformance;
    /**
     * Optimize DSPy agent using collected examples.
     *
     * @param agent
     */
    private optimizeAgent;
    /**
     * Update topology connections based on agent performance and task patterns.
     */
    private updateTopologyConnections;
    /**
     * Calculate connection weight between two agents based on collaboration success.
     *
     * @param agent1
     * @param agent2
     */
    private calculateConnectionWeight;
    /**
     * Get swarm status and statistics.
     */
    getSwarmStatus(): {
        agents: Array<{
            id: string;
            name: string;
            type: AgentType;
            status: string;
            performance: any;
            lastOptimization: Date;
        }>;
        topology: DSPySwarmTopology;
        activeTasks: number;
        completedTasks: number;
        learningExamples: number;
        overallPerformance: {
            averageAccuracy: number;
            averageResponseTime: number;
            successRate: number;
        };
    };
    /**
     * Cleanup swarm resources.
     */
    cleanup(): Promise<void>;
}
export default DSPySwarmCoordinator;
//# sourceMappingURL=dspy-swarm-coordinator.d.ts.map