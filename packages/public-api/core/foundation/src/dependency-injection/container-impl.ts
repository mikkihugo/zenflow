/**
 * Container implementation class - extracted for complexity reduction
 */

import type { Container, ServiceInfo, ContainerStats, ServiceDiscoveryOptions } from './container.types';

export class ContainerImpl implements Container {
  private services = new Map<string, unknown>();
  private serviceMetadata = new Map<string, ServiceInfo>();
  private singletonCache = new Map<string, unknown>();
  private disposableServices = new Set<{ dispose(): void | Promise<void> }>();
  private eventListeners = new Map<string, Set<(...args: unknown[]) => void>>();

  // Event methods
  on(event: string, listener: (...args: unknown[]) => void) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
    return this;
  }

  emit(event: string, ...args: unknown[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(...args);
        } catch { /* ignore */ }
      }
      return true;
    }
    return false;
  }

  off(event: string, listener: (...args: unknown[]) => void) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
    return this;
  }

  register<T>(
    token: string,
    implementation: new (...args: unknown[]) => T,
    options: { capabilities?: string[], tags?: string[], singleton?: boolean } = {},
  ): void {
    this.services.set(token, implementation);
    this.serviceMetadata.set(token, {
      name: token,
      type: 'class',
      capabilities: options.capabilities || [],
      tags: options.tags || [],
      singleton: options.singleton === true,
      registeredAt: Date.now(),
    });
    this.emit('serviceRegistered', { token, type: 'class' });
  }

  registerFunction<T>(
    token: string,
    factory: () => T,
    options: { capabilities?: string[], tags?: string[], singleton?: boolean } = {},
  ): void {
    this.services.set(token, factory);
    this.serviceMetadata.set(token, {
      name: token,
      type: 'function',
      capabilities: options.capabilities || [],
      tags: options.tags || [],
      singleton: options.singleton === true,
      registeredAt: Date.now(),
    });
    this.emit('serviceRegistered', { token, type: 'function' });
  }

  registerValue<T>(
    token: string,
    value: T,
    options: { capabilities?: string[], tags?: string[] } = {},
  ): void {
    this.services.set(token, value);
    this.serviceMetadata.set(token, {
      name: token,
      type: 'instance',
      capabilities: options.capabilities || [],
      tags: options.tags || [],
      singleton: true,
      registeredAt: Date.now(),
    });
    this.emit('serviceRegistered', { token, type: 'instance' });
  }

  registerInstance<T>(
    token: string,
    instance: T,
    options: { capabilities?: string[], tags?: string[] } = {},
  ): void {
    this.registerValue(token, instance, options);
  }

  registerSingleton<T>(
    token: string,
    factory: (() => T) | (new (...args: unknown[]) => T),
    options: { capabilities?: string[], tags?: string[] } = {},
  ): void {
    if (typeof factory === 'function' && factory.prototype) {
      this.register(token, factory as new (...args: unknown[]) => T, { ...options, singleton: true });
    } else {
      this.registerFunction(token, factory as () => T, { ...options, singleton: true });
    }
  }

  registerAsyncFactory<T>(
    token: string,
    factory: () => Promise<T>,
    options: { capabilities?: string[], tags?: string[] } = {},
  ): void {
    this.services.set(token, factory);
    this.serviceMetadata.set(token, {
      name: token,
      type: 'async-factory',
      capabilities: options.capabilities || [],
      tags: options.tags || [],
      singleton: true,
      registeredAt: Date.now(),
    });
    this.emit('serviceRegistered', { token, type: 'async-factory' });
  }

  async resolveAsync<T>(token: string): Promise<T> {
    const metadata = this.serviceMetadata.get(token);
    if (!metadata) {
      throw new Error(`Service '${token}' is not registered`);
    }

    if (metadata.singleton && this.singletonCache.has(token)) {
      return this.singletonCache.get(token) as T;
    }

    if (metadata.type === 'async-factory') {
      const factory = this.services.get(token) as () => Promise<T>;
      const instance = await factory();
      
      if (metadata.singleton) {
        this.singletonCache.set(token, instance);
      }
      
      this.emit('serviceResolved', { token, type: metadata.type });
      return instance;
    }

    // Fallback to sync resolution
    return this.resolve<T>(token);
  }

  resolve<T>(token: string): T {
    const metadata = this.serviceMetadata.get(token);
    if (!metadata) {
      throw new Error(`Service '${token}' is not registered`);
    }

    if (metadata.singleton && this.singletonCache.has(token)) {
      return this.singletonCache.get(token) as T;
    }

    const serviceDefinition = this.services.get(token);
    if (!serviceDefinition) {
      throw new Error(`Service definition for '${token}' not found`);
    }

    const instance = this.createServiceInstance<T>(serviceDefinition, metadata, token);
    this.handleServiceInstance(instance, metadata, token);
    return instance;
  }

  private createServiceInstance<T>(serviceDefinition: unknown, metadata: ServiceInfo, token: string): T {
    try {
      switch (metadata.type) {
        case 'class': {
          const ServiceClass = serviceDefinition as new (...args: unknown[]) => T;
          return new ServiceClass();
        }
        case 'function':
        case 'factory': {
          const factory = serviceDefinition as () => T;
          return factory();
        }
        case 'instance':
        case 'singleton':
          return serviceDefinition as T;
        default:
          throw new Error(`Unknown service type '${metadata.type}' for '${token}'`);
      }
    } catch (error) {
      const message = `Failed to resolve service '${token}': ${error instanceof Error ? error.message : String(error)}`;
      this.emit('serviceResolutionFailed', { token, error: message });
      throw new Error(message);
    }
  }

  private handleServiceInstance<T>(instance: T, metadata: ServiceInfo, token: string): void {
    if (metadata.singleton) {
      this.singletonCache.set(token, instance);
    }

    if (instance && typeof (instance as { dispose?: () => void | Promise<void> }).dispose === 'function') {
      this.disposableServices.add(instance as { dispose(): void | Promise<void> });
    }

    this.emit('serviceResolved', { token, type: metadata.type });
  }

  has(token: string): boolean {
    return this.services.has(token);
  }

  unregister(token: string): boolean {
    if (!this.services.has(token)) {
      return false;
    }

    this.services.delete(token);
    this.serviceMetadata.delete(token);
    this.singletonCache.delete(token);
    this.emit('serviceUnregistered', { token });
    return true;
  }

  clear(): void {
    this.services.clear();
    this.serviceMetadata.clear();
    this.singletonCache.clear();
    this.disposableServices.clear();
    this.emit('containerCleared');
  }

  getServicesByTags(tags: string[]): string[] {
    const matchingServices: string[] = [];
    for (const [token, metadata] of this.serviceMetadata) {
      const hasAllTags = tags.every(tag => metadata.tags.includes(tag));
      if (hasAllTags) {
        matchingServices.push(token);
      }
    }
    return matchingServices;
  }

  getServicesByCapabilities(capabilities: string[]): string[] {
    const matchingServices: string[] = [];
    for (const [token, metadata] of this.serviceMetadata) {
      const hasAllCapabilities = capabilities.every(cap => metadata.capabilities.includes(cap));
      if (hasAllCapabilities) {
        matchingServices.push(token);
      }
    }
    return matchingServices;
  }

  resolveAll<T>(tags: string[]): T[] {
    const serviceTokens = this.getServicesByTags(tags);
    return serviceTokens.map(token => this.resolve<T>(token));
  }

  registerConditional<T>(
    token: string,
    factory: (() => T) | (new (...args: unknown[]) => T),
    condition: () => boolean,
    options?: { capabilities?: string[], tags?: string[] },
  ): void {
    if (condition()) {
      if (typeof factory === 'function' && factory.prototype) {
        this.register(token, factory as new (...args: unknown[]) => T, options);
      } else {
        this.registerFunction(token, factory as () => T, options);
      }
    }
  }

  async dispose(): Promise<void> {
    const disposePromises: Promise<void>[] = [];

    for (const service of this.disposableServices) {
      try {
        const result = service.dispose();
        if (result instanceof Promise) {
          disposePromises.push(result);
        }
      } catch { /* ignore disposal errors */ }
    }

    await Promise.all(disposePromises);
    this.clear();
    this.emit('containerDisposed', { timestamp: Date.now() });
  }

  getServiceMetadata(token: string): ServiceInfo | undefined {
    return this.serviceMetadata.get(token);
  }

  listServices(): string[] {
    return Array.from(this.services.keys());
  }

  autoDiscoverServices(patterns: string[], options: ServiceDiscoveryOptions = {}): Promise<ServiceInfo[]> {
    const discoveredServices: ServiceInfo[] = [];
    void options; // Use options parameter

    for (const pattern of patterns) {
      if (pattern.includes('service')) {
        discoveredServices.push({
          name: pattern,
          type: 'class',
          capabilities: [],
          tags: ['discovered'],
          registeredAt: Date.now(),
        });
      }
    }

    this.emit('servicesDiscovered', {
      count: discoveredServices.length,
      timestamp: Date.now(),
    });

    return Promise.resolve(discoveredServices);
  }

  startHealthMonitoring(interval: number): void {
    setInterval(() => {
      this.emit('healthCheck', {
        servicesCount: this.services.size,
        timestamp: Date.now(),
      });
    }, interval);
  }

  getStats(): ContainerStats {
    return {
      totalServices: this.services.size,
      healthyServices: this.services.size,
      unhealthyServices: 0,
      lastHealthCheck: Date.now(),
    };
  }

  getServicesByCapability(capability: string): ServiceInfo[] {
    const matchingServices: ServiceInfo[] = [];
    for (const [serviceToken, metadata] of this.serviceMetadata.entries()) {
      if (metadata.capabilities && metadata.capabilities.includes(capability)) {
        const logger = require('../core/logging').getLogger('foundation:service-discovery');
        logger.debug(`Service ${serviceToken} provides capability: ${capability}`);
        matchingServices.push(metadata);
      }
    }
    return matchingServices;
  }

  getServicesByTag(tag: string): ServiceInfo[] {
    const matchingServices: ServiceInfo[] = [];
    for (const [serviceToken, metadata] of this.serviceMetadata.entries()) {
      if (metadata.tags && metadata.tags.includes(tag)) {
        const logger = require('../core/logging').getLogger('foundation:service-discovery');
        logger.debug(`Service ${serviceToken} has tag: ${tag}`);
        matchingServices.push(metadata);
      }
    }
    return matchingServices;
  }

  getHealthStatus() {
    return {
      status: 'healthy',
      serviceCount: this.services.size,
      timestamp: Date.now(),
      uptime: Date.now(),
    };
  }

  getName(): string {
    return 'ServiceContainer';
  }
}