/**
 * @file Portfolio Manager - Phase 3, Day 15 (Task 14.1-14.3)
 *
 * Implements SAFe Lean Portfolio Management with portfolio budget allocation,
 * strategic theme tracking, epic investment planning, value stream funding,
 * and Lean-Agile budgeting with cost center integration.
 *
 * ARCHITECTURE:
 * - Portfolio budget planning and allocation
 * - Strategic theme definition and tracking
 * - Epic investment analysis and prioritization
 * - Value stream funding allocation
 * - Lean-Agile budget governance
 * - Cost center integration and tracking
 */
import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
// ============================================================================
// PORTFOLIO MANAGER - Main Implementation
// ============================================================================
/**
 * Portfolio Manager - SAFe Lean Portfolio Management
 */
export class PortfolioManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    gatesManager;
    portfolioOrchestrator;
    valueStreamMapper;
    piManager;
    config;
    state;
    budgetTrackingTimer;
    investmentAnalysisTimer;
    portfolioReviewTimer;
    constructor(eventBus, memory, gatesManager, portfolioOrchestrator, valueStreamMapper, piManager, config = {}) {
        super();
        this.logger = getLogger('portfolio-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.gatesManager = gatesManager;
        this.portfolioOrchestrator = portfolioOrchestrator;
        this.valueStreamMapper = valueStreamMapper;
        this.piManager = piManager;
        this.config = {
            enableBudgetTracking: true,
            enableStrategicThemeTracking: true,
            enableEpicInvestmentAnalysis: true,
            enableValueStreamFunding: true,
            enableLeanAgileBudgeting: true,
            enableAGUIIntegration: true,
            budgetPlanningCycle: 'quarterly',
            investmentAnalysisInterval: 86400000, // 24 hours
            budgetTrackingInterval: 3600000, // 1 hour
            portfolioReviewInterval: 604800000, // 7 days
            maxEpicsInPortfolio: 100,
            maxValueStreamsPerPortfolio: 10,
            budgetThresholdAlertPercentage: 85,
            investmentApprovalThreshold: 1000000, // $1M
            ...config,
        };
        this.state = this.initializeState();
    }
    // ============================================================================
    // LIFECYCLE MANAGEMENT
    // ============================================================================
    /**
     * Initialize the Portfolio Manager
     */
    async initialize() {
        this.logger.info('Initializing Portfolio Manager', {
            config: this.config,
        });
        try {
            // Load persisted state
            await this.loadPersistedState();
            // Start background processes
            if (this.config.enableBudgetTracking) {
                this.startBudgetTracking();
            }
            if (this.config.enableEpicInvestmentAnalysis) {
                this.startInvestmentAnalysis();
            }
            this.startPortfolioReview();
            // Register event handlers
            this.registerEventHandlers();
            this.logger.info('Portfolio Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Portfolio Manager', { error });
            throw error;
        }
    }
    /**
     * Shutdown the Portfolio Manager
     */
    async shutdown() {
        this.logger.info('Shutting down Portfolio Manager');
        // Stop background processes
        if (this.budgetTrackingTimer)
            clearInterval(this.budgetTrackingTimer);
        if (this.investmentAnalysisTimer)
            clearInterval(this.investmentAnalysisTimer);
        if (this.portfolioReviewTimer)
            clearInterval(this.portfolioReviewTimer);
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Portfolio Manager shutdown complete');
    }
    // ============================================================================
    // PORTFOLIO BUDGET MANAGEMENT - Task 14.1
    // ============================================================================
    /**
     * Plan portfolio budget allocation
     */
    async planPortfolioBudget(portfolioId, budgetCycle, totalBudget, strategicThemes, valueStreams) {
        this.logger.info('Planning portfolio budget allocation', {
            portfolioId,
            totalBudget,
            themeCount: strategicThemes.length,
        });
        // Create budget planning workflow with AGUI integration
        const planningWorkflow = await this.createBudgetPlanningWorkflow(portfolioId, budgetCycle, totalBudget, strategicThemes);
        // Execute budget planning phases with gates
        const budgetAllocations = await this.executeBudgetPlanningPhases(planningWorkflow, valueStreams);
        // Create cost centers and funding sources
        const costCenters = await this.createCostCenters(portfolioId, budgetAllocations);
        const fundingSources = await this.createFundingSources(totalBudget, budgetAllocations);
        // Create budget reserves
        const reserves = await this.calculateBudgetReserves(totalBudget, budgetAllocations);
        // Setup budget tracking configuration
        const trackingConfig = await this.createBudgetTrackingConfig(portfolioId, budgetCycle);
        // Create approval workflow
        const approvalWorkflow = await this.createBudgetApprovalWorkflow(portfolioId, totalBudget, budgetAllocations);
        const portfolioBudgetConfig = {
            portfolioId,
            budgetCycle,
            totalBudget,
            allocations: budgetAllocations,
            reserves,
            costCenters,
            approvalWorkflow,
            trackingConfiguration: trackingConfig,
        };
        // Store in state
        this.state.portfolioBudgets.set(portfolioId, portfolioBudgetConfig);
        budgetAllocations.forEach((allocation) => this.state.budgetAllocations.set(allocation.allocationId, allocation));
        costCenters.forEach((center) => this.state.costCenters.set(center.costCenterId, center));
        fundingSources.forEach((source) => this.state.fundingSources.set(source.sourceId, source));
        this.logger.info('Portfolio budget planning completed', {
            portfolioId,
            totalAllocations: budgetAllocations.length,
            totalReserves: reserves.length,
        });
        this.emit('portfolio-budget-planned', portfolioBudgetConfig);
        return portfolioBudgetConfig;
    }
    /**
     * Allocate budget to value streams
     */
    async allocateValueStreamFunding(portfolioId, valueStreamId, fundingRequest) {
        this.logger.info('Allocating value stream funding', {
            portfolioId,
            valueStreamId,
            requestedAmount: fundingRequest.requestedAmount,
        });
        const portfolioBudget = this.state.portfolioBudgets.get(portfolioId);
        if (!portfolioBudget) {
            throw new Error(`Portfolio budget not found: ${portfolioId}`);
        }
        // Analyze funding request
        const fundingAnalysis = await this.analyzeValueStreamFundingRequest(fundingRequest, portfolioBudget);
        // Create AGUI gate for funding approval if above threshold
        if (fundingRequest.requestedAmount > this.config.investmentApprovalThreshold) {
            await this.createFundingApprovalGate(fundingRequest, fundingAnalysis);
        }
        // Create strategic alignment assessment
        const strategicAlignment = await this.assessStrategicAlignment(valueStreamId, fundingRequest, this.state.strategicThemes);
        // Create budget allocation
        const allocation = {
            allocationId: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: fundingRequest.name,
            type: fundingRequest.type,
            allocatedAmount: fundingRequest.requestedAmount,
            spentAmount: 0,
            commitmentLevel: fundingRequest.commitmentLevel,
            priority: fundingRequest.priority,
            strategicAlignment,
            valueStreamId,
            epicIds: fundingRequest.epicIds,
            costCenterId: fundingRequest.costCenterId,
            owner: fundingRequest.owner,
            startDate: fundingRequest.startDate,
            endDate: fundingRequest.endDate,
            fundingSource: await this.selectOptimalFundingSource(fundingRequest.requestedAmount, fundingRequest.type),
        };
        // Update portfolio budget
        this.updatePortfolioBudgetWithAllocation(portfolioId, allocation);
        // Store allocation
        this.state.budgetAllocations.set(allocation.allocationId, allocation);
        this.logger.info('Value stream funding allocated', {
            allocationId: allocation.allocationId,
            valueStreamId,
            amount: allocation.allocatedAmount,
        });
        this.emit('value-stream-funding-allocated', allocation);
        return allocation;
    }
    /**
     * Track budget utilization and spend
     */
    async trackBudgetUtilization(portfolioId) {
        const portfolioBudget = this.state.portfolioBudgets.get(portfolioId);
        if (!portfolioBudget) {
            throw new Error(`Portfolio budget not found: ${portfolioId}`);
        }
        this.logger.debug('Tracking budget utilization', { portfolioId });
        // Calculate overall utilization
        const totalAllocated = portfolioBudget.allocations.reduce((sum, alloc) => sum + alloc.allocatedAmount, 0);
        const totalSpent = portfolioBudget.allocations.reduce((sum, alloc) => sum + alloc.spentAmount, 0);
        // Calculate by category
        const utilizationByCategory = await this.calculateUtilizationByCategory(portfolioBudget.allocations);
        // Calculate burn rate and forecast
        const burnRateAnalysis = await this.analyzeBurnRate(portfolioBudget);
        // Identify budget risks and alerts
        const budgetRisks = await this.identifyBudgetRisks(portfolioBudget);
        const budgetAlerts = await this.generateBudgetAlerts(portfolioBudget, burnRateAnalysis);
        const utilization = {
            portfolioId,
            totalBudget: portfolioBudget.totalBudget,
            totalAllocated,
            totalSpent,
            totalAvailable: portfolioBudget.totalBudget - totalAllocated,
            utilizationPercentage: (totalAllocated / portfolioBudget.totalBudget) * 100,
            spendPercentage: (totalSpent / portfolioBudget.totalBudget) * 100,
            burnRate: burnRateAnalysis.averageBurnRate,
            projectedCompletion: burnRateAnalysis.projectedCompletion,
            utilizationByCategory,
            budgetRisks,
            budgetAlerts,
            forecastAccuracy: await this.calculateForecastAccuracy(portfolioId),
            lastUpdated: new Date(),
        };
        // Check for threshold alerts
        if (utilization.utilizationPercentage > this.config.budgetThresholdAlertPercentage) {
            await this.createBudgetThresholdAlert(utilization);
        }
        this.emit('budget-utilization-updated', utilization);
        return utilization;
    }
    // ============================================================================
    // STRATEGIC THEME MANAGEMENT - Task 14.2
    // ============================================================================
    /**
     * Define and track strategic themes
     */
    async defineStrategicTheme(portfolioId, themeDefinition) {
        this.logger.info('Defining strategic theme', {
            portfolioId,
            themeName: themeDefinition.name,
        });
        // Create strategic theme with comprehensive tracking
        const strategicTheme = {
            id: `theme-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: themeDefinition.name,
            description: themeDefinition.description,
            objectives: themeDefinition.objectives,
            kpis: await this.createThemeKPIs(themeDefinition),
            budgetAllocation: themeDefinition.budgetAllocation,
            timeHorizon: themeDefinition.timeHorizon,
            owner: themeDefinition.owner,
            stakeholders: themeDefinition.stakeholders,
            status: 'active',
            portfolioId,
            createdAt: new Date(),
            milestones: await this.createThemeMilestones(themeDefinition),
            riskProfile: await this.assessThemeRiskProfile(themeDefinition),
        };
        // Setup theme tracking
        const themeTracking = await this.setupThemeTracking(strategicTheme);
        // Store in state
        this.state.strategicThemes.set(strategicTheme.id, strategicTheme);
        this.state.themeTracking.set(strategicTheme.id, themeTracking);
        // Create AGUI gate for theme approval
        if (this.config.enableAGUIIntegration) {
            await this.createThemeApprovalGate(strategicTheme, themeDefinition);
        }
        this.logger.info('Strategic theme defined', {
            themeId: strategicTheme.id,
            portfolioId,
        });
        this.emit('strategic-theme-defined', strategicTheme);
        return strategicTheme;
    }
    /**
     * Track strategic theme progress and alignment
     */
    async trackStrategicThemeProgress(themeId) {
        const theme = this.state.strategicThemes.get(themeId);
        if (!theme) {
            throw new Error(`Strategic theme not found: ${themeId}`);
        }
        this.logger.debug('Tracking strategic theme progress', { themeId });
        const trackingPeriod = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            end: new Date(),
        };
        // Calculate progress metrics
        const progressMetrics = await this.calculateThemeProgressMetrics(theme);
        // Calculate budget utilization
        const budgetUtilization = await this.calculateThemeBudgetUtilization(theme);
        // Assess epic contributions
        const epicContributions = await this.assessEpicContributionsToTheme(theme);
        // Track KPI performance
        const kpiPerformance = await this.trackThemeKPIPerformance(theme);
        // Update milestone tracking
        const milestoneTracking = await this.updateThemeMilestoneTracking(theme);
        // Identify risk indicators
        const riskIndicators = await this.identifyThemeRiskIndicators(theme, progressMetrics);
        const themeTracking = {
            themeId,
            trackingPeriod,
            progressMetrics,
            budgetUtilization,
            epicContributions,
            kpiPerformance,
            milestoneTracking,
            riskIndicators,
        };
        // Update state
        this.state.themeTracking.set(themeId, themeTracking);
        // Create alerts if needed
        await this.createThemeProgressAlerts(themeTracking);
        this.emit('strategic-theme-progress-updated', themeTracking);
        return themeTracking;
    }
    // ============================================================================
    // EPIC INVESTMENT ANALYSIS - Task 14.3
    // ============================================================================
    /**
     * Analyze epic investment and ROI
     */
    async analyzeEpicInvestment(epicId, epic) {
        this.logger.info('Analyzing epic investment', { epicId, epicName: epic.name });
        const analysisId = `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        // Create business case
        const businessCase = await this.createEpicBusinessCase(epic);
        // Calculate financial projections
        const financialProjection = await this.calculateEpicFinancialProjection(epic);
        // Calculate investment summary metrics
        const investmentSummary = await this.calculateInvestmentSummary(epic, financialProjection);
        // Assess investment risks
        const riskAssessment = await this.assessEpicInvestmentRisks(epic, financialProjection);
        // Generate comparison metrics
        const comparisonMetrics = await this.generateEpicComparisonMetrics(epic);
        // Perform sensitivity analysis
        const sensitivityAnalysis = await this.performSensitivityAnalysis(epic, financialProjection);
        // Generate investment recommendation
        const recommendedAction = await this.generateInvestmentRecommendation(investmentSummary, riskAssessment, comparisonMetrics);
        const analysis = {
            analysisId,
            epicId,
            analysisDate: new Date(),
            investmentSummary,
            businessCase,
            financialProjection,
            riskAssessment,
            recommendedAction,
            comparisonMetrics,
            sensitivityAnalysis,
        };
        // Store analysis
        this.state.epicInvestmentAnalyses.set(epicId, analysis);
        // Create AGUI gate for high-value investments
        if (investmentSummary.totalInvestment > this.config.investmentApprovalThreshold) {
            await this.createEpicInvestmentApprovalGate(analysis);
        }
        this.logger.info('Epic investment analysis completed', {
            epicId,
            totalInvestment: investmentSummary.totalInvestment,
            expectedROI: investmentSummary.roi,
            recommendation: recommendedAction.recommendation,
        });
        this.emit('epic-investment-analyzed', analysis);
        return analysis;
    }
    /**
     * Compare and prioritize epic investments
     */
    async prioritizeEpicInvestments(portfolioId) {
        this.logger.info('Prioritizing epic investments', { portfolioId });
        const portfolio = this.state.portfolios.get(portfolioId);
        if (!portfolio) {
            throw new Error(`Portfolio not found: ${portfolioId}`);
        }
        // Get all epic analyses for the portfolio
        const epicAnalyses = Array.from(this.state.epicInvestmentAnalyses.values()).filter((analysis) => {
            // Check if epic belongs to this portfolio (simplified logic)
            return true; // Would need proper portfolio-epic relationship
        });
        // Apply multi-criteria decision analysis
        const prioritizationCriteria = await this.definePrioritizationCriteria(portfolioId);
        const scoredEpics = await this.scoreEpicsAgainstCriteria(epicAnalyses, prioritizationCriteria);
        // Create portfolio optimization model
        const optimizationResult = await this.optimizeEpicPortfolio(scoredEpics, this.state.portfolioBudgets.get(portfolioId));
        // Generate final prioritization
        const prioritization = {
            portfolioId,
            analysisDate: new Date(),
            criteria: prioritizationCriteria,
            scoredEpics,
            optimizationResult,
            recommendedPortfolio: optimizationResult.recommendedEpics,
            budgetUtilization: optimizationResult.totalBudgetRequired,
            expectedReturn: optimizationResult.totalExpectedReturn,
            riskProfile: optimizationResult.portfolioRiskProfile,
            alternativeScenarios: await this.generateAlternativePortfolioScenarios(optimizationResult),
        };
        this.emit('epic-investments-prioritized', prioritization);
        return prioritization;
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
    initializeState() {
        return {
            portfolios: new Map(),
            portfolioBudgets: new Map(),
            strategicThemes: new Map(),
            epicInvestmentAnalyses: new Map(),
            themeTracking: new Map(),
            budgetAllocations: new Map(),
            costCenters: new Map(),
            fundingSources: new Map(),
            lastBudgetReview: new Date(),
            lastThemeReview: new Date(),
            lastInvestmentAnalysis: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('portfolio-manager:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    portfolios: new Map(persistedState.portfolios || []),
                    portfolioBudgets: new Map(persistedState.portfolioBudgets || []),
                    strategicThemes: new Map(persistedState.strategicThemes || []),
                    epicInvestmentAnalyses: new Map(persistedState.epicInvestmentAnalyses || []),
                    themeTracking: new Map(persistedState.themeTracking || []),
                    budgetAllocations: new Map(persistedState.budgetAllocations || []),
                    costCenters: new Map(persistedState.costCenters || []),
                    fundingSources: new Map(persistedState.fundingSources || []),
                };
                this.logger.info('Portfolio Manager state loaded');
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
                portfolios: Array.from(this.state.portfolios.entries()),
                portfolioBudgets: Array.from(this.state.portfolioBudgets.entries()),
                strategicThemes: Array.from(this.state.strategicThemes.entries()),
                epicInvestmentAnalyses: Array.from(this.state.epicInvestmentAnalyses.entries()),
                themeTracking: Array.from(this.state.themeTracking.entries()),
                budgetAllocations: Array.from(this.state.budgetAllocations.entries()),
                costCenters: Array.from(this.state.costCenters.entries()),
                fundingSources: Array.from(this.state.fundingSources.entries()),
            };
            await this.memory.store('portfolio-manager:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    startBudgetTracking() {
        this.budgetTrackingTimer = setInterval(async () => {
            try {
                await this.updateAllBudgetUtilization();
            }
            catch (error) {
                this.logger.error('Budget tracking update failed', { error });
            }
        }, this.config.budgetTrackingInterval);
    }
    startInvestmentAnalysis() {
        this.investmentAnalysisTimer = setInterval(async () => {
            try {
                await this.updateAllInvestmentAnalyses();
            }
            catch (error) {
                this.logger.error('Investment analysis update failed', { error });
            }
        }, this.config.investmentAnalysisInterval);
    }
    startPortfolioReview() {
        this.portfolioReviewTimer = setInterval(async () => {
            try {
                await this.performPortfolioHealthCheck();
            }
            catch (error) {
                this.logger.error('Portfolio review failed', { error });
            }
        }, this.config.portfolioReviewInterval);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('epic-completed', async (event) => {
            await this.handleEpicCompletion(event.payload.epicId);
        });
        this.eventBus.registerHandler('budget-threshold-exceeded', async (event) => {
            await this.handleBudgetThresholdExceeded(event.payload);
        });
        this.eventBus.registerHandler('strategic-theme-milestone-reached', async (event) => {
            await this.handleThemeMilestoneReached(event.payload);
        });
    }
    // Many placeholder implementations would follow...
    async createBudgetPlanningWorkflow(portfolioId, budgetCycle, totalBudget, strategicThemes) {
        // Placeholder implementation
        return {};
    }
    async executeBudgetPlanningPhases(workflow, valueStreams) {
        // Placeholder implementation
        return [];
    }
    // Additional placeholder methods would continue...
    async createCostCenters(portfolioId, allocations) {
        return [];
    }
    async createFundingSources(totalBudget, allocations) {
        return [];
    }
    async calculateBudgetReserves(totalBudget, allocations) {
        return [];
    }
    async createBudgetTrackingConfig(portfolioId, budgetCycle) {
        return {};
    }
    async createBudgetApprovalWorkflow(portfolioId, totalBudget, allocations) {
        return {};
    }
    async analyzeValueStreamFundingRequest(request, budget) {
        return {};
    }
    async createFundingApprovalGate(request, analysis) { }
    async assessStrategicAlignment(valueStreamId, request, themes) {
        return {};
    }
    async selectOptimalFundingSource(amount, type) {
        return {};
    }
    updatePortfolioBudgetWithAllocation(portfolioId, allocation) { }
    async calculateUtilizationByCategory(allocations) {
        return {};
    }
    async analyzeBurnRate(budget) {
        return { averageBurnRate: 0, projectedCompletion: new Date() };
    }
    async identifyBudgetRisks(budget) {
        return [];
    }
    async generateBudgetAlerts(budget, burnRate) {
        return [];
    }
    async calculateForecastAccuracy(portfolioId) {
        return 0;
    }
    async createBudgetThresholdAlert(utilization) { }
    async createThemeKPIs(definition) {
        return [];
    }
    async createThemeMilestones(definition) {
        return [];
    }
    async assessThemeRiskProfile(definition) {
        return {};
    }
    async setupThemeTracking(theme) {
        return {};
    }
    async createThemeApprovalGate(theme, definition) { }
    async calculateThemeProgressMetrics(theme) {
        return {};
    }
    async calculateThemeBudgetUtilization(theme) {
        return {};
    }
    async assessEpicContributionsToTheme(theme) {
        return [];
    }
    async trackThemeKPIPerformance(theme) {
        return [];
    }
    async updateThemeMilestoneTracking(theme) {
        return [];
    }
    async identifyThemeRiskIndicators(theme, progress) {
        return [];
    }
    async createThemeProgressAlerts(tracking) { }
    async createEpicBusinessCase(epic) {
        return {};
    }
    async calculateEpicFinancialProjection(epic) {
        return {};
    }
    async calculateInvestmentSummary(epic, projection) {
        return {};
    }
    async assessEpicInvestmentRisks(epic, projection) {
        return {};
    }
    async generateEpicComparisonMetrics(epic) {
        return {};
    }
    async performSensitivityAnalysis(epic, projection) {
        return {};
    }
    async generateInvestmentRecommendation(summary, risk, comparison) {
        return {};
    }
    async createEpicInvestmentApprovalGate(analysis) { }
    async definePrioritizationCriteria(portfolioId) {
        return {};
    }
    async scoreEpicsAgainstCriteria(analyses, criteria) {
        return [];
    }
    async optimizeEpicPortfolio(scoredEpics, budget) {
        return {
            recommendedEpics: [],
            totalBudgetRequired: 0,
            totalExpectedReturn: 0,
            portfolioRiskProfile: {},
        };
    }
    async generateAlternativePortfolioScenarios(optimization) {
        return [];
    }
    async updateAllBudgetUtilization() { }
    async updateAllInvestmentAnalyses() { }
    async performPortfolioHealthCheck() { }
    async handleEpicCompletion(epicId) { }
    async handleBudgetThresholdExceeded(payload) { }
    async handleThemeMilestoneReached(payload) { }
}
// ============================================================================
// EXPORTS
// ============================================================================
export default PortfolioManager;
