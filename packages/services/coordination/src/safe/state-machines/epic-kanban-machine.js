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
import { assign } from 'xstate';
import { getLogger } from '../types';
const logger = getLogger('EpicKanbanMachine');
';
';
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
    businessCaseValid: ({ context }) => {
        return ((context.businessCase?.businessValue?.totalValue ?? 0) >=
            context.config.businessCaseThreshold);
    },
    /**
     * Check if WSJF score meets threshold for portfolio backlog
     */
    wsjfScoreAcceptable: ({ context }) => {
        return (context.wsjfPriority?.wsjfScore ?? 0) >= 5.0; // Configurable threshold
    },
    /**
     * Check if implementation capacity is available
     */
    capacityAvailable: ({ context }) => {
        return (context.currentCapacityUsage < context.config.maxEpicsInImplementation);
    },
    /**
     * Check if epic exceeds timebox limit
     */
    withinTimebox: ({ context }) => {
        if (!context.implementationStartTime)
            return true;
        const weeksSinceStart = Math.floor((Date.now() - context.implementationStartTime.getTime()) /
            (7 * 24 * 60 * 60 * 1000));
        return weeksSinceStart <= context.config.epicTimeboxWeeks;
    },
    /**
     * Check if epic has no blockers
     */
    noBlockers: ({ context }) => {
        return context.blockers.length === 0;
    },
    /**
     * Check if all required stakeholder approvals are obtained
     */
    stakeholderApproved: ({ context }) => {
        return context.stakeholderApprovals.length >= 2; // Minimum required approvals
    },
};
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
        businessCase: ({ event, }) => event.businessCase,
        analysisStartTime: () => new Date(),
        errorMessage: () => undefined,
    }),
    /**
     * Store WSJF priority calculation results
     */
    storeWSJFPriority: assign({
        wsjfPriority: ({
            event,
        }),
        event: (Extract), ') => event.wsjfPriority,: 
    }),
    /**
     * Handle analysis rejection
     */
    handleAnalysisRejection: assign({
        errorMessage: ({
            event,
        }),
        event: (Extract), ') => event.reason,: 
    }),
    /**
     * Start implementation tracking
     */
    startImplementation: assign({
        implementationStartTime: ({
            event,
        }),
        event: (Extract), ') => event.startTime,: currentCapacityUsage
    }(context))
};
context.currentCapacityUsage + 1,
;
/**
 * Handle implementation blockers
 */
addBlockers: assign({
    blockers: ({
        event,
    }),
    event: (Extract), ') => event.blockers,: 
}),
    /**
     * Clear implementation blockers
     */
    clearBlockers;
assign({
    blockers: () => [],
}),
    /**
     * Complete epic and free capacity
     */
    completeEpic;
assign({
    currentCapacityUsage: ({ context }) => Math.max(0, context.currentCapacityUsage - 1),
    estimatedCompletionTime: () => new Date(),
}),
    /**
     * Log state transitions for audit trail
     */
    logTransition;
