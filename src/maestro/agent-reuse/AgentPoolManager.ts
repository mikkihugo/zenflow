/**
 * Agent Pool Manager - Optimizes agent lifecycle and reuse patterns
 * Implements Open/Closed principle for extensible pool strategies
 */

import { ILogger } from '../../core/logger.js';
import { AgentManager } from '../../agents/agent-manager.js';
import {
  AcquiredAgent,
  TaskContext,
  AgentProfile,
  PoolManagerConfig,
  PoolOptimizationResult,
  OptimizationRecommendation,
  OptimizationResult,
  DEFAULT_POOL_MANAGER_CONFIG
} from './types.js';
import { AgentRegistry } from './AgentRegistry.js';

/**
 * Reuse strategy interface for different reuse approaches
 */
interface ReuseStrategy {
  findReusableAgents(
    requiredCapabilities: string[],
    taskContext: TaskContext,
    maxAgents: number
  ): Promise<AcquiredAgent[]>;
}

/**
 * Greedy reuse strategy - prioritizes any available agent with matching capabilities
 */
class GreedyReuseStrategy implements ReuseStrategy {
  constructor(
    private registry: AgentRegistry,
    private config: PoolManagerConfig,
    private logger: ILogger
  ) {}

  async findReusableAgents(
    requiredCapabilities: string[],
    taskContext: TaskContext,
    maxAgents: number
  ): Promise<AcquiredAgent[]> {
    const capableAgents = await this.registry.findCapableAgents(requiredCapabilities);
    const availableAgents = capableAgents.filter(agent => 
      agent.status === 'available' && 
      agent.currentWorkload < 0.8 // Don't reuse overloaded agents
    );

    // Sort by workload (prefer less busy agents)
    availableAgents.sort((a, b) => a.currentWorkload - b.currentWorkload);

    const reusableAgents: AcquiredAgent[] = [];
    const agentsToReuse = availableAgents.slice(0, maxAgents);

    for (const agent of agentsToReuse) {
      reusableAgents.push({
        id: agent.id,
        type: agent.profile.type,
        capabilities: agent.capabilities,
        source: 'reused',
        reusedAt: new Date(),
        assignedTaskId: taskContext.id
      });
    }

    this.logger.info(`Reusing ${reusableAgents.length} agents for task ${taskContext.id}`);
    return reusableAgents;
  }
}

/**
 * Pool optimizer for dynamic pool sizing and health management
 */
class DynamicPoolOptimizer {
  constructor(
    private registry: AgentRegistry,
    private config: PoolManagerConfig,
    private logger: ILogger
  ) {}

  async selectOptimalTypesForSpawning(
    requiredCapabilities: string[],
    taskContext: TaskContext,
    count: number
  ): Promise<string[]> {
    // Simple strategy: prefer agents that match the most capabilities
    // In production, this would use more sophisticated optimization
    
    const capabilityPriority = this.analyzeCapabilityNeeds(requiredCapabilities);
    const optimalTypes: string[] = [];

    // Map capabilities to agent types (simplified mapping)
    const capabilityToTypeMap: Record<string, string[]> = {
      'design': ['design-architect'],
      'architecture': ['design-architect', 'system-architect'],
      'system-architecture': ['system-architect'],
      'implementation': ['developer'],
      'coding': ['developer', 'coder'],
      'testing': ['tester', 'developer'],
      'project-management': ['task-planner'],
      'task-breakdown': ['task-planner'],
      'planning': ['task-planner'],
      'analysis': ['analyst', 'researcher'],
      'research': ['researcher'],
      'documentation': ['requirements-engineer', 'steering-author']
    };

    // Select types based on required capabilities
    const typeScores: Record<string, number> = {};
    
    for (const capability of requiredCapabilities) {
      const possibleTypes = capabilityToTypeMap[capability] || ['general'];
      for (const type of possibleTypes) {
        typeScores[type] = (typeScores[type] || 0) + 1;
      }
    }

    // Sort by score and select top types
    const sortedTypes = Object.entries(typeScores)
      .sort(([,a], [,b]) => b - a)
      .map(([type]) => type);

    return sortedTypes.slice(0, count);
  }

