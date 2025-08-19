/**
 * @fileoverview Cross-ART Coordination using @claude-zen/teamwork
 * 
 * SAFe cross-ART collaboration built on proven @claude-zen/teamwork package.
 * Provides multi-team coordination for Solution Train and Large Solution contexts.
 * 
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0  
 */

import { 
  ConversationOrchestrator, 
  ConversationConfig,
  ConversationParticipant,
  ConversationMessage,
  ConversationSummary 
} from '@claude-zen/teamwork';
import { WorkflowEngine, WorkflowDefinition } from '@claude-zen/workflows';
import { EventBus, createEvent, EventPriority } from '@claude-zen/event-system';
import type { Logger } from '@claude-zen/foundation';

/**
 * SAFe-specific ART coordination using proven teamwork patterns
 */
export class CrossARTCoordinator {
  private readonly conversationOrchestrator: ConversationOrchestrator;
  private readonly workflowEngine: WorkflowEngine;
  private readonly eventBus: EventBus;
  private readonly logger: Logger;

  constructor(
    conversationOrchestrator: ConversationOrchestrator,
    workflowEngine: WorkflowEngine,
    eventBus: EventBus,
    logger: Logger
  ) {
    this.conversationOrchestrator = conversationOrchestrator;
    this.workflowEngine = workflowEngine;
    this.eventBus = eventBus;
    this.logger = logger;
  }

  /**
   * Coordinate Solution Train sync using @claude-zen/teamwork
   */
  async coordinateSolutionTrainSync(params: {
    solutionId: string;
    artIds: string[];
    agenda: string[];
    facilitator: string;
    duration?: number;
  }): Promise<{
    conversationId: string;
    participants: ConversationParticipant[];
  }> {
    this.logger.info('Starting Solution Train sync coordination', {
      solutionId: params.solutionId,
      artCount: params.artIds.length
    });

    // Create ART participants
    const participants: ConversationParticipant[] = params.artIds.map(artId => ({
      id: `rte-${artId}`,
      name: `RTE ${artId}`,
      role: 'release-train-engineer',
      permissions: ['speak', 'share-metrics', 'coordinate-dependencies']
    }));

    // Add facilitator
    participants.push({
      id: params.facilitator,
      name: params.facilitator,
      role: 'solution-train-engineer',
      permissions: ['facilitate', 'escalate', 'make-decisions', 'coordinate-arts']
    });

    // Use @claude-zen/teamwork conversation orchestrator
    const conversationConfig: ConversationConfig = {
      topic: `Solution Train Sync - ${params.solutionId}`,
      type: 'planning',
      participants,
      duration: params.duration || 90, // 90 minutes default
      context: {
        solutionId: params.solutionId,
        agenda: params.agenda,
        meetingType: 'solution-train-sync'
      }
    };

    const conversationId = await this.conversationOrchestrator.startConversation(conversationConfig);

    // Emit coordination started event
    this.eventBus.emit(createEvent({
      type: 'cross-art:coordination-started',
      data: {
        solutionId: params.solutionId,
        conversationId,
        participantCount: participants.length
      },
      priority: EventPriority.MEDIUM
    }));

    return { conversationId, participants };
  }

  /**
   * Coordinate PI Planning sync across multiple ARTs
   */
  async coordinatePIPlanningSync(params: {
    piId: string;
    artIds: string[];
    sharedObjectives: string[];
    dependencies: Array<{ from: string; to: string; type: string; }>;
  }): Promise<string> {
    this.logger.info('Coordinating PI Planning sync', {
      piId: params.piId,
      artCount: params.artIds.length,
      dependencyCount: params.dependencies.length
    });

    // Create PI Planning coordination workflow using @claude-zen/workflows
    const workflowDefinition: WorkflowDefinition = {
      name: `PI Planning Sync - ${params.piId}`,
      description: 'Multi-ART PI Planning coordination workflow',
      steps: [
        {
          id: 'pre-planning-sync',
          name: 'Pre-Planning ART Sync',
          type: 'parallel',
          config: {
            artIds: params.artIds,
            objectives: params.sharedObjectives
          }
        },
        {
          id: 'dependency-identification',
          name: 'Cross-ART Dependency Identification',
          type: 'sequence',
          config: {
            dependencies: params.dependencies
          },
          dependencies: ['pre-planning-sync']
        },
        {
          id: 'capacity-balancing',
          name: 'Cross-ART Capacity Balancing',
          type: 'condition',
          config: {
            balancingRules: ['no-art-over-120-percent', 'critical-dependencies-first']
          },
          dependencies: ['dependency-identification']
        },
        {
          id: 'commitment-finalization',
          name: 'PI Commitment Finalization',
          type: 'action',
          config: {
            requiresConsensus: true,
            allARTsMustCommit: true
          },
          dependencies: ['capacity-balancing']
        }
      ],
      triggers: [
        {
          type: 'manual',
          config: { initiatedBy: 'solution-train-engineer' }
        }
      ],
      config: {
        piId: params.piId,
        artIds: params.artIds
      }
    };

    const workflowId = await this.workflowEngine.createWorkflow(workflowDefinition);
    await this.workflowEngine.executeWorkflow(workflowId, {
      piId: params.piId,
      artIds: params.artIds,
      sharedObjectives: params.sharedObjectives,
      dependencies: params.dependencies
    });

    return workflowId;
  }

