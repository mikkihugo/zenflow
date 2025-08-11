/**
 * @file SAFe Events Manager - Phase 3, Day 16 (Task 15.1-15.3)
 *
 * Implements SAFe events and ceremonies integration including System Demos,
 * Inspect & Adapt workshops, ART sync meetings, and Program Increment events.
 * Provides comprehensive event orchestration, scheduling, and tracking within
 * the existing multi-level orchestration architecture.
 *
 * ARCHITECTURE:
 * - SAFe event scheduling and orchestration
 * - System Demo coordination and management
 * - Inspect & Adapt workshop facilitation
 * - ART sync meeting coordination
 * - Cross-ART coordination events
 * - Event metrics and retrospective analysis
 * - AGUI integration for facilitated events
 */
import { EventEmitter } from 'events';
import type { MemorySystem } from '../../core/memory-system.ts';
import type { TypeSafeEventBus } from '../../core/type-safe-event-system.ts';
import type { WorkflowGatesManager } from '../orchestration/workflow-gates.ts';
import type { ProgramIncrementManager } from './program-increment-manager.ts';
import type { ValueStreamMapper } from './value-stream-mapper.ts';
import type { PortfolioManager } from './portfolio-manager.ts';
import type { ARTTeam, Feature } from './index.ts';
/**
 * SAFe Events Manager configuration
 */
export interface SAFeEventsManagerConfig {
    readonly enableSystemDemos: boolean;
    readonly enableInspectAndAdapt: boolean;
    readonly enableARTSyncMeetings: boolean;
    readonly enablePIEvents: boolean;
    readonly enableCrossARTCoordination: boolean;
    readonly enableAGUIIntegration: boolean;
    readonly eventSchedulingLookAhead: number;
    readonly systemDemoFrequency: number;
    readonly artSyncFrequency: number;
    readonly eventReminderHours: number[];
    readonly maxConcurrentEvents: number;
    readonly eventMetricsCollection: boolean;
    readonly automaticRescheduling: boolean;
    readonly timeZone: string;
}
/**
 * SAFe event types
 */
export declare enum SAFeEventType {
    SYSTEM_DEMO = "system-demo",
    INSPECT_AND_ADAPT = "inspect-and-adapt",
    ART_SYNC = "art-sync",
    PI_PLANNING = "pi-planning",
    PI_KICKOFF = "pi-kickoff",
    PI_RETROSPECTIVE = "pi-retrospective",
    SCRUM_OF_SCRUMS = "scrum-of-scrums",
    PO_SYNC = "po-sync",
    ARCHITECT_SYNC = "architect-sync",
    CROSS_ART_COORDINATION = "cross-art-coordination",
    VALUE_STREAM_COORDINATION = "value-stream-coordination",
    PORTFOLIO_REVIEW = "portfolio-review"
}
/**
 * SAFe event configuration
 */
export interface SAFeEventConfig {
    readonly eventId: string;
    readonly eventType: SAFeEventType;
    readonly name: string;
    readonly description: string;
    readonly schedulingPattern: EventSchedulingPattern;
    readonly duration: number;
    readonly participants: EventParticipant[];
    readonly facilitators: string[];
    readonly prerequisites: string[];
    readonly agenda: EventAgendaItem[];
    readonly deliverables: EventDeliverable[];
    readonly success_criteria: string[];
    readonly followUpActions: FollowUpAction[];
    readonly aguiIntegration: AGUIIntegrationConfig;
}
/**
 * Event scheduling pattern
 */
export interface EventSchedulingPattern {
    readonly patternType: 'fixed' | 'relative' | 'conditional' | 'on-demand';
    readonly frequency?: EventFrequency;
    readonly relativeTo?: RelativeSchedulingConfig;
    readonly conditions?: SchedulingCondition[];
    readonly timeSlots: TimeSlot[];
    readonly exclusions: DateRange[];
    readonly buffer?: EventBufferConfig;
}
/**
 * Event frequency
 */
export interface EventFrequency {
    readonly interval: number;
    readonly unit: 'hours' | 'days' | 'weeks' | 'iterations' | 'pis';
    readonly anchor?: 'start' | 'end' | 'milestone';
    readonly offset?: number;
}
/**
 * Relative scheduling configuration
 */
