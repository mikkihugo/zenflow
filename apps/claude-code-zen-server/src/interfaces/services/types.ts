/**
 * @file USL (Unified Service Layer) Types and Configuration.
 *
 * Centralized type definitions and configuration schemas for all service types
 * in the Claude-Zen ecosystem.
 */

import type { ServiceOperationOptions } from './core/interfaces';

/**
 * Service type enumeration for all supported service categories.
 */
export enum ServiceType {
  // Data Services
  DATA = 'data',
  WEB_DATA = 'web-data',
  DOCUMENT = 'document',
  // Coordina'ion Services
  COORDINATION = 'coordination',
  SWARM = 'swarm',
  ORCHESTRATION = 'orchestration',
  DAA = 'daa',
  // D'ta Accessibility and Analysis
  SESSION_RECOVERY = 'session-recovery',
  ARCHITECTURE_STORAGE = 'architecture-storage',
  // Int'rface Services
  API = 'api',
  SAFE_API = 'safe-api',
  WEB = 'web',
  MCP = 'mcp',
  CLI = 'cli',
  // Neural Serv'ces
  NEURAL = 'neural',
  LEARNING = 'learning',
  PATTERN_RECOGNITION = 'pattern-recognition',
  // Memory Services
  MEMORY = 'memory',
  CACHE = 'cache',
  SESSION = 'session',
  // Database Services
  DATABASE = 'database',
  VECTOR = 'vector',
  GRAPH = 'graph',
  // System Services
  INFRASTRUCTURE = 'infrastructure',
  SYSTEM = 'system',
  HEALTH = 'health',
  MONITORING = 'monitoring',
  LOGGING = 'logging',
  SECURITY = 'security',
  // Workflow Services
  WORKFLOW = 'workflow',
  TASK = 'task',
  PIPELINE = 'pipeline',
  // Communication S'rvices
  WEBSOCKET = 'websocket',
  MESSAGE_QUEUE = 'message-queue',
  EVENT_BUS = 'event-bus',
  // Cu'tom service type
  CUSTOM = 'custom'

}

/**
 * Service status enu'eration
 */
export enum ServiceStatus {
  CREATED = 'created',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error'

}

/**
 * Se'vice dependency specification
 */
export interface ServiceDependency {
  serviceName: string;
  required: boolean;
  version?: string;
  startupOrder?: number

}

/**
 * Service metrics for monitoring and health checks
 */
export interface ServiceMetrics {
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage?: number;
  customMetrics?: Record<string,
  number | string>

}

/**
 * Service health information
 */
export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string,
  boolean>;
  metrics: ServiceMetrics;
  lastCheck: Date;
  details?: Record<string,
  any>

}

/**
 * Service creation request
 */
export interface ServiceRequest {
  name: string;
  type: ServiceType;
  config?: Record<string,
  unknown>;
  dependencies?: ServiceDependency[];
  metadata?: Record<string,
  any>

}

/**
 * Batch service request for multiple services
 */
export interface BatchServiceRequest {
  services: ServiceRequest[];
  parallel: boolean;
  startImmediately: boolean;
  dependencyResolution?: boolean;
  timeout?: number

}

/**
 * Service operation result
 */
export interface ServiceOperationResult {
  success: boolean;
  serviceName: string;
  operation: string;
  timestamp: Date;
  duration?: number;
  error?: string;
  metadata?: Record<string,
  any>

}

/**
 * Batch service operation result
 */
export interface BatchServiceOperationResult {
  overall: 'success' | 'partial' | 'failure';
  results: ServiceOperationResult[];
  summary: {
  total: number;
  successful: number;
  failed: number;
  duration: number

}
}

/**
 * Service manager configuration
 */
