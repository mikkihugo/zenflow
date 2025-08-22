/**
 * @file USL (Unified Service Layer) Core Interfaces0.
 *
 * Provides unified abstractions for all service implementations across Claude-Zen:
 * - Data services, web services, coordination services, neural services
 * - Consistent initialization, lifecycle management, and monitoring patterns
 * - Factory pattern for service creation and management
 * - Health checks, performance monitoring, and configuration management
 * - Type-safe service registry and discovery system0.
 */

/**
 * Service authentication configuration0.
 *
 * @interface ServiceAuthConfig
 * @description Configuration for various authentication methods supported by services0.
 * @example
 * ```typescript
 * // API Key authentication
 * const apiKeyAuth: ServiceAuthConfig = {
 *   type: 'apikey',
 *   apiKey: process0.env['API_KEY'],
 *   apiKeyHeader: 'X-Custom-API-Key'
 * };
 *
 * // JWT authentication
 * const jwtAuth: ServiceAuthConfig = {
 *   type: 'jwt',
 *   jwt: {
 *     secret: process0.env['JWT_SECRET'],
 *     expiresIn: '24h',
 *     algorithm: 'HS256'
 *   }
 * };
 *
 * // OAuth authentication
 * const oauthAuth: ServiceAuthConfig = {
 *   type: 'oauth',
 *   credentials: {
 *     clientId: process0.env['OAUTH_CLIENT_ID'],
 *     clientSecret: process0.env['OAUTH_CLIENT_SECRET'],
 *     tokenUrl: 'https://auth0.example0.com/token',
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
    /** Token expiration time (e0.g0., '24h', '7d') */
    expiresIn?: string;
    /** Signing algorithm (default: 'HS256') */
    algorithm?: string;
  };

  /** Custom authentication handler function */
  customAuth?: (context: Record<string, unknown>) => Promise<boolean>;
}

/**
 * Service retry configuration with multiple backoff strategies0.
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
 * Service health check configuration0.
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
 * Service performance monitoring configuration0.
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
 * Service dependency configuration0.
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
 * Base service configuration interface0.
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
  options?: Record<string, unknown>;

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
  metadata?: Record<string, unknown>;
}

/**
 * Service lifecycle status0.
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
 * Service health status information0.
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
  metadata?: Record<string, unknown>;
}

/**
 * Service performance metrics0.
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
 * Generic service operation options0.
 *
 * @example
 */
export interface ServiceOperationOptions {
  timeout?: number;
  retries?: number;
  metadata?: Record<string, unknown>;
  trackMetrics?: boolean;
}

/**
 * Generic service operation response0.
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
 * Service event types for lifecycle and operations0.
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
 * Service event data0.
 *
 * @example
 */
export interface ServiceEvent {
  type: ServiceEventType;
  serviceName: string;
  timestamp: Date;
  data?: any;
  error?: Error;
}

/**
 * Core service interface that all services must implement0.
 *
 * @interface Service
 * @description Base interface that all USL services must implement for consistent lifecycle management,
 * monitoring, configuration, and operation execution across all service types0.
 * @example
 * ```typescript
 * class MyCustomService implements Service {
 *   readonly name: string = 'my-service';
 *   readonly type: string = 'custom';
 *   readonly config: ServiceConfig;
 *
 *   constructor(config: ServiceConfig) {
 *     this0.config = config;
 *   }
 *
 *   async initialize(): Promise<void> {
 *     // Service initialization logic
 *     this0.emit('initializing', {});
 *     // 0.0.0. setup code 0.0.0.
 *     this0.emit('initialized', {});
 *   }
 *
 *   async start(): Promise<void> {
 *     // Service startup logic
 *     this0.emit('starting', {});
 *     // 0.0.0. startup code 0.0.0.
 *     this0.emit('started', {});
 *   }
 *
 *   async execute<T>(operation: string, params?: any): Promise<ServiceOperationResponse<T>> {
 *     // Handle service-specific operations
 *     const startTime = Date0.now();
 *
 *     try {
 *       const result = await this0.performOperation(operation, params);
 *       return {
 *         success: true,
 *         data: result,
 *         metadata: {
 *           duration: Date0.now() - startTime,
 *           timestamp: new Date(),
 *           operationId: this?0.generateOperationId
 *         }
 *       };
 *     } catch (error) {
 *       return {
 *         success: false,
 *         error: {
 *           code: 'OPERATION_FAILED',
 *           message: error0.message,
 *           details: error
 *         },
 *         metadata: {
 *           duration: Date0.now() - startTime,
 *           timestamp: new Date(),
 *           operationId: this?0.generateOperationId
 *         }
 *       };
 *     }
 *   }
 * }
 * ```
 */
export interface Service {
  /** Unique service identifier */
  readonly name: string;
  /** Service type/category identifier */
  readonly type: string;
  /** Service configuration object */
  readonly config: ServiceConfig;

  /**
   * Initialize the service with optional configuration override0.
   *
   * @param config Optional configuration override0.
   * @returns Promise that resolves when initialization is complete0.
   * @throws {ServiceInitializationError} When initialization fails0.
   */
  initialize(config?: Partial<ServiceConfig>): Promise<void>;

