/**
 * @fileoverview Basic AGUI Interface - SAFe-SPARC Micro Prototype
 * 
 * Implements a minimal but functional AGUI (Autonomous Graphical User Interface) 
 * for human-in-the-loop decision making using @claude-zen/agui package.
 * 
 * This component handles:
 * - Strategic decision presentations to humans
 * - Investment approval workflows
 * - Human oversight for critical AI decisions
 * - Task approval and workflow gates
 */

import { EventEmitter } from 'node:events';

import type { Logger } from '@claude-zen/foundation';
import { getLogger } from '../../config/logging-config';
import type { EpicProposal, PortfolioDecision } from './micro-prototype-manager';

// AGUI interface configuration
export interface BasicAguiConfig {
  interfaceId: string;
  timeoutMinutes: number;
  escalationRules: string[];
  interfaceType?: 'terminal' | 'web' | 'mock';
}

// Decision presentation request
export interface DecisionPresentationRequest {
  decisionType: 'epic-investment' | 'strategic-change' | 'risk-assessment' | 'resource-allocation';
  aiRecommendation: any;
  context: any;
  timeoutMinutes?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

// Human decision response
export interface HumanDecisionResponse {
  decision: 'approve' | 'reject' | 'defer' | 'modify';
  reasoning: string;
  modifications?: any;
  confidence: number;
  timestamp: Date;
  userId?: string;
}

/**
 * Basic AGUI Interface - Uses @claude-zen/agui for human oversight
 */
export class BasicAguiInterface extends EventEmitter {
  private logger: Logger;
  private config: BasicAguiConfig;
  private aguiSystem: any;
  private taskApprovalSystem: any;
  private initialized = false;
  private pendingDecisions = new Map<string, any>();
  private decisionHistory: HumanDecisionResponse[] = [];

  constructor(config: BasicAguiConfig) {
    super();
    this.config = config;
    this.logger = getLogger(`BasicAguiInterface-${config.interfaceId}`);
    this.logger.info(`AGUI Interface initialized: ${config.interfaceId}`);
  }

  /**
   * Initialize with @claude-zen/agui components
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.logger.info('Initializing AGUI Interface with AGUI system...');

      // Use actual @claude-zen/agui createAGUI function
      const { createAGUI } = await import('@claude-zen/agui');
      
      const aguiResult = await createAGUI({
        aguiType: this.config.interfaceType || 'terminal',
        taskApprovalConfig: {
          autoApprove: false,
          timeoutMs: this.config.timeoutMinutes * 60 * 1000,
          defaultDecision: 'reject',
          enableLogging: true,
          requireConfirmation: true
        }
      });

      this.aguiSystem = aguiResult.agui;
      this.taskApprovalSystem = aguiResult.taskApproval;

      // Set up event handlers
      this.setupEventHandlers();

      this.initialized = true;
      this.logger.info('AGUI Interface initialized successfully with AGUI system');

      this.emit('agui-initialized', {
        interfaceId: this.config.interfaceId,
        capabilities: ['human-decision-making', 'task-approval', 'strategic-oversight']
      });

    } catch (error) {
      this.logger.error('Failed to initialize AGUI Interface:', error);
      throw error;
    }
  }

  /**
   * Present a strategic decision to human for approval/override
   */
  async presentDecision(request: DecisionPresentationRequest): Promise<HumanDecisionResponse> {
    if (!this.initialized) await this.initialize();

    this.logger.info(`Presenting decision for human review: ${request.decisionType}`);

    try {
      const decisionId = this.generateDecisionId();
      const timeoutMs = (request.timeoutMinutes || this.config.timeoutMinutes) * 60 * 1000;

      // Store pending decision
      this.pendingDecisions.set(decisionId, {
        request,
        timestamp: new Date(),
        status: 'pending'
      });

      // Present decision using AGUI system
      const humanResponse = await this.presentDecisionToHuman(request, decisionId, timeoutMs);

      // Remove from pending
      this.pendingDecisions.delete(decisionId);

      // Store in history
      this.decisionHistory.push(humanResponse);

      // Emit decision event
      this.emit('human-decision-made', { request, response: humanResponse });

      this.logger.info(`Human decision received: ${request.decisionType} - ${humanResponse.decision}`);
      return humanResponse;

    } catch (error) {
      this.logger.error(`Failed to present decision ${request.decisionType}:`, error);
      throw error;
    }
  }

  /**
   * Present epic investment decision with detailed context
   */
  async presentEpicInvestmentDecision(
    epic: EpicProposal, 
    aiRecommendation: PortfolioDecision
  ): Promise<HumanDecisionResponse> {
    
    const request: DecisionPresentationRequest = {
      decisionType: 'epic-investment',
      aiRecommendation,
      context: {
        epic,
        financialImpact: {
          estimatedCost: epic.estimatedCost,
          estimatedValue: epic.estimatedValue,
          estimatedROI: aiRecommendation.estimatedROI
        },
        riskAssessment: {
          riskLevel: epic.riskLevel,
          aiConfidence: aiRecommendation.confidence,
          reasoning: aiRecommendation.reasoning
        }
      },
      priority: epic.riskLevel === 'high' ? 'high' : 'medium'
    };

    return this.presentDecision(request);
  }

