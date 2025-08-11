/**
 * @file Integration Example: Enhanced Memory and Database Systems
 * Demonstrates how to use the advanced Memory and Database domain features together.
 */
import { type DatabaseQuery } from '../database/index.ts';
/**
 * Example: Complete system integration with Memory and Database coordination.
 *
 * @example
 */
export declare function createIntegratedSystem(): Promise<{
    memory: {
        coordinator: import("../memory/index.ts").MemoryCoordinator | undefined;
        optimizer: import("../memory/index.ts").PerformanceOptimizer | undefined;
        monitor: import("../memory/index.ts").MemoryMonitor | undefined;
        recoveryManager: import("../memory/index.ts").RecoveryStrategyManager;
        backends: Map<any, any>;
        shutdown(): Promise<void>;
        getHealthReport(): {
            overall: "healthy" | "warning" | "critical";
            score: number;
            details: Record<string, any>;
            recommendations: string[];
        } | {
            overall: "unknown";
            score: number;
            details: {};
            recommendations: never[];
        };
        getStats(): MemoryStats;
    };
    database: {
        query: (query: DatabaseQuery) => Promise<any>;
        getHealthReport: () => {
            overall: string;
            score: number;
            engines: {
                vector: {
                    status: string;
                    score: number;
                };
                graph: {
                    status: string;
                    score: number;
                };
                document: {
                    status: string;
                    score: number;
                };
            };
        };
        getStats: () => {
            coordinator: {
                queries: {
                    total: number;
                    averageLatency: number;
                };
            };
            engines: number;
        };
        shutdown: () => Promise<void>;
    };
    storeWithCoordination(sessionId: string, key: string, data: any): Promise<any>;
    retrieveWithOptimization(sessionId: string, key: string): Promise<any>;
    performVectorSearch(embedding: number[], sessionId?: string): Promise<any>;
    getSystemHealth(): Promise<{
        memory: {
            overall: "healthy" | "warning" | "critical";
            score: number;
            details: Record<string, any>;
            recommendations: string[];
        } | {
            overall: "unknown";
            score: number;
            details: {};
            recommendations: never[];
        };
        database: {
            overall: string;
            score: number;
            engines: {
                vector: {
                    status: string;
                    score: number;
                };
                graph: {
                    status: string;
                    score: number;
                };
                document: {
                    status: string;
                    score: number;
                };
            };
        };
        overall: {
            status: string;
            score: number;
            components: {
                memory: number;
                database: number;
            };
        };
    }>;
    getPerformanceMetrics(): Promise<{
        timestamp: number;
        memory: MemoryStats;
        database: {
            coordinator: {
                queries: {
                    total: number;
                    averageLatency: number;
                };
            };
            engines: number;
        };
        integration: {
            totalOperations: any;
            averageLatency: number;
            systemUtilization: {
                memory: any;
                database: number;
            };
        };
    }>;
    shutdown(): Promise<void>;
}>;
/**
 * Example: Using MCP tools for system management.
 *
 * @example
 */
export declare function demonstrateMCPIntegration(): Promise<{
    memoryInit: unknown;
    databaseInit: any;
    queryExecution: any;
    monitoring: [unknown, any];
}>;
/**
 * Example: Advanced error handling and recovery.
 *
 * @example
 */
export declare function demonstrateErrorHandling(): Promise<void>;
/**
 * Example: Performance optimization workflow.
 *
 * @example
 */
export declare function demonstrateOptimization(): Promise<void>;
export declare const integrationExamples: {
    createIntegratedSystem: typeof createIntegratedSystem;
    demonstrateMCPIntegration: typeof demonstrateMCPIntegration;
    demonstrateErrorHandling: typeof demonstrateErrorHandling;
    demonstrateOptimization: typeof demonstrateOptimization;
};
//# sourceMappingURL=memory-database-integration.d.ts.map