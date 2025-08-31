/**
 * @fileoverview LLM Auto-Approval System Types
 *
 * Types for LLM-powered intelligent auto-approval gates
 */
export interface LLMApprovalConfig {
  enabled: boolean;
  model : 'claude-3-5-sonnet' | ' claude-3-haiku'|' claude-3-opus')pending' | ' llm_analyzing'|' auto_approved' | ' human_review'|' approved' | ' rejected'|' escalated' | ' timed_out'|' cancelled')approve| reject| escalate' | ' override_llm')approved' | ' rejected')low| medium| high' | ' critical')correct' | ' incorrect'|' partially_correct');
  patterns: string[]; // Extracted patterns for future learning
}
export interface LLMApprovalMetrics {
  totalDecisions: number;
  autoApprovals: number;
  humanEscalations: number;
  accuracyRate: number; // Compared to human decisions
  averageConfidence: number;
  averageProcessingTime: number;
  commonReasons: Array<{
    reason: string;
    count: number;
    successRate: number;
}>;
  improvementTrends:  {
    accuracyOverTime: Array<{ date: Date, accuracy: number}>;
    confidenceOverTime: Array<{ date: Date, confidence: number}>;
};
};