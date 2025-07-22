# Swarm-Per-Microservice Architecture Design
## For Singularity Engine

Based on the analysis of the Singularity Engine microservices architecture, this document outlines the design for implementing **one dedicated swarm per microservice** with ultra-modular registry coordination.

## Current Microservice Inventory

The Singularity Engine currently consists of the following microservices:

### Core Services (Elixir/OTP)
1. **AI Service** (Port 4000) - LLM routing, model management, AI orchestration
2. **Architecture Service** (Port 4001) - System design, component analysis
3. **Business Service** (Port 4002) - Business logic, decision workflows
4. **Core Service** (Port 4003) - Central coordination, health monitoring  
5. **Execution Service** (Port 4004) - Task execution, workflow management
6. **Infra Service** (Port 4005) - Infrastructure management, resource allocation
7. **Interface Service** (Port 4006) - UI/API gateway, user interactions
8. **Storage Service** (Port 4104) - Data persistence, file management
9. **Swarm Service** (Port 4008) - Current swarm coordination (to be enhanced)
10. **ML Service** (Port 4009) - Machine learning, model training
11. **Tools Service** (Port 4010) - Development tools, code analysis

### Specialized Services (Gleam)
12. **Hex Server** (Port 4001) - Package management, registry
13. **Security Service** (Port 4107) - Authentication, authorization, security

## Swarm-Per-Service Architecture Design

### 1. Individual Swarm Structure

Each microservice gets its own dedicated swarm with the following components:

```elixir
# Example: AI Service Swarm
AiService.Swarm.Supervisor
├── AiService.Swarm.Queen           # Local coordinator
├── AiService.Swarm.WorkerPool      # Specialized agents (3-5 agents)
├── AiService.Swarm.Memory          # Service-specific memory store
├── AiService.Swarm.MetaClient      # Connection to meta registry
└── AiService.Swarm.HealthMonitor   # Local health monitoring
```

### 2. Meta Registry (Ultra-Modular Coordinator)

The meta registry serves as the coordination layer between all swarms:

```elixir
# Meta Registry Structure
SingularityEngine.MetaRegistry.Supervisor
├── MetaRegistry.DiscoveryService   # Service discovery across swarms
├── MetaRegistry.TaskRouter         # Cross-swarm task delegation
├── MetaRegistry.ConflictResolver   # Inter-swarm conflict resolution
├── MetaRegistry.LoadBalancer       # Load balancing across swarms
├── MetaRegistry.GlobalMemory       # Shared memory for coordination
└── MetaRegistry.SwarmMonitor       # Health monitoring of all swarms
```

### 3. Service-Specific Swarm Mappings

#### AI Service Swarm
```elixir
defmodule AiService.Swarm do
  @moduledoc "Dedicated swarm for AI/LLM operations"
  
  # Queen coordinates:
  # - Model selection and routing
  # - Provider failover
  # - Response optimization
  
  # Specialized Agents:
  # - ModelSelectorAgent
  # - ProviderManagerAgent  
  # - ResponseOptimizerAgent
  # - CachingAgent
end
```

#### Storage Service Swarm
```elixir
defmodule StorageService.Swarm do
  @moduledoc "Dedicated swarm for data operations"
  
  # Queen coordinates:
  # - Data consistency
  # - Backup strategies
  # - Query optimization
  
  # Specialized Agents:
  # - DataConsistencyAgent
  # - BackupAgent
  # - QueryOptimizerAgent
  # - CacheManagerAgent
end
```

#### Business Service Swarm
```elixir
defmodule BusinessService.Swarm do
  @moduledoc "Dedicated swarm for business logic"
  
  # Queen coordinates:
  # - Workflow execution
  # - Decision making
  # - Compliance checking
  
  # Specialized Agents:
  # - WorkflowAgent
  # - DecisionAgent
  # - ComplianceAgent
  # - BusinessRulesAgent
end
```

### 4. Cross-Swarm Communication Protocol

#### Task Delegation Flow
```elixir
# Example: AI Service needs storage for model cache
AiService.Swarm.Queen 
  -> MetaRegistry.TaskRouter 
  -> StorageService.Swarm.Queen 
  -> StorageService.Swarm.CacheManagerAgent
```

#### Discovery Protocol
```elixir
# Services register capabilities with meta registry
%{
  service: :ai_service,
  capabilities: [:llm_routing, :model_management, :response_optimization],
  swarm_queen: AiService.Swarm.Queen,
  health_endpoint: "http://localhost:4000/health",
  metrics_endpoint: "http://localhost:4000/metrics"
}
```

### 5. Implementation Architecture

