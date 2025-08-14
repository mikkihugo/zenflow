import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export class ParallelWorkflowManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    config;
    state;
    optimizationTimer;
    metricsTimer;
    performanceHistory = [];
    optimizationRecommendations = [];
    constructor(eventBus, memory, config = {}) {
        super();
        this.logger = getLogger('parallel-workflow-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.config = {
            enableWIPLimits: true,
            enableBottleneckDetection: true,
            enableAutoOptimization: false,
            enableMetricsCollection: true,
            wipLimits: {
                portfolioItems: 5,
                programItems: 20,
                executionItems: 100,
                totalSystemItems: 125,
            },
            optimizationInterval: 300000,
            metricsCollectionInterval: 60000,
            maxConcurrentStreams: 50,
            streamTimeoutMinutes: 60,
            ...config,
        };
        this.state = this.initializeState();
        this.setupEventHandlers();
    }
    async initialize() {
        this.logger.info('Initializing Parallel Workflow Manager', {
            config: this.config,
        });
        await this.loadPersistedState();
        if (this.config.enableMetricsCollection) {
            this.startMetricsCollection();
        }
        if (this.config.enableAutoOptimization) {
            this.startOptimization();
        }
        this.registerEventHandlers();
        this.logger.info('Parallel Workflow Manager initialized successfully');
        this.emit('initialized');
    }
    async shutdown() {
        this.logger.info('Shutting down Parallel Workflow Manager');
        if (this.optimizationTimer) {
            clearInterval(this.optimizationTimer);
        }
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
        }
        await this.persistState();
        await this.shutdownActiveStreams();
        this.logger.info('Parallel Workflow Manager shutdown complete');
        this.emit('shutdown');
    }
    async createStream(level, name, config) {
        const streamId = this.generateStreamId(level, name);
        const stream = {
            id: streamId,
            name,
            level,
            status: 'idle',
            workItems: [],
            inProgress: [],
            completed: [],
            wipLimit: config.wipLimit,
            dependencies: config.dependencies || [],
            metrics: this.initializeStreamMetrics(),
            configuration: {
                parallelProcessing: config.parallelProcessing ?? true,
                batchSize: 10,
                timeout: this.config.streamTimeoutMinutes * 60 * 1000,
                retryAttempts: 3,
                enableGates: config.enableGates ?? true,
                gateConfiguration: {
                    enableBusinessGates: level === OrchestrationLevel.PORTFOLIO,
                    enableTechnicalGates: level === OrchestrationLevel.PROGRAM,
                    enableQualityGates: level === OrchestrationLevel.SWARM_EXECUTION,
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
                    maxCapacity: 10,
                    scaleUpThreshold: 0.8,
                    scaleDownThreshold: 0.3,
                    scalingCooldown: 300000,
                },
            },
        };
        switch (level) {
            case OrchestrationLevel.PORTFOLIO:
                this.state.portfolioStreams.push(stream);
                break;
            case OrchestrationLevel.PROGRAM:
                this.state.programStreams.push(stream);
                break;
            case OrchestrationLevel.SWARM_EXECUTION:
                this.state.executionStreams.push(stream);
                break;
        }
        this.logger.info('Workflow stream created', {
            streamId,
            level,
            name,
            wipLimit: config.wipLimit,
        });
        await this.emitStreamStatusEvent(streamId, 'idle', 'idle', 'Stream created');
        return streamId;
    }
    async addWorkItem(streamId, workItem) {
        const stream = this.findStream(streamId);
        if (!stream) {
            this.logger.error('Stream not found', { streamId });
            return false;
        }
        if (this.config.enableWIPLimits && !this.checkWIPLimits(stream)) {
            await this.emitWIPLimitExceeded(streamId, stream);
            return false;
        }
        stream.workItems.push(workItem);
        if (stream.status === 'idle') {
            await this.startStreamProcessing(streamId);
        }
        this.logger.debug('Work item added to stream', {
            streamId,
            queueSize: stream.workItems.length,
            inProgress: stream.inProgress.length,
        });
        return true;
    }
    async processStream(streamId) {
        const stream = this.findStream(streamId);
        if (!stream) {
            this.logger.error('Stream not found for processing', { streamId });
            return;
        }
        if (stream.status === 'active') {
            this.logger.debug('Stream already active', { streamId });
            return;
        }
        await this.updateStreamStatus(streamId, 'active', 'Starting stream processing');
        try {
            while (stream.workItems.length > 0 && stream.status === 'active') {
                if (!(await this.checkStreamDependencies(streamId))) {
                    await this.updateStreamStatus(streamId, 'blocked', 'Dependencies not satisfied');
                    break;
                }
                await this.processAvailableWorkItems(stream);
                if (stream.inProgress.length >= stream.wipLimit) {
                    await this.waitForCapacity(stream);
                }
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            if (stream.workItems.length === 0 && stream.inProgress.length === 0) {
                await this.updateStreamStatus(streamId, 'completed', 'All work items processed');
            }
        }
        catch (error) {
            this.logger.error('Stream processing failed', {
                streamId,
                error: error instanceof Error ? error.message : String(error),
            });
            await this.updateStreamStatus(streamId, 'failed', `Processing failed: ${error}`);
        }
    }
    async pauseStream(streamId, reason) {
        const stream = this.findStream(streamId);
        if (!stream || stream.status === 'paused') {
            return false;
        }
        await this.updateStreamStatus(streamId, 'paused', reason);
        return true;
    }
    async resumeStream(streamId) {
        const stream = this.findStream(streamId);
        if (!stream || stream.status !== 'paused') {
            return false;
        }
        await this.updateStreamStatus(streamId, 'active', 'Resuming stream processing');
        void this.processStream(streamId);
        return true;
    }
    async addCrossLevelDependency(fromLevel, fromItemId, toLevel, toItemId, type, impact = 0.5) {
        const dependencyId = this.generateDependencyId();
        const dependency = {
            id: dependencyId,
            fromLevel,
            toLevel,
            fromItemId,
            toItemId,
            type,
            status: 'pending',
            impact,
        };
        this.state.crossLevelDependencies.push(dependency);
        this.logger.info('Cross-level dependency added', {
            dependencyId,
            fromLevel,
            toLevel,
            type,
            impact,
        });
        return dependencyId;
    }
    async resolveDependency(dependencyId) {
        const dependency = this.state.crossLevelDependencies.find((d) => d.id === dependencyId);
        if (!dependency) {
            return false;
        }
        dependency.status = 'resolved';
        await this.checkBlockedStreams();
        await this.emitCrossLevelDependencyEvent('cross.level.dependency.resolved', dependency);
        this.logger.info('Dependency resolved', { dependencyId });
        return true;
    }
    async blockDependency(dependencyId, reason) {
        const dependency = this.state.crossLevelDependencies.find((d) => d.id === dependencyId);
        if (!dependency) {
            return false;
        }
        dependency.status = 'blocked';
        const affectedStreams = await this.findAffectedStreams(dependency);
        for (const streamId of affectedStreams) {
            await this.pauseStream(streamId, `Dependency blocked: ${reason}`);
        }
        await this.emitCrossLevelDependencyEvent('cross.level.dependency.blocked', dependency);
        this.logger.warn('Dependency blocked', { dependencyId, reason });
        return true;
    }
    checkWIPLimits(stream) {
        const currentWIP = stream.inProgress.length;
        if (currentWIP >= stream.wipLimit) {
            return false;
        }
        const totalWIP = this.calculateTotalWIP();
        if (totalWIP >= this.config.wipLimits.totalSystemItems) {
            return false;
        }
        switch (stream.level) {
            case OrchestrationLevel.PORTFOLIO: {
                const portfolioWIP = this.calculateLevelWIP(OrchestrationLevel.PORTFOLIO);
                return portfolioWIP < this.config.wipLimits.portfolioItems;
            }
            case OrchestrationLevel.PROGRAM: {
                const programWIP = this.calculateLevelWIP(OrchestrationLevel.PROGRAM);
                return programWIP < this.config.wipLimits.programItems;
            }
            case OrchestrationLevel.SWARM_EXECUTION: {
                const executionWIP = this.calculateLevelWIP(OrchestrationLevel.SWARM_EXECUTION);
                return executionWIP < this.config.wipLimits.executionItems;
            }
            default:
                return false;
        }
    }
    async adjustWIPLimits(recommendations) {
        for (const rec of recommendations) {
            if (rec.type === 'wip_adjustment' && rec.priority !== 'low') {
                this.logger.info('Adjusting WIP limits based on recommendation', {
                    recommendationId: rec.id,
                    description: rec.description,
                });
            }
        }
        await this.persistState();
    }
    async detectBottlenecks() {
        const bottlenecks = [];
        for (const level of Object.values(OrchestrationLevel)) {
            const levelBottlenecks = await this.detectLevelBottlenecks(level);
            bottlenecks.push(...levelBottlenecks);
        }
        const dependencyBottlenecks = await this.detectDependencyBottlenecks();
        bottlenecks.push(...dependencyBottlenecks);
        this.state.bottlenecks = bottlenecks;
        for (const bottleneck of bottlenecks) {
            if (bottleneck.severity === 'high' ||
                bottleneck.severity === 'critical') {
                await this.emitBottleneckDetected(bottleneck);
            }
        }
        return bottlenecks;
    }
    async generateOptimizationRecommendations() {
        const recommendations = [];
        for (const bottleneck of this.state.bottlenecks) {
            const rec = await this.analyzeBottleneckForOptimization(bottleneck);
            if (rec) {
                recommendations.push(rec);
            }
        }
        const wipRecommendations = await this.analyzeWIPUtilization();
        recommendations.push(...wipRecommendations);
        const flowRecommendations = await this.analyzeFlowEfficiency();
        recommendations.push(...flowRecommendations);
        recommendations.sort((a, b) => {
            if (a.priority !== b.priority) {
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            }
            return b.impact - a.impact;
        });
        this.optimizationRecommendations = recommendations;
        return recommendations;
    }
    async calculateSystemMetrics() {
        const now = new Date();
        const metrics = {
            overallThroughput: this.calculateOverallThroughput(),
            levelThroughput: {
                [OrchestrationLevel.PORTFOLIO]: this.calculateLevelThroughput(OrchestrationLevel.PORTFOLIO),
                [OrchestrationLevel.PROGRAM]: this.calculateLevelThroughput(OrchestrationLevel.PROGRAM),
                [OrchestrationLevel.SWARM_EXECUTION]: this.calculateLevelThroughput(OrchestrationLevel.SWARM_EXECUTION),
            },
            averageCycleTime: this.calculateAverageCycleTime(),
            wipUtilization: this.calculateWIPUtilization(),
            bottleneckCount: this.state.bottlenecks.length,
            flowEfficiency: this.calculateFlowEfficiency(),
            humanInterventionRate: this.calculateHumanInterventionRate(),
            automationRate: this.calculateAutomationRate(),
            qualityScore: this.calculateQualityScore(),
            lastUpdated: now,
        };
        this.performanceHistory.push(metrics);
        if (this.performanceHistory.length > 1000) {
            this.performanceHistory = this.performanceHistory.slice(-1000);
        }
        return metrics;
    }
    getSystemStatus() {
        return {
            state: this.state,
            metrics: this.performanceHistory[this.performanceHistory.length - 1] || null,
            recommendations: this.optimizationRecommendations,
        };
    }
    initializeState() {
        return {
            portfolioStreams: [],
            programStreams: [],
            executionStreams: [],
            crossLevelDependencies: [],
            wipLimits: this.config.wipLimits,
            flowMetrics: {
                throughput: 0,
                cycleTime: 0,
                leadTime: 0,
                wipUtilization: 0,
                bottlenecks: [],
                flowEfficiency: 0,
            },
            bottlenecks: [],
            lastUpdated: new Date(),
        };
    }
    setupEventHandlers() {
        this.on('stream.status.changed', this.handleStreamStatusChanged.bind(this));
        this.on('wip.limit.exceeded', this.handleWIPLimitExceeded.bind(this));
        this.on('bottleneck.detected', this.handleBottleneckDetected.bind(this));
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('parallel-workflow-manager:state');
            if (persistedState) {
                this.state = { ...this.state, ...persistedState };
                this.logger.info('Loaded persisted state');
            }
        }
        catch (error) {
            this.logger.warn('Failed to load persisted state', { error });
        }
    }
    async persistState() {
        try {
            await this.memory.store('parallel-workflow-manager:state', this.state);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    startMetricsCollection() {
        this.metricsTimer = setInterval(async () => {
            try {
                await this.calculateSystemMetrics();
                if (this.config.enableBottleneckDetection) {
                    await this.detectBottlenecks();
                }
            }
            catch (error) {
                this.logger.error('Metrics collection failed', { error });
            }
        }, this.config.metricsCollectionInterval);
    }
    startOptimization() {
        this.optimizationTimer = setInterval(async () => {
            try {
                const recommendations = await this.generateOptimizationRecommendations();
                const autoApplyable = recommendations.filter((r) => r.effort < 0.3 && r.priority !== 'critical');
                for (const rec of autoApplyable) {
                    await this.applyOptimizationRecommendation(rec);
                }
            }
            catch (error) {
                this.logger.error('Optimization failed', { error });
            }
        }, this.config.optimizationInterval);
    }
    findStream(streamId) {
        const allStreams = [
            ...this.state.portfolioStreams,
            ...this.state.programStreams,
            ...this.state.executionStreams,
        ];
        return allStreams.find((s) => s.id === streamId);
    }
    async updateStreamStatus(streamId, status, reason) {
        const stream = this.findStream(streamId);
        if (!stream)
            return;
        const previousStatus = stream.status;
        stream.status = status;
        this.state.lastUpdated = new Date();
        await this.emitStreamStatusEvent(streamId, previousStatus, status, reason);
    }
    async emitStreamStatusEvent(streamId, previousStatus, newStatus, reason) {
        const stream = this.findStream(streamId);
        if (!stream)
            return;
        const event = {
            id: `stream-status-${Date.now()}`,
            type: 'stream.status.changed',
            domain: 'coordination',
            timestamp: new Date(),
            version: '1.0.0',
            payload: {
                streamId,
                level: stream.level,
                previousStatus,
                newStatus,
                reason,
            },
        };
        await this.eventBus.emitEvent(event);
    }
    async emitWIPLimitExceeded(streamId, stream) {
        const event = {
            id: `wip-limit-${Date.now()}`,
            type: 'wip.limit.exceeded',
            domain: 'coordination',
            timestamp: new Date(),
            version: '1.0.0',
            payload: {
                level: stream.level,
                streamId,
                currentWIP: stream.inProgress.length,
                limit: stream.wipLimit,
                action: 'block',
            },
        };
        await this.eventBus.emitEvent(event);
    }
    async emitBottleneckDetected(bottleneck) {
        const event = {
            id: `bottleneck-${Date.now()}`,
            type: 'bottleneck.detected',
            domain: 'coordination',
            timestamp: new Date(),
            version: '1.0.0',
            payload: {
                bottleneck,
                affectedStreams: [],
                suggestedActions: bottleneck.suggestedActions,
            },
        };
        await this.eventBus.emitEvent(event);
    }
    async emitCrossLevelDependencyEvent(type, dependency) {
        const event = {
            id: `dependency-${Date.now()}`,
            type,
            domain: 'coordination',
            timestamp: new Date(),
            version: '1.0.0',
            payload: {
                dependency,
                impact: [],
                nextActions: [],
            },
        };
        await this.eventBus.emitEvent(event);
    }
    generateStreamId(level, name) {
        return `${level}-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    }
    generateDependencyId() {
        return `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    initializeStreamMetrics() {
        return {
            itemsProcessed: 0,
            averageProcessingTime: 0,
            successRate: 1.0,
            utilizationRate: 0,
            blockedTime: 0,
            lastUpdated: new Date(),
        };
    }
    calculateTotalWIP() {
        return (this.state.portfolioStreams.reduce((sum, s) => sum + s.inProgress.length, 0) +
            this.state.programStreams.reduce((sum, s) => sum + s.inProgress.length, 0) +
            this.state.executionStreams.reduce((sum, s) => sum + s.inProgress.length, 0));
    }
    calculateLevelWIP(level) {
        let streams = [];
        switch (level) {
            case OrchestrationLevel.PORTFOLIO:
                streams = this.state.portfolioStreams;
                break;
            case OrchestrationLevel.PROGRAM:
                streams = this.state.programStreams;
                break;
            case OrchestrationLevel.SWARM_EXECUTION:
                streams = this.state.executionStreams;
                break;
        }
        return streams.reduce((sum, s) => sum + s.inProgress.length, 0);
    }
    calculateOverallThroughput() {
        return 0;
    }
    calculateLevelThroughput(level) {
        return 0;
    }
    calculateAverageCycleTime() {
        return 0;
    }
    calculateWIPUtilization() {
        const totalWIP = this.calculateTotalWIP();
        return totalWIP / this.config.wipLimits.totalSystemItems;
    }
    calculateFlowEfficiency() {
        return 0;
    }
    calculateHumanInterventionRate() {
        return 0;
    }
    calculateAutomationRate() {
        return 0;
    }
    calculateQualityScore() {
        return 0;
    }
    async detectLevelBottlenecks(level) {
        return [];
    }
    async detectDependencyBottlenecks() {
        return [];
    }
    async analyzeBottleneckForOptimization(bottleneck) {
        return null;
    }
    async analyzeWIPUtilization() {
        return [];
    }
    async analyzeFlowEfficiency() {
        return [];
    }
    async applyOptimizationRecommendation(recommendation) {
        this.logger.info('Applied optimization recommendation', {
            id: recommendation.id,
            type: recommendation.type,
        });
    }
    async startStreamProcessing(streamId) {
        void this.processStream(streamId);
    }
    async processAvailableWorkItems(stream) {
        const availableCapacity = stream.wipLimit - stream.inProgress.length;
        const itemsToProcess = stream.workItems.splice(0, availableCapacity);
        stream.inProgress.push(...itemsToProcess);
    }
    async waitForCapacity(stream) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    async checkStreamDependencies(streamId) {
        const stream = this.findStream(streamId);
        if (!stream)
            return false;
        return stream.dependencies.every((depId) => {
            const depStream = this.findStream(depId);
            return (depStream?.status === 'completed' || depStream?.status === 'active');
        });
    }
    async checkBlockedStreams() {
        const allStreams = [
            ...this.state.portfolioStreams,
            ...this.state.programStreams,
            ...this.state.executionStreams,
        ];
        for (const stream of allStreams.filter((s) => s.status === 'blocked')) {
            if (await this.checkStreamDependencies(stream.id)) {
                await this.resumeStream(stream.id);
            }
        }
    }
    async findAffectedStreams(dependency) {
        return [];
    }
    async shutdownActiveStreams() {
        const allStreams = [
            ...this.state.portfolioStreams,
            ...this.state.programStreams,
            ...this.state.executionStreams,
        ];
        for (const stream of allStreams.filter((s) => s.status === 'active')) {
            await this.pauseStream(stream.id, 'System shutdown');
        }
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('workflow.completed', async (event) => {
        });
        this.eventBus.registerHandler('agent.created', async (event) => {
        });
    }
    handleStreamStatusChanged(event) {
        this.logger.debug('Stream status changed', event.payload);
    }
    handleWIPLimitExceeded(event) {
        this.logger.warn('WIP limit exceeded', event.payload);
    }
    handleBottleneckDetected(event) {
        this.logger.warn('Bottleneck detected', event.payload);
    }
}
export default ParallelWorkflowManager;
//# sourceMappingURL=parallel-workflow-manager.js.map