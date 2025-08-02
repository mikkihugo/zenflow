#!/usr/bin/env node

/**
 * DAA Swarm - Direct JavaScript Integration
 * Uses ruv-swarm DAA service directly without MCP layer
 */

import { daaService } from './ruv-FANN-zen/ruv-swarm-zen/npm/src/daa-service.js';

class DAASwarmDirector {
  constructor() {
    this.swarmId = `swarm-${Date.now()}`;
    this.agents = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the DAA swarm with direct service integration
   */
  async initialize(config = {}) {
    console.log('🚀 Initializing DAA Swarm Direct Integration...');

    try {
      // Initialize DAA service
      await daaService.initialize();

      const {
        maxAgents = 5,
        enableLearning = true,
        enableCoordination = true,
        topology = 'mesh',
      } = config;

      this.config = {
        maxAgents,
        enableLearning,
        enableCoordination,
        topology,
        swarmId: this.swarmId,
      };

      // Set up event listeners
      daaService.on('agentCreated', this.handleAgentCreated.bind(this));
      daaService.on('decisionMade', this.handleDecisionMade.bind(this));
      daaService.on('workflowStepCompleted', this.handleWorkflowStep.bind(this));

      this.initialized = true;

      console.log('✅ DAA Swarm initialized:', {
        swarmId: this.swarmId,
        capabilities: daaService.getCapabilities(),
        config: this.config,
      });

      return {
        success: true,
        swarmId: this.swarmId,
        capabilities: daaService.getCapabilities(),
      };
    } catch (error) {
      console.error('❌ Failed to initialize DAA swarm:', error);
      throw error;
    }
  }

  /**
   * Spawn multiple agents with different roles
   */
  async spawnAgents(agentConfigs) {
    if (!this.initialized) {
      throw new Error('Swarm not initialized. Call initialize() first.');
    }

    console.log(`🤖 Spawning ${agentConfigs.length} agents...`);

    const results = [];

    for (const config of agentConfigs) {
      try {
        const agent = await daaService.createAgent({
          id: config.id,
          capabilities: config.capabilities || ['general'],
          cognitivePattern: config.cognitivePattern || 'adaptive',
          learningRate: config.learningRate || 0.001,
          enableMemory: config.enableMemory !== false,
        });

        this.agents.set(config.id, {
          ...agent,
          role: config.role || 'worker',
          swarmId: this.swarmId,
        });

        results.push({
          success: true,
          agentId: config.id,
          role: config.role,
          capabilities: Array.from(agent.capabilities),
        });

        console.log(`✅ Spawned agent: ${config.id} (${config.role})`);
      } catch (error) {
        console.error(`❌ Failed to spawn agent ${config.id}:`, error);
        results.push({
          success: false,
          agentId: config.id,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Coordinate agents to work on a task
   */
  async coordinateTask(task, options = {}) {
    if (!this.initialized) {
      throw new Error('Swarm not initialized');
    }

    const { strategy = 'parallel', maxAgents = this.config.maxAgents, timeout = 30000 } = options;

    console.log(`🎯 Coordinating task: "${task.description}"`);

    try {
      // Create workflow
      const workflowId = `workflow-${Date.now()}`;
      const steps = task.steps || [
        {
          id: 'analyze',
          task: { method: 'make_decision', args: [{ task: task.description, phase: 'analysis' }] },
        },
        {
          id: 'execute',
          task: { method: 'make_decision', args: [{ task: task.description, phase: 'execution' }] },
        },
        {
          id: 'validate',
          task: {
            method: 'make_decision',
            args: [{ task: task.description, phase: 'validation' }],
          },
        },
      ];

      await daaService.createWorkflow(workflowId, steps, task.dependencies || {});

      // Select agents for the task
      const availableAgents = Array.from(this.agents.keys()).slice(0, maxAgents);

      if (availableAgents.length === 0) {
        throw new Error('No agents available for task coordination');
      }

      // Execute workflow
      const startTime = Date.now();
      const result = await daaService.executeWorkflow(workflowId, {
        agentIds: availableAgents,
        parallel: strategy === 'parallel',
      });

      const duration = Date.now() - startTime;

      console.log(`✅ Task completed in ${duration}ms:`, {
        workflowId,
        stepsCompleted: result.stepsCompleted,
        agentsInvolved: result.agentsInvolved.length,
      });

      return {
        success: true,
        workflowId,
        duration,
        result,
        agentsInvolved: result.agentsInvolved,
      };
    } catch (error) {
      console.error('❌ Task coordination failed:', error);
      throw error;
    }
  }

  /**
   * Enable knowledge sharing between agents
   */
  async shareKnowledge(sourceAgentId, targetAgentIds, knowledge) {
    console.log(`🧠 Sharing knowledge from ${sourceAgentId} to ${targetAgentIds.length} agents`);

    try {
      const result = await daaService.shareKnowledge(sourceAgentId, targetAgentIds, {
        domain: knowledge.domain || 'general',
        content: knowledge.content,
        timestamp: Date.now(),
      });

      console.log(`✅ Knowledge shared successfully:`, {
        updatedAgents: result.updatedAgents.length,
        transferRate: result.transferRate,
      });

      return result;
    } catch (error) {
      console.error('❌ Knowledge sharing failed:', error);
      throw error;
    }
  }

  /**
   * Get swarm status and metrics
   */
  async getSwarmStatus() {
    if (!this.initialized) {
      return { initialized: false };
    }

    const serviceStatus = daaService.getStatus();
    const performanceMetrics = await daaService.getPerformanceMetrics();

    return {
      swarmId: this.swarmId,
      initialized: this.initialized,
      config: this.config,
      agents: {
        total: this.agents.size,
        active: Array.from(this.agents.values()).filter((a) => a.status === 'active').length,
        roles: Array.from(this.agents.values()).reduce((acc, agent) => {
          acc[agent.role] = (acc[agent.role] || 0) + 1;
          return acc;
        }, {}),
      },
      service: serviceStatus,
      performance: performanceMetrics,
      uptime: Date.now() - parseInt(this.swarmId.split('-')[1]),
    };
  }

  /**
   * Adapt agents based on performance feedback
   */
  async adaptAgents(feedbackData) {
    console.log('🔄 Adapting agents based on feedback...');

    const results = [];

    for (const [agentId, agent] of this.agents) {
      try {
        const agentFeedback = feedbackData[agentId] || {
          performanceScore: 0.7,
          feedback: 'Standard performance',
        };

        const adaptation = await daaService.adaptAgent(agentId, agentFeedback);

        results.push({
          agentId,
          success: true,
          adaptation,
        });

        console.log(
          `✅ Adapted agent ${agentId}: ${adaptation.previousPattern} → ${adaptation.newPattern}`
        );
      } catch (error) {
        console.error(`❌ Failed to adapt agent ${agentId}:`, error);
        results.push({
          agentId,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Event handlers
   */
  handleAgentCreated(event) {
    console.log(`📢 Agent created event:`, event.agentId);
  }

  handleDecisionMade(event) {
    console.log(`🧠 Decision made by ${event.agentId} (${event.latency.toFixed(2)}ms)`);
  }

  handleWorkflowStep(event) {
    console.log(`⚡ Workflow step completed: ${event.stepId} (${event.duration.toFixed(2)}ms)`);
  }

  /**
   * Cleanup swarm resources
   */
  async cleanup() {
    console.log('🧹 Cleaning up DAA swarm...');

    try {
      // Destroy all agents
      for (const agentId of this.agents.keys()) {
        await daaService.destroyAgent(agentId);
      }

      // Clean up service
      await daaService.cleanup();

      this.agents.clear();
      this.initialized = false;

      console.log('✅ DAA swarm cleanup completed');
    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Example usage function
async function demonstrateSwarmUsage() {
  const swarm = new DAASwarmDirector();

  try {
    // Initialize swarm
    await swarm.initialize({
      maxAgents: 6,
      topology: 'hierarchical',
      enableLearning: true,
    });

    // Spawn specialized agents
    await swarm.spawnAgents([
      {
        id: 'coordinator',
        role: 'coordinator',
        capabilities: ['coordination', 'planning', 'monitoring'],
        cognitivePattern: 'systems',
      },
      {
        id: 'analyst',
        role: 'analyst',
        capabilities: ['analysis', 'research', 'evaluation'],
        cognitivePattern: 'critical',
      },
      {
        id: 'coder',
        role: 'coder',
        capabilities: ['coding', 'implementation', 'testing'],
        cognitivePattern: 'convergent',
      },
      {
        id: 'optimizer',
        role: 'optimizer',
        capabilities: ['optimization', 'performance', 'efficiency'],
        cognitivePattern: 'adaptive',
      },
    ]);

    // Coordinate a complex task with sequential strategy for dependencies
    const taskResult = await swarm.coordinateTask(
      {
        description: 'Implement and optimize a new feature',
        steps: [
          {
            id: 'requirements',
            task: {
              method: 'make_decision',
              args: [{ phase: 'requirements', task: 'analyze requirements' }],
            },
          },
          {
            id: 'design',
            task: {
              method: 'make_decision',
              args: [{ phase: 'design', task: 'create system design' }],
            },
          },
          {
            id: 'implement',
            task: {
              method: 'make_decision',
              args: [{ phase: 'implementation', task: 'write code' }],
            },
          },
          {
            id: 'optimize',
            task: {
              method: 'make_decision',
              args: [{ phase: 'optimization', task: 'optimize performance' }],
            },
          },
        ],
        dependencies: {}, // Remove dependencies for this demo
      },
      {
        strategy: 'sequential', // Use sequential to avoid dependency issues
        maxAgents: 4,
      }
    );

    // Share knowledge between agents
    await swarm.shareKnowledge('coordinator', ['analyst', 'coder'], {
      domain: 'project-insights',
      content: {
        bestPractices: ['use parallel execution', 'coordinate through events'],
        lessons: ['early planning saves time', 'optimization is iterative'],
      },
    });

    // Get status
    const status = await swarm.getSwarmStatus();
    console.log('📊 Final swarm status:', JSON.stringify(status, null, 2));

    // Cleanup
    await swarm.cleanup();

    return {
      success: true,
      swarmId: swarm.swarmId,
      taskResult,
      finalStatus: status,
    };
  } catch (error) {
    console.error('💥 Swarm demonstration failed:', error);
    await swarm.cleanup();
    throw error;
  }
}

// Export for use as module
export { DAASwarmDirector, demonstrateSwarmUsage };

// Run demonstration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSwarmUsage()
    .then((result) => {
      console.log('🎉 Swarm demonstration completed successfully:', result.success);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Demonstration failed:', error);
      process.exit(1);
    });
}