({ context, event, }) => {
    // Log epic state transition for audit trail
    logger.info(`Epic ${context.epic.id}: ${event.type}`, {} `
      epicId: context.epic.id,
      event: event.type,
      timestamp: new Date(),
      wsjfScore: context.wsjfPriority?.wsjfScore,
    });
  },
};

// ============================================================================
// STATE MACHINE DEFINITION
// ============================================================================

/**
 * Epic Portfolio Kanban state machine
 *
 * Implements formal SAFe portfolio kanban flow with:
 * - Business rule validation through guards
 * - Audit trail through actions
 * - Async services for external operations
 */
export const epicKanbanMachine = createMachine(
  {
    id: 'epicKanban',
    initial: 'funnel',
    context: {} as EpicKanbanContext,

    states: {
      /**
       * FUNNEL STATE - Ideas and opportunities
       */
      funnel: {
        entry: 'logTransition',
        on: {
          SUBMIT_FOR_ANALYSIS: {
            target: 'analyzing',
            guard: 'businessCaseValid',
            actions: 'startAnalysis',
          },
        },
      },

      /**
       * ANALYZING STATE - Business case analysis and WSJF calculation
       */
      analyzing: {
        entry: 'logTransition',
        invoke: {
          id: 'businessCaseAnalysis',
          src: 'analyzeBusinessCase',
          onDone: {
            target: 'portfolio_backlog',
            actions: 'storeWSJFPriority',
          },
          onError: {
            target: 'funnel',
            actions: 'handleAnalysisRejection',
          },
        },
        on: {
          ANALYSIS_COMPLETE: {
            target: 'portfolio_backlog',
            guard: 'wsjfScoreAcceptable',
            actions: 'storeWSJFPriority',
          },
          ANALYSIS_REJECTED: {
            target: 'funnel',
            actions: 'handleAnalysisRejection',
          },
        },
      },

      /**
       * PORTFOLIO BACKLOG STATE - Prioritized and ready for implementation
       */
      portfolio_backlog: {
        entry: 'logTransition',
        on: {
          APPROVE_FOR_IMPLEMENTATION: {
            target: 'implementing',
            guard: 'capacityAvailable',
            actions: 'startImplementation',
          },
          CAPACITY_FULL: 'portfolio_backlog', // Stay in backlog'
          SPLIT_EPIC: 'funnel', // Return to funnel for re-evaluation'
        },
      },

      /**
       * IMPLEMENTING STATE - Active development
       */
      implementing: {
        entry: 'logTransition',
        initial: 'active',

        states: {
          active: {
            on: {
              IMPLEMENTATION_BLOCKED: {
                target: 'blocked',
                actions: 'addBlockers',
              },
              IMPLEMENTATION_COMPLETE: {
                target: '#epicKanban.done',
                guard: 'withinTimebox',
                actions: 'completeEpic',
              },
            },
          },

          blocked: {
            on: {
              UNBLOCK_IMPLEMENTATION: {
                target: 'active',
                guard: 'noBlockers',
                actions: 'clearBlockers',
              },
            },
          },
        },

        on: {
          CANCEL_EPIC: 'funnel',
          SPLIT_EPIC: 'funnel',
        },
      },

      /**
       * DONE STATE - Epic completed and value delivered
       */
      done: {
        entry: ['logTransition', 'completeEpic'],
        type: 'final',
      },
    },

    // Global transitions available from any state
    on: {
      CANCEL_EPIC: 'funnel',
      RETRY: 'funnel',
    },
  },
  {
    guards: epicKanbanGuards as any,
    actions: epicKanbanActions as any,

    // Services for async operations
    actors: {
      analyzeBusinessCase: fromPromise(
        async ({ input }: { input: EpicKanbanContext }) => {
          // Mock business case analysis - replace with actual implementation
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const wsjfPriority: WSJFPriority = {
            epicId: input.epic.id,
            userBusinessValue: 8,
            timeCriticality: 6,
            riskReductionOpportunityEnablement: 7,
            jobSize: 5,
            wsjfScore: (8 + 6 + 7) / 5, // WSJF = (Business Value + Time Criticality + RROE) / Job Size
            ranking: 1,
            calculatedAt: new Date(),
          };

          return wsjfPriority;
        }
      ),
    },
  }
);

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
  epic: PortfolioEpic,
  config: EpicOwnerManagerConfig
) {
  const contextualMachine = createMachine(
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
          async ({ input }: { input: EpicKanbanContext }) => {
            // Mock business case analysis - replace with actual implementation
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const wsjfPriority: WSJFPriority = {
              epicId: input.epic.id,
              userBusinessValue: 8,
              timeCriticality: 6,
              riskReductionOpportunityEnablement: 7,
              jobSize: 5,
              wsjfScore: (8 + 6 + 7) / 5, // WSJF = (Business Value + Time Criticality + RROE) / Job Size
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
    );
};
