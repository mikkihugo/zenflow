/**
 * @fileoverview Agent Learning System for Dynamic Performance Optimization
 *
 * Comprehensive learning system that tracks agent success rates, adapts learning rates,
 * and optimizes performance based on success patterns. Integrates with the existing
 * coordination system and ruv-swarm neural capabilities.
 *
 * Key Features:
 * - Dynamic learning rate adaptation based on success patterns
 * - Performance history tracking with trend analysis
 * - Success rate optimization algorithms
 * - Integration with ZenSwarmStrategy neural capabilities
 * - Comprehensive logging and metrics
 *
 * @author Claude Code Zen Team - Learning System Developer Agent
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 *
 * @requires ../types.ts - Core coordination types
 * @requires ../../intelligence/adaptive-learning/types.ts - Learning system types
 * @requires ../../config/logging-config.ts - Logging configuration
 *
 * @example
 * ```typescript
 * const learningSystem = new AgentLearningSystem({
 *   baseLearningRate: 0.1,
 *   adaptationThreshold: 0.8,
 *   performanceWindowSize: 100
 * });
 *
 * // Track agent performance
 * learningSystem.updateAgentPerformance('agent-1', true);
 *
 * // Get optimized learning rate
 * const learningRate = learningSystem.getOptimalLearningRate('agent-1');
 * ```
 */

import { getLogger } from '../../config/logging-config';
import type { AgentId, AgentMetrics } from '../types';
import type {
  LearningProgress,
  PerformanceMetrics,
  Pattern,
  ExecutionData,
  PerformanceImprovement,
} from '../../lib/adaptive-learning/types';

const logger = getLogger('coordination-intelligence-agent-learning-system');

/**
 * Configuration interface for the Agent Learning System
 */
export interface AgentLearningConfig {
  /** Base learning rate for new agents */
  baseLearningRate: number;
  /** Minimum learning rate threshold */
  minLearningRate: number;
  /** Maximum learning rate threshold */
  maxLearningRate: number;
  /** Success rate threshold for adaptation */
  adaptationThreshold: number;
  /** Number of recent performances to consider */
  performanceWindowSize: number;
  /** Enable dynamic adaptation based on trends */
  enableDynamicAdaptation: boolean;
  /** Enable neural pattern recognition */
  enableNeuralAnalysis: boolean;
  /** Persistence interval in milliseconds */
  persistenceInterval: number;
}

/**
 * Agent performance history entry
 */
export interface PerformanceEntry {
  timestamp: number;
  success: boolean;
  duration?: number;
  quality?: number;
  resourceUsage?: number;
  taskType?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Agent learning state
 */
export interface AgentLearningState {
  agentId: AgentId;
  currentLearningRate: number;
  successHistory: PerformanceEntry[];
  currentSuccessRate: number;
  totalTasks: number;
  successfulTasks: number;
  averagePerformance: number;
  learningTrend: 'improving' | 'stable' | 'declining';
  lastUpdated: number;
  performanceMetrics: PerformanceMetrics;
  adaptationHistory: AdaptationEntry[];
}

/**
 * Learning rate adaptation entry
 */
export interface AdaptationEntry {
  timestamp: number;
  previousRate: number;
  newRate: number;
  reason: string;
  successRateAtTime: number;
  confidenceScore: number;
}

/**
 * Success pattern analysis result
 */
export interface SuccessPatternAnalysis {
  patterns: Pattern[];
  optimalLearningRate: number;
  confidenceScore: number;
  recommendations: string[];
  predictedPerformance: number;
}

/**
 * Agent Learning System - Dynamic Performance Optimization
 *
 * This system tracks agent performance over time and dynamically adapts learning rates
 * to optimize success rates. It uses pattern recognition to identify optimal learning
 * strategies for different agent types and task contexts.
 *
 * The system integrates with the existing coordination framework and provides:
 * - Real-time performance tracking
 * - Dynamic learning rate adaptation
 * - Success pattern recognition
 * - Performance trend analysis
 * - Neural-enhanced optimization
 */
export class AgentLearningSystem {
  private learningRates = new Map<AgentId, number>();
  private successHistory = new Map<AgentId, PerformanceEntry[]>();
  private agentStates = new Map<AgentId, AgentLearningState>();
  private config: AgentLearningConfig;
  private adaptationAlgorithms: Map<
    string,
    (state: AgentLearningState) => number
  >;
  private persistenceTimer?: NodeJS.Timeout;

