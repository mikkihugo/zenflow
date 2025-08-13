import { getLogger } from '../../config/logging-config.ts';

const logger = getLogger('coordination-strategies-ruv-swarmstrategy');

/**
 * @file A swarm strategy that uses the ZenSwarm implementation.
 */

import type { SwarmAgent } from '../../types/shared-types.ts';
import { ZenSwarm } from '../swarm/core/index.js';
import type { SwarmStrategy } from '../types.ts';

export class ZenSwarmStrategy implements SwarmStrategy {
  private swarm: ZenSwarm;

  constructor() {
    this.swarm = new ZenSwarm();
  }

  async createAgent(config: unknown): Promise<SwarmAgent> {
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

  async sendMessage(_agentId: string, _message: unknown): Promise<void> {
    // ZenSwarm does not have a direct sendMessage method.
    // This would need to be implemented or mapped to an existing method.
    logger.warn('sendMessage is not implemented in ZenSwarmStrategy');
  }

  async assignTaskToAgent(_agentId: string, task: unknown): Promise<void> {
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
      metadata: {},
    }));
  }
}
