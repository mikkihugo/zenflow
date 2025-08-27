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
import { assign, createMachine, fromPromise, } from 'xstate';
import { getLogger } from '../types';
const logger = getLogger('PIPlanningMachine');
';
';
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
    prePlanningReady: ({ context }) => {
        return context.arts.length > 0 && context.pi.id && context.pi.startDate;
    },
    /**
     * Check if all teams have completed day 1 planning
     */
    allTeamsPlanned: ({ context }) => {
        return (context.totalCapacity.length === context.arts.length &&
            context.plannedFeatures.length > 0);
    },
    /**
     * Check if critical dependencies are identified and manageable
     */
    dependenciesManageable: ({ context }) => {
        const criticalDependencies = context.dependencies.filter((d) => d.criticality === 'high' || d.type === 'blocking', ').length;
        return criticalDependencies <= 5;
    },
    /**
     * Check if high risks are addressed with mitigation plans
     */
    risksAddressed: ({ context }) => {
        const highRisks = context.risks.filter((r) => r.impact === 'high');
        ';
        return highRisks.every((r) => r.mitigation);
    },
    /**
     * Check if PI objectives meet quality standards
     */
    objectivesValid: ({ context }) => {
        return (context.piObjectives.length >= 3 &&
            context.piObjectives.every((obj) => obj.businessValue && obj.description));
    },
    /**
     * Check if confidence vote meets minimum threshold
     */
    confidenceAcceptable: ({ context }) => {
        return (context.confidenceVote ?? 0) >= 3; // Minimum confidence level
    },
    /**
     * Check if capacity utilization is realistic (80-100%)
     */
    capacityRealistic: ({ context }) => {
        const totalCapacity = context.totalCapacity.reduce((sum, tc) => sum + tc.availableCapacity, 0);
        const plannedWork = context.plannedFeatures.reduce((sum, f) => sum + (f.businessValue || 0), 0);
        const utilization = plannedWork / totalCapacity;
        return utilization >= 0.8 && utilization <= 1.0;
    },
    /**
     * Check if planning is within time constraints
     */
    withinTimeConstraints: ({ context }) => {
        if (!context.planningStartTime)
            return true;
        const hoursElapsed = (Date.now() - context.planningStartTime.getTime()) / (1000 * 60 * 60);
        return hoursElapsed <= 16; // Standard 2-day planning event
    },
};
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
        planningStartTime: ({ event, }) => event.startTime,
        commitmentLevel: () => 'uncommitted',
        _blockers: () => [],
        _facilitatorNotes: () => [],
        _errorMessage: () => undefined,
    }),
    /**
     * Record team planning completion
     */
    recordTeamPlanning: assign({
        totalCapacity: ({ context, event }) => {
            const teamEvent = event;
            '
                > ;
            return [...context.totalCapacity, teamEvent.capacity];
        },
        plannedFeatures: (context, event) => {
            const teamEvent = event;
            '
                > ;
            return [...context.plannedFeatures, ...teamEvent.features];
        },
    }),
    /**
     * Capture day 1 artifacts
     */
    captureDay1Artifacts: assign({
        day1CompletionTime: () => new Date(),
        dependencies: (event, ),
        event: (Extract), ') => event.dependencies,: risks
    }(event, event, (Extract))), ') => event.risks,: 
}, 
/**
 * Store PI objectives
 */
storeObjectives;
({
    piObjectives: ({
        event,
    }),
    event: (Extract), ') => event.objectives,: day2CompletionTime
}());
new Date(),
;
/**
 * Record confidence vote
 */
recordConfidenceVote: assign({
    confidenceVote: ({
        event,
    }),
    event: (Extract), ') => event.vote,: 
}),
    /**
     * Handle planning adjustments
     */
    handleAdjustments;
assign({
    blockers: ({
        event,
    }),
    event: (Extract), ') => event.adjustments,: 
}),
    /**
     * Clear adjustments after completion
     */
    clearAdjustments;
assign({
    blockers: () => [],
}),
    /**
     * Commit to PI execution
     */
    commitToPi;
assign({
    commitmentLevel: () => 'committed',
}),
    /**
     * Log planning milestone
     */
    logMilestone;
