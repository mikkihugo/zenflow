/**
 * @file Advanced Memory Coordination System
 * Provides advanced coordination capabilities for distributed memory management.
 */
import { EventEmitter } from '@claude-zen/foundation';
export interface BackendInterface {
    initialize(): Promise<void>;
    store(key: string, value: unknown, namespace?: string): Promise<unknown>;
    retrieve(key: string, namespace?: string): Promise<any | null>;
    search(pattern: string, namespace?: string): Promise<Record<string, unknown>>;
    delete(key: string, namespace?: string): Promise<boolean>;
    listNamespaces(): Promise<string[]>;
    getStats(): Promise<unknown>;
    close?(): Promise<void>;
}
export interface MemoryCoordinationConfig {
    enabled: boolean;
    consensus: {
        quorum: number;
        timeout: number;
        strategy: 'majority|unanimous|leader';
    };
    distributed: {
        replication: number;
        consistency: 'eventual|strong|weak';
        partitioning: 'hash|range|consistent';
    };
    optimization: {
        autoCompaction: boolean;
        cacheEviction: 'lru|lfu|adaptive';
        memoryThreshold: number;
    };
}
export interface MemoryNode {
    id: string;
    backend: BackendInterface;
    status: 'active|inactive|degraded';
    lastHeartbeat: number;
    load: number;
    capacity: number;
}
export interface CoordinationDecision {
    id: string;
    type: 'read|write|delete|sync|repair';
    sessionId: string;
    target: string;
    participants: string[];
    status: 'pending|executing|completed|failed';
    timestamp: number;
    metadata?: Record<string, unknown>;
}
/**
 * Advanced Memory Coordinator.
 * Manages distributed memory operations with consensus and optimization.
 *
 * @example
 */
export declare class MemoryCoordinator extends EventEmitter {
    private nodes;
    private decisions;
    private configuration;
    constructor(config: MemoryCoordinationConfig);
    /**
     * Register a memory node for coordination.
     *
     * @param id
     * @param backend
     */
    registerNode(id: string, backend: BackendInterface): Promise<void>;
    /**
     * Unregister a memory node.
     *
     * @param id
     */
    unregisterNode(id: string): Promise<void>;
    /**
     * Coordinate a distributed memory operation.
     *
     * @param operation
     */
    coordinate(operation: Partial<CoordinationDecision>): Promise<CoordinationDecision>;
    /**
     * Select optimal nodes for an operation.
     *
     * @param operationType
     */
    private selectParticipants;
    /**
     * Execute coordination decision.
     *
     * @param decision
     */
    private executeCoordination;
    /**
     * Execute distributed read operation.
     *
     * @param decision
     */
    private executeRead;
    /**
     * Execute distributed write operation.
     *
     * @param decision
     */
    private executeWrite;
    /**
     * Execute distributed delete operation.
     *
     * @param decision
     */
    private executeDelete;
    /**
     * Execute sync operation between nodes.
     *
     * @param decision
     */
    private executeSync;
    /**
     * Execute repair operation for inconsistent data.
     *
     * @param decision
     */
    private executeRepair;
    /**
     * Get coordination statistics.
     */
    getStats(): {
        nodes: {
            total: number;
            active: number;
            degraded: number;
        };
        decisions: {
            total: number;
            pending: CoordinationDecision[];
            "": any;
            executing: CoordinationDecision[];
            completed: CoordinationDecision[];
            failed: CoordinationDecision[];
        };
        config: any;
    };
    /**
     * Store data across distributed memory nodes.
     *
     * @param key
     * @param data
     * @param options
     * @param options.ttl
     * @param options.replicas
     */
    store(key: string, data: unknown, options?: {
        ttl?: number;
        replicas?: number;
    }): Promise<void>;
    /**
     * Retrieve data from distributed memory nodes.
     *
     * @param key
     */
    get(key: string): Promise<unknown>;
    /**
     * Delete data from distributed memory nodes.
     *
     * @param key
     */
    deleteEntry(key: string): Promise<void>;
    /**
     * List all keys matching a pattern across distributed nodes.
     *
     * @param pattern
     */
    list(pattern: string): Promise<Array<{
        key: string;
        value: unknown;
    }>>;
    /**
     * Simple pattern matching for key listing.
     *
     * @param key
     * @param pattern
     */
    private matchesPattern;
    /**
     * Health check for coordinator.
     */
    healthCheck(): Promise<{
        status: string;
        details: unknown;
    }>;
}
//# sourceMappingURL=memory-coordinator.d.ts.map