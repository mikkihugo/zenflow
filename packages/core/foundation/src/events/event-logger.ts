/**
 * @fileoverview Event Logger - Development Event Visibility
 *
 * Simple event logging system for development-time debugging and monitoring.
 * Provides type-safe event validation and payload inspection.
 */

import { getLogger } from '../core/logging/logging.service.js';

const logger = getLogger('EventLogger');

// ============================================================================
// EVENT LOGGER - Development Event Visibility
// ============================================================================

/**
 * Development-mode event logger with forced enable capability
 */
export class EventLogger {
  private static enabled = process.env['NODE_ENV'] === 'development';
  private static forceEnabled = false;
  private static foundationConfigEnabled =
    process.env['CLAUDE_EVENT_LOGGING'] === 'true';

  /**
   * Force enable event logging regardless of NODE_ENV
   */
  static enable(): void {
    this.forceEnabled = true;
  }

  /**
   * Disable forced event logging (revert to NODE_ENV check)
   */
  static disable(): void {
    this.forceEnabled = false;
  }

  /**
   * Check if logging is currently enabled
   */
  static isEnabled(): boolean {
    return this.forceEnabled || this.foundationConfigEnabled || this.enabled;
  }

  /**
   * Log event with optional payload
   */
  static log(eventName: string, payload?: unknown): void {
    if (!this.isEnabled()) return;

    logger.info(' Event:' + eventName);

    if (payload) {
      logger.info(' Payload:', payload);
    }
  }

  /**
   * Log event flow between components
   */
  static logFlow(from: string, to: string, eventName: string): void {
    if (!this.isEnabled()) return;

    logger.info(' Flow:${from}  ${eventName}  ' + to);
  }

  /**
   * Log event with context information
   */
  static logWithContext(
    eventName: string,
    payload: unknown,
    context: {
      component?: string;
      phase?: string;
      timestamp?: Date;
    }
  ): void {
    if (!this.isEnabled()) return;

    const ctx = {
      component: context.component || 'unknown',
      phase: context.phase,
      timestamp: context.timestamp || new Date(),
    };

    logger.info(
      ' Event: ${eventName} [${ctx.component}' + ctx.phase ? ':' + ctx.phase : '' + ']'
    );
    logger.info(' Time:' + ctx.timestamp.toISOString());

    if (payload) {
      logger.info(' Payload:', payload);
    }
  }

  /**
   * Log error events with enhanced formatting
   */
  static logError(
    eventName: string,
    error: Error | string,
    context?: {
      component?: string;
      phase?: string;
    }
  ): void {
    if (!this.isEnabled()) return;

    const ctx = context || {};
    const errorMessage = error instanceof Error ? error.message : error;
    const errorStack = error instanceof Error ? error.stack : undefined;

    logger.error(
      ' Error Event: ${eventName} [${ctx.component || 'unknown'}' + ctx.phase ? ':' + ctx.phase : '' + ']'
    );

    logger.error(' Error: ' + errorMessage);

    if (errorStack) {
      logger.error(' Stack:', errorStack);
    }
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick event logging without needing to reference EventLogger class
 */
export function logEvent(eventName: string, payload?: unknown): void {
  EventLogger.log(eventName, payload);
}

/**
 * Quick flow logging
 */
export function logFlow(from: string, to: string, eventName: string): void {
  EventLogger.logFlow(from, to, eventName);
}

/**
 * Quick error logging
 */
export function logError(
  eventName: string,
  error: Error | string,
  component?: string
): void {
  EventLogger.logError(eventName, error, { component });
}
