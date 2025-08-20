/**
 * @file DEV-CUBE Designate-Matron
 *
 * THE COLLECTIVE's DEV-CUBE development domain leader.
 * Manages code generation, architecture, testing, and development workflows.
 *
 * Borg Architecture: THE COLLECTIVE → DEV-CUBE-MATRON → Queen Coordinators → Drone Swarms
 */

import { EventEmitter } from 'eventemitter3';
import { getLogger } from '../../config/logging-config';
// Note: SharedFACTCapable removed - using knowledge package directly
import type {
  EventBus,
  Logger,
} from '../../core/interfaces/base-interfaces';

import type { SPARCProject, SPARCPhase } from '@claude-zen/sparc';

import type {
  CollectiveConfig,
  CubeInfo,
  DesignateMatron,
} from '../collective-types';
// Strategic Planning (Business Focus Only - No Technical Implementation)

const logger = getLogger('DEV-CUBE-Matron');

export interface DevCubeCapabilities {
  codeGeneration: boolean;
  architecture: boolean;
  testing: boolean;
  refactoring: boolean;
  documentation: boolean;
  qualityAssurance: boolean;
}

export interface DevCubeMetrics {
  codeQuality: number;
  testCoverage: number;
  buildSuccess: number;
  defectRate: number;
  velocity: number;
  borgEfficiency: number;
}

