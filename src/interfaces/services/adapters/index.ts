/**
 * USL Service Adapters - Index and Registry Integration
 *
 * @file Exports all service adapter components and integrates them with
 * the global USL service registry. This provides a unified entry point
 * for all service adapter functionality including data adapters, coordination adapters,
 * integration adapters, and infrastructure adapters.
 * @description Service adapters provide enhanced implementations of core services
 * with specialized capabilities:
 * - Data adapters: Web API integration, database operations, caching
 * - Coordination adapters: Agent management, task orchestration, swarm coordination
 * - Integration adapters: External system connectivity, protocol management
 * - Infrastructure adapters: System monitoring, health checks, metrics collection
 * @example
 * ```typescript
 * import {
 *   DataServiceAdapter,
 *   createDataServiceAdapter,
 *   IntegrationServiceAdapter,
 *   createIntegrationServiceAdapter
 * } from '@claude-zen/usl/adapters';
 *
 * // Create a web-enabled data adapter
 * const webDataAdapter = createDataServiceAdapter({
 *   name: 'api-data',
 *   web: {
 *     enabled: true,
 *     apiEndpoint: 'https://api.example.com',
 *     authentication: { type: 'bearer', token: 'your-token' }
 *   }
 * });
 *
 * // Create an integration adapter with safe API features
 * const integrationAdapter = createIntegrationServiceAdapter({
 *   name: 'external-api',
 *   safeAPI: {
 *     enabled: true,
 *     baseURL: 'https://external.api.com',
 *     validation: { enabled: true, strictMode: true }
 *   }
 * });
 * ```
 */

// Coordination service adapter exports
export {
  CoordinationServiceAdapter,
  type CoordinationServiceAdapterConfig,
  createCoordinationServiceAdapter,
  createDefaultCoordinationServiceAdapterConfig,
} from './coordination-service-adapter';
export {
  CoordinationServiceFactory,
  coordinationServiceFactory,
} from './coordination-service-factory';
export * from './coordination-service-helpers';
// Data service adapter exports
// Factory integration
export {
  createDataServiceAdapter,
  createDefaultDataServiceAdapterConfig,
  DataServiceAdapter,
  type DataServiceAdapterConfig,
} from './data-service-adapter';
export { DataServiceFactory, globalDataServiceFactory } from './data-service-factory';
// Re-export types for convenience
export type {
  BatchOperationConfig,
  DataAggregationOptions,
  DataOperationResult,
  DataValidationResult,
  EnhancedSearchOptions,
  TransformationStep,
} from './data-service-helpers';
export {
  type DataOperationResult,
  DataServiceHelper,
  DataServiceUtils,
} from './data-service-helpers';
// Infrastructure service adapter exports
export {
  createDefaultInfrastructureServiceAdapterConfig,
  createDefaultInfrastructureServiceAdapterConfig,
  createInfrastructureServiceAdapter,
  createInfrastructureServiceAdapter,
  InfrastructureServiceAdapter,
  type InfrastructureServiceAdapterConfig,
} from './infrastructure-service-adapter';
export {
  createInfrastructureService,
  createInfrastructureServiceFactory,
  getInfrastructureServiceFactory,
  InfrastructureServiceFactory,
} from './infrastructure-service-factory';
export * from './infrastructure-service-helpers';
// Integration service adapter exports
export {
  createDefaultIntegrationServiceAdapterConfig,
  createIntegrationServiceAdapter,
  IntegrationServiceAdapter,
  type IntegrationServiceAdapterConfig,
} from './integration-service-adapter';
export {
  IntegrationServiceFactory,
  integrationServiceFactory,
} from './integration-service-factory';
export * from './integration-service-helpers';

// Integration with global service registry
import { globalServiceRegistry } from '../factories';
import { ServiceType } from '../types';
import { coordinationServiceFactory } from './coordination-service-factory';
import { globalDataServiceFactory } from './data-service-factory';
import { getInfrastructureServiceFactory } from './infrastructure-service-factory';
import { integrationServiceFactory } from './integration-service-factory';

/**
 * Register data service factory with global registry
 *
 * @function registerDataServiceFactory
 * @returns {void}
 * @description Registers the specialized data service factory with the global USL registry
 * for handling DATA, WEB_DATA, and DOCUMENT service types
 * @example
 * ```typescript
 * // Manually register if needed (auto-registered by default)
 * registerDataServiceFactory();
 *
 * // Now data services can be created through the registry
 * const dataService = await globalUSLFactory.create({
 *   name: 'my-data',
 *   type: ServiceType.DATA
 * });
 * ```
 */
