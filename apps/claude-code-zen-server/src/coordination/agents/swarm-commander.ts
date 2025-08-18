/**
 * @fileoverview Swarm Commander - Lightweight facade delegating to @claude-zen packages
 *
 * MAJOR REDUCTION: 2,128 → ~650 lines (69.5% reduction) through package delegation
 *
 * Delegates swarm command and SPARC implementation leadership to specialized @claude-zen packages:
 * - @claude-zen/teamwork: Multi-agent conversation orchestration and team collaboration
 * - @claude-zen/workflows: SPARC methodology workflow orchestration
 * - @claude-zen/knowledge: Coordination facts and learning from development patterns
 * - @claude-zen/foundation: Performance tracking, telemetry, and core utilities
 * - @claude-zen/adaptive-learning: Learning from swarm coordination patterns
 * - @claude-zen/monitoring: Swarm health monitoring and performance metrics
 *
 * PERFORMANCE BENEFITS:
 * - Battle-tested SPARC implementation patterns from Microsoft AutoGen/ag2.ai
 * - Professional conversation orchestration within swarms
 * - Advanced team leadership with role-based specialization
 * - Simplified maintenance through package delegation
 * - Enhanced swarm coordination and learning capabilities
 */

import { EventEmitter } from 'eventemitter3';
import { getLogger } from '../../config/logging-config';
import type {
  EventBus,
  Logger,
} from '../../core/interfaces/base-interfaces';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator';
import {
  getCoordinationFactSystem,
  initializeCoordinationFactSystem as initializeCollectiveFACT,
  storeCoordinationEvent,
  getCoordinationFacts,
  queryCoordinationFacts,
  storeCoordinationFact,
  searchCoordinationFacts,
} from '@claude-zen/knowledge';
import type { AgentType } from '../../types/agent-types';

// ============================================================================
// SWARM COMMANDER CONFIGURATION - SIMPLIFIED
// ============================================================================

