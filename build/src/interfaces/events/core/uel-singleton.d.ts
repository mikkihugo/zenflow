/**
 * @file UEL Singleton.
 *
 * Extracted UEL class to break circular dependency between index.ts and system-integrations.ts.
 */
import type { CompatibilityFactory } from '../compatibility.ts';
import type { EventManager } from '../manager.ts';
import type { EventRegistry } from '../registry.ts';
import type { UELValidationFramework } from '../validation.ts';
import type { EventManagerConfig } from './interfaces.ts';
/**
 * UEL Main Interface - Primary entry point for the Unified Event Layer.
 *
 * @example
 */
export declare class UEL {
    private static instance;
    private initialized;
    private factory;
    private registry;
    private eventManager;
    private eventRegistry;
    private validationFramework;
    private compatibilityFactory;
    private constructor();
    static getInstance(): UEL;
    initialize(config?: {
        logger?: Console | {
            debug: Function;
            info: Function;
            warn: Function;
            error: Function;
        };
        config?: Record<string, unknown>;
        autoRegisterFactories?: boolean;
        enableValidation?: boolean;
        enableCompatibility?: boolean;
        healthMonitoring?: boolean;
    }): Promise<void>;
    isInitialized(): boolean;
    getEventManager(): EventManager;
    createSystemEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any>;
    getSystemStatus(): Promise<any>;
    getEventRegistry(): EventRegistry;
    getValidationFramework(): UELValidationFramework | null;
    getCompatibilityFactory(): CompatibilityFactory | null;
    createCoordinationEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any>;
    createCommunicationEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any>;
    createMonitoringEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any>;
    createInterfaceEventManager(name: string, config?: Partial<EventManagerConfig>): Promise<any>;
    getHealthStatus(): Promise<Array<{
        name: string;
        status: string;
        subscriptions: number;
        queueSize: number;
        errorRate: number;
        uptime: number;
        lastCheck: Date;
        metadata: Record<string, unknown>;
    }>>;
    migrateEventEmitter(emitter: {
        on: Function;
        off?: Function;
        emit: Function;
        listeners?: Function;
    }, _name: string, _type: string): Promise<any>;
    createEnhancedEventBus(config?: {
        enableUEL?: boolean;
        managerName?: string;
    }): Promise<any>;
    createEnhancedApplicationCoordinator(config?: {
        enableUEL?: boolean;
        uelConfig?: any;
    }): Promise<any>;
    createEnhancedObserverSystem(config?: {
        enableUEL?: boolean;
    }): Promise<any>;
    analyzeSystemEventEmitters(systems: {
        [key: string]: any;
    }): Promise<{
        migrationRecommendations: string[];
    }>;
    shutdown(): Promise<void>;
}
export declare const uel: UEL;
//# sourceMappingURL=uel-singleton.d.ts.map