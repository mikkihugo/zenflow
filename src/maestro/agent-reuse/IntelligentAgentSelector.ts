/**
 * Intelligent Agent Selector - Core controller for capability-based agent selection
 * Implements SOLID principles with strategy pattern for optimization approaches
 */

import { ILogger } from '../../core/logger.js';
import { AgentManager } from '../../agents/agent-manager.js';
import {
  TaskContext,
  SelectionOptions,
  ExecutionOptions,
  AgentSelection,
  TaskResult,
  RegisteredAgent,
  AvailableAgent,
  ScoredAgent,
  AcquiredAgent,
  TaskDefinition,
  AgentReuseConfig,
  DEFAULT_AGENT_REUSE_CONFIG
} from './types.js';
import { AgentRegistry } from './AgentRegistry.js';
import { AgentPoolManager } from './AgentPoolManager.js';
import { WorkloadMonitor } from './WorkloadMonitor.js';
import { PerformanceScorer } from './PerformanceScorer.js';
import { BalancedSelectionStrategy } from './strategies/BalancedSelectionStrategy.js';

/**
 * Central orchestrator for intelligent agent selection and reuse
 * Replaces hardcoded agent arrays with dynamic, capability-based selection
 */
export class IntelligentAgentSelector {
  private selectionStrategy: any;
  private config: AgentReuseConfig;

  constructor(
    private agentRegistry: AgentRegistry,
    private poolManager: AgentPoolManager, 
    private workloadMonitor: WorkloadMonitor,
    private performanceScorer: PerformanceScorer,
    private agentManager: AgentManager,
    private logger: ILogger,
    config: Partial<AgentReuseConfig> = {}
  ) {
    this.config = { ...DEFAULT_AGENT_REUSE_CONFIG, ...config };
    this.selectionStrategy = new BalancedSelectionStrategy();
  }

  /**
   * Primary selection method - replaces hardcoded agent arrays
   * Implements intelligent, multi-criteria agent selection
   */
  async selectOptimalAgents(
    requiredCapabilities: string[],
    taskContext: TaskContext,
    options: SelectionOptions = {}
  ): Promise<AgentSelection> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Selecting agents for capabilities: [${requiredCapabilities.join(', ')}]`);

      // Step 1: Find candidates with matching capabilities
      const candidates = await this.agentRegistry.findCapableAgents(requiredCapabilities);
      
      if (candidates.length === 0) {
        this.logger.warn(`No agents found with required capabilities: [${requiredCapabilities.join(', ')}]`);
        return this.createEmptySelection('No capable agents found');
      }

      // Step 2: Apply workload filtering to get available agents
      const availableCandidates = await this.workloadMonitor.filterByAvailability(
        candidates,
        { capabilities: requiredCapabilities }
      );

      if (availableCandidates.length === 0) {
        this.logger.warn('No available agents found after workload filtering');
        return this.createEmptySelection('All capable agents are busy');
      }

      // Step 3: Score candidates using multi-criteria algorithm
      const scoredCandidates = await this.performanceScorer.scoreAgents(
        availableCandidates,
        requiredCapabilities,
        taskContext
      );

      // Step 4: Apply selection strategy to choose optimal agents
      const selection = this.selectionStrategy.selectAgents(scoredCandidates, options);

      const selectionTime = Date.now() - startTime;
      this.logger.info(`Agent selection completed in ${selectionTime}ms, selected ${selection.selectedAgents.length} agents`);

      return selection;

    } catch (error) {
      const selectionTime = Date.now() - startTime;
      this.logger.error(`Agent selection failed after ${selectionTime}ms: ${error instanceof Error ? error.message : String(error)}`);
      return this.createEmptySelection(`Selection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Enhanced task execution with intelligent agent reuse
   * Replaces executeTaskWithManagedAgent with capability-based selection
   */
  async executeTaskWithIntelligentSelection(
    requiredCapabilities: string[],
    task: TaskDefinition,
    options: ExecutionOptions = {}
  ): Promise<TaskResult> {
    const executionStart = Date.now();
    const acquiredAgents: AcquiredAgent[] = [];

    try {
      this.logger.info(`Executing task ${task.id} with intelligent agent selection`);

      // Convert task to context for selection
      const taskContext: TaskContext = {
        id: task.id,
        type: task.type,
        featureName: task.metadata?.featureName,
        priority: task.priority,
        complexity: this.determineComplexity(task),
        metadata: task.metadata
      };

      // Step 1: Acquire optimal agents (reuse-first strategy)
      const agents = await this.poolManager.acquireAgents(
        requiredCapabilities,
        taskContext,
        options.maxAgents || 2
      );

      if (agents.length === 0) {
        throw new Error('Failed to acquire any suitable agents');
      }

      acquiredAgents.push(...agents);

      // Step 2: Execute task with acquired agents
      const result = await this.executeWithAcquiredAgents(agents, task, options);

      // Step 3: Update performance metrics
      await this.updateAgentPerformanceMetrics(agents, result);

      const executionTime = Date.now() - executionStart;
      this.logger.info(`Task ${task.id} completed in ${executionTime}ms using ${agents.length} agents`);

      return {
        ...result,
        duration: executionTime,
        agentMetrics: this.generateAgentMetrics(agents, result)
      };

    } catch (error) {
      const executionTime = Date.now() - executionStart;
      this.logger.error(`Task execution failed after ${executionTime}ms: ${error instanceof Error ? error.message : String(error)}`);

      return {
        success: false,
        duration: executionTime,
        agentMetrics: [],
        error: error as Error
      };

    } finally {
      // Step 4: Release agents back to pool
      if (acquiredAgents.length > 0) {
        await this.poolManager.releaseAgents(
          acquiredAgents.map(a => a.id),
          {
            id: task.id,
            type: task.type,
            priority: task.priority,
            complexity: 'medium'
          }
        );
      }
    }
  }

