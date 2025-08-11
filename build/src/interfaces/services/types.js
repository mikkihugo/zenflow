/**
 * @file USL (Unified Service Layer) Types and Configuration.
 *
 * Centralized type definitions and configuration schemas for all service types.
 * in the Claude-Zen ecosystem.
 */
/**
 * Service type enumeration for all supported service categories.
 */
export var ServiceType;
(function (ServiceType) {
    // Data Services
    ServiceType["DATA"] = "data";
    ServiceType["WEB_DATA"] = "web-data";
    ServiceType["DOCUMENT"] = "document";
    // Coordination Services
    ServiceType["COORDINATION"] = "coordination";
    ServiceType["SWARM"] = "swarm";
    ServiceType["ORCHESTRATION"] = "orchestration";
    ServiceType["DAA"] = "daa";
    ServiceType["SESSION_RECOVERY"] = "session-recovery";
    ServiceType["ARCHITECTURE_STORAGE"] = "architecture-storage";
    // Interface Services
    ServiceType["API"] = "api";
    ServiceType["SAFE_API"] = "safe-api";
    ServiceType["WEB"] = "web";
    ServiceType["MCP"] = "mcp";
    ServiceType["CLI"] = "cli";
    ServiceType["TUI"] = "tui";
    // Neural Services
    ServiceType["NEURAL"] = "neural";
    ServiceType["LEARNING"] = "learning";
    ServiceType["PATTERN_RECOGNITION"] = "pattern-recognition";
    // Memory Services
    ServiceType["MEMORY"] = "memory";
    ServiceType["CACHE"] = "cache";
    ServiceType["SESSION"] = "session";
    // Database Services
    ServiceType["DATABASE"] = "database";
    ServiceType["VECTOR"] = "vector";
    ServiceType["GRAPH"] = "graph";
    // System Services
    ServiceType["INFRASTRUCTURE"] = "infrastructure";
    ServiceType["SYSTEM"] = "system";
    ServiceType["HEALTH"] = "health";
    ServiceType["MONITORING"] = "monitoring";
    ServiceType["LOGGING"] = "logging";
    ServiceType["SECURITY"] = "security";
    // Workflow Services
    ServiceType["WORKFLOW"] = "workflow";
    ServiceType["TASK"] = "task";
    ServiceType["PIPELINE"] = "pipeline";
    // Communication Services
    ServiceType["WEBSOCKET"] = "websocket";
    ServiceType["MESSAGE_QUEUE"] = "message-queue";
    ServiceType["EVENT_BUS"] = "event-bus";
    // Custom service type
    ServiceType["CUSTOM"] = "custom";
})(ServiceType || (ServiceType = {}));
/**
 * Service priority levels for initialization and resource allocation.
 */
export var ServicePriority;
(function (ServicePriority) {
    ServicePriority[ServicePriority["CRITICAL"] = 0] = "CRITICAL";
    ServicePriority[ServicePriority["HIGH"] = 1] = "HIGH";
    ServicePriority[ServicePriority["NORMAL"] = 2] = "NORMAL";
    ServicePriority[ServicePriority["LOW"] = 3] = "LOW";
    ServicePriority[ServicePriority["BACKGROUND"] = 4] = "BACKGROUND";
})(ServicePriority || (ServicePriority = {}));
/**
 * Service environment configuration.
 */
export var ServiceEnvironment;
(function (ServiceEnvironment) {
    ServiceEnvironment["DEVELOPMENT"] = "development";
    ServiceEnvironment["TESTING"] = "testing";
    ServiceEnvironment["STAGING"] = "staging";
    ServiceEnvironment["PRODUCTION"] = "production";
})(ServiceEnvironment || (ServiceEnvironment = {}));
/**
 * Service configuration factory for creating typed configurations.
 *
 * @example
 */
