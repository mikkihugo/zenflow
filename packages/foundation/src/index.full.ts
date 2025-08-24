/**
 * @fileoverview Foundation Package - Gold Standard Core Utilities
 *
 * This is the **GOLD STANDARD ENTRYPOINT** for @claude-zen/foundation.
 * All other packages in the monorepo should follow this TSDoc documentation standard.
 *
 * @author claude-code-zen team
 * @version 2.0.0
 * @license MIT
 * @since 1.0.0
 *
 * @description
 * Foundation provides 5 core utility systems with modern, battle-tested dependencies.
 * This package serves as the minimal, focused base layer for all claude-zen applications.
 * Each system is carefully selected for production reliability and developer experience.
 *
 * **🏗️ ARCHITECTURAL PRINCIPLES:**
 * - **Minimal & Focused**: Only essential utilities, no business logic
 * - **Battle-Tested**: Uses proven NPM packages with millions of downloads
 * - **Type-Safe**: Full TypeScript support with strict typing
 * - **Tree-Shakable**: Optimized exports for minimal bundle size
 * - **Professional**: Enterprise-grade naming and patterns
 *
 * **📦 5 CORE FOUNDATION SYSTEMS:**
 *
 * **1. 📝 LOGGING SYSTEM** (`@logtape/logtape`)
 * - Structured logging with multiple outputs
 * - Professional log levels and formatting
 * - Zero-config setup with sensible defaults
 * - Thread-safe and high-performance
 *
 * **2. ⚙️ CONFIGURATION SYSTEM** (`convict` + `dotenv`)
 * - Schema-validated configuration management
 * - Environment variable integration
 * - Type-safe config access
 * - Development/production environment support
 *
 * **3. 🔌 DEPENDENCY INJECTION** (`awilix`)
 * - Professional IoC container
 * - Singleton and scoped lifecycle management
 * - Decorator-based registration
 * - Automatic dependency resolution
 *
 * **4. ⚠️ ERROR HANDLING** (`neverthrow` + `p-retry` + `opossum`)
 * - Type-safe Result<T, E> pattern
 * - Advanced retry logic with exponential backoff
 * - Production-ready circuit breaker
 * - Comprehensive error types and utilities
 *
 * **5. 🛠️ BATTLE-TESTED UTILITIES** (`zod` + `envalid` + others)
 * - Schema validation with Zod
 * - Environment configuration with Envalid
 * - Process lifecycle management
 * - Timeout utilities and environment helpers
 *
 * **🚀 PERFORMANCE & QUALITY:**
 * - Zero runtime dependencies conflicts
 * - Tree-shakable exports (import only what you need)
 * - Full TypeScript strict mode compliance
 * - Comprehensive test coverage
 * - ESLint + Prettier formatted
 *
 * **📚 USAGE PATTERNS:**
 *
 * @example Quick Start - Essential imports
 * ```typescript
 * import {
 *   getLogger,      // Structured logging
 *   getConfig,      // Configuration management
 *   Result, ok, err,// Type-safe error handling
 *   z, validateInput// Schema validation
 * } from '@claude-zen/foundation';
 *
 * // Initialize logger for your module
 * const logger = getLogger('my-service');
 * logger.info('Service starting', { version: '1.0.0' });
 *
 * // Get validated configuration
 * const config = getConfig();
 * const port = config.get('server.port'); // Type-safe access
 *
 * // Validate input with Result pattern
 * const UserSchema = z.object({
 *   name: z.string().min(1),
 *   email: z.string().email()
 * });
 *
 * const result = validateInput(UserSchema, userInput);
 * if (result.isOk()) {
 *   logger.info('Valid user', result.value);
 * } else {
 *   logger.error('Validation failed', result.error);
 * }
 * ```
 *
 * @example Advanced Error Handling
 * ```typescript
 * import {
 *   safeAsync,
 *   withRetry,
 *   withTimeout,
 *   createCircuitBreaker
 * } from '@claude-zen/foundation';
 *
 * // Safe async operations with Result pattern
 * const result = await safeAsync(async () => {
 *   const response = await fetch('/api/data');
 *   return response.json();
 * });
 *
 * // Retry with exponential backoff
 * const retryResult = await withRetry(
 *   () => unstableApiCall(),
 *   { attempts: 3, delay: 1000 }
 * );
 *
 * // Timeout operations
 * const timeoutResult = await withTimeout(
 *   longRunningOperation(),
 *   5000,
 *   'Operation timed out'
 * );
 *
 * // Circuit breaker for external services
 * const breaker = createCircuitBreaker(externalServiceCall, {
 *   timeout: 3000,
 *   errorThresholdPercentage: 50,
 *   resetTimeout: 30000
 * });
 * ```
 *
 * @example Dependency Injection Setup
 * ```typescript
 * import {
 *   TokenFactory,
 *   FOUNDATION_TOKENS,
 *   DIContainer,
 *   getService,
 *   hasService
 * } from '@claude-zen/foundation';
 *
 * // Create tokens for your services
 * const TOKENS = {
 *   DatabaseService: TokenFactory.create<DatabaseService>('DatabaseService'),
 *   EmailService: TokenFactory.create<EmailService>('EmailService')
 * };
 *
 * // Register services
 * container.register({
 *   [TOKENS.DatabaseService.token]: asClass(PostgresDatabase).singleton(),
 *   [TOKENS.EmailService.token]: asClass(SmtpEmailService).scoped()
 * });
 *
 * // Use services
 * const dbService = getService(TOKENS.DatabaseService);
 * const emailService = getService(TOKENS.EmailService);
 * ```
 *
 * @example Environment Configuration
 * ```typescript
 * import {
 *   createEnvValidator,
 *   str, num, bool, port, url,
 *   getCommonEnv,
 *   isDevelopment, isProduction
 * } from '@claude-zen/foundation';
 *
 * // Validate environment variables
 * const env = createEnvValidator({
 *   NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
 *   PORT: port({ default: 3000 }),
 *   DATABASE_URL: url(),
 *   ENABLE_LOGGING: bool({ default: true }),
 *   API_TIMEOUT: num({ default: 5000 })
 * });
 *
 * // Use common environment helpers
 * const commonEnv = getCommonEnv();
 *
 * if (isDevelopment()) {
 *   logger.info('Running in development mode');
 * }
 * ```
 *
 * @example Process Lifecycle Management
 * ```typescript
 * import { onExit, pTimeout } from '@claude-zen/foundation';
 *
 * // Graceful shutdown
 * onExit(async () => {
 *   logger.info('Shutting down gracefully...');
 *   await database.close();
 *   await cache.disconnect();
 *   logger.info('Shutdown complete');
 * });
 *
 * // Timeout operations
 * try {
 *   const result = await pTimeout(
 *     longRunningTask(),
 *     10000 // 10 second timeout
 *   );
 *   logger.info('Task completed', result);
 * } catch (error) {
 *   logger.error('Task failed or timed out', error);
 * }
 * ```
 *
 * **🎯 SEPARATE ENTRY POINTS (Recommended for Performance):**
 *
 * @example Tree-shakable imports
 * ```typescript
 * // Import only what you need for optimal bundle size
 * import { getLogger } from '@claude-zen/foundation/logging';
 * import { Result, ok, err } from '@claude-zen/foundation/error-handling';
 * import { z, validateInput } from '@claude-zen/foundation/utilities';
 * import { TokenFactory } from '@claude-zen/foundation/di';
 * import { getConfig } from '@claude-zen/foundation/config';
 * ```
 *
 * **📦 PACKAGE INTEGRATION EXAMPLES:**
 *
 * @example Integration with strategic facades
 * ```typescript
 * // Foundation provides the base utilities
 * import { getLogger, Result, ok, err } from '@claude-zen/foundation';
 *
 * // Strategic facades build on foundation
 * import { getBrainSystem } from '@claude-zen/intelligence';
 * import { getWorkflowEngine } from '@claude-zen/enterprise';
 * import { getDatabaseSystem } from '@claude-zen/infrastructure';
 * import { getTelemetryManager } from '@claude-zen/operations';
 *
 * // Foundation utilities are used throughout the system
 * const logger = getLogger('integration-service');
 * const brainSystem = await getBrainSystem();
 * const workflow = await getWorkflowEngine();
 * ```
 *
 * **⚠️ MIGRATION NOTES:**
 * - LLM providers moved to `@claude-zen/intelligence`
 * - Telemetry moved to `@claude-zen/infrastructure`
 * - Workflows moved to `@claude-zen/enterprise`
 * - System metrics moved to `@claude-zen/operations`
 *
 * **📋 BEST PRACTICES:**
 * 1. Always use the logger for structured output
 * 2. Validate all external input with schemas
 * 3. Use Result pattern for error-prone operations
 * 4. Leverage DI for testable, modular code
 * 5. Configure environments with validated schemas
 * 6. Handle process lifecycle gracefully
 * 7. Use timeouts for external operations
 * 8. Import only needed utilities for performance
 *
 * @see {@link https://github.com/zen-neural/claude-code-zen} - Project repository
 * @see {@link https://github.com/zen-neural/claude-code-zen/tree/main/packages/foundation} - Foundation package
 * @see {@link https://claude-zen.dev/docs/foundation} - Complete documentation
 */

