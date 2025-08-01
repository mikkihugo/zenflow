/**
 * SwarmOrchestrator - Core orchestration engine for swarm coordination
 * Handles agent lifecycle, task distribution, and resource optimization
 */

import { EventEmitter } from 'events';

// Removed ruv-FANN-zen submodule dependency - using direct integration
// import { daaService, DAAService } from '../ruv-FANN-zen/ruv-swarm-zen/npm/src/daa-service.js';

// Mock DAA service for direct integration
interface DAAService {
  initialize(): Promise<void>;
  createAgent(config: any): Promise<any>;
  destroyAgent(id: string): Promise<void>;
  createWorkflow(id: string, steps: any[], config: any): Promise<void>;
  executeWorkflow(id: string, config: any): Promise<any>;
  cleanup(): Promise<void>;
  on(event: string, handler: (data: any) => void): void;
}

const mockDAAService: DAAService = {
  async initialize() {
    console.log('DAA Service initialized (mock)');
  },
  async createAgent(config: any) {
    return { id: config.id, ...config };
  },
  async destroyAgent(id: string) {
    console.log(`DAA Agent destroyed: ${id}`);
  },
  async createWorkflow(id: string, steps: any[], config: any) {
    console.log(`Workflow created: ${id}`);
  },
  async executeWorkflow(id: string, config: any) {
    return { success: true, result: 'Mock execution result' };
  },
  async cleanup() {
    console.log('DAA Service cleaned up');
  },
  on(event: string, handler: (data: any) => void) {
    console.log(`Event listener added: ${event}`);
  },
};

const daaService = mockDAAService;

// Types for orchestration
interface SwarmConfig {
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  maxAgents: number;
  autoScale: boolean;
  loadBalancing: 'round-robin' | 'least-loaded' | 'capability-based';
  failureHandling: 'retry' | 'redistribute' | 'isolate';
}

interface OrchestrationTask {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requirements: {
    capabilities: string[];
    minAgents: number;
    maxAgents: number;
    timeout?: number;
  };
  dependencies: string[];
  status: 'queued' | 'assigned' | 'executing' | 'completed' | 'failed';
  assignedAgents: string[];
  progress: number;
  result?: any;
  error?: Error;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

interface AgentCapabilities {
  id: string;
  capabilities: string[];
  currentLoad: number;
  maxLoad: number;
  status: 'available' | 'busy' | 'maintenance' | 'error';
  performanceScore: number;
  cognitivePattern: string;
}

interface OrchestrationMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  agentUtilization: Map<string, number>;
  throughput: number;
  errorRate: number;
  resourceEfficiency: number;
}

export class SwarmOrchestrator extends EventEmitter {
  private config: SwarmConfig;
  private agents: Map<string, AgentCapabilities> = new Map();
  private tasks: Map<string, OrchestrationTask> = new Map();
  private taskQueue: OrchestrationTask[] = [];
  private metrics: OrchestrationMetrics;
  private isInitialized = false;
  private orchestrationInterval?: NodeJS.Timeout;
  private daaService: DAAService;

  constructor(config: Partial<SwarmConfig> = {}) {
    super();

    this.config = {
      topology: config.topology || 'mesh',
      maxAgents: config.maxAgents || 50,
      autoScale: config.autoScale ?? true,
      loadBalancing: config.loadBalancing || 'capability-based',
      failureHandling: config.failureHandling || 'retry',
    };

    this.metrics = {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      averageExecutionTime: 0,
      agentUtilization: new Map(),
      throughput: 0,
      errorRate: 0,
      resourceEfficiency: 0,
    };

    this.daaService = daaService;
  }

