import { EventEmitter } from 'node:events';
import { EventManagerTypes } from './core/interfaces.ts';
export class UELCompatibleEventEmitter extends EventEmitter {
    uelManager;
    uelEnabled = false;
    eventMappings = new Map();
    migrationMode = 'passive';
    logger;
    constructor(options) {
        super();
        this.uelEnabled = options?.enableUEL ?? false;
        this.uelManager = options?.uelManager ?? undefined;
        this.migrationMode = options?.migrationMode ?? 'passive';
        this.logger = options?.logger;
        this.setMaxListeners(1000);
    }
    async enableUEL(manager, options) {
        if (manager) {
            this.uelManager = manager;
        }
        this.uelEnabled = true;
        this.migrationMode = 'active';
        if (options?.migrateExistingListeners) {
            await this.migrateExistingListeners();
        }
        this.logger?.info('✅ UEL integration enabled for EventEmitter');
    }
    disableUEL() {
        this.uelEnabled = false;
        this.migrationMode = 'disabled';
        this.uelManager = undefined;
        this.logger?.info('❌ UEL integration disabled for EventEmitter');
    }
    emit(eventName, ...args) {
        const result = super.emit(eventName, ...args);
        if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
            this.emitToUEL(eventName, args).catch((error) => {
                this.logger?.error(`UEL emit failed for ${eventName}:`, error);
            });
        }
        return result;
    }
    on(eventName, listener) {
        const result = super.on(eventName, listener);
        if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
            this.trackUELSubscription(eventName, listener).catch((error) => {
                this.logger?.error(`UEL subscription tracking failed for ${eventName}:`, error);
            });
        }
        return result;
    }
    once(eventName, listener) {
        const result = super.once(eventName, listener);
        if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
            this.trackUELSubscription(eventName, listener, { once: true }).catch((error) => {
                this.logger?.error(`UEL once subscription failed for ${eventName}:`, error);
            });
        }
        return result;
    }
    mapEventToUEL(eventEmitterEvent, uelEventType) {
        this.eventMappings.set(eventEmitterEvent, uelEventType);
        this.logger?.debug(`Mapped event: ${eventEmitterEvent} -> ${uelEventType}`);
    }
    getUELStatus() {
        return {
            enabled: this.uelEnabled,
            migrationMode: this.migrationMode,
            hasManager: !!this.uelManager,
            mappedEvents: this.eventMappings.size,
            totalListeners: this.eventNames().reduce((total, name) => total + this.listenerCount(name), 0),
        };
    }
    async emitToUEL(eventName, args) {
        if (!this.uelManager)
            return;
        try {
            const uelEventType = this.eventMappings.get(eventName) || eventName;
            const uelEvent = this.createUELEvent(uelEventType, eventName, args);
            await this.uelManager.emit(uelEvent);
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
            const uelListener = (event) => {
                const args = this.convertUELEventToArgs(event);
                listener(...args);
            };
            const subscriptionId = this.uelManager.subscribe([uelEventType], uelListener);
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
            metadata: {
                originalEvent,
                args,
                compatibility: true,
            },
        };
    }
    convertUELEventToArgs(event) {
        if (event.metadata?.['args'] && Array.isArray(event.metadata['args'])) {
            return event.metadata['args'];
        }
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
    async createCompatibleEventEmitter(managerName, managerType = EventManagerTypes.SYSTEM, options) {
        const uelManager = await this.eventManager.createEventManager({
            type: managerType,
            name: managerName,
        });
        const eventEmitter = new UELCompatibleEventEmitter({
            enableUEL: options?.enableUEL ?? true,
            uelManager,
            migrationMode: options?.migrationMode ?? 'passive',
            logger: this.logger,
        });
        if (options?.autoMigrate) {
            await eventEmitter.enableUEL(uelManager, {
                migrateExistingListeners: true,
                preserveEventEmitterBehavior: true,
            });
        }
        this.migrationStats.migrated++;
        return eventEmitter;
    }
    async wrapEventEmitter(originalEmitter, managerName, managerType = EventManagerTypes.SYSTEM) {
        try {
            this.migrationStats.scanned++;
            const uelManager = await this.eventManager.createEventManager({
                type: managerType,
                name: managerName,
            });
            const compatibleEmitter = new UELCompatibleEventEmitter({
                enableUEL: true,
                uelManager,
                migrationMode: 'active',
                logger: this.logger,
            });
            const eventNames = originalEmitter.eventNames();
            for (const eventName of eventNames) {
                const listeners = originalEmitter.listeners(eventName);
                for (const listener of listeners) {
                    compatibleEmitter.on(eventName, listener);
                }
            }
            compatibleEmitter.setMaxListeners(originalEmitter.getMaxListeners());
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
        if (emitter.getMaxListeners() > 100) {
            recommendations.push('High max listeners - UEL provides better scaling');
            complexity = 'high';
        }
        return {
            eventTypes,
            listenerCounts,
            maxListeners: emitter.getMaxListeners(),
            recommendations,
            migrationComplexity: complexity,
        };
    }
    generateMigrationPlan(analysis) {
        const phases = [];
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
    getMigrationStats() {
        return { ...this.migrationStats };
    }
    resetStats() {
        this.migrationStats = {
            scanned: 0,
            migrated: 0,
            failed: 0,
            warnings: 0,
        };
    }
}
export class CompatibilityFactory {
    static instance;
    migrationHelper;
    eventManager;
    constructor() { }
    static getInstance() {
        if (!CompatibilityFactory.instance) {
            CompatibilityFactory.instance = new CompatibilityFactory();
        }
        return CompatibilityFactory.instance;
    }
    async initialize(eventManager, logger) {
        this.eventManager = eventManager;
        this.migrationHelper = new EventEmitterMigrationHelper(eventManager, logger);
    }
    async createEnhancedEventEmitter(name, type = EventManagerTypes.SYSTEM, options) {
        if (!this.migrationHelper) {
            throw new Error('CompatibilityFactory not initialized');
        }
        return await this.migrationHelper.createCompatibleEventEmitter(name, type, options);
    }
    async wrapExistingEmitter(emitter, name, type = EventManagerTypes.SYSTEM) {
        if (!this.migrationHelper) {
            throw new Error('CompatibilityFactory not initialized');
        }
        return await this.migrationHelper.wrapEventEmitter(emitter, name, type);
    }
    getMigrationHelper() {
        return this.migrationHelper;
    }
}
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
export async function wrapWithUEL(emitter, name, type = EventManagerTypes.SYSTEM, eventManager) {
    const factory = CompatibilityFactory.getInstance();
    if (eventManager && !factory['eventManager']) {
        await factory.initialize(eventManager);
    }
    return await factory.wrapExistingEmitter(emitter, name, type);
}
export { UELCompatibleEventEmitter as CompatibleEventEmitter, EventEmitterMigrationHelper as MigrationHelper, };
//# sourceMappingURL=compatibility.js.map