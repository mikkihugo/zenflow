/**
 * @fileoverview Business Case Service - Epic Investment Analysis
 *
 * Service for managing epic business cases, financial analysis, and investment decisions.
 * Handles business hypothesis validation, ROI calculation, and risk assessment.
 *
 * SINGLE RESPONSIBILITY: Business case development and financial analysis
 * FOCUSES ON: ROI calculation, risk assessment, business hypothesis validation
 *
 * @author Claude-Zen Team
 * @since 1.0.0
 * @version 1.0.0
 */

import { dateFns, } from '@claude-zen/foundation';

const { addMonths, addYears, differenceInMonths, format } = dateFns;

import {
  filter,
  meanBy,
  orderBy,
  sumBy,
} from 'lodash-es';
import type { Logger } from '../types';
import type {
  BusinessHypothesis,
  EpicBusinessCase,
  EpicRisk,
  FinancialViability,
  MarketAnalysis,
  RevenueProjection,
  ROICalculation,
} from '../types/epic-management';

/**
 * Business case service configuration
 */
export interface BusinessCaseConfig {
  readonly discountRate: number; // percentage for NPV calculation
  readonly analysisHorizon: number; // years
  readonly riskThreshold: number; // 0-100%
  readonly roiThreshold: number; // percentage
  readonly paybackPeriodLimit: number; // months
  readonly confidenceThreshold: number; // 0-100%
}

/**
 * Business case analysis result
 */
export interface BusinessCaseAnalysis {
  readonly businessCase: EpicBusinessCase;
  readonly financialViability: FinancialViability;
  readonly riskProfile: RiskProfile;
  readonly recommendation: BusinessRecommendation;
  readonly sensitivityAnalysis: SensitivityAnalysis;
  readonly competitivePosition: CompetitivePosition;
}

/**
 * Risk profile assessment
 */
export interface RiskProfile {
  readonly overallRiskLevel: 'low|medium|high|critical;
  readonly riskScore: number; // 0-100
  readonly criticalRisks: EpicRisk[];
  readonly mitigationCoverage: number; // 0-100%
  readonly residualRisk: number; // 0-100%
  readonly riskTrend: 'improving' | 'stable' | 'declining'|'improving' | 'stable' | 'declining'|worsening;
}

/**
 * Business recommendation
 */
export interface BusinessRecommendation {
  readonly recommendation: 'proceed|defer|pivot|stop;
  readonly confidence: number; // 0-100%
  readonly reasoning: string[];
  readonly conditions: string[];
  readonly alternativeOptions: string[];
  readonly nextSteps: string[];
}

/**
 * Sensitivity analysis
 */
export interface SensitivityAnalysis {
  readonly scenarios: BusinessScenario[];
  readonly keyDrivers: FinancialDriver[];
  readonly breakpoints: BreakpointAnalysis[];
  readonly recommendedActions: string[];
}

/**
 * Business scenario analysis
 */
export interface BusinessScenario {
  readonly scenario: 'optimistic' | 'realistic' | 'pessimistic';
  readonly probability: number; // 0-100%
  readonly roi: number;
  readonly npv: number;
  readonly paybackPeriod: number;
  readonly keyAssumptions: string[];
}

/**
 * Financial driver analysis
 */
export interface FinancialDriver {
  readonly driver: string;
  readonly impact: number; // -100 to +100
  readonly likelihood: number; // 0-100%
  readonly category: 'revenue|cost|timeline|market;
}

/**
 * Breakpoint analysis
 */
export interface BreakpointAnalysis {
  readonly variable: string;
  readonly breakpoint: number;
  readonly currentValue: number;
  readonly margin: number; // percentage difference
  readonly riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Competitive position analysis
 */
export interface CompetitivePosition {
  readonly marketPosition: number; // 1-10
  readonly competitiveAdvantage: string[];
  readonly competitiveDisadvantage: string[];
  readonly marketShare: number; // 0-100%
  readonly competitorResponse: CompetitorResponse[];
}

/**
 * Competitor response analysis
 */
export interface CompetitorResponse {
  readonly competitor: string;
  readonly likelyResponse: string;
  readonly impact: 'positive' | 'negative' | 'neutral';
  readonly timeframe: number; // months
  readonly mitigation: string[];
}

/**
 * Business Case Service for comprehensive business case development
 */
export class BusinessCaseService {
  private readonly logger: Logger;
  private businessCases = new Map<string, EpicBusinessCase>();

