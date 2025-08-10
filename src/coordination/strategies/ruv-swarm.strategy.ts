import { getLogger } from '../config/logging-config';

const logger = getLogger('coordination-strategies-ruv-swarmstrategy');

/**
 * @file A swarm strategy that uses the ZenSwarm implementation.
 */

import type { Agent, SwarmStrategy } from '../../types';
import { ZenSwarm } from '../swarm/core';

export class ZenSwarmStrategy implements SwarmStrategy {
  private swarm: ZenSwarm;

  constructor() {
    this.swarm = new ZenSwarm();
  }

  async createAgent(config: any): Promise<Agent> {
    const agentId = this.swarm.addAgent(config);
    return {
      id: agentId,
      capabilities: config?.capabilities || [],
      status: 'idle' as const,
    };
  }

  async destroyAgent(agentId: string): Promise<void> {
    this.swarm.removeAgent(agentId);
  }

  async sendMessage(_agentId: string, _message: any): Promise<void> {
    // ZenSwarm does not have a direct sendMessage method.
    // This would need to be implemented or mapped to an existing method.
    logger.warn('sendMessage is not implemented in ZenSwarmStrategy');
  }

  async assignTaskToAgent(_agentId: string, task: any): Promise<void> {
    // This is a simplified mapping. A real implementation would be more robust.
    const swarmTask = { ...task, id: `task-${Date.now()}` };
    await this.swarm.submitTask(swarmTask);
  }

  async getAgents(): Promise<Agent[]> {
    const agents = this.swarm
      .getTasksByStatus('in_progress')
      .flatMap((t) => t.assignedAgents || []);
    return agents.map((a) => ({ id: a, capabilities: [], status: 'busy' }));
  }
}
