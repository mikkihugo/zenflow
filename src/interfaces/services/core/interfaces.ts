/**
 * @file USL (Unified Service Layer) Core Interfaces.
 *
 * Provides unified abstractions for all service implementations across Claude-Zen:
 * - Data services, web services, coordination services, neural services
 * - Consistent initialization, lifecycle management, and monitoring patterns
 * - Factory pattern for service creation and management
 * - Health checks, performance monitoring, and configuration management
 * - Type-safe service registry and discovery system.
 */

/**
 * Service authentication configuration.
 *
 * @interface ServiceAuthConfig
 * @description Configuration for various authentication methods supported by services.
 * @example
 * ```typescript
 * // API Key authentication
 * const apiKeyAuth: ServiceAuthConfig = {
 *   type: 'apikey',
 *   apiKey: process.env['API_KEY'],
 *   apiKeyHeader: 'X-Custom-API-Key'
 * };
 *
 * // JWT authentication
 * const jwtAuth: ServiceAuthConfig = {
 *   type: 'jwt',
 *   jwt: {
 *     secret: process.env['JWT_SECRET'],
 *     expiresIn: '24h',
 *     algorithm: 'HS256'
 *   }
 * };
 *
 * // OAuth authentication
 * const oauthAuth: ServiceAuthConfig = {
 *   type: 'oauth',
 *   credentials: {
 *     clientId: process.env['OAUTH_CLIENT_ID'],
 *     clientSecret: process.env['OAUTH_CLIENT_SECRET'],
 *     tokenUrl: 'https://auth.example.com/token',
 *     scope: 'read:data write:data'
 *   }
 * };
 * ```
 */
export interface ServiceAuthConfig {
  /** Authentication type to use */
  type: 'none' | 'apikey' | 'oauth' | 'jwt' | 'custom';

  /** API key for authentication (used with 'apikey' type) */
  apiKey?: string;
  /** HTTP header name for API key (default: 'X-API-Key') */
  apiKeyHeader?: string;

  /** OAuth credentials configuration (used with 'oauth' type) */
  credentials?: {
    /** OAuth client identifier */
    clientId: string;
    /** OAuth client secret */
    clientSecret: string;
    /** Token endpoint URL */
    tokenUrl: string;
    /** OAuth scope string */
    scope?: string;
  };

  /** JWT configuration (used with 'jwt' type) */
  jwt?: {
    /** JWT signing secret */
    secret: string;
    /** Token expiration time (e.g., '24h', '7d') */
    expiresIn?: string;
    /** Signing algorithm (default: 'HS256') */
    algorithm?: string;
  };

  /** Custom authentication handler function */
  customAuth?: (context: Record<string, unknown>) => Promise<boolean>;
}

/**
 * Service retry configuration with multiple backoff strategies.
 *
 * @example
 */
export interface ServiceRetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  maxDelay?: number;
  retryCondition?: (error: Error) => boolean;
}

/**
 * Service health check configuration.
 *
 * @example
 */
export interface ServiceHealthConfig {
  enabled: boolean;
  interval: number; // ms
  timeout: number; // ms
  failureThreshold: number;
  successThreshold: number;
  customCheck?: () => Promise<boolean>;
}

/**
 * Service performance monitoring configuration.
 *
 * @example
 */
export interface ServiceMonitoringConfig {
  enabled: boolean;
  metricsInterval: number; // ms
  trackLatency: boolean;
  trackThroughput: boolean;
  trackErrors: boolean;
  trackMemoryUsage: boolean;
  customMetrics?: string[];
}

/**
 * Service dependency configuration.
 *
 * @example
 */
export interface ServiceDependencyConfig {
  serviceName: string;
  required: boolean;
  healthCheck?: boolean;
  timeout?: number;
  retries?: number;
}

/**
 * Base service configuration interface.
 *
 * @example
 */
export interface ServiceConfig {
  /** Service unique identifier */
  name: string;

  /** Service type/category */
  type: string;

