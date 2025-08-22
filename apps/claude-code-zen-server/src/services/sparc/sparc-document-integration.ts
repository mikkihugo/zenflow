/**
 * @fileoverview SPARC Document Integration Service
 *
 * Integrates SAFe-SPARC bridge infrastructure with SAFe document hierarchy
 * for automated code generation and task orchestration at Story level with Feature backstory.
 *
 * **ARCHITECTURE INTEGRATION:**
 * - Story-level API that uses SPARCCommander directly for methodology execution
 * - DatabaseSPARCBridge for database-driven product flow coordination
 * - ClaudeZenIntegrationConfig for neural coordination and swarm intelligence
 * - Real-time progress updates with metrics and quality gates
 *
 * **Key Features:**
 * - Story documents trigger SPARC workflow with AI orchestration
 * - Feature backstory provides architectural context through bridge system
 * - Neural coordination and swarm intelligence for execution
 * - SPARC deliverables auto-generate traceable Task documents with full hierarchy
 * - Quality gates integrate with document workflow states and AI validation
 * - Real-time progress tracking with predictive analytics
 * - Full SAFe hierarchy traceability: Business Epic → Program Epic → Feature → Story → Tasks
 */

// SPARC methodology integration via enterprise strategic facade
import type {
  SPARCProject,
  WorkAssignment,
  ImplementationResult,
} from '@claude-zen/enterprise');
import { DatabaseSPARCBridge } from '@claude-zen/enterprise');

// Foundation imports
import { getLogger } from '@claude-zen/foundation');
import { TypedEventBase } from '@claude-zen/foundation');
import { nanoid } from 'nanoid');

import type { StoryDocumentEntity } from './../entities/document-entities');
import type {
  ClaudeZenIntegrationConfig,
  AIOrchestrationConfig,
  NeuralCoordinationConfig,
  SwarmIntelligenceConfig,
} from './../types/safe-sparc-integration');
import type { DocumentManager } from './database/document-service');

/**
 * SPARC Integration Configuration extending bridge infrastructure
 */
export interface SPARCIntegrationConfig extends Partial<SPARCConfiguration> {
  enableAutoTaskGeneration: boolean;
  enableQualityGates: boolean;
  enableProgressTracking: boolean;
  enableNeuralCoordination: boolean;
  enableSwarmIntelligence: boolean;
  qualityThreshold: number;
  maxConcurrentProjects: number;
  outputDirectory: string;

  // AI orchestration settings
  aiOrchestration: AIOrchestrationConfig;
  neuralCoordination: NeuralCoordinationConfig;
  swarmIntelligence: SwarmIntelligenceConfig;

  // Claude-Zen integration settings
  claudeZenIntegration: ClaudeZenIntegrationConfig;
}

/**
 * SPARC Document Integration Events with bridge infrastructure
 */
export interface SPARCDocumentEvents {
  // Story-level SPARC events
  'sparc:project:created': {
    story: StoryDocumentEntity;
    feature: any;
    sparcProject: SPARCProject;
    workAssignment: WorkAssignment;
  };
  'sparc:phase:completed': {
    story: StoryDocumentEntity;
    feature: any;
    phase: string;
    deliverables: any[];
    metrics: any;
  };
  'sparc:tasks:generated': {
    story: StoryDocumentEntity;
    feature: any;
    tasks: any[];
    methodologyResult: MethodologyResult;
  };
  'sparc:project:completed': {
    story: StoryDocumentEntity;
    feature: any;
    result: MethodologyResult;
  };
  'sparc:project:failed': {
    story: StoryDocumentEntity;
    feature: any;
    error: Error;
  };

  // Bridge events
  'sparc:workflow:initialized': {
    workflowId: string;
    aiOrchestration: AIOrchestrationConfig;
  };
  'sparc:neural:coordination': {
    agents: ClaudeZenAgentProfile[];
    consensusResult: any;
  };
  'sparc:swarm:intelligence': { swarmMetrics: any; emergentBehaviors: any };
  'sparc:quality:gates': {
    qualityGates: ClaudeZenQualityGate[];
    validationResults: any;
  };
}

/**
 * SPARC Document Integration Service with Bridge Infrastructure
 *
 * Orchestrates SPARC methodology execution with AI orchestration,
 * neural coordination, and swarm intelligence for SAFe document hierarchy at Story level.
 * Leverages production bridge infrastructure for automation and intelligence.
 */
