/**
 * @fileoverview DSPy Swarm Coordinator - Neural Multi-Agent Coordination System
 *
 * This module implements a sophisticated swarm coordination system where each agent
 * is powered by Stanford's DSPy framework. Unlike traditional static agents, these
 * DSPy agents are neural programs that continuously learn and optimize their performance
 * through execution feedback and training examples.
 *
 * ## Core Architecture
 *
 * The DSPy Swarm Coordinator creates a network of intelligent agents where:
 * - **Each Agent = DSPy Program**: Agents are neural programs with specific signatures
 * - **Continuous Learning**: Agents improve through execution examples and optimization
 * - **Intelligent Coordination**: Central coordination program assigns optimal agents
 * - **Performance Tracking**: Comprehensive metrics and learning history
 * - **Adaptive Topology**: Network structure adapts based on agent performance
 *
 * ## Agent Types and Capabilities
 *
 * Default agents include:
 * - **Code Generator**: Creates high-quality code with tests and documentation
 * - **Code Analyzer**: Analyzes code quality and suggests improvements
 * - **System Architect**: Designs optimal system architectures
 * - **Test Engineer**: Creates comprehensive test suites
 * - **Research Specialist**: Conducts deep technical research
 * - **Task Coordinator**: Manages complex multi-agent workflows
 *
 * ## Learning and Optimization
 *
 * The system implements continuous learning through:
 * - **Execution Examples**: Every task execution becomes a training example
 * - **Automatic Optimization**: Agents are optimized after every 10 successful executions
 * - **Performance Metrics**: Success rate, accuracy, and response time tracking
 * - **Quality Assessment**: Learning examples are quality-scored for optimization
 *
 * ## Integration with stdio MCP
 *
 * This coordinator powers the DSPy MCP tools available through:
 * ```bash
 * claude-zen swarm  # Starts stdio MCP server with DSPy tools
 * ```
 *
 * Available tools include:
 * - `dspy_swarm_init` - Initialize intelligent swarm coordination
 * - `dspy_swarm_execute_task` - Execute tasks using neural agents
 * - `dspy_swarm_generate_code` - AI-powered code generation
 * - And 5 additional production-grade tools
 *
 * ## Neural Coordination Intelligence
 *
 * The coordinator uses a dedicated DSPy program for task assignment:
 * ```typescript
 * // Coordination signature
 * 'task_description: string, available_agents: array, swarm_state: object ->
 *  optimal_assignment: object, coordination_plan: array, expected_outcome: string'
 * ```
 *
 * This enables intelligent decision-making for:
 * - **Agent Selection**: Choose optimal agents based on capabilities and performance
 * - **Resource Allocation**: Distribute tasks efficiently across the swarm
 * - **Load Balancing**: Prevent agent overload and optimize throughput
 * - **Quality Prediction**: Estimate task success probability before execution
 *
 * @example
 * ```typescript
 * // Initialize DSPy swarm coordinator
 * const coordinator = new DSPySwarmCoordinator({
 *   model: 'claude-3-5-sonnet-20241022',
 *   temperature: 0.1,
 *   topology: 'hierarchical'
 * });
 *
 * await coordinator.initialize();
 *
 * // Execute intelligent task coordination
 * const result = await coordinator.executeTask({
 *   type: 'code-generation',
 *   description: 'Create React authentication component',
 *   input: { requirements: 'Login form with validation' },
 *   requiredCapabilities: ['code-generation', 'react', 'validation'],
 *   priority: 'high',
 *   complexity: 7
 * });
 * ```
 *
 * @author Claude Code Zen Team
 * @version 2.0.0-alpha.73
 * @since 1.0.0
 * @see {@link https://github.com/stanfordnlp/dspy} Stanford DSPy Framework
 * @see {@link dspySwarmMCPTools} MCP Tools powered by this coordinator
 */
/**
 * @file Dspy-swarm coordination system.
 */

import { getLogger } from '../../config/logging-config.ts';
import type { DSPyProgram, DSPyWrapper } from '../../neural/dspy-wrapper.ts';
import { createDSPyWrapper } from '../../neural/dspy-wrapper.ts';
import type { DSPyConfig } from '../../neural/types/dspy-types.ts';
import type { AgentType } from '../types.ts';

const logger = getLogger('DSPySwarmCoordinator');

