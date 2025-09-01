#!/bin/bash
for file in $(find src -name "*.ts"); do
  if [ -f "$file" ]; then
    # Count imports from foundation
    count=$(grep -c "import.*@claude-zen/foundation" "$file")
    if [ "$count" -gt 1 ]; then
      echo "Fixing $file"
      # Extract all imports from foundation
      imports=$(grep "import.*@claude-zen/foundation" "$file" | sed 's/import {\([^}]*\)} from '\''@claude-zen\/foundation'\'';/\1/' | tr '\n' ',' | sed 's/,$//')
      # Remove trailing comma and spaces
      imports=$(echo "$imports" | sed 's/,*$//' | sed 's/ //g')
      # Create combined import
      combined="import { $imports } from '@claude-zen/foundation';"
      # Remove all foundation imports and add combined one
      sed -i '/import.*@claude-zen\/foundation/d' "$file"
      # Add combined import at the top
      sed -i "1i$combined" "$file"
    fi
  fi
done
