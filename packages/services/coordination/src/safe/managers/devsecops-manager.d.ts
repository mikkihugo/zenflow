/**
 * @fileoverview DevSecOps Manager - SAFe Security Integration
 *
 * DevSecOps management for SAFe security integration throughout CI/CD pipeline.
 * Coordinates security scanning, compliance monitoring, and incident response.
 *
 * Delegates to:
 * - Security Scanning Service for vulnerability detection and assessment
 * - Compliance Monitoring Service for automated compliance tracking
 * - Security Incident Response Service for incident management and coordination
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */
/**
 * Incident Severity Levels
 */
export declare enum IncidentSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
/**
 * Incident Categories
 */
export declare enum IncidentCategory {
    VULNERABILITY = "vulnerability",
    DATA_BREACH = "data-breach",
    UNAUTHORIZED_ACCESS = "unauthorized-access",
    MALWARE = "malware",
    DENIAL_OF_SERVICE = "denial-of-service",
    INSIDER_THREAT = "insider-threat",
    COMPLIANCE_VIOLATION = "compliance-violation",
    OTHER = "other"
}
/**
 * Incident Status
 */
export declare enum IncidentStatus {
    REPORTED = "reported",
    ACKNOWLEDGED = "acknowledged",
    INVESTIGATING = "investigating",
    CONTAINED = "contained",
    RESOLVED = "resolved",
    CLOSED = "closed"
}
/**
 * DevSecOps Manager configuration
 */
export interface DevSecOpsManagerConfig {
    readonly enableSecurityGateEnforcement: boolean;
    readonly enableVulnerabilityScanning: boolean;
    readonly enableComplianceAutomation: boolean;
    readonly enableThreatModeling: boolean;
    readonly enableSecurityMetrics: boolean;
    readonly enableIncidentResponse: boolean;
    readonly enableSecurityTraining: boolean;
    readonly enablePenetrationTesting: boolean;
    readonly securityScanFrequency: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;;
    readonly complianceReportingInterval: number;
    readonly vulnerabilityAssessmentInterval: number;
    readonly securityTrainingInterval: number;
    readonly incidentResponseTime: number;
    readonly securityGateTimeout: number;
    readonly maxCriticalVulnerabilities: number;
    readonly maxHighVulnerabilities: number;
    readonly compliance: ComplianceConfig;
    readonly security: SecurityConfig;
}
/**
 * Compliance configuration
 */
export interface ComplianceConfig {
    readonly frameworks: ComplianceFramework[];
    readonly enableAutomatedScanning: boolean;
    readonly enableComplianceReporting: boolean;
    readonly enableAuditTrail: boolean;
    readonly reportingFormat: 'json|xml|pdf|html;;
    readonly auditRetentionDays: number;
    readonly complianceThreshold: number;
}
/**
 * Security configuration
 */
export interface SecurityConfig {
    readonly enableStaticAnalysis: boolean;
    readonly enableDynamicAnalysis: boolean;
    readonly enableDependencyScanning: boolean;
    readonly enableSecretsScanning: boolean;
    readonly enableContainerScanning: boolean;
    readonly enableInfrastructureScanning: boolean;
    readonly securityStandards: SecurityStandard[];
    readonly securityToolsIntegration: SecurityTool[];
}
/**
 * Compliance framework
 */
export interface ComplianceFramework {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly requirements: ComplianceRequirement[];
}
/**
 * Compliance requirement
 */
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
/**
 * Validation rule
 */
export interface ValidationRule {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly ruleType: 'automated' | 'manual' | 'hybrid';
}
/**
 * Evidence requirement
 */
export interface EvidenceRequirement {
    readonly id: string;
    readonly type: 'document|log|configuration|assessment;;
    readonly source: string;
    readonly description: string;
}
/**
 * Security standard
 */
export interface SecurityStandard {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly controls: SecurityControl[];
}
/**
 * Security control
 */
