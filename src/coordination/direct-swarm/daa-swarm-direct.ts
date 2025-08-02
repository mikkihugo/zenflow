#!/usr/bin/env node

/**
 * DAA Swarm - Direct TypeScript Integration
 * Uses ruv-swarm DAA service directly with full type safety
 */

import { DAAService, daaService } from './ruv-FANN-zen/ruv-swarm-zen/npm/src/daa-service.js';

// Type definitions for DAA Swarm
interface SwarmConfig {
  maxAgents?: number;
  enableLearning?: boolean;
  enableCoordination?: boolean;
  topology?: 'mesh' | 'hierarchical' | 'ring' | 'star';
}

interface AgentConfig {
  id: string;
  role?: string;
  capabilities?: string[];
  cognitivePattern?: 'convergent' | 'divergent' | 'lateral' | 'systems' | 'critical' | 'adaptive';
  learningRate?: number;
  enableMemory?: boolean;
}

interface TaskStep {
  id: string;
  task: {
    method: string;
    args: any[];
  };
  agentFilter?: (agent: any) => boolean;
}

interface Task {
  description: string;
  steps?: TaskStep[];
  dependencies?: Record<string, string[]>;
}

interface CoordinationOptions {
  strategy?: 'parallel' | 'sequential';
  maxAgents?: number;
  timeout?: number;
}

interface KnowledgeData {
  domain?: string;
  content: any;
}

interface AgentResult {
  success: boolean;
  agentId: string;
  role?: string;
  capabilities?: string[];
  error?: string;
}

interface TaskResult {
  success: boolean;
  workflowId: string;
  duration: number;
  result: any;
  agentsInvolved: string[];
}

interface SwarmStatus {
  swarmId: string;
  initialized: boolean;
  config: SwarmConfig & { swarmId: string };
  agents: {
    total: number;
    active: number;
    roles: Record<string, number>;
  };
  service: any;
  performance: any;
  uptime: number;
}

interface AdaptationFeedback {
  performanceScore: number;
  feedback?: string;
  suggestions?: string[];
}

interface Agent {
  id: string;
  wasmAgent: any;
  capabilities: Set<string>;
  cognitivePattern: string;
  config: {
    learningRate: number;
    enableMemory: boolean;
    autonomousMode: boolean;
    [key: string]: any;
  };
  status: string;
  createdAt: number;
  lastActivity: number;
  metrics: {
    decisionsMade: number;
    tasksCompleted: number;
    errors: number;
    averageResponseTime: number;
  };
  role?: string;
  swarmId?: string;
}

class DAASwarmDirector {
  private swarmId: string;
  private agents: Map<string, Agent>;
  private initialized: boolean;
  private config?: SwarmConfig & { swarmId: string };

  constructor() {
    this.swarmId = `swarm-${Date.now()}`;
    this.agents = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the DAA swarm with direct service integration
   */
  async initialize(config: SwarmConfig = {}): Promise<{
    success: boolean;
    swarmId: string;
    capabilities: any;
  }> {
    console.log('🚀 Initializing DAA Swarm Direct TypeScript Integration...');

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

      // Set up event listeners with proper typing
      daaService.on('agentCreated', this.handleAgentCreated.bind(this));
      daaService.on('decisionMade', this.handleDecisionMade.bind(this));
      daaService.on('workflowStepCompleted', this.handleWorkflowStep.bind(this));

      this.initialized = true;

      const capabilities = daaService.getCapabilities();

      console.log('✅ DAA Swarm initialized:', {
        swarmId: this.swarmId,
        capabilities,
        config: this.config,
      });

      return {
        success: true,
        swarmId: this.swarmId,
        capabilities,
      };
    } catch (error) {
      console.error('❌ Failed to initialize DAA swarm:', error);
      throw error;
    }
  }

