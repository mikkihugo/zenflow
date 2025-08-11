/**
 * @file Parallel Workflow Manager - Core orchestration engine for multi-level flows
 *
 * Manages the coordination between Portfolio, Program, and Swarm Execution levels
 * with intelligent WIP limits, dependency management, and flow optimization.
 *
 * ARCHITECTURE:
 * - Portfolio Level: Strategic PRDs with business gates
 * - Program Level: Epic coordination with AI-human collaboration
 * - Swarm Execution Level: Feature implementation with SPARC automation
 */
import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
/**
 * Parallel Workflow Manager - Orchestrates multi-level workflow streams
 */
export class ParallelWorkflowManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    config;
    state;
    optimizationTimer;
    metricsTimer;
    // Performance tracking
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
            enableAutoOptimization: false, // Start with manual optimization
            enableMetricsCollection: true,
            wipLimits: {
                portfolioItems: 5,
                programItems: 20,
                executionItems: 100,
                totalSystemItems: 125,
            },
            optimizationInterval: 300000, // 5 minutes
            metricsCollectionInterval: 60000, // 1 minute
            maxConcurrentStreams: 50,
            streamTimeoutMinutes: 60,
            ...config,
        };
        this.state = this.initializeState();
        this.setupEventHandlers();
    }
    // ============================================================================
    // INITIALIZATION AND LIFECYCLE
    // ============================================================================
    /**
     * Initialize the parallel workflow manager
     */
    async initialize() {
        this.logger.info('Initializing Parallel Workflow Manager', {
            config: this.config,
        });
        // Load persisted state if available
        await this.loadPersistedState();
        // Start background processes
        if (this.config.enableMetricsCollection) {
            this.startMetricsCollection();
        }
        if (this.config.enableAutoOptimization) {
            this.startOptimization();
        }
        // Register with event bus
        this.registerEventHandlers();
        this.logger.info('Parallel Workflow Manager initialized successfully');
        this.emit('initialized');
    }
    /**
     * Shutdown the manager gracefully
     */
    async shutdown() {
        this.logger.info('Shutting down Parallel Workflow Manager');
        // Stop background processes
        if (this.optimizationTimer) {
            clearInterval(this.optimizationTimer);
        }
        if (this.metricsTimer) {
            clearInterval(this.metricsTimer);
        }
        // Save current state
        await this.persistState();
        // Clean up active streams
        await this.shutdownActiveStreams();
        this.logger.info('Parallel Workflow Manager shutdown complete');
        this.emit('shutdown');
    }
    // ============================================================================
    // STREAM MANAGEMENT - Core workflow stream operations
    // ============================================================================
    /**
     * Create a new workflow stream
     */
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
        // Add to appropriate level
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
        // Emit stream created event
        await this.emitStreamStatusEvent(streamId, 'idle', 'idle', 'Stream created');
        return streamId;
    }
    /**
     * Add work item to a stream
     */
    async addWorkItem(streamId, workItem) {
        const stream = this.findStream(streamId);
        if (!stream) {
            this.logger.error('Stream not found', { streamId });
            return false;
        }
        // Check WIP limits
        if (this.config.enableWIPLimits && !this.checkWIPLimits(stream)) {
            await this.emitWIPLimitExceeded(streamId, stream);
            return false;
        }
        // Add to work items
        stream.workItems.push(workItem);
        // Start processing if stream is idle
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
    /**
     * Process work items in a stream
     */
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
                // Check dependencies
                if (!(await this.checkStreamDependencies(streamId))) {
                    await this.updateStreamStatus(streamId, 'blocked', 'Dependencies not satisfied');
                    break;
                }
                // Process items up to WIP limit
                await this.processAvailableWorkItems(stream);
                // Wait for in-progress items to complete before adding more
                if (stream.inProgress.length >= stream.wipLimit) {
                    await this.waitForCapacity(stream);
                }
                // Small delay to prevent tight loops
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            // Mark as completed if no more work
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
    /**
     * Pause a stream
     */
    async pauseStream(streamId, reason) {
        const stream = this.findStream(streamId);
        if (!stream || stream.status === 'paused') {
            return false;
        }
        await this.updateStreamStatus(streamId, 'paused', reason);
        return true;
    }
    /**
     * Resume a paused stream
     */
    async resumeStream(streamId) {
        const stream = this.findStream(streamId);
        if (!stream || stream.status !== 'paused') {
            return false;
        }
        await this.updateStreamStatus(streamId, 'active', 'Resuming stream processing');
        // Continue processing
        void this.processStream(streamId);
        return true;
    }
    // ============================================================================
    // DEPENDENCY MANAGEMENT - Cross-level and intra-level dependencies
    // ============================================================================
    /**
     * Add a cross-level dependency
     */
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
    /**
     * Resolve a dependency
     */
    async resolveDependency(dependencyId) {
        const dependency = this.state.crossLevelDependencies.find((d) => d.id === dependencyId);
        if (!dependency) {
            return false;
        }
        dependency.status = 'resolved';
        // Check if any streams can now proceed
        await this.checkBlockedStreams();
        // Emit dependency resolved event
        await this.emitCrossLevelDependencyEvent('cross.level.dependency.resolved', dependency);
        this.logger.info('Dependency resolved', { dependencyId });
        return true;
    }
    /**
     * Block a dependency
     */
    async blockDependency(dependencyId, reason) {
        const dependency = this.state.crossLevelDependencies.find((d) => d.id === dependencyId);
        if (!dependency) {
            return false;
        }
        dependency.status = 'blocked';
        // Find affected streams and block them
        const affectedStreams = await this.findAffectedStreams(dependency);
        for (const streamId of affectedStreams) {
            await this.pauseStream(streamId, `Dependency blocked: ${reason}`);
        }
        // Emit dependency blocked event
        await this.emitCrossLevelDependencyEvent('cross.level.dependency.blocked', dependency);
        this.logger.warn('Dependency blocked', { dependencyId, reason });
        return true;
    }
    // ============================================================================
    // WIP LIMITS AND FLOW CONTROL - Intelligent flow management
    // ============================================================================
    /**
     * Check WIP limits for a stream
     */
    checkWIPLimits(stream) {
        const currentWIP = stream.inProgress.length;
        // Check stream-specific limit
        if (currentWIP >= stream.wipLimit) {
            return false;
        }
        // Check system-level limits
        const totalWIP = this.calculateTotalWIP();
        if (totalWIP >= this.config.wipLimits.totalSystemItems) {
            return false;
        }
        // Check level-specific limits
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
    /**
     * Adjust WIP limits based on performance
     */
    async adjustWIPLimits(recommendations) {
        for (const rec of recommendations) {
            if (rec.type === 'wip_adjustment' && rec.priority !== 'low') {
                // Parse the recommendation to extract new limits
                // This would be implemented based on specific recommendation format
                this.logger.info('Adjusting WIP limits based on recommendation', {
                    recommendationId: rec.id,
                    description: rec.description,
                });
            }
        }
        // Persist the new limits
        await this.persistState();
    }
    // ============================================================================
    // BOTTLENECK DETECTION - Automatic flow optimization
    // ============================================================================
    /**
     * Detect bottlenecks in the system
     */
    async detectBottlenecks() {
        const bottlenecks = [];
        // Check each orchestration level
        for (const level of Object.values(OrchestrationLevel)) {
            const levelBottlenecks = await this.detectLevelBottlenecks(level);
            bottlenecks.push(...levelBottlenecks);
        }
        // Check cross-level dependencies
        const dependencyBottlenecks = await this.detectDependencyBottlenecks();
        bottlenecks.push(...dependencyBottlenecks);
        // Update state
        this.state.bottlenecks = bottlenecks;
        // Emit events for significant bottlenecks
        for (const bottleneck of bottlenecks) {
            if (bottleneck.severity === 'high' || bottleneck.severity === 'critical') {
                await this.emitBottleneckDetected(bottleneck);
            }
        }
        return bottlenecks;
    }
    /**
     * Generate optimization recommendations
     */
    async generateOptimizationRecommendations() {
        const recommendations = [];
        // Analyze bottlenecks
        for (const bottleneck of this.state.bottlenecks) {
            const rec = await this.analyzeBottleneckForOptimization(bottleneck);
            if (rec) {
                recommendations.push(rec);
            }
        }
        // Analyze WIP utilization
        const wipRecommendations = await this.analyzeWIPUtilization();
        recommendations.push(...wipRecommendations);
        // Analyze flow efficiency
        const flowRecommendations = await this.analyzeFlowEfficiency();
        recommendations.push(...flowRecommendations);
        // Sort by impact and priority
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
    // ============================================================================
    // METRICS AND MONITORING - Performance tracking
    // ============================================================================
    /**
     * Calculate current system metrics
     */
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
        // Add to history
        this.performanceHistory.push(metrics);
        // Keep only recent history
        if (this.performanceHistory.length > 1000) {
            this.performanceHistory = this.performanceHistory.slice(-1000);
        }
        return metrics;
    }
    /**
     * Get current system status
     */
    getSystemStatus() {
        return {
            state: this.state,
            metrics: this.performanceHistory[this.performanceHistory.length - 1] || null,
            recommendations: this.optimizationRecommendations,
        };
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
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
                // Auto-apply low-risk recommendations
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
                affectedStreams: [], // Would be calculated based on bottleneck
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
                impact: [], // Would be calculated
                nextActions: [], // Would be determined based on dependency type
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
    // Placeholder implementations for complex calculation methods
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
        // Implementation would calculate items completed per time period
        return 0;
    }
    calculateLevelThroughput(level) {
        // Implementation would calculate level-specific throughput
        return 0;
    }
    calculateAverageCycleTime() {
        // Implementation would calculate average time from start to completion
        return 0;
    }
    calculateWIPUtilization() {
        const totalWIP = this.calculateTotalWIP();
        return totalWIP / this.config.wipLimits.totalSystemItems;
    }
    calculateFlowEfficiency() {
        // Implementation would calculate value-add time vs total time
        return 0;
    }
    calculateHumanInterventionRate() {
        // Implementation would calculate human intervention frequency
        return 0;
    }
    calculateAutomationRate() {
        // Implementation would calculate automation percentage
        return 0;
    }
    calculateQualityScore() {
        // Implementation would calculate overall quality metrics
        return 0;
    }
    async detectLevelBottlenecks(level) {
        // Implementation would analyze level-specific bottlenecks
        return [];
    }
    async detectDependencyBottlenecks() {
        // Implementation would analyze dependency-related bottlenecks
        return [];
    }
    async analyzeBottleneckForOptimization(bottleneck) {
        // Implementation would analyze bottleneck and generate recommendations
        return null;
    }
    async analyzeWIPUtilization() {
        // Implementation would analyze WIP utilization and suggest optimizations
        return [];
    }
    async analyzeFlowEfficiency() {
        // Implementation would analyze flow efficiency and suggest improvements
        return [];
    }
    async applyOptimizationRecommendation(recommendation) {
        // Implementation would apply the optimization
        this.logger.info('Applied optimization recommendation', {
            id: recommendation.id,
            type: recommendation.type,
        });
    }
    // Additional placeholder methods for full implementation
    async startStreamProcessing(streamId) {
        void this.processStream(streamId);
    }
    async processAvailableWorkItems(stream) {
        // Move items from workItems to inProgress based on WIP limits
        const availableCapacity = stream.wipLimit - stream.inProgress.length;
        const itemsToProcess = stream.workItems.splice(0, availableCapacity);
        stream.inProgress.push(...itemsToProcess);
    }
    async waitForCapacity(stream) {
        // Wait for some in-progress items to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    async checkStreamDependencies(streamId) {
        const stream = this.findStream(streamId);
        if (!stream)
            return false;
        // Check if all dependencies are satisfied
        return stream.dependencies.every((depId) => {
            const depStream = this.findStream(depId);
            return depStream?.status === 'completed' || depStream?.status === 'active';
        });
    }
    async checkBlockedStreams() {
        // Check all blocked streams to see if they can now proceed
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
        // Find streams that are affected by this dependency
        return [];
    }
    async shutdownActiveStreams() {
        // Gracefully shutdown all active streams
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
        // Register with the event bus for relevant events
        this.eventBus.registerHandler('workflow.completed', async (event) => {
            // Handle workflow completion events
        });
        this.eventBus.registerHandler('agent.created', async (event) => {
            // Handle agent creation events
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