  constructor(config: Partial<AgentLearningConfig> = {}) {
    this.config = {
      baseLearningRate: 0.1,
      minLearningRate: 0.01,
      maxLearningRate: 0.5,
      adaptationThreshold: 0.75,
      performanceWindowSize: 50,
      enableDynamicAdaptation: true,
      enableNeuralAnalysis: true,
      persistenceInterval: 30000, // 30 seconds
      ...config,
    };

    logger.info('🧠 Initializing Agent Learning System', {
      config: this.config,
      timestamp: Date.now(),
    });

    this.initializeAdaptationAlgorithms();
    this.startPersistenceTimer();

    logger.info('✅ Agent Learning System initialized successfully');
  }

  /**
   * Initialize adaptation algorithms for different learning strategies
   */
  private initializeAdaptationAlgorithms(): void {
    this.adaptationAlgorithms = new Map([
      ['gradient-based', this.gradientBasedAdaptation.bind(this)],
      ['success-rate-based', this.successRateBasedAdaptation.bind(this)],
      ['trend-following', this.trendFollowingAdaptation.bind(this)],
      ['neural-optimized', this.neuralOptimizedAdaptation.bind(this)],
      ['hybrid-adaptive', this.hybridAdaptiveStrategy.bind(this)],
    ]);

    logger.debug('🔧 Adaptation algorithms initialized', {
      algorithms: Array.from(this.adaptationAlgorithms.keys()),
    });
  }

  /**
   * Update agent performance and adapt learning rate
   *
   * @param agentId - The ID of the agent
   * @param success - Whether the task was successful
   * @param metadata - Additional performance metadata
   */
  public updateAgentPerformance(
    agentId: AgentId,
    success: boolean,
    metadata: {
      duration?: number;
      quality?: number;
      resourceUsage?: number;
      taskType?: string;
      [key: string]: unknown;
    } = {}
  ): void {
    logger.debug(`📊 Updating performance for agent ${agentId}`, {
      success,
      metadata,
      timestamp: Date.now(),
    });

    // Get or create agent state
    const state = this.getOrCreateAgentState(agentId);

    // Create performance entry
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      success,
      duration: metadata.duration,
      quality: metadata.quality,
      resourceUsage: metadata.resourceUsage,
      taskType: metadata.taskType,
      metadata,
    };

    // Update history
    state.successHistory.push(entry);

    // Maintain window size
    if (state.successHistory.length > this.config.performanceWindowSize) {
      state.successHistory.shift();
    }

    // Update metrics
    this.updateAgentMetrics(state);

    // Adapt learning rate if enabled
    if (this.config.enableDynamicAdaptation) {
      this.adaptLearningRate(agentId, state);
    }

    // Update state
    state.lastUpdated = Date.now();
    this.agentStates.set(agentId, state);

    logger.debug(`✅ Performance updated for agent ${agentId}`, {
      successRate: state.currentSuccessRate,
      learningRate: state.currentLearningRate,
      trend: state.learningTrend,
    });
  }

  /**
   * Get optimal learning rate for an agent
   *
   * @param agentId - The ID of the agent
   * @returns The optimal learning rate
   */
  public getOptimalLearningRate(agentId: AgentId): number {
    const state = this.agentStates.get(agentId);

    if (!state) {
      logger.warn(
        `⚠️ No learning state found for agent ${agentId}, using base rate`
      );
      return this.config.baseLearningRate;
    }

    logger.debug(`🎯 Getting optimal learning rate for agent ${agentId}`, {
      currentRate: state.currentLearningRate,
      successRate: state.currentSuccessRate,
      trend: state.learningTrend,
    });

    return state.currentLearningRate;
  }

