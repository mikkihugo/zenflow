"use strict";
/**
 * Workflow Coordination Types - Break Circular Dependencies
 *
 * Shared types between workflows and coordination domains to eliminate
 * the circular import chain.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkflowGateRequest = createWorkflowGateRequest;
exports.createWorkflowGateResponse = createWorkflowGateResponse;
/**
 * Factory function for creating workflow gate requests.
 */
function createWorkflowGateRequest(gateId, workflowId, stepId, context, options, ) {
    return {
        gateId: gateId,
        workflowId: workflowId,
        stepId: stepId,
        context: context,
        priority: (options === null || options === void 0 ? void 0 : options.priority) || 'medium',
        timestamp: Date.now(),
        metadata: options === null || options === void 0 ? void 0 : options.metadata,
    };
}
/**
 * Factory function for creating workflow gate responses.
 */
function createWorkflowGateResponse(request, status, options, ) {
    return {
        gateId: request.gateId,
        workflowId: request.workflowId,
        stepId: request.stepId,
        status: status,
        result: options === null || options === void 0 ? void 0 : options.result,
        message: options === null || options === void 0 ? void 0 : options.message,
        timestamp: Date.now(),
    };
}
