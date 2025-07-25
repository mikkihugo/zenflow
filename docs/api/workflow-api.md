# Workflow Engine API

Claude Code Flow provides a sophisticated workflow engine for orchestrating complex, multi-step operations across swarms, agents, and external systems.

## Core Concepts

### Workflow Definition
A workflow is a directed graph of steps that can include:
- **MCP Tool Calls** - Execute MCP tools with parameters
- **API Requests** - Call external APIs or internal endpoints  
- **Swarm Tasks** - Orchestrate tasks across swarm agents
- **Conditional Logic** - Branch based on conditions
- **Parallel Execution** - Run multiple steps concurrently
- **Data Transformation** - Transform data between steps

### Workflow Components

```javascript
const workflow = {
  id: 'workflow-001',
  name: 'Code Analysis Pipeline',
  version: '1.0.0',
  description: 'Comprehensive code analysis and optimization',
  
  // Input parameters
  inputs: {
    repository: { type: 'string', required: true },
    branch: { type: 'string', default: 'main' },
    analysisTypes: { type: 'array', default: ['quality', 'security', 'performance'] }
  },
  
  // Output definition
  outputs: {
    analysisReport: { type: 'object' },
    recommendations: { type: 'array' },
    score: { type: 'number' }
  },
  
  // Workflow steps
  steps: [
    {
      id: 'clone-repo',
      name: 'Clone Repository',
      type: 'mcp-tool',
      tool: 'github_swarm_clone',
      inputs: {
        repository: '${inputs.repository}',
        branch: '${inputs.branch}'
      },
      outputs: {
        repoPath: 'path'
      }
    },
    {
      id: 'analyze-parallel',
      name: 'Parallel Analysis',
      type: 'parallel',
      steps: [
        {
          id: 'quality-analysis',
          type: 'swarm-task',
          task: 'code-quality-analysis',
          inputs: {
            path: '${clone-repo.outputs.repoPath}'
          }
        },
        {
          id: 'security-analysis', 
          type: 'swarm-task',
          task: 'security-analysis',
          inputs: {
            path: '${clone-repo.outputs.repoPath}'
          }
        }
      ]
    },
    {
      id: 'generate-report',
      name: 'Generate Final Report',
      type: 'function',
      function: 'aggregateResults',
      inputs: {
        qualityResults: '${quality-analysis.outputs}',
        securityResults: '${security-analysis.outputs}'
      }
    }
  ],
  
  // Error handling
  errorHandling: {
    strategy: 'continue-on-error',
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Timeouts
  timeouts: {
    overall: 300000, // 5 minutes
    stepDefault: 60000 // 1 minute per step
  }
};
```

## Workflow Execution

### Starting a Workflow

```javascript
import { WorkflowEngine } from '@claude-zen/monorepo';

const engine = new WorkflowEngine({
  swarmOrchestrator: swarmInstance,
  mcpServer: mcpInstance,
  memoryManager: memoryInstance
});

// Execute workflow
const execution = await engine.executeWorkflow('workflow-001', {
  repository: 'mikkihugo/claude-code-zen',
  branch: 'main',
  analysisTypes: ['quality', 'security', 'performance']
});

console.log('Execution ID:', execution.id);
```

### Monitoring Execution

```javascript
// Get execution status
const status = await engine.getExecutionStatus(execution.id);
console.log('Status:', status.state); // 'running', 'completed', 'failed', 'cancelled'

// Stream execution events
engine.on('execution-progress', (event) => {
  console.log(`Step ${event.stepId}: ${event.status}`);
});

// Wait for completion
const result = await engine.waitForCompletion(execution.id);
console.log('Final result:', result);
```

## Step Types

### 1. MCP Tool Steps

Execute MCP tools with dynamic parameters.

