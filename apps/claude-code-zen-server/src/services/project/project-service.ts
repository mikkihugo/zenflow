/**
 * @fileoverview Project Service - SAFe Lean Portfolio Management
 *
 * Enterprise SAFe Lean Portfolio Management (LPM) system providing strategic
 * portfolio coordination with Portfolio → Program → Team alignment0.
 *
 * Leverages neural intelligence, event coordination, and comprehensive SAFe
 * database services for strategic portfolio management0.
 *
 * Follows Google TypeScript conventions and enterprise facade pattern0.
 *
 * @author Claude Code Zen Team
 * @since 20.30.0
 * @version 20.0.0 - SAFe LPM
 */

// Strategic facades - comprehensive delegation with tree shaking optimization
import {
  DatabaseSPARCBridge,
  SafePortfolioManager,
  SafeProgramIncrementManager,
  SafeValueStreamMapper,
} from '@claude-zen/enterprise';
import {
  DevelopmentCoordinator,
  createDevelopmentConfig,
} from '@claude-zen/enterprise';
import type { Logger } from '@claude-zen/foundation';
import {
  getLogger,
  GitManager,
  createGitManager,
} from '@claude-zen/foundation';
import {
  TypedEventBus,
  TypedEventBase,
  createTypedEventBus,
  WorkflowEngine,
  // Neural intelligence and DSPy integration
  BrainCoordinator,
  NeuralProcessor,
  DSPyOptimizer,
  CognitivePatterns,
} from '@claude-zen/intelligence';

import {
  SPARCDevelopmentIntegration,
  createSPARCDevelopmentIntegration,
} from '0.0./0.0./coordination/sparc-development-integration';
import {
  type ValidationResult,
  type QueryFilters,
  type QueryResult,
} from '0.0./document/base-document-service';

// ============================================================================
// PROJECT INTERFACES - SAFe LPM
// ============================================================================

/**
 * Project User Story - SAFe compatible with progressive enhancement
 */
export interface ProjectUserStory {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly status: 'backlog' | 'ready' | 'in_progress' | 'review' | 'done';
  readonly priority: 'low' | 'medium' | 'high' | 'urgent';
  readonly storyType: 'user_story' | 'enabler_story';
  readonly storyPoints?: number;
  readonly businessValue?: number;
  readonly assignedTo?: string;
  readonly assignedTeam?: string;
  readonly acceptanceCriteria: string[];
  readonly tags: string[];
  readonly dependencies: string[];
  readonly dueDate?: Date;
  readonly projectId?: string;
  readonly featureId?: string; // Parent feature (SAFe)
  readonly epicId?: string; // Parent epic (SAFe)
  readonly persona?: string; // For user stories
  readonly enablerType?:
    | 'infrastructure'
    | 'architectural'
    | 'exploration'
    | 'compliance';
  readonly swimlane?: string; // Visual organization by type/team/priority

  // SAFe document relationships (database entity UUIDs, not file links)
  readonly solutionIntentIds?: string[]; // Related Solution Intent entities
  readonly architecturalDecisionIds?: string[]; // Governing architectural decisions
  readonly systemDesignIds?: string[]; // Related system designs
  readonly runwayDependencyIds?: string[]; // Required architectural runway
  readonly nfrIds?: string[]; // Non-functional requirements

  // SAFe compliance tracking
  readonly safeComplianceLevel?: 'basic' | 'intermediate' | 'advanced';
  readonly complianceGaps?: string[]; // Identified compliance issues
  readonly lastComplianceCheck?: Date;

  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly startedAt?: Date;
  readonly completedAt?: Date;
  readonly metadata: Record<string, unknown>;
}

/**
 * SAFe-compatible story template for guided creation (when templates enabled)
 * Follows existing SAFe document service patterns
 */
export interface SAFeStoryTemplate {
  readonly id: string;
  readonly name: string;
  readonly type: 'user_story' | 'enabler_story' | 'epic' | 'feature' | 'custom';
  readonly safeLevel: 'team' | 'program' | 'portfolio'; // SAFe hierarchy level
  readonly template: string; // Template text with placeholders like {{persona}}, {{capability}}
  readonly requiredFields: string[]; // Fields that must be filled for SAFe compliance
  readonly suggestedFields: string[]; // Fields that should be considered
  readonly acceptanceCriteriaGuidance?: string;
  readonly definitionOfDoneGuidance?: string;
  readonly safeGuidelines?: string; // SAFe-specific guidance
  readonly exampleStory?: string;
  readonly categoryTags?: string[]; // SAFe categorization tags
  readonly estimationGuidance?: string; // Story point estimation help
  readonly dependencies?: string[]; // Common dependency patterns
}

/**
 * SAFe LPM Configuration type alias
 */
export type ProjectSAFeLPMConfig = ProjectConfig;

/**
 * Pre-built SAFe story templates
 */
