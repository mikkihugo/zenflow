/**
 * @file Coordination system: performance-tracker.
 */
import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('coordination-hooks-performance-tracker');
export class HookPerformanceTracker {
    metricsStore;
    performanceThresholds;
    constructor() {
        this.metricsStore = new Map();
        this.performanceThresholds = {
            maxExecutionTime: 30000, // 30 seconds
            maxMemoryUsage: 512, // 512 MB
            maxCpuUsage: 80, // 80%
            minSuccessRate: 0.95, // 95%
            maxErrorRate: 0.05, // 5%
        };
    }
    async trackOperation(operation, result) {
        const metrics = {
            operationId: operation.id,
            type: operation.type,
            startTime: result?.startTime,
            endTime: result?.endTime,
            duration: result?.endTime.getTime() - result?.startTime.getTime(),
            success: result?.success,
            resourceUsage: result?.resourceUsage,
            ...(result?.error?.type ? { errorType: result.error.type } : {}),
            ...(result?.agentMetrics ? { agentPerformance: result.agentMetrics } : {}),
            qualityScore: await this.calculateQualityScore(operation, result),
            userSatisfaction: await this.estimateUserSatisfaction(operation, result),
        };
        // Store metrics
        this.metricsStore.set(operation.id, metrics);
        // Analyze for performance issues
        const issues = await this.detectPerformanceIssues(metrics);
        if (issues.length > 0) {
            await this.handlePerformanceIssues(operation.id, issues);
        }
        // Update agent performance profiles
        if (result?.agent && result?.agentMetrics) {
            await this.updateAgentProfile(result?.agent?.id, metrics);
        }
        // Generate real-time optimizations if needed
        if (this.shouldOptimizeInRealTime(metrics)) {
            const suggestions = await this.generateOptimizations(metrics);
            await this.notifyOptimizations(operation.id, suggestions);
        }
    }
    async generatePerformanceReport(timeframe) {
        const relevantMetrics = this.getMetricsInTimeframe(timeframe);
        if (relevantMetrics.length === 0) {
            return this.createEmptyReport(timeframe);
        }
        const totalOperations = relevantMetrics.length;
        const successfulOps = relevantMetrics.filter((m) => m.success);
        const successRate = successfulOps.length / totalOperations;
        const averageDuration = relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations;
        const bottlenecks = await this.identifyBottlenecks(relevantMetrics);
        const trends = await this.analyzeTrends(relevantMetrics, timeframe);
        const recommendations = await this.generateRecommendations(relevantMetrics);
        const agentPerformance = await this.analyzeAgentPerformance(relevantMetrics);
        return {
            timeframe,
            totalOperations,
            averageDuration,
            successRate,
            bottlenecks,
            trends,
            recommendations,
            agentPerformance,
        };
    }
    async getMetrics(filter) {
        let metrics = Array.from(this.metricsStore.values());
        if (filter.operationType) {
            metrics = metrics.filter((m) => m.type === filter.operationType);
        }
        if (filter.agentType && filter.agentType) {
            metrics = metrics.filter((m) => m.agentPerformance?.agentId.includes(filter.agentType));
        }
        if (filter.timeframe && filter.timeframe.start && filter.timeframe.end) {
            const { start, end } = filter.timeframe;
            metrics = metrics.filter((m) => m.startTime >= start && m.endTime <= end);
        }
        if (filter.successOnly) {
            metrics = metrics.filter((m) => m.success);
        }
        if (filter.minimumDuration) {
            metrics = metrics.filter((m) => m.duration >= filter.minimumDuration);
        }
        return metrics;
    }
    async analyzePerformanceTrends(timeframe) {
        const metrics = this.getMetricsInTimeframe(timeframe);
        const trends = await this.calculateTrends(metrics, timeframe);
        const predictions = await this.generatePredictions(trends, timeframe);
        const insights = await this.generateInsights(trends, metrics);
        return {
            trends,
            predictions,
            insights,
        };
    }
    async calculateQualityScore(operation, result) {
        let score = 0.5; // Base score
        // Success factor
        if (result?.success)
            score += 0.3;
        // Performance factor
        const expectedDuration = await this.getExpectedDuration(operation.type);
        const actualDuration = result?.endTime?.getTime() - result?.startTime?.getTime();
        if (actualDuration <= expectedDuration)
            score += 0.2;
        // Resource efficiency factor
        if (result?.resourceUsage?.memoryMB < this.performanceThresholds.maxMemoryUsage * 0.5)
            score += 0.1;
        if (result?.resourceUsage?.cpuPercent < this.performanceThresholds.maxCpuUsage * 0.5)
            score += 0.1;
        return Math.min(score, 1.0);
    }
    async estimateUserSatisfaction(_operation, result) {
        // Mock implementation - would integrate with user feedback systems
        let satisfaction = 0.8; // Base satisfaction
        if (!result?.success)
            satisfaction -= 0.4;
        if (result?.endTime?.getTime() - result?.startTime?.getTime() > 60000)
            satisfaction -= 0.2; // > 1 minute
        return Math.max(satisfaction, 0.1);
    }
    async detectPerformanceIssues(metrics) {
        const issues = [];
        if (metrics.duration > this.performanceThresholds.maxExecutionTime) {
            issues.push({
                type: 'SLOW_EXECUTION',
                severity: 'HIGH',
                description: `Operation took ${metrics.duration}ms, exceeding threshold of ${this.performanceThresholds.maxExecutionTime}ms`,
                suggestion: 'Consider optimization or breaking down the operation',
            });
        }
        if (metrics.resourceUsage.memoryMB > this.performanceThresholds.maxMemoryUsage) {
            issues.push({
                type: 'HIGH_MEMORY_USAGE',
                severity: 'MEDIUM',
                description: `Memory usage ${metrics.resourceUsage.memoryMB}MB exceeds threshold of ${this.performanceThresholds.maxMemoryUsage}MB`,
                suggestion: 'Optimize memory usage or increase available memory',
            });
        }
        if (metrics.resourceUsage.cpuPercent > this.performanceThresholds.maxCpuUsage) {
            issues.push({
                type: 'HIGH_CPU_USAGE',
                severity: 'MEDIUM',
                description: `CPU usage ${metrics.resourceUsage.cpuPercent}% exceeds threshold of ${this.performanceThresholds.maxCpuUsage}%`,
                suggestion: 'Optimize CPU-intensive operations',
            });
        }
        return issues;
    }
    async handlePerformanceIssues(operationId, issues) {
        // Log performance issues
        logger.warn(`Performance issues detected for operation ${operationId}:`, issues);
        // Would integrate with alerting system in real implementation
    }
    async updateAgentProfile(_agentId, _metrics) { }
    shouldOptimizeInRealTime(metrics) {
        return (metrics.duration > this.performanceThresholds.maxExecutionTime ||
            metrics.resourceUsage.memoryMB > this.performanceThresholds.maxMemoryUsage * 0.8);
    }
    async generateOptimizations(metrics) {
        const optimizations = [];
        if (metrics.duration > this.performanceThresholds.maxExecutionTime) {
            optimizations.push('Consider breaking down large operations into smaller chunks');
            optimizations.push('Implement caching for repeated operations');
        }
        if (metrics.resourceUsage.memoryMB > this.performanceThresholds.maxMemoryUsage * 0.8) {
            optimizations.push('Implement memory-efficient algorithms');
            optimizations.push('Add memory cleanup between operations');
        }
        return optimizations;
    }
    async notifyOptimizations(_operationId, _suggestions) { }
    getMetricsInTimeframe(timeframe) {
        return Array.from(this.metricsStore.values()).filter((metrics) => metrics.startTime >= timeframe.start && metrics.endTime <= timeframe.end);
    }
    createEmptyReport(timeframe) {
        return {
            timeframe,
            totalOperations: 0,
            averageDuration: 0,
            successRate: 0,
            bottlenecks: [],
            trends: [],
            recommendations: ['No operations found in the specified timeframe'],
            agentPerformance: [],
        };
    }
    async identifyBottlenecks(metrics) {
        const bottlenecks = [];
        // Analyze operation types
        const operationTypeMetrics = this.groupByOperationType(metrics);
        for (const [operationType, opMetrics] of operationTypeMetrics.entries()) {
            const avgDuration = opMetrics.reduce((sum, m) => sum + m.duration, 0) / opMetrics.length;
            if (avgDuration > this.performanceThresholds.maxExecutionTime) {
                bottlenecks.push({
                    type: 'OPERATION_TYPE_SLOW',
                    location: operationType,
                    severity: avgDuration / this.performanceThresholds.maxExecutionTime,
                    description: `${operationType} operations average ${avgDuration}ms`,
                    solution: 'Optimize operation type or increase timeout threshold',
                });
            }
        }
        return bottlenecks;
    }
    async analyzeTrends(metrics, _timeframe) {
        const trends = [];
        // Success rate trend
        const successRateTrend = this.calculateSuccessRateTrend(metrics);
        trends.push(successRateTrend);
        // Duration trend
        const durationTrend = this.calculateDurationTrend(metrics);
        trends.push(durationTrend);
        // Memory usage trend
        const memoryTrend = this.calculateMemoryTrend(metrics);
        trends.push(memoryTrend);
        return trends;
    }
    async generateRecommendations(metrics) {
        const recommendations = [];
        const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
        const successRate = metrics.filter((m) => m.success).length / metrics.length;
        if (successRate < this.performanceThresholds.minSuccessRate) {
            recommendations.push(`Success rate is ${(successRate * 100).toFixed(1)}%, consider improving error handling`);
        }
        if (avgDuration > this.performanceThresholds.maxExecutionTime) {
            recommendations.push(`Average duration ${avgDuration}ms exceeds threshold, consider performance optimization`);
        }
        const memoryUsage = metrics.reduce((sum, m) => sum + m.resourceUsage.memoryMB, 0) / metrics.length;
        if (memoryUsage > this.performanceThresholds.maxMemoryUsage * 0.8) {
            recommendations.push(`High memory usage detected (${memoryUsage}MB), consider memory optimization`);
        }
        return recommendations;
    }
    async analyzeAgentPerformance(metrics) {
        const agentMetrics = new Map();
        // Group metrics by agent
        metrics.forEach((metric) => {
            if (metric.agentPerformance) {
                const agentId = metric.agentPerformance.agentId;
                if (!agentMetrics.has(agentId)) {
                    agentMetrics.set(agentId, []);
                }
                agentMetrics.get(agentId)?.push(metric);
            }
        });
        const summaries = [];
        for (const [agentId, agentOps] of agentMetrics.entries()) {
            const successRate = agentOps.filter((op) => op.success).length / agentOps.length;
            const avgDuration = agentOps.reduce((sum, op) => sum + op.duration, 0) / agentOps.length;
            const avgQuality = agentOps.reduce((sum, op) => sum + (op.qualityScore || 0), 0) / agentOps.length;
            const avgSatisfaction = agentOps.reduce((sum, op) => sum + (op.userSatisfaction || 0), 0) / agentOps.length;
            summaries.push({
                agentId,
                agentType: this.extractAgentType(agentId),
                operationsCount: agentOps.length,
                averagePerformance: {
                    successRate,
                    averageExecutionTime: avgDuration,
                    qualityScore: avgQuality,
                    userSatisfaction: avgSatisfaction,
                    reliability: successRate, // Simplified
                },
                improvements: this.generateAgentImprovements(agentOps),
            });
        }
        return summaries;
    }
    extractAgentType(agentId) {
        // Extract agent type from ID (mock implementation)
        return agentId.split('-')[0] || 'coder';
    }
    generateAgentImprovements(agentOps) {
        const improvements = [];
        const avgDuration = agentOps.reduce((sum, op) => sum + op.duration, 0) / agentOps.length;
        const successRate = agentOps.filter((op) => op.success).length / agentOps.length;
        if (successRate < 0.9) {
            improvements.push('Improve error handling and operation reliability');
        }
        if (avgDuration > 20000) {
            improvements.push('Focus on performance optimization and efficiency');
        }
        return improvements;
    }
    groupByOperationType(metrics) {
        const grouped = new Map();
        metrics.forEach((metric) => {
            if (!grouped.has(metric.type)) {
                grouped.set(metric.type, []);
            }
            grouped.get(metric.type)?.push(metric);
        });
        return grouped;
    }
    calculateSuccessRateTrend(metrics) {
        const sortedMetrics = metrics.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        const midpoint = Math.floor(sortedMetrics.length / 2);
        const firstHalf = sortedMetrics.slice(0, midpoint);
        const secondHalf = sortedMetrics.slice(midpoint);
        const firstHalfSuccessRate = firstHalf.filter((m) => m.success).length / firstHalf.length;
        const secondHalfSuccessRate = secondHalf.filter((m) => m.success).length / secondHalf.length;
        const change = secondHalfSuccessRate - firstHalfSuccessRate;
        return {
            metric: 'Success Rate',
            direction: change > 0.05 ? 'improving' : change < -0.05 ? 'degrading' : 'stable',
            change,
            confidence: Math.min(sortedMetrics.length / 100, 1), // Higher confidence with more data
        };
    }
    calculateDurationTrend(metrics) {
        const sortedMetrics = metrics.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        const midpoint = Math.floor(sortedMetrics.length / 2);
        const firstHalf = sortedMetrics.slice(0, midpoint);
        const secondHalf = sortedMetrics.slice(midpoint);
        const firstHalfAvgDuration = firstHalf.reduce((sum, m) => sum + m.duration, 0) / firstHalf.length;
        const secondHalfAvgDuration = secondHalf.reduce((sum, m) => sum + m.duration, 0) / secondHalf.length;
        const change = (secondHalfAvgDuration - firstHalfAvgDuration) / firstHalfAvgDuration;
        return {
            metric: 'Average Duration',
            direction: change < -0.1 ? 'improving' : change > 0.1 ? 'degrading' : 'stable',
            change,
            confidence: Math.min(sortedMetrics.length / 100, 1),
        };
    }
    calculateMemoryTrend(metrics) {
        const sortedMetrics = metrics.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        const midpoint = Math.floor(sortedMetrics.length / 2);
        const firstHalf = sortedMetrics.slice(0, midpoint);
        const secondHalf = sortedMetrics.slice(midpoint);
        const firstHalfAvgMemory = firstHalf.reduce((sum, m) => sum + m.resourceUsage.memoryMB, 0) / firstHalf.length;
        const secondHalfAvgMemory = secondHalf.reduce((sum, m) => sum + m.resourceUsage.memoryMB, 0) / secondHalf.length;
        const change = (secondHalfAvgMemory - firstHalfAvgMemory) / firstHalfAvgMemory;
        return {
            metric: 'Memory Usage',
            direction: change < -0.1 ? 'improving' : change > 0.1 ? 'degrading' : 'stable',
            change,
            confidence: Math.min(sortedMetrics.length / 100, 1),
        };
    }
    async calculateTrends(metrics, _timeframe) {
        return [
            this.calculateSuccessRateTrend(metrics),
            this.calculateDurationTrend(metrics),
            this.calculateMemoryTrend(metrics),
        ];
    }
    async generatePredictions(trends, timeframe) {
        const predictions = [];
        trends.forEach((trend) => {
            if (trend.direction !== 'stable' && trend.confidence > 0.5) {
                const futureTimeframe = this.calculateFutureTimeframe(timeframe);
                const predictedChange = trend.change * 1.5; // Simple extrapolation
                predictions.push({
                    metric: trend.metric,
                    predictedValue: predictedChange,
                    timeframe: futureTimeframe,
                    confidence: trend.confidence * 0.8, // Lower confidence for predictions
                });
            }
        });
        return predictions;
    }
    async generateInsights(trends, metrics) {
        const insights = [];
        const improvingTrends = trends.filter((t) => t.direction === 'improving');
        const degradingTrends = trends.filter((t) => t.direction === 'degrading');
        if (improvingTrends.length > degradingTrends.length) {
            insights.push('Overall performance is improving across most metrics');
        }
        else if (degradingTrends.length > improvingTrends.length) {
            insights.push('Performance degradation detected across multiple metrics');
        }
        const successRate = metrics.filter((m) => m.success).length / metrics.length;
        if (successRate > 0.95) {
            insights.push('Excellent success rate indicates stable operations');
        }
        else if (successRate < 0.8) {
            insights.push('Low success rate requires immediate attention');
        }
        return insights;
    }
    calculateFutureTimeframe(currentTimeframe) {
        const duration = currentTimeframe?.end?.getTime() - currentTimeframe?.start?.getTime();
        const futureEnd = new Date(currentTimeframe?.end?.getTime() + duration);
        return `${currentTimeframe?.end?.toISOString()} to ${futureEnd.toISOString()}`;
    }
    async getExpectedDuration(operationType) {
        // Mock implementation - would use historical data or ML models
        const expectedDurations = {
            'file-edit': 5000,
            'code-generation': 15000,
            testing: 30000,
            analysis: 10000,
            default: 10000,
        };
        return expectedDurations[operationType] ?? expectedDurations['default'] ?? 10000;
    }
}
export class OperationPerformanceOptimizer {
    async optimizeOperation(operation) {
        const optimizations = await this.analyzeOptimizationOpportunities(operation);
        const optimizedParameters = await this.applyOptimizations(operation.parameters, optimizations);
        const estimatedSavings = await this.calculateSavings(operation, optimizations);
        return {
            originalOperation: operation,
            optimizedParameters,
            expectedImprovement: optimizations.reduce((sum, opt) => sum + opt.impact, 0),
            optimizationStrategy: optimizations.map((opt) => opt.description).join('; '),
            estimatedSavings,
        };
    }
    async predictPerformance(operation) {
        const baseEstimate = await this.getBasePerformanceEstimate(operation);
        const factors = await this.analyzePerformanceFactors(operation);
        // Apply factor adjustments
        let adjustedExecutionTime = baseEstimate.executionTime;
        let adjustedMemoryUsage = baseEstimate.memoryUsage;
        let adjustedCpuUsage = baseEstimate.cpuUsage;
        factors.forEach((factor) => {
            adjustedExecutionTime *= 1 + factor.impact;
            adjustedMemoryUsage *= 1 + factor.impact * 0.5;
            adjustedCpuUsage *= 1 + factor.impact * 0.3;
        });
        return {
            executionTime: adjustedExecutionTime,
            memoryUsage: adjustedMemoryUsage,
            cpuUsage: adjustedCpuUsage,
            confidence: 0.8,
            factors,
        };
    }
    async suggestImprovements(metrics) {
        const improvements = [];
        if (metrics.duration > 30000) {
            improvements.push({
                type: 'PERFORMANCE',
                description: 'Implement operation chunking to reduce execution time',
                impact: 0.4,
                effort: 0.6,
                priority: 0.8,
            });
        }
        if (metrics.resourceUsage.memoryMB > 256) {
            improvements.push({
                type: 'MEMORY',
                description: 'Optimize memory usage with streaming processing',
                impact: 0.3,
                effort: 0.4,
                priority: 0.6,
            });
        }
        if (!metrics.success && metrics.errorType) {
            improvements.push({
                type: 'RELIABILITY',
                description: 'Implement better error handling and retry logic',
                impact: 0.5,
                effort: 0.3,
                priority: 0.9,
            });
        }
        return improvements.sort((a, b) => b.priority - a.priority);
    }
    async analyzeBottlenecks(context) {
        const bottlenecks = [];
        let projectedImprovement = 0;
        // Analyze file type complexity
        if (context.fileType && ['cpp', 'rust'].includes(context.fileType)) {
            bottlenecks.push({
                type: 'COMPLEXITY',
                location: `File type: ${context.fileType}`,
                severity: 0.3,
                description: 'Complex file type may require additional processing time',
                solution: 'Use specialized agents or tools for this file type',
            });
            projectedImprovement += 0.2;
        }
        // Analyze operation complexity
        if (context.complexity === 'expert') {
            bottlenecks.push({
                type: 'COMPLEXITY',
                location: 'Operation complexity',
                severity: 0.4,
                description: 'Expert-level operation may require significant resources',
                solution: 'Assign to experienced agents or break down into smaller tasks',
            });
            projectedImprovement += 0.3;
        }
        const recommendations = bottlenecks.map((b) => b.solution || 'No specific solution identified');
        return {
            bottlenecks,
            recommendations,
            projectedImprovement,
        };
    }
    async analyzeOptimizationOpportunities(operation) {
        const opportunities = [];
        // Analyze parameter optimization
        if (Object.keys(operation.parameters).length > 10) {
            opportunities.push({
                type: 'PARAMETER_REDUCTION',
                description: 'Reduce parameter complexity',
                impact: 0.2,
            });
        }
        // Analyze caching opportunities
        if (operation.type.includes('analysis') || operation.type.includes('processing')) {
            opportunities.push({
                type: 'CACHING',
                description: 'Implement result caching',
                impact: 0.4,
            });
        }
        return opportunities;
    }
    async applyOptimizations(parameters, optimizations) {
        let optimizedParams = { ...parameters };
        for (const optimization of optimizations) {
            switch (optimization.type) {
                case 'PARAMETER_REDUCTION':
                    // Remove non-essential parameters
                    optimizedParams = this.reduceParameters(optimizedParams);
                    break;
                case 'CACHING':
                    // Add caching parameters
                    optimizedParams['enableCaching'] = true;
                    optimizedParams['cacheTimeout'] = 3600;
                    break;
            }
        }
        return optimizedParams;
    }
    async calculateSavings(_operation, optimizations) {
        const totalImpact = optimizations.reduce((sum, opt) => sum + opt.impact, 0);
        return {
            timeSeconds: 10 * totalImpact,
            memoryMB: 50 * totalImpact,
            cpuPercent: 15 * totalImpact,
            estimatedCost: 0.1 * totalImpact,
        };
    }
    async getBasePerformanceEstimate(_operation) {
        // Mock base estimates
        return {
            executionTime: 10000, // 10 seconds
            memoryUsage: 100, // 100 MB
            cpuUsage: 25, // 25%
            confidence: 0.7,
            factors: [],
        };
    }
    async analyzePerformanceFactors(operation) {
        const factors = [];
        if (operation.description.length > 500) {
            factors.push({
                name: 'Complex Description',
                impact: 0.2,
                description: 'Long operation description may indicate complexity',
            });
        }
        if (Object.keys(operation.parameters).length > 5) {
            factors.push({
                name: 'Multiple Parameters',
                impact: 0.1,
                description: 'Multiple parameters increase processing overhead',
            });
        }
        return factors;
    }
    reduceParameters(parameters) {
        // Simple implementation - remove null/undefined values
        const reduced = {};
        Object.entries(parameters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                reduced[key] = value;
            }
        });
        return reduced;
    }
}
