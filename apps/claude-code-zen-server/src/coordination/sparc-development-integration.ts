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
 * @since 2.3.0
 * @version 1.0.0
 */

import { EventEmitter } from 'node:events';
import { getLogger } from '@claude-zen/foundation'
import type { Logger } from '@claude-zen/foundation';
import { DevelopmentCoordinator, type SPARCPhase } from '@claude-zen/enterprise';
import { GitManager } from './git-manager';
import type { ProjectUserStory } from '../services/project/project-service';
import { architectureRunwayService, businessEpicService, featureService, storyService } from '../services/document';

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
 * are moved through development status changes (SAFe LPM).
 */
export class SPARCDevelopmentIntegration extends EventEmitter {
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
    this.logger = getLogger('SPARCKanbanIntegration');
    this.projectId = projectId;
    this.developmentCoordinator = developmentCoordinator;
    this.gitManager = gitManager;
  }

  /**
   * Initialize SPARC development integration
   */
  async initialize(): Promise<void> {
    this.logger.info(`Initializing SPARC development integration for project ${this.projectId}`);
    
    // Listen for development coordinator events
    this.developmentCoordinator.on('sparc:phase_changed', this.handleSPARCPhaseChange.bind(this));
    this.developmentCoordinator.on('sparc:workflow_completed', this.handleSPARCCompletion.bind(this));
    
    this.emit('sparc_development:initialized', { projectId: this.projectId });
  }

  /**
   * Handle story status change from development workflow
   */
  async handleStoryStatusChange(story: ProjectUserStory, previousStatus: string): Promise<void> {
    this.logger.debug(`Story ${story.id} status changed: ${previousStatus} → ${story.status}`);

    switch (story.status) {
      case 'in_progress':
        await this.startSPARCWorkflow(story);
        break;
      case 'backlog':
      case 'ready':
        await this.pauseSPARCWorkflow(story.id);
        break;
      case 'done':
        await this.completeSPARCWorkflow(story.id);
        break;
    }
  }

  /**
   * Start SPARC workflow when story enters "in_progress"
   */
  private async startSPARCWorkflow(story: ProjectUserStory): Promise<void> {
    // Check if workflow already exists
    if (this.activeWorkflows.has(story.id)) {
      this.logger.info(`Resuming existing SPARC workflow for story ${story.id}`);
      return;
    }

    try {
      // Gather SAFe-compliant context for SPARC workflow
      const sparcContext = await this.gatherSAFeContext(story);

      // Start SPARC workflow in development coordinator with rich context
      const taskId = await this.developmentCoordinator.startSPARCWorkflow({
        title: story.title,
        sparcPhase: 'specification',
        assignedAgents: story.assignedTo ? [story.assignedTo] : [],
        dependencies: story.dependencies,
        
        // SAFe-compliant context for SPARC phases (using existing services)
        solutionContext: {
          businessEpics: sparcContext.businessEpics,
          features: sparcContext.features,
          architecturalRunways: sparcContext.architecturalRunways,
          relatedStories: sparcContext.relatedStories,
          complianceRequirements: sparcContext.complianceRequirements
        }
      });

      // Create Git branch for the story
      const gitResult = await this.gitManager.createTaskBranch(taskId, story.title);
      if (!gitResult.success) {
        this.logger.error(`Failed to create Git branch for story ${story.id}:`, gitResult.message);
      }

      // Track workflow state
      const workflowState: SPARCWorkflowState = {
        storyId: story.id,
        taskId,
        currentPhase: 'specification',
        gitBranch: gitResult.data?.branchName || `feature/story-${story.id}`,
        startedAt: new Date(),
        lastActivity: new Date(),
        phaseCompletions: {
          specification: null,
          pseudocode: null,
          architecture: null,
          refinement: null,
          completion: null
        }
      };

      this.activeWorkflows.set(story.id, workflowState);

      this.logger.info(`Started SPARC workflow for story: ${story.title} (${story.id})`);
      this.emit('sparc_workflow:started', { storyId: story.id, taskId, phase: 'specification' });

    } catch (error) {
      this.logger.error(`Failed to start SPARC workflow for story ${story.id}:`, error);
      this.emit('sparc_workflow:error', { storyId: story.id, error });
    }
  }

  /**
   * Handle SPARC phase progression
   */
  private async handleSPARCPhaseChange(event: { taskId: string; phase: SPARCPhase }): Promise<void> {
    const workflow = this.findWorkflowByTaskId(event.taskId);
    if (!workflow) return;

    // Update workflow state
    workflow.currentPhase = event.phase;
    workflow.lastActivity = new Date();
    workflow.phaseCompletions[event.phase] = new Date();

    // Commit current phase to Git
    const gitResult = await this.gitManager.commitSPARCPhase(
      event.taskId,
      event.phase,
      `SPARC ${event.phase}: ${workflow.storyId}`
    );

    if (gitResult.success) {
      this.logger.info(`SPARC ${event.phase} phase committed for story ${workflow.storyId}`);
    }

    this.emit('sparc_workflow:phase_progressed', {
      storyId: workflow.storyId,
      taskId: event.taskId,
      phase: event.phase
    });
  }

  /**
   * Handle SPARC workflow completion
   */
  private async handleSPARCCompletion(event: { taskId: string }): Promise<void> {
    const workflow = this.findWorkflowByTaskId(event.taskId);
    if (!workflow) return;

    // Mark completion phase
    workflow.phaseCompletions.completion = new Date();
    workflow.lastActivity = new Date();

    this.logger.info(`SPARC workflow completed for story ${workflow.storyId}`);
    
    // Story should move to "review" status
    this.emit('sparc_workflow:completed', {
      storyId: workflow.storyId,
      taskId: event.taskId,
      suggestedNextStatus: 'review'
    });
  }

  /**
   * Pause SPARC workflow (story moved back to backlog/ready)
   */
  private async pauseSPARCWorkflow(storyId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(storyId);
    if (!workflow) return;

    this.logger.info(`Pausing SPARC workflow for story ${storyId}`);
    this.emit('sparc_workflow:paused', { storyId, currentPhase: workflow.currentPhase });
  }

  /**
   * Complete SPARC workflow (story moved to done)
   */
  private async completeSPARCWorkflow(storyId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(storyId);
    if (!workflow) return;

    // Final commit if needed
    if (workflow.currentPhase !== 'completion') {
      await this.gitManager.commitSPARCPhase(
        workflow.taskId,
        'completion',
        `SPARC completion: ${storyId} (force complete)`
      );
    }

    this.activeWorkflows.delete(storyId);
    this.logger.info(`SPARC workflow completed and removed for story ${storyId}`);
    
    this.emit('sparc_workflow:finalized', { storyId, taskId: workflow.taskId });
  }

  /**
   * Get current SPARC status for a story
   */
  getSPARCStatus(storyId: string): SPARCWorkflowState | null {
    return this.activeWorkflows.get(storyId) || null;
  }

  /**
   * Get all active SPARC workflows
   */
  getActiveWorkflows(): SPARCWorkflowState[] {
    return Array.from(this.activeWorkflows.values());
  }

  /**
   * Manually progress SPARC phase (if needed)
   */
  async progressSPARCPhase(storyId: string): Promise<void> {
    const workflow = this.activeWorkflows.get(storyId);
    if (!workflow) {
      throw new Error(`No active SPARC workflow for story ${storyId}`);
    }

    await this.developmentCoordinator.progressSPARCPhase(workflow.taskId);
  }

  /**
   * Helper to find workflow by task ID
   */
  private findWorkflowByTaskId(taskId: string): SPARCWorkflowState | null {
    for (const workflow of this.activeWorkflows.values()) {
      if (workflow.taskId === taskId) {
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
        complianceRequirements: []
      };

      // Get Business Epic context (if story has epicId)
      if (story.epicId) {
        try {
          const epic = await businessEpicService.getDocument(story.epicId);
          if (epic) {
            context.businessEpics.push(epic);
            this.logger.debug(`Story ${story.id} has business epic context: ${epic.title}`);
          }
        } catch (error) {
          this.logger.warn(`Failed to load business epic ${story.epicId}:`, error);
        }
      }

      // Get Feature context (if story has featureId)
      if (story.featureId) {
        try {
          const feature = await featureService.getDocument(story.featureId);
          if (feature) {
            context.features.push(feature);
            this.logger.debug(`Story ${story.id} has feature context: ${feature.title}`);
          }
        } catch (error) {
          this.logger.warn(`Failed to load feature ${story.featureId}:`, error);
        }
      }

      // Get Architectural Runway context (if story has runway dependencies)
      if (story.runwayDependencyIds && story.runwayDependencyIds.length > 0) {
        try {
          const runwayPromises = story.runwayDependencyIds.map(async (runwayId) => {
            try {
              return await architectureRunwayService.getDocument(runwayId);
            } catch (error) {
              this.logger.warn(`Failed to load runway ${runwayId}:`, error);
              return null;
            }
          });
          
          const runways = (await Promise.all(runwayPromises)).filter(runway => runway !== null);
          context.architecturalRunways.push(...runways);
          this.logger.debug(`Story ${story.id} has ${runways.length} architectural runway dependencies`);
        } catch (error) {
          this.logger.warn(`Failed to load architectural runways:`, error);
        }
      }

      // Get related stories from same feature/epic
      if (story.featureId || story.epicId) {
        try {
          const relatedStoriesQuery = await storyService.queryDocuments({
            limit: 20,
            // This would need proper query implementation in the service
          });
          
          const relatedStories = relatedStoriesQuery.documents.filter(relatedStory => 
            relatedStory.id !== story.id && (
              relatedStory.feature_id === story.featureId || 
              relatedStory.epic_id === story.epicId
            )
          );
          
          context.relatedStories = relatedStories.slice(0, 10); // Limit to 10 most relevant
          this.logger.debug(`Story ${story.id} has ${relatedStories.length} related stories`);
        } catch (error) {
          this.logger.warn(`Failed to load related stories:`, error);
        }
      }

      // Extract compliance requirements from epic/feature context
      context.businessEpics.forEach(epic => {
        if (epic.compliance_requirements) {
          context.complianceRequirements.push(...epic.compliance_requirements);
        }
      });

      return context;

    } catch (error) {
      this.logger.error(`Failed to gather SAFe context for story ${story.id}:`, error);
      // Return empty context if gathering fails - don't block SPARC workflow
      return {
        businessEpics: [],
        features: [],
        architecturalRunways: [],
        relatedStories: [],
        complianceRequirements: []
      };
    }
  }

  /**
   * Shutdown integration
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down SPARC development integration');
    this.activeWorkflows.clear();
    this.removeAllListeners();
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
  return new SPARCDevelopmentIntegration(projectId, developmentCoordinator, gitManager);
}