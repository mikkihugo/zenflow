/**
 * @fileoverview LLM Approval Service
 *
 * Intelligent auto-approval system using claude-zen intelligence facade
 */
import {
  LLMApprovalConfig,
  LLMApprovalDecision,
  LLMApprovalContext,
  LLMApprovalResult,
  AutoApprovalRule,
  LLMApprovalMetrics,
  HumanOverride,
} from '../types/llm-approval.js';
export declare class LLMApprovalService {
  private readonly logger;
  private brainSystem;
  private learningData;
  initialize(): Promise<void>;
  /**
   * Evaluate a task for auto-approval using LLM
   */
  evaluateForApproval(
    context: LLMApprovalContext,
    config: LLMApprovalConfig,
    rules: AutoApprovalRule[]
  ): Promise<LLMApprovalResult>;
  /**
   * Get LLM decision using intelligence facade
   */
  private getLLMDecision;
  /**
   * Build comprehensive approval prompt
   */
  private buildApprovalPrompt;
  /**
   * Parse and validate LLM response
   */
  private parseLLMResponse;
  /**
   * Evaluate auto-approval rules (fast path)
   */
  private evaluateAutoApprovalRules;
  /**
   * Learn from human override decisions
   */
  learnFromHumanFeedback(
    taskId: string,
    llmDecision: LLMApprovalDecision,
    humanOverride: HumanOverride
  ): Promise<void>;
  /**
   * Get approval metrics and analytics
   */
  getApprovalMetrics(): LLMApprovalMetrics;
  private determineFeedbackType;
  private calculateLearningWeight;
  private extractLearningPatterns;
  private updateLearningModel;
}
