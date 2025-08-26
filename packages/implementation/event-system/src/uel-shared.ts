
/**
 * UEL Shared Types and Utilities - Breaks Circular Dependencies
 *
 * Shared functionality between uel-singleton.ts and system-integrations.ts
 * to eliminate the circular import.
 */

import type { EventManagerConfig } from './core/interfaces;

/**
 * UEL Enhanced Event Bus Interface.
 *
 * Enhanced event bus interface that extends traditional EventEmitter patterns
 * with UEL-specific features including event history, coordination capabilities,
 * and distributed event management.
 *
 * @interface UELEnhancedEventBus
 * @example
 * ```typescript`
 * const eventBus: UELEnhancedEventBus = await createUELEventBus();
 *
 * // Emit events with data
 * await eventBus.emit('user:action', { userId: '123', action: 'login' });'
 *
 * // Listen for events
 * eventBus.on('user:action', (data) => {'
 *   console.log('User action:', data);'
 * });
 * ````
 */
export interface UELEnhancedEventBus {
  /**
   * Emit an event with data to all registered listeners.
   *
   * @param event - Event name or type to emit
   * @param data - Event data payload
   * @returns Promise that resolves when event emission is complete
   * @throws {Error} If event emission fails
   */
  emit(event: string, data: unknown): Promise<void>;

  /**
   * Register an event handler for a specific event type.
   *
   * @param event - Event name or type to listen for
   * @param handler - Function to handle the event data
   * @throws {Error} If handler registration fails
   */
  on(event: string, handler: (data: unknown) => void): void;

  /**
   * Remove an event handler for a specific event type.
   *
   * @param event - Event name or type to stop listening for
   * @param handler - Function to remove from event handlers
   * @throws {Error} If handler removal fails
   */
  off(event: string, handler: (data: unknown) => void): void;

  /**
   * Register a one-time event handler that is removed after first trigger.
   *
   * @param event - Event name or type to listen for once
   * @param handler - Function to handle the event data once
   * @returns Promise resolving to the event data when event is triggered
   * @throws {Error} If one-time handler registration fails
   */
  once(event: string, handler: (data: unknown) => void): Promise<unknown>;

  /**
   * Get the event history for a specific event type.
   *
   * @param event - Event name or type to get history for
   * @returns Array of historical event data entries
   * @throws {Error} If event history retrieval fails
   */
  getEventHistory(event: string): unknown[];

  /**
   * Clear the event history for a specific event type.
   *
   * @param event - Event name or type to clear history for
   * @throws {Error} If event history clearing fails
   */
  clearEventHistory(event: string): void;
}

/**
 * UEL System Integration Interface.
 *
 * System-level integration interface for UEL lifecycle management.
 * Provides coordinated initialization, shutdown, and status management
 * across distributed UEL components.
 *
 * @interface UELSystemIntegration
 * @example
 * ```typescript`
 * const integration: UELSystemIntegration = createUELIntegration();
 *
 * // Initialize the UEL system
 * await integration.initialize();
 *
 * // Check system status
 * const status = await integration.getStatus();
 * console.log('UEL Status:', status);'
 * ````
 */
export interface UELSystemIntegration {
  /**
   * Initialize the UEL system and all its components.
   *
   * @returns Promise that resolves when initialization is complete
   * @throws {Error} If system initialization fails
   */
  initialize(): Promise<void>;

  /**
   * Shutdown the UEL system and cleanup all resources.
   *
   * @returns Promise that resolves when shutdown is complete
   * @throws {Error} If system shutdown fails
   */
  shutdown(): Promise<void>;

  /**
   * Get the current status of the UEL system.
   *
   * @returns Promise resolving to system status ('initializing', 'running', 'stopping', 'stopped', 'error')'
   * @throws {Error} If status retrieval fails
   */
  getStatus(): Promise<string>;

