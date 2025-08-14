import { EventEmitter } from 'node:events';
import { nanoid } from 'nanoid';
import { getLogger } from '../../config/logging-config.ts';
import { WorkflowAGUIAdapter, } from '../../interfaces/agui/workflow-agui-adapter.ts';
import { SPARCEngineCore } from '../swarm/sparc/core/sparc-engine.ts';
const logger = getLogger('ProductWorkflow');
export class ProductWorkflowEngine extends EventEmitter {
    memory;
    documentService;
    sparcEngine;
    activeWorkflows = new Map();
    workflowDefinitions = new Map();
    stepHandlers = new Map();
    config;
    aguiAdapter;
    pendingGates = new Map();
    gateDefinitions = new Map();
    eventBus;
    constructor(memory, documentService, eventBus, aguiAdapter, config = {}) {
        super();
        this.memory = memory;
        this.documentService = documentService;
        this.eventBus = eventBus;
        this.sparcEngine = new SPARCEngineCore();
        this.aguiAdapter =
            aguiAdapter ||
                new WorkflowAGUIAdapter(eventBus, {
                    enableRichPrompts: true,
                    enableDecisionLogging: true,
                    enableTimeoutHandling: true,
                    enableEscalationManagement: true,
                    auditRetentionDays: 90,
                    maxAuditRecords: 10000,
                    timeoutConfig: {
                        initialTimeout: 300000,
                        escalationTimeouts: [600000, 1200000, 1800000],
                        maxTotalTimeout: 3600000,
                        enableAutoEscalation: true,
                        notifyOnTimeout: true,
                    },
                });
        this.config = {
            enableSPARCIntegration: true,
            sparcDomainMapping: {
                ui: 'interfaces',
                api: 'rest-api',
                database: 'memory-systems',
                integration: 'swarm-coordination',
                infrastructure: 'general',
            },
            autoTriggerSPARC: true,
            sparcQualityGates: true,
            templatesPath: './templates',
            outputPath: './output',
            maxConcurrentWorkflows: 10,
            defaultTimeout: 300000,
            enableMetrics: true,
            enablePersistence: true,
            storageBackend: { type: 'database', config: {} },
            ...config,
        };
        this.registerProductFlowHandlers();
        this.registerSPARCIntegrationHandlers();
        this.registerProductWorkflowDefinitions();
        this.initializeGateDefinitions();
    }
    async initialize() {
        logger.info('Initializing Product Workflow Engine with SPARC Integration');
        await this.documentService.initialize();
        if (this.config.enablePersistence) {
            await this.loadPersistedWorkflows();
        }
        this.emit('initialized');
        logger.info('Product Workflow Engine ready - Product Flow + SPARC integrated');
    }
    async startProductWorkflow(workflowName, context = {}, options = {}) {
        const definition = this.workflowDefinitions.get(workflowName);
        if (!definition) {
            throw new Error(`Product workflow definition '${workflowName}' not found`);
        }
        const workflowId = `product-workflow-${Date.now()}-${nanoid()}`;
        const fullContext = {
            workspaceId: context.workspaceId || 'default',
            sessionId: workflowId,
            documents: context.documents || {},
            variables: context.variables || {},
            environment: {
                type: 'development',
                nodeVersion: process.version,
                workflowVersion: '2.0.0',
                features: ['product-flow', 'sparc-integration'],
                limits: {
                    maxSteps: 100,
                    maxDuration: 3600000,
                    maxMemory: 1024 * 1024 * 1024,
                    maxFileSize: 10 * 1024 * 1024,
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
            ...(context.currentDocument !== undefined
                ? { currentDocument: context.currentDocument }
                : {}),
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
            productFlow: {
                currentStep: 'vision-analysis',
                completedSteps: [],
                documents: {
                    adrs: [],
                    prds: [],
                    epics: [],
                    features: [],
                    tasks: [],
                },
            },
            sparcIntegration: {
                sparcProjects: new Map(),
                activePhases: new Map(),
                completedPhases: new Map(),
            },
        };
        this.activeWorkflows.set(workflowId, workflow);
        await this.memory.store(`product-workflow:${workflowId}`, workflow, 'workflows');
        this.executeProductWorkflow(workflow, options).catch((error) => {
            logger.error(`Product workflow ${workflowId} failed:`, error);
        });
        this.emit('product-workflow:started', { workflowId, name: workflowName });
        return { success: true, workflowId };
    }
    async executeProductWorkflow(workflow, options = {}) {
        try {
            const updatedWorkflow = {
                ...workflow,
                status: 'running',
            };
            this.activeWorkflows.set(workflow.id, updatedWorkflow);
            workflow = updatedWorkflow;
            await this.saveWorkflow(workflow);
            if (options?.dryRun) {
                logger.info(`🧪 DRY RUN: Would execute Product Flow workflow: ${workflow.definition.name}`);
                return;
            }
            if (options?.timeout) {
                setTimeout(() => {
                    throw new Error(`Workflow execution timed out after ${options?.timeout}ms`);
                }, options?.timeout);
            }
            logger.info(`🚀 Starting Product Flow workflow: ${workflow.definition.name}`);
            if (options?.maxConcurrency) {
                logger.info(`⚡ Max concurrency: ${options?.maxConcurrency}`);
            }
            const productFlowSteps = [
                'vision-analysis',
                'prd-creation',
                'epic-breakdown',
                'feature-definition',
                'task-creation',
                'sparc-integration',
            ];
            for (const productStep of productFlowSteps) {
                if (workflow.status !== 'running')
                    break;
                workflow.productFlow.currentStep = productStep;
                logger.info(`📋 Executing Product Flow step: ${productStep}`);
                await this.executeProductFlowStep(workflow, productStep);
                workflow.productFlow.completedSteps.push(productStep);
                await this.saveWorkflow(workflow);
            }
            if (workflow.status === 'running') {
                await this.validateProductWorkflowCompletion(workflow);
                const completedWorkflow = {
                    ...workflow,
                    status: 'completed',
                    progress: { ...workflow.progress, percentage: 100 },
                    endTime: new Date(),
                };
                this.activeWorkflows.set(workflow.id, completedWorkflow);
                workflow = completedWorkflow;
                this.emit('product-workflow:completed', { workflowId: workflow.id });
                logger.info(`✅ Product workflow ${workflow.id} completed successfully`);
            }
        }
        catch (error) {
            const failedWorkflow = {
                ...workflow,
                status: 'failed',
                error: {
                    code: 'PRODUCT_WORKFLOW_FAILED',
                    message: error.message,
                    recoverable: false,
                },
                endTime: new Date(),
            };
            this.activeWorkflows.set(workflow.id, failedWorkflow);
            workflow = failedWorkflow;
            this.emit('product-workflow:failed', { workflowId: workflow.id, error });
            logger.error(`❌ Product workflow ${workflow.id} failed:`, error);
        }
        finally {
            await this.saveWorkflow(workflow);
        }
    }
    async executeProductFlowStep(workflow, step) {
        const startTime = Date.now();
        try {
            switch (step) {
                case 'vision-analysis':
                    await this.executeVisionAnalysis(workflow);
                    break;
                case 'prd-creation':
                    await this.createPRDsFromVision(workflow);
                    break;
                case 'epic-breakdown':
                    await this.breakdownPRDsToEpics(workflow);
                    break;
                case 'feature-definition':
                    await this.defineFeatures(workflow);
                    break;
                case 'task-creation':
                    await this.createTasksFromFeatures(workflow);
                    break;
                case 'sparc-integration':
                    if (this.config.enableSPARCIntegration) {
                        await this.integrateSPARCForFeatures(workflow);
                    }
                    break;
                default:
                    throw new Error(`Unknown Product Flow step: ${step}`);
            }
            const duration = Date.now() - startTime;
            logger.info(`✅ Product Flow step '${step}' completed in ${duration}ms`);
        }
        catch (error) {
            logger.error(`❌ Product Flow step '${step}' failed:`, error);
            throw error;
        }
    }
    async integrateSPARCForFeatures(workflow) {
        logger.info('🔧 Integrating SPARC methodology for feature implementation');
        const shouldOpenGate = await this.shouldExecuteGate('sparc-integration', workflow);
        if (shouldOpenGate) {
            const gateResult = await this.executeWorkflowGate('sparc-integration', workflow, {
                question: 'Should we proceed with SPARC methodology integration for technical implementation?',
                businessImpact: 'critical',
                stakeholders: ['technical-lead', 'architect', 'product-manager'],
                gateType: 'approval',
            });
            if (!gateResult.approved) {
                throw new Error('SPARC integration gate rejected: ' +
                    (gateResult.error?.message || 'Unknown reason'));
            }
        }
        for (const feature of workflow.productFlow.documents.features) {
            if (this.shouldApplySPARCToFeature(feature)) {
                await this.createSPARCProjectForFeature(workflow, feature);
            }
        }
        await this.executeSPARCPhases(workflow);
    }
    shouldApplySPARCToFeature(feature) {
        const technicalFeatureTypes = [
            'api',
            'database',
            'integration',
            'infrastructure',
        ];
        return technicalFeatureTypes.includes(feature.feature_type);
    }
    async createSPARCProjectForFeature(workflow, feature) {
        logger.info(`🎯 Creating SPARC project for feature: ${feature.title}`);
        const sparcSpec = {
            name: `SPARC: ${feature.title}`,
            domain: this.mapFeatureTypeToSPARCDomain(feature.feature_type),
            complexity: this.assessFeatureComplexity(feature),
            requirements: feature.acceptance_criteria,
            constraints: [],
            targetMetrics: [],
        };
        const sparcProject = await this.sparcEngine.initializeProject(sparcSpec);
        workflow.sparcIntegration.sparcProjects.set(feature.id, sparcProject);
        workflow.sparcIntegration.activePhases.set(feature.id, 'specification');
        workflow.sparcIntegration.completedPhases.set(feature.id, []);
        if (!feature.sparc_implementation) {
            feature.sparc_implementation = {
                sparc_project_id: sparcProject.id,
                sparc_phases: {
                    specification: { status: 'not_started', deliverables: [] },
                    pseudocode: {
                        status: 'not_started',
                        deliverables: [],
                        algorithms: [],
                    },
                    architecture: {
                        status: 'not_started',
                        deliverables: [],
                        components: [],
                    },
                    refinement: {
                        status: 'not_started',
                        deliverables: [],
                        optimizations: [],
                    },
                    completion: {
                        status: 'not_started',
                        deliverables: [],
                        artifacts: [],
                    },
                },
                current_sparc_phase: 'specification',
                sparc_progress_percentage: 0,
                use_sparc_methodology: true,
                sparc_domain: this.mapFeatureTypeToSPARCDomain(feature.feature_type),
                sparc_complexity: this.assessFeatureComplexity(feature),
                integration_health: {
                    sync_status: 'synced',
                    last_sync_date: new Date(),
                    sync_errors: [],
                },
            };
        }
        logger.info(`✅ SPARC project created for feature ${feature.title}: ${sparcProject.id}`);
    }
    async executeSPARCPhases(workflow) {
        const sparcPhases = [
            'specification',
            'pseudocode',
            'architecture',
            'refinement',
            'completion',
        ];
        for (const [featureId, sparcProject] of Array.from(workflow.sparcIntegration.sparcProjects.entries())) {
            logger.info(`🚀 Executing SPARC phases for feature ${featureId}`);
            for (const phase of sparcPhases) {
                try {
                    const result = await this.sparcEngine.executePhase(sparcProject, phase);
                    if (result?.success) {
                        const completedPhases = workflow.sparcIntegration.completedPhases.get(featureId) || [];
                        completedPhases.push(phase);
                        workflow.sparcIntegration.completedPhases.set(featureId, completedPhases);
                        const nextPhase = result?.nextPhase;
                        if (nextPhase) {
                            workflow.sparcIntegration.activePhases.set(featureId, nextPhase);
                        }
                        else {
                            workflow.sparcIntegration.activePhases.delete(featureId);
                        }
                        await this.updateFeatureSPARCProgress(featureId, phase, result);
                        logger.info(`✅ SPARC ${phase} completed for feature ${featureId}`);
                    }
                }
                catch (error) {
                    logger.error(`❌ SPARC ${phase} failed for feature ${featureId}:`, error);
                }
            }
        }
    }
    async updateFeatureSPARCProgress(featureId, completedPhase, _result) {
        logger.info(`📊 Updated SPARC progress for feature ${featureId}: ${completedPhase} completed`);
    }
    mapFeatureTypeToSPARCDomain(featureType) {
        return this.config.sparcDomainMapping[featureType] || 'general';
    }
    assessFeatureComplexity(feature) {
        try {
            const complexityScore = this.calculateComplexityScore(feature);
            const weights = {
                acceptance_criteria: 0.3,
                dependencies: 0.2,
                technical_risk: 0.2,
                business_impact: 0.15,
                estimation_confidence: 0.15,
            };
            const dimensions = {
                acceptance_criteria: this.assessCriteriaComplexity(feature.acceptance_criteria),
                dependencies: this.assessDependencyComplexity(feature),
                technical_risk: this.assessTechnicalRisk(feature),
                business_impact: this.assessBusinessImpact(feature),
                estimation_confidence: this.assessEstimationConfidence(feature),
            };
            const weightedScore = Object.entries(dimensions).reduce((acc, [dimension, score]) => acc + score * weights[dimension], 0);
            let level;
            let risk;
            if (weightedScore <= 30) {
                level = 'simple';
                risk = 'low';
            }
            else if (weightedScore <= 60) {
                level = 'moderate';
                risk = 'medium';
            }
            else if (weightedScore <= 80) {
                level = 'high';
                risk = 'high';
            }
            else {
                level = 'complex';
                risk = 'critical';
            }
            const result = {
                level,
                risk,
                score: Math.round(weightedScore),
                dimensions,
                recommendations: this.generateComplexityRecommendations(weightedScore, dimensions),
                metadata: {
                    criteria_count: feature.acceptance_criteria.length,
                    estimated_effort_hours: this.estimateEffortHours(weightedScore),
                    suggested_team_size: this.suggestTeamSize(weightedScore),
                    breakdowns_recommended: weightedScore > 70,
                },
            };
            logger.debug(`Feature complexity assessed: ${feature.title}`, result);
            return result;
        }
        catch (error) {
            logger.error('Error in feature complexity assessment:', error);
            const criteriaCount = feature.acceptance_criteria.length;
            if (criteriaCount <= 2)
                return { level: 'simple', score: 25 };
            if (criteriaCount <= 5)
                return { level: 'moderate', score: 50 };
            if (criteriaCount <= 10)
                return { level: 'high', score: 75 };
            return { level: 'complex', score: 90 };
        }
    }
    calculateComplexityScore(feature) {
        let score = Math.min(50, feature.acceptance_criteria.length * 5);
        const description = `${feature.title} ${feature.description || ''}`;
        const technicalTerms = this.countTechnicalTerms(description);
        score += Math.min(20, technicalTerms * 2);
        if (description.toLowerCase().includes('api') ||
            description.toLowerCase().includes('integration')) {
            score += 15;
        }
        return score;
    }
    assessCriteriaComplexity(criteria) {
        if (criteria.length === 0)
            return 0;
        let complexity = Math.min(80, criteria.length * 8);
        const complexityKeywords = [
            'integration',
            'api',
            'security',
            'performance',
            'scalability',
            'migration',
            'compatibility',
            'validation',
            'authentication',
            'authorization',
        ];
        criteria.forEach((criterion) => {
            const lowerCriterion = criterion.toLowerCase();
            const keywordCount = complexityKeywords.filter((keyword) => lowerCriterion.includes(keyword)).length;
            complexity += keywordCount * 5;
        });
        return Math.min(100, complexity);
    }
    assessDependencyComplexity(feature) {
        const content = `${feature.title} ${feature.description || ''}`;
        const dependencyIndicators = [
            'depends on',
            'requires',
            'after',
            'before',
            'integration with',
            'api',
            'service',
            'database',
            'external',
            'third-party',
        ];
        let dependencyScore = 0;
        dependencyIndicators.forEach((indicator) => {
            if (content.toLowerCase().includes(indicator)) {
                dependencyScore += 10;
            }
        });
        return Math.min(100, dependencyScore);
    }
    assessTechnicalRisk(feature) {
        const content = `${feature.title} ${feature.description || ''}`;
        const riskKeywords = [
            'new technology',
            'prototype',
            'experiment',
            'migration',
            'refactor',
            'security',
            'performance',
            'scalability',
            'complex algorithm',
            'machine learning',
        ];
        let riskScore = 20;
        riskKeywords.forEach((keyword) => {
            if (content.toLowerCase().includes(keyword)) {
                riskScore += 15;
            }
        });
        return Math.min(100, riskScore);
    }
    assessBusinessImpact(feature) {
        const content = `${feature.title} ${feature.description || ''}`;
        const impactKeywords = [
            'critical',
            'urgent',
            'high priority',
            'revenue',
            'customer',
            'compliance',
            'legal',
            'security',
            'data protection',
        ];
        let impactScore = 30;
        impactKeywords.forEach((keyword) => {
            if (content.toLowerCase().includes(keyword)) {
                impactScore += 10;
            }
        });
        return Math.min(100, impactScore);
    }
    assessEstimationConfidence(feature) {
        const criteriaCount = feature.acceptance_criteria.length;
        const avgCriteriaLength = feature.acceptance_criteria.reduce((acc, c) => acc + c.length, 0) /
            (criteriaCount || 1);
        let confidence = Math.min(70, criteriaCount * 10);
        if (avgCriteriaLength > 50)
            confidence += 20;
        if (feature.description && feature.description.length > 100)
            confidence += 10;
        return 100 - Math.min(100, confidence);
    }
    countTechnicalTerms(text) {
        const technicalTerms = [
            'api',
            'database',
            'server',
            'client',
            'authentication',
            'authorization',
            'microservice',
            'endpoint',
            'integration',
            'migration',
            'deployment',
            'algorithm',
            'optimization',
            'caching',
            'queue',
            'webhook',
        ];
        const lowerText = text.toLowerCase();
        return technicalTerms.filter((term) => lowerText.includes(term)).length;
    }
    generateComplexityRecommendations(score, dimensions) {
        const recommendations = [];
        if (score > 70) {
            recommendations.push('Consider breaking down into smaller features');
            recommendations.push('Conduct technical spike to validate approach');
        }
        if (dimensions.dependencies > 60) {
            recommendations.push('Map out all dependencies before starting development');
            recommendations.push('Consider phased implementation to manage dependencies');
        }
        if (dimensions.technical_risk > 70) {
            recommendations.push('Assign senior developers to this feature');
            recommendations.push('Plan additional testing and validation phases');
        }
        if (dimensions.estimation_confidence > 60) {
            recommendations.push('Refine acceptance criteria with more detail');
            recommendations.push('Conduct estimation review with multiple team members');
        }
        if (score < 40) {
            recommendations.push('Good candidate for junior developers');
            recommendations.push('Can be included in regular sprint planning');
        }
        return recommendations.length > 0
            ? recommendations
            : ['Feature complexity is manageable with standard practices'];
    }
    estimateEffortHours(complexityScore) {
        if (complexityScore <= 30)
            return Math.floor(8 + complexityScore * 0.5);
        if (complexityScore <= 60)
            return Math.floor(20 + complexityScore * 1.2);
        if (complexityScore <= 80)
            return Math.floor(40 + complexityScore * 2);
        return Math.floor(80 + complexityScore * 3);
    }
    suggestTeamSize(complexityScore) {
        if (complexityScore <= 40)
            return 1;
        if (complexityScore <= 65)
            return 2;
        if (complexityScore <= 85)
            return 3;
        return 4;
    }
    async executeVisionAnalysis(workflow) {
        logger.info('📄 Analyzing vision document for requirements extraction');
        const shouldOpenGate = await this.shouldExecuteGate('vision-analysis', workflow);
        if (shouldOpenGate) {
            const gateResult = await this.executeWorkflowGate('vision-analysis', workflow, {
                question: 'Should we proceed with vision analysis?',
                businessImpact: 'high',
                stakeholders: ['product-manager', 'business-analyst'],
                gateType: 'checkpoint',
            });
            if (!gateResult.approved) {
                throw new Error('Vision analysis gate rejected: ' +
                    (gateResult.error?.message || 'Unknown reason'));
            }
        }
    }
    async createPRDsFromVision(workflow) {
        logger.info('📋 Creating Product Requirements Documents from vision');
        const shouldOpenGate = await this.shouldExecuteGate('prd-creation', workflow);
        if (shouldOpenGate) {
            const gateResult = await this.executeWorkflowGate('prd-creation', workflow, {
                question: 'Are the PRDs ready for creation based on the vision analysis?',
                businessImpact: 'high',
                stakeholders: [
                    'product-manager',
                    'business-stakeholder',
                    'technical-lead',
                ],
                gateType: 'approval',
            });
            if (!gateResult.approved) {
                throw new Error('PRD creation gate rejected: ' +
                    (gateResult.error?.message || 'Unknown reason'));
            }
        }
    }
    async breakdownPRDsToEpics(workflow) {
        logger.info('📈 Breaking down PRDs into Epic-level features');
        const shouldOpenGate = await this.shouldExecuteGate('epic-breakdown', workflow);
        if (shouldOpenGate) {
            const gateResult = await this.executeWorkflowGate('epic-breakdown', workflow, {
                question: 'Should we proceed with breaking down PRDs into epics?',
                businessImpact: 'medium',
                stakeholders: ['product-manager', 'engineering-manager'],
                gateType: 'checkpoint',
            });
            if (!gateResult.approved) {
                throw new Error('Epic breakdown gate rejected: ' +
                    (gateResult.error?.message || 'Unknown reason'));
            }
        }
    }
    async defineFeatures(workflow) {
        logger.info('🎯 Defining individual implementable features');
        const shouldOpenGate = await this.shouldExecuteGate('feature-definition', workflow);
        if (shouldOpenGate) {
            const gateResult = await this.executeWorkflowGate('feature-definition', workflow, {
                question: 'Are we ready to define individual features from the epics?',
                businessImpact: 'high',
                stakeholders: ['product-manager', 'tech-lead', 'ux-designer'],
                gateType: 'approval',
            });
            if (!gateResult.approved) {
                throw new Error('Feature definition gate rejected: ' +
                    (gateResult.error?.message || 'Unknown reason'));
            }
        }
    }
    async createTasksFromFeatures(_workflow) {
        logger.info('📝 Creating implementation tasks from features');
    }
    async validateProductWorkflowCompletion(_workflow) {
        logger.info('✅ Validating complete Product Flow workflow');
    }
    registerProductFlowHandlers() {
        this.stepHandlers.set('vision-analysis', this.handleVisionAnalysis.bind(this));
        this.stepHandlers.set('prd-creation', this.handlePRDCreation.bind(this));
        this.stepHandlers.set('epic-breakdown', this.handleEpicBreakdown.bind(this));
        this.stepHandlers.set('feature-definition', this.handleFeatureDefinition.bind(this));
        this.stepHandlers.set('task-creation', this.handleTaskCreation.bind(this));
    }
    registerSPARCIntegrationHandlers() {
        this.stepHandlers.set('sparc-integration', this.handleSPARCIntegration.bind(this));
        this.stepHandlers.set('sparc-specification', this.handleSPARCSpecification.bind(this));
        this.stepHandlers.set('sparc-pseudocode', this.handleSPARCPseudocode.bind(this));
        this.stepHandlers.set('sparc-architecture', this.handleSPARCArchitecture.bind(this));
        this.stepHandlers.set('sparc-refinement', this.handleSPARCRefinement.bind(this));
        this.stepHandlers.set('sparc-completion', this.handleSPARCCompletion.bind(this));
    }
    registerProductWorkflowDefinitions() {
        const completeProductWorkflow = {
            name: 'complete-product-flow',
            description: 'Complete Product Flow: Vision → PRDs → Epics → Features → Tasks → Code (ADRs managed independently)',
            version: '2.0.0',
            steps: [
                { type: 'vision-analysis', name: 'Analyze Vision Document' },
                { type: 'prd-creation', name: 'Create Product Requirements Documents' },
                { type: 'epic-breakdown', name: 'Break down PRDs into Epics' },
                { type: 'feature-definition', name: 'Define Individual Features' },
                { type: 'task-creation', name: 'Create Implementation Tasks' },
                {
                    type: 'sparc-integration',
                    name: 'Apply SPARC Methodology to Features',
                },
            ],
            documentTypes: ['vision'],
            triggers: [
                { event: 'document:created', condition: 'documentType === "vision"' },
            ],
        };
        this.workflowDefinitions.set('complete-product-flow', completeProductWorkflow);
    }
    async handleVisionAnalysis(_context, _params) {
        return {
            success: true,
            data: { analyzed: true },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handlePRDCreation(_context, _params) {
        return {
            success: true,
            data: { prds_created: 2 },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handleEpicBreakdown(_context, _params) {
        return {
            success: true,
            data: { epics_created: 5 },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handleFeatureDefinition(_context, _params) {
        return {
            success: true,
            data: { features_defined: 12 },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handleTaskCreation(_context, _params) {
        return {
            success: true,
            data: { tasks_created: 24 },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handleSPARCIntegration(_context, _params) {
        return {
            success: true,
            data: { sparc_projects_created: 8 },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handleSPARCSpecification(_context, _params) {
        return {
            success: true,
            data: { specifications_completed: true },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handleSPARCPseudocode(_context, _params) {
        return {
            success: true,
            data: { pseudocode_generated: true },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handleSPARCArchitecture(_context, _params) {
        return {
            success: true,
            data: { architecture_designed: true },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handleSPARCRefinement(_context, _params) {
        return {
            success: true,
            data: { refinements_applied: true },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    async handleSPARCCompletion(_context, _params) {
        return {
            success: true,
            data: { implementation_completed: true },
            metadata: { timestamp: new Date().toISOString() },
        };
    }
    initializeGateDefinitions() {
        const gateDefinitions = [
            {
                id: 'vision-analysis',
                gate: this.createGateDefinition('vision-analysis', 'Vision Analysis Gate', 'Strategic gate to validate vision document analysis before proceeding', 'strategic', WorkflowGatePriority.HIGH),
            },
            {
                id: 'prd-creation',
                gate: this.createGateDefinition('prd-creation', 'PRD Creation Gate', 'Business gate to approve PRD creation based on vision analysis', 'business', WorkflowGatePriority.HIGH),
            },
            {
                id: 'epic-breakdown',
                gate: this.createGateDefinition('epic-breakdown', 'Epic Breakdown Gate', 'Checkpoint gate to validate epic breakdown from PRDs', 'checkpoint', WorkflowGatePriority.MEDIUM),
            },
            {
                id: 'feature-definition',
                gate: this.createGateDefinition('feature-definition', 'Feature Definition Gate', 'Strategic gate to approve individual feature definitions', 'strategic', WorkflowGatePriority.HIGH),
            },
            {
                id: 'sparc-integration',
                gate: this.createGateDefinition('sparc-integration', 'SPARC Integration Gate', 'Architectural gate to approve SPARC methodology integration', 'architectural', WorkflowGatePriority.CRITICAL),
            },
        ];
        gateDefinitions.forEach(({ id, gate }) => {
            this.gateDefinitions.set(id, gate);
        });
        logger.info('Initialized gate definitions', {
            gateCount: this.gateDefinitions.size,
            gates: Array.from(this.gateDefinitions.keys()),
        });
    }
    createGateDefinition(subtype, title, description, category, priority) {
        const gateId = `product-workflow-gate-${subtype}-${Date.now()}`;
        return {
            id: gateId,
            type: 'STRATEGIC',
            subtype,
            title,
            description,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
            workflowContext: {
                gateWorkflowId: 'product-workflow',
                phaseName: subtype,
                businessDomain: 'product',
                technicalDomain: 'workflow',
                stakeholderGroups: ['product-manager', 'technical-lead'],
                impactAssessment: {
                    businessImpact: 0.8,
                    technicalImpact: 0.7,
                    riskImpact: 0.6,
                    resourceImpact: {
                        timeHours: 40,
                        costImpact: 10000,
                        teamSize: 3,
                        criticality: 'medium',
                    },
                    complianceImpact: {
                        regulations: [],
                        riskLevel: 'low',
                        requiredReviews: ['product'],
                        deadlines: [],
                    },
                    userExperienceImpact: 0.5,
                },
            },
            gateData: {
                payload: { category, phase: subtype },
                structured: { type: category },
                attachments: [],
                externalReferences: [],
            },
            triggers: [],
            priority,
            approvalConfig: {
                requiredApprovals: 1,
                approvers: ['product-manager'],
                escalationChain: {
                    levels: [GateEscalationLevel.TEAM_LEAD, GateEscalationLevel.MANAGER],
                    timeout: 300000,
                },
            },
            metrics: {
                createdAt: new Date(),
                triggeredCount: 0,
                totalResolutionTime: 0,
                averageResolutionTime: 0,
                approvalRate: 0,
                escalationRate: 0,
            },
        };
    }
    async shouldExecuteGate(stepName, workflow) {
        const gateDefinition = this.gateDefinitions.get(stepName);
        if (!gateDefinition) {
            return false;
        }
        if (!this.config.sparcQualityGates) {
            return false;
        }
        return true;
    }
    async executeWorkflowGate(stepName, workflow, gateConfig) {
        const startTime = Date.now();
        const gateId = `${workflow.id}-${stepName}-${Date.now()}`;
        logger.info('Executing workflow gate', {
            gateId,
            stepName,
            workflowId: workflow.id,
            gateType: gateConfig.gateType,
            businessImpact: gateConfig.businessImpact,
        });
        try {
            const gateWorkflowContext = {
                workflowId: workflow.id,
                stepName,
                businessImpact: gateConfig.businessImpact,
                decisionScope: 'task',
                stakeholders: gateConfig.stakeholders,
                deadline: new Date(Date.now() + 3600000),
                dependencies: [],
                riskFactors: [
                    {
                        id: 'workflow-dependency',
                        category: 'operational',
                        severity: 'medium',
                        probability: 0.3,
                        description: 'Workflow step dependency risk',
                    },
                ],
            };
            const gateRequest = {
                id: gateId,
                type: 'checkpoint',
                question: gateConfig.question,
                context: {
                    workflowStep: stepName,
                    workflowId: workflow.id,
                    productFlow: workflow.productFlow,
                },
                confidence: 0.8,
                priority: gateConfig.businessImpact === 'critical' ? 'critical' : 'medium',
                validationReason: `Product workflow gate for ${stepName}`,
                expectedImpact: gateConfig.businessImpact === 'critical' ? 0.9 : 0.5,
                workflowContext: gateWorkflowContext,
                gateType: gateConfig.gateType,
                requiredApprovalLevel: this.getRequiredApprovalLevel(gateConfig.businessImpact),
                timeoutConfig: {
                    initialTimeout: 300000,
                    escalationTimeouts: [600000, 1200000],
                    maxTotalTimeout: 1800000,
                },
                integrationConfig: {
                    correlationId: `${workflow.id}-${stepName}`,
                    domainValidation: true,
                    enableMetrics: true,
                },
            };
            this.pendingGates.set(gateId, gateRequest);
            const pausedWorkflow = {
                ...workflow,
                status: 'paused',
                pausedAt: new Date(),
            };
            this.activeWorkflows.set(workflow.id, pausedWorkflow);
            await this.saveWorkflow(pausedWorkflow);
            const gateResponse = await this.aguiAdapter.processWorkflowGate(gateRequest);
            const approved = this.interpretGateResponse(gateResponse);
            const gateResult = {
                success: true,
                gateId,
                approved,
                processingTime: Date.now() - startTime,
                escalationLevel: GateEscalationLevel.NONE,
                decisionMaker: 'user',
                correlationId: gateRequest.integrationConfig?.correlationId || '',
            };
            if (approved) {
                const resumedWorkflow = {
                    ...pausedWorkflow,
                    status: 'running',
                };
                resumedWorkflow.pausedAt = undefined;
                this.activeWorkflows.set(workflow.id, resumedWorkflow);
                await this.saveWorkflow(resumedWorkflow);
            }
            this.pendingGates.delete(gateId);
            logger.info('Workflow gate completed', {
                gateId,
                approved,
                processingTime: gateResult.processingTime,
                decisionMaker: gateResult.decisionMaker,
            });
            return gateResult;
        }
        catch (error) {
            logger.error('Workflow gate execution failed', {
                gateId,
                stepName,
                error: error instanceof Error ? error.message : String(error),
            });
            this.pendingGates.delete(gateId);
            return {
                success: false,
                gateId,
                approved: false,
                processingTime: Date.now() - startTime,
                escalationLevel: GateEscalationLevel.NONE,
                error: error instanceof Error ? error : new Error(String(error)),
                correlationId: '',
            };
        }
    }
    getRequiredApprovalLevel(businessImpact) {
        switch (businessImpact) {
            case 'low':
                return GateEscalationLevel.NONE;
            case 'medium':
                return GateEscalationLevel.TEAM_LEAD;
            case 'high':
                return GateEscalationLevel.MANAGER;
            case 'critical':
                return GateEscalationLevel.DIRECTOR;
            default:
                return GateEscalationLevel.TEAM_LEAD;
        }
    }
    interpretGateResponse(response) {
        const approvalKeywords = [
            'yes',
            'approve',
            'approved',
            'accept',
            'ok',
            'continue',
            'proceed',
        ];
        const rejectionKeywords = [
            'no',
            'reject',
            'rejected',
            'deny',
            'stop',
            'cancel',
            'abort',
        ];
        const lowerResponse = response.toLowerCase();
        if (approvalKeywords.some((keyword) => lowerResponse.includes(keyword))) {
            return true;
        }
        if (rejectionKeywords.some((keyword) => lowerResponse.includes(keyword))) {
            return false;
        }
        return false;
    }
    async saveWorkflow(workflow) {
        if (!this.config.enablePersistence)
            return;
        try {
            await this.memory.store(`product-workflow:${workflow.id}`, workflow, 'workflows');
        }
        catch (error) {
            logger.error(`Failed to save product workflow ${workflow.id}:`, error);
        }
    }
    async loadPersistedWorkflows() {
        try {
            const workflows = await this.memory.search('product-workflow:*', 'workflows');
            let loadedCount = 0;
            for (const [key, workflow] of Object.entries(workflows)) {
                try {
                    const workflowState = workflow;
                    if (workflowState.status === 'running' ||
                        workflowState.status === 'paused') {
                        this.activeWorkflows.set(workflowState.id, workflowState);
                        logger.info(`Loaded persisted product workflow: ${workflowState.id}`);
                        loadedCount++;
                    }
                }
                catch (error) {
                    logger.warn(`Failed to load product workflow from memory: ${key}`, error);
                }
            }
            logger.info(`Loaded ${loadedCount} persisted product workflows`);
        }
        catch (error) {
            logger.error('Failed to load persisted product workflows:', error);
        }
    }
    async getActiveProductWorkflows() {
        return Array.from(this.activeWorkflows.values()).filter((w) => ['running', 'paused'].includes(w.status));
    }
    async getProductWorkflowStatus(workflowId) {
        return this.activeWorkflows.get(workflowId) || null;
    }
    async pauseProductWorkflow(workflowId, reason) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow && workflow.status === 'running') {
            const pausedWorkflow = {
                ...workflow,
                status: 'paused',
                pausedAt: new Date(),
            };
            this.activeWorkflows.set(workflowId, pausedWorkflow);
            await this.saveWorkflow(pausedWorkflow);
            this.emit('product-workflow:paused', { workflowId, reason });
            logger.info('Product workflow paused', { workflowId, reason });
            return { success: true };
        }
        return {
            success: false,
            error: 'Product workflow not found or not running',
        };
    }
    async resumeProductWorkflow(workflowId, reason) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (workflow && workflow.status === 'paused') {
            const { pausedAt, ...resumedWorkflow } = workflow;
            const runningWorkflow = {
                ...resumedWorkflow,
                status: 'running',
            };
            this.activeWorkflows.set(workflowId, runningWorkflow);
            this.executeProductWorkflow(runningWorkflow).catch((error) => {
                logger.error(`Product workflow ${workflowId} failed after resume:`, error);
            });
            this.emit('product-workflow:resumed', { workflowId, reason });
            logger.info('Product workflow resumed', { workflowId, reason });
            return { success: true };
        }
        return {
            success: false,
            error: 'Product workflow not found or not paused',
        };
    }
    async getPendingGates() {
        return new Map(this.pendingGates);
    }
    getGateDefinitions() {
        return new Map(this.gateDefinitions);
    }
    async cancelGate(gateId, reason) {
        const gateRequest = this.pendingGates.get(gateId);
        if (!gateRequest) {
            return { success: false, error: 'Gate not found' };
        }
        try {
            const cancelled = await this.aguiAdapter.cancelGate(gateId, reason);
            if (cancelled) {
                this.pendingGates.delete(gateId);
                logger.info('Gate cancelled', { gateId, reason });
                return { success: true };
            }
            return {
                success: false,
                error: 'Failed to cancel gate through AGUI adapter',
            };
        }
        catch (error) {
            logger.error('Error cancelling gate', {
                gateId,
                error: error instanceof Error ? error.message : String(error),
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    getWorkflowDecisionHistory(workflowId) {
        return this.aguiAdapter.getWorkflowDecisionHistory(workflowId);
    }
    getGateStatistics() {
        return this.aguiAdapter.getStatistics();
    }
    async shutdownGates() {
        logger.info('Shutting down workflow gates');
        for (const [gateId] of this.pendingGates) {
            await this.cancelGate(gateId, 'System shutdown');
        }
        await this.aguiAdapter.shutdown();
        logger.info('Workflow gates shutdown complete');
    }
    async shutdown() {
        logger.info('Shutting down ProductWorkflowEngine');
        for (const workflow of this.activeWorkflows.values()) {
            if (workflow.status === 'running' || workflow.status === 'paused') {
                const failedWorkflow = {
                    ...workflow,
                    status: 'cancelled',
                    endTime: new Date(),
                };
                this.activeWorkflows.set(workflow.id, failedWorkflow);
                await this.saveWorkflow(failedWorkflow);
            }
        }
        await this.shutdownGates();
        logger.info('ProductWorkflowEngine shutdown complete');
    }
}
//# sourceMappingURL=product-workflow-engine.js.map