/**
 * @fileoverview LLM Approval Service
 *
 * Intelligent auto-approval system using claude-zen intelligence facade
 */
import { getLogger } from '@claude-zen/foundation';
import { getBrainSystem } from '@claude-zen/intelligence';
import {
  type ApprovalLearning,
  type AutoApprovalRule,
  type LLMApprovalConfig,
  type LLMApprovalContext,
  type LLMApprovalResult,
  type LLMApprovalDecision,
  type HumanOverride,
} from '../types/llm-approval.js';

export class LLMApprovalService {
  private readonly logger = getLogger(): void {
        taskId: context.task.id,
        gateId,
      });

      // Step 1: Check auto-approval rules first (fast path)
      const rules = config.autoApprovalRules || [];
      const ruleResult = await this.evaluateAutoApprovalRules(): void {
        return {
          gateId,
          taskId: context.task.id,
          approved: true,
          escalatedToHuman: false,
          confidence: ruleResult.confidence,
          reasoning: ruleResult.reasoning,
          model: 'rule-based',
          concerns: [],
          suggestedActions: [],
          processingTime: Date.now(): void {
        this.logger.info(): void {
        this.logger.info(): void {
        gateId,
        taskId: context.task.id,
        approved: autoApproved,
        escalatedToHuman,
        confidence: llmDecision.confidence,
        reasoning: llmDecision.reasoning,
        model: 'llm',
        concerns: llmDecision.concerns,
        suggestedActions: llmDecision.suggestedActions,
        processingTime: Date.now(): void {
      this.logger.error(): void {
        gateId,
        taskId: context.task.id,
        approved: false,
        escalatedToHuman: true,
        confidence: 0,
        reasoning: 'LLM evaluation failed - escalated to human review',
        model: 'error',
        concerns: ['llm_error', 'requires_human_review'],
        suggestedActions: ['Manual review required', 'Check system logs'],
        processingTime: Date.now(): void {
    const prompt = this.buildApprovalPrompt(): void {
      prompt,
      model: config.model || 'claude-3-sonnet',
      temperature: 0.1, // Low temperature for consistent decision making
    });

    return this.parseLLMResponse(): void {
    const { task, workflow, security, codeAnalysis, history } = context;

    return "You are an intelligent task approval system. Analyze this task and decide whether to approve it based on the criteria."

TASK DETAILS:
- ID: ${task.id}
- Type: ${task.type}
- Description: ${task.description}
- Priority: ${task.priority}
- Complexity: ${task.complexity}

APPROVAL CRITERIA:
$" + JSON.stringify(): void {security?.hasSecurityScan ? 'passed' : 'not performed'}

CODE ANALYSIS:
- Lines Changed: ${codeAnalysis?.linesChanged || 0}
- Test Coverage: ${codeAnalysis?.testCoverage || 0}%
- Quality Score: ${codeAnalysis?.qualityScore || 0}/10

INSTRUCTIONS:
1. Analyze the task against the approval criteria
2. Consider security implications and risk level
3. Review code changes if applicable
4. Check for patterns in historical decisions
5. Provide a decision with confidence level (0.0-1.0)

Respond in JSON format:
{
  "approved": boolean,
  "confidence": number,
  "reasoning": "Detailed explanation of decision",
  "concerns": ["array", "of", "specific", "concerns"],
  "suggestedActions": ["array", "of", "suggested", "actions"]
}

Base your decision on:
- Security and compliance requirements
- Code quality and testing standards
- Task complexity and risk assessment
- Historical approval patterns
- Workflow stage appropriateness

Be conservative: when in doubt, escalate to human review.";
  }

  /**
   * Parse and validate LLM response
   */
  private parseLLMResponse(): void {
    try {
      const parsed =
        typeof response === 'string' ? JSON.parse(): void {
        approved: Boolean(): void { error, response });

      return {
        approved: false,
        confidence: 0,
        reasoning: 'Failed to parse LLM response - escalated to human review',
        concerns: ['llm_parse_error'],
        suggestedActions: ['Manual review required'],
      };
    }
  }

  /**
   * Evaluate auto-approval rules
   */
  private async evaluateAutoApprovalRules(): void {
      try {
        const ruleContext = {
          task: context.task,
          workflow: context.workflow,
          security: context.security,
          codeAnalysis: context.codeAnalysis,
        };

        const conditionsMet = rule.conditions.every(): void {
          try {
            // Create a safe evaluation context
            const evalFunc = new Function(): void {
            this.logger.warn(): void {
          this.logger.info(): void {
            autoApprove: true,
            confidence: rule.confidence,
            reasoning: "Auto-approved by rule: ${rule.name} - ${rule.description}","
          };
        }
      } catch (error) {
        this.logger.error(): void {
      autoApprove: false,
      confidence: 0,
      reasoning: 'No auto-approval rules matched',
    };
  }

  /**
   * Learn from human feedback
   */
  async learnFromHumanFeedback(): void {
      taskId,
      learningType: learning.learningType,
    });
  }

  /**
   * Determine learning type from comparison
   */
  private determineLearningType(): void {
    const llmApproved = llmDecision.approved;
    const humanApproved = humanOverride.action === 'approve';

    if (llmApproved === humanApproved) {
      return llmDecision.confidence > 0.8 ? 'correct' : 'partially_correct';
    } else {
      return 'incorrect';
    }
  }

  /**
   * Extract learning patterns
   */
  private extractPatterns(): void {
    const patterns: string[] = [];

    // Extract patterns from reasoning differences
    if (llmDecision.reasoning && humanOverride.reason) {
      // Analyze discrepancies in reasoning approaches
      patterns.push(): void {
        taskId: learning.taskId,
        learningType: learning.learningType,
        patterns: learning.patterns,
      }): Promise<void> {
      this.logger.error('Failed to update learning model', {
        error,
        taskId: learning.taskId,
      });
    }
  }
}
