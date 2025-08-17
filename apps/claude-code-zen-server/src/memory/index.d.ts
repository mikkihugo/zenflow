/**
 * Memory Domain - Main Export Module
 *
 * @file Central export point for all memory functionality including types,
 * stores, backends, and API controllers. This module serves as the single source
 * of truth for all memory operations and type definitions.
 *
 * Following domain architecture standard with consolidated types.
 */
export * from './types';
import type { MemoryStats } from './types';
/**
 * @deprecated Legacy export structure - use domain types instead
 * @file Memory module legacy exports.
 */
export * from './backends/base-backend';
export * from './backends/factory';
export { MemoryBackendFactory as BackendFactory, memoryBackendFactory, } from './backends/factory';
import type { MemoryCoordinationConfig } from './core/memory-coordinator';
import type { MonitoringConfig } from './monitoring/memory-monitor';
import type { OptimizationConfig } from './optimization/performance-optimizer';
export { type CoordinationDecision, type MemoryCoordinationConfig, MemoryCoordinator, type MemoryNode, } from './core/memory-coordinator';
export { MemoryBackendError, MemoryCoordinationError, MemoryDataError, MemoryError, MemoryErrorClassifier, MemoryErrorCode, type MemoryErrorContext, MemoryPerformanceError, } from './error-handling/memory-errors';
export { type RecoveryContext, type RecoveryResult, type RecoveryStrategy, RecoveryStrategyManager, } from './error-handling/recovery-strategies';
export { MemoryManager, SessionMemoryStore } from './memory';
export { type MemoryAlert, type MemoryMetrics, MemoryMonitor, type MonitoringConfig, } from './monitoring/memory-monitor';
export { type OptimizationAction, type OptimizationConfig, type PerformanceMetrics, PerformanceOptimizer, } from './optimization/performance-optimizer';
export declare class MemorySystemFactory {
    /**
     * Create a complete memory system with all advanced features.
     *
     * @param config
     * @param config.coordination
     * @param config.optimization
     * @param config.monitoring
     * @param config.backends
     */
    static createAdvancedMemorySystem(config: {
        coordination?: MemoryCoordinationConfig;
        optimization?: OptimizationConfig;
        monitoring?: MonitoringConfig;
        backends?: Array<{
            id: string;
            type: string;
            config: Record<string, unknown>;
        }>;
    }): Promise<{
        coordinator: import("./core/memory-coordinator").MemoryCoordinator | undefined;
        optimizer: import("./optimization/performance-optimizer").PerformanceOptimizer | undefined;
        monitor: import("./monitoring/memory-monitor").MemoryMonitor | undefined;
        recoveryManager: import("./error-handling/recovery-strategies").RecoveryStrategyManager;
        backends: Map<any, any>;
        shutdown(): Promise<void>;
        getHealthReport(): {
            overall: "healthy" | "warning" | "critical";
            score: number;
            details: Record<string, unknown>;
            recommendations: string[];
        } | {
            overall: "unknown";
            score: number;
            details: {};
            recommendations: never[];
        };
        getStats(): MemoryStats;
    }>;
    /**
     * Create a basic memory system with essential features.
     *
     * @param backends
     */
    static createBasicMemorySystem(backends: Array<{
        id: string;
        type: string;
        config: Record<string, unknown>;
    }>): Promise<{
        coordinator: import("./core/memory-coordinator").MemoryCoordinator | undefined;
        optimizer: import("./optimization/performance-optimizer").PerformanceOptimizer | undefined;
        monitor: import("./monitoring/memory-monitor").MemoryMonitor | undefined;
        recoveryManager: import("./error-handling/recovery-strategies").RecoveryStrategyManager;
        backends: Map<any, any>;
        shutdown(): Promise<void>;
        getHealthReport(): {
            overall: "healthy" | "warning" | "critical";
            score: number;
            details: Record<string, unknown>;
            recommendations: string[];
        } | {
            overall: "unknown";
            score: number;
            details: {};
            recommendations: never[];
        };
        getStats(): MemoryStats;
    }>;
}
//# sourceMappingURL=index.d.ts.map