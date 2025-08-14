import { BaseEventManager } from '../core/base-event-manager.ts';
class InterfaceEventManager extends BaseEventManager {
    interfaceMetrics = {
        cliCommands: 0,
        webRequests: 0,
        apiCalls: 0,
        websocketMessages: 0,
        userInteractions: 0,
        totalResponseTime: 0,
        errorCount: 0,
        activeUsers: new Set(),
    };
    subscriptions = {
        cli: new Map(),
        web: new Map(),
        api: new Map(),
        websocket: new Map(),
        user: new Map(),
    };
    constructor(config, logger) {
        super(config, logger);
        this.initializeInterfaceHandlers();
    }
    async emitInterfaceEvent(event) {
        try {
            this.updateInterfaceMetrics(event);
            const enrichedEvent = {
                ...event,
                metadata: {
                    ...event.metadata,
                    timestamp: new Date(),
                    processingTime: Date.now(),
                },
            };
            await this.emit(enrichedEvent);
            await this.routeInterfaceEvent(enrichedEvent);
            this.logger.debug(`Interface event emitted: ${event.interface}:${event.action}`);
        }
        catch (error) {
            this.interfaceMetrics.errorCount++;
            this.logger.error('Failed to emit interface event:', error);
            throw error;
        }
    }
    subscribeCLIEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.cli.set(subscriptionId, listener);
        this.logger.debug(`CLI event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeWebEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.web.set(subscriptionId, listener);
        this.logger.debug(`Web event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeAPIEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.api.set(subscriptionId, listener);
        this.logger.debug(`API event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeWebSocketEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.websocket.set(subscriptionId, listener);
        this.logger.debug(`WebSocket event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    subscribeUserEvents(listener) {
        const subscriptionId = this.generateSubscriptionId();
        this.subscriptions.user.set(subscriptionId, listener);
        this.logger.debug(`User event subscription created: ${subscriptionId}`);
        return subscriptionId;
    }
    async getInterfaceMetrics() {
        const totalRequests = this.interfaceMetrics.cliCommands +
            this.interfaceMetrics.webRequests +
            this.interfaceMetrics.apiCalls +
            this.interfaceMetrics.websocketMessages;
        const averageResponseTime = totalRequests > 0
            ? this.interfaceMetrics.totalResponseTime / totalRequests
            : 0;
        const errorRate = totalRequests > 0 ? this.interfaceMetrics.errorCount / totalRequests : 0;
        return {
            totalRequests,
            activeUsers: this.interfaceMetrics.activeUsers.size,
            responseTime: averageResponseTime,
            errorRate,
            breakdown: {
                cli: this.interfaceMetrics.cliCommands,
                web: this.interfaceMetrics.webRequests,
                api: this.interfaceMetrics.apiCalls,
                websocket: this.interfaceMetrics.websocketMessages,
                user: this.interfaceMetrics.userInteractions,
            },
        };
    }
    async getMetrics() {
        const baseMetrics = await super.getMetrics();
        const interfaceMetrics = await this.getInterfaceMetrics();
        return {
            ...baseMetrics,
            customMetrics: {
                interface: interfaceMetrics,
            },
        };
    }
    async healthCheck() {
        const baseStatus = await super.healthCheck();
        const interfaceMetrics = await this.getInterfaceMetrics();
        const highErrorRate = interfaceMetrics.errorRate > 0.1;
        const slowResponseTime = interfaceMetrics.responseTime > 1000;
        const isHealthy = baseStatus.status === 'healthy' && !highErrorRate && !slowResponseTime;
        return {
            ...baseStatus,
            status: isHealthy ? 'healthy' : 'degraded',
            metadata: {
                ...baseStatus.metadata,
                interface: {
                    errorRate: interfaceMetrics.errorRate,
                    responseTime: interfaceMetrics.responseTime,
                    activeUsers: interfaceMetrics.activeUsers,
                    totalRequests: interfaceMetrics.totalRequests,
                },
            },
        };
    }
    initializeInterfaceHandlers() {
        this.logger.debug('Initializing interface event handlers');
        this.subscribe([
            'interface:cli',
            'interface:web',
            'interface:api',
            'interface:websocket',
            'interface:user',
        ], this.handleInterfaceEvent.bind(this));
    }
    async handleInterfaceEvent(event) {
        const startTime = Date.now();
        try {
            switch (event.interface) {
                case 'cli':
                    await this.notifySubscribers(this.subscriptions.cli, event);
                    break;
                case 'web':
                    await this.notifySubscribers(this.subscriptions.web, event);
                    break;
                case 'api':
                    await this.notifySubscribers(this.subscriptions.api, event);
                    break;
                case 'websocket':
                    await this.notifySubscribers(this.subscriptions.websocket, event);
                    break;
                case 'user':
                    await this.notifySubscribers(this.subscriptions.user, event);
                    break;
                default:
                    this.logger.warn(`Unknown interface type: ${event.interface}`);
            }
            const processingTime = Date.now() - startTime;
            this.interfaceMetrics.totalResponseTime += processingTime;
        }
        catch (error) {
            this.interfaceMetrics.errorCount++;
            this.logger.error('Interface event handling failed:', error);
            throw error;
        }
    }
    async routeInterfaceEvent(event) {
        if (event.data?.userId) {
            this.interfaceMetrics.activeUsers.add(event.data.userId);
        }
        switch (event.action) {
            case 'session-start':
                this.logger.info(`User session started: ${event.data?.userId}`);
                break;
            case 'session-end':
                this.logger.info(`User session ended: ${event.data?.userId}`);
                if (event.data?.userId) {
                    this.interfaceMetrics.activeUsers.delete(event.data.userId);
                }
                break;
            case 'error':
                this.logger.error(`Interface error: ${event.data?.error}`);
                break;
        }
    }
    updateInterfaceMetrics(event) {
        switch (event.interface) {
            case 'cli':
                this.interfaceMetrics.cliCommands++;
                break;
            case 'web':
                this.interfaceMetrics.webRequests++;
                break;
            case 'api':
                this.interfaceMetrics.apiCalls++;
                break;
            case 'websocket':
                this.interfaceMetrics.websocketMessages++;
                break;
            case 'user':
                this.interfaceMetrics.userInteractions++;
                break;
        }
    }
    async notifySubscribers(subscribers, event) {
        const notifications = Array.from(subscribers.values()).map(async (listener) => {
            try {
                await listener(event);
            }
            catch (error) {
                this.logger.error('Interface event listener failed:', error);
            }
        });
        await Promise.allSettled(notifications);
    }
    generateSubscriptionId() {
        return `interface-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}
export class InterfaceEventManagerFactory {
    logger;
    config;
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
        this.logger.debug('InterfaceEventManagerFactory initialized');
    }
    async create(config) {
        this.logger.info(`Creating interface event manager: ${config.name}`);
        this.validateConfig(config);
        const optimizedConfig = this.applyInterfaceDefaults(config);
        const manager = new InterfaceEventManager(optimizedConfig, this.logger);
        await this.configureInterfaceManager(manager, optimizedConfig);
        this.logger.info(`Interface event manager created successfully: ${config.name}`);
        return manager;
    }
    validateConfig(config) {
        if (!config.name) {
            throw new Error('Interface event manager name is required');
        }
        if (config.type !== 'interface') {
            throw new Error('Manager type must be "interface"');
        }
        if (config.maxListeners && config.maxListeners < 100) {
            this.logger.warn('Interface managers should support at least 100 listeners for UI responsiveness');
        }
        if (config.processing?.timeout && config.processing.timeout > 1000) {
            this.logger.warn('Interface processing timeout > 1000ms may impact UI responsiveness');
        }
    }
    applyInterfaceDefaults(config) {
        return {
            ...config,
            maxListeners: config.maxListeners || 500,
            processing: {
                strategy: 'immediate',
                timeout: 100,
                retries: 2,
                batchSize: 10,
                ...config.processing,
            },
            persistence: {
                enabled: false,
                ...config.persistence,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 30000,
                healthCheckInterval: 60000,
                ...config.monitoring,
            },
        };
    }
    async configureInterfaceManager(manager, config) {
        if (config.monitoring?.enabled) {
            await manager.start();
            this.logger.debug(`Interface event manager monitoring started: ${config.name}`);
        }
        if (config.monitoring?.healthCheckInterval) {
            setInterval(async () => {
                try {
                    await manager.healthCheck();
                }
                catch (error) {
                    this.logger.error(`Interface manager health check failed: ${config.name}`, error);
                }
            }, config.monitoring.healthCheckInterval);
        }
    }
}
export default InterfaceEventManagerFactory;
//# sourceMappingURL=interface-event-factory.js.map