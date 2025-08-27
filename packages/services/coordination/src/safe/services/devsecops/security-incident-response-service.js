/**
 * @fileoverview Security Incident Response Service
 *
 * Service for managing security incidents and coordinating response activities.
 * Handles incident detection, classification, response coordination, and post-incident analysis.
 *
 * SINGLE RESPONSIBILITY: Security incident response and coordination
 * FOCUSES ON: Incident management, response coordination, security operations
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import { dateFns, generateNanoId, } from '@claude-zen/foundation';
const { format, addMinutes, addHours, addDays } = dateFns;
/**
 * Incident severity levels
 */
export var IncidentSeverity;
(function (IncidentSeverity) {
    IncidentSeverity["LOW"] = "low";
    IncidentSeverity["MEDIUM"] = "medium";
    IncidentSeverity["HIGH"] = "high";
    IncidentSeverity["CRITICAL"] = "critical";
})(IncidentSeverity || (IncidentSeverity = {}));
/**
 * Incident categories
 */
export var IncidentCategory;
(function (IncidentCategory) {
    IncidentCategory["MALWARE"] = "malware";
    IncidentCategory["PHISHING"] = "phishing";
    IncidentCategory["DATA_BREACH"] = "data_breach";
    IncidentCategory["UNAUTHORIZED_ACCESS"] = "unauthorized_access";
    IncidentCategory["DOS_DDOS"] = "dos_ddos";
    IncidentCategory["INSIDER_THREAT"] = "insider_threat";
    IncidentCategory["VULNERABILITY_EXPLOIT"] = "vulnerability_exploit";
    IncidentCategory["COMPLIANCE_VIOLATION"] = "compliance_violation";
    IncidentCategory["OTHER"] = "other";
})(IncidentCategory || (IncidentCategory = {}));
/**
 * Incident status tracking
 */
export var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["DETECTED"] = "detected";
    IncidentStatus["ANALYZING"] = "analyzing";
    IncidentStatus["CONTAINED"] = "contained";
    IncidentStatus["ERADICATING"] = "eradicating";
    IncidentStatus["RECOVERING"] = "recovering";
    IncidentStatus["RESOLVED"] = "resolved";
    IncidentStatus["CLOSED"] = "closed";
})(IncidentStatus || (IncidentStatus = {}));
/**
 * Incident priority levels
 */
export var IncidentPriority;
(function (IncidentPriority) {
    IncidentPriority["P1"] = "p1";
    IncidentPriority["P2"] = "p2";
    IncidentPriority["P3"] = "p3";
    IncidentPriority["P4"] = "p4";
})(IncidentPriority || (IncidentPriority = {}));
/**
 * Response team roles
 */
export var ResponseRole;
(function (ResponseRole) {
    ResponseRole["INCIDENT_COMMANDER"] = "incident_commander";
    ResponseRole["SECURITY_ANALYST"] = "security_analyst";
    ResponseRole["FORENSICS_SPECIALIST"] = "forensics_specialist";
    ResponseRole["COMMUNICATIONS_LEAD"] = "communications_lead";
    ResponseRole["LEGAL_COUNSEL"] = "legal_counsel";
    ResponseRole["IT_OPERATIONS"] = "it_operations";
    ResponseRole["BUSINESS_LIAISON"] = "business_liaison";
})(ResponseRole || (ResponseRole = {}));
/**
 * Availability status
 */
export var AvailabilityStatus;
(function (AvailabilityStatus) {
    AvailabilityStatus["AVAILABLE"] = "available";
    AvailabilityStatus["BUSY"] = "busy";
    AvailabilityStatus["ON_CALL"] = "on_call";
    AvailabilityStatus["UNAVAILABLE"] = "unavailable";
})(AvailabilityStatus || (AvailabilityStatus = {}));
/**
 * Evidence types
 */
