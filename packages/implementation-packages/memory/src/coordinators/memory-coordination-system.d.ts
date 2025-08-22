/**
 * Memory Coordination System - Intelligent Memory Orchestration
 *
 * Coordinates memory operations across multiple backends with intelligent routing,
 * load balancing, health monitoring, and automatic failover.
 */
import { TypedEventBase } from '@claude-zen/foundation';
import type { MemoryCoordinationConfig, MemoryNode, MemoryOperationResult } from './types';
import type { BaseMemoryBackend } from '../backends/base-backend';
import type { JSONValue } from '../core/memory-system';
export declare class MemoryCoordinationSystem extends TypedEventBase {
    private logger;
    private config;
    private nodes;
    private loadBalancer;
    private healthMonitor;
    private telemetry;
    private initialized;
    private primaryNode?;
    private shardConfig?;
    private tierConfig?;
    constructor(config: MemoryCoordinationConfig);
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
        replicate?: boolean;
    }): Promise<MemoryOperationResult>;
    retrieve<T = JSONValue>(key: string, namespace?: string, options?: {
        consistency?: 'strong' | 'eventual';
        timeout?: number;
    }): Promise<MemoryOperationResult<T>>;
    delete(key: string, namespace?: string, options?: {
        consistency?: 'strong' | 'eventual';
    }): Promise<MemoryOperationResult<boolean>>;
    list(pattern?: string, namespace?: string): Promise<MemoryOperationResult<string[]>>;
    search(pattern: string, namespace?: string): Promise<MemoryOperationResult<Record<string, JSONValue>>>;
    clear(namespace?: string): Promise<MemoryOperationResult>;
    private executeOperation;
    private selectNodes;
    private selectShardedNodes;
    private selectTieredNodes;
    private selectIntelligentNodes;
    private executeSingleNode;
    private executeReplicated;
    private executeSharded;
    private executeTiered;
    private executeIntelligent;
    private updateNodeMetrics;
    private handleNodeUnhealthy;
    private handleNodeRecovered;
    private handleNodeOverloaded;
    private selectNewPrimaryNode;
    private hashKey;
    private ensureInitialized;
    getNodes(): Map<string, MemoryNode>;
    getHealthStatus(): Record<string, any>;
    shutdown(): Promise<void>;
}
//# sourceMappingURL=memory-coordination-system.d.ts.map