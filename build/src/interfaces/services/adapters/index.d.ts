/**
 * USL Service Adapters - Index and Registry Integration.
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
 * - Infrastructure adapters: System monitoring, health checks, metrics collection.
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
export { CoordinationServiceAdapter, type CoordinationServiceAdapterConfig, createCoordinationServiceAdapter, createDefaultCoordinationServiceAdapterConfig, } from './coordination-service-adapter.ts';
export { CoordinationServiceFactory, coordinationServiceFactory, } from './coordination-service-factory.ts';
export * from './coordination-service-helpers.ts';
export { createDataServiceAdapter, createDefaultDataServiceAdapterConfig, DataServiceAdapter, type DataServiceAdapterConfig, } from './data-service-adapter.ts';
export { DataServiceFactory, globalDataServiceFactory } from './data-service-factory.ts';
export type { BatchOperationConfig, DataAggregationOptions, DataOperationResult, DataValidationResult, EnhancedSearchOptions, TransformationStep, } from './data-service-helpers.ts';
export { DataServiceHelper, DataServiceUtils, } from './data-service-helpers.ts';
export { createDefaultInfrastructureServiceAdapterConfig, createInfrastructureServiceAdapter, InfrastructureServiceAdapter, type InfrastructureServiceAdapterConfig, } from './infrastructure-service-adapter.ts';
export { createInfrastructureService, createInfrastructureServiceFactory, getInfrastructureServiceFactory, InfrastructureServiceFactory, } from './infrastructure-service-factory.ts';
export * from './infrastructure-service-helpers.ts';
export { createDefaultIntegrationServiceAdapterConfig, createIntegrationServiceAdapter, IntegrationServiceAdapter, type IntegrationServiceAdapterConfig, } from './integration-service-adapter.ts';
export { IntegrationServiceFactory, integrationServiceFactory, } from './integration-service-factory.ts';
export * from './integration-service-helpers.ts';
import { CoordinationServiceAdapter } from './coordination-service-adapter.ts';
import { DataServiceAdapter } from './data-service-adapter.ts';
import { DataServiceHelper } from './data-service-helpers.ts';
import { InfrastructureServiceAdapter } from './infrastructure-service-adapter.ts';
import { getInfrastructureServiceFactory } from './infrastructure-service-factory.ts';
import { IntegrationServiceAdapter } from './integration-service-adapter.ts';
/**
 * Register data service factory with global registry.
 *
 * @function registerDataServiceFactory
 * @returns {void}
 * @description Registers the specialized data service factory with the global USL registry
 * for handling DATA, WEB_DATA, and DOCUMENT service types.
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
export declare function registerDataServiceFactory(): void;
/**
 * Register coordination service factory with global registry.
 *
 * @function registerCoordinationServiceFactory
 * @returns {void}
 * @description Registers the specialized coordination service factory with the global USL registry
 * for handling COORDINATION, DAA (Distributed Autonomous Agent), and SESSION_RECOVERY service types.
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
export declare function registerCoordinationServiceFactory(): void;
/**
 * Register integration service factory with global registry.
 *
 * @function registerIntegrationServiceFactory
 * @returns {void}
 * @description Registers the specialized integration service factory with the global USL registry
 * for handling API, SAFE_API, and ARCHITECTURE_STORAGE service types.
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
export declare function registerIntegrationServiceFactory(): void;
/**
 * Register infrastructure service factory with global registry.
 *
 * @function registerInfrastructureServiceFactory
 * @returns {void}
 * @description Registers the specialized infrastructure service factory with the global USL registry
 * for handling INFRASTRUCTURE, SYSTEM, and MONITORING service types.
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
export declare function registerInfrastructureServiceFactory(): void;
declare const _default: {
    DataServiceAdapter: typeof DataServiceAdapter;
    DataServiceFactory: import("./data-service-factory.ts").DataServiceFactory;
    DataServiceHelper: typeof DataServiceHelper;
    DataServiceUtils: {
        validateConfiguration(config: Record<string, unknown>, schema: {
            required?: string[];
        }): import("./data-service-helpers.ts").DataValidationResult;
        generateCacheKey(operation: string, params?: Record<string, unknown>, prefix?: string): string;
        estimateDataSize(data: unknown): number;
        deepClone<T>(obj: T): T;
        deepMerge(target: Record<string, unknown>, ...sources: Array<Record<string, unknown>>): Record<string, unknown>;
        createRateLimiter(maxRequests: number, windowMs: number): (key: string) => boolean;
    };
    globalDataServiceFactory: import("./data-service-factory.ts").DataServiceFactory;
    registerDataServiceFactory: typeof registerDataServiceFactory;
    CoordinationServiceAdapter: typeof CoordinationServiceAdapter;
    CoordinationServiceFactory: any;
    coordinationServiceFactory: import("./coordination-service-factory.ts").CoordinationServiceFactory;
    registerCoordinationServiceFactory: typeof registerCoordinationServiceFactory;
    IntegrationServiceAdapter: typeof IntegrationServiceAdapter;
    IntegrationServiceFactory: import("./integration-service-factory.ts").IntegrationServiceFactory;
    integrationServiceFactory: import("./integration-service-factory.ts").IntegrationServiceFactory;
    registerIntegrationServiceFactory: typeof registerIntegrationServiceFactory;
    InfrastructureServiceAdapter: typeof InfrastructureServiceAdapter;
    InfrastructureServiceFactory: any;
    getInfrastructureServiceFactory: typeof getInfrastructureServiceFactory;
    registerInfrastructureServiceFactory: typeof registerInfrastructureServiceFactory;
};
export default _default;
//# sourceMappingURL=index.d.ts.map