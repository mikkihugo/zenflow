#!/bin/bash

echo "Applying final syntax fixes..."

# Fix task-flow-controller.ts specifically
FILE="src/api/task-flow-controller.ts"

# Remove standalone single quotes at end of lines
sed -i "s/'$//" "$FILE"

# Fix corrupted SQL and string patterns
sed -i "s/'''/'/g" "$FILE"
sed -i "s/''/'/g" "$FILE"
sed -i "s/'\"/'/g" "$FILE"
sed -i "s/\"'/'/g" "$FILE"

# Fix SQL query patterns
sed -i "s/\(\`\)\([^`]*\)\(.*\)\(`\)/'\2\3'/g" "$FILE"

# Fix specific corrupted patterns
sed -i "s/severity TEXT DEFAULT 'info\`/severity TEXT DEFAULT 'info'/g" "$FILE"
sed -i "s/type: 'escalation\`/type: 'escalation'/g" "$FILE"
sed -i "s/'bottleneck_resolved\`/'bottleneck_resolved'/g" "$FILE"
sed -i "s/'Error fetching historical resolutions\`/'Error fetching historical resolutions'/g" "$FILE"
sed -i "s/'redistribute_tasks\`/'redistribute_tasks'/g" "$FILE"
sed -i "s/'Spillover has mixed results - consider alternative approaches\`/'Spillover has mixed results - consider alternative approaches'/g" "$FILE"
sed -i "s/'Database not available - skipping graceful task processing halt\`/'Database not available - skipping graceful task processing halt'/g" "$FILE"
sed -i "s/'Error reconnecting to external services\`/'Error reconnecting to external services'/g" "$FILE"

# Fix function call patterns
sed -i "s/\`/'/g" "$FILE"

# Fix doubled single quotes that may have been created
sed -i "s/''/'/g" "$FILE"

# Fix any trailing quotes at end of file
sed -i '$s/"\`$//' "$FILE"
sed -i '$s/`$//' "$FILE"

echo "Syntax fixes applied to $FILE"