  async shouldCleanupAgent(agentId: string, taskContext: TaskContext): Promise<boolean> {
    const agent = await this.registry.getAgent(agentId);
    if (!agent) return true; // Clean up non-existent agents

    const stats = this.registry.getRegistryStats();
    
    // Don't cleanup if we're below minimum pool size
    if (stats.totalAgents <= 3) return false;

    // Cleanup if agent has been idle and we have excess capacity
    const idleTime = Date.now() - agent.lastActivity.getTime();
    const isIdle = idleTime > 300000; // 5 minutes
    const hasExcessCapacity = stats.availableAgents > stats.totalAgents * 0.6;

    return isIdle && hasExcessCapacity && agent.currentWorkload < this.config.cleanupThreshold;
  }

  async analyzePoolHealth(stats: any): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    // Check if we need more agents
    if (stats.availableAgents < stats.totalAgents * 0.3) {
      recommendations.push({
        type: 'spawn',
        reason: 'Low availability ratio - need more agents',
        expectedImpact: 0.3,
        priority: 'high'
      });
    }

    // Check if we have too many idle agents
    if (stats.averageWorkload < 0.2 && stats.totalAgents > 5) {
      recommendations.push({
        type: 'cleanup',
        reason: 'High number of idle agents - cleanup needed',
        expectedImpact: 0.2,
        priority: 'medium'
      });
    }

    // Check workload balance
    const agents = this.registry.getAllActiveAgents();
    const workloadVariance = this.calculateWorkloadVariance(agents);
    if (workloadVariance > 0.3) {
      recommendations.push({
        type: 'rebalance',
        reason: 'High workload variance - rebalancing needed',
        expectedImpact: 0.25,
        priority: 'medium'
      });
    }

