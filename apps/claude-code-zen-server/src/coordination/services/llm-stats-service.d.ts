/**
 * LLM Statistics Service
 *
 * Tracks and analyzes LLM call routing, performance metrics, and usage patterns.
 * Provides comprehensive analytics for multi-provider LLM integration system.
 */
import type { AnalysisRequest, AnalysisResult } from './llm-integration.service';
export interface LLMCallRecord {
    id: string;
    timestamp: Date;
    requestType: 'analyze' | 'analyzeSmart' | 'analyzeArchitectureAB';
    provider: 'claude-code' | 'gemini' | 'gemini-direct' | 'gemini-pro' | 'github-models' | 'copilot';
    model?: string;
    task: string;
    contextLength: number;
    executionTime: number;
    success: boolean;
    error?: string;
    errorDetails?: {
        errorType: 'rate_limit' | 'auth_error' | 'network_error' | 'timeout' | 'quota_exceeded' | 'provider_down' | 'parse_error' | 'other';
        statusCode?: number;
        retryable: boolean;
        providerMessage?: string;
        stackTrace?: string;
    };
    tokenUsage?: {
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
    };
    routingDecision: {
        originalPreference: string;
        finalProvider: string;
        fallbackCount: number;
        routingReason: string;
        attemptedProviders: string[];
        failureReasons: Record<string, string>;
    };
    performance: {
        responseTime: number;
        throughputScore: number;
        reliability: number;
        costEfficiency: number;
    };
    metadata?: {
        requiresFileOps: boolean;
        requiresCodebaseAware: boolean;
        taskComplexity: 'low' | 'medium' | 'high';
        sessionId?: string;
    };
}
export interface LLMError {
    id: string;
    timestamp: Date;
    provider: string;
    errorType: 'rate_limit' | 'auth_error' | 'network_error' | 'timeout' | 'quota_exceeded' | 'provider_down' | 'parse_error' | 'other';
    message: string;
    count: number;
    firstOccurred: Date;
    lastOccurred: Date;
    isActive: boolean;
    severity: 'low' | 'medium' | 'high' | 'critical';
    resolution?: string;
    affectedCalls: number;
}
export interface LLMProviderStats {
    providerId: string;
    displayName: string;
    totalCalls: number;
    successfulCalls: number;
    failedCalls: number;
    averageExecutionTime: number;
    averageContextLength: number;
    totalTokensUsed: number;
    successRate: number;
    averageResponseTime: number;
    costEfficiency: number;
    reliability: number;
    rateLimitHits: number;
    lastUsed: Date | null;
    currentStatus: 'active' | 'cooldown' | 'error' | 'disabled';
    cooldownUntil?: Date;
    preferredForTasks: string[];
    performanceTrend: 'improving' | 'stable' | 'declining';
}
export interface LLMRoutingStats {
    totalRoutingDecisions: number;
    optimalRoutingRate: number;
    fallbackRate: number;
    averageFallbackSteps: number;
    routingEfficiency: number;
    commonRoutingPatterns: Array<{
        pattern: string[];
        frequency: number;
        successRate: number;
    }>;
    taskTypeRouting: Record<string, {
        preferredProvider: string;
        alternativeProviders: string[];
        successRate: number;
    }>;
}
export interface LLMSystemHealth {
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    healthScore: number;
    activeProviders: number;
    providersInCooldown: number;
    systemThroughput: number;
    averageLatency: number;
    errorRate: number;
    resourceUtilization: number;
    recommendations: string[];
    alerts: Array<{
        level: 'info' | 'warning' | 'error' | 'critical';
        message: string;
        timestamp: Date;
        provider?: string;
    }>;
}
export interface LLMAnalytics {
    timeRange: {
        start: Date;
        end: Date;
    };
    summary: {
        totalCalls: number;
        successRate: number;
        averageResponseTime: number;
        totalTokensUsed: number;
        costSavings: number;
    };
    providerStats: LLMProviderStats[];
    routingStats: LLMRoutingStats;
    systemHealth: LLMSystemHealth;
    trends: {
        callVolume: Array<{
            timestamp: Date;
            count: number;
        }>;
        successRate: Array<{
            timestamp: Date;
            rate: number;
        }>;
        latency: Array<{
            timestamp: Date;
            ms: number;
        }>;
        providerUsage: Record<string, Array<{
            timestamp: Date;
            usage: number;
        }>>;
    };
    insights: {
        topPerformingProvider: string;
        mostEfficientProvider: string;
        bottlenecks: string[];
        optimizationOpportunities: string[];
    };
}
export declare class LLMStatsService {
    private callHistory;
    private maxHistorySize;
    private readonly startTime;
    constructor();
    /**
     * Records an LLM call for statistics tracking
     */
    recordCall(request: AnalysisRequest, result: AnalysisResult, routingInfo: {
        originalPreference: string;
        fallbackCount: number;
        routingReason: string;
    }, metadata?: {
        requestType?: 'analyze' | 'analyzeSmart' | 'analyzeArchitectureAB';
        tokenUsage?: {
            inputTokens?: number;
            outputTokens?: number;
        };
        sessionId?: string;
    }): void;
    /**
     * Gets comprehensive analytics for LLM system
     */
    getAnalytics(timeRange?: {
        start: Date;
        end: Date;
    }): LLMAnalytics;
    /**
     * Gets real-time system health status
     */
    getSystemHealth(): LLMSystemHealth;
    /**
     * Gets detailed stats for a specific provider
     */
    getProviderStats(providerId: string): LLMProviderStats | null;
    /**
     * Gets routing analysis and recommendations
     */
    getRoutingAnalysis(): {
        efficiency: number;
        recommendations: string[];
        topRoutes: Array<{
            route: string;
            frequency: number;
            successRate: number;
        }>;
    };
    /**
     * Exports statistics data for external analysis
     */
    exportStats(format: 'json' | 'csv'): string;
    /**
     * Clears statistics history (use with caution)
     */
    clearHistory(): void;
    private generateCallId;
    private addCallRecord;
    private getProviderModel;
    private assessTaskComplexity;
    private calculateThroughputScore;
    private calculateReliabilityScore;
    private calculateCostEfficiency;
    private calculateProviderStats;
    private calculateSingleProviderStats;
    private calculateRoutingStats;
    private calculateSystemHealth;
    private calculateTrends;
    private generateInsights;
    private getRecentCalls;
    private getProviderStatus;
    private getPreferredTasks;
    private calculatePerformanceTrend;
    private calculateRoutingEfficiency;
    private calculateTaskTypeRouting;
    private calculateCostSavings;
    private getProvidersInCooldown;
    private generateHealthRecommendations;
    private identifyBottlenecks;
    private identifyOptimizations;
    private exportToCsv;
}
export default LLMStatsService;
//# sourceMappingURL=llm-stats-service.d.ts.map