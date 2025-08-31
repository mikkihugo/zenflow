/**
 * @fileoverview DevSecOps Manager - SAFe Security Integration
 *
 * DevSecOps management for SAFe security integration throughout CI/CD pipeline.
 * Coordinates security scanning, compliance monitoring, and incident response.
 *
 * Delegates to: 'low')medium')high')critical'))  VULNERABILITY = ' = 0,
    vulnerability = 1,
    ') = 2,
    data = 3
}
/**
 * Incident Status
 */
export declare enum IncidentStatus {
    ') = 0,
    reported = 1,
    ') = 2,
    acknowledged = 3,
    ') = 4,
    investigating = 5,
    ') = 6,
    contained = 7,
    ') = 8,
    resolved = 9,
    ') = 10,
    closed = 11,
    ')json| xml| pdf' | ' html';
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
  id: string;
}
/**
 * Compliance requirement
 */
export interface ComplianceRequirement {
  id: string;
}
/**
 * Validation rule
 */
export interface ValidationRule {
  id: string;
}
/**
 * Evidence requirement
 */
export interface EvidenceRequirement {
  id: string;
}
/**
 * Security standard
 */
export interface SecurityStandard {
  id: string;
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
  id: string;
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
    readonly timeframe:  {
        readonly start: Date;
        readonly end: Date;
    };
    readonly depth: 'surface' | ' standard' | ' deep';
}
/**
 * Security finding
 */
export interface SecurityFinding {
  id: string;
}
export type SecuritySeverity = 'critical| high| medium| low' | ' informational';
export type SecurityCategory = 'injection| authentication| authorization| sensitive_data| xml_entities| access_control| security_config| cross_site_scripting' | insecure_deserialization | vulnerable_components;
export interface CVSSScore {
    readonly version: false;
    constructor(config: config, this: any, logger?: any): any;
}
export default DevSecOpsManager;
//# sourceMappingURL=devsecops-manager.d.ts.map