export interface RelativeSchedulingConfig {
    readonly anchorEvent: SAFeEventType;
    readonly relationship: 'before' | 'after' | 'during' | 'concurrent';
    readonly offset: number;
    readonly dependency: 'hard' | 'soft' | 'preferred';
}
/**
 * Scheduling condition
 */
export interface SchedulingCondition {
    readonly conditionId: string;
    readonly description: string;
    readonly evaluator: 'milestone' | 'metric' | 'approval' | 'completion' | 'custom';
    readonly parameters: Record<string, any>;
    readonly required: boolean;
}
/**
 * Time slot
 */
export interface TimeSlot {
    readonly dayOfWeek?: number;
    readonly startTime: string;
    readonly endTime: string;
    readonly timeZone: string;
    readonly preference: 'preferred' | 'acceptable' | 'avoid';
}
/**
 * Date range
 */
export interface DateRange {
    readonly start: Date;
    readonly end: Date;
    readonly reason?: string;
}
/**
 * Event buffer configuration
 */
export interface EventBufferConfig {
    readonly beforeMinutes: number;
    readonly afterMinutes: number;
    readonly purpose: 'setup' | 'wrap-up' | 'transition' | 'buffer';
}
/**
 * Event participant
 */
export interface EventParticipant {
    readonly participantId: string;
    readonly name: string;
    readonly role: EventRole;
    readonly artId?: string;
    readonly teamId?: string;
    readonly required: boolean;
    readonly delegation?: DelegationConfig;
    readonly preparation?: ParticipantPreparation;
}
/**
 * Event role
 */
export declare enum EventRole {
    FACILITATOR = "facilitator",
    PARTICIPANT = "participant",
    OBSERVER = "observer",
    PRESENTER = "presenter",
    DECISION_MAKER = "decision-maker",
    SUBJECT_MATTER_EXPERT = "sme",
    STAKEHOLDER = "stakeholder",
    PRODUCT_OWNER = "product-owner",
    SCRUM_MASTER = "scrum-master",
    SYSTEM_ARCHITECT = "system-architect",
    RTE = "rte"
}
/**
 * Delegation configuration
 */
export interface DelegationConfig {
    readonly allowDelegation: boolean;
    readonly approvedDelegates: string[];
    readonly delegationRules: string[];
    readonly notificationRequired: boolean;
}
/**
 * Participant preparation
 */
export interface ParticipantPreparation {
    readonly materials: string[];
    readonly preworkTasks: string[];
    readonly deadlineHours: number;
    readonly reminderSchedule: number[];
}
/**
 * Event agenda item
 */
export interface EventAgendaItem {
    readonly itemId: string;
    readonly title: string;
    readonly description: string;
    readonly type: AgendaItemType;
    readonly duration: number;
    readonly presenter: string;
    readonly participants?: string[];
    readonly materials?: string[];
    readonly objectives: string[];
    readonly expectedOutcomes: string[];
    readonly interactiveElements?: InteractiveElement[];
    readonly aguiGateRequired?: boolean;
}
/**
 * Agenda item type
 */
export declare enum AgendaItemType {
    PRESENTATION = "presentation",
    DISCUSSION = "discussion",
    DEMO = "demo",
    WORKSHOP = "workshop",
    BREAKOUT = "breakout",
    DECISION = "decision",
    RETROSPECTIVE = "retrospective",
    PLANNING = "planning",
    REVIEW = "review",
    VOTING = "voting",
    PROBLEM_SOLVING = "problem-solving"
}
/**
 * Interactive element
 */
export interface InteractiveElement {
    readonly elementId: string;
    readonly type: 'poll' | 'survey' | 'whiteboard' | 'breakout' | 'voting' | 'quiz';
    readonly duration: number;
    readonly configuration: Record<string, any>;
    readonly participantRoles: EventRole[];
    readonly dataCollection: boolean;
}
/**
 * Event deliverable
 */
export interface EventDeliverable {
    readonly deliverableId: string;
    readonly name: string;
    readonly type: 'document' | 'decision' | 'action-item' | 'artifact' | 'recording';
    readonly description: string;
    readonly owner: string;
    readonly dueDate?: Date;
    readonly template?: string;
    readonly quality_criteria: string[];
    readonly distribution: string[];
}
/**
 * Follow-up action
 */
