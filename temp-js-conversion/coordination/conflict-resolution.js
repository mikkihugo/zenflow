"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptimisticLockManager = exports.ConflictResolver = exports.VotingResolutionStrategy = exports.TimestampResolutionStrategy = exports.PriorityResolutionStrategy = void 0;
/**
 * Priority-based resolution strategy
 */
class PriorityResolutionStrategy {
    constructor() {
        this.name = 'priority';
    }
    async resolve(conflict, context) {
        const priorities = conflict.agents.map(agentId => ({
            agentId,
            priority: context.agentPriorities.get(agentId) || 0,
        }));
        // Sort by priority (descending)
        priorities.sort((a, b) => b.priority - a.priority);
        const winner = priorities[0].agentId;
        const losers = priorities.slice(1).map(p => p.agentId);
        return {
            type: 'priority',
            winner,
            losers,
            reason: `Agent ${winner} has highest priority (${priorities[0].priority})`,
            timestamp: new Date(),
        };
    }
}
exports.PriorityResolutionStrategy = PriorityResolutionStrategy;
/**
 * First-come-first-served resolution strategy
 */
class TimestampResolutionStrategy {
    constructor() {
        this.name = 'timestamp';
    }
    async resolve(conflict, context) {
        const timestamps = conflict.agents.map(agentId => ({
            agentId,
            timestamp: context.requestTimestamps.get(agentId) || new Date(),
        }));
        // Sort by timestamp (ascending - earliest first)
        timestamps.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const winner = timestamps[0].agentId;
        const losers = timestamps.slice(1).map(t => t.agentId);
        return {
            type: 'timestamp',
            winner,
            losers,
            reason: `Agent ${winner} made the earliest request`,
            timestamp: new Date(),
        };
    }
}
exports.TimestampResolutionStrategy = TimestampResolutionStrategy;
/**
 * Voting-based resolution strategy (for multi-agent consensus)
 */
class VotingResolutionStrategy {
    constructor() {
        this.name = 'vote';
    }
    async resolve(conflict, context) {
        const voteCounts = new Map();
        // Count votes
        for (const [agentId, voters] of context.votes) {
            voteCounts.set(agentId, voters.length);
        }
        // Find winner
        let maxVotes = 0;
        let winner = '';
        const losers = [];
        for (const [agentId, votes] of voteCounts) {
            if (votes > maxVotes) {
                if (winner) {
                    losers.push(winner);
                }
                maxVotes = votes;
                winner = agentId;
            }
            else {
                losers.push(agentId);
            }
        }
        return {
            type: 'vote',
            winner,
            losers,
            reason: `Agent ${winner} received the most votes (${maxVotes})`,
            timestamp: new Date(),
        };
    }
}
exports.VotingResolutionStrategy = VotingResolutionStrategy;
/**
 * Conflict resolution manager
 */
