/**
 * @file USL (Unified Service Layer) Types and Configuration.
 *
 * Centralized type definitions and configuration schemas for all service types.
 * in the Claude-Zen ecosystem.
 */
import type { ServiceConfig } from './core/interfaces.ts';
/**
 * Service type enumeration for all supported service categories.
 */
export declare enum ServiceType {
    DATA = "data",
    WEB_DATA = "web-data",
    DOCUMENT = "document",
    COORDINATION = "coordination",
    SWARM = "swarm",
    ORCHESTRATION = "orchestration",
    DAA = "daa",// Data Accessibility and Analysis
    SESSION_RECOVERY = "session-recovery",
    ARCHITECTURE_STORAGE = "architecture-storage",
    API = "api",
    SAFE_API = "safe-api",
    WEB = "web",
    MCP = "mcp",
    CLI = "cli",
    TUI = "tui",
    NEURAL = "neural",
    LEARNING = "learning",
    PATTERN_RECOGNITION = "pattern-recognition",
    MEMORY = "memory",
    CACHE = "cache",
    SESSION = "session",
    DATABASE = "database",
    VECTOR = "vector",
    GRAPH = "graph",
    INFRASTRUCTURE = "infrastructure",
    SYSTEM = "system",
    HEALTH = "health",
    MONITORING = "monitoring",
    LOGGING = "logging",
    SECURITY = "security",
    WORKFLOW = "workflow",
    TASK = "task",
    PIPELINE = "pipeline",
    WEBSOCKET = "websocket",
    MESSAGE_QUEUE = "message-queue",
    EVENT_BUS = "event-bus",
    CUSTOM = "custom"
}
/**
 * Service priority levels for initialization and resource allocation.
 */
export declare enum ServicePriority {
    CRITICAL = 0,// System-critical services (database, logging)
    HIGH = 1,// Important services (authentication, security)
    NORMAL = 2,// Standard services (API, web)
    LOW = 3,// Optional services (monitoring, analytics)
    BACKGROUND = 4
}
/**
 * Service environment configuration.
 */
export declare enum ServiceEnvironment {
    DEVELOPMENT = "development",
    TESTING = "testing",
    STAGING = "staging",
    PRODUCTION = "production"
}
/**
 * Base service configuration with common properties.
 *
 * @example
 */
export interface BaseServiceConfig extends ServiceConfig {
    type: ServiceType | string;
    priority?: ServicePriority;
    environment?: ServiceEnvironment;
    tags?: string[];
}
/**
 * Data service configuration for data management services.
 *
 * @example
 */
export interface DataServiceConfig extends BaseServiceConfig {
    type: ServiceType.DATA | ServiceType.WEB_DATA | ServiceType.DOCUMENT;
    dataSource?: {
        type: 'database' | 'memory' | 'file' | 'api';
        connection?: string;
        options?: Record<string, unknown>;
    };
    caching?: {
        enabled: boolean;
        ttl?: number;
        maxSize?: number;
    };
    validation?: {
        enabled: boolean;
        strict?: boolean;
        schemas?: Record<string, unknown>;
    };
}
/**
 * Web service configuration for HTTP/WebSocket services.
 *
 * @example
 */
export interface WebServiceConfig extends BaseServiceConfig {
    type: ServiceType.WEB | ServiceType.API | ServiceType.SAFE_API | ServiceType.WEBSOCKET;
    server?: {
        host?: string;
        port?: number;
        ssl?: {
            enabled: boolean;
            cert?: string;
            key?: string;
        };
    };
    cors?: {
        enabled: boolean;
        origins?: string[];
        methods?: string[];
        headers?: string[];
    };
    rateLimit?: {
        enabled: boolean;
        requests?: number;
        window?: number;
        skipSuccessfulRequests?: boolean;
    };
    middleware?: {
        compression?: boolean;
        helmet?: boolean;
        morgan?: boolean;
        custom?: Array<{
            name: string;
            options?: Record<string, unknown>;
        }>;
    };
}
/**
 * Coordination service configuration for swarm and orchestration.
 *
 * @example
 */
