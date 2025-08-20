/**
 * @fileoverview Basic Lean Portfolio Manager Agent - SAFe-SPARC Micro Prototype
 * 
 * Implements a minimal but functional AI Portfolio Manager that makes investment decisions
 * using @claude-zen/brain for autonomous decision-making with cognitive patterns.
 * 
 * This is the core SAFe role responsible for:
 * - Epic investment decisions based on business value
 * - Portfolio prioritization and resource allocation
 * - ROI assessment and risk evaluation
 * - Learning from decision outcomes
 */

import { EventEmitter } from 'node:events';

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '../../config/logging-config';
import type { EpicProposal, PortfolioDecision } from './micro-prototype-manager';

// Portfolio agent configuration
export interface BasicPortfolioConfig {
  agentId: string;
  learningEnabled: boolean;
  humanOversightThreshold: number; // Dollar amount requiring human approval
  riskTolerance?: 'conservative' | 'balanced' | 'aggressive';
}

// Decision-making context for the portfolio agent
export interface PortfolioContext {
  currentPortfolioValue: number;
  availableBudget: number;
  strategicObjectives: string[];
  riskConstraints: any;
  marketConditions: any;
}

/**
 * Basic Lean Portfolio Manager Agent - Uses @claude-zen/brain for intelligent decisions
 */
export class BasicPortfolioAgent extends EventEmitter {
  private logger: Logger;
  private config: BasicPortfolioConfig;
  private brainCoordinator: any;
  private initialized = false;
  private decisionHistory: PortfolioDecision[] = [];

  constructor(config: BasicPortfolioConfig) {
    super();
    this.config = config;
    this.logger = getLogger(`BasicPortfolioAgent-${config.agentId}`);
    this.logger.info(`Portfolio Agent initialized: ${config.agentId}`);
  }

  /**
   * Initialize with @claude-zen/brain coordination
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('Initializing Portfolio Agent with Brain Coordinator...');

      // Use actual @claude-zen/brain BrainCoordinator
      const { BrainCoordinator } = await import('@claude-zen/brain');
      
      this.brainCoordinator = new BrainCoordinator({
        autonomous: {
          enabled: true,
          learningRate: 0.1,
          adaptationThreshold: 0.7,
          decisionConfidenceMinimum: 0.6
        },
        cognitive: {
          // Portfolio Manager cognitive pattern
          specialization: 'financial-investment-analysis',
          decisionStyle: 'analytical-strategic',
          riskProfile: this.config.riskTolerance || 'balanced',
          learningFocus: ['roi-optimization', 'risk-assessment', 'market-analysis']
        },
        performance: {
          enableTracking: true,
          optimizeForAccuracy: true,
          trackDecisionOutcomes: true
        }
      });

      await this.brainCoordinator.initialize();

      this.initialized = true;
      this.logger.info('Portfolio Agent initialized successfully with Brain Coordinator');

      this.emit('agent-initialized', {
        agentId: this.config.agentId,
        capabilities: ['epic-evaluation', 'portfolio-optimization', 'risk-assessment']
      });

    } catch (error) {
      this.logger.error('Failed to initialize Portfolio Agent:', error);
      throw error;
    }
  }

  /**
   * Evaluate an epic proposal and make investment decision
   */
  async evaluateEpic(epicProposal: EpicProposal): Promise<PortfolioDecision> {
    if (!this.initialized) await this.initialize();

    this.logger.info(`Evaluating epic: ${epicProposal.title}`);

    try {
      // Gather portfolio context for decision-making
      const context = await this.gatherPortfolioContext();

      // Use Brain Coordinator for intelligent epic evaluation
      const evaluation = await this.brainCoordinator.makeDecision({
        decisionType: 'epic-investment-evaluation',
        context: {
          epic: epicProposal,
          portfolio: context,
          constraints: {
            budgetLimit: context.availableBudget,
            riskTolerance: this.config.riskTolerance,
            strategicAlignment: context.strategicObjectives
          }
        },
        analysisDepth: 'comprehensive',
        includeRiskAssessment: true,
        generateExplanation: true
      });

      // Calculate ROI and confidence metrics
      const roiEstimate = this.calculateROI(epicProposal, evaluation);
      const confidenceScore = evaluation.confidence || 0.7;

      // Determine if human oversight is required
      const humanOversightRequired = this.shouldRequireHumanOversight(epicProposal, evaluation);

      // Create portfolio decision
      const decision: PortfolioDecision = {
        epicId: epicProposal.id,
        decision: this.mapEvaluationToDecision(evaluation),
        confidence: confidenceScore,
        reasoning: this.generateDecisionReasoning(epicProposal, evaluation, roiEstimate),
        humanOversightRequired,
        estimatedROI: roiEstimate
      };

      // Store decision for learning
      this.decisionHistory.push(decision);

      // Emit decision event
      this.emit('epic-decision', { epicProposal, decision, evaluation });

      this.logger.info(`Epic evaluation complete: ${epicProposal.title} - Decision: ${decision.decision}`);
      return decision;

    } catch (error) {
      this.logger.error(`Failed to evaluate epic ${epicProposal.title}:`, error);
      throw error;
    }
  }

