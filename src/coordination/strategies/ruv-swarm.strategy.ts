/**
 * @fileoverview A swarm strategy that uses the RuvSwarm implementation.
 */

import { SwarmStrategy, Agent } from '../orchestrator';
import { RuvSwarm } from '../swarm/core';

export class RuvSwarmStrategy implements SwarmStrategy {
  private swarm: RuvSwarm;

  constructor() {
    this.swarm = new RuvSwarm();
  }

  async createAgent(config: any): Promise<Agent> {
    const agentId = this.swarm.addAgent(config);
    return { id: agentId };
  }

  async destroyAgent(agentId: string): Promise<void> {
    this.swarm.removeAgent(agentId);
  }

  async sendMessage(agentId: string, message: any): Promise<void> {
    // RuvSwarm does not have a direct sendMessage method.
    // This would need to be implemented or mapped to an existing method.
    console.warn('sendMessage is not implemented in RuvSwarmStrategy');
  }

  async assignTaskToAgent(agentId: string, task: any): Promise<void> {
    // This is a simplified mapping. A real implementation would be more robust.
    const swarmTask = { ...task, id: `task-${Date.now()}` };
    await this.swarm.submitTask(swarmTask);
  }

  async getAgents(): Promise<Agent[]> {
    const agents = this.swarm.getTasksByStatus('in_progress').map(t => t.assignedAgents || []).flat();
    return agents.map(a => ({ id: a, capabilities: [], status: 'busy' }));
  }
}