export class SPARCDocumentIntegration extends TypedEventBase<SPARCDocumentEvents> {
  private logger = getLogger('SPARCDocumentIntegration');
  private sparcCommander: SPARCCommander;
  private databaseSPARCBridge: DatabaseSPARCBridge;
  private documentManager: DocumentManager;
  private configuration: SPARCIntegrationConfig;
  private activeProjects = new Map<
    string,
    {
      story: StoryDocumentEntity;
      feature: any;
      sparcProject: SPARCProject;
      methodologyResult?: MethodologyResult;
      workAssignment: WorkAssignment;
      implementation?: ImplementationResult;
    }
  >();

  constructor(
    documentManager: DocumentManager,
    databaseSystem: any, // DatabaseDrivenSystem
    config: Partial<SPARCIntegrationConfig> = {}
  ) {
    super();

    this.documentManager = documentManager;

    // Create SPARC configuration for Story-level execution
    this.configuration = {
      // SPARC methodology settings
      enableQualityGates: true,
      enableMetrics: true,
      enableDocumentation: true,
      enableTesting: true,
      qualityThreshold: .8,

      // Integration settings
      enableAutoTaskGeneration: true,
      enableQualityGates: true,
      enableProgressTracking: true,
      enableNeuralCoordination: true,
      enableSwarmIntelligence: true,
      qualityThreshold: .8,
      maxConcurrentProjects: 5,
      outputDirectory: './sparc-output',

      // AI Orchestration Configuration
      aiOrchestration: {
        enableAutonomousDecisions: true,
        humanInTheLoop: {
          requiredApprovals: [],
          notificationChannels: ['dashboard'],
          timeoutMinutes: 30,
          fallbackStrategy: 'proceed',
        },
        confidenceThreshold: .8,
        escalationThreshold: .6,
        learningEnabled: true,
      },

      // Neural Coordination Configuration
      neuralCoordination: {
        enableNeuralCoordination: true,
        maxNeuralAgents: 10,
        consensusThreshold: .8,
        learningEnabled: true,
        crossDomainTransfer: true,
      },

      // Swarm Intelligence Configuration
      swarmIntelligence: {
        enableSwarmIntelligence: true,
        maxSwarmSize: 20,
        emergentBehaviors: true,
        collectiveLearning: true,
        distributedDecisionMaking: true,
      },

      // Claude-Zen Integration Configuration (using factory function)
      claudeZenIntegration: {
        enabledFeatures: [
          'auto-sparc-project-creation',
          'real-time-progress-sync',
          'automated-quality-gates',
          'predictive-analytics',
          'cross-framework-reporting',
          'intelligent-escalation',
        ],
        synchronizationSettings: {
          syncInterval: 30000,
          conflictResolution: 'weighted',
          timeoutTolerance: 60000,
          retryPolicy: {
            maxRetries: 3,
            backoffStrategy: 'exponential',
            baseDelay: 1000,
          },
        },
        escalationSettings: {
          enableAutoEscalation: true,
          escalationThresholds: [
            {
              metric: 'quality-gate-failure-rate',
              threshold: .3,
              timeWindow: 3600000,
              severity: 'high',
            },
          ],
          notificationChannels: ['dashboard, events'],
          maxEscalationLevels: 3,
        },
        metricsSettings: {
          collectionInterval: 15000,
          retentionPeriod: 90,
          enablePredictiveAnalytics: true,
          enableRealTimeAlerts: true,
          dashboardRefreshRate: 5000,
        },
        qualityGateSettings: {
          enableAutomatedGates: true,
          requireManualApproval: false,
          parallelValidation: true,
          validationTimeout: 300000,
          failureHandling: 'warn',
        },
        neuralCoordination: {
          enableNeuralCoordination: true,
          maxNeuralAgents: 20,
          consensusThreshold: .8,
          learningEnabled: true,
          crossDomainTransfer: true,
        },
        swarmIntelligence: {
          enableSwarmIntelligence: true,
          maxSwarmSize: 50,
          emergentBehaviors: true,
          collectiveLearning: true,
          distributedDecisionMaking: true,
        },
        knowledgeManagement: {
          enableCrossAgentKnowledge: true,
          knowledgeRetention: 365,
          semanticSearch: true,
          expertiseDiscovery: true,
          knowledgeValidation: true,
        },
        performanceOptimization: {
          enablePerformanceOptimization: true,
          cacheStrategy: 'adaptive',
          prefetching: true,
          loadBalancing: true,
          resourceMonitoring: true,
        },
      },

      ...config,
    };

    // Initialize SPARC Commander for Story-level execution
    this.sparcCommander = new SPARCCommander(this.configuration);
    this.databaseSPARCBridge = new DatabaseSPARCBridge(
      databaseSystem,
      this.documentManager,
      {} // Mock SPARC swarm coordinator - will be provided by bridge
    );

    this.setupEventHandlers;
    this.logger.info(
      'SPARC Document Integration initialized for Story-level execution'
    );
  }