  /**
   * Analyze success patterns for an agent
   *
   * @param agentId - The ID of the agent
   * @returns Success pattern analysis
   */
  public analyzeSuccessPatterns(agentId: AgentId): SuccessPatternAnalysis {
    const state = this.agentStates.get(agentId);

    if (!state || state.successHistory.length < 10) {
      logger.warn(`⚠️ Insufficient data for pattern analysis: agent ${agentId}`);
      return {
        patterns: [],
        optimalLearningRate: this.config.baseLearningRate,
        confidenceScore: 0.1,
        recommendations: ['Collect more performance data'],
        predictedPerformance: 0.5,
      };
    }

    logger.debug(`🔍 Analyzing success patterns for agent ${agentId}`);

    // Analyze task type patterns
    const taskTypePatterns = this.analyzeTaskTypePatterns(state.successHistory);

    // Analyze temporal patterns
    const temporalPatterns = this.analyzeTemporalPatterns(state.successHistory);

    // Analyze resource usage patterns
    const resourcePatterns = this.analyzeResourcePatterns(state.successHistory);

    // Calculate optimal learning rate based on patterns
    const optimalRate = this.calculateOptimalLearningRate(state, [
      ...taskTypePatterns,
      ...temporalPatterns,
      ...resourcePatterns,
    ]);

    // Generate recommendations
    const recommendations = this.generateRecommendations(state, optimalRate);

    // Predict future performance
    const predictedPerformance = this.predictPerformance(state, optimalRate);

    const analysis: SuccessPatternAnalysis = {
      patterns: [...taskTypePatterns, ...temporalPatterns, ...resourcePatterns],
      optimalLearningRate: optimalRate,
      confidenceScore: this.calculateConfidenceScore(state),
      recommendations,
      predictedPerformance,
    };

    logger.info(`📈 Success pattern analysis completed for agent ${agentId}`, {
      patternsFound: analysis.patterns.length,
      optimalRate: analysis.optimalLearningRate,
      confidence: analysis.confidenceScore,
      predicted: analysis.predictedPerformance,
    });

    return analysis;
  }

  /**
   * Get performance summary for an agent
   *
   * @param agentId - The ID of the agent
   * @returns Performance summary
   */
  public getPerformanceSummary(agentId: AgentId): AgentLearningState | null {
    const state = this.agentStates.get(agentId);

    if (!state) {
      logger.warn(`⚠️ No performance data found for agent ${agentId}`);
      return null;
    }

    logger.debug(`📋 Getting performance summary for agent ${agentId}`);
    return { ...state }; // Return a copy
  }

  /**
   * Get performance improvement suggestions
   *
   * @param agentId - The ID of the agent
   * @returns Array of performance improvements
   */
  public getPerformanceImprovements(
    agentId: AgentId
  ): PerformanceImprovement[] {
    const state = this.agentStates.get(agentId);

    if (!state) {
      logger.warn(`⚠️ No performance data for improvements: agent ${agentId}`);
      return [];
    }

    const improvements: PerformanceImprovement[] = [];

    // Learning rate optimization
    if (state.currentSuccessRate < this.config.adaptationThreshold) {
      improvements.push({
        metric: 'learning_rate',
        baseline: state.currentLearningRate,
        improved: this.config.baseLearningRate * 1.2,
        improvement: 20,
        confidence: 0.8,
        sustainability: 0.7,
      });
    }

    // Success rate improvement
    if (state.learningTrend === 'declining') {
      improvements.push({
        metric: 'success_rate',
        baseline: state.currentSuccessRate,
        improved: state.currentSuccessRate * 1.15,
        improvement: 15,
        confidence: 0.7,
        sustainability: 0.8,
      });
    }

    // Performance consistency
    if (this.calculatePerformanceVariance(state) > 0.3) {
      improvements.push({
        metric: 'consistency',
        baseline: 1 - this.calculatePerformanceVariance(state),
        improved: 0.9,
        improvement: 25,
        confidence: 0.75,
        sustainability: 0.85,
      });
    }

    logger.debug(
      `💡 Generated ${improvements.length} improvement suggestions for agent ${agentId}`
    );
    return improvements;
  }

  /**
   * Reset learning state for an agent
   *
   * @param agentId - The ID of the agent
   */
  public resetAgentLearning(agentId: AgentId): void {
    logger.info(`🔄 Resetting learning state for agent ${agentId}`);

    this.agentStates.delete(agentId);
    this.learningRates.delete(agentId);
    this.successHistory.delete(agentId);

    logger.info(`✅ Learning state reset completed for agent ${agentId}`);
  }

