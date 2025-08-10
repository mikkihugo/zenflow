#!/bin/bash

# Test Batch Processing Script
# Run this when the main fixer reaches single-error files (around iteration 15-20)

echo "🧪 Batch Processing Speed Test"
echo "=============================="
echo ""
echo "This tests processing 5-10 single-error files:"
echo "• Individual approach: 1 AI call per file"
echo "• Batch approach: 1 AI call for all files"
echo ""

node scripts/test-batch-processing.js

echo ""
echo "💡 If speedup > 3x, batching should be integrated into main fixer"
echo "🔧 Integration: Use --batch flag with npm run fix:zen"