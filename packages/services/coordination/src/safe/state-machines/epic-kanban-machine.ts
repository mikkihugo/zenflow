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
  readonly businessCase?:BusinessCase;
  readonly wsjfPriority?:WSJFPriority;
  readonly config: EpicOwnerManagerConfig;
  readonly analysisStartTime?:Date;
  readonly implementationStartTime?:Date;
  readonly estimatedCompletionTime?:Date;
  readonly currentCapacityUsage: number;
  readonly blockers: string[];
  readonly stakeholderApprovals: string[];
  readonly errorMessage?:string;')};;
/**
 * Epic Kanban state machine events
 */
export type EpicKanbanEvent =| { type : 'SUBMIT_FOR_ANALYSIS'; businessCase: ' ANALYSIS_COMPLETE', wsjfPriority: ' ANALYSIS_REJECTED', reason: ' APPROVE_FOR_IMPLEMENTATION}| { type: ' CAPACITY_FULL}| { type: ' IMPLEMENTATION_BLOCKED', blockers: ' UNBLOCK_IMPLEMENTATION}| { type: ' SPLIT_EPIC', splitEpics: ' CANCEL_EPIC', reason: string}| { type};;
// ============================================================================
// GUARDS (BUSINESS RULES)
// ============================================================================
/**
 * Guards for epic state transitions
 */
const epicKanbanGuards = {
  /**
   * Check if business case meets minimum threshold for analysis
   */
  businessCaseValid: ({ context}:{ context: EpicKanbanContext}) => {
    return (
      (context.businessCase?.businessValue?.totalValue ?? 0) >=
      context.config.businessCaseThreshold;
    );
},
  /**
   * Check if WSJF score meets threshold for portfolio backlog
   */
  wsjfScoreAcceptable: ({ context}:{ context: EpicKanbanContext}) => {
    return (context.wsjfPriority?.wsjfScore ?? 0) >= 5.0; // Configurable threshold
},
  /**
   * Check if implementation capacity is available
   */
  capacityAvailable: ({ context}:{ context: EpicKanbanContext}) => {
    return (
      context.currentCapacityUsage < context.config.maxEpicsInImplementation
    );
},
  /**
   * Check if epic exceeds timebox limit
   */
  withinTimebox: ({ context}:{ context: EpicKanbanContext}) => {
    if (!context.implementationStartTime) return true;
    const weeksSinceStart = Math.floor(
      (Date.now() - context.implementationStartTime.getTime()) /
        (7 * 24 * 60 * 60 * 1000);
    );
    return weeksSinceStart <= context.config.epicTimeboxWeeks;
},
  /**
   * Check if epic has no blockers
   */
  noBlockers: ({ context}:{ context: EpicKanbanContext}) => {
    return context.blockers.length === 0;
},
  /**
   * Check if all required stakeholder approvals are obtained
   */
  stakeholderApproved: ({ context}:{ context: EpicKanbanContext}) => {
    return context.stakeholderApprovals.length >= 2; // Minimum required approvals
},
'};;
// ============================================================================
// ACTIONS (STATE SIDE EFFECTS)
// ============================================================================
/**
 * Actions performed during state transitions
 */
const epicKanbanActions = {
  /**
   * Store business case and trigger analysis
   */
  startAnalysis: assign({
    businessCase:({
      event,
}:{
    ')      event: Extract<EpicKanbanEvent, { type}>')}) => event.businessCase,';
    analysisStartTime: () => new Date(),
    errorMessage: () => undefined,
}),
  /**
   * Store WSJF priority calculation results
   */
  storeWSJFPriority: assign({
    wsjfPriority:({
      event,
}: ')'      event: Extract<EpicKanbanEvent, { type}>';) => event.wsjfPriority,';
}),
  /**
   * Handle analysis rejection
   */
  handleAnalysisRejection: assign({
    errorMessage:({
      event,
};
      event: Extract<EpicKanbanEvent, { type}>';) => event.reason,';
}),
  /**
   * Start implementation tracking
   */
  startImplementation: assign({
    implementationStartTime:({
      event,
}: ')'      event: Extract<EpicKanbanEvent, { type}>';) => event.startTime,';
    currentCapacityUsage: (context ) => context.currentCapacityUsage + 1,
}),
  /**
   * Handle implementation blockers
   */
  addBlockers: assign({
    blockers:({
      event,
};
      event: Extract<EpicKanbanEvent, { type}>';) => event.blockers,`;
}),
  /**
   * Clear implementation blockers
   */
  clearBlockers: assign({
    blockers:() => [],
}),
  /**
   * Complete epic and free capacity
   */
  completeEpic: assign({
    currentCapacityUsage:({ context}) =>
      Math.max(0, context.currentCapacityUsage - 1),
    estimatedCompletionTime: () => new Date(),
}),
  /**
   * Log state transitions for audit trail
   */
  logTransition: ({
    context,
    event,
}:{
    context: EpicKanbanContext;
    event: EpicKanbanEvent;
}) => {
    // Log epic state transition for audit trail
    logger.info(``Epic ${context.epic.id}:${event.type}, {`)      epicId: context.epic.id,``;
      event: event.type,
      timestamp: new Date(),
      wsjfScore: context.wsjfPriority?.wsjfScore,
});
},')'};;
// ============================================================================
// STATE MACHINE DEFINITION
// ============================================================================
/**
 * Epic Portfolio Kanban state machine
 *
 * Implements formal SAFe portfolio kanban flow with: createMachine(
  {
    id : 'epicKanban')    initial,    context: 'logTransition,',
'        on: 'analyzing',)            guard : 'businessCaseValid')            actions,},';
},
},
      /**
       * ANALYZING STATE - Business case analysis and WSJF calculation
       */
      analyzing: 'businessCaseAnalysis',)          src,          onDone: 'portfolio_backlog',)            actions,},';
          onError: 'funnel',)            actions,},';
},
        on: 'portfolio_backlog',)            guard : 'wsjfScoreAcceptable')            actions,},';
          ANALYSIS_REJECTED: 'funnel',)            actions,},';
},
},
      /**
       * PORTFOLIO BACKLOG STATE - Prioritized and ready for implementation
       */
      portfolio_backlog: 'logTransition,',
'        on: 'implementing',)            guard : 'capacityAvailable')            actions,},')          CAPACITY_FULL : 'portfolio_backlog,// Stay in backlog')          SPLIT_EPIC,},';
},
      /**
       * IMPLEMENTING STATE - Active development
       */
      implementing: 'logTransition',)        initial : 'active,'
'        states: 'blocked',)                actions,},';
              IMPLEMENTATION_COMPLETE: '#epicKanban.done',)                guard : 'withinTimebox')                actions,},';
},
},
          blocked: 'active',)                guard : 'noBlockers')                actions,},';
},
},
},
        on: 'funnel',)          SPLIT_EPIC,},';
},
      /**
       * DONE STATE - Epic completed and value delivered
       */
      done: 'funnel',)      RETRY,},';
},
  {
    guards: epicKanbanGuards as any,
    actions: epicKanbanActions as any,
    // Services for async operations
    actors: {
      analyzeBusinessCase: fromPromise(
        async ({ input}:{ input: EpicKanbanContext}) => {
          // Mock business case analysis - replace with actual implementation
          await new Promise((resolve) => setTimeout(resolve, 2000);
          const wsjfPriority: {
            epicId: (Business Value + Time Criticality + RROE) / Job Size
            ranking: 1,
            calculatedAt: new Date(),
};
          return wsjfPriority;
}
      ),
},')};)');
// ============================================================================
// TYPE EXPORTS
// ============================================================================
/**
 * Epic Kanban state machine actor type
 */
export type EpicKanbanMachineActor = ActorRefFrom<typeof epicKanbanMachine>;
/**
 * Factory function to create epic kanban state machine
 */
export function createEpicKanbanMachine(
  epic: createMachine(
    {
      ...epicKanbanMachine.config,
      context: {
        epic,
        config,
        currentCapacityUsage: 0,
        blockers: [],
        stakeholderApprovals: [],
} as EpicKanbanContext,
},
    {
      guards: epicKanbanGuards as any,
      actions: epicKanbanActions as any,
      actors: {
        analyzeBusinessCase: fromPromise(
          async ({ input}:{ input: EpicKanbanContext}) => {
            // Mock business case analysis - replace with actual implementation;
            await new Promise((resolve) => setTimeout(resolve, 2000);
            const wsjfPriority: {
              epicId: (Business Value + Time Criticality + RROE) / Job Size
              ranking: 1,
              calculatedAt: new Date(),
};
            return wsjfPriority;
}
        ),
},
}
  );
  return contextualMachine;
}
;)';