  /** Service version */
  version?: string;

  /** Service description */
  description?: string;

  /** Is service enabled */
  enabled?: boolean;

  /** Service initialization timeout */
  timeout?: number;

  /** Service-specific configuration */
  options?: Record<string, any>;

  /** Authentication configuration */
  auth?: ServiceAuthConfig;

  /** Retry configuration */
  retry?: ServiceRetryConfig;

  /** Health check configuration */
  health?: ServiceHealthConfig;

  /** Performance monitoring configuration */
  monitoring?: ServiceMonitoringConfig;

  /** Service dependencies */
  dependencies?: ServiceDependencyConfig[];

  /** Custom metadata */
  metadata?: Record<string, any>;
}

/**
 * Service lifecycle status.
 */
export type ServiceLifecycleStatus =
  | 'uninitialized'
  | 'initializing'
  | 'initialized'
  | 'starting'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'error'
  | 'destroyed';

/**
 * Service health status information.
 *
 * @example
 */
export interface ServiceStatus {
  name: string;
  type: string;
  lifecycle: ServiceLifecycleStatus;
  health: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: Date;
  uptime: number;
  errorCount: number;
  errorRate: number;
  dependencies?: {
    [serviceName: string]: {
      status: 'healthy' | 'unhealthy' | 'unknown';
      lastCheck: Date;
    };
  };
  metadata?: Record<string, any>;
}

/**
 * Service performance metrics.
 *
 * @example
 */
export interface ServiceMetrics {
  name: string;
  type: string;
  operationCount: number;
  successCount: number;
  errorCount: number;
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  throughput: number; // operations per second
  memoryUsage?: {
    used: number;
    total: number;
    percentage: number;
  };
  customMetrics?: Record<string, number>;
  timestamp: Date;
}

/**
 * Generic service operation options.
 *
 * @example
 */
export interface ServiceOperationOptions {
  timeout?: number;
  retries?: number;
  metadata?: Record<string, any>;
  trackMetrics?: boolean;
}

/**
 * Generic service operation response.
 *
 * @example
 */
export interface ServiceOperationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    stack?: string;
  };
  metadata?: {
    duration: number;
    timestamp: Date;
    operationId: string;
  };
}

/**
 * Service event types for lifecycle and operations.
 */
export type ServiceEventType =
  | 'initializing'
  | 'initialized'
  | 'starting'
  | 'started'
  | 'stopping'
  | 'stopped'
  | 'error'
  | 'operation'
  | 'health-check'
  | 'metrics-update';

/**
 * Service event data.
 *
 * @example
 */
export interface ServiceEvent {
  type: ServiceEventType;
  serviceName: string;
  timestamp: Date;
  data?: unknown;
  error?: Error;
}

/**
 * Core service interface that all services must implement.
 *
 * @interface IService
 * @description Base interface that all USL services must implement for consistent lifecycle management,
 * monitoring, configuration, and operation execution across all service types.
 * @example
 * ```typescript
 * class MyCustomService implements IService {
 *   readonly name: string = 'my-service';
 *   readonly type: string = 'custom';
 *   readonly config: ServiceConfig;
 *
 *   constructor(config: ServiceConfig) {
 *     this.config = config;
 *   }
 *
 *   async initialize(): Promise<void> {
 *     // Service initialization logic
 *     this.emit('initializing');
 *     // ... setup code ...
 *     this.emit('initialized');
 *   }
 *
 *   async start(): Promise<void> {
 *     // Service startup logic
 *     this.emit('starting');
 *     // ... startup code ...
 *     this.emit('started');
 *   }
 *
 *   async execute<T>(operation: string, params?: any): Promise<ServiceOperationResponse<T>> {
 *     // Handle service-specific operations
 *     const startTime = Date.now();
 *
 *     try {
 *       const result = await this.performOperation(operation, params);
 *       return {
 *         success: true,
 *         data: result,
 *         metadata: {
 *           duration: Date.now() - startTime,
 *           timestamp: new Date(),
 *           operationId: this.generateOperationId()
 *         }
 *       };
 *     } catch (error) {
 *       return {
 *         success: false,
 *         error: {
 *           code: 'OPERATION_FAILED',
 *           message: error.message,
 *           details: error
 *         },
 *         metadata: {
 *           duration: Date.now() - startTime,
 *           timestamp: new Date(),
 *           operationId: this.generateOperationId()
 *         }
 *       };
 *     }
 *   }
 * }
 * ```
 */