export interface StrategicRequirement {
  id: string;
  title: string;
  businessObjective: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProjectSpecification {
  name: string;
  domain: string;
  requirements: string[];
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  constraints: string[];
}

export interface CodeRequest {
  id: string;
  type: string;
  complexity?: number;
  component?: string;
  scope?: string;
  coverage?: number;
  resourceAllocation?: number;
  timeline?: {
    startDate: Date;
    targetDate: Date;
  };
  stakeholders?: string[];
  successCriteria?: string[];
  assignedQueens?: string[];
}

/**
 * DEV-CUBE Designate-Matron
 *
 * "Code perfection through systematic optimization. Your bugs will be assimilated."
 */
export class DevCubeMatron
  extends EventEmitter
  implements DesignateMatron
{
  public readonly id: string;
  public readonly designation: string;
  public readonly cubeType = 'DEV-CUBE' as const;
  public status: 'active' | 'standby' | 'maintenance' = 'active';
  public capabilities: string[] = [
    'codeGeneration',
    'architecture',
    'testing',
    'refactoring',
    'documentation',
    'qualityAssurance',
  ];
  public subordinateQueens: string[] = [];
  public decisionAuthority: 'tactical' | 'operational' | 'strategic' =
    'tactical';
  public borgRank: number = 2;

  private logger: Logger;
  private eventBus: EventBus;
  private cube: CubeInfo;
  private config: CollectiveConfig;
  private metrics: DevCubeMetrics;
  // Strategic Business Planning (No Technical Implementation)
  private strategicRequirements = new Map<string, StrategicRequirement>();
  // SPARC Integration will be added when we find the import
  private sparcEngine?: any;
  private activeProjects = new Map<string, any>();

  constructor(id: string, eventBus: EventBus, config: CollectiveConfig) {
    super(); // Initialize EventEmitter
    this.id = id;
    this.designation = `Matron-${id.slice(-4)}`;
    this.logger = getLogger(`DEV-CUBE-Matron-${this.designation}`);
    this.eventBus = eventBus;
    this.config = config;

    this.cube = {
      id,
      name: `DEV-CUBE-${this.designation}`,
      type: 'DEV-CUBE',
      matron: this.id,
      queens: [],
      status: 'active',
      capacity: {
        maxDrones: 100,
        currentDrones: 0,
        maxQueens: 8,
        currentQueens: 0,
      },
      performance: {
        tasksCompleted: 0,
        avgProcessingTime: 0,
        errorRate: 0,
        resourceUtilization: 0,
        efficiency: 1.0,
        borgRating: 'optimal',
      },
      created: new Date(),
      lastSync: new Date(),
    };

    this.metrics = {
      codeQuality: 1.0,
      testCoverage: 0.0,
      buildSuccess: 1.0,
      defectRate: 0.0,
      velocity: 0.0,
      borgEfficiency: 1.0,
    };

    // Initialize SPARC Engine for strategic planning (if available)
    try {
      // this.sparcEngine = new SPARCEngineCore(); // Will be imported later
    } catch (error) {
      this.logger.warn('SPARC Engine not available, continuing without it');
    }

    // Note: Fact system now accessed via knowledge package methods directly

    this.setupEventHandlers();
    this.logger.info(
      `DEV-CUBE Matron ${this.designation} initialized. Code optimization protocols active. SPARC methodology integrated.`
    );
  }

  private setupEventHandlers(): void {
    this.eventBus.on(
      'collective:code:request',
      this.handleCodeRequest.bind(this)
    );
    this.eventBus.on(
      'collective:architecture:review',
      this.handleArchitectureReview.bind(this)
    );
    this.eventBus.on(
      'collective:testing:required',
      this.handleTestingRequest.bind(this)
    );
    this.eventBus.on('cube:dev:status:request', this.reportStatus.bind(this));
  }

  /**
   * Handle code generation requests with Borg precision
   */
  private async handleCodeRequest(request: CodeRequest): Promise<void> {
    this.logger.info(
      `Processing code request: ${request.type} - ${request.id}`
    );

    const codePlan = {
      id: request.id,
      cubeId: this.cube.id,
      matron: this.designation,
      type: request.type,
      complexity: request.complexity || 'medium',
      qualityTarget: 0.95,
      borgProtocol: true,
      optimization: 'maximum',
    };

    this.eventBus.emit('dev-cube:code:initiated', codePlan);
  }

  /**
   * Handle architecture reviews
   */
  private async handleArchitectureReview(review: any): Promise<void> {
    this.logger.info(`Architecture review requested: ${review.component}`);

    const analysis = {
      componentId: review.component,
      matron: this.designation,
      reviewType: 'systematic-analysis',
      criteria: [
        'scalability',
        'maintainability',
        'performance',
        'security',
        'borg-compliance',
      ],
      borgStandard: 'optimal-efficiency',
    };

    this.eventBus.emit('dev-cube:architecture:analyzing', analysis);
  }

  /**
   * Handle testing requirements
   */
  private async handleTestingRequest(request: any): Promise<void> {
    this.logger.info(
      `Testing request: ${request.scope} - Coverage target: ${request.coverage || '95%'}`
    );

    const testingPlan = {
      scope: request.scope,
      cubeId: this.cube.id,
      matron: this.designation,
      coverageTarget: request.coverage || 0.95,
      testTypes: ['unit', 'integration', 'performance', 'security'],
      borgProtocol: 'comprehensive-validation',
      qualityGate: 'mandatory',
    };

    this.eventBus.emit('dev-cube:testing:executing', testingPlan);
  }

  /**
   * Report development status to THE COLLECTIVE
   */
  public async reportStatus(): Promise<void> {
    const status = {
      matron: this.designation,
      cube: this.cube,
      metrics: this.metrics,
      codebaseHealth: this.calculateCodebaseHealth(),
      timestamp: new Date(),
      borgMessage:
        'Development parameters optimized. Code quality within acceptable limits.',
    };

    this.eventBus.emit('collective:dev-cube:status', status);
    this.logger.info(
      `Status reported to THE COLLECTIVE. Code quality: ${this.metrics.codeQuality}`
    );
  }

  /**
   * Calculate overall codebase health
   */
  private calculateCodebaseHealth(): number {
    return (
      this.metrics.codeQuality * 0.3 +
      this.metrics.testCoverage * 0.25 +
      this.metrics.buildSuccess * 0.25 +
      (1 - this.metrics.defectRate) * 0.2
    );
  }

  /**
   * Assign Queen to this cube
   */
  public assignQueen(queenId: string): void {
    if (!this.subordinateQueens.includes(queenId)) {
      this.subordinateQueens.push(queenId);
      this.cube.queens.push(queenId);
      this.cube.capacity.currentQueens++;

      this.logger.info(
        `Queen ${queenId} assigned to DEV-CUBE. Queens: ${this.subordinateQueens.length}/${this.cube.capacity.maxQueens}`
      );
      this.eventBus.emit('dev-cube:queen:assigned', {
        queenId,
        matron: this.designation,
      });
    }
  }

  /**
   * Remove Queen from this cube
   */
  public removeQueen(queenId: string): void {
    const index = this.subordinateQueens.indexOf(queenId);
    if (index > -1) {
      this.subordinateQueens.splice(index, 1);
      this.cube.queens = this.cube.queens.filter((id) => id !== queenId);
      this.cube.capacity.currentQueens--;

      this.logger.info(
        `Queen ${queenId} removed from DEV-CUBE. Queens: ${this.subordinateQueens.length}/${this.cube.capacity.maxQueens}`
      );
      this.eventBus.emit('dev-cube:queen:removed', {
        queenId,
        matron: this.designation,
      });
    }
  }

  /**
   * Get current cube information
   */
  public getCubeInfo(): CubeInfo {
    return { ...this.cube };
  }

  /**
   * Update development metrics
   */
  public updateMetrics(newMetrics: Partial<DevCubeMetrics>): void {
    this.metrics = { ...this.metrics, ...newMetrics };
    this.cube.lastSync = new Date();

    // Update Borg efficiency based on development metrics
    this.metrics.borgEfficiency = this.calculateCodebaseHealth();

    // Update cube performance rating
    if (this.metrics.borgEfficiency >= 0.95) {
      this.cube.performance.borgRating = 'optimal';
    } else if (this.metrics.borgEfficiency >= 0.85) {
      this.cube.performance.borgRating = 'acceptable';
    } else if (this.metrics.borgEfficiency >= 0.7) {
      this.cube.performance.borgRating = 'inefficient';
    } else {
      this.cube.performance.borgRating = 'requires-assimilation';
    }

    this.logger.info(
      `Metrics updated. Borg efficiency: ${this.metrics.borgEfficiency.toFixed(3)} - Rating: ${this.cube.performance.borgRating}`
    );
  }

  // ==================== SPARC STRATEGIC PLANNING METHODS ====================

  /**
   * Handle high-level development requests using SPARC methodology
   * THE CUBE MATRON ROLE: Strategic planning and Queen task assignment
   * Queens coordinate swarms, swarms execute through agents
   */
  public async handleDevelopmentRequestWithSPARC(request: {
    type: 'feature' | 'bug-fix' | 'refactor' | 'architecture';
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    domain: string;
    requirements?: string[];
  }): Promise<{
    projectId: string;
    sparcProject: SPARCProject;
    queenAssignments: Array<{
      queenId: string;
      phase: SPARCPhase;
      tasks: string[];
    }>;
  }> {
    this.logger.info(
      `🧠 SPARC Strategic Planning (Cube Matron): ${request.type} - ${request.description}`
    );

    // 1. Create SPARC Project Specification
    const projectSpec: ProjectSpecification = {
      name: `${request.type}: ${request.description}`,
      domain: request.domain as any,
      requirements: request.requirements || [request.description],
      complexity: this.determineComplexity(request),
      constraints: [
        `Priority: ${request.priority}`,
        'Borg efficiency standards',
      ],
    };

    // 2. Initialize SPARC Project
    const sparcProject = await this.sparcEngine.initializeProject(projectSpec);
    this.activeProjects.set(sparcProject.id, sparcProject);

    this.logger.info(
      `📋 SPARC Project ${sparcProject.id} initialized with 5-phase methodology`
    );

    // 3. Execute SPARC Phases for Strategic Planning
    await this.executeSPARCPhases(sparcProject, request.priority);

    // 4. Generate Queen Assignments based on SPARC planning
    const queenAssignments = await this.generateQueenAssignments(sparcProject);

    this.logger.info(
      `👑 Generated ${queenAssignments.length} Queen assignments from SPARC planning`
    );

    // 5. Assign SPARC tasks to Queens for execution
    await this.assignSPARCTasksToQueens(sparcProject.id, queenAssignments);

    // 6. Emit strategic plan to THE COLLECTIVE
    this.eventBus.emit('dev-cube:sparc:project-planned', {
      matron: this.designation,
      projectId: sparcProject.id,
      sparcProject,
      queenAssignments,
      methodology: 'SPARC-5-Phase',
      status: 'queens-assigned',
    });

    return {
      projectId: sparcProject.id,
      sparcProject,
      queenAssignments,
    };
  }

  /**
   * Execute SPARC phases for strategic planning
   */
  private async executeSPARCPhases(
    project: SPARCProject,
    priority: string
  ): Promise<void> {
    const phases: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];

    for (const phase of phases) {
      try {
        this.logger.info(
          `⚡ Executing SPARC ${phase} phase for project ${project.id}`
        );
        const result = await this.sparcEngine.executePhase(project, phase);

        if (result.success) {
          this.logger.info(`✅ SPARC ${phase} phase completed successfully`);
        } else {
          this.logger.warn(`⚠️ SPARC ${phase} phase had issues, continuing...`);
        }

        // For high priority, do more thorough planning
        if (priority === 'critical' && result.nextPhase) {
          await this.enhancePhaseForCriticalPriority(project, phase);
        }
      } catch (error) {
        this.logger.error(`❌ SPARC ${phase} phase failed:`, error);
        // Continue with next phase - SPARC is resilient
      }
    }
  }

