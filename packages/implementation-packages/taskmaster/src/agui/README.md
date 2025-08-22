# AGUI Library - Autonomous Graphical User Interface

A comprehensive, production-ready library for human-in-the-loop interactions in autonomous systems. **Formerly the task-approval library**, now expanded into a complete AGUI ecosystem.

## Features

- **Multiple Adapters**: Terminal, Web, Mock, and Workflow implementations
- **Rich Interactions**: Formatted questions, progress indicators, context display, colored output
- **Task Approval System**: Complete human-in-the-loop approval workflows for generated tasks
- **Workflow Integration**: Built-in support for workflow gates and decision logging
- **Type Safety**: Full TypeScript support with comprehensive interfaces and error types
- **Event Driven**: Integration with event systems for audit trails and monitoring
- **Production Ready**: Comprehensive error handling, logging, configuration, and statistics
- **Batch Processing**: Support for bulk task approval and modification workflows
- **Rich Terminal UI**: Progress bars, colored output, structured information display

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AGUI Library                         │
├─────────────────┬───────────────────┬───────────────────┤
│   Core Types    │    Adapters       │  Task Approval    │
│                 │                   │     System        │
├─────────────────┼───────────────────┼───────────────────┤
│ • ValidationQ   │ • TerminalAGUI    │ • BatchApproval   │
│ • ProgressInfo  │ • MockAGUI        │ • TaskModification│
│ • AGUIConfig    │ • WorkflowAGUI    │ • Statistics      │
│ • Error Types   │ • (WebAGUI)       │ • Export/Audit   │
└─────────────────┴───────────────────┴───────────────────┘
                           │
                    ┌─────▼─────┐
                    │           │
                ┌───▼───┐   ┌───▼───┐   ┌─────────┐
                │Terminal│   │  Web  │   │ Custom  │
                │ AGUI   │   │ AGUI  │   │ Adapter │
                └────────┘   └───────┘   └─────────┘
```

## Quick Start

### Basic AGUI Usage

```typescript
import { createAGUI, createAGUISystem, AGUIType } from '@claude-zen/agui';

// Create terminal AGUI
const agui = createAGUI('terminal');

// Ask a question with rich formatting
const response = await agui.askQuestion({
  id: 'approve-deployment',
  type: 'approval', 
  question: 'Deploy to production?',
  options: ['Yes', 'No', 'Cancel'],
  confidence: 0.9,
  priority: 'high',
  context: {
    environment: 'production',
    services: ['api', 'frontend', 'database']
  }
});

// Show progress with rich display
await agui.showProgress({
  current: 5,
  total: 10,
  percentage: 50,
  description: 'Deploying services...',
  estimatedRemaining: 30000
});

// Display structured information
await agui.showInfo('Deployment Status', {
  environment: 'production',
  version: '1.2.3',
  services: {
    api: 'deployed',
    frontend: 'deploying', 
    database: 'pending'
  }
});
```

### Complete AGUI System with Task Approval

```typescript
import { createAGUISystem } from '@claude-zen/agui';

// Create complete system
const { agui, taskApproval } = await createAGUISystem({
  aguiType: 'terminal',
  taskApprovalConfig: {
    enableRichDisplay: true,
    enableBatchMode: true,
    batchSize: 5,
    autoApproveLowSeverity: true,
    requireRationale: true,
    enableModification: true
  }
});

// Process scan results with human approval
const results = await taskApproval.reviewGeneratedTasks(scanResults);

console.log(`Approved: ${results.approved}, Rejected: ${results.rejected}`);
```

### Task Approval Workflow

```typescript
import { createTaskApprovalSystem, createAGUI } from '@claude-zen/agui';

const agui = createAGUI('terminal');
const taskApproval = createTaskApprovalSystem(agui, {
  enableRichDisplay: true,
  enableBatchMode: true,
  batchSize: 3,
  requireRationale: true
});

// Review tasks generated from code scanning
const approvalResults = await taskApproval.reviewGeneratedTasks({
  scannedFiles: 20,
  totalIssues: 12,
  generatedTasks: [
    {
      id: 'task-001',
      title: 'Fix security vulnerability',
      description: 'Address SQL injection in login endpoint',
      type: 'bug',
      priority: 'critical',
      estimatedHours: 4,
      suggestedSwarmType: 'security-focused',
      requiredAgentTypes: ['security-expert', 'backend-dev'],
      acceptanceCriteria: [
        'Vulnerability patched',
        'Security tests added',
        'Code review completed'
      ],
      sourceAnalysis: {
        filePath: '/src/auth/login.ts',
        lineNumber: 45,
        type: 'security-vulnerability',
        severity: 'critical',
        tags: ['sql-injection', 'auth']
      }
    }
    // ... more tasks
  ],
  // ... other scan result fields
});

