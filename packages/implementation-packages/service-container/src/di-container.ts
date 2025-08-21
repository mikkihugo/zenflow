/**
 * @fileoverview Advanced Dependency Injection Container
 *
 * Comprehensive dependency injection implementation providing:
 * - Auto-discovery and registration
 * - Decorators and metadata-driven configuration
 * - Interceptors and middleware
 * - Module loading and service graphs
 * - Lifecycle management and scoping
 * - Health monitoring and performance tracking
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 */

import {
  createContainer,
  asClass,
  asFunction,
  asValue,
  AwilixContainer,
  Lifetime,
  InjectionMode,
  listModules,
  ListModulesOptions,
  BuildResolverOptions,
} from 'awilix';
import { EventEmitter } from 'node:events';
import { getLogger, type Logger } from '@claude-zen/foundation/logging';
import { Result, ok, err } from 'neverthrow';
import type { JsonObject, JsonValue, UnknownRecord, Constructor } from '@claude-zen/foundation/types';

/**
 * Resolution mode enum for dependency injection strategies
 */
export enum ResolutionMode {
  PROXY = 'PROXY',
  CLASSIC = 'CLASSIC'
}

/**
 * Service registration options with dependency injection features
 */
export interface ServiceRegistrationOptions<T = unknown> extends BuildResolverOptions<T> {
  /** Service lifetime management */
  lifetime?: 'transient' | 'singleton' | 'scoped';
  /** Injection mode for constructor/property injection */
  injectionMode?: 'PROXY' | 'CLASSIC';
  /** Resolution mode for dependency injection strategies */
  resolutionMode?: ResolutionMode;
  /** Service capabilities for discovery */
  capabilities?: string[];
  /** Service metadata for filtering */
  metadata?: Record<string, unknown>;
  /** Service health check function */
  healthCheck?: () => boolean | Promise<boolean>;
  /** Service interceptors */
  interceptors?: ServiceInterceptor[];
  /** Auto-discovery patterns */
  discoveryPattern?: string | string[];
  /** Service dependencies */
  dependencies?: string[];
  /** Service tags */
  tags?: string[];
  /** Service priority */
  priority?: number;
  /** Enable monitoring */
  enableMonitoring?: boolean;
}

/**
 * Service interceptor interface
 */
export interface ServiceInterceptor {
  name: string;
  intercept: (target: JsonObject, propertyName: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
}

/**
 * Service discovery result with metadata
 */
export interface DiscoveredService {
  name: string;
  service: unknown;
  metadata: ServiceRegistrationOptions;
  capabilities: string[];
  health: 'healthy' | 'unhealthy' | 'unknown';
  performance: {
    resolutionTime: number;
    lastAccessed: Date;
    accessCount: number;
  };
}

/**
 * Container health status
 */
export interface ContainerHealthStatus {
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  averageResolutionTime: number;
  memoryUsage: number;
  uptime: number;
  serviceGraph: {
    nodes: number;
    edges: number;
    cycles: string[];
  };
}

/**
 * Dependency injection container with comprehensive features
 */
export class DIContainer extends EventEmitter {
  private container: AwilixContainer;
  private serviceMetadata = new Map<string, ServiceRegistrationOptions>();
  private performanceMetrics = new Map<string, { resolveTime: number; lastAccessed: number; resolutionCount: number }>();
  private healthChecks = new Map<string, () => boolean | Promise<boolean>>();
  private interceptors = new Map<string, ServiceInterceptor[]>();
  private dependencyGraph = new Map<string, string[]>();
  private logger: Logger;
  private startTime = Date.now();

  constructor(
    name = 'di-container',
    options: {
      injectionMode?: 'PROXY' | 'CLASSIC';
      resolutionMode?: ResolutionMode;
      strict?: boolean;
    } = {},
  ) {
    super();
    this.logger = getLogger(`DIContainer:${name}`);

    // Create container with options
    this.container = createContainer({
      injectionMode: options.injectionMode || InjectionMode.PROXY,
      strict: options.strict ?? true,
    });

    this.logger.info(`✅ DI container created: ${name}`, {
      injectionMode: options.injectionMode || 'PROXY',
      resolutionMode: options.resolutionMode || ResolutionMode.PROXY,
      strict: options.strict ?? true,
    });
  }

