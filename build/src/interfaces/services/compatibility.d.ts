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
import type { IService } from './core/interfaces.ts';
import { type AnyServiceConfig, ServiceType } from './types.ts';
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
    serviceMappings: Record<string, {
        newName: string;
        newType: ServiceType;
        migrationNotes: string;
    }>;
    /** Configuration transformations */
    configTransformations: Record<string, (oldConfig: any) => AnyServiceConfig>;
}
/**
 * Compatibility wrapper that provides legacy API surface while using USL internally.
 *
 * @example
 */
export declare class USLCompatibilityLayer {
    private serviceManager;
    private logger;
    private config;
    private uslInstance?;
    private migrationLog;
    constructor(config?: Partial<CompatibilityConfig>);
    /**
     * Initialize the compatibility layer.
     */
    initialize(): Promise<void>;
    /**
     * Set the USL instance for fallback operations.
     * This avoids circular dependency issues.
     *
     * @param uslInstance
     */
    setUSLInstance(uslInstance: any): void;
    /**
     * @param name
     * @param options
     * @deprecated Use serviceManager.createWebDataService() instead.
     */
    createWebDataService(name: string, options?: any): Promise<IService>;
    /**
     * @param name
     * @param dbType
     * @param options
     * @deprecated Use serviceManager.createDocumentService() instead.
     */
    createDocumentService(name: string, dbType?: string, options?: any): Promise<IService>;
    /**
     * @param name
     * @param options
     * @deprecated Use serviceManager.createDaaService() instead.
     */
    createDAAService(name: string, options?: any): Promise<IService>;
    /**
     * @param name
     * @param options
     * @deprecated Use serviceManager.createSessionRecoveryService() instead.
     */
    createSessionRecoveryService(name: string, options?: any): Promise<IService>;
    /**
     * @param name
     * @param dbType
     * @param options
     * @deprecated Use serviceManager.createArchitectureStorageService() instead.
     */
    createArchitectureStorageService(name: string, dbType?: string, options?: any): Promise<IService>;
    /**
     * @param name
     * @param baseURL
     * @param options
     * @deprecated Use serviceManager.createSafeAPIService() instead.
     */
    createSafeAPIService(name: string, baseURL: string, options?: any): Promise<IService>;
    /**
     * @param name
     * @deprecated Use serviceManager.getService() instead.
     */
    getService(name: string): IService | undefined;
    /**
     * @deprecated Use serviceManager.getAllServices() instead.
     */
    getAllServices(): Map<string, IService>;
    /**
     * @deprecated Use serviceManager.startAllServices() instead.
     */
    startAll(): Promise<void>;
    /**
     * @deprecated Use serviceManager.stopAllServices() instead.
     */
    stopAll(): Promise<void>;
    /**
     * @deprecated Use serviceManager.getSystemHealth() instead.
     */
    getSystemStatus(): Promise<any>;
    /**
     * Migrate existing service instances to USL.
     *
     * @param services
     */
    migrateExistingServices(services: Record<string, any>): Promise<{
        migrated: IService[];
        failed: Array<{
            name: string;
            error: string;
        }>;
        warnings: string[];
    }>;
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
    };
    /**
     * Get migration status and recommendations.
     */
    getMigrationStatus(): {
        legacyUsageCount: number;
        migrationLog: typeof this.migrationLog;
        recommendations: string[];
        completionPercentage: number;
    };
    /**
     * Migrate ClaudeZenFacade to use USL infrastructure services.
     */
    migrateFacadeToUSL(): Promise<{
        success: boolean;
        facadeService?: IService;
        warnings: string[];
        errors: string[];
    }>;
    /**
     * Migrate pattern integration systems to USL.
     */
    migratePatternIntegrationToUSL(): Promise<{
        success: boolean;
        patternService?: IService;
        warnings: string[];
        errors: string[];
    }>;
    /**
     * Migrate scattered service usage to unified service discovery.
     *
     * @param existingServiceReferences
     */
    migrateServiceDiscovery(existingServiceReferences: Array<{
        name: string;
        currentPattern: string;
        location: string;
    }>): Promise<{
        success: boolean;
        migrationPlan: Array<{
            service: string;
            currentPattern: string;
            newPattern: string;
            location: string;
            autoMigration: boolean;
        }>;
        warnings: string[];
    }>;
    /**
     * Get migration summary and statistics.
     */
    getMigrationSummary(): {
        totalLegacyUsages: number;
        migratedPatterns: number;
        remainingMigrations: number;
        migrationPercentage: number;
        mostUsedLegacyPatterns: Array<{
            pattern: string;
            count: number;
        }>;
        recommendedActions: string[];
    };
    private logLegacyUsage;
    private logMigration;
    private detectServiceType;
    private transformServiceConfig;
    private canAutoMigratePattern;
    private getDefaultLegacyPatterns;
    private getDefaultServiceMappings;
    private getDefaultConfigTransformations;
}
/**
 * Global compatibility layer instance.
 * Note: USL instance must be set via setUSLInstance() before using.
 */
export declare const compat: USLCompatibilityLayer;
/**
 * Initialize compatibility layer with USL.
 *
 * @param config
 * @param uslInstance
 */
export declare const initializeCompatibility: (config?: Partial<CompatibilityConfig>, uslInstance?: any) => Promise<void>;
/**
 * Migration utilities for gradual USL adoption.
 */
export declare const MigrationUtils: {
    /**
     * Create migration plan for existing codebase.
     *
     * @param codebase
     */
    createMigrationPlan: (codebase: string[]) => ReturnType<USLCompatibilityLayer["generateMigrationGuide"]>;
    /**
     * Validate migration readiness.
     *
     * @param services
     */
    validateMigrationReadiness: (services: Record<string, any>) => {
        ready: boolean;
        blockers: string[];
        recommendations: string[];
    };
    /**
     * Generate compatibility report.
     */
    generateCompatibilityReport: () => {
        status: "compatible" | "partial" | "incompatible";
        score: number;
        details: {
            supportedPatterns: number;
            unsupportedPatterns: number;
            warnings: string[];
            recommendations: string[];
        };
    };
};
export default USLCompatibilityLayer;
//# sourceMappingURL=compatibility.d.ts.map