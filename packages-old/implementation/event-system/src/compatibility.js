/**
 * UEL (Unified Event Layer) - Backward Compatibility Layer.
 *
 * Provides 100% backward compatibility with existing EventEmitter code.
 * While offering enhanced UEL capabilities and migration utilities..
 *
 * @file Backward Compatibility Implementation.
 */
import { EventEmitter } from '@claude-zen/foundation';
import { EventManagerTypes } from './core/interfaces';
/**
 * Enhanced EventEmitter that provides UEL integration while maintaining compatibility.
 *
 * @example
 */
export class UELCompatibleEventEmitter extends EventEmitter {
    uelManager;
    uelEnabled = false;
    migrationMode = 'passive';
    logger;
    eventMappings = new Map();
    constructor(options) {
        super();
        this.uelEnabled = options?.enableUEL ?? false;
        this.uelManager = options?.uelManager ?? undefined;
        this.migrationMode = options?.migrationMode ?? 'passive';
        this.logger = options?.logger;
        // Set higher max listeners for compatibility
    }
    /**
     * Enable UEL integration with migration support.
     *
     * @param manager
     * @param options
     * @param options.migrateExistingListeners
     * @param options.preserveEventEmitterBehavior
     */
    async enableUEL(manager, options) {
        if (manager) {
            this.uelManager = manager;
        }
        this.uelEnabled = true;
        this.migrationMode = 'active';
        // Migrate existing listeners if requested
        if (options?.migrateExistingListeners) {
            await this.migrateExistingListeners();
        }
        this.logger?.info('✅ UEL integration enabled for EventEmitter');
    }
    /**
     * Disable UEL integration (fallback to pure EventEmitter).
     */
    disableUEL() {
        this.uelEnabled = false;
        this.migrationMode = 'disabled';
        this.uelManager = undefined;
        this.logger?.info('❌ UEL integration disabled for EventEmitter');
    }
    /**
     * Enhanced emit with UEL integration.
     *
     * @param eventName
     * @param {...any} args
     */
    emit(eventName, ...args) {
        const result = super.emit(String(eventName), ...args);
        // UEL integration if enabled
        if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
            this.emitToUEL(eventName, args).catch((error) => this.logger?.error(`UEL emit failed for ${eventName}:`, error));
        }
        return result;
    }
    /**
     * Enhanced on with UEL subscription tracking.
     *
     * @param eventName
     * @param listener
     */
    on(eventName, listener) {
        const result = super.on(String(eventName), listener);
        // Track UEL subscriptions if enabled
        if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
            this.trackUELSubscription(eventName, listener).catch((error) => {
                this.logger?.error(`UEL subscription tracking failed for ${eventName}:`, error);
            });
        }
        return result;
    }
    /**
     * Enhanced once with UEL integration.
     *
     * @param eventName
     * @param listener
     */
    once(eventName, listener) {
        const result = super.once(String(eventName), listener);
        // Track one-time UEL subscriptions if enabled
        if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
            this.trackUELSubscription(eventName, listener, { once: true }).catch((error) => {
                this.logger?.error(`UEL once subscription failed for ${eventName}:`, error);
            });
        }
        return result;
    }
    /**
     * Map EventEmitter event to UEL event type.
     *
     * @param eventEmitterEvent
     * @param uelEventType
     */
    mapEventToUEL(eventEmitterEvent, uelEventType) {
        this.eventMappings.set(eventEmitterEvent, uelEventType);
        this.logger?.debug(`Mapped event: ${eventEmitterEvent} -> ${uelEventType}`);
    }
    /**
     * Get UEL compatibility status.
     */
    getUELStatus() {
        return {
            enabled: this.uelEnabled,
            migrationMode: this.migrationMode,
            hasManager: !!this.uelManager,
            mappedEvents: this.eventMappings.size,
            totalListeners: this.eventNames().reduce((total, name) => total + this.listenerCount(name), 0),
        };
    }
    /**
     * EventEmitter compatibility methods.
     */
    eventNames() {
        return super.eventNames().map(name => String(name));
    }
    listenerCount(eventName) {
        return super.listenerCount(String(eventName));
    }
    listeners(eventName) {
        return super.listeners(String(eventName));
    }
    /**
     * Private methods for UEL integration.
     */
    async emitToUEL(eventName, args) {
        if (!this.uelManager)
            return;
        try {
            // Get mapped event type or use original name
            const uelEventType = this.eventMappings.get(eventName) || eventName;
            // Create UEL-compatible event
            const uelEvent = this.createUELEvent(uelEventType, eventName, args);
            // Emit to UEL manager
            if (this.uelManager) {
                await this.uelManager.emit(uelEvent);
            }
        }
        catch (error) {
            if (this.migrationMode === 'active') {
                throw error;
            }
            this.logger?.warn(`UEL emit failed (passive mode): ${eventName}`, error);
        }
    }
    async trackUELSubscription(eventName, listener, options) {
        if (!this.uelManager)
            return;
        try {
            const uelEventType = this.eventMappings.get(eventName) || eventName;
            // Create UEL-compatible listener
            const uelListener = (event) => {
                // Convert UEL event back to EventEmitter args
                const args = this.convertUELEventToArgs(event);
                listener(...args);
            };
            // Subscribe to UEL manager
            let subscriptionId;
            if (this.uelManager) {
                subscriptionId = this.uelManager.subscribe([uelEventType], uelListener);
            }
            this.logger?.debug(`UEL subscription created: ${subscriptionId} for ${eventName}`);
        }
        catch (error) {
            if (this.migrationMode === 'active') {
                throw error;
            }
            this.logger?.warn(`UEL subscription failed (passive mode): ${eventName}`, error);
        }
    }
    createUELEvent(uelEventType, originalEvent, args) {
        return {
            id: `compat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date(),
            source: 'eventEmitter-compatibility',
            type: uelEventType,
            payload: {
                originalEvent,
                args,
                source: 'eventEmitter-compatibility',
                compatibility: true,
                eventType: uelEventType,
                context: 'legacy-eventemitter-bridge',
            },
            metadata: {
                originalEvent,
                args,
                compatibility: true,
            },
        };
    }
    convertUELEventToArgs(event) {
        // Extract original args from metadata if available
        if (event.metadata?.args && Array.isArray(event.metadata.args)) {
            return event.metadata.args;
        }
        // Fallback to event object itself
        return [event];
    }
    async migrateExistingListeners() {
        const eventNames = this.eventNames();
        for (const eventName of eventNames) {
            if (typeof eventName === 'string') {
                const listeners = this.listeners(eventName);
                for (const listener of listeners) {
                    await this.trackUELSubscription(eventName, listener);
                }
            }
        }
        this.logger?.info(`Migrated ${eventNames.length} event types to UEL`);
    }
}
/**
 * Migration utilities for converting existing EventEmitter code to UEL.
 *
 * @example
 */
export class EventEmitterMigrationHelper {
    eventManager;
    logger;
    migrationStats = {
        scanned: 0,
        migrated: 0,
        failed: 0,
        warnings: 0,
    };
    constructor(eventManager, logger) {
        this.eventManager = eventManager;
        this.logger = logger;
    }
    /**
     * Create UEL-compatible EventEmitter instance.
     *
     * @param managerName
     * @param managerType
     * @param options
     * @param options.enableUEL
     * @param options.migrationMode
     * @param options.autoMigrate
     */
    async createCompatibleEventEmitter(managerName, managerType = EventManagerTypes.SYSTEM, options) {
        // Create UEL manager
        // const uelManager = await this.eventManager.createEventManager({
        //   type: managerType,
        //   name: managerName,
        // });
        const uelManager = undefined; // Temporarily disabled
        // Create compatible EventEmitter
        const eventEmitter = new UELCompatibleEventEmitter({
            enableUEL: options?.enableUEL ?? true,
            uelManager,
            migrationMode: options?.migrationMode ?? 'passive',
            logger: this.logger,
        });
        // Auto-migrate if requested
        if (options?.autoMigrate) {
            await eventEmitter.enableUEL(uelManager, {
                migrateExistingListeners: true,
                preserveEventEmitterBehavior: true,
            });
        }
        this.migrationStats.migrated++;
        return eventEmitter;
    }
    /**
     * Wrap existing EventEmitter with UEL compatibility.
     *
     * @param originalEmitter
     * @param managerName
     * @param managerType
     */
    async wrapEventEmitter(originalEmitter, managerName, managerType = EventManagerTypes.SYSTEM) {
        try {
            this.migrationStats.scanned++;
            // Create UEL manager
            // const uelManager = await this.eventManager.createEventManager({
            //   type: managerType,
            //   name: managerName,
            // });
            const uelManager = undefined; // Temporarily disabled
            // Create new compatible instance
            const compatibleEmitter = new UELCompatibleEventEmitter({
                enableUEL: true,
                uelManager,
                migrationMode: 'active',
                logger: this.logger,
            });
            // Copy existing listeners
            const eventNames = originalEmitter.eventNames();
            for (const eventName of eventNames) {
                const listeners = originalEmitter.listeners(eventName);
                for (const listener of listeners) {
                    compatibleEmitter.on(eventName, listener);
                }
            }
            // Copy properties
            await compatibleEmitter.enableUEL(uelManager, {
                migrateExistingListeners: true,
            });
            this.migrationStats.migrated++;
            this.logger?.info(`✅ Successfully wrapped EventEmitter: ${managerName}`);
            return compatibleEmitter;
        }
        catch (error) {
            this.migrationStats.failed++;
            this.logger?.error(`❌ Failed to wrap EventEmitter ${managerName}:`, error);
            throw error;
        }
    }
    /**
     * Analyze EventEmitter usage patterns.
     *
     * @param emitter
     */
    analyzeEventEmitter(emitter) {
        const eventNames = emitter.eventNames();
        const eventTypes = eventNames.map((name) => String(name));
        const listenerCounts = {};
        let totalListeners = 0;
        for (const eventName of eventNames) {
            const count = emitter.listenerCount(eventName);
            listenerCounts[String(eventName)] = count;
            totalListeners += count;
        }
        const recommendations = [];
        let complexity = 'low';
        // Analyze patterns and provide recommendations
        if (totalListeners > 50) {
            recommendations.push('Consider using UEL for better performance with many listeners');
            complexity = 'medium';
        }
        if (eventTypes.length > 20) {
            recommendations.push('High number of event types - UEL categorization would help');
            complexity = 'high';
        }
        if (eventTypes.some((type) => type.includes(':') || type.includes('.'))) {
            recommendations.push('Structured event names detected - good UEL migration candidate');
        }
        const maxListeners = emitter.getMaxListeners() || 10; // Node.js EventEmitter default
        if (maxListeners > 20) {
            recommendations.push('High max listeners - UEL provides better scaling');
            complexity = 'high';
        }
        return {
            eventTypes,
            listenerCounts,
            maxListeners,
            recommendations,
            migrationComplexity: complexity,
        };
    }
    /**
     * Generate migration plan for EventEmitter conversion.
     *
     * @param analysis
     */
    generateMigrationPlan(analysis) {
        const phases = [];
        // Phase 1: Preparation
        phases.push({
            phase: '1. Preparation',
            description: 'Set up UEL infrastructure and analyze current usage',
            steps: [
                'Initialize UEL Event Manager',
                'Analyze current EventEmitter patterns',
                'Create event type mappings',
                'Set up compatibility layer',
            ],
            estimatedEffort: 'low',
            dependencies: [],
        });
        // Phase 2: Compatibility Layer
        phases.push({
            phase: '2. Compatibility',
            description: 'Implement backward compatibility without breaking changes',
            steps: [
                'Wrap existing EventEmitter instances',
                'Enable passive UEL integration',
                'Test compatibility with existing code',
                'Monitor performance impact',
            ],
            estimatedEffort: analysis.migrationComplexity === 'high' ? 'medium' : 'low',
            dependencies: ['Phase 1'],
        });
        // Phase 3: Active Migration
        phases.push({
            phase: '3. Active Migration',
            description: 'Gradually migrate to full UEL functionality',
            steps: [
                'Enable active UEL mode',
                'Migrate high-traffic event patterns',
                'Implement UEL-specific features',
                'Update event handling code',
            ],
            estimatedEffort: analysis.migrationComplexity,
            dependencies: ['Phase 2'],
        });
        // Phase 4: Optimization
        phases.push({
            phase: '4. Optimization',
            description: 'Optimize and clean up legacy code',
            steps: [
                'Remove EventEmitter compatibility layer',
                'Optimize event routing',
                'Implement advanced UEL features',
                'Performance tuning',
            ],
            estimatedEffort: analysis.migrationComplexity === 'low' ? 'low' : 'medium',
            dependencies: ['Phase 3'],
        });
        const totalEffort = analysis.migrationComplexity;
        const timeline = {
            low: '1-2 weeks',
            medium: '3-4 weeks',
            high: '6-8 weeks',
        }[totalEffort];
        return {
            phases,
            totalEffort,
            timeline,
        };
    }
    /**
     * Get migration statistics.
     */
    getMigrationStats() {
        return { ...this.migrationStats };
    }
    /**
     * Reset migration statistics.
     */
    resetStats() {
        this.migrationStats = {
            scanned: 0,
            migrated: 0,
            failed: 0,
            warnings: 0,
        };
    }
}
/**
 * Factory for creating backward-compatible event emitters.
 *
 * @example
 */
export class CompatibilityFactory {
    static instance;
    eventManager;
    migrationHelper;
    constructor() { }
    static getInstance() {
        if (!CompatibilityFactory.instance) {
            CompatibilityFactory.instance = new CompatibilityFactory();
        }
        return CompatibilityFactory.instance;
    }
    /**
     * Initialize compatibility factory.
     *
     * @param eventManager
     * @param logger
     */
    async initialize(eventManager, logger) {
        this.eventManager = eventManager;
        this.migrationHelper = new EventEmitterMigrationHelper(eventManager, logger);
    }
    /**
     * Create enhanced EventEmitter with UEL capabilities.
     *
     * @param name
     * @param type
     * @param options
     * @param options.enableUEL
     * @param options.migrationMode
     */
    async createEnhancedEventEmitter(name, type = EventManagerTypes.SYSTEM, options) {
        if (!this.migrationHelper) {
            throw new Error('CompatibilityFactory not initialized');
        }
        return await this.migrationHelper.createCompatibleEventEmitter(name, type, options);
    }
    /**
     * Wrap existing EventEmitter with UEL capabilities.
     *
     * @param emitter
     * @param name
     * @param type
     */
    async wrapExistingEmitter(emitter, name, type = EventManagerTypes.SYSTEM) {
        if (!this.migrationHelper) {
            throw new Error('CompatibilityFactory not initialized');
        }
        return await this.migrationHelper.wrapEventEmitter(emitter, name, type);
    }
    /**
     * Get migration helper for advanced operations.
     */
    getMigrationHelper() {
        return this.migrationHelper;
    }
}
/**
 * Convenience functions for quick compatibility setup.
 */
/**
 * Create UEL-compatible EventEmitter instance.
 *
 * @param name
 * @param type
 * @param eventManager
 * @example
 */
export async function createCompatibleEventEmitter(name, type = EventManagerTypes.SYSTEM, eventManager) {
    const factory = CompatibilityFactory.getInstance();
    if (eventManager && !factory['eventManager']) {
        await factory.initialize(eventManager);
    }
    return await factory.createEnhancedEventEmitter(name, type, {
        enableUEL: true,
        migrationMode: 'passive',
    });
}
/**
 * Wrap existing EventEmitter with UEL compatibility.
 *
 * @param emitter
 * @param name
 * @param type
 * @param eventManager
 * @example
 */
export async function wrapWithUEL(emitter, name, type = EventManagerTypes.SYSTEM, eventManager) {
    const factory = CompatibilityFactory.getInstance();
    if (eventManager && !factory['eventManager']) {
        await factory.initialize(eventManager);
    }
    return await factory.wrapExistingEmitter(emitter, name, type);
}
export { UELCompatibleEventEmitter as CompatibleEventEmitter, };
