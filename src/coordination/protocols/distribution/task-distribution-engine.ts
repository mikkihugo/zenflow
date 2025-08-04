/**
 * Advanced Task Distribution Engine
 * Provides intelligent task decomposition, optimal agent assignment,
 * dynamic work redistribution, and priority-based scheduling
 */

import { EventEmitter } from 'node:events';
import type { IEventBus } from '@core/event-bus';
import type { ILogger } from '@core/logger';

// Core types for task distribution
export interface TaskDefinition {
  id: string;
  name: string;
  description: string;
  type: string;
  priority: TaskPriority;
  complexity: TaskComplexity;
  requirements: TaskRequirements;
  constraints: TaskConstraints;
  dependencies: TaskDependency[];
  estimatedDuration: number;
  deadline?: Date;
  metadata: Record<string, unknown>;
  created: Date;
  submittedBy: string;
}

export interface TaskDependency {
  taskId: string;
  type: 'blocking' | 'soft' | 'data' | 'resource';
  weight: number;
  condition?: string;
}

export interface TaskRequirements {
  capabilities: string[];
  minAgents: number;
  maxAgents: number;
  preferredAgents?: string[];
  excludedAgents?: string[];
  resourceRequirements: ResourceRequirements;
  qualityRequirements: QualityRequirements;
}

export interface ResourceRequirements {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  gpu?: number;
  specializedTools?: string[];
}

export interface QualityRequirements {
  accuracy: number;
  speed: number;
  reliability: number;
  completeness: number;
}

export interface TaskConstraints {
  startAfter?: Date;
  completeBefore?: Date;
  maxRetries: number;
  timeoutMs: number;
  isolationLevel: 'none' | 'process' | 'container' | 'vm';
  securityLevel: 'low' | 'medium' | 'high' | 'critical';
}

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent' | 'critical';
export type TaskComplexity = 'trivial' | 'simple' | 'moderate' | 'complex' | 'expert';
export type TaskStatus =
  | 'pending'
  | 'queued'
  | 'assigned'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type CancellationReason =
  | 'user-request'
  | 'timeout'
  | 'resource-unavailable'
  | 'dependency-failure'
  | 'priority-override'
  | 'system-shutdown'
  | 'agent-failure'
  | 'task_stuck'
  | 'agent_unavailable';

export interface DecomposedTask {
  id: string;
  parentId: string;
  subtasks: SubTask[];
  executionPlan: ExecutionPlan;
  coordination: CoordinationStrategy;
}

export interface SubTask {
  id: string;
  name: string;
  description: string;
  type: string;
  requirements: TaskRequirements;
  dependencies: string[];
  estimatedDuration: number;
  criticalPath: boolean;
  parallelizable: boolean;
  order: number;
}

export interface ExecutionPlan {
  strategy: 'sequential' | 'parallel' | 'pipeline' | 'adaptive';
  phases: ExecutionPhase[];
  checkpoints: Checkpoint[];
  rollbackPlan: RollbackStep[];
}

export interface ExecutionPhase {
  id: string;
  name: string;
  subtasks: string[];
  parallelism: number;
  timeout: number;
  successCriteria: string[];
}

export interface Checkpoint {
  id: string;
  afterPhase: string;
  validationRules: ValidationRule[];
  rollbackTriggers: string[];
}

export interface ValidationRule {
  condition: string;
  severity: 'warning' | 'error' | 'critical';
  action: 'continue' | 'pause' | 'rollback' | 'fail';
}

export interface RollbackStep {
  action: string;
  parameters: Record<string, unknown>;
  timeout: number;
}

export interface CoordinationStrategy {
  type: 'centralized' | 'distributed' | 'hierarchical' | 'peer-to-peer';
  coordinator?: string;
  communicationPattern: 'broadcast' | 'multicast' | 'point-to-point' | 'gossip';
  syncPoints: string[];
  conflictResolution: 'priority' | 'consensus' | 'coordinator' | 'voting';
}

export interface AgentCapability {
  agentId: string;
  capabilities: string[];
  currentLoad: number;
  maxLoad: number;
  performance: PerformanceProfile;
  availability: AvailabilityProfile;
  trustScore: number;
  specializations: string[];
  cost: number;
}

export interface PerformanceProfile {
  taskTypes: Record<string, PerformanceMetrics>;
  overall: PerformanceMetrics;
  trends: PerformanceTrend[];
}

