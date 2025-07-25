# Server API Reference

The Claude Zen Server provides a schema-driven REST API with auto-generated endpoints based on the unified schema definition.

## Base Configuration

```javascript
const server = new ClaudeZenServer({
  port: 3000,           // Server port
  host: '0.0.0.0',      // Server host
  schema: CLAUDE_ZEN_SCHEMA  // Schema configuration
});
```

## API Endpoints

All endpoints are auto-generated from the schema and follow RESTful conventions.

### Strategic Visions

#### GET `/api/v1/visions`
Retrieve strategic product visions with phases, ROI, and approval status.

**Query Parameters:**
- `status` (string): Filter by vision status
  - Values: `pending`, `approved`, `rejected`, `in_progress`, `completed`
- `priority` (string): Filter by vision priority  
  - Values: `low`, `medium`, `high`, `critical`
- `category` (string): Filter by vision category (AI/ML, Blockchain, etc.)

**Response:**
```json
{
  "visions": [
    {
      "id": "vision-001",
      "title": "AI-Powered Code Generation",
      "status": "approved",
      "priority": "high",
      "category": "AI/ML",
      "phases": [
        {
          "name": "Research & Planning",
          "status": "completed",
          "duration": "2 weeks"
        },
        {
          "name": "Implementation",
          "status": "in_progress", 
          "duration": "6 weeks"
        }
      ],
      "roi": {
        "projected": "300%",
        "timeframe": "12 months"
      }
    }
  ]
}
```

### Architectural Decision Records (ADRs)

#### GET `/api/adrs`
Retrieve architectural decision records that guide development.

**Query Parameters:**
- `status` (string): Filter by decision status
  - Values: `proposed`, `accepted`, `rejected`, `superseded`
- `affects` (string): Filter by affected services/components
- `author` (string): Filter by decision author

**Response:**
```json
{
  "adrs": [
    {
      "id": "adr-001",
      "title": "Use SQLite for Primary Memory Store",
      "status": "accepted",
      "author": "rUv",
      "created": "2024-01-15T10:00:00Z",
      "affects": ["memory", "hive-mind", "swarm"],
      "context": "Need persistent memory for multi-Queen hives",
      "decision": "Use SQLite with LanceDB for vector operations",
      "consequences": ["Better performance", "Simplified architecture"]
    }
  ]
}
```

#### POST `/api/adrs/generate`
AI-powered ADR proposal generation based on system analysis.

**Request Body:**
```json
{
  "context": "Performance optimization needed",
  "analysisType": "performance",
  "minConfidence": 0.75,
  "impact": "high",
  "includeAlternatives": true
}
```

**Response:**
```json
{
  "proposals": [
    {
      "title": "Implement Caching Layer",
      "confidence": 0.89,
      "impact": "high",
      "alternatives": [
        "Redis caching",
        "In-memory caching",
        "Database optimization"
      ],
      "rationale": "Analysis shows 60% of requests are repetitive"
    }
  ]
}
```

### Projects & Epics

#### GET `/api/v1/projects`
Retrieve hierarchical project structure with epics and stories.

**Query Parameters:**
- `status` (string): `active`, `completed`, `archived`, `on_hold`
- `priority` (string): `low`, `medium`, `high`, `critical`
- `assignee` (string): Filter by assignee

**Response:**
```json
{
  "projects": [
    {
      "id": "proj-001",
      "name": "Multi-Queen Hive System",
      "status": "active",
      "priority": "high",
      "assignee": "team-alpha",
      "progress": 0.65,
      "epics": [
        {
          "id": "epic-001",
          "name": "Queen Communication Protocol",
          "status": "in_progress",
          "stories": [
            {
              "id": "story-001",
              "title": "Implement consensus mechanism",
              "status": "completed",
              "points": 8
            }
          ]
        }
      ]
    }
  ]
}
```

### Task Management

#### GET `/api/v1/tasks`
Retrieve task queue with status tracking.

**Query Parameters:**
- `status` (string): `todo`, `in_progress`, `completed`, `blocked`
- `assignee` (string): Filter by assignee
- `priority` (string): Task priority level
- `tags` (array): Filter by tags

**Response:**
```json
{
  "tasks": [
    {
      "id": "task-001",
      "title": "Implement vector search optimization",
      "status": "in_progress",
      "assignee": "dev-team",
      "priority": "high",
      "tags": ["performance", "search"],
      "estimatedHours": 16,
      "actualHours": 8,
      "dependencies": ["task-002"]
    }
  ]
}
```

#### POST `/api/v1/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Fix memory leak in swarm coordination",
  "description": "Memory usage grows during long-running swarm operations",
  "priority": "critical",
  "assignee": "dev-team",
  "tags": ["bug", "memory"],
  "estimatedHours": 8,
  "dueDate": "2024-02-01T00:00:00Z"
}
```

### Teams & Members

#### GET `/api/v1/teams`
Retrieve team structure and member assignments.

**Response:**
```json
{
  "teams": [
    {
      "id": "team-alpha",
      "name": "Core Development",
      "members": [
        {
          "id": "dev-001",
          "name": "Alice Johnson",
          "role": "Lead Developer",
          "skills": ["JavaScript", "Rust", "AI/ML"],
          "availability": 0.8
        }
      ],
      "currentProjects": ["proj-001", "proj-003"]
    }
  ]
}
```

## Schema-Driven Features

### Auto-Generated Routes
All endpoints are generated from the unified schema, ensuring consistency across:
- REST API endpoints
- CLI commands 
- Terminal UI interfaces
- WebSocket events

### OpenAPI Specification
Access the auto-generated OpenAPI spec at `/api/docs` for interactive documentation.

### Real-time Updates
WebSocket connections provide real-time updates for:
- Task status changes
- Project progress
- Team assignments
- System metrics

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid priority value",
    "details": {
      "field": "priority",
      "allowedValues": ["low", "medium", "high", "critical"]
    }
  }
}
```

## Rate Limiting

- Default: 100 requests per minute per IP
- Configurable via environment variables
- Premium endpoints may have different limits

## Authentication

Currently supports:
- API key authentication
- JWT tokens (where configured)
- Rate limiting by IP address

Future support planned for:
- OAuth 2.0
- Role-based access control
- Team-based permissions