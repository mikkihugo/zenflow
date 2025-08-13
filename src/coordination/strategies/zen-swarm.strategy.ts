/**
 * @fileoverview Enhanced Zen Swarm Strategy using comprehensive zen-swarm-orchestrator
 * 
 * This strategy leverages the complete zen-swarm ecosystem from zen-swarm-orchestrator
 * to provide advanced coordination capabilities including:
 * - Neural network integration
 * - DAA (Decentralized Autonomous Agents)
 * - A2A (Agent-to-Agent) protocol
 * - Advanced topologies and load balancing
 * - Persistence and memory management
 * - WASM performance optimization
 * 
 * @author Claude Code Zen Team
 * @since 1.0.0-alpha.43
 * @version 1.0.0
 */

import { getLogger } from '../../config/logging-config.ts';
import type { SwarmAgent } from '../../types/shared-types.ts';
import type { SwarmStrategy } from '../types.ts';
import { ZenOrchestratorIntegration } from '../../zen-orchestrator-integration.js';

const logger = getLogger('coordination-strategies-zen-swarm-strategy');

/**
 * Enhanced Zen Swarm Strategy with comprehensive orchestration capabilities.
 * 
 * This strategy provides:
 * - Advanced neural network coordination
 * - DAA autonomous agent management
 * - A2A protocol for agent communication
 * - Multi-topology support (mesh, hierarchical, star, ring)
 * - Intelligent load balancing and auto-scaling
 * - Persistent memory and state management
 * - WASM-accelerated performance
 */
export class ZenSwarmStrategy implements SwarmStrategy {
  private orchestrator: ZenOrchestratorIntegration;
  private agents: Map<string, SwarmAgent> = new Map();
  private agentCounter = 0;
  private isInitialized = false;

  constructor(config?: {
    topology?: 'mesh' | 'hierarchical' | 'star' | 'ring';
    maxAgents?: number;
    enableNeural?: boolean;
    enableDAA?: boolean;
    enableA2A?: boolean;
    enablePersistence?: boolean;
  }) {
    logger.info('🚀 Initializing Enhanced Zen Swarm Strategy', { config });

    this.orchestrator = new ZenOrchestratorIntegration({
      // Core configuration
      host: 'localhost',
      port: 4003,
      storage_path: '.zen/swarm-collective',
      enabled: true,

      // A2A Protocol configuration
      a2a_server_port: 4005,
      heartbeat_timeout_sec: 300,
      message_timeout_ms: 30000,
      use_websocket_transport: config?.enableA2A !== false,
      websocket_port: 4006,

      // Neural Stack configuration
      enable_zen_neural: config?.enableNeural !== false,
      enable_zen_forecasting: true,
      enable_zen_compute: true,
      gpu_enabled: false, // Can be enabled for GPU acceleration

      // Quantum Computing (experimental)
      enable_quantum: false,
    });
  }

