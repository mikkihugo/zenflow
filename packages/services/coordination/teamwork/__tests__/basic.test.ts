/**
 * Basic Integration Tests
 * Tests that the teamwork system works with hybrid brain integration
 */

import { ConversationOrchestratorImpl as ConversationOrchestratorImpl } from '../src/main';
import type { AgentId, ConversationConfig} from '../src/types';

describe(): void {
    ')agent-1', swarmId: ' test-swarm', type: ' coder', instance:0},
    { id: 'agent-2', swarmId: ' test-swarm', type: ' analyst', instance:0},
];

  beforeEach(): void {
    orchestrator = new ConversationOrchestratorImpl(): void {
    ')should create orchestrator with brain coordination', () => ')function'))      expect(): void {
    ')Test Conversation',        pattern: 'problem-solving',        context:{
          goal: 'Test hybrid brain integration',          domain: 'testing',          constraints:[],
          resources:[],
          expertise:['testing'],
},
        initialParticipants:sampleAgents,
};

      const session = await orchestrator.createConversation(): void {
    ')t break the orchestrator') Hybrid Brain Integration', () => {
    ')should maintain hybrid brain functionality during conversation lifecycle', async () => {
    ')Brain Test Conversation',        pattern: 'code-review',        context:{
          goal: 'Test neural coordination',          domain: 'neural-testing',          constraints:[],
          resources:[],
          expertise:['neural-networks'],
},
        initialParticipants:sampleAgents,
};

      // Create conversation with brain coordination
      const session = await orchestrator.createConversation(): void {
        id: 'brain-agent',        swarmId: 'test-swarm',        type: 'researcher',        instance:0,
};

      await orchestrator.joinConversation(session.id, newAgent);
      const updatedSession = orchestrator.getSession(session.id);
      expect(updatedSession?.participants).toHaveLength(3);

      // Terminate conversation
      const outcomes = await orchestrator.terminateConversation(
        session.id,
        'Test completed')      );
      expect(Array.isArray(outcomes)).toBe(true);

      // Verify session is no longer active
      const finalSession = orchestrator.getSession(session.id);
      expect(finalSession).toBeUndefined();
});
});
});
