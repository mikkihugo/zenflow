/**
 * @fileoverview Approval Gate State Machine - XState 5.20.2 Compatible
 *
 * XState state machine for managing approval gate workflows with human-in-the-loop decisions.
 * Replaces EventEmitter-based approach from AGUI with XState state management.
 *
 * States:
 * - idle: Gate ready to receive approval requests
 * - evaluating: Auto-evaluation of confidence thresholds
 * - pending: Waiting for human approval
 * - approved: Request approved, ready to proceed
 * - rejected: Request rejected, task cannot proceed
 * - overflow: Queue at capacity, handling overflow behavior
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0 - XState Task Flow Management
 */

import { assign, setup, fromPromise } from 'xstate';
import { generateNanoId } from '@claude-zen/foundation';
import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';

// =============================================================================
// APPROVAL GATE TYPES
// =============================================================================

/**
 * Approval request context
 */
export interface ApprovalRequest {
  id: string;
  taskId: string;
  gateType: string;
  question: string;
  confidence: number;
  priority: 'low|medium|high|critical;
  context?: Record<string, any>;
  timestamp: number;
}

/**
 * Approval gate configuration
 */
export interface ApprovalGateConfig {
  gateId: string;
  autoApproveThreshold: number;
  maxQueueDepth: number;
  onQueueFull: 'halt|spillover|escalate|auto-approve;
  spilloverTarget?: string;
  humanApprovalTimeout: number; // milliseconds
}

/**
 * Approval decision result
 */
export interface ApprovalDecision {
  requestId: string;
  approved: boolean;
  decision: 'approve|reject|defer|escalate;
  rationale?: string;
  timestamp: number;
  decidedBy: 'auto' | 'human' | 'system';
}

/**
 * State machine context
 */
interface ApprovalGateContext {
  config: ApprovalGateConfig;
  currentRequest?: ApprovalRequest;
  queueDepth: number;
  pendingRequests: ApprovalRequest[];
  lastDecision?: ApprovalDecision;
  error?: string;
  logger: Logger;
}

/**
 * State machine events
 */
type ApprovalGateEvent =|{ type:'REQUEST_APPROVAL'; request: ApprovalRequest }|{ type:'HUMAN_DECISION'; decision: ApprovalDecision }|{ type:'AUTO_APPROVE'; reason: string }|{ type:'AUTO_REJECT'; reason: string }|{ type:'TIMEOUT'}|{ type:'QUEUE_OVERFLOW'}|{ type:'RESET'}|{ type:'UPDATE_CONFIG'; config: Partial<ApprovalGateConfig> };'

// =============================================================================
// APPROVAL GATE STATE MACHINE
// =============================================================================

/**
 * Create approval gate state machine
 */