export class ServiceConfigFactory {
    /**
     * Create a data service configuration.
     *
     * @param name
     * @param options
     */
    static createDataServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.DATA,
            enabled: true,
            priority: ServicePriority.NORMAL,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 30000,
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: false,
            },
            ...options,
        };
    }
    /**
     * Create a web service configuration.
     *
     * @param name
     * @param options
     */
    static createWebServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.WEB,
            enabled: true,
            priority: ServicePriority.HIGH,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 30000,
            server: {
                host: 'localhost',
                port: 3000,
            },
            cors: {
                enabled: true,
                origins: ['*'],
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                headers: ['Content-Type', 'Authorization'],
            },
            rateLimit: {
                enabled: false,
                requests: 100,
                window: 60000,
            },
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
            ...options,
        };
    }
    /**
     * Create a coordination service configuration.
     *
     * @param name
     * @param options
     */
    static createCoordinationServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.COORDINATION,
            enabled: true,
            priority: ServicePriority.HIGH,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 60000,
            coordination: {
                topology: 'mesh',
                maxAgents: 10,
                strategy: 'adaptive',
                timeout: 30000,
            },
            persistence: {
                enabled: true,
                storage: 'memory',
                compression: false,
            },
            recovery: {
                enabled: true,
                checkInterval: 10000,
                maxRetries: 3,
                backupInterval: 60000,
            },
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
            ...options,
        };
    }
    /**
     * Create a neural service configuration.
     *
     * @param name
     * @param options
     */
    static createNeuralServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.NEURAL,
            enabled: true,
            priority: ServicePriority.NORMAL,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 120000,
            model: {
                type: 'neural-network',
                config: {},
            },
            training: {
                enabled: false,
                batchSize: 32,
                epochs: 100,
                learningRate: 0.001,
            },
            inference: {
                batchSize: 1,
                timeout: 30000,
                caching: true,
            },
            gpu: {
                enabled: false,
            },
            health: {
                enabled: true,
                interval: 60000,
                timeout: 10000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 30000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
            ...options,
        };
    }
    /**
     * Create a memory service configuration.
     *
     * @param name
     * @param options
     */
    static createMemoryServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.MEMORY,
            enabled: true,
            priority: ServicePriority.HIGH,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 30000,
            storage: {
                type: 'memory',
                maxMemory: 1024 * 1024 * 100, // 100MB
            },
            eviction: {
                policy: 'lru',
                maxSize: 10000,
                ttl: 3600000, // 1 hour
            },
            serialization: {
                type: 'json',
                compression: false,
            },
            persistence: {
                enabled: false,
            },
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
            ...options,
        };
    }
    /**
     * Create a database service configuration.
     *
     * @param name
     * @param options
     */
    static createDatabaseServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.DATABASE,
            enabled: true,
            priority: ServicePriority.CRITICAL,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 60000,
            connection: {
                host: 'localhost',
                port: 5432,
                poolSize: 10,
            },
            migrations: {
                enabled: true,
                autoRun: false,
            },
            backup: {
                enabled: false,
                interval: 86400000, // 24 hours
                retention: 7, // 7 days
            },
            performance: {
                queryTimeout: 30000,
                connectionTimeout: 10000,
                idleTimeout: 300000, // 5 minutes
                maxRetries: 3,
            },
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
            ...options,
        };
    }
    /**
     * Create a monitoring service configuration.
     *
     * @param name
     * @param options
     */
    static createMonitoringServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.MONITORING,
            enabled: true,
            priority: ServicePriority.LOW,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 30000,
            metrics: {
                enabled: true,
                interval: 5000,
                retention: 86400000, // 24 hours
                aggregation: 'avg',
            },
            alerts: {
                enabled: false,
                thresholds: {
                    'cpu.usage': 80,
                    'memory.usage': 85,
                    'error.rate': 5,
                },
            },
            storage: {
                type: 'memory',
                compression: true,
            },
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: false, // Don't monitor the monitoring service itself
                metricsInterval: 30000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
            ...options,
        };
    }
    /**
     * Create an integration service configuration.
     *
     * @param name
     * @param options
     */
    static createIntegrationServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.API,
            enabled: true,
            priority: ServicePriority.HIGH,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 30000,
            integration: {
                architectureStorage: true,
                safeAPI: true,
                protocolManagement: true,
                multiProtocol: true,
            },
            protocols: {
                supported: ['http', 'websocket', 'mcp-http', 'mcp-stdio'],
                default: 'http',
                failover: true,
                loadBalancing: true,
            },
            performance: {
                caching: true,
                deduplication: true,
                connectionPooling: true,
                metricsCollection: true,
            },
            security: {
                validation: true,
                sanitization: true,
                rateLimiting: true,
                auditLogging: true,
            },
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
            ...options,
        };
    }
    /**
     * Create an infrastructure service configuration.
     *
     * @param name
     * @param options
     */
    static createInfrastructureServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.INFRASTRUCTURE,
            enabled: true,
            priority: ServicePriority.HIGH,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 30000,
            facade: {
                enabled: true,
                autoInitialize: true,
                enableCaching: true,
                enableMetrics: true,
                enableHealthChecks: true,
                systemStatusInterval: 30000,
            },
            patternIntegration: {
                enabled: true,
                configProfile: 'development',
                enableEventSystem: true,
                enableCommandSystem: true,
                enableProtocolSystem: true,
                enableAgentSystem: true,
            },
            orchestration: {
                enableServiceDiscovery: true,
                enableLoadBalancing: true,
                enableCircuitBreaker: true,
                maxConcurrentServices: 20,
                serviceStartupTimeout: 30000,
                shutdownGracePeriod: 10000,
            },
            resourceManagement: {
                enableResourceTracking: true,
                enableResourceOptimization: true,
                memoryThreshold: 0.8,
                cpuThreshold: 0.8,
                diskThreshold: 0.9,
                networkThreshold: 0.8,
                cleanupInterval: 300000,
            },
            configManagement: {
                enableHotReload: true,
                enableValidation: true,
                enableVersioning: true,
                reloadCheckInterval: 30000,
                backupConfigs: true,
                maxConfigHistory: 50,
            },
            eventCoordination: {
                enableCentralizedEvents: true,
                enableEventPersistence: false,
                enableEventMetrics: true,
                maxEventQueueSize: 10000,
                eventRetentionPeriod: 3600000,
                enableEventFiltering: true,
            },
            healthMonitoring: {
                enableAdvancedChecks: true,
                enableServiceDependencyTracking: true,
                enablePerformanceAlerts: true,
                healthCheckTimeout: 5000,
                performanceThresholds: {
                    responseTime: 1000,
                    errorRate: 0.05,
                    resourceUsage: 0.8,
                },
            },
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
            ...options,
        };
    }
    /**
     * Create a workflow service configuration.
     *
     * @param name
     * @param options
     */
    static createWorkflowServiceConfig(name, options) {
        return {
            name,
            type: ServiceType.WORKFLOW,
            enabled: true,
            priority: ServicePriority.NORMAL,
            environment: ServiceEnvironment.DEVELOPMENT,
            timeout: 300000, // 5 minutes
            execution: {
                parallel: true,
                maxConcurrency: 5,
                timeout: 120000, // 2 minutes
                retries: 3,
            },
            scheduling: {
                enabled: false,
                timezone: 'UTC',
            },
            state: {
                persistence: true,
                storage: 'memory',
                compression: false,
            },
            notifications: {
                enabled: false,
                events: ['started', 'completed', 'failed'],
                channels: ['console'],
            },
            health: {
                enabled: true,
                interval: 30000,
                timeout: 5000,
                failureThreshold: 3,
                successThreshold: 1,
            },
            monitoring: {
                enabled: true,
                metricsInterval: 10000,
                trackLatency: true,
                trackThroughput: true,
                trackErrors: true,
                trackMemoryUsage: true,
            },
            ...options,
        };
    }
}
/**
 * Type guard functions for service configurations.
 *
 * @param config
 * @example
 */