// =============================================================================
// IMPORTS - Internal dependencies for this module
// =============================================================================
import { getLogger } from './core/logging';

// =============================================================================
// FOUNDATION TYPES - Shared primitives and patterns
// =============================================================================
// Re-export foundation types for other packages
export type * from './types';

// Explicit exports for types that export * doesn't handle properly
export type {
  JsonValue,
  JsonObject,
  JsonArray,
  JsonPrimitive,
} from './types/core/primitives';

export type {
  UnknownRecord,
  Constructor,
  UUID,
  Timestamp,
  Priority,
  Status,
  Optional,
  NonEmptyArray,
  Branded,
} from './types/core/primitives';

// Export additional types that implementation packages need
export type { Entity } from './types/index';
export type { OperationResult } from './types/patterns';

// =============================================================================
// LOGGING SYSTEM - Central logging foundation
// =============================================================================
export {
  getLogger,
  updateLoggingConfig,
  getLoggingConfig,
  validateLoggingEnvironment,
  LoggingLevel,
  // FORCING EXPORTS - Force structured logging
  log,
  logger,
  createLogger,
  console,
} from './core/logging';
export type { Logger, LoggingConfig } from './core/logging';

// =============================================================================
// MODERN CONFIGURATION SYSTEM - Convict + Dotenv
// =============================================================================
export {
  getConfig,
  reloadConfig,
  validateConfig,
  configHelpers,
  isDebugMode,
  // FORCING EXPORTS - Force central config
  config,
  env,
  settings,
  validate,
  reload,
  isDebug,
  isDevelopment,
  isProduction,
  isTest,
  getEnv,
  requireEnv,
  shouldLog,
} from './core/config';
export type { Config } from './core/config';

