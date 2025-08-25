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

import { nanoid } from 'nanoid';
import { EventBus, createEvent, EventPriority } from '@claude-zen/event-system';

/**
 * Approval request event data
 */
export interface ApprovalRequestEvent {
  readonly requestId: string;
  readonly type: 'epic|feature|architecture|business-case||resource|process';
  readonly title: string;
  readonly description: string;
  readonly priority: 'low|medium|high|critical;
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
export const APPROVAL_EVENTS = {
  REQUEST_APPROVAL: 'approval:request',
  APPROVAL_RECEIVED: 'approval:response',
  APPROVAL_TIMEOUT: 'approval:timeout',
  APPROVAL_CANCELLED: 'approval:cancelled',
} as const;

/**
 * Create an approval request event
 */
export function createApprovalRequest(params: {
  type: ApprovalRequestEvent['type'];'
  title: string;
  description: string;
  priority?: ApprovalRequestEvent['priority'];'
  requestedBy: string;
  approvers: string[];
  deadline?: Date;
  context?: Record<string, any>;
}): ApprovalRequestEvent {
  return {
    requestId: nanoid(),
    type: params.type,
    title: params.title,
    description: params.description,
    priority: params.priority||'medium',
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
export function createApprovalResponse(
  requestId: string,
  approved: boolean,
  approvedBy: string,
  comments?: string,
  conditions?: string[]
): ApprovalResponseEvent {
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
export function createApprovalTimeout(
  requestId: string,
  originalDeadline: Date,
  escalatedTo: string[]
): ApprovalTimeoutEvent {
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
  private pendingApprovals = new Map<string, ApprovalRequestEvent>();
  private approvalTimeouts = new Map<string, NodeJS.Timeout>();

  /**
   * Track a new approval request
   */
  trackApprovalRequest(request: ApprovalRequestEvent): void {
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
  processApprovalResponse(
    response: ApprovalResponseEvent
  ): ApprovalRequestEvent | null {
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
  cancelApprovalRequest(requestId: string): boolean {
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
  getPendingApprovals(): ApprovalRequestEvent[] {
    return Array.from(this.pendingApprovals.values())();
  }

  /**
   * Check if approval is pending
   */
  isApprovalPending(requestId: string): boolean {
    return this.pendingApprovals.has(requestId);
  }

  /**
   * Handle approval timeout
   */
  private handleApprovalTimeout(requestId: string): void {
    const request = this.pendingApprovals.get(requestId);
    if (request) {
      // Could emit timeout event here for escalation
      this.pendingApprovals.delete(requestId);
    }
  }

  /**
   * Clear approval timeout
   */
  private clearApprovalTimeout(requestId: string): void {
    const timeout = this.approvalTimeouts.get(requestId);
    if (timeout) {
      clearTimeout(timeout);
      this.approvalTimeouts.delete(requestId);
    }
  }

  /**
   * Clean up all timeouts
   */
  destroy(): void {
    for (const timeout of this.approvalTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.approvalTimeouts.clear();
    this.pendingApprovals.clear();
  }
}
