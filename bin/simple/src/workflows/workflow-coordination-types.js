export function createWorkflowGateRequest(gateId, workflowId, stepId, context, options) {
    return {
        gateId,
        workflowId,
        stepId,
        context,
        priority: options?.priority || 'medium',
        timestamp: Date.now(),
        metadata: options?.metadata,
    };
}
export function createWorkflowGateResponse(request, status, options) {
    return {
        gateId: request.gateId,
        workflowId: request.workflowId,
        stepId: request.stepId,
        status,
        result: options?.result,
        message: options?.message,
        timestamp: Date.now(),
    };
}
//# sourceMappingURL=workflow-coordination-types.js.map