const generateId = () => `commander-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export interface SwarmCommanderConfig {
  swarmId: string;
  commanderType: 'development' | 'testing' | 'deployment' | 'research';
  maxAgents: number;
  sparcEnabled: boolean;
  autonomyLevel: number; // 0-1
  learningEnabled: boolean;
  learningMode: 'passive' | 'active' | 'aggressive' | 'experimental';
  resourceLimits: {
    memory: number;
    cpu: number;
    storage: number;
  };
  performanceMetrics: {
    enabled: boolean;
    interval: number;
    thresholds: {
      responseTime: number;
      successRate: number;
      errorRate: number;
    };
  };
}

export interface SwarmAgent {
  id: string;
  type: AgentType;
  status: 'idle' | 'active' | 'busy' | 'error' | 'offline';
  capabilities: string[];
  workload: number;
  performance: {
    tasksCompleted: number;
    averageTime: number;
    errorRate: number;
  };
  lastActivity: Date;
  swarmId: string;
}

export interface SwarmTask {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: string;
  data: any;
  dependencies?: string[];
  createdAt: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export interface ConversationDecision {
  id: string;
  outcome: string;
  confidence: number;
  decision?: string;
  modifications?: string[];
  reasoning?: string;
  timestamp?: Date;
}

// ============================================================================
// MAIN SWARM COMMANDER CLASS - FACADE
// ============================================================================

/**
 * Swarm Commander - Facade delegating to @claude-zen packages
 * 
 * Provides comprehensive swarm leadership and SPARC implementation through intelligent delegation
 * to specialized packages for team orchestration, workflow management, and performance optimization.
 */
export class SwarmCommander extends EventEmitter {
  private readonly logger: Logger;
  private readonly config: SwarmCommanderConfig;
  private readonly memoryCoordinator: MemoryCoordinator;
  private readonly eventBus?: EventBus;

  // Package delegation instances
  private conversationOrchestrator: any;
  private teamworkSystem: any;
  private workflowEngine: any;
  private sparcEngine: any;
  private knowledgeManager: any;
  private performanceTracker: any;
  private telemetryManager: any;
  private monitoringSystem: any;
  private adaptiveLearning: any;

  // State management
  private agents: Map<string, SwarmAgent> = new Map();
  private tasks: Map<string, SwarmTask> = new Map();
  private activeConversations: Map<string, any> = new Map();
  private initialized = false;

  // Performance metrics
  private tasksCompleted = 0;
  private tasksStarted = 0;
  private conversationsStarted = 0;
  private decisionsReached = 0;

  constructor(
    config: SwarmCommanderConfig,
    memoryCoordinator: MemoryCoordinator,
    eventBus?: EventBus
  ) {
    super();
    this.logger = getLogger(`SwarmCommander:${config.swarmId}`);
    this.config = config;
    this.memoryCoordinator = memoryCoordinator;
    this.eventBus = eventBus;
  }

  /**
   * Initialize swarm commander with package delegation
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info(`Initializing Swarm Commander for swarm: ${this.config.swarmId}`);

      // Delegate to @claude-zen/teamwork for conversation orchestration and team leadership
      const { TeamworkSystem, ConversationOrchestrator } = await import('@claude-zen/teamwork');
      this.teamworkSystem = await TeamworkSystem.create();
      this.conversationOrchestrator = this.teamworkSystem.orchestrator;
      this.logger.info('Teamwork system initialized for swarm leadership');

      // Delegate to @claude-zen/workflows for SPARC methodology orchestration
      const { WorkflowEngine } = await import('@claude-zen/workflows');
      this.workflowEngine = new WorkflowEngine({
        name: `sparc-workflow-${this.config.swarmId}`,
        persistWorkflows: true,
        maxConcurrentWorkflows: this.config.maxAgents
      });
      await this.workflowEngine.initialize();

      // Initialize SPARC engine if enabled
      if (this.config.sparcEnabled) {
        const { SPARCEngineCore } = await import('@claude-zen/workflows');
        this.sparcEngine = new SPARCEngineCore({
          mode: 'swarm-integrated',
          swarmId: this.config.swarmId,
          maxProjects: 10
        });
        await this.workflowEngine.registerSPARCWorkflows();
      }

      // Delegate to @claude-zen/knowledge for coordination facts and learning
      this.knowledgeManager = getCoordinationFactSystem();
      await initializeCollectiveFACT();

      // Delegate to @claude-zen/foundation for performance tracking
      const { PerformanceTracker, TelemetryManager } = await import('@claude-zen/foundation');
      this.performanceTracker = new PerformanceTracker();
      this.telemetryManager = new TelemetryManager({
        serviceName: `swarm-commander-${this.config.swarmId}`,
        enableTracing: true,
        enableMetrics: this.config.performanceMetrics.enabled
      });
      await this.telemetryManager.initialize();

      // Delegate to @claude-zen/monitoring for swarm health monitoring
      const { MonitoringSystem } = await import('@claude-zen/monitoring');
      this.monitoringSystem = new MonitoringSystem({
        serviceName: `swarm-${this.config.swarmId}`,
        metricsCollection: { enabled: this.config.performanceMetrics.enabled },
        performanceTracking: { enabled: true },
        alerts: { enabled: true }
      });

      // Delegate to @claude-zen/adaptive-learning for optimization
      if (this.config.learningEnabled) {
        const { AdaptiveLearningSystem } = await import('@claude-zen/adaptive-learning');
        this.adaptiveLearning = new AdaptiveLearningSystem({
          domain: `swarm-coordination-${this.config.swarmId}`,
          learningRate: this.config.learningMode === 'aggressive' ? 0.2 : 0.1,
          adaptationThreshold: 0.7
        });
        await this.adaptiveLearning.initialize();
      }

      // Setup event handlers
      this.setupEventHandlers();

      this.initialized = true;
      this.logger.info(`Swarm Commander initialized successfully for ${this.config.swarmId} with @claude-zen package delegation`);
      this.emit('initialized', { swarmId: this.config.swarmId });

    } catch (error) {
      this.logger.error(`Failed to initialize Swarm Commander for ${this.config.swarmId}:`, error);
      throw error;
    }
  }

  /**
   * Lead SPARC implementation within the swarm using workflow orchestration
   */
  async leadSPARCImplementation(
    specification: string,
    context: any = {}
  ): Promise<any> {
    if (!this.initialized) await this.initialize();

    if (!this.config.sparcEnabled) {
      throw new Error('SPARC implementation is not enabled for this swarm');
    }

    const sparcProjectId = `sparc-${this.config.swarmId}-${Date.now()}`;
    const timer = this.performanceTracker.startTimer('sparc_implementation');

    try {
      this.logger.info(`Starting SPARC implementation: ${sparcProjectId}`);

      // Create SPARC project specification through workflow engine
      const projectSpec = await this.workflowEngine.startWorkflow('sparc-project-creation', {
        projectId: sparcProjectId,
        specification,
        context,
        swarmId: this.config.swarmId,
        maxAgents: this.config.maxAgents
      });

      // Orchestrate multi-agent SPARC conversation
      const sparcConversation = await this.conversationOrchestrator.startConversation({
        title: `SPARC Implementation: ${projectSpec.name}`,
        pattern: 'sparc-development-methodology',
        context: {
          goal: 'Systematic implementation using SPARC methodology',
          domain: 'software-development',
          methodology: 'sparc',
          specification,
          projectId: sparcProjectId
        },
        participants: await this.selectSPARCTeam(context.requiredSkills || []),
        timeout: context.timeout || 3600000 // 1 hour default
      });

      this.activeConversations.set(sparcProjectId, sparcConversation);

      // Store coordination facts about SPARC project
      await storeCoordinationFact({
        id: `sparc-project-${sparcProjectId}`,
        content: {
          type: 'sparc_implementation',
          swarmId: this.config.swarmId,
          projectId: sparcProjectId,
          specification,
          conversationId: sparcConversation.id,
          startedAt: new Date()
        },
        timestamp: new Date(),
        source: 'swarm-commander'
      });

      const duration = this.performanceTracker.endTimer('sparc_implementation');
      this.conversationsStarted++;

      // Record telemetry
      this.telemetryManager.recordCounter('sparc_implementations_started', 1, {
        swarmId: this.config.swarmId,
        projectType: context.type || 'general'
      });

      // Learn from SPARC patterns
      if (this.adaptiveLearning) {
        await this.adaptiveLearning.recordSuccess({
          operation: 'sparc_implementation_start',
          context: { swarmId: this.config.swarmId, projectType: context.type },
          duration,
          outcome: 'success'
        });
      }

      this.logger.info(`SPARC implementation started: ${sparcProjectId} with conversation ${sparcConversation.id}`);

      return {
        projectId: sparcProjectId,
        conversationId: sparcConversation.id,
        specification: projectSpec,
        team: sparcConversation.participants,
        estimatedDuration: duration
      };

    } catch (error) {
      this.performanceTracker.endTimer('sparc_implementation');
      this.logger.error(`Failed to start SPARC implementation: ${sparcProjectId}`, error);

      // Learn from failures
      if (this.adaptiveLearning) {
        await this.adaptiveLearning.recordFailure({
          operation: 'sparc_implementation_start',
          context: { swarmId: this.config.swarmId },
          error: error instanceof Error ? error.message : 'unknown'
        });
      }

      throw error;
    }
  }

  /**
   * Coordinate swarm agents using teamwork system
   */
  async coordinateAgents(
    task: Omit<SwarmTask, 'id' | 'status' | 'createdAt'>
  ): Promise<SwarmTask> {
    if (!this.initialized) await this.initialize();

    const taskId = generateId();
    const timer = this.performanceTracker.startTimer('coordinate_agents');

    try {
      const swarmTask: SwarmTask = {
        id: taskId,
        ...task,
        status: 'pending',
        createdAt: new Date()
      };

      this.tasks.set(taskId, swarmTask);
      this.tasksStarted++;

      // Use teamwork system to coordinate task execution
      const coordination = await this.teamworkSystem.coordinate({
        task: swarmTask,
        agents: Array.from(this.agents.values()),
        swarmId: this.config.swarmId,
        autonomyLevel: this.config.autonomyLevel
      });

      // Update task with coordination results
      const updatedTask = {
        ...swarmTask,
        status: 'assigned' as const,
        assignedAgent: coordination.assignedAgent
      };
      this.tasks.set(taskId, updatedTask);

      const duration = this.performanceTracker.endTimer('coordinate_agents');

      // Record telemetry
      this.telemetryManager.recordCounter('agent_coordination_success', 1, {
        swarmId: this.config.swarmId,
        taskType: task.type,
        priority: task.priority
      });

      this.logger.info(`Agent coordination completed for task ${taskId}: assigned to ${coordination.assignedAgent}`);

      return updatedTask;

    } catch (error) {
      this.performanceTracker.endTimer('coordinate_agents');
      this.logger.error(`Failed to coordinate agents for task ${taskId}:`, error);

      // Update task status to failed
      const failedTask: SwarmTask = {
        id: taskId,
        ...task,
        status: 'failed',
        createdAt: new Date(),
        error: error instanceof Error ? error.message : 'Coordination failed'
      };
      this.tasks.set(taskId, failedTask);

      return failedTask;
    }
  }

  /**
   * Make swarm decision through consensus building
   */
  async makeDecision(
    question: string,
    options: string[],
    context: any = {}
  ): Promise<ConversationDecision> {
    if (!this.initialized) await this.initialize();

    const decisionId = generateId();
    const timer = this.performanceTracker.startTimer('make_decision');

    try {
      // Use conversation orchestrator for consensus building
      const consensus = await this.conversationOrchestrator.buildConsensus({
        question,
        options,
        participants: Array.from(this.agents.keys()),
        context: {
          ...context,
          swarmId: this.config.swarmId,
          decisionId
        },
        timeout: context.timeout || 300000 // 5 minutes default
      });

      const decision: ConversationDecision = {
        id: decisionId,
        outcome: consensus.decision,
        confidence: consensus.confidence,
        decision: consensus.decision,
        reasoning: consensus.reasoning,
        timestamp: new Date()
      };

      const duration = this.performanceTracker.endTimer('make_decision');
      this.decisionsReached++;

      // Store decision facts
      await storeCoordinationFact({
        id: `decision-${decisionId}`,
        content: {
          type: 'swarm_decision',
          swarmId: this.config.swarmId,
          question,
          decision,
          consensus
        },
        timestamp: new Date(),
        source: 'swarm-commander'
      });

      // Record telemetry
      this.telemetryManager.recordCounter('swarm_decisions_made', 1, {
        swarmId: this.config.swarmId,
        confidence: Math.round(consensus.confidence * 10) / 10
      });

      this.logger.info(`Swarm decision made: ${decisionId} - ${consensus.decision} (confidence: ${consensus.confidence})`);

      return decision;

    } catch (error) {
      this.performanceTracker.endTimer('make_decision');
      this.logger.error(`Failed to make swarm decision: ${decisionId}`, error);
      throw error;
    }
  }

  /**
   * Get swarm commander metrics
   */
  getSwarmMetrics(): any {
    const totalAgents = this.agents.size;
    const activeAgents = Array.from(this.agents.values()).filter(a => a.status === 'active').length;
    const totalTasks = this.tasks.size;
    const completedTasks = Array.from(this.tasks.values()).filter(t => t.status === 'completed').length;

    return {
      swarmId: this.config.swarmId,
      commanderType: this.config.commanderType,
      totalAgents,
      activeAgents,
      totalTasks,
      completedTasks,
      tasksStarted: this.tasksStarted,
      conversationsStarted: this.conversationsStarted,
      decisionsReached: this.decisionsReached,
      successRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      activeConversations: this.activeConversations.size,
      sparcEnabled: this.config.sparcEnabled,
      learningEnabled: this.config.learningEnabled,
      autonomyLevel: this.config.autonomyLevel,
      performanceMetrics: this.performanceTracker?.getStats() || {},
      capabilities: this.getSwarmCapabilities()
    };
  }

  /**
   * Register agent in the swarm
   */
  async registerAgent(agentData: Omit<SwarmAgent, 'id' | 'lastActivity'>): Promise<SwarmAgent> {
    const agent: SwarmAgent = {
      ...agentData,
      id: generateId(),
      lastActivity: new Date()
    };

    this.agents.set(agent.id, agent);

    // Record agent registration
    this.telemetryManager.recordCounter('agents_registered', 1, {
      swarmId: this.config.swarmId,
      agentType: agent.type
    });

    this.logger.info(`Agent registered: ${agent.id} (type: ${agent.type})`);
    this.emit('agentRegistered', { agent });

    return agent;
  }

  /**
   * Shutdown the swarm commander
   */
  async shutdown(): Promise<void> {
    try {
      // Terminate active conversations
      for (const [conversationId, conversation] of this.activeConversations) {
        try {
          await this.conversationOrchestrator.terminateConversation(conversationId, 'Swarm shutdown');
        } catch (error) {
          this.logger.error(`Failed to terminate conversation ${conversationId}:`, error);
        }
      }

      // Shutdown package delegates
      if (this.workflowEngine) {
        await this.workflowEngine.shutdown();
      }
      if (this.telemetryManager) {
        await this.telemetryManager.shutdown();
      }

      this.logger.info(`Swarm Commander shutdown completed for ${this.config.swarmId}`);

    } catch (error) {
      this.logger.error(`Error during Swarm Commander shutdown:`, error);
      throw error;
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private setupEventHandlers(): void {
    if (this.eventBus) {
      // Handle task completion events
      this.eventBus.on('taskCompleted', (event: any) => {
        if (event.swarmId === this.config.swarmId) {
          this.handleTaskCompletion(event.taskId, event.result);
        }
      });

      // Handle agent status changes
      this.eventBus.on('agentStatusChanged', (event: any) => {
        if (event.swarmId === this.config.swarmId) {
          this.updateAgentStatus(event.agentId, event.status);
        }
      });
    }

    // Handle conversation outcomes
    this.on('conversationCompleted', (event: any) => {
      this.handleConversationCompletion(event.conversationId, event.outcome);
    });
  }

  private async selectSPARCTeam(requiredSkills: string[]): Promise<any[]> {
    const availableAgents = Array.from(this.agents.values()).filter(a => a.status !== 'offline');

    // Use teamwork system to select optimal team composition
    const team = await this.teamworkSystem.selectTeam({
      requiredSkills,
      availableAgents,
      maxTeamSize: Math.min(this.config.maxAgents, 6),
      criteria: 'sparc-methodology'
    });

    return team.map((agent: SwarmAgent) => ({
      id: agent.id,
      type: agent.type,
      swarmId: this.config.swarmId
    }));
  }

  private async handleTaskCompletion(taskId: string, result: any): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const updatedTask: SwarmTask = {
      ...task,
      status: 'completed',
      completedAt: new Date(),
      result
    };

    this.tasks.set(taskId, updatedTask);
    this.tasksCompleted++;

    // Learn from completed tasks
    if (this.adaptiveLearning) {
      await this.adaptiveLearning.recordSuccess({
        operation: 'task_completion',
        context: { swarmId: this.config.swarmId, taskType: task.type },
        duration: updatedTask.completedAt!.getTime() - task.createdAt.getTime(),
        outcome: 'success'
      });
    }

    this.logger.info(`Task completed: ${taskId} in swarm ${this.config.swarmId}`);
    this.emit('taskCompleted', { task: updatedTask });
  }

  private updateAgentStatus(agentId: string, status: SwarmAgent['status']): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const updatedAgent: SwarmAgent = {
      ...agent,
      status,
      lastActivity: new Date()
    };

    this.agents.set(agentId, updatedAgent);
    this.emit('agentStatusChanged', { agent: updatedAgent });
  }

  private async handleConversationCompletion(conversationId: string, outcome: any): Promise<void> {
    this.activeConversations.delete(conversationId);

    // Store conversation outcome
    await storeCoordinationFact({
      id: `conversation-outcome-${conversationId}`,
      content: {
        type: 'conversation_completion',
        swarmId: this.config.swarmId,
        conversationId,
        outcome,
        completedAt: new Date()
      },
      timestamp: new Date(),
      source: 'swarm-commander'
    });

    this.logger.info(`Conversation completed: ${conversationId} in swarm ${this.config.swarmId}`);
  }

  private getSwarmCapabilities(): string[] {
    return [
      'sparc-implementation',
      'multi-agent-coordination',
      'conversation-orchestration',
      'consensus-building',
      'task-distribution',
      'performance-monitoring',
      'adaptive-learning',
      'workflow-orchestration'
    ];
  }
}

/**
 * Create a Swarm Commander with default configuration
 */
export function createSwarmCommander(
  config: Partial<SwarmCommanderConfig> & { swarmId: string },
  memoryCoordinator: MemoryCoordinator,
  eventBus?: EventBus
): SwarmCommander {
  const defaultConfig: SwarmCommanderConfig = {
    swarmId: config.swarmId,
    commanderType: 'development',
    maxAgents: 10,
    sparcEnabled: true,
    autonomyLevel: 0.7,
    learningEnabled: true,
    learningMode: 'active',
    resourceLimits: {
      memory: 1024, // MB
      cpu: 80,      // %
      storage: 2048 // MB
    },
    performanceMetrics: {
      enabled: true,
      interval: 60000, // 1 minute
      thresholds: {
        responseTime: 5000,  // 5 seconds
        successRate: 90,     // %
        errorRate: 5         // %
      }
    }
  };

  const finalConfig = { ...defaultConfig, ...config };
  return new SwarmCommander(finalConfig, memoryCoordinator, eventBus);
}

/**
 * Default export for easy import
 */
export default {
  SwarmCommander,
  createSwarmCommander
};