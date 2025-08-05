/**
 * USL Data Service Adapters - Index and Registry Integration
 * 
 * Exports all data service adapter components and integrates them with
 * the global USL service registry. This provides a unified entry point
 * for all data service adapter functionality.
 */

// Core adapter exports
export { DataServiceAdapter, type DataServiceAdapterConfig } from './data-service-adapter';
export { DataServiceFactory, globalDataServiceFactory } from './data-service-factory';
export { DataServiceHelper, DataServiceUtils, type DataOperationResult } from './data-service-helpers';

// Factory integration
export {
  createDataServiceAdapter,
  createDefaultDataServiceAdapterConfig
} from './data-service-adapter';

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
 * Auto-register data service factory on module load
 */
registerDataServiceFactory();

export default {
  DataServiceAdapter,
  DataServiceFactory,
  DataServiceHelper,
  DataServiceUtils,
  globalDataServiceFactory,
  registerDataServiceFactory
};