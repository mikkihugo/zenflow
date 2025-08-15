/**
 * Swarm coordination tokens for dependency injection.
 * Defines tokens for swarm and agent management services.
 */
/**
 * @file Swarm-tokens implementation.
 */

import { createToken } from './token-factory';

// Swarm coordination interfaces (to be implemented)
export interface ISwarmCoordinator {
  initializeSwarm(options: unknown): Promise<void>;
  addAgent(config: unknown): Promise<string>;
  removeAgent(agentId: string): Promise<void>;
  assignTask(task: unknown): Promise<string>;
  getMetrics(): unknown;
  shutdown(): Promise<void>;
}

export interface IAgentRegistry {
  registerAgent(agent: unknown): Promise<void>;
  unregisterAgent(agentId: string): Promise<void>;
  getAgent(agentId: string): Promise<unknown>;
  getActiveAgents(): Promise<any[]>;
  findAvailableAgents(criteria: unknown): Promise<any[]>;
}

export interface IMessageBroker {
  publish(topic: string, message: unknown): Promise<void>;
  subscribe(topic: string, handler: (message: unknown) => void): Promise<void>;
  unsubscribe(
    topic: string,
    handler: (message: unknown) => void
  ): Promise<void>;
  broadcast(message: unknown): Promise<void>;
}

export interface ILoadBalancer {
  selectAgent(criteria: unknown): Promise<string>;
  updateAgentLoad(agentId: string, load: number): Promise<void>;
  getLoadMetrics(): Promise<unknown>;
}

export interface ITopologyManager {
  createTopology(type: string, options: unknown): Promise<void>;
  updateTopology(changes: unknown): Promise<void>;
  getTopologyInfo(): Promise<unknown>;
  validateTopology(): Promise<boolean>;
}

// Swarm coordination tokens
export const SWARM_TOKENS = {
  SwarmCoordinator: createToken<ISwarmCoordinator>('SwarmCoordinator'),
  AgentRegistry: createToken<IAgentRegistry>('AgentRegistry'),
  MessageBroker: createToken<IMessageBroker>('MessageBroker'),
  LoadBalancer: createToken<ILoadBalancer>('LoadBalancer'),
  TopologyManager: createToken<ITopologyManager>('TopologyManager'),
} as const;
