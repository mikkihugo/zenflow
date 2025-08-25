/**
 * @fileoverview Behavioral Intelligence for Claude Code Zen
 *
 * Focused agent behavioral intelligence using brain.js neural networks.
 * Provides real-time agent behavior learning, performance prediction,
 * and behavioral optimization for the claude-code-zen swarm system.
 *
 * SCOPE: Agent behavior ONLY - not general ML or generic learning
 *
 * Key Features:
 * - Agent performance prediction using neural networks
 * - Real-time behavioral pattern learning
 * - Task complexity estimation for better routing
 * - Agent-task matching optimization
 * - Behavioral anomaly detection
 *
 * Integration with claude-code-zen:
 * - Load balancing: Agent performance predictions
 * - Task orchestration: Complexity estimation and routing
 * - Agent monitoring: Behavioral health and adaptation
 * - Swarm coordination: Intelligent agent selection
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import type { BrainJsBridge } from './brain-js-bridge';
/**
 * Agent execution data for behavioral learning
 */
export interface AgentExecutionData {
  readonly agentId: string;
  readonly taskType: string;
  readonly taskComplexity: number;
  readonly duration: number;
  readonly success: boolean;
  readonly efficiency: number;
  readonly resourceUsage: number;
  readonly errorCount: number;
  readonly timestamp: number;
  readonly context: Record<string, unknown>;
}
/**
 * Behavioral prediction result
 */
export interface BehavioralPrediction {
  readonly agentId: string;
  readonly taskType: string;
  readonly predictedDuration: number;
  readonly predictedSuccess: number;
  readonly predictedEfficiency: number;
  readonly confidence: number;
  readonly reasoning: string;
}
/**
 * Task complexity analysis
 */
export interface TaskComplexityAnalysis {
  readonly taskType: string;
  readonly estimatedComplexity: number;
  readonly requiredSkills: string[];
  readonly estimatedDuration: number;
  readonly difficulty: 'easy|medium|hard|expert;
  readonly confidence: number;
}
/**
 * Agent behavioral profile
 */
export interface AgentBehavioralProfile {
  readonly agentId: string;
  readonly specializations: string[];
  readonly averagePerformance: number;
  readonly consistencyScore: number;
  readonly learningRate: number;
  readonly adaptabilityScore: number;
  readonly preferredTaskTypes: string[];
  readonly lastUpdated: number;
}
/**
 * Behavioral Intelligence System
 *
 * Focused behavioral intelligence for claude-code-zen agents using brain.js.
 * Learns how individual agents behave and provides predictions for optimal
 * task assignment and swarm coordination.
 *
 * @example Basic Usage
 * ```typescript`
 * const behavioral = new BehavioralIntelligence(brainJsBridge);
 * await behavioral.initialize();
 *
 * // Learn from agent execution
 * const executionData = {
 *   agentId: 'agent-1',
 *   taskType: 'data-processing',
 *   taskComplexity: 0.7,
 *   duration: 1500,
 *   success: true,
 *   efficiency: 0.85
 * };
 *
 * await behavioral.learnFromExecution(executionData);
 *
 * // Predict agent performance
 * const prediction = await behavioral.predictAgentPerformance('agent-1', 'data-processing', 0.7);'
 * console.log(`Predicted efficiency: ${prediction.predictedEfficiency}`);`
 * ````
 */
