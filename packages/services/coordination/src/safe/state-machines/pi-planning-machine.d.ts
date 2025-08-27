/**
 * @fileoverview PI Planning State Machine using XState
 *
 * Implements SAFe Program Increment Planning ceremony as formal state machine:
 * - Pre-Planning → Day 1 Planning → Day 2 Planning → Commitment → Complete
 * - Guards for readiness checks and dependency validation
 * - Actions for capacity allocation and objective setting
 * - Services for async coordination with multiple ARTs
 *
 * Replaces custom PI planning coordination with battle-tested XState.
 *
 * BENEFITS:
 * - Formal ceremony flow validation prevents skipping critical steps
 * - Multi-ART coordination through parallel state machines
 * - Rollback capabilities for planning adjustments
 * - Real-time planning progress tracking
 * - Integration with planning tools and dashboards
 *
 * @author Claude Code Zen Team
 * @since 2.1.0
 * @version 1.0.0
 */
import type { AgileReleaseTrain, Dependency, Feature, PIObjective, ProgramIncrement, Risk, TeamCapacity } from '../types';
interface PIPlanningConfig {
    maxTeams: number;
    maxFeatures: number;
    confidenceThreshold: number;
}
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
    readonly commitmentLevel: 'uncommitted' | 'partial' | 'committed';
    readonly blockers: string[];
    readonly facilitatorNotes: string[];
    readonly errorMessage?: string;
}
/**
 * PI Planning state machine events
 */
export type PIPlanningEvent = {
    type: 'START_PLANNING';
    startTime: Date;
} | {
    type: 'BUSINESS_CONTEXT_COMPLETE';
} | {
    type: 'ARCHITECTURE_VISION_COMPLETE';
} | {
    type: 'PLANNING_CONTEXT_COMPLETE';
} | {
    type: 'BEGIN_DAY1_PLANNING';
} | {
    ': any;
    type: 'TEAM_PLANNING_COMPLETE;;
    artId: string;
    capacity: TeamCapacity;
    features: Feature[];
} | {
    type: 'DAY1_COMPLETE';
    dependencies: Dependency[];
    risks: Risk[];
} | {
    type: 'BEGIN_DAY2_PLANNING';
} | {
    type: 'DEPENDENCY_RESOLVED';
    dependencyId: string;
} | {
    type: 'RISK_ADDRESSED';
    riskId: string;
} | {
    type: 'OBJECTIVE_DEFINED';
    objective: PIObjective;
} | {
    type: 'DAY2_COMPLETE';
    objectives: PIObjective[];
} | {
    type: 'CONFIDENCE_VOTE';
    vote: number;
} | {
    type: 'PLANNING_ADJUSTMENTS_NEEDED';
    adjustments: string[];
} | {
    type: 'ADJUSTMENTS_COMPLETE';
} | {
    type: 'COMMIT_TO_PI';
} | {
    type: 'ABORT_PLANNING';
    reason: string;
} | {
    type: 'RESTART_PLANNING';
};
/**
 * PI Planning state machine actor type
 */
export type PIPlanningMachineActor = ActorRefFrom<typeof piPlanningMachine>;
/**
 * Factory function to create PI planning state machine
 */
export declare function createPIPlanningMachine(pi: ProgramIncrement, arts: AgileReleaseTrain[], config: PIPlanningConfig): void;
export {};
//# sourceMappingURL=pi-planning-machine.d.ts.map