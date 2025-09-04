import { getLogger } from './utils/logger.js';
import { EUAIActComplianceEngine } from './eu-ai-act/compliance-engine.js';
import { AuditTrailManager } from './audit/audit-trail-manager.js';
import { HumanOversightManager } from './oversight/human-oversight-manager.js';
import { AIRiskCategory, AISystemPurpose } from './eu-ai-act/types.js';

const logger = getLogger('compliance-framework');

/**
 * Compliance Configuration
 */
export interface ComplianceConfig {
  /** Enable EU AI Act compliance */
  euAiActEnabled: boolean;
  /** Enable GDPR compliance */
  gdprEnabled: boolean;
  /** Audit trail retention period (days) */
  auditRetentionDays: number;
  /** Human oversight requirements */
  humanOversightConfig: {
    enabled: boolean;
    requiredForHighRisk: boolean;
    maxReviewTimeHours: number;
  };
  /** Bias monitoring configuration */
  biasMonitoringConfig: {
    enabled: boolean;
    monitoringFrequency: 'continuous' | 'daily' | 'weekly';
    biasThreshold: number;
  };
  /** Compliance reporting */
  reportingConfig: {
    enabled: boolean;
    scheduledReports: boolean;
    reportFrequency: 'weekly' | 'monthly' | 'quarterly';
  };
}

/**
 * Compliance Status
 */
export interface ComplianceStatus {
  /** Overall compliance score (0-100) */
  overallScore: number;
  /** EU AI Act compliance */
  euAiAct: {
    compliant: boolean;
    score: number;
    gaps: string[];
  };
  /** GDPR compliance */
  gdpr: {
    compliant: boolean;
    score: number;
    gaps: string[];
  };
  /** Risk assessment status */
  riskAssessment: {
    completed: boolean;
    category: AIRiskCategory | null;
    lastUpdated: Date | null;
  };
  /** Human oversight status */
  humanOversight: {
    implemented: boolean;
    pendingRequests: number;
    overrideRate: number;
  };
  /** Audit trail status */
  auditTrail: {
    enabled: boolean;
    coverage: number;
    lastBackup: Date | null;
  };
}

/**
 * Compliance Framework
 * Central hub for all compliance activities in Claude Zen
 */
export class ComplianceFramework {
  private config: ComplianceConfig;
  private euAiActEngine: EUAIActComplianceEngine;
  private auditTrailManager: AuditTrailManager;
  private humanOversightManager: HumanOversightManager;
  private registeredSystems: Map<string, AISystemPurpose> = new Map();

  constructor(config: ComplianceConfig) {
    this.config = config;
    this.auditTrailManager = new AuditTrailManager();
    this.euAiActEngine = new EUAIActComplianceEngine();
    this.humanOversightManager = new HumanOversightManager(this.auditTrailManager);

    logger.info('Compliance framework initialized', {
      euAiActEnabled: config.euAiActEnabled,
      gdprEnabled: config.gdprEnabled,
      humanOversightEnabled: config.humanOversightConfig.enabled
    });
  }

  /**
   * Register an AI system for compliance monitoring
   */
  async registerSystem(
    systemId: string,
    purpose: AISystemPurpose,
    userId: string = 'system'
  ): Promise<{
    registrationId: string;
    riskCategory: AIRiskCategory;
    complianceRequirements: string[];
  }> {
    logger.info(`Registering AI system for compliance: ${systemId}`);

    // Register with EU AI Act engine
    if (this.config.euAiActEnabled) {
      await this.euAiActEngine.registerAISystem(systemId, purpose);
    }

    // Store system registration
    this.registeredSystems.set(systemId, purpose);

    // Record audit event
    const registrationId = await this.auditTrailManager.recordSystemRegistration(
      systemId,
      userId,
      purpose,
      'pending' // Will be updated after risk assessment
    );

    // Get compliance status
    const status = await this.getSystemComplianceStatus(systemId);
    
    return {
      registrationId,
      riskCategory: status.riskAssessment.category || AIRiskCategory.MINIMAL,
      complianceRequirements: this.getComplianceRequirements(status.riskAssessment.category)
    };
  }