export function createApprovalGateMachine(config: ApprovalGateConfig) {
  const logger = getLogger(`ApprovalGate:${config.gateId}`);`

  return setup({
    types: {
      context: {} as ApprovalGateContext,
      events: {} as ApprovalGateEvent,
    },
    actors: {
      // Actor for human approval requests
      requestHumanApproval: fromPromise(
        async ({ input }: { input: { request: ApprovalRequest } }) => {
          // This would integrate with terminal UI or web interface
          // For now, simulate human approval with a timeout
          return new Promise<ApprovalDecision>((resolve) => {
            setTimeout(() => {
              resolve({
                requestId: input.request.id,
                approved: Math.random() > 0.3, // 70% approval rate
                decision: Math.random() > 0.3 ? 'approve' : 'reject',
                rationale: 'Simulated human decision',
                timestamp: Date.now(),
                decidedBy: 'human',
              });
            }, 2000); // 2 second delay for human decision
          });
        }
      ),

      // Actor for overflow handling
      handleOverflow: fromPromise(
        async ({
          input,
        }: {
          input: { request: ApprovalRequest; behavior: string };
        }) => {
          const { request, behavior } = input;

          switch (behavior) {
            case 'auto-approve':'
              return {
                requestId: request.id,
                approved: true,
                decision: 'approve' as const,
                rationale: 'Auto-approved due to queue overflow',
                timestamp: Date.now(),
                decidedBy: 'system' as const,
              };

            case 'spillover':'
              // Would route to spillover gate
              return {
                requestId: request.id,
                approved: false,
                decision: 'defer' as const,
                rationale: 'Deferred to spillover gate',
                timestamp: Date.now(),
                decidedBy: 'system' as const,
              };

            default:
              return {
                requestId: request.id,
                approved: false,
                decision: 'reject' as const,
                rationale: 'Rejected due to queue overflow',
                timestamp: Date.now(),
                decidedBy: 'system' as const,
              };
          }
        }
      ),
    },

    guards: {
      // Check if request can be auto-approved
      canAutoApprove: ({ context, event }) => {
        if (event.type === 'REQUEST_APPROVAL') {'
          return (
            event.request.confidence >= context.config.autoApproveThreshold
          );
        }
        return false;
      },

      // Check if queue is at capacity
      isQueueFull: ({ context }) => {
        return context.queueDepth >= context.config.maxQueueDepth;
      },

      // Check if request is high priority
      isHighPriority: ({ event }) => {
        if (event.type === 'REQUEST_APPROVAL') {'
          return (
            event.request.priority === 'high' || event.request.priority ==='critical''
          );
        }
        return false;
      },
    },

    actions: {
      // Initialize request processing
      setCurrentRequest: assign({
        currentRequest: ({ event }) => {
          if (event.type === 'REQUEST_APPROVAL') {'
            return event.request;
          }
          return undefined;
        },
      }),

      // Add request to pending queue
      addToQueue: assign({
        pendingRequests: ({ context, event }) => {
          if (event.type === 'REQUEST_APPROVAL') {'
            return [...context.pendingRequests, event.request];
          }
          return context.pendingRequests;
        },
        queueDepth: ({ context }) => context.queueDepth + 1,
      }),

      // Remove request from queue
      removeFromQueue: assign({
        pendingRequests: ({ context }) => context.pendingRequests.slice(1),
        queueDepth: ({ context }) => Math.max(0, context.queueDepth - 1),
        currentRequest: ({ context }) =>
          context.pendingRequests[1] || undefined,
      }),

      // Store approval decision
      storeDecision: assign({
        lastDecision: ({ event }) => {
          if (event.type ==='HUMAN_DECISION') {'
            return event.decision;
          }
          return undefined;
        },
      }),

      // Create auto-approval decision
      autoApprove: assign({
        lastDecision: ({ context, event }) => {
          if (event.type === 'AUTO_APPROVE' && context.currentRequest) {'
            return {
              requestId: context.currentRequest.id,
              approved: true,
              decision: 'approve' as const,
              rationale: event.reason,
              timestamp: Date.now(),
              decidedBy: 'auto' as const,
            };
          }
          return context.lastDecision;
        },
      }),

      // Create auto-rejection decision
      autoReject: assign({
        lastDecision: ({ context, event }) => {
          if (event.type === 'AUTO_REJECT' && context.currentRequest) {'
            return {
              requestId: context.currentRequest.id,
              approved: false,
              decision: 'reject' as const,
              rationale: event.reason,
              timestamp: Date.now(),
              decidedBy: 'auto' as const,
            };
          }
          return context.lastDecision;
        },
      }),

      // Log state transitions
      logTransition: ({ context }, params: { from: string; to: string }) => {
        context.logger.info('Approval gate state transition', {'
          gateId: context.config.gateId,
          from: params.from,
          to: params.to,
          queueDepth: context.queueDepth,
          currentRequest: context.currentRequest?.id,
        });
      },

      // Update configuration
      updateConfig: assign({
        config: ({ context, event }) => {
          if (event.type === 'UPDATE_CONFIG') {'
            return { ...context.config, ...event.config };
          }
          return context.config;
        },
      }),

      // Clear current request
      clearCurrentRequest: assign({
        currentRequest: undefined,
      }),

      // Set error state
      setError: assign({
        error: (_, params: { error: string }) => params.error,
      }),
    },
  }).createMachine({
    id: `approvalGate_${config.gateId}`,`

    context: {
      config,
      queueDepth: 0,
      pendingRequests: [],
      logger,
    },

    initial: 'idle',

    states: {
      idle: {
        entry: [
          { type: 'logTransition', params: { from: 'unknown', to: 'idle' } },
        ],

        on: {
          REQUEST_APPROVAL: [
            {
              guard: 'isQueueFull',
              target: 'overflow',
              actions: ['setCurrentRequest'],
            },
            {
              guard: 'canAutoApprove',
              target: 'autoApproving',
              actions: ['setCurrentRequest', 'addToQueue'],
            },
            {
              target: 'pending',
              actions: ['setCurrentRequest', 'addToQueue'],
            },
          ],

          UPDATE_CONFIG: {
            actions: ['updateConfig'],
          },
        },
      },

      autoApproving: {
        entry: [
          {
            type: 'logTransition',
            params: { from: 'idle', to: 'autoApproving' },
          },
          {
            type: 'autoApprove',
            params: { reason: 'Confidence threshold met' },
          },
        ],

        always: {
          target: 'approved',
        },
      },

      pending: {
        entry: [
          { type: 'logTransition', params: { from: 'idle', to: 'pending' } },
        ],

        invoke: {
          src: 'requestHumanApproval',
          input: ({ context }) => ({ request: context.currentRequest! }),

          onDone: {
            target: 'deciding',
            actions: [
              assign({
                lastDecision: ({ event }) => event.output,
              }),
            ],
          },

          onError: {
            target: 'error',
            actions: [
              {
                type: 'setError',
                params: { error: 'Human approval request failed' },
              },
            ],
          },
        },

        after: {
          [config.humanApprovalTimeout]: {
            target: 'timeout',
          },
        },

        on: {
          HUMAN_DECISION: {
            target: 'deciding',
            actions: ['storeDecision'],
          },
        },
      },

      deciding: {
        entry: [
          {
            type: 'logTransition',
            params: { from: 'pending', to: 'deciding' },
          },
        ],

        always: [
          {
            guard: ({ context }) => context.lastDecision?.approved === true,
            target: 'approved',
          },
          {
            target: 'rejected',
          },
        ],
      },

      approved: {
        entry: [
          {
            type: 'logTransition',
            params: { from: 'deciding', to: 'approved' },
          },
          'removeFromQueue',
        ],

        after: {
          100: {
            target: 'idle',
            actions: ['clearCurrentRequest'],
          },
        },
      },

      rejected: {
        entry: [
          {
            type: 'logTransition',
            params: { from: 'deciding', to: 'rejected' },
          },
          'removeFromQueue',
        ],

        after: {
          100: {
            target: 'idle',
            actions: ['clearCurrentRequest'],
          },
        },
      },

      overflow: {
        entry: [
          { type: 'logTransition', params: { from: 'idle', to: 'overflow' } },
        ],

        invoke: {
          src: 'handleOverflow',
          input: ({ context }) => ({
            request: context.currentRequest!,
            behavior: context.config.onQueueFull,
          }),

          onDone: [
            {
              guard: ({ event }) => event.output.approved,
              target: 'approved',
              actions: [
                assign({
                  lastDecision: ({ event }) => event.output,
                }),
              ],
            },
            {
              target: 'rejected',
              actions: [
                assign({
                  lastDecision: ({ event }) => event.output,
                }),
              ],
            },
          ],

          onError: {
            target: 'error',
            actions: [
              {
                type: 'setError',
                params: { error: 'Overflow handling failed' },
              },
            ],
          },
        },
      },

      timeout: {
        entry: [
          { type: 'logTransition', params: { from: 'pending', to: 'timeout' } },
          { type: 'autoReject', params: { reason: 'Human approval timeout' } },
        ],

        always: {
          target: 'rejected',
        },
      },

      error: {
        entry: [
          { type: 'logTransition', params: { from: 'unknown', to: 'error' } },
        ],

        on: {
          RESET: {
            target: 'idle',
            actions: [
              assign({
                error: undefined,
                currentRequest: undefined,
              }),
            ],
          },
        },
      },
    },
  });
}

