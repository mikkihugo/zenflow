/**
 * Agent implementation and wrappers
 */
Object.defineProperty(exports, '__esModule', { value: true });
exports.AgentPool =
  exports.AnalystAgent =
  exports.CoderAgent =
  exports.ResearcherAgent =
  exports.BaseAgent =
    void 0;
exports.createAgent = createAgent;
const utils_1 = require('../swarm/core/utils.js');
class BaseAgent {
  // Convenience getter for status
  get status() {
    return this.state.status;
  }
  // Convenience setter for status
  set status(value) {
    this.state.status = value;
  }
  constructor(config) {
    this.connections = [];
    this.messageHandlers = new Map();
    this.id = config.id || (0, utils_1.generateId)('agent');
    this.type = config.type;
    this.config = {
      ...config,
      id: this.id,
      cognitiveProfile:
        config.cognitiveProfile ||
        (0, utils_1.getDefaultCognitiveProfile)(config.type),
    };
    // Initialize metrics
    this.metrics = {
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
      responseTime: 0,
    };
    this.state = {
      id: this.id, // Temporarily cast to any for AgentId compatibility
      name: config.name || `Agent-${this.id}`,
      type: config.type,
      status: 'idle',
      capabilities: {
        codeGeneration: true,
        codeReview: true,
        testing: true,
        documentation: true,
        research: true,
        analysis: true,
        webSearch: false,
        apiIntegration: true,
        fileSystem: true,
        terminalAccess: false,
        languages: ['javascript', 'typescript', 'python'],
        frameworks: ['node.js', 'react', 'express'],
        domains: ['web-development', 'api-development'],
        tools: ['git', 'npm', 'docker'],
        maxConcurrentTasks: 5,
        maxMemoryUsage: 1024,
        maxExecutionTime: 30000,
        reliability: 0.95,
        speed: 0.8,
        quality: 0.9,
        ...config.capabilities,
      },
      metrics: this.metrics,
      workload: 0,
      health: 1.0,
      config: this.config,
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
      endpoints: [],
      lastHeartbeat: new Date(),
      taskHistory: [],
      errorHistory: [],
      childAgents: [],
      collaborators: [],
      currentTask: null,
      load: 0,
    };
    this.setupMessageHandlers();
  }
  setupMessageHandlers() {
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
  async executeTaskByType(task) {
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
  async communicate(message) {
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      await handler(message);
    } else {
      console.warn(`No handler for message type: ${message.type}`);
    }
  }
  update(state) {
    this.state = { ...this.state, ...state };
  }
  updatePerformanceMetrics(success, executionTime) {
    // Initialize performance if it doesn't exist
    if (!this.state.performance) {
      this.state.performance = {
        tasksCompleted: 0,
        tasksFailed: 0,
        averageExecutionTime: 0,
        successRate: 0,
      };
    }
    const performance = this.state.performance;
    if (success) {
      performance.tasksCompleted++;
    } else {
      performance.tasksFailed++;
    }
    const totalTasks = performance.tasksCompleted + performance.tasksFailed;
    performance.successRate =
      totalTasks > 0 ? performance.tasksCompleted / totalTasks : 0;
    // Update average execution time
    const totalTime =
      performance.averageExecutionTime * (totalTasks - 1) + executionTime;
    performance.averageExecutionTime = totalTime / totalTasks;
  }
  async handleTaskAssignment(message) {
    const task = message.payload;
    // Execute the assigned task
    this.state.status = 'busy';
    try {
      const result = await this.execute(task);
      // Send result back to the swarm coordinator
      await this.communicate({
        id: `result-${Date.now()}`,
        fromAgentId: this.id,
        toAgentId: message.fromAgentId,
        swarmId: message.swarmId,
        type: 'result',
        content: result,
        timestamp: new Date(),
        requiresResponse: false,
      });
      this.state.status = 'idle';
    } catch (error) {
      this.state.status = 'error';
      throw error;
    }
  }
  async handleCoordination(_message) {
    // Handle coordination logic
  }
  async handleKnowledgeShare(message) {
    // Store shared knowledge in memory
    if (this.config.memory) {
      this.config.memory.shortTerm.set(
        `knowledge_${message.id}`,
        message.payload
      );
    }
  }
  async handleStatusUpdate(_message) {
    // Process status update
  }
  setWasmAgentId(id) {
    this.wasmAgentId = id;
  }
  getWasmAgentId() {
    return this.wasmAgentId;
  }
  // Required Agent interface methods
  async initialize() {
    this.state.status = 'initializing';
    // Initialize agent resources, connections, etc.
    this.state.status = 'idle';
    this.state.lastHeartbeat = new Date();
  }
  async execute(task) {
    const startTime = Date.now();
    this.state.status = 'busy';
    this.state.currentTask = task.id;
    try {
      // Basic task execution - can be overridden by specialized agents
      const result = {
        success: true,
        data: { message: `Task ${task.id} completed by ${this.type} agent` },
        executionTime: Date.now() - startTime,
        agentId: this.id,
        metadata: {
          agentType: this.type,
          taskId: task.id,
        },
      };
      this.metrics.tasksCompleted++;
      this.updatePerformanceMetrics(true, result.executionTime);
      return result;
    } catch (error) {
      this.metrics.tasksFailed++;
      this.updatePerformanceMetrics(false, Date.now() - startTime);
      return {
        success: false,
        data: { error: error instanceof Error ? error.message : String(error) },
        executionTime: Date.now() - startTime,
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
  async handleMessage(message) {
    await this.communicate(message);
  }
  updateState(updates) {
    this.state = { ...this.state, ...updates };
  }
  getStatus() {
    return this.state.status;
  }
  async shutdown() {
    this.state.status = 'terminated';
    // Clean up resources, close connections, etc.
    this.state.status = 'offline';
  }
}
exports.BaseAgent = BaseAgent;
/**
 * Specialized agent for research tasks
 */
class ResearcherAgent extends BaseAgent {
  constructor(config) {
    super({ ...config, type: 'researcher' });
  }
  async executeTaskByType(task) {
    // Simulate research activities
    const phases = [
      'collecting_data',
      'analyzing',
      'synthesizing',
      'reporting',
    ];
    const results = [];
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
exports.ResearcherAgent = ResearcherAgent;
/**
 * Specialized agent for coding tasks
 */
class CoderAgent extends BaseAgent {
  constructor(config) {
    super({ ...config, type: 'coder' });
  }
  async executeTaskByType(task) {
    // Simulate coding activities
    const steps = ['design', 'implement', 'test', 'refactor'];
    const codeArtifacts = [];
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
exports.CoderAgent = CoderAgent;
/**
 * Specialized agent for analysis tasks
 */
class AnalystAgent extends BaseAgent {
  constructor(config) {
    super({ ...config, type: 'analyst' });
  }
  async executeTaskByType(task) {
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
exports.AnalystAgent = AnalystAgent;
/**
 * Factory function to create specialized agents
 */
function createAgent(config) {
  switch (config.type) {
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
 * Agent pool for managing multiple agents
 */
class AgentPool {
  constructor() {
    this.agents = new Map();
    this.availableAgents = new Set();
  }
  addAgent(agent) {
    this.agents.set(agent.id, agent);
    if (agent.state.status === 'idle') {
      this.availableAgents.add(agent.id);
    }
  }
  removeAgent(agentId) {
    this.agents.delete(agentId);
    this.availableAgents.delete(agentId);
  }
  getAgent(agentId) {
    return this.agents.get(agentId);
  }
  getAvailableAgent(preferredType) {
    let selectedAgent;
    for (const agentId of Array.from(this.availableAgents)) {
      const agent = this.agents.get(agentId);
      if (!agent) continue;
      if (!preferredType || agent.config.type === preferredType) {
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
      this.availableAgents.delete(selectedAgent.id);
    }
    return selectedAgent;
  }
  releaseAgent(agentId) {
    const agent = this.agents.get(agentId);
    if (agent && agent.state.status === 'idle') {
      this.availableAgents.add(agentId);
    }
  }
  getAllAgents() {
    return Array.from(this.agents.values());
  }
  getAgentsByType(type) {
    return this.getAllAgents().filter((agent) => agent.config.type === type);
  }
  getAgentsByStatus(status) {
    return this.getAllAgents().filter((agent) => agent.state.status === status);
  }
}
exports.AgentPool = AgentPool;