export interface CoordinationServiceConfig extends BaseServiceConfig {
    type: ServiceType.COORDINATION | ServiceType.SWARM | ServiceType.ORCHESTRATION | ServiceType.DAA | ServiceType.SESSION_RECOVERY;
    coordination?: {
        topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
        maxAgents?: number;
        strategy?: 'parallel' | 'sequential' | 'adaptive';
        timeout?: number;
    };
    persistence?: {
        enabled: boolean;
        storage?: 'memory' | 'database' | 'file';
        compression?: boolean;
    };
    recovery?: {
        enabled: boolean;
        checkInterval?: number;
        maxRetries?: number;
        backupInterval?: number;
    };
}
/**
 * Neural service configuration for AI and ML services.
 *
 * @example
 */
export interface NeuralServiceConfig extends BaseServiceConfig {
    type: ServiceType.NEURAL | ServiceType.LEARNING | ServiceType.PATTERN_RECOGNITION;
    model?: {
        type: 'neural-network' | 'transformer' | 'custom';
        path?: string;
        config?: Record<string, unknown>;
    };
    training?: {
        enabled: boolean;
        dataPath?: string;
        batchSize?: number;
        epochs?: number;
        learningRate?: number;
    };
    inference?: {
        batchSize?: number;
        timeout?: number;
        caching?: boolean;
    };
    gpu?: {
        enabled: boolean;
        deviceId?: number;
        memoryLimit?: number;
    };
}
/**
 * Memory service configuration for caching and session management.
 *
 * @example
 */
export interface MemoryServiceConfig extends BaseServiceConfig {
    type: ServiceType.MEMORY | ServiceType.CACHE | ServiceType.SESSION;
    storage?: {
        type: 'memory' | 'redis' | 'memcached' | 'database';
        connection?: string;
        maxMemory?: number;
    };
    eviction?: {
        policy: 'lru' | 'lfu' | 'fifo' | 'ttl';
        maxSize?: number;
        ttl?: number;
    };
    serialization?: {
        type: 'json' | 'msgpack' | 'custom';
        compression?: boolean;
    };
    persistence?: {
        enabled: boolean;
        interval?: number;
        path?: string;
    };
}
/**
 * Database service configuration for database integrations.
 *
 * @example
 */
export interface DatabaseServiceConfig extends BaseServiceConfig {
    type: ServiceType.DATABASE | ServiceType.VECTOR | ServiceType.GRAPH;
    connection?: {
        host?: string;
        port?: number;
        database?: string;
        username?: string;
        password?: string;
        ssl?: boolean;
        poolSize?: number;
    };
    migrations?: {
        enabled: boolean;
        path?: string;
        autoRun?: boolean;
    };
    backup?: {
        enabled: boolean;
        interval?: number;
        retention?: number;
        path?: string;
    };
    performance?: {
        queryTimeout?: number;
        connectionTimeout?: number;
        idleTimeout?: number;
        maxRetries?: number;
    };
}
/**
 * Interface service configuration for CLI, TUI, MCP services.
 *
 * @example
 */
export interface InterfaceServiceConfig extends BaseServiceConfig {
    type: ServiceType.CLI | ServiceType.TUI | ServiceType.MCP;
    interface?: {
        interactive?: boolean;
        colors?: boolean;
        prompt?: string;
        history?: boolean;
    };
    commands?: {
        prefix?: string;
        aliases?: Record<string, string>;
        plugins?: string[];
    };
    output?: {
        format?: 'text' | 'json' | 'yaml' | 'table';
        verbosity?: 'minimal' | 'normal' | 'verbose' | 'debug';
        streaming?: boolean;
    };
}
/**
 * Monitoring service configuration for health and performance tracking.
 *
 * @example
 */
