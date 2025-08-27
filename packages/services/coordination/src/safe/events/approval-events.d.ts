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
/**
 * Approval request event data
 */
export interface ApprovalRequestEvent {
    readonly requestId: string;
    readonly type: 'epic|feature|architecture|business-case||resource|process';
    readonly title: string;
    readonly description: string;
    readonly priority: 'low|medium|high|critical;;
    readonly requestedBy: string;
    readonly approvers: string[];
    readonly deadline?: Date;
    readonly context: Record<string, any>;
    readonly timestamp: Date;
}
/**
 * Approval response event data
 */
export interface ApprovalResponseEvent {
    readonly requestId: string;
    readonly approved: boolean;
    readonly approvedBy: string;
    readonly comments?: string;
    readonly conditions?: string[];
    readonly timestamp: Date;
}
/**
 * Approval timeout event data
 */
export interface ApprovalTimeoutEvent {
    readonly requestId: string;
    readonly originalDeadline: Date;
    readonly escalatedTo: string[];
    readonly timestamp: Date;
}
/**
 * Approval system event types
 */
export declare const APPROVAL_EVENTS: {
    readonly REQUEST_APPROVAL: "approval:request";
    readonly APPROVAL_RECEIVED: "approval:response";
    readonly APPROVAL_TIMEOUT: "approval:timeout";
    readonly APPROVAL_CANCELLED: "approval:cancelled";
};
/**
 * Create an approval request event
 */
export declare function createApprovalRequest(params: {
    type: ApprovalRequestEvent['type'];
    ': any;
    title: string;
    description: string;
    priority?: ApprovalRequestEvent['priority'];
    ': any;
    requestedBy: string;
    approvers: string[];
    deadline?: Date;
    context?: Record<string, any>;
}): ApprovalRequestEvent;
/**
 * Create an approval response event
 */
export declare function createApprovalResponse(requestId: string, approved: boolean, approvedBy: string, comments?: string, conditions?: string[]): ApprovalResponseEvent;
/**
 * Create an approval timeout event
 */
export declare function createApprovalTimeout(requestId: string, originalDeadline: Date, escalatedTo: string[]): ApprovalTimeoutEvent;
/**
 * Approval workflow manager for handling approval state
 */
export declare class ApprovalWorkflowManager {
    private pendingApprovals;
    private approvalTimeouts;
    /**
     * Track a new approval request
     */
    trackApprovalRequest(request: ApprovalRequestEvent): void;
    /**
     * Process approval response
     */
    processApprovalResponse(response: ApprovalResponseEvent): ApprovalRequestEvent | null;
    /**
     * Cancel approval request
     */
    cancelApprovalRequest(requestId: string): boolean;
    /**
     * Get pending approval requests
     */
    getPendingApprovals(): ApprovalRequestEvent[];
    /**
     * Check if approval is pending
     */
    isApprovalPending(requestId: string): boolean;
    /**
     * Handle approval timeout
     */
    private handleApprovalTimeout;
    /**
     * Clear approval timeout
     */
    private clearApprovalTimeout;
    /**
     * Clean up all timeouts
     */
    destroy(): void;
}
//# sourceMappingURL=approval-events.d.ts.map