```javascript
{
  id: 'analyze-code',
  type: 'mcp-tool',
  tool: 'swarm_init',
  inputs: {
    topology: 'hierarchical',
    maxAgents: 8,
    strategy: '${inputs.strategy}'
  },
  outputs: {
    swarmId: 'swarmId'
  },
  timeout: 30000,
  retryPolicy: {
    attempts: 3,
    delay: 1000,
    backoff: 'exponential'
  }
}
```

### 2. API Call Steps

Make HTTP requests to internal or external APIs.

```javascript
{
  id: 'fetch-data',
  type: 'api-call',
  method: 'GET',
  url: 'https://api.github.com/repos/${inputs.owner}/${inputs.repo}',
  headers: {
    'Authorization': 'Bearer ${secrets.githubToken}',
    'Accept': 'application/vnd.github.v3+json'
  },
  outputs: {
    repoData: 'response'
  },
  errorHandling: {
    retryOn: [500, 502, 503, 504],
    maxRetries: 3
  }
}
```

### 3. Swarm Task Steps

Orchestrate tasks through the swarm system.

```javascript
{
  id: 'swarm-analysis',
  type: 'swarm-task',
  task: {
    type: 'code-analysis',
    target: '${previous-step.outputs.repoPath}',
    agents: {
      coordinator: 1,
      analyst: 2,
      reviewer: 1
    }
  },
  inputs: {
    analysisDepth: '${inputs.depth}',
    focusAreas: '${inputs.focusAreas}'
  },
  outputs: {
    analysisResults: 'results',
    metrics: 'metrics'
  }
}
```

### 4. Conditional Steps

Execute steps based on conditions.

```javascript
{
  id: 'conditional-optimization',
  type: 'conditional',
  condition: '${code-analysis.outputs.score} < 0.7',
  then: {
    id: 'optimization',
    type: 'swarm-task',
    task: 'code-optimization',
    inputs: {
      issues: '${code-analysis.outputs.issues}'
    }
  },
  else: {
    id: 'skip-optimization',
    type: 'function',
    function: 'logMessage',
    inputs: {
      message: 'Code quality sufficient, skipping optimization'
    }
  }
}
```

### 5. Parallel Steps

Execute multiple steps concurrently.

```javascript
{
  id: 'parallel-analysis',
  type: 'parallel',
  concurrency: 3, // Max 3 concurrent steps
  steps: [
    {
      id: 'security-scan',
      type: 'mcp-tool',
      tool: 'security_scan',
      inputs: { scope: 'full' }
    },
    {
      id: 'performance-test',
      type: 'mcp-tool', 
      tool: 'performance_benchmark',
      inputs: { duration: 60 }
    },
    {
      id: 'dependency-check',
      type: 'function',
      function: 'checkDependencies',
      inputs: { manifest: '${inputs.packageJson}' }
    }
  ],
  collectOutputs: true, // Collect all outputs
  failFast: false // Continue even if some steps fail
}
```

### 6. Loop Steps

Iterate over collections or repeat until conditions are met.

```javascript
{
  id: 'process-files',
  type: 'loop',
  loopType: 'for-each',
  collection: '${file-discovery.outputs.files}',
  item: 'file',
  body: {
    id: 'process-file',
    type: 'function',
    function: 'processFile',
    inputs: {
      filePath: '${file}',
      options: '${inputs.processOptions}'
    }
  },
  outputs: {
    results: 'collect' // Collect all iteration results
  }
}
```

### 7. Function Steps

Execute custom JavaScript functions.

```javascript
{
  id: 'data-transform',
  type: 'function',
  function: 'transformData',
  code: `
    function transformData(inputs) {
      const { rawData, format } = inputs;
      
      if (format === 'csv') {
        return convertToCSV(rawData);
      } else if (format === 'json') {
        return JSON.stringify(rawData, null, 2);
      }
      
      return rawData;
    }
  `,
  inputs: {
    rawData: '${data-collection.outputs.data}',
    format: '${inputs.outputFormat}'
  },
  outputs: {
    transformedData: 'result'
  }
}
```

