/**
 * Types Index
 *
 * Main export point for all type definitions.
 * Foundation-style organization with clean, focused modules.
 */
export type { ApiError, ApiResponse, ClientConfig, DashboardConfig, DashboardWidget, FilterParams, HttpClient, PaginatedResponse, PaginationParams, QueryParams, RouteDefinition, WebSocketConfig, WebSocketMessage, } from './api';
export * from './api';
export type { AgentCapabilities, AgentMetrics, SwarmAgent, SwarmConfig, SwarmMessage, SwarmMetrics, SwarmResult, Task, TaskPayload, TaskResult, ZenSwarm, } from './coordination';
export * from './coordination';
export * from './core';
export { isApiError, isApiResponse, isBaseEntity, isFailure, isPaginatedResponse, isService, isSuccess, isSwarmAgent, isSwarmMessage, isSystemConfig, isSystemEvent, isSystemHealth, isTask, isZenSwarm, } from './core';
export type { Awaitable, BaseEntity, DeepPartial, DeepRequired, Failure, Nullable, Optional, Result, SecurityContext, Service, ServiceHealth, Success, SystemEvent, Timestamp, UUID, } from './shared';
export * from './shared';
export type { Logger, Result as FoundationResult, UUID as FoundationUUID, } from '@claude-zen/foundation';
export { DEFAULT_PAGE_SIZE, DEFAULT_RETRY_ATTEMPTS, DEFAULT_TIMEOUT, EVENT_PRIORITIES, failure, MAX_PAGE_SIZE, SERVICE_STATUSES, success, } from './shared';
import type { SwarmAgent, SwarmConfig } from './coordination';
import type { SystemHealth } from './core';
export type Agent = SwarmAgent;
export type SwarmConfiguration = SwarmConfig;
export type SystemStatus = SystemHealth;
export declare const TYPE_SYSTEM_VERSION = "2.0.0";
export declare const LAST_CONSOLIDATED: string;
//# sourceMappingURL=index.d.ts.map