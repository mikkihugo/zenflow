# 🐝 Swarm System Documentation

## 📁 **Swarm Directory Discovery**

### **System-wide .swarm Directories Found:**
```
/home/mhugo/.swarm                                    # Global user swarm
/home/mhugo/code/claude-code-flow/.swarm             # Main claude-flow project
/home/mhugo/code/singularity-engine/.swarm          # Singularity Engine root
/home/mhugo/code/singularity-engine/services/.swarm # Services directory swarm
/home/mhugo/code/singularity-engine/active-services/.swarm  # Active services swarm

# Individual Service Swarms:
/home/mhugo/code/singularity-engine/services/foundation/development-service/.swarm
/home/mhugo/code/singularity-engine/services/foundation/development-service/gleam-llmrouter/.swarm
/home/mhugo/code/singularity-engine/services/foundation/hex-service/.swarm
/home/mhugo/code/singularity-engine/active-services/storage-service/.swarm
/home/mhugo/code/singularity-engine/active-services/llm-router/.swarm
/home/mhugo/code/singularity-engine/active-services/hex-server/.swarm
/home/mhugo/code/singularity-engine/active-services/interface-service/priv/static/css/.swarm
/home/mhugo/code/singularity-engine/active-services/interface-service/gleam_test/.swarm
/home/mhugo/code/singularity-engine/active-services/business-service/.swarm
/home/mhugo/code/singularity-engine/active-services/tools-service/src/tools_service/analyzers/.swarm
/home/mhugo/code/singularity-engine/active-services/tools-service/.swarm
/home/mhugo/code/singularity-engine/active-services/.legacy/development-service/.swarm

# Package Cache Swarms:
/home/mhugo/.cache/pnpm/dlx/*/node_modules/claude-flow/docker-test/.swarm
/home/mhugo/.pnpm-global/5/.pnpm/claude-flow@*/node_modules/claude-flow/docker-test/.swarm
```

## 🎯 **Swarm Creation Pattern**

### **Key Discovery:**
- **Swarms are created WHERE they are spawned** (directory-specific)
- Each service/project can have its own swarm memory
- Swarms inherit context from their spawn location

### **Swarm Database Structure:**
Each `.swarm/` directory contains:
```
.swarm/
├── memory.db           # SQLite database with agent data
├── memory.db-shm       # Shared memory file
└── memory.db-wal       # Write-ahead log
```

### **Database Schema:**
```sql
CREATE TABLE memory_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    namespace TEXT NOT NULL DEFAULT 'default',
    metadata TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now')),
    accessed_at INTEGER DEFAULT (strftime('%s', 'now')),
    access_count INTEGER DEFAULT 0,
    ttl INTEGER,
    expires_at INTEGER,
    UNIQUE(key, namespace)
);
```

## 📊 **Memory Namespaces Discovered**

From `/home/mhugo/code/claude-code-flow/.swarm/memory.db`:
- **agents** (41 entries) - Agent definitions and capabilities
- **command-history** (193 entries) - Command execution history
- **command-results** (193 entries) - Command output results
- **coordination** (10 entries) - Swarm coordination data
- **file-history** (10 entries) - File operation tracking
- **hooks:notify** (7 entries) - Hook notification system
- **hooks:post-bash** (193 entries) - Post-bash hook data
- **hooks:post-edit** (10 entries) - Post-edit hook data
- **hooks:post-task** (6 entries) - Post-task hook data
- **hooks:pre-task** (9 entries) - Pre-task hook data
- **performance** (2 entries) - Performance data
- **performance-metrics** (194 entries) - Detailed performance metrics
- **session-metrics** (41 entries) - Session-level metrics
- **session-states** (41 entries) - Session state tracking
- **sessions** (41 entries) - Session management
- **swarms** (7 entries) - Swarm definitions
- **system** (1 entry) - System-level configuration
- **task-index** (9 entries) - Task indexing

## 🤖 **Agent Capabilities System**