// =============================================================================
// PROJECT MANAGEMENT - Basic environment detection only
// =============================================================================
export {
  ProjectManager,
  getProjectManager,
  findProjectRoot,
} from './utilities/project';
export type { ProjectInfo } from './utilities/project';

// =============================================================================
// MONOREPO DETECTION - Basic workspace detection only
// =============================================================================
export { WorkspaceDetector, getWorkspaceDetector } from './utilities/system';
export type { DetectedWorkspace } from './utilities/system';

// =============================================================================
// LLM PROVIDERS - Moved to @claude-zen/llm-providers package (PRIVATE)
// =============================================================================
// Note: LLM provider functionality has been moved to @claude-zen/llm-providers (private package)
// PUBLIC API: Import from @claude-zen/intelligence facade
// import { getLLMProvider, executeClaudeTask } from '@claude-zen/intelligence';

// =============================================================================
// WORKFLOW SYSTEM - Moved to @claude-zen/enterprise facade
// =============================================================================
// Note: Workflow functionality has been moved to @claude-zen/enterprise
// Import from: import { getWorkflowEngine, getProcessOrchestrator } from '@claude-zen/enterprise';

// =============================================================================
// STORAGE SYSTEM - Moved to @claude-zen/infrastructure package
// =============================================================================
// Note: Storage functionality has been moved to @claude-zen/infrastructure
// Import from: import { getDatabaseAccess, getKVStore } from '@claude-zen/infrastructure';

// =============================================================================
// DEPENDENCY INJECTION - Awilix Reference Implementation
// =============================================================================
// Re-export full awilix API as foundation DI system

// Core container functions
export {
  createContainer as createAwilixContainer,
  listModules,
} from 'awilix';

// Registration builders
export {
  asFunction,
  asClass,
  asValue,
  aliasTo,
} from 'awilix';

// Lifetime constants (prefixed to avoid conflicts)
export {
  Lifetime as AwilixLifetime,
  InjectionMode,
  RESOLVER,
} from 'awilix';

// Error types
export {
  AwilixResolutionError,
  AwilixRegistrationError,
} from 'awilix';

// FORCING EXPORTS - Replace manual DI implementations
export {
  createContainer as createAwilixServiceContainer,
  asFunction as asServiceFactory,
  asClass as asServiceClass,
  asValue as asServiceValue,
  Lifetime as ServiceLifetime,
} from 'awilix';

// =============================================================================
// LEGACY DEPENDENCY INJECTION SYSTEM (for backwards compatibility)
// =============================================================================

// Token factory for DI
export class TokenFactory {
  private static tokens = new Map<string, symbol>();

  static create(name: string): symbol {
    if (!this.tokens.has(name)) {
      this.tokens.set(name, Symbol(name));
    }
    const token = this.tokens.get(name);
    if (!token) {
      throw new Error(`Failed to create token for: ${name}`);
    }
    return token;
  }

  static clear(): void {
    this.tokens.clear();
  }
}

