#!/bin/bash

# Function comparison script for DevmgmtAI007.Client vs LLMRouter.Core.Client

DEVMGMT_FILE="/home/mhugo/code/singularity-engine/active-services/ml-service/lib/ml_service/client/client.ex"
LLMROUTER_FILE="/home/mhugo/code/singularity-engine/active-services/llm-router/lib/llm_router/core/client.ex"

echo "🔍 SYSTEMATIC FUNCTION COMPARISON"
echo "=================================="
echo

echo "📁 Files being compared:"
echo "  DevmgmtAI007: $DEVMGMT_FILE"
echo "  LLMRouter:    $LLMROUTER_FILE"
echo

# Extract function names from both files
echo "📝 Extracting function definitions..."

# DevmgmtAI007 functions
grep -o "def [a-zA-Z_][a-zA-Z0-9_]*" "$DEVMGMT_FILE" | sed 's/def //' | sort > /tmp/devmgmt_functions.txt
# LLMRouter functions  
grep -o "def [a-zA-Z_][a-zA-Z0-9_]*" "$LLMROUTER_FILE" | sed 's/def //' | sort > /tmp/llmrouter_functions.txt

DEVMGMT_COUNT=$(wc -l < /tmp/devmgmt_functions.txt)
LLMROUTER_COUNT=$(wc -l < /tmp/llmrouter_functions.txt)

echo "📊 Function counts:"
echo "  DevmgmtAI007.Client: $DEVMGMT_COUNT functions"
echo "  LLMRouter.Core.Client: $LLMROUTER_COUNT functions"
echo

# Find functions only in DevmgmtAI007
echo "🔴 FUNCTIONS ONLY in DevmgmtAI007.Client (need migration):"
comm -23 /tmp/devmgmt_functions.txt /tmp/llmrouter_functions.txt | while read func; do
    line_num=$(grep -n "def $func" "$DEVMGMT_FILE" | head -1 | cut -d: -f1)
    echo "  ❗ $func (line $line_num)"
done

ONLY_DEVMGMT=$(comm -23 /tmp/devmgmt_functions.txt /tmp/llmrouter_functions.txt | wc -l)
echo "  Total: $ONLY_DEVMGMT functions need migration"
echo

# Find functions only in LLMRouter
echo "🟡 FUNCTIONS ONLY in LLMRouter.Core.Client:"
comm -13 /tmp/devmgmt_functions.txt /tmp/llmrouter_functions.txt | while read func; do
    line_num=$(grep -n "def $func" "$LLMROUTER_FILE" | head -1 | cut -d: -f1)
    echo "  ✅ $func (line $line_num)"
done

ONLY_LLMROUTER=$(comm -13 /tmp/devmgmt_functions.txt /tmp/llmrouter_functions.txt | wc -l)
echo "  Total: $ONLY_LLMROUTER additional functions in LLMRouter"
echo

# Find common functions
echo "🟢 FUNCTIONS in BOTH (may need implementation comparison):"
comm -12 /tmp/devmgmt_functions.txt /tmp/llmrouter_functions.txt | while read func; do
    devmgmt_line=$(grep -n "def $func" "$DEVMGMT_FILE" | head -1 | cut -d: -f1)
    llmrouter_line=$(grep -n "def $func" "$LLMROUTER_FILE" | head -1 | cut -d: -f1)
    echo "  🔄 $func (DevMgmt:$devmgmt_line, LLMRouter:$llmrouter_line)"
done

COMMON_FUNCTIONS=$(comm -12 /tmp/devmgmt_functions.txt /tmp/llmrouter_functions.txt | wc -l)
echo "  Total: $COMMON_FUNCTIONS functions in both"
echo

echo "📈 MIGRATION SUMMARY:"
echo "  Functions to migrate: $ONLY_DEVMGMT"
echo "  Functions in common: $COMMON_FUNCTIONS"  
echo "  LLMRouter additional: $ONLY_LLMROUTER"

if [ $ONLY_DEVMGMT -gt 0 ]; then
    echo
    echo "⚠️  CRITICAL: $ONLY_DEVMGMT functions need to be migrated to LLMRouter before deletion!"
else
    echo
    echo "✅ GOOD: All DevmgmtAI007 functions exist in LLMRouter"
fi

# Cleanup
rm /tmp/devmgmt_functions.txt /tmp/llmrouter_functions.txt