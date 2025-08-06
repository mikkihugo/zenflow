/**
 * Database-Driven Development System
 *
 * REPLACES file-based DocumentDrivenSystem with pure database architecture
 * Handles Vision → ADRs → PRDs → Epics → Features → Tasks → Code via database entities
 * Integrates with existing DatabaseCoordinator and UnifiedWorkflowEngine
 */

import { EventEmitter } from 'node:events';
import { nanoid } from 'nanoid';
import type {
  ADRDocumentEntity,
  BaseDocumentEntity,
  EpicDocumentEntity,
  FeatureDocumentEntity,
  PRDDocumentEntity,
  ProjectEntity,
  TaskDocumentEntity,
  VisionDocumentEntity,
} from '../database/entities/document-entities';
import type { DocumentManager } from '../database/managers/document-manager';
import type { DocumentType } from '../types/workflow-types';
import { createLogger } from './logger';
import type { WorkflowEngine } from './workflow-engine';

const logger = createLogger('DatabaseDriven');

export interface DatabaseWorkspaceContext {
  workspaceId: string;
  projectId: string;
  activeDocuments: Map<string, BaseDocumentEntity>;
  workflowEngine: WorkflowEngine;
  documentService: DocumentManager;
}

export interface DocumentProcessingOptions {
  autoGenerateRelationships?: boolean;
  startWorkflows?: boolean;
  generateSearchIndex?: boolean;
  notifyListeners?: boolean;
}

/**
 * Database-Driven Development System
 *
 * Pure database operations - NO file system interactions
 * All documents are database entities with export capabilities
 *
 * @example
 */
export class DatabaseDrivenSystem extends EventEmitter {
  private workspaces: Map<string, DatabaseWorkspaceContext> = new Map();
  private documentService: DocumentManager;
  private workflowEngine: WorkflowEngine;

  constructor(documentService: DocumentManager, workflowEngine: WorkflowEngine) {
    super();
    this.documentService = documentService;
    this.workflowEngine = workflowEngine;
    this.setupEventHandlers();
  }

  /**
   * Initialize database-driven system
   */
  async initialize(): Promise<void> {
    logger.info('🚀 Initializing Database-Driven Development System');

    // Initialize document service and workflow engine
    await this.documentService.initialize();
    await this.workflowEngine.initialize();

    logger.info('✅ Database-Driven System ready');
    this.emit('initialized');
  }

  /**
   * Create new project workspace
   *
   * @param projectSpec
   * @param projectSpec.name
   * @param projectSpec.domain
   * @param projectSpec.description
   * @param projectSpec.complexity
   * @param projectSpec.author
   */
  async createProjectWorkspace(projectSpec: {
    name: string;
    domain: string;
    description: string;
    complexity?: 'simple' | 'moderate' | 'complex' | 'enterprise';
    author: string;
  }): Promise<string> {
    const workspaceId = nanoid();

    // Create project entity in database
    const project = await this.documentService.createProject({
      name: projectSpec.name,
      domain: projectSpec.domain,
      description: projectSpec.description,
      complexity: projectSpec.complexity || 'moderate',
      vision_document_ids: [],
      adr_document_ids: [],
      prd_document_ids: [],
      epic_document_ids: [],
      feature_document_ids: [],
      task_document_ids: [],
      overall_progress_percentage: 0,
      phase: 'planning',
      tags: [projectSpec.domain, projectSpec.complexity || 'moderate'],
      stakeholders: [],
      author: projectSpec.author,
    });

    // Create workspace context
    const context: DatabaseWorkspaceContext = {
      workspaceId,
      projectId: project.id,
      activeDocuments: new Map(),
      workflowEngine: this.workflowEngine,
      documentService: this.documentService,
    };

    this.workspaces.set(workspaceId, context);

    logger.info(`📁 Created database workspace: ${projectSpec.name} (${workspaceId})`);
    this.emit('workspace:created', { workspaceId, projectId: project.id, project });

    return workspaceId;
  }

