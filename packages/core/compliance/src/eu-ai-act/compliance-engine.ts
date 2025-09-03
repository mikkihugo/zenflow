import { getLogger } from '../utils/logger.js';
import {
  AIRiskCategory,
  HighRiskCategory,
  AISystemPurpose,
  RiskAssessment,
  RiskFactor,
  MitigationMeasure
} from './types.js';

const logger = getLogger('eu-ai-act-engine');

/**
 * EU AI Act Compliance Engine
 * Implements core compliance requirements for the EU AI Act
 */
export class EUAIActComplianceEngine {
  private riskAssessments: Map<string, RiskAssessment> = new Map();
  private systemPurposes: Map<string, AISystemPurpose> = new Map();
  // TODO: Implement human oversight and data governance storage
  // private humanOversight: Map<string, HumanOversight> = new Map();
  // private dataGovernance: Map<string, DataGovernance> = new Map();
  // private qualityManagement: QualityManagementSystem | null = null;

  /**
   * Register an AI system for compliance monitoring
   */
  async registerAISystem(
    systemId: string,
    purpose: AISystemPurpose
  ): Promise<void> {
    logger.info(`Registering AI system for EU AI Act compliance: ${systemId}`);
    
    this.systemPurposes.set(systemId, purpose);
    
    // Automatically perform initial risk assessment
    const riskAssessment = await this.performRiskAssessment(systemId, purpose);
    this.riskAssessments.set(systemId, riskAssessment);
    
    logger.info(`AI system registered with risk category: ${riskAssessment.category}`);
  }

  /**
   * Perform risk assessment for an AI system
   */
  async performRiskAssessment(
    systemId: string,
    purpose: AISystemPurpose
  ): Promise<RiskAssessment> {
    logger.info(`Performing risk assessment for system: ${systemId}`);

    const riskCategory = this.classifyRiskCategory(purpose);
    const highRiskCategory = this.determineHighRiskCategory(purpose);
    const riskFactors = this.identifyRiskFactors(purpose, riskCategory);
    const mitigationMeasures = this.recommendMitigationMeasures(riskFactors);

    const assessment: RiskAssessment = {
      id: `risk-assessment-${systemId}-${Date.now()}`,
      systemId,
      category: riskCategory,
      highRiskCategory: highRiskCategory || undefined,
      riskFactors,
      mitigationMeasures,
      assessmentDate: new Date(),
      nextReviewDate: this.calculateNextReviewDate(riskCategory),
      assessor: {
        name: 'EU AI Act Compliance Engine',
        role: 'Automated Assessment System',
        qualifications: ['EU AI Act Regulation Knowledge', 'Risk Assessment Methodology']
      },
      status: 'approved'
    };

    logger.info(`Risk assessment completed. Category: ${riskCategory}`);
    return assessment;
  }

  /**
   * Classify AI system risk category based on purpose and use cases
   */
  private classifyRiskCategory(purpose: AISystemPurpose): AIRiskCategory {
    const { primary, useCases, context } = purpose;

    // Check for prohibited practices (unacceptable risk)
    if (this.isProhibitedPractice(primary, useCases, context)) {
      return AIRiskCategory.UNACCEPTABLE;
    }

    // Check for high-risk categories
    if (this.isHighRiskSystem(primary, useCases, context)) {
      return AIRiskCategory.HIGH;
    }

    // Check for limited risk (transparency requirements)
    if (this.isLimitedRiskSystem(primary, useCases, context)) {
      return AIRiskCategory.LIMITED;
    }

    return AIRiskCategory.MINIMAL;
  }

  /**
   * Check if system involves prohibited AI practices
   */
  private isProhibitedPractice(
    primary: string,
    useCases: string[],
    context: string
  ): boolean {
    const prohibitedKeywords = [
      'subliminal manipulation',
      'cognitive vulnerability exploitation',
      'social scoring',
      'real-time remote biometric identification',
      'emotion recognition in workplace',
      'emotion recognition in education'
    ];

    const allText = `${primary} ${useCases.join(' ')} ${context}`.toLowerCase();
    return prohibitedKeywords.some(keyword => allText.includes(keyword));
  }

