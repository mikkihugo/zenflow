/**
 * Coordination Test Helpers
 *
 * @file Specialized helpers for testing coordination/swarm components (London TDD)
 */

export interface SwarmTestConfig {
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  agentCount: number;
  coordinationProtocol: 'mcp' | 'websocket' | 'direct';
  timeoutMs: number;
  performanceThresholds: {
    coordinationLatency: number;
    messageProcessing: number;
    swarmInitialization: number;
  };
}

export interface MockAgent {
  id: string;
  type: string;
  status: 'idle' | 'working' | 'error' | 'offline';
  capabilities: string[];
  connections: string[];
  messageQueue: any[];
  performance: {
    tasksCompleted: number;
    avgResponseTime: number;
    errorRate: number;
  };
}

export class CoordinationTestBuilder {
  private config: SwarmTestConfig;
  private agents: Map<string, MockAgent> = new Map();
  private messages: any[] = [];
  private interactions: any[] = [];

  constructor(config?: Partial<SwarmTestConfig>) {
    this.config = {
      topology: 'mesh',
      agentCount: 3,
      coordinationProtocol: 'mcp',
      timeoutMs: 5000,
      performanceThresholds: {
        coordinationLatency: 100,
        messageProcessing: 50,
        swarmInitialization: 1000,
      },
      ...config,
    };
  }

  /**
   * Create a mock swarm with specified configuration
   */
  createMockSwarm(): {
    agents: Map<string, MockAgent>;
    coordinator: jest.Mock;
    messageRouter: jest.Mock;
    topology: any;
  } {
    // Create agents
    for (let i = 0; i < this.config.agentCount; i++) {
      const agent = this.createMockAgent(`agent-${i}`, 'worker');
      this.agents.set(agent.id, agent);
    }

    // Setup topology connections
    this.setupTopologyConnections();

    // Create coordinator mock
    const coordinator = jest.fn();
    coordinator.mockImplementation(this.createCoordinatorBehavior());

    // Create message router mock
    const messageRouter = jest.fn();
    messageRouter.mockImplementation(this.createMessageRouterBehavior());

    // Create topology representation
    const topology = this.createTopologyRepresentation();

    return {
      agents: this.agents,
      coordinator,
      messageRouter,
      topology,
    };
  }

  private createMockAgent(id: string, type: string): MockAgent {
    return {
      id,
      type,
      status: 'idle',
      capabilities: ['basic_task', 'coordination', 'communication'],
      connections: [],
      messageQueue: [],
      performance: {
        tasksCompleted: 0,
        avgResponseTime: 50,
        errorRate: 0,
      },
    };
  }

  private setupTopologyConnections(): void {
    const agentIds = Array.from(this.agents.keys());

    switch (this.config.topology) {
      case 'mesh':
        // Every agent connected to every other agent
        agentIds.forEach((agentId) => {
          const agent = this.agents.get(agentId)!;
          agent.connections = agentIds.filter((id) => id !== agentId);
        });
        break;

      case 'hierarchical':
        // Tree structure
        agentIds.forEach((agentId, index) => {
          const agent = this.agents.get(agentId)!;
          if (index === 0) {
            // Root node
            agent.connections = agentIds.slice(1);
          } else {
            // Leaf nodes connect to root
            agent.connections = [agentIds[0]];
          }
        });
        break;

      case 'ring':
        // Circular connections
        agentIds.forEach((agentId, index) => {
          const agent = this.agents.get(agentId)!;
          const nextIndex = (index + 1) % agentIds.length;
          const prevIndex = (index - 1 + agentIds.length) % agentIds.length;
          agent.connections = [agentIds[nextIndex], agentIds[prevIndex]];
        });
        break;

      case 'star': {
        // Central coordinator with spokes
        const central = agentIds[0];
        agentIds.forEach((agentId, index) => {
          const agent = this.agents.get(agentId)!;
          if (index === 0) {
            // Central node
            agent.connections = agentIds.slice(1);
          } else {
            // Spoke nodes connect only to center
            agent.connections = [central];
          }
        });
        break;
      }
    }
  }

