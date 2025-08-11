/**
 * Behavioral Optimization System for Swarm Agent Refinement.
 *
 * Optimizes agent behaviors based on successful patterns, task allocation,
 * communication protocols, resource allocation, and coordination strategies.
 */
/**
 * @file Behavioral-optimization implementation.
 */
import { EventEmitter } from 'node:events';
import type { ExecutionPattern } from './pattern-recognition-engine.ts';
export interface AgentBehavior {
    agentId: string;
    type: string;
    version: string;
    parameters: BehaviorParameters;
    performance: BehaviorPerformance;
    adaptations: Adaptation[];
    lastUpdated: number;
}
export interface BehaviorParameters {
    taskSelection: TaskSelectionParams;
    communication: CommunicationParams;
    resourceManagement: ResourceManagementParams;
    coordination: CoordinationParams;
    learning: LearningParams;
}
export interface TaskSelectionParams {
    preferredComplexity: number;
    riskTolerance: number;
    specialization: string[];
    priorityWeights: Record<string, number>;
    loadBalancing: number;
}
export interface CommunicationParams {
    frequency: number;
    verbosity: number;
    protocols: string[];
    broadcastThreshold: number;
    responseTimeout: number;
}
export interface ResourceManagementParams {
    memoryLimit: number;
    cpuThreshold: number;
    storageQuota: number;
    networkBandwidth: number;
    resourceSharing: boolean;
}
export interface CoordinationParams {
    leadershipStyle: 'democratic' | 'autocratic' | 'laissez_faire';
    consensusThreshold: number;
    conflictResolution: string;
    collaborationLevel: number;
    autonomyLevel: number;
}
export interface LearningParams {
    adaptationRate: number;
    explorationRate: number;
    memoryRetention: number;
    transferLearning: boolean;
    continuousImprovement: boolean;
}
export interface BehaviorPerformance {
    efficiency: number;
    accuracy: number;
    reliability: number;
    collaboration: number;
    adaptability: number;
    resourceUtilization: number;
    taskCompletionRate: number;
    errorRate: number;
    success_rate?: number;
    response_time?: number;
    collaboration_score?: number;
}
export interface Adaptation {
    id: string;
    timestamp: number;
    type: 'parameter_adjustment' | 'strategy_change' | 'skill_acquisition' | 'optimization';
    description: string;
    parameters: Record<string, any>;
    impact: AdaptationImpact;
    success: boolean;
    originalPerformance?: BehaviorPerformance;
    newPerformance?: BehaviorPerformance;
}
export interface AdaptationImpact {
    performanceChange: number;
    efficiencyGain: number;
    stabilityEffect: number;
    collaborationImprovement: number;
}
export interface OptimizationStrategy {
    id: string;
    name: string;
    type: 'genetic' | 'gradient_descent' | 'simulated_annealing' | 'bayesian' | 'reinforcement';
    objective: string;
    constraints: Record<string, any>;
    parameters: Record<string, any>;
}
export interface OptimizationResult {
    strategyId: string;
    agentId: string;
    originalBehavior: AgentBehavior;
    optimizedBehavior: AgentBehavior;
    improvement: number;
    convergenceTime: number;
    iterations: number;
}
export interface BehaviorCluster {
    id: string;
    behaviors: AgentBehavior[];
    centroid: AgentBehavior;
    characteristics: string[];
    performance: number;
    stability: number;
}
export declare class BehavioralOptimization extends EventEmitter {
    private agentBehaviors;
    private optimizationStrategies;
    private behaviorClusters;
    private optimizationHistory;
    private config;
    constructor(config?: BehavioralOptimizationConfig);
    /**
     * Register an agent's behavior for optimization.
     *
     * @param agentId
     * @param initialBehavior
     */
    registerAgentBehavior(agentId: string, initialBehavior?: Partial<BehaviorParameters>): string;
    /**
     * Optimize agent behavior based on execution patterns.
     *
     * @param agentId
     * @param patterns
     * @param strategy
     */
    optimizeAgentBehavior(agentId: string, patterns: ExecutionPattern[], strategy?: string): Promise<OptimizationResult>;
    /**
     * Refine task allocation based on successful patterns.
     *
     * @param swarmId
     * @param patterns
     */
    refineTaskAllocation(swarmId: string, patterns: ExecutionPattern[]): Promise<TaskAllocationStrategy>;
    /**
     * Optimize communication protocols based on patterns.
     *
     * @param swarmId
     * @param patterns
     */
    optimizeCommunicationProtocols(swarmId: string, patterns: ExecutionPattern[]): Promise<CommunicationOptimization>;
    /**
     * Optimize resource allocation based on usage patterns.
     *
     * @param patterns
     */
    optimizeResourceAllocation(patterns: ExecutionPattern[]): Promise<ResourceAllocationStrategy>;
    /**
     * Adapt coordination strategies based on swarm performance.
     *
     * @param swarmId
     * @param patterns
     */
    adaptCoordinationStrategies(swarmId: string, patterns: ExecutionPattern[]): Promise<CoordinationStrategy>;
    /**
     * Cluster behaviors for pattern analysis.
     */
    clusterBehaviors(): BehaviorCluster[];
    /**
     * Get optimization recommendations.
     */
    getOptimizationRecommendations(): OptimizationRecommendation[];
    /**
     * Apply behavior adaptation based on feedback.
     *
     * @param agentId
     * @param adaptationType
     * @param parameters
     */
    applyBehaviorAdaptation(agentId: string, adaptationType: string, parameters: Record<string, any>): Promise<void>;
    private geneticOptimization;
    private gradientDescentOptimization;
    private simulatedAnnealingOptimization;
    private bayesianOptimization;
    private reinforcementOptimization;
    private createPopulation;
    private generateRandomBehavior;
    private evaluateFitness;
    private calculateExtremePenalty;
    private selectParents;
    private crossover;
    private createChild;
    private mutate;
    private selectSurvivors;
    private calculateGradients;
    private applyGradients;
    private generateNeighbor;
    private selectNextCandidate;
    private calculateUncertainty;
    private calculateExpectedImprovement;
    private behaviorToState;
    private generatePossibleActions;
    private selectAction;
    private applyAction;
    private getMaxQValue;
    private createDefaultBehaviorParameters;
    private createDefaultPerformance;
    private recordAdaptation;
    private calculateImprovement;
    private calculateOverallPerformance;
    private extractAgentCriteria;
    private extractRequiredSkills;
    private extractResourceConstraints;
    private calculateOptimalFrequencies;
    private classifyMessageTypes;
    private determineOptimalTopology;
    private calculateOptimalSyncFrequency;
    private getMostFrequent;
    private createBehaviorCluster;
    private calculateBehaviorSimilarity;
    private calculateBehaviorDistance;
    private calculateBehaviorCentroid;
    private calculateClusterStability;
    private extractClusterCharacteristics;
    private getNestedProperty;
    private setNestedProperty;
    private clampBehaviorParameters;
    private initializeOptimizationStrategies;
    private startContinuousOptimization;
    private performBatchOptimization;
    getAgentBehavior(agentId: string): AgentBehavior | undefined;
    getAllBehaviors(): AgentBehavior[];
    getBehaviorClusters(): BehaviorCluster[];
    getOptimizationHistory(): OptimizationResult[];
    getOptimizationStrategies(): OptimizationStrategy[];
}
interface BehavioralOptimizationConfig {
    optimizationInterval?: number;
    maxBehaviors?: number;
    convergenceThreshold?: number;
    maxIterations?: number;
    mutationRate?: number;
    crossoverRate?: number;
    populationSize?: number;
    elitismRate?: number;
}
interface TaskAllocationStrategy {
    id: string;
    swarmId: string;
    rules: AllocationRule[];
    weightings: Record<string, number>;
    constraints: Record<string, any>;
    performance: number;
}
interface AllocationRule {
    condition: string;
    action: string;
    priority: number;
    agentCriteria: Record<string, any>;
}
interface CommunicationOptimization {
    swarmId: string;
    protocols: string[];
    frequencies: Record<string, number>;
    messageTypes: Record<string, any>;
    networkTopology: string;
    latencyTargets: Record<string, number>;
    throughputTargets: Record<string, number>;
}
interface ResourceAllocationStrategy {
    id: string;
    allocations: Record<string, number>;
    thresholds: Record<string, any>;
    scalingRules: ScalingRule[];
    priorities: Record<string, number>;
    constraints: Record<string, any>;
}
interface ScalingRule {
    resource: string;
    condition: string;
    action: string;
    factor: number;
}
interface CoordinationStrategy {
    swarmId: string;
    leadershipModel: string;
    decisionMaking: string;
    conflictResolution: string;
    synchronization: Record<string, any>;
    coordination: Record<string, any>;
    adaptation: Record<string, any>;
}
interface OptimizationRecommendation {
    type: string;
    agentId: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    suggestedStrategy: string;
    expectedImprovement: number;
}
export default BehavioralOptimization;
//# sourceMappingURL=behavioral-optimization.d.ts.map