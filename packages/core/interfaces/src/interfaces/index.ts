/**
 * Unified Interface Exports - Central Interface Registry.
 *
 * This file provides a single point for importing all standardized interfaces,
 * ensuring consistency across the codebase and preventing interface conflicts.
 *
 * @file Central interface export registry.
 */

/**
 * @file Central interface export registry for Claude-Zen system.
 *
 * This module provides a unified interface export system that ensures
 * consistency across all system components and prevents interface conflicts.
 * All standardized interfaces should be exported through this registry.
 * @example
 * ```typescript`
 * // Import multiple interfaces from central registry
 * import {
 *   AgentConfig,
 *   SwarmMetrics,
 *   DatabaseConfig,
 *   BackendInterface
 * } from '@/core/interfaces';
 *
 * // Use interfaces with type safety
 * const agent: AgentConfig = {
 *   id: 'agent-123',
 *   type: 'researcher',
 *   capabilities: ['search', 'analyze']'
 * };
 * ````
 */

// Neural interfaces handled by @claude-zen/intelligence package
// Server delegates neural operations to brain package instead of direct WASM bindings
/**
 * Swarm coordination and agent management interfaces.
 *
 * Provides comprehensive types for multi-agent swarm coordination,
 * including communication, task management, and performance monitoring.
 *
 * @see {@link SwarmConfig} - Swarm configuration and topology
 * @see {@link AgentPerformance} - Agent performance metrics
 * @see {@link SwarmMetrics} - Swarm-wide performance statistics
 * @see {@link TaskStatus} - Task execution status tracking
 * @see {@link Message} - Inter-agent communication protocol
 */
export {
  AgentPerformance,
  Connection,
  ConnectionType,
  Message,
  MessageType,
  SwarmConfig,
  SwarmEvent,
  SwarmEventEmitter,
  SwarmLifecycleState,
  SwarmMetrics,
  SwarmOptions,
  SwarmState,
  SwarmTopology,
  TaskPriority,
  TaskStatus,
  WasmModule,
} from '../../coordination/swarm/core/types';
/**
 * Unified agent system interfaces and types.
 *
 * Comprehensive agent management system supporting different agent types,
 * capabilities, performance monitoring, and task execution tracking.
 *
 * @see {@link Agent} - Core agent interface definition
 * @see {@link AgentConfig} - Agent configuration and initialization
 * @see {@link AgentCapabilities} - Agent skill and capability definitions
 * @see {@link AgentMetrics} - Performance and execution metrics
 * @see {@link Task} - Task definition and execution interface
 */
export {
  Agent,
  AgentCapabilities,
  AgentConfig,
  AgentError,
  AgentMetrics,
  AgentState,
  AgentType,
  ExecutionResult,
  Task,
} from '../../coordination/types';
/**
 * Database configuration and connection interfaces.
 *
 * Supports multiple database backends including PostgreSQL, SQLite,
 * MySQL, Kuzu (graph), and LanceDB (vector) databases.
 *
 * @see {@link DatabaseConfig} - Multi-backend database configuration
 */
export { DatabaseConfig } from '../../database/providers/database-providers';
/**
 * Memory management and caching interfaces.
 *
 * Provides abstractions for memory caching, session management,
 * and persistent storage with multiple backend support.
 *
 * @see {@link BackendInterface} - Pluggable storage backend interface
 * @see {@link CacheEntry} - Memory cache entry structure
 * @see {@link SessionState} - User session state management
 * @see {@link StorageResult} - Unified storage operation results
 */
export { CacheEntry, SessionState } from '../../memory/memory';
/**
 * Event system interfaces for pub/sub messaging.
 *
 * Provides event-driven architecture support with type-safe
 * event handling, subscription management, and async event processing.
 *
 * @see {@link ../../types/event-types} - Complete event system types
 */
export * from '../../types/event-types';
export {
  BackendInterface,
  BackendStats,
  JSONValue,
  StorageResult,
} from '../memory-system';

/**
 * Configuration interface for memory/storage backends.
 *
 * Provides unified configuration for different storage backends
 * including LanceDB (vector), SQLite (relational), and JSON (file).
 *
 * @interface BackendConfig
 * @example
 * ```typescript`
 * const config: BackendConfig = {
 *   backend: 'lancedb',
 *   path: './data/vectors.lance',
 *   maxSize: 50000,
 *   compression: true,
 *   backendConfig: {
 *     vectorDimension: 384,
 *     metricType: 'cosine''
 *   }
 * };
 * ````
 */
export interface BackendConfig {
  /** Storage backend type. */
  backend: 'lancedb | sqlite|json;
  /** File system path for the storage backend. */
  path: string;
  /** Maximum number of entries/records (optional). */
  maxSize?: number;
  /** Whether to enable data compression (optional). */
  compression?: boolean;
  /** Backend-specific configuration options (optional). */
  backendConfig?: Record<string, unknown>;
}

/**
 * Core base interfaces and fundamental contracts.
 *
 * Provides foundational interfaces that other system components
 * extend or implement, ensuring consistent patterns across the codebase.
 *
 * @see {@link ./base-interfaces} - Fundamental interface definitions
 */
export * from './base-interfaces';