  /**
   * Check if system is high-risk under EU AI Act
   */
  private isHighRiskSystem(
    primary: string,
    useCases: string[],
    context: string
  ): boolean {
    // Multi-agent AI orchestration systems are typically high-risk
    // due to their autonomous decision-making capabilities
    const highRiskKeywords = [
      'autonomous decision',
      'agent coordination',
      'multi-agent system',
      'ai orchestration',
      'automated workflow',
      'critical infrastructure',
      'employment decision',
      'resource allocation',
      'task distribution'
    ];

    const allText = `${primary} ${useCases.join(' ')} ${context}`.toLowerCase();
    return highRiskKeywords.some(keyword => allText.includes(keyword));
  }

  /**
   * Check if system has limited risk requiring transparency
   */
  private isLimitedRiskSystem(
    primary: string,
    useCases: string[],
    context: string
  ): boolean {
    const limitedRiskKeywords = [
      'user interaction',
      'chatbot',
      'virtual assistant',
      'recommendation system',
      'content generation'
    ];

    const allText = `${primary} ${useCases.join(' ')} ${context}`.toLowerCase();
    return limitedRiskKeywords.some(keyword => allText.includes(keyword));
  }

  /**
   * Determine high-risk category if applicable
   */
  private determineHighRiskCategory(purpose: AISystemPurpose): HighRiskCategory | undefined {
    const { primary, useCases, context } = purpose;
    const allText = `${primary} ${useCases.join(' ')} ${context}`.toLowerCase();

    if (allText.includes('employment') || allText.includes('hr') || allText.includes('hiring')) {
      return HighRiskCategory.EMPLOYMENT;
    }

    if (allText.includes('infrastructure') || allText.includes('critical system')) {
      return HighRiskCategory.CRITICAL_INFRASTRUCTURE;
    }

    if (allText.includes('education') || allText.includes('training')) {
      return HighRiskCategory.EDUCATION;
    }

    // Default for multi-agent systems: employment-related due to task automation
    return HighRiskCategory.EMPLOYMENT;
  }

  /**
   * Identify risk factors for the AI system
   */
  private identifyRiskFactors(
    _purpose: AISystemPurpose, // Underscore prefix to indicate intentionally unused
    category: AIRiskCategory
  ): RiskFactor[] {
    const factors: RiskFactor[] = [];

    if (category === AIRiskCategory.HIGH) {
      factors.push({
        id: 'rf-001',
        description: 'Autonomous decision-making with limited human oversight',
        severity: 4,
        likelihood: 3,
        riskScore: 12,
        affectedStakeholders: ['users', 'organizations', 'society'],
        potentialHarm: ['incorrect decisions', 'bias amplification', 'reduced human agency']
      });

      factors.push({
        id: 'rf-002',
        description: 'Complex multi-agent interactions difficult to predict',
        severity: 3,
        likelihood: 4,
        riskScore: 12,
        affectedStakeholders: ['users', 'system operators'],
        potentialHarm: ['unexpected system behavior', 'emergent properties', 'loss of control']
      });

      factors.push({
        id: 'rf-003',
        description: 'Potential for algorithmic bias in coordination decisions',
        severity: 4,
        likelihood: 3,
        riskScore: 12,
        affectedStakeholders: ['affected individuals', 'protected groups'],
        potentialHarm: ['discrimination', 'unfair treatment', 'social inequity']
      });
    }

    return factors;
  }

  /**
   * Recommend mitigation measures for identified risk factors
   */
  private recommendMitigationMeasures(riskFactors: RiskFactor[]): MitigationMeasure[] {
    const measures: MitigationMeasure[] = [];

    for (const factor of riskFactors) {
      if (factor.id === 'rf-001') {
        measures.push({
          id: 'mm-001',
          addressedRiskFactors: ['rf-001'],
          description: 'Implement human-in-the-loop oversight for critical decisions',
          status: 'planned',
          responsible: 'System Administrator',
          effectiveness: 4
        });
      }

      if (factor.id === 'rf-002') {
        measures.push({
          id: 'mm-002',
          addressedRiskFactors: ['rf-002'],
          description: 'Implement comprehensive system monitoring and alerting',
          status: 'planned',
          responsible: 'Operations Team',
          effectiveness: 3
        });
      }

      if (factor.id === 'rf-003') {
        measures.push({
          id: 'mm-003',
          addressedRiskFactors: ['rf-003'],
          description: 'Implement bias detection and monitoring framework',
          status: 'planned',
          responsible: 'AI Ethics Team',
          effectiveness: 4
        });
      }
    }

    return measures;
  }

