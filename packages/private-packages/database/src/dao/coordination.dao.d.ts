/**
 * Coordination Repository Implementation.
 *
 * Specialized repository for coordination operations including.
 * Distributed locking, pub/sub messaging, and change notifications.
 */
/**
 * @file Database layer: coordination.dao.
 */
import type { DatabaseAdapter, Logger } from '../../core/interfaces/base-interfaces';
import { BaseDao } from '../base.dao';
import type { CoordinationChange, CoordinationEvent, CoordinationLock, CoordinationStats, CustomQuery, CoordinationRepository } from '../interfaces';
/**
 * Coordination repository implementation with distributed coordination capabilities.
 *
 * @template T The entity type this repository manages.
 * @example
 */
export declare class CoordinationDao<T> extends BaseDao<T> implements CoordinationRepository<T> {
    private eventEmitter;
    private locks;
    private subscriptions;
    private publishedMessages;
    private receivedMessages;
    private startTime;
    constructor(adapter: DatabaseAdapter, logger: Logger, tableName: string, entitySchema?: Record<string, unknown>);
    /**
     * Lock resource for coordination.
     *
     * @param resourceId
     * @param lockTimeout
     */
    acquireLock(resourceId: string, lockTimeout?: number): Promise<CoordinationLock>;
    /**
     * Release lock.
     *
     * @param lockId
     */
    releaseLock(lockId: string): Promise<void>;
    /**
     * Subscribe to changes.
     *
     * @param pattern
     * @param callback
     */
    subscribe(pattern: string, callback: (change: CoordinationChange<T>) => void): Promise<string>;
    /**
     * Unsubscribe from changes.
     *
     * @param subscriptionId
     */
    unsubscribe(subscriptionId: string): Promise<void>;
    /**
     * Publish coordination event.
     *
     * @param channel
     * @param event
     */
    publish(channel: string, event: CoordinationEvent<T>): Promise<void>;
    /**
     * Get coordination statistics.
     */
    getCoordinationStats(): Promise<CoordinationStats>;
    /**
     * Execute raw SQL/query - implements CoordinationRepository interface.
     *
     * @param sql
     * @param params
     */
    execute(sql: string, params?: unknown[]): Promise<{
        affectedRows?: number;
        insertId?: number;
    }>;
    /**
     * Query database directly - implements CoordinationRepository interface.
     *
     * @param sql
     * @param params
     */
    query(sql: string, params?: unknown[]): Promise<any[]>;
    /**
     * Override base repository methods to add coordination events.
     */
    create(entity: Omit<T, 'id'>): Promise<T>;
    update(id: string | number, updates: Partial<T>): Promise<T>;
    delete(id: string | number): Promise<boolean>;
    protected mapRowToEntity(row: unknown): T;
    protected mapEntityToRow(entity: Partial<T>): Record<string, unknown>;
    /**
     * Execute custom query - override to handle coordination-specific queries.
     *
     * @param customQuery
     */
    executeCustomQuery<R = any>(customQuery: CustomQuery): Promise<R>;
    /**
     * Enhanced coordination-specific operations.
     */
    /**
     * Try to acquire lock with retry mechanism.
     *
     * @param resourceId
     * @param maxRetries
     * @param retryDelay
     * @param lockTimeout
     */
    tryAcquireLock(resourceId: string, maxRetries?: number, retryDelay?: number, lockTimeout?: number): Promise<CoordinationLock | null>;
    /**
     * Execute with lock (acquire, execute, release).
     *
     * @param resourceId
     * @param operation
     * @param lockTimeout
     */
    executeWithLock<R>(resourceId: string, operation: () => Promise<R>, lockTimeout?: number): Promise<R>;
    /**
     * Broadcast event to all subscribers.
     *
     * @param event
     */
    broadcast(event: CoordinationEvent<T>): Promise<void>;
    /**
     * Get active locks.
     */
    getActiveLocks(): Promise<CoordinationLock[]>;
    /**
     * Get subscription information.
     */
    getSubscriptions(): Promise<Array<{
        id: string;
        pattern: string;
        createdAt: Date;
        lastTriggered?: Date;
        triggerCount: number;
    }>>;
    /**
     * Private helper methods.
     */
    private emitChange;
    private matchesPattern;
    private generateLockId;
    private generateSubscriptionId;
    private generateOwnerIdentifier;
    private persistLock;
    private removeLockFromDatabase;
    private persistEvent;
    private sleep;
    /**
     * Cleanup method to be called on shutdown.
     */
    shutdown(): Promise<void>;
}
//# sourceMappingURL=coordination.dao.d.ts.map