  /**
   * Get or create agent learning state
   */
  private getOrCreateAgentState(agentId: AgentId): AgentLearningState {
    let state = this.agentStates.get(agentId);

    if (!state) {
      state = {
        agentId,
        currentLearningRate: this.config.baseLearningRate,
        successHistory: [],
        currentSuccessRate: 0,
        totalTasks: 0,
        successfulTasks: 0,
        averagePerformance: 0,
        learningTrend: 'stable',
        lastUpdated: Date.now(),
        performanceMetrics: {
          throughput: 0,
          latency: 0,
          errorRate: 0,
          resourceUtilization: {
            cpu: 0,
            memory: 0,
            network: 0,
            diskIO: 0,
            bandwidth: 0,
            latency: 0,
          },
          efficiency: 0,
          quality: 0,
        },
        adaptationHistory: [],
      };

      this.agentStates.set(agentId, state);
      this.learningRates.set(agentId, this.config.baseLearningRate);
      this.successHistory.set(agentId, []);

      logger.debug(`🆕 Created new learning state for agent ${agentId}`);
    }

    return state;
  }

  /**
   * Update agent metrics based on performance history
   */
  private updateAgentMetrics(state: AgentLearningState): void {
    const history = state.successHistory;

    if (history.length === 0) return;

    // Calculate success rate
    const successfulTasks = history.filter((entry) => entry.success).length;
    state.currentSuccessRate = successfulTasks / history.length;
    state.successfulTasks = successfulTasks;
    state.totalTasks = history.length;

    // Calculate average performance
    const qualityScores = history
      .filter((entry) => entry.quality !== undefined)
      .map((entry) => entry.quality!);

    if (qualityScores.length > 0) {
      state.averagePerformance =
        qualityScores.reduce((sum, score) => sum + score, 0) /
        qualityScores.length;
    }

    // Determine learning trend
    if (history.length >= 10) {
      const recentHistory = history.slice(-10);
      const olderHistory = history.slice(-20, -10);

      if (olderHistory.length > 0) {
        const recentSuccessRate =
          recentHistory.filter((e) => e.success).length / recentHistory.length;
        const olderSuccessRate =
          olderHistory.filter((e) => e.success).length / olderHistory.length;

        if (recentSuccessRate > olderSuccessRate + 0.1) {
          state.learningTrend = 'improving';
        } else if (recentSuccessRate < olderSuccessRate - 0.1) {
          state.learningTrend = 'declining';
        } else {
          state.learningTrend = 'stable';
        }
      }
    }

    // Update performance metrics
    this.updatePerformanceMetrics(state);
  }

  /**
   * Update detailed performance metrics
   */
  private updatePerformanceMetrics(state: AgentLearningState): void {
    const history = state.successHistory;

    if (history.length === 0) return;

    // Calculate throughput (tasks per minute)
    const timeSpan = Date.now() - history[0].timestamp;
    state.performanceMetrics.throughput = (history.length / timeSpan) * 60000;

    // Calculate average latency
    const durations = history
      .filter((entry) => entry.duration !== undefined)
      .map((entry) => entry.duration!);

    if (durations.length > 0) {
      state.performanceMetrics.latency =
        durations.reduce((sum, duration) => sum + duration, 0) /
        durations.length;
    }

    // Calculate error rate
    const errors = history.filter((entry) => !entry.success).length;
    state.performanceMetrics.errorRate = errors / history.length;

    // Calculate efficiency
    state.performanceMetrics.efficiency =
      state.currentSuccessRate * (1 - state.performanceMetrics.errorRate);

    // Calculate quality
    state.performanceMetrics.quality = state.averagePerformance;
  }