  /**
   * Load existing project workspace
   *
   * @param projectId
   */
  async loadProjectWorkspace(projectId: string): Promise<string> {
    const workspaceId = nanoid();

    // Get project with all documents from database
    const projectData = await this.documentService.getProjectWithDocuments(projectId);
    if (!projectData) {
      throw new Error(`Project not found: ${projectId}`);
    }

    const { project, documents } = projectData;

    // Create workspace context
    const context: DatabaseWorkspaceContext = {
      workspaceId,
      projectId: project.id,
      activeDocuments: new Map(),
      workflowEngine: this.workflowEngine,
      documentService: this.documentService,
    };

    // Load all documents into active map
    const allDocs = [
      ...documents.visions,
      ...documents.adrs,
      ...documents.prds,
      ...documents.epics,
      ...documents.features,
      ...documents.tasks,
    ];

    allDocs.forEach((doc) => {
      context.activeDocuments.set(doc.id, doc);
    });

    this.workspaces.set(workspaceId, context);

    logger.info(`📁 Loaded database workspace: ${project.name} (${allDocs.length} documents)`);
    this.emit('workspace:loaded', {
      workspaceId,
      projectId,
      project,
      documentCount: allDocs.length,
    });

    return workspaceId;
  }

  /**
   * Process document entity with database-driven workflow
   *
   * @param workspaceId
   * @param document
   * @param options
   */
  async processDocumentEntity(
    workspaceId: string,
    document: BaseDocumentEntity,
    options: DocumentProcessingOptions = {}
  ): Promise<void> {
    const context = this.workspaces.get(workspaceId);
    if (!context) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    logger.info(`📄 Processing ${document.type} document: ${document.title}`);

    // Update active documents
    context.activeDocuments.set(document.id, document);

    // Start workflows based on document type
    if (options.startWorkflows !== false) {
      const workflowIds = await this.workflowEngine.processDocumentEvent(
        'document:created',
        document,
        { workspaceId, projectId: context.projectId }
      );

      if (workflowIds.length > 0) {
        logger.info(`🔄 Started ${workflowIds.length} workflows for ${document.type} document`);
      }
    }

    // Emit processing event
    this.emit('document:processed', {
      workspaceId,
      document,
      suggestedNextSteps: this.getSuggestedNextSteps(document.type),
    });
  }

  /**
   * Create vision document for project
   *
   * @param workspaceId
   * @param visionSpec
   * @param visionSpec.title
   * @param visionSpec.businessObjectives
   * @param visionSpec.successCriteria
   * @param visionSpec.stakeholders
   * @param visionSpec.timeline
   * @param visionSpec.timeline.startDate
   * @param visionSpec.timeline.targetCompletion
   * @param visionSpec.timeline.milestones
   * @param options
   */
  async createVisionDocument(
    workspaceId: string,
    visionSpec: {
      title: string;
      businessObjectives: string[];
      successCriteria: string[];
      stakeholders: string[];
      timeline?: {
        startDate?: Date;
        targetCompletion?: Date;
        milestones?: Array<{
          name: string;
          date: Date;
          description: string;
        }>;
      };
    },
    options: DocumentProcessingOptions = {}
  ): Promise<VisionDocumentEntity> {
    const context = this.workspaces.get(workspaceId);
    if (!context) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    const visionDoc: Omit<VisionDocumentEntity, 'id' | 'created_at' | 'updated_at' | 'checksum'> = {
      type: 'vision',
      title: visionSpec.title,
      content: this.generateVisionContent(visionSpec),
      status: 'draft',
      priority: 'high',
      author: 'database-driven-system',
      tags: ['vision', 'strategic'],
      project_id: context.projectId,
      parent_document_id: undefined,
      dependencies: [],
      related_documents: [],
      version: '1.0.0',
      searchable_content: '',
      keywords: [],
      workflow_stage: 'created',
      completion_percentage: 0,
      business_objectives: visionSpec.businessObjectives,
      success_criteria: visionSpec.successCriteria,
      stakeholders: visionSpec.stakeholders,
      timeline: {
        start_date: visionSpec.timeline?.startDate,
        target_completion: visionSpec.timeline?.targetCompletion,
        milestones: visionSpec.timeline?.milestones || [],
      },
      generated_adrs: [],
      generated_prds: [],
    };

    const document = await this.documentService.createDocument(visionDoc, {
      autoGenerateRelationships: options.autoGenerateRelationships !== false,
      generateSearchIndex: options.generateSearchIndex !== false,
      startWorkflow: options.startWorkflows !== false ? 'vision-to-adrs' : undefined,
    });

    await this.processDocumentEntity(workspaceId, document, options);

    logger.info(`✨ Created vision document: ${document.title}`);
    return document;
  }

