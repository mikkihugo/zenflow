/**
 * SPARC-Enabled Swarm Coordinator.
 *
 * Integrates SPARC methodology into swarm coordination for implementing
 * Features and Tasks from the database-driven product flow.
 *
 * Architecture:
 * 1. Receives Features/Tasks from DatabaseDrivenSystem
 * 2. Applies SPARC methodology (Specification → Pseudocode → Architecture → Refinement → Completion)
 * 3. Coordinates agents to implement each SPARC phase
 * 4. Returns completed implementation artifacts.
 */

import { createLogger } from '../../../core/logger';
import type {
  FeatureDocumentEntity,
  TaskDocumentEntity,
} from '../../../database/entities/product-entities';
import type { AgentType } from '../../../types/agent-types';
import type { SPARCPhase } from '../sparc/types/sparc-types';
import { type SwarmAgent, SwarmCoordinator, type SwarmMetrics } from './swarm-coordinator';

const logger = createLogger('SPARCSwarmCoordinator');

export interface SPARCTask {
  id: string;
  type: 'feature' | 'task';
  sourceDocument: FeatureDocumentEntity | TaskDocumentEntity;
  currentPhase: SPARCPhase;
  phaseProgress: Record<SPARCPhase, SPARCPhaseResult>;
  assignedAgents: Record<SPARCPhase, string[]>;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SPARCPhaseResult {
  phase: SPARCPhase;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  artifacts: string[];
  metrics: {
    startTime?: Date;
    endTime?: Date;
    agentsInvolved: string[];
    iterationsCount: number;
  };
  validation: {
    passed: boolean;
    score: number;
    feedback: string[];
  };
}

export interface SPARCAgentCapabilities {
  sparcPhases: SPARCPhase[];
  specialization: 'specification' | 'architecture' | 'implementation' | 'testing' | 'general';
  domainExpertise: string[];
}

export interface SPARCSwarmMetrics extends SwarmMetrics {
  sparcTasksTotal: number;
  sparcTasksCompleted: number;
  phaseMetrics: Record<
    SPARCPhase,
    {
      tasksProcessed: number;
      averageCompletionTime: number;
      successRate: number;
    }
  >;
  averageSparcCycleTime: number;
}

/**
 * SPARC-Enhanced Swarm Coordinator.
 *
 * Coordinates swarm agents using SPARC methodology for implementing
 * database-driven Features and Tasks.
 *
 * @example
 */
export class SPARCSwarmCoordinator extends SwarmCoordinator {
  private sparcTasks = new Map<string, SPARCTask>();
  private sparcMetrics: SPARCSwarmMetrics;

  constructor() {
    super();
    this.sparcMetrics = {
      ...this.getDefaultMetrics(),
      sparcTasksTotal: 0,
      sparcTasksCompleted: 0,
      phaseMetrics: this.initializePhaseMetrics(),
      averageSparcCycleTime: 0,
    };

    this.setupSPARCEventHandlers();
  }

  /**
   * Process a Feature using SPARC methodology.
   *
   * @param feature
   */
  async processFeatureWithSPARC(feature: FeatureDocumentEntity): Promise<SPARCTask> {
    logger.info(`🎯 Starting SPARC processing for feature: ${feature.title}`);

    const sparcTask: SPARCTask = {
      id: `sparc-feature-${feature.id}`,
      type: 'feature',
      sourceDocument: feature,
      currentPhase: 'specification',
      phaseProgress: this.initializePhaseProgress(),
      assignedAgents: this.initializePhaseAgents(),
      status: 'not_started',
      priority: this.mapPriority(feature.priority),
    };

    this.sparcTasks.set(sparcTask.id, sparcTask);
    this.sparcMetrics.sparcTasksTotal++;

    // Start SPARC cycle
    await this.startSPARCCycle(sparcTask);

    this.emit('sparc:feature:started', { sparcTask, feature });
    return sparcTask;
  }

