/**
 * @fileoverview Cross-ART Coordination using ../../teamwork
 *
 * SAFe cross-ART collaboration built on proven ../../teamwork package.
 * Provides multi-team coordination for Solution Train and Large Solution contexts.
 *
 * @author Claude-Zen Team
 * @since 2.0.0
 * @version 2.0.0
 */

import type {
  ConversationConfig,
  ConversationOrchestrator,
  ConversationParticipant,
} from '../../teamwork';

// ConversationSummary type definition (not exported from teamwork yet)
interface ConversationSummary {
  id: string;
  title: string;
  participantCount: number;
  messageCount: number;
  duration?: number;
  status: string;
  outcome?: string;
  keyDecisions: string[];
  timestamp: Date;
}

// Temporarily use Node.js EventEmitter until event-system is built
import type { EventEmitter } from 'node:events';
import type { Logger } from '@claude-zen/foundation';
import type {
  WorkflowDefinition,
  WorkflowEngine,
  WorkflowStep,
} from '@claude-zen/workflows';

/**
 * SAFe-specific ART coordination using proven teamwork patterns
 */
export class CrossARTCoordinator {
  private readonly conversationOrchestrator: ConversationOrchestrator;
  private readonly workflowEngine: WorkflowEngine;
  private readonly eventBus: EventEmitter;
  private readonly logger: Logger;

  constructor(
    conversationOrchestrator: ConversationOrchestrator,
    workflowEngine: WorkflowEngine,
    eventBus: EventEmitter,
    logger: Logger
  ) {
    this.conversationOrchestrator = conversationOrchestrator;
    this.workflowEngine = workflowEngine;
    this.eventBus = eventBus;
    this.logger = logger;
  }

  /**
   * Coordinate Solution Train sync using ../../teamwork
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
    this.logger.info('Starting Solution Train sync coordination', {'
      solutionId: params.solutionId,
      artCount: params.artIds.length,
    });

    // Create ART participants
    const participants: ConversationParticipant[] = params.artIds.map(
      (artId) => ({
        id: `rte-${artId}`,`
        name: `RTE ${artId}`,`
        role: 'release-train-engineer',
        status: 'active' as const,
        capabilities: ['speak', 'share-metrics', 'coordinate-dependencies'],
      })
    );

    // Add facilitator
    participants.push({
      id: params.facilitator,
      name: params.facilitator,
      role: 'solution-train-engineer',
      status: 'active' as const,
      capabilities: [
        'facilitate',
        'escalate',
        'make-decisions',
        'coordinate-arts',
      ],
    });

    // Use ../../teamwork conversation orchestrator
    const conversationConfig: ConversationConfig = {
      title: `Solution Train Sync - ${params.solutionId}`,`
      pattern: 'planning',
      initialParticipants: [], // Convert participants to AgentId later
      timeout: (params.duration||90) * 60 * 1000, // Convert to milliseconds
      context: {
        task: `Solution Train Sync for ${params.solutionId}`,`
        goal:'Coordinate dependencies and align on solution objectives',
        constraints: [],
        resources: [],
        deadline: undefined,
        domain: 'safe-framework',
        expertise: ['solution-architecture', 'art-coordination'],
        solutionId: params.solutionId,
      },
    };

    const conversation =
      await this.conversationOrchestrator.createConversation(
        conversationConfig
      );
    const conversationId = conversation.id;

    // Emit coordination started event
    this.eventBus.emit('cross-art:coordination-started', {'
      solutionId: params.solutionId,
      conversationId,
      participantCount: participants.length,
    });

    return { conversationId, participants };
  }

  /**
   * Coordinate PI Planning sync across multiple ARTs
   */
  async coordinatePIPlanningSync(params: {
    piId: string;
    artIds: string[];
    sharedObjectives: string[];
    dependencies: Array<{ from: string; to: string; type: string }>;
  }): Promise<string> {
    this.logger.info('Coordinating PI Planning sync', {'
      piId: params.piId,
      artCount: params.artIds.length,
      dependencyCount: params.dependencies.length,
    });

    // Create PI Planning coordination workflow using @claude-zen/workflows
    const workflowDefinition: WorkflowDefinition = {
      name: `PI Planning Sync - ${params.piId}`,`
      description: 'Multi-ART PI Planning coordination workflow',
      steps: [
        {
          id: 'pre-planning-sync',
          name: 'Pre-Planning ART Sync',
          type: 'parallel',
          params: {
            artIds: params.artIds,
            objectives: params.sharedObjectives,
          },
        } as WorkflowStep,
        {
          id: 'dependency-identification',
          name: 'Cross-ART Dependency Identification',
          type: 'sequence',
          params: {
            dependencies: params.dependencies,
          },
        } as WorkflowStep,
        {
          id: 'capacity-balancing',
          name: 'Cross-ART Capacity Balancing',
          type: 'condition',
          params: {
            balancingRules: [
              'no-art-over-120-percent',
              'critical-dependencies-first',
            ],
          },
        } as WorkflowStep,
        {
          id: 'commitment-finalization',
          name: 'PI Commitment Finalization',
          type: 'action',
          params: {
            requiresConsensus: true,
            allARTsMustCommit: true,
          },
        } as WorkflowStep,
      ],
    };

    const result = await this.workflowEngine.startWorkflow(workflowDefinition, {
      piId: params.piId,
      artIds: params.artIds,
      sharedObjectives: params.sharedObjectives,
      dependencies: params.dependencies,
    });

    if (!result.success||!result.workflowId) {
      throw new Error(`Failed to start PI Planning workflow: ${result.error}`);`
    }

    return result.workflowId;
  }