export interface PerformanceMetrics {
  successRate: number;
  averageTime: number;
  qualityScore: number;
  efficiency: number;
  reliability: number;
  lastUpdated: Date;
  sampleSize: number;
}

export interface PerformanceTrend {
  metric: string;
  direction: 'improving' | 'stable' | 'declining';
  slope: number;
  confidence: number;
}

export interface AvailabilityProfile {
  currentStatus: 'available' | 'busy' | 'maintenance' | 'offline';
  utilization: number;
  predictedAvailability: PredictedSlot[];
  workingHours?: { start: number; end: number };
  maintenanceWindows: TimeWindow[];
}

export interface PredictedSlot {
  start: Date;
  end: Date;
  probability: number;
  capacity: number;
}

export interface TimeWindow {
  start: Date;
  end: Date;
  recurring?: 'daily' | 'weekly' | 'monthly';
  description?: string;
}

export interface TaskAssignment {
  taskId: string;
  agentId: string;
  assignedAt: Date;
  expectedCompletion: Date;
  assignment: AssignmentDetails;
  monitoring: AssignmentMonitoring;
}

export interface AssignmentDetails {
  confidence: number;
  reasoning: string[];
  alternativeAgents: string[];
  resourceAllocation: ResourceAllocation;
  qualityExpectation: QualityExpectation;
}

export interface ResourceAllocation {
  cpu: number;
  memory: number;
  network: number;
  storage: number;
  gpu?: number;
  priority: number;
}

export interface QualityExpectation {
  accuracy: number;
  speed: number;
  completeness: number;
  confidence: number;
}

export interface AssignmentMonitoring {
  checkInterval: number;
  progressTracking: boolean;
  qualityChecks: QualityCheck[];
  escalationTriggers: EscalationTrigger[];
}

export interface QualityCheck {
  checkType: 'progress' | 'output' | 'resource' | 'performance';
  frequency: number;
  threshold: number;
  action: 'warn' | 'escalate' | 'reassign' | 'terminate';
}

export interface EscalationTrigger {
  condition: string;
  threshold: number;
  action: 'notify' | 'reassign' | 'add_agents' | 'priority_boost';
  target?: string;
}

export interface DistributionMetrics {
  totalTasks: number;
  queuedTasks: number;
  runningTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgWaitTime: number;
  avgExecutionTime: number;
  agentUtilization: Record<string, number>;
  throughput: number;
  successRate: number;
  loadBalance: number;
  resourceEfficiency: number;
}

/**
 * Advanced Task Distribution Engine with ML-based optimization
 */
export class TaskDistributionEngine extends EventEmitter {
  private tasks = new Map<string, TaskDefinition>();
  private decomposedTasks = new Map<string, DecomposedTask>();
  private assignments = new Map<string, TaskAssignment>();
  private agentCapabilities = new Map<string, AgentCapability>();
  private queue: TaskQueue;
  private scheduler: TaskScheduler;
  private decomposer: TaskDecomposer;
  private assignmentOptimizer: AssignmentOptimizer;
  private workloadBalancer: WorkloadBalancer;
  private performancePredictor: PerformancePredictor;
  private failureHandler: FailureHandler;
  private metrics: DistributionMetrics;
  private processingInterval?: NodeJS.Timeout;

  constructor(
    private config: {
      maxConcurrentTasks: number;
      defaultTimeout: number;
      qualityThreshold: number;
      loadBalanceTarget: number;
      enablePredictiveAssignment: boolean;
      enableDynamicRebalancing: boolean;
    },
    private logger: ILogger,
    private eventBus: IEventBus
  ) {
    super();

    this.queue = new TaskQueue(this.logger);
    this.scheduler = new TaskScheduler(this.config, this.logger);
    this.decomposer = new TaskDecomposer(this.logger);
    this.assignmentOptimizer = new AssignmentOptimizer(this.config, this.logger);
    this.workloadBalancer = new WorkloadBalancer(this.config, this.logger);
    this.performancePredictor = new PerformancePredictor(this.logger);
    this.failureHandler = new FailureHandler(this.logger);

    this.metrics = this.initializeMetrics();
    this.setupEventHandlers();
    this.startProcessing();
  }