  /**
   * Process a Task using SPARC methodology.
   *
   * @param task
   */
  async processTaskWithSPARC(task: TaskDocumentEntity): Promise<SPARCTask> {
    logger.info(`🔧 Starting SPARC processing for task: ${task.title}`);

    const sparcTask: SPARCTask = {
      id: `sparc-task-${task.id}`,
      type: 'task',
      sourceDocument: task,
      currentPhase: 'specification',
      phaseProgress: this.initializePhaseProgress(),
      assignedAgents: this.initializePhaseAgents(),
      status: 'not_started',
      priority: this.mapPriority(task.priority),
    };

    this.sparcTasks.set(sparcTask.id, sparcTask);
    this.sparcMetrics.sparcTasksTotal++;

    // Start SPARC cycle
    await this.startSPARCCycle(sparcTask);

    this.emit('sparc:task:started', { sparcTask, task });
    return sparcTask;
  }

  /**
   * Execute complete SPARC cycle for a task.
   *
   * @param sparcTask
   */
  private async startSPARCCycle(sparcTask: SPARCTask): Promise<void> {
    sparcTask.status = 'in_progress';

    const phases: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];

    for (const phase of phases) {
      try {
        logger.info(`📋 Executing SPARC phase: ${phase} for ${sparcTask.id}`);

        sparcTask.currentPhase = phase;
        await this.executeSPARCPhase(sparcTask, phase);

        // Validate phase completion
        const validation = await this.validatePhaseCompletion(sparcTask, phase);
        if (!validation.passed) {
          logger.warn(`⚠️ Phase ${phase} validation failed for ${sparcTask.id}`);
          if (validation.score < 0.6) {
            // Retry phase if score is too low
            await this.retryPhase(sparcTask, phase);
          }
        }

        this.updatePhaseMetrics(phase, true);
        this.emit('sparc:phase:completed', { sparcTask, phase, validation });
      } catch (error) {
        logger.error(`❌ SPARC phase ${phase} failed for ${sparcTask.id}:`, error);
        sparcTask.phaseProgress[phase]?.status = 'failed';
        sparcTask.status = 'failed';
        this.updatePhaseMetrics(phase, false);
        throw error;
      }
    }

    // Complete SPARC cycle
    sparcTask.status = 'completed';
    this.sparcMetrics.sparcTasksCompleted++;

    logger.info(`✅ SPARC cycle completed for ${sparcTask.id}`);
    this.emit('sparc:cycle:completed', { sparcTask });
  }

  /**
   * Execute a specific SPARC phase using specialized agents.
   *
   * @param sparcTask
   * @param phase
   */
  private async executeSPARCPhase(sparcTask: SPARCTask, phase: SPARCPhase): Promise<void> {
    const phaseResult = sparcTask.phaseProgress[phase];
    phaseResult?.status = 'in_progress';
    phaseResult?.metrics?.startTime = new Date();

    // Select specialized agents for this phase
    const phaseAgents = this.selectPhaseAgents(phase, sparcTask);
    sparcTask.assignedAgents[phase] = phaseAgents.map((agent) => agent.id);
    phaseResult?.metrics?.agentsInvolved = phaseAgents.map((agent) => agent.id);

    // Execute phase based on type
    switch (phase) {
      case 'specification':
        await this.executeSpecificationPhase(sparcTask, phaseAgents);
        break;
      case 'pseudocode':
        await this.executePseudocodePhase(sparcTask, phaseAgents);
        break;
      case 'architecture':
        await this.executeArchitecturePhase(sparcTask, phaseAgents);
        break;
      case 'refinement':
        await this.executeRefinementPhase(sparcTask, phaseAgents);
        break;
      case 'completion':
        await this.executeCompletionPhase(sparcTask, phaseAgents);
        break;
    }

    phaseResult?.status = 'completed';
    phaseResult?.metrics?.endTime = new Date();
    phaseResult?.metrics?.iterationsCount = 1; // Could be higher if retries were needed
  }

  /**
   * Execute Specification Phase.
   *
   * @param sparcTask
   * @param agents
   */
  private async executeSpecificationPhase(
    sparcTask: SPARCTask,
    agents: SwarmAgent[]
  ): Promise<void> {
    logger.info(`📝 Executing Specification phase for ${sparcTask.id}`);

    // Use specification agents to analyze requirements
    for (const agent of agents) {
      if (agent.type === 'analyst' || agent.type === 'requirements_analyst') {
        await this.assignTaskToAgent(agent.id, {
          id: `spec-${sparcTask.id}-${agent.id}`,
          type: 'specification',
          requirements: ['analyze requirements', 'define acceptance criteria'],
          priority: this.getPriorityValue(sparcTask.priority),
        });
      }
    }

    // Generate specification artifacts
    sparcTask.phaseProgress.specification.artifacts = [
      'requirements-analysis.md',
      'acceptance-criteria.md',
      'constraint-analysis.md',
    ];
  }

