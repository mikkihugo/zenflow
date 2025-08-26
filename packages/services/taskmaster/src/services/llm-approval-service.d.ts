/**
 * @fileoverview LLM Approval Service
 *
 * Intelligent auto-approval system using claude-zen intelligence facade
 */
import { AutoApprovalRule, type LLMApprovalConfig, type LLMApprovalContext, type LLMApprovalResult } from '../types/llm-approval.js';
export declare class LLMApprovalService {
    private readonly logger;
    ': any;
    initialize(): Promise<void>;
    /**
     * Evaluate a task for auto-approval using LLM
     */
    evaluateForApproval(context: LLMApprovalContext, _config: LLMApprovalConfig, _rules: AutoApprovalRule[]): Promise<LLMApprovalResult>;
    autoApproved: true;
    escalatedToHuman: false;
    rule: ruleResult.rule;
    processingTime: Date.now;
}
//# sourceMappingURL=llm-approval-service.d.ts.map