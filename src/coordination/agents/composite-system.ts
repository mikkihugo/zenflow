/**
 * @file Composite Pattern Implementation for Agent Hierarchies
 * Provides uniform interfaces for individual agents and agent groups.
 */

import { getLogger } from '../../config/logging-config';

const logger = getLogger('coordination-agents-composite-system');

import { EventEmitter } from 'node:events';

// Core agent interfaces
export interface AgentCapability {
  name: string;
  version: string;
  description: string;
  parameters?: Record<string, unknown>;
  resourceRequirements?: ResourceRequirements;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
}

export interface ResourceAllocation {
  allocated: ResourceRequirements;
  used: ResourceRequirements;
  available: ResourceRequirements;
  efficiency: number;
}

export interface TaskDefinition {
  id: string;
  type: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  payload: Record<string, unknown>;
  requirements: {
    capabilities: string[];
    resources: ResourceRequirements;
    timeout?: number;
  };
  dependencies?: string[];
  metadata?: Record<string, unknown>;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  success: boolean;
  result?: string;
  executionTime: number;
  timestamp: Date;
  error?: {
    message: string;
  };
  status?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime?: Date;
  endTime?: Date;
  outputs?: Record<string, unknown>;
  metrics?: TaskMetrics;
}

export interface TaskMetrics {
  executionTime: number;
  resourceUsage: ResourceRequirements;
  memoryPeak: number;
  cpuPeak: number;
  networkUsage: number;
  errorCount: number;
  retryCount: number;
}

export interface AgentStatus {
  id: string;
  state: 'initializing' | 'idle' | 'busy' | 'error' | 'offline';
  health: number; // 0-1 scale
  uptime: number;
  currentTask?: string;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalCompletedTasks: number; // Alias for completedTasks
  totalFailedTasks: number; // Alias for failedTasks
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  lastActivity: Date;
  currentTasks: number;
  lastTaskTimestamp: Date;
  resourceUtilization: {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
  };
  resources: ResourceAllocation;
}

export interface AgentMetrics {
  totalTasks: number;
  successRate: number;
  averageExecutionTime: number;
  resourceEfficiency: number;
  reliability: number;
  lastWeekActivity: number[];
  capabilities: AgentCapability[];
}

// Configuration for agent initialization
export interface AgentConfig {
  maxConcurrentTasks?: number;
  capabilities?: AgentCapability[];
  taskExecutor?: (task: TaskDefinition) => Promise<TaskResult>;
  loadBalancing?: LoadBalancingStrategy;
  failureHandling?: 'retry' | 'skip' | 'cascade';
  maxRetries?: number;
  [key: string]: unknown;
}

export type LoadBalancingStrategy =
  | 'round-robin'
  | 'least-loaded'
  | 'capability-based';

// Composite pattern base interface
export interface AgentComponent extends EventEmitter {
  getId(): string;
  getName(): string;
  getType(): 'individual' | 'group' | 'composite';
  getCapabilities(): AgentCapability[];
  getStatus(): AgentStatus | CompositeStatus;
  getMetrics(): AgentMetrics | CompositeMetrics;

  // Core operations
  executeTask(task: TaskDefinition): Promise<TaskResult>;
  canHandleTask(task: TaskDefinition): boolean;
  addCapability(capability: AgentCapability): void;
  removeCapability(capabilityName: string): void;

  // Resource management
  allocateResources(requirements: ResourceRequirements): boolean;
  releaseResources(requirements: ResourceRequirements): void;
  getAvailableResources(): ResourceRequirements;

  // Lifecycle management
  initialize(config: AgentConfig): Promise<void>;
  shutdown(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
}

// Individual agent implementation (Leaf)
export class Agent extends EventEmitter implements AgentComponent {
  private id: string;
  private name: string;
  private capabilities: Map<string, AgentCapability> = new Map();
  private status: AgentStatus;
  private currentTask?: TaskDefinition;
  private taskQueue: TaskDefinition[] = [];
  private taskHistory: TaskResult[] = [];
  private maxConcurrentTasks = 1;
  private resourceLimits: ResourceRequirements;
  private taskExecutor?: (task: TaskDefinition) => Promise<TaskResult>;
  private executionStats: {
    min: number;
    max: number;
    total: number;
    count: number;
  } = {
    min: Number.MAX_VALUE,
    max: 0,
    total: 0,
    count: 0,
  };
  // private config?: AgentConfig; // xxx REMOVED: config not stored, only used in initialize()

  constructor(
    id: string,
    name: string,
    initialCapabilities: AgentCapability[] = [],
    resourceLimits: ResourceRequirements = {
      cpu: 1.0,
      memory: 1024,
      network: 100,
      storage: 1024,
    }
  ) {
    super();
    this.id = id;
    this.name = name;
    this.resourceLimits = resourceLimits;

    // Initialize capabilities
    initialCapabilities.forEach((cap) => {
      this.capabilities.set(cap.name, cap);
    });

    // Initialize status
    this.status = {
      id,
      state: 'initializing',
      health: 1.0,
      uptime: 0,
      queuedTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      totalCompletedTasks: 0,
      totalFailedTasks: 0,
      averageExecutionTime: 0,
      minExecutionTime: 0,
      maxExecutionTime: 0,
      lastActivity: new Date(),
      currentTasks: 0,
      lastTaskTimestamp: new Date(),
      resourceUtilization: {
        cpu: 0,
        memory: 0,
        network: 0,
        storage: 0,
      },
      resources: {
        allocated: { cpu: 0, memory: 0, network: 0, storage: 0 },
        used: { cpu: 0, memory: 0, network: 0, storage: 0 },
        available: { ...resourceLimits },
        efficiency: 1.0,
      },
    };
    // currentTask is intentionally omitted as it's optional and undefined initially
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): 'individual' | 'group' | 'composite' {
    return 'individual';
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities.values());
  }

