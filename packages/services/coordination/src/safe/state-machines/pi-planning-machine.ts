/**
 * @fileoverview PI Planning State Machine using XState
 *
 * Implements SAFe Program Increment Planning ceremony as formal state machine: getLogger('PIPlanningMachine');
// ============================================================================
// STATE MACHINE CONTEXT
// ============================================================================
/**
 * PI Planning state machine context
 */
export interface PIPlanningContext {
  readonly pi: ProgramIncrement;
  readonly arts: AgileReleaseTrain[];
  readonly config: PIPlanningConfig;
  readonly planningStartTime?:Date;
  readonly day1CompletionTime?:Date;
  readonly day2CompletionTime?:Date;
  readonly totalCapacity: TeamCapacity[];
  readonly plannedFeatures: Feature[];
  readonly piObjectives: PIObjective[];
  readonly dependencies: Dependency[];
  readonly risks: Risk[];
  readonly confidenceVote?:number; // 1-5 scale')  readonly commitmentLevel : 'uncommitted' | ' partial'|' committed')  readonly blockers: string[];;
  readonly facilitatorNotes: string[];
  readonly errorMessage?:string;
}
/**
 * PI Planning state machine events
 */
export type PIPlanningEvent =| { type : 'START_PLANNING', startTime: ' BUSINESS_CONTEXT_COMPLETE}| { type: ' PLANNING_CONTEXT_COMPLETE}| { type: 'TEAM_PLANNING_COMPLETE',)      artId: 'DAY1_COMPLETE', dependencies: ' BEGIN_DAY2_PLANNING}| { type: ' RISK_ADDRESSED', riskId: ' OBJECTIVE_DEFINED', objective: ' DAY2_COMPLETE', objectives: ' CONFIDENCE_VOTE', vote: ' PLANNING_ADJUSTMENTS_NEEDED', adjustments: ' ADJUSTMENTS_COMPLETE}| { type: ' ABORT_PLANNING', reason: string}| { type};;
// ============================================================================
// GUARDS (BUSINESS RULES)
// ============================================================================
/**
 * Guards for PI planning state transitions
 */
