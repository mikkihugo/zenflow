/**
 * Unified Workflow Engine - Database-Driven Architecture
 *
 * PURE DATABASE-DRIVEN workflow engine - NO FILE OPERATIONS
 * Handles Vision → ADRs → PRDs → Epics → Features → Tasks → Code
 * Uses DocumentService for all document operations
 */

import { EventEmitter } from 'node:events';
import type { BaseDocumentEntity } from '../database/entities/document-entities';
import type { DocumentService } from '../database/services/document-service';
import type {
  DocumentContent,
  StepExecutionResult,
  WorkflowContext,
  WorkflowData,
  WorkflowDefinition,
  WorkflowEngineConfig,
  WorkflowState,
  WorkflowStep,
} from '../types/workflow-types';
import { createLogger } from './logger';
import type { MemorySystem } from './memory-system';

const logger = createLogger('WorkflowEngine');

// WorkflowStep is now imported from types/workflow-types.ts

// WorkflowDefinition is now imported from types/workflow-types.ts

// WorkflowContext is now imported from types/workflow-types.ts

// WorkflowState is now imported from types/workflow-types.ts

// Document workflow definitions
const DOCUMENT_WORKFLOWS: WorkflowDefinition[] = [
  {
    name: 'vision-to-adrs',
    description: 'Process vision document and generate architecture decision records',
    version: '1.0.0',
    documentTypes: ['vision'],
    triggers: [
      { event: 'document:created', condition: 'documentType === "vision"' },
      { event: 'document:updated', condition: 'documentType === "vision"' },
    ],
    steps: [
      {
        type: 'extract-requirements',
        name: 'Extract architectural requirements from vision',
        params: { outputKey: 'architectural_requirements' },
      },
      {
        type: 'identify-decisions',
        name: 'Identify key architectural decisions needed',
        params: { outputKey: 'decision_points' },
      },
      {
        type: 'generate-adrs',
        name: 'Generate ADR documents',
        params: {
          outputKey: 'generated_adrs',
          templatePath: 'templates/adr-template.md',
        },
      },
      {
        type: 'save-documents',
        name: 'Save generated ADRs to workspace',
        params: { documentType: 'adr' },
      },
    ],
  },
  {
    name: 'vision-to-prds',
    description: 'Process vision document and generate product requirements documents',
    version: '1.0.0',
    documentTypes: ['vision'],
    steps: [
      {
        type: 'extract-product-requirements',
        name: 'Extract product requirements from vision',
        params: { outputKey: 'product_requirements' },
      },
      {
        type: 'define-user-stories',
        name: 'Define user stories and acceptance criteria',
        params: { outputKey: 'user_stories' },
      },
      {
        type: 'generate-prds',
        name: 'Generate PRD documents',
        params: {
          outputKey: 'generated_prds',
          templatePath: 'templates/prd-template.md',
        },
      },
      {
        type: 'save-documents',
        name: 'Save generated PRDs to workspace',
        params: { documentType: 'prd' },
      },
    ],
  },
  {
    name: 'prd-to-epics',
    description: 'Break down PRD into epic-level features',
    version: '1.0.0',
    documentTypes: ['prd'],
    triggers: [{ event: 'document:created', condition: 'documentType === "prd"' }],
    steps: [
      {
        type: 'analyze-prd',
        name: 'Analyze PRD for feature groupings',
        params: { outputKey: 'feature_analysis' },
      },
      {
        type: 'create-epics',
        name: 'Create epic-level feature groups',
        params: { outputKey: 'epics' },
      },
      {
        type: 'estimate-effort',
        name: 'Estimate effort for each epic',
        params: { outputKey: 'effort_estimates' },
      },
      {
        type: 'generate-epic-docs',
        name: 'Generate epic documents',
        params: {
          outputKey: 'generated_epics',
          templatePath: 'templates/epic-template.md',
        },
      },
      {
        type: 'save-documents',
        name: 'Save generated epics to workspace',
        params: { documentType: 'epic' },
      },
    ],
  },
  {
    name: 'epic-to-features',
    description: 'Break down epics into individual features',
    version: '1.0.0',
    documentTypes: ['epic'],
    steps: [
      {
        type: 'decompose-epic',
        name: 'Decompose epic into features',
        params: { outputKey: 'features' },
      },
      {
        type: 'define-acceptance-criteria',
        name: 'Define acceptance criteria for features',
        params: { outputKey: 'acceptance_criteria' },
      },
      {
        type: 'generate-feature-docs',
        name: 'Generate feature documents',
        params: {
          outputKey: 'generated_features',
          templatePath: 'templates/feature-template.md',
        },
      },
      {
        type: 'save-documents',
        name: 'Save generated features to workspace',
        params: { documentType: 'feature' },
      },
    ],
  },
  {
    name: 'feature-to-tasks',
    description: 'Break down features into implementable tasks',
    version: '1.0.0',
    documentTypes: ['feature'],
    steps: [
      {
        type: 'analyze-feature',
        name: 'Analyze feature for implementation tasks',
        params: { outputKey: 'task_analysis' },
      },
      {
        type: 'create-tasks',
        name: 'Create implementation tasks',
        params: { outputKey: 'tasks' },
      },
      {
        type: 'estimate-tasks',
        name: 'Estimate task complexity and duration',
        params: { outputKey: 'task_estimates' },
      },
      {
        type: 'sequence-tasks',
        name: 'Determine task dependencies and sequence',
        params: { outputKey: 'task_sequence' },
      },
      {
        type: 'generate-task-docs',
        name: 'Generate task documents',
        params: {
          outputKey: 'generated_tasks',
          templatePath: 'templates/task-template.md',
        },
      },
      {
        type: 'save-documents',
        name: 'Save generated tasks to workspace',
        params: { documentType: 'task' },
      },
    ],
  },
  {
    name: 'task-to-code',
    description: 'Implement tasks as code',
    version: '1.0.0',
    documentTypes: ['task'],
    steps: [
      {
        type: 'analyze-task',
        name: 'Analyze task for implementation approach',
        params: { outputKey: 'implementation_plan' },
      },
      {
        type: 'generate-code',
        name: 'Generate implementation code',
        params: { outputKey: 'generated_code' },
      },
      {
        type: 'generate-tests',
        name: 'Generate unit tests',
        params: { outputKey: 'generated_tests' },
      },
      {
        type: 'generate-docs',
        name: 'Generate code documentation',
        params: { outputKey: 'generated_docs' },
      },
      {
        type: 'save-implementation',
        name: 'Save code to implementation directory',
        params: { outputPath: 'src/implementation' },
      },
    ],
  },
];

