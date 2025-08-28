/**
 * @fileoverview LLM Approval Service
 *
 * Intelligent auto-approval system using claude-zen intelligence facade
 */
import { getLogger} from '@claude-zen/foundation')import { getBrainSystem} from '@claude-zen/intelligence')import {';
  type ApprovalLearning,
  AutoApprovalRule,
  type LLMApprovalConfig,
  type LLMApprovalContext,
  type LLMApprovalResult,
} from '../types/llm-approval.js')export class LLMApprovalService {';
  private readonly logger = getLogger('LLMApprovalService');
  async initialize():Promise<void> {
    this.brainSystem = await getBrainSystem();')    this.logger.info('LLM Approval Service initialized');`;
}
  /**
   * Evaluate a task for auto-approval using LLM
   */
  async evaluateForApproval(
    context: Date.now();
    const __gateId = `gate_`${context.task.id}_${Date.now()})    try {`;
      this.logger.info(`Starting LLM approval evaluation,{`;
        taskId: this.evaluateAutoApprovalRules(context, rules);
      if (ruleResult.autoApprove) {
        return {
          gateId,
          taskId: ')',model : 'rule-based,'
'              processingTime: await this.getLLMDecision(context, config);
      // Determine if auto-approval threshold is met
      const autoApproved =
        llmDecision.approved &&;
        llmDecision.confidence >= config.confidenceThreshold;
      const escalatedToHuman = !autoApproved|| llmDecision.concerns.length > 0;
      if (autoApproved) {
    ')        this.logger.info('LLM auto-approved task,{';
          taskId: 'LLM evaluation failed - escalated to human review',)          concerns:['llm_error,' requires_human_review'],';
          suggestedActions: this.buildApprovalPrompt(context, config);
    const response = await this.brainSystem.query({
      prompt,
      model: context;')    return You are an intelligent task approval system. Analyze this task and decide whether to approve it based on the criteria.`)TASK DETAILS: `)`${c}onfig.criteria.map((criterion) => ``- ${criterion}).join(``,\n');
HISTORICAL CONTEXT = `)`Similar tasks: ${h}istory.similarTasks.length(${h}istory.similarTasks.filter((t) => t.decision ===``,approved').lengthapproved)';
INSTRUCTIONS: 1. Analyze the task against the approval criteria
2. Consider security implications and risk level
3. Review code changes if applicable
4. Check for patterns in historical decisions
5. Provide a decision with confidence level (0.0-1.0)
Respond in JSON 
  "approved":boolean,";
  "confidence":number,";
  "reasoning":"Detailed explanation of decision",";
  "concerns":["array", "of", "specific", "concerns"],";
  "suggestedActions":["array", "of", "suggested", "actions];;
Base your decision on: - Security and compliance requirements
- Code quality and testing standards
- Task complexity and risk assessment
- Historical approval patterns
- Workflow stage appropriateness
Be conservative: when in doubt, escalate to human review.')};;
  /**
   * Parse and validate LLM response
   */
  private parseLLMResponse(
    response: any,
    config: LLMApprovalConfig
  ):LLMApprovalDecision {
    try {
    ')      const parsed  = ''; )        typeof response ==='string'? JSON.parse(response) :response')      return {';
        approved: 'Failed to parse LLM response - escalated to human review',)        concerns: rules
      .filter((rule) => rule.enabled);
      .sort((a, b) => b.priority - a.priority);
    for (const rule of sortedRules) {
      try {
        const ruleContext = {
          task: rule.conditions.every((condition) => {
          try {
            // Create a safe evaluation context
            const evalFunc = new Function(
             'context,');
              `)              const { task, workflow, security, codeAnalysis} = context;`;
              return ${c}ondition;``)            ')            );
            return evalFunc(ruleContext);
} catch (error) {
    ')            this.logger.warn('Rule condition evaluation failed,{';
              rule: {
      taskId,
      llmDecision,
      humanDecision: {
    ')        approved: humanOverride.action ==='approve,';
        reasoning: llmDecision.approved;
    const humanApproved = humanOverride.action === 'approve')    if (llmApproved === humanApproved) {';
      return llmDecision.confidence > 0.8 ?'correct : ' partially_correct')} else {';
      return'incorrect')};;
}
  private calculateLearningWeight(humanOverride: [];
    // Extract patterns from reasoning differences
    if (llmDecision.reasoning && humanOverride.reason) {
      // TODO: Implement pattern extraction logic
      patterns.push('reasoning_mismatch');
}
    return patterns;
}
  private async updateLearningModel(learning: ApprovalLearning): Promise<void>  {
    // TODO: Implement model update logic')    // This would update the LLM's understanding based on human feedback')    this.logger.debug('Updated learning model,{ taskId: learning.taskId};);
};)};;
)`;