export interface FollowUpAction {
    readonly actionId: string;
    readonly action: string;
    readonly owner: string;
    readonly dueDate: Date;
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly dependencies?: string[];
    readonly success_criteria: string[];
    readonly trackingMechanism: string;
}
/**
 * AGUI integration configuration
 */
export interface AGUIIntegrationConfig {
    readonly enabled: boolean;
    readonly gatePoints: AGUIGatePoint[];
    readonly facilitationSupport: FacilitationSupport;
    readonly decisionCapture: DecisionCaptureConfig;
    readonly realTimeFeedback: boolean;
}
/**
 * AGUI gate point
 */
export interface AGUIGatePoint {
    readonly gateId: string;
    readonly triggerPoint: 'start' | 'agenda-item' | 'decision' | 'end' | 'custom';
    readonly gateType: 'approval' | 'feedback' | 'decision' | 'validation' | 'checkpoint';
    readonly participants: string[];
    readonly timeout?: number;
    readonly fallback?: 'proceed' | 'pause' | 'reschedule' | 'escalate';
}
/**
 * Facilitation support
 */
export interface FacilitationSupport {
    readonly timeboxing: boolean;
    readonly parkingLot: boolean;
    readonly actionItemCapture: boolean;
    readonly consensusBuilding: boolean;
    readonly conflictResolution: boolean;
    readonly energizers: boolean;
}
/**
 * Decision capture configuration
 */
export interface DecisionCaptureConfig {
    readonly enabled: boolean;
    readonly decisionTypes: string[];
    readonly approvalRequired: boolean;
    readonly consensusThreshold?: number;
    readonly escalationRules: string[];
    readonly documentationTemplate: string;
}
/**
 * Event execution context
 */
export interface EventExecutionContext {
    readonly eventId: string;
    readonly executionId: string;
    readonly scheduledDate: Date;
    readonly actualStartTime?: Date;
    readonly actualEndTime?: Date;
    readonly status: EventExecutionStatus;
    readonly participants: ActualParticipant[];
    readonly facilitators: string[];
    readonly location: EventLocation;
    readonly technology: TechnologySetup;
    readonly materials: EventMaterial[];
    readonly recording?: RecordingConfig;
}
/**
 * Event execution status
 */
export declare enum EventExecutionStatus {
    SCHEDULED = "scheduled",
    PREPARING = "preparing",
    IN_PROGRESS = "in-progress",
    PAUSED = "paused",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    RESCHEDULED = "rescheduled",
    PARTIALLY_COMPLETED = "partially-completed"
}
/**
 * Actual participant
 */
export interface ActualParticipant {
    readonly participantId: string;
    readonly attended: boolean;
    readonly arrivalTime?: Date;
    readonly departureTime?: Date;
    readonly engagementScore?: number;
    readonly contributions?: string[];
    readonly feedback?: string;
}
/**
 * Event location
 */
export interface EventLocation {
    readonly type: 'physical' | 'virtual' | 'hybrid';
    readonly details: LocationDetails;
    readonly capacity?: number;
    readonly accessibility?: string[];
    readonly technology?: string[];
}
/**
 * Location details
 */
export interface LocationDetails {
    readonly physical?: PhysicalLocationDetails;
    readonly virtual?: VirtualLocationDetails;
    readonly hybrid?: HybridLocationDetails;
}
/**
 * Physical location details
 */
export interface PhysicalLocationDetails {
    readonly venue: string;
    readonly address: string;
    readonly room: string;
    readonly capacity: number;
    readonly equipment: string[];
    readonly accessibility: string[];
}
/**
 * Virtual location details
 */
export interface VirtualLocationDetails {
    readonly platform: string;
    readonly meetingId: string;
    readonly accessLink: string;
    readonly alternativeAccess?: string[];
    readonly features: string[];
}
/**
 * Hybrid location details
 */
export interface HybridLocationDetails {
    readonly physicalLocation: PhysicalLocationDetails;
    readonly virtualLocation: VirtualLocationDetails;
    readonly bridgingTechnology: string;
    readonly facilitationModel: 'physical-lead' | 'virtual-lead' | 'co-facilitated';
}
/**
 * Technology setup
 */