export interface ServiceManagerConfig {
  factory: {
  maxConcurrentInits: number;
  enableDependencyResolution: boolean;
  defaultTimeout: number;
  enableHealthChecks: boolean

};
  lifecycle: {
  startupTimeout: number;
    shutdownTimeout: number;
    parallelStartup: boolean;
    dependencyResolution: boolean;
    gracefulShutdown: boolean

};
  monitoring: {
    healthCheckInterval: number;
    metricsCollectionInterval: number;
    performanceThresholds: {
  responseTime: number;
      errorRate: number;
      memoryUsage: number

};
    alerting: {
  enabled: boolean;
  channels: string[]
}
};
  recovery: {
  enabled: boolean;
    maxRetries: number;
    strategy: 'linear' | 'exponential';
    backoffDelay: number;
    circuitBreakerThreshold: number

}
}

/**
 * Service configuration schema
 */
export interface ServiceConfigSchema {
  type: ServiceType;
  required: string[];
  optional: string[];
  defaults: Record<string,
  any>;
  validators?: Record<string,
  (value: any) => boolean>

}

/**
 * Service registry entry
 */
export interface ServiceRegistryEntry {
  name: string;
  type: ServiceType;
  status: ServiceStatus;
  instance: any;
  // The actual service instance
  config: Record<string, unknown>;
  dependencies: ServiceDependency[];
  health: ServiceHealth;
  metadata: {
  createdAt: Date;
  lastStarted?: Date;
  lastStopped?: Date;
  version?: string;
  description?: string

}
}

/**
 * Service factory configuration
 */
export interface ServiceFactoryConfig {
  enableValidation: boolean;
  enableDependencyInjection: boolean;
  enableAspectOrientedProgramming: boolean;
  enableMetrics: boolean;
  enableHealthChecks: boolean;
  defaultServiceConfig: Record<string,
  any>

}

/**
 * Service adapter interface for different service implementations
 */
export interface ServiceAdapter<T = any> {
  name: string;
  type: ServiceType;
  status: ServiceStatus;
  config: Record<string,
  unknown>;

  // Lifecycle methods
  initialize(options?: ServiceOperationOptions): Promise<void>;
  start(options?: ServiceOperationOptions): Promise<void>;
  stop(options?: ServiceOperationOptions): Promise<void>;
  restart(options?: ServiceOperationOptions): Promise<void>;

  // Health and monitoring
  getHealth(): Promise<ServiceHealth>;
  getMetrics(): Promise<ServiceMetrics>;

  // Configuration
  updateConfig(config: Partial<Record<string,
  unknown>>): Promise<void>;
  getConfig(): Record<string,
  unknown>;

  // Service-specific functionality
  getInstance(): T;

  // Event handling
  on?(event: string,
  handler: (...args: any[]) => void): void;
  off?(event: string,
  handler: (...args: any[]) => void): void;
  emit?(event: string,
  ...args: any[]): void

}

/**
 * Service validation result
 */
export interface ServiceValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
  message: string;
  code: string
}>;
  warnings: Array<{
  field: string;
    message: string;
    code: string

}>
}

/**
 * Service event types
 */
export type ServiceEventType =
  | 'created'
  | 'initialized'
  | 'starting'
  | 'started'
  | 'stopping'
  | 'stopped'
  | 'error'
  | 'health-check'
  | 'config-updated'
  | 'dependency-resolved'
  | 'metrics-collected';

/**
 * Service event payload
 */
export interface ServiceEvent<T = any> {
  type: ServiceEventType;
  serviceName: string;
  serviceType: ServiceType;
  timestamp: Date;
  payload?: T;
  metadata?: Record<string,
  any>

}

/**
 * Service discovery configuration
 */
export interface ServiceDiscoveryConfig {
  enabled: boolean;
  provider: 'local' | 'consul' | 'etcd' | 'kubernetes';
  endpoint?: string;
  namespace?: string;
  healthCheckPath?: string;
  tags?: string[]

}

/**
 * Service scaling configuration
 */
export interface ServiceScalingConfig {
  enabled: boolean;
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number

}

/**
 * Service security configuration
 */
export interface ServiceSecurityConfig {
  authentication: {
  enabled: boolean;
  provider: 'jwt' | 'oauth' | 'basic' | 'custom';
  config: Record<string,
  any>

};
  authorization: {
  enabled: boolean;
    provider: 'rbac' | 'abac' | 'custom';
    config: Record<string,
  any>

};
  encryption: {
  enabled: boolean;
    algorithm: string;
    keyRotationInterval?: number

};
  rateLimit: {
  enabled: boolean;
    windowMs: number;
    maxRequests: number

}
}