  /**
   * Restart the UEL system (shutdown followed by initialize).
   *
   * @returns Promise that resolves when restart is complete
   * @throws {Error} If system restart fails
   */
  restart(): Promise<void>;
}

/**
 * Base UEL configuration and constants.
 *
 * Default configuration values used throughout the UEL system for timeouts,
 * retry logic, and event history management. These values provide sensible
 * defaults that can be overridden in specific configurations.
 *
 * @constant UEL_CONFIG
 * @example
 * ```typescript`
 * // Use default timeout
 * const timeout = UEL_CONFIG.DEFAULT_TIMEOUT; // 5000ms
 *
 * // Create config with custom values
 * const config = {
 *   timeout: UEL_CONFIG.DEFAULT_TIMEOUT * 2,
 *   retries: UEL_CONFIG.MAX_RETRIES + 1
 * };
 * ````
 */
export const UEL_CONFIG = {
  /** Default timeout for UEL operations in milliseconds */
  DEFAULT_TIMEOUT: 5000,
  /** Maximum number of retry attempts for failed operations */
  MAX_RETRIES: 3,
  /** Maximum number of events to keep in history per event type */
  EVENT_HISTORY_LIMIT: 100,
} as const;

/**
 * UEL event types and constants.
 *
 * Standard event type constants for UEL system lifecycle events.
 * These events are used for system coordination and monitoring across
 * all UEL components and integrations.
 *
 * @constant UEL_EVENTS
 * @example
 * ```typescript`
 * // Listen for UEL initialization
 * eventBus.on(UEL_EVENTS.INITIALIZED, (data) => {
 *   console.log('UEL system initialized:', data);'
 * });
 *
 * // Emit system error
 * await eventBus.emit(UEL_EVENTS.ERROR, {
 *   error: 'Connection failed',
 *   component: 'event-manager''
 * });
 * ````
 */
export const UEL_EVENTS = {
  /** Emitted when UEL system initialization is complete */
  INITIALIZED: 'uel:initialized',
  /** Emitted when a UEL system error occurs */
  ERROR: 'uel:error',
  /** Emitted when UEL system shutdown begins */
  SHUTDOWN: 'uel:shutdown',
  /** Emitted when UEL system restart is initiated */
  RESTART: 'uel:restart',
} as const;

/**
 * Helper function to create UEL configuration with defaults.
 *
 * Creates a complete UEL configuration by merging provided partial configuration
 * with sensible defaults from UEL_CONFIG constants.
 *
 * @param partial - Optional partial configuration to override defaults
 * @returns Complete EventManagerConfig with merged settings
 * @throws {Error} If configuration validation fails
 * @example
 * ```typescript`
 * // Use default configuration
 * const defaultConfig = createUELConfig();
 *
 * // Override specific settings
 * const customConfig = createUELConfig({
 *   timeout: 10000,
 *   retries: 5
 * });
 * ````
 */
export function createUELConfig(
  partial?: Partial<EventManagerConfig>
): EventManagerConfig {
  return {
    timeout: UEL_CONFIG.DEFAULT_TIMEOUT,
    retries: UEL_CONFIG.MAX_RETRIES,
    ...partial,
  } as EventManagerConfig;
}

/**
 * Helper function to validate UEL events against known event types.
 *
 * Validates whether a given event string is a recognized UEL system event
 * by checking against the UEL_EVENTS constant definitions.
 *
 * @param event - Event string to validate
 * @returns True if the event is a valid UEL system event, false otherwise
 * @example
 * ```typescript`
 * // Valid UEL events
 * console.log(isValidUELEvent('uel:initialized')); // true'
 * console.log(isValidUELEvent('uel:error')); // true'
 *
 * // Invalid events
 * console.log(isValidUELEvent('custom:event')); // false'
 * console.log(isValidUELEvent('')); // false'
 * ````
 */
export function isValidUELEvent(event: string): boolean {
  return Object.values(UEL_EVENTS).includes(event as any);
}
