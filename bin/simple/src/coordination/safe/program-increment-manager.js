import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export class ProgramIncrementManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    gatesManager;
    programOrchestrator;
    swarmOrchestrator;
    config;
    state;
    trackingTimer;
    constructor(eventBus, memory, gatesManager, programOrchestrator, swarmOrchestrator, config = {}) {
        super();
        this.logger = getLogger('program-increment-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.gatesManager = gatesManager;
        this.programOrchestrator = programOrchestrator;
        this.swarmOrchestrator = swarmOrchestrator;
        this.config = {
            enableAGUIIntegration: true,
            enableAutomatedCapacityPlanning: true,
            enablePIPlanningEvents: true,
            enableContinuousTracking: true,
            defaultPILengthWeeks: 10,
            iterationsPerPI: 5,
            ipIterationWeeks: 2,
            planningEventDurationHours: 16,
            maxFeaturesPerPI: 50,
            maxTeamsPerART: 12,
            capacityBufferPercentage: 20,
            trackingUpdateInterval: 3600000,
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing Program Increment Manager', {
            config: this.config,
        });
        try {
            await this.loadPersistedState();
            if (this.config.enableContinuousTracking) {
                this.startContinuousTracking();
            }
            this.registerEventHandlers();
            this.logger.info('Program Increment Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize PI Manager', { error });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down Program Increment Manager');
        if (this.trackingTimer) {
            clearInterval(this.trackingTimer);
        }
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Program Increment Manager shutdown complete');
    }
    async planProgramIncrement(artId, businessContext, architecturalVision, teamCapacities) {
        this.logger.info('Starting PI Planning', { artId });
        const planningEvent = await this.createPIPlanningEvent(artId, businessContext, architecturalVision, teamCapacities);
        const piPlan = await this.executePIPlanningWorkflow(planningEvent);
        const programIncrement = await this.createProgramIncrement(artId, piPlan, teamCapacities);
        const piObjectives = await this.generatePIObjectives(programIncrement.id, businessContext, teamCapacities);
        const features = await this.planFeatureAllocation(programIncrement.id, piObjectives, architecturalVision, teamCapacities);
        const dependencies = await this.identifyPIDependencies(features, piObjectives);
        const risks = await this.assessPIRisks(programIncrement, features, dependencies);
        const completePIПлан = {
            ...programIncrement,
            objectives: piObjectives,
            features,
            dependencies,
            risks,
            status: PIStatus.PLANNING,
        };
        this.state.activePIs.set(completePIПлан.id, completePIПлан);
        this.state.planningEvents.set(planningEvent.eventId, planningEvent);
        this.logger.info('PI Planning completed', {
            piId: completePIПлан.id,
            objectiveCount: piObjectives.length,
            featureCount: features.length,
        });
        this.emit('pi-planned', completePIПлан);
        return completePIПлан;
    }
    async executePIPlanningWorkflow(planningEvent) {
        this.logger.info('Executing PI Planning workflow', {
            eventId: planningEvent.eventId,
        });
        const planningResult = {
            eventId: planningEvent.eventId,
            outcomes: [],
            decisions: [],
            adjustments: [],
            risks: [],
            dependencies: [],
        };
        for (const agendaItem of planningEvent.agenda) {
            try {
                const outcome = await this.executeAgendaItem(agendaItem, planningEvent);
                planningResult.outcomes.push(outcome);
                if (agendaItem.aguiGateRequired) {
                    const gateOutcome = await this.createPlanningGate(agendaItem, outcome, planningEvent);
                    planningResult.decisions.push(gateOutcome);
                }
            }
            catch (error) {
                this.logger.error('Agenda item execution failed', {
                    itemId: agendaItem.id,
                    error,
                });
                const adjustment = {
                    type: 'scope',
                    description: `Failed to complete agenda item: ${agendaItem.activity}`,
                    impact: 'Planning scope reduced',
                    adjustment: { skippedItem: agendaItem.id },
                    rationale: error.message || 'Execution error',
                    approvedBy: 'system',
                    timestamp: new Date(),
                };
                planningResult.adjustments.push(adjustment);
            }
        }
        this.logger.info('PI Planning workflow completed', {
            eventId: planningEvent.eventId,
            outcomes: planningResult.outcomes.length,
            decisions: planningResult.decisions.length,
        });
        return planningResult;
    }
    async implementCapacityPlanning(teamCapacities, piObjectives, features) {
        this.logger.info('Starting capacity planning', {
            teamCount: teamCapacities.length,
            featureCount: features.length,
        });
        const planningResult = {
            totalCapacity: 0,
            allocatedCapacity: 0,
            bufferCapacity: 0,
            teamAllocations: [],
            capacityRisks: [],
            recommendations: [],
        };
        planningResult.totalCapacity = teamCapacities.reduce((total, team) => total + team.availableCapacity, 0);
        planningResult.bufferCapacity =
            planningResult.totalCapacity *
                (this.config.capacityBufferPercentage / 100);
        for (const feature of features) {
            const allocation = await this.allocateFeatureToTeam(feature, teamCapacities, planningResult.teamAllocations);
            if (allocation) {
                planningResult.teamAllocations.push(allocation);
                planningResult.allocatedCapacity += allocation.capacityRequired;
            }
            else {
                const risk = {
                    type: 'capacity',
                    description: `Feature ${feature.name} cannot be allocated due to capacity constraints`,
                    impact: 'Feature may be delayed or descoped',
                    mitigation: 'Consider team rebalancing or feature prioritization',
                    severity: 'high',
                };
                planningResult.capacityRisks.push(risk);
            }
        }
        planningResult.recommendations = await this.generateCapacityRecommendations(planningResult, teamCapacities);
        const overallocation = planningResult.allocatedCapacity >
            planningResult.totalCapacity - planningResult.bufferCapacity;
        if (overallocation) {
            this.logger.warn('Capacity overallocation detected', {
                allocatedCapacity: planningResult.allocatedCapacity,
                availableCapacity: planningResult.totalCapacity - planningResult.bufferCapacity,
            });
            await this.createCapacityApprovalGate(planningResult, teamCapacities);
        }
        this.logger.info('Capacity planning completed', {
            totalCapacity: planningResult.totalCapacity,
            allocatedCapacity: planningResult.allocatedCapacity,
            utilizationRate: (planningResult.allocatedCapacity / planningResult.totalCapacity) * 100,
        });
        return planningResult;
    }
    async startPIExecution(piId) {
        const pi = this.state.activePIs.get(piId);
        if (!pi) {
            throw new Error(`PI not found: ${piId}`);
        }
        this.logger.info('Starting PI execution', { piId });
        pi.status = PIStatus.ACTIVE;
        const metrics = this.initializePIMetrics(pi);
        this.state.piMetrics.set(piId, metrics);
        await this.coordinateEpicStreams(pi);
        await this.schedulePIEvents(pi);
        this.logger.info('PI execution started', { piId });
        this.emit('pi-execution-started', pi);
    }
    async trackPIProgress(piId) {
        const pi = this.state.activePIs.get(piId);
        if (!pi) {
            throw new Error(`PI not found: ${piId}`);
        }
        const currentMetrics = this.state.piMetrics.get(piId) || this.initializePIMetrics(pi);
        const progressData = await this.calculatePIProgress(pi);
        currentMetrics.progressPercentage = progressData.overallProgress;
        currentMetrics.velocityTrend = await this.calculateVelocityTrend(pi);
        currentMetrics.predictability =
            await this.calculatePredictabilityMetrics(pi);
        currentMetrics.qualityMetrics = await this.calculateQualityMetrics(pi);
        currentMetrics.riskBurndown = await this.calculateRiskBurndown(pi);
        currentMetrics.dependencyHealth = await this.calculateDependencyHealth(pi);
        currentMetrics.teamMetrics = await this.calculateTeamMetrics(pi);
        currentMetrics.lastUpdated = new Date();
        this.state.piMetrics.set(piId, currentMetrics);
        await this.checkPIHealthAlerts(pi, currentMetrics);
        this.logger.debug('PI progress updated', {
            piId,
            progress: currentMetrics.progressPercentage,
            predictability: currentMetrics.predictability.overallPredictability,
        });
        this.emit('pi-progress-updated', { piId, metrics: currentMetrics });
        return currentMetrics;
    }
    async completeProgramIncrement(piId) {
        const pi = this.state.activePIs.get(piId);
        if (!pi) {
            throw new Error(`PI not found: ${piId}`);
        }
        this.logger.info('Completing Program Increment', { piId });
        const finalMetrics = await this.trackPIProgress(piId);
        const completionReport = await this.generatePICompletionReport(pi, finalMetrics);
        pi.status = PIStatus.COMPLETED;
        await this.scheduleInspectAndAdapt(pi, completionReport);
        await this.archivePIData(pi, finalMetrics);
        this.logger.info('Program Increment completed', {
            piId,
            objectivesAchieved: completionReport.objectivesAchieved,
            overallSuccess: completionReport.overallSuccessRate,
        });
        this.emit('pi-completed', { pi, completionReport });
        return completionReport;
    }
    initializeState() {
        return {
            activeARTs: new Map(),
            activePIs: new Map(),
            planningEvents: new Map(),
            piMetrics: new Map(),
            teamCapacities: new Map(),
            dependencyMatrix: new Map(),
            riskRegister: new Map(),
            lastUpdated: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('pi-manager:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    activeARTs: new Map(persistedState.activeARTs || []),
                    activePIs: new Map(persistedState.activePIs || []),
                    planningEvents: new Map(persistedState.planningEvents || []),
                    piMetrics: new Map(persistedState.piMetrics || []),
                    teamCapacities: new Map(persistedState.teamCapacities || []),
                    dependencyMatrix: new Map(persistedState.dependencyMatrix || []),
                    riskRegister: new Map(persistedState.riskRegister || []),
                };
                this.logger.info('PI Manager state loaded');
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
                activeARTs: Array.from(this.state.activeARTs.entries()),
                activePIs: Array.from(this.state.activePIs.entries()),
                planningEvents: Array.from(this.state.planningEvents.entries()),
                piMetrics: Array.from(this.state.piMetrics.entries()),
                teamCapacities: Array.from(this.state.teamCapacities.entries()),
                dependencyMatrix: Array.from(this.state.dependencyMatrix.entries()),
                riskRegister: Array.from(this.state.riskRegister.entries()),
            };
            await this.memory.store('pi-manager:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    startContinuousTracking() {
        this.trackingTimer = setInterval(async () => {
            try {
                await this.updateAllPIMetrics();
            }
            catch (error) {
                this.logger.error('PI tracking update failed', { error });
            }
        }, this.config.trackingUpdateInterval);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('feature-completed', async (event) => {
            await this.handleFeatureCompletion(event.payload.featureId);
        });
        this.eventBus.registerHandler('risk-identified', async (event) => {
            await this.handleRiskIdentification(event.payload.risk);
        });
    }
    async createPIPlanningEvent(artId, businessContext, architecturalVision, teamCapacities) {
        return {};
    }
    async createProgramIncrement(artId, piPlan, teamCapacities) {
        return {};
    }
    async generatePIObjectives(piId, businessContext, teamCapacities) {
        return [];
    }
    async planFeatureAllocation(piId, piObjectives, architecturalVision, teamCapacities) {
        return [];
    }
    async identifyPIDependencies(features, objectives) {
        return [];
    }
    async assessPIRisks(pi, features, deps) {
        return [];
    }
    async executeAgendaItem(item, event) {
        return {};
    }
    async createPlanningGate(item, outcome, event) {
        return {};
    }
    async allocateFeatureToTeam(feature, capacities, allocations) {
        return null;
    }
    async generateCapacityRecommendations(result, capacities) {
        return [];
    }
    async createCapacityApprovalGate(result, capacities) { }
    initializePIMetrics(pi) {
        return {};
    }
    async coordinateEpicStreams(pi) { }
    async schedulePIEvents(pi) { }
    async calculatePIProgress(pi) {
        return { overallProgress: 0 };
    }
    async calculateVelocityTrend(pi) {
        return {};
    }
    async calculatePredictabilityMetrics(pi) {
        return {};
    }
    async calculateQualityMetrics(pi) {
        return {};
    }
    async calculateRiskBurndown(pi) {
        return {};
    }
    async calculateDependencyHealth(pi) {
        return {};
    }
    async calculateTeamMetrics(pi) {
        return [];
    }
    async checkPIHealthAlerts(pi, metrics) { }
    async generatePICompletionReport(pi, metrics) {
        return {};
    }
    async scheduleInspectAndAdapt(pi, report) { }
    async archivePIData(pi, metrics) { }
    async updateAllPIMetrics() { }
    async handleFeatureCompletion(featureId) { }
    async handleRiskIdentification(risk) { }
}
export default ProgramIncrementManager;
//# sourceMappingURL=program-increment-manager.js.map