export declare class BehavioralIntelligence {
  private brainJsBridge;
  private performanceNetworkId;
  private complexityNetworkId;
  private matchingNetworkId;
  private initialized;
  private agentProfiles;
  private trainingBuffer;
  private readonly bufferSize;
  private behaviorClusterer?;
  private kmeansClusterer?;
  private performanceTimeSeries;
  private agentPerformanceHistory;
  private agentFeatureVectors;
  constructor(brainJsBridge?: BrainJsBridge);
  /**
   * Create a mock BrainJsBridge for compatibility when no bridge is provided
   */
  private createMockBridge;
  /**
   * Initialize behavioral intelligence networks with enhanced ML algorithms
   */
  initialize(): Promise<void>;
  /**
   * Learn from agent execution data using enhanced ML algorithms
   *
   * @param executionData - Data from agent task execution
   */
  learnFromExecution(executionData: AgentExecutionData): Promise<void>;
  /**
   * Predict agent performance for a specific task
   *
   * @param agentId - ID of the agent
   * @param taskType - Type of task
   * @param taskComplexity - Complexity of the task (0-1)
   * @returns Behavioral prediction
   */
  predictAgentPerformance(
    agentId: string,
    taskType: string,
    taskComplexity: number
  ): Promise<BehavioralPrediction>;
  /**
   * Analyze task complexity
   *
   * @param taskType - Type of task to analyze
   * @param context - Additional context about the task
   * @returns Task complexity analysis
   */
  analyzeTaskComplexity(
    taskType: string,
    context?: Record<string, unknown>
  ): Promise<TaskComplexityAnalysis>;
  /**
   * Find the best agent for a task
   *
   * @param taskType - Type of task
   * @param taskComplexity - Complexity of the task
   * @param availableAgents - List of available agent IDs
   * @returns Best agent ID and confidence score
   */
  findBestAgentForTask(
    taskType: string,
    taskComplexity: number,
    availableAgents: string[]
  ): Promise<{
    agentId: string;
    confidence: number;
    reasoning: string;
  }>;
  /**
   * Get agent behavioral profile
   *
   * @param agentId - ID of the agent
   * @returns Agent behavioral profile or null if not found
   */
  getAgentProfile(agentId: string): AgentBehavioralProfile|null;
  /**
   * Get all agent profiles
   *
   * @returns Map of all agent profiles
   */
  getAllAgentProfiles(): Map<string, AgentBehavioralProfile>;
  /**
   * Get behavioral intelligence statistics
   */
  getStats(): {
    totalAgents: number;
    trainingDataPoints: number;
    networksInitialized: boolean;
    averagePerformance: number;
    mostActiveAgents: string[];
  };
  /**
   * Update agent performance time series using moving averages
   */
  private updateAgentPerformanceTimeSeries;
  /**
   * Update agent feature vector for Random Forest classification
   */
  private updateAgentFeatureVector;
  /**
   * Train advanced ML models (Random Forest and DBSCAN)
   */
  private trainAdvancedMLModels;
  /**
   * Convert numeric agent type to string label
   */
  private getAgentTypeLabel;
  /**
   * Classify agent type based on historical performance
   */
  private classifyAgentType;
  /**
   * Get agent behavioral clusters using DBSCAN
   */
  getAgentBehavioralClusters(): Promise<Map<number, string[]>>;
  /**
   * Predict agent performance trend using time series analysis
   */
  predictPerformanceTrend(agentId: string): Promise<{
    trend:'improving' | 'stable' | 'declining'|'improving' | 'stable' | 'declining'|declining;
    confidence: number;
    forecast: number[];
  }>;
  /**
   * Enable continuous learning with configuration
   */
  enableContinuousLearning(config: {
    learningRate?: number;
    adaptationThreshold?: number;
    evaluationInterval?: number;
    maxMemorySize?: number;
  }): Promise<void>;
  /**
   * Record behavior data for learning
   */
  recordBehavior(data: {
    agentId: string;
    behaviorType: string;
    context: Record<string, unknown>;
    timestamp: number;
    success: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
  /**
   * Infer complexity from context data
   */
  private inferComplexityFromContext;
  /**
   * Get enhanced behavioral statistics with ML insights
   */
  getEnhancedStats(): {
    totalAgents: number;
    trainingDataPoints: number;
    networksInitialized: boolean;
    averagePerformance: number;
    mostActiveAgents: string[];
    behavioralClusters: number;
    mlModelsActive: string[];
    performanceTrends: Record<string, string>;
  };
  private updateAgentProfile;
  private trainNetworksFromBuffer;
  private preparePerformanceInput;
  private prepareComplexityInput;
  private encodeTaskType;
  private encodeContextComplexity;
  private hasComplexOperations;
  private requiresSpecialization;
  private calculateAgentExperience;
  private normalizeDuration;
  private denormalizeDuration;
  private calculatePredictionConfidence;
  private generatePredictionReasoning;
  private inferRequiredSkills;
  private estimateDurationFromComplexity;
  private mapComplexityToDifficulty;
  /**
   * Analyze label distribution across clusters for behavioral insights
   */
  private analyzeLabelDistribution;
}
/**
 * Demo function showing behavioral intelligence benefits
 */
export declare function demoBehavioralIntelligence(
  brainJsBridge: BrainJsBridge
): Promise<void>;
//# sourceMappingURL=behavioral-intelligence.d.ts.map
