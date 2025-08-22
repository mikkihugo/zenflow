#!/bin/bash

# Massive TypeScript Corruption Fix Script
# Uses fastmod for enterprise-scale regex operations

echo "🔧 Starting massive corruption fix with fastmod..."

# Install fastmod if not present
if ! command -v fastmod &> /dev/null; then
    echo "Installing fastmod..."
    npm install -g fastmod
fi

# Fix 1: Template literal corruption ${var'' | '''' | ''other}
echo "Fix 1: Template literal corruption..."
fastmod '\$\{([^}]+)'\'\''\s*\|\s*'\'\''\s*\|\s*'\'\''\s*([^}]+)\}' '${$1 || $2}' --extensions ts --dir /home/mhugo/code/claude-code-zen --accept-all

# Fix 2: String literal corruption var'' | '''' | '''value'  
echo "Fix 2: String literal corruption..."
fastmod '(\w+(?:\.\w+)*)'\'\''\s*\|\s*'\'\''\s*\|\s*'\'\''\s*([^'\'']*)'\'''' '$1 || '\''$2'\''' --extensions ts --dir /home/mhugo/code/claude-code-zen --accept-all

# Fix 3: Simple OR operator corruption ' | '' | '
echo "Fix 3: OR operator corruption..."
fastmod ''\'''\s*\|\s*'\'''\s*\|\s*'\''' ' || ' --extensions ts --dir /home/mhugo/code/claude-code-zen --accept-all

# Fix 4: Import statement extra parentheses
echo "Fix 4: Import statement corruption..."  
fastmod '} from (['\''"][^'\''"]+['\''"])\);' '} from $1;' --extensions ts --dir /home/mhugo/code/claude-code-zen --accept-all

# Fix 5: Function call extra parentheses
echo "Fix 5: Function call corruption..."
fastmod '(\w+\(\))\);' '$1;' --extensions ts --dir /home/mhugo/code/claude-code-zen --accept-all

echo "✅ Fastmod fixes complete! Running TypeScript check..."
npx tsc --noEmit --skipLibCheck | head -20