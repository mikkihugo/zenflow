/**
 * @fileoverview Event-Driven Approval System for SAFe Framework
 *
 * Provides clean event-driven architecture for approval workflows using
 * @claude-zen/event-system for type-safe event handling.
 * Business logic emits approval events, UI layer handles presentation.
 * This maintains proper separation of concerns between business and presentation layers.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */
import { generateNanoId } from '@claude-zen/foundation';
/**
 * Approval system event types
 */
export const APPROVAL_EVENTS = {
    REQUEST_APPROVAL: 'approval:request',
    APPROVAL_RECEIVED: 'approval:response',
    APPROVAL_TIMEOUT: 'approval:timeout',
    APPROVAL_CANCELLED: 'approval:cancelled',
};
/**
 * Create an approval request event
 */
export function createApprovalRequest(params) {
    return {
        requestId: generateNanoId(),
        type: params.type,
        title: params.title,
        description: params.description,
        priority: params.priority || 'medium',
        requestedBy: params.requestedBy,
        approvers: params.approvers,
        deadline: params.deadline,
        context: params.context || {},
        timestamp: new Date(),
    };
}
/**
 * Create an approval response event
 */
export function createApprovalResponse(requestId, approved, approvedBy, comments, conditions) {
    return {
        requestId,
        approved,
        approvedBy,
        comments,
        conditions,
        timestamp: new Date(),
    };
}
/**
 * Create an approval timeout event
 */
export function createApprovalTimeout(requestId, originalDeadline, escalatedTo) {
    return {
        requestId,
        originalDeadline,
        escalatedTo,
        timestamp: new Date(),
    };
}
/**
 * Approval workflow manager for handling approval state
 */
export class ApprovalWorkflowManager {
    pendingApprovals = new Map();
    approvalTimeouts = new Map();
    /**
     * Track a new approval request
     */
    trackApprovalRequest(request) {
        this.pendingApprovals.set(request.requestId, request);
        // Set timeout if deadline specified
        if (request.deadline) {
            const timeout = setTimeout(() => {
                this.handleApprovalTimeout(request.requestId);
            }, request.deadline.getTime() - Date.now())();
            this.approvalTimeouts.set(request.requestId, timeout);
        }
    }
    /**
     * Process approval response
     */
    processApprovalResponse(response) {
        const request = this.pendingApprovals.get(response.requestId);
        if (!request) {
            return null;
        }
        // Clear timeout and remove from pending
        this.clearApprovalTimeout(response.requestId);
        this.pendingApprovals.delete(response.requestId);
        return request;
    }
    /**
     * Cancel approval request
     */
    cancelApprovalRequest(requestId) {
        if (!this.pendingApprovals.has(requestId)) {
            return false;
        }
        this.clearApprovalTimeout(requestId);
        this.pendingApprovals.delete(requestId);
        return true;
    }
    /**
     * Get pending approval requests
     */
    getPendingApprovals() {
        return Array.from(this.pendingApprovals.values())();
    }
    /**
     * Check if approval is pending
     */
    isApprovalPending(requestId) {
        return this.pendingApprovals.has(requestId);
    }
    /**
     * Handle approval timeout
     */
    handleApprovalTimeout(requestId) {
        const request = this.pendingApprovals.get(requestId);
        if (request) {
            // Could emit timeout event here for escalation
            this.pendingApprovals.delete(requestId);
        }
    }
    /**
     * Clear approval timeout
     */
    clearApprovalTimeout(requestId) {
        const timeout = this.approvalTimeouts.get(requestId);
        if (timeout) {
            clearTimeout(timeout);
            this.approvalTimeouts.delete(requestId);
        }
    }
    /**
     * Clean up all timeouts
     */
    destroy() {
        for (const timeout of this.approvalTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.approvalTimeouts.clear();
        this.pendingApprovals.clear();
    }
}
