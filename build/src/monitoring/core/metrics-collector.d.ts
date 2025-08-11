/**
 * Real-Time Metrics Collection System.
 * Comprehensive system-wide performance monitoring.
 */
/**
 * @file Metrics-collector implementation.
 */
import { EventEmitter } from 'node:events';
export interface SystemMetrics {
    timestamp: number;
    cpu: {
        usage: number;
        loadAverage: number[];
        cores: number;
    };
    memory: {
        total: number;
        used: number;
        free: number;
        percentage: number;
        heapUsed: number;
        heapTotal: number;
    };
    io: {
        readBytes: number;
        writeBytes: number;
        readOps: number;
        writeOps: number;
    };
    network: {
        bytesIn: number;
        bytesOut: number;
        connectionsActive: number;
    };
}
export interface FactMetrics {
    timestamp: number;
    cache: {
        hitRate: number;
        missRate: number;
        totalRequests: number;
        averageResponseTime: number;
    };
    storage: {
        documentsStored: number;
        storageSize: number;
        compressionRatio: number;
        indexingTime: number;
    };
    queries: {
        totalQueries: number;
        averageQueryTime: number;
        slowQueries: number;
        errorRate: number;
    };
}
export interface RagMetrics {
    timestamp: number;
    vectors: {
        totalVectors: number;
        dimensionality: number;
        indexSize: number;
        queryLatency: number;
    };
    retrieval: {
        averageRetrievalTime: number;
        retrievalAccuracy: number;
        contextRelevance: number;
        chunkUtilization: number;
    };
    embedding: {
        embeddingLatency: number;
        batchSize: number;
        throughput: number;
        errorRate: number;
    };
}
export interface SwarmMetrics {
    timestamp: number;
    agents: {
        totalAgents: number;
        activeAgents: number;
        idleAgents: number;
        failedAgents: number;
    };
    coordination: {
        messagesSent: number;
        messagesReceived: number;
        averageLatency: number;
        consensusTime: number;
    };
    tasks: {
        totalTasks: number;
        completedTasks: number;
        failedTasks: number;
        averageTaskTime: number;
    };
    load: {
        averageLoad: number;
        loadVariance: number;
        hotspots: number;
        balancingEfficiency: number;
    };
}
export interface McpToolMetrics {
    timestamp: number;
    tools: {
        [toolName: string]: {
            invocations: number;
            successRate: number;
            averageLatency: number;
            errorTypes: {
                [errorType: string]: number;
            };
        };
    };
    performance: {
        totalInvocations: number;
        overallSuccessRate: number;
        averageResponseTime: number;
        timeoutRate: number;
    };
}
export interface CompositeMetrics {
    system: SystemMetrics;
    fact: FactMetrics;
    rag: RagMetrics;
    swarm: SwarmMetrics;
    mcp: McpToolMetrics;
}
export declare class MetricsCollector extends EventEmitter {
    private isCollecting;
    private collectionInterval;
    private intervalId;
    private metricsHistory;
    private maxHistorySize;
    private lastIoStats;
    constructor(options?: {
        collectionInterval?: number;
        maxHistorySize?: number;
    });
    /**
     * Start metrics collection.
     */
    startCollection(): void;
    /**
     * Stop metrics collection.
     */
    stopCollection(): void;
    /**
     * Collect comprehensive metrics.
     */
    private collectMetrics;
    /**
     * Collect system performance metrics.
     */
    private collectSystemMetrics;
    /**
     * Collect FACT system metrics.
     */
    private collectFactMetrics;
    /**
     * Collect RAG system metrics.
     */
    private collectRagMetrics;
    /**
     * Collect swarm coordination metrics.
     */
    private collectSwarmMetrics;
    /**
     * Collect MCP tool metrics.
     */
    private collectMcpToolMetrics;
    /**
     * Get CPU usage percentage.
     */
    private getCpuUsage;
    /**
     * Get I/O statistics (simplified).
     */
    private getIoStats;
    /**
     * Get network statistics (simplified).
     */
    private getNetworkStats;
    /**
     * Add metrics to history with size limit.
     *
     * @param metrics
     */
    private addToHistory;
    /**
     * Get metrics history.
     *
     * @param timeRange
     * @param timeRange.start
     * @param timeRange.end
     */
    getHistory(timeRange?: {
        start: number;
        end: number;
    }): CompositeMetrics[];
    /**
     * Get latest metrics.
     */
    getLatestMetrics(): CompositeMetrics | null;
    /**
     * Generate random metric value within range.
     *
     * @param min
     * @param max
     */
    private getRandomMetric;
    /**
     * Export metrics to file.
     *
     * @param filePath
     * @param format
     */
    exportMetrics(filePath: string, format?: 'json' | 'csv'): Promise<void>;
    /**
     * Convert metrics to CSV format.
     *
     * @param data
     */
    private convertToCsv;
}
//# sourceMappingURL=metrics-collector.d.ts.map