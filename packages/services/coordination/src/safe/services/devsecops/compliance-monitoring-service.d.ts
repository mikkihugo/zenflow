/**
 * @fileoverview Compliance Monitoring Service
 *
 * Service for automated compliance monitoring and reporting.
 * Handles compliance framework integration, audit trail management, and compliance reporting.
 *
 * SINGLE RESPONSIBILITY: Compliance monitoring and automated reporting
 * FOCUSES ON: Compliance frameworks, audit trails, regulatory reporting
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
import type { Logger } from '../../types';
export interface ComplianceFramework {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly version: string;
    readonly validationRules: ValidationRule[];
    readonly evidenceRequirements: EvidenceRequirement[];
    readonly requirements: ComplianceRequirement[];
}
export interface ComplianceRequirement {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly priority: 'low|medium|high|critical;;
    readonly assessmentFrequency?: number;
    readonly validationRules: ValidationRule[];
    readonly evidenceRequirements: EvidenceRequirement[];
}
export interface ValidationRule {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly ruleType: 'automated' | 'manual' | 'hybrid';
    readonly severity: 'low|medium|high|critical;;
    readonly category: string;
}
export interface EvidenceRequirement {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly type: 'document|artifact|screenshot|log|report;;
    readonly required: boolean;
    readonly source: string;
}
/**
 * Compliance monitoring configuration
 */
export interface ComplianceMonitoringConfig {
    readonly monitoringId: string;
    readonly frameworks: ComplianceFramework[];
    readonly automatedScanning: boolean;
    readonly reportingEnabled: boolean;
    readonly auditTrailEnabled: boolean;
    readonly reportingSchedule: ReportingSchedule;
    readonly thresholds: ComplianceThresholds;
}
/**
 * Reporting schedule configuration
 */
export interface ReportingSchedule {
    readonly frequency: 'daily|weekly|monthly|quarterly|annual;;
    readonly format: 'json|xml|pdf|html|csv;;
    readonly recipients: string[];
    readonly customReports: CustomReport[];
}
/**
 * Custom compliance report configuration
 */
export interface CustomReport {
    readonly reportId: string;
    readonly name: string;
    readonly frameworks: string[];
    readonly requirements: string[];
    readonly schedule: string;
    readonly template: string;
}
/**
 * Compliance thresholds
 */
export interface ComplianceThresholds {
    readonly minimumCompliance: number;
    readonly warningThreshold: number;
    readonly criticalThreshold: number;
    readonly maxNonCompliantDays: number;
    readonly escalationRules: EscalationRule[];
}
/**
 * Escalation rule for compliance violations
 */
export interface EscalationRule {
    readonly severity: 'low|medium|high|critical;;
    readonly threshold: number;
    readonly timeframe: number;
    readonly recipients: string[];
    readonly actions: string[];
}
/**
 * Compliance status
 */
export interface ComplianceStatus {
    readonly frameworkId: string;
    readonly frameworkName: string;
    readonly overallCompliance: number;
    readonly requirementStatus: RequirementComplianceStatus[];
    readonly lastAssessment: Date;
    readonly nextAssessment: Date;
    readonly violations: ComplianceViolation[];
    readonly trends: ComplianceTrend[];
}
/**
 * Individual requirement compliance status
 */
export interface RequirementComplianceStatus {
    readonly requirementId: string;
    readonly requirementName: string;
    readonly compliant: boolean;
    readonly complianceScore: number;
    readonly evidence: Evidence[];
    readonly violations: ComplianceViolation[];
    readonly lastChecked: Date;
    readonly nextCheck: Date;
}
/**
 * Compliance evidence
 */
export interface Evidence {
    readonly evidenceId: string;
    readonly type: document | automated_scan | manual_assessment | 'audit_log;;
    readonly source: string;
    readonly description: string;
    readonly timestamp: Date;
    readonly validity: 'valid' | 'expired' | 'pending_review';
    readonly metadata: Record<string, any>;
}
/**
 * Compliance violation
 */
export interface ComplianceViolation {
    readonly violationId: string;
    readonly frameworkId: string;
    readonly requirementId: string;
    readonly severity: 'low|medium|high|critical;;
    readonly description: string;
    readonly detectedDate: Date;
    readonly status: open | acknowledged | in_remediation | resolved | 'false_positive;;
    readonly assignedTo?: string;
    readonly dueDate?: Date;
    readonly remediationPlan?: string;
    readonly evidence: Evidence[];
}
/**
 * Compliance trend analysis
 */
export interface ComplianceTrend {
    readonly period: string;
    readonly complianceScore: number;
    readonly violationCount: number;
    readonly trend: 'improving' | 'stable' | 'declining' | 'improving' | 'stable' | 'declining' | declining;
    readonly factors: string[];
}
/**
 * Compliance report
 */
export interface ComplianceReport {
    readonly reportId: string;
    readonly reportType: 'summary|detailed|executive|audit;;
    readonly generatedDate: Date;
    readonly period: ReportPeriod;
    readonly frameworks: ComplianceFrameworkReport[];
    readonly overallCompliance: number;
    readonly executiveSummary: string;
    readonly recommendations: string[];
    readonly attachments: ReportAttachment[];
}
/**
 * Report period
 */
export interface ReportPeriod {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly description: string;
}
/**
 * Framework-specific report data
 */
export interface ComplianceFrameworkReport {
    readonly frameworkId: string;
    readonly frameworkName: string;
    readonly compliance: number;
    readonly requirementsSummary: RequirementSummary;
    readonly keyFindings: string[];
    readonly actionItems: string[];
}
/**
 * Requirements summary
 */
export interface RequirementSummary {
    readonly total: number;
    readonly compliant: number;
    readonly nonCompliant: number;
    readonly partiallyCompliant: number;
    readonly notAssessed: number;
}
/**
 * Report attachment
 */
export interface ReportAttachment {
    readonly filename: string;
    readonly type: string;
    readonly size: number;
    readonly content: string;
}
/**
 * Compliance Monitoring Service for automated compliance tracking and reporting
 */
export declare class ComplianceMonitoringService {
    private readonly logger;
    private configurations;
    private complianceStatuses;
    constructor(logger: Logger);
    /**
     * Configure compliance monitoring
     */
    configureMonitoring(config: ComplianceMonitoringConfig): void;
    /**
     * Perform compliance assessment
     */
    performComplianceAssessment(frameworkId: string): ComplianceStatus;
    /**
     * Assess individual requirement compliance
     */
    private assessRequirement;
    /**
     * Execute validation rules
     */
    private executeValidationRules;
}
//# sourceMappingURL=compliance-monitoring-service.d.ts.map