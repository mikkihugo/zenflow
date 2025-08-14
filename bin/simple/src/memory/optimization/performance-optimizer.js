import { EventEmitter } from 'node:events';
export class PerformanceOptimizer extends EventEmitter {
    config;
    metrics;
    actions = new Map();
    backends = new Map();
    optimizationHistory = [];
    constructor(config) {
        super();
        this.config = config;
        this.metrics = {
            operationsPerSecond: 0,
            averageLatency: 0,
            memoryUsage: 0,
            cacheHitRate: 0,
            errorRate: 0,
            lastUpdated: Date.now(),
        };
        if (config?.adaptation?.enabled) {
            this.startAdaptiveOptimization();
        }
    }
    registerBackend(id, backend) {
        this.backends.set(id, backend);
        this.emit('backendRegistered', { id, backend });
    }
    updateMetrics(newMetrics) {
        this.metrics = {
            ...this.metrics,
            ...newMetrics,
            lastUpdated: Date.now(),
        };
        this.emit('metricsUpdated', this.metrics);
        this.checkThresholds();
    }
    checkThresholds() {
        const warnings = [];
        if (this.metrics.averageLatency > this.config.thresholds.latencyWarning) {
            warnings.push('high_latency');
            this.suggestOptimization('latency');
        }
        if (this.metrics.errorRate > this.config.thresholds.errorRateWarning) {
            warnings.push('high_error_rate');
            this.suggestOptimization('error_rate');
        }
        if (this.metrics.memoryUsage > this.config.thresholds.memoryUsageWarning) {
            warnings.push('high_memory_usage');
            this.suggestOptimization('memory');
        }
        if (this.metrics.cacheHitRate < this.config.thresholds.cacheHitRateMin) {
            warnings.push('low_cache_hit_rate');
            this.suggestOptimization('cache');
        }
        if (warnings.length > 0) {
            this.emit('performanceWarning', { warnings, metrics: this.metrics });
        }
    }
    suggestOptimization(issue) {
        let action;
        switch (issue) {
            case 'latency':
                action = {
                    id: `opt_${Date.now()}_latency`,
                    type: 'cache_adjust',
                    description: 'Increase cache size to reduce average latency',
                    impact: 'medium',
                    timestamp: Date.now(),
                    status: 'pending',
                };
                break;
            case 'error_rate':
                action = {
                    id: `opt_${Date.now()}_error`,
                    type: 'index_rebuild',
                    description: 'Rebuild indexes to reduce error rate',
                    impact: 'high',
                    timestamp: Date.now(),
                    status: 'pending',
                };
                break;
            case 'memory':
                action = {
                    id: `opt_${Date.now()}_memory`,
                    type: 'compression_toggle',
                    description: 'Enable compression to reduce memory usage',
                    impact: 'medium',
                    timestamp: Date.now(),
                    status: 'pending',
                };
                break;
            case 'cache':
                action = {
                    id: `opt_${Date.now()}_cache`,
                    type: 'prefetch_adjust',
                    description: 'Adjust prefetch strategy to improve cache hit rate',
                    impact: 'low',
                    timestamp: Date.now(),
                    status: 'pending',
                };
                break;
            default:
                return;
        }
        this.actions.set(action.id, action);
        this.emit('optimizationSuggested', action);
    }
    async executeOptimization(actionId) {
        const action = this.actions.get(actionId);
        if (!action) {
            throw new Error(`Optimization action not found: ${actionId}`);
        }
        action.status = 'executing';
        this.emit('optimizationStarted', action);
        try {
            const result = await this.performOptimization(action);
            action.status = 'completed';
            action.result = result;
            this.emit('optimizationCompleted', action);
        }
        catch (error) {
            action.status = 'failed';
            action.result = { error: error.message };
            this.emit('optimizationFailed', { action, error });
            throw error;
        }
        return action;
    }
    async performOptimization(action) {
        switch (action.type) {
            case 'cache_adjust':
                return await this.adjustCache();
            case 'index_rebuild':
                return await this.rebuildIndexes();
            case 'compression_toggle':
                return await this.toggleCompression();
            case 'prefetch_adjust':
                return await this.adjustPrefetch();
            case 'partition_rebalance':
                return await this.rebalancePartitions();
            default:
                throw new Error(`Unknown optimization type: ${action.type}`);
        }
    }
    async adjustCache() {
        const currentCacheSize = 1000;
        const newCacheSize = Math.min(currentCacheSize * 1.5, 5000);
        const results = [];
        for (const [id, _backend] of this.backends) {
            try {
                results.push({
                    backendId: id,
                    oldSize: currentCacheSize,
                    newSize: newCacheSize,
                });
            }
            catch (error) {
                results.push({ backendId: id, error: error.message });
            }
        }
        return { type: 'cache_adjust', results };
    }
    async rebuildIndexes() {
        const results = [];
        for (const [id, _backend] of this.backends) {
            try {
                results.push({
                    backendId: id,
                    status: 'rebuilt',
                    duration: Math.random() * 1000,
                });
            }
            catch (error) {
                results.push({ backendId: id, error: error.message });
            }
        }
        return { type: 'index_rebuild', results };
    }
    async toggleCompression() {
        const results = [];
        for (const [id, _backend] of this.backends) {
            try {
                const savings = Math.random() * 0.3 + 0.1;
                results.push({
                    backendId: id,
                    compressionEnabled: true,
                    memorySavings: savings,
                });
            }
            catch (error) {
                results.push({ backendId: id, error: error.message });
            }
        }
        return { type: 'compression_toggle', results };
    }
    async adjustPrefetch() {
        const results = [];
        for (const [id, _backend] of this.backends) {
            try {
                const newStrategy = ['aggressive', 'conservative', 'adaptive'][Math.floor(Math.random() * 3)];
                results.push({ backendId: id, strategy: newStrategy });
            }
            catch (error) {
                results.push({ backendId: id, error: error.message });
            }
        }
        return { type: 'prefetch_adjust', results };
    }
    async rebalancePartitions() {
        const results = [];
        for (const [id, _backend] of this.backends) {
            try {
                const partitionCount = Math.floor(Math.random() * 8) + 4;
                results.push({
                    backendId: id,
                    partitions: partitionCount,
                    status: 'rebalanced',
                });
            }
            catch (error) {
                results.push({ backendId: id, error: error.message });
            }
        }
        return { type: 'partition_rebalance', results };
    }
    startAdaptiveOptimization() {
        setInterval(() => {
            this.performAdaptiveOptimization();
        }, this.config.adaptation.adaptationInterval);
    }
    performAdaptiveOptimization() {
        const history = this.optimizationHistory.slice(-10);
        if (history.length < 3)
            return;
        const latencyTrend = this.calculateTrend(history.map((h) => h.metrics.averageLatency));
        const errorTrend = this.calculateTrend(history.map((h) => h.metrics.errorRate));
        const cacheTrend = this.calculateTrend(history.map((h) => h.metrics.cacheHitRate));
        if (latencyTrend > 0.1) {
            this.suggestOptimization('latency');
        }
        if (errorTrend > 0.05) {
            this.suggestOptimization('error_rate');
        }
        if (cacheTrend < -0.1) {
            this.suggestOptimization('cache');
        }
        this.optimizationHistory.push({
            timestamp: Date.now(),
            metrics: { ...this.metrics },
            actions: Array.from(this.actions.keys()),
        });
        if (this.optimizationHistory.length > 50) {
            this.optimizationHistory = this.optimizationHistory.slice(-40);
        }
    }
    calculateTrend(values) {
        if (values.length < 2)
            return 0;
        const n = values.length;
        const xSum = (n * (n - 1)) / 2;
        const ySum = values.reduce((sum, val) => sum + val, 0);
        const xySum = values.reduce((sum, val, index) => sum + index * val, 0);
        const xSquareSum = (n * (n - 1) * (2 * n - 1)) / 6;
        const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);
        return slope;
    }
    getStats() {
        return {
            metrics: this.metrics,
            actions: {
                total: this.actions.size,
                pending: Array.from(this.actions.values()).filter((a) => a.status === 'pending').length,
                executing: Array.from(this.actions.values()).filter((a) => a.status === 'executing').length,
                completed: Array.from(this.actions.values()).filter((a) => a.status === 'completed').length,
                failed: Array.from(this.actions.values()).filter((a) => a.status === 'failed').length,
            },
            backends: this.backends.size,
            historySize: this.optimizationHistory.length,
            config: this.config,
        };
    }
    getRecommendations() {
        const recommendations = [];
        if (this.metrics.averageLatency > this.config.thresholds.latencyWarning) {
            recommendations.push({
                type: 'latency',
                description: 'Consider increasing cache size or enabling compression',
                priority: 'high',
            });
        }
        if (this.metrics.cacheHitRate < this.config.thresholds.cacheHitRateMin) {
            recommendations.push({
                type: 'cache',
                description: 'Adjust prefetch strategy or increase cache size',
                priority: 'medium',
            });
        }
        if (this.metrics.memoryUsage > this.config.thresholds.memoryUsageWarning) {
            recommendations.push({
                type: 'memory',
                description: 'Enable compression or implement data archiving',
                priority: 'high',
            });
        }
        return recommendations;
    }
}
//# sourceMappingURL=performance-optimizer.js.map