import { getLogger } from '../utils/logger.js';

const logger = getLogger('audit-trail-manager');

/**
 * Audit Event Types for EU AI Act Compliance
 */
export enum AuditEventType {
  /** System registration events */
  SYSTEM_REGISTRATION = 'system_registration',
  /** Risk assessment events */
  RISK_ASSESSMENT = 'risk_assessment',
  /** Decision making events */
  DECISION_MADE = 'decision_made',
  /** Human oversight events */
  HUMAN_OVERSIGHT = 'human_oversight',
  /** Data governance events */
  DATA_GOVERNANCE = 'data_governance',
  /** Bias detection events */
  BIAS_DETECTION = 'bias_detection',
  /** System modification events */
  SYSTEM_MODIFICATION = 'system_modification',
  /** Compliance violation events */
  COMPLIANCE_VIOLATION = 'compliance_violation',
  /** Training events */
  TRAINING_EVENT = 'training_event',
  /** Access control events */
  ACCESS_CONTROL = 'access_control'
}

/**
 * Audit Event
 */
export interface AuditEvent {
  /** Unique event ID */
  id: string;
  /** Event type */
  type: AuditEventType;
  /** Timestamp */
  timestamp: Date;
  /** AI System ID */
  systemId: string;
  /** User/Agent ID */
  userId: string;
  /** Event description */
  description: string;
  /** Event details */
  details: Record<string, any>;
  /** Compliance context */
  complianceContext: {
    riskCategory: string;
    requiresHumanOversight: boolean;
    dataClassification: string;
  };
  /** Metadata */
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    correlationId?: string;
  };
}

/**
 * Audit Query Parameters
 */
export interface AuditQuery {
  /** System ID filter */
  systemId?: string;
  /** Event type filter */
  eventType?: AuditEventType;
  /** Date range filter */
  dateRange?: {
    from: Date;
    to: Date;
  };
  /** User ID filter */
  userId?: string;
  /** Pagination */
  pagination?: {
    offset: number;
    limit: number;
  };
  /** Sorting */
  sort?: {
    field: keyof AuditEvent;
    direction: 'asc' | 'desc';
  };
}

/**
 * Audit Trail Manager
 * Manages audit trails for EU AI Act compliance
 */
export class AuditTrailManager {
  private auditEvents: Map<string, AuditEvent> = new Map();
  private eventsBySystem: Map<string, Set<string>> = new Map();
  private eventsByType: Map<AuditEventType, Set<string>> = new Map();
  private eventsByUser: Map<string, Set<string>> = new Map();

  /**
   * Record an audit event
   */
  async recordEvent(
    type: AuditEventType,
    systemId: string,
    userId: string,
    description: string,
    details: Record<string, any> = {},
    complianceContext: {
      riskCategory: string;
      requiresHumanOversight: boolean;
      dataClassification: string;
    },
    metadata: Record<string, any> = {}
  ): Promise<string> {
    const eventId = this.generateEventId();
    const timestamp = new Date();

    const event: AuditEvent = {
      id: eventId,
      type,
      timestamp,
      systemId,
      userId,
      description,
      details,
      complianceContext,
      metadata
    };

    // Store the event
    this.auditEvents.set(eventId, event);

    // Update indices
    this.updateIndices(event);

    logger.info(`Audit event recorded: ${type} for system ${systemId}`, {
      eventId,
      userId,
      timestamp
    });

    return eventId;
  }

  /**
   * Record system registration event
   */
  async recordSystemRegistration(
    systemId: string,
    userId: string,
    systemPurpose: any,
    riskCategory: string
  ): Promise<string> {
    return this.recordEvent(
      AuditEventType.SYSTEM_REGISTRATION,
      systemId,
      userId,
      `AI system registered for EU AI Act compliance`,
      {
        systemPurpose,
        riskCategory,
        registrationDate: new Date().toISOString()
      },
      {
        riskCategory,
        requiresHumanOversight: riskCategory === 'high',
        dataClassification: 'system_metadata'
      }
    );
  }

