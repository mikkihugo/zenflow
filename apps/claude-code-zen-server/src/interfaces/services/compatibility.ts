/**
 * USL Compatibility Layer - Backward Compatibility and Migration Support.
 *
 * Provides seamless backward compatibility for existing service usage patterns.
 * While enabling gradual migration to the enhanced USL system.
 * Ensures zero breaking changes during transition.
 */
/**
 * @file Interface implementation: compatibility.
 */

import { getLogger, type Logger } from '@claude-zen/foundation';

import('/core/interfaces');
import('/manager');
import('/types');

// Legacy service patterns that need compatibility support
export interface LegacyServicePattern {
  pattern: string;
  replacement: string;
  migrationGuide: string;
  autoMigration: boolean;
}

export interface CompatibilityConfig {
  /** Enable automatic migration warnings */
  warnOnLegacyUsage: boolean;

  /** Enable automatic migration where possible */
  autoMigrate: boolean;

  /** Legacy pattern detection and replacement */
  legacyPatterns: LegacyServicePattern[];

  /** Service mapping for existing service names */
  serviceMappings: Record<
    string,
    {
      newName: string;
      newType: ServiceType;
      migrationNotes: string;
    }
  >;

  /** Configuration transformations */
  configTransformations: Record<string, (oldConfig: any) => AnyServiceConfig>;
}

/**
 * Compatibility wrapper that provides legacy API surface while using USL internally.
 *
 * @example
 */