  /**
   * Handle cross-ART impediment resolution using conversation orchestration
   */
  async resolveImpediment(params: {
    impedimentId: string;
    affectedARTs: string[];
    description: string;
    severity:'low|medium|high|critical;
    owner: string;
  }): Promise<{
    resolutionConversationId: string;
    escalationRequired: boolean;
  }> {
    this.logger.warn('Cross-ART impediment requires resolution', {'
      impedimentId: params.impedimentId,
      severity: params.severity,
      affectedARTs: params.affectedARTs,
    });

    // Create impediment resolution participants
    const participants: ConversationParticipant[] = [
      {
        id: params.owner,
        name: params.owner,
        role: 'impediment-owner',
        status: 'active' as const,
        capabilities: ['facilitate', 'provide-context', 'track-resolution'],
      },
      ...params.affectedARTs.map((artId) => ({
        id: `rte-$artId`,`
        name: `RTE ${artId}`,`
        role: 'release-train-engineer',
        status: 'active' as const,
        capabilities: [
          'provide-impact-analysis',
          'commit-resources',
          'escalate',
        ],
      })),
    ];

    // Add Solution Train Engineer for critical impediments
    const escalationRequired = params.severity === 'critical';
    if (escalationRequired) {
      participants.push({
        id: 'ste-escalation',
        name: 'Solution Train Engineer',
        role: 'solution-train-engineer',
        status: 'active' as const,
        capabilities: [
          'make-executive-decisions',
          'allocate-cross-art-resources',
          'escalate-to-portfolio',
        ],
      });
    }

    const conversationConfig: ConversationConfig = {
      title: `Cross-ART Impediment Resolution: $params.impedimentId`,`
      pattern: 'decision',
      initialParticipants: [], // Convert participants to AgentId later
      timeout: (params.severity === 'critical' ? 120 : 60) * 60 * 1000, // Convert to milliseconds'
      context: 
        task: `Resolve cross-ART impediment ${params.impedimentId}`,`
        goal: 'Identify resolution path and assign ownership',
        constraints: [],
        resources: [],
        deadline: undefined,
        domain: 'safe-framework',
        expertise: ['impediment-resolution', 'cross-art-coordination'],
        impedimentId: params.impedimentId,
      },
    };

    const conversation =
      await this.conversationOrchestrator.createConversation(
        conversationConfig
      );
    const conversationId = conversation.id;

    // Emit impediment resolution event
    this.eventBus.emit('cross-art:impediment-resolution-started', {'
      impedimentId: params.impedimentId,
      conversationId,
      severity: params.severity,
      escalationRequired,
    });

    return {
      resolutionConversationId: conversationId,
      escalationRequired,
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
    // This would integrate with ../../teamwork analytics
    // For now, return mock data structure
    return {
      activeConversations: 3,
      resolvedImpediments: 12,
      averageResolutionTime: 4.2, // days
      artParticipation: {
        'art-1': 85,
        'art-2': 92,
        'art-3': 78,
      },
      coordinationEffectiveness: 87, // percentage
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
  PI_COMMITMENT_FINALIZED: 'cross-art:pi-commitment-finalized',
} as const;

/**
 * Factory function for creating cross-ART coordinator with dependencies
 */
export function createCrossARTCoordinator(
  conversationOrchestrator: ConversationOrchestrator,
  workflowEngine: WorkflowEngine,
  eventBus: EventEmitter,
  logger: Logger
): CrossARTCoordinator {
  return new CrossARTCoordinator(
    conversationOrchestrator,
    workflowEngine,
    eventBus,
    logger
  );
}
