import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('coordination-intelligence-agent-learning-system');
export class AgentLearningSystem {
    learningRates = new Map();
    successHistory = new Map();
    agentStates = new Map();
    config;
    adaptationAlgorithms;
    persistenceTimer;
    constructor(config = {}) {
        this.config = {
            baseLearningRate: 0.1,
            minLearningRate: 0.01,
            maxLearningRate: 0.5,
            adaptationThreshold: 0.75,
            performanceWindowSize: 50,
            enableDynamicAdaptation: true,
            enableNeuralAnalysis: true,
            persistenceInterval: 30000,
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
    initializeAdaptationAlgorithms() {
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
    updateAgentPerformance(agentId, success, metadata = {}) {
        logger.debug(`📊 Updating performance for agent ${agentId}`, {
            success,
            metadata,
            timestamp: Date.now(),
        });
        const state = this.getOrCreateAgentState(agentId);
        const entry = {
            timestamp: Date.now(),
            success,
            duration: metadata.duration,
            quality: metadata.quality,
            resourceUsage: metadata.resourceUsage,
            taskType: metadata.taskType,
            metadata,
        };
        state.successHistory.push(entry);
        if (state.successHistory.length > this.config.performanceWindowSize) {
            state.successHistory.shift();
        }
        this.updateAgentMetrics(state);
        if (this.config.enableDynamicAdaptation) {
            this.adaptLearningRate(agentId, state);
        }
        state.lastUpdated = Date.now();
        this.agentStates.set(agentId, state);
        logger.debug(`✅ Performance updated for agent ${agentId}`, {
            successRate: state.currentSuccessRate,
            learningRate: state.currentLearningRate,
            trend: state.learningTrend,
        });
    }
    getOptimalLearningRate(agentId) {
        const state = this.agentStates.get(agentId);
        if (!state) {
            logger.warn(`⚠️ No learning state found for agent ${agentId}, using base rate`);
            return this.config.baseLearningRate;
        }
        logger.debug(`🎯 Getting optimal learning rate for agent ${agentId}`, {
            currentRate: state.currentLearningRate,
            successRate: state.currentSuccessRate,
            trend: state.learningTrend,
        });
        return state.currentLearningRate;
    }
    analyzeSuccessPatterns(agentId) {
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
        const taskTypePatterns = this.analyzeTaskTypePatterns(state.successHistory);
        const temporalPatterns = this.analyzeTemporalPatterns(state.successHistory);
        const resourcePatterns = this.analyzeResourcePatterns(state.successHistory);
        const optimalRate = this.calculateOptimalLearningRate(state, [
            ...taskTypePatterns,
            ...temporalPatterns,
            ...resourcePatterns,
        ]);
        const recommendations = this.generateRecommendations(state, optimalRate);
        const predictedPerformance = this.predictPerformance(state, optimalRate);
        const analysis = {
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
    getPerformanceSummary(agentId) {
        const state = this.agentStates.get(agentId);
        if (!state) {
            logger.warn(`⚠️ No performance data found for agent ${agentId}`);
            return null;
        }
        logger.debug(`📋 Getting performance summary for agent ${agentId}`);
        return { ...state };
    }
    getPerformanceImprovements(agentId) {
        const state = this.agentStates.get(agentId);
        if (!state) {
            logger.warn(`⚠️ No performance data for improvements: agent ${agentId}`);
            return [];
        }
        const improvements = [];
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
        logger.debug(`💡 Generated ${improvements.length} improvement suggestions for agent ${agentId}`);
        return improvements;
    }
    resetAgentLearning(agentId) {
        logger.info(`🔄 Resetting learning state for agent ${agentId}`);
        this.agentStates.delete(agentId);
        this.learningRates.delete(agentId);
        this.successHistory.delete(agentId);
        logger.info(`✅ Learning state reset completed for agent ${agentId}`);
    }
    getOrCreateAgentState(agentId) {
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
    updateAgentMetrics(state) {
        const history = state.successHistory;
        if (history.length === 0)
            return;
        const successfulTasks = history.filter((entry) => entry.success).length;
        state.currentSuccessRate = successfulTasks / history.length;
        state.successfulTasks = successfulTasks;
        state.totalTasks = history.length;
        const qualityScores = history
            .filter((entry) => entry.quality !== undefined)
            .map((entry) => entry.quality);
        if (qualityScores.length > 0) {
            state.averagePerformance =
                qualityScores.reduce((sum, score) => sum + score, 0) /
                    qualityScores.length;
        }
        if (history.length >= 10) {
            const recentHistory = history.slice(-10);
            const olderHistory = history.slice(-20, -10);
            if (olderHistory.length > 0) {
                const recentSuccessRate = recentHistory.filter((e) => e.success).length / recentHistory.length;
                const olderSuccessRate = olderHistory.filter((e) => e.success).length / olderHistory.length;
                if (recentSuccessRate > olderSuccessRate + 0.1) {
                    state.learningTrend = 'improving';
                }
                else if (recentSuccessRate < olderSuccessRate - 0.1) {
                    state.learningTrend = 'declining';
                }
                else {
                    state.learningTrend = 'stable';
                }
            }
        }
        this.updatePerformanceMetrics(state);
    }
    updatePerformanceMetrics(state) {
        const history = state.successHistory;
        if (history.length === 0)
            return;
        const timeSpan = Date.now() - history[0].timestamp;
        state.performanceMetrics.throughput = (history.length / timeSpan) * 60000;
        const durations = history
            .filter((entry) => entry.duration !== undefined)
            .map((entry) => entry.duration);
        if (durations.length > 0) {
            state.performanceMetrics.latency =
                durations.reduce((sum, duration) => sum + duration, 0) /
                    durations.length;
        }
        const errors = history.filter((entry) => !entry.success).length;
        state.performanceMetrics.errorRate = errors / history.length;
        state.performanceMetrics.efficiency =
            state.currentSuccessRate * (1 - state.performanceMetrics.errorRate);
        state.performanceMetrics.quality = state.averagePerformance;
    }
    adaptLearningRate(agentId, state) {
        const previousRate = state.currentLearningRate;
        const newRate = this.hybridAdaptiveStrategy(state);
        const boundedRate = Math.max(this.config.minLearningRate, Math.min(this.config.maxLearningRate, newRate));
        if (Math.abs(boundedRate - previousRate) > 0.001) {
            state.currentLearningRate = boundedRate;
            this.learningRates.set(agentId, boundedRate);
            const adaptation = {
                timestamp: Date.now(),
                previousRate,
                newRate: boundedRate,
                reason: 'hybrid-adaptive-strategy',
                successRateAtTime: state.currentSuccessRate,
                confidenceScore: this.calculateConfidenceScore(state),
            };
            state.adaptationHistory.push(adaptation);
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
    gradientBasedAdaptation(state) {
        const successRate = state.currentSuccessRate;
        const target = this.config.adaptationThreshold;
        const gradient = successRate - target;
        const adjustment = gradient * 0.1;
        return state.currentLearningRate + adjustment;
    }
    successRateBasedAdaptation(state) {
        const successRate = state.currentSuccessRate;
        if (successRate < 0.5) {
            return state.currentLearningRate * 0.8;
        }
        else if (successRate > 0.8) {
            return state.currentLearningRate * 1.1;
        }
        return state.currentLearningRate;
    }
    trendFollowingAdaptation(state) {
        switch (state.learningTrend) {
            case 'improving':
                return state.currentLearningRate * 1.05;
            case 'declining':
                return state.currentLearningRate * 0.95;
            default:
                return state.currentLearningRate;
        }
    }
    neuralOptimizedAdaptation(state) {
        const inputs = [
            state.currentSuccessRate,
            state.averagePerformance,
            state.performanceMetrics.efficiency,
            state.totalTasks / 100,
        ];
        const weights = [0.4, 0.2, 0.3, 0.1];
        const output = inputs.reduce((sum, input, index) => sum + input * weights[index], 0);
        return this.config.baseLearningRate * output;
    }
    hybridAdaptiveStrategy(state) {
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
            }
            catch (error) {
                logger.warn(`⚠️ Algorithm ${algorithm.name} failed`, error);
            }
        }
        return totalWeight > 0
            ? weightedSum / totalWeight
            : state.currentLearningRate;
    }
    analyzeTaskTypePatterns(history) {
        const taskTypeGroups = new Map();
        for (const entry of history) {
            if (entry.taskType) {
                const group = taskTypeGroups.get(entry.taskType) || [];
                group.push(entry);
                taskTypeGroups.set(entry.taskType, group);
            }
        }
        const patterns = [];
        for (const [taskType, entries] of taskTypeGroups) {
            if (entries.length >= 3) {
                const successRate = entries.filter((e) => e.success).length / entries.length;
                patterns.push({
                    id: `task-type-${taskType}`,
                    type: 'task_completion',
                    data: {
                        taskType,
                        successRate,
                        count: entries.length,
                        averageDuration: entries.reduce((sum, e) => sum + (e.duration || 0), 0) /
                            entries.length,
                    },
                    confidence: Math.min(entries.length / 10, 1),
                    frequency: entries.length / history.length,
                    context: { type: 'task_type_analysis' },
                    metadata: {
                        complexity: 1 - successRate,
                        predictability: successRate,
                        stability: this.calculateVariance(entries.map((e) => (e.success ? 1 : 0))),
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
    analyzeTemporalPatterns(history) {
        const patterns = [];
        if (history.length < 10)
            return patterns;
        const windowSize = Math.min(10, Math.floor(history.length / 3));
        const windows = [];
        for (let i = 0; i < history.length; i += windowSize) {
            windows.push(history.slice(i, i + windowSize));
        }
        if (windows.length >= 3) {
            const windowSuccessRates = windows.map((window) => window.filter((e) => e.success).length / window.length);
            let trend = 'stable';
            if (windowSuccessRates.length >= 3) {
                const firstHalf = windowSuccessRates.slice(0, Math.floor(windowSuccessRates.length / 2));
                const secondHalf = windowSuccessRates.slice(Math.floor(windowSuccessRates.length / 2));
                const firstAvg = firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
                const secondAvg = secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;
                if (secondAvg > firstAvg + 0.1)
                    trend = 'improving';
                else if (secondAvg < firstAvg - 0.1)
                    trend = 'declining';
            }
            patterns.push({
                id: 'temporal-trend',
                type: 'optimization',
                data: {
                    trend,
                    windowSuccessRates,
                    overallTrend: windowSuccessRates[windowSuccessRates.length - 1] -
                        windowSuccessRates[0],
                },
                confidence: Math.min(windows.length / 5, 1),
                frequency: 1,
                context: { type: 'temporal_analysis' },
                metadata: {
                    complexity: this.calculateVariance(windowSuccessRates),
                    predictability: 1 - this.calculateVariance(windowSuccessRates),
                    stability: trend === 'stable' ? 1 : 0.5,
                    anomalyScore: Math.abs(windowSuccessRates[windowSuccessRates.length - 1] - 0.5),
                    correlations: [],
                    quality: windowSuccessRates[windowSuccessRates.length - 1],
                    relevance: 1,
                },
                timestamp: Date.now(),
            });
        }
        return patterns;
    }
    analyzeResourcePatterns(history) {
        const patterns = [];
        const resourceData = history.filter((e) => e.resourceUsage !== undefined);
        if (resourceData.length < 5)
            return patterns;
        const resourceUsages = resourceData.map((e) => e.resourceUsage);
        const avgResourceUsage = resourceUsages.reduce((sum, usage) => sum + usage, 0) /
            resourceUsages.length;
        const correlationData = resourceData.map((e) => ({
            resource: e.resourceUsage,
            success: e.success ? 1 : 0,
        }));
        const correlation = this.calculateCorrelation(correlationData.map((d) => d.resource), correlationData.map((d) => d.success));
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
    calculateOptimalLearningRate(state, patterns) {
        let baseRate = state.currentLearningRate;
        for (const pattern of patterns) {
            if (pattern.type === 'task_completion') {
                const successRate = pattern.data.successRate;
                if (successRate < 0.6) {
                    baseRate *= 0.9;
                }
                else if (successRate > 0.8) {
                    baseRate *= 1.1;
                }
            }
            else if (pattern.type === 'optimization') {
                const trend = pattern.data.trend;
                if (trend === 'declining') {
                    baseRate *= 0.8;
                }
                else if (trend === 'improving') {
                    baseRate *= 1.05;
                }
            }
        }
        return Math.max(this.config.minLearningRate, Math.min(this.config.maxLearningRate, baseRate));
    }
    generateRecommendations(state, optimalRate) {
        const recommendations = [];
        if (state.currentSuccessRate < 0.6) {
            recommendations.push('Consider reducing task complexity or providing additional training');
        }
        if (state.learningTrend === 'declining') {
            recommendations.push('Monitor for fatigue or resource constraints');
        }
        if (Math.abs(optimalRate - state.currentLearningRate) > 0.05) {
            recommendations.push(`Adjust learning rate from ${state.currentLearningRate.toFixed(3)} to ${optimalRate.toFixed(3)}`);
        }
        if (state.performanceMetrics.efficiency < 0.7) {
            recommendations.push('Focus on efficiency improvements and resource optimization');
        }
        if (state.successHistory.length < this.config.performanceWindowSize) {
            recommendations.push('Collect more performance data for better analysis');
        }
        return recommendations;
    }
    predictPerformance(state, learningRate) {
        let prediction = state.currentSuccessRate;
        if (state.learningTrend === 'improving') {
            prediction *= 1 + learningRate * 0.5;
        }
        else if (state.learningTrend === 'declining') {
            prediction *= 1 - learningRate * 0.3;
        }
        const experienceFactor = Math.min(state.totalTasks / 100, 1);
        prediction = prediction * (0.7 + 0.3 * experienceFactor);
        return Math.min(1, Math.max(0, prediction));
    }
    calculateConfidenceScore(state) {
        const factors = [
            state.successHistory.length / this.config.performanceWindowSize,
            1 - this.calculatePerformanceVariance(state),
            state.totalTasks / 50,
            state.currentSuccessRate,
        ];
        const weights = [0.3, 0.3, 0.2, 0.2];
        const weightedScore = factors.reduce((sum, factor, index) => sum + factor * weights[index], 0);
        return Math.min(1, Math.max(0, weightedScore));
    }
    calculatePerformanceVariance(state) {
        if (state.successHistory.length < 2)
            return 0;
        const successValues = state.successHistory.map((entry) => entry.success ? 1 : 0);
        return this.calculateVariance(successValues);
    }
    calculateVariance(values) {
        if (values.length === 0)
            return 0;
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const squaredDiffs = values.map((value) => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }
    calculateCorrelation(x, y) {
        if (x.length !== y.length || x.length === 0)
            return 0;
        const meanX = x.reduce((sum, val) => sum + val, 0) / x.length;
        const meanY = y.reduce((sum, val) => sum + val, 0) / y.length;
        const numerator = x.reduce((sum, val, i) => sum + (val - meanX) * (y[i] - meanY), 0);
        const denomX = Math.sqrt(x.reduce((sum, val) => sum + Math.pow(val - meanX, 2), 0));
        const denomY = Math.sqrt(y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0));
        if (denomX === 0 || denomY === 0)
            return 0;
        return numerator / (denomX * denomY);
    }
    startPersistenceTimer() {
        if (this.persistenceTimer) {
            clearInterval(this.persistenceTimer);
        }
        this.persistenceTimer = setInterval(() => {
            this.persistLearningStates();
        }, this.config.persistenceInterval);
        logger.debug('💾 Persistence timer started');
    }
    persistLearningStates() {
        logger.debug(`💾 Persisting learning states for ${this.agentStates.size} agents`);
    }
    shutdown() {
        logger.info('🛑 Shutting down Agent Learning System');
        if (this.persistenceTimer) {
            clearInterval(this.persistenceTimer);
            this.persistenceTimer = undefined;
        }
        this.persistLearningStates();
        this.agentStates.clear();
        this.learningRates.clear();
        this.successHistory.clear();
        this.adaptationAlgorithms.clear();
        logger.info('✅ Agent Learning System shutdown complete');
    }
    getSystemStats() {
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
        const averageSuccessRate = states.reduce((sum, state) => sum + state.currentSuccessRate, 0) /
            states.length;
        const averageLearningRate = states.reduce((sum, state) => sum + state.currentLearningRate, 0) /
            states.length;
        const topPerformers = states
            .map((state) => ({
            agentId: state.agentId,
            successRate: state.currentSuccessRate,
        }))
            .sort((a, b) => b.successRate - a.successRate)
            .slice(0, 5);
        const systemEfficiency = states.reduce((sum, state) => sum + state.performanceMetrics.efficiency, 0) / states.length;
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
export const DEFAULT_LEARNING_CONFIG = {
    baseLearningRate: 0.1,
    minLearningRate: 0.01,
    maxLearningRate: 0.5,
    adaptationThreshold: 0.75,
    performanceWindowSize: 50,
    enableDynamicAdaptation: true,
    enableNeuralAnalysis: true,
    persistenceInterval: 30000,
};
export function createAgentLearningSystem(config) {
    return new AgentLearningSystem(config);
}
//# sourceMappingURL=agent-learning-system.js.map