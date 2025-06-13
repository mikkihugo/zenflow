/**
 * Comprehensive Swarm Coordinator - Main orchestration engine
 */

import { EventEmitter } from 'node:events';
import { Logger } from '../core/logger.ts';
import { generateId } from '../utils/helpers.ts';
import {
  SwarmId, AgentId, TaskId, AgentState, TaskDefinition, SwarmObjective,
  SwarmConfig, SwarmStatus, SwarmProgress, SwarmResults, SwarmMetrics,
  SwarmMode, SwarmStrategy, AgentType, TaskType, TaskStatus, TaskPriority,
  SwarmEvent, EventType, SwarmEventEmitter, ValidationResult,
  SWARM_CONSTANTS
} from './types.ts';

export class SwarmCoordinator extends EventEmitter implements SwarmEventEmitter {
  private logger: Logger;
  private config: SwarmConfig;
  private swarmId: SwarmId;
  
  // Core state management
  private agents: Map<string, AgentState> = new Map();
  private tasks: Map<string, TaskDefinition> = new Map();
  private objectives: Map<string, SwarmObjective> = new Map();
  
  // Execution state
  private isRunning: boolean = false;
  private status: SwarmStatus = 'planning';
  private startTime?: Date;
  private endTime?: Date;
  
  // Performance tracking
  private metrics: SwarmMetrics;
  private events: SwarmEvent[] = [];
  private lastHeartbeat: Date = new Date();
  
  // Background processes
  private heartbeatTimer?: NodeJS.Timeout;
  private monitoringTimer?: NodeJS.Timeout;
  private cleanupTimer?: NodeJS.Timeout;
  
  constructor(config: Partial<SwarmConfig> = {}) {
    super();
    
    this.logger = new Logger(
      { level: 'info', format: 'json', destination: 'console' },
      { component: 'SwarmCoordinator' }
    );
    this.swarmId = this.generateSwarmId();
    
    // Initialize configuration with defaults
    this.config = this.mergeWithDefaults(config);
    
    // Initialize metrics
    this.metrics = this.initializeMetrics();
    
    // Setup event handlers
    this.setupEventHandlers();
    
    this.logger.info('SwarmCoordinator initialized', { 
      swarmId: this.swarmId.id,
      mode: this.config.mode,
      strategy: this.config.strategy 
    });
  }

  // ===== LIFECYCLE MANAGEMENT =====

  async initialize(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Swarm coordinator already running');
    }

    this.logger.info('Initializing swarm coordinator...');
    this.status = 'initializing';
    
    try {
      // Validate configuration
      const validation = await this.validateConfiguration();
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Initialize subsystems
      await this.initializeSubsystems();
      
      // Start background processes
      this.startBackgroundProcesses();
      
      this.isRunning = true;
      this.startTime = new Date();
      this.status = 'executing';
      
      this.emitSwarmEvent({
        id: generateId('event'),
        timestamp: new Date(),
        type: 'swarm.started',
        source: this.swarmId.id,
        data: { swarmId: this.swarmId },
        broadcast: true,
        processed: false
      });
      
      this.logger.info('Swarm coordinator initialized successfully');
      
    } catch (error) {
      this.status = 'failed';
      this.logger.error('Failed to initialize swarm coordinator', { error });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.logger.info('Shutting down swarm coordinator...');
    this.status = 'paused';
    
    try {
      // Stop background processes
      this.stopBackgroundProcesses();
      
      // Gracefully stop all agents
      await this.stopAllAgents();
      
      // Complete any running tasks
      await this.completeRunningTasks();
      
      // Save final state
      await this.saveState();
      
      this.isRunning = false;
      this.endTime = new Date();
      this.status = 'completed';
      
      this.emitSwarmEvent({
        id: generateId('event'),
        timestamp: new Date(),
        type: 'swarm.completed',
        source: this.swarmId.id,
        data: { 
          swarmId: this.swarmId,
          metrics: this.metrics,
          duration: this.endTime.getTime() - (this.startTime?.getTime() || 0)
        },
        broadcast: true,
        processed: false
      });
      
      this.logger.info('Swarm coordinator shut down successfully');
      
    } catch (error) {
      this.logger.error('Error during swarm coordinator shutdown', { error });
      throw error;
    }
  }

  async pause(): Promise<void> {
    if (!this.isRunning || this.status === 'paused') {
      return;
    }

    this.logger.info('Pausing swarm coordinator...');
    this.status = 'paused';
    
    // Pause all agents
    for (const agent of this.agents.values()) {
      if (agent.status === 'busy') {
        await this.pauseAgent(agent.id);
      }
    }
    
    this.emitSwarmEvent({
      id: generateId('event'),
      timestamp: new Date(),
      type: 'swarm.paused',
      source: this.swarmId.id,
      data: { swarmId: this.swarmId },
      broadcast: true,
      processed: false
    });
  }

  async resume(): Promise<void> {
    if (!this.isRunning || this.status !== 'paused') {
      return;
    }

    this.logger.info('Resuming swarm coordinator...');
    this.status = 'executing';
    
    // Resume all paused agents
    for (const agent of this.agents.values()) {
      if (agent.status === 'paused') {
        await this.resumeAgent(agent.id);
      }
    }
    
    this.emitSwarmEvent({
      id: generateId('event'),
      timestamp: new Date(),
      type: 'swarm.resumed',
      source: this.swarmId.id,
      data: { swarmId: this.swarmId },
      broadcast: true,
      processed: false
    });
  }