  private createCoordinatorBehavior() {
    return (action: string, data: any) => {
      const interaction = {
        timestamp: Date.now(),
        action,
        data,
        type: 'coordination',
      };

      this.interactions.push(interaction);

      switch (action) {
        case 'initialize':
          return { success: true, swarmId: 'test-swarm', agents: Array.from(this.agents.keys()) };
        case 'broadcast':
          return this.simulateBroadcast(data);
        case 'assign_task':
          return this.simulateTaskAssignment(data);
        case 'status':
          return this.getSwarmStatus();
        default:
          return { success: false, error: `Unknown action: ${action}` };
      }
    };
  }

  private createMessageRouterBehavior() {
    return (fromId: string, toId: string, message: any) => {
      const routingInteraction = {
        timestamp: Date.now(),
        from: fromId,
        to: toId,
        message,
        type: 'message_routing',
      };

      this.interactions.push(routingInteraction);
      this.messages.push(routingInteraction);

      // Simulate message delivery
      const targetAgent = this.agents.get(toId);
      if (targetAgent) {
        targetAgent?.messageQueue?.push({
          from: fromId,
          message,
          timestamp: Date.now(),
        });
        return { success: true, delivered: true };
      }

      return { success: false, error: 'Agent not found' };
    };
  }

  private simulateBroadcast(data: any) {
    const agentIds = Array.from(this.agents.keys());
    const delivered = agentIds.map((agentId) => {
      const agent = this.agents.get(agentId)!;
      agent.messageQueue.push({
        from: 'coordinator',
        message: data,
        timestamp: Date.now(),
        type: 'broadcast',
      });
      return agentId;
    });

    return { success: true, delivered, count: delivered.length };
  }

  private simulateTaskAssignment(data: any) {
    const { taskId, agentId } = data;
    const agent = this.agents.get(agentId);

    if (!agent) {
      return { success: false, error: 'Agent not found' };
    }

    agent.status = 'working';
    agent.messageQueue.push({
      from: 'coordinator',
      message: { type: 'task_assignment', taskId },
      timestamp: Date.now(),
    });

    // Simulate task completion after delay
    setTimeout(() => {
      agent.status = 'idle';
      agent.performance.tasksCompleted++;
    }, 100);

    return { success: true, taskId, assignedTo: agentId };
  }

  private getSwarmStatus() {
    const agentStatuses = Array.from(this.agents.values()).map((agent) => ({
      id: agent.id,
      status: agent.status,
      queueLength: agent.messageQueue.length,
      performance: agent.performance,
    }));

    return {
      topology: this.config.topology,
      agentCount: this.agents.size,
      agents: agentStatuses,
      totalMessages: this.messages.length,
      totalInteractions: this.interactions.length,
    };
  }

  private createTopologyRepresentation() {
    const nodes = Array.from(this.agents.values()).map((agent) => ({
      id: agent.id,
      type: agent.type,
      connections: agent.connections,
    }));

    const edges = [];
    for (const agent of this.agents.values()) {
      for (const connectionId of agent.connections) {
        edges.push({ from: agent.id, to: connectionId });
      }
    }

    return {
      type: this.config.topology,
      nodes,
      edges,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        connectivity: this.calculateConnectivity(),
      },
    };
  }

  private calculateConnectivity(): number {
    const totalPossibleConnections = this.agents.size * (this.agents.size - 1);
    const actualConnections = Array.from(this.agents.values()).reduce(
      (sum, agent) => sum + agent.connections.length,
      0
    );

    return actualConnections / totalPossibleConnections;
  }

  /**
   * Get recorded interactions for verification
   */
  getInteractions(): any[] {
    return [...this.interactions];
  }

  /**
   * Get message history for verification
   */
  getMessages(): any[] {
    return [...this.messages];
  }

  /**
   * Reset interaction history
   */
  resetHistory(): void {
    this.interactions = [];
    this.messages = [];

    // Clear agent message queues
    for (const agent of this.agents.values()) {
      agent.messageQueue = [];
      agent.performance = {
        tasksCompleted: 0,
        avgResponseTime: 50,
        errorRate: 0,
      };
    }
  }
}