  getStatus(): AgentStatus {
    const avgExecutionTime =
      this.executionStats.count > 0
        ? this.executionStats.total / this.executionStats.count
        : 0;
    const minExecutionTime =
      this.executionStats.count > 0 ? this.executionStats.min : 0;
    const maxExecutionTime = this.executionStats.max;

    const status: AgentStatus = {
      ...this.status,
      totalCompletedTasks: this.status.completedTasks,
      totalFailedTasks: this.status.failedTasks,
      averageExecutionTime: avgExecutionTime,
      minExecutionTime: minExecutionTime,
      maxExecutionTime: maxExecutionTime,
      currentTasks: this.status.state === 'busy' ? 1 : 0,
      lastTaskTimestamp: this.status.lastActivity,
      resourceUtilization: {
        cpu:
          this.resourceLimits.cpu > 0
            ? this.status.resources.allocated.cpu / this.resourceLimits.cpu
            : 0,
        memory:
          this.resourceLimits.memory > 0
            ? this.status.resources.allocated.memory /
              this.resourceLimits.memory
            : 0,
        network:
          this.resourceLimits.network > 0
            ? this.status.resources.allocated.network /
              this.resourceLimits.network
            : 0,
        storage:
          this.resourceLimits.storage > 0
            ? this.status.resources.allocated.storage /
              this.resourceLimits.storage
            : 0,
      },
    };

    if (this.currentTask) {
      status.currentTask = this.currentTask.id;
    }

    return status;
  }

  getMetrics(): AgentMetrics {
    const successRate =
      this.status.completedTasks > 0
        ? this.status.completedTasks /
          (this.status.completedTasks + this.status.failedTasks)
        : 1.0;

    const avgExecutionTime =
      this.taskHistory.length > 0
        ? this.taskHistory
            .filter((t) => t.metrics?.executionTime)
            .reduce((sum, t) => sum + (t.metrics?.executionTime || 0), 0) /
          this.taskHistory.length
        : 0;

    return {
      totalTasks: this.status.completedTasks + this.status.failedTasks,
      successRate,
      averageExecutionTime: avgExecutionTime,
      resourceEfficiency: this.status.resources.efficiency,
      reliability: this.status.health,
      lastWeekActivity: this.generateWeeklyActivity(),
      capabilities: this.getCapabilities(),
    };
  }

  async executeTask(task: TaskDefinition): Promise<TaskResult> {
    // Validate task structure
    if (
      !task.id ||
      !task.type ||
      !task.requirements ||
      !task.requirements.capabilities
    ) {
      throw new Error('Invalid task definition');
    }

    // Validate resources are not negative
    const resources = task.requirements.resources;
    if (
      resources &&
      (resources.cpu < 0 ||
        resources.memory < 0 ||
        resources.network < 0 ||
        resources.storage < 0)
    ) {
      throw new Error('Invalid task definition - negative resources');
    }

    if (!this.canHandleTask(task)) {
      throw new Error('Agent cannot handle task');
    }

    if (this.status.state === 'busy' && this.maxConcurrentTasks <= 1) {
      // Queue the task
      this.taskQueue.push(task);
      this.status.queuedTasks = this.taskQueue.length;

      const queuedTaskResult: TaskResult = {
        taskId: task.id,
        agentId: this.id,
        success: false,
        executionTime: 0,
        timestamp: new Date(),
        status: 'pending',
        startTime: new Date(),
      };

      return queuedTaskResult;
    }

    return this.executeTaskImmediately(task);
  }

  canHandleTask(task: TaskDefinition): boolean {
    // Check if agent has required capabilities
    const hasCapabilities = task.requirements.capabilities.every((reqCap) =>
      this.capabilities.has(reqCap)
    );

    if (!hasCapabilities) return false;

    // Check resource requirements
    const requiredResources = task.requirements.resources;
    return this.canAllocateResources(requiredResources);
  }

  addCapability(capability: AgentCapability): void {
    this.capabilities.set(capability.name, capability);
    this.emit('capability:added', { agentId: this.id, capability });
  }

  removeCapability(capabilityName: string): void {
    const removed = this.capabilities.delete(capabilityName);
    if (removed) {
      this.emit('capability:removed', { agentId: this.id, capabilityName });
    }
  }

  allocateResources(requirements: ResourceRequirements): boolean {
    if (!this.canAllocateResources(requirements)) {
      return false;
    }

    this.status.resources.allocated.cpu += requirements.cpu;
    this.status.resources.allocated.memory += requirements.memory;
    this.status.resources.allocated.network += requirements.network;
    this.status.resources.allocated.storage += requirements.storage;

    this.updateAvailableResources();
    return true;
  }

  releaseResources(requirements: ResourceRequirements): void {
    this.status.resources.allocated.cpu = Math.max(
      0,
      this.status.resources.allocated.cpu - requirements.cpu
    );
    this.status.resources.allocated.memory = Math.max(
      0,
      this.status.resources.allocated.memory - requirements.memory
    );
    this.status.resources.allocated.network = Math.max(
      0,
      this.status.resources.allocated.network - requirements.network
    );
    this.status.resources.allocated.storage = Math.max(
      0,
      this.status.resources.allocated.storage - requirements.storage
    );

    this.updateAvailableResources();
  }

  getResourceLimits(): ResourceRequirements {
    return { ...this.resourceLimits };
  }

  getAvailableResources(): ResourceRequirements {
    return { ...this.status.resources.available };
  }

