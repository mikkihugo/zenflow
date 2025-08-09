/**
 * Swarm Coordinator.
 * Central coordination for swarm operations and agent management.
 */
/**
 * @file swarm coordination system
 */



import { EventEmitter } from 'node:events';
import type { AgentType } from '../types/agent-types';
import type { SwarmTopology } from '../types/shared-types';

export interface SwarmAgent {
  id: string;
  type: AgentType;
  status: 'idle' | 'busy' | 'offline' | 'error';
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    averageResponseTime: number;
    errorRate: number;
  };
  connections: string[];
}

export interface SwarmMetrics {
  agentCount: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  averageResponseTime: number;
  throughput: number;
  errorRate: number;
  uptime: number;
}

export interface SwarmCoordinationEvent {
  type: 'agent_joined' | 'agent_left' | 'task_assigned' | 'task_completed' | 'coordination_event';
  agentId?: string;
  taskId?: string;
  data: any;
  timestamp: Date;
}

export class SwarmCoordinator extends EventEmitter {
  private agents = new Map<string, SwarmAgent>();
  private tasks = new Map<string, any>();
  private metrics: SwarmMetrics = {
    agentCount: 0,
    activeAgents: 0,
    totalTasks: 0,
    completedTasks: 0,
    averageResponseTime: 0,
    throughput: 0,
    errorRate: 0,
    uptime: 0,
  };
  private startTime = Date.now();
  private swarmId = `swarm-${Date.now()}`;
  private state: 'initializing' | 'active' | 'terminated' = 'initializing';

  /**
   * Initialize the swarm coordinator.
   *
   * @param config
   */
  async initialize(config?: any): Promise<void> {
    this.state = 'active';
    this.emit('swarm:initialized', { swarmId: this.swarmId, config });
  }

  /**
   * Shutdown the swarm coordinator.
   */
  async shutdown(): Promise<void> {
    this.state = 'terminated';
    this.agents.clear();
    this.tasks.clear();
    this.emit('swarm:shutdown', { swarmId: this.swarmId });
  }

  /**
   * Get the current state.
   */
  getState(): 'initializing' | 'active' | 'terminated' {
    return this.state;
  }

  /**
   * Get the swarm ID.
   */
  getSwarmId(): string {
    return this.swarmId;
  }

  /**
   * Get total agent count.
   */
  getAgentCount(): number {
    return this.agents.size;
  }

  /**
   * Get list of active agent IDs.
   */
  getActiveAgents(): string[] {
    return Array.from(this.agents.values())
      .filter((agent) => agent.status === 'idle' || agent.status === 'busy')
      .map((agent) => agent.id);
  }

  /**
   * Get task count.
   */
  getTaskCount(): number {
    return this.tasks.size;
  }

  /**
   * Get uptime in milliseconds.
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Add an agent to the swarm.
   *
   * @param agent
   */
  async addAgent(agent: Omit<SwarmAgent, 'performance' | 'connections'>): Promise<void> {
    const fullAgent: SwarmAgent = {
      ...agent,
      performance: {
        tasksCompleted: 0,
        averageResponseTime: 0,
        errorRate: 0,
      },
      connections: [],
    };

    this.agents.set(agent.id, fullAgent);
    this.updateMetrics();

    this.emit('agent:added', { agent: fullAgent });
  }

  /**
   * Remove an agent from the swarm.
   *
   * @param agentId
   */
  async removeAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    this.agents.delete(agentId);
    this.updateMetrics();

