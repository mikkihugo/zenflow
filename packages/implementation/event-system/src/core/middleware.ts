/**
 * @fileoverview Modern Event Middleware - koa-compose Integration
 *
 * Professional middleware system using koa-compose for battle-tested middleware composition.
 * Replaces custom middleware implementation with industry-standard patterns.
 *
 * **BATTLE-TESTED DEPENDENCY:**
 * - koa-compose: Used by Koa.js framework for reliable async middleware composition
 *
 * Key Features:
 * - Async middleware support with proper error handling
 * - Context-based middleware with rich event information
 * - Composable middleware pipelines
 * - Foundation integration with logging and error handling
 *
 * @example Basic middleware usage
 * ```typescript`
 * import { createLoggingMiddleware, createTimingMiddleware } from '@claude-zen/event-system/core;
 *
 * const eventBus = new EventBus();
 *
 * // Add battle-tested middleware
 * eventBus.use(createLoggingMiddleware())();
 * eventBus.use(createTimingMiddleware())();
 * eventBus.use(createValidationMiddleware())();
 * ````
 */

import { getLogger, Result, ok, err, safeAsync } from '@claude-zen/foundation';
import type { EventMiddleware, EventContext } from './event-bus;

const logger = getLogger('EventMiddleware');'

// =============================================================================
// BUILT-IN MIDDLEWARE FACTORIES - Common patterns
// =============================================================================

/**
 * Create logging middleware for event tracking.
 * Logs all events with context information.
 */
export function createLoggingMiddleware(
  options: {
    logLevel?: 'debug|info|warn|error;
    includePayload?: boolean;
    loggerName?: string;
  } = {}
): EventMiddleware {
  const {
    logLevel = 'info',
    includePayload = false,
    loggerName = 'EventMiddleware',
  } = options;
  const middlewareLogger = getLogger(loggerName);

  return async (context: EventContext, next: () => Promise<void>) => {
    const { event, payload, timestamp } = context;

    const logData = {
      event: String(event),
      timestamp,
      ...(includePayload && { payload }),
    };

    middlewareLogger[logLevel](
      `[EventMiddleware] Processing event: ${String(event)}`,`
      logData
    );

    // Add to processed chain
    context.processedBy.push('logging-middleware');'

    await next();
  };
}

/**
 * Create timing middleware for performance monitoring.
 * Measures event processing time.
 */
export function createTimingMiddleware(
  options: {
    logSlowEvents?: boolean;
    slowThresholdMs?: number;
    includeInContext?: boolean;
  } = {}
): EventMiddleware {
  const {
    logSlowEvents = true,
    slowThresholdMs = 100,
    includeInContext = true,
  } = options;

  return async (context: EventContext, next: () => Promise<void>) => {
    const startTime = Date.now();

    // Add timing info to context if requested
    if (includeInContext) {
      (context as any).timing = { startTime };
    }

    context.processedBy.push('timing-middleware');'

    try {
      await next();
    } finally {
      const duration = Date.now() - startTime;

      if (includeInContext) {
        (context as any).timing.duration = duration;
      }

      if (logSlowEvents && duration > slowThresholdMs) {
        logger.warn(
          `[EventMiddleware] Slow event detected: ${String(context.event)}`,`
          {
            event: String(context.event),
            duration,
            threshold: slowThresholdMs,
          }
        );
      }
    }
  };
}

/**
 * Create validation middleware using zod schemas.
 * Validates event payloads against schemas.
 */