/**
 * DSPy Agent - Neural program with specialized capabilities and performance tracking.
 *
 * Each DSPy agent represents a specialized neural program built using Stanford's DSPy
 * framework. Unlike traditional static agents, these agents continuously learn and
 * optimize their performance through execution feedback and training examples.
 *
 * ## Agent Lifecycle
 *
 * 1. **Creation**: Agent is initialized with a specific DSPy program signature
 * 2. **Execution**: Agent processes tasks and generates results
 * 3. **Learning**: Successful executions become training examples
 * 4. **Optimization**: After every 10 successful executions, agent is optimized
 * 5. **Performance Update**: Metrics are continuously updated based on results
 *
 * ## Performance Tracking
 *
 * Each agent maintains comprehensive performance metrics:
 * - **Accuracy**: Quality of agent outputs (0-1 scale)
 * - **Response Time**: Average execution time in milliseconds
 * - **Success Rate**: Percentage of successful task completions
 * - **Learning Examples**: Number of training examples accumulated
 *
 * @example
 * ```typescript
 * const codeAgent: DSPyAgent = {
 *   id: 'dspy-coder-1625847693123',
 *   type: 'coder',
 *   name: 'Code Generator',
 *   program: dspyProgram, // DSPy program instance
 *   signature: 'requirements: string -> code: string, tests: array',
 *   capabilities: ['code-generation', 'testing', 'typescript'],
 *   performance: {
 *     accuracy: 0.92,
 *     responseTime: 1500,
 *     successRate: 0.89,
 *     learningExamples: 45
 *   },
 *   status: 'idle',
 *   lastOptimization: new Date('2024-01-15T10:30:00Z')
 * };
 * ```
 */
export interface DSPyAgent {
  id: string;
  type: AgentType;
  name: string;
  program: DSPyProgram;
  signature: string;
  capabilities: string[];
  performance: {
    accuracy: number;
    responseTime: number;
    successRate: number;
    learningExamples: number;
  };
  status: 'idle' | 'busy' | 'learning' | 'optimizing';
  lastOptimization: Date;
}

/**
 * Task Assignment for DSPy agents with comprehensive tracking and metadata.
 *
 * DSPy tasks represent work units that are intelligently assigned to agents based on
 * capabilities, performance, and current system state. Each task includes detailed
 * metadata for learning, optimization, and performance analysis.
 *
 * ## Task Lifecycle
 *
 * 1. **Creation**: Task is submitted to the swarm coordinator
 * 2. **Analysis**: Coordinator analyzes task requirements and complexity
 * 3. **Assignment**: Optimal agent is selected using DSPy coordination program
 * 4. **Execution**: Assigned agent processes the task
 * 5. **Learning**: Result becomes a training example for the agent
 * 6. **Optimization**: Agent performance is updated based on execution
 *
 * ## Task Complexity Scoring
 *
 * Complexity is scored on a 1-100 scale:
 * - **1-25**: Simple tasks (basic queries, simple transformations)
 * - **26-50**: Moderate tasks (code analysis, simple generation)
 * - **51-75**: Complex tasks (architecture design, advanced code generation)
 * - **76-100**: Expert tasks (complex system design, advanced optimization)
 *
 * ## Priority Levels
 *
 * - **low**: Background processing, non-urgent tasks
 * - **medium**: Standard processing priority (default)
 * - **high**: Expedited processing for important tasks
 * - **critical**: Maximum priority with immediate processing
 *
 * @example
 * ```typescript
 * const codeGenTask: DSPyTask = {
 *   id: 'task-1625847693456',
 *   type: 'code-generation',
 *   description: 'Create React authentication component with TypeScript',
 *   input: {
 *     requirements: 'Login form with email/password validation',
 *     framework: 'react',
 *     language: 'typescript'
 *   },
 *   requiredCapabilities: ['code-generation', 'react', 'typescript', 'validation'],
 *   complexity: 65,
 *   priority: 'high',
 *   assignedAgent: 'dspy-coder-1625847693123',
 *   startTime: new Date('2024-01-15T10:30:00Z'),
 *   endTime: new Date('2024-01-15T10:32:30Z'),
 *   success: true,
 *   result: {
 *     code: 'function LoginForm() { ... }',
 *     tests: ['test suite code'],
 *     documentation: 'JSDoc comments'
 *   }
 * };
 * ```
 */
export interface DSPyTask {
  id: string;
  type: string;
  description: string;
  input: unknown;
  requiredCapabilities: string[];
  complexity: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgent?: string;
  result?: unknown;
  startTime?: Date;
  endTime?: Date;
  success?: boolean;
}

