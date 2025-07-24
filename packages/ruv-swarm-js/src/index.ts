/**
 * @fileoverview JavaScript bindings for ruv-swarm neural coordination engine
 * @module ruv-swarm-js
 */

import { RuvSwarm, Swarm, Agent, NeuralAgent } from 'ruv-swarm';
import { SwarmConfig, AgentConfig, TaskConfig } from '@shared/types';
import { Logger } from '@shared/utils';

export class RuvSwarmBridge {
  private ruvSwarm: any;
  private swarms: Map<string, any> = new Map();
  private logger: Logger;

  constructor(config: SwarmConfig = {}) {
    this.logger = new Logger('RuvSwarmBridge');
    this.initializeRuvSwarm(config);
  }

  /**
   * Initialize the ruv-swarm engine
   */
  private async initializeRuvSwarm(config: SwarmConfig) {
    try {
      this.ruvSwarm = new RuvSwarm();
      this.logger.info('✅ ruv-swarm engine initialized');
    } catch (error) {
      this.logger.error('❌ Failed to initialize ruv-swarm:', error);
      throw error;
    }
  }

  /**
   * Create a new swarm for service coordination
   */
  async createSwarm(serviceName: string, config: SwarmConfig = {}): Promise<string> {
    try {
      const swarmConfig = {
        name: serviceName,
        maxAgents: config.maxAgents || 8,
        topology: config.topology || 'hierarchical',
        cognitive_diversity: config.cognitive_diversity !== false,
        neural_networks: config.neural_networks !== false,
        persistence: {
          enabled: true,
          database: `./swarms/${serviceName}.db`,
          type: 'sqlite'
        },
        ...config
      };

      const swarm = await this.ruvSwarm.createSwarm(swarmConfig);
      const swarmId = `swarm-${serviceName}-${Date.now()}`;
      
      this.swarms.set(swarmId, swarm);
      
      this.logger.info(`🐝 Created swarm: ${swarmId} for service: ${serviceName}`);
      return swarmId;
      
    } catch (error) {
      this.logger.error(`❌ Failed to create swarm for ${serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Spawn an agent in a swarm
   */
  async spawnAgent(swarmId: string, agentConfig: AgentConfig): Promise<string> {
    const swarm = this.swarms.get(swarmId);
    if (!swarm) {
      throw new Error(`Swarm not found: ${swarmId}`);
    }

    try {
      const agent = await swarm.spawn(agentConfig.type, {
        name: agentConfig.name || `${agentConfig.type}-agent`,
        capabilities: agentConfig.capabilities || [],
        cognitive_pattern: agentConfig.cognitive_pattern || 'adaptive'
      });

      const agentId = `agent-${agentConfig.name || agentConfig.type}-${Date.now()}`;
      
      this.logger.info(`🤖 Spawned agent: ${agentId} in swarm: ${swarmId}`);
      return agentId;
      
    } catch (error) {
      this.logger.error(`❌ Failed to spawn agent in ${swarmId}:`, error);
      throw error;
    }
  }

  /**
   * Orchestrate a task across a swarm
   */
  async orchestrateTask(swarmId: string, task: TaskConfig): Promise<any> {
    const swarm = this.swarms.get(swarmId);
    if (!swarm) {
      throw new Error(`Swarm not found: ${swarmId}`);
    }

    try {
      this.logger.info(`🎯 Orchestrating task: ${task.description} in swarm: ${swarmId}`);
      
      const result = await swarm.orchestrate({
        task: task.description,
        strategy: task.strategy || 'parallel',
        priority: task.priority || 'medium',
        maxAgents: task.maxAgents || 5,
        timeout: task.timeout || 300000 // 5 minutes
      });

      this.logger.info(`✅ Task orchestrated: ${result.taskId}`);
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Task orchestration failed:`, error);
      throw error;
    }
  }

  /**
   * Get swarm status and metrics
   */
  async getSwarmStatus(swarmId: string): Promise<any> {
    const swarm = this.swarms.get(swarmId);
    if (!swarm) {
      throw new Error(`Swarm not found: ${swarmId}`);
    }

    try {
      const status = await swarm.getStatus();
      
      return {
        id: swarmId,
        name: status.name,
        topology: status.topology,
        agents: status.agents || [],
        tasks: status.tasks || {},
        performance: status.performance || {},
        neural_status: status.neural_status || {},
        memory_usage: status.memory_usage || {},
        last_updated: new Date().toISOString()
      };
      
    } catch (error) {
      this.logger.error(`❌ Failed to get swarm status:`, error);
      throw error;
    }
  }