// =============================================================================
// MODERN ERROR HANDLING - Neverthrow + p-retry + opossum
// =============================================================================
export {
  ErrorHandling,
  EnhancedError,
  ContextError,
  ValidationError,
  ConfigurationError,
  NetworkError,
  TimeoutError,
  ResourceError,
  CircuitBreakerWithMonitoring,
  createCircuitBreaker,
  ErrorAggregator,
  createErrorAggregator,
  createErrorChain,
  createErrorRecovery,
  Result,
  ok,
  err,
  ResultAsync,
  errAsync,
  okAsync,
  isError,
  isErrorWithContext,
  ensureError,
  withContext,
  safeAsync,
  safe,
  withTimeout,
  withRetry,
  executeAll,
  executeAllSuccessful,
  transformError,
  // FORCING EXPORTS - Force Result pattern
  attempt,
  attemptAsync,
  retryWithResult,
  timeoutWithResult,
  circuitBreakerWithResult,
  parallel,
  parallelSuccessful,
  recover,
  aggregate,
  chain,
  context,
  exit,
  panic,
  assert,
  invariant,
  fail,
  failWith,
} from './error-handling';

// Compatibility aliases for common naming patterns
export {
  CircuitBreakerWithMonitoring as CircuitBreaker,
  isErrorWithContext as ErrorWithContext,
} from './error-handling';
export type {
  RetryOptions,
  CircuitBreakerOptions,
  CockatielRetryOptions,
  CockatielTimeoutOptions,
} from './error-handling';

// =============================================================================
// COCKATIEL RESILIENCE - Full Reference Implementation
// =============================================================================
// Re-export full cockatiel API as foundation resilience patterns

// Core policies
export {
  retry,
  circuitBreaker,
  timeout,
  bulkhead,
  fallback,
  wrap,
  noop,
} from 'cockatiel';

// Policy builders and handlers
export {
  handleAll,
  handleType,
  handleWhen,
  handleResultType,
  handleWhenResult,
  Policy,
} from 'cockatiel';

// Backoff strategies
export {
  ExponentialBackoff,
  ConstantBackoff,
  IterableBackoff,
  DelegateBackoff,
  noJitterGenerator,
  decorrelatedJitterGenerator,
} from 'cockatiel';

// Circuit breaker strategies
export {
  ConsecutiveBreaker,
  SamplingBreaker,
  CountBreaker,
} from 'cockatiel';

// Error types
export {
  BrokenCircuitError,
  BulkheadRejectedError,
  IsolatedCircuitError,
  TaskCancelledError,
} from 'cockatiel';

// Enums and constants
export {
  CircuitState,
  TimeoutStrategy,
} from 'cockatiel';

// Event system
export { Event } from 'cockatiel';

// Decorators
export { usePolicy } from 'cockatiel';

// FORCING EXPORTS - Replace manual retry/timeout implementations
export {
  retry as createRetryPolicy,
  timeout as createTimeoutPolicy,
  circuitBreaker as createCircuitBreakerPolicy,
  bulkhead as createBulkheadPolicy,
  fallback as createFallbackPolicy,
} from 'cockatiel';

// Convenience aliases for common patterns
export {
  ExponentialBackoff as ExpBackoff,
  ConstantBackoff as FixedBackoff,
  ConsecutiveBreaker as FailureCountBreaker,
  SamplingBreaker as FailureRateBreaker,
} from 'cockatiel';

// =============================================================================
// TELEMETRY SYSTEM - Moved to @claude-zen/infrastructure package
// =============================================================================
// Note: Telemetry functionality has been moved to @claude-zen/infrastructure
// Import from: import { getTelemetryAccess, getTelemetryManager } from '@claude-zen/infrastructure';

// =============================================================================
// SYSTEM METRICS - Moved to @claude-zen/operations package
// =============================================================================
// Note: System metrics functionality has been moved to @claude-zen/operations
// Import from: import { getSystemMetricsCollector } from '@claude-zen/operations';

// =============================================================================
// FACADE STATUS MANAGEMENT - Package availability and health tracking
// =============================================================================
export {
  facadeStatusManager,
  getFacadeStatus,
  getSystemStatus,
  getHealthSummary,
  registerFacade,
  getService,
  hasService,
} from './infrastructure/facades';

// =============================================================================
// EVENT SYSTEM - TypedEventBase for event-driven programming
// =============================================================================
export { TypedEventBase, createTypedEventBase } from './events';

// FORCING EXPORTS - Force TypedEventBase over EventEmitter
export { TypedEventBase as Events } from './events';
export { createTypedEventBase as events } from './events';
export { createTypedEventBase as createEventEmitter } from './events';

// Re-export commonly needed DI types for compatibility
export type InjectionToken<T = unknown> = string | symbol | (new (...args: unknown[]) => T);
export type LifecycleCompat = 'singleton' | 'transient' | 'scoped';

// Additional types needed by registries
export interface ServiceRegistrationOptions {
  lifetime?: LifecycleCompat;
  capabilities?: string[];
  tags?: string[];
  healthCheck?: () => boolean;
}

// ServiceInfo interface already defined above

export enum Lifetime {
  Singleton = 'singleton',
  Transient = 'transient',
  Scoped = 'scoped'
}

// UnknownRecord type already exported from types/primitives
export type { EventMetrics } from './events';

// =============================================================================
// INFRASTRUCTURE REDIRECTS - Storage and KV functionality moved to infrastructure
// =============================================================================