  /**
   * Adapt learning rate based on agent performance
   */
  private adaptLearningRate(agentId: AgentId, state: AgentLearningState): void {
    const previousRate = state.currentLearningRate;

    // Use hybrid adaptive strategy by default
    const newRate = this.hybridAdaptiveStrategy(state);

    // Ensure rate is within bounds
    const boundedRate = Math.max(
      this.config.minLearningRate,
      Math.min(this.config.maxLearningRate, newRate)
    );

    if (Math.abs(boundedRate - previousRate) > 0.001) {
      state.currentLearningRate = boundedRate;
      this.learningRates.set(agentId, boundedRate);

      // Record adaptation
      const adaptation: AdaptationEntry = {
        timestamp: Date.now(),
        previousRate,
        newRate: boundedRate,
        reason: 'hybrid-adaptive-strategy',
        successRateAtTime: state.currentSuccessRate,
        confidenceScore: this.calculateConfidenceScore(state),
      };

      state.adaptationHistory.push(adaptation);

      // Keep adaptation history manageable
      if (state.adaptationHistory.length > 20) {
        state.adaptationHistory.shift();
      }

      logger.debug(`🎯 Learning rate adapted for agent ${agentId}`, {
        previousRate,
        newRate: boundedRate,
        successRate: state.currentSuccessRate,
        trend: state.learningTrend,
      });
    }
  }

  /**
   * Gradient-based adaptation algorithm
   */
  private gradientBasedAdaptation(state: AgentLearningState): number {
    const successRate = state.currentSuccessRate;
    const target = this.config.adaptationThreshold;
    const gradient = successRate - target;

    // Adjust learning rate based on gradient
    const adjustment = gradient * 0.1; // Learning rate for the learning rate
    return state.currentLearningRate + adjustment;
  }

  /**
   * Success rate based adaptation algorithm
   */
  private successRateBasedAdaptation(state: AgentLearningState): number {
    const successRate = state.currentSuccessRate;

    if (successRate < 0.5) {
      return state.currentLearningRate * 0.8; // Reduce learning rate
    } else if (successRate > 0.8) {
      return state.currentLearningRate * 1.1; // Increase learning rate
    }

    return state.currentLearningRate; // Keep current rate
  }

  /**
   * Trend following adaptation algorithm
   */
  private trendFollowingAdaptation(state: AgentLearningState): number {
    switch (state.learningTrend) {
      case 'improving':
        return state.currentLearningRate * 1.05;
      case 'declining':
        return state.currentLearningRate * 0.95;
      default:
        return state.currentLearningRate;
    }
  }

  /**
   * Neural optimized adaptation algorithm
   */
  private neuralOptimizedAdaptation(state: AgentLearningState): number {
    // Simple neural-inspired approach
    const inputs = [
      state.currentSuccessRate,
      state.averagePerformance,
      state.performanceMetrics.efficiency,
      state.totalTasks / 100, // Normalized experience
    ];

    // Simple weighted combination (could be replaced with actual neural network)
    const weights = [0.4, 0.2, 0.3, 0.1];
    const output = inputs.reduce(
      (sum, input, index) => sum + input * weights[index],
      0
    );

    return this.config.baseLearningRate * output;
  }

  /**
   * Hybrid adaptive strategy combining multiple algorithms
   */
  private hybridAdaptiveStrategy(state: AgentLearningState): number {
    const algorithms = [
      { name: 'gradient', weight: 0.3, fn: this.gradientBasedAdaptation },
      {
        name: 'success-rate',
        weight: 0.25,
        fn: this.successRateBasedAdaptation,
      },
      { name: 'trend', weight: 0.25, fn: this.trendFollowingAdaptation },
      { name: 'neural', weight: 0.2, fn: this.neuralOptimizedAdaptation },
    ];

    let weightedSum = 0;
    let totalWeight = 0;

    for (const algorithm of algorithms) {
      try {
        const rate = algorithm.fn.call(this, state);
        weightedSum += rate * algorithm.weight;
        totalWeight += algorithm.weight;
      } catch (error) {
        logger.warn(`⚠️ Algorithm ${algorithm.name} failed`, error);
      }
    }

    return totalWeight > 0
      ? weightedSum / totalWeight
      : state.currentLearningRate;
  }

