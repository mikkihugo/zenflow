/**
 * @fileoverview Teamwork-Workflow Integration - Conversation-Driven Workflow Orchestration
 * 
 * **CONVERSATION-DRIVEN WORKFLOW AUTOMATION:**
 * 
 * 🔄 **WORKFLOW TRIGGERS FROM CONVERSATIONS:**
 * - ART Sync decisions trigger dependency resolution workflows
 * - PI Planning commitments trigger capacity allocation workflows  
 * - System Demo feedback triggers improvement workflows
 * - I&A workshop outcomes trigger process improvement workflows
 * 
 * 🤖 **AUTOMATED WORKFLOW ORCHESTRATION:**
 * - Conversation decisions automatically start workflows
 * - Workflow progress feeds back into conversations
 * - Human approval gates embedded in workflow steps
 * - Real-time workflow status in conversation context
 * 
 * 🎯 **SAFЕ-SPECIFIC WORKFLOW PATTERNS:**
 * - Cross-team dependency resolution workflows
 * - Feature acceptance and deployment workflows
 * - Impediment escalation and resolution workflows
 * - Continuous improvement implementation workflows
 */

import { getLogger } from '@claude-zen/foundation';
import type { WorkflowEngine, WorkflowDefinition, WorkflowContext } from '@claude-zen/workflows';
import type { ConversationOrchestrator, ConversationOutcome } from '@claude-zen/teamwork';
import type { ApprovalWorkflow, ApprovalGate } from '../core/approval-gates';

const logger = getLogger('TeamworkWorkflowIntegration');

// ============================================================================
// INTEGRATION TYPES
// ============================================================================

export interface ConversationTriggeredWorkflow {
  id: string;
  name: string;
  conversationType: string;
  trigger: ConversationWorkflowTrigger;
  workflowDefinition: WorkflowDefinition;
  approvalGateIntegration: boolean;
  realTimeUpdates: boolean;
}

export interface ConversationWorkflowTrigger {
  triggerType: 'decision_reached' | 'consensus_achieved' | 'escalation_needed' | 'completion';
  conditions: {
    decisionType?: string;
    participantConsensus?: number; // 0-1
    urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
    conversationDuration?: number; // minutes
  };
  autoTrigger: boolean;
  requiresApproval: boolean;
}

export interface WorkflowConversationUpdate {
  workflowId: string;
  conversationId: string;
  updateType: 'progress' | 'completion' | 'approval_needed' | 'error';
  data: any;
  requiresHumanInput: boolean;
}

// ============================================================================
// TEAMWORK-WORKFLOW INTEGRATION SERVICE
// ============================================================================

export class TeamworkWorkflowIntegration {
  private workflowEngine: WorkflowEngine | null = null;
  private conversationOrchestrator: ConversationOrchestrator | null = null;
  private activeIntegrations: Map<string, ConversationTriggeredWorkflow> = new Map();
  private conversationWorkflowMappings: Map<string, string[]> = new Map(); // conversation -> workflows

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Initialize the integration with workflow engine and conversation orchestrator
   */
  async initialize(params: {
    workflowEngine: WorkflowEngine;
    conversationOrchestrator: ConversationOrchestrator;
  }): Promise<void> {
    this.workflowEngine = params.workflowEngine;
    this.conversationOrchestrator = params.conversationOrchestrator;

    // Register SAFe-specific workflow patterns
    await this.registerSAFeWorkflowPatterns();
    
    logger.info('TeamworkWorkflowIntegration initialized with SAFe patterns');
  }

  /**
   * Register conversation-triggered workflow for specific SAFe scenarios
   */
  async registerConversationWorkflow(
    conversationWorkflow: ConversationTriggeredWorkflow
  ): Promise<void> {
    this.activeIntegrations.set(conversationWorkflow.id, conversationWorkflow);
    
    logger.info(`Registered conversation workflow: ${conversationWorkflow.name}`, {
      conversationType: conversationWorkflow.conversationType,
      autoTrigger: conversationWorkflow.trigger.autoTrigger
    });
  }

