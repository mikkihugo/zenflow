/**
 * USL (Unified Service Layer) Core Interfaces
 * 
 * Provides unified abstractions for all service implementations across Claude-Zen:
 * - Data services, web services, coordination services, neural services
 * - Consistent initialization, lifecycle management, and monitoring patterns
 * - Factory pattern for service creation and management
 * - Health checks, performance monitoring, and configuration management
 * - Type-safe service registry and discovery system
 */

/**
 * Service authentication configuration
 */
export interface ServiceAuthConfig {
  type: 'none' | 'apikey' | 'oauth' | 'jwt' | 'custom';
  
  // API key auth
  apiKey?: string;
  apiKeyHeader?: string; // Default: 'X-API-Key'
  
  // OAuth credentials
  credentials?: {
    clientId: string;
    clientSecret: string;
    tokenUrl: string;
    scope?: string;
  };
  
  // JWT configuration
  jwt?: {
    secret: string;
    expiresIn?: string;
    algorithm?: string;
  };
  
  // Custom auth handler
  customAuth?: (context: any) => Promise<boolean>;
}

/**
 * Service retry configuration with multiple backoff strategies
 */
export interface ServiceRetryConfig {
  attempts: number;
  delay: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  maxDelay?: number;
  retryCondition?: (error: any) => boolean;
}

/**
 * Service health check configuration
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
 * Service performance monitoring configuration
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
 * Service dependency configuration
 */
export interface ServiceDependencyConfig {
  serviceName: string;
  required: boolean;
  healthCheck?: boolean;
  timeout?: number;
  retries?: number;
}

/**
 * Base service configuration interface
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
 * Service lifecycle status
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
 * Service health status information
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
 * Service performance metrics
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
 * Generic service operation options
 */
export interface ServiceOperationOptions {
  timeout?: number;
  retries?: number;
  metadata?: Record<string, any>;
  trackMetrics?: boolean;
}

/**
 * Generic service operation response
 */
export interface ServiceOperationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
  metadata?: {
    duration: number;
    timestamp: Date;
    operationId: string;
  };
}

/**
 * Service event types for lifecycle and operations
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
 * Service event data
 */
export interface ServiceEvent {
  type: ServiceEventType;
  serviceName: string;
  timestamp: Date;
  data?: any;
  error?: Error;
}

/**
 * Core service interface that all services must implement
 */
export interface IService {
  // Basic properties
  readonly name: string;
  readonly type: string;
  readonly config: ServiceConfig;
  
  // Lifecycle management
  initialize(config?: Partial<ServiceConfig>): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): Promise<void>;
  
  // Status and health
  getStatus(): Promise<ServiceStatus>;
  getMetrics(): Promise<ServiceMetrics>;
  healthCheck(): Promise<boolean>;
  
  // Configuration management
  updateConfig(config: Partial<ServiceConfig>): Promise<void>;
  validateConfig(config: ServiceConfig): Promise<boolean>;
  
  // Operation management
  isReady(): boolean;
  getCapabilities(): string[];
  
  // Generic operation method for service-specific operations
  execute<T = any>(
    operation: string, 
    params?: any, 
    options?: ServiceOperationOptions
  ): Promise<ServiceOperationResponse<T>>;
  
  // Event handling
  on(event: ServiceEventType, handler: (event: ServiceEvent) => void): void;
  off(event: ServiceEventType, handler?: (event: ServiceEvent) => void): void;
  emit(event: ServiceEventType, data?: any, error?: Error): void;
  
  // Dependency management
  addDependency(dependency: ServiceDependencyConfig): Promise<void>;
  removeDependency(serviceName: string): Promise<void>;
  checkDependencies(): Promise<boolean>;
}

/**
 * Service factory interface for creating and managing service instances
 */
export interface IServiceFactory<TConfig extends ServiceConfig = ServiceConfig> {
  // Service creation
  create(config: TConfig): Promise<IService>;
  createMultiple(configs: TConfig[]): Promise<IService[]>;
  
  // Service management
  get(name: string): IService | undefined;
  list(): IService[];
  has(name: string): boolean;
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
 * Service registry interface for global service management
 */
export interface IServiceRegistry {
  // Factory registration
  registerFactory<T extends ServiceConfig>(
    type: string, 
    factory: IServiceFactory<T>
  ): void;
  getFactory<T extends ServiceConfig>(type: string): IServiceFactory<T> | undefined;
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
  on(event: 'service-registered' | 'service-unregistered' | 'service-status-changed', 
     handler: (serviceName: string, service?: IService) => void): void;
  off(event: string, handler?: Function): void;
}

/**
 * Service configuration validator interface
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
 * Service error types
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly serviceName: string,
    public readonly cause?: Error
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
      cause
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
      cause
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
      cause
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
      cause
    );
    this.name = 'ServiceOperationError';
  }
}

export class ServiceTimeoutError extends ServiceError {
  constructor(serviceName: string, operation: string, timeout: number, cause?: Error) {
    super(
      `Service operation timeout: ${serviceName}.${operation} (${timeout}ms)`, 
      'SERVICE_TIMEOUT_ERROR', 
      serviceName, 
      cause
    );
    this.name = 'ServiceTimeoutError';
  }
}

/**
 * Service capability definitions
 */
export interface ServiceCapability {
  name: string;
  version: string;
  description: string;
  parameters?: Record<string, any>;
  dependencies?: string[];
}

/**
 * Service capability registry
 */
export interface IServiceCapabilityRegistry {
  register(serviceName: string, capability: ServiceCapability): void;
  unregister(serviceName: string, capabilityName: string): void;
  getCapabilities(serviceName: string): ServiceCapability[];
  findServicesByCapability(capabilityName: string): string[];
  hasCapability(serviceName: string, capabilityName: string): boolean;
}