  /**
   * Enable inter-swarm communication
   */
  async connectSwarms(swarmId1: string, swarmId2: string): Promise<void> {
    const swarm1 = this.swarms.get(swarmId1);
    const swarm2 = this.swarms.get(swarmId2);
    
    if (!swarm1 || !swarm2) {
      throw new Error('One or both swarms not found');
    }

    try {
      // Enable inter-swarm communication via ruv-swarm's built-in networking
      await swarm1.connect(swarm2);
      
      this.logger.info(`🔗 Connected swarms: ${swarmId1} ↔ ${swarmId2}`);
      
    } catch (error) {
      this.logger.error(`❌ Failed to connect swarms:`, error);
      throw error;
    }
  }

  /**
   * Train neural patterns from swarm data
   */
  async trainNeuralPatterns(swarmId: string, options: any = {}): Promise<any> {
    const swarm = this.swarms.get(swarmId);
    if (!swarm) {
      throw new Error(`Swarm not found: ${swarmId}`);
    }

    try {
      this.logger.info(`🧠 Training neural patterns for swarm: ${swarmId}`);
      
      const result = await swarm.neural.train({
        iterations: options.iterations || 10,
        data: options.data || 'recent',
        learning_rate: options.learning_rate || 0.01
      });

      this.logger.info(`✅ Neural training completed: ${result.improvement}% improvement`);
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Neural training failed:`, error);
      throw error;
    }
  }

  /**
   * Get performance benchmarks
   */
  async benchmark(swarmId: string, options: any = {}): Promise<any> {
    const swarm = this.swarms.get(swarmId);
    if (!swarm) {
      throw new Error(`Swarm not found: ${swarmId}`);
    }

    try {
      this.logger.info(`📊 Running benchmark for swarm: ${swarmId}`);
      
      const benchmark = await swarm.benchmark({
        type: options.type || 'coordination',
        iterations: options.iterations || 10,
        metrics: options.metrics || ['latency', 'throughput', 'accuracy']
      });

      this.logger.info(`✅ Benchmark completed: ${benchmark.score} score`);
      return benchmark;
      
    } catch (error) {
      this.logger.error(`❌ Benchmark failed:`, error);
      throw error;
    }
  }

  /**
   * List all active swarms
   */
  listSwarms(): Array<{id: string, name: string}> {
    return Array.from(this.swarms.entries()).map(([id, swarm]) => ({
      id,
      name: swarm.getName ? swarm.getName() : id
    }));
  }

  /**
   * Cleanup and close all swarms
   */
  async cleanup(): Promise<void> {
    this.logger.info('🧹 Cleaning up ruv-swarm bridge...');
    
    for (const [swarmId, swarm] of this.swarms) {
      try {
        if (swarm.close) {
          await swarm.close();
        }
      } catch (error) {
        this.logger.warn(`⚠️ Error closing swarm ${swarmId}:`, error);
      }
    }
    
    this.swarms.clear();
    this.logger.info('✅ ruv-swarm bridge cleanup completed');
  }
}

// Export the main bridge class and re-export ruv-swarm types
export default RuvSwarmBridge;
export { RuvSwarm, Swarm, Agent, NeuralAgent };

// Export convenience functions
export async function createServiceSwarm(serviceName: string, config?: SwarmConfig): Promise<RuvSwarmBridge> {
  const bridge = new RuvSwarmBridge(config);
  await bridge.createSwarm(serviceName, config);
  return bridge;
}

export async function orchestrateAcrossServices(
  services: string[], 
  task: string, 
  config?: SwarmConfig
): Promise<any[]> {
  const bridge = new RuvSwarmBridge(config);
  const results = [];
  
  for (const service of services) {
    const swarmId = await bridge.createSwarm(service, config);
    const result = await bridge.orchestrateTask(swarmId, {
      description: task,
      strategy: 'parallel'
    });
    results.push({ service, swarmId, result });
  }
  
  return results;
}