  /**
   * Health check for the portfolio agent
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.initialized || !this.brainCoordinator) return false;

      // Check brain coordinator health
      const brainHealth = await this.brainCoordinator.healthCheck();
      
      // Check decision-making capability
      const testDecision = await this.brainCoordinator.makeDecision({
        decisionType: 'health-check-test',
        context: { test: true },
        analysisDepth: 'minimal'
      });

      return brainHealth && testDecision !== null;

    } catch (error) {
      this.logger.error('Portfolio Agent health check failed:', error);
      return false;
    }
  }

  /**
   * Get learning statistics from the agent
   */
  async getLearningStats(): Promise<any> {
    if (!this.initialized || !this.brainCoordinator) {
      return { learningEnabled: false, decisions: 0 };
    }

    return {
      learningEnabled: this.config.learningEnabled,
      totalDecisions: this.decisionHistory.length,
      approvedEpics: this.decisionHistory.filter(d => d.decision === 'approve').length,
      rejectedEpics: this.decisionHistory.filter(d => d.decision === 'reject').length,
      deferredEpics: this.decisionHistory.filter(d => d.decision === 'defer').length,
      averageConfidence: this.calculateAverageConfidence(),
      humanOversightRate: this.calculateHumanOversightRate(),
      learningProgress: await this.brainCoordinator.getLearningStats?.() || {}
    };
  }

  private async gatherPortfolioContext(): Promise<PortfolioContext> {
    // In a real implementation, this would gather actual portfolio data
    return {
      currentPortfolioValue: 10000000, // $10M portfolio
      availableBudget: 2000000, // $2M available
      strategicObjectives: [
        'digital-transformation',
        'customer-experience-improvement', 
        'operational-efficiency',
        'market-expansion'
      ],
      riskConstraints: {
        maxSingleInvestment: 500000, // $500K max single investment
        requiresDiversification: true
      },
      marketConditions: {
        volatility: 'moderate',
        growthProspects: 'positive',
        competitivePressure: 'high'
      }
    };
  }

  private calculateROI(epic: EpicProposal, evaluation: any): number {
    // Simple ROI calculation - in production this would be more sophisticated
    const expectedValue = epic.estimatedValue;
    const estimatedCost = epic.estimatedCost;
    
    if (estimatedCost === 0) return 0;
    
    // Apply brain coordinator insights to adjust ROI
    const adjustmentFactor = evaluation.valueAdjustment || 1.0;
    const adjustedValue = expectedValue * adjustmentFactor;
    
    return ((adjustedValue - estimatedCost) / estimatedCost) * 100;
  }

  private shouldRequireHumanOversight(epic: EpicProposal, evaluation: any): boolean {
    // Require human oversight for high-value, high-risk, or low-confidence decisions
    return (
      epic.estimatedCost > this.config.humanOversightThreshold ||
      epic.riskLevel === 'high' ||
      evaluation.confidence < 0.8 ||
      evaluation.requiresHumanReview === true
    );
  }

  private mapEvaluationToDecision(evaluation: any): 'approve' | 'reject' | 'defer' {
    if (evaluation.recommendation === 'approve' || evaluation.score > 0.7) {
      return 'approve';
    } else if (evaluation.recommendation === 'reject' || evaluation.score < 0.3) {
      return 'reject';
    } else {
      return 'defer';
    }
  }

  private generateDecisionReasoning(epic: EpicProposal, evaluation: any, roi: number): string[] {
    const reasoning = [];

    // Business value reasoning
    if (evaluation.businessValue) {
      reasoning.push(`Business value assessment: ${evaluation.businessValue.summary}`);
    }

    // ROI reasoning
    reasoning.push(`Estimated ROI: ${roi.toFixed(1)}%`);

    // Risk reasoning
    if (epic.riskLevel === 'high') {
      reasoning.push('High risk level requires careful consideration');
    }

    // Strategic alignment
    if (evaluation.strategicAlignment) {
      reasoning.push(`Strategic alignment score: ${evaluation.strategicAlignment.score}`);
    }

    // Market conditions
    reasoning.push('Market conditions considered in evaluation');

    // Brain coordinator insights
    if (evaluation.insights && evaluation.insights.length > 0) {
      reasoning.push(...evaluation.insights);
    }

    return reasoning;
  }

  private calculateAverageConfidence(): number {
    if (this.decisionHistory.length === 0) return 0;
    
    const totalConfidence = this.decisionHistory.reduce((sum, decision) => sum + decision.confidence, 0);
    return totalConfidence / this.decisionHistory.length;
  }

  private calculateHumanOversightRate(): number {
    if (this.decisionHistory.length === 0) return 0;
    
    const oversightCount = this.decisionHistory.filter(d => d.humanOversightRequired).length;
    return (oversightCount / this.decisionHistory.length) * 100;
  }
}