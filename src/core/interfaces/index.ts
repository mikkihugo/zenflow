/**
 * Unified Interface Exports - Central Interface Registry
 *
 * This file provides a single point for importing all standardized interfaces,
 * ensuring consistency across the codebase and preventing interface conflicts.
 *
 * @fileoverview Central interface export registry
 */

// Base interfaces - core contracts
export * from './base-interfaces';

// Database interfaces
export { DatabaseConfig } from '../../database/providers/database-providers';

// Memory interfaces
export { SessionState, CacheEntry } from '../../memory/memory';
export {
  BackendConfig,
  BackendInterface,
  JSONValue,
  StorageResult,
  BackendStats,
} from '../../memory/backends/base.backend';

// Agent interfaces - unified types
export {
  AgentType,
  AgentState,
  AgentConfig,
  AgentCapabilities,
  AgentMetrics,
  AgentError,
  Agent,
  Task,
  ExecutionResult,
} from '../../types/agent-types';

// Coordination interfaces
export {
  SwarmOptions,
  SwarmConfig,
  SwarmTopology,
  SwarmLifecycleState,
  TaskPriority,
  TaskStatus,
  Connection,
  ConnectionType,
  SwarmMetrics,
  SwarmState,
  AgentPerformance,
  Message,
  MessageType,
  SwarmEvent,
  SwarmEventEmitter,
  WasmModule,
} from '../../coordination/swarm/core/types';

// Neural interfaces
export { WasmBindingInterface } from '../../bindings/wasm-binding-interface';

// Event interfaces
export * from '../../types/event-types';
