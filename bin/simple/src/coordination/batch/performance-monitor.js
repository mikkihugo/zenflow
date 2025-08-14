import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('BatchPerformanceMonitor');
export class BatchPerformanceMonitor {
    metricsHistory;
    maxHistorySize;
    performanceBaseline;
    constructor(maxHistorySize = 1000) {
        this.metricsHistory = [];
        this.maxHistorySize = maxHistorySize;
        this.performanceBaseline = null;
    }
    recordBatchExecution(summary, resourceUsage) {
        const metrics = {
            executionMode: 'batch',
            operationCount: summary.totalOperations,
            totalExecutionTime: summary.totalExecutionTime,
            averageExecutionTime: summary.averageExecutionTime,
            successRate: summary.totalOperations > 0
                ? summary.successfulOperations / summary.totalOperations
                : 0,
            throughput: summary.totalExecutionTime > 0
                ? (summary.successfulOperations / summary.totalExecutionTime) * 1000
                : 0,
            memoryUsage: resourceUsage?.memory ?? 0,
            cpuUsage: resourceUsage?.cpu ?? 0,
            timestamp: Date.now(),
        };
        this.addMetrics(metrics);
        logger.debug('Recorded batch execution metrics', {
            operationCount: metrics.operationCount,
            totalTime: metrics.totalExecutionTime,
            throughput: metrics.throughput.toFixed(2),
            successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
        });
        return metrics;
    }
    recordSequentialExecution(operationCount, executionTime, successfulOperations, resourceUsage) {
        const metrics = {
            executionMode: 'sequential',
            operationCount,
            totalExecutionTime: executionTime,
            averageExecutionTime: operationCount > 0 ? executionTime / operationCount : 0,
            successRate: operationCount > 0 ? successfulOperations / operationCount : 0,
            throughput: executionTime > 0 ? (successfulOperations / executionTime) * 1000 : 0,
            memoryUsage: resourceUsage?.memory ?? 0,
            cpuUsage: resourceUsage?.cpu ?? 0,
            timestamp: Date.now(),
        };
        this.addMetrics(metrics);
        logger.debug('Recorded sequential execution metrics', {
            operationCount: metrics.operationCount,
            totalTime: metrics.totalExecutionTime,
            throughput: metrics.throughput.toFixed(2),
            successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
        });
        return metrics;
    }
    comparePerformance(batchMetrics, sequentialMetrics) {
        const speedImprovement = sequentialMetrics.totalExecutionTime > 0
            ? sequentialMetrics.totalExecutionTime / batchMetrics.totalExecutionTime
            : 1;
        const throughputImprovement = sequentialMetrics.throughput > 0
            ? batchMetrics.throughput / sequentialMetrics.throughput
            : 1;
        const memoryEfficiency = sequentialMetrics.memoryUsage > 0
            ? sequentialMetrics.memoryUsage / Math.max(batchMetrics.memoryUsage, 1)
            : 1;
        const cpuEfficiency = sequentialMetrics.cpuUsage > 0
            ? sequentialMetrics.cpuUsage / Math.max(batchMetrics.cpuUsage, 1)
            : 1;
        const resourceEfficiency = (memoryEfficiency + cpuEfficiency) / 2;
        const tokenReduction = Math.min(35, Math.max(0, (speedImprovement - 1) * 12));
        const recommendations = this.generateRecommendations(speedImprovement, throughputImprovement, resourceEfficiency, batchMetrics, sequentialMetrics);
        return {
            batchMetrics,
            sequentialMetrics,
            speedImprovement: Math.round(speedImprovement * 100) / 100,
            throughputImprovement: Math.round(throughputImprovement * 100) / 100,
            resourceEfficiency: Math.round(resourceEfficiency * 100) / 100,
            tokenReduction: Math.round(tokenReduction * 10) / 10,
            recommendations,
        };
    }
    generateRecommendations(speedImprovement, throughputImprovement, resourceEfficiency, batchMetrics, _sequentialMetrics) {
        const recommendations = [];
        if (speedImprovement < 2.0) {
            recommendations.push('Consider increasing batch size or optimizing operation concurrency');
        }
        else if (speedImprovement > 4.0) {
            recommendations.push('Excellent speed improvement achieved! Current configuration is optimal');
        }
        if (throughputImprovement < 1.5) {
            recommendations.push('Low throughput improvement detected. Check for bottlenecks in operation execution');
        }
        if (resourceEfficiency < 0.8) {
            recommendations.push('High resource usage detected. Consider reducing batch concurrency or optimizing operations');
        }
        if (batchMetrics.successRate < 0.95) {
            recommendations.push('Low success rate in batch execution. Check error handling and operation dependencies');
        }
        if (batchMetrics.operationCount < 3) {
            recommendations.push('Small batch size detected. Batch operations are most effective with 5+ operations');
        }
        else if (batchMetrics.operationCount > 20) {
            recommendations.push('Large batch size detected. Consider splitting into smaller batches for better error handling');
        }
        return recommendations;
    }
    getPerformanceTrends(metric, hours = 24) {
        const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
        const recentMetrics = this.metricsHistory.filter((m) => m.timestamp >= cutoffTime);
        if (recentMetrics.length < 2) {
            return {
                metric,
                values: [],
                timestamps: [],
                trend: 'stable',
                changeRate: 0,
            };
        }
        const values = recentMetrics.map((m) => m[metric]);
        const timestamps = recentMetrics.map((m) => m.timestamp);
        const trend = this.calculateTrend(values, timestamps);
        const changeRate = this.calculateChangeRate(values, hours);
        return {
            metric,
            values,
            timestamps,
            trend,
            changeRate,
        };
    }
    calculateTrend(values, timestamps) {
        if (values.length < 2)
            return 'stable';
        const n = values.length;
        const sumX = timestamps.reduce((sum, t) => sum + t, 0);
        const sumY = values.reduce((sum, v) => sum + v, 0);
        const sumXY = timestamps.reduce((sum, t, i) => sum + t * (values[i] ?? 0), 0);
        const sumXX = timestamps.reduce((sum, t) => sum + t * t, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        if (Math.abs(slope) < 0.001)
            return 'stable';
        return slope > 0 ? 'improving' : 'declining';
    }
    calculateChangeRate(values, hours) {
        if (values.length < 2)
            return 0;
        const firstValue = values[0];
        const lastValue = values[values.length - 1];
        if (firstValue === undefined || firstValue === 0)
            return 0;
        if (lastValue === undefined)
            return 0;
        const totalChange = ((lastValue - firstValue) / firstValue) * 100;
        return totalChange / hours;
    }
    getPerformanceSummary(hours = 24) {
        const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
        const recentMetrics = this.metricsHistory.filter((m) => m.timestamp >= cutoffTime);
        const batchMetrics = recentMetrics.filter((m) => m.executionMode === 'batch');
        const sequentialMetrics = recentMetrics.filter((m) => m.executionMode === 'sequential');
        let averageSpeedImprovement = 1;
        let averageTokenReduction = 0;
        if (batchMetrics.length > 0 && sequentialMetrics.length > 0) {
            const speedImprovements = [];
            const tokenReductions = [];
            batchMetrics.forEach((batchMetric) => {
                const closestSequential = sequentialMetrics.reduce((closest, current) => {
                    const currentDiff = Math.abs(current?.timestamp - batchMetric.timestamp);
                    const closestDiff = Math.abs(closest.timestamp - batchMetric.timestamp);
                    return currentDiff < closestDiff ? current : closest;
                });
                const comparison = this.comparePerformance(batchMetric, closestSequential);
                speedImprovements.push(comparison.speedImprovement);
                tokenReductions.push(comparison.tokenReduction);
            });
            averageSpeedImprovement =
                speedImprovements.reduce((sum, val) => sum + val, 0) /
                    speedImprovements.length;
            averageTokenReduction =
                tokenReductions.reduce((sum, val) => sum + val, 0) /
                    tokenReductions.length;
        }
        const recommendations = this.generateSummaryRecommendations(batchMetrics.length, sequentialMetrics.length, averageSpeedImprovement, averageTokenReduction);
        return {
            totalExecutions: recentMetrics.length,
            batchExecutions: batchMetrics.length,
            sequentialExecutions: sequentialMetrics.length,
            averageSpeedImprovement: Math.round(averageSpeedImprovement * 100) / 100,
            averageTokenReduction: Math.round(averageTokenReduction * 10) / 10,
            recommendations,
        };
    }
    generateSummaryRecommendations(batchCount, sequentialCount, avgSpeedImprovement, avgTokenReduction) {
        const recommendations = [];
        if (batchCount === 0) {
            recommendations.push('No batch executions detected. Consider using batch operations for better performance');
        }
        else if (batchCount / (batchCount + sequentialCount) < 0.5) {
            recommendations.push('Low batch execution ratio. Consider batching more operations together');
        }
        if (avgSpeedImprovement < 2.8) {
            recommendations.push('Speed improvement below claude-zen target (2.8x). Optimize batch configuration');
        }
        if (avgTokenReduction < 20) {
            recommendations.push('Token reduction below optimal. Consider larger batch sizes');
        }
        if (recommendations.length === 0) {
            recommendations.push('Performance metrics are within expected ranges. Continue current batch strategy');
        }
        return recommendations;
    }
    setBaseline(metrics) {
        this.performanceBaseline = { ...metrics };
        logger.info('Performance baseline set', {
            mode: metrics.executionMode,
            throughput: metrics.throughput.toFixed(2),
            successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
        });
    }
    compareToBaseline(currentMetrics) {
        if (!this.performanceBaseline)
            return null;
        const improvement = this.performanceBaseline.throughput > 0
            ? currentMetrics?.throughput / this.performanceBaseline.throughput
            : 1;
        let recommendation;
        if (improvement > 1.1) {
            recommendation =
                'Performance improved significantly compared to baseline';
        }
        else if (improvement < 0.9) {
            recommendation =
                'Performance degraded compared to baseline. Investigate potential issues';
        }
        else {
            recommendation = 'Performance is stable compared to baseline';
        }
        return {
            improvement: Math.round(improvement * 100) / 100,
            recommendation,
        };
    }
    addMetrics(metrics) {
        this.metricsHistory.push(metrics);
        if (this.metricsHistory.length > this.maxHistorySize) {
            this.metricsHistory.splice(0, this.metricsHistory.length - this.maxHistorySize);
        }
    }
    getMetricsHistory() {
        return [...this.metricsHistory];
    }
    clearHistory() {
        this.metricsHistory.length = 0;
        this.performanceBaseline = null;
        logger.info('Performance metrics history cleared');
    }
    exportPerformanceData() {
        return {
            metrics: [...this.metricsHistory],
            baseline: this.performanceBaseline
                ? { ...this.performanceBaseline }
                : null,
            summary: this.getPerformanceSummary(),
        };
    }
}
//# sourceMappingURL=performance-monitor.js.map