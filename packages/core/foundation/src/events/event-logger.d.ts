/**
 * @fileoverview Event Logger - Development Event Visibility
 *
 * Simple event logging system for development-time debugging and monitoring.
 * Provides type-safe event validation and payload inspection.
 */
/**
 * Development-mode event logger with forced enable capability
 */
export declare class EventLogger {
  private static enabled;
  private static forceEnabled;
  private static foundationConfigEnabled;
  /**
   * Force enable event logging regardless of NODE_ENV
   */
  static enable(): void;
  /**
   * Disable forced event logging (revert to NODE_ENV check)
   */
  static disable(): void;
  /**
   * Check if logging is currently enabled
   */
  static isEnabled(): boolean;
  /**
   * Log event with optional payload
   */
  static log(eventName: string, payload?: unknown): void;
  /**
   * Log event flow between components
   */
  static logFlow(from: string, to: string, eventName: string): void;
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
  ): void;
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
  ): void;
}
/**
 * Quick event logging without needing to reference EventLogger class
 */
export declare function logEvent(eventName: string, payload?: unknown): void;
/**
 * Quick flow logging
 */
export declare function logFlow(
  from: string,
  to: string,
  eventName: string
): void;
/**
 * Quick error logging
 */
export declare function logError(
  eventName: string,
  error: Error | string,
  component?: string
): void;
//# sourceMappingURL=event-logger.d.ts.map