  /**
   * Analyze task type patterns in performance history
   */
  private analyzeTaskTypePatterns(history: PerformanceEntry[]): Pattern[] {
    const taskTypeGroups = new Map<string, PerformanceEntry[]>();

    // Group by task type
    for (const entry of history) {
      if (entry.taskType) {
        const group = taskTypeGroups.get(entry.taskType) || [];
        group.push(entry);
        taskTypeGroups.set(entry.taskType, group);
      }
    }

    const patterns: Pattern[] = [];

    // Analyze each task type group
    for (const [taskType, entries] of taskTypeGroups) {
      if (entries.length >= 3) {
        const successRate =
          entries.filter((e) => e.success).length / entries.length;

        patterns.push({
          id: `task-type-${taskType}`,
          type: 'task_completion',
          data: {
            taskType,
            successRate,
            count: entries.length,
            averageDuration:
              entries.reduce((sum, e) => sum + (e.duration || 0), 0) /
              entries.length,
          },
          confidence: Math.min(entries.length / 10, 1), // More data = higher confidence
          frequency: entries.length / history.length,
          context: { type: 'task_type_analysis' },
          metadata: {
            complexity: 1 - successRate,
            predictability: successRate,
            stability: this.calculateVariance(
              entries.map((e) => (e.success ? 1 : 0))
            ),
            anomalyScore: Math.abs(successRate - 0.5),
            correlations: [],
            quality: successRate,
            relevance: entries.length / history.length,
          },
          timestamp: Date.now(),
        });
      }
    }

    return patterns;
  }

  /**
   * Analyze temporal patterns in performance history
   */
  private analyzeTemporalPatterns(history: PerformanceEntry[]): Pattern[] {
    const patterns: Pattern[] = [];

    if (history.length < 10) return patterns;

    // Analyze performance over time windows
    const windowSize = Math.min(10, Math.floor(history.length / 3));
    const windows: PerformanceEntry[][] = [];

    for (let i = 0; i < history.length; i += windowSize) {
      windows.push(history.slice(i, i + windowSize));
    }

    if (windows.length >= 3) {
      const windowSuccessRates = windows.map(
        (window) => window.filter((e) => e.success).length / window.length
      );

      // Check for trending patterns
      let trend = 'stable';
      if (windowSuccessRates.length >= 3) {
        const firstHalf = windowSuccessRates.slice(
          0,
          Math.floor(windowSuccessRates.length / 2)
        );
        const secondHalf = windowSuccessRates.slice(
          Math.floor(windowSuccessRates.length / 2)
        );

        const firstAvg =
          firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
        const secondAvg =
          secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;

        if (secondAvg > firstAvg + 0.1) trend = 'improving';
        else if (secondAvg < firstAvg - 0.1) trend = 'declining';
      }

      patterns.push({
        id: 'temporal-trend',
        type: 'optimization',
        data: {
          trend,
          windowSuccessRates,
          overallTrend:
            windowSuccessRates[windowSuccessRates.length - 1] -
            windowSuccessRates[0],
        },
        confidence: Math.min(windows.length / 5, 1),
        frequency: 1,
        context: { type: 'temporal_analysis' },
        metadata: {
          complexity: this.calculateVariance(windowSuccessRates),
          predictability: 1 - this.calculateVariance(windowSuccessRates),
          stability: trend === 'stable' ? 1 : 0.5,
          anomalyScore: Math.abs(
            windowSuccessRates[windowSuccessRates.length - 1] - 0.5
          ),
          correlations: [],
          quality: windowSuccessRates[windowSuccessRates.length - 1],
          relevance: 1,
        },
        timestamp: Date.now(),
      });
    }

    return patterns;
  }

