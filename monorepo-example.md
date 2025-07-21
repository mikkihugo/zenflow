# Monorepo Structure with Claude-Flow

## Setup for Monorepo

```
monorepo/
├── CLAUDE.md                 # Global instructions
├── packages/
│   ├── frontend/
│   │   └── CLAUDE.md        # Frontend-specific instructions
│   ├── backend/
│   │   └── CLAUDE.md        # Backend-specific instructions
│   ├── shared/
│   │   └── CLAUDE.md        # Shared library instructions
│   └── api/
│       └── CLAUDE.md        # API-specific instructions
├── services/
│   ├── auth/
│   │   └── CLAUDE.md        # Auth service instructions
│   └── database/
│       └── CLAUDE.md        # Database instructions
└── .claude-flow/
    ├── workspaces.json      # Define workspace boundaries
    └── memory/              # Shared memory across workspaces
```

## Workspace Configuration (.claude-flow/workspaces.json)

```json
{
  "workspaces": {
    "frontend": {
      "path": "packages/frontend",
      "agents": ["ui-specialist", "react-expert"],
      "memory_namespace": "frontend",
      "dependencies": ["shared"]
    },
    "backend": {
      "path": "packages/backend", 
      "agents": ["api-developer", "database-expert"],
      "memory_namespace": "backend",
      "dependencies": ["shared", "database"]
    },
    "shared": {
      "path": "packages/shared",
      "agents": ["architect"],
      "memory_namespace": "shared",
      "shared": true
    }
  },
  "federation": {
    "enabled": true,
    "shared_memory": true,
    "cross_workspace_tasks": true
  }
}
```

## Usage Patterns

### 1. **Work on Specific Package**
```bash
# Focus on frontend only
claude-flow workspace frontend
claude-flow swarm "Implement new UI components" --workspace frontend

# Focus on backend
claude-flow workspace backend  
claude-flow swarm "Add authentication endpoints" --workspace backend
```

### 2. **Cross-Package Operations**
```bash
# Work across multiple packages
claude-flow swarm "Refactor shared types" --workspaces frontend,backend,shared

# Full monorepo analysis
claude-flow swarm "Analyze dependencies and suggest improvements" --all-workspaces
```

### 3. **Parallel Development**
```bash
# Terminal 1: Frontend development
claude-flow swarm "Build dashboard" --workspace frontend --ui

# Terminal 2: Backend development  
claude-flow swarm "Create REST API" --workspace backend --ui

# Terminal 3: Monitoring all
claude-flow monitor --all-workspaces
```

## Memory Strategies for Monorepo

### Namespace Isolation
```bash
# Store frontend-specific knowledge
claude-flow memory store --namespace frontend "component:Button" "uses Material-UI"

# Store backend-specific knowledge  
claude-flow memory store --namespace backend "auth:strategy" "JWT with refresh tokens"

# Store shared knowledge
claude-flow memory store --namespace shared "types:User" "interface User { id, email, name }"
```

### Cross-Reference Memory
```bash
# Query across namespaces
claude-flow memory query "User type" --all-namespaces

# Link related memories
claude-flow memory link frontend:UserComponent backend:UserAPI
```

## Best Practices for Large Monorepos

1. **Incremental Analysis**
   ```bash
   # Analyze only changed packages
   claude-flow analyze --changed-only
   ```

2. **Dependency Tracking**
   ```bash
   # Track cross-package dependencies
   claude-flow deps --graph
   ```

3. **Focused Agents**
   ```bash
   # Spawn agents with package context
   claude-flow agent spawn coder --context packages/frontend
   ```

4. **Shared Standards**
   ```bash
   # Enforce monorepo-wide standards
   claude-flow sparc lint --all-workspaces
   ```