export function isDataServiceConfig(config) {
    return [ServiceType.DATA, ServiceType.WEB_DATA, ServiceType.DOCUMENT].includes(config?.type);
}
export function isWebServiceConfig(config) {
    return [ServiceType.WEB, ServiceType.API, ServiceType.SAFE_API, ServiceType.WEBSOCKET].includes(config?.type);
}
export function isCoordinationServiceConfig(config) {
    return [
        ServiceType.COORDINATION,
        ServiceType.SWARM,
        ServiceType.ORCHESTRATION,
        ServiceType.DAA,
        ServiceType.SESSION_RECOVERY,
    ].includes(config?.type);
}
export function isNeuralServiceConfig(config) {
    return [ServiceType.NEURAL, ServiceType.LEARNING, ServiceType.PATTERN_RECOGNITION].includes(config?.type);
}
export function isMemoryServiceConfig(config) {
    return [ServiceType.MEMORY, ServiceType.CACHE, ServiceType.SESSION].includes(config?.type);
}
export function isDatabaseServiceConfig(config) {
    return [ServiceType.DATABASE, ServiceType.VECTOR, ServiceType.GRAPH].includes(config?.type);
}
export function isIntegrationServiceConfig(config) {
    return [ServiceType.API, ServiceType.SAFE_API, ServiceType.ARCHITECTURE_STORAGE].includes(config?.type);
}
export function isInfrastructureServiceConfig(config) {
    return [ServiceType.INFRASTRUCTURE, ServiceType.SYSTEM, ServiceType.MONITORING].includes(config?.type);
}
export function isMonitoringServiceConfig(config) {
    return [ServiceType.HEALTH, ServiceType.MONITORING, ServiceType.LOGGING].includes(config?.type);
}