  /**
   * Analyze resource usage patterns in performance history
   */
  private analyzeResourcePatterns(history: PerformanceEntry[]): Pattern[] {
    const patterns: Pattern[] = [];

    const resourceData = history.filter((e) => e.resourceUsage !== undefined);

    if (resourceData.length < 5) return patterns;

    const resourceUsages = resourceData.map((e) => e.resourceUsage!);
    const avgResourceUsage =
      resourceUsages.reduce((sum, usage) => sum + usage, 0) /
      resourceUsages.length;

    // Analyze correlation between resource usage and success
    const correlationData = resourceData.map((e) => ({
      resource: e.resourceUsage!,
      success: e.success ? 1 : 0,
    }));

    const correlation = this.calculateCorrelation(
      correlationData.map((d) => d.resource),
      correlationData.map((d) => d.success)
    );

    patterns.push({
      id: 'resource-usage',
      type: 'resource_utilization',
      data: {
        averageUsage: avgResourceUsage,
        correlation,
        samples: resourceData.length,
        usage: resourceUsages,
      },
      confidence: Math.min(resourceData.length / 20, 1),
      frequency: resourceData.length / history.length,
      context: { type: 'resource_analysis' },
      metadata: {
        complexity: this.calculateVariance(resourceUsages),
        predictability: Math.abs(correlation),
        stability: 1 - this.calculateVariance(resourceUsages),
        anomalyScore: Math.abs(correlation),
        correlations: [],
        quality: Math.abs(correlation),
        relevance: resourceData.length / history.length,
      },
      timestamp: Date.now(),
    });

    return patterns;
  }

  /**
   * Calculate optimal learning rate based on patterns
   */
  private calculateOptimalLearningRate(
    state: AgentLearningState,
    patterns: Pattern[]
  ): number {
    let baseRate = state.currentLearningRate;

    // Adjust based on patterns
    for (const pattern of patterns) {
      if (pattern.type === 'task_completion') {
        const successRate = (pattern.data as any).successRate;
        if (successRate < 0.6) {
          baseRate *= 0.9; // Reduce learning rate for struggling tasks
        } else if (successRate > 0.8) {
          baseRate *= 1.1; // Increase for successful tasks
        }
      } else if (pattern.type === 'optimization') {
        const trend = (pattern.data as any).trend;
        if (trend === 'declining') {
          baseRate *= 0.8; // Reduce for declining performance
        } else if (trend === 'improving') {
          baseRate *= 1.05; // Slight increase for improving performance
        }
      }
    }

    // Ensure within bounds
    return Math.max(
      this.config.minLearningRate,
      Math.min(this.config.maxLearningRate, baseRate)
    );
  }

  /**
   * Generate recommendations based on agent state and optimal learning rate
   */
  private generateRecommendations(
    state: AgentLearningState,
    optimalRate: number
  ): string[] {
    const recommendations: string[] = [];

    if (state.currentSuccessRate < 0.6) {
      recommendations.push(
        'Consider reducing task complexity or providing additional training'
      );
    }

    if (state.learningTrend === 'declining') {
      recommendations.push('Monitor for fatigue or resource constraints');
    }

    if (Math.abs(optimalRate - state.currentLearningRate) > 0.05) {
      recommendations.push(
        `Adjust learning rate from ${state.currentLearningRate.toFixed(3)} to ${optimalRate.toFixed(3)}`
      );
    }

    if (state.performanceMetrics.efficiency < 0.7) {
      recommendations.push(
        'Focus on efficiency improvements and resource optimization'
      );
    }

    if (state.successHistory.length < this.config.performanceWindowSize) {
      recommendations.push('Collect more performance data for better analysis');
    }

    return recommendations;
  }

  /**
   * Predict future performance based on current state and learning rate
   */
  private predictPerformance(
    state: AgentLearningState,
    learningRate: number
  ): number {
    // Simple prediction based on current trend and learning rate
    let prediction = state.currentSuccessRate;

    if (state.learningTrend === 'improving') {
      prediction *= 1 + learningRate * 0.5;
    } else if (state.learningTrend === 'declining') {
      prediction *= 1 - learningRate * 0.3;
    }

    // Factor in experience
    const experienceFactor = Math.min(state.totalTasks / 100, 1);
    prediction = prediction * (0.7 + 0.3 * experienceFactor);

    return Math.min(1, Math.max(0, prediction));
  }

  /**
   * Calculate confidence score for agent state
   */
  private calculateConfidenceScore(state: AgentLearningState): number {
    const factors = [
      state.successHistory.length / this.config.performanceWindowSize, // Data completeness
      1 - this.calculatePerformanceVariance(state), // Consistency
      state.totalTasks / 50, // Experience
      state.currentSuccessRate, // Current performance
    ];

    const weights = [0.3, 0.3, 0.2, 0.2];
    const weightedScore = factors.reduce(
      (sum, factor, index) => sum + factor * weights[index],
      0
    );

    return Math.min(1, Math.max(0, weightedScore));
  }

