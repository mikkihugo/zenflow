/**
 * @fileoverview PI Planning Coordination
 *
 * SAFe 6.0 Program Increment Planning coordination system.
 * Handles PI planning events, team breakouts, and plan commitment.
 */

import { EventBus, getLogger } from '@claude-zen/foundation';

const logger = getLogger('PIPlanningCoordination');

/**
 * PI Planning phases
 */
export enum PIPlanningPhase {
  PREPARATION = 'preparation',
  DAY_ONE_MORNING = 'day_one_morning',
  DAY_ONE_AFTERNOON = 'day_one_afternoon',
  DAY_TWO_MORNING = 'day_two_morning',
  DAY_TWO_AFTERNOON = 'day_two_afternoon',
  COMPLETION = 'completion',
}

/**
 * Team PI objective interface
 */
export interface TeamPIObjective {
  id: string;
  teamId: string;
  description: string;
  businessValue: number; // 1-10 scale
  uncommitted: boolean;
  confidence: number; // 1-5 scale
  acceptanceCriteria: string[];
  dependencies: string[];
  risks: string[];
  enabler: boolean;
}

/**
 * PI Planning team interface
 */
export interface PIPlanningTeam {
  id: string;
  name: string;
  scrumMaster: string;
  productOwner: string;
  teamMembers: string[];
  capacity: number; // Available story points for PI
  velocity: number; // Historical velocity
  objectives: TeamPIObjective[];
  risks: string[];
  dependencies: string[];
}

/**
 * Business context interface
 */
export interface BusinessContext {
  vision: string;
  roadmap: string[];
  milestones: {
    name: string;
    date: Date;
    description: string;
  }[];
  constraints: string[];
  assumptions: string[];
}

/**
 * Program risks and dependencies
 */
export interface ProgramRisksAndDependencies {
  risks: {
    id: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    probability: 'high' | 'medium' | 'low';
    mitigation: string;
    owner: string;
  }[];
  dependencies: {
    id: string;
    description: string;
    fromTeam: string;
    toTeam: string;
    type: 'feature' | 'architecture' | 'infrastructure';
    critical: boolean;
    targetDate: Date;
  }[];
}

/**
 * Plan commitment data
 */
export interface PlanCommitment {
  teamId: string;
  commitmentLevel: number; // 1-5 fist of five
  confidence: number; // 1-5 scale
  concerns: string[];
  commitments: string[];
  uncommittedObjectives: string[];
}

/**
 * PI Planning event interface
 */
export interface PIPlanningEvent {
  id: string;
  piNumber: number;
  artId: string;
  artName: string;
  startDate: Date;
  endDate: Date;
  currentPhase: PIPlanningPhase;
  facilitator: string; // Release Train Engineer
  businessOwners: string[];
  systemArchitect?: string;
  teams: PIPlanningTeam[];
  businessContext: BusinessContext;
  agenda: {
    phase: PIPlanningPhase;
    startTime: Date;
    endTime: Date;
    activities: string[];
    facilitator: string;
  }[];
  risksAndDependencies: ProgramRisksAndDependencies;
  planCommitments: PlanCommitment[];
  boardOfCommitment: {
    teamCommitments: PlanCommitment[];
    overallConfidence: number;
    managementSupport: boolean;
    readyToProceed: boolean;
  };
  artifacts: {
    teamBoards: string[];
    dependencyWall: string[];
    riskBoard: string[];
    votingResults: any[];
  };
}

/**
 * PI Planning Coordination Manager
 */
export class PIPlanningCoordinationManager extends EventBus {
  private planningEvents = new Map<string, PIPlanningEvent>();
  private activeBreakouts = new Map<string, string[]>(); // eventId -> teamIds
  private commitmentData = new Map<string, PlanCommitment[]>(); // eventId -> commitments

  constructor() {
    super();
    this.setupEventHandlers();
    logger.info('PI Planning Coordination Manager initialized');
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    this.on('pi:planning-start', this.handlePlanningStart.bind(this));
    this.on('pi:phase-transition', this.handlePhaseTransition.bind(this));
    this.on('pi:team-breakout', this.handleTeamBreakout.bind(this));
    this.on('pi:objective-update', this.handleObjectiveUpdate.bind(this));
    this.on(
      'pi:dependency-identified',
      this.handleDependencyIdentified.bind(this)
    );
    this.on('pi:risk-identified', this.handleRiskIdentified.bind(this));
    this.on('pi:commitment-vote', this.handleCommitmentVote.bind(this));
    this.on('pi:planning-complete', this.handlePlanningComplete.bind(this));
  }