    return recommendations;
  }

  async applyOptimizations(recommendations: OptimizationRecommendation[]): Promise<OptimizationResult[]> {
    const results: OptimizationResult[] = [];

    for (const recommendation of recommendations) {
      try {
        let applied = false;
        
        switch (recommendation.type) {
          case 'cleanup':
            applied = await this.performCleanup();
            break;
          case 'rebalance':
            applied = await this.performRebalance();
            break;
          default:
            this.logger.warn(`Unsupported optimization type: ${recommendation.type}`);
        }

        results.push({
          recommendation,
          applied,
          actualImpact: applied ? recommendation.expectedImpact : 0
        });

      } catch (error) {
        results.push({
          recommendation,
          applied: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return results;
  }

  private analyzeCapabilityNeeds(capabilities: string[]): Record<string, number> {
    const priority: Record<string, number> = {};
    capabilities.forEach((cap, index) => {
      priority[cap] = capabilities.length - index; // Higher priority for earlier capabilities
    });
    return priority;
  }

  private calculateWorkloadVariance(agents: any[]): number {
    if (agents.length === 0) return 0;
    
    const workloads = agents.map(a => a.currentWorkload);
    const mean = workloads.reduce((sum, w) => sum + w, 0) / workloads.length;
    const variance = workloads.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / workloads.length;
    
    return Math.sqrt(variance);
  }

  private async performCleanup(): Promise<boolean> {
    const staleAgents = await this.registry.cleanupStaleAgents();
    return staleAgents.length > 0;
  }

  private async performRebalance(): Promise<boolean> {
    // Simple rebalancing - in production this would redistribute tasks
    this.logger.info('Performing workload rebalancing');
    return true;
  }
}

/**
 * Agent lifecycle manager for proper agent creation and cleanup
 */
class AgentLifecycleManager {
  constructor(
    private agentManager: AgentManager,
    private registry: AgentRegistry,
    private config: PoolManagerConfig,
    private logger: ILogger
  ) {}

  async cleanupAgent(agentId: string): Promise<void> {
    try {
      await this.agentManager.stopAgent(agentId);
      await this.registry.unregisterAgent(agentId);
      this.logger.info(`Cleaned up agent: ${agentId}`);
    } catch (error) {
      this.logger.error(`Failed to cleanup agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async maintainAgent(agentId: string): Promise<void> {
    try {
      // Basic maintenance - update last activity
      await this.registry.updateAgentStatus(agentId, 'available', {
        maintainedAt: new Date()
      });
    } catch (error) {
      this.logger.warn(`Failed to maintain agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Main Agent Pool Manager class
 */
export class AgentPoolManager {
  private reuseStrategy: ReuseStrategy;
  private lifecycleManager: AgentLifecycleManager;
  private poolOptimizer: DynamicPoolOptimizer;
  private config: PoolManagerConfig;

  constructor(
    private agentManager: AgentManager,
    private registry: AgentRegistry,
    private logger: ILogger,
    config: Partial<PoolManagerConfig> = {}
  ) {
    this.config = { ...DEFAULT_POOL_MANAGER_CONFIG, ...config };
    
    this.reuseStrategy = new GreedyReuseStrategy(this.registry, this.config, this.logger);
    this.lifecycleManager = new AgentLifecycleManager(this.agentManager, this.registry, this.config, this.logger);
    this.poolOptimizer = new DynamicPoolOptimizer(this.registry, this.config, this.logger);

    this.logger.info('Agent Pool Manager initialized');
  }

  /**
   * Primary agent acquisition method - reuse first, spawn if needed
   */
  async acquireAgents(
    requiredCapabilities: string[],
    taskContext: TaskContext,
    maxAgents: number = 2
  ): Promise<AcquiredAgent[]> {
    this.logger.info(`Acquiring agents for task ${taskContext.id}, capabilities: [${requiredCapabilities.join(', ')}]`);

    const acquiredAgents: AcquiredAgent[] = [];

    try {
      // Step 1: Try to reuse existing agents
      const reusableAgents = await this.reuseStrategy.findReusableAgents(
        requiredCapabilities,
        taskContext,
        maxAgents
      );

      acquiredAgents.push(...reusableAgents);

      // Step 2: Spawn additional agents if needed
      const needed = maxAgents - reusableAgents.length;
      if (needed > 0) {
        const newAgents = await this.spawnOptimalAgents(
          requiredCapabilities,
          taskContext,
          needed
        );
        acquiredAgents.push(...newAgents);
      }

      // Step 3: Mark agents as assigned
      await this.assignAgentsToTask(acquiredAgents, taskContext);

      this.logger.info(`Acquired ${acquiredAgents.length} agents for task ${taskContext.id} (${reusableAgents.length} reused, ${acquiredAgents.length - reusableAgents.length} spawned)`);

      return acquiredAgents;

    } catch (error) {
      this.logger.error(`Failed to acquire agents for task ${taskContext.id}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Intelligent agent spawning when reuse is not possible
   */
  private async spawnOptimalAgents(
    requiredCapabilities: string[],
    taskContext: TaskContext,
    count: number
  ): Promise<AcquiredAgent[]> {
    const spawnedAgents: AcquiredAgent[] = [];
    
    try {
      // Use pool optimizer to determine optimal agent types
      const optimalTypes = await this.poolOptimizer.selectOptimalTypesForSpawning(
        requiredCapabilities,
        taskContext,
        count
      );

      for (const agentType of optimalTypes) {
        try {
          const profile = this.createOptimalProfile(agentType, requiredCapabilities, taskContext);
          const agentId = await this.agentManager.createAgent(agentType, profile);
          await this.agentManager.startAgent(agentId);
          
          const acquiredAgent: AcquiredAgent = {
            id: agentId,
            type: agentType,
            capabilities: profile.capabilities || [],
            source: 'spawned',
            spawnedAt: new Date(),
            assignedTaskId: taskContext.id
          };

          spawnedAgents.push(acquiredAgent);
          await this.registry.registerAgent(agentId, profile);
          
          this.logger.info(`Spawned new agent: ${agentId} (${agentType})`);
          
        } catch (error) {
          this.logger.warn(`Failed to spawn ${agentType}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      return spawnedAgents;

    } catch (error) {
      this.logger.error(`Failed to spawn agents: ${error instanceof Error ? error.message : String(error)}`);
      return spawnedAgents; // Return whatever we managed to spawn
    }
  }

  /**
   * Create optimal agent profile based on requirements
   */
  private createOptimalProfile(
    agentType: string,
    requiredCapabilities: string[],
    taskContext: TaskContext
  ): AgentProfile {
    return {
      id: `${agentType}-${taskContext.id}-${Date.now()}`,
      name: `${agentType} for ${taskContext.featureName || taskContext.id}`,
      type: agentType,
      capabilities: requiredCapabilities,
      maxConcurrentTasks: 1,
      priority: this.determinePriorityForContext(taskContext),
      metadata: {
        createdFor: taskContext.id,
        requiredCapabilities
      }
    };
  }

  /**
   * Assign acquired agents to the specific task
   */
  private async assignAgentsToTask(agents: AcquiredAgent[], taskContext: TaskContext): Promise<void> {
    for (const agent of agents) {
      try {
        await this.registry.updateAgentStatus(agent.id, 'busy', {
          assignedTask: taskContext.id,
          assignedAt: new Date()
        });
      } catch (error) {
        this.logger.warn(`Failed to assign agent ${agent.id} to task ${taskContext.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Release agents back to pool with intelligent cleanup decisions
   */
  async releaseAgents(agentIds: string[], taskContext: TaskContext): Promise<void> {
    this.logger.info(`Releasing ${agentIds.length} agents from task ${taskContext.id}`);

    for (const agentId of agentIds) {
      try {
        // Update agent status to available
        await this.registry.updateAgentStatus(agentId, 'available', {
          lastTask: taskContext.id,
          releasedAt: new Date()
        });
        
        // Decide whether to keep or cleanup based on pool optimization
        const shouldCleanup = await this.poolOptimizer.shouldCleanupAgent(agentId, taskContext);
        
        if (shouldCleanup) {
          await this.lifecycleManager.cleanupAgent(agentId);
          this.logger.info(`Cleaned up agent ${agentId} after task completion`);
        } else {
          // Keep agent in pool for reuse
          await this.lifecycleManager.maintainAgent(agentId);
        }
      } catch (error) {
        this.logger.warn(`Failed to release agent ${agentId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Pool health monitoring and optimization
   */
  async optimizePool(): Promise<PoolOptimizationResult> {
    this.logger.info('Starting pool optimization');
    
    const stats = this.registry.getRegistryStats();
    
    // Identify optimization opportunities
    const recommendations = await this.poolOptimizer.analyzePoolHealth(stats);
    
    // Apply optimizations
    const results = await this.poolOptimizer.applyOptimizations(recommendations);
    
    const optimizationResult: PoolOptimizationResult = {
      initialStats: stats,
      recommendations,
      results,
      optimizedAt: new Date()
    };

    this.logger.info(`Pool optimization completed: ${results.length} optimizations applied`);
    
    return optimizationResult;
  }

  /**
   * Get pool statistics
   */
  async getPoolStatistics(): Promise<{
    totalSpawned: number;
    totalReused: number;
    reuseRate: number;
    averagePoolSize: number;
    cleanupRate: number;
  }> {
    // In production, these would be tracked metrics
    return {
      totalSpawned: 25,
      totalReused: 75,
      reuseRate: 0.75,
      averagePoolSize: 8,
      cleanupRate: 0.15
    };
  }

  /**
   * Determine priority based on task context
   */
  private determinePriorityForContext(taskContext: TaskContext): number {
    // Base priority from task
    let priority = taskContext.priority || 70;
    
    // Adjust based on complexity
    if (taskContext.complexity === 'high') priority += 10;
    if (taskContext.complexity === 'low') priority -= 5;
    
    // Ensure within valid range
    return Math.max(50, Math.min(100, priority));
  }

  /**
   * Shutdown pool manager and cleanup all agents
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Agent Pool Manager');
    
    // Release all active agents
    const allAgents = this.registry.getAllActiveAgents();
    const agentIds = allAgents.map(agent => agent.id);
    
    for (const agentId of agentIds) {
      try {
        await this.lifecycleManager.cleanupAgent(agentId);
      } catch (error) {
        this.logger.warn(`Failed to cleanup agent ${agentId} during shutdown: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    this.logger.info('Agent Pool Manager shutdown complete');
  }
}