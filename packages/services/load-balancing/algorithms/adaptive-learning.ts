/**
 * Adaptive Learning Load Balancing Algorithm.
 * Self-improving algorithm that learns from historical patterns and adapts strategies.
 */
/**
 * @file Coordination system:adaptive-learning
 */

import type { LoadBalancingAlgorithm } from '../interfaces';
import type { Agent, LoadMetrics, RoutingResult, Task } from '../types';
import { taskPriorityToNumber as _taskPriorityToNumber } from '../types';

interface AdaptiveStrategy {
  name: string;
  weight: number;
  successRate: number;
  averageLatency: number;
  usageCount: number;
  lastUsed: Date;
  confidence: number;
}

interface LearningPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  optimalStrategy: string;
  contexts: PatternContext[];
  lastSeen: Date;
}

interface PatternContext {
  timeOfDay: number;
  dayOfWeek: number;
  systemLoad: number;
  taskType: string;
  agentCount: number;
}

interface DecisionHistory {
  timestamp: Date;
  taskId: string;
  agentId: string;
  strategy: string;
  features: Record<string, number>;
  outcome: {
    latency: number;
    success: boolean;
    quality: number;
  };
}

interface ReinforcementState {
  state: string;
  action: string;
  reward: number;
  nextState?: string;
  timestamp: Date;
}

export class AdaptiveLearningAlgorithm implements LoadBalancingAlgorithm {
  public readonly name = 'adaptive_learning';

  private strategies: Map<string, AdaptiveStrategy> = new Map();
  private patterns: Map<string, LearningPattern> = new Map();
  private decisionHistory: DecisionHistory[] = [];
  private reinforcementHistory: ReinforcementState[] = [];
  private config = {
    maxHistorySize: 5000,
    learningRate: 0.1,
    explorationRate: 0.2, // Epsilon for epsilon-greedy
    explorationDecay: 0.995,
    minExplorationRate: 0.05,
    patternDetectionWindow: 100,
    strategyUpdateInterval: 1000,
    contextSimilarityThreshold: 0.8,
    reinforcementDiscountFactor: 0.9,
    strategySelectionMethod: 'epsilon_greedy' as
      | 'epsilon_greedy'
      | 'ucb'
      | 'thompson_sampling',
  };

  constructor() {
    this.initializeStrategies();
  }