  async initialize(config: AgentConfig): Promise<void> {
    // Config is applied to individual settings, not stored as a whole
    this.status.state = 'idle';
    this.status.lastActivity = new Date();

    // Apply configuration
    if (config?.maxConcurrentTasks) {
      this.maxConcurrentTasks = config?.maxConcurrentTasks;
    }

    if (config?.capabilities) {
      config?.capabilities.forEach((cap: AgentCapability) => {
        this.addCapability(cap);
      });
    }

    if (config?.taskExecutor) {
      this.taskExecutor = config.taskExecutor;
    }

    this.emit('agent:initialized', { agentId: this.id, config });
  }

  async shutdown(): Promise<void> {
    // Cancel current task if any
    if (this.currentTask) {
      await this.cancelCurrentTask();
    }

    // Clear task queue
    this.taskQueue = [];
    this.status.queuedTasks = 0;
    this.status.state = 'offline';

    this.emit('agent:shutdown', { agentId: this.id });
  }

  async pause(): Promise<void> {
    if (this.status.state === 'busy') {
      // Let current task complete but don't start new ones
      this.status.state = 'busy'; // Keep current state
    } else {
      this.status.state = 'idle';
    }

    this.emit('agent:paused', { agentId: this.id });
  }

  async resume(): Promise<void> {
    if (this.status.state !== 'offline') {
      this.status.state = 'idle';
      await this.processTaskQueue();
    }

    this.emit('agent:resumed', { agentId: this.id });
  }

  // Private helper methods
  private async executeTaskImmediately(
    task: TaskDefinition
  ): Promise<TaskResult> {
    const startTime = new Date();
    const requiredResources = task.requirements.resources;

    if (!this.allocateResources(requiredResources)) {
      throw new Error('Cannot allocate required resources');
    }

    this.currentTask = task;
    this.status.state = 'busy';
    this.status.lastActivity = startTime;

    let result: TaskResult | undefined;

    try {
      if (this.taskExecutor) {
        // Use custom task executor
        result = await this.taskExecutor(task);
        result.agentId = this.id; // Ensure correct agent ID
        // Use the executionTime from the task executor result
        this.updateExecutionStats(result.executionTime);
      } else {
        // Fallback to default simulation
        const executionTime = this.estimateExecutionTime(task);
        const outputs = await this.performTaskExecution(task, executionTime);
        const endTime = new Date();

        const actualExecutionTime = endTime.getTime() - startTime.getTime();

        result = {
          taskId: task.id,
          agentId: this.id,
          success: true,
          result: `Completed ${task.type} task`,
          executionTime: actualExecutionTime,
          timestamp: endTime,
          status: 'completed',
          startTime,
          endTime,
          outputs,
          metrics: {
            executionTime: actualExecutionTime,
            resourceUsage: requiredResources,
            memoryPeak: requiredResources.memory * 0.8,
            cpuPeak: requiredResources.cpu * 0.9,
            networkUsage: requiredResources.network * 0.6,
            errorCount: 0,
            retryCount: 0,
          },
        };
        this.updateExecutionStats(actualExecutionTime);
      }

      this.status.completedTasks++;
      this.updateHealth(true);
    } catch (error) {
      const endTime = new Date();
      result = {
        taskId: task.id,
        agentId: this.id,
        success: false,
        executionTime: endTime.getTime() - startTime.getTime(),
        timestamp: endTime,
        status: 'failed',
        startTime,
        endTime,
        error: { message: (error as Error).message },
        metrics: {
          executionTime: endTime.getTime() - startTime.getTime(),
          resourceUsage: requiredResources,
          memoryPeak: 0,
          cpuPeak: 0,
          networkUsage: 0,
          errorCount: 1,
          retryCount: 0,
        },
      };

      this.status.failedTasks++;
      this.updateHealth(false);
    } finally {
      this.releaseResources(requiredResources);
      this.currentTask = undefined;
      this.status.state = 'idle';
      if (result) {
        this.taskHistory.push(result);
      }

      // Process next task in queue
      await this.processTaskQueue();
    }

    this.emit('task:completed', result);
    return result;
  }

