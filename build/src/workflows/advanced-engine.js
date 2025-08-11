/**
 * @file Unified Workflow Engine - Database-Driven Architecture.
 * @file Unified Workflow Engine - Database-Driven Architecture.
 *
 * PURE DATABASE-DRIVEN workflow engine - NO FILE OPERATIONS
 * Handles Vision → PRDs → Epics → Features → Tasks → Code.
 * ADRs are independent architectural governance documents, not part of linear workflow.
 * Uses DocumentService for all document operations.
 */
import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('WorkflowEngine');
// Workflow types are now imported from types/workflow-types.ts
// Document workflow definitions (extended with additional properties)
const DOCUMENT_WORKFLOWS = [
    // Note: ADRs are NOT auto-generated from vision documents.
    // ADRs are independent architectural governance documents created by architects
    // when specific technical decisions need to be documented and enforced.
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
    memory; // TODO: Replace with proper MemorySystem interface
    documentService;
    activeWorkflows = new Map();
    workflowDefinitions = new Map();
    stepHandlers = new Map();
    config;
    constructor(memory, // TODO: Replace with proper MemorySystem interface
    documentServiceOrConfig, config = {}) {
        super();
        this.memory = memory;
        // Handle overloaded constructor
        if (documentServiceOrConfig && 'initialize' in documentServiceOrConfig) {
            // First overload: (memory, documentService, config)
            this.documentService = documentServiceOrConfig;
        }
        else {
            // Second overload: (memory, config)
            config = documentServiceOrConfig || {};
        }
        this.config = {
            maxConcurrentWorkflows: 10,
            persistWorkflows: true,
            stepTimeout: 300000, // 5 minutes
            retryDelay: 1000,
            enableVisualization: false,
            ...config,
        };
        this.registerBuiltInHandlers();
        this.registerDocumentWorkflows();
    }
    async initialize() {
        logger.info('Initializing database-driven workflow engine');
        // Initialize document service if available
        if (this.documentService) {
            await this.documentService.initialize();
        }
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
     * Register built-in step handlers.
     */
    registerBuiltInHandlers() {
        // Document processing handlers
        this.registerStepHandler('extract-requirements', this.handleExtractRequirements.bind(this));
        this.registerStepHandler('extract-product-requirements', this.handleExtractProductRequirements.bind(this));
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
     * Register document workflow definitions.
     */
    registerDocumentWorkflows() {
        for (const workflow of DOCUMENT_WORKFLOWS) {
            this.workflowDefinitions.set(workflow.name, workflow);
        }
        logger.info(`Registered ${DOCUMENT_WORKFLOWS.length} document workflows`);
    }
    /**
     * Register a custom step handler.
     *
     * @param type
     * @param handler
     */
    registerStepHandler(type, handler) {
        this.stepHandlers.set(type, handler);
        logger.debug(`Registered step handler: ${type}`);
    }
    /**
     * Register a custom workflow definition.
     *
     * @param name
     * @param definition
     */
    registerWorkflowDefinition(name, definition) {
        this.workflowDefinitions.set(name, definition);
        logger.info(`Registered workflow definition: ${name}`);
    }
    /**
     * Start a workflow.
     *
     * @param workflowName
     * @param context
     */
    async startWorkflow(workflowName, context = {}) {
        const definition = this.workflowDefinitions.get(workflowName);
        if (!definition) {
            throw new Error(`Workflow definition '${workflowName}' not found`);
        }
        // Check concurrent workflow limit
        const activeCount = Array.from(this.activeWorkflows.values()).filter((w) => w.status === 'running').length;
        if (activeCount >= this.config.maxConcurrentWorkflows) {
            throw new Error(`Maximum concurrent workflows (${this.config.maxConcurrentWorkflows}) reached`);
        }
        const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        // Create properly typed context
        const fullContext = {
            workspaceId: context.workspaceId || 'default',
            workspacePath: context.workspacePath || undefined,
            userId: context.userId || undefined,
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
        const workflow = {
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
     * Start workflow based on document entity event.
     *
     * @param event
     * @param document
     * @param context
     */
    async processDocumentEvent(event, document, context = {}) {
        const startedWorkflows = [];
        for (const [name, definition] of this.workflowDefinitions) {
            const extendedDefinition = definition;
            if (!extendedDefinition.triggers)
                continue;
            for (const trigger of extendedDefinition.triggers) {
                if (trigger.event === event) {
                    // Check document type
                    if (extendedDefinition.documentTypes &&
                        !extendedDefinition.documentTypes.includes(document.type)) {
                        continue;
                    }
                    // Check condition if present
                    if (trigger.condition) {
                        try {
                            const conditionMet = this.evaluateCondition({ document, ...context }, trigger.condition);
                            if (!conditionMet)
                                continue;
                        }
                        catch (error) {
                            logger.warn(`Failed to evaluate trigger condition for ${name}:`, error);
                            continue;
                        }
                    }
                    // Start workflow
                    try {
                        const result = await this.startWorkflow(name, {
                            ...context,
                            currentDocument: this.convertEntityToDocumentContent(document),
                        });
                        if (result?.success && result?.workflowId) {
                            startedWorkflows.push(result?.workflowId);
                            logger.info(`Started workflow ${name} for ${event} on ${document.type}`);
                        }
                    }
                    catch (error) {
                        logger.error(`Failed to start workflow ${name}:`, error);
                    }
                }
            }
        }
        return startedWorkflows;
    }
    /**
     * Convert database entity to workflow document content.
     *
     * @param entity
     */
    convertEntityToDocumentContent(entity) {
        return {
            id: entity.id,
            type: entity.type,
            title: entity.title,
            content: entity.content,
            metadata: {
                author: entity.author || undefined,
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
     * Execute a workflow.
     *
     * @param workflow
     */
    async executeWorkflow(workflow) {
        try {
            workflow.status = 'running';
            await this.saveWorkflow(workflow);
            for (let i = workflow.currentStepIndex; i < workflow.steps.length; i++) {
                if (workflow.status !== 'running') {
                    break; // Workflow was paused or cancelled
                }
                const step = workflow.steps[i];
                workflow.currentStepIndex = i;
                workflow.progress.percentage = Math.round((i / workflow.steps.length) * 100);
                await this.executeWorkflowStep(workflow, step.step, i);
                await this.saveWorkflow(workflow);
            }
            if (workflow.status === 'running') {
                workflow.status = 'completed';
                workflow.progress.percentage = 100;
                workflow.endTime = new Date().toISOString();
                this.emit('workflow:completed', { workflowId: workflow.id });
                logger.info(`Workflow ${workflow.id} completed successfully`);
            }
        }
        catch (error) {
            workflow.status = 'failed';
            workflow.error = error.message;
            workflow.endTime = new Date().toISOString();
            this.emit('workflow:failed', { workflowId: workflow.id, error });
            logger.error(`Workflow ${workflow.id} failed:`, error);
        }
        finally {
            await this.saveWorkflow(workflow);
        }
    }
    /**
     * Execute a single workflow step.
     *
     * @param workflow
     * @param step
     * @param stepIndex
     */
    async executeWorkflowStep(workflow, step, stepIndex) {
        const stepId = `step-${stepIndex}`;
        let retries = 0;
        const maxRetries = step.retries !== undefined ? step.retries : 0;
        this.emit('step:started', { workflowId: workflow.id, stepId, step });
        while (retries <= maxRetries) {
            try {
                const startTime = Date.now();
                // Check dependencies (if extended step type)
                const extendedStep = step;
                if (extendedStep.dependencies) {
                    for (const dep of extendedStep.dependencies) {
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
                this.emit('step:completed', {
                    workflowId: workflow.id,
                    stepId,
                    result,
                    duration,
                });
                logger.debug(`Step ${step.name || step.type} completed in ${duration}ms`);
                break;
            }
            catch (error) {
                retries++;
                logger.warn(`Step ${step.name || step.type} failed (attempt ${retries}/${maxRetries + 1}): ${error.message}`);
                if (retries > maxRetries) {
                    this.emit('step:failed', { workflowId: workflow.id, stepId, error });
                    if (step.onError === 'continue') {
                        workflow.stepResults[stepId] = { error: error.message };
                        logger.info(`Continuing workflow despite step failure (onError: continue)`);
                        break;
                    }
                    else if (step.onError === 'skip') {
                        workflow.stepResults[stepId] = { skipped: true };
                        logger.info(`Skipping step due to error (onError: skip)`);
                        break;
                    }
                    else {
                        throw error;
                    }
                }
                else {
                    // Wait before retry
                    await new Promise((resolve) => setTimeout(resolve, this.config.retryDelay * retries));
                }
            }
        }
    }
    /**
     * Built-in step handlers.
     *
     * @param context
     * @param _params
     */
    async handleExtractRequirements(context, _params) {
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
    async handleExtractProductRequirements(context, params) {
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
                sourceDocument: document?.title || 'unknown',
                extractionStrategy,
                targetComplexity,
                timestamp: new Date().toISOString(),
                confidence: 0.85,
            },
        };
        logger.info('Extracted product requirements from vision document');
        return requirements;
    }
    async handleGenerateADRs(context, params) {
        const requirements = context.architectural_requirements || [];
        const decisions = context.decision_points || [];
        // Use decisions for contextual ADR generation
        const _decisionContext = decisions.map((decision) => ({
            concern: decision.concern || 'Architecture',
            alternatives: decision.alternatives || [],
            rationale: decision.rationale || 'Technical requirements',
        }));
        const _adrTemplate = params?.template || 'standard';
        const _includeRationale = params?.includeRationale !== false;
        const adrs = requirements.map((req, index) => ({
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
    async handleSaveDocuments(context, params) {
        const documents = context[params?.outputKey] || context.generated_docs || [];
        const documentType = params?.documentType;
        const projectId = context.workspaceId;
        const savedDocuments = [];
        for (const doc of documents) {
            // Create database document entity
            const documentEntity = {
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
                metadata: {},
            };
            // Save to database using DocumentService if available
            let savedDoc;
            if (this.documentService) {
                savedDoc = await this.documentService.createDocument(documentEntity, {
                    autoGenerateRelationships: true,
                    generateSearchIndex: true,
                    notifyListeners: true,
                });
            }
            else {
                // Fallback: create a minimal document entity
                savedDoc = {
                    ...documentEntity,
                    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                    created_at: new Date(),
                    updated_at: new Date(),
                    checksum: this.generateChecksum(documentEntity.content),
                };
            }
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
    async handleAnalyzePRD(_context, _params) {
        // Mock implementation
        return { epics: ['User Management', 'Data Processing', 'Reporting'] };
    }
    async handleDecomposeEpic(_context, _params) {
        // Mock implementation
        return { features: ['Login', 'Registration', 'Password Reset'] };
    }
    async handleAnalyzeFeature(_context, _params) {
        // Mock implementation
        return { tasks: ['Create UI', 'Implement Backend', 'Write Tests'] };
    }
    async handleAnalyzeTask(_context, _params) {
        // Mock implementation
        return { implementation: 'Generate React component with hooks' };
    }
    async handleGeneratePRDs(_context, _params) {
        return []; // Mock implementation
    }
    async handleGenerateEpicDocs(_context, _params) {
        return []; // Mock implementation
    }
    async handleGenerateFeatureDocs(_context, _params) {
        return []; // Mock implementation
    }
    async handleGenerateTaskDocs(_context, _params) {
        return []; // Mock implementation
    }
    async handleGenerateCode(_context, _params) {
        return { code: '// Generated code placeholder' };
    }
    async handleGenerateTests(_context, _params) {
        return { tests: '// Generated test placeholder' };
    }
    async handleGenerateDocs(_context, _params) {
        return { docs: '# Generated documentation placeholder' };
    }
    async handleSaveImplementation(_context, _params) {
        return { saved: true };
    }
    async handleDelay(_context, params) {
        const duration = params?.duration || 1000;
        await new Promise((resolve) => setTimeout(resolve, duration));
        return { delayed: duration };
    }
    async handleTransform(context, params) {
        const data = this.getContextValue(context, params?.input);
        // Simple transformation logic
        return { transformed: data };
    }
    async handleCondition(context, params) {
        const condition = this.evaluateCondition(context, params?.condition);
        return { conditionMet: condition };
    }
    async handleIdentifyDecisions(_context, _params) {
        // Mock implementation
        return ['Database choice', 'Authentication method', 'Deployment strategy'];
    }
    /**
     * Utility methods.
     *
     * @param context
     * @param expression
     */
    evaluateCondition(context, expression) {
        try {
            const contextVars = Object.keys(context)
                .map((key) => `const ${key} = context.${key};`)
                .join('\n');
            const func = new Function('context', `${contextVars}
      return ${expression};`);
            return func(context);
        }
        catch (error) {
            logger.error(`Failed to evaluate condition: ${expression}`, error);
            return false;
        }
    }
    getContextValue(context, path) {
        const parts = path.split('.');
        let value = context;
        for (const part of parts) {
            value = value?.[part];
        }
        return value;
    }
    async saveWorkflow(workflow) {
        if (!this.config.persistWorkflows)
            return;
        try {
            // Store in memory system (primary storage)
            await this.memory.store(`workflow:${workflow.id}`, workflow, 'workflows');
            // Also store workflow state in database for persistence
            await this.memory.store(`workflow:state:${workflow.id}`, {
                id: workflow.id,
                status: workflow.status,
                progress: workflow.progress,
                metrics: workflow.metrics,
                currentStep: workflow.currentStepIndex,
                lastUpdated: new Date().toISOString(),
            }, 'workflow_states');
        }
        catch (error) {
            logger.error(`Failed to save workflow ${workflow.id}:`, error);
        }
    }
    async loadPersistedWorkflows() {
        try {
            // Load workflows from memory system
            const workflows = await this.memory.search('workflow:*', 'workflows');
            let loadedCount = 0;
            for (const [key, workflow] of Object.entries(workflows)) {
                try {
                    const workflowState = workflow;
                    if (workflowState.status === 'running' || workflowState.status === 'paused') {
                        this.activeWorkflows.set(workflowState.id, workflowState);
                        logger.info(`Loaded persisted workflow: ${workflowState.id}`);
                        loadedCount++;
                    }
                }
                catch (error) {
                    logger.warn(`Failed to load workflow from memory: ${key}`, error);
                }
            }
            logger.info(`Loaded ${loadedCount} persisted workflows from database`);
        }
        catch (error) {
            logger.error('Failed to load persisted workflows from database:', error);
        }
    }
    startWorkflowMonitoring() {
        // Monitor workflow health every 30 seconds
        setInterval(() => {
            this.monitorWorkflows();
        }, 30000);
    }
    monitorWorkflows() {
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
     * Public workflow management methods.
     */
    async getActiveWorkflows() {
        return Array.from(this.activeWorkflows.values()).filter((w) => ['running', 'paused'].includes(w.status));
    }
    async getWorkflowHistory(limit = 100) {
        const workflows = await this.memory.search('workflow:*', 'workflows');
        return Object.values(workflows)
            .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
            .slice(0, limit);
    }
    async getWorkflowMetrics() {
        const workflows = Array.from(this.activeWorkflows.values());
        const metrics = {
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
    /**
     * Get workflow metrics (alias for getWorkflowMetrics).
     */
    async getMetrics() {
        return this.getWorkflowMetrics();
    }
    async pauseWorkflow(workflowId) {
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
    async resumeWorkflow(workflowId) {
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
    async cancelWorkflow(workflowId) {
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
     * Extract keywords from content for search indexing.
     *
     * @param content
     */
    extractKeywords(content) {
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
    /**
     * Shutdown the workflow engine gracefully.
     */
    async shutdown() {
        logger.info('Shutting down workflow engine...');
        // Pause all running workflows
        for (const [id, workflow] of this.activeWorkflows) {
            if (workflow.status === 'running') {
                workflow.status = 'paused';
                workflow.pausedAt = new Date().toISOString();
                await this.saveWorkflow(workflow);
                logger.info(`Paused workflow ${id} for shutdown`);
            }
        }
        this.removeAllListeners();
        this.emit('shutdown');
        logger.info('Workflow engine shutdown complete');
    }
    /**
     * Generate a simple checksum for content.
     *
     * @param content
     */
    generateChecksum(content) {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(16);
    }
}
// No need for alias - using simple name directly
