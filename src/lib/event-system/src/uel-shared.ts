/**
 * UEL Shared Types and Utilities - Breaks Circular Dependencies
 *
 * Shared functionality between uel-singleton.ts and system-integrations.ts
 * to eliminate the circular import.
 */

import type { EventManagerConfig } from './core/interfaces';

/**
 * UEL Enhanced Event Bus Interface.
 */
export interface UELEnhancedEventBus {
  emit(event: string, data: unknown): Promise<void>;
  on(event: string, handler: (data: unknown) => void): void;
  off(event: string, handler: (data: unknown) => void): void;
  once(event: string, handler: (data: unknown) => void): Promise<unknown>;
  getEventHistory(event: string): unknown[];
  clearEventHistory(event: string): void;
}

/**
 * UEL System Integration Interface.
 */
export interface UELSystemIntegration {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getStatus(): Promise<string>;
  restart(): Promise<void>;
}

/**
 * Base UEL configuration and constants.
 */
export const UEL_CONFIG = {
  DEFAULT_TIMEOUT: 5000,
  MAX_RETRIES: 3,
  EVENT_HISTORY_LIMIT: 100,
} as const;

/**
 * UEL event types and constants.
 */
export const UEL_EVENTS = {
  NITIALIZED: 'uel:initialized',
  ERROR: 'uel:error',
  SHUTDOWN: 'uel:shutdown',
  RESTART: 'uel:restart',
} as const;

/**
 * Helper function to create UEL configuration.
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
 * Helper function to validate UEL events.
 */
export function isValidUELEvent(event: string): boolean {
  return Object.values(UEL_EVENTS).includes(event as any);
}