/**
 * Service network configuration
 */
export interface ServiceNetworkConfig {
  host?: string;
  port?: number;
  protocol?: 'http' | 'https' | 'tcp' | 'udp';
  ssl?: {
    enabled: boolean;
  cert?: string;
  key?: string
};
  proxy?: {
  enabled: boolean;
    target: string;
    pathRewrite?: Record<string,
  string>

};
  cors?: {
  enabled: boolean;
    origin: string | string[];
    methods: string[];
    headers: string[]

}
}

/**
 * Comprehensive service configuration
 */
export interface ComprehensiveServiceConfig {
  name: string;
  type: ServiceType;
  description?: string;
  version?: string;
  // Core configuration
  core: Record<string, any>;
  // Optional configurations
  discovery?: ServiceDiscoveryConfig;
  scaling?: ServiceScalingConfig;
  security?: ServiceSecurityConfig;
  network?: ServiceNetworkConfig;
  // Dependencies and relationships
  dependencies?: ServiceDependency[];
  // Environment-specific overrides
  environment?: {
  development?: Partial<ComprehensiveServiceConfig>;
  staging?: Partial<ComprehensiveServiceConfig>;
  production?: Partial<ComprehensiveServiceConfig>

}
}

/**
 * Service template for creating services with predefined configurations
 */
export interface ServiceTemplate {
  name: string;
  description: string;
  serviceType: ServiceType;
  configTemplate: ComprehensiveServiceConfig;
  variables?: Array<{
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  required: boolean;
  default?: any

}>
}

/**
 * Service blueprint for complex service compositions
 */
export interface ServiceBlueprint {
  name: string;
  description: string;
  version: string;
  services: Array<{
  template: string;
  config: Record<string,
  any>;
  dependencies?: string[]

}>;
  workflow?: Array<{
  step: string;
    services: string[];
    parallel: boolean;
    condition?: string

}>
}

// ============================================
// Type Guards and Utilities
// ============================================

/**
 * Type guard to check if an object is a ServiceRequest
 */
export function isServiceRequest(obj: any): obj is ServiceRequest  {
  return obj &&
    typeof obj.name === 'string' &&
    Object.values(ServiceType).includes(obj.type)

}

/**
 * Type 'uard to check if an object is a ServiceHealth
 */