export interface SecurityControl {
    readonly controlId: string;
    readonly name: string;
    readonly description: string;
    readonly category: string;
    readonly implementation: 'manual' | 'automated' | 'hybrid';
}
/**
 * Security tool
 */
export interface SecurityTool {
    readonly id: string;
    readonly name: string;
    readonly type: SecurityToolType;
    readonly vendor: string;
    readonly version: string;
    readonly enabled: boolean;
    readonly configuration: Record<string, any>;
}
export type SecurityToolType = 'static_analysis|dynamic_analysis|dependency_scanner|secrets_scanner|container_scanner|infrastructure_scanner|vulnerability_scanner;;
/**
 * Security assessment
 */
export interface SecurityAssessment {
    readonly assessmentId: string;
    readonly timestamp: Date;
    readonly assessmentType: SecurityAssessmentType;
    readonly scope: AssessmentScope;
    readonly findings: SecurityFinding[];
    readonly summary: AssessmentSummary;
}
export type SecurityAssessmentType = '';
/**
 * Assessment scope
 */
export interface AssessmentScope {
    readonly targets: string[];
    readonly timeframe: {
        readonly start: Date;
        readonly end: Date;
    };
    readonly depth: 'surface' | 'standard' | 'deep';
}
/**
 * Security finding
 */
export interface SecurityFinding {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly severity: SecuritySeverity;
    readonly category: SecurityCategory;
    readonly cwe?: string;
    readonly cvssScore?: CVSSScore;
    readonly location: FindingLocation;
    readonly impact: SecurityImpact;
    readonly remediation: string;
    readonly references: string[];
    readonly toolId?: string;
    readonly discoveredDate: Date;
    readonly lastSeenDate: Date;
    readonly status: 'open|in_progress|resolved|false_positive;;
    readonly falsePositive: boolean;
}
export type SecuritySeverity = 'critical|high|medium|low|informational;;
export type SecurityCategory = 'injection|authentication|authorization|sensitive_data|xml_entities|access_control|security_config | cross_site_scripting' | insecure_deserialization | vulnerable_components | logging_monitoring;
/**
 * CVSS score
 */
export interface CVSSScore {
    readonly version: string;
    readonly baseScore: number;
    readonly temporalScore?: number;
    readonly environmentalScore?: number;
    readonly vector: string;
}
/**
 * Finding location
 */
export interface FindingLocation {
    readonly filePath: string;
    readonly lineNumber?: number;
    readonly columnNumber?: number;
    readonly snippet?: string;
}
/**
 * Security impact
 */
export interface SecurityImpact {
    readonly confidentiality: 'none|low|medium|high;;
    readonly integrity: 'none|low|medium|high;;
    readonly availability: 'none|low|medium|high;;
    readonly businessImpact: string;
}
/**
 * Assessment summary
 */
export interface AssessmentSummary {
    readonly totalFindings: number;
    readonly criticalFindings: number;
    readonly highFindings: number;
    readonly mediumFindings: number;
    readonly lowFindings: number;
    readonly riskScore: number;
}
/**
 * Compliance status
 */
export interface ComplianceStatus {
    readonly frameworkId: string;
    readonly frameworkName: string;
    readonly overallCompliance: number;
    readonly lastAssessment: Date;
    readonly nextAssessment: Date;
}
export type { IncidentPriority, SecurityIncident, } from '../services/devsecops/security-incident-response-service';
export declare class DevSecOpsManager extends EventBus {
    private logger;
    private securityScanningService;
    private complianceMonitoringService;
    private incidentResponseService;
    private initialized;
    constructor(config: DevSecOpsManagerConfig);
    /**
     * Initialize with service delegation - LAZY LOADING
     */
    initialize(): Promise<void>;
    /**
     * Perform security assessment - Delegates to Security Scanning Service
     */
    performSecurityAssessment(assessmentConfig: {
        assessmentType: SecurityAssessmentType;
        scope: AssessmentScope;
        tools?: SecurityTool[];
    }): Promise<SecurityAssessment>;
}
//# sourceMappingURL=devsecops-manager.d.ts.map