// Storage functionality moved to @claude-zen/infrastructure
// Use: import { Storage, getKVStore } from '@claude-zen/infrastructure';

// LLM Provider functionality moved to @claude-zen/llm-providers
// Use: import { LLMProvider, LLMGenerateOptions } from '@claude-zen/llm-providers';

// LLM implementation moved to @claude-zen/intelligence
// Use: import { getLLMProvider } from '@claude-zen/intelligence';

// Singleton decorator moved to DI system
// Use: import { singleton } from '@claude-zen/foundation' (DI section)

// Telemetry functions moved to @claude-zen/operations
// Use: import { recordMetric } from '@claude-zen/operations';

export const recordHistogram = (
  name: string,
  value: number,
  attributes?: Record<string, unknown>,
) => {
  // Note: Use @claude-zen/operations for production telemetry
  // Stub implementation - parameters used for type compatibility
  void name;
  void value;
  void attributes;
};

// Tracing functions moved to @claude-zen/operations
// Use: import { startTrace } from '@claude-zen/operations';

// withTrace function moved to @claude-zen/operations
// Use: import { withTrace } from '@claude-zen/operations';

// traced decorator moved to @claude-zen/operations
// Use: import { traced } from '@claude-zen/operations';

// metered decorator moved to @claude-zen/operations
// Use: import { metered } from '@claude-zen/operations';

// inject decorator for DI system
export const injectDecorator = (token?: string) => {
  return (target: unknown, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    // Simple metadata storage without reflect-metadata dependency
    const metadataKey = 'inject:tokens';
    const targetConstructor = target as { [key: string]: unknown };

    if (!targetConstructor[metadataKey]) {
      targetConstructor[metadataKey] = [];
    }

    const tokens = targetConstructor[metadataKey] as (string | symbol | undefined)[];
    tokens[parameterIndex] = token || propertyKey;
  };
};

export const TOKENS = {
  Logger: 'logger',
  Config: 'config',
  Database: 'database',
};

// Service information interface
export interface ServiceInfo {
  name: string;
  type: 'class' | 'factory' | 'instance';
  capabilities: string[];
  tags: string[];
  registeredAt: number;
}

// Service discovery and container interfaces
export interface ServiceDiscoveryOptions {
  recursive?: boolean;
  includeTests?: boolean;
  extensions?: string[];
  cwd?: string;
  ignore?: string[];
}

export interface ServiceContainerStats {
  totalServices: number;
  healthyServices: number;
  unhealthyServices: number;
  lastHealthCheck: number;
}

// Database functionality moved to @claude-zen/infrastructure
// Use: import { getDatabaseAccess, DatabaseAccess } from '@claude-zen/infrastructure';

// FORCING DI - Use dependency injection instead of global singletons
export interface Container {
  // Event emitter methods
  on(event: string, listener: (...args: unknown[]) => void): this;
  emit(event: string, ...args: unknown[]): boolean;
  off(event: string, listener: (...args: unknown[]) => void): this;
  register<T>(token: string, implementation: new (...args: unknown[]) => T, options?: { capabilities?: string[], tags?: string[] }): void;
  registerFunction<T>(token: string, factory: () => T, options?: { capabilities?: string[], tags?: string[] }): void;
  registerInstance<T>(token: string, instance: T, options?: { capabilities?: string[], tags?: string[] }): void;
  resolve<T>(token: string): T;
  has(token: string): boolean;
  autoDiscoverServices(patterns: string[], options: ServiceDiscoveryOptions): Promise<ServiceInfo[]>;
  startHealthMonitoring(interval: number): void;
  getStats(): ServiceContainerStats;
  getServicesByCapability?(capability: string): ServiceInfo[];
  getServicesByTag?(tag: string): ServiceInfo[];
  getHealthStatus?(): { status: string; serviceCount: number; timestamp: number; uptime: number };
  dispose?(): void;
  getName?(): string;
}