  private async performTaskExecution(
    task: TaskDefinition,
    executionTime: number
  ): Promise<Record<string, unknown>> {
    // Simulate task execution
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure based on health
        if (Math.random() < this.status.health) {
          resolve({
            result: `Task ${task.id} completed successfully`,
            timestamp: new Date(),
            agentId: this.id,
            processingTime: executionTime,
          });
        } else {
          reject(new Error(`Task execution failed for ${task.id}`));
        }
      }, executionTime);
    });
  }

  private estimateTaskResources(task: TaskDefinition): ResourceRequirements {
    // Use task requirements directly if available
    if (task.requirements?.resources) {
      return task.requirements.resources;
    }

    // Fallback to estimation
    let cpu = 0.1;
    let memory = 64;
    let network = 10;
    let storage = 10;

    // Adjust based on task type and capabilities
    task.requirements.capabilities.forEach((capName) => {
      const capability = this.capabilities.get(capName);
      if (capability?.resourceRequirements) {
        cpu += capability.resourceRequirements.cpu;
        memory += capability.resourceRequirements.memory;
        network += capability.resourceRequirements.network;
        storage += capability.resourceRequirements.storage;
      }
    });

    // Adjust based on priority
    const priorityMultiplier = {
      low: 0.8,
      medium: 1.0,
      high: 1.2,
      critical: 1.5,
    }[task.priority];

    return {
      cpu: cpu * priorityMultiplier,
      memory: memory * priorityMultiplier,
      network: network * priorityMultiplier,
      storage: storage * priorityMultiplier,
    };
  }

  private estimateExecutionTime(task: TaskDefinition): number {
    // Base execution time: 100ms
    let baseTime = 100;

    // Adjust based on task complexity (number of required capabilities)
    baseTime += task.requirements.capabilities.length * 50;

    // Adjust based on priority (higher priority = faster processing)
    const priorityMultiplier = {
      low: 1.5,
      medium: 1.0,
      high: 0.8,
      critical: 0.5,
    }[task.priority];

    return baseTime * priorityMultiplier;
  }

  private canAllocateResources(requirements: ResourceRequirements): boolean {
    const available = this.status.resources.available;
    return (
      available.cpu >= requirements.cpu &&
      available.memory >= requirements.memory &&
      available.network >= requirements.network &&
      available.storage >= requirements.storage
    );
  }

  private updateAvailableResources(): void {
    const allocated = this.status.resources.allocated;
    this.status.resources.available = {
      cpu: this.resourceLimits.cpu - allocated.cpu,
      memory: this.resourceLimits.memory - allocated.memory,
      network: this.resourceLimits.network - allocated.network,
      storage: this.resourceLimits.storage - allocated.storage,
    };

    // Update efficiency
    const totalAllocated =
      allocated.cpu + allocated.memory + allocated.network + allocated.storage;
    const totalLimits =
      this.resourceLimits.cpu +
      this.resourceLimits.memory +
      this.resourceLimits.network +
      this.resourceLimits.storage;
    this.status.resources.efficiency =
      totalLimits > 0 ? 1 - totalAllocated / totalLimits : 1;
  }

  private updateHealth(taskSuccess: boolean): void {
    // Simple health calculation based on success rate
    const totalTasks = this.status.completedTasks + this.status.failedTasks;
    if (totalTasks > 0) {
      this.status.health = this.status.completedTasks / totalTasks;
    }

    // Apply recent task result with weight
    if (taskSuccess) {
      this.status.health = Math.min(1.0, this.status.health + 0.01);
    } else {
      this.status.health = Math.max(0.0, this.status.health - 0.05);
    }
  }

  private async processTaskQueue(): Promise<void> {
    if (this.taskQueue.length > 0 && this.status.state === 'idle') {
      const nextTask = this.taskQueue.shift();
      if (nextTask) {
        this.status.queuedTasks = this.taskQueue.length;
        await this.executeTaskImmediately(nextTask);
      }
    }
  }

  private async cancelCurrentTask(): Promise<void> {
    if (this.currentTask) {
      const result: TaskResult = {
        taskId: this.currentTask.id,
        agentId: this.id,
        success: false,
        executionTime: 0,
        timestamp: new Date(),
        status: 'cancelled',
        startTime: new Date(),
        endTime: new Date(),
        error: { message: 'Task cancelled due to agent shutdown' },
      };

      this.taskHistory.push(result);
      this.emit('task:cancelled', result);
    }
  }

  private generateWeeklyActivity(): number[] {
    // Generate mock weekly activity data
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
  }

  private updateExecutionStats(executionTime: number): void {
    this.executionStats.count++;
    this.executionStats.total += executionTime;
    this.executionStats.min = Math.min(this.executionStats.min, executionTime);
    this.executionStats.max = Math.max(this.executionStats.max, executionTime);
  }
}

// Composite status and metrics interfaces
export interface CompositeStatus {
  id: string;
  state: 'active' | 'partial' | 'inactive' | 'shutdown';
  health: number;
  memberCount: number;
  totalMembers: number; // Alias for memberCount
  activeMemberCount: number;
  totalQueuedTasks: number;
  totalCompletedTasks: number;
  totalFailedTasks: number;
  currentTasks: number;
  averageExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  uptime: number;
  lastActivity: Date;
  lastTaskTimestamp: Date;
  resourceUtilization: {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
  };
  resourceCapacity: {
    cpu: number;
    memory: number;
    network: number;
    storage: number;
  };
  hierarchyDepth?: number;
  resources: {
    totalAllocated: ResourceRequirements;
    totalAvailable: ResourceRequirements;
    averageEfficiency: number;
  };
}

export interface CompositeMetrics {
  totalTasks: number;
  successRate: number;
  averageExecutionTime: number;
  resourceEfficiency: number;
  reliability: number;
  lastWeekActivity: number[];
  capabilities: AgentCapability[];
  memberMetrics: {
    totalMembers: number;
    activeMembers: number;
    averageHealth: number;
    distributionByType: Record<string, number>;
  };
}

// Agent group implementation (Composite)
export class AgentGroup extends EventEmitter implements AgentComponent {
  private id: string;
  private name: string;
  private members: Map<string, AgentComponent> = new Map();
  private groupCapabilities: Map<string, AgentCapability> = new Map();
  private loadBalancingStrategy: LoadBalancingStrategy = 'capability-based';
  private currentRoundRobinIndex = 0;
  private isShutdown = false;

