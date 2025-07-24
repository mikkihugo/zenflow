# 📄 Vision-to-Code API Contracts
## **Service Communication Specifications**

### **🔐 Authentication & Security**

All service-to-service communication uses JWT tokens with service-specific claims:

```json
{
  "sub": "service:business-service",
  "aud": ["core-service", "swarm-service"],
  "iat": 1234567890,
  "exp": 1234567950,
  "permissions": ["vision:create", "workflow:register"],
  "service_id": "business-service-prod-1"
}
```

---

## 🏢 **Business Service APIs**

### **Vision Management Endpoints**

#### **POST /api/v1/visions**
Create a new strategic vision.

**Request:**
```json
{
  "title": "AI-Powered Development Platform",
  "description": "Create a comprehensive development platform using AI",
  "strategic_goals": [
    "Increase developer productivity by 10x",
    "Reduce bugs by 90%",
    "Automate repetitive tasks"
  ],
  "timeline_months": 6,
  "budget_usd": 500000,
  "stakeholders": ["cto@company.com", "product@company.com"],
  "priority": "high"
}
```

**Response:**
```json
{
  "vision_id": "vis_2024_ai_platform",
  "status": "draft",
  "created_at": "2024-01-15T10:00:00Z",
  "enhanced_with_ai": true,
  "gemini_insights": {
    "feasibility_score": 0.85,
    "risk_assessment": "medium",
    "recommended_phases": 3
  },
  "next_steps": ["stakeholder_review", "technical_feasibility"],
  "workflow_id": "wf_vis_2024_ai_platform"
}
```

#### **PUT /api/v1/visions/:id/approve**
Approve a vision for technical planning.

**Request:**
```json
{
  "approver_email": "cto@company.com",
  "approval_notes": "Approved with budget adjustment",
  "conditions": ["quarterly_review", "phased_delivery"]
}
```

**Response:**
```json
{
  "vision_id": "vis_2024_ai_platform",
  "status": "approved",
  "approval_timestamp": "2024-01-16T14:30:00Z",
  "technical_planning_initiated": true,
  "swarm_coordination_id": "swarm_vis_2024_ai_platform"
}
```

#### **GET /api/v1/visions/:id/roadmap**
Get the generated roadmap for a vision.

**Response:**
```json
{
  "vision_id": "vis_2024_ai_platform",
  "roadmap": {
    "phases": [
      {
        "phase": 1,
        "name": "Foundation",
        "duration_weeks": 8,
        "features": ["core_infrastructure", "basic_ai_integration"],
        "milestones": ["mvp_ready", "initial_testing"]
      }
    ],
    "dependencies": {
      "technical": ["kubernetes", "postgresql", "redis"],
      "human": ["ml_engineer", "devops_engineer"]
    },
    "risk_mitigation": {
      "high_risks": ["ai_model_accuracy", "scalability"],
      "mitigation_strategies": ["phased_rollout", "performance_testing"]
    }
  }
}
```

---

## 🏗️ **Core Service APIs**

### **Workflow Registry Endpoints**

#### **POST /api/v1/workflows/vision**
Register a vision workflow for coordination.

**Request:**
```json
{
  "workflow_type": "vision_to_code",
  "vision_id": "vis_2024_ai_platform",
  "metadata": {
    "source_service": "business-service",
    "priority": "high",
    "estimated_duration_days": 180
  },
  "circuit_breaker_config": {
    "timeout_ms": 30000,
    "failure_threshold": 0.5,
    "reset_timeout_ms": 60000
  }
}
```

**Response:**
```json
{
  "workflow_id": "wf_vis_2024_ai_platform",
  "registry_status": "active",
  "assigned_resources": {
    "compute_allocation": "high",
    "memory_allocation": "32GB",
    "priority_queue": "premium"
  },
  "monitoring": {
    "metrics_endpoint": "/api/v1/metrics/workflows/wf_vis_2024_ai_platform",
    "health_endpoint": "/api/v1/health/workflows/wf_vis_2024_ai_platform"
  }
}
```

#### **POST /api/v1/workflows/:id/progress**
Update workflow progress across services.

**Request:**
```json
{
  "workflow_id": "wf_vis_2024_ai_platform",
  "phase": "technical_planning",
  "progress_percentage": 45,
  "completed_tasks": ["architecture_design", "technology_selection"],
  "current_tasks": ["api_design", "database_schema"],
  "blockers": [],
  "estimated_completion": "2024-01-25T18:00:00Z"
}
```

#### **GET /api/v1/services/health**
Get health status of all registered services.

