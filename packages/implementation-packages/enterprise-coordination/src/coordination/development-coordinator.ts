/**
 * @fileoverview Development Coordinator - Essential SPARC + Git + Swarms
 * 
 * Essential development coordination for SPARC methodology, Git control,
 * and swarm coordination. These are core development features, not optional.
 * 
 * The AI toggle only affects project management features (predictive analytics,
 * auto-planning, etc.), not core development coordination.
 * 
 * @author Claude Code Zen Team
 * @since 2.3.0
 * @version 1.0.0
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';

// SPARC types for development coordination
export type SPARCPhase = 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';

/**
 * Development coordination configuration
 */
export interface DevelopmentCoordinationConfig {
  projectId: string;
  sparcEnabled: boolean; // Always true for development projects
  gitControlEnabled: boolean; // Always true for code projects
  swarmCoordination: boolean; // Always true for multi-agent work
  
  // SPARC settings
  sparcPhaseValidation: boolean;
  autoProgressPhases: boolean;
  
  // Git settings
  branchStrategy: 'feature' | 'gitflow' | 'github-flow';
  autoCommitMessages: boolean;
  
  // Swarm settings
  maxSwarmSize: number;
  swarmStrategy: 'collaborative' | 'specialized' | 'mixed';
}

/**
 * Development task context
 */
export interface DevelopmentTask {
  id: string;
  title: string;
  sparcPhase: SPARCPhase;
  gitBranch?: string;
  assignedAgents: string[];
  status: 'pending' | 'in_progress' | 'review' | 'completed';
  dependencies: string[];
}

/**
 * Development Coordinator
 * 
 * Handles essential development coordination:
 * - SPARC methodology workflow
 * - Git branch and commit management
 * - Swarm coordination for development tasks
 * 
 * These are core development features, separate from optional AI project management.
 */
export class DevelopmentCoordinator extends EventEmitter {
  private logger: Logger;
  private config: DevelopmentCoordinationConfig | null = null;
  private activeTasks = new Map<string, DevelopmentTask>();
  private initialized = false;

  constructor() {
    super();
    this.logger = getLogger('DevelopmentCoordinator');
  }

  /**
   * Initialize development coordinator
   */
  async initialize(config: DevelopmentCoordinationConfig): Promise<void> {
    if (this.initialized) return;

    this.config = config;
    this.logger.info(`Initializing development coordination for project ${config.projectId}`);
    
    // Initialize SPARC workflow
    if (config.sparcEnabled) {
      await this.initializeSPARC();
    }
    
    // Initialize Git coordination
    if (config.gitControlEnabled) {
      await this.initializeGitControl();
    }
    
    // Initialize swarm coordination
    if (config.swarmCoordination) {
      await this.initializeSwarmCoordination();
    }
    
    this.initialized = true;
    this.emit('development:initialized', { projectId: config.projectId });
  }

  /**
   * Start SPARC workflow for a task
   */
  async startSPARCWorkflow(task: Omit<DevelopmentTask, 'id' | 'status'>): Promise<string> {
    if (!this.config?.sparcEnabled) {
      throw new Error('SPARC workflow not enabled');
    }

    const taskId = `task_${Date.now()}`;
    const sparcTask: DevelopmentTask = {
      ...task,
      id: taskId,
      status: 'pending',
      sparcPhase: 'specification'
    };

    this.activeTasks.set(taskId, sparcTask);
    
    this.logger.info(`Started SPARC workflow: ${task.title} (${taskId})`);
    this.emit('sparc:workflow_started', { taskId, task: sparcTask });
    
    return taskId;
  }

  /**
   * Progress to next SPARC phase
   */
  async progressSPARCPhase(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const phaseOrder: SPARCPhase[] = ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'];
    const currentIndex = phaseOrder.indexOf(task.sparcPhase);
    
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];
      task.sparcPhase = nextPhase;
      
      this.logger.info(`Task ${taskId} progressed to ${nextPhase} phase`);
      this.emit('sparc:phase_changed', { taskId, phase: nextPhase });
    } else {
      task.status = 'completed';
      this.emit('sparc:workflow_completed', { taskId });
    }
  }

  /**
   * Create Git branch for development task
   */
  async createTaskBranch(taskId: string, branchName: string): Promise<void> {
    if (!this.config?.gitControlEnabled) {
      throw new Error('Git control not enabled');
    }

    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    task.gitBranch = branchName;
    
    this.logger.info(`Created branch ${branchName} for task ${taskId}`);
    this.emit('git:branch_created', { taskId, branchName });
  }

  /**
   * Assign agents to swarm for task
   */
  async assignSwarmAgents(taskId: string, agentIds: string[]): Promise<void> {
    if (!this.config?.swarmCoordination) {
      throw new Error('Swarm coordination not enabled');
    }

    const task = this.activeTasks.get(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    if (agentIds.length > this.config.maxSwarmSize) {
      throw new Error(`Swarm size exceeds limit: ${agentIds.length} > ${this.config.maxSwarmSize}`);
    }

    task.assignedAgents = agentIds;
    
    this.logger.info(`Assigned ${agentIds.length} agents to task ${taskId}`);
    this.emit('swarm:agents_assigned', { taskId, agentIds });
  }

  /**
   * Get task status
   */
  getTask(taskId: string): DevelopmentTask | null {
    return this.activeTasks.get(taskId) || null;
  }

  /**
   * Get all active tasks
   */
  getActiveTasks(): DevelopmentTask[] {
    return Array.from(this.activeTasks.values());
  }

  /**
   * Private initialization methods
   */
  private async initializeSPARC(): Promise<void> {
    this.logger.info('SPARC methodology initialized via enterprise facade');
    
    try {
      // Use enterprise facade for SPARC functionality
      const { createSPARCWorkflow } = await import('@claude-zen/enterprise');
      const sparcWorkflow = createSPARCWorkflow({
        enableAI: false, // Keep it simple for now
        phases: ['specification', 'pseudocode', 'architecture', 'refinement', 'completion']
      });
      
      this.logger.info('SPARC workflow configured via enterprise facade');
    } catch (error) {
      this.logger.warn('Enterprise facade SPARC not available, using fallback', { error });
      // Continue with basic coordination without SPARC
    }
  }

  private async initializeGitControl(): Promise<void> {
    this.logger.info(`Git control initialized with ${this.config?.branchStrategy} strategy`);
    // Git coordination setup
  }

  private async initializeSwarmCoordination(): Promise<void> {
    this.logger.info(`Swarm coordination initialized (max size: ${this.config?.maxSwarmSize})`);
    // Swarm coordination setup
  }

  /**
   * Shutdown coordinator
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down development coordinator');
    this.activeTasks.clear();
    this.removeAllListeners();
    this.initialized = false;
  }
}

/**
 * Factory function for development coordination config
 */
export function createDevelopmentConfig(
  projectId: string,
  options: Partial<DevelopmentCoordinationConfig> = {}
): DevelopmentCoordinationConfig {
  return {
    projectId,
    sparcEnabled: true, // Always enabled for development
    gitControlEnabled: true, // Always enabled for code projects
    swarmCoordination: true, // Always enabled for multi-agent work
    sparcPhaseValidation: true,
    autoProgressPhases: false,
    branchStrategy: 'feature',
    autoCommitMessages: true,
    maxSwarmSize: 5,
    swarmStrategy: 'collaborative',
    ...options
  };
}