#### Meta Registry Implementation
```elixir
defmodule SingularityEngine.MetaRegistry do
  use GenServer
  
  # State includes all registered swarms
  defstruct [
    :swarm_registry,        # Map of service -> swarm config
    :capability_index,      # Map of capability -> services
    :task_routing_table,    # Routing rules for cross-swarm tasks
    :health_status,         # Health status of all swarms
    :global_memory          # Shared coordination memory
  ]
  
  # API for swarms to register
  def register_swarm(service, queen_pid, capabilities) do
    GenServer.call(__MODULE__, {:register_swarm, service, queen_pid, capabilities})
  end
  
  # API for task delegation
  def delegate_task(from_service, capability_needed, task) do
    GenServer.call(__MODULE__, {:delegate_task, from_service, capability_needed, task})
  end
  
  # API for service discovery  
  def discover_service(capability) do
    GenServer.call(__MODULE__, {:discover_service, capability})
  end
end
```

#### Swarm Queen Template
```elixir
defmodule SingularityEngine.Swarm.QueenTemplate do
  @moduledoc "Template for service-specific swarm queens"
  
  use GenServer
  
  # Common queen functionality
  defstruct [
    :service_name,
    :worker_pool,
    :local_memory,
    :meta_registry_connection,
    :specialized_agents,
    :health_monitor
  ]
  
  # Standard queen API
  def execute_task(queen_pid, task) do
    GenServer.call(queen_pid, {:execute_task, task})
  end
  
  def delegate_external_task(queen_pid, capability, task) do
    GenServer.call(queen_pid, {:delegate_external, capability, task})
  end
  
  def get_swarm_status(queen_pid) do
    GenServer.call(queen_pid, :get_status)
  end
end
```

### 6. Benefits of This Architecture

#### 1. **Service Autonomy**
- Each service has dedicated processing power
- Service-specific optimizations possible
- Independent scaling per service

#### 2. **Fault Isolation**
- Swarm failure doesn't affect other services
- Graceful degradation per service
- Independent recovery mechanisms

#### 3. **Specialized Intelligence**
- Agents tuned for specific service domains
- Domain-specific memory and caching
- Optimized decision making per service

#### 4. **Coordinated Efficiency**
- Meta registry prevents duplicate work
- Intelligent task routing
- Global resource optimization

### 7. Deployment Strategy

#### Phase 1: Meta Registry Setup
1. Deploy meta registry service
2. Implement service discovery protocol
3. Set up cross-swarm communication

#### Phase 2: High-Priority Services
1. AI Service swarm (critical for LLM operations)
2. Storage Service swarm (data consistency)
3. Core Service swarm (health monitoring)

#### Phase 3: Remaining Services
1. Business, Architecture, Interface services
2. Execution, Infra, Tools services  
3. Specialized Gleam services

#### Phase 4: Optimization
1. Cross-swarm task routing optimization
2. Global memory coordination
3. Performance monitoring and tuning

### 8. Configuration Example

```elixir
# config/swarm_config.exs
config :singularity_engine, :meta_registry,
  port: 4100,
  max_concurrent_delegations: 100,
  health_check_interval: 30_000,
  task_timeout: 60_000

config :singularity_engine, :swarms, %{
  ai_service: %{
    queen: AiService.Swarm.Queen,
    agents: [:model_selector, :provider_manager, :optimizer, :cache],
    port: 4000,
    capabilities: [:llm_routing, :model_management, :response_optimization]
  },
  storage_service: %{
    queen: StorageService.Swarm.Queen,
    agents: [:consistency, :backup, :query_optimizer, :cache_manager],
    port: 4104,
    capabilities: [:data_persistence, :file_management, :backup]
  },
  business_service: %{
    queen: BusinessService.Swarm.Queen,
    agents: [:workflow, :decision, :compliance, :rules],
    port: 4002,
    capabilities: [:workflow_execution, :decision_making, :compliance]
  }
  # ... other services
}
```

### 9. Monitoring and Observability

#### Swarm Health Dashboard
- Individual swarm status
- Cross-swarm communication metrics
- Task delegation success rates
- Resource utilization per swarm

#### Meta Registry Metrics
- Service discovery latency
- Task routing efficiency
- Global memory utilization
- Conflict resolution statistics

### 10. Migration Path

#### From Current Architecture
1. **Maintain Current Swarm Service** as fallback
2. **Gradually Enable** per-service swarms
3. **Route Tasks** through meta registry
4. **Monitor Performance** during transition
5. **Sunset Legacy** swarm service once stable

This architecture provides the perfect balance of service autonomy and coordinated intelligence, enabling each microservice to have specialized AI capabilities while maintaining system-wide coordination through the ultra-modular meta registry.