  private setupEventHandlers(): void {
    this.eventBus.on('agent:registered', (data: any) => {
      this.handleAgentRegistration(data);
    });

    this.eventBus.on('agent:capabilities-updated', (data: any) => {
      this.handleAgentCapabilitiesUpdate(data);
    });

    this.eventBus.on('agent:performance-update', (data: any) => {
      this.handleAgentPerformanceUpdate(data);
    });

    this.eventBus.on('task:progress-update', (data: any) => {
      this.handleTaskProgressUpdate(data);
    });

    this.eventBus.on('task:completed', (data: any) => {
      this.handleTaskCompletion(data);
    });

    this.eventBus.on('task:failed', (data: any) => {
      this.handleTaskFailure(data);
    });

    this.eventBus.on('agent:unavailable', (data: any) => {
      this.handleAgentUnavailable(data);
    });
  }

  /**
   * Submit a task for distribution
   */
  async submitTask(taskDef: Omit<TaskDefinition, 'id' | 'created'>): Promise<string> {
    const task: TaskDefinition = {
      ...taskDef,
      id: this.generateTaskId(),
      created: new Date(),
    };

    this.tasks.set(task.id, task);
    this.metrics.totalTasks++;

    this.logger.info('Task submitted for distribution', {
      taskId: task.id,
      name: task.name,
      priority: task.priority,
      complexity: task.complexity,
    });

    // Decompose complex tasks
    if (task.complexity === 'complex' || task.complexity === 'expert') {
      const decomposed = await this.decomposer.decompose(task);
      this.decomposedTasks.set(task.id, decomposed);

      // Submit subtasks
      for (const subtask of decomposed.subtasks) {
        await this.queue.enqueue(this.subtaskToTask(subtask, task.id));
      }
    } else {
      await this.queue.enqueue(task);
    }

    this.emit('task:submitted', { taskId: task.id, task });
    return task.id;
  }

  /**
   * Register an agent's capabilities
   */
  async registerAgent(agentCapability: AgentCapability): Promise<void> {
    this.agentCapabilities.set(agentCapability.agentId, agentCapability);

    this.logger.info('Agent registered for task distribution', {
      agentId: agentCapability.agentId,
      capabilities: agentCapability.capabilities,
      maxLoad: agentCapability.maxLoad,
    });

    this.emit('agent:registered', { agentId: agentCapability.agentId });

    // Trigger assignment optimization
    await this.optimizeAssignments();
  }

  /**
   * Get current distribution metrics
   */
  getMetrics(): DistributionMetrics {
    return { ...this.metrics };
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): TaskStatus | undefined {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;

    const assignment = this.assignments.get(taskId);
    if (!assignment) return 'pending';

    // Status would be tracked through agent feedback
    return 'assigned'; // Simplified
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string, reason: CancellationReason): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    const assignment = this.assignments.get(taskId);
    if (assignment) {
      // Notify agent to cancel
      this.eventBus.emit('task:cancel', {
        taskId,
        agentId: assignment.agentId,
        reason,
        cancelledBy: 'task-distribution-engine',
        rollbackRequired: true,
        affectedDependencies: [],
        timestamp: new Date(),
        source: 'task-distribution-engine',
        id: `task-cancel-${taskId}-${Date.now()}`,
        version: '1.0.0',
      });
    }

    await this.queue.remove(taskId);
    this.assignments.delete(taskId);

    this.logger.info('Task cancelled', { taskId, reason });
    this.emit('task:cancelled', { taskId, reason });

