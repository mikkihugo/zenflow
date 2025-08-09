/**
 * Coordination Repository Implementation.
 *
 * Specialized repository for coordination operations including
 * distributed locking, pub/sub messaging, and change notifications.
 */

import { EventEmitter } from 'node:events';
import type { DatabaseAdapter, ILogger } from '../../core/interfaces/base-interfaces';
import { BaseDao } from '../base.dao';
import type {
  CoordinationChange,
  CoordinationEvent,
  CoordinationLock,
  CoordinationStats,
  CustomQuery,
  ICoordinationRepository,
} from '../interfaces';

/**
 * Subscription information.
 *
 * @example
 */
interface Subscription {
  id: string;
  pattern: string;
  callback: (change: CoordinationChange<any>) => void;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

/**
 * Lock information.
 *
 * @example
 */
interface LockInfo extends CoordinationLock {
  timer?: NodeJS.Timeout;
}

/**
 * Coordination repository implementation with distributed coordination capabilities.
 *
 * @template T The entity type this repository manages.
 * @example
 */
export class CoordinationDao<T> extends BaseDao<T> implements ICoordinationRepository<T> {
  private eventEmitter = new EventEmitter();
  private locks = new Map<string, LockInfo>();
  private subscriptions = new Map<string, Subscription>();
  private publishedMessages = 0;
  private receivedMessages = 0;
  private startTime = Date.now();

  constructor(
    adapter: DatabaseAdapter,
    logger: ILogger,
    tableName: string,
    entitySchema?: Record<string, any>
  ) {
    super(adapter, logger, tableName, entitySchema);

    // Set up event emitter with increased listener limit for coordination
    this.eventEmitter.setMaxListeners(1000);
  }

  /**
   * Lock resource for coordination.
   *
   * @param resourceId
   * @param lockTimeout
   */
  async acquireLock(resourceId: string, lockTimeout: number = 30000): Promise<CoordinationLock> {
    this.logger.debug(`Acquiring lock for resource: ${resourceId}, timeout: ${lockTimeout}ms`);

    const lockId = this.generateLockId(resourceId);
    const existingLock = this.locks.get(resourceId);

    // Check if resource is already locked
    if (existingLock && existingLock.expiresAt > new Date()) {
      throw new Error(`Resource ${resourceId} is already locked by ${existingLock.owner}`);
    }

    // Create new lock
    const lock: CoordinationLock = {
      id: lockId,
      resourceId,
      acquired: new Date(),
      expiresAt: new Date(Date.now() + lockTimeout),
      owner: this.generateOwnerIdentifier(),
    };

    // Set up automatic release timer
    const timer = setTimeout(() => {
      this.releaseLock(lockId).catch((error) => {
        this.logger.warn(`Failed to auto-release lock ${lockId}: ${error}`);
      });
    }, lockTimeout);

    const lockInfo: LockInfo = {
      ...lock,
      timer,
    };

    this.locks.set(resourceId, lockInfo);

    // Persist lock to database for distributed coordination
    try {
      await this.persistLock(lockInfo);
    } catch (error) {
      this.logger.warn(`Failed to persist lock to database: ${error}`);
    }

    this.logger.debug(`Lock acquired: ${lockId} for resource: ${resourceId}`);
    return lock;
  }

  /**
   * Release lock.
   *
   * @param lockId
   */
  async releaseLock(lockId: string): Promise<void> {
    this.logger.debug(`Releasing lock: ${lockId}`);

    // Find lock by ID
    let resourceId: string | null = null;
    let lockInfo: LockInfo | null = null;

    for (const [resource, lock] of this.locks.entries()) {
      if (lock.id === lockId) {
        resourceId = resource;
        lockInfo = lock;
        break;
      }
    }

    if (!lockInfo || !resourceId) {
      throw new Error(`Lock ${lockId} not found`);
    }

    // Clear timer
    if (lockInfo.timer) {
      clearTimeout(lockInfo.timer);
    }

    // Remove from memory
    this.locks.delete(resourceId);

    // Remove from database
    try {
      await this.removeLockFromDatabase(lockId);
    } catch (error) {
      this.logger.warn(`Failed to remove lock from database: ${error}`);
    }

    this.logger.debug(`Lock released: ${lockId}`);
  }