  /**
   * Calculate performance variance for an agent
   */
  private calculatePerformanceVariance(state: AgentLearningState): number {
    if (state.successHistory.length < 2) return 0;

    const successValues = state.successHistory.map((entry) =>
      entry.success ? 1 : 0
    );
    return this.calculateVariance(successValues);
  }

  /**
   * Calculate variance of an array of numbers
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  /**
   * Calculate correlation between two arrays
   */
  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
    const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;

    const numerator = x.reduce(
      (sum, val, i) => sum + (val - meanX) * (y[i] - meanY),
      0
    );
    const denomX = Math.sqrt(
      x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0)
    );
    const denomY = Math.sqrt(
      y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0)
    );

    if (denomX === 0 || denomY === 0) return 0;
    return numerator / (denomX * denomY);
  }

  /**
   * Start persistence timer for regular state saving
   */
  private startPersistenceTimer(): void {
    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
    }

    this.persistenceTimer = setInterval(() => {
      this.persistLearningStates();
    }, this.config.persistenceInterval);

    logger.debug('💾 Persistence timer started');
  }

  /**
   * Persist learning states (placeholder for actual persistence implementation)
   */
  private persistLearningStates(): void {
    // This would typically save to a database or file system
    // For now, we just log the state count
    logger.debug(
      `💾 Persisting learning states for ${this.agentStates.size} agents`
    );
  }

  /**
   * Shutdown the learning system and cleanup resources
   */
  public shutdown(): void {
    logger.info('🛑 Shutting down Agent Learning System');

    if (this.persistenceTimer) {
      clearInterval(this.persistenceTimer);
      this.persistenceTimer = undefined;
    }

    // Persist final states
    this.persistLearningStates();

    // Clear data structures
    this.agentStates.clear();
    this.learningRates.clear();
    this.successHistory.clear();
    this.adaptationAlgorithms.clear();

    logger.info('✅ Agent Learning System shutdown complete');
  }

  /**
   * Get system-wide learning statistics
   */
  public getSystemStats(): {
    totalAgents: number;
    averageSuccessRate: number;
    averageLearningRate: number;
    totalTasks: number;
    topPerformers: Array<{ agentId: string; successRate: number }>;
    systemEfficiency: number;
  } {
    const states = Array.from(this.agentStates.values());

    if (states.length === 0) {
      return {
        totalAgents: 0,
        averageSuccessRate: 0,
        averageLearningRate: 0,
        totalTasks: 0,
        topPerformers: [],
        systemEfficiency: 0,
      };
    }

    const totalTasks = states.reduce((sum, state) => sum + state.totalTasks, 0);
    const averageSuccessRate =
      states.reduce((sum, state) => sum + state.currentSuccessRate, 0) /
      states.length;
    const averageLearningRate =
      states.reduce((sum, state) => sum + state.currentLearningRate, 0) /
      states.length;

    const topPerformers = states
      .map((state) => ({
        agentId: state.agentId,
        successRate: state.currentSuccessRate,
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);

    const systemEfficiency =
      states.reduce(
        (sum, state) => sum + state.performanceMetrics.efficiency,
        0
      ) / states.length;

    return {
      totalAgents: states.length,
      averageSuccessRate,
      averageLearningRate,
      totalTasks,
      topPerformers,
      systemEfficiency,
    };
  }
}

/**
 * Default configuration for Agent Learning System
 */
export const DEFAULT_LEARNING_CONFIG: AgentLearningConfig = {
  baseLearningRate: 0.1,
  minLearningRate: 0.01,
  maxLearningRate: 0.5,
  adaptationThreshold: 0.75,
  performanceWindowSize: 50,
  enableDynamicAdaptation: true,
  enableNeuralAnalysis: true,
  persistenceInterval: 30000,
};

/**
 * Factory function to create Agent Learning System with default configuration
 */
export function createAgentLearningSystem(
  config?: Partial<AgentLearningConfig>
): AgentLearningSystem {
  return new AgentLearningSystem(config);
}