export interface IService {
  /** Unique service identifier */
  readonly name: string;
  /** Service type/category identifier */
  readonly type: string;
  /** Service configuration object */
  readonly config: ServiceConfig;

  /**
   * Initialize the service with optional configuration override.
   *
   * @param config Optional configuration override.
   * @returns Promise that resolves when initialization is complete.
   * @throws {ServiceInitializationError} When initialization fails.
   */
  initialize(config?: Partial<ServiceConfig>): Promise<void>;

  /**
   * Start the service and begin processing.
   *
   * @returns Promise that resolves when service is started.
   * @throws {ServiceOperationError} When startup fails.
   */
  start(): Promise<void>;

  /**
   * Stop the service gracefully.
   *
   * @returns Promise that resolves when service is stopped.
   * @throws {ServiceOperationError} When shutdown fails.
   */
  stop(): Promise<void>;

  /**
   * Destroy the service and clean up resources.
   *
   * @returns Promise that resolves when destruction is complete.
   * @throws {ServiceOperationError} When destruction fails.
   */
  destroy(): Promise<void>;

  /**
   * Get current service status and health information.
   *
   * @returns Promise resolving to service status.
   */
  getStatus(): Promise<ServiceStatus>;

  /**
   * Get service performance metrics.
   *
   * @returns Promise resolving to service metrics.
   */
  getMetrics(): Promise<ServiceMetrics>;

  /**
   * Perform health check on the service.
   *
   * @returns Promise resolving to true if service is healthy.
   */
  healthCheck(): Promise<boolean>;

  // Configuration management
  updateConfig(config: Partial<ServiceConfig>): Promise<void>;
  validateConfig(config: ServiceConfig): Promise<boolean>;

  // Operation management
  isReady(): boolean;
  getCapabilities(): string[];

  /**
   * Execute a service-specific operation.
   *
   * @template T The expected return type.
   * @param operation Operation name to execute.
   * @param params Operation parameters.
   * @param options Operation execution options.
   * @returns Promise resolving to operation response with result or error.
   * @throws {ServiceOperationError} When operation execution fails.
   * @example
   * ```typescript
   * // Execute a query operation on a data service
   * const result = await dataService.execute<User[]>('query', {
   *   collection: 'users',
   *   filter: { active: true },
   *   sort: { createdAt: -1 },
   *   limit: 50
   * }, {
   *   timeout: 30000,
   *   trackMetrics: true
   * });
   *
   * if (result.success) {
   *   console.log('Users found:', result.data?.length);
   *   console.log('Query took:', result.metadata?.duration, 'ms');
   * } else {
   *   console.error('Query failed:', result.error?.message);
   * }
   * ```
   */
  execute<T = any>(
    operation: string,
    params?: any,
    options?: ServiceOperationOptions,
  ): Promise<ServiceOperationResponse<T>>;

  /**
   * Register an event handler for service events.
   *
   * @param event Event type to listen for.
   * @param handler Function to call when event occurs.
   * @example service.on('started', (event) => console.log('Service started'));
   */
  on(event: ServiceEventType, handler: (event: ServiceEvent) => void): void;

  /**
   * Remove an event handler.
   *
   * @param event Event type to stop listening for.
   * @param handler Specific handler to remove (optional).
   * @example service.off('started', myHandler);
   */
  off(event: ServiceEventType, handler?: (event: ServiceEvent) => void): void;

