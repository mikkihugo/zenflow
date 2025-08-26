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

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '../config/logging-config';

/**
 * Incident Severity Levels
 */
export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Incident Categories
 */
export enum IncidentCategory {
  VULNERABILITY = 'vulnerability',
  DATA_BREACH = 'data-breach',
  UNAUTHORIZED_ACCESS = 'unauthorized-access',
  MALWARE = 'malware',
  DENIAL_OF_SERVICE = 'denial-of-service',
  INSIDER_THREAT = 'insider-threat',
  COMPLIANCE_VIOLATION = 'compliance-violation',
  OTHER = 'other',
}

/**
 * Incident Status
 */
export enum IncidentStatus {
  REPORTED = 'reported',
  ACKNOWLEDGED = 'acknowledged',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
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
  readonly securityScanFrequency: 'javascript' | 'typescript' | 'python' | 'java' | 'csharp' | 'cpp' | 'go' | 'ruby' | 'swift' | 'kotlin;
  readonly complianceReportingInterval: number; // milliseconds
  readonly vulnerabilityAssessmentInterval: number; // milliseconds
  readonly securityTrainingInterval: number; // milliseconds
  readonly incidentResponseTime: number; // minutes
  readonly securityGateTimeout: number; // minutes
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
  readonly reportingFormat: 'json|xml|pdf|html;
  readonly auditRetentionDays: number;
  readonly complianceThreshold: number; // percentage
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
  readonly priority: 'low|medium|high|critical;
  readonly assessmentFrequency?: number; // days
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
  readonly type: 'document|log|configuration|assessment;
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

export type SecurityToolType =|'static_analysis|dynamic_analysis|dependency_scanner|secrets_scanner|container_scanner|infrastructure_scanner|vulnerability_scanner;

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

export type SecurityAssessmentType =|''vulnerability_scan|penetration_test|code_review|compliance_audit;

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
  readonly status: 'open|in_progress|resolved|false_positive;
  readonly falsePositive: boolean;
}

export type SecuritySeverity =|'critical|high|medium|low|informational;

export type SecurityCategory =|'injection|authentication|authorization|sensitive_data|xml_entities|access_control|security_config | cross_site_scripting'|insecure_deserialization|vulnerable_components|logging_monitoring;

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
  readonly confidentiality: 'none|low|medium|high;
  readonly integrity: 'none|low|medium|high;
  readonly availability: 'none|low|medium|high;
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
  readonly overallCompliance: number; // percentage
  readonly lastAssessment: Date;
  readonly nextAssessment: Date;
}

// Re-export types from services for backward compatibility
export type {
  IncidentPriority,
  SecurityIncident,
} from '../services/devsecops/security-incident-response-service';

export class DevSecOpsManager extends TypedEventBase {
  private logger: Logger;
  private securityScanningService: any;
  private complianceMonitoringService: any;
  private incidentResponseService: any;
  private initialized = false;

  constructor(config: DevSecOpsManagerConfig) {
    super();
    this.config = config;
    this.logger = getLogger('DevSecOpsManager');'
  }