    return true;
  }

  /**
   * Reassign a task to a different agent
   */
  async reassignTask(taskId: string, reason: CancellationReason): Promise<boolean> {
    const task = this.tasks.get(taskId);
    const currentAssignment = this.assignments.get(taskId);

    if (!task || !currentAssignment) return false;

    // Remove current assignment
    this.assignments.delete(taskId);

    // Update agent availability
    const agent = this.agentCapabilities.get(currentAssignment.agentId);
    if (agent) {
      agent.currentLoad = Math.max(0, agent.currentLoad - 1);
    }

    // Re-queue for assignment
    await this.queue.enqueue(task);

    this.logger.info('Task reassigned', {
      taskId,
      reason,
      previousAgent: currentAssignment.agentId,
    });
    this.emit('task:reassigned', { taskId, reason, previousAgent: currentAssignment.agentId });

    return true;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): {
    pending: number;
    processing: number;
    agents: {
      available: number;
      busy: number;
      offline: number;
      utilization: Record<string, number>;
    };
  } {
    const pendingTasks = this.queue.size();
    const processingTasks = this.assignments.size;

    let availableAgents = 0;
    let busyAgents = 0;
    let offlineAgents = 0;
    const utilization: Record<string, number> = {};

    for (const [agentId, agent] of this.agentCapabilities) {
      utilization[agentId] = agent.currentLoad / agent.maxLoad;

      switch (agent.availability.currentStatus) {
        case 'available':
          availableAgents++;
          break;
        case 'busy':
          busyAgents++;
          break;
        case 'offline':
          offlineAgents++;
          break;
      }
    }

    return {
      pending: pendingTasks,
      processing: processingTasks,
      agents: {
        available: availableAgents,
        busy: busyAgents,
        offline: offlineAgents,
        utilization,
      },
    };
  }

  private startProcessing(): void {
    this.processingInterval = setInterval(async () => {
      await this.processQueue();
      await this.updateMetrics();
      await this.performHealthChecks();

      if (this.config.enableDynamicRebalancing) {
        await this.rebalanceWorkload();
      }
    }, 1000); // Process every second
  }

  private async processQueue(): Promise<void> {
    const availableAgents = Array.from(this.agentCapabilities.values()).filter(
      (agent) =>
        agent.availability.currentStatus === 'available' && agent.currentLoad < agent.maxLoad
    );

    if (availableAgents.length === 0) return;

    const tasksToAssign = await this.queue.getNext(availableAgents.length);

    for (const task of tasksToAssign) {
      try {
        const assignment = await this.findOptimalAssignment(task, availableAgents);
        if (assignment) {
          await this.assignTask(task, assignment);
        } else {
          // No suitable agent found, re-queue
          await this.queue.enqueue(task);
        }
      } catch (error) {
        this.logger.error('Failed to process task', { taskId: task.id, error });
        await this.handleTaskFailure({ taskId: task.id, error: error as Error });
      }
    }
  }

  private async findOptimalAssignment(
    task: TaskDefinition,
    availableAgents: AgentCapability[]
  ): Promise<AgentCapability | null> {
    // Filter agents by capabilities
    const suitableAgents = availableAgents.filter((agent) => this.isAgentSuitable(agent, task));

    if (suitableAgents.length === 0) return null;

    // Use ML-based assignment optimization
    const optimizedAssignment = await this.assignmentOptimizer.findOptimalAssignment(
      task,
      suitableAgents,
      this.assignments,
      this.metrics
    );

    return optimizedAssignment;
  }

  private isAgentSuitable(agent: AgentCapability, task: TaskDefinition): boolean {
    // Check capabilities
    const hasRequiredCapabilities = task.requirements.capabilities.every((capability) =>
      agent.capabilities.includes(capability)
    );

    if (!hasRequiredCapabilities) return false;

    // Check load capacity
    if (agent.currentLoad >= agent.maxLoad) return false;

    // Check exclusions
    if (task.requirements.excludedAgents?.includes(agent.agentId)) return false;

    // Check trust score
    if (agent.trustScore < 0.5) return false; // Minimum trust threshold

    // Check resource requirements (simplified)
    const canHandleResources =
      task.requirements.resourceRequirements.cpu <= 1.0 && // Assume normalized values
      task.requirements.resourceRequirements.memory <= 1.0;

    return canHandleResources;
  }

  private async assignTask(task: TaskDefinition, agent: AgentCapability): Promise<void> {
    const assignment: TaskAssignment = {
      taskId: task.id,
      agentId: agent.agentId,
      assignedAt: new Date(),
      expectedCompletion: new Date(Date.now() + task.estimatedDuration),
      assignment: {
        confidence: await this.calculateAssignmentConfidence(task, agent),
        reasoning: await this.generateAssignmentReasoning(task, agent),
        alternativeAgents: await this.findAlternativeAgents(task, agent),
        resourceAllocation: this.calculateResourceAllocation(task, agent),
        qualityExpectation: this.calculateQualityExpectation(task, agent),
      },
      monitoring: this.createMonitoringPlan(task, agent),
    };

    this.assignments.set(task.id, assignment);
    agent.currentLoad++;

    this.logger.info('Task assigned to agent', {
      taskId: task.id,
      agentId: agent.agentId,
      confidence: assignment.assignment.confidence,
    });

    // Notify agent
    this.eventBus.emit('task:assign', {
      taskId: task.id,
      agentId: agent.agentId,
      taskType: task.type,
      task: {
        id: task.id,
        description: task.description,
        requirements: task.requirements.capabilities, // Convert TaskRequirements to string array
      },
      priority:
        task.priority === 'normal'
          ? 'medium'
          : (task.priority as 'low' | 'medium' | 'high' | 'critical'),
      dependencies: [],
      requiredCapabilities: task.requirements.capabilities || [],
      resourceRequirements: {
        cpu: 1,
        memory: 512,
        network: 100,
        disk: 1024,
      },
      timestamp: new Date(),
      source: 'task-distribution-engine',
      id: `task-assign-${task.id}-${Date.now()}`,
      version: '1.0.0',
    });

    this.emit('task:assigned', { taskId: task.id, agentId: agent.agentId, assignment });
  }

  private async calculateAssignmentConfidence(
    task: TaskDefinition,
    agent: AgentCapability
  ): Promise<number> {
    // Use performance predictor to estimate success probability
    return await this.performancePredictor.predictSuccess(task, agent);
  }

  private async generateAssignmentReasoning(
    task: TaskDefinition,
    agent: AgentCapability
  ): Promise<string[]> {
    const reasons: string[] = [];

    // Capability match
    const matchScore = this.calculateCapabilityMatch(task, agent);
    reasons.push(`Capability match: ${(matchScore * 100).toFixed(1)}%`);

    // Performance history
    const performanceScore = this.calculatePerformanceScore(task, agent);
    reasons.push(`Performance score: ${(performanceScore * 100).toFixed(1)}%`);

    // Load balance
    const loadScore = 1 - agent.currentLoad / agent.maxLoad;
    reasons.push(`Load availability: ${(loadScore * 100).toFixed(1)}%`);

    return reasons;
  }

  private async findAlternativeAgents(
    task: TaskDefinition,
    primaryAgent: AgentCapability
  ): Promise<string[]> {
    const alternatives = Array.from(this.agentCapabilities.values())
      .filter(
        (agent) => agent.agentId !== primaryAgent.agentId && this.isAgentSuitable(agent, task)
      )
      .sort((a, b) => {
        const scoreA = this.calculateAgentScore(task, a);
        const scoreB = this.calculateAgentScore(task, b);
        return scoreB - scoreA;
      })
      .slice(0, 3) // Top 3 alternatives
      .map((agent) => agent.agentId);

    return alternatives;
  }

  private calculateCapabilityMatch(task: TaskDefinition, agent: AgentCapability): number {
    const requiredCaps = new Set(task.requirements.capabilities);
    const agentCaps = new Set(agent.capabilities);
    const intersection = new Set([...requiredCaps].filter((x) => agentCaps.has(x)));

    return intersection.size / requiredCaps.size;
  }

  private calculatePerformanceScore(task: TaskDefinition, agent: AgentCapability): number {
    const taskTypePerf = agent.performance.taskTypes[task.type];
    return taskTypePerf
      ? taskTypePerf.successRate * taskTypePerf.efficiency
      : agent.performance.overall.successRate;
  }

  private calculateAgentScore(task: TaskDefinition, agent: AgentCapability): number {
    const capabilityScore = this.calculateCapabilityMatch(task, agent);
    const performanceScore = this.calculatePerformanceScore(task, agent);
    const availabilityScore = 1 - agent.currentLoad / agent.maxLoad;
    const trustScore = agent.trustScore;

    return (
      capabilityScore * 0.3 + performanceScore * 0.3 + availabilityScore * 0.2 + trustScore * 0.2
    );
  }

  private calculateResourceAllocation(
    task: TaskDefinition,
    agent: AgentCapability
  ): ResourceAllocation {
    return {
      cpu: Math.min(task.requirements.resourceRequirements.cpu, 1.0),
      memory: Math.min(task.requirements.resourceRequirements.memory, 1.0),
      network: Math.min(task.requirements.resourceRequirements.network, 1.0),
      storage: Math.min(task.requirements.resourceRequirements.storage, 1.0),
      gpu: task.requirements.resourceRequirements.gpu,
      priority: this.getPriorityWeight(task.priority),
    };
  }

  private calculateQualityExpectation(
    task: TaskDefinition,
    agent: AgentCapability
  ): QualityExpectation {
    const baseQuality = agent.performance.overall.qualityScore;
    const taskTypeQuality = agent.performance.taskTypes[task.type]?.qualityScore || baseQuality;

    return {
      accuracy: Math.min(task.requirements.qualityRequirements.accuracy, taskTypeQuality),
      speed: task.requirements.qualityRequirements.speed,
      completeness: task.requirements.qualityRequirements.completeness,
      confidence: 0.8, // Base confidence
    };
  }

  private createMonitoringPlan(task: TaskDefinition, agent: AgentCapability): AssignmentMonitoring {
    return {
      checkInterval: Math.min(task.estimatedDuration / 10, 30000), // Check every 10% of duration or 30s max
      progressTracking: true,
      qualityChecks: [
        {
          checkType: 'progress',
          frequency: 60000, // Every minute
          threshold: 0.1, // 10% progress expected per check
          action: 'warn',
        },
        {
          checkType: 'performance',
          frequency: 120000, // Every 2 minutes
          threshold: 0.5, // 50% performance threshold
          action: 'escalate',
        },
      ],
      escalationTriggers: [
        {
          condition: 'no_progress_15min',
          threshold: 900000, // 15 minutes
          action: 'reassign',
        },
        {
          condition: 'quality_below_threshold',
          threshold: 0.3,
          action: 'add_agents',
        },
      ],
    };
  }

  private getPriorityWeight(priority: TaskPriority): number {
    switch (priority) {
      case 'critical':
        return 1.0;
      case 'urgent':
        return 0.8;
      case 'high':
        return 0.6;
      case 'normal':
        return 0.4;
      case 'low':
        return 0.2;
      default:
        return 0.4;
    }
  }

  private subtaskToTask(subtask: SubTask, parentId: string): TaskDefinition {
    return {
      id: subtask.id,
      name: subtask.name,
      description: subtask.description,
      type: subtask.type,
      priority: 'normal', // Inherit from parent or adjust
      complexity: 'simple', // Subtasks are typically simpler
      requirements: subtask.requirements,
      constraints: {
        maxRetries: 3,
        timeoutMs: subtask.estimatedDuration * 2,
        isolationLevel: 'process',
        securityLevel: 'medium',
      },
      dependencies: subtask.dependencies.map((depId) => ({
        taskId: depId,
        type: 'blocking' as const,
        weight: 1,
      })),
      estimatedDuration: subtask.estimatedDuration,
      metadata: { parentId, order: subtask.order },
      created: new Date(),
      submittedBy: 'system',
    };
  }

  private async optimizeAssignments(): Promise<void> {
    // Trigger assignment optimization when new agents are available
    const pendingTasks = await this.queue.peek(10); // Look at next 10 tasks
    if (pendingTasks.length > 0) {
      // Optimization logic would go here
      this.logger.debug('Assignment optimization triggered', { pendingTasks: pendingTasks.length });
    }
  }

  private async updateMetrics(): Promise<void> {
    const queuedTasks = this.queue.size();
    const runningTasks = this.assignments.size;

    // Calculate utilization
    const agentUtilization: Record<string, number> = {};
    for (const [agentId, agent] of this.agentCapabilities) {
      agentUtilization[agentId] = agent.currentLoad / agent.maxLoad;
    }

    this.metrics = {
      ...this.metrics,
      queuedTasks,
      runningTasks,
      agentUtilization,
      loadBalance: this.calculateLoadBalance(),
      resourceEfficiency: this.calculateResourceEfficiency(),
    };

    this.emit('metrics:updated', { metrics: this.metrics });
  }

  private calculateLoadBalance(): number {
    const utilizations = Array.from(this.agentCapabilities.values()).map(
      (agent) => agent.currentLoad / agent.maxLoad
    );

    if (utilizations.length === 0) return 1;

    const avg = utilizations.reduce((sum, util) => sum + util, 0) / utilizations.length;
    const variance =
      utilizations.reduce((sum, util) => sum + (util - avg) ** 2, 0) / utilizations.length;

    return Math.max(0, 1 - Math.sqrt(variance));
  }

  private calculateResourceEfficiency(): number {
    // Simplified efficiency calculation
    const totalCapacity = Array.from(this.agentCapabilities.values()).reduce(
      (sum, agent) => sum + agent.maxLoad,
      0
    );

    const usedCapacity = Array.from(this.agentCapabilities.values()).reduce(
      (sum, agent) => sum + agent.currentLoad,
      0
    );

    return totalCapacity > 0 ? usedCapacity / totalCapacity : 0;
  }

  private async performHealthChecks(): Promise<void> {
    // Check for stuck assignments
    const now = Date.now();
    for (const [taskId, assignment] of this.assignments) {
      const runtime = now - assignment.assignedAt.getTime();
      const task = this.tasks.get(taskId);

      if (task && runtime > task.estimatedDuration * 2) {
        this.logger.warn('Task potentially stuck', {
          taskId,
          runtime,
          estimated: task.estimatedDuration,
        });
        await this.handleStuckTask(taskId);
      }
    }
  }

  private async rebalanceWorkload(): Promise<void> {
    const imbalance = this.detectLoadImbalance();
    if (imbalance.severity > 0.3) {
      await this.workloadBalancer.rebalance(this.agentCapabilities, this.assignments, imbalance);
    }
  }

  private detectLoadImbalance(): { severity: number; overloaded: string[]; underloaded: string[] } {
    const utilizations = Array.from(this.agentCapabilities.entries()).map(([agentId, agent]) => ({
      agentId,
      utilization: agent.currentLoad / agent.maxLoad,
    }));

    const avg =
      utilizations.reduce((sum, { utilization }) => sum + utilization, 0) / utilizations.length;

    const overloaded = utilizations
      .filter(({ utilization }) => utilization > avg + 0.3)
      .map(({ agentId }) => agentId);

    const underloaded = utilizations
      .filter(({ utilization }) => utilization < avg - 0.3)
      .map(({ agentId }) => agentId);

    const severity =
      overloaded.length > 0 && underloaded.length > 0
        ? Math.min(overloaded.length, underloaded.length) / utilizations.length
        : 0;

    return { severity, overloaded, underloaded };
  }

  private async handleStuckTask(taskId: string): Promise<void> {
    this.logger.info('Handling stuck task', { taskId });
    await this.reassignTask(taskId, 'task_stuck');
  }

  // Event handlers
  private async handleAgentRegistration(data: any): Promise<void> {
    this.logger.debug('Agent registration event received', data);
  }

  private async handleAgentCapabilitiesUpdate(data: any): Promise<void> {
    const agent = this.agentCapabilities.get(data.agentId);
    if (agent) {
      agent.capabilities = data.capabilities;
      agent.performance = data.performance || agent.performance;
    }
  }

  private async handleAgentPerformanceUpdate(data: any): Promise<void> {
    const agent = this.agentCapabilities.get(data.agentId);
    if (agent) {
      agent.performance = { ...agent.performance, ...data.performance };
    }
  }

  private async handleTaskProgressUpdate(data: any): Promise<void> {
    this.emit('task:progress', data);
  }

  private async handleTaskCompletion(data: any): Promise<void> {
    const assignment = this.assignments.get(data.taskId);
    if (assignment) {
      const agent = this.agentCapabilities.get(assignment.agentId);
      if (agent) {
        agent.currentLoad = Math.max(0, agent.currentLoad - 1);
      }

      this.assignments.delete(data.taskId);
      this.metrics.completedTasks++;
    }

    this.emit('task:completed', data);
  }

  private async handleTaskFailure(data: any): Promise<void> {
    const assignment = this.assignments.get(data.taskId);
    if (assignment) {
      const agent = this.agentCapabilities.get(assignment.agentId);
      if (agent) {
        agent.currentLoad = Math.max(0, agent.currentLoad - 1);
      }

      this.assignments.delete(data.taskId);
      this.metrics.failedTasks++;

      // Handle failure recovery
      await this.failureHandler.handleFailure(data.taskId, data.error, this.tasks, this.queue);
    }

    this.emit('task:failed', data);
  }

  private async handleAgentUnavailable(data: any): Promise<void> {
    const agent = this.agentCapabilities.get(data.agentId);
    if (agent) {
      agent.availability.currentStatus = 'offline';

      // Reassign tasks from unavailable agent
      const affectedAssignments = Array.from(this.assignments.entries()).filter(
        ([_, assignment]) => assignment.agentId === data.agentId
      );

      for (const [taskId] of affectedAssignments) {
        await this.reassignTask(taskId, 'agent_unavailable');
      }
    }
  }

  private generateTaskId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMetrics(): DistributionMetrics {
    return {
      totalTasks: 0,
      queuedTasks: 0,
      runningTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      avgWaitTime: 0,
      avgExecutionTime: 0,
      agentUtilization: {},
      throughput: 0,
      successRate: 1,
      loadBalance: 1,
      resourceEfficiency: 0,
    };
  }

  async shutdown(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    this.emit('shutdown');
    this.logger.info('Task distribution engine shutdown');
  }
}

