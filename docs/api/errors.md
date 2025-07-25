# Error Codes Reference

Claude Code Flow uses structured error codes for consistent error handling across all APIs and components.

## Error Response Format

All errors follow a consistent JSON structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "specific field that caused error",
      "value": "invalid value",
      "expected": "expected value or format"
    },
    "timestamp": "2024-01-01T12:00:00Z",
    "requestId": "req-12345",
    "context": {
      "component": "api-server",
      "operation": "create_vision"
    }
  }
}
```

## HTTP Status Code Mapping

| HTTP Status | Usage | Error Categories |
|-------------|-------|------------------|
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Authentication failures |
| 403 | Forbidden | Authorization failures |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflicts, concurrency issues |
| 422 | Unprocessable Entity | Business logic validation failures |
| 429 | Too Many Requests | Rate limiting |
| 500 | Internal Server Error | System errors |
| 502 | Bad Gateway | External service errors |
| 503 | Service Unavailable | System overload, maintenance |

## Error Code Categories

### Validation Errors (1000-1999)

#### 1001-1099: Input Validation

| Code | Message | Description |
|------|---------|-------------|
| `VALIDATION_ERROR_1001` | Required field missing | A required field was not provided |
| `VALIDATION_ERROR_1002` | Invalid field type | Field type doesn't match expected type |
| `VALIDATION_ERROR_1003` | Invalid field format | Field format is invalid (e.g., email, URL) |
| `VALIDATION_ERROR_1004` | Field value out of range | Numeric field outside allowed range |
| `VALIDATION_ERROR_1005` | Invalid enum value | Value not in allowed enumeration |
| `VALIDATION_ERROR_1006` | String too long | String exceeds maximum length |
| `VALIDATION_ERROR_1007` | String too short | String below minimum length |
| `VALIDATION_ERROR_1008` | Invalid array length | Array has invalid number of items |
| `VALIDATION_ERROR_1009` | Duplicate values | Array contains duplicate values when unique required |
| `VALIDATION_ERROR_1010` | Invalid JSON format | Request body is not valid JSON |

**Example:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR_1005",
    "message": "Invalid priority value",
    "details": {
      "field": "priority",
      "value": "urgent",
      "expected": ["low", "medium", "high", "critical"]
    }
  }
}
```

#### 1101-1199: Schema Validation

| Code | Message | Description |
|------|---------|-------------|
| `SCHEMA_ERROR_1101` | Invalid schema definition | Schema definition is malformed |
| `SCHEMA_ERROR_1102` | Missing required schema | Required schema not found |
| `SCHEMA_ERROR_1103` | Schema version mismatch | Schema version incompatible |
| `SCHEMA_ERROR_1104` | Circular schema reference | Schema contains circular references |
| `SCHEMA_ERROR_1105` | Unknown schema property | Property not defined in schema |

### Authentication & Authorization Errors (2000-2999)

#### 2001-2099: Authentication

| Code | Message | Description |
|------|---------|-------------|
| `AUTH_ERROR_2001` | Missing authentication | No authentication credentials provided |
| `AUTH_ERROR_2002` | Invalid credentials | Authentication credentials are invalid |
| `AUTH_ERROR_2003` | Token expired | Authentication token has expired |
| `AUTH_ERROR_2004` | Token malformed | Authentication token format is invalid |
| `AUTH_ERROR_2005` | Authentication failed | General authentication failure |
| `AUTH_ERROR_2006` | Account locked | User account is locked |
| `AUTH_ERROR_2007` | Account disabled | User account is disabled |
| `AUTH_ERROR_2008` | Password expired | User password has expired |
| `AUTH_ERROR_2009` | MFA required | Multi-factor authentication required |
| `AUTH_ERROR_2010` | Invalid MFA code | Multi-factor authentication code invalid |

#### 2101-2199: Authorization