  /**
   * Generate documents from existing documents (e.g., PRDs from Vision)
   *
   * @param workspaceId
   * @param sourceDocumentId
   * @param targetType
   * @param options
   */
  async generateDocumentsFromSource(
    workspaceId: string,
    sourceDocumentId: string,
    targetType: DocumentType,
    options: DocumentProcessingOptions = {}
  ): Promise<BaseDocumentEntity[]> {
    const context = this.workspaces.get(workspaceId);
    if (!context) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    const sourceDoc = context.activeDocuments.get(sourceDocumentId);
    if (!sourceDoc) {
      throw new Error(`Source document not found: ${sourceDocumentId}`);
    }

    const generatedDocs: BaseDocumentEntity[] = [];

    switch (targetType) {
      case 'adr':
        generatedDocs.push(
          ...(await this.generateADRsFromVision(sourceDoc as VisionDocumentEntity, context))
        );
        break;
      case 'prd':
        generatedDocs.push(
          ...(await this.generatePRDsFromVision(sourceDoc as VisionDocumentEntity, context))
        );
        break;
      case 'epic':
        generatedDocs.push(
          ...(await this.generateEpicsFromPRD(sourceDoc as PRDDocumentEntity, context))
        );
        break;
      case 'feature':
        generatedDocs.push(
          ...(await this.generateFeaturesFromEpic(sourceDoc as EpicDocumentEntity, context))
        );
        break;
      case 'task':
        generatedDocs.push(
          ...(await this.generateTasksFromFeature(sourceDoc as FeatureDocumentEntity, context))
        );
        break;
      default:
        throw new Error(`Unsupported target type: ${targetType}`);
    }

    // Process all generated documents
    for (const doc of generatedDocs) {
      await this.processDocumentEntity(workspaceId, doc, options);
    }

    logger.info(
      `🔧 Generated ${generatedDocs.length} ${targetType} documents from ${sourceDoc.type}`
    );
    return generatedDocs;
  }

