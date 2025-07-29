# Maestro API Reference

## Overview

The Maestro API provides programmatic access to the specifications-driven development framework, enabling integration with external tools, IDEs, and automation systems.

## Core Classes

### MaestroOrchestrator

**File**: `src/maestro/maestro-orchestrator.ts`

The main orchestrator class that manages the complete specs-driven development workflow.

#### Constructor

```typescript
constructor(
  config: Config,
  eventBus: IEventBus,
  logger: ILogger,
  memoryManager: IMemoryManager,
  agentManager: AgentManager,
  mainOrchestrator: Orchestrator,
  maestroConfig: Partial<MaestroConfig> = {}
)
```

#### Configuration Options

```typescript
interface MaestroConfig {
  // Hive mind integration
  enableHiveMind: boolean;           // Enable collective intelligence
  consensusThreshold: number;        // Consensus validation threshold (0-1)
  maxAgents: number;                // Maximum agents for coordination
  
  // Feature toggles
  enableLivingDocumentation: boolean; // Bidirectional spec-code sync
  enableAgentHooks: boolean;         // Event-driven automation
  enablePatternLearning: boolean;    // Cross-project optimization
  
  // File system paths
  specsDirectory: string;            // Specifications storage directory
  steeringDirectory: string;         // Steering documents directory
}
```

#### Core Methods

##### Specification Management

```typescript
/**
 * Create a new feature specification with 3-file system
 * @param featureName - Unique identifier for the feature
 * @param initialRequest - User's feature description
 */
async createSpec(featureName: string, initialRequest: string): Promise<void>

/**
 * Generate technical design using hive mind collective intelligence
 * @param featureName - Feature to generate design for
 */
async generateDesign(featureName: string): Promise<void>

/**
 * Generate implementation tasks from technical design
 * @param featureName - Feature to decompose into tasks
 */
async generateTasks(featureName: string): Promise<void>
```

##### Task Implementation

```typescript
/**
 * Implement a specific task with optional consensus validation
 * @param featureName - Feature containing the task
 * @param taskId - 1-based task number to implement
 */
async implementTask(featureName: string, taskId: number): Promise<void>
```

##### Workflow Management

```typescript
/**
 * Approve current phase and progress to next workflow stage
 * @param featureName - Feature to approve phase for
 */
async approvePhase(featureName: string): Promise<void>

/**
 * Get current workflow state for a feature
 * @param featureName - Feature to query state for
 * @returns Current workflow state or undefined if not found
 */
getWorkflowState(featureName: string): MaestroWorkflowState | undefined
```

##### Hive Mind Integration

```typescript
/**
 * Initialize hive mind for collective intelligence
 * @returns Swarm ID if successful, null if disabled
 */
async initializeHiveMind(): Promise<string | null>
```

##### Steering Documents

```typescript
/**
 * Create steering document for domain-specific guidance
 * @param domain - Domain name (e.g., 'security', 'api-design')
 * @param content - Markdown content for the document
 */
async createSteeringDocument(domain: string, content: string): Promise<void>

/**
 * Get steering context for agent types
 * @param agentType - Type of agent requesting context
 * @param filePath - Optional specific file path
 * @returns Aggregated steering context
 */
async getSteeringContext(agentType: string, filePath?: string): Promise<string>
```

##### Lifecycle Management

```typescript
/**
 * Shutdown orchestrator and cleanup resources
 */
async shutdown(): Promise<void>
```

## Type Definitions

### Workflow State

```typescript
interface MaestroWorkflowState {
  featureName: string;
  currentPhase: WorkflowPhase;
  currentTaskIndex: number;
  status: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  lastActivity: Date;
  history: Array<{
    phase: WorkflowPhase;
    status: 'completed' | 'failed' | 'approved';
    timestamp: Date;
    output?: any;
    error?: string;
  }>;
}

type WorkflowPhase = 
  | 'Requirements Clarification'
  | 'Research & Design'
  | 'Implementation Planning'
  | 'Task Execution'
  | 'Completed';
```

### Specification Types