| Code | Message | Description |
|------|---------|-------------|
| `AUTHZ_ERROR_2101` | Permission denied | User lacks required permission |
| `AUTHZ_ERROR_2102` | Role required | Specific role required for operation |
| `AUTHZ_ERROR_2103` | Resource access denied | Access to specific resource denied |
| `AUTHZ_ERROR_2104` | Operation not allowed | Operation not permitted for user |
| `AUTHZ_ERROR_2105` | Quota exceeded | User quota exceeded |
| `AUTHZ_ERROR_2106` | License required | Valid license required |
| `AUTHZ_ERROR_2107` | Feature disabled | Feature not enabled for user |

### Resource Errors (3000-3999)

#### 3001-3099: Resource Not Found

| Code | Message | Description |
|------|---------|-------------|
| `RESOURCE_ERROR_3001` | Vision not found | Specified vision does not exist |
| `RESOURCE_ERROR_3002` | ADR not found | Specified ADR does not exist |
| `RESOURCE_ERROR_3003` | Project not found | Specified project does not exist |
| `RESOURCE_ERROR_3004` | Task not found | Specified task does not exist |
| `RESOURCE_ERROR_3005` | Team not found | Specified team does not exist |
| `RESOURCE_ERROR_3006` | Member not found | Specified member does not exist |
| `RESOURCE_ERROR_3007` | Swarm not found | Specified swarm does not exist |
| `RESOURCE_ERROR_3008` | Agent not found | Specified agent does not exist |
| `RESOURCE_ERROR_3009` | Workflow not found | Specified workflow does not exist |
| `RESOURCE_ERROR_3010` | Execution not found | Specified execution does not exist |

#### 3101-3199: Resource Conflicts

| Code | Message | Description |
|------|---------|-------------|
| `CONFLICT_ERROR_3101` | Resource already exists | Resource with same identifier exists |
| `CONFLICT_ERROR_3102` | Concurrent modification | Resource modified by another request |
| `CONFLICT_ERROR_3103` | Version conflict | Resource version mismatch |
| `CONFLICT_ERROR_3104` | Dependency conflict | Operation conflicts with dependencies |
| `CONFLICT_ERROR_3105` | State conflict | Resource in incompatible state |
| `CONFLICT_ERROR_3106` | Circular dependency | Circular dependency detected |
| `CONFLICT_ERROR_3107` | Resource locked | Resource is locked by another operation |

### MCP Errors (4000-4999)

#### 4001-4099: MCP Protocol

| Code | Message | Description |
|------|---------|-------------|
| `MCP_ERROR_4001` | Tool not found | Specified MCP tool does not exist |
| `MCP_ERROR_4002` | Invalid tool input | Tool input doesn't match schema |
| `MCP_ERROR_4003` | Tool execution failed | Tool execution encountered error |
| `MCP_ERROR_4004` | Tool timeout | Tool execution timed out |
| `MCP_ERROR_4005` | Tool not available | Tool temporarily unavailable |
| `MCP_ERROR_4006` | Invalid MCP message | MCP message format invalid |
| `MCP_ERROR_4007` | MCP protocol error | General MCP protocol error |
| `MCP_ERROR_4008` | Tool permission denied | Permission denied for tool execution |
| `MCP_ERROR_4009` | Tool rate limited | Tool execution rate limited |
| `MCP_ERROR_4010` | Tool resource exhausted | Tool resources exhausted |

#### 4101-4199: MCP Tool Specific

| Code | Message | Description |
|------|---------|-------------|
| `MCP_SWARM_4101` | Swarm initialization failed | Failed to initialize swarm |
| `MCP_SWARM_4102` | Agent spawn failed | Failed to spawn agent |
| `MCP_SWARM_4103` | Task orchestration failed | Failed to orchestrate task |
| `MCP_SWARM_4104` | Swarm not active | Swarm is not in active state |
| `MCP_SWARM_4105` | Agent not responsive | Agent not responding |
| `MCP_MEMORY_4151` | Memory store failed | Failed to store in memory |
| `MCP_MEMORY_4152` | Memory retrieve failed | Failed to retrieve from memory |
| `MCP_MEMORY_4153` | Memory search failed | Memory search operation failed |
| `MCP_MEMORY_4154` | Vector search failed | Vector search operation failed |
| `MCP_GITHUB_4201` | GitHub API error | GitHub API request failed |
| `MCP_GITHUB_4202` | Repository not found | GitHub repository not found |
| `MCP_GITHUB_4203` | GitHub auth failed | GitHub authentication failed |

