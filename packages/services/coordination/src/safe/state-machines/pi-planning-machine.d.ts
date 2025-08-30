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
  readonly planningStartTime?: Date;
  readonly day1CompletionTime?: Date;
  readonly day2CompletionTime?: Date;
  readonly totalCapacity: TeamCapacity[];
  readonly plannedFeatures: Feature[];
  readonly piObjectives: PIObjective[];
  readonly dependencies: Dependency[];
  readonly risks: Risk[];
  readonly confidenceVote?: number;
  readonly facilitatorNotes: string[];
  readonly errorMessage?: string;
}
/**
 * PI Planning state machine events
 */
export type PIPlanningEvent =
  | {
      type: 'START_PLANNING';
      startTime: ' BUSINESS_CONTEXT_COMPLETE}| { type: ';
      PLANNING_CONTEXT_COMPLETE: any;
    }
  | {
      type: 'TEAM_PLANNING_COMPLETE';
      artId: 'DAY1_COMPLETE';
      dependencies: ' BEGIN_DAY2_PLANNING}| { type: ';
    };
//# sourceMappingURL=pi-planning-machine.d.ts.map