```typescript
interface MaestroSpec {
  name: string;
  description: string;
  version: string;
  goals: string[];
  workflow: WorkflowPhase[];
}

interface TaskItem {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  dependencies: string[];
  assignedAgent?: string;
  estimatedEffort?: number;
  actualEffort?: number;
}
```

### Agent Integration

```typescript
interface AgentProfile {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  maxConcurrentTasks: number;
  priority: number;
  metadata?: Record<string, any>;
}

interface SteeringContext {
  domain: string;
  guidelines: string[];
  standards: string[];
  patterns: string[];
  antiPatterns: string[];
}
```

## Event System

### Event Types

The Maestro system emits events through the integrated event bus for coordination and monitoring:

```typescript
// Specification events
'maestro:spec_created' - { featureName: string }
'maestro:design_generated' - { featureName: string }
'maestro:tasks_generated' - { featureName: string }

// Task events
'maestro:task_implemented' - { featureName: string, taskId: number, taskDescription: string }
'maestro:phase_approved' - { featureName: string, fromPhase: string, toPhase: string }

// Error events
'maestro:error' - { featureName: string, phase: string, error: Error }
```

### Event Handlers

```typescript
// Subscribe to Maestro events
maestro.eventBus.on('maestro:spec_created', (data) => {
  console.log(`New specification created: ${data.featureName}`);
});

maestro.eventBus.on('maestro:task_implemented', (data) => {
  console.log(`Task ${data.taskId} completed for ${data.featureName}`);
});
```

## Hive Mind Integration

### Collective Intelligence

```typescript
// Configure hive mind for design generation
const hiveMindConfig: HiveMindConfig = {
  name: 'maestro-collective',
  topology: 'hierarchical',
  queenMode: 'strategic',
  maxAgents: 8,
  consensusThreshold: 0.66,
  enableConsensus: true,
  enableMemory: true,
  enableCommunication: true
};

// Submit design task to collective intelligence
const taskOptions: TaskSubmitOptions = {
  description: `Generate comprehensive design for ${featureName}`,
  priority: 'high',
  strategy: 'adaptive',
  requiredCapabilities: ['system_design', 'architecture', 'technical_writing'],
  metadata: {
    maestroFeature: featureName,
    maestroPhase: 'Research & Design',
    requirements: requirementsContent
  }
};

const task = await hiveMind.submitTask(taskOptions);
const result = await waitForTaskCompletion(task.id);
```

### Consensus Validation

```typescript
// Create consensus proposal for critical decisions
const proposal: ConsensusProposal = {
  id: `maestro-task-${featureName}-${taskId}-${Date.now()}`,
  swarmId: hiveMind.id,
  proposal: {
    action: 'implement_task',
    featureName,
    taskId,
    taskDescription,
    details: `Implement task: ${taskDescription}`
  },
  requiredThreshold: 0.66,
  deadline: new Date(Date.now() + 300000), // 5 minutes
  creator: 'maestro-orchestrator'
};

const proposalId = await consensusEngine.createProposal(proposal);
const consensusResult = await waitForConsensusResult(proposalId);
```

## Agent Hooks Integration

### Hook Registration

```typescript
// Register workflow hooks for automation
agenticHookManager.register({
  id: 'maestro-spec-created',
  type: 'workflow-start',
  handler: async (payload, context) => {
    // Automated actions on spec creation
    console.log('Maestro spec creation hook triggered');
    return { continue: true };
  },
  priority: 50
});

agenticHookManager.register({
  id: 'maestro-task-completed',
  type: 'workflow-step', 
  handler: async (payload, context) => {
    // Automated actions on task completion
    console.log('Maestro task completion hook triggered');
    return { continue: true };
  },
  priority: 50
});
```

### Hook Execution

```typescript
// Execute hooks for workflow events
await agenticHookManager.executeHooks('workflow-start', {
  workflowId: `maestro-${featureName}`,
  state: { featureName, phase: 'spec-creation' }
} as any, hookContext);
```

## Error Handling

### Error Types

```typescript
// System errors
class SystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SystemError';
  }
}

// Common error scenarios
try {
  await maestro.createSpec(featureName, request);
} catch (error) {
  if (error instanceof SystemError) {
    // Handle system-level errors
    console.error(`System error: ${error.message}`);
  } else {
    // Handle unexpected errors
    console.error(`Unexpected error: ${error.message}`);
  }
}
```

