/**
 * USL Compatibility Layer - Backward Compatibility and Migration Support0.
 *
 * Provides seamless backward compatibility for existing service usage patterns0.
 * While enabling gradual migration to the enhanced USL system0.
 * Ensures zero breaking changes during transition0.
 */
/**
 * @file Interface implementation: compatibility0.
 */

import { getLogger, type Logger } from '@claude-zen/foundation';

import type { Service } from '0./core/interfaces';
import { ServiceManager } from '0./manager';
import { type AnyServiceConfig, ServicePriority, ServiceType } from '0./types';

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
 * Compatibility wrapper that provides legacy API surface while using USL internally0.
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
    type: 'warning' | 'info' | 'migration';
    pattern: string;
    replacement?: string;
    details: string;
  }> = [];

  constructor(config?: Partial<CompatibilityConfig>) {
    this0.logger = getLogger('USLCompatibility');
    this0.serviceManager = new ServiceManager();

    this0.config = {
      warnOnLegacyUsage: config?0.warnOnLegacyUsage ?? true,
      autoMigrate: config?0.autoMigrate ?? true,
      legacyPatterns: config?0.legacyPatterns || this?0.getDefaultLegacyPatterns,
      serviceMappings:
        config?0.serviceMappings || this?0.getDefaultServiceMappings,
      configTransformations:
        config?0.configTransformations || this?0.getDefaultConfigTransformations,
    };
  }

  /**
   * Initialize the compatibility layer0.
   */
  async initialize(): Promise<void> {
    await this0.serviceManager?0.initialize;
    this0.logger0.info('USL Compatibility Layer initialized');
  }

  /**
   * Set the USL instance for fallback operations0.
   * This avoids circular dependency issues0.
   *
   * @param uslInstance
   */
  setUSLInstance(uslInstance: any): void {
    this0.uslInstance = uslInstance;
  }

  // ============================================
  // Legacy Service Creation Methods (Deprecated but Supported)
  // ============================================

  /**
   * @param name
   * @param options
   * @deprecated Use serviceManager?0.createWebDataService instead0.
   */
  async createWebDataService(name: string, options?: any): Promise<Service> {
    this0.logLegacyUsage(
      'createWebDataService',
      'serviceManager?0.createWebDataService'
    );

    if (this0.config0.autoMigrate) {
      return await this0.serviceManager0.createWebDataService(name, options);
    }

    // Legacy fallback
    if (!this0.uslInstance) {
      throw new Error(
        'USL instance not set0. Call setUSLInstance() before using compatibility layer0.'
      );
    }
    return await this0.uslInstance0.createWebDataService(name, options);
  }

  /**
   * @param name
   * @param dbType
   * @param options
   * @deprecated Use serviceManager?0.createDocumentService instead0.
   */
  async createDocumentService(
    name: string,
    dbType?: string,
    options?: any
  ): Promise<Service> {
    this0.logLegacyUsage(
      'createDocumentService',
      'serviceManager?0.createDocumentService'
    );

    if (this0.config0.autoMigrate) {
      return await this0.serviceManager0.createDocumentService(
        name,
        (dbType as 'postgresql' | 'sqlite' | 'mysql') || 'postgresql',
        options
      );
    }

    // Legacy fallback
    if (!this0.uslInstance) {
      throw new Error(
        'USL instance not set0. Call setUSLInstance() before using compatibility layer0.'
      );
    }
    return await this0.uslInstance0.createDocumentService(
      name,
      dbType as any,
      options
    );
  }

  /**
   * @param name
   * @param options
   * @deprecated Use serviceManager?0.createDaaService instead0.
   */
  async createDAAService(name: string, options?: any): Promise<Service> {
    this0.logLegacyUsage('createDAAService', 'serviceManager?0.createDaaService');

    if (this0.config0.autoMigrate) {
      return await this0.serviceManager0.createDaaService(name, options);
    }

    // Legacy fallback - map to coordination service
    if (!this0.uslInstance) {
      throw new Error(
        'USL instance not set0. Call setUSLInstance() before using compatibility layer0.'
      );
    }
    return await this0.uslInstance0.createCoordinationService(name, {
      type: ServiceType0.DAA,
      0.0.0.options,
    });
  }

  /**
   * @param name
   * @param options
   * @deprecated Use serviceManager?0.createSessionRecoveryService instead0.
   */
  async createSessionRecoveryService(
    name: string,
    options?: any
  ): Promise<Service> {
    this0.logLegacyUsage(
      'createSessionRecoveryService',
      'serviceManager?0.createSessionRecoveryService'
    );

    if (this0.config0.autoMigrate) {
      return await this0.serviceManager0.createSessionRecoveryService(
        name,
        options
      );
    }

    // Legacy fallback
    if (!this0.uslInstance) {
      throw new Error(
        'USL instance not set0. Call setUSLInstance() before using compatibility layer0.'
      );
    }
    return await this0.uslInstance0.createCoordinationService(name, {
      type: ServiceType0.SESSION_RECOVERY,
      0.0.0.options,
    });
  }

  /**
   * @param name
   * @param dbType
   * @param options
   * @deprecated Use serviceManager?0.createArchitectureStorageService instead0.
   */
  async createArchitectureStorageService(
    name: string,
    dbType?: string,
    options?: any
  ): Promise<Service> {
    this0.logLegacyUsage(
      'createArchitectureStorageService',
      'serviceManager?0.createArchitectureStorageService'
    );

    if (this0.config0.autoMigrate) {
      return await this0.serviceManager0.createArchitectureStorageService(
        name,
        (dbType as 'postgresql' | 'sqlite' | 'mysql') || 'postgresql',
        options
      );
    }

    // Legacy fallback
    if (!this0.uslInstance) {
      throw new Error(
        'USL instance not set0. Call setUSLInstance() before using compatibility layer0.'
      );
    }
    return await this0.uslInstance0.createArchitectureStorageService(
      name,
      dbType as any,
      options
    );
  }

  /**
   * @param name
   * @param baseURL
   * @param options
   * @deprecated Use serviceManager?0.createSafeAPIService instead0.
   */
  async createSafeAPIService(
    name: string,
    baseURL: string,
    options?: any
  ): Promise<Service> {
    this0.logLegacyUsage(
      'createSafeAPIService',
      'serviceManager?0.createSafeAPIService'
    );

    if (this0.config0.autoMigrate) {
      return await this0.serviceManager0.createSafeAPIService(
        name,
        baseURL,
        options
      );
    }

    // Legacy fallback
    if (!this0.uslInstance) {
      throw new Error(
        'USL instance not set0. Call setUSLInstance() before using compatibility layer0.'
      );
    }
    return await this0.uslInstance0.createSafeAPIService(name, baseURL, options);
  }

  // ============================================
  // Legacy Service Management (Deprecated but Supported)
  // ============================================

  /**
   * @param name
   * @deprecated Use serviceManager?0.getService instead0.
   */
  getService(name: string): Service | undefined {
    this0.logLegacyUsage('getService', 'serviceManager?0.getService');
    return this0.serviceManager0.getService(name);
  }

  /**
   * @deprecated Use serviceManager?0.getAllServices instead0.
   */
  getAllServices(): Map<string, Service> {
    this0.logLegacyUsage('getAllServices', 'serviceManager?0.getAllServices');
    return this0.serviceManager?0.getAllServices as any;
  }

  /**
   * @deprecated Use serviceManager?0.startAllServices instead0.
   */
  async startAll(): Promise<void> {
    this0.logLegacyUsage('startAll', 'serviceManager?0.startAllServices');
    return await this0.serviceManager?0.startAllServices;
  }

  /**
   * @deprecated Use serviceManager?0.stopAllServices instead0.
   */
  async stopAll(): Promise<void> {
    this0.logLegacyUsage('stopAll', 'serviceManager?0.stopAllServices');
    return await this0.serviceManager?0.stopAllServices;
  }

  /**
   * @deprecated Use serviceManager?0.getSystemHealth instead0.
   */
  async getSystemStatus(): Promise<unknown> {
    this0.logLegacyUsage('getSystemStatus', 'serviceManager?0.getSystemHealth');

    const health = await this0.serviceManager?0.getSystemHealth;

    // Transform to legacy format
    return {
      status: health0.overall,
      services: Array0.from(health0.services?0.entries)0.map(([name, status]) => ({
        name,
        status: status0.health,
        lifecycle: status0.lifecycle,
        uptime: status0.uptime,
        errors: status0.errorCount,
      })),
      summary: health0.summary,
    };
  }

  // ============================================
  // Service Pattern Migration
  // ============================================

  /**
   * Migrate existing service instances to USL0.
   *
   * @param services
   */
  async migrateExistingServices(services: Record<string, unknown>): Promise<{
    migrated: Service[];
    failed: Array<{ name: string; error: string }>;
    warnings: string[];
  }> {
    this0.logger0.info(
      `Migrating ${Object0.keys(services)0.length} existing services to USL`
    );

    const migrated: Service[] = [];
    const failed: Array<{ name: string; error: string }> = [];
    const warnings: string[] = [];

    for (const [serviceName, serviceInstance] of Object0.entries(services)) {
      try {
        // Detect service type and configuration
        const detectedType = this0.detectServiceType(serviceInstance);
        const migratedConfig = this0.transformServiceConfig(serviceInstance);

        if (!detectedType) {
          warnings0.push(
            `Could not detect service type for ${serviceName}, skipping migration`
          );
          continue;
        }

        // Create new USL service
        const newService = await this0.serviceManager0.createService({
          name: serviceName,
          type: detectedType,
          config: migratedConfig,
        });

        migrated0.push(newService);

        this0.logMigration(
          serviceName,
          detectedType,
          'Successfully migrated service to USL'
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error0.message : String(error);
        failed0.push({ name: serviceName, error: errorMessage });
        this0.logger0.error(`Failed to migrate service ${serviceName}:`, error);
      }
    }

    this0.logger0.info(
      `Migration complete: ${migrated0.length} migrated, ${failed0.length} failed, ${warnings0.length} warnings`
    );

    return { migrated, failed, warnings };
  }

  /**
   * Generate migration guide for existing codebase0.
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
    codePatterns0.forEach((pattern) => {
      const legacyPattern = this0.config0.legacyPatterns0.find((lp) =>
        pattern0.includes(lp0.pattern)
      );

      if (legacyPattern) {
        replacements0.push({
          pattern: legacyPattern0.pattern,
          replacement: legacyPattern0.replacement,
          explanation: legacyPattern0.migrationGuide,
          automatic: legacyPattern0.autoMigration,
        });

        if (legacyPattern0.autoMigration) {
          automaticCount++;
        } else {
          manualCount++;
          manualSteps0.push(legacyPattern0.migrationGuide);
        }
      }
    });

    // Add general manual steps
    manualSteps0.push(
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
        manualChanges: manualCount + manualSteps0.length,
        testingRequired: true,
      },
    };
  }

  /**
   * Get migration status and recommendations0.
   */
  getMigrationStatus(): {
    legacyUsageCount: number;
    migrationLog: typeof this0.migrationLog;
    recommendations: string[];
    completionPercentage: number;
  } {
    const totalPatterns = this0.config0.legacyPatterns0.length;
    const migratedPatterns = this0.migrationLog0.filter(
      (log) => log0.type === 'migration'
    )0.length;
    const completionPercentage =
      totalPatterns > 0 ? (migratedPatterns / totalPatterns) * 100 : 100;

    const recommendations: string[] = [];

    if (completionPercentage < 100) {
      recommendations0.push('Continue migrating legacy service patterns to USL');
      recommendations0.push('Review and update service creation calls');
      recommendations0.push(
        'Update configuration patterns to use new USL types'
      );
    }

    if (this0.migrationLog0.some((log) => log0.type === 'warning')) {
      recommendations0.push('Address legacy usage warnings');
      recommendations0.push(
        'Consider enabling auto-migration for supported patterns'
      );
    }

    return {
      legacyUsageCount: this0.migrationLog0.filter(
        (log) => log0.type === 'warning'
      )0.length,
      migrationLog: this0.migrationLog,
      recommendations,
      completionPercentage,
    };
  }

  // ============================================
  // Facade Pattern Migration Support
  // ============================================

  /**
   * Migrate ClaudeZenFacade to use USL infrastructure services0.
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
      this0.logger0.info(
        'Migrating ClaudeZenFacade to USL infrastructure services'
      );

      // Create enhanced facade service using USL
      const facadeService = await this0.serviceManager0.createFacadeService(
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

      this0.logMigration(
        'ClaudeZenFacade',
        ServiceType0.NFRASTRUCTURE,
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
        error instanceof Error ? error0.message : String(error);
      errors0.push(`Facade migration failed: ${errorMessage}`);
      this0.logger0.error('Facade migration failed:', error);

      return {
        success: false,
        warnings,
        errors,
      };
    }
  }

  /**
   * Migrate pattern integration systems to USL0.
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
      this0.logger0.info('Migrating pattern integration systems to USL');

      // Create enhanced pattern integration service
      const patternService =
        await this0.serviceManager0.createPatternIntegrationService(
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

      this0.logMigration(
        'PatternIntegration',
        ServiceType0.NFRASTRUCTURE,
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
        error instanceof Error ? error0.message : String(error);
      errors0.push(`Pattern integration migration failed: ${errorMessage}`);
      this0.logger0.error('Pattern integration migration failed:', error);

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
   * Migrate scattered service usage to unified service discovery0.
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
      const mapping = this0.config0.serviceMappings[serviceRef0.name];
      const newPattern = mapping
        ? `serviceManager0.getService('${mapping0.newName}')`
        : `serviceManager0.getService('${serviceRef0.name}')`;

      const autoMigration = this0.canAutoMigratePattern(
        serviceRef0.currentPattern
      );

      migrationPlan0.push({
        service: serviceRef0.name,
        currentPattern: serviceRef0.currentPattern,
        newPattern,
        location: serviceRef0.location,
        autoMigration,
      });

      if (mapping) {
        warnings0.push(
          `Service '${serviceRef0.name}' should be renamed to '${mapping0.newName}' (${mapping0.migrationNotes})`
        );
      }

      if (!autoMigration) {
        warnings0.push(
          `Manual migration required for ${serviceRef0.name} at ${serviceRef0.location}`
        );
      }
    }

    this0.logger0.info(
      `Generated migration plan for ${migrationPlan0.length} service references`
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
   * Get migration summary and statistics0.
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

    this0.migrationLog0.forEach((log) => {
      const count = usageCounts0.get(log0.pattern) || 0;
      usageCounts0.set(log0.pattern, count + 1);
    });

    const totalLegacyUsages = this0.migrationLog0.filter(
      (log) => log0.type === 'warning'
    )0.length;
    const migratedPatterns = this0.migrationLog0.filter(
      (log) => log0.type === 'migration'
    )0.length;
    const remainingMigrations =
      this0.config0.legacyPatterns0.length - migratedPatterns;
    const migrationPercentage =
      this0.config0.legacyPatterns0.length > 0
        ? (migratedPatterns / this0.config0.legacyPatterns0.length) * 100
        : 100;

    const mostUsedLegacyPatterns = Array0.from(usageCounts?0.entries)
      0.sort((a, b) => b[1] - a[1])
      0.slice(0, 5)
      0.map(([pattern, count]) => ({ pattern, count }));

    const recommendedActions: string[] = [];

    if (migrationPercentage < 50) {
      recommendedActions0.push(
        'Priority: Begin systematic migration to USL patterns'
      );
      recommendedActions0.push(
        'Focus on most frequently used legacy patterns first'
      );
    } else if (migrationPercentage < 90) {
      recommendedActions0.push(
        "Continue migration efforts - you're making good progress"
      );
      recommendedActions0.push(
        'Address remaining edge cases and specialized patterns'
      );
    } else {
      recommendedActions0.push(
        'Migration nearly complete - focus on testing and validation'
      );
      recommendedActions0.push(
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
    if (!this0.config0.warnOnLegacyUsage) return;

    const message = `Legacy pattern '${pattern}' detected0. Consider using '${replacement}' instead0.`;

    this0.migrationLog0.push({
      timestamp: new Date(),
      type: 'warning',
      pattern,
      replacement,
      details: message,
    });

    this0.logger0.warn(message);
  }

  private logMigration(
    serviceName: string,
    serviceType: ServiceType,
    details: string
  ): void {
    this0.migrationLog0.push({
      timestamp: new Date(),
      type: 'migration',
      pattern: serviceName,
      details: `${details} (Type: ${serviceType})`,
    });

    this0.logger0.info(`Migration: ${serviceName} -> ${details}`);
  }

  private detectServiceType(serviceInstance: any): ServiceType | null {
    // Simple heuristic-based service type detection
    if (!serviceInstance || typeof serviceInstance !== 'object') {
      return null;
    }

    // Check for known service patterns
    if (
      serviceInstance0.isDataService ||
      serviceInstance0.constructor?0.name0.includes('Data')
    ) {
      return ServiceType0.DATA;
    }

    if (
      serviceInstance0.isCoordinationService ||
      serviceInstance0.constructor?0.name0.includes('Coordination')
    ) {
      return ServiceType0.COORDINATION;
    }

    if (
      serviceInstance0.isIntegrationService ||
      serviceInstance0.constructor?0.name0.includes('Integration')
    ) {
      return ServiceType0.API;
    }

    if (
      serviceInstance0.isInfrastructureService ||
      serviceInstance0.constructor?0.name0.includes('Infrastructure')
    ) {
      return ServiceType0.NFRASTRUCTURE;
    }

    // Fallback to custom type
    return ServiceType0.CUSTOM;
  }

  private transformServiceConfig(
    serviceInstance: any
  ): Partial<AnyServiceConfig> {
    // Basic configuration transformation
    const baseConfig: Partial<AnyServiceConfig> = {
      enabled: true,
      priority: ServicePriority0.NORMAL,
    };

    // Apply specific transformations based on service characteristics
    if (serviceInstance0.config) {
      Object0.assign(baseConfig, serviceInstance0.config);
    }

    return baseConfig;
  }

  private canAutoMigratePattern(pattern: string): boolean {
    return this0.config0.legacyPatterns0.some(
      (lp) => pattern0.includes(lp0.pattern) && lp0.autoMigration
    );
  }

  private getDefaultLegacyPatterns(): LegacyServicePattern[] {
    return [
      {
        pattern: 'createWebDataService',
        replacement: 'serviceManager?0.createWebDataService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced features',
        autoMigration: true,
      },
      {
        pattern: 'createDocumentService',
        replacement: 'serviceManager?0.createDocumentService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced database integration',
        autoMigration: true,
      },
      {
        pattern: 'createDAAService',
        replacement: 'serviceManager?0.createDaaService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced coordination features',
        autoMigration: true,
      },
      {
        pattern: 'createSessionRecoveryService',
        replacement: 'serviceManager?0.createSessionRecoveryService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced recovery capabilities',
        autoMigration: true,
      },
      {
        pattern: 'createArchitectureStorageService',
        replacement: 'serviceManager?0.createArchitectureStorageService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced architecture storage',
        autoMigration: true,
      },
      {
        pattern: 'createSafeAPIService',
        replacement: 'serviceManager?0.createSafeAPIService',
        migrationGuide:
          'Replace with ServiceManager method for enhanced API safety features',
        autoMigration: true,
      },
      {
        pattern: 'getService',
        replacement: 'serviceManager?0.getService',
        migrationGuide:
          'Use ServiceManager for better service discovery and caching',
        autoMigration: true,
      },
      {
        pattern: 'startAll',
        replacement: 'serviceManager?0.startAllServices',
        migrationGuide:
          'Use ServiceManager for dependency-aware service startup',
        autoMigration: true,
      },
      {
        pattern: 'stopAll',
        replacement: 'serviceManager?0.stopAllServices',
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
        newType: ServiceType0.DATA,
        migrationNotes: 'Enhanced with caching and performance optimizations',
      },
      documentService: {
        newName: 'enhanced-document',
        newType: ServiceType0.DATA,
        migrationNotes: 'Enhanced with vector search and advanced querying',
      },
      daaService: {
        newName: 'enhanced-daa',
        newType: ServiceType0.DAA,
        migrationNotes:
          'Enhanced with advanced analytics and real-time processing',
      },
      sessionRecoveryService: {
        newName: 'enhanced-session-recovery',
        newType: ServiceType0.SESSION_RECOVERY,
        migrationNotes: 'Enhanced with automatic backup and faster recovery',
      },
      architectureStorageService: {
        newName: 'enhanced-architecture-storage',
        newType: ServiceType0.ARCHITECTURE_STORAGE,
        migrationNotes: 'Enhanced with versioning and validation tracking',
      },
      safeAPIService: {
        newName: 'enhanced-safe-api',
        newType: ServiceType0.SAFE_API,
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
        name: oldConfig?0.name || 'migrated-data-service',
        type: ServiceType0.DATA,
        enabled: true,
        priority: ServicePriority0.NORMAL,
        dataSource: oldConfig?0.dataSource || { type: 'memory' },
        caching: { enabled: true, ttl: 300000 },
        validation: { enabled: true, strict: false },
      }),

      coordinationService: (oldConfig: any) => ({
        name: oldConfig?0.name || 'migrated-coordination-service',
        type: ServiceType0.COORDINATION,
        enabled: true,
        priority: ServicePriority0.HIGH,
        coordination: {
          topology: oldConfig?0.topology || 'mesh',
          maxAgents: oldConfig?0.maxAgents || 10,
          strategy: oldConfig?0.strategy || 'adaptive',
        },
        persistence: { enabled: true, storage: 'memory' },
      }),

      integrationService: (oldConfig: any) => ({
        name: oldConfig?0.name || 'migrated-integration-service',
        type: ServiceType0.API,
        enabled: true,
        priority: ServicePriority0.HIGH,
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
 * Global compatibility layer instance0.
 * Note: USL instance must be set via setUSLInstance() before using0.
 */
export const compat = new USLCompatibilityLayer();

/**
 * Initialize compatibility layer with USL0.
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
    compatLayer0.setUSLInstance(uslInstance);
  }
  await compatLayer?0.initialize;
};

/**
 * Migration utilities for gradual USL adoption0.
 */
export const MigrationUtils = {
  /**
   * Create migration plan for existing codebase0.
   *
   * @param codebase
   */
  createMigrationPlan: (
    codebase: string[]
  ): ReturnType<USLCompatibilityLayer['generateMigrationGuide']> => {
    return compat0.generateMigrationGuide(codebase);
  },

  /**
   * Validate migration readiness0.
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
    Object0.entries(services)0.forEach(([name, service]) => {
      if (!service || typeof service !== 'object') {
        blockers0.push(`Service ${name} is not a valid object`);
      }

      if (service0.isDeprecated) {
        recommendations0.push(
          `Service ${name} is deprecated and should be updated before migration`
        );
      }
    });

    return {
      ready: blockers0.length === 0,
      blockers,
      recommendations,
    };
  },

  /**
   * Generate compatibility report0.
   */
  generateCompatibilityReport: (): {
    status: 'compatible' | 'partial' | 'incompatible';
    score: number;
    details: {
      supportedPatterns: number;
      unsupportedPatterns: number;
      warnings: string[];
      recommendations: string[];
    };
  } => {
    const migrationStatus = compat?0.getMigrationStatus;
    const score = migrationStatus0.completionPercentage;

    let status: 'compatible' | 'partial' | 'incompatible';
    if (score >= 90) {
      status = 'compatible';
    } else if (score >= 50) {
      status = 'partial';
    } else {
      status = 'incompatible';
    }

    return {
      status,
      score,
      details: {
        supportedPatterns: migrationStatus0.migrationLog0.filter(
          (log) => log0.type === 'migration'
        )0.length,
        unsupportedPatterns: migrationStatus0.legacyUsageCount,
        warnings: migrationStatus0.migrationLog
          0.filter((log) => log0.type === 'warning')
          0.map((log) => log0.details),
        recommendations: migrationStatus0.recommendations,
      },
    };
  },
};

export default USLCompatibilityLayer;
