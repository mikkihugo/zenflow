import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export var FlowItemStatus;
(function (FlowItemStatus) {
    FlowItemStatus["NEW"] = "new";
    FlowItemStatus["ACTIVE"] = "active";
    FlowItemStatus["BLOCKED"] = "blocked";
    FlowItemStatus["WAITING"] = "waiting";
    FlowItemStatus["COMPLETED"] = "completed";
    FlowItemStatus["CANCELLED"] = "cancelled";
    FlowItemStatus["EXPEDITED"] = "expedited";
})(FlowItemStatus || (FlowItemStatus = {}));
export var FlowStage;
(function (FlowStage) {
    FlowStage["BACKLOG"] = "backlog";
    FlowStage["ANALYSIS"] = "analysis";
    FlowStage["DEVELOPMENT"] = "development";
    FlowStage["TESTING"] = "testing";
    FlowStage["REVIEW"] = "review";
    FlowStage["DEPLOYMENT"] = "deployment";
    FlowStage["DONE"] = "done";
})(FlowStage || (FlowStage = {}));
export class AdvancedFlowManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    multilevelOrchestrator;
    portfolioOrchestrator;
    programOrchestrator;
    swarmOrchestrator;
    config;
    state;
    wipCalculationTimer;
    flowStateTimer;
    optimizationTimer;
    mlTrainingTimer;
    visualizationTimer;
    constructor(eventBus, memory, multilevelOrchestrator, portfolioOrchestrator, programOrchestrator, swarmOrchestrator, config = {}) {
        super();
        this.logger = getLogger('advanced-flow-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.multilevelOrchestrator = multilevelOrchestrator;
        this.portfolioOrchestrator = portfolioOrchestrator;
        this.programOrchestrator = programOrchestrator;
        this.swarmOrchestrator = swarmOrchestrator;
        this.config = {
            enableIntelligentWIP: true,
            enableMachineLearning: true,
            enableRealTimeMonitoring: true,
            enablePredictiveAnalytics: true,
            enableAdaptiveOptimization: true,
            enableFlowVisualization: true,
            wipCalculationInterval: 300000,
            flowStateUpdateInterval: 60000,
            optimizationAnalysisInterval: 900000,
            mlModelRetrainingInterval: 86400000,
            maxConcurrentFlows: 50,
            defaultWIPLimits: {
                backlog: 20,
                analysis: 5,
                development: 8,
                testing: 6,
                review: 4,
                deployment: 3,
                done: 100,
                blocked: 10,
                expedite: 2,
                total: 58,
            },
            performanceThresholds: this.createDefaultThresholds(),
            adaptationRate: 0.2,
            visualizationRefreshRate: 30000,
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing Advanced Flow Manager', {
            config: this.config,
        });
        try {
            await this.loadPersistedState();
            if (this.config.enableMachineLearning) {
                await this.initializeMachineLearningModels();
            }
            await this.initializeFlowTriggers();
            this.startWIPCalculation();
            this.startFlowStateMonitoring();
            this.startOptimizationAnalysis();
            if (this.config.enableMachineLearning) {
                this.startMLTraining();
            }
            if (this.config.enableFlowVisualization) {
                this.startVisualizationUpdates();
            }
            this.registerEventHandlers();
            await this.updateFlowState();
            this.logger.info('Advanced Flow Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Advanced Flow Manager', {
                error,
            });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down Advanced Flow Manager');
        if (this.wipCalculationTimer)
            clearInterval(this.wipCalculationTimer);
        if (this.flowStateTimer)
            clearInterval(this.flowStateTimer);
        if (this.optimizationTimer)
            clearInterval(this.optimizationTimer);
        if (this.mlTrainingTimer)
            clearInterval(this.mlTrainingTimer);
        if (this.visualizationTimer)
            clearInterval(this.visualizationTimer);
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Advanced Flow Manager shutdown complete');
    }
    async calculateIntelligentWIPLimits() {
        this.logger.info('Calculating intelligent WIP limits');
        const currentMetrics = await this.getCurrentFlowMetrics();
        const historicalData = await this.getHistoricalPerformanceData();
        let optimalLimits;
        if (this.config.enableMachineLearning) {
            optimalLimits = await this.calculateMLOptimizedWIPLimits(currentMetrics, historicalData);
        }
        else {
            optimalLimits = await this.calculateHeuristicWIPLimits(currentMetrics, historicalData);
        }
        const triggers = await this.generateOptimizationTriggers(currentMetrics, optimalLimits);
        const confidence = await this.calculateWIPConfidence(currentMetrics, historicalData);
        const intelligentLimits = {
            current: this.state.wipLimits?.current || this.config.defaultWIPLimits,
            optimal: optimalLimits,
            historical: this.getHistoricalWIPLimits(),
            adaptationRate: this.config.adaptationRate,
            optimizationTriggers: triggers,
            performanceThresholds: Array.from(this.state.performanceThresholds.values()),
            confidence,
            lastCalculation: new Date(),
            nextCalculation: new Date(Date.now() + this.config.wipCalculationInterval),
        };
        this.state.wipLimits = intelligentLimits;
        if (confidence > 0.7) {
            await this.applyWIPAdjustments(intelligentLimits);
        }
        this.logger.info('Intelligent WIP limits calculated', {
            confidence,
            currentTotal: intelligentLimits.current.total,
            optimalTotal: intelligentLimits.optimal.total,
        });
        this.emit('wip-limits-calculated', intelligentLimits);
        return intelligentLimits;
    }
    async applyWIPAdjustments(wipLimits) {
        this.logger.info('Applying WIP adjustments');
        const currentLimits = wipLimits.current;
        const optimalLimits = wipLimits.optimal;
        const adaptationRate = wipLimits.adaptationRate;
        const adjustedLimits = {
            backlog: this.calculateGradualAdjustment(currentLimits.backlog, optimalLimits.backlog, adaptationRate),
            analysis: this.calculateGradualAdjustment(currentLimits.analysis, optimalLimits.analysis, adaptationRate),
            development: this.calculateGradualAdjustment(currentLimits.development, optimalLimits.development, adaptationRate),
            testing: this.calculateGradualAdjustment(currentLimits.testing, optimalLimits.testing, adaptationRate),
            review: this.calculateGradualAdjustment(currentLimits.review, optimalLimits.review, adaptationRate),
            deployment: this.calculateGradualAdjustment(currentLimits.deployment, optimalLimits.deployment, adaptationRate),
            done: currentLimits.done,
            blocked: this.calculateGradualAdjustment(currentLimits.blocked, optimalLimits.blocked, adaptationRate),
            expedite: this.calculateGradualAdjustment(currentLimits.expedite, optimalLimits.expedite, adaptationRate),
            total: 0,
        };
        adjustedLimits.total = Object.entries(adjustedLimits)
            .filter(([key]) => key !== 'done' && key !== 'total')
            .reduce((sum, [_, value]) => sum + value, 0);
        await this.updateOrchestratorsWIPLimits(adjustedLimits);
        const optimizationAction = {
            actionId: `wip-adj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date(),
            type: 'wip-adjustment',
            description: `Gradual WIP adjustment based on ML optimization`,
            parameters: {
                previous: currentLimits,
                new: adjustedLimits,
                adaptationRate,
            },
            trigger: 'intelligent-calculation',
            expectedImpact: await this.calculateExpectedWIPImpact(currentLimits, adjustedLimits),
            success: true,
            rollbackRequired: false,
        };
        this.state.optimizationHistory.push(optimizationAction);
        this.logger.info('WIP adjustments applied', {
            adjustments: this.calculateWIPDifferences(currentLimits, adjustedLimits),
        });
        this.emit('wip-adjusted', {
            previous: currentLimits,
            current: adjustedLimits,
        });
    }
    async detectWIPViolations() {
        const currentWIP = await this.getCurrentWIPUsage();
        const limits = this.state.wipLimits.current;
        const violations = [];
        for (const [stage, limit] of Object.entries(limits)) {
            if (stage === 'done' || stage === 'total')
                continue;
            const current = currentWIP[stage];
            if (current > limit) {
                const violation = {
                    violationId: `viol-${Date.now()}-${stage}`,
                    stage: stage,
                    limit,
                    current,
                    severity: this.calculateViolationSeverity(current, limit),
                    duration: await this.getViolationDuration(stage),
                    impact: `${stage} stage is over WIP limit by ${current - limit} items`,
                    recommendedActions: await this.generateViolationRecommendations(stage, current, limit),
                    autoResolution: current - limit <= 2,
                };
                violations.push(violation);
            }
        }
        if (violations.length > 0) {
            await this.handleWIPViolations(violations);
        }
        return violations;
    }
    async updateFlowState() {
        const timestamp = new Date();
        const workItems = await this.collectCurrentWorkItems();
        const currentWIP = await this.getCurrentWIPUsage();
        const flowMetrics = await this.calculateRealTimeFlowMetrics();
        const bottlenecks = await this.detectCurrentBottlenecks();
        const healthIndicators = await this.calculateFlowHealthIndicators();
        const predictiveInsights = await this.generatePredictiveInsights();
        const recommendations = await this.generateFlowRecommendations();
        const flowState = {
            stateId: `state-${timestamp.getTime()}`,
            timestamp,
            workItems,
            wipLimits: this.state.wipLimits.current,
            currentWIP,
            flowMetrics,
            bottlenecks,
            healthIndicators,
            predictiveInsights,
            recommendations,
        };
        this.state.currentFlowState = flowState;
        this.state.flowHistory.push(flowState);
        const cutoffTime = new Date(timestamp.getTime() - 24 * 60 * 60 * 1000);
        this.state.flowHistory = this.state.flowHistory.filter((state) => state.timestamp > cutoffTime);
        this.logger.debug('Flow state updated', {
            workItems: workItems.length,
            bottlenecks: bottlenecks.length,
            recommendations: recommendations.length,
        });
        this.emit('flow-state-updated', flowState);
        return flowState;
    }
    async calculateFlowHealthIndicators() {
        const indicators = [];
        const metrics = await this.getCurrentFlowMetrics();
        indicators.push({
            indicatorId: 'flow-efficiency',
            name: 'Flow Efficiency',
            category: 'flow',
            value: metrics.flowEfficiency.overall,
            target: 0.8,
            threshold: 0.6,
            status: metrics.flowEfficiency.overall >= 0.8
                ? 'healthy'
                : metrics.flowEfficiency.overall >= 0.6
                    ? 'warning'
                    : 'critical',
            trend: metrics.flowEfficiency.trend,
            lastUpdated: new Date(),
            description: 'Percentage of time work items are actively being worked on',
            actionRequired: metrics.flowEfficiency.overall < 0.6,
        });
        indicators.push({
            indicatorId: 'throughput-predictability',
            name: 'Throughput Predictability',
            category: 'predictability',
            value: metrics.predictability.throughputPredictability,
            target: 0.85,
            threshold: 0.7,
            status: metrics.predictability.throughputPredictability >= 0.85
                ? 'healthy'
                : metrics.predictability.throughputPredictability >= 0.7
                    ? 'warning'
                    : 'critical',
            trend: this.calculatePredictabilityTrend(metrics),
            lastUpdated: new Date(),
            description: 'How consistently the system delivers work items',
            actionRequired: metrics.predictability.throughputPredictability < 0.7,
        });
        indicators.push({
            indicatorId: 'quality-health',
            name: 'Quality Health',
            category: 'quality',
            value: metrics.quality.firstPassYield,
            target: 0.9,
            threshold: 0.8,
            status: metrics.quality.firstPassYield >= 0.9
                ? 'healthy'
                : metrics.quality.firstPassYield >= 0.8
                    ? 'warning'
                    : 'critical',
            trend: metrics.quality.qualityTrend,
            lastUpdated: new Date(),
            description: 'Percentage of work items completed without rework',
            actionRequired: metrics.quality.firstPassYield < 0.8,
        });
        indicators.push({
            indicatorId: 'customer-value',
            name: 'Customer Value Delivery',
            category: 'value',
            value: metrics.customer.valueRealizationRate,
            target: 0.85,
            threshold: 0.7,
            status: metrics.customer.valueRealizationRate >= 0.85
                ? 'healthy'
                : metrics.customer.valueRealizationRate >= 0.7
                    ? 'warning'
                    : 'critical',
            trend: this.calculateValueTrend(metrics),
            lastUpdated: new Date(),
            description: 'How well delivered features realize expected customer value',
            actionRequired: metrics.customer.valueRealizationRate < 0.7,
        });
        return indicators;
    }
    async generatePredictiveInsights() {
        if (!this.config.enablePredictiveAnalytics) {
            return [];
        }
        const insights = [];
        const currentMetrics = await this.getCurrentFlowMetrics();
        const historicalData = this.state.flowHistory.slice(-168);
        const throughputForecast = await this.generateThroughputForecast(historicalData);
        insights.push({
            insightId: 'throughput-forecast-7d',
            type: 'forecast',
            category: 'throughput',
            description: `Predicted throughput for next 7 days: ${throughputForecast.predicted} items/day`,
            confidence: throughputForecast.confidence,
            timeframe: 7,
            impact: this.calculateForecastImpact(throughputForecast.predicted, currentMetrics.throughput.itemsPerDay),
            recommendation: this.generateThroughputRecommendation(throughputForecast),
            dataPoints: throughputForecast.dataPoints,
            modelUsed: 'time-series-regression',
            generatedAt: new Date(),
        });
        const bottleneckPrediction = await this.predictBottlenecks(historicalData);
        if (bottleneckPrediction.probability > 0.6) {
            insights.push({
                insightId: 'bottleneck-prediction',
                type: 'risk',
                category: 'capacity',
                description: `High probability of bottleneck in ${bottleneckPrediction.stage} stage`,
                confidence: bottleneckPrediction.probability,
                timeframe: bottleneckPrediction.timeframe,
                impact: 'high',
                recommendation: `Consider adding capacity to ${bottleneckPrediction.stage} or rebalancing work`,
                dataPoints: bottleneckPrediction.dataPoints,
                modelUsed: 'classification-model',
                generatedAt: new Date(),
            });
        }
        const qualityAnomaly = await this.detectQualityAnomalies(historicalData);
        if (qualityAnomaly.detected) {
            insights.push({
                insightId: 'quality-anomaly',
                type: 'anomaly',
                category: 'quality',
                description: `Anomaly detected in quality metrics: ${qualityAnomaly.description}`,
                confidence: qualityAnomaly.confidence,
                timeframe: 1,
                impact: 'medium',
                recommendation: 'Investigate recent process changes and review quality gates',
                dataPoints: qualityAnomaly.dataPoints,
                modelUsed: 'anomaly-detection',
                generatedAt: new Date(),
            });
        }
        return insights;
    }
    initializeState() {
        return {
            currentFlowState: {},
            flowHistory: [],
            wipLimits: {},
            flowTriggers: new Map(),
            performanceThresholds: new Map(),
            mlModels: new Map(),
            activeRecommendations: new Map(),
            historicalMetrics: [],
            optimizationHistory: [],
            lastOptimization: new Date(),
            lastMLTraining: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('advanced-flow-manager:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    flowTriggers: new Map(persistedState.flowTriggers || []),
                    performanceThresholds: new Map(persistedState.performanceThresholds || []),
                    mlModels: new Map(persistedState.mlModels || []),
                    activeRecommendations: new Map(persistedState.activeRecommendations || []),
                };
                this.logger.info('Advanced Flow Manager state loaded');
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
                flowTriggers: Array.from(this.state.flowTriggers.entries()),
                performanceThresholds: Array.from(this.state.performanceThresholds.entries()),
                mlModels: Array.from(this.state.mlModels.entries()),
                activeRecommendations: Array.from(this.state.activeRecommendations.entries()),
            };
            await this.memory.store('advanced-flow-manager:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    createDefaultThresholds() {
        return [
            {
                metric: 'cycle-time',
                target: 3.0,
                warning: 5.0,
                critical: 10.0,
                unit: 'days',
                direction: 'lower-better',
                timeWindow: 604800000,
            },
            {
                metric: 'throughput',
                target: 10.0,
                warning: 7.0,
                critical: 5.0,
                unit: 'items/day',
                direction: 'higher-better',
                timeWindow: 604800000,
            },
            {
                metric: 'flow-efficiency',
                target: 0.8,
                warning: 0.6,
                critical: 0.4,
                unit: 'percentage',
                direction: 'higher-better',
                timeWindow: 86400000,
            },
        ];
    }
    startWIPCalculation() {
        this.wipCalculationTimer = setInterval(async () => {
            try {
                await this.calculateIntelligentWIPLimits();
            }
            catch (error) {
                this.logger.error('WIP calculation failed', { error });
            }
        }, this.config.wipCalculationInterval);
    }
    startFlowStateMonitoring() {
        this.flowStateTimer = setInterval(async () => {
            try {
                await this.updateFlowState();
            }
            catch (error) {
                this.logger.error('Flow state monitoring failed', { error });
            }
        }, this.config.flowStateUpdateInterval);
    }
    startOptimizationAnalysis() {
        this.optimizationTimer = setInterval(async () => {
            try {
                await this.performOptimizationAnalysis();
            }
            catch (error) {
                this.logger.error('Optimization analysis failed', { error });
            }
        }, this.config.optimizationAnalysisInterval);
    }
    startMLTraining() {
        this.mlTrainingTimer = setInterval(async () => {
            try {
                await this.retrainMLModels();
            }
            catch (error) {
                this.logger.error('ML training failed', { error });
            }
        }, this.config.mlModelRetrainingInterval);
    }
    startVisualizationUpdates() {
        this.visualizationTimer = setInterval(async () => {
            try {
                await this.updateFlowVisualization();
            }
            catch (error) {
                this.logger.error('Visualization update failed', { error });
            }
        }, this.config.visualizationRefreshRate);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('work-item-started', async (event) => {
            await this.handleWorkItemStarted(event.payload);
        });
        this.eventBus.registerHandler('work-item-completed', async (event) => {
            await this.handleWorkItemCompleted(event.payload);
        });
        this.eventBus.registerHandler('bottleneck-detected', async (event) => {
            await this.handleBottleneckDetected(event.payload);
        });
    }
    async initializeMachineLearningModels() {
    }
    async initializeFlowTriggers() {
    }
    async getCurrentFlowMetrics() {
        return {};
    }
    async getHistoricalPerformanceData() {
        return {};
    }
    async calculateMLOptimizedWIPLimits(metrics, historical) {
        return this.config.defaultWIPLimits;
    }
    async calculateHeuristicWIPLimits(metrics, historical) {
        return this.config.defaultWIPLimits;
    }
    async generateOptimizationTriggers(metrics, limits) {
        return [];
    }
    async calculateWIPConfidence(metrics, historical) {
        return 0.8;
    }
    getHistoricalWIPLimits() {
        return [];
    }
    calculateGradualAdjustment(current, optimal, rate) {
        return Math.round(current + (optimal - current) * rate);
    }
    async updateOrchestratorsWIPLimits(limits) { }
    async calculateExpectedWIPImpact(current, new_) {
        return {};
    }
    calculateWIPDifferences(current, new_) {
        return {};
    }
    async getCurrentWIPUsage() {
        return {};
    }
    calculateViolationSeverity(current, limit) {
        const excess = (current - limit) / limit;
        if (excess > 0.5)
            return 'critical';
        if (excess > 0.2)
            return 'major';
        return 'minor';
    }
    async getViolationDuration(stage) {
        return 0;
    }
    async generateViolationRecommendations(stage, current, limit) {
        return [];
    }
    async handleWIPViolations(violations) { }
    async collectCurrentWorkItems() {
        return [];
    }
    async calculateRealTimeFlowMetrics() {
        return {};
    }
    async detectCurrentBottlenecks() {
        return [];
    }
    async generateFlowRecommendations() {
        return [];
    }
    calculatePredictabilityTrend(metrics) {
        return 'stable';
    }
    calculateValueTrend(metrics) {
        return 'stable';
    }
    async generateThroughputForecast(historical) {
        return { predicted: 10, confidence: 0.8, dataPoints: [] };
    }
    calculateForecastImpact(predicted, current) {
        const change = Math.abs(predicted - current) / current;
        if (change > 0.3)
            return 'high';
        if (change > 0.1)
            return 'medium';
        return 'low';
    }
    generateThroughputRecommendation(forecast) {
        return '';
    }
    async predictBottlenecks(historical) {
        return {
            probability: 0.3,
            stage: 'development',
            timeframe: 3,
            dataPoints: [],
        };
    }
    async detectQualityAnomalies(historical) {
        return { detected: false, confidence: 0, description: '', dataPoints: [] };
    }
    async performOptimizationAnalysis() { }
    async retrainMLModels() { }
    async updateFlowVisualization() { }
    async handleWorkItemStarted(payload) { }
    async handleWorkItemCompleted(payload) { }
    async handleBottleneckDetected(payload) { }
}
export default AdvancedFlowManager;
//# sourceMappingURL=flow-manager.js.map