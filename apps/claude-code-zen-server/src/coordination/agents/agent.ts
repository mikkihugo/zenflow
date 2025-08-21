/**
 * @file Coordination system: agent.
 */

import { getLogger } from '@claude-zen/foundation'

import type {
  Agent,
  AgentCapabilities,
  AgentConfig,
  AgentMetrics,
  AgentState,
  AgentStatus,
  AgentType,
  ExecutionResult,
  Message,
  MessageType,
  Task,
} from '../types';

const logger = getLogger('coordination-agents-agent');

/**
 * Agent implementation and wrappers.
 */

// Local utility functions (replacing deleted swarm utils)
const generateId = () => `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const getDefaultCognitiveProfile = () => ({ learning: true, adaptation: 0.5, memory: 0.8 });

export class BaseAgent implements Agent {
  id: string;
  type: AgentType;
  capabilities: AgentCapabilities;
  metrics: AgentMetrics;
  config: AgentConfig;
  state: AgentState;
  connections: string[] = [];

  private messageHandlers: Map<
    MessageType,
    (message: Message) => Promise<void>
  > = new Map();
  private wasmAgentId?: number;

  // Convenience getter for status
  get status(): AgentStatus {
    return this.state.status;
  }

  // Convenience setter for status
  set status(value: AgentStatus) {
    this.state.status = value;
  }

  constructor(config: AgentConfig) {
    this.id = config?.id || generateId();
    this.type = config?.type;
    this.config = {
      ...config,
      id: this.id,
      cognitiveProfile:
        config?.cognitiveProfile || getDefaultCognitiveProfile(),
    };

    // Initialize metrics
    this.metrics = {
      tasksCompleted: 0,
      averageResponseTime: 0,
      errorRate: 0,
      uptime: 0,
      lastActivity: new Date(),
      tasksFailed: 0,
      averageExecutionTime: 0,
      tasksInProgress: 0,
      successRate: 0,
      resourceUsage: {
        memory: 0,
        cpu: 0,
        disk: 0,
      },
    };

    // Initialize capabilities
    this.capabilities = {
      codeGeneration: true,
      codeReview: true,
      testing: true,
      documentation: true,
      research: true,
      analysis: true,
      webSearch: false,
      apiIntegration: true,
      fileSystem: true,
      terminalAccess: true,
      languages: ['typescript', 'javascript', 'python'],
      frameworks: ['node', 'react', 'express'],
      domains: ['web', 'api', 'testing'],
      tools: ['git', 'npm', 'vitest'],
      maxConcurrentTasks: 3,
      maxMemoryUsage: 512,
      maxExecutionTime: 30000,
      reliability: 0.95,
      speed: 0.8,
      quality: 0.9,
    };

    this.state = {
      status: 'idle',
      currentTask: null,
      lastUpdate: new Date(),
      health: 'healthy',
      lastHeartbeat: new Date(),
      metrics: this.metrics,
      name: config?.name || `Agent-${this.id}`,
      type: config?.type,
      id: {
        id: this.id,
        swarmId: config?.swarmId,
        type: config?.type,
        instance: 1,
      },
      environment: {
        runtime: 'node',
        version: process.version,
        workingDirectory: process.cwd(),
        tempDirectory: '/tmp',
        logDirectory: './logs',
        apiEndpoints: {},
        credentials: {},
        availableTools: [],
        toolConfigs: {},
      },
      config: this.config,
      workload: 0,
      errorHistory: [],
      capabilities: this.capabilities,
      load: 0,
    };

    this.setupMessageHandlers();
  }

  private setupMessageHandlers(): void {
    this.messageHandlers.set(
      'task_assignment',
      this.handleTaskAssignment.bind(this)
    );
    this.messageHandlers.set(
      'coordination',
      this.handleCoordination.bind(this)
    );
    this.messageHandlers.set(
      'knowledge_share',
      this.handleKnowledgeShare.bind(this)
    );
    this.messageHandlers.set(
      'status_update',
      this.handleStatusUpdate.bind(this)
    );
  }

  protected async executeTaskByType(task: Task): Promise<unknown> {
    // Simulate work
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 400)
    );

    return {
      taskId: task.id,
      agentId: this.id,
      result: `Task completed by ${this.config.type} agent`,
      timestamp: Date.now(),
    };
  }

  async communicate(message: Message): Promise<void> {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      await handler(message);
    } else {
      logger.warn(`No handler for message type: ${message.type}`);
    }
  }

  update(state: Partial<AgentState>): void {
    this.state = { ...this.state, ...state };
  }

  private updatePerformanceMetrics(
    success: boolean,
    executionTime: number
  ): void {
    if (success) {
      this.metrics.tasksCompleted++;
    } else {
      this.metrics.tasksFailed = (this.metrics.tasksFailed || 0) + 1;
    }

    const totalTasks =
      this.metrics.tasksCompleted + (this.metrics.tasksFailed || 0);
    this.metrics.successRate =
      totalTasks > 0 ? this.metrics.tasksCompleted / totalTasks : 0;

    // Update average execution time
    const currentAverage = this.metrics.averageExecutionTime || 0;
    const totalTime = currentAverage * (totalTasks - 1) + executionTime;
    this.metrics.averageExecutionTime = totalTime / totalTasks;
  }

  private async handleTaskAssignment(message: Message): Promise<void> {
    const task = message.payload as Task;

    // Execute the assigned task
    this.state.status = 'busy';
    try {
      const result = await this.execute(task);

      // Send result back to the swarm coordinator
      await this.communicate({
        id: `result-${Date.now()}`,
        type: 'result',
        payload: result,
        timestamp: new Date(),
        fromAgentId: this.id,
        toAgentId: message.fromAgentId,
        swarmId: message.swarmId,
      });

      this.state.status = 'idle';
    } catch (error) {
      this.state.status = 'error';
      throw error;
    }
  }

  private async handleCoordination(_message: Message): Promise<void> {
    // Handle coordination logic
  }

  private async handleKnowledgeShare(message: Message): Promise<void> {
    // Store shared knowledge in memory
    if (
      this.config.memory &&
      typeof this.config?.memory === 'object' &&
      'shortTerm' in this.config.memory
    ) {
      const memory = this.config.memory as { shortTerm: Map<string, unknown> };
      memory.shortTerm.set(`knowledge_${message.id}`, message.payload);
    }
  }

  private async handleStatusUpdate(_message: Message): Promise<void> {
    // Process status update
  }

  setWasmAgentId(id: number): void {
    this.wasmAgentId = id;
  }

  getWasmAgentId(): number | undefined {
    return this.wasmAgentId;
  }

  // Required Agent interface methods
  async initialize(): Promise<void> {
    this.state.status = 'initializing';
    // Initialize agent resources, connections, etc.
    this.state.status = 'idle';
    this.state.lastHeartbeat = new Date();
  }

  async execute(task: Task): Promise<ExecutionResult> {
    const startTime = Date.now();
    this.state.status = 'busy';
    this.state.currentTask = task.id;

    try {
      // Basic task execution - can be overridden by specialized agents
      const result: ExecutionResult = {
        success: true,
        data: { message: `Task ${task.id} completed by ${this.type} agent` },
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
        agentId: this.id,
        metadata: {
          agentType: this.type,
          taskId: task.id,
        },
      };

      this.metrics.tasksCompleted++;
      this.updatePerformanceMetrics(true, result.executionTime || 0);
      return result;
    } catch (error) {
      this.metrics.tasksFailed = (this.metrics.tasksFailed || 0) + 1;
      this.updatePerformanceMetrics(false, Date.now() - startTime);

      return {
        success: false,
        data: { error: error instanceof Error ? error.message : String(error) },
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
        agentId: this.id,
        metadata: {
          agentType: this.type,
          taskId: task.id,
        },
      };
    } finally {
      this.state.status = 'idle';
      this.state.currentTask = null;
      this.state.lastHeartbeat = new Date();
    }
  }

  async handleMessage(message: Message): Promise<void> {
    await this.communicate(message);
  }

  updateState(updates: Partial<AgentState>): void {
    this.state = { ...this.state, ...updates };
  }

  getStatus(): AgentStatus {
    return this.state.status;
  }

  async shutdown(): Promise<void> {
    this.state.status = 'terminated';
    // Clean up resources, close connections, etc.
    this.state.status = 'offline';
  }
}

/**
 * Specialized agent for research tasks.
 *
 * @example
 */
export class ResearcherAgent extends BaseAgent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ ...config, type: 'researcher' });
  }

  protected override async executeTaskByType(task: Task): Promise<unknown> {
    // Simulate research activities
    const phases = [
      'collecting_data',
      'analyzing',
      'synthesizing',
      'reporting',
    ];
    const results: unknown[] = [];

    for (const phase of phases) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      results.push({
        phase,
        timestamp: Date.now(),
        findings: `${phase} completed for ${task.description}`,
      });
    }

    return {
      taskId: task.id,
      agentId: this.id,
      type: 'research_report',
      phases: results,
      summary: `Research completed on: ${task.description}`,
      recommendations: [
        'Further investigation needed',
        'Consider alternative approaches',
      ],
    };
  }
}

/**
 * Specialized agent for coding tasks.
 *
 * @example
 */
export class CoderAgent extends BaseAgent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ ...config, type: 'coder' });
  }

  protected override async executeTaskByType(task: Task): Promise<unknown> {
    // Simulate coding activities
    const steps = ['design', 'implement', 'test', 'refactor'];
    const codeArtifacts: unknown[] = [];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      codeArtifacts.push({
        step,
        timestamp: Date.now(),
        artifact: `${step}_${task.id}.ts`,
      });
    }

    return {
      taskId: task.id,
      agentId: this.id,
      type: 'code_implementation',
      artifacts: codeArtifacts,
      summary: `Implementation completed for: ${task.description}`,
      metrics: {
        linesOfCode: Math.floor(Math.random() * 500) + 100,
        complexity: Math.floor(Math.random() * 10) + 1,
      },
    };
  }
}

/**
 * Specialized agent for analysis tasks.
 *
 * @example
 */
export class AnalystAgent extends BaseAgent {
  constructor(config: Omit<AgentConfig, 'type'>) {
    super({ ...config, type: 'analyst' });
  }

  protected override async executeTaskByType(task: Task): Promise<unknown> {
    // Simulate analysis activities
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      taskId: task.id,
      agentId: this.id,
      type: 'analysis_report',
      metrics: {
        dataPoints: Math.floor(Math.random() * 1000) + 100,
        confidence: Math.random() * 0.3 + 0.7,
      },
      insights: [
        'Pattern detected in data',
        'Anomaly found at timestamp X',
        'Recommendation for optimization',
      ],
      visualizations: ['chart_1.png', 'graph_2.svg'],
    };
  }
}

/**
 * Factory function to create specialized agents.
 *
 * @param config
 * @example
 */
export function createAgent(config: AgentConfig): Agent {
  switch (config?.type) {
    case 'researcher':
      return new ResearcherAgent(config);
    case 'coder':
      return new CoderAgent(config);
    case 'analyst':
      return new AnalystAgent(config);
    default:
      return new BaseAgent(config);
  }
}

/**
 * Agent pool for managing multiple agents.
 *
 * @example
 */
export class AgentPool {
  private agents: Map<string, Agent> = new Map();
  private availableAgents: Set<string> = new Set();

  addAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    if (agent.state?.status === 'idle') {
      this.availableAgents.add(agent.id);
    }
  }

  removeAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.availableAgents.delete(agentId);
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAvailableAgent(preferredType?: string): Agent | undefined {
    let selectedAgent: Agent | undefined;

    for (const agentId of Array.from(this.availableAgents)) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;

      if (!preferredType || agent.config?.type === preferredType) {
        selectedAgent = agent;
        break;
      }
    }

    if (!selectedAgent && this.availableAgents.size > 0) {
      const firstAvailable = Array.from(this.availableAgents)[0];
      if (firstAvailable) {
        selectedAgent = this.agents.get(firstAvailable);
      }
    }

    if (selectedAgent?.id) {
      this.availableAgents.delete(selectedAgent?.id);
    }

    return selectedAgent;
  }

  releaseAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent && agent.state?.status === 'idle') {
      this.availableAgents.add(agentId);
    }
  }

  getAllAgents(): Agent[] {
    const agentList: Agent[] = [];
    for (const agent of Array.from(this.agents.values())) {
      agentList.push(agent);
    }
    return agentList;
  }

  getAgentsByType(type: string): Agent[] {
    return this.getAllAgents().filter((agent) => agent.config?.type === type);
  }

  getAgentsByStatus(status: AgentStatus): Agent[] {
    return this.getAllAgents().filter(
      (agent) => agent.state?.status === status
    );
  }

  async shutdown(): Promise<void> {
    // Shutdown all agents
    const agentList = this.getAllAgents();
    for (const agent of agentList) {
      if (typeof agent?.shutdown === 'function') {
        await agent.shutdown();
      }
    }

    // Clear the pools
    this.agents.clear();
    this.availableAgents.clear();
  }
}
