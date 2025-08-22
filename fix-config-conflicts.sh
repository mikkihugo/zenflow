#!/bin/bash

# Fix config property conflicts in classes extending TypedEventBase
# Pattern: private config: -> private configuration:

echo "Fixing config property conflicts..."

# Find TypeScript files that have classes extending TypedEventBase with private config properties
find apps/claude-code-zen-server/src -name "*.ts" -type f | while read file; do
    if grep -q "extends TypedEventBase" "$file" && grep -q "private config:" "$file"; then
        echo "Fixing config conflict in: $file"
        # Rename private config to private configuration to avoid conflict
        sed -i 's/private config:/private configuration:/g' "$file"
        # Update references to this.config to this.configuration
        sed -i 's/this\.config\b/this.configuration/g' "$file"
    fi
done

echo "Config property conflict fixes complete!"