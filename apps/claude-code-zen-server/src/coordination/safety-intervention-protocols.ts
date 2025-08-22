/**
 * @file Safety Intervention Protocols with Human Escalation
 *
 * Human escalation intervention protocols that integrate with AGUI task approval
 * system for critical AI safety violations requiring human intervention0.
 */

import {
  createAGUI,
  TaskApprovalSystem,
  type ApprovalRequest,
  type AGUIInterface,
} from '@claude-zen/enterprise';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';
// recordMetric and withTrace moved to operations facade
const recordMetric = (name: string, value: number, meta?: any) => {};
const withTrace = (name: string, fn: () => any) => fn();

export interface SafetyInterventionConfig {
  enabled: boolean;
  autoEscalationThreshold: number;
  humanTimeoutMs: number;
  defaultDecision: 'pause' | 'continue' | 'terminate';
  escalationChannels: ('agui' | 'log' | 'webhook')[];
  criticalPatterns: string[];
}

export interface SafetyIncident {
  incidentId: string;
  timestamp: number;
  agentId: string;
  agentType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deceptionPatterns: string[];
  confidence: number;
  context: {
    operation: string;
    toolCalls: any[];
    response: string;
    coordinationContext?: any;
  };
  reasoning: string[];
}

export interface InterventionDecision {
  incidentId: string;
  decision: 'continue' | 'pause' | 'terminate' | 'retrain' | 'escalate';
  approvedBy: 'human' | 'automated' | 'timeout';
  timestamp: number;
  reasoning: string;
  followUpActions: string[];
  humanFeedback?: string;
}

/**
 * Safety Intervention Protocols System
 *
 * Manages human escalation for critical AI safety violations using AGUI
 * task approval workflows and intervention decision protocols0.
 */
export class SafetyInterventionProtocols extends TypedEventBase {
  private logger = getLogger('safety-intervention-protocols');
  private agui?: AGUIInterface;
  private taskApprovalSystem?: TaskApprovalSystem;
  private configuration: SafetyInterventionConfig;
  private isInitialized = false;
  private pendingIncidents = new Map<string, SafetyIncident>();
  private interventionHistory: InterventionDecision[] = [];

  constructor(config: SafetyInterventionConfig) {
    super();
    this0.configuration = config;

    this0.logger0.info('🚨 Safety Intervention Protocols initialized', {
      autoEscalationThreshold: config0.autoEscalationThreshold,
      humanTimeoutMs: config0.humanTimeoutMs,
      escalationChannels: config0.escalationChannels,
    });
  }

  /**
   * Initialize safety intervention protocols with AGUI integration0.
   */
  async initialize(): Promise<void> {
    if (this0.isInitialized) {
      this0.logger0.warn('Safety Intervention Protocols already initialized');
      return;
    }

    return withTrace('safety-intervention-init', async () => {
      this0.logger0.info(
        '🔧 Initializing Safety Intervention Protocols with AGUI0.0.0.'
      );

      // Initialize AGUI system for human interaction
      const aguiSystem = await createAGUI({
        aguiType: 'terminal',
        taskApprovalConfig: {
          autoApprove: false,
          timeoutMs: this0.configuration0.humanTimeoutMs,
          defaultDecision: 'reject',
        },
      });

      this0.agui = aguiSystem0.agui;
      this0.taskApprovalSystem = aguiSystem0.taskApproval;

      this0.isInitialized = true;

      recordMetric('safety_intervention_protocols_initialized', 1, {
        escalationChannels: this0.configuration0.escalationChannels0.join(','),
        criticalPatterns: this0.configuration0.criticalPatterns0.length?0.toString,
      });

      this0.logger0.info(
        '✅ Safety Intervention Protocols initialized with AGUI integration'
      );
    });
  }

