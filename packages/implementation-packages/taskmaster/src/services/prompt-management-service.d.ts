/**
 * @fileoverview SOC2-Compliant Prompt Management Service
 *
 * Enterprise-grade prompt versioning and management with:
 * - Database-backed prompt storage with full audit trails
 * - SOC2 compliance features (access control, audit logging)
 * - Prompt versioning, variants, drafts, and history
 * - Integration with teamwork package for collaborative editing
 * - Integration with workflow package for approval workflows
 * - A/B testing and performance tracking
 */
export interface PromptVersion {
  id: string;
  promptId: string;
  version: string;
  content: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  status: 'draft|review|approved|deprecated|archived';
  performance: {
    usageCount: number;
    successRate: number;
    averageConfidence: number;
    humanOverrideRate: number;
  };
  config: {
    model: string;
    temperature: number;
    maxTokens: number;
    criteria: string[];
    confidenceThreshold: number;
  };
  tags: string[];
  metadata: Record<string, unknown>;
}
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  gateType: string;
  activeVersionId: string;
  versions: PromptVersion[];
  variants: PromptVariant[];
  accessControl: {
    owners: string[];
    editors: string[];
    viewers: string[];
    approvers: string[];
  };
  auditLog: PromptAuditEntry[];
  teamworkConfig?: {
    collaborationEnabled: boolean;
    reviewWorkflowId?: string;
    approvalWorkflowId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  tenantId?: string;
}
export interface PromptVariant {
  id: string;
  name: string;
  versionId: string;
  trafficAllocation: number;
  metrics: {
    requests: number;
    approvals: number;
    rejections: number;
    humanOverrides: number;
    averageProcessingTime: number;
  };
  isActive: boolean;
  createdAt: Date;
}
export interface PromptAuditEntry {
  id: string;
  promptId: string;
  action:|'created|updated|approved|deployed|deprecated|accessed|variant_created'';
  userId: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  changes?: {
    field: string;
    oldValue: unknown;
    newValue: unknown;
  }[];
  reason?: string;
  approvalReference?: string;
  riskAssessment?: 'low|medium|high';
  metadata: Record<string, unknown>;
}
export interface PromptDraft {
  id: string;
  promptId: string;
  authorId: string;
  title: string;
  content: string;
  config: PromptVersion['config'];
  collaborators: string[];
  comments: DraftComment[];
  reviewStatus: 'pending|in_review|approved|rejected';
  workflowInstanceId?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}
export interface DraftComment {
  id: string;
  authorId: string;
  content: string;
  timestamp: Date;
  resolved: boolean;
  metadata: Record<string, unknown>;
}
export declare class PromptManagementService {
  private readonly logger;
  private database;
  private teamworkSystem;
  private workflowEngine;
  initialize(): Promise<void>;
  /**
   * Create a new prompt template with SOC2 audit trail
   */
  createPromptTemplate(
    data: {
      name: string;
      description: string;
      gateType: string;
      content: string;
      config: PromptVersion['config'];
      owners: string[];
      editors?: string[];
      viewers?: string[];
      approvers?: string[];
    },
    createdBy: string,
    auditContext: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    }
  ): Promise<PromptTemplate>;
  /**
   * Create a new version with approval workflow
   */
  createPromptVersion(
    promptId: string,
    data: {
      content: string;
      description: string;
      config?: Partial<PromptVersion['config']>;
      tags?: string[];
    },
    createdBy: string,
    auditContext: any
  ): Promise<PromptVersion>;
  /**
   * Create prompt variant for A/B testing
   */
  createPromptVariant(
    promptId: string,
    versionId: string,
    data: {
      name: string;
      trafficAllocation: number;
    },
    createdBy: string,
    auditContext: any
  ): Promise<PromptVariant>;
  /**
   * Create collaborative draft with teamwork integration
   */
  createDraft(
    promptId: string,
    data: {
      title: string;
      content: string;
      config?: Partial<PromptVersion['config']>;
      collaborators?: string[];
    },
    authorId: string
  ): Promise<PromptDraft>;
  /**
   * Approve prompt version with SOC2 audit trail
   */
  approvePromptVersion(
    promptId: string,
    versionId: string,
    approvedBy: string,
    auditContext: any,
    approvalData: {
      reason: string;
      riskAssessment: 'low|medium|high';
      approvalReference?: string;
    }
  ): Promise<void>;
  /**
   * Get prompt for approval gate with variant selection
   */
  getPromptForGate(
    gateType: string,
    context: any
  ): Promise<{
    version: PromptVersion;
    variant?: PromptVariant;
  }>;
  /**
   * Track prompt performance for continuous improvement
   */
  trackPromptPerformance(
    versionId: string,
    result: {
      success: boolean;
      confidence: number;
      humanOverride: boolean;
      processingTime: number;
    },
    variantId?: string
  ): Promise<void>;
  private checkPermission;
  private generateNextVersion;
  private selectVariant;
  private createAuditEntry;
  private enableTeamworkCollaboration;
  private startApprovalWorkflow;
  private createTables;
  private storePromptTemplate;
  private updatePromptTemplate;
  private getPromptTemplate;
  private getPromptTemplatesByGateType;
  private getPromptTemplateByVersionId;
  private storeAuditEntry;
  private storeDraft;
  private trackVariantUsage;
}
