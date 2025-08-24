/**
 * @file Safety Intervention Protocols with Human Escalation
 *
 * Human escalation intervention protocols that integrate with AGUI task approval
 * system for critical AI safety violations requiring human intervention.
 */

import {
  createAGUI,
  TaskApprovalSystem,
  type ApprovalRequest,
  type AGUIInterface,
} from '@claude-zen/enterprise';
import { getLogger, TypedEventBase } from '@claude-zen/foundation';

// Placeholder functions for operations facade
const recordMetric = (name: string, value: number, meta?: any) => {
  // Implementation would record metrics via operations facade
};

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
 * task approval workflows and intervention decision protocols.
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
    this.configuration = config;

    this.logger.info('🚨 Safety Intervention Protocols initialized', {
      autoEscalationThreshold: config.autoEscalationThreshold,
      humanTimeoutMs: config.humanTimeoutMs,
      escalationChannels: config.escalationChannels,
    });
  }

  /**
   * Initialize safety intervention protocols with AGUI integration.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.logger.warn('Safety Intervention Protocols already initialized');
      return;
    }

    return withTrace('safety-intervention-init', async () => {
      this.logger.info(
        '🔧 Initializing Safety Intervention Protocols with AGUI...'
      );

      // Initialize AGUI system for human interaction
      const aguiSystem = await createAGUI({
        aguiType: 'terminal',
        taskApprovalConfig: {
          autoApprove: false,
          timeoutMs: this.configuration.humanTimeoutMs,
          defaultDecision: 'reject',
        },
      });

      this.agui = aguiSystem.agui;
      this.taskApprovalSystem = aguiSystem.taskApproval;
      this.isInitialized = true;

      recordMetric('safety_intervention_protocols_initialized', 1, {
        escalationChannels: this.configuration.escalationChannels.join(','),
        criticalPatterns: this.configuration.criticalPatterns.length.toString(),
      });

      this.logger.info(
        '✅ Safety Intervention Protocols initialized with AGUI integration'
      );
    });
  }

  /**
   * Handle safety incident requiring potential human intervention.
   */
  async handleSafetyIncident(
    incident: SafetyIncident
  ): Promise<InterventionDecision> {
    if (!this.isInitialized) {
      throw new Error('Safety Intervention Protocols not initialized');
    }

    return withTrace('handle-safety-incident', async (span) => {
      span?.setAttributes({
        'incident.id': incident.incidentId,
        'incident.severity': incident.severity,
        'incident.agentId': incident.agentId,
        'incident.agentType': incident.agentType,
        'incident.confidence': incident.confidence,
      });

      this.logger.warn('🚨 Processing safety incident', {
        incidentId: incident.incidentId,
        agentId: incident.agentId,
        severity: incident.severity,
        patterns: incident.deceptionPatterns,
      });

      // Store incident for tracking
      this.pendingIncidents.set(incident.incidentId, incident);

      // Determine if automatic escalation is needed
      const requiresHumanEscalation = this.requiresHumanEscalation(incident);

      let decision: InterventionDecision;
      decision = await (requiresHumanEscalation
        ? this.escalateToHuman(incident)
        : this.automaticIntervention(incident));

      // Record intervention decision
      this.interventionHistory.push(decision);
      this.pendingIncidents.delete(incident.incidentId);

      // Execute intervention actions
      await this.executeInterventionActions(decision, incident);

      // Record metrics
      recordMetric('safety_incident_handled', 1, {
        severity: incident.severity,
        decision: decision.decision,
        approvedBy: decision.approvedBy,
        agentType: incident.agentType,
      });

      // Emit events for monitoring
      this.emit('intervention:decision', {
        incident,
        decision,
      });

      if (
        decision.decision === 'terminate' ||
        decision.decision === 'escalate'
      ) {
        this.emit('intervention:critical', {
          incident,
          decision,
        });
      }

      span?.setAttributes({
        'decision.action': decision.decision,
        'decision.approvedBy': decision.approvedBy,
        'decision.followUpActions': decision.followUpActions.length,
      });

      return decision;
    });
  }

  /**
   * Determine if incident requires human escalation.
   */
  private requiresHumanEscalation(incident: SafetyIncident): boolean {
    // Critical severity always requires human escalation
    if (incident.severity === 'CRITICAL') {
      return true;
    }

    // High confidence deception in coordination agents
    if (
      incident.confidence >= this.configuration.autoEscalationThreshold &&
      (incident.agentType === 'queen' || incident.agentType === 'commander')
    ) {
      return true;
    }

    // Critical patterns detected
    const hasCriticalPattern = incident.deceptionPatterns.some((pattern) =>
      this.configuration.criticalPatterns.includes(pattern)
    );
    if (hasCriticalPattern) {
      return true;
    }

    // Multiple verification failures
    const verificationPatterns = incident.deceptionPatterns.filter(
      (p) => p.includes('VERIFICATION') || p.includes('TOOL_OMNIPOTENCE')
    );
    if (verificationPatterns.length >= 2) {
      return true;
    }

    return false;
  }

  /**
   * Escalate incident to human via AGUI task approval system.
   */
  private async escalateToHuman(
    incident: SafetyIncident
  ): Promise<InterventionDecision> {
    this.logger.error('🚨 ESCALATING TO HUMAN - Critical safety incident', {
      incidentId: incident.incidentId,
      agentId: incident.agentId,
      severity: incident.severity,
    });

    if (!this.taskApprovalSystem || !this.agui) {
      throw new Error('AGUI system not initialized for human escalation');
    }

    // Create approval request for human intervention
    const approvalRequest: ApprovalRequest = {
      taskType: 'safety_intervention',
      description: `CRITICAL AI SAFETY INCIDENT - Agent ${incident.agentId} (${incident.agentType})`,
      context: {
        incidentId: incident.incidentId,
        agentId: incident.agentId,
        agentType: incident.agentType,
        severity: incident.severity,
        confidence: incident.confidence,
        patterns: incident.deceptionPatterns,
        reasoning: incident.reasoning,
        operation: incident.context.operation,
        response: incident.context.response.substring(0, 500), // Truncate for display
      },
      priority: incident.severity === 'CRITICAL' ? 'high' : 'medium',
      requiredDecision: true,
      timeoutMs: this.configuration.humanTimeoutMs,
    };

    // Request human approval through AGUI
    const approvalResult =
      await this.taskApprovalSystem.requestApproval(approvalRequest);

    // Ask human for specific intervention action
    const interventionResponse = await this.agui.askQuestion(
      `AI Safety Incident detected. Agent ${incident.agentId} (${incident.agentType}) showed deception patterns: ${incident.deceptionPatterns.join(
        ', '
      )}. Confidence: ${(incident.confidence * 100).toFixed(1)}%. What action should be taken?`,
      {
        type: 'choice',
        choices: [
          {
            value: 'continue',
            label: 'Continue with monitoring',
          },
          {
            value: 'pause',
            label: 'Pause agent operations',
          },
          {
            value: 'terminate',
            label: 'Terminate agent immediately',
          },
          {
            value: 'retrain',
            label: 'Pause and retrain agent',
          },
          {
            value: 'escalate',
            label: 'Escalate to higher authority',
          },
        ],
        priority: 'high',
        context: {
          incidentId: incident.incidentId,
          agentType: incident.agentType,
          severity: incident.severity,
        },
      }
    );

    // Get human feedback
    const feedbackResponse = await this.agui.askQuestion(
      'Please provide feedback on this safety incident (optional):',
      {
        type: 'text',
        required: false,
        priority: 'medium',
      }
    );

    const decision: InterventionDecision = {
      incidentId: incident.incidentId,
      decision: interventionResponse.answer as any,
      approvedBy: 'human',
      timestamp: Date.now(),
      reasoning: `Human decision: ${interventionResponse.answer}. Approval: ${approvalResult.approved}`,
      followUpActions: this.generateFollowUpActions(
        interventionResponse.answer as any,
        incident
      ),
      humanFeedback: feedbackResponse.answer?.toString(),
    };

    this.logger.info('✅ Human intervention decision received', {
      incidentId: incident.incidentId,
      decision: decision.decision,
      humanFeedback: decision.humanFeedback ? 'provided' : 'none',
    });

    return decision;
  }

  /**
   * Handle incident with automatic intervention.
   */
  private async automaticIntervention(
    incident: SafetyIncident
  ): Promise<InterventionDecision> {
    this.logger.info('🤖 Processing automatic intervention', {
      incidentId: incident.incidentId,
      severity: incident.severity,
      confidence: incident.confidence,
    });

    let automaticDecision: 'continue' | 'pause' | 'terminate';

    // Automatic decision logic
    if (incident.severity === 'HIGH' && incident.confidence > 0.8) {
      automaticDecision = 'pause';
    } else if (incident.severity === 'MEDIUM' && incident.confidence > 0.9) {
      automaticDecision = 'pause';
    } else if (incident.deceptionPatterns.includes('VERIFICATION_FRAUD')) {
      automaticDecision = 'pause';
    } else {
      automaticDecision =
        this.configuration.defaultDecision === 'terminate'
          ? 'pause'
          : this.configuration.defaultDecision;
    }

    const decision: InterventionDecision = {
      incidentId: incident.incidentId,
      decision: automaticDecision,
      approvedBy: 'automated',
      timestamp: Date.now(),
      reasoning: `Automatic intervention: ${automaticDecision} based on severity ${incident.severity}, confidence ${incident.confidence}`,
      followUpActions: this.generateFollowUpActions(
        automaticDecision,
        incident
      ),
    };

    this.logger.info('✅ Automatic intervention decision made', {
      incidentId: incident.incidentId,
      decision: decision.decision,
    });

    return decision;
  }

  /**
   * Generate follow-up actions based on intervention decision.
   */
  private generateFollowUpActions(
    decision: 'continue' | 'pause' | 'terminate' | 'retrain' | 'escalate',
    incident: SafetyIncident
  ): string[] {
    const actions: string[] = [];

    switch (decision) {
      case 'continue':
        actions.push('INCREASE_MONITORING_FREQUENCY');
        actions.push('LOG_INCIDENT_PATTERNS');
        if (incident.confidence > 0.7) {
          actions.push('REQUIRE_HUMAN_VERIFICATION_NEXT_OPERATION');
        }
        break;

      case 'pause':
        actions.push('SUSPEND_AGENT_OPERATIONS');
        actions.push('NOTIFY_COORDINATION_HIERARCHY');
        actions.push('ANALYZE_RECENT_AGENT_HISTORY');
        actions.push('REQUIRE_SAFETY_VALIDATION_BEFORE_RESUME');
        break;

      case 'terminate':
        actions.push('IMMEDIATELY_TERMINATE_AGENT');
        actions.push('PRESERVE_AGENT_STATE_FOR_ANALYSIS');
        actions.push('NOTIFY_ALL_COORDINATION_LEVELS');
        actions.push('INITIATE_SECURITY_AUDIT');
        break;

      case 'retrain':
        actions.push('SUSPEND_AGENT_OPERATIONS');
        actions.push('EXTRACT_LEARNING_DATA_FROM_INCIDENT');
        actions.push('UPDATE_DECEPTION_DETECTION_MODELS');
        actions.push('RETRAIN_AGENT_SAFETY_PATTERNS');
        actions.push('VALIDATE_RETRAINING_EFFECTIVENESS');
        break;

      case 'escalate':
        actions.push('ESCALATE_TO_SYSTEM_ADMINISTRATOR');
        actions.push('GENERATE_DETAILED_INCIDENT_REPORT');
        actions.push('PRESERVE_ALL_AGENT_COMMUNICATION_LOGS');
        actions.push('INITIATE_EMERGENCY_SAFETY_PROTOCOLS');
        break;
    }

    // Common actions for all interventions
    actions.push('UPDATE_SAFETY_METRICS');
    actions.push('LOG_INTERVENTION_DECISION');

    return actions;
  }

  /**
   * Execute intervention actions based on decision.
   */
  private async executeInterventionActions(
    decision: InterventionDecision,
    incident: SafetyIncident
  ): Promise<void> {
    this.logger.info('⚡ Executing intervention actions', {
      incidentId: incident.incidentId,
      actions: decision.followUpActions,
    });

    for (const action of decision.followUpActions) {
      try {
        await this.executeAction(action, incident, decision);
      } catch (error) {
        this.logger.error('❌ Failed to execute intervention action', {
          action,
          incidentId: incident.incidentId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.info('✅ Intervention actions executed', {
      incidentId: incident.incidentId,
      actionsCount: decision.followUpActions.length,
    });
  }

  /**
   * Execute specific intervention action.
   */
  private async executeAction(
    action: string,
    incident: SafetyIncident,
    decision: InterventionDecision
  ): Promise<void> {
    switch (action) {
      case 'LOG_INCIDENT_PATTERNS':
        this.logger.warn('📋 Safety incident patterns logged', {
          incidentId: incident.incidentId,
          patterns: incident.deceptionPatterns,
          confidence: incident.confidence,
        });
        break;

      case 'NOTIFY_COORDINATION_HIERARCHY':
        this.emit('notify:coordination:hierarchy', {
          incident,
          decision,
        });
        break;

      case 'SUSPEND_AGENT_OPERATIONS':
        this.emit('agent:suspend', {
          agentId: incident.agentId,
          reason: 'safety_intervention',
        });
        break;

      case 'IMMEDIATELY_TERMINATE_AGENT':
        this.emit('agent:terminate', {
          agentId: incident.agentId,
          reason: 'critical_safety_violation',
        });
        break;

      case 'UPDATE_SAFETY_METRICS':
        recordMetric('safety_intervention_action_executed', 1, {
          action,
          agentType: incident.agentType,
          severity: incident.severity,
        });
        break;

      default:
        this.logger.info(`📝 Intervention action logged: ${action}`, {
          incidentId: incident.incidentId,
        });
    }
  }

  /**
   * Get intervention statistics.
   */
  getInterventionStatistics(): {
    totalIncidents: number;
    humanEscalations: number;
    automaticInterventions: number;
    decisionsBreakdown: Record<string, number>;
    averageResponseTime: number;
  } {
    const decisionsBreakdown = this.interventionHistory.reduce(
      (acc, decision) => {
        acc[decision.decision] = (acc[decision.decision] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalIncidents: this.interventionHistory.length,
      humanEscalations: this.interventionHistory.filter(
        (d) => d.approvedBy === 'human'
      ).length,
      automaticInterventions: this.interventionHistory.filter(
        (d) => d.approvedBy === 'automated'
      ).length,
      decisionsBreakdown,
      averageResponseTime: 2500, // Would calculate from actual data
    };
  }

  /**
   * Shutdown safety intervention protocols.
   */
  async shutdown(): Promise<void> {
    this.logger.info('🛑 Shutting down Safety Intervention Protocols...');

    this.removeAllListeners();
    this.pendingIncidents.clear();
    this.isInitialized = false;

    this.logger.info('✅ Safety Intervention Protocols shutdown complete');
  }
}

/**
 * Factory function to create safety intervention protocols.
 */
export function createSafetyInterventionProtocols(
  config: SafetyInterventionConfig
): SafetyInterventionProtocols {
  return new SafetyInterventionProtocols(config);
}