## Data Flow & Variables

### Variable References

Access data from previous steps, inputs, or system variables:

```javascript
// Input parameters
'${inputs.parameterName}'

// Step outputs
'${stepId.outputs.fieldName}'

// System variables
'${system.timestamp}'
'${system.executionId}'
'${system.workflowId}'

// Environment variables
'${env.NODE_ENV}'

// Secrets (secure storage)
'${secrets.apiKey}'

// Context variables
'${context.userId}'
'${context.sessionId}'
```

### Data Transformation

Transform data between steps:

```javascript
{
  id: 'transform-results',
  type: 'transform',
  transformations: [
    {
      source: '${analysis.outputs.results}',
      target: 'processedResults',
      operation: 'map',
      expression: 'item => ({ ...item, score: item.score * 100 })'
    },
    {
      source: '${analysis.outputs.errors}',
      target: 'errorCount',
      operation: 'count'
    }
  ]
}
```

## Error Handling

### Workflow-Level Error Handling

```javascript
const workflow = {
  // ... other properties
  
  errorHandling: {
    strategy: 'fail-fast', // 'fail-fast', 'continue-on-error', 'retry-all'
    retryAttempts: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    
    // Custom error handlers
    onError: {
      type: 'function',
      function: 'handleWorkflowError',
      inputs: {
        error: '${error}',
        step: '${failedStep}',
        context: '${context}'
      }
    },
    
    // Cleanup on failure
    cleanup: [
      {
        type: 'mcp-tool',
        tool: 'cleanup_resources',
        inputs: { executionId: '${system.executionId}' }
      }
    ]
  }
};
```

### Step-Level Error Handling

```javascript
{
  id: 'risky-operation',
  type: 'api-call',
  url: 'https://external-api.com/data',
  
  errorHandling: {
    retryOn: [500, 502, 503, 504, 'timeout'],
    maxRetries: 3,
    retryDelay: 2000,
    
    fallback: {
      type: 'function',
      function: 'useDefaultData',
      inputs: { reason: '${error.message}' }
    },
    
    continueOnError: true
  }
}
```

## Advanced Features

### Workflow Templates

Create reusable workflow templates:

```javascript
const templates = {
  'code-analysis-template': {
    inputs: {
      repository: { type: 'string', required: true },
      analysisTypes: { type: 'array', default: ['quality'] }
    },
    steps: [
      // Template steps...
    ]
  }
};

// Use template
const workflow = await engine.createFromTemplate('code-analysis-template', {
  repository: 'my-repo',
  analysisTypes: ['quality', 'security']
});
```

### Workflow Composition

Combine multiple workflows:

```javascript
{
  id: 'composite-workflow',
  type: 'workflow',
  workflow: 'sub-workflow-id',
  inputs: {
    param1: '${inputs.value1}',
    param2: '${previous-step.outputs.value2}'
  },
  outputs: {
    finalResult: 'result'
  }
}
```

### Dynamic Step Generation

Generate steps dynamically based on runtime data:

```javascript
{
  id: 'dynamic-processing',
  type: 'dynamic',
  generator: {
    type: 'function',
    function: 'generateSteps',
    inputs: {
      fileList: '${file-discovery.outputs.files}',
      processingType: '${inputs.processingType}'
    }
  }
}
```

### Workflow Scheduling

Schedule workflows for execution:

```javascript
// Schedule recurring workflow
await engine.scheduleWorkflow('daily-analysis', {
  schedule: '0 9 * * *', // Daily at 9 AM
  inputs: {
    repository: 'main-project',
    reportEmail: 'team@company.com'
  },
  timezone: 'UTC'
});

// Schedule one-time workflow
await engine.scheduleWorkflow('deployment', {
  executeAt: new Date('2024-02-01T18:00:00Z'),
  inputs: {
    version: 'v1.2.0',
    environment: 'production'
  }
});
```

## Workflow Management API

### Create Workflow

