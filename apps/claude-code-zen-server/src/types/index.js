/**
 * Types Index
 *
 * Main export point for all type definitions.
 * Foundation-style organization with clean, focused modules.
 */
// ============================================================================
// API & Web Interface Types
// ============================================================================
export * from './api';
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
export { isApiError, isApiResponse, isBaseEntity, isFailure, isPaginatedResponse, isService, isSuccess, isSwarmAgent, isSwarmMessage, isSystemConfig, isSystemEvent, isSystemHealth, isTask, isZenSwarm, } from './core';
// ============================================================================
// Shared Cross-Domain Types
// ============================================================================
export * from './shared';
// ============================================================================
// Utility Functions (Re-exported for convenience)
// ============================================================================
// ============================================================================
// Constants
// ============================================================================
export { DEFAULT_PAGE_SIZE, DEFAULT_RETRY_ATTEMPTS, DEFAULT_TIMEOUT, EVENT_PRIORITIES, failure, MAX_PAGE_SIZE, SERVICE_STATUSES, success, } from './shared';
// ============================================================================
// Version Information
// ============================================================================
export const TYPE_SYSTEM_VERSION = '2.0.0';
export const LAST_CONSOLIDATED = new Date().toISOString();