export interface MonitoringServiceConfig extends BaseServiceConfig {
    type: ServiceType.HEALTH | ServiceType.MONITORING | ServiceType.LOGGING;
    metrics?: {
        enabled: boolean;
        interval?: number;
        retention?: number;
        aggregation?: 'none' | 'avg' | 'sum' | 'max' | 'min';
    };
    alerts?: {
        enabled: boolean;
        thresholds?: Record<string, number>;
        channels?: Array<{
            type: 'email' | 'webhook' | 'console';
            config: Record<string, unknown>;
        }>;
    };
    storage?: {
        type: 'memory' | 'database' | 'file' | 'external';
        connection?: string;
        compression?: boolean;
    };
}
/**
 * Workflow service configuration for task and pipeline management.
 *
 * @example
 */
export interface WorkflowServiceConfig extends BaseServiceConfig {
    type: ServiceType.WORKFLOW | ServiceType.TASK | ServiceType.PIPELINE;
    execution?: {
        parallel?: boolean;
        maxConcurrency?: number;
        timeout?: number;
        retries?: number;
    };
    scheduling?: {
        enabled: boolean;
        cron?: string;
        timezone?: string;
    };
    state?: {
        persistence: boolean;
        storage?: 'memory' | 'database' | 'file';
        compression?: boolean;
    };
    notifications?: {
        enabled: boolean;
        events?: string[];
        channels?: string[];
    };
}
/**
 * Integration service configuration for integration services.
 *
 * @example
 */
export interface IntegrationServiceConfig extends BaseServiceConfig {
    type: ServiceType.API | ServiceType.SAFE_API | ServiceType.ARCHITECTURE_STORAGE;
    integration?: {
        architectureStorage?: boolean;
        safeAPI?: boolean;
        protocolManagement?: boolean;
        multiProtocol?: boolean;
    };
    protocols?: {
        supported?: string[];
        default?: string;
        failover?: boolean;
        loadBalancing?: boolean;
    };
    performance?: {
        caching?: boolean;
        deduplication?: boolean;
        connectionPooling?: boolean;
        metricsCollection?: boolean;
    };
    security?: {
        validation?: boolean;
        sanitization?: boolean;
        rateLimiting?: boolean;
        auditLogging?: boolean;
    };
}
/**
 * Infrastructure service configuration for infrastructure and system services.
 *
 * @example
 */
export interface InfrastructureServiceConfig extends BaseServiceConfig {
    type: ServiceType.INFRASTRUCTURE | ServiceType.SYSTEM | ServiceType.MONITORING;
    facade?: {
        enabled: boolean;
        autoInitialize?: boolean;
        enableCaching?: boolean;
        enableMetrics?: boolean;
        enableHealthChecks?: boolean;
        systemStatusInterval?: number;
    };
    patternIntegration?: {
        enabled: boolean;
        configProfile?: 'default' | 'production' | 'development';
        enableEventSystem?: boolean;
        enableCommandSystem?: boolean;
        enableProtocolSystem?: boolean;
        enableAgentSystem?: boolean;
    };
    orchestration?: {
        enableServiceDiscovery?: boolean;
        enableLoadBalancing?: boolean;
        enableCircuitBreaker?: boolean;
        maxConcurrentServices?: number;
        serviceStartupTimeout?: number;
        shutdownGracePeriod?: number;
    };
    resourceManagement?: {
        enableResourceTracking?: boolean;
        enableResourceOptimization?: boolean;
        memoryThreshold?: number;
        cpuThreshold?: number;
        diskThreshold?: number;
        networkThreshold?: number;
        cleanupInterval?: number;
    };
    configManagement?: {
        enableHotReload?: boolean;
        enableValidation?: boolean;
        enableVersioning?: boolean;
        reloadCheckInterval?: number;
        backupConfigs?: boolean;
        maxConfigHistory?: number;
    };
    eventCoordination?: {
        enableCentralizedEvents?: boolean;
        enableEventPersistence?: boolean;
        enableEventMetrics?: boolean;
        maxEventQueueSize?: number;
        eventRetentionPeriod?: number;
        enableEventFiltering?: boolean;
    };
    healthMonitoring?: {
        enableAdvancedChecks?: boolean;
        enableServiceDependencyTracking?: boolean;
        enablePerformanceAlerts?: boolean;
        healthCheckTimeout?: number;
        performanceThresholds?: {
            responseTime?: number;
            errorRate?: number;
            resourceUsage?: number;
        };
    };
}
/**
 * Union type for all service configurations.
 */
