/**
 * @fileoverview Foundation Package - Modern Battle-Tested Dependencies
 * 
 * **9 CORE FOUNDATION SYSTEMS - ALL MODERN:**
 * 1. LOGGING SYSTEM - Professional logging with @logtape/logtape
 * 2. TELEMETRY & MONITORING SYSTEM - OpenTelemetry + Prometheus + comprehensive monitoring
 * 3. CONFIGURATION SYSTEM - Schema validation with convict + dotenv
 * 4. LLM PROVIDER - High-level LLM abstraction layer
 * 5. CLAUDE SDK - Raw Claude Code CLI/SDK bindings
 * 6. STORAGE SYSTEM - Database abstraction (SQLite, LanceDB, Kuzu)
 * 7. DEPENDENCY INJECTION - TSyringe DI container and decorators
 * 8. ERROR HANDLING - Result patterns with neverthrow + p-retry + opossum
 * 9. MONITORING CLASSES - SystemMonitor, PerformanceTracker, AgentMonitor, MLMonitor
 * 
 * **Modern Dependencies Used:**
 * - @opentelemetry/sdk-node: OpenTelemetry SDK for traces and metrics
 * - prom-client: Prometheus metrics collection and export
 * - @logtape/logtape: Professional structured logging
 * - convict + dotenv: Configuration management with schema validation
 * - neverthrow: Type-safe Result<T, E> pattern 
 * - p-retry: Advanced retry logic with exponential backoff
 * - opossum: Production-ready circuit breaker
 * - tsyringe: Battle-tested dependency injection
 * 
 * Key Features:
 * - Tree-shakable exports for optimal bundle size
 * - Professional naming conventions (PascalCase classes, camelCase functions)
 * - Separate entry points for major subsystems
 * - Type-only exports clearly separated
 * 
 * @example Importing specific utilities
 * ```typescript
 * import { getLogger, recordMetric, safeAsync } from '@claude-zen/foundation';
 * import { getDatabaseAccess, startTrace } from '@claude-zen/foundation';
 * import { SystemMonitor, createMonitoringSystem } from '@claude-zen/foundation';
 * ```
 * 
 * @example Using separate entry points (more optimal)
 * ```typescript
 * import { withRetry, createCircuitBreaker } from '@claude-zen/foundation/error-handling';
 * import { TelemetryManager, recordMetric } from '@claude-zen/foundation/telemetry';
 * import { injectable, inject } from '@claude-zen/foundation/di';
 * ```
 * 
 * @example Comprehensive monitoring setup
 * ```typescript
 * import { 
 *   SystemMonitor, 
 *   PerformanceTracker, 
 *   AgentMonitor, 
 *   MLMonitor,
 *   createMonitoringSystem 
 * } from '@claude-zen/foundation';
 * 
 * // System resource monitoring
 * const systemMonitor = createSystemMonitor();
 * await systemMonitor.start();
 * const metrics = systemMonitor.getMetrics();
 * 
 * // Performance tracking
 * const perfTracker = createPerformanceTracker();
 * perfTracker.startTimer('api-request');
 * // ... perform operation
 * perfTracker.endTimer('api-request');
 * 
 * // AI agent monitoring
 * const agentMonitor = createAgentMonitor();
 * agentMonitor.trackAgent('agent-1', { 
 *   performance: 0.95, 
 *   tasks: 42, 
 *   efficiency: 0.87 
 * });
 * 
 * // ML model monitoring
 * const mlMonitor = createMLMonitor();
 * mlMonitor.trackPrediction('model-v2', {
 *   accuracy: 0.94,
 *   latency: 45,
 *   confidence: 0.89
 * });
 * ```
 */

// =============================================================================
// LOGGING SYSTEM - Central logging foundation
// =============================================================================
export {
  getLogger,
  updateLoggingConfig,
  getLoggingConfig,
  validateLoggingEnvironment,
  LoggingLevel
} from './src/main';
export type { Logger, LoggingConfig } from './src/main';

// =============================================================================
// MODERN CONFIGURATION SYSTEM - Convict + Dotenv
// =============================================================================
export {
  getConfig,
  reloadConfig,
  validateConfig,
  configHelpers,
  isDebugMode,
  areMetricsEnabled,
  getStorageConfig,
  getNeuralConfig,
  getTelemetryConfig
} from './config';
export type { Config } from './config';

