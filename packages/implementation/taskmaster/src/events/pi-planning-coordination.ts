/**
 * @fileoverview PI Planning Coordination Service - Essential SAFe Event Orchestration
 *
 * **PI PLANNING IS THE HEARTBEAT OF ESSENTIAL SAFe:**
 *
 * 🎯 **TWO-DAY STRUCTURED EVENT:**
 * - Day 1: Business context, team planning, draft objectives
 * - Day 2: Management review, adjustments, final commitment
 *
 * 🤝 **CROSS-TEAM COORDINATION:**
 * - Dependency identification and resolution
 * - Resource allocation and capacity planning
 * - Risk mitigation and escalation
 *
 * 📋 **KEY ARTIFACTS CREATED:**
 * - Team PI Objectives with business value
 * - ART Planning Board with dependencies
 * - Confidence vote and team commitments
 * - Program Board showing delivery timeline
 *
 * 🔗 **TASKMASTER INTEGRATION:**
 * - PI Planning stages become approval gates
 * - Team breakouts coordinated via task assignments
 * - Dependencies tracked through approval workflows
 * - Commitments validated through approval criteria
 */

import { getLogger } from '@claude-zen/foundation';
import { getDatabaseSystem } from '@claude-zen/infrastructure';
import { TaskApprovalSystem } from '../agui/task-approval-system.js';
import {
  CompleteSafeFlowIntegration,
  CompleteSafeGateCategory,
} from '../integrations/complete-safe-flow-integration.js';
import type { ApprovalGateId, UserId } from '../types/index.js';

const logger = getLogger('PIPlanningCoordination');'

// ============================================================================
// PI PLANNING TYPES
// ============================================================================

/**
 * PI Planning event phases
 */
export enum PIPlanningPhase {
  PREPARATION = 'preparation',
  DAY_ONE_MORNING = 'day_one_morning', // Business context'
  DAY_ONE_AFTERNOON = 'day_one_afternoon', // Team planning'
  DAY_TWO_MORNING = 'day_two_morning', // Management review'
  DAY_TWO_AFTERNOON = 'day_two_afternoon', // Final commitment'
  COMPLETION = 'completion',
}

/**
 * PI Planning artifact
 */
export interface PIPlanningEvent {
  id: string;
  planningIntervalNumber: number;
  artId: string;

  // Event timing
  startDate: Date;
  endDate: Date;
  currentPhase: PIPlanningPhase;

  // Participants
  facilitator: UserId; // Usually the RTE
  businessOwners: UserId[];
  teams: Array<{
    teamId: string;
    teamName: string;
    scumMaster: UserId;
    productOwner: UserId;
    teamMembers: UserId[];
    capacity: number; // Available story points for the PI
  }>;

  // Event artifacts
  businessContext: {
    vision: string;
    roadmap: string[];
    milestones: Array<{
      name: string;
      date: Date;
      description: string;
    }>;
  };

  teamPIObjectives: Array<{
    teamId: string;
    objectives: Array<{
      id: string;
      description: string;
      businessValue: number; // 1-10 scale
      uncommitted: boolean;
      features: string[];
    }>;
  }>;

  artPlanningBoard: {
    dependencies: Array<{
      id: string;
      fromTeam: string;
      toTeam: string;
      description: string;
      resolvedBy: Date;
      status: 'identified' | 'resolved' | 'accepted_risk';
    }>;

    milestones: Array<{
      name: string;
      date: Date;
      teams: string[];
      criticalPath: boolean;
    }>;
  };

  confidenceVote: {
    teamConfidences: Array<{
      teamId: string;
      confidence: number; // 1-5 scale (fist of five)
      concerns: string[];
    }>;
    overallConfidence: number;
    adjustmentsNeeded: boolean;
  };

  // Approval tracking
  approvalGates: {
    businessContextApproval: ApprovalGateId;
    teamPlanningApproval: ApprovalGateId;
    dependencyResolutionApproval: ApprovalGateId;
    finalCommitmentApproval: ApprovalGateId;
  };