  /**
   * Health check for the AGUI interface
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.initialized || !this.aguiSystem || !this.taskApprovalSystem) return false;

      // Test basic AGUI functionality
      const testResponse = await this.aguiSystem.askQuestion('Health check test?', {
        type: 'boolean',
        timeout: 1000 // Quick test
      });

      // Test task approval system
      const approvalTest = await this.taskApprovalSystem.requestApproval({
        taskType: 'health-check',
        description: 'AGUI health check test',
        context: { test: true },
        timeout: 1000
      });

      return testResponse !== null && approvalTest !== null;

    } catch (error) {
      this.logger.error('AGUI Interface health check failed:', error);
      return false;
    }
  }

  /**
   * Get interface statistics and metrics
   */
  async getInterfaceStats(): Promise<any> {
    return {
      interfaceId: this.config.interfaceId,
      initialized: this.initialized,
      pendingDecisions: this.pendingDecisions.size,
      totalDecisions: this.decisionHistory.length,
      decisionTypes: this.getDecisionTypeStats(),
      responseStats: this.getResponseStats(),
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  private async presentDecisionToHuman(
    request: DecisionPresentationRequest, 
    decisionId: string, 
    timeoutMs: number
  ): Promise<HumanDecisionResponse> {

    try {
      // Format decision for human presentation
      const decisionSummary = this.formatDecisionSummary(request);
      
      // Present decision using AGUI system
      const response = await this.aguiSystem.askQuestion(
        `Strategic Decision Required: ${request.decisionType.toUpperCase()}\n\n${decisionSummary}\n\nWhat is your decision?`,
        {
          type: 'choice',
          choices: ['approve', 'reject', 'defer', 'modify'],
          priority: request.priority || 'medium',
          timeout: timeoutMs,
          context: {
            decisionId,
            decisionType: request.decisionType,
            aiRecommendation: request.aiRecommendation
          }
        }
      );

      // Get reasoning from human
      const reasoning = await this.aguiSystem.askQuestion(
        'Please provide your reasoning for this decision:',
        {
          type: 'text',
          required: true,
          timeout: 30000 // 30 second timeout for reasoning
        }
      );

      // Get confidence level
      const confidence = await this.aguiSystem.askQuestion(
        'How confident are you in this decision? (0-100)',
        {
          type: 'number',
          min: 0,
          max: 100,
          default: 80
        }
      );

      return {
        decision: response.answer as 'approve' | 'reject' | 'defer' | 'modify',
        reasoning: reasoning.answer as string,
        confidence: (confidence.answer as number) / 100,
        timestamp: new Date(),
        userId: 'human-oversight-user' // In real implementation, would get actual user ID
      };

    } catch (error) {
      // Handle timeout or other errors
      if (error.message?.includes('timeout')) {
        this.logger.warn(`Decision timeout for ${request.decisionType}, using default escalation`);
        return this.executeEscalationStrategy(request);
      }
      throw error;
    }
  }

  private formatDecisionSummary(request: DecisionPresentationRequest): string {
    let summary = '';

    switch (request.decisionType) {
      case 'epic-investment':
        const epic = request.context.epic;
        const ai = request.aiRecommendation;
        summary = `
Epic Investment Decision:
- Title: ${epic.title}
- Business Case: ${epic.businessCase}
- Estimated Cost: $${epic.estimatedCost.toLocaleString()}
- Estimated Value: $${epic.estimatedValue.toLocaleString()}
- Risk Level: ${epic.riskLevel.toUpperCase()}
- Timeline: ${epic.timeframe}

AI Recommendation: ${ai.decision.toUpperCase()}
- Confidence: ${(ai.confidence * 100).toFixed(1)}%
- Estimated ROI: ${ai.estimatedROI.toFixed(1)}%
- Reasoning: ${ai.reasoning.join('; ')}
        `;
        break;

      default:
        summary = `
Decision Type: ${request.decisionType}
AI Recommendation: ${JSON.stringify(request.aiRecommendation, null, 2)}
Context: ${JSON.stringify(request.context, null, 2)}
        `;
    }

    return summary.trim();
  }

  private executeEscalationStrategy(request: DecisionPresentationRequest): HumanDecisionResponse {
    // Default escalation strategy based on configuration
    const defaultStrategy = this.config.escalationRules[0] || 'supervisor-escalation';

    switch (defaultStrategy) {
      case 'supervisor-escalation':
        return {
          decision: 'defer',
          reasoning: 'Escalated to supervisor due to timeout - requires senior review',
          confidence: 0.5,
          timestamp: new Date()
        };

      case 'ai-recommendation-accept':
        return {
          decision: request.aiRecommendation.decision || 'defer',
          reasoning: 'Accepted AI recommendation due to human timeout',
          confidence: 0.6,
          timestamp: new Date()
        };

      default:
        return {
          decision: 'defer',
          reasoning: 'Default defer due to timeout and unknown escalation rule',
          confidence: 0.3,
          timestamp: new Date()
        };
    }
  }

  private setupEventHandlers(): void {
    // Set up AGUI event handlers if supported
    if (this.aguiSystem.on) {
      this.aguiSystem.on('question-answered', (event: any) => {
        this.emit('agui-interaction', event);
      });

      this.aguiSystem.on('timeout', (event: any) => {
        this.emit('agui-timeout', event);
      });
    }

    if (this.taskApprovalSystem.on) {
      this.taskApprovalSystem.on('approval-requested', (event: any) => {
        this.emit('approval-requested', event);
      });

      this.taskApprovalSystem.on('approval-completed', (event: any) => {
        this.emit('approval-completed', event);
      });
    }
  }

  private generateDecisionId(): string {
    return `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDecisionTypeStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.decisionHistory.forEach(decision => {
      const key = 'unknown'; // Would need to track decision type in history
      stats[key] = (stats[key] || 0) + 1;
    });

    return stats;
  }

  private getResponseStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    this.decisionHistory.forEach(decision => {
      stats[decision.decision] = (stats[decision.decision] || 0) + 1;
    });

    return stats;
  }

  private calculateAverageResponseTime(): number {
    // Would need to track response times - placeholder for now
    return this.config.timeoutMinutes * 60 * 1000 * 0.3; // Assume 30% of timeout on average
  }
}