/**
 * @fileoverview LLM Auto-Approval System Types
 *
 * Types for LLM-powered intelligent auto-approval gates
 */

export interface LLMApprovalConfig {
  enabled: boolean;
  model: 'claude-3-5-sonnet''' | '''claude-3-haiku''' | '''claude-3-opus';
  prompt: string;
  criteria: string[];
  confidenceThreshold: number; // 0.0 - 1.0
  maxRetries: number;
  timeout: number; // milliseconds
}

export interface LLMApprovalDecision {
  approved: boolean;
  confidence: number; // 0.0 - 1.0
  reasoning: string;
  concerns: string[];
  suggestedActions: string[];
  metadata: {
    model: string;
    processingTime: number;
    tokenUsage: number;
    version: string;
  };
}

export interface AutoApprovalRule {
  id: string;
  name: string;
  description: string;
  conditions: string[]; // JavaScript expressions
  priority: number; // Higher priority rules evaluated first
  enabled: boolean;
  tags: string[];
}

export interface EnhancedApprovalGate {
  id: string;
  name: string;
  description?: string;
  taskId: string;

  // Human approval configuration
  requiredApprovers: string[];
  minimumApprovals: number;
  isRequired: boolean;
  timeoutHours?: number;

  // LLM auto-approval configuration
  llmApprover?: LLMApprovalConfig;
  autoApprovalRules: AutoApprovalRule[];

  // Fallback and override settings
  humanFallback: boolean;
  allowHumanOverride: boolean;
  escalationConditions: string[];

  // State and audit
  state:'' | '''pending | llm_analyzing' | 'auto_approved''' | '''human_review | approved' | 'rejected''' | '''escalated | timed_out' | 'cancelled';
  llmDecisions: LLMApprovalDecision[];
  humanOverrides: HumanOverride[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  timeoutAt?: Date;
  completedAt?: Date;

  // Metadata
  metadata: Record<string, unknown>;
  tenantId?: string;
}

export interface HumanOverride {
  id: string;
  userId: string;
  action: 'approve | reject' | 'escalate''' | '''override_llm';
  reason: string;
  previousLLMDecision?: LLMApprovalDecision;
  timestamp: Date;
  confidence: number;
  metadata: Record<string, unknown>;
}

export interface LLMApprovalContext {
  task: {
    id: string;
    title: string;
    description?: string;
    type: string;
    complexity: string;
    priority: string;
    tags: string[];
    assignee?: string;
    dependencies: string[];
    customData: Record<string, unknown>;
  };
  workflow: {
    id: string;
    name: string;
    currentState: string;
    previousStates: string[];
  };
  history: {
    similarTasks: Array<{
      taskId: string;
      decision: 'approved''' | '''rejected';
      confidence: number;
      reasoning: string;
    }>;
    userPatterns: {
      userId: string;
      approvalRate: number;
      commonCriteria: string[];
    };
  };
  security: {
    hasSecrets: boolean;
    affectedSystems: string[];
    riskLevel: 'low | medium' | 'high''' | '''critical';
    complianceFlags: string[];
  };
  codeAnalysis?: {
    changedFiles: string[];
    linesAdded: number;
    linesDeleted: number;
    testCoverage: number;
    securityScan: any;
    dependencies: any;
  };
}

export interface LLMApprovalResult {
  gateId: string;
  taskId: string;
  decision: LLMApprovalDecision;
  autoApproved: boolean;
  escalatedToHuman: boolean;
  rule?: AutoApprovalRule;
  processingTime: number;
  timestamp: Date;
}

export interface ApprovalLearning {
  taskId: string;
  llmDecision: LLMApprovalDecision;
  humanDecision: {
    approved: boolean;
    reasoning: string;
    userId: string;
  };
  feedback: 'correct | incorrect' | 'partially_correct';
  learningWeight: number; // How much this feedback affects future decisions
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
  improvementTrends: {
    accuracyOverTime: Array<{ date: Date; accuracy: number }>;
    confidenceOverTime: Array<{ date: Date; confidence: number }>;
  };
}