export class USLCompatibilityLayer {
  private serviceManager: ServiceManager;
  private logger: Logger;
  private config: CompatibilityConfig;
  private uslInstance?: any; // USL instance for fallback operations
  private migrationLog: Array<{
    timestamp: Date;
    type: 'warning'' | ''info'' | ''migration');
    pattern: string;
    replacement?: string;
    details: string;
  }> = [];

  constructor(config?: Partial<CompatibilityConfig>) {
    this.logger = getLogger('USLCompatibility');
    this.serviceManager = new ServiceManager();

    this.config = {
      warnOnLegacyUsage: config?.warnOnLegacyUsage ?? true,
      autoMigrate: config?.autoMigrate ?? true,
      legacyPatterns: config?.legacyPatterns'' | '''' | ''this.getDefaultLegacyPatterns,
      serviceMappings:
        config?.serviceMappings'' | '''' | ''this.getDefaultServiceMappings,
      configTransformations:
        config?.configTransformations'' | '''' | ''this.getDefaultConfigTransformations,
    };
  }

  /**
   * Initialize the compatibility layer.
   */
  async initialize(): Promise<void> {
    await this.serviceManager?.initialize()
    this.logger.info('USL Compatibility Layer initialized');
  }

  /**
   * Set the USL instance for fallback operations.
   * This avoids circular dependency issues.
   *
   * @param uslInstance
   */
  setUSLInstance(uslInstance: any): void {
    this.uslInstance = uslInstance;
  }

  // ============================================
  // Legacy Service Creation Methods (Deprecated but Supported)
  // ============================================

  /**
   * @param name
   * @param options
   * @deprecated Use serviceManager?.createWebDataService instead.
   */
  async createWebDataService(name: string, options?: any): Promise<Service> {
    this.logLegacyUsage(
      'createWebDataService',
      'serviceManager?.createWebDataService'
    );

    if (this.config.autoMigrate) {
      return await this.serviceManager.createWebDataService(name, options);
    }

    // Legacy fallback
    if (!this.uslInstance) {
      throw new Error(
        'USL instance not set. Call setUSLInstance() before using compatibility layer.'
      );
    }
    return await this.uslInstance.createWebDataService(name, options);
  }

  /**
   * @param name
   * @param dbType
   * @param options
   * @deprecated Use serviceManager?.createDocumentService instead.
   */
  async createDocumentService(
    name: string,
    dbType?: string,
    options?: any
  ): Promise<Service> {
    this.logLegacyUsage(
      'createDocumentService',
      'serviceManager?.createDocumentService'
    );

    if (this.config.autoMigrate) {
      return await this.serviceManager.createDocumentService(
        name,
        (dbType as 'postgresql'' | ''sqlite'' | ''mysql)'' | '''' | ''postgresql',
        options
      );
    }

    // Legacy fallback
    if (!this.uslInstance) {
      throw new Error(
        'USL instance not set. Call setUSLInstance() before using compatibility layer.'
      );
    }
    return await this.uslInstance.createDocumentService(
      name,
      dbType as any,
      options
    );
  }

  /**
   * @param name
   * @param options
   * @deprecated Use serviceManager?.createDaaService instead.
   */
  async createDAAService(name: string, options?: any): Promise<Service> {
    this.logLegacyUsage('createDAAService, serviceManager?.createDaaService');

    if (this.config.autoMigrate) {
      return await this.serviceManager.createDaaService(name, options);
    }

    // Legacy fallback - map to coordination service
    if (!this.uslInstance) {
      throw new Error(
        'USL instance not set. Call setUSLInstance() before using compatibility layer.'
      );
    }
    return await this.uslInstance.createCoordinationService(name, {
      type: ServiceType.DAA,
      ...options,
    });
  }

  /**
   * @param name
   * @param options
   * @deprecated Use serviceManager?.createSessionRecoveryService instead.
   */
  async createSessionRecoveryService(
    name: string,
    options?: any
  ): Promise<Service> {
    this.logLegacyUsage(
      'createSessionRecoveryService',
      'serviceManager?.createSessionRecoveryService'
    );

    if (this.config.autoMigrate) {
      return await this.serviceManager.createSessionRecoveryService(
        name,
        options
      );
    }

    // Legacy fallback
    if (!this.uslInstance) {
      throw new Error(
        'USL instance not set. Call setUSLInstance() before using compatibility layer.'
      );
    }
    return await this.uslInstance.createCoordinationService(name, {
      type: ServiceType.SESSION_RECOVERY,
      ...options,
    });
  }

  /**
   * @param name
   * @param dbType
   * @param options
   * @deprecated Use serviceManager?.createArchitectureStorageService instead.
   */
  async createArchitectureStorageService(
    name: string,
    dbType?: string,
    options?: any
  ): Promise<Service> {
    this.logLegacyUsage(
      'createArchitectureStorageService',
      'serviceManager?.createArchitectureStorageService'
    );

    if (this.config.autoMigrate) {
      return await this.serviceManager.createArchitectureStorageService(
        name,
        (dbType as 'postgresql'' | ''sqlite'' | ''mysql)'' | '''' | ''postgresql',
        options
      );
    }

    // Legacy fallback
    if (!this.uslInstance) {
      throw new Error(
        'USL instance not set. Call setUSLInstance() before using compatibility layer.'
      );
    }
    return await this.uslInstance.createArchitectureStorageService(
      name,
      dbType as any,
      options
    );
  }

  /**
   * @param name
   * @param baseURL
   * @param options
   * @deprecated Use serviceManager?.createSafeAPIService instead.
   */
  async createSafeAPIService(
    name: string,
    baseURL: string,
    options?: any
  ): Promise<Service> {
    this.logLegacyUsage(
      'createSafeAPIService',
      'serviceManager?.createSafeAPIService'
    );

    if (this.config.autoMigrate) {
      return await this.serviceManager.createSafeAPIService(
        name,
        baseURL,
        options
      );
    }

    // Legacy fallback
    if (!this.uslInstance) {
      throw new Error(
        'USL instance not set. Call setUSLInstance() before using compatibility layer.');
    }
    return await this.uslInstance.createSafeAPIService(name, baseURL, options);
  }

  // ============================================
  // Legacy Service Management (Deprecated but Supported)
  // ============================================

  /**
   * @param name
   * @deprecated Use serviceManager?.getService instead.
   */
  getService(name: string): Service'' | ''undefined {
    this.logLegacyUsage('getService, serviceManager?.getService');
    return this.serviceManager.getService(name);
  }

  /**
   * @deprecated Use serviceManager?.getAllServices instead.
   */
  getAllServices(): Map<string, Service> {
    this.logLegacyUsage('getAllServices, serviceManager?.getAllServices');
    return this.serviceManager?.getAllServices as any;
  }

  /**
   * @deprecated Use serviceManager?.startAllServices instead.
   */
  async startAll(): Promise<void> {
    this.logLegacyUsage('startAll, serviceManager?.startAllServices');
    return await this.serviceManager?.startAllServices()
  }

  /**
   * @deprecated Use serviceManager?.stopAllServices instead.
   */
  async stopAll(): Promise<void> {
    this.logLegacyUsage('stopAll, serviceManager?.stopAllServices');
    return await this.serviceManager?.stopAllServices()
  }

  /**
   * @deprecated Use serviceManager?.getSystemHealth instead.
   */
  async getSystemStatus(): Promise<unknown> {
    this.logLegacyUsage('getSystemStatus, serviceManager?.getSystemHealth');

    const health = await this.serviceManager?.getSystemHealth()

    // Transform to legacy format
    return {
      status: health.overall,
      services: Array.from(health.services?.entries).map(([name, status]) => ({
        name,
        status: status.health,
        lifecycle: status.lifecycle,
        uptime: status.uptime,
        errors: status.errorCount,
      })),
      summary: health.summary,
    };
  }

  // ============================================
  // Service Pattern Migration
  // ============================================

  /**
   * Migrate existing service instances to USL.
   *
   * @param services
   */
  async migrateExistingServices(services: Record<string, unknown>): Promise<{
    migrated: Service[];
    failed: Array<{ name: string; error: string }>;
    warnings: string[];
  }> {
    this.logger.info(
      `Migrating ${Object.keys(services).length} existing services to USL`
    );

    const migrated: Service[] = [];
    const failed: Array<{ name: string; error: string }> = [];
    const warnings: string[] = [];

    for (const [serviceName, serviceInstance] of Object.entries(services)) {
      try {
        // Detect service type and configuration
        const detectedType = this.detectServiceType(serviceInstance);
        const migratedConfig = this.transformServiceConfig(serviceInstance);

        if (!detectedType) {
          warnings.push(
            `Could not detect service type for ${serviceName}, skipping migration`
          );
          continue;
        }

        // Create new USL service
        const newService = await this.serviceManager.createService({
          name: serviceName,
          type: detectedType,
          config: migratedConfig,
        });

        migrated.push(newService);

        this.logMigration(
          serviceName,
          detectedType,
          'Successfully migrated service to USL'
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        failed.push({ name: serviceName, error: errorMessage });
        this.logger.error(`Failed to migrate service ${serviceName}:`, error);
      }
    }

    this.logger.info(
      `Migration complete: ${migrated.length} migrated, ${failed.length} failed, ${warnings.length} warnings`
    );

    return { migrated, failed, warnings };
  }

  /**
   * Generate migration guide for existing codebase.
   *
   * @param codePatterns
   */
  generateMigrationGuide(codePatterns: string[]): {
    replacements: Array<{
      pattern: string;
      replacement: string;
      explanation: string;
      automatic: boolean;
    }>;
    manualSteps: string[];
    estimatedEffort: {
      automaticReplacements: number;
      manualChanges: number;
      testingRequired: boolean;
    };
  } {
    const replacements: Array<{
      pattern: string;
      replacement: string;
      explanation: string;
      automatic: boolean;
    }> = [];

    const manualSteps: string[] = [];
    let automaticCount = 0;
    let manualCount = 0;

    // Analyze code patterns against known legacy patterns
    codePatterns.forEach((pattern) => {
      const legacyPattern = this.config.legacyPatterns.find((lp) =>
        pattern.includes(lp.pattern)
      );

      if (legacyPattern) {
        replacements.push({
          pattern: legacyPattern.pattern,
          replacement: legacyPattern.replacement,
          explanation: legacyPattern.migrationGuide,
          automatic: legacyPattern.autoMigration,
        });

        if (legacyPattern.autoMigration) {
          automaticCount++;
        } else {
          manualCount++;
          manualSteps.push(legacyPattern.migrationGuide);
        }
      }
    });

    // Add general manual steps
    manualSteps.push(
      'Update import statements to use USL exports',
      'Review service configurations for new options',
      'Update error handling for new error types',
      'Test service interactions and dependencies',
      'Update monitoring and logging integration'
    );

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

  /**
   * Get migration status and recommendations.
   */
  getMigrationStatus(): {
    legacyUsageCount: number;
    migrationLog: typeof this.migrationLog;
    recommendations: string[];
    completionPercentage: number;
  } {
    const totalPatterns = this.config.legacyPatterns.length;
    const migratedPatterns = this.migrationLog.filter(
      (log) => log.type === 'migration'
    ).length;
    const completionPercentage =
      totalPatterns > 0 ? (migratedPatterns / totalPatterns) * 100 : 100;

    const recommendations: string[] = [];

    if (completionPercentage < 100) {
      recommendations.push('Continue migrating legacy service patterns to USL');
      recommendations.push('Review and update service creation calls');
      recommendations.push(
        'Update configuration patterns to use new USL types'
      );
    }

    if (this.migrationLog.some((log) => log.type === 'warning')) {
      recommendations.push('Address legacy usage warnings');
      recommendations.push(
        'Consider enabling auto-migration for supported patterns'
      );
    }

    return {
      legacyUsageCount: this.migrationLog.filter(
        (log) => log.type === 'warning'
      ).length,
      migrationLog: this.migrationLog,
      recommendations,
      completionPercentage,
    };
  }

  // ============================================
  // Facade Pattern Migration Support
  // ============================================

  /**
   * Migrate ClaudeZenFacade to use USL infrastructure services.
   */
  async migrateFacadeToUSL(): Promise<{
    success: boolean;
    facadeService?: Service;
    warnings: string[];
    errors: string[];
  }> {
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      this.logger.info(
        'Migrating ClaudeZenFacade to USL infrastructure services'
      );

      // Create enhanced facade service using USL
      const facadeService = await this.serviceManager.createFacadeService(
        'enhanced-facade',
        {
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
        }
      );

      this.logMigration(
        'ClaudeZenFacade',
        ServiceType.NFRASTRUCTURE,
        'Migrated facade to USL infrastructure service'
      );

      return {
        success: true,
        facadeService,
        warnings,
        errors,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push(`Facade migration failed: ${errorMessage}`);
      this.logger.error('Facade migration failed:', error);

      return {
        success: false,
        warnings,
        errors,
      };
    }
  }

  /**
   * Migrate pattern integration systems to USL.
   */
  async migratePatternIntegrationToUSL(): Promise<{
    success: boolean;
    patternService?: Service;
    warnings: string[];
    errors: string[];
  }> {
    const warnings: string[] = [];
    const errors: string[] = [];

    try {
      this.logger.info('Migrating pattern integration systems to USL');

      // Create enhanced pattern integration service
      const patternService =
        await this.serviceManager.createPatternIntegrationService(
          'enhanced-pattern-integration',
          'production', // Use production profile for enhanced features
          {
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
          }
        );

      this.logMigration(
        'PatternIntegration',
        ServiceType.NFRASTRUCTURE,
        'Migrated pattern integration to USL infrastructure service'
      );

      return {
        success: true,
        patternService,
        warnings,
        errors,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      errors.push(`Pattern integration migration failed: ${errorMessage}`);
      this.logger.error('Pattern integration migration failed:', error);

      return {
        success: false,
        warnings,
        errors,
      };
    }
  }

  // ============================================
  // Service Discovery Migration
  // ============================================

  /**
   * Migrate scattered service usage to unified service discovery.
   *
   * @param existingServiceReferences
   */
  async migrateServiceDiscovery(
    existingServiceReferences: Array<{
      name: string;
      currentPattern: string;
      location: string;
    }>
  ): Promise<{
    success: boolean;
    migrationPlan: Array<{
      service: string;
      currentPattern: string;
      newPattern: string;
      location: string;
      autoMigration: boolean;
    }>;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    const migrationPlan: Array<{
      service: string;
      currentPattern: string;
      newPattern: string;
      location: string;
      autoMigration: boolean;
    }> = [];

    for (const serviceRef of existingServiceReferences) {
      // Determine new USL pattern
      const mapping = this.config.serviceMappings[serviceRef.name];
      const newPattern = mapping
        ? `serviceManager.getService('${mapping.newName}')`
        : `serviceManager.getService('${serviceRef.name}')`;

      const autoMigration = this.canAutoMigratePattern(
        serviceRef.currentPattern
      );

      migrationPlan.push({
        service: serviceRef.name,
        currentPattern: serviceRef.currentPattern,
        newPattern,
        location: serviceRef.location,
        autoMigration,
      });

      if (mapping) {
        warnings.push(
          `Service '${serviceRef.name} should be renamed to ${mapping.newName}'(${mapping.migrationNotes})`
        );
      }

      if (!autoMigration) {
        warnings.push(
          `Manual migration required for ${serviceRef.name} at ${serviceRef.location}`
        );
      }
    }

    this.logger.info(
      `Generated migration plan for ${migrationPlan.length} service references`
    );

    return {
      success: true,
      migrationPlan,
      warnings,
    };
  }

  // ============================================
  // Utility and Helper Methods
  // ============================================

  /**
   * Get migration summary and statistics.
   */
  getMigrationSummary(): {
    totalLegacyUsages: number;
    migratedPatterns: number;
    remainingMigrations: number;
    migrationPercentage: number;
    mostUsedLegacyPatterns: Array<{ pattern: string; count: number }>;
    recommendedActions: string[];
  } {
    const usageCounts = new Map<string, number>();

    this.migrationLog.forEach((log) => {
      const count = usageCounts.get(log.pattern)'' | '''' | ''0;
      usageCounts.set(log.pattern, count + 1);
    });

    const totalLegacyUsages = this.migrationLog.filter(
      (log) => log.type ==='warning'
    ).length;
    const migratedPatterns = this.migrationLog.filter(
      (log) => log.type === 'migration'
    ).length;
    const remainingMigrations =
      this.config.legacyPatterns.length - migratedPatterns;
    const migrationPercentage =
      this.config.legacyPatterns.length > 0
        ? (migratedPatterns / this.config.legacyPatterns.length) * 100
        : 100;

    const mostUsedLegacyPatterns = Array.from(usageCounts?.entries)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }));

    const recommendedActions: string[] = [];

    if (migrationPercentage < 50) {
      recommendedActions.push(
        'Priority: Begin systematic migration to USL patterns'
      );
      recommendedActions.push(
        'Focus on most frequently used legacy patterns first'
      );
    } else if (migrationPercentage < 90) {
      recommendedActions.push(
        "Continue migration efforts - you're making good progress"
      );
      recommendedActions.push(
        'Address remaining edge cases and specialized patterns'
      );
    } else {
      recommendedActions.push(
        'Migration nearly complete - focus on testing and validation'
      );
      recommendedActions.push(
        'Consider disabling legacy compatibility warnings'
      );
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

  // ============================================
  // Private Implementation Methods
  // ============================================

  private logLegacyUsage(pattern: string, replacement: string): void {
    if (!this.config.warnOnLegacyUsage) return;

    const message = `Legacy pattern '${pattern} detected. Consider using ${replacement}' instead.`;

    this.migrationLog.push({
      timestamp: new Date(),
      type: 'warning',
      pattern,
      replacement,
      details: message,
    });

    this.logger.warn(message);
  }

  private logMigration(
    serviceName: string,
    serviceType: ServiceType,
    details: string
  ): void {
    this.migrationLog.push({
      timestamp: new Date(),
      type: 'migration',
      pattern: serviceName,
      details: `${details} (Type: ${serviceType})`,
    });

    this.logger.info(`Migration: ${serviceName} -> ${details}`);
  }

  private detectServiceType(serviceInstance: any): ServiceType'' | ''null {
    // Simple heuristic-based service type detection
    if (!serviceInstance'' | '''' | ''typeof serviceInstance !=='object') {
      return null;
    }

    // Check for known service patterns
    if (
      serviceInstance.isDataService'' | '''' | ''serviceInstance.constructor?.name.includes('Data');
    ) {
      return ServiceType.DATA;
    }

    if (
      serviceInstance.isCoordinationService'' | '''' | ''serviceInstance.constructor?.name.includes('Coordination');
    ) {
      return ServiceType.COORDINATION;
    }

    if (
      serviceInstance.isIntegrationService'' | '''' | ''serviceInstance.constructor?.name.includes('Integration');
    ) {
      return ServiceType.API;
    }

    if (
      serviceInstance.isInfrastructureService'' | '''' | ''serviceInstance.constructor?.name.includes('Infrastructure');
    ) {
      return ServiceType.NFRASTRUCTURE;
    }

    // Fallback to custom type
    return ServiceType.CUSTOM;
  }

  private transformServiceConfig(
    serviceInstance: any
  ): Partial<AnyServiceConfig> {
    // Basic configuration transformation
    const baseConfig: Partial<AnyServiceConfig> = {
      enabled: true,
      priority: ServicePriority.NORMAL,
    };

    // Apply specific transformations based on service characteristics
    if (serviceInstance.config) {
      Object.assign(baseConfig, serviceInstance.config);
    }

    return baseConfig;
  }

  private canAutoMigratePattern(pattern: string): boolean {
    return this.config.legacyPatterns.some(
      (lp) => pattern.includes(lp.pattern) && lp.autoMigration
    );
  }

  private getDefaultLegacyPatterns(): LegacyServicePattern[] {
    return [
      {
        pattern: 'createWebDataService',
        replacement: 'serviceManager?.createWebDataService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced features',
        autoMigration: true,
      },
      {
        pattern: 'createDocumentService',
        replacement: 'serviceManager?.createDocumentService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced database integration',
        autoMigration: true,
      },
      {
        pattern: 'createDAAService',
        replacement: 'serviceManager?.createDaaService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced coordination features',
        autoMigration: true,
      },
      {
        pattern: 'createSessionRecoveryService',
        replacement: 'serviceManager?.createSessionRecoveryService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced recovery capabilities',
        autoMigration: true,
      },
      {
        pattern: 'createArchitectureStorageService',
        replacement: 'serviceManager?.createArchitectureStorageService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced architecture storage',
        autoMigration: true,
      },
      {
        pattern: 'createSafeAPIService',
        replacement: 'serviceManager?.createSafeAPIService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced API safety features',
        autoMigration: true,
      },
      {
        pattern: 'getService',
        replacement: 'serviceManager?.getService',
        migrationGuide:
          'Use ServiceManager for better service discovery and caching',
        autoMigration: true,
      },
      {
        pattern: 'startAll',
        replacement: 'serviceManager?.startAllServices',
        migrationGuide:
          'Use ServiceManager for dependency-aware service startup',
        autoMigration: true,
      },
      {
        pattern: 'stopAll',
        replacement: 'serviceManager?.stopAllServices',
        migrationGuide: 'Use ServiceManager for graceful service shutdown',
        autoMigration: true,
      },
    ];
  }

  private getDefaultServiceMappings(): Record<
    string,
    {
      newName: string;
      newType: ServiceType;
      migrationNotes: string;
    }
  > {
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
        migrationNotes:
          'Enhanced with advanced analytics and real-time processing',
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
        migrationNotes:
          'Enhanced with advanced validation and security features',
      },
    };
  }

  private getDefaultConfigTransformations(): Record<
    string,
    (oldConfig: any) => AnyServiceConfig
  > {
    return {
      dataService: (oldConfig: any) => ({
        name: oldConfig?.name'' | '''' | '''migrated-data-service',
        type: ServiceType.DATA,
        enabled: true,
        priority: ServicePriority.NORMAL,
        dataSource: oldConfig?.dataSource'' | '''' | ''{ type:'memory'},
        caching: { enabled: true, ttl: 300000 },
        validation: { enabled: true, strict: false },
      }),

      coordinationService: (oldConfig: any) => ({
        name: oldConfig?.name'' | '''' | '''migrated-coordination-service',
        type: ServiceType.COORDINATION,
        enabled: true,
        priority: ServicePriority.HIGH,
        coordination: {
          topology: oldConfig?.topology'' | '''' | '''mesh',
          maxAgents: oldConfig?.maxAgents'' | '''' | ''10,
          strategy: oldConfig?.strategy'' | '''' | '''adaptive',
        },
        persistence: { enabled: true, storage: 'memory'},
      }),

      integrationService: (oldConfig: any) => ({
        name: oldConfig?.name'' | '''' | '''migrated-integration-service',
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

/**
 * Global compatibility layer instance.
 * Note: USL instance must be set via setUSLInstance() before using.
 */
export const compat = new USLCompatibilityLayer();

/**
 * Initialize compatibility layer with USL.
 *
 * @param config
 * @param uslInstance
 */
export const initializeCompatibility = async (
  config?: Partial<CompatibilityConfig>,
  uslInstance?: any
): Promise<void> => {
  const compatLayer = new USLCompatibilityLayer(config);
  if (uslInstance) {
    compatLayer.setUSLInstance(uslInstance);
  }
  await compatLayer?.initialize()
};

/**
 * Migration utilities for gradual USL adoption.
 */
export const MigrationUtils = {
  /**
   * Create migration plan for existing codebase.
   *
   * @param codebase
   */
  createMigrationPlan: (
    codebase: string[]
  ): ReturnType<USLCompatibilityLayer['generateMigrationGuide']> => {
    return compat.generateMigrationGuide(codebase);
  },

  /**
   * Validate migration readiness.
   *
   * @param services
   */
  validateMigrationReadiness: (
    services: Record<string, unknown>
  ): {
    ready: boolean;
    blockers: string[];
    recommendations: string[];
  } => {
    const blockers: string[] = [];
    const recommendations: string[] = [];

    // Check for common migration blockers
    Object.entries(services).forEach(([name, service]) => {
      if (!service'' | '''' | ''typeof service !=='object') {
        blockers.push(`Service ${name} is not a valid object`);
      }

      if (service.isDeprecated) {
        recommendations.push(
          `Service ${name} is deprecated and should be updated before migration`
        );
      }
    });

    return {
      ready: blockers.length === 0,
      blockers,
      recommendations,
    };
  },

  /**
   * Generate compatibility report.
   */
  generateCompatibilityReport: (): {
    status: 'compatible'' | ''partial'' | ''incompatible');
    score: number;
    details: {
      supportedPatterns: number;
      unsupportedPatterns: number;
      warnings: string[];
      recommendations: string[];
    };
  } => {
    const migrationStatus = compat?.getMigrationStatus()
    const score = migrationStatus.completionPercentage;

    let status: 'compatible'' | ''partial'' | ''incompatible');
    if (score >= 90) {
      status = 'compatible');
    } else if (score >= 50) {
      status = 'partial');
    } else {
      status = 'incompatible');
    }

    return {
      status,
      score,
      details: {
        supportedPatterns: migrationStatus.migrationLog.filter(
          (log) => log.type === 'migration'
        ).length,
        unsupportedPatterns: migrationStatus.legacyUsageCount,
        warnings: migrationStatus.migrationLog
          .filter((log) => log.type === 'warning');
          .map((log) => log.details),
        recommendations: migrationStatus.recommendations,
      },
    };
  },
};

export default USLCompatibilityLayer;