  // ===== OBJECTIVE MANAGEMENT =====

  async createObjective(
    name: string,
    description: string,
    strategy: SwarmStrategy = 'auto',
    requirements: Partial<SwarmObjective['requirements']> = {}
  ): Promise<string> {
    const objectiveId = generateId('objective');
    
    const objective: SwarmObjective = {
      id: objectiveId,
      name,
      description,
      strategy,
      mode: this.config.mode,
      requirements: {
        minAgents: 1,
        maxAgents: this.config.maxAgents,
        agentTypes: this.determineRequiredAgentTypes(strategy),
        estimatedDuration: 60 * 60 * 1000, // 1 hour default
        maxDuration: 4 * 60 * 60 * 1000,   // 4 hours default
        qualityThreshold: this.config.qualityThreshold,
        reviewCoverage: 0.8,
        testCoverage: 0.7,
        reliabilityTarget: 0.95,
        ...requirements
      },
      constraints: {
        minQuality: this.config.qualityThreshold,
        requiredApprovals: [],
        allowedFailures: Math.floor(this.config.maxAgents * 0.1),
        recoveryTime: 5 * 60 * 1000, // 5 minutes
        milestones: []
      },
      tasks: [],
      dependencies: [],
      status: 'planning',
      progress: this.initializeProgress(),
      createdAt: new Date(),
      metrics: this.initializeMetrics()
    };

    // Decompose objective into tasks
    objective.tasks = await this.decomposeObjective(objective);
    objective.dependencies = this.analyzeDependencies(objective.tasks);
    
    this.objectives.set(objectiveId, objective);
    
    this.logger.info('Created objective', { 
      objectiveId, 
      name, 
      strategy, 
      taskCount: objective.tasks.length 
    });

    return objectiveId;
  }

  async executeObjective(objectiveId: string): Promise<void> {
    const objective = this.objectives.get(objectiveId);
    if (!objective) {
      throw new Error(`Objective not found: ${objectiveId}`);
    }

    if (objective.status !== 'planning') {
      throw new Error(`Objective already ${objective.status}`);
    }

    this.logger.info('Executing objective', { objectiveId, name: objective.name });
    objective.status = 'executing';
    objective.startedAt = new Date();

    try {
      // Ensure we have required agents
      await this.ensureRequiredAgents(objective);
      
      // Schedule initial tasks
      await this.scheduleInitialTasks(objective);
      
      // Start task execution loop
      this.startTaskExecutionLoop(objective);
      
    } catch (error) {
      objective.status = 'failed';
      this.logger.error('Failed to execute objective', { objectiveId, error });
      throw error;
    }
  }

  // ===== AGENT MANAGEMENT =====

  async registerAgent(
    name: string,
    type: AgentType,
    capabilities: Partial<AgentState['capabilities']> = {}
  ): Promise<string> {
    const agentId: AgentId = {
      id: generateId('agent'),
      swarmId: this.swarmId.id,
      type,
      instance: this.getNextInstanceNumber(type)
    };

    const agentState: AgentState = {
      id: agentId,
      name,
      type,
      status: 'initializing',
      capabilities: {
        // Default capabilities
        codeGeneration: false,
        codeReview: false,
        testing: false,
        documentation: false,
        research: false,
        analysis: false,
        webSearch: false,
        apiIntegration: false,
        fileSystem: true,
        terminalAccess: true,
        languages: [],
        frameworks: [],
        domains: [],
        tools: [],
        maxConcurrentTasks: 3,
        maxMemoryUsage: SWARM_CONSTANTS.DEFAULT_MEMORY_LIMIT,
        maxExecutionTime: SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT,
        reliability: 0.8,
        speed: 1.0,
        quality: 0.8,
        ...capabilities
      },
      metrics: {
        tasksCompleted: 0,
        tasksFailed: 0,
        averageExecutionTime: 0,
        successRate: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        diskUsage: 0,
        networkUsage: 0,
        codeQuality: 0,
        testCoverage: 0,
        bugRate: 0,
        userSatisfaction: 0,
        totalUptime: 0,
        lastActivity: new Date(),
        responseTime: 0
      },
      workload: 0,
      health: 1.0,
      config: {
        autonomyLevel: 0.7,
        learningEnabled: true,
        adaptationEnabled: true,
        maxTasksPerHour: 10,
        maxConcurrentTasks: capabilities.maxConcurrentTasks || 3,
        timeoutThreshold: SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT,
        reportingInterval: 30000,
        heartbeatInterval: SWARM_CONSTANTS.DEFAULT_HEARTBEAT_INTERVAL,
        permissions: this.getDefaultPermissions(type),
        trustedAgents: [],
        expertise: {},
        preferences: {}
      },
      environment: {
        runtime: 'deno',
        version: '1.0.0',
        workingDirectory: `/tmp/swarm/${this.swarmId.id}/agents/${agentId.id}`,
        tempDirectory: `/tmp/swarm/${this.swarmId.id}/agents/${agentId.id}/temp`,
        logDirectory: `/tmp/swarm/${this.swarmId.id}/agents/${agentId.id}/logs`,
        apiEndpoints: {},
        credentials: {},
        availableTools: [],
        toolConfigs: {}
      },
      endpoints: [],
      lastHeartbeat: new Date(),
      taskHistory: [],
      errorHistory: [],
      childAgents: [],
      collaborators: []
    };

    this.agents.set(agentId.id, agentState);
    
    // Initialize agent capabilities based on type
    await this.initializeAgentCapabilities(agentState);
    
    // Start agent
    await this.startAgent(agentId.id);
    
    this.logger.info('Registered agent', { 
      agentId: agentId.id, 
      name, 
      type,
      capabilities: Object.keys(capabilities)
    });

    this.emitSwarmEvent({
      id: generateId('event'),
      timestamp: new Date(),
      type: 'agent.created',
      source: agentId.id,
      data: { agent: agentState },
      broadcast: false,
      processed: false
    });

    return agentId.id;
  }

