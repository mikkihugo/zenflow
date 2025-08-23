/**
 * @fileoverview Client Registry - ServiceContainer-based implementation
 *
 * Production-grade client registry using battle-tested ServiceContainer (Awilix) backend.
 * Provides comprehensive client management with enhanced capabilities including
 * health monitoring, service discovery, and metrics collection.
 *
 * Key Features:
 * - Battle-tested Awilix dependency injection
 * - Health monitoring and metrics collection
 * - Service discovery and capability-based queries
 * - Type-safe registration with lifecycle management
 * - Error handling with Result patterns
 * - Event-driven notifications
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 2.1.0
 *
 * @example Production Usage
 * ``'typescript
 * const registry = new ClientRegistry();
 * await registry.initialize();
 * registry.registerClient('api-client', apiClient)';
 * const client = registry.getClient('api-client)';
 *
 * // Enhanced capabilities
 * const healthStatus = await registry.getHealthStatus();
 * const clientsByCapability = registry.getClientsByCapability('api)';
 * ``'
 */

import {
  ServiceContainer,
  createServiceContainer,
  TypedEventBase
} from '@claude-zen/foundation';
import {
  getLogger,
  type Logger,
  Result,
  ok,
  err
} from '@claude-zen/foundation';

import type {
  ClientInstance,
  ClientType
} from './interfaces';

/**
 * Statistics interface for the client registry.
 */
export interface RegistryStats {
  totalClients: number;
  totalClientTypes: number;
  clientNames: string[];
  clientTypeNames: string[];
  serviceContainer: {
  totalServices: number;
  enabledServices: number;
  disabledServices: number;
  capabilityCount: number;
  lifetimeDistribution: Record<string,
  number>

}
}

/**
 * Client information interface.
 */
export interface ClientInfo {
  name: string;
  type?: string;
  version?: string;
  capabilities: string[];
  enabled: boolean;
  registeredAt: Date;
  lastHealthCheck?: Date;
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown'

}

/**
 * Health status interface.
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  details: {
  totalClients: number;
  healthyClients: number;
  unhealthyClients: number;
  unknownClients: number

};
  clients: Record<string, {
  status: 'healthy' | 'unhealthy' | 'unknown';
    lastCheck: Date;
    error?: string

}>
}

/**
 * Service Container-based Client Registry
 *
 * Drop-in replacement for UACLRegistry with enhanced capabilities through ServiceContainer.
 * Maintains exact API compatibility while adding health monitoring, metrics, and discovery.
 */
export class ClientRegistry extends TypedEventBase {
  private container: ServiceContainer;
  private logger: Logger;
  private clients = new Map<string, ClientInstance>();
  private clientTypes = new Map<string, ClientType>();
  private initialized = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    super();

    this.container = createServiceContainer(
  'client-registry',
  {
  healthCheckFrequenc: 30000,
  // 30 seconds

}
);

    this.logger = getLogger('ClientRegistry)'
}

