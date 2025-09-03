import { getLogger } from '../utils/logger.js';
import { AuditTrailManager } from '../audit/audit-trail-manager.js';

const logger = getLogger('human-oversight-manager');

/**
 * Oversight Decision Types
 */
export enum OversightDecisionType {
  /** Approve the AI decision */
  APPROVE = 'approve',
  /** Reject the AI decision */
  REJECT = 'reject',
  /** Modify the AI decision */
  MODIFY = 'modify',
  /** Request more information */
  REQUEST_INFO = 'request_info',
  /** Escalate to higher authority */
  ESCALATE = 'escalate'
}

/**
 * Oversight Trigger Types
 */
export enum OversightTrigger {
  /** High-risk decision requiring review */
  HIGH_RISK_DECISION = 'high_risk_decision',
  /** Low confidence score */
  LOW_CONFIDENCE = 'low_confidence',
  /** Bias detection alert */
  BIAS_ALERT = 'bias_alert',
  /** Unusual pattern detected */
  ANOMALY_DETECTED = 'anomaly_detected',
  /** Manual review requested */
  MANUAL_REQUEST = 'manual_request',
  /** Regulatory requirement */
  REGULATORY_REQUIREMENT = 'regulatory_requirement'
}

/**
 * AI Decision to be reviewed
 */
export interface AIDecision {
  /** Decision ID */
  id: string;
  /** AI System ID */
  systemId: string;
  /** Decision type */
  type: string;
  /** Decision details */
  details: Record<string, any>;
  /** Confidence score (0-1) */
  confidence: number;
  /** Reasoning/explanation */
  reasoning: string;
  /** Timestamp */
  timestamp: Date;
  /** Input data used */
  inputData: Record<string, any>;
  /** Risk assessment */
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
}

/**
 * Oversight Request
 */
export interface OversightRequest {
  /** Request ID */
  id: string;
  /** AI Decision to review */
  aiDecision: AIDecision;
  /** Trigger for oversight */
  trigger: OversightTrigger;
  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'urgent';
  /** Assigned reviewer */
  assignedReviewer?: string;
  /** Request timestamp */
  requestTime: Date;
  /** Deadline for review */
  deadline: Date;
  /** Status */
  status: 'pending' | 'in_review' | 'completed' | 'escalated' | 'expired';
  /** Additional context */
  context: {
    userImpact: string;
    businessImpact: string;
    regulatoryRequirement: boolean;
    stakeholders: string[];
  };
}

/**
 * Human Oversight Decision
 */
export interface HumanOversightDecision {
  /** Decision ID */
  id: string;
  /** Oversight request ID */
  requestId: string;
  /** Reviewer information */
  reviewer: {
    id: string;
    name: string;
    role: string;
    qualifications: string[];
  };
  /** Decision type */
  decision: OversightDecisionType;
  /** Rationale for decision */
  rationale: string;
  /** Modified decision (if applicable) */
  modifiedDecision?: Record<string, any>;
  /** Additional requirements */
  requirements?: string[];
  /** Timestamp */
  timestamp: Date;
  /** Review duration */
  reviewDuration: number; // milliseconds
}

/**
 * Oversight Metrics
 */
export interface OversightMetrics {
  /** Total oversight requests */
  totalRequests: number;
  /** Completed reviews */
  completedReviews: number;
  /** Average review time */
  averageReviewTime: number;
  /** Override rate */
  overrideRate: number;
  /** Approval rate */
  approvalRate: number;
  /** Escalation rate */
  escalationRate: number;
  /** By trigger type */
  byTriggerType: Record<OversightTrigger, number>;
  /** By decision type */
  byDecisionType: Record<OversightDecisionType, number>;
}

/**
 * Human Oversight Manager
 * Implements human oversight requirements for EU AI Act compliance
 */
export class HumanOversightManager {
  private oversightRequests: Map<string, OversightRequest> = new Map();
  private oversightDecisions: Map<string, HumanOversightDecision> = new Map();
  private pendingRequests: Set<string> = new Set();
  private requestsBySystem: Map<string, Set<string>> = new Map();
  private auditTrailManager: AuditTrailManager;

  constructor(auditTrailManager: AuditTrailManager) {
    this.auditTrailManager = auditTrailManager;
  }