  /**
   * Initialize with service delegation - LAZY LOADING
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('Initializing DevSecOps Manager...');'

      // Delegate to Security Scanning Service
      const { SecurityScanningService } = await import(
        '../services/devsecops/security-scanning-service''
      );
      this.securityScanningService = new SecurityScanningService(this.logger);

      // Delegate to Compliance Monitoring Service
      const { ComplianceMonitoringService } = await import(
        '../services/devsecops/compliance-monitoring-service''
      );
      this.complianceMonitoringService = new ComplianceMonitoringService(
        this.logger
      );

      // Delegate to Security Incident Response Service
      const { SecurityIncidentResponseService } = await import(
        '../services/devsecops/security-incident-response-service''
      );
      this.incidentResponseService = new SecurityIncidentResponseService(
        this.logger
      );

      // Configure services based on manager config
      await this.configureServices();

      this.initialized = true;
      this.logger.info('DevSecOps Manager initialized successfully');'
    } catch (error) {
      this.logger.error('Failed to initialize DevSecOps Manager:', error);'
      throw error;
    }
  }

  /**
   * Perform security assessment - Delegates to Security Scanning Service
   */
  async performSecurityAssessment(assessmentConfig: {
    assessmentType: SecurityAssessmentType;
    scope: AssessmentScope;
    tools?: SecurityTool[];
  }): Promise<SecurityAssessment> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Performing security assessment', {'
      type: assessmentConfig.assessmentType,
    });

    try {
      // Configure scan based on assessment type
      const scanConfig = {
        scanId: `scan-${Date.now()}`,`
        scanType: this.mapAssessmentToScanType(assessmentConfig.assessmentType),
        tools: assessmentConfig.tools||this.getDefaultTools(),
        targets: this.convertScopeToTargets(assessmentConfig.scope),
        standards: this.configuration.security.securityStandards,
        schedule: {
          frequency: this.configuration.securityScanFrequency,
          timeWindow:'0 2 * * *', // 2 AM daily'
          maxDuration: 120,
          parallelScans: 3,
        },
        reporting: {
          format: 'json' as const,
          destinations: ['console'],
          includeRawResults: true,
          aggregateResults: true,
        },
      };

      // Execute scan
      const scanResult = await this.securityScanningService.executeScan(
        scanConfig.scanId
      );

      // Convert to security assessment format
      const assessment: SecurityAssessment = {
        assessmentId: scanResult.scanId,
        timestamp: scanResult.timestamp,
        assessmentType: assessmentConfig.assessmentType,
        scope: assessmentConfig.scope,
        findings: scanResult.findings,
        summary: {
          totalFindings:
            scanResult.summary.criticalIssues +
            scanResult.summary.highIssues +
            scanResult.summary.mediumIssues +
            scanResult.summary.lowIssues +
            scanResult.summary.informationalIssues,
          criticalFindings: scanResult.summary.criticalIssues,
          highFindings: scanResult.summary.highIssues,
          mediumFindings: scanResult.summary.mediumIssues,
          lowFindings: scanResult.summary.lowIssues,
          riskScore: scanResult.summary.riskScore,
        },
      };

      this.emit('security-assessment-completed', {'
        assessmentId: assessment.assessmentId,
        type: assessmentConfig.assessmentType,
        totalFindings: assessment.summary.totalFindings,
        riskScore: assessment.summary.riskScore,
      });

      return assessment;
    } catch (error) {
      this.logger.error('Security assessment failed:', error);'
      throw error;
    }
  }

  /**
   * Get compliance status - Delegates to Compliance Monitoring Service
   */
  async getComplianceStatus(frameworkId?: string): Promise<ComplianceStatus[]> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Getting compliance status', { frameworkId });'

    try {
      const statuses: ComplianceStatus[] = [];

      if (frameworkId) {
        const status =
          await this.complianceMonitoringService.getComplianceStatus(
            frameworkId
          );
        if (status) {
          statuses.push(status);
        }
      } else {
        // Get status for all configured frameworks
        for (const framework of this.configuration.compliance.frameworks) {
          const status =
            await this.complianceMonitoringService.getComplianceStatus(
              framework.id
            );
          if (status) {
            statuses.push(status);
          }
        }
      }

      return statuses;
    } catch (error) {
      this.logger.error('Failed to get compliance status:', error);'
      throw error;
    }
  }

  /**
   * Create security incident - Delegates to Security Incident Response Service
   */
  async createSecurityIncident(incidentData: {
    title: string;
    description: string;
    severity: IncidentSeverity;
    category: IncidentCategory;
    reportedBy: string;
    initialEvidence?: any[];
  }): Promise<any> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Creating security incident', {'
      title: incidentData.title,
      severity: incidentData.severity,
      category: incidentData.category,
    });

    try {
      const incident =
        await this.incidentResponseService.createIncident(incidentData);

      this.emit('security-incident-created', {'
        incidentId: incident.incidentId,
        severity: incident.severity,
        category: incident.category,
        priority: incident.priority,
      });

      return incident;
    } catch (error) {
      this.logger.error('Failed to create security incident:', error);'
      throw error;
    }
  }

  /**
   * Update incident status - Delegates to Security Incident Response Service
   */
  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    updatedBy: string,
    notes?: string
  ): Promise<any> {
    if (!this.initialized) await this.initialize();

    try {
      const incident = await this.incidentResponseService.updateIncidentStatus(
        incidentId,
        status,
        updatedBy,
        notes
      );

      this.emit('security-incident-updated', {'
        incidentId,
        status,
        updatedBy,
      });

      return incident;
    } catch (error) {
      this.logger.error('Failed to update incident status:', error);'
      throw error;
    }
  }

  /**
   * Generate compliance report - Delegates to Compliance Monitoring Service
   */
  async generateComplianceReport(
    reportType: 'summary|detailed|executive|audit',
    frameworkIds: string[],
    period: {
      startDate: Date;
      endDate: Date;
      description: string;
    }
  ): Promise<any> {
    if (!this.initialized) await this.initialize();

    this.logger.info('Generating compliance report', {'
      reportType,
      frameworks: frameworkIds.length,
    });

    try {
      const report =
        await this.complianceMonitoringService.generateComplianceReport(
          reportType,
          frameworkIds,
          period
        );

      this.emit('compliance-report-generated', {'
        reportId: report.reportId,
        reportType,
        overallCompliance: report.overallCompliance,
      });

      return report;
    } catch (error) {
      this.logger.error('Failed to generate compliance report:', error);'
      throw error;
    }
  }

  /**
   * Configure services based on manager configuration
   */
  private async configureServices(): Promise<void> {
    // Configure security scanning if enabled
    if (
      this.configuration.enableVulnerabilityScanning &&
      this.securityScanningService
    ) {
      // Configuration would be passed to service
      this.logger.info('Security scanning configured');'
    }

    // Configure compliance monitoring if enabled
    if (
      this.configuration.enableComplianceAutomation &&
      this.complianceMonitoringService
    ) {
      const complianceConfig = {
        monitoringId: 'main-compliance',
        frameworks: this.configuration.compliance.frameworks,
        automatedScanning:
          this.configuration.compliance.enableAutomatedScanning,
        reportingEnabled:
          this.configuration.compliance.enableComplianceReporting,
        auditTrailEnabled: this.configuration.compliance.enableAuditTrail,
        reportingSchedule: {
          frequency: 'monthly' as const,
          format: this.configuration.compliance.reportingFormat,
          recipients: ['compliance@example.com'],
          customReports: [],
        },
        thresholds: {
          minimumCompliance: this.configuration.compliance.complianceThreshold,
          warningThreshold:
            this.configuration.compliance.complianceThreshold - 10,
          criticalThreshold:
            this.configuration.compliance.complianceThreshold - 20,
          maxNonCompliantDays: 30,
          escalationRules: [],
        },
      };

      await this.complianceMonitoringService.configureMonitoring(
        complianceConfig
      );
    }

    // Configure incident response if enabled
    if (
      this.configuration.enableIncidentResponse &&
      this.incidentResponseService
    ) {
      this.logger.info('Incident response configured');'
    }
  }

  /**
   * Helper methods
   */
  private mapAssessmentToScanType(
    assessmentType: SecurityAssessmentType
  ): string {
    switch (assessmentType) {
      case 'vulnerability_scan':'
        return 'static;
      case 'penetration_test':'
        return 'dynamic;
      case 'code_review':'
        return 'static;
      case 'compliance_audit':'
        return 'infrastructure;
      default:
        return 'static;
    }
  }

  private getDefaultTools(): SecurityTool[] {
    return this.configuration.security.securityToolsIntegration.filter(
      (tool) => tool.enabled
    );
  }

  private convertScopeToTargets(scope: AssessmentScope): any[] {
    return scope.targets.map((target) => ({
      type: 'code',
      path: target,
      inclusions: ['**/*'],
      exclusions: ['**/node_modules/**'],
      priority: 'medium',
    }));
  }

  /**
   * Get active security incidents
   */
  async getActiveIncidents(): Promise<any[]> {
    if (!this.initialized) await this.initialize();
    return this.incidentResponseService.getActiveIncidents();
  }

  /**
   * Get incident by ID
   */
  async getIncident(incidentId: string): Promise<any> {
    if (!this.initialized) await this.initialize();
    return this.incidentResponseService.getIncident(incidentId);
  }

  /**
   * Get scan results
   */
  async getScanResults(): Promise<any[]> {
    if (!this.initialized) await this.initialize();
    return this.securityScanningService.getAllScanResults();
  }

  /**
   * Get compliance violations
   */
  async getComplianceViolations(frameworkId?: string): Promise<any[]> {
    if (!this.initialized) await this.initialize();
    return this.complianceMonitoringService.getViolations(frameworkId);
  }

  /**
   * Shutdown DevSecOps Manager
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down DevSecOps Manager...');'

    // Cleanup services in production
    try {
      await Promise.all([
        this.securityScanningService?.shutdown?.(),
        this.complianceMonitoringService?.shutdown?.(),
        this.incidentResponseService?.shutdown?.(),
      ]);
    } catch (error) {
      this.logger.warn('Some services failed to shutdown cleanly:', error);'
    }

    this.initialized = false;
    this.logger.info('DevSecOps Manager shutdown complete');'
  }
}

export default DevSecOpsManager;
