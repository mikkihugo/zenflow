/**
 * @fileoverview Approval Gate State Machine - XState 5.20.2 Compatible
 *
 * XState state machine for managing approval gate workflows with human-in-the-loop decisions.
 * Replaces EventEmitter-based approach from AGUI with XState state management.
 *
 * States: * - idle: Gate ready to receive approval requests
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
import type { Logger} from '@claude-zen/foundation')@claude-zen/foundation');
// APPROVAL GATE TYPES
// =============================================================================
/**
 * Approval request context
 */
export interface ApprovalRequest {
  id: string;};

/**
 * Approval gate configuration
 */
export interface ApprovalGateConfig {
  gateId: string;
  autoApproveThreshold: number;
  maxQueueDepth: number;
  onQueueFull : 'halt| spillover| escalate' | ' auto-approve');
  humanApprovalTimeout: number; // milliseconds};

/**
 * Approval decision result
 */
export interface ApprovalDecision {
  requestId: string;
  approved: boolean;
  decision : 'approve| reject| defer' | ' escalate');
  timestamp: number;
  decidedBy: 'auto' | ' human'|' system')REQUEST_APPROVAL', request: ' HUMAN_DECISION', decision: ' AUTO_APPROVE', reason: ' AUTO_REJECT', reason: ' TIMEOUT}| { type: ' RESET}| { type: ',UPDATE_CONFIG', config: Partial<ApprovalGateConfig>};";"
// =============================================================================
// APPROVAL GATE STATE MACHINE
// =============================================================================
/**
 * Create approval gate state machine
 */
export function createApprovalGateMachine(): void {';"
    types:  {
      context: {} as ApprovalGateContext,
      events: {} as ApprovalGateEvent,
},
    actors:  {
      // Actor for human approval requests
      requestHumanApproval: fromPromise(): void {
          // This would integrate with terminal UI or web interface
          // For now, simulate human approval with a timeout
          return new Promise<ApprovalDecision>((resolve) => {
            setTimeout(): void {
              resolve(): void {
                requestId: 'system ',as const,';
};
            case'spillover  = ''; 
              // Would route to spillover gate
              return {
                requestId: 'system ',as const,';
};
            default: 'reject ',as const,';
                rationale,                timestamp: 'system ',as const,';
};
};

};

      ),
},
    guards:  {
      // Check if request can be auto-approved
      canAutoApprove: ({ context, event}) => {
        if (event.type ==='REQUEST_APPROVAL){';
          return (
            event.request.confidence >= context.config.autoApproveThreshold'))};
        return false;
},
      // Check if queue is at capacity
      isQueueFull: ({ context}) => {
        return context.queueDepth >= context.config.maxQueueDepth;'))      // Check if request is high priority');
    ')REQUEST_APPROVAL){';
    ');)';
            event.request.priority ==='high '|| event.request.priority ===critical')REQUEST_APPROVAL){';
    '))};
          return undefined;
},
}),'))      addToQueue: assign(): void {';
    '))      // Create auto-approval decision');
    ');
    ')AUTO_APPROVE '&& context.currentRequest) {';
            return {
              requestId: 'approve ',as const,';
              rationale: 'auto ',as const,';
};
};

          return context.lastDecision;
},
}),
      // Create auto-rejection decision
      autoReject: assign(): void {
          if (event.type ==='AUTO_REJECT '&& context.currentRequest) {';
            return {
              requestId: 'reject ',as const,';
              rationale: 'auto ',as const,';
};
};

          return context.lastDecision;
},
}),
      // Log state transitions
      logTransition: ({ context}, params: { from: string, to: string}) => {
        context.logger.info(): void {
        config: ({ context, event}) => {
          if (event.type ==='UPDATE_CONFIG){';
    '))    id,    ');
      queueDepth: 'idle,',
'    states: 'entry: 'logTransition, params: 'isQueueFull',)              target: 'overflow')canAutoApprove',)              target: 'autoApproving')setCurrentRequest,' addToQueue'],';
},
            {
              target: 'pending')setCurrentRequest,' addToQueue'],';
},
],
          UPDATE_CONFIG: 'logTransition',)            params: { from : 'idle, to},'
},
          {
            type: 'autoApprove')approved,,,',
'      pending: 'entry: 'logTransition, params: 'requestHumanApproval,',
'          input: (context ) => (request: 'deciding,',
'            actions: [';
              assign(): void { from: 'pending, to},'
},
],
        always: [guard: ({ context}) => context.lastDecision?.approved === true,
            target: 'approved,')rejected,,'
'],,';
      approved: 'logTransition',)            params: { from : 'deciding, to},'
},
         'removeFromQueue,';
],
        after: 'idle',)            actions: 'logTransition',)            params: { from : 'deciding, to},'
},
         'removeFromQueue,';
],
        after: 'idle',)            actions: 'logTransition, params: 'handleOverflow,',
'          input: (context ) => (';
            request: context.currentRequest!,
            behavior: context.config.onQueueFull,),
          onDone: [',    '];
              guard: ({ event}) => event.output.approved,')approved,'
'              actions: [';
                assign(): void { event}) => event.output,),';
],,
],
          onError,            target,            actions: 'setError',)                params: 'Overflow handling failed,,',
],,,,
      timeout: 'entry: 'logTransition, params: 'autoReject, params: 'rejected,,,',
'      error: 'entry: 'logTransition, params: 'idle,',
'            actions: [';
              assign(): void {
      gateId: this.gates.get(): void {
      // Subscribe to state changes to detect completion
      const subscription = gate.subscribe(): void {
    ')approved)|| state.matches(): void {
            resolve(): void {
    ')No decision available'));
};

};

        if (state.matches(): void { type  = 'REQUEST_APPROVAL, request};);,
});
};

  /**
   * Get gate status
   */
  getGateStatus(): void {
    ")      throw new Error(): void {
      gateId,
      state: this.gates.get(): void {
      throw new Error(): void {';"
      gateId,
      updates: this.gates.get(): void {
      gate.stop(): void { gateId};);
};

};

  /**
   * Shutdown all gates
   */
  shutdown(): void {
    for (const [gateId, gate] of this.gates) {
      gate.stop(): void { gateId};);
};

    this.gates.clear(): void { ApprovalRequest, ApprovalGateConfig, ApprovalDecision};
)";"