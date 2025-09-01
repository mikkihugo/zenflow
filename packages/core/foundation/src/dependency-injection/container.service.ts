/**
 * @fileoverview Dependency Injection Container Service
 *
 * Professional DI container with event support, auto-discovery, and health monitoring.
 * Uses awilix-compatible patterns with comprehensive service lifecycle management.
 *
 * @example Basic Usage
 * '''typescript'
 * import { createContainer} from './container.service';
 *
 * const container = createContainer();
 *
 * // Register services
 * container.register('userService', UserService);
 * container.registerFunction('dbConnection', () => createDbConnection());
 * container.registerInstance('config', configInstance);
 *
 * // Resolve services
 * const userService = container.resolve<UserService>('userService');
 * '
 */

/**
 * Information about a registered service in the dependency injection container.
 * Contains metadata for service discovery, monitoring, and debugging.
 *
 * @interface ServiceInfo
 */
export interface ServiceInfo {
  name: string;
  type: 'class' | 'factory' | 'instance' | 'singleton' | 'async-factory';
  capabilities: string[];
  tags: string[];
  registeredAt: number;
}

/**
 * Options for automatic service discovery in the filesystem.
 * Configures how services are found and registered automatically.
 *
 * @interface ServiceDiscoveryOptions
 *
 * @example
 * '''typescript'
 * const options:ServiceDiscoveryOptions = {
 *   recursive:true,
 *   extensions:['.service.ts',    '.provider.ts'],
 *   ignore:['node_modules',    'dist']
 *};
 * '
 */
export interface ServiceDiscoveryOptions {
  recursive?: boolean;
  includeTests?: boolean;
  extensions?: string[];
  cwd?: string;
  ignore?: string[];
}

/**
 * Statistics about the container health and performance.
 * Used for monitoring and debugging dependency injection operations.
 *
 * @interface ContainerStats
 */
export interface ContainerStats {
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  lastHealthCheck: number;
}

/**
 * Professional dependency injection container interface.
 * Provides type-safe service registration, resolution, and lifecycle management.
 * Extends event emitter for reactive service monitoring.
 *
 * @interface Container
 * @extends EventEmitter
 *
 * @example
 * '''typescript'
 * const container = createContainer();
 *
 * // Register different types of services
 * container.register('userService', UserService);
 * container.registerFunction('dbConnection', () => createConnection());
 * container.registerInstance('config', configObject);
 *
 * // Resolve services with type safety
 * const userService = container.resolve<UserService>('userService');
 * '
 */
export interface Container {
  // Event emitter methods
  on(event: string, listener: (...args: unknown[]) => void): this;
  emit(event: string, ...args: unknown[]): boolean;
  off(event: string, listener: (...args: unknown[]) => void): this;

  // Core registration methods
  register<T>(
    token: string,
    implementation: new (...args: unknown[]) => T,
    options?: { capabilities?: string[]; tags?: string[] }
  ): void;
  registerFunction<T>(
    token: string,
    factory: () => T,
    options?: { capabilities?: string[]; tags?: string[] }
  ): void;
  registerInstance<T>(
    token: string,
    instance: T,
    options?: { capabilities?: string[]; tags?: string[] }
  ): void;

  // New reasonable DI features
  registerSingleton<T>(
    token: string,
    factory: (() => T) | (new (...args: unknown[]) => T),
    options?: { capabilities?: string[]; tags?: string[] }
  ): void;
  registerAsyncFactory<T>(
    token: string,
    factory: () => Promise<T>,
    options?: { capabilities?: string[]; tags?: string[] }
  ): void;
  registerConditional<T>(
    token: string,
    factory: (() => T) | (new (...args: unknown[]) => T),
    condition: () => boolean,
    options?: { capabilities?: string[]; tags?: string[] }
  ): void;

  // Resolution methods
  resolve<T>(token: string): T;
  resolveAsync<T>(token: string): Promise<T>;
  resolveAll<T>(tags: string[]): T[];

  // Service discovery
  has(token: string): boolean;
  getServicesByTags(tags: string[]): string[];
  getServicesByCapabilities(capabilities: string[]): string[];
  getServiceMetadata(token: string): ServiceInfo | undefined;
  listServices(): string[];

  // Lifecycle management
  dispose(): Promise<void>;

  // Advanced features (existing)
  autoDiscoverServices(
    patterns: string[],
    options: ServiceDiscoveryOptions
  ): Promise<ServiceInfo[]>;
  startHealthMonitoring(interval: number): void;
  getStats(): ContainerStats;
  getServicesByCapability?(capability: string): ServiceInfo[];
  getServicesByTag?(tag: string): ServiceInfo[];
  getHealthStatus?(): {
    status: string;
    serviceCount: number;
    timestamp: number;
    uptime: number;
  };
  getName?(): string;
}

/**
 * Creates a new dependency injection container with full service lifecycle management.
 * Provides registration, resolution, health monitoring, and service discovery.
 *
 * @returns A fully configured DI container instance
 *
 * @example
 * '''typescript'
 * const container = createContainer();
 *
 * // Register services
 * container.register('logger', Logger, { capabilities:[' logging'], tags:[' core']});
 *
 * // Start health monitoring
 * container.startHealthMonitoring(5000);
 *
 * // Listen to events
 * container.on('serviceRegistered', (event) => {
 *   logger.info(`Service ${event.name} registered`
 *});
 * '
 */
import { ContainerImpl } from './container-impl.js';

export const createContainer = (): Container => new ContainerImpl();

// Service tokens for common services
export const TOKENS = {
  logger: 'logger',
  config: 'config',
  database: 'database',
};

// STRATEGIC FORCING EXPORTS - Guide developers to industry-standard patterns
// These remain because they teach correct patterns and prevent bad habits

// Keep 'inject' as it teaches the injection pattern concept
export const inject = createContainer;

// Export a default container instance for convenience
export const container = createContainer();