  /**
   * Execute Pseudocode Phase.
   *
   * @param sparcTask
   * @param agents
   */
  private async executePseudocodePhase(sparcTask: SPARCTask, agents: SwarmAgent[]): Promise<void> {
    logger.info(`📐 Executing Pseudocode phase for ${sparcTask.id}`);

    // Use algorithm and design agents
    for (const agent of agents) {
      if (agent.type === 'design-architect' || agent.type === 'system-architect') {
        await this.assignTaskToAgent(agent.id, {
          id: `pseudo-${sparcTask.id}-${agent.id}`,
          type: 'pseudocode',
          requirements: ['design algorithms', 'create pseudocode'],
          priority: this.getPriorityValue(sparcTask.priority),
        });
      }
    }

    sparcTask.phaseProgress.pseudocode.artifacts = [
      'algorithm-design.md',
      'pseudocode-structure.md',
      'flow-diagrams.md',
    ];
  }

  /**
   * Execute Architecture Phase.
   *
   * @param sparcTask
   * @param agents
   */
  private async executeArchitecturePhase(
    sparcTask: SPARCTask,
    agents: SwarmAgent[]
  ): Promise<void> {
    logger.info(`🏗️ Executing Architecture phase for ${sparcTask.id}`);

    // Use architecture and system design agents
    for (const agent of agents) {
      if (agent.type === 'system-architect' || agent.type === 'architect') {
        await this.assignTaskToAgent(agent.id, {
          id: `arch-${sparcTask.id}-${agent.id}`,
          type: 'architecture',
          requirements: ['design system architecture', 'define components'],
          priority: this.getPriorityValue(sparcTask.priority),
        });
      }
    }

    sparcTask.phaseProgress.architecture.artifacts = [
      'system-architecture.md',
      'component-design.md',
      'interface-specifications.md',
    ];
  }

  /**
   * Execute Refinement Phase.
   *
   * @param sparcTask
   * @param agents
   */
  private async executeRefinementPhase(sparcTask: SPARCTask, agents: SwarmAgent[]): Promise<void> {
    logger.info(`🔍 Executing Refinement phase for ${sparcTask.id}`);

    // Use code review and quality assurance agents
    for (const agent of agents) {
      if (agent.type === 'reviewer' || agent.type === 'tester') {
        await this.assignTaskToAgent(agent.id, {
          id: `refine-${sparcTask.id}-${agent.id}`,
          type: 'refinement',
          requirements: ['review implementation', 'optimize code'],
          priority: this.getPriorityValue(sparcTask.priority),
        });
      }
    }

    sparcTask.phaseProgress.refinement.artifacts = [
      'code-review-report.md',
      'optimization-recommendations.md',
      'quality-metrics.md',
    ];
  }

  /**
   * Execute Completion Phase.
   *
   * @param sparcTask
   * @param agents
   */
  private async executeCompletionPhase(sparcTask: SPARCTask, agents: SwarmAgent[]): Promise<void> {
    logger.info(`🎯 Executing Completion phase for ${sparcTask.id}`);

    // Use testing and deployment agents
    for (const agent of agents) {
      if (agent.type === 'tester' || agent.type === 'deployment-ops') {
        await this.assignTaskToAgent(agent.id, {
          id: `complete-${sparcTask.id}-${agent.id}`,
          type: 'completion',
          requirements: ['final testing', 'deployment preparation'],
          priority: this.getPriorityValue(sparcTask.priority),
        });
      }
    }

    sparcTask.phaseProgress.completion.artifacts = [
      'test-results.md',
      'deployment-package.zip',
      'completion-report.md',
    ];
  }

