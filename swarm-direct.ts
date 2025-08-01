#!/usr/bin/env node

/**
 * Swarm Direct - Simple TypeScript Integration
 * Direct swarm coordination without the DAA abstraction layer
 */

import { daaService } from './ruv-FANN-zen/ruv-swarm-zen/npm/src/daa-service.js';

// Simple, focused types
interface Agent {
  id: string;
  role: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'busy';
}

interface SwarmTask {
  description: string;
  assignedAgents: string[];
  priority: 'low' | 'medium' | 'high';
}

interface SwarmResult {
  taskId: string;
  completed: boolean;
  duration: number;
  agentResults: any[];
}

class DirectSwarm {
  private agents: Map<string, Agent> = new Map();
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    console.log('🚀 Initializing Direct Swarm...');
    await daaService.initialize();
    this.initialized = true;
    console.log('✅ Swarm ready');
  }

  async addAgent(id: string, role: string, capabilities: string[]): Promise<Agent> {
    if (!this.initialized) await this.init();

    console.log(`🤖 Adding agent: ${id} (${role})`);

    // Create the actual agent through DAA service
    await daaService.createAgent({
      id,
      capabilities,
      cognitivePattern: 'adaptive'
    });

    const agent: Agent = {
      id,
      role,
      capabilities,
      status: 'active'
    };

    this.agents.set(id, agent);
    console.log(`✅ Agent ${id} added`);
    return agent;
  }

  async executeTask(task: SwarmTask): Promise<SwarmResult> {
    if (!this.initialized) throw new Error('Swarm not initialized');

    console.log(`🎯 Executing: ${task.description}`);
    const startTime = Date.now();

    // Create simple workflow
    const workflowId = `task-${Date.now()}`;
    await daaService.createWorkflow(workflowId, [
      {
        id: 'main-task',
        task: { method: 'make_decision', args: [{ description: task.description }] }
      }
    ], {});

    // Execute with assigned agents
    const result = await daaService.executeWorkflow(workflowId, {
      agentIds: task.assignedAgents,
      parallel: true
    });

    const duration = Date.now() - startTime;

    console.log(`✅ Task completed in ${duration}ms`);

    return {
      taskId: workflowId,
      completed: result.complete,
      duration,
      agentResults: result.stepResults
    };
  }

  getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  async shutdown(): Promise<void> {
    console.log('🧹 Shutting down swarm...');
    for (const agentId of this.agents.keys()) {
      await daaService.destroyAgent(agentId);
    }
    await daaService.cleanup();
    this.agents.clear();
    this.initialized = false;
    console.log('✅ Swarm shutdown complete');
  }
}

// Simple demo
async function demo(): Promise<void> {
  const swarm = new DirectSwarm();

  try {
    // Initialize
    await swarm.init();

    // Add some agents
    await swarm.addAgent('coder', 'developer', ['coding', 'debugging']);
    await swarm.addAgent('tester', 'qa', ['testing', 'validation']);
    await swarm.addAgent('reviewer', 'reviewer', ['review', 'analysis']);

    // Execute a task
    const result = await swarm.executeTask({
      description: 'Build and test a new feature',
      assignedAgents: ['coder', 'tester', 'reviewer'],
      priority: 'high'
    });

    console.log('📊 Result:', {
      taskId: result.taskId,
      completed: result.completed,
      duration: result.duration + 'ms',
      agents: swarm.getAgents().map(a => `${a.id}(${a.role})`)
    });

    // Shutdown
    await swarm.shutdown();

  } catch (error) {
    console.error('❌ Demo failed:', error);
    await swarm.shutdown();
  }
}

export { DirectSwarm };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo().then(() => {
    console.log('🎉 Demo completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Demo failed:', error);
    process.exit(1);
  });
}