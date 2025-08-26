/**
 * Database-SPARC Bridge - SAFe 6.0 Integration
 *
 * Connects the database-driven SAFe flow with SPARC SAFe 6.0 Development Manager coordination.
 *
 * Flow:
 * 1. DatabaseDrivenSystem generates Features/Capabilities
 * 2. DatabaseSPARCBridge receives assignments
 * 3. Safe6DevelopmentManager processes using SAFe 6.0 + SPARC methodology
 * 4. Results are stored back in database with flow metrics
 *
 * Uses Strategic Facades for:
 * - @claude-zen/enterprise (SAFe framework access)
 * - @claude-zen/infrastructure (database access)
 * - @claude-zen/development (SPARC access)
 *
 * @package @claude-zen/safe-framework
 * @version 6.0.0 - SAFe 6.0 Flow-Based Implementation
 * @author Claude Code Zen Team
 */

import { TypedEventBase } from '@claude-zen/foundation';

// TODO: Import proper types when available
interface FeatureDocumentEntity {
  id: string;
  title: string;
  description: string;
  priority?: string;
  acceptance_criteria?: string[];
  project_id?: string;
  parent_document_id?: string;
  related_documents?: string[];
}

interface TaskDocumentEntity {
  id: string;
  title: string;
  description: string;
  featureId: string;
  priority?: string;
  implementation_details?: {
    files_to_create?: string[];
  };
  project_id?: string;
  parent_document_id?: string;
  related_documents?: string[];
}

interface DocumentManager {
  getDocument(id: string): Promise<any>;
  updateDocument(id: string, data: any): Promise<any>;
}

interface SPARCSwarmCoordinator {
  processFeatureWithSPARC(feature: FeatureDocumentEntity): Promise<any>;
  processTaskWithSPARC(task: TaskDocumentEntity): Promise<any>;
  getSPARCMetrics(): any;
  initialize(): Promise<void>;
  on(event: string, handler: Function): void;
}

interface DatabaseDrivenSystem {
  initialize(): Promise<void>;
  on(event: string, handler: Function): void;
}

interface SPARCTask {
  id: string;
  type: string;
  phase: string;
  data: any;
  status?: 'completed|failed';
  sourceDocument?: any;
  phaseProgress?: any;
}

export interface WorkAssignment {
  id: string;
  type: 'feature|task;
  document: FeatureDocumentEntity|'TaskDocumentEntity;'
  assignedTo:'sparc-swarm;
  priority: 'low|medium|high|critical;
  deadline?: Date;
  requirements: string[];
  context: {
    projectId: string;
    parentDocumentId?: string;
    relatedDocuments: string[];
  };
}

export interface ImplementationResult {
  workAssignmentId: string;
  sparcTaskId: string;
  status: 'completed' | 'failed' | 'partial';
  artifacts: {
    specification: string[];
    pseudocode: string[];
    architecture: string[];
    implementation: string[];
    tests: string[];
    documentation: string[];
  };
  metrics: {
    totalTimeMs: number;
    phaseTimes: Record<string, number>;
    agentsUsed: string[];
    qualityScore: number;
  };
  completionReport: string;
}

/**
 * Bridge between Database-Driven Product Flow and SPARC Swarm Coordination.
 *
 * @example
 */
export class DatabaseSPARCBridge extends TypedEventBase {
  private sparcSwarm: SPARCSwarmCoordinator;
  private logger: Logger;

  constructor(
    databaseSystem: DatabaseDrivenSystem,
    documentService: DocumentManager,
    sparcSwarm: SPARCSwarmCoordinator,
    logger?: Logger
  ) {
    super();
    this.databaseSystem = databaseSystem;
    this.documentService = documentService;
    this.sparcSwarm = sparcSwarm;

    // Use provided logger or create a simple console logger
    this.logger =
      logger||({
        info: (msg: string, ...args: any[]) =>
          console.log(`[DatabaseSPARCBridge] ${msg}`, ...args),`
        warn: (msg: string, ...args: any[]) =>
          console.warn(`[DatabaseSPARCBridge] ${msg}`, ...args),`
        error: (msg: string, ...args: any[]) =>
          console.error(`[DatabaseSPARCBridge] ${msg}`, ...args),`
        debug: (msg: string, ...args: any[]) =>
          console.debug(`[DatabaseSPARCBridge] ${msg}`, ...args),`
      } as Logger);

    this.setupEventHandlers();
  }