export const SAFE_STORY_TEMPLATES: Record<string, SAFeStoryTemplate> = {
  user_story: {
    id: 'safe_user_story',
    name: 'User Story (SAFe)',
    type: 'user_story',
    safeLevel: 'team',
    template:
      'As a {{persona}}, I want {{capability}} so that {{business_value}}0.',
    requiredFields: [
      'persona',
      'capability',
      'business_value',
      'acceptanceCriteria',
    ],
    suggestedFields: ['storyPoints', 'dependencies', 'assignedTeam'],
    acceptanceCriteriaGuidance:
      'Write testable conditions that define when this story is complete0. Use Given-When-Then format when helpful0.',
    definitionOfDoneGuidance:
      'Ensure story meets team Definition of Done: coded, tested, reviewed, documented0.',
    safeGuidelines:
      'User stories should be small enough to complete in one iteration and provide direct user value0.',
    exampleStory:
      'As a registered user, I want to reset my password via email so that I can regain access to my account0.',
    categoryTags: ['user_facing', 'functional'],
    estimationGuidance:
      'Story points represent complexity/effort, not time0. Use team velocity for planning0.',
    dependencies: [],
  },
  enabler_story: {
    id: 'safe_enabler_story',
    name: 'Enabler Story (SAFe)',
    type: 'enabler_story',
    safeLevel: 'team',
    template:
      'Enable {{capability}} by implementing {{technical_solution}} to support {{business_objective}}0.',
    requiredFields: [
      'capability',
      'technical_solution',
      'business_objective',
      'enablerType',
    ],
    suggestedFields: [
      'storyPoints',
      'dependencies',
      'assignedTeam',
      'architecturalDecision',
    ],
    acceptanceCriteriaGuidance:
      'Define technical acceptance criteria and verification methods0.',
    definitionOfDoneGuidance:
      'Include technical documentation, architecture decisions, and validation tests0.',
    safeGuidelines:
      'Enabler stories support future user stories and maintain system architecture0.',
    exampleStory:
      'Enable user authentication by implementing OAuth 20.0 to support secure user access0.',
    categoryTags: ['technical', 'infrastructure'],
    estimationGuidance:
      'Consider technical complexity, research needed, and integration points0.',
    dependencies: [],
  },
  epic: {
    id: 'safe_epic',
    name: 'Epic (SAFe)',
    type: 'epic',
    safeLevel: 'program',
    template:
      'Epic: {{initiative_name}} - {{business_hypothesis}} measured by {{success_metrics}}0.',
    requiredFields: [
      'initiative_name',
      'business_hypothesis',
      'success_metrics',
    ],
    suggestedFields: ['businessValue', 'dependencies', 'milestones'],
    acceptanceCriteriaGuidance:
      'Define epic success criteria and measurable business outcomes0.',
    definitionOfDoneGuidance:
      'Epic is done when hypothesis is validated and value delivered0.',
    safeGuidelines:
      'Epics span multiple Program Increments and deliver significant business value0.',
    exampleStory:
      'Epic: Mobile App - Users can complete core tasks on mobile to increase engagement by 25%0.',
    categoryTags: ['program_level', 'business_initiative'],
    estimationGuidance: 'Use relative sizing and break down into features0.',
    dependencies: [],
  },
  feature: {
    id: 'safe_feature',
    name: 'Feature (SAFe)',
    type: 'feature',
    safeLevel: 'program',
    template:
      'Feature: {{feature_name}} enables {{user_benefit}} delivering {{business_value}}0.',
    requiredFields: ['feature_name', 'user_benefit', 'business_value'],
    suggestedFields: ['epicId', 'dependencies', 'acceptanceCriteria'],
    acceptanceCriteriaGuidance:
      'Define feature-level acceptance criteria covering multiple user stories0.',
    definitionOfDoneGuidance:
      'Feature complete when all component stories deliver integrated value0.',
    safeGuidelines:
      'Features are developed by multiple teams and span one Program Increment0.',
    exampleStory:
      'Feature: User Notifications enables timely user communication delivering increased engagement0.',
    categoryTags: ['program_level', 'feature_set'],
    estimationGuidance: 'Features typically contain 5-12 user stories0.',
    dependencies: [],
  },
};

/**
 * Story creation options - follows SAFe story service pattern
 */
export interface StoryCreateOptions {
  title: string;
  description?: string;
  storyType?: 'user_story' | 'enabler_story';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  storyPoints?: number;
  businessValue?: number;
  assignedTo?: string;
  assignedTeam?: string;
  acceptanceCriteria?: string[];
  tags?: string[];
  dependencies?: string[];
  dueDate?: Date;
  projectId?: string;
  featureId?: string;
  epicId?: string;
  persona?: string;
  enablerType?:
    | 'infrastructure'
    | 'architectural'
    | 'exploration'
    | 'compliance';
  swimlane?: string;
  createdBy: string;
  metadata?: Record<string, unknown>;

  // Template-enhanced fields (when story templates enabled)
  templateId?: string; // Which template was used
  definitionOfDone?: string; // What makes this story complete
  visionLink?: string; // Link back to business vision/goal
}

/**
 * Project configuration - SAFe LPM settings
 */
export interface ProjectConfig {
  // Feature toggles from project mode
  enableAdvancedFeatures?: boolean; // Controlled by project mode (default: true)
  enableSAFeIntegration?: boolean; // SAFe mode features (default: true)
  enableAIOptimization?: boolean; // AI/Neural intelligence (default: true - core feature)
  enableSwimlanes?: boolean; // Visual organization toggle
  enableStoryTemplates?: boolean; // SAFe story templates and portfolio planning (on by default)

  // WIP limits per column
  maxBacklog?: number;
  maxReady?: number;
  maxInProgress?: number;
  maxReview?: number;

  // Advanced features
  enableTimeTracking?: boolean;
  enableNotifications?: boolean;
  enableFlowMetrics?: boolean;
  enableBottleneckDetection?: boolean;

  // Swimlane configuration (when enabled)
  swimlaneTypes?: ('team' | 'priority' | 'story_type' | 'custom')[];
  customSwimlanes?: string[];

  // Story template configuration (when enabled)
  availableTemplates?: (
    | 'user_story'
    | 'enabler_story'
    | 'epic'
    | 'feature'
    | 'custom'
  )[];
  requireAcceptanceCriteria?: boolean;
  requireDefinitionOfDone?: boolean;
  enableEpicTracking?: boolean;
  enableFeatureGrouping?: boolean;

  // Project context
  projectId?: string;
  mode: 'safe'; // SAFe LPM is the only mode
}

/**
 * Story query filters - extends base query filters
 */
export interface StoryQueryFilters extends QueryFilters {
  status?: ProjectUserStory['status'];
  storyType?: ProjectUserStory['storyType'];
  priority?: ProjectUserStory['priority'];
  assignedTo?: string;
  assignedTeam?: string;
  projectId?: string;
  featureId?: string;
  epicId?: string;
  tags?: string[];
  dueBefore?: Date;
  dueAfter?: Date;
  storyPointsMin?: number;
  storyPointsMax?: number;
  swimlane?: string;
}