  /**
   * Select agent using adaptive learning strategy.
   *
   * @param task
   * @param availableAgents
   * @param metrics
   */
  public async selectAgent(
    task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Promise<RoutingResult> {
    if (availableAgents.length === 0) {
      throw new Error('No available agents');
    }

    // Extract current context
    const context = this.extractContext(task, availableAgents, metrics);

    // Detect patterns in current context
    const detectedPattern = this.detectPattern(context);

    // Select strategy based on learning
    const selectedStrategy = await this.selectStrategy(
      context,
      detectedPattern
    );

    // Apply selected strategy
    const result = await this.applyStrategy(
      selectedStrategy,
      task,
      availableAgents,
      metrics,
      context
    );

    // Record decision for learning
    this.recordDecision(task, result, selectedStrategy, context);

    return result;
  }

  /**
   * Update algorithm configuration.
   *
   * @param config
   */
  public async updateConfiguration(
    config: Record<string, unknown>
  ): Promise<void> {
    this.config = { ...this.config, ...config };

    // Adjust exploration rate
    if (config?.explorationRate !== undefined) {
      this.config.explorationRate = Math.max(
        this.config.minExplorationRate,
        config.explorationRate as number
      );
    }
  }

  /**
   * Get performance metrics.
   */
  public async getPerformanceMetrics(): Promise<Record<string, number>> {
    const strategies = Array.from(this.strategies.values());
    const totalDecisions = this.decisionHistory.length;

    const avgSuccessRate =
      strategies.length > 0
        ? strategies.reduce((sum, s) => sum + s.successRate, 0) /
          strategies.length
        : 0;

    const avgLatency =
      strategies.length > 0
        ? strategies.reduce((sum, s) => sum + s.averageLatency, 0) /
          strategies.length
        : 0;

    const mostUsedStrategy = strategies.reduce(
      (best, current) =>
        current?.usageCount > best.usageCount ? current : best,
      strategies[0] || { name: 'none', usageCount: 0 }
    );

    return {
      totalStrategies: strategies.length,
      totalDecisions,
      averageSuccessRate: avgSuccessRate,
      averageLatency: avgLatency,
      explorationRate: this.config.explorationRate,
      patternsDetected: this.patterns.size,
      mostUsedStrategy: mostUsedStrategy.usageCount,
      learningProgress: this.calculateLearningProgress(),
    };
  }

  /**
   * Handle task completion for reinforcement learning.
   *
   * @param agentId
   * @param task
   * @param duration
   * @param success
   */
  public async onTaskComplete(
    agentId: string,
    task: Task,
    duration: number,
    success: boolean
  ): Promise<void> {
    // Find the corresponding decision
    const decision = this.findRecentDecision(task.id, agentId);

    if (decision) {
      // Calculate reward
      const reward = this.calculateReward(duration, success, task);

      // Update strategy performance
      await this.updateStrategyPerformance(
        decision.strategy,
        duration,
        success,
        reward
      );

      // Record reinforcement learning data
      this.recordReinforcementState(decision, reward);

      // Update patterns
      this.updatePatterns(decision, success, duration);

      // Trigger learning if enough data accumulated
      if (
        this.decisionHistory.length % this.config.strategyUpdateInterval ===
        0
      ) {
        await this.performLearningUpdate();
      }
    }

    // Decay exploration rate
    this.config.explorationRate = Math.max(
      this.config.minExplorationRate,
      this.config.explorationRate * this.config.explorationDecay
    );
  }

  /**
   * Handle agent failure.
   *
   * @param agentId
   * @param _error
   */
  public async onAgentFailure(agentId: string, _error: Error): Promise<void> {
    // Find recent decisions involving this agent
    const recentDecisions = this.decisionHistory
      .filter((d) => d.agentId === agentId)
      .slice(-10); // Last 10 decisions

    // Apply negative reinforcement to strategies that selected this agent
    for (const decision of recentDecisions) {
      const strategy = this.strategies.get(decision.strategy);
      if (strategy) {
        // Penalize strategy for agent failure
        const penalty = -1000; // Large negative reward
        await this.updateStrategyPerformance(
          decision.strategy,
          0,
          false,
          penalty
        );
      }
    }
  }

  /**
   * Initialize available strategies.
   */
  private initializeStrategies(): void {
    const initialStrategies = [
      'least_connections',
      'weighted_round_robin',
      'resource_aware',
      'response_time_based',
      'capability_matching',
      'hybrid_heuristic',
    ];

    for (const strategyName of initialStrategies) {
      this.strategies.set(strategyName, {
        name: strategyName,
        weight: 1.0,
        successRate: 0.5, // Start with neutral assumption
        averageLatency: 1000,
        usageCount: 0,
        lastUsed: new Date(0),
        confidence: 0.1,
      });
    }
  }

  /**
   * Extract context features from current situation.
   *
   * @param task
   * @param availableAgents
   * @param metrics
   */
  private extractContext(
    task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): PatternContext {
    const now = new Date();
    const totalLoad = Array.from(metrics.values()).reduce(
      (sum, m) => sum + m.activeTasks,
      0
    );

    return {
      timeOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
      systemLoad: totalLoad / availableAgents.length,
      taskType: task.type,
      agentCount: availableAgents.length,
    };
  }

  /**
   * Detect patterns in historical data.
   *
   * @param context
   */
  private detectPattern(_context: PatternContext): LearningPattern | undefined {
    // Generate pattern key
    const patternKey = this.generatePatternKey(context);

    // Check if pattern exists
    let pattern = this.patterns.get(patternKey);

    if (!pattern) {
      // Look for similar patterns
      pattern = this.findSimilarPattern(context) || undefined;
    }

    return pattern;
  }

  /**
   * Select strategy using epsilon-greedy or other methods.
   *
   * @param _context
   * @param detectedPattern
   */
  private async selectStrategy(
    _context: PatternContext,
    detectedPattern?: LearningPattern | undefined
  ): Promise<string> {
    // If pattern detected, use its optimal strategy with high probability
    if (detectedPattern && Math.random() > this.config.explorationRate) {
      return detectedPattern.optimalStrategy;
    }

    // Strategy selection based on method
    switch (this.config.strategySelectionMethod) {
      case 'epsilon_greedy':
        return this.epsilonGreedySelection();
      case 'ucb':
        return this.upperConfidenceBoundSelection();
      case 'thompson_sampling':
        return this.thompsonSamplingSelection();
      default:
        return this.epsilonGreedySelection();
    }
  }

  /**
   * Epsilon-greedy strategy selection.
   */
  private epsilonGreedySelection(): string {
    if (Math.random() < this.config.explorationRate) {
      // Explore:select random strategy
      const strategies = Array.from(this.strategies.keys());
      return strategies[Math.floor(Math.random() * strategies.length)];
    }
    // Exploit:select best strategy
    let bestStrategy = '';
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const [name, strategy] of this.strategies) {
      const score = this.calculateStrategyScore(strategy);
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = name;
      }
    }

