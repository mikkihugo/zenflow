/**
 * Memory System Manager - Unified Memory System Orchestration
 *
 * Provides a unified interface for managing complex memory systems with coordination,
 * optimization strategies, lifecycle management, and comprehensive monitoring.
 */
import { EventEmitter } from 'eventemitter3';
import type { MemorySystemConfig, MemorySystemStatus, SystemMetrics } from './types';
import type { BaseMemoryBackend } from '../backends/base-backend';
import type { JSONValue } from '../core/memory-system';
interface ManagedComponent {
    name: string;
    instance: any;
    initialized: boolean;
    healthy: boolean;
    lastHealthCheck: number;
}
export declare class MemorySystemManager extends EventEmitter {
    private logger;
    private config;
    private telemetry;
    private coordination?;
    private optimization?;
    private lifecycle?;
    private performance?;
    private cacheEviction?;
    private components;
    private monitoringTimer?;
    private healthCheckTimer?;
    private initialized;
    private startTime;
    private circuitBreaker;
    constructor(config: MemorySystemConfig);
    initialize(): Promise<void>;
    addNode(id: string, backend: BaseMemoryBackend, options?: {
        weight?: number;
        priority?: number;
        tier?: 'hot' | 'warm' | 'cold';
    }): Promise<void>;
    removeNode(id: string): Promise<void>;
    store(key: string, value: JSONValue, namespace?: string, options?: {
        consistency?: 'strong' | 'eventual';
        tier?: 'hot' | 'warm' | 'cold';
        ttl?: number;
        priority?: number;
        tags?: string[];
    }): Promise<any>;
    retrieve<T = JSONValue>(key: string, namespace?: string, options?: {
        consistency?: 'strong' | 'eventual';
        timeout?: number;
    }): Promise<T | null>;
    delete(key: string, namespace?: string): Promise<boolean>;
    clear(namespace?: string): Promise<void>;
    getSystemStatus(): MemorySystemStatus;
    getSystemMetrics(): SystemMetrics;
    private initializeCoordination;
    private initializeOptimization;
    private initializeLifecycle;
    private initializePerformance;
    private initializeCacheEviction;
    private shouldInitializeCacheEviction;
    private startMonitoring;
    private performMonitoringCycle;
    private performHealthChecks;
    private getComponentsHealth;
    private calculateOverallStatus;
    private calculateHealthScore;
    private collectHealthIssues;
    private generateRecommendations;
    private getAverageResponseTime;
    private getThroughput;
    private getCacheHitRate;
    private getErrorRate;
    private getStorageUsage;
    private getCpuUsage;
    private getLastOptimizationTime;
    getComponentStatus(componentName: string): ManagedComponent | null;
    getAllComponents(): Map<string, ManagedComponent>;
    forceOptimization(): Promise<void>;
    forceTuning(): Promise<void>;
    updateConfig(newConfig: Partial<MemorySystemConfig>): void;
    shutdown(): Promise<void>;
}
export {};
//# sourceMappingURL=memory-system-manager.d.ts.map