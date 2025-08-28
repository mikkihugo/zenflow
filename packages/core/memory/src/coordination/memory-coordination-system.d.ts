/**
 * Memory Coordination System - Intelligent Memory Orchestration
 *
 * Coordinates memory operations across multiple backends with intelligent routing,
 * load balancing, health monitoring, and automatic failover.
 */
import { EventEmitter } from '@claude-zen/foundation';
import type { MemoryCoordinationConfig, MemoryOperationResult } from './types';
import type { BaseMemoryBackend } from '../backends/base-backend';
import type { JSONValue } from '../core/memory-system';
export declare class MemoryCoordinationSystem extends EventEmitter {
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
        tier?: 'hot|warm|cold';
    }): Promise<void>;
    removeNode(id: string): Promise<void>;
    store(key: string, value: JSONValue, namespace?: string, options?: {
        consistency?: 'strong' | ' eventual';
        tier?: 'hot|warm|cold';
        replicate?: boolean;
    }): Promise<MemoryOperationResult>;
    retrieve<T = JSONValue>(key: string, namespace?: string, options?: {
        consistency?: 'strong' | ' eventual';
        timeout?: number;
    }): Promise<MemoryOperationResult<T>>;
    delete(key: string, namespace?: string, options?: {
        consistency?: 'strong' | ' eventual';
    }): Promise<MemoryOperationResult<boolean>>;
    list(pattern?: string, namespace?: string): any;
    Promise<MemoryOperationResult>(): any;
}
//# sourceMappingURL=memory-coordination-system.d.ts.map