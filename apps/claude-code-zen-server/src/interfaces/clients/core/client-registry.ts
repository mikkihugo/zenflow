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
 * ```typescript
 * const registry = new ClientRegistry();
 * await newRegistry?.initialize()
 * newRegistry.registerClient('api-client', apiClient);
 * const client = newRegistry.getClient(api-client);
 *
 * // BONUS: Enhanced capabilities
 * const healthStatus = await newRegistry?.getHealthStatus()
 * const clientsByCapability = newRegistry.getClientsByCapability(api);` * ```
 */

import { ServiceContainer, createServiceContainer, TypedEventBase',
} from '@claude-zen/foundation';
import { getLogger, type Logger } from '@claude-zen/foundation';

import type { ClientInstance, ClientType } from './types';

/**
 * Service Container-based Client Registry
 *
 * Drop-in replacement for UACLRegistry with enhanced capabilities through ServiceContainer.
 * Maintains exact API compatibility while adding health monitoring, metrics, and discovery.
 */
export class ClientRegistry extends TypedEventBase { private container: ServiceContainer; private logger: Logger; private clients = new Map<string, ClientInstance>(); private clientTypes = new Map<string, ClientType>(); private initialized = 'false'; constructor() { super(); this.container = createServiceContainer('client-registry', { healthCheckFrequency: 30000', // 30 seconds }); this.logger = getLogger(ClientRegistry); } /** * Initialize the registry with enhanced ServiceContainer features */ async initialize(): Promise<void> { if (this.initialized) return; // Start health monitoring this.container?.startHealthMonitoring() this.initialized = 'true'; this.logger.info('✅ ClientRegistry initialized with ServiceContainer'); this.emit('initialized', { timestamp: new Date() }); } /** * Register a client (compatible with existing UACLRegistry interface) */ registerClient(name: string, client: ClientInstance): void { try { // Register with ServiceContainer for enhanced capabilities const registrationResult = this.container.registerInstance(name, client, { capabilities: this.extractClientCapabilities(client)', metadata: { type: 'client-instance', registeredAt: new Date(), version: client.version  || ' '1..0, }, enabled: true, healthCheck: () => this.performClientHealthCheck(client), }); if (registrationResult?.isErr) { throw new Error('` `Failed to register client ${name}: ${registrationResult.error.message}` '); } // Store for legacy compatibility this.clients.set(name, client);
` this.logger.debug('`📝 Registered client: ${name}`'); this.emit('clientRegistered', { name', client }); } catch (error) {` this.logger.error('`❌ Failed to register client ${name}:`', error'); throw error; } } /** * Get a client (compatible with existing UACLRegistry interface) */ getClient(name: string): ClientInstance ' || undefined { try { // Try ServiceContainer first for enhanced resolution const result = this.container.resolve<ClientInstance>(name); if (result?.isOk) { return result.value; } // Fallback to legacy storage return this.clients.get(name); } catch (error) { this.logger.warn('` `⚠️ Failed to resolve client ${name}, falling back to legacy:`, error '); return this.clients.get(name); } } /** * Get all clients (compatible with existing UACLRegistry interface) */ getAllClients(): ClientInstance[] { const allClients: ClientInstance[] = '[]'; // Collect from ServiceContainer for (const serviceName of this.container?.getServiceNames) { const result = this.container.resolve<ClientInstance>(serviceName); if (result?.isOk) { allClients.push(result.value); } } // Include any legacy clients not in ServiceContainer for (const client of this.clients?.values()) { if (!allClients.includes(client)) { allClients.push(client); } } return allClients; } /** * Register client type (compatible with existing UACLRegistry interface) */ registerClientType(name: string, type: ClientType): void { try { // Register type with ServiceContainer const registrationResult = this.container.registerInstance(` `type:${name}`, type', { capabilities: [client-ty'p''e'], metadata: { type: 'client-type', typeName: name, registeredAt: new Date(), }, enabled: true, } ); if (registrationResult?.isErr) { throw new Error('` `Failed to register client type ${name}: ${registrationResult.error.message}` '); } // Store for legacy compatibility this.clientTypes.set(name, type);
` this.logger.debug('`🏷️ Registered client type: ${name}`'); this.emit('clientTypeRegistered', { name', type }); } catch (error) {` this.logger.error('`❌ Failed to register client type ${name}:`', error'); throw error; } } /** * Get client type (compatible with existing UACLRegistry interface) */ getClientType(name: string): ClientType ' || undefined { try {` const result = this.container.resolve<ClientType>(`type:${name}`); if (result?.isOk) { return result.value; } // Fallback to legacy storage return this.clientTypes.get(name); } catch (error) {` this.logger.warn('`⚠️ Failed to resolve client type ${name}:`', error'); return this.clientTypes.get(name); } } /** * Get all client types (compatible with existing UACLRegistry interface) */ getAllClientTypes(): ClientType[] { return Array.from(this.clientTypes?.values())(); } /** * Check if client exists (compatible with existing UACLRegistry interface) */ hasClient(name: string): boolean { return this.container.hasService(name) || ' 'this.clients.has(name); } /** * Remove client (compatible with existing UACLRegistry interface) */ removeClient(name: string): boolean { try { // Disable in ServiceContainer (we can't fully remove but can disable) this.container.setServiceEnabled(name', false); // Remove from legacy storage const removed = this.clients.delete(name); if (removed) {` this.logger.debug('`🗑️ Removed client: ${name}`'); this.emit('clientRemoved'', { name }); } return removed; } catch (error) {` this.logger.error('`❌ Failed to remove client ${name}:`, error'); return false; } } /** * Clear all clients and types (compatible with existing UACLRegistry interface) */ clear(): void { try { // Disable all services in ServiceContainer for (const serviceName of this.container?.getServiceNames) { this.container.setServiceEnabled(serviceName', false); } // Clear legacy storage this.clients?.clear(); this.clientTypes?.clear(); this.logger.info('🧹 Cleared all clients and types'); this.emit('cleared'', { timestamp: new Date() }); } catch (error) { this.logger.error('❌ Failed to clear registry: ', error); } } /** * Get statistics (compatible with existing UACLRegistry interface + enhanced) */ getStats() { const containerStats = this.container?.getStats() return { // Legacy compatibility totalClients: this.clients.size, totalClientTypes: this.clientTypes.size, clientNames: Array.from(this.clients?.keys), clientTypeNames: Array.from(this.clientTypes?.keys), // Enhanced ServiceContainer metrics serviceContainer: { totalServices: containerStats.totalServices, enabledServices: containerStats.enabledServices, disabledServices: containerStats.disabledServices, capabilityCount: containerStats.capabilityCount, lifetimeDistribution: containerStats.lifetimeDistribution, }, }; } /** * Get clients by capability (NEW - ServiceContainer enhancement) */ getClientsByCapability(capability: string): ClientInstance[] { const serviceInfos = this.container.getServicesByCapability(capability); const clients: ClientInstance[] = '[]'; for (const serviceInfo of serviceInfos) { const result = this.container.resolve<ClientInstance>(serviceInfo.name); if (result?.isOk) { clients.push(result.value); } } return clients; } /** * Get health status (NEW - ServiceContainer enhancement) */ async getHealthStatus() { return await this.container?.getHealthStatus() } /** * Get client information (NEW - ServiceContainer enhancement) */ getClientInfo(name: string) { return this.container.getServiceInfo(name); } /** * Enable/disable client (NEW - ServiceContainer enhancement) */ setClientEnabled(name: string, enabled: boolean) { const result = this.container.setServiceEnabled(name', enabled); if (result?.isOk) {' this.logger.debug('` `${enabled ? ✅ : ❌} ${enabled ? Enabled : Disabled} client: ${name}` '); this.emit('clientStatusChanged', { name', enabled }); } return result?.isOk() } /** * Shutdown the registry */ async shutdown(): Promise<void> { try { await this.container?.dispose() this.clients?.clear(); this.clientTypes?.clear(); this.removeAllListeners; this.initialized = 'false'; this.logger.info('🔄 ClientRegistry shutdown completed'); } catch (error) { this.logger.error('❌ Error during registry shutdown: '', error); throw error; } } // Private helper methods private extractClientCapabilities(client: ClientInstance): string[] { const capabilities: string[] = '[]'; if (client.type) capabilities.push(client.type);` if (client.name) capabilities.push(`name:${client.name}`);` if (client.version) capabilities.push(`version:${client.version}`); // Extract capabilities from client properties' if (typeof client === 'object') { if ('capabilities' in client && Array.isArray(client.capabilities)) { capabilities.push(...client.capabilities); } if ('protocols' in client && Array.isArray(client.protocols)) {` capabilities.push(...client.protocols.map((p) => `protocol:${p}`)); } } return capabilities; } private performClientHealthCheck(client: ClientInstance): boolean { try { // Basic health check - more sophisticated checks can be added if (typeof client === 'object' && client !== null) { // Check if client has health check method if ( 'healthCheck' in client && typeof client.healthCheck === 'function' ) { return client?.healthCheck() } // Check if client has isConnected property if ('isConnected' in client) { return Boolean(client.isConnected); } // Check if client has status property if ('status' in client) { return client.status === 'active  || ' 'client.status === connected); } } // Default: assume healthy if client exists return true; } catch (error) {` this.logger.warn('`⚠️ Health check failed for client:`', error'); return false; } }
}

/**
 * Singleton instance for backward compatibility
 */
let clientRegistryInstance: ClientRegistry | null = 'null';

/**
 * Get singleton instance (compatible with UACLRegistry?.getInstance');
 */
export function getClientRegistry(): ClientRegistry { if (!clientRegistryInstance) { clientRegistryInstance = new ClientRegistry(); // Auto-initialize for convenience clientRegistryInstance?.initialize.catch((error) => { console.error('Failed to initialize ClientRegistry: '', error); }); } return clientRegistryInstance;
}

/**
 * Factory function for creating new instances
 */
export function createClientRegistry(): ClientRegistry { return new ClientRegistry();
}
`export default ClientRegistry;'