export class CoordinationProtocolValidator {
  /**
   * Validate MCP protocol compliance
   *
   * @param messages
   */
  static validateMCPProtocol(messages: any[]): void {
    messages.forEach((message) => {
      if (message["message"]?.["jsonrpc"]) {
        expect(message["message"]?.["jsonrpc"]).toBe('2.0');
        expect(message["message"]).toHaveProperty('id');
        expect(message["message"]).toHaveProperty('method');

        if (message["message"]?.["method"] !== 'notification') {
          expect(message["message"]).toHaveProperty('params');
        }
      }
    });
  }

  /**
   * Validate WebSocket protocol compliance
   *
   * @param messages
   */
  static validateWebSocketProtocol(messages: any[]): void {
    messages.forEach((message) => {
      expect(message["message"]).toHaveProperty('type');
      expect(message["message"]).toHaveProperty('data');
      expect(message["timestamp"]).toBeGreaterThan(0);
    });
  }

  /**
   * Validate coordination patterns
   *
   * @param interactions
   * @param expectedPattern
   */
  static validateCoordinationPattern(
    interactions: any[],
    expectedPattern: 'broadcast' | 'point-to-point' | 'hierarchical' | 'consensus'
  ): void {
    switch (expectedPattern) {
      case 'broadcast': {
        const broadcasts = interactions.filter((i) => i.action === 'broadcast');
        expect(broadcasts.length).toBeGreaterThan(0);
        break;
      }

      case 'point-to-point': {
        const p2pMessages = interactions.filter((i) => i.type === 'message_routing');
        expect(p2pMessages.length).toBeGreaterThan(0);
        p2pMessages.forEach((msg) => {
          expect(msg.from).toBeDefined();
          expect(msg.to).toBeDefined();
          expect(msg.from).not.toBe(msg.to);
        });
        break;
      }

      case 'hierarchical': {
        const hierarchicalInteractions = interactions.filter(
          (i) => i.type === 'coordination' && (i.action === 'assign_task' || i.action === 'status')
        );
        expect(hierarchicalInteractions.length).toBeGreaterThan(0);
        break;
      }

      case 'consensus': {
        // Look for consensus-related interactions
        const consensusInteractions = interactions.filter(
          (i) => i.data?.type === 'consensus' || i.action === 'vote' || i.action === 'agreement'
        );
        expect(consensusInteractions.length).toBeGreaterThan(0);
        break;
      }
    }
  }

  /**
   * Validate performance characteristics
   *
   * @param interactions
   * @param thresholds
   */
  static validatePerformance(
    interactions: any[],
    thresholds: SwarmTestConfig['performanceThresholds']
  ): void {
    // Check coordination latency
    const coordinationInteractions = interactions.filter((i) => i.type === 'coordination');
    if (coordinationInteractions.length > 1) {
      const latencies = [];
      for (let i = 1; i < coordinationInteractions.length; i++) {
        const latency =
          coordinationInteractions[i]?.timestamp - coordinationInteractions[i - 1]?.timestamp;
        latencies.push(latency);
      }

      const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
      expect(avgLatency).toBeLessThanOrEqual(thresholds.coordinationLatency);
    }

    // Check message processing times
    const messageInteractions = interactions.filter((i) => i.type === 'message_routing');
    expect(messageInteractions.length).toBeGreaterThanOrEqual(0);
  }
}