  /**
   * Handle cross-ART impediment resolution using conversation orchestration
   */
  async resolveImpediment(params: {
    impedimentId: string;
    affectedARTs: string[];
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    owner: string;
  }): Promise<{
    resolutionConversationId: string;
    escalationRequired: boolean;
  }> {
    this.logger.warn('Cross-ART impediment requires resolution', {
      impedimentId: params.impedimentId,
      severity: params.severity,
      affectedARTs: params.affectedARTs
    });

    // Create impediment resolution participants
    const participants: ConversationParticipant[] = [
      {
        id: params.owner,
        name: params.owner,
        role: 'impediment-owner',
        permissions: ['facilitate', 'provide-context', 'track-resolution']
      },
      ...params.affectedARTs.map(artId => ({
        id: `rte-${artId}`,
        name: `RTE ${artId}`,
        role: 'release-train-engineer',
        permissions: ['provide-impact-analysis', 'commit-resources', 'escalate']
      }))
    ];

    // Add Solution Train Engineer for critical impediments
    const escalationRequired = params.severity === 'critical';
    if (escalationRequired) {
      participants.push({
        id: 'ste-escalation',
        name: 'Solution Train Engineer',
        role: 'solution-train-engineer',
        permissions: ['make-executive-decisions', 'allocate-cross-art-resources', 'escalate-to-portfolio']
      });
    }

    const conversationConfig: ConversationConfig = {
      topic: `Cross-ART Impediment Resolution: ${params.impedimentId}`,
      type: 'decision',
      participants,
      duration: params.severity === 'critical' ? 120 : 60,
      context: {
        impedimentId: params.impedimentId,
        description: params.description,
        severity: params.severity,
        affectedARTs: params.affectedARTs,
        requiresDecision: true
      }
    };

    const conversationId = await this.conversationOrchestrator.startConversation(conversationConfig);

    // Emit impediment resolution event
    this.eventBus.emit(createEvent({
      type: 'cross-art:impediment-resolution-started',
      data: {
        impedimentId: params.impedimentId,
        conversationId,
        severity: params.severity,
        escalationRequired
      },
      priority: params.severity === 'critical' ? EventPriority.CRITICAL : EventPriority.HIGH
    }));

    return { 
      resolutionConversationId: conversationId, 
      escalationRequired 
    };
  }

  /**
   * Get cross-ART coordination metrics using teamwork analytics
   */
  getCoordinationMetrics(solutionId: string): {
    activeConversations: number;
    resolvedImpediments: number;
    averageResolutionTime: number;
    artParticipation: Record<string, number>;
    coordinationEffectiveness: number;
  } {
    // This would integrate with @claude-zen/teamwork analytics
    // For now, return mock data structure
    return {
      activeConversations: 3,
      resolvedImpediments: 12,
      averageResolutionTime: 4.2, // days
      artParticipation: {
        'art-1': 85,
        'art-2': 92,
        'art-3': 78
      },
      coordinationEffectiveness: 87 // percentage
    };
  }
}

/**
 * Cross-ART event types for solution train coordination
 */
export const CROSS_ART_EVENTS = {
  COORDINATION_STARTED: 'cross-art:coordination-started',
  IMPEDIMENT_RESOLUTION_STARTED: 'cross-art:impediment-resolution-started',
  DEPENDENCY_IDENTIFIED: 'cross-art:dependency-identified',
  CAPACITY_REBALANCED: 'cross-art:capacity-rebalanced',
  PI_COMMITMENT_FINALIZED: 'cross-art:pi-commitment-finalized'
} as const;

/**
 * Factory function for creating cross-ART coordinator with dependencies
 */
export function createCrossARTCoordinator(
  conversationOrchestrator: ConversationOrchestrator,
  workflowEngine: WorkflowEngine,
  eventBus: EventBus,
  logger: Logger
): CrossARTCoordinator {
  return new CrossARTCoordinator(conversationOrchestrator, workflowEngine, eventBus, logger);
}