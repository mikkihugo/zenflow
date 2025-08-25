/**
 * Types Index
 *
 * Main export point for all type definitions.
 * Foundation-style organization with clean, focused modules.
 */

// ============================================================================
// Core System Types
// ============================================================================
export * from './core';

// ============================================================================
// API & Web Interface Types
// ============================================================================
export * from './api';
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  PaginationParams,
  FilterParams,
  QueryParams,
  HttpClient,
  ClientConfig,
  WebSocketMessage,
  WebSocketConfig,
  RouteDefinition,
  DashboardConfig,
  DashboardWidget,
} from './api';

// ============================================================================
// Coordination & Swarm Types
// ============================================================================
export * from './coordination';
export type {
  ZenSwarm,
  SwarmAgent,
  SwarmConfig,
  Task,
  TaskResult,
  TaskPayload,
  AgentCapabilities,
  AgentMetrics,
  SwarmResult,
  SwarmMetrics,
  SwarmMessage,
} from './coordination';

// ============================================================================
// Shared Cross-Domain Types
// ============================================================================
export * from './shared';
export type {
  UUID,
  Timestamp,
  BaseEntity,
  SystemEvent,
  Service,
  ServiceHealth,
  SecurityContext,
  Result,
  Success,
  Failure,
  DeepPartial,
  DeepRequired,
  Nullable,
  Optional,
  Awaitable,
} from './shared';

// ============================================================================
// Type Guards (Re-exported for convenience)
// ============================================================================
export {
  isSystemConfig,
  isSystemHealth,
  isApiResponse,
  isApiError,
  isPaginatedResponse,
  isZenSwarm,
  isSwarmAgent,
  isTask,
  isSwarmMessage,
  isBaseEntity,
  isSystemEvent,
  isService,
  isSuccess,
  isFailure,
} from './core';
// Removed duplicate export - already included in export * from './api'
// Removed duplicate export - already included in export * from './coordination'
// Removed duplicate export - already included in export * from './shared'

// ============================================================================
// Utility Functions (Re-exported for convenience)
// ============================================================================
export { success, failure } from './shared';

// ============================================================================
// Constants
// ============================================================================
export {
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_ATTEMPTS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  EVENT_PRIORITIES,
  SERVICE_STATUSES,
} from './shared';

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

// Note: Only import types that are actually available and needed
// Removed imports for packages that may not exist or aren't being used

// ============================================================================
// Legacy Compatibility (Temporary)
// ============================================================================
// Import the types we need for aliases
import type { SwarmAgent, SwarmConfig } from './coordination';
import type { SystemHealth } from './core';

// These aliases maintain backward compatibility during migration
export type Agent = SwarmAgent;
export type SwarmConfiguration = SwarmConfig;
export type SystemStatus = SystemHealth;

// ============================================================================
// Version Information
// ============================================================================
export const TYPE_SYSTEM_VERSION = '2.0.0';
export const LAST_CONSOLIDATED = new Date().toISOString();
