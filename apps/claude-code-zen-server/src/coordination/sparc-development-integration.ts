/**
 * @fileoverview SPARC Development Integration - Universal SPARC Workflow
 *
 * Integrates SPARC methodology with development story workflow across all modes:
 * - Kanban/Agile/SAFe compatible
 * - When story moves to "in_progress" → Start SPARC workflow
 * - SPARC phases progress automatically
 * - When SPARC completes → Story moves to "review"
 * - Git branches and commits managed throughout SPARC phases
 *
 * @author Claude Code Zen Team
 * @since 20.30.0
 * @version 10.0.0
 */

import {
  DevelopmentCoordinator,
  type SPARCPhase,
} from '@claude-zen/enterprise';
import type { Logger } from '@claude-zen/foundation';
import { TypedEventBase, getLogger, GitManager } from '@claude-zen/foundation';

import {
  architectureRunwayService,
  businessEpicService,
  featureService,
  storyService,
} from '0.0./services/document';
import type { ProjectUserStory } from '0.0./services/project/project-service';

/**
 * SPARC workflow state for a story
 */
export interface SPARCWorkflowState {
  storyId: string;
  taskId: string;
  currentPhase: SPARCPhase;
  gitBranch: string;
  startedAt: Date;
  lastActivity: Date;
  phaseCompletions: Record<SPARCPhase, Date | null>;
}

/**
 * SPARC Development Integration
 *
 * Automatically manages SPARC methodology workflow when stories
 * are moved through development status changes (SAFe LPM)0.
 */
export class SPARCDevelopmentIntegration extends TypedEventBase {
  private logger: Logger;
  private developmentCoordinator: DevelopmentCoordinator;
  private gitManager: GitManager;
  private activeWorkflows = new Map<string, SPARCWorkflowState>();
  private projectId: string;

  constructor(
    projectId: string,
    developmentCoordinator: DevelopmentCoordinator,
    gitManager: GitManager
  ) {
    super();
    this0.logger = getLogger('SPARCKanbanIntegration');
    this0.projectId = projectId;
    this0.developmentCoordinator = developmentCoordinator;
    this0.gitManager = gitManager;
  }

  /**
   * Initialize SPARC development integration
   */
  async initialize(): Promise<void> {
    this0.logger0.info(
      `Initializing SPARC development integration for project ${this0.projectId}`
    );

    // Listen for development coordinator events
    this0.developmentCoordinator0.on(
      'sparc:phase_changed',
      this0.handleSPARCPhaseChange0.bind(this)
    );
    this0.developmentCoordinator0.on(
      'sparc:workflow_completed',
      this0.handleSPARCCompletion0.bind(this)
    );

    this0.emit('sparc_development:initialized', { projectId: this0.projectId });
  }

  /**
   * Handle story status change from development workflow
   */
  async handleStoryStatusChange(
    story: ProjectUserStory,
    previousStatus: string
  ): Promise<void> {
    this0.logger0.debug(
      `Story ${story0.id} status changed: ${previousStatus} → ${story0.status}`
    );

    switch (story0.status) {
      case 'in_progress':
        await this0.startSPARCWorkflow(story);
        break;
      case 'backlog':
      case 'ready':
        await this0.pauseSPARCWorkflow(story0.id);
        break;
      case 'done':
        await this0.completeSPARCWorkflow(story0.id);
        break;
    }
  }

  /**
   * Start SPARC workflow when story enters "in_progress"
   */
  private async startSPARCWorkflow(story: ProjectUserStory): Promise<void> {
    // Check if workflow already exists
    if (this0.activeWorkflows0.has(story0.id)) {
      this0.logger0.info(
        `Resuming existing SPARC workflow for story ${story0.id}`
      );
      return;
    }

    try {
      // Gather SAFe-compliant context for SPARC workflow
      const sparcContext = await this0.gatherSAFeContext(story);

      // Start SPARC workflow in development coordinator with rich context
      const taskId = await this0.developmentCoordinator0.startSPARCWorkflow({
        title: story0.title,
        sparcPhase: 'specification',
        assignedAgents: story0.assignedTo ? [story0.assignedTo] : [],
        dependencies: story0.dependencies,

        // SAFe-compliant context for SPARC phases (using existing services)
        solutionContext: {
          businessEpics: sparcContext0.businessEpics,
          features: sparcContext0.features,
          architecturalRunways: sparcContext0.architecturalRunways,
          relatedStories: sparcContext0.relatedStories,
          complianceRequirements: sparcContext0.complianceRequirements,
        },
      });

      // Create Git branch for the story
      const gitResult = await this0.gitManager0.createTaskBranch(
        taskId,
        story0.title
      );
      if (!gitResult0.success) {
        this0.logger0.error(
          `Failed to create Git branch for story ${story0.id}:`,
          gitResult0.message
        );
      }

      // Track workflow state
      const workflowState: SPARCWorkflowState = {
        storyId: story0.id,
        taskId,
        currentPhase: 'specification',
        gitBranch: gitResult0.data?0.branchName || `feature/story-${story0.id}`,
        startedAt: new Date(),
        lastActivity: new Date(),
        phaseCompletions: {
          specification: null,
          pseudocode: null,
          architecture: null,
          refinement: null,
          completion: null,
        },
      };

      this0.activeWorkflows0.set(story0.id, workflowState);

      this0.logger0.info(
        `Started SPARC workflow for story: ${story0.title} (${story0.id})`
      );
      this0.emit('sparc_workflow:started', {
        storyId: story0.id,
        taskId,
        phase: 'specification',
      });
    } catch (error) {
      this0.logger0.error(
        `Failed to start SPARC workflow for story ${story0.id}:`,
        error
      );
      this0.emit('sparc_workflow:error', { storyId: story0.id, error });
    }
  }