### Swarm Errors (5000-5999)

#### 5001-5099: Swarm Management

| Code | Message | Description |
|------|---------|-------------|
| `SWARM_ERROR_5001` | Swarm creation failed | Failed to create swarm |
| `SWARM_ERROR_5002` | Swarm destruction failed | Failed to destroy swarm |
| `SWARM_ERROR_5003` | Invalid topology | Swarm topology not supported |
| `SWARM_ERROR_5004` | Insufficient resources | Not enough resources for swarm |
| `SWARM_ERROR_5005` | Swarm already exists | Swarm with ID already exists |
| `SWARM_ERROR_5006` | Swarm not initialized | Swarm not properly initialized |
| `SWARM_ERROR_5007` | Max swarms exceeded | Maximum number of swarms reached |
| `SWARM_ERROR_5008` | Swarm configuration error | Invalid swarm configuration |

#### 5101-5199: Agent Management

| Code | Message | Description |
|------|---------|-------------|
| `AGENT_ERROR_5101` | Agent spawn failed | Failed to spawn agent |
| `AGENT_ERROR_5102` | Agent not found | Specified agent not found |
| `AGENT_ERROR_5103` | Agent not responsive | Agent not responding to commands |
| `AGENT_ERROR_5104` | Agent capability mismatch | Agent lacks required capabilities |
| `AGENT_ERROR_5105` | Max agents exceeded | Maximum agents per swarm reached |
| `AGENT_ERROR_5106` | Agent already assigned | Agent already assigned to task |
| `AGENT_ERROR_5107` | Agent state invalid | Agent in invalid state for operation |

#### 5201-5299: Task Management

| Code | Message | Description |
|------|---------|-------------|
| `TASK_ERROR_5201` | Task creation failed | Failed to create task |
| `TASK_ERROR_5202` | Task assignment failed | Failed to assign task to agent |
| `TASK_ERROR_5203` | Task execution failed | Task execution encountered error |
| `TASK_ERROR_5204` | Task timeout | Task execution timed out |
| `TASK_ERROR_5205` | Task cancellation failed | Failed to cancel task |
| `TASK_ERROR_5206` | Invalid task priority | Task priority value invalid |
| `TASK_ERROR_5207` | Task dependency failed | Task dependency not satisfied |
| `TASK_ERROR_5208` | Task queue full | Task queue at capacity |

### Memory Errors (6000-6999)

#### 6001-6099: SQLite Errors

| Code | Message | Description |
|------|---------|-------------|
| `SQLITE_ERROR_6001` | Database connection failed | Failed to connect to SQLite database |
| `SQLITE_ERROR_6002` | Query execution failed | SQL query execution failed |
| `SQLITE_ERROR_6003` | Transaction failed | Database transaction failed |
| `SQLITE_ERROR_6004` | Schema migration failed | Database schema migration failed |
| `SQLITE_ERROR_6005` | Database locked | Database file is locked |
| `SQLITE_ERROR_6006` | Disk full | Insufficient disk space |
| `SQLITE_ERROR_6007` | Corruption detected | Database corruption detected |
| `SQLITE_ERROR_6008` | Constraint violation | Database constraint violated |

#### 6101-6199: Vector Database Errors

| Code | Message | Description |
|------|---------|-------------|
| `VECTOR_ERROR_6101` | Vector store failed | Failed to store vector |
| `VECTOR_ERROR_6102` | Vector search failed | Vector search operation failed |
| `VECTOR_ERROR_6103` | Embedding generation failed | Failed to generate embedding |
| `VECTOR_ERROR_6104` | Invalid vector dimensions | Vector dimensions mismatch |
| `VECTOR_ERROR_6105` | Index not found | Vector index not found |
| `VECTOR_ERROR_6106` | Index creation failed | Failed to create vector index |
| `VECTOR_ERROR_6107` | Vector not found | Specified vector not found |

