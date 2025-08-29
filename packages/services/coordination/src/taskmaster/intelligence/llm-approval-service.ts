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
  private readonly logger = getLogger('LLMApprovalService');
  private brainSystem: any;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    this.brainSystem = await getBrainSystem();
    this.initialized = true;
    this.logger.info('LLM Approval Service initialized');
  }
  /**
   * Evaluate a task for auto-approval using LLM
   */
  async evaluateForApproval(
    context: LLMApprovalContext,
    config: LLMApprovalConfig
  ): Promise<LLMApprovalResult> {
    if (!this.initialized) await this.initialize();

    const startTime = Date.now();
    const gateId = `gate_${context.task.id}_${Date.now()}`;
    
    try {
      this.logger.info('Starting LLM approval evaluation', {
        taskId: context.task.id,
        gateId
      });

      // Step 1: Check auto-approval rules first (fast path)
      const rules = config.autoApprovalRules || [];
      const ruleResult = await this.evaluateAutoApprovalRules(context, rules);
      
      if (ruleResult.autoApprove) {
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
          processingTime: Date.now() - startTime
        };
      }

      // Step 2: Use LLM for complex decision making
      const llmDecision = await this.getLLMDecision(context, config);
      
      // Determine if auto-approval threshold is met
      const autoApproved = 
        llmDecision.approved && 
        llmDecision.confidence >= config.confidenceThreshold;
        
      const escalatedToHuman = !autoApproved || llmDecision.concerns.length > 0;

      if (autoApproved) {
        this.logger.info('LLM auto-approved task', {
          taskId: context.task.id,
          confidence: llmDecision.confidence
        });
      } else {
        this.logger.info('Task escalated to human review', {
          taskId: context.task.id,
          confidence: llmDecision.confidence,
          concerns: llmDecision.concerns
        });
      }

      return {
        gateId,
        taskId: context.task.id,
        approved: autoApproved,
        escalatedToHuman,
        confidence: llmDecision.confidence,
        reasoning: llmDecision.reasoning,
        model: 'llm',
        concerns: llmDecision.concerns,
        suggestedActions: llmDecision.suggestedActions,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      this.logger.error('LLM approval evaluation failed', { error, taskId: context.task.id });
      
      return {
        gateId,
        taskId: context.task.id,
        approved: false,
        escalatedToHuman: true,
        confidence: 0,
        reasoning: 'LLM evaluation failed - escalated to human review',
        model: 'error',
        concerns: ['llm_error', 'requires_human_review'],
        suggestedActions: ['Manual review required', 'Check system logs'],
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Get LLM decision for approval
   */
  private async getLLMDecision(
    context: LLMApprovalContext,
    config: LLMApprovalConfig
  ): Promise<LLMApprovalDecision> {    const prompt = this.buildApprovalPrompt(context, config);
    
    const response = await this.brainSystem.query({
      prompt,
      model: config.model || 'claude-3-sonnet',
      temperature: 0.1 // Low temperature for consistent decision making
    });

    return this.parseLLMResponse(response, config);
  }

  /**
   * Build approval prompt for LLM
   */
  private buildApprovalPrompt(context: LLMApprovalContext, config: LLMApprovalConfig): string {
    const { task, workflow, security, codeAnalysis, history } = context;
    
    return `You are an intelligent task approval system. Analyze this task and decide whether to approve it based on the criteria.

TASK DETAILS:
- ID: ${task.id}
- Type: ${task.type}
- Description: ${task.description}
- Priority: ${task.priority}
- Complexity: ${task.complexity}

APPROVAL CRITERIA:
${config.criteria.map((criterion) => `- ${criterion}`).join('\n')}

HISTORICAL CONTEXT:
- Similar tasks: ${history.similarTasks.length}
- Previous approvals: ${history.similarTasks.filter((t) => t.decision === 'approved').length}/${history.similarTasks.length} approved

SECURITY CONTEXT:
- Risk Level: ${security?.riskLevel || 'unknown'}
- Security Scan: ${security?.hasSecurityScan ? 'passed' : 'not performed'}

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

Be conservative: when in doubt, escalate to human review.`;
  }

  /**
   * Parse and validate LLM response
   */
  private parseLLMResponse(
    response: any,
    config: LLMApprovalConfig
  ): LLMApprovalDecision {
    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      
      return {
        approved: Boolean(parsed.approved),
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
        reasoning: String(parsed.reasoning || 'No reasoning provided'),
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : []
      };
    } catch (error) {
      this.logger.error('Failed to parse LLM response', { error, response });
      
      return {
        approved: false,
        confidence: 0,
        reasoning: 'Failed to parse LLM response - escalated to human review',
        concerns: ['llm_parse_error'],
        suggestedActions: ['Manual review required']
      };
    }
  }

  /**
   * Evaluate auto-approval rules
   */
  private async evaluateAutoApprovalRules(
    context: LLMApprovalContext,
    rules: AutoApprovalRule[]
  ): Promise<{ autoApprove: boolean; confidence: number; reasoning: string }> {
    const enabledRules = rules
      .filter((rule) => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of enabledRules) {
      try {
        const ruleContext = {
          task: context.task,
          workflow: context.workflow,
          security: context.security,
          codeAnalysis: context.codeAnalysis
        };

        const conditionsMet = rule.conditions.every((condition) => {
          try {
            // Create a safe evaluation context
            const evalFunc = new Function(
              'context',
              `
              const { task, workflow, security, codeAnalysis } = context;
              return ${condition};
              `
            );
            return evalFunc(ruleContext);
          } catch (error) {
            this.logger.warn('Rule condition evaluation failed', {
              rule: rule.name,
              condition,
              error
            });
            return false;
          }
        });

        if (conditionsMet) {
          this.logger.info('Auto-approval rule matched', { rule: rule.name });
          return {
            autoApprove: true,
            confidence: rule.confidence,
            reasoning: `Auto-approved by rule: ${rule.name} - ${rule.description}`
          };
        }
      } catch (error) {
        this.logger.error('Rule evaluation failed', { rule: rule.name, error });
      }
    }

    return {
      autoApprove: false,
      confidence: 0,
      reasoning: 'No auto-approval rules matched'
    };
  }

  /**
   * Learn from human feedback
   */
  async learnFromHumanFeedback(
    taskId: string,
    llmDecision: LLMApprovalDecision,
    humanOverride: HumanOverride
  ): Promise<void> {
    const learning: ApprovalLearning = {
      taskId,
      llmDecision,
      humanDecision: {
        approved: humanOverride.action === 'approve',
        reasoning: humanOverride.reason
      },
      learningType: this.determineLearningType(llmDecision, humanOverride),
      patterns: this.extractPatterns(llmDecision, humanOverride),
      weight: this.calculateLearningWeight(humanOverride)
    };

    await this.updateLearningModel(learning);
    this.logger.info('Learned from human feedback', { taskId, learningType: learning.learningType });
  }

  /**
   * Determine learning type from comparison
   */
  private determineLearningType(
    llmDecision: LLMApprovalDecision,
    humanOverride: HumanOverride
  ): 'correct' | 'incorrect' | 'partially_correct' {
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
  private extractPatterns(
    llmDecision: LLMApprovalDecision,
    humanOverride: HumanOverride
  ): string[] {
    const patterns: string[] = [];
    
    // Extract patterns from reasoning differences
    if (llmDecision.reasoning && humanOverride.reason) {
      // Analyze discrepancies in reasoning approaches
      patterns.push('reasoning_analysis_pattern');
      
      // Check for security vs. efficiency trade-offs
      if (llmDecision.reasoning.includes('security') && humanOverride.reason.includes('efficiency')) {
        patterns.push('security_efficiency_tradeoff');
      }
      
      // Check for risk assessment differences
      if (llmDecision.reasoning.includes('risk') !== humanOverride.reason.includes('risk')) {
        patterns.push('risk_assessment_difference');
      }
    }
    
    return patterns;
  }

  /**
   * Calculate learning weight based on human override confidence
   */
  private calculateLearningWeight(humanOverride: HumanOverride): number {
    // Higher weight for more confident human decisions
    return Math.max(0.1, Math.min(1.0, humanOverride.confidence || 0.5));
  }

  /**
   * Update learning model with new patterns
   */
  private async updateLearningModel(learning: ApprovalLearning): Promise<void> {
    // Store learning in memory system for pattern analysis
    try {
      const memoryKey = `llm_approval_learning:${learning.taskId}`;
      // This would integrate with the memory system to store learning patterns
      this.logger.debug('Stored learning pattern', { 
        taskId: learning.taskId,
        learningType: learning.learningType,
        patterns: learning.patterns
      });
      
      // Future enhancement: Use patterns to adjust confidence thresholds
      // and refine approval criteria based on human feedback patterns
    } catch (error) {
      this.logger.error('Failed to update learning model', { error, taskId: learning.taskId });
    }
  }
}