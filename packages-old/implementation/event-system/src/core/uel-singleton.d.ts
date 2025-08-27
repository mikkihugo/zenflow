/**
 * @file UEL Singleton - Enhanced Version
 *
 * Comprehensive UEL singleton that handles complex system integrations,
 * factory management, compatibility layers, and lifecycle management.
 */
import type { Logger } from '@claude-zen/foundation';
import type { EventManagerConfig, EventManager, EventManagerFactory } from './interfaces';
/**
 * UEL System Integration Status
 */
export interface UELSystemStatus {
    initialized: boolean;
    factoriesRegistered: number;
    managersActive: number;
    compatibilityEnabled: boolean;
    validationEnabled: boolean;
    healthMonitoringEnabled: boolean;
    lastHealthCheck?: Date;
    errorCount: number;
}
/**
 * UEL Configuration Options
 */
export interface UELConfig {
    logger?: Logger;
    autoRegisterFactories?: boolean;
    enableValidation?: boolean;
    enableCompatibility?: boolean;
    healthMonitoring?: {
        enabled: boolean;
        interval?: number;
        timeout?: number;
    };
    recovery?: {
        autoRestart?: boolean;
        maxRestarts?: number;
        backoffMultiplier?: number;
    };
    performance?: {
        maxConcurrentEvents?: number;
        eventBufferSize?: number;
        processingTimeout?: number;
    };
    integration?: {
        preserveExistingHandlers?: boolean;
        migrationMode?: 'passive' | 'active';
        fallbackToOriginal?: boolean;
    };
}
/**
 * Enhanced UEL Singleton with comprehensive system integration.
 */
export declare class UEL {
    private static instance;
    private initialized;
    private logger;
    private config;
    private managers;
    private factories;
    private managersById;
    private managersByType;
    private healthCheckInterval?;
    private status;
    private migrationHelper;
    private compatibilityFactory;
    private validationFramework;
    private constructor();
    static getInstance(): UEL;
    initialize(config?: UELConfig): Promise<void>;
    createEventManager(config: EventManagerConfig): Promise<EventManager>;
    private createSimpleManager;
    private registerManager;
    registerFactory(type: string, factory: EventManagerFactory): void;
    getEventManager(name: string): EventManager | undefined;
    getEventManagersByType(type: string): EventManager[];
    listEventManagers(): string[];
    destroyEventManager(name: string): Promise<boolean>;
    cleanup(): Promise<void>;
    enableMigrationSupport(): Promise<void>;
    createCompatibleEventEmitter(name: string): Promise<any>;
    getSystemStatus(): UELSystemStatus;
    isInitialized(): boolean;
    getStats(): {
        initialized: boolean;
        managersCount: number;
        factoriesCount: number;
        managers: string[];
        managersByType: Record<string, string[]>;
        errors: number;
    };
    private initializeCoreComponents;
    private registerBuiltInFactories;
    private enableValidationFramework;
    private enableCompatibilityLayer;
    private startHealthMonitoring;
    private performHealthCheck;
}
/**
 * Get the global UEL instance.
 */
export declare function getUEL(): UEL;
/**
 * Initialize UEL with configuration.
 */
export declare function initializeUEL(config?: UELConfig): Promise<UEL>;
//# sourceMappingURL=uel-singleton.d.ts.map