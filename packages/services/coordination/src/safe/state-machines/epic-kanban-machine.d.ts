/**
 * @fileoverview Epic Portfolio Kanban State Machine using XState
 *
 * Implements SAFe Portfolio Kanban flow as formal state machine with:
 * - State transitions: Funnel → Analyzing → Portfolio Backlog → Implementing → Done
 * - Guards for WSJF threshold validation and capacity limits
 * - Actions for business case validation and epic splitting
 * - Services for async operations (analysis, implementation tracking)
 *
 * Replaces custom enum-based state management with battle-tested XState.
 *
 * BENEFITS:
 * - Formal state machine validation prevents invalid transitions
 * - Visual state diagrams for documentation and debugging
 * - Time-travel debugging and state inspection
 * - Predictable state behavior with guards and actions
 * - Integration with XState devtools for monitoring
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import type { PortfolioEpic } from '../types';
interface BusinessCase {
    businessValue: {
        totalValue: number;
    };
}
interface WSJFPriority {
    epicId: string;
    userBusinessValue: number;
    timeCriticality: number;
    riskReductionOpportunityEnablement: number;
    jobSize: number;
    wsjfScore: number;
    ranking: number;
    calculatedAt: Date;
}
interface EpicOwnerManagerConfig {
    businessCaseThreshold: number;
    maxEpicsInImplementation: number;
    epicTimeboxWeeks: number;
}
/**
 * Epic Kanban state machine context
 */
export interface EpicKanbanContext {
    readonly epic: PortfolioEpic;
    readonly businessCase?: BusinessCase;
    readonly wsjfPriority?: WSJFPriority;
    readonly config: EpicOwnerManagerConfig;
    readonly analysisStartTime?: Date;
    readonly implementationStartTime?: Date;
    readonly estimatedCompletionTime?: Date;
    readonly currentCapacityUsage: number;
    readonly blockers: string[];
    readonly stakeholderApprovals: string[];
    readonly errorMessage?: string;
}
/**
 * Epic Kanban state machine events
 */
export type EpicKanbanEvent = {
    type: 'SUBMIT_FOR_ANALYSIS';
    businessCase: BusinessCase;
} | {
    type: 'ANALYSIS_COMPLETE';
    wsjfPriority: WSJFPriority;
} | {
    type: 'ANALYSIS_REJECTED';
    reason: string;
} | {
    type: 'APPROVE_FOR_IMPLEMENTATION';
} | {
    type: 'CAPACITY_AVAILABLE';
} | {
    type: 'CAPACITY_FULL';
} | {
    type: 'IMPLEMENTATION_STARTED';
    startTime: Date;
} | {
    type: 'IMPLEMENTATION_BLOCKED';
    blockers: string[];
} | {
    type: 'UNBLOCK_IMPLEMENTATION';
} | {
    type: 'IMPLEMENTATION_COMPLETE';
} | {
    type: 'SPLIT_EPIC';
    splitEpics: PortfolioEpic[];
} | {
    type: 'CANCEL_EPIC';
    reason: string;
} | {
    type: 'RETRY';
};
export {};
//# sourceMappingURL=epic-kanban-machine.d.ts.map