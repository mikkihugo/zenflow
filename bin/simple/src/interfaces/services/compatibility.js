import { getLogger } from '../../config/logging-config.ts';
import { ServiceManager } from './manager.ts';
import { ServicePriority, ServiceType, } from './types.ts';
export class USLCompatibilityLayer {
    serviceManager;
    logger;
    config;
    uslInstance;
    migrationLog = [];
    constructor(config) {
        this.logger = getLogger('USLCompatibility');
        this.serviceManager = new ServiceManager();
        this.config = {
            warnOnLegacyUsage: config?.warnOnLegacyUsage ?? true,
            autoMigrate: config?.autoMigrate ?? true,
            legacyPatterns: config?.legacyPatterns || this.getDefaultLegacyPatterns(),
            serviceMappings: config?.serviceMappings || this.getDefaultServiceMappings(),
            configTransformations: config?.configTransformations || this.getDefaultConfigTransformations(),
        };
    }
    async initialize() {
        await this.serviceManager.initialize();
        this.logger.info('USL Compatibility Layer initialized');
    }
    setUSLInstance(uslInstance) {
        this.uslInstance = uslInstance;
    }
    async createWebDataService(name, options) {
        this.logLegacyUsage('createWebDataService', 'serviceManager.createWebDataService()');
        if (this.config.autoMigrate) {
            return await this.serviceManager.createWebDataService(name, options);
        }
        if (!this.uslInstance) {
            throw new Error('USL instance not set. Call setUSLInstance() before using compatibility layer.');
        }
        return await this.uslInstance.createWebDataService(name, options);
    }
    async createDocumentService(name, dbType, options) {
        this.logLegacyUsage('createDocumentService', 'serviceManager.createDocumentService()');
        if (this.config.autoMigrate) {
            return await this.serviceManager.createDocumentService(name, dbType || 'postgresql', options);
        }
        if (!this.uslInstance) {
            throw new Error('USL instance not set. Call setUSLInstance() before using compatibility layer.');
        }
        return await this.uslInstance.createDocumentService(name, dbType, options);
    }
    async createDAAService(name, options) {
        this.logLegacyUsage('createDAAService', 'serviceManager.createDaaService()');
        if (this.config.autoMigrate) {
            return await this.serviceManager.createDaaService(name, options);
        }
        if (!this.uslInstance) {
            throw new Error('USL instance not set. Call setUSLInstance() before using compatibility layer.');
        }
        return await this.uslInstance.createCoordinationService(name, {
            type: ServiceType.DAA,
            ...options,
        });
    }
    async createSessionRecoveryService(name, options) {
        this.logLegacyUsage('createSessionRecoveryService', 'serviceManager.createSessionRecoveryService()');
        if (this.config.autoMigrate) {
            return await this.serviceManager.createSessionRecoveryService(name, options);
        }
        if (!this.uslInstance) {
            throw new Error('USL instance not set. Call setUSLInstance() before using compatibility layer.');
        }
        return await this.uslInstance.createCoordinationService(name, {
            type: ServiceType.SESSION_RECOVERY,
            ...options,
        });
    }
    async createArchitectureStorageService(name, dbType, options) {
        this.logLegacyUsage('createArchitectureStorageService', 'serviceManager.createArchitectureStorageService()');
        if (this.config.autoMigrate) {
            return await this.serviceManager.createArchitectureStorageService(name, dbType || 'postgresql', options);
        }
        if (!this.uslInstance) {
            throw new Error('USL instance not set. Call setUSLInstance() before using compatibility layer.');
        }
        return await this.uslInstance.createArchitectureStorageService(name, dbType, options);
    }
    async createSafeAPIService(name, baseURL, options) {
        this.logLegacyUsage('createSafeAPIService', 'serviceManager.createSafeAPIService()');
        if (this.config.autoMigrate) {
            return await this.serviceManager.createSafeAPIService(name, baseURL, options);
        }
        if (!this.uslInstance) {
            throw new Error('USL instance not set. Call setUSLInstance() before using compatibility layer.');
        }
        return await this.uslInstance.createSafeAPIService(name, baseURL, options);
    }
    getService(name) {
        this.logLegacyUsage('getService', 'serviceManager.getService()');
        return this.serviceManager.getService(name);
    }
    getAllServices() {
        this.logLegacyUsage('getAllServices', 'serviceManager.getAllServices()');
        return this.serviceManager.getAllServices();
    }
    async startAll() {
        this.logLegacyUsage('startAll', 'serviceManager.startAllServices()');
        return await this.serviceManager.startAllServices();
    }
    async stopAll() {
        this.logLegacyUsage('stopAll', 'serviceManager.stopAllServices()');
        return await this.serviceManager.stopAllServices();
    }
    async getSystemStatus() {
        this.logLegacyUsage('getSystemStatus', 'serviceManager.getSystemHealth()');
        const health = await this.serviceManager.getSystemHealth();
        return {
            status: health.overall,
            services: Array.from(health.services.entries()).map(([name, status]) => ({
                name,
                status: status.health,
                lifecycle: status.lifecycle,
                uptime: status.uptime,
                errors: status.errorCount,
            })),
            summary: health.summary,
        };
    }
    async migrateExistingServices(services) {
        this.logger.info(`Migrating ${Object.keys(services).length} existing services to USL`);
        const migrated = [];
        const failed = [];
        const warnings = [];
        for (const [serviceName, serviceInstance] of Object.entries(services)) {
            try {
                const detectedType = this.detectServiceType(serviceInstance);
                const migratedConfig = this.transformServiceConfig(serviceInstance);
                if (!detectedType) {
                    warnings.push(`Could not detect service type for ${serviceName}, skipping migration`);
                    continue;
                }
                const newService = await this.serviceManager.createService({
                    name: serviceName,
                    type: detectedType,
                    config: migratedConfig,
                });
                migrated.push(newService);
                this.logMigration(serviceName, detectedType, 'Successfully migrated service to USL');
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                failed.push({ name: serviceName, error: errorMessage });
                this.logger.error(`Failed to migrate service ${serviceName}:`, error);
            }
        }
        this.logger.info(`Migration complete: ${migrated.length} migrated, ${failed.length} failed, ${warnings.length} warnings`);
        return { migrated, failed, warnings };
    }
    generateMigrationGuide(codePatterns) {
        const replacements = [];
        const manualSteps = [];
        let automaticCount = 0;
        let manualCount = 0;
        codePatterns.forEach((pattern) => {
            const legacyPattern = this.config.legacyPatterns.find((lp) => pattern.includes(lp.pattern));
            if (legacyPattern) {
                replacements.push({
                    pattern: legacyPattern.pattern,
                    replacement: legacyPattern.replacement,
                    explanation: legacyPattern.migrationGuide,
                    automatic: legacyPattern.autoMigration,
                });
                if (legacyPattern.autoMigration) {
                    automaticCount++;
                }
                else {
                    manualCount++;
                    manualSteps.push(legacyPattern.migrationGuide);
                }
            }
        });
        manualSteps.push('Update import statements to use USL exports', 'Review service configurations for new options', 'Update error handling for new error types', 'Test service interactions and dependencies', 'Update monitoring and logging integration');
        return {
            replacements,
            manualSteps,
            estimatedEffort: {
                automaticReplacements: automaticCount,
                manualChanges: manualCount + manualSteps.length,
                testingRequired: true,
            },
        };
    }
    getMigrationStatus() {
        const totalPatterns = this.config.legacyPatterns.length;
        const migratedPatterns = this.migrationLog.filter((log) => log.type === 'migration').length;
        const completionPercentage = totalPatterns > 0 ? (migratedPatterns / totalPatterns) * 100 : 100;
        const recommendations = [];
        if (completionPercentage < 100) {
            recommendations.push('Continue migrating legacy service patterns to USL');
            recommendations.push('Review and update service creation calls');
            recommendations.push('Update configuration patterns to use new USL types');
        }
        if (this.migrationLog.filter((log) => log.type === 'warning').length > 0) {
            recommendations.push('Address legacy usage warnings');
            recommendations.push('Consider enabling auto-migration for supported patterns');
        }
        return {
            legacyUsageCount: this.migrationLog.filter((log) => log.type === 'warning').length,
            migrationLog: this.migrationLog,
            recommendations,
            completionPercentage,
        };
    }
    async migrateFacadeToUSL() {
        const warnings = [];
        const errors = [];
        try {
            this.logger.info('Migrating ClaudeZenFacade to USL infrastructure services');
            const facadeService = await this.serviceManager.createFacadeService('enhanced-facade', {
                facade: {
                    enabled: true,
                    autoInitialize: true,
                    enableCaching: true,
                    enableMetrics: true,
                    enableHealthChecks: true,
                    systemStatusInterval: 30000,
                },
                patternIntegration: {
                    enabled: true,
                    configProfile: 'default',
                    enableEventSystem: true,
                    enableCommandSystem: true,
                    enableProtocolSystem: true,
                    enableAgentSystem: true,
                },
            });
            this.logMigration('ClaudeZenFacade', ServiceType.INFRASTRUCTURE, 'Migrated facade to USL infrastructure service');
            return {
                success: true,
                facadeService,
                warnings,
                errors,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(`Facade migration failed: ${errorMessage}`);
            this.logger.error('Facade migration failed:', error);
            return {
                success: false,
                warnings,
                errors,
            };
        }
    }
    async migratePatternIntegrationToUSL() {
        const warnings = [];
        const errors = [];
        try {
            this.logger.info('Migrating pattern integration systems to USL');
            const patternService = await this.serviceManager.createPatternIntegrationService('enhanced-pattern-integration', 'production', {
                patternIntegration: {
                    enabled: true,
                    configProfile: 'production',
                    enableEventSystem: true,
                    enableCommandSystem: true,
                    enableProtocolSystem: true,
                    enableAgentSystem: true,
                },
                orchestration: {
                    enableServiceDiscovery: true,
                    enableLoadBalancing: true,
                    enableCircuitBreaker: true,
                    maxConcurrentServices: 50,
                    serviceStartupTimeout: 30000,
                    shutdownGracePeriod: 10000,
                },
            });
            this.logMigration('PatternIntegration', ServiceType.INFRASTRUCTURE, 'Migrated pattern integration to USL infrastructure service');
            return {
                success: true,
                patternService,
                warnings,
                errors,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            errors.push(`Pattern integration migration failed: ${errorMessage}`);
            this.logger.error('Pattern integration migration failed:', error);
            return {
                success: false,
                warnings,
                errors,
            };
        }
    }
    async migrateServiceDiscovery(existingServiceReferences) {
        const warnings = [];
        const migrationPlan = [];
        for (const serviceRef of existingServiceReferences) {
            const mapping = this.config.serviceMappings[serviceRef.name];
            const newPattern = mapping
                ? `serviceManager.getService('${mapping.newName}')`
                : `serviceManager.getService('${serviceRef.name}')`;
            const autoMigration = this.canAutoMigratePattern(serviceRef.currentPattern);
            migrationPlan.push({
                service: serviceRef.name,
                currentPattern: serviceRef.currentPattern,
                newPattern,
                location: serviceRef.location,
                autoMigration,
            });
            if (mapping) {
                warnings.push(`Service '${serviceRef.name}' should be renamed to '${mapping.newName}' (${mapping.migrationNotes})`);
            }
            if (!autoMigration) {
                warnings.push(`Manual migration required for ${serviceRef.name} at ${serviceRef.location}`);
            }
        }
        this.logger.info(`Generated migration plan for ${migrationPlan.length} service references`);
        return {
            success: true,
            migrationPlan,
            warnings,
        };
    }
    getMigrationSummary() {
        const usageCounts = new Map();
        this.migrationLog.forEach((log) => {
            const count = usageCounts.get(log.pattern) || 0;
            usageCounts.set(log.pattern, count + 1);
        });
        const totalLegacyUsages = this.migrationLog.filter((log) => log.type === 'warning').length;
        const migratedPatterns = this.migrationLog.filter((log) => log.type === 'migration').length;
        const remainingMigrations = this.config.legacyPatterns.length - migratedPatterns;
        const migrationPercentage = this.config.legacyPatterns.length > 0
            ? (migratedPatterns / this.config.legacyPatterns.length) * 100
            : 100;
        const mostUsedLegacyPatterns = Array.from(usageCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([pattern, count]) => ({ pattern, count }));
        const recommendedActions = [];
        if (migrationPercentage < 50) {
            recommendedActions.push('Priority: Begin systematic migration to USL patterns');
            recommendedActions.push('Focus on most frequently used legacy patterns first');
        }
        else if (migrationPercentage < 90) {
            recommendedActions.push("Continue migration efforts - you're making good progress");
            recommendedActions.push('Address remaining edge cases and specialized patterns');
        }
        else {
            recommendedActions.push('Migration nearly complete - focus on testing and validation');
            recommendedActions.push('Consider disabling legacy compatibility warnings');
        }
        return {
            totalLegacyUsages,
            migratedPatterns,
            remainingMigrations,
            migrationPercentage,
            mostUsedLegacyPatterns,
            recommendedActions,
        };
    }
    logLegacyUsage(pattern, replacement) {
        if (!this.config.warnOnLegacyUsage)
            return;
        const message = `Legacy pattern '${pattern}' detected. Consider using '${replacement}' instead.`;
        this.migrationLog.push({
            timestamp: new Date(),
            type: 'warning',
            pattern,
            replacement,
            details: message,
        });
        this.logger.warn(message);
    }
    logMigration(serviceName, serviceType, details) {
        this.migrationLog.push({
            timestamp: new Date(),
            type: 'migration',
            pattern: serviceName,
            details: `${details} (Type: ${serviceType})`,
        });
        this.logger.info(`Migration: ${serviceName} -> ${details}`);
    }
    detectServiceType(serviceInstance) {
        if (!serviceInstance || typeof serviceInstance !== 'object') {
            return null;
        }
        if (serviceInstance.isDataService ||
            serviceInstance.constructor?.name.includes('Data')) {
            return ServiceType.DATA;
        }
        if (serviceInstance.isCoordinationService ||
            serviceInstance.constructor?.name.includes('Coordination')) {
            return ServiceType.COORDINATION;
        }
        if (serviceInstance.isIntegrationService ||
            serviceInstance.constructor?.name.includes('Integration')) {
            return ServiceType.API;
        }
        if (serviceInstance.isInfrastructureService ||
            serviceInstance.constructor?.name.includes('Infrastructure')) {
            return ServiceType.INFRASTRUCTURE;
        }
        return ServiceType.CUSTOM;
    }
    transformServiceConfig(serviceInstance) {
        const baseConfig = {
            enabled: true,
            priority: ServicePriority.NORMAL,
        };
        if (serviceInstance.config) {
            Object.assign(baseConfig, serviceInstance.config);
        }
        return baseConfig;
    }
    canAutoMigratePattern(pattern) {
        return this.config.legacyPatterns.some((lp) => pattern.includes(lp.pattern) && lp.autoMigration);
    }
    getDefaultLegacyPatterns() {
        return [
            {
                pattern: 'createWebDataService',
                replacement: 'serviceManager.createWebDataService()',
                migrationGuide: 'Replace with ServiceManager method for enhanced features',
                autoMigration: true,
            },
            {
                pattern: 'createDocumentService',
                replacement: 'serviceManager.createDocumentService()',
                migrationGuide: 'Replace with ServiceManager method for enhanced database integration',
                autoMigration: true,
            },
            {
                pattern: 'createDAAService',
                replacement: 'serviceManager.createDaaService()',
                migrationGuide: 'Replace with ServiceManager method for enhanced coordination features',
                autoMigration: true,
            },
            {
                pattern: 'createSessionRecoveryService',
                replacement: 'serviceManager.createSessionRecoveryService()',
                migrationGuide: 'Replace with ServiceManager method for enhanced recovery capabilities',
                autoMigration: true,
            },
            {
                pattern: 'createArchitectureStorageService',
                replacement: 'serviceManager.createArchitectureStorageService()',
                migrationGuide: 'Replace with ServiceManager method for enhanced architecture storage',
                autoMigration: true,
            },
            {
                pattern: 'createSafeAPIService',
                replacement: 'serviceManager.createSafeAPIService()',
                migrationGuide: 'Replace with ServiceManager method for enhanced API safety features',
                autoMigration: true,
            },
            {
                pattern: 'getService',
                replacement: 'serviceManager.getService()',
                migrationGuide: 'Use ServiceManager for better service discovery and caching',
                autoMigration: true,
            },
            {
                pattern: 'startAll',
                replacement: 'serviceManager.startAllServices()',
                migrationGuide: 'Use ServiceManager for dependency-aware service startup',
                autoMigration: true,
            },
            {
                pattern: 'stopAll',
                replacement: 'serviceManager.stopAllServices()',
                migrationGuide: 'Use ServiceManager for graceful service shutdown',
                autoMigration: true,
            },
        ];
    }
    getDefaultServiceMappings() {
        return {
            webDataService: {
                newName: 'enhanced-web-data',
                newType: ServiceType.DATA,
                migrationNotes: 'Enhanced with caching and performance optimizations',
            },
            documentService: {
                newName: 'enhanced-document',
                newType: ServiceType.DATA,
                migrationNotes: 'Enhanced with vector search and advanced querying',
            },
            daaService: {
                newName: 'enhanced-daa',
                newType: ServiceType.DAA,
                migrationNotes: 'Enhanced with advanced analytics and real-time processing',
            },
            sessionRecoveryService: {
                newName: 'enhanced-session-recovery',
                newType: ServiceType.SESSION_RECOVERY,
                migrationNotes: 'Enhanced with automatic backup and faster recovery',
            },
            architectureStorageService: {
                newName: 'enhanced-architecture-storage',
                newType: ServiceType.ARCHITECTURE_STORAGE,
                migrationNotes: 'Enhanced with versioning and validation tracking',
            },
            safeAPIService: {
                newName: 'enhanced-safe-api',
                newType: ServiceType.SAFE_API,
                migrationNotes: 'Enhanced with advanced validation and security features',
            },
        };
    }
    getDefaultConfigTransformations() {
        return {
            dataService: (oldConfig) => ({
                name: oldConfig?.name || 'migrated-data-service',
                type: ServiceType.DATA,
                enabled: true,
                priority: ServicePriority.NORMAL,
                dataSource: oldConfig?.dataSource || { type: 'memory' },
                caching: { enabled: true, ttl: 300000 },
                validation: { enabled: true, strict: false },
            }),
            coordinationService: (oldConfig) => ({
                name: oldConfig?.name || 'migrated-coordination-service',
                type: ServiceType.COORDINATION,
                enabled: true,
                priority: ServicePriority.HIGH,
                coordination: {
                    topology: oldConfig?.topology || 'mesh',
                    maxAgents: oldConfig?.maxAgents || 10,
                    strategy: oldConfig?.strategy || 'adaptive',
                },
                persistence: { enabled: true, storage: 'memory' },
            }),
            integrationService: (oldConfig) => ({
                name: oldConfig?.name || 'migrated-integration-service',
                type: ServiceType.API,
                enabled: true,
                priority: ServicePriority.HIGH,
                integration: {
                    architectureStorage: true,
                    safeAPI: true,
                    protocolManagement: true,
                },
                security: {
                    validation: true,
                    sanitization: true,
                    rateLimiting: true,
                },
            }),
        };
    }
}
export const compat = new USLCompatibilityLayer();
export const initializeCompatibility = async (config, uslInstance) => {
    const compatLayer = new USLCompatibilityLayer(config);
    if (uslInstance) {
        compatLayer.setUSLInstance(uslInstance);
    }
    await compatLayer.initialize();
};
export const MigrationUtils = {
    createMigrationPlan: (codebase) => {
        return compat.generateMigrationGuide(codebase);
    },
    validateMigrationReadiness: (services) => {
        const blockers = [];
        const recommendations = [];
        Object.entries(services).forEach(([name, service]) => {
            if (!service || typeof service !== 'object') {
                blockers.push(`Service ${name} is not a valid object`);
            }
            if (service.isDeprecated) {
                recommendations.push(`Service ${name} is deprecated and should be updated before migration`);
            }
        });
        return {
            ready: blockers.length === 0,
            blockers,
            recommendations,
        };
    },
    generateCompatibilityReport: () => {
        const migrationStatus = compat.getMigrationStatus();
        const score = migrationStatus.completionPercentage;
        let status;
        if (score >= 90) {
            status = 'compatible';
        }
        else if (score >= 50) {
            status = 'partial';
        }
        else {
            status = 'incompatible';
        }
        return {
            status,
            score,
            details: {
                supportedPatterns: migrationStatus.migrationLog.filter((log) => log.type === 'migration').length,
                unsupportedPatterns: migrationStatus.legacyUsageCount,
                warnings: migrationStatus.migrationLog
                    .filter((log) => log.type === 'warning')
                    .map((log) => log.details),
                recommendations: migrationStatus.recommendations,
            },
        };
    },
};
export default USLCompatibilityLayer;
//# sourceMappingURL=compatibility.js.map