  constructor(config: BusinessCaseConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Create comprehensive business case
   */
  createBusinessCase(input: {
    epicId: string;
    businessHypothesis: Omit<
      BusinessHypothesis,
      'assumptionsList|validationPlan|riskMitigations''
    >;
    marketData: MarketAnalysis;
    financialInputs: {
      investmentRequired: number;
      developmentCost: number;
      operationalCost: number;
      revenueAssumptions: Omit<RevenueProjection, 'period'>[];'
    };
    risks: Omit<EpicRisk, 'id|identifiedAt|status'>[];'
    assumptions: string[];
  }): EpicBusinessCase {
    this.logger.info('Creating business case', { epicId: input.epicId });'

    // Generate business assumptions
    const businessAssumptions = this.generateBusinessAssumptions(
      input.assumptions
    );

    // Create validation plan
    const validationPlan = this.createValidationPlan(businessAssumptions);

    // Generate risk mitigations
    const riskMitigations = this.generateRiskMitigations(input.risks);

    // Build complete business hypothesis
    const businessHypothesis: BusinessHypothesis = {
      ...input.businessHypothesis,
      assumptionsList: businessAssumptions,
      validationPlan,
      riskMitigations,
    };

    // Create financial projections
    const financialProjection = this.createFinancialProjection(
      input.financialInputs
    );

    // Perform risk assessment
    const riskAssessment = this.performRiskAssessment(input.risks);

    // Generate implementation plan
    const implementationPlan = this.generateImplementationPlan(input.epicId);

    // Define success metrics
    const successMetrics = this.defineSuccessMetrics(financialProjection);

    // Analyze alternative solutions
    const alternativeSolutions = this.analyzeAlternativeSolutions(input.epicId);

    const businessCase: EpicBusinessCase = {
      id: `business-case-${nanoid(10)}`,`
      epicId: input.epicId,
      businessHypothesis,
      marketAnalysis: input.marketData,
      financialProjection,
      riskAssessment,
      implementationPlan,
      successMetrics,
      alternativeSolutions,
      financialViability: this.calculateFinancialViability(financialProjection),
      recommendedAction: 'proceed', // Will be determined by analysis'
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      approvalStatus: {
        status: 'draft',
        approver: '',
      },
    };

    this.businessCases.set(businessCase.id, businessCase);

    this.logger.info('Business case created', {'
      businessCaseId: businessCase.id,
      roi: financialProjection.internalRateReturn,
      riskLevel: riskAssessment.overallRiskLevel,
    });

    return businessCase;
  }

  /**
   * Perform comprehensive business case analysis
   */
  analyzeBusinessCase(businessCaseId: string): BusinessCaseAnalysis {
    const businessCase = this.businessCases.get(businessCaseId);
    if (!businessCase) {
      throw new Error(`Business case not found: ${businessCaseId}`);`
    }

    this.logger.info('Analyzing business case', { businessCaseId });'

    // Assess financial viability
    const financialViability = this.assessFinancialViability(
      businessCase.financialProjection
    );

    // Profile risks
    const riskProfile = this.profileRisks(businessCase.riskAssessment);

    // Generate recommendation
    const recommendation = this.generateBusinessRecommendation(
      financialViability,
      riskProfile,
      businessCase.marketAnalysis
    );

    // Perform sensitivity analysis
    const sensitivityAnalysis = this.performSensitivityAnalysis(
      businessCase.financialProjection
    );

    // Analyze competitive position
    const competitivePosition = this.analyzeCompetitivePosition(
      businessCase.marketAnalysis
    );

    const analysis: BusinessCaseAnalysis = {
      businessCase,
      financialViability,
      riskProfile,
      recommendation,
      sensitivityAnalysis,
      competitivePosition,
    };

    this.analysisResults.set(businessCaseId, analysis);

    this.logger.info('Business case analysis completed', {'
      businessCaseId,
      recommendation: recommendation.recommendation,
      confidence: recommendation.confidence,
    });

    return analysis;
  }

  /**
   * Update business case approval status
   */
  updateApprovalStatus(
    businessCaseId: string,
    approvalData: ApprovalStatus
  ): void {
    const businessCase = this.businessCases.get(businessCaseId);
    if (!businessCase) {
      throw new Error(`Business case not found: $businessCaseId`);`
    }

    const updatedBusinessCase = {
      ...businessCase,
      approvalStatus: approvalData,
      updatedAt: new Date(),
    };

    this.businessCases.set(businessCaseId, updatedBusinessCase);

    this.logger.info('Business case approval status updated', {'
      businessCaseId,
      status: approvalData.status,
      approver: approvalData.approver,
    });
  }

  /**
   * Compare multiple business cases
   */
  compareBusinessCases(businessCaseIds: string[]): {
    comparison: BusinessCaseComparison[];
    recommendation: string;
    reasoning: string[];
  } {
    const analyses = businessCaseIds.map((id) => this.analyzeBusinessCase(id));

    const comparison = analyses.map((analysis, index) => ({
      businessCaseId: businessCaseIds[index],
      roi: analysis.financialViability.roi,
      npv: analysis.financialViability.npv,
      paybackPeriod: analysis.financialViability.paybackPeriod,
      riskScore: analysis.riskProfile.riskScore,
      recommendation: analysis.recommendation.recommendation,
      overallScore: this.calculateOverallScore(analysis),
    }));

    const sortedComparison = orderBy(comparison, 'overallScore', 'desc');'
    const topChoice = sortedComparison[0];

    const _recommendation = `Recommend ${topChoice.businessCaseId} based on overall score`;`
    const reasoning = [
      `Highest ROI: $topChoice.roi%`,`
      `Best payback period: $topChoice.paybackPeriodmonths`,`
      `Risk level: ${analyses.find((a) => a.businessCase.id === topChoice.businessCaseId)?.riskProfile.overallRiskLevel}`,`
    ];

    return {
      comparison: sortedComparison,
      recommendation,
      reasoning,
    };
  }

  // Private helper methods

  /**
   * Generate business assumptions from input
   */
  private generateBusinessAssumptions(
    assumptions: string[]
  ): BusinessAssumption[] {
    return assumptions.map((assumption) => ({
      assumption,
      criticality: 'medium' as const,
      validationMethod: 'market_research',
      validationStatus: 'unvalidated' as const,
      impactIfIncorrect: 'Moderate impact on business case viability',
    }));
  }

  /**
   * Create validation plan for assumptions
   */
  private createValidationPlan(
    assumptions: BusinessAssumption[]
  ): ValidationStep[] {
    return assumptions.map((assumption) => ({
      step: `Validate: $assumption.assumption`,`
      method: assumption.validationMethod as any,
      timeline: 30, // 30 days
      owner: 'Epic Owner',
      successCriteria: [
        'Data collected',
        'Analysis completed',
        'Findings documented',
      ],
      resources: [
        'Market research team',
        'Customer interviews',
        'Data analysis tools',
      ],
    }));
  }

