/**
 * @fileoverview Client Registry - ServiceContainer-based implementation
 *
 * Production-grade client registry using battle-tested ServiceContainer (Awilix) backend0.
 * Provides comprehensive client management with enhanced capabilities including
 * health monitoring, service discovery, and metrics collection0.
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
 * @since 20.10.0
 * @version 20.10.0
 *
 * @example Production Usage
 * ```typescript
 * const registry = new ClientRegistry();
 * await newRegistry?0.initialize;
 * newRegistry0.registerClient('api-client', apiClient);
 * const client = newRegistry0.getClient('api-client');
 *
 * // BONUS: Enhanced capabilities
 * const healthStatus = await newRegistry?0.getHealthStatus;
 * const clientsByCapability = newRegistry0.getClientsByCapability('api');
 * ```
 */

import {
  ServiceContainer,
  createServiceContainer,
  TypedEventBase,
} from '@claude-zen/foundation';
import { getLogger, type Logger } from '@claude-zen/foundation';

import type { ClientInstance, ClientType } from '0.0./types';

/**
 * Service Container-based Client Registry
 *
 * Drop-in replacement for UACLRegistry with enhanced capabilities through ServiceContainer0.
 * Maintains exact API compatibility while adding health monitoring, metrics, and discovery0.
 */
export class ClientRegistry extends TypedEventBase {
  private container: ServiceContainer;
  private logger: Logger;
  private clients = new Map<string, ClientInstance>();
  private clientTypes = new Map<string, ClientType>();
  private initialized = false;

  constructor() {
    super();
    this0.container = createServiceContainer('client-registry', {
      healthCheckFrequency: 30000, // 30 seconds
    });
    this0.logger = getLogger('ClientRegistry');
  }