  async unregisterAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }

    this.logger.info('Unregistering agent', { agentId, name: agent.name });
    
    // Stop agent gracefully
    await this.stopAgent(agentId);
    
    // Reassign any active tasks
    if (agent.currentTask) {
      await this.reassignTask(agent.currentTask.id);
    }
    
    // Remove from agents map
    this.agents.delete(agentId);
    
    this.emitSwarmEvent({
      id: generateId('event'),
      timestamp: new Date(),
      type: 'agent.stopped',
      source: agentId,
      data: { agentId },
      broadcast: false,
      processed: false
    });
  }

  async startAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (agent.status !== 'initializing' && agent.status !== 'offline') {
      return;
    }

    this.logger.info('Starting agent', { agentId, name: agent.name });
    
    try {
      // Initialize agent environment
      await this.initializeAgentEnvironment(agent);
      
      // Start agent heartbeat
      this.startAgentHeartbeat(agent);
      
      agent.status = 'idle';
      agent.lastHeartbeat = new Date();
      
      this.emitSwarmEvent({
        id: generateId('event'),
        timestamp: new Date(),
        type: 'agent.started',
        source: agentId,
        data: { agent },
        broadcast: false,
        processed: false
      });
      
    } catch (error) {
      agent.status = 'error';
      agent.errorHistory.push({
        timestamp: new Date(),
        type: 'startup_error',
        message: error.message,
        stack: error.stack,
        context: { agentId },
        severity: 'high',
        resolved: false
      });
      
      this.logger.error('Failed to start agent', { agentId, error });
      throw error;
    }
  }

  async stopAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return;
    }

    if (agent.status === 'offline' || agent.status === 'terminated') {
      return;
    }

    this.logger.info('Stopping agent', { agentId, name: agent.name });
    
    agent.status = 'terminating';
    
    try {
      // Cancel current task if any
      if (agent.currentTask) {
        await this.cancelTask(agent.currentTask.id, 'Agent stopping');
      }
      
      // Stop heartbeat
      this.stopAgentHeartbeat(agent);
      
      // Cleanup agent environment
      await this.cleanupAgentEnvironment(agent);
      
      agent.status = 'terminated';
      
    } catch (error) {
      agent.status = 'error';
      this.logger.error('Error stopping agent', { agentId, error });
    }
  }

  async pauseAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent || agent.status !== 'busy') {
      return;
    }

    agent.status = 'paused';
    this.logger.info('Paused agent', { agentId });
  }

  async resumeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent || agent.status !== 'paused') {
      return;
    }

    agent.status = 'busy';
    this.logger.info('Resumed agent', { agentId });
  }

  // ===== TASK MANAGEMENT =====

  async createTask(
    type: TaskType,
    name: string,
    description: string,
    instructions: string,
    options: Partial<TaskDefinition> = {}
  ): Promise<string> {
    const taskId: TaskId = {
      id: generateId('task'),
      swarmId: this.swarmId.id,
      sequence: this.tasks.size + 1,
      priority: 1
    };

    const task: TaskDefinition = {
      id: taskId,
      type,
      name,
      description,
      instructions,
      requirements: {
        capabilities: this.getRequiredCapabilities(type),
        tools: this.getRequiredTools(type),
        permissions: this.getRequiredPermissions(type),
        ...options.requirements
      },
      constraints: {
        dependencies: [],
        dependents: [],
        conflicts: [],
        maxRetries: SWARM_CONSTANTS.MAX_RETRIES,
        timeoutAfter: SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT,
        ...options.constraints
      },
      priority: 'normal',
      input: options.input || {},
      context: options.context || {},
      examples: options.examples || [],
      status: 'created',
      createdAt: new Date(),
      updatedAt: new Date(),
      attempts: [],
      statusHistory: [{
        timestamp: new Date(),
        from: 'created' as TaskStatus,
        to: 'created' as TaskStatus,
        reason: 'Task created',
        triggeredBy: 'system'
      }],
      ...options
    };

    this.tasks.set(taskId.id, task);
    
    this.logger.info('Created task', { 
      taskId: taskId.id, 
      type, 
      name,
      priority: task.priority 
    });

    this.emitSwarmEvent({
      id: generateId('event'),
      timestamp: new Date(),
      type: 'task.created',
      source: this.swarmId.id,
      data: { task },
      broadcast: false,
      processed: false
    });

    return taskId.id;
  }

  async assignTask(taskId: string, agentId?: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (task.status !== 'created' && task.status !== 'queued') {
      throw new Error(`Task cannot be assigned, current status: ${task.status}`);
    }

    // Select agent if not specified
    if (!agentId) {
      agentId = await this.selectAgentForTask(task);
      if (!agentId) {
        throw new Error('No suitable agent available for task');
      }
    }

    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    if (agent.status !== 'idle') {
      throw new Error(`Agent not available: ${agent.status}`);
    }

    // Assign task
    task.assignedTo = agent.id;
    task.assignedAt = new Date();
    task.status = 'assigned';
    
    agent.currentTask = task.id;
    agent.status = 'busy';
    
    // Update status history
    task.statusHistory.push({
      timestamp: new Date(),
      from: task.statusHistory[task.statusHistory.length - 1].to,
      to: 'assigned',
      reason: `Assigned to agent ${agent.name}`,
      triggeredBy: 'system'
    });

    this.logger.info('Assigned task', { 
      taskId, 
      agentId, 
      agentName: agent.name 
    });

    this.emitSwarmEvent({
      id: generateId('event'),
      timestamp: new Date(),
      type: 'task.assigned',
      source: agentId,
      data: { task, agent },
      broadcast: false,
      processed: false
    });

    // Start task execution
    await this.startTaskExecution(task);
  }

  async startTaskExecution(task: TaskDefinition): Promise<void> {
    if (!task.assignedTo) {
      throw new Error('Task not assigned to any agent');
    }

    const agent = this.agents.get(task.assignedTo.id);
    if (!agent) {
      throw new Error(`Agent not found: ${task.assignedTo.id}`);
    }

    this.logger.info('Starting task execution', { 
      taskId: task.id.id, 
      agentId: agent.id.id 
    });

    task.status = 'running';
    task.startedAt = new Date();
    
    // Create attempt record
    const attempt = {
      attemptNumber: task.attempts.length + 1,
      agent: agent.id,
      startedAt: new Date(),
      status: 'running' as TaskStatus,
      resourcesUsed: {}
    };
    task.attempts.push(attempt);
    
    // Update status history
    task.statusHistory.push({
      timestamp: new Date(),
      from: 'assigned',
      to: 'running',
      reason: 'Task execution started',
      triggeredBy: agent.id
    });

    this.emitSwarmEvent({
      id: generateId('event'),
      timestamp: new Date(),
      type: 'task.started',
      source: agent.id.id,
      data: { task, agent, attempt },
      broadcast: false,
      processed: false
    });

    try {
      // Execute task (this would spawn actual Claude process)
      const result = await this.executeTaskWithAgent(task, agent);
      await this.completeTask(task.id.id, result);
      
    } catch (error) {
      await this.failTask(task.id.id, error);
    }
  }

  async completeTask(taskId: string, result: any): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const agent = task.assignedTo ? this.agents.get(task.assignedTo.id) : null;
    if (!agent) {
      throw new Error('Task not assigned to any agent');
    }

    this.logger.info('Completing task', { taskId, agentId: agent.id.id });

    task.status = 'completed';
    task.completedAt = new Date();
    task.result = {
      output: result,
      artifacts: {},
      metadata: {},
      quality: this.assessTaskQuality(task, result),
      completeness: 1.0,
      accuracy: 1.0,
      executionTime: task.completedAt.getTime() - (task.startedAt?.getTime() || 0),
      resourcesUsed: {},
      validated: false
    };

    // Update attempt
    const currentAttempt = task.attempts[task.attempts.length - 1];
    if (currentAttempt) {
      currentAttempt.completedAt = new Date();
      currentAttempt.status = 'completed';
      currentAttempt.result = task.result;
    }

    // Update agent state
    agent.status = 'idle';
    agent.currentTask = undefined;
    agent.metrics.tasksCompleted++;
    agent.metrics.lastActivity = new Date();
    agent.taskHistory.push(task.id);
    
    // Update agent metrics
    this.updateAgentMetrics(agent, task);

    // Update status history
    task.statusHistory.push({
      timestamp: new Date(),
      from: 'running',
      to: 'completed',
      reason: 'Task completed successfully',
      triggeredBy: agent.id
    });

    this.emitSwarmEvent({
      id: generateId('event'),
      timestamp: new Date(),
      type: 'task.completed',
      source: agent.id.id,
      data: { task, agent, result: task.result },
      broadcast: false,
      processed: false
    });

    // Check for dependent tasks
    await this.processDependentTasks(task);
  }

  async failTask(taskId: string, error: any): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const agent = task.assignedTo ? this.agents.get(task.assignedTo.id) : null;
    if (!agent) {
      throw new Error('Task not assigned to any agent');
    }

    this.logger.warn('Task failed', { taskId, agentId: agent.id.id, error: error.message });

    task.error = {
      type: error.constructor.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      context: { taskId, agentId: agent.id.id },
      recoverable: this.isRecoverableError(error),
      retryable: this.isRetryableError(error)
    };

    // Update attempt
    const currentAttempt = task.attempts[task.attempts.length - 1];
    if (currentAttempt) {
      currentAttempt.completedAt = new Date();
      currentAttempt.status = 'failed';
      currentAttempt.error = task.error;
    }

    // Update agent state
    agent.status = 'idle';
    agent.currentTask = undefined;
    agent.metrics.tasksFailed++;
    agent.metrics.lastActivity = new Date();
    
    // Add to error history
    agent.errorHistory.push({
      timestamp: new Date(),
      type: 'task_failure',
      message: error.message,
      stack: error.stack,
      context: { taskId },
      severity: 'medium',
      resolved: false
    });

    // Determine if we should retry
    const shouldRetry = task.error.retryable && 
                       task.attempts.length < (task.constraints.maxRetries || SWARM_CONSTANTS.MAX_RETRIES);

    if (shouldRetry) {
      task.status = 'retrying';
      task.assignedTo = undefined;
      
      // Update status history
      task.statusHistory.push({
        timestamp: new Date(),
        from: 'running',
        to: 'retrying',
        reason: `Task failed, will retry: ${error.message}`,
        triggeredBy: agent.id
      });

      this.emitSwarmEvent({
        id: generateId('event'),
        timestamp: new Date(),
        type: 'task.retried',
        source: agent.id.id,
        data: { task, error: task.error, attempt: task.attempts.length },
        broadcast: false,
        processed: false
      });

      // Schedule retry with exponential backoff
      const retryDelay = Math.pow(2, task.attempts.length) * 1000;
      setTimeout(() => {
        this.assignTask(taskId).catch(retryError => {
          this.logger.error('Failed to retry task', { taskId, retryError });
        });
      }, retryDelay);

    } else {
      task.status = 'failed';
      task.completedAt = new Date();
      
      // Update status history
      task.statusHistory.push({
        timestamp: new Date(),
        from: 'running',
        to: 'failed',
        reason: `Task failed permanently: ${error.message}`,
        triggeredBy: agent.id
      });

      this.emitSwarmEvent({
        id: generateId('event'),
        timestamp: new Date(),
        type: 'task.failed',
        source: agent.id.id,
        data: { task, error: task.error },
        broadcast: false,
        processed: false
      });

      // Handle failure cascade
      await this.handleTaskFailureCascade(task);
    }
  }

  async cancelTask(taskId: string, reason: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const agent = task.assignedTo ? this.agents.get(task.assignedTo.id) : null;

    this.logger.info('Cancelling task', { taskId, reason });

    task.status = 'cancelled';
    task.completedAt = new Date();

    if (agent) {
      agent.status = 'idle';
      agent.currentTask = undefined;
    }

    // Update status history
    task.statusHistory.push({
      timestamp: new Date(),
      from: task.statusHistory[task.statusHistory.length - 1].to,
      to: 'cancelled',
      reason: `Task cancelled: ${reason}`,
      triggeredBy: 'system'
    });

    this.emitSwarmEvent({
      id: generateId('event'),
      timestamp: new Date(),
      type: 'task.cancelled',
      source: this.swarmId.id,
      data: { task, reason },
      broadcast: false,
      processed: false
    });
  }

  // ===== ADVANCED FEATURES =====

  async selectAgentForTask(task: TaskDefinition): Promise<string | null> {
    const availableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.status === 'idle' &&
        this.agentCanHandleTask(agent, task)
      );

    if (availableAgents.length === 0) {
      return null;
    }

    // Score agents based on multiple criteria
    const scoredAgents = availableAgents.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent, task)
    }));

    // Sort by score (highest first)
    scoredAgents.sort((a, b) => b.score - a.score);

    return scoredAgents[0].agent.id.id;
  }

  private calculateAgentScore(agent: AgentState, task: TaskDefinition): number {
    let score = 0;

    // Capability match (40% weight)
    const capabilityMatch = this.calculateCapabilityMatch(agent, task);
    score += capabilityMatch * 0.4;

    // Performance history (30% weight)
    const performanceScore = agent.metrics.successRate * agent.capabilities.reliability;
    score += performanceScore * 0.3;

    // Current workload (20% weight)
    const workloadScore = 1 - agent.workload;
    score += workloadScore * 0.2;

    // Quality rating (10% weight)
    score += agent.capabilities.quality * 0.1;

    return score;
  }

  private calculateCapabilityMatch(agent: AgentState, task: TaskDefinition): number {
    const requiredCapabilities = task.requirements.capabilities;
    let matches = 0;
    let total = requiredCapabilities.length;

    for (const capability of requiredCapabilities) {
      if (this.agentHasCapability(agent, capability)) {
        matches++;
      }
    }

    return total > 0 ? matches / total : 1.0;
  }

  private agentHasCapability(agent: AgentState, capability: string): boolean {
    const caps = agent.capabilities;
    
    switch (capability) {
      case 'code-generation': return caps.codeGeneration;
      case 'code-review': return caps.codeReview;
      case 'testing': return caps.testing;
      case 'documentation': return caps.documentation;
      case 'research': return caps.research;
      case 'analysis': return caps.analysis;
      case 'web-search': return caps.webSearch;
      case 'api-integration': return caps.apiIntegration;
      case 'file-system': return caps.fileSystem;
      case 'terminal-access': return caps.terminalAccess;
      default: 
        return caps.domains.includes(capability) ||
               caps.languages.includes(capability) ||
               caps.frameworks.includes(capability) ||
               caps.tools.includes(capability);
    }
  }

  private agentCanHandleTask(agent: AgentState, task: TaskDefinition): boolean {
    // Check if agent type is suitable
    if (task.requirements.agentType && agent.type !== task.requirements.agentType) {
      return false;
    }

    // Check if agent has required capabilities
    for (const capability of task.requirements.capabilities) {
      if (!this.agentHasCapability(agent, capability)) {
        return false;
      }
    }

    // Check reliability requirement
    if (task.requirements.minReliability && 
        agent.capabilities.reliability < task.requirements.minReliability) {
      return false;
    }

    // Check if agent has capacity
    if (agent.workload >= 1.0) {
      return false;
    }

    return true;
  }

  // ===== HELPER METHODS =====

  private generateSwarmId(): SwarmId {
    return {
      id: generateId('swarm'),
      timestamp: Date.now(),
      namespace: 'default'
    };
  }

  private mergeWithDefaults(config: Partial<SwarmConfig>): SwarmConfig {
    return {
      name: 'Unnamed Swarm',
      description: 'Auto-generated swarm',
      version: '1.0.0',
      mode: 'centralized',
      strategy: 'auto',
      coordinationStrategy: {
        name: 'default',
        description: 'Default coordination strategy',
        agentSelection: 'capability-based',
        taskScheduling: 'priority',
        loadBalancing: 'work-stealing',
        faultTolerance: 'retry',
        communication: 'event-driven'
      },
      maxAgents: 10,
      maxTasks: 100,
      maxDuration: 4 * 60 * 60 * 1000, // 4 hours
      resourceLimits: {
        memory: SWARM_CONSTANTS.DEFAULT_MEMORY_LIMIT,
        cpu: SWARM_CONSTANTS.DEFAULT_CPU_LIMIT,
        disk: SWARM_CONSTANTS.DEFAULT_DISK_LIMIT
      },
      qualityThreshold: SWARM_CONSTANTS.DEFAULT_QUALITY_THRESHOLD,
      reviewRequired: true,
      testingRequired: true,
      monitoring: {
        metricsEnabled: true,
        loggingEnabled: true,
        tracingEnabled: false,
        metricsInterval: 10000,
        heartbeatInterval: SWARM_CONSTANTS.DEFAULT_HEARTBEAT_INTERVAL,
        healthCheckInterval: 30000,
        retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
        maxLogSize: 100 * 1024 * 1024, // 100MB
        maxMetricPoints: 10000,
        alertingEnabled: true,
        alertThresholds: {
          errorRate: 0.1,
          responseTime: 5000,
          memoryUsage: 0.8,
          cpuUsage: 0.8
        },
        exportEnabled: false,
        exportFormat: 'json',
        exportDestination: '/tmp/swarm-metrics'
      },
      memory: {
        namespace: 'default',
        partitions: [],
        permissions: {
          read: 'swarm',
          write: 'team',
          delete: 'private',
          share: 'team'
        },
        persistent: true,
        backupEnabled: true,
        distributed: false,
        consistency: 'eventual',
        cacheEnabled: true,
        compressionEnabled: false
      },
      security: {
        authenticationRequired: false,
        authorizationRequired: false,
        encryptionEnabled: false,
        defaultPermissions: ['read', 'write'],
        adminRoles: ['admin', 'coordinator'],
        auditEnabled: true,
        auditLevel: 'info',
        inputValidation: true,
        outputSanitization: true
      },
      performance: {
        maxConcurrency: 10,
        defaultTimeout: SWARM_CONSTANTS.DEFAULT_TASK_TIMEOUT,
        cacheEnabled: true,
        cacheSize: 100,
        cacheTtl: 3600000, // 1 hour
        optimizationEnabled: true,
        adaptiveScheduling: true,
        predictiveLoading: false,
        resourcePooling: true,
        connectionPooling: true,
        memoryPooling: false
      },
      ...config
    };
  }

  private initializeMetrics(): SwarmMetrics {
    return {
      throughput: 0,
      latency: 0,
      efficiency: 0,
      reliability: 0,
      averageQuality: 0,
      defectRate: 0,
      reworkRate: 0,
      resourceUtilization: {},
      costEfficiency: 0,
      agentUtilization: 0,
      agentSatisfaction: 0,
      collaborationEffectiveness: 0,
      scheduleVariance: 0,
      deadlineAdherence: 0
    };
  }

  private initializeProgress(): SwarmProgress {
    return {
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0,
      runningTasks: 0,
      estimatedCompletion: new Date(),
      timeRemaining: 0,
      percentComplete: 0,
      averageQuality: 0,
      passedReviews: 0,
      passedTests: 0,
      resourceUtilization: {},
      costSpent: 0,
      activeAgents: 0,
      idleAgents: 0,
      busyAgents: 0
    };
  }

  // ===== EVENT HANDLING =====

  private setupEventHandlers(): void {
    // Handle agent heartbeats
    this.on('agent.heartbeat', (data: any) => {
      const agent = this.agents.get(data.agentId);
      if (agent) {
        agent.lastHeartbeat = new Date();
        agent.health = data.health || 1.0;
        agent.metrics = { ...agent.metrics, ...data.metrics };
      }
    });

    // Handle task completion events
    this.on('task.completed', (data: any) => {
      this.updateSwarmMetrics();
      this.checkObjectiveCompletion();
    });

    // Handle task failure events
    this.on('task.failed', (data: any) => {
      this.updateSwarmMetrics();
      this.checkObjectiveFailure(data.task);
    });

    // Handle agent errors
    this.on('agent.error', (data: any) => {
      this.handleAgentError(data.agentId, data.error);
    });
  }

  // ===== SWARM EVENT EMITTER IMPLEMENTATION =====

  emitSwarmEvent(event: SwarmEvent): boolean {
    this.events.push(event);
    
    // Limit event history
    if (this.events.length > 1000) {
      this.events = this.events.slice(-500);
    }
    
    return this.emit(event.type, event);
  }

  emitSwarmEvents(events: SwarmEvent[]): boolean {
    let success = true;
    for (const event of events) {
      if (!this.emitSwarmEvent(event)) {
        success = false;
      }
    }
    return success;
  }

  onSwarmEvent(type: EventType, handler: (event: SwarmEvent) => void): this {
    return this.on(type, handler);
  }

  offSwarmEvent(type: EventType, handler: (event: SwarmEvent) => void): this {
    return this.off(type, handler);
  }

  filterEvents(predicate: (event: SwarmEvent) => boolean): SwarmEvent[] {
    return this.events.filter(predicate);
  }

  correlateEvents(correlationId: string): SwarmEvent[] {
    return this.events.filter(event => event.correlationId === correlationId);
  }

  // ===== PUBLIC API METHODS =====

  getSwarmId(): SwarmId {
    return this.swarmId;
  }

  getStatus(): SwarmStatus {
    return this.status;
  }

  getAgents(): AgentState[] {
    return Array.from(this.agents.values());
  }

  getAgent(agentId: string): AgentState | undefined {
    return this.agents.get(agentId);
  }

  getTasks(): TaskDefinition[] {
    return Array.from(this.tasks.values());
  }

  getTask(taskId: string): TaskDefinition | undefined {
    return this.tasks.get(taskId);
  }

  getObjectives(): SwarmObjective[] {
    return Array.from(this.objectives.values());
  }

  getObjective(objectiveId: string): SwarmObjective | undefined {
    return this.objectives.get(objectiveId);
  }

  getMetrics(): SwarmMetrics {
    return { ...this.metrics };
  }

  getEvents(): SwarmEvent[] {
    return [...this.events];
  }

  isRunning(): boolean {
    return this.isRunning;
  }

  getUptime(): number {
    if (!this.startTime) return 0;
    const endTime = this.endTime || new Date();
    return endTime.getTime() - this.startTime.getTime();
  }

  getSwarmStatus(): SwarmStatus & { tasks: { completed: number; failed: number; total: number }; agents: { total: number } } {
    const tasks = Array.from(this.tasks.values());
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const failedTasks = tasks.filter(t => t.status === 'failed').length;
    
    return {
      status: this.status,
      objectives: this.objectives.size,
      tasks: {
        completed: completedTasks,
        failed: failedTasks,
        total: tasks.length
      },
      agents: {
        total: this.agents.size
      }
    };
  }

  // ===== STUB METHODS (TO BE IMPLEMENTED) =====

  private async validateConfiguration(): Promise<ValidationResult> {
    // Implementation needed
    return { valid: true, errors: [], warnings: [], validatedAt: new Date(), validator: 'SwarmCoordinator', context: {} };
  }

  private async initializeSubsystems(): Promise<void> {
    // Implementation needed
  }

  private startBackgroundProcesses(): void {
    // Start heartbeat monitoring
    this.heartbeatTimer = setInterval(() => {
      this.processHeartbeats();
    }, this.config.monitoring.heartbeatInterval);

    // Start performance monitoring
    this.monitoringTimer = setInterval(() => {
      this.updateSwarmMetrics();
    }, this.config.monitoring.metricsInterval);

    // Start cleanup process
    this.cleanupTimer = setInterval(() => {
      this.performCleanup();
    }, 60000); // Every minute
  }

  private stopBackgroundProcesses(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = undefined;
    }
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private async stopAllAgents(): Promise<void> {
    const stopPromises = Array.from(this.agents.keys()).map(agentId => 
      this.stopAgent(agentId)
    );
    await Promise.allSettled(stopPromises);
  }

  private async completeRunningTasks(): Promise<void> {
    const runningTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'running');
    
    // Wait for tasks to complete or timeout
    const timeout = 30000; // 30 seconds
    const deadline = Date.now() + timeout;
    
    while (runningTasks.some(task => task.status === 'running') && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Cancel any remaining running tasks
    for (const task of runningTasks) {
      if (task.status === 'running') {
        await this.cancelTask(task.id.id, 'Swarm shutdown');
      }
    }
  }

  private async saveState(): Promise<void> {
    // Implementation needed - save swarm state to persistence layer
  }

  private determineRequiredAgentTypes(strategy: SwarmStrategy): AgentType[] {
    switch (strategy) {
      case 'research': return ['researcher', 'analyzer'];
      case 'development': return ['developer', 'tester', 'reviewer'];
      case 'analysis': return ['analyzer', 'researcher'];
      case 'testing': return ['tester', 'developer'];
      case 'optimization': return ['analyzer', 'developer'];
      case 'maintenance': return ['developer', 'monitor'];
      default: return ['coordinator', 'developer', 'analyzer'];
    }
  }

  private async decomposeObjective(objective: SwarmObjective): Promise<TaskDefinition[]> {
    // Implementation needed - decompose objective into tasks
    return [];
  }

  private analyzeDependencies(tasks: TaskDefinition[]): any[] {
    // Implementation needed - analyze task dependencies
    return [];
  }

  private async ensureRequiredAgents(objective: SwarmObjective): Promise<void> {
    // Implementation needed - ensure required agents are available
  }

  private async scheduleInitialTasks(objective: SwarmObjective): Promise<void> {
    // Implementation needed - schedule initial tasks
  }

  private startTaskExecutionLoop(objective: SwarmObjective): void {
    // Implementation needed - start task execution loop
  }

  private getNextInstanceNumber(type: AgentType): number {
    const agentsOfType = Array.from(this.agents.values())
      .filter(agent => agent.type === type);
    return agentsOfType.length + 1;
  }

  private getDefaultPermissions(type: AgentType): string[] {
    switch (type) {
      case 'coordinator': return ['read', 'write', 'execute', 'admin'];
      case 'developer': return ['read', 'write', 'execute'];
      case 'tester': return ['read', 'execute'];
      case 'reviewer': return ['read', 'write'];
      default: return ['read'];
    }
  }

  private async initializeAgentCapabilities(agent: AgentState): Promise<void> {
    // Set capabilities based on agent type
    switch (agent.type) {
      case 'coordinator':
        agent.capabilities.codeGeneration = false;
        agent.capabilities.codeReview = true;
        agent.capabilities.testing = false;
        agent.capabilities.documentation = true;
        agent.capabilities.research = true;
        agent.capabilities.analysis = true;
        break;
      case 'developer':
        agent.capabilities.codeGeneration = true;
        agent.capabilities.codeReview = true;
        agent.capabilities.testing = true;
        agent.capabilities.documentation = true;
        break;
      case 'researcher':
        agent.capabilities.research = true;
        agent.capabilities.analysis = true;
        agent.capabilities.webSearch = true;
        agent.capabilities.documentation = true;
        break;
      case 'analyzer':
        agent.capabilities.analysis = true;
        agent.capabilities.research = true;
        agent.capabilities.documentation = true;
        break;
      case 'reviewer':
        agent.capabilities.codeReview = true;
        agent.capabilities.testing = true;
        agent.capabilities.documentation = true;
        break;
      case 'tester':
        agent.capabilities.testing = true;
        agent.capabilities.codeReview = true;
        break;
    }
  }

  private async initializeAgentEnvironment(agent: AgentState): Promise<void> {
    // Implementation needed - setup agent environment
  }

  private startAgentHeartbeat(agent: AgentState): void {
    // Implementation needed - start agent heartbeat
  }

  private stopAgentHeartbeat(agent: AgentState): void {
    // Implementation needed - stop agent heartbeat
  }

  private async cleanupAgentEnvironment(agent: AgentState): Promise<void> {
    // Implementation needed - cleanup agent environment
  }

  private getRequiredCapabilities(type: TaskType): string[] {
    switch (type) {
      case 'coding': return ['code-generation', 'file-system'];
      case 'testing': return ['testing', 'code-review'];
      case 'research': return ['research', 'web-search'];
      case 'analysis': return ['analysis', 'documentation'];
      case 'review': return ['code-review', 'documentation'];
      case 'documentation': return ['documentation'];
      default: return [];
    }
  }

  private getRequiredTools(type: TaskType): string[] {
    switch (type) {
      case 'coding': return ['editor', 'compiler', 'debugger'];
      case 'testing': return ['test-runner', 'coverage-tool'];
      case 'research': return ['web-browser', 'search-engine'];
      case 'analysis': return ['data-tools', 'visualization'];
      default: return [];
    }
  }

  private getRequiredPermissions(type: TaskType): string[] {
    switch (type) {
      case 'coding': return ['read', 'write', 'execute'];
      case 'testing': return ['read', 'execute'];
      case 'research': return ['read', 'network'];
      default: return ['read'];
    }
  }

  private async executeTaskWithAgent(task: TaskDefinition, agent: AgentState): Promise<any> {
    // Implementation needed - execute task with agent
    // This would spawn actual Claude processes and manage execution
    return { success: true, output: 'Task completed successfully' };
  }

  private assessTaskQuality(task: TaskDefinition, result: any): number {
    // Implementation needed - assess task quality
    return 0.8;
  }

  private updateAgentMetrics(agent: AgentState, task: TaskDefinition): void {
    // Update agent performance metrics
    const executionTime = task.completedAt!.getTime() - (task.startedAt?.getTime() || 0);
    
    agent.metrics.averageExecutionTime = 
      (agent.metrics.averageExecutionTime * agent.metrics.tasksCompleted + executionTime) / 
      (agent.metrics.tasksCompleted + 1);
    
    agent.metrics.successRate = 
      agent.metrics.tasksCompleted / (agent.metrics.tasksCompleted + agent.metrics.tasksFailed);
  }

  private async processDependentTasks(task: TaskDefinition): Promise<void> {
    // Implementation needed - process tasks that depend on this one
  }

  private isRecoverableError(error: any): boolean {
    // Implementation needed - determine if error is recoverable
    return true;
  }

  private isRetryableError(error: any): boolean {
    // Implementation needed - determine if error is retryable
    return true;
  }

  private async handleTaskFailureCascade(task: TaskDefinition): Promise<void> {
    // Implementation needed - handle failure cascade
  }

  private async reassignTask(taskId: string): Promise<void> {
    // Implementation needed - reassign task to different agent
  }

  private processHeartbeats(): void {
    const now = new Date();
    const timeout = this.config.monitoring.heartbeatInterval * 3;
    
    for (const agent of this.agents.values()) {
      if (agent.status === 'offline' || agent.status === 'terminated') {
        continue;
      }
      
      const timeSinceHeartbeat = now.getTime() - agent.lastHeartbeat.getTime();
      if (timeSinceHeartbeat > timeout) {
        this.logger.warn('Agent heartbeat timeout', { 
          agentId: agent.id.id, 
          timeSinceHeartbeat 
        });
        agent.status = 'error';
        agent.health = 0;
      }
    }
  }

  private updateSwarmMetrics(): void {
    // Implementation needed - update swarm-level metrics
  }

  private performCleanup(): void {
    // Implementation needed - perform periodic cleanup
  }

  private checkObjectiveCompletion(): void {
    // Implementation needed - check if objectives are complete
  }

  private checkObjectiveFailure(task: TaskDefinition): void {
    // Implementation needed - check if objective has failed
  }

  private handleAgentError(agentId: string, error: any): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'error';
      agent.health = 0;
      this.logger.error('Agent error', { agentId, error });
    }
  }
}