// =============================================================================
// APPROVAL GATE MANAGER
// =============================================================================

/**
 * Manager for multiple approval gates using XState
 */
export class ApprovalGateManager {
  private gates = new Map<string, any>();
  private logger: Logger;

  constructor() {
    this.logger = getLogger('ApprovalGateManager');'
  }

  /**
   * Create and register a new approval gate
   */
  createGate(config: ApprovalGateConfig) {
    const machine = createApprovalGateMachine(config);
    const actor = machine.createActor();

    actor.start();

    this.gates.set(config.gateId, actor);

    this.logger.info('Approval gate created', {'
      gateId: config.gateId,
      autoApproveThreshold: config.autoApproveThreshold,
      maxQueueDepth: config.maxQueueDepth,
    });

    return actor;
  }

  /**
   * Submit approval request to specific gate
   */
  async requestApproval(
    gateId: string,
    request: ApprovalRequest
  ): Promise<ApprovalDecision> {
    const gate = this.gates.get(gateId);
    if (!gate) {
      throw new Error(`Approval gate not found: ${gateId}`);`
    }

    return new Promise((resolve, reject) => {
      // Subscribe to state changes to detect completion
      const subscription = gate.subscribe((state: any) => {
        if (state.matches('approved') || state.matches('rejected')) {'
          subscription.unsubscribe();

          if (state.context.lastDecision) {
            resolve(state.context.lastDecision);
          } else {
            reject(new Error('No decision available'));'
          }
        }

        if (state.matches('error')) {'
          subscription.unsubscribe();
          reject(new Error(state.context.error || 'Approval gate error'));'
        }
      });

      // Send the approval request
      gate.send({ type: 'REQUEST_APPROVAL', request });'
    });
  }

  /**
   * Get gate status
   */
  getGateStatus(gateId: string) {
    const gate = this.gates.get(gateId);
    if (!gate) {
      throw new Error(`Approval gate not found: ${gateId}`);`
    }

    const snapshot = gate.getSnapshot();
    return {
      gateId,
      state: snapshot.value,
      queueDepth: snapshot.context.queueDepth,
      currentRequest: snapshot.context.currentRequest,
      lastDecision: snapshot.context.lastDecision,
      error: snapshot.context.error,
    };
  }

  /**
   * Update gate configuration
   */
  updateGateConfig(gateId: string, config: Partial<ApprovalGateConfig>) {
    const gate = this.gates.get(gateId);
    if (!gate) {
      throw new Error(`Approval gate not found: ${gateId}`);`
    }

    gate.send({ type: 'UPDATE_CONFIG', config });'

    this.logger.info('Approval gate configuration updated', {'
      gateId,
      updates: config,
    });
  }

  /**
   * Shutdown and remove gate
   */
  removeGate(gateId: string) {
    const gate = this.gates.get(gateId);
    if (gate) {
      gate.stop();
      this.gates.delete(gateId);

      this.logger.info('Approval gate removed', { gateId });'
    }
  }

  /**
   * Shutdown all gates
   */
  shutdown() {
    for (const [gateId, gate] of this.gates) {
      gate.stop();
      this.logger.info('Approval gate stopped', { gateId });'
    }
    this.gates.clear();
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { ApprovalRequest, ApprovalGateConfig, ApprovalDecision };
