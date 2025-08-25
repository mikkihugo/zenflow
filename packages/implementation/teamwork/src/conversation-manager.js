/**
 * @fileoverview Conversation Manager
 *
 * Basic conversation management utilities and helpers.
 */
/**
 * Utility functions for conversation management
 */
export class ConversationManager {
  /**
   * Create a new conversation session
   */
  createSession(id, participants) {
    return {
      id,
      title: `Conversation ${id}`,
      description: undefined,
      participants,
      initiator: participants[0] || {
        id: '',
        swarmId: '',
        type: 'researcher',
        instance: 0,
      },
      orchestrator: undefined,
      startTime: new Date(),
      endTime: undefined,
      status: 'initializing',
      context: {
        task: undefined,
        goal: 'General conversation',
        constraints: [],
        resources: [],
        deadline: undefined,
        domain: 'general',
        expertise: [],
      },
      messages: [],
      outcomes: [],
      metrics: {
        messageCount: 0,
        participationByAgent: Object.fromEntries(
          participants.map((p) => [p.id, 0])
        ),
        averageResponseTime: 0,
        resolutionTime: 0,
        consensusScore: 0,
        qualityRating: 0,
      },
    };
  }
  /**
   * Add participant to conversation
   */
  addParticipant(session, agent) {
    if (!session.participants.some((p) => p.id === agent.id)) {
      session.participants.push(agent);
      session.metrics.participationByAgent[agent.id] = 0;
    }
  }
  /**
   * Remove participant from conversation
   */
  removeParticipant(session, agentId) {
    session.participants = session.participants.filter((p) => p.id !== agentId);
    delete session.metrics.participationByAgent[agentId];
  }
}
//# sourceMappingURL=conversation-manager.js.map