  constructor(id: string, name: string, members: AgentComponent[] = []) {
    super();
    this.id = id;
    this.name = name;

    members.forEach((member) => this.addMember(member));
    this.updateGroupCapabilities();
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): 'individual' | 'group' | 'composite' {
    return 'composite';
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.groupCapabilities.values());
  }

  getStatus(): CompositeStatus {
    const memberStatuses = Array.from(this.members.values()).map((member) =>
      member.getStatus()
    );
    const individualStatuses = memberStatuses.filter(
      (s) => 'state' in s
    ) as AgentStatus[];
    const compositeStatuses = memberStatuses.filter((s) => 'memberCount' in s);

    const activeMemberCount =
      individualStatuses.filter((s) => s.state !== 'offline').length +
      compositeStatuses.filter((s) => s.state !== 'inactive').length;

    const totalHealth = [
      ...individualStatuses.map((s) => s.health),
      ...compositeStatuses.map((s) => s.health),
    ];
    const avgHealth =
      totalHealth.length > 0
        ? totalHealth.reduce((sum, h) => sum + h, 0) / totalHealth.length
        : 1;

    const totalQueuedTasks =
      individualStatuses.reduce((sum, s) => sum + s.queuedTasks, 0) +
      compositeStatuses.reduce((sum, s) => sum + s.totalQueuedTasks, 0);

    const totalCompletedTasks =
      individualStatuses.reduce((sum, s) => sum + s.completedTasks, 0) +
      compositeStatuses.reduce((sum, s) => sum + s.totalCompletedTasks, 0);

    const totalFailedTasks =
      individualStatuses.reduce((sum, s) => sum + s.failedTasks, 0) +
      compositeStatuses.reduce((sum, s) => sum + s.totalFailedTasks, 0);

    // Aggregate resources
    const totalAllocated = this.aggregateResources(
      individualStatuses.map((s) => s.resources.allocated)
    );
    const totalAvailable = this.aggregateResources(
      individualStatuses.map((s) => s.resources.available)
    );
    const avgEfficiency =
      individualStatuses.length > 0
        ? individualStatuses.reduce(
            (sum, s) => sum + s.resources.efficiency,
            0
          ) / individualStatuses.length
        : 1;

    const lastActivity = new Date(
      Math.max(
        ...memberStatuses.map((s) =>
          'lastActivity' in s ? s.lastActivity.getTime() : Date.now()
        )
      )
    );

    // Calculate additional metrics
    const currentTasks = individualStatuses.reduce(
      (sum, s) => sum + s.currentTasks,
      0
    );
    const executionTimes = individualStatuses
      .filter((s) => s.averageExecutionTime > 0)
      .map((s) => s.averageExecutionTime);
    const avgExecutionTime =
      executionTimes.length > 0
        ? executionTimes.reduce((sum, t) => sum + t, 0) / executionTimes.length
        : 0;

    const minTimes = individualStatuses
      .filter((s) => s.minExecutionTime > 0)
      .map((s) => s.minExecutionTime);
    const minExecutionTime = minTimes.length > 0 ? Math.min(...minTimes) : 0;

    const maxTimes = individualStatuses.map((s) => s.maxExecutionTime);
    const maxExecutionTime = maxTimes.length > 0 ? Math.max(...maxTimes) : 0;

    const uptime =
      individualStatuses.length > 0
        ? Math.max(...individualStatuses.map((s) => s.uptime || 0))
        : 0;

    // Calculate resource capacity and utilization
    // Get actual resource limits from agents, not utilization percentages
    const resourceCapacity = this.aggregateResources(
      Array.from(this.members.values())
        .filter((m) => m.getType() === 'individual')
        .map((agent) => {
          if (agent instanceof Agent) {
            const limits = agent.getResourceLimits();
            return (
              limits || { cpu: 1.0, memory: 1024, network: 100, storage: 100 }
            );
          }
          // Fallback for non-Agent members
          return { cpu: 1.0, memory: 1024, network: 100, storage: 100 };
        })
    );

    const resourceUtilization = {
      cpu:
        resourceCapacity.cpu > 0
          ? totalAllocated.cpu / resourceCapacity.cpu
          : 0,
      memory:
        resourceCapacity.memory > 0
          ? totalAllocated.memory / resourceCapacity.memory
          : 0,
      network:
        resourceCapacity.network > 0
          ? totalAllocated.network / resourceCapacity.network
          : 0,
      storage:
        resourceCapacity.storage > 0
          ? totalAllocated.storage / resourceCapacity.storage
          : 0,
    };

    return {
      id: this.id,
      state: this.isShutdown
        ? 'shutdown'
        : activeMemberCount === 0
          ? 'inactive'
          : activeMemberCount === this.members.size
            ? 'active'
            : 'partial',
      health: avgHealth,
      memberCount: this.members.size,
      totalMembers: this.members.size,
      activeMemberCount,
      totalQueuedTasks,
      totalCompletedTasks,
      totalFailedTasks,
      currentTasks,
      averageExecutionTime: avgExecutionTime,
      minExecutionTime,
      maxExecutionTime,
      uptime,
      lastActivity,
      lastTaskTimestamp: lastActivity, // Use same as lastActivity for now
      resourceUtilization,
      resourceCapacity,
      resources: {
        totalAllocated,
        totalAvailable,
        averageEfficiency: avgEfficiency,
      },
    };
  }

  getMetrics(): CompositeMetrics {
    const memberMetrics = Array.from(this.members.values()).map((member) =>
      member.getMetrics()
    );

    const totalTasks = memberMetrics.reduce((sum, m) => sum + m.totalTasks, 0);
    const weightedSuccessRate =
      memberMetrics.reduce((sum, m) => sum + m.successRate * m.totalTasks, 0) /
        totalTasks || 1;
    const avgExecutionTime =
      memberMetrics.reduce((sum, m) => sum + m.averageExecutionTime, 0) /
        memberMetrics.length || 0;
    const avgResourceEfficiency =
      memberMetrics.reduce((sum, m) => sum + m.resourceEfficiency, 0) /
        memberMetrics.length || 1;
    const avgReliability =
      memberMetrics.reduce((sum, m) => sum + m.reliability, 0) /
        memberMetrics.length || 1;

    // Aggregate weekly activity
    const weeklyActivity = Array.from({ length: 7 }, (_, day) =>
      memberMetrics.reduce((sum, m) => sum + (m.lastWeekActivity[day] || 0), 0)
    );

    // Distribution by type
    const distributionByType: Record<string, number> = {};
    Array.from(this.members.values()).forEach((member) => {
      const type = member.getType();
      distributionByType[type] = (distributionByType[type] || 0) + 1;
    });

    return {
      totalTasks,
      successRate: weightedSuccessRate,
      averageExecutionTime: avgExecutionTime,
      resourceEfficiency: avgResourceEfficiency,
      reliability: avgReliability,
      lastWeekActivity: weeklyActivity,
      capabilities: this.getCapabilities(),
      memberMetrics: {
        totalMembers: this.members.size,
        activeMembers: Array.from(this.members.values()).filter((m) => {
          const status = m.getStatus();
          // Both AgentStatus and CompositeStatus have state property
          if ('memberCount' in status) {
            // CompositeStatus
            return status.state !== 'inactive';
          }
          // AgentStatus
          return status.state !== 'offline';
        }).length,
        averageHealth: avgReliability,
        distributionByType,
      },
    };
  }

  async executeTask(task: TaskDefinition): Promise<TaskResult> {
    if (!this.canHandleTask(task)) {
      throw new Error(`Agent group ${this.id} cannot handle task ${task.id}`);
    }

    const selectedAgent = this.selectAgentForTask(task);
    if (!selectedAgent) {
      throw new Error(`No suitable agent found for task ${task.id}`);
    }

    try {
      const result = await selectedAgent?.executeTask(task);
      this.emit('task:delegated', {
        taskId: task.id,
        selectedAgentId: selectedAgent?.getId(),
        groupId: this.id,
      });
      return result;
    } catch (error) {
      this.emit('task:delegation_failed', {
        taskId: task.id,
        selectedAgentId: selectedAgent?.getId(),
        groupId: this.id,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  canHandleTask(task: TaskDefinition): boolean {
    // Check if any member can handle the task
    return Array.from(this.members.values()).some((member) =>
      member.canHandleTask(task)
    );
  }

  addCapability(capability: AgentCapability): void {
    this.groupCapabilities.set(capability.name, capability);
    this.emit('group:capability_added', { groupId: this.id, capability });
  }

  removeCapability(capabilityName: string): void {
    const removed = this.groupCapabilities.delete(capabilityName);
    if (removed) {
      this.emit('group:capability_removed', {
        groupId: this.id,
        capabilityName,
      });
    }
  }

  allocateResources(requirements: ResourceRequirements): boolean {
    // Try to find a member that can allocate the resources
    for (const member of Array.from(this.members.values())) {
      if (member.allocateResources(requirements)) {
        return true;
      }
    }
    return false;
  }

  releaseResources(requirements: ResourceRequirements): void {
    // This is a simplified implementation - in practice, you'd track which member allocated what
    for (const member of Array.from(this.members.values())) {
      member.releaseResources(requirements);
      break; // Release from first member (simplified)
    }
  }

  getAvailableResources(): ResourceRequirements {
    const allResources = Array.from(this.members.values()).map((member) =>
      member.getAvailableResources()
    );
    return this.aggregateResources(allResources);
  }

  async initialize(config: AgentConfig): Promise<void> {
    // Apply group-specific configuration
    if (config.loadBalancing) {
      this.setLoadBalancingStrategy(config.loadBalancing);
    }

    // Initialize all members
    const initPromises = Array.from(this.members.values()).map((member) =>
      member
        .initialize(config)
        .catch((error) =>
          logger.error(`Failed to initialize member ${member.getId()}:`, error)
        )
    );

    await Promise.allSettled(initPromises);
    this.emit('group:initialized', {
      groupId: this.id,
      memberCount: this.members.size,
    });
  }

  async shutdown(): Promise<void> {
    if (this.isShutdown) {
      return; // Already shutdown, avoid duplicate operations
    }

    this.isShutdown = true;

    // Shutdown all members
    const shutdownPromises = Array.from(this.members.values()).map((member) =>
      member
        .shutdown()
        .catch((error) =>
          logger.error(`Failed to shutdown member ${member.getId()}:`, error)
        )
    );

    await Promise.allSettled(shutdownPromises);
    this.emit('group:shutdown', { groupId: this.id });
  }

  async pause(): Promise<void> {
    // Pause all members
    const pausePromises = Array.from(this.members.values()).map((member) =>
      member.pause()
    );
    await Promise.allSettled(pausePromises);
    this.emit('group:paused', { groupId: this.id });
  }

  async resume(): Promise<void> {
    // Resume all members
    const resumePromises = Array.from(this.members.values()).map((member) =>
      member.resume()
    );
    await Promise.allSettled(resumePromises);
    this.emit('group:resumed', { groupId: this.id });
  }

  // Group-specific methods
  addMember(member: AgentComponent): void {
    // Prevent adding group to itself
    if (member === this || member.getId() === this.id) {
      throw new Error('Cannot add group to itself');
    }

    this.members.set(member.getId(), member);
    this.updateGroupCapabilities();

    // Forward member events (if member supports events)
    if (member && typeof member.on === 'function') {
      member.on('task:completed', (result) => {
        this.emit('member:task_completed', {
          groupId: this.id,
          memberId: member.getId(),
          result,
        });
      });
    }

    this.emit('group:member_added', {
      groupId: this.id,
      memberId: member.getId(),
    });
  }

  removeMember(memberId: string): boolean {
    const member = this.members.get(memberId);
    if (!member) return false;

    // Remove event listeners
    member.removeAllListeners();

    this.members.delete(memberId);
    this.updateGroupCapabilities();

    this.emit('group:member_removed', { groupId: this.id, memberId });
    return true;
  }

  getMember(memberId: string): AgentComponent | undefined {
    return this.members.get(memberId);
  }

  getMembers(): AgentComponent[] {
    return Array.from(this.members.values());
  }

  getMemberIds(): string[] {
    return Array.from(this.members.keys());
  }

  setLoadBalancingStrategy(strategy: LoadBalancingStrategy): void {
    this.loadBalancingStrategy = strategy;
    this.emit('group:strategy_changed', { groupId: this.id, strategy });
  }

  getLoadBalancingStrategy(): LoadBalancingStrategy {
    return this.loadBalancingStrategy;
  }

  getTotalAgentCount(): number {
    let count = 0;
    for (const member of Array.from(this.members.values())) {
      if (member.getType() === 'individual') {
        count++;
      } else if (member instanceof AgentGroup) {
        count += member.getTotalAgentCount();
      }
    }
    return count;
  }

  // Broadcast task to all members (parallel execution)
  async broadcastTask(task: TaskDefinition): Promise<TaskResult[]> {
    const eligibleMembers = Array.from(this.members.values()).filter((member) =>
      member.canHandleTask(task)
    );

    if (eligibleMembers.length === 0) {
      throw new Error(`No members can handle task ${task.id}`);
    }

    const taskPromises = eligibleMembers.map(async (member, index) => {
      const memberTask = {
        ...task,
        id: `${task.id}-${index}`,
        metadata: {
          ...task.metadata,
          originalTaskId: task.id,
          memberId: member.getId(),
        },
      };

      return member.executeTask(memberTask);
    });

    const results = await Promise.allSettled(taskPromises);

    return results?.map((result, index) => {
      if (result?.status === 'fulfilled') {
        return result?.value;
      }
      const agent = eligibleMembers[index];
      return {
        taskId: `${task.id}-${index}`,
        agentId: agent ? agent.getId() : `unknown-${index}`,
        success: false,
        executionTime: 0,
        timestamp: new Date(),
        status: 'failed' as const,
        startTime: new Date(),
        endTime: new Date(),
        error: { message: result?.reason?.message || 'Unknown error' },
      };
    });
  }

  // Private helper methods
  private selectAgentForTask(task: TaskDefinition): AgentComponent | null {
    const eligibleMembers = Array.from(this.members.values()).filter((member) =>
      member.canHandleTask(task)
    );

    if (eligibleMembers.length === 0) return null;

    switch (this.loadBalancingStrategy) {
      case 'round-robin':
        return this.selectRoundRobin(eligibleMembers);

      case 'least-loaded':
        return this.selectLeastLoaded(eligibleMembers);

      case 'capability-based':
        return this.selectByCapability(eligibleMembers, task);

      default:
        return eligibleMembers.length > 0 ? (eligibleMembers[0] ?? null) : null;
    }
  }

  private selectRoundRobin(
    eligibleMembers: AgentComponent[]
  ): AgentComponent | null {
    if (eligibleMembers.length === 0) {
      return null;
    }

    const selected =
      eligibleMembers[this.currentRoundRobinIndex % eligibleMembers.length];
    this.currentRoundRobinIndex++;
    return selected ?? null;
  }

  private selectLeastLoaded(
    eligibleMembers: AgentComponent[]
  ): AgentComponent | null {
    if (eligibleMembers.length === 0) {
      return null;
    }

    // Sort by current load and then by number of completed tasks for better distribution
    return eligibleMembers.reduce((least, current) => {
      const leastStatus = least.getStatus();
      const currentStatus = current?.getStatus();

      const leastLoad =
        'queuedTasks' in leastStatus ? leastStatus.queuedTasks : 0;
      const currentLoad =
        'queuedTasks' in currentStatus ? currentStatus?.queuedTasks : 0;

      // If load is equal, prefer agent with fewer completed tasks for better distribution
      if (leastLoad === currentLoad) {
        const leastCompleted =
          'completedTasks' in leastStatus ? leastStatus.completedTasks : 0;
        const currentCompleted =
          'completedTasks' in currentStatus ? currentStatus.completedTasks : 0;
        return leastCompleted <= currentCompleted ? least : current;
      }

      return leastLoad < currentLoad ? least : current;
    });
  }

  protected selectByCapability(
    eligibleMembers: AgentComponent[],
    task: TaskDefinition
  ): AgentComponent | null {
    if (eligibleMembers.length === 0) {
      return null;
    }

    // Select member with the most matching capabilities
    return eligibleMembers.reduce((best, current) => {
      const bestCapabilities = best.getCapabilities();
      const currentCapabilities = current?.getCapabilities();

      const bestMatches = task.requirements.capabilities.filter((req) =>
        bestCapabilities.some((cap) => cap.name === req)
      ).length;

      const currentMatches = task.requirements.capabilities.filter((req) =>
        currentCapabilities?.some((cap) => cap.name === req)
      ).length;

      return bestMatches >= currentMatches ? best : current;
    });
  }

  private updateGroupCapabilities(): void {
    const allCapabilities = new Map<string, AgentCapability>();

    // Collect all unique capabilities from members
    for (const member of Array.from(this.members.values())) {
      const capabilities = member.getCapabilities();
      if (capabilities && Array.isArray(capabilities)) {
        capabilities.forEach((cap) => {
          allCapabilities.set(cap.name, cap);
        });
      }
    }

    // Add group-specific capabilities
    for (const [name, cap] of Array.from(this.groupCapabilities.entries())) {
      allCapabilities.set(name, cap);
    }

    this.groupCapabilities = allCapabilities;
  }

  private aggregateResources(
    resourcesList: ResourceRequirements[]
  ): ResourceRequirements {
    return resourcesList
      .filter((resources) => resources != null)
      .reduce(
        (total, resources) => ({
          cpu: total.cpu + (resources.cpu || 0),
          memory: total.memory + (resources.memory || 0),
          network: total.network + (resources.network || 0),
          storage: total.storage + (resources.storage || 0),
        }),
        { cpu: 0, memory: 0, network: 0, storage: 0 }
      );
  }
}

// Hierarchical agent group for complex organizational structures
export class HierarchicalAgentGroup extends AgentGroup {
  private subGroups: Map<string, AgentGroup> = new Map();
  private maxDepth: number = 3;
  private currentDepth: number = 0;

  constructor(
    id: string,
    name: string,
    members: AgentComponent[] = [],
    maxDepth: number = 3,
    currentDepth: number = 0
  ) {
    super(id, name, members);
    this.maxDepth = maxDepth;
    this.currentDepth = currentDepth;

    // Populate subGroups from members that are AgentGroups
    for (const member of members) {
      if (member instanceof AgentGroup) {
        this.subGroups.set(member.getId(), member);
      }
    }
  }

  addSubGroup(subGroup: AgentGroup): void {
    if (this.currentDepth >= this.maxDepth) {
      throw new Error(`Maximum hierarchy depth (${this.maxDepth}) exceeded`);
    }

    this.subGroups.set(subGroup.getId(), subGroup);
    this.addMember(subGroup); // Also add as a regular member for uniform treatment

    this.emit('hierarchy:subgroup_added', {
      groupId: this.getId(),
      subGroupId: subGroup.getId(),
      depth: this.currentDepth + 1,
    });
  }

  removeSubGroup(subGroupId: string): boolean {
    const subGroup = this.subGroups.get(subGroupId);
    if (!subGroup) return false;

    this.subGroups.delete(subGroupId);
    this.removeMember(subGroupId);

    this.emit('hierarchy:subgroup_removed', {
      groupId: this.getId(),
      subGroupId,
      depth: this.currentDepth,
    });

    return true;
  }

  getSubGroups(): AgentGroup[] {
    return Array.from(this.subGroups.values());
  }

  getHierarchyDepth(): number {
    if (this.subGroups.size === 0) {
      // If no subgroups, check if we have individual agents as members
      const hasIndividualMembers = this.getMembers().some(
        (m) => m.getType() === 'individual'
      );
      return hasIndividualMembers ? this.currentDepth + 1 : this.currentDepth;
    }

    let maxDepth = this.currentDepth;

    for (const subGroup of Array.from(this.subGroups.values())) {
      if (subGroup instanceof HierarchicalAgentGroup) {
        maxDepth = Math.max(maxDepth, 1 + subGroup.getHierarchyDepth());
      } else {
        // Regular AgentGroup: check if it has individual agents = +2 levels
        // (1 for the subGroup level, +1 for individual agents inside it)
        const subGroupMembers = subGroup.getMembers();
        const hasIndividuals = subGroupMembers.some(
          (m) => m.getType() === 'individual'
        );
        maxDepth = Math.max(
          maxDepth,
          this.currentDepth + (hasIndividuals ? 2 : 1)
        );
      }
    }

    return maxDepth;
  }

  getTotalAgentCount(): number {
    let count = 0;

    for (const member of this.getMembers()) {
      if (member.getType() === 'individual') {
        count++;
      } else if (member instanceof HierarchicalAgentGroup) {
        count += member.getTotalAgentCount();
      } else if (member instanceof AgentGroup) {
        count += member.getTotalAgentCount();
      }
    }

    return count;
  }

  override getStatus(): CompositeStatus {
    const baseStatus = super.getStatus();
    return {
      ...baseStatus,
      hierarchyDepth: this.getHierarchyDepth(),
    };
  }

  // Override task execution to support hierarchical delegation
  override async executeTask(task: TaskDefinition): Promise<TaskResult> {
    // Try to delegate to most appropriate level in hierarchy
    const bestHandler = this.findBestHandlerInHierarchy(task);

    if (!bestHandler) {
      throw new Error(
        `No suitable handler found in hierarchy for task ${task.id}`
      );
    }

    return bestHandler.executeTask(task);
  }

  private findBestHandlerInHierarchy(
    task: TaskDefinition
  ): AgentComponent | null {
    // First, try individual agents at this level
    const individualAgents = this.getMembers().filter(
      (m) => m.getType() === 'individual'
    );
    const capableIndividuals = individualAgents.filter((agent) =>
      agent.canHandleTask(task)
    );

    if (capableIndividuals.length > 0) {
      return (
        this.selectByCapability(capableIndividuals, task) ||
        capableIndividuals[0]
      );
    }

    // Then, try subgroups
    for (const subGroup of Array.from(this.subGroups.values())) {
      if (subGroup.canHandleTask(task)) {
        return subGroup;
      }
    }

    // If no specific handlers found, try any available member as fallback
    const availableMembers = this.getMembers().filter((m) => {
      const status = m.getStatus();
      const hasState = 'state' in status && status.state;
      const isAvailable = hasState
        ? (status as any).state !== 'offline'
        : 'state' in status && (status as any).state !== 'inactive';
      return isAvailable;
    });

    if (availableMembers.length > 0) {
      return availableMembers[0];
    }

    return null;
  }
}

// Factory for creating agents and groups
export class AgentFactory {
  static createAgent(
    id: string,
    name: string,
    capabilities: AgentCapability[],
    resourceLimits?: ResourceRequirements
  ): Agent {
    return new Agent(id, name, capabilities, resourceLimits);
  }

  static createGroup(
    id: string,
    name: string,
    members: AgentComponent[] = []
  ): AgentGroup {
    return new AgentGroup(id, name, members);
  }

  // Alias for createGroup to match test expectations
  static createAgentGroup(
    id: string,
    name: string,
    members: AgentComponent[] = []
  ): AgentGroup {
    return new AgentGroup(id, name, members);
  }

  static createHierarchicalGroup(
    id: string,
    name: string,
    members: AgentComponent[] = [],
    maxDepth: number = 3,
    currentDepth: number = 0
  ): HierarchicalAgentGroup {
    return new HierarchicalAgentGroup(
      id,
      name,
      members,
      maxDepth,
      currentDepth
    );
  }

  static createCapability(
    name: string,
    version: string = '1.0.0',
    description: string = '',
    parameters?: Record<string, unknown>,
    requiredResources?: ResourceRequirements
  ): AgentCapability {
    const capability: AgentCapability = {
      name,
      version,
      description,
    };

    if (parameters !== undefined) {
      capability.parameters = parameters;
    }

    if (requiredResources !== undefined) {
      capability.resourceRequirements = requiredResources;
    }

    return capability;
  }
}
