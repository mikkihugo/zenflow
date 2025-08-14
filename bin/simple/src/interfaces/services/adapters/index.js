export { CoordinationServiceAdapter, createCoordinationServiceAdapter, createDefaultCoordinationServiceAdapterConfig, } from './coordination-service-adapter.ts';
export { CoordinationServiceFactory, coordinationServiceFactory, } from './coordination-service-factory.ts';
export * from './coordination-service-helpers.ts';
export { createDataServiceAdapter, createDefaultDataServiceAdapterConfig, DataServiceAdapter, } from './data-service-adapter.ts';
export { DataServiceFactory, globalDataServiceFactory, } from './data-service-factory.ts';
export { DataServiceHelper, DataServiceUtils, } from './data-service-helpers.ts';
export { createDefaultInfrastructureServiceAdapterConfig, createInfrastructureServiceAdapter, InfrastructureServiceAdapter, } from './infrastructure-service-adapter.ts';
export { createInfrastructureService, createInfrastructureServiceFactory, getInfrastructureServiceFactory, InfrastructureServiceFactory, } from './infrastructure-service-factory.ts';
export * from './infrastructure-service-helpers.ts';
export { createDefaultIntegrationServiceAdapterConfig, createIntegrationServiceAdapter, IntegrationServiceAdapter, } from './integration-service-adapter.ts';
export { IntegrationServiceFactory, integrationServiceFactory, } from './integration-service-factory.ts';
export * from './integration-service-helpers.ts';
import { globalServiceRegistry } from '../factories.ts';
import { ServiceType } from '../types.ts';
import { CoordinationServiceAdapter } from './coordination-service-adapter.ts';
import { coordinationServiceFactory } from './coordination-service-factory.ts';
import { DataServiceAdapter } from './data-service-adapter.ts';
import { globalDataServiceFactory } from './data-service-factory.ts';
import { DataServiceHelper, DataServiceUtils } from './data-service-helpers.ts';
import { InfrastructureServiceAdapter } from './infrastructure-service-adapter.ts';
import { getInfrastructureServiceFactory } from './infrastructure-service-factory.ts';
import { IntegrationServiceAdapter } from './integration-service-adapter.ts';
import { integrationServiceFactory } from './integration-service-factory.ts';
export function registerDataServiceFactory() {
    globalServiceRegistry.registerFactory(ServiceType.DATA, globalDataServiceFactory);
    globalServiceRegistry.registerFactory(ServiceType.WEB_DATA, globalDataServiceFactory);
    globalServiceRegistry.registerFactory(ServiceType.DOCUMENT, globalDataServiceFactory);
}
export function registerCoordinationServiceFactory() {
    globalServiceRegistry.registerFactory(ServiceType.COORDINATION, coordinationServiceFactory);
    globalServiceRegistry.registerFactory(ServiceType.DAA, coordinationServiceFactory);
    globalServiceRegistry.registerFactory(ServiceType.SESSION_RECOVERY, coordinationServiceFactory);
}
export function registerIntegrationServiceFactory() {
    globalServiceRegistry.registerFactory(ServiceType.API, integrationServiceFactory);
    globalServiceRegistry.registerFactory(ServiceType.SAFE_API, integrationServiceFactory);
    globalServiceRegistry.registerFactory(ServiceType.ARCHITECTURE_STORAGE, integrationServiceFactory);
}
export function registerInfrastructureServiceFactory() {
    const infrastructureFactory = getInfrastructureServiceFactory();
    globalServiceRegistry.registerFactory(ServiceType.INFRASTRUCTURE, infrastructureFactory);
    globalServiceRegistry.registerFactory(ServiceType.SYSTEM, infrastructureFactory);
    globalServiceRegistry.registerFactory(ServiceType.MONITORING, infrastructureFactory);
}
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
//# sourceMappingURL=index.js.map