export function isServiceHealth(obj: any): obj is ServiceHealth  {
  return obj &&
    ['healthy',
  'degraded',
  'unhealthy].includes(obj.status) &&
    obj.checks &&
    obj.metrics &&
    obj.lastCheck instanceof Date

}

/**
 * T'pe guard to check if an object is a ServiceAdapter
 */
export function isServiceAdapter(obj: any): obj is ServiceAdapter  {
  return obj &&
    typeof obj.name === 'string' &&
    Object.values(ServiceType).includes(obj.type) &&
    Object.values(ServiceStatus).includes(obj.status) &&
    typeof obj.initialize === 'function' &&
    typeof obj.start === 'function' &&
    typeof obj.stop === 'function;

}

// ============================================
// Utility Types
// ============================================

/**
 * Extract service names from a service registry
 */
export type ServiceNames<T extends Record<string, ServiceRegistryEntry>> = keyof T;

/**
 * Extract service types from a service registry
 */
export type ServiceTypes<T extends Record<string, ServiceRegistryEntry>> =
  T[keyof T]['type]';

/**
 * Service configuration for a specific service type
 */
export type ServiceConfigFor<T extends ServiceType> =
  T extends ServiceType.DATABASE ? DatabaseServiceConfig :
  T extends ServiceType.WEB ? WebServiceConfig :
  T extends ServiceType.API ? ApiServiceConfig :
  Record<string, any>;

// Specific service configuration interfaces
export interface DatabaseServiceConfig {
  connectionString: string;
  poolSize: number;
  timeout: number;
  ssl: boolean

}

export interface WebServiceConfig {
  port: number;
  host: string;
  staticPath?: string;
  cors?: boolean

}

export interface ApiServiceConfig {
  basePath: string;
  version: string;
  authentication: boolean;
  rateLimit: boolean

}

// ============================================
// Constants and Defaults
// ============================================

/**
 * Default service manager configuration
 */
export const DEFAULT_SERVICE_MANAGER_CONFIG: ServiceManagerConfig = {
  factory: {
  maxConcurrentInits: 5,
  enableDependencyResolution: true,
  defaultTimeout: 30000,
  enableHealthChecks: true

},
  lifecycle: {
  startupTimeout: 60000,
  shutdownTimeout: 30000,
  parallelStartup: true,
  dependencyResolution: true,
  gracefulShutdown: true

},
  monitoring: {
    healthCheckInterval: 30000,
    metricsCollectionInterval: 10000,
    performanceThresholds: {
  responseTime: 1000,
  errorRate: 0.05,
  memoryUsage: 0.8

},
    alerting: {
  enabled: false,
  channels: []

}
},
  recovery: {
  enabled: true,
  maxRetries: 3,
  strategy: 'exponential',
  backoffDeay: 1000,
  circuitBreakerThreshold: 5

}
};

/**
 * Service type categories for organizing services
 */
export const SERVICE_TYPE_CATEGORIES = {
  DATA: [ServiceType.DATA,
  ServiceType.WEB_DATA,
  ServiceType.DOCUMENT,
  ServiceType.DATABASE,
  ServiceType.VECTOR,
  ServiceType.GRAPH],
  COORDINATION: [ServiceType.COORDINATION,
  ServiceType.SWARM,
  ServiceType.ORCHESTRATION,
  ServiceType.DAA],
  INTERFACE: [ServiceType.API,
  ServiceType.SAFE_API,
  ServiceType.WEB,
  ServiceType.MCP,
  ServiceType.CLI],
  NEURAL: [ServiceType.NEURAL,
  ServiceType.LEARNING,
  ServiceType.PATTERN_RECOGNITION],
  MEMORY: [ServiceType.MEMORY,
  ServiceType.CACHE,
  ServiceType.SESSION],
  SYSTEM: [ServiceType.INFRASTRUCTURE,
  ServiceType.SYSTEM,
  ServiceType.HEALTH,
  ServiceType.MONITORING,
  ServiceType.LOGGING,
  ServiceType.SECURITY],
  WORKFLOW: [ServiceType.WORKFLOW,
  ServiceType.TASK,
  ServiceType.PIPELINE],
  COMMUNICATION: [ServiceType.WEBSOCKET,
  ServiceType.MESSAGE_QUEUE,
  ServiceType.EVENT_BUS]

} as const;

/**
 * Priority levels for service startup ordering
 */
export enum ServicePriority {
  CRITICAL = 'critical',
  // Must start first(
  e.g.,
  database,
  'ogging
)
  HIGH = 'high',
  // Important services(
  e.g.,
  aut'entication,
  cache
)
  MEDIUM = 'medium',
  // Standard services (e.g.,
  API endpoints)
  LOW = 'low'              // Optional services (e.g.,
  background tasks)

}

/**
 * Service startup phases for coordinated initialization
 */
export enum ServiceStartupPhase {
  FOUNDATION = 'foundation',
  // Core i'frastructure services
  PLATFORM = 'platform',
  // Platfor' services
  APPLICATION = 'application',
  // Applicatio' services
  INTEGRATION = 'integration',
  // I'tegration services
  OPTIMIZATION = 'optimization'  // Performa'ce and monitoring services

}

// Export all types and utilities
export type {
  ServiceOperationOptions,
  ServiceRegistryEntry,
  ServiceAdapter,
  ServiceEvent,
  ServiceValidationResult,
  ServiceTemplate,
  ServiceBlueprint,
  ComprehensiveServiceConfig,
  ServiceDiscoveryConfig,
  ServiceScalingConfig,
  ServiceSecurityConfig,
  ServiceNetworkConfig

};