  /**
   * Process conversation outcome and trigger appropriate workflows
   */
  async processConversationOutcome(
    conversationId: string,
    conversationType: string,
    outcome: ConversationOutcome
  ): Promise<{ triggeredWorkflows: string[]; approvalGates: ApprovalGate[] }> {
    
    const applicableWorkflows = Array.from(this.activeIntegrations.values())
      .filter(cw => 
        cw.conversationType === conversationType && 
        this.evaluateTriggerConditions(cw.trigger, outcome)
      );

    const triggeredWorkflows: string[] = [];
    const approvalGates: ApprovalGate[] = [];

    for (const workflowDef of applicableWorkflows) {
      try {
        const workflowContext: WorkflowContext = {
          conversationId,
          conversationOutcome: outcome,
          triggerTimestamp: new Date().toISOString(),
          participants: outcome.participants || [],
          decisions: outcome.decisions || [],
          metadata: {
            conversationType,
            workflowType: 'conversation_triggered',
            safeEvent: this.determineSAFeEventType(conversationType)
          }
        };

        // Start workflow if conditions met
        if (workflowDef.trigger.autoTrigger && !workflowDef.trigger.requiresApproval) {
          const workflowId = await this.startWorkflow(workflowDef, workflowContext);
          triggeredWorkflows.push(workflowId);
        } else {
          // Create approval gate for manual workflow trigger
          const approvalGate = await this.createWorkflowApprovalGate(
            workflowDef,
            workflowContext
          );
          approvalGates.push(approvalGate);
        }

        // Map conversation to workflow for future updates
        const existingWorkflows = this.conversationWorkflowMappings.get(conversationId) || [];
        existingWorkflows.push(workflowDef.id);
        this.conversationWorkflowMappings.set(conversationId, existingWorkflows);

      } catch (error) {
        logger.error(`Failed to process workflow ${workflowDef.name}`, error);
      }
    }

    return { triggeredWorkflows, approvalGates };
  }

  /**
   * Update conversation with workflow progress
   */
  async updateConversationWithWorkflowProgress(
    update: WorkflowConversationUpdate
  ): Promise<void> {
    if (!this.conversationOrchestrator) return;

    const message = this.generateWorkflowUpdateMessage(update);
    
    // Send workflow update to conversation
    await this.conversationOrchestrator.sendMessage({
      conversationId: update.conversationId,
      sender: 'workflow_system',
      message: message.content,
      messageType: message.type,
      metadata: {
        workflowId: update.workflowId,
        updateType: update.updateType,
        requiresHumanInput: update.requiresHumanInput
      }
    });

    logger.info(`Updated conversation ${update.conversationId} with workflow progress`, {
      workflowId: update.workflowId,
      updateType: update.updateType
    });
  }

  // ============================================================================
  // SAFE-SPECIFIC WORKFLOW PATTERNS
  // ============================================================================

  /**
   * Register built-in SAFe workflow patterns
   */
  private async registerSAFeWorkflowPatterns(): Promise<void> {
    
    // ART Sync Dependency Resolution Workflow
    await this.registerConversationWorkflow({
      id: 'art-sync-dependency-resolution',
      name: 'Cross-Team Dependency Resolution',
      conversationType: 'art-sync-coordination',
      trigger: {
        triggerType: 'decision_reached',
        conditions: {
          decisionType: 'dependency_resolution',
          participantConsensus: 0.8
        },
        autoTrigger: true,
        requiresApproval: false
      },
      workflowDefinition: this.createDependencyResolutionWorkflow(),
      approvalGateIntegration: true,
      realTimeUpdates: true
    });

    // PI Planning Commitment Workflow
    await this.registerConversationWorkflow({
      id: 'pi-planning-commitment',
      name: 'PI Objective Commitment Process',
      conversationType: 'pi-planning-breakout',
      trigger: {
        triggerType: 'consensus_achieved',
        conditions: {
          decisionType: 'pi_commitment',
          participantConsensus: 0.9
        },
        autoTrigger: true,
        requiresApproval: false
      },
      workflowDefinition: this.createPICommitmentWorkflow(),
      approvalGateIntegration: true,
      realTimeUpdates: true
    });

    // System Demo Improvement Workflow
    await this.registerConversationWorkflow({
      id: 'demo-improvement-workflow',
      name: 'Feature Improvement Implementation',
      conversationType: 'system-demo-feedback',
      trigger: {
        triggerType: 'decision_reached',
        conditions: {
          decisionType: 'improvement_required',
          urgencyLevel: 'high'
        },
        autoTrigger: false,
        requiresApproval: true
      },
      workflowDefinition: this.createImprovementWorkflow(),
      approvalGateIntegration: true,
      realTimeUpdates: true
    });

    // Inspect & Adapt Process Improvement Workflow
    await this.registerConversationWorkflow({
      id: 'inspect-adapt-improvement',
      name: 'Process Improvement Implementation',
      conversationType: 'inspect-adapt-workshop',
      trigger: {
        triggerType: 'completion',
        conditions: {
          decisionType: 'process_improvement'
        },
        autoTrigger: false,
        requiresApproval: true
      },
      workflowDefinition: this.createProcessImprovementWorkflow(),
      approvalGateIntegration: true,
      realTimeUpdates: true
    });

    logger.info('Registered SAFe-specific workflow patterns');
  }