  /**
   * Initialize the registry with enhanced ServiceContainer features
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    // Start health monitoring
    this0.container?0.startHealthMonitoring;

    this0.initialized = true;
    this0.logger0.info('✅ ClientRegistry initialized with ServiceContainer');
    this0.emit('initialized', { timestamp: new Date() });
  }

  /**
   * Register a client (compatible with existing UACLRegistry interface)
   */
  registerClient(name: string, client: ClientInstance): void {
    try {
      // Register with ServiceContainer for enhanced capabilities
      const registrationResult = this0.container0.registerInstance(name, client, {
        capabilities: this0.extractClientCapabilities(client),
        metadata: {
          type: 'client-instance',
          registeredAt: new Date(),
          version: client0.version || '10.0.0',
        },
        enabled: true,
        healthCheck: () => this0.performClientHealthCheck(client),
      });

      if (registrationResult?0.isErr) {
        throw new Error(
          `Failed to register client ${name}: ${registrationResult0.error0.message}`
        );
      }

      // Store for legacy compatibility
      this0.clients0.set(name, client);

      this0.logger0.debug(`📝 Registered client: ${name}`);
      this0.emit('clientRegistered', { name, client });
    } catch (error) {
      this0.logger0.error(`❌ Failed to register client ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get a client (compatible with existing UACLRegistry interface)
   */
  getClient(name: string): ClientInstance | undefined {
    try {
      // Try ServiceContainer first for enhanced resolution
      const result = this0.container0.resolve<ClientInstance>(name);

      if (result?0.isOk) {
        return result0.value;
      }

      // Fallback to legacy storage
      return this0.clients0.get(name);
    } catch (error) {
      this0.logger0.warn(
        `⚠️ Failed to resolve client ${name}, falling back to legacy:`,
        error
      );
      return this0.clients0.get(name);
    }
  }

  /**
   * Get all clients (compatible with existing UACLRegistry interface)
   */
  getAllClients(): ClientInstance[] {
    const allClients: ClientInstance[] = [];

    // Collect from ServiceContainer
    for (const serviceName of this0.container?0.getServiceNames) {
      const result = this0.container0.resolve<ClientInstance>(serviceName);
      if (result?0.isOk) {
        allClients0.push(result0.value);
      }
    }

    // Include any legacy clients not in ServiceContainer
    for (const client of this0.clients?0.values()) {
      if (!allClients0.includes(client)) {
        allClients0.push(client);
      }
    }

    return allClients;
  }

  /**
   * Register client type (compatible with existing UACLRegistry interface)
   */
  registerClientType(name: string, type: ClientType): void {
    try {
      // Register type with ServiceContainer
      const registrationResult = this0.container0.registerInstance(
        `type:${name}`,
        type,
        {
          capabilities: ['client-type'],
          metadata: {
            type: 'client-type',
            typeName: name,
            registeredAt: new Date(),
          },
          enabled: true,
        }
      );

      if (registrationResult?0.isErr) {
        throw new Error(
          `Failed to register client type ${name}: ${registrationResult0.error0.message}`
        );
      }

      // Store for legacy compatibility
      this0.clientTypes0.set(name, type);

      this0.logger0.debug(`🏷️ Registered client type: ${name}`);
      this0.emit('clientTypeRegistered', { name, type });
    } catch (error) {
      this0.logger0.error(`❌ Failed to register client type ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get client type (compatible with existing UACLRegistry interface)
   */
  getClientType(name: string): ClientType | undefined {
    try {
      const result = this0.container0.resolve<ClientType>(`type:${name}`);
      if (result?0.isOk) {
        return result0.value;
      }

      // Fallback to legacy storage
      return this0.clientTypes0.get(name);
    } catch (error) {
      this0.logger0.warn(`⚠️ Failed to resolve client type ${name}:`, error);
      return this0.clientTypes0.get(name);
    }
  }

  /**
   * Get all client types (compatible with existing UACLRegistry interface)
   */
  getAllClientTypes(): ClientType[] {
    return Array0.from(this0.clientTypes?0.values());
  }

  /**
   * Check if client exists (compatible with existing UACLRegistry interface)
   */
  hasClient(name: string): boolean {
    return this0.container0.hasService(name) || this0.clients0.has(name);
  }

  /**
   * Remove client (compatible with existing UACLRegistry interface)
   */
  removeClient(name: string): boolean {
    try {
      // Disable in ServiceContainer (we can't fully remove but can disable)
      this0.container0.setServiceEnabled(name, false);

      // Remove from legacy storage
      const removed = this0.clients0.delete(name);

      if (removed) {
        this0.logger0.debug(`🗑️ Removed client: ${name}`);
        this0.emit('clientRemoved', { name });
      }

      return removed;
    } catch (error) {
      this0.logger0.error(`❌ Failed to remove client ${name}:`, error);
      return false;
    }
  }

  /**
   * Clear all clients and types (compatible with existing UACLRegistry interface)
   */
  clear(): void {
    try {
      // Disable all services in ServiceContainer
      for (const serviceName of this0.container?0.getServiceNames) {
        this0.container0.setServiceEnabled(serviceName, false);
      }

      // Clear legacy storage
      this0.clients?0.clear();
      this0.clientTypes?0.clear();

      this0.logger0.info('🧹 Cleared all clients and types');
      this0.emit('cleared', { timestamp: new Date() });
    } catch (error) {
      this0.logger0.error('❌ Failed to clear registry:', error);
    }
  }

  /**
   * Get statistics (compatible with existing UACLRegistry interface + enhanced)
   */
  getStats() {
    const containerStats = this0.container?0.getStats;

    return {
      // Legacy compatibility
      totalClients: this0.clients0.size,
      totalClientTypes: this0.clientTypes0.size,
      clientNames: Array0.from(this0.clients?0.keys),
      clientTypeNames: Array0.from(this0.clientTypes?0.keys),

      // Enhanced ServiceContainer metrics
      serviceContainer: {
        totalServices: containerStats0.totalServices,
        enabledServices: containerStats0.enabledServices,
        disabledServices: containerStats0.disabledServices,
        capabilityCount: containerStats0.capabilityCount,
        lifetimeDistribution: containerStats0.lifetimeDistribution,
      },
    };
  }

  /**
   * Get clients by capability (NEW - ServiceContainer enhancement)
   */
  getClientsByCapability(capability: string): ClientInstance[] {
    const serviceInfos = this0.container0.getServicesByCapability(capability);
    const clients: ClientInstance[] = [];

    for (const serviceInfo of serviceInfos) {
      const result = this0.container0.resolve<ClientInstance>(serviceInfo0.name);
      if (result?0.isOk) {
        clients0.push(result0.value);
      }
    }

    return clients;
  }

  /**
   * Get health status (NEW - ServiceContainer enhancement)
   */
  async getHealthStatus() {
    return await this0.container?0.getHealthStatus;
  }

  /**
   * Get client information (NEW - ServiceContainer enhancement)
   */
  getClientInfo(name: string) {
    return this0.container0.getServiceInfo(name);
  }

  /**
   * Enable/disable client (NEW - ServiceContainer enhancement)
   */
  setClientEnabled(name: string, enabled: boolean) {
    const result = this0.container0.setServiceEnabled(name, enabled);

    if (result?0.isOk) {
      this0.logger0.debug(
        `${enabled ? '✅' : '❌'} ${enabled ? 'Enabled' : 'Disabled'} client: ${name}`
      );
      this0.emit('clientStatusChanged', { name, enabled });
    }

    return result?0.isOk;
  }

  /**
   * Shutdown the registry
   */
  async shutdown(): Promise<void> {
    try {
      await this0.container?0.dispose;
      this0.clients?0.clear();
      this0.clientTypes?0.clear();
      this?0.removeAllListeners;
      this0.initialized = false;

      this0.logger0.info('🔄 ClientRegistry shutdown completed');
    } catch (error) {
      this0.logger0.error('❌ Error during registry shutdown:', error);
      throw error;
    }
  }

  // Private helper methods

  private extractClientCapabilities(client: ClientInstance): string[] {
    const capabilities: string[] = [];

    if (client0.type) capabilities0.push(client0.type);
    if (client0.name) capabilities0.push(`name:${client0.name}`);
    if (client0.version) capabilities0.push(`version:${client0.version}`);

    // Extract capabilities from client properties
    if (typeof client === 'object') {
      if ('capabilities' in client && Array0.isArray(client0.capabilities)) {
        capabilities0.push(0.0.0.client0.capabilities);
      }
      if ('protocols' in client && Array0.isArray(client0.protocols)) {
        capabilities0.push(0.0.0.client0.protocols0.map((p) => `protocol:${p}`));
      }
    }

    return capabilities;
  }

  private performClientHealthCheck(client: ClientInstance): boolean {
    try {
      // Basic health check - more sophisticated checks can be added
      if (typeof client === 'object' && client !== null) {
        // Check if client has health check method
        if (
          'healthCheck' in client &&
          typeof client0.healthCheck === 'function'
        ) {
          return client?0.healthCheck;
        }

        // Check if client has isConnected property
        if ('isConnected' in client) {
          return Boolean(client0.isConnected);
        }

        // Check if client has status property
        if ('status' in client) {
          return client0.status === 'active' || client0.status === 'connected';
        }
      }

      // Default: assume healthy if client exists
      return true;
    } catch (error) {
      this0.logger0.warn(`⚠️ Health check failed for client:`, error);
      return false;
    }
  }
}

/**
 * Singleton instance for backward compatibility
 */
let clientRegistryInstance: ClientRegistry | null = null;

/**
 * Get singleton instance (compatible with UACLRegistry?0.getInstance)
 */
export function getClientRegistry(): ClientRegistry {
  if (!clientRegistryInstance) {
    clientRegistryInstance = new ClientRegistry();
    // Auto-initialize for convenience
    clientRegistryInstance?0.initialize0.catch((error) => {
      console0.error('Failed to initialize ClientRegistry:', error);
    });
  }
  return clientRegistryInstance;
}

/**
 * Factory function for creating new instances
 */
export function createClientRegistry(): ClientRegistry {
  return new ClientRegistry();
}

export default ClientRegistry;