export class WorkflowEngine extends EventEmitter {
  private memory: MemorySystem;
  private documentService: DocumentService;
  private activeWorkflows = new Map<string, WorkflowState>();
  private workflowDefinitions = new Map<string, WorkflowDefinition>();
  private stepHandlers = new Map<
    string,
    (context: WorkflowContext, params: WorkflowData) => Promise<StepExecutionResult>
  >();
  private config: WorkflowEngineConfig & {
    maxConcurrentWorkflows: number;
    persistWorkflows: boolean;
    stepTimeout: number;
    retryDelay: number;
    enableVisualization: boolean;
  };

  constructor(
    memory: UnifiedMemorySystem,
    documentService: DocumentService,
    config: Partial<WorkflowEngineConfig> = {}
  ) {
    super();
    this.memory = memory;
    this.documentService = documentService;
    this.config = {
      maxConcurrentWorkflows: 10,
      persistWorkflows: true,
      stepTimeout: 300000, // 5 minutes
      retryDelay: 1000,
      enableVisualization: false,
      workspaceRoot: './',
      templatesPath: './templates',
      outputPath: './output',
      defaultTimeout: 300000,
      enableMetrics: true,
      enablePersistence: true,
      storageBackend: { type: 'database', config: {} },
      ...config,
    };

    this.registerBuiltInHandlers();
    this.registerDocumentWorkflows();
  }