  /**
   * Generate risk mitigations
   */
  private generateRiskMitigations(
    risks: Omit<EpicRisk, 'id|identifiedAt|status'>[]'
  ): string[] {
    return risks.map(
      (risk) =>
        `Mitigate ${risk.category} risk: ${risk.description.substring(0, 50)}...``
    );
  }

  /**
   * Create comprehensive financial projection
   */
  private createFinancialProjection(financialInputs: any): FinancialProjection {
    // Generate 5-year revenue projections
    const revenueProjections: RevenueProjection[] = [];
    for (let year = 1; year <= 5; year++) {
      const baseRevenue =
        financialInputs.revenueAssumptions[0]?.revenue||1000000;
      revenueProjections.push({
        period: `Year ${year}`,`
        revenue: baseRevenue * Math.pow(1.2, year - 1), // 20% annual growth
        customerCount: 100 * year,
        averageRevenuePerCustomer: baseRevenue / (100 * year),
        assumptions: [`Year ${year} growth assumptions`],`
      });
    }

    // Generate cost projections
    const costProjections: CostProjection[] = [];
    for (let year = 1; year <= 5; year++) {
      const baseCost = financialInputs.operationalCost;
      costProjections.push({
        period: `Year ${year}`,`
        developmentCost: year === 1 ? financialInputs.developmentCost : 0,
        operationalCost: baseCost * year,
        marketingCost: baseCost * 0.3 * year,
        supportCost: baseCost * 0.2 * year,
        totalCost:
          (year === 1 ? financialInputs.developmentCost : 0) +
          baseCost * year +
          baseCost * 0.3 * year +
          baseCost * 0.2 * year,
      });
    }

