/**
 * Swarm coordination tokens for dependency injection.
 * Defines tokens for swarm and agent management services.
 */
/**
 * @file Swarm-tokens implementation.
 */

import { createToken } from './token-factory';

// Swarm coordination interfaces (to be implemented)
export interface SwarmCoordinator {
  initializeSwarm(options: unknown): Promise<void>;
  addAgent(config: unknown): Promise<string>;
  removeAgent(agentId: string): Promise<void>;
  assignTask(task: unknown): Promise<string>;
  getMetrics(): unknown;
  shutdown(): Promise<void>;
}

export interface AgentRegistry {
  registerAgent(agent: unknown): Promise<void>;
  unregisterAgent(agentId: string): Promise<void>;
  getAgent(agentId: string): Promise<unknown>;
  getActiveAgents(): Promise<any[]>;
  findAvailableAgents(criteria: unknown): Promise<any[]>;
}

export interface MessageBroker {
  publish(topic: string, message: unknown): Promise<void>;
  subscribe(topic: string, handler: (message: unknown) => void): Promise<void>;
  unsubscribe(
    topic: string,
    handler: (message: unknown) => void
  ): Promise<void>;
  broadcast(message: unknown): Promise<void>;
}

export interface LoadBalancer {
  selectAgent(criteria: unknown): Promise<string>;
  updateAgentLoad(agentId: string, load: number): Promise<void>;
  getLoadMetrics(): Promise<unknown>;
}

export interface TopologyManager {
  createTopology(type: string, options: unknown): Promise<void>;
  updateTopology(changes: unknown): Promise<void>;
  getTopologyInfo(): Promise<unknown>;
  validateTopology(): Promise<boolean>;
}

// Swarm coordination tokens
export const SWARM_TOKENS = {
  SwarmCoordinator: createToken<SwarmCoordinator>('SwarmCoordinator'),
  AgentRegistry: createToken<AgentRegistry>('AgentRegistry'),
  MessageBroker: createToken<MessageBroker>('MessageBroker'),
  LoadBalancer: createToken<LoadBalancer>('LoadBalancer'),
  TopologyManager: createToken<TopologyManager>('TopologyManager'),
} as const;
