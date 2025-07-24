# 🏛️ Claude-Flow Orchestrator Architecture

## 🎯 **What is the Orchestrator?**

The **Orchestrator** is the **central coordination service** that manages the entire Claude-Flow ecosystem. It's NOT the Claude CLI itself, but rather a **background service** that coordinates all swarms, agents, and tasks.

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR                             │
│                 (Central Coordination)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Agent     │  │    Task     │  │   Memory    │         │
│  │ Management  │  │Coordination │  │ Management  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ MCP Server  │  │ Event Bus   │  │ Config Mgr  │         │
│  │ (Port 3000) │  │Communication│  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       SWARMS                                │
│                 (Distributed Execution)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Swarm 1   │  │   Swarm 2   │  │   Swarm 3   │         │
│  │ (.swarm/    │  │ (.swarm/    │  │ (.swarm/    │         │
│  │ memory.db)  │  │ memory.db)  │  │ memory.db)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Hive-Mind   │  │ Service     │  │ Project     │         │
│  │ Swarms      │  │ Swarms      │  │ Swarms      │         │
│  │ (Queen+     │  │ (Per        │  │ (Per        │         │
│  │ Workers)    │  │ Service)    │  │ Directory)  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 **Core Components**

### **1. Core Orchestrator (`orchestrator-fixed.ts`)**
- **Agent Management**: Spawns, tracks, and manages agent lifecycle
- **Task Coordination**: Breaks down complex tasks into manageable pieces
- **Session Handling**: Manages user sessions and contexts
- **Health Monitoring**: Tracks system health and performance

```typescript
export class Orchestrator {
  private agents: Map<string, AgentInfo> = new Map();
  private tasks: Map<string, TaskInfo> = new Map();
  private sessions: Map<string, SessionInfo> = new Map();
  
  // Core capabilities
  async spawnAgent(type: string, config: any): Promise<AgentInfo>
  async assignTask(taskId: string, agentId: string): Promise<void>
  async getSystemHealth(): Promise<HealthCheckResult>
}
```

### **2. Hive Orchestrator (`hive-orchestrator.ts`)**
- **Advanced Swarm Coordination**: Manages Queen + Worker agent hierarchies
- **Consensus Decision Making**: Handles voting and consensus for critical decisions
- **Task Voting Systems**: Agents vote on task assignments and quality
- **Quality Metrics**: Tracks performance and success rates

```typescript
export class HiveOrchestrator extends EventEmitter {
  private tasks: Map<string, HiveTask> = new Map();
  private decisions: Map<string, HiveDecision> = new Map();
  private agentCapabilities: Map<string, Set<string>> = new Map();
  
  // Hive-mind capabilities
  async createConsensusProposal(proposal: any): Promise<string>
  async voteOnTask(taskId: string, agentId: string, vote: boolean): Promise<void>
  async assignTaskByCapability(task: HiveTask): Promise<string>
}
```

### **3. SPARC Orchestrator (`sparc-orchestrator.js`)**
- **SPARC Mode Coordination**: Manages different agent modes (orchestrator, coder, researcher, etc.)
- **Mode-Specific Logic**: Handles specialized coordination for each SPARC mode
- **Workflow Management**: Orchestrates complex multi-mode workflows

## 🚀 **Orchestrator Lifecycle**

### **Starting the Orchestrator**
```bash
# Start the orchestrator service
claude-zen start

# With options
claude-zen start --ui --swarm --daemon --port 8080
```

**What happens during start:**
1. **Core Infrastructure**: Event bus, logger, config manager initialize
2. **Memory System**: SQLite databases and in-memory stores ready
3. **MCP Server**: Starts on port 3000 (default) with 87+ tools
4. **Agent Registry**: Prepares agent spawning capabilities
5. **Task Queue**: Initializes task coordination system
6. **Health Monitoring**: Starts system health checks

### **Orchestrator Status Check**
```bash
# Check orchestrator status
claude-zen mcp status

# Expected output when running:
✅ MCP Server Status:
🌐 Status: Running (orchestrator active)
🔧 Configuration: Production settings
🔌 Connections: 3 active
📡 Tools: 87 tools loaded
🔐 Authentication: Configured
```

## 🌐 **Communication Flow**

### **Data Flow Architecture**
```
External Input → Claude CLI → Orchestrator → Swarms → Agents → Tasks → Results
     ↓              ↓           ↓            ↓        ↓        ↓        ↓
   User         Command      Central      Local    Task     Work     Output
   Input    →   Parser   →   Coordinator → Swarms → Agents → Execution → Results
   Files                                                              
   APIs                                                               
```

### **MCP Tool Integration**
```javascript
// External data feeding through MCP tools
External Data → MCP Tools → Orchestrator → Swarms → Agents
     ↓              ↓          ↓           ↓         ↓
   APIs          87 Tools    Central     Local     Task
   Files    →    Available → Coordinator → Memory → Execution
   DBs           Tools       Service     Context
```

## 🐝 **Swarm Management**

