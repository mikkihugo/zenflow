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
} from './types/primitives';

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
} from './types/primitives';

// Export additional types that implementation packages need
export type {
  Entity,
} from './types/index';
export type {
  OperationResult,
} from './types/patterns';

// =============================================================================
// LOGGING SYSTEM - Central logging foundation
// =============================================================================
export {
  getLogger,
  updateLoggingConfig,
  getLoggingConfig,
  validateLoggingEnvironment,
  LoggingLevel,
} from './logging';
export type { Logger, LoggingConfig } from './logging';

// =============================================================================
// MODERN CONFIGURATION SYSTEM - Convict + Dotenv
// =============================================================================
export {
  getConfig,
  reloadConfig,
  validateConfig,
  configHelpers,
  isDebugMode,
} from './config';
export type { Config } from './config';

// =============================================================================
// PROJECT MANAGEMENT - Basic environment detection only
// =============================================================================
export {
  ProjectManager,
  getProjectManager,
  findProjectRoot,
} from './project-manager';
export type { ProjectInfo } from './project-manager';

// =============================================================================
// MONOREPO DETECTION - Basic workspace detection only
// =============================================================================
export { WorkspaceDetector, getWorkspaceDetector } from './monorepo-detector';
export type { DetectedWorkspace } from './monorepo-detector';

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
// MODERN DEPENDENCY INJECTION - Awilix
// =============================================================================
export {
  TokenFactory,
  FOUNDATION_TOKENS,
  DependencyResolutionError,
  LifecycleCompat,
  AgentRegistry,
  createAgentRegistry,
  getAgentRegistry,
  injectable,
} from './di';
export type {
  DIContainer,
  DIContainerFactory,
  DIConfiguration,
  Lifecycle,
  DependencyContainer,
  InjectionToken,
  InjectableDecorator,
  InjectDecorator,
  SingletonDecorator,
  ScopedDecorator,
} from './di';

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
  AbortError,
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
} from './error-handling';

// Compatibility aliases for common naming patterns
export {
  CircuitBreakerWithMonitoring as CircuitBreaker,
  isErrorWithContext as ErrorWithContext,
} from './error-handling';
export type { RetryOptions, CircuitBreakerOptions } from './error-handling';

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
} from './facade-status-manager';

// =============================================================================
// EVENT SYSTEM - TypedEventBase for event-driven programming
// =============================================================================
export {
  TypedEventBase,
} from './typed-event-base';
export type {
  EventMetrics,
} from './typed-event-base';

// =============================================================================
// INFRASTRUCTURE REDIRECTS - Storage and KV functionality moved to infrastructure
// =============================================================================

// Storage functionality moved to @claude-zen/infrastructure
export const Storage = class StorageRedirect {
  constructor() {
    console.warn('Storage: Use @claude-zen/infrastructure for production storage');
  }
};

export const getKVStore = async () => {
  console.warn('getKVStore: Use @claude-zen/infrastructure for production KV storage');
  return {
    set: async () => {},
    get: async () => null,
    delete: async () => false,
    clear: async () => {},
  };
};

// LLMProvider interface for packages that need it
export interface LLMProvider {
  generate(prompt: string, options?: any): Promise<{ text: string }>;
  complete(prompt: string, options?: any): Promise<string>;
  chat(messages: any[], options?: any): Promise<{ response: string }>;
  setRole?(role: string): void;
}

// Export LLMProvider as a type export too
export type { LLMProvider as LLMProviderType };

export const getGlobalLLM = (): LLMProvider => {
  console.warn('getGlobalLLM: Use @claude-zen/intelligence for production LLM access');
  return {
    generate: async () => ({ text: '' }),
    complete: async () => '',
    chat: async () => ({ response: '' }),
    setRole: () => {}
  };
};

export const singleton = () => (target: any) => {
  console.warn('singleton: Use @claude-zen/foundation DI system for production');
  return target;
};

// Telemetry stub functions - moved to @claude-zen/operations
export const recordMetric = (_name: string, _value: number = 1, _attributes?: Record<string, unknown>) => {
  console.warn('recordMetric: Use @claude-zen/operations for production telemetry');
};

export const recordHistogram = (_name: string, _value: number, _attributes?: Record<string, unknown>) => {
  console.warn('recordHistogram: Use @claude-zen/operations for production telemetry');
};

export const startTrace = (_name: string, _attributes?: Record<string, unknown>) => {
  console.warn('startTrace: Use @claude-zen/operations for production telemetry');
  return {
    end: () => console.warn('trace.end: Use @claude-zen/operations for production telemetry'),
    addAttribute: (_key: string, _value: unknown) => console.warn('trace.addAttribute: Use @claude-zen/operations'),
    setStatus: (_status: string) => console.warn('trace.setStatus: Use @claude-zen/operations')
  };
};

export const withTrace = <T>(nameOrFn: string | (() => T), fn?: () => T): T => {
  console.warn('withTrace: Use @claude-zen/operations for production tracing');
  if (typeof nameOrFn === 'function') {
    return nameOrFn();
  }
  return fn!();
};

