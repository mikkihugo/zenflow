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
└── .claude-zen/
    ├── workspaces.json      # Define workspace boundaries
    └── memory/              # Shared memory across workspaces
```

## Workspace Configuration (.claude-zen/workspaces.json)

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
claude-zen workspace frontend
claude-zen swarm "Implement new UI components" --workspace frontend

# Focus on backend
claude-zen workspace backend  
claude-zen swarm "Add authentication endpoints" --workspace backend
```

### 2. **Cross-Package Operations**
```bash
# Work across multiple packages
claude-zen swarm "Refactor shared types" --workspaces frontend,backend,shared

# Full monorepo analysis
claude-zen swarm "Analyze dependencies and suggest improvements" --all-workspaces
```

### 3. **Parallel Development**
```bash
# Terminal 1: Frontend development
claude-zen swarm "Build dashboard" --workspace frontend --ui

# Terminal 2: Backend development  
claude-zen swarm "Create REST API" --workspace backend --ui

# Terminal 3: Monitoring all
claude-zen monitor --all-workspaces
```

## Memory Strategies for Monorepo

### Namespace Isolation
```bash
# Store frontend-specific knowledge
claude-zen memory store --namespace frontend "component:Button" "uses Material-UI"

# Store backend-specific knowledge  
claude-zen memory store --namespace backend "auth:strategy" "JWT with refresh tokens"

# Store shared knowledge
claude-zen memory store --namespace shared "types:User" "interface User { id, email, name }"
```

### Cross-Reference Memory
```bash
# Query across namespaces
claude-zen memory query "User type" --all-namespaces

# Link related memories
claude-zen memory link frontend:UserComponent backend:UserAPI
```

## Best Practices for Large Monorepos

1. **Incremental Analysis**
   ```bash
   # Analyze only changed packages
   claude-zen analyze --changed-only
   ```

2. **Dependency Tracking**
   ```bash
   # Track cross-package dependencies
   claude-zen deps --graph
   ```

3. **Focused Agents**
   ```bash
   # Spawn agents with package context
   claude-zen agent spawn coder --context packages/frontend
   ```

4. **Shared Standards**
   ```bash
   # Enforce monorepo-wide standards
   claude-zen sparc lint --all-workspaces
   ```