  async initialize(): Promise<void> {
    logger.info('Initializing database-driven workflow engine');

    // Initialize document service if not already done
    await this.documentService.initialize();

    // Load persisted workflows from database
    if (this.config.persistWorkflows) {
      await this.loadPersistedWorkflows();
    }

    // Start workflow monitoring
    this.startWorkflowMonitoring();

    this.emit('initialized');
    logger.info('Database-driven workflow engine ready');
  }

  /**
   * Register built-in step handlers
   */
  private registerBuiltInHandlers(): void {
    // Document processing handlers
    this.registerStepHandler('extract-requirements', this.handleExtractRequirements.bind(this));
    this.registerStepHandler(
      'extract-product-requirements',
      this.handleExtractProductRequirements.bind(this)
    );
    this.registerStepHandler('identify-decisions', this.handleIdentifyDecisions.bind(this));
    this.registerStepHandler('analyze-prd', this.handleAnalyzePRD.bind(this));
    this.registerStepHandler('decompose-epic', this.handleDecomposeEpic.bind(this));
    this.registerStepHandler('analyze-feature', this.handleAnalyzeFeature.bind(this));
    this.registerStepHandler('analyze-task', this.handleAnalyzeTask.bind(this));

    // Generation handlers
    this.registerStepHandler('generate-adrs', this.handleGenerateADRs.bind(this));
    this.registerStepHandler('generate-prds', this.handleGeneratePRDs.bind(this));
    this.registerStepHandler('generate-epic-docs', this.handleGenerateEpicDocs.bind(this));
    this.registerStepHandler('generate-feature-docs', this.handleGenerateFeatureDocs.bind(this));
    this.registerStepHandler('generate-task-docs', this.handleGenerateTaskDocs.bind(this));
    this.registerStepHandler('generate-code', this.handleGenerateCode.bind(this));
    this.registerStepHandler('generate-tests', this.handleGenerateTests.bind(this));
    this.registerStepHandler('generate-docs', this.handleGenerateDocs.bind(this));

    // Persistence handlers
    this.registerStepHandler('save-documents', this.handleSaveDocuments.bind(this));
    this.registerStepHandler('save-implementation', this.handleSaveImplementation.bind(this));

    // Utility handlers
    this.registerStepHandler('delay', this.handleDelay.bind(this));
    this.registerStepHandler('transform', this.handleTransform.bind(this));
    this.registerStepHandler('condition', this.handleCondition.bind(this));

    logger.info(`Registered ${this.stepHandlers.size} built-in step handlers`);
  }

  /**
   * Register document workflow definitions
   */
  private registerDocumentWorkflows(): void {
    for (const workflow of DOCUMENT_WORKFLOWS) {
      this.workflowDefinitions.set(workflow.name, workflow);
    }
    logger.info(`Registered ${DOCUMENT_WORKFLOWS.length} document workflows`);
  }

  /**
   * Register a custom step handler
   */
  registerStepHandler(
    type: string,
    handler: (context: WorkflowContext, params: WorkflowData) => Promise<StepExecutionResult>
  ): void {
    this.stepHandlers.set(type, handler);
    logger.debug(`Registered step handler: ${type}`);
  }

  /**
   * Register a custom workflow definition
   */
  registerWorkflowDefinition(name: string, definition: WorkflowDefinition): void {
    this.workflowDefinitions.set(name, definition);
    logger.info(`Registered workflow definition: ${name}`);
  }