  /**
   * Create dependency resolution workflow definition
   */
  private createDependencyResolutionWorkflow(): WorkflowDefinition {
    return {
      id: 'dependency-resolution-workflow',
      name: 'Cross-Team Dependency Resolution',
      version: '1.0.0',
      description: 'Automated workflow for resolving cross-team dependencies identified in ART Sync',
      steps: [
        {
          id: 'analyze-dependency',
          name: 'Analyze Dependency Impact',
          type: 'task',
          action: 'analyze_dependency_impact',
          inputs: ['dependency_details', 'team_capacity'],
          outputs: ['impact_assessment', 'resolution_options'],
          timeout: 3600000, // 1 hour
          retryPolicy: { maxRetries: 2, backoffMs: 30000 }
        },
        {
          id: 'create-resolution-plan',
          name: 'Create Resolution Plan',
          type: 'task',
          action: 'create_dependency_plan',
          inputs: ['impact_assessment', 'resolution_options'],
          outputs: ['resolution_plan', 'timeline'],
          timeout: 1800000, // 30 minutes
          approvalRequired: true
        },
        {
          id: 'coordinate-implementation',
          name: 'Coordinate Implementation',
          type: 'parallel',
          branches: [
            {
              id: 'provider-team-tasks',
              name: 'Provider Team Tasks',
              steps: [
                {
                  id: 'allocate-capacity',
                  name: 'Allocate Team Capacity',
                  type: 'approval_gate',
                  approvalCriteria: ['capacity_available', 'priority_justified'],
                  approvers: ['provider_team_lead'],
                  timeout: 1800000
                },
                {
                  id: 'implement-dependency',
                  name: 'Implement Dependency',
                  type: 'task',
                  action: 'implement_dependency_solution',
                  timeout: 86400000 // 24 hours
                }
              ]
            },
            {
              id: 'consumer-team-tasks',
              name: 'Consumer Team Tasks',
              steps: [
                {
                  id: 'prepare-integration',
                  name: 'Prepare for Integration',
                  type: 'task',
                  action: 'prepare_dependency_integration',
                  timeout: 3600000 // 1 hour
                }
              ]
            }
          ]
        },
        {
          id: 'validate-resolution',
          name: 'Validate Dependency Resolution',
          type: 'approval_gate',
          approvalCriteria: ['dependency_satisfied', 'integration_tested'],
          approvers: ['consumer_team_lead', 'provider_team_lead'],
          timeout: 3600000
        },
        {
          id: 'update-conversation',
          name: 'Update ART Sync Conversation',
          type: 'notification',
          action: 'update_conversation_with_resolution',
          inputs: ['resolution_status', 'timeline', 'outcomes']
        }
      ],
      errorHandling: {
        onError: 'escalate_to_rte',
        escalationTimeout: 1800000
      },
      notifications: {
        onStart: ['conversation_participants'],
        onCompletion: ['conversation_participants', 'rte'],
        onError: ['rte', 'system_admins']
      }
    };
  }

  /**
   * Create PI commitment workflow definition
   */
  private createPICommitmentWorkflow(): WorkflowDefinition {
    return {
      id: 'pi-commitment-workflow',
      name: 'PI Objective Commitment Process',
      version: '1.0.0',
      description: 'Workflow for formalizing PI objective commitments from team planning sessions',
      steps: [
        {
          id: 'validate-objectives',
          name: 'Validate PI Objectives',
          type: 'task',
          action: 'validate_pi_objectives',
          inputs: ['objectives', 'team_capacity', 'dependencies'],
          outputs: ['validation_results', 'risk_assessment']
        },
        {
          id: 'confidence-assessment',
          name: 'Team Confidence Assessment',
          type: 'approval_gate',
          approvalCriteria: ['objectives_realistic', 'capacity_adequate', 'dependencies_manageable'],
          approvers: ['team_members'],
          timeout: 1800000,
          metadata: { confidenceVoting: true }
        },
        {
          id: 'formal-commitment',
          name: 'Formal Team Commitment',
          type: 'approval_gate',
          approvalCriteria: ['team_consensus', 'stakeholder_alignment'],
          approvers: ['product_owner', 'scrum_master'],
          timeout: 1800000
        },
        {
          id: 'register-commitment',
          name: 'Register PI Commitment',
          type: 'task',
          action: 'register_pi_commitment',
          inputs: ['validated_objectives', 'team_commitment', 'confidence_vote']
        },
        {
          id: 'setup-tracking',
          name: 'Setup Progress Tracking',
          type: 'task',
          action: 'setup_pi_tracking',
          inputs: ['committed_objectives'],
          outputs: ['tracking_dashboard', 'milestone_schedule']
        }
      ]
    };
  }