  /**
   * Record decision making event
   */
  async recordDecision(
    systemId: string,
    userId: string,
    decisionType: string,
    decisionDetails: any,
    humanOversight: boolean,
    riskCategory: string
  ): Promise<string> {
    return this.recordEvent(
      AuditEventType.DECISION_MADE,
      systemId,
      userId,
      `AI system decision: ${decisionType}`,
      {
        decisionType,
        decisionDetails,
        humanOversight,
        confidence: decisionDetails.confidence || null,
        reasoning: decisionDetails.reasoning || null
      },
      {
        riskCategory,
        requiresHumanOversight: humanOversight,
        dataClassification: 'decision_data'
      }
    );
  }

  /**
   * Record human oversight event
   */
  async recordHumanOversight(
    systemId: string,
    userId: string,
    oversightType: 'review' | 'intervention' | 'override',
    originalDecision: any,
    humanDecision: any,
    rationale: string
  ): Promise<string> {
    return this.recordEvent(
      AuditEventType.HUMAN_OVERSIGHT,
      systemId,
      userId,
      `Human oversight: ${oversightType}`,
      {
        oversightType,
        originalDecision,
        humanDecision,
        rationale,
        interventionTime: new Date().toISOString()
      },
      {
        riskCategory: 'high',
        requiresHumanOversight: true,
        dataClassification: 'oversight_data'
      }
    );
  }

  /**
   * Record bias detection event
   */
  async recordBiasDetection(
    systemId: string,
    userId: string,
    biasType: string,
    detectionMethod: string,
    biasScore: number,
    affectedGroups: string[],
    mitigationActions: string[]
  ): Promise<string> {
    return this.recordEvent(
      AuditEventType.BIAS_DETECTION,
      systemId,
      userId,
      `Bias detection: ${biasType}`,
      {
        biasType,
        detectionMethod,
        biasScore,
        affectedGroups,
        mitigationActions,
        detectionDate: new Date().toISOString()
      },
      {
        riskCategory: 'high',
        requiresHumanOversight: true,
        dataClassification: 'bias_monitoring'
      }
    );
  }