// Supporting classes (implementations would be detailed)

class TaskQueue {
  private queue: TaskDefinition[] = [];

  constructor(private logger: ILogger) {}

  async enqueue(task: TaskDefinition): Promise<void> {
    this.queue.push(task);
    this.queue.sort((a, b) => this.comparePriority(a.priority, b.priority));
  }

  async getNext(count: number): Promise<TaskDefinition[]> {
    return this.queue.splice(0, count);
  }

  async peek(count: number): Promise<TaskDefinition[]> {
    return this.queue.slice(0, count);
  }

  async remove(taskId: string): Promise<boolean> {
    const index = this.queue.findIndex((task) => task.id === taskId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      return true;
    }
    return false;
  }

  size(): number {
    return this.queue.length;
  }

  private comparePriority(a: TaskPriority, b: TaskPriority): number {
    const weights = { critical: 5, urgent: 4, high: 3, normal: 2, low: 1 };
    return weights[b] - weights[a];
  }
}

class TaskScheduler {
  constructor(
    private config: any,
    private logger: ILogger
  ) {}

  // Scheduling algorithms would be implemented here
}

class TaskDecomposer {
  constructor(private logger: ILogger) {}

  async decompose(task: TaskDefinition): Promise<DecomposedTask> {
    // Task decomposition logic
    return {
      id: `decomposed-${task.id}`,
      parentId: task.id,
      subtasks: [],
      executionPlan: {
        strategy: 'parallel',
        phases: [],
        checkpoints: [],
        rollbackPlan: [],
      },
      coordination: {
        type: 'centralized',
        communicationPattern: 'broadcast',
        syncPoints: [],
        conflictResolution: 'priority',
      },
    };
  }
}