  /**
   * Create PI Planning event
   */
  createPIPlanningEvent(config: {
    piNumber: number;
    artId: string;
    artName: string;
    startDate: Date;
    endDate: Date;
    facilitator: string;
    businessOwners: string[];
    teams: Omit<PIPlanningTeam, 'objectives' | 'risks' | 'dependencies'>[];
    businessContext: BusinessContext;
  }): PIPlanningEvent {
    const eventId = `pi-planning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const event: PIPlanningEvent = {
      id: eventId,
      piNumber: config.piNumber,
      artId: config.artId,
      artName: config.artName,
      startDate: config.startDate,
      endDate: config.endDate,
      currentPhase: PIPlanningPhase.PREPARATION,
      facilitator: config.facilitator,
      businessOwners: config.businessOwners,
      teams: config.teams.map((team) => ({
        ...team,
        objectives: [],
        risks: [],
        dependencies: [],
      })),
      businessContext: config.businessContext,
      agenda: this.createDefaultAgenda(config.startDate, config.endDate),
      risksAndDependencies: {
        risks: [],
        dependencies: [],
      },
      planCommitments: [],
      boardOfCommitment: {
        teamCommitments: [],
        overallConfidence: 0,
        managementSupport: false,
        readyToProceed: false,
      },
      artifacts: {
        teamBoards: [],
        dependencyWall: [],
        riskBoard: [],
        votingResults: [],
      },
    };

    this.planningEvents.set(eventId, event);
    logger.info(
      `PI Planning event created: PI ${config.piNumber} for ${config.artName}`
    );

    this.emit('pi:event-created', { eventId, event });
    return event;
  }

  /**
   * Handle planning start
   */
  private handlePlanningStart(data: { eventId: string }): void {
    const event = this.planningEvents.get(data.eventId);
    if (!event) {
      logger.error(`PI Planning event not found: ${data.eventId}`);
      return;
    }

    event.currentPhase = PIPlanningPhase.DAY_ONE_MORNING;
    this.planningEvents.set(data.eventId, event);

    logger.info(`PI Planning started: ${event.artName} PI ${event.piNumber}`);
    this.emit('pi:planning-started', { eventId: data.eventId, event });
  }

  /**
   * Handle phase transitions
   */
  private handlePhaseTransition(data: {
    eventId: string;
    newPhase: PIPlanningPhase;
  }): void {
    const event = this.planningEvents.get(data.eventId);
    if (!event) {
      logger.error(`PI Planning event not found: ${data.eventId}`);
      return;
    }

    const previousPhase = event.currentPhase;
    event.currentPhase = data.newPhase;
    this.planningEvents.set(data.eventId, event);

    logger.info(
      `PI Planning phase transition: ${previousPhase} → ${data.newPhase}`
    );
    this.emit('pi:phase-changed', {
      eventId: data.eventId,
      previousPhase,
      newPhase: data.newPhase,
      event,
    });
  }

  /**
   * Handle team breakouts
   */
  private handleTeamBreakout(data: {
    eventId: string;
    teamId: string;
    breakoutType: 'planning' | 'dependency' | 'risk';
  }): void {
    const event = this.planningEvents.get(data.eventId);
    if (!event) {
      logger.error(`PI Planning event not found: ${data.eventId}`);
      return;
    }

    // Track active breakouts
    if (!this.activeBreakouts.has(data.eventId)) {
      this.activeBreakouts.set(data.eventId, []);
    }
    this.activeBreakouts.get(data.eventId)!.push(data.teamId);

    logger.info(`Team breakout started: ${data.teamId} - ${data.breakoutType}`);
    this.emit('pi:breakout-started', {
      eventId: data.eventId,
      teamId: data.teamId,
      breakoutType: data.breakoutType,
    });
  }

  /**
   * Handle objective updates
   */
  private handleObjectiveUpdate(data: {
    eventId: string;
    teamId: string;
    objective: TeamPIObjective;
  }): void {
    const event = this.planningEvents.get(data.eventId);
    if (!event) {
      logger.error(`PI Planning event not found: ${data.eventId}`);
      return;
    }

    const team = event.teams.find((t) => t.id === data.teamId);
    if (!team) {
      logger.error(`Team not found: ${data.teamId}`);
      return;
    }

    // Add or update objective
    const existingIndex = team.objectives.findIndex(
      (o) => o.id === data.objective.id
    );
    if (existingIndex >= 0) {
      team.objectives[existingIndex] = data.objective;
    } else {
      team.objectives.push(data.objective);
    }

    this.planningEvents.set(data.eventId, event);
    logger.info(`Objective updated: ${data.objective.description}`);

    this.emit('pi:objective-updated', {
      eventId: data.eventId,
      teamId: data.teamId,
      objective: data.objective,
    });
  }

  /**
   * Handle dependency identification
   */
  private handleDependencyIdentified(data: {
    eventId: string;
    dependency: Omit<ProgramRisksAndDependencies['dependencies'][0], 'id'>;
  }): void {
    const event = this.planningEvents.get(data.eventId);
    if (!event) {
      logger.error(`PI Planning event not found: ${data.eventId}`);
      return;
    }

    const dependencyId = `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const dependency = {
      id: dependencyId,
      ...data.dependency,
    };

    event.risksAndDependencies.dependencies.push(dependency);
    this.planningEvents.set(data.eventId, event);

    logger.info(`Dependency identified: ${dependency.description}`);
    this.emit('pi:dependency-added', { eventId: data.eventId, dependency });
  }

