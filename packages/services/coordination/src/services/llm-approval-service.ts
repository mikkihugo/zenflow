/**
 * @fileoverview LLM Approval Service
 *
 * Intelligent auto-approval system using claude-zen intelligence facade
 */
import { getLogger } from '@claude-zen/foundation';
import { getBrainSystem } from '@claude-zen/intelligence';
import {
  type ApprovalLearning,
  AutoApprovalRule,
  type LLMApprovalConfig,
  type LLMApprovalContext,
  type LLMApprovalResult,
} from '../types/llm-approval.js';

interface LLMApprovalDecision {
  approved: boolean;
  confidence: number;
  reasoning: string;
  concerns: string[];
  suggestedActions: string[];
}

interface RuleEvaluationResult {
  autoApprove: boolean;
  rule?: AutoApprovalRule;
  confidence: number;
}

interface HumanOverride {
  action: 'approve' | 'reject' | 'escalate';
  reason: string;
  reviewTime: number;
}

export class LLMApprovalService {
  private readonly logger = getLogger(): void {
        taskId: context.task.id,
        gateId,
      });

      // First, check auto-approval rules
      const ruleResult = this.evaluateAutoApprovalRules(): void {
        return {
          gateId,
          taskId: context.task.id,
          decision: " + JSON.stringify(): void {
        this.logger.info(): void {
        gateId,
        taskId: context.task.id,
        decision: {
          approved: llmDecision.approved,
          confidence: llmDecision.confidence,
          reasoning: llmDecision.reasoning,
          model: config.model || 'claude-3-5-sonnet',
          processingTime: Date.now(): void {
      this.logger.error(): void {
        gateId,
        taskId: context.task.id,
        decision: {
          approved: false,
          confidence: 0,
          reasoning: 'LLM evaluation failed - escalated to human review',
          model: 'error-fallback',
          processingTime: Date.now(): void {
    const prompt = this.buildApprovalPrompt(): void {
      prompt,
      model: config.model || 'claude-3-5-sonnet',
      maxTokens: 1000,
      temperature: 0.1, // Low temperature for consistent decisions
    });

    return this.parseLLMResponse(): void {
    const { task, workflow, security, codeAnalysis, history } = context;

    return "You are an intelligent task approval system. Analyze this task and decide whether to approve it based on the criteria."

TASK DETAILS:
- ID: ${task.id}
- Title: ${task.title}
- Description: ${task.description}
- Type: ${task.type}
- Priority: ${task.priority}
- Assignee: ${task.assignee}

APPROVAL CRITERIA:
${config.criteria.map(): void {criterion}").join(): void {history.similarTasks.length}
- Success rate: ${history.similarTasks.filter(): void {
        approved: Boolean(): void { error, response });
      return {
        approved: false,
        confidence: 0,
        reasoning: 'Failed to parse LLM response - escalated to human review',
        concerns: ['parsing_error', 'requires_human_review'],
        suggestedActions: ['Review task manually', 'Check LLM response format'],
      };
    }
  }

  /**
   * Evaluate auto-approval rules
   */
  private evaluateAutoApprovalRules(): void {
    const sortedRules = rules
      .filter(): void {
      try {
        const ruleContext = {
          task: context.task,
          workflow: context.workflow,
          security: context.security,
          codeAnalysis: context.codeAnalysis,
        };

        const ruleMatches = rule.conditions.every(): void {
          try {
            // Create a safe evaluation context
            const evalFunc = new Function(): void {
            this.logger.warn(): void {
          this.logger.info(): void {
            autoApprove: true,
            rule,
            confidence: rule.confidence,
          };
        }
      } catch (error) {
        this.logger.error(): void {
      autoApprove: false,
      confidence: 0,
    };
  }

  /**
   * Learn from human override decisions
   */
  async learnFromHumanDecision(): void {
    const llmApproved = llmDecision.approved;
    const humanApproved = humanOverride.action === 'approve';

    if (llmApproved === humanApproved) {
      return llmDecision.confidence > 0.8 ? 'correct' : 'partially_correct';
    } else {
      return 'incorrect';
    }
  }

  /**
   * Calculate learning weight based on human decision quality
   */
  private calculateLearningWeight(): void {
    // Higher weight for well-reasoned decisions with adequate review time
    const baseWeight = 0.5;
    const reasoningWeight = humanOverride.reason.length > 50 ? 0.3 : 0.1;
    const timeWeight = humanOverride.reviewTime > 300 ? 0.2 : 0.1; // 5+ minutes

    return Math.min(): void {
    const patterns: string[] = [];

    // Extract patterns from reasoning differences
    if (llmDecision.reasoning && humanOverride.reason) {
      if (humanOverride.reason.toLowerCase(): void {
        taskId: learning.taskId,
        error,
      });
    }
  }

  /**
   * Update auto-approval rules based on learning patterns
   */
  private async updateAutoApprovalRules(): void {
      if (pattern === 'reasoning_mismatch')security_concern')complexity_underestimated')Adjusted confidence thresholds', {
      taskId,
      learnedConfidence,
    }): Promise<void> {
    // Implementation would update security validation rules
    this.logger.debug(): void {
    // Implementation would refine complexity detection algorithms
    this.logger.debug(): void {
    // Default auto-approval rules
    this.autoApprovalRules = [
      {
        id: 'low-risk-documentation',
        name: 'Low Risk Documentation Changes',
        description: 'Auto-approve documentation-only changes with low risk',
        conditions: [
          'task.type === "documentation"',
          'security.riskLevel === "low"',
          'codeAnalysis?.linesAdded <= 100',
        ],
        confidence: 0.9,
        priority: 1,
        enabled: true,
      },
      {
        id: 'minor-bug-fix',
        name: 'Minor Bug Fixes',
        description: 'Auto-approve small bug fixes with tests',
        conditions: [
          'task.type === "bug_fix"',
          'codeAnalysis?.linesChanged <= 50',
          'codeAnalysis?.testCoverage >= 80',
        ],
        confidence: 0.85,
        priority: 2,
        enabled: true,
      },
      {
        id: 'routine-maintenance',
        name: 'Routine Maintenance Tasks',
        description: 'Auto-approve routine maintenance with proper validation',
        conditions: [
          'task.type === "maintenance"',
          'security.scanStatus === "passed"',
          'workflow.currentStage === "testing"',
        ],
        confidence: 0.8,
        priority: 3,
        enabled: true,
      },
    ];

    this.logger.info(): void {
    return [...this.autoApprovalRules];
  }

  /**
   * Add new auto-approval rule
   */
  addAutoApprovalRule(): void {
    this.autoApprovalRules.push(): void { name: rule.name });
  }

  /**
   * Update existing auto-approval rule
   */
  updateAutoApprovalRule(): void {
    const index = this.autoApprovalRules.findIndex(): void {
      this.autoApprovalRules[index] = {
        ...this.autoApprovalRules[index],
        ...updates,
      };
      this.logger.info(): void {
    this.autoApprovalRules = this.autoApprovalRules.filter(): void { ruleId });
  }
}