export interface TechnologySetup {
    readonly platforms: Platform[];
    readonly integrations: TechnologyIntegration[];
    readonly backup: BackupTechnology[];
    readonly support: TechnicalSupport;
}
/**
 * Platform
 */
export interface Platform {
    readonly name: string;
    readonly purpose: 'video' | 'audio' | 'collaboration' | 'presentation' | 'polling' | 'whiteboard';
    readonly configuration: Record<string, any>;
    readonly participants: string[];
    readonly backupOptions: string[];
}
/**
 * Technology integration
 */
export interface TechnologyIntegration {
    readonly source: string;
    readonly target: string;
    readonly integrationType: 'data' | 'identity' | 'workflow' | 'notification';
    readonly configuration: Record<string, any>;
}
/**
 * Backup technology
 */
export interface BackupTechnology {
    readonly platform: string;
    readonly triggerConditions: string[];
    readonly switchoverTime: number;
    readonly limitations: string[];
}
/**
 * Technical support
 */
export interface TechnicalSupport {
    readonly supportTeam: string[];
    readonly responseTime: number;
    readonly escalationPath: string[];
    readonly contactMethods: string[];
}
/**
 * Event material
 */
export interface EventMaterial {
    readonly materialId: string;
    readonly name: string;
    readonly type: 'presentation' | 'document' | 'template' | 'checklist' | 'reference';
    readonly location: string;
    readonly accessPermissions: string[];
    readonly lastModified: Date;
    readonly version: string;
}
/**
 * Recording configuration
 */
export interface RecordingConfig {
    readonly enabled: boolean;
    readonly type: 'audio' | 'video' | 'screen' | 'transcript' | 'all';
    readonly storage: string;
    readonly retention: number;
    readonly access: string[];
    readonly privacy: 'public' | 'restricted' | 'confidential';
}
/**
 * Event outcome
 */
export interface EventOutcome {
    readonly eventId: string;
    readonly executionId: string;
    readonly completionDate: Date;
    readonly objectives: ObjectiveOutcome[];
    readonly deliverables: DeliverableOutcome[];
    readonly decisions: EventDecision[];
    readonly actionItems: ActionItem[];
    readonly feedback: ParticipantFeedback[];
    readonly metrics: EventMetrics;
    readonly lessonsLearned: string[];
    readonly improvements: string[];
    readonly nextSteps: string[];
}
/**
 * Objective outcome
 */
export interface ObjectiveOutcome {
    readonly objective: string;
    readonly achieved: boolean;
    readonly achievementLevel: number;
    readonly evidence: string[];
    readonly barriers?: string[];
    readonly recommendations?: string[];
}
/**
 * Deliverable outcome
 */
export interface DeliverableOutcome {
    readonly deliverableId: string;
    readonly completed: boolean;
    readonly quality: number;
    readonly location?: string;
    readonly reviewers?: string[];
    readonly issues?: string[];
    readonly nextActions?: string[];
}
/**
 * Event decision
 */
export interface EventDecision {
    readonly decisionId: string;
    readonly decision: string;
    readonly context: string;
    readonly rationale: string;
    readonly alternatives: string[];
    readonly decisionMaker: string;
    readonly consensusLevel: number;
    readonly implementation: string;
    readonly reviewDate?: Date;
    readonly impacts: string[];
}
/**
 * Action item
 */
export interface ActionItem {
    readonly itemId: string;
    readonly action: string;
    readonly owner: string;
    readonly dueDate: Date;
    readonly priority: 'low' | 'medium' | 'high' | 'critical';
    readonly status: 'open' | 'in-progress' | 'completed' | 'blocked' | 'cancelled';
    readonly dependencies?: string[];
    readonly updates?: ActionItemUpdate[];
    readonly completionCriteria: string[];
}
/**
 * Action item update
 */
export interface ActionItemUpdate {
    readonly updateId: string;
    readonly date: Date;
    readonly update: string;
    readonly status: string;
    readonly updatedBy: string;
    readonly blockers?: string[];
    readonly assistance?: string[];
}
/**
 * Participant feedback
 */
export interface ParticipantFeedback {
    readonly participantId: string;
    readonly overallRating: number;
    readonly contentRating: number;
    readonly facilitation_rating: number;
    readonly paceRating: number;
    readonly engagementRating: number;
    readonly valueRating: number;
    readonly comments: string;
    readonly suggestions: string[];
    readonly likedMost: string;
    readonly likedLeast: string;
    readonly wouldRecommend: boolean;
}
/**
 * Event metrics
 */
