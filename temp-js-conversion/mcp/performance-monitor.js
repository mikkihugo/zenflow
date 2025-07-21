"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPPerformanceMonitor = void 0;
/**
 * MCP Performance Monitoring and Optimization
 */
const node_events_1 = require("node:events");
const node_perf_hooks_1 = require("node:perf_hooks");
/**
 * MCP Performance Monitor
 * Provides comprehensive performance monitoring, alerting, and optimization suggestions
 */
class MCPPerformanceMonitor extends node_events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.requestMetrics = new Map();
        this.historicalMetrics = [];
        this.responseTimes = [];
        this.alertRules = new Map();
        this.activeAlerts = new Map();
        this.optimizationSuggestions = [];
        this.config = {
            metricsInterval: 10000, // 10 seconds
            alertCheckInterval: 5000, // 5 seconds
            maxHistorySize: 1000,
            maxResponseTimeHistory: 10000,
            cleanupInterval: 300000, // 5 minutes
            requestTimeout: 30000, // 30 seconds
        };
        this.setupDefaultAlertRules();
        this.startMonitoring();
    }
    /**
     * Record the start of a request
     */
    recordRequestStart(request, session) {
        const requestId = `${request.id}_${Date.now()}`;
        const metrics = {
            id: requestId,
            method: request.method,
            sessionId: session.id,
            startTime: node_perf_hooks_1.performance.now(),
            requestSize: this.calculateRequestSize(request),
        };
        this.requestMetrics.set(requestId, metrics);
        this.logger.debug('Request started', {
            requestId,
            method: request.method,
            sessionId: session.id,
        });
        return requestId;
    }
    /**
     * Record the completion of a request
     */
    recordRequestEnd(requestId, response, error) {
        const metrics = this.requestMetrics.get(requestId);
        if (!metrics) {
            this.logger.warn('Request metrics not found', { requestId });
            return;
        }
        const endTime = node_perf_hooks_1.performance.now();
        const duration = endTime - metrics.startTime;
        metrics.endTime = endTime;
        metrics.duration = duration;
        metrics.success = !error;
        metrics.error = error?.message;
        metrics.responseSize = response ? this.calculateResponseSize(response) : 0;
        // Add to response time history
        this.responseTimes.push(duration);
        if (this.responseTimes.length > this.config.maxResponseTimeHistory) {
            this.responseTimes.shift();
        }
        this.logger.debug('Request completed', {
            requestId,
            duration,
            success: metrics.success,
            error: metrics.error,
        });
        this.emit('requestCompleted', metrics);
        // Remove from active metrics after some time
        setTimeout(() => {
            this.requestMetrics.delete(requestId);
        }, 60000); // Keep for 1 minute
    }
    /**
     * Get current performance metrics
     */
    getCurrentMetrics() {
        const now = Date.now();
        const completedRequests = Array.from(this.requestMetrics.values())
            .filter(m => m.endTime !== undefined);
        const successfulRequests = completedRequests.filter(m => m.success);
        const errorRate = completedRequests.length > 0
            ? (completedRequests.length - successfulRequests.length) / completedRequests.length * 100
            : 0;
        // Calculate response time percentiles
        const sortedTimes = [...this.responseTimes].sort((a, b) => a - b);
        const p50 = this.getPercentile(sortedTimes, 0.5);
        const p95 = this.getPercentile(sortedTimes, 0.95);
        const p99 = this.getPercentile(sortedTimes, 0.99);
        // Calculate throughput (requests per second over last minute)
        const oneMinuteAgo = now - 60000;
        const recentRequests = completedRequests.filter(m => m.endTime && (m.startTime + oneMinuteAgo) > 0);
        const throughput = recentRequests.length / 60;
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const metrics = {
            requestCount: completedRequests.length,
            averageResponseTime: this.responseTimes.length > 0
                ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
                : 0,
            minResponseTime: sortedTimes.length > 0 ? sortedTimes[0] : 0,
            maxResponseTime: sortedTimes.length > 0 ? sortedTimes[sortedTimes.length - 1] : 0,
            p50ResponseTime: p50,
            p95ResponseTime: p95,
            p99ResponseTime: p99,
            errorRate,
            throughput,
            activeConnections: this.requestMetrics.size,
            memoryUsage: {
                heapUsed: memUsage.heapUsed,
                heapTotal: memUsage.heapTotal,
                external: memUsage.external,
                rss: memUsage.rss,
            },
            cpuUsage: {
                user: cpuUsage.user / 1000000, // Convert to seconds
                system: cpuUsage.system / 1000000,
            },
            timestamp: new Date(),
        };
        return metrics;
    }
    /**
     * Get historical metrics
     */
    getHistoricalMetrics(limit) {
        return limit
            ? this.historicalMetrics.slice(-limit)
            : [...this.historicalMetrics];
    }
    /**
     * Add custom alert rule
     */
    addAlertRule(rule) {
        this.alertRules.set(rule.id, rule);
        this.logger.info('Alert rule added', {
            id: rule.id,
            name: rule.name,
            metric: rule.metric,
            threshold: rule.threshold,
        });
    }
    /**
     * Remove alert rule
     */
    removeAlertRule(ruleId) {
        this.alertRules.delete(ruleId);
        // Resolve any active alerts for this rule
        for (const [alertId, alert] of this.activeAlerts.entries()) {
            if (alert.ruleId === ruleId) {
                this.resolveAlert(alertId);
            }
        }
        this.logger.info('Alert rule removed', { ruleId });
    }
    /**
     * Get active alerts
     */
    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }
    /**
     * Get optimization suggestions
     */
    getOptimizationSuggestions() {
        return [...this.optimizationSuggestions];
    }
    /**
     * Get performance summary
     */
    getPerformanceSummary() {
        const current = this.getCurrentMetrics();
        const trends = this.calculateTrends();
        return {
            current,
            trends,
            alerts: this.activeAlerts.size,
            suggestions: this.optimizationSuggestions.length,
        };
    }
    /**
     * Resolve an alert
     */
    resolveAlert(alertId) {
        const alert = this.activeAlerts.get(alertId);
        if (alert) {
            alert.resolvedAt = new Date();
            this.activeAlerts.delete(alertId);
            this.logger.info('Alert resolved', {
                alertId,
                ruleName: alert.ruleName,
                duration: alert.resolvedAt.getTime() - alert.triggeredAt.getTime(),
            });
            this.emit('alertResolved', alert);
        }
    }
    /**
     * Clear all optimization suggestions
     */
    clearOptimizationSuggestions() {
        this.optimizationSuggestions = [];
        this.logger.info('Optimization suggestions cleared');
    }
    /**
     * Stop monitoring
     */
    stop() {
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
            this.metricsTimer = undefined;
        }
        if (this.alertCheckTimer) {
            clearInterval(this.alertCheckTimer);
            this.alertCheckTimer = undefined;
        }
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
            this.cleanupTimer = undefined;
        }
        this.logger.info('Performance monitoring stopped');
    }
    startMonitoring() {
        // Collect metrics periodically
        this.metricsTimer = setInterval(() => {
            const metrics = this.getCurrentMetrics();
            this.historicalMetrics.push(metrics);
            // Keep only recent history
            if (this.historicalMetrics.length > this.config.maxHistorySize) {
                this.historicalMetrics.shift();
            }
            this.emit('metricsCollected', metrics);
        }, this.config.metricsInterval);
        // Check alerts periodically
        this.alertCheckTimer = setInterval(() => {
            this.checkAlerts();
        }, this.config.alertCheckInterval);
        // Cleanup old data
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
            this.generateOptimizationSuggestions();
        }, this.config.cleanupInterval);
        this.logger.info('Performance monitoring started');
    }
    setupDefaultAlertRules() {
        const defaultRules = [
            {
                id: 'high_response_time',
                name: 'High Response Time',
                metric: 'averageResponseTime',
                operator: 'gt',
                threshold: 5000, // 5 seconds
                duration: 30000, // 30 seconds
                enabled: true,
                severity: 'medium',
                actions: ['log', 'notify'],
            },
            {
                id: 'high_error_rate',
                name: 'High Error Rate',
                metric: 'errorRate',
                operator: 'gt',
                threshold: 10, // 10%
                duration: 60000, // 1 minute
                enabled: true,
                severity: 'high',
                actions: ['log', 'notify', 'alert'],
            },
            {
                id: 'low_throughput',
                name: 'Low Throughput',
                metric: 'throughput',
                operator: 'lt',
                threshold: 1, // 1 request per second
                duration: 120000, // 2 minutes
                enabled: true,
                severity: 'medium',
                actions: ['log', 'notify'],
            },
            {
                id: 'high_memory_usage',
                name: 'High Memory Usage',
                metric: 'memoryUsage.heapUsed',
                operator: 'gt',
                threshold: 1024 * 1024 * 1024, // 1GB
                duration: 300000, // 5 minutes
                enabled: true,
                severity: 'high',
                actions: ['log', 'notify', 'alert'],
            },
        ];
        for (const rule of defaultRules) {
            this.alertRules.set(rule.id, rule);
        }
    }
    checkAlerts() {
        const metrics = this.getCurrentMetrics();
        for (const rule of this.alertRules.values()) {
            if (!rule.enabled)
                continue;
            const value = this.getMetricValue(metrics, rule.metric);
            const triggered = this.evaluateCondition(value, rule.operator, rule.threshold);
            const existingAlert = Array.from(this.activeAlerts.values())
                .find(a => a.ruleId === rule.id && !a.resolvedAt);
            if (triggered && !existingAlert) {
                // Create new alert
                const alert = {
                    id: `alert_${rule.id}_${Date.now()}`,
                    ruleId: rule.id,
                    ruleName: rule.name,
                    severity: rule.severity,
                    message: `${rule.name}: ${rule.metric} is ${value} (threshold: ${rule.threshold})`,
                    triggeredAt: new Date(),
                    currentValue: value,
                    threshold: rule.threshold,
                };
                this.activeAlerts.set(alert.id, alert);
                this.logger.warn('Alert triggered', {
                    alertId: alert.id,
                    ruleName: rule.name,
                    metric: rule.metric,
                    value,
                    threshold: rule.threshold,
                });
                this.emit('alertTriggered', alert);
            }
            else if (!triggered && existingAlert) {
                // Resolve existing alert
                this.resolveAlert(existingAlert.id);
            }
        }
    }
    getMetricValue(metrics, path) {
        const parts = path.split('.');
        let value = metrics;
        for (const part of parts) {
            value = value?.[part];
            if (value === undefined)
                break;
        }
        return typeof value === 'number' ? value : 0;
    }
    evaluateCondition(value, operator, threshold) {
        switch (operator) {
            case 'gt': return value > threshold;
            case 'gte': return value >= threshold;
            case 'lt': return value < threshold;
            case 'lte': return value <= threshold;
            case 'eq': return value === threshold;
            default: return false;
        }
    }
    getPercentile(sortedArray, percentile) {
        if (sortedArray.length === 0)
            return 0;
        const index = Math.ceil(sortedArray.length * percentile) - 1;
        return sortedArray[Math.max(0, Math.min(index, sortedArray.length - 1))];
    }
    calculateTrends() {
        const recentMetrics = this.historicalMetrics.slice(-10); // Last 10 data points
        if (recentMetrics.length < 2) {
            return {
                responseTime: 'stable',
                throughput: 'stable',
                errorRate: 'stable',
            };
        }
        const first = recentMetrics[0];
        const last = recentMetrics[recentMetrics.length - 1];
        return {
            responseTime: this.getTrend(first.averageResponseTime, last.averageResponseTime, true),
            throughput: this.getTrend(first.throughput, last.throughput, false),
            errorRate: this.getTrend(first.errorRate, last.errorRate, true),
        };
    }
    getTrend(oldValue, newValue, lowerIsBetter) {
        const change = (newValue - oldValue) / oldValue;
        const threshold = 0.1; // 10% change threshold
        if (Math.abs(change) < threshold) {
            return 'stable';
        }
        const improving = lowerIsBetter ? change < 0 : change > 0;
        return improving ? 'improving' : 'degrading';
    }
    generateOptimizationSuggestions() {
        const metrics = this.getCurrentMetrics();
        const suggestions = [];
        // High response time suggestion
        if (metrics.averageResponseTime > 2000) {
            suggestions.push({
                id: `opt_response_time_${Date.now()}`,
                type: 'performance',
                priority: 'high',
                title: 'Optimize Response Time',
                description: 'Average response time is above 2 seconds',
                impact: 'Improve user experience and system throughput',
                implementation: 'Consider implementing caching, optimizing database queries, or adding connection pooling',
                estimatedImprovement: '30-50% response time reduction',
                detectedAt: new Date(),
                metrics: { averageResponseTime: metrics.averageResponseTime },
            });
        }
        // High memory usage suggestion
        if (metrics.memoryUsage.heapUsed > 512 * 1024 * 1024) { // 512MB
            suggestions.push({
                id: `opt_memory_${Date.now()}`,
                type: 'memory',
                priority: 'medium',
                title: 'Optimize Memory Usage',
                description: 'Heap memory usage is high',
                impact: 'Prevent memory leaks and improve stability',
                implementation: 'Review memory usage patterns, implement object pooling, or add garbage collection tuning',
                estimatedImprovement: '20-30% memory reduction',
                detectedAt: new Date(),
                metrics: { heapUsed: metrics.memoryUsage.heapUsed },
            });
        }
        // Low throughput suggestion
        if (metrics.throughput < 5 && metrics.requestCount > 100) {
            suggestions.push({
                id: `opt_throughput_${Date.now()}`,
                type: 'throughput',
                priority: 'medium',
                title: 'Improve Throughput',
                description: 'Request throughput is below optimal levels',
                impact: 'Handle more concurrent requests efficiently',
                implementation: 'Consider horizontal scaling, load balancing, or request batching',
                estimatedImprovement: '2-3x throughput increase',
                detectedAt: new Date(),
                metrics: { throughput: metrics.throughput },
            });
        }
        // Add only new suggestions
        for (const suggestion of suggestions) {
            const exists = this.optimizationSuggestions.some(s => s.type === suggestion.type && s.title === suggestion.title);
            if (!exists) {
                this.optimizationSuggestions.push(suggestion);
                this.emit('optimizationSuggestion', suggestion);
            }
        }
        // Keep only recent suggestions (last 24 hours)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.optimizationSuggestions = this.optimizationSuggestions.filter(s => s.detectedAt > dayAgo);
    }
    cleanup() {
        const now = Date.now();
        // Clean up old request metrics
        for (const [id, metrics] of this.requestMetrics.entries()) {
            if (now - metrics.startTime > this.config.requestTimeout) {
                this.requestMetrics.delete(id);
            }
        }
        // Clean up old response times
        if (this.responseTimes.length > this.config.maxResponseTimeHistory) {
            this.responseTimes = this.responseTimes.slice(-this.config.maxResponseTimeHistory);
        }
    }
    calculateRequestSize(request) {
        return JSON.stringify(request).length;
    }
    calculateResponseSize(response) {
        return JSON.stringify(response).length;
    }
}
exports.MCPPerformanceMonitor = MCPPerformanceMonitor;