#### 6201-6299: Graph Database Errors

| Code | Message | Description |
|------|---------|-------------|
| `GRAPH_ERROR_6201` | Node creation failed | Failed to create graph node |
| `GRAPH_ERROR_6202` | Relationship creation failed | Failed to create relationship |
| `GRAPH_ERROR_6203` | Graph query failed | Graph query execution failed |
| `GRAPH_ERROR_6204` | Node not found | Specified node not found |
| `GRAPH_ERROR_6205` | Relationship not found | Specified relationship not found |
| `GRAPH_ERROR_6206` | Cypher syntax error | Graph query syntax error |
| `GRAPH_ERROR_6207` | Graph constraint violation | Graph constraint violated |

### Workflow Errors (7000-7999)

#### 7001-7099: Workflow Definition

| Code | Message | Description |
|------|---------|-------------|
| `WORKFLOW_ERROR_7001` | Invalid workflow definition | Workflow definition is invalid |
| `WORKFLOW_ERROR_7002` | Workflow not found | Specified workflow not found |
| `WORKFLOW_ERROR_7003` | Workflow validation failed | Workflow validation failed |
| `WORKFLOW_ERROR_7004` | Circular dependency | Workflow has circular dependencies |
| `WORKFLOW_ERROR_7005` | Missing step definition | Required step definition missing |
| `WORKFLOW_ERROR_7006` | Invalid step type | Step type not supported |
| `WORKFLOW_ERROR_7007` | Workflow version conflict | Workflow version incompatible |

#### 7101-7199: Workflow Execution

| Code | Message | Description |
|------|---------|-------------|
| `EXECUTION_ERROR_7101` | Execution failed | Workflow execution failed |
| `EXECUTION_ERROR_7102` | Execution timeout | Workflow execution timed out |
| `EXECUTION_ERROR_7103` | Execution cancelled | Workflow execution was cancelled |
| `EXECUTION_ERROR_7104` | Step execution failed | Individual step execution failed |
| `EXECUTION_ERROR_7105` | Invalid execution state | Execution in invalid state |
| `EXECUTION_ERROR_7106` | Resource exhausted | Execution resources exhausted |
| `EXECUTION_ERROR_7107` | Execution not found | Specified execution not found |

### System Errors (8000-8999)

#### 8001-8099: System Resources

| Code | Message | Description |
|------|---------|-------------|
| `SYSTEM_ERROR_8001` | Out of memory | System out of memory |
| `SYSTEM_ERROR_8002` | CPU overload | System CPU overloaded |
| `SYSTEM_ERROR_8003` | Disk space full | System disk space exhausted |
| `SYSTEM_ERROR_8004` | Network unavailable | Network connectivity unavailable |
| `SYSTEM_ERROR_8005` | Service unavailable | Required service unavailable |
| `SYSTEM_ERROR_8006` | Dependency unavailable | Required dependency unavailable |
| `SYSTEM_ERROR_8007` | Configuration error | System configuration error |

#### 8101-8199: API Rate Limiting

| Code | Message | Description |
|------|---------|-------------|
| `RATE_LIMIT_ERROR_8101` | Rate limit exceeded | API rate limit exceeded |
| `RATE_LIMIT_ERROR_8102` | Quota exceeded | API quota exceeded |
| `RATE_LIMIT_ERROR_8103` | Concurrent limit exceeded | Concurrent request limit exceeded |
| `RATE_LIMIT_ERROR_8104` | Burst limit exceeded | API burst limit exceeded |

### External Service Errors (9000-9999)

#### 9001-9099: GitHub API

