/**
 * @fileoverview DevSecOps Manager - SAFe Security Integration
 *
 * DevSecOps management for SAFe security integration throughout CI/CD pipeline.
 * Coordinates security scanning, compliance monitoring, and incident response.
 *
 * Delegates to: 'low')  MEDIUM = 'medium')  HIGH = 'high')  CRITICAL = 'critical')};;
/**
 * Incident Categories
 */
export declare enum IncidentCategory {
    ')  VULNERABILITY = ' = 0,
    vulnerability = 1,
    ')  DATA_BREACH = ' = 2,
    data = 3
}
/**
 * Incident Status
 */
export declare enum IncidentStatus {
    ')  REPORTED = ' = 0,
    reported = 1,
    ')  ACKNOWLEDGED = ' = 2,
    acknowledged = 3,
    ')  INVESTIGATING = ' = 4,
    investigating = 5,
    ')  CONTAINED = ' = 6,
    contained = 7,
    ')  RESOLVED = ' = 8,
    resolved = 9,
    ')  CLOSED = ' = 10,
    closed = 11,
    ')};; 
    /**
     * DevSecOps Manager configuration
     */
    = 12
    /**
     * DevSecOps Manager configuration
     */
    ,
    /**
     * DevSecOps Manager configuration
     */
    export = 13,
    interface = 14,
    DevSecOpsManagerConfig = 15
}
/**
 * Compliance configuration
 */
export interface ComplianceConfig {
    readonly frameworks: ComplianceFramework[];
    readonly enableAutomatedScanning: boolean;
    readonly enableComplianceReporting: boolean;
    readonly enableAuditTrail: boolean;
    readonly reportingFormat: 'json| xml| pdf' | ' html';
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
    readonly priority: low | medium | high;
}
/**
 * Validation rule
 */
export interface ValidationRule {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly ruleType: 'automated' | ' manual' | ' hybrid';
}
/**
 * Evidence requirement
 */
export interface EvidenceRequirement {
    readonly id: string;
    readonly type: 'document| log| configuration' | ' assessment';
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
    readonly implementation: 'manual' | ' automated' | ' hybrid';
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
export type SecurityToolType = 'static_analysis| dynamic_analysis| dependency_scanner| secrets_scanner| container_scanner| infrastructure_scanner' | ' vulnerability_scanner';
export interface SecurityAssessment {
    readonly assessmentId: string;
    readonly timestamp: Date;
    readonly assessmentType: SecurityAssessmentType;
    readonly scope: AssessmentScope;
    readonly findings: SecurityFinding[];
    readonly summary: AssessmentSummary;
}
export type SecurityAssessmentType = 'vulnerability_scan| penetration_test| code_review' | ' compliance_audit';
export interface AssessmentScope {
    readonly targets: string[];
    readonly timeframe: {
        readonly start: Date;
        readonly end: Date;
    };
    readonly depth: 'surface' | ' standard' | ' deep';
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
    readonly status: 'open| in_progress| resolved' | ' false_positive';
    readonly falsePositive: boolean;
}
export type SecuritySeverity = 'critical| high| medium| low' | ' informational';
export type SecurityCategory = 'injection| authentication| authorization| sensitive_data| xml_entities| access_control| security_config| cross_site_scripting' | insecure_deserialization | vulnerable_components;
export interface CVSSScore {
    readonly version: false;
    constructor(config: config, this: any, logger?: any): any;
}
export default DevSecOpsManager;
//# sourceMappingURL=devsecops-manager.d.ts.map