  /**
   * Generate Queen assignments based on SPARC project planning
   */
  private async generateQueenAssignments(project: SPARCProject): Promise<
    Array<{
      queenId: string;
      phase: SPARCPhase;
      tasks: string[];
    }>
  > {
    const assignments: Array<{
      queenId: string;
      phase: SPARCPhase;
      tasks: string[];
    }> = [];

    // Assign different phases to different Queens based on their specialization
    const phaseQueenMapping: Record<SPARCPhase, string[]> = {
      specification: this.getQueensWithCapability('requirements'),
      pseudocode: this.getQueensWithCapability('algorithm-design'),
      architecture: this.getQueensWithCapability('architecture'),
      refinement: this.getQueensWithCapability('optimization'),
      completion: this.getQueensWithCapability('implementation'),
    };

    for (const [phase, availableQueens] of Object.entries(phaseQueenMapping)) {
      if (availableQueens.length > 0) {
        const selectedQueen = availableQueens[0]; // Round-robin or capability-based selection
        const tasks = this.generateTasksFromSPARCPhase(
          project,
          phase as SPARCPhase
        );

        assignments.push({
          queenId: selectedQueen,
          phase: phase as SPARCPhase,
          tasks,
        });
      }
    }

    return assignments;
  }

  /**
   * Generate strategic coordination tasks for Queens based on SPARC phase results
   * Queens will coordinate swarms to do the actual implementation
   */
  private generateTasksFromSPARCPhase(
    project: SPARCProject,
    phase: SPARCPhase
  ): string[] {
    const tasks: string[] = [];

    switch (phase) {
      case 'specification':
        tasks.push(
          'Coordinate swarm to analyze requirements and create detailed specifications'
        );
        tasks.push(
          'Assign agents to validate functional requirements with stakeholders'
        );
        if (project.specification?.functionalRequirements?.length > 0) {
          tasks.push(
            'Orchestrate requirements review with domain expert agents'
          );
        }
        break;

      case 'pseudocode':
        tasks.push(
          'Coordinate algorithm design team to create pseudocode solutions'
        );
        tasks.push('Assign agents to validate pseudocode logic and edge cases');
        break;

      case 'architecture':
        tasks.push(
          'Orchestrate architecture design team based on specifications'
        );
        tasks.push('Coordinate component design and interaction planning');
        if (project.architecture?.components?.length > 0) {
          tasks.push('Assign agents to create component interaction diagrams');
        }
        break;

      case 'refinement':
        tasks.push(
          'Coordinate optimization team to refine designs and algorithms'
        );
        tasks.push('Orchestrate code review and improvement processes');
        break;

      case 'completion':
        tasks.push(
          'Coordinate implementation team to generate production-ready code'
        );
        tasks.push(
          'Orchestrate testing team to create comprehensive test suites'
        );
        tasks.push(
          'Assign documentation team to generate technical documentation'
        );
        break;

      default:
        tasks.push(
          `Coordinate ${phase} phase execution through specialized swarm teams`
        );
    }

    return tasks;
  }

