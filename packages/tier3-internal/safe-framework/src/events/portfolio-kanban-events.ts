/**
 * @fileoverview SAFe Portfolio Kanban Event System
 *
 * Event-driven architecture for SAFe Portfolio Kanban state transitions.
 * Manages epic lifecycle through Portfolio Kanban states with proper
 * governance and approval workflows.
 *
 * SAFe Portfolio Kanban States:
 * - Funnel: New epic ideas
 * - Analyzing: Epic hypothesis and business case development
 * - Portfolio Backlog: Approved epics awaiting implementation
 * - Implementing: Epics in active development
 * - Done: Completed epics with validated business hypothesis
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import { nanoid } from 'nanoid';
import { EventBus, createEvent, EventPriority } from '@claude-zen/event-system';

/**
 * SAFe Portfolio Kanban states
 */
export enum PortfolioKanbanState {
  FUNNEL = 'funnel',
  ANALYZING = 'analyzing',
  PORTFOLIO_BACKLOG = 'portfolio-backlog',
  IMPLEMENTING = 'implementing',
  DONE = 'done',
}

/**
 * Epic state transition event
 */
export interface EpicStateTransitionEvent {
  readonly epicId: string;
  readonly fromState: PortfolioKanbanState;
  readonly toState: PortfolioKanbanState;
  readonly triggeredBy: string;
  readonly reason: string;
  readonly evidence?: Record<string, string[]>;
  readonly timestamp: Date;
  readonly transitionId: string;
}

/**
 * Epic blocked event
 */
export interface EpicBlockedEvent {
  readonly epicId: string;
  readonly currentState: PortfolioKanbanState;
  readonly blockerId: string;
  readonly blockerType:|'technical|business|resource|external|regulatory';
  readonly severity: 'low|medium|high|critical';
  readonly description: string;
  readonly owner: string;
  readonly timestamp: Date;
}

/**
 * Epic unblocked event
 */
export interface EpicUnblockedEvent {
  readonly epicId: string;
  readonly blockerId: string;
  readonly resolution: string;
  readonly resolvedBy: string;
  readonly timestamp: Date;
}

/**
 * WSJF score updated event
 */
export interface WSJFScoreUpdatedEvent {
  readonly epicId: string;
  readonly previousScore: number;
  readonly newScore: number;
  readonly scoredBy: string;
  readonly rank: number;
  readonly rankChange: number;
  readonly timestamp: Date;
}

/**
 * Portfolio Kanban event types
 */
export const PORTFOLIO_KANBAN_EVENTS = {
  EPIC_STATE_TRANSITION: 'portfolio-kanban:epic-transition',
  EPIC_BLOCKED: 'portfolio-kanban:epic-blocked',
  EPIC_UNBLOCKED: 'portfolio-kanban:epic-unblocked',
  WSJF_SCORE_UPDATED: 'portfolio-kanban:wsjf-updated',
  PORTFOLIO_REBALANCED: 'portfolio-kanban:rebalanced',
} as const;

/**
 * Create epic state transition event
 */
export function createEpicStateTransition(params: {
  epicId: string;
  fromState: PortfolioKanbanState;
  toState: PortfolioKanbanState;
  triggeredBy: string;
  reason: string;
  evidence?: Record<string, string[]>;
}): EpicStateTransitionEvent {
  return {
    epicId: params.epicId,
    fromState: params.fromState,
    toState: params.toState,
    triggeredBy: params.triggeredBy,
    reason: params.reason,
    evidence: params.evidence,
    timestamp: new Date(),
    transitionId: nanoid(),
  };
}

/**
 * Create epic blocked event
 */
export function createEpicBlocked(params: {
  epicId: string;
  currentState: PortfolioKanbanState;
  blockerType: EpicBlockedEvent['blockerType'];
  severity: EpicBlockedEvent['severity'];
  description: string;
  owner: string;
}): EpicBlockedEvent {
  return {
    epicId: params.epicId,
    currentState: params.currentState,
    blockerId: nanoid(),
    blockerType: params.blockerType,
    severity: params.severity,
    description: params.description,
    owner: params.owner,
    timestamp: new Date(),
  };
}

/**
 * Create WSJF score updated event
 */
