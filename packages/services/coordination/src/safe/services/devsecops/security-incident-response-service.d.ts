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
import type { Logger } from '../../types';
/**
 * Security incident classification
 */
export interface SecurityIncident {
    readonly incidentId: string;
    readonly title: string;
    readonly description: string;
    readonly severity: IncidentSeverity;
    readonly category: IncidentCategory;
    readonly status: IncidentStatus;
    readonly priority: IncidentPriority;
    readonly detectedDate: Date;
    readonly reportedBy: string;
    readonly assignedTo?: string;
    readonly responseTeam: ResponseTeamMember[];
    readonly timeline: IncidentTimelineEntry[];
    readonly evidence: IncidentEvidence[];
    readonly impact: SecurityImpactAssessment;
    readonly containment: ContainmentActions;
    readonly resolution: IncidentResolution;
    readonly postIncidentReview?: PostIncidentReview;
}
/**
 * Incident severity levels
 */
export declare enum IncidentSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Incident categories
 */
export declare enum IncidentCategory {
    MALWARE = "malware",
    PHISHING = "phishing",
    DATA_BREACH = "data_breach",
    UNAUTHORIZED_ACCESS = "unauthorized_access",
    DOS_DDOS = "dos_ddos",
    INSIDER_THREAT = "insider_threat",
    VULNERABILITY_EXPLOIT = "vulnerability_exploit",
    COMPLIANCE_VIOLATION = "compliance_violation",
    OTHER = "other"
}
/**
 * Incident status tracking
 */