  /**
   * Start a workflow
   */
  async startWorkflow(
    workflowName: string,
    context: Partial<WorkflowContext> = {}
  ): Promise<{ success: boolean; workflowId?: string; error?: string }> {
    const definition = this.workflowDefinitions.get(workflowName);
    if (!definition) {
      throw new Error(`Workflow definition '${workflowName}' not found`);
    }

    // Check concurrent workflow limit
    const activeCount = Array.from(this.activeWorkflows.values()).filter(
      (w) => w.status === 'running'
    ).length;

    if (activeCount >= this.config.maxConcurrentWorkflows) {
      throw new Error(
        `Maximum concurrent workflows (${this.config.maxConcurrentWorkflows}) reached`
      );
    }

    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Create properly typed context
    const fullContext: WorkflowContext = {
      workspaceId: context.workspaceId || 'default',
      sessionId: workflowId,
      documents: context.documents || {},
      currentDocument: context.currentDocument,
      variables: context.variables || {},
      environment: {
        type: 'development',
        nodeVersion: process.version,
        workflowVersion: '1.0.0',
        features: [],
        limits: {
          maxSteps: 100,
          maxDuration: 3600000, // 1 hour
          maxMemory: 1024 * 1024 * 1024, // 1GB
          maxFileSize: 10 * 1024 * 1024, // 10MB
          maxConcurrency: 5,
        },
      },
      permissions: {
        canReadDocuments: true,
        canWriteDocuments: true,
        canDeleteDocuments: false,
        canExecuteSteps: ['*'],
        canAccessResources: ['*'],
      },
      ...context,
    };

    const workflow: WorkflowState = {
      id: workflowId,
      definition,
      status: 'pending',
      context: fullContext,
      currentStepIndex: 0,
      steps: definition.steps.map((step) => ({
        step,
        status: 'pending',
        attempts: 0,
      })),
      stepResults: {},
      completedSteps: [],
      startTime: new Date(),
      progress: {
        percentage: 0,
        completedSteps: 0,
        totalSteps: definition.steps.length,
      },
      metrics: {
        totalDuration: 0,
        avgStepDuration: 0,
        successRate: 0,
        retryRate: 0,
        resourceUsage: {
          cpuTime: 0,
          memoryPeak: 0,
          diskIo: 0,
          networkRequests: 0,
        },
        throughput: 0,
      },
    };

    this.activeWorkflows.set(workflowId, workflow);

    // Store in memory system
    await this.memory.store(`workflow:${workflowId}`, workflow, 'workflows');

    // Start execution asynchronously
    this.executeWorkflow(workflow).catch((error) => {
      logger.error(`Workflow ${workflowId} failed:`, error);
    });

    this.emit('workflow:started', { workflowId, name: workflowName });
    return { success: true, workflowId };
  }

  /**
   * Start workflow based on document entity event
   */
  async processDocumentEvent(
    event: string,
    document: BaseDocumentEntity,
    context: Partial<WorkflowContext> = {}
  ): Promise<string[]> {
    const startedWorkflows: string[] = [];

    for (const [name, definition] of this.workflowDefinitions) {
      if (!definition.triggers) continue;

      for (const trigger of definition.triggers) {
        if (trigger.event === event) {
          // Check document type
          if (definition.documentTypes && !definition.documentTypes.includes(document.type)) {
            continue;
          }

          // Check condition if present
          if (trigger.condition) {
            try {
              const conditionMet = this.evaluateCondition(
                { documentType: document.type, document, ...context },
                trigger.condition
              );
              if (!conditionMet) continue;
            } catch (error) {
              logger.warn(`Failed to evaluate trigger condition for ${name}:`, error);
              continue;
            }
          }

          // Start workflow
          try {
            const result = await this.startWorkflow(name, {
              ...context,
              currentDocument: this.convertEntityToDocumentContent(document),
              documentType: document.type,
            });

            if (result.success && result.workflowId) {
              startedWorkflows.push(result.workflowId);
              logger.info(`Started workflow ${name} for ${event} on ${document.type}`);
            }
          } catch (error) {
            logger.error(`Failed to start workflow ${name}:`, error);
          }
        }
      }
    }

    return startedWorkflows;
  }

  /**
   * Convert database entity to workflow document content
   */
  private convertEntityToDocumentContent(entity: BaseDocumentEntity): DocumentContent {
    return {
      id: entity.id,
      type: entity.type,
      title: entity.title,
      content: entity.content,
      metadata: {
        author: entity.author,
        tags: entity.tags,
        status: entity.status,
        priority: entity.priority,
        dependencies: entity.dependencies,
        relatedDocuments: entity.related_documents,
        checksum: entity.checksum,
      },
      created: entity.created_at,
      updated: entity.updated_at,
      version: entity.version,
    };
  }

