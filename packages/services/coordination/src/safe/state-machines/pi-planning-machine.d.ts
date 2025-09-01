/**
 * @fileoverview PI Planning State Machine using XState
 *
 * Implements SAFe Program Increment Planning ceremony as formal state machine:
 * - Pre-planning preparation
 * - Day 1 planning activities
 * - Day 2 planning activities
 * - Post-planning activities
 */

export type PIPlanningEvent =
  | { type: 'START_PRE_PLANNING' }
  | { type: 'PLANNING_CONTEXT_COMPLETE' }
  | { type: 'TEAM_PLANNING_COMPLETE'; artId: string }
  | { type: 'DAY1_COMPLETE' }
  | { type: 'BEGIN_DAY2_PLANNING' }
  | { type: 'DAY2_COMPLETE' }
  | { type: 'CONFIDENCE_VOTES_COLLECTED' }
  | { type: 'PLANNING_COMPLETE' };

export type PIPlanningState =
  | { type: 'PRE_PLANNING' }
  | { type: 'DAY1_PLANNING' }
  | { type: 'DAY2_PLANNING' }
  | { type: 'CONFIDENCE_VOTING' }
  | { type: 'PLANNING_COMPLETE' }
  | { type: 'PLANNING_CANCELLED' };

export interface PIPlanningContext {
  piId: string;
  artIds: string[];
  planningContext?: string;
  teamPlans?: Record<string, any>;
  dependencies?: string[];
  confidenceVotes?: Record<string, number>;
  risks?: string[];
}

export declare class PIPlanningStateMachine {
  private logger: any;
  constructor(logger?: any);
  transition(state: PIPlanningState, event: PIPlanningEvent): PIPlanningState;
  getInitialState(): PIPlanningState;
  isValidTransition(from: PIPlanningState, to: PIPlanningState): boolean;
}

export default PIPlanningStateMachine;