export function createWSJFScoreUpdate(params: {
  epicId: string;
  previousScore: number;
  newScore: number;
  scoredBy: string;
  rank: number;
  rankChange: number;
}): WSJFScoreUpdatedEvent {
  return {
    epicId: params.epicId,
    previousScore: params.previousScore,
    newScore: params.newScore,
    scoredBy: params.scoredBy,
    rank: params.rank,
    rankChange: params.rankChange,
    timestamp: new Date(),
  };
}

/**
 * Portfolio Kanban state machine for epic lifecycle management
 */
export class PortfolioKanbanStateMachine {
  private readonly allowedTransitions: Map<
    PortfolioKanbanState,
    PortfolioKanbanState[]
  >;

  constructor() {
    // Define valid SAFe Portfolio Kanban state transitions
    this.allowedTransitions = new Map([
      [PortfolioKanbanState.FUNNEL, [PortfolioKanbanState.ANALYZING]],
      [
        PortfolioKanbanState.ANALYZING,
        [
          PortfolioKanbanState.FUNNEL, // Reject back to funnel
          PortfolioKanbanState.PORTFOLIO_BACKLOG,
        ],
      ],
      [
        PortfolioKanbanState.PORTFOLIO_BACKLOG,
        [
          PortfolioKanbanState.ANALYZING, // Need more analysis
          PortfolioKanbanState.IMPLEMENTING,
        ],
      ],
      [
        PortfolioKanbanState.IMPLEMENTING,
        [
          PortfolioKanbanState.PORTFOLIO_BACKLOG, // Scope reduction
          PortfolioKanbanState.DONE,
        ],
      ],
      [PortfolioKanbanState.DONE, []], // Terminal state
    ]);
  }

  /**
   * Check if state transition is valid according to SAFe Portfolio Kanban rules
   */
  isValidTransition(
    fromState: PortfolioKanbanState,
    toState: PortfolioKanbanState
  ): boolean {
    const allowedTargets = this.allowedTransitions.get(fromState);
    return allowedTargets ? allowedTargets.includes(toState) : false;
  }

  /**
   * Get allowed transitions from current state
   */
  getAllowedTransitions(
    currentState: PortfolioKanbanState
  ): PortfolioKanbanState[] {
    return this.allowedTransitions.get(currentState)||[];
  }

  /**
   * Get state validation requirements
   */
  getStateRequirements(state: PortfolioKanbanState): {
    required: string[];
    optional: string[];
    gates: string[];
  } {
    switch (state) {
      case PortfolioKanbanState.FUNNEL:
        return {
          required: ['epic-hypothesis', 'problem-statement'],
          optional: ['market-research', 'customer-feedback'],
          gates: [],
        };

      case PortfolioKanbanState.ANALYZING:
        return {
          required: ['business-case', 'wsjf-score', 'lean-business-case'],
          optional: ['market-analysis', 'competitive-analysis'],
          gates: ['epic-review-board'],
        };

      case PortfolioKanbanState.PORTFOLIO_BACKLOG:
        return {
          required: [
            'approved-business-case',
            'prioritized-wsjf',
            'capacity-allocation',
          ],
          optional: ['roadmap-alignment'],
          gates: ['portfolio-sync'],
        };

      case PortfolioKanbanState.IMPLEMENTING:
        return {
          required: ['art-assignment', 'pi-planning', 'mvp-definition'],
          optional: ['architecture-runway', 'enablers'],
          gates: ['system-demo', 'inspect-adapt'],
        };

      case PortfolioKanbanState.DONE:
        return {
          required: ['hypothesis-validation', 'business-outcome-measurement'],
          optional: ['lessons-learned', 'retrospective'],
          gates: ['final-demo', 'value-realization'],
        };

      default:
        return { required: [], optional: [], gates: [] };
    }
  }
}

/**
 * Portfolio Kanban metrics and analytics
 */
export interface PortfolioKanbanMetrics {
  readonly stateDistribution: Record<PortfolioKanbanState, number>;
  readonly averageLeadTime: number; // Days from funnel to done
  readonly throughput: number; // Epics completed per PI
  readonly wsjfScoreDistribution: { min: number; max: number; avg: number };
  readonly blockedEpicsCount: number;
  readonly cycleTimeByState: Record<PortfolioKanbanState, number>;
  readonly cumulativeFlowData: Array<{
    date: Date;
    stateData: Record<PortfolioKanbanState, number>;
  }>;
}

/**
 * Portfolio Kanban workflow orchestrator
 */
