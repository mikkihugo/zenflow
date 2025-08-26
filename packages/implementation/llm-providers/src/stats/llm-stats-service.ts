/**
 * @fileoverview LLM Statistics Service
 *
 * Tracks and analyzes LLM call routing, performance metrics, and usage patterns.
 * Provides comprehensive analytics for multi-provider LLM integration system.
 */

import { getLogger } from '@claude-zen/foundation';
import { LLM_PROVIDER_CONFIG } from '../config/providers';
import type {
  AnalysisRequest,
  AnalysisResult,
  LLMAnalytics,
  LLMCallRecord,
  LLMProviderStats,
  LLMRoutingStats,
  LLMSystemHealth,
} from '../types/index';

const logger = getLogger('llm-routing-stats');

export class LLMStatsService {
  private callHistory: LLMCallRecord[] = [];
  private maxHistorySize = 10000; // Keep last 10k calls
  private readonly startTime = new Date();

  constructor() {
    logger.info('LLM Statistics Service initialized');
  }

  /**
   * Records an LLM call for statistics tracking
   */
  recordCall(
    request: AnalysisRequest,
    result: AnalysisResult,
    routingInfo: {
      originalPreference: string;
      fallbackCount: number;
      routingReason: string;
    },
    metadata?: {
      requestType?: 'analyze' | 'analyzeSmart' | 'analyzeArchitectureAB';
      tokenUsage?: { inputTokens?: number; outputTokens?: number };
      sessionId?: string;
    },
  ): void {
    const record: LLMCallRecord = {
      id: this.generateCallId(),
      timestamp: new Date(),
      requestType: metadata?.requestType||'analyze',
      provider: result.provider,
      model: this.getProviderModel(result.provider),
      task: request.task,
      contextLength: (request.prompt||'').length,
      executionTime: result.executionTime,
      success: result.success,
      error: result.error,
      tokenUsage: metadata?.tokenUsage
        ? {
          inputTokens: metadata.tokenUsage.inputTokens,
          outputTokens: metadata.tokenUsage.outputTokens,
          totalTokens:
              (metadata.tokenUsage.inputTokens||0) +
              (metadata.tokenUsage.outputTokens||0),
        }
        : undefined,
      routingDecision: {
        originalPreference: routingInfo.originalPreference,
        finalProvider: result.provider,
        fallbackCount: routingInfo.fallbackCount,
        routingReason: routingInfo.routingReason,
        attemptedProviders: [], // TODO: Track attempted providers
        failureReasons: {}, // TODO: Track failure reasons
      },
      performance: {
        responseTime: result.executionTime,
        throughputScore: this.calculateThroughputScore(result.provider),
        reliability: this.calculateReliabilityScore(result.provider),
        costEfficiency: this.calculateCostEfficiency(result.provider),
      },
      metadata: {
        requiresFileOps: request.requiresFileOperations,
        requiresCodebaseAware:
          request.task ==='domain-analysis'||request.task ==='code-review',
        taskComplexity: this.assessTaskComplexity(request),
        sessionId: metadata?.sessionId,
      },
    };

    this.addCallRecord(record);

    if (result.success) {
      logger.debug(
        `LLM call recorded: ${result.provider} → ${request.task} (${result.executionTime}ms)`,`
      );
    } else {
      logger.warn(
        `Failed LLM call recorded: ${result.provider} → ${request.task} (${result.error})`,`
      );
    }
  }

