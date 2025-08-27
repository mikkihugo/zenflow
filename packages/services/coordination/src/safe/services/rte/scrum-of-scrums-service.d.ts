/**
 * @fileoverview Scrum of Scrums Coordination Service
 *
 * Service for coordinating Scrum of Scrums meetings and cross-team collaboration.
 * Handles impediment tracking, dependency coordination, and team synchronization.
 *
 * SINGLE RESPONSIBILITY: Scrum of Scrums coordination and impediment management
 * FOCUSES ON: Cross-team synchronization, impediment removal, dependency coordination
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { ARTTeam, Dependency, Logger, Risk } from '../../types';
/**
 * Scrum of Scrums meeting configuration
 */
export interface ScrumOfScrumsConfig {
    readonly id: string;
    readonly artId: string;
    readonly frequency: 'daily|twice-weekly|weekly;;
    readonly duration: number;
    readonly participants: ScrumOfScrumsParticipant[];
    readonly agenda: ScrumOfScrumsAgenda;
    readonly impedimentTracking: boolean;
    readonly dependencyCoordination: boolean;
    readonly riskEscalation: boolean;
}
/**
 * Scrum of Scrums participant
 */
export interface ScrumOfScrumsParticipant {
    readonly teamId: string;
    readonly teamName: string;
    readonly representative: string;
    readonly role: 'scrum-master|product-owner|team-lead;;
    readonly backupRepresentative?: string;
    readonly participationHistory: ParticipationRecord[];
}
/**
 * Participation tracking
 */
export interface ParticipationRecord {
    readonly date: Date;
    readonly attended: boolean;
    readonly contributions: string[];
    readonly impedimentsReported: number;
    readonly dependenciesDiscussed: number;
    readonly actionItemsCommitted: number;
}
/**
 * Scrum of Scrums agenda
 */
export interface ScrumOfScrumsAgenda {
    readonly standardQuestions: ScrumOfScrumsQuestion[];
    readonly impedimentReview: boolean;
    readonly dependencyCoordination: boolean;
    readonly riskDiscussion: boolean;
    readonly programUpdates: boolean;
    readonly actionItemReview: boolean;
    readonly customItems: AgendaCustomItem[];
}
/**
 * Standard Scrum of Scrums questions
 */
export interface ScrumOfScrumsQuestion {
    readonly question: string;
    readonly purpose: string;
    readonly timeAllocation: number;
    readonly facilitation: 'round-robin|open-discussion|focused;;
}
/**
 * Custom agenda item
 */
export interface AgendaCustomItem {
    readonly item: string;
    readonly owner: string;
    readonly duration: number;
    readonly frequency: 'weekly|bi-weekly|monthly;;
}
/**
 * Program impediment tracking
 */
export interface ProgramImpediment {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly reportedBy: string;
    readonly reportedDate: Date;
    readonly category: ImpedimentCategory;
    readonly severity: ImpedimentSeverity;
    readonly status: ImpedimentStatus;
    readonly affectedTeams: string[];
    readonly impact: string;
    readonly escalationLevel: ImpedimentEscalationLevel;
    readonly resolution?: ImpedimentResolution;
    readonly assignedTo?: string;
    readonly targetDate?: Date;
    readonly actualResolutionDate?: Date;
}
/**
 * Impediment categories
 */
export declare enum ImpedimentCategory {
    TECHNICAL = "technical",
    PROCESS = "process",
    RESOURCE = "resource",
    DEPENDENCY = "dependency",
    EXTERNAL = "external",
    ORGANIZATIONAL = "organizational"
}
/**
 * Impediment severity levels
 */
export declare enum ImpedimentSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Impediment status tracking
 */
export declare enum ImpedimentStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    ESCALATED = "escalated",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
/**
 * Impediment escalation levels
 */
export declare enum ImpedimentEscalationLevel {
    TEAM = "team",
    ART = "art",
    PROGRAM = "program",
    PORTFOLIO = "portfolio"
}
/**
 * Impediment resolution details
 */
export interface ImpedimentResolution {
    readonly resolutionDescription: string;
    readonly resolvedBy: string;
    readonly resolutionDate: Date;
    readonly effortRequired: number;
    readonly preventionMeasures: string[];
    readonly lessonsLearned: string[];
}
/**
 * Scrum of Scrums meeting result
 */
export interface ScrumOfScrumsResult {
    readonly meetingId: string;
    readonly date: Date;
    readonly attendance: AttendanceRecord[];
    readonly impedimentsDiscussed: ProgramImpediment[];
    readonly dependenciesCoordinated: Dependency[];
    readonly risksEscalated: Risk[];
    readonly actionItems: ScrumActionItem[];
    readonly meetingEffectiveness: MeetingEffectiveness;
    readonly outcomes: string[];
}
/**
 * Meeting attendance tracking
 */
export interface AttendanceRecord {
    readonly participantId: string;
    readonly attended: boolean;
    readonly late: boolean;
    readonly earlyLeave: boolean;
    readonly contributionLevel: 'high' | 'medium' | 'low';
}
/**
 * Scrum of Scrums action item
 */
export interface ScrumActionItem {
    readonly id: string;
    readonly description: string;
    readonly owner: string;
    readonly dueDate: Date;
    readonly priority: 'high' | 'medium' | 'low';
    readonly status: 'open' | 'in_progress' | 'completed';
    readonly relatedImpediment?: string;
}
/**
 * Meeting effectiveness metrics
 */
export interface MeetingEffectiveness {
    readonly timeboxCompliance: number;
    readonly participationLevel: number;
    readonly actionItemsGenerated: number;
    readonly impedimentsProgressed: number;
    readonly dependenciesResolved: number;
    readonly overallEffectiveness: number;
}
/**
 * Scrum of Scrums Coordination Service
 */
export declare class ScrumOfScrumsService {
    private readonly logger;
    private configurations;
    private meetingResults;
    constructor(logger: Logger);
    /**
     * Configure Scrum of Scrums for ART
     */
    configureScrumsOfScrums(artId: string, config: {
        frequency: 'daily|twice-weekly|weekly;;
        duration: number;
        teams: ARTTeam[];
    }): Promise<ScrumOfScrumsConfig>;
}
//# sourceMappingURL=scrum-of-scrums-service.d.ts.map