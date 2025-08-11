/**
 * @file Coordination system: base-swarm.
 */
/**
 * Base ZenSwarm Class - Core implementation without circular dependencies.
 *
 * This file contains the core ZenSwarm implementation to avoid circular.
 * Dependencies with session-integration.ts.
 */
import { EventEmitter } from 'node:events';
import type { SwarmEventEmitter, SwarmLifecycleState, SwarmOptions } from './types.ts';
interface ExtendedSwarmOptions extends SwarmOptions {
    persistence: {
        enabled: boolean;
        dbPath: string;
        checkpointInterval: number;
        compressionEnabled: boolean;
    };
    pooling: {
        enabled: boolean;
        maxPoolSize: number;
        minPoolSize: number;
        idleTimeout: number;
    };
}
/**
 * Core ZenSwarm implementation with all base functionality.
 *
 * @example
 */
export declare class ZenSwarm extends EventEmitter implements SwarmEventEmitter {
    private swarmId;
    private agents;
    private state;
    private agentPool;
    private wasmLoader;
    protected options: ExtendedSwarmOptions;
    protected isRunning: boolean;
    protected coordinationDao?: any;
    protected neuralProcessor?: any;
    protected metrics: {
        tasksCreated: number;
        tasksCompleted: number;
        tasksFailed: number;
        messagesProcessed: number;
        cognitiveLoad: number;
        averageResponseTime: number;
        neuralNetworkAccuracy: number;
        swarmEfficiency: number;
        timestamp: number;
    };
    constructor(options?: SwarmOptions);
    initialize(): Promise<void>;
    getSwarmId(): string;
    getState(): SwarmLifecycleState;
    shutdown(): Promise<void>;
    emit(eventName: string | symbol, ...args: any[]): boolean;
}
export default ZenSwarm;
//# sourceMappingURL=base-swarm.d.ts.map