({ context, event, }) => {
    logger.info(`PI ${context.pi.id} Planning: ${event.type}`, {} `
      piId: context.pi.id,
      event: event.type,
      timestamp: new Date(),
      artsCount: context.arts.length,
      confidenceVote: context.confidenceVote,
    });
  },

  /**
   * Notify parent of planning completion
   */
  notifyPlanningComplete: sendParent(({ context }) => ({
    type: 'PI_PLANNING_COMPLETE',
    piId: context.pi.id,
    objectives: context.piObjectives,
    commitment: context.commitmentLevel,
  })),
};

// ============================================================================
// STATE MACHINE DEFINITION
// ============================================================================

/**
 * PI Planning state machine
 *
 * Implements formal SAFe PI Planning ceremony with:
 * - Multi-day planning coordination
 * - Team synchronization across ARTs
 * - Dependency and risk management
 * - Commitment and confidence tracking
 */
export const piPlanningMachine = createMachine(
  {
    id: 'piPlanning',
    initial: 'prePlanning',
    context: {} as PIPlanningContext,

    states: {
      /**
       * PRE-PLANNING STATE - Preparation and readiness check
       */
      prePlanning: {
        entry: 'logMilestone',
        on: {
          START_PLANNING: {
            target: 'planningDay1',
            guard: 'prePlanningReady',
            actions: 'initializePlanning',
          },
        },
      },

      /**
       * DAY 1 PLANNING STATE - Business context, vision, and team planning
       */
      planningDay1: {
        entry: 'logMilestone',
        initial: 'businessContext',

        states: {
          businessContext: {
            on: {
              BUSINESS_CONTEXT_COMPLETE: 'architectureVision',
            },
          },

          architectureVision: {
            on: {
              ARCHITECTURE_VISION_COMPLETE: 'planningContext',
            },
          },

          planningContext: {
            on: {
              PLANNING_CONTEXT_COMPLETE: 'teamPlanning',
            },
          },

          teamPlanning: {
            on: {
              TEAM_PLANNING_COMPLETE: {
                target: 'teamPlanning',
                actions: 'recordTeamPlanning',
              },
              DAY1_COMPLETE: {
                target: '#piPlanning.planningDay2',
                guard: 'allTeamsPlanned',
                actions: 'captureDay1Artifacts',
              },
            },
          },
        },
      },

      /**
       * DAY 2 PLANNING STATE - Dependencies, risks, and objectives
       */
      planningDay2: {
        entry: 'logMilestone',
        initial: 'dependencyAnalysis',

        states: {
          dependencyAnalysis: {
            on: {
              DEPENDENCY_RESOLVED: 'dependencyAnalysis',
              DAY2_COMPLETE: {
                target: 'objectiveSetting',
                guard: 'dependenciesManageable',
              },
            },
          },

          riskAnalysis: {
            on: {
              RISK_ADDRESSED: 'riskAnalysis',
              DAY2_COMPLETE: {
                target: 'objectiveSetting',
                guard: 'risksAddressed',
              },
            },
          },

          objectiveSetting: {
            on: {
              OBJECTIVE_DEFINED: {
                target: 'objectiveSetting',
                // Store individual objectives as they're defined'
              },
              DAY2_COMPLETE: {
                target: '#piPlanning.confidenceVote',
                guard: 'objectivesValid',
                actions: 'storeObjectives',
              },
            },
          },
        },
      },

      /**
       * CONFIDENCE VOTE STATE - Team confidence assessment
       */
      confidenceVote: {
        entry: 'logMilestone',
        on: {
          CONFIDENCE_VOTE: {
            target: 'commitment',
            guard: 'confidenceAcceptable',
            actions: 'recordConfidenceVote',
          },
          PLANNING_ADJUSTMENTS_NEEDED: {
            target: 'adjustments',
            actions: 'handleAdjustments',
          },
        },
      },

      /**
       * ADJUSTMENTS STATE - Address low confidence issues
       */
      adjustments: {
        entry: 'logMilestone',
        on: {
          ADJUSTMENTS_COMPLETE: {
            target: 'confidenceVote',
            guard: 'capacityRealistic',
            actions: 'clearAdjustments',
          },
        },
      },

      /**
       * COMMITMENT STATE - Final PI commitment
       */
      commitment: {
        entry: 'logMilestone',
        on: {
          COMMIT_TO_PI: {
            target: 'complete',
            actions: ['commitToPi', 'notifyPlanningComplete'],
          },
        },
      },

      /**
       * COMPLETE STATE - Planning ceremony finished
       */
      complete: {
        entry: ['logMilestone', 'notifyPlanningComplete'],
        type: 'final',
      },

      /**
       * ERROR STATE - Planning failed or aborted
       */
      error: {
        entry: 'logMilestone',
        on: {
          RESTART_PLANNING: 'prePlanning',
        },
      },
    },

    // Global transitions available from any state
    on: {
      ABORT_PLANNING: 'error',
      RESTART_PLANNING: 'prePlanning',
    },
  },
  {
    guards: piPlanningGuards as any,
    actions: piPlanningActions as any,

    // Services for async operations
    actors: {
      planningOrchestrator: fromPromise(
        async ({ input }: { input: PIPlanningContext }) => {
          // Coordinate planning across multiple ARTs
          // This would integrate with actual planning tools
          logger.info(
            `, Orchestrating, PI, planning);
    for ($; { input, : .arts.length }; ARTs ``)
        ;
    // Mock coordination process
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        status: 'orchestrated',
        artsCount: input.arts.length,
        coordinatedAt: new Date(),
    };
};
;
/**
 * Factory function to create PI planning state machine
 */
export function createPIPlanningMachine(pi, arts, config) {
    const contextualMachine = createMachine({
        ...piPlanningMachine.config,
        context: {
            pi,
            arts,
            config,
            totalCapacity: [],
            plannedFeatures: [],
            piObjectives: [],
            dependencies: [],
            risks: [],
            commitmentLevel: 'uncommitted',
            blockers: [],
            facilitatorNotes: [],
        },
    }, {
        guards: piPlanningGuards,
        actions: piPlanningActions,
        actors: {
            planningOrchestrator: fromPromise(async ({ input }) => {
                // Coordinate planning across multiple ARTs
                // This would integrate with actual planning tools
                logger.info(`Orchestrating PI planning for ${input.arts.length} ARTs` `
            );

            // Mock coordination process
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return {
              status: 'orchestrated',
              artsCount: input.arts.length,
              coordinatedAt: new Date(),
            };
          }
        ),
      },
    }
  );

  return contextualMachine;
}
                );
            })
        }
    });
}
