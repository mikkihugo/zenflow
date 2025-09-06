/**
 * @fileoverview Brain ↔ Coordination Event Contracts
 * 
 * Event contracts for brain and coordination package synchronization
 * Focus: Support workflows for existing SAFe projects created via web interface
 * Primary SAFe artifact creation (epics/features) happens through web dashboard
 * Brain-Coordination handles workflow support, not primary artifact creation
 */

import type { BaseEvent } from '@claude-zen/foundation';

// =============================================================================
// BRAIN → COORDINATION EVENTS
// =============================================================================

/**
 * Brain requests coordination support for existing SAFe workflow
 * Note: Primary epic creation happens via web interface, this supports existing workflows
 */
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

/**
 * Brain requests coordination for SPARC phase transition
 */
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

/**
 * Brain requests document workflow coordination for web-created SAFe projects
 * Focus: Supporting existing projects, not creating new primary artifacts
 */
export interface BrainExistingProjectWorkflowRequestEvent extends BaseEvent {
  documentId: string;
  projectId: string; // Reference to existing web-created project
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

/**
 * Coordination approves brain workflow request
 */
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

/**
 * Coordination escalates priority to brain
 */
export interface CoordinationPriorityEscalatedEvent extends BaseEvent {
  workflowId: string;
  escalationReason: 'deadline-approaching' | 'resource-conflict' | 'quality-issue' | 'stakeholder-request';
  newPriority: 'high' | 'critical';
  urgencyLevel: number; // 1-10 scale
  escalatedBy: string;
  actionRequired: string[];
  deadline: string;
}

/**
 * Coordination provides resource allocation to brain
 */
export interface CoordinationResourceAllocatedEvent extends BaseEvent {
  workflowId: string;
  allocationType: 'compute' | 'storage' | 'network' | 'ai-tokens' | 'human-review';
  allocatedResources: {
    compute?: {
      cpuCores: number;
      memoryGB: number;
      gpuAcceleration: boolean;
    };
    storage?: {
      temporaryGB: number;
      permanentGB: number;
    };
    aiTokens?: {
      maxTokens: number;
      provider: string;
      model: string;
    };
    humanReview?: {
      reviewerType: 'expert' | 'peer' | 'stakeholder';
      timeAllocation: number;
    };
  };
  allocationDuration: number; // milliseconds
  constraints: Record<string, unknown>;
}

// =============================================================================
// EVENT TYPE REGISTRY EXTENSIONS
// =============================================================================

/**
 * Brain-Coordination event catalog for web-created SAFe project support
 */
export const BRAIN_COORDINATION_EVENT_CATALOG = {
  // Brain → Coordination (Support for existing web-created projects)
  'brain:coordination:safe-workflow-support': 'BrainSafeWorkflowSupportEvent',
  'brain:coordination:sparc-phase-ready': 'BrainSparcPhaseReadyEvent', 
  'brain:coordination:existing-project-workflow-request': 'BrainExistingProjectWorkflowRequestEvent',
  
  // Coordination → Brain
  'coordination:brain:workflow-approved': 'CoordinationWorkflowApprovedEvent',
  'coordination:brain:priority-escalated': 'CoordinationPriorityEscalatedEvent',
  'coordination:brain:resource-allocated': 'CoordinationResourceAllocatedEvent',
} as const;

/**
 * Union type of all brain-coordination event names
 */
export type BrainCoordinationEventName = keyof typeof BRAIN_COORDINATION_EVENT_CATALOG;

/**
 * Type guard for brain-coordination events
 */
export function isBrainCoordinationEvent(eventName: string): eventName is BrainCoordinationEventName {
  return eventName in BRAIN_COORDINATION_EVENT_CATALOG;
}

/**
 * Event map for type-safe event handling
 */
export interface BrainCoordinationEventMap {
  'brain:coordination:safe-workflow-support': BrainSafeWorkflowSupportEvent;
  'brain:coordination:sparc-phase-ready': BrainSparcPhaseReadyEvent;
  'brain:coordination:existing-project-workflow-request': BrainExistingProjectWorkflowRequestEvent;
  'coordination:brain:workflow-approved': CoordinationWorkflowApprovedEvent;
  'coordination:brain:priority-escalated': CoordinationPriorityEscalatedEvent;
  'coordination:brain:resource-allocated': CoordinationResourceAllocatedEvent;
}