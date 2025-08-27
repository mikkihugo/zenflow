/**
 * @fileoverview SAFe Events Manager - Comprehensive SAFe ceremony orchestration.
 *
 * Provides enterprise-grade SAFe events and ceremonies management through specialized
 * event scheduling, workflow coordination, and human-facilitated ceremonies.
 *
 * Key Features:
 * - SAFe event scheduling and orchestration (System Demos, I&A workshops)
 * - ART sync meeting coordination
 * - Program Increment event management
 * - Cross-ART coordination events
 * - Event metrics and retrospective analysis
 * - Human-facilitated ceremony integration
 *
 * Part of the @claude-zen/safe-framework package providing comprehensive
 * Scaled Agile Framework (SAFe) integration capabilities.
 */
import { EventBus } from '@claude-zen/foundation';
import type { Feature, MemorySystem, TypeSafeEventBus } from '../types';
export interface SAFeEventsManagerConfig {
    enableSystemDemos: boolean;
    enableInspectAdapt: boolean;
    enableARTSync: boolean;
    enableCrossARTCoordination: boolean;
    enableEventMetrics: boolean;
    enableAGUIIntegration: boolean;
    defaultEventDuration: number;
    maxParticipants: number;
    eventTimeBuffer: number;
    facilitationTimeout: number;
}
export interface SAFeEventConfig {
    id: string;
    type: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin';
}
export interface EventParticipant {
    id: string;
    name: string;
    role: string;
    team: string;
    required: boolean;
    facilitator: boolean;
}
export interface EventAgendaItem {
    id: string;
    title: string;
    duration: number;
    type: 'presentation|discussion|workshop|demo|retrospective;;
    facilitator?: string;
    materials?: string[];
    objectives: string[];
}
export interface EventSchedulingPattern {
    type: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin';
}
export interface EventExecutionContext {
    eventId: string;
    piId: string;
    iterationId?: string;
    artId: string;
    facilitation: {
        facilitatorId: string;
        assistants: string[];
        enableRecording: boolean;
        enableTranscription: boolean;
    };
    logistics: {
        location: string;
        virtualMeeting?: string;
        materials: string[];
        equipment: string[];
    };
}
export interface EventOutcome {
    eventId: string;
    status: 'completed|cancelled|postponed|partial;;
    duration: number;
    attendance: {
        expected: number;
        actual: number;
        participants: EventParticipant[];
    };
    decisions: EventDecision[];
    actionItems: ActionItem[];
    feedback: ParticipantFeedback[];
    metrics: EventMetrics;
    artifacts: string[];
}
export interface EventDecision {
    id: string;
    title: string;
    description: string;
    decisionMaker: string;
    participants: string[];
    rationale: string;
    impact: 'low|medium|high|critical;;
    implementationDate?: Date;
    responsible: string[];
}
export interface ActionItem {
    id: string;
    title: string;
    description: string;
    assignee: string;
    dueDate: Date;
    priority: 'low|medium|high|critical;;
    status: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin';
    dependencies: string[];
}
export interface ParticipantFeedback {
    participantId: string;
    rating: number;
    effectiveness: number;
    engagement: number;
    value: number;
    comments: string;
    improvements: string[];
}
export interface EventMetrics {
    duration: number;
    attendanceRate: number;
    engagementScore: number;
    effectivenessRating: number;
    decisionsCount: number;
    actionItemsCount: number;
    followUpRate: number;
}
/**
 * SAFe Events Manager - Comprehensive SAFe ceremony orchestration.
 *
 * Manages all SAFe events and ceremonies including System Demos, Inspect & Adapt
 * workshops, ART synchronization meetings, and cross-ART coordination events.
 *
 * @example Basic usage
 * ```typescript`
 * const eventsManager = new SAFeEventsManager(memory, eventBus, config);
 * await eventsManager.initialize();
 * const demo = await eventsManager.scheduleSystemDemo(piId, features);
 * ````
 */
export declare class SAFeEventsManager extends EventBus {
    private logger;
    private memory;
    private eventBus;
    private scheduledEvents;
    private eventOutcomes;
    private eventTemplates;
    private initialized;
    constructor(_memory: MemorySystem, eventBus: TypeSafeEventBus, config?: Partial<SAFeEventsManagerConfig>);
    /**
     * Initialize the SAFe Events Manager
     */
    initialize(): Promise<void>;
    /**
     * Schedule System Demo
     */
    scheduleSystemDemo(piId: string, features: Feature[], iterationId?: string): Promise<{
        success: boolean;
        eventId?: string;
        error?: string;
    }>;
    /**
     * Schedule Inspect & Adapt Workshop
     */
    scheduleInspectAdaptWorkshop(piId: string, artId: string, _retrospectiveData: any): Promise<{
        success: boolean;
        eventId?: string;
        error?: string;
    }>;
    /**
     * Execute event with outcomes tracking
     */
    executeEvent(eventId: string, _context: EventExecutionContext): Promise<{
        success: boolean;
        outcome?: EventOutcome;
        error?: string;
    }>;
    /**
     * Initialize event bus connections for production
     */
    private initializeEventBusConnections;
    /**
     * Cleanup resources
     */
    shutdown(): void;
}
export default SAFeEventsManager;
//# sourceMappingURL=safe-events-manager.d.ts.map