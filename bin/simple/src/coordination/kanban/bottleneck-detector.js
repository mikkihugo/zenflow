import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export var AutomatedActionType;
(function (AutomatedActionType) {
    AutomatedActionType["RESOURCE_REALLOCATION"] = "resource-reallocation";
    AutomatedActionType["WORKLOAD_REDISTRIBUTION"] = "workload-redistribution";
    AutomatedActionType["WIP_ADJUSTMENT"] = "wip-adjustment";
    AutomatedActionType["PRIORITY_REBALANCING"] = "priority-rebalancing";
    AutomatedActionType["CAPACITY_SCALING"] = "capacity-scaling";
    AutomatedActionType["PROCESS_OPTIMIZATION"] = "process-optimization";
    AutomatedActionType["DEPENDENCY_RESOLUTION"] = "dependency-resolution";
    AutomatedActionType["ESCALATION"] = "escalation";
})(AutomatedActionType || (AutomatedActionType = {}));
export var BottleneckSeverity;
(function (BottleneckSeverity) {
    BottleneckSeverity["MINOR"] = "minor";
    BottleneckSeverity["MODERATE"] = "moderate";
    BottleneckSeverity["MAJOR"] = "major";
    BottleneckSeverity["CRITICAL"] = "critical";
    BottleneckSeverity["EMERGENCY"] = "emergency";
})(BottleneckSeverity || (BottleneckSeverity = {}));
export var BottleneckType;
(function (BottleneckType) {
    BottleneckType["CAPACITY_CONSTRAINT"] = "capacity-constraint";
    BottleneckType["RESOURCE_SHORTAGE"] = "resource-shortage";
    BottleneckType["DEPENDENCY_BLOCK"] = "dependency-block";
    BottleneckType["QUALITY_GATE"] = "quality-gate";
    BottleneckType["PROCESS_INEFFICIENCY"] = "process-inefficiency";
    BottleneckType["SKILL_MISMATCH"] = "skill-mismatch";
    BottleneckType["EXTERNAL_DEPENDENCY"] = "external-dependency";
    BottleneckType["SYSTEM_LIMITATION"] = "system-limitation";
    BottleneckType["COORDINATION_OVERHEAD"] = "coordination-overhead";
})(BottleneckType || (BottleneckType = {}));
export var ResolutionStrategyType;
(function (ResolutionStrategyType) {
    ResolutionStrategyType["IMMEDIATE_RELIEF"] = "immediate-relief";
    ResolutionStrategyType["SHORT_TERM_FIX"] = "short-term-fix";
    ResolutionStrategyType["LONG_TERM_SOLUTION"] = "long-term-solution";
    ResolutionStrategyType["WORKAROUND"] = "workaround";
    ResolutionStrategyType["ESCALATION"] = "escalation";
    ResolutionStrategyType["PREVENTION"] = "prevention";
})(ResolutionStrategyType || (ResolutionStrategyType = {}));
export var ResolutionStatus;
(function (ResolutionStatus) {
    ResolutionStatus["PLANNED"] = "planned";
    ResolutionStatus["IN_PROGRESS"] = "in-progress";
    ResolutionStatus["PAUSED"] = "paused";
    ResolutionStatus["COMPLETED"] = "completed";
    ResolutionStatus["FAILED"] = "failed";
    ResolutionStatus["ROLLED_BACK"] = "rolled-back";
    ResolutionStatus["ESCALATED"] = "escalated";
})(ResolutionStatus || (ResolutionStatus = {}));
export class BottleneckDetectionEngine extends EventEmitter {
    logger;
    eventBus;
    memory;
    gatesManager;
    flowManager;
    config;
    state;
    detectionTimer;
    predictionTimer;
    resolutionTimer;
    constructor(eventBus, memory, gatesManager, flowManager, config = {}) {
        super();
        this.logger = getLogger('bottleneck-detection-engine');
        this.eventBus = eventBus;
        this.memory = memory;
        this.gatesManager = gatesManager;
        this.flowManager = flowManager;
        this.config = {
            enableRealTimeDetection: true,
            enableAutomaticResolution: true,
            enablePredictiveModeling: true,
            enableResourceReallocation: true,
            enableWorkloadRedistribution: true,
            enableAGUIIntegration: true,
            detectionInterval: 60000,
            analysisLookback: 3600000,
            predictionHorizon: 7200000,
            severityThresholds: this.createDefaultSeverityThresholds(),
            resolutionTimeoutThreshold: 1800000,
            autoResolutionConfidenceThreshold: 0.8,
            escalationThreshold: 3,
            maxConcurrentResolutions: 5,
            resourceReallocationWindow: 300000,
            workloadRedistributionThreshold: 20,
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing Bottleneck Detection Engine', {
            config: this.config,
        });
        try {
            await this.loadPersistedState();
            if (this.config.enablePredictiveModeling) {
                await this.initializePredictionModels();
            }
            await this.loadPerformanceBaselines();
            if (this.config.enableRealTimeDetection) {
                this.startRealTimeDetection();
            }
            if (this.config.enablePredictiveModeling) {
                this.startPredictiveModeling();
            }
            if (this.config.enableAutomaticResolution) {
                this.startResolutionMonitoring();
            }
            this.registerEventHandlers();
            await this.runBottleneckDetection();
            this.logger.info('Bottleneck Detection Engine initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Bottleneck Detection Engine', {
                error,
            });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down Bottleneck Detection Engine');
        if (this.detectionTimer)
            clearInterval(this.detectionTimer);
        if (this.predictionTimer)
            clearInterval(this.predictionTimer);
        if (this.resolutionTimer)
            clearInterval(this.resolutionTimer);
        await this.completeActiveResolutions();
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Bottleneck Detection Engine shutdown complete');
    }
    async runBottleneckDetection() {
        this.logger.info('Running bottleneck detection');
        const timestamp = new Date();
        const detectionId = `detection-${timestamp.getTime()}`;
        const flowState = await this.flowManager.getCurrentFlowState();
        const bottlenecks = await this.detectBottlenecks(flowState);
        const predictions = this.config.enablePredictiveModeling
            ? await this.generateBottleneckPredictions(flowState)
            : [];
        const systemHealth = await this.assessSystemHealth(flowState, bottlenecks);
        const recommendations = await this.generateBottleneckRecommendations(bottlenecks, predictions, flowState);
        const riskAssessment = await this.performBottleneckRiskAssessment(bottlenecks, predictions);
        const performanceImpact = await this.calculatePerformanceImpact(bottlenecks);
        const result = {
            detectionId,
            timestamp,
            bottlenecks,
            predictions,
            systemHealth,
            recommendations,
            riskAssessment,
            performanceImpact,
        };
        bottlenecks.forEach((bottleneck) => this.state.currentBottlenecks.set(bottleneck.bottleneckId, bottleneck));
        this.state.historicalDetections.push(result);
        this.state.lastDetection = timestamp;
        if (this.config.enableAutomaticResolution) {
            await this.triggerAutomaticResolutions(bottlenecks);
        }
        this.logger.info('Bottleneck detection completed', {
            detectionId,
            bottleneckCount: bottlenecks.length,
            criticalCount: bottlenecks.filter((b) => b.severity === BottleneckSeverity.CRITICAL).length,
        });
        this.emit('bottleneck-detection-completed', result);
        return result;
    }
    async detectBottlenecks(flowState) {
        const bottlenecks = [];
        for (const stage of Object.values(FlowStage)) {
            const stageBottlenecks = await this.detectStageBottlenecks(stage, flowState);
            bottlenecks.push(...stageBottlenecks);
        }
        const systemBottlenecks = await this.detectSystemBottlenecks(flowState);
        bottlenecks.push(...systemBottlenecks);
        return this.rankBottlenecksBySeverity(bottlenecks);
    }
    async assessBottleneckSeverity(stage, metrics, flowState) {
        const criteria = {
            wipUtilization: this.calculateWIPUtilization(stage, flowState),
            cycleTimeIncrease: this.calculateCycleTimeIncrease(stage, metrics),
            throughputReduction: this.calculateThroughputReduction(stage, metrics),
            queueLength: this.calculateQueueLength(stage, flowState),
            duration: this.calculateBottleneckDuration(stage),
            impactRadius: this.calculateImpactRadius(stage, flowState),
        };
        for (const threshold of this.config.severityThresholds) {
            if (this.meetsSeverityCriteria(criteria, threshold.criteria)) {
                return threshold.level;
            }
        }
        return BottleneckSeverity.MINOR;
    }
    async triggerAutomaticResolutions(bottlenecks) {
        this.logger.info('Triggering automatic resolutions', {
            bottleneckCount: bottlenecks.length,
        });
        for (const bottleneck of bottlenecks) {
            if (this.shouldTriggerAutomaticResolution(bottleneck)) {
                await this.initiateAutomaticResolution(bottleneck);
            }
        }
    }
    async initiateAutomaticResolution(bottleneck) {
        const strategy = bottleneck.resolutionStrategy;
        this.logger.info('Initiating automatic resolution', {
            bottleneckId: bottleneck.bottleneckId,
            strategyId: strategy.strategyId,
        });
        const activeResolution = {
            resolutionId: `resolution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            bottleneckId: bottleneck.bottleneckId,
            strategy,
            status: ResolutionStatus.PLANNED,
            startedAt: new Date(),
            progress: this.initializeResolutionProgress(strategy),
            metrics: this.initializeResolutionMetrics(),
            issues: [],
        };
        this.state.activeResolutions.set(activeResolution.resolutionId, activeResolution);
        try {
            await this.executeResolutionStrategy(activeResolution);
        }
        catch (error) {
            this.logger.error('Automatic resolution failed', {
                resolutionId: activeResolution.resolutionId,
                error,
            });
            await this.handleResolutionFailure(activeResolution, error);
        }
    }
    async executeResolutionStrategy(resolution) {
        const strategy = resolution.strategy;
        this.logger.info('Executing resolution strategy', {
            resolutionId: resolution.resolutionId,
            strategyType: strategy.type,
        });
        resolution.status = ResolutionStatus.IN_PROGRESS;
        switch (strategy.type) {
            case ResolutionStrategyType.IMMEDIATE_RELIEF:
                await this.executeImmediateReliefStrategy(resolution);
                break;
            case ResolutionStrategyType.SHORT_TERM_FIX:
                await this.executeShortTermFixStrategy(resolution);
                break;
            case ResolutionStrategyType.LONG_TERM_SOLUTION:
                await this.executeLongTermSolutionStrategy(resolution);
                break;
            case ResolutionStrategyType.WORKAROUND:
                await this.executeWorkaroundStrategy(resolution);
                break;
            case ResolutionStrategyType.ESCALATION:
                await this.executeEscalationStrategy(resolution);
                break;
            case ResolutionStrategyType.PREVENTION:
                await this.executePreventionStrategy(resolution);
                break;
            default:
                throw new Error(`Unknown resolution strategy type: ${strategy.type}`);
        }
        resolution.status = ResolutionStatus.COMPLETED;
        this.logger.info('Resolution strategy executed successfully', {
            resolutionId: resolution.resolutionId,
        });
        this.emit('resolution-completed', resolution);
    }
    async executeResourceReallocation(fromStage, toStage, resourceCount) {
        this.logger.info('Executing resource reallocation', {
            fromStage,
            toStage,
            resourceCount,
        });
        if (resourceCount > 2) {
            await this.createResourceReallocationGate(fromStage, toStage, resourceCount);
        }
        await this.reallocateResources(fromStage, toStage, resourceCount);
        await this.monitorReallocationImpact(fromStage, toStage);
        this.emit('resource-reallocated', { fromStage, toStage, resourceCount });
    }
    async executeWorkloadRedistribution(overloadedStage, redistributionPlan) {
        this.logger.info('Executing workload redistribution', {
            overloadedStage,
            redistributionTargets: redistributionPlan.targets.length,
        });
        await this.validateRedistributionPlan(redistributionPlan);
        for (const target of redistributionPlan.targets) {
            await this.redistributeWorkload(overloadedStage, target.stage, target.workItems);
        }
        await this.updateFlowStateAfterRedistribution(redistributionPlan);
        this.emit('workload-redistributed', redistributionPlan);
    }
    async generateBottleneckPredictions(flowState) {
        if (!this.config.enablePredictiveModeling) {
            return [];
        }
        this.logger.info('Generating bottleneck predictions');
        const predictions = [];
        for (const stage of Object.values(FlowStage)) {
            const stagePredictions = await this.predictStageBottlenecks(stage, flowState);
            predictions.push(...stagePredictions);
        }
        const systemPredictions = await this.predictSystemBottlenecks(flowState);
        predictions.push(...systemPredictions);
        const rankedPredictions = predictions
            .filter((p) => p.probability > 0.3)
            .sort((a, b) => b.probability - a.probability);
        this.state.lastPrediction = new Date();
        this.logger.info('Bottleneck predictions generated', {
            predictionCount: rankedPredictions.length,
            highProbabilityCount: rankedPredictions.filter((p) => p.probability > 0.7)
                .length,
        });
        this.emit('bottleneck-predictions-generated', rankedPredictions);
        return rankedPredictions;
    }
    async executeBottleneckPrevention(prediction) {
        this.logger.info('Executing bottleneck prevention', {
            predictionId: prediction.predictionId,
            stage: prediction.stage,
            probability: prediction.probability,
        });
        const strategy = await this.selectOptimalPreventionStrategy(prediction);
        if (!strategy) {
            this.logger.warn('No suitable prevention strategy found', {
                predictionId: prediction.predictionId,
            });
            return;
        }
        for (const action of strategy.actions) {
            await this.executePreventionAction(action, prediction);
        }
        await this.setupEarlyWarningMonitoring(prediction);
        this.logger.info('Bottleneck prevention executed', {
            predictionId: prediction.predictionId,
            strategyId: strategy.strategyId,
        });
        this.emit('bottleneck-prevention-executed', { prediction, strategy });
    }
    async performCapacityForecasting() {
        this.logger.info('Performing capacity forecasting');
        const currentCapacity = await this.getCurrentCapacityMetrics();
        const historicalTrends = await this.getHistoricalCapacityTrends();
        const predictedDemand = await this.predictWorkloadDemand();
        const forecast = {
            forecastId: `forecast-${Date.now()}`,
            timestamp: new Date(),
            timeHorizon: this.config.predictionHorizon,
            currentCapacity,
            predictedDemand,
            capacityGaps: await this.identifyCapacityGaps(currentCapacity, predictedDemand),
            recommendations: await this.generateCapacityRecommendations(currentCapacity, predictedDemand),
            confidence: await this.calculateForecastConfidence(historicalTrends),
        };
        this.emit('capacity-forecast-generated', forecast);
        return forecast;
    }
    initializeState() {
        return {
            currentBottlenecks: new Map(),
            resolutionStrategies: new Map(),
            activeResolutions: new Map(),
            predictionModels: new Map(),
            historicalDetections: [],
            performanceBaselines: new Map(),
            automationRules: new Map(),
            escalationPaths: new Map(),
            lastDetection: new Date(),
            lastPrediction: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('bottleneck-detection-engine:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    currentBottlenecks: new Map(persistedState.currentBottlenecks || []),
                    resolutionStrategies: new Map(persistedState.resolutionStrategies || []),
                    activeResolutions: new Map(persistedState.activeResolutions || []),
                    predictionModels: new Map(persistedState.predictionModels || []),
                    performanceBaselines: new Map(persistedState.performanceBaselines || []),
                    automationRules: new Map(persistedState.automationRules || []),
                    escalationPaths: new Map(persistedState.escalationPaths || []),
                };
                this.logger.info('Bottleneck Detection Engine state loaded');
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
                currentBottlenecks: Array.from(this.state.currentBottlenecks.entries()),
                resolutionStrategies: Array.from(this.state.resolutionStrategies.entries()),
                activeResolutions: Array.from(this.state.activeResolutions.entries()),
                predictionModels: Array.from(this.state.predictionModels.entries()),
                performanceBaselines: Array.from(this.state.performanceBaselines.entries()),
                automationRules: Array.from(this.state.automationRules.entries()),
                escalationPaths: Array.from(this.state.escalationPaths.entries()),
            };
            await this.memory.store('bottleneck-detection-engine:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    createDefaultSeverityThresholds() {
        return [
            {
                level: BottleneckSeverity.CRITICAL,
                criteria: {
                    wipUtilization: 150,
                    cycleTimeIncrease: 200,
                    throughputReduction: 50,
                    queueLength: 20,
                    duration: 1800000,
                    impactRadius: 15,
                },
                actions: [
                    {
                        actionType: AutomatedActionType.ESCALATION,
                        parameters: { level: 'critical' },
                        confidence: 1.0,
                        timeToExecute: 60000,
                        rollbackPlan: {
                            enabled: false,
                            triggers: [],
                            steps: [],
                            timeoutMs: 0,
                            fallbackAction: '',
                        },
                        successCriteria: [
                            {
                                metric: 'escalated',
                                target: 1,
                                timeframe: 60000,
                                critical: true,
                            },
                        ],
                    },
                ],
                escalationRules: [
                    {
                        condition: 'immediate',
                        delay: 0,
                        escalateTo: ['operations-team', 'engineering-manager'],
                        notificationChannels: ['slack', 'email', 'sms'],
                        maxEscalations: 3,
                    },
                ],
            },
            {
                level: BottleneckSeverity.MAJOR,
                criteria: {
                    wipUtilization: 120,
                    cycleTimeIncrease: 100,
                    throughputReduction: 30,
                    queueLength: 10,
                    duration: 900000,
                    impactRadius: 10,
                },
                actions: [
                    {
                        actionType: AutomatedActionType.RESOURCE_REALLOCATION,
                        parameters: { intensity: 'moderate' },
                        confidence: 0.8,
                        timeToExecute: 300000,
                        rollbackPlan: {
                            enabled: true,
                            triggers: [],
                            steps: [],
                            timeoutMs: 600000,
                            fallbackAction: 'revert',
                        },
                        successCriteria: [
                            {
                                metric: 'throughput_improvement',
                                target: 20,
                                timeframe: 600000,
                                critical: false,
                            },
                        ],
                    },
                ],
                escalationRules: [
                    {
                        condition: 'unresolved_30min',
                        delay: 1800000,
                        escalateTo: ['team-lead'],
                        notificationChannels: ['slack', 'email'],
                        maxEscalations: 2,
                    },
                ],
            },
        ];
    }
    startRealTimeDetection() {
        this.detectionTimer = setInterval(async () => {
            try {
                await this.runBottleneckDetection();
            }
            catch (error) {
                this.logger.error('Real-time bottleneck detection failed', { error });
            }
        }, this.config.detectionInterval);
    }
    startPredictiveModeling() {
        this.predictionTimer = setInterval(async () => {
            try {
                const flowState = await this.flowManager.getCurrentFlowState();
                await this.generateBottleneckPredictions(flowState);
            }
            catch (error) {
                this.logger.error('Predictive modeling failed', { error });
            }
        }, this.config.predictionHorizon / 4);
    }
    startResolutionMonitoring() {
        this.resolutionTimer = setInterval(async () => {
            try {
                await this.monitorActiveResolutions();
            }
            catch (error) {
                this.logger.error('Resolution monitoring failed', { error });
            }
        }, 60000);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('flow-state-updated', async (event) => {
            await this.handleFlowStateUpdate(event.payload);
        });
        this.eventBus.registerHandler('wip-violation-detected', async (event) => {
            await this.handleWIPViolation(event.payload);
        });
        this.eventBus.registerHandler('performance-degradation', async (event) => {
            await this.handlePerformanceDegradation(event.payload);
        });
    }
    async initializePredictionModels() { }
    async loadPerformanceBaselines() { }
    async detectStageBottlenecks(stage, flowState) {
        return [];
    }
    async detectSystemBottlenecks(flowState) {
        return [];
    }
    rankBottlenecksBySeverity(bottlenecks) {
        return bottlenecks.sort((a, b) => this.severityToNumber(b.severity) - this.severityToNumber(a.severity));
    }
    severityToNumber(severity) {
        switch (severity) {
            case BottleneckSeverity.EMERGENCY:
                return 5;
            case BottleneckSeverity.CRITICAL:
                return 4;
            case BottleneckSeverity.MAJOR:
                return 3;
            case BottleneckSeverity.MODERATE:
                return 2;
            case BottleneckSeverity.MINOR:
                return 1;
            default:
                return 0;
        }
    }
    calculateWIPUtilization(stage, flowState) {
        return 0;
    }
    calculateCycleTimeIncrease(stage, metrics) {
        return 0;
    }
    calculateThroughputReduction(stage, metrics) {
        return 0;
    }
    calculateQueueLength(stage, flowState) {
        return 0;
    }
    calculateBottleneckDuration(stage) {
        return 0;
    }
    calculateImpactRadius(stage, flowState) {
        return 0;
    }
    meetsSeverityCriteria(criteria, threshold) {
        return false;
    }
    async assessSystemHealth(flowState, bottlenecks) {
        return {};
    }
    async generateBottleneckRecommendations(bottlenecks, predictions, flowState) {
        return [];
    }
    async performBottleneckRiskAssessment(bottlenecks, predictions) {
        return {};
    }
    async calculatePerformanceImpact(bottlenecks) {
        return {};
    }
    shouldTriggerAutomaticResolution(bottleneck) {
        return (bottleneck.confidence > this.config.autoResolutionConfidenceThreshold);
    }
    initializeResolutionProgress(strategy) {
        return {};
    }
    initializeResolutionMetrics() {
        return {};
    }
    async executeImmediateReliefStrategy(resolution) { }
    async executeShortTermFixStrategy(resolution) { }
    async executeLongTermSolutionStrategy(resolution) { }
    async executeWorkaroundStrategy(resolution) { }
    async executeEscalationStrategy(resolution) { }
    async executePreventionStrategy(resolution) { }
    async handleResolutionFailure(resolution, error) { }
    async createResourceReallocationGate(from, to, count) { }
    async reallocateResources(from, to, count) { }
    async monitorReallocationImpact(from, to) { }
    async validateRedistributionPlan(plan) { }
    async redistributeWorkload(from, to, items) { }
    async updateFlowStateAfterRedistribution(plan) { }
    async predictStageBottlenecks(stage, flowState) {
        return [];
    }
    async predictSystemBottlenecks(flowState) {
        return [];
    }
    async selectOptimalPreventionStrategy(prediction) {
        return null;
    }
    async executePreventionAction(action, prediction) { }
    async setupEarlyWarningMonitoring(prediction) { }
    async getCurrentCapacityMetrics() {
        return {};
    }
    async getHistoricalCapacityTrends() {
        return {};
    }
    async predictWorkloadDemand() {
        return {};
    }
    async identifyCapacityGaps(capacity, demand) {
        return [];
    }
    async generateCapacityRecommendations(capacity, demand) {
        return [];
    }
    async calculateForecastConfidence(trends) {
        return 0.8;
    }
    async completeActiveResolutions() { }
    async monitorActiveResolutions() { }
    async handleFlowStateUpdate(payload) { }
    async handleWIPViolation(payload) { }
    async handlePerformanceDegradation(payload) { }
}
export default BottleneckDetectionEngine;
//# sourceMappingURL=bottleneck-detector.js.map