export function registerDataServiceFactory(): void {
  // Register the specialized data service factory for DATA, WEB_DATA, and DOCUMENT types
  globalServiceRegistry.registerFactory(ServiceType["DATA"], globalDataServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType["WEB_DATA"], globalDataServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType["DOCUMENT"], globalDataServiceFactory);
}

/**
 * Register coordination service factory with global registry
 *
 * @function registerCoordinationServiceFactory
 * @returns {void}
 * @description Registers the specialized coordination service factory with the global USL registry
 * for handling COORDINATION, DAA (Distributed Autonomous Agent), and SESSION_RECOVERY service types
 * @example
 * ```typescript
 * // Coordination services support agent management and task orchestration
 * registerCoordinationServiceFactory();
 *
 * const coordService = await globalUSLFactory.create({
 *   name: 'swarm-coordinator',
 *   type: ServiceType.COORDINATION,
 *   swarm: { topology: 'mesh', maxAgents: 10 }
 * });
 * ```
 */
export function registerCoordinationServiceFactory(): void {
  // Register the specialized coordination service factory for COORDINATION, DAA, and SESSION_RECOVERY types
  globalServiceRegistry.registerFactory(ServiceType["COORDINATION"], coordinationServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType["DAA"], coordinationServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType["SESSION_RECOVERY"], coordinationServiceFactory);
}

/**
 * Register integration service factory with global registry
 *
 * @function registerIntegrationServiceFactory
 * @returns {void}
 * @description Registers the specialized integration service factory with the global USL registry
 * for handling API, SAFE_API, and ARCHITECTURE_STORAGE service types
 * @example
 * ```typescript
 * // Integration services provide external system connectivity
 * registerIntegrationServiceFactory();
 *
 * const apiService = await globalUSLFactory.create({
 *   name: 'external-api',
 *   type: ServiceType.SAFE_API,
 *   safeAPI: {
 *     enabled: true,
 *     baseURL: 'https://api.example.com',
 *     validation: { enabled: true }
 *   }
 * });
 * ```
 */
export function registerIntegrationServiceFactory(): void {
  // Register the specialized integration service factory for API, SAFE_API, and ARCHITECTURE_STORAGE types
  globalServiceRegistry.registerFactory(ServiceType["API"], integrationServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType["SAFE_API"], integrationServiceFactory);
  globalServiceRegistry.registerFactory(
    ServiceType["ARCHITECTURE_STORAGE"],
    integrationServiceFactory
  );
}

/**
 * Register infrastructure service factory with global registry
 *
 * @function registerInfrastructureServiceFactory
 * @returns {void}
 * @description Registers the specialized infrastructure service factory with the global USL registry
 * for handling INFRASTRUCTURE, SYSTEM, and MONITORING service types
 * @example
 * ```typescript
 * // Infrastructure services provide system monitoring and health checks
 * registerInfrastructureServiceFactory();
 *
 * const monitoringService = await globalUSLFactory.create({
 *   name: 'system-monitor',
 *   type: ServiceType.MONITORING,
 *   monitoring: {
 *     enabled: true,
 *     metricsInterval: 30000,
 *     trackLatency: true
 *   }
 * });
 * ```
 */
export function registerInfrastructureServiceFactory(): void {
  // Register the specialized infrastructure service factory for INFRASTRUCTURE, SYSTEM, and MONITORING types
  const infrastructureFactory = getInfrastructureServiceFactory();
  globalServiceRegistry.registerFactory(ServiceType["INFRASTRUCTURE"], infrastructureFactory);
  globalServiceRegistry.registerFactory(ServiceType["SYSTEM"], infrastructureFactory);
  globalServiceRegistry.registerFactory(ServiceType["MONITORING"], infrastructureFactory);
}

/**
 * Auto-register service factories on module load
 */
registerDataServiceFactory();
registerCoordinationServiceFactory();
registerIntegrationServiceFactory();
registerInfrastructureServiceFactory();

export default {
  DataServiceAdapter,
  DataServiceFactory,
  DataServiceHelper,
  DataServiceUtils,
  globalDataServiceFactory,
  registerDataServiceFactory,
  CoordinationServiceAdapter,
  CoordinationServiceFactory,
  coordinationServiceFactory,
  registerCoordinationServiceFactory,
  IntegrationServiceAdapter,
  IntegrationServiceFactory,
  integrationServiceFactory,
  registerIntegrationServiceFactory,
  InfrastructureServiceAdapter,
  InfrastructureServiceFactory,
  getInfrastructureServiceFactory,
  registerInfrastructureServiceFactory,
};