  /**
   * Request human oversight for an AI decision
   */
  async requestOversight(
    aiDecision: AIDecision,
    trigger: OversightTrigger,
    context: {
      userImpact: string;
      businessImpact: string;
      regulatoryRequirement: boolean;
      stakeholders: string[];
    }
  ): Promise<string> {
    const requestId = this.generateRequestId();
    const priority = this.calculatePriority(aiDecision, trigger, context);
    const deadline = this.calculateDeadline(priority, trigger);

    const request: OversightRequest = {
      id: requestId,
      aiDecision,
      trigger,
      priority,
      requestTime: new Date(),
      deadline,
      status: 'pending',
      context
    };

    // Store the request
    this.oversightRequests.set(requestId, request);
    this.pendingRequests.add(requestId);

    // Update system index
    if (!this.requestsBySystem.has(aiDecision.systemId)) {
      this.requestsBySystem.set(aiDecision.systemId, new Set());
    }
    this.requestsBySystem.get(aiDecision.systemId)!.add(requestId);

    // Assign reviewer
    const assignedReviewer = await this.assignReviewer(request);
    if (assignedReviewer) {
      request.assignedReviewer = assignedReviewer;
    }

    // Record audit event
    await this.auditTrailManager.recordEvent(
      'human_oversight' as any,
      aiDecision.systemId,
      'system',
      `Human oversight requested for decision ${aiDecision.id}`,
      {
        aiDecisionId: aiDecision.id,
        trigger,
        priority,
        deadline: deadline.toISOString()
      },
      {
        riskCategory: 'high',
        requiresHumanOversight: true,
        dataClassification: 'oversight_request'
      }
    );

    logger.info(`Human oversight requested for decision ${aiDecision.id}`, {
      requestId,
      trigger,
      priority,
      systemId: aiDecision.systemId
    });

    return requestId;
  }

  /**
   * Provide human oversight decision
   */
  async provideOversight(
    requestId: string,
    reviewer: {
      id: string;
      name: string;
      role: string;
      qualifications: string[];
    },
    decision: OversightDecisionType,
    rationale: string,
    modifiedDecision?: Record<string, any>,
    requirements?: string[]
  ): Promise<string> {
    const request = this.oversightRequests.get(requestId);
    if (!request) {
      throw new Error(`Oversight request not found: ${requestId}`);
    }

    if (request.status !== 'pending' && request.status !== 'in_review') {
      throw new Error(`Cannot provide oversight for request in status: ${request.status}`);
    }

    const decisionId = this.generateDecisionId();
    const reviewStartTime = request.status === 'in_review' ? 
      new Date(request.requestTime.getTime() + 1000) : // Approximate start
      new Date();
    const reviewDuration = Date.now() - reviewStartTime.getTime();

    const oversightDecision: HumanOversightDecision = {
      id: decisionId,
      requestId,
      reviewer,
      decision,
      rationale,
      modifiedDecision: modifiedDecision || undefined,
      requirements: requirements || undefined,
      timestamp: new Date(),
      reviewDuration
    };

    // Store the decision
    this.oversightDecisions.set(decisionId, oversightDecision);

    // Update request status
    request.status = 'completed';
    this.pendingRequests.delete(requestId);

    // Record audit event
    await this.auditTrailManager.recordHumanOversight(
      request.aiDecision.systemId,
      reviewer.id,
      decision === OversightDecisionType.APPROVE ? 'review' : 'override',
      request.aiDecision.details,
      modifiedDecision || request.aiDecision.details,
      rationale
    );

    logger.info(`Human oversight provided for request ${requestId}`, {
      decisionId,
      decision,
      reviewerId: reviewer.id,
      reviewDuration
    });

    return decisionId;
  }

  /**
   * Escalate oversight request
   */
  async escalateRequest(
    requestId: string,
    escalationReason: string,
    escalatedTo?: string
  ): Promise<void> {
    const request = this.oversightRequests.get(requestId);
    if (!request) {
      throw new Error(`Oversight request not found: ${requestId}`);
    }

    request.status = 'escalated';
    request.priority = 'urgent';
    
    if (escalatedTo) {
      request.assignedReviewer = escalatedTo;
    }

    // Record audit event
    await this.auditTrailManager.recordEvent(
      'human_oversight' as any,
      request.aiDecision.systemId,
      request.assignedReviewer || 'system',
      `Oversight request escalated: ${escalationReason}`,
      {
        requestId,
        escalationReason,
        escalatedTo,
        originalPriority: request.priority
      },
      {
        riskCategory: 'high',
        requiresHumanOversight: true,
        dataClassification: 'oversight_escalation'
      }
    );

    logger.warn(`Oversight request escalated: ${requestId}`, {
      reason: escalationReason,
      escalatedTo
    });
  }

  /**
   * Get pending oversight requests
   */
  async getPendingRequests(
    assignedReviewer?: string,
    priority?: 'low' | 'medium' | 'high' | 'urgent'
  ): Promise<OversightRequest[]> {
    const requests = Array.from(this.pendingRequests)
      .map(id => this.oversightRequests.get(id)!)
      .filter(request => {
        if (assignedReviewer && request.assignedReviewer !== assignedReviewer) {
          return false;
        }
        if (priority && request.priority !== priority) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by priority and deadline
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return a.deadline.getTime() - b.deadline.getTime();
      });

    return requests;
  }