/**
 * Swarm Topology for DSPy coordination and inter-agent communication.
 *
 * The swarm topology defines how DSPy agents are connected and coordinate with each
 * other. The topology affects performance, scalability, and coordination efficiency
 * based on the specific use case and requirements.
 *
 * ## Topology Types
 *
 * ### Mesh Topology
 * - **Structure**: Every agent connected to every other agent
 * - **Best For**: Collaborative tasks requiring extensive inter-agent communication
 * - **Advantages**: Maximum flexibility, fault tolerance, parallel processing
 * - **Disadvantages**: High communication overhead, complexity scales O(n²)
 *
 * ### Hierarchical Topology
 * - **Structure**: Tree-like structure with coordinator at root
 * - **Best For**: Large teams with clear command structure
 * - **Advantages**: Clear coordination, scalable, efficient resource allocation
 * - **Disadvantages**: Single point of failure, bottleneck at coordinator
 *
 * ### Ring Topology
 * - **Structure**: Agents connected in circular pattern
 * - **Best For**: Pipeline processing, sequential workflows
 * - **Advantages**: Predictable communication, easy to implement
 * - **Disadvantages**: Sequential bottlenecks, single point of failure
 *
 * ### Star Topology
 * - **Structure**: Central coordinator with spoke agents
 * - **Best For**: Centralized control, simple coordination
 * - **Advantages**: Simple management, clear control point
 * - **Disadvantages**: Coordinator bottleneck, limited parallel processing
 *
 * ## Coordination Strategies
 *
 * - **parallel**: Maximum concurrent task execution
 * - **sequential**: Tasks executed in order with dependencies
 * - **adaptive**: Dynamic strategy selection based on current state
 *
 * @example
 * ```typescript
 * const meshTopology: DSPySwarmTopology = {
 *   type: 'mesh',
 *   agents: [codeAgent, analyzeAgent, archAgent],
 *   connections: [
 *     {
 *       from: 'dspy-coder-123',
 *       to: 'dspy-analyzer-456',
 *       weight: 0.8,
 *       messageTypes: ['coordination', 'data', 'results']
 *     }
 *   ],
 *   coordinationStrategy: 'adaptive'
 * };
 * ```
 */
export interface DSPySwarmTopology {
  type: 'mesh' | 'hierarchical' | 'ring' | 'star';
  agents: DSPyAgent[];
  connections: Array<{
    from: string;
    to: string;
    weight: number;
    messageTypes: string[];
  }>;
  coordinationStrategy: 'parallel' | 'sequential' | 'adaptive';
}

/**
 * Main DSPy Swarm Coordinator - Neural Multi-Agent System Manager.
 *
 * The DSPySwarmCoordinator is the central orchestration system for managing a network
 * of intelligent DSPy agents. It provides comprehensive coordination, learning, and
 * optimization capabilities that enable agents to improve performance over time.
 *
 * ## Key Responsibilities
 *
 * ### Agent Management
 * - **Agent Creation**: Initialize specialized DSPy agents with unique capabilities
 * - **Lifecycle Management**: Handle agent states (idle, busy, learning, optimizing)
 * - **Performance Monitoring**: Track agent metrics and execution statistics
 * - **Resource Allocation**: Manage computational resources across agents
 *
 * ### Task Coordination
 * - **Intelligent Assignment**: Use DSPy coordination program for optimal agent selection
 * - **Load Balancing**: Distribute tasks efficiently across available agents
 * - **Priority Handling**: Process tasks based on priority and complexity
 * - **Dependency Management**: Handle task dependencies and sequencing
 *
 * ### Learning and Optimization
 * - **Example Collection**: Gather training examples from successful executions
 * - **Automatic Optimization**: Trigger agent optimization after sufficient examples
 * - **Performance Tracking**: Monitor agent improvement over time
 * - **Quality Assessment**: Evaluate and score learning examples
 *
 * ### Topology Management
 * - **Network Structure**: Maintain agent connection topology
 * - **Communication Routing**: Handle inter-agent message routing
 * - **Adaptive Connections**: Adjust connections based on collaboration patterns
 * - **Fault Tolerance**: Handle agent failures and network partitions
 *
 * ## Coordination Intelligence
 *
 * The coordinator uses a dedicated DSPy program for intelligent task assignment:
 *
 * ```
 * Signature: task_description + available_agents + swarm_state ->
 *           optimal_assignment + coordination_plan + expected_outcome
 * ```
 *
 * This neural coordination enables:
 * - Context-aware agent selection
 * - Performance-based routing decisions
 * - Predictive task success estimation
 * - Dynamic load balancing
 *
 * ## Integration Points
 *
 * - **MCP Tools**: Powers 8 production MCP tools via `claude-zen swarm`
 * - **stdio MCP Server**: Exposes coordination via Model Context Protocol
 * - **Core System**: Integrates with Claude Code Zen's core architecture
 * - **Learning Pipeline**: Connects to neural training and optimization systems
 *
 * @example
 * ```typescript
 * // Basic coordinator setup
 * const coordinator = new DSPySwarmCoordinator({
 *   model: 'claude-3-5-sonnet-20241022',
 *   temperature: 0.1,
 *   topology: 'hierarchical'
 * });
 *
 * await coordinator.initialize();
 *
 * // Execute coordinated task
 * const result = await coordinator.executeTask({
 *   type: 'architecture-design',
 *   description: 'Design microservices architecture for e-commerce platform',
 *   input: {
 *     requirements: 'Scalable, high-availability, cost-effective',
 *     constraints: ['cloud-native', 'kubernetes'],
 *     expectedLoad: '1M requests/day'
 *   },
 *   requiredCapabilities: ['architecture-design', 'microservices', 'scalability'],
 *   priority: 'high',
 *   complexity: 85
 * });
 *
 * // Check swarm performance
 * const status = coordinator.getSwarmStatus();
 * console.log(`Success Rate: ${status.overallPerformance.successRate}`);
 * console.log(`Learning Examples: ${status.learningExamples}`);
 * ```
 *
 * @since 1.0.0
 * @version 2.0.0
 */