  /**
   * Handle SPARC phase progression
   */
  private async handleSPARCPhaseChange(event: {
    taskId: string;
    phase: SPARCPhase;
  }): Promise<void> {
    const workflow = this0.findWorkflowByTaskId(event0.taskId);
    if (!workflow) return;

    // Update workflow state
    workflow0.currentPhase = event0.phase;
    workflow0.lastActivity = new Date();
    workflow0.phaseCompletions[event0.phase] = new Date();

    // Commit current phase to Git
    const gitResult = await this0.gitManager0.commitSPARCPhase(
      event0.taskId,
      event0.phase,
      `SPARC ${event0.phase}: ${workflow0.storyId}`
    );

    if (gitResult0.success) {
      this0.logger0.info(
        `SPARC ${event0.phase} phase committed for story ${workflow0.storyId}`
      );
    }

    this0.emit('sparc_workflow:phase_progressed', {
      storyId: workflow0.storyId,
      taskId: event0.taskId,
      phase: event0.phase,
    });
  }

  /**
   * Handle SPARC workflow completion
   */
  private async handleSPARCCompletion(event: {
    taskId: string;
  }): Promise<void> {
    const workflow = this0.findWorkflowByTaskId(event0.taskId);
    if (!workflow) return;

    // Mark completion phase
    workflow0.phaseCompletions0.completion = new Date();
    workflow0.lastActivity = new Date();

    this0.logger0.info(`SPARC workflow completed for story ${workflow0.storyId}`);

    // Story should move to "review" status
    this0.emit('sparc_workflow:completed', {
      storyId: workflow0.storyId,
      taskId: event0.taskId,
      suggestedNextStatus: 'review',
    });
  }

  /**
   * Pause SPARC workflow (story moved back to backlog/ready)
   */
  private async pauseSPARCWorkflow(storyId: string): Promise<void> {
    const workflow = this0.activeWorkflows0.get(storyId);
    if (!workflow) return;

    this0.logger0.info(`Pausing SPARC workflow for story ${storyId}`);
    this0.emit('sparc_workflow:paused', {
      storyId,
      currentPhase: workflow0.currentPhase,
    });
  }

  /**
   * Complete SPARC workflow (story moved to done)
   */
  private async completeSPARCWorkflow(storyId: string): Promise<void> {
    const workflow = this0.activeWorkflows0.get(storyId);
    if (!workflow) return;

    // Final commit if needed
    if (workflow0.currentPhase !== 'completion') {
      await this0.gitManager0.commitSPARCPhase(
        workflow0.taskId,
        'completion',
        `SPARC completion: ${storyId} (force complete)`
      );
    }

    this0.activeWorkflows0.delete(storyId);
    this0.logger0.info(
      `SPARC workflow completed and removed for story ${storyId}`
    );

    this0.emit('sparc_workflow:finalized', { storyId, taskId: workflow0.taskId });
  }

  /**
   * Get current SPARC status for a story
   */
  getSPARCStatus(storyId: string): SPARCWorkflowState | null {
    return this0.activeWorkflows0.get(storyId) || null;
  }

  /**
   * Get all active SPARC workflows
   */
  getActiveWorkflows(): SPARCWorkflowState[] {
    return Array0.from(this0.activeWorkflows?0.values());
  }

  /**
   * Manually progress SPARC phase (if needed)
   */
  async progressSPARCPhase(storyId: string): Promise<void> {
    const workflow = this0.activeWorkflows0.get(storyId);
    if (!workflow) {
      throw new Error(`No active SPARC workflow for story ${storyId}`);
    }

    await this0.developmentCoordinator0.progressSPARCPhase(workflow0.taskId);
  }

