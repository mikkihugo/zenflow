# @claude-zen/teamwork

**Universal multi-agent teamwork framework for collaborative problem-solving, sequential thinking, and coordinated decision-making.**

## Overview

A comprehensive framework for enabling structured teamwork between any AI agents (matrons, coordinators, specialists, or custom agents), featuring:

- **Multi-Agent Orchestration**: Coordinate conversations between different agent types
- **Persistent Memory**: SQLite, JSON, and LanceDB backend support
- **Conversation Patterns**: Pre-built patterns for common scenarios
- **Session Management**: Handle long-running conversations with state persistence
- **Decision Tracking**: Record and analyze conversation outcomes

## Quick Start

```typescript
import { ConversationFramework } from '@claude-zen/teamwork';

// Create conversation system
const conversationSystem = await ConversationFramework.create({
  memoryBackend: 'sqlite',
  memoryConfig: { path: './conversations.db' },
});

// Start a technical consultation
const session = await conversationSystem.orchestrator.startConversation({
  type: 'technical-consultation',
  participants: ['architect', 'security', 'performance'],
  context: {
    topic: 'Database architecture review',
    priority: 'high',
    timeout: 300000, // 5 minutes
  },
});

// Send message and get responses
const response = await session.sendMessage({
  sender: 'coordinator',
  content: 'Should we use PostgreSQL or MongoDB for our analytics workload?',
  messageType: 'question',
});

console.log('Agent responses:', response.participantResponses);
```

## Core Components

### ConversationOrchestrator

Central coordinator for managing multi-agent conversations:

```typescript
const orchestrator = conversationSystem.orchestrator;

// Start different conversation types
const architectureReview = await orchestrator.startConversation({
  type: 'architecture-review',
  participants: ['architect', 'security', 'performance'],
});

const taskAssignment = await orchestrator.startConversation({
  type: 'task-assignment',
  participants: ['coordinator', 'planner', 'domain-expert'],
});
```

### ConversationMemory

Persistent storage for conversation history and context:

```typescript
const memory = conversationSystem.memory;

// Store conversation context
await memory.storeContext('session-123', {
  projectPhase: 'design',
  constraints: ['budget-limited', 'time-sensitive'],
  previousDecisions: ['chosen-database', 'api-framework'],
});

// Retrieve conversation history
const history = await memory.getConversationHistory('session-123');
```

## Conversation Types

### Architecture Review

```typescript
const session = await orchestrator.startConversation({
  type: 'architecture-review',
  participants: ['architect', 'security', 'performance'],
  context: {
    reviewScope: 'database-layer',
    constraints: ['performance', 'scalability'],
    existingDecisions: adrHistory,
  },
});
```

### Task Assignment

```typescript
const session = await orchestrator.startConversation({
  type: 'task-assignment',
  participants: ['coordinator', 'planner', 'specialist'],
  context: {
    taskComplexity: 'high',
    skillsRequired: ['typescript', 'database-design'],
    deadline: '2024-01-15',
  },
});
```

### Technical Consultation

```typescript
const session = await orchestrator.startConversation({
  type: 'technical-consultation',
  participants: ['architect', 'performance', 'security'],
  context: {
    consultationType: 'design-review',
    documentReferences: ['adr-001', 'performance-requirements'],
  },
});
```

## Memory Backends

### SQLite Backend (Recommended)

```typescript
const framework = await ConversationFramework.create({
  memoryBackend: 'sqlite',
  memoryConfig: {
    path: './conversations.db',
    enableWAL: true,
  },
});
```

### JSON Backend (Development)

```typescript
const framework = await ConversationFramework.create({
  memoryBackend: 'json',
  memoryConfig: {
    path: './conversations.json',
  },
});
```

### LanceDB Backend (Vector Search)

```typescript
const framework = await ConversationFramework.create({
  memoryBackend: 'lancedb',
  memoryConfig: {
    path: './conversations_vector.db',
    enableSimilaritySearch: true,
  },
});
```

## Advanced Features

### Session Resumption

```typescript
// Resume previous conversation
const session = await orchestrator.resumeConversation('session-123');

// Continue where left off
const response = await session.sendMessage({
  sender: 'coordinator',
  content:
    'Based on our previous discussion, shall we proceed with PostgreSQL?',
});
```

### Decision Tracking

```typescript
// Record conversation decision
await session.recordDecision({
  decision: 'proceed',
  reasoning: 'PostgreSQL chosen for ACID compliance and query flexibility',
  confidence: 0.85,
  participantConsensus: 0.9,
  modifications: ['Add connection pooling', 'Enable read replicas'],
});
```

### Context Management

```typescript
// Add context during conversation
await session.updateContext({
  newInformation: 'Performance requirements updated',
  changedConstraints: ['budget-increased'],
  additionalParticipants: ['database-expert'],
});
```

## Integration with Swarm Systems

The conversation framework integrates seamlessly with swarm coordination:

```typescript
import { EnhancedSwarmCommander } from '../coordination/agents/swarm-commander-enhanced';

const swarmCommander = new EnhancedSwarmCommander(
  {
    conversationMode: {
      enabled: true,
      useForTaskAssignment: true,
      useForArchitectureReviews: true,
      fallbackToDirectExecution: true,
    },
  },
  eventBus,
  memoryCoordinator
);

// Task assignment will now use conversation framework
const task = await swarmCommander.assignTask({
  title: 'Implement user authentication',
  requirements: ['oauth2', 'jwt', 'rate-limiting'],
});
```

## API Reference

### ConversationFramework

- `static create(config)`: Create conversation system
- `orchestrator`: Access conversation orchestrator
- `memory`: Access conversation memory

### ConversationOrchestrator

- `startConversation(config)`: Start new conversation
- `resumeConversation(sessionId)`: Resume existing conversation
- `listActiveConversations()`: Get active conversations
- `terminateConversation(sessionId)`: End conversation

### ConversationMemory

- `storeContext(sessionId, context)`: Store conversation context
- `getConversationHistory(sessionId)`: Retrieve conversation history
- `searchSimilarConversations(query)`: Find similar past conversations
- `exportConversations()`: Export conversation data

## License

MIT - See LICENSE file for details.