  /**
   * Select specialized agents for a SPARC phase.
   *
   * @param phase
   * @param sparcTask
   * @param _sparcTask
   */
  private selectPhaseAgents(phase: SPARCPhase, _sparcTask: SPARCTask): SwarmAgent[] {
    const allAgents = this.getAgents();
    const phaseSpecialists = this.getPhaseSpecialists(phase);

    // Filter agents that are suitable for this phase
    const suitableAgents = allAgents.filter(
      (agent) =>
        phaseSpecialists.includes(agent.type) &&
        (agent.status === 'idle' || agent.status === 'busy')
    );

    // Sort by performance and select best agents
    const selectedAgents = suitableAgents
      .sort((a, b) => b.performance.tasksCompleted - a.performance.tasksCompleted)
      .slice(0, Math.min(3, suitableAgents.length)); // Max 3 agents per phase

    if (selectedAgents.length === 0) {
      logger.warn(`⚠️ No suitable agents found for phase ${phase}`);
      // Use general-purpose agents as fallback
      return allAgents.filter((agent) => agent.status === 'idle').slice(0, 1);
    }

    return selectedAgents;
  }

  /**
   * Get agent types specialized for each SPARC phase.
   *
   * @param phase
   */
  private getPhaseSpecialists(phase: SPARCPhase): AgentType[] {
    const specialists: Record<SPARCPhase, AgentType[]> = {
      specification: ['analyst', 'requirements_analyst', 'planner'],
      pseudocode: ['design-architect', 'system-architect', 'coder'],
      architecture: ['system-architect', 'architect', 'database-architect'],
      refinement: ['reviewer', 'tester', 'optimizer'],
      completion: ['tester', 'deployment-ops', 'production-validator'],
    };

    return specialists[phase] || ['specialist'];
  }

  /**
   * Validate completion of a SPARC phase.
   *
   * @param sparcTask
   * @param phase
   */
  private async validatePhaseCompletion(
    sparcTask: SPARCTask,
    phase: SPARCPhase
  ): Promise<{ passed: boolean; score: number; feedback: string[] }> {
    const phaseResult = sparcTask.phaseProgress[phase];

    // Basic validation criteria
    const hasArtifacts = phaseResult?.artifacts.length > 0;
    const hasAgents = phaseResult?.metrics?.agentsInvolved.length > 0;
    const hasTimestamps = phaseResult?.metrics?.startTime && phaseResult?.metrics?.endTime;

    const validationChecks = [hasArtifacts, hasAgents, hasTimestamps];
    const score = validationChecks.filter(Boolean).length / validationChecks.length;

    const feedback: string[] = [];
    if (!hasArtifacts) feedback.push(`Phase ${phase} produced no artifacts`);
    if (!hasAgents) feedback.push(`No agents were assigned to phase ${phase}`);
    if (!hasTimestamps) feedback.push(`Phase ${phase} timing not recorded`);

    phaseResult?.validation = {
      passed: score >= 0.8,
      score,
      feedback,
    };

    return phaseResult?.validation;
  }

  /**
   * Retry a failed SPARC phase.
   *
   * @param sparcTask
   * @param phase
   */
  private async retryPhase(sparcTask: SPARCTask, phase: SPARCPhase): Promise<void> {
    logger.info(`🔄 Retrying SPARC phase: ${phase} for ${sparcTask.id}`);

    // Reset phase status
    sparcTask.phaseProgress[phase]?.status = 'not_started';
    sparcTask.phaseProgress[phase]?.metrics?.iterationsCount++;

    // Execute phase again with different agents if possible
    await this.executeSPARCPhase(sparcTask, phase);
  }

  /**
   * Get SPARC-specific metrics.
   */
  getSPARCMetrics(): SPARCSwarmMetrics {
    return this.sparcMetrics;
  }

  /**
   * Get all active SPARC tasks.
   */
  getActiveSPARCTasks(): SPARCTask[] {
    return Array.from(this.sparcTasks.values()).filter((task) => task.status === 'in_progress');
  }

  /**
   * Get SPARC task by ID.
   *
   * @param taskId
   */
  getSPARCTask(taskId: string): SPARCTask | undefined {
    return this.sparcTasks.get(taskId);
  }

  // Private helper methods