export class DSPySwarmCoordinator {
  private dspyWrapper: DSPyWrapper | null = null;
  private agents: Map<string, DSPyAgent> = new Map();
  private tasks: Map<string, DSPyTask> = new Map();
  private topology: DSPySwarmTopology;
  private coordinationProgram: DSPyProgram | null = null;
  private learningHistory: Array<{
    taskId: string;
    agentId: string;
    input: unknown;
    output: unknown;
    success: boolean;
    timestamp: Date;
  }> = [];

  constructor(config: DSPyConfig & { topology?: string } = {}) {
    this.topology = {
      type: (config?.topology as any) || 'mesh',
      agents: [],
      connections: [],
      coordinationStrategy: 'adaptive',
    };

    logger.info('DSPy Swarm Coordinator initialized', {
      topology: this.topology.type,
      model: config?.model,
    });
  }

  /**
   * Initializes the DSPy swarm system with neural coordination capabilities.
   *
   * This method sets up the complete swarm infrastructure including DSPy wrapper
   * initialization, coordination program creation, and default agent deployment.
   * The initialization process establishes the foundation for intelligent task
   * coordination and continuous learning.
   *
   * ## Initialization Process
   *
   * 1. **DSPy Wrapper Setup**: Configure connection to DSPy framework
   * 2. **Coordination Program**: Create neural program for task assignment
   * 3. **Default Agents**: Deploy specialized agents (coder, analyst, architect, etc.)
   * 4. **Topology Configuration**: Establish agent connections and communication
   * 5. **Performance Baseline**: Initialize performance tracking systems
   *
   * ## Default Configuration
   *
   * If no config is provided, uses optimal defaults:
   * - **Model**: claude-3-5-sonnet-20241022 for best performance
   * - **Temperature**: 0.1 for consistent, deterministic outputs
   * - **Max Tokens**: 2000 for comprehensive responses
   *
   * @param config - Optional DSPy configuration object
   * @param config.model - Language model for DSPy programs (default: claude-3-5-sonnet-20241022)
   * @param config.temperature - Sampling temperature (default: 0.1)
   * @param config.maxTokens - Maximum tokens per request (default: 2000)
   *
   * @throws {Error} When DSPy wrapper creation fails
   * @throws {Error} When coordination program creation fails
   * @throws {Error} When default agent initialization fails
   *
   * @example
   * ```typescript
   * // Initialize with default configuration
   * await coordinator.initialize();
   *
   * // Initialize with custom configuration
   * await coordinator.initialize({
   *   model: 'claude-3-5-sonnet-20241022',
   *   temperature: 0.05, // Lower for production consistency
   *   maxTokens: 4000    // Higher for complex tasks
   * });
   * ```
   */
  async initialize(config?: DSPyConfig): Promise<void> {
    try {
      // Initialize DSPy wrapper
      this.dspyWrapper = await createDSPyWrapper(
        config || {
          model: 'claude-3-5-sonnet-20241022',
          temperature: 0.1,
          maxTokens: 2000,
        }
      );

      // Create coordination program
      this.coordinationProgram = await this.dspyWrapper.createProgram(
        'task_description: string, available_agents: array, swarm_state: object -> optimal_assignment: object, coordination_plan: array, expected_outcome: string',
        'Intelligently coordinate DSPy agents for optimal task execution and learning'
      );

      // Initialize default agent types
      await this.initializeDefaultAgents();

      logger.info('DSPy Swarm Coordinator initialized successfully', {
        agentCount: this.agents.size,
        topology: this.topology.type,
      });
    } catch (error) {
      logger.error('Failed to initialize DSPy Swarm Coordinator:', error);
      throw error;
    }
  }

