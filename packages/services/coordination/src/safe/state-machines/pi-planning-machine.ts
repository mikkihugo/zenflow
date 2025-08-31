/**
 * @fileoverview PI Planning State Machine using XState
 *
 * Implements SAFe Program Increment Planning ceremony as formal state machine: getLogger(): void { type: ' PLANNING_CONTEXT_COMPLETE}| { type: 'TEAM_PLANNING_COMPLETE',)      artId: 'DAY1_COMPLETE', dependencies: ' BEGIN_DAY2_PLANNING}| { type: ' RISK_ADDRESSED', riskId: ' OBJECTIVE_DEFINED', objective: ' DAY2_COMPLETE', objectives: ' CONFIDENCE_VOTE', vote: ' PLANNING_ADJUSTMENTS_NEEDED', adjustments: ' ADJUSTMENTS_COMPLETE}| { type: ' ABORT_PLANNING', reason: string}| { type};
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
    const criticalDependencies = context.dependencies.filter(): void { context}:  { context: PIPlanningContext}) => {
    const highRisks = context.risks.filter(): void {
  /**
   * Initialize planning session
   */
  initializePlanning: assign(): void {
    totalCapacity:({ context, event}) => {
      const teamEvent = event as Extract<
        PIPlanningEvent,
        { type : 'TEAM_PLANNING_COMPLETE};
'>;';
      return [...context.totalCapacity, teamEvent.capacity];
},
    plannedFeatures: (context, event ) => {
      const teamEvent = event as Extract<
        PIPlanningEvent,
        { type : 'TEAM_PLANNING_COMPLETE};
'>;';
      return [...context.plannedFeatures, ...teamEvent.features];
},
}),
  /**
   * Capture day 1 artifacts
   */
  captureDay1Artifacts: assign(): void { type}>';) => event.dependencies,';
    risks: (
      event,: ')      event: Extract<PIPlanningEvent, { type}>';) => event.risks,';
}),
  /**
   * Store PI objectives
   */
  storeObjectives: assign(): void {
    confidenceVote:({
      event,
}: ')      event: Extract<PIPlanningEvent, { type}>';) => event.vote,';
}),
  /**
   * Handle planning adjustments
   */
  handleAdjustments: assign(): void {
    blockers:() => [],
}),
  /**
   * Commit to PI execution
   */
  commitToPi: assign(): void {
    context,
    event,
}:  {
    context: PIPlanningContext;
    event: PIPlanningEvent;
}) => {
    logger.info(): void { context}) => ({
    type : 'PI_PLANNING_COMPLETE,'
'    piId: context.pi.id,';
    objectives: context.piObjectives,',    commitment: context.commitmentLevel,'))'};
// ============================================================================
// STATE MACHINE DEFINITION
// ============================================================================
/**
 * PI Planning state machine
 *
 * Implements formal SAFe PI Planning ceremony with: createMachine(): void {
    guards: piPlanningGuards as any,
    actions: piPlanningActions as any,
    // Services for async operations
    actors:  {
      planningOrchestrator: fromPromise(): void {
          // Coordinate planning across multiple ARTs
          // This would integrate with actual planning tools
          logger.info(): void {';
    ')orchestrated,'
'            artsCount: input.arts.length,';
            coordinatedAt: new Date(): void {
      ...piPlanningMachine.config,
      context: 'uncommitted,',
        blockers: [],
        facilitatorNotes: [],',} as PIPlanningContext,';
},
    {
      guards: piPlanningGuards as any,
      actions: piPlanningActions as any,
      actors:  {
        planningOrchestrator: fromPromise(): void {
            // Coordinate planning across multiple ARTs
            // This would integrate with actual planning tools
            logger.info(''))              status : 'orchestrated,'
              artsCount: input.arts.length,
              coordinatedAt: new Date(),,};
}
        ),
},
}
  );
  return contextualMachine;
}
;)";"