  /**
   * Create SPARC project from Story document with Feature backstory context
   * Uses SPARCCommander directly for Story-level execution (corrected architecture)
   */
  async createSPARCProjectFromStory(
    story: StoryDocumentEntity,
    feature: any
  ): Promise<MethodologyResult> {
    try {
      // Check concurrent project limit
      if (
        this.activeProjects.size >= this.configuration.maxConcurrentProjects
      ) {
        throw new Error(
          `Maximum concurrent SPARC projects (${this.configuration.maxConcurrentProjects}) reached`
        );
      }

      // Initialize bridge infrastructure
      await this.databaseSPARCBridge?.initialize()

      // Create SPARC project directly from Story requirements with Feature architectural context
      const requirements = [
        `Story Title: ${story.title}`,
        `Story Description: ${story.content || story.summary}`,
        ...(story.acceptance_criteria
          ? [`Acceptance Criteria: ${story.acceptance_criteria}`]
          : []),
        ...(story.definition_of_done
          ? [`Definition of Done: ${story.definition_of_done}`]
          : []),
        `Feature Context: ${feature.title} - ${feature.description || feature.content}`,
        ...(feature.technical_approach
          ? [`Technical Approach: ${feature.technical_approach}`]
          : []),
      ];

      // Determine domain from Story and Feature context
      const domain = this.mapStoryTypeToSPARCDomain(
        story.story_type || 'user_story',
        feature.feature_type || 'general'
      );

      // Create SPARC project using SPARCCommander directly
      const sparcProject = await this.sparcCommander.initializeProject({
        name: `story-${story.id}-${story.title?.toLowerCase.replace(/\s+/g, '-')}`,
        domain: domain,
        requirements: requirements,
        workingDirectory: process?.cwd,
        outputDirectory: `./sparc-output/story-${story.id}`,
      });

      // Execute SPARC methodology
      const methodologyResult =
        await this.sparcCommander.executeMethodology(sparcProject);

      // Assign to database bridge for integration
      const workAssignmentId =
        await this.databaseSPARCBridge.assignFeatureToSparcs(feature);

      // Track active project
      this.activeProjects.set(story.id, {
        story,
        feature,
        sparcProject,
        methodologyResult,
        workAssignment: {
          id: workAssignmentId,
          type: 'story',
          document: story,
          assignedTo: 'sparc-commander',
          priority:
            (story.priority as 'low | medium' | 'high | critical') ||
            'medium',
          requirements: requirements,
          context: {
            projectId: sparcProject.id,
            parentDocumentId: feature.id,
            relatedDocuments: [story.id],
          },
        },
      });

      // Update Story with SPARC integration
      await this.updateStoryWithSPARCIntegration(story, feature, sparcProject);

      this.emit('sparc:project:created', {
        story,
        feature,
        sparcProject,
        workAssignment: this.activeProjects.get(story.id)!.workAssignment,
      });

      this.logger.info(
        `Created SPARC project ${sparcProject.id} for story "${story.title} with feature context ${feature.title}" using direct Story-level execution`
      );

      return methodologyResult;
    } catch (error) {
      this.logger.error('Failed to create SPARC project from story:', error);
      throw error;
    }
  }