export interface EventMetrics {
    readonly attendance: AttendanceMetrics;
    readonly engagement: EngagementMetrics;
    readonly effectiveness: EffectivenessMetrics;
    readonly efficiency: EfficiencyMetrics;
    readonly satisfaction: SatisfactionMetrics;
    readonly technology: TechnologyMetrics;
    readonly costMetrics: CostMetrics;
}
/**
 * Attendance metrics
 */
export interface AttendanceMetrics {
    readonly invited: number;
    readonly registered: number;
    readonly attended: number;
    readonly attendanceRate: number;
    readonly punctualityRate: number;
    readonly completionRate: number;
    readonly noshowRate: number;
    readonly dropoutRate: number;
}
/**
 * Engagement metrics
 */
export interface EngagementMetrics {
    readonly participationRate: number;
    readonly interactionCount: number;
    readonly questionsAsked: number;
    readonly contributionsShared: number;
    readonly averageEngagementScore: number;
    readonly passiveParticipants: number;
    readonly activeParticipants: number;
}
/**
 * Effectiveness metrics
 */
export interface EffectivenessMetrics {
    readonly objectivesAchieved: number;
    readonly totalObjectives: number;
    readonly achievementRate: number;
    readonly deliverablesCompleted: number;
    readonly totalDeliverables: number;
    readonly deliverableCompletionRate: number;
    readonly decisionsMade: number;
    readonly actionItemsGenerated: number;
}
/**
 * Efficiency metrics
 */
export interface EfficiencyMetrics {
    readonly plannedDuration: number;
    readonly actualDuration: number;
    readonly efficiencyRatio: number;
    readonly timePerObjective: number;
    readonly overrunTime: number;
    readonly utilizationRate: number;
    readonly facilitationEfficiency: number;
}
/**
 * Satisfaction metrics
 */
export interface SatisfactionMetrics {
    readonly averageOverallRating: number;
    readonly averageContentRating: number;
    readonly averageFacilitationRating: number;
    readonly averageValueRating: number;
    readonly satisfactionDistribution: Record<number, number>;
    readonly npsScore: number;
    readonly recommendationRate: number;
}
/**
 * Technology metrics
 */
export interface TechnologyMetrics {
    readonly platformReliability: number;
    readonly audioQuality: number;
    readonly videoQuality: number;
    readonly connectionStability: number;
    readonly technicalIssues: number;
    readonly issueResolutionTime: number;
    readonly backupUsage: number;
}
/**
 * Cost metrics
 */
export interface CostMetrics {
    readonly totalCost: number;
    readonly costPerParticipant: number;
    readonly technologyCosts: number;
    readonly facilitationCosts: number;
    readonly opportunityCost: number;
    readonly costPerObjective: number;
    readonly roi: number;
}
/**
 * SAFe Events Manager state
 */
export interface SAFeEventsManagerState {
    readonly eventConfigurations: Map<SAFeEventType, SAFeEventConfig>;
    readonly scheduledEvents: Map<string, EventExecutionContext>;
    readonly eventHistory: Map<string, EventOutcome>;
    readonly eventTemplates: Map<SAFeEventType, SAFeEventConfig>;
    readonly participantRegistry: Map<string, EventParticipant>;
    readonly eventMetrics: Map<string, EventMetrics>;
    readonly recurringEventSchedules: Map<string, RecurringEventSchedule>;
    readonly eventDependencies: Map<string, string[]>;
    readonly lastEventSync: Date;
}
/**
 * Recurring event schedule
 */
export interface RecurringEventSchedule {
    readonly scheduleId: string;
    readonly eventType: SAFeEventType;
    readonly pattern: EventSchedulingPattern;
    readonly nextExecution: Date;
    readonly lastExecution?: Date;
    readonly instanceCount: number;
    readonly active: boolean;
}
/**
 * SAFe Events Manager - SAFe events and ceremonies orchestration
 */
