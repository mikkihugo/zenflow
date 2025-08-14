import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export class MultiLevelOrchestrationManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    config;
    portfolioOrchestrator;
    programOrchestrator;
    swarmExecutionOrchestrator;
    parallelWorkflowManager;
    workflowGatesManager;
    productWorkflowEngine;
    state;
    dependencyResolutionTimer;
    flowControlTimer;
    loadBalancingTimer;
    stateManagementTimer;
    constructor(eventBus, memory, portfolioOrchestrator, programOrchestrator, swarmExecutionOrchestrator, parallelWorkflowManager, workflowGatesManager, productWorkflowEngine, config = {}) {
        super();
        this.logger = getLogger('multi-level-orchestration-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.portfolioOrchestrator = portfolioOrchestrator;
        this.programOrchestrator = programOrchestrator;
        this.swarmExecutionOrchestrator = swarmExecutionOrchestrator;
        this.parallelWorkflowManager = parallelWorkflowManager;
        this.workflowGatesManager = workflowGatesManager;
        this.productWorkflowEngine = productWorkflowEngine;
        this.config = {
            enableLevelTransitions: true,
            enableCrosslevelDependencyResolution: true,
            enableIntelligentWorkflowStateManagement: true,
            enableWIPLimitsEnforcement: true,
            enableFlowControlWithBackpressure: true,
            enableLoadBalancing: true,
            enableQueueManagement: true,
            enableAutomaticEscalation: true,
            wipLimits: {
                portfolioItems: 10,
                programItems: 50,
                executionItems: 200,
                totalSystemItems: 260,
            },
            transitionTimeout: 300000,
            dependencyResolutionInterval: 60000,
            flowControlInterval: 30000,
            loadBalancingInterval: 120000,
            stateManagementInterval: 60000,
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing Multi-Level Orchestration Manager', {
            config: this.config,
        });
        try {
            await this.initializeOrchestrators();
            await this.loadPersistedState();
            await this.setupLevelTransitions();
            this.startBackgroundProcesses();
            this.registerEventHandlers();
            await this.integrateWithProductWorkflow();
            this.logger.info('Multi-Level Orchestration Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize multi-level orchestration manager', { error });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down Multi-Level Orchestration Manager');
        this.stopBackgroundProcesses();
        await this.shutdownOrchestrators();
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Multi-Level Orchestration Manager shutdown complete');
    }
    async transitionPortfolioToProgram(portfolioItemId, transitionContext) {
        this.logger.info('Starting Portfolio to Program transition', {
            portfolioItemId,
            context: transitionContext,
        });
        const transition = await this.createActiveTransition('portfolio-to-program', portfolioItemId, transitionContext);
        try {
            await this.validateTransitionCriteria(transition);
            const programItems = await this.executePortfolioProgramHandoff(portfolioItemId, transitionContext);
            await this.updateCrossLevelMappings(portfolioItemId, programItems.map((p) => p.id), []);
            await this.completeTransition(transition.id, programItems.map((p) => p.id));
            this.logger.info('Portfolio to Program transition completed', {
                portfolioItemId,
                programItemIds: programItems.map((p) => p.id),
            });
            return programItems.map((p) => p.id);
        }
        catch (error) {
            await this.handleTransitionError(transition.id, error);
            throw error;
        }
    }
    async transitionProgramToSwarmExecution(programItemId, transitionContext) {
        this.logger.info('Starting Program to Swarm Execution transition', {
            programItemId,
            context: transitionContext,
        });
        const transition = await this.createActiveTransition('program-to-swarm', programItemId, transitionContext);
        try {
            await this.validateTransitionCriteria(transition);
            const swarmItems = await this.executeProgramSwarmHandoff(programItemId, transitionContext);
            await this.updateCrossLevelMappings(await this.getPortfolioIdForProgram(programItemId), [programItemId], swarmItems.map((s) => s.id));
            await this.completeTransition(transition.id, swarmItems.map((s) => s.id));
            this.logger.info('Program to Swarm Execution transition completed', {
                programItemId,
                swarmItemIds: swarmItems.map((s) => s.id),
            });
            return swarmItems.map((s) => s.id);
        }
        catch (error) {
            await this.handleTransitionError(transition.id, error);
            throw error;
        }
    }
    async executeTransitionRollback(transitionId, reason) {
        const transition = this.state.activeTransitions.get(transitionId);
        if (!transition) {
            throw new Error(`Transition not found: ${transitionId}`);
        }
        this.logger.warn('Executing transition rollback', {
            transitionId,
            reason,
            sourceItemId: transition.sourceItemId,
        });
        try {
            const rollbackConfig = transition.config.rollbackStrategy;
            if (!rollbackConfig.enabled) {
                throw new Error('Rollback not enabled for this transition');
            }
            await this.executeRollbackActions(transition, reason);
            await this.revertCrossLevelMappings(transition);
            transition.status = 'rolled_back';
            transition.completedAt = new Date();
            transition.errors.push(`Rollback: ${reason}`);
            this.logger.info('Transition rollback completed', {
                transitionId,
                reason,
            });
            this.emit('transition-rolled-back', { transitionId, reason });
        }
        catch (error) {
            this.logger.error('Transition rollback failed', { transitionId, error });
            throw error;
        }
    }
    async resolveCrossLevelDependencies() {
        if (!this.config.enableCrosslevelDependencyResolution)
            return;
        const unresolvedDependencies = this.state.crossLevelDependencies.filter((dep) => dep.status === 'pending' || dep.status === 'blocked');
        for (const dependency of unresolvedDependencies) {
            try {
                await this.resolveSingleDependency(dependency);
            }
            catch (error) {
                this.logger.error('Dependency resolution failed', {
                    dependencyId: dependency.id,
                    error,
                });
                if (this.config.enableAutomaticEscalation) {
                    await this.escalateDependencyResolution(dependency);
                }
            }
        }
        await this.updateDependencyGraph();
    }
    async addCrossLevelDependency(fromLevel, fromItemId, toLevel, toItemId, type, impact = 0.5) {
        const dependency = {
            id: `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fromLevel,
            toLevel,
            fromItemId,
            toItemId,
            type,
            status: 'pending',
            impact,
        };
        this.state.crossLevelDependencies.push(dependency);
        await this.resolveSingleDependency(dependency);
        this.logger.info('Cross-level dependency added', {
            dependencyId: dependency.id,
            fromLevel,
            toLevel,
            type,
        });
        return dependency.id;
    }
    async updateDependencyGraph() {
        const graph = await this.buildDependencyGraph();
        const cycles = await this.detectDependencyCycles(graph);
        if (cycles.length > 0) {
            this.logger.warn('Dependency cycles detected', { cycles: cycles.length });
            await this.resolveDependencyCycles(cycles);
        }
        await this.updateFlowMetricsFromDependencies();
    }
    async synchronizeWorkflowState() {
        if (!this.config.enableIntelligentWorkflowStateManagement)
            return;
        this.logger.debug('Synchronizing workflow state across levels');
        try {
            const portfolioState = await this.collectPortfolioState();
            const programState = await this.collectProgramState();
            const swarmState = await this.collectSwarmState();
            const inconsistencies = await this.detectStateInconsistencies(portfolioState, programState, swarmState);
            const autoResolved = await this.resolveStateInconsistencies(inconsistencies.filter((inc) => inc.autoResolvable));
            this.state.workflowSync = {
                portfolioState,
                programState,
                swarmState,
                crossLevelMappings: await this.generateCrossLevelMappings(),
                inconsistencies: inconsistencies.filter((inc) => !inc.autoResolvable),
                lastSyncAt: new Date(),
            };
            this.logger.debug('Workflow state synchronization completed', {
                inconsistencies: inconsistencies.length,
                autoResolved: autoResolved.length,
            });
            if (inconsistencies.length > autoResolved.length) {
                this.emit('state-inconsistencies-detected', {
                    total: inconsistencies.length,
                    unresolved: inconsistencies.length - autoResolved.length,
                });
            }
        }
        catch (error) {
            this.logger.error('Workflow state synchronization failed', { error });
            throw error;
        }
    }
    async getUnifiedWorkflowStatus() {
        const status = {
            portfolioHealth: await this.getPortfolioHealth(),
            programHealth: await this.getProgramHealth(),
            swarmHealth: await this.getSwarmHealth(),
            overallHealth: 0,
            flowMetrics: this.state.flowControlMetrics,
            systemMetrics: this.state.systemMetrics,
            activeTransitions: Array.from(this.state.activeTransitions.values()),
            dependencyHealth: await this.calculateDependencyHealth(),
            lastUpdated: new Date(),
        };
        status.overallHealth =
            status.portfolioHealth.overallScore * 0.2 +
                status.programHealth.overallScore * 0.4 +
                status.swarmHealth.overallScore * 0.4;
        return status;
    }
    async enforceWIPLimits() {
        if (!this.config.enableWIPLimitsEnforcement)
            return;
        const currentWIP = await this.calculateCurrentWIP();
        const violations = this.detectWIPViolations(currentWIP);
        for (const violation of violations) {
            await this.handleWIPViolation(violation);
        }
        await this.updateFlowControlMetrics(currentWIP);
    }
    async implementFlowControl() {
        if (!this.config.enableFlowControlWithBackpressure)
            return;
        const flowMetrics = await this.calculateFlowMetrics();
        const bottlenecks = await this.detectBottlenecks(flowMetrics);
        for (const bottleneck of bottlenecks) {
            await this.applyBackpressure(bottleneck);
            if (bottleneck.autoResolution) {
                await this.resolveBottleneck(bottleneck);
            }
        }
        this.state.flowControlMetrics = {
            currentWIP: await this.calculateCurrentWIP(),
            wipUtilization: await this.calculateWIPUtilization(),
            throughput: await this.calculateThroughputByLevel(),
            bottlenecks,
            backpressureEvents: await this.getRecentBackpressureEvents(),
            loadBalance: await this.calculateLoadBalance(),
            lastUpdated: new Date(),
        };
    }
    async balanceLoadAcrossLevels() {
        if (!this.config.enableLoadBalancing)
            return;
        const loadMetrics = await this.calculateLoadBalance();
        if (loadMetrics.balanceScore < 0.7) {
            const recommendations = loadMetrics.rebalanceRecommendations
                .filter((rec) => rec.expectedImprovement > 0.1)
                .sort((a, b) => b.expectedImprovement - a.expectedImprovement);
            for (const recommendation of recommendations.slice(0, 3)) {
                await this.executeRebalanceRecommendation(recommendation);
            }
        }
    }
    async manageQueuesWithPrioritization() {
        if (!this.config.enableQueueManagement)
            return;
        await this.prioritizePortfolioQueue();
        await this.prioritizeProgramQueue();
        await this.prioritizeSwarmQueue();
        await this.optimizeCrossLevelQueues();
    }
    async getPerformanceDashboard() {
        return {
            timestamp: new Date(),
            systemHealth: await this.getUnifiedWorkflowStatus(),
            flowMetrics: this.state.flowControlMetrics,
            wipMetrics: await this.calculateWIPMetrics(),
            throughputMetrics: await this.calculateThroughputMetrics(),
            bottleneckAnalysis: await this.analyzeBottlenecks(),
            recommendations: await this.generateSystemRecommendations(),
        };
    }
    initializeState() {
        return {
            orchestratorStates: {
                portfolio: null,
                program: null,
                swarmExecution: null,
            },
            levelTransitions: [],
            activeTransitions: new Map(),
            crossLevelDependencies: [],
            wipLimits: this.config.wipLimits,
            flowControlMetrics: {
                currentWIP: {
                    [OrchestrationLevel.PORTFOLIO]: 0,
                    [OrchestrationLevel.PROGRAM]: 0,
                    [OrchestrationLevel.SWARM_EXECUTION]: 0,
                },
                wipUtilization: {
                    [OrchestrationLevel.PORTFOLIO]: 0,
                    [OrchestrationLevel.PROGRAM]: 0,
                    [OrchestrationLevel.SWARM_EXECUTION]: 0,
                },
                throughput: {
                    [OrchestrationLevel.PORTFOLIO]: 0,
                    [OrchestrationLevel.PROGRAM]: 0,
                    [OrchestrationLevel.SWARM_EXECUTION]: 0,
                },
                bottlenecks: [],
                backpressureEvents: [],
                loadBalance: {
                    portfolioLoad: 0,
                    programLoad: 0,
                    swarmLoad: 0,
                    balanceScore: 1.0,
                    rebalanceRecommendations: [],
                },
                lastUpdated: new Date(),
            },
            workflowSync: {
                portfolioState: new Map(),
                programState: new Map(),
                swarmState: new Map(),
                crossLevelMappings: [],
                inconsistencies: [],
                lastSyncAt: new Date(),
            },
            systemMetrics: {
                overallThroughput: 0,
                levelThroughput: {
                    [OrchestrationLevel.PORTFOLIO]: 0,
                    [OrchestrationLevel.PROGRAM]: 0,
                    [OrchestrationLevel.SWARM_EXECUTION]: 0,
                },
                averageCycleTime: 0,
                wipUtilization: 0,
                bottleneckCount: 0,
                flowEfficiency: 0,
                humanInterventionRate: 0,
                automationRate: 0,
                qualityScore: 0,
                lastUpdated: new Date(),
            },
            lastUpdated: new Date(),
        };
    }
    async initializeOrchestrators() {
        await Promise.all([
            this.portfolioOrchestrator.initialize(),
            this.programOrchestrator.initialize(),
            this.swarmExecutionOrchestrator.initialize(),
            this.parallelWorkflowManager.initialize(),
            this.workflowGatesManager.initialize(),
        ]);
    }
    async shutdownOrchestrators() {
        await Promise.all([
            this.portfolioOrchestrator.shutdown(),
            this.programOrchestrator.shutdown(),
            this.swarmExecutionOrchestrator.shutdown(),
            this.parallelWorkflowManager.shutdown(),
            this.workflowGatesManager.shutdown(),
        ]);
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('multi-level-orchestration:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    activeTransitions: new Map(persistedState.activeTransitions || []),
                    workflowSync: {
                        ...persistedState.workflowSync,
                        portfolioState: new Map(persistedState.workflowSync?.portfolioState || []),
                        programState: new Map(persistedState.workflowSync?.programState || []),
                        swarmState: new Map(persistedState.workflowSync?.swarmState || []),
                    },
                };
                this.logger.info('Multi-level orchestration state loaded');
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
                activeTransitions: Array.from(this.state.activeTransitions.entries()),
                workflowSync: {
                    ...this.state.workflowSync,
                    portfolioState: Array.from(this.state.workflowSync.portfolioState.entries()),
                    programState: Array.from(this.state.workflowSync.programState.entries()),
                    swarmState: Array.from(this.state.workflowSync.swarmState.entries()),
                },
            };
            await this.memory.store('multi-level-orchestration:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    startBackgroundProcesses() {
        this.dependencyResolutionTimer = setInterval(() => this.resolveCrossLevelDependencies().catch((err) => this.logger.error('Dependency resolution failed', { err })), this.config.dependencyResolutionInterval);
        this.flowControlTimer = setInterval(() => this.implementFlowControl().catch((err) => this.logger.error('Flow control failed', { err })), this.config.flowControlInterval);
        this.loadBalancingTimer = setInterval(() => this.balanceLoadAcrossLevels().catch((err) => this.logger.error('Load balancing failed', { err })), this.config.loadBalancingInterval);
        this.stateManagementTimer = setInterval(() => this.synchronizeWorkflowState().catch((err) => this.logger.error('State synchronization failed', { err })), this.config.stateManagementInterval);
    }
    stopBackgroundProcesses() {
        if (this.dependencyResolutionTimer)
            clearInterval(this.dependencyResolutionTimer);
        if (this.flowControlTimer)
            clearInterval(this.flowControlTimer);
        if (this.loadBalancingTimer)
            clearInterval(this.loadBalancingTimer);
        if (this.stateManagementTimer)
            clearInterval(this.stateManagementTimer);
    }
    registerEventHandlers() {
        this.portfolioOrchestrator.on('portfolio-item-completed', async (item) => {
            await this.handlePortfolioItemCompletion(item);
        });
        this.programOrchestrator.on('epic-completed', async (item) => {
            await this.handleEpicCompletion(item);
        });
        this.swarmExecutionOrchestrator.on('feature-completed', async (item) => {
            await this.handleFeatureCompletion(item);
        });
    }
    async setupLevelTransitions() { }
    async integrateWithProductWorkflow() { }
    async createActiveTransition(type, sourceId, context) {
        return {};
    }
    async validateTransitionCriteria(transition) { }
    async executePortfolioProgramHandoff(portfolioId, context) {
        return [];
    }
    async executeProgramSwarmHandoff(programId, context) {
        return [];
    }
    async updateCrossLevelMappings(portfolioId, programIds, swarmIds) { }
    async completeTransition(transitionId, targetIds) { }
    async handleTransitionError(transitionId, error) { }
}
export default MultiLevelOrchestrationManager;
//# sourceMappingURL=multi-level-orchestration-manager.js.map