  /**
   * Initialize the bridge and establish connections.
   */
  async initialize(): Promise<void> {
    this.logger.info('🌉 Initializing Database-SPARC Bridge');'

    // Initialize components
    await this.databaseSystem.initialize();
    await this.sparcSwarm.initialize();

    // Setup listeners for database-driven workflow events
    this.setupDatabaseListeners();
    this.setupSPARCListeners();

    this.logger.info('✅ Database-SPARC Bridge ready');'
    this.emit('bridge:initialized', );'
  }

  /**
   * Assign a Feature to SPARC swarm for implementation.
   *
   * @param feature
   */
  async assignFeatureToSparcs(feature: FeatureDocumentEntity): Promise<string> {
    this.logger.info(`📋 Assigning feature to SPARC swarm: ${feature.title}`);`

    const assignment: WorkAssignment = {
      id: `assignment-feature-$feature.id`,`
      type: 'feature',
      document: feature,
      assignedTo: 'sparc-swarm',
      priority: this.mapPriority(feature.priority||'medium'),
      requirements: feature.acceptance_criteria||[],
      context: 
        projectId: feature.project_id ?? this.generateId(),
        ...(feature.parent_document_id !== undefined && 
          parentDocumentId: feature.parent_document_id,),
        relatedDocuments: feature.related_documents||[],,
    };

    this.activeAssignments.set(assignment.id, assignment);

    // Start SPARC processing
    const sparcTask = await this.sparcSwarm.processFeatureWithSPARC(feature);

