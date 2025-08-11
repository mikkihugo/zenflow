/**
 * @file Architecture Runway Manager - Phase 3, Day 14 (Task 13.1)
 *
 * Implements SAFe Architecture Runway management including architecture backlog and planning,
 * architectural epic and capability tracking, architecture decision workflow with AGUI,
 * and technical debt management. Integrates with the existing multi-level orchestration.
 *
 * ARCHITECTURE:
 * - Architecture runway and backlog management
 * - Architectural epic and capability tracking
 * - Architecture decision workflow with AGUI gates
 * - Technical debt management and tracking
 * - Integration with Program Increment and Value Stream management
 */
import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
/**
 * Architecture Runway item types
 */
export var RunwayItemType;
(function (RunwayItemType) {
    RunwayItemType["FOUNDATION"] = "foundation";
    RunwayItemType["INFRASTRUCTURE"] = "infrastructure";
    RunwayItemType["PLATFORM"] = "platform";
    RunwayItemType["SECURITY"] = "security";
    RunwayItemType["COMPLIANCE"] = "compliance";
    RunwayItemType["PERFORMANCE"] = "performance";
    RunwayItemType["INTEGRATION"] = "integration";
    RunwayItemType["TOOLING"] = "tooling";
})(RunwayItemType || (RunwayItemType = {}));
/**
 * Architecture decision status
 */
export var ArchitectureDecisionStatus;
(function (ArchitectureDecisionStatus) {
    ArchitectureDecisionStatus["PROPOSED"] = "proposed";
    ArchitectureDecisionStatus["UNDER_REVIEW"] = "under_review";
    ArchitectureDecisionStatus["APPROVED"] = "approved";
    ArchitectureDecisionStatus["REJECTED"] = "rejected";
    ArchitectureDecisionStatus["SUPERSEDED"] = "superseded";
    ArchitectureDecisionStatus["IMPLEMENTED"] = "implemented";
})(ArchitectureDecisionStatus || (ArchitectureDecisionStatus = {}));
/**
 * Technical debt severity
 */
export var TechnicalDebtSeverity;
(function (TechnicalDebtSeverity) {
    TechnicalDebtSeverity["LOW"] = "low";
    TechnicalDebtSeverity["MEDIUM"] = "medium";
    TechnicalDebtSeverity["HIGH"] = "high";
    TechnicalDebtSeverity["CRITICAL"] = "critical";
})(TechnicalDebtSeverity || (TechnicalDebtSeverity = {}));
/**
 * Runway item status
 */
export var RunwayItemStatus;
(function (RunwayItemStatus) {
    RunwayItemStatus["BACKLOG"] = "backlog";
    RunwayItemStatus["PLANNED"] = "planned";
    RunwayItemStatus["IN_PROGRESS"] = "in_progress";
    RunwayItemStatus["BLOCKED"] = "blocked";
    RunwayItemStatus["REVIEW"] = "review";
    RunwayItemStatus["APPROVED"] = "approved";
    RunwayItemStatus["IMPLEMENTED"] = "implemented";
    RunwayItemStatus["VERIFIED"] = "verified";
    RunwayItemStatus["CLOSED"] = "closed";
})(RunwayItemStatus || (RunwayItemStatus = {}));
/**
 * Data flow direction
 */
export var DataFlowDirection;
(function (DataFlowDirection) {
    DataFlowDirection["INBOUND"] = "inbound";
    DataFlowDirection["OUTBOUND"] = "outbound";
    DataFlowDirection["BIDIRECTIONAL"] = "bidirectional";
})(DataFlowDirection || (DataFlowDirection = {}));
/**
 * Technical debt types
 */
export var TechnicalDebtType;
(function (TechnicalDebtType) {
    TechnicalDebtType["CODE_QUALITY"] = "code_quality";
    TechnicalDebtType["ARCHITECTURE"] = "architecture";
    TechnicalDebtType["DESIGN"] = "design";
    TechnicalDebtType["DOCUMENTATION"] = "documentation";
    TechnicalDebtType["TESTING"] = "testing";
    TechnicalDebtType["SECURITY"] = "security";
    TechnicalDebtType["PERFORMANCE"] = "performance";
    TechnicalDebtType["INFRASTRUCTURE"] = "infrastructure";
})(TechnicalDebtType || (TechnicalDebtType = {}));
/**
 * Technical debt status
 */
