import { EventEmitter } from 'node:events';
import { EventEmitterMigrationHelper, } from './compatibility.ts';
import { EventManagerTypes } from './core/interfaces.ts';
export class UELEnhancedEventBus extends EventEmitter {
    uelManager;
    uelEnabled = false;
    eventMappings = new Map();
    logger;
    migrationHelper;
    constructor(options = {}) {
        super();
        this.logger = options?.logger;
        this.setMaxListeners(options?.maxListeners || 100);
        if (options?.enableUEL && options?.uelIntegration?.eventManager) {
            this.initializeUELIntegration({
                eventManager: options.uelIntegration.eventManager,
                managerType: options.uelIntegration.managerType || undefined,
                managerName: options.uelIntegration.managerName || undefined,
            });
        }
    }
    async initializeUELIntegration(integration) {
        try {
            this.uelManager = await integration.eventManager.createEventManager({
                type: integration.managerType || EventManagerTypes.SYSTEM,
                name: integration.managerName || 'enhanced-event-bus',
                autoStart: true,
            });
            this.migrationHelper = new EventEmitterMigrationHelper(integration.eventManager, this.logger);
            this.uelEnabled = true;
            this.logger?.info('✅ UEL integration initialized for Enhanced Event Bus');
        }
        catch (error) {
            this.logger?.error('❌ Failed to initialize UEL integration:', error);
        }
    }
    emit(eventName, ...args) {
        const startTime = Date.now();
        const result = super.emit(eventName, ...args);
        if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
            this.emitToUEL(eventName, args, startTime).catch((error) => {
                this.logger?.warn(`UEL emit failed for ${eventName}:`, error);
            });
        }
        return result;
    }
    on(eventName, listener) {
        const result = super.on(eventName, listener);
        if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
            this.trackUELSubscription(eventName, listener).catch((error) => {
                this.logger?.debug(`UEL subscription tracking failed for ${eventName}:`, error);
            });
        }
        return result;
    }
    getStatus() {
        const eventNames = this.eventNames();
        const listenerCount = eventNames.reduce((total, name) => total + this.listenerCount(name), 0);
        return {
            eventEmitter: {
                maxListeners: this.getMaxListeners(),
                eventNames,
                listenerCount,
            },
            uel: {
                enabled: this.uelEnabled,
                hasManager: !!this.uelManager,
                mappedEvents: this.eventMappings.size,
            },
            integration: {
                compatible: true,
                migrationReady: this.uelEnabled && !!this.uelManager,
            },
        };
    }
    mapEventToUEL(eventEmitterEvent, uelEventType) {
        this.eventMappings.set(eventEmitterEvent, uelEventType);
        this.logger?.debug(`Mapped event: ${eventEmitterEvent} -> ${uelEventType}`);
    }
    async enableUELMode(eventManager, options) {
        if (this.uelEnabled) {
            this.logger?.warn('UEL already enabled for this event bus');
            return;
        }
        await this.initializeUELIntegration({
            eventManager,
            managerType: options?.managerType || EventManagerTypes.SYSTEM,
            managerName: options?.managerName || 'enhanced-event-bus',
        });
        if (options?.migrateExistingListeners) {
            await this.migrateExistingListeners();
        }
    }
    async emitToUEL(eventName, args, startTime) {
        if (!this.uelManager)
            return;
        try {
            const uelEventType = this.eventMappings.get(eventName) || `eventbus:${eventName}`;
            const uelEvent = {
                id: `bus-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                timestamp: new Date(),
                source: 'enhanced-event-bus',
                type: uelEventType,
                operation: 'emit',
                status: 'success',
                details: {
                    args: args.length,
                    processingTime: Date.now() - startTime,
                    listenerCount: this.listenerCount(eventName),
                },
            };
            await this.uelManager.emit(uelEvent);
        }
        catch (error) {
            this.logger?.debug(`UEL emit failed for ${eventName}:`, error);
        }
    }
    async trackUELSubscription(eventName, _listener) {
        if (!this.uelManager)
            return;
        try {
            const uelEventType = this.eventMappings.get(eventName) || `eventbus:${eventName}`;
            const uelListener = (event) => {
                const eventDetails = event;
                const _args = eventDetails.details?.originalEvent === eventName &&
                    eventDetails.details?.args
                    ? new Array(eventDetails.details.args).fill(undefined)
                    : [event];
            };
            const subscriptionId = this.uelManager.subscribe([uelEventType], uelListener);
            this.logger?.debug(`UEL subscription tracked: ${subscriptionId} for ${eventName}`);
        }
        catch (error) {
            this.logger?.debug(`UEL subscription tracking failed for ${eventName}:`, error);
        }
    }
    async migrateExistingListeners() {
        const eventNames = this.eventNames();
        let migratedCount = 0;
        for (const eventName of eventNames) {
            if (typeof eventName === 'string') {
                await this.trackUELSubscription(eventName, () => { });
                migratedCount++;
            }
        }
        this.logger?.info(`Migrated ${migratedCount} existing listeners to UEL tracking`);
    }
}
export class UELEnhancedApplicationCoordinator extends EventEmitter {
    uelSystem;
    setUELSystem(uelSystem) {
        this.uelSystem = uelSystem;
    }
    eventBus;
    systemManagers = new Map();
    logger;
    constructor(options = {}) {
        super();
        this.logger = options?.logger || console;
        if (options?.enableUEL) {
            this.initializeUEL(options?.uelConfig);
        }
    }
    async initializeUEL(config) {
        try {
            if (!this.uelSystem) {
                throw new Error('UEL system not initialized. Call setUELSystem() first.');
            }
            await this.uelSystem.initialize({
                enableValidation: config?.enableValidation !== false,
                enableCompatibility: config?.enableCompatibility !== false,
                healthMonitoring: config?.healthMonitoring !== false,
                autoRegisterFactories: true,
                logger: this.logger,
            });
            this.eventBus = new UELEnhancedEventBus({
                enableUEL: true,
                uelIntegration: {
                    eventManager: this.uelSystem.getEventManager(),
                    managerType: EventManagerTypes.SYSTEM,
                    managerName: 'application-coordinator',
                },
                logger: this.logger,
            });
            this.setupEventMappings();
            await this.createSystemManagers();
            this.logger.info('✅ UEL integration initialized for Application Coordinator');
        }
        catch (error) {
            this.logger.error('❌ Failed to initialize UEL for Application Coordinator:', error);
        }
    }
    setupEventMappings() {
        if (!this.eventBus)
            return;
        const mappings = [
            ['system:start', 'system:lifecycle'],
            ['system:stop', 'system:lifecycle'],
            ['system:error', 'system:lifecycle'],
            ['memory:operation', 'system:lifecycle'],
            ['workflow:started', 'coordination:workflow'],
            ['workflow:completed', 'coordination:workflow'],
            ['interface:launched', 'interface:user'],
            ['export:completed', 'system:lifecycle'],
        ];
        for (const [eventName, uelType] of mappings) {
            this.eventBus.mapEventToUEL(eventName, uelType);
        }
        this.logger.debug(`Configured ${mappings.length} event mappings`);
    }
    async createSystemManagers() {
        if (!this.uelSystem)
            return;
        try {
            const systemManager = await this.uelSystem.createSystemEventManager('app-system-events', {
                maxListeners: 50,
                retryAttempts: 3,
            });
            this.systemManagers.set('system', systemManager);
            const coordinationManager = await this.uelSystem.createCoordinationEventManager('app-coordination', {
                maxListeners: 30,
            });
            this.systemManagers.set('coordination', coordinationManager);
            const interfaceManager = await this.uelSystem.createInterfaceEventManager('app-interfaces', {
                maxListeners: 20,
            });
            this.systemManagers.set('interface', interfaceManager);
            this.logger.info(`Created ${this.systemManagers.size} system event managers`);
        }
        catch (error) {
            this.logger.error('Failed to create system managers:', error);
        }
    }
    emit(eventName, ...args) {
        const result = super.emit(eventName, ...args);
        if (this.eventBus && typeof eventName === 'string') {
            this.eventBus.emit(eventName, ...args);
        }
        return result;
    }
    async getSystemStatus() {
        const eventNames = this.eventNames();
        const listenerCount = eventNames.reduce((total, name) => total + this.listenerCount(name), 0);
        const status = {
            applicationCoordinator: {
                initialized: true,
                eventNames,
                listenerCount,
            },
            uel: {
                enabled: !!this.uelSystem,
                systemStatus: undefined,
                managersCreated: this.systemManagers.size,
            },
            eventBus: this.eventBus?.getStatus(),
        };
        if (this.uelSystem) {
            try {
                status.uel.systemStatus = await this.uelSystem.getSystemStatus();
            }
            catch (error) {
                this.logger.warn('Failed to get UEL system status:', error);
            }
        }
        return status;
    }
    async createComponentManager(componentName, type = EventManagerTypes.SYSTEM, config) {
        if (!this.uelSystem) {
            this.logger.warn('UEL not enabled - cannot create component manager');
            return null;
        }
        try {
            const manager = await this.uelSystem
                .getEventManager()
                .createEventManager({
                type,
                name: `app-${componentName}`,
                config: config || {},
                autoStart: true,
            });
            this.systemManagers.set(componentName, manager);
            this.logger.info(`Created event manager for component: ${componentName}`);
            return manager;
        }
        catch (error) {
            this.logger.error(`Failed to create manager for ${componentName}:`, error);
            return null;
        }
    }
    async validateIntegration() {
        const issues = [];
        const recommendations = [];
        let score = 100;
        if (this.uelSystem) {
            try {
                const uelStatus = await this.uelSystem.getSystemStatus();
                if (!uelStatus.initialized) {
                    issues.push('UEL system not properly initialized');
                    score -= 20;
                }
                const healthPercentage = uelStatus.healthPercentage || 100;
                if (healthPercentage < 80) {
                    issues.push(`UEL system health degraded: ${healthPercentage}%`);
                    score -= 15;
                }
            }
            catch (_error) {
                issues.push('Failed to check UEL system status');
                score -= 10;
            }
        }
        else {
            issues.push('UEL system not initialized');
            score -= 30;
            recommendations.push('Enable UEL integration for enhanced event handling');
        }
        if (!this.eventBus) {
            recommendations.push('Consider enabling enhanced event bus for better integration');
            score -= 10;
        }
        if (this.systemManagers.size === 0) {
            recommendations.push('Create system-specific event managers for better organization');
            score -= 5;
        }
        return {
            valid: issues.length === 0,
            score: Math.max(0, score),
            issues,
            recommendations,
        };
    }
    async shutdown() {
        try {
            for (const [name, manager] of this.systemManagers) {
                try {
                    await manager.stop();
                    await manager.destroy();
                }
                catch (error) {
                    this.logger.warn(`Failed to shutdown manager ${name}:`, error);
                }
            }
            this.systemManagers.clear();
            if (this.uelSystem) {
                await this.uelSystem.shutdown();
                this.uelSystem = undefined;
            }
            this.eventBus = undefined;
            this.logger.info('✅ Application Coordinator UEL integration shut down');
        }
        catch (error) {
            this.logger.error('❌ Failed to shutdown Application Coordinator UEL integration:', error);
        }
    }
}
export class UELEnhancedObserverSystem extends EventEmitter {
    uelEventManager;
    observers = new Map();
    logger;
    constructor(options = {}) {
        super();
        this.logger = options?.logger;
        if (options?.enableUEL && options?.eventManager) {
            this.initializeUELIntegration(options?.eventManager);
        }
    }
    async initializeUELIntegration(eventManager) {
        try {
            this.uelEventManager = await eventManager.createMonitoringEventManager('observer-system', {
                maxListeners: 100,
                retryAttempts: 2,
            });
            this.logger?.info('✅ UEL integration initialized for Observer System');
        }
        catch (error) {
            this.logger?.error('❌ Failed to initialize UEL for Observer System:', error);
        }
    }
    createObserver(name, type = 'custom') {
        const observer = new EventEmitter();
        observer.setMaxListeners(50);
        if (this.uelEventManager) {
            this.enhanceObserverWithUEL(observer, name, type);
        }
        this.observers.set(name, observer);
        this.emit('observer:created', { name, type });
        this.logger?.debug(`Created observer: ${name} (${type})`);
        return observer;
    }
    enhanceObserverWithUEL(observer, name, type) {
        const originalEmit = observer.emit.bind(observer);
        observer.emit = (eventName, ...args) => {
            const result = originalEmit(eventName, ...args);
            if (this.uelEventManager && typeof eventName === 'string') {
                const uelEvent = {
                    id: `obs-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                    timestamp: new Date(),
                    source: `observer-${name}`,
                    type: `monitoring:observer`,
                    operation: 'observe',
                    component: type,
                    details: {
                        observerType: type,
                        eventName: eventName.toString(),
                        argsCount: args.length,
                    },
                };
                this.uelEventManager.emit(uelEvent).catch((error) => {
                    this.logger?.debug(`UEL observer event failed for ${name}:`, error);
                });
            }
            return result;
        };
    }
    getStatus() {
        return {
            observerSystem: {
                totalObservers: this.observers.size,
                observers: Array.from(this.observers.keys()),
            },
            uel: {
                enabled: !!this.uelEventManager,
                hasManager: !!this.uelEventManager,
            },
        };
    }
    removeObserver(name) {
        const observer = this.observers.get(name);
        if (observer) {
            observer.removeAllListeners();
            this.observers.delete(name);
            this.emit('observer:removed', { name });
            this.logger?.debug(`Removed observer: ${name}`);
            return true;
        }
        return false;
    }
    getObserver(name) {
        return this.observers.get(name);
    }
    listObservers() {
        return Array.from(this.observers.keys());
    }
}
export class SystemIntegrationFactory {
    static instance;
    eventManager;
    logger;
    constructor() { }
    static getInstance() {
        if (!SystemIntegrationFactory.instance) {
            SystemIntegrationFactory.instance = new SystemIntegrationFactory();
        }
        return SystemIntegrationFactory.instance;
    }
    async initialize(eventManager, logger) {
        this.eventManager = eventManager;
        this.logger = logger;
    }
    createEnhancedEventBus(options = {}) {
        return new UELEnhancedEventBus({
            enableUEL: options?.enableUEL && !!this.eventManager,
            uelIntegration: this.eventManager
                ? {
                    eventManager: this.eventManager,
                    managerType: options?.managerType || EventManagerTypes.SYSTEM,
                    managerName: options?.managerName || 'enhanced-bus',
                }
                : undefined,
            logger: this.logger,
            maxListeners: options?.maxListeners || undefined,
        });
    }
    createEnhancedApplicationCoordinator(options = {}) {
        return new UELEnhancedApplicationCoordinator({
            enableUEL: options?.enableUEL,
            logger: this.logger,
            uelConfig: options?.uelConfig || undefined,
        });
    }
    createEnhancedObserverSystem(options = {}) {
        return new UELEnhancedObserverSystem({
            enableUEL: options?.enableUEL && !!this.eventManager,
            eventManager: this.eventManager || undefined,
            logger: this.logger,
        });
    }
    isUELAvailable() {
        return !!this.eventManager;
    }
    getStatus() {
        return {
            initialized: !!this.eventManager && !!this.logger,
            uelAvailable: !!this.eventManager,
            eventManagerReady: !!this.eventManager,
        };
    }
}
export async function enhanceWithUEL(originalInstance, name, eventManager, managerType = EventManagerTypes.SYSTEM, logger) {
    const migrationHelper = new EventEmitterMigrationHelper(eventManager, logger);
    return await migrationHelper.wrapEventEmitter(originalInstance, name, managerType);
}
export function analyzeSystemEventEmitterUsage(systems, logger) {
    const migrationHelper = new EventEmitterMigrationHelper(null, logger);
    const systemAnalyses = {};
    const migrationRecommendations = [];
    let totalListeners = 0;
    let totalEventTypes = 0;
    let highComplexitySystems = 0;
    for (const [systemName, system] of Object.entries(systems)) {
        try {
            const analysis = migrationHelper.analyzeEventEmitter(system);
            systemAnalyses[systemName] = analysis;
            totalListeners += Object.values(analysis.listenerCounts).reduce((sum, count) => sum + count, 0);
            totalEventTypes += analysis.eventTypes.length;
            if (analysis.migrationComplexity === 'high') {
                highComplexitySystems++;
            }
            if (analysis.migrationComplexity === 'high') {
                migrationRecommendations.push(`${systemName}: High complexity - plan careful migration`);
            }
            if (Object.values(analysis.listenerCounts).some((count) => count > 10)) {
                migrationRecommendations.push(`${systemName}: High listener count - UEL would improve performance`);
            }
        }
        catch (error) {
            logger?.warn(`Failed to analyze system ${systemName}:`, error);
        }
    }
    const systemCount = Object.keys(systems).length;
    let overallComplexity = 'low';
    if (highComplexitySystems > systemCount * 0.3 || totalListeners > 100) {
        overallComplexity = 'high';
    }
    else if (highComplexitySystems > 0 ||
        totalListeners > 50 ||
        totalEventTypes > 50) {
        overallComplexity = 'medium';
    }
    if (totalListeners > 100) {
        migrationRecommendations.push('System-wide: High listener count - UEL integration recommended');
    }
    if (totalEventTypes > 50) {
        migrationRecommendations.push('System-wide: Many event types - UEL categorization would help');
    }
    return {
        totalSystems: systemCount,
        systemAnalyses,
        migrationRecommendations,
        overallComplexity,
    };
}
export const UELSystemIntegration = {
    factory: SystemIntegrationFactory.getInstance(),
    EnhancedEventBus: UELEnhancedEventBus,
    EnhancedApplicationCoordinator: UELEnhancedApplicationCoordinator,
    EnhancedObserverSystem: UELEnhancedObserverSystem,
    enhanceWithUEL,
    analyzeSystemEventEmitterUsage,
    async initialize(eventManager, logger) {
        await SystemIntegrationFactory.getInstance().initialize(eventManager, logger);
    },
};
export default UELSystemIntegration;
//# sourceMappingURL=system-integrations.js.map