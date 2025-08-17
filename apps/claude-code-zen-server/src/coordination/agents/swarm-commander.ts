/**
 * Swarm Commander System for THE COLLECTIVE.
 * Leads SPARC implementation within individual swarms.
 * Coordinates systematic development methodology with agents.
 */
/**
 * @file Swarm Commander - SPARC implementation leadership within swarms.
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config';
import type {
  EventBus,
  Logger,
} from '../../core/interfaces/base-interfaces';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator';
import {
  CollectiveFACTSystem,
  getCollectiveFACT,
  initializeCollectiveFACT,
} from '../collective-fact-integration';
import { generateId } from '../swarm/core/utils';
// SPARC Integration for Implementation Leadership
import { SPARCEngineCore } from '../swarm/sparc/core/sparc-engine';
import type {
  ProjectSpecification,
  SPARCProject,
  SPARCPhase,
} from '../swarm/sparc/types/sparc-types';
import type { AgentType } from '../../types/agent-types';

// External conversation framework library
import type { 
  ConversationFramework,
  ConversationConfig,
  ConversationSession,
  ConversationDecision
} from 'conversation-framework';

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
    timeout: number;
  };
  learningConfig: {
    realTimeLearning: boolean;
    crossSwarmLearning: boolean;
    experimentalPatterns: boolean;
    learningRate: number; // 0-1
  };
  conversationMode: {
    enabled: boolean;
    useForTaskAssignment: boolean;
    useForPhaseTransitions: boolean;
    useForTechnicalConsultations: boolean;
    useForArchitectureReviews: boolean;
    defaultTimeout: number; // milliseconds
    fallbackToDirectExecution: boolean;
    autoTriggerCriteria: {
      minPriority: 'medium' | 'high' | 'critical';
      minEstimatedEffort: number;
      minDependencies: number;
      phases: SPARCPhase[];
      domains: string[];
      minRiskLevel: 'medium' | 'high' | 'critical';
    };
  };
}

export interface SwarmCommanderCapabilities {
  sparcLeadership: boolean;
  phaseCoordination: boolean;
  agentManagement: boolean;
  qualityAssurance: boolean;
  progressTracking: boolean;
  riskManagement: boolean;
}

export interface SwarmTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgents: AgentType[];
  sparcPhase?: SPARCPhase;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  estimatedEffort: number;
  actualEffort?: number;
  dependencies: string[];
  deliverables: string[];
}

export interface SwarmMetrics {
  tasksCompleted: number;
  averageCycleTime: number;
  qualityScore: number;
  agentUtilization: number;
  sparcEfficiency: number;
  blockerResolutionTime: number;
}

export interface SwarmCommanderState {
  id: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  currentTask?: SwarmTask;
  activeAgents: AgentType[];
  availableAgents: AgentType[];
  sparcProject?: SPARCProject;
  currentPhase?: SPARCPhase;
  metrics: SwarmMetrics;
}

export interface AgentPerformanceHistory {
  agentType: AgentType;
  tasksCompleted: number;
  averageQuality: number;
  averageSpeed: number;
  specializations: string[];
  failurePatterns: string[];
  successPatterns: string[];
  lastUpdated: Date;
}

export interface PhaseEfficiencyMetrics {
  phase: SPARCPhase;
  averageDuration: number;
  successRate: number;
  commonBottlenecks: string[];
  bestPractices: string[];
  optimalAgentCombinations: AgentType[][];
}

export interface SuccessfulPattern {
  patternId: string;
  taskType: string;
  sparcApproach: string;
  agentConfiguration: AgentType[];
  successRate: number;
  avgImplementationTime: number;
  qualityScore: number;
  reusable: boolean;
}

/**
 * Swarm Commander - Leads SPARC implementation within swarms.
 *
 * Responsibilities:
 * - Lead systematic SPARC implementation
 * - Coordinate agents through SPARC phases
 * - Ensure quality and progress tracking
 * - Escalate blockers to Queen Coordinator
 */
export class SwarmCommander extends EventEmitter {
  public readonly id: string;
  public readonly swarmId: string;
  public readonly commanderType: string;

  private logger: Logger;
  private eventBus: EventBus;
  private memoryCoordinator: MemoryCoordinator;
  private config: SwarmCommanderConfig;
  private state: SwarmCommanderState;

  // SPARC Implementation Leadership
  private sparcEngine: SPARCEngineCore;
  private activeProject?: SPARCProject;
  private currentTasks = new Map<string, SwarmTask>();

  // ULTRA-DATABASE NTEGRATION
  private factSystem: CollectiveFACTSystem;

  // CONVERSATION FRAMEWORK NTEGRATION
  private conversationSystem?: ConversationFramework;
  private activeConversations = new Map<string, ConversationSession>();
  private conversationHistory = new Map<string, ConversationDecision>();

  // Persistent Neural Learning
  private agentPerformanceHistory = new Map<
    AgentType,
    AgentPerformanceHistory
  >();
  private sparcPhaseEfficiency = new Map<SPARCPhase, PhaseEfficiencyMetrics>();
  private implementationPatterns = new Map<string, SuccessfulPattern>();

  constructor(
    config: SwarmCommanderConfig,
    eventBus: EventBus,
    memoryCoordinator: MemoryCoordinator
  ) {
    super();

    this.id = generateId();
    this.swarmId = config.swarmId;
    this.commanderType = config.commanderType;
    this.config = config;
    this.eventBus = eventBus;
    this.memoryCoordinator = memoryCoordinator;

    this.logger = getLogger(
      `SwarmCommander-${this.swarmId}-${this.commanderType}`
    );

    // SHARED FACT SYSTEM: All hierarchy levels use the same CollectiveFACTSystem instance
    this.factSystem = new CollectiveFACTSystem({
      enableCache: true,
      cacheSize: 1000,
      knowledgeSources: ['.claude-zen/fact'],
      autoRefreshInterval: 3600000,
    });

    // Initialize SPARC engine for implementation leadership
    this.sparcEngine = new SPARCEngineCore();

    // Initialize state
    this.state = {
      id: this.id,
      status: 'idle',
      activeAgents: [],
      availableAgents: [],
      metrics: {
        tasksCompleted: 0,
        averageCycleTime: 0,
        qualityScore: 0.95,
        agentUtilization: 0,
        sparcEfficiency: 0,
        blockerResolutionTime: 0,
      },
    };

    this.setupEventHandlers();

    // Load persistent neural learning data (async initialization)
    this.loadPersistentLearning().catch((error) => {
      this.logger.warn(
        `Failed to load persistent learning data during initialization: ${error}`
      );
    });

    // Initialize conversation system if enabled
    if (config.conversationMode?.enabled) {
      this.initializeConversationSystem().catch((error) => {
        this.logger.warn(`Failed to initialize conversation system: ${error}`);
        if (!config.conversationMode.fallbackToDirectExecution) {
          throw new Error(`Conversation system required but failed to initialize: ${error}`);
        }
      });
    }

    this.logger.info(
      `Swarm Commander initialized for ${config.commanderType} swarm with persistent learning${config.conversationMode?.enabled ? ' and conversation framework' : ''}`
    );
  }

