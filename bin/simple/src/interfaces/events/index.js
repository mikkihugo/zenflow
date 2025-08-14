import { getLogger } from '../../config/logging-config.ts';
const logger = getLogger('interfaces-events-index');
export { CommunicationEventAdapter, CommunicationEventFactory, CommunicationEventHelpers, CoordinationEventAdapter, CoordinationEventHelpers, CoordinationEventManagerFactory, createAgentManagementEventManager, createApplicationCoordinatorEventManager, createCommunicationEventAdapter, createComprehensiveCommunicationAdapter, createComprehensiveCoordinationEventManager, createComprehensiveSystemEventManager, createCoordinationEventAdapter, createCoordinationEventManager, createCoreSystemEventManager, createDefaultCommunicationEventAdapterConfig, createDefaultCoordinationEventAdapterConfig, createDefaultMonitoringEventAdapterConfig, createDefaultSystemEventAdapterConfig, createDevelopmentCoordinationEventManager, createErrorRecoveryEventManager, createHighPerformanceCoordinationEventManager, createHTTPCommunicationAdapter, createMCPCommunicationAdapter, createMonitoringEventAdapter, createProtocolCommunicationAdapter, createProtocolManagementEventManager, createSwarmCoordinationEventManager, createSystemEventAdapter, createSystemEventManager, createTaskOrchestrationEventManager, createWebSocketCommunicationAdapter, EventAdapterFactories, EventAdapterTypes, EventAdapterUtils, MonitoringEventAdapter, MonitoringEventAdapterFactory, MonitoringEventHelpers, SystemEventAdapter, SystemEventHelpers, SystemEventManagerFactory, } from './adapters/index.js';
export { CompatibilityFactory } from './compatibility.ts';
export { EventEmissionError, EventError, EventFilterError, EventManagerPresets, EventManagerTypes, EventRetryExhaustedError, EventSubscriptionError, EventTimeoutError, EventTypeGuards, } from './core/interfaces.ts';
export { UELFactory, UELRegistry, } from './factories.ts';
export { EventManager } from './manager.ts';
export { EventRegistry } from './registry.ts';
export { UELEnhancedApplicationCoordinator, UELEnhancedEventBus, UELEnhancedObserverSystem, } from './system-integrations.ts';
export { DefaultEventManagerConfigs, EventCategories, EventConstants, EventPriorityMap, EventSources, EventTypePatterns, UELTypeGuards, } from './types.ts';
export { UELValidationFramework } from './validation.ts';
export { CompatibleEventEmitter, createCompatibleEventEmitter, EventEmitterMigrationHelper, MigrationHelper, UELCompatibleEventEmitter, wrapWithUEL, } from './compatibility.ts';
export { UEL, uel } from './core/uel-singleton.ts';
export { createCommunicationEventBus, createCoordinationEventBus, createEventManager, createMonitoringEventBus, createSystemEventBus, } from './factories.ts';
export { DatabaseObserver, EventBuilder, LoggerObserver, MetricsObserver, SystemEventManager, WebSocketObserver, } from './observer-system.ts';
export { analyzeSystemEventEmitterUsage, enhanceWithUEL, SystemIntegrationFactory, UELSystemIntegration, } from './system-integrations.ts';
import { uel } from './core/uel-singleton.ts';
export const initializeUEL = async (config) => {
    await uel.initialize(config);
};
export const UELHelpers = {
    async initializeCompleteSystem(config = {}) {
        await uel.initialize({
            enableValidation: config.enableValidation !== false,
            enableCompatibility: config.enableCompatibility !== false,
            healthMonitoring: config.healthMonitoring !== false,
            autoRegisterFactories: config.autoRegisterFactories !== false,
            logger: config.logger || undefined,
        });
        return uel;
    },
    async setupCommonEventManagers(config = {}) {
        await uel.initialize();
        const managers = {};
        try {
            const eventManager = config?.useIntegratedManager
                ? uel.getEventManager()
                : null;
            if (config?.systemEvents !== false) {
                managers.system = eventManager
                    ? await eventManager.createSystemEventManager('common-system', config?.customConfig?.['system'])
                    : await uel.createSystemEventManager('common-system', config?.customConfig?.['system']);
            }
            if (config?.coordinationEvents !== false) {
                managers.coordination = eventManager
                    ? await eventManager.createCoordinationEventManager('common-coordination', config?.customConfig?.['coordination'])
                    : await uel.createCoordinationEventManager('common-coordination', config?.customConfig?.['coordination']);
            }
            if (config?.communicationEvents !== false) {
                managers.communication = eventManager
                    ? await eventManager.createCommunicationEventManager('common-communication', config?.customConfig?.['communication'])
                    : await uel.createCommunicationEventManager('common-communication', config?.customConfig?.['communication']);
            }
            if (config?.monitoringEvents !== false) {
                managers.monitoring = eventManager
                    ? await eventManager.createMonitoringEventManager('common-monitoring', config?.customConfig?.['monitoring'])
                    : await uel.createMonitoringEventManager('common-monitoring', config?.customConfig?.['monitoring']);
            }
            if (config?.interfaceEvents !== false) {
                managers.interface = eventManager
                    ? await eventManager.createInterfaceEventManager('common-interface', config?.customConfig?.['interface'])
                    : await uel.createInterfaceEventManager('common-interface', config?.customConfig?.['interface']);
            }
            return managers;
        }
        catch (error) {
            logger.error('❌ Failed to setup common event managers:', error);
            throw error;
        }
    },
    async migrateObserverSystem(observerSystem) {
        const results = {
            success: true,
            migratedManagers: [],
            errors: [],
            recommendations: [],
        };
        try {
            await uel.initialize({ enableCompatibility: true });
            if (observerSystem &&
                typeof observerSystem.emit === 'function') {
                const compatible = await uel.migrateEventEmitter(observerSystem, 'migrated-observer', 'system');
                if (compatible) {
                    results.migratedManagers.push('migrated-observer');
                }
                else {
                    results.errors.push('Failed to migrate main observer system');
                }
            }
            if (observerSystem) {
                const analysis = uel
                    .getCompatibilityFactory()
                    ?.getMigrationHelper()
                    ?.analyzeEventEmitter(observerSystem);
                if (analysis) {
                    results.recommendations.push(...analysis.recommendations);
                }
            }
            results.success = results.errors.length === 0;
            return results;
        }
        catch (error) {
            results.success = false;
            results.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return results;
        }
    },
    async getQuickStatus() {
        if (!uel.isInitialized()) {
            return {
                initialized: false,
                totalManagers: 0,
                healthyManagers: 0,
                healthPercentage: 0,
                status: 'critical',
            };
        }
        const healthStatus = await uel.getHealthStatus();
        const healthyManagers = healthStatus.filter((status) => status.status === 'healthy').length;
        const totalManagers = healthStatus.length;
        const healthPercentage = totalManagers > 0 ? (healthyManagers / totalManagers) * 100 : 100;
        const status = healthPercentage >= 80
            ? 'healthy'
            : healthPercentage >= 50
                ? 'warning'
                : 'critical';
        return {
            initialized: true,
            totalManagers,
            healthyManagers,
            healthPercentage,
            status,
        };
    },
    async performHealthCheck() {
        const healthStatus = await uel.getHealthStatus();
        return healthStatus.reduce((acc, status) => {
            acc[status.name] = {
                healthy: status.status === 'healthy',
                details: {
                    status: status.status,
                    subscriptions: status.subscriptions,
                    queueSize: status.queueSize,
                    errorRate: status.errorRate,
                    uptime: status.uptime,
                    lastCheck: status.lastCheck,
                    metadata: status.metadata,
                },
            };
            return acc;
        }, {});
    },
    async migrateSystemToUEL(systems) {
        await uel.initialize({
            enableValidation: true,
            enableCompatibility: true,
            healthMonitoring: true,
        });
        const migrationReport = {
            success: true,
            migratedSystems: [],
            errors: [],
            recommendations: [],
        };
        const result = {};
        try {
            if (systems.eventBus) {
                try {
                    result.eventBus = await uel.createEnhancedEventBus({
                        enableUEL: true,
                        managerName: 'migrated-event-bus',
                    });
                    migrationReport.migratedSystems.push('eventBus');
                }
                catch (error) {
                    migrationReport.errors.push(`Event Bus migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            if (systems.applicationCoordinator) {
                try {
                    result.applicationCoordinator =
                        await uel.createEnhancedApplicationCoordinator({
                            enableUEL: true,
                            uelConfig: {
                                enableValidation: true,
                                enableCompatibility: true,
                                healthMonitoring: true,
                            },
                        });
                    migrationReport.migratedSystems.push('applicationCoordinator');
                }
                catch (error) {
                    migrationReport.errors.push(`Application Coordinator migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            if (systems.observerSystem) {
                try {
                    result.observerSystem = await uel.createEnhancedObserverSystem({
                        enableUEL: true,
                    });
                    migrationReport.migratedSystems.push('observerSystem');
                }
                catch (error) {
                    migrationReport.errors.push(`Observer System migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            const otherSystems = {};
            Object.entries(systems).forEach(([name, system]) => {
                if (!['eventBus', 'applicationCoordinator', 'observerSystem'].includes(name)) {
                    otherSystems[name] = system;
                }
            });
            if (Object.keys(otherSystems).length > 0) {
                const analysis = await uel.analyzeSystemEventEmitters(otherSystems);
                migrationReport.recommendations.push(...analysis.migrationRecommendations);
            }
            migrationReport.success = migrationReport.errors.length === 0;
            return {
                ...result,
                migrationReport,
            };
        }
        catch (error) {
            migrationReport.success = false;
            migrationReport.errors.push(`System migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return { migrationReport };
        }
    },
    async setupCompleteUELSystem(options) {
        const status = {
            initialized: false,
            componentsCreated: 0,
            errors: [],
        };
        try {
            await uel.initialize({
                enableValidation: options?.validation !== false,
                enableCompatibility: options?.compatibility !== false,
                healthMonitoring: options?.healthMonitoring !== false,
                autoRegisterFactories: true,
            });
            status.initialized = true;
            const systems = {};
            const eventManagers = {};
            if (options?.systemComponents?.eventBus !== false) {
                try {
                    systems.eventBus = await uel.createEnhancedEventBus();
                    status.componentsCreated++;
                }
                catch (error) {
                    status.errors.push(`Event Bus creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            if (options?.systemComponents?.applicationCoordinator !== false) {
                try {
                    systems.applicationCoordinator =
                        await uel.createEnhancedApplicationCoordinator();
                    status.componentsCreated++;
                }
                catch (error) {
                    status.errors.push(`Application Coordinator creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            if (options?.systemComponents?.observerSystem !== false) {
                try {
                    systems.observerSystem = await uel.createEnhancedObserverSystem();
                    status.componentsCreated++;
                }
                catch (error) {
                    status.errors.push(`Observer System creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            const managerOptions = options?.eventManagers || {};
            if (managerOptions?.system !== false) {
                try {
                    eventManagers.system =
                        await uel.createSystemEventManager('complete-system');
                    status.componentsCreated++;
                }
                catch (error) {
                    status.errors.push(`System Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            if (managerOptions?.coordination !== false) {
                try {
                    eventManagers.coordination = await uel.createCoordinationEventManager('complete-coordination');
                    status.componentsCreated++;
                }
                catch (error) {
                    status.errors.push(`Coordination Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            if (managerOptions?.communication !== false) {
                try {
                    eventManagers.communication =
                        await uel.createCommunicationEventManager('complete-communication');
                    status.componentsCreated++;
                }
                catch (error) {
                    status.errors.push(`Communication Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            if (managerOptions?.monitoring !== false) {
                try {
                    eventManagers.monitoring = await uel.createMonitoringEventManager('complete-monitoring');
                    status.componentsCreated++;
                }
                catch (error) {
                    status.errors.push(`Monitoring Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            if (managerOptions?.interface !== false) {
                try {
                    eventManagers.interface =
                        await uel.createInterfaceEventManager('complete-interface');
                    status.componentsCreated++;
                }
                catch (error) {
                    status.errors.push(`Interface Event Manager creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
            return {
                uel,
                systems,
                eventManagers,
                status,
            };
        }
        catch (error) {
            status.errors.push(`Complete UEL setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                uel,
                systems: {},
                eventManagers: {},
                status,
            };
        }
    },
    async performCompleteValidation(options) {
        try {
            if (!uel.isInitialized()) {
                await uel.initialize({
                    enableValidation: true,
                    enableCompatibility: true,
                });
            }
            const validationFramework = uel.getValidationFramework();
            const eventManager = uel.getEventManager();
            const eventRegistry = uel.getEventRegistry();
            const sampleEvents = options?.includeSampleEvents
                ? [
                    {
                        id: 'test-1',
                        timestamp: new Date(),
                        source: 'validation-test',
                        type: 'system:lifecycle',
                        operation: 'test',
                        status: 'success',
                    },
                    {
                        id: 'test-2',
                        timestamp: new Date(),
                        source: 'validation-test',
                        type: 'coordination:swarm',
                        operation: 'test',
                        targetId: 'test-target',
                    },
                ]
                : undefined;
            const validationResult = await validationFramework.validateComplete(eventManager, eventRegistry, sampleEvents);
            const summary = {
                passed: validationResult?.overall?.valid,
                score: validationResult?.summary?.totalScore,
                criticalIssues: validationResult?.summary?.criticalIssues,
                recommendations: validationResult?.summary?.recommendations,
            };
            let reportPath;
            if (options?.exportReport) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                reportPath = `uel-validation-complete-${timestamp}.json`;
            }
            return {
                validationResult: validationResult,
                reportPath: reportPath || undefined,
                summary: {
                    passed: summary.passed,
                    score: summary.score,
                    criticalIssues: summary.criticalIssues,
                    recommendations: summary.recommendations,
                },
            };
        }
        catch (_error) {
            return {
                validationResult: null,
                summary: {
                    passed: false,
                    score: 0,
                    criticalIssues: 1,
                    recommendations: 0,
                },
            };
        }
    },
    createEventBuilder() {
        return {
            system: (operation, status, details) => ({
                id: `system-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                timestamp: new Date(),
                source: 'uel-system',
                type: `system:${operation}`,
                operation: operation,
                status: status,
                details,
            }),
            coordination: (operation, targetId, details) => ({
                id: `coord-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                timestamp: new Date(),
                source: 'uel-coordination',
                type: `coordination:${operation}`,
                operation: operation,
                targetId,
                details,
            }),
            communication: (operation, protocol, details) => ({
                id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                timestamp: new Date(),
                source: 'uel-communication',
                type: `communication:${operation}`,
                operation: operation,
                protocol: protocol,
                details,
            }),
            monitoring: (operation, component, details) => ({
                id: `mon-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                timestamp: new Date(),
                source: 'uel-monitoring',
                type: `monitoring:${operation}`,
                operation: operation,
                component,
                details,
            }),
            interface: (operation, interfaceType, details) => ({
                id: `int-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                timestamp: new Date(),
                source: 'uel-interface',
                type: `interface:${operation}`,
                operation: operation,
                interface: interfaceType,
                details,
            }),
        };
    },
};
export default uel;
//# sourceMappingURL=index.js.map