  /**
   * Register a class with options
   */
  registerClass<T>(
    name: string,
    classConstructor: Constructor<T>,
    options: ServiceRegistrationOptions<T> = {},
  ): Result<void, Error> {
    try {
      // Register with library
      this.container.register({
        [name]: asClass(classConstructor, {
          lifetime: options.lifetime || Lifetime.SINGLETON,
          injectionMode: options.injectionMode,
          ...options,
        }),
      });

      // Store metadata
      this.serviceMetadata.set(name, options);

      // Store health check
      if (options.healthCheck) {
        this.healthChecks.set(name, options.healthCheck);
      }

      // Store interceptors
      if (options.interceptors) {
        this.interceptors.set(name, options.interceptors);
      }

      // Build dependency graph
      if (options.dependencies) {
        this.dependencyGraph.set(name, options.dependencies);
      }

      // Initialize performance tracking
      this.performanceMetrics.set(name, {
        resolutionTime: 0,
        lastAccessed: new Date(),
        accessCount: 0,
      });

      this.emit('serviceRegistered', { name, type: 'class', options });
      this.logger.debug(`📝 Class registered: ${name}`, {
        lifetime: options.lifetime,
        capabilities: options.capabilities,
      });

      return ok(undefined);
    } catch (error) {
      this.logger.error(`❌ Failed to register class ${name}:`, error);
      return err(error as Error);
    }
  }

  /**
   * Register a function with options
   */
  registerFunction<T>(
    name: string,
    func: (...args: JsonValue[]) => T,
    options: ServiceRegistrationOptions<T> = {},
  ): Result<void, Error> {
    try {
      this.container.register({
        [name]: asFunction(func, {
          lifetime: options.lifetime || Lifetime.SINGLETON,
          injectionMode: options.injectionMode,
          ...options,
        }),
      });

      this.serviceMetadata.set(name, options);
      if (options.healthCheck) {
        this.healthChecks.set(name, options.healthCheck);
      }

      this.performanceMetrics.set(name, {
        resolutionTime: 0,
        lastAccessed: new Date(),
        accessCount: 0,
      });

      this.emit('serviceRegistered', { name, type: 'function', options });
      this.logger.debug(`📝 Function registered: ${name}`);

      return ok(undefined);
    } catch (error) {
      this.logger.error(`❌ Failed to register function ${name}:`, error);
      return err(error as Error);
    }
  }

  /**
   * Register a value instance with options
   */
  registerInstance<T>(
    name: string,
    instance: T,
    options: ServiceRegistrationOptions<T> = {},
  ): Result<void, Error> {
    try {
      this.container.register({
        [name]: asValue(instance),
      });

      this.serviceMetadata.set(name, options);
      if (options.healthCheck) {
        this.healthChecks.set(name, options.healthCheck);
      }

      this.performanceMetrics.set(name, {
        resolutionTime: 0,
        lastAccessed: new Date(),
        accessCount: 0,
      });

      this.emit('serviceRegistered', { name, type: 'instance', options });
      this.logger.debug(`📝 Instance registered: ${name}`);

      return ok(undefined);
    } catch (error) {
      this.logger.error(`❌ Failed to register instance ${name}:`, error);
      return err(error as Error);
    }
  }

  /**
   * Auto-discover and register services from modules
   */
  async autoDiscoverServices(
    pattern: string | string[],
    options: ListModulesOptions = {},
  ): Promise<Result<string[], Error>> {
    try {
      this.logger.info('🔍 Auto-discovering services...', { pattern });

      const modules = listModules(pattern, {
        cwd: process.cwd(),
        ...options,
      });

      const registeredServices: string[] = [];

      for (const moduleInfo of modules) {
        try {
          const module = await import(moduleInfo.path);

          // Look for exported services with metadata
          for (const [exportName, exportValue] of Object.entries(module)) {
            if (this.isService(exportValue)) {
              const serviceName = exportName.toLowerCase().replace(/service$/, '');
              const metadata = this.extractServiceMetadata(exportValue);

              if (typeof exportValue === 'function') {
                this.registerClass(serviceName, exportValue as Constructor<JsonValue>, metadata);
                registeredServices.push(serviceName);
              } else {
                this.registerInstance(serviceName, exportValue, metadata);
                registeredServices.push(serviceName);
              }
            }
          }
        } catch (moduleError) {
          this.logger.warn(`⚠️ Failed to load module ${moduleInfo.path}:`, moduleError);
        }
      }

      this.logger.info(`✅ Auto-discovery completed: ${registeredServices.length} services`, registeredServices);
      return ok(registeredServices);
    } catch (error) {
      this.logger.error('❌ Auto-discovery failed:', error);
      return err(error as Error);
    }
  }

