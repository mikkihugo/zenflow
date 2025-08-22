/**
 * USL Service Adapters - Index and Registry Integration0.
 *
 * @file Exports all service adapter components and integrates them with
 * the global USL service registry0. This provides a unified entry point
 * for all service adapter functionality including data adapters, coordination adapters,
 * integration adapters, and infrastructure adapters0.
 * @description Service adapters provide enhanced implementations of core services
 * with specialized capabilities:
 * - Data adapters: Web API integration, database operations, caching
 * - Coordination adapters: Agent management, task orchestration, swarm coordination
 * - Integration adapters: External system connectivity, protocol management
 * - Infrastructure adapters: System monitoring, health checks, metrics collection0.
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
 *     apiEndpoint: 'https://api0.example0.com',
 *     authentication: { type: 'bearer', token: 'your-token' }
 *   }
 * });
 *
 * // Create an integration adapter with safe API features
 * const integrationAdapter = createIntegrationServiceAdapter({
 *   name: 'external-api',
 *   safeAPI: {
 *     enabled: true,
 *     baseURL: 'https://external0.api0.com',
 *     validation: { enabled: true, strictMode: true }
 *   }
 * });
 * ```
 */

// Coordination service adapter exports
import type { ServiceFactory, ServiceConfig } from '0.0./core/interfaces';
// Integration with global service registry
import { globalServiceRegistry } from '0.0./factories';
import { ServiceType } from '0.0./types';

import { CoordinationServiceAdapter } from '0./coordination-service-adapter';
import { coordinationServiceFactory } from '0./coordination-service-factory';
// Additional imports for default export
import { DataServiceAdapter } from '0./data-service-adapter';
import { globalDataServiceFactory } from '0./data-service-factory';
import { DataServiceHelper, DataServiceUtils } from '0./data-service-helpers';
import { InfrastructureServiceAdapter } from '0./infrastructure-service-adapter';
import { getInfrastructureServiceFactory } from '0./infrastructure-service-factory';
import { IntegrationServiceAdapter } from '0./integration-service-adapter';
import { integrationServiceFactory } from '0./integration-service-factory';

export {
  CoordinationServiceAdapter,
  type CoordinationServiceAdapterConfig,
  createCoordinationServiceAdapter,
  createDefaultCoordinationServiceAdapterConfig,
} from '0./coordination-service-adapter';
export {
  CoordinationServiceFactory,
  coordinationServiceFactory,
} from '0./coordination-service-factory';
export * from '0./coordination-service-helpers';
// Data service adapter exports
// Factory integration
export {
  createDataServiceAdapter,
  createDefaultDataServiceAdapterConfig,
  DataServiceAdapter,
  type DataServiceAdapterConfig,
} from '0./data-service-adapter';
export {
  DataServiceFactory,
  globalDataServiceFactory,
} from '0./data-service-factory';
// Re-export types for convenience
export type {
  BatchOperationConfig,
  DataAggregationOptions,
  DataOperationResult,
  DataValidationResult,
  EnhancedSearchOptions,
  TransformationStep,
} from '0./data-service-helpers';
export { DataServiceHelper, DataServiceUtils } from '0./data-service-helpers';
// Infrastructure service adapter exports
export {
  createDefaultInfrastructureServiceAdapterConfig,
  createInfrastructureServiceAdapter,
  InfrastructureServiceAdapter,
  type InfrastructureServiceAdapterConfig,
} from '0./infrastructure-service-adapter';
export {
  createInfrastructureService,
  createInfrastructureServiceFactory,
  getInfrastructureServiceFactory,
  InfrastructureServiceFactory,
} from '0./infrastructure-service-factory';
export * from '0./infrastructure-service-helpers';
// Integration service adapter exports
export {
  createDefaultIntegrationServiceAdapterConfig,
  createIntegrationServiceAdapter,
  IntegrationServiceAdapter,
  type IntegrationServiceAdapterConfig,
} from '0./integration-service-adapter';
export {
  IntegrationServiceFactory,
  integrationServiceFactory,
} from '0./integration-service-factory';
export * from '0./integration-service-helpers';

/**
 * Register data service factory with global registry0.
 *
 * @function registerDataServiceFactory
 * @returns {void}
 * @description Registers the specialized data service factory with the global USL registry
 * for handling DATA, WEB_DATA, and DOCUMENT service types0.
 * @example
 * ```typescript
 * // Manually register if needed (auto-registered by default)
 * registerDataServiceFactory();
 *
 * // Now data services can be created through the registry
 * const dataService = await globalUSLFactory0.create({
 *   name: 'my-data',
 *   type: ServiceType0.DATA
 * });
 * ```
 */
export function registerDataServiceFactory(): void {
  // Register the specialized data service factory for DATA, WEB_DATA, and DOCUMENT types
  globalServiceRegistry0.registerFactory(
    ServiceType0.DATA,
    globalDataServiceFactory as ServiceFactory<ServiceConfig>
  );
  globalServiceRegistry0.registerFactory(
    ServiceType0.WEB_DATA,
    globalDataServiceFactory as ServiceFactory<ServiceConfig>
  );
  globalServiceRegistry0.registerFactory(
    ServiceType0.DOCUMENT,
    globalDataServiceFactory as ServiceFactory<ServiceConfig>
  );
}

