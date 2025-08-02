/**
 * @fileoverview Shared types and interfaces for the coordination module.
 */

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

export interface ExecutionPlan {
  taskId: string;
  phases: string[];
  phaseAssignments: any[];
  parallelizable: boolean;
  checkpoints: any[];
}

export interface SwarmStrategy {
  createAgent(config: any): Promise<Agent>;
  destroyAgent(agentId: string): Promise<void>;
  assignTaskToAgent(agentId: string, task: any): Promise<void>;
  getAgents(): Promise<Agent[]>;
}