  /**
   * Execute a workflow
   */
  private async executeWorkflow(workflow: WorkflowState): Promise<void> {
    try {
      workflow.status = 'running';
      await this.saveWorkflow(workflow);

      for (let i = workflow.currentStep; i < workflow.steps.length; i++) {
        if (workflow.status !== 'running') {
          break; // Workflow was paused or cancelled
        }

        const step = workflow.steps[i];
        workflow.currentStep = i;
        workflow.progress = Math.round((i / workflow.steps.length) * 100);

        await this.executeWorkflowStep(workflow, step, i);
        await this.saveWorkflow(workflow);
      }

      if (workflow.status === 'running') {
        workflow.status = 'completed';
        workflow.progress = 100;
        workflow.endTime = new Date().toISOString();
        this.emit('workflow:completed', { workflowId: workflow.id });
        logger.info(`Workflow ${workflow.id} completed successfully`);
      }
    } catch (error) {
      workflow.status = 'failed';
      workflow.error = (error as Error).message;
      workflow.endTime = new Date().toISOString();
      this.emit('workflow:failed', { workflowId: workflow.id, error });
      logger.error(`Workflow ${workflow.id} failed:`, error);
    } finally {
      await this.saveWorkflow(workflow);
    }
  }

  /**
   * Execute a single workflow step
   */
  private async executeWorkflowStep(
    workflow: WorkflowState,
    step: WorkflowStep,
    stepIndex: number
  ): Promise<void> {
    const stepId = `step-${stepIndex}`;
    let retries = 0;
    const maxRetries = step.retries !== undefined ? step.retries : 0;

    this.emit('step:started', { workflowId: workflow.id, stepId, step });

    while (retries <= maxRetries) {
      try {
        const startTime = Date.now();

        // Check dependencies
        if (step.dependencies) {
          for (const dep of step.dependencies) {
            if (!workflow.stepResults[dep]) {
              throw new Error(`Dependency '${dep}' not satisfied`);
            }
          }
        }

        // Set up timeout
        const timeout = step.timeout || this.config.stepTimeout;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Step timeout')), timeout);
        });

        // Execute step
        const handler = this.stepHandlers.get(step.type);
        if (!handler) {
          throw new Error(`No handler registered for step type: ${step.type}`);
        }

        const stepPromise = handler(workflow.context, step.params || {});
        const result = await Promise.race([stepPromise, timeoutPromise]);

        const duration = Date.now() - startTime;

        // Store result in context if specified
        if (step.output) {
          workflow.context[step.output] = result;
        }

        // Store in step results
        workflow.stepResults[stepId] = result;

        workflow.completedSteps.push({
          index: stepIndex,
          step,
          result,
          duration,
          timestamp: new Date().toISOString(),
        });

        this.emit('step:completed', { workflowId: workflow.id, stepId, result, duration });
        logger.debug(`Step ${step.name || step.type} completed in ${duration}ms`);
        break;
      } catch (error) {
        retries++;
        logger.warn(
          `Step ${step.name || step.type} failed (attempt ${retries}/${maxRetries + 1}): ${(error as Error).message}`
        );

        if (retries > maxRetries) {
          this.emit('step:failed', { workflowId: workflow.id, stepId, error });

          if (step.onError === 'continue') {
            workflow.stepResults[stepId] = { error: (error as Error).message };
            logger.info(`Continuing workflow despite step failure (onError: continue)`);
            break;
          } else if (step.onError === 'skip') {
            workflow.stepResults[stepId] = { skipped: true };
            logger.info(`Skipping step due to error (onError: skip)`);
            break;
          } else {
            throw error;
          }
        } else {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay * retries));
        }
      }
    }
  }

  /**
   * Built-in step handlers
   */
  private async handleExtractRequirements(context: WorkflowContext, _params: any): Promise<any> {
    const document = context.currentDocument;
    if (!document || !document.content) {
      throw new Error('No document content available for requirement extraction');
    }

    // Mock implementation - would use AI/NLP for real extraction
    const requirements = [
      'System must be scalable to handle 10k+ concurrent users',
      'Data must be persisted reliably with ACID guarantees',
      'API must follow RESTful principles',
      'System must be cloud-native and container-ready',
    ];

    logger.info('Extracted architectural requirements from vision document');
    return requirements;
  }

  private async handleExtractProductRequirements(
    context: WorkflowContext,
    params: any
  ): Promise<any> {
    const document = context.currentDocument;

    // Extract requirements based on document content and parameters
    const extractionStrategy = params?.strategy || 'comprehensive';
    const targetComplexity = params?.complexity || 'medium';

    const requirements = {
      functional: [
        'User authentication and authorization',
        'Data CRUD operations',
        'Real-time notifications',
        'Search and filtering capabilities',
      ],
      nonFunctional: [
        'Response time < 200ms for API calls',
        '99.9% uptime SLA',
        'Support for 10k concurrent users',
        'Mobile-responsive design',
      ],
      businessRules: [
        'Users can only access their own data',
        'Admin users have full system access',
        'Data retention policy of 7 years',
      ],
      extractionMetadata: {
        sourceDocument: document?.name || 'unknown',
        extractionStrategy,
        targetComplexity,
        timestamp: new Date().toISOString(),
        confidence: 0.85,
      },
    };

    logger.info('Extracted product requirements from vision document');
    return requirements;
  }

  private async handleGenerateADRs(context: WorkflowContext, params: any): Promise<any> {
    const requirements = context.architectural_requirements || [];
    const decisions = context.decision_points || [];

    // Use decisions for contextual ADR generation
    const _decisionContext = decisions.map((decision: any) => ({
      concern: decision.concern || 'Architecture',
      alternatives: decision.alternatives || [],
      rationale: decision.rationale || 'Technical requirements',
    }));

    const _adrTemplate = params?.template || 'standard';
    const _includeRationale = params?.includeRationale !== false;

    const adrs = requirements.map((req: string, index: number) => ({
      id: `adr-${String(index + 1).padStart(3, '0')}`,
      title: `Architecture Decision: ${req}`,
      status: 'proposed',
      date: new Date().toISOString().split('T')[0],
      content: `# ADR-${String(index + 1).padStart(3, '0')}: ${req}
      \n## Status
      Proposed
      \n## Context
      ${req}
      \n## Decision
      To be determined through analysis and discussion.
      \n## Consequences
      To be evaluated based on chosen solution.`,
    }));

    logger.info(`Generated ${adrs.length} ADR documents`);
    return adrs;
  }

  private async handleSaveDocuments(context: WorkflowContext, params: any): Promise<any> {
    const documents = context[params.outputKey] || context.generated_docs || [];
    const documentType = params.documentType;
    const projectId = context.workspaceId;

    const savedDocuments: BaseDocumentEntity[] = [];

    for (const doc of documents) {
      // Create database document entity
      const documentEntity: Omit<
        BaseDocumentEntity,
        'id' | 'created_at' | 'updated_at' | 'checksum'
      > = {
        type: documentType,
        title: doc.title || doc.id || 'Generated Document',
        content: doc.content || '',
        status: 'draft',
        priority: 'medium',
        author: 'workflow-engine',
        tags: doc.tags || [],
        project_id: projectId,
        parent_document_id: context.currentDocument?.id,
        dependencies: [],
        related_documents: [],
        version: '1.0.0',
        searchable_content: doc.content || '',
        keywords: this.extractKeywords(doc.content || ''),
        workflow_stage: 'generated',
        completion_percentage: 100,
      };

      // Save to database using DocumentService
      const savedDoc = await this.documentService.createDocument(documentEntity, {
        autoGenerateRelationships: true,
        generateSearchIndex: true,
        notifyListeners: true,
      });

      // Store in memory system for legacy compatibility
      await this.memory.store(`document:${savedDoc.id}`, savedDoc, 'documents');

      savedDocuments.push(savedDoc);
    }

    logger.info(`Saved ${savedDocuments.length} ${documentType} documents to database`);
    return {
      documents: savedDocuments,
      count: savedDocuments.length,
      documentIds: savedDocuments.map((d) => d.id),
    };
  }

  // Additional handlers would be implemented here...
  private async handleAnalyzePRD(_context: WorkflowContext, _params: any): Promise<any> {
    // Mock implementation
    return { epics: ['User Management', 'Data Processing', 'Reporting'] };
  }

  private async handleDecomposeEpic(_context: WorkflowContext, _params: any): Promise<any> {
    // Mock implementation
    return { features: ['Login', 'Registration', 'Password Reset'] };
  }

  private async handleAnalyzeFeature(_context: WorkflowContext, _params: any): Promise<any> {
    // Mock implementation
    return { tasks: ['Create UI', 'Implement Backend', 'Write Tests'] };
  }

  private async handleAnalyzeTask(_context: WorkflowContext, _params: any): Promise<any> {
    // Mock implementation
    return { implementation: 'Generate React component with hooks' };
  }

  private async handleGeneratePRDs(_context: WorkflowContext, _params: any): Promise<any> {
    return []; // Mock implementation
  }

  private async handleGenerateEpicDocs(_context: WorkflowContext, _params: any): Promise<any> {
    return []; // Mock implementation
  }

  private async handleGenerateFeatureDocs(_context: WorkflowContext, _params: any): Promise<any> {
    return []; // Mock implementation
  }

  private async handleGenerateTaskDocs(_context: WorkflowContext, _params: any): Promise<any> {
    return []; // Mock implementation
  }

  private async handleGenerateCode(_context: WorkflowContext, _params: any): Promise<any> {
    return { code: '// Generated code placeholder' };
  }

  private async handleGenerateTests(_context: WorkflowContext, _params: any): Promise<any> {
    return { tests: '// Generated test placeholder' };
  }

  private async handleGenerateDocs(_context: WorkflowContext, _params: any): Promise<any> {
    return { docs: '# Generated documentation placeholder' };
  }

  private async handleSaveImplementation(_context: WorkflowContext, _params: any): Promise<any> {
    return { saved: true };
  }

  private async handleDelay(_context: WorkflowContext, params: any): Promise<any> {
    const duration = params.duration || 1000;
    await new Promise((resolve) => setTimeout(resolve, duration));
    return { delayed: duration };
  }

  private async handleTransform(context: WorkflowContext, params: any): Promise<any> {
    const data = this.getContextValue(context, params.input);
    // Simple transformation logic
    return { transformed: data };
  }

  private async handleCondition(context: WorkflowContext, params: any): Promise<any> {
    const condition = this.evaluateCondition(context, params.condition);
    return { conditionMet: condition };
  }

  private async handleIdentifyDecisions(_context: WorkflowContext, _params: any): Promise<any> {
    // Mock implementation
    return ['Database choice', 'Authentication method', 'Deployment strategy'];
  }

  /**
   * Utility methods
   */
  private evaluateCondition(context: WorkflowContext, expression: string): boolean {
    try {
      const contextVars = Object.keys(context)
        .map((key) => `const ${key} = context.${key};`)
        .join('\n');
      const func = new Function(
        'context',
        `${contextVars}
      return ${expression};`
      );
      return func(context);
    } catch (error) {
      logger.error(`Failed to evaluate condition: ${expression}`, error);
      return false;
    }
  }

  private getContextValue(context: WorkflowContext, path: string): any {
    const parts = path.split('.');
    let value = context;

    for (const part of parts) {
      value = value?.[part];
    }

    return value;
  }

  private async saveWorkflow(workflow: WorkflowState): Promise<void> {
    if (!this.config.persistWorkflows) return;

    try {
      // Store in memory system (primary storage)
      await this.memory.store(`workflow:${workflow.id}`, workflow, 'workflows');

      // Also store workflow state in database for persistence
      await this.memory.store(
        `workflow:state:${workflow.id}`,
        {
          id: workflow.id,
          status: workflow.status,
          progress: workflow.progress,
          metrics: workflow.metrics,
          currentStep: workflow.currentStepIndex,
          lastUpdated: new Date().toISOString(),
        },
        'workflow_states'
      );
    } catch (error) {
      logger.error(`Failed to save workflow ${workflow.id}:`, error);
    }
  }

  private async loadPersistedWorkflows(): Promise<void> {
    try {
      // Load workflows from memory system
      const workflows = await this.memory.search('workflow:*', 'workflows');
      let loadedCount = 0;

      for (const [key, workflow] of Object.entries(workflows)) {
        try {
          const workflowState = workflow as WorkflowState;

          if (workflowState.status === 'running' || workflowState.status === 'paused') {
            this.activeWorkflows.set(workflowState.id, workflowState);
            logger.info(`Loaded persisted workflow: ${workflowState.id}`);
            loadedCount++;
          }
        } catch (error) {
          logger.warn(`Failed to load workflow from memory: ${key}`, error);
        }
      }

      logger.info(`Loaded ${loadedCount} persisted workflows from database`);
    } catch (error) {
      logger.error('Failed to load persisted workflows from database:', error);
    }
  }

  private startWorkflowMonitoring(): void {
    // Monitor workflow health every 30 seconds
    setInterval(() => {
      this.monitorWorkflows();
    }, 30000);
  }

  private monitorWorkflows(): void {
    const now = Date.now();
    let monitored = 0;

    for (const [id, workflow] of this.activeWorkflows) {
      const age = now - new Date(workflow.startTime).getTime();

      // Clean up completed workflows older than 1 hour
      if (workflow.status === 'completed' && age > 3600000) {
        this.activeWorkflows.delete(id);
        continue;
      }

      // Check for stuck workflows (running for more than 1 hour)
      if (workflow.status === 'running' && age > 3600000) {
        logger.warn(`Workflow ${id} has been running for ${Math.round(age / 60000)} minutes`);
      }

      monitored++;
    }

    if (monitored > 0) {
      logger.debug(`Monitoring ${monitored} active workflows`);
    }
  }

  /**
   * Public workflow management methods
   */
  async getActiveWorkflows(): Promise<WorkflowState[]> {
    return Array.from(this.activeWorkflows.values()).filter((w) =>
      ['running', 'paused'].includes(w.status)
    );
  }

  async getWorkflowHistory(limit: number = 100): Promise<WorkflowState[]> {
    const workflows = await this.memory.search('workflow:*', 'workflows');

    return Object.values(workflows)
      .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  async getWorkflowMetrics(): Promise<any> {
    const workflows = Array.from(this.activeWorkflows.values());
    const metrics: any = {
      total: workflows.length,
      running: 0,
      paused: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
    };

    workflows.forEach((w) => {
      metrics[w.status] = (metrics[w.status] || 0) + 1;
    });

    return metrics;
  }

  async pauseWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'running') {
      workflow.status = 'paused';
      workflow.pausedAt = new Date().toISOString();
      await this.saveWorkflow(workflow);
      this.emit('workflow:paused', { workflowId });
      return { success: true };
    }
    return { success: false, error: 'Workflow not found or not running' };
  }

  async resumeWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && workflow.status === 'paused') {
      workflow.status = 'running';
      delete workflow.pausedAt;

      // Resume execution
      this.executeWorkflow(workflow).catch((error) => {
        logger.error(`Workflow ${workflowId} failed after resume:`, error);
      });

      this.emit('workflow:resumed', { workflowId });
      return { success: true };
    }
    return { success: false, error: 'Workflow not found or not paused' };
  }

  async cancelWorkflow(workflowId: string): Promise<{ success: boolean; error?: string }> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (workflow && ['running', 'paused'].includes(workflow.status)) {
      workflow.status = 'cancelled';
      workflow.endTime = new Date().toISOString();
      await this.saveWorkflow(workflow);
      this.emit('workflow:cancelled', { workflowId });
      return { success: true };
    }
    return { success: false, error: 'Workflow not found or not active' };
  }

  /**
   * Extract keywords from content for search indexing
   */
  private extractKeywords(content: string): string[] {
    // Simple keyword extraction - in production use NLP/ML
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 3);

    // Remove duplicates and common stop words
    const stopWords = new Set([
      'this',
      'that',
      'with',
      'have',
      'will',
      'from',
      'they',
      'been',
      'said',
      'each',
      'which',
    ]);
    const uniqueWords = [...new Set(words)].filter((word) => !stopWords.has(word));

    return uniqueWords.slice(0, 20); // Limit to 20 keywords
  }
}

// No need for alias - using simple name directly