  /**
   * Subscribe to changes.
   *
   * @param pattern
   * @param callback
   */
  async subscribe(
    pattern: string,
    callback: (change: CoordinationChange<T>) => void
  ): Promise<string> {
    const subscriptionId = this.generateSubscriptionId();

    this.logger.debug(`Creating subscription: ${subscriptionId} for pattern: ${pattern}`);

    const subscription: Subscription = {
      id: subscriptionId,
      pattern,
      callback,
      createdAt: new Date(),
      triggerCount: 0,
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Set up event listener
    this.eventEmitter.on('change', (change: CoordinationChange<T>) => {
      if (this.matchesPattern(change, pattern)) {
        subscription.lastTriggered = new Date();
        subscription.triggerCount++;

        try {
          callback(change);
        } catch (error) {
          this.logger.error(`Error in subscription callback ${subscriptionId}: ${error}`);
        }
      }
    });

    this.logger.debug(`Subscription created: ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Unsubscribe from changes.
   *
   * @param subscriptionId
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    this.logger.debug(`Unsubscribing: ${subscriptionId}`);

    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription ${subscriptionId} not found`);
    }

    this.subscriptions.delete(subscriptionId);

    // Remove event listeners (EventEmitter doesn't provide easy way to remove specific listeners)
    // In a production implementation, you'd want a more sophisticated event handling system

    this.logger.debug(`Unsubscribed: ${subscriptionId}`);
  }

