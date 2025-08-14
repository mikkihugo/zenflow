import { EventEmitter } from 'node:events';
import { BaseDao } from '../base.dao.ts';
export class CoordinationDao extends BaseDao {
    eventEmitter = new EventEmitter();
    locks = new Map();
    subscriptions = new Map();
    publishedMessages = 0;
    receivedMessages = 0;
    startTime = Date.now();
    constructor(adapter, logger, tableName, entitySchema) {
        super(adapter, logger, tableName, entitySchema);
        this.eventEmitter.setMaxListeners(1000);
    }
    async acquireLock(resourceId, lockTimeout = 30000) {
        this.logger.debug(`Acquiring lock for resource: ${resourceId}, timeout: ${lockTimeout}ms`);
        const lockId = this.generateLockId(resourceId);
        const existingLock = this.locks.get(resourceId);
        if (existingLock && existingLock.expiresAt > new Date()) {
            throw new Error(`Resource ${resourceId} is already locked by ${existingLock.owner}`);
        }
        const lock = {
            id: lockId,
            resourceId,
            acquired: new Date(),
            expiresAt: new Date(Date.now() + lockTimeout),
            owner: this.generateOwnerIdentifier(),
        };
        const timer = setTimeout(() => {
            this.releaseLock(lockId).catch((error) => {
                this.logger.warn(`Failed to auto-release lock ${lockId}: ${error}`);
            });
        }, lockTimeout);
        const lockInfo = {
            ...lock,
            timer,
        };
        this.locks.set(resourceId, lockInfo);
        try {
            await this.persistLock(lockInfo);
        }
        catch (error) {
            this.logger.warn(`Failed to persist lock to database: ${error}`);
        }
        this.logger.debug(`Lock acquired: ${lockId} for resource: ${resourceId}`);
        return lock;
    }
    async releaseLock(lockId) {
        this.logger.debug(`Releasing lock: ${lockId}`);
        let resourceId = null;
        let lockInfo = null;
        for (const [resource, lock] of this.locks.entries()) {
            if (lock.id === lockId) {
                resourceId = resource;
                lockInfo = lock;
                break;
            }
        }
        if (!(lockInfo && resourceId)) {
            throw new Error(`Lock ${lockId} not found`);
        }
        if (lockInfo.timer) {
            clearTimeout(lockInfo.timer);
        }
        this.locks.delete(resourceId);
        try {
            await this.removeLockFromDatabase(lockId);
        }
        catch (error) {
            this.logger.warn(`Failed to remove lock from database: ${error}`);
        }
        this.logger.debug(`Lock released: ${lockId}`);
    }
    async subscribe(pattern, callback) {
        const subscriptionId = this.generateSubscriptionId();
        this.logger.debug(`Creating subscription: ${subscriptionId} for pattern: ${pattern}`);
        const subscription = {
            id: subscriptionId,
            pattern,
            callback,
            createdAt: new Date(),
            triggerCount: 0,
        };
        this.subscriptions.set(subscriptionId, subscription);
        this.eventEmitter.on('change', (change) => {
            if (this.matchesPattern(change, pattern)) {
                subscription.lastTriggered = new Date();
                subscription.triggerCount++;
                try {
                    callback(change);
                }
                catch (error) {
                    this.logger.error(`Error in subscription callback ${subscriptionId}: ${error}`);
                }
            }
        });
        this.logger.debug(`Subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    async unsubscribe(subscriptionId) {
        this.logger.debug(`Unsubscribing: ${subscriptionId}`);
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
            throw new Error(`Subscription ${subscriptionId} not found`);
        }
        this.subscriptions.delete(subscriptionId);
        this.logger.debug(`Unsubscribed: ${subscriptionId}`);
    }
    async publish(channel, event) {
        this.logger.debug(`Publishing event to channel: ${channel}`, { event });
        try {
            this.eventEmitter.emit('event', { channel, event });
            await this.persistEvent(channel, event);
            this.publishedMessages++;
            this.logger.debug(`Event published to channel: ${channel}`);
        }
        catch (error) {
            this.logger.error(`Failed to publish event: ${error}`);
            throw new Error(`Publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getCoordinationStats() {
        return {
            activeLocks: this.locks.size,
            activeSubscriptions: this.subscriptions.size,
            messagesPublished: this.publishedMessages,
            messagesReceived: this.receivedMessages,
            uptime: Date.now() - this.startTime,
        };
    }
    async execute(sql, params) {
        try {
            const result = await this.adapter.execute(sql, params);
            return {
                affectedRows: result.affectedRows,
                insertId: result.insertId,
            };
        }
        catch (error) {
            this.logger.error('Execute query failed:', error);
            throw error;
        }
    }
    async query(sql, params) {
        try {
            const result = await this.adapter.query(sql, params);
            return result.rows;
        }
        catch (error) {
            this.logger.error('Query failed:', error);
            throw error;
        }
    }
    async create(entity) {
        const created = await super.create(entity);
        await this.emitChange('create', created.id, created);
        return created;
    }
    async update(id, updates) {
        const updated = await super.update(id, updates);
        await this.emitChange('update', id, updated);
        return updated;
    }
    async delete(id) {
        const deleted = await super.delete(id);
        if (deleted) {
            await this.emitChange('delete', id);
        }
        return deleted;
    }
    mapRowToEntity(row) {
        return row;
    }
    mapEntityToRow(entity) {
        return entity;
    }
    async executeCustomQuery(customQuery) {
        if (customQuery.type === 'coordination') {
            const query = customQuery.query;
            if (query.operation === 'acquire_lock') {
                const lock = await this.acquireLock(query.resourceId, query.timeout);
                return lock;
            }
            if (query.operation === 'release_lock') {
                await this.releaseLock(query.lockId);
                return { success: true };
            }
            if (query.operation === 'publish') {
                await this.publish(query.channel, query.event);
                return { success: true };
            }
            if (query.operation === 'get_stats') {
                const stats = await this.getCoordinationStats();
                return stats;
            }
        }
        return super.executeCustomQuery(customQuery);
    }
    async tryAcquireLock(resourceId, maxRetries = 3, retryDelay = 1000, lockTimeout = 30000) {
        this.logger.debug(`Trying to acquire lock for resource: ${resourceId} (max retries: ${maxRetries})`);
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await this.acquireLock(resourceId, lockTimeout);
            }
            catch (error) {
                if (attempt === maxRetries) {
                    this.logger.warn(`Failed to acquire lock after ${maxRetries} attempts: ${error}`);
                    return null;
                }
                this.logger.debug(`Lock acquisition attempt ${attempt + 1} failed, retrying in ${retryDelay}ms`);
                await this.sleep(retryDelay);
            }
        }
        return null;
    }
    async executeWithLock(resourceId, operation, lockTimeout = 30000) {
        this.logger.debug(`Executing operation with lock for resource: ${resourceId}`);
        const lock = await this.acquireLock(resourceId, lockTimeout);
        try {
            const result = await operation();
            return result;
        }
        finally {
            await this.releaseLock(lock.id);
        }
    }
    async broadcast(event) {
        const broadcastChannel = 'broadcast';
        await this.publish(broadcastChannel, event);
    }
    async getActiveLocks() {
        const activeLocks = [];
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
    async getSubscriptions() {
        return Array.from(this.subscriptions.values()).map((sub) => ({
            id: sub.id,
            pattern: sub.pattern,
            createdAt: sub.createdAt,
            ...(sub.lastTriggered && { lastTriggered: sub.lastTriggered }),
            triggerCount: sub.triggerCount,
        }));
    }
    async emitChange(type, entityId, entity) {
        const change = {
            type,
            entityId,
            entity,
            timestamp: new Date(),
            metadata: {
                tableName: this.tableName,
                source: this.generateOwnerIdentifier(),
            },
        };
        this.eventEmitter.emit('change', change);
    }
    matchesPattern(change, pattern) {
        if (pattern === '*')
            return true;
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return (regex.test(change.type) ||
            regex.test(change.entityId.toString()) ||
            regex.test(this.tableName));
    }
    generateLockId(resourceId) {
        return `lock_${resourceId}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    generateSubscriptionId() {
        return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    }
    generateOwnerIdentifier() {
        return `process_${process.pid}_${Date.now()}`;
    }
    async persistLock(lock) {
        try {
            const lockData = {
                lock_id: lock.id,
                resource_id: lock.resourceId,
                owner: lock.owner,
                acquired_at: lock.acquired,
                expires_at: lock.expiresAt,
                created_at: new Date(),
            };
            await this.adapter.execute(`INSERT OR REPLACE INTO coordination_locks (lock_id, resource_id, owner, acquired_at, expires_at, created_at) 
         VALUES (?, ?, ?, ?, ?, ?)`, Object.values(lockData));
        }
        catch (error) {
            this.logger.debug(`Could not persist lock to database: ${error}`);
        }
    }
    async removeLockFromDatabase(lockId) {
        try {
            await this.adapter.execute('DELETE FROM coordination_locks WHERE lock_id = ?', [lockId]);
        }
        catch (error) {
            this.logger.debug(`Could not remove lock from database: ${error}`);
        }
    }
    async persistEvent(channel, event) {
        try {
            const eventData = {
                channel,
                event_type: event.type,
                event_data: JSON.stringify(event.data),
                source: event.source,
                timestamp: event.timestamp,
                metadata: JSON.stringify(event.metadata || {}),
            };
            await this.adapter.execute(`INSERT INTO coordination_events (channel, event_type, event_data, source, timestamp, metadata) 
         VALUES (?, ?, ?, ?, ?, ?)`, Object.values(eventData));
        }
        catch (error) {
            this.logger.debug(`Could not persist event to database: ${error}`);
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async shutdown() {
        this.logger.debug('Shutting down coordination repository');
        const activeLocks = Array.from(this.locks.keys());
        for (const resourceId of activeLocks) {
            const lock = this.locks.get(resourceId);
            if (lock) {
                try {
                    await this.releaseLock(lock.id);
                }
                catch (error) {
                    this.logger.warn(`Failed to release lock during shutdown: ${error}`);
                }
            }
        }
        this.subscriptions.clear();
        this.eventEmitter.removeAllListeners();
        this.logger.debug('Coordination repository shutdown completed');
    }
}
//# sourceMappingURL=coordination.dao.js.map