  /**
   * Calculate next review date based on risk category
   */
  private calculateNextReviewDate(category: AIRiskCategory): Date {
    const now = new Date();
    switch (category) {
      case AIRiskCategory.UNACCEPTABLE:
        // Immediate review required
        return now;
      case AIRiskCategory.HIGH:
        // Quarterly review
        return new Date(now.setMonth(now.getMonth() + 3));
      case AIRiskCategory.LIMITED:
        // Semi-annual review
        return new Date(now.setMonth(now.getMonth() + 6));
      case AIRiskCategory.MINIMAL:
        // Annual review
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return new Date(now.setFullYear(now.getFullYear() + 1));
    }
  }

  /**
   * Get compliance status for an AI system
   */
  async getComplianceStatus(systemId: string): Promise<{
    isCompliant: boolean;
    riskCategory: AIRiskCategory | null;
    requiredMeasures: string[];
    missingMeasures: string[];
    nextActions: string[];
  }> {
    const assessment = this.riskAssessments.get(systemId);
    
    if (!assessment) {
      return {
        isCompliant: false,
        riskCategory: null,
        requiredMeasures: [],
        missingMeasures: ['Risk assessment required'],
        nextActions: ['Perform initial risk assessment']
      };
    }

    const requiredMeasures = this.getRequiredMeasures(assessment.category);
    const implementedMeasures = assessment.mitigationMeasures
      .filter(m => m.status === 'implemented')
      .map(m => m.description);
    
    const missingMeasures = requiredMeasures.filter(
      required => !implementedMeasures.some(impl => impl.includes(required))
    );

    const isCompliant = missingMeasures.length === 0;
    const nextActions = this.getNextActions(assessment, missingMeasures);

    return {
      isCompliant,
      riskCategory: assessment.category,
      requiredMeasures,
      missingMeasures,
      nextActions
    };
  }

  /**
   * Get required measures for risk category
   */
  private getRequiredMeasures(category: AIRiskCategory): string[] {
    switch (category) {
      case AIRiskCategory.UNACCEPTABLE:
        return ['System prohibition', 'Immediate discontinuation'];
      case AIRiskCategory.HIGH:
        return [
          'Risk management system',
          'Data governance',
          'Technical documentation',
          'Record keeping',
          'Transparency provisions',
          'Human oversight',
          'Accuracy and robustness',
          'Cybersecurity measures'
        ];
      case AIRiskCategory.LIMITED:
        return [
          'Transparency obligations',
          'User information',
          'Clear AI system disclosure'
        ];
      case AIRiskCategory.MINIMAL:
        return ['Voluntary compliance', 'Best practices'];
      default:
        return [];
    }
  }

  /**
   * Get next actions for compliance
   */
  private getNextActions(
    assessment: RiskAssessment,
    missingMeasures: string[]
  ): string[] {
    const actions: string[] = [];

    if (missingMeasures.length > 0) {
      actions.push(`Implement missing measures: ${missingMeasures.join(', ')}`);
    }

    const today = new Date();
    if (assessment.nextReviewDate <= today) {
      actions.push('Conduct scheduled risk assessment review');
    }

    const pendingMeasures = assessment.mitigationMeasures.filter(
      m => m.status === 'planned' || m.status === 'in_progress'
    );
    
    if (pendingMeasures.length > 0) {
      actions.push(`Complete pending mitigation measures: ${pendingMeasures.length} items`);
    }

    return actions;
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(systemId: string): Promise<{
    systemId: string;
    reportDate: Date;
    complianceStatus: any;
    riskAssessment: RiskAssessment | null;
    recommendations: string[];
  }> {
    const complianceStatus = await this.getComplianceStatus(systemId);
    const assessment = this.riskAssessments.get(systemId) || null;
    
    const recommendations = [
      'Ensure regular compliance monitoring',
      'Keep documentation up to date',
      'Train personnel on EU AI Act requirements',
      'Implement continuous improvement processes'
    ];

    if (!complianceStatus.isCompliant) {
      recommendations.unshift(
        'Address missing compliance measures immediately',
        'Conduct thorough risk mitigation review'
      );
    }

    return {
      systemId,
      reportDate: new Date(),
      complianceStatus,
      riskAssessment: assessment,
      recommendations
    };
  }
}