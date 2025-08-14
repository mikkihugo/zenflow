import { EventEmitter } from 'events';
import { getLogger } from '../../config/logging-config.ts';
export var SAFeEventType;
(function (SAFeEventType) {
    SAFeEventType["SYSTEM_DEMO"] = "system-demo";
    SAFeEventType["INSPECT_AND_ADAPT"] = "inspect-and-adapt";
    SAFeEventType["ART_SYNC"] = "art-sync";
    SAFeEventType["PI_PLANNING"] = "pi-planning";
    SAFeEventType["PI_KICKOFF"] = "pi-kickoff";
    SAFeEventType["PI_RETROSPECTIVE"] = "pi-retrospective";
    SAFeEventType["SCRUM_OF_SCRUMS"] = "scrum-of-scrums";
    SAFeEventType["PO_SYNC"] = "po-sync";
    SAFeEventType["ARCHITECT_SYNC"] = "architect-sync";
    SAFeEventType["CROSS_ART_COORDINATION"] = "cross-art-coordination";
    SAFeEventType["VALUE_STREAM_COORDINATION"] = "value-stream-coordination";
    SAFeEventType["PORTFOLIO_REVIEW"] = "portfolio-review";
})(SAFeEventType || (SAFeEventType = {}));
export var EventRole;
(function (EventRole) {
    EventRole["FACILITATOR"] = "facilitator";
    EventRole["PARTICIPANT"] = "participant";
    EventRole["OBSERVER"] = "observer";
    EventRole["PRESENTER"] = "presenter";
    EventRole["DECISION_MAKER"] = "decision-maker";
    EventRole["SUBJECT_MATTER_EXPERT"] = "sme";
    EventRole["STAKEHOLDER"] = "stakeholder";
    EventRole["PRODUCT_OWNER"] = "product-owner";
    EventRole["SCRUM_MASTER"] = "scrum-master";
    EventRole["SYSTEM_ARCHITECT"] = "system-architect";
    EventRole["RTE"] = "rte";
})(EventRole || (EventRole = {}));
export var AgendaItemType;
(function (AgendaItemType) {
    AgendaItemType["PRESENTATION"] = "presentation";
    AgendaItemType["DISCUSSION"] = "discussion";
    AgendaItemType["DEMO"] = "demo";
    AgendaItemType["WORKSHOP"] = "workshop";
    AgendaItemType["BREAKOUT"] = "breakout";
    AgendaItemType["DECISION"] = "decision";
    AgendaItemType["RETROSPECTIVE"] = "retrospective";
    AgendaItemType["PLANNING"] = "planning";
    AgendaItemType["REVIEW"] = "review";
    AgendaItemType["VOTING"] = "voting";
    AgendaItemType["PROBLEM_SOLVING"] = "problem-solving";
})(AgendaItemType || (AgendaItemType = {}));
export var EventExecutionStatus;
(function (EventExecutionStatus) {
    EventExecutionStatus["SCHEDULED"] = "scheduled";
    EventExecutionStatus["PREPARING"] = "preparing";
    EventExecutionStatus["IN_PROGRESS"] = "in-progress";
    EventExecutionStatus["PAUSED"] = "paused";
    EventExecutionStatus["COMPLETED"] = "completed";
    EventExecutionStatus["CANCELLED"] = "cancelled";
    EventExecutionStatus["RESCHEDULED"] = "rescheduled";
    EventExecutionStatus["PARTIALLY_COMPLETED"] = "partially-completed";
})(EventExecutionStatus || (EventExecutionStatus = {}));
export class SAFeEventsManager extends EventEmitter {
    logger;
    eventBus;
    memory;
    gatesManager;
    piManager;
    valueStreamMapper;
    portfolioManager;
    config;
    state;
    schedulingTimer;
    reminderTimer;
    metricsTimer;
    constructor(eventBus, memory, gatesManager, piManager, valueStreamMapper, portfolioManager, config = {}) {
        super();
        this.logger = getLogger('safe-events-manager');
        this.eventBus = eventBus;
        this.memory = memory;
        this.gatesManager = gatesManager;
        this.piManager = piManager;
        this.valueStreamMapper = valueStreamMapper;
        this.portfolioManager = portfolioManager;
        this.config = {
            enableSystemDemos: true,
            enableInspectAndAdapt: true,
            enableARTSyncMeetings: true,
            enablePIEvents: true,
            enableCrossARTCoordination: true,
            enableAGUIIntegration: true,
            eventSchedulingLookAhead: 90,
            systemDemoFrequency: 2,
            artSyncFrequency: 7,
            eventReminderHours: [24, 4, 1],
            maxConcurrentEvents: 10,
            eventMetricsCollection: true,
            automaticRescheduling: true,
            timeZone: 'UTC',
            ...config,
        };
        this.state = this.initializeState();
    }
    async initialize() {
        this.logger.info('Initializing SAFe Events Manager', {
            config: this.config,
        });
        try {
            await this.loadPersistedState();
            await this.initializeEventTemplates();
            await this.scheduleRecurringEvents();
            this.startEventScheduling();
            this.startReminderService();
            if (this.config.eventMetricsCollection) {
                this.startMetricsCollection();
            }
            this.registerEventHandlers();
            this.logger.info('SAFe Events Manager initialized successfully');
            this.emit('initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize SAFe Events Manager', { error });
            throw error;
        }
    }
    async shutdown() {
        this.logger.info('Shutting down SAFe Events Manager');
        if (this.schedulingTimer)
            clearInterval(this.schedulingTimer);
        if (this.reminderTimer)
            clearInterval(this.reminderTimer);
        if (this.metricsTimer)
            clearInterval(this.metricsTimer);
        await this.gracefulEventShutdown();
        await this.persistState();
        this.removeAllListeners();
        this.logger.info('SAFe Events Manager shutdown complete');
    }
    async scheduleSystemDemo(artId, iterationNumber, features, stakeholders) {
        this.logger.info('Scheduling System Demo', {
            artId,
            iterationNumber,
            featureCount: features.length,
        });
        const demoConfig = await this.createSystemDemoConfiguration(artId, iterationNumber, features, stakeholders);
        const executionContext = await this.scheduleEvent(demoConfig);
        await this.setupSystemDemoPreparation(executionContext, features);
        if (this.config.enableAGUIIntegration) {
            await this.createSystemDemoAGUIGates(executionContext, features);
        }
        this.logger.info('System Demo scheduled', {
            eventId: executionContext.eventId,
            scheduledDate: executionContext.scheduledDate,
        });
        this.emit('system-demo-scheduled', executionContext);
        return executionContext.eventId;
    }
    async executeSystemDemo(eventId) {
        const executionContext = this.state.scheduledEvents.get(eventId);
        if (!executionContext) {
            throw new Error(`Scheduled event not found: ${eventId}`);
        }
        this.logger.info('Executing System Demo', { eventId });
        await this.startEventExecution(executionContext);
        const outcomes = [];
        const decisions = [];
        const actionItems = [];
        const eventConfig = this.getEventConfiguration(executionContext);
        for (const agendaItem of eventConfig.agenda) {
            try {
                const itemOutcome = await this.executeSystemDemoAgendaItem(agendaItem, executionContext);
                outcomes.push(itemOutcome.objective);
                decisions.push(...itemOutcome.decisions);
                actionItems.push(...itemOutcome.actionItems);
                if (agendaItem.aguiGateRequired) {
                    await this.processSystemDemoGate(agendaItem, itemOutcome, executionContext);
                }
            }
            catch (error) {
                this.logger.error('System Demo agenda item failed', {
                    itemId: agendaItem.itemId,
                    error,
                });
                actionItems.push(await this.createFailedDemoActionItem(agendaItem, error));
            }
        }
        const feedback = await this.collectSystemDemoFeedback(executionContext);
        const metrics = await this.calculateEventMetrics(executionContext);
        await this.completeEventExecution(executionContext);
        const outcome = {
            eventId,
            executionId: executionContext.executionId,
            completionDate: new Date(),
            objectives: outcomes,
            deliverables: await this.generateSystemDemoDeliverables(executionContext, outcomes),
            decisions,
            actionItems,
            feedback,
            metrics,
            lessonsLearned: await this.extractDemoLessonsLearned(feedback, metrics),
            improvements: await this.identifyDemoImprovements(feedback, metrics),
            nextSteps: await this.generateDemoNextSteps(outcomes, decisions, actionItems),
        };
        this.state.eventHistory.set(eventId, outcome);
        this.logger.info('System Demo executed successfully', {
            eventId,
            objectivesAchieved: outcomes.filter((o) => o.achieved).length,
            feedbackCount: feedback.length,
        });
        this.emit('system-demo-executed', outcome);
        return outcome;
    }
    async scheduleInspectAndAdaptWorkshop(artId, piId, piMetrics, retrospectiveData) {
        this.logger.info('Scheduling Inspect & Adapt workshop', { artId, piId });
        const iaConfig = await this.createInspectAndAdaptConfiguration(artId, piId, piMetrics, retrospectiveData);
        const executionContext = await this.scheduleEvent(iaConfig);
        await this.setupInspectAndAdaptPreparation(executionContext, piMetrics, retrospectiveData);
        if (this.config.enableAGUIIntegration) {
            await this.createInspectAndAdaptAGUIGates(executionContext);
        }
        this.logger.info('Inspect & Adapt workshop scheduled', {
            eventId: executionContext.eventId,
            scheduledDate: executionContext.scheduledDate,
        });
        this.emit('inspect-adapt-scheduled', executionContext);
        return executionContext.eventId;
    }
    async executeInspectAndAdaptWorkshop(eventId) {
        const executionContext = this.state.scheduledEvents.get(eventId);
        if (!executionContext) {
            throw new Error(`Scheduled event not found: ${eventId}`);
        }
        this.logger.info('Executing Inspect & Adapt workshop', { eventId });
        await this.startEventExecution(executionContext);
        const inspectResults = await this.executeInspectPhase(executionContext);
        const adaptResults = await this.executeAdaptPhase(executionContext, inspectResults);
        const objectives = await this.generateIAObjectiveOutcomes(inspectResults, adaptResults);
        const decisions = await this.captureIADecisions(adaptResults);
        const actionItems = await this.generateIAActionItems(adaptResults);
        const feedback = await this.collectWorkshopFeedback(executionContext);
        const metrics = await this.calculateEventMetrics(executionContext);
        await this.completeEventExecution(executionContext);
        const outcome = {
            eventId,
            executionId: executionContext.executionId,
            completionDate: new Date(),
            objectives,
            deliverables: await this.generateIADeliverables(inspectResults, adaptResults),
            decisions,
            actionItems,
            feedback,
            metrics,
            lessonsLearned: await this.extractIALessonsLearned(inspectResults, adaptResults),
            improvements: await this.identifyIAImprovements(feedback, metrics),
            nextSteps: await this.generateIANextSteps(decisions, actionItems),
        };
        this.state.eventHistory.set(eventId, outcome);
        this.logger.info('Inspect & Adapt workshop completed', {
            eventId,
            problemsIdentified: inspectResults.problems.length,
            solutionsProposed: adaptResults.solutions.length,
        });
        this.emit('inspect-adapt-executed', outcome);
        return outcome;
    }
    async scheduleARTSyncMeeting(artId, teams, impediments, dependencies) {
        this.logger.info('Scheduling ART Sync meeting', {
            artId,
            teamCount: teams.length,
        });
        const syncConfig = await this.createARTSyncConfiguration(artId, teams, impediments, dependencies);
        const executionContext = await this.scheduleEvent(syncConfig);
        await this.setupARTSyncPreparation(executionContext, teams, impediments);
        this.logger.info('ART Sync meeting scheduled', {
            eventId: executionContext.eventId,
            scheduledDate: executionContext.scheduledDate,
        });
        this.emit('art-sync-scheduled', executionContext);
        return executionContext.eventId;
    }
    async executeARTSyncMeeting(eventId) {
        const executionContext = this.state.scheduledEvents.get(eventId);
        if (!executionContext) {
            throw new Error(`Scheduled event not found: ${eventId}`);
        }
        this.logger.info('Executing ART Sync meeting', { eventId });
        await this.startEventExecution(executionContext);
        const statusUpdates = await this.collectTeamStatusUpdates(executionContext);
        const impedimentDiscussion = await this.facilitateImpedimentDiscussion(executionContext);
        const dependencyCoordination = await this.coordinateDependencies(executionContext);
        const riskReview = await this.reviewARTRisks(executionContext);
        const actionItems = await this.generateSyncActionItems(impedimentDiscussion, dependencyCoordination, riskReview);
        const decisions = await this.captureSyncDecisions(impedimentDiscussion, dependencyCoordination);
        const feedback = await this.collectSyncFeedback(executionContext);
        const metrics = await this.calculateEventMetrics(executionContext);
        await this.completeEventExecution(executionContext);
        const outcome = {
            eventId,
            executionId: executionContext.executionId,
            completionDate: new Date(),
            objectives: await this.generateSyncObjectiveOutcomes(statusUpdates, impedimentDiscussion, dependencyCoordination),
            deliverables: await this.generateSyncDeliverables(statusUpdates, actionItems, decisions),
            decisions,
            actionItems,
            feedback,
            metrics,
            lessonsLearned: await this.extractSyncLessonsLearned(statusUpdates, feedback),
            improvements: await this.identifySyncImprovements(feedback, metrics),
            nextSteps: await this.generateSyncNextSteps(actionItems, decisions),
        };
        this.state.eventHistory.set(eventId, outcome);
        this.logger.info('ART Sync meeting completed', {
            eventId,
            impedimentsAddressed: impedimentDiscussion.resolved.length,
            actionItemsCreated: actionItems.length,
        });
        this.emit('art-sync-executed', outcome);
        return outcome;
    }
    initializeState() {
        return {
            eventConfigurations: new Map(),
            scheduledEvents: new Map(),
            eventHistory: new Map(),
            eventTemplates: new Map(),
            participantRegistry: new Map(),
            eventMetrics: new Map(),
            recurringEventSchedules: new Map(),
            eventDependencies: new Map(),
            lastEventSync: new Date(),
        };
    }
    async loadPersistedState() {
        try {
            const persistedState = await this.memory.retrieve('safe-events-manager:state');
            if (persistedState) {
                this.state = {
                    ...this.state,
                    ...persistedState,
                    eventConfigurations: new Map(persistedState.eventConfigurations || []),
                    scheduledEvents: new Map(persistedState.scheduledEvents || []),
                    eventHistory: new Map(persistedState.eventHistory || []),
                    eventTemplates: new Map(persistedState.eventTemplates || []),
                    participantRegistry: new Map(persistedState.participantRegistry || []),
                    eventMetrics: new Map(persistedState.eventMetrics || []),
                    recurringEventSchedules: new Map(persistedState.recurringEventSchedules || []),
                    eventDependencies: new Map(persistedState.eventDependencies || []),
                };
                this.logger.info('SAFe Events Manager state loaded');
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
                eventConfigurations: Array.from(this.state.eventConfigurations.entries()),
                scheduledEvents: Array.from(this.state.scheduledEvents.entries()),
                eventHistory: Array.from(this.state.eventHistory.entries()),
                eventTemplates: Array.from(this.state.eventTemplates.entries()),
                participantRegistry: Array.from(this.state.participantRegistry.entries()),
                eventMetrics: Array.from(this.state.eventMetrics.entries()),
                recurringEventSchedules: Array.from(this.state.recurringEventSchedules.entries()),
                eventDependencies: Array.from(this.state.eventDependencies.entries()),
            };
            await this.memory.store('safe-events-manager:state', stateToSerialize);
        }
        catch (error) {
            this.logger.error('Failed to persist state', { error });
        }
    }
    async initializeEventTemplates() {
        for (const eventType of Object.values(SAFeEventType)) {
            const template = await this.createEventTemplate(eventType);
            this.state.eventTemplates.set(eventType, template);
        }
    }
    async scheduleRecurringEvents() {
        await this.scheduleSystemDemoRecurrence();
        await this.scheduleARTSyncRecurrence();
        await this.scheduleInspectAndAdaptRecurrence();
    }
    startEventScheduling() {
        this.schedulingTimer = setInterval(async () => {
            try {
                await this.processEventScheduling();
            }
            catch (error) {
                this.logger.error('Event scheduling failed', { error });
            }
        }, 3600000);
    }
    startReminderService() {
        this.reminderTimer = setInterval(async () => {
            try {
                await this.sendEventReminders();
            }
            catch (error) {
                this.logger.error('Event reminders failed', { error });
            }
        }, 1800000);
    }
    startMetricsCollection() {
        this.metricsTimer = setInterval(async () => {
            try {
                await this.collectAllEventMetrics();
            }
            catch (error) {
                this.logger.error('Metrics collection failed', { error });
            }
        }, 86400000);
    }
    registerEventHandlers() {
        this.eventBus.registerHandler('pi-started', async (event) => {
            await this.handlePIStart(event.payload);
        });
        this.eventBus.registerHandler('iteration-completed', async (event) => {
            await this.handleIterationCompletion(event.payload);
        });
        this.eventBus.registerHandler('feature-demo-ready', async (event) => {
            await this.handleFeatureDemoReady(event.payload);
        });
    }
    async createEventTemplate(eventType) {
        return {};
    }
    async scheduleSystemDemoRecurrence() { }
    async scheduleARTSyncRecurrence() { }
    async scheduleInspectAndAdaptRecurrence() { }
    async processEventScheduling() { }
    async sendEventReminders() { }
    async collectAllEventMetrics() { }
    async gracefulEventShutdown() { }
    async createSystemDemoConfiguration(artId, iterationNumber, features, stakeholders) {
        return {};
    }
    async scheduleEvent(config) {
        return {};
    }
    async setupSystemDemoPreparation(context, features) { }
    async createSystemDemoAGUIGates(context, features) { }
    async startEventExecution(context) { }
    async completeEventExecution(context) { }
    getEventConfiguration(context) {
        return {};
    }
    async executeSystemDemoAgendaItem(item, context) {
        return {};
    }
    async processSystemDemoGate(item, outcome, context) { }
    async createFailedDemoActionItem(item, error) {
        return {};
    }
    async collectSystemDemoFeedback(context) {
        return [];
    }
    async calculateEventMetrics(context) {
        return {};
    }
    async generateSystemDemoDeliverables(context, outcomes) {
        return [];
    }
    async extractDemoLessonsLearned(feedback, metrics) {
        return [];
    }
    async identifyDemoImprovements(feedback, metrics) {
        return [];
    }
    async generateDemoNextSteps(outcomes, decisions, actionItems) {
        return [];
    }
    async createInspectAndAdaptConfiguration(artId, piId, piMetrics, retrospectiveData) {
        return {};
    }
    async setupInspectAndAdaptPreparation(context, piMetrics, retrospectiveData) { }
    async createInspectAndAdaptAGUIGates(context) { }
    async executeInspectPhase(context) {
        return {};
    }
    async executeAdaptPhase(context, inspectResults) {
        return {};
    }
    async generateIAObjectiveOutcomes(inspectResults, adaptResults) {
        return [];
    }
    async captureIADecisions(adaptResults) {
        return [];
    }
    async generateIAActionItems(adaptResults) {
        return [];
    }
    async collectWorkshopFeedback(context) {
        return [];
    }
    async generateIADeliverables(inspectResults, adaptResults) {
        return [];
    }
    async extractIALessonsLearned(inspectResults, adaptResults) {
        return [];
    }
    async identifyIAImprovements(feedback, metrics) {
        return [];
    }
    async generateIANextSteps(decisions, actionItems) {
        return [];
    }
    async createARTSyncConfiguration(artId, teams, impediments, dependencies) {
        return {};
    }
    async setupARTSyncPreparation(context, teams, impediments) { }
    async collectTeamStatusUpdates(context) {
        return {};
    }
    async facilitateImpedimentDiscussion(context) {
        return {};
    }
    async coordinateDependencies(context) {
        return {};
    }
    async reviewARTRisks(context) {
        return {};
    }
    async generateSyncActionItems(impediments, dependencies, risks) {
        return [];
    }
    async captureSyncDecisions(impediments, dependencies) {
        return [];
    }
    async collectSyncFeedback(context) {
        return [];
    }
    async generateSyncObjectiveOutcomes(statusUpdates, impediments, dependencies) {
        return [];
    }
    async generateSyncDeliverables(statusUpdates, actionItems, decisions) {
        return [];
    }
    async extractSyncLessonsLearned(statusUpdates, feedback) {
        return [];
    }
    async identifySyncImprovements(feedback, metrics) {
        return [];
    }
    async generateSyncNextSteps(actionItems, decisions) {
        return [];
    }
    async handlePIStart(payload) { }
    async handleIterationCompletion(payload) { }
    async handleFeatureDemoReady(payload) { }
}
export default SAFeEventsManager;
//# sourceMappingURL=safe-events-manager.js.map