#!/bin/bash

# Fix readonly config property conflicts
echo "Fixing readonly config property conflicts..."

# Find files with TypedEventBase inheritance and readonly config properties
find apps/claude-code-zen-server/src -name "*.ts" -type f | while read file; do
    if grep -q "extends TypedEventBase" "$file" && grep -q "private readonly config:" "$file"; then
        echo "Fixing readonly config conflict in: $file"
        # Rename private readonly config to private readonly settings
        sed -i 's/private readonly config:/private readonly settings:/g' "$file"
        # Update references to this.config to this.settings
        sed -i 's/this\.config\b/this.settings/g' "$file"
    fi
done

echo "Readonly config property conflict fixes complete!"