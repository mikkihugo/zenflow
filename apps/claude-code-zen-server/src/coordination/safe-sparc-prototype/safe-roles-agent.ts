/**
 * @fileoverview SAFe Roles Agent - Proper SAFe role implementation with simple LLM decisions
 * 
 * Implements actual SAFe roles using @claude-zen/safe-framework:
 * - Lean Portfolio Manager (LPM) - Strategic investment decisions
 * - Release Train Engineer (RTE) - Program execution coordination
 * - Product Manager (PM) - Product vision and roadmap
 * - System Architect (SA) - Architecture and technical guidance
 * - Epic Owner (EO) - Epic development and analysis
 * 
 * Uses simple LLM calls for role-based decisions instead of complex neural networks.
 */

import { EventEmitter } from 'node:events';

import type { Logger } from '@claude-zen/foundation';
import { LLMProvider, getGlobalLLM } from '@claude-zen/foundation';
import { getLogger } from '../../config/logging-config';
import type { EpicProposal } from './micro-prototype-manager';

// SAFe role types
export type SafeRoleType = 'lean-portfolio-manager' | 'release-train-engineer' | 'product-manager' | 'system-architect' | 'epic-owner';

// SAFe role decision context
export interface SafeRoleDecisionContext {
  role: SafeRoleType;
  epic: EpicProposal;
  decisionType: string;
  context: Record<string, any>;
}

// SAFe role decision result
export interface SafeRoleDecisionResult {
  decision: 'approve' | 'reject' | 'defer' | 'more-information';
  confidence: number;
  reasoning: string;
  recommendations: string[];
  requiredActions: string[];
  humanOversightRequired: boolean;
  metadata: Record<string, any>;
}

// SAFe role configuration
export interface SafeRoleConfig {
  roleType: SafeRoleType;
  decisionThresholds: {
    approvalBudgetLimit: number;
    riskTolerance: 'low' | 'medium' | 'high';
    confidenceThreshold: number;
  };
  enableLLMDecisions: boolean;
  llmProvider: 'simple' | 'advanced';
}

/**
 * SAFe Roles Agent - Implements proper SAFe roles with simple LLM decisions
 */
export class SafeRolesAgent extends EventEmitter {
  private logger: Logger;
  private config: SafeRoleConfig;
  private initialized = false;
  private llmProvider: LLMProvider;
  
  // SAFe Framework managers (lazy loaded)
  private portfolioManager?: any;
  private releaseTrainManager?: any;
  private productManager?: any;
  private systemArchitectManager?: any;
  private epicOwnerManager?: any;

  constructor(config: SafeRoleConfig) {
    super();
    this.config = config;
    this.logger = getLogger(`SafeRolesAgent-${config.roleType}`);
    this.llmProvider = getGlobalLLM();
    this.llmProvider.setRole('analyst'); // Use analyst role for SAFe decision making
    this.logger.info(`SAFe ${config.roleType} role initialized with LLMProvider`);
  }

  /**
   * Initialize with actual @claude-zen/safe-framework managers
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info(`Initializing SAFe ${this.config.roleType} role with framework managers...`);

      // Load actual SAFe framework managers based on role type
      switch (this.config.roleType) {
        case 'lean-portfolio-manager':
          await this.initializeLeanPortfolioManager();
          break;
        case 'release-train-engineer':
          await this.initializeReleaseTrainEngineer();
          break;
        case 'product-manager':
          await this.initializeProductManager();
          break;
        case 'system-architect':
          await this.initializeSystemArchitect();
          break;
        case 'epic-owner':
          await this.initializeEpicOwner();
          break;
      }

      this.initialized = true;
      this.logger.info(`SAFe ${this.config.roleType} role initialized successfully with framework managers`);

      this.emit('role-initialized', {
        roleType: this.config.roleType,
        capabilities: this.getRoleCapabilities()
      });

    } catch (error) {
      this.logger.error(`Failed to initialize SAFe ${this.config.roleType} role:`, error);
      throw error;
    }
  }

  /**
   * Make a SAFe role-based decision using simple LLM calls
   */
  async makeRoleDecision(context: SafeRoleDecisionContext): Promise<SafeRoleDecisionResult> {
    if (!this.initialized) await this.initialize();

    this.logger.info(`Making ${context.role} decision for epic: ${context.epic.title}`);

    try {
      // Route to appropriate role-specific decision method
      switch (context.role) {
        case 'lean-portfolio-manager':
          return await this.makeLeanPortfolioManagerDecision(context);
        case 'release-train-engineer':
          return await this.makeReleaseTrainEngineerDecision(context);
        case 'product-manager':
          return await this.makeProductManagerDecision(context);
        case 'system-architect':
          return await this.makeSystemArchitectDecision(context);
        case 'epic-owner':
          return await this.makeEpicOwnerDecision(context);
        default:
          throw new Error(`Unknown SAFe role: ${context.role}`);
      }

    } catch (error) {
      this.logger.error(`SAFe ${context.role} decision failed:`, error);
      throw error;
    }
  }