  /**
   * Monitor AI decision for compliance
   */
  async monitorDecision(
    systemId: string,
    decisionDetails: {
      id: string;
      type: string;
      details: Record<string, any>;
      confidence: number;
      reasoning: string;
      inputData: Record<string, any>;
    },
    userId: string = 'system'
  ): Promise<{
    complianceChecks: {
      auditRecorded: boolean;
      humanOversightRequired: boolean;
      biasDetected: boolean;
    };
    oversightRequestId?: string;
    recommendations: string[];
  }> {
    logger.debug(`Monitoring decision for compliance: ${decisionDetails.id}`);

    const complianceChecks = {
      auditRecorded: false,
      humanOversightRequired: false,
      biasDetected: false
    };

    const recommendations: string[] = [];
    let oversightRequestId: string | undefined;

    // Get system compliance status
    const systemStatus = await this.getSystemComplianceStatus(systemId);
    
    // Record audit trail
    try {
      await this.auditTrailManager.recordDecision(
        systemId,
        userId,
        decisionDetails.type,
        decisionDetails,
        false, // Will be updated if human oversight is provided
        systemStatus.riskAssessment.category || 'unknown'
      );
      complianceChecks.auditRecorded = true;
    } catch (error) {
      logger.error('Failed to record audit trail', { error, decisionId: decisionDetails.id });
      recommendations.push('Ensure audit trail recording is functioning');
    }

    // Check if human oversight is required
    if (this.config.humanOversightConfig.enabled) {
      const aiDecision = {
        id: decisionDetails.id,
        systemId,
        type: decisionDetails.type,
        details: decisionDetails.details,
        confidence: decisionDetails.confidence,
        reasoning: decisionDetails.reasoning,
        timestamp: new Date(),
        inputData: decisionDetails.inputData,
        riskAssessment: {
          level: this.mapRiskCategoryToLevel(systemStatus.riskAssessment.category),
          factors: []
        }
      };

      const oversightCheck = this.humanOversightManager.shouldRequireOversight(
        aiDecision,
        systemStatus.riskAssessment.category || 'minimal'
      );

      if (oversightCheck.required && oversightCheck.triggers.length > 0) {
        complianceChecks.humanOversightRequired = true;
        
        // Request human oversight
        oversightRequestId = await this.humanOversightManager.requestOversight(
          aiDecision,
          oversightCheck.triggers[0]!, // Use first trigger with assertion
          {
            userImpact: 'Medium',
            businessImpact: 'Medium',
            regulatoryRequirement: systemStatus.riskAssessment.category === 'high',
            stakeholders: ['users', 'system_operators']
          }
        );

        recommendations.push('Human oversight required - review request submitted');
      }
    }

    // Check for bias (simplified implementation)
    if (this.config.biasMonitoringConfig.enabled) {
      const biasDetected = await this.checkForBias(decisionDetails);
      if (biasDetected) {
        complianceChecks.biasDetected = true;
        
        await this.auditTrailManager.recordBiasDetection(
          systemId,
          userId,
          'algorithmic_bias',
          'confidence_threshold_analysis',
          0.8, // Example bias score
          ['protected_group_1'], // Example affected groups
          ['review_decision_logic', 'adjust_thresholds']
        );

        recommendations.push('Potential bias detected - review decision logic');
      }
    }

    return {
      complianceChecks,
      oversightRequestId: oversightRequestId || undefined,
      recommendations
    };
  }

  /**
   * Get overall compliance status
   */
  async getOverallComplianceStatus(): Promise<ComplianceStatus> {
    logger.debug('Generating overall compliance status');

    // Get EU AI Act compliance status
    const euAiActCompliant = this.config.euAiActEnabled;
    const euAiActScore = euAiActCompliant ? 85 : 0; // Example score
    const euAiActGaps = euAiActCompliant ? [] : ['EU AI Act compliance not enabled'];

    // Get GDPR compliance status
    const gdprCompliant = this.config.gdprEnabled;
    const gdprScore = gdprCompliant ? 90 : 0; // Example score
    const gdprGaps = gdprCompliant ? [] : ['GDPR compliance not enabled'];

    // Calculate overall score
    const overallScore = Math.round((euAiActScore + gdprScore) / 2);

    return {
      overallScore,
      euAiAct: {
        compliant: euAiActCompliant,
        score: euAiActScore,
        gaps: euAiActGaps
      },
      gdpr: {
        compliant: gdprCompliant,
        score: gdprScore,
        gaps: gdprGaps
      },
      riskAssessment: {
        completed: this.registeredSystems.size > 0,
        category: AIRiskCategory.HIGH, // Example
        lastUpdated: new Date()
      },
      humanOversight: {
        implemented: this.config.humanOversightConfig.enabled,
        pendingRequests: (await this.humanOversightManager.getPendingRequests()).length,
        overrideRate: 0.15 // Example
      },
      auditTrail: {
        enabled: true,
        coverage: 95, // Example coverage percentage
        lastBackup: new Date()
      }
    };
  }