  /**
   * Create improvement workflow definition
   */
  private createImprovementWorkflow(): WorkflowDefinition {
    return {
      id: 'improvement-workflow',
      name: 'Feature Improvement Implementation',
      version: '1.0.0',
      description: 'Workflow for implementing improvements based on system demo feedback',
      steps: [
        {
          id: 'analyze-feedback',
          name: 'Analyze Stakeholder Feedback',
          type: 'task',
          action: 'analyze_demo_feedback',
          inputs: ['feedback_items', 'stakeholder_priorities'],
          outputs: ['improvement_requirements', 'priority_ranking']
        },
        {
          id: 'estimate-effort',
          name: 'Estimate Improvement Effort',
          type: 'task',
          action: 'estimate_improvement_effort',
          inputs: ['improvement_requirements'],
          outputs: ['effort_estimate', 'implementation_plan']
        },
        {
          id: 'prioritize-improvements',
          name: 'Prioritize Improvements',
          type: 'approval_gate',
          approvalCriteria: ['business_value_justified', 'effort_reasonable'],
          approvers: ['product_owner', 'business_stakeholder'],
          timeout: 86400000 // 24 hours
        },
        {
          id: 'schedule-implementation',
          name: 'Schedule Implementation',
          type: 'task',
          action: 'schedule_improvement_work',
          inputs: ['prioritized_improvements', 'team_capacity']
        }
      ]
    };
  }

