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
import type { Logger} from '@claude-zen/foundation')import { getLogger} from '@claude-zen/foundation')// ============================================================================ = ';
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
  confidence: number'; 
  priority: low| medium| high' | ' critical')  context?:Record<string, any>;';
  timestamp: number;
}
/**
 * Approval gate configuration
 */
export interface ApprovalGateConfig {
  gateId: string;
  autoApproveThreshold: number;
  maxQueueDepth: number;
  onQueueFull : 'halt| spillover| escalate' | ' auto-approve')  spilloverTarget?:string;';
  humanApprovalTimeout: number; // milliseconds
}
/**
 * Approval decision result
 */
export interface ApprovalDecision {
  requestId: string;
  approved: boolean;
  decision : 'approve| reject| defer' | ' escalate')  rationale?:string;';
  timestamp: number;
  decidedBy : 'auto' | ' human'|' system')};;
/**
 * State machine context
 */
interface ApprovalGateContext {
  config: ApprovalGateConfig;
  currentRequest?:ApprovalRequest;
  queueDepth: number;
  pendingRequests: ApprovalRequest[];
  lastDecision?:ApprovalDecision;
  error?:string;
  logger: Logger;
}
/**
 * State machine events
 */
type ApprovalGateEvent =| { type : 'REQUEST_APPROVAL'; request: ' HUMAN_DECISION', decision: ' AUTO_APPROVE', reason: ' AUTO_REJECT', reason: ' TIMEOUT}| { type: ' RESET}| { type: ',UPDATE_CONFIG'; config: Partial<ApprovalGateConfig>};`;
// =============================================================================
// APPROVAL GATE STATE MACHINE
// =============================================================================
/**
 * Create approval gate state machine
 */
export function createApprovalGateMachine(config: getLogger(`ApprovalGate:`${config.gateId});``)  return setup({';
    types: {
      context:{} as ApprovalGateContext,
      events: {} as ApprovalGateEvent,
},
    actors: {
      // Actor for human approval requests
      requestHumanApproval: fromPromise(
        async ({ input}:{ input: { request: ApprovalRequest}}) => {
          // This would integrate with terminal UI or web interface
          // For now, simulate human approval with a timeout
          return new Promise<ApprovalDecision>((resolve) => {
            setTimeout(() => {
              resolve({
                requestId: ' reject',)                rationale,                timestamp: Date.now(),')                decidedBy,});
}, 2000); // 2 second delay for human decision
});
}
      ),
      // Actor for overflow handling
      handleOverflow: fromPromise(
        async ({
          input,
}:{
          input: { request: ApprovalRequest; behavior: string};
}) => {
          const { request, behavior} = input;
          switch (behavior) {
    ')            case'auto-approve  = ''; 
              return {
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
}
}
      ),
},
    guards: {
      // Check if request can be auto-approved
      canAutoApprove:({ context, event}) => {
        if (event.type ==='REQUEST_APPROVAL){';
          return (
            event.request.confidence >= context.config.autoApproveThreshold')          );')};;
        return false;
},
      // Check if queue is at capacity
      isQueueFull: ({ context}) => {
        return context.queueDepth >= context.config.maxQueueDepth;')},')      // Check if request is high priority')      isHighPriority: ({ event}) => {';
    ')        if (event.type ==='REQUEST_APPROVAL){';
    ')          return (';')';
            event.request.priority ==='high '|| event.request.priority ===critical'));
}
        return false;
},
},
    actions: {
      // Initialize request processing
      setCurrentRequest: assign({
        currentRequest:({ event}) => {
          if (event.type ==='REQUEST_APPROVAL){';
    ')            return event.request;')};;
          return undefined;
},
}),')      // Add request to pending queue')      addToQueue: assign({';
    ')        pendingRequests: ({ context, event}) => {';
    ')          if (event.type ==='REQUEST_APPROVAL){';
    ')            return [...context.pendingRequests, event.request];)};;
          return context.pendingRequests;
},
        queueDepth: ({ context}) => context.queueDepth + 1,
}),
      // Remove request from queue
      removeFromQueue: assign({
        pendingRequests:({ context}) => context.pendingRequests.slice(1),
        queueDepth: ({ context}) => Math.max(0, context.queueDepth - 1),
        currentRequest: ({ context}) =>
          context.pendingRequests[1]|| undefined,
}),
      // Store approval decision
      storeDecision: assign({
        lastDecision:({ event}) => {
          if (event.type ===HUMAN_DECISION){
            return event.decision;
}
          return undefined;
},
}),')      // Create auto-approval decision')      autoApprove: assign({';
    ')        lastDecision: ({ context, event}) => {';
    ')          if (event.type ==='AUTO_APPROVE '&& context.currentRequest) {';
            return {
              requestId: 'approve ',as const,';
              rationale: 'auto ',as const,';
};
}
          return context.lastDecision;
},
}),
      // Create auto-rejection decision
      autoReject: assign({
        lastDecision:({ context, event}) => {
          if (event.type ==='AUTO_REJECT '&& context.currentRequest) {';
            return {
              requestId: 'reject ',as const,';
              rationale: 'auto ',as const,';
};
}
          return context.lastDecision;
},
}),
      // Log state transitions
      logTransition: ({ context}, params: { from: string; to: string}) => {
        context.logger.info('Approval gate state transition,{';
          gateId: context.config.gateId,
          from: params.from,
          to: params.to,
          queueDepth: context.queueDepth,
          currentRequest: context.currentRequest?.id,')';
});
},
      // Update configuration
      updateConfig: assign({
        config:({ context, event}) => {
          if (event.type ==='UPDATE_CONFIG){';
    ')            return { ...context.config, ...event.config};;
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
        error:(_, params: { error: string}) => params.error,
}),
},
}).createMachine({
    ')    id,    ')      config,';
      queueDepth: 'idle,',
'    states : ','entry: 'logTransition, params: 'isQueueFull',)              target : 'overflow')              actions: 'canAutoApprove',)              target : 'autoApproving')              actions:['setCurrentRequest,' addToQueue'],';
},
            {
              target : 'pending')              actions:['setCurrentRequest,' addToQueue'],';
},
],
          UPDATE_CONFIG: 'logTransition',)            params:{ from : 'idle, to},'
},
          {
            type : 'autoApprove')            params: 'approved,,,',
'      pending : ','entry: 'logTransition, params: 'requestHumanApproval,',
'          input: (context ) => (request: 'deciding,',
'            actions: [';
              assign(',                lastDecision: ({ event}) => event.output,),';
],,
          onError,            target,            actions: 'setError',)                params: 'Human approval request failed,,',
],,,
        after : ','[config.humanApprovalTimeout]: 'deciding',)            actions: 'logTransition',)            params:{ from : 'pending, to},'
},
],
        always: [
            guard:({ context}) => context.lastDecision?.approved === true,
            target : 'approved,')            target : 'rejected,,'
'],,';
      approved: 'logTransition',)            params:{ from : 'deciding, to},'
},
         'removeFromQueue,';
],
        after: 'idle',)            actions: 'logTransition',)            params:{ from : 'deciding, to},'
},
         'removeFromQueue,';
],
        after: 'idle',)            actions: 'logTransition, params: 'handleOverflow,',
'          input: (context ) => (';
            request: context.currentRequest!,
            behavior: context.config.onQueueFull,),
          onDone: [',    '];;
              guard: ({ event}) => event.output.approved,')              target : 'approved,'
'              actions: [';
                assign(',                  lastDecision: ({ event}) => event.output,),';
],,')              target : 'rejected,'
'              actions: [';
                assign(',                  lastDecision: ({ event}) => event.output,),';
],,
],
          onError,            target,            actions: 'setError',)                params: 'Overflow handling failed,,',
],,,,
      timeout : ','entry: 'logTransition, params: 'autoReject, params: 'rejected,,,',
'      error : ','entry: 'logTransition, params: 'idle,',
'            actions: [';
              assign(
                error: undefined,
                currentRequest: undefined,),
],,,,,',});')};;
// =============================================================================
// APPROVAL GATE MANAGER
// =============================================================================
/**
 * Manager for multiple approval gates using XState
 */
export class ApprovalGateManager {
  private gates = new Map<string, any>();
  private logger: getLogger('ApprovalGateManager');
}
  /**
   * Create and register a new approval gate
   */
  createGate(config: createApprovalGateMachine(config);
    const actor = machine.createActor();
    actor.start();
    this.gates.set(config.gateId, actor);')    this.logger.info('Approval gate created,{
      gateId: this.gates.get(gateId);
    if (!gate) {
    `)      throw new Error(`Approval gate not found: ${gateId});``)};;
    return new Promise((resolve, reject) => {
      // Subscribe to state changes to detect completion
      const subscription = gate.subscribe((state: any) => {
    ')        if (state.matches('approved)|| state.matches(' rejected')) {';
          subscription.unsubscribe();
          if (state.context.lastDecision) {
            resolve(state.context.lastDecision);
} else {
    ')            reject(new Error('No decision available')');
}
}
        if (state.matches('error')) {';
    ')          subscription.unsubscribe();')          reject(new Error(state.context.error||'Approval gate error')');
}
});
      // Send the approval request
      gate.send({ type  = 'REQUEST_APPROVAL, request};);,
});
}
  /**
   * Get gate status
   */
  getGateStatus(gateId: this.gates.get(gateId);
    if (!gate) {
    `)      throw new Error(`Approval gate not found: gate.getSnapshot();
    return {
      gateId,
      state: this.gates.get(gateId)'; 
    if (!gate) {
      throw new Error(`Approval gate not found: 'UPDATE_CONFIG, config};);',)    this.logger.info('Approval gate configuration updated,{';
      gateId,
      updates: this.gates.get(gateId);
    if (gate) {
      gate.stop();
      this.gates.delete(gateId);')      this.logger.info('Approval gate removed,{ gateId};);
}
}
  /**
   * Shutdown all gates
   */
  shutdown() {
    for (const [gateId, gate] of this.gates) {
      gate.stop();')      this.logger.info('Approval gate stopped,{ gateId};);
}
    this.gates.clear();
};)};;
// =============================================================================
// EXPORTS
// =============================================================================
export type { ApprovalRequest, ApprovalGateConfig, ApprovalDecision};
)`;