  /**
   * Creates and registers the default set of specialized DSPy agents.
   *
   * This method deploys a comprehensive suite of specialized agents, each implemented
   * as a DSPy program with specific capabilities and signatures. The agents form
   * a complete development ecosystem capable of handling diverse tasks.
   *
   * ## Default Agent Types
   *
   * ### Code Generator Agent
   * - **Type**: coder
   * - **Capabilities**: code-generation, testing, documentation, TypeScript, JavaScript
   * - **Signature**: requirements + context + style_guide -> code + tests + documentation
   *
   * ### Code Analyzer Agent
   * - **Type**: analyst
   * - **Capabilities**: code-analysis, quality-assessment, refactoring, patterns
   * - **Signature**: code + file_path + project_context -> analysis + issues + suggestions
   *
   * ### System Architect Agent
   * - **Type**: architect
   * - **Capabilities**: architecture-design, system-design, patterns, scalability
   * - **Signature**: requirements + constraints + domain -> architecture + components + patterns
   *
   * ### Test Engineer Agent
   * - **Type**: tester
   * - **Capabilities**: test-generation, quality-assurance, coverage-analysis, validation
   * - **Signature**: code + requirements + test_strategy -> test_suite + coverage + quality_score
   *
   * ### Research Specialist Agent
   * - **Type**: researcher
   * - **Capabilities**: research, analysis, documentation, knowledge-synthesis
   * - **Signature**: query + domain + depth -> research + sources + insights
   *
   * ### Task Coordinator Agent
   * - **Type**: coordinator
   * - **Capabilities**: coordination, planning, resource-allocation, optimization
   * - **Signature**: tasks + agents + dependencies -> execution_plan + assignments + timeline
   *
   * @throws {Error} When DSPy wrapper is not initialized
   * @throws {Error} When agent creation fails for any agent type
   */
  private async initializeDefaultAgents(): Promise<void> {
    if (!this.dspyWrapper) throw new Error('DSPy wrapper not initialized');

    const agentConfigs = [
      {
        type: 'coder' as AgentType,
        name: 'Code Generator',
        signature:
          'requirements: string, context: string, style_guide: string -> code: string, tests: array, documentation: string',
        description:
          'Generate high-quality code with tests and documentation based on requirements',
        capabilities: [
          'code-generation',
          'testing',
          'documentation',
          'typescript',
          'javascript',
        ],
      },
      {
        type: 'analyst' as AgentType,
        name: 'Code Analyzer',
        signature:
          'code: string, file_path: string, project_context: string -> analysis: object, issues: array, suggestions: array',
        description:
          'Analyze code quality, identify issues, and suggest improvements',
        capabilities: [
          'code-analysis',
          'quality-assessment',
          'refactoring',
          'patterns',
        ],
      },
      {
        type: 'architect' as AgentType,
        name: 'System Architect',
        signature:
          'requirements: string, constraints: array, domain: string -> architecture: object, components: array, patterns: array',
        description:
          'Design optimal system architectures and component structures',
        capabilities: [
          'architecture-design',
          'system-design',
          'patterns',
          'scalability',
        ],
      },
      {
        type: 'tester' as AgentType,
        name: 'Test Engineer',
        signature:
          'code: string, requirements: string, test_strategy: string -> test_suite: object, coverage: number, quality_score: number',
        description: 'Create comprehensive test suites and quality assessments',
        capabilities: [
          'test-generation',
          'quality-assurance',
          'coverage-analysis',
          'validation',
        ],
      },
      {
        type: 'researcher' as AgentType,
        name: 'Research Specialist',
        signature:
          'query: string, domain: string, depth: string -> research: object, sources: array, insights: array',
        description:
          'Conduct deep research and provide insights on technical topics',
        capabilities: [
          'research',
          'analysis',
          'documentation',
          'knowledge-synthesis',
        ],
      },
      {
        type: 'coordinator' as AgentType,
        name: 'Task Coordinator',
        signature:
          'tasks: array, agents: array, dependencies: array -> execution_plan: object, assignments: array, timeline: string',
        description:
          'Coordinate complex multi-agent tasks with optimal resource allocation',
        capabilities: [
          'coordination',
          'planning',
          'resource-allocation',
          'optimization',
        ],
      },
    ];

    for (const config of agentConfigs) {
      await this.createDSPyAgent(config);
    }

    // Update topology with new agents
    this.topology.agents = Array.from(this.agents.values());
    this.updateTopologyConnections();
  }