  /**
   * Emit a service event.
   *
   * @param event Event type to emit.
   * @param data Optional event data.
   * @param error Optional error object.
   * @example service.emit('error', null, new Error('Something went wrong'));
   */
  emit(event: ServiceEventType, data?: unknown, error?: Error): void;

  // Dependency management
  addDependency(dependency: ServiceDependencyConfig): Promise<void>;
  removeDependency(serviceName: string): Promise<void>;
  checkDependencies(): Promise<boolean>;
}

/**
 * Service factory interface for creating and managing service instances.
 *
 * @interface IServiceFactory
 * @template TConfig Service configuration type.
 * @description Factory interface for creating, managing, and coordinating service instances
 * with support for batch operations, health monitoring, and lifecycle management.
 * @example
 * ```typescript
 * class DataServiceFactory implements IServiceFactory<DataServiceConfig> {
 *   private services = new Map<string, IService>();
 *
 *   async create(config: DataServiceConfig): Promise<IService> {
 *     const service = new DataService(config);
 *     await service.initialize();
 *     this.services.set(config.name, service);
 *     return service;
 *   }
 *
 *   async createMultiple(configs: DataServiceConfig[]): Promise<IService[]> {
 *     return Promise.all(configs.map(config => this.create(config)));
 *   }
 *
 *   getSupportedTypes(): string[] {
 *     return ['data', 'cache', 'search'];
 *   }
 *
 *   async healthCheckAll(): Promise<Map<string, ServiceStatus>> {
 *     const results = new Map<string, ServiceStatus>();
 *     for (const [name, service] of this.services) {
 *       results.set(name, await service.getStatus());
 *     }
 *     return results;
 *   }
 * }
 * ```
 */
export interface IServiceFactory<
  TConfig extends ServiceConfig = ServiceConfig,
> {
  /**
   * Create a single service instance.
   *
   * @param config Service configuration.
   * @returns Promise resolving to created service.
   * @throws {ServiceInitializationError} When service creation fails.
   */
  create(config: TConfig): Promise<IService>;

  /**
   * Create multiple service instances.
   *
   * @param configs Array of service configurations.
   * @returns Promise resolving to array of created services.
   * @throws {ServiceInitializationError} When any service creation fails.
   */
  createMultiple(configs: TConfig[]): Promise<IService[]>;

  /**
   * Get a service instance by name.
   *
   * @param name Service name identifier.
   * @returns Service instance or undefined if not found.
   */
  get(name: string): IService | undefined;

  /**
   * List all managed service instances.
   *
   * @returns Array of all service instances.
   */
  list(): IService[];

  /**
   * Check if a service with the given name exists.
   *
   * @param name Service name to check.
   * @returns True if service exists.
   */
  has(name: string): boolean;

  /**
   * Remove and destroy a service instance.
   *
   * @param name Service name to remove.
   * @returns Promise resolving to true if removed successfully.
   * @throws {ServiceOperationError} When removal fails.
   */
  remove(name: string): Promise<boolean>;

  // Service type support
  getSupportedTypes(): string[];
  supportsType(type: string): boolean;

  // Batch operations
  startAll(): Promise<void>;
  stopAll(): Promise<void>;
  healthCheckAll(): Promise<Map<string, ServiceStatus>>;
  getMetricsAll(): Promise<Map<string, ServiceMetrics>>;

  // Factory management
  shutdown(): Promise<void>;
  getActiveCount(): number;
  getServicesByType(type: string): IService[];

  // Configuration validation
  validateConfig(config: TConfig): Promise<boolean>;
  getConfigSchema(type: string): Record<string, any> | undefined;
}

/**
 * Service registry interface for global service management.
 *
 * @example
 */
export interface IServiceRegistry {
  // Factory registration
  registerFactory<T extends ServiceConfig>(
    type: string,
    factory: IServiceFactory<T>,
  ): void;
  getFactory<T extends ServiceConfig>(
    type: string,
  ): IServiceFactory<T> | undefined;
  listFactoryTypes(): string[];
  unregisterFactory(type: string): void;

