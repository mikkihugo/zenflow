/**
 * UEL (Unified Event Layer) - Backward Compatibility Layer.
 *
 * Provides 100% backward compatibility with existing EventEmitter code.
 * While offering enhanced UEL capabilities and migration utilities..
 *
 * @file Backward Compatibility Implementation.
 */

import { EventEmitter } from 'node:events';
import type { ILogger } from '../../core/interfaces/base-interfaces';
import type {
  EventManagerType,
  IEventManager,
  SystemEvent,
} from './core/interfaces';
import { EventManagerTypes } from './core/interfaces';
import type { EventManager } from './manager';

/**
 * Enhanced EventEmitter that provides UEL integration while maintaining compatibility.
 *
 * @example
 */
export class UELCompatibleEventEmitter extends EventEmitter {
  private uelManager?: IEventManager;
  private uelEnabled = false;
  private eventMappings = new Map<string, string>();
  private migrationMode: 'disabled' | 'passive' | 'active' = 'passive';
  private logger?: ILogger;

  constructor(options?: {
    enableUEL?: boolean;
    uelManager?: IEventManager;
    migrationMode?: 'disabled' | 'passive' | 'active';
    logger?: ILogger;
  }) {
    super();

    this.uelEnabled = options?.enableUEL ?? false;
    this.uelManager = options?.uelManager ?? undefined;
    this.migrationMode = options?.migrationMode ?? 'passive';
    this.logger = options?.logger;

    // Set higher max listeners for compatibility
    this.setMaxListeners(1000);
  }

  /**
   * Enable UEL integration with migration support.
   *
   * @param manager
   * @param options
   * @param options.migrateExistingListeners
   * @param options.preserveEventEmitterBehavior
   */
  async enableUEL(
    manager?: IEventManager,
    options?: {
      migrateExistingListeners?: boolean;
      preserveEventEmitterBehavior?: boolean;
    }
  ): Promise<void> {
    if (manager) {
      this.uelManager = manager;
    }

    this.uelEnabled = true;
    this.migrationMode = 'active';

    // Migrate existing listeners if requested
    if (options?.migrateExistingListeners) {
      await this.migrateExistingListeners();
    }

    this.logger?.info('✅ UEL integration enabled for EventEmitter');
  }

  /**
   * Disable UEL integration (fallback to pure EventEmitter).
   */
  disableUEL(): void {
    this.uelEnabled = false;
    this.migrationMode = 'disabled';
    this.uelManager = undefined as IEventManager | undefined;

    this.logger?.info('❌ UEL integration disabled for EventEmitter');
  }

  /**
   * Enhanced emit with UEL integration.
   *
   * @param eventName
   * @param {...any} args
   */
  override emit(eventName: string | symbol, ...args: unknown[]): boolean {
    const result = super.emit(eventName, ...args);

    // UEL integration if enabled
    if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
      this.emitToUEL(eventName, args).catch((error) => {
        this.logger?.error(`UEL emit failed for ${eventName}:`, error);
      });
    }