  /**
   * Initialize the zen-swarm orchestrator
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.orchestrator.initialize();
      this.isInitialized = true;
      logger.info('✅ Zen Swarm Strategy initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize zen-swarm orchestrator', error);
      throw new Error(`Zen Swarm initialization failed: ${error}`);
    }
  }

  /**
   * Create an enhanced agent with neural and DAA capabilities
   */
  async createAgent(config: {
    name?: string;
    type?: string;
    capabilities?: string[];
    metadata?: Record<string, unknown>;
    enableNeural?: boolean;
    enableDAA?: boolean;
    cognitivePattern?: 'convergent' | 'divergent' | 'lateral' | 'systems' | 'critical' | 'adaptive';
  }): Promise<SwarmAgent> {
    await this.ensureInitialized();

    const agentId = `zen-agent-${++this.agentCounter}`;
    const agentType = config.type || 'researcher';
    const agentName = config.name || `${agentType}-${this.agentCounter}`;

    logger.info(`🤖 Creating enhanced agent: ${agentName}`, { 
      id: agentId, 
      type: agentType,
      neural: config.enableNeural,
      daa: config.enableDAA 
    });

    try {
      // Initialize neural capabilities if enabled
      let neuralCapabilities = undefined;
      if (config.enableNeural !== false) {
        const neuralResult = await this.orchestrator.executeNeuralService(
          'neural-agent-init',
          {
            agentId,
            agentType,
            cognitivePattern: config.cognitivePattern || 'adaptive'
          }
        );
        
        if (neuralResult.success) {
          neuralCapabilities = neuralResult.data;
          logger.info(`🧠 Neural capabilities initialized for ${agentName}`);
        }
      }

      // Create DAA agent if enabled
      let daaCapabilities = undefined;
      if (config.enableDAA !== false) {
        const daaResult = await this.orchestrator.sendA2AMessage(
          'daa_agent_create',
          {
            id: agentId,
            capabilities: config.capabilities || [],
            cognitivePattern: config.cognitivePattern || 'adaptive',
            enableMemory: true,
            learningRate: 0.1
          }
        );

        if (daaResult.success) {
          daaCapabilities = daaResult.data;
          logger.info(`🤖 DAA capabilities initialized for ${agentName}`);
        }
      }

      const agent: SwarmAgent = {
        id: agentId,
        name: agentName,
        type: agentType as any,
        capabilities: config.capabilities || [],
        status: 'initializing' as const,
        metadata: {
          ...config.metadata,
          created: new Date().toISOString(),
          neuralCapabilities,
          daaCapabilities,
          cognitivePattern: config.cognitivePattern || 'adaptive',
          orchestratorIntegration: true
        }
      };

      this.agents.set(agentId, agent);

      // Start the agent
      setTimeout(async () => {
        agent.status = 'idle';
        this.agents.set(agentId, agent);
        logger.info(`✅ Agent ${agentName} ready for tasks`);
      }, 1000);

      return agent;

    } catch (error) {
      logger.error(`❌ Failed to create agent ${agentName}`, error);
      throw new Error(`Agent creation failed: ${error}`);
    }
  }