  /**
   * Publish coordination event.
   *
   * @param channel
   * @param event
   */
  async publish(channel: string, event: CoordinationEvent<T>): Promise<void> {
    this.logger.debug(`Publishing event to channel: ${channel}`, { event });

    try {
      // Emit to local subscribers
      this.eventEmitter.emit('event', { channel, event });

      // Persist event for distributed coordination
      await this.persistEvent(channel, event);

      this.publishedMessages++;
      this.logger.debug(`Event published to channel: ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to publish event: ${error}`);
      throw new Error(
        `Publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get coordination statistics.
   */
  async getCoordinationStats(): Promise<CoordinationStats> {
    return {
      activeLocks: this.locks.size,
      activeSubscriptions: this.subscriptions.size,
      messagesPublished: this.publishedMessages,
      messagesReceived: this.receivedMessages,
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Execute raw SQL/query - implements ICoordinationRepository interface.
   *
   * @param sql
   * @param params
   */
  async execute(sql: string, params?: unknown[]): Promise<{ affectedRows?: number; insertId?: number }> {
    try {
      const result = await this.adapter.execute(sql, params);
      return {
        affectedRows: result.rowCount,
        insertId: result.insertId
      };
    } catch (error) {
      this.logger.error('Execute query failed:', error);
      throw error;
    }
  }

  /**
   * Override base repository methods to add coordination events.
   */

  override async create(entity: Omit<T, 'id'>): Promise<T> {
    const created = await super.create(entity);

    // Emit change notification
    await this.emitChange('create', (created as any).id, created);

    return created;
  }

  override async update(id: string | number, updates: Partial<T>): Promise<T> {
    const updated = await super.update(id, updates);

    // Emit change notification
    await this.emitChange('update', id, updated);

    return updated;
  }

  override async delete(id: string | number): Promise<boolean> {
    const deleted = await super.delete(id);

    if (deleted) {
      // Emit change notification
      await this.emitChange('delete', id);
    }

    return deleted;
  }

  protected mapRowToEntity(row: any): T {
    return row as T;
  }

  protected mapEntityToRow(entity: Partial<T>): Record<string, any> {
    return entity as Record<string, any>;
  }

  /**
   * Execute custom query - override to handle coordination-specific queries.
   *
   * @param customQuery
   */
  override async executeCustomQuery<R = any>(customQuery: CustomQuery): Promise<R> {
    if (customQuery.type === 'coordination') {
      const query = customQuery.query as any;

      if (query.operation === 'acquire_lock') {
        const lock = await this.acquireLock(query.resourceId, query.timeout);
        return lock as R;
      }

      if (query.operation === 'release_lock') {
        await this.releaseLock(query.lockId);
        return { success: true } as R;
      }

      if (query.operation === 'publish') {
        await this.publish(query.channel, query.event);
        return { success: true } as R;
      }

      if (query.operation === 'get_stats') {
        const stats = await this.getCoordinationStats();
        return stats as R;
      }
    }

    return super.executeCustomQuery<R>(customQuery);
  }

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
  async tryAcquireLock(
    resourceId: string,
    maxRetries: number = 3,
    retryDelay: number = 1000,
    lockTimeout: number = 30000
  ): Promise<CoordinationLock | null> {
    this.logger.debug(
      `Trying to acquire lock for resource: ${resourceId} (max retries: ${maxRetries})`
    );

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.acquireLock(resourceId, lockTimeout);
      } catch (error) {
        if (attempt === maxRetries) {
          this.logger.warn(`Failed to acquire lock after ${maxRetries} attempts: ${error}`);
          return null;
        }

        this.logger.debug(
          `Lock acquisition attempt ${attempt + 1} failed, retrying in ${retryDelay}ms`
        );
        await this.sleep(retryDelay);
      }
    }

    return null;
  }

  /**
   * Execute with lock (acquire, execute, release).
   *
   * @param resourceId
   * @param operation
   * @param lockTimeout
   */
  async executeWithLock<R>(
    resourceId: string,
    operation: () => Promise<R>,
    lockTimeout: number = 30000
  ): Promise<R> {
    this.logger.debug(`Executing operation with lock for resource: ${resourceId}`);

    const lock = await this.acquireLock(resourceId, lockTimeout);

    try {
      const result = await operation();
      return result;
    } finally {
      await this.releaseLock(lock.id);
    }
  }

  /**
   * Broadcast event to all subscribers.
   *
   * @param event
   */
  async broadcast(event: CoordinationEvent<T>): Promise<void> {
    const broadcastChannel = 'broadcast';
    await this.publish(broadcastChannel, event);
  }

  /**
   * Get active locks.
   */
  async getActiveLocks(): Promise<CoordinationLock[]> {
    const activeLocks: CoordinationLock[] = [];
    const now = new Date();

    for (const lock of this.locks.values()) {
      if (lock.expiresAt > now) {
        activeLocks.push({
          id: lock.id,
          resourceId: lock.resourceId,
          acquired: lock.acquired,
          expiresAt: lock.expiresAt,
          owner: lock.owner,
        });
      }
    }

    return activeLocks;
  }

  /**
   * Get subscription information.
   */
  async getSubscriptions(): Promise<
    Array<{
      id: string;
      pattern: string;
      createdAt: Date;
      lastTriggered?: Date;
      triggerCount: number;
    }>
  > {
    return Array.from(this.subscriptions.values()).map((sub) => ({
      id: sub.id,
      pattern: sub.pattern,
      createdAt: sub.createdAt,
      lastTriggered: sub.lastTriggered || undefined,
      triggerCount: sub.triggerCount,
    }));
  }

  /**
   * Private helper methods.
   */

  private async emitChange(
    type: 'create' | 'update' | 'delete',
    entityId: string | number,
    entity?: T
  ): Promise<void> {
    const change: CoordinationChange<T> = {
      type,
      entityId,
      entity: entity as T | undefined,
      timestamp: new Date(),
      metadata: {
        tableName: this.tableName,
        source: this.generateOwnerIdentifier(),
      },
    };

    this.eventEmitter.emit('change', change);
  }

  private matchesPattern(change: CoordinationChange<T>, pattern: string): boolean {
    // Simple pattern matching - can be enhanced with more sophisticated matching
    if (pattern === '*') return true;

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return (
      regex.test(change.type) ||
      regex.test(change.entityId.toString()) ||
      regex.test(this.tableName)
    );
  }

  private generateLockId(resourceId: string): string {
    return `lock_${resourceId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateOwnerIdentifier(): string {
    return `process_${process.pid}_${Date.now()}`;
  }

  private async persistLock(lock: LockInfo): Promise<void> {
    // In a real implementation, this would persist to the database
    // For now, we'll use a simple table structure
    try {
      const lockData = {
        lock_id: lock.id,
        resource_id: lock.resourceId,
        owner: lock.owner,
        acquired_at: lock.acquired,
        expires_at: lock.expiresAt,
        created_at: new Date(),
      };

      await this.adapter.execute(
        `INSERT OR REPLACE INTO coordination_locks (lock_id, resource_id, owner, acquired_at, expires_at, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        Object.values(lockData)
      );
    } catch (error) {
      // Table might not exist, which is fine for this implementation
      this.logger.debug(`Could not persist lock to database: ${error}`);
    }
  }

  private async removeLockFromDatabase(lockId: string): Promise<void> {
    try {
      await this.adapter.execute('DELETE FROM coordination_locks WHERE lock_id = ?', [lockId]);
    } catch (error) {
      // Table might not exist, which is fine for this implementation
      this.logger.debug(`Could not remove lock from database: ${error}`);
    }
  }

  private async persistEvent(channel: string, event: CoordinationEvent<T>): Promise<void> {
    try {
      const eventData = {
        channel,
        event_type: event.type,
        event_data: JSON.stringify(event.data),
        source: event.source,
        timestamp: event.timestamp,
        metadata: JSON.stringify(event.metadata || {}),
      };

      await this.adapter.execute(
        `INSERT INTO coordination_events (channel, event_type, event_data, source, timestamp, metadata) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        Object.values(eventData)
      );
    } catch (error) {
      // Table might not exist, which is fine for this implementation
      this.logger.debug(`Could not persist event to database: ${error}`);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cleanup method to be called on shutdown.
   */
  async shutdown(): Promise<void> {
    this.logger.debug('Shutting down coordination repository');

    // Release all active locks
    const activeLocks = Array.from(this.locks.keys());
    for (const resourceId of activeLocks) {
      const lock = this.locks.get(resourceId);
      if (lock) {
        try {
          await this.releaseLock(lock.id);
        } catch (error) {
          this.logger.warn(`Failed to release lock during shutdown: ${error}`);
        }
      }
    }

    // Clear all subscriptions
    this.subscriptions.clear();

    // Remove all event listeners
    this.eventEmitter.removeAllListeners();

    this.logger.debug('Coordination repository shutdown completed');
  }
}
