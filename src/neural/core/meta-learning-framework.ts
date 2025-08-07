/**
 * Meta Learning Framework
 * Learning to learn - adaptive learning strategies
 */

interface MetaLearningOptions {
  maxStrategies?: number;
  evaluationWindow?: number;
  [key: string]: any;
}

interface LearningStrategy {
  performance: number;
  usage: number;
  created: Date;
  [key: string]: any;
}

export class MetaLearningFramework {
  public learningStrategies: Map<string, LearningStrategy>;
  public performanceHistory: any[];
  public taskHistory: Map<string, any[]>;
  public options: MetaLearningOptions;

  constructor(options: MetaLearningOptions = {}) {
    this.learningStrategies = new Map();
    this.performanceHistory = [];
    this.taskHistory = new Map();
    this.options = {
      maxStrategies: 10,
      evaluationWindow: 100,
      ...options,
    };
  }

  /**
   * Register a learning strategy
   *
   * @param id
   * @param strategy
   */
  registerStrategy(id: string, strategy: any): void {
    this.learningStrategies.set(id, {
      ...strategy,
      performance: 0,
      usage: 0,
      created: new Date(),
    });
  }

  /**
   * Select best strategy for given task
   *
   * @param taskType
   * @param _context
   */
  selectStrategy(taskType, _context = {}) {
    const strategies = Array.from(this.learningStrategies.values())
      .filter((s) => s.applicableTasks?.includes(taskType) || !s.applicableTasks)
      .sort((a, b) => b.performance - a.performance);

    return strategies[0] || null;
  }

  /**
   * Update strategy performance
   *
   * @param strategyId
   * @param performance
   */
  updatePerformance(strategyId, performance) {
    const strategy = this.learningStrategies.get(strategyId);
    if (strategy) {
      strategy.performance =
        (strategy.performance * strategy.usage + performance) / (strategy.usage + 1);
      strategy.usage++;

      this.performanceHistory.push({
        strategyId,
        performance,
        timestamp: new Date(),
      });

      // Keep history within window
      if (this.performanceHistory.length > this.options.evaluationWindow) {
        this.performanceHistory = this.performanceHistory.slice(-this.options.evaluationWindow);
      }
    }
  }

  /**
   * Get framework metrics
   */
  getMetrics() {
    return {
      totalStrategies: this.learningStrategies.size,
      avgPerformance: this.calculateAveragePerformance(),
      bestStrategy: this.getBestStrategy(),
      recentPerformance: this.performanceHistory.slice(-10),
    };
  }

  private calculateAveragePerformance() {
    const strategies = Array.from(this.learningStrategies.values());
    if (strategies.length === 0) return 0;

    const total = strategies.reduce((sum, s) => sum + s.performance, 0);
    return total / strategies.length;
  }

  private getBestStrategy() {
    const strategies = Array.from(this.learningStrategies.values());
    return strategies.reduce(
      (best, current) => (current.performance > best.performance ? current : best),
      { performance: -1 }
    );
  }

  /**
   * Adapt configuration for an agent
   */
  async adaptConfiguration(agentId: string, config: any) {
    const agentHistory = this.taskHistory.get(agentId) || [];

    if (agentHistory.length === 0) {
      return config; // No history, return original config
    }

    // Find best performing configuration from history
    const bestTask = agentHistory.reduce((best, task) =>
      task.performance > best.performance ? task : best
    );

    // Adapt configuration based on best performance
    const adaptedConfig = {
      ...config,
      learningRate: bestTask.config?.learningRate || config.learningRate,
      architecture: bestTask.config?.architecture || config.architecture,
    };

    return adaptedConfig;
  }

  /**
   * Optimize training options for an agent
   */
  async optimizeTraining(agentId: string, options: any) {
    const agentHistory = this.taskHistory.get(agentId) || [];

    if (agentHistory.length === 0) {
      return options;
    }

    // Analyze historical training performance
    const recentTasks = agentHistory.slice(-5);
    const avgPerformance =
      recentTasks.reduce((sum, task) => sum + task.performance, 0) / recentTasks.length;

    const optimizedOptions = { ...options };

    // Adjust learning rate based on performance
    if (avgPerformance < 0.7) {
      optimizedOptions.learningRate = (options.learningRate || 0.001) * 1.1;
    } else if (avgPerformance > 0.9) {
      optimizedOptions.learningRate = (options.learningRate || 0.001) * 0.9;
    }

    return optimizedOptions;
  }

  /**
   * Preserve learning state for an agent
   */
  async preserveState(agentId: string) {
    return {
      agentId,
      taskHistory: this.taskHistory.get(agentId) || [],
      learningStrategies: Array.from(this.learningStrategies.values()),
      timestamp: new Date(),
    };
  }

  /**
   * Restore learning state for an agent
   */
  async restoreState(agentId: string, state: any) {
    if (state?.taskHistory) {
      this.taskHistory.set(agentId, state.taskHistory);
    }
    return { success: true };
  }

  /**
   * Extract experiences for an agent
   */
  async extractExperiences(agentId: string) {
    const history = this.taskHistory.get(agentId) || [];
    return history.map((task) => ({
      taskId: task.id,
      performance: task.performance,
      strategy: task.strategy,
      timestamp: task.timestamp,
    }));
  }

  /**
   * Get meta-learning statistics
   */
  getStatistics() {
    const totalTasks = Array.from(this.taskHistory.values()).reduce(
      (sum, history) => sum + history.length,
      0
    );

    return {
      totalAgents: this.taskHistory.size,
      totalTasks,
      strategies: this.learningStrategies.size,
      averagePerformance: this.calculateAveragePerformance(),
    };
  }
}

export default MetaLearningFramework;