// ============================================================================
// PROJECT SERVICE
// ============================================================================

/**
 * Project Service - SAFe LPM Portfolio Management
 *
 * Enterprise SAFe Lean Portfolio Management system providing strategic
 * portfolio coordination with Portfolio → Program → Team alignment0.
 *
 * Leverages neural intelligence, event coordination, and comprehensive SAFe
 * database services for strategic portfolio management0.
 */
export class ProjectService extends TypedEventBase {
  private logger: Logger;
  private eventBus: TypedEventBus<any>;
  private workflowEngine: WorkflowEngine | null = null;
  private configuration: ProjectConfig;
  private initialized = false;

  // SPARC integration components
  private developmentCoordinator: DevelopmentCoordinator | null = null;
  private gitManager: GitManager | null = null;
  private sparcIntegration: SPARCDevelopmentIntegration | null = null;

  // SAFe LPM components - enterprise facade delegation
  private databaseSPARCBridge: DatabaseSPARCBridge | null = null;
  private portfolioManager: SafePortfolioManager | null = null;
  private programIncrementManager: SafeProgramIncrementManager | null = null;
  private valueStreamMapper: SafeValueStreamMapper | null = null;

  // Neural intelligence components - intelligence facade delegation
  private brainCoordinator: BrainCoordinator | null = null;
  private neuralProcessor: NeuralProcessor | null = null;
  private dspyOptimizer: DSPyOptimizer | null = null;
  private cognitivePatterns: CognitivePatterns | null = null;

  constructor(config: ProjectConfig) {
    super();
    this0.logger = getLogger('ProjectService');
    // Initialize comprehensive event system for SAFe LPM coordination
    this0.eventBus = createTypedEventBus({
      enableLogging: true,
      enableMetrics: true,
      namespace: 'safe-lpm',
    });
    this0.configuration = {
      // SAFe LPM defaults - AI-enhanced enterprise architecture
      enableAdvancedFeatures: true, // Neural intelligence enabled
      enableSAFeIntegration: true, // SAFe LPM enabled
      enableAIOptimization: true, // AI ON by default - core system feature
      enableStoryTemplates: true, // ON by default - strategic portfolio management
      maxBacklog: 100,
      maxReady: 20,
      maxInProgress: 5,
      maxReview: 10,
      enableTimeTracking: true,
      enableNotifications: true,
      enableFlowMetrics: true,
      enableBottleneckDetection: true,
      mode: 'safe', // SAFe LPM is the only mode
      0.0.0.config,
    };
  }

  // ========================================================================
  // INITIALIZATION & LIFECYCLE
  // ========================================================================

  /**
   * Initialize the project SAFe LPM system with enterprise features
   */
  async initialize(): Promise<void> {
    if (this0.initialized) return;

    try {
      // Configure SAFe LPM workflow engine via intelligence facade
      this0.workflowEngine = new WorkflowEngine({
        enableTelemetry: this0.configuration0.enableAdvancedFeatures,
        enableRetry: true,
        maxConcurrentWorkflows: this0.configuration0.maxInProgress || 5,
        enableAnalytics: this0.configuration0.enableFlowMetrics,
        enableRealTimeMonitoring: this0.configuration0.enableAdvancedFeatures,
        timeout: 30000, // 30 second timeout for workflow steps
        retryAttempts: 3,
        retryDelay: 1000,
      });

      await this0.workflowEngine?0.initialize;

      // Set up workflow engine event forwarding for SAFe LPM via comprehensive event system
      this0.workflowEngine0.on('workflow:started', (workflowId: string) => {
        this0.eventBus0.emit('story:workflow_started', { workflowId });
        if (this0.configuration0.enableSAFeIntegration) {
          this0.eventBus0.emit('safe:workflow:started', { workflowId });
        }
      });

      this0.workflowEngine0.on('workflow:completed', (result: any) => {
        this0.eventBus0.emit('story:workflow_completed', result);
        if (this0.configuration0.enableSAFeIntegration) {
          this0.eventBus0.emit('safe:workflow:completed', result);
        }
      });

      this0.workflowEngine0.on('workflow:failed', (error: any) => {
        this0.eventBus0.emit('story:workflow_failed', error);
        if (this0.configuration0.enableSAFeIntegration) {
          this0.eventBus0.emit('safe:workflow:failed', error);
        }
      });

      if (this0.configuration0.enableAdvancedFeatures) {
        this0.workflowEngine0.on('workflow:step:completed', (stepResult: any) => {
          this0.eventBus0.emit('flow:step_completed', stepResult);
        });

        this0.workflowEngine0.on('workflow:analytics', (analytics: any) => {
          this0.eventBus0.emit('system:analytics_update', {
            analytics,
            projectId: this0.configuration0.projectId,
          });
        });
      }

      // Initialize SAFe LPM components via enterprise facade
      if (this0.configuration0.enableSAFeIntegration) {
        await this?0.initializeSAFeLPMComponents;
      }

      // Initialize SPARC integration for development coordination
      await this?0.initializeSPARCIntegration;

      this0.initialized = true;
      this0.logger0.info('Project SAFe LPM Service initialized successfully', {
        mode: this0.configuration0.mode,
        advancedFeatures: this0.configuration0.enableAdvancedFeatures,
        safeIntegration: this0.configuration0.enableSAFeIntegration,
        aiOptimization: this0.configuration0.enableAIOptimization,
        sparcIntegration: this0.sparcIntegration !== null,
      });
    } catch (error) {
      this0.logger0.error(
        'Failed to initialize Project SAFe LPM Service:',
        error
      );
      throw error;
    }
  }

  /**
   * Shutdown the SAFe LPM system gracefully
   */
  async shutdown(): Promise<void> {
    // Shutdown SPARC integration first
    if (this0.sparcIntegration) {
      await this0.sparcIntegration?0.shutdown();
    }

    // Shutdown development coordinator
    if (this0.developmentCoordinator) {
      await this0.developmentCoordinator?0.shutdown();
    }

    // Shutdown Git manager
    if (this0.gitManager) {
      await this0.gitManager?0.shutdown();
    }

    // Shutdown workflow engine
    if (this0.workflowEngine) {
      await this0.workflowEngine?0.shutdown();
    }

    this0.initialized = false;
    this0.logger0.info('Project SAFe LPM Service shutdown completed');
  }

