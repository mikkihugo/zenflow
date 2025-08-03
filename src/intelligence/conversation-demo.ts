/**
 * Conversation Framework Demo
 *
 * Demonstrates ag2.ai-inspired conversation capabilities
 */

import type { AgentId } from '../types/agent-types';
import { ConversationFramework } from './conversation-framework/index';

/**
 * Demo script showing conversation framework capabilities
 */
export async function runConversationDemo(): Promise<void> {
  console.log('🤖 ag2.ai Integration Demo - Multi-Agent Conversations');
  console.log('='.repeat(60));

  try {
    // Create conversation system
    console.log('📚 Creating conversation framework...');
    const system = await ConversationFramework.create({
      memoryBackend: 'json',
      memoryConfig: { basePath: '/tmp/conversations' },
    });

    // Sample agents for demonstration
    const agents: AgentId[] = [
      { id: 'alice-coder', swarmId: 'demo-swarm', type: 'coder', instance: 0 },
      { id: 'bob-reviewer', swarmId: 'demo-swarm', type: 'reviewer', instance: 0 },
      { id: 'charlie-architect', swarmId: 'demo-swarm', type: 'architect', instance: 0 },
    ];

    console.log(`👥 Demo agents: ${agents.map((a) => a.id).join(', ')}`);

    // Create a code review conversation
    console.log('\n🔍 Creating code review conversation...');
    const conversation = await system.orchestrator.createConversation({
      title: 'Review Pull Request #142',
      description: 'Code review for new authentication system',
      pattern: 'code-review',
      context: {
        goal: 'Review and approve authentication improvements',
        domain: 'backend',
        constraints: ['security-focused', 'backwards-compatible'],
        resources: ['PR #142', 'Security guidelines'],
        expertise: ['authentication', 'nodejs', 'security'],
      },
      initialParticipants: agents,
      timeout: 3600000, // 1 hour
    });

    console.log(`✅ Created conversation: ${conversation.id}`);
    console.log(`   Title: ${conversation.title}`);
    console.log(`   Status: ${conversation.status}`);
    console.log(`   Participants: ${conversation.participants.length}`);

    // Simulate conversation messages
    console.log('\n💬 Simulating conversation messages...');

    const messages = [
      {
        fromAgent: agents[0], // alice-coder
        content: {
          text: "I've implemented JWT tokens with refresh mechanism. The changes are in auth.ts and middleware.ts.",
        },
        messageType: 'task_request' as const,
        metadata: {
          priority: 'high' as const,
          requiresResponse: true,
          context: conversation.context,
          tags: ['code-review', 'authentication'],
        },
      },
      {
        fromAgent: agents[1], // bob-reviewer
        content: {
          text: 'Code looks clean. I have concerns about token expiration handling. Can you add more error handling?',
          code: 'if (!token.isValid()) { throw new AuthError("Token expired"); }',
        },
        messageType: 'critique' as const,
        metadata: {
          priority: 'medium' as const,
          requiresResponse: true,
          context: conversation.context,
          tags: ['security', 'error-handling'],
        },
      },
      {
        fromAgent: agents[2], // charlie-architect
        content: {
          text: 'From architecture perspective, consider adding rate limiting for token refresh endpoint.',
        },
        messageType: 'suggestion' as const,
        metadata: {
          priority: 'medium' as const,
          requiresResponse: false,
          context: conversation.context,
          tags: ['architecture', 'security', 'rate-limiting'],
        },
      },
      {
        fromAgent: agents[0], // alice-coder
        content: {
          text: "Good points! I'll add the error handling and rate limiting. Thanks for the review!",
        },
        messageType: 'agreement' as const,
        metadata: {
          priority: 'medium' as const,
          requiresResponse: false,
          context: conversation.context,
          tags: ['agreement', 'follow-up'],
        },
      },
    ];

    for (const [index, msgData] of messages.entries()) {
      await system.orchestrator.sendMessage({
        id: `demo-msg-${index + 1}`,
        conversationId: conversation.id,
        timestamp: new Date(),
        ...msgData,
      });
      console.log(`   📨 ${msgData.fromAgent.id}: ${msgData.content.text.substring(0, 50)}...`);
    }

    // Get conversation history
    console.log('\n📋 Retrieving conversation history...');
    const history = await system.orchestrator.getConversationHistory(conversation.id);
    console.log(`   Found ${history.length} messages (including system messages)`);

    // Terminate conversation and get outcomes
    console.log('\n🏁 Terminating conversation...');
    const outcomes = await system.orchestrator.terminateConversation(
      conversation.id,
      'Code review completed successfully'
    );

    console.log(`   Generated ${outcomes.length} outcomes:`);
    outcomes.forEach((outcome, index) => {
      console.log(`   ${index + 1}. ${outcome.type}: confidence ${outcome.confidence}`);
    });

    // Show conversation capabilities
    console.log('\n🎯 Conversation Framework Capabilities:');
    const capabilities = ConversationFramework.getCapabilities();
    capabilities.forEach((cap) => console.log(`   ✓ ${cap}`));

    console.log('\n📋 Available Conversation Patterns:');
    const patterns = ConversationFramework.getAvailablePatterns();
    patterns.forEach((pattern) => console.log(`   ✓ ${pattern}`));

    // Demonstrate MCP integration
    console.log('\n🔧 MCP Tools Integration:');
    const mcpTools = system.mcpTools;
    const toolsCount = (mcpTools.constructor as any).getTools?.()?.length || 'N/A';
    console.log(`   Available MCP tools: ${toolsCount}`);
    console.log(`   HTTP MCP Server: Port 3000`);
    console.log(`   Stdio MCP: Supported`);

    console.log('\n🎉 ag2.ai Integration Demo Complete!');
    console.log('   Multi-agent conversations are now available in claude-code-zen');
    console.log('   Use MCP tools to create and manage conversations externally');
  } catch (error) {
    console.error('❌ Demo failed:', error);
    throw error;
  }
}

/**
 * Quick validation of conversation framework
 */
export function validateConversationFramework(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    // Check if conversation framework is available
    const capabilities = ConversationFramework.getCapabilities();
    if (capabilities.length === 0) {
      errors.push('No conversation capabilities found');
    }

    const patterns = ConversationFramework.getAvailablePatterns();
    if (patterns.length === 0) {
      errors.push('No conversation patterns available');
    }

    // Validate configuration
    const testConfig = {
      title: 'Test',
      pattern: 'code-review',
      goal: 'Test goal',
      domain: 'testing',
      participants: [{ id: 'test-agent', type: 'coder', swarmId: 'test', instance: 0 }],
    };

    const validation = ConversationFramework.validateConfig(testConfig);
    if (!validation.valid) {
      errors.push(...validation.errors);
    }

    return { valid: errors.length === 0, errors };
  } catch (error) {
    errors.push(`Framework validation error: ${error.message}`);
    return { valid: false, errors };
  }
}

// Export for use in other modules
export { ConversationFramework };

// If run directly, execute demo
if (import.meta.url === `file://${process.argv[1]}`) {
  runConversationDemo().catch(console.error);
}