// Get statistics
const stats = taskApproval.getStatistics();
console.log(`Approval rate: ${Math.round(stats.approvalRate * 100)}%`);
```

## Available Adapters

### TerminalAGUI (Production Ready)
- Rich terminal formatting with colors and icons
- Progress bars and visual indicators
- Structured information display
- Context-aware question formatting
- Support for all AGUI interface methods

### MockAGUI (Testing)
- Automated responses for testing
- Configurable response patterns
- Debug logging for TDD workflows
- Lightweight and fast

### WorkflowAGUI (Advanced)
- Decision logging and audit trails
- Escalation chain management
- Timeout handling with fallbacks
- Integration with workflow systems

### WebAGUI (Coming Soon)
- Browser-based interface
- Rich HTML formatting
- Real-time updates
- Integration with web dashboards

## Type System

The AGUI library provides comprehensive TypeScript support:

```typescript
// Core types
import type {
  AGUIInterface,
  ValidationQuestion,
  QuestionType,
  Priority,
  MessageType,
  ProgressInfo,
  AGUIConfig,
  AGUIResponse,
  BatchQuestionResult
} from '@claude-zen/agui';

// Task approval types
import type {
  GeneratedSwarmTask,
  TaskApprovalDecision,
  BatchApprovalResults,
  TaskApprovalConfig,
  ApprovalStatistics,
  ScanResults
} from '@claude-zen/agui';

// Error types
import {
  AGUIError,
  AGUITimeoutError,
  AGUIValidationError
} from '@claude-zen/agui';
```

## Error Handling

```typescript
import { AGUIError, AGUITimeoutError, AGUIValidationError } from '@claude-zen/agui';

try {
  const response = await agui.askQuestion(question);
} catch (error) {
  if (error instanceof AGUITimeoutError) {
    console.log(`Question timed out after ${error.timeoutMs}ms`);
  } else if (error instanceof AGUIValidationError) {
    console.log(`Invalid input: ${error.input}`);
  } else if (error instanceof AGUIError) {
    console.log(`AGUI error: ${error.message} (${error.code})`);
  }
}
```

## Configuration

```typescript
const config: AGUIConfig = {
  enableRichFormatting: true,
  enableProgress: true,
  enableContextDisplay: true,
  defaultTimeout: 30000,
  enableLogging: true,
  theme: {
    primaryColor: 'blue',
    successColor: 'green',
    errorColor: 'red'
  }
};

const agui = createAGUI('terminal', config);
```

## Demo

Run the included demo to see all AGUI capabilities:

```bash
cd src/lib/agui
npx ts-node agui-demo.ts
```

The demo showcases:
- Basic question/answer workflows
- Rich progress display
- Message types and formatting
- Structured information display
- Complete task approval workflow
- Batch processing
- Statistics and audit trails

## Integration Examples

### With Swarm Systems
```typescript
// In swarm coordination
const agui = createAGUI('terminal');
const decision = await agui.askQuestion({
  id: 'swarm-approval',
  type: 'approval',
  question: 'Approve swarm execution plan?',
  context: { 
    agents: 5,
    estimatedCost: '$12.50',
    complexity: 'medium'
  }
});
```

### With Code Generation
```typescript
// In code generation workflows
const taskApproval = createTaskApprovalSystem(agui);
const results = await taskApproval.reviewGeneratedTasks(
  codeAnalyzer.generateTasksFromScan()
);
```

### With CI/CD Pipelines
```typescript
// In deployment workflows
await agui.showProgress({
  current: step,
  total: totalSteps,
  description: `Deploying ${serviceName}...`
});

const approval = await agui.askQuestion({
  type: 'confirmation',
  question: 'Continue with production deployment?',
  priority: 'critical'
});
```

## Migration from task-approval

If you were using the previous `task-approval` library:

```typescript
// Old
import { TaskApprovalSystem } from '../task-approval/task-approval-system';

// New  
import { TaskApprovalSystem } from '@claude-zen/agui';
// or
import { createTaskApprovalSystem } from '@claude-zen/agui';
```

All existing APIs are preserved - this is a non-breaking migration to a more comprehensive library.