  // Results
  commitments: Array<{
    teamId: string;
    committed: boolean;
    conditionalCommitments: string[];
    risks: Array<{
      description: string;
      mitigation: string;
      owner: UserId;
    }>;
  }>;

  // Metadata
  createdAt: Date;
  completedAt?: Date;
  status: 'planning|in_progress|completed|cancelled;
}

/**
 * Team breakout session
 */
export interface TeamBreakoutSession {
  teamId: string;
  planningEventId: string;

  // Session tracking
  startTime: Date;
  endTime?: Date;
  facilitators: UserId[];

  // Planning artifacts
  storyMapping: Array<{
    epic: string;
    features: Array<{
      name: string;
      storyPoints: number;
      iteration: number;
      dependencies: string[];
    }>;
  }>;

  capacityPlanning: {
    totalCapacity: number;
    committedCapacity: number;
    bufferCapacity: number;
    teamVelocity: number;
  };

  riskAssessment: Array<{
    risk: string;
    probability: 'low' | 'medium' | 'high';
    impact: 'low' | 'medium' | 'high';
    mitigation: string;
    owner: UserId;
  }>;
}

// ============================================================================
// PI PLANNING COORDINATION SERVICE
// ============================================================================

/**
 * PI Planning Coordination Service
 * Orchestrates the complete PI Planning event with approval gate integration
 */
export class PIPlanningCoordinationService {
  private readonly logger = getLogger('PIPlanningCoordinationService');'
  private database: any;
  private taskApprovalSystem: TaskApprovalSystem;
  private safeFlowIntegration: CompleteSafeFlowIntegration;

  // Active planning events
  private activePlanningEvents = new Map<string, PIPlanningEvent>();
  private teamBreakoutSessions = new Map<string, TeamBreakoutSession[]>();

  constructor(
    taskApprovalSystem: TaskApprovalSystem,
    safeFlowIntegration: CompleteSafeFlowIntegration
  ) {
    this.taskApprovalSystem = taskApprovalSystem;
    this.safeFlowIntegration = safeFlowIntegration;
  }

  /**
   * Initialize PI Planning coordination service
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing PI Planning Coordination Service...');'

      const dbSystem = await getDatabaseSystem();
      this.database = dbSystem.createProvider('sql');'

      await this.createPIPlanningTables();
      await this.loadActivePlanningEvents();

      this.logger.info(
        'PI Planning Coordination Service initialized successfully''
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize PI Planning Coordination Service',
        error
      );
      throw error;
    }
  }

  /**
   * Start PI Planning event with full coordination
   */
  async startPIPlanningEvent(
    planningData: {
      planningIntervalNumber: number;
      artId: string;
      startDate: Date;
      endDate: Date;
      facilitator: UserId;
      businessOwners: UserId[];
      teams: any[];
      businessContext: any;
    },
    requestContext: {
      userId: UserId;
      reason: string;
    }
  ): Promise<{
    planningEventId: string;
    approvalGates: ApprovalGateId[];
    nextPhase: PIPlanningPhase;
    estimatedCompletion: Date;
  }> {
    const planningEventId = `pi-planning-${planningData.artId}-${planningData.planningIntervalNumber}`;`

    this.logger.info('Starting PI Planning event', {'
      planningEventId,
      piNumber: planningData.planningIntervalNumber,
      artId: planningData.artId,
      teamsCount: planningData.teams.length,
    });

    // Create PI Planning event
    const planningEvent: PIPlanningEvent = {
      id: planningEventId,
      planningIntervalNumber: planningData.planningIntervalNumber,
      artId: planningData.artId,
      startDate: planningData.startDate,
      endDate: planningData.endDate,
      currentPhase: PIPlanningPhase.PREPARATION,
      facilitator: planningData.facilitator,
      businessOwners: planningData.businessOwners,
      teams: planningData.teams,
      businessContext: planningData.businessContext,
      teamPIObjectives: [],
      artPlanningBoard: {
        dependencies: [],
        milestones: [],
      },
      confidenceVote: {
        teamConfidences: [],
        overallConfidence: 0,
        adjustmentsNeeded: false,
      },
      approvalGates: {
        businessContextApproval: ' as ApprovalGateId,
        teamPlanningApproval: ' as ApprovalGateId,
        dependencyResolutionApproval: ' as ApprovalGateId,
        finalCommitmentApproval: ' as ApprovalGateId,
      },
      commitments: [],
      createdAt: new Date(),
      status: 'planning',
    };

    // Create approval workflows for each phase
    const approvalGates = await this.createPIPlanningApprovalWorkflows(
      planningEvent,
      requestContext
    );
    planningEvent.approvalGates = approvalGates;

    // Store planning event
    this.activePlanningEvents.set(planningEventId, planningEvent);
    await this.persistPlanningEvent(planningEvent);

    // Start preparation phase
    await this.startPreparationPhase(planningEvent);

    return {
      planningEventId,
      approvalGates: Object.values(approvalGates),
      nextPhase: PIPlanningPhase.DAY_ONE_MORNING,
      estimatedCompletion: planningData.endDate,
    };
  }

  /**
   * Execute Day 1 Morning - Business Context Presentation
   */
  async executeDayOneMorning(
    planningEventId: string,
    businessContext: {
      visionPresentation: string;
      roadmapUpdate: string[];
      architecturalChanges: string[];
      milestones: any[];
    },
    facilitatorContext: {
      facilitatorId: UserId;
      attendeeCount: number;
    }
  ): Promise<{
    success: boolean;
    contextApproved: boolean;
    teamQuestions: string[];
    nextSteps: string[];
  }> {
    const planningEvent = this.activePlanningEvents.get(planningEventId);
    if (!planningEvent) {
      throw new Error(`PI Planning event not found: ${planningEventId}`);`
    }