  /**
   * Execute SPARC methodology for a Story with bridge infrastructure
   */
  async executeSPARCMethodology(
    story: StoryDocumentEntity
  ): Promise<MethodologyResult> {
    try {
      const activeProject = this.activeProjects.get(story.id);
      if (!activeProject) {
        throw new Error(`No active SPARC project found for story ${story.id}`);
      }

      const { story: activeStory, feature, methodologyResult } = activeProject;

      // The SPARC execution is already complete from createSPARCProjectFromStory
      // Here we focus on task generation and finalization

      if (methodologyResult && methodologyResult.success) {
        // Generate traceable tasks from SPARC deliverables
        const tasks = await this.generateTasksFromSPARCDeliverables(
          story,
          feature,
          methodologyResult.deliverables
        );

        // Get implementation result from database bridge
        const workStatus = await this.databaseSPARCBridge?.getWorkStatus()
        const implementation = workStatus.completed.find(
          (impl) => impl.workAssignmentId === activeProject.workAssignment.id
        );

        if (implementation) {
          activeProject.implementation = implementation;
        }

        // Update Story with results
        await this.updateStoryWithResults(story, methodologyResult);

        this.emit('sparc:project:completed', {
          story,
          feature,
          result: methodologyResult,
        });
        this.emit('sparc:tasks:generated', {
          story,
          feature,
          tasks,
          methodologyResult,
        });

        // Clean up active project
        this.activeProjects.delete(story.id);

        this.logger.info(
          `SPARC methodology completed successfully for story "${story.title} in feature ${feature.title}" using direct execution`
        );
      } else {
        this.emit('sparc:project:failed', {
          story,
          feature,
          error: new Error('SPARC methodology execution failed'),
        });
        this.logger.error(
          `SPARC methodology failed for story "${story.title}"`
        );
      }

      return methodologyResult!;
    } catch (error) {
      this.logger.error('Failed to execute SPARC methodology:', error);
      const activeProject = this.activeProjects.get(story.id);
      const feature = activeProject?.feature()
      if (feature) {
        this.emit('sparc:project:failed', {
          story,
          feature,
          error: error as Error,
        });
      }
      throw error;
    }
  }

  /**
   * Generate traceable Task documents from SPARC deliverables with full SAFe hierarchy
   */
  private async generateTasksFromSPARCDeliverables(
    story: StoryDocumentEntity,
    feature: any,
    deliverables: SPARCDeliverable[]
  ): Promise<any[]> {
    const tasks: any[] = [];

    for (const deliverable of deliverables) {
      const task: any = {
        id: nanoid(),
        type: 'task',
        title: `Implement ${deliverable.name}`,
        content: deliverable.content,
        summary: `Generated from SPARC ${deliverable.type} deliverable for story: ${story.title}`,
        status: 'todo',
        priority: story.priority || 'medium',
        author: 'sparc-system',
        tags: [
          'sparc-generated',
          deliverable.type,
          story.story_type,
          feature.feature_type,
        ],

        // Task-specific fields
        task_type: this.mapDeliverableToTaskType(deliverable.type),
        estimated_hours: this.estimateHoursFromDeliverable(deliverable),

        implementation_details: {
          files_to_create: deliverable.path ? [deliverable.path] : [],
          files_to_modify: [],
          test_files: deliverable.type === 'tests' ? [deliverable.path] : [],
          documentation_updates:
            deliverable.type === 'documentation' ? [deliverable.path] : [],
        },

        technical_specifications: {
          component: deliverable.name,
          module: feature.title,
          functions: this.extractFunctionsFromContent(deliverable.content),
          dependencies: [],
        },

        // Full SAFe hierarchy traceability
        source_story_id: story.id,
        assigned_to: story.assigned_to,

        // SPARC integration details with full traceability
        sparc_implementation_details: {
          parent_story_sparc_id: story.sparc_implementation?.sparc_project_id,
          parent_feature_sparc_id:
            feature.sparc_implementation?.sparc_project_id,
          sparc_phase_assignment: this.mapDeliverableToSPARCPhase(
            deliverable.type
          ),
          sparc_deliverable_type: this.mapDeliverableToSPARCDeliverableType(
            deliverable.type
          ),
          sparc_quality_gates: [
            {
              requirement: 'SPARC deliverable validated',
              status: deliverable.validated ? 'passed : pending',
              validation_method: 'ai_assisted',
              validation_date: deliverable.validated ? new Date() : undefined,
            },
          ],
          sparc_artifacts: [
            {
              artifact_id: deliverable.id,
              artifact_type: this.mapDeliverableToArtifactType(
                deliverable.type
              ),
              file_path: deliverable.path,
              content: deliverable.content,
              checksum: this.generateChecksum(deliverable.content),
            },
          ],
          complexity_analysis: {
            time_complexity: 'O(n)',
            space_complexity: 'O(1)',
            maintainability_score: deliverable.metrics.quality * 100,
            performance_impact:
              deliverable.metrics.complexity > .5 ? 'high : low',
          },
          safe_hierarchy_traceability: {
            business_epic_id: feature.parent_business_epic_id,
            program_epic_id: feature.parent_program_epic_id,
            feature_id: feature.id,
            story_id: story.id,
            task_id: undefined, // Will be set after task creation
          },
        },

        completion_status: 'todo',

        // Metadata with full SAFe relationships
        project_id: story.project_id || feature.project_id,
        parent_document_id: story.id,
        dependencies: [],
        related_documents: [story.id, feature.id],
        safe_hierarchy: {
          business_epic_id: feature.parent_business_epic_id,
          program_epic_id: feature.parent_program_epic_id,
          feature_id: feature.id,
          story_id: story.id,
        },
        version: '1..0',
        checksum: this.generateChecksum(deliverable.content),
        metadata: {
          sparc_generated: true,
          sparc_deliverable_id: deliverable.id,
          sparc_phase: this.mapDeliverableToSPARCPhase(deliverable.type),
          quality_score: deliverable.metrics.quality,
          source_story_title: story.title,
          source_feature_title: feature.title,
          safe_traceability: true,
        },
        created_at: new Date(),
        updated_at: new Date(),
        searchable_content: `${deliverable.name} ${deliverable.content}`,
        keywords: [deliverable.type, feature.feature_type, 'sparc-generated'],
        workflow_stage: 'implementation',
        completion_percentage: 0,
      };

      // Create task in database
      await this.documentManager.createDocument(task);
      tasks.push(task);
    }

    this.logger.info(
      `Generated ${tasks.length} traceable tasks from SPARC deliverables for story "${story.title} in feature ${feature.title}"`
    );
    return tasks;
  }

