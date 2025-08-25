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

import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
  groupBy,
  map,
  filter,
  orderBy,
  sumBy,
  meanBy,
  countBy,
} from 'lodash-es';
import type { ARTTeam, Dependency, Risk, Logger } from '../../types';

/**
 * Scrum of Scrums meeting configuration
 */
export interface ScrumOfScrumsConfig {
  readonly id: string;
  readonly artId: string;
  readonly frequency: 'daily|twice-weekly|weekly';
  readonly duration: number; // minutes
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
  readonly role: 'scrum-master|product-owner|team-lead';
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
  readonly timeAllocation: number; // minutes
  readonly facilitation: 'round-robin|open-discussion|focused';
}

/**
 * Custom agenda item
 */
export interface AgendaCustomItem {
  readonly item: string;
  readonly owner: string;
  readonly duration: number;
  readonly frequency: 'weekly|bi-weekly|monthly';
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
export enum ImpedimentCategory {
  TECHNICAL = 'technical',
  PROCESS = 'process',
  RESOURCE = 'resource',
  DEPENDENCY = 'dependency',
  EXTERNAL = 'external',
  ORGANIZATIONAL = 'organizational',
}

/**
 * Impediment severity levels
 */
export enum ImpedimentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Impediment status tracking
 */
export enum ImpedimentStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

/**
 * Impediment escalation levels
 */
export enum ImpedimentEscalationLevel {
  TEAM = 'team',
  ART = 'art',
  PROGRAM = 'program',
  PORTFOLIO = 'portfolio',
}

/**
 * Impediment resolution details
 */
export interface ImpedimentResolution {
  readonly resolutionDescription: string;
  readonly resolvedBy: string;
  readonly resolutionDate: Date;
  readonly effortRequired: number; // hours
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
  readonly contributionLevel: 'high|medium|low';
}

/**
 * Scrum of Scrums action item
 */
export interface ScrumActionItem {
  readonly id: string;
  readonly description: string;
  readonly owner: string;
  readonly dueDate: Date;
  readonly priority: 'high|medium|low';
  readonly status: 'open|in_progress|completed';
  readonly relatedImpediment?: string;
}

/**
 * Meeting effectiveness metrics
 */
export interface MeetingEffectiveness {
  readonly timeboxCompliance: number; // 0-100%
  readonly participationLevel: number; // 0-100%
  readonly actionItemsGenerated: number;
  readonly impedimentsProgressed: number;
  readonly dependenciesResolved: number;
  readonly overallEffectiveness: number; // 0-100%
}

/**
 * Scrum of Scrums Coordination Service
 */
export class ScrumOfScrumsService {
  private readonly logger: Logger;
  private configurations = new Map<string, ScrumOfScrumsConfig>();
  private impediments = new Map<string, ProgramImpediment>();
  private meetingResults = new Map<string, ScrumOfScrumsResult>();

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Configure Scrum of Scrums for ART
   */
  async configureScrumsOfScrums(
    artId: string,
    config: {
      frequency: 'daily|twice-weekly|weekly';
      duration: number;
      teams: ARTTeam[];
    }
  ): Promise<ScrumOfScrumsConfig> {
    this.logger.info('Configuring Scrum of Scrums', {
      artId,
      frequency: config.frequency,
    });

    const participants = this.generateParticipants(config.teams);
    const agenda = this.generateStandardAgenda();

    const scrumConfig: ScrumOfScrumsConfig = {
      id: `sos-${nanoid(12)}`,
      artId,
      frequency: config.frequency,
      duration: config.duration,
      participants,
      agenda,
      impedimentTracking: true,
      dependencyCoordination: true,
      riskEscalation: true,
    };

    this.configurations.set(artId, scrumConfig);

    this.logger.info('Scrum of Scrums configured', {
      configId: scrumConfig.id,
      participantCount: participants.length,
    });

    return scrumConfig;
  }

