import { EventEmitter } from 'node:events';
import { EventManagerTypes, UEL, UELHelpers, UELSystemIntegration, } from '../index.ts';
export class UELIntegrationExample {
    logger = {
        info: (_msg, ..._args) => { },
        warn: (msg, ...args) => console.warn(`⚠️  ${msg}`, ...args),
        error: (msg, ...args) => console.error(`❌ ${msg}`, ...args),
        debug: (_msg, ..._args) => { },
    };
    async exampleBasicSetup() {
        const uel = UEL.getInstance();
        await uel.initialize({
            enableValidation: true,
            enableCompatibility: true,
            healthMonitoring: true,
            autoRegisterFactories: true,
            logger: this.logger,
        });
        this.logger.info('UEL initialized successfully');
        const systemManager = await uel.createSystemEventManager('example-system', {
            maxListeners: 50,
        });
        const coordManager = await uel.createCoordinationEventManager('example-coordination', {
            maxListeners: 30,
        });
        this.logger.info('Event managers created');
        const systemEvent = {
            id: `sys-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date(),
            source: 'integration-example',
            type: 'system:startup',
            operation: 'start',
            status: 'success',
            details: {
                component: 'example-system',
                version: '1.0.0',
                features: ['validation', 'compatibility', 'monitoring'],
            },
        };
        const coordEvent = {
            id: `coord-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
            timestamp: new Date(),
            source: 'integration-example',
            type: 'coordination:agent',
            operation: 'spawn',
            targetId: 'example-agent-001',
            details: {
                agentType: 'example',
                capabilities: ['demonstration', 'testing'],
            },
        };
        const systemSubscription = systemManager.subscribe(['system:*'], (event) => {
            this.logger.info(`System event received: ${event.type}`, event['details']);
        });
        const coordSubscription = coordManager.subscribe(['coordination:*'], (event) => {
            this.logger.info(`Coordination event received: ${event.type}`, event['details']);
        });
        await systemManager.emit(systemEvent);
        await coordManager.emit(coordEvent);
        const systemStatus = await uel.getSystemStatus();
        this.logger.info('System status:', {
            initialized: systemStatus.initialized,
            totalManagers: systemStatus.factoryStats.totalManagers,
            healthPercentage: systemStatus.healthPercentage || 'N/A',
        });
        systemSubscription.unsubscribe();
        coordSubscription.unsubscribe();
        this.logger.info('Basic setup example completed');
    }
    async exampleSystemMigration() {
        const legacyEventBus = new EventEmitter();
        legacyEventBus.setMaxListeners(100);
        const legacyCoordinator = new EventEmitter();
        legacyCoordinator.setMaxListeners(50);
        const legacyObserver = new EventEmitter();
        legacyObserver.setMaxListeners(20);
        legacyEventBus.on('data-processed', (data) => {
            this.logger.debug('Legacy: Data processed', data);
        });
        legacyCoordinator.on('agent-spawned', (agent) => {
            this.logger.debug('Legacy: Agent spawned', agent);
        });
        legacyObserver.on('metric-collected', (metric) => {
            this.logger.debug('Legacy: Metric collected', metric);
        });
        legacyEventBus.emit('data-processed', { id: 1, type: 'test' });
        legacyCoordinator.emit('agent-spawned', {
            id: 'agent-001',
            type: 'worker',
        });
        legacyObserver.emit('metric-collected', { name: 'cpu', value: 45 });
        this.logger.info('Legacy systems created and tested');
        const uel = UEL.getInstance();
        if (!uel.isInitialized()) {
            await uel.initialize({
                enableValidation: true,
                enableCompatibility: true,
                logger: this.logger,
            });
        }
        const systems = {
            eventBus: legacyEventBus,
            coordinator: legacyCoordinator,
            observer: legacyObserver,
        };
        const analysis = await uel.analyzeSystemEventEmitters(systems);
        this.logger.info('Migration analysis:', {
            recommendations: analysis.migrationRecommendations.slice(0, 3),
        });
        const migrationResult = await UELHelpers.migrateSystemToUEL(systems);
        if (migrationResult?.migrationReport?.success) {
            this.logger.info('Migration successful!', {
                migratedSystems: migrationResult?.migrationReport?.migratedSystems,
                errors: migrationResult?.migrationReport?.errors,
            });
            const { eventBus, applicationCoordinator, observerSystem } = migrationResult;
            if (eventBus) {
                eventBus.on('migrated-event', (data) => {
                    this.logger.info('Migrated event bus received:', data);
                });
                eventBus.emit('migrated-event', { message: 'Migration successful!' });
                eventBus.mapEventToUEL('migrated-event', 'system:migration-complete');
                const busStatus = eventBus.getStatus();
                this.logger.info('Enhanced event bus status:', busStatus);
            }
            if (applicationCoordinator) {
                const _coordStatus = await applicationCoordinator.getSystemStatus();
                this.logger.info('Enhanced application coordinator initialized');
            }
            if (observerSystem) {
                const observerStatus = observerSystem.getStatus();
                this.logger.info('Enhanced observer system status:', observerStatus);
            }
        }
        else {
            this.logger.error('Migration failed:', migrationResult?.migrationReport?.errors);
        }
        this.logger.info('System migration example completed');
    }
    async exampleCompleteSystemSetup() {
        const completeSystem = await UELHelpers.setupCompleteUELSystem({
            systemComponents: {
                eventBus: true,
                applicationCoordinator: true,
                observerSystem: true,
            },
            eventManagers: {
                system: true,
                coordination: true,
                communication: true,
                monitoring: true,
                interface: true,
            },
            validation: true,
            compatibility: true,
            healthMonitoring: true,
        });
        this.logger.info('Complete system setup status:', completeSystem.status);
        if (completeSystem.status.errors.length > 0) {
            this.logger.error('Setup errors:', completeSystem.status.errors);
        }
        const { uel, systems, eventManagers } = completeSystem;
        if (systems.eventBus) {
            this.logger.info('Testing enhanced event bus...');
            systems.eventBus.on('complete-setup-test', (data) => {
                this.logger.info('Enhanced event bus test:', data);
            });
            systems.eventBus.emit('complete-setup-test', {
                message: 'Complete system setup working!',
                timestamp: new Date(),
            });
            systems.eventBus.mapEventToUEL('complete-setup-test', 'system:integration-test');
        }
        if (eventManagers.system) {
            this.logger.info('Testing system event manager...');
            await eventManagers.system.emit({
                id: `complete-${Date.now()}`,
                timestamp: new Date(),
                source: 'complete-setup-example',
                type: 'system:test',
                operation: 'test',
                status: 'success',
                details: { testType: 'complete-system-setup' },
            });
        }
        if (eventManagers.coordination) {
            this.logger.info('Testing coordination event manager...');
            await eventManagers.coordination.emit({
                id: `coord-complete-${Date.now()}`,
                timestamp: new Date(),
                source: 'complete-setup-example',
                type: 'coordination:test',
                operation: 'test',
                targetId: 'complete-setup-target',
                details: { testType: 'complete-coordination-setup' },
            });
        }
        const systemStatus = await uel.getSystemStatus();
        this.logger.info('Final system status:', {
            initialized: systemStatus.initialized,
            components: systemStatus.components,
            totalManagers: systemStatus.factoryStats?.totalManagers || 0,
            componentsCreated: completeSystem.status.componentsCreated,
        });
        this.logger.info('Complete system setup example completed');
    }
    async exampleValidationAndMonitoring() {
        const uel = UEL.getInstance();
        if (!uel.isInitialized()) {
            await uel.initialize({
                enableValidation: true,
                enableCompatibility: true,
                healthMonitoring: true,
                logger: this.logger,
            });
        }
        const validationResult = await UELHelpers.performCompleteValidation({
            includeHealthCheck: true,
            includeIntegrationCheck: true,
            includeSampleEvents: true,
            exportReport: false,
        });
        this.logger.info('Validation results:', {
            passed: validationResult?.summary?.passed,
            score: validationResult?.summary?.score,
            criticalIssues: validationResult?.summary?.criticalIssues,
            recommendations: validationResult?.summary?.recommendations,
        });
        const quickStatus = await UELHelpers.getQuickStatus();
        this.logger.info('Quick system status:', quickStatus);
        const healthCheck = await UELHelpers.performHealthCheck();
        this.logger.info('Health check results:', Object.keys(healthCheck).length, 'managers checked');
        const systemStatus = await uel.getSystemStatus();
        const globalMetrics = systemStatus.factoryStats || {};
        this.logger.info('Global metrics:', {
            totalManagers: globalMetrics.totalManagers,
            totalEvents: globalMetrics.totalEvents,
            totalSubscriptions: globalMetrics.totalSubscriptions,
            averageLatency: globalMetrics.averageLatency,
            errorRate: globalMetrics.errorRate,
        });
        const validationFramework = uel.getValidationFramework();
        if (!validationFramework) {
            this.logger.warn('Validation framework not available');
            return;
        }
        validationFramework.registerEventTypeSchema('example:custom', {
            required: ['id', 'timestamp', 'customField'],
            properties: {
                customField: { type: 'string', enum: ['test', 'demo', 'production'] },
                priority: { type: 'number', minimum: 1, maximum: 5 },
            },
            additionalProperties: true,
        });
        const customEvent = {
            id: 'custom-001',
            timestamp: new Date(),
            source: 'validation-example',
            type: 'example:custom',
            customField: 'test',
            priority: 3,
            details: { example: true },
        };
        const customValidation = validationFramework?.validateEventType
            ? validationFramework.validateEventType(customEvent)
            : { valid: true, score: 100, errors: [], warnings: [] };
        this.logger.info('Custom event validation:', {
            valid: customValidation.valid,
            score: customValidation.score,
            errors: customValidation.errors.length,
            warnings: customValidation.warnings.length,
        });
        this.logger.info('Validation and monitoring example completed');
    }
    async exampleAdvancedIntegrationPatterns() {
        const uel = UEL.getInstance();
        if (!uel.isInitialized()) {
            await uel.initialize({
                enableValidation: true,
                enableCompatibility: true,
                healthMonitoring: true,
                logger: this.logger,
            });
        }
        await UELSystemIntegration.initialize(uel.getEventManager(), this.logger);
        const enhancedEventBus = UELSystemIntegration.factory.createEnhancedEventBus({
            enableUEL: true,
            managerType: EventManagerTypes['SYSTEM'],
            managerName: 'advanced-event-bus',
            maxListeners: 200,
        });
        const enhancedCoordinator = UELSystemIntegration.factory.createEnhancedApplicationCoordinator({
            enableUEL: true,
            uelConfig: {
                enableValidation: true,
                enableCompatibility: true,
                healthMonitoring: true,
            },
        });
        const enhancedObserver = UELSystemIntegration.factory.createEnhancedObserverSystem({
            enableUEL: true,
        });
        this.logger.info('Advanced enhanced systems created');
        enhancedEventBus.on('cross-system-event', (data) => {
            this.logger.info('Enhanced event bus received cross-system event:', data);
        });
        const systemObserver = enhancedObserver.createObserver('system-metrics', 'monitoring');
        const performanceObserver = enhancedObserver.createObserver('performance-tracking', 'analytics');
        systemObserver.on('metric-update', (metric) => {
            this.logger.debug('System metric updated:', metric);
        });
        performanceObserver.on('performance-data', (data) => {
            this.logger.debug('Performance data:', data);
        });
        enhancedEventBus.emit('cross-system-event', {
            source: 'advanced-integration',
            message: 'Cross-system communication working',
            timestamp: new Date(),
        });
        systemObserver.emit('metric-update', {
            name: 'memory-usage',
            value: 67.5,
            unit: 'percentage',
            timestamp: Date.now(),
        });
        performanceObserver.emit('performance-data', {
            operation: 'event-processing',
            duration: 15.3,
            throughput: 1250,
            timestamp: Date.now(),
        });
        const eventBusStatus = enhancedEventBus.getStatus();
        const coordinatorStatus = await enhancedCoordinator.getSystemStatus();
        const observerStatus = enhancedObserver.getStatus();
        this.logger.info('Advanced system statuses:', {
            eventBus: eventBusStatus,
            coordinator: {
                initialized: coordinatorStatus.applicationCoordinator.initialized,
                uelEnabled: coordinatorStatus.uel.enabled,
            },
            observer: observerStatus,
        });
        const eventBuilder = UELHelpers.createEventBuilder();
        const builtSystemEvent = eventBuilder.system('integration-test', 'success', {
            pattern: 'advanced-integration',
            timestamp: Date.now(),
        });
        const builtCoordEvent = eventBuilder.coordination('pattern-demo', 'advanced-target', {
            pattern: 'builder-pattern',
            phase: 'demonstration',
        });
        this.logger.info('Built events:', {
            system: { id: builtSystemEvent.id, type: builtSystemEvent.type },
            coordination: { id: builtCoordEvent.id, type: builtCoordEvent.type },
        });
        enhancedObserver.removeObserver('system-metrics');
        enhancedObserver.removeObserver('performance-tracking');
        this.logger.info('Advanced integration patterns example completed');
    }
    async runAllExamples() {
        try {
            await this.exampleBasicSetup();
            await this.exampleSystemMigration();
            await this.exampleCompleteSystemSetup();
            await this.exampleValidationAndMonitoring();
            await this.exampleAdvancedIntegrationPatterns();
        }
        catch (error) {
            console.error('\n❌ Example execution failed:', error);
            throw error;
        }
        finally {
            const uel = UEL.getInstance();
            if (uel.isInitialized()) {
                await uel.shutdown();
            }
        }
    }
}
export async function runCompleteIntegrationExample() {
    const example = new UELIntegrationExample();
    await example.runAllExamples();
}
if (require.main === module) {
    runCompleteIntegrationExample().catch((error) => {
        console.error('💥 Example failed:', error);
        process.exit(1);
    });
}
export default UELIntegrationExample;
//# sourceMappingURL=complete-integration-example.js.map