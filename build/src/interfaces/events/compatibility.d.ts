/**
 * UEL (Unified Event Layer) - Backward Compatibility Layer.
 *
 * Provides 100% backward compatibility with existing EventEmitter code.
 * While offering enhanced UEL capabilities and migration utilities..
 *
 * @file Backward Compatibility Implementation.
 */
import { EventEmitter } from 'node:events';
import type { ILogger } from '../../core/interfaces/base-interfaces.ts';
import type { EventManagerType, IEventManager } from './core/interfaces.ts';
import type { EventManager } from './manager.ts';
/**
 * Enhanced EventEmitter that provides UEL integration while maintaining compatibility.
 *
 * @example
 */
export declare class UELCompatibleEventEmitter extends EventEmitter {
    private uelManager?;
    private uelEnabled;
    private eventMappings;
    private migrationMode;
    private logger?;
    constructor(options?: {
        enableUEL?: boolean;
        uelManager?: IEventManager;
        migrationMode?: 'disabled' | 'passive' | 'active';
        logger?: ILogger;
    });
    /**
     * Enable UEL integration with migration support.
     *
     * @param manager
     * @param options
     * @param options.migrateExistingListeners
     * @param options.preserveEventEmitterBehavior
     */
    enableUEL(manager?: IEventManager, options?: {
        migrateExistingListeners?: boolean;
        preserveEventEmitterBehavior?: boolean;
    }): Promise<void>;
    /**
     * Disable UEL integration (fallback to pure EventEmitter).
     */
    disableUEL(): void;
    /**
     * Enhanced emit with UEL integration.
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
     * Enhanced once with UEL integration.
     *
     * @param eventName
     * @param listener
     */
    once(eventName: string | symbol, listener: (...args: any[]) => void): this;
    /**
     * Map EventEmitter event to UEL event type.
     *
     * @param eventEmitterEvent
     * @param uelEventType
     */
    mapEventToUEL(eventEmitterEvent: string, uelEventType: string): void;
    /**
     * Get UEL compatibility status.
     */
    getUELStatus(): {
        enabled: boolean;
        migrationMode: string;
        hasManager: boolean;
        mappedEvents: number;
        totalListeners: number;
    };
    /**
     * Private methods for UEL integration.
     */
    private emitToUEL;
    private trackUELSubscription;
    private createUELEvent;
    private convertUELEventToArgs;
    private migrateExistingListeners;
}
/**
 * Migration utilities for converting existing EventEmitter code to UEL.
 *
 * @example
 */
export declare class EventEmitterMigrationHelper {
    private eventManager;
    private logger?;
    private migrationStats;
    constructor(eventManager: EventManager, logger?: ILogger);
    /**
     * Create UEL-compatible EventEmitter instance.
     *
     * @param managerName
     * @param managerType
     * @param options
     * @param options.enableUEL
     * @param options.migrationMode
     * @param options.autoMigrate
     */
    createCompatibleEventEmitter(managerName: string, managerType?: EventManagerType, options?: {
        enableUEL?: boolean;
        migrationMode?: 'disabled' | 'passive' | 'active';
        autoMigrate?: boolean;
    }): Promise<UELCompatibleEventEmitter>;
    /**
     * Wrap existing EventEmitter with UEL compatibility.
     *
     * @param originalEmitter
     * @param managerName
     * @param managerType
     */
    wrapEventEmitter(originalEmitter: EventEmitter, managerName: string, managerType?: EventManagerType): Promise<UELCompatibleEventEmitter>;
    /**
     * Analyze EventEmitter usage patterns.
     *
     * @param emitter
     */
    analyzeEventEmitter(emitter: EventEmitter): {
        eventTypes: string[];
        listenerCounts: Record<string, number>;
        maxListeners: number;
        recommendations: string[];
        migrationComplexity: 'low' | 'medium' | 'high';
    };
    /**
     * Generate migration plan for EventEmitter conversion.
     *
     * @param analysis
     */
    generateMigrationPlan(analysis: ReturnType<EventEmitterMigrationHelper['analyzeEventEmitter']>): {
        phases: Array<{
            phase: string;
            description: string;
            steps: string[];
            estimatedEffort: 'low' | 'medium' | 'high';
            dependencies: string[];
        }>;
        totalEffort: 'low' | 'medium' | 'high';
        timeline: string;
    };
    /**
     * Get migration statistics.
     */
    getMigrationStats(): typeof EventEmitterMigrationHelper.prototype.migrationStats;
    /**
     * Reset migration statistics.
     */
    resetStats(): void;
}
/**
 * Factory for creating backward-compatible event emitters.
 *
 * @example
 */
export declare class CompatibilityFactory {
    private static instance;
    private migrationHelper?;
    private eventManager?;
    private constructor();
    static getInstance(): CompatibilityFactory;
    /**
     * Initialize compatibility factory.
     *
     * @param eventManager
     * @param logger
     */
    initialize(eventManager: EventManager, logger?: ILogger): Promise<void>;
    /**
     * Create enhanced EventEmitter with UEL capabilities.
     *
     * @param name
     * @param type
     * @param options
     * @param options.enableUEL
     * @param options.migrationMode
     */
    createEnhancedEventEmitter(name: string, type?: EventManagerType, options?: {
        enableUEL?: boolean;
        migrationMode?: 'disabled' | 'passive' | 'active';
    }): Promise<UELCompatibleEventEmitter>;
    /**
     * Wrap existing EventEmitter with UEL capabilities.
     *
     * @param emitter
     * @param name
     * @param type
     */
    wrapExistingEmitter(emitter: EventEmitter, name: string, type?: EventManagerType): Promise<UELCompatibleEventEmitter>;
    /**
     * Get migration helper for advanced operations.
     */
    getMigrationHelper(): EventEmitterMigrationHelper | undefined;
}
/**
 * Convenience functions for quick compatibility setup.
 */
/**
 * Create UEL-compatible EventEmitter instance.
 *
 * @param name
 * @param type
 * @param eventManager
 * @example
 */
export declare function createCompatibleEventEmitter(name: string, type?: EventManagerType, eventManager?: EventManager): Promise<UELCompatibleEventEmitter>;
/**
 * Wrap existing EventEmitter with UEL compatibility.
 *
 * @param emitter
 * @param name
 * @param type
 * @param eventManager
 * @example
 */
export declare function wrapWithUEL(emitter: EventEmitter, name: string, type?: EventManagerType, eventManager?: EventManager): Promise<UELCompatibleEventEmitter>;
export { UELCompatibleEventEmitter as CompatibleEventEmitter, EventEmitterMigrationHelper as MigrationHelper, };
//# sourceMappingURL=compatibility.d.ts.map