  /**
   * Conduct Scrum of Scrums meeting
   */
  async conductMeeting(artId: string): Promise<ScrumOfScrumsResult> {
    const config = this.configurations.get(artId);
    if (!config) {
      throw new Error(`Scrum of Scrums not configured for ART: ${artId}`);
    }

    this.logger.info('Conducting Scrum of Scrums meeting', { artId });

    const meetingId = `sos-meeting-${nanoid(12)}`;
    const attendance = this.generateAttendance(config.participants);

    const result: ScrumOfScrumsResult = {
      meetingId,
      date: new Date(),
      attendance,
      impedimentsDiscussed: this.getActiveImpediments(artId),
      dependenciesCoordinated: [],
      risksEscalated: [],
      actionItems: this.generateActionItems(),
      meetingEffectiveness: this.calculateEffectiveness(attendance),
      outcomes: [
        'Team synchronization achieved',
        'Impediments identified',
        'Dependencies coordinated',
      ],
    };

    this.meetingResults.set(meetingId, result);

    this.logger.info('Scrum of Scrums meeting completed', {
      meetingId,
      impedimentsDiscussed: result.impedimentsDiscussed.length,
      effectiveness: result.meetingEffectiveness.overallEffectiveness,
    });

    return result;
  }

  /**
   * Track program impediment
   */
  async trackImpediment(impediment: {
    title: string;
    description: string;
    reportedBy: string;
    category: ImpedimentCategory;
    severity: ImpedimentSeverity;
    affectedTeams: string[];
    impact: string;
  }): Promise<ProgramImpediment> {
    const impedimentId = `imp-${nanoid(12)}`;

    const programImpediment: ProgramImpediment = {
      id: impedimentId,
      title: impediment.title,
      description: impediment.description,
      reportedBy: impediment.reportedBy,
      reportedDate: new Date(),
      category: impediment.category,
      severity: impediment.severity,
      status: ImpedimentStatus.OPEN,
      affectedTeams: impediment.affectedTeams,
      impact: impediment.impact,
      escalationLevel: this.determineEscalationLevel(impediment.severity),
    };

    this.impediments.set(impedimentId, programImpediment);

    this.logger.info('Program impediment tracked', {
      impedimentId,
      severity: impediment.severity,
      affectedTeams: impediment.affectedTeams.length,
    });

    return programImpediment;
  }

  /**
   * Escalate impediment
   */
  async escalateImpediment(
    impedimentId: string,
    escalationLevel: ImpedimentEscalationLevel
  ): Promise<void> {
    const impediment = this.impediments.get(impedimentId);
    if (!impediment) {
      throw new Error(`Impediment not found: ${impedimentId}`);
    }

    const escalatedImpediment = {
      ...impediment,
      escalationLevel,
      status: ImpedimentStatus.ESCALATED,
    };

    this.impediments.set(impedimentId, escalatedImpediment);

    this.logger.info('Impediment escalated', {
      impedimentId,
      newLevel: escalationLevel,
      severity: impediment.severity,
    });
  }

  /**
   * Resolve impediment
   */
  async resolveImpediment(
    impedimentId: string,
    resolution: ImpedimentResolution
  ): Promise<void> {
    const impediment = this.impediments.get(impedimentId);
    if (!impediment) {
      throw new Error(`Impediment not found: ${impedimentId}`);
    }

    const resolvedImpediment = {
      ...impediment,
      status: ImpedimentStatus.RESOLVED,
      resolution,
      actualResolutionDate: new Date(),
    };

    this.impediments.set(impedimentId, resolvedImpediment);

    this.logger.info('Impediment resolved', {
      impedimentId,
      resolutionDate: resolution.resolutionDate,
      resolvedBy: resolution.resolvedBy,
    });
  }

  /**
   * Generate participants from teams
   */
  private generateParticipants(teams: ARTTeam[]): ScrumOfScrumsParticipant[] {
    return map(teams, (team) => ({
      teamId: team.id,
      teamName: team.name,
      representative: 'Scrum Master', // Simplified
      role: 'scrum-master' as const,
      participationHistory: [],
    }));
  }

