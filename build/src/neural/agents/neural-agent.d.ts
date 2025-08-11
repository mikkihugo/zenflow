/**
 * Neural Agent Module - Integrates ruv-FANN neural network capabilities
 * into agent processing for cognitive diversity and learning.
 */
/**
 * @file Neural network: neural-agent.
 */
import { EventEmitter } from 'node:events';
declare const COGNITIVE_PATTERNS: {
    readonly CONVERGENT: "convergent";
    readonly DIVERGENT: "divergent";
    readonly LATERAL: "lateral";
    readonly SYSTEMS: "systems";
    readonly CRITICAL: "critical";
    readonly ABSTRACT: "abstract";
};
type CognitivePattern = (typeof COGNITIVE_PATTERNS)[keyof typeof COGNITIVE_PATTERNS];
interface CognitiveProfile {
    primary: CognitivePattern;
    secondary: CognitivePattern;
    learningRate: number;
    momentum: number;
    networkLayers: number[];
    activationFunction: 'sigmoid' | 'tanh' | 'relu';
    advancedModel?: string;
}
interface NeuralNetworkConfig extends CognitiveProfile {
    cognitivePattern?: CognitivePattern;
}
interface PerformanceMetrics {
    accuracy: number;
    speed: number;
    creativity: number;
    efficiency: number;
    memoryEfficiency: number;
}
interface CognitiveState {
    attention: number;
    fatigue: number;
    confidence: number;
    exploration: number;
}
interface Task {
    id?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    dependencies?: Array<{
        id: string;
        type: string;
        description?: string;
    }>;
}
interface TaskResult {
    success: boolean;
    metrics?: {
        linesOfCode?: number;
        testsPass?: number;
        timeElapsed?: number;
        memoryUsed?: number;
    };
}
declare const AGENT_COGNITIVE_PROFILES: Record<string, CognitiveProfile>;
/**
 * Neural Network wrapper for agent cognitive processing.
 *
 * @example
 */
declare class NeuralNetwork {
    private config;
    private layers;
    private activationFunction;
    private learningRate;
    private momentum;
    private memoryOptimizer;
    private weights;
    private biases;
    private previousWeightDeltas;
    private memoryAllocations;
    constructor(config: NeuralNetworkConfig, memoryOptimizer?: any);
    private _initializeNetwork;
    private _createMatrix;
    private _createVector;
    private _activation;
    forward(input: number[]): {
        output: number[];
        activations: number[][];
    };
    train(input: number[], target: number[], learningRate?: number): number[];
    save(): {
        config: NeuralNetworkConfig;
        weights: number[][][];
        biases: number[][];
    };
    load(data: {
        weights: number[][][];
        biases: number[][];
    }): void;
}
/**
 * Neural Agent class that enhances base agents with neural network capabilities.
 *
 * @example
 */
declare class NeuralAgent extends EventEmitter {
    private agent;
    private agentType;
    private cognitiveProfile;
    private memoryOptimizer;
    private neuralNetwork;
    private learningHistory;
    private taskHistory;
    private performanceMetrics;
    private cognitiveState;
    private memoryUsage;
    constructor(agent: any, agentType: string, memoryOptimizer?: any);
    /**
     * Process task through neural network for intelligent routing.
     *
     * @param task
     */
    analyzeTask(task: Task): Promise<any>;
    /**
     * Execute task with neural enhancement.
     *
     * @param task
     */
    executeTask(task: Task): Promise<TaskResult>;
    /**
     * Convert task to neural network input vector.
     *
     * @param task
     */
    private _taskToVector;
    /**
     * Apply cognitive pattern to analysis.
     *
     * @param analysis
     */
    private _applyCognitivePattern;
    /**
     * Update cognitive state based on task execution.
     *
     * @param analysis
     */
    private _updateCognitiveState;
    /**
     * Calculate performance metrics.
     *
     * @param _task
     * @param result
     * @param executionTime
     */
    private _calculatePerformance;
    /**
     * Learn from task execution.
     *
     * @param task
     * @param result
     * @param performance
     */
    private _learnFromExecution;
    /**
     * Update overall performance metrics.
     *
     * @param performance
     */
    private _updatePerformanceMetrics;
    /**
     * Find similar tasks from history.
     *
     * @param task
     * @param limit
     */
    private _findSimilarTasks;
    /**
     * Apply secondary cognitive pattern.
     *
     * @param analysis
     * @param pattern
     */
    private _applySecondaryPattern;
    /**
     * Rest the agent to reduce fatigue.
     *
     * @param duration
     */
    rest(duration?: number): Promise<void>;
    /**
     * Initialize memory tracking for the agent.
     */
    private _initializeMemoryTracking;
    /**
     * Get current memory usage for this agent.
     */
    getCurrentMemoryUsage(): number;
    /**
     * Get agent status including neural state.
     */
    getStatus(): any;
    /**
     * Save neural state for persistence.
     */
    saveNeuralState(): any;
    /**
     * Load neural state from saved data.
     *
     * @param data
     */
    loadNeuralState(data: any): void;
}
/**
 * Neural Agent Factory.
 *
 * @example
 */
declare class NeuralAgentFactory {
    private static memoryOptimizer;
    static initializeFactory(): Promise<void>;
    static createNeuralAgent(baseAgent: any, agentType: string): NeuralAgent;
    static getCognitiveProfiles(): Record<string, CognitiveProfile>;
    static getCognitivePatterns(): typeof COGNITIVE_PATTERNS;
}
export { NeuralAgent, NeuralAgentFactory, NeuralNetwork, COGNITIVE_PATTERNS, AGENT_COGNITIVE_PROFILES, type CognitivePattern, type CognitiveProfile, type NeuralNetworkConfig, type PerformanceMetrics, type CognitiveState, type Task, type TaskResult, };
//# sourceMappingURL=neural-agent.d.ts.map