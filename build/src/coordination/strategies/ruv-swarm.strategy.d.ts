/**
 * @file A swarm strategy that uses the ZenSwarm implementation.
 */
import type { SwarmAgent } from '../../types/shared-types.ts';
import type { SwarmStrategy } from '../types.ts';
export declare class ZenSwarmStrategy implements SwarmStrategy {
    private swarm;
    constructor();
    createAgent(config: any): Promise<SwarmAgent>;
    destroyAgent(agentId: string): Promise<void>;
    sendMessage(_agentId: string, _message: any): Promise<void>;
    assignTaskToAgent(_agentId: string, task: any): Promise<void>;
    getAgents(): Promise<SwarmAgent[]>;
}
//# sourceMappingURL=ruv-swarm.strategy.d.ts.map