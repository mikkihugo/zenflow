/**
 * UEL (Unified Event Layer) - System Integration Layer.
 *
 * Comprehensive system integration layer that enhances existing EventEmitter-based.
 * Systems with UEL capabilities while maintaining 100% backward compatibility.
 *
 * This module provides migration utilities and enhanced versions of core systems.
 * That can gradually adopt UEL features without breaking existing functionality..
 *
 * @file System Integration and Migration Implementation.
 */
import { EventEmitter } from 'node:events';
import { EventEmitterMigrationHelper, type UELCompatibleEventEmitter } from './compatibility.ts';
import type { EventManagerConfig, EventManagerType, IEventManager } from './core/interfaces.ts';
import type { EventManager } from './manager.ts';
/**
 * Enhanced Event Bus with UEL integration.
 * Provides backward compatibility with existing event-bus.ts while adding UEL features.
 *
 * @example
 */
export declare class UELEnhancedEventBus extends EventEmitter {
    private uelManager?;
    private uelEnabled;
    private eventMappings;
    private logger?;
    private migrationHelper?;
    constructor(options?: {
        enableUEL?: boolean;
        uelIntegration?: {
            eventManager?: EventManager;
            managerType?: EventManagerType;
            managerName?: string;
        };
        logger?: any;
        maxListeners?: number;
    });
    /**
     * Initialize UEL integration for the event bus.
     *
     * @param integration
     * @param integration.eventManager
     * @param integration.managerType
     * @param integration.managerName
     */
    private initializeUELIntegration;
    /**
     * Enhanced emit with UEL integration and metrics.
     *
     * @param eventName
     * @param {...any} args
     */
    emit(eventName: string | symbol, ...args: any[]): boolean;
    /**
     * Enhanced on with UEL subscription tracking.
     *
     * @param eventName
     * @param listener
     */
    on(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Get comprehensive event bus status including UEL integration.
     */
    getStatus(): {
        eventEmitter: {
            maxListeners: number;
            eventNames: (string | symbol)[];
            listenerCount: number;
        };
        uel: {
            enabled: boolean;
            hasManager: boolean;
            mappedEvents: number;
        };
        integration: {
            compatible: boolean;
            migrationReady: boolean;
        };
    };
    /**
     * Map event names to UEL event types for better categorization.
     *
     * @param eventEmitterEvent
     * @param uelEventType
     */
    mapEventToUEL(eventEmitterEvent: string, uelEventType: string): void;
    /**
     * Enable UEL mode for the event bus.
     *
     * @param eventManager
     * @param options
     * @param options.managerType
     * @param options.managerName
     * @param options.migrateExistingListeners
     */
    enableUELMode(eventManager: EventManager, options?: {
        managerType?: EventManagerType;
        managerName?: string;
        migrateExistingListeners?: boolean;
    }): Promise<void>;
    /**
     * Private methods for UEL integration.
     */
    private emitToUEL;
    private trackUELSubscription;
    private migrateExistingListeners;
}
/**
 * Enhanced Application Coordinator with UEL integration.
 * Maintains compatibility with existing application-coordinator.ts.
 *
 * @example
 */
export declare class UELEnhancedApplicationCoordinator extends EventEmitter {
    private uelSystem?;
    private eventBus?;
    private systemManagers;
    private logger?;
    constructor(options?: {
        enableUEL?: boolean;
        logger?: any;
        uelConfig?: {
            enableValidation?: boolean;
            enableCompatibility?: boolean;
            healthMonitoring?: boolean;
        };
    });
    /**
     * Initialize UEL system for the application coordinator.
     *
     * @param config
     * @param config.enableValidation
     * @param config.enableCompatibility
     * @param config.healthMonitoring
     */
    private initializeUEL;
    /**
     * Set up event mappings for application coordinator events.
     */
    private setupEventMappings;
    /**
     * Create system-specific event managers.
     */
    private createSystemManagers;
    /**
     * Enhanced emit that routes to appropriate UEL managers.
     *
     * @param eventName
     * @param {...any} args
     */
    emit(eventName: string | symbol, ...args: any[]): boolean;
    /**
     * Get comprehensive system status including UEL integration.
     */
    getSystemStatus(): Promise<{
        applicationCoordinator: {
            initialized: boolean;
            eventNames: (string | symbol)[];
            listenerCount: number;
        };
        uel: {
            enabled: boolean;
            systemStatus?: any;
            managersCreated: number;
        };
        eventBus?: ReturnType<UELEnhancedEventBus['getStatus']>;
    }>;
    /**
     * Create event manager for specific system component.
     *
     * @param componentName
     * @param type
     * @param config
     */
    createComponentManager(componentName: string, type?: EventManagerType, config?: Partial<EventManagerConfig>): Promise<IEventManager | null>;
    /**
     * Validate system integration health.
     */
    validateIntegration(): Promise<{
        valid: boolean;
        score: number;
        issues: string[];
        recommendations: string[];
    }>;
    /**
     * Shutdown UEL integration gracefully.
     */
    shutdown(): Promise<void>;
}
/**
 * Observer System Enhancement with UEL integration.
 * Maintains compatibility with existing observer-system.ts.
 *
 * @example
 */
export declare class UELEnhancedObserverSystem extends EventEmitter {
    private uelEventManager?;
    private observers;
    private logger?;
    constructor(options?: {
        enableUEL?: boolean;
        eventManager?: EventManager;
        logger?: any;
    });
    /**
     * Initialize UEL integration for observer system.
     *
     * @param eventManager
     */
    private initializeUELIntegration;
    /**
     * Create observer with optional UEL integration.
     *
     * @param name
     * @param type
     */
    createObserver(name: string, type?: string): EventEmitter;
    /**
     * Enhance observer with UEL capabilities.
     *
     * @param observer
     * @param name
     * @param type
     */
    private enhanceObserverWithUEL;
    /**
     * Get observer system status.
     */
    getStatus(): {
        observerSystem: {
            totalObservers: number;
            observers: string[];
        };
        uel: {
            enabled: boolean;
            hasManager: boolean;
        };
    };
    /**
     * Remove observer and clean up resources.
     *
     * @param name
     */
    removeObserver(name: string): boolean;
    /**
     * Get observer by name.
     *
     * @param name
     */
    getObserver(name: string): EventEmitter | undefined;
    /**
     * List all observer names.
     */
    listObservers(): string[];
}
/**
 * System Integration Factory.
 * Provides factory methods for creating enhanced versions of core systems.
 *
 * @example
 */
export declare class SystemIntegrationFactory {
    private static instance;
    private eventManager?;
    private logger?;
    private constructor();
    static getInstance(): SystemIntegrationFactory;
    /**
     * Initialize the factory with UEL event manager.
     *
     * @param eventManager
     * @param logger
     */
    initialize(eventManager: EventManager, logger?: any): Promise<void>;
    /**
     * Create enhanced event bus with UEL integration.
     *
     * @param options
     * @param options.enableUEL
     * @param options.managerType
     * @param options.managerName
     * @param options.maxListeners
     */
    createEnhancedEventBus(options?: {
        enableUEL?: boolean;
        managerType?: EventManagerType;
        managerName?: string;
        maxListeners?: number;
    }): UELEnhancedEventBus;
    /**
     * Create enhanced application coordinator with UEL integration.
     *
     * @param options
     * @param options.enableUEL
     * @param options.uelConfig
     * @param options.uelConfig.enableValidation
     * @param options.uelConfig.enableCompatibility
     * @param options.uelConfig.healthMonitoring
     */
    createEnhancedApplicationCoordinator(options?: {
        enableUEL?: boolean;
        uelConfig?: {
            enableValidation?: boolean;
            enableCompatibility?: boolean;
            healthMonitoring?: boolean;
        };
    }): UELEnhancedApplicationCoordinator;
    /**
     * Create enhanced observer system with UEL integration.
     *
     * @param options
     * @param options.enableUEL
     */
    createEnhancedObserverSystem(options?: {
        enableUEL?: boolean;
    }): UELEnhancedObserverSystem;
    /**
     * Check if UEL integration is available.
     */
    isUELAvailable(): boolean;
    /**
     * Get integration status.
     */
    getStatus(): {
        initialized: boolean;
        uelAvailable: boolean;
        eventManagerReady: boolean;
    };
}
/**
 * Utility functions for system integration.
 */
/**
 * Create UEL-enhanced version of any EventEmitter-based class.
 *
 * @param originalInstance
 * @param name
 * @param eventManager
 * @param managerType
 * @param logger
 * @example
 */
export declare function enhanceWithUEL<T extends EventEmitter>(originalInstance: T, name: string, eventManager: EventManager, managerType?: EventManagerType, logger?: any): Promise<UELCompatibleEventEmitter>;
/**
 * Analyze existing EventEmitter usage across the system.
 *
 * @param logger
 * @example
 */
export declare function analyzeSystemEventEmitterUsage(systems: {
    [key: string]: EventEmitter;
}, logger?: any): {
    totalSystems: number;
    systemAnalyses: {
        [key: string]: ReturnType<EventEmitterMigrationHelper['analyzeEventEmitter']>;
    };
    migrationRecommendations: string[];
    overallComplexity: 'low' | 'medium' | 'high';
};
/**
 * Global system integration utilities.
 */
export declare const UELSystemIntegration: {
    factory: SystemIntegrationFactory;
    EnhancedEventBus: typeof UELEnhancedEventBus;
    EnhancedApplicationCoordinator: typeof UELEnhancedApplicationCoordinator;
    EnhancedObserverSystem: typeof UELEnhancedObserverSystem;
    enhanceWithUEL: typeof enhanceWithUEL;
    analyzeSystemEventEmitterUsage: typeof analyzeSystemEventEmitterUsage;
    initialize(eventManager: EventManager, logger?: any): Promise<void>;
};
export default UELSystemIntegration;
//# sourceMappingURL=system-integrations.d.ts.map