import { getLogger } from '../../config/logging-config';

const logger = getLogger('coordination-strategies-ruv-swarmstrategy');

/**
 * @file A swarm strategy that uses the ZenSwarm implementation.
 */

import type { SwarmStrategy } from '../types';
import type { SwarmAgent } from '../../types/shared-types';
import { ZenSwarm } from '../swarm/core';

export class ZenSwarmStrategy implements SwarmStrategy {
  private swarm: ZenSwarm;

  constructor() {
    this.swarm = new ZenSwarm();
  }

  async createAgent(config: any): Promise<SwarmAgent> {
    const agentId = this.swarm.addAgent(config);
    return {
      id: agentId,
      name: config?.name || `Agent-${agentId}`,
      type: config?.type || 'researcher',
      capabilities: config?.capabilities || [],
      status: 'idle' as const,
      metadata: config?.metadata || {},
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

  async getAgents(): Promise<SwarmAgent[]> {
    const agents = this.swarm
      .getTasksByStatus('in_progress')
      .flatMap((t) => t.assignedAgents || []);
    return agents.map((a) => ({ 
      id: a, 
      name: `Agent-${a}`,
      type: 'researcher' as const,
      capabilities: [], 
      status: 'busy' as const,
      metadata: {}
    }));
  }
}