### **Agent Structure:**
```json
{
  "id": "agent_1752750375616_l9pm9h",
  "swarmId": "swarm_1752750350344_0x53olccp",
  "name": "Template Designer",
  "type": "documenter",
  "status": "active",
  "capabilities": [
    "document-templates",
    "service-documentation", 
    "roadmap-design"
  ],
  "metadata": {
    "sessionId": "session-cf-1752738937260-eyap",
    "createdBy": "mcp-server",
    "spawnedAt": "2025-07-17T11:06:15.616Z"
  }
}
```

### **Agent Types & Capabilities:**
- **coordinator**: `["task-coordination", "parallel-execution", "progress-tracking"]`
- **documenter**: `["document-templates", "service-documentation", "roadmap-design"]`
- **tester**: `["mcp-testing", "workflow-testing", "memory-validation"]`
- **coder**: `["validation-logic", "cross-service-analysis", "consistency-checking"]`
- **architect**: `["system-design", "mcp-integration", "memory-management"]`

## 🐝 **Hive-Mind vs Swarm Distinction**

### **Swarm (Basic)**
- **Database**: `.swarm/memory.db` (project-specific)
- **Lifecycle**: Temporary, task-focused
- **Memory**: Local to spawn directory
- **Usage**: Development work, specific tasks

### **Hive-Mind (Advanced)**
- **Database**: `data/hive-mind.db` (persistent, centralized)
- **Lifecycle**: Long-term, learning system
- **Memory**: Global, cross-project
- **Usage**: Strategic coordination, persistent intelligence

### **Current System Usage:**
You're primarily using **Hive-Mind** swarms with persistent intelligence:

```
🐝 Active Hive Mind Swarms: 14 total
- Objective examples: "Build API", "Test tactical", "Investigate agent tags"
- Status: All active but idle (no current tasks)
- Agents: Queen + 4 workers each (researcher, coder, analyst, tester)
- Memory: 4 entries per swarm in collective memory
```

## 🗂️ **Service-Specific Swarms**

### **Singularity Engine Services:**
Each service has its own swarm memory:
- **Storage Service**: `/active-services/storage-service/.swarm`
- **LLM Router**: `/active-services/llm-router/.swarm`
- **Business Service**: `/active-services/business-service/.swarm`
- **Tools Service**: `/active-services/tools-service/.swarm`
- **Interface Service**: Multiple swarm locations for different components

### **Implications:**
1. **Context Isolation**: Each service can have specialized swarm intelligence
2. **Local Memory**: Service-specific agent memories and learnings
3. **Parallel Development**: Multiple swarms can work on different services
4. **Knowledge Sharing**: Potential for cross-service intelligence sharing

## 🎯 **Service Document Management Context**

### **Perfect Integration Point:**
With swarms being created per service/directory, we can:
1. **Service-Specific Documentation**: Each service's swarm manages its own docs
2. **Context-Aware Agents**: Agents understand the specific service context
3. **Distributed Intelligence**: Each service has specialized documentation agents
4. **Cross-Service Coordination**: Hive-mind database for global coordination

### **Proposed Architecture:**
```
Service Swarm (.swarm/memory.db)
├── namespace: "service-documents"
│   ├── service-description
│   ├── service-adr
│   ├── service-roadmap
│   └── interface-spec
├── namespace: "agent-specialists"
│   ├── elixir-specialist (for Elixir services)
│   ├── gleam-specialist (for Gleam services)
│   └── microservices-architect
└── namespace: "service-coordination"
    ├── cross-service-dependencies
    └── shared-patterns
```

## 🚀 **Next Steps**

1. **Implement service document management** using existing swarm memory structure
2. **Leverage service-specific swarms** for contextual documentation
3. **Create specialist agents** with persistent memory in appropriate services
4. **Enable cross-service coordination** through hive-mind database

This decentralized swarm system is more powerful than initially understood - each service can have its own intelligent documentation system while maintaining global coordination!