export type AnyServiceConfig = DataServiceConfig | WebServiceConfig | CoordinationServiceConfig | NeuralServiceConfig | MemoryServiceConfig | DatabaseServiceConfig | InterfaceServiceConfig | IntegrationServiceConfig | InfrastructureServiceConfig | MonitoringServiceConfig | WorkflowServiceConfig | BaseServiceConfig;
/**
 * Service configuration factory for creating typed configurations.
 *
 * @example
 */
export declare class ServiceConfigFactory {
    /**
     * Create a data service configuration.
     *
     * @param name
     * @param options
     */
    static createDataServiceConfig(name: string, options?: Partial<DataServiceConfig>): DataServiceConfig;
    /**
     * Create a web service configuration.
     *
     * @param name
     * @param options
     */
    static createWebServiceConfig(name: string, options?: Partial<WebServiceConfig>): WebServiceConfig;
    /**
     * Create a coordination service configuration.
     *
     * @param name
     * @param options
     */
    static createCoordinationServiceConfig(name: string, options?: Partial<CoordinationServiceConfig>): CoordinationServiceConfig;
    /**
     * Create a neural service configuration.
     *
     * @param name
     * @param options
     */
    static createNeuralServiceConfig(name: string, options?: Partial<NeuralServiceConfig>): NeuralServiceConfig;
    /**
     * Create a memory service configuration.
     *
     * @param name
     * @param options
     */
    static createMemoryServiceConfig(name: string, options?: Partial<MemoryServiceConfig>): MemoryServiceConfig;
    /**
     * Create a database service configuration.
     *
     * @param name
     * @param options
     */
    static createDatabaseServiceConfig(name: string, options?: Partial<DatabaseServiceConfig>): DatabaseServiceConfig;
    /**
     * Create a monitoring service configuration.
     *
     * @param name
     * @param options
     */
    static createMonitoringServiceConfig(name: string, options?: Partial<MonitoringServiceConfig>): MonitoringServiceConfig;
    /**
     * Create an integration service configuration.
     *
     * @param name
     * @param options
     */
    static createIntegrationServiceConfig(name: string, options?: Partial<IntegrationServiceConfig>): IntegrationServiceConfig;
    /**
     * Create an infrastructure service configuration.
     *
     * @param name
     * @param options
     */
    static createInfrastructureServiceConfig(name: string, options?: Partial<InfrastructureServiceConfig>): InfrastructureServiceConfig;
    /**
     * Create a workflow service configuration.
     *
     * @param name
     * @param options
     */
    static createWorkflowServiceConfig(name: string, options?: Partial<WorkflowServiceConfig>): WorkflowServiceConfig;
}
/**
 * Type guard functions for service configurations.
 *
 * @param config
 * @example
 */
export declare function isDataServiceConfig(config: AnyServiceConfig): config is DataServiceConfig;
export declare function isWebServiceConfig(config: AnyServiceConfig): config is WebServiceConfig;
export declare function isCoordinationServiceConfig(config: AnyServiceConfig): config is CoordinationServiceConfig;
export declare function isNeuralServiceConfig(config: AnyServiceConfig): config is NeuralServiceConfig;
export declare function isMemoryServiceConfig(config: AnyServiceConfig): config is MemoryServiceConfig;
export declare function isDatabaseServiceConfig(config: AnyServiceConfig): config is DatabaseServiceConfig;
export declare function isIntegrationServiceConfig(config: AnyServiceConfig): config is IntegrationServiceConfig;
export declare function isInfrastructureServiceConfig(config: AnyServiceConfig): config is InfrastructureServiceConfig;
export declare function isMonitoringServiceConfig(config: AnyServiceConfig): config is MonitoringServiceConfig;
//# sourceMappingURL=types.d.ts.map