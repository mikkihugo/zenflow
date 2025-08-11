/**
 * @file UEL Singleton.
 *
 * Extracted UEL class to break circular dependency between index.ts and system-integrations.ts.
 */
/**
 * UEL Main Interface - Primary entry point for the Unified Event Layer.
 *
 * @example
 */
export class UEL {
    static instance;
    initialized = false;
    factory = null;
    registry = null;
    eventManager = null;
    eventRegistry = null;
    validationFramework = null;
    compatibilityFactory = null;
    constructor() { }
    static getInstance() {
        if (!UEL.instance) {
            UEL.instance = new UEL();
        }
        return UEL.instance;
    }
    async initialize(config) {
        if (this.initialized) {
            return;
        }
        // Dynamic imports to avoid circular dependencies
        const { UELFactory, UELRegistry } = await import('../factories.ts');
        const { EventManager } = await import('../manager.ts');
        const { EventRegistry } = await import('../registry.ts');
        const { UELValidationFramework } = await import('../validation.ts');
        const { CompatibilityFactory } = await import('../compatibility.ts');
        const { DIContainer } = await import('../../../di/container/di-container.ts');
        const { CORE_TOKENS } = await import('../../../di/tokens/core-tokens.ts');
        const { SingletonProvider } = await import('../../../di/providers/singleton-provider.ts');
        const container = new DIContainer();
        // Register dependencies
        const logger = config?.logger || {
            debug: (message, meta) => console.debug(message, meta),
            info: (message, meta) => console.info(message, meta),
            warn: (message, meta) => console.warn(message, meta),
            error: (message, meta) => console.error(message, meta),
        };
        container.register(CORE_TOKENS.Logger, new SingletonProvider(() => logger));
        container.register(CORE_TOKENS.Config, new SingletonProvider(() => {
            const configData = config?.config || {};
            return {
                get: (key, defaultValue) => {
                    return configData[key] ?? defaultValue;
                },
                set: (key, value) => {
                    configData[key] = value;
                },
                has: (key) => {
                    return key in configData;
                },
            };
        }));
        // Initialize components with proper DI
        this.factory = new UELFactory(logger, config?.config);
        this.registry = new UELRegistry(logger);
        // EventManager uses DI, create manually
        this.eventManager = new EventManager(logger, config?.config);
        this.eventRegistry = new EventRegistry(logger);
        // Initialize validation framework if enabled
        if (config?.enableValidation !== false) {
            this.validationFramework = new UELValidationFramework(logger);
        }
        // Initialize compatibility factory if enabled
        if (config?.enableCompatibility !== false) {
            this.compatibilityFactory = CompatibilityFactory.getInstance();
            // Basic initialization - some factories may not have initialize method
            try {
                if (this.compatibilityFactory && 'initialize' in this.compatibilityFactory) {
                    await this.compatibilityFactory.initialize(this.eventManager, logger);
                }
            }
            catch (error) {
                logger.warn('Failed to initialize compatibility factory:', error);
            }
        }
        // Initialize all systems
        await Promise.all([
            this.eventManager?.initialize({
                autoRegisterFactories: config?.autoRegisterFactories !== false,
                healthMonitoring: config?.healthMonitoring !== false,
            }),
            this.eventRegistry?.initialize({
                autoRegisterDefaults: config?.autoRegisterFactories !== false,
            }),
        ].filter(Boolean));
        this.initialized = true;
        logger.info('🚀 UEL System fully initialized');
    }
    isInitialized() {
        return this.initialized;
    }
    getEventManager() {
        if (!this.eventManager) {
            throw new Error('UEL not initialized. Call initialize() first.');
        }
        return this.eventManager;
    }
    async createSystemEventManager(name, config) {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.factory.createSystemEventManager(name, config);
    }
    async getSystemStatus() {
        return {
            initialized: this.initialized,
            components: {
                factory: !!this.factory,
                registry: !!this.registry,
                eventManager: !!this.eventManager,
                eventRegistry: !!this.eventRegistry,
                validation: !!this.validationFramework,
                compatibility: !!this.compatibilityFactory,
            },
        };
    }
    getEventRegistry() {
        if (!this.eventRegistry) {
            throw new Error('UEL not initialized. Call initialize() first.');
        }
        return this.eventRegistry;
    }
    getValidationFramework() {
        return this.validationFramework;
    }
    getCompatibilityFactory() {
        return this.compatibilityFactory;
    }
    async createCoordinationEventManager(name, config) {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.factory.createCoordinationEventManager(name, config);
    }
    async createCommunicationEventManager(name, config) {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.factory.createCommunicationEventManager(name, config);
    }
    async createMonitoringEventManager(name, config) {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.factory.createMonitoringEventManager(name, config);
    }
    async createInterfaceEventManager(name, config) {
        if (!this.initialized) {
            await this.initialize();
        }
        return this.factory.createInterfaceEventManager(name, config);
    }
    async getHealthStatus() {
        if (!this.eventManager) {
            return [];
        }
        // Use performHealthCheck method which returns the expected format
        try {
            const healthData = await this.eventManager.performHealthCheck();
            // Convert to expected format
            const healthStatus = Object.entries(healthData).map(([name, data]) => ({
                name,
                status: data.healthy ? 'healthy' : 'unhealthy',
                subscriptions: 0,
                queueSize: 0,
                errorRate: 0,
                uptime: 0,
                lastCheck: new Date(),
                metadata: data.details || {},
            }));
            return healthStatus;
        }
        catch (error) {
            return [
                {
                    name: 'event-manager',
                    status: 'unhealthy',
                    subscriptions: 0,
                    queueSize: 0,
                    errorRate: 1,
                    uptime: 0,
                    lastCheck: new Date(),
                    metadata: { error: error?.toString() },
                },
            ];
        }
    }
    async migrateEventEmitter(emitter, _name, _type) {
        if (!this.compatibilityFactory) {
            return null;
        }
        // Basic migration implementation - wrap the EventEmitter
        const { UELCompatibleEventEmitter } = await import('../compatibility.ts');
        const compatibleEmitter = new UELCompatibleEventEmitter({
            enableUEL: true,
            uelManager: this.eventManager,
            logger: this.eventManager ? this.eventManager.logger : undefined,
        });
        // Copy existing listeners
        const eventNames = emitter.listeners ? Object.keys(emitter) : [];
        eventNames.forEach((eventName) => {
            if (typeof emitter[eventName] === 'function') {
                compatibleEmitter.on(eventName, emitter[eventName]);
            }
        });
        return compatibleEmitter;
    }
    async createEnhancedEventBus(config) {
        const { UELEnhancedEventBus } = await import('../system-integrations.ts');
        return new UELEnhancedEventBus(config);
    }
    async createEnhancedApplicationCoordinator(config) {
        const { UELEnhancedApplicationCoordinator } = await import('../system-integrations.ts');
        return new UELEnhancedApplicationCoordinator(config);
    }
    async createEnhancedObserverSystem(config) {
        const { UELEnhancedObserverSystem } = await import('../system-integrations.ts');
        return new UELEnhancedObserverSystem(config);
    }
    async analyzeSystemEventEmitters(systems) {
        if (!this.compatibilityFactory) {
            return { migrationRecommendations: [] };
        }
        // Simplified implementation - return basic recommendations
        const recommendations = [];
        Object.keys(systems).forEach((name) => {
            recommendations.push(`Consider migrating ${name} to UEL for better event management`);
        });
        return { migrationRecommendations: recommendations };
    }
    async shutdown() {
        if (!this.initialized) {
            return;
        }
        const shutdownPromises = [];
        if (this.eventManager) {
            shutdownPromises.push(this.eventManager.shutdown());
        }
        if (this.factory) {
            shutdownPromises.push(this.factory.shutdownAll());
        }
        await Promise.allSettled(shutdownPromises);
        // Reset all components
        this.factory = null;
        this.registry = null;
        this.eventManager = null;
        this.eventRegistry = null;
        this.validationFramework = null;
        this.compatibilityFactory = null;
        this.initialized = false;
    }
}
// Global UEL instance for convenience
export const uel = UEL.getInstance();