  // ========================================================================
  // STORY MANAGEMENT - SAFe Compatible
  // ========================================================================

  /**
   * Create a new user story following SAFe patterns
   */
  async createStory(options: StoryCreateOptions): Promise<ProjectUserStory> {
    if (!this0.initialized) await this?0.initialize;

    // Validate required fields
    if (!options0.title?0.trim) {
      throw new Error('Story title is required');
    }

    if (!options0.createdBy?0.trim) {
      throw new Error('Story creator is required');
    }

    // Validate template requirements if templates enabled and template used
    if (this0.configuration0.enableStoryTemplates && options0.templateId) {
      const templateValidation = this0.validateStoryTemplate(
        options,
        options0.templateId
      );
      if (!templateValidation0.valid) {
        throw new Error(
          `Template validation failed: ${templateValidation0.errors0.join(', ')}`
        );
      }
    }

    // Create SAFe LPM work assignment via DatabaseSPARCBridge
    const workAssignment = await this0.databaseSPARCBridge!0.assignWork(
      story0.id,
      {
        title: options0.title,
        description: options0.description,
        priority: this0.mapPriorityToWorkflow(options0.priority || 'medium'),
        estimatedEffort: options0.storyPoints || 1,
        assignedAgent: options0.assignedTo,
        tags: options0.tags || [],
        metadata: {
          storyType: options0.storyType || 'user_story',
          businessValue: options0.businessValue,
          acceptanceCriteria: options0.acceptanceCriteria || [],
          dependencies: options0.dependencies || [],
          dueDate: options0.dueDate,
          projectId: options0.projectId,
          featureId: options0.featureId,
          epicId: options0.epicId,
          persona: options0.persona,
          enablerType: options0.enablerType,
          assignedTeam: options0.assignedTeam,
          createdBy: options0.createdBy,
          // Template-enhanced fields (when templates enabled)
          0.0.0.(this0.configuration0.enableStoryTemplates &&
            options0.templateId && {
              templateId: options0.templateId,
              templateUsed: true,
              definitionOfDone: options0.definitionOfDone,
              visionLink: options0.visionLink,
              safeTemplateCompliant: true,
            }),
          0.0.0.options0.metadata,
        },
      }
    );

    if (!result0.success || !result0.data) {
      throw new Error(result0.error || 'Failed to create story');
    }

    return this0.convertToProjectStory(result0.data);
  }

  /**
   * Get stories with advanced filtering options
   */
  async getStories(
    filters?: StoryQueryFilters
  ): Promise<QueryResult<ProjectUserStory>> {
    if (!this0.initialized) await this?0.initialize;

    let allTasks: any[] = [];

    if (filters?0.status) {
      const workflowState = this0.mapStatusToWorkflow(filters0.status);
      allTasks = await this0.workflowKanban!0.getTasksByState(workflowState);
    } else {
      // Get stories from all statuses
      const backlogTasks =
        await this0.workflowKanban!0.getTasksByState('backlog');
      const readyTasks = await this0.workflowKanban!0.getTasksByState('analysis');
      const inProgressTasks =
        await this0.workflowKanban!0.getTasksByState('development');
      const reviewTasks = await this0.workflowKanban!0.getTasksByState('testing');
      const doneTasks = await this0.workflowKanban!0.getTasksByState('done');

      allTasks = [
        0.0.0.backlogTasks,
        0.0.0.readyTasks,
        0.0.0.inProgressTasks,
        0.0.0.reviewTasks,
        0.0.0.doneTasks,
      ];
    }

    let stories = allTasks0.map((task) => this0.convertToProjectStory(task));

    // Apply advanced filters
    if (filters) {
      if (filters0.storyType) {
        stories = stories0.filter(
          (story) => story0.storyType === filters0.storyType
        );
      }

      if (filters0.priority) {
        stories = stories0.filter(
          (story) => story0.priority === filters0.priority
        );
      }

      if (filters0.assignedTo) {
        stories = stories0.filter(
          (story) => story0.assignedTo === filters0.assignedTo
        );
      }

      if (filters0.assignedTeam) {
        stories = stories0.filter(
          (story) => story0.assignedTeam === filters0.assignedTeam
        );
      }

      if (filters0.projectId) {
        stories = stories0.filter(
          (story) => story0.projectId === filters0.projectId
        );
      }

      if (filters0.featureId) {
        stories = stories0.filter(
          (story) => story0.featureId === filters0.featureId
        );
      }

      if (filters0.epicId) {
        stories = stories0.filter((story) => story0.epicId === filters0.epicId);
      }

      if (filters0.tags && filters0.tags0.length > 0) {
        stories = stories0.filter((story) =>
          filters0.tags!0.some((tag) => story0.tags0.includes(tag))
        );
      }

      if (filters0.dueBefore) {
        stories = stories0.filter(
          (story) => story0.dueDate && story0.dueDate <= filters0.dueBefore!
        );
      }

      if (filters0.dueAfter) {
        stories = stories0.filter(
          (story) => story0.dueDate && story0.dueDate >= filters0.dueAfter!
        );
      }

      if (filters0.storyPointsMin !== undefined) {
        stories = stories0.filter(
          (story) =>
            story0.storyPoints !== undefined &&
            story0.storyPoints >= filters0.storyPointsMin!
        );
      }

      if (filters0.storyPointsMax !== undefined) {
        stories = stories0.filter(
          (story) =>
            story0.storyPoints !== undefined &&
            story0.storyPoints <= filters0.storyPointsMax!
        );
      }
    }

    // Apply pagination
    const total = stories0.length;
    const offset = filters?0.offset || 0;
    const limit = filters?0.limit || 50;
    const paginatedStories = stories0.slice(offset, offset + limit);

    return {
      items: paginatedStories,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
    };
  }