  /**
   * Gets comprehensive analytics for LLM system
   */
  getAnalytics(timeRange?: { start: Date; end: Date }): LLMAnalytics {
    const range = timeRange||{
      start: this.startTime,
      end: new Date(),
    };

    const filteredCalls = this.callHistory.filter(
      (call) => call.timestamp >= range.start && call.timestamp <= range.end,
    );

    const providerStats = this.calculateProviderStats(filteredCalls);
    const routingStats = this.calculateRoutingStats(filteredCalls);
    const systemHealth = this.calculateSystemHealth(filteredCalls);
    const trends = this.calculateTrends(filteredCalls, range);
    const insights = this.generateInsights(providerStats, routingStats);

    return {
      timeRange: range,
      summary: {
        totalCalls: filteredCalls.length,
        successRate:
          filteredCalls.length > 0
            ? filteredCalls.filter((c) => c.success).length /
              filteredCalls.length
            : 0,
        averageResponseTime:
          filteredCalls.length > 0
            ? filteredCalls.reduce((sum, c) => sum + c.executionTime, 0) /
              filteredCalls.length
            : 0,
        totalTokensUsed: filteredCalls.reduce(
          (sum, c) => sum + (c.tokenUsage?.totalTokens||0),
          0,
        ),
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
  getSystemHealth(): LLMSystemHealth {
    const recentCalls = this.getRecentCalls(30); // Last 30 minutes
    return this.calculateSystemHealth(recentCalls);
  }

  /**
   * Gets detailed stats for a specific provider
   */
  getProviderStats(providerId: string): LLMProviderStats|null {
    const providerCalls = this.callHistory.filter(
      (call) => call.provider === providerId,
    );
    if (providerCalls.length === 0) {
      return null;
    }

    return this.calculateSingleProviderStats(providerId, providerCalls);
  }

  /**
   * Gets routing analysis and recommendations
   */
  getRoutingAnalysis(): {
    efficiency: number;
    recommendations: string[];
    topRoutes: Array<{ route: string; frequency: number; successRate: number }>;
    } {
    const recentCalls = this.getRecentCalls(60); // Last hour
    const routingStats = this.calculateRoutingStats(recentCalls);

    const recommendations: string[] = [];

    if (routingStats.fallbackRate > 0.3) {
      recommendations.push('High fallback rate detected - consider adjusting provider priorities',
      );
    }

    if (routingStats.optimalRoutingRate < 0.7) {
      recommendations.push(
        'Suboptimal routing detected - review provider selection logic',
      );
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
  exportStats(format: 'json'|'csv'): string {;
    if (format === 'csv') {;
      return this.exportToCsv();
    }

    return JSON.stringify({
      {
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
      },
      null,
      2,
    );
  }

  /**
   * Clears statistics history (use with caution)
   */
  clearHistory(): void {
    const recordCount = this.callHistory.length;
    this.callHistory = [];
    logger.info(`Cleared ${recordCount} LLM call records`);`
  }

  // Private helper methods

  private generateCallId(): string {
    return `llm-${{Date}}.now()-${{Math}}.random().toString(36).substr(2, 9)`;`
  }

  private addCallRecord(record: LLMCallRecord): void {
    this.callHistory.push(record);

    // Keep history within limits
    if (this.callHistory.length > this.maxHistorySize) {
      this.callHistory = this.callHistory.slice(-this.maxHistorySize);
    }
  }

  private getProviderModel(providerId: string): string {
    const config = LLM_PROVIDER_CONFIG[providerId];
    return config?.defaultModel||'unknown;
  }

  private assessTaskComplexity(
    request: AnalysisRequest,
  ): 'low|medium|high'{;
    const contextLength = (request.prompt||'').length;

    if (request.task === 'domain-analysis'||contextLength > 10000) {;
      return'high;
    }
    if (request.task === 'typescript-error-analysis'||contextLength > 5000) {;
      return'medium;
    }
    return 'low;
  }

  private calculateThroughputScore(providerId: string): number {
    const config = LLM_PROVIDER_CONFIG[providerId];
    const rateLimits = config?.rateLimits;

    if (!rateLimits) {
      return 50;
    } // Default score

    // Higher requests per minute = higher score
    return Math.min(100, (rateLimits.requestsPerMinute||60) / 3);
  }

  private calculateReliabilityScore(providerId: string): number {
    const providerCalls = this.callHistory
      .filter((call) => call.provider === providerId)
      .slice(-100); // Last 100 calls

    if (providerCalls.length === 0) {
      return 50;
    }

    const successRate =
      providerCalls.filter((c) => c.success).length / providerCalls.length;
    return Math.round(successRate * 100);
  }

  private calculateCostEfficiency(providerId: string): number {
    // Cost efficiency based on provider characteristics
    const costScores: Record<string, number> = { 'github-models': 100, // Free;
      gemini: 80, // Generous free tier
      'claude-code': 70, // Local CLI, uses API credits;
      'gemini-direct': 60, // Direct API usage;
      copilot: 40, // Enterprise subscription
      'gemini-pro': 30, // Premium model;
    };

    return costScores[providerId]||50;
  }

  private calculateProviderStats(calls: LLMCallRecord[]): LLMProviderStats[] {
    const providers = Object.keys(LLM_PROVIDER_CONFIG);

    return providers.map((providerId) => {
      const providerCalls = calls.filter((c) => c.provider === providerId);
      return this.calculateSingleProviderStats(providerId, providerCalls);
    });
  }

  private calculateSingleProviderStats(
    providerId: string,
    calls: LLMCallRecord[],
  ): LLMProviderStats {
    const config = LLM_PROVIDER_CONFIG[providerId];
    const successfulCalls = calls.filter((c) => c.success);
    const failedCalls = calls.filter((c) => !c.success);

    return {
      providerId,
      displayName: config?.displayName||providerId,
      totalCalls: calls.length,
      successfulCalls: successfulCalls.length,
      failedCalls: failedCalls.length,
      averageExecutionTime:
        calls.length > 0
          ? calls.reduce((sum, c) => sum + c.executionTime, 0) / calls.length
          : 0,
      averageContextLength:
        calls.length > 0
          ? calls.reduce((sum, c) => sum + c.contextLength, 0) / calls.length
          : 0,
      totalTokensUsed: calls.reduce(
        (sum, c) => sum + (c.tokenUsage?.totalTokens||0),
        0,
      ),
      successRate: calls.length > 0 ? successfulCalls.length / calls.length : 0,
      averageResponseTime:
        successfulCalls.length > 0
          ? successfulCalls.reduce(
            (sum, c) => sum + c.performance.responseTime,
            0,
          ) / successfulCalls.length
          : 0,
      costEfficiency:
        calls.length > 0
          ? calls.reduce((sum, c) => sum + c.performance.costEfficiency, 0) /
            calls.length
          : 0,
      reliability: this.calculateReliabilityScore(providerId),
      rateLimitHits: failedCalls.filter(
        (c) => c.error?.includes('rate limit')||c.error?.includes('quota'),
      ).length,
      lastUsed:
        calls.length > 0
          ? new Date(Math.max(...calls.map((c) => c.timestamp.getTime())))
          : null,
      currentStatus: this.getProviderStatus(providerId, calls),
      preferredForTasks: this.getPreferredTasks(providerId, calls),
      performanceTrend: this.calculatePerformanceTrend(calls),
    };
  }

  private calculateRoutingStats(calls: LLMCallRecord[]): LLMRoutingStats {
    const routingDecisions = calls.map((c) => c.routingDecision);
    const optimalRoutes = routingDecisions.filter(
      (r) => r.fallbackCount === 0,
    ).length;
    const fallbackRoutes = routingDecisions.filter(
      (r) => r.fallbackCount > 0,
    ).length;

    // Analyze routing patterns
    const patterns = new Map<string, { count: number; successes: number }>();

    calls.forEach((call) => {
      const pattern = [call.routingDecision.originalPreference, call.provider];
      const key = pattern.join('→');
      const existing = patterns.get(key)||{ count: 0, successes: 0 };
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
      averageFallbackSteps:
        fallbackRoutes > 0
          ? routingDecisions
            .filter((r) => r.fallbackCount > 0)
            .reduce((sum, r) => sum + r.fallbackCount, 0) / fallbackRoutes
          : 0,
      routingEfficiency: this.calculateRoutingEfficiency(calls),
      commonRoutingPatterns,
      taskTypeRouting: this.calculateTaskTypeRouting(calls),
    };
  }

  private calculateSystemHealth(calls: LLMCallRecord[]): LLMSystemHealth {
    const recentCalls = calls.filter(
      (c) => Date.now() - c.timestamp.getTime() < 30 * 60 * 1000, // Last 30 minutes
    );

    const successRate =
      recentCalls.length > 0
        ? recentCalls.filter((c) => c.success).length / recentCalls.length
        : 1;

    const averageLatency =
      recentCalls.length > 0
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

    let overallHealth: LLMSystemHealth['overallHealth'];
    if (healthScore >= 90) {
      overallHealth = 'excellent';
    } else if (healthScore >= 75) {
      overallHealth = 'good';
    } else if (healthScore >= 60) {
      overallHealth = 'fair';
    } else if (healthScore >= 40) {
      overallHealth = 'poor';
    } else {
      overallHealth = 'critical';
    }

    const alerts: LLMSystemHealth['alerts'] = [];

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
      recommendations: this.generateHealthRecommendations(
        successRate,
        averageLatency,
        activeProviders,
      ),
      alerts,
    };
  }

  private calculateTrends(
    calls: LLMCallRecord[],
    range: { start: Date; end: Date },
  ): LLMAnalytics['trends'] {;
    // Calculate time intervals based on range
    const duration = range.end.getTime() - range.start.getTime();
    const intervalMs = Math.max(60000, duration / 24); // At least 1 minute intervals, max 24 points

    // Generate time buckets
    const buckets: Array<{ timestamp: Date; calls: LLMCallRecord[] }> = [];
    for (let time = range.start.getTime(); time < range.end.getTime(); time += intervalMs) {
      const bucketStart = new Date(time);
      const bucketEnd = new Date(Math.min(time + intervalMs, range.end.getTime()));
      const bucketCalls = calls.filter(
        (call) => call.timestamp >= bucketStart && call.timestamp < bucketEnd,
      );
      buckets.push({ timestamp: bucketStart, calls: bucketCalls });
    }

    // Calculate trends from buckets
    const callVolume = buckets.map((bucket) => ({
      timestamp: bucket.timestamp,
      count: bucket.calls.length,
    }));

    const successRate = buckets.map((bucket) => ({
      timestamp: bucket.timestamp,
      rate: bucket.calls.length > 0
        ? bucket.calls.filter((call) => call.success).length / bucket.calls.length
        : 0,
    }));

    const latency = buckets.map((bucket) => ({
      timestamp: bucket.timestamp,
      ms: bucket.calls.length > 0
        ? bucket.calls.reduce((sum, call) => sum + call.executionTime, 0) / bucket.calls.length
        : 0,
    }));

    // Provider usage trends
    const providerUsage: Record<string, Array<{ timestamp: Date; usage: number }>> = {};
    const providers = [...new Set(calls.map((call) => call.provider))];

    providers.forEach((provider) => {
      providerUsage[provider] = this.calculateProviderUsageTrend(buckets, provider);
    });

    return {
      callVolume,
      successRate,
      latency,
      providerUsage,
    };
  }

  private generateInsights(
    providerStats: LLMProviderStats[],
    routingStats: LLMRoutingStats,
  ): LLMAnalytics['insights'] {;
    const sortedByReliability = [...providerStats].sort(
      (a, b) => b.reliability - a.reliability,
    );
    const sortedByEfficiency = [...providerStats].sort(
      (a, b) => b.costEfficiency - a.costEfficiency,
    );

    return {
      topPerformingProvider: sortedByReliability[0]?.providerId||'none',
      mostEfficientProvider: sortedByEfficiency[0]?.providerId||'none',
      bottlenecks: this.identifyBottlenecks(providerStats),
      optimizationOpportunities: this.identifyOptimizations(
        providerStats,
        routingStats,
      ),
    };
  }

  private getRecentCalls(minutes: number): LLMCallRecord[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.callHistory.filter((call) => call.timestamp >= cutoff);
  }

  private getProviderStatus(
    _providerId: string,
    calls: LLMCallRecord[],
  ): LLMProviderStats['currentStatus'] {;
    const recentCalls = calls.filter(
      (c) => Date.now() - c.timestamp.getTime() < 60 * 60 * 1000, // Last hour
    );

    if (recentCalls.length === 0) {
      return 'disabled;
    }

    const recentErrors = recentCalls.filter((c) => !c.success);
    const rateLimitErrors = recentErrors.filter(
      (c) => c.error?.includes('rate limit')||c.error?.includes('quota'),
    );

    if (rateLimitErrors.length > 0) {
      return 'cooldown;
    }
    if (recentErrors.length / recentCalls.length > 0.5) {
      return 'error;
    }

    return 'active;
  }

  private getPreferredTasks(
    _providerId: string,
    calls: LLMCallRecord[],
  ): string[] {
    const taskCounts = new Map<string, number>();

    calls.forEach((call) => {
      const count = taskCounts.get(call.task)||0;
      taskCounts.set(call.task, count + 1);
    });

    return Array.from(taskCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([task]) => task);
  }

  private calculatePerformanceTrend(
    calls: LLMCallRecord[],
  ):'improving' | 'stable' | 'declining' {;
    if (calls.length < 10) {
      return 'stable';
    }

    const recent = calls.slice(-5);
    const earlier = calls.slice(-10, -5);

    const recentAvg =
      recent.reduce((sum, c) => sum + c.executionTime, 0) / recent.length;
    const earlierAvg =
      earlier.reduce((sum, c) => sum + c.executionTime, 0) / earlier.length;

    const improvement = (earlierAvg - recentAvg) / earlierAvg;

    if (improvement > 0.1) {
      return 'improving' | 'stable' | 'declining';
    }
    if (improvement < -0.1) {
      return 'declining;
    }
    return 'stable';
  }

  private calculateRoutingEfficiency(calls: LLMCallRecord[]): number {
    if (calls.length === 0) {
      return 100;
    }

    const optimalCalls = calls.filter(
      (c) => c.routingDecision.fallbackCount === 0,
    ).length;
    return (optimalCalls / calls.length) * 100;
  }

  private calculateTaskTypeRouting(calls: LLMCallRecord[]): Record<
    string,
    {
      preferredProvider: string;
      alternativeProviders: string[];
      successRate: number;
    }
  > {
    const taskTypes = new Set(calls.map((c) => c.task));
    const result: Record<
      string,
      {
        preferredProvider: string;
        alternativeProviders: string[];
        successRate: number;
      }
    > = {};

    taskTypes.forEach((task) => {
      const taskCalls = calls.filter((c) => c.task === task);
      const providers = new Map<string, { count: number; successes: number }>();

      taskCalls.forEach((call) => {
        const existing = providers.get(call.provider)||{
          count: 0,
          successes: 0,
        };
        providers.set(call.provider, {
          count: existing.count + 1,
          successes: existing.successes + (call.success ? 1 : 0),
        });
      });

      const sorted = Array.from(providers.entries()).sort(
        (a, b) => b[1].count - a[1].count,
      );

      result[task] = {
        preferredProvider: sorted[0]?.[0]||'none',
        alternativeProviders: sorted.slice(1).map(([provider]) => provider),
        successRate:
          taskCalls.length > 0
            ? taskCalls.filter((c) => c.success).length / taskCalls.length
            : 0,
      };
    });

    return result;
  }

  private calculateCostSavings(calls: LLMCallRecord[]): number {
    // Estimated cost savings from smart routing vs always using premium providers
    return calls.length * 0.001; // Rough estimate
  }

  private getProvidersInCooldown(): string[] {
    // This would check actual cooldown status - simplified for now
    return [];
  }

  private generateHealthRecommendations(
    successRate: number,
    latency: number,
    activeProviders: number,
  ): string[] {
    const recommendations: string[] = [];

    if (successRate < 0.9) {
      recommendations.push(
        'Consider adjusting provider priorities to improve success rate',
      );
    }

    if (latency > 3000) {
      recommendations.push(
        'High latency detected - consider optimizing prompts or switching providers',
      );
    }

    if (activeProviders < 2) {
      recommendations.push(
        'Low provider diversity - configure additional backup providers',
      );
    }

    return recommendations;
  }

  private identifyBottlenecks(providerStats: LLMProviderStats[]): string[] {
    const bottlenecks: string[] = [];

    providerStats.forEach((provider) => {
      if (provider.successRate < 0.8) {
        bottlenecks.push(`${provider.displayName} has low success rate`);`
      }
      if (provider.averageResponseTime > 5000) {
        bottlenecks.push(`${{provider}}.displayNamehas high latency`);`
      }
    });

    return bottlenecks;
  }

  private identifyOptimizations(
    providerStats: LLMProviderStats[],
    routingStats: LLMRoutingStats,
  ): string[] {
    const optimizations: string[] = [];

    if (routingStats.fallbackRate > 0.2) {
      optimizations.push(
        'Optimize provider selection to reduce fallback usage',
      );
    }

    const underutilized = providerStats.filter(
      (p) => p.totalCalls < 10 && p.successRate > 0.9,
    );
    if (underutilized.length > 0) {
      optimizations.push(
        `Consider using underutilized high-performing providers: ${underutilized.map((p) => p.displayName).join(', ')}`,`
      );
    }

    return optimizations;
  }

  private calculateProviderUsageTrend(
    buckets: Array<{ timestamp: Date; calls: LLMCallRecord[] }>,
    provider: string,
  ): Array<{ timestamp: Date; usage: number }> {
    return buckets.map((bucket) => {
      const providerCallCount = bucket.calls.reduce((count, call) => {
        return call.provider === provider ? count + 1 : count;
      }, 0);

      return {
        timestamp: bucket.timestamp,
        usage: providerCallCount,
      };
    });
  }

  private exportToCsv(): string {
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

    const rows = this.callHistory.map((record) =>
      [
        record.timestamp.toISOString(),
        record.provider,
        record.task,
        record.success,
        record.executionTime,
        record.contextLength,
        record.routingDecision.fallbackCount,
        `"${record.routingDecision.routingReason}"`,`
      ].join(','),
    );

    return [headers, ...rows].join('\n');
  }
}

export default LLMStatsService;