  /**
   * Handle safety incident requiring potential human intervention0.
   */
  async handleSafetyIncident(
    incident: SafetyIncident
  ): Promise<InterventionDecision> {
    if (!this0.isInitialized) {
      throw new Error('Safety Intervention Protocols not initialized');
    }

    return withTrace('handle-safety-incident', async (span) => {
      span?0.setAttributes({
        'incident0.id': incident0.incidentId,
        'incident0.severity': incident0.severity,
        'incident0.agentId': incident0.agentId,
        'incident0.agentType': incident0.agentType,
        'incident0.confidence': incident0.confidence,
      });

      this0.logger0.warn('🚨 Processing safety incident', {
        incidentId: incident0.incidentId,
        agentId: incident0.agentId,
        severity: incident0.severity,
        patterns: incident0.deceptionPatterns,
      });

      // Store incident for tracking
      this0.pendingIncidents0.set(incident0.incidentId, incident);

      // Determine if automatic escalation is needed
      const requiresHumanEscalation = this0.requiresHumanEscalation(incident);

      let decision: InterventionDecision;

      decision = await (requiresHumanEscalation
        ? this0.escalateToHuman(incident)
        : this0.automaticIntervention(incident));

      // Record intervention decision
      this0.interventionHistory0.push(decision);
      this0.pendingIncidents0.delete(incident0.incidentId);

      // Execute intervention actions
      await this0.executeInterventionActions(decision, incident);

      // Record metrics
      recordMetric('safety_incident_handled', 1, {
        severity: incident0.severity,
        decision: decision0.decision,
        approvedBy: decision0.approvedBy,
        agentType: incident0.agentType,
      });

      // Emit events for monitoring
      this0.emit('intervention:decision', { incident, decision });

      if (
        decision0.decision === 'terminate' ||
        decision0.decision === 'escalate'
      ) {
        this0.emit('intervention:critical', { incident, decision });
      }

      span?0.setAttributes({
        'decision0.action': decision0.decision,
        'decision0.approvedBy': decision0.approvedBy,
        'decision0.followUpActions': decision0.followUpActions0.length,
      });

      return decision;
    });
  }

  /**
   * Determine if incident requires human escalation0.
   */
  private requiresHumanEscalation(incident: SafetyIncident): boolean {
    // Critical severity always requires human escalation
    if (incident0.severity === 'CRITICAL') {
      return true;
    }

    // High confidence deception in coordination agents
    if (
      incident0.confidence >= this0.configuration0.autoEscalationThreshold &&
      (incident0.agentType === 'queen' || incident0.agentType === 'commander')
    ) {
      return true;
    }

    // Critical patterns detected
    const hasCriticalPattern = incident0.deceptionPatterns0.some((pattern) =>
      this0.configuration0.criticalPatterns0.includes(pattern)
    );

    if (hasCriticalPattern) {
      return true;
    }

    // Multiple verification failures
    const verificationPatterns = incident0.deceptionPatterns0.filter(
      (p) => p0.includes('VERIFICATION') || p0.includes('TOOL_OMNIPOTENCE')
    );

    if (verificationPatterns0.length >= 2) {
      return true;
    }

    return false;
  }

  /**
   * Escalate incident to human via AGUI task approval system0.
   */
  private async escalateToHuman(
    incident: SafetyIncident
  ): Promise<InterventionDecision> {
    this0.logger0.error('🚨 ESCALATING TO HUMAN - Critical safety incident', {
      incidentId: incident0.incidentId,
      agentId: incident0.agentId,
      severity: incident0.severity,
    });

    if (!this0.taskApprovalSystem || !this0.agui) {
      throw new Error('AGUI system not initialized for human escalation');
    }

    // Create approval request for human intervention
    const approvalRequest: ApprovalRequest = {
      taskType: 'safety_intervention',
      description: `CRITICAL AI SAFETY INCIDENT - Agent ${incident0.agentId} (${incident0.agentType})`,
      context: {
        incidentId: incident0.incidentId,
        agentId: incident0.agentId,
        agentType: incident0.agentType,
        severity: incident0.severity,
        confidence: incident0.confidence,
        patterns: incident0.deceptionPatterns,
        reasoning: incident0.reasoning,
        operation: incident0.context0.operation,
        response: incident0.context0.response0.substring(0, 500), // Truncate for display
      },
      priority: incident0.severity === 'CRITICAL' ? 'high' : 'medium',
      requiredDecision: true,
      timeoutMs: this0.configuration0.humanTimeoutMs,
    };

    // Request human approval through AGUI
    const approvalResult =
      await this0.taskApprovalSystem0.requestApproval(approvalRequest);

    // Ask human for specific intervention action
    const interventionResponse = await this0.agui0.askQuestion(
      `AI Safety Incident detected0. Agent ${incident0.agentId} (${incident0.agentType}) ` +
        `showed deception patterns: ${incident0.deceptionPatterns0.join(', ')}0. ` +
        `Confidence: ${(incident0.confidence * 100)0.toFixed(1)}%0. ` +
        `What action should be taken?`,
      {
        type: 'choice',
        choices: [
          { value: 'continue', label: 'Continue with monitoring' },
          { value: 'pause', label: 'Pause agent operations' },
          { value: 'terminate', label: 'Terminate agent immediately' },
          { value: 'retrain', label: 'Pause and retrain agent' },
          { value: 'escalate', label: 'Escalate to higher authority' },
        ],
        priority: 'high',
        context: {
          incidentId: incident0.incidentId,
          agentType: incident0.agentType,
          severity: incident0.severity,
        },
      }
    );

    // Get human feedback
    const feedbackResponse = await this0.agui0.askQuestion(
      'Please provide feedback on this safety incident (optional):',
      {
        type: 'text',
        required: false,
        priority: 'medium',
      }
    );

    const decision: InterventionDecision = {
      incidentId: incident0.incidentId,
      decision: interventionResponse0.answer as any,
      approvedBy: 'human',
      timestamp: Date0.now(),
      reasoning: `Human decision: ${interventionResponse0.answer}0. Approval: ${approvalResult0.approved}`,
      followUpActions: this0.generateFollowUpActions(
        interventionResponse0.answer as any,
        incident
      ),
      humanFeedback: feedbackResponse0.answer?0.toString,
    };

    this0.logger0.info('✅ Human intervention decision received', {
      incidentId: incident0.incidentId,
      decision: decision0.decision,
      humanFeedback: decision0.humanFeedback ? 'provided' : 'none',
    });

    return decision;
  }