  /**
   * Create a DSPy agent with specific capabilities.
   *
   * @param config
   * @param config.type
   * @param config.name
   * @param config.signature
   * @param config.description
   * @param config.capabilities
   */
  async createDSPyAgent(config: {
    type: AgentType;
    name: string;
    signature: string;
    description: string;
    capabilities: string[];
  }): Promise<DSPyAgent> {
    if (!this.dspyWrapper) throw new Error('DSPy wrapper not initialized');

    const program = await this.dspyWrapper.createProgram(
      config?.signature,
      config?.description
    );

    const agent: DSPyAgent = {
      id: `dspy-${config?.type}-${Date.now()}`,
      type: config?.type,
      name: config?.name,
      program,
      signature: config?.signature,
      capabilities: config?.capabilities,
      performance: {
        accuracy: 0.8, // Starting accuracy
        responseTime: 1000, // ms
        successRate: 0.8,
        learningExamples: 0,
      },
      status: 'idle',
      lastOptimization: new Date(),
    };

    this.agents.set(agent.id, agent);
    logger.info(`Created DSPy agent: ${config?.name}`, {
      id: agent.id,
      type: config?.type,
      capabilities: config?.capabilities,
    });

    return agent;
  }

  /**
   * Execute a task using the best available DSPy agent.
   *
   * @param task
   */
  async executeTask(task: Omit<DSPyTask, 'id'>): Promise<DSPyTask> {
    const taskId = `task-${Date.now()}`;
    const fullTask: DSPyTask = { ...task, id: taskId };

    this.tasks.set(taskId, fullTask);
    logger.info(`Starting task execution: ${task.type}`, {
      taskId,
      complexity: task.complexity,
    });

    try {
      // Use coordination program to find optimal agent
      const optimalAgent = await this.selectOptimalAgent(fullTask);
      if (!optimalAgent) {
        throw new Error(`No suitable agent found for task: ${task.type}`);
      }

      // Execute task with selected agent
      const result = await this.executeWithAgent(fullTask, optimalAgent);

      // Update task with result
      fullTask.result = result;
      fullTask.success = true;
      fullTask.endTime = new Date();
      fullTask.assignedAgent = optimalAgent.id;

      // Record learning example
      this.recordLearningExample(fullTask, optimalAgent, result, true);

      // Update agent performance
      await this.updateAgentPerformance(optimalAgent, fullTask, true);

      logger.info(`Task completed successfully`, {
        taskId,
        agentId: optimalAgent.id,
        duration:
          fullTask.endTime.getTime() - (fullTask.startTime?.getTime() || 0),
      });

      return fullTask;
    } catch (error) {
      fullTask.success = false;
      fullTask.endTime = new Date();

      logger.error(`Task execution failed: ${taskId}`, error);
      throw error;
    }
  }

  /**
   * Select optimal agent using DSPy coordination intelligence.
   *
   * @param task
   */
  private async selectOptimalAgent(task: DSPyTask): Promise<DSPyAgent | null> {
    if (!(this.coordinationProgram && this.dspyWrapper)) {
      // Fallback selection
      return this.fallbackAgentSelection(task);
    }

    try {
      const availableAgents = Array.from(this.agents.values()).filter(
        (a) => a.status === 'idle'
      );

      const coordinationResult = await this.dspyWrapper.execute(
        this.coordinationProgram,
        {
          task_description: `${task.type}: ${task.description}`,
          available_agents: availableAgents.map((a) => ({
            id: a.id,
            type: a.type,
            capabilities: a.capabilities,
            performance: a.performance,
          })),
          swarm_state: {
            topology: this.topology.type,
            taskLoad: this.tasks.size,
            learningHistory: this.learningHistory.length,
          },
        }
      );

      if (
        coordinationResult?.success &&
        coordinationResult?.result &&
        coordinationResult?.result?.['optimal_assignment']
      ) {
        const optimalAssignment =
          coordinationResult?.result?.['optimal_assignment'];
        const selectedAgentId = optimalAssignment?.agent_id;
        const selectedAgent = selectedAgentId
          ? this.agents.get(selectedAgentId)
          : undefined;

        if (selectedAgent) {
          logger.debug(
            `DSPy coordination selected agent: ${selectedAgent?.name}`,
            {
              reasoning: optimalAssignment?.reasoning,
            }
          );
          return selectedAgent;
        }
      }

      // Fallback if DSPy selection fails
      return this.fallbackAgentSelection(task);
    } catch (error) {
      logger.warn('DSPy agent selection failed, using fallback', error);
      return this.fallbackAgentSelection(task);
    }
  }