  /**
   * Resolve service with performance tracking
   */
  resolve<T>(name: string): Result<T, Error> {
    const startTime = process.hrtime.bigint();

    try {
      const service = this.container.resolve<T>(name);

      // Update performance metrics
      const endTime = process.hrtime.bigint();
      const resolutionTime = Number(endTime - startTime) / 1_000_000; // ms

      const metrics = this.performanceMetrics.get(name);
      if (metrics) {
        metrics.resolutionTime = resolutionTime;
        metrics.lastAccessed = new Date();
        metrics.accessCount++;
      }

      this.emit('serviceResolved', { name, resolutionTime });
      return ok(service);
    } catch (error) {
      this.logger.error(`❌ Failed to resolve service ${name}:`, error);
      return err(error as Error);
    }
  }

  /**
   * Advanced service discovery by capabilities
   */
  getServicesByCapability(capability: string): DiscoveredService[] {
    const results: DiscoveredService[] = [];

    for (const [name, metadata] of this.serviceMetadata.entries()) {
      if (metadata.capabilities?.includes(capability)) {
        const resolveResult = this.resolve(name);
        if (resolveResult.isOk()) {
          const performance = this.performanceMetrics.get(name) || {
            resolutionTime: 0,
            lastAccessed: new Date(),
            accessCount: 0,
          };

          results.push({
            name,
            service: resolveResult.value,
            metadata,
            capabilities: metadata.capabilities || [],
            health: 'healthy', // TODO: Implement health checking
            performance,
          });
        }
      }
    }

    return results.sort((a, b) => (b.metadata.priority || 0) - (a.metadata.priority || 0));
  }

  /**
   * Advanced service discovery by tags
   */
  getServicesByTag(tag: string): DiscoveredService[] {
    const results: DiscoveredService[] = [];

    for (const [name, metadata] of this.serviceMetadata.entries()) {
      if (metadata.tags?.includes(tag)) {
        const resolveResult = this.resolve(name);
        if (resolveResult.isOk()) {
          const performance = this.performanceMetrics.get(name) || {
            resolutionTime: 0,
            lastAccessed: new Date(),
            accessCount: 0,
          };

          results.push({
            name,
            service: resolveResult.value,
            metadata,
            capabilities: metadata.capabilities || [],
            health: 'healthy',
            performance,
          });
        }
      }
    }

    return results;
  }

  /**
   * Get comprehensive container health status
   */
  async getHealthStatus(): Promise<ContainerHealthStatus> {
    const services = Array.from(this.serviceMetadata.keys());
    let healthyServices = 0;
    let totalResolutionTime = 0;

    for (const serviceName of services) {
      const healthCheck = this.healthChecks.get(serviceName);
      if (healthCheck) {
        try {
          const isHealthy = await healthCheck();
          if (isHealthy) {
            healthyServices++;
          }
        } catch {
          // Service is unhealthy
        }
      } else {
        // No health check, assume healthy
        healthyServices++;
      }

      const metrics = this.performanceMetrics.get(serviceName);
      if (metrics) {
        totalResolutionTime += metrics.resolutionTime;
      }
    }

    // Analyze dependency graph for cycles
    const cycles = this.detectDependencyCycles();

    return {
      totalServices: services.length,
      healthyServices,
      unhealthyServices: services.length - healthyServices,
      averageResolutionTime: services.length > 0 ? totalResolutionTime / services.length : 0,
      memoryUsage: process.memoryUsage().heapUsed,
      uptime: Date.now() - this.startTime,
      serviceGraph: {
        nodes: services.length,
        edges: Array.from(this.dependencyGraph.values()).flat().length,
        cycles,
      },
    };
  }

