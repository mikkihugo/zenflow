/**
 * Multi-System Coordinator - Advanced Integration Layer
 * Orchestrates LanceDB, Kuzu, and other system integrations.
 * Provides unified interface and cross-system intelligence.
 */
/**
 * @file Multi-system coordination system.
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../core/interfaces/base-interfaces.ts';
export declare class MultiSystemCoordinator extends EventEmitter {
    private _logger;
    private config;
    private isInitialized;
    private activeOperations;
    private crossSystemCache;
    constructor(_logger: ILogger, config?: any);
    /**
     * Initialize all systems with coordination.
     */
    initialize(): Promise<void>;
    /**
     * Coordinate operation across multiple systems.
     *
     * @param operation
     * @param data
     */
    coordinateOperation(operation: string, data: any): Promise<any>;
    /**
     * Get coordination status.
     */
    getStatus(): any;
    /**
     * Shutdown coordinator and cleanup resources.
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=multi-system-coordinator.d.ts.map