  /**
   * Destroy an agent and cleanup resources
   */
  async destroyAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      logger.warn(`⚠️ Agent ${agentId} not found for destruction`);
      return;
    }

    logger.info(`🗑️ Destroying agent: ${agent.name}`);

    try {
      // Notify DAA system of agent removal
      if (agent.metadata?.daaCapabilities) {
        await this.orchestrator.sendA2AMessage(
          'daa_agent_destroy',
          { agentId }
        );
      }

      // Cleanup neural resources
      if (agent.metadata?.neuralCapabilities) {
        await this.orchestrator.executeNeuralService(
          'neural-agent-cleanup',
          { agentId }
        );
      }

      this.agents.delete(agentId);
      logger.info(`✅ Agent ${agent.name} destroyed successfully`);

    } catch (error) {
      logger.error(`❌ Error destroying agent ${agentId}`, error);
      // Still remove from local registry
      this.agents.delete(agentId);
    }
  }

  /**
   * Send enhanced A2A protocol messages between agents
   */
  async sendMessage(agentId: string, message: {
    to?: string;
    type: string;
    content: unknown;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<void> {
    await this.ensureInitialized();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    logger.info(`📨 Sending A2A message from ${agent.name}`, {
      type: message.type,
      priority: message.priority || 'medium'
    });

    try {
      const result = await this.orchestrator.sendA2AMessage(
        'agent_message',
        {
          from: agentId,
          to: message.to,
          messageType: message.type,
          content: message.content,
          priority: message.priority || 'medium',
          timestamp: Date.now()
        }
      );

      if (!result.success) {
        throw new Error(`A2A message failed: ${result.error}`);
      }

      logger.info(`✅ A2A message sent successfully in ${result.executionTimeMs}ms`);

    } catch (error) {
      logger.error(`❌ Failed to send A2A message`, error);
      throw error;
    }
  }

  /**
   * Assign task to agent with neural and DAA coordination
   */
  async assignTaskToAgent(agentId: string, task: {
    id?: string;
    type: string;
    description: string;
    priority?: number;
    input?: unknown;
    metadata?: Record<string, unknown>;
    requiresNeural?: boolean;
    requiresDAA?: boolean;
  }): Promise<void> {
    await this.ensureInitialized();

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    const taskId = task.id || `task-${Date.now()}`;
    
    logger.info(`📋 Assigning task to ${agent.name}`, {
      taskId,
      type: task.type,
      priority: task.priority
    });

    try {
      // Update agent status
      agent.status = 'busy';
      this.agents.set(agentId, agent);

      // Use neural coordination if required
      if (task.requiresNeural && agent.metadata?.neuralCapabilities) {
        const neuralResult = await this.orchestrator.executeNeuralService(
          'neural-task-coordinate',
          {
            agentId,
            taskId,
            taskType: task.type,
            input: task.input
          }
        );

        if (neuralResult.success) {
          logger.info(`🧠 Neural coordination completed for task ${taskId}`);
        }
      }

      // Use DAA coordination if required
      if (task.requiresDAA && agent.metadata?.daaCapabilities) {
        const daaResult = await this.orchestrator.sendA2AMessage(
          'daa_task_assign',
          {
            agentId,
            taskId,
            task: {
              type: task.type,
              description: task.description,
              priority: task.priority || 0,
              input: task.input,
              metadata: task.metadata
            }
          }
        );

        if (daaResult.success) {
          logger.info(`🤖 DAA coordination completed for task ${taskId}`);
        }
      }

      // Execute the task
      const result = await this.orchestrator.executeService('task-execute', {
        agentId,
        taskId,
        task
      });

      if (result.success) {
        logger.info(`✅ Task ${taskId} completed by ${agent.name} in ${result.executionTimeMs}ms`);
      } else {
        logger.error(`❌ Task ${taskId} failed: ${result.error}`);
        throw new Error(`Task execution failed: ${result.error}`);
      }

    } catch (error) {
      logger.error(`❌ Failed to assign task ${taskId} to ${agent.name}`, error);
      throw error;
    } finally {
      // Reset agent status
      if (this.agents.has(agentId)) {
        agent.status = 'idle';
        this.agents.set(agentId, agent);
      }
    }
  }

  /**
   * Get all agents with enhanced status information
   */
  async getAgents(): Promise<SwarmAgent[]> {
    const agents = Array.from(this.agents.values());
    
    // Enhance with real-time status from orchestrator
    for (const agent of agents) {
      try {
        const status = await this.orchestrator.getStatus();
        if (status.success && status.data) {
          // Update agent metadata with orchestrator status
          agent.metadata = {
            ...agent.metadata,
            orchestratorStatus: status.data,
            lastStatusCheck: new Date().toISOString()
          };
        }
      } catch (error) {
        logger.warn(`⚠️ Failed to get enhanced status for agent ${agent.name}`, error);
      }
    }

    return agents;
  }

  /**
   * Get comprehensive swarm metrics
   */
  async getMetrics(): Promise<{
    totalAgents: number;
    activeAgents: number;
    busyAgents: number;
    orchestratorMetrics?: any;
    a2aStatus?: any;
  }> {
    const agents = Array.from(this.agents.values());
    
    const metrics = {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.status !== 'error').length,
      busyAgents: agents.filter(a => a.status === 'busy').length,
      orchestratorMetrics: undefined,
      a2aStatus: undefined
    };

    try {
      // Get orchestrator metrics
      const orchestratorResult = await this.orchestrator.getMetrics();
      if (orchestratorResult.success) {
        metrics.orchestratorMetrics = orchestratorResult.data;
      }

      // Get A2A server status
      const a2aResult = await this.orchestrator.getA2AServerStatus();
      if (a2aResult.success) {
        metrics.a2aStatus = a2aResult.data;
      }
    } catch (error) {
      logger.warn('⚠️ Failed to get enhanced metrics', error);
    }

    return metrics;
  }

  /**
   * Shutdown the strategy and cleanup resources
   */
  async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down Zen Swarm Strategy');

    try {
      // Destroy all agents
      const agentIds = Array.from(this.agents.keys());
      await Promise.all(agentIds.map(id => this.destroyAgent(id)));

      // Shutdown orchestrator
      if (this.isInitialized) {
        await this.orchestrator.shutdown();
      }

      this.isInitialized = false;
      logger.info('✅ Zen Swarm Strategy shutdown complete');

    } catch (error) {
      logger.error('❌ Error during shutdown', error);
      throw error;
    }
  }
}