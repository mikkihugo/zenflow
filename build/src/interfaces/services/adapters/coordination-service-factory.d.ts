/**
 * USL Coordination Service Factory.
 *
 * Factory functions and helper utilities for creating and managing
 * coordination service adapter instances with proper configuration.
 * And dependency injection.
 */
/**
 * @file Interface implementation: coordination-service-factory.
 */
import type { IServiceFactory } from '../core/interfaces.ts';
import { type CoordinationServiceAdapter, type CoordinationServiceAdapterConfig } from './coordination-service-adapter.ts';
/**
 * Factory class for creating CoordinationServiceAdapter instances.
 *
 * @example
 */
export declare class CoordinationServiceFactory implements IServiceFactory<CoordinationServiceAdapterConfig> {
    private instances;
    private logger;
    constructor();
    /**
     * Create a new coordination service adapter instance.
     *
     * @param config
     */
    create(config: CoordinationServiceAdapterConfig): Promise<CoordinationServiceAdapter>;
    /**
     * Create multiple coordination service adapter instances.
     *
     * @param configs
     */
    createMultiple(configs: CoordinationServiceAdapterConfig[]): Promise<CoordinationServiceAdapter[]>;
    /**
     * Get coordination service adapter by name.
     *
     * @param name
     */
    get(name: string): CoordinationServiceAdapter | undefined;
    /**
     * List all coordination service adapter instances.
     */
    list(): CoordinationServiceAdapter[];
    /**
     * Check if coordination service adapter exists.
     *
     * @param name
     */
    has(name: string): boolean;
    /**
     * Remove and destroy coordination service adapter.
     *
     * @param name
     */
    remove(name: string): Promise<boolean>;
    /**
     * Get supported service types.
     */
    getSupportedTypes(): string[];
    /**
     * Check if service type is supported.
     *
     * @param type
     */
    supportsType(type: string): boolean;
    /**
     * Start all coordination service adapters.
     */
    startAll(): Promise<void>;
    /**
     * Stop all coordination service adapters.
     */
    stopAll(): Promise<void>;
    /**
     * Perform health check on all coordination service adapters.
     */
    healthCheckAll(): Promise<Map<string, any>>;
    /**
     * Get metrics from all coordination service adapters.
     */
    getMetricsAll(): Promise<Map<string, any>>;
    /**
     * Shutdown factory and all coordination service adapters.
     */
    shutdown(): Promise<void>;
    /**
     * Get number of active coordination service adapters.
     */
    getActiveCount(): number;
}
/**
 * Helper function to create agent-focused coordination service configuration.
 *
 * @param name
 * @param options
 * @param options.maxAgents
 * @param options.topology
 * @param options.enableLearning
 * @param options.autoSpawn
 * @example
 */
export declare function createAgentCoordinationConfig(name: string, options?: {
    maxAgents?: number;
    topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
    enableLearning?: boolean;
    autoSpawn?: boolean;
}): CoordinationServiceAdapterConfig;
/**
 * Helper function to create session-focused coordination service configuration.
 *
 * @param name
 * @param options
 * @param options.maxSessions
 * @param options.checkpointInterval
 * @param options.autoRecovery
 * @example
 */
export declare function createSessionCoordinationConfig(name: string, options?: {
    maxSessions?: number;
    checkpointInterval?: number;
    autoRecovery?: boolean;
}): CoordinationServiceAdapterConfig;
/**
 * Helper function to create DAA-focused coordination service configuration.
 *
 * @param name
 * @param options
 * @param options.enableMetaLearning
 * @param options.enableCognitive
 * @param options.analysisInterval
 * @example
 */
export declare function createDAACoordinationConfig(name: string, options?: {
    enableMetaLearning?: boolean;
    enableCognitive?: boolean;
    analysisInterval?: number;
}): CoordinationServiceAdapterConfig;
/**
 * Helper function to create high-performance coordination service configuration.
 *
 * @param name
 * @param options
 * @param options.maxConcurrency
 * @param options.requestTimeout
 * @param options.cacheSize
 * @example
 */
export declare function createHighPerformanceCoordinationConfig(name: string, options?: {
    maxConcurrency?: number;
    requestTimeout?: number;
    cacheSize?: number;
}): CoordinationServiceAdapterConfig;
/**
 * Configuration presets for common coordination use cases.
 */
export declare const CoordinationConfigPresets: {
    /**
     * Basic coordination configuration for simple agent management.
     *
     * @param name
     */
    BASIC: (name: string) => CoordinationServiceAdapterConfig;
    /**
     * Advanced coordination configuration with all features enabled.
     *
     * @param name
     */
    ADVANCED: (name: string) => CoordinationServiceAdapterConfig;
    /**
     * Session-focused configuration for session management.
     *
     * @param name
     */
    SESSION_MANAGEMENT: (name: string) => CoordinationServiceAdapterConfig;
    /**
     * DAA-focused configuration for data analysis and learning.
     *
     * @param name
     */
    DATA_ANALYSIS: (name: string) => CoordinationServiceAdapterConfig;
    /**
     * High-performance configuration for heavy workloads.
     *
     * @param name
     */
    HIGH_PERFORMANCE: (name: string) => CoordinationServiceAdapterConfig;
};
/**
 * Global coordination service factory instance.
 */
export declare const coordinationServiceFactory: CoordinationServiceFactory;
export default CoordinationServiceFactory;
//# sourceMappingURL=coordination-service-factory.d.ts.map