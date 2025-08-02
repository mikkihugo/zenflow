/**
 * Coordination Module - Barrel Export
 *
 * Central export point for swarm coordination functionality
 */

// Types (re-export shared types for convenience)
export type {
  CoordinationProvider,
  CoordinationStrategy,
  RuvSwarm,
  SwarmAgent,
  SwarmConfig,
  SwarmStatus,
  SwarmTopology,
} from '../types/shared-types';
// Agents
export * from './agents/agent-manager';
export * from './agents/execution-engine';
// GitHub Integration
export * from './github/github-coordinator';
// Load Balancing
export * from './load-balancing/load-balancer';
// Main coordination components
export { CoordinationManager } from './manager';
export * from './mcp/client';
export * from './mcp/core/error-handler';
// MCP Integration
export * from './mcp/server';
export * from './protocols/communication/communication-protocols';
export * from './protocols/distribution/task-distribution-engine';
export * from './protocols/lifecycle/agent-lifecycle-manager';
// Protocols
export * from './protocols/topology/topology-manager';