class AssignmentOptimizer {
  constructor(
    private config: any,
    private logger: ILogger
  ) {}

  async findOptimalAssignment(
    task: TaskDefinition,
    agents: AgentCapability[],
    assignments: Map<string, TaskAssignment>,
    metrics: DistributionMetrics
  ): Promise<AgentCapability | null> {
    // ML-based assignment optimization
    if (agents.length === 0) return null;

    // Simple scoring for now
    const scored = agents.map((agent) => ({
      agent,
      score: this.calculateAssignmentScore(task, agent, assignments),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0].agent;
  }

  private calculateAssignmentScore(
    task: TaskDefinition,
    agent: AgentCapability,
    assignments: Map<string, TaskAssignment>
  ): number {
    // Simplified scoring
    const capabilityMatch = task.requirements.capabilities.every((cap) =>
      agent.capabilities.includes(cap)
    )
      ? 1
      : 0;

    const loadScore = 1 - agent.currentLoad / agent.maxLoad;
    const trustScore = agent.trustScore;

    return capabilityMatch * 0.4 + loadScore * 0.3 + trustScore * 0.3;
  }
}

class WorkloadBalancer {
  constructor(
    private config: any,
    private logger: ILogger
  ) {}

  async rebalance(
    agents: Map<string, AgentCapability>,
    assignments: Map<string, TaskAssignment>,
    imbalance: { severity: number; overloaded: string[]; underloaded: string[] }
  ): Promise<void> {
    // Workload rebalancing logic
    this.logger.info('Rebalancing workload', { imbalance });
  }
}

class PerformancePredictor {
  constructor(private logger: ILogger) {}

  async predictSuccess(task: TaskDefinition, agent: AgentCapability): Promise<number> {
    // ML-based success prediction
    const baseRate = agent.performance.overall.successRate;
    const taskTypePerf = agent.performance.taskTypes[task.type];

    return taskTypePerf ? taskTypePerf.successRate : baseRate;
  }
}

class FailureHandler {
  constructor(private logger: ILogger) {}

  async handleFailure(
    taskId: string,
    error: Error,
    tasks: Map<string, TaskDefinition>,
    queue: TaskQueue
  ): Promise<void> {
    const task = tasks.get(taskId);
    if (!task) return;

    // Implement retry logic, error analysis, etc.
    if (task.constraints.maxRetries > 0) {
      task.constraints.maxRetries--;
      await queue.enqueue(task);
      this.logger.info('Task re-queued after failure', {
        taskId,
        retriesLeft: task.constraints.maxRetries,
      });
    } else {
      this.logger.error('Task failed permanently', { taskId, error: error.message });
    }
  }
}

export default TaskDistributionEngine;
