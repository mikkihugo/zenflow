import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export var SystemArchitectureType;
(function (SystemArchitectureType) {
    SystemArchitectureType["MONOLITHIC"] = "monolithic";
    SystemArchitectureType["MICROSERVICES"] = "microservices";
    SystemArchitectureType["MODULAR"] = "modular";
    SystemArchitectureType["LAYERED"] = "layered";
    SystemArchitectureType["EVENT_DRIVEN"] = "event_driven";
    SystemArchitectureType["SERVICE_ORIENTED"] = "service_oriented";
    SystemArchitectureType["HEXAGONAL"] = "hexagonal";
    SystemArchitectureType["CLEAN"] = "clean";
})(SystemArchitectureType || (SystemArchitectureType = {}));
export var SolutionArchitecturePattern;
(function (SolutionArchitecturePattern) {
    SolutionArchitecturePattern["DISTRIBUTED_SYSTEM"] = "distributed_system";
    SolutionArchitecturePattern["CLOUD_NATIVE"] = "cloud_native";
    SolutionArchitecturePattern["HYBRID_CLOUD"] = "hybrid_cloud";
    SolutionArchitecturePattern["MULTI_TENANT"] = "multi_tenant";
    SolutionArchitecturePattern["SERVERLESS"] = "serverless";
    SolutionArchitecturePattern["EDGE_COMPUTING"] = "edge_computing";
    SolutionArchitecturePattern["IOT_SOLUTION"] = "iot_solution";
    SolutionArchitecturePattern["DATA_PLATFORM"] = "data_platform";
})(SolutionArchitecturePattern || (SolutionArchitecturePattern = {}));
export var SystemDesignStatus;
(function (SystemDesignStatus) {
    SystemDesignStatus["DRAFT"] = "draft";
    SystemDesignStatus["UNDER_REVIEW"] = "under_review";
    SystemDesignStatus["APPROVED"] = "approved";
    SystemDesignStatus["IMPLEMENTED"] = "implemented";
    SystemDesignStatus["DEPRECATED"] = "deprecated";
    SystemDesignStatus["SUPERSEDED"] = "superseded";
})(SystemDesignStatus || (SystemDesignStatus = {}));
export var ComponentType;
(function (ComponentType) {
    ComponentType["SERVICE"] = "service";
    ComponentType["LIBRARY"] = "library";
    ComponentType["DATABASE"] = "database";
    ComponentType["QUEUE"] = "queue";
    ComponentType["CACHE"] = "cache";
    ComponentType["GATEWAY"] = "gateway";
    ComponentType["LOAD_BALANCER"] = "load_balancer";
    ComponentType["PROXY"] = "proxy";
    ComponentType["MONITOR"] = "monitor";
})(ComponentType || (ComponentType = {}));
export var SolutionDesignStatus;
(function (SolutionDesignStatus) {
    SolutionDesignStatus["CONCEPT"] = "concept";
    SolutionDesignStatus["DESIGN"] = "design";
    SolutionDesignStatus["REVIEW"] = "review";
    SolutionDesignStatus["APPROVED"] = "approved";
    SolutionDesignStatus["IMPLEMENTATION"] = "implementation";
    SolutionDesignStatus["DEPLOYED"] = "deployed";
    SolutionDesignStatus["RETIRED"] = "retired";
})(SolutionDesignStatus || (SolutionDesignStatus = {}));
export var MaturityLevel;
(function (MaturityLevel) {
    MaturityLevel["INITIAL"] = "initial";
    MaturityLevel["DEVELOPING"] = "developing";
    MaturityLevel["DEFINED"] = "defined";
    MaturityLevel["MANAGED"] = "managed";
    MaturityLevel["OPTIMIZING"] = "optimizing";
})(MaturityLevel || (MaturityLevel = {}));
export class SystemSolutionArchitectureManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    gatesManager;
    runwayManager;
    piManager;
    valueStreamMapper;
    config;
    state;
    complianceTimer;
    reviewTimer;
    constructor(eventBus, memory, gatesManager, runwayManager, piManager, valueStreamMapper, config = {}) {
        super();
        this.logger = getLogger('system-solution-architecture-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.gatesManager = gatesManager;
        this.runwayManager = runwayManager;
        this.piManager = piManager;
        this.valueStreamMapper = valueStreamMapper;
        this.config = {
            enableSystemDesignCoordination: true,
            enableSolutionArchitectWorkflow: true,
            enableArchitectureReviews: true,
            enableComplianceMonitoring: true,
            enableAGUIIntegration: true,
            systemDesignReviewInterval: 604800000,
            complianceCheckInterval: 86400000,
            architectureReviewTimeout: 172800000,
            maxSystemsPerSolution: 20,
            maxComponentsPerSystem: 50,
            maxInterfacesPerComponent: 20,
            complianceThreshold: 80,
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing System and Solution Architecture Manager', {
            config: this.config,
        });
        try {
            await this.loadPersistedState();
            if (this.config.enableComplianceMonitoring) {
                this.startComplianceMonitoring();
            }
            if (this.config.enableArchitectureReviews) {
                this.startArchitectureReviews();
            }
            this.registerEventHandlers();
            this.logger.info('System and Solution Architecture Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize System and Solution Architecture Manager', { error });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down System and Solution Architecture Manager');
        if (this.complianceTimer)
            clearInterval(this.complianceTimer);
        if (this.reviewTimer)
            clearInterval(this.reviewTimer);
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('System and Solution Architecture Manager shutdown complete');
    }
    async createSystemDesign(solutionId, systemData) {
        this.logger.info('Creating system design', {
            solutionId,
            systemName: systemData.name,
        });
        const systemDesign = {
            id: `system-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: systemData.name || 'Unnamed System',
            description: systemData.description || '',
            solutionId,
            type: systemData.type || SystemArchitectureType.MODULAR,
            version: systemData.version || '1.0.0',
            status: SystemDesignStatus.DRAFT,
            architect: systemData.architect || 'system',
            stakeholders: systemData.stakeholders || [],
            businessContext: systemData.businessContext || this.createDefaultBusinessContext(),
            architecturalDrivers: systemData.architecturalDrivers || [],
            qualityAttributes: systemData.qualityAttributes || [],
            constraints: systemData.constraints || [],
            components: systemData.components || [],
            interfaces: systemData.interfaces || [],
            dependencies: systemData.dependencies || [],
            deployment: systemData.deployment || this.createDefaultDeploymentArchitecture(),
            security: systemData.security || this.createDefaultSecurityArchitecture(),
            data: systemData.data || this.createDefaultDataArchitecture(),
            integration: systemData.integration || this.createDefaultIntegrationArchitecture(),
            governance: systemData.governance || this.createDefaultGovernanceFramework(),
            createdAt: new Date(),
            lastUpdated: new Date(),
        };
        this.state.systemDesigns.set(systemDesign.id, systemDesign);
        await this.createSystemDesignReviewGate(systemDesign);
        this.logger.info('System design created', {
            systemId: systemDesign.id,
            componentCount: systemDesign.components.length,
        });
        this.emit('system-design-created', systemDesign);
        return systemDesign;
    }
    async coordinateSystemDesigns(solutionId) {
        this.logger.info('Coordinating system designs', { solutionId });
        const systemDesigns = Array.from(this.state.systemDesigns.values()).filter((system) => system.solutionId === solutionId);
        const interactions = await this.analyzeSystemInteractions(systemDesigns);
        const conflicts = await this.identifyDesignConflicts(systemDesigns);
        const recommendations = await this.generateCoordinationRecommendations(systemDesigns, interactions, conflicts);
        const consistencyAssessment = await this.assessArchitecturalConsistency(systemDesigns);
        const coordination = {
            solutionId,
            systemCount: systemDesigns.length,
            interactions,
            conflicts,
            recommendations,
            consistencyScore: consistencyAssessment.score,
            coordinationStatus: consistencyAssessment.status,
            lastCoordinated: new Date(),
        };
        if (conflicts.length > 0) {
            await this.createCoordinationApprovalGate(coordination, conflicts);
        }
        this.logger.info('System design coordination completed', {
            solutionId,
            systemCount: systemDesigns.length,
            conflictCount: conflicts.length,
        });
        this.emit('system-designs-coordinated', coordination);
        return coordination;
    }
    async createSolutionArchitectWorkflow(solutionId, workflowType) {
        this.logger.info('Creating solution architect workflow', {
            solutionId,
            workflowType,
        });
        const workflow = {
            id: `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            solutionId,
            type: workflowType,
            status: 'initiated',
            steps: await this.generateWorkflowSteps(workflowType),
            participants: await this.identifyWorkflowParticipants(solutionId, workflowType),
            deliverables: await this.defineWorkflowDeliverables(workflowType),
            timeline: await this.estimateWorkflowTimeline(workflowType),
            dependencies: await this.identifyWorkflowDependencies(solutionId, workflowType),
            gates: await this.defineWorkflowGates(workflowType),
            createdAt: new Date(),
            lastUpdated: new Date(),
        };
        await this.executeWorkflowStep(workflow.id, workflow.steps[0]);
        this.logger.info('Solution architect workflow created', {
            workflowId: workflow.id,
            stepCount: workflow.steps.length,
        });
        this.emit('solution-architect-workflow-created', workflow);
        return workflow;
    }
    async executeSolutionArchitectWorkflow(workflowId) {
        const workflow = await this.getWorkflowById(workflowId);
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowId}`);
        }
        this.logger.info('Executing solution architect workflow', { workflowId });
        try {
            for (const step of workflow.steps) {
                await this.executeWorkflowStep(workflowId, step);
                if (step.gateRequired) {
                    const gateResult = await this.executeWorkflowGate(workflowId, step);
                    if (!gateResult.approved) {
                        throw new Error(`Workflow gate failed: ${step.name}`);
                    }
                }
            }
            await this.completeWorkflow(workflowId);
            this.logger.info('Solution architect workflow completed', { workflowId });
            this.emit('solution-architect-workflow-completed', { workflowId });
        }
        catch (error) {
            this.logger.error('Solution architect workflow failed', {
                workflowId,
                error,
            });
            await this.failWorkflow(workflowId, error.message);
            throw error;
        }
    }
    async createArchitectureReviewGate(subjectId, subjectType, reviewType) {
        this.logger.info('Creating architecture review gate', {
            subjectId,
            subjectType,
            reviewType,
        });
        const review = {
            id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: reviewType,
            subjectId,
            reviewDate: new Date(),
            reviewers: await this.assignReviewers(subjectType, reviewType),
            criteria: await this.getReviewCriteria(reviewType),
            findings: [],
            recommendations: [],
            decisions: [],
            followUp: [],
            status: 'scheduled',
            outcome: 'approved',
        };
        this.state.architectureReviews.set(review.id, review);
        await this.createReviewProcessGate(review);
        this.logger.info('Architecture review gate created', {
            reviewId: review.id,
            reviewerCount: review.reviewers.length,
        });
        this.emit('architecture-review-created', review);
        return review;
    }
    async executeArchitectureReview(reviewId) {
        const review = this.state.architectureReviews.get(reviewId);
        if (!review) {
            throw new Error(`Architecture review not found: ${reviewId}`);
        }
        this.logger.info('Executing architecture review', { reviewId });
        try {
            const updatedReview = { ...review, status: 'in_progress' };
            this.state.architectureReviews.set(reviewId, updatedReview);
            const findings = [];
            const recommendations = [];
            const decisions = [];
            for (const criterion of review.criteria) {
                const criterionResult = await this.evaluateReviewCriterion(review.subjectId, criterion, review.reviewers);
                if (criterionResult.findings.length > 0) {
                    findings.push(...criterionResult.findings);
                }
                if (criterionResult.recommendations.length > 0) {
                    recommendations.push(...criterionResult.recommendations);
                }
                decisions.push(criterionResult.decision);
            }
            const outcome = this.determineReviewOutcome(decisions, findings);
            const followUp = await this.generateFollowUpActions(findings, recommendations);
            const completedReview = {
                ...updatedReview,
                findings,
                recommendations,
                decisions,
                followUp,
                status: 'completed',
                outcome,
            };
            this.state.architectureReviews.set(reviewId, completedReview);
            if (outcome === 'conditional' || outcome === 'rejected') {
                await this.createArchitectureApprovalGate(completedReview);
            }
            this.logger.info('Architecture review completed', {
                reviewId,
                outcome,
                findingCount: findings.length,
            });
            this.emit('architecture-review-completed', completedReview);
            return completedReview;
        }
        catch (error) {
            this.logger.error('Architecture review failed', { reviewId, error });
            const failedReview = {
                ...review,
                status: 'cancelled',
                outcome: 'rejected',
            };
            this.state.architectureReviews.set(reviewId, failedReview);
            throw error;
        }
    }
    async monitorArchitectureCompliance() {
        this.logger.info('Starting architecture compliance monitoring');
        await this.monitorSystemCompliance();
        await this.monitorSolutionCompliance();
        await this.generateComplianceReports();
        await this.processComplianceViolations();
        this.logger.info('Architecture compliance monitoring completed');
        this.emit('compliance-monitoring-completed');
    }
    async assessSystemCompliance(systemId) {
        const systemDesign = this.state.systemDesigns.get(systemId);
        if (!systemDesign) {
            throw new Error(`System design not found: ${systemId}`);
        }
        this.logger.info('Assessing system compliance', { systemId });
        const standards = await this.getApplicableStandards(systemDesign);
        const assessments = [];
        const violations = [];
        const risks = [];
        for (const standard of standards) {
            const assessment = await this.assessStandardCompliance(systemDesign, standard);
            assessments.push(assessment);
            if (assessment.status === 'non_compliant' ||
                assessment.status === 'partially_compliant') {
                const violation = await this.createComplianceViolation(systemDesign, standard, assessment);
                violations.push(violation);
                const risk = await this.assessComplianceRisk(violation);
                risks.push(risk);
            }
        }
        const overallScore = this.calculateComplianceScore(assessments);
        const remediation = await this.generateRemediationPlans(violations);
        const complianceReport = {
            id: `compliance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            subjectId: systemId,
            subjectType: 'system',
            standards: standards.map((s) => s.name),
            assessmentDate: new Date(),
            overallScore,
            compliance: assessments,
            violations,
            risks,
            remediation,
            nextAssessment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
        this.state.complianceReports.set(complianceReport.id, complianceReport);
        const criticalViolations = violations.filter((v) => v.severity === 'critical');
        if (criticalViolations.length > 0) {
            await this.createComplianceAlert(complianceReport, criticalViolations);
        }
        this.logger.info('System compliance assessment completed', {
            systemId,
            overallScore,
            violationCount: violations.length,
        });
        this.emit('system-compliance-assessed', complianceReport);
        return complianceReport;
    }
    initializeState() {
        return {
            solutionDesigns: new Map(),
            systemDesigns: new Map(),
            architectureReviews: new Map(),
            complianceReports: new Map(),
            designApprovals: new Map(),
            capabilityMaps: new Map(),
            lastComplianceCheck: new Date(),
            lastArchitectureReview: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('system-solution-arch:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    solutionDesigns: new Map(persistedState.solutionDesigns || []),
                    systemDesigns: new Map(persistedState.systemDesigns || []),
                    architectureReviews: new Map(persistedState.architectureReviews || []),
                    complianceReports: new Map(persistedState.complianceReports || []),
                    designApprovals: new Map(persistedState.designApprovals || []),
                    capabilityMaps: new Map(persistedState.capabilityMaps || []),
                };
                this.logger.info('System and Solution Architecture Manager state loaded');
            }
        }
        catch (error) {
            this.logger.warn('Failed to load persisted state', { error });
        }
    }
    async persistState() {
        try {
            const stateToSerialize = {
                ...this.state,
                solutionDesigns: Array.from(this.state.solutionDesigns.entries()),
                systemDesigns: Array.from(this.state.systemDesigns.entries()),
                architectureReviews: Array.from(this.state.architectureReviews.entries()),
                complianceReports: Array.from(this.state.complianceReports.entries()),
                designApprovals: Array.from(this.state.designApprovals.entries()),
                capabilityMaps: Array.from(this.state.capabilityMaps.entries()),
            };
            await this.memory.store('system-solution-arch:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    startComplianceMonitoring() {
        this.complianceTimer = setInterval(async () => {
            try {
                await this.monitorArchitectureCompliance();
            }
            catch (error) {
                this.logger.error('Compliance monitoring failed', { error });
            }
        }, this.config.complianceCheckInterval);
    }
    startArchitectureReviews() {
        this.reviewTimer = setInterval(async () => {
            try {
                await this.performScheduledReviews();
            }
            catch (error) {
                this.logger.error('Architecture review failed', { error });
            }
        }, this.config.systemDesignReviewInterval);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('system-design-updated', async (event) => {
            await this.handleSystemDesignUpdate(event.payload.systemId);
        });
        this.eventBus.registerHandler('compliance-threshold-exceeded', async (event) => {
            await this.handleComplianceThresholdExceeded(event.payload);
        });
    }
    createDefaultBusinessContext() {
        return {
            domain: 'general',
            subdomain: 'general',
            businessCapabilities: [],
            valuePropositions: [],
            stakeholders: [],
            businessRules: [],
            performanceExpectations: [],
            complianceRequirements: [],
        };
    }
    createDefaultDeploymentArchitecture() {
        return {};
    }
    createDefaultSecurityArchitecture() {
        return {};
    }
    createDefaultDataArchitecture() {
        return {};
    }
    createDefaultIntegrationArchitecture() {
        return {};
    }
    createDefaultGovernanceFramework() {
        return {};
    }
    async createSystemDesignReviewGate(design) { }
    async analyzeSystemInteractions(systems) {
        return [];
    }
    async identifyDesignConflicts(systems) {
        return [];
    }
    async generateCoordinationRecommendations(systems, interactions, conflicts) {
        return [];
    }
    async assessArchitecturalConsistency(systems) {
        return { score: 100, status: 'consistent' };
    }
    async createCoordinationApprovalGate(coordination, conflicts) { }
    async generateWorkflowSteps(type) {
        return [];
    }
    async identifyWorkflowParticipants(solutionId, type) {
        return [];
    }
    async defineWorkflowDeliverables(type) {
        return [];
    }
    async estimateWorkflowTimeline(type) {
        return '2 weeks';
    }
    async identifyWorkflowDependencies(solutionId, type) {
        return [];
    }
    async defineWorkflowGates(type) {
        return [];
    }
    async executeWorkflowStep(workflowId, step) { }
    async getWorkflowById(workflowId) {
        return null;
    }
    async executeWorkflowGate(workflowId, step) {
        return { approved: true };
    }
    async completeWorkflow(workflowId) { }
    async failWorkflow(workflowId, reason) { }
    async assignReviewers(subjectType, reviewType) {
        return [];
    }
    async getReviewCriteria(reviewType) {
        return [];
    }
    async createReviewProcessGate(review) { }
    async evaluateReviewCriterion(subjectId, criterion, reviewers) {
        return {
            findings: [],
            recommendations: [],
            decision: {
                criterion: '',
                decision: 'accept',
                rationale: '',
                conditions: [],
                reviewer: '',
            },
        };
    }
    determineReviewOutcome(decisions, findings) {
        return 'approved';
    }
    async generateFollowUpActions(findings, recommendations) {
        return [];
    }
    async createArchitectureApprovalGate(review) { }
    async monitorSystemCompliance() { }
    async monitorSolutionCompliance() { }
    async generateComplianceReports() { }
    async processComplianceViolations() { }
    async getApplicableStandards(design) {
        return [];
    }
    async assessStandardCompliance(design, standard) {
        return {};
    }
    async createComplianceViolation(design, standard, assessment) {
        return {};
    }
    async assessComplianceRisk(violation) {
        return {};
    }
    calculateComplianceScore(assessments) {
        return 100;
    }
    async generateRemediationPlans(violations) {
        return [];
    }
    async createComplianceAlert(report, violations) { }
    async performScheduledReviews() { }
    async handleSystemDesignUpdate(systemId) { }
    async handleComplianceThresholdExceeded(payload) { }
}
export default SystemSolutionArchitectureManager;
//# sourceMappingURL=system-solution-architecture-manager.js.map