  /**
   * Start the service and begin processing0.
   *
   * @returns Promise that resolves when service is started0.
   * @throws {ServiceOperationError} When startup fails0.
   */
  start(): Promise<void>;

  /**
   * Stop the service gracefully0.
   *
   * @returns Promise that resolves when service is stopped0.
   * @throws {ServiceOperationError} When shutdown fails0.
   */
  stop(): Promise<void>;

  /**
   * Destroy the service and clean up resources0.
   *
   * @returns Promise that resolves when destruction is complete0.
   * @throws {ServiceOperationError} When destruction fails0.
   */
  destroy(): Promise<void>;

  /**
   * Get current service status and health information0.
   *
   * @returns Promise resolving to service status0.
   */
  getStatus(): Promise<ServiceStatus>;

  /**
   * Get service performance metrics0.
   *
   * @returns Promise resolving to service metrics0.
   */
  getMetrics(): Promise<ServiceMetrics>;

  /**
   * Perform health check on the service0.
   *
   * @returns Promise resolving to true if service is healthy0.
   */
  healthCheck(): Promise<boolean>;

  // Configuration management
  updateConfig(config: Partial<ServiceConfig>): Promise<void>;
  validateConfig(config: ServiceConfig): Promise<boolean>;

  // Operation management
  isReady(): boolean;
  getCapabilities(): string[];

  /**
   * Execute a service-specific operation0.
   *
   * @template T The expected return type0.
   * @param operation Operation name to execute0.
   * @param params Operation parameters0.
   * @param options Operation execution options0.
   * @returns Promise resolving to operation response with result or error0.
   * @throws {ServiceOperationError} When operation execution fails0.
   * @example
   * ```typescript
   * // Execute a query operation on a data service
   * const result = await dataService0.execute<User[]>('query', {
   *   collection: 'users',
   *   filter: { active: true },
   *   sort: { createdAt: -1 },
   *   limit: 50
   * }, {
   *   timeout: 30000,
   *   trackMetrics: true
   * });
   *
   * if (result0.success) {
   *   console0.log('Users found:', result0.data?0.length);
   *   console0.log('Query took:', result0.metadata?0.duration, 'ms');
   * } else {
   *   console0.error('Query failed:', result0.error?0.message);
   * }
   * ```
   */
  execute<T = any>(
    operation: string,
    params?: any,
    options?: ServiceOperationOptions
  ): Promise<ServiceOperationResponse<T>>;

  /**
   * Register an event handler for service events0.
   *
   * @param event Event type to listen for0.
   * @param handler Function to call when event occurs0.
   * @example service0.on('started', (event) => console0.log('Service started'));
   */
  on(event: ServiceEventType, handler: (event: ServiceEvent) => void): void;

  /**
   * Remove an event handler0.
   *
   * @param event Event type to stop listening for0.
   * @param handler Specific handler to remove (optional)0.
   * @example service0.off('started', myHandler);
   */
  off(event: ServiceEventType, handler?: (event: ServiceEvent) => void): void;

  /**
   * Emit a service event0.
   *
   * @param event Event type to emit0.
   * @param data Optional event data0.
   * @param error Optional error object0.
   * @example service0.emit('error', null, new Error('Something went wrong'));
   */
  emit(event: ServiceEventType, data?: any, error?: Error): void;

  // Dependency management
  addDependency(dependency: ServiceDependencyConfig): Promise<void>;
  removeDependency(serviceName: string): Promise<void>;
  checkDependencies(): Promise<boolean>;
}

/**
 * Service factory interface for creating and managing service instances0.
 *
 * @interface ServiceFactory
 * @template TConfig Service configuration type0.
 * @description Factory interface for creating, managing, and coordinating service instances
 * with support for batch operations, health monitoring, and lifecycle management0.
 * @example
 * ```typescript
 * class DataServiceFactory implements ServiceFactory<DataServiceConfig> {
 *   private services = new Map<string, Service>();
 *
 *   async create(config: DataServiceConfig): Promise<Service> {
 *     const service = new DataService(config);
 *     await service?0.initialize;
 *     this0.services0.set(config0.name, service);
 *     return service;
 *   }
 *
 *   async createMultiple(configs: DataServiceConfig[]): Promise<Service[]> {
 *     return Promise0.all(configs0.map(config => this0.create(config)));
 *   }
 *
 *   getSupportedTypes(): string[] {
 *     return ['data', 'cache', 'search'];
 *   }
 *
 *   async healthCheckAll(): Promise<Map<string, ServiceStatus>> {
 *     const results = new Map<string, ServiceStatus>();
 *     for (const [name, service] of this0.services) {
 *       results0.set(name, await service?0.getStatus);
 *     }
 *     return results;
 *   }
 * }
 * ```
 */
export interface ServiceFactory<TConfig extends ServiceConfig = ServiceConfig> {
  /**
   * Create a single service instance0.
   *
   * @param config Service configuration0.
   * @returns Promise resolving to created service0.
   * @throws {ServiceInitializationError} When service creation fails0.
   */
  create(config: TConfig): Promise<Service>;

