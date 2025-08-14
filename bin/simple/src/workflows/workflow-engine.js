import { EventEmitter } from 'node:events';
import { getLogger } from '../config/logging-config.ts';
const logger = getLogger('WorkflowEngine');
export class WorkflowEngine extends EventEmitter {
    config;
    activeWorkflows = new Map();
    workflowDefinitions = new Map();
    stepHandlers = new Map();
    isInitialized = false;
    memory;
    documentManager;
    gatesManager;
    constructor(config = {}, documentManager, memoryFactory, gatesManager) {
        super();
        this.config = {
            maxConcurrentWorkflows: config.maxConcurrentWorkflows ?? 10,
            stepTimeout: config.stepTimeout ?? 30000,
            persistWorkflows: config.persistWorkflows ?? false,
            persistencePath: config.persistencePath ?? './workflows',
            retryAttempts: config.retryAttempts ?? 3,
        };
        this.documentManager = documentManager;
        this.memory = memoryFactory;
        this.gatesManager = gatesManager;
    }
    async initialize() {
        if (this.isInitialized)
            return;
        this.registerDefaultStepHandlers();
        await this.registerDocumentWorkflows();
        this.isInitialized = true;
        this.emit('initialized');
        logger.info('WorkflowEngine initialized');
    }
    async shutdown() {
        logger.info('Shutting down WorkflowEngine');
        const cancelPromises = Array.from(this.activeWorkflows.keys()).map((id) => this.cancelWorkflow(id).catch((err) => logger.error(`Error cancelling workflow ${id}:`, err)));
        await Promise.all(cancelPromises);
        this.activeWorkflows.clear();
        this.workflowDefinitions.clear();
        this.stepHandlers.clear();
        this.removeAllListeners();
        this.isInitialized = false;
        logger.info('WorkflowEngine shutdown completed');
    }
    async startWorkflow(definitionOrName, context = {}) {
        await this.ensureInitialized();
        const definition = this.resolveDefinition(definitionOrName);
        if (!definition) {
            return { success: false, error: 'Workflow definition not found' };
        }
        if (this.activeWorkflows.size >= this.config.maxConcurrentWorkflows) {
            return { success: false, error: 'Maximum concurrent workflows reached' };
        }
        const workflowId = this.generateWorkflowId();
        const workflow = {
            id: workflowId,
            definition,
            status: 'pending',
            context,
            currentStep: 0,
            stepResults: {},
            startTime: new Date().toISOString(),
        };
        this.activeWorkflows.set(workflowId, workflow);
        this.emit('workflow:started', { workflowId, definition: definition.name });
        this.executeWorkflowAsync(workflow).catch((error) => {
            logger.error(`Workflow ${workflowId} execution failed:`, error);
        });
        return { success: true, workflowId };
    }
    cancelWorkflow(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow)
            return false;
        workflow.status = 'cancelled';
        workflow.endTime = new Date().toISOString();
        this.activeWorkflows.delete(workflowId);
        this.emit('workflow:cancelled', { workflowId });
        return true;
    }
    getWorkflowStatus(workflowId) {
        return this.activeWorkflows.get(workflowId) ?? null;
    }
    registerWorkflowDefinition(name, definition) {
        this.workflowDefinitions.set(name, definition);
        logger.debug(`Registered workflow definition: ${name}`);
    }
    registerStepHandler(type, handler) {
        this.stepHandlers.set(type, handler);
        logger.debug(`Registered step handler: ${type}`);
    }
    async registerDocumentWorkflows() {
        const documentWorkflows = [
            {
                name: 'vision-to-prds',
                description: 'Process vision documents into PRDs',
                version: '1.0.0',
                steps: [
                    { type: 'extract-requirements', name: 'Extract requirements' },
                    { type: 'generate-prds', name: 'Generate PRD documents' },
                    { type: 'save-documents', name: 'Save to database' },
                ],
            },
            {
                name: 'prd-to-epics',
                description: 'Break down PRDs into epics',
                version: '1.0.0',
                steps: [
                    { type: 'analyze-prd', name: 'Analyze PRD structure' },
                    { type: 'create-epics', name: 'Create epic documents' },
                    { type: 'estimate-effort', name: 'Estimate development effort' },
                ],
            },
        ];
        const registrationPromises = documentWorkflows.map((workflow) => this.registerWorkflowDefinition(workflow.name, workflow));
        await Promise.all(registrationPromises);
        logger.info(`Registered ${documentWorkflows.length} document workflows`);
    }
    async processDocumentEvent(eventType, documentData) {
        const docData = documentData;
        const triggerWorkflows = this.getWorkflowsForDocumentType(docData.type);
        if (triggerWorkflows.length === 0) {
            logger.debug(`No workflows for document type: ${docData.type}`);
            return;
        }
        const triggerPromises = triggerWorkflows.map((workflowName) => this.startWorkflow(workflowName, { documentData, eventType }));
        const results = await Promise.all(triggerPromises);
        results.forEach((result, index) => {
            const workflowName = triggerWorkflows[index];
            logger.info(`Workflow ${workflowName}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
        });
    }
    convertEntityToDocumentContent(entity) {
        return {
            id: entity.id,
            type: entity.type,
            title: entity.title || `${entity.type} Document`,
            content: entity.content || '',
            metadata: {
                entityId: entity.id,
                createdAt: entity.created_at,
                updatedAt: entity.updated_at,
                version: entity.version,
                status: entity.status,
            },
        };
    }
    getWorkflowData(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow)
            return null;
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
    async createWorkflowFromData(data) {
        const definition = {
            name: data.name,
            description: data.description,
            version: data.version,
            steps: [],
        };
        const result = await this.startWorkflow(definition, data.data);
        if (!(result.success && result.workflowId)) {
            throw new Error(`Failed to create workflow: ${result.error}`);
        }
        return result.workflowId;
    }
    updateWorkflowData(workflowId, updates) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            throw new Error(`Workflow ${workflowId} not found`);
        }
        if (updates.data) {
            Object.assign(workflow.context, updates.data);
        }
        this.emit('workflow:updated', { workflowId, updates });
    }
    async executeWorkflowAsync(workflow) {
        workflow.status = 'running';
        try {
            for (let i = 0; i < workflow.definition.steps.length; i++) {
                if (workflow.status !== 'running')
                    break;
                workflow.currentStep = i;
                const step = workflow.definition.steps[i];
                const result = await this.executeStep(step, workflow);
                if (!result.success) {
                    workflow.status = 'failed';
                    workflow.error = result.error;
                    break;
                }
                workflow.stepResults[i] = result.output;
            }
            if (workflow.status === 'running') {
                workflow.status = 'completed';
            }
        }
        catch (error) {
            workflow.status = 'failed';
            workflow.error = error instanceof Error ? error.message : 'Unknown error';
        }
        finally {
            workflow.endTime = new Date().toISOString();
            this.activeWorkflows.delete(workflow.id);
            this.emit('workflow:completed', {
                workflowId: workflow.id,
                status: workflow.status,
            });
        }
    }
    async executeStep(step, workflow) {
        const startTime = Date.now();
        if (step.gateConfig?.enabled && this.gatesManager) {
            const gateResult = await this.executeGateForStep(step, workflow);
            if (!gateResult.success) {
                return {
                    success: false,
                    error: gateResult.error?.message || 'Gate approval failed',
                    duration: Date.now() - startTime,
                };
            }
            if (!gateResult.approved) {
                workflow.status = 'paused';
                workflow.pausedForGate = {
                    stepIndex: workflow.currentStep,
                    gateId: gateResult.gateId,
                    pausedAt: new Date().toISOString(),
                };
                return {
                    success: true,
                    output: { gateId: gateResult.gateId, status: 'pending_approval' },
                    duration: Date.now() - startTime,
                };
            }
        }
        const handler = this.stepHandlers.get(step.type);
        if (!handler) {
            return {
                success: false,
                error: `No handler found for step type: ${step.type}`,
                duration: Date.now() - startTime,
            };
        }
        try {
            const output = await Promise.race([
                handler(workflow.context, step.params || {}),
                this.createTimeoutPromise(step.timeout || this.config.stepTimeout),
            ]);
            return {
                success: true,
                output,
                duration: Date.now() - startTime,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration: Date.now() - startTime,
            };
        }
    }
    registerDefaultStepHandlers() {
        this.registerStepHandler('delay', async (context, params) => {
            const duration = params.duration || 1000;
            await new Promise((resolve) => setTimeout(resolve, duration));
            return { delayed: duration };
        });
        this.registerStepHandler('log', (context, params) => {
            const message = params.message || 'Step executed';
            logger.info(message);
            return Promise.resolve({ logged: message });
        });
        this.registerStepHandler('transform', (context, params) => {
            const { input, transformation } = params;
            const inputValue = this.getNestedValue(context, input || '');
            return Promise.resolve({
                transformed: this.applyTransformation(inputValue, transformation),
            });
        });
    }
    resolveDefinition(definitionOrName) {
        if (typeof definitionOrName === 'string') {
            return this.workflowDefinitions.get(definitionOrName) || null;
        }
        return definitionOrName;
    }
    generateWorkflowId() {
        return `workflow-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
    getWorkflowsForDocumentType(documentType) {
        const typeWorkflowMap = {
            vision: ['vision-to-prds'],
            prd: ['prd-to-epics'],
            epic: ['epic-to-features'],
        };
        return typeWorkflowMap[documentType || ''] || [];
    }
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
    }
    createTimeoutPromise(timeout) {
        return new Promise((_, reject) => setTimeout(() => reject(new Error(`Step timeout after ${timeout}ms`)), timeout));
    }
    getNestedValue(obj, path) {
        return path
            .split('.')
            .reduce((current, key) => current?.[key], obj);
    }
    applyTransformation(data, transformation) {
        if (typeof transformation === 'function') {
            return transformation(data);
        }
        return data;
    }
    async executeGateForStep(step, workflow) {
        if (!(this.gatesManager && step.gateConfig)) {
            return {
                success: false,
                gateId: '',
                approved: false,
                processingTime: 0,
                escalationLevel: 0,
                error: new Error('Gate manager not available'),
                correlationId: '',
            };
        }
        try {
            const gateId = `workflow-${workflow.id}-step-${workflow.currentStep}`;
            const gateRequest = {
                id: gateId,
                type: 'checkpoint',
                question: `Approve execution of step: ${step.name || step.type}?`,
                context: {
                    workflowId: workflow.id,
                    stepName: step.name || step.type,
                    stepType: step.type,
                    stepParams: step.params || {},
                },
                confidence: 0.8,
                priority: step.gateConfig.businessImpact === 'critical' ? 'critical' : 'medium',
                validationReason: `Workflow step gate: ${step.name || step.type}`,
                expectedImpact: step.gateConfig.businessImpact === 'high' ? 0.7 : 0.4,
                workflowContext: {
                    workflowId: workflow.id,
                    stepName: step.name || step.type,
                    businessImpact: step.gateConfig.businessImpact || 'medium',
                    decisionScope: 'task',
                    stakeholders: step.gateConfig.stakeholders || ['workflow-manager'],
                    dependencies: [],
                    riskFactors: [],
                },
                gateType: step.gateConfig.gateType || 'checkpoint',
                timeoutConfig: {
                    initialTimeout: step.timeout || 300000,
                    escalationTimeouts: [600000, 1200000],
                    maxTotalTimeout: 1800000,
                },
                integrationConfig: {
                    correlationId: `${workflow.id}-${workflow.currentStep}`,
                    domainValidation: true,
                    enableMetrics: true,
                },
            };
            if (!workflow.pendingGates) {
                workflow.pendingGates = new Map();
            }
            workflow.pendingGates.set(gateId, gateRequest);
            if (step.gateConfig.autoApproval) {
                return {
                    success: true,
                    gateId,
                    approved: true,
                    processingTime: 10,
                    escalationLevel: 0,
                    decisionMaker: 'auto-approval',
                    correlationId: gateRequest.integrationConfig?.correlationId || '',
                };
            }
            const approved = await this.simulateGateDecision(step, workflow);
            return {
                success: true,
                gateId,
                approved,
                processingTime: 100,
                escalationLevel: 0,
                decisionMaker: approved ? 'stakeholder' : 'rejected',
                correlationId: gateRequest.integrationConfig?.correlationId || '',
            };
        }
        catch (error) {
            return {
                success: false,
                gateId: '',
                approved: false,
                processingTime: 0,
                escalationLevel: 0,
                error: error instanceof Error ? error : new Error(String(error)),
                correlationId: '',
            };
        }
    }
    simulateGateDecision(step, workflow) {
        const businessImpact = step.gateConfig?.businessImpact || 'medium';
        const stakeholders = step.gateConfig?.stakeholders || [];
        if (step.gateConfig?.autoApproval) {
            return true;
        }
        const workflowAge = Date.now() - new Date(workflow.startTime).getTime();
        const isUrgent = workflowAge > 86400000;
        const hasRequiredStakeholders = stakeholders.length > 0;
        let approvalScore = 0.5;
        switch (businessImpact) {
            case 'critical':
                approvalScore = hasRequiredStakeholders ? 0.9 : 0.3;
                break;
            case 'high':
                approvalScore = 0.75;
                break;
            case 'medium':
                approvalScore = 0.85;
                break;
            case 'low':
                approvalScore = 0.95;
                break;
        }
        if (isUrgent) {
            approvalScore += 0.1;
        }
        const completedSteps = workflow.currentStep;
        const successRate = completedSteps > 0
            ? Object.keys(workflow.stepResults).length / completedSteps
            : 1;
        approvalScore += (successRate - 0.5) * 0.1;
        if (stakeholders.length > 0 && businessImpact === 'critical') {
            const stakeholderApproval = Math.random() > 0.2;
            if (!stakeholderApproval) {
                return false;
            }
        }
        return Math.random() < approvalScore;
    }
    async resumeWorkflowAfterGate(workflowId, gateId, approved) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            return { success: false, error: 'Workflow not found' };
        }
        if (!workflow.pausedForGate || workflow.pausedForGate.gateId !== gateId) {
            return { success: false, error: 'Workflow not paused for this gate' };
        }
        if (!workflow.gateResults) {
            workflow.gateResults = new Map();
        }
        const gateResult = {
            success: true,
            gateId,
            approved,
            processingTime: Date.now() - new Date(workflow.pausedForGate.pausedAt).getTime(),
            escalationLevel: 0,
            decisionMaker: 'external',
            correlationId: `${workflowId}-${gateId}`,
        };
        workflow.gateResults.set(gateId, gateResult);
        if (!approved) {
            workflow.status = 'failed';
            workflow.error = `Gate rejected: ${gateId}`;
            workflow.endTime = new Date().toISOString();
            this.activeWorkflows.delete(workflowId);
            this.emit('workflow:failed', {
                workflowId,
                reason: 'gate_rejected',
                gateId,
            });
            return { success: true };
        }
        workflow.status = 'running';
        workflow.pausedForGate = undefined;
        this.executeWorkflowAsync(workflow).catch((error) => {
            logger.error(`Workflow ${workflowId} failed after gate resume:`, error);
        });
        this.emit('workflow:resumed', { workflowId, gateId });
        return { success: true };
    }
    getWorkflowGateStatus(workflowId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            return {
                hasPendingGates: false,
                pendingGates: [],
                gateResults: [],
            };
        }
        return {
            hasPendingGates: Boolean(workflow.pendingGates && workflow.pendingGates.size > 0),
            pendingGates: workflow.pendingGates
                ? Array.from(workflow.pendingGates.values())
                : [],
            gateResults: workflow.gateResults
                ? Array.from(workflow.gateResults.values())
                : [],
            pausedForGate: workflow.pausedForGate,
        };
    }
}
//# sourceMappingURL=workflow-engine.js.map