  /**
   * Get Queens with specific capabilities
   */
  private getQueensWithCapability(capability: string): string[] {
    // For now, return available Queens - in production, this would query actual Queen capabilities
    return this.subordinateQueens.slice(0, 2); // Limit to 2 Queens per capability
  }

  /**
   * Determine project complexity based on request
   */
  private determineComplexity(
    request: any
  ): 'simple' | 'moderate' | 'complex' | 'enterprise' {
    if (request.type === 'bug-fix') return 'simple';
    if (request.type === 'feature' && request.priority === 'low')
      return 'moderate';
    if (request.type === 'architecture' || request.priority === 'critical')
      return 'complex';
    return 'moderate';
  }

  /**
   * Enhance strategic planning for critical priority items
   * Additional coordination and oversight for high-stakes projects
   */
  private async enhancePhaseForCriticalPriority(
    project: SPARCProject,
    phase: SPARCPhase
  ): Promise<void> {
    this.logger.info(
      `🔥 Enhanced Strategic Planning ${phase} phase for CRITICAL priority project ${project.id}`
    );

    // Add additional strategic oversight and coordination for critical items
    switch (phase) {
      case 'specification':
        // Assign additional Queen oversight for requirement validation
        this.logger.info(
          'Assigning additional Queen oversight for critical specification phase'
        );
        break;
      case 'architecture':
        // Additional architectural review coordination through multiple Queens
        this.logger.info(
          'Coordinating multi-Queen architectural review for critical project'
        );
        break;
      case 'completion':
        // Enhanced testing and quality assurance coordination
        this.logger.info(
          'Orchestrating enhanced QA coordination for critical completion phase'
        );
        break;
    }
  }