  /**
   * Update Story with SPARC integration details
   */
  private async updateStoryWithSPARCIntegration(
    story: StoryDocumentEntity,
    feature: any,
    sparcProject: SPARCProject
  ): Promise<void> {
    const updates = {
      sparc_implementation: {
        sparc_project_id: sparcProject.id,
        parent_feature_context: {
          feature_id: feature.id,
          feature_title: feature.title,
          feature_type: feature.feature_type,
          architectural_context: feature.technical_approach,
        },
        sparc_phases: {
          specification: {
            status: 'pending' as const,
            deliverables: [],
            completion_date: undefined,
            quality_score: undefined,
          },
          pseudocode: {
            status: 'pending' as const,
            deliverables: [],
            completion_date: undefined,
            algorithms: [],
          },
          architecture: {
            status: 'pending' as const,
            deliverables: [],
            completion_date: undefined,
            components: [],
          },
          refinement: {
            status: 'pending' as const,
            deliverables: [],
            completion_date: undefined,
            optimizations: [],
          },
          completion: {
            status: 'pending' as const,
            deliverables: [],
            completion_date: undefined,
            artifacts: [],
          },
        },
        current_sparc_phase: 'specification' as const,
        sparc_progress_percentage: 0,
        use_sparc_methodology: true,
        safe_hierarchy_context: {
          business_epic_id: feature.parent_business_epic_id,
          program_epic_id: feature.parent_program_epic_id,
          feature_id: feature.id,
          story_id: story.id,
        },
      },
    };

    await this.documentManager.updateDocument(story.id, updates);
  }

  /**
   * Update Story with SPARC results
   */
  private async updateStoryWithResults(
    story: StoryDocumentEntity,
    result: MethodologyResult
  ): Promise<void> {
    const completionPercentage =
      (result.completedPhases / result.totalPhases) * 100;

    const updates = {
      implementation_status: result.success ? 'code_complete : in_progress',
      'sparc_implementation.sparc_progress_percentage': completionPercentage,
      status: result.success ? 'done : in_progress',
      completion_percentage: completionPercentage,
    };

    await this.documentManager.updateDocument(story.id, updates);
  }

