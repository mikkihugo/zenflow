/**
 * @fileoverview Brain ↔ Coordination Event Contracts (moved into foundation)
 * Focus: Support workflows for existing SAFe projects created via web interface
 */

import type { BaseEvent } from '../event-catalog.js';

// =============================================================================
// BRAIN → COORDINATION EVENTS
// =============================================================================

export interface BrainSafeWorkflowSupportEvent extends BaseEvent {
  workflowType: 'epic-support' | 'pi-planning' | 'feature-approval' | 'architecture-review';
  documentId: string;
  documentType: 'vision' | 'prd' | 'epic' | 'feature';
  safeArtifacts: {
    businessValue: string;
    acceptanceCriteria: string[];
    dependencies: string[];
    estimates: Record<string, unknown>;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  sparcPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  approvalRequired: boolean;
}

export interface BrainSparcPhaseReadyEvent extends BaseEvent {
  projectId: string;
  currentPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  nextPhase: 'specification' | 'pseudocode' | 'architecture' | 'refinement' | 'completion';
  artifacts: Array<{
    type: string;
    name: string;
    content: string;
    metadata: Record<string, unknown>;
  }>;
  qualityGates: {
    passed: boolean;
    criteria: string[];
    metrics: Record<string, number>;
  };
  taskMasterApprovalRequired: boolean;
}

export interface BrainExistingProjectWorkflowRequestEvent extends BaseEvent {
  documentId: string;
  projectId: string;
  workflowType: 'project-support' | 'content-analysis' | 'requirements-validation' | 'workflow-optimization';
  documentData: {
    type: string;
    title: string;
    content: string;
    metadata: Record<string, unknown>;
  };
  processingOptions: {
    aiAssisted: boolean;
    qualityLevel: 'basic' | 'standard' | 'premium';
    timeout: number;
  };
  existingProjectRequirements: {
    projectIntegration: boolean;
    sparcCompliance: boolean;
    taskMasterApproval: boolean;
    maintainExistingStructure: boolean;
  };
}

// =============================================================================
// COORDINATION → BRAIN EVENTS
// =============================================================================

export interface CoordinationWorkflowApprovedEvent extends BaseEvent {
  originalRequestId: string;
  approvalId: string;
  approvedBy: string;
  approvalType: 'automatic' | 'taskmaster' | 'manual';
  allocatedResources: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    timeAllocation: number;
    computeResources: Record<string, unknown>;
  };
  constraints: {
    deadlines: Array<{
      phase: string;
      deadline: string;
    }>;
    qualityRequirements: Record<string, unknown>;
    complianceRequirements: string[];
  };
}

export interface CoordinationPriorityEscalatedEvent extends BaseEvent {
  workflowId: string;
  escalationReason: 'deadline-approaching' | 'resource-conflict' | 'quality-issue' | 'stakeholder-request';
  newPriority: 'high' | 'critical';
  urgencyLevel: number;
  escalatedBy: string;
  actionRequired: string[];
  deadline: string;
}

export interface CoordinationResourceAllocatedEvent extends BaseEvent {
  workflowId: string;
  allocationType: 'compute' | 'storage' | 'network' | 'ai-tokens' | 'human-review';
  allocatedResources: {
    compute?: { cpuCores: number; memoryGB: number; gpuAcceleration: boolean };
    storage?: { temporaryGB: number; permanentGB: number };
    aiTokens?: { maxTokens: number; provider: string; model: string };
    humanReview?: { reviewerType: 'expert' | 'peer' | 'stakeholder'; timeAllocation: number };
  };
  allocationDuration: number;
  constraints: Record<string, unknown>;
}

export const BRAIN_COORDINATION_EVENT_CATALOG = {
  'brain:coordination:safe-workflow-support': 'BrainSafeWorkflowSupportEvent',
  'brain:coordination:sparc-phase-ready': 'BrainSparcPhaseReadyEvent',
  'brain:coordination:existing-project-workflow-request': 'BrainExistingProjectWorkflowRequestEvent',
  'coordination:brain:workflow-approved': 'CoordinationWorkflowApprovedEvent',
  'coordination:brain:priority-escalated': 'CoordinationPriorityEscalatedEvent',
  'coordination:brain:resource-allocated': 'CoordinationResourceAllocatedEvent',
} as const;

export type BrainCoordinationEventName = keyof typeof BRAIN_COORDINATION_EVENT_CATALOG;

export interface BrainCoordinationEventMap {
  'brain:coordination:safe-workflow-support': BrainSafeWorkflowSupportEvent;
  'brain:coordination:sparc-phase-ready': BrainSparcPhaseReadyEvent;
  'brain:coordination:existing-project-workflow-request': BrainExistingProjectWorkflowRequestEvent;
  'coordination:brain:workflow-approved': CoordinationWorkflowApprovedEvent;
  'coordination:brain:priority-escalated': CoordinationPriorityEscalatedEvent;
  'coordination:brain:resource-allocated': CoordinationResourceAllocatedEvent;
}
