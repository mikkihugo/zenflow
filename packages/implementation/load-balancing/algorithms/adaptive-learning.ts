/**
 * Adaptive Learning Load Balancing Algorithm.
 * Self-improving algorithm that learns from historical patterns and adapts strategies.
 */
/**
 * @file Coordination system: adaptive-learning
 */

import type { LoadBalancingAlgorithm } from '../interfaces';
import type { Agent, LoadMetrics, RoutingResult, Task } from '../types';
import { taskPriorityToNumber } from '../types';

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
    strategySelectionMethod:
      'epsilon_greedy' as 'epsilon_greedy|ucb|thompson_sampling',
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
    const strategies = Array.from(this.strategies.values())();
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
      totalDecisions: totalDecisions,
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
  private detectPattern(context: PatternContext): LearningPattern | undefined {
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
      // Explore: select random strategy
      const strategies = Array.from(this.strategies.keys());
      return strategies[Math.floor(Math.random() * strategies.length)];
    }
    // Exploit: select best strategy
    let bestStrategy = '';
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const [name, strategy] of this.strategies) {
      const score = this.calculateStrategyScore(strategy);
      if (score > bestScore) {
        bestScore = score;
        bestStrategy = name;
      }
    }

    return bestStrategy | '|Array.from(this.strategies.keys())[0];';
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

    return bestStrategy | '|Array.from(this.strategies.keys())[0];';
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

    return bestStrategy | '|Array.from(this.strategies.keys())[0];';
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
      reasoning: `${reasoning} (strategy: ${strategyName})`,
      alternativeAgents: alternatives,
      estimatedLatency: metrics.get(selectedAgent?.id)?.responseTime || 1000,
      expectedQuality: this.strategies.get(strategyName)?.successRate || 0.8,
    };
  }

  /**
   * Calculate reward for reinforcement learning.
   *
   * @param duration
   * @param success
   * @param task
   */
  private calculateReward(
    duration: number,
    success: boolean,
    task: Task
  ): number {
    let reward = 0;

    // Base reward for success/failure
    reward += success ? 100 : -100;

    // Latency penalty (prefer faster responses)
    const targetLatency = task.estimatedDuration || 5000;
    const latencyRatio = duration / targetLatency;

    if (latencyRatio < 0.8) {
      reward += 50; // Bonus for being faster than expected
    } else if (latencyRatio > 1.5) {
      reward -= 50; // Penalty for being much slower
    }

    // Priority bonus
    if (taskPriorityToNumber(task.priority) >= 4 && success) {
      reward += 25; // Bonus for handling high priority tasks well
    }

    return reward;
  }

  /**
   * Update strategy performance based on outcome.
   *
   * @param strategyName
   * @param duration
   * @param success
   * @param reward
   */
  private async updateStrategyPerformance(
    strategyName: string,
    duration: number,
    success: boolean,
    reward: number
  ): Promise<void> {
    const strategy = this.strategies.get(strategyName);
    if (!strategy) return;

    // Update usage count
    strategy.usageCount++;
    strategy.lastUsed = new Date();

    // Update success rate using exponential moving average
    const alpha = this.config.learningRate;
    strategy.successRate =
      (1 - alpha) * strategy.successRate + alpha * (success ? 1 : 0);

    // Update average latency
    if (duration > 0) {
      strategy.averageLatency =
        (1 - alpha) * strategy.averageLatency + alpha * duration;
    }

    // Update weight based on reward
    const weightAdjustment = (reward * this.config.learningRate) / 1000;
    strategy.weight = Math.max(0.1, strategy.weight + weightAdjustment);

    // Update confidence based on usage count and success rate
    strategy.confidence = Math.min(
      1.0,
      (strategy.usageCount / 100) * strategy.successRate
    );
  }

  /**
   * Record decision for learning.
   *
   * @param task
   * @param result
   * @param strategy
   * @param context
   */
  private recordDecision(
    task: Task,
    result: RoutingResult,
    strategy: string,
    context: PatternContext
  ): void {
    const decision: DecisionHistory = {
      timestamp: new Date(),
      taskId: task.id,
      agentId: result?.selectedAgent?.id,
      strategy,
      features: {
        taskPriority: taskPriorityToNumber(task.priority),
        timeOfDay: context.timeOfDay,
        systemLoad: context.systemLoad,
        agentCount: context.agentCount,
      },
      outcome: {
        latency: result?.estimatedLatency,
        success: true, // Will be updated when task completes
        quality: result?.expectedQuality,
      },
    };

    this.decisionHistory.push(decision);

    // Limit history size
    if (this.decisionHistory.length > this.config.maxHistorySize) {
      this.decisionHistory.shift();
    }
  }

  // Strategy implementation methods
  private selectByLeastConnections(
    agents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Agent {
    let bestAgent = agents[0];
    let minConnections = Number.POSITIVE_INFINITY;

    for (const agent of agents) {
      const agentMetrics = metrics.get(agent.id);
      const connections = agentMetrics?.activeTasks || 0;

      if (connections < minConnections) {
        minConnections = connections;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private selectByWeightedRoundRobin(
    agents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Agent {
    // Simplified weighted selection based on inverse of current load
    const weights = agents.map((agent) => {
      const agentMetrics = metrics.get(agent.id);
      const load = agentMetrics?.activeTasks || 0;
      return Math.max(0.1, 1 / (load + 1)); // Inverse weight
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const random = Math.random() * totalWeight;

    let cumulative = 0;
    for (let i = 0; i < agents.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return agents[i];
      }
    }

    return agents[agents.length - 1];
  }

  private selectByResourceAwareness(
    agents: Agent[],
    metrics: Map<string, LoadMetrics>,
    _task: Task
  ): Agent {
    let bestAgent = agents[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const agent of agents) {
      const agentMetrics = metrics.get(agent.id);
      if (!agentMetrics) continue;

      // Calculate resource fitness score
      const score =
        (1 - agentMetrics.cpuUsage) * 0.3 +
        (1 - agentMetrics.memoryUsage) * 0.3 +
        (1 - agentMetrics.errorRate) * 0.4;

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private selectByResponseTime(
    agents: Agent[],
    metrics: Map<string, LoadMetrics>
  ): Agent {
    let bestAgent = agents[0];
    let bestTime = Number.POSITIVE_INFINITY;

    for (const agent of agents) {
      const agentMetrics = metrics.get(agent.id);
      const responseTime =
        agentMetrics?.responseTime || Number.POSITIVE_INFINITY;

      if (responseTime < bestTime) {
        bestTime = responseTime;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private selectByCapabilityMatch(agents: Agent[], task: Task): Agent {
    let bestAgent = agents[0];
    let bestMatch = 0;

    for (const agent of agents) {
      const matchCount = task.requiredCapabilities.filter((cap) =>
        agent.capabilities.includes(cap)
      ).length;

      const matchRatio =
        task.requiredCapabilities.length > 0
          ? matchCount / task.requiredCapabilities.length
          : 1;

      if (matchRatio > bestMatch) {
        bestMatch = matchRatio;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private selectByHybridHeuristic(
    agents: Agent[],
    metrics: Map<string, LoadMetrics>,
    task: Task
  ): Agent {
    let bestAgent = agents[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const agent of agents) {
      const agentMetrics = metrics.get(agent.id);
      if (!agentMetrics) continue;

      // Capability match
      const capabilityScore =
        task.requiredCapabilities.length > 0
          ? task.requiredCapabilities.filter((cap) =>
              agent.capabilities.includes(cap)
            ).length / task.requiredCapabilities.length
          : 1;

      // Performance score
      const performanceScore =
        (1 - agentMetrics.cpuUsage) * 0.25 +
        (1 - agentMetrics.memoryUsage) * 0.25 +
        (1 - agentMetrics.errorRate) * 0.3 +
        (1 - Math.min(1, agentMetrics.activeTasks / 10)) * 0.2;

      // Combined score
      const totalScore = capabilityScore * 0.4 + performanceScore * 0.6;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  // Helper methods
  private calculateStrategyScore(strategy: AdaptiveStrategy): number {
    // Combine success rate and inverse of latency
    const latencyScore = Math.max(0, 1 - strategy.averageLatency / 10000);
    return strategy.successRate * 0.7 + latencyScore * 0.3;
  }

  private sampleBeta(_alpha: number, _beta: number): number {
    // Simplified beta distribution sampling
    // In practice, you'd use a proper statistical library'
    return Math.random(); // Placeholder
  }

  private generatePatternKey(context: PatternContext): string {
    // Quantize continuous values for pattern matching
    const timeSlot = Math.floor(context.timeOfDay / 4); // 4-hour slots
    const loadLevel = Math.floor(context.systemLoad / 2); // Load buckets

    return `${timeSlot}_${context.dayOfWeek}_${loadLevel}_${context.taskType}_${context.agentCount}`;
  }

  private findSimilarPattern(
    context: PatternContext
  ): LearningPattern | undefined {
    let bestMatch: LearningPattern | undefined = undefined;
    let bestSimilarity = 0;

    for (const pattern of this.patterns.values()) {
      const similarity = this.calculateContextSimilarity(
        context,
        pattern.contexts[0]
      );

      if (
        similarity > bestSimilarity &&
        similarity >= this.config.contextSimilarityThreshold
      ) {
        bestSimilarity = similarity;
        bestMatch = pattern;
      }
    }

    return bestMatch;
  }

  private calculateContextSimilarity(
    context1: PatternContext,
    context2: PatternContext
  ): number {
    const timeSimilarity =
      1 - Math.abs(context1.timeOfDay - context2.timeOfDay) / 24;
    const loadSimilarity =
      1 -
      Math.abs(context1.systemLoad - context2.systemLoad) /
        Math.max(context1.systemLoad, context2.systemLoad, 1);
    const typeSimilarity = context1.taskType === context2.taskType ? 1 : 0;
    const agentSimilarity =
      1 -
      Math.abs(context1.agentCount - context2.agentCount) /
        Math.max(context1.agentCount, context2.agentCount, 1);

    return (
      (timeSimilarity + loadSimilarity + typeSimilarity + agentSimilarity) / 4
    );
  }

  private findRecentDecision(
    taskId: string,
    agentId: string
  ): DecisionHistory | undefined {
    return this.decisionHistory
      .reverse()
      .find((d) => d.taskId === taskId && d.agentId === agentId);
  }

  private recordReinforcementState(
    decision: DecisionHistory,
    reward: number
  ): void {
    const state: ReinforcementState = {
      state: this.encodeState(decision.features),
      action: decision.strategy,
      reward,
      timestamp: new Date(),
    };

    this.reinforcementHistory.push(state);

    // Limit history size
    if (this.reinforcementHistory.length > this.config.maxHistorySize) {
      this.reinforcementHistory.shift();
    }
  }

  private encodeState(features: Record<string, number>): string {
    // Encode state features into a string for Q-learning
    return Object.entries(features)
      .map(([key, value]) => `${key}:${Math.floor(value * 10)}`)
      .join('|');
  }

  private updatePatterns(
    decision: DecisionHistory,
    success: boolean,
    _duration: number
  ): void {
    const context = {
      timeOfDay: decision.features.timeOfDay,
      dayOfWeek: new Date(decision.timestamp).getDay(),
      systemLoad: decision.features.systemLoad,
      taskType: decision.taskId.split('_')[0], // Extract task type from ID'
      agentCount: decision.features.agentCount,
    } as PatternContext;

    const patternKey = this.generatePatternKey(context);
    let pattern = this.patterns.get(patternKey);

    if (!pattern) {
      pattern = {
        pattern: patternKey,
        frequency: 0,
        successRate: 0,
        optimalStrategy: decision.strategy,
        contexts: [context],
        lastSeen: new Date(),
      };
      this.patterns.set(patternKey, pattern);
    }

    // Update pattern statistics
    pattern.frequency++;
    pattern.successRate =
      (pattern.successRate * (pattern.frequency - 1) + (success ? 1 : 0)) /
      pattern.frequency;
    pattern.lastSeen = new Date();

    // Update optimal strategy if current one is performing better
    const currentStrategyScore =
      this.strategies.get(decision.strategy)?.successRate || 0;
    const optimalStrategyScore =
      this.strategies.get(pattern.optimalStrategy)?.successRate || 0;

    if (currentStrategyScore > optimalStrategyScore) {
      pattern.optimalStrategy = decision.strategy;
    }
  }

  private async performLearningUpdate(): Promise<void> {
    // Perform batch learning update
    // This could include Q-learning updates, pattern mining, etc.

    // Update strategy weights based on recent performance
    const recentDecisions = this.decisionHistory.slice(
      -this.config.strategyUpdateInterval
    );
    const strategyPerformance = new Map<
      string,
      { successes: number; total: number }
    >();

    for (const decision of recentDecisions) {
      const perf = strategyPerformance.get(decision.strategy) || {
        successes: 0,
        total: 0,
      };
      perf.total++;
      if (decision.outcome.success) {
        perf.successes++;
      }
      strategyPerformance.set(decision.strategy, perf);
    }

    // Update strategy success rates
    for (const [strategyName, perf] of strategyPerformance) {
      const strategy = this.strategies.get(strategyName);
      if (strategy && perf.total > 0) {
        const recentSuccessRate = perf.successes / perf.total;
        strategy.successRate =
          strategy.successRate * 0.8 + recentSuccessRate * 0.2;
      }
    }
  }

  private calculateLearningProgress(): number {
    // Calculate how much the algorithm has learned
    const strategies = Array.from(this.strategies.values())();
    const avgConfidence =
      strategies.reduce((sum, s) => sum + s.confidence, 0) / strategies.length;
    const patternsLearned = this.patterns.size / 100; // Normalize by expected patterns

    return Math.min(1.0, (avgConfidence + patternsLearned) / 2);
  }
}