  /**
   * Get service statistics
   */
  getStats() {
    const services = Array.from(this.serviceMetadata.keys());
    const capabilityCount = new Set(
      Array.from(this.serviceMetadata.values()).flatMap(m => m.capabilities || []),
    ).size;

    const lifetimeDistribution = Array.from(this.serviceMetadata.values()).reduce((acc, metadata) => {
      const lifetime = metadata.lifetime || Lifetime.SINGLETON;
      acc[lifetime] = (acc[lifetime] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalServices: services.length,
      enabledServices: services.length, // All registered services are considered enabled
      disabledServices: 0,
      capabilityCount,
      lifetimeDistribution,
      averageResolutionTime: Array.from(this.performanceMetrics.values())
        .reduce((sum, m) => sum + m.resolutionTime, 0) / services.length || 0,
    };
  }

  /**
   * Enable advanced service monitoring
   */
  startHealthMonitoring(intervalMs = 30000) {
    setInterval(async () => {
      const healthStatus = await this.getHealthStatus();
      this.emit('healthCheck', healthStatus);

      if (healthStatus.unhealthyServices > 0) {
        this.logger.warn(`⚠️ ${healthStatus.unhealthyServices} unhealthy services detected`);
      }
    }, intervalMs);

    this.logger.info(`✅ Health monitoring started (interval: ${intervalMs}ms)`);
  }

  /**
   * Dispose container and cleanup resources
   */
  async dispose() {
    this.logger.info('🔄 Disposing DI container...');

    // Clear all maps
    this.serviceMetadata.clear();
    this.performanceMetrics.clear();
    this.healthChecks.clear();
    this.interceptors.clear();
    this.dependencyGraph.clear();

    // Dispose container
    await this.container.dispose();

    this.emit('disposed');
    this.logger.info('✅ Container disposed successfully');
  }

  /**
   * Helper: Check if export is a service
   */
  private isService(exportValue: UnknownRecord): boolean {
    return typeof exportValue === 'function' ||
           (typeof exportValue === 'object' && exportValue !== null);
  }

  /**
   * Helper: Extract service metadata from export
   */
  private extractServiceMetadata(exportValue: UnknownRecord): ServiceRegistrationOptions {
    // Look for metadata on the export
    const metadata = (exportValue as UnknownRecord).__serviceMetadata || {};
    return {
      lifetime: metadata.lifetime || Lifetime.SINGLETON,
      capabilities: metadata.capabilities || [],
      tags: metadata.tags || [],
      priority: metadata.priority || 0,
      ...metadata,
    };
  }

  /**
   * Helper: Detect dependency cycles in service graph
   */
  private detectDependencyCycles(): string[] {
    const cycles: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        cycles.push(path.slice(cycleStart).join(' -> ') + ' -> ' + node);
        return;
      }

      if (visited.has(node)) {
        return;
      }

      visited.add(node);
      recursionStack.add(node);

      const dependencies = this.dependencyGraph.get(node) || [];
      for (const dep of dependencies) {
        dfs(dep, [...path, node]);
      }

      recursionStack.delete(node);
    };

    for (const node of this.dependencyGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }
}

/**
 * Factory function to create dependency injection container
 */
export function createDIContainer(
  name = 'di-container',
  options: {
    injectionMode?: InjectionMode;
    resolutionMode?: ResolutionMode;
    strict?: boolean;
  } = {},
): DIContainer {
  return new DIContainer(name, options);
}

/**
 * Service decorator for metadata-driven registration
 */
export function Service(options: ServiceRegistrationOptions = {}) {
  return function <T extends Constructor<JsonValue>>(constructor: T) {
    (constructor as UnknownRecord).__serviceMetadata = options;
    return constructor;
  };
}

/**
 * Capability decorator for service discovery
 */
export function Capability(...capabilities: string[]) {
  return function <T extends Constructor<JsonValue>>(constructor: T) {
    const existing = (constructor as UnknownRecord).__serviceMetadata || {};
    (constructor as UnknownRecord).__serviceMetadata = {
      ...existing,
      capabilities: [...(existing.capabilities || []), ...capabilities],
    };
    return constructor;
  };
}

/**
 * Tag decorator for advanced service categorization
 */
export function Tag(...tags: string[]) {
  return function <T extends Constructor<JsonValue>>(constructor: T) {
    const existing = (constructor as UnknownRecord).__serviceMetadata || {};
    (constructor as UnknownRecord).__serviceMetadata = {
      ...existing,
      tags: [...(existing.tags || []), ...tags],
    };
    return constructor;
  };
}

// Export library types and constants for external use
export {
  Lifetime,
  InjectionMode,
  asClass,
  asFunction,
  asValue,
};