  /**
   * Generate standard Scrum of Scrums agenda
   */
  private generateStandardAgenda(): ScrumOfScrumsAgenda {
    const standardQuestions: ScrumOfScrumsQuestion[] = [
      {
        question: 'What has your team accomplished since last meeting?',
        purpose: 'Share progress and achievements',
        timeAllocation: 2,
        facilitation: 'round-robin',
      },
      {
        question: 'What will your team accomplish before next meeting?',
        purpose: 'Share upcoming work and commitments',
        timeAllocation: 2,
        facilitation: 'round-robin',
      },
      {
        question: 'What impediments or blockers is your team facing?',
        purpose: 'Identify and address obstacles',
        timeAllocation: 3,
        facilitation: 'focused',
      },
      {
        question: 'What work might impact or depend on other teams?',
        purpose: 'Coordinate dependencies and integration',
        timeAllocation: 3,
        facilitation: 'open-discussion',
      },
    ];

    return {
      standardQuestions,
      impedimentReview: true,
      dependencyCoordination: true,
      riskDiscussion: true,
      programUpdates: true,
      actionItemReview: true,
      customItems: [],
    };
  }

  /**
   * Get active impediments for ART
   */
  private getActiveImpediments(artId: string): ProgramImpediment[] {
    return filter(
      Array.from(this.impediments.values()),
      (imp) =>
        imp.status === ImpedimentStatus.OPEN || imp.status === ImpedimentStatus.IN_PROGRESS
    );
  }

  /**
   * Generate meeting action items
   */
  private generateActionItems(): ScrumActionItem[] {
    return [
      {
        id: `action-${nanoid(8)}`,
        description:'Follow up on team dependencies',
        owner: 'RTE',
        dueDate: addDays(new Date(), 2),
        priority: 'high',
        status: 'open',
      },
    ];
  }

  /**
   * Calculate meeting effectiveness
   */
  private calculateEffectiveness(
    attendance: AttendanceRecord[]
  ): MeetingEffectiveness {
    const attendanceRate =
      (filter(attendance, (a) => a.attended).length / attendance.length) * 100;
    const participationLevel = meanBy(attendance, (a) =>
      a.contributionLevel === 'high'
        ? 100
        : a.contributionLevel === 'medium'
          ? 60
          : 30
    );

    return {
      timeboxCompliance: 85,
      participationLevel,
      actionItemsGenerated: 3,
      impedimentsProgressed: 2,
      dependenciesResolved: 1,
      overallEffectiveness: (attendanceRate + participationLevel) / 2,
    };
  }

  /**
   * Generate attendance records
   */
  private generateAttendance(
    participants: ScrumOfScrumsParticipant[]
  ): AttendanceRecord[] {
    return map(participants, (p) => ({
      participantId: p.teamId,
      attended: true,
      late: false,
      earlyLeave: false,
      contributionLevel: 'medium' as const,
    }));
  }

  /**
   * Determine escalation level based on severity
   */
  private determineEscalationLevel(
    severity: ImpedimentSeverity
  ): ImpedimentEscalationLevel {
    switch (severity) {
      case ImpedimentSeverity.CRITICAL:
        return ImpedimentEscalationLevel.PROGRAM;
      case ImpedimentSeverity.HIGH:
        return ImpedimentEscalationLevel.ART;
      default:
        return ImpedimentEscalationLevel.TEAM;
    }
  }

  /**
   * Get impediment by ID
   */
  getImpediment(impedimentId: string): ProgramImpediment | undefined {
    return this.impediments.get(impedimentId);
  }

  /**
   * Get meeting results
   */
  getMeetingResults(meetingId: string): ScrumOfScrumsResult | undefined {
    return this.meetingResults.get(meetingId);
  }

  /**
   * Get all impediments for ART
   */
  getARTImpediments(artId: string): ProgramImpediment[] {
    return Array.from(this.impediments.values())();
  }
}
