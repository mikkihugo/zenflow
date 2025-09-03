/**
 * @fileoverview Foundation Package - Golden Ultimate Entry Point
 * 
 * The Claude Code Zen Foundation package provides enterprise-grade utilities
 * for logging, configuration, dependency injection, error handling, events,
 * and type utilities. This is the ultimate golden package for robust applications.
 * 
 * @example Quick Start
 * ```typescript
 * import { 
 *   getLogger, 
 *   Result, 
 *   ok, 
 *   err, 
 *   EventBus, 
 *   createContainer 
 * } from '@claude-zen/foundation';
 * 
 * const logger = getLogger('MyApp');
 * const eventBus = new EventBus();
 * const container = createContainer();
 * 
 * const result: Result<string, Error> = ok('success');
 * logger.info('Application started', { result: result.isOk() });
 * ```
 * 
 * @example Advanced Features
 * ```typescript
 * import { 
 *   safeAsync, 
 *   withRetry, 
 *   withTimeout,
 *   EventEmitter,
 *   ValidationError,
 *   TimeoutError
 * } from '@claude-zen/foundation';
 * 
 * const operation = withRetry(
 *   withTimeout(
 *     safeAsync(async () => {
 *       // Your async operation here
 *       return await fetch('/api/data');
 *     }), 
 *     5000
 *   ), 
 *   { attempts: 3 }
 * );
 * ```
 * 
 * ## Feature Areas
 * 
 * ### 🚀 Core Systems
 * - **Logging**: Production-ready structured logging with LogTape
 * - **Configuration**: Type-safe environment configuration management
 * - **Dependency Injection**: Lightweight DI container with Awilix
 * 
 * ### 🛡️ Resilience & Error Handling
 * - **Result Pattern**: Type-safe error handling without exceptions
 * - **Circuit Breakers**: Fault tolerance with automatic recovery
 * - **Retry Logic**: Exponential backoff and custom retry strategies
 * - **Timeout Handling**: Automatic timeout with cancellation
 * 
 * ### 📡 Event Systems
 * - **EventBus**: Centralized event management with middleware
 * - **EventEmitter**: Node.js-compatible event emitter
 * - **Dynamic Registry**: Runtime event discovery and monitoring
 * 
 * ### 🎯 TypeScript Excellence
 * - **Type Utilities**: Advanced TypeScript helper types
 * - **Type Guards**: Runtime type validation
 * - **Strict Typing**: Zero `any` types, comprehensive interfaces
 * 
 * ## Submodule Imports
 * 
 * For tree-shaking and granular imports, use feature-specific entry points:
 * 
 * ```typescript
 * // Core systems
 * import { getLogger } from '@claude-zen/foundation/core';
 * import { createContainer } from '@claude-zen/foundation/di';
 * 
 * // Error handling & resilience
 * import { Result, CircuitBreaker } from '@claude-zen/foundation/error-handling';
 * import { retryAsync, timeout } from '@claude-zen/foundation/resilience';
 * 
 * // Events
 * import { EventBus, EventEmitter } from '@claude-zen/foundation/events';
 * 
 * // Utilities
 * import { dateFns, nanoid, lodash } from '@claude-zen/foundation/utils';
 * 
 * // Types only (zero runtime cost)
 * import type { UUID, Timestamp, JsonValue } from '@claude-zen/foundation/types';
 * ```
 */

// =============================================================================
// 🌿 Minimal, tree-shakable root exports
// =============================================================================
// Keep this entry intentionally small to preserve bundle-size and enable deep imports.
// For feature-specific APIs, import from submodules (e.g., './core', './events', './dependency-injection').

/** Production-ready logging - minimal root surface */
export { getLogger } from './core/logging/index.js';

/** Type-safe configuration and environment detection */
export { getConfig, isDevelopment, isProduction, isTest } from './config/index.js';

/** Result pattern core runtime utilities */
export { Result, ok, err, safeAsync } from './error-handling/index.js';

/** Event system core utilities */
export { EventBus, EventEmitter } from './events/index.js';