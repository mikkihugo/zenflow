/**
 * @file Coordination Domain Types - Comprehensive Agent and Swarm Types
 * 
 * Single source of truth for all coordination-related types including the comprehensive
 * AgentType enumeration (140+ types), swarm configurations, and task orchestration.
 * 
 * Following domain architecture standard with complete type definitions.
 */

// Re-export comprehensive AgentType from master registry (140+ types)
// This prevents "Type X is not assignable" errors in coordination domain
export type {AgentType} from '../types/agent-types';

export interface Agent {
  id: string;
  capabilities: string[];
  status: 'idle' | 'busy';
}

export interface Task {
  id: string;
  description: string;
  strategy: 'parallel' | 'sequential' | 'adaptive' | 'consensus';
  dependencies: string[];
  requiredCapabilities: string[];
  maxAgents: number;
  requireConsensus: boolean;
}

export interface PhaseAssignment {
  phase: string;
  agentId: string;
  capabilities: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface ExecutionCheckpoint {
  id: string;
  phase: string;
  timestamp: Date;
  status: 'pending' | 'completed';
  data?: Record<string, unknown>;
}

export interface ExecutionPlan {
  taskId: string;
  phases: string[];
  phaseAssignments: PhaseAssignment[];
  parallelizable: boolean;
  checkpoints: ExecutionCheckpoint[];
}

// Import SwarmAgent type from shared types
import type { SwarmAgent } from '../types/shared-types';

// Agent configuration interface
export interface AgentConfig {
  id?: string;
  name?: string;
  type?: string;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
}

// Union type for agent compatibility
export type CompatibleAgent = Agent | SwarmAgent;

export interface SwarmStrategy {
  createAgent(config: AgentConfig): Promise<CompatibleAgent>;
  destroyAgent(agentId: string): Promise<void>;
  assignTaskToAgent(agentId: string, task: Task): Promise<void>;
  getAgents(): Promise<CompatibleAgent[]>;
}