class ConflictResolver {
    constructor(logger, eventBus) {
        this.logger = logger;
        this.eventBus = eventBus;
        this.strategies = new Map();
        this.conflicts = new Map();
        this.resolutionHistory = [];
        // Register default strategies
        this.registerStrategy(new PriorityResolutionStrategy());
        this.registerStrategy(new TimestampResolutionStrategy());
        this.registerStrategy(new VotingResolutionStrategy());
    }
    /**
     * Register a conflict resolution strategy
     */
    registerStrategy(strategy) {
        this.strategies.set(strategy.name, strategy);
        this.logger.info('Registered conflict resolution strategy', { name: strategy.name });
    }
    /**
     * Report a resource conflict
     */
    async reportResourceConflict(resourceId, agents) {
        const conflict = {
            id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            resourceId,
            agents,
            timestamp: new Date(),
            resolved: false,
        };
        this.conflicts.set(conflict.id, conflict);
        this.logger.warn('Resource conflict reported', conflict);
        // Emit conflict event
        this.eventBus.emit('conflict:resource', conflict);
        return conflict;
    }
    /**
     * Report a task conflict
     */
    async reportTaskConflict(taskId, agents, type) {
        const conflict = {
            id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            taskId,
            agents,
            type,
            timestamp: new Date(),
            resolved: false,
        };
        this.conflicts.set(conflict.id, conflict);
        this.logger.warn('Task conflict reported', conflict);
        // Emit conflict event
        this.eventBus.emit('conflict:task', conflict);
        return conflict;
    }
    /**
     * Resolve a conflict using a specific strategy
     */
    async resolveConflict(conflictId, strategyName, context) {
        const conflict = this.conflicts.get(conflictId);
        if (!conflict) {
            throw new Error(`Conflict not found: ${conflictId}`);
        }
        if (conflict.resolved) {
            throw new Error(`Conflict already resolved: ${conflictId}`);
        }
        const strategy = this.strategies.get(strategyName);
        if (!strategy) {
            throw new Error(`Strategy not found: ${strategyName}`);
        }
        // Resolve the conflict
        const resolution = await strategy.resolve(conflict, context);
        // Update conflict
        conflict.resolved = true;
        conflict.resolution = resolution;
        // Store in history
        this.resolutionHistory.push(resolution);
        // Emit resolution event
        this.eventBus.emit('conflict:resolved', {
            conflict,
            resolution,
        });
        this.logger.info('Conflict resolved', {
            conflictId,
            strategy: strategyName,
            resolution,
        });
        return resolution;
    }
    /**
     * Auto-resolve conflicts based on configuration
     */
    async autoResolve(conflictId, preferredStrategy = 'priority') {
        const conflict = this.conflicts.get(conflictId);
        if (!conflict) {
            throw new Error(`Conflict not found: ${conflictId}`);
        }
        // Build context based on conflict type
        let context = {};
        if (preferredStrategy === 'priority') {
            // In a real implementation, fetch agent priorities from configuration
            context.agentPriorities = new Map(conflict.agents.map((id, index) => [id, conflict.agents.length - index]));
        }
        else if (preferredStrategy === 'timestamp') {
            // In a real implementation, fetch request timestamps
            context.requestTimestamps = new Map(conflict.agents.map((id, index) => [id, new Date(Date.now() - index * 1000)]));
        }
        return this.resolveConflict(conflictId, preferredStrategy, context);
    }
    /**
     * Get active conflicts
     */
    getActiveConflicts() {
        return Array.from(this.conflicts.values()).filter(c => !c.resolved);
    }
    /**
     * Get conflict history
     */
    getConflictHistory(limit) {
        if (limit) {
            return this.resolutionHistory.slice(-limit);
        }
        return [...this.resolutionHistory];
    }
    /**
     * Clear resolved conflicts older than a certain age
     */
    cleanupOldConflicts(maxAgeMs) {
        const now = Date.now();
        let removed = 0;
        for (const [id, conflict] of this.conflicts) {
            if (conflict.resolved && now - conflict.timestamp.getTime() > maxAgeMs) {
                this.conflicts.delete(id);
                removed++;
            }
        }
        // Also cleanup old history
        const cutoffTime = now - maxAgeMs;
        this.resolutionHistory = this.resolutionHistory.filter(r => r.timestamp.getTime() > cutoffTime);
        return removed;
    }
    /**
     * Get conflict statistics
     */
    getStats() {
        const stats = {
            totalConflicts: this.conflicts.size,
            activeConflicts: 0,
            resolvedConflicts: 0,
            resolutionsByStrategy: {},
            conflictsByType: {
                resource: 0,
                task: 0,
            },
        };
        for (const conflict of this.conflicts.values()) {
            if (conflict.resolved) {
                stats.resolvedConflicts++;
                if (conflict.resolution) {
                    const strategy = conflict.resolution.type;
                    stats.resolutionsByStrategy[strategy] =
                        (stats.resolutionsByStrategy[strategy] || 0) + 1;
                }
            }
            else {
                stats.activeConflicts++;
            }
            if ('resourceId' in conflict) {
                stats.conflictsByType.resource++;
            }
            else {
                stats.conflictsByType.task++;
            }
        }
        return stats;
    }
}
exports.ConflictResolver = ConflictResolver;
/**
 * Optimistic concurrency control for resource updates
 */
class OptimisticLockManager {
    constructor(logger) {
        this.logger = logger;
        this.versions = new Map();
        this.locks = new Map();
    }
    /**
     * Acquire an optimistic lock
     */
    acquireLock(resourceId, agentId) {
        const currentVersion = this.versions.get(resourceId) || 0;
        this.locks.set(resourceId, {
            version: currentVersion,
            holder: agentId,
            timestamp: new Date(),
        });
        this.logger.debug('Optimistic lock acquired', {
            resourceId,
            agentId,
            version: currentVersion,
        });
        return currentVersion;
    }
    /**
     * Validate and update with optimistic lock
     */
    validateAndUpdate(resourceId, agentId, expectedVersion) {
        const currentVersion = this.versions.get(resourceId) || 0;
        const lock = this.locks.get(resourceId);
        // Check if versions match
        if (currentVersion !== expectedVersion) {
            this.logger.warn('Optimistic lock conflict', {
                resourceId,
                agentId,
                expectedVersion,
                currentVersion,
            });
            return false;
        }
        // Check if this agent holds the lock
        if (!lock || lock.holder !== agentId) {
            this.logger.warn('Agent does not hold lock', {
                resourceId,
                agentId,
            });
            return false;
        }
        // Update version
        this.versions.set(resourceId, currentVersion + 1);
        this.locks.delete(resourceId);
        this.logger.debug('Optimistic update successful', {
            resourceId,
            agentId,
            newVersion: currentVersion + 1,
        });
        return true;
    }
    /**
     * Release a lock without updating
     */
    releaseLock(resourceId, agentId) {
        const lock = this.locks.get(resourceId);
        if (lock && lock.holder === agentId) {
            this.locks.delete(resourceId);
            this.logger.debug('Optimistic lock released', {
                resourceId,
                agentId,
            });
        }
    }
    /**
     * Clean up stale locks
     */
    cleanupStaleLocks(maxAgeMs) {
        const now = Date.now();
        let removed = 0;
        for (const [resourceId, lock] of this.locks) {
            if (now - lock.timestamp.getTime() > maxAgeMs) {
                this.locks.delete(resourceId);
                removed++;
                this.logger.warn('Removed stale lock', {
                    resourceId,
                    holder: lock.holder,
                    age: now - lock.timestamp.getTime(),
                });
            }
        }
        return removed;
    }
}
exports.OptimisticLockManager = OptimisticLockManager;