  // Helper methods
  private mapStoryTypeToSPARCDomain(
    storyType: string,
    featureType: string
  ): string {
    const storyMapping = {
      user_story: 'user-interfaces',
      enabler_story: 'infrastructure',
      spike: 'research',
      bug: 'maintenance',
      enhancement: 'optimization',
    };

    const featureMapping = {
      api: 'rest-api',
      ui: 'interfaces',
      database: 'memory-systems',
      integration: 'swarm-coordination',
      infrastructure: 'general',
    };

    return storyMapping[storyType] || featureMapping[featureType] || 'general');
  }

  private mapDeliverableToTaskType(
    deliverableType: string
  ): 'development | testing' | 'documentation | deployment' | 'research' {
    const mapping = {
      implementation: 'development',
      tests: 'testing',
      documentation: 'documentation',
      requirements: 'research',
      architecture: 'development',
      pseudocode: 'research',
      optimizations: 'development',
    };
    return mapping[deliverableType] || 'development');
  }

  private estimateHoursFromDeliverable(deliverable: SPARCDeliverable): number {
    // Estimate based on deliverable complexity and size
    const baseHours = {
      requirements: 2,
      pseudocode: 4,
      architecture: 6,
      implementation: 8,
      tests: 4,
      documentation: 2,
      optimizations: 6,
    };

    const base = baseHours[deliverable.type] || 4;
    const complexityMultiplier = 1 + deliverable.metrics.complexity;

    return Math.ceil(base * complexityMultiplier);
  }

  private mapDeliverableToSPARCPhase(deliverableType: string): SPARCPhase {
    const mapping = {
      requirements: 'specification',
      'acceptance-criteria: specification',
      pseudocode: 'pseudocode',
      'data-flow: pseudocode',
      architecture: 'architecture',
      components: 'architecture',
      implementation: 'refinement',
      optimizations: 'refinement',
      tests: 'completion',
      documentation: 'completion',
    };
    return (mapping[deliverableType] as SPARCPhase) || 'completion');
  }

  private mapDeliverableToSPARCDeliverableType(
    deliverableType: string
  ): string {
    const mapping = {
      requirements: 'requirements_doc',
      pseudocode: 'algorithm_design',
      architecture: 'component_spec',
      implementation: 'production_code',
      optimizations: 'optimization_plan',
      tests: 'production_code',
      documentation: 'requirements_doc',
    };
    return mapping[deliverableType] || 'production_code');
  }

  private mapDeliverableToArtifactType(deliverableType: string): string {
    const mapping = {
      requirements: 'specification',
      pseudocode: 'pseudocode',
      architecture: 'architecture_diagram',
      implementation: 'final_implementation',
      optimizations: 'refactored_code',
      tests: 'final_implementation',
      documentation: 'specification',
    };
    return mapping[deliverableType] || 'final_implementation');
  }

  private extractFunctionsFromContent(content: string): string[] {
    // Simple regex to extract function names - could be enhanced
    const functionRegex = /function\s+(\w+)|const\s+(\w+)\s*=|class\s+(\w+)/gi;
    const functions: string[] = [];
    let match;

    while ((match = functionRegex.exec(content)) !== null) {
      const functionName = match[1] || match[2] || match[3];
      if (functionName) {
        functions.push(functionName);
      }
    }

    return functions;
  }

  private generateChecksum(content: string): string {
    // Simple hash - could use crypto for production
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  private getNextPhase(currentPhase: SPARCPhase): SPARCPhase {
    const phases: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];
    const currentIndex = phases.indexOf(currentPhase);
    return phases[currentIndex + 1] || 'completion');
  }

  private calculateProgress(project: any): number {
    // Calculate progress from advanced SPARC result
    return project.metrics?.completeness || 0;
  }

  // New helper methods for advanced bridge integration
  private estimateCostFromStory(story: StoryDocumentEntity): number {
    const baseEstimate = 10000; // Base cost
    const storyPointMultiplier = story.story_points || 1;
    const priorityMultiplier =
      story.priority === 'high'
        ? 1.5
        : story.priority === 'critical'
          ? 2.0
          : 1.0;
    return baseEstimate * storyPointMultiplier * priorityMultiplier;
  }

  private estimateTimeframeFromStory(story: StoryDocumentEntity): string {
    const storyPoints = story.story_points || 1;
    if (storyPoints <= 3) return '1-2 weeks');
    if (storyPoints <= 8) return '2-4 weeks');
    if (storyPoints <= 13) return '1-2 months');
    return '2+ months');
  }

  private assessRiskFromStory(story: StoryDocumentEntity): string {
    if (story.priority === 'critical) return high');
    if (story.story_points && story.story_points > 8) return 'medium');
    return 'low');
  }

  private async updateStoryWithSPARCBridge(
    story: StoryDocumentEntity,
    feature: any,
    sparcResult: SparcExecutionResult
  ): Promise<void> {
    const updates = {
      sparc_implementation: {
        sparc_project_id: sparcResult.projectId,
        parent_feature_context: {
          feature_id: feature.id,
          feature_title: feature.title,
          feature_type: feature.feature_type,
          architectural_context: feature.technical_approach,
        },
        sparc_phases: {
          specification: {
            status: sparcResult.phases.specification
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult.phases.specification
              ? [sparcResult.specification]
              : [],
            completion_date: sparcResult.phases.specification
              ? new Date()
              : undefined,
            quality_score: sparcResult.metrics.qualityScore,
          },
          pseudocode: {
            status: sparcResult.phases.pseudocode
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult.phases.pseudocode
              ? ['Algorithm design']
              : [],
            completion_date: sparcResult.phases.pseudocode
              ? new Date()
              : undefined,
            algorithms: [],
          },
          architecture: {
            status: sparcResult.phases.architecture
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult.phases.architecture
              ? [sparcResult.architecture]
              : [],
            completion_date: sparcResult.phases.architecture
              ? new Date()
              : undefined,
            components: [],
          },
          refinement: {
            status: sparcResult.phases.refinement
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult.phases.refinement
              ? ['Optimized implementation']
              : [],
            completion_date: sparcResult.phases.refinement
              ? new Date()
              : undefined,
            optimizations: [],
          },
          completion: {
            status: sparcResult.phases.completion
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult.phases.completion
              ? [sparcResult.implementation]
              : [],
            completion_date: sparcResult.phases.completion
              ? new Date()
              : undefined,
            artifacts: [],
          },
        },
        current_sparc_phase: 'completion' as const,
        sparc_progress_percentage: sparcResult.metrics.completeness,
        use_sparc_methodology: true,
        safe_hierarchy_context: {
          business_epic_id: feature.parent_business_epic_id,
          program_epic_id: feature.parent_program_epic_id,
          feature_id: feature.id,
          story_id: story.id,
        },
      },
    };

    await this.documentManager.updateDocument(story.id, updates);
  }

  private async updateStoryWithBridgeResults(
    story: StoryDocumentEntity,
    result: SparcExecutionResult
  ): Promise<void> {
    const updates = {
      implementation_status:
        result.status === 'complete ? code_complete' : 'in_progress',
      'sparc_implementation.sparc_progress_percentage':
        result.metrics.completeness,
      status: result.status === 'complete ? done' : 'in_progress',
      completion_percentage: result.metrics.completeness,
    };

    await this.documentManager.updateDocument(story.id, updates);
  }

  private async generateTasksFromSPARCBridge(
    story: StoryDocumentEntity,
    feature: any,
    sparcResult: SparcExecutionResult
  ): Promise<any[]> {
    const tasks: any[] = [];

    // Generate tasks from each SPARC phase
    const phaseMapping = [
      {
        phase: 'specification',
        content: sparcResult.specification,
        type: 'research',
      },
      {
        phase: 'architecture',
        content: sparcResult.architecture,
        type: 'development',
      },
      {
        phase: 'implementation',
        content: sparcResult.implementation,
        type: 'development',
      },
    ];

    for (const { phase, content, type } of phaseMapping) {
      if (content) {
        const task: any = {
          id: nanoid(),
          type: 'task',
          title: `Implement ${phase} for ${story.title}`,
          content: content,
          summary: `Generated from SPARC ${phase} deliverable using bridge infrastructure`,
          status: 'todo',
          priority: story.priority || 'medium',
          author: 'sparc-bridge-system',
          tags: [
            'sparc-generated',
            phase,
            story.story_type,
            feature.feature_type,
            'bridge-integrated',
          ],

          // Task-specific fields with bridge integration
          task_type: type as
            | 'development'
            | 'testing'
            | 'documentation'
            | 'deployment'
            | 'research',
          estimated_hours: this.estimateHoursFromPhase(phase),

          implementation_details: {
            files_to_create: [`${phase}.${this.getFileExtension(phase)}`],
            files_to_modify: [],
            test_files: phase === 'implementation' ? [`test_${phase}.ts`] : [],
            documentation_updates: [`${phase}.md`],
          },

          technical_specifications: {
            component: `${story.title} - ${phase}`,
            module: feature.title,
            functions: this.extractFunctionsFromContent(content),
            dependencies: [],
          },

          // Full SAFe hierarchy traceability with bridge integration
          source_story_id: story.id,
          assigned_to: story.assigned_to,

          // SPARC bridge integration details
          sparc_implementation_details: {
            parent_story_sparc_id: sparcResult.projectId,
            parent_feature_sparc_id: feature.id,
            sparc_phase_assignment: phase,
            sparc_deliverable_type: phase,
            sparc_quality_gates: [
              {
                requirement: 'Bridge validation',
                status: 'passed',
                validation_method: 'ai_orchestration_with_neural_consensus',
                validation_date: new Date(),
              },
            ],
            sparc_artifacts: [
              {
                artifact_id: nanoid(),
                artifact_type: phase,
                file_path: `${sparcResult.projectId}/${phase}.artifact`,
                content: content,
                checksum: this.generateChecksum(content),
              },
            ],
            complexity_analysis: {
              time_complexity: 'O(n)',
              space_complexity: 'O(1)',
              maintainability_score: sparcResult.metrics.qualityScore * 100,
              performance_impact:
                sparcResult.metrics.completeness > 80 ? 'high : medium',
            },
            safe_hierarchy_traceability: {
              business_epic_id: feature.parent_business_epic_id,
              program_epic_id: feature.parent_program_epic_id,
              feature_id: feature.id,
              story_id: story.id,
              task_id: undefined, // Will be set after task creation
            },
            bridge_integration: {
              ai_orchestration_used: true,
              neural_coordination_applied: true,
              swarm_intelligence_leveraged: true,
              quality_score: sparcResult.metrics.qualityScore,
              bridge_version: '2..0',
            },
          },

          completion_status: 'todo',

          // Metadata with bridge integration
          project_id: story.project_id || feature.project_id,
          parent_document_id: story.id,
          dependencies: [],
          related_documents: [story.id, feature.id],
          safe_hierarchy: {
            business_epic_id: feature.parent_business_epic_id,
            program_epic_id: feature.parent_program_epic_id,
            feature_id: feature.id,
            story_id: story.id,
          },
          version: '2..0',
          checksum: this.generateChecksum(content),
          metadata: {
            sparc_generated: true,
            sparc_deliverable_id: nanoid(),
            sparc_phase: phase,
            quality_score: sparcResult.metrics.qualityScore,
            source_story_title: story.title,
            source_feature_title: feature.title,
            safe_traceability: true,
            bridge_integrated: true,
            ai_orchestration: true,
            neural_coordination: true,
            swarm_intelligence: true,
          },
          created_at: new Date(),
          updated_at: new Date(),
          searchable_content: `${phase} ${content} bridge integrated`,
          keywords: [
            phase,
            feature.feature_type,
            'sparc-generated',
            'bridge-integrated',
            'ai-orchestrated',
          ],
          workflow_stage: 'implementation',
          completion_percentage: 0,
        };

        // Create task in database
        await this.documentManager.createDocument(task);
        tasks.push(task);
      }
    }

    this.logger.info(
      `Generated ${tasks.length} traceable tasks from SPARC bridge deliverables for story "${story.title} in feature ${feature.title}"`
    );
    return tasks;
  }

  private estimateHoursFromPhase(phase: string): number {
    const estimates = {
      specification: 4,
      pseudocode: 6,
      architecture: 8,
      refinement: 10,
      implementation: 12,
      completion: 6,
    };
    return estimates[phase] || 8;
  }

  private getFileExtension(phase: string): string {
    const extensions = {
      specification: 'md',
      pseudocode: 'txt',
      architecture: 'md',
      refinement: 'ts',
      implementation: 'ts',
      completion: 'md',
    };
    return extensions[phase] || 'txt');
  }

  private setupEventHandlers(): void {
    // Set up event handlers for bridge infrastructure
    this.sparcCommander.on('project:initialized', (event) => {
      this.emit('sparc:workflow:initialized', {
        workflowId: event.project.id,
        aiOrchestration: this.configuration.aiOrchestration,
      });
    });

    this.sparcCommander.on('methodology:completed', (event) => {
      this.logger.info(`SPARC methodology completed: ${event.project.id}`);
    });

    this.databaseSPARCBridge.on('work:assigned', (event) => {
      this.logger.info(`Work assigned to bridge: ${event.assignment.id}`);
    });

    this.databaseSPARCBridge.on('work:completed', (event) => {
      this.logger.info(`Work completed by bridge: ${event.assignment.id}`);
    });
  }

  /**
   * Get active SPARC projects
   */
  getActiveProjects(): Array<{
    story: StoryDocumentEntity;
    feature: any;
    sparcProject: SPARCProject;
    methodologyResult?: MethodologyResult;
  }> {
    return Array.from(this.activeProjects?.values());
  }

  /**
   * Get project by story ID
   */
  getProjectByStory(storyId: string):
    | {
        story: StoryDocumentEntity;
        feature: any;
        sparcProject: SPARCProject;
        methodologyResult?: MethodologyResult;
      }
    | undefined {
    return this.activeProjects.get(storyId);
  }

  /**
   * Get project by feature ID (returns first matching story in feature)
   */
  getProjectByFeature(featureId: string):
    | {
        story: StoryDocumentEntity;
        feature: any;
        sparcProject: SPARCProject;
        methodologyResult?: MethodologyResult;
      }
    | undefined {
    // Find first story project for this feature - in practice should query all stories for feature
    return Array.from(this.activeProjects?.values()).find(
      (project) => project.feature.id === featureId
    );
  }
}