### Error Recovery

```typescript
// Graceful error handling with recovery
async function robustTaskImplementation(featureName: string, taskId: number) {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      await maestro.implementTask(featureName, taskId);
      return; // Success
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error; // Final failure
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

## Usage Examples

### Basic Workflow

```typescript
import { MaestroOrchestrator } from './src/maestro/maestro-orchestrator.js';

// Initialize dependencies
const config = { /* ... */ };
const eventBus = new EventBus(logger);
const memoryManager = new MemoryManager(config, logger);
const agentManager = new AgentManager(config, eventBus, logger, memoryManager);
const orchestrator = new Orchestrator(config, eventBus, logger, memoryManager, agentManager);

// Create Maestro instance
const maestro = new MaestroOrchestrator(
  config,
  eventBus,
  logger,
  memoryManager,
  agentManager,
  orchestrator,
  {
    enableHiveMind: true,
    consensusThreshold: 0.66,
    maxAgents: 8,
    enableAgentHooks: true
  }
);

// Initialize hive mind
await maestro.initializeHiveMind();

// Complete workflow
await maestro.createSpec('user-auth', 'Implement secure user authentication');
await maestro.generateDesign('user-auth');
await maestro.approvePhase('user-auth');
await maestro.generateTasks('user-auth');

// Implement tasks
const state = maestro.getWorkflowState('user-auth');
if (state) {
  for (let i = 1; i <= 10; i++) { // Assuming 10 tasks
    await maestro.implementTask('user-auth', i);
  }
}

// Check final status
const finalState = maestro.getWorkflowState('user-auth');
console.log(`Workflow status: ${finalState?.status}`);
console.log(`Current phase: ${finalState?.currentPhase}`);
```

### Advanced Configuration

```typescript
// Enterprise configuration
const enterpriseConfig: Partial<MaestroConfig> = {
  enableHiveMind: true,
  consensusThreshold: 0.75, // Higher threshold for critical decisions
  maxAgents: 20,            // More agents for complex projects
  enableLivingDocumentation: true,
  enableAgentHooks: true,
  enablePatternLearning: true,
  specsDirectory: '/enterprise/specs',
  steeringDirectory: '/enterprise/steering'
};

const maestro = new MaestroOrchestrator(
  config,
  eventBus,
  logger,
  memoryManager,
  agentManager,
  orchestrator,
  enterpriseConfig
);
```

## Performance Considerations

### Optimization Tips

1. **Agent Count**: Start with 4-8 agents, scale up for complex projects
2. **Consensus Threshold**: Use 0.66 for balance, 0.75+ for critical decisions
3. **Memory Management**: Enable TTL expiration for long-running workflows
4. **Hook Optimization**: Use parallel hooks where possible for performance

### Resource Monitoring

```typescript
// Monitor resource usage
const metrics = await maestro.getMetrics();
console.log(`Active workflows: ${metrics.activeWorkflows}`);
console.log(`Memory usage: ${metrics.memoryUsage}MB`);
console.log(`Agent utilization: ${metrics.agentUtilization}%`);
```

## Migration Guide

### From Legacy Adapters

```typescript
// OLD: Using deprecated adapter
// import { adaptedMaestroHandler } from './maestro-command-adapter.js';

// NEW: Using clean implementation
import { MaestroOrchestrator } from './src/maestro/maestro-orchestrator.js';

// Initialize and use directly
const maestro = new MaestroOrchestrator(/* ... */);
```

### From Standalone Components

```typescript
// OLD: Standalone living documentation
// import { LivingDocumentationSync } from './living-documentation-sync.js';

// NEW: Integrated hooks system
import { agenticHookManager } from './src/services/agentic-flow-hooks/index.js';

// Use hooks for automation instead
agenticHookManager.register({
  id: 'doc-sync-hook',
  type: 'workflow-step',
  handler: async (payload, context) => {
    // Sync documentation
    return { continue: true };
  }
});
```

*Generated by Maestro API Documentation System*