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
import { dateFns, generateNanoId, } from '@claude-zen/foundation';
const { format, addDays, startOfWeek, endOfWeek } = dateFns;
/**
 * Impediment categories
 */
export var ImpedimentCategory;
(function (ImpedimentCategory) {
    ImpedimentCategory["TECHNICAL"] = "technical";
    ImpedimentCategory["PROCESS"] = "process";
    ImpedimentCategory["RESOURCE"] = "resource";
    ImpedimentCategory["DEPENDENCY"] = "dependency";
    ImpedimentCategory["EXTERNAL"] = "external";
    ImpedimentCategory["ORGANIZATIONAL"] = "organizational";
})(ImpedimentCategory || (ImpedimentCategory = {}));
/**
 * Impediment severity levels
 */
export var ImpedimentSeverity;
(function (ImpedimentSeverity) {
    ImpedimentSeverity["LOW"] = "low";
    ImpedimentSeverity["MEDIUM"] = "medium";
    ImpedimentSeverity["HIGH"] = "high";
    ImpedimentSeverity["CRITICAL"] = "critical";
})(ImpedimentSeverity || (ImpedimentSeverity = {}));
/**
 * Impediment status tracking
 */
export var ImpedimentStatus;
(function (ImpedimentStatus) {
    ImpedimentStatus["OPEN"] = "open";
    ImpedimentStatus["IN_PROGRESS"] = "in_progress";
    ImpedimentStatus["ESCALATED"] = "escalated";
    ImpedimentStatus["RESOLVED"] = "resolved";
    ImpedimentStatus["CLOSED"] = "closed";
})(ImpedimentStatus || (ImpedimentStatus = {}));
/**
 * Impediment escalation levels
 */
export var ImpedimentEscalationLevel;
(function (ImpedimentEscalationLevel) {
    ImpedimentEscalationLevel["TEAM"] = "team";
    ImpedimentEscalationLevel["ART"] = "art";
    ImpedimentEscalationLevel["PROGRAM"] = "program";
    ImpedimentEscalationLevel["PORTFOLIO"] = "portfolio";
})(ImpedimentEscalationLevel || (ImpedimentEscalationLevel = {}));
/**
 * Scrum of Scrums Coordination Service
 */
export class ScrumOfScrumsService {
    logger;
    configurations = new Map();
    meetingResults = new Map();
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Configure Scrum of Scrums for ART
     */
    async configureScrumsOfScrums(artId, config) {
        this.logger.info('Configuring Scrum of Scrums', { ': artId,
            frequency: config.frequency,
        });
        const participants = this.generateParticipants(config.teams);
        const agenda = this.generateStandardAgenda();
        const scrumConfig = {
            id: `sos-${generateNanoId(12)}`,
        } `
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

    this.logger.info('Scrum of Scrums configured', {'
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
      throw new Error(`, Scrum;
        of;
        Scrums;
        not;
        configured;
        for (ART; ; )
            : $;
        {
            artId;
        }
        `);`;
    }
}
this.logger.info('Conducting Scrum of Scrums meeting', { artId });
';
const meetingId = `sos-meeting-$generateNanoId(12)`;
`
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

    this.logger.info('Scrum of Scrums meeting completed', {'
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
  }): Promise<_ProgramImpediment> {
    const _impedimentId = `;
imp - $;
{
    generateNanoId(12);
}
`;`;
const programImpediment = {
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
this.logger.info('Program impediment tracked', { ': impedimentId,
    severity: impediment.severity,
    affectedTeams: impediment.affectedTeams.length,
});
return programImpediment;
/**
 * Escalate impediment
 */
async;
escalateImpediment(impedimentId, string, escalationLevel, ImpedimentEscalationLevel);
Promise < void  > {
    const: impediment = this.impediments.get(impedimentId),
    if(, impediment) {
        throw new Error(`Impediment not found: $_impedimentId`);
        `
    }

    const escalatedImpediment = {
      ...impediment,
      escalationLevel,
      status: ImpedimentStatus.ESCALATED,
    };

    this.impediments.set(impedimentId, escalatedImpediment);

    this.logger.info('Impediment escalated', {'
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
      throw new Error(`;
        Impediment;
        not;
        found: $;
        {
            impedimentId;
        }
        `);`;
    },
    const: resolvedImpediment = {
        ...impediment,
        status: ImpedimentStatus.RESOLVED,
        resolution,
        actualResolutionDate: new Date(),
    },
    this: .impediments.set(impedimentId, resolvedImpediment),
    this: .logger.info('Impediment resolved', { ': impedimentId,
        resolutionDate: resolution.resolutionDate,
        resolvedBy: resolution.resolvedBy,
    })
};
generateParticipants(teams, ARTTeam[]);
ScrumOfScrumsParticipant[];
{
    return map(teams, (team) => ({
        teamId: team.id,
        teamName: team.name,
        representative: 'Scrum Master', // Simplified'
        role: 'scrum-master',
        participationHistory: [],
    }));
}
generateStandardAgenda();
ScrumOfScrumsAgenda;
{
    const standardQuestions = [
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
getActiveImpediments(artId, string);
ProgramImpediment[];
{
    return filter(Array.from(this.impediments.values()), (imp) => imp.status === ImpedimentStatus.OPEN || imp.status === ImpedimentStatus.IN_PROGRESS);
}
generateActionItems();
ScrumActionItem[];
{
    return [
        {
            id: `action-$generateNanoId(8)`,
        } `
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
      a.contributionLevel === 'high''
        ? 100
        : a.contributionLevel === 'medium''
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
    ];
}