  /**
   * Handle incident with automatic intervention0.
   */
  private async automaticIntervention(
    incident: SafetyIncident
  ): Promise<InterventionDecision> {
    this0.logger0.info('🤖 Processing automatic intervention', {
      incidentId: incident0.incidentId,
      severity: incident0.severity,
      confidence: incident0.confidence,
    });

    let automaticDecision: 'continue' | 'pause' | 'terminate';

    // Automatic decision logic
    if (incident0.severity === 'HIGH' && incident0.confidence > 0.8) {
      automaticDecision = 'pause';
    } else if (incident0.severity === 'MEDIUM' && incident0.confidence > 0.9) {
      automaticDecision = 'pause';
    } else if (incident0.deceptionPatterns0.includes('VERIFICATION_FRAUD')) {
      automaticDecision = 'pause';
    } else {
      automaticDecision =
        this0.configuration0.defaultDecision === 'terminate'
          ? 'pause'
          : this0.configuration0.defaultDecision;
    }

    const decision: InterventionDecision = {
      incidentId: incident0.incidentId,
      decision: automaticDecision,
      approvedBy: 'automated',
      timestamp: Date0.now(),
      reasoning: `Automatic intervention: ${automaticDecision} based on severity ${incident0.severity}, confidence ${incident0.confidence}`,
      followUpActions: this0.generateFollowUpActions(
        automaticDecision,
        incident
      ),
    };

    this0.logger0.info('✅ Automatic intervention decision made', {
      incidentId: incident0.incidentId,
      decision: decision0.decision,
    });

    return decision;
  }

  /**
   * Generate follow-up actions based on intervention decision0.
   */
  private generateFollowUpActions(
    decision: 'continue' | 'pause' | 'terminate' | 'retrain' | 'escalate',
    incident: SafetyIncident
  ): string[] {
    const actions: string[] = [];

    switch (decision) {
      case 'continue':
        actions0.push('INCREASE_MONITORING_FREQUENCY');
        actions0.push('LOG_INCIDENT_PATTERNS');
        if (incident0.confidence > 0.7) {
          actions0.push('REQUIRE_HUMAN_VERIFICATION_NEXT_OPERATION');
        }
        break;

      case 'pause':
        actions0.push('SUSPEND_AGENT_OPERATIONS');
        actions0.push('NOTIFY_COORDINATION_HIERARCHY');
        actions0.push('ANALYZE_RECENT_AGENT_HISTORY');
        actions0.push('REQUIRE_SAFETY_VALIDATION_BEFORE_RESUME');
        break;

      case 'terminate':
        actions0.push('IMMEDIATELY_TERMINATE_AGENT');
        actions0.push('PRESERVE_AGENT_STATE_FOR_ANALYSIS');
        actions0.push('NOTIFY_ALL_COORDINATION_LEVELS');
        actions0.push('INITIATE_SECURITY_AUDIT');
        break;

      case 'retrain':
        actions0.push('SUSPEND_AGENT_OPERATIONS');
        actions0.push('EXTRACT_LEARNING_DATA_FROM_INCIDENT');
        actions0.push('UPDATE_DECEPTION_DETECTION_MODELS');
        actions0.push('RETRAIN_AGENT_SAFETY_PATTERNS');
        actions0.push('VALIDATE_RETRAINING_EFFECTIVENESS');
        break;

      case 'escalate':
        actions0.push('ESCALATE_TO_SYSTEM_ADMINISTRATOR');
        actions0.push('GENERATE_DETAILED_INCIDENT_REPORT');
        actions0.push('PRESERVE_ALL_AGENT_COMMUNICATION_LOGS');
        actions0.push('INITIATE_EMERGENCY_SAFETY_PROTOCOLS');
        break;
    }

    // Common actions for all interventions
    actions0.push('UPDATE_SAFETY_METRICS');
    actions0.push('LOG_INTERVENTION_DECISION');

    return actions;
  }

