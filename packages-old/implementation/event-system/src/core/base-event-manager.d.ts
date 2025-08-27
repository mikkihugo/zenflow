/**
 * @fileoverview Base Event Manager Implementation
 *
 * Base class for all event managers providing common functionality including
 * event emission, subscription management, filtering, health checking, and
 * performance monitoring. All specialized event managers extend this base.
 */
import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig, EventManager, EventManagerType, SystemEvent, EventSubscription, EventListener } from './interfaces';
/**
 * Base Event Manager providing core event management functionality.
 */
export declare abstract class BaseEventManager implements EventManager {
    readonly config: EventManagerConfig;
    readonly name: string;
    readonly type: EventManagerType;
    private _isRunning;
    private _subscriptions;
    private _eventQueue;
    private _processingInterval?;
    private _logger?;
    private _startTime;
    private _stats;
    constructor(config: EventManagerConfig, logger?: Logger);
    start(): Promise<void>;
    stop(): Promise<void>;
    restart(): Promise<void>;
    isRunning(): boolean;
    emit<T extends SystemEvent>(event: T): Promise<void>;
    emitBatch<T extends SystemEvent>(events: T[]): Promise<void>;
    subscribe<T extends SystemEvent>(eventTypes: string | string[], listener: EventListener<T>): string;
    unsubscribe(subscriptionId: string): boolean;
    unsubscribeAll(eventType?: string): number;
    destroy(): Promise<void>;
    protected processEvent<T extends SystemEvent>(event: T): Promise<void>;
    protected processBatch(): Promise<void>;
    protected eventMatches<T extends SystemEvent>(event: T, subscription: EventSubscription): boolean;
    private startProcessingLoop;
    getStats(): {
        subscriptions: number;
        queueSize: number;
        isRunning: boolean;
        eventsEmitted: number;
        eventsProcessed: number;
        subscriptionsCreated: number;
        subscriptionsRemoved: number;
        errorCount: number;
    };
    healthCheck(): Promise<import('./interfaces').EventManagerStatus>;
    getMetrics(): Promise<import('./interfaces').EventManagerMetrics>;
}
//# sourceMappingURL=base-event-manager.d.ts.map