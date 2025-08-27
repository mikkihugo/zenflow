/**
 * @fileoverview PI Planning Facilitation Service
 *
 * Service for facilitating Program Increment (PI) planning events.
 * Handles planning event coordination, participant management, and facilitation workflows.
 *
 * SINGLE RESPONSIBILITY: PI planning event facilitation and coordination
 * FOCUSES ON: Event planning, participant coordination, facilitation workflows
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Dependency, Feature, Logger, PIObjective, Risk } from '../../types';
/**
 * PI Planning event configuration
 */
export interface PIPlanningEventConfig {
    readonly eventId: string;
    readonly piId: string;
    readonly artId: string;
    readonly duration: number;
    readonly venue: string;
    readonly facilitators: string[];
    readonly participants: PlanningParticipant[];
    readonly agenda: PlanningAgenda;
    readonly objectives: PIObjective[];
    readonly features: Feature[];
    readonly dependencies: Dependency[];
    readonly risks: Risk[];
}
/**
 * Planning participant information
 */
export interface PlanningParticipant {
    readonly id: string;
    readonly name: string;
    readonly role: product;
}
/**
 * Planning agenda structure
 */
export interface PlanningAgenda {
    readonly day1: AgendaItem[];
    readonly day2: AgendaItem[];
    readonly breakSchedule: BreakSchedule;
    readonly timeboxes: Timebox[];
}
/**
 * Agenda item definition
 */
export interface AgendaItem {
    readonly id: string;
    readonly title: string;
    readonly duration: number;
    readonly facilitator: string;
    readonly participants: string[];
    readonly objectives: string[];
    readonly deliverables: string[];
}
/**
 * Break schedule for planning events
 */
export interface BreakSchedule {
    readonly morningBreak: number;
    readonly lunch: number;
    readonly afternoonBreak: number;
    readonly dayEndTime: number;
}
/**
 * Timebox definition for activities
 */
export interface Timebox {
    readonly activity: string;
    readonly duration: number;
    readonly enforced: boolean;
    readonly warningTime: number;
}
/**
 * Planning facilitation result
 */
export interface PlanningFacilitationResult {
    readonly success: boolean;
    readonly objectivesCommitted: PIObjective[];
    readonly featuresPlanned: Feature[];
    readonly dependenciesIdentified: Dependency[];
    readonly risksIdentified: Risk[];
    readonly teamCommitments: TeamCommitment[];
    readonly facilitation: FacilitationMetrics;
    readonly outcomes: string[];
    readonly actionItems: ActionItem[];
}
/**
 * Team commitment tracking
 */
export interface TeamCommitment {
    readonly teamId: string;
    readonly capacity: number;
    readonly objectives: string[];
    readonly features: string[];
    readonly confidence: number;
    readonly risks: string[];
    readonly dependencies: string[];
}
/**
 * Facilitation effectiveness metrics
 */
export interface FacilitationMetrics {
    readonly participationRate: number;
    readonly timeboxCompliance: number;
    readonly consensusLevel: number;
    readonly energyLevel: number;
    readonly satisfactionScore: number;
}
/**
 * Action item from planning sessions
 */
export interface ActionItem {
    readonly id: string;
    readonly description: string;
    readonly owner: string;
    readonly dueDate: Date;
    readonly priority: 'high' | 'medium' | 'low';
    readonly status: 'open' | 'in_progress' | 'completed';
}
/**
 * PI Planning Facilitation Service for coordinating Program Increment planning events
 */
export declare class PIPlanningFacilitationService {
    private readonly logger;
    constructor(logger: Logger);
    /**
     * Create PI planning event configuration
     */
    createPlanningEvent(input: {
        piId: string;
        artId: string;
        duration: number;
        venue: string;
        facilitators: string[];
        objectives: PIObjective[];
        features: Feature[];
    }): Promise<PIPlanningEventConfig>;
}
//# sourceMappingURL=pi-planning-facilitation-service.d.ts.map