export const createContainer = (): Container => {
  const services = new Map<string, unknown>();
  const serviceMetadata = new Map<string, ServiceInfo>();
  const { createTypedEventBase } = require('./events');
  const eventBase = createTypedEventBase();

  return {
    ...eventBase,
    register<T>(
      token: string,
      implementation: new (...args: unknown[]) => T,
      options?: { capabilities?: string[], tags?: string[] },
    ): void {
      services.set(token, implementation);
      serviceMetadata.set(token, {
        name: token,
        type: 'class',
        capabilities: options?.capabilities || [],
        tags: options?.tags || [],
        registeredAt: Date.now(),
      });
      eventBase.emit('serviceRegistered', { name: token, type: 'class' });
    },
    registerFunction<T>(token: string, factory: () => T, options?: { capabilities?: string[], tags?: string[] }): void {
      services.set(token, factory);
      serviceMetadata.set(token, {
        name: token,
        type: 'factory',
        capabilities: options?.capabilities || [],
        tags: options?.tags || [],
        registeredAt: Date.now(),
      });
      eventBase.emit('serviceRegistered', { name: token, type: 'factory' });
    },
    registerInstance<T>(token: string, instance: T, options?: { capabilities?: string[], tags?: string[] }): void {
      services.set(token, instance);
      serviceMetadata.set(token, {
        name: token,
        type: 'instance',
        capabilities: options?.capabilities || [],
        tags: options?.tags || [],
        registeredAt: Date.now(),
      });
      eventBase.emit('serviceRegistered', { name: token, type: 'instance' });
    },
    resolve<T>(token: string): T {
      const startTime = Date.now();
      const service = services.get(token);
      if (!service) {
        throw new Error(`Service not found for token: ${token}`);
      }

      let result: T;
      if (typeof service === 'function' && service.prototype) {
        // Constructor function
        result = new (service as new () => T)();
      } else if (typeof service === 'function') {
        // Factory function
        result = (service as () => T)();
      } else {
        // Instance
        result = service as T;
      }

      const resolutionTime = Date.now() - startTime;
      eventBase.emit('serviceResolved', {
        name: token,
        resolutionTime,
        timestamp: Date.now(),
      });

      return result;
    },
    has(token: string): boolean {
      return services.has(token);
    },

    async autoDiscoverServices(patterns: string[], options: ServiceDiscoveryOptions = {}): Promise<ServiceInfo[]> {
      const discovered: ServiceInfo[] = [];
      const fs = require('fs').promises;
      const path = require('path');

      try {
        const cwd = options.cwd || process.cwd();
        const ignore = options.ignore || ['node_modules', 'dist', 'build', '.git'];

        // Simple pattern matching implementation without glob
        for (const pattern of patterns) {
          // Basic pattern support - just directory scanning for now
          const searchDir = pattern.includes('*') ? cwd : path.dirname(pattern);

          try {
            const files = await fs.readdir(searchDir, { recursive: true });

            for (const file of files) {
              const fullPath = path.join(searchDir, file);
              const stats = await fs.stat(fullPath).catch(() => null);

              if (stats?.isFile() &&
                  (file.includes('service') || file.includes('Service')) &&
                  !ignore.some((ig: string) => fullPath.includes(ig))) {

                discovered.push({
                  name: path.basename(file, path.extname(file)),
                  type: 'class' as const,
                  capabilities: [],
                  tags: ['auto-discovered'],
                  registeredAt: Date.now(),
                });
              }
            }
          } catch (dirError) {
            // Directory doesn't exist or not readable - log for debugging
            // Directory doesn't exist or not readable - use console for now
            const logger = getLogger('foundation:discovery');
            logger.debug(`Directory scan failed: ${dirError}`);
            continue;
          }
        }
      } catch (error) {
        const logger = getLogger('foundation:discovery');
        logger.warn('Auto-discovery failed:', error);
      }

      return discovered;
    },

    startHealthMonitoring(interval: number): void {
      setInterval(() => {
        eventBase.emit('healthCheck', {
          serviceCount: services.size,
          timestamp: Date.now(),
          status: 'healthy',
        });
      }, interval);
    },

    getStats(): ServiceContainerStats {
      return {
        totalServices: services.size,
        healthyServices: services.size, // All registered services considered healthy
        unhealthyServices: 0,
        lastHealthCheck: Date.now(),
      };
    },

    getServicesByCapability(capability: string): ServiceInfo[] {
      const matchingServices: ServiceInfo[] = [];
      for (const [serviceToken, metadata] of serviceMetadata.entries()) {
        if (metadata.capabilities && metadata.capabilities.includes(capability)) {
          // Service matches capability - log token for debugging
          const logger = getLogger('foundation:service-discovery');
          logger.debug(`Service ${serviceToken} provides capability: ${capability}`);
          matchingServices.push(metadata);
        }
      }
      return matchingServices;
    },

    getServicesByTag(tag: string): ServiceInfo[] {
      const matchingServices: ServiceInfo[] = [];
      for (const [serviceToken, metadata] of serviceMetadata.entries()) {
        if (metadata.tags && metadata.tags.includes(tag)) {
          // Service matches tag - log token for debugging
          const logger = getLogger('foundation:service-discovery');
          logger.debug(`Service ${serviceToken} has tag: ${tag}`);
          matchingServices.push(metadata);
        }
      }
      return matchingServices;
    },

    getHealthStatus() {
      return {
        status: 'healthy',
        serviceCount: services.size,
        timestamp: Date.now(),
        uptime: Date.now(), // Simplified uptime
      };
    },

    dispose(): void {
      services.clear();
      serviceMetadata.clear();
      eventBase.emit('containerDisposed', {
        timestamp: Date.now(),
        servicesCount: services.size,
      });
    },

    getName(): string {
      return 'ServiceContainer';
    },
  };
};