**Response:**
```json
{
  "services": {
    "business-service": {
      "status": "healthy",
      "response_time_ms": 45,
      "cpu_usage": 0.23,
      "memory_usage": 0.41
    },
    "swarm-service": {
      "status": "healthy",
      "active_agents": 156,
      "queen_status": "coordinating"
    },
    "development-service": {
      "status": "healthy",
      "active_squads": 3,
      "tasks_in_progress": 27
    }
  },
  "overall_health": "optimal"
}
```

---

## 🐝 **Swarm Service APIs**

### **Coordination Endpoints**

#### **POST /api/v1/coordination/vision**
Initialize Queen-led coordination for a vision.

**Request:**
```json
{
  "action": "coordinate_vision_workflow",
  "vision_data": {
    "vision_id": "vis_2024_ai_platform",
    "strategic_goals": ["10x_productivity", "90%_bug_reduction"],
    "technical_requirements": ["microservices", "ai_integration", "real_time"]
  },
  "coordination_type": "queen_led",
  "optimization_goals": ["speed", "quality", "cost"]
}
```

**Response:**
```json
{
  "coordination_id": "coord_vis_2024_ai_platform",
  "queen_agent_id": "queen_001",
  "spawned_agents": [
    {
      "agent_id": "agent_vision_analyst_001",
      "type": "vision_analyst",
      "status": "analyzing"
    },
    {
      "agent_id": "agent_architect_001",
      "type": "roadmap_architect",
      "status": "planning"
    }
  ],
  "coordination_topology": "hierarchical",
  "mrap_reasoning_id": "mrap_vis_2024_ai_platform"
}
```

#### **GET /api/v1/agents/status**
Get status of all active agents.

**Response:**
```json
{
  "total_agents": 156,
  "by_type": {
    "vision_analyst": 12,
    "roadmap_architect": 8,
    "technical_lead": 15,
    "qa_specialist": 20,
    "coder": 85,
    "coordinator": 16
  },
  "by_status": {
    "idle": 23,
    "working": 108,
    "coordinating": 25
  },
  "queen_status": {
    "agent_id": "queen_001",
    "current_workflows": 5,
    "decision_queue_length": 12,
    "performance_score": 0.94
  }
}
```

#### **POST /api/v1/mrap/reason**
Execute multi-agent reasoning for technical approach.

**Request:**
```json
{
  "vision_id": "vis_2024_ai_platform",
  "reasoning_type": "technical_approach",
  "constraints": {
    "budget": 500000,
    "timeline_months": 6,
    "team_size": 10
  },
  "optimization_preferences": {
    "performance": 0.4,
    "maintainability": 0.3,
    "scalability": 0.3
  }
}
```

**Response:**
```json
{
  "reasoning_id": "mrap_tech_vis_2024_ai_platform",
  "consensus_reached": true,
  "recommended_approach": {
    "architecture": "microservices_with_event_sourcing",
    "technology_stack": {
      "backend": ["elixir", "golang"],
      "frontend": ["react", "typescript"],
      "ai": ["pytorch", "transformers"],
      "infrastructure": ["kubernetes", "terraform"]
    },
    "team_structure": {
      "squads": 3,
      "squad_composition": ["tech_lead", "3_developers", "qa_engineer"]
    }
  },
  "confidence_score": 0.89,
  "alternative_approaches": 2
}
```

---

## 💻 **Development Service APIs**

### **Vision-to-Code Execution Endpoints**

#### **POST /api/v1/vision-to-code/execute**
Execute vision-to-code workflow with squad coordination.

**Request:**
```json
{
  "technical_plan": {
    "plan_id": "tech_plan_vis_2024_ai_platform",
    "architecture": "microservices_with_event_sourcing",
    "phases": ["foundation", "core_features", "ai_integration"]
  },
  "execution_mode": "squad_based",
  "claude_integration": true,
  "squad_configuration": {
    "squad_count": 3,
    "parallel_execution": true,
    "communication_mode": "async_with_sync_checkpoints"
  }
}
```

**Response:**
```json
{
  "execution_id": "exec_vis_2024_ai_platform",
  "squads_formed": [
    {
      "squad_id": "squad_alpha",
      "focus": "infrastructure_and_core",
      "members": 5,
      "tasks_assigned": 24
    },
    {
      "squad_id": "squad_beta",
      "focus": "ai_integration",
      "members": 4,
      "tasks_assigned": 18
    }
  ],
  "estimated_completion": "2024-07-15T00:00:00Z",
  "monitoring_dashboard": "/dashboard/executions/exec_vis_2024_ai_platform"
}
```

