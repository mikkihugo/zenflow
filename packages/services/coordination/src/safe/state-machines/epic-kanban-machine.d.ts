/**
 * @fileoverview Epic Portfolio Kanban State Machine using XState
 *
 * Implements SAFe Portfolio Kanban flow as formal state machine with: getLogger('EpicKanbanMachine');
// ============================================================================
// STATE MACHINE CONTEXT
// ============================================================================
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
    ')};;: any;
}
/**
 * Epic Kanban state machine events
 */
export type EpicKanbanEvent = {
    type: 'SUBMIT_FOR_ANALYSIS';
    businessCase: ' ANALYSIS_COMPLETE';
    wsjfPriority: ' ANALYSIS_REJECTED';
    reason: ' APPROVE_FOR_IMPLEMENTATION}| { type: ';
    CAPACITY_FULL: any;
} | {
    type: ' IMPLEMENTATION_BLOCKED';
    blockers: ' UNBLOCK_IMPLEMENTATION}| { type: ';
};
//# sourceMappingURL=epic-kanban-machine.d.ts.map