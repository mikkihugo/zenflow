import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export class PortfolioOrchestrator extends EventEmitter {
    logger;
    eventBus;
    memory;
    gatesManager;
    config;
    state;
    strategicReviewTimer;
    healthCheckTimer;
    constructor(eventBus, memory, gatesManager, config = {}) {
        super();
        this.logger = getLogger('portfolio-orchestrator');
        this.eventBus = eventBus;
        this.memory = memory;
        this.gatesManager = gatesManager;
        this.config = {
            enableInvestmentTracking: true,
            enableOKRIntegration: true,
            enableStrategicReporting: true,
            enableAutoDecomposition: false,
            maxConcurrentPRDs: 5,
            investmentApprovalThreshold: 100000,
            strategicReviewInterval: 604800000,
            portfolioHealthCheckInterval: 86400000,
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing Portfolio Orchestrator', {
            config: this.config,
        });
        try {
            await this.loadPersistedState();
            if (this.state.strategicThemes.length === 0) {
                await this.initializeDefaultStrategicThemes();
            }
            this.startStrategicReviewProcess();
            this.startPortfolioHealthMonitoring();
            this.registerEventHandlers();
            this.logger.info('Portfolio Orchestrator initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize portfolio orchestrator', {
                error,
            });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down Portfolio Orchestrator');
        if (this.strategicReviewTimer) {
            clearInterval(this.strategicReviewTimer);
        }
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Portfolio Orchestrator shutdown complete');
    }
    async addToStrategicBacklog(title, businessCase, resourceRequirements, strategicThemeId) {
        const portfolioItem = {
            id: `portfolio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title,
            type: 'prd',
            status: 'proposed',
            priority: this.calculateStrategicPriority(businessCase, resourceRequirements),
            businessValue: businessCase.marketOpportunity,
            strategicAlignment: this.calculateStrategicAlignment(strategicThemeId, businessCase),
            riskScore: this.calculateRiskScore(businessCase.risks),
            resourceRequirements,
            timeline: this.estimatePortfolioTimeline(resourceRequirements),
            stakeholders: ['product-director', 'business-stakeholder', 'cto'],
            dependencies: [],
            businessCase,
            gates: [],
            metrics: this.initializePortfolioMetrics(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.state.portfolioItems.set(portfolioItem.id, portfolioItem);
        this.state.strategicBacklog.push(portfolioItem);
        if (resourceRequirements.budgetRequired >=
            this.config.investmentApprovalThreshold) {
            await this.createInvestmentDecisionGate(portfolioItem);
        }
        await this.prioritizeStrategicBacklog();
        this.logger.info('Portfolio item added to strategic backlog', {
            id: portfolioItem.id,
            title,
            priority: portfolioItem.priority,
        });
        this.emit('portfolio-item-added', portfolioItem);
        return portfolioItem;
    }
    async prioritizeStrategicBacklog() {
        const backlogConfig = await this.getStrategicBacklogConfig();
        this.state.strategicBacklog.sort((a, b) => {
            const scoreA = this.calculateStrategicScore(a, backlogConfig.prioritizationCriteria);
            const scoreB = this.calculateStrategicScore(b, backlogConfig.prioritizationCriteria);
            return scoreB - scoreA;
        });
        this.state.lastUpdated = new Date();
        await this.persistState();
        this.logger.debug('Strategic backlog prioritized', {
            backlogSize: this.state.strategicBacklog.length,
        });
        this.emit('backlog-prioritized', this.state.strategicBacklog);
    }
    async getStrategicBacklog(filters) {
        let backlog = [...this.state.strategicBacklog];
        if (filters) {
            if (filters.status) {
                backlog = backlog.filter((item) => filters.status.includes(item.status));
            }
            if (filters.priority) {
                backlog = backlog.filter((item) => filters.priority.includes(item.priority));
            }
            if (filters.strategicTheme) {
                backlog = backlog.filter((item) => this.getItemStrategicTheme(item.id) === filters.strategicTheme);
            }
        }
        return backlog;
    }
    async updateOKRProgress(objective, keyResultUpdates) {
        if (!this.config.enableOKRIntegration)
            return;
        const okr = this.state.okrIntegration.find((o) => o.objective === objective);
        if (!okr) {
            this.logger.warn('OKR not found', { objective });
            return;
        }
        for (const update of keyResultUpdates) {
            const keyResult = okr.keyResults.find((kr) => kr.description === update.description);
            if (keyResult) {
                keyResult.current = update.current;
                keyResult.confidence = update.confidence;
                keyResult.lastUpdated = new Date();
            }
        }
        const progress = okr.keyResults.reduce((sum, kr) => sum + kr.current / kr.target, 0) /
            okr.keyResults.length;
        okr.progress = Math.min(progress, 1.0);
        okr.lastUpdated = new Date();
        this.logger.info('OKR progress updated', {
            objective,
            progress: okr.progress,
        });
        this.emit('okr-updated', okr);
    }
    async decomposeVisionToPRDs(visionId, visionDescription, strategicContext) {
        this.logger.info('Starting vision to PRD decomposition', {
            visionId,
            themes: strategicContext.themes,
        });
        const decompositionGate = await this.createVisionDecompositionGate(visionId, visionDescription, strategicContext);
        const prdConcepts = await this.generatePRDConcepts(visionDescription, strategicContext);
        const portfolioItems = [];
        const maxConcurrent = this.config.maxConcurrentPRDs;
        for (let i = 0; i < Math.min(prdConcepts.length, maxConcurrent); i++) {
            const concept = prdConcepts[i];
            const portfolioItem = await this.addToStrategicBacklog(concept.title, concept.businessCase, concept.resourceRequirements, concept.strategicThemeId);
            portfolioItems.push(portfolioItem);
        }
        for (const item of portfolioItems) {
            await this.createPortfolioWorkflowStream(item);
        }
        this.logger.info('Vision decomposition completed', {
            visionId,
            prdCount: portfolioItems.length,
        });
        this.emit('vision-decomposed', { visionId, portfolioItems });
        return portfolioItems;
    }
    async createPortfolioWorkflowStream(portfolioItem) {
        const streamId = `portfolio-stream-${portfolioItem.id}`;
        const stream = {
            id: streamId,
            name: `Portfolio Stream: ${portfolioItem.title}`,
            level: OrchestrationLevel.PORTFOLIO,
            status: 'idle',
            workItems: [portfolioItem],
            inProgress: [],
            completed: [],
            wipLimit: 1,
            dependencies: [],
            metrics: {
                itemsProcessed: 0,
                averageProcessingTime: 0,
                successRate: 1.0,
                utilizationRate: 0,
                blockedTime: 0,
                lastUpdated: new Date(),
            },
            configuration: {
                parallelProcessing: false,
                batchSize: 1,
                timeout: 86400000,
                retryAttempts: 2,
                enableGates: true,
                gateConfiguration: {
                    enableBusinessGates: true,
                    enableTechnicalGates: false,
                    enableQualityGates: false,
                    approvalThresholds: {
                        low: 0.6,
                        medium: 0.7,
                        high: 0.8,
                        critical: 0.9,
                    },
                    escalationRules: [],
                },
                autoScaling: {
                    enabled: false,
                    minCapacity: 1,
                    maxCapacity: 1,
                    scaleUpThreshold: 0.8,
                    scaleDownThreshold: 0.3,
                    scalingCooldown: 300000,
                },
            },
        };
        this.state.activeStreams.set(streamId, stream);
        this.logger.info('Portfolio workflow stream created', {
            streamId,
            portfolioItemId: portfolioItem.id,
        });
        return streamId;
    }
    async allocatePortfolioResources() {
        const availableResources = await this.calculateAvailableResources();
        const prioritizedBacklog = await this.getStrategicBacklog({
            status: ['approved'],
        });
        let remainingBudget = availableResources.totalBudget;
        let remainingHours = availableResources.totalHours;
        for (const item of prioritizedBacklog) {
            const requirements = item.resourceRequirements;
            if (requirements.budgetRequired <= remainingBudget &&
                requirements.developmentHours <= remainingHours) {
                await this.allocateResourcesToItem(item.id, requirements);
                remainingBudget -= requirements.budgetRequired;
                remainingHours -= requirements.developmentHours;
                await this.updatePortfolioItemStatus(item.id, 'in_progress');
            }
            else {
                await this.updatePortfolioItemStatus(item.id, 'on_hold');
            }
        }
        this.logger.info('Portfolio resource allocation completed', {
            remainingBudget,
            remainingHours,
        });
    }
    async trackStrategicMilestones() {
        for (const [itemId, item] of this.state.portfolioItems) {
            for (const milestone of item.timeline.milestones) {
                if (!milestone.completed && new Date() >= milestone.date) {
                    const criteriaMetrics = await this.evaluateMilestoneCriteria(milestone);
                    if (criteriaMetrics.allMet) {
                        milestone.completed = true;
                        this.logger.info('Strategic milestone completed', {
                            itemId,
                            milestoneId: milestone.id,
                            name: milestone.name,
                        });
                        this.emit('milestone-completed', { itemId, milestone });
                    }
                    else {
                        await this.createMilestoneReviewGate(item, milestone, criteriaMetrics);
                    }
                }
            }
        }
    }
    async calculatePortfolioHealth() {
        const strategicAlignment = await this.calculateStrategicAlignmentScore();
        const resourceUtilization = await this.calculateResourceUtilizationScore();
        const deliveryHealth = await this.calculateDeliveryHealthScore();
        const riskScore = await this.calculateOverallRiskScore();
        const innovation = await this.calculateInnovationScore();
        const overallScore = strategicAlignment * 0.25 +
            resourceUtilization * 0.2 +
            deliveryHealth * 0.25 +
            (100 - riskScore) * 0.15 +
            innovation * 0.15;
        const recommendations = await this.generateHealthRecommendations({
            strategicAlignment,
            resourceUtilization,
            deliveryHealth,
            riskScore,
            innovation,
        });
        const health = {
            overallScore,
            strategicAlignment,
            resourceUtilization,
            deliveryHealth,
            riskScore,
            innovation,
            lastUpdated: new Date(),
            recommendations,
        };
        this.state.portfolioHealth = health;
        return health;
    }
    async trackStrategicDecision(gateId, decision, rationale, expectedOutcomes, decisionMaker) {
        const decisionRecord = {
            gateId,
            decision,
            rationale,
            expectedOutcomes,
            decisionMaker,
            timestamp: new Date(),
            portfolioImpact: await this.calculateDecisionImpact(gateId, decision),
        };
        await this.memory.store(`strategic-decision:${gateId}`, decisionRecord);
        this.logger.info('Strategic decision tracked', {
            gateId,
            decision,
            decisionMaker,
        });
        this.emit('strategic-decision-tracked', decisionRecord);
    }
    async generatePortfolioReport(timeRange) {
        const health = await this.calculatePortfolioHealth();
        const metrics = await this.calculatePortfolioMetrics(timeRange);
        const investmentSummary = this.state.investmentTracking;
        const okrProgress = this.state.okrIntegration;
        const report = {
            generatedAt: new Date(),
            timeRange,
            health,
            metrics,
            investmentSummary,
            okrProgress,
            keyInsights: await this.generateKeyInsights(health, metrics),
            recommendations: await this.generateStrategicRecommendations(health, metrics),
        };
        this.logger.info('Portfolio report generated', {
            overallHealth: health.overallScore,
            totalInvestment: investmentSummary.totalBudget,
        });
        return report;
    }
    initializeState() {
        return {
            portfolioItems: new Map(),
            strategicBacklog: [],
            activeStreams: new Map(),
            strategicThemes: [],
            okrIntegration: [],
            investmentTracking: {
                totalBudget: 0,
                allocatedBudget: 0,
                spentBudget: 0,
                forecastSpend: 0,
                roi: {
                    currentROI: 0,
                    projectedROI: 0,
                    paybackPeriod: 0,
                    netPresentValue: 0,
                    riskAdjustedROI: 0,
                },
                investments: [],
            },
            portfolioHealth: {
                overallScore: 0,
                strategicAlignment: 0,
                resourceUtilization: 0,
                deliveryHealth: 0,
                riskScore: 0,
                innovation: 0,
                lastUpdated: new Date(),
                recommendations: [],
            },
            flowMetrics: {
                throughput: 0,
                cycleTime: 0,
                leadTime: 0,
                wipUtilization: 0,
                bottlenecks: [],
                flowEfficiency: 0,
            },
            lastUpdated: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('portfolio-orchestrator:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    portfolioItems: new Map(persistedState.portfolioItems || []),
                    activeStreams: new Map(persistedState.activeStreams || []),
                };
                this.logger.info('Portfolio orchestrator state loaded');
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
                portfolioItems: Array.from(this.state.portfolioItems.entries()),
                activeStreams: Array.from(this.state.activeStreams.entries()),
            };
            await this.memory.store('portfolio-orchestrator:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    startStrategicReviewProcess() {
        this.strategicReviewTimer = setInterval(async () => {
            try {
                await this.conductStrategicReview();
            }
            catch (error) {
                this.logger.error('Strategic review failed', { error });
            }
        }, this.config.strategicReviewInterval);
    }
    startPortfolioHealthMonitoring() {
        this.healthCheckTimer = setInterval(async () => {
            try {
                await this.calculatePortfolioHealth();
            }
            catch (error) {
                this.logger.error('Portfolio health check failed', { error });
            }
        }, this.config.portfolioHealthCheckInterval);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('gate-resolved', async (event) => {
            if (event.payload.decision === 'approved') {
                await this.handleGateApproval(event.payload.gateId);
            }
        });
    }
    calculateStrategicPriority(businessCase, resources) {
        const value = businessCase.marketOpportunity;
        const cost = resources.budgetRequired;
        const ratio = value / cost;
        if (ratio > 5)
            return PortfolioPriority.STRATEGIC;
        if (ratio > 3)
            return PortfolioPriority.HIGH;
        if (ratio > 1)
            return PortfolioPriority.MEDIUM;
        return PortfolioPriority.LOW;
    }
    calculateStrategicAlignment(strategicThemeId, businessCase) {
        return strategicThemeId ? 0.8 : 0.5;
    }
    calculateRiskScore(risks) {
        return (risks.reduce((score, risk) => score + risk.probability * risk.impact, 0) *
            100);
    }
    estimatePortfolioTimeline(requirements) {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + requirements.developmentHours * 3600000);
        return {
            startDate,
            endDate,
            milestones: [],
            phases: [],
        };
    }
    initializePortfolioMetrics() {
        return {
            roi: 0,
            timeToMarket: 0,
            customerSatisfaction: 0,
            marketShare: 0,
            revenueImpact: 0,
            costSavings: 0,
        };
    }
    async getStrategicBacklogConfig() {
        return {
            maxBacklogSize: 50,
            prioritizationCriteria: [],
            autoRanking: true,
            strategicThemes: this.state.strategicThemes,
        };
    }
    calculateStrategicScore(item, criteria) {
        return (item.businessValue * item.strategicAlignment * (1 - item.riskScore / 100));
    }
    getItemStrategicTheme(itemId) {
        return undefined;
    }
    async initializeDefaultStrategicThemes() {
    }
    async createInvestmentDecisionGate(portfolioItem) {
    }
    async createVisionDecompositionGate(visionId, description, context) {
    }
    async generatePRDConcepts(vision, context) {
        return [];
    }
    async calculateAvailableResources() {
        return { totalBudget: 1000000, totalHours: 10000 };
    }
    async allocateResourcesToItem(itemId, requirements) {
    }
    async updatePortfolioItemStatus(itemId, status) {
        const item = this.state.portfolioItems.get(itemId);
        if (item) {
            item.status = status;
            item.updatedAt = new Date();
            this.state.lastUpdated = new Date();
        }
    }
    async evaluateMilestoneCriteria(milestone) {
        return { allMet: true, details: {} };
    }
    async createMilestoneReviewGate(item, milestone, metrics) {
    }
    async calculateStrategicAlignmentScore() {
        return 85;
    }
    async calculateResourceUtilizationScore() {
        return 72;
    }
    async calculateDeliveryHealthScore() {
        return 78;
    }
    async calculateOverallRiskScore() {
        return 25;
    }
    async calculateInnovationScore() {
        return 68;
    }
    async generateHealthRecommendations(scores) {
        return [];
    }
    async calculateDecisionImpact(gateId, decision) {
        return {};
    }
    async calculatePortfolioMetrics(timeRange) {
        return {};
    }
    async generateKeyInsights(health, metrics) {
        return [];
    }
    async generateStrategicRecommendations(health, metrics) {
        return [];
    }
    async conductStrategicReview() {
    }
    async handleGateApproval(gateId) {
    }
}
export default PortfolioOrchestrator;
//# sourceMappingURL=portfolio-orchestrator.js.map