  /**
   * Initialize the registry with enhanced ServiceContainer features.
   */
  async initialize(': Promise<void> {
    if (this.initialized) {
      return
}

    // Start health monitoring
    await this.container.startHealthMonitoring();

    // Start periodic health checks
    this.startHealthChecking();

    this.initialized = true;
    this.logger.info('✅ ClientRegistry initialized with ServiceContainer);
    this.emit('initialized', { timestamp: new Date() })'
}

  /**
   * Register a client(compatible with existing UACLRegistry interface'.
   */
  registerClient(name: string, client: ClientInstance): void  {
    try {
      // Register with ServiceContainer for enhanced capabilities
      const registrationResult = this.container.registerInstance(
  name,
  client,
  {
        capabilities: this.extractClientCapabilities(client
),
        metadata: {
  type: 'client-instance',
  rgisteredAt: new Date(),
  version: client.version || '1.0.0'

},
        enabled: true,
        healthCheck: () => this.performClientHealthCheck(client)
});

      if (registrationResult.isErr()) {
        throw new Error('Failed to register client ' + name + ': ${registrationResult.error.message})'
}

      // Store for legacy compatibility
      this.clients.set(name, client);

      this.logger.debug('📝 Registered client: ' + name + ')';
      this.emit(
  'clientRegistered',
  {
  name,
  client
}
)'
} catch (error) {
      this.logger.error('❌ Failed to register client ' + name + ':', error)';
      throw error
}
  }

  /**
   * Get a client(compatible with existing UACLRegistry interface'.
   */
  getClient(name: string): ClientInstance | undefined  {
    try {
      // Try ServiceContainer first for enhanced resolution
      const result = this.container.resolve<ClientInstance>(name);
      if (result.isOk()) {
        return result.value
}

      // Fallback to legacy storage
      return this.clients.get(name)
} catch (error) {
      this.logger.warn('⚠️ Failed to resolve client ' + name + ',
  falling back to legacy:',
  error
);;
      return this.clients.get(name)
}
  }

  /**
   * Get all clients(compatible with existing UACLRegistry interface'.
   */
  getAllClients(): ClientInstance[]  {
    const allClients: ClientInstance[] = [];

    // Collect from ServiceContainer
    for (const serviceName of this.container.getServiceNames()) {
      const result = this.container.resolve<ClientInstance>(serviceName);
      if (result.isOk()) {
        allClients.push(result.value)
}
    }

    // Include any legacy clients not in ServiceContainer
    for (const client of this.clients.values()) {
      if (!allClients.includes(client)) {
        allClients.push(client)
}
    }

    return allClients
}

  /**
   * Register client type (compatible with existing UACLRegistry interface).
   */
  registerClientType(name: string, type: ClientType): void  {
    try {
      // Register type with ServiceContainer
      const registrationResult = this.container.registerInstance(
  type:' + name + '',
  type,
  {
        capabilities: ['client-type],
        mtadata: {
  type: 'client-type',
  typName: name,
  registeredAt: new Date(
)

},
        enabled: true
});

      if (registrationResult.isErr()) {
        throw new Error('Failed to register client type ' + name + ': ${registrationResult.error.message})'
}

      // Store for legacy compatibility
      this.clientTypes.set(name, type);

      this.logger.debug('🏷️ Registered client type: ' + name + ')';
      this.emit(
  'clientTypeRegistered',
  {
  name,
  type
}
)'
} catch (error) {
      this.logger.error('❌ Failed to register client type ' + name + ':', error)';
      throw error
}
  }

  /**
   * Get client type(compatible with existing UACLRegistry interface'.
   */
  getClientType(name: string): ClientType | undefined  {
    try {
      const result = this.container.resolve<ClientType>(type:' + name + '')';
      if (result.isOk()' {
        return result.value
}

      // Fallback to legacy storage
      return this.clientTypes.get(name)
} catch (error) {
      this.logger.warn('⚠️ Failed to resolve client type ' + name + ':', error);;
      return this.clientTypes.get(name)
}
  }

  /**
   * Get all client types(compatible with existing UACLRegistry interface'.
   */
  getAllClientTypes(): ClientType[]  {
    return Array.from(this.clientTypes.values())
}

  /**
   * Check if client exists (compatible with existing UACLRegistry interface).
   */
  hasClient(name: string): boolean  {
  return this.container.hasService(name) || this.clients.has(name)

}

  /**
   * Remove client (compatible with existing UACLRegistry interface).
   */
  removeClient(name: string): boolean  {
    try {
      // Disable in ServiceContainer (we can't fully remove but ca' disable)
      this.container.setServiceEnabled(name, false);

      // Remove from legacy storage
      const removed = this.clients.delete(name);

      if (removed) {
        this.logger.debug('🗑️ Removed client: ' + name + ')';
        this.emit('clientRemoved', { name })'
}

      return removed
} catch (error) {
      this.logger.error('❌ Failed to remove client ' + name + ':', error);;
      return false
}
  }

  /**
   * Clear all clients and types(compatible with existing UACLRegistry interface'.
   */
  clear(): void  {
    try {
      // Disable all services in ServiceContainer
      for (const serviceName of this.container.getServiceNames()) {
  this.container.setServiceEnabled(serviceName,
  false)

}

      // Clear legacy storage
      this.clients.clear();
      this.clientTypes.clear();

      this.logger.info('🧹 Cleared all clients and types)';
      this.emit('cleared', { timestamp: new Date() })'
} catch (error) {
  this.logger.error('❌ Failed to clear registry:',
  error)'
}
  }

  /**
   * Get statistics(compatible with existing UACLRegistry interface + enhanced'.
   */
  getStats(): RegistryStats  {
    const containerStats = this.container.getStats();

    return {
      // Legacy compatibility
      totalClients: this.clients.size,
      totalClientTypes: this.clientTypes.size,
      clientNames: Array.from(this.clients.keys()),
      clientTypeNames: Array.from(this.clientTypes.keys()),

      // Enhanced ServiceContainer metrics
      serviceContainer: {
  totalServices: containerStats.totalServices,
  enabledServices: containerStats.enabledServices,
  disabledServices: containerStats.disabledServices,
  capabilityCount: containerStats.capabilityCount,
  lifetimeDistribution: containerStats.lifetimeDistribution

}
}
}

  /**
   * Get clients by capability (NEW - ServiceContainer enhancement).
   */
  getClientsByCapability(capability: string): ClientInstance[]  {
    const serviceInfos = this.container.getServicesByCapability(capability);
    const clients: ClientInstance[] = [];

    for (const serviceInfo of serviceInfos) {
      const result = this.container.resolve<ClientInstance>(serviceInfo.name);
      if (result.isOk()) {
        clients.push(result.value)
}
    }

    return clients
}

  /**
   * Get health status (NEW - ServiceContainer enhancement).
   */
  async getHealthStatus(): Promise<HealthStatus>  {
    const containerHealth = await this.container.getHealthStatus();
    const clients: Record<string, {
  status: 'healthy' | 'unhealthy' | 'unknown'; lastCheck: Date; error?: string
}> = {};

    let healthyCount = 0;
    let unhealthyCount = 0;
    let unknownCount = 0;

    // Check each client's health
    for (const [name, client] of this.clients) {
      const isHealthy = this.performClientHealthCheck(client);
      const status = isHealthy ? 'healthy' : 'unhealthy';

      clients[name] = {
  status,
  lastCheck: new Date()

};

      if(status === 'healthy) {
        health'Count++
} else {
        unhealthyCount++
}
    }

    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (unhealthyCount > 0) {
  overallStatus = healthyCount > unhealthyCount ? 'degraded' : 'unhealthy'

}

    return {
      status: overallStatus,
      timestamp: new Date(),
      details: {
  totalClients: this.clients.size,
  healthyClients: healthyCount,
  unhealthyClients: unhealthyCount,
  unknownClients: unknownCount

},
      clients
}
}

  /**
   * Get client information (NEW - ServiceContainer enhancement).
   */
  getClientInfo(name: string): ClientInfo | undefined  {
    const serviceInfo = this.container.getServiceInfo(name);
    if (!serviceInfo) {
      return undefined
}

    const client = this.clients.get(name);

    return {
  name,
  type: client?.type,
  version: client?.version,
  capabilities: serviceInfo.capabilities || [],
  enabled: serviceInfo.enabled,
  registeredAt: serviceInfo.metadata?.registeredAt || new Date(),
  healthStatus: this.performClientHealthCheck(client) ? 'healthy' : 'unhealthy',
  lastHealthCheck: new Date()

}
}

  /**
   * Enable/disable client (NEW - ServiceContainer enhancement).
   */
  setClientEnabled(name: string, enabled: boolean): boolean  {
    const result = this.container.setServiceEnabled(name, enabled);

    if (result.isOk()) {
      this.logger.debug('' + enabled ? '✅' : '❌' + ' ${enabled ? 'Enabled' : 'Disabled'} client: ${name})';
      this.emit(
  'clientStatusChanged',
  {
  name,
  enabled
}
)'
}

    return result.isOk()
}

  /**
   * Start periodic health checking.
   */
  private startHealthChecking(': void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
}

    this.healthCheckInterval = setInterval(async () => {
      try {
        const healthStatus = await this.getHealthStatus();
        this.emit('healthCheck', healthStatus)';

        if(healthStatus.status === 'unhealthy) {
  this.logger.warn('🔴 Registry health check failed - some clients are unhealthy)

}

      } catch (error) {
  this.logger.error('❌ Health check failed:',
  error)'
}
    }, 30000); // Every 30 seconds
  }

  /**
   * Shutdown the registry.
   */
  async shutdown(): Promise<void> {
    try {
      // Stop health checking
      if (this.healthCheckInterval) {
  clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = undefined

}

      // Shutdown container
      await this.container.dispose();

      // Clear storage
      this.clients.clear();
      this.clientTypes.clear();

      // Remove event listeners
      this.removeAllListeners();

      this.initialized = false;
      this.logger.info('🔄 ClientRegistry shutdown completed)'
} catch (error) {
  this.logger.error('❌ Error during registry shutdown:','
  error)';
      throw error

}
  }

  // Private helper methods

  /**
   * Extract client capabilities for ServiceContainer registration.
   */
  private extractClientCapabilities(client: ClientInstance: string[] {
    const capabilities: string[] = [];

    if (client.type) capabilities.push(client.type);
    if (client.name) capabilities.push(name:' + client.name + ')';
    if (client.version' capabilities.push(version:' + client.version + )';

    // Extract capabilities from client properties
    if (typeof client === 'object' && clien' !== null) {
      if ('capabilities' in client && Array.i'Array(client.capabilities)) {
        capabilities.push(...client.capabilities)
}

      if ('protocols' in client && Array.i'Array(client.protocols)) {
        capabilities.push(...client.protocols.map((p) => protocol:' + p + ''))'
}
    }

    return capabilities
}

  /**
   * Perform health check on a client.
   */
  private performClientHealthCheck(client: ClientInstance | undefined: boolean {
    try {
      if (typeof client === `object' && clien' !== null) {
        // Check if client has health check method
        if('healthCheck' in client && typeof client.healthChec' === 'function) {
          retur' Boolean(client.healthCheck())
}

        // Check if client has isConnected property
        if ('isConnected' in client) {
          return Boolean(client.isConnected)
}

        // Check if client has status property
        if ('status' in client) {
  return client.'tatus === 'active' || cli'nt.status === 'connected'

}
      }

      // Default: assume healthy if client exists
      return client !== undefined
} catch (error) {
  this.logger.warn('⚠️ Health check failed for client:','
  error);;
      return false

}
  }
}

/**
 * Singleton instance for backward compatibility.
 */
let globalRegistry: ClientRegistry | null = null;

/**
 * Get the global client registry instance.
 */
export function getClientRegistry(': ClientRegistry {
  if (!globalRegistry) {
    globalRegistry = new ClientRegistry()
}
  return globalRegistry
}

/**
 * Initialize the global client registry.
 */
export async function initializeClientRegistry(): Promise<ClientRegistry>  {
  const registry = getClientRegistry();
  await registry.initialize();
  return registry

}

/**
 * Reset the global client registry (primarily for testing).
 */
export async function resetClientRegistry(): Promise<void>  {
  if (globalRegistry) {
  await globalRegistry.shutdown();
    globalRegistry = null

}
}

// Re-export types for convenience
export type {
  ClientInstance,
  ClientType
} from './interfaces';