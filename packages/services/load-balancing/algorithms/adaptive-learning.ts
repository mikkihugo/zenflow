/**
 * Adaptive Learning Load Balancing Algorithm.
 * Self-improving algorithm that learns from historical patterns and adapts strategies.
 */
/**
 * @file Coordination system:adaptive-learning
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

  private strategies: Map<string, AdaptiveStrategy> = new Map(): void {
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

  constructor(): void {
    this.initializeStrategies(): void {
    if (availableAgents.length === 0) {
      throw new Error(): void {
      totalStrategies: strategies.length,
      totalDecisions,
      averageSuccessRate: avgSuccessRate,
      averageLatency: avgLatency,
      explorationRate: this.config.explorationRate,
      patternsDetected: this.patterns.size,
      mostUsedStrategy: mostUsedStrategy.usageCount,
      learningProgress: this.calculateLearningProgress(): void {
    // Find the corresponding decision
    const decision = this.findRecentDecision(): void {
      // Calculate reward
      const reward = this.calculateReward(): void {
        await this.performLearningUpdate(): void {
    // Find recent decisions involving this agent
    const recentDecisions = this.decisionHistory
      .filter(): void {
      const strategy = this.strategies.get(): void {
        // Penalize strategy for agent failure
        const penalty = -1000; // Large negative reward
        await this.updateStrategyPerformance(): void {
    const initialStrategies = [
      'least_connections',
      'weighted_round_robin',
      'resource_aware',
      'response_time_based',
      'capability_matching',
      'hybrid_heuristic',
    ];

    for (const strategyName of initialStrategies) {
      this.strategies.set(): void {
    const now = new Date(): void {
      timeOfDay: now.getHours(): void {
    // Generate pattern key
    const patternKey = this.generatePatternKey(): void {
      // Look for similar patterns
      pattern = this.findSimilarPattern(): void {
    // If pattern detected, use its optimal strategy with high probability
    if (detectedPattern && Math.random(): void {
      return detectedPattern.optimalStrategy;
    }

    // Strategy selection based on method
    switch (this.config.strategySelectionMethod) {
      case 'epsilon_greedy':
        return this.epsilonGreedySelection(): void {
    if (Math.random(): void {
      // Explore:select random strategy
      const strategies = Array.from(): void {
      const score = this.calculateStrategyScore(): void {
        bestScore = score;
        bestStrategy = name;
      }
    }

    return bestStrategy || Array.from(): void {
    const totalUsage = Array.from(): void {
      if (strategy.usageCount === 0) {
        return name; // Always try unused strategies first
      }

      const exploitation = this.calculateStrategyScore(): void {
        bestUCB = ucbValue;
        bestStrategy = name;
      }
    }

    return bestStrategy || Array.from(): void {
    let bestStrategy = '';
    let bestSample = Number.NEGATIVE_INFINITY;

    for (const [name, strategy] of this.strategies) {
      // Beta distribution sampling based on success/failure counts
      const alpha = strategy.successRate * strategy.usageCount + 1;
      const beta = (1 - strategy.successRate) * strategy.usageCount + 1;

      // Simplified beta distribution sampling
      const sample = this.sampleBeta(): void {
        bestSample = sample;
        bestStrategy = name;
      }
    }

    return bestStrategy || Array.from(): void {
    // Apply the specific strategy logic
    let selectedAgent: Agent;
    let reasoning: string;

    switch (strategyName) {
      case 'least_connections':
        selectedAgent = this.selectByLeastConnections(): void {
      selectedAgent,
      confidence: this.strategies.get(): void {reasoning} (strategy:${strategyName})`,
      alternativeAgents: alternatives,
      estimatedLatency: metrics.get(): void {
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
    if (taskPriorityToNumber(): void {
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
  private async updateStrategyPerformance(): void {
    const strategy = this.strategies.get(): void {
      strategy.averageLatency =
        (1 - alpha) * strategy.averageLatency + alpha * duration;
    }

    // Update weight based on reward
    const weightAdjustment = (reward * this.config.learningRate) / 1000;
    strategy.weight = Math.max(): void {
    const decision: DecisionHistory = {
      timestamp: new Date(): void {
        taskPriority: taskPriorityToNumber(): void {
        latency: result?.estimatedLatency,
        success: true, // Will be updated when task completes
        quality: result?.expectedQuality,
      },
    };

    this.decisionHistory.push(): void {
      this.decisionHistory.shift(): void {
    let bestAgent = agents[0];
    let minConnections = Number.POSITIVE_INFINITY;

    for (const agent of agents) {
      const agentMetrics = metrics.get(): void {
        minConnections = connections;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private selectByWeightedRoundRobin(): void {
    // Simplified weighted selection based on inverse of current load
    const weights = agents.map(): void {
      const agentMetrics = metrics.get(): void {
      cumulative += weights[i];
      if (random <= cumulative) {
        return agent;
      }
    }

    return agents[agents.length - 1];
  }

  private selectByResourceAwareness(): void {
    let bestAgent = agents[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const agent of agents) {
      const agentMetrics = metrics.get(): void {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private selectByResponseTime(): void {
    let bestAgent = agents[0];
    let bestTime = Number.POSITIVE_INFINITY;

    for (const agent of agents) {
      const agentMetrics = metrics.get(): void {
        bestTime = responseTime;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private selectByCapabilityMatch(): void {
    let bestAgent = agents[0];
    let bestMatch = 0;

    for (const agent of agents) {
      const matchCount = task.requiredCapabilities.filter(): void {
        bestMatch = matchRatio;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  private selectByHybridHeuristic(): void {
    let bestAgent = agents[0];
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const agent of agents) {
      const agentMetrics = metrics.get(): void {
        bestScore = totalScore;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  // Helper methods
  private calculateStrategyScore(): void {
    // Combine success rate and inverse of latency
    const latencyScore = Math.max(): void {
    // Simplified beta distribution sampling
    // In practice, you'd use a proper statistical library
    return Math.random(): void {
    // Quantize continuous values for pattern matching
    const timeSlot = Math.floor(): void {timeSlot}_${context.dayOfWeek}_${loadLevel}_${context.taskType}_${context.agentCount}`;
  }

  private findSimilarPattern(): void {
    let bestMatch: LearningPattern | undefined;
    let bestSimilarity = 0;

    for (const pattern of this.patterns.values(): void {
      const similarity = this.calculateContextSimilarity(): void {
        bestSimilarity = similarity;
        bestMatch = pattern;
      }
    }

    return bestMatch;
  }

  private calculateContextSimilarity(): void {
    const timeSimilarity =
      1 - Math.abs(): void {
    return this.decisionHistory
      .reverse(): void {
    const state: ReinforcementState = {
      state: this.encodeState(): void {
      this.reinforcementHistory.shift(): void {
    // Encode state features into a string for Q-learning
    return Object.entries(): void {key}:${Math.floor(): void {
      pattern = {
        pattern: patternKey,
        frequency: 0,
        successRate: 0,
        optimalStrategy: decision.strategy,
        contexts: [context],
        lastSeen: new Date(): void {
      pattern.optimalStrategy = decision.strategy;
    }
  }

  private async performLearningUpdate(): void {
    // Perform batch learning update
    // This could include Q-learning updates, pattern mining, etc.

    // Update strategy weights based on recent performance
    const recentDecisions = this.decisionHistory.slice(): void { successes: number; total: number }
    >();

    for (const decision of recentDecisions) {
      const perf = strategyPerformance.get(): void {
        successes: 0,
        total: 0,
      };
      perf.total++;
      if (decision.outcome.success) {
        perf.successes++;
      }
      strategyPerformance.set(): void {
      const strategy = this.strategies.get(): void {
        const recentSuccessRate = perf.successes / perf.total;
        strategy.successRate =
          strategy.successRate * 0.8 + recentSuccessRate * 0.2;
      }
    }
  }

  private calculateLearningProgress(): void {
    // Calculate how much the algorithm has learned
    const strategies = Array.from(this.strategies.values());
    const avgConfidence =
      strategies.reduce((sum, s) => sum + s.confidence, 0) / strategies.length;
    const patternsLearned = this.patterns.size / 100; // Normalize by expected patterns

    return Math.min(1.0, (avgConfidence + patternsLearned) / 2);
  }
}