  /**
   * Initialize the swarm orchestrator
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('SwarmOrchestrator already initialized');
    }

    try {
      // Initialize DAA service
      await this.daaService.initialize();

      // Set up event listeners
      this.setupEventListeners();

      // Start orchestration loop
      this.startOrchestrationLoop();

      this.isInitialized = true;
      this.emit('initialized', { config: this.config });

      console.log('🎯 SwarmOrchestrator initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize SwarmOrchestrator:', error);
      throw error;
    }
  }

  /**
   * Register a new agent with the orchestrator
   */
  async registerAgent(agentConfig: {
    id: string;
    capabilities: string[];
    cognitivePattern?: string;
    maxLoad?: number;
  }): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }

    try {
      // Create agent through DAA service
      const agent = await this.daaService.createAgent({
        id: agentConfig.id,
        capabilities: agentConfig.capabilities,
        cognitivePattern: agentConfig.cognitivePattern || 'adaptive',
      });

      // Register with orchestrator
      this.agents.set(agentConfig.id, {
        id: agentConfig.id,
        capabilities: agentConfig.capabilities,
        currentLoad: 0,
        maxLoad: agentConfig.maxLoad || 10,
        status: 'available',
        performanceScore: 1.0,
        cognitivePattern: agentConfig.cognitivePattern || 'adaptive',
      });

      this.emit('agentRegistered', {
        agentId: agentConfig.id,
        capabilities: agentConfig.capabilities,
      });
      console.log(`🤖 Agent registered: ${agentConfig.id}`);

      // Trigger task assignment check
      this.processTaskQueue();

      return agentConfig.id;
    } catch (error) {
      console.error(`❌ Failed to register agent ${agentConfig.id}:`, error);
      throw error;
    }
  }

  /**
   * Submit a task to the orchestrator
   */
  async submitTask(taskSpec: {
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    requirements?: {
      capabilities?: string[];
      minAgents?: number;
      maxAgents?: number;
      timeout?: number;
    };
    dependencies?: string[];
  }): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Orchestrator not initialized');
    }

    const task: OrchestrationTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: taskSpec.description,
      priority: taskSpec.priority || 'medium',
      requirements: {
        capabilities: taskSpec.requirements?.capabilities || ['general'],
        minAgents: taskSpec.requirements?.minAgents || 1,
        maxAgents: taskSpec.requirements?.maxAgents || 3,
        timeout: taskSpec.requirements?.timeout || 30000,
      },
      dependencies: taskSpec.dependencies || [],
      status: 'queued',
      assignedAgents: [],
      progress: 0,
      createdAt: new Date(),
    };

    this.tasks.set(task.id, task);
    this.taskQueue.push(task);
    this.metrics.totalTasks++;

    // Sort queue by priority
    this.sortTaskQueue();

    this.emit('taskSubmitted', { taskId: task.id, description: task.description });
    console.log(`📋 Task submitted: ${task.id} - "${task.description}"`);

    // Trigger immediate processing
    this.processTaskQueue();

    return task.id;
  }

  /**
   * Get orchestrator status
   */
  getStatus(): {
    isInitialized: boolean;
    config: SwarmConfig;
    agents: {
      total: number;
      available: number;
      busy: number;
      error: number;
    };
    tasks: {
      total: number;
      queued: number;
      executing: number;
      completed: number;
      failed: number;
    };
    metrics: OrchestrationMetrics;
  } {
    const agentStats = Array.from(this.agents.values()).reduce(
      (acc, agent) => {
        acc.total++;
        acc[agent.status]++;
        return acc;
      },
      { total: 0, available: 0, busy: 0, maintenance: 0, error: 0 }
    );

    const taskStats = Array.from(this.tasks.values()).reduce(
      (acc, task) => {
        acc.total++;
        acc[task.status === 'assigned' ? 'executing' : task.status]++;
        return acc;
      },
      { total: 0, queued: 0, executing: 0, completed: 0, failed: 0 }
    );

    return {
      isInitialized: this.isInitialized,
      config: this.config,
      agents: agentStats,
      tasks: taskStats,
      metrics: this.metrics,
    };
  }

  /**
   * Get task details
   */
  getTask(taskId: string): OrchestrationTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get agent details
   */
  getAgent(agentId: string): AgentCapabilities | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Stop a running task
   */
  async stopTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return false;
    }

    if (task.status === 'executing' || task.status === 'assigned') {
      task.status = 'failed';
      task.error = new Error('Task stopped by user');
      task.completedAt = new Date();

      // Release assigned agents
      for (const agentId of task.assignedAgents) {
        const agent = this.agents.get(agentId);
        if (agent) {
          agent.currentLoad--;
          if (agent.currentLoad <= 0) {
            agent.status = 'available';
          }
        }
      }

      this.emit('taskStopped', { taskId });
      return true;
    }

    return false;
  }

  /**
   * Remove an agent from the orchestrator
   */
  async removeAgent(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    // Can't remove busy agents
    if (agent.status === 'busy') {
      throw new Error(`Cannot remove busy agent: ${agentId}`);
    }

    try {
      // Remove from DAA service
      await this.daaService.destroyAgent(agentId);

      // Remove from orchestrator
      this.agents.delete(agentId);

      this.emit('agentRemoved', { agentId });
      console.log(`🗑️ Agent removed: ${agentId}`);

      return true;
    } catch (error) {
      console.error(`❌ Failed to remove agent ${agentId}:`, error);
      return false;
    }
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    console.log('🛑 Shutting down SwarmOrchestrator...');

    // Stop orchestration loop
    if (this.orchestrationInterval) {
      clearInterval(this.orchestrationInterval);
    }

    // Cancel all running tasks
    for (const [taskId, task] of this.tasks) {
      if (task.status === 'executing' || task.status === 'assigned') {
        await this.stopTask(taskId);
      }
    }

    // Remove all agents
    for (const agentId of this.agents.keys()) {
      try {
        await this.removeAgent(agentId);
      } catch (error) {
        console.warn(`Warning: Failed to remove agent ${agentId} during shutdown`);
      }
    }

    // Cleanup DAA service
    await this.daaService.cleanup();

    this.isInitialized = false;
    this.emit('shutdown');

    console.log('✅ SwarmOrchestrator shutdown complete');
  }

  /**
   * Private methods
   */

  private setupEventListeners(): void {
    // Listen to DAA service events
    this.daaService.on('agentCreated', (event) => {
      console.log(`👂 DAA Agent created: ${event.agentId}`);
    });

    this.daaService.on('decisionMade', (event) => {
      console.log(`🧠 Decision made by ${event.agentId} (${event.latency.toFixed(2)}ms)`);
    });

    this.daaService.on('workflowStepCompleted', (event) => {
      this.handleWorkflowStepCompleted(event);
    });
  }

  private startOrchestrationLoop(): void {
    this.orchestrationInterval = setInterval(() => {
      this.processTaskQueue();
      this.updateMetrics();
      this.optimizeResources();
    }, 2000); // Run every 2 seconds
  }

  private processTaskQueue(): void {
    if (this.taskQueue.length === 0) {
      return;
    }

    // Process tasks in priority order
    for (let i = 0; i < this.taskQueue.length; i++) {
      const task = this.taskQueue[i];

      if (task.status !== 'queued') {
        continue;
      }

      // Check dependencies
      if (!this.areDependenciesMet(task)) {
        continue;
      }

      // Find suitable agents
      const suitableAgents = this.findSuitableAgents(task);

      if (suitableAgents.length >= task.requirements.minAgents) {
        this.assignTask(task, suitableAgents);
        this.taskQueue.splice(i, 1);
        i--; // Adjust index after removal
      }
    }
  }

  private areDependenciesMet(task: OrchestrationTask): boolean {
    return task.dependencies.every((depId) => {
      const depTask = this.tasks.get(depId);
      return depTask && depTask.status === 'completed';
    });
  }

  private findSuitableAgents(task: OrchestrationTask): AgentCapabilities[] {
    const candidates = Array.from(this.agents.values())
      .filter((agent) => {
        // Must be available
        if (agent.status !== 'available') return false;

        // Must have required capabilities
        return task.requirements.capabilities.every(
          (cap) => agent.capabilities.includes(cap) || agent.capabilities.includes('general')
        );
      })
      .sort((a, b) => {
        // Sort by load balancing strategy
        switch (this.config.loadBalancing) {
          case 'round-robin':
            return 0; // Keep original order
          case 'least-loaded':
            return a.currentLoad - b.currentLoad;
          case 'capability-based':
            return b.performanceScore - a.performanceScore;
          default:
            return 0;
        }
      });

    return candidates.slice(0, task.requirements.maxAgents);
  }

  private async assignTask(task: OrchestrationTask, agents: AgentCapabilities[]): Promise<void> {
    try {
      task.status = 'assigned';
      task.assignedAgents = agents.map((a) => a.id);
      task.startedAt = new Date();

      // Update agent status
      for (const agent of agents) {
        agent.currentLoad++;
        agent.status = 'busy';
      }

      console.log(`🎯 Task assigned: ${task.id} to agents: ${task.assignedAgents.join(', ')}`);

      this.emit('taskAssigned', {
        taskId: task.id,
        agentIds: task.assignedAgents,
      });

      // Create workflow in DAA service
      const workflowSteps = [
        {
          id: 'main-execution',
          task: {
            method: 'make_decision',
            args: [
              {
                description: task.description,
                requirements: task.requirements,
              },
            ],
          },
        },
      ];

      await this.daaService.createWorkflow(task.id, workflowSteps, {});

      // Execute the workflow
      const result = await this.daaService.executeWorkflow(task.id, {
        agentIds: task.assignedAgents,
        parallel: agents.length > 1,
      });

      // Handle completion
      await this.handleTaskCompletion(task, result);
    } catch (error) {
      console.error(`❌ Failed to assign task ${task.id}:`, error);
      await this.handleTaskFailure(task, error as Error);
    }
  }

  private async handleWorkflowStepCompleted(event: any): Promise<void> {
    const task = this.tasks.get(event.workflowId);
    if (!task) return;

    task.progress = 100; // Simple progress calculation
    this.emit('taskProgress', { taskId: task.id, progress: task.progress });
  }

  private async handleTaskCompletion(task: OrchestrationTask, result: any): Promise<void> {
    task.status = 'completed';
    task.result = result;
    task.completedAt = new Date();
    task.progress = 100;

    // Release agents
    for (const agentId of task.assignedAgents) {
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.currentLoad--;
        if (agent.currentLoad <= 0) {
          agent.status = 'available';
        }
        // Update performance score
        agent.performanceScore = Math.min(agent.performanceScore * 1.1, 2.0);
      }
    }

    this.metrics.completedTasks++;

    this.emit('taskCompleted', {
      taskId: task.id,
      result: result,
      executionTime: task.completedAt.getTime() - task.startedAt!.getTime(),
    });

    console.log(`✅ Task completed: ${task.id}`);
  }

  private async handleTaskFailure(task: OrchestrationTask, error: Error): Promise<void> {
    task.status = 'failed';
    task.error = error;
    task.completedAt = new Date();

    // Release agents and penalize performance
    for (const agentId of task.assignedAgents) {
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.currentLoad--;
        if (agent.currentLoad <= 0) {
          agent.status = 'available';
        }
        // Decrease performance score
        agent.performanceScore = Math.max(agent.performanceScore * 0.9, 0.1);
      }
    }

    this.metrics.failedTasks++;

    this.emit('taskFailed', {
      taskId: task.id,
      error: error.message,
    });

    console.log(`❌ Task failed: ${task.id} - ${error.message}`);

    // Handle failure according to config
    if (this.config.failureHandling === 'retry') {
      // Re-queue the task
      task.status = 'queued';
      task.assignedAgents = [];
      this.taskQueue.push(task);
      this.sortTaskQueue();
    }
  }

  private sortTaskQueue(): void {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };

    this.taskQueue.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by creation time (oldest first)
      return a.createdAt.getTime() - b.createdAt.getTime();
    });
  }

  private updateMetrics(): void {
    const completedTasks = Array.from(this.tasks.values()).filter((t) => t.status === 'completed');

    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        return sum + (task.completedAt!.getTime() - task.startedAt!.getTime());
      }, 0);

      this.metrics.averageExecutionTime = totalTime / completedTasks.length;
    }

    // Update agent utilization
    for (const [agentId, agent] of this.agents) {
      this.metrics.agentUtilization.set(agentId, agent.currentLoad / agent.maxLoad);
    }

    // Calculate throughput (tasks per minute)
    const now = Date.now();
    const recentTasks = completedTasks.filter((task) => now - task.completedAt!.getTime() < 60000);
    this.metrics.throughput = recentTasks.length;

    // Calculate error rate
    this.metrics.errorRate =
      this.metrics.totalTasks > 0 ? this.metrics.failedTasks / this.metrics.totalTasks : 0;

    // Calculate resource efficiency
    const avgUtilization =
      Array.from(this.metrics.agentUtilization.values()).reduce((sum, util) => sum + util, 0) /
      this.metrics.agentUtilization.size;
    this.metrics.resourceEfficiency = avgUtilization || 0;
  }

  private optimizeResources(): void {
    if (!this.config.autoScale) return;

    const utilizationThreshold = 0.8;
    const avgUtilization = this.metrics.resourceEfficiency;

    // Auto-scaling logic would go here
    if (avgUtilization > utilizationThreshold && this.agents.size < this.config.maxAgents) {
      this.emit('scalingRecommendation', {
        action: 'scale_up',
        reason: 'High utilization',
        currentUtilization: avgUtilization,
      });
    } else if (avgUtilization < 0.3 && this.agents.size > 1) {
      this.emit('scalingRecommendation', {
        action: 'scale_down',
        reason: 'Low utilization',
        currentUtilization: avgUtilization,
      });
    }
  }
}

// Export default instance
export const swarmOrchestrator = new SwarmOrchestrator();
export default SwarmOrchestrator;
