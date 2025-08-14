import { createCommunicationEventAdapter as _createCommunicationEventAdapter, createDefaultCommunicationEventAdapterConfig as _createDefaultCommunicationEventAdapterConfig, CommunicationEventAdapter, CommunicationEventHelpers, } from './communication-event-adapter.ts';
import { CommunicationEventFactory } from './communication-event-factory.ts';
import { createCoordinationEventAdapter as _createCoordinationEventAdapter, createDefaultCoordinationEventAdapterConfig as _createDefaultCoordinationEventAdapterConfig, CoordinationEventAdapter, CoordinationEventHelpers, } from './coordination-event-adapter.ts';
import { CoordinationEventManagerFactory } from './coordination-event-factory.ts';
import { createDefaultMonitoringEventAdapterConfig as _createDefaultMonitoringEventAdapterConfig, createMonitoringEventAdapter as _createMonitoringEventAdapter, MonitoringEventAdapter, MonitoringEventHelpers, } from './monitoring-event-adapter.ts';
import { MonitoringEventFactory } from './monitoring-event-factory.ts';
import { createDefaultSystemEventAdapterConfig as _createDefaultSystemEventAdapterConfig, createSystemEventAdapter as _createSystemEventAdapter, SystemEventAdapter, SystemEventHelpers, } from './system-event-adapter.ts';
import { SystemEventManagerFactory } from './system-event-factory.ts';
export { EventManagerPresets, EventManagerTypes, EventTypeGuards, } from '../core/interfaces.ts';
export { DefaultEventManagerConfigs, EventCategories, EventConstants, EventPriorityMap, EventSources, UELTypeGuards, } from '../types.ts';
export { createCommunicationEventAdapter, createDefaultCommunicationEventAdapterConfig, } from './communication-event-adapter.ts';
export { CommunicationEventAdapter, CommunicationEventHelpers, };
export { CommunicationEventFactory, CommunicationEventFactory as CommunicationEventFactoryImpl, communicationEventFactory, createComprehensiveCommunicationAdapter, createHTTPCommunicationAdapter, createMCPCommunicationAdapter, createProtocolCommunicationAdapter, createWebSocketCommunicationAdapter, } from './communication-event-factory.ts';
export { createCoordinationEventAdapter, createDefaultCoordinationEventAdapterConfig, } from './coordination-event-adapter.ts';
export { CoordinationEventAdapter, CoordinationEventHelpers, };
export { CoordinationEventManagerFactory, createAgentManagementEventManager, createComprehensiveCoordinationEventManager, createCoordinationEventManager, createDevelopmentCoordinationEventManager, createHighPerformanceCoordinationEventManager, createProtocolManagementEventManager, createSwarmCoordinationEventManager, createTaskOrchestrationEventManager, } from './coordination-event-factory.ts';
export { createDefaultMonitoringEventAdapterConfig, createMonitoringEventAdapter, } from './monitoring-event-adapter.ts';
export { MonitoringEventAdapter, MonitoringEventHelpers, };
export { MonitoringEventAdapterFactory, MonitoringEventConfigs, MonitoringEventFactory, MonitoringEventManager, MonitoringEventRegistry, } from './monitoring-event-factory.ts';
export { createDefaultSystemEventAdapterConfig, createSystemEventAdapter, } from './system-event-adapter.ts';
export { SystemEventAdapter, SystemEventHelpers };
export { createApplicationCoordinatorEventManager, createComprehensiveSystemEventManager, createCoreSystemEventManager, createErrorRecoveryEventManager, createSystemEventManager, SystemEventManagerFactory, } from './system-event-factory.ts';
export const EventAdapterTypes = {
    SYSTEM: 'system',
    COORDINATION: 'coordination',
    COMMUNICATION: 'communication',
    MONITORING: 'monitoring',
};
export const EventAdapterFactories = {
    [EventAdapterTypes['SYSTEM']]: SystemEventManagerFactory,
    [EventAdapterTypes['COORDINATION']]: CoordinationEventManagerFactory,
    [EventAdapterTypes['COMMUNICATION']]: CommunicationEventFactory,
    [EventAdapterTypes['MONITORING']]: MonitoringEventFactory,
};
export const EventAdapterUtils = {
    createSystemAdapter: (name, overrides) => {
        const config = _createDefaultSystemEventAdapterConfig(name, overrides);
        return _createSystemEventAdapter(config);
    },
    createCoordinationAdapter: (name, overrides) => {
        const config = _createDefaultCoordinationEventAdapterConfig(name, overrides);
        return _createCoordinationEventAdapter(config);
    },
    createCommunicationAdapter: (name, overrides) => {
        const config = _createDefaultCommunicationEventAdapterConfig(name, overrides);
        return _createCommunicationEventAdapter(config);
    },
    createMonitoringAdapter: (name, overrides) => {
        const config = _createDefaultMonitoringEventAdapterConfig(name, overrides);
        return _createMonitoringEventAdapter(config);
    },
    createSystemFactory: () => new SystemEventManagerFactory(),
    createCoordinationFactory: () => new CoordinationEventManagerFactory(),
    createCommunicationFactory: () => new CommunicationEventFactory(),
    createMonitoringFactory: () => new MonitoringEventFactory(),
    getAdapterTypes: () => Object.values(EventAdapterTypes),
    isAdapterTypeSupported: (type) => {
        return Object.values(EventAdapterTypes).includes(type);
    },
};
export default {
    SystemEventAdapter: SystemEventAdapter,
    SystemEventManagerFactory: SystemEventManagerFactory,
    CoordinationEventAdapter: CoordinationEventAdapter,
    CoordinationEventManagerFactory: CoordinationEventManagerFactory,
    CommunicationEventAdapter: CommunicationEventAdapter,
    CommunicationEventFactory: CommunicationEventFactory,
    MonitoringEventAdapter: MonitoringEventAdapter,
    MonitoringEventFactory: MonitoringEventFactory,
    EventAdapterTypes: EventAdapterTypes,
    EventAdapterFactories: EventAdapterFactories,
    EventAdapterUtils: EventAdapterUtils,
    SystemEventHelpers,
    CoordinationEventHelpers,
    CommunicationEventHelpers,
    MonitoringEventHelpers,
};
//# sourceMappingURL=index.js.map