  // Service management across all factories
  getAllServices(): Map<string, IService>;
  findService(name: string): IService | undefined;
  getServicesByType(type: string): IService[];
  getServicesByStatus(status: ServiceLifecycleStatus): IService[];

  // Global operations
  startAllServices(): Promise<void>;
  stopAllServices(): Promise<void>;
  healthCheckAll(): Promise<Map<string, ServiceStatus>>;
  getSystemMetrics(): Promise<{
    totalServices: number;
    runningServices: number;
    healthyServices: number;
    errorServices: number;
    aggregatedMetrics: ServiceMetrics[];
  }>;
  shutdownAll(): Promise<void>;

  // Service discovery
  discoverServices(criteria?: {
    type?: string;
    capabilities?: string[];
    health?: 'healthy' | 'degraded' | 'unhealthy';
    tags?: string[];
  }): IService[];

  // Event management
  on(
    event:
      | 'service-registered'
      | 'service-unregistered'
      | 'service-status-changed',
    handler: (serviceName: string, service?: IService) => void,
  ): void;
  off(event: string, handler?: Function): void;
}

/**
 * Service configuration validator interface.
 *
 * @example
 */
export interface IServiceConfigValidator {
  validate(config: ServiceConfig): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;

  validateType(type: string, config: ServiceConfig): Promise<boolean>;

  getSchema(type: string): Record<string, any> | undefined;

  registerSchema(type: string, schema: Record<string, any>): void;
}

/**
 * Service error types.
 *
 * @example
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly serviceName: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export class ServiceInitializationError extends ServiceError {
  constructor(serviceName: string, cause?: Error) {
    super(
      `Service initialization failed: ${serviceName}`,
      'SERVICE_INIT_ERROR',
      serviceName,
      cause,
    );
    this.name = 'ServiceInitializationError';
  }
}

export class ServiceConfigurationError extends ServiceError {
  constructor(serviceName: string, details: string, cause?: Error) {
    super(
      `Service configuration error: ${serviceName} - ${details}`,
      'SERVICE_CONFIG_ERROR',
      serviceName,
      cause,
    );
    this.name = 'ServiceConfigurationError';
  }
}

export class ServiceDependencyError extends ServiceError {
  constructor(serviceName: string, dependency: string, cause?: Error) {
    super(
      `Service dependency error: ${serviceName} -> ${dependency}`,
      'SERVICE_DEPENDENCY_ERROR',
      serviceName,
      cause,
    );
    this.name = 'ServiceDependencyError';
  }
}

export class ServiceOperationError extends ServiceError {
  constructor(serviceName: string, operation: string, cause?: Error) {
    super(
      `Service operation failed: ${serviceName}.${operation}`,
      'SERVICE_OPERATION_ERROR',
      serviceName,
      cause,
    );
    this.name = 'ServiceOperationError';
  }
}

export class ServiceTimeoutError extends ServiceError {
  constructor(
    serviceName: string,
    operation: string,
    timeout: number,
    cause?: Error,
  ) {
    super(
      `Service operation timeout: ${serviceName}.${operation} (${timeout}ms)`,
      'SERVICE_TIMEOUT_ERROR',
      serviceName,
      cause,
    );
    this.name = 'ServiceTimeoutError';
  }
}

/**
 * Service capability definitions.
 *
 * @example
 */
export interface ServiceCapability {
  name: string;
  version: string;
  description: string;
  parameters?: Record<string, any>;
  dependencies?: string[];
}

/**
 * Service capability registry.
 *
 * @example
 */
export interface IServiceCapabilityRegistry {
  register(serviceName: string, capability: ServiceCapability): void;
  unregister(serviceName: string, capabilityName: string): void;
  getCapabilities(serviceName: string): ServiceCapability[];
  findServicesByCapability(capabilityName: string): string[];
  hasCapability(serviceName: string, capabilityName: string): boolean;
}
