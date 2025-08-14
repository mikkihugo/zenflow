export class MetaLearningFramework {
    learningStrategies;
    performanceHistory;
    taskHistory;
    options;
    constructor(options = {}) {
        this.learningStrategies = new Map();
        this.performanceHistory = [];
        this.taskHistory = new Map();
        this.options = {
            maxStrategies: 10,
            evaluationWindow: 100,
            ...options,
        };
    }
    registerStrategy(id, strategy) {
        this.learningStrategies.set(id, {
            ...strategy,
            performance: 0,
            usage: 0,
            created: new Date(),
        });
    }
    selectStrategy(taskType, _context = {}) {
        const strategies = Array.from(this.learningStrategies.values())
            .filter((s) => s.applicableTasks?.includes(taskType) || !s.applicableTasks)
            .sort((a, b) => b.performance - a.performance);
        return strategies[0] || null;
    }
    updatePerformance(strategyId, performance) {
        const strategy = this.learningStrategies.get(strategyId);
        if (strategy) {
            strategy.performance =
                (strategy.performance * strategy.usage + performance) /
                    (strategy.usage + 1);
            strategy.usage++;
            this.performanceHistory.push({
                strategyId,
                performance,
                timestamp: new Date(),
            });
            if (this.performanceHistory.length > this.options.evaluationWindow) {
                this.performanceHistory = this.performanceHistory.slice(-this.options.evaluationWindow);
            }
        }
    }
    getMetrics() {
        return {
            totalStrategies: this.learningStrategies.size,
            avgPerformance: this.calculateAveragePerformance(),
            bestStrategy: this.getBestStrategy(),
            recentPerformance: this.performanceHistory.slice(-10),
        };
    }
    calculateAveragePerformance() {
        const strategies = Array.from(this.learningStrategies.values());
        if (strategies.length === 0)
            return 0;
        const total = strategies.reduce((sum, s) => sum + s.performance, 0);
        return total / strategies.length;
    }
    getBestStrategy() {
        const strategies = Array.from(this.learningStrategies.values());
        return strategies.reduce((best, current) => current?.performance > best.performance ? current : best, { performance: -1 });
    }
    async adaptConfiguration(agentId, config) {
        const agentHistory = this.taskHistory.get(agentId) || [];
        if (agentHistory.length === 0) {
            return config;
        }
        const bestTask = agentHistory.reduce((best, task) => task.performance > best.performance ? task : best);
        const adaptedConfig = {
            ...config,
            learningRate: bestTask.config?.learningRate || config?.learningRate,
            architecture: bestTask.config?.architecture || config?.architecture,
        };
        return adaptedConfig;
    }
    async optimizeTraining(agentId, options) {
        const agentHistory = this.taskHistory.get(agentId) || [];
        if (agentHistory.length === 0) {
            return options;
        }
        const recentTasks = agentHistory.slice(-5);
        const avgPerformance = recentTasks.reduce((sum, task) => sum + task.performance, 0) /
            recentTasks.length;
        const optimizedOptions = { ...options };
        if (avgPerformance < 0.7) {
            optimizedOptions.learningRate = (options?.learningRate || 0.001) * 1.1;
        }
        else if (avgPerformance > 0.9) {
            optimizedOptions.learningRate = (options?.learningRate || 0.001) * 0.9;
        }
        return optimizedOptions;
    }
    async preserveState(agentId) {
        return {
            agentId,
            taskHistory: this.taskHistory.get(agentId) || [],
            learningStrategies: Array.from(this.learningStrategies.values()),
            timestamp: new Date(),
        };
    }
    async restoreState(agentId, state) {
        if (state?.taskHistory) {
            this.taskHistory.set(agentId, state.taskHistory);
        }
        return { success: true };
    }
    async extractExperiences(agentId) {
        const history = this.taskHistory.get(agentId) || [];
        return history.map((task) => ({
            taskId: task.id,
            performance: task.performance,
            strategy: task.strategy,
            timestamp: task.timestamp,
        }));
    }
    getStatistics() {
        const totalTasks = Array.from(this.taskHistory.values()).reduce((sum, history) => sum + history.length, 0);
        return {
            totalAgents: this.taskHistory.size,
            totalTasks,
            strategies: this.learningStrategies.size,
            averagePerformance: this.calculateAveragePerformance(),
        };
    }
}
export default MetaLearningFramework;
//# sourceMappingURL=meta-learning-framework.js.map