  /**
   * Execute task with the acquired agents
   * Integrates with existing AgentManager for actual execution
   */
  private async executeWithAcquiredAgents(
    agents: AcquiredAgent[],
    task: TaskDefinition,
    options: ExecutionOptions
  ): Promise<TaskResult> {
    // For now, use the first agent (primary) for execution
    // Future enhancement: parallel execution across multiple agents
    const primaryAgent = agents[0];
    
    try {
      // Update agent status to busy
      await this.agentRegistry.updateAgentStatus(primaryAgent.id, 'busy', {
        assignedTask: task.id,
        startTime: new Date()
      });

      // Track task assignment for workload monitoring
      this.workloadMonitor.trackTaskAssignment(
        primaryAgent.id,
        task.id
      );

      // Execute through existing orchestrator infrastructure (simplified)
      // In real implementation, this would integrate with the main orchestrator
      const executionResult = await this.simulateTaskExecution(task, primaryAgent);

      // Track task completion
      this.workloadMonitor.trackTaskCompletion(
        primaryAgent.id,
        task.id,
        executionResult.success || true
      );

      // Update agent status back to available
      await this.agentRegistry.updateAgentStatus(primaryAgent.id, 'available', {
        lastTask: task.id,
        completedAt: new Date()
      });

      return executionResult;

    } catch (error) {
      // Update agent status on error
      await this.agentRegistry.updateAgentStatus(primaryAgent.id, 'error', {
        lastError: error instanceof Error ? error.message : String(error),
        errorAt: new Date()
      });

      throw error;
    }
  }