  /**
   * Handle risk identification
   */
  private handleRiskIdentified(data: {
    eventId: string;
    risk: Omit<ProgramRisksAndDependencies['risks'][0], 'id'>;
  }): void {
    const event = this.planningEvents.get(data.eventId);
    if (!event) {
      logger.error(`PI Planning event not found: ${data.eventId}`);
      return;
    }

    const riskId = `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const risk = {
      id: riskId,
      ...data.risk,
    };

    event.risksAndDependencies.risks.push(risk);
    this.planningEvents.set(data.eventId, event);

    logger.info(`Risk identified: ${risk.description}`);
    this.emit('pi:risk-added', { eventId: data.eventId, risk });
  }

  /**
   * Handle commitment voting
   */
  private handleCommitmentVote(data: {
    eventId: string;
    teamId: string;
    commitment: Omit<PlanCommitment, 'teamId'>;
  }): void {
    const event = this.planningEvents.get(data.eventId);
    if (!event) {
      logger.error(`PI Planning event not found: ${data.eventId}`);
      return;
    }

    const commitment: PlanCommitment = {
      teamId: data.teamId,
      ...data.commitment,
    };

    // Add or update commitment
    const existingIndex = event.planCommitments.findIndex(
      (c) => c.teamId === data.teamId
    );
    if (existingIndex >= 0) {
      event.planCommitments[existingIndex] = commitment;
    } else {
      event.planCommitments.push(commitment);
    }

    // Update board of commitment
    this.updateBoardOfCommitment(event);
    this.planningEvents.set(data.eventId, event);

    logger.info(
      `Commitment received from team: ${data.teamId} - Level ${commitment.commitmentLevel}`
    );
    this.emit('pi:commitment-recorded', { eventId: data.eventId, commitment });
  }

  /**
   * Handle planning completion
   */
  private handlePlanningComplete(data: { eventId: string }): void {
    const event = this.planningEvents.get(data.eventId);
    if (!event) {
      logger.error(`PI Planning event not found: ${data.eventId}`);
      return;
    }

    event.currentPhase = PIPlanningPhase.COMPLETION;
    this.planningEvents.set(data.eventId, event);

    logger.info(`PI Planning completed: ${event.artName} PI ${event.piNumber}`);
    this.emit('pi:planning-completed', { eventId: data.eventId, event });
  }

  /**
   * Create default agenda
   */
  private createDefaultAgenda(
    startDate: Date,
    endDate: Date
  ): PIPlanningEvent['agenda'] {
    const day1Start = new Date(startDate);
    const day2Start = new Date(startDate);
    day2Start.setDate(day2Start.getDate() + 1);

    return [
      {
        phase: PIPlanningPhase.DAY_ONE_MORNING,
        startTime: day1Start,
        endTime: new Date(day1Start.getTime() + 4 * 60 * 60 * 1000), // 4 hours
        activities: [
          'Business Context',
          'Product/Solution Vision',
          'Architecture Vision',
          'Planning Context',
        ],
        facilitator: 'RTE',
      },
      {
        phase: PIPlanningPhase.DAY_ONE_AFTERNOON,
        startTime: new Date(day1Start.getTime() + 5 * 60 * 60 * 1000),
        endTime: new Date(day1Start.getTime() + 8 * 60 * 60 * 1000),
        activities: [
          'Team Breakouts',
          'Draft Plan Review',
          'Dependency Discussion',
        ],
        facilitator: 'Team Leads',
      },
      {
        phase: PIPlanningPhase.DAY_TWO_MORNING,
        startTime: day2Start,
        endTime: new Date(day2Start.getTime() + 4 * 60 * 60 * 1000),
        activities: ['Management Review', 'Problem Solving', 'Risk Mitigation'],
        facilitator: 'RTE',
      },
      {
        phase: PIPlanningPhase.DAY_TWO_AFTERNOON,
        startTime: new Date(day2Start.getTime() + 5 * 60 * 60 * 1000),
        endTime: endDate,
        activities: [
          'Final Plan Review',
          'Vote of Confidence',
          'Plan Rework (if needed)',
          'Final Commitment',
        ],
        facilitator: 'RTE',
      },
    ];
  }

  /**
   * Update board of commitment
   */
  private updateBoardOfCommitment(event: PIPlanningEvent): void {
    const commitments = event.planCommitments;

    if (commitments.length === 0) {
      return;
    }

    // Calculate overall confidence
    const totalConfidence = commitments.reduce(
      (sum, c) => sum + c.confidence,
      0
    );
    const overallConfidence = totalConfidence / commitments.length;

    // Check if all teams have committed
    const allTeamsCommitted = event.teams.length === commitments.length;
    const averageCommitment =
      commitments.reduce((sum, c) => sum + c.commitmentLevel, 0) /
      commitments.length;

    event.boardOfCommitment = {
      teamCommitments: commitments,
      overallConfidence,
      managementSupport: overallConfidence >= 3 && averageCommitment >= 3,
      readyToProceed: allTeamsCommitted && overallConfidence >= 3,
    };
  }

  /**
   * Get planning event status
   */
  getPlanningEventStatus(eventId: string): {
    event?: PIPlanningEvent;
    progress: {
      currentPhase: PIPlanningPhase;
      teamsPlanning: number;
      objectivesCreated: number;
      dependenciesIdentified: number;
      risksIdentified: number;
      commitmentsReceived: number;
      overallReadiness: number;
    };
  } {
    const event = this.planningEvents.get(eventId);
    if (!event) {
      return {
        progress: {
          currentPhase: PIPlanningPhase.PREPARATION,
          teamsPlanning: 0,
          objectivesCreated: 0,
          dependenciesIdentified: 0,
          risksIdentified: 0,
          commitmentsReceived: 0,
          overallReadiness: 0,
        },
      };
    }

    const activeBreakouts = this.activeBreakouts.get(eventId)?.length || 0;
    const totalObjectives = event.teams.reduce(
      (sum, team) => sum + team.objectives.length,
      0
    );

    // Calculate readiness based on multiple factors
    const phaseProgress =
      Object.values(PIPlanningPhase).indexOf(event.currentPhase) / 5;
    const objectiveProgress = Math.min(
      totalObjectives / (event.teams.length * 3),
      1
    ); // Assume 3 objectives per team
    const commitmentProgress =
      event.planCommitments.length / event.teams.length;

    const overallReadiness =
      (phaseProgress + objectiveProgress + commitmentProgress) / 3;

    return {
      event,
      progress: {
        currentPhase: event.currentPhase,
        teamsPlanning: activeBreakouts,
        objectivesCreated: totalObjectives,
        dependenciesIdentified: event.risksAndDependencies.dependencies.length,
        risksIdentified: event.risksAndDependencies.risks.length,
        commitmentsReceived: event.planCommitments.length,
        overallReadiness: Math.round(overallReadiness * 100),
      },
    };
  }

  /**
   * Get all planning events
   */
  getAllPlanningEvents(): PIPlanningEvent[] {
    return Array.from(this.planningEvents.values());
  }

  /**
   * Get program dependencies
   */
  getProgramDependencies(
    eventId: string
  ): ProgramRisksAndDependencies['dependencies'] {
    const event = this.planningEvents.get(eventId);
    return event?.risksAndDependencies.dependencies || [];
  }

  /**
   * Get program risks
   */
  getProgramRisks(eventId: string): ProgramRisksAndDependencies['risks'] {
    const event = this.planningEvents.get(eventId);
    return event?.risksAndDependencies.risks || [];
  }
}

export default PIPlanningCoordinationManager;