```http
POST /api/workflows
Content-Type: application/json

{
  "name": "My Workflow",
  "description": "Custom workflow description",
  "inputs": { /* input schema */ },
  "steps": [ /* step definitions */ ]
}
```

### Execute Workflow

```http
POST /api/workflows/{workflowId}/execute
Content-Type: application/json

{
  "inputs": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### Get Execution Status

```http
GET /api/workflows/executions/{executionId}
```

**Response:**
```json
{
  "id": "exec-12345",
  "workflowId": "workflow-001",
  "status": "running",
  "startTime": "2024-01-01T12:00:00Z",
  "currentStep": "analyze-code",
  "progress": 0.65,
  "steps": [
    {
      "id": "clone-repo",
      "status": "completed",
      "startTime": "2024-01-01T12:00:00Z",
      "endTime": "2024-01-01T12:01:30Z",
      "duration": 90000,
      "outputs": {
        "repoPath": "/tmp/repo-12345"
      }
    }
  ]
}
```

### List Workflows

```http
GET /api/workflows?status=active&tag=analysis
```

### Cancel Execution

```http
POST /api/workflows/executions/{executionId}/cancel
```

## Performance Optimization

### Parallel Execution

Maximize concurrency where possible:

```javascript
{
  id: 'parallel-tasks',
  type: 'parallel',
  concurrency: 'auto', // Use available CPU cores
  steps: [
    // Independent tasks that can run in parallel
  ]
}
```

### Caching

Cache expensive operations:

```javascript
{
  id: 'expensive-operation',
  type: 'mcp-tool',
  tool: 'complex_analysis',
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    key: 'analysis-${inputs.repository}-${inputs.commitHash}'
  }
}
```

### Resource Limits

Control resource usage:

```javascript
{
  id: 'resource-intensive-step',
  type: 'swarm-task',
  resources: {
    memory: '2GB',
    cpu: '2 cores',
    timeout: 600000 // 10 minutes
  }
}
```

## Monitoring & Observability

### Workflow Metrics

```javascript
// Get workflow metrics
const metrics = await engine.getMetrics('workflow-001');
console.log({
  totalExecutions: metrics.totalExecutions,
  successRate: metrics.successRate,
  averageDuration: metrics.averageDuration,
  errorRate: metrics.errorRate
});
```

### Real-time Monitoring

```javascript
// Subscribe to execution events
engine.on('execution-started', (event) => {
  console.log(`Workflow ${event.workflowId} started`);
});

engine.on('step-completed', (event) => {
  console.log(`Step ${event.stepId} completed in ${event.duration}ms`);
});

engine.on('execution-failed', (event) => {
  console.error(`Workflow failed: ${event.error}`);
});
```

### Logging Integration

```javascript
{
  id: 'logged-step',
  type: 'mcp-tool',
  tool: 'analyze_data',
  logging: {
    enabled: true,
    level: 'info',
    includeInputs: false, // For security
    includeOutputs: true
  }
}
```

## Best Practices

### Workflow Design

1. **Idempotency**: Design steps to be safely retryable
2. **Atomicity**: Keep steps focused on single responsibilities
3. **Error Handling**: Plan for failure scenarios
4. **Resource Management**: Set appropriate timeouts and limits

### Security

1. **Input Validation**: Validate all workflow inputs
2. **Secret Management**: Use secure secret storage
3. **Permission Checks**: Verify execution permissions
4. **Audit Logging**: Log all workflow executions

### Performance

1. **Parallel Execution**: Use parallel steps for independent operations
2. **Caching**: Cache expensive or redundant operations
3. **Resource Optimization**: Monitor and optimize resource usage
4. **Batch Processing**: Group similar operations together

### Maintenance

1. **Version Control**: Version your workflows
2. **Testing**: Test workflows with various inputs
3. **Documentation**: Document workflow purpose and usage
4. **Monitoring**: Set up alerts for workflow failures