export declare enum IncidentStatus {
    DETECTED = "detected",
    ANALYZING = "analyzing",
    CONTAINED = "contained",
    ERADICATING = "eradicating",
    RECOVERING = "recovering",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
/**
 * Incident priority levels
 */
export declare enum IncidentPriority {
    P1 = "p1",// Critical - immediate response'
    P2 = "p2",// High - response within 2 hours'
    P3 = "p3",// Medium - response within 8 hours'
    P4 = "p4"
}
/**
 * Response team member
 */
export interface ResponseTeamMember {
    readonly memberId: string;
    readonly name: string;
    readonly role: ResponseRole;
    readonly contactInfo: ContactInfo;
    readonly expertise: string[];
    readonly availability: AvailabilityStatus;
    readonly assignedDate: Date;
}
/**
 * Response team roles
 */
export declare enum ResponseRole {
    INCIDENT_COMMANDER = "incident_commander",
    SECURITY_ANALYST = "security_analyst",
    FORENSICS_SPECIALIST = "forensics_specialist",
    COMMUNICATIONS_LEAD = "communications_lead",
    LEGAL_COUNSEL = "legal_counsel",
    IT_OPERATIONS = "it_operations",
    BUSINESS_LIAISON = "business_liaison"
}
/**
 * Contact information
 */
export interface ContactInfo {
    readonly email: string;
    readonly phone: string;
    readonly emergencyPhone?: string;
    readonly slackId?: string;
}
/**
 * Availability status
 */
export declare enum AvailabilityStatus {
    AVAILABLE = "available",
    BUSY = "busy",
    ON_CALL = "on_call",
    UNAVAILABLE = "unavailable"
}
/**
 * Incident timeline entry
 */
export interface IncidentTimelineEntry {
    readonly entryId: string;
    readonly timestamp: Date;
    readonly action: string;
    readonly description: string;
    readonly performer: string;
    readonly category: detection | analysis | containment | eradication | recovery | 'communication;;
    readonly evidence?: string;
}
/**
 * Incident evidence
 */
export interface IncidentEvidence {
    readonly evidenceId: string;
    readonly type: EvidenceType;
    readonly source: string;
    readonly description: string;
    readonly collectedDate: Date;
    readonly collectedBy: string;
    readonly chainOfCustody: ChainOfCustodyEntry[];
    readonly metadata: Record<string, any>;
    readonly hash?: string;
}
/**
 * Evidence types
 */
export declare enum EvidenceType {
    LOG_FILE = "log_file",
    NETWORK_CAPTURE = "network_capture",
    DISK_IMAGE = "disk_image",
    MEMORY_DUMP = "memory_dump",
    FILE_SAMPLE = "file_sample",
    SCREENSHOT = "screenshot",
    WITNESS_STATEMENT = "witness_statement",
    OTHER = "other"
}
/**
 * Chain of custody entry
 */
export interface ChainOfCustodyEntry {
    readonly timestamp: Date;
    readonly action: 'collected|transferred|analyzed|stored;;
    readonly person: string;
    readonly location: string;
    readonly notes: string;
}
/**
 * Security impact assessment
 */
export interface SecurityImpactAssessment {
    readonly confidentialityImpact: ImpactLevel;
    readonly integrityImpact: ImpactLevel;
    readonly availabilityImpact: ImpactLevel;
    readonly businessImpact: BusinessImpactLevel;
    readonly affectedSystems: string[];
    readonly affectedUsers: number;
    readonly dataCompromised: boolean;
    readonly regulatoryImplications: string[];
    readonly estimatedCost: number;
}
/**
 * Impact levels
 */
export declare enum ImpactLevel {
    NONE = "none",
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
/**
 * Business impact levels
 */
export declare enum BusinessImpactLevel {
    MINIMAL = "minimal",
    MODERATE = "moderate",
    SIGNIFICANT = "significant",
    SEVERE = "severe"
}
/**
 * Containment actions
 */
export interface ContainmentActions {
    readonly strategy: ContainmentStrategy;
    readonly actions: ContainmentAction[];
    readonly completedDate?: Date;
    readonly effectiveness: number;
    readonly additionalMeasures?: string[];
}
/**
 * Containment strategy
 */
export declare enum ContainmentStrategy {
    ISOLATION = "isolation",
    SHUTDOWN = "shutdown",
    NETWORK_SEGMENTATION = "network_segmentation",
    ACCESS_REVOCATION = "access_revocation",
    PATCH_DEPLOYMENT = "patch_deployment",
    MONITORING_ENHANCEMENT = "monitoring_enhancement"
}
/**
 * Containment action
 */
export interface ContainmentAction {
    readonly actionId: string;
    readonly description: string;
    readonly assignedTo: string;
    readonly status: ActionStatus;
    readonly startTime: Date;
    readonly endTime?: Date;
    readonly result?: string;
}
/**
 * Action status
 */
export declare enum ActionStatus {
    PLANNED = "planned",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
/**
 * Incident resolution
 */
export interface IncidentResolution {
    readonly rootCause: string;
    readonly resolutionDate: Date;
    readonly resolutionSummary: string;
    readonly preventiveMeasures: string[];
    readonly lessonsLearned: string[];
    readonly totalResponseTime: number;
    readonly cost: ResolutionCost;
}
/**
 * Resolution cost tracking
 */
export interface ResolutionCost {
    readonly responseCost: number;
    readonly systemDowntime: number;
    readonly lostRevenue: number;
    readonly recoveryComplexity: number;
    readonly totalCost: number;
}
/**
 * Post-incident review
 */
export interface PostIncidentReview {
    readonly reviewDate: Date;
    readonly participants: string[];
    readonly findings: ReviewFinding[];
    readonly improvements: ImprovementRecommendation[];
    readonly actionPlan: ActionPlanItem[];
}
/**
 * Review finding
 */
export interface ReviewFinding {
    readonly findingId: string;
    readonly category: 'process|technology|people|communication;;
    readonly description: string;
    readonly impact: ImpactLevel;
    readonly recommendation: string;
}
/**
 * Improvement recommendation
 */
export interface ImprovementRecommendation {
    readonly recommendationId: string;
    readonly title: string;
    readonly description: string;
    readonly priority: 'high' | 'medium' | 'low';
    readonly estimatedCost: number;
    readonly timeframe: string;
    readonly owner: string;
}
/**
 * Action plan item
 */
export interface ActionPlanItem {
    readonly itemId: string;
    readonly task: string;
    readonly owner: string;
    readonly dueDate: Date;
    readonly status: ActionStatus;
    readonly progress: number;
}
/**
 * Incident response configuration
 */
export interface IncidentResponseConfig {
    readonly responseTeams: ResponseTeam[];
    readonly escalationMatrix: EscalationRule[];
    readonly communicationPlan: CommunicationPlan;
    readonly slaThresholds: SLAThresholds;
}
/**
 * Response team configuration
 */
export interface ResponseTeam {
    readonly teamId: string;
    readonly teamName: string;
    readonly members: ResponseTeamMember[];
    readonly capabilities: string[];
    readonly availability: string;
}
/**
 * Escalation rule
 */
export interface EscalationRule {
    readonly severity: IncidentSeverity;
    readonly priority: IncidentPriority;
    readonly timeThreshold: number;
    readonly escalateTo: string[];
    readonly notificationChannels: string[];
}
/**
 * Communication plan
 */
export interface CommunicationPlan {
    readonly internalChannels: CommunicationChannel[];
    readonly externalChannels: CommunicationChannel[];
    readonly stakeholderMatrix: StakeholderMapping[];
    readonly templates: CommunicationTemplate[];
}
/**
 * Communication channel
 */
export interface CommunicationChannel {
    readonly channelId: string;
    readonly type: 'email|phone|slack|sms|dashboard;;
    readonly recipients: string[];
    readonly purpose: string;
    readonly urgency: 'immediate|high|normal|low;;
}
/**
 * Stakeholder mapping
 */
export interface StakeholderMapping {
    readonly severityLevel: IncidentSeverity;
    readonly stakeholders: string[];
    readonly notificationTiming: string;
    readonly informationLevel: 'detailed' | 'summary' | 'minimal';
}
/**
 * Communication template
 */
export interface CommunicationTemplate {
    readonly templateId: string;
    readonly name: string;
    readonly purpose: string;
    readonly subject: string;
    readonly body: string;
    readonly variables: string[];
}
/**
 * SLA thresholds
 */
export interface SLAThresholds {
    readonly acknowledgmentTime: Record<IncidentPriority, number>;
    readonly responseTime: Record<IncidentPriority, number>;
    readonly resolutionTime: Record<IncidentPriority, number>;
}
/**
 * Security Incident Response Service for managing security incidents
 */
export declare class SecurityIncidentResponseService {
    constructor(logger: Logger, config?: IncidentResponseConfig);
    /**
     * Create new security incident
     */
    createIncident(incidentData: {
        title: string;
        description: string;
        severity: IncidentSeverity;
        category: IncidentCategory;
        reportedBy: string;
        initialEvidence?: Partial<IncidentEvidence>[];
    }): SecurityIncident;
}
//# sourceMappingURL=security-incident-response-service.d.ts.map