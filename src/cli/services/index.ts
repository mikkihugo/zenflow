/**
 * CLI Services Index
 *
 * This module re-exports all CLI services for convenient importing.
 * Provides business logic services for swarm operations, configuration, and templates.
 */

// Configuration management service
export {
  type ConfigBackupOptions,
  type ConfigManager,
  type ConfigMigrationResult,
  ConfigService,
  type ConfigValidationOptions,
} from './config-service';
// Swarm operations service
export {
  type SwarmAgent,
  type SwarmConfig,
  type SwarmMetrics,
  type SwarmOperationResult,
  SwarmService,
  type SwarmStatus,
  type SwarmTopology,
} from './swarm-service';

// Template operations service
export {
  type ProjectTemplate,
  type TemplateConfig,
  type TemplateContext,
  type TemplateEngine,
  type TemplateRenderResult,
  TemplateService,
  type TemplateVariable,
} from './template-service';

/**
 * Service registry for managing all CLI services
 */
export class ServiceRegistry {
  private services = new Map<string, any>();
  private initialized = false;

  /**
   * Register a service with the registry
   */
  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get a service from the registry
   */
  get<T>(name: string): T | undefined {
    return this.services.get(name) as T;
  }

  /**
   * Check if a service is registered
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Initialize all services
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize services in dependency order
    const services = Array.from(this.services.values());

    for (const service of services) {
      if (service && typeof service.init === 'function') {
        await service.init();
      }
    }

    this.initialized = true;
  }

  /**
   * Dispose all services
   */
  async dispose(): Promise<void> {
    const services = Array.from(this.services.values()).reverse();

    for (const service of services) {
      if (service && typeof service.dispose === 'function') {
        await service.dispose();
      }
    }

    this.services.clear();
    this.initialized = false;
  }

  /**
   * Get all registered service names
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Check if services are initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Default service registry instance
 */
export const serviceRegistry = new ServiceRegistry();

/**
 * Initialize default services
 */
export async function initializeServices(): Promise<void> {
  // Lazy import services to avoid circular dependencies
  const { SwarmService } = await import('./swarm-service.js');
  const { ConfigService } = await import('./config-service.js');
  const { TemplateService } = await import('./template-service.js');

  // Register default services
  serviceRegistry.register('swarm', new SwarmService());
  serviceRegistry.register('config', new ConfigService());
  serviceRegistry.register('template', new TemplateService());

  // Initialize all services
  await serviceRegistry.init();
}

/**
 * Get a service from the default registry
 */
export function getService<T>(name: string): T | undefined {
  return serviceRegistry.get<T>(name);
}

/**
 * Service factory functions for easy access
 */
export const Services = {
  /**
   * Get the swarm service
   */
  swarm(): SwarmService {
    const service = getService<SwarmService>('swarm');
    if (!service) {
      throw new Error('Swarm service not initialized');
    }
    return service;
  },

  /**
   * Get the config service
   */
  config(): ConfigService {
    const service = getService<ConfigService>('config');
    if (!service) {
      throw new Error('Config service not initialized');
    }
    return service;
  },

  /**
   * Get the template service
   */
  template(): TemplateService {
    const service = getService<TemplateService>('template');
    if (!service) {
      throw new Error('Template service not initialized');
    }
    return service;
  },
};

/**
 * Service health check
 */
export interface ServiceHealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  message?: string;
  lastCheck: Date;
  uptime?: number;
}

/**
 * Check health of all services
 */
export async function checkServiceHealth(): Promise<ServiceHealthCheck[]> {
  const results: ServiceHealthCheck[] = [];
  const serviceNames = serviceRegistry.getServiceNames();

  for (const name of serviceNames) {
    const service = serviceRegistry.get(name);
    let status: ServiceHealthCheck['status'] = 'unknown';
    let message: string | undefined;

    try {
      if (service && typeof service.healthCheck === 'function') {
        const health = await service.healthCheck();
        status = health.healthy ? 'healthy' : 'unhealthy';
        message = health.message;
      } else {
        status = 'healthy'; // Assume healthy if no health check
      }
    } catch (error) {
      status = 'unhealthy';
      message = (error as Error).message;
    }

    results.push({
      name,
      status,
      message,
      lastCheck: new Date(),
    });
  }

  return results;
}

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  /** Service name */
  name: string;

  /** Service configuration */
  config: Record<string, any>;

  /** Dependencies */
  dependencies?: string[];

  /** Auto-start service */
  autoStart?: boolean;

  /** Service priority (higher numbers start first) */
  priority?: number;
}

/**
 * Load services from configuration
 */
export async function loadServicesFromConfig(configs: ServiceConfig[]): Promise<void> {
  // Sort by priority
  const sortedConfigs = configs.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  for (const config of sortedConfigs) {
    try {
      // Dynamic service loading would go here
      // For now, we only support built-in services
      if (config.autoStart !== false) {
        switch (config.name) {
          case 'swarm':
            serviceRegistry.register('swarm', new SwarmService(config.config));
            break;
          case 'config':
            serviceRegistry.register('config', new ConfigService(config.config));
            break;
          case 'template':
            serviceRegistry.register('template', new TemplateService(config.config));
            break;
        }
      }
    } catch (error) {
      console.warn(`Failed to load service "${config.name}": ${(error as Error).message}`);
    }
  }

  await serviceRegistry.init();
}

/**
 * Service lifecycle hooks
 */
export interface ServiceLifecycleHooks {
  beforeInit?(service: any): Promise<void> | void;
  afterInit?(service: any): Promise<void> | void;
  beforeDispose?(service: any): Promise<void> | void;
  afterDispose?(service: any): Promise<void> | void;
}

/**
 * Add lifecycle hooks to the service registry
 */
export function addServiceHooks(hooks: ServiceLifecycleHooks): void {
  // Store hooks for later use during service lifecycle events
  (serviceRegistry as any)._hooks = hooks;
}