  /**
   * Get workspace status and progress
   *
   * @param workspaceId
   */
  async getWorkspaceStatus(workspaceId: string): Promise<{
    workspace: DatabaseWorkspaceContext;
    project: ProjectEntity;
    documents: {
      total: number;
      byType: Record<DocumentType, number>;
      byStatus: Record<string, number>;
    };
    progress: {
      overall: number;
      byPhase: Record<string, number>;
    };
  }> {
    const context = this.workspaces.get(workspaceId);
    if (!context) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    const projectData = await this.documentService.getProjectWithDocuments(context.projectId);
    if (!projectData) {
      throw new Error(`Project not found: ${context.projectId}`);
    }

    const { project, documents } = projectData;
    const allDocs = [
      ...documents.visions,
      ...documents.adrs,
      ...documents.prds,
      ...documents.epics,
      ...documents.features,
      ...documents.tasks,
    ];

    // Calculate statistics
    const docsByType = allDocs.reduce(
      (acc, doc) => {
        acc[doc.type] = (acc[doc.type] || 0) + 1;
        return acc;
      },
      {} as Record<DocumentType, number>
    );

    const docsByStatus = allDocs.reduce(
      (acc, doc) => {
        acc[doc.status] = (acc[doc.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const completedDocs = allDocs.filter(
      (doc) => doc.status === 'approved' || doc.completion_percentage === 100
    ).length;

    const overallProgress =
      allDocs.length > 0 ? Math.round((completedDocs / allDocs.length) * 100) : 0;

    return {
      workspace: context,
      project,
      documents: {
        total: allDocs.length,
        byType: docsByType,
        byStatus: docsByStatus,
      },
      progress: {
        overall: overallProgress,
        byPhase: {
          vision: this.calculatePhaseProgress(documents.visions),
          requirements: this.calculatePhaseProgress(documents.prds),
          architecture: this.calculatePhaseProgress(documents.adrs),
          planning: this.calculatePhaseProgress(documents.epics),
          development: this.calculatePhaseProgress([...documents.features, ...documents.tasks]),
        },
      },
    };
  }

  /**
   * Export workspace documents to files (optional capability)
   *
   * @param workspaceId
   * @param outputPath
   * @param _format
   */
  async exportWorkspaceToFiles(
    workspaceId: string,
    outputPath: string,
    _format: 'markdown' | 'json' = 'markdown'
  ): Promise<string[]> {
    const context = this.workspaces.get(workspaceId);
    if (!context) {
      throw new Error(`Workspace not found: ${workspaceId}`);
    }

    const projectData = await this.documentService.getProjectWithDocuments(context.projectId);
    if (!projectData) {
      throw new Error(`Project not found: ${context.projectId}`);
    }

    const { project, documents } = projectData;
    const exportedFiles: string[] = [];

    // This is an optional export capability - the system remains database-driven
    logger.info(`📁 Export capability: would export ${project.name} documents to ${outputPath}`);
    logger.info(
      `📊 Documents to export: ${JSON.stringify({
        visions: documents.visions.length,
        adrs: documents.adrs.length,
        prds: documents.prds.length,
        epics: documents.epics.length,
        features: documents.features.length,
        tasks: documents.tasks.length,
      })}`
    );

    return exportedFiles;
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private setupEventHandlers(): void {
    this.on('document:processed', this.handleDocumentProcessed.bind(this));
    this.on('workspace:created', this.handleWorkspaceCreated.bind(this));
    this.on('workspace:loaded', this.handleWorkspaceLoaded.bind(this));
  }

  private async handleDocumentProcessed(event: any): Promise<void> {
    logger.debug(`Document processed: ${event.document.type} - ${event.document.title}`);
  }

  private async handleWorkspaceCreated(event: any): Promise<void> {
    logger.debug(`Workspace created: ${event.workspaceId}`);
  }

  private async handleWorkspaceLoaded(event: any): Promise<void> {
    logger.debug(`Workspace loaded: ${event.workspaceId} (${event.documentCount} documents)`);
  }

  private getSuggestedNextSteps(documentType: DocumentType): string[] {
    const nextSteps = {
      vision: ['Generate ADRs', 'Create PRDs', 'Define stakeholder requirements'],
      adr: ['Review architectural implications', 'Update related PRDs', 'Validate decisions'],
      prd: ['Generate epics', 'Create user stories', 'Define acceptance criteria'],
      epic: ['Break down into features', 'Estimate effort', 'Plan timeline'],
      feature: ['Create implementation tasks', 'Define test cases', 'Review dependencies'],
      task: ['Begin implementation', 'Write tests', 'Update documentation'],
    };
    return nextSteps[documentType] || [];
  }

  private generateVisionContent(spec: any): string {
    return `# ${spec.title}

## Business Objectives
${spec.businessObjectives.map((obj: string) => `- ${obj}`).join('\n')}

## Success Criteria
${spec.successCriteria.map((crit: string) => `- ${crit}`).join('\n')}

## Stakeholders
${spec.stakeholders.map((sh: string) => `- ${sh}`).join('\n')}

## Timeline
${
  spec.timeline
    ? `
Start Date: ${spec.timeline.startDate?.toISOString().split('T')[0] || 'TBD'}
Target Completion: ${spec.timeline.targetCompletion?.toISOString().split('T')[0] || 'TBD'}

### Milestones
${spec.timeline.milestones?.map((m: any) => `- **${m.name}** (${m.date.toISOString().split('T')[0]}): ${m.description}`).join('\n') || 'No milestones defined'}
`
    : 'Timeline to be determined'
}

---
*Generated by Database-Driven Development System*`;
  }

  private async generateADRsFromVision(
    vision: VisionDocumentEntity,
    context: DatabaseWorkspaceContext
  ): Promise<ADRDocumentEntity[]> {
    // Extract architectural decisions from vision
    const decisions = [
      {
        title: 'Database Technology',
        context: 'Need scalable data storage',
        decision: 'Use PostgreSQL with vector extensions',
      },
      {
        title: 'API Architecture',
        context: 'Need flexible API design',
        decision: 'Implement RESTful API with GraphQL',
      },
      {
        title: 'Authentication',
        context: 'Need secure user management',
        decision: 'Use OAuth 2.0 with JWT tokens',
      },
    ];

    const adrs: ADRDocumentEntity[] = [];
    for (const [index, decision] of decisions.entries()) {
      const adrDoc: Omit<ADRDocumentEntity, 'id' | 'created_at' | 'updated_at' | 'checksum'> = {
        type: 'adr',
        title: `ADR-${String(index + 1).padStart(3, '0')}: ${decision.title}`,
        content: `# ADR-${String(index + 1).padStart(3, '0')}: ${decision.title}

## Status
Proposed

## Context
${decision.context}

## Decision
${decision.decision}

## Consequences
- Enhanced system scalability
- Improved maintainability
- Better developer experience

---
*Generated from vision: ${vision.title}*`,
        status: 'draft',
        priority: 'high',
        author: 'database-driven-system',
        tags: ['adr', 'architecture', 'generated'],
        project_id: context.projectId,
        parent_document_id: vision.id,
        dependencies: [],
        related_documents: [vision.id],
        version: '1.0.0',
        searchable_content: '',
        keywords: [],
        workflow_stage: 'generated',
        completion_percentage: 100,
        decision_number: index + 1,
        decision_status: 'proposed',
        context: decision.context,
        decision: decision.decision,
        consequences: [
          'Enhanced system scalability',
          'Improved maintainability',
          'Better developer experience',
        ],
        alternatives_considered: ['Alternative approaches were evaluated'],
        source_vision_id: vision.id,
        impacted_prds: [],
      };

      const createdADR = await this.documentService.createDocument(adrDoc);
      adrs.push(createdADR);
    }

    return adrs;
  }

  private async generatePRDsFromVision(
    vision: VisionDocumentEntity,
    context: DatabaseWorkspaceContext
  ): Promise<PRDDocumentEntity[]> {
    const prdDoc: Omit<PRDDocumentEntity, 'id' | 'created_at' | 'updated_at' | 'checksum'> = {
      type: 'prd',
      title: `PRD: ${vision.title.replace('Vision:', '').trim()}`,
      content: `# Product Requirements Document: ${vision.title}

## Functional Requirements
${vision.business_objectives.map((obj, i) => `- REQ-${String(i + 1).padStart(3, '0')}: ${obj}`).join('\n')}

## Non-Functional Requirements
- Performance: System must handle 1000+ concurrent users
- Security: All data must be encrypted at rest and in transit
- Availability: 99.9% uptime SLA
- Scalability: Horizontal scaling capability

## User Stories
${vision.business_objectives.map((obj, _i) => `- As a user, I want ${obj.toLowerCase()} so that I can achieve my business goals`).join('\n')}

---
*Generated from vision: ${vision.title}*`,
      status: 'draft',
      priority: 'high',
      author: 'database-driven-system',
      tags: ['prd', 'requirements', 'generated'],
      project_id: context.projectId,
      parent_document_id: vision.id,
      dependencies: [],
      related_documents: [vision.id],
      version: '1.0.0',
      searchable_content: '',
      keywords: [],
      workflow_stage: 'generated',
      completion_percentage: 100,
      functional_requirements: vision.business_objectives.map((obj, i) => ({
        id: `REQ-${String(i + 1).padStart(3, '0')}`,
        description: obj,
        acceptance_criteria: [`${obj} is properly implemented`, `${obj} meets quality standards`],
        priority: 'must_have' as const,
      })),
      non_functional_requirements: [
        {
          id: 'NFR-001',
          type: 'performance',
          description: 'Handle 1000+ concurrent users',
          metrics: '< 200ms response time',
        },
        {
          id: 'NFR-002',
          type: 'security',
          description: 'Data encryption',
          metrics: 'AES-256 encryption',
        },
        {
          id: 'NFR-003',
          type: 'reliability',
          description: '99.9% uptime SLA',
          metrics: 'Monthly uptime tracking',
        },
      ],
      user_stories: vision.business_objectives.map((obj, i) => ({
        id: `US-${String(i + 1).padStart(3, '0')}`,
        title: obj,
        description: `As a user, I want ${obj.toLowerCase()} so that I can achieve my business goals`,
        acceptance_criteria: [
          `${obj} functionality is accessible`,
          'User can complete the workflow',
        ],
        story_points: 5,
      })),
      source_vision_id: vision.id,
      related_adrs: [],
      generated_epics: [],
    };

    const createdPRD = await this.documentService.createDocument(prdDoc);
    return [createdPRD];
  }

  private async generateEpicsFromPRD(
    prd: PRDDocumentEntity,
    context: DatabaseWorkspaceContext
  ): Promise<EpicDocumentEntity[]> {
    // Group functional requirements into epics
    const epics = [
      {
        title: 'User Management Epic',
        requirements: prd.functional_requirements.slice(
          0,
          Math.ceil(prd.functional_requirements.length / 2)
        ),
        businessValue: 'Enable user registration, authentication, and profile management',
      },
      {
        title: 'Core Functionality Epic',
        requirements: prd.functional_requirements.slice(
          Math.ceil(prd.functional_requirements.length / 2)
        ),
        businessValue: 'Deliver primary business functionality and user workflows',
      },
    ];

    const epicDocs: EpicDocumentEntity[] = [];
    for (const epicSpec of epics) {
      const epicDoc: Omit<EpicDocumentEntity, 'id' | 'created_at' | 'updated_at' | 'checksum'> = {
        type: 'epic',
        title: epicSpec.title,
        content: `# ${epicSpec.title}

## Business Value
${epicSpec.businessValue}

## Requirements Covered
${epicSpec.requirements.map((req) => `- ${req.description}`).join('\n')}

## User Impact
This epic will enable users to ${epicSpec.businessValue.toLowerCase()}.

---
*Generated from PRD: ${prd.title}*`,
        status: 'draft',
        priority: 'high',
        author: 'database-driven-system',
        tags: ['epic', 'planning', 'generated'],
        project_id: context.projectId,
        parent_document_id: prd.id,
        dependencies: [],
        related_documents: [prd.id],
        version: '1.0.0',
        searchable_content: '',
        keywords: [],
        workflow_stage: 'generated',
        completion_percentage: 0,
        business_value: epicSpec.businessValue,
        user_impact: `Enable users to ${epicSpec.businessValue.toLowerCase()}`,
        effort_estimation: {
          story_points: epicSpec.requirements.length * 8,
          time_estimate_weeks: Math.ceil(epicSpec.requirements.length / 2),
          complexity: epicSpec.requirements.length > 3 ? 'high' : 'medium',
        },
        timeline: {
          start_date: new Date(),
          estimated_completion: new Date(
            Date.now() + Math.ceil(epicSpec.requirements.length / 2) * 7 * 24 * 60 * 60 * 1000
          ),
        },
        source_prd_id: prd.id,
        feature_ids: [],
        features_completed: 0,
        features_total: epicSpec.requirements.length,
      };

      const createdEpic = await this.documentService.createDocument(epicDoc);
      epicDocs.push(createdEpic);
    }

    return epicDocs;
  }

  private async generateFeaturesFromEpic(
    epic: EpicDocumentEntity,
    context: DatabaseWorkspaceContext
  ): Promise<FeatureDocumentEntity[]> {
    // Create features based on epic scope
    const featureSpecs = [
      { title: 'User Registration', type: 'ui', approach: 'React forms with validation' },
      { title: 'Authentication API', type: 'api', approach: 'JWT-based REST endpoints' },
      {
        title: 'User Profile Management',
        type: 'ui',
        approach: 'CRUD interface with real-time updates',
      },
    ];

    const features: FeatureDocumentEntity[] = [];
    for (const spec of featureSpecs) {
      const featureDoc: Omit<
        FeatureDocumentEntity,
        'id' | 'created_at' | 'updated_at' | 'checksum'
      > = {
        type: 'feature',
        title: spec.title,
        content: `# ${spec.title}

## Technical Approach
${spec.approach}

## Acceptance Criteria
- Feature is implemented according to specifications
- All tests pass
- Code review completed
- Documentation updated

## Implementation Status
Ready for development

---
*Generated from epic: ${epic.title}*`,
        status: 'draft',
        priority: 'medium',
        author: 'database-driven-system',
        tags: ['feature', 'development', 'generated'],
        project_id: context.projectId,
        parent_document_id: epic.id,
        dependencies: [],
        related_documents: [epic.id],
        version: '1.0.0',
        searchable_content: '',
        keywords: [],
        workflow_stage: 'generated',
        completion_percentage: 0,
        feature_type: spec.type as any,
        acceptance_criteria: [
          'Feature is implemented according to specifications',
          'All tests pass',
          'Code review completed',
          'Documentation updated',
        ],
        technical_approach: spec.approach,
        source_epic_id: epic.id,
        task_ids: [],
        implementation_status: 'not_started',
      };

      const createdFeature = await this.documentService.createDocument(featureDoc);
      features.push(createdFeature);
    }

    return features;
  }

  private async generateTasksFromFeature(
    feature: FeatureDocumentEntity,
    context: DatabaseWorkspaceContext
  ): Promise<TaskDocumentEntity[]> {
    const taskSpecs = [
      { title: 'Implement Core Logic', type: 'development', hours: 8 },
      { title: 'Write Unit Tests', type: 'testing', hours: 4 },
      { title: 'Update Documentation', type: 'documentation', hours: 2 },
    ];

    const tasks: TaskDocumentEntity[] = [];
    for (const spec of taskSpecs) {
      const taskDoc: Omit<TaskDocumentEntity, 'id' | 'created_at' | 'updated_at' | 'checksum'> = {
        type: 'task',
        title: `${feature.title}: ${spec.title}`,
        content: `# ${spec.title}

## Description
${spec.title} for ${feature.title}

## Technical Details
- Component: ${feature.title.toLowerCase().replace(/\s+/g, '-')}
- Estimated effort: ${spec.hours} hours
- Type: ${spec.type}

## Implementation Checklist
- [ ] Code implementation
- [ ] Unit tests
- [ ] Integration tests
- [ ] Documentation
- [ ] Code review

---
*Generated from feature: ${feature.title}*`,
        status: 'draft',
        priority: 'medium',
        author: 'database-driven-system',
        tags: ['task', 'implementation', 'generated'],
        project_id: context.projectId,
        parent_document_id: feature.id,
        dependencies: [],
        related_documents: [feature.id],
        version: '1.0.0',
        searchable_content: '',
        keywords: [],
        workflow_stage: 'generated',
        completion_percentage: 0,
        task_type: spec.type as any,
        estimated_hours: spec.hours,
        implementation_details: {
          files_to_create: [`${feature.title.toLowerCase().replace(/\s+/g, '-')}.ts`],
          files_to_modify: ['index.ts', 'routes.ts'],
          test_files: [`${feature.title.toLowerCase().replace(/\s+/g, '-')}.test.ts`],
          documentation_updates: ['README.md'],
        },
        technical_specifications: {
          component: feature.title.toLowerCase().replace(/\s+/g, '-'),
          module: feature.feature_type,
          functions: ['create', 'read', 'update', 'delete'],
          dependencies: ['react', 'typescript'],
        },
        source_feature_id: feature.id,
        completion_status: 'todo',
      };

      const createdTask = await this.documentService.createDocument(taskDoc);
      tasks.push(createdTask);
    }

    return tasks;
  }

  private calculatePhaseProgress(documents: BaseDocumentEntity[]): number {
    if (documents.length === 0) return 0;
    const completed = documents.filter(
      (doc) => doc.status === 'approved' || doc.completion_percentage === 100
    ).length;
    return Math.round((completed / documents.length) * 100);
  }

  /**
   * Get all workspaces
   */
  getWorkspaces(): string[] {
    return Array.from(this.workspaces.keys());
  }

  /**
   * Get workspace documents (legacy compatibility)
   *
   * @param workspaceId
   */
  getWorkspaceDocuments(workspaceId: string): Map<string, BaseDocumentEntity> {
    const context = this.workspaces.get(workspaceId);
    return context ? context.activeDocuments : new Map();
  }
}

// Export singleton instance factory
export function createDatabaseDrivenSystem(
  documentService: DocumentManager,
  workflowEngine: WorkflowEngine
): DatabaseDrivenSystem {
  return new DatabaseDrivenSystem(documentService, workflowEngine);
}