#### **GET /api/v1/vision-to-code/:id/progress**
Get detailed progress of vision-to-code execution.

**Response:**
```json
{
  "execution_id": "exec_vis_2024_ai_platform",
  "overall_progress": 67,
  "phase_progress": {
    "foundation": {
      "status": "completed",
      "progress": 100,
      "artifacts": ["infrastructure_code", "ci_cd_pipeline", "monitoring_setup"]
    },
    "core_features": {
      "status": "in_progress",
      "progress": 75,
      "completed_features": ["user_auth", "api_gateway", "data_pipeline"],
      "in_progress_features": ["analytics_engine", "notification_system"]
    },
    "ai_integration": {
      "status": "planning",
      "progress": 10,
      "planned_start": "2024-05-01T00:00:00Z"
    }
  },
  "quality_metrics": {
    "test_coverage": 0.87,
    "code_quality_score": 0.92,
    "security_scan_status": "passed",
    "performance_benchmarks": "meeting_targets"
  },
  "claude_code_stats": {
    "total_completions": 1247,
    "success_rate": 0.94,
    "average_quality_score": 0.91
  }
}
```

#### **POST /api/v1/squads/:id/task**
Assign task to a development squad.

**Request:**
```json
{
  "squad_id": "squad_alpha",
  "task": {
    "type": "feature_implementation",
    "title": "Implement user authentication service",
    "description": "Create OAuth2-based authentication with JWT tokens",
    "requirements": ["multi-factor_auth", "session_management", "rate_limiting"],
    "estimated_hours": 40,
    "dependencies": ["database_schema", "api_gateway"],
    "claude_assistance_level": "high"
  }
}
```

---

## 🔄 **Event Bus Messages**

### **Event Format**
All events follow this structure:

```json
{
  "event_id": "evt_12345",
  "event_type": "vision:approved",
  "timestamp": "2024-01-16T14:30:00Z",
  "source_service": "business-service",
  "correlation_id": "vis_2024_ai_platform",
  "payload": {
    // Event-specific data
  },
  "metadata": {
    "version": "1.0",
    "retry_count": 0
  }
}
```

### **Key Event Types**

#### **vision:created**
```json
{
  "event_type": "vision:created",
  "payload": {
    "vision_id": "vis_2024_ai_platform",
    "title": "AI-Powered Development Platform",
    "priority": "high"
  }
}
```

#### **technical:plan:ready**
```json
{
  "event_type": "technical:plan:ready",
  "payload": {
    "vision_id": "vis_2024_ai_platform",
    "plan_id": "tech_plan_vis_2024_ai_platform",
    "squad_requirements": 3,
    "estimated_duration_weeks": 24
  }
}
```

#### **implementation:progress**
```json
{
  "event_type": "implementation:progress",
  "payload": {
    "execution_id": "exec_vis_2024_ai_platform",
    "progress_percentage": 67,
    "phase": "core_features",
    "completed_tasks": 142,
    "remaining_tasks": 70
  }
}
```

---

## 🔍 **Error Handling**

### **Standard Error Response**
```json
{
  "error": {
    "code": "VISION_NOT_FOUND",
    "message": "Vision with ID vis_2024_ai_platform not found",
    "details": {
      "searched_in": ["business-service", "cache"],
      "suggestion": "Check if vision ID is correct or has been archived"
    },
    "timestamp": "2024-01-16T15:00:00Z",
    "request_id": "req_abc123"
  }
}
```

### **Common Error Codes**
- `VISION_NOT_FOUND` - Vision ID doesn't exist
- `INSUFFICIENT_PERMISSIONS` - Service lacks required permissions
- `WORKFLOW_CONFLICT` - Workflow already exists for vision
- `AGENT_SPAWN_FAILED` - Failed to spawn required agents
- `COORDINATION_TIMEOUT` - Queen coordination timed out
- `CIRCUIT_BREAKER_OPEN` - Service temporarily unavailable

---

## 📊 **Rate Limiting**

Each service enforces rate limits:

- **Business Service**: 100 req/min per client
- **Core Service**: 1000 req/min per service
- **Swarm Service**: 500 req/min per client
- **Development Service**: 200 req/min per squad

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1234567890
```

---

## 🔐 **API Versioning**

All APIs use URL versioning:
- Current version: `/api/v1/`
- Beta features: `/api/v2-beta/`
- Deprecated: `/api/v0/` (removal date: 2024-12-31)

Version negotiation via headers:
```
Accept: application/vnd.visiontocode.v1+json
```

This API contract specification ensures consistent, secure, and efficient communication between all services in the Vision-to-Code system.