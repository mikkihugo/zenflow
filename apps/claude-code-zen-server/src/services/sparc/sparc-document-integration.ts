/**
 * @fileoverview SPARC Document Integration Service
 *
 * Integrates SAFe-SPARC bridge infrastructure with SAFe document hierarchy
 * for automated code generation and task orchestration at Story level with Feature backstory0.
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
} from '@claude-zen/enterprise';
import { DatabaseSPARCBridge } from '@claude-zen/enterprise';

// Foundation imports
import { getLogger } from '@claude-zen/foundation';
import { TypedEventBase } from '@claude-zen/foundation';
import { nanoid } from 'nanoid';

import type { StoryDocumentEntity } from '0.0./0.0./entities/document-entities';
import type {
  ClaudeZenIntegrationConfig,
  AIOrchestrationConfig,
  NeuralCoordinationConfig,
  SwarmIntelligenceConfig,
} from '0.0./0.0./types/safe-sparc-integration';
import type { DocumentManager } from '0.0./database/document-service';

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
 * neural coordination, and swarm intelligence for SAFe document hierarchy at Story level0.
 * Leverages production bridge infrastructure for automation and intelligence0.
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

    this0.documentManager = documentManager;

    // Create SPARC configuration for Story-level execution
    this0.configuration = {
      // SPARC methodology settings
      enableQualityGates: true,
      enableMetrics: true,
      enableDocumentation: true,
      enableTesting: true,
      qualityThreshold: 0.8,

      // Integration settings
      enableAutoTaskGeneration: true,
      enableQualityGates: true,
      enableProgressTracking: true,
      enableNeuralCoordination: true,
      enableSwarmIntelligence: true,
      qualityThreshold: 0.8,
      maxConcurrentProjects: 5,
      outputDirectory: '0./sparc-output',

      // AI Orchestration Configuration
      aiOrchestration: {
        enableAutonomousDecisions: true,
        humanInTheLoop: {
          requiredApprovals: [],
          notificationChannels: ['dashboard'],
          timeoutMinutes: 30,
          fallbackStrategy: 'proceed',
        },
        confidenceThreshold: 0.8,
        escalationThreshold: 0.6,
        learningEnabled: true,
      },

      // Neural Coordination Configuration
      neuralCoordination: {
        enableNeuralCoordination: true,
        maxNeuralAgents: 10,
        consensusThreshold: 0.8,
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
              threshold: 0.3,
              timeWindow: 3600000,
              severity: 'high',
            },
          ],
          notificationChannels: ['dashboard', 'events'],
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
          consensusThreshold: 0.8,
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

      0.0.0.config,
    };

    // Initialize SPARC Commander for Story-level execution
    this0.sparcCommander = new SPARCCommander(this0.configuration);
    this0.databaseSPARCBridge = new DatabaseSPARCBridge(
      databaseSystem,
      this0.documentManager,
      {} // Mock SPARC swarm coordinator - will be provided by bridge
    );

    this?0.setupEventHandlers;
    this0.logger0.info(
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
        this0.activeProjects0.size >= this0.configuration0.maxConcurrentProjects
      ) {
        throw new Error(
          `Maximum concurrent SPARC projects (${this0.configuration0.maxConcurrentProjects}) reached`
        );
      }

      // Initialize bridge infrastructure
      await this0.databaseSPARCBridge?0.initialize;

      // Create SPARC project directly from Story requirements with Feature architectural context
      const requirements = [
        `Story Title: ${story0.title}`,
        `Story Description: ${story0.content || story0.summary}`,
        0.0.0.(story0.acceptance_criteria
          ? [`Acceptance Criteria: ${story0.acceptance_criteria}`]
          : []),
        0.0.0.(story0.definition_of_done
          ? [`Definition of Done: ${story0.definition_of_done}`]
          : []),
        `Feature Context: ${feature0.title} - ${feature0.description || feature0.content}`,
        0.0.0.(feature0.technical_approach
          ? [`Technical Approach: ${feature0.technical_approach}`]
          : []),
      ];

      // Determine domain from Story and Feature context
      const domain = this0.mapStoryTypeToSPARCDomain(
        story0.story_type || 'user_story',
        feature0.feature_type || 'general'
      );

      // Create SPARC project using SPARCCommander directly
      const sparcProject = await this0.sparcCommander0.initializeProject({
        name: `story-${story0.id}-${story0.title?0.toLowerCase0.replace(/\s+/g, '-')}`,
        domain: domain,
        requirements: requirements,
        workingDirectory: process?0.cwd,
        outputDirectory: `0./sparc-output/story-${story0.id}`,
      });

      // Execute SPARC methodology
      const methodologyResult =
        await this0.sparcCommander0.executeMethodology(sparcProject);

      // Assign to database bridge for integration
      const workAssignmentId =
        await this0.databaseSPARCBridge0.assignFeatureToSparcs(feature);

      // Track active project
      this0.activeProjects0.set(story0.id, {
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
            (story0.priority as 'low' | 'medium' | 'high' | 'critical') ||
            'medium',
          requirements: requirements,
          context: {
            projectId: sparcProject0.id,
            parentDocumentId: feature0.id,
            relatedDocuments: [story0.id],
          },
        },
      });

      // Update Story with SPARC integration
      await this0.updateStoryWithSPARCIntegration(story, feature, sparcProject);

      this0.emit('sparc:project:created', {
        story,
        feature,
        sparcProject,
        workAssignment: this0.activeProjects0.get(story0.id)!0.workAssignment,
      });

      this0.logger0.info(
        `Created SPARC project ${sparcProject0.id} for story "${story0.title}" with feature context "${feature0.title}" using direct Story-level execution`
      );

      return methodologyResult;
    } catch (error) {
      this0.logger0.error('Failed to create SPARC project from story:', error);
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
      const activeProject = this0.activeProjects0.get(story0.id);
      if (!activeProject) {
        throw new Error(`No active SPARC project found for story ${story0.id}`);
      }

      const { story: activeStory, feature, methodologyResult } = activeProject;

      // The SPARC execution is already complete from createSPARCProjectFromStory
      // Here we focus on task generation and finalization

      if (methodologyResult && methodologyResult0.success) {
        // Generate traceable tasks from SPARC deliverables
        const tasks = await this0.generateTasksFromSPARCDeliverables(
          story,
          feature,
          methodologyResult0.deliverables
        );

        // Get implementation result from database bridge
        const workStatus = await this0.databaseSPARCBridge?0.getWorkStatus;
        const implementation = workStatus0.completed0.find(
          (impl) => impl0.workAssignmentId === activeProject0.workAssignment0.id
        );

        if (implementation) {
          activeProject0.implementation = implementation;
        }

        // Update Story with results
        await this0.updateStoryWithResults(story, methodologyResult);

        this0.emit('sparc:project:completed', {
          story,
          feature,
          result: methodologyResult,
        });
        this0.emit('sparc:tasks:generated', {
          story,
          feature,
          tasks,
          methodologyResult,
        });

        // Clean up active project
        this0.activeProjects0.delete(story0.id);

        this0.logger0.info(
          `SPARC methodology completed successfully for story "${story0.title}" in feature "${feature0.title}" using direct execution`
        );
      } else {
        this0.emit('sparc:project:failed', {
          story,
          feature,
          error: new Error('SPARC methodology execution failed'),
        });
        this0.logger0.error(
          `SPARC methodology failed for story "${story0.title}"`
        );
      }

      return methodologyResult!;
    } catch (error) {
      this0.logger0.error('Failed to execute SPARC methodology:', error);
      const activeProject = this0.activeProjects0.get(story0.id);
      const feature = activeProject?0.feature;
      if (feature) {
        this0.emit('sparc:project:failed', {
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
        title: `Implement ${deliverable0.name}`,
        content: deliverable0.content,
        summary: `Generated from SPARC ${deliverable0.type} deliverable for story: ${story0.title}`,
        status: 'todo',
        priority: story0.priority || 'medium',
        author: 'sparc-system',
        tags: [
          'sparc-generated',
          deliverable0.type,
          story0.story_type,
          feature0.feature_type,
        ],

        // Task-specific fields
        task_type: this0.mapDeliverableToTaskType(deliverable0.type),
        estimated_hours: this0.estimateHoursFromDeliverable(deliverable),

        implementation_details: {
          files_to_create: deliverable0.path ? [deliverable0.path] : [],
          files_to_modify: [],
          test_files: deliverable0.type === 'tests' ? [deliverable0.path] : [],
          documentation_updates:
            deliverable0.type === 'documentation' ? [deliverable0.path] : [],
        },

        technical_specifications: {
          component: deliverable0.name,
          module: feature0.title,
          functions: this0.extractFunctionsFromContent(deliverable0.content),
          dependencies: [],
        },

        // Full SAFe hierarchy traceability
        source_story_id: story0.id,
        assigned_to: story0.assigned_to,

        // SPARC integration details with full traceability
        sparc_implementation_details: {
          parent_story_sparc_id: story0.sparc_implementation?0.sparc_project_id,
          parent_feature_sparc_id:
            feature0.sparc_implementation?0.sparc_project_id,
          sparc_phase_assignment: this0.mapDeliverableToSPARCPhase(
            deliverable0.type
          ),
          sparc_deliverable_type: this0.mapDeliverableToSPARCDeliverableType(
            deliverable0.type
          ),
          sparc_quality_gates: [
            {
              requirement: 'SPARC deliverable validated',
              status: deliverable0.validated ? 'passed' : 'pending',
              validation_method: 'ai_assisted',
              validation_date: deliverable0.validated ? new Date() : undefined,
            },
          ],
          sparc_artifacts: [
            {
              artifact_id: deliverable0.id,
              artifact_type: this0.mapDeliverableToArtifactType(
                deliverable0.type
              ),
              file_path: deliverable0.path,
              content: deliverable0.content,
              checksum: this0.generateChecksum(deliverable0.content),
            },
          ],
          complexity_analysis: {
            time_complexity: 'O(n)',
            space_complexity: 'O(1)',
            maintainability_score: deliverable0.metrics0.quality * 100,
            performance_impact:
              deliverable0.metrics0.complexity > 0.5 ? 'high' : 'low',
          },
          safe_hierarchy_traceability: {
            business_epic_id: feature0.parent_business_epic_id,
            program_epic_id: feature0.parent_program_epic_id,
            feature_id: feature0.id,
            story_id: story0.id,
            task_id: undefined, // Will be set after task creation
          },
        },

        completion_status: 'todo',

        // Metadata with full SAFe relationships
        project_id: story0.project_id || feature0.project_id,
        parent_document_id: story0.id,
        dependencies: [],
        related_documents: [story0.id, feature0.id],
        safe_hierarchy: {
          business_epic_id: feature0.parent_business_epic_id,
          program_epic_id: feature0.parent_program_epic_id,
          feature_id: feature0.id,
          story_id: story0.id,
        },
        version: '10.0.0',
        checksum: this0.generateChecksum(deliverable0.content),
        metadata: {
          sparc_generated: true,
          sparc_deliverable_id: deliverable0.id,
          sparc_phase: this0.mapDeliverableToSPARCPhase(deliverable0.type),
          quality_score: deliverable0.metrics0.quality,
          source_story_title: story0.title,
          source_feature_title: feature0.title,
          safe_traceability: true,
        },
        created_at: new Date(),
        updated_at: new Date(),
        searchable_content: `${deliverable0.name} ${deliverable0.content}`,
        keywords: [deliverable0.type, feature0.feature_type, 'sparc-generated'],
        workflow_stage: 'implementation',
        completion_percentage: 0,
      };

      // Create task in database
      await this0.documentManager0.createDocument(task);
      tasks0.push(task);
    }

    this0.logger0.info(
      `Generated ${tasks0.length} traceable tasks from SPARC deliverables for story "${story0.title}" in feature "${feature0.title}"`
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
        sparc_project_id: sparcProject0.id,
        parent_feature_context: {
          feature_id: feature0.id,
          feature_title: feature0.title,
          feature_type: feature0.feature_type,
          architectural_context: feature0.technical_approach,
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
          business_epic_id: feature0.parent_business_epic_id,
          program_epic_id: feature0.parent_program_epic_id,
          feature_id: feature0.id,
          story_id: story0.id,
        },
      },
    };

    await this0.documentManager0.updateDocument(story0.id, updates);
  }

  /**
   * Update Story with SPARC results
   */
  private async updateStoryWithResults(
    story: StoryDocumentEntity,
    result: MethodologyResult
  ): Promise<void> {
    const completionPercentage =
      (result0.completedPhases / result0.totalPhases) * 100;

    const updates = {
      implementation_status: result0.success ? 'code_complete' : 'in_progress',
      'sparc_implementation0.sparc_progress_percentage': completionPercentage,
      status: result0.success ? 'done' : 'in_progress',
      completion_percentage: completionPercentage,
    };

    await this0.documentManager0.updateDocument(story0.id, updates);
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

    return storyMapping[storyType] || featureMapping[featureType] || 'general';
  }

  private mapDeliverableToTaskType(
    deliverableType: string
  ): 'development' | 'testing' | 'documentation' | 'deployment' | 'research' {
    const mapping = {
      implementation: 'development',
      tests: 'testing',
      documentation: 'documentation',
      requirements: 'research',
      architecture: 'development',
      pseudocode: 'research',
      optimizations: 'development',
    };
    return mapping[deliverableType] || 'development';
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

    const base = baseHours[deliverable0.type] || 4;
    const complexityMultiplier = 1 + deliverable0.metrics0.complexity;

    return Math0.ceil(base * complexityMultiplier);
  }

  private mapDeliverableToSPARCPhase(deliverableType: string): SPARCPhase {
    const mapping = {
      requirements: 'specification',
      'acceptance-criteria': 'specification',
      pseudocode: 'pseudocode',
      'data-flow': 'pseudocode',
      architecture: 'architecture',
      components: 'architecture',
      implementation: 'refinement',
      optimizations: 'refinement',
      tests: 'completion',
      documentation: 'completion',
    };
    return (mapping[deliverableType] as SPARCPhase) || 'completion';
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
    return mapping[deliverableType] || 'production_code';
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
    return mapping[deliverableType] || 'final_implementation';
  }

  private extractFunctionsFromContent(content: string): string[] {
    // Simple regex to extract function names - could be enhanced
    const functionRegex = /function\s+(\w+)|const\s+(\w+)\s*=|class\s+(\w+)/gi;
    const functions: string[] = [];
    let match;

    while ((match = functionRegex0.exec(content)) !== null) {
      const functionName = match[1] || match[2] || match[3];
      if (functionName) {
        functions0.push(functionName);
      }
    }

    return functions;
  }

  private generateChecksum(content: string): string {
    // Simple hash - could use crypto for production
    let hash = 0;
    for (let i = 0; i < content0.length; i++) {
      const char = content0.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash0.toString(16);
  }

  private getNextPhase(currentPhase: SPARCPhase): SPARCPhase {
    const phases: SPARCPhase[] = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];
    const currentIndex = phases0.indexOf(currentPhase);
    return phases[currentIndex + 1] || 'completion';
  }

  private calculateProgress(project: any): number {
    // Calculate progress from advanced SPARC result
    return project0.metrics?0.completeness || 0;
  }

  // New helper methods for advanced bridge integration
  private estimateCostFromStory(story: StoryDocumentEntity): number {
    const baseEstimate = 10000; // Base cost
    const storyPointMultiplier = story0.story_points || 1;
    const priorityMultiplier =
      story0.priority === 'high'
        ? 10.5
        : story0.priority === 'critical'
          ? 20.0
          : 10.0;
    return baseEstimate * storyPointMultiplier * priorityMultiplier;
  }

  private estimateTimeframeFromStory(story: StoryDocumentEntity): string {
    const storyPoints = story0.story_points || 1;
    if (storyPoints <= 3) return '1-2 weeks';
    if (storyPoints <= 8) return '2-4 weeks';
    if (storyPoints <= 13) return '1-2 months';
    return '2+ months';
  }

  private assessRiskFromStory(story: StoryDocumentEntity): string {
    if (story0.priority === 'critical') return 'high';
    if (story0.story_points && story0.story_points > 8) return 'medium';
    return 'low';
  }

  private async updateStoryWithSPARCBridge(
    story: StoryDocumentEntity,
    feature: any,
    sparcResult: SparcExecutionResult
  ): Promise<void> {
    const updates = {
      sparc_implementation: {
        sparc_project_id: sparcResult0.projectId,
        parent_feature_context: {
          feature_id: feature0.id,
          feature_title: feature0.title,
          feature_type: feature0.feature_type,
          architectural_context: feature0.technical_approach,
        },
        sparc_phases: {
          specification: {
            status: sparcResult0.phases0.specification
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult0.phases0.specification
              ? [sparcResult0.specification]
              : [],
            completion_date: sparcResult0.phases0.specification
              ? new Date()
              : undefined,
            quality_score: sparcResult0.metrics0.qualityScore,
          },
          pseudocode: {
            status: sparcResult0.phases0.pseudocode
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult0.phases0.pseudocode
              ? ['Algorithm design']
              : [],
            completion_date: sparcResult0.phases0.pseudocode
              ? new Date()
              : undefined,
            algorithms: [],
          },
          architecture: {
            status: sparcResult0.phases0.architecture
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult0.phases0.architecture
              ? [sparcResult0.architecture]
              : [],
            completion_date: sparcResult0.phases0.architecture
              ? new Date()
              : undefined,
            components: [],
          },
          refinement: {
            status: sparcResult0.phases0.refinement
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult0.phases0.refinement
              ? ['Optimized implementation']
              : [],
            completion_date: sparcResult0.phases0.refinement
              ? new Date()
              : undefined,
            optimizations: [],
          },
          completion: {
            status: sparcResult0.phases0.completion
              ? 'completed'
              : ('pending' as const),
            deliverables: sparcResult0.phases0.completion
              ? [sparcResult0.implementation]
              : [],
            completion_date: sparcResult0.phases0.completion
              ? new Date()
              : undefined,
            artifacts: [],
          },
        },
        current_sparc_phase: 'completion' as const,
        sparc_progress_percentage: sparcResult0.metrics0.completeness,
        use_sparc_methodology: true,
        safe_hierarchy_context: {
          business_epic_id: feature0.parent_business_epic_id,
          program_epic_id: feature0.parent_program_epic_id,
          feature_id: feature0.id,
          story_id: story0.id,
        },
      },
    };

    await this0.documentManager0.updateDocument(story0.id, updates);
  }

  private async updateStoryWithBridgeResults(
    story: StoryDocumentEntity,
    result: SparcExecutionResult
  ): Promise<void> {
    const updates = {
      implementation_status:
        result0.status === 'complete' ? 'code_complete' : 'in_progress',
      'sparc_implementation0.sparc_progress_percentage':
        result0.metrics0.completeness,
      status: result0.status === 'complete' ? 'done' : 'in_progress',
      completion_percentage: result0.metrics0.completeness,
    };

    await this0.documentManager0.updateDocument(story0.id, updates);
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
        content: sparcResult0.specification,
        type: 'research',
      },
      {
        phase: 'architecture',
        content: sparcResult0.architecture,
        type: 'development',
      },
      {
        phase: 'implementation',
        content: sparcResult0.implementation,
        type: 'development',
      },
    ];

    for (const { phase, content, type } of phaseMapping) {
      if (content) {
        const task: any = {
          id: nanoid(),
          type: 'task',
          title: `Implement ${phase} for ${story0.title}`,
          content: content,
          summary: `Generated from SPARC ${phase} deliverable using bridge infrastructure`,
          status: 'todo',
          priority: story0.priority || 'medium',
          author: 'sparc-bridge-system',
          tags: [
            'sparc-generated',
            phase,
            story0.story_type,
            feature0.feature_type,
            'bridge-integrated',
          ],

          // Task-specific fields with bridge integration
          task_type: type as
            | 'development'
            | 'testing'
            | 'documentation'
            | 'deployment'
            | 'research',
          estimated_hours: this0.estimateHoursFromPhase(phase),

          implementation_details: {
            files_to_create: [`${phase}0.${this0.getFileExtension(phase)}`],
            files_to_modify: [],
            test_files: phase === 'implementation' ? [`test_${phase}0.ts`] : [],
            documentation_updates: [`${phase}0.md`],
          },

          technical_specifications: {
            component: `${story0.title} - ${phase}`,
            module: feature0.title,
            functions: this0.extractFunctionsFromContent(content),
            dependencies: [],
          },

          // Full SAFe hierarchy traceability with bridge integration
          source_story_id: story0.id,
          assigned_to: story0.assigned_to,

          // SPARC bridge integration details
          sparc_implementation_details: {
            parent_story_sparc_id: sparcResult0.projectId,
            parent_feature_sparc_id: feature0.id,
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
                file_path: `${sparcResult0.projectId}/${phase}0.artifact`,
                content: content,
                checksum: this0.generateChecksum(content),
              },
            ],
            complexity_analysis: {
              time_complexity: 'O(n)',
              space_complexity: 'O(1)',
              maintainability_score: sparcResult0.metrics0.qualityScore * 100,
              performance_impact:
                sparcResult0.metrics0.completeness > 80 ? 'high' : 'medium',
            },
            safe_hierarchy_traceability: {
              business_epic_id: feature0.parent_business_epic_id,
              program_epic_id: feature0.parent_program_epic_id,
              feature_id: feature0.id,
              story_id: story0.id,
              task_id: undefined, // Will be set after task creation
            },
            bridge_integration: {
              ai_orchestration_used: true,
              neural_coordination_applied: true,
              swarm_intelligence_leveraged: true,
              quality_score: sparcResult0.metrics0.qualityScore,
              bridge_version: '20.0.0',
            },
          },

          completion_status: 'todo',

          // Metadata with bridge integration
          project_id: story0.project_id || feature0.project_id,
          parent_document_id: story0.id,
          dependencies: [],
          related_documents: [story0.id, feature0.id],
          safe_hierarchy: {
            business_epic_id: feature0.parent_business_epic_id,
            program_epic_id: feature0.parent_program_epic_id,
            feature_id: feature0.id,
            story_id: story0.id,
          },
          version: '20.0.0',
          checksum: this0.generateChecksum(content),
          metadata: {
            sparc_generated: true,
            sparc_deliverable_id: nanoid(),
            sparc_phase: phase,
            quality_score: sparcResult0.metrics0.qualityScore,
            source_story_title: story0.title,
            source_feature_title: feature0.title,
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
            feature0.feature_type,
            'sparc-generated',
            'bridge-integrated',
            'ai-orchestrated',
          ],
          workflow_stage: 'implementation',
          completion_percentage: 0,
        };

        // Create task in database
        await this0.documentManager0.createDocument(task);
        tasks0.push(task);
      }
    }

    this0.logger0.info(
      `Generated ${tasks0.length} traceable tasks from SPARC bridge deliverables for story "${story0.title}" in feature "${feature0.title}"`
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
    return extensions[phase] || 'txt';
  }

  private setupEventHandlers(): void {
    // Set up event handlers for bridge infrastructure
    this0.sparcCommander0.on('project:initialized', (event) => {
      this0.emit('sparc:workflow:initialized', {
        workflowId: event0.project0.id,
        aiOrchestration: this0.configuration0.aiOrchestration,
      });
    });

    this0.sparcCommander0.on('methodology:completed', (event) => {
      this0.logger0.info(`SPARC methodology completed: ${event0.project0.id}`);
    });

    this0.databaseSPARCBridge0.on('work:assigned', (event) => {
      this0.logger0.info(`Work assigned to bridge: ${event0.assignment0.id}`);
    });

    this0.databaseSPARCBridge0.on('work:completed', (event) => {
      this0.logger0.info(`Work completed by bridge: ${event0.assignment0.id}`);
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
    return Array0.from(this0.activeProjects?0.values());
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
    return this0.activeProjects0.get(storyId);
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
    return Array0.from(this0.activeProjects?0.values())0.find(
      (project) => project0.feature0.id === featureId
    );
  }
}