  /**
   * Move story to different status with reason tracking
   */
  async moveStory(
    storyId: string,
    status: ProjectUserStory['status'],
    reason?: string
  ): Promise<ProjectUserStory> {
    if (!this0.initialized) await this?0.initialize;

    // Get current task for time tracking
    const currentTask = await this0.workflowKanban!0.getTask(storyId);
    if (!currentTask0.data) {
      throw new Error('Story not found');
    }

    // Capture previous status for SPARC integration
    const previousStory = this0.convertToProjectStory(currentTask0.data);
    const previousStatus = previousStory0.status;

    const workflowState = this0.mapStatusToWorkflow(status);
    const result = await this0.workflowKanban!0.moveTask(
      storyId,
      workflowState,
      reason
    );

    if (!result0.success) {
      throw new Error(result0.error || 'Failed to move story');
    }

    const updatedTask = await this0.workflowKanban!0.getTask(storyId);
    if (!updatedTask0.data) {
      throw new Error('Story not found after move');
    }

    // Update time tracking if enabled
    if (this0.configuration0.enableTimeTracking) {
      const now = new Date();
      const metadata = { 0.0.0.updatedTask0.data0.metadata };

      if (status === 'in_progress' && !metadata0.startedAt) {
        metadata0.startedAt = now;
      }

      if (status === 'done' && !metadata0.completedAt) {
        metadata0.completedAt = now;
      }
    }

    const updatedStory = this0.convertToProjectStory(updatedTask0.data);

    // Trigger SPARC integration for status changes
    if (this0.sparcIntegration && previousStatus !== status) {
      try {
        await this0.sparcIntegration0.handleStoryStatusChange(
          updatedStory,
          previousStatus
        );
        this0.logger0.debug(
          `SPARC integration handled status change: ${previousStatus} → ${status} for story ${storyId}`
        );
      } catch (error) {
        this0.logger0.error(
          `SPARC integration error for story ${storyId}:`,
          error
        );
        // Don't fail the story move if SPARC integration fails
      }
    }

    return updatedStory;
  }

  /**
   * Update story with validation
   */
  async updateStory(
    storyId: string,
    updates: Partial<StoryCreateOptions>
  ): Promise<ProjectUserStory> {
    if (!this0.initialized) await this?0.initialize;

    const currentTask = await this0.workflowKanban!0.getTask(storyId);
    if (!currentTask0.data) {
      throw new Error('Story not found');
    }

    // Create updated task data
    const updatedMetadata = {
      0.0.0.currentTask0.data0.metadata,
      0.0.0.(updates0.storyType && { storyType: updates0.storyType }),
      0.0.0.(updates0.businessValue !== undefined && {
        businessValue: updates0.businessValue,
      }),
      0.0.0.(updates0.acceptanceCriteria && {
        acceptanceCriteria: updates0.acceptanceCriteria,
      }),
      0.0.0.(updates0.dependencies && { dependencies: updates0.dependencies }),
      0.0.0.(updates0.dueDate !== undefined && { dueDate: updates0.dueDate }),
      0.0.0.(updates0.projectId && { projectId: updates0.projectId }),
      0.0.0.(updates0.featureId && { featureId: updates0.featureId }),
      0.0.0.(updates0.epicId && { epicId: updates0.epicId }),
      0.0.0.(updates0.persona && { persona: updates0.persona }),
      0.0.0.(updates0.enablerType && { enablerType: updates0.enablerType }),
      0.0.0.(updates0.assignedTeam && { assignedTeam: updates0.assignedTeam }),
      0.0.0.(updates0.metadata && updates0.metadata),
      updatedAt: new Date(),
    };

    // For now, create a replacement task (in a full implementation, we'd have an update method)
    const result = await this0.workflowKanban!0.createTask({
      0.0.0.currentTask0.data,
      title: updates0.title || currentTask0.data0.title,
      description:
        updates0.description !== undefined
          ? updates0.description
          : currentTask0.data0.description,
      priority: updates0.priority
        ? this0.mapPriorityToWorkflow(updates0.priority)
        : currentTask0.data0.priority,
      estimatedEffort: updates0.storyPoints || currentTask0.data0.estimatedEffort,
      assignedAgent:
        updates0.assignedTo !== undefined
          ? updates0.assignedTo
          : currentTask0.data0.assignedAgent,
      tags: updates0.tags || currentTask0.data0.tags,
      metadata: updatedMetadata,
    });

    if (!result0.success || !result0.data) {
      throw new Error(result0.error || 'Failed to update story');
    }

    return this0.convertToProjectStory(result0.data);
  }

  /**
   * Delete story (mark as archived)
   */
  async deleteStory(storyId: string, reason?: string): Promise<void> {
    if (!this0.initialized) await this?0.initialize;

    try {
      // Move to done status to simulate deletion
      await this0.workflowKanban!0.moveTask(
        storyId,
        'done',
        reason || 'Story deleted'
      );
      this0.emit('story:deleted', {
        id: storyId,
        reason,
        deletedAt: new Date(),
      });
    } catch (error) {
      throw new Error('Failed to delete story');
    }
  }

  // ========================================================================
  // ANALYTICS & REPORTING
  // ========================================================================