    this.emit('work:assigned', { assignment, sparcTask });'
    return assignment.id;
  }

  /**
   * Assign a Task to SPARC swarm for implementation.
   *
   * @param task
   */
  async assignTaskToSparcs(task: TaskDocumentEntity): Promise<string> {
    this.logger.info(`🔧 Assigning task to SPARC swarm: ${task.title}`);`

    const assignment: WorkAssignment = {
      id: `assignment-task-$task.id`,`
      type: 'task',
      document: task,
      assignedTo: 'sparc-swarm',
      priority: this.mapPriority(task.priority||'medium'),
      requirements: task.implementation_details?.files_to_create||[],
      context: 
        projectId: task.project_id ?? this.generateId(),
        ...(task.parent_document_id !== undefined && 
          parentDocumentId: task.parent_document_id,),
        relatedDocuments: task.related_documents||[],,
    };

    this.activeAssignments.set(assignment.id, assignment);

    // Start SPARC processing
    const sparcTask = await this.sparcSwarm.processTaskWithSPARC(task);

    this.emit('work:assigned', { assignment, sparcTask });'
    return assignment.id;
  }

  /**
   * Get status of all active work assignments.
   */
  async getWorkStatus(): Promise<{
    active: WorkAssignment[];
    completed: ImplementationResult[];
      totalAssignments: number;
      completedAssignments: number;
      averageCompletionTime: number;
      successRate: number;;
  }> {
    const activeAssignments = Array.from(this.activeAssignments.values())();
    const completedWork = Array.from(this.completedWork.values())();

    const successfulCompletions = completedWork.filter(
      (work) => work.status === 'completed''
    ).length;
    const averageTime =
      completedWork.length > 0
        ? completedWork.reduce(
            (sum, work) => sum + work.metrics.totalTimeMs,
            0
          ) / completedWork.length
        : 0;

    return {
      active: activeAssignments,
      completed: completedWork,
      metrics: {
        totalAssignments: activeAssignments.length + completedWork.length,
        completedAssignments: completedWork.length,
        averageCompletionTime: averageTime,
        successRate:
          completedWork.length > 0
            ? successfulCompletions / completedWork.length
            : 0,
      },
    };
  }

  /**
   * Process completion of SPARC work and update database.
   *
   * @param sparcTask
   */
  private async handleSPARCCompletion(sparcTask: SPARCTask): Promise<void> {
    this.logger.info(`🎯 Processing SPARC completion: ${sparcTask.id}`);`

    // Find the original assignment
    const assignment = Array.from(this.activeAssignments.values()).find(
      (a) => a.document.id === sparcTask.sourceDocument?.id
    );

    if (!assignment) {
      this.logger.error(
        `No assignment found for completed SPARC task: $sparcTask.id``
      );
      return;
    }

    // Create implementation result
    const result: ImplementationResult = {
      workAssignmentId: assignment.id,
      sparcTaskId: sparcTask.id,
      status: sparcTask.status === 'completed' ? 'completed' : 'failed',
      artifacts: this.extractArtifacts(sparcTask),
      metrics: this.calculateMetrics(sparcTask),
      completionReport: this.generateCompletionReport(sparcTask),
    };

    // Update database with implementation results
    await this.updateDocumentWithResults(assignment, result);

    // Move from active to completed
    this.activeAssignments.delete(assignment.id);
    this.completedWork.set(assignment.id, result);

    this.emit('work:completed', { assignment, result });'
    this.logger.info(`✅ Work completed: ${assignment.id}`);`
  }

  /**
   * Update the original document with SPARC implementation results.
   *
   * @param assignment
   * @param result
   */
  private async updateDocumentWithResults(
    assignment: WorkAssignment,
    result: ImplementationResult
  ): Promise<void> {
    const document = assignment.document;

    // Update document with SPARC implementation details
    const _updatedDocument = {
      ...document,
      status:
        result?.status === 'completed''
          ? ('approved' as const)'
          : ('draft' as const),
      _completion_percentage:
        result?.status === 'completed''
          ? 100
          : result?.status === 'partial''
            ? 75
            : 0,
      workflow_stage: 'sparc-completed',
      // Add SPARC-specific fields
      sparc_implementation: 
        task_id: result?.sparcTaskId,
        completion_date: new Date(),
        artifacts: result?.artifacts,
        metrics: result?.metrics,
        methodology_applied: 'SPARC',
        quality_score: result?.metrics?.qualityScore,,
    };

    // Save to database
    await this.documentService.updateDocument(document.id, updatedDocument);

    this.logger.info(`📝 Updated document ${document.id} with SPARC results`);`
  }

  /**
   * Extract artifacts from completed SPARC task.
   *
   * @param sparcTask
   */
  private extractArtifacts(
    sparcTask: SPARCTask
  ): ImplementationResult['artifacts'] {'
    const phases = Object.values(sparcTask.phaseProgress||{});
    return {
      specification:
        phases.find((p: any) => p.phase ==='specification')?.artifacts||[],
      pseudocode:
        phases.find((p: any) => p.phase ==='pseudocode')?.artifacts||[],
      architecture:
        phases.find((p: any) => p.phase ==='architecture')?.artifacts||[],
      implementation:
        phases.find((p: any) => p.phase ==='completion')?.artifacts||[],
      tests:
        phases
          .find((p: any) => p.phase ==='completion')'
          ?.artifacts?.filter((a: string) => a.includes('test'))||[],
      documentation: [
        ...(phases.find((p: any) => p.phase ==='specification')?.artifacts||[]),
        ...(phases.find((p: any) => p.phase ==='architecture')?.artifacts||[]),
      ],
    };
  }

  /**
   * Calculate metrics from SPARC task execution.
   *
   * @param sparcTask
   */
  private calculateMetrics(
    sparcTask: SPARCTask
  ): ImplementationResult['metrics'] {'
    const phases = Object.values(sparcTask.phaseProgress||{});
    const allAgents = phases.flatMap(
      (p: any) => p.metrics?.agentsInvolved||[]
    );

    // Calculate total time
    const startTime = phases[0]?.metrics?.startTime;
    const endTime = phases[phases.length - 1]?.metrics?.endTime;
    const totalTime =
      startTime && endTime ? endTime.getTime() - startTime.getTime() : 0;

    // Calculate phase times
    const phaseTimes: Record<string, number> = {};
    phases.forEach((phase: any) => {
      if (phase.metrics?.startTime && phase.metrics?.endTime) {
        phaseTimes[phase.phase] =
          phase.metrics.endTime.getTime() - phase.metrics.startTime.getTime();
      }
    });

    // Calculate quality score based on validation results
    const validationScores = phases.map((p: any) => p.validation?.score||0);
    const qualityScore =
      validationScores.reduce((sum, score) => sum + score, 0) /
      (validationScores.length||1);

    return {
      totalTimeMs: totalTime,
      phaseTimes,
      agentsUsed: [...new Set(allAgents)],
      qualityScore,
    };
  }

  /**
   * Generate completion report.
   *
   * @param sparcTask
   */
  private generateCompletionReport(sparcTask: SPARCTask): string {
    const document = sparcTask.sourceDocument||{};
    const phases = Object.values(sparcTask.phaseProgress||{});

    const report = ``
# SPARC Implementation Report

**Document**: ${document.title||'Unknown'}'
**Type**: ${sparcTask.type.toUpperCase()}
**Status**: ${(sparcTask.status||'unknown').toUpperCase()}'
**Completion Date**: ${new Date().toISOString()}

## Phase Summary

${phases
  .map(
    (_phase: any) => ``
### ${(phase._phase||'UNKNOWN').toUpperCase()} Phase'
- **Status**: ${phase.status}
- **Agents**: ${phase.metrics?.agentsInvolved?.length||0}
- **Artifacts**: ${phase.artifacts?.length||0}
- **Quality Score**: ${((phase.validation?.score||0) * 100).toFixed(1)}%
- **Iterations**: ${phase.metrics?.iterationsCount||0}
``
  )
  .join('\n')}'

## Overall Results
- **Total Agents Used**: ${[...new Set(phases.flatMap((p: any) => p.metrics?.agentsInvolved||[]))].length}
- **Total Artifacts**: ${phases.reduce((sum, p: any) => sum + (p.artifacts?.length||0), 0)}
- **Average Quality**: ${((phases.reduce((sum, p: any) => sum + (p.validation?.score||0), 0) / (phases.length||1)) * 100).toFixed(1)}%

## Methodology Applied
This implementation used the SPARC methodology (Specification → Pseudocode → Architecture → Refinement → Completion) with distributed swarm coordination.

---
*Generated by Database-SPARC Bridge*
`;`

    return report.trim();
  }

  /**
   * Setup event handlers for database system.
   */
  private setupDatabaseListeners(): void {
    this.databaseSystem.on('document:processed', async (event: any) => {'
      const { document } = event;

      // Auto-assign Features and Tasks to SPARC swarm if they meet criteria
      if (
        document.type === 'feature' &&'
        this.shouldAutoAssignToSparc(document)
      ) {
        await this.assignFeatureToSparcs(document as FeatureDocumentEntity);
      } else if (
        document.type === 'task' &&'
        this.shouldAutoAssignToSparc(document)
      ) {
        await this.assignTaskToSparcs(document as TaskDocumentEntity);
      }
    });
  }

  /**
   * Setup event handlers for SPARC swarm.
   */
  private setupSPARCListeners(): void {
    this.sparcSwarm.on('sparc:cycle:completed', async (event: any) => {'
      await this.handleSPARCCompletion(event.sparcTask);
    });

    this.sparcSwarm.on('sparc:phase:completed', (event: any) => {'
      this.logger.debug(
        `SPARC phase ${event.phase} completed for ${event.sparcTask.id}``
      );
      this.emit('sparc:phase:update', event);'
    });
  }

  private setupEventHandlers(): void {
    // Bridge-specific event handlers
    this.on('work:assigned', (event: any) => {'
      this.logger.debug(`Work assigned: $event.assignment.id`);`
    });

    this.on('work:completed', (event: any) => {'
      this.logger.info(`Work completed: $event.assignment.id`);`
    });
  }

  /**
   * Determine if a document should be auto-assigned to SPARC swarm.
   *
   * @param document
   */
  private shouldAutoAssignToSparc(document: any): boolean {
    // Auto-assign high-priority items or items tagged for swarm processing
    return (
      document.priority === 'high'||document.priority ==='critical'||document.tags?.includes('sparc-auto-assign')||document.workflow_stage ==='ready-for-implementation''
    );
  }

  /**
   * Map document priority to work assignment priority.
   *
   * @param priority
   */
  private mapPriority(
    priority: string
  ): 'low|medium|high|critical' {'
    const mapping: Record<string, 'low|medium|high|critical'> = {'
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical',
    };
    return mapping[priority]||'medium;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get bridge status and metrics.
   */
  getStatus(): {
    bridgeStatus: 'active|inactive';
    activeAssignments: number;
    completedWork: number;
    sparcSwarmStatus: string;
    databaseConnection: boolean;
  } {
    const sparcMetrics = this.sparcSwarm.getSPARCMetrics();
    return {
      bridgeStatus: 'active',
      activeAssignments: this.activeAssignments.size,
      completedWork: this.completedWork.size,
      sparcSwarmStatus: `${sparcMetrics.totalTasks || 0} tasks, ${sparcMetrics.completedTasks || 0} completed`,`
      databaseConnection: true, // Would check actual connection
    };
  }
}

export default DatabaseSPARCBridge;