export class PortfolioKanbanWorkflow {
  private readonly stateMachine: PortfolioKanbanStateMachine;
  private readonly eventBus: EventBus;
  private readonly epicStates = new Map<string, PortfolioKanbanState>();
  private readonly blockedEpics = new Map<string, EpicBlockedEvent[]>();

  constructor(eventBus: EventBus) {
    this.stateMachine = new PortfolioKanbanStateMachine();
    this.eventBus = eventBus;
  }

  /**
   * Transition epic to new Portfolio Kanban state
   */
  transitionEpic(params: {
    epicId: string;
    targetState: PortfolioKanbanState;
    triggeredBy: string;
    reason: string;
    evidence?: Record<string, string[]>;
  }): {
    success: boolean;
    newState: PortfolioKanbanState;
    message: string;
  } {
    const currentState =
      this.epicStates.get(params.epicId)||PortfolioKanbanState.FUNNEL;

    // Validate transition according to SAFe rules
    if (
      !this.stateMachine.isValidTransition(currentState, params.targetState)
    ) {
      return {
        success: false,
        newState: currentState,
        message: `Invalid transition from ${currentState} to ${params.targetState}`,
      };
    }

    // Check state requirements
    const requirements = this.stateMachine.getStateRequirements(
      params.targetState
    );
    const validationResult = this.validateStateRequirements(
      params.epicId,
      requirements,
      params.evidence
    );

    if (!validationResult.isValid) {
      return {
        success: false,
        newState: currentState,
        message: `Requirements not met: ${validationResult.missingRequirements.join(', ')}`,
      };
    }

    // Perform transition
    this.epicStates.set(params.epicId, params.targetState);

    // Emit state transition event
    const transitionEvent = createEpicStateTransition({
      epicId: params.epicId,
      fromState: currentState,
      toState: params.targetState,
      triggeredBy: params.triggeredBy,
      reason: params.reason,
      evidence: params.evidence,
    });

    this.eventBus.emit(
      createEvent({
        type: PORTFOLIO_KANBAN_EVENTS.EPIC_STATE_TRANSITION,
        data: transitionEvent,
        priority: EventPriority.HIGH,
      })
    );

    return {
      success: true,
      newState: params.targetState,
      message: `Epic successfully transitioned to ${params.targetState}`,
    };
  }

  /**
   * Block epic with specific blocker
   */
  blockEpic(params: {
    epicId: string;
    blockerType: EpicBlockedEvent['blockerType'];
    severity: EpicBlockedEvent['severity'];
    description: string;
    owner: string;
  }): string {
    const currentState =
      this.epicStates.get(params.epicId)||PortfolioKanbanState.FUNNEL;

    const blockedEvent = createEpicBlocked({
      epicId: params.epicId,
      currentState,
      blockerType: params.blockerType,
      severity: params.severity,
      description: params.description,
      owner: params.owner,
    });

    // Track blocker
    const existingBlockers = this.blockedEpics.get(params.epicId)||[];
    existingBlockers.push(blockedEvent);
    this.blockedEpics.set(params.epicId, existingBlockers);

    // Emit blocked event
    this.eventBus.emit(
      createEvent({
        type: PORTFOLIO_KANBAN_EVENTS.EPIC_BLOCKED,
        data: blockedEvent,
        priority:
          blockedEvent.severity ==='critical'
            ? EventPriority.CRITICAL
            : EventPriority.HIGH,
      })
    );

    return blockedEvent.blockerId;
  }

  /**
   * Validate state transition requirements
   */
  private validateStateRequirements(
    epicId: string,
    requirements: { required: string[]; optional: string[]; gates: string[] },
    evidence?: Record<string, string[]>
  ): {
    isValid: boolean;
    missingRequirements: string[];
    pendingGates: string[];
  } {
    const missingRequirements: string[] = [];
    const pendingGates: string[] = [];

    // Check required evidence
    for (const requirement of requirements.required) {
      if (
        !evidence ||
        !evidence[requirement] ||
        evidence[requirement].length === 0
      ) {
        missingRequirements.push(requirement);
      }
    }

    // Check gates (would integrate with external gate validation)
    for (const gate of requirements.gates) {
      // Simplified gate validation - in real implementation would check external systems
      if (!evidence || !evidence[`gate-${gate}`]) {
        pendingGates.push(gate);
      }
    }

    return {
      isValid: missingRequirements.length === 0 && pendingGates.length === 0,
      missingRequirements,
      pendingGates,
    };
  }
}
