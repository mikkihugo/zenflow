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

/** Additional logging utilities */
export { createLogger } from './core/logging/logging.service.js';

/** Type-safe configuration and environment detection */
export { getConfig, isDevelopment, isProduction, isTest } from './config/index.js';

/** Result pattern core runtime utilities */
export { Result, ok, err, safeAsync } from './error-handling/index.js';

/** Event system core minimal utilities (advanced helpers via subpath './events') */
export { EventBus, EventEmitter } from './events/index.js';
export type { BaseEvent, EventPayload, EventMap } from './events/index.js';

// (UUID generation available via subpath: import { generateUUID } from '@claude-zen/foundation/utils')

// Advanced utilities intentionally omitted for tree-shaking (import from subpaths):
// - registerEventModule, sendModuleHeartbeat, EVENT_CATALOG helpers
// - withRetry (utilities/async)
// - createContainer / Container (dependency-injection)
// - ProcessLifecycleManager / setupProcessLifecycle (core/lifecycle)

// (Error types and withTimeout available via '@claude-zen/foundation/error-handling')

// (Process lifecycle exports moved to subpath import only)

/** Logger type export */
export type { Logger } from './core/logging/index.js';

// =============================================================================
// 🔁 Reintroduced Advanced Exports (User Requested)
// =============================================================================
// These exports were previously trimmed for an aggressive tree-shaking demo.
// They are now restored for developer ergonomics. Modern bundlers will still
// tree-shake unused symbols when importing from '@claude-zen/foundation'.
// If bundle size becomes a concern again, consider moving these back behind
// explicit subpath imports or exporting a consolidated namespace object instead.

// Event system advanced helpers & catalog utilities
export {
	EVENT_CATALOG,
	isValidEventName,
	getEventType,
	getAllEventNames,
	getEventsByCategory,
	registerEventModule,
	sendModuleHeartbeat,
	getActiveModules,
	getEventMetrics,
	getEventFlows,
	getDynamicEventCatalog,
	logEvent,
	logFlow,
	logError,
} from './events/index.js';

// Dependency Injection (lightweight container)
export { createContainer } from './di.js';
export type { Container } from './di.js';

// DI Tokens for dependency injection
export { TOKENS } from './dependency-injection/container.service.js';

// Process lifecycle management
export { ProcessLifecycleManager, setupProcessLifecycle } from './core/lifecycle/process.lifecycle.js';

// Resilience helpers (retry / timeout) & key error types
export { withRetry, withTimeout, TimeoutError, ValidationError, NetworkError, ResourceError, ConfigurationError } from './error-handling/index.js';

// UUID generation convenience
export { generateUUID } from './utilities/index.js';

// Extended event catalog (full merged) now part of the single full root entry
export {
	EXTENDED_EVENT_CATALOG,
	isExtendedEventName,
	getExtendedEventType,
} from './events/extended-event-catalog.js';

// NOTE: Additional utilities (system info, validation helpers, etc.) remain
// accessible via subpaths: '@claude-zen/foundation/utilities'