### **Swarm Creation Flow**
```bash
# User command
claude-zen hive-mind spawn "Build REST API"

# Orchestrator actions:
1. Parse command and objective
2. Determine optimal swarm configuration
3. Create swarm in appropriate directory (.swarm/memory.db)
4. Spawn Queen agent with coordination capabilities
5. Spawn Worker agents (researcher, coder, analyst, tester)
6. Assign initial tasks based on objective
7. Monitor progress and coordinate execution
```

### **Swarm Types Managed**
- **Hive-Mind Swarms**: Queen + Workers with consensus decision making
- **Service Swarms**: Per-microservice intelligence (storage-service, security-service, etc.)
- **Project Swarms**: Per-directory/project context
- **Global Swarms**: Cross-project coordination

## 🧠 **Memory Architecture**

### **Hierarchical Memory System**
```
Global Orchestrator Memory
├── data/hive-mind.db (Global coordination)
│   ├── agents table (Global agent registry)
│   ├── tasks table (Cross-swarm tasks)
│   ├── memory table (Global patterns)
│   └── consensus table (Global decisions)
│
├── .swarm/memory.db (Session-specific)
│   ├── agents namespace (Session agents)
│   ├── tasks namespace (Session tasks)
│   ├── coordination namespace (Session coordination)
│   └── performance-metrics namespace (Session metrics)
│
└── Service-Specific Swarms
    ├── /storage-service/.swarm/memory.db
    ├── /security-service/.swarm/memory.db
    └── /elixir-bridge/.swarm/memory.db
```

### **Memory Namespace Organization**
```
Orchestrator Namespaces:
├── "system" → System configuration
├── "global-agents" → Global agent patterns
├── "cross-swarm-tasks" → Multi-swarm coordination
├── "performance-metrics" → System-wide metrics
└── "consensus-decisions" → Global consensus results

Swarm Namespaces:
├── "agents" → Local agent definitions
├── "tasks" → Local task tracking
├── "coordination" → Swarm coordination
├── "service-documents" → Service-specific docs
└── "agent-specialists" → Service expert knowledge
```

## 📊 **Service Document Integration**

### **How Service Documents Work with Orchestrator**
```
Service Document Request → Orchestrator → Appropriate Swarm → Service Context
        ↓                      ↓              ↓                    ↓
User wants to document   →  Orchestrator   →  Finds/Creates   →  Service-specific
storage-service ADR         routes to         storage-service     context and
                           correct swarm      swarm              agent expertise
```

### **Document Management Flow**
```javascript
// User in storage-service directory
mcp__claude-zen__service_document_manager({
  action: "create",
  documentType: "service-adr",
  serviceName: "storage-service"  // Auto-detected from working directory
})

// Orchestrator actions:
1. Detect service context (storage-service from cwd)
2. Find/create storage-service swarm
3. Load service-specific agents (gleam-specialist, performance-expert)
4. Create ADR using service context and agent expertise
5. Store in service swarm memory (.swarm/memory.db)
6. Update global coordination (hive-mind.db) if needed
```

## 🔄 **Agent Lifecycle Management**

### **Agent Spawning Process**
```
Request → Orchestrator → Swarm Selection → Agent Creation → Task Assignment
   ↓          ↓              ↓               ↓                ↓
User       Central         Choose          Create agent     Assign work
command → Coordinator → appropriate swarm → with capabilities → based on skills
```

### **Agent Types Managed**
- **Coordinator**: Task coordination and progress tracking
- **Researcher**: Information gathering and analysis
- **Coder**: Implementation and development
- **Analyst**: Data analysis and pattern recognition
- **Architect**: System design and architecture
- **Tester**: Quality assurance and validation
- **Reviewer**: Code review and quality checks
- **Documenter**: Documentation and knowledge management

## 🎯 **Key Insights**

### **Orchestrator is NOT:**
- ❌ The Claude CLI itself
- ❌ A single agent
- ❌ A simple task runner
- ❌ A swarm instance

### **Orchestrator IS:**
- ✅ **Central coordination service**
- ✅ **Multi-swarm manager**
- ✅ **Agent lifecycle controller**
- ✅ **Task distribution system**
- ✅ **System health monitor**
- ✅ **MCP server host**

### **Why This Architecture Works:**
1. **Scalability**: Central coordination with distributed execution
2. **Isolation**: Each service/project has its own swarm context
3. **Intelligence**: Agents can specialize while coordinating globally
4. **Persistence**: Memory systems preserve knowledge across sessions
5. **Flexibility**: Can handle everything from simple tasks to complex multi-service workflows

## 🚀 **Next Steps for Service Documents**

### **Integration Points**
1. **Extend orchestrator** to recognize service contexts
2. **Add service document routing** to appropriate swarms
3. **Implement document-specific agents** (ADR specialist, roadmap planner)
4. **Enable cross-service coordination** for global architectural decisions
5. **Add approval workflows** through orchestrator coordination

### **Implementation Strategy**
- **Bottom-up**: Start with service-specific swarms (already working)
- **Orchestrator enhancement**: Add service document coordination
- **Global coordination**: Cross-service document management
- **Agent specialization**: Service-specific document experts

The orchestrator provides the perfect foundation for intelligent, distributed service document management across the entire microservices architecture!