| Code | Message | Description |
|------|---------|-------------|
| `GITHUB_ERROR_9001` | GitHub API unavailable | GitHub API service unavailable |
| `GITHUB_ERROR_9002` | GitHub rate limit | GitHub API rate limit exceeded |
| `GITHUB_ERROR_9003` | GitHub authentication failed | GitHub authentication failed |
| `GITHUB_ERROR_9004` | Repository access denied | GitHub repository access denied |

#### 9101-9199: AI Provider Errors

| Code | Message | Description |
|------|---------|-------------|
| `AI_ERROR_9101` | AI provider unavailable | AI provider service unavailable |
| `AI_ERROR_9102` | AI quota exceeded | AI provider quota exceeded |
| `AI_ERROR_9103` | Invalid AI model | AI model not available |
| `AI_ERROR_9104` | AI request failed | AI provider request failed |

## Error Handling Patterns

### Client-Side Error Handling

```javascript
try {
  const response = await fetch('/api/v1/visions', {
    method: 'POST',
    body: JSON.stringify(visionData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    handleApiError(error);
    return;
  }
  
  const result = await response.json();
  // Success handling
} catch (error) {
  // Network or other errors
  handleNetworkError(error);
}

function handleApiError(errorResponse) {
  const { code, message, details } = errorResponse.error;
  
  switch (code) {
    case 'VALIDATION_ERROR_1005':
      showFieldError(details.field, `Invalid ${details.field}: ${details.value}`);
      break;
    
    case 'AUTH_ERROR_2002':
      redirectToLogin();
      break;
    
    case 'RATE_LIMIT_ERROR_8101':
      showMessage('Too many requests. Please try again later.');
      break;
    
    default:
      showMessage(`Error: ${message}`);
  }
}
```

### Server-Side Error Generation

```javascript
// Validation error
if (!allowedValues.includes(priority)) {
  return res.status(400).json({
    error: {
      code: 'VALIDATION_ERROR_1005',
      message: 'Invalid priority value',
      details: {
        field: 'priority',
        value: priority,
        expected: allowedValues
      },
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  });
}

// Resource not found
if (!vision) {
  return res.status(404).json({
    error: {
      code: 'RESOURCE_ERROR_3001',
      message: 'Vision not found',
      details: {
        visionId: req.params.id
      },
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  });
}
```

### Error Recovery Strategies

```javascript
class ErrorHandler {
  static async handleWithRetry(operation, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (this.isRetryableError(error) && attempt < maxRetries) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
          continue;
        }
        throw error;
      }
    }
  }
  
  static isRetryableError(error) {
    const retryableCodes = [
      'SYSTEM_ERROR_8004', // Network unavailable
      'SYSTEM_ERROR_8005', // Service unavailable
      'GITHUB_ERROR_9001', // GitHub API unavailable
      'AI_ERROR_9101'      // AI provider unavailable
    ];
    
    return retryableCodes.includes(error.code);
  }
  
  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Custom Error Classes

```javascript
class ClaudeZenError extends Error {
  constructor(code, message, details = {}, statusCode = 500) {
    super(message);
    this.name = 'ClaudeZenError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
  
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp
      }
    };
  }
}

// Usage
throw new ClaudeZenError(
  'VALIDATION_ERROR_1005',
  'Invalid priority value',
  {
    field: 'priority',
    value: 'urgent',
    expected: ['low', 'medium', 'high', 'critical']
  },
  400
);
```

## Error Monitoring

### Error Tracking

```javascript
// Log all errors for monitoring
app.use((error, req, res, next) => {
  const errorLog = {
    code: error.code,
    message: error.message,
    details: error.details,
    requestId: req.id,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  };
  
  // Send to monitoring service
  monitoringService.logError(errorLog);
  
  // Send error response
  res.status(error.statusCode || 500).json(error.toJSON());
});
```

### Error Metrics

Track error metrics for system health:

- Error rate by endpoint
- Error rate by error code
- Error trends over time
- Most common error types
- Error recovery success rate

### Alert Thresholds

Set up alerts for:
- Error rate > 5% over 5 minutes
- Authentication failures > 10/minute
- System resource errors
- External service failures
- Database connection failures