  /**
   * Spawn multiple agents with different roles
   */
  async spawnAgents(agentConfigs: AgentConfig[]): Promise<AgentResult[]> {
    if (!this.initialized) {
      throw new Error('Swarm not initialized. Call initialize() first.');
    }

    console.log(`🤖 Spawning ${agentConfigs.length} agents...`);

    const results: AgentResult[] = [];

    for (const config of agentConfigs) {
      try {
        const agent = await daaService.createAgent({
          id: config.id,
          capabilities: config.capabilities || ['general'],
          cognitivePattern: config.cognitivePattern || 'adaptive',
          learningRate: config.learningRate || 0.001,
          enableMemory: config.enableMemory !== false,
        });

        const enhancedAgent: Agent = {
          ...agent,
          role: config.role || 'worker',
          swarmId: this.swarmId,
        };

        this.agents.set(config.id, enhancedAgent);

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
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * Coordinate agents to work on a task
   */
  async coordinateTask(task: Task, options: CoordinationOptions = {}): Promise<TaskResult> {
    if (!this.initialized || !this.config) {
      throw new Error('Swarm not initialized');
    }

    const { strategy = 'parallel', maxAgents = this.config.maxAgents, timeout = 30000 } = options;

    console.log(`🎯 Coordinating task: "${task.description}"`);

    try {
      // Create workflow
      const workflowId = `workflow-${Date.now()}`;
      const steps: TaskStep[] = task.steps || [
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
  async shareKnowledge(
    sourceAgentId: string,
    targetAgentIds: string[],
    knowledge: KnowledgeData
  ): Promise<{ updatedAgents: string[]; transferRate: number }> {
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
  async getSwarmStatus(): Promise<SwarmStatus | { initialized: false }> {
    if (!this.initialized || !this.config) {
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
        roles: Array.from(this.agents.values()).reduce((acc: Record<string, number>, agent) => {
          const role = agent.role || 'unknown';
          acc[role] = (acc[role] || 0) + 1;
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
  async adaptAgents(feedbackData: Record<string, AdaptationFeedback>): Promise<
    Array<{
      agentId: string;
      success: boolean;
      adaptation?: any;
      error?: string;
    }>
  > {
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
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return results;
  }

  /**
   * Get agent by ID with type safety
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all agents with type safety
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: string): Agent[] {
    return Array.from(this.agents.values()).filter((agent) => agent.role === role);
  }

  /**
   * Event handlers with proper typing
   */
  private handleAgentCreated(event: { agentId: string; capabilities: string[] }): void {
    console.log(`📢 Agent created event:`, event.agentId);
  }

  private handleDecisionMade(event: {
    agentId: string;
    decision: any;
    latency: number;
    withinThreshold: boolean;
  }): void {
    console.log(`🧠 Decision made by ${event.agentId} (${event.latency.toFixed(2)}ms)`);
  }

  private handleWorkflowStep(event: {
    workflowId: string;
    stepId: string;
    agentIds: string[];
    duration: number;
    result: any;
  }): void {
    console.log(`⚡ Workflow step completed: ${event.stepId} (${event.duration.toFixed(2)}ms)`);
  }

  /**
   * Cleanup swarm resources
   */
  async cleanup(): Promise<void> {
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

// Example usage function with full TypeScript support
async function demonstrateSwarmUsage(): Promise<{
  success: boolean;
  swarmId: string;
  taskResult: TaskResult;
  finalStatus: SwarmStatus | { initialized: false };
}> {
  const swarm = new DAASwarmDirector();

  try {
    // Initialize swarm with typed config
    await swarm.initialize({
      maxAgents: 6,
      topology: 'hierarchical',
      enableLearning: true,
    });

    // Spawn specialized agents with typed configs
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

    // Coordinate a complex task with typed parameters
    const taskResult = await swarm.coordinateTask(
      {
        description: 'Implement and optimize a new TypeScript feature',
        steps: [
          {
            id: 'requirements',
            task: {
              method: 'make_decision',
              args: [{ phase: 'requirements', task: 'analyze TS requirements' }],
            },
          },
          {
            id: 'design',
            task: {
              method: 'make_decision',
              args: [{ phase: 'design', task: 'create TS system design' }],
            },
          },
          {
            id: 'implement',
            task: {
              method: 'make_decision',
              args: [{ phase: 'implementation', task: 'write TypeScript code' }],
            },
          },
          {
            id: 'optimize',
            task: {
              method: 'make_decision',
              args: [{ phase: 'optimization', task: 'optimize TS performance' }],
            },
          },
        ],
        dependencies: {}, // Remove dependencies for this demo
      },
      {
        strategy: 'sequential',
        maxAgents: 4,
      }
    );

    // Share knowledge between agents with typed data
    await swarm.shareKnowledge('coordinator', ['analyst', 'coder'], {
      domain: 'typescript-insights',
      content: {
        bestPractices: ['use strict types', 'leverage generics', 'implement interfaces'],
        lessons: ['type safety prevents bugs', 'generics enable reusability'],
      },
    });

    // Adapt agents with typed feedback
    await swarm.adaptAgents({
      coordinator: {
        performanceScore: 0.9,
        feedback: 'Excellent coordination',
        suggestions: ['continue current approach'],
      },
      coder: {
        performanceScore: 0.8,
        feedback: 'Good implementation',
        suggestions: ['focus on type safety'],
      },
    });

    // Get status with type safety
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
export type {
  SwarmConfig,
  AgentConfig,
  Task,
  TaskResult,
  SwarmStatus,
  Agent,
  KnowledgeData,
  AdaptationFeedback,
};

// Run demonstration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateSwarmUsage()
    .then((result) => {
      console.log('🎉 TypeScript Swarm demonstration completed successfully:', result.success);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Demonstration failed:', error);
      process.exit(1);
    });
}
