/**
 * Swarm coordination tokens for dependency injection.
 * Defines tokens for swarm and agent management services.
 */
/**
 * @file Swarm-tokens implementation.
 */
import { createToken } from './token-factory.ts';
// Swarm coordination tokens
export const SWARM_TOKENS = {
    SwarmCoordinator: createToken('SwarmCoordinator'),
    AgentRegistry: createToken('AgentRegistry'),
    MessageBroker: createToken('MessageBroker'),
    LoadBalancer: createToken('LoadBalancer'),
    TopologyManager: createToken('TopologyManager'),
};
