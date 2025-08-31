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
  private readonly logger = getLogger('LLMApprovalService');
  private brainSystem: any;
  private autoApprovalRules: AutoApprovalRule[] = [];

  async initialize(Promise<void> {
    this.brainSystem = await getBrainSystem();
    await this.loadAutoApprovalRules();
    this.logger.info('LLM Approval Service initialized');
  }

  /**
   * Evaluate a task for auto-approval using LLM
   */
  async evaluateForApproval(Promise<LLMApprovalResult> {
    const startTime = Date.now();
    const gateId = "gate_${context.task.id}_${Date.now()}";"

    try {
      this.logger.info('Starting LLM approval evaluation', {
        taskId: context.task.id,
        gateId,
      });

      // First, check auto-approval rules
      const ruleResult = this.evaluateAutoApprovalRules(context, rules);
      if (ruleResult.autoApprove) {
        return {
          gateId,
          taskId: context.task.id,
          decision: " + JSON.stringify({
            approved: true,
            confidence: ruleResult.confidence,
            reasoning: `Auto-approved by rule: ${ruleResult.rule?.name}) + "","
            model: 'rule-based',
            processingTime: Date.now() - startTime,
            tokenUsage: 0,
            version: 'rules-v1.0.0',
          },
          autoApproved: true,
          escalatedToHuman: false,
          processingTime: Date.now() - startTime,
        };
      }

      // Get LLM decision
      const llmDecision = await this.getLLMDecision(context, config);

      // Determine if auto-approval threshold is met
      const autoApproved =
        llmDecision.approved &&
        llmDecision.confidence >= config.confidenceThreshold;
      const escalatedToHuman = !autoApproved || llmDecision.concerns.length > 0;

      if (autoApproved) {
        this.logger.info('LLM auto-approved task', {
          taskId: context.task.id,
          confidence: llmDecision.confidence,
        });
      }

      return {
        gateId,
        taskId: context.task.id,
        decision: {
          approved: llmDecision.approved,
          confidence: llmDecision.confidence,
          reasoning: llmDecision.reasoning,
          model: config.model || 'claude-3-5-sonnet',
          processingTime: Date.now() - startTime,
          tokenUsage: 0, // Would be populated by actual LLM call
          version: 'llm-v1.0.0',
        },
        autoApproved,
        escalatedToHuman,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error('LLM evaluation failed', {
        taskId: context.task.id,
        error,
      });

      return {
        gateId,
        taskId: context.task.id,
        decision: {
          approved: false,
          confidence: 0,
          reasoning: 'LLM evaluation failed - escalated to human review',
          model: 'error-fallback',
          processingTime: Date.now() - startTime,
          tokenUsage: 0,
          version: 'error-v1.0.0',
        },
        autoApproved: false,
        escalatedToHuman: true,
        processingTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Get LLM decision for the approval context
   */
  private async getLLMDecision(Promise<LLMApprovalDecision> {
    const prompt = this.buildApprovalPrompt(context, config);
    const response = await this.brainSystem.query({
      prompt,
      model: config.model || 'claude-3-5-sonnet',
      maxTokens: 1000,
      temperature: 0.1, // Low temperature for consistent decisions
    });

    return this.parseLLMResponse(response, config);
  }

  /**
   * Build the approval prompt for LLM evaluation
   */
  private buildApprovalPrompt(
    context: LLMApprovalContext,
    config: LLMApprovalConfig
  ): string {
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
${config.criteria.map((criterion) => "- ${criterion}").join('\n')}"

WORKFLOW CONTEXT:
- Current Stage: ${workflow.currentStage}
- Previous Stages: ${workflow.previousStages.join(' → ')}
- Dependencies: ${workflow.dependencies.join(', ')}

SECURITY ASSESSMENT:
- Risk Level: ${security.riskLevel}
- Compliance Required: ${security.complianceRequired}
- Security Scan Status: ${security.scanStatus}

${
  codeAnalysis
    ? "CODE ANALYSIS:"
- Files Changed: ${codeAnalysis.filesChanged}
- Lines Added: ${codeAnalysis.linesAdded}
- Lines Removed: ${codeAnalysis.linesRemoved}
- Test Coverage: ${codeAnalysis.testCoverage}%
- Quality Score: ${codeAnalysis.qualityScore}%""
    : ''
}

HISTORICAL CONTEXT:
- Similar tasks: ${history.similarTasks.length}
- Success rate: ${history.similarTasks.filter((t) => t.decision === 'approved').length}/${history.similarTasks.length} approved

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
  private parseLLMResponse(
    response: any,
    config: LLMApprovalConfig
  ): LLMApprovalDecision {
    try {
      const parsed =
        typeof response === 'string' ? JSON.parse(response) : response;

      return {
        approved: Boolean(parsed.approved),
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
        reasoning: String(parsed.reasoning || ''),
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        suggestedActions: Array.isArray(parsed.suggestedActions)
          ? parsed.suggestedActions
          : [],
      };
    } catch (error) {
      this.logger.error('Failed to parse LLM response', { error, response });
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
  private evaluateAutoApprovalRules(
    context: LLMApprovalContext,
    rules: AutoApprovalRule[]
  ): RuleEvaluationResult {
    const sortedRules = rules
      .filter((rule) => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      try {
        const ruleContext = {
          task: context.task,
          workflow: context.workflow,
          security: context.security,
          codeAnalysis: context.codeAnalysis,
        };

        const ruleMatches = rule.conditions.every((condition) => {
          try {
            // Create a safe evaluation context
            const evalFunc = new Function(
              'context'"
              const { task, workflow, security, codeAnalysis } = context;
              return ${condition};
              ""
            );
            return evalFunc(ruleContext);
          } catch (error) {
            this.logger.warn('Rule condition evaluation failed', {
              rule: rule.name,
              condition,
              error,
            });
            return false;
          }
        });

        if (ruleMatches) {
          this.logger.info('Auto-approval rule matched', { rule: rule.name });
          return {
            autoApprove: true,
            rule,
            confidence: rule.confidence,
          };
        }
      } catch (error) {
        this.logger.error('Rule evaluation failed', { rule: rule.name, error });
      }
    }

    return {
      autoApprove: false,
      confidence: 0,
    };
  }

  /**
   * Learn from human override decisions
   */
  async learnFromHumanDecision(Promise<void> {
    const learning: ApprovalLearning = {
      taskId,
      llmDecision: {
        approved: llmDecision.approved,
        reasoning: llmDecision.reasoning,
      },
      humanDecision: {
        approved: humanOverride.action === 'approve',
        reasoning: humanOverride.reason,
      },
      patterns: this.extractLearningPatterns(llmDecision, humanOverride),
      confidence: this.calculateLearningWeight(humanOverride),
      timestamp: new Date(),
    };

    await this.updateLearningModel(learning);
  }

  /**
   * Calculate learning confidence based on human decision
   */
  private calculateLearningConfidence(
    llmDecision: LLMApprovalDecision,
    humanOverride: HumanOverride
  ): 'correct' | 'partially_correct' | 'incorrect' {
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
  private calculateLearningWeight(humanOverride: HumanOverride): number {
    // Higher weight for well-reasoned decisions with adequate review time
    const baseWeight = 0.5;
    const reasoningWeight = humanOverride.reason.length > 50 ? 0.3 : 0.1;
    const timeWeight = humanOverride.reviewTime > 300 ? 0.2 : 0.1; // 5+ minutes

    return Math.min(1.0, baseWeight + reasoningWeight + timeWeight);
  }

  /**
   * Extract learning patterns from decision differences
   */
  private extractLearningPatterns(
    llmDecision: LLMApprovalDecision,
    humanOverride: HumanOverride
  ): string[] {
    const patterns: string[] = [];

    // Extract patterns from reasoning differences
    if (llmDecision.reasoning && humanOverride.reason) {
      if (humanOverride.reason.toLowerCase().includes('security')) {
        patterns.push('security_concern');
      }
      if (humanOverride.reason.toLowerCase().includes('complex')) {
        patterns.push('complexity_underestimated');
      }
      if (humanOverride.reason.toLowerCase().includes('risk')) {
        patterns.push('risk_assessment_mismatch');
      }
      if (llmDecision.approved !== (humanOverride.action === 'approve')) {
        patterns.push('reasoning_mismatch');
      }
    }

    return patterns;
  }

  /**
   * Update learning model based on human feedback
   */
  private async updateLearningModel(Promise<void> {
    try {
      // Store learning pattern in brain system
      await this.brainSystem.learnFromFeedback({
        taskId: learning.taskId,
        patterns: learning.patterns,
        confidence: learning.confidence,
        humanFeedback: learning.humanDecision,
        aiPrediction: learning.llmDecision,
        timestamp: new Date(),
      });

      // Update auto-approval rules based on learning
      await this.updateAutoApprovalRules(learning);

      this.logger.info('Learning model updated successfully', {
        taskId: learning.taskId,
        patterns: learning.patterns.length,
        confidence: learning.confidence,
      });
    } catch (error) {
      this.logger.error('Failed to update learning model', {
        taskId: learning.taskId,
        error,
      });
    }
  }

  /**
   * Update auto-approval rules based on learning patterns
   */
  private async updateAutoApprovalRules(Promise<void> {
    // Improve rule conditions based on learning patterns
    for (const pattern of learning.patterns) {
      if (pattern === 'reasoning_mismatch') {
        // Adjust confidence thresholds for similar tasks
        await this.adjustConfidenceThresholds(
          learning.taskId,
          learning.confidence
        );
      } else if (pattern === 'security_concern') {
        // Strengthen security-related rules
        await this.strengthenSecurityRules(learning);
      } else if (pattern === 'complexity_underestimated') {
        // Adjust complexity assessment algorithms
        await this.updateComplexityRules(learning);
      }
    }
  }

  /**
   * Adjust confidence thresholds based on learning
   */
  private async adjustConfidenceThresholds(Promise<void> {
    // Implementation would adjust thresholds in the brain system
    this.logger.debug('Adjusted confidence thresholds', {
      taskId,
      learnedConfidence,
    });
  }

  /**
   * Strengthen security rules based on feedback
   */
  private async strengthenSecurityRules(Promise<void> {
    // Implementation would update security validation rules
    this.logger.debug('Strengthened security rules', {
      taskId: learning.taskId,
    });
  }

  /**
   * Update complexity assessment rules
   */
  private async updateComplexityRules(Promise<void> {
    // Implementation would refine complexity detection algorithms
    this.logger.debug('Updated complexity rules', { taskId: learning.taskId });
  }

  /**
   * Load auto-approval rules from configuration
   */
  private async loadAutoApprovalRules(Promise<void> {
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

    this.logger.info('Loaded auto-approval rules', {
      count: this.autoApprovalRules.length,
    });
  }

  /**
   * Get current auto-approval rules
   */
  getAutoApprovalRules(): AutoApprovalRule[] {
    return [...this.autoApprovalRules];
  }

  /**
   * Add new auto-approval rule
   */
  addAutoApprovalRule(rule: AutoApprovalRule): void {
    this.autoApprovalRules.push(rule);
    this.logger.info('Added new auto-approval rule', { name: rule.name });
  }

  /**
   * Update existing auto-approval rule
   */
  updateAutoApprovalRule(
    ruleId: string,
    updates: Partial<AutoApprovalRule>
  ): void {
    const index = this.autoApprovalRules.findIndex((r) => r.id === ruleId);
    if (index >= 0) {
      this.autoApprovalRules[index] = {
        ...this.autoApprovalRules[index],
        ...updates,
      };
      this.logger.info('Updated auto-approval rule', { ruleId });
    }
  }

  /**
   * Remove auto-approval rule
   */
  removeAutoApprovalRule(ruleId: string): void {
    this.autoApprovalRules = this.autoApprovalRules.filter(
      (r) => r.id !== ruleId
    );
    this.logger.info('Removed auto-approval rule', { ruleId });
  }
}
