/**
 * @fileoverview Epic Portfolio Kanban State Machine using XState
 *
 * Implements SAFe Portfolio Kanban flow as formal state machine with:
 * - Funnel states for epic intake
 * - Analysis states for business case evaluation
 * - Portfolio backlog for approved epics
 * - Implementation states for active development
 * - Done states for completed epics
 */

export type EpicKanbanEvent =
  | { type: 'SUBMIT_FOR_ANALYSIS' }
  | { type: 'ANALYSIS_COMPLETE' }
  | { type: 'ANALYSIS_REJECTED'; reason: string }
  | { type: 'APPROVE_FOR_IMPLEMENTATION' }
  | { type: 'CAPACITY_FULL' }
  | { type: 'IMPLEMENTATION_BLOCKED'; blockers: string[] }
  | { type: 'UNBLOCK_IMPLEMENTATION' };

export type EpicKanbanState =
  | { type: 'FUNNEL' }
  | { type: 'ANALYZING' }
  | { type: 'PORTFOLIO_BACKLOG' }
  | { type: 'IMPLEMENTING' }
  | { type: 'DONE' }
  | { type: 'CANCELLED' };

export interface EpicKanbanContext {
  epicId: string;
  businessCase?: string;
  wsjfPriority?: number;
  blockers?: string[];
  analysisResult?: 'approved' | 'rejected';
  rejectionReason?: string;
}

export declare class EpicKanbanStateMachine {
  private logger: any;
  constructor(logger?: any);
  transition(state: EpicKanbanState, event: EpicKanbanEvent): EpicKanbanState;
  getInitialState(): EpicKanbanState;
  isValidTransition(from: EpicKanbanState, to: EpicKanbanState): boolean;
}

export default EpicKanbanStateMachine;