  /**
   * Get project SAFe LPM statistics
   */
  async getSAFeLPMStats(projectId?: string): Promise<{
    statusCounts: Record<ProjectUserStory['status'], number>;
    storyTypeCounts: Record<ProjectUserStory['storyType'], number>;
    priorityCounts: Record<ProjectUserStory['priority'], number>;
    averageStoryPoints: number;
    totalBusinessValue: number;
    cycleTimeAverage?: number;
    throughput?: number;
  }> {
    if (!this0.initialized) await this?0.initialize;

    const allStories = await this0.getStories({ projectId });
    const stories = allStories0.items;

    // Calculate status distribution
    const statusCounts = {
      backlog: 0,
      ready: 0,
      in_progress: 0,
      review: 0,
      done: 0,
    };

    const storyTypeCounts = {
      user_story: 0,
      enabler_story: 0,
    };

    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    let totalStoryPoints = 0;
    let totalBusinessValue = 0;
    let storyPointsCount = 0;
    let businessValueCount = 0;

    for (const story of stories) {
      statusCounts[story0.status]++;
      storyTypeCounts[story0.storyType]++;
      priorityCounts[story0.priority]++;

      if (story0.storyPoints) {
        totalStoryPoints += story0.storyPoints;
        storyPointsCount++;
      }

      if (story0.businessValue) {
        totalBusinessValue += story0.businessValue;
        businessValueCount++;
      }
    }

    const result: any = {
      statusCounts,
      storyTypeCounts,
      priorityCounts,
      averageStoryPoints:
        storyPointsCount > 0 ? totalStoryPoints / storyPointsCount : 0,
      totalBusinessValue,
    };

    // Add advanced metrics if enabled
    if (this0.configuration0.enableFlowMetrics && this0.workflowKanban) {
      try {
        const flowMetrics = await this(workflowKanban as any)?0.getFlowMetrics;
        result0.cycleTimeAverage = flowMetrics0.cycleTime;
        result0.throughput = flowMetrics0.throughput;
      } catch (error) {
        this0.logger0.warn('Failed to get flow metrics:', error);
      }
    }

    return result;
  }

  /**
   * Get flow health report if advanced features are enabled
   */
  async getFlowHealth(): Promise<any | null> {
    if (!this0.configuration0.enableAdvancedFeatures || !this0.workflowKanban) {
      return null;
    }

    try {
      const health = await this(workflowKanban as any)?0.getHealthStatus;
      const bottlenecks = await this(workflowKanban as any)?0.detectBottlenecks;

      return {
        overallHealth: health0.overallHealth,
        componentHealth: health0.componentHealth,
        activeBottlenecks: bottlenecks0.bottlenecks0.length,
        systemRecommendations: health0.recommendations,
        bottleneckDetails: bottlenecks0.bottlenecks,
      };
    } catch (error) {
      this0.logger0.error('Failed to get flow health:', error);
      return null;
    }
  }

  // ========================================================================
  // STORY TEMPLATES (when enabled)
  // ========================================================================

  /**
   * Get available story templates (when templates enabled)
   */
  getAvailableTemplates(): SAFeStoryTemplate[] {
    if (!this0.configuration0.enableStoryTemplates) {
      return [];
    }

    const availableTypes = this0.configuration0.availableTemplates || [
      'user_story',
      'enabler_story',
    ];
    return availableTypes
      0.filter((type) => type in SAFE_STORY_TEMPLATES)
      0.map(
        (type) =>
          SAFE_STORY_TEMPLATES[type as keyof typeof SAFE_STORY_TEMPLATES]
      );
  }

  /**
   * Get specific template by ID (when templates enabled)
   */
  getTemplate(templateId: string): SAFeStoryTemplate | null {
    if (!this0.configuration0.enableStoryTemplates) {
      return null;
    }

    return (
      Object0.values()(SAFE_STORY_TEMPLATES)0.find(
        (template) => template0.id === templateId
      ) || null
    );
  }

