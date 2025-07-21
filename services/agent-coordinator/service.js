#!/usr/bin/env node
/**
 * Agent Coordinator Service
 * Manages swarm coordination, agent spawning, and task orchestration
 */

import { EventEmitter } from 'events';

export class AgentCoordinatorService extends EventEmitter {
  constructor(options = {}) {
    super();
    this.name = 'agent-coordinator';
    this.version = '1.0.0';
    this.port = options.port || 4002;
    this.activeSwarms = new Map();
    this.agents = new Map();
    this.status = 'stopped';
  }

  async start() {
    console.log(`🚀 Starting Agent Coordinator Service on port ${this.port}`);
    this.status = 'running';
    
    this.emit('started', { service: this.name, port: this.port });
    console.log(`✅ Agent Coordinator Service running`);
    
    return this;
  }

  async stop() {
    // Gracefully stop all active swarms
    for (const [swarmId, swarm] of this.activeSwarms) {
      await this.destroySwarm(swarmId);
    }
    
    this.status = 'stopped';
    this.emit('stopped', { service: this.name });
    console.log(`🛑 Agent Coordinator Service stopped`);
  }

  async createSwarm(topology = 'mesh', maxAgents = 6, strategy = 'parallel') {
    const swarmId = `swarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const swarm = {
      id: swarmId,
      topology,
      maxAgents,
      strategy,
      agents: [],
      status: 'active',
      created: new Date().toISOString()
    };
    
    this.activeSwarms.set(swarmId, swarm);
    this.emit('swarm-created', swarm);
    
    return {
      success: true,
      swarmId,
      topology,
      maxAgents,
      strategy,
      status: 'initialized'
    };
  }

  async spawnAgent(swarmId, type, name, capabilities = []) {
    const swarm = this.activeSwarms.get(swarmId);
    if (!swarm) {
      return { success: false, error: 'Swarm not found' };
    }

    if (swarm.agents.length >= swarm.maxAgents) {
      return { success: false, error: 'Maximum agents reached' };
    }

    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const agent = {
      id: agentId,
      swarmId,
      type,
      name,
      capabilities,
      status: 'active',
      created: new Date().toISOString()
    };
    
    swarm.agents.push(agent);
    this.agents.set(agentId, agent);
    this.emit('agent-spawned', agent);
    
    return {
      success: true,
      agentId,
      type,
      name,
      status: 'active'
    };
  }

  async orchestrateTask(swarmId, task, strategy = 'parallel', priority = 'medium') {
    const swarm = this.activeSwarms.get(swarmId);
    if (!swarm) {
      return { success: false, error: 'Swarm not found' };
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    
    const taskDef = {
      id: taskId,
      swarmId,
      task,
      strategy,
      priority,
      status: 'pending',
      created: new Date().toISOString()
    };
    
    this.emit('task-orchestrated', taskDef);
    
    return {
      success: true,
      taskId,
      task,
      strategy,
      priority,
      status: 'pending'
    };
  }

  async getSwarmStatus(swarmId) {
    const swarm = this.activeSwarms.get(swarmId);
    if (!swarm) {
      return { success: false, error: 'Swarm not found' };
    }

    return {
      success: true,
      swarmId,
      topology: swarm.topology,
      agentCount: swarm.agents.length,
      activeAgents: swarm.agents.filter(a => a.status === 'active').length,
      maxAgents: swarm.maxAgents,
      status: swarm.status,
      created: swarm.created
    };
  }

  async destroySwarm(swarmId) {
    const swarm = this.activeSwarms.get(swarmId);
    if (!swarm) {
      return { success: false, error: 'Swarm not found' };
    }

    // Remove all agents
    for (const agent of swarm.agents) {
      this.agents.delete(agent.id);
    }
    
    this.activeSwarms.delete(swarmId);
    this.emit('swarm-destroyed', { swarmId });
    
    return { success: true, swarmId };
  }

  getStatus() {
    return {
      service: this.name,
      version: this.version,
      status: this.status,
      port: this.port,
      activeSwarms: this.activeSwarms.size,
      totalAgents: this.agents.size,
      endpoints: [
        'POST /swarms/create',
        'POST /swarms/:id/agents/spawn',
        'POST /swarms/:id/tasks/orchestrate',
        'GET /swarms/:id/status',
        'DELETE /swarms/:id'
      ]
    };
  }
}

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
  const service = new AgentCoordinatorService();
  await service.start();
  
  process.on('SIGINT', async () => {
    await service.stop();
    process.exit(0);
  });
}