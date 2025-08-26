/**
 * @fileoverview SAFe 6.0 Framework Integration - TaskMaster as Universal Approval Gate Orchestrator
 *
 * Integrates TaskMaster's approval gate system with ALL SAFe 6.0 framework gates:'
 * - Epic Management Gates (Portfolio Kanban states)
 * - Continuous Delivery Gates (Quality, Security, Performance)
 * - ART Gates (Agile Release Train coordination)
 * - Cross-Framework Gates (SAFe-SPARC synchronization)
 * - Business Validation Gates (Stakeholder approvals)
 *
 * Uses SAFe 6.0 terminology: ART instead of Program, streamlined naming conventions.
 * Provides complete traceability, AGUI integration, SOC2 compliance, and learning.
 */
import { ApprovalGateManager } from '../core/approval-gate-manager.js';
import type { ApprovalGateId } from '../types/index.js';
import type { PortfolioKanbanState, EpicBusinessCase } from '@claude-zen/safe-framework';
/**
 * SAFe 6.0 gate categories that TaskMaster orchestrates
 */
export declare enum SafeGateCategory {
    EPIC_PORTFOLIO = "epic_portfolio",
    EPIC_LIFECYCLE = "epic_lifecycle",
    ART_COORDINATION = "art_coordination",
    QUALITY_ASSURANCE = "quality_assurance",
    SECURITY_COMPLIANCE = "security_compliance",
    PERFORMANCE_VALIDATION = "performance_validation",
    BUSINESS_VALIDATION = "business_validation",
    ARCHITECTURE_COMPLIANCE = "architecture_compliance",
    CROSS_FRAMEWORK_SYNC = "cross_framework_sync"
}
/**
 * Integration configuration for SAFe 6.0 gates
 */
export interface SafeIntegrationConfig {
    enabled: boolean;
    epicGates: {
        enablePortfolioKanban: boolean;
        enableLifecycleGates: boolean;
        autoApprovalThresholds: {
            funnel: number;
            analyzing: number;
            portfolioBacklog: number;
            implementing: number;
        };
    };
    qualityGates: {
        enableCodeQuality: boolean;
        enableSecurity: boolean;
        enablePerformance: boolean;
        enableArchitecture: boolean;
        llmAutoApproval: boolean;
        humanFallbackThreshold: number;
    };
    businessGates: {
        enableStakeholderApproval: boolean;
        enableComplianceReview: boolean;
        requireBusinessCase: boolean;
        escalationTimeoutHours: number;
    };
    learning: {
        enableContinuousLearning: boolean;
        trackDecisionPatterns: boolean;
        adaptPrompts: boolean;
        auditCompliance: 'basic|soc2|comprehensive;;
    };
}
/**
 * SAFE gate execution context
 */
export interface SafeGateContext {
    category: SafeGateCategory;
    safeEntity: {
        type: 'epic|feature|story|capability|solution;;
        id: string;
        metadata: Record<string, unknown>;
    };
    workflow: {
        currentState: string;
        targetState: string;
        previousStates: string[];
    };
    stakeholders: {
        owners: string[];
        approvers: string[];
        reviewers: string[];
    };
    compliance: {
        required: boolean;
        frameworks: string[];
        auditLevel: 'basic' | 'enhanced' | 'comprehensive';
    };
}
/**
 * Traceability record for SAFE gate decisions
 */
export interface SafeGateTraceabilityRecord {
    id: string;
    gateId: ApprovalGateId;
    category: SafeGateCategory;
    context: SafeGateContext;
    aiDecision?: {
        confidence: number;
        reasoning: string;
        model: string;
        promptVersion: string;
        timestamp: Date;
    };
    humanDecision?: {
        approver: string;
        decision: 'approved' | 'rejected' | 'escalated';
        reasoning: string;
        timestamp: Date;
        reviewTime: number;
    };
    learningExtracted: {
        patterns: string[];
        improvements: string[];
        confidence: number;
    };
    auditTrail: {
        sessionId: string;
        ipAddress: string;
        userAgent: string;
        correlationId: string;
        complianceLevel: string;
    };
    metrics: {
        totalProcessingTime: number;
        aiProcessingTime: number;
        humanReviewTime: number;
        escalationCount: number;
    };
    createdAt: Date;
    completedAt?: Date;
}
/**
 * SAFE Framework Integration Service
 *
 * Orchestrates TaskMaster approval gates for all SAFE framework workflows.
 * Provides complete traceability, learning, and SOC2 compliance.
 */
export declare class SafeFrameworkIntegration {
    private readonly logger;
    ': any;
    private approvalGateManager;
    private llmApprovalService;
    private promptManagementService;
    private taskApprovalSystem;
    private database;
    private eventSystem;
    private brainSystem;
    private safeFramework;
    private workflowEngine;
    private config;
    private traceabilityRecords;
    private activeGates;
    constructor(approvalGateManager: ApprovalGateManager, config: SafeIntegrationConfig);
    /**
     * Initialize SAFE framework integration
     */
    initialize(): Promise<void>;
    /**
     * Create approval gate for Epic Portfolio Kanban transition
     */
    createEpicPortfolioGate(epicId: string, fromState: PortfolioKanbanState, toState: PortfolioKanbanState, context: {
        businessCase?: EpicBusinessCase;
        stakeholders: string[];
        complianceRequired: boolean;
    }): Promise<{
        gateId: ApprovalGateId;
        traceabilityId: string;
    }>;
    private buildQualityApprovalRequirement;
}
export default SafeFrameworkIntegration;
//# sourceMappingURL=safe-framework-integration.d.ts.map