export var EvidenceType;
(function (EvidenceType) {
    EvidenceType["LOG_FILE"] = "log_file";
    EvidenceType["NETWORK_CAPTURE"] = "network_capture";
    EvidenceType["DISK_IMAGE"] = "disk_image";
    EvidenceType["MEMORY_DUMP"] = "memory_dump";
    EvidenceType["FILE_SAMPLE"] = "file_sample";
    EvidenceType["SCREENSHOT"] = "screenshot";
    EvidenceType["WITNESS_STATEMENT"] = "witness_statement";
    EvidenceType["OTHER"] = "other";
})(EvidenceType || (EvidenceType = {}));
/**
 * Impact levels
 */
export var ImpactLevel;
(function (ImpactLevel) {
    ImpactLevel["NONE"] = "none";
    ImpactLevel["LOW"] = "low";
    ImpactLevel["MEDIUM"] = "medium";
    ImpactLevel["HIGH"] = "high";
})(ImpactLevel || (ImpactLevel = {}));
/**
 * Business impact levels
 */
export var BusinessImpactLevel;
(function (BusinessImpactLevel) {
    BusinessImpactLevel["MINIMAL"] = "minimal";
    BusinessImpactLevel["MODERATE"] = "moderate";
    BusinessImpactLevel["SIGNIFICANT"] = "significant";
    BusinessImpactLevel["SEVERE"] = "severe";
})(BusinessImpactLevel || (BusinessImpactLevel = {}));
/**
 * Containment strategy
 */
export var ContainmentStrategy;
(function (ContainmentStrategy) {
    ContainmentStrategy["ISOLATION"] = "isolation";
    ContainmentStrategy["SHUTDOWN"] = "shutdown";
    ContainmentStrategy["NETWORK_SEGMENTATION"] = "network_segmentation";
    ContainmentStrategy["ACCESS_REVOCATION"] = "access_revocation";
    ContainmentStrategy["PATCH_DEPLOYMENT"] = "patch_deployment";
    ContainmentStrategy["MONITORING_ENHANCEMENT"] = "monitoring_enhancement";
})(ContainmentStrategy || (ContainmentStrategy = {}));
/**
 * Action status
 */
export var ActionStatus;
(function (ActionStatus) {
    ActionStatus["PLANNED"] = "planned";
    ActionStatus["IN_PROGRESS"] = "in_progress";
    ActionStatus["COMPLETED"] = "completed";
    ActionStatus["FAILED"] = "failed";
    ActionStatus["CANCELLED"] = "cancelled";
})(ActionStatus || (ActionStatus = {}));
/**
 * Security Incident Response Service for managing security incidents
 */
