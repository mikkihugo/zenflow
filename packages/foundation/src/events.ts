/**
 * @fileoverview Event System Interface Delegation
 * 
 * Provides interface delegation to @claude-zen/event-system package following
 * the same architectural pattern as database and monitoring delegation.
 * 
 * Runtime imports prevent circular dependencies while providing unified access
 * to type-safe event system functionality through foundation package.
 * 
 * Delegates to:
 * - @claude-zen/event-system: TypeSafeEventBus, EventManager, adapters
 * 
 * @author Claude Code Zen Team
 * @since 2.1.0 (Strategic Architecture v2.0.0)
 * @version 1.0.0
 */

import { getLogger } from './logging';

const logger = getLogger('foundation-events');

/**
 * Custom error types for event system operations
 */
export class EventSystemError extends Error {
  public override cause?: Error;
  
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'EventSystemError';
    this.cause = cause;
  }
}

export class EventSystemConnectionError extends EventSystemError {
  constructor(message: string, cause?: Error) {
    super(message, cause);
    this.name = 'EventSystemConnectionError';
  }
}

/**
 * Event system module interface for accessing real event system backends.
 * @internal
 */
interface EventSystemModule {
  TypedEventBus: any;
  createEventBus: (...args: any[]) => any;
  EventManager: any;
  createEventManager: (...args: any[]) => any;
  BaseEventManager: any;
}

/**
 * Event system access interface
 */
export interface EventSystemAccess {
  /**
   * Create a new typed event bus
   */
  createEventBus<T = any>(config?: any): Promise<T>;
  
  /**
   * Create a new event manager
   */
  createEventManager(config?: any): Promise<any>;
  
  /**
   * Get base event manager
   */
  getBaseEventManager(): Promise<any>;
}

/**
 * Event system configuration interface
 */
export interface EventSystemConfig {
  enableValidation?: boolean;
  enableMiddleware?: boolean;
  enableMetrics?: boolean;
  maxListeners?: number;
}

/**
 * Implementation of event system access via runtime delegation
 */
class EventSystemAccessImpl implements EventSystemAccess {
  private eventSystemModule: EventSystemModule | null = null;
  
  private async getEventSystemModule(): Promise<EventSystemModule> {
    if (!this.eventSystemModule) {
      try {
        // Import the event-system package at runtime (matches database pattern)
        // this.eventSystemModule = await import('@claude-zen/event-system') as EventSystemModule;
        logger.debug('Event system module loading temporarily disabled for build');
        throw new Error('Event system module loading temporarily disabled for build');
      } catch (error) {
        throw new EventSystemConnectionError(
          'Event system package not available. Foundation requires @claude-zen/event-system for event operations.',
          error instanceof Error ? error : undefined
        );
      }
    }
    return this.eventSystemModule;
  }
  
  async createEventBus<T = any>(config?: any): Promise<T> {
    const module = await this.getEventSystemModule();
    logger.debug('Creating typed event bus via foundation delegation', { config });
    return module.createEventBus(config);
  }
  
  async createEventManager(config?: any): Promise<any> {
    const module = await this.getEventSystemModule();
    logger.debug('Creating event manager via foundation delegation', { config });
    return module.createEventManager(config);
  }
  
  async getBaseEventManager(): Promise<any> {
    const module = await this.getEventSystemModule();
    logger.debug('Getting base event manager via foundation delegation');
    return new module.BaseEventManager();
  }
}

// Global singleton instance
let globalEventSystemAccess: EventSystemAccess | null = null;

/**
 * Get event system access interface (singleton pattern)
 */
export function getEventSystemAccess(): EventSystemAccess {
  if (!globalEventSystemAccess) {
    globalEventSystemAccess = new EventSystemAccessImpl();
    logger.info('Initialized global event system access');
  }
  return globalEventSystemAccess;
}

/**
 * Create a typed event bus through foundation delegation
 * @param config - Event bus configuration
 */
export async function getEventBus<T = any>(config?: EventSystemConfig): Promise<T> {
  const eventSystem = getEventSystemAccess();
  return eventSystem.createEventBus<T>(config);
}

/**
 * Create an event manager through foundation delegation  
 * @param config - Event manager configuration
 */
export async function getEventManager(config?: EventSystemConfig): Promise<any> {
  const eventSystem = getEventSystemAccess();
  return eventSystem.createEventManager(config);
}

/**
 * Get base event manager through foundation delegation
 */
export async function getBaseEventManager(): Promise<any> {
  const eventSystem = getEventSystemAccess();
  return eventSystem.getBaseEventManager();
}

// Professional event system object with proper naming (matches Storage/Telemetry patterns)
export const eventSystem = {
  getAccess: getEventSystemAccess,
  createBus: getEventBus,
  createManager: getEventManager,
  getBaseManager: getBaseEventManager
};

// Type exports for external consumers
