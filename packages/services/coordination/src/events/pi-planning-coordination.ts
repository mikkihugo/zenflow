import { getLogger as _getLogger } from '@claude-zen/foundation';
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
    const eventId = `pi-planning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template" `PI Planning event created: PI ${config.piNumber} for ${config.artName}"Fixed unterminated template"(`PI Planning event not found: ${data.eventId}"Fixed unterminated template"(`PI Planning started: ${event.artName} PI ${event.piNumber}"Fixed unterminated template"(`PI Planning event not found: ${data.eventId}"Fixed unterminated template" `PI Planning phase transition: ${previousPhase} → ${data.newPhase}"Fixed unterminated template"(`PI Planning event not found: ${data.eventId}"Fixed unterminated template"(`Team breakout started: ${data.teamId} - ${data.breakoutType}"Fixed unterminated template"(`PI Planning event not found: ${data.eventId}"Fixed unterminated template"(`Team not found: ${data.teamId}"Fixed unterminated template"(`Objective updated: ${data.objective.description}"Fixed unterminated template"(`PI Planning event not found: ${data.eventId}"Fixed unterminated template" `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template"(`Dependency identified: ${dependency.description}"Fixed unterminated template"(`PI Planning event not found: ${data.eventId}"Fixed unterminated template" `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}"Fixed unterminated template"(`Risk identified: ${risk.description}"Fixed unterminated template"(`PI Planning event not found: ${data.eventId}"Fixed unterminated template" `Commitment received from team: ${data.teamId} - Level ${commitment.commitmentLevel}"Fixed unterminated template"(`PI Planning event not found: ${data.eventId}"Fixed unterminated template"(`PI Planning completed: ${event.artName} PI ${event.piNumber}"Fixed unterminated template"