export class SecurityIncidentResponseService {
    constructor(logger, config) {
        this.logger = logger;
        this.responseConfig = config || this.getDefaultConfig();
        this.initializeResponseTeams();
    }
    /**
     * Create new security incident
     */
    createIncident(incidentData) {
        const _incidentId = `incident-${generateNanoId(12)}`;
        `

    this.logger.info('Creating security incident', {'
      incidentId,
      severity: incidentData.severity,
      category: incidentData.category,
    });

    // Determine priority based on severity
    const priority = this.determinePriority(
      incidentData.severity,
      incidentData.category
    );

    // Assign response team
    const responseTeam = this.assignResponseTeam(
      incidentData.severity,
      incidentData.category
    );

    // Create initial impact assessment
    const impact = this.performInitialImpactAssessment(incidentData);

    // Create incident
    const incident: SecurityIncident = {
      incidentId,
      title: incidentData.title,
      description: incidentData.description,
      severity: incidentData.severity,
      category: incidentData.category,
      status: IncidentStatus.DETECTED,
      priority,
      detectedDate: new Date(),
      reportedBy: incidentData.reportedBy,
      responseTeam,
      timeline: [
        {
          entryId: `;
        timeline - $generateNanoId(8) `,`;
        timestamp: new Date(),
            action;
        'incident_created',
            description;
        `Incident created: $incidentData.title`, `
          performer: incidentData.reportedBy,
          category: 'detection',
        },
      ],
      evidence: incidentData.initialEvidence
        ? this.convertToEvidence(_incidentData._initialEvidence)
        : [],
      impact,
      containment: {
        strategy: ContainmentStrategy.MONITORING_ENHANCEMENT,
        actions: [],
        effectiveness: 0,
      },
      resolution: {
        rootCause: ',
        resolutionDate: new Date(),
        resolutionSummary: ',
        preventiveMeasures: [],
        lessonsLearned: [],
        totalResponseTime: 0,
        cost: {
          responseCost: 0,
          systemDowntime: 0,
          lostRevenue: 0,
          recoveryComplexity: 1,
          totalCost: 0,
        },
      },
    };

    // Store incident
    this.incidents.set(incidentId, incident);

    // Trigger notifications
    this.sendIncidentNotifications(incident);

    // Start escalation timer
    this.startEscalationTimer(incident);

    this.logger.info('Security incident created', {'
      incidentId,
      priority,
      responseTeamSize: responseTeam.length,
    });

    return incident;
  }

  /**
   * Update incident status
   */
  updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    updatedBy: string,
    notes?: string
  ): SecurityIncident {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`;
        Incident;
        not;
        found: $;
        {
            incidentId;
        }
        `);`;
    }
}
this.logger.info('Updating incident status', { ': incidentId,
    oldStatus: incident.status,
    newStatus: status,
    updatedBy,
});
// Add timeline entry
const timelineEntry = {
    entryId: `timeline-$generateNanoId(8)`,
} `
      timestamp: new Date(),
      action: 'status_updated',
      description: `, Status, changed, from, $incident, statusto, $status$notes;
`: ${notes}`;
'' `,`;
performer: updatedBy,
    category;
this.getTimelineCategory(status),
;
;
// Update incident
const updatedIncident = {
    ...incident,
    status,
    timeline: [...incident.timeline, timelineEntry],
};
this.incidents.set(incidentId, updatedIncident);
// Handle status-specific actions
this.handleStatusChange(updatedIncident, status);
return updatedIncident;
/**
 * Add evidence to incident
 */
addEvidence(incidentId, string, evidence, Omit <
    IncidentEvidence, 'evidenceId|collectedDate|chainOfCustody', '
    >
);
void {
    const: incident = this.incidents.get(incidentId),
    if(, incident) {
        throw new Error(`Incident not found: ${incidentId}`);
        `
    }

    const newEvidence: IncidentEvidence = {
      evidenceId: `;
        evidence - $generateNanoId(8) `,`;
        collectedDate: new Date(),
            chainOfCustody;
        [
            timestamp, new Date(),
            action, 'collected',
            person, evidence.collectedBy,
            location, 'Digital collection',
            notes, 'Evidence collected for incident investigation', ,
        ],
        ;
    },
    ...evidence,
};
const updatedIncident = {
    ...incident,
    evidence: [...incident.evidence, newEvidence],
    timeline: [
        ...incident.timeline,
        {
            entryId: `timeline-${generateNanoId(8)}`,
        } `
          timestamp: new Date(),
          action: 'evidence_added',
          description: `, Evidence, added, $, { evidence, : .description } `,`,
        performer, evidence.collectedBy,
        category, 'analysis',
        evidence, newEvidence.evidenceId,
    ]
};
;
this.incidents.set(incidentId, updatedIncident);
this.logger.info('Evidence added to incident', { ': incidentId,
    evidenceId: newEvidence.evidenceId,
    evidenceType: evidence.type,
});
/**
 * Initiate containment actions
 */