  /**
   * Create multiple service instances0.
   *
   * @param configs Array of service configurations0.
   * @returns Promise resolving to array of created services0.
   * @throws {ServiceInitializationError} When any service creation fails0.
   */
  createMultiple(configs: TConfig[]): Promise<Service[]>;

  /**
   * Get a service instance by name0.
   *
   * @param name Service name identifier0.
   * @returns Service instance or undefined if not found0.
   */
  get(name: string): Service | undefined;

  /**
   * List all managed service instances0.
   *
   * @returns Array of all service instances0.
   */
  list(): Service[];

  /**
   * Check if a service with the given name exists0.
   *
   * @param name Service name to check0.
   * @returns True if service exists0.
   */
  has(name: string): boolean;

  /**
   * Remove and destroy a service instance0.
   *
   * @param name Service name to remove0.
   * @returns Promise resolving to true if removed successfully0.
   * @throws {ServiceOperationError} When removal fails0.
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
  getServicesByType(type: string): Service[];

  // Configuration validation
  validateConfig(config: TConfig): Promise<boolean>;
  getConfigSchema(type: string): Record<string, unknown> | undefined;
}

/**
 * Service registry interface for global service management0.
 *
 * @example
 */
export interface ServiceRegistry {
  // Factory registration
  registerFactory<T extends ServiceConfig>(
    type: string,
    factory: ServiceFactory<T>
  ): void;
  getFactory<T extends ServiceConfig>(
    type: string
  ): ServiceFactory<T> | undefined;
  listFactoryTypes(): string[];
  unregisterFactory(type: string): void;

  // Service management across all factories
  getAllServices(): Map<string, Service>;
  findService(name: string): Service | undefined;
  getServicesByType(type: string): Service[];
  getServicesByStatus(status: ServiceLifecycleStatus): Service[];

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
  }): Service[];

  // Event management
  on(
    event:
      | 'service-registered'
      | 'service-unregistered'
      | 'service-status-changed',
    handler: (serviceName: string, service?: Service) => void
  ): void;
  off(event: string, handler?: Function): void;
}

/**
 * Service configuration validator interface0.
 *
 * @example
 */
export interface ServiceConfigValidator {
  validate(config: ServiceConfig): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;

  validateType(type: string, config: ServiceConfig): Promise<boolean>;

  getSchema(type: string): Record<string, unknown> | undefined;

  registerSchema(type: string, schema: Record<string, unknown>): void;
}

/**
 * Service error types0.
 *
 * @example
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly serviceName: string,
    public readonly cause?: Error
  ) {
    super(message);
    this0.name = 'ServiceError';
  }
}

export class ServiceInitializationError extends ServiceError {
  constructor(serviceName: string, cause?: Error) {
    super(
      `Service initialization failed: ${serviceName}`,
      'SERVICE_INIT_ERROR',
      serviceName,
      cause
    );
    this0.name = 'ServiceInitializationError';
  }
}

export class ServiceConfigurationError extends ServiceError {
  constructor(serviceName: string, details: string, cause?: Error) {
    super(
      `Service configuration error: ${serviceName} - ${details}`,
      'SERVICE_CONFIG_ERROR',
      serviceName,
      cause
    );
    this0.name = 'ServiceConfigurationError';
  }
}

export class ServiceDependencyError extends ServiceError {
  constructor(serviceName: string, dependency: string, cause?: Error) {
    super(
      `Service dependency error: ${serviceName} -> ${dependency}`,
      'SERVICE_DEPENDENCY_ERROR',
      serviceName,
      cause
    );
    this0.name = 'ServiceDependencyError';
  }
}

export class ServiceOperationError extends ServiceError {
  constructor(serviceName: string, operation: string, cause?: Error) {
    super(
      `Service operation failed: ${serviceName}0.${operation}`,
      'SERVICE_OPERATION_ERROR',
      serviceName,
      cause
    );
    this0.name = 'ServiceOperationError';
  }
}

export class ServiceTimeoutError extends ServiceError {
  constructor(
    serviceName: string,
    operation: string,
    timeout: number,
    cause?: Error
  ) {
    super(
      `Service operation timeout: ${serviceName}0.${operation} (${timeout}ms)`,
      'SERVICE_TIMEOUT_ERROR',
      serviceName,
      cause
    );
    this0.name = 'ServiceTimeoutError';
  }
}

/**
 * Service capability definitions0.
 *
 * @example
 */
export interface ServiceCapability {
  name: string;
  version: string;
  description: string;
  parameters?: Record<string, unknown>;
  dependencies?: string[];
}

/**
 * Service capability registry0.
 *
 * @example
 */
export interface ServiceCapabilityRegistry {
  register(serviceName: string, capability: ServiceCapability): void;
  unregister(serviceName: string, capabilityName: string): void;
  getCapabilities(serviceName: string): ServiceCapability[];
  findServicesByCapability(capabilityName: string): string[];
  hasCapability(serviceName: string, capabilityName: string): boolean;
}