    this.logger.info('Executing Day 1 Morning - Business Context', {'
      planningEventId,
      facilitator: facilitatorContext.facilitatorId,
      attendees: facilitatorContext.attendeeCount,
    });

    // Update business context
    planningEvent.businessContext = {
      ...planningEvent.businessContext,
      ...businessContext,
    };
    planningEvent.currentPhase = PIPlanningPhase.DAY_ONE_MORNING;

    // Create business context approval task
    const contextApproval = await this.createBusinessContextApproval(
      planningEvent,
      businessContext
    );

    // Generate team questions and preparation tasks
    const teamQuestions = await this.generateTeamQuestions(
      planningEvent,
      businessContext
    );
    const nextSteps = await this.generateDayOneAfternoonPrep(planningEvent);

    await this.persistPlanningEvent(planningEvent);

    return {
      success: true,
      contextApproved: true, // Will be determined by approval workflow
      teamQuestions,
      nextSteps,
    };
  }

  /**
   * Execute Day 1 Afternoon - Team Planning Breakouts
   */
  async executeDayOneAfternoon(
    planningEventId: string,
    teamBreakoutData: Array<{
      teamId: string;
      storyMapping: any[];
      capacityPlanning: any;
      initialObjectives: any[];
      identifiedDependencies: any[];
      risks: any[];
    }>
  ): Promise<{
    success: boolean;
    objectivesDrafted: boolean;
    dependenciesIdentified: number;
    readinessForDayTwo: boolean;
  }> {
    const planningEvent = this.activePlanningEvents.get(planningEventId);
    if (!planningEvent) {
      throw new Error(`PI Planning event not found: ${planningEventId}`);`
    }

    this.logger.info('Executing Day 1 Afternoon - Team Breakouts', {'
      planningEventId,
      teamsPlanning: teamBreakoutData.length,
    });

    planningEvent.currentPhase = PIPlanningPhase.DAY_ONE_AFTERNOON;

    // Process team breakout results
    const processedObjectives =
      await this.processTeamObjectives(teamBreakoutData);
    const identifiedDependencies =
      await this.processDependencies(teamBreakoutData);

    planningEvent.teamPIObjectives = processedObjectives;
    planningEvent.artPlanningBoard.dependencies = identifiedDependencies;

    // Create team planning approval workflows
    const teamPlanningApproval = await this.createTeamPlanningApproval(
      planningEvent,
      teamBreakoutData
    );

    // Assess readiness for Day 2
    const readinessAssessment = await this.assessDayTwoReadiness(planningEvent);

    await this.persistPlanningEvent(planningEvent);

    return {
      success: true,
      objectivesDrafted: processedObjectives.length > 0,
      dependenciesIdentified: identifiedDependencies.length,
      readinessForDayTwo: readinessAssessment.ready,
    };
  }

  /**
   * Execute Day 2 Morning - Management Review and Adjustments
   */
  async executeDayTwoMorning(
    planningEventId: string,
    managementReview: {
      businessOwnerFeedback: Array<{
        ownerId: UserId;
        teamFeedback: Array<{
          teamId: string;
          approvedObjectives: string[];
          requestedChanges: string[];
          businessValueConcerns: string[];
        }>;
      }>;
      dependencyResolution: Array<{
        dependencyId: string;
        resolution: 'resolved' | 'accepted_risk' | 'needs_escalation';
        resolutionPlan: string;
        owner: UserId;
      }>;
    }
  ): Promise<{
    success: boolean;
    adjustmentsMade: boolean;
    dependenciesResolved: number;
    readyForCommitment: boolean;
  }> {
    const planningEvent = this.activePlanningEvents.get(planningEventId);
    if (!planningEvent) {
      throw new Error(`PI Planning event not found: ${planningEventId}`);`
    }

    this.logger.info('Executing Day 2 Morning - Management Review', {'
      planningEventId,
      businessOwnersCount: managementReview.businessOwnerFeedback.length,
      dependenciesToResolve: managementReview.dependencyResolution.length,
    });

    planningEvent.currentPhase = PIPlanningPhase.DAY_TWO_MORNING;

    // Apply business owner feedback
    const adjustmentsMade = await this.applyBusinessOwnerFeedback(
      planningEvent,
      managementReview.businessOwnerFeedback
    );

    // Resolve dependencies
    const dependenciesResolved = await this.resolveDependencies(
      planningEvent,
      managementReview.dependencyResolution
    );

    // Create dependency resolution approval
    const dependencyApproval = await this.createDependencyResolutionApproval(
      planningEvent,
      managementReview
    );

    await this.persistPlanningEvent(planningEvent);

    return {
      success: true,
      adjustmentsMade,
      dependenciesResolved: dependenciesResolved.length,
      readyForCommitment: true,
    };
  }

  /**
   * Execute Day 2 Afternoon - Final Commitment and Confidence Vote
   */
  async executeDayTwoAfternoon(
    planningEventId: string,
    finalCommitment: {
      teamConfidenceVotes: Array<{
        teamId: string;
        confidence: number; // 1-5 (fist of five)
        concerns: string[];
        commitments: Array<{
          objectiveId: string;
          committed: boolean;
          conditions: string[];
        }>;
      }>;
      managementResponse: {
        acceptableConfidenceLevel: number;
        supportCommitments: Array<{
          commitment: string;
          owner: UserId;
          timeline: Date;
        }>;
      };
    }
  ): Promise<{
    success: boolean;
    overallConfidence: number;
    allTeamsCommitted: boolean;
    planningCompleted: boolean;
    piObjectives: any[];
  }> {
    const planningEvent = this.activePlanningEvents.get(planningEventId);
    if (!planningEvent) {
      throw new Error(`PI Planning event not found: ${planningEventId}`);`
    }

    this.logger.info('Executing Day 2 Afternoon - Final Commitment', {'
      planningEventId,
      teamsVoting: finalCommitment.teamConfidenceVotes.length,
    });

    planningEvent.currentPhase = PIPlanningPhase.DAY_TWO_AFTERNOON;

    // Process confidence votes
    const confidenceVote = await this.processConfidenceVotes(
      finalCommitment.teamConfidenceVotes
    );
    planningEvent.confidenceVote = confidenceVote;

    // Process team commitments
    const commitments = await this.processTeamCommitments(
      finalCommitment.teamConfidenceVotes
    );
    planningEvent.commitments = commitments;

    // Create final commitment approval
    const finalApproval = await this.createFinalCommitmentApproval(
      planningEvent,
      finalCommitment
    );

    // Complete planning event
    const planningCompleted = await this.completePlanningEvent(planningEvent);

    await this.persistPlanningEvent(planningEvent);

    return {
      success: true,
      overallConfidence: confidenceVote.overallConfidence,
      allTeamsCommitted: commitments.every((c) => c.committed),
      planningCompleted,
      piObjectives: planningEvent.teamPIObjectives,
    };
  }

  // ============================================================================
  // PRIVATE IMPLEMENTATION METHODS
  // ============================================================================

  private async createPIPlanningTables(): Promise<void> {
    await this.database.schema.createTableIfNotExists(
      'pi_planning_events',
      (table: any) => {
        table.string('id').primary();'
        table.integer('planning_interval_number').notNullable();'
        table.string('art_id').notNullable();'
        table.timestamp('start_date').notNullable();'
        table.timestamp('end_date').notNullable();'
        table.string('current_phase').notNullable();'
        table.string('facilitator').notNullable();'
        table.json('business_owners');'
        table.json('teams');'
        table.json('business_context');'
        table.json('team_pi_objectives');'
        table.json('art_planning_board');'
        table.json('confidence_vote');'
        table.json('approval_gates');'
        table.json('commitments');'
        table.timestamp('created_at').notNullable();'
        table.timestamp('completed_at').nullable();'
        table.string('status').notNullable();'
        table.index(['art_id', 'planning_interval_number']);'
        table.index(['status', 'start_date']);'
      }
    );
  }

  private async createPIPlanningApprovalWorkflows(
    planningEvent: PIPlanningEvent,
    requestContext: any
  ): Promise<any> {
    const businessContextApproval =
      await this.taskApprovalSystem.createApprovalTask({
        id: `pi-business-context-${planningEvent.id}`,`
        taskType: 'pi_business_context_approval',
        title: `PI Planning Business Context - PI ${planningEvent.planningIntervalNumber}`,`
        description: 'Review and approve business context for PI Planning',
        context: {
          planningEvent: planningEvent.id,
          phase: 'business_context',
        },
        approvers: planningEvent.businessOwners,
        metadata: {
          piNumber: planningEvent.planningIntervalNumber,
          artId: planningEvent.artId,
        },
      });

    // Create other approval workflows...
    const teamPlanningApproval =
      `team-planning-approval-${planningEvent.id}` as ApprovalGateId;`
    const dependencyResolutionApproval =
      `dependency-resolution-${planningEvent.id}` as ApprovalGateId;`
    const finalCommitmentApproval =
      `final-commitment-${planningEvent.id}` as ApprovalGateId;`

    return {
      businessContextApproval,
      teamPlanningApproval,
      dependencyResolutionApproval,
      finalCommitmentApproval,
    };
  }

  // Placeholder implementations for complex processing methods
  private async startPreparationPhase(
    planningEvent: PIPlanningEvent
  ): Promise<void> {
    this.logger.info('Starting PI Planning preparation phase', {'
      planningEventId: planningEvent.id,
    });
  }

  private async generateTeamQuestions(
    planningEvent: PIPlanningEvent,
    businessContext: any
  ): Promise<string[]> {
    return [
      'How does this roadmap change affect our current sprint plans?',
      'What new dependencies do we need to consider?',
      'Are there capacity constraints for the proposed milestones?',
    ];
  }

  private async generateDayOneAfternoonPrep(
    planningEvent: PIPlanningEvent
  ): Promise<string[]> {
    return [
      'Teams break into planning sessions',
      'Draft team PI objectives',
      'Identify dependencies with other teams',
      'Complete capacity planning',
    ];
  }

  private async processTeamObjectives(teamBreakoutData: any[]): Promise<any[]> {
    return teamBreakoutData.map((team) => ({
      teamId: team.teamId,
      objectives: team.initialObjectives,
    }));
  }

  private async processDependencies(teamBreakoutData: any[]): Promise<any[]> {
    const allDependencies = teamBreakoutData.flatMap(
      (team) => team.identifiedDependencies
    );
    return allDependencies.map((dep, index) => ({
      id: `dep-${index}`,`
      fromTeam: dep.fromTeam,
      toTeam: dep.toTeam,
      description: dep.description,
      resolvedBy: dep.resolvedBy,
      status: 'identified',
    }));
  }

  private async assessDayTwoReadiness(
    planningEvent: PIPlanningEvent
  ): Promise<{ ready: boolean; issues: string[] }> {
    return {
      ready: planningEvent.teamPIObjectives.length > 0,
      issues: [],
    };
  }

  private async applyBusinessOwnerFeedback(
    planningEvent: PIPlanningEvent,
    feedback: any[]
  ): Promise<boolean> {
    // Apply feedback and adjustments
    return true;
  }

  private async resolveDependencies(
    planningEvent: PIPlanningEvent,
    resolutions: any[]
  ): Promise<any[]> {
    return resolutions.filter((r) => r.resolution === 'resolved');'
  }

  private async processConfidenceVotes(votes: any[]): Promise<any> {
    const averageConfidence =
      votes.reduce((sum, vote) => sum + vote.confidence, 0) / votes.length;

    return {
      teamConfidences: votes,
      overallConfidence: Math.round(averageConfidence),
      adjustmentsNeeded: averageConfidence < 3,
    };
  }

  private async processTeamCommitments(votes: any[]): Promise<any[]> {
    return votes.map((vote) => ({
      teamId: vote.teamId,
      committed: vote.confidence >= 3,
      conditionalCommitments: vote.commitments.filter(
        (c: any) => c.conditions.length > 0
      ),
      risks: [],
    }));
  }

  private async completePlanningEvent(
    planningEvent: PIPlanningEvent
  ): Promise<boolean> {
    planningEvent.status = 'completed';
    planningEvent.completedAt = new Date();
    planningEvent.currentPhase = PIPlanningPhase.COMPLETION;
    return true;
  }

  private async persistPlanningEvent(
    planningEvent: PIPlanningEvent
  ): Promise<void> {
    await this.database('pi_planning_events')'
      .insert({
        id: planningEvent.id,
        planning_interval_number: planningEvent.planningIntervalNumber,
        art_id: planningEvent.artId,
        start_date: planningEvent.startDate,
        end_date: planningEvent.endDate,
        current_phase: planningEvent.currentPhase,
        facilitator: planningEvent.facilitator,
        business_owners: JSON.stringify(planningEvent.businessOwners),
        teams: JSON.stringify(planningEvent.teams),
        business_context: JSON.stringify(planningEvent.businessContext),
        team_pi_objectives: JSON.stringify(planningEvent.teamPIObjectives),
        art_planning_board: JSON.stringify(planningEvent.artPlanningBoard),
        confidence_vote: JSON.stringify(planningEvent.confidenceVote),
        approval_gates: JSON.stringify(planningEvent.approvalGates),
        commitments: JSON.stringify(planningEvent.commitments),
        created_at: planningEvent.createdAt,
        completed_at: planningEvent.completedAt,
        status: planningEvent.status,
      })
      .onConflict('id')'
      .merge();
  }

  private async loadActivePlanningEvents(): Promise<void> {
    this.logger.info('Loading active PI Planning events...');'
  }

  // Additional approval creation methods (simplified)
  private async createBusinessContextApproval(
    planningEvent: PIPlanningEvent,
    context: any
  ): Promise<ApprovalGateId> {
    return planningEvent.approvalGates.businessContextApproval;
  }

  private async createTeamPlanningApproval(
    planningEvent: PIPlanningEvent,
    teamData: any[]
  ): Promise<ApprovalGateId> {
    return planningEvent.approvalGates.teamPlanningApproval;
  }

  private async createDependencyResolutionApproval(
    planningEvent: PIPlanningEvent,
    review: any
  ): Promise<ApprovalGateId> {
    return planningEvent.approvalGates.dependencyResolutionApproval;
  }

  private async createFinalCommitmentApproval(
    planningEvent: PIPlanningEvent,
    commitment: any
  ): Promise<ApprovalGateId> {
    return planningEvent.approvalGates.finalCommitmentApproval;
  }
}

export default PIPlanningCoordinationService;