  /**
   * Initialize the conversation framework system.
   */
  private async initializeConversationSystem(): Promise<void> {
    try {
      // Use external conversation framework library
      const { ConversationFramework } = await import('conversation-framework');
      
      this.conversationSystem = await ConversationFramework.create({
        memoryBackend: 'sqlite',
        memoryConfig: {
          path: '.claude-zen/conversations',
        },
      });

      this.logger.info('Conversation framework system initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize conversation system: ${error}`);
      throw error;
    }
  }

  /**
   * Setup event handlers for swarm coordination
   */
  private setupEventHandlers(): void {
    this.eventBus.on(
      `swarm:${this.swarmId}:task:assigned`,
      this.handleTaskAssignment.bind(this)
    );
    this.eventBus.on(
      `swarm:${this.swarmId}:agent:available`,
      this.handleAgentAvailable.bind(this)
    );
    this.eventBus.on(
      `swarm:${this.swarmId}:sparc:phase:complete`,
      this.handlePhaseCompletion.bind(this)
    );
  }

  /**
   * Accept task assignment from Queen Coordinator and begin SPARC implementation
   */
  async handleTaskAssignment(taskData: Partial<SwarmTask> & { title: string; description: string }): Promise<void> {
    this.logger.info(`Task assigned: ${taskData.title}`);

    const task: SwarmTask = {
      id: generateId(),
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority || 'medium',
      assignedAgents: [],
      status: 'pending',
      estimatedEffort: taskData.estimatedEffort || 8,
      dependencies: taskData.dependencies || [],
      deliverables: taskData.deliverables || [],
    };

    this.currentTasks.set(task.id, task);
    this.state.currentTask = task;
    this.state.status = 'busy';

    // Check if conversation mode should be used for task assignment
    const shouldUseConversation = this.shouldUseConversationForTaskAssignment(task);

    if (shouldUseConversation && this.conversationSystem) {
      try {
        const assignmentDecision = await this.conductTaskAssignmentConversation(task);
        
        if (assignmentDecision.decision === 'proceed') {
          // Apply any modifications suggested by conversation
          if (assignmentDecision.modifications) {
            this.applyTaskModifications(task, assignmentDecision.modifications);
          }
        } else if (assignmentDecision.decision === 'reject') {
          this.logger.info(`Task assignment rejected by conversation: ${assignmentDecision.reasoning}`);
          return;
        } else if (assignmentDecision.decision === 'escalate') {
          await this.escalateToQueenCoordinator(task.id, 'task_assignment_escalated', assignmentDecision);
          return;
        }
      } catch (error) {
        this.logger.warn(`Task assignment conversation failed: ${error}`);
        if (!this.config.conversationMode.fallbackToDirectExecution) {
          throw error;
        }
        this.logger.info('Falling back to direct task assignment');
      }
    }

    // Begin SPARC implementation if enabled
    if (this.config.sparcEnabled) {
      await this.initiateSPARCImplementation(task);
    } else {
      await this.executeDirectImplementation(task);
    }
  }

  /**
   * Determine if conversation mode should be used for task assignment.
   */
  private shouldUseConversationForTaskAssignment(task: SwarmTask): boolean {
    if (!this.config.conversationMode?.useForTaskAssignment) {
      return false;
    }

    const criteria = this.config.conversationMode.autoTriggerCriteria;
    
    // Check if task meets conversation criteria
    const priorityMatches = ['critical', 'high', 'medium'].indexOf(task.priority) <= ['critical', 'high', 'medium'].indexOf(criteria.minPriority);
    const effortMatches = task.estimatedEffort >= criteria.minEstimatedEffort;
    const dependenciesMatch = task.dependencies.length >= criteria.minDependencies;
    
    return priorityMatches || effortMatches || dependenciesMatch;
  }

  /**
   * Conduct task assignment conversation with relevant agents.
   */
  private async conductTaskAssignmentConversation(task: SwarmTask): Promise<ConversationDecision> {
    if (!this.conversationSystem) {
      throw new Error('Conversation system not initialized');
    }

    // Determine participants for task assignment conversation
    const participants = this.selectTaskAssignmentParticipants(task);

    const conversationConfig: ConversationConfig = {
      title: `Task Assignment Review: ${task.title}`,
      description: `Review and validate task assignment for: ${task.description}`,
      pattern: 'planning',
      context: {
        goal: 'Determine optimal agent assignment and task parameters',
        constraints: [`Estimated effort: ${task.estimatedEffort}h`, `Priority: ${task.priority}`],
        resources: [`Available agents: ${this.state.availableAgents.join(', ')}`],
        domain: 'task-management',
        expertise: ['coordination', 'resource-planning', 'agent-optimization'],
      },
      initialParticipants: participants.map(type => ({ 
        id: `${type}_${this.swarmId}`, 
        type: type as any, 
        swarmId: this.swarmId 
      })),
      timeout: this.config.conversationMode.defaultTimeout,
    };

    // Start conversation
    const session = await this.conversationSystem.orchestrator.createConversation(conversationConfig);
    this.activeConversations.set(task.id, session);

    // Monitor conversation and extract decision
    return this.monitorTaskAssignmentConversation(session, task);
  }

  /**
   * Select appropriate participants for task assignment conversation.
   */
  private selectTaskAssignmentParticipants(task: SwarmTask): AgentType[] {
    const participants: AgentType[] = ['coordinator']; // Always include coordinator

    // Add domain-specific experts based on task characteristics
    if (task.title.toLowerCase().includes('security') || task.title.toLowerCase().includes('auth')) {
      participants.push('security');
    }
    if (task.title.toLowerCase().includes('performance') || task.title.toLowerCase().includes('optimization')) {
      participants.push('performance-analyzer');
    }
    if (task.title.toLowerCase().includes('database') || task.title.toLowerCase().includes('data')) {
      participants.push('data');
    }
    if (task.estimatedEffort > 15) {
      participants.push('architect'); // Complex tasks need architectural input
    }

    // Always include a planner for capacity planning
    participants.push('planner');

    return [...new Set(participants)]; // Remove duplicates
  }

  /**
   * Monitor task assignment conversation and extract decision.
   */
  private async monitorTaskAssignmentConversation(
    session: ConversationSession,
    task: SwarmTask
  ): Promise<ConversationDecision> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const timeout = setTimeout(() => {
        reject(new Error('Task assignment conversation timeout'));
      }, this.config.conversationMode.defaultTimeout);

      // Monitor conversation status
      const checkStatus = async () => {
        try {
          if (session.status === 'completed') {
            clearTimeout(timeout);
            const decision = this.extractTaskAssignmentDecision(session);
            
            // Store conversation history
            this.conversationHistory.set(task.id, decision);
            this.activeConversations.delete(task.id);
            
            resolve(decision);
          } else if (session.status === 'error' || session.status === 'terminated') {
            clearTimeout(timeout);
            reject(new Error(`Conversation failed with status: ${session.status}`));
          } else {
            // Check again in 1 second
            setTimeout(checkStatus, 1000);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      checkStatus();
    });
  }

  /**
   * Extract task assignment decision from conversation outcomes.
   */
  private extractTaskAssignmentDecision(session: ConversationSession): ConversationDecision {
    // Analyze conversation outcomes to determine decision
    const outcomes = session.outcomes;
    const lastMessage = session.messages[session.messages.length - 1];

    // For now, implement basic decision extraction
    // In a full implementation, this would use NLP to analyze conversation content
    let decision: 'proceed' | 'modify' | 'reject' | 'escalate' = 'proceed';
    let reasoning = 'Task assignment approved by conversation participants';
    let modifications: string[] = [];

    // Check for consensus in outcomes
    const consensusOutcome = outcomes.find(o => o.type === 'decision');
    if (consensusOutcome && consensusOutcome.confidence < 0.7) {
      decision = 'modify';
      reasoning = 'Low confidence in current approach, modifications recommended';
      modifications = ['Reduce estimated effort', 'Add additional domain expert'];
    }

    return {
      decision,
      reasoning,
      modifications,
      confidence: session.metrics.consensusScore,
      participantConsensus: session.metrics.consensusScore,
      timestamp: new Date(),
    };
  }

  /**
   * Apply task modifications suggested by conversation.
   */
  private applyTaskModifications(task: SwarmTask, modifications: string[]): void {
    for (const modification of modifications) {
      if (modification.includes('Reduce estimated effort')) {
        task.estimatedEffort = Math.max(1, task.estimatedEffort * 0.8);
      }
      if (modification.includes('Add additional domain expert')) {
        // This would be handled in agent assignment phase
      }
      // Add more modification handlers as needed
    }

    this.logger.info(`Applied modifications to task ${task.id}: ${modifications.join(', ')}`);
  }

  /**
   * Initiate SPARC methodology for systematic implementation
   */
  private async initiateSPARCImplementation(task: SwarmTask): Promise<void> {
    this.logger.info(`Initiating SPARC implementation for: ${task.title}`);

    // Create SPARC project specification from task
    const projectSpec: ProjectSpecification = {
      name: task.title,
      domain: 'general',
      complexity: 'moderate',
      requirements: [task.description, ...task.deliverables],
      constraints: [],
    };

    try {
      // Initialize SPARC project
      this.activeProject =
        await this.sparcEngine.initializeProject(projectSpec);
      task.sparcPhase = 'specification';

      // Begin with Specification phase
      await this.executeSPARCPhase('specification', task);

      this.eventBus.emit(`swarm:${this.swarmId}:sparc:initiated`, {
        taskId: task.id,
        projectId: this.activeProject.id,
        phase: 'specification',
      });
    } catch (error) {
      this.logger.error(`Failed to initiate SPARC: ${error}`);
      await this.escalateToQueenCoordinator(
        task.id,
        'sparc_initialization_failed',
        error
      );
    }
  }

  /**
   * Execute specific SPARC phase with agent coordination
   */
  private async executeSPARCPhase(
    phase: SPARCPhase,
    task: SwarmTask
  ): Promise<void> {
    this.logger.info(`Executing SPARC phase: ${phase} for task: ${task.title}`);

    task.sparcPhase = phase;
    this.state.currentPhase = phase;

    // Check if conversation should be used for phase transition validation
    const shouldUseConversation = this.shouldUseConversationForPhaseTransition(phase, task);

    if (shouldUseConversation && this.conversationSystem) {
      // Conduct phase validation conversation before execution
      try {
        const validationDecision = await this.conductPhaseTransitionConversation(phase, task);
        
        if (validationDecision.decision !== 'proceed') {
          this.logger.info(`SPARC phase ${phase} validation failed: ${validationDecision.reasoning}`);
          
          if (validationDecision.decision === 'escalate') {
            await this.escalateToQueenCoordinator(task.id, `sparc_phase_validation_escalated`, validationDecision);
            return;
          }
          
          // Apply modifications if suggested
          if (validationDecision.modifications) {
            this.applyPhaseModifications(phase, task, validationDecision.modifications);
          }
        }
      } catch (error) {
        this.logger.warn(`Phase transition conversation failed: ${error}`);
        if (!this.config.conversationMode.fallbackToDirectExecution) {
          throw error;
        }
      }
    }

    try {
      // Consult Matron for phase-specific guidance
      const matronGuidance = await this.getMatronGuidanceForPhase(phase, task);

      // Coordinate agents based on SPARC phase requirements and Matron guidance
      const requiredAgents = this.determineRequiredAgents(phase);
      await this.assignAgentsToPhase(requiredAgents, phase, task);

      // Execute phase with SPARC engine, incorporating Matron guidance
      const phaseContext = this.buildPhaseContext(task);
      phaseContext.matronGuidance = matronGuidance;

      const phaseResult = await this.sparcEngine.executePhase(
        this.activeProject!,
        phase
      );

      this.logger.info(
        `SPARC phase ${phase} completed successfully with Matron guidance`
      );

      // Move to next phase or complete
      await this.progressToNextPhase(phase, task);
    } catch (error) {
      this.logger.error(`SPARC phase ${phase} failed: ${error}`);
      await this.escalateToQueenCoordinator(
        task.id,
        `sparc_phase_${phase}_failed`,
        error
      );
    }
  }

  /**
   * Determine if conversation should be used for phase transition.
   */
  private shouldUseConversationForPhaseTransition(phase: SPARCPhase, task: SwarmTask): boolean {
    if (!this.config.conversationMode?.useForPhaseTransitions) {
      return false;
    }

    const criteria = this.config.conversationMode.autoTriggerCriteria;
    
    // Use conversation for specified phases or critical tasks
    return criteria.phases.includes(phase) || task.priority === 'critical';
  }

  /**
   * Conduct phase transition validation conversation.
   */
  private async conductPhaseTransitionConversation(
    phase: SPARCPhase,
    task: SwarmTask
  ): Promise<ConversationDecision> {
    if (!this.conversationSystem) {
      throw new Error('Conversation system not initialized');
    }

    const reviewers = this.selectPhaseTransitionReviewers(phase);

    const conversationConfig: ConversationConfig = {
      title: `SPARC Phase Validation: ${phase}`,
      description: `Validate readiness for SPARC ${phase} phase execution`,
      pattern: 'architecture-review',
      context: {
        goal: `Ensure ${phase} phase is properly prepared and executable`,
        constraints: [`Task priority: ${task.priority}`, `Dependencies: ${task.dependencies.length}`],
        resources: [`Assigned agents: ${task.assignedAgents.join(', ')}`],
        domain: 'sparc-methodology',
        expertise: ['architecture', 'methodology', 'quality-assurance'],
      },
      initialParticipants: reviewers.map(type => ({ 
        id: `${type}_${this.swarmId}`, 
        type: type as any, 
        swarmId: this.swarmId 
      })),
      timeout: this.config.conversationMode.defaultTimeout,
    };

    const session = await this.conversationSystem.orchestrator.createConversation(conversationConfig);
    return this.monitorPhaseTransitionConversation(session, phase);
  }

  /**
   * Select reviewers for phase transition validation.
   */
  private selectPhaseTransitionReviewers(phase: SPARCPhase): AgentType[] {
    const baseReviewers: AgentType[] = ['coordinator'];

    switch (phase) {
      case 'specification':
        return [...baseReviewers, 'analyst', 'technical-writer'];
      case 'pseudocode':
        return [...baseReviewers, 'architect', 'developer'];
      case 'architecture':
        return [...baseReviewers, 'architect', 'security'];
      case 'refinement':
        return [...baseReviewers, 'developer', 'reviewer'];
      case 'completion':
        return [...baseReviewers, 'tester', 'ops'];
      default:
        return baseReviewers;
    }
  }

  /**
   * Monitor phase transition conversation.
   */
  private async monitorPhaseTransitionConversation(
    session: ConversationSession,
    phase: SPARCPhase
  ): Promise<ConversationDecision> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Phase transition conversation timeout'));
      }, this.config.conversationMode.defaultTimeout);

      const checkStatus = async () => {
        try {
          if (session.status === 'completed') {
            clearTimeout(timeout);
            const decision = this.extractPhaseTransitionDecision(session, phase);
            resolve(decision);
          } else if (session.status === 'error' || session.status === 'terminated') {
            clearTimeout(timeout);
            reject(new Error(`Phase transition conversation failed: ${session.status}`));
          } else {
            setTimeout(checkStatus, 1000);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      checkStatus();
    });
  }

  /**
   * Extract phase transition decision from conversation.
   */
  private extractPhaseTransitionDecision(session: ConversationSession, phase: SPARCPhase): ConversationDecision {
    // Analyze conversation for phase transition decision
    const consensusScore = session.metrics.consensusScore;
    let decision: 'proceed' | 'modify' | 'reject' | 'escalate' = 'proceed';
    let reasoning = `${phase} phase validated and approved for execution`;
    let modifications: string[] = [];

    if (consensusScore < 0.6) {
      decision = 'modify';
      reasoning = `${phase} phase requires modifications before execution`;
      modifications = ['Add additional validation steps', 'Include domain expert review'];
    } else if (consensusScore < 0.4) {
      decision = 'escalate';
      reasoning = `${phase} phase validation requires higher-level review`;
    }

    return {
      decision,
      reasoning,
      modifications,
      confidence: consensusScore,
      participantConsensus: consensusScore,
      timestamp: new Date(),
    };
  }

  /**
   * Apply phase modifications suggested by conversation.
   */
  private applyPhaseModifications(phase: SPARCPhase, task: SwarmTask, modifications: string[]): void {
    // Apply suggested modifications to phase execution
    this.logger.info(`Applying modifications to ${phase} phase: ${modifications.join(', ')}`);
    
    // In a full implementation, this would modify phase execution parameters
    // For now, we log the modifications for tracking
  }

  /**
   * Determine required agents based on SPARC phase
   */
  private determineRequiredAgents(phase: SPARCPhase): AgentType[] {
    switch (phase) {
      case 'specification':
        return ['analyst', 'technical-writer'];
      case 'pseudocode':
        return ['architect', 'developer'];
      case 'architecture':
        return ['architect', 'analyst'];
      case 'refinement':
        return ['developer', 'reviewer'];
      case 'completion':
        return ['tester', 'ops', 'documentation-specialist'];
      default:
        return ['coordinator'];
    }
  }

  /**
   * Assign agents to SPARC phase execution
   */
  private async assignAgentsToPhase(
    requiredAgents: AgentType[],
    phase: SPARCPhase,
    task: SwarmTask
  ): Promise<void> {
    for (const agentType of requiredAgents) {
      if (this.state.availableAgents.includes(agentType)) {
        task.assignedAgents.push(agentType);
        this.state.activeAgents.push(agentType);

        this.eventBus.emit(`swarm:${this.swarmId}:agent:assigned`, {
          agentType,
          taskId: task.id,
          phase,
          role: `${phase}_specialist`,
        });
      }
    }
  }

  /**
   * Build context for SPARC phase execution
   */
  private buildPhaseContext(task: SwarmTask): Record<string, unknown> {
    return {
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        requirements: task.deliverables,
      },
      swarm: {
        commanderId: this.id,
        swarmId: this.swarmId,
        type: this.commanderType,
      },
      resources: {
        assignedAgents: task.assignedAgents,
        timeAllocation: task.estimatedEffort,
        qualityTarget: 0.95,
      },
    };
  }

  /**
   * Progress to next SPARC phase or complete implementation
   */
  private async progressToNextPhase(
    currentPhase: SPARCPhase,
    task: SwarmTask
  ): Promise<void> {
    const phaseOrder: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];
    const currentIndex = phaseOrder.indexOf(currentPhase);

    if (currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];
      this.logger.info(`Progressing from ${currentPhase} to ${nextPhase}`);
      await this.executeSPARCPhase(nextPhase, task);
    } else {
      await this.completeImplementation(task);
    }
  }

  /**
   * Complete implementation and report to Queen Coordinator
   */
  private async completeImplementation(task: SwarmTask): Promise<void> {
    task.status = 'completed';
    task.actualEffort = task.estimatedEffort; // In real implementation, track actual time

    this.state.metrics.tasksCompleted++;
    this.state.status = 'active';

    // TIER 1: Real-time learning from task completion
    if (this.config.learningEnabled) {
      await this.performRealTimeLearning(task);
    }

    this.state.currentTask = undefined;
    this.logger.info(`Implementation completed: ${task.title}`);

    this.eventBus.emit(`swarm:${this.swarmId}:task:completed`, {
      taskId: task.id,
      title: task.title,
      completionTime: new Date(),
      metrics: {
        actualEffort: task.actualEffort,
        qualityScore: this.state.metrics.qualityScore,
        sparcPhasesCompleted: 5,
      },
      learningData: this.config.learningConfig.crossSwarmLearning
        ? {
            agentPerformance: Array.from(
              this.agentPerformanceHistory.entries()
            ),
            phaseEfficiency: Array.from(this.sparcPhaseEfficiency.entries()),
            patterns: Array.from(this.implementationPatterns.entries()),
          }
        : undefined,
    });
  }

  /**
   * Execute direct implementation without SPARC methodology
   */
  private async executeDirectImplementation(task: SwarmTask): Promise<void> {
    this.logger.info(`Executing direct implementation for: ${task.title}`);

    // Simplified direct execution
    const requiredAgents: AgentType[] = ['coordinator', 'reviewer'];
    await this.assignAgentsToPhase(requiredAgents, 'completion', task);

    // Simulate implementation work
    setTimeout(() => {
      this.completeImplementation(task);
    }, 5000);
  }

  /**
   * Handle agent becoming available
   */
  private handleAgentAvailable(agentData: unknown): void {
    const agentType = (agentData as any).agentType as AgentType;

    if (!this.state.availableAgents.includes(agentType)) {
      this.state.availableAgents.push(agentType);
      this.logger.debug(`Agent available: ${agentType}`);
    }
  }

  /**
   * Handle SPARC phase completion
   */
  private handlePhaseCompletion(phaseData: unknown): void {
    this.logger.info(`Phase completed: ${(phaseData as any).phase}`);
    this.state.metrics.sparcEfficiency = (phaseData as any).efficiency || 0.85;
  }

  /**
   * Escalate issues to Queen Coordinator
   */
  private async escalateToQueenCoordinator(
    taskId: string,
    issueType: string,
    details: unknown
  ): Promise<void> {
    this.logger.warn(
      `Escalating to Queen Coordinator: ${issueType} for task ${taskId}`
    );

    this.eventBus.emit('queen:coordinator:escalation', {
      swarmId: this.swarmId,
      commanderId: this.id,
      taskId,
      issueType,
      details,
      timestamp: new Date(),
    });
  }

  /**
   * Consult Matron for technical expertise and guidance
   */
  private async consultMatron(
    domain:
      | 'architecture'
      | 'development'
      | 'security'
      | 'performance'
      | 'operations',
    consultationType: 'guidance' | 'review' | 'validation' | 'best_practices',
    context: {
      taskId?: string;
      sparcPhase?: SPARCPhase;
      technicalChallenge: string;
      currentApproach?: string;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<unknown> {
    this.logger.info(
      `Consulting ${domain} Matron for ${consultationType}: ${context.technicalChallenge}`
    );

    return new Promise((resolve) => {
      // Set up response handler
      const responseHandler = (response: unknown) => {
        if ((response as any).consultationId === consultationId) {
          this.eventBus.off('matron:consultation:response', responseHandler);
          resolve(response);
        }
      };

      const consultationId = `${this.id}_${Date.now()}`;
      this.eventBus.on('matron:consultation:response', responseHandler);

      // Send consultation request
      this.eventBus.emit('matron:consultation:request', {
        consultationId,
        domain,
        consultationType,
        swarmId: this.swarmId,
        commanderId: this.id,
        context,
        timestamp: new Date(),
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        this.eventBus.off('matron:consultation:response', responseHandler);
        resolve({
          error: 'Matron consultation timeout',
          fallbackGuidance: this.getFallbackGuidance(domain, consultationType),
        });
      }, 30000);
    });
  }

  /**
   * Get fallback guidance when Matron consultation fails
   */
  private getFallbackGuidance(
    domain: string,
    consultationType: string
  ): Record<string, unknown> {
    const fallbackGuidance = {
      architecture: {
        guidance: 'Follow SOLID principles and established design patterns',
        bestPractices: [
          'Single responsibility',
          'Dependency injection',
          'Interface segregation',
        ],
      },
      development: {
        guidance: 'Use TDD approach with comprehensive testing',
        bestPractices: [
          'Write tests first',
          'Refactor continuously',
          'Code review required',
        ],
      },
      security: {
        guidance: 'Apply defense in depth and least privilege principles',
        bestPractices: [
          'Input validation',
          'Authentication required',
          'Audit logging',
        ],
      },
      performance: {
        guidance: 'Optimize for scalability and efficient resource usage',
        bestPractices: [
          'Profile before optimizing',
          'Cache appropriately',
          'Monitor metrics',
        ],
      },
      operations: {
        guidance: 'Ensure observability and maintainability',
        bestPractices: [
          'Logging',
          'Monitoring',
          'Health checks',
          'Graceful degradation',
        ],
      },
    };

    return (
      fallbackGuidance[domain] || {
        guidance: 'Follow established best practices',
      }
    );
  }

  /**
   * Get Matron guidance for specific SPARC phase
   */
  private async getMatronGuidanceForPhase(
    phase: SPARCPhase,
    task: SwarmTask
  ): Promise<unknown> {
    // Determine which Matron domain is most relevant for the phase
    const phaseMatronMapping = {
      specification: 'architecture',
      pseudocode: 'development',
      architecture: 'architecture',
      refinement: 'development',
      completion: 'operations',
    };

    const domain = phaseMatronMapping[phase] as
      | 'architecture'
      | 'development'
      | 'security'
      | 'performance'
      | 'operations';

    // Assess risk level based on task complexity and phase
    const riskLevel = this.assessRiskLevel(task, phase);

    // Get guidance from appropriate Matron
    const guidance = await this.consultMatron(domain, 'guidance', {
      taskId: task.id,
      sparcPhase: phase,
      technicalChallenge: `SPARC ${phase} phase for: ${task.description}`,
      riskLevel,
    });

    return guidance;
  }

  /**
   * Assess risk level for Matron consultation
   */
  private assessRiskLevel(
    task: SwarmTask,
    phase: SPARCPhase
  ): 'low' | 'medium' | 'high' | 'critical' {
    // Base risk on task priority and complexity
    if (task.priority === 'critical') return 'critical';
    if (task.priority === 'high') return 'high';

    // Architecture and specification phases are higher risk
    if (phase === 'architecture' || phase === 'specification') {
      return task.priority === 'medium' ? 'high' : 'medium';
    }

    // Default to medium for development phases
    return 'medium';
  }

  /**
   * Public method to consult Matron (exposed to MCP)
   */
  public async requestMatronConsultation(
    domain:
      | 'architecture'
      | 'development'
      | 'security'
      | 'performance'
      | 'operations',
    consultationType: 'guidance' | 'review' | 'validation' | 'best_practices',
    technicalChallenge: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<unknown> {
    this.logger.info(
      `Public Matron consultation requested: ${domain} - ${technicalChallenge}`
    );

    // Check if conversation mode should be used for technical consultations
    const shouldUseConversation = this.shouldUseConversationForTechnicalConsultation(domain, riskLevel);

    if (shouldUseConversation && this.conversationSystem) {
      try {
        return await this.conductTechnicalConsultationConversation(
          domain,
          consultationType,
          technicalChallenge,
          riskLevel
        );
      } catch (error) {
        this.logger.warn(`Technical consultation conversation failed: ${error}`);
        if (!this.config.conversationMode.fallbackToDirectExecution) {
          throw error;
        }
      }
    }

    // Fall back to standard Matron consultation
    const contextData = await this.gatherConsultationContext(
      domain,
      technicalChallenge
    );

    return await this.consultMatron(domain, consultationType, {
      technicalChallenge,
      riskLevel,
      sparcPhase: this.state.currentPhase,
      contextData,
    } as any);
  }

  /**
   * Determine if conversation should be used for technical consultations.
   */
  private shouldUseConversationForTechnicalConsultation(
    domain: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical'
  ): boolean {
    if (!this.config.conversationMode?.useForTechnicalConsultations) {
      return false;
    }

    const criteria = this.config.conversationMode.autoTriggerCriteria;
    
    // Use conversation for high-risk consultations or specific domains
    const riskMatches = ['critical', 'high', 'medium'].indexOf(riskLevel) <= ['critical', 'high', 'medium'].indexOf(criteria.minRiskLevel);
    const domainMatches = criteria.domains.includes(domain) || criteria.domains.includes('all');
    
    return riskMatches || domainMatches;
  }

  /**
   * Conduct technical consultation conversation with domain experts.
   */
  private async conductTechnicalConsultationConversation(
    domain: string,
    consultationType: string,
    technicalChallenge: string,
    riskLevel: string
  ): Promise<unknown> {
    if (!this.conversationSystem) {
      throw new Error('Conversation system not initialized');
    }

    const experts = this.selectTechnicalConsultationExperts(domain);

    const conversationConfig: ConversationConfig = {
      title: `Technical Consultation: ${domain}`,
      description: `${consultationType} consultation for: ${technicalChallenge}`,
      pattern: 'technical-review',
      context: {
        goal: `Provide expert ${consultationType} for ${domain} challenge`,
        constraints: [`Risk level: ${riskLevel}`, `Domain: ${domain}`],
        resources: [`Swarm: ${this.swarmId}`, `Phase: ${this.state.currentPhase || 'none'}`],
        domain: domain,
        expertise: [domain, 'technical-consultation', consultationType],
      },
      initialParticipants: experts.map(type => ({ 
        id: `${type}_${this.swarmId}`, 
        type: type as any, 
        swarmId: this.swarmId 
      })),
      timeout: this.config.conversationMode.defaultTimeout,
    };

    const session = await this.conversationSystem.orchestrator.createConversation(conversationConfig);
    return this.monitorTechnicalConsultationConversation(session, domain, technicalChallenge);
  }

  /**
   * Select experts for technical consultation.
   */
  private selectTechnicalConsultationExperts(domain: string): AgentType[] {
    const baseExperts: AgentType[] = ['coordinator'];

    switch (domain) {
      case 'architecture':
        return [...baseExperts, 'architect', 'analyst', 'system-architect'];
      case 'development':
        return [...baseExperts, 'developer', 'architect', 'reviewer'];
      case 'security':
        return [...baseExperts, 'security', 'security-analyzer', 'security-architect'];
      case 'performance':
        return [...baseExperts, 'performance-analyzer', 'bottleneck-analyzer', 'optimizer'];
      case 'operations':
        return [...baseExperts, 'ops', 'devops-engineer', 'infrastructure-ops'];
      default:
        return [...baseExperts, 'analyst'];
    }
  }

  /**
   * Monitor technical consultation conversation.
   */
  private async monitorTechnicalConsultationConversation(
    session: ConversationSession,
    domain: string,
    challenge: string
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Technical consultation conversation timeout'));
      }, this.config.conversationMode.defaultTimeout);

      const checkStatus = async () => {
        try {
          if (session.status === 'completed') {
            clearTimeout(timeout);
            const consultation = this.extractTechnicalConsultation(session, domain, challenge);
            resolve(consultation);
          } else if (session.status === 'error' || session.status === 'terminated') {
            clearTimeout(timeout);
            reject(new Error(`Technical consultation failed: ${session.status}`));
          } else {
            setTimeout(checkStatus, 1000);
          }
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };

      checkStatus();
    });
  }

  /**
   * Extract technical consultation from conversation.
   */
  private extractTechnicalConsultation(session: ConversationSession, domain: string, challenge: string): unknown {
    // Extract expert recommendations from conversation
    const consensusScore = session.metrics.consensusScore;
    const outcomes = session.outcomes;
    
    // Find technical recommendations in outcomes
    const recommendations = outcomes
      .filter(o => o.type === 'recommendation')
      .map(o => o.content);
    
    const bestPractices = outcomes
      .filter(o => o.type === 'best-practice')
      .map(o => o.content);

    return {
      domain,
      challenge,
      recommendations,
      bestPractices,
      consensusLevel: consensusScore,
      confidence: consensusScore,
      participantExpertise: session.participants.map(p => p.type),
      consultationTimestamp: new Date(),
      fallbackGuidance: consensusScore < 0.5 ? this.getFallbackGuidance(domain, 'consultation') : undefined,
    };
  }

  /**
   * Gather FACT and ADR context for consultations
   */
  private async gatherConsultationContext(
    domain: string,
    challenge: string
  ): Promise<unknown> {
    try {
      // Search relevant ADRs for domain
      const adrResults = await this.factSystem.searchFacts({
        query: `${domain} architecture decision records ${challenge}`,
        type: 'architecture-decision',
        limit: 5,
      });

      // Get domain-specific FACT knowledge
      const domainFacts = await this.factSystem.searchFacts({
        query: `${domain} best practices patterns ${challenge}`,
        type: 'technical-knowledge',
        limit: 10,
      });

      return {
        relevantADRs: adrResults,
        domainKnowledge: domainFacts,
        swarmContext: {
          commanderType: this.commanderType,
          currentPhase: this.state.currentPhase,
          activeAgents: this.state.activeAgents,
        },
      };
    } catch (error) {
      this.logger.warn(`Failed to gather consultation context: ${error}`);
      return { fallback: true };
    }
  }

  /**
   * Request Queen coordination for complex multi-swarm features
   */
  public async requestQueenCoordination(
    coordinationType:
      | 'multi_swarm'
      | 'cross_domain'
      | 'complex_feature'
      | 'resource_conflict',
    coordinationRequest: {
      description: string;
      requiredSwarms: string[];
      complexity: 'medium' | 'high' | 'critical';
      timeline?: Date;
      dependencies?: string[];
    }
  ): Promise<unknown> {
    this.logger.info(
      `Queen coordination requested: ${coordinationType} - ${coordinationRequest.description}`
    );

    // Gather multi-swarm context from FACT system
    const multiSwarmContext =
      await this.gatherMultiSwarmContext(coordinationRequest);

    return new Promise((resolve) => {
      const coordinationId = `${this.id}_queen_${Date.now()}`;

      // Set up response handler
      const responseHandler = (response: unknown) => {
        if ((response as any).coordinationId === coordinationId) {
          this.eventBus.off('queen:coordination:response', responseHandler);
          resolve(response);
        }
      };

      this.eventBus.on('queen:coordination:response', responseHandler);

      // Send coordination request
      this.eventBus.emit('queen:coordination:request', {
        coordinationId,
        coordinationType,
        swarmId: this.swarmId,
        commanderId: this.id,
        request: coordinationRequest,
        context: multiSwarmContext,
        timestamp: new Date(),
      });

      // Timeout after 60 seconds for complex coordination
      setTimeout(() => {
        this.eventBus.off('queen:coordination:response', responseHandler);
        resolve({
          error: 'Queen coordination timeout',
          fallbackStrategy: this.getQueenCoordinationFallback(coordinationType),
        });
      }, 60000);
    });
  }

  /**
   * Gather multi-swarm context for Queen coordination
   */
  private async gatherMultiSwarmContext(request: unknown): Promise<unknown> {
    try {
      // Get cross-swarm patterns and dependencies
      const crossSwarmPatterns = await this.factSystem.searchFacts({
        query: `multi swarm coordination ${(request as any).description}`,
        type: 'coordination-pattern',
        limit: 5,
      });

      // Get feature integration knowledge
      const integrationKnowledge = await this.factSystem.searchFacts({
        query: `${(request as any).requiredSwarms.join(' ')} integration patterns`,
        type: 'integration-knowledge',
        limit: 8,
      });

      return {
        crossSwarmPatterns,
        integrationKnowledge,
        currentSwarmState: this.getState(),
        coordinationHistory: await (this.memoryCoordinator as any).retrieve(
          `queen_coordination_history_${this.swarmId}`
        ),
      };
    } catch (error) {
      this.logger.warn(`Failed to gather multi-swarm context: ${error}`);
      return { fallback: true };
    }
  }

  /**
   * Get fallback strategy when Queen coordination fails
   */
  private getQueenCoordinationFallback(
    coordinationType: string
  ): Record<string, unknown> {
    const fallbackStrategies = {
      multi_swarm: {
        strategy: 'Sequential implementation with interface contracts',
        approach:
          'Define clear APIs between swarms and implement independently',
      },
      cross_domain: {
        strategy: 'Domain boundary enforcement with event-driven integration',
        approach:
          'Use events and message passing for cross-domain coordination',
      },
      complex_feature: {
        strategy: 'Feature decomposition with incremental delivery',
        approach: 'Break feature into smaller, independent deliverables',
      },
      resource_conflict: {
        strategy: 'Resource prioritization based on business value',
        approach:
          'Escalate to higher authority for resource allocation decisions',
      },
    };

    return (
      fallbackStrategies[coordinationType] || {
        strategy: 'Conservative implementation approach',
        approach: 'Proceed with known patterns and escalate unknown issues',
      }
    );
  }

  /**
   * Get current swarm state
   */
  public getState(): SwarmCommanderState {
    return { ...this.state };
  }

  /**
   * Load persistent neural learning data from memory system
   */
  private async loadPersistentLearning(): Promise<void> {
    try {
      const persistentData = await (this.memoryCoordinator as any).retrieve(
        `swarm_commander_learning_${this.swarmId}_${this.commanderType}`
      );

      if (persistentData) {
        // Restore agent performance history
        if (persistentData.agentHistory) {
          for (const [agentType, history] of Object.entries(
            persistentData.agentHistory
          )) {
            this.agentPerformanceHistory.set(
              agentType as AgentType,
              history as AgentPerformanceHistory
            );
          }
        }

        // Restore SPARC phase efficiency data
        if (persistentData.phaseEfficiency) {
          for (const [phase, metrics] of Object.entries(
            persistentData.phaseEfficiency
          )) {
            this.sparcPhaseEfficiency.set(
              phase as SPARCPhase,
              metrics as PhaseEfficiencyMetrics
            );
          }
        }

        // Restore successful implementation patterns
        if (persistentData.patterns) {
          for (const [patternId, pattern] of Object.entries(
            persistentData.patterns
          )) {
            this.implementationPatterns.set(
              patternId,
              pattern as SuccessfulPattern
            );
          }
        }

        this.logger.info('Loaded persistent neural learning data');
      }
    } catch (error) {
      this.logger.warn(`Failed to load persistent learning data: ${error}`);
    }
  }

  /**
   * Save neural learning data to persistent memory
   */
  private async savePersistentLearning(): Promise<void> {
    try {
      const learningData = {
        agentHistory: Object.fromEntries(this.agentPerformanceHistory),
        phaseEfficiency: Object.fromEntries(this.sparcPhaseEfficiency),
        patterns: Object.fromEntries(this.implementationPatterns),
        lastUpdated: new Date(),
      };

      await this.memoryCoordinator.store(
        `swarm_commander_learning_${this.swarmId}_${this.commanderType}`,
        learningData,
        {
          ttl: undefined,
          importance: 0.9, // High importance for learning data
          tags: ['neural', 'learning', 'swarm', 'sparc'],
        } as any
      );

      this.logger.debug('Saved persistent neural learning data');
    } catch (error) {
      this.logger.error(`Failed to save persistent learning data: ${error}`);
    }
  }

  /**
   * Update agent performance based on task completion
   */
  private async updateAgentPerformance(
    agentType: AgentType,
    taskId: string,
    quality: number,
    duration: number,
    success: boolean
  ): Promise<void> {
    let history = this.agentPerformanceHistory.get(agentType);

    if (!history) {
      history = {
        agentType,
        tasksCompleted: 0,
        averageQuality: 0,
        averageSpeed: 0,
        specializations: [],
        failurePatterns: [],
        successPatterns: [],
        lastUpdated: new Date(),
      };
    }

    // Update performance metrics using weighted average
    const weight = 0.8; // Give more weight to recent performance
    history.averageQuality =
      history.averageQuality * weight + quality * (1 - weight);
    history.averageSpeed =
      history.averageSpeed * weight + duration * (1 - weight);
    history.tasksCompleted++;
    history.lastUpdated = new Date();

    // Track success/failure patterns
    if (success) {
      const pattern = `${this.state.currentPhase}_success`;
      if (!history.successPatterns.includes(pattern)) {
        history.successPatterns.push(pattern);
      }
    } else {
      const pattern = `${this.state.currentPhase}_failure`;
      if (!history.failurePatterns.includes(pattern)) {
        history.failurePatterns.push(pattern);
      }
    }

    this.agentPerformanceHistory.set(agentType, history);
    await this.savePersistentLearning();
  }

  /**
   * Learn from SPARC phase completion
   */
  private async learnFromPhaseCompletion(
    phase: SPARCPhase,
    duration: number,
    success: boolean,
    bottlenecks: string[]
  ): Promise<void> {
    let metrics = this.sparcPhaseEfficiency.get(phase);

    if (!metrics) {
      metrics = {
        phase,
        averageDuration: duration,
        successRate: success ? 1 : 0,
        commonBottlenecks: [],
        bestPractices: [],
        optimalAgentCombinations: [],
      };
    } else {
      // Update with weighted average
      const weight = 0.7;
      metrics.averageDuration =
        metrics.averageDuration * weight + duration * (1 - weight);
      metrics.successRate =
        metrics.successRate * weight + (success ? 1 : 0) * (1 - weight);
    }

    // Learn from bottlenecks
    for (const bottleneck of bottlenecks) {
      if (!metrics.commonBottlenecks.includes(bottleneck)) {
        metrics.commonBottlenecks.push(bottleneck);
      }
    }

    this.sparcPhaseEfficiency.set(phase, metrics);
    await this.savePersistentLearning();
  }

  /**
   * TIER 1: Real-time learning from completed task
   */
  private async performRealTimeLearning(task: SwarmTask): Promise<void> {
    const learningIntensity = this.getLearningIntensity();

    this.logger.debug(
      `Performing real-time learning (intensity: ${learningIntensity}) for task: ${task.title}`
    );

    // Learn from each agent's performance in this task
    for (const agentType of task.assignedAgents) {
      await this.updateAgentPerformance(
        agentType,
        task.id,
        this.calculateTaskQuality(task),
        task.actualEffort || task.estimatedEffort,
        task.status === 'completed'
      );
    }

    // Learn from SPARC phase efficiency if SPARC was used
    if (task.sparcPhase && this.activeProject) {
      await this.learnFromPhaseCompletion(
        task.sparcPhase,
        task.actualEffort || task.estimatedEffort,
        task.status === 'completed',
        this.identifyBottlenecks(task)
      );
    }

    // Experimental learning mode - try new patterns
    if (
      this.config.learningConfig.experimentalPatterns &&
      learningIntensity > 0.7
    ) {
      await this.experimentWithNewPatterns(task);
    }

    // Update global performance metrics
    this.updateSwarmMetrics(task);
  }

  /**
   * Get learning intensity based on learning mode
   */
  private getLearningIntensity(): number {
    switch (this.config.learningMode) {
      case 'passive':
        return 0.3;
      case 'active':
        return 0.6;
      case 'aggressive':
        return 0.8;
      case 'experimental':
        return 1.0;
      default:
        return 0.5;
    }
  }

  /**
   * Calculate task quality score
   */
  private calculateTaskQuality(task: SwarmTask): number {
    // In real implementation, this would analyze code quality, test coverage, etc.
    const baseQuality = 0.85;
    const effortPenalty =
      task.actualEffort && task.actualEffort > task.estimatedEffort
        ? Math.max(
            0,
            0.1 -
              (task.actualEffort - task.estimatedEffort) / task.estimatedEffort
          )
        : 0;

    return Math.min(1.0, baseQuality + effortPenalty);
  }

  /**
   * Identify bottlenecks from task execution
   */
  private identifyBottlenecks(task: SwarmTask): string[] {
    const bottlenecks: string[] = [];

    if (task.actualEffort && task.actualEffort > task.estimatedEffort * 1.5) {
      bottlenecks.push('estimation_inaccuracy');
    }

    if (task.dependencies.length > 0) {
      bottlenecks.push('dependency_complexity');
    }

    return bottlenecks;
  }

  /**
   * Experiment with new implementation patterns
   */
  private async experimentWithNewPatterns(task: SwarmTask): Promise<void> {
    // Generate experimental pattern based on task characteristics
    const experimentalPattern: SuccessfulPattern = {
      patternId: `exp_${task.id}_${Date.now()}`,
      taskType: task.title.toLowerCase().includes('auth')
        ? 'authentication'
        : 'general',
      sparcApproach: 'experimental_sparc',
      agentConfiguration: task.assignedAgents,
      successRate: this.calculateTaskQuality(task),
      avgImplementationTime: task.actualEffort || task.estimatedEffort,
      qualityScore: this.state.metrics.qualityScore,
      reusable: this.state.metrics.qualityScore > 0.8,
    };

    this.implementationPatterns.set(
      experimentalPattern.patternId,
      experimentalPattern
    );
    this.logger.info(
      `Discovered experimental pattern: ${experimentalPattern.patternId}`
    );
  }

  /**
   * Update swarm-level metrics
   */
  private updateSwarmMetrics(task: SwarmTask): void {
    const weight = 0.8;
    this.state.metrics.sparcEfficiency =
      this.state.metrics.sparcEfficiency * weight +
      this.calculateTaskQuality(task) * (1 - weight);

    this.state.metrics.agentUtilization =
      task.assignedAgents.length / this.state.availableAgents.length;
  }

  /**
   * Get the best agents for a SPARC phase based on learning history
   */
  private getBestAgentsForPhase(phase: SPARCPhase): AgentType[] {
    const phaseMetrics = this.sparcPhaseEfficiency.get(phase);

    if (phaseMetrics?.optimalAgentCombinations.length > 0) {
      // Return the best learned combination
      return phaseMetrics.optimalAgentCombinations[0];
    }

    // Fall back to performance-based selection
    const availableAgents = Array.from(this.agentPerformanceHistory.entries())
      .filter(
        ([_, history]) =>
          history.successPatterns.includes(`${phase}_success`) &&
          this.state.availableAgents.includes(history.agentType)
      )
      .sort(([_, a], [__, b]) => b.averageQuality - a.averageQuality)
      .map(([agentType, _]) => agentType);

    return availableAgents.length > 0
      ? availableAgents
      : this.determineRequiredAgents(phase);
  }

  /**
   * Store shared FACT reference for coordination across all hierarchy levels.
   * This ensures universal access patterns are maintained.
   */
  private async storeSharedFACTReference(): Promise<void> {
    try {
      // Store shared FACT system reference in coordination memory
      await this.memoryCoordinator.store(
        'shared-fact-system-reference',
        {
          factSystemId: 'collective-fact-shared',
          accessLevel: 'universal',
          hierarchyLevels: [
            'Cubes',
            'Matrons',
            'Queens',
            'SwarmCommanders',
            'Agents',
          ],
          storageType: 'shared',
          initialized: true,
          timestamp: Date.now(),
        },
        {
          ttl: undefined,
          importance: 1.0,
          tags: ['shared-fact', 'universal-access', 'hierarchy-coordination'],
        } as any
      );

      this.logger.debug(
        'Stored shared FACT system reference for universal hierarchy access'
      );
    } catch (error) {
      this.logger.warn(`Failed to store shared FACT reference: ${error}`);
    }
  }

  /**
   * Get the shared CollectiveFACTSystem instance.
   * This ensures ALL hierarchy levels (Cubes, Matrons, Queens, SwarmCommanders, Agents)
   * access the SAME FACT database - no level-specific storage.
   */
  static async getSharedCollectiveFACT(): Promise<CollectiveFACTSystem> {
    let sharedFact = getCollectiveFACT();

    if (!sharedFact) {
      // Initialize the shared FACT system once for all hierarchy levels
      sharedFact = await initializeCollectiveFACT({
        enableCache: true,
        cacheSize: 50000, // Large cache for all hierarchy levels
        knowledgeSources: [
          'context7',
          'deepwiki',
          'gitmcp',
          'semgrep',
          'rust-fact-core',
        ],
        autoRefreshInterval: 1800000, // 30 minutes
      });
    }

    return sharedFact;
  }

  /**
   * Get conversation framework metrics and statistics.
   */
  public getConversationMetrics(): unknown {
    if (!this.conversationSystem) {
      return { error: 'Conversation system not initialized' };
    }

    const totalConversations = this.conversationHistory.size;
    const activeConversations = this.activeConversations.size;
    
    // Calculate conversation success rates
    const conversationResults = Array.from(this.conversationHistory.values());
    const successfulConversations = conversationResults.filter(
      result => result.decision === 'proceed' && result.confidence > 0.7
    ).length;
    
    const escalatedConversations = conversationResults.filter(
      result => result.decision === 'escalate'
    ).length;

    const averageConfidence = conversationResults.length > 0
      ? conversationResults.reduce((sum, result) => sum + result.confidence, 0) / conversationResults.length
      : 0;

    return {
      totalConversations,
      activeConversations,
      successfulConversations,
      escalatedConversations,
      successRate: totalConversations > 0 ? successfulConversations / totalConversations : 0,
      escalationRate: totalConversations > 0 ? escalatedConversations / totalConversations : 0,
      averageConfidence,
      conversationModeEnabled: this.config.conversationMode?.enabled || false,
      autoTriggerCriteria: this.config.conversationMode?.autoTriggerCriteria,
      supportedDomains: ['architecture', 'development', 'security', 'performance', 'operations'],
      supportedServices: {
        taskAssignment: this.config.conversationMode?.useForTaskAssignment || false,
        phaseTransitions: this.config.conversationMode?.useForPhaseTransitions || false,
        technicalConsultations: this.config.conversationMode?.useForTechnicalConsultations || false,
        architectureReviews: this.config.conversationMode?.useForArchitectureReviews || false,
      },
      lastConversationTimestamp: conversationResults.length > 0 
        ? Math.max(...conversationResults.map(r => r.timestamp.getTime()))
        : null,
    };
  }

  /**
   * Clear conversation history and reset metrics.
   */
  public async clearConversationHistory(): Promise<void> {
    this.conversationHistory.clear();
    
    // Terminate any active conversations
    for (const [taskId, session] of this.activeConversations.entries()) {
      try {
        if (this.conversationSystem) {
          await this.conversationSystem.orchestrator.terminateConversation(session.id);
        }
      } catch (error) {
        this.logger.warn(`Failed to terminate conversation for task ${taskId}: ${error}`);
      }
    }
    
    this.activeConversations.clear();
    this.logger.info('Conversation history cleared and active conversations terminated');
  }

  /**
   * Update conversation framework configuration.
   */
  public updateConversationConfig(updates: Partial<SwarmCommanderConfig['conversationMode']>): void {
    if (this.config.conversationMode) {
      this.config.conversationMode = {
        ...this.config.conversationMode,
        ...updates,
      };
      this.logger.info('Conversation framework configuration updated');
    }
  }

  /**
   * Test conversation framework connectivity and functionality.
   */
  public async testConversationFramework(): Promise<unknown> {
    if (!this.conversationSystem) {
      return { 
        status: 'error', 
        message: 'Conversation system not initialized',
        domains: [],
        services: []
      };
    }

    try {
      // Test basic conversation creation
      const testConfig: ConversationConfig = {
        title: 'Framework Test',
        description: 'Testing conversation framework connectivity',
        pattern: 'testing',
        context: {
          goal: 'Verify framework functionality',
          constraints: ['Test environment'],
          resources: [`Swarm: ${this.swarmId}`],
          domain: 'testing',
          expertise: ['testing'],
        },
        initialParticipants: [{ 
          id: `coordinator_${this.swarmId}`, 
          type: 'coordinator' as any, 
          swarmId: this.swarmId 
        }],
        timeout: 5000, // Short timeout for test
      };

      const testSession = await this.conversationSystem.orchestrator.createConversation(testConfig);
      
      // Immediately terminate test conversation
      await this.conversationSystem.orchestrator.terminateConversation(testSession.id);

      return {
        status: 'success',
        message: 'Conversation framework is operational',
        domains: ['architecture', 'development', 'security', 'performance', 'operations'],
        services: {
          taskAssignment: this.config.conversationMode?.useForTaskAssignment || false,
          phaseTransitions: this.config.conversationMode?.useForPhaseTransitions || false,
          technicalConsultations: this.config.conversationMode?.useForTechnicalConsultations || false,
          architectureReviews: this.config.conversationMode?.useForArchitectureReviews || false,
        },
        testSessionId: testSession.id,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Conversation framework test failed: ${error}`,
        domains: [],
        services: {},
        error: error.toString(),
      };
    }
  }

  /**
   * Shutdown swarm commander with neural learning persistence and conversation cleanup
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down Swarm Commander');

    // Clean up conversation framework
    if (this.conversationSystem) {
      try {
        await this.clearConversationHistory();
        this.logger.info('Conversation framework cleaned up');
      } catch (error) {
        this.logger.warn(`Error during conversation framework cleanup: ${error}`);
      }
    }

    // Save final learning data
    await this.savePersistentLearning();

    this.state.status = 'idle';
    this.removeAllListeners();

    this.logger.info(
      'Swarm Commander shutdown complete - neural learning preserved, conversations cleaned up'
    );
  }
}