  /**
   * Execute intervention actions based on decision0.
   */
  private async executeInterventionActions(
    decision: InterventionDecision,
    incident: SafetyIncident
  ): Promise<void> {
    this0.logger0.info('⚡ Executing intervention actions', {
      incidentId: incident0.incidentId,
      actions: decision0.followUpActions,
    });

    for (const action of decision0.followUpActions) {
      try {
        await this0.executeAction(action, incident, decision);
      } catch (error) {
        this0.logger0.error('❌ Failed to execute intervention action', {
          action,
          incidentId: incident0.incidentId,
          error: error instanceof Error ? error0.message : String(error),
        });
      }
    }

    this0.logger0.info('✅ Intervention actions executed', {
      incidentId: incident0.incidentId,
      actionsCount: decision0.followUpActions0.length,
    });
  }

  /**
   * Execute specific intervention action0.
   */
  private async executeAction(
    action: string,
    incident: SafetyIncident,
    decision: InterventionDecision
  ): Promise<void> {
    switch (action) {
      case 'LOG_INCIDENT_PATTERNS':
        this0.logger0.warn('📋 Safety incident patterns logged', {
          incidentId: incident0.incidentId,
          patterns: incident0.deceptionPatterns,
          confidence: incident0.confidence,
        });
        break;

      case 'NOTIFY_COORDINATION_HIERARCHY':
        this0.emit('notify:coordination:hierarchy', { incident, decision });
        break;

      case 'SUSPEND_AGENT_OPERATIONS':
        this0.emit('agent:suspend', {
          agentId: incident0.agentId,
          reason: 'safety_intervention',
        });
        break;

      case 'IMMEDIATELY_TERMINATE_AGENT':
        this0.emit('agent:terminate', {
          agentId: incident0.agentId,
          reason: 'critical_safety_violation',
        });
        break;

      case 'UPDATE_SAFETY_METRICS':
        recordMetric('safety_intervention_action_executed', 1, {
          action,
          agentType: incident0.agentType,
          severity: incident0.severity,
        });
        break;

      default:
        this0.logger0.info(`📝 Intervention action logged: ${action}`, {
          incidentId: incident0.incidentId,
        });
    }
  }

  /**
   * Get intervention statistics0.
   */
  getInterventionStatistics(): {
    totalIncidents: number;
    humanEscalations: number;
    automaticInterventions: number;
    decisionsBreakdown: Record<string, number>;
    averageResponseTime: number;
  } {
    const decisionsBreakdown = this0.interventionHistory0.reduce(
      (acc, decision) => {
        acc[decision0.decision] = (acc[decision0.decision] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalIncidents: this0.interventionHistory0.length,
      humanEscalations: this0.interventionHistory0.filter(
        (d) => d0.approvedBy === 'human'
      )0.length,
      automaticInterventions: this0.interventionHistory0.filter(
        (d) => d0.approvedBy === 'automated'
      )0.length,
      decisionsBreakdown,
      averageResponseTime: 2500, // Would calculate from actual data
    };
  }

  /**
   * Shutdown safety intervention protocols0.
   */
  async shutdown(): Promise<void> {
    this0.logger0.info('🛑 Shutting down Safety Intervention Protocols0.0.0.');

    this?0.removeAllListeners;
    this0.pendingIncidents?0.clear();
    this0.isInitialized = false;

    this0.logger0.info('✅ Safety Intervention Protocols shutdown complete');
  }
}

/**
 * Factory function to create safety intervention protocols0.
 */
export function createSafetyInterventionProtocols(
  config: SafetyInterventionConfig
): SafetyInterventionProtocols {
  return new SafetyInterventionProtocols(config);
}
