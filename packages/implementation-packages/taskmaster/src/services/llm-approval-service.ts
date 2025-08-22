/**
 * @fileoverview LLM Approval Service
 * 
 * Intelligent auto-approval system using claude-zen intelligence facade
 */

import { getLogger } from '@claude-zen/foundation';
import { getBrainSystem } from '@claude-zen/intelligence';
import { 
  LLMApprovalConfig, 
  LLMApprovalDecision, 
  LLMApprovalContext,
  LLMApprovalResult,
  AutoApprovalRule,
  ApprovalLearning,
  LLMApprovalMetrics,
  HumanOverride
} from '../types/llm-approval.js';

export class LLMApprovalService {
  private readonly logger = getLogger('LLMApprovalService');
  private brainSystem: any;
  private learningData: ApprovalLearning[] = [];

  async initialize(): Promise<void> {
    this.brainSystem = await getBrainSystem();
    this.logger.info('LLM Approval Service initialized');
  }

  /**
   * Evaluate a task for auto-approval using LLM
   */
  async evaluateForApproval(
    context: LLMApprovalContext,
    config: LLMApprovalConfig,
    rules: AutoApprovalRule[]
  ): Promise<LLMApprovalResult> {
    const startTime = Date.now();
    const gateId = `gate_${context.task.id}_${Date.now()}`;

    try {
      this.logger.info('Starting LLM approval evaluation', { 
        taskId: context.task.id, 
        gateId,
        model: config.model 
      });

      // Check auto-approval rules first (fast path)
      const ruleResult = this.evaluateAutoApprovalRules(context, rules);
      if (ruleResult.autoApprove) {
        return {
          gateId,
          taskId: context.task.id,
          decision: {
            approved: true,
            confidence: 1.0,
            reasoning: `Auto-approved by rule: ${ruleResult.rule!.name}`,
            concerns: [],
            suggestedActions: [],
            metadata: {
              model: 'rule-based',
              processingTime: Date.now() - startTime,
              tokenUsage: 0,
              version: '1.0.0'
            }
          },
          autoApproved: true,
          escalatedToHuman: false,
          rule: ruleResult.rule,
          processingTime: Date.now() - startTime,
          timestamp: new Date()
        };
      }

      // Use LLM for complex decision making
      const llmDecision = await this.getLLMDecision(context, config);

      // Determine if auto-approval threshold is met
      const autoApproved = llmDecision.approved && 
                          llmDecision.confidence >= config.confidenceThreshold;
      
      const escalatedToHuman = !autoApproved || llmDecision.concerns.length > 0;

      if (autoApproved) {
        this.logger.info('LLM auto-approved task', {
          taskId: context.task.id,
          confidence: llmDecision.confidence,
          reasoning: llmDecision.reasoning
        });
      } else {
        this.logger.info('LLM escalated task to human review', {
          taskId: context.task.id,
          confidence: llmDecision.confidence,
          concerns: llmDecision.concerns
        });
      }

      return {
        gateId,
        taskId: context.task.id,
        decision: llmDecision,
        autoApproved,
        escalatedToHuman,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };

    } catch (error) {
      this.logger.error('LLM approval evaluation failed', error, { 
        taskId: context.task.id,
        gateId 
      });

      // Fail safe: escalate to human on any error
      return {
        gateId,
        taskId: context.task.id,
        decision: {
          approved: false,
          confidence: 0.0,
          reasoning: 'LLM evaluation failed - escalated to human review',
          concerns: ['llm_error', 'requires_human_review'],
          suggestedActions: ['Review task manually', 'Check LLM service status'],
          metadata: {
            model: config.model,
            processingTime: Date.now() - startTime,
            tokenUsage: 0,
            version: '1.0.0'
          }
        },
        autoApproved: false,
        escalatedToHuman: true,
        processingTime: Date.now() - startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get LLM decision using intelligence facade
   */
  private async getLLMDecision(
    context: LLMApprovalContext,
    config: LLMApprovalConfig
  ): Promise<LLMApprovalDecision> {
    
    const prompt = this.buildApprovalPrompt(context, config);
    
    const response = await this.brainSystem.query({
      prompt,
      model: config.model,
      maxTokens: 1000,
      temperature: 0.1, // Low temperature for consistent decisions
      timeout: config.timeout
    });

    // Parse LLM response
    return this.parseLLMResponse(response, config);
  }

  /**
   * Build comprehensive approval prompt
   */
  private buildApprovalPrompt(context: LLMApprovalContext, config: LLMApprovalConfig): string {
    const { task, workflow, history, security, codeAnalysis } = context;

    return `You are an intelligent task approval system. Analyze this task and decide whether to approve it based on the criteria.

TASK DETAILS:
- ID: ${task.id}
- Title: ${task.title}
- Description: ${task.description || 'None'}
- Type: ${task.type}
- Complexity: ${task.complexity}
- Priority: ${task.priority}
- Tags: ${task.tags.join(', ')}
- Dependencies: ${task.dependencies.length} dependencies

WORKFLOW CONTEXT:
- Workflow: ${workflow.name}
- Current State: ${workflow.currentState}
- Previous States: ${workflow.previousStates.join(' → ')}

SECURITY ANALYSIS:
- Has Secrets: ${security.hasSecrets}
- Risk Level: ${security.riskLevel}
- Affected Systems: ${security.affectedSystems.join(', ')}
- Compliance Flags: ${security.complianceFlags.join(', ')}

${codeAnalysis ? `
CODE ANALYSIS:
- Files Changed: ${codeAnalysis.changedFiles.length}
- Lines Added: ${codeAnalysis.linesAdded}
- Lines Deleted: ${codeAnalysis.linesDeleted}
- Test Coverage: ${codeAnalysis.testCoverage}%
` : ''}

APPROVAL CRITERIA:
${config.criteria.map(criterion => `- ${criterion}`).join('\n')}

HISTORICAL CONTEXT:
Similar tasks: ${history.similarTasks.length} (${history.similarTasks.filter(t => t.decision === 'approved').length} approved)

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
  private parseLLMResponse(response: any, config: LLMApprovalConfig): LLMApprovalDecision {
    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      
      return {
        approved: Boolean(parsed.approved),
        confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0)),
        reasoning: String(parsed.reasoning || 'No reasoning provided'),
        concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
        suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions : [],
        metadata: {
          model: config.model,
          processingTime: 0, // Will be filled by caller
          tokenUsage: response.tokenUsage || 0,
          version: '1.0.0'
        }
      };
    } catch (error) {
      this.logger.error('Failed to parse LLM response', error);
      
      // Return safe default
      return {
        approved: false,
        confidence: 0.0,
        reasoning: 'Failed to parse LLM response - escalated to human review',
        concerns: ['parse_error'],
        suggestedActions: ['Review manually'],
        metadata: {
          model: config.model,
          processingTime: 0,
          tokenUsage: 0,
          version: '1.0.0'
        }
      };
    }
  }

  /**
   * Evaluate auto-approval rules (fast path)
   */
  private evaluateAutoApprovalRules(
    context: LLMApprovalContext,
    rules: AutoApprovalRule[]
  ): { autoApprove: boolean; rule?: AutoApprovalRule } {
    
    // Sort by priority (higher first)
    const sortedRules = rules
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of sortedRules) {
      try {
        const ruleContext = {
          task: context.task,
          workflow: context.workflow,
          security: context.security,
          codeAnalysis: context.codeAnalysis
        };

        // Evaluate all conditions for this rule
        const allConditionsMet = rule.conditions.every(condition => {
          try {
            // Create a safe evaluation context
            const evalFunc = new Function('context', `
              const { task, workflow, security, codeAnalysis } = context;
              return ${condition};
            `);
            
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

        if (allConditionsMet) {
          this.logger.info('Auto-approval rule matched', { 
            taskId: context.task.id,
            rule: rule.name 
          });
          
          return { autoApprove: true, rule };
        }
      } catch (error) {
        this.logger.error('Rule evaluation error', error, { rule: rule.name });
      }
    }

    return { autoApprove: false };
  }

  /**
   * Learn from human override decisions
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
        reasoning: humanOverride.reason,
        userId: humanOverride.userId
      },
      feedback: this.determineFeedbackType(llmDecision, humanOverride),
      learningWeight: this.calculateLearningWeight(humanOverride),
      patterns: this.extractLearningPatterns(llmDecision, humanOverride)
    };

    this.learningData.push(learning);
    
    this.logger.info('Learning from human feedback', {
      taskId,
      feedback: learning.feedback,
      patterns: learning.patterns
    });

    // TODO: Update ML model weights based on feedback
    await this.updateLearningModel(learning);
  }

  /**
   * Get approval metrics and analytics
   */
  getApprovalMetrics(): LLMApprovalMetrics {
    // TODO: Implement metrics calculation from stored decisions
    return {
      totalDecisions: 0,
      autoApprovals: 0,
      humanEscalations: 0,
      accuracyRate: 0,
      averageConfidence: 0,
      averageProcessingTime: 0,
      commonReasons: [],
      improvementTrends: {
        accuracyOverTime: [],
        confidenceOverTime: []
      }
    };
  }

  private determineFeedbackType(
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

  private calculateLearningWeight(humanOverride: HumanOverride): number {
    // Higher weight for more confident human decisions
    return Math.max(0.1, Math.min(1.0, humanOverride.confidence));
  }

  private extractLearningPatterns(
    llmDecision: LLMApprovalDecision,
    humanOverride: HumanOverride
  ): string[] {
    const patterns: string[] = [];
    
    // Extract patterns from reasoning differences
    if (llmDecision.reasoning && humanOverride.reason) {
      // TODO: Implement pattern extraction logic
      patterns.push('reasoning_mismatch');
    }

    return patterns;
  }

  private async updateLearningModel(learning: ApprovalLearning): Promise<void> {
    // TODO: Implement model update logic
    // This would update the LLM's understanding based on human feedback
    this.logger.debug('Updated learning model', { taskId: learning.taskId });
  }
}