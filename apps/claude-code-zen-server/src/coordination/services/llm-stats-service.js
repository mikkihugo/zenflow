/**
 * LLM Statistics Service
 *
 * Tracks and analyzes LLM call routing, performance metrics, and usage patterns.
 * Provides comprehensive analytics for multi-provider LLM integration system.
 */
import { LLM_PROVIDER_CONFIG } from '../../config/llm-providers.config';
import { createLogger } from '../../core/logger';
const logger = createLogger('coordination-services-llm-stats');
export class LLMStatsService {
    callHistory = [];
    maxHistorySize = 10000; // Keep last 10k calls
    startTime = new Date();
    constructor() {
        logger.info('LLM Statistics Service initialized');
    }
    /**
     * Records an LLM call for statistics tracking
     */
    recordCall(request, result, routingInfo, metadata) {
        const record = {
            id: this.generateCallId(),
            timestamp: new Date(),
            requestType: metadata?.requestType || 'analyze',
            provider: result.provider,
            model: this.getProviderModel(result.provider),
            task: request.task,
            contextLength: (request.prompt || '').length,
            executionTime: result.executionTime,
            success: result.success,
            error: result.error,
            tokenUsage: metadata?.tokenUsage
                ? {
                    inputTokens: metadata.tokenUsage.inputTokens,
                    outputTokens: metadata.tokenUsage.outputTokens,
                    totalTokens: (metadata.tokenUsage.inputTokens || 0) +
                        (metadata.tokenUsage.outputTokens || 0),
                }
                : undefined,
            routingDecision: {
                originalPreference: routingInfo.originalPreference,
                finalProvider: result.provider,
                fallbackCount: routingInfo.fallbackCount,
                routingReason: routingInfo.routingReason,
            },
            performance: {
                responseTime: result.executionTime,
                throughputScore: this.calculateThroughputScore(result.provider),
                reliability: this.calculateReliabilityScore(result.provider),
                costEfficiency: this.calculateCostEfficiency(result.provider),
            },
            metadata: {
                requiresFileOps: request.requiresFileOperations,
                requiresCodebaseAware: request.task === 'domain-analysis' || request.task === 'code-review',
                taskComplexity: this.assessTaskComplexity(request),
                sessionId: metadata?.sessionId,
            },
        };
        this.addCallRecord(record);
        if (result.success) {
            logger.debug(`LLM call recorded: ${result.provider} → ${request.task} (${result.executionTime}ms)`);
        }
        else {
            logger.warn(`Failed LLM call recorded: ${result.provider} → ${request.task} (${result.error})`);
        }
    }
    /**
     * Gets comprehensive analytics for LLM system
     */
    getAnalytics(timeRange) {
        const range = timeRange || {
            start: this.startTime,
            end: new Date(),
        };
        const filteredCalls = this.callHistory.filter((call) => call.timestamp >= range.start && call.timestamp <= range.end);
        const providerStats = this.calculateProviderStats(filteredCalls);
        const routingStats = this.calculateRoutingStats(filteredCalls);
        const systemHealth = this.calculateSystemHealth(filteredCalls);
        const trends = this.calculateTrends(filteredCalls, range);
        const insights = this.generateInsights(providerStats, routingStats);
        return {
            timeRange: range,
            summary: {
                totalCalls: filteredCalls.length,
                successRate: filteredCalls.length > 0
                    ? filteredCalls.filter((c) => c.success).length /
                        filteredCalls.length
                    : 0,
                averageResponseTime: filteredCalls.length > 0
                    ? filteredCalls.reduce((sum, c) => sum + c.executionTime, 0) /
                        filteredCalls.length
                    : 0,
                totalTokensUsed: filteredCalls.reduce((sum, c) => sum + (c.tokenUsage?.totalTokens || 0), 0),
                costSavings: this.calculateCostSavings(filteredCalls),
            },
            providerStats,
            routingStats,
            systemHealth,
            trends,
            insights,
        };
    }
    /**
     * Gets real-time system health status
     */
    getSystemHealth() {
        const recentCalls = this.getRecentCalls(30); // Last 30 minutes
        return this.calculateSystemHealth(recentCalls);
    }
    /**
     * Gets detailed stats for a specific provider
     */
    getProviderStats(providerId) {
        const providerCalls = this.callHistory.filter((call) => call.provider === providerId);
        if (providerCalls.length === 0)
            return null;
        return this.calculateSingleProviderStats(providerId, providerCalls);
    }
    /**
     * Gets routing analysis and recommendations
     */
    getRoutingAnalysis() {
        const recentCalls = this.getRecentCalls(60); // Last hour
        const routingStats = this.calculateRoutingStats(recentCalls);
        const recommendations = [];
        if (routingStats.fallbackRate > 0.3) {
            recommendations.push('High fallback rate detected - consider adjusting provider priorities');
        }
        if (routingStats.optimalRoutingRate < 0.7) {
            recommendations.push('Suboptimal routing detected - review provider selection logic');
        }
        const topRoutes = routingStats.commonRoutingPatterns
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, 5)
            .map((pattern) => ({
            route: pattern.pattern.join(' → '),
            frequency: pattern.frequency,
            successRate: pattern.successRate,
        }));
        return {
            efficiency: routingStats.routingEfficiency,
            recommendations,
            topRoutes,
        };
    }
    /**
     * Exports statistics data for external analysis
     */
    exportStats(format) {
        if (format === 'csv') {
            return this.exportToCsv();
        }
        return JSON.stringify({
            metadata: {
                exportTime: new Date().toISOString(),
                totalRecords: this.callHistory.length,
                timeRange: {
                    start: this.startTime.toISOString(),
                    end: new Date().toISOString(),
                },
            },
            analytics: this.getAnalytics(),
            rawData: this.callHistory,
        }, null, 2);
    }
    /**
     * Clears statistics history (use with caution)
     */
    clearHistory() {
        const recordCount = this.callHistory.length;
        this.callHistory = [];
        logger.info(`Cleared ${recordCount} LLM call records`);
    }
    // Private helper methods
    generateCallId() {
        return `llm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    addCallRecord(record) {
        this.callHistory.push(record);
        // Keep history within limits
        if (this.callHistory.length > this.maxHistorySize) {
            this.callHistory = this.callHistory.slice(-this.maxHistorySize);
        }
    }
    getProviderModel(providerId) {
        const config = LLM_PROVIDER_CONFIG[providerId];
        return config?.defaultModel || 'unknown';
    }
    assessTaskComplexity(request) {
        const contextLength = (request.prompt || '').length;
        if (request.task === 'domain-analysis' || contextLength > 10000)
            return 'high';
        if (request.task === 'typescript-error-analysis' || contextLength > 5000)
            return 'medium';
        return 'low';
    }
    calculateThroughputScore(providerId) {
        const config = LLM_PROVIDER_CONFIG[providerId];
        const rateLimits = config?.rateLimits;
        if (!rateLimits)
            return 50; // Default score
        // Higher requests per minute = higher score
        return Math.min(100, (rateLimits.requestsPerMinute || 60) / 3);
    }
    calculateReliabilityScore(providerId) {
        const providerCalls = this.callHistory
            .filter((call) => call.provider === providerId)
            .slice(-100); // Last 100 calls
        if (providerCalls.length === 0)
            return 50;
        const successRate = providerCalls.filter((c) => c.success).length / providerCalls.length;
        return Math.round(successRate * 100);
    }
    calculateCostEfficiency(providerId) {
        // Cost efficiency based on provider characteristics
        const costScores = {
            'github-models': 100, // Free
            gemini: 80, // Generous free tier
            'claude-code': 70, // Local CLI, uses API credits
            'gemini-direct': 60, // Direct API usage
            copilot: 40, // Enterprise subscription
            'gemini-pro': 30, // Premium model
        };
        return costScores[providerId] || 50;
    }
    calculateProviderStats(calls) {
        const providers = Object.keys(LLM_PROVIDER_CONFIG);
        return providers.map((providerId) => {
            const providerCalls = calls.filter((c) => c.provider === providerId);
            return this.calculateSingleProviderStats(providerId, providerCalls);
        });
    }
    calculateSingleProviderStats(providerId, calls) {
        const config = LLM_PROVIDER_CONFIG[providerId];
        const successfulCalls = calls.filter((c) => c.success);
        const failedCalls = calls.filter((c) => !c.success);
        return {
            providerId,
            displayName: config?.displayName || providerId,
            totalCalls: calls.length,
            successfulCalls: successfulCalls.length,
            failedCalls: failedCalls.length,
            averageExecutionTime: calls.length > 0
                ? calls.reduce((sum, c) => sum + c.executionTime, 0) / calls.length
                : 0,
            averageContextLength: calls.length > 0
                ? calls.reduce((sum, c) => sum + c.contextLength, 0) / calls.length
                : 0,
            totalTokensUsed: calls.reduce((sum, c) => sum + (c.tokenUsage?.totalTokens || 0), 0),
            successRate: calls.length > 0 ? successfulCalls.length / calls.length : 0,
            averageResponseTime: successfulCalls.length > 0
                ? successfulCalls.reduce((sum, c) => sum + c.performance.responseTime, 0) / successfulCalls.length
                : 0,
            costEfficiency: calls.length > 0
                ? calls.reduce((sum, c) => sum + c.performance.costEfficiency, 0) /
                    calls.length
                : 0,
            reliability: this.calculateReliabilityScore(providerId),
            rateLimitHits: failedCalls.filter((c) => c.error?.includes('rate limit') || c.error?.includes('quota')).length,
            lastUsed: calls.length > 0
                ? new Date(Math.max(...calls.map((c) => c.timestamp.getTime())))
                : null,
            currentStatus: this.getProviderStatus(providerId, calls),
            preferredForTasks: this.getPreferredTasks(providerId, calls),
            performanceTrend: this.calculatePerformanceTrend(calls),
        };
    }
    calculateRoutingStats(calls) {
        const routingDecisions = calls.map((c) => c.routingDecision);
        const optimalRoutes = routingDecisions.filter((r) => r.fallbackCount === 0).length;
        const fallbackRoutes = routingDecisions.filter((r) => r.fallbackCount > 0).length;
        // Analyze routing patterns
        const patterns = new Map();
        calls.forEach((call) => {
            const pattern = [call.routingDecision.originalPreference, call.provider];
            const key = pattern.join('→');
            const existing = patterns.get(key) || { count: 0, successes: 0 };
            patterns.set(key, {
                count: existing.count + 1,
                successes: existing.successes + (call.success ? 1 : 0),
            });
        });
        const commonRoutingPatterns = Array.from(patterns.entries())
            .map(([pattern, stats]) => ({
            pattern: pattern.split('→'),
            frequency: stats.count,
            successRate: stats.count > 0 ? stats.successes / stats.count : 0,
        }))
            .sort((a, b) => b.frequency - a.frequency);
        return {
            totalRoutingDecisions: calls.length,
            optimalRoutingRate: calls.length > 0 ? optimalRoutes / calls.length : 0,
            fallbackRate: calls.length > 0 ? fallbackRoutes / calls.length : 0,
            averageFallbackSteps: fallbackRoutes > 0
                ? routingDecisions
                    .filter((r) => r.fallbackCount > 0)
                    .reduce((sum, r) => sum + r.fallbackCount, 0) / fallbackRoutes
                : 0,
            routingEfficiency: this.calculateRoutingEfficiency(calls),
            commonRoutingPatterns,
            taskTypeRouting: this.calculateTaskTypeRouting(calls),
        };
    }
    calculateSystemHealth(calls) {
        const recentCalls = calls.filter((c) => Date.now() - c.timestamp.getTime() < 30 * 60 * 1000 // Last 30 minutes
        );
        const successRate = recentCalls.length > 0
            ? recentCalls.filter((c) => c.success).length / recentCalls.length
            : 1;
        const averageLatency = recentCalls.length > 0
            ? recentCalls.reduce((sum, c) => sum + c.executionTime, 0) /
                recentCalls.length
            : 0;
        const errorRate = 1 - successRate;
        const activeProviders = new Set(recentCalls.map((c) => c.provider)).size;
        const systemThroughput = recentCalls.length / 30; // calls per minute
        // Calculate health score (0-100)
        let healthScore = 100;
        healthScore -= errorRate * 50; // Errors significantly impact health
        healthScore -= Math.min(averageLatency / 100, 30); // High latency reduces health
        healthScore = Math.max(0, Math.min(100, healthScore));
        let overallHealth;
        if (healthScore >= 90)
            overallHealth = 'excellent';
        else if (healthScore >= 75)
            overallHealth = 'good';
        else if (healthScore >= 60)
            overallHealth = 'fair';
        else if (healthScore >= 40)
            overallHealth = 'poor';
        else
            overallHealth = 'critical';
        const alerts = [];
        if (errorRate > 0.1) {
            alerts.push({
                level: 'warning',
                message: `High error rate detected: ${Math.round(errorRate * 100)}%`,
                timestamp: new Date(),
            });
        }
        if (averageLatency > 5000) {
            alerts.push({
                level: 'error',
                message: `High latency detected: ${Math.round(averageLatency)}ms average`,
                timestamp: new Date(),
            });
        }
        return {
            overallHealth,
            healthScore: Math.round(healthScore),
            activeProviders,
            providersInCooldown: this.getProvidersInCooldown().length,
            systemThroughput,
            averageLatency,
            errorRate,
            resourceUtilization: Math.min(100, systemThroughput * 2), // Rough estimate
            recommendations: this.generateHealthRecommendations(successRate, averageLatency, activeProviders),
            alerts,
        };
    }
    calculateTrends(calls, range) {
        // Implementation for trend calculation would go here
        // This is a complex calculation that analyzes time-series data
        return {
            callVolume: [],
            successRate: [],
            latency: [],
            providerUsage: {},
        };
    }
    generateInsights(providerStats, routingStats) {
        const sortedByReliability = [...providerStats].sort((a, b) => b.reliability - a.reliability);
        const sortedByEfficiency = [...providerStats].sort((a, b) => b.costEfficiency - a.costEfficiency);
        return {
            topPerformingProvider: sortedByReliability[0]?.providerId || 'none',
            mostEfficientProvider: sortedByEfficiency[0]?.providerId || 'none',
            bottlenecks: this.identifyBottlenecks(providerStats),
            optimizationOpportunities: this.identifyOptimizations(providerStats, routingStats),
        };
    }
    getRecentCalls(minutes) {
        const cutoff = new Date(Date.now() - minutes * 60 * 1000);
        return this.callHistory.filter((call) => call.timestamp >= cutoff);
    }
    getProviderStatus(providerId, calls) {
        const recentCalls = calls.filter((c) => Date.now() - c.timestamp.getTime() < 60 * 60 * 1000 // Last hour
        );
        if (recentCalls.length === 0)
            return 'disabled';
        const recentErrors = recentCalls.filter((c) => !c.success);
        const rateLimitErrors = recentErrors.filter((c) => c.error?.includes('rate limit') || c.error?.includes('quota'));
        if (rateLimitErrors.length > 0)
            return 'cooldown';
        if (recentErrors.length / recentCalls.length > 0.5)
            return 'error';
        return 'active';
    }
    getPreferredTasks(providerId, calls) {
        const taskCounts = new Map();
        calls.forEach((call) => {
            const count = taskCounts.get(call.task) || 0;
            taskCounts.set(call.task, count + 1);
        });
        return Array.from(taskCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([task]) => task);
    }
    calculatePerformanceTrend(calls) {
        if (calls.length < 10)
            return 'stable';
        const recent = calls.slice(-5);
        const earlier = calls.slice(-10, -5);
        const recentAvg = recent.reduce((sum, c) => sum + c.executionTime, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, c) => sum + c.executionTime, 0) / earlier.length;
        const improvement = (earlierAvg - recentAvg) / earlierAvg;
        if (improvement > 0.1)
            return 'improving';
        if (improvement < -0.1)
            return 'declining';
        return 'stable';
    }
    calculateRoutingEfficiency(calls) {
        if (calls.length === 0)
            return 100;
        const optimalCalls = calls.filter((c) => c.routingDecision.fallbackCount === 0).length;
        return (optimalCalls / calls.length) * 100;
    }
    calculateTaskTypeRouting(calls) {
        const taskTypes = new Set(calls.map((c) => c.task));
        const result = {};
        taskTypes.forEach((task) => {
            const taskCalls = calls.filter((c) => c.task === task);
            const providers = new Map();
            taskCalls.forEach((call) => {
                const existing = providers.get(call.provider) || {
                    count: 0,
                    successes: 0,
                };
                providers.set(call.provider, {
                    count: existing.count + 1,
                    successes: existing.successes + (call.success ? 1 : 0),
                });
            });
            const sorted = Array.from(providers.entries()).sort((a, b) => b[1].count - a[1].count);
            result[task] = {
                preferredProvider: sorted[0]?.[0] || 'none',
                alternativeProviders: sorted.slice(1).map(([provider]) => provider),
                successRate: taskCalls.length > 0
                    ? taskCalls.filter((c) => c.success).length / taskCalls.length
                    : 0,
            };
        });
        return result;
    }
    calculateCostSavings(calls) {
        // Estimated cost savings from smart routing vs always using premium providers
        return calls.length * 0.001; // Rough estimate
    }
    getProvidersInCooldown() {
        // This would check actual cooldown status - simplified for now
        return [];
    }
    generateHealthRecommendations(successRate, latency, activeProviders) {
        const recommendations = [];
        if (successRate < 0.9) {
            recommendations.push('Consider adjusting provider priorities to improve success rate');
        }
        if (latency > 3000) {
            recommendations.push('High latency detected - consider optimizing prompts or switching providers');
        }
        if (activeProviders < 2) {
            recommendations.push('Low provider diversity - configure additional backup providers');
        }
        return recommendations;
    }
    identifyBottlenecks(providerStats) {
        const bottlenecks = [];
        providerStats.forEach((provider) => {
            if (provider.successRate < 0.8) {
                bottlenecks.push(`${provider.displayName} has low success rate`);
            }
            if (provider.averageResponseTime > 5000) {
                bottlenecks.push(`${provider.displayName} has high latency`);
            }
        });
        return bottlenecks;
    }
    identifyOptimizations(providerStats, routingStats) {
        const optimizations = [];
        if (routingStats.fallbackRate > 0.2) {
            optimizations.push('Optimize provider selection to reduce fallback usage');
        }
        const underutilized = providerStats.filter((p) => p.totalCalls < 10 && p.successRate > 0.9);
        if (underutilized.length > 0) {
            optimizations.push(`Consider using underutilized high-performing providers: ${underutilized.map((p) => p.displayName).join(', ')}`);
        }
        return optimizations;
    }
    exportToCsv() {
        const headers = [
            'timestamp',
            'provider',
            'task',
            'success',
            'executionTime',
            'contextLength',
            'fallbackCount',
            'routingReason',
        ].join(',');
        const rows = this.callHistory.map((record) => [
            record.timestamp.toISOString(),
            record.provider,
            record.task,
            record.success,
            record.executionTime,
            record.contextLength,
            record.routingDecision.fallbackCount,
            `"${record.routingDecision.routingReason}"`,
        ].join(','));
        return [headers, ...rows].join('\n');
    }
}
export default LLMStatsService;
//# sourceMappingURL=llm-stats-service.js.map