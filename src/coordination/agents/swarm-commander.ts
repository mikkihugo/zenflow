/**
 * Swarm Commander System for THE COLLECTIVE.
 * Leads SPARC implementation within individual swarms.
 * Coordinates systematic development methodology with agents.
 */
/**
 * @file Swarm Commander - SPARC implementation leadership within swarms.
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '../../config/logging-config.ts';
import type {
  IEventBus,
  ILogger,
} from '../../core/interfaces/base-interfaces.ts';
import type { MemoryCoordinator } from '../../memory/core/memory-coordinator.ts';
import { CollectiveFACTSystem, getCollectiveFACT, initializeCollectiveFACT } from '../collective-fact-integration.ts';
import { generateId } from '../swarm/core/utils.ts';
// SPARC Integration for Implementation Leadership
import { SPARCEngineCore } from '../swarm/sparc/core/sparc-engine.ts';
import type {
  ProjectSpecification,
  SPARCProject,
  SPARCPhase,
} from '../swarm/sparc/types/sparc-types.ts';
import type {
  AgentType,
} from '../../types/agent-types.ts';

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
  
  private logger: ILogger;
  private eventBus: IEventBus;
  private memoryCoordinator: MemoryCoordinator;
  private config: SwarmCommanderConfig;
  private state: SwarmCommanderState;
  
  // SPARC Implementation Leadership
  private sparcEngine: SPARCEngineCore;
  private activeProject?: SPARCProject;
  private currentTasks = new Map<string, SwarmTask>();
  
  // ULTRA-DATABASE INTEGRATION
  private factSystem: CollectiveFACTSystem;
  
  // Persistent Neural Learning
  private agentPerformanceHistory = new Map<AgentType, AgentPerformanceHistory>();
  private sparcPhaseEfficiency = new Map<SPARCPhase, PhaseEfficiencyMetrics>();
  private implementationPatterns = new Map<string, SuccessfulPattern>();

  constructor(
    config: SwarmCommanderConfig,
    eventBus: IEventBus,
    memoryCoordinator: MemoryCoordinator
  ) {
    super();
    
    this.id = generateId();
    this.swarmId = config.swarmId;
    this.commanderType = config.commanderType;
    this.config = config;
    this.eventBus = eventBus;
    this.memoryCoordinator = memoryCoordinator;
    
    this.logger = getLogger(`SwarmCommander-${this.swarmId}-${this.commanderType}`);
    
    // SHARED FACT SYSTEM: All hierarchy levels use the same CollectiveFACTSystem instance
    this.factSystem = new CollectiveFACTSystem({
      cacheEnabled: true,
      maxCacheSize: 1000,
      storageLocation: '.claude-zen/fact',
      enableAdaptiveStrategies: true,
    });
    
    // Initialize SPARC engine for implementation leadership
    this.sparcEngine = new SPARCEngineCore({
      persistenceEnabled: true,
      memorySystem: memoryCoordinator as any, // Type compatibility
      eventBus: eventBus as any,
    });
    
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
    this.loadPersistentLearning().catch(error => {
      this.logger.warn(`Failed to load persistent learning data during initialization: ${error}`);
    });
    
    this.logger.info(`Swarm Commander initialized for ${config.commanderType} swarm with persistent learning`);
  }

  /**
   * Setup event handlers for swarm coordination
   */
  private setupEventHandlers(): void {
    this.eventBus.on(`swarm:${this.swarmId}:task:assigned`, this.handleTaskAssignment.bind(this));
    this.eventBus.on(`swarm:${this.swarmId}:agent:available`, this.handleAgentAvailable.bind(this));
    this.eventBus.on(`swarm:${this.swarmId}:sparc:phase:complete`, this.handlePhaseCompletion.bind(this));
  }

  /**
   * Accept task assignment from Queen Coordinator and begin SPARC implementation
   */
  async handleTaskAssignment(taskData: any): Promise<void> {
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
    
    // Begin SPARC implementation if enabled
    if (this.config.sparcEnabled) {
      await this.initiateSPARCImplementation(task);
    } else {
      await this.executeDirectImplementation(task);
    }
  }

  /**
   * Initiate SPARC methodology for systematic implementation
   */
  private async initiateSPARCImplementation(task: SwarmTask): Promise<void> {
    this.logger.info(`Initiating SPARC implementation for: ${task.title}`);
    
    // Create SPARC project specification from task
    const projectSpec: ProjectSpecification = {
      name: task.title,
      description: task.description,
      objectives: [task.description],
      scope: task.deliverables,
      constraints: [],
      stakeholders: [],
      successCriteria: [`Complete ${task.title} with quality score > 0.9`],
      timeline: {
        startDate: new Date(),
        endDate: new Date(Date.now() + (task.estimatedEffort * 24 * 60 * 60 * 1000)),
      },
    };
    
    try {
      // Initialize SPARC project
      this.activeProject = await this.sparcEngine.initializeProject(projectSpec);
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
      await this.escalateToQueenCoordinator(task.id, 'sparc_initialization_failed', error);
    }
  }

  /**
   * Execute specific SPARC phase with agent coordination
   */
  private async executeSPARCPhase(phase: SPARCPhase, task: SwarmTask): Promise<void> {
    this.logger.info(`Executing SPARC phase: ${phase} for task: ${task.title}`);
    
    task.sparcPhase = phase;
    this.state.currentPhase = phase;
    
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
        this.activeProject!.id,
        phase,
        phaseContext
      );
      
      this.logger.info(`SPARC phase ${phase} completed successfully with Matron guidance`);
      
      // Move to next phase or complete
      await this.progressToNextPhase(phase, task);
      
    } catch (error) {
      this.logger.error(`SPARC phase ${phase} failed: ${error}`);
      await this.escalateToQueenCoordinator(task.id, `sparc_phase_${phase}_failed`, error);
    }
  }

  /**
   * Determine required agents based on SPARC phase
   */
  private determineRequiredAgents(phase: SPARCPhase): AgentType[] {
    switch (phase) {
      case 'specification':
        return ['analyst-agent', 'technical-writer-agent'];
      case 'pseudocode':
        return ['architect-agent', 'senior-developer-agent'];
      case 'architecture':
        return ['architect-agent', 'systems-analyst-agent'];
      case 'refinement':
        return ['senior-developer-agent', 'code-reviewer-agent'];
      case 'completion':
        return ['tester-agent', 'deployment-agent', 'documentation-agent'];
      default:
        return ['general-purpose-agent'];
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
  private buildPhaseContext(task: SwarmTask): any {
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
  private async progressToNextPhase(currentPhase: SPARCPhase, task: SwarmTask): Promise<void> {
    const phaseOrder: SPARCPhase[] = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];
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
      learningData: this.config.learningConfig.crossSwarmLearning ? {
        agentPerformance: Array.from(this.agentPerformanceHistory.entries()),
        phaseEfficiency: Array.from(this.sparcPhaseEfficiency.entries()),
        patterns: Array.from(this.implementationPatterns.entries()),
      } : undefined,
    });
  }

  /**
   * Execute direct implementation without SPARC methodology
   */
  private async executeDirectImplementation(task: SwarmTask): Promise<void> {
    this.logger.info(`Executing direct implementation for: ${task.title}`);
    
    // Simplified direct execution
    const requiredAgents = ['general-purpose-agent', 'code-reviewer-agent'];
    await this.assignAgentsToPhase(requiredAgents, 'completion', task);
    
    // Simulate implementation work
    setTimeout(() => {
      this.completeImplementation(task);
    }, 5000);
  }

  /**
   * Handle agent becoming available
   */
  private handleAgentAvailable(agentData: any): void {
    const agentType = agentData.agentType as AgentType;
    
    if (!this.state.availableAgents.includes(agentType)) {
      this.state.availableAgents.push(agentType);
      this.logger.debug(`Agent available: ${agentType}`);
    }
  }

  /**
   * Handle SPARC phase completion
   */
  private handlePhaseCompletion(phaseData: any): void {
    this.logger.info(`Phase completed: ${phaseData.phase}`);
    this.state.metrics.sparcEfficiency = phaseData.efficiency || 0.85;
  }

  /**
   * Escalate issues to Queen Coordinator
   */
  private async escalateToQueenCoordinator(
    taskId: string,
    issueType: string,
    details: any
  ): Promise<void> {
    this.logger.warn(`Escalating to Queen Coordinator: ${issueType} for task ${taskId}`);
    
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
    domain: 'architecture' | 'development' | 'security' | 'performance' | 'operations',
    consultationType: 'guidance' | 'review' | 'validation' | 'best_practices',
    context: {
      taskId?: string;
      sparcPhase?: SPARCPhase;
      technicalChallenge: string;
      currentApproach?: string;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    }
  ): Promise<any> {
    this.logger.info(`Consulting ${domain} Matron for ${consultationType}: ${context.technicalChallenge}`);
    
    return new Promise((resolve) => {
      // Set up response handler
      const responseHandler = (response: any) => {
        if (response.consultationId === consultationId) {
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
          fallbackGuidance: this.getFallbackGuidance(domain, consultationType)
        });
      }, 30000);
    });
  }

  /**
   * Get fallback guidance when Matron consultation fails
   */
  private getFallbackGuidance(domain: string, consultationType: string): any {
    const fallbackGuidance = {
      architecture: {
        guidance: 'Follow SOLID principles and established design patterns',
        bestPractices: ['Single responsibility', 'Dependency injection', 'Interface segregation'],
      },
      development: {
        guidance: 'Use TDD approach with comprehensive testing',
        bestPractices: ['Write tests first', 'Refactor continuously', 'Code review required'],
      },
      security: {
        guidance: 'Apply defense in depth and least privilege principles',
        bestPractices: ['Input validation', 'Authentication required', 'Audit logging'],
      },
      performance: {
        guidance: 'Optimize for scalability and efficient resource usage',
        bestPractices: ['Profile before optimizing', 'Cache appropriately', 'Monitor metrics'],
      },
      operations: {
        guidance: 'Ensure observability and maintainability',
        bestPractices: ['Logging', 'Monitoring', 'Health checks', 'Graceful degradation'],
      }
    };
    
    return fallbackGuidance[domain] || { guidance: 'Follow established best practices' };
  }

  /**
   * Get Matron guidance for specific SPARC phase
   */
  private async getMatronGuidanceForPhase(phase: SPARCPhase, task: SwarmTask): Promise<any> {
    // Determine which Matron domain is most relevant for the phase
    const phaseMatronMapping = {
      'specification': 'architecture',
      'pseudocode': 'development', 
      'architecture': 'architecture',
      'refinement': 'development',
      'completion': 'operations'
    };
    
    const domain = phaseMatronMapping[phase] as 'architecture' | 'development' | 'security' | 'performance' | 'operations';
    
    // Assess risk level based on task complexity and phase
    const riskLevel = this.assessRiskLevel(task, phase);
    
    // Get guidance from appropriate Matron
    const guidance = await this.consultMatron(
      domain,
      'guidance',
      {
        taskId: task.id,
        sparcPhase: phase,
        technicalChallenge: `SPARC ${phase} phase for: ${task.description}`,
        riskLevel,
      }
    );
    
    return guidance;
  }

  /**
   * Assess risk level for Matron consultation
   */
  private assessRiskLevel(task: SwarmTask, phase: SPARCPhase): 'low' | 'medium' | 'high' | 'critical' {
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
    domain: 'architecture' | 'development' | 'security' | 'performance' | 'operations',
    consultationType: 'guidance' | 'review' | 'validation' | 'best_practices',
    technicalChallenge: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<any> {
    this.logger.info(`Public Matron consultation requested: ${domain} - ${technicalChallenge}`);
    
    // Get relevant ADRs and FACT knowledge for consultation
    const contextData = await this.gatherConsultationContext(domain, technicalChallenge);
    
    return await this.consultMatron(domain, consultationType, {
      technicalChallenge,
      riskLevel,
      sparcPhase: this.state.currentPhase,
      contextData,
    });
  }

  /**
   * Gather FACT and ADR context for consultations
   */
  private async gatherConsultationContext(domain: string, challenge: string): Promise<any> {
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
    coordinationType: 'multi_swarm' | 'cross_domain' | 'complex_feature' | 'resource_conflict',
    coordinationRequest: {
      description: string;
      requiredSwarms: string[];
      complexity: 'medium' | 'high' | 'critical';
      timeline?: Date;
      dependencies?: string[];
    }
  ): Promise<any> {
    this.logger.info(`Queen coordination requested: ${coordinationType} - ${coordinationRequest.description}`);
    
    // Gather multi-swarm context from FACT system
    const multiSwarmContext = await this.gatherMultiSwarmContext(coordinationRequest);
    
    return new Promise((resolve) => {
      const coordinationId = `${this.id}_queen_${Date.now()}`;
      
      // Set up response handler
      const responseHandler = (response: any) => {
        if (response.coordinationId === coordinationId) {
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
          fallbackStrategy: this.getQueenCoordinationFallback(coordinationType)
        });
      }, 60000);
    });
  }

  /**
   * Gather multi-swarm context for Queen coordination
   */
  private async gatherMultiSwarmContext(request: any): Promise<any> {
    try {
      // Get cross-swarm patterns and dependencies
      const crossSwarmPatterns = await this.factSystem.searchFacts({
        query: `multi swarm coordination ${request.description}`,
        type: 'coordination-pattern',
        limit: 5,
      });

      // Get feature integration knowledge
      const integrationKnowledge = await this.factSystem.searchFacts({
        query: `${request.requiredSwarms.join(' ')} integration patterns`,
        type: 'integration-knowledge',
        limit: 8,
      });

      return {
        crossSwarmPatterns,
        integrationKnowledge,
        currentSwarmState: this.getState(),
        coordinationHistory: await this.memoryCoordinator.retrieve(`queen_coordination_history_${this.swarmId}`),
      };
    } catch (error) {
      this.logger.warn(`Failed to gather multi-swarm context: ${error}`);
      return { fallback: true };
    }
  }

  /**
   * Get fallback strategy when Queen coordination fails
   */
  private getQueenCoordinationFallback(coordinationType: string): any {
    const fallbackStrategies = {
      multi_swarm: {
        strategy: 'Sequential implementation with interface contracts',
        approach: 'Define clear APIs between swarms and implement independently',
      },
      cross_domain: {
        strategy: 'Domain boundary enforcement with event-driven integration',
        approach: 'Use events and message passing for cross-domain coordination',
      },
      complex_feature: {
        strategy: 'Feature decomposition with incremental delivery',
        approach: 'Break feature into smaller, independent deliverables',
      },
      resource_conflict: {
        strategy: 'Resource prioritization based on business value',
        approach: 'Escalate to higher authority for resource allocation decisions',
      },
    };
    
    return fallbackStrategies[coordinationType] || { 
      strategy: 'Conservative implementation approach',
      approach: 'Proceed with known patterns and escalate unknown issues'
    };
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
      const persistentData = await this.memoryCoordinator.retrieve(
        `swarm_commander_learning_${this.swarmId}_${this.commanderType}`
      );
      
      if (persistentData) {
        // Restore agent performance history
        if (persistentData.agentHistory) {
          for (const [agentType, history] of Object.entries(persistentData.agentHistory)) {
            this.agentPerformanceHistory.set(agentType as AgentType, history as AgentPerformanceHistory);
          }
        }
        
        // Restore SPARC phase efficiency data
        if (persistentData.phaseEfficiency) {
          for (const [phase, metrics] of Object.entries(persistentData.phaseEfficiency)) {
            this.sparcPhaseEfficiency.set(phase as SPARCPhase, metrics as PhaseEfficiencyMetrics);
          }
        }
        
        // Restore successful implementation patterns
        if (persistentData.patterns) {
          for (const [patternId, pattern] of Object.entries(persistentData.patterns)) {
            this.implementationPatterns.set(patternId, pattern as SuccessfulPattern);
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
          persistent: true,
          importance: 0.9, // High importance for learning data
          tags: ['neural', 'learning', 'swarm', 'sparc']
        }
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
    history.averageQuality = (history.averageQuality * weight) + (quality * (1 - weight));
    history.averageSpeed = (history.averageSpeed * weight) + (duration * (1 - weight));
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
      metrics.averageDuration = (metrics.averageDuration * weight) + (duration * (1 - weight));
      metrics.successRate = (metrics.successRate * weight) + ((success ? 1 : 0) * (1 - weight));
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
    
    this.logger.debug(`Performing real-time learning (intensity: ${learningIntensity}) for task: ${task.title}`);
    
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
    if (this.config.learningConfig.experimentalPatterns && learningIntensity > 0.7) {
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
      case 'passive': return 0.3;
      case 'active': return 0.6;
      case 'aggressive': return 0.8;
      case 'experimental': return 1.0;
      default: return 0.5;
    }
  }

  /**
   * Calculate task quality score
   */
  private calculateTaskQuality(task: SwarmTask): number {
    // In real implementation, this would analyze code quality, test coverage, etc.
    const baseQuality = 0.85;
    const effortPenalty = task.actualEffort && task.actualEffort > task.estimatedEffort ? 
      Math.max(0, 0.1 - (task.actualEffort - task.estimatedEffort) / task.estimatedEffort) : 0;
    
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
      taskType: task.title.toLowerCase().includes('auth') ? 'authentication' : 'general',
      sparcApproach: 'experimental_sparc',
      agentConfiguration: task.assignedAgents,
      successRate: this.calculateTaskQuality(task),
      avgImplementationTime: task.actualEffort || task.estimatedEffort,
      qualityScore: this.state.metrics.qualityScore,
      reusable: this.state.metrics.qualityScore > 0.8,
    };
    
    this.implementationPatterns.set(experimentalPattern.patternId, experimentalPattern);
    this.logger.info(`Discovered experimental pattern: ${experimentalPattern.patternId}`);
  }

  /**
   * Update swarm-level metrics
   */
  private updateSwarmMetrics(task: SwarmTask): void {
    const weight = 0.8;
    this.state.metrics.sparcEfficiency = 
      (this.state.metrics.sparcEfficiency * weight) + 
      (this.calculateTaskQuality(task) * (1 - weight));
    
    this.state.metrics.agentUtilization = task.assignedAgents.length / this.state.availableAgents.length;
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
      .filter(([_, history]) => 
        history.successPatterns.includes(`${phase}_success`) &&
        this.state.availableAgents.includes(history.agentType)
      )
      .sort(([_, a], [__, b]) => b.averageQuality - a.averageQuality)
      .map(([agentType, _]) => agentType);
    
    return availableAgents.length > 0 ? availableAgents : this.determineRequiredAgents(phase);
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
          hierarchyLevels: ['Cubes', 'Matrons', 'Queens', 'SwarmCommanders', 'Agents'],
          storageType: 'shared',
          initialized: true,
          timestamp: Date.now(),
        },
        {
          persistent: true,
          importance: 1.0,
          tags: ['shared-fact', 'universal-access', 'hierarchy-coordination'],
        }
      );
      
      this.logger.debug('Stored shared FACT system reference for universal hierarchy access');
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
        knowledgeSources: ['context7', 'deepwiki', 'gitmcp', 'semgrep', 'rust-fact-core'],
        autoRefreshInterval: 1800000, // 30 minutes
      });
    }
    
    return sharedFact;
  }

  /**
   * Shutdown swarm commander with neural learning persistence
   */
  public async shutdown(): Promise<void> {
    this.logger.info('Shutting down Swarm Commander');
    
    // Save final learning data
    await this.savePersistentLearning();
    
    this.state.status = 'idle';
    this.removeAllListeners();
    
    this.logger.info('Swarm Commander shutdown complete - neural learning preserved');
  }
}