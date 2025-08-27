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
import { getLogger } from '../config/logging-config';
/**
 * Incident Severity Levels
 */
export var IncidentSeverity;
(function (IncidentSeverity) {
    IncidentSeverity["LOW"] = "low";
    IncidentSeverity["MEDIUM"] = "medium";
    IncidentSeverity["HIGH"] = "high";
    IncidentSeverity["CRITICAL"] = "critical";
})(IncidentSeverity || (IncidentSeverity = {}));
/**
 * Incident Categories
 */
export var IncidentCategory;
(function (IncidentCategory) {
    IncidentCategory["VULNERABILITY"] = "vulnerability";
    IncidentCategory["DATA_BREACH"] = "data-breach";
    IncidentCategory["UNAUTHORIZED_ACCESS"] = "unauthorized-access";
    IncidentCategory["MALWARE"] = "malware";
    IncidentCategory["DENIAL_OF_SERVICE"] = "denial-of-service";
    IncidentCategory["INSIDER_THREAT"] = "insider-threat";
    IncidentCategory["COMPLIANCE_VIOLATION"] = "compliance-violation";
    IncidentCategory["OTHER"] = "other";
})(IncidentCategory || (IncidentCategory = {}));
/**
 * Incident Status
 */
export var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["REPORTED"] = "reported";
    IncidentStatus["ACKNOWLEDGED"] = "acknowledged";
    IncidentStatus["INVESTIGATING"] = "investigating";
    IncidentStatus["CONTAINED"] = "contained";
    IncidentStatus["RESOLVED"] = "resolved";
    IncidentStatus["CLOSED"] = "closed";
})(IncidentStatus || (IncidentStatus = {}));
vulnerability_scan | penetration_test | code_review | compliance_audit;
export class DevSecOpsManager extends EventBus {
    logger;
    securityScanningService;
    complianceMonitoringService;
    incidentResponseService;
    initialized = false;
    constructor(config) {
        super();
        this.config = config;
        this.logger = getLogger('DevSecOpsManager');
        ';
    }
    /**
     * Initialize with service delegation - LAZY LOADING
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            this.logger.info('Initializing DevSecOps Manager...');
            ';
            // Delegate to Security Scanning Service
            const { SecurityScanningService } = await import('../services/devsecops/security-scanning-service', ');
            this.securityScanningService = new SecurityScanningService(this.logger);
            // Delegate to Compliance Monitoring Service
            const { ComplianceMonitoringService } = await import('../services/devsecops/compliance-monitoring-service', ');
            this.complianceMonitoringService = new ComplianceMonitoringService(this.logger);
            // Delegate to Security Incident Response Service
            const { SecurityIncidentResponseService } = await import('../services/devsecops/security-incident-response-service', ');
            this.incidentResponseService = new SecurityIncidentResponseService(this.logger);
            // Configure services based on manager config
            await this.configureServices();
            this.initialized = true;
            this.logger.info('DevSecOps Manager initialized successfully');
            ';
        }
        catch (error) {
            this.logger.error('Failed to initialize DevSecOps Manager:', error);
            ';
            throw error;
        }
    }
    /**
     * Perform security assessment - Delegates to Security Scanning Service
     */
    async performSecurityAssessment(assessmentConfig) {
        if (!this.initialized)
            await this.initialize();
        this.logger.info('Performing security assessment', { ': type, assessmentConfig, : .assessmentType,
        });
        try {
            // Configure scan based on assessment type
            const scanConfig = {
                scanId: `scan-${Date.now()}`,
            } `
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
            ;
        }
        finally { }
    }
}