export function createValidationMiddleware<T>(
  validator: (payload: unknown) => Result<T, Error>,
  options: {
    throwOnError?: boolean;
    logErrors?: boolean;
  } = {}
): EventMiddleware {
  const { throwOnError = false, logErrors = true } = options;

  return async (context: EventContext, next: () => Promise<void>) => {
    const validationResult = validator(context.payload);

    if (validationResult.isOk()) {
      // Update context with validated payload
      context.payload = validationResult.value;
      context.processedBy.push('validation-middleware');'
      await next();
    } else {
      const error = validationResult.error;

      if (logErrors) {
        logger.error(
          `[EventMiddleware] Validation failed for event: ${String(context.event)}`,`
          {
            event: String(context.event),
            error: error.message,
            payload: context.payload,
          }
        );
      }

      if (throwOnError) {
        throw error;
      } else {
        // Skip to next middleware but mark as failed validation
        context.processedBy.push('validation-middleware-failed');'
        await next();
      }
    }
  };
}

/**
 * Create error handling middleware.
 * Catches and handles errors in the middleware chain.
 */
export function createErrorHandlingMiddleware(
  options: {
    logErrors?: boolean;
    continueOnError?: boolean;
    errorHandler?: (error: Error, context: EventContext) => void;
  } = {}
): EventMiddleware {
  const { logErrors = true, continueOnError = true, errorHandler } = options;

  return async (context: EventContext, next: () => Promise<void>) => {
    try {
      context.processedBy.push('error-handling-middleware');'
      await next();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (logErrors) {
        logger.error(
          `[EventMiddleware] Error in middleware chain: ${String(context.event)}`,`
          {
            event: String(context.event),
            error: err.message,
            stack: err.stack,
            processedBy: context.processedBy,
          }
        );
      }

      if (errorHandler) {
        errorHandler(err, context);
      }

      if (!continueOnError) {
        throw err;
      }
    }
  };
}

/**
 * Create rate limiting middleware.
 * Limits event processing rate per event type.
 */
export function createRateLimitingMiddleware(
  options: {
    maxEventsPerSecond?: number;
    windowMs?: number;
    skipOnLimit?: boolean;
  } = {}
): EventMiddleware {
  const {
    maxEventsPerSecond = 100,
    windowMs = 1000,
    skipOnLimit = true,
  } = options;
  const eventCounts = new Map<string, { count: number; windowStart: number }>();

  return async (context: EventContext, next: () => Promise<void>) => {
    const eventKey = String(context.event);
    const now = Date.now();

    const current = eventCounts.get(eventKey)||{ count: 0, windowStart: now };

    // Reset window if expired
    if (now - current.windowStart > windowMs) {
      current.count = 0;
      current.windowStart = now;
    }

    // Check rate limit
    if (current.count >= maxEventsPerSecond) {
      logger.warn(
        `[EventMiddleware] Rate limit exceeded for event: ${eventKey}`,`
        {
          event: eventKey,
          count: current.count,
          limit: maxEventsPerSecond,
          window: windowMs,
        }
      );

      if (skipOnLimit) {
        context.processedBy.push('rate-limiting-middleware-skipped');'
        return; // Skip processing
      } else {
        throw new Error(`Rate limit exceeded for event: ${eventKey}`);`
      }
    }

    // Increment count and process
    current.count++;
    eventCounts.set(eventKey, current);
    context.processedBy.push('rate-limiting-middleware');'

    await next();
  };
}

// =============================================================================
// MIDDLEWARE UTILITIES - Helper functions
// =============================================================================

/**
 * Create conditional middleware that only runs for specific events.
 */
export function createConditionalMiddleware(
  condition: (context: EventContext) => boolean,
  middleware: EventMiddleware
): EventMiddleware {
  return async (context: EventContext, next: () => Promise<void>) => {
    if (condition(context)) {
      await middleware(context, next);
    } else {
      await next();
    }
  };
}

/**
 * Create middleware that only runs for specific event types.
 */
export function createEventTypeMiddleware(
  eventTypes: string|string[],
  middleware: EventMiddleware
): EventMiddleware {
  const types = Array.isArray(eventTypes) ? eventTypes : [eventTypes];

  return createConditionalMiddleware(
    (context) => types.includes(String(context.event)),
    middleware
  );
}

/**
 * Create async middleware wrapper for promise-based operations.
 */
export function createAsyncMiddleware(
  asyncOperation: (context: EventContext) => Promise<void>,
  options: {
    timeout?: number;
    onTimeout?: (context: EventContext) => void;
  } = {}
): EventMiddleware {
  const { timeout, onTimeout } = options;

  return async (context: EventContext, next: () => Promise<void>) => {
    context.processedBy.push('async-middleware');'

    if (timeout) {
      const timeoutPromise = new Promise<void>((_, reject) => {
        setTimeout(() => {
          if (onTimeout) {
            onTimeout(context);
          }
          reject(
            new Error(
              `Middleware timeout after ${timeout}ms for event: ${String(context.event)}``
            )
          );
        }, timeout);
      });

      await Promise.race([asyncOperation(context), timeoutPromise]);
    } else {
      await asyncOperation(context);
    }

    await next();
  };
}

export { type EventMiddleware, type EventContext };