  /**
   * Record compliance violation
   */
  async recordComplianceViolation(
    systemId: string,
    userId: string,
    violationType: string,
    violationDetails: any,
    severity: 'low' | 'medium' | 'high' | 'critical',
    correctiveActions: string[]
  ): Promise<string> {
    return this.recordEvent(
      AuditEventType.COMPLIANCE_VIOLATION,
      systemId,
      userId,
      `Compliance violation: ${violationType}`,
      {
        violationType,
        violationDetails,
        severity,
        correctiveActions,
        violationDate: new Date().toISOString()
      },
      {
        riskCategory: 'high',
        requiresHumanOversight: true,
        dataClassification: 'violation_data'
      }
    );
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditQuery): Promise<{
    events: AuditEvent[];
    totalCount: number;
    hasMore: boolean;
  }> {
    let eventIds = new Set<string>(this.auditEvents.keys());

    // Apply filters
    if (query.systemId) {
      const systemEvents = this.eventsBySystem.get(query.systemId) || new Set();
      eventIds = new Set([...eventIds].filter(id => systemEvents.has(id)));
    }

    if (query.eventType) {
      const typeEvents = this.eventsByType.get(query.eventType) || new Set();
      eventIds = new Set([...eventIds].filter(id => typeEvents.has(id)));
    }

    if (query.userId) {
      const userEvents = this.eventsByUser.get(query.userId) || new Set();
      eventIds = new Set([...eventIds].filter(id => userEvents.has(id)));
    }

    if (query.dateRange) {
      eventIds = new Set([...eventIds].filter(id => {
        const event = this.auditEvents.get(id)!;
        return event.timestamp >= query.dateRange!.from && 
               event.timestamp <= query.dateRange!.to;
      }));
    }

    // Convert to events array
    let events = [...eventIds].map(id => this.auditEvents.get(id)!);

    // Apply sorting
    if (query.sort) {
      const { field, direction } = query.sort;
      events.sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return direction === 'desc' ? -comparison : comparison;
      });
    } else {
      // Default sort by timestamp descending
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    const totalCount = events.length;

    // Apply pagination
    if (query.pagination) {
      const { offset, limit } = query.pagination;
      events = events.slice(offset, offset + limit);
    }

    const hasMore = query.pagination ? 
      (query.pagination.offset + events.length) < totalCount : false;

    return {
      events,
      totalCount,
      hasMore
    };
  }

  /**
   * Get compliance timeline for a system
   */
  async getComplianceTimeline(systemId: string): Promise<AuditEvent[]> {
    const query: AuditQuery = {
      systemId,
      sort: { field: 'timestamp', direction: 'asc' }
    };

    const result = await this.queryEvents(query);
    return result.events;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    systemId: string,
    dateRange: { from: Date; to: Date }
  ): Promise<{
    systemId: string;
    reportPeriod: { from: Date; to: Date };
    eventSummary: Record<AuditEventType, number>;
    keyEvents: AuditEvent[];
    complianceMetrics: {
      totalDecisions: number;
      humanOversightPercentage: number;
      biasDetectionEvents: number;
      complianceViolations: number;
    };
  }> {
    const query: AuditQuery = {
      systemId,
      dateRange
    };

    const result = await this.queryEvents(query);
    const events = result.events;

    // Event summary by type
    const eventSummary: Record<AuditEventType, number> = {} as any;
    Object.values(AuditEventType).forEach(type => {
      eventSummary[type] = 0;
    });

    events.forEach(event => {
      eventSummary[event.type]++;
    });

    // Key events (critical for compliance)
    const keyEventTypes = [
      AuditEventType.COMPLIANCE_VIOLATION,
      AuditEventType.BIAS_DETECTION,
      AuditEventType.HUMAN_OVERSIGHT,
      AuditEventType.RISK_ASSESSMENT
    ];
    
    const keyEvents = events.filter(event => 
      keyEventTypes.includes(event.type)
    ).slice(0, 20); // Top 20 key events

    // Compliance metrics
    const totalDecisions = eventSummary[AuditEventType.DECISION_MADE];
    const humanOversightEvents = eventSummary[AuditEventType.HUMAN_OVERSIGHT];
    const humanOversightPercentage = totalDecisions > 0 ? 
      (humanOversightEvents / totalDecisions) * 100 : 0;

    return {
      systemId,
      reportPeriod: dateRange,
      eventSummary,
      keyEvents,
      complianceMetrics: {
        totalDecisions,
        humanOversightPercentage,
        biasDetectionEvents: eventSummary[AuditEventType.BIAS_DETECTION],
        complianceViolations: eventSummary[AuditEventType.COMPLIANCE_VIOLATION]
      }
    };
  }

  /**
   * Export audit trail for regulatory compliance
   */
  async exportAuditTrail(
    systemId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const timeline = await this.getComplianceTimeline(systemId);
    
    if (format === 'json') {
      return JSON.stringify(timeline, null, 2);
    } else {
      // CSV format
      const headers = [
        'Event ID', 'Type', 'Timestamp', 'System ID', 'User ID', 
        'Description', 'Risk Category', 'Human Oversight Required'
      ];
      
      const rows = timeline.map(event => [
        event.id,
        event.type,
        event.timestamp.toISOString(),
        event.systemId,
        event.userId,
        event.description,
        event.complianceContext.riskCategory,
        event.complianceContext.requiresHumanOversight
      ]);

      return [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
    }
  }

  /**
   * Update indices for efficient querying
   */
  private updateIndices(event: AuditEvent): void {
    // By system
    if (!this.eventsBySystem.has(event.systemId)) {
      this.eventsBySystem.set(event.systemId, new Set());
    }
    this.eventsBySystem.get(event.systemId)!.add(event.id);

    // By type
    if (!this.eventsByType.has(event.type)) {
      this.eventsByType.set(event.type, new Set());
    }
    this.eventsByType.get(event.type)!.add(event.id);

    // By user
    if (!this.eventsByUser.has(event.userId)) {
      this.eventsByUser.set(event.userId, new Set());
    }
    this.eventsByUser.get(event.userId)!.add(event.id);
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}