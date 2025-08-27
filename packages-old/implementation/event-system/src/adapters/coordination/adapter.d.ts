/**
 * @file Coordination Event Adapter - Main Class
 *
 * Unified Coordination Event Adapter implementing the EventManager interface.
 */
import { type Logger } from '@claude-zen/foundation';
import type { EventManagerConfig, EventManagerStatus, EventManagerMetrics, SystemEvent } from '../../core/interfaces';
import type { CoordinationEventManager } from '../../event-manager-types';
import { BaseEventManager } from '../../core/base-event-manager';
/**
 * Coordination-specific event for distributed operations.
 */
export interface CoordinationEvent extends SystemEvent {
    operationId?: string;
    participants?: string[];
    status?: 'pending' | 'coordinating' | 'completed' | 'failed';
    progress?: number;
}
/**
 * Configuration for coordination event adapter.
 */
export interface CoordinationEventAdapterConfig extends EventManagerConfig {
    maxParticipants?: number;
    coordinationTimeout?: number;
    retryAttempts?: number;
}
/**
 * Coordination Event Adapter implementation.
 */
export declare class CoordinationEventAdapter extends BaseEventManager implements CoordinationEventManager {
    private operations;
    private coordinationStats;
    private startTime;
    constructor(config: CoordinationEventAdapterConfig, logger?: Logger);
    coordinateOperation(operationId: string, participants: string[]): Promise<void>;
    getCoordinationStatus(operationId: string): Promise<{
        status: 'pending' | 'coordinating' | 'completed' | 'failed';
        participants: string[];
        progress: number;
    }>;
    private completeOperation;
    getCoordinationStats(): {
        coordination: {
            activeOperations: number;
            operationsStarted: number;
            operationsCompleted: number;
            operationsFailed: number;
        };
        subscriptions: number;
        queueSize: number;
        isRunning: boolean;
        eventsEmitted: number;
        eventsProcessed: number;
        subscriptionsCreated: number;
        subscriptionsRemoved: number;
        errorCount: number;
    };
    healthCheck(): Promise<EventManagerStatus>;
    getMetrics(): Promise<EventManagerMetrics>;
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    emitSimple(eventType: string, ...args: any[]): boolean;
}
/**
 * Factory function to create coordination event adapter.
 */
export declare function createCoordinationEventAdapter(config: CoordinationEventAdapterConfig, logger?: Logger): CoordinationEventAdapter;
//# sourceMappingURL=adapter.d.ts.map