async;
initiateContainment(incidentId, string, strategy, ContainmentStrategy, actions, Omit < ContainmentAction, 'actionId|status|startTime' > [], ');
Promise < void  > {
    const: incident = this.incidents.get(incidentId),
    if(, incident) {
        throw new Error(`Incident not found: ${incidentId}`);
        `
    }

    this.logger.info('Initiating containment actions', {'
      incidentId,
      strategy,
      actionCount: actions.length,
    });

    const containmentActions: ContainmentAction[] = actions.map((action) => ({
      actionId: `;
        action - $generateNanoId(8) `,`;
        status: ActionStatus.PLANNED,
            startTime;
        new Date(),
        ;
    },
    ...action,
};
;
const updatedIncident = {
    ...incident,
    status: IncidentStatus.CONTAINED,
    containment: {
        strategy,
        actions: containmentActions,
        effectiveness: 0, // Will be updated as actions complete
    },
    timeline: [
        ...incident.timeline,
        {
            entryId: `timeline-${generateNanoId(8)}`,
        } `
          timestamp: new Date(),
          action: 'containment_initiated',
          description: `, Containment, strategy, initiated, $, { strategy } `,`,
        performer, 'system',
        category, 'containment',
    ]
};
;
this.incidents.set(incidentId, updatedIncident);
// Execute containment actions
await this.executeContainmentActions(incidentId, containmentActions);
/**
 * Resolve incident
 */
resolveIncident(incidentId, string, resolution, Omit <
    IncidentResolution, 'resolutionDate|totalResponseTime', '
    > , resolvedBy, string);
SecurityIncident;
{
    const incident = this.incidents.get(incidentId);
    if (!incident) {
        throw new Error(`Incident not found: ${incidentId}`);
        `
    }

    this.logger.info('Resolving incident', { incidentId, resolvedBy });'

    const resolutionDate = new Date();
    const totalResponseTime = Math.floor(
      (resolutionDate.getTime() - incident.detectedDate.getTime()) / (1000 * 60)
    );

    const updatedIncident: SecurityIncident = {
      ...incident,
      status: IncidentStatus.RESOLVED,
      resolution: {
        ...resolution,
        resolutionDate,
        totalResponseTime,
      },
      timeline: [
        ...incident.timeline,
        {
          entryId: `;
        timeline - $generateNanoId(8) `,`;
        timestamp: resolutionDate,
            action;
        'incident_resolved',
            description;
        `Incident resolved: $resolution.resolutionSummary`, `
          performer: resolvedBy,
          category: 'recovery',
        },
      ],
    };

    this.incidents.set(incidentId, updatedIncident);

    // Schedule post-incident review
    this.schedulePostIncidentReview(incidentId);

    this.logger.info('Incident resolved', {'
      incidentId,
      totalResponseTime,
      rootCause: resolution.rootCause,
    });

    return updatedIncident;
  }

  /**
   * Helper methods
   */
  private determinePriority(
    severity: IncidentSeverity,
    category: IncidentCategory
  ): IncidentPriority {
    if (severity === IncidentSeverity.CRITICAL) return IncidentPriority.P1;
    if (severity === IncidentSeverity.HIGH) return IncidentPriority.P2;
    if (severity === IncidentSeverity.MEDIUM) return IncidentPriority.P3;
    return IncidentPriority.P4;
  }

  private assignResponseTeam(
    severity: IncidentSeverity,
    category: IncidentCategory
  ): ResponseTeamMember[] {
    // Simplified team assignment logic
    const team: ResponseTeamMember[] = [
      {
        memberId: 'commander-1',
        name: 'Incident Commander',
        role: ResponseRole.INCIDENT_COMMANDER,
        contactInfo: { email: 'commander@example.com', phone: '+1-555-0001' },
        expertise: ['incident_management', 'coordination'],
        availability: AvailabilityStatus.ON_CALL,
        assignedDate: new Date(),
      },
      {
        memberId: 'analyst-1',
        name: 'Security Analyst',
        role: ResponseRole.SECURITY_ANALYST,
        contactInfo: { email: 'analyst@example.com', phone: '+1-555-0002' },
        expertise: ['threat_analysis', 'forensics'],
        availability: AvailabilityStatus.AVAILABLE,
        assignedDate: new Date(),
      },
    ];

    // Add specialists based on category
    if (category === IncidentCategory.MALWARE) {
      team.push({
        memberId: 'forensics-1',
        name: 'Forensics Specialist',
        role: ResponseRole.FORENSICS_SPECIALIST,
        contactInfo: { email: 'forensics@example.com', phone: '+1-555-0003' },
        expertise: ['malware_analysis', 'digital_forensics'],
        availability: AvailabilityStatus.AVAILABLE,
        assignedDate: new Date(),
      });
    }

    return team;
  }

  private performInitialImpactAssessment(incidentData: {
    severity: IncidentSeverity;
    category: IncidentCategory;
    description: string;
  }): SecurityImpactAssessment {
    // Simplified impact assessment
    const baseImpact = this.mapSeverityToImpact(incidentData.severity);

    return {
      confidentialityImpact: baseImpact,
      integrityImpact: baseImpact,
      availabilityImpact: baseImpact,
      businessImpact: this.mapSeverityToBusinessImpact(incidentData.severity),
      affectedSystems: [],
      affectedUsers: 0,
      dataCompromised: incidentData.category === IncidentCategory.DATA_BREACH,
      regulatoryImplications: [],
      estimatedCost: 0,
    };
  }

  private mapSeverityToImpact(severity: IncidentSeverity): ImpactLevel {
    switch (severity) {
      case IncidentSeverity.CRITICAL:
        return ImpactLevel.HIGH;
      case IncidentSeverity.HIGH:
        return ImpactLevel.MEDIUM;
      case IncidentSeverity.MEDIUM:
        return ImpactLevel.LOW;
      default:
        return ImpactLevel.NONE;
    }
  }

  private mapSeverityToBusinessImpact(
    severity: IncidentSeverity
  ): BusinessImpactLevel {
    switch (severity) {
      case IncidentSeverity.CRITICAL:
        return BusinessImpactLevel.SEVERE;
      case IncidentSeverity.HIGH:
        return BusinessImpactLevel.SIGNIFICANT;
      case IncidentSeverity.MEDIUM:
        return BusinessImpactLevel.MODERATE;
      default:
        return BusinessImpactLevel.MINIMAL;
    }
  }

  private convertToEvidence(
    partialEvidence: Partial<IncidentEvidence>[]
  ): IncidentEvidence[] {
    return partialEvidence.map((evidence) => ({
      evidenceId: `;
        evidence - $;
        {
            generateNanoId(8);
        }
        `,`;
        collectedDate: new Date(),
            chainOfCustody;
        [],
            type;
        EvidenceType.OTHER,
            source;
        'initial_report',
            description;
        'Initial evidence',
            collectedBy;
        'reporter',
            metadata;
        { }
        evidence,
        ;
    }
    as;
    IncidentEvidence[];
}
sendIncidentNotifications(incident, SecurityIncident);
void {
    this: .logger.info('Sending incident notifications', { ': incidentId, incident, : .incidentId,
        severity: incident.severity,
    })
};
startEscalationTimer(incident, SecurityIncident);
void {
    const: escalationRule = this.responseConfig.escalationMatrix.find((rule) => rule.severity === incident.severity &&
        rule.priority === incident.priority),
    if(escalationRule) {
        setTimeout(() => {
            this.escalateIncident(incident.incidentId, escalationRule);
        }, escalationRule.timeThreshold * 60 * 1000);
    }
};
escalateIncident(incidentId, string, rule, EscalationRule);
void {
    this: .logger.info('Escalating incident', { ': incidentId,
        rule: rule.severity,
    })
};
getTimelineCategory(status, IncidentStatus);
IncidentTimelineEntry['category'];
{
    ';
    switch (status) {
        case IncidentStatus.DETECTED:
            return 'detection;;
        case IncidentStatus.ANALYZING:
            return 'analysis;;
        case IncidentStatus.CONTAINED:
            return 'containment;;
        case IncidentStatus.ERADICATING:
            return 'eradication;;
        case IncidentStatus.RECOVERING:
            return 'recovery;;
        default:
            return 'communication;;
    }
}
handleStatusChange(incident, SecurityIncident, status, IncidentStatus);
void {
    switch(status) {
    },
    case: IncidentStatus.CONTAINED,
    this: .sendStatusNotification(incident, 'Incident has been contained'), ': ,
    break: ,
    case: IncidentStatus.RESOLVED,
    this: .sendStatusNotification(incident, 'Incident has been resolved'), ': ,
    break: 
};
sendStatusNotification(incident, SecurityIncident, message, string);
void {
    this: .logger.info('Sending status notification', { ': incidentId, incident, : .incidentId,
        message,
    })
};
async;
executeContainmentActions(incidentId, string, actions, ContainmentAction[]);
Promise < void  > {
    for(, action, of, actions) {
        try {
            // Simulate action execution
            await new Promise((resolve) => setTimeout(resolve, 1000));
            // Note: Would update action status to COMPLETED
            // action.status = ActionStatus.COMPLETED;
            // action.endTime = new Date();
            // action.result = `Action ${action.description} completed successfully`;`
            this.logger.info('Containment action completed', { ': incidentId,
                actionId: action.actionId,
                description: action.description,
            });
        }
        catch (error) {
            // Note: Would update action status to FAILED
            // action.status = ActionStatus.FAILED;
            // action.result = `Action failed: ${error}`;`
            this.logger.error('Containment action failed', { ': incidentId,
                actionId: action.actionId,
                error,
            });
        }
    }
};
schedulePostIncidentReview(incidentId, string);
void {
    this: .logger.info('Scheduling post-incident review', { incidentId }), ': 
    // Implementation would schedule PIR
};
initializeResponseTeams();
void {
    : .responseConfig.responseTeams
};
{
    this.responseTeams.set(team.teamId, team);
}
getDefaultConfig();
IncidentResponseConfig;
{
    return {
        responseTeams: [],
        escalationMatrix: [
            {
                severity: IncidentSeverity.CRITICAL,
                priority: IncidentPriority.P1,
                timeThreshold: 15, // 15 minutes
                escalateTo: ['ciso@example.com'],
                notificationChannels: ['email', 'sms'],
            },
        ],
        communicationPlan: {
            internalChannels: [],
            externalChannels: [],
            stakeholderMatrix: [],
            templates: [],
        },
        slaThresholds: {
            acknowledgmentTime: {
                [IncidentPriority.P1]: 15, // 15 minutes
                [IncidentPriority.P2]: 30, // 30 minutes
                [IncidentPriority.P3]: 60, // 1 hour
                [IncidentPriority.P4]: 120, // 2 hours
            },
            responseTime: {
                [IncidentPriority.P1]: 30, // 30 minutes
                [IncidentPriority.P2]: 120, // 2 hours
                [IncidentPriority.P3]: 480, // 8 hours
                [IncidentPriority.P4]: 1440, // 24 hours
            },
            resolutionTime: {
                [IncidentPriority.P1]: 4, // 4 hours
                [IncidentPriority.P2]: 24, // 24 hours
                [IncidentPriority.P3]: 72, // 3 days
                [IncidentPriority.P4]: 168, // 1 week
            },
        },
    };
}
/**
 * Public getter methods
 */
getIncident(incidentId, string);
SecurityIncident | undefined;
{
    return this.incidents.get(incidentId);
}
getAllIncidents();
SecurityIncident[];
{
    return Array.from(this.incidents.values())();
}
getIncidentsByStatus(status, IncidentStatus);
SecurityIncident[];
{
    return filter(Array.from(this.incidents.values()), (i) => i.status === status);
}
getIncidentsBySeverity(severity, IncidentSeverity);
SecurityIncident[];
{
    return filter(Array.from(this.incidents.values()), (i) => i.severity === severity);
}
getActiveIncidents();
SecurityIncident[];
{
    const activeStatuses = [
        IncidentStatus.DETECTED,
        IncidentStatus.ANALYZING,
        IncidentStatus.CONTAINED,
        IncidentStatus.ERADICATING,
        IncidentStatus.RECOVERING,
    ];
    return filter(Array.from(this.incidents.values()), (i) => activeStatuses.includes(i.status));
}