const piPlanningGuards = {
  /**
   * Check if all pre-planning artifacts are ready
   */
  prePlanningReady: ({ context}:  { context: PIPlanningContext}) => {
    return context.arts.length > 0 && context.pi.id && context.pi.startDate;
},
  /**
   * Check if all teams have completed day 1 planning
   */
  allTeamsPlanned: ({ context}:  { context: PIPlanningContext}) => {
    return (
      context.totalCapacity.length === context.arts.length &&
      context.plannedFeatures.length > 0
    );
},
  /**
   * Check if critical dependencies are identified and manageable
   */
  dependenciesManageable: ({ context}:  { context: PIPlanningContext}) => {
    const criticalDependencies = context.dependencies.filter(
      (d) => (d as any).criticality ==='high'|| (d as any).type ===blocking')    ).length;';
    return criticalDependencies <= 5;
},
  /**
   * Check if high risks are addressed with mitigation plans
   */
  risksAddressed: ({ context}:  { context: PIPlanningContext}) => {
    const highRisks = context.risks.filter((r) => r.impact === 'high');
    return highRisks.every((r) => r.mitigation);
},
  /**
   * Check if PI objectives meet quality standards
   */
  objectivesValid: ({ context}:  { context: PIPlanningContext}) => {
    return (
      context.piObjectives.length >= 3 &&
      context.piObjectives.every((obj) => obj.businessValue && obj.description));
},
  /**
   * Check if confidence vote meets minimum threshold
   */
  confidenceAcceptable: ({ context}:  { context: PIPlanningContext}) => {
    return (context.confidenceVote ?? 0) >= 3; // Minimum confidence level
},
  /**
   * Check if capacity utilization is realistic (80-100%)
   */
  capacityRealistic: ({ context}:  { context: PIPlanningContext}) => {
    const totalCapacity = context.totalCapacity.reduce(
      (sum, tc) => sum + tc.availableCapacity,
      0;
    );
    const plannedWork = context.plannedFeatures.reduce(
      (sum, f) => sum + (f.businessValue|| 0),
      0;
    );
    const utilization = plannedWork / totalCapacity;
    return utilization >= 0.8 && utilization <= 1.0;
},
  /**
   * Check if planning is within time constraints
   */
  withinTimeConstraints: ({ context}:  { context: PIPlanningContext}) => {
    if (!context.planningStartTime) return true;
    const hoursElapsed =;
      (Date.now() - context.planningStartTime.getTime()) / (1000 * 60 * 60);
    return hoursElapsed <= 16; // Standard 2-day planning event
},
'};;
// ============================================================================
// ACTIONS (STATE SIDE EFFECTS)
// ============================================================================
/**
 * Actions performed during state transitions
 */
const piPlanningActions = {
  /**
   * Initialize planning session
   */
  initializePlanning: assign({
    planningStartTime:({
      event,
}:  {
    ')      event: Extract<PIPlanningEvent, { type}>')}) => event.startTime,')    commitmentLevel: () =>'uncommitted ' as const,';
    _blockers: () => [],
    _facilitatorNotes: () => [],
    _errorMessage: () => undefined,
}),
  /**
   * Record team planning completion
   */
  recordTeamPlanning: assign({
    totalCapacity:({ context, event}) => {
      const teamEvent = event as Extract<
        PIPlanningEvent,
        { type : 'TEAM_PLANNING_COMPLETE};;
'>;';
      return [...context.totalCapacity, teamEvent.capacity];
},
    plannedFeatures: (context, event ) => {
      const teamEvent = event as Extract<
        PIPlanningEvent,
        { type : 'TEAM_PLANNING_COMPLETE};;
'>;';
      return [...context.plannedFeatures, ...teamEvent.features];
},
}),
  /**
   * Capture day 1 artifacts
   */
  captureDay1Artifacts: assign({
    day1CompletionTime:() => new Date(),
    dependencies: (
      event,:
      event: Extract<PIPlanningEvent, { type}>';) => event.dependencies,';
    risks: (
      event,: ')'      event: Extract<PIPlanningEvent, { type}>';) => event.risks,';
}),
  /**
   * Store PI objectives
   */
  storeObjectives: assign({
    piObjectives:({
      event,
};
      event: Extract<PIPlanningEvent, { type}>';) => event.objectives,';
    day2CompletionTime: () => new Date(),
}),
  /**
   * Record confidence vote
   */
  recordConfidenceVote: assign({
    confidenceVote:({
      event,
}: ')'      event: Extract<PIPlanningEvent, { type}>';) => event.vote,';
}),
  /**
   * Handle planning adjustments
   */
  handleAdjustments: assign({
    blockers:({
      event,
};
      event: Extract<PIPlanningEvent, { type}>';) => event.adjustments,';
}),
  /**
   * Clear adjustments after completion
   */
  clearAdjustments: assign({
    blockers:() => [],
}),
  /**
   * Commit to PI execution
   */
  commitToPi: assign({
    ')    commitmentLevel:() =>'committed ' as const,`;
}),
  /**
   * Log planning milestone
   */
  logMilestone: ({
    context,
    event,
}:  {
    context: PIPlanningContext;
    event: PIPlanningEvent;
}) => {
    logger.info(``PI ${context.pi.id} Planning: ${event.type}, {`)      piId: context.pi.id,``;
      event: event.type,
      timestamp: new Date(),
      artsCount: context.arts.length,
      confidenceVote: context.confidenceVote,
});
},
  /**
   * Notify parent of planning completion
   */
  notifyPlanningComplete: sendParent(({ context}) => ({
    type : 'PI_PLANNING_COMPLETE,'
'    piId: context.pi.id,';
    objectives: context.piObjectives,',    commitment: context.commitmentLevel,')})),')'};;
// ============================================================================
// STATE MACHINE DEFINITION
// ============================================================================
/**
 * PI Planning state machine
 *
 * Implements formal SAFe PI Planning ceremony with: createMachine(
  {
    id : 'piPlanning')    initial,    context: 'logMilestone,',
'        on: 'planningDay1',)            guard : 'prePlanningReady')            actions,},';
},
},
      /**
       * DAY 1 PLANNING STATE - Business context, vision, and team planning
       */
      planningDay1: 'logMilestone',)        initial : 'businessContext,'
'        states: 'teamPlanning',)                actions,},';
              DAY1_COMPLETE: '#piPlanning.planningDay2',)                guard : 'allTeamsPlanned')                actions,},';
},
},
},
},
      /**
       * DAY 2 PLANNING STATE - Dependencies, risks, and objectives
       */
      planningDay2: 'logMilestone',)        initial : 'dependencyAnalysis,'
'        states: 'objectiveSetting',)                guard,},';
},
},
          riskAnalysis: 'objectiveSetting',)                guard,},';
},
},
          objectiveSetting: 'objectiveSetting',)                // Store individual objectives as they're defined';
},
              DAY2_COMPLETE: '#piPlanning.confidenceVote',)                guard : 'objectivesValid')                actions,},';
},
},
},
},
      /**
       * CONFIDENCE VOTE STATE - Team confidence assessment
       */
      confidenceVote: 'logMilestone,',
'        on: 'commitment',)            guard : 'confidenceAcceptable')            actions,},';
          PLANNING_ADJUSTMENTS_NEEDED: 'adjustments',)            actions,},';
},
},
      /**
       * ADJUSTMENTS STATE - Address low confidence issues
       */
      adjustments: 'logMilestone,',
'        on: 'confidenceVote',)            guard : 'capacityRealistic')            actions,},';
},
},
      /**
       * COMMITMENT STATE - Final PI commitment
       */
      commitment: 'logMilestone,',
'        on: 'complete',)            actions:['commitToPi,' notifyPlanningComplete'],';
},
},
},
      /**
       * COMPLETE STATE - Planning ceremony finished
       */
      complete: 'error',)      RESTART_PLANNING,},';
},
  {
    guards: piPlanningGuards as any,
    actions: piPlanningActions as any,
    // Services for async operations
    actors:  {
      planningOrchestrator: fromPromise(
        async ({ input}:  { input: PIPlanningContext}) => {
          // Coordinate planning across multiple ARTs
          // This would integrate with actual planning tools
          logger.info(')`;
            `Orchestrating PI planning for `${input.arts.length} ARTs``)          );
          // Mock coordination process
          await new Promise((resolve) => setTimeout(resolve, 1000);')          return {';
    ')            status : 'orchestrated,'
'            artsCount: input.arts.length,';
            coordinatedAt: new Date(),',};;
}
      ),
},
};));`;
// ============================================================================
// TYPE EXPORTS
// ============================================================================
/**
 * PI Planning state machine actor type
 */
export type PIPlanningMachineActor = ActorRefFrom<typeof piPlanningMachine>;
/**
 * Factory function to create PI planning state machine
 */
export function createPIPlanningMachine(
  pi: createMachine(
    {
      ...piPlanningMachine.config,
      context: 'uncommitted,',
        blockers: [],
        facilitatorNotes: [],',} as PIPlanningContext,';
},
    {
      guards: piPlanningGuards as any,
      actions: piPlanningActions as any,
      actors:  {
        planningOrchestrator: fromPromise(
          async ({ input}:  { input: PIPlanningContext}) => {
            // Coordinate planning across multiple ARTs
            // This would integrate with actual planning tools
            logger.info('')`;
              `Orchestrating PI planning for `${input.arts.length} ARTs``)            );
            // Mock coordination process
            await new Promise((resolve) => setTimeout(resolve, 1000);
            return {
    ')              status : 'orchestrated,'
              artsCount: input.arts.length,
              coordinatedAt: new Date(),,};;
}
        ),
},
}
  );
  return contextualMachine;
}
;)`;