/**
 * @file Engine implementation.
 */
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('WorkflowEngine');
/**
 * Workflow Engine
 * Sequential workflow processing engine migrated from plugins.
 * Removed plugin dependencies and simplified for direct use.
 */
import { EventEmitter } from 'node:events';
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
export class WorkflowEngine extends EventEmitter {
    config;
    activeWorkflows = new Map();
    workflowMetrics = new Map();
    workflowDefinitions = new Map();
    stepHandlers = new Map();
    isInitialized = false;
    // Enhanced capabilities to match core WorkflowEngine
    memory;
    documentManager;
    documentWorkflows = new Map();
    constructor(config = {}, documentManager, memoryFactory) {
        super();
        this.config = {
            maxConcurrentWorkflows: config.maxConcurrentWorkflows === undefined ? 10 : config?.maxConcurrentWorkflows,
            persistWorkflows: config.persistWorkflows === undefined ? false : config?.persistWorkflows,
            persistencePath: config.persistencePath === undefined ? './workflows' : config?.persistencePath,
            stepTimeout: config.stepTimeout === undefined ? 30000 : config?.stepTimeout,
            retryDelay: config.retryDelay === undefined ? 1000 : config?.retryDelay,
            enableVisualization: config.enableVisualization === undefined ? false : config?.enableVisualization,
        };
        // Enhanced capabilities
        this.documentManager = documentManager;
        this.memory = memoryFactory;
    }
    async initialize() {
        if (this.isInitialized)
            return;
        // Create persistence directory
        if (this.config.persistWorkflows) {
            await mkdir(this.config.persistencePath, { recursive: true });
        }
        // Register built-in step handlers
        this.registerBuiltInHandlers();
        // Load persisted workflows
        if (this.config.persistWorkflows) {
            await this.loadPersistedWorkflows();
        }
        this.isInitialized = true;
        this.emit('initialized');
    }
    registerBuiltInHandlers() {
        // Delay step
        this.registerStepHandler('delay', async (_context, params) => {
            const duration = params?.duration || 1000;
            await new Promise((resolve) => setTimeout(resolve, duration));
            return { delayed: duration };
        });
        // Transform data step
        this.registerStepHandler('transform', async (context, params) => {
            const data = this.getContextValue(context, params?.input);
            const transformed = await this.applyTransformation(data, params?.transformation);
            return { output: transformed };
        });
        // Parallel execution step
        this.registerStepHandler('parallel', async (context, params) => {
            const results = await Promise.all(params?.tasks?.map((task) => this.executeStep(task, context)));
            return { results };
        });
        // Loop step
        this.registerStepHandler('loop', async (context, params) => {
            const items = this.getContextValue(context, params?.items);
            const results = [];
            for (const item of items) {
                const loopContext = { ...context, loopItem: item };
                const result = await this.executeStep(params?.step, loopContext);
                results.push(result);
            }
            return { results };
        });
        // Conditional step
        this.registerStepHandler('condition', async (context, params) => {
            const condition = this.evaluateCondition(context, params?.condition);
            if (condition) {
                return await this.executeStep(params?.thenStep, context);
            }
            else if (params?.elseStep) {
                return await this.executeStep(params?.elseStep, context);
            }
            return { skipped: true };
        });
    }
    registerStepHandler(type, handler) {
        this.stepHandlers.set(type, handler);
    }
    async executeStep(step, context) {
        const handler = this.stepHandlers.get(step.type);
        if (!handler) {
            throw new Error(`No handler registered for step type: ${step.type}`);
        }
        return await handler(context, step.params || {});
    }
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
            logger.error(`[WorkflowEngine] Failed to evaluate condition: ${expression}`, error);
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
    async applyTransformation(data, transformation) {
        if (typeof transformation === 'function') {
            return transformation(data);
        }
        // Simple object transformation
        if (typeof transformation === 'object') {
            const result = {};
            for (const [key, value] of Object.entries(transformation)) {
                if (typeof value === 'string' && value.startsWith('$.')) {
                    result[key] = this.getContextValue({ data }, value.substring(2));
                }
                else {
                    result[key] = value;
                }
            }
            return result;
        }
        return data;
    }
    async loadPersistedWorkflows() {
        try {
            const files = await readdir(this.config.persistencePath);
            const workflowFiles = files.filter((f) => f.endsWith('.workflow.json'));
            for (const file of workflowFiles) {
                const filePath = path.join(this.config.persistencePath, file);
                const data = JSON.parse(await readFile(filePath, 'utf8'));
                if (data.status === 'running' || data.status === 'paused') {
                    this.activeWorkflows.set(data?.id, data);
                }
            }
        }
        catch (error) {
            logger.error('[WorkflowEngine] Failed to load persisted workflows:', error);
        }
    }
    async saveWorkflow(workflow) {
        if (!this.config.persistWorkflows)
            return;
        try {
            const filePath = path.join(this.config.persistencePath, `${workflow.id}.workflow.json`);
            await writeFile(filePath, JSON.stringify(workflow, null, 2));
        }
        catch (error) {
            logger.error(`[WorkflowEngine] Failed to save workflow ${workflow.id}:`, error);
        }
    }
    async registerWorkflowDefinition(name, definition) {
        this.workflowDefinitions.set(name, definition);
    }
    async startWorkflow(workflowDefinitionOrName, context = {}) {
        await this.initialize();
        let definition;
        if (typeof workflowDefinitionOrName === 'string') {
            const foundDefinition = this.workflowDefinitions.get(workflowDefinitionOrName);
            if (!foundDefinition) {
                throw new Error(`Workflow definition '${workflowDefinitionOrName}' not found`);
            }
            definition = foundDefinition;
        }
        else {
            definition = workflowDefinitionOrName;
        }
        // Check concurrent workflow limit
        const activeCount = Array.from(this.activeWorkflows.values()).filter((w) => w.status === 'running').length;
        if (activeCount >= this.config.maxConcurrentWorkflows) {
            throw new Error(`Maximum concurrent workflows (${this.config.maxConcurrentWorkflows}) reached`);
        }
        const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
        const workflow = {
            id: workflowId,
            definition,
            status: 'pending',
            context,
            currentStep: 0,
            steps: definition.steps,
            stepResults: {},
            completedSteps: [],
            startTime: new Date().toISOString(),
        };
        this.activeWorkflows.set(workflowId, workflow);
        // Start execution asynchronously
        this.executeWorkflow(workflow).catch((error) => {
            logger.error(`[WorkflowEngine] Workflow ${workflowId} failed:`, error);
        });
        this.emit('workflow-started', workflowId);
        return { success: true, workflowId };
    }
    async executeWorkflow(workflow) {
        try {
            workflow.status = 'running';
            await this.saveWorkflow(workflow);
            for (let i = workflow.currentStep; i < workflow.steps.length; i++) {
                if (workflow.status !== 'running') {
                    break; // Workflow was paused or cancelled
                }
                const step = workflow.steps[i];
                workflow.currentStep = i;
                if (step) {
                    await this.executeWorkflowStep(workflow, step, i);
                }
            }
            if (workflow.status === 'running') {
                workflow.status = 'completed';
                workflow.endTime = new Date().toISOString();
                this.emit('workflow-completed', workflow.id);
            }
        }
        catch (error) {
            workflow.status = 'failed';
            workflow.error = error.message;
            workflow.endTime = new Date().toISOString();
            this.emit('workflow-failed', workflow.id, error);
        }
        finally {
            await this.saveWorkflow(workflow);
        }
    }
    async executeWorkflowStep(workflow, step, stepIndex) {
        const stepId = `step-${stepIndex}`;
        let retries = 0;
        const maxRetries = step.retries !== undefined ? step.retries : 0;
        while (retries <= maxRetries) {
            try {
                this.emit('step-started', workflow.id, stepId);
                // Set up timeout
                const timeout = step.timeout || this.config.stepTimeout;
                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Step timeout')), timeout);
                });
                // Execute step
                const stepPromise = this.executeStep(step, workflow.context);
                const result = await Promise.race([stepPromise, timeoutPromise]);
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
                    duration: 0, // Would calculate actual duration
                    timestamp: new Date().toISOString(),
                });
                this.emit('step-completed', workflow.id, stepId, result);
                break;
            }
            catch (error) {
                retries++;
                logger.warn(`[WorkflowEngine] Step ${step.name} failed (attempt ${retries}/${maxRetries + 1}): ${error.message}`);
                if (retries > maxRetries) {
                    this.emit('step-failed', workflow.id, stepId, error);
                    if (step.onError === 'continue') {
                        workflow.stepResults[stepId] = { error: error.message };
                        break;
                    }
                    else if (step.onError === 'skip') {
                        workflow.stepResults[stepId] = { skipped: true };
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
    async getWorkflowStatus(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }
        const duration = workflow.endTime
            ? new Date(workflow.endTime).getTime() - new Date(workflow.startTime).getTime()
            : Date.now() - new Date(workflow.startTime).getTime();
        return {
            id: workflow.id,
            status: workflow.status,
            currentStep: workflow.currentStep,
            totalSteps: workflow.steps.length,
            progress: workflow.steps.length > 0 ? (workflow.currentStep / workflow.steps.length) * 100 : 0,
            startTime: workflow.startTime,
            endTime: workflow.endTime,
            duration,
            error: workflow.error,
        };
    }
    async pauseWorkflow(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow && workflow.status === 'running') {
            workflow.status = 'paused';
            workflow.pausedAt = new Date().toISOString();
            await this.saveWorkflow(workflow);
            this.emit('workflow-paused', workflowId);
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
                logger.error(`[WorkflowEngine] Workflow ${workflowId} failed after resume:`, error);
            });
            this.emit('workflow-resumed', workflowId);
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
            this.emit('workflow-cancelled', workflowId);
            return { success: true };
        }
        return { success: false, error: 'Workflow not found or not active' };
    }
    async getActiveWorkflows() {
        const active = Array.from(this.activeWorkflows.values())
            .filter((w) => ['running', 'paused'].includes(w.status))
            .map((w) => ({
            id: w.id,
            name: w.definition?.name,
            status: w.status,
            currentStep: w.currentStep,
            totalSteps: w.steps.length,
            progress: w.steps.length > 0 ? (w.currentStep / w.steps.length) * 100 : 0,
            startTime: w.startTime,
            pausedAt: w.pausedAt,
        }));
        return active;
    }
    async getWorkflowHistory(limit = 100) {
        const history = [];
        if (!this.config.persistWorkflows) {
            return Array.from(this.activeWorkflows.values()).slice(-limit);
        }
        try {
            const files = await readdir(this.config.persistencePath);
            const workflowFiles = files.filter((f) => f.endsWith('.workflow.json'));
            for (const file of workflowFiles.slice(-limit)) {
                const filePath = path.join(this.config.persistencePath, file);
                const data = JSON.parse(await readFile(filePath, 'utf8'));
                history.push(data);
            }
            return history.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        }
        catch (error) {
            logger.error('[WorkflowEngine] Failed to get workflow history:', error);
            return [];
        }
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
        const completed = workflows.filter((w) => w.status === 'completed');
        if (completed.length > 0) {
            const totalDuration = completed.reduce((sum, w) => {
                return sum + (new Date(w.endTime).getTime() - new Date(w.startTime).getTime());
            }, 0);
            metrics.averageDuration = totalDuration / completed.length;
        }
        if (metrics.total > 0) {
            metrics.successRate = metrics.completed / metrics.total;
        }
        return metrics;
    }
    generateWorkflowVisualization(workflow) {
        if (!this.config.enableVisualization)
            return null;
        // Generate a simple Mermaid diagram
        const lines = ['graph TD'];
        workflow.steps.forEach((step, index) => {
            const nodeId = `step${index}`;
            const label = step.name || step.type;
            const status = index < workflow.currentStep
                ? 'completed'
                : index === workflow.currentStep
                    ? 'current'
                    : 'pending';
            lines.push(`    ${nodeId}[${label}]`);
            if (status === 'completed') {
                lines.push(`    style ${nodeId} fill:#90EE90`);
            }
            else if (status === 'current') {
                lines.push(`    style ${nodeId} fill:#FFD700`);
            }
            if (index > 0) {
                lines.push(`    step${index - 1} --> ${nodeId}`);
            }
        });
        return lines.join('\n');
    }
    async cleanup() {
        this.activeWorkflows.clear();
        this.workflowDefinitions.clear();
        this.stepHandlers.clear();
        this.workflowMetrics.clear();
        this.removeAllListeners();
    }
    // ====================================================================
    // ENHANCED METHODS TO MATCH CORE WORKFLOW ENGINE INTERFACE
    // ====================================================================
    /**
     * Register document workflows for automated processing.
     */
    async registerDocumentWorkflows() {
        // Document workflow definitions
        const documentWorkflows = [
            {
                name: 'vision-to-prds',
                description: 'Process vision document and generate product requirements documents',
                version: '1.0.0',
                steps: [
                    {
                        type: 'extract-product-requirements',
                        name: 'Extract product requirements from vision',
                        params: { outputKey: 'product_requirements' },
                    },
                    {
                        type: 'create-prd-document',
                        name: 'Create PRD document',
                        params: { templateKey: 'prd_template', outputKey: 'prd_document' },
                    },
                ],
            },
        ];
        // Register all document workflows
        for (const workflow of documentWorkflows) {
            await this.registerWorkflowDefinition(workflow.name, workflow);
            this.documentWorkflows.set(workflow.name, workflow);
        }
        logger.info(`Registered ${documentWorkflows.length} document workflows`);
    }
    /**
     * Process document event to trigger appropriate workflows.
     */
    async processDocumentEvent(eventType, documentData) {
        logger.info(`Processing document event: ${eventType}`);
        // Auto-trigger workflows based on document type
        const documentType = documentData.type || 'unknown';
        const triggerWorkflows = [];
        switch (documentType) {
            case 'vision':
                triggerWorkflows.push('vision-to-prds');
                break;
            case 'prd':
                triggerWorkflows.push('prds-to-epics');
                break;
            default:
                logger.debug(`No automatic workflow for document type: ${documentType}`);
                return;
        }
        // Execute triggered workflows
        for (const workflowName of triggerWorkflows) {
            try {
                const result = await this.startWorkflow(workflowName, {
                    documentData,
                    eventType,
                    triggeredAt: new Date().toISOString(),
                });
                logger.info(`Triggered workflow ${workflowName}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
            }
            catch (error) {
                logger.error(`Failed to trigger workflow ${workflowName}:`, error);
            }
        }
    }
    /**
     * Convert entity to document content.
     */
    convertEntityToDocumentContent(entity) {
        return {
            id: entity.id,
            type: entity.type,
            title: entity.title || `${entity.type} Document`,
            content: entity.content || '',
            metadata: {
                entityId: entity.id,
                createdAt: entity.createdAt,
                updatedAt: entity.updatedAt,
                version: entity.version,
                status: entity.status,
            },
        };
    }
    /**
     * Execute workflow step with enhanced error handling.
     */
    async executeWorkflowStep(step, context, workflowId) {
        const startTime = Date.now();
        try {
            const handler = this.stepHandlers.get(step.type);
            if (!handler) {
                throw new Error(`No handler found for step type: ${step.type}`);
            }
            const output = await handler(context, step.params || {});
            const duration = Date.now() - startTime;
            return { success: true, output, duration };
        }
        catch (error) {
            const duration = Date.now() - startTime;
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
                duration,
            };
        }
    }
    /**
     * Get workflow data by ID.
     */
    async getWorkflowData(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            return null;
        }
        return {
            id: workflow.id,
            name: workflow.definition.name,
            description: workflow.definition.description,
            version: workflow.definition.version,
            data: {
                status: workflow.status,
                context: workflow.context,
                currentStep: workflow.currentStep,
                stepResults: workflow.stepResults,
            },
        };
    }
    /**
     * Create workflow from data.
     */
    async createWorkflowFromData(data) {
        const definition = {
            name: data.name,
            description: data.description,
            version: data.version,
            steps: [],
        };
        const result = await this.startWorkflow(definition, data.data || {});
        if (!result.success || !result.workflowId) {
            throw new Error(`Failed to create workflow: ${result.error}`);
        }
        return result.workflowId;
    }
    /**
     * Update workflow data.
     */
    async updateWorkflowData(workflowId, updates) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }
        if (updates.data) {
            Object.assign(workflow.context, updates.data);
        }
        await this.saveWorkflow(workflow);
    }
    /**
     * Enhanced shutdown with cleanup.
     */
    async shutdown() {
        logger.info('Shutting down WorkflowEngine...');
        const activeWorkflowIds = Array.from(this.activeWorkflows.keys());
        for (const workflowId of activeWorkflowIds) {
            try {
                await this.cancelWorkflow(workflowId);
            }
            catch (error) {
                logger.error(`Error cancelling workflow ${workflowId}:`, error);
            }
        }
        await this.cleanup();
        this.isInitialized = false;
    }
}
export default WorkflowEngine;