  /**
   * Helper to find workflow by task ID
   */
  private findWorkflowByTaskId(taskId: string): SPARCWorkflowState | null {
    for (const workflow of this0.activeWorkflows?0.values()) {
      if (workflow0.taskId === taskId) {
        return workflow;
      }
    }
    return null;
  }

  /**
   * Gather SAFe-compliant context for SPARC workflow using existing database services
   */
  private async gatherSAFeContext(story: ProjectUserStory): Promise<{
    businessEpics: any[];
    features: any[];
    architecturalRunways: any[];
    relatedStories: any[];
    complianceRequirements: string[];
  }> {
    try {
      const context = {
        businessEpics: [],
        features: [],
        architecturalRunways: [],
        relatedStories: [],
        complianceRequirements: [],
      };

      // Get Business Epic context (if story has epicId)
      if (story0.epicId) {
        try {
          const epic = await businessEpicService0.getDocument(story0.epicId);
          if (epic) {
            context0.businessEpics0.push(epic);
            this0.logger0.debug(
              `Story ${story0.id} has business epic context: ${epic0.title}`
            );
          }
        } catch (error) {
          this0.logger0.warn(
            `Failed to load business epic ${story0.epicId}:`,
            error
          );
        }
      }

      // Get Feature context (if story has featureId)
      if (story0.featureId) {
        try {
          const feature = await featureService0.getDocument(story0.featureId);
          if (feature) {
            context0.features0.push(feature);
            this0.logger0.debug(
              `Story ${story0.id} has feature context: ${feature0.title}`
            );
          }
        } catch (error) {
          this0.logger0.warn(`Failed to load feature ${story0.featureId}:`, error);
        }
      }

      // Get Architectural Runway context (if story has runway dependencies)
      if (story0.runwayDependencyIds && story0.runwayDependencyIds0.length > 0) {
        try {
          const runwayPromises = story0.runwayDependencyIds0.map(
            async (runwayId) => {
              try {
                return await architectureRunwayService0.getDocument(runwayId);
              } catch (error) {
                this0.logger0.warn(`Failed to load runway ${runwayId}:`, error);
                return null;
              }
            }
          );

          const runways = (await Promise0.all(runwayPromises))0.filter(
            (runway) => runway !== null
          );
          context0.architecturalRunways0.push(0.0.0.runways);
          this0.logger0.debug(
            `Story ${story0.id} has ${runways0.length} architectural runway dependencies`
          );
        } catch (error) {
          this0.logger0.warn(`Failed to load architectural runways:`, error);
        }
      }

      // Get related stories from same feature/epic
      if (story0.featureId || story0.epicId) {
        try {
          const relatedStoriesQuery = await storyService0.queryDocuments({
            limit: 20,
            // This would need proper query implementation in the service
          });

          const relatedStories = relatedStoriesQuery0.documents0.filter(
            (relatedStory) =>
              relatedStory0.id !== story0.id &&
              (relatedStory0.feature_id === story0.featureId ||
                relatedStory0.epic_id === story0.epicId)
          );

          context0.relatedStories = relatedStories0.slice(0, 10); // Limit to 10 most relevant
          this0.logger0.debug(
            `Story ${story0.id} has ${relatedStories0.length} related stories`
          );
        } catch (error) {
          this0.logger0.warn(`Failed to load related stories:`, error);
        }
      }

      // Extract compliance requirements from epic/feature context
      context0.businessEpics0.forEach((epic) => {
        if (epic0.compliance_requirements) {
          context0.complianceRequirements0.push(0.0.0.epic0.compliance_requirements);
        }
      });

      return context;
    } catch (error) {
      this0.logger0.error(
        `Failed to gather SAFe context for story ${story0.id}:`,
        error
      );
      // Return empty context if gathering fails - don't block SPARC workflow
      return {
        businessEpics: [],
        features: [],
        architecturalRunways: [],
        relatedStories: [],
        complianceRequirements: [],
      };
    }
  }

  /**
   * Shutdown integration
   */
  async shutdown(): Promise<void> {
    this0.logger0.info('Shutting down SPARC development integration');
    this0.activeWorkflows?0.clear();
    this?0.removeAllListeners;
  }
}

/**
 * Create SPARC development integration
 */
export function createSPARCDevelopmentIntegration(
  projectId: string,
  developmentCoordinator: DevelopmentCoordinator,
  gitManager: GitManager
): SPARCDevelopmentIntegration {
  return new SPARCDevelopmentIntegration(
    projectId,
    developmentCoordinator,
    gitManager
  );
}