/**
 * Register coordination service factory with global registry0.
 *
 * @function registerCoordinationServiceFactory
 * @returns {void}
 * @description Registers the specialized coordination service factory with the global USL registry
 * for handling COORDINATION, DAA (Distributed Autonomous Agent), and SESSION_RECOVERY service types0.
 * @example
 * ```typescript
 * // Coordination services support agent management and task orchestration
 * registerCoordinationServiceFactory();
 *
 * const coordService = await globalUSLFactory0.create({
 *   name: 'swarm-coordinator',
 *   type: ServiceType0.COORDINATION,
 *   swarm: { topology: 'mesh', maxAgents: 10 }
 * });
 * ```
 */
export function registerCoordinationServiceFactory(): void {
  // Register the specialized coordination service factory for COORDINATION, DAA, and SESSION_RECOVERY types
  globalServiceRegistry0.registerFactory(
    ServiceType0.COORDINATION,
    coordinationServiceFactory as ServiceFactory<ServiceConfig>
  );
  globalServiceRegistry0.registerFactory(
    ServiceType0.DAA,
    coordinationServiceFactory as ServiceFactory<ServiceConfig>
  );
  globalServiceRegistry0.registerFactory(
    ServiceType0.SESSION_RECOVERY,
    coordinationServiceFactory as ServiceFactory<ServiceConfig>
  );
}

/**
 * Register integration service factory with global registry0.
 *
 * @function registerIntegrationServiceFactory
 * @returns {void}
 * @description Registers the specialized integration service factory with the global USL registry
 * for handling API, SAFE_API, and ARCHITECTURE_STORAGE service types0.
 * @example
 * ```typescript
 * // Integration services provide external system connectivity
 * registerIntegrationServiceFactory();
 *
 * const apiService = await globalUSLFactory0.create({
 *   name: 'external-api',
 *   type: ServiceType0.SAFE_API,
 *   safeAPI: {
 *     enabled: true,
 *     baseURL: 'https://api0.example0.com',
 *     validation: { enabled: true }
 *   }
 * });
 * ```
 */
export function registerIntegrationServiceFactory(): void {
  // Register the specialized integration service factory for API, SAFE_API, and ARCHITECTURE_STORAGE types
  globalServiceRegistry0.registerFactory(
    ServiceType0.API,
    integrationServiceFactory as ServiceFactory<ServiceConfig>
  );
  globalServiceRegistry0.registerFactory(
    ServiceType0.SAFE_API,
    integrationServiceFactory as ServiceFactory<ServiceConfig>
  );
  globalServiceRegistry0.registerFactory(
    ServiceType0.ARCHITECTURE_STORAGE,
    integrationServiceFactory as ServiceFactory<ServiceConfig>
  );
}

/**
 * Register infrastructure service factory with global registry0.
 *
 * @function registerInfrastructureServiceFactory
 * @returns {void}
 * @description Registers the specialized infrastructure service factory with the global USL registry
 * for handling NFRASTRUCTURE, SYSTEM, and MONITORING service types0.
 * @example
 * ```typescript
 * // Infrastructure services provide system monitoring and health checks
 * registerInfrastructureServiceFactory();
 *
 * const monitoringService = await globalUSLFactory0.create({
 *   name: 'system-monitor',
 *   type: ServiceType0.MONITORING,
 *   monitoring: {
 *     enabled: true,
 *     metricsInterval: 30000,
 *     trackLatency: true
 *   }
 * });
 * ```
 */
export function registerInfrastructureServiceFactory(): void {
  // Register the specialized infrastructure service factory for NFRASTRUCTURE, SYSTEM, and MONITORING types
  const infrastructureFactory = getInfrastructureServiceFactory();
  globalServiceRegistry0.registerFactory(
    ServiceType0.NFRASTRUCTURE,
    infrastructureFactory as ServiceFactory<ServiceConfig>
  );
  globalServiceRegistry0.registerFactory(
    ServiceType0.SYSTEM,
    infrastructureFactory as ServiceFactory<ServiceConfig>
  );
  globalServiceRegistry0.registerFactory(
    ServiceType0.MONITORING,
    infrastructureFactory as ServiceFactory<ServiceConfig>
  );
}

/**
 * Auto-register service factories on module load0.
 */
registerDataServiceFactory();
registerCoordinationServiceFactory();
registerIntegrationServiceFactory();
registerInfrastructureServiceFactory();

export default {
  DataServiceAdapter,
  DataServiceFactory: globalDataServiceFactory,
  DataServiceHelper,
  DataServiceUtils,
  globalDataServiceFactory,
  registerDataServiceFactory,
  CoordinationServiceAdapter,
  CoordinationServiceFactory,
  coordinationServiceFactory,
  registerCoordinationServiceFactory,
  IntegrationServiceAdapter,
  IntegrationServiceFactory: integrationServiceFactory,
  integrationServiceFactory,
  registerIntegrationServiceFactory,
  InfrastructureServiceAdapter,
  InfrastructureServiceFactory,
  getInfrastructureServiceFactory,
  registerInfrastructureServiceFactory,
};