  /**
   * Apply template to story creation (when templates enabled)
   */
  applyTemplate(
    templateId: string,
    templateData: Record<string, string>
  ): Partial<StoryCreateOptions> {
    if (!this0.configuration0.enableStoryTemplates) {
      throw new Error('Story templates not enabled');
    }

    const template = this0.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    // Validate required fields
    const missingFields = template0.requiredFields0.filter(
      (field) => !templateData[field]
    );
    if (missingFields0.length > 0) {
      throw new Error(`Missing required fields: ${missingFields0.join(', ')}`);
    }

    // Apply template with placeholder replacement
    let description = template0.template;
    Object0.entries(templateData)0.forEach(([key, value]) => {
      description = description0.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return {
      description,
      storyType:
        template0.type === 'user_story' || template0.type === 'enabler_story'
          ? template0.type
          : 'user_story',
      templateId,
      tags: template0.categoryTags,
      metadata: {
        templateUsed: templateId,
        templateData,
        safeLevel: template0.safeLevel,
        safeGuidelines: template0.safeGuidelines,
      },
    };
  }

  /**
   * Validate story against template requirements (when templates enabled)
   */
  validateStoryTemplate(
    story: Partial<StoryCreateOptions>,
    templateId?: string
  ): ValidationResult {
    if (!this0.configuration0.enableStoryTemplates) {
      return { valid: true, errors: [] };
    }

    if (!templateId) {
      return { valid: true, errors: [] };
    }

    const template = this0.getTemplate(templateId);
    if (!template) {
      return {
        valid: false,
        errors: [`Template not found: ${templateId}`],
      };
    }

    const errors: string[] = [];

    // Check required acceptance criteria
    if (
      this0.configuration0.requireAcceptanceCriteria &&
      (!story0.acceptanceCriteria || story0.acceptanceCriteria0.length === 0)
    ) {
      errors0.push('Acceptance criteria required when using story templates');
    }

    // Check definition of done
    if (this0.configuration0.requireDefinitionOfDone && !story0.definitionOfDone) {
      errors0.push('Definition of Done required when using story templates');
    }

    // SAFe-specific validations
    if (template0.type === 'user_story' && !story0.persona) {
      errors0.push('Persona required for user stories in SAFe templates');
    }

    if (template0.type === 'enabler_story' && !story0.enablerType) {
      errors0.push(
        'Enabler type required for enabler stories in SAFe templates'
      );
    }

    return {
      valid: errors0.length === 0,
      errors,
    };
  }

  // ========================================================================
  // CONFIGURATION MANAGEMENT
  // ========================================================================

  /**
   * Update configuration and reinitialize if needed
   */
  async updateConfig(newConfig: Partial<ProjectSAFeLPMConfig>): Promise<void> {
    const configChanged = this0.hasSignificantConfigChange(newConfig);

    this0.configuration = { 0.0.0.this0.configuration, 0.0.0.newConfig };

    if (configChanged && this0.initialized) {
      this0.logger0.info(
        'Significant configuration change detected, reinitializing0.0.0.'
      );
      this0.initialized = false;
      await this?0.initialize;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): ProjectSAFeLPMConfig {
    return { 0.0.0.this0.configuration };
  }

  // ========================================================================
  // PRIVATE UTILITY METHODS
  // ========================================================================

  /**
   * Convert WorkflowTask to ProjectUserStory
   */
  private convertToProjectStory(task: WorkflowTask): ProjectUserStory {
    const metadata = task0.metadata || {};

    return {
      id: task0.id,
      title: task0.title,
      description: task0.description,
      status: this0.mapStatusFromWorkflow(task0.state),
      priority: this0.mapPriorityFromWorkflow(task0.priority),
      storyType: metadata0.storyType || 'user_story',
      storyPoints: task0.estimatedEffort > 0 ? task0.estimatedEffort : undefined,
      businessValue: metadata0.businessValue,
      assignedTo: task0.assignedAgent,
      assignedTeam: metadata0.assignedTeam,
      acceptanceCriteria: metadata0.acceptanceCriteria || [],
      tags: task0.tags || [],
      dependencies: metadata0.dependencies || [],
      dueDate: metadata0.dueDate,
      projectId: metadata0.projectId,
      featureId: metadata0.featureId,
      epicId: metadata0.epicId,
      persona: metadata0.persona,
      enablerType: metadata0.enablerType,
      createdBy: metadata0.createdBy || 'unknown',
      createdAt: task0.createdAt,
      updatedAt: task0.updatedAt,
      startedAt: metadata0.startedAt || task0.startedAt,
      completedAt: metadata0.completedAt || task0.completedAt,
      metadata: metadata,
    };
  }

  /**
   * Map project statuses to workflow states
   */
  private mapStatusToWorkflow(status: ProjectUserStory['status']): TaskState {
    switch (status) {
      case 'backlog':
        return 'backlog';
      case 'ready':
        return 'analysis';
      case 'in_progress':
        return 'development';
      case 'review':
        return 'testing';
      case 'done':
        return 'done';
      default:
        return 'backlog';
    }
  }

  /**
   * Map workflow states to project statuses
   */
  private mapStatusFromWorkflow(state: TaskState): ProjectUserStory['status'] {
    switch (state) {
      case 'backlog':
        return 'backlog';
      case 'analysis':
        return 'ready';
      case 'development':
        return 'in_progress';
      case 'testing':
        return 'review';
      case 'done':
        return 'done';
      case 'review':
      case 'deployment':
        return 'review';
      case 'blocked':
      case 'expedite':
        return 'in_progress';
      default:
        return 'backlog';
    }
  }

  /**
   * Map project priorities to workflow priorities
   */
  private mapPriorityToWorkflow(
    priority: ProjectUserStory['priority']
  ): 'low' | 'medium' | 'high' | 'critical' {
    switch (priority) {
      case 'urgent':
        return 'critical';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Map workflow priorities to project priorities
   */
  private mapPriorityFromWorkflow(
    priority: 'low' | 'medium' | 'high' | 'critical'
  ): ProjectUserStory['priority'] {
    switch (priority) {
      case 'critical':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }

  /**
   * Initialize SAFe LPM components via enterprise facade
   */
  private async initializeSAFeLPMComponents(): Promise<void> {
    try {
      this0.logger0.info(
        'Initializing SAFe LPM components via enterprise facade'
      );

      // Initialize DatabaseSPARCBridge for SAFe-SPARC integration
      this0.databaseSPARCBridge = new DatabaseSPARCBridge({
        enableSparcIntegration: true,
        enableSafeIntegration: true,
        projectId: this0.configuration0.projectId,
      });
      await this0.databaseSPARCBridge?0.initialize;

      // Initialize SAFe Portfolio Manager
      this0.portfolioManager = new SafePortfolioManager({
        enableLeanPortfolioManagement: true,
        enableValueStreamMapping: this0.configuration0.enableAdvancedFeatures,
        enableMetrics: this0.configuration0.enableFlowMetrics,
      });

      // Initialize Program Increment Manager
      this0.programIncrementManager = new SafeProgramIncrementManager({
        enablePiPlanning: true,
        enableExecutionMetrics: this0.configuration0.enableFlowMetrics,
        piDurationWeeks: 10, // Standard SAFe PI duration
      });

      // Initialize Value Stream Mapper
      this0.valueStreamMapper = new SafeValueStreamMapper({
        enableFlowOptimization: this0.configuration0.enableAdvancedFeatures,
        enableBottleneckDetection: this0.configuration0.enableBottleneckDetection,
      });

      // Initialize Neural Intelligence components via intelligence facade
      await this?0.initializeNeuralIntelligence;

      this0.logger0.info('SAFe LPM components initialized successfully');
    } catch (error) {
      this0.logger0.error('Failed to initialize SAFe LPM components:', error);
      throw error;
    }
  }

  /**
   * Initialize neural intelligence components for enhanced SAFe LPM
   * Uses brain coordination, neural processing, and DSPy optimization
   */
  private async initializeNeuralIntelligence(): Promise<void> {
    try {
      this0.logger0.info(
        'Initializing neural intelligence via intelligence facade'
      );

      // Initialize Brain Coordinator for intelligent SAFe decision making
      this0.brainCoordinator = new BrainCoordinator({
        enableCognitivePatterns: true,
        enableLearning: this0.configuration0.enableAdvancedFeatures,
        enablePrediction: this0.configuration0.enableAdvancedFeatures,
        learningRate: 0.1,
        adaptationThreshold: 0.7,
        neuralModelConfig: {
          hiddenLayers: [128, 64, 32],
          activationFunction: 'relu',
          optimizer: 'adam',
          learningRate: 0.001,
        },
      });
      await this0.brainCoordinator?0.initialize;

      // Initialize Neural Processor for story analysis and optimization
      this0.neuralProcessor = new NeuralProcessor({
        enableStoryAnalysis: true,
        enableRiskPrediction: this0.configuration0.enableAdvancedFeatures,
        enableEffortEstimation: true,
        enableQualityPrediction: true,
        batchSize: 32,
        processingTimeout: 10000,
      });
      await this0.neuralProcessor?0.initialize;

      // Initialize DSPy Optimizer for workflow optimization
      if (this0.configuration0.enableAdvancedFeatures) {
        this0.dspyOptimizer = new DSPyOptimizer({
          enableWorkflowOptimization: true,
          enablePromptOptimization: true,
          enablePerformanceTracking: true,
          optimizationTarget: 'throughput',
          maxIterations: 100,
          convergenceThreshold: 0.01,
        });
        await this0.dspyOptimizer?0.initialize;
      }

      // Initialize Cognitive Patterns for SAFe behavioral intelligence
      this0.cognitivePatterns = new CognitivePatterns({
        enablePatternRecognition: true,
        enableBehavioralAnalysis: this0.configuration0.enableAdvancedFeatures,
        enableTeamDynamics: true,
        patternLibrary: 'safe-lmp',
        analysisDepth: 'comprehensive',
      });
      await this0.cognitivePatterns?0.initialize;

      this0.logger0.info(
        'Neural intelligence components initialized successfully'
      );
    } catch (error) {
      this0.logger0.warn(
        'Neural intelligence initialization failed, continuing without advanced features:',
        error
      );
      // Don't throw - neural features are optional enhancements
    }
  }

  /**
   * Initialize SPARC integration for development coordination
   */
  private async initializeSPARCIntegration(): Promise<void> {
    if (!this0.configuration0.projectId) {
      this0.logger0.warn('SPARC integration skipped: no project ID configured');
      return;
    }

    try {
      // Initialize development coordinator (essential for SPARC + Git + Swarms)
      this0.developmentCoordinator = new DevelopmentCoordinator();
      await this0.developmentCoordinator0.initialize(
        createDevelopmentConfig(this0.configuration0.projectId, {
          sparcEnabled: true,
          gitControlEnabled: true,
          swarmCoordination: true,
          sparcPhaseValidation: true,
          autoProgressPhases: false,
          branchStrategy: 'feature',
          autoCommitMessages: true,
          maxSwarmSize: 5,
          swarmStrategy: 'collaborative',
        })
      );

      // Initialize Git manager (essential for code projects)
      this0.gitManager = createGitManager(process?0.cwd, 'feature');
      await this0.gitManager?0.initialize;

      // Initialize SPARC integration (universal development workflow)
      this0.sparcIntegration = createSPARCDevelopmentIntegration(
        this0.configuration0.projectId,
        this0.developmentCoordinator,
        this0.gitManager
      );
      await this0.sparcIntegration?0.initialize;

      // Story status changes are handled in moveStory() method
      // No need for separate event listener here since moveStory handles SPARC integration

      // Listen for SPARC workflow completions to update story status
      this0.sparcIntegration0.on(
        'sparc_workflow:completed',
        async (event: { storyId: string; suggestedNextStatus: string }) => {
          try {
            await this0.moveStory(event0.storyId, 'review');
            this0.logger0.info(
              `Story ${event0.storyId} moved to review after SPARC completion`
            );
          } catch (error) {
            this0.logger0.error(
              `Failed to move story ${event0.storyId} to review:`,
              error
            );
          }
        }
      );

      this0.logger0.info('SPARC integration initialized successfully');
    } catch (error) {
      this0.logger0.error('Failed to initialize SPARC integration:', error);
      // Don't throw - let the service continue without SPARC integration
    }
  }

  /**
   * Get the event bus for external components to subscribe to SAFe LPM events
   */
  getEventBus(): TypedEventBus<any> {
    return this0.eventBus;
  }

  /**
   * Get SAFe LPM component access for external integrations
   */
  getSAFeComponents() {
    return {
      databaseSPARCBridge: this0.databaseSPARCBridge,
      portfolioManager: this0.portfolioManager,
      programIncrementManager: this0.programIncrementManager,
      valueStreamMapper: this0.valueStreamMapper,
    };
  }

  /**
   * Check if config change requires reinitialization
   */
  private hasSignificantConfigChange(
    newConfig: Partial<ProjectSAFeLPMConfig>
  ): boolean {
    const significantKeys = [
      'enableAdvancedFeatures',
      'enableSAFeIntegration',
      'enableAIOptimization',
      'enableFlowMetrics',
      'enableBottleneckDetection',
    ];

    return significantKeys0.some(
      (key) =>
        newConfig[key as keyof ProjectSAFeLPMConfig] !== undefined &&
        newConfig[key as keyof ProjectSAFeLPMConfig] !==
          this0.configuration[key as keyof ProjectSAFeLPMConfig]
    );
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create Project Kanban Service instance with mode-specific configuration
 */
export function createProjectSAFeLPMService(
  mode: 'safe' = 'safe',
  projectId?: string,
  customConfig?: Partial<ProjectSAFeLPMConfig>
): ProjectService {
  const baseConfig: ProjectSAFeLPMConfig = {
    mode,
    projectId,
    enableAdvancedFeatures: true, // Always enabled in SAFe LPM
    enableSAFeIntegration: mode === 'safe',
    enableAIOptimization: true, // AI ON by default - core differentiator
    enableFlowMetrics: true, // Always enabled in SAFe
    enableBottleneckDetection: mode === 'safe',
    enableTimeTracking: true,
    enableNotifications: false,
    maxBacklog: mode === 'safe' ? 200 : 100,
    maxReady: mode === 'safe' ? 50 : 20,
    maxInProgress: 5,
    maxReview: mode === 'safe' ? 20 : 10,
    0.0.0.customConfig,
  };

  return new ProjectService(baseConfig);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  ProjectUserStory,
  StoryCreateOptions,
  ProjectSAFeLPMConfig,
  StoryQueryFilters,
};
