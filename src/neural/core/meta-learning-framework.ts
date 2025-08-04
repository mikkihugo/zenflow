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
  public options: MetaLearningOptions;

  constructor(options: MetaLearningOptions = {}) {
    this.learningStrategies = new Map();
    this.performanceHistory = [];
    this.options = {
      maxStrategies: 10,
      evaluationWindow: 100,
      ...options,
    };
  }

  /**
   * Register a learning strategy
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
   */
  selectStrategy(taskType, _context = {}) {
    const strategies = Array.from(this.learningStrategies.values())
      .filter((s) => s.applicableTasks?.includes(taskType) || !s.applicableTasks)
      .sort((a, b) => b.performance - a.performance);

    return strategies[0] || null;
  }

  /**
   * Update strategy performance
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
      { performance: -1 },
    );
  }
}

export default MetaLearningFramework;