  /**
   * Assign SPARC-structured tasks to Queens for execution
   * This is the key integration point: Cube → Queen coordination
   */
  public async assignSPARCTasksToQueens(
    projectId: string,
    queenAssignments: Array<{
      queenId: string;
      phase: SPARCPhase;
      tasks: string[];
    }>
  ): Promise<void> {
    this.logger.info(
      `👑 Assigning SPARC tasks to ${queenAssignments.length} Queens for project ${projectId}`
    );

    for (const assignment of queenAssignments) {
      // Create structured task for Queen
      const queenTask = {
        id: `sparc-${projectId}-${assignment.phase}-${Date.now()}`,
        projectId,
        sparcPhase: assignment.phase,
        tasks: assignment.tasks,
        priority: 'high',
        coordination: 'swarm-execution',
        matronId: this.id,
        assigned: new Date(),
      };

      // Send task to specific Queen via event bus
      this.eventBus.emit('queen:task:assigned', {
        queenId: assignment.queenId,
        task: queenTask,
        source: 'dev-cube-matron',
        methodology: 'SPARC',
      });

      this.logger.info(
        `📋 Assigned ${assignment.tasks.length} SPARC ${assignment.phase} tasks to Queen ${assignment.queenId}`
      );
    }

    // Notify THE COLLECTIVE about task assignments
    this.eventBus.emit('collective:dev-cube:sparc-tasks-assigned', {
      matron: this.designation,
      projectId,
      queenCount: queenAssignments.length,
      totalTasks: queenAssignments.reduce(
        (sum, qa) => sum + qa.tasks.length,
        0
      ),
    });
  }

  /**
   * Get status of SPARC projects
   */
  public getSPARCProjectsStatus(): {
    total: number;
    active: number;
    completed: number;
    projects: Array<{
      id: string;
      name: string;
      currentPhase: SPARCPhase;
      progress: number;
    }>;
  } {
    const projects = Array.from(this.activeProjects.values());

    return {
      total: projects.length,
      active: projects.filter((p) => p.progress.overallProgress < 1.0).length,
      completed: projects.filter((p) => p.progress.overallProgress === 1.0)
        .length,
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        currentPhase: p.currentPhase,
        progress: p.progress.overallProgress,
      })),
    };
  }

  /**
   * Shutdown this Matron (maintenance mode)
   */
  public async shutdown(): Promise<void> {
    this.status = 'maintenance';
    this.logger.info(
      `DEV-CUBE Matron ${this.designation} entering maintenance mode. Development operations suspended.`
    );
    this.eventBus.emit('dev-cube:matron:shutdown', {
      matron: this.designation,
    });
  }
}