export var TechnicalDebtStatus;
(function (TechnicalDebtStatus) {
    TechnicalDebtStatus["IDENTIFIED"] = "identified";
    TechnicalDebtStatus["ASSESSED"] = "assessed";
    TechnicalDebtStatus["PLANNED"] = "planned";
    TechnicalDebtStatus["IN_PROGRESS"] = "in_progress";
    TechnicalDebtStatus["RESOLVED"] = "resolved";
    TechnicalDebtStatus["ACCEPTED"] = "accepted";
    TechnicalDebtStatus["DEFERRED"] = "deferred";
})(TechnicalDebtStatus || (TechnicalDebtStatus = {}));
// ============================================================================
// ARCHITECTURE RUNWAY MANAGER - Main Implementation
// ============================================================================
/**
 * Architecture Runway Manager - SAFe Architecture Runway and technical debt management
 */
export class ArchitectureRunwayManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    gatesManager;
    piManager;
    valueStreamMapper;
    config;
    state;
    trackingTimer;
    reviewTimer;
    constructor(eventBus, memory, gatesManager, piManager, valueStreamMapper, config = {}) {
        super();
        this.logger = getLogger('architecture-runway-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.gatesManager = gatesManager;
        this.piManager = piManager;
        this.valueStreamMapper = valueStreamMapper;
        this.config = {
            enableAGUIIntegration: true,
            enableAutomatedTracking: true,
            enableTechnicalDebtManagement: true,
            enableArchitectureGovernance: true,
            enableRunwayPlanning: true,
            runwayPlanningHorizon: 3, // 3 PI cycles
            technicalDebtThreshold: 70, // 70% debt score threshold
            architectureReviewInterval: 604800000, // 1 week
            runwayTrackingInterval: 3600000, // 1 hour
            maxArchitecturalEpics: 20,
            maxRunwayItems: 100,
            governanceApprovalTimeout: 172800000, // 48 hours
            ...config,
        };
        this.state = this.initializeState();
    }
    // ============================================================================
    // LIFECYCLE MANAGEMENT
    // ============================================================================
    /**
     * Initialize the Architecture Runway Manager
     */
    async initialize() {
        this.logger.info('Initializing Architecture Runway Manager', {
            config: this.config,
        });
        try {
            // Load persisted state
            await this.loadPersistedState();
            // Initialize default architecture backlog
            await this.initializeDefaultBacklog();
            // Start tracking if enabled
            if (this.config.enableAutomatedTracking) {
                this.startRunwayTracking();
            }
            // Start governance reviews if enabled
            if (this.config.enableArchitectureGovernance) {
                this.startGovernanceReviews();
            }
            // Register event handlers
            this.registerEventHandlers();
            this.logger.info('Architecture Runway Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Architecture Runway Manager', { error });
            throw error;
        }
    }
    /**
     * Shutdown the Architecture Runway Manager
     */
    async shutdown() {
        this.logger.info('Shutting down Architecture Runway Manager');
        // Stop timers
        if (this.trackingTimer)
            clearInterval(this.trackingTimer);
        if (this.reviewTimer)
            clearInterval(this.reviewTimer);
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Architecture Runway Manager shutdown complete');
    }
    // ============================================================================
    // ARCHITECTURE BACKLOG AND PLANNING - Task 13.1
    // ============================================================================
    /**
     * Create architecture backlog and planning
     */
    async createArchitectureBacklog(name, description, owner) {
        this.logger.info('Creating architecture backlog', { name, owner });
        const backlog = {
            id: `backlog-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name,
            description,
            owner,
            runwayItems: [],
            technicalDebtItems: [],
            architecturalDecisions: [],
            prioritizationCriteria: [
                {
                    name: 'Business Value',
                    description: 'Impact on business objectives and customer value',
                    weight: 0.3,
                    evaluationMethod: 'stakeholder_assessment',
                },
                {
                    name: 'Technical Risk',
                    description: 'Risk to system stability and future development',
                    weight: 0.25,
                    evaluationMethod: 'technical_assessment',
                },
                {
                    name: 'Effort',
                    description: 'Development effort required',
                    weight: 0.2,
                    evaluationMethod: 'estimation',
                },
                {
                    name: 'Dependencies',
                    description: 'Impact on other work and system components',
                    weight: 0.15,
                    evaluationMethod: 'dependency_analysis',
                },
                {
                    name: 'Strategic Alignment',
                    description: 'Alignment with architectural vision and strategy',
                    weight: 0.1,
                    evaluationMethod: 'strategic_assessment',
                },
            ],
            lastPrioritized: new Date(),
            nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
        };
        // Store in state
        this.state.architectureBacklogs.set(backlog.id, backlog);
        this.logger.info('Architecture backlog created', { backlogId: backlog.id });
        this.emit('architecture-backlog-created', backlog);
        return backlog;
    }
    /**
     * Add architecture runway item
     */
    async addArchitectureRunwayItem(backlogId, runwayItemData) {
        const backlog = this.state.architectureBacklogs.get(backlogId);
        if (!backlog) {
            throw new Error(`Architecture backlog not found: ${backlogId}`);
        }
        this.logger.info('Adding architecture runway item', {
            backlogId,
            itemName: runwayItemData.name,
        });
        const runwayItem = {
            id: `runway-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: runwayItemData.name || 'Unnamed Runway Item',
            description: runwayItemData.description || '',
            type: runwayItemData.type || RunwayItemType.FOUNDATION,
            category: runwayItemData.category || 'general',
            priority: runwayItemData.priority || 5,
            businessValue: runwayItemData.businessValue || 5,
            effort: runwayItemData.effort || 0,
            complexity: runwayItemData.complexity || 'moderate',
            riskLevel: runwayItemData.riskLevel || 'medium',
            status: RunwayItemStatus.BACKLOG,
            assignedTeams: runwayItemData.assignedTeams || [],
            requiredSkills: runwayItemData.requiredSkills || [],
            dependencies: runwayItemData.dependencies || [],
            blockers: runwayItemData.blockers || [],
            targetPI: runwayItemData.targetPI || '',
            createdBy: runwayItemData.createdBy || 'system',
            createdAt: new Date(),
            lastUpdated: new Date(),
            architecture: runwayItemData.architecture || {
                domain: 'general',
                subdomain: 'general',
                systemBoundaries: [],
                impactedComponents: [],
                architecturalLayers: [],
                integrationPoints: [],
                qualityAttributes: [],
                complianceRequirements: [],
            },
            technicalSpecs: runwayItemData.technicalSpecs || {
                technologies: [],
                frameworks: [],
                patterns: [],
                standards: [],
                tools: [],
                environments: [],
                deployment: {
                    strategy: 'rolling',
                    automation: true,
                    rollbackStrategy: 'previous_version',
                    healthChecks: [],
                    monitoring: [],
                },
            },
            acceptanceCriteria: runwayItemData.acceptanceCriteria || [],
            risks: runwayItemData.risks || [],
            decisions: runwayItemData.decisions || [],
        };
        // Store in state
        this.state.runwayItems.set(runwayItem.id, runwayItem);
        // Add to backlog
        const updatedBacklog = {
            ...backlog,
            runwayItems: [...backlog.runwayItems, runwayItem],
        };
        this.state.architectureBacklogs.set(backlogId, updatedBacklog);
        // Create AGUI gate for significant runway items
        if (runwayItem.priority >= 8 || runwayItem.riskLevel === 'critical') {
            await this.createRunwayApprovalGate(runwayItem);
        }
        this.logger.info('Architecture runway item added', {
            itemId: runwayItem.id,
            priority: runwayItem.priority,
            complexity: runwayItem.complexity,
        });
        this.emit('runway-item-added', { backlogId, runwayItem });
        return runwayItem;
    }
    /**
     * Plan architecture runway for PI
     */
    async planArchitectureRunwayForPI(piId, artId, availableCapacity) {
        this.logger.info('Planning architecture runway for PI', { piId, artId });
        // Get all runway items eligible for this PI
        const eligibleItems = await this.getEligibleRunwayItems(piId, artId);
        // Prioritize items based on backlog criteria
        const prioritizedItems = await this.prioritizeRunwayItems(eligibleItems, availableCapacity);
        // Select items that fit within capacity
        const selectedItems = await this.selectRunwayItemsForCapacity(prioritizedItems, availableCapacity);
        // Get technical debt items that can be addressed
        const debtItems = await this.selectTechnicalDebtForPI(piId, availableCapacity);
        // Identify dependencies and risks
        const dependencies = await this.identifyRunwayDependencies(selectedItems);
        const risks = await this.assessRunwayPlanRisks(selectedItems, debtItems, availableCapacity);
        const runwayPlan = {
            piId,
            artId,
            plannedRunwayItems: selectedItems.map((item) => item.id),
            plannedDebtItems: debtItems.map((item) => item.id),
            capacityAllocation: availableCapacity,
            dependencies,
            risks,
            successCriteria: [
                'All planned runway items completed within PI',
                'No critical technical debt items remain',
                'Architecture decisions are documented and approved',
                'Quality attributes meet defined targets',
                'No architectural risks materialize',
            ],
            createdAt: new Date(),
        };
        // Store in state
        this.state.runwayPlanning.set(piId, runwayPlan);
        // Create AGUI gate for plan approval if high risk
        if (risks.length > 0 || selectedItems.some((item) => item.riskLevel === 'critical')) {
            await this.createRunwayPlanApprovalGate(runwayPlan, risks);
        }
        this.logger.info('Architecture runway planning completed', {
            piId,
            runwayItems: selectedItems.length,
            debtItems: debtItems.length,
            riskCount: risks.length,
        });
        this.emit('runway-plan-created', runwayPlan);
        return runwayPlan;
    }
    // ============================================================================
    // ARCHITECTURAL EPIC AND CAPABILITY TRACKING - Task 13.1
    // ============================================================================
    /**
     * Track architectural epic implementation
     */
    async trackArchitecturalEpicProgress(epicId) {
        this.logger.info('Tracking architectural epic progress', { epicId });
        // Get epic details from program orchestrator
        const epic = await this.getEpicDetails(epicId);
        if (!epic) {
            throw new Error(`Epic not found: ${epicId}`);
        }
        // Collect runway items associated with this epic
        const associatedRunwayItems = Array.from(this.state.runwayItems.values()).filter((item) => item.architecture.impactedComponents.some((comp) => epic.components?.includes(comp)));
        // Calculate progress metrics
        const progressMetrics = await this.calculateEpicProgress(epic, associatedRunwayItems);
        // Assess architectural compliance
        const complianceAssessment = await this.assessArchitecturalCompliance(epic, associatedRunwayItems);
        // Check quality attributes
        const qualityAssessment = await this.assessQualityAttributes(epic, associatedRunwayItems);
        const progressReport = {
            epicId,
            epicName: epic.name,
            overallProgress: progressMetrics.overallProgress,
            runwayItemsCompleted: progressMetrics.runwayItemsCompleted,
            runwayItemsTotal: progressMetrics.runwayItemsTotal,
            architecturalCompliance: complianceAssessment,
            qualityAttributeStatus: qualityAssessment,
            risks: progressMetrics.risks,
            blockers: progressMetrics.blockers,
            nextMilestones: progressMetrics.nextMilestones,
            lastUpdated: new Date(),
        };
        this.logger.info('Architectural epic progress tracked', {
            epicId,
            progress: progressMetrics.overallProgress,
            compliance: complianceAssessment.overallScore,
        });
        this.emit('epic-progress-tracked', progressReport);
        return progressReport;
    }
    /**
     * Track capability development
     */
    async trackCapabilityDevelopment(capabilityId) {
        this.logger.info('Tracking capability development', { capabilityId });
        // Get capability details
        const capability = await this.getCapabilityDetails(capabilityId);
        if (!capability) {
            throw new Error(`Capability not found: ${capabilityId}`);
        }
        // Get associated features and epics
        const associatedEpics = await this.getCapabilityEpics(capabilityId);
        const associatedFeatures = await this.getCapabilityFeatures(capabilityId);
        // Track architectural runway items for this capability
        const capabilityRunwayItems = Array.from(this.state.runwayItems.values()).filter((item) => item.architecture.domain === capability.domain);
        // Calculate capability progress
        const progressMetrics = await this.calculateCapabilityProgress(capability, associatedEpics, associatedFeatures, capabilityRunwayItems);
        const progressReport = {
            capabilityId,
            capabilityName: capability.name,
            domain: capability.domain,
            overallProgress: progressMetrics.overallProgress,
            epicProgress: progressMetrics.epicProgress,
            featureProgress: progressMetrics.featureProgress,
            runwayProgress: progressMetrics.runwayProgress,
            architecturalReadiness: progressMetrics.architecturalReadiness,
            risks: progressMetrics.risks,
            dependencies: progressMetrics.dependencies,
            lastUpdated: new Date(),
        };
        this.logger.info('Capability development progress tracked', {
            capabilityId,
            progress: progressMetrics.overallProgress,
            readiness: progressMetrics.architecturalReadiness,
        });
        this.emit('capability-progress-tracked', progressReport);
        return progressReport;
    }
    // ============================================================================
    // ARCHITECTURE DECISION WORKFLOW WITH AGUI - Task 13.1
    // ============================================================================
    /**
     * Create architecture decision with AGUI workflow
     */
    async createArchitecturalDecision(title, context, problem, alternatives, stakeholders) {
        this.logger.info('Creating architectural decision', { title });
        const decision = {
            id: `adr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            context,
            problem,
            decision: '', // To be filled after AGUI workflow
            alternatives,
            consequences: [],
            rationale: '',
            assumptions: [],
            constraints: [],
            stakeholders,
            status: ArchitectureDecisionStatus.PROPOSED,
            relatedDecisions: [],
        };
        // Store in state
        this.state.architecturalDecisions.set(decision.id, decision);
        // Create AGUI gate for decision review
        await this.createArchitectureDecisionGate(decision, alternatives);
        this.logger.info('Architectural decision created', {
            decisionId: decision.id,
            alternativeCount: alternatives.length,
        });
        this.emit('architectural-decision-created', decision);
        return decision;
    }
    /**
     * Execute architecture decision workflow through AGUI
     */
    async executeArchitectureDecisionWorkflow(decisionId) {
        const decision = this.state.architecturalDecisions.get(decisionId);
        if (!decision) {
            throw new Error(`Architectural decision not found: ${decisionId}`);
        }
        this.logger.info('Executing architecture decision workflow', { decisionId });
        try {
            // Update status to under review
            const updatedDecision = {
                ...decision,
                status: ArchitectureDecisionStatus.UNDER_REVIEW,
            };
            this.state.architecturalDecisions.set(decisionId, updatedDecision);
            // Create AGUI gate for stakeholder review
            const gateResult = await this.createDecisionReviewGate(updatedDecision);
            // Process gate result
            await this.processDecisionGateResult(decisionId, gateResult);
            this.logger.info('Architecture decision workflow executed', {
                decisionId,
                finalStatus: this.state.architecturalDecisions.get(decisionId)?.status,
            });
            this.emit('architecture-decision-workflow-completed', { decisionId, gateResult });
        }
        catch (error) {
            this.logger.error('Architecture decision workflow failed', { decisionId, error });
            // Update status to reflect failure
            const failedDecision = {
                ...decision,
                status: ArchitectureDecisionStatus.REJECTED,
            };
            this.state.architecturalDecisions.set(decisionId, failedDecision);
            throw error;
        }
    }
    // ============================================================================
    // TECHNICAL DEBT MANAGEMENT - Task 13.1
    // ============================================================================
    /**
     * Create technical debt management system
     */
    async createTechnicalDebtManagement() {
        this.logger.info('Creating technical debt management system');
        // Initialize technical debt categories
        const debtCategories = [
            'Code Quality',
            'Architecture',
            'Design',
            'Documentation',
            'Testing',
            'Security',
            'Performance',
            'Infrastructure',
        ];
        // Set up automated debt detection
        if (this.config.enableAutomatedTracking) {
            await this.setupAutomatedDebtDetection();
        }
        // Initialize debt threshold monitoring
        await this.setupDebtThresholdMonitoring();
        this.logger.info('Technical debt management system created');
        this.emit('technical-debt-management-created');
    }
    /**
     * Add technical debt item
     */
    async addTechnicalDebtItem(debtData) {
        this.logger.info('Adding technical debt item', {
            title: debtData.title,
            severity: debtData.severity,
        });
        const debtItem = {
            id: `debt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: debtData.title || 'Unnamed Technical Debt',
            description: debtData.description || '',
            type: debtData.type || TechnicalDebtType.CODE_QUALITY,
            severity: debtData.severity || TechnicalDebtSeverity.MEDIUM,
            category: debtData.category || 'general',
            component: debtData.component || 'unknown',
            estimatedEffort: debtData.estimatedEffort || 0,
            businessImpact: debtData.businessImpact || 'Unknown business impact',
            technicalImpact: debtData.technicalImpact || 'Unknown technical impact',
            currentCost: debtData.currentCost || 0,
            growthRate: debtData.growthRate || 5, // 5% per month default
            mitigationOptions: debtData.mitigationOptions || [],
            assignedTeam: debtData.assignedTeam,
            targetResolution: debtData.targetResolution,
            status: TechnicalDebtStatus.IDENTIFIED,
            priority: debtData.priority || 5,
            createdBy: debtData.createdBy || 'system',
            createdAt: new Date(),
            lastAssessed: new Date(),
        };
        // Store in state
        this.state.technicalDebtItems.set(debtItem.id, debtItem);
        // Create alert for critical debt
        if (debtItem.severity === TechnicalDebtSeverity.CRITICAL) {
            await this.createCriticalDebtAlert(debtItem);
        }
        // Check if debt threshold is exceeded
        await this.checkDebtThreshold();
        this.logger.info('Technical debt item added', {
            debtId: debtItem.id,
            severity: debtItem.severity,
            estimatedCost: debtItem.currentCost,
        });
        this.emit('technical-debt-added', debtItem);
        return debtItem;
    }
    /**
     * Assess technical debt portfolio
     */
    async assessTechnicalDebtPortfolio() {
        this.logger.info('Assessing technical debt portfolio');
        const allDebtItems = Array.from(this.state.technicalDebtItems.values());
        // Calculate debt metrics
        const totalDebt = allDebtItems.length;
        const debtByType = this.groupDebtByType(allDebtItems);
        const debtBySeverity = this.groupDebtBySeverity(allDebtItems);
        const totalCost = allDebtItems.reduce((sum, item) => sum + item.currentCost, 0);
        const averageAge = this.calculateAverageDebtAge(allDebtItems);
        // Calculate debt trends
        const trends = await this.calculateDebtTrends(allDebtItems);
        // Identify high-impact debt
        const highImpactDebt = allDebtItems
            .filter((item) => item.severity === TechnicalDebtSeverity.HIGH ||
            item.severity === TechnicalDebtSeverity.CRITICAL)
            .sort((a, b) => b.currentCost - a.currentCost);
        // Generate recommendations
        const recommendations = await this.generateDebtRecommendations(allDebtItems, trends);
        const assessment = {
            totalItems: totalDebt,
            debtByType,
            debtBySeverity,
            totalMonthlyCost: totalCost,
            averageAge,
            trends,
            highImpactItems: highImpactDebt.slice(0, 10), // Top 10
            recommendations,
            riskLevel: this.calculateDebtRiskLevel(totalCost, highImpactDebt.length),
            lastAssessed: new Date(),
        };
        this.logger.info('Technical debt portfolio assessed', {
            totalItems: totalDebt,
            totalCost,
            riskLevel: assessment.riskLevel,
        });
        this.emit('technical-debt-assessed', assessment);
        return assessment;
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    initializeState() {
        return {
            architectureBacklogs: new Map(),
            runwayItems: new Map(),
            technicalDebtItems: new Map(),
            architecturalDecisions: new Map(),
            runwayPlanning: new Map(),
            governanceReviews: new Map(),
            lastTracking: new Date(),
            lastGovernanceReview: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('architecture-runway:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    architectureBacklogs: new Map(persistedState.architectureBacklogs || []),
                    runwayItems: new Map(persistedState.runwayItems || []),
                    technicalDebtItems: new Map(persistedState.technicalDebtItems || []),
                    architecturalDecisions: new Map(persistedState.architecturalDecisions || []),
                    runwayPlanning: new Map(persistedState.runwayPlanning || []),
                    governanceReviews: new Map(persistedState.governanceReviews || []),
                };
                this.logger.info('Architecture Runway Manager state loaded');
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
                architectureBacklogs: Array.from(this.state.architectureBacklogs.entries()),
                runwayItems: Array.from(this.state.runwayItems.entries()),
                technicalDebtItems: Array.from(this.state.technicalDebtItems.entries()),
                architecturalDecisions: Array.from(this.state.architecturalDecisions.entries()),
                runwayPlanning: Array.from(this.state.runwayPlanning.entries()),
                governanceReviews: Array.from(this.state.governanceReviews.entries()),
            };
            await this.memory.store('architecture-runway:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    async initializeDefaultBacklog() {
        // Create default enterprise architecture backlog if none exists
        if (this.state.architectureBacklogs.size === 0) {
            await this.createArchitectureBacklog('Enterprise Architecture Backlog', 'Main backlog for enterprise architecture runway items and technical debt', 'system');
        }
    }
    startRunwayTracking() {
        this.trackingTimer = setInterval(async () => {
            try {
                await this.performRunwayTracking();
            }
            catch (error) {
                this.logger.error('Runway tracking failed', { error });
            }
        }, this.config.runwayTrackingInterval);
    }
    startGovernanceReviews() {
        this.reviewTimer = setInterval(async () => {
            try {
                await this.performGovernanceReview();
            }
            catch (error) {
                this.logger.error('Governance review failed', { error });
            }
        }, this.config.architectureReviewInterval);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('pi-planning-started', async (event) => {
            await this.handlePIPlanningStarted(event.payload.piId, event.payload.artId);
        });
        this.eventBus.registerHandler('feature-completed', async (event) => {
            await this.handleFeatureCompletion(event.payload.featureId);
        });
        this.eventBus.registerHandler('technical-debt-threshold-exceeded', async (event) => {
            await this.handleDebtThresholdExceeded(event.payload);
        });
    }
    // Many placeholder implementations would follow...
    async createRunwayApprovalGate(runwayItem) { }
    async getEligibleRunwayItems(piId, artId) {
        return [];
    }
    async prioritizeRunwayItems(items, capacity) {
        return items;
    }
    async selectRunwayItemsForCapacity(items, capacity) {
        return items;
    }
    async selectTechnicalDebtForPI(piId, capacity) {
        return [];
    }
    async identifyRunwayDependencies(items) {
        return [];
    }
    async assessRunwayPlanRisks(items, debtItems, capacity) {
        return [];
    }
    async createRunwayPlanApprovalGate(plan, risks) { }
    async getEpicDetails(epicId) {
        return null;
    }
    async calculateEpicProgress(epic, runwayItems) {
        return {};
    }
    async assessArchitecturalCompliance(epic, runwayItems) {
        return {};
    }
    async assessQualityAttributes(epic, runwayItems) {
        return {};
    }
    async getCapabilityDetails(capabilityId) {
        return null;
    }
    async getCapabilityEpics(capabilityId) {
        return [];
    }
    async getCapabilityFeatures(capabilityId) {
        return [];
    }
    async calculateCapabilityProgress(capability, epics, features, runwayItems) {
        return {};
    }
    async createArchitectureDecisionGate(decision, alternatives) { }
    async createDecisionReviewGate(decision) {
        return {};
    }
    async processDecisionGateResult(decisionId, gateResult) { }
    async setupAutomatedDebtDetection() { }
    async setupDebtThresholdMonitoring() { }
    async createCriticalDebtAlert(debtItem) { }
    async checkDebtThreshold() { }
    groupDebtByType(items) {
        return {};
    }
    groupDebtBySeverity(items) {
        return {};
    }
    calculateAverageDebtAge(items) {
        return 0;
    }
    async calculateDebtTrends(items) {
        return {};
    }
    async generateDebtRecommendations(items, trends) {
        return [];
    }
    calculateDebtRiskLevel(totalCost, highImpactCount) {
        return 'medium';
    }
    async performRunwayTracking() { }
    async performGovernanceReview() { }
    async handlePIPlanningStarted(piId, artId) { }
    async handleFeatureCompletion(featureId) { }
    async handleDebtThresholdExceeded(payload) { }
}
// ============================================================================
// EXPORTS
// ============================================================================
export default ArchitectureRunwayManager;
