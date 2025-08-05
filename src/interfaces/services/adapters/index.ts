/**
 * USL Service Adapters - Index and Registry Integration
 * 
 * Exports all service adapter components and integrates them with
 * the global USL service registry. This provides a unified entry point
 * for all service adapter functionality.
 */

// Data service adapter exports
export { DataServiceAdapter, type DataServiceAdapterConfig } from './data-service-adapter';
export { DataServiceFactory, globalDataServiceFactory } from './data-service-factory';
export { DataServiceHelper, DataServiceUtils, type DataOperationResult } from './data-service-helpers';

// Coordination service adapter exports
export { CoordinationServiceAdapter, type CoordinationServiceAdapterConfig } from './coordination-service-adapter';
export { CoordinationServiceFactory, coordinationServiceFactory } from './coordination-service-factory';
export * from './coordination-service-helpers';

// Integration service adapter exports
export { 
  IntegrationServiceAdapter, 
  type IntegrationServiceAdapterConfig,
  createIntegrationServiceAdapter,
  createDefaultIntegrationServiceAdapterConfig
} from './integration-service-adapter';
export { IntegrationServiceFactory, integrationServiceFactory } from './integration-service-factory';
export * from './integration-service-helpers';

// Infrastructure service adapter exports
export { 
  InfrastructureServiceAdapter, 
  type InfrastructureServiceAdapterConfig,
  createInfrastructureServiceAdapter,
  createDefaultInfrastructureServiceAdapterConfig
} from './infrastructure-service-adapter';
export { 
  InfrastructureServiceFactory, 
  getInfrastructureServiceFactory,
  createInfrastructureServiceFactory,
  createInfrastructureService
} from './infrastructure-service-factory';
export * from './infrastructure-service-helpers';

// Factory integration
export {
  createDataServiceAdapter,
  createDefaultDataServiceAdapterConfig
} from './data-service-adapter';

export {
  createCoordinationServiceAdapter,
  createDefaultCoordinationServiceAdapterConfig
} from './coordination-service-adapter';

export {
  createInfrastructureServiceAdapter,
  createDefaultInfrastructureServiceAdapterConfig
} from './infrastructure-service-adapter';

// Re-export types for convenience
export type {
  DataOperationResult,
  BatchOperationConfig,
  DataValidationResult,
  EnhancedSearchOptions,
  DataAggregationOptions,
  TransformationStep
} from './data-service-helpers';

// Integration with global service registry
import { globalServiceRegistry } from '../factories';
import { globalDataServiceFactory } from './data-service-factory';
import { coordinationServiceFactory } from './coordination-service-factory';
import { integrationServiceFactory } from './integration-service-factory';
import { getInfrastructureServiceFactory } from './infrastructure-service-factory';
import { ServiceType } from '../types';

/**
 * Register data service factory with global registry
 */
export function registerDataServiceFactory(): void {
  // Register the specialized data service factory for DATA, WEB_DATA, and DOCUMENT types
  globalServiceRegistry.registerFactory(ServiceType.DATA, globalDataServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType.WEB_DATA, globalDataServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType.DOCUMENT, globalDataServiceFactory);
}

/**
 * Register coordination service factory with global registry
 */
export function registerCoordinationServiceFactory(): void {
  // Register the specialized coordination service factory for COORDINATION, DAA, and SESSION_RECOVERY types
  globalServiceRegistry.registerFactory(ServiceType.COORDINATION, coordinationServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType.DAA, coordinationServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType.SESSION_RECOVERY, coordinationServiceFactory);
}

/**
 * Register integration service factory with global registry
 */
export function registerIntegrationServiceFactory(): void {
  // Register the specialized integration service factory for API, SAFE_API, and ARCHITECTURE_STORAGE types
  globalServiceRegistry.registerFactory(ServiceType.API, integrationServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType.SAFE_API, integrationServiceFactory);
  globalServiceRegistry.registerFactory(ServiceType.ARCHITECTURE_STORAGE, integrationServiceFactory);
}

/**
 * Register infrastructure service factory with global registry
 */
export function registerInfrastructureServiceFactory(): void {
  // Register the specialized infrastructure service factory for INFRASTRUCTURE, SYSTEM, and MONITORING types
  const infrastructureFactory = getInfrastructureServiceFactory();
  globalServiceRegistry.registerFactory(ServiceType.INFRASTRUCTURE, infrastructureFactory);
  globalServiceRegistry.registerFactory(ServiceType.SYSTEM, infrastructureFactory);
  globalServiceRegistry.registerFactory(ServiceType.MONITORING, infrastructureFactory);
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
  registerInfrastructureServiceFactory
};