/**
 * @file Composite Pattern Implementation for Agent Hierarchies
 * Provides uniform interfaces for individual agents and agent groups
 */

import { EventEmitter } from 'node:events';

// Core agent interfaces
export interface AgentCapability {
  name: string;
  version: string;
  description: string;
  parameters?: Record<string, any>;
  requiredResources?: ResourceRequirements;
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
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiredCapabilities: string[];
  inputs: Record<string, any>;
  expectedOutputs: string[];
  timeout?: number;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export interface TaskResult {
  taskId: string;
  agentId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startTime: Date;
  endTime?: Date;
  outputs?: Record<string, any>;
  error?: string;
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
  lastActivity: Date;
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

// Composite pattern base interface
export interface AgentComponent extends EventEmitter {
  getId(): string;
  getName(): string;
  getType(): 'individual' | 'group';
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
  initialize(config: any): Promise<void>;
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

  constructor(
    id: string,
    name: string,
    initialCapabilities: AgentCapability[] = [],
    resourceLimits: ResourceRequirements = { cpu: 1.0, memory: 1024, network: 100, storage: 1024 }
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
      lastActivity: new Date(),
      resources: {
        allocated: { cpu: 0, memory: 0, network: 0, storage: 0 },
        used: { cpu: 0, memory: 0, network: 0, storage: 0 },
        available: { ...resourceLimits },
        efficiency: 1.0,
      },
    };
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): 'individual' | 'group' {
    return 'individual';
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.capabilities.values());
  }

  getStatus(): AgentStatus {
    return { ...this.status };
  }

  getMetrics(): AgentMetrics {
    const successRate =
      this.status.completedTasks > 0
        ? this.status.completedTasks / (this.status.completedTasks + this.status.failedTasks)
        : 1.0;

    const avgExecutionTime =
      this.taskHistory.length > 0
        ? this.taskHistory
            .filter((t) => t.metrics?.executionTime)
            .reduce((sum, t) => sum + t.metrics?.executionTime, 0) / this.taskHistory.length
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
    if (!this.canHandleTask(task)) {
      throw new Error(`Agent ${this.id} cannot handle task ${task.id}`);
    }

    if (this.status.state === 'busy' && this.maxConcurrentTasks <= 1) {
      // Queue the task
      this.taskQueue.push(task);
      this.status.queuedTasks = this.taskQueue.length;

      return {
        taskId: task.id,
        agentId: this.id,
        status: 'pending',
        startTime: new Date(),
      };
    }

    return this.executeTaskImmediately(task);
  }