export const traced = (_name?: string) => {
  console.warn('traced: Use @claude-zen/operations for production tracing');
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  };
};

export const metered = (_name?: string) => {
  console.warn('metered: Use @claude-zen/operations for production metrics');
  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
    return descriptor;
  };
};

// DI-related stubs - moved to strategic facades
export const inject = () => {
  console.warn('inject: Use @claude-zen/foundation DI system for production');
  return () => {};
};

export const TOKENS = {
  Logger: 'logger',
  Config: 'config',
  Database: 'database',
};

// DatabaseAccess interface for packages that need it
export interface DatabaseAccess {
  query(sql: string, params?: any[]): Promise<{ rows: any[] }>;
  execute(sql: string, params?: any[]): Promise<{ changes: number }>;
  getKV(namespace: string): Promise<any>;
}

// Export DatabaseAccess as a type export too
export type { DatabaseAccess as DatabaseAccessType };

export const getDatabaseAccess = (): DatabaseAccess => {
  console.warn('getDatabaseAccess: Use @claude-zen/infrastructure for production database access');
  return {
    query: async () => ({ rows: [] }),
    execute: async () => ({ changes: 0 }),
    getKV: async () => ({
      set: async () => {},
      get: async () => null,
      delete: async () => false,
      clear: async () => {}
    })
  };
};

// DI Container and Service implementations
export interface ServiceContainer {
  register<T>(token: string, implementation: new (...args: any[]) => T): void;
  resolve<T>(token: string): T;
  has(token: string): boolean;
}

export const createServiceContainer = (): ServiceContainer => {
  const services = new Map<string, any>();
  
  return {
    register<T>(token: string, implementation: new (...args: any[]) => T): void {
      services.set(token, implementation);
    },
    resolve<T>(token: string): T {
      const Service = services.get(token);
      if (!Service) {
        throw new Error(`Service not found for token: ${token}`);
      }
      return new Service();
    },
    has(token: string): boolean {
      return services.has(token);
    }
  };
};

export enum Lifetime {
  Singleton = 'singleton',
  Transient = 'transient',
  Scoped = 'scoped'
}

// EventEmitter implementation for packages that need it
export class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  on(event: string, listener: Function): this {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
    return this;
  }

  emit(event: string, ...args: any[]): boolean {
    const listeners = this.events.get(event);
    if (!listeners) return false;
    
    listeners.forEach(listener => listener(...args));
    return true;
  }

  off(event: string, listener: Function): this {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    return this;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
    return this;
  }

  once(event: string, listener: Function): this {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    this.on(event, onceWrapper);
    return this;
  }
}

// KeyValueStore interface for memory backends
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  has(key: string): Promise<boolean>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

// Memory configuration interfaces  
export interface MemoryConfig {
  type?: 'sqlite' | 'lancedb' | 'json' | 'memory';
  path?: string;
  maxSize?: number;
  ttl?: number;
  compression?: boolean;
  persistent?: boolean;
}

// Database configuration and factory types
export interface DatabaseConfig {
  type: 'sqlite' | 'lancedb' | 'kuzu' | 'postgresql' | 'mysql';
  path?: string;
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
}

export interface DatabaseFactory {
  create(config: DatabaseConfig): Promise<DatabaseAccess>;
}

export interface TransactionOperation {
  execute(): Promise<any>;
}

export interface VectorDocument {
  id: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

// Create functions for database/memory packages
export const createDao = (type: string, config: any) => {
  console.warn(`createDao: Package-specific implementation required for type ${type}`);
  return {
    find: () => Promise.resolve([]),
    create: () => Promise.resolve({}),
    update: () => Promise.resolve({}),
    delete: () => Promise.resolve(true)
  };
};

export const createMultiDatabaseSetup = (config: DatabaseConfig[]) => {
  console.warn('createMultiDatabaseSetup: Package-specific implementation required');
  return Promise.resolve({
    databases: config.map(c => ({ type: c.type, status: 'ready' }))
  });
};

// System monitoring stubs - moved to @claude-zen/operations
export const SystemMetricsCollector = class SystemMetricsCollectorStub {
  constructor() {
    console.warn('SystemMetricsCollector: Use @claude-zen/operations for production system monitoring');
  }
  collect() { return {}; }
  getMetrics() { return {}; }
};

export const createSystemMetricsCollector = () => {
  console.warn('createSystemMetricsCollector: Use @claude-zen/operations for production system monitoring');
  return new SystemMetricsCollector();
};

// Neural configuration stubs - moved to @claude-zen/intelligence
export const getNeuralConfig = () => {
  console.warn('getNeuralConfig: Use @claude-zen/intelligence for production neural configuration');
  return {
    enableLearning: false,
    predictionEnabled: false,
    smartRoutingEnabled: false,
    adaptiveCapacity: false,
    learningRate: 0.1,
  };
};

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
  pTimeout,

  // Environment helpers
  isDevelopment,
  isProduction,
  isTest,
} from './utilities';

export type {
  ZodSchema,
  ZodType,
  ZodError,
  Spec,
  CleanedEnv,
} from './utilities';