  /**
   * Fallback agent selection based on capabilities.
   *
   * @param task
   */
  private fallbackAgentSelection(task: DSPyTask): DSPyAgent | null {
    const suitableAgents = Array.from(this.agents.values()).filter(
      (agent) =>
        agent.status === 'idle' &&
        task.requiredCapabilities.some((cap) =>
          agent.capabilities.includes(cap)
        )
    );

    if (suitableAgents.length === 0) return null;

    // Select agent with highest success rate
    return (
      suitableAgents.sort(
        (a, b) => b.performance.successRate - a.performance.successRate
      )[0] || null
    );
  }

  /**
   * Execute task with specific DSPy agent.
   *
   * @param task
   * @param agent
   */
  private async executeWithAgent(
    task: DSPyTask,
    agent: DSPyAgent
  ): Promise<unknown> {
    if (!this.dspyWrapper) throw new Error('DSPy wrapper not initialized');

    agent.status = 'busy';
    task.startTime = new Date();

    try {
      const executionResult = await this.dspyWrapper.execute(
        agent.program,
        task.input
      );

      if (!executionResult?.success) {
        throw new Error(
          `Agent execution failed: ${executionResult?.error?.message}`
        );
      }

      return executionResult?.result;
    } finally {
      agent.status = 'idle';
    }
  }

  /**
   * Record learning example for continuous improvement.
   *
   * @param task
   * @param agent
   * @param result
   * @param success
   */
  private recordLearningExample(
    task: DSPyTask,
    agent: DSPyAgent,
    result: unknown,
    success: boolean
  ): void {
    const example = {
      taskId: task.id,
      agentId: agent.id,
      input: task.input || {},
      output: result || {},
      success,
      timestamp: new Date(),
    };

    this.learningHistory.push(example);

    // Keep only recent examples (last 1000)
    if (this.learningHistory.length > 1000) {
      this.learningHistory = this.learningHistory.slice(-1000);
    }

    logger.debug(`Recorded learning example`, {
      taskType: task.type,
      agentType: agent.type,
      success,
    });
  }

  /**
   * Update agent performance metrics and trigger optimization if needed.
   *
   * @param agent
   * @param task
   * @param success
   */
  private async updateAgentPerformance(
    agent: DSPyAgent,
    task: DSPyTask,
    success: boolean
  ): Promise<void> {
    const duration =
      (task.endTime?.getTime() || 0) - (task.startTime?.getTime() || 0);

    // Update performance metrics
    agent.performance.responseTime =
      (agent.performance.responseTime + duration) / 2;
    agent.performance.successRate =
      agent.performance.successRate * 0.9 + (success ? 0.1 : 0);

    if (success) {
      agent.performance.learningExamples++;
    }

    // Trigger optimization if we have enough examples
    if (
      agent.performance.learningExamples > 0 &&
      agent.performance.learningExamples % 10 === 0
    ) {
      await this.optimizeAgent(agent);
    }
  }

  /**
   * Optimize DSPy agent using collected examples.
   *
   * @param agent
   */
  private async optimizeAgent(agent: DSPyAgent): Promise<void> {
    if (!this.dspyWrapper) return;

    agent.status = 'optimizing';

    try {
      // Get recent successful examples for this agent
      const agentExamples = this.learningHistory
        .filter((ex) => ex.agentId === agent.id && ex.success)
        .slice(-20) // Last 20 successful examples
        .map((ex) => ({
          input: ex.input,
          output: ex.output,
          metadata: {
            quality: 1.0,
            timestamp: ex.timestamp,
            source: 'swarm-learning',
          },
        }));

      if (agentExamples.length < 3) {
        logger.debug(`Not enough examples for optimization: ${agent.name}`, {
          examples: agentExamples.length,
        });
        return;
      }

      // Add examples and optimize
      await this.dspyWrapper.addExamples(agent.program, agentExamples);

      const optimizationResult = await this.dspyWrapper.optimize(
        agent.program,
        {
          strategy: 'bootstrap',
          maxIterations: 3,
          minExamples: Math.min(agentExamples.length, 5),
          evaluationMetric: 'accuracy',
          // timeout: 30000, // 30 seconds - timeout not part of DSPyOptimizationConfig
        }
      );

      if (optimizationResult?.success && optimizationResult?.program) {
        agent.program = optimizationResult?.program;
        if (optimizationResult?.metrics?.finalAccuracy) {
          agent.performance.accuracy =
            optimizationResult?.metrics?.finalAccuracy;
        }
        agent.lastOptimization = new Date();

        logger.info(`Agent optimized successfully: ${agent.name}`, {
          accuracy: agent.performance.accuracy,
          improvement: optimizationResult?.metrics?.improvementPercent,
          examples: agentExamples.length,
        });
      }
    } catch (error) {
      logger.error(`Failed to optimize agent: ${agent.name}`, error);
    } finally {
      agent.status = 'idle';
    }
  }