// =============================================================================
// PROJECT MANAGEMENT - Multi-repo project database
// =============================================================================
export {
  ProjectManager,
  getProjectManager,
  getProjectConfig,
  findProjectRoot,
  registerCurrentProject
} from './src/main';
export type { ProjectInfo, ProjectRegistry } from './src/main';

// =============================================================================
// MONOREPO DETECTION - Industry-standard workspace detection
// =============================================================================
export {
  WorkspaceDetector,
  getWorkspaceDetector
} from './src/main';
export type { DetectedProject, DetectedWorkspace } from './src/main';

// =============================================================================
// LLM PROVIDER - High-level LLM abstraction layer (STANDARD OPERATIONS)
// =============================================================================
export {
  LLMProvider,
  setGlobalLLM,
  getGlobalLLM,
  SWARM_AGENT_ROLES
} from './src/main';
export type { LLMMessage, LLMRequest, LLMResponse, SwarmAgentRole } from './src/main';

// =============================================================================
// CLAUDE SDK - Raw Claude Code CLI/SDK bindings (SWARMS & ADVANCED)
// =============================================================================
export {
  executeClaudeTask,
  executeSwarmCoordinationTask,
  ClaudeTaskManager,
  getGlobalClaudeTaskManager,
  streamClaudeTask,
  executeParallelClaudeTasks,
  filterMessagesForClaudeCode,
  cleanupGlobalInstances
} from './src/main';
export type {
  ClaudeSDKOptions,
  ClaudeMessage,
  ClaudeAssistantMessage,
  ClaudeUserMessage,
  ClaudeResultMessage,
  ClaudeSystemMessage,
  PermissionResult,
  CanUseTool
} from './src/main';

// =============================================================================
// STORAGE SYSTEM - Professional database abstraction
// =============================================================================
export {
  getDatabaseAccess,
  getKVStore,
  StorageError,
  DatabaseConnectionError
} from './src/main';
export type {
  KeyValueStore,
  DatabaseAccess,
  KeyValueStorage,
  AllStorageTypes,
  HybridStorage
} from './src/main';

// Professional storage object with proper naming
export { storage as Storage } from './src/main';

// =============================================================================
// MODERN DEPENDENCY INJECTION - TSyringe
// =============================================================================
export {
  DIContainer,
  TokenFactory,
  TOKENS,
  getGlobalContainer,
  createContainer,
  registerGlobal,
  registerGlobalSingleton,
  registerGlobalInstance,
  resolveGlobal,
  isRegisteredGlobal,
  clearGlobal,
  resetGlobal,
  loggingInjectable,
  loggingSingleton,
  configureDI,
  DependencyResolutionError,
  injectable,
  inject,
  singleton,
  scoped,
  instanceCachingFactory,
  instancePerContainerCachingFactory
} from './src/main';
export type { 
  DIConfiguration,
  Lifecycle,
  DependencyContainer,
  InjectionToken
} from './src/main';

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
  transformError
} from './src/main';

// Compatibility aliases for common naming patterns
export { 
  CircuitBreakerWithMonitoring as CircuitBreaker,
  isErrorWithContext as ErrorWithContext
} from './src/main';
export type { 
  RetryOptions,
  CircuitBreakerOptions
} from './src/main';

// =============================================================================
// COMPREHENSIVE TELEMETRY & MONITORING SYSTEM - OpenTelemetry + Prometheus + Monitoring
// =============================================================================
export {
  TelemetryManager,
  getTelemetry,
  initializeTelemetry,
  shutdownTelemetry,
  recordMetric,
  recordHistogram,
  recordGauge,
  startTrace,
  withTrace,
  withAsyncTrace,
  recordEvent,
  setTraceAttributes,
  traced,
  tracedAsync,
  metered,
  SpanKind,
  SpanStatusCode,
  // Comprehensive Monitoring Classes
  SystemMonitor,
  PerformanceTracker,
  AgentMonitor,
  MLMonitor,
  // Factory Functions for Monitoring
  createSystemMonitor,
  createPerformanceTracker,
  createAgentMonitor,
  createMLMonitor,
  createMonitoringSystem
} from './src/main';
export type {
  TelemetryConfig,
  MetricDefinition,
  SpanOptions,
  TelemetryEvent,
  MetricType,
  Span,
  Tracer,
  Meter,
  Attributes,
  // Monitoring Types
  MonitoringConfig,
  MetricData,
  PerformanceMetrics
} from './src/main';