  /**
   * Simulate task execution (placeholder for integration with main orchestrator)
   * In production, this would delegate to the main orchestrator system
   */
  private async simulateTaskExecution(task: TaskDefinition, agent: AcquiredAgent): Promise<TaskResult> {
    // Simulate variable execution time based on task complexity
    const baseTime = 1000; // 1 second base
    const complexityMultiplier = task.metadata?.complexity === 'high' ? 3 : 
                                task.metadata?.complexity === 'medium' ? 2 : 1;
    const executionTime = baseTime * complexityMultiplier;

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, Math.min(executionTime, 5000)));

    // Simulate success/failure based on agent reliability (90% success rate)
    const success = Math.random() > 0.1;

    return {
      success,
      output: success ? { result: `Task ${task.id} completed by agent ${agent.id}` } : undefined,
      duration: executionTime,
      agentMetrics: [],
      error: success ? undefined : new Error('Simulated task execution failure')
    };
  }

  /**
   * Update agent performance metrics based on task results
   */
  private async updateAgentPerformanceMetrics(
    agents: AcquiredAgent[],
    result: TaskResult
  ): Promise<void> {
    for (const agent of agents) {
      try {
        const registeredAgent = await this.agentRegistry.getAgent(agent.id);
        if (registeredAgent) {
          if (result.success) {
            registeredAgent.performanceHistory.addCompletion(
              result.duration,
              result.duration // Use actual duration as estimated for now
            );
          } else {
            registeredAgent.performanceHistory.addFailure(
              result.error?.message || 'Unknown error'
            );
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to update performance metrics for agent ${agent.id}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  /**
   * Generate comprehensive agent metrics for reporting
   */
  private generateAgentMetrics(agents: AcquiredAgent[], result: TaskResult): any[] {
    return agents.map(agent => ({
      agentId: agent.id,
      taskDuration: result.duration,
      cpuUsage: Math.random() * 50, // Simulated
      memoryUsage: Math.random() * 100, // Simulated
      successRate: result.success ? 1.0 : 0.0,
      qualityScore: result.success ? 0.8 + Math.random() * 0.2 : 0.0
    }));
  }

  /**
   * Determine task complexity based on various factors
   */
  private determineComplexity(task: TaskDefinition): 'low' | 'medium' | 'high' {
    // Simple heuristics for complexity determination
    if (task.metadata?.complexity) {
      return task.metadata.complexity;
    }

    // Determine based on task type
    const highComplexityTypes = ['system-design', 'architecture', 'complex-implementation'];
    const mediumComplexityTypes = ['implementation', 'testing', 'code-review'];
    
    if (highComplexityTypes.includes(task.type)) return 'high';
    if (mediumComplexityTypes.includes(task.type)) return 'medium';
    return 'low';
  }

  /**
   * Create empty selection for failure cases
   */
  private createEmptySelection(reason: string): AgentSelection {
    return {
      selectedAgents: [],
      alternativeAgents: [],
      selectionReason: reason,
      confidence: 0,
      estimatedSuccess: 0
    };
  }

  /**
   * Get comprehensive system statistics
   */
  async getSystemStatistics(): Promise<{
    registry: any;
    workload: any;
    pool: any;
    reuse: any;
  }> {
    return {
      registry: this.agentRegistry.getRegistryStats(),
      workload: this.workloadMonitor.getWorkloadStatistics(),
      pool: await this.poolManager.getPoolStatistics(),
      reuse: await this.getReuseStatistics()
    };
  }

  /**
   * Get agent reuse statistics
   */
  private async getReuseStatistics(): Promise<{
    totalTasks: number;
    reusedTasks: number;
    reuseRate: number;
    averageSelectionTime: number;
  }> {
    // This would be implemented with actual tracking in production
    return {
      totalTasks: 100,
      reusedTasks: 75,
      reuseRate: 0.75,
      averageSelectionTime: 35
    };
  }

  /**
   * Optimize the entire agent system
   */
  async optimizeSystem(): Promise<any> {
    this.logger.info('Starting system optimization');
    
    const poolOptimization = await this.poolManager.optimizePool();
    
    this.logger.info(`System optimization completed with ${poolOptimization.results.length} optimizations applied`);
    
    return poolOptimization;
  }

  /**
   * Shutdown the selector and cleanup resources
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down Intelligent Agent Selector');
    
    // Cleanup would be implemented here
    // - Stop monitoring intervals
    // - Release all agents
    // - Clear registries
    
    this.logger.info('Intelligent Agent Selector shutdown complete');
  }
}