  /**
   * Get oversight metrics for a system
   */
  async getOversightMetrics(
    systemId: string,
    dateRange?: { from: Date; to: Date }
  ): Promise<OversightMetrics> {
    const systemRequests = this.requestsBySystem.get(systemId) || new Set();
    let requests = Array.from(systemRequests)
      .map(id => this.oversightRequests.get(id)!)
      .filter(Boolean);

    if (dateRange) {
      requests = requests.filter(request =>
        request.requestTime >= dateRange.from &&
        request.requestTime <= dateRange.to
      );
    }

    const completedRequests = requests.filter(r => r.status === 'completed');
    const decisions = completedRequests
      .map(r => Array.from(this.oversightDecisions.values())
        .find(d => d.requestId === r.id))
      .filter(Boolean) as HumanOversightDecision[];

    const totalRequests = requests.length;
    const completedReviews = completedRequests.length;

    // Calculate metrics
    const averageReviewTime = decisions.length > 0 ?
      decisions.reduce((sum, d) => sum + d.reviewDuration, 0) / decisions.length : 0;

    const overrideRate = decisions.length > 0 ?
      decisions.filter(d => d.decision !== OversightDecisionType.APPROVE).length / decisions.length : 0;

    const approvalRate = decisions.length > 0 ?
      decisions.filter(d => d.decision === OversightDecisionType.APPROVE).length / decisions.length : 0;

    const escalationRate = requests.length > 0 ?
      requests.filter(r => r.status === 'escalated').length / requests.length : 0;

    // By trigger type
    const byTriggerType: Record<OversightTrigger, number> = {} as any;
    Object.values(OversightTrigger).forEach(trigger => {
      byTriggerType[trigger] = requests.filter(r => r.trigger === trigger).length;
    });

    // By decision type
    const byDecisionType: Record<OversightDecisionType, number> = {} as any;
    Object.values(OversightDecisionType).forEach(decisionType => {
      byDecisionType[decisionType] = decisions.filter(d => d.decision === decisionType).length;
    });

    return {
      totalRequests,
      completedReviews,
      averageReviewTime,
      overrideRate,
      approvalRate,
      escalationRate,
      byTriggerType,
      byDecisionType
    };
  }

  /**
   * Check if decision requires human oversight
   */
  shouldRequireOversight(
    aiDecision: AIDecision,
    riskCategory: string
  ): { required: boolean; triggers: OversightTrigger[] } {
    const triggers: OversightTrigger[] = [];

    // High-risk systems always require oversight for critical decisions
    if (riskCategory === 'high' && aiDecision.riskAssessment.level === 'high') {
      triggers.push(OversightTrigger.HIGH_RISK_DECISION);
    }

    // Low confidence decisions
    if (aiDecision.confidence < 0.7) {
      triggers.push(OversightTrigger.LOW_CONFIDENCE);
    }

    // Unusual patterns (implement your logic here)
    if (this.detectAnomalies(aiDecision)) {
      triggers.push(OversightTrigger.ANOMALY_DETECTED);
    }

    return {
      required: triggers.length > 0,
      triggers
    };
  }

  /**
   * Calculate priority for oversight request
   */
  private calculatePriority(
    aiDecision: AIDecision,
    trigger: OversightTrigger,
    context: OversightRequest['context']
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (context.regulatoryRequirement) {
      return 'urgent';
    }

    if (trigger === OversightTrigger.BIAS_ALERT) {
      return 'high';
    }

    if (aiDecision.riskAssessment.level === 'critical') {
      return 'urgent';
    }

    if (aiDecision.riskAssessment.level === 'high') {
      return 'high';
    }

    if (trigger === OversightTrigger.HIGH_RISK_DECISION) {
      return 'high';
    }

    if (trigger === OversightTrigger.LOW_CONFIDENCE) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Calculate deadline for review
   */
  private calculateDeadline(
    priority: 'low' | 'medium' | 'high' | 'urgent',
    _trigger: OversightTrigger // Underscore prefix to indicate intentionally unused
  ): Date {
    const now = new Date();
    const deadlineHours = {
      urgent: 2,    // 2 hours
      high: 8,      // 8 hours
      medium: 24,   // 24 hours
      low: 72       // 72 hours
    };

    const hours = deadlineHours[priority];
    return new Date(now.getTime() + hours * 60 * 60 * 1000);
  }

  /**
   * Assign reviewer based on expertise and availability
   */
  private async assignReviewer(_request: OversightRequest): Promise<string | null> {
    // Implement reviewer assignment logic
    // This would typically integrate with an HR system or reviewer database
    
    // For now, return a placeholder
    const reviewers = [
      'ai-ethics-reviewer-1',
      'domain-expert-1',
      'compliance-officer-1'
    ];

    // Simple round-robin assignment
    const index = Math.floor(Math.random() * reviewers.length);
    return reviewers[index] || null;
  }

  /**
   * Detect anomalies in AI decision
   */
  private detectAnomalies(aiDecision: AIDecision): boolean {
    // Implement anomaly detection logic
    // This could include pattern analysis, outlier detection, etc.
    
    // Simple example: check for unusual confidence patterns
    return aiDecision.confidence > 0.95 && aiDecision.riskAssessment.level === 'high';
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `oversight-req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique decision ID
   */
  private generateDecisionId(): string {
    return `oversight-dec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}