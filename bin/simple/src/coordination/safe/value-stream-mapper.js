import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export class ValueStreamMapper extends EventEmitter {
    logger;
    eventBus;
    memory;
    multilevelOrchestrator;
    portfolioOrchestrator;
    programOrchestrator;
    swarmOrchestrator;
    config;
    state;
    bottleneckDetectionTimer;
    flowAnalysisTimer;
    optimizationTimer;
    valueTrackingTimer;
    constructor(eventBus, memory, multilevelOrchestrator, portfolioOrchestrator, programOrchestrator, swarmOrchestrator, config = {}) {
        super();
        this.logger = getLogger('value-stream-mapper');
        this.eventBus = eventBus;
        this.memory = memory;
        this.multilevelOrchestrator = multilevelOrchestrator;
        this.portfolioOrchestrator = portfolioOrchestrator;
        this.programOrchestrator = programOrchestrator;
        this.swarmOrchestrator = swarmOrchestrator;
        this.config = {
            enableBottleneckDetection: true,
            enableFlowOptimization: true,
            enableValueDeliveryTracking: true,
            enableContinuousImprovement: true,
            bottleneckDetectionInterval: 1800000,
            flowAnalysisInterval: 3600000,
            optimizationRecommendationInterval: 21600000,
            valueDeliveryTrackingInterval: 86400000,
            bottleneckThreshold: 0.7,
            maxValueStreams: 20,
            maxFlowSteps: 50,
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing Value Stream Mapper', {
            config: this.config,
        });
        try {
            await this.loadPersistedState();
            await this.mapWorkflowsToValueStreams();
            this.startBottleneckDetection();
            this.startFlowAnalysis();
            this.startOptimizationEngine();
            this.startValueDeliveryTracking();
            this.registerEventHandlers();
            this.logger.info('Value Stream Mapper initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Value Stream Mapper', { error });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down Value Stream Mapper');
        if (this.bottleneckDetectionTimer)
            clearInterval(this.bottleneckDetectionTimer);
        if (this.flowAnalysisTimer)
            clearInterval(this.flowAnalysisTimer);
        if (this.optimizationTimer)
            clearInterval(this.optimizationTimer);
        if (this.valueTrackingTimer)
            clearInterval(this.valueTrackingTimer);
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Value Stream Mapper shutdown complete');
    }
    async mapWorkflowsToValueStreams() {
        this.logger.info('Mapping workflows to value streams');
        const valueStreams = new Map();
        const portfolioStreams = await this.mapPortfolioToValueStreams();
        portfolioStreams.forEach((stream, id) => valueStreams.set(id, stream));
        const programStreams = await this.mapProgramToValueStreams();
        programStreams.forEach((stream, id) => valueStreams.set(id, stream));
        const swarmStreams = await this.mapSwarmToValueStreams();
        swarmStreams.forEach((stream, id) => valueStreams.set(id, stream));
        this.state.valueStreams = valueStreams;
        this.logger.info('Workflow to value stream mapping completed', {
            totalValueStreams: valueStreams.size,
        });
        this.emit('value-streams-mapped', valueStreams);
        return valueStreams;
    }
    async identifyValueDeliveryBottlenecks() {
        this.logger.info('Identifying value delivery bottlenecks');
        const allBottlenecks = new Map();
        for (const [streamId, valueStream] of this.state.valueStreams) {
            const analysis = await this.analyzeValueStreamFlow(streamId);
            const bottlenecks = this.detectBottlenecksInFlow(analysis);
            if (bottlenecks.length > 0) {
                allBottlenecks.set(streamId, bottlenecks);
                this.logger.info('Bottlenecks detected in value stream', {
                    streamId,
                    bottleneckCount: bottlenecks.length,
                    severities: bottlenecks.reduce((acc, b) => {
                        acc[b.severity] = (acc[b.severity] || 0) + 1;
                        return acc;
                    }, {}),
                });
            }
        }
        this.state.bottlenecks = allBottlenecks;
        await this.createBottleneckAlerts(allBottlenecks);
        this.logger.info('Bottleneck identification completed', {
            affectedValueStreams: allBottlenecks.size,
            totalBottlenecks: Array.from(allBottlenecks.values()).flat().length,
        });
        this.emit('bottlenecks-identified', allBottlenecks);
        return allBottlenecks;
    }
    async calculateValueStreamMetrics(valueStreamId) {
        const valueStream = this.state.valueStreams.get(valueStreamId);
        if (!valueStream) {
            throw new Error(`Value stream not found: ${valueStreamId}`);
        }
        const analysis = await this.analyzeValueStreamFlow(valueStreamId);
        const metrics = {
            flowEfficiency: analysis.overallFlowEfficiency,
            leadTime: analysis.totalLeadTime,
            throughput: this.calculateThroughput(analysis),
            defectRate: this.calculateDefectRate(analysis),
            customerSatisfaction: await this.calculateCustomerSatisfaction(valueStreamId),
        };
        this.logger.debug('Value stream metrics calculated', {
            valueStreamId,
            metrics,
        });
        return metrics;
    }
    async generateFlowOptimizationRecommendations(valueStreamId) {
        this.logger.info('Generating flow optimization recommendations', {
            valueStreamId,
        });
        const analysis = this.state.flowAnalyses.get(valueStreamId);
        if (!analysis) {
            throw new Error(`No flow analysis found for value stream: ${valueStreamId}`);
        }
        const recommendations = [];
        for (const bottleneck of analysis.bottlenecks) {
            const bottleneckRecommendations = await this.generateBottleneckRecommendations(bottleneck, analysis);
            recommendations.push(...bottleneckRecommendations);
        }
        const generalRecommendations = await this.generateGeneralFlowRecommendations(analysis);
        recommendations.push(...generalRecommendations);
        const prioritizedRecommendations = this.prioritizeRecommendations(recommendations);
        this.state.optimizationRecommendations.set(valueStreamId, prioritizedRecommendations);
        this.logger.info('Flow optimization recommendations generated', {
            valueStreamId,
            recommendationCount: prioritizedRecommendations.length,
        });
        this.emit('optimization-recommendations-generated', {
            valueStreamId,
            recommendations: prioritizedRecommendations,
        });
        return prioritizedRecommendations;
    }
    async implementContinuousImprovementLoop(valueStreamId) {
        this.logger.info('Implementing continuous improvement loop', {
            valueStreamId,
        });
        const analysis = await this.analyzeValueStreamFlow(valueStreamId);
        const historicalAnalyses = await this.getHistoricalFlowAnalyses(valueStreamId, 30);
        const trends = this.analyzeTrends(analysis, historicalAnalyses);
        const opportunities = await this.identifyImprovementOpportunities(trends, analysis);
        const kaizenSuggestions = await this.generateKaizenSuggestions(opportunities);
        for (const suggestion of kaizenSuggestions) {
            const improvementItem = {
                id: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                valueStreamId,
                type: suggestion.type,
                title: suggestion.title,
                description: suggestion.description,
                status: 'proposed',
                proposedBy: 'system',
                targetMetrics: suggestion.targetMetrics,
                expectedBenefit: suggestion.expectedBenefit,
                implementation: suggestion.implementation,
            };
            this.state.continuousImprovements.push(improvementItem);
        }
        await this.trackImprovementImplementations(valueStreamId);
        this.logger.info('Continuous improvement loop implemented', {
            valueStreamId,
            opportunitiesIdentified: opportunities.length,
            kaizenSuggestions: kaizenSuggestions.length,
        });
        this.emit('continuous-improvement-loop-completed', {
            valueStreamId,
            opportunities,
            kaizenSuggestions,
        });
    }
    async trackValueDeliveryTime(valueStreamId) {
        this.logger.info('Tracking value delivery time', { valueStreamId });
        const trackingPeriod = {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date(),
        };
        const deliveryMetrics = await this.calculateValueDeliveryMetrics(valueStreamId, trackingPeriod);
        const customerOutcomes = await this.assessCustomerOutcomes(valueStreamId, trackingPeriod);
        const businessOutcomes = await this.assessBusinessOutcomes(valueStreamId, trackingPeriod);
        const trends = await this.analyzeValueDeliveryTrends(valueStreamId, trackingPeriod);
        const alerts = await this.generateValueDeliveryAlerts(valueStreamId, deliveryMetrics, trends);
        const tracking = {
            valueStreamId,
            trackingPeriod,
            deliveryMetrics,
            customerOutcomes,
            businessOutcomes,
            trends,
            alerts,
        };
        this.state.valueDeliveryTracking.set(valueStreamId, tracking);
        this.logger.info('Value delivery time tracking completed', {
            valueStreamId,
            deliveryMetrics,
            alertCount: alerts.length,
        });
        this.emit('value-delivery-tracked', tracking);
        return tracking;
    }
    initializeState() {
        return {
            valueStreams: new Map(),
            flowAnalyses: new Map(),
            bottlenecks: new Map(),
            optimizationRecommendations: new Map(),
            valueDeliveryTracking: new Map(),
            continuousImprovements: [],
            lastAnalysis: new Date(),
            lastOptimization: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('value-stream-mapper:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    valueStreams: new Map(persistedState.valueStreams || []),
                    flowAnalyses: new Map(persistedState.flowAnalyses || []),
                    bottlenecks: new Map(persistedState.bottlenecks || []),
                    optimizationRecommendations: new Map(persistedState.optimizationRecommendations || []),
                    valueDeliveryTracking: new Map(persistedState.valueDeliveryTracking || []),
                };
                this.logger.info('Value Stream Mapper state loaded');
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
                valueStreams: Array.from(this.state.valueStreams.entries()),
                flowAnalyses: Array.from(this.state.flowAnalyses.entries()),
                bottlenecks: Array.from(this.state.bottlenecks.entries()),
                optimizationRecommendations: Array.from(this.state.optimizationRecommendations.entries()),
                valueDeliveryTracking: Array.from(this.state.valueDeliveryTracking.entries()),
            };
            await this.memory.store('value-stream-mapper:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    startBottleneckDetection() {
        if (!this.config.enableBottleneckDetection)
            return;
        this.bottleneckDetectionTimer = setInterval(async () => {
            try {
                await this.identifyValueDeliveryBottlenecks();
            }
            catch (error) {
                this.logger.error('Bottleneck detection failed', { error });
            }
        }, this.config.bottleneckDetectionInterval);
    }
    startFlowAnalysis() {
        this.flowAnalysisTimer = setInterval(async () => {
            try {
                await this.runFlowAnalysisForAllStreams();
            }
            catch (error) {
                this.logger.error('Flow analysis failed', { error });
            }
        }, this.config.flowAnalysisInterval);
    }
    startOptimizationEngine() {
        if (!this.config.enableFlowOptimization)
            return;
        this.optimizationTimer = setInterval(async () => {
            try {
                await this.runOptimizationForAllStreams();
            }
            catch (error) {
                this.logger.error('Optimization engine failed', { error });
            }
        }, this.config.optimizationRecommendationInterval);
    }
    startValueDeliveryTracking() {
        if (!this.config.enableValueDeliveryTracking)
            return;
        this.valueTrackingTimer = setInterval(async () => {
            try {
                await this.trackValueDeliveryForAllStreams();
            }
            catch (error) {
                this.logger.error('Value delivery tracking failed', { error });
            }
        }, this.config.valueDeliveryTrackingInterval);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('workflow-completed', async (event) => {
            await this.handleWorkflowCompletion(event.payload);
        });
        this.eventBus.registerHandler('bottleneck-resolved', async (event) => {
            await this.handleBottleneckResolution(event.payload.bottleneckId);
        });
    }
    async mapPortfolioToValueStreams() {
        return new Map();
    }
    async mapProgramToValueStreams() {
        return new Map();
    }
    async mapSwarmToValueStreams() {
        return new Map();
    }
    async analyzeValueStreamFlow(streamId) {
        return {};
    }
    detectBottlenecksInFlow(analysis) {
        return [];
    }
    async createBottleneckAlerts(bottlenecks) { }
    calculateThroughput(analysis) {
        return 0;
    }
    calculateDefectRate(analysis) {
        return 0;
    }
    async calculateCustomerSatisfaction(streamId) {
        return 0;
    }
    async generateBottleneckRecommendations(bottleneck, analysis) {
        return [];
    }
    async generateGeneralFlowRecommendations(analysis) {
        return [];
    }
    prioritizeRecommendations(recommendations) {
        return recommendations;
    }
    async getHistoricalFlowAnalyses(streamId, days) {
        return [];
    }
    analyzeTrends(current, historical) {
        return {};
    }
    async identifyImprovementOpportunities(trends, analysis) {
        return [];
    }
    async generateKaizenSuggestions(opportunities) {
        return [];
    }
    async trackImprovementImplementations(streamId) { }
    async calculateValueDeliveryMetrics(streamId, period) {
        return {};
    }
    async assessCustomerOutcomes(streamId, period) {
        return [];
    }
    async assessBusinessOutcomes(streamId, period) {
        return [];
    }
    async analyzeValueDeliveryTrends(streamId, period) {
        return [];
    }
    async generateValueDeliveryAlerts(streamId, metrics, trends) {
        return [];
    }
    async runFlowAnalysisForAllStreams() { }
    async runOptimizationForAllStreams() { }
    async trackValueDeliveryForAllStreams() { }
    async handleWorkflowCompletion(payload) { }
    async handleBottleneckResolution(bottleneckId) { }
}
export default ValueStreamMapper;
//# sourceMappingURL=value-stream-mapper.js.map