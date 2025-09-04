/**
 * Types Index
 *
 * Main export point for all type definitions.
 * Foundation-style organization with clean, focused modules.
 */

// Note:Only import types that are actually available and needed
// Removed imports for packages that may not exist or aren't being used

// ============================================================================
// Legacy Compatibility (Temporary)
// ============================================================================
// Import the types we need for aliases
import type { SwarmAgent, SwarmConfig } from './coordination';
import type { SystemHealth } from './core';

export type {
  ApiError,
  ApiResponse,
  ClientConfig,
  DashboardConfig,
  DashboardWidget,
  FilterParams,
  HttpClient,
  PaginatedResponse,
  PaginationParams,
  QueryParams,
  RouteDefinition,
  WebSocketConfig,
  WebSocketMessage,
} from './api';

// ============================================================================
// API & Web Interface Types
// ============================================================================
export * from './api';
export type {
  AgentCapabilities,
  AgentMetrics,
  SwarmAgent,
  SwarmConfig,
  SwarmMessage,
  SwarmMetrics,
  SwarmResult,
  Task,
  TaskPayload,
  TaskResult,
  ZenSwarm,
} from './coordination';

// ============================================================================
// Coordination & Swarm Types
// ============================================================================
export * from './coordination';
// ============================================================================
// Core System Types
// ============================================================================
export * from './core';
// ============================================================================
// Type Guards (Re-exported for convenience)
// ============================================================================
export {
  isApiError,
  isApiResponse,
  isBaseEntity,
  isFailure,
  isPaginatedResponse,
  isService,
  isSuccess,
  isSwarmAgent,
  isSwarmMessage,
  isSystemConfig,
  isSystemEvent,
  isSystemHealth,
  isTask,
  isZenSwarm,
} from './core';
export type {
  Awaitable,
  BaseEntity,
  DeepPartial,
  DeepRequired,
  Failure,
  Nullable,
  Optional,
  Result,
  SecurityContext,
  Service,
  ServiceHealth,
  Success,
  SystemEvent,
  Timestamp,
  UUID,
} from './shared';
// ============================================================================
// Shared Cross-Domain Types
// ============================================================================
export * from './shared';

// Removed duplicate export - already included in export * from './api')// Removed duplicate export - already included in export * from './coordination')// Removed duplicate export - already included in export * from './shared')
// ============================================================================
// External Package Types (Strategic Facade Compliance)
// ============================================================================
// Import types from strategic facades following 5-tier architecture
export type {
  // Foundation types
  Logger,
  Result as FoundationResult,
  UUID as FoundationUUID,
} from '@claude-zen/foundation';
// ============================================================================
// Utility Functions (Re-exported for convenience)
// ============================================================================
// ============================================================================
// Constants
// ============================================================================
export {
  DEFAULT_PAGE_SIZE,
  DEFAULT_RETRY_ATTEMPTS,
  DEFAULT_TIMEOUT,
  EVENT_PRIORITIES,
  failure,
  MAX_PAGE_SIZE,
  SERVICE_STATUSES,
  success,
} from './shared';

// These aliases maintain backward compatibility during migration
export type Agent = SwarmAgent;
export type SwarmConfiguration = SwarmConfig;
export type SystemStatus = SystemHealth;

// ============================================================================
// Version Information
// ============================================================================
export const TYPE_SYSTEM_VERSION = '2.0.0';
export const LAST_CONSOLIDATED = new Date().toISOString();
