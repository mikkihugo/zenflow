import { createToken } from './token-factory.ts';
export const SWARM_TOKENS = {
    SwarmCoordinator: createToken('SwarmCoordinator'),
    AgentRegistry: createToken('AgentRegistry'),
    MessageBroker: createToken('MessageBroker'),
    LoadBalancer: createToken('LoadBalancer'),
    TopologyManager: createToken('TopologyManager'),
};
//# sourceMappingURL=swarm-tokens.js.map