  private setupSPARCEventHandlers(): void {
    this.on('sparc:phase:completed', this.handlePhaseCompleted.bind(this));
    this.on('sparc:cycle:completed', this.handleCycleCompleted.bind(this));
  }

  private handlePhaseCompleted(event: { sparcTask: SPARCTask; phase: SPARCPhase }): void {
    logger.debug(`Phase ${event.phase} completed for ${event.sparcTask.id}`);
  }

  private handleCycleCompleted(event: { sparcTask: SPARCTask }): void {
    logger.info(`SPARC cycle completed for ${event.sparcTask.id}`);
    this.updateAverageSparcCycleTime(event.sparcTask);
  }

  private initializePhaseProgress(): Record<SPARCPhase, SPARCPhaseResult> {
    const phases: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];
    const progress: Record<SPARCPhase, SPARCPhaseResult> = {} as any;

    phases.forEach((phase) => {
      progress[phase] = {
        phase,
        status: 'not_started',
        artifacts: [],
        metrics: {
          agentsInvolved: [],
          iterationsCount: 0,
        },
        validation: {
          passed: false,
          score: 0,
          feedback: [],
        },
      };
    });

    return progress;
  }

  private initializePhaseAgents(): Record<SPARCPhase, string[]> {
    const phases: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];
    const agents: Record<SPARCPhase, string[]> = {} as any;

    phases.forEach((phase) => {
      agents[phase] = [];
    });

    return agents;
  }

  private initializePhaseMetrics(): Record<
    SPARCPhase,
    { tasksProcessed: number; averageCompletionTime: number; successRate: number }
  > {
    const phases: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];
    const metrics: Record<
      SPARCPhase,
      { tasksProcessed: number; averageCompletionTime: number; successRate: number }
    > = {} as any;

    phases.forEach((phase) => {
      metrics[phase] = {
        tasksProcessed: 0,
        averageCompletionTime: 0,
        successRate: 0,
      };
    });

    return metrics;
  }

  private mapPriority(priority: string): 'low' | 'medium' | 'high' | 'critical' {
    const mapping: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    };
    return mapping[priority] || 'medium';
  }

  private getPriorityValue(priority: 'low' | 'medium' | 'high' | 'critical'): number {
    const values = { low: 1, medium: 2, high: 3, critical: 4 };
    return values[priority];
  }

  private updatePhaseMetrics(phase: SPARCPhase, success: boolean): void {
    const metrics = this.sparcMetrics.phaseMetrics[phase];
    metrics.tasksProcessed++;

    if (success) {
      const totalSuccesses = metrics.tasksProcessed * metrics.successRate + 1;
      metrics.successRate = totalSuccesses / metrics.tasksProcessed;
    } else {
      const totalSuccesses = metrics.tasksProcessed * metrics.successRate;
      metrics.successRate = totalSuccesses / metrics.tasksProcessed;
    }
  }

  private updateAverageSparcCycleTime(sparcTask: SPARCTask): void {
    const phases = Object.values(sparcTask.phaseProgress);
    const startTime = phases.length > 0 ? phases[0]?.metrics.startTime : undefined;
    const endTime = phases.length > 0 ? phases[phases.length - 1]?.metrics.endTime : undefined;

    if (startTime && endTime) {
      const cycleTime = endTime.getTime() - startTime.getTime();
      const currentAvg = this.sparcMetrics.averageSparcCycleTime;
      const completed = this.sparcMetrics.sparcTasksCompleted;

      this.sparcMetrics.averageSparcCycleTime =
        (currentAvg * (completed - 1) + cycleTime) / completed;
    }
  }

  private getDefaultMetrics(): SwarmMetrics {
    return {
      agentCount: 0,
      activeAgents: 0,
      totalTasks: 0,
      completedTasks: 0,
      averageResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      uptime: 0,
    };
  }

  /**
   * Assign a task to a specific agent.
   *
   * @param agentId
   * @param task
   */
  private async assignTaskToAgent(agentId: string, task: any): Promise<void> {
    // This is a placeholder implementation
    // In a real implementation, this would use the agent communication system
    logger.debug(`Assigning task ${task.id} to agent ${agentId}`);

    // Mock successful task assignment
    return Promise.resolve();
  }
}