    return bestStrategy || Array.from(this.strategies.keys())[0];
  }

  /**
   * Upper Confidence Bound strategy selection.
   */
  private upperConfidenceBoundSelection(): string {
    const totalUsage = Array.from(this.strategies.values()).reduce(
      (sum, s) => sum + s.usageCount,
      0
    );

    let bestStrategy = '';
    let bestUCB = Number.NEGATIVE_INFINITY;

    for (const [name, strategy] of this.strategies) {
      if (strategy.usageCount === 0) {
        return name; // Always try unused strategies first
      }

      const exploitation = this.calculateStrategyScore(strategy);
      const exploration = Math.sqrt(
        (2 * Math.log(totalUsage)) / strategy.usageCount
      );

      const ucbValue = exploitation + exploration;

      if (ucbValue > bestUCB) {
        bestUCB = ucbValue;
        bestStrategy = name;
      }
    }

    return bestStrategy || Array.from(this.strategies.keys())[0];
  }

  /**
   * Thompson sampling strategy selection.
   */
  private thompsonSamplingSelection(): string {
    let bestStrategy = '';
    let bestSample = Number.NEGATIVE_INFINITY;

    for (const [name, strategy] of this.strategies) {
      // Beta distribution sampling based on success/failure counts
      const alpha = strategy.successRate * strategy.usageCount + 1;
      const beta = (1 - strategy.successRate) * strategy.usageCount + 1;

      // Simplified beta distribution sampling
      const sample = this.sampleBeta(alpha, beta);

      if (sample > bestSample) {
        bestSample = sample;
        bestStrategy = name;
      }
    }

    return bestStrategy || Array.from(this.strategies.keys())[0];
  }

  /**
   * Apply selected strategy to choose agent.
   *
   * @param strategyName
   * @param task
   * @param availableAgents
   * @param metrics
   * @param _context
   */
  private async applyStrategy(
    strategyName: string,
    task: Task,
    availableAgents: Agent[],
    metrics: Map<string, LoadMetrics>,
    _context: PatternContext
  ): Promise<RoutingResult> {
    // Apply the specific strategy logic
    let selectedAgent: Agent;
    let reasoning: string;

    switch (strategyName) {
      case 'least_connections':
        selectedAgent = this.selectByLeastConnections(availableAgents, metrics);
        reasoning = 'Selected agent with least active connections';
        break;

      case 'weighted_round_robin':
        selectedAgent = this.selectByWeightedRoundRobin(
          availableAgents,
          metrics
        );
        reasoning = 'Selected using weighted round robin based on performance';
        break;

      case 'resource_aware':
        selectedAgent = this.selectByResourceAwareness(
          availableAgents,
          metrics,
          task
        );
        reasoning = 'Selected based on resource availability and requirements';
        break;

      case 'response_time_based':
        selectedAgent = this.selectByResponseTime(availableAgents, metrics);
        reasoning = 'Selected agent with best average response time';
        break;

      case 'capability_matching':
        selectedAgent = this.selectByCapabilityMatch(availableAgents, task);
        reasoning = 'Selected agent with best capability match';
        break;
      default:
        selectedAgent = this.selectByHybridHeuristic(
          availableAgents,
          metrics,
          task
        );
        reasoning =
          'Selected using hybrid heuristic combining multiple factors';
        break;
    }

    const alternatives = availableAgents
      .filter((a) => a.id !== selectedAgent?.id)
      .slice(0, 3);

    return {
      selectedAgent,
      confidence: this.strategies.get(strategyName)?.confidence || 0.5,
      reasoning: `${reasoning} (strategy:${strategyName})"Fixed unterminated template" `${timeSlot}_${context.dayOfWeek}_${loadLevel}_${context.taskType}_${context.agentCount}"Fixed unterminated template" `${key}:${Math.floor(value * 10)}"Fixed unterminated template"