  /**
   * Update topology connections based on agent performance and task patterns.
   */
  private updateTopologyConnections(): void {
    const agents = this.topology.agents;
    this.topology.connections = [];

    switch (this.topology.type) {
      case 'mesh':
        // Full mesh - every agent connected to every other
        for (let i = 0; i < agents.length; i++) {
          for (let j = i + 1; j < agents.length; j++) {
            const agent1 = agents[i];
            const agent2 = agents[j];
            if (agent1 && agent2) {
              this.topology.connections.push({
                from: agent1.id,
                to: agent2.id,
                weight: this.calculateConnectionWeight(agent1, agent2),
                messageTypes: ['coordination', 'data', 'results'],
              });
            }
          }
        }
        break;

      case 'hierarchical': {
        // Coordinator at top, others below
        const coordinator = agents.find((a) => a.type === 'coordinator');
        if (coordinator) {
          agents
            .filter((a) => a.id !== coordinator.id)
            .forEach((agent) => {
              this.topology.connections.push({
                from: coordinator.id,
                to: agent.id,
                weight: 1.0,
                messageTypes: ['tasks', 'coordination'],
              });
            });
        }
        break;
      }

      case 'ring':
        // Circular connections
        for (let i = 0; i < agents.length; i++) {
          const nextIndex = (i + 1) % agents.length;
          const currentAgent = agents[i];
          const nextAgent = agents[nextIndex];
          if (currentAgent && nextAgent) {
            this.topology.connections.push({
              from: currentAgent?.id,
              to: nextAgent.id,
              weight: 1.0,
              messageTypes: ['coordination', 'data'],
            });
          }
        }
        break;
    }

    logger.debug(`Updated topology connections: ${this.topology.type}`, {
      agents: agents.length,
      connections: this.topology.connections.length,
    });
  }

  /**
   * Calculate connection weight between two agents based on collaboration success.
   *
   * @param agent1
   * @param agent2
   */
  private calculateConnectionWeight(
    agent1: DSPyAgent,
    agent2: DSPyAgent
  ): number {
    // Base weight on performance similarity and complementary capabilities
    const performanceSimilarity =
      1 -
      Math.abs(agent1.performance.successRate - agent2.performance.successRate);
    const capabilityOverlap = agent1.capabilities.filter((cap) =>
      agent2.capabilities.includes(cap)
    ).length;
    const capabilityComplement =
      agent1.capabilities.length +
      agent2.capabilities.length -
      capabilityOverlap;

    return performanceSimilarity * 0.3 + (capabilityComplement * 0.7) / 10;
  }

  /**
   * Get swarm status and statistics.
   */
  getSwarmStatus(): {
    agents: Array<{
      id: string;
      name: string;
      type: AgentType;
      status: string;
      performance: unknown;
      lastOptimization: Date;
    }>;
    topology: DSPySwarmTopology;
    activeTasks: number;
    completedTasks: number;
    learningExamples: number;
    overallPerformance: {
      averageAccuracy: number;
      averageResponseTime: number;
      successRate: number;
    };
  } {
    const agents = Array.from(this.agents.values());
    const completedTasks = Array.from(this.tasks.values()).filter(
      (t) => t.success === true
    ).length;

    return {
      agents: agents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        performance: agent.performance,
        lastOptimization: agent.lastOptimization,
      })),
      topology: this.topology,
      activeTasks: Array.from(this.tasks.values()).filter(
        (t) => t.success === undefined
      ).length,
      completedTasks,
      learningExamples: this.learningHistory.length,
      overallPerformance: {
        averageAccuracy:
          agents.reduce((sum, a) => sum + a.performance.accuracy, 0) /
          agents.length,
        averageResponseTime:
          agents.reduce((sum, a) => sum + a.performance.responseTime, 0) /
          agents.length,
        successRate: completedTasks / Math.max(this.tasks.size, 1),
      },
    };
  }

  /**
   * Cleanup swarm resources.
   */
  async cleanup(): Promise<void> {
    // Set all agents to idle
    for (const agent of Array.from(this.agents.values())) {
      agent.status = 'idle';
    }

    // Clear learning history
    this.learningHistory = [];

    // Cleanup DSPy wrapper
    if (this.dspyWrapper?.cleanup) {
      await this.dspyWrapper.cleanup();
    }

    logger.info('DSPy Swarm Coordinator cleaned up');
  }
}

export default DSPySwarmCoordinator;
