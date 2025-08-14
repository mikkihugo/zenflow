import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export var PrincipleCategory;
(function (PrincipleCategory) {
    PrincipleCategory["BUSINESS"] = "business";
    PrincipleCategory["DATA"] = "data";
    PrincipleCategory["APPLICATION"] = "application";
    PrincipleCategory["TECHNOLOGY"] = "technology";
    PrincipleCategory["SECURITY"] = "security";
    PrincipleCategory["INTEGRATION"] = "integration";
    PrincipleCategory["GOVERNANCE"] = "governance";
})(PrincipleCategory || (PrincipleCategory = {}));
export var PrinciplePriority;
(function (PrinciplePriority) {
    PrinciplePriority["CRITICAL"] = "critical";
    PrinciplePriority["HIGH"] = "high";
    PrinciplePriority["MEDIUM"] = "medium";
    PrinciplePriority["LOW"] = "low";
})(PrinciplePriority || (PrinciplePriority = {}));
export var PrincipleStatus;
(function (PrincipleStatus) {
    PrincipleStatus["DRAFT"] = "draft";
    PrincipleStatus["UNDER_REVIEW"] = "under_review";
    PrincipleStatus["APPROVED"] = "approved";
    PrincipleStatus["ACTIVE"] = "active";
    PrincipleStatus["DEPRECATED"] = "deprecated";
    PrincipleStatus["SUPERSEDED"] = "superseded";
})(PrincipleStatus || (PrincipleStatus = {}));
export var TechnologyCategory;
(function (TechnologyCategory) {
    TechnologyCategory["PROGRAMMING_LANGUAGES"] = "programming_languages";
    TechnologyCategory["FRAMEWORKS"] = "frameworks";
    TechnologyCategory["DATABASES"] = "databases";
    TechnologyCategory["MESSAGING"] = "messaging";
    TechnologyCategory["MONITORING"] = "monitoring";
    TechnologyCategory["SECURITY"] = "security";
    TechnologyCategory["INFRASTRUCTURE"] = "infrastructure";
    TechnologyCategory["TOOLS"] = "tools";
})(TechnologyCategory || (TechnologyCategory = {}));
export var StandardType;
(function (StandardType) {
    StandardType["MANDATORY"] = "mandatory";
    StandardType["PREFERRED"] = "preferred";
    StandardType["ACCEPTABLE"] = "acceptable";
    StandardType["RESTRICTED"] = "restricted";
    StandardType["PROHIBITED"] = "prohibited";
})(StandardType || (StandardType = {}));
export var ComplianceLevel;
(function (ComplianceLevel) {
    ComplianceLevel["FULL"] = "full";
    ComplianceLevel["PARTIAL"] = "partial";
    ComplianceLevel["PLANNED"] = "planned";
    ComplianceLevel["NON_COMPLIANT"] = "non_compliant";
    ComplianceLevel["EXEMPT"] = "exempt";
})(ComplianceLevel || (ComplianceLevel = {}));
export var AdoptionStatus;
(function (AdoptionStatus) {
    AdoptionStatus["EMERGING"] = "emerging";
    AdoptionStatus["PILOT"] = "pilot";
    AdoptionStatus["MAINSTREAM"] = "mainstream";
    AdoptionStatus["MATURE"] = "mature";
    AdoptionStatus["DECLINING"] = "declining";
    AdoptionStatus["SUNSET"] = "sunset";
})(AdoptionStatus || (AdoptionStatus = {}));
export var MaturityLevel;
(function (MaturityLevel) {
    MaturityLevel["INITIAL"] = "initial";
    MaturityLevel["MANAGED"] = "managed";
    MaturityLevel["DEFINED"] = "defined";
    MaturityLevel["QUANTITATIVELY_MANAGED"] = "quantitatively_managed";
    MaturityLevel["OPTIMIZING"] = "optimizing";
})(MaturityLevel || (MaturityLevel = {}));
export class EnterpriseArchitectureManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    gatesManager;
    runwayManager;
    systemSolutionManager;
    piManager;
    valueStreamMapper;
    config;
    state;
    principleTimer;
    complianceTimer;
    governanceTimer;
    healthTimer;
    constructor(eventBus, memory, gatesManager, runwayManager, systemSolutionManager, piManager, valueStreamMapper, config = {}) {
        super();
        this.logger = getLogger('enterprise-architecture-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.gatesManager = gatesManager;
        this.runwayManager = runwayManager;
        this.systemSolutionManager = systemSolutionManager;
        this.piManager = piManager;
        this.valueStreamMapper = valueStreamMapper;
        this.config = {
            enablePrincipleValidation: true,
            enableTechnologyStandardCompliance: true,
            enableArchitectureGovernance: true,
            enableHealthMetrics: true,
            enableAGUIIntegration: true,
            principlesReviewInterval: 2592000000,
            complianceCheckInterval: 86400000,
            governanceReviewInterval: 604800000,
            healthMetricsInterval: 604800000,
            maxArchitecturePrinciples: 50,
            maxTechnologyStandards: 100,
            complianceThreshold: 85,
            governanceApprovalTimeout: 172800000,
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing Enterprise Architecture Manager', {
            config: this.config,
        });
        try {
            await this.loadPersistedState();
            await this.initializeDefaultArchitecture();
            if (this.config.enablePrincipleValidation) {
                this.startPrincipleMonitoring();
            }
            if (this.config.enableTechnologyStandardCompliance) {
                this.startComplianceMonitoring();
            }
            if (this.config.enableArchitectureGovernance) {
                this.startGovernanceMonitoring();
            }
            if (this.config.enableHealthMetrics) {
                this.startHealthMonitoring();
            }
            this.registerEventHandlers();
            this.logger.info('Enterprise Architecture Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Enterprise Architecture Manager', { error });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down Enterprise Architecture Manager');
        if (this.principleTimer)
            clearInterval(this.principleTimer);
        if (this.complianceTimer)
            clearInterval(this.complianceTimer);
        if (this.governanceTimer)
            clearInterval(this.governanceTimer);
        if (this.healthTimer)
            clearInterval(this.healthTimer);
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Enterprise Architecture Manager shutdown complete');
    }
    async addArchitecturePrinciple(principleData) {
        this.logger.info('Adding architecture principle', {
            name: principleData.name,
        });
        const principle = {
            id: `principle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: principleData.name || 'Unnamed Principle',
            statement: principleData.statement || '',
            rationale: principleData.rationale || '',
            implications: principleData.implications || [],
            category: principleData.category || PrincipleCategory.BUSINESS,
            priority: principleData.priority || PrinciplePriority.MEDIUM,
            applicability: principleData.applicability || {
                scope: 'enterprise',
                domains: [],
                systems: [],
                exceptions: [],
                conditions: [],
            },
            measurability: principleData.measurability || [],
            exceptions: principleData.exceptions || [],
            relationships: principleData.relationships || [],
            governance: principleData.governance || {
                reviewFrequency: 'annual',
                reviewBoard: ['enterprise-architecture-board'],
                approvalAuthority: ['chief-architect'],
                escalationPath: ['cto'],
                complianceMonitoring: true,
                violationReporting: true,
            },
            status: PrincipleStatus.DRAFT,
            owner: principleData.owner || 'system',
            stakeholders: principleData.stakeholders || [],
            createdAt: new Date(),
            lastUpdated: new Date(),
            reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            version: principleData.version || '1.0.0',
        };
        this.state.architecturePrinciples.set(principle.id, principle);
        await this.createPrincipleApprovalGate(principle);
        this.logger.info('Architecture principle added', {
            principleId: principle.id,
            category: principle.category,
            priority: principle.priority,
        });
        this.emit('architecture-principle-added', principle);
        return principle;
    }
    async validateArchitecturePrinciples() {
        this.logger.info('Validating architecture principles');
        const allPrinciples = Array.from(this.state.architecturePrinciples.values());
        const activePrinciples = allPrinciples.filter((p) => p.status === PrincipleStatus.ACTIVE);
        const complianceResults = await this.checkPrincipleCompliance(activePrinciples);
        const violations = await this.identifyPrincipleViolations(activePrinciples, complianceResults);
        const effectiveness = await this.assessPrincipleEffectiveness(activePrinciples);
        const recommendations = await this.generatePrincipleRecommendations(activePrinciples, violations, effectiveness);
        const validationReport = {
            id: `validation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            validationDate: new Date(),
            principleCount: activePrinciples.length,
            overallCompliance: this.calculateOverallCompliance(complianceResults),
            complianceByCategory: this.groupComplianceByCategory(complianceResults),
            violations,
            effectiveness,
            recommendations,
            nextValidation: new Date(Date.now() + this.config.principlesReviewInterval),
        };
        violations.forEach((violation) => {
            this.state.principleViolations.set(violation.id, violation);
        });
        const criticalViolations = violations.filter((v) => v.severity === 'critical');
        if (criticalViolations.length > 0) {
            await this.createPrincipleViolationAlert(validationReport, criticalViolations);
        }
        this.logger.info('Architecture principle validation completed', {
            principleCount: activePrinciples.length,
            overallCompliance: validationReport.overallCompliance,
            violationCount: violations.length,
        });
        this.emit('principle-validation-completed', validationReport);
        return validationReport;
    }
    async addTechnologyStandard(standardData) {
        this.logger.info('Adding technology standard', {
            name: standardData.name,
            category: standardData.category,
        });
        const standard = {
            id: `standard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: standardData.name || 'Unnamed Standard',
            version: standardData.version || '1.0.0',
            category: standardData.category || TechnologyCategory.TOOLS,
            type: standardData.type || StandardType.ACCEPTABLE,
            description: standardData.description || '',
            scope: standardData.scope || {
                applicability: 'enterprise',
                domains: [],
                systems: [],
                environments: [],
                conditions: [],
            },
            requirements: standardData.requirements || [],
            compliance: ComplianceLevel.PLANNED,
            adoption: AdoptionStatus.EMERGING,
            lifecycle: standardData.lifecycle || {
                phase: 'emerging',
                introduced: new Date(),
                lastMajorUpdate: new Date(),
            },
            governance: standardData.governance || {
                owner: 'enterprise-architecture',
                reviewBoard: ['technology-review-board'],
                approvalAuthority: ['chief-architect'],
                changeProcess: 'standard-change-process',
                exceptionProcess: 'standard-exception-process',
                complianceMonitoring: true,
            },
            metrics: standardData.metrics || [],
            exceptions: standardData.exceptions || [],
            dependencies: standardData.dependencies || [],
            owner: standardData.owner || 'system',
            stakeholders: standardData.stakeholders || [],
            createdAt: new Date(),
            lastUpdated: new Date(),
            reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            endOfLife: standardData.endOfLife,
        };
        this.state.technologyStandards.set(standard.id, standard);
        await this.createStandardApprovalGate(standard);
        this.logger.info('Technology standard added', {
            standardId: standard.id,
            category: standard.category,
            type: standard.type,
        });
        this.emit('technology-standard-added', standard);
        return standard;
    }
    async monitorTechnologyStandardCompliance() {
        this.logger.info('Monitoring technology standard compliance');
        const allStandards = Array.from(this.state.technologyStandards.values());
        const activeStandards = allStandards.filter((s) => s.lifecycle.phase === 'active' || s.lifecycle.phase === 'mature');
        const complianceResults = await this.checkStandardCompliance(activeStandards);
        const violations = await this.identifyStandardViolations(activeStandards, complianceResults);
        const adoptionMetrics = await this.assessStandardAdoption(activeStandards);
        const complianceScore = this.calculateStandardComplianceScore(complianceResults);
        const recommendations = await this.generateStandardRecommendations(activeStandards, violations, adoptionMetrics);
        const complianceReport = {
            id: `compliance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            reportDate: new Date(),
            standardCount: activeStandards.length,
            overallCompliance: complianceScore,
            complianceByCategory: this.groupStandardComplianceByCategory(complianceResults),
            complianceByType: this.groupStandardComplianceByType(complianceResults),
            violations,
            adoptionMetrics,
            recommendations,
            trends: await this.calculateComplianceTrends(),
            nextReport: new Date(Date.now() + this.config.complianceCheckInterval),
        };
        violations.forEach((violation) => {
            this.state.standardViolations.set(violation.id, violation);
        });
        const criticalViolations = violations.filter((v) => v.severity === 'critical');
        if (criticalViolations.length > 0) {
            await this.createStandardViolationAlert(complianceReport, criticalViolations);
        }
        this.logger.info('Technology standard compliance monitoring completed', {
            standardCount: activeStandards.length,
            overallCompliance: complianceScore,
            violationCount: violations.length,
        });
        this.emit('standard-compliance-monitored', complianceReport);
        return complianceReport;
    }
    async createArchitectureGovernanceWorkflow(decisionType, requestData) {
        this.logger.info('Creating architecture governance workflow', {
            decisionType,
        });
        const decision = {
            id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: requestData.title || `${decisionType} decision`,
            description: requestData.description || '',
            type: decisionType,
            status: 'proposed',
            requester: requestData.requester || 'system',
            decision_maker: await this.getDecisionMaker(decisionType),
            stakeholders: requestData.stakeholders || [],
            rationale: requestData.rationale || '',
            implications: requestData.implications || [],
            alternatives: requestData.alternatives || [],
            risks: requestData.risks || [],
            mitigations: requestData.mitigations || [],
            implementation: {
                plan: requestData.implementation?.plan || [],
                timeline: requestData.implementation?.timeline || '30 days',
                resources: requestData.implementation?.resources || [],
                dependencies: requestData.implementation?.dependencies || [],
                milestones: requestData.implementation?.milestones || [],
                success_metrics: requestData.implementation?.success_metrics || [],
            },
        };
        this.state.governanceDecisions.set(decision.id, decision);
        await this.createGovernanceReviewGate(decision);
        this.logger.info('Architecture governance workflow created', {
            decisionId: decision.id,
            decisionType,
            decisionMaker: decision.decision_maker,
        });
        this.emit('governance-workflow-created', decision);
        return decision;
    }
    async executeArchitectureGovernanceWorkflow(decisionId) {
        const decision = this.state.governanceDecisions.get(decisionId);
        if (!decision) {
            throw new Error(`Governance decision not found: ${decisionId}`);
        }
        this.logger.info('Executing architecture governance workflow', {
            decisionId,
        });
        try {
            const reviewDecision = { ...decision, status: 'under_review' };
            this.state.governanceDecisions.set(decisionId, reviewDecision);
            const governanceResult = await this.executeGovernanceProcess(reviewDecision);
            const finalDecision = await this.makeGovernanceDecision(decisionId, governanceResult);
            finalDecision.decision_date = new Date();
            if (finalDecision.status === 'approved') {
                finalDecision.effective_date = new Date();
            }
            this.state.governanceDecisions.set(decisionId, finalDecision);
            if (finalDecision.status === 'approved') {
                await this.scheduleDecisionImplementation(finalDecision);
            }
            this.logger.info('Architecture governance workflow completed', {
                decisionId,
                finalStatus: finalDecision.status,
            });
            this.emit('governance-workflow-completed', finalDecision);
            return finalDecision;
        }
        catch (error) {
            this.logger.error('Architecture governance workflow failed', {
                decisionId,
                error,
            });
            const failedDecision = {
                ...decision,
                status: 'rejected',
                decision_date: new Date(),
            };
            this.state.governanceDecisions.set(decisionId, failedDecision);
            throw error;
        }
    }
    async calculateArchitectureHealthMetrics() {
        this.logger.info('Calculating architecture health metrics');
        const categories = [
            await this.assessPrincipleHealthCategory(),
            await this.assessStandardHealthCategory(),
            await this.assessGovernanceHealthCategory(),
            await this.assessComplianceHealthCategory(),
            await this.assessTechnicalDebtHealthCategory(),
            await this.assessInnovationHealthCategory(),
        ];
        const overallScore = this.calculateOverallHealthScore(categories);
        const trends = await this.calculateHealthTrends();
        const risks = await this.identifyArchitectureHealthRisks(categories, trends);
        const recommendations = await this.generateHealthRecommendations(categories, risks);
        const benchmarks = await this.getArchitectureHealthBenchmarks();
        const healthMetrics = {
            id: `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            assessmentDate: new Date(),
            overallScore,
            categories,
            trends,
            risks,
            recommendations,
            benchmarks,
            nextAssessment: new Date(Date.now() + this.config.healthMetricsInterval),
        };
        this.state.healthMetrics.set(healthMetrics.id, healthMetrics);
        const criticalRisks = risks.filter((r) => r.impact === 'critical');
        if (criticalRisks.length > 0 || overallScore < 60) {
            await this.createArchitectureHealthAlert(healthMetrics, criticalRisks);
        }
        this.logger.info('Architecture health metrics calculated', {
            overallScore,
            categoryCount: categories.length,
            riskCount: risks.length,
        });
        this.emit('architecture-health-calculated', healthMetrics);
        return healthMetrics;
    }
    initializeState() {
        return {
            architecturePrinciples: new Map(),
            technologyStandards: new Map(),
            governanceFrameworks: new Map(),
            healthMetrics: new Map(),
            principleViolations: new Map(),
            standardViolations: new Map(),
            governanceDecisions: new Map(),
            lastPrincipleReview: new Date(),
            lastComplianceCheck: new Date(),
            lastGovernanceReview: new Date(),
            lastHealthAssessment: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('enterprise-arch:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    architecturePrinciples: new Map(persistedState.architecturePrinciples || []),
                    technologyStandards: new Map(persistedState.technologyStandards || []),
                    governanceFrameworks: new Map(persistedState.governanceFrameworks || []),
                    healthMetrics: new Map(persistedState.healthMetrics || []),
                    principleViolations: new Map(persistedState.principleViolations || []),
                    standardViolations: new Map(persistedState.standardViolations || []),
                    governanceDecisions: new Map(persistedState.governanceDecisions || []),
                };
                this.logger.info('Enterprise Architecture Manager state loaded');
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
                architecturePrinciples: Array.from(this.state.architecturePrinciples.entries()),
                technologyStandards: Array.from(this.state.technologyStandards.entries()),
                governanceFrameworks: Array.from(this.state.governanceFrameworks.entries()),
                healthMetrics: Array.from(this.state.healthMetrics.entries()),
                principleViolations: Array.from(this.state.principleViolations.entries()),
                standardViolations: Array.from(this.state.standardViolations.entries()),
                governanceDecisions: Array.from(this.state.governanceDecisions.entries()),
            };
            await this.memory.store('enterprise-arch:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    async initializeDefaultArchitecture() {
        if (this.state.architecturePrinciples.size === 0) {
            await this.createDefaultArchitecturePrinciples();
        }
        if (this.state.technologyStandards.size === 0) {
            await this.createDefaultTechnologyStandards();
        }
        if (this.state.governanceFrameworks.size === 0) {
            await this.createDefaultGovernanceFramework();
        }
    }
    startPrincipleMonitoring() {
        this.principleTimer = setInterval(async () => {
            try {
                await this.validateArchitecturePrinciples();
            }
            catch (error) {
                this.logger.error('Principle monitoring failed', { error });
            }
        }, this.config.principlesReviewInterval);
    }
    startComplianceMonitoring() {
        this.complianceTimer = setInterval(async () => {
            try {
                await this.monitorTechnologyStandardCompliance();
            }
            catch (error) {
                this.logger.error('Compliance monitoring failed', { error });
            }
        }, this.config.complianceCheckInterval);
    }
    startGovernanceMonitoring() {
        this.governanceTimer = setInterval(async () => {
            try {
                await this.performGovernanceReview();
            }
            catch (error) {
                this.logger.error('Governance monitoring failed', { error });
            }
        }, this.config.governanceReviewInterval);
    }
    startHealthMonitoring() {
        this.healthTimer = setInterval(async () => {
            try {
                await this.calculateArchitectureHealthMetrics();
            }
            catch (error) {
                this.logger.error('Health monitoring failed', { error });
            }
        }, this.config.healthMetricsInterval);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('architecture-principle-violated', async (event) => {
            await this.handlePrincipleViolation(event.payload);
        });
        this.eventBus.registerHandler('technology-standard-violated', async (event) => {
            await this.handleStandardViolation(event.payload);
        });
        this.eventBus.registerHandler('governance-decision-required', async (event) => {
            await this.handleGovernanceDecisionRequest(event.payload);
        });
    }
    async createPrincipleApprovalGate(principle) { }
    async checkPrincipleCompliance(principles) {
        return [];
    }
    async identifyPrincipleViolations(principles, compliance) {
        return [];
    }
    async assessPrincipleEffectiveness(principles) {
        return {};
    }
    async generatePrincipleRecommendations(principles, violations, effectiveness) {
        return [];
    }
    calculateOverallCompliance(results) {
        return 100;
    }
    groupComplianceByCategory(results) {
        return {};
    }
    async createPrincipleViolationAlert(report, violations) { }
    async createStandardApprovalGate(standard) { }
    async checkStandardCompliance(standards) {
        return [];
    }
    async identifyStandardViolations(standards, compliance) {
        return [];
    }
    async assessStandardAdoption(standards) {
        return {};
    }
    calculateStandardComplianceScore(results) {
        return 100;
    }
    groupStandardComplianceByCategory(results) {
        return {};
    }
    groupStandardComplianceByType(results) {
        return {};
    }
    async generateStandardRecommendations(standards, violations, adoption) {
        return [];
    }
    async calculateComplianceTrends() {
        return [];
    }
    async createStandardViolationAlert(report, violations) { }
    async getDecisionMaker(decisionType) {
        return 'chief-architect';
    }
    async createGovernanceReviewGate(decision) { }
    async executeGovernanceProcess(decision) {
        return {};
    }
    async makeGovernanceDecision(decisionId, result) {
        const decision = this.state.governanceDecisions.get(decisionId);
        return { ...decision, status: 'approved' };
    }
    async scheduleDecisionImplementation(decision) { }
    async assessPrincipleHealthCategory() {
        return {
            name: 'principles',
            score: 85,
            weight: 0.2,
            metrics: [],
            status: 'healthy',
            trend: 'stable',
        };
    }
    async assessStandardHealthCategory() {
        return {
            name: 'standards',
            score: 80,
            weight: 0.2,
            metrics: [],
            status: 'healthy',
            trend: 'improving',
        };
    }
    async assessGovernanceHealthCategory() {
        return {
            name: 'governance',
            score: 75,
            weight: 0.15,
            metrics: [],
            status: 'healthy',
            trend: 'stable',
        };
    }
    async assessComplianceHealthCategory() {
        return {
            name: 'compliance',
            score: 90,
            weight: 0.2,
            metrics: [],
            status: 'healthy',
            trend: 'improving',
        };
    }
    async assessTechnicalDebtHealthCategory() {
        return {
            name: 'technical_debt',
            score: 70,
            weight: 0.15,
            metrics: [],
            status: 'at_risk',
            trend: 'declining',
        };
    }
    async assessInnovationHealthCategory() {
        return {
            name: 'innovation',
            score: 65,
            weight: 0.1,
            metrics: [],
            status: 'at_risk',
            trend: 'stable',
        };
    }
    calculateOverallHealthScore(categories) {
        return categories.reduce((total, cat) => total + cat.score * cat.weight, 0);
    }
    async calculateHealthTrends() {
        return [];
    }
    async identifyArchitectureHealthRisks(categories, trends) {
        return [];
    }
    async generateHealthRecommendations(categories, risks) {
        return [];
    }
    async getArchitectureHealthBenchmarks() {
        return [];
    }
    async createArchitectureHealthAlert(metrics, risks) { }
    async createDefaultArchitecturePrinciples() { }
    async createDefaultTechnologyStandards() { }
    async createDefaultGovernanceFramework() { }
    async performGovernanceReview() { }
    async handlePrincipleViolation(payload) { }
    async handleStandardViolation(payload) { }
    async handleGovernanceDecisionRequest(payload) { }
}
export default EnterpriseArchitectureManager;
//# sourceMappingURL=enterprise-architecture-manager.js.map