    this.emit('agent:removed', { agentId, agent });
  }

  /**
   * Get all agents.
   */
  getAgents(): SwarmAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by ID.
   *
   * @param agentId
   */
  getAgent(agentId: string): SwarmAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Assign a task to the best available agent.
   *
   * @param task
   * @param task.id
   * @param task.type
   * @param task.requirements
   * @param task.priority
   */
  async assignTask(task: {
    id: string;
    type: string;
    requirements: string[];
    priority: number;
  }): Promise<string | null> {
    const suitableAgents = this.findSuitableAgents(task.requirements);
    if (suitableAgents.length === 0) {
      return null;
    }

    // Select the best agent based on performance and availability
    const bestAgent = this.selectBestAgent(suitableAgents);
    bestAgent.status = 'busy';

    this.tasks.set(task.id, {
      ...task,
      assignedTo: bestAgent.id,
      startTime: Date.now(),
    });

    this.updateMetrics();
    this.emit('task:assigned', { task, agentId: bestAgent.id });

    return bestAgent.id;
  }

  /**
   * Complete a task.
   *
   * @param taskId
   * @param result
   */
  async completeTask(taskId: string, result: any): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const agent = this.agents.get(task.assignedTo);
    if (agent) {
      agent.status = 'idle';
      agent.performance.tasksCompleted++;

      const duration = Date.now() - task.startTime;
      agent.performance.averageResponseTime =
        (agent.performance.averageResponseTime * (agent.performance.tasksCompleted - 1) +
          duration) /
        agent.performance.tasksCompleted;
    }

    this.tasks.delete(taskId);
    this.updateMetrics();

    this.emit('task:completed', { taskId, result, duration: Date.now() - task.startTime });
  }

  /**
   * Get current swarm metrics.
   */
  getMetrics(): SwarmMetrics {
    return { ...this.metrics };
  }

  /**
   * Coordinate swarm operations.
   *
   * @param agents
   * @param topology
   */
  async coordinateSwarm(
    agents: SwarmAgent[],
    topology?: SwarmTopology
  ): Promise<{
    success: boolean;
    averageLatency: number;
    successRate: number;
    agentsCoordinated: number;
  }> {
    const startTime = Date.now();
    let successfulCoordinations = 0;
    const latencies: number[] = [];

    for (const agent of agents) {
      try {
        const coordinationStart = Date.now();
        await this.coordinateAgent(agent, topology);
        const latency = Date.now() - coordinationStart;

        latencies.push(latency);
        successfulCoordinations++;
      } catch (error) {
        // Log error but continue with other agents
        this.emit('coordination:error', { agentId: agent.id, error });
      }
    }

    const averageLatency =
      latencies.length > 0 ? latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length : 0;

    const successRate = agents.length > 0 ? successfulCoordinations / agents.length : 0;

    // Log coordination performance metrics
    const totalCoordinationTime = Date.now() - startTime;
    this.emit('coordination:performance', {
      totalAgents: agents.length,
      successfulCoordinations,
      averageLatency,
      successRate,
      totalCoordinationTime,
      timestamp: new Date(),
    });

    return {
      success: successRate > 0.8, // 80% success rate threshold
      averageLatency,
      successRate,
      agentsCoordinated: successfulCoordinations,
    };
  }

  private async coordinateAgent(agent: SwarmAgent, _topology?: SwarmTopology): Promise<void> {
    // Mock coordination logic - in real implementation would handle actual coordination
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 10 + 1)); // 1-11ms delay

    // Update agent status based on coordination
    if (!this.agents.has(agent.id)) {
      await this.addAgent(agent);
    } else {
      const existingAgent = this.agents.get(agent.id)!;
      existingAgent.status = agent.status;
      existingAgent.capabilities = agent.capabilities;
    }
  }

  private findSuitableAgents(requirements: string[]): SwarmAgent[] {
    return Array.from(this.agents.values()).filter((agent) => {
      return (
        agent.status === 'idle' && requirements.every((req) => agent.capabilities.includes(req))
      );
    });
  }

  private selectBestAgent(agents: SwarmAgent[]): SwarmAgent {
    // Select agent with best performance and lowest error rate
    return agents.reduce((best, current) => {
      const bestScore = this.calculateAgentScore(best);
      const currentScore = this.calculateAgentScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculateAgentScore(agent: SwarmAgent): number {
    const completionRate = agent.performance.tasksCompleted;
    const errorPenalty = agent.performance.errorRate * 100;
    const responsePenalty = agent.performance.averageResponseTime / 1000;

    return completionRate - errorPenalty - responsePenalty;
  }

  private updateMetrics(): void {
    const agents = Array.from(this.agents.values());
    this.metrics.agentCount = agents.length;
    this.metrics.activeAgents = agents.filter((a) => a.status !== 'offline').length;

    if (agents.length > 0) {
      const totalTasks = agents.reduce((sum, a) => sum + a.performance.tasksCompleted, 0);
      const totalResponseTime = agents.reduce(
        (sum, a) => sum + a.performance.averageResponseTime,
        0
      );
      const totalErrors = agents.reduce((sum, a) => sum + a.performance.errorRate, 0);

      this.metrics.completedTasks = totalTasks;
      this.metrics.averageResponseTime = totalResponseTime / agents.length;
      this.metrics.errorRate = totalErrors / agents.length;
      this.metrics.uptime = Date.now() - this.startTime;
      this.metrics.throughput = totalTasks / (this.metrics.uptime / 1000 / 60); // tasks per minute
    }
  }
}

export default SwarmCoordinator;
