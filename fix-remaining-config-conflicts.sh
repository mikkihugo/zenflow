#!/bin/bash

# Fix remaining config property conflicts in orchestration classes
echo "Fixing remaining config property conflicts..."

# List of files with remaining conflicts
FILES=(
    "apps/claude-code-zen-server/src/coordination/orchestration/parallel-workflow-manager.ts"
    "apps/claude-code-zen-server/src/coordination/orchestration/portfolio-orchestrator.ts"
    "apps/claude-code-zen-server/src/coordination/orchestration/program-orchestrator.ts"
    "apps/claude-code-zen-server/src/coordination/orchestration/swarm-execution-orchestrator.ts"
    "apps/claude-code-zen-server/src/coordination/protocols/topology/topology-manager.ts"
)

for file in "${FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "Fixing config conflict in: $file"
        # Rename private config to private managerConfig to avoid conflict
        sed -i 's/private config:/private managerConfig:/g' "$file"
        # Update references to this.config to this.managerConfig
        sed -i 's/this\.config\b/this.managerConfig/g' "$file"
    fi
done

echo "Remaining config property conflict fixes complete!"