export declare class SAFeEventsManager extends EventEmitter {
    private readonly logger;
    private readonly eventBus;
    private readonly memory;
    private readonly gatesManager;
    private readonly piManager;
    private readonly valueStreamMapper;
    private readonly portfolioManager;
    private readonly config;
    private state;
    private schedulingTimer?;
    private reminderTimer?;
    private metricsTimer?;
    constructor(eventBus: TypeSafeEventBus, memory: MemorySystem, gatesManager: WorkflowGatesManager, piManager: ProgramIncrementManager, valueStreamMapper: ValueStreamMapper, portfolioManager: PortfolioManager, config?: Partial<SAFeEventsManagerConfig>);
    /**
     * Initialize the SAFe Events Manager
     */
    initialize(): Promise<void>;
    /**
     * Shutdown the SAFe Events Manager
     */
    shutdown(): Promise<void>;
    /**
     * Schedule and execute System Demos
     */
    scheduleSystemDemo(artId: string, iterationNumber: number, features: Feature[], stakeholders: string[]): Promise<string>;
    /**
     * Execute System Demo with feature presentations
     */
    executeSystemDemo(eventId: string): Promise<EventOutcome>;
    /**
     * Schedule and execute Inspect & Adapt workshops
     */
    scheduleInspectAndAdaptWorkshop(artId: string, piId: string, piMetrics: any, retrospectiveData: any[]): Promise<string>;
    /**
     * Execute Inspect & Adapt workshop with problem-solving
     */
    executeInspectAndAdaptWorkshop(eventId: string): Promise<EventOutcome>;
    /**
     * Schedule regular ART sync meetings
     */
    scheduleARTSyncMeeting(artId: string, teams: ARTTeam[], impediments: any[], dependencies: any[]): Promise<string>;
    /**
     * Execute ART sync meeting with coordination activities
     */
    executeARTSyncMeeting(eventId: string): Promise<EventOutcome>;
    private initializeState;
    private loadPersistedState;
    private persistState;
    private initializeEventTemplates;
    private scheduleRecurringEvents;
    private startEventScheduling;
    private startReminderService;
    private startMetricsCollection;
    private registerEventHandlers;
    private createEventTemplate;
    private scheduleSystemDemoRecurrence;
    private scheduleARTSyncRecurrence;
    private scheduleInspectAndAdaptRecurrence;
    private processEventScheduling;
    private sendEventReminders;
    private collectAllEventMetrics;
    private gracefulEventShutdown;
    private createSystemDemoConfiguration;
    private scheduleEvent;
    private setupSystemDemoPreparation;
    private createSystemDemoAGUIGates;
    private startEventExecution;
    private completeEventExecution;
    private getEventConfiguration;
    private executeSystemDemoAgendaItem;
    private processSystemDemoGate;
    private createFailedDemoActionItem;
    private collectSystemDemoFeedback;
    private calculateEventMetrics;
    private generateSystemDemoDeliverables;
    private extractDemoLessonsLearned;
    private identifyDemoImprovements;
    private generateDemoNextSteps;
    private createInspectAndAdaptConfiguration;
    private setupInspectAndAdaptPreparation;
    private createInspectAndAdaptAGUIGates;
    private executeInspectPhase;
    private executeAdaptPhase;
    private generateIAObjectiveOutcomes;
    private captureIADecisions;
    private generateIAActionItems;
    private collectWorkshopFeedback;
    private generateIADeliverables;
    private extractIALessonsLearned;
    private identifyIAImprovements;
    private generateIANextSteps;
    private createARTSyncConfiguration;
    private setupARTSyncPreparation;
    private collectTeamStatusUpdates;
    private facilitateImpedimentDiscussion;
    private coordinateDependencies;
    private reviewARTRisks;
    private generateSyncActionItems;
    private captureSyncDecisions;
    private collectSyncFeedback;
    private generateSyncObjectiveOutcomes;
    private generateSyncDeliverables;
    private extractSyncLessonsLearned;
    private identifySyncImprovements;
    private generateSyncNextSteps;
    private handlePIStart;
    private handleIterationCompletion;
    private handleFeatureDemoReady;
}
export default SAFeEventsManager;
export type { SAFeEventsManagerConfig, SAFeEventConfig, EventSchedulingPattern, EventParticipant, EventAgendaItem, EventExecutionContext, EventOutcome, EventMetrics, SAFeEventsManagerState, };
//# sourceMappingURL=safe-events-manager.d.ts.map