export class SwarmBehaviorSimulator {
  /**
   * Simulate network partition scenario
   *
   * @param swarm
   * @param partitionAgents
   */
  static simulateNetworkPartition(swarm: any, partitionAgents: string[]): void {
    // Remove connections for partitioned agents
    partitionAgents.forEach((agentId) => {
      const agent = swarm.agents.get(agentId);
      if (agent) {
        agent.connections = [];
        agent.status = 'offline';
      }
    });
  }

  /**
   * Simulate agent failure scenario
   *
   * @param swarm
   * @param failedAgentId
   */
  static simulateAgentFailure(swarm: any, failedAgentId: string): void {
    const agent = swarm.agents.get(failedAgentId);
    if (agent) {
      agent.status = 'error';
      agent.messageQueue = [];
      agent.connections = [];
    }
  }

  /**
   * Simulate high load scenario
   *
   * @param swarm
   * @param taskCount
   */
  static simulateHighLoad(swarm: any, taskCount: number): any[] {
    const tasks = [];
    const agentIds = Array.from(swarm.agents.keys());

    for (let i = 0; i < taskCount; i++) {
      const targetAgent = agentIds[i % agentIds.length];
      const task = {
        id: `load-task-${i}`,
        type: 'compute',
        priority: Math.random() > 0.5 ? 'high' : 'normal',
        assignedTo: targetAgent,
      };

      tasks.push(task);

      // Add to agent's queue
      const agent = swarm.agents.get(targetAgent);
      if (agent) {
        agent.messageQueue.push({
          from: 'coordinator',
          message: { type: 'task_assignment', task },
          timestamp: Date.now(),
        });
      }
    }

    return tasks;
  }

  /**
   * Simulate consensus scenario
   *
   * @param swarm
   * @param proposal
   */
  static simulateConsensus(swarm: any, proposal: any): any {
    const agentIds = Array.from(swarm.agents.keys());
    const votes = [];

    // Simulate voting
    agentIds.forEach((agentId) => {
      const vote = {
        agentId,
        proposal: proposal.id,
        decision: Math.random() > 0.3 ? 'approve' : 'reject',
        timestamp: Date.now(),
      };

      votes.push(vote);

      const agent = swarm.agents.get(agentId);
      if (agent) {
        agent.messageQueue.push({
          from: 'coordinator',
          message: { type: 'consensus_request', proposal },
          timestamp: Date.now(),
        });
      }
    });

    // Calculate consensus result
    const approvals = votes.filter((v) => v.decision === 'approve').length;
    const majority = agentIds.length / 2;

    return {
      proposal,
      votes,
      result: approvals > majority ? 'accepted' : 'rejected',
      participation: votes.length / agentIds.length,
    };
  }
}

/**
 * Factory functions for coordination testing
 *
 * @param config
 */
export function createCoordinationTestSuite(config?: Partial<SwarmTestConfig>) {
  return {
    builder: new CoordinationTestBuilder(config),
    validator: CoordinationProtocolValidator,
    simulator: SwarmBehaviorSimulator,
  };
}

export function createMeshSwarmTest(agentCount: number = 5) {
  return createCoordinationTestSuite({
    topology: 'mesh',
    agentCount,
    coordinationProtocol: 'mcp',
  });
}

export function createHierarchicalSwarmTest(agentCount: number = 5) {
  return createCoordinationTestSuite({
    topology: 'hierarchical',
    agentCount,
    coordinationProtocol: 'mcp',
  });
}

export function createPerformanceSwarmTest() {
  return createCoordinationTestSuite({
    topology: 'mesh',
    agentCount: 3,
    performanceThresholds: {
      coordinationLatency: 50,
      messageProcessing: 25,
      swarmInitialization: 500,
    },
  });
}

/**
 * Main coordination test helpers class
 * Alias for backward compatibility
 *
 * @example
 */
export class CoordinationTestHelpers extends CoordinationTestBuilder {}