  /**
   * Health check for the SAFe role agent
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.initialized) return false;

      // Check role-specific manager health
      switch (this.config.roleType) {
        case 'lean-portfolio-manager':
          return this.portfolioManager ? true : false;
        case 'release-train-engineer':
          return this.releaseTrainManager ? true : false;
        case 'product-manager':
          return this.productManager ? true : false;
        case 'system-architect':
          return this.systemArchitectManager ? true : false;
        case 'epic-owner':
          return this.epicOwnerManager ? true : false;
        default:
          return false;
      }

    } catch (error) {
      this.logger.error(`SAFe ${this.config.roleType} health check failed:`, error);
      return false;
    }
  }

  // ============================================================================
  // ROLE-SPECIFIC INITIALIZATION
  // ============================================================================

  private async initializeLeanPortfolioManager(): Promise<void> {
    // Use actual SAFe framework Portfolio Manager (placeholder - would need actual implementation)
    this.portfolioManager = {
      evaluateEpicInvestment: async (epic: EpicProposal) => {
        // Simple LLM-based portfolio decision
        return this.makeLLMPortfolioDecision(epic);
      },
      assessStrategicAlignment: async (epic: EpicProposal) => {
        return this.assessStrategicFit(epic);
      }
    };
  }

  private async initializeReleaseTrainEngineer(): Promise<void> {
    // Load actual ReleaseTrainEngineerManager from @claude-zen/safe-framework
    const { ReleaseTrainEngineerManager } = await import('@claude-zen/safe-framework');
    
    this.releaseTrainManager = new ReleaseTrainEngineerManager({
      artName: 'default-art',
      enablePIPlanning: true,
      enablePredictability: true,
      facilitationServices: {
        piPlanningEnabled: true,
        scrumOfScrumsEnabled: true,
        programPredictabilityEnabled: true
      }
    });

    await this.releaseTrainManager.initialize();
  }

  private async initializeProductManager(): Promise<void> {
    // Load actual ProductManagementManager from @claude-zen/safe-framework
    const { ProductManagementManager } = await import('@claude-zen/safe-framework');
    
    this.productManager = new ProductManagementManager({
      productName: 'default-product',
      visionEnabled: true,
      customerResearchEnabled: true,
      marketAnalysisEnabled: true
    });

    await this.productManager.initialize();
  }

  private async initializeSystemArchitect(): Promise<void> {
    // Load actual SystemSolutionArchitectureManager from @claude-zen/safe-framework
    const { SystemSolutionArchitectureManager } = await import('@claude-zen/safe-framework');
    
    this.systemArchitectManager = new SystemSolutionArchitectureManager({
      systemName: 'default-system',
      enableArchitectureRunway: true,
      enableGovernance: true
    });

    await this.systemArchitectManager.initialize();
  }

  private async initializeEpicOwner(): Promise<void> {
    // Load actual EpicOwnerManager from @claude-zen/safe-framework
    const { EpicOwnerManager } = await import('@claude-zen/safe-framework');
    
    this.epicOwnerManager = new EpicOwnerManager({
      enableBusinessCaseAnalysis: true,
      enableMarketResearch: true,
      enableBenefitHypothesis: true
    });

    await this.epicOwnerManager.initialize();
  }

  // ============================================================================
  // ROLE-SPECIFIC DECISION METHODS
  // ============================================================================

  private async makeLeanPortfolioManagerDecision(context: SafeRoleDecisionContext): Promise<SafeRoleDecisionResult> {
    const epic = context.epic;
    
    // Use LLMProvider for simple LLM-based portfolio decision
    const prompt = `As a Lean Portfolio Manager in SAFe, evaluate this epic for investment approval:

Epic: ${epic.title}
Business Case: ${epic.businessCase}
Estimated Value: $${epic.estimatedValue.toLocaleString()}
Estimated Cost: $${epic.estimatedCost.toLocaleString()}
Timeframe: ${epic.timeframe}
Risk Level: ${epic.riskLevel}

Budget Threshold: $${this.config.decisionThresholds.approvalBudgetLimit.toLocaleString()}
ROI Calculation: ${((epic.estimatedValue - epic.estimatedCost) / epic.estimatedCost * 100).toFixed(1)}%

Provide your decision as a JSON object with this exact structure:
{
  "decision": "approve|reject|defer|more-information",
  "confidence": 0.8,
  "reasoning": "brief explanation",
  "humanOversightRequired": true|false
}`;

    try {
      const response = await this.llmProvider.executeAsAnalyst(prompt, 'safe-portfolio-decision');
      const parsed = this.parseDecisionResponse(response);
      
      return {
        decision: parsed.decision || 'defer',
        confidence: parsed.confidence || 0.7,
        reasoning: parsed.reasoning || 'LLM decision analysis completed',
        recommendations: [
          'Consider market timing and competitive landscape',
          'Validate customer demand through MVP approach',
          'Ensure adequate funding runway for full delivery'
        ],
        requiredActions: parsed.decision === 'approve' ? [
          'Allocate budget from investment portfolio',
          'Assign Epic Owner for development',
          'Schedule PI Planning inclusion'
        ] : [],
        humanOversightRequired: parsed.humanOversightRequired || false,
        metadata: {
          roleType: 'lean-portfolio-manager',
          calculatedROI: (epic.estimatedValue - epic.estimatedCost) / epic.estimatedCost,
          budgetExceeded: epic.estimatedCost > this.config.decisionThresholds.approvalBudgetLimit,
          riskLevel: epic.riskLevel,
          llmDecision: true
        }
      };
      
    } catch (error) {
      this.logger.error('LLM portfolio decision failed, using fallback logic:', error);
      
      // Fallback to simple logic if LLM fails
      const estimatedROI = (epic.estimatedValue - epic.estimatedCost) / epic.estimatedCost;
      const decision = estimatedROI > 2.5 ? 'approve' : 'reject';
      
      return {
        decision,
        confidence: 0.6,
        reasoning: `Fallback decision: ROI is ${(estimatedROI * 100).toFixed(1)}%`,
        recommendations: ['Review with full LLM analysis when available'],
        requiredActions: [],
        humanOversightRequired: true,
        metadata: {
          roleType: 'lean-portfolio-manager',
          calculatedROI: estimatedROI,
          riskLevel: epic.riskLevel,
          llmDecision: false,
          fallback: true
        }
      };
    }
  }

  private async makeReleaseTrainEngineerDecision(context: SafeRoleDecisionContext): Promise<SafeRoleDecisionResult> {
    // RTE focuses on program execution and capacity
    const epic = context.epic;
    
    // Use actual RTE manager for capacity assessment
    const capacityAssessment = await this.releaseTrainManager.assessProgramCapacity({
      epic,
      currentPI: 'PI-2024-Q4',
      teamCapacity: 80 // 80% utilization
    });

    const canFitInPI = capacityAssessment.canAccommodate;
    const teamAvailability = capacityAssessment.teamAvailability || 0.7;
    
    let decision: 'approve' | 'reject' | 'defer' | 'more-information' = 'approve';
    let confidence = 0.8;
    let reasoning = '';

    if (!canFitInPI) {
      decision = 'defer';
      reasoning = 'Insufficient program capacity in current PI - recommend next PI planning';
      confidence = 0.9;
    } else if (teamAvailability < 0.5) {
      decision = 'more-information';
      reasoning = 'Low team availability - need dependency analysis and resource planning';
      confidence = 0.6;
    } else {
      reasoning = `Good program fit with ${(teamAvailability * 100).toFixed(0)}% team availability`;
      confidence = 0.85;
    }

    return {
      decision,
      confidence,
      reasoning,
      recommendations: [
        'Schedule PI Planning session to confirm team commitment',
        'Identify and address program dependencies',
        'Plan for cross-team collaboration needs'
      ],
      requiredActions: decision === 'approve' ? [
        'Add to Program Backlog for PI Planning',
        'Coordinate with Product Management for feature breakdown',
        'Schedule Scrum of Scrums reviews'
      ] : [],
      humanOversightRequired: decision === 'defer',
      metadata: {
        roleType: 'release-train-engineer',
        programCapacity: capacityAssessment,
        teamAvailability,
        currentPI: 'PI-2024-Q4'
      }
    };
  }

  private async makeProductManagerDecision(context: SafeRoleDecisionContext): Promise<SafeRoleDecisionResult> {
    const epic = context.epic;
    
    // Use LLMProvider for Product Manager customer value analysis
    const prompt = `As a Product Manager in SAFe, evaluate this epic from customer and market perspective:

Epic: ${epic.title}
Business Case: ${epic.businessCase}
Estimated Value: $${epic.estimatedValue.toLocaleString()}
Timeframe: ${epic.timeframe}
Risk Level: ${epic.riskLevel}

Analyze customer value, market fit, competitive advantage, and product strategy alignment.

Provide your decision as a JSON object with this exact structure:
{
  "decision": "approve|reject|defer|more-information",
  "confidence": 0.8,
  "reasoning": "brief explanation focusing on customer value and market fit",
  "humanOversightRequired": true|false
}`;

    try {
      const response = await this.llmProvider.executeAsAnalyst(prompt, 'safe-product-manager-decision');
      const parsed = this.parseDecisionResponse(response);
      
      // Use actual Product Management services if available
      let marketFit;
      try {
        marketFit = await this.productManager.assessMarketFit({
          epic,
          customerSegments: ['enterprise', 'mid-market'],
          competitorAnalysis: true
        });
      } catch (error) {
        this.logger.warn('Product Manager services unavailable, using LLM-only decision');
        marketFit = { marketTiming: 0.7 };
      }

      return {
        decision: parsed.decision || 'defer',
        confidence: parsed.confidence || 0.7,
        reasoning: parsed.reasoning || 'Customer value analysis completed',
        recommendations: [
          'Conduct user research to validate assumptions',
          'Develop minimum viable product (MVP) approach',
          'Define clear success metrics and KPIs'
        ],
        requiredActions: parsed.decision === 'approve' ? [
          'Create detailed product requirements',
          'Define feature roadmap and prioritization',
          'Establish customer feedback loops'
        ] : [],
        humanOversightRequired: parsed.humanOversightRequired || false,
        metadata: {
          roleType: 'product-manager',
          customerValue: this.assessCustomerValue(epic),
          marketTiming: marketFit.marketTiming || 0.7,
          marketFit,
          llmDecision: true
        }
      };
      
    } catch (error) {
      this.logger.error('LLM product manager decision failed, using fallback logic:', error);
      
      // Simple fallback logic
      const customerValue = this.assessCustomerValue(epic);
      const decision = customerValue > 0.7 ? 'approve' : 'more-information';
      
      return {
        decision,
        confidence: 0.6,
        reasoning: `Fallback customer value analysis: score is ${(customerValue * 100).toFixed(0)}%`,
        recommendations: ['Complete full market analysis when LLM available'],
        requiredActions: [],
        humanOversightRequired: true,
        metadata: {
          roleType: 'product-manager',
          customerValue,
          llmDecision: false,
          fallback: true
        }
      };
    }
  }

  private async makeSystemArchitectDecision(context: SafeRoleDecisionContext): Promise<SafeRoleDecisionResult> {
    // System Architect focuses on technical feasibility and architecture
    const epic = context.epic;
    
    const architecturalComplexity = this.assessArchitecturalComplexity(epic);
    const technicalFeasibility = this.assessTechnicalFeasibility(epic);
    const architecturalDebt = 0.3; // 30% technical debt impact
    
    let decision: 'approve' | 'reject' | 'defer' | 'more-information' = 'approve';
    let confidence = 0.8;
    let reasoning = '';

    if (technicalFeasibility < 0.5) {
      decision = 'reject';
      reasoning = 'Low technical feasibility with current architecture and technology stack';
      confidence = 0.9;
    } else if (architecturalComplexity > 0.8) {
      decision = 'more-information';
      reasoning = 'High architectural complexity - need detailed technical analysis';
      confidence = 0.6;
    } else {
      reasoning = `Technically feasible (${(technicalFeasibility * 100).toFixed(0)}%) with manageable complexity`;
      confidence = 0.8;
    }

    return {
      decision,
      confidence,
      reasoning,
      recommendations: [
        'Plan architecture runway enablers',
        'Address technical debt before implementation',
        'Ensure proper system integration patterns'
      ],
      requiredActions: decision === 'approve' ? [
        'Create detailed technical design',
        'Plan enabler features for architecture support',
        'Review integration points and dependencies'
      ] : [],
      humanOversightRequired: architecturalComplexity > 0.7,
      metadata: {
        roleType: 'system-architect',
        architecturalComplexity,
        technicalFeasibility,
        architecturalDebt
      }
    };
  }

  private async makeEpicOwnerDecision(context: SafeRoleDecisionContext): Promise<SafeRoleDecisionResult> {
    const epic = context.epic;
    
    // Use LLMProvider for Epic Owner business case analysis
    const prompt = `As an Epic Owner in SAFe, evaluate this epic's business case and benefit hypothesis:

Epic: ${epic.title}
Business Case: ${epic.businessCase}
Estimated Value: $${epic.estimatedValue.toLocaleString()}
Estimated Cost: $${epic.estimatedCost.toLocaleString()}
Timeframe: ${epic.timeframe}
Risk Level: ${epic.riskLevel}

Analyze the business case strength, market opportunity, and customer value proposition.

Provide your decision as a JSON object with this exact structure:
{
  "decision": "approve|reject|defer|more-information",
  "confidence": 0.8,
  "reasoning": "brief explanation focusing on business case strength",
  "humanOversightRequired": true|false
}`;

    try {
      const response = await this.llmProvider.executeAsAnalyst(prompt, 'safe-epic-owner-decision');
      const parsed = this.parseDecisionResponse(response);
      
      // Use actual Epic Owner services if available
      let businessCase;
      try {
        businessCase = await this.epicOwnerManager.analyzeBenefitHypothesis({
          epic,
          marketData: true,
          customerInsights: true,
          competitorAnalysis: false
        });
      } catch (error) {
        this.logger.warn('Epic Owner manager unavailable, using LLM-only decision');
        businessCase = { benefitScore: 0.7 };
      }
      
      return {
        decision: parsed.decision || 'defer',
        confidence: parsed.confidence || 0.7,
        reasoning: parsed.reasoning || 'Business case analysis completed',
        recommendations: [
          'Validate benefit hypothesis with customer interviews',
          'Define leading and lagging success metrics',
          'Plan phased delivery to validate assumptions'
        ],
        requiredActions: parsed.decision === 'approve' ? [
          'Complete detailed business case documentation',
          'Define epic acceptance criteria',
          'Plan benefit measurement approach'
        ] : [],
        humanOversightRequired: parsed.humanOversightRequired || false,
        metadata: {
          roleType: 'epic-owner',
          businessCaseStrength: businessCase.benefitScore || 0.7,
          benefitScore: businessCase.benefitScore || 0.7,
          businessCase,
          llmDecision: true
        }
      };
      
    } catch (error) {
      this.logger.error('LLM epic owner decision failed, using fallback logic:', error);
      
      // Simple fallback logic
      const businessValue = epic.estimatedValue / epic.estimatedCost;
      const decision = businessValue > 2 ? 'approve' : 'more-information';
      
      return {
        decision,
        confidence: 0.6,
        reasoning: `Fallback business case analysis: value ratio is ${businessValue.toFixed(1)}`,
        recommendations: ['Complete full business case analysis when LLM available'],
        requiredActions: [],
        humanOversightRequired: true,
        metadata: {
          roleType: 'epic-owner',
          businessCaseStrength: Math.min(businessValue / 3, 1.0),
          llmDecision: false,
          fallback: true
        }
      };
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private getRoleCapabilities(): string[] {
    switch (this.config.roleType) {
      case 'lean-portfolio-manager':
        return ['investment-decisions', 'strategic-alignment', 'portfolio-governance'];
      case 'release-train-engineer':
        return ['program-execution', 'pi-planning', 'scrum-of-scrums'];
      case 'product-manager':
        return ['product-strategy', 'customer-research', 'market-analysis'];
      case 'system-architect':
        return ['technical-feasibility', 'architecture-design', 'technical-governance'];
      case 'epic-owner':
        return ['business-case-analysis', 'benefit-hypothesis', 'market-research'];
      default:
        return [];
    }
  }

  /**
   * Parse LLM decision response and extract structured decision data
   */
  private parseDecisionResponse(response: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/{[\S\s]*}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          decision: parsed.decision,
          confidence: Number(parsed.confidence) || 0.7,
          reasoning: parsed.reasoning || 'LLM decision completed',
          humanOversightRequired: Boolean(parsed.humanOversightRequired)
        };
      }
      
      // Fallback: parse text response for decision keywords
      const text = response.toLowerCase();
      let decision = 'defer';
      if (text.includes('approve') || text.includes('accept')) decision = 'approve';
      else if (text.includes('reject') || text.includes('decline')) decision = 'reject';
      else if (text.includes('more information') || text.includes('need more')) decision = 'more-information';
      
      return {
        decision,
        confidence: 0.6,
        reasoning: response.substring(0, 200) + '...',
        humanOversightRequired: true
      };
      
    } catch (error) {
      this.logger.warn('Failed to parse LLM decision response:', error);
      return {
        decision: 'defer',
        confidence: 0.5,
        reasoning: 'Failed to parse LLM response',
        humanOversightRequired: true
      };
    }
  }

  private async makeLLMPortfolioDecision(epic: EpicProposal): Promise<any> {
    // Simplified LLM-style decision making
    return {
      investmentRecommendation: epic.estimatedValue > epic.estimatedCost * 2 ? 'approve' : 'review',
      strategicAlignment: 0.8,
      riskAssessment: epic.riskLevel
    };
  }

  private assessStrategicFit(epic: EpicProposal): number {
    // Simple heuristic for strategic alignment
    const valueRatio = epic.estimatedValue / epic.estimatedCost;
    return Math.min(valueRatio / 3, 1.0); // Cap at 1.0
  }

  private assessCustomerValue(epic: EpicProposal): number {
    // Simple customer value assessment based on business case keywords
    const businessCase = epic.businessCase.toLowerCase();
    let score = 0.5; // Base score
    
    if (businessCase.includes('customer') || businessCase.includes('user')) score += 0.2;
    if (businessCase.includes('improve') || businessCase.includes('enhance')) score += 0.1;
    if (businessCase.includes('experience') || businessCase.includes('satisfaction')) score += 0.2;
    
    return Math.min(score, 1.0);
  }

  private assessArchitecturalComplexity(epic: EpicProposal): number {
    // Simple complexity assessment
    const cost = epic.estimatedCost;
    const timeframe = epic.timeframe;
    
    let complexity = 0.5; // Base complexity
    if (cost > 500000) complexity += 0.2;
    if (timeframe.includes('month') && parseInt(timeframe) > 6) complexity += 0.2;
    if (epic.riskLevel === 'high') complexity += 0.1;
    
    return Math.min(complexity, 1.0);
  }

  private assessTechnicalFeasibility(epic: EpicProposal): number {
    // Simple technical feasibility assessment
    const businessCase = epic.businessCase.toLowerCase();
    let feasibility = 0.8; // Start high
    
    if (businessCase.includes('new technology') || businessCase.includes('innovative')) feasibility -= 0.2;
    if (epic.riskLevel === 'high') feasibility -= 0.1;
    if (epic.estimatedCost > 1000000) feasibility -= 0.1; // Very large projects harder
    
    return Math.max(feasibility, 0.3); // Minimum 30% feasibility
  }
}