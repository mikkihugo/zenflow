/**
 * UEL (Unified Event Layer) - System Integration Layer.
 *
 * Comprehensive system integration layer that enhances existing EventEmitter-based
 * Systems with UEL capabilities while maintaining 100% backward compatibility.
 *
 * This module provides migration utilities and enhanced versions of core systems
 * That can gradually adopt UEL features without breaking existing functionality.
 *
 * @file System Integration and Migration Implementation.
 */
import { type Logger, EventEmitter } from '@claude-zen/foundation';
import type { UELCompatibleEventEmitter } from './compatibility';
import type { EventManagerType, EventManager, SystemEvent } from './core/interfaces';
interface EventManagerInterface extends EventManager {
    stop(): Promise<void>;
    destroy(): Promise<void>;
}
interface UELSystem {
    initialize(config: any): Promise<void>;
    getEventManager(): EventManager;
    createSystemEventManager(name: string, config: any): Promise<EventManagerInterface>;
    createCoordinationEventManager(name: string, config: any): Promise<EventManagerInterface>;
    createInterfaceEventManager(name: string, config: any): Promise<EventManagerInterface>;
    getSystemStatus(): Promise<any>;
    shutdown(): Promise<void>;
}
/**
 * Enhanced Event Bus with UEL integration.
 * Provides backward compatibility with existing event-bus.ts while adding UEL features.
 *
 * @example
 * ```typescript
 * const eventBus = new UELEnhancedEventBus({
 *   enableUEL: true,
 *   uelIntegration: {
 *     managerType: 'system',
 *     managerName: 'main-system'
 *   }
 * });
 * ```
 */
export declare class UELEnhancedEventBus extends EventEmitter {
    private uelManager?;
    private uelEnabled;
    private eventMappings;
    private logger;
    constructor(options?: {
        enableUEL?: boolean;
        uelIntegration?: {
            eventManager?: EventManager;
            managerType?: EventManagerType;
            managerName?: string;
        };
        logger?: Logger;
        maxListeners?: number;
    });
    /**
     * Initialize UEL integration for the event bus.
     *
     * @param integration - UEL integration configuration
     */
    private initializeUELIntegration;
    /**
     * Enhanced emit with UEL integration.
     */
    emit(event: string, ...args: any[]): boolean;
    /**
     * Get UEL manager if available.
     */
    getUELManager(): EventManager | undefined;
    /**
     * Check if UEL integration is enabled.
     */
    isUELEnabled(): boolean;
    /**
     * Add event mapping for UEL integration.
     */
    addEventMapping(originalEvent: string, uelEvent: string): void;
    /**
     * Remove event mapping.
     */
    removeEventMapping(originalEvent: string): void;
    /**
     * Get all event mappings.
     */
    getEventMappings(): Map<string, string>;
}
/**
 * System Integration Manager.
 * Handles coordination between different event systems.
 */
export declare class SystemIntegrationManager {
    private logger;
    private eventManagers;
    private integrationConfig;
    constructor(config?: any);
    /**
     * Register an event manager.
     */
    registerEventManager(name: string, manager: EventManager): void;
    /**
     * Unregister an event manager.
     */
    unregisterEventManager(name: string): void;
    /**
     * Get an event manager by name.
     */
    getEventManager(name: string): EventManager | undefined;
    /**
     * List all registered event managers.
     */
    listEventManagers(): string[];
    /**
     * Broadcast event to all registered managers.
     */
    broadcastEvent(event: SystemEvent): Promise<void>;
    /**
     * Initialize system integration.
     */
    initialize(): Promise<void>;
    /**
     * Shutdown system integration.
     */
    shutdown(): Promise<void>;
}
/**
 * Migration Helper for EventEmitter to UEL.
 */
export declare class EventEmitterToUELMigrationHelper {
    private logger;
    constructor();
    /**
     * Create a compatibility wrapper.
     */
    createCompatibilityWrapper(originalEmitter: EventEmitter, uelManager: EventManager): UELCompatibleEventEmitter;
    /**
     * Migrate events from EventEmitter to UEL.
     */
    migrateEvents(source: EventEmitter, target: EventManager, eventMappings?: Map<string, string>): Promise<void>;
}
/**
 * UEL Integration Factory.
 */
export declare class UELIntegrationFactory {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): UELIntegrationFactory;
    /**
     * Create enhanced event bus with UEL integration.
     */
    createEnhancedEventBus(config: {
        enableUEL?: boolean;
        uelIntegration?: {
            eventManager?: EventManager;
            managerType?: EventManagerType;
            managerName?: string;
        };
        logger?: Logger;
    }): UELEnhancedEventBus;
    /**
     * Create system integration manager.
     */
    createSystemIntegrationManager(config?: any): SystemIntegrationManager;
    /**
     * Create migration helper.
     */
    createMigrationHelper(): EventEmitterToUELMigrationHelper;
}
export declare const uelIntegrationFactory: UELIntegrationFactory;
/**
 * System lifecycle management utilities.
 */
export declare class SystemLifecycleManager {
    private logger;
    private systems;
    constructor();
    /**
     * Register a system.
     */
    registerSystem(name: string, system: UELSystem): void;
    /**
     * Unregister a system.
     */
    unregisterSystem(name: string): void;
    /**
     * Initialize all registered systems.
     */
    initializeAll(config?: any): Promise<void>;
    /**
     * Shutdown all registered systems.
     */
    shutdownAll(): Promise<void>;
    /**
     * Get system status for all registered systems.
     */
    getSystemsStatus(): Promise<Record<string, any>>;
}
export declare const systemLifecycleManager: SystemLifecycleManager;
export {};
//# sourceMappingURL=system-integrations.d.ts.map