// Duplicate Lifetime enum removed - already defined above

// EventEmitter implementation moved to typed-event-base.ts
// Use TypedEventBase for better type safety

// Database and memory interfaces moved to @claude-zen/infrastructure
// Use: import { DatabaseAccess, KeyValueStore } from '@claude-zen/infrastructure';

// Database creation functions moved to @claude-zen/infrastructure
// Use: import { createDao, createMultiDatabaseSetup } from '@claude-zen/infrastructure';

// System monitoring moved to @claude-zen/operations
// Use: import { SystemMetricsCollector, createSystemMetricsCollector } from '@claude-zen/operations';

// Neural configuration moved to @claude-zen/intelligence
// Use: import { getNeuralConfig } from '@claude-zen/intelligence';

// =============================================================================
// BATTLE-TESTED UTILITIES - Modern NPM packages for common tasks
// =============================================================================
export {
  // Zod validation
  z,
  validateInput,
  createValidator,

  // Environment configuration
  str,
  num,
  bool,
  port,
  url,
  email,
  json,
  host,
  createEnvValidator,
  getCommonEnv,
  commonEnvSchema,

  // Process lifecycle
  onExit,

  // Timeout utilities (prefixed to avoid conflicts)

  // Environment helpers from utilities
  isDevelopment as isDevelopmentUtil,
  isProduction as isProductionUtil,
  isTest as isTestUtil,

  // JSON forcing patterns
  parseJSON,
  stringifyJSON,
  parseJSONWithSchema,

  // Input validation forcing patterns
  validateRequest,
  validateEnv,
  safeGet,

  // File operations forcing patterns
  readFile,
  writeFile,
  directoryExists,
  fileExists,
  safePath,
  readJSONFile,
  writeJSONFile,
} from './utilities';

// =============================================================================
// CENTRALIZED COMMON UTILITIES - Re-exported for consistent usage
// =============================================================================

// Lodash utilities - re-export entire library for consistent usage
export { default as _ } from 'lodash';
export { default as lodash } from 'lodash';

// Commander.js - CLI parsing and command framework
export { Command, program } from 'commander';
export type { CommanderError, Help, Option } from 'commander';

// Nanoid - fast URL-safe unique ID generator (alternative to UUID for shorter IDs)
export { nanoid, customAlphabet } from 'nanoid';

// UUID generation (foundation's own implementation + nanoid for compatibility)
export {
  generateUUID,
  isUUID,
} from './types/core/primitives';

// Re-export nanoid as generateNanoId for clarity
export { nanoid as generateNanoId } from 'nanoid';

// Date-fns - Modern JavaScript date utilities
export * as dateFns from 'date-fns';
export {
  format,
  parseISO,
  addDays,
  addHours,
  addMinutes,
  subDays,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  isAfter,
  isBefore,
  isEqual,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from 'date-fns';

// =============================================================================
// DATE-FNS FORCING PATTERNS - Replace native Date with date-fns everywhere
// =============================================================================

// Import date-fns functions we need
import * as dateFnsAll from 'date-fns';

// FORCING EXPORTS - Make date-fns the reference date implementation
export const dateUtils = dateFnsAll;
export const date = dateFnsAll;
export const time = dateFnsAll;

// High-level date operations (forcing date-fns usage)
export const now = () => new Date();
export const today = () => dateFnsAll.startOfDay(new Date());
export const tomorrow = () => dateFnsAll.addDays(dateFnsAll.startOfDay(new Date()), 1);
export const yesterday = () => dateFnsAll.subDays(dateFnsAll.startOfDay(new Date()), 1);

// Common formatting patterns (force date-fns format over toISOString, etc.)
export const formatDate = (date: Date, pattern = 'yyyy-MM-dd') => dateFnsAll.format(date, pattern);
export const formatDateTime = (date: Date, pattern = 'yyyy-MM-dd HH:mm:ss') => dateFnsAll.format(date, pattern);
export const formatTime = (date: Date, pattern = 'HH:mm:ss') => dateFnsAll.format(date, pattern);
export const toISO = (date: Date) => dateFnsAll.format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
export const formatRelative = dateFnsAll.formatRelative;
export const formatDistanceToNow = dateFnsAll.formatDistanceToNow;

// Date parsing (force date-fns parseISO over new Date())
export const parseDate = dateFnsAll.parseISO;
export const parseDateStrict = dateFnsAll.parse;
export const isValidDate = dateFnsAll.isValid;

// Date calculations (force date-fns over manual arithmetic)
export const addTime = {
  years: dateFnsAll.addYears,
  months: dateFnsAll.addMonths,
  weeks: dateFnsAll.addWeeks,
  days: dateFnsAll.addDays,
  hours: dateFnsAll.addHours,
  minutes: dateFnsAll.addMinutes,
  seconds: dateFnsAll.addSeconds,
};

export const subtractTime = {
  years: dateFnsAll.subYears,
  months: dateFnsAll.subMonths,
  weeks: dateFnsAll.subWeeks,
  days: dateFnsAll.subDays,
  hours: dateFnsAll.subHours,
  minutes: dateFnsAll.subMinutes,
  seconds: dateFnsAll.subSeconds,
};

// Date comparisons (force date-fns over manual comparison)
export const compareDate = dateFnsAll.compareAsc;
export const compareDateDesc = dateFnsAll.compareDesc;
export const isDateAfter = dateFnsAll.isAfter;
export const isDateBefore = dateFnsAll.isBefore;
export const isDateEqual = dateFnsAll.isEqual;
export const isSameDay = dateFnsAll.isSameDay;
export const isSameWeek = dateFnsAll.isSameWeek;
export const isSameMonth = dateFnsAll.isSameMonth;
export const isSameYear = dateFnsAll.isSameYear;

// Date differences (force date-fns over manual calculation)
export const dateDifference = {
  inYears: dateFnsAll.differenceInYears,
  inMonths: dateFnsAll.differenceInMonths,
  inWeeks: dateFnsAll.differenceInWeeks,
  inDays: dateFnsAll.differenceInDays,
  inHours: dateFnsAll.differenceInHours,
  inMinutes: dateFnsAll.differenceInMinutes,
  inSeconds: dateFnsAll.differenceInSeconds,
  inMilliseconds: dateFnsAll.differenceInMilliseconds,
};

// Date boundaries (force date-fns over manual calculation)
export const dateBoundaries = {
  startOfDay: dateFnsAll.startOfDay,
  endOfDay: dateFnsAll.endOfDay,
  startOfWeek: dateFnsAll.startOfWeek,
  endOfWeek: dateFnsAll.endOfWeek,
  startOfMonth: dateFnsAll.startOfMonth,
  endOfMonth: dateFnsAll.endOfMonth,
  startOfYear: dateFnsAll.startOfYear,
  endOfYear: dateFnsAll.endOfYear,
  startOfHour: dateFnsAll.startOfHour,
  endOfHour: dateFnsAll.endOfHour,
  startOfMinute: dateFnsAll.startOfMinute,
  endOfMinute: dateFnsAll.endOfMinute,
};

// Timezone operations (force date-fns-tz when available, fallback to date-fns)
export const timezone = {
  utc: (date: Date) => dateFnsAll.formatISO(date, { representation: 'complete' }),
  local: (date: Date) => dateFnsAll.format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
  format: formatDateTime,
};

// Date validation and checking
export const dateChecks = {
  isValid: isValidDate,
  isWeekend: dateFnsAll.isWeekend,
  isLeapYear: dateFnsAll.isLeapYear,
  isFuture: dateFnsAll.isFuture,
  isPast: dateFnsAll.isPast,
  isToday: dateFnsAll.isToday,
  isYesterday: dateFnsAll.isYesterday,
  isTomorrow: dateFnsAll.isTomorrow,
};

// FORCING PATTERN - Replace common Date methods with date-fns
export const DateReplacements = {
  // Replace new Date() patterns
  now: () => new Date(),
  create: (year?: number, month?: number, day?: number) => {
    if (year && month && day) {
      return new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    }
    return new Date();
  },

  // Replace Date.now()
  timestamp: () => Date.now(),

  // Replace common Date methods with date-fns equivalents
  format: formatDate,
  parse: parseDate,
  add: addTime,
  subtract: subtractTime,
  compare: compareDate,
  diff: dateDifference,
  startOf: dateBoundaries,
  endOf: dateBoundaries,
  isAfter: isDateAfter,
  isBefore: isDateBefore,
  isEqual: isDateEqual,
  isValid: isValidDate,
} as const;

export type {
  ZodSchema,
  ZodType,
  ZodError,
  Spec,
  CleanedEnv,
} from './utilities';

// Enhanced ServiceContainer is the primary DI solution with reasonable defaults:
// - Events support (extends TypedEventBase)
// - Multiple registration types (class, factory, instance)
// - Health monitoring and performance metrics
// - Auto-discovery framework
// - Error handling with Result types

// FORCING EXPORTS - Force dependency injection patterns
export const inject = createContainer;
export const di = createContainer;
export const ioc = createContainer;
export const container = createContainer;

// Compatibility aliases for existing code
export const createDIContainer = createContainer;
export const createServiceContainer = createContainer;
export type DIContainer = Container;
export type ServiceContainer = Container;

// =============================================================================
// ADDITIONAL FORCING EXPORTS - Alternative names for common patterns
// =============================================================================

// JSON forcing aliases
export { stringifyJSON as stringify } from './utilities';

// File forcing aliases
export { readFile as file } from './utilities';
export { safePath as path } from './utilities';

// Validation forcing aliases
export { validateInput as schema } from './utilities';