  canHandleTask(task: TaskDefinition): boolean {
    // Check if agent has required capabilities
    const hasCapabilities = task.requiredCapabilities.every((reqCap) =>
      this.capabilities.has(reqCap)
    );

    if (!hasCapabilities) return false;

    // Check resource requirements
    const requiredResources = this.estimateTaskResources(task);
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

  getAvailableResources(): ResourceRequirements {
    return { ...this.status.resources.available };
  }

  async initialize(config: any): Promise<void> {
    this.config = config;
    this.status.state = 'idle';
    this.status.lastActivity = new Date();

    // Apply configuration
    if (config.maxConcurrentTasks) {
      this.maxConcurrentTasks = config.maxConcurrentTasks;
    }

    if (config.capabilities) {
      config.capabilities.forEach((cap: AgentCapability) => {
        this.addCapability(cap);
      });
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
  private async executeTaskImmediately(task: TaskDefinition): Promise<TaskResult> {
    const startTime = new Date();
    const requiredResources = this.estimateTaskResources(task);

    if (!this.allocateResources(requiredResources)) {
      throw new Error('Cannot allocate required resources');
    }

    this.currentTask = task;
    this.status.state = 'busy';
    this.status.lastActivity = startTime;

    const result: TaskResult = {
      taskId: task.id,
      agentId: this.id,
      status: 'running',
      startTime,
    };

    try {
      // Simulate task execution based on capabilities
      const executionTime = this.estimateExecutionTime(task);
      const outputs = await this.performTaskExecution(task, executionTime);

      const endTime = new Date();
      result.status = 'completed';
      result.endTime = endTime;
      result.outputs = outputs;
      result.metrics = {
        executionTime: endTime.getTime() - startTime.getTime(),
        resourceUsage: requiredResources,
        memoryPeak: requiredResources.memory * 0.8,
        cpuPeak: requiredResources.cpu * 0.9,
        networkUsage: requiredResources.network * 0.6,
        errorCount: 0,
        retryCount: 0,
      };

      this.status.completedTasks++;
      this.updateHealth(true);
    } catch (error) {
      const endTime = new Date();
      result.status = 'failed';
      result.endTime = endTime;
      result.error = (error as Error).message;
      result.metrics = {
        executionTime: endTime.getTime() - startTime.getTime(),
        resourceUsage: requiredResources,
        memoryPeak: 0,
        cpuPeak: 0,
        networkUsage: 0,
        errorCount: 1,
        retryCount: 0,
      };

      this.status.failedTasks++;
      this.updateHealth(false);
    } finally {
      this.releaseResources(requiredResources);
      this.currentTask = undefined;
      this.status.state = 'idle';
      this.taskHistory.push(result);

      // Process next task in queue
      await this.processTaskQueue();
    }

    this.emit('task:completed', result);
    return result;
  }

  private async performTaskExecution(
    task: TaskDefinition,
    executionTime: number
  ): Promise<Record<string, any>> {
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
    // Base resource requirements
    let cpu = 0.1;
    let memory = 64;
    let network = 10;
    let storage = 10;

    // Adjust based on task type and capabilities
    task.requiredCapabilities.forEach((capName) => {
      const capability = this.capabilities.get(capName);
      if (capability?.requiredResources) {
        cpu += capability.requiredResources.cpu;
        memory += capability.requiredResources.memory;
        network += capability.requiredResources.network;
        storage += capability.requiredResources.storage;
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
    baseTime += task.requiredCapabilities.length * 50;

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
    const totalAllocated = allocated.cpu + allocated.memory + allocated.network + allocated.storage;
    const totalLimits =
      this.resourceLimits.cpu +
      this.resourceLimits.memory +
      this.resourceLimits.network +
      this.resourceLimits.storage;
    this.status.resources.efficiency = totalLimits > 0 ? 1 - totalAllocated / totalLimits : 1;
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
        status: 'cancelled',
        startTime: new Date(),
        endTime: new Date(),
        error: 'Task cancelled due to agent shutdown',
      };

      this.taskHistory.push(result);
      this.emit('task:cancelled', result);
    }
  }

  private generateWeeklyActivity(): number[] {
    // Generate mock weekly activity data
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 10));
  }
}

// Composite status and metrics interfaces
export interface CompositeStatus {
  id: string;
  state: 'active' | 'partial' | 'inactive';
  health: number;
  memberCount: number;
  activeMemberCount: number;
  totalQueuedTasks: number;
  totalCompletedTasks: number;
  totalFailedTasks: number;
  lastActivity: Date;
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
  private loadBalancingStrategy: 'round-robin' | 'least-loaded' | 'capability-based' =
    'capability-based';
  private currentRoundRobinIndex = 0;

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

  getType(): 'individual' | 'group' {
    return 'group';
  }

  getCapabilities(): AgentCapability[] {
    return Array.from(this.groupCapabilities.values());
  }

  getStatus(): CompositeStatus {
    const memberStatuses = Array.from(this.members.values()).map((member) => member.getStatus());
    const individualStatuses = memberStatuses.filter((s) => 'state' in s) as AgentStatus[];
    const compositeStatuses = memberStatuses.filter((s) => 'memberCount' in s) as CompositeStatus[];

    const activeMemberCount =
      individualStatuses.filter((s) => s.state !== 'offline').length +
      compositeStatuses.filter((s) => s.state !== 'inactive').length;

    const totalHealth = [
      ...individualStatuses.map((s) => s.health),
      ...compositeStatuses.map((s) => s.health),
    ];
    const avgHealth =
      totalHealth.length > 0 ? totalHealth.reduce((sum, h) => sum + h, 0) / totalHealth.length : 1;

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
        ? individualStatuses.reduce((sum, s) => sum + s.resources.efficiency, 0) /
          individualStatuses.length
        : 1;

    const lastActivity = new Date(
      Math.max(
        ...memberStatuses.map((s) => ('lastActivity' in s ? s.lastActivity.getTime() : Date.now()))
      )
    );

    return {
      id: this.id,
      state:
        activeMemberCount === 0
          ? 'inactive'
          : activeMemberCount === this.members.size
            ? 'active'
            : 'partial',
      health: avgHealth,
      memberCount: this.members.size,
      activeMemberCount,
      totalQueuedTasks,
      totalCompletedTasks,
      totalFailedTasks,
      lastActivity,
      resources: {
        totalAllocated,
        totalAvailable,
        averageEfficiency: avgEfficiency,
      },
    };
  }

  getMetrics(): CompositeMetrics {
    const memberMetrics = Array.from(this.members.values()).map((member) => member.getMetrics());

    const totalTasks = memberMetrics.reduce((sum, m) => sum + m.totalTasks, 0);
    const weightedSuccessRate =
      memberMetrics.reduce((sum, m) => sum + m.successRate * m.totalTasks, 0) / totalTasks || 1;
    const avgExecutionTime =
      memberMetrics.reduce((sum, m) => sum + m.averageExecutionTime, 0) / memberMetrics.length || 0;
    const avgResourceEfficiency =
      memberMetrics.reduce((sum, m) => sum + m.resourceEfficiency, 0) / memberMetrics.length || 1;
    const avgReliability =
      memberMetrics.reduce((sum, m) => sum + m.reliability, 0) / memberMetrics.length || 1;

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
          } else {
            // AgentStatus
            return status.state !== 'offline';
          }
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
      const result = await selectedAgent.executeTask(task);
      this.emit('task:delegated', {
        taskId: task.id,
        selectedAgentId: selectedAgent.getId(),
        groupId: this.id,
      });
      return result;
    } catch (error) {
      this.emit('task:delegation_failed', {
        taskId: task.id,
        selectedAgentId: selectedAgent.getId(),
        groupId: this.id,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  canHandleTask(task: TaskDefinition): boolean {
    // Check if any member can handle the task
    return Array.from(this.members.values()).some((member) => member.canHandleTask(task));
  }

  addCapability(capability: AgentCapability): void {
    this.groupCapabilities.set(capability.name, capability);
    this.emit('group:capability_added', { groupId: this.id, capability });
  }

  removeCapability(capabilityName: string): void {
    const removed = this.groupCapabilities.delete(capabilityName);
    if (removed) {
      this.emit('group:capability_removed', { groupId: this.id, capabilityName });
    }
  }

  allocateResources(requirements: ResourceRequirements): boolean {
    // Try to find a member that can allocate the resources
    for (const member of this.members.values()) {
      if (member.allocateResources(requirements)) {
        return true;
      }
    }
    return false;
  }

  releaseResources(requirements: ResourceRequirements): void {
    // This is a simplified implementation - in practice, you'd track which member allocated what
    for (const member of this.members.values()) {
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

  async initialize(config: any): Promise<void> {
    // Initialize all members
    const initPromises = Array.from(this.members.values()).map((member) =>
      member
        .initialize(config)
        .catch((error) => console.error(`Failed to initialize member ${member.getId()}:`, error))
    );

    await Promise.allSettled(initPromises);
    this.emit('group:initialized', { groupId: this.id, memberCount: this.members.size });
  }

  async shutdown(): Promise<void> {
    // Shutdown all members
    const shutdownPromises = Array.from(this.members.values()).map((member) =>
      member
        .shutdown()
        .catch((error) => console.error(`Failed to shutdown member ${member.getId()}:`, error))
    );

    await Promise.allSettled(shutdownPromises);
    this.emit('group:shutdown', { groupId: this.id });
  }

  async pause(): Promise<void> {
    // Pause all members
    const pausePromises = Array.from(this.members.values()).map((member) => member.pause());
    await Promise.allSettled(pausePromises);
    this.emit('group:paused', { groupId: this.id });
  }

  async resume(): Promise<void> {
    // Resume all members
    const resumePromises = Array.from(this.members.values()).map((member) => member.resume());
    await Promise.allSettled(resumePromises);
    this.emit('group:resumed', { groupId: this.id });
  }

  // Group-specific methods
  addMember(member: AgentComponent): void {
    this.members.set(member.getId(), member);
    this.updateGroupCapabilities();

    // Forward member events
    member.on('task:completed', (result) => {
      this.emit('member:task_completed', { groupId: this.id, memberId: member.getId(), result });
    });

    this.emit('group:member_added', { groupId: this.id, memberId: member.getId() });
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

  setLoadBalancingStrategy(strategy: 'round-robin' | 'least-loaded' | 'capability-based'): void {
    this.loadBalancingStrategy = strategy;
    this.emit('group:strategy_changed', { groupId: this.id, strategy });
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
        metadata: { ...task.metadata, originalTaskId: task.id, memberId: member.getId() },
      };

      return member.executeTask(memberTask);
    });

    const results = await Promise.allSettled(taskPromises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          taskId: `${task.id}-${index}`,
          agentId: eligibleMembers[index].getId(),
          status: 'failed' as const,
          startTime: new Date(),
          endTime: new Date(),
          error: result.reason.message,
        };
      }
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
        return eligibleMembers[0];
    }
  }

  private selectRoundRobin(eligibleMembers: AgentComponent[]): AgentComponent {
    const selected = eligibleMembers[this.currentRoundRobinIndex % eligibleMembers.length];
    this.currentRoundRobinIndex++;
    return selected;
  }

  private selectLeastLoaded(eligibleMembers: AgentComponent[]): AgentComponent {
    return eligibleMembers.reduce((least, current) => {
      const leastStatus = least.getStatus();
      const currentStatus = current.getStatus();

      const leastLoad = 'queuedTasks' in leastStatus ? leastStatus.queuedTasks : 0;
      const currentLoad = 'queuedTasks' in currentStatus ? currentStatus.queuedTasks : 0;

      return leastLoad <= currentLoad ? least : current;
    });
  }

  protected selectByCapability(
    eligibleMembers: AgentComponent[],
    task: TaskDefinition
  ): AgentComponent {
    // Select member with the most matching capabilities
    return eligibleMembers.reduce((best, current) => {
      const bestCapabilities = best.getCapabilities();
      const currentCapabilities = current.getCapabilities();

      const bestMatches = task.requiredCapabilities.filter((req) =>
        bestCapabilities.some((cap) => cap.name === req)
      ).length;

      const currentMatches = task.requiredCapabilities.filter((req) =>
        currentCapabilities.some((cap) => cap.name === req)
      ).length;

      return bestMatches >= currentMatches ? best : current;
    });
  }

  private updateGroupCapabilities(): void {
    const allCapabilities = new Map<string, AgentCapability>();

    // Collect all unique capabilities from members
    for (const member of this.members.values()) {
      member.getCapabilities().forEach((cap) => {
        allCapabilities.set(cap.name, cap);
      });
    }

    // Add group-specific capabilities
    for (const [name, cap] of this.groupCapabilities) {
      allCapabilities.set(name, cap);
    }

    this.groupCapabilities = allCapabilities;
  }

  private aggregateResources(resourcesList: ResourceRequirements[]): ResourceRequirements {
    return resourcesList.reduce(
      (total, resources) => ({
        cpu: total.cpu + resources.cpu,
        memory: total.memory + resources.memory,
        network: total.network + resources.network,
        storage: total.storage + resources.storage,
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
    let maxDepth = this.currentDepth;

    for (const subGroup of this.subGroups.values()) {
      if (subGroup instanceof HierarchicalAgentGroup) {
        maxDepth = Math.max(maxDepth, subGroup.getHierarchyDepth());
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
      }
    }

    return count;
  }

  // Override task execution to support hierarchical delegation
  async executeTask(task: TaskDefinition): Promise<TaskResult> {
    // Try to delegate to most appropriate level in hierarchy
    const bestHandler = this.findBestHandlerInHierarchy(task);

    if (!bestHandler) {
      throw new Error(`No suitable handler found in hierarchy for task ${task.id}`);
    }

    return bestHandler.executeTask(task);
  }

  private findBestHandlerInHierarchy(task: TaskDefinition): AgentComponent | null {
    // First, try individual agents at this level
    const individualAgents = this.getMembers().filter((m) => m.getType() === 'individual');
    const capableIndividuals = individualAgents.filter((agent) => agent.canHandleTask(task));

    if (capableIndividuals.length > 0) {
      return this.selectByCapability(capableIndividuals, task);
    }

    // Then, try subgroups
    for (const subGroup of this.subGroups.values()) {
      if (subGroup.canHandleTask(task)) {
        return subGroup;
      }
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

  static createGroup(id: string, name: string, members: AgentComponent[] = []): AgentGroup {
    return new AgentGroup(id, name, members);
  }

  static createHierarchicalGroup(
    id: string,
    name: string,
    members: AgentComponent[] = [],
    maxDepth: number = 3,
    currentDepth: number = 0
  ): HierarchicalAgentGroup {
    return new HierarchicalAgentGroup(id, name, members, maxDepth, currentDepth);
  }

  static createCapability(
    name: string,
    version: string = '1.0.0',
    description: string = '',
    parameters?: Record<string, any>,
    requiredResources?: ResourceRequirements
  ): AgentCapability {
    return {
      name,
      version,
      description,
      parameters,
      requiredResources,
    };
  }
}