    // Calculate ROI
    const totalRevenue = sumBy(revenueProjections,'revenue');'
    const totalCost = sumBy(costProjections, 'totalCost');'
    const totalInvestment = financialInputs.investmentRequired;

    const roiCalculation: ROICalculation = {
      totalInvestment,
      totalReturn: totalRevenue - totalCost,
      roi:
        ((totalRevenue - totalCost - totalInvestment) / totalInvestment) * 100,
      calculationMethod: '5-year DCF analysis',
      timeHorizon: 5,
      discountRate: this.config.discountRate,
    };

    // Calculate NPV and payback period
    const npv = this.calculateNPV(
      revenueProjections,
      costProjections,
      totalInvestment
    );
    const paybackPeriod = this.calculatePaybackPeriod(
      revenueProjections,
      costProjections,
      totalInvestment
    );

    return {
      investmentRequired: totalInvestment,
      developmentCost: financialInputs.developmentCost,
      operationalCost: financialInputs.operationalCost,
      revenueProjection: revenueProjections,
      costProjection: costProjections,
      roiCalculation,
      paybackPeriod,
      netPresentValue: npv,
      internalRateReturn: roiCalculation.roi,
    };
  }

  /**
   * Calculate Net Present Value
   */
  private calculateNPV(
    revenue: RevenueProjection[],
    costs: CostProjection[],
    initialInvestment: number
  ): number {
    let npv = -initialInvestment;

    for (let year = 0; year < Math.min(revenue.length, costs.length); year++) {
      const cashFlow = revenue[year].revenue - costs[year].totalCost;
      const discountedCashFlow =
        cashFlow / (1 + this.config.discountRate / 100) ** (year + 1);
      npv += discountedCashFlow;
    }

    return npv;
  }

  /**
   * Calculate payback period
   */
  private calculatePaybackPeriod(
    revenue: RevenueProjection[],
    costs: CostProjection[],
    initialInvestment: number
  ): number {
    let cumulativeCashFlow = -initialInvestment;

    for (let year = 0; year < Math.min(revenue.length, costs.length); year++) {
      const cashFlow = revenue[year].revenue - costs[year].totalCost;
      cumulativeCashFlow += cashFlow;

      if (cumulativeCashFlow >= 0) {
        return (year + 1) * 12; // Convert to months
      }
    }

    return 60; // Default to 5 years if not achieved
  }

  /**
   * Perform risk assessment
   */
  private performRiskAssessment(
    risks: Omit<EpicRisk, 'id|identifiedAt|status'>[]'
  ): RiskAssessment {
    const epicRisks: EpicRisk[] = risks.map((risk) => ({
      ...risk,
      id: `risk-${nanoid(8)}`,`
      identifiedAt: new Date(),
      status: 'identified',
      riskScore: risk.probability * risk.impact,
    }));

    const overallRiskScore = meanBy(epicRisks, 'riskScore');'
    const overallRiskLevel =
      overallRiskScore > 80
        ? 'critical''
        : overallRiskScore > 60
          ? 'high''
          : overallRiskScore > 30
            ? 'medium''
            : 'low;

    return {
      risks: epicRisks,
      overallRiskLevel,
      riskMitigationPlan: [],
      contingencyPlans: [],
      riskOwners: ['Epic Owner', 'Portfolio Manager'],
    };
  }

  /**
   * Generate implementation plan
   */
  private generateImplementationPlan(epicId: string): ImplementationPlan {
    return {
      phases: [
        {
          phase: 'Analysis & Planning',
          duration: 3,
          objectives: ['Complete analysis', 'Finalize plan'],
          deliverables: ['Business case', 'Implementation roadmap'],
          resources: ['Epic Owner', 'Solution Architect'],
          dependencies: [],
          successCriteria: ['Analysis complete', 'Plan approved'],
          riskFactors: ['Resource availability'],
        },
      ],
      timeline: 18, // months
      resourceRequirements: [],
      dependencies: [],
      milestones: [],
      qualityGates: [],
    };
  }

  /**
   * Define success metrics
   */
  private defineSuccessMetrics(
    financial: FinancialProjection
  ): SuccessMetric[] {
    return [
      {
        metric: 'Return on Investment',
        category: 'financial',
        target: financial.roiCalculation.roi,
        baseline: 0,
        unit: 'percentage',
        measurementFrequency: 'quarterly',
        owner: 'Epic Owner',
      },
      {
        metric: 'Revenue Growth',
        category: 'financial',
        target:
          financial.revenueProjection[financial.revenueProjection.length - 1]
            .revenue,
        baseline: 0,
        unit: 'dollars',
        measurementFrequency: 'monthly',
        owner: 'Product Manager',
      },
    ];
  }

  /**
   * Analyze alternative solutions
   */
  private analyzeAlternativeSolutions(epicId: string): AlternativeSolution[] {
    return [
      {
        solution: 'Build vs Buy Analysis',
        description: 'Evaluate building internally vs purchasing solution',
        cost: 500000,
        timeline: 12,
        benefits: ['Lower long-term cost', 'Custom fit'],
        risks: ['Development risk', 'Time to market'],
        recommendationScore: 75,
      },
    ];
  }

  /**
   * Assess financial viability
   */
  private assessFinancialViability(
    financial: FinancialProjection
  ): FinancialViability {
    const isViable =
      financial.roiCalculation.roi >= this.config.roiThreshold &&
      financial.paybackPeriod <= this.config.paybackPeriodLimit &&
      financial.netPresentValue > 0;

    return {
      isViable,
      netPresentValue: financial.netPresentValue,
      npv: financial.netPresentValue,
      returnOnInvestment: financial.roiCalculation.roi,
      roi: financial.roiCalculation.roi,
      paybackPeriod: financial.paybackPeriod,
      breakEvenPoint: financial.paybackPeriod,
      riskAdjustedReturn: financial.roiCalculation.roi * 0.85, // Apply risk adjustment
      confidenceLevel: 75,
      financialScore: isViable ? 85 : 45,
    };
  }

  /**
   * Profile risks comprehensively
   */
  private profileRisks(riskAssessment: RiskAssessment): RiskProfile {
    const criticalRisks = filter(riskAssessment.risks, (r) => r.riskScore > 80);
    const avgRiskScore = meanBy(riskAssessment.risks, 'riskScore');'

    return {
      overallRiskLevel: riskAssessment.overallRiskLevel,
      riskScore: avgRiskScore,
      criticalRisks,
      mitigationCoverage: 60,
      residualRisk: avgRiskScore * 0.4,
      riskTrend: 'stable',
    };
  }

  /**
   * Generate business recommendation
   */
  private generateBusinessRecommendation(
    financial: FinancialViability,
    risk: RiskProfile,
    market: MarketAnalysis
  ): BusinessRecommendation {
    let recommendation: BusinessRecommendation['recommendation'] = 'proceed';
    const reasoning: string[] = [];

    if (!financial.isViable) {
      recommendation = 'defer';
      reasoning.push('Financial projections do not meet viability criteria');'
    }

    if (risk.overallRiskLevel === 'critical') {'
      recommendation = 'stop';
      reasoning.push('Risk level too high for acceptable investment');'
    }

    if (financial.isViable && risk.overallRiskLevel !== 'critical') {'
      reasoning.push('Strong financial case with manageable risk');'
    }

    return {
      recommendation,
      confidence: financial.isViable ? 85 : 45,
      reasoning,
      conditions: recommendation === 'proceed' ? ['Monitor risk closely'] : [],
      alternativeOptions: [],
      nextSteps:
        recommendation === 'proceed''
          ? ['Begin implementation planning']'
          : ['Revise business case'],
    };
  }

  /**
   * Perform sensitivity analysis
   */
  private performSensitivityAnalysis(
    financial: FinancialProjection
  ): SensitivityAnalysis {
    // Generate scenarios
    const scenarios: BusinessScenario[] = [
      {
        scenario: 'optimistic',
        probability: 25,
        roi: financial.roiCalculation.roi * 1.3,
        npv: financial.netPresentValue * 1.3,
        paybackPeriod: financial.paybackPeriod * 0.8,
        keyAssumptions: ['Market grows faster than expected'],
      },
      {
        scenario: 'realistic',
        probability: 50,
        roi: financial.roiCalculation.roi,
        npv: financial.netPresentValue,
        paybackPeriod: financial.paybackPeriod,
        keyAssumptions: ['Base case assumptions hold'],
      },
      {
        scenario: 'pessimistic',
        probability: 25,
        roi: financial.roiCalculation.roi * 0.6,
        npv: financial.netPresentValue * 0.6,
        paybackPeriod: financial.paybackPeriod * 1.4,
        keyAssumptions: ['Market adoption slower than expected'],
      },
    ];

    return {
      scenarios,
      keyDrivers: [],
      breakpoints: [],
      recommendedActions: [
        'Monitor key assumptions',
        'Plan scenario responses',
      ],
    };
  }

  /**
   * Analyze competitive position
   */
  private analyzeCompetitivePosition(
    market: MarketAnalysis
  ): CompetitivePosition {
    return {
      marketPosition: 6,
      competitiveAdvantage: ['Unique value proposition'],
      competitiveDisadvantage: ['Late to market'],
      marketShare: 5,
      competitorResponse: [],
    };
  }

  /**
   * Calculate overall business case score
   */
  private calculateOverallScore(analysis: BusinessCaseAnalysis): number {
    const financialScore = Math.min(
      100,
      (analysis.financialViability.roi + 100) / 2
    );
    const riskScore = 100 - analysis.riskProfile.riskScore;
    const confidenceScore = analysis.recommendation.confidence;

    return financialScore * 0.4 + riskScore * 0.3 + confidenceScore * 0.3;
  }

  /**
   * Calculate financial viability based on financial projection
   */
  private calculateFinancialViability(
    projection: FinancialProjection
  ): FinancialViability {
    const isViable =
      projection.netPresentValue > 0 && projection.internalRateReturn > 15;
    const riskAdjustedReturn = projection.internalRateReturn * 0.85; // 15% risk discount
    const financialScore = Math.max(
      0,
      Math.min(
        100,
        (projection.netPresentValue / 1000000) * 20 +
          projection.internalRateReturn * 2
      )
    );

    return {
      isViable,
      roi: projection.internalRateReturn,
      npv: projection.netPresentValue,
      netPresentValue: projection.netPresentValue,
      returnOnInvestment: projection.internalRateReturn,
      paybackPeriod: 24, // Simplified - 24 months
      breakEvenPoint: 18, // Simplified - 18 months
      riskAdjustedReturn,
      confidenceLevel: 80, // 80% confidence
      financialScore,
    };
  }
}

/**
 * Business case comparison result
 */
interface BusinessCaseComparison {
  readonly businessCaseId: string;
  readonly roi: number;
  readonly npv: number;
  readonly paybackPeriod: number;
  readonly riskScore: number;
  readonly recommendation: string;
  readonly overallScore: number;
}