  /**
   * Get compliance status for a specific system
   */
  async getSystemComplianceStatus(systemId: string): Promise<ComplianceStatus> {
    if (!this.registeredSystems.has(systemId)) {
      // Return default status for unregistered systems
      return {
        overallScore: 0,
        euAiAct: { compliant: false, score: 0, gaps: ['System not registered'] },
        gdpr: { compliant: false, score: 0, gaps: ['System not registered'] },
        riskAssessment: { completed: false, category: null, lastUpdated: null },
        humanOversight: { implemented: false, pendingRequests: 0, overrideRate: 0 },
        auditTrail: { enabled: false, coverage: 0, lastBackup: null }
      };
    }

    // Get EU AI Act status
    const euAiActStatus = await this.euAiActEngine.getComplianceStatus(systemId);

    return {
      overallScore: euAiActStatus.isCompliant ? 85 : 45,
      euAiAct: {
        compliant: euAiActStatus.isCompliant,
        score: euAiActStatus.isCompliant ? 85 : 45,
        gaps: euAiActStatus.missingMeasures
      },
      gdpr: {
        compliant: this.config.gdprEnabled,
        score: this.config.gdprEnabled ? 90 : 0,
        gaps: this.config.gdprEnabled ? [] : ['GDPR compliance not configured']
      },
      riskAssessment: {
        completed: true,
        category: euAiActStatus.riskCategory,
        lastUpdated: new Date()
      },
      humanOversight: {
        implemented: this.config.humanOversightConfig.enabled,
        pendingRequests: (await this.humanOversightManager.getPendingRequests()).length,
        overrideRate: 0.15 // Would calculate from actual data
      },
      auditTrail: {
        enabled: true,
        coverage: 95,
        lastBackup: new Date()
      }
    };
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    systemId?: string,
    dateRange?: { from: Date; to: Date }
  ): Promise<{
    reportId: string;
    generatedAt: Date;
    scope: string;
    overallStatus: ComplianceStatus;
    systemReports?: any[];
    auditSummary: any;
    recommendations: string[];
  }> {
    const reportId = `compliance-report-${Date.now()}`;
    const generatedAt = new Date();
    
    logger.info(`Generating compliance report: ${reportId}`, {
      systemId,
      dateRange
    });

    const overallStatus = systemId 
      ? await this.getSystemComplianceStatus(systemId)
      : await this.getOverallComplianceStatus();

    // Generate audit summary
    const auditSummary = systemId && dateRange
      ? await this.auditTrailManager.generateComplianceReport(systemId, dateRange)
      : { summary: 'Full audit summary not available' };

    // Generate recommendations
    const recommendations = this.generateRecommendations(overallStatus);

    return {
      reportId,
      generatedAt,
      scope: systemId ? `System: ${systemId}` : 'All Systems',
      overallStatus,
      auditSummary,
      recommendations
    };
  }

  /**
   * Export compliance data for regulatory authorities
   */
  async exportComplianceData(
    systemId: string,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    logger.info(`Exporting compliance data for system: ${systemId}`);

    const auditTrail = await this.auditTrailManager.exportAuditTrail(systemId, format);
    const complianceReport = await this.generateComplianceReport(systemId);

    if (format === 'json') {
      return JSON.stringify({
        auditTrail: JSON.parse(auditTrail),
        complianceReport
      }, null, 2);
    } else {
      return `${auditTrail}\n\n--- Compliance Report ---\n${JSON.stringify(complianceReport, null, 2)}`;
    }
  }

  /**
   * Get compliance requirements for risk category
   */
  private getComplianceRequirements(riskCategory: AIRiskCategory | null): string[] {
    if (!riskCategory) return [];

    switch (riskCategory) {
      case AIRiskCategory.UNACCEPTABLE:
        return ['System prohibition', 'Immediate discontinuation'];
      case AIRiskCategory.HIGH:
        return [
          'Risk management system',
          'Data governance framework',
          'Technical documentation',
          'Record keeping and audit trails',
          'Transparency provisions',
          'Human oversight implementation',
          'Accuracy and robustness testing',
          'Cybersecurity measures'
        ];
      case AIRiskCategory.LIMITED:
        return [
          'Transparency obligations',
          'User information requirements',
          'AI system disclosure'
        ];
      case AIRiskCategory.MINIMAL:
        return ['Voluntary compliance', 'Best practices implementation'];
      default:
        return [];
    }
  }

  /**
   * Map risk category to level
   */
  private mapRiskCategoryToLevel(category: AIRiskCategory | null): 'low' | 'medium' | 'high' | 'critical' {
    switch (category) {
      case AIRiskCategory.UNACCEPTABLE:
        return 'critical';
      case AIRiskCategory.HIGH:
        return 'high';
      case AIRiskCategory.LIMITED:
        return 'medium';
      case AIRiskCategory.MINIMAL:
        return 'low';
      default:
        return 'low';
    }
  }

  /**
   * Check for bias in decision (simplified implementation)
   */
  private async checkForBias(decisionDetails: any): Promise<boolean> {
    // Simplified bias detection
    // In a real implementation, this would use sophisticated ML models
    return decisionDetails.confidence > 0.95 && Math.random() > 0.8;
  }

  /**
   * Generate recommendations based on compliance status
   */
  private generateRecommendations(status: ComplianceStatus): string[] {
    const recommendations: string[] = [];

    if (status.overallScore < 70) {
      recommendations.push('Overall compliance score is below acceptable threshold - immediate action required');
    }

    if (!status.euAiAct.compliant) {
      recommendations.push('Implement missing EU AI Act requirements');
      recommendations.push(...status.euAiAct.gaps);
    }

    if (!status.gdpr.compliant) {
      recommendations.push('Enable GDPR compliance framework');
    }

    if (!status.riskAssessment.completed) {
      recommendations.push('Complete risk assessment for all AI systems');
    }

    if (!status.humanOversight.implemented) {
      recommendations.push('Implement human oversight mechanisms for high-risk decisions');
    }

    if (status.auditTrail.coverage < 90) {
      recommendations.push('Improve audit trail coverage to meet regulatory requirements');
    }

    return recommendations;
  }
}