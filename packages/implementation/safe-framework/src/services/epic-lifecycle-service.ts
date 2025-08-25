/**
 * @fileoverview Epic Lifecycle Service - Portfolio Kanban Management
 *
 * Service for managing epic lifecycle through Portfolio Kanban states.
 * Handles epic progression, gate criteria, and WSJF prioritization.
 *
 * SINGLE RESPONSIBILITY: Epic lifecycle and Portfolio Kanban management
 * FOCUSES ON: State transitions, gate validation, epic progression tracking
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { addDays, differenceInDays, format } from 'date-fns';
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
  maxBy,
} from 'lodash-es';
import {
  PortfolioKanbanState,
  type WSJFScore,
  type EpicLifecycleStage,
  type GateCriterion,
  type EpicBlocker,
  type EpicOwnerManagerConfig,
} from '../types/epic-management';
import type { Logger, PortfolioEpic } from '../types';

/**
 * Epic lifecycle service configuration
 */
export interface EpicLifecycleConfig {
  readonly analysisTimeLimit: number; // days
  readonly maxEpicsPerState: number;
  readonly autoProgressEnabled: boolean;
  readonly wsjfUpdateFrequency: number; // days
  readonly gateValidationStrict: boolean;
}

/**
 * Epic progression result
 */
export interface EpicProgressionResult {
  readonly success: boolean;
  readonly newState: PortfolioKanbanState;
  readonly previousState: PortfolioKanbanState;
  readonly blockers: EpicBlocker[];
  readonly unmetCriteria: GateCriterion[];
  readonly recommendations: string[];
  readonly nextActions: string[];
}

/**
 * Portfolio Kanban metrics
 */
export interface PortfolioKanbanMetrics {
  readonly stateDistribution: Record<PortfolioKanbanState, number>;
  readonly averageLeadTime: number; // days
  readonly averageCycleTime: number; // days
  readonly throughput: number; // epics per month
  readonly blockerCount: number;
  readonly wsjfScoreDistribution: { min: number; max: number; avg: number };
  readonly flowEfficiency: number; // 0-100%
}

/**
 * WSJF calculation result
 */
export interface WSJFCalculationResult {
  readonly epicId: string;
  readonly currentScore: WSJFScore;
  readonly previousScore?: WSJFScore;
  readonly rankChange: number;
  readonly confidence: number;
  readonly recommendedActions: string[];
}

/**
 * Epic Lifecycle Service for Portfolio Kanban management
 */
export class EpicLifecycleService {
  private readonly config: EpicLifecycleConfig;
  private readonly logger: Logger;
  private epics = new Map<string, PortfolioEpic>();
  private lifecycleStages = new Map<string, EpicLifecycleStage[]>();
  private wsjfScores = new Map<string, WSJFScore>();
  private blockers = new Map<string, EpicBlocker[]>();

  constructor(config: EpicLifecycleConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Progress epic through Portfolio Kanban states
   */
  async progressEpicState(
    epicId: string,
    targetState: PortfolioKanbanState,
    gateEvidence?: Record<string, string[]>
  ): Promise<EpicProgressionResult> {
    const epic = this.epics.get(epicId);
    if (!epic) {
      throw new Error(`Epic not found: ${epicId}`);`
    }

    this.logger.info('Progressing epic state', {'
      epicId,
      currentState: epic.status,
      targetState,
    });

    const currentStage = this.getCurrentLifecycleStage(epicId);
    const blockers = this.blockers.get(epicId)||[];

    // Validate gate criteria for progression
    const gateValidation = await this.validateGateCriteria(
      epicId,
      targetState,
      gateEvidence
    );

    if (!gateValidation.canProgress) {
      return {
        success: false,
        newState: epic.status as PortfolioKanbanState,
        previousState: epic.status as PortfolioKanbanState,
        blockers,
        unmetCriteria: gateValidation.unmetCriteria,
        recommendations: gateValidation.recommendations,
        nextActions: gateValidation.nextActions,
      };
    }

    // Update epic state and create new lifecycle stage
    const updatedEpic = {
      ...epic,
      status: this.mapKanbanStateToEpicStatus(targetState),
    };
    this.epics.set(epicId, updatedEpic);

    const newStage: EpicLifecycleStage = {
      stage: targetState,
      enteredAt: new Date(),
      duration: currentStage
        ? differenceInDays(new Date(), currentStage.enteredAt)
        : 0,
      gatesCriteria: gateValidation.passedCriteria,
      completionPercentage: this.calculateStageCompletion(targetState),
      blockers,
      keyActivities: this.getStageActivities(targetState),
      stakeholdersInvolved: this.getStageStakeholders(targetState),
    };

    // Update lifecycle stages
    const stages = this.lifecycleStages.get(epicId)||[];
    stages.push(newStage);
    this.lifecycleStages.set(epicId, stages);

    this.logger.info('Epic state progressed successfully', {'
      epicId,
      newState: targetState,
      duration: newStage.duration,
    });

    return {
      success: true,
      newState: targetState,
      previousState: epic.status as PortfolioKanbanState,
      blockers: [],
      unmetCriteria: [],
      recommendations: [`Epic successfully moved to ${targetState}`],`
      nextActions: this.getNextActions(targetState),
    };
  }

  /**
   * Calculate and update WSJF scores
   */
  async calculateWSJFScore(input: {
    epicId: string;
    businessValue: number;
    urgency: number;
    riskReduction: number;
    opportunityEnablement: number;
    size: number;
    scoredBy: string;
    confidence: number;
  }): Promise<WSJFCalculationResult> {
    this.logger.info('Calculating WSJF score', { epicId: input.epicId });'

    const previousScore = this.wsjfScores.get(input.epicId);

    // Calculate Cost of Delay (CoD)
    const costOfDelay =
      input.businessValue +
      input.urgency +
      input.riskReduction +
      input.opportunityEnablement;

    // Calculate WSJF score (CoD / Size)
    const wsjfScore = costOfDelay / Math.max(input.size, 1);

    const newScore: WSJFScore = {
      businessValue: input.businessValue,
      urgency: input.urgency,
      riskReduction: input.riskReduction,
      opportunityEnablement: input.opportunityEnablement,
      size: input.size,
      wsjfScore,
      lastUpdated: new Date(),
      scoredBy: input.scoredBy,
      confidence: input.confidence,
    };

    this.wsjfScores.set(input.epicId, newScore);

    // Calculate rank change
    const allScores = Array.from(this.wsjfScores.entries())();
    const sortedByScore = orderBy(
      allScores,
      ([, score]) => score.wsjfScore,
      'desc''
    );
    const currentRank =
      sortedByScore.findIndex(([id]) => id === input.epicId) + 1;

    let previousRank = currentRank;
    if (previousScore) {
      const previousSorted = orderBy(
        allScores,
        ([id, score]) =>
          id === input.epicId ? previousScore.wsjfScore : score.wsjfScore,
        'desc''
      );
      previousRank =
        previousSorted.findIndex(([id]) => id === input.epicId) + 1;
    }

    const rankChange = previousRank - currentRank;

    const recommendations = this.generateWSJFRecommendations(
      newScore,
      previousScore
    );

    this.logger.info('WSJF score calculated', {'
      epicId: input.epicId,
      score: wsjfScore,
      rank: currentRank,
      rankChange,
    });

    return {
      epicId: input.epicId,
      currentScore: newScore,
      previousScore,
      rankChange,
      confidence: input.confidence,
      recommendedActions: recommendations,
    };
  }

  /**
   * Add blocker to epic
   */
  async addEpicBlocker(
    epicId: string,
    blockerData: Omit<EpicBlocker, 'id|identifiedAt'>'
  ): Promise<string> {
    const blocker: EpicBlocker = {
      id: `blocker-${nanoid(8)}`,`
      identifiedAt: new Date(),
      ...blockerData,
    };

    const existingBlockers = this.blockers.get(epicId)|'|[];'
    existingBlockers.push(blocker);
    this.blockers.set(epicId, existingBlockers);

    this.logger.warn('Epic blocker added', {'
      epicId,
      blockerId: blocker.id,
      severity: blocker.severity,
    });

    return blocker.id;
  }

  /**
   * Resolve epic blocker
   */
  async resolveEpicBlocker(epicId: string, blockerId: string): Promise<void> {
    const blockers = this.blockers.get(epicId)||[];
    const blockerIndex = blockers.findIndex((b) => b.id === blockerId);

    if (blockerIndex === -1) {
      throw new Error(`Blocker not found: ${blockerId}`);`
    }

    blockers[blockerIndex] = {
      ...blockers[blockerIndex],
      resolvedAt: new Date(),
    };

    this.blockers.set(epicId, blockers);

    this.logger.info('Epic blocker resolved', { epicId, blockerId });'
  }

  /**
   * Get Portfolio Kanban metrics
   */
  async getPortfolioKanbanMetrics(): Promise<PortfolioKanbanMetrics> {
    const allEpics = Array.from(this.epics.values())();
    const allStages = Array.from(this.lifecycleStages.values()).flat();
    const allBlockers = Array.from(this.blockers.values()).flat();
    const allScores = Array.from(this.wsjfScores.values())();

    // State distribution
    const stateDistribution = countBy(allEpics, 'status') as Record<'
      PortfolioKanbanState,
      number
    >;

    // Lead time calculation (funnel to done)
    const completedEpics = filter(
      allEpics,
      (e) => e.status === PortfolioKanbanState.DONE
    );
    const leadTimes = completedEpics.map((epic) => {
      const stages = this.lifecycleStages.get(epic.id)||[];
      const firstStage = stages[0];
      const lastStage = stages[stages.length - 1];

      if (firstStage && lastStage) {
        return differenceInDays(lastStage.enteredAt, firstStage.enteredAt);
      }
      return 0;
    });

    const averageLeadTime =
      leadTimes.length > 0 ? meanBy(leadTimes, (t) => t) : 0;

    // Cycle time calculation (implementing to done)
    const cycleTimeStages = filter(
      allStages,
      (s) =>
        s.stage === PortfolioKanbanState.IMPLEMENTING||s.stage === PortfolioKanbanState.DONE
    );
    const averageCycleTime =
      cycleTimeStages.length > 1
        ? meanBy(cycleTimeStages, (s) => s.duration||0)
        : 0;

    // Throughput (completed epics per month)
    const recentCompletions = filter(completedEpics, (epic) => {
      const stages = this.lifecycleStages.get(epic.id)||[];
      const doneStage = stages.find(
        (s) => s.stage === PortfolioKanbanState.DONE
      );
      return (
        doneStage && differenceInDays(new Date(), doneStage.enteredAt) <= 30
      );
    });
    const throughput = recentCompletions.length;

    // WSJF score distribution
    const wsjfScoreDistribution =
      allScores.length > 0
        ? {
            min: Math.min(...allScores.map((s) => s.wsjfScore)),
            max: Math.max(...allScores.map((s) => s.wsjfScore)),
            avg: meanBy(allScores,'wsjfScore'),
          }
        : { min: 0, max: 0, avg: 0 };

    // Flow efficiency (value-added time / total time)
    const valueAddedStates = [
      PortfolioKanbanState.ANALYZING,
      PortfolioKanbanState.IMPLEMENTING,
    ];
    const valueAddedTime = sumBy(
      filter(allStages, (s) => valueAddedStates.includes(s.stage)),
      'duration''
    );
    const totalTime = sumBy(allStages, 'duration');'
    const flowEfficiency =
      totalTime > 0 ? (valueAddedTime / totalTime) * 100 : 0;

    return {
      stateDistribution,
      averageLeadTime,
      averageCycleTime,
      throughput,
      blockerCount: allBlockers.length,
      wsjfScoreDistribution,
      flowEfficiency,
    };
  }

  /**
   * Get prioritized epic backlog
   */
  async getPrioritizedBacklog(): Promise<
    Array<{
      epic: PortfolioEpic;
      wsjfScore: WSJFScore;
      rank: number;
    }>
  > {
    const epicScores = Array.from(this.wsjfScores.entries())
      .map(([epicId, score]) => ({
        epic: this.epics.get(epicId)!,
        wsjfScore: score,
        rank: 0,
      }))
      .filter((item) => item.epic);

    // Sort by WSJF score and assign ranks
    const sorted = orderBy(epicScores, 'wsjfScore.wsjfScore', 'desc');'
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }

  // Private helper methods

  /**
   * Get current lifecycle stage for epic
   */
  private getCurrentLifecycleStage(epicId: string): EpicLifecycleStage|null {
    const stages = this.lifecycleStages.get(epicId)||[];
    return stages.length > 0 ? stages[stages.length - 1] : null;
  }

  /**
   * Validate gate criteria for epic progression
   */
  private async validateGateCriteria(
    epicId: string,
    targetState: PortfolioKanbanState,
    evidence?: Record<string, string[]>
  ): Promise<{
    canProgress: boolean;
    passedCriteria: GateCriterion[];
    unmetCriteria: GateCriterion[];
    recommendations: string[];
    nextActions: string[];
  }> {
    const gateCriteria = this.getGateCriteria(targetState);
    const passedCriteria: GateCriterion[] = [];
    const unmetCriteria: GateCriterion[] = [];

    for (const criterion of gateCriteria) {
      const hasEvidence = evidence && evidence[criterion.criterion]?.length > 0;
      const isCompleted = hasEvidence||criterion.status ==='completed;

      if (isCompleted) {
        passedCriteria.push({
          ...criterion,
          status: 'completed',
          completionDate: new Date(),
          evidence: evidence?.[criterion.criterion]||[],
        });
      } else {
        unmetCriteria.push(criterion);
      }
    }

    const canProgress = unmetCriteria.length === 0;
    const recommendations = canProgress
      ? [`Epic meets all criteria for ${targetState}`]`
      : [`${unmetCriteria.length} criteria still need to be met`];`

    const nextActions = unmetCriteria.map((c) => `Complete: ${c.criterion}`);`

    return {
      canProgress,
      passedCriteria,
      unmetCriteria,
      recommendations,
      nextActions,
    };
  }

  /**
   * Get gate criteria for specific Portfolio Kanban state
   */
  private getGateCriteria(state: PortfolioKanbanState): GateCriterion[] {
    const baseCriteria: Record<PortfolioKanbanState, GateCriterion[]> = {
      [PortfolioKanbanState.FUNNEL]: [],
      [PortfolioKanbanState.ANALYZING]: [
        {
          criterion:'Epic hypothesis defined',
          status: 'pending',
          owner: 'Epic Owner',
          dueDate: addDays(new Date(), 7),
          evidence: [],
          blockingIssues: [],
        },
        {
          criterion: 'Initial market research completed',
          status: 'pending',
          owner: 'Product Manager',
          dueDate: addDays(new Date(), 14),
          evidence: [],
          blockingIssues: [],
        },
      ],
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]: [
        {
          criterion: 'Business case approved',
          status: 'pending',
          owner: 'Portfolio Manager',
          dueDate: addDays(new Date(), 30),
          evidence: [],
          blockingIssues: [],
        },
        {
          criterion: 'WSJF score calculated',
          status: 'pending',
          owner: 'Epic Owner',
          dueDate: addDays(new Date(), 5),
          evidence: [],
          blockingIssues: [],
        },
      ],
      [PortfolioKanbanState.IMPLEMENTING]: [
        {
          criterion: 'Implementation capacity allocated',
          status: 'pending',
          owner: 'RTE',
          dueDate: addDays(new Date(), 14),
          evidence: [],
          blockingIssues: [],
        },
      ],
      [PortfolioKanbanState.DONE]: [
        {
          criterion: 'Epic acceptance criteria met',
          status: 'pending',
          owner: 'Epic Owner',
          dueDate: addDays(new Date(), 7),
          evidence: [],
          blockingIssues: [],
        },
        {
          criterion: 'Business value realized',
          status: 'pending',
          owner: 'Portfolio Manager',
          dueDate: addDays(new Date(), 30),
          evidence: [],
          blockingIssues: [],
        },
      ],
      [PortfolioKanbanState.CANCELLED]: [],
    };

    return baseCriteria[state]||[];
  }

  /**
   * Calculate completion percentage for lifecycle stage
   */
  private calculateStageCompletion(state: PortfolioKanbanState): number {
    const completionMap: Record<PortfolioKanbanState, number> = {
      [PortfolioKanbanState.FUNNEL]: 10,
      [PortfolioKanbanState.ANALYZING]: 25,
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]: 40,
      [PortfolioKanbanState.IMPLEMENTING]: 80,
      [PortfolioKanbanState.DONE]: 100,
      [PortfolioKanbanState.CANCELLED]: 0,
    };

    return completionMap[state]||0;
  }

  /**
   * Get key activities for lifecycle stage
   */
  private getStageActivities(state: PortfolioKanbanState): string[] {
    const activitiesMap: Record<PortfolioKanbanState, string[]> = {
      [PortfolioKanbanState.FUNNEL]: ['Capture epic idea',
        'Initial assessment',
      ],
      [PortfolioKanbanState.ANALYZING]: [
        'Develop business case',
        'Conduct market research',
        'Define MVP',
      ],
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]: [
        'Prioritize with WSJF',
        'Resource planning',
        'Dependency analysis',
      ],
      [PortfolioKanbanState.IMPLEMENTING]: [
        'Feature development',
        'Solution implementation',
        'Value delivery',
      ],
      [PortfolioKanbanState.DONE]: [
        'Value realization',
        'Lessons learned',
        'Epic closure',
      ],
      [PortfolioKanbanState.CANCELLED]: [
        'Document cancellation',
        'Resource reallocation',
      ],
    };

    return activitiesMap[state]||[];
  }

  /**
   * Get stakeholders involved in lifecycle stage
   */
  private getStageStakeholders(state: PortfolioKanbanState): string[] {
    const stakeholdersMap: Record<PortfolioKanbanState, string[]> = {
      [PortfolioKanbanState.FUNNEL]: ['Epic Owner', 'Portfolio Manager'],
      [PortfolioKanbanState.ANALYZING]: [
        'Epic Owner',
        'Product Manager',
        'Solution Architect',
      ],
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]: [
        'Portfolio Manager',
        'Epic Owner',
        'RTE',
      ],
      [PortfolioKanbanState.IMPLEMENTING]: [
        'Epic Owner',
        'ARTs',
        'Solution Train',
      ],
      [PortfolioKanbanState.DONE]: [
        'Portfolio Manager',
        'Epic Owner',
        'Business Stakeholders',
      ],
      [PortfolioKanbanState.CANCELLED]: ['Portfolio Manager', 'Epic Owner'],
    };

    return stakeholdersMap[state]||[];
  }

  /**
   * Get next actions for lifecycle stage
   */
  private getNextActions(state: PortfolioKanbanState): string[] {
    const actionsMap: Record<PortfolioKanbanState, string[]> = {
      [PortfolioKanbanState.FUNNEL]: ['Develop epic hypothesis',
        'Schedule analysis',
      ],
      [PortfolioKanbanState.ANALYZING]: [
        'Complete business case',
        'Calculate WSJF',
      ],
      [PortfolioKanbanState.PORTFOLIO_BACKLOG]: [
        'Allocate capacity',
        'Plan implementation',
      ],
      [PortfolioKanbanState.IMPLEMENTING]: [
        'Track progress',
        'Manage dependencies',
      ],
      [PortfolioKanbanState.DONE]: ['Measure outcomes', 'Capture learnings'],
      [PortfolioKanbanState.CANCELLED]: [
        'Document reasons',
        'Notify stakeholders',
      ],
    };

    return actionsMap[state]||[];
  }

  /**
   * Map PortfolioKanbanState to PortfolioEpic status
   */
  private mapKanbanStateToEpicStatus(
    kanbanState: PortfolioKanbanState
  ):'analyzing|implementing|done|backlog' {'
    switch (kanbanState) {
      case PortfolioKanbanState.ANALYZING:
        return 'analyzing;
      case PortfolioKanbanState.IMPLEMENTING:
        return 'implementing;
      case PortfolioKanbanState.DONE:
        return 'done;
      case PortfolioKanbanState.PORTFOLIO_BACKLOG:
      case PortfolioKanbanState.FUNNEL:
      default:
        return 'backlog;
    }
  }

  /**
   * Generate WSJF recommendations
   */
  private generateWSJFRecommendations(
    current: WSJFScore,
    previous?: WSJFScore
  ): string[] {
    const recommendations: string[] = [];

    if (current.wsjfScore > 15) {
      recommendations.push('High WSJF score - prioritize for implementation');'
    } else if (current.wsjfScore < 5) {
      recommendations.push('Low WSJF score - consider deferring or cancelling');'
    }

    if (current.confidence < 70) {
      recommendations.push('Low confidence in WSJF scoring - gather more data');'
    }

    if (previous && current.wsjfScore < previous.wsjfScore) {
      recommendations.push('WSJF score decreased - review assumptions');'
    }

    if (current.size > 15) {
      recommendations.push(
        'Large epic size - consider splitting into smaller epics''
      );
    }

    return recommendations;
  }
}