    return result;
  }

  /**
   * Enhanced on with UEL subscription tracking.
   *
   * @param eventName
   * @param listener
   */
  override on(
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ): this {
    const result = super.on(eventName, listener);

    // Track UEL subscriptions if enabled
    if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
      this.trackUELSubscription(eventName, listener).catch((error) => {
        this.logger?.error(
          `UEL subscription tracking failed for ${eventName}:`,
          error
        );
      });
    }

    return result;
  }

  /**
   * Enhanced once with UEL integration.
   *
   * @param eventName
   * @param listener
   */
  override once(
    eventName: string | symbol,
    listener: (...args: unknown[]) => void
  ): this {
    const result = super.once(eventName, listener);

    // Track one-time UEL subscriptions if enabled
    if (this.uelEnabled && this.uelManager && typeof eventName === 'string') {
      this.trackUELSubscription(eventName, listener, { once: true }).catch(
        (error) => {
          this.logger?.error(
            `UEL once subscription failed for ${eventName}:`,
            error
          );
        }
      );
    }

    return result;
  }

  /**
   * Map EventEmitter event to UEL event type.
   *
   * @param eventEmitterEvent
   * @param uelEventType
   */
  mapEventToUEL(eventEmitterEvent: string, uelEventType: string): void {
    this.eventMappings.set(eventEmitterEvent, uelEventType);
    this.logger?.debug(`Mapped event: ${eventEmitterEvent} -> ${uelEventType}`);
  }

  /**
   * Get UEL compatibility status.
   */
  getUELStatus(): {
    enabled: boolean;
    migrationMode: string;
    hasManager: boolean;
    mappedEvents: number;
    totalListeners: number;
  } {
    return {
      enabled: this.uelEnabled,
      migrationMode: this.migrationMode,
      hasManager: !!this.uelManager,
      mappedEvents: this.eventMappings.size,
      totalListeners: this.eventNames().reduce(
        (total, name) => total + this.listenerCount(name),
        0
      ),
    };
  }

  /**
   * Private methods for UEL integration.
   */

  private async emitToUEL(eventName: string, args: unknown[]): Promise<void> {
    if (!this.uelManager) return;

    try {
      // Get mapped event type or use original name
      const uelEventType = this.eventMappings.get(eventName) || eventName;

      // Create UEL-compatible event
      const uelEvent = this.createUELEvent(uelEventType, eventName, args);

      // Emit to UEL manager
      await this.uelManager.emit(uelEvent);
    } catch (error) {
      if (this.migrationMode === 'active') {
        throw error;
      }
      this.logger?.warn(`UEL emit failed (passive mode): ${eventName}`, error);
    }
  }

  private async trackUELSubscription(
    eventName: string,
    listener: (...args: unknown[]) => void,
    options?: { once?: boolean }
  ): Promise<void> {
    if (!this.uelManager) return;

    try {
      const uelEventType = this.eventMappings.get(eventName) || eventName;

      // Create UEL-compatible listener
      const uelListener = (event: SystemEvent) => {
        // Convert UEL event back to EventEmitter args
        const args = this.convertUELEventToArgs(event);
        listener(...args);
      };

      // Subscribe to UEL manager
      const subscriptionId = this.uelManager.subscribe(
        [uelEventType],
        uelListener
      );

      this.logger?.debug(
        `UEL subscription created: ${subscriptionId} for ${eventName}`
      );
    } catch (error) {
      if (this.migrationMode === 'active') {
        throw error;
      }
      this.logger?.warn(
        `UEL subscription failed (passive mode): ${eventName}`,
        error
      );
    }
  }

  private createUELEvent(
    uelEventType: string,
    originalEvent: string,
    args: unknown[]
  ): SystemEvent {
    return {
      id: `compat-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: new Date(),
      source: 'eventEmitter-compatibility',
      type: uelEventType,
      metadata: {
        originalEvent,
        args,
        compatibility: true,
      },
    };
  }

  private convertUELEventToArgs(event: SystemEvent): unknown[] {
    // Extract original args from metadata if available
    if (event.metadata?.['args'] && Array.isArray(event.metadata['args'])) {
      return event.metadata['args'];
    }

    // Fallback to event object itself
    return [event];
  }

  private async migrateExistingListeners(): Promise<void> {
    const eventNames = this.eventNames();

    for (const eventName of eventNames) {
      if (typeof eventName === 'string') {
        const listeners = this.listeners(eventName);

        for (const listener of listeners) {
          await this.trackUELSubscription(eventName, listener as any);
        }
      }
    }

    this.logger?.info(`Migrated ${eventNames.length} event types to UEL`);
  }
}

/**
 * Migration utilities for converting existing EventEmitter code to UEL.
 *
 * @example
 */
export class EventEmitterMigrationHelper {
  private eventManager: EventManager;
  private logger?: ILogger;
  private migrationStats = {
    scanned: 0,
    migrated: 0,
    failed: 0,
    warnings: 0,
  };

  constructor(eventManager: EventManager, logger?: ILogger) {
    this.eventManager = eventManager;
    this.logger = logger;
  }

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
  async createCompatibleEventEmitter(
    managerName: string,
    managerType: EventManagerType = EventManagerTypes.SYSTEM,
    options?: {
      enableUEL?: boolean;
      migrationMode?: 'disabled' | 'passive' | 'active';
      autoMigrate?: boolean;
    }
  ): Promise<UELCompatibleEventEmitter> {
    // Create UEL manager
    const uelManager = await this.eventManager.createEventManager({
      type: managerType,
      name: managerName,
    });

    // Create compatible EventEmitter
    const eventEmitter = new UELCompatibleEventEmitter({
      enableUEL: options?.enableUEL ?? true,
      uelManager,
      migrationMode: options?.migrationMode ?? 'passive',
      logger: this.logger,
    });

    // Auto-migrate if requested
    if (options?.autoMigrate) {
      await eventEmitter.enableUEL(uelManager, {
        migrateExistingListeners: true,
        preserveEventEmitterBehavior: true,
      });
    }

    this.migrationStats.migrated++;
    return eventEmitter;
  }

  /**
   * Wrap existing EventEmitter with UEL compatibility.
   *
   * @param originalEmitter
   * @param managerName
   * @param managerType
   */
  async wrapEventEmitter(
    originalEmitter: EventEmitter,
    managerName: string,
    managerType: EventManagerType = EventManagerTypes.SYSTEM
  ): Promise<UELCompatibleEventEmitter> {
    try {
      this.migrationStats.scanned++;

      // Create UEL manager
      const uelManager = await this.eventManager.createEventManager({
        type: managerType,
        name: managerName,
      });

      // Create new compatible instance
      const compatibleEmitter = new UELCompatibleEventEmitter({
        enableUEL: true,
        uelManager,
        migrationMode: 'active',
        logger: this.logger,
      });

      // Copy existing listeners
      const eventNames = originalEmitter.eventNames();
      for (const eventName of eventNames) {
        const listeners = originalEmitter.listeners(eventName);
        for (const listener of listeners) {
          compatibleEmitter.on(eventName, listener as any);
        }
      }

      // Copy properties
      compatibleEmitter.setMaxListeners(originalEmitter.getMaxListeners());

      await compatibleEmitter.enableUEL(uelManager, {
        migrateExistingListeners: true,
      });

      this.migrationStats.migrated++;
      this.logger?.info(`✅ Successfully wrapped EventEmitter: ${managerName}`);

      return compatibleEmitter;
    } catch (error) {
      this.migrationStats.failed++;
      this.logger?.error(
        `❌ Failed to wrap EventEmitter ${managerName}:`,
        error
      );
      throw error;
    }
  }

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
  } {
    const eventNames = emitter.eventNames();
    const eventTypes = eventNames.map((name) => String(name));

    const listenerCounts: Record<string, number> = {};
    let totalListeners = 0;

    for (const eventName of eventNames) {
      const count = emitter.listenerCount(eventName);
      listenerCounts[String(eventName)] = count;
      totalListeners += count;
    }

    const recommendations: string[] = [];
    let complexity: 'low' | 'medium' | 'high' = 'low';

    // Analyze patterns and provide recommendations
    if (totalListeners > 50) {
      recommendations.push(
        'Consider using UEL for better performance with many listeners'
      );
      complexity = 'medium';
    }

    if (eventTypes.length > 20) {
      recommendations.push(
        'High number of event types - UEL categorization would help'
      );
      complexity = 'high';
    }

    if (eventTypes.some((type) => type.includes(':') || type.includes('.'))) {
      recommendations.push(
        'Structured event names detected - good UEL migration candidate'
      );
    }

    if (emitter.getMaxListeners() > 100) {
      recommendations.push('High max listeners - UEL provides better scaling');
      complexity = 'high';
    }

    return {
      eventTypes,
      listenerCounts,
      maxListeners: emitter.getMaxListeners(),
      recommendations,
      migrationComplexity: complexity,
    };
  }

  /**
   * Generate migration plan for EventEmitter conversion.
   *
   * @param analysis
   */
  generateMigrationPlan(
    analysis: ReturnType<EventEmitterMigrationHelper['analyzeEventEmitter']>
  ): {
    phases: Array<{
      phase: string;
      description: string;
      steps: string[];
      estimatedEffort: 'low' | 'medium' | 'high';
      dependencies: string[];
    }>;
    totalEffort: 'low' | 'medium' | 'high';
    timeline: string;
  } {
    const phases: Array<{
      phase: string;
      description: string;
      steps: string[];
      estimatedEffort: 'low' | 'medium' | 'high';
      dependencies: string[];
    }> = [];

    // Phase 1: Preparation
    phases.push({
      phase: '1. Preparation',
      description: 'Set up UEL infrastructure and analyze current usage',
      steps: [
        'Initialize UEL Event Manager',
        'Analyze current EventEmitter patterns',
        'Create event type mappings',
        'Set up compatibility layer',
      ],
      estimatedEffort: 'low' as const,
      dependencies: [],
    });

    // Phase 2: Compatibility Layer
    phases.push({
      phase: '2. Compatibility',
      description: 'Implement backward compatibility without breaking changes',
      steps: [
        'Wrap existing EventEmitter instances',
        'Enable passive UEL integration',
        'Test compatibility with existing code',
        'Monitor performance impact',
      ],
      estimatedEffort:
        analysis.migrationComplexity === 'high' ? 'medium' : 'low',
      dependencies: ['Phase 1'],
    });

    // Phase 3: Active Migration
    phases.push({
      phase: '3. Active Migration',
      description: 'Gradually migrate to full UEL functionality',
      steps: [
        'Enable active UEL mode',
        'Migrate high-traffic event patterns',
        'Implement UEL-specific features',
        'Update event handling code',
      ],
      estimatedEffort: analysis.migrationComplexity,
      dependencies: ['Phase 2'],
    });

    // Phase 4: Optimization
    phases.push({
      phase: '4. Optimization',
      description: 'Optimize and clean up legacy code',
      steps: [
        'Remove EventEmitter compatibility layer',
        'Optimize event routing',
        'Implement advanced UEL features',
        'Performance tuning',
      ],
      estimatedEffort:
        analysis.migrationComplexity === 'low' ? 'low' : 'medium',
      dependencies: ['Phase 3'],
    });

    const totalEffort = analysis.migrationComplexity;
    const timeline = {
      low: '1-2 weeks',
      medium: '3-4 weeks',
      high: '6-8 weeks',
    }[totalEffort];

    return {
      phases,
      totalEffort,
      timeline,
    };
  }

  /**
   * Get migration statistics.
   */
  getMigrationStats(): typeof EventEmitterMigrationHelper.prototype.migrationStats {
    return { ...this.migrationStats };
  }

  /**
   * Reset migration statistics.
   */
  resetStats(): void {
    this.migrationStats = {
      scanned: 0,
      migrated: 0,
      failed: 0,
      warnings: 0,
    };
  }
}

/**
 * Factory for creating backward-compatible event emitters.
 *
 * @example
 */
export class CompatibilityFactory {
  private static instance: CompatibilityFactory;
  private migrationHelper?: EventEmitterMigrationHelper;
  private eventManager?: EventManager;

  private constructor() {}

  static getInstance(): CompatibilityFactory {
    if (!CompatibilityFactory.instance) {
      CompatibilityFactory.instance = new CompatibilityFactory();
    }
    return CompatibilityFactory.instance;
  }

  /**
   * Initialize compatibility factory.
   *
   * @param eventManager
   * @param logger
   */
  async initialize(
    eventManager: EventManager,
    logger?: ILogger
  ): Promise<void> {
    this.eventManager = eventManager;
    this.migrationHelper = new EventEmitterMigrationHelper(
      eventManager,
      logger
    );
  }

  /**
   * Create enhanced EventEmitter with UEL capabilities.
   *
   * @param name
   * @param type
   * @param options
   * @param options.enableUEL
   * @param options.migrationMode
   */
  async createEnhancedEventEmitter(
    name: string,
    type: EventManagerType = EventManagerTypes.SYSTEM,
    options?: {
      enableUEL?: boolean;
      migrationMode?: 'disabled' | 'passive' | 'active';
    }
  ): Promise<UELCompatibleEventEmitter> {
    if (!this.migrationHelper) {
      throw new Error('CompatibilityFactory not initialized');
    }

    return await this.migrationHelper.createCompatibleEventEmitter(
      name,
      type,
      options
    );
  }

  /**
   * Wrap existing EventEmitter with UEL capabilities.
   *
   * @param emitter
   * @param name
   * @param type
   */
  async wrapExistingEmitter(
    emitter: EventEmitter,
    name: string,
    type: EventManagerType = EventManagerTypes.SYSTEM
  ): Promise<UELCompatibleEventEmitter> {
    if (!this.migrationHelper) {
      throw new Error('CompatibilityFactory not initialized');
    }

    return await this.migrationHelper.wrapEventEmitter(emitter, name, type);
  }

  /**
   * Get migration helper for advanced operations.
   */
  getMigrationHelper(): EventEmitterMigrationHelper | undefined {
    return this.migrationHelper;
  }
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
export async function createCompatibleEventEmitter(
  name: string,
  type: EventManagerType = EventManagerTypes.SYSTEM,
  eventManager?: EventManager
): Promise<UELCompatibleEventEmitter> {
  const factory = CompatibilityFactory.getInstance();

  if (eventManager && !factory['eventManager']) {
    await factory.initialize(eventManager);
  }

  return await factory.createEnhancedEventEmitter(name, type, {
    enableUEL: true,
    migrationMode: 'passive',
  });
}

/**
 * Wrap existing EventEmitter with UEL compatibility.
 *
 * @param emitter
 * @param name
 * @param type
 * @param eventManager
 * @example
 */
export async function wrapWithUEL(
  emitter: EventEmitter,
  name: string,
  type: EventManagerType = EventManagerTypes.SYSTEM,
  eventManager?: EventManager
): Promise<UELCompatibleEventEmitter> {
  const factory = CompatibilityFactory.getInstance();

  if (eventManager && !factory['eventManager']) {
    await factory.initialize(eventManager);
  }

  return await factory.wrapExistingEmitter(emitter, name, type);
}

export {
  UELCompatibleEventEmitter as CompatibleEventEmitter,
  EventEmitterMigrationHelper as MigrationHelper,
};