  /**
   * Create process improvement workflow definition
   */
  private createProcessImprovementWorkflow(): WorkflowDefinition {
    return {
      id: 'process-improvement-workflow',
      name: 'Process Improvement Implementation',
      version: '1.0.0',
      description: 'Workflow for implementing process improvements from I&A workshops',
      steps: [
        {
          id: 'validate-improvements',
          name: 'Validate Proposed Improvements',
          type: 'task',
          action: 'validate_process_improvements',
          inputs: ['improvement_proposals', 'current_process_metrics'],
          outputs: ['validated_improvements', 'impact_assessment']
        },
        {
          id: 'plan-implementation',
          name: 'Plan Implementation Approach',
          type: 'task',
          action: 'plan_process_implementation',
          inputs: ['validated_improvements'],
          outputs: ['implementation_plan', 'success_criteria', 'rollback_plan']
        },
        {
          id: 'approve-changes',
          name: 'Approve Process Changes',
          type: 'approval_gate',
          approvalCriteria: ['improvement_justified', 'plan_viable', 'risks_acceptable'],
          approvers: ['rte', 'process_owner'],
          timeout: 172800000 // 48 hours
        },
        {
          id: 'implement-changes',
          name: 'Implement Process Changes',
          type: 'task',
          action: 'implement_process_changes',
          inputs: ['approved_plan'],
          timeout: 604800000 // 1 week
        },
        {
          id: 'measure-results',
          name: 'Measure Improvement Results',
          type: 'task',
          action: 'measure_process_improvements',
          inputs: ['success_criteria'],
          outputs: ['improvement_metrics'],
          delay: 1209600000 // 2 weeks after implementation
        }
      ]
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async startWorkflow(
    workflowDef: ConversationTriggeredWorkflow,
    context: WorkflowContext
  ): Promise<string> {
    if (!this.workflowEngine) {
      throw new Error('Workflow engine not initialized');
    }

    const workflowId = await this.workflowEngine.startWorkflow(
      workflowDef.workflowDefinition,
      context
    );

    logger.info(`Started workflow ${workflowDef.name}`, {
      workflowId,
      conversationId: context.conversationId
    });

    return workflowId;
  }

  private async createWorkflowApprovalGate(
    workflowDef: ConversationTriggeredWorkflow,
    context: WorkflowContext
  ): Promise<ApprovalGate> {
    return {
      id: `workflow-trigger-${workflowDef.id}-${Date.now()}`,
      name: `Trigger Workflow: ${workflowDef.name}`,
      description: `Approve starting workflow based on conversation outcome`,
      criteria: [
        {
          id: 'workflow-needed',
          description: 'Workflow execution is justified by conversation outcome',
          type: 'boolean',
          required: true,
          validationLogic: 'Manual review of conversation decisions and outcomes'
        },
        {
          id: 'resources-available',
          description: 'Required resources are available for workflow execution',
          type: 'boolean',
          required: true,
          validationLogic: 'Team capacity and system resources verified'
        }
      ],
      approvers: this.determineWorkflowApprovers(workflowDef, context),
      requiredApprovals: 1,
      timeoutMinutes: 1440, // 24 hours
      escalationRules: [],
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata: {
        workflowId: workflowDef.id,
        conversationId: context.conversationId,
        triggerType: 'conversation_outcome'
      }
    };
  }

  private evaluateTriggerConditions(
    trigger: ConversationWorkflowTrigger,
    outcome: ConversationOutcome
  ): boolean {
    // Check trigger type match
    if (trigger.triggerType !== outcome.type) {
      return false;
    }

    // Check decision type if specified
    if (trigger.conditions.decisionType && 
        outcome.primaryDecision?.type !== trigger.conditions.decisionType) {
      return false;
    }

    // Check consensus threshold if specified
    if (trigger.conditions.participantConsensus && 
        (outcome.consensus || 0) < trigger.conditions.participantConsensus) {
      return false;
    }

    // Check urgency level if specified
    if (trigger.conditions.urgencyLevel && 
        outcome.urgency !== trigger.conditions.urgencyLevel) {
      return false;
    }

    return true;
  }

  private determineSAFeEventType(conversationType: string): string {
    const typeMap: Record<string, string> = {
      'art-sync-coordination': 'ART_SYNC',
      'pi-planning-breakout': 'PI_PLANNING',
      'system-demo-feedback': 'SYSTEM_DEMO',
      'inspect-adapt-workshop': 'INSPECT_ADAPT'
    };
    return typeMap[conversationType] || 'UNKNOWN';
  }

  private determineWorkflowApprovers(
    workflowDef: ConversationTriggeredWorkflow,
    context: WorkflowContext
  ): string[] {
    // Default approvers based on workflow type
    const approverMap: Record<string, string[]> = {
      'art-sync-dependency-resolution': ['rte', 'affected_team_leads'],
      'pi-planning-commitment': ['product_owner', 'rte'],
      'demo-improvement-workflow': ['product_owner', 'business_stakeholder'],
      'inspect-adapt-improvement': ['rte', 'process_owner']
    };
    
    return approverMap[workflowDef.id] || ['system_admin'];
  }

  private generateWorkflowUpdateMessage(update: WorkflowConversationUpdate): any {
    const messageMap: Record<string, any> = {
      progress: {
        content: `Workflow progress update: ${update.data.stepName} completed (${update.data.progress}%)`,
        type: 'workflow_progress'
      },
      completion: {
        content: `Workflow completed successfully. Results: ${update.data.summary}`,
        type: 'workflow_complete'
      },
      approval_needed: {
        content: `Workflow requires approval for: ${update.data.approvalReason}`,
        type: 'workflow_approval_request'
      },
      error: {
        content: `Workflow encountered an error: ${update.data.error}. Manual intervention may be required.`,
        type: 'workflow_error'
      }
    };

    return messageMap[update.updateType] || {
      content: 'Workflow status update received',
      type: 'workflow_update'
    };
  }

  private setupEventListeners(): void {
    // Set up event listeners for workflow and conversation events
    // This would integrate with the event system when available
    logger.info('Event listeners setup for teamwork-workflow integration');
  }
}

// ============================================================================
// SERVICE INSTANCE EXPORT
// ============================================================================

export const teamworkWorkflowIntegration = new TeamworkWorkflowIntegration();

// ============================================================================
// INTEGRATION HOOKS
// ============================================================================

export interface TeamworkWorkflowAPIIntegration {
  initializeIntegration: typeof teamworkWorkflowIntegration.initialize;
  registerWorkflow: typeof teamworkWorkflowIntegration.registerConversationWorkflow;
  processOutcome: typeof teamworkWorkflowIntegration.processConversationOutcome;
  updateConversation: typeof teamworkWorkflowIntegration.updateConversationWithWorkflowProgress;
}

export const teamworkWorkflowAPI: TeamworkWorkflowAPIIntegration = {
  initializeIntegration: teamworkWorkflowIntegration.initialize.bind(teamworkWorkflowIntegration),
  registerWorkflow: teamworkWorkflowIntegration.registerConversationWorkflow.bind(teamworkWorkflowIntegration),
  processOutcome: teamworkWorkflowIntegration.processConversationOutcome.bind(teamworkWorkflowIntegration),
  updateConversation: teamworkWorkflowIntegration.updateConversationWithWorkflowProgress.bind(teamworkWorkflowIntegration)
};