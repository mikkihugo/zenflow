/**
 * Unified Interface Exports - Central Interface Registry
 *
 * This file provides a single point for importing all standardized interfaces,
 * ensuring consistency across the codebase and preventing interface conflicts.
 *
 * @fileoverview Central interface export registry
 */

// Neural interfaces
export { WasmBindingInterface } from '../../bindings/wasm-binding-interface';
// Coordination interfaces
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
// Database interfaces
export { DatabaseConfig } from '../../database/providers/database-providers';
export {
  BackendConfig,
  BackendInterface,
  BackendStats,
  JSONValue,
  StorageResult,
} from '../../memory/backends/base.backend';
// Memory interfaces
export { CacheEntry, SessionState } from '../../memory/memory';
// Agent interfaces - unified types
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
} from '../../types/agent-types';
// Event interfaces
export * from '../../types/event-types';
// Base interfaces - core contracts
export * from './base-interfaces';
