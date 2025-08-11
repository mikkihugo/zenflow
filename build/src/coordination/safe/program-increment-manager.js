/**
 * @file Program Increment Manager - Phase 3, Day 12 (Task 11.2)
 *
 * Implements SAFe Program Increment (PI) Planning with 8-12 week cycles,
 * PI planning event orchestration with AGUI, capacity planning and team allocation.
 * Integrates with the existing multi-level orchestration architecture.
 *
 * ARCHITECTURE:
 * - PI planning workflow (8-12 week cycles)
 * - PI planning event orchestration with AGUI gates
 * - Capacity planning and team allocation
 * - PI execution tracking and management
 * - Integration with Program and Swarm orchestrators
 */
import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
// ============================================================================
// PROGRAM INCREMENT MANAGER - Main Implementation
// ============================================================================
/**
 * Program Increment Manager - SAFe PI Planning and execution management
 */
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
            planningEventDurationHours: 16, // 2 days
            maxFeaturesPerPI: 50,
            maxTeamsPerART: 12,
            capacityBufferPercentage: 20,
            trackingUpdateInterval: 3600000, // 1 hour
            ...config,
        };
        this.state = this.initializeState();
    }
    // ============================================================================
    // LIFECYCLE MANAGEMENT
    // ============================================================================
    /**
     * Initialize the PI Manager
     */
    async initialize() {
        this.logger.info('Initializing Program Increment Manager', {
            config: this.config,
        });
        try {
            // Load persisted state
            await this.loadPersistedState();
            // Start tracking if enabled
            if (this.config.enableContinuousTracking) {
                this.startContinuousTracking();
            }
            // Register event handlers
            this.registerEventHandlers();
            this.logger.info('Program Increment Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize PI Manager', { error });
            throw error;
        }
    }
    /**
     * Shutdown the PI Manager
     */
    async shutdown() {
        this.logger.info('Shutting down Program Increment Manager');
        if (this.trackingTimer) {
            clearInterval(this.trackingTimer);
        }
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('Program Increment Manager shutdown complete');
    }
    // ============================================================================
    // PI PLANNING WORKFLOW - Task 11.2
    // ============================================================================
    /**
     * Plan Program Increment
     */
    async planProgramIncrement(artId, businessContext, architecturalVision, teamCapacities) {
        this.logger.info('Starting PI Planning', { artId });
        // Create PI planning event configuration
        const planningEvent = await this.createPIPlanningEvent(artId, businessContext, architecturalVision, teamCapacities);
        // Execute PI planning workflow with AGUI integration
        const piPlan = await this.executePIPlanningWorkflow(planningEvent);
        // Create and validate PI
        const programIncrement = await this.createProgramIncrement(artId, piPlan, teamCapacities);
        // Generate PI objectives from business context
        const piObjectives = await this.generatePIObjectives(programIncrement.id, businessContext, teamCapacities);
        // Plan feature allocation across teams
        const features = await this.planFeatureAllocation(programIncrement.id, piObjectives, architecturalVision, teamCapacities);
        // Identify and plan dependencies
        const dependencies = await this.identifyPIDependencies(features, piObjectives);
        // Assess and plan risk mitigation
        const risks = await this.assessPIRisks(programIncrement, features, dependencies);
        // Update PI with complete planning
        const completePIПлан = {
            ...programIncrement,
            objectives: piObjectives,
            features,
            dependencies,
            risks,
            status: PIStatus.PLANNING,
        };
        // Store in state
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
    /**
     * Execute PI planning event with AGUI orchestration
     */
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
        // Execute planning agenda items sequentially with AGUI gates
        for (const agendaItem of planningEvent.agenda) {
            try {
                const outcome = await this.executeAgendaItem(agendaItem, planningEvent);
                planningResult.outcomes.push(outcome);
                // Create AGUI gate if required
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
                // Create adjustment for failed agenda item
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
    /**
     * Implement capacity planning and team allocation
     */
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
        // Calculate total available capacity
        planningResult.totalCapacity = teamCapacities.reduce((total, team) => total + team.availableCapacity, 0);
        // Calculate buffer capacity
        planningResult.bufferCapacity =
            planningResult.totalCapacity * (this.config.capacityBufferPercentage / 100);
        // Allocate features to teams based on capacity and skills
        for (const feature of features) {
            const allocation = await this.allocateFeatureToTeam(feature, teamCapacities, planningResult.teamAllocations);
            if (allocation) {
                planningResult.teamAllocations.push(allocation);
                planningResult.allocatedCapacity += allocation.capacityRequired;
            }
            else {
                // Feature couldn't be allocated - create capacity risk
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
        // Generate capacity recommendations
        planningResult.recommendations = await this.generateCapacityRecommendations(planningResult, teamCapacities);
        // Check for overallocation
        const overallocation = planningResult.allocatedCapacity >
            planningResult.totalCapacity - planningResult.bufferCapacity;
        if (overallocation) {
            this.logger.warn('Capacity overallocation detected', {
                allocatedCapacity: planningResult.allocatedCapacity,
                availableCapacity: planningResult.totalCapacity - planningResult.bufferCapacity,
            });
            // Create AGUI gate for capacity approval
            await this.createCapacityApprovalGate(planningResult, teamCapacities);
        }
        this.logger.info('Capacity planning completed', {
            totalCapacity: planningResult.totalCapacity,
            allocatedCapacity: planningResult.allocatedCapacity,
            utilizationRate: (planningResult.allocatedCapacity / planningResult.totalCapacity) * 100,
        });
        return planningResult;
    }
    // ============================================================================
    // PI EXECUTION AND TRACKING - Task 11.3
    // ============================================================================
    /**
     * Start PI execution
     */
    async startPIExecution(piId) {
        const pi = this.state.activePIs.get(piId);
        if (!pi) {
            throw new Error(`PI not found: ${piId}`);
        }
        this.logger.info('Starting PI execution', { piId });
        // Update PI status
        pi.status = PIStatus.ACTIVE;
        // Initialize PI metrics tracking
        const metrics = this.initializePIMetrics(pi);
        this.state.piMetrics.set(piId, metrics);
        // Coordinate with Program Orchestrator to start Epic streams
        await this.coordinateEpicStreams(pi);
        // Schedule system demos and checkpoints
        await this.schedulePIEvents(pi);
        this.logger.info('PI execution started', { piId });
        this.emit('pi-execution-started', pi);
    }
    /**
     * Track PI progress continuously
     */
    async trackPIProgress(piId) {
        const pi = this.state.activePIs.get(piId);
        if (!pi) {
            throw new Error(`PI not found: ${piId}`);
        }
        const currentMetrics = this.state.piMetrics.get(piId) || this.initializePIMetrics(pi);
        // Update progress percentage
        const progressData = await this.calculatePIProgress(pi);
        currentMetrics.progressPercentage = progressData.overallProgress;
        // Update velocity trends
        currentMetrics.velocityTrend = await this.calculateVelocityTrend(pi);
        // Update predictability metrics
        currentMetrics.predictability = await this.calculatePredictabilityMetrics(pi);
        // Update quality metrics
        currentMetrics.qualityMetrics = await this.calculateQualityMetrics(pi);
        // Update risk burndown
        currentMetrics.riskBurndown = await this.calculateRiskBurndown(pi);
        // Update dependency health
        currentMetrics.dependencyHealth = await this.calculateDependencyHealth(pi);
        // Update team metrics
        currentMetrics.teamMetrics = await this.calculateTeamMetrics(pi);
        currentMetrics.lastUpdated = new Date();
        // Store updated metrics
        this.state.piMetrics.set(piId, currentMetrics);
        // Check for alerts and create gates if needed
        await this.checkPIHealthAlerts(pi, currentMetrics);
        this.logger.debug('PI progress updated', {
            piId,
            progress: currentMetrics.progressPercentage,
            predictability: currentMetrics.predictability.overallPredictability,
        });
        this.emit('pi-progress-updated', { piId, metrics: currentMetrics });
        return currentMetrics;
    }
    /**
     * Handle PI completion
     */
    async completeProgramIncrement(piId) {
        const pi = this.state.activePIs.get(piId);
        if (!pi) {
            throw new Error(`PI not found: ${piId}`);
        }
        this.logger.info('Completing Program Increment', { piId });
        // Final metrics calculation
        const finalMetrics = await this.trackPIProgress(piId);
        // Generate completion report
        const completionReport = await this.generatePICompletionReport(pi, finalMetrics);
        // Update PI status
        pi.status = PIStatus.COMPLETED;
        // Schedule Inspect & Adapt workshop
        await this.scheduleInspectAndAdapt(pi, completionReport);
        // Archive PI data
        await this.archivePIData(pi, finalMetrics);
        this.logger.info('Program Increment completed', {
            piId,
            objectivesAchieved: completionReport.objectivesAchieved,
            overallSuccess: completionReport.overallSuccessRate,
        });
        this.emit('pi-completed', { pi, completionReport });
        return completionReport;
    }
    // ============================================================================
    // PRIVATE IMPLEMENTATION METHODS
    // ============================================================================
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
    // Many placeholder implementations would follow...
    async createPIPlanningEvent(artId, businessContext, architecturalVision, teamCapacities) {
        // Placeholder implementation
        return {};
    }
    async createProgramIncrement(artId, piPlan, teamCapacities) {
        // Placeholder implementation
        return {};
    }
    async generatePIObjectives(piId, businessContext, teamCapacities) {
        // Placeholder implementation
        return [];
    }
    async planFeatureAllocation(piId, piObjectives, architecturalVision, teamCapacities) {
        // Placeholder implementation
        return [];
    }
    // Additional placeholder methods would continue...
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
// ============================================================================
// EXPORTS
// ============================================================================
export default ProgramIncrementManager;
