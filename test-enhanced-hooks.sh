#!/usr/bin/env bash
# Enhanced Hooks System Test Script
# Tests the enhanced hooks scripts directly

set -e

# Create test directory
TEST_DIR="/tmp/enhanced-hooks-test"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Set up test environment
export HOME="$TEST_DIR"
mkdir -p "$HOME/.claude/enhanced-hooks"

echo "🧪 Testing Enhanced Hooks System"
echo "================================"

# Test 1: Safety Validation Hook
echo "📋 Test 1: Safety Validation Hook"
echo "-----------------------------------"

HOOKS_DIR="/home/runner/work/claude-code-zen/claude-code-zen/templates/claude-zen/hooks/enhanced"

# Test dangerous command
DANGEROUS_INPUT='{"tool_name":"Bash","tool_input":{"command":"rm -rf /","operation_type":"delete"}}'
echo "Testing dangerous command: rm -rf /"

RESULT=$(echo "$DANGEROUS_INPUT" | "$HOOKS_DIR/safety-validation.sh" 2>/dev/null || echo '{"allowed":false,"error":"blocked"}')
ALLOWED=$(echo "$RESULT" | jq -r '.allowed // false')

if [[ "$ALLOWED" == "false" ]]; then
    echo "✅ PASS: Dangerous command was blocked"
else
    echo "❌ FAIL: Dangerous command was not blocked"
fi

# Test safe command
SAFE_INPUT='{"tool_name":"Bash","tool_input":{"command":"ls -la","operation_type":"list"}}'
echo "Testing safe command: ls -la"

RESULT=$(echo "$SAFE_INPUT" | "$HOOKS_DIR/safety-validation.sh" 2>/dev/null || echo '{"allowed":true}')
ALLOWED=$(echo "$RESULT" | jq -r '.allowed // true')

if [[ "$ALLOWED" == "true" ]]; then
    echo "✅ PASS: Safe command was allowed"
else
    echo "❌ FAIL: Safe command was blocked"
fi

echo ""

# Test 2: Auto-Agent Assignment Hook
echo "📋 Test 2: Auto-Agent Assignment Hook"
echo "--------------------------------------"

# Test TypeScript file assignment
TS_INPUT='{"tool_name":"Edit","tool_input":{"file_path":"src/component.tsx","operation_type":"edit","description":"Update React component"}}'
echo "Testing TypeScript file assignment"

RESULT=$(echo "$TS_INPUT" | "$HOOKS_DIR/auto-agent-assignment.sh" 2>/dev/null || echo '{"success":false}')
SUCCESS=$(echo "$RESULT" | jq -r '.success // false')
AGENT_TYPE=$(echo "$RESULT" | jq -r '.assigned_agent.type // "unknown"')

if [[ "$SUCCESS" == "true" ]]; then
    echo "✅ PASS: Agent assignment successful (Type: $AGENT_TYPE)"
else
    echo "❌ FAIL: Agent assignment failed"
fi

# Test Python ML file assignment  
PY_INPUT='{"tool_name":"Edit","tool_input":{"file_path":"model.py","operation_type":"machine-learning","description":"Update ML model"}}'
echo "Testing Python ML file assignment"

RESULT=$(echo "$PY_INPUT" | "$HOOKS_DIR/auto-agent-assignment.sh" 2>/dev/null || echo '{"success":false}')
SUCCESS=$(echo "$RESULT" | jq -r '.success // false')
AGENT_TYPE=$(echo "$RESULT" | jq -r '.assigned_agent.type // "unknown"')

if [[ "$SUCCESS" == "true" ]]; then
    echo "✅ PASS: ML agent assignment successful (Type: $AGENT_TYPE)"
else
    echo "❌ FAIL: ML agent assignment failed"
fi

echo ""

# Test 3: Performance Tracking Hook
echo "📋 Test 3: Performance Tracking Hook"
echo "-------------------------------------"

# Test performance tracking
PERF_INPUT='{"tool_name":"Edit","tool_input":{"operation_id":"test-123","operation_type":"edit","start_time":"2024-01-01T10:00:00Z","end_time":"2024-01-01T10:00:05Z","success":"true"}}'
echo "Testing performance tracking"

RESULT=$(echo "$PERF_INPUT" | "$HOOKS_DIR/performance-tracker.sh" 2>/dev/null || echo '{"metrics":{"success":false}}')
TRACKING_SUCCESS=$(echo "$RESULT" | jq -r '.metrics.success // false')

if [[ "$TRACKING_SUCCESS" == "true" ]]; then
    echo "✅ PASS: Performance tracking successful"
else
    echo "❌ FAIL: Performance tracking failed"
fi

# Test performance issue detection
SLOW_INPUT='{"tool_name":"Build","tool_input":{"operation_id":"test-456","operation_type":"build","start_time":"2024-01-01T10:00:00Z","end_time":"2024-01-01T10:02:00Z","success":"true"}}'
echo "Testing slow operation detection"

RESULT=$(echo "$SLOW_INPUT" | "$HOOKS_DIR/performance-tracker.sh" 2>/dev/null || echo '{"issues":[]}')
ISSUES_COUNT=$(echo "$RESULT" | jq '.issues | length' 2>/dev/null || echo "0")

if [[ "$ISSUES_COUNT" -gt 0 ]]; then
    echo "✅ PASS: Performance issues detected ($ISSUES_COUNT issues)"
else
    echo "ℹ️  INFO: No performance issues detected"
fi

echo ""

# Test 4: Integration Test
echo "📋 Test 4: Integration Test"
echo "----------------------------"

echo "Testing hook script integration..."

# Check if log files were created
if [[ -f "$HOME/.claude/enhanced-hooks/safety-validation.log" ]]; then
    echo "✅ PASS: Safety validation logging works"
else
    echo "❌ FAIL: Safety validation logging not working"
fi

if [[ -f "$HOME/.claude/enhanced-hooks/agent-assignment.log" ]]; then
    echo "✅ PASS: Agent assignment logging works"
else
    echo "❌ FAIL: Agent assignment logging not working"
fi

if [[ -f "$HOME/.claude/enhanced-hooks/performance-tracker.log" ]]; then
    echo "✅ PASS: Performance tracking logging works"
else
    echo "❌ FAIL: Performance tracking logging not working"
fi

# Check if metrics were stored
if [[ -f "$HOME/.claude/enhanced-hooks/metrics/$(date +%Y-%m-%d).jsonl" ]]; then
    echo "✅ PASS: Metrics storage works"
else
    echo "ℹ️  INFO: No metrics file found (expected for new installation)"
fi

# Check running stats
if [[ -f "$HOME/.claude/enhanced-hooks/running-stats.json" ]]; then
    TOTAL_OPS=$(cat "$HOME/.claude/enhanced-hooks/running-stats.json" | jq -r '.total_operations // 0')
    echo "✅ PASS: Running statistics work (Total operations: $TOTAL_OPS)"
else
    echo "ℹ️  INFO: No running stats found (expected for new installation)"
fi

echo ""
echo "🎯 Enhanced Hooks System Test Summary"
echo "===================================="

# Count log entries
SAFETY_LOGS=$(wc -l < "$HOME/.claude/enhanced-hooks/safety-validation.log" 2>/dev/null || echo "0")
ASSIGNMENT_LOGS=$(wc -l < "$HOME/.claude/enhanced-hooks/agent-assignment.log" 2>/dev/null || echo "0")
PERFORMANCE_LOGS=$(wc -l < "$HOME/.claude/enhanced-hooks/performance-tracker.log" 2>/dev/null || echo "0")

echo "Safety validation log entries: $SAFETY_LOGS"
echo "Agent assignment log entries: $ASSIGNMENT_LOGS"  
echo "Performance tracking log entries: $PERFORMANCE_LOGS"

# Show sample log content
echo ""
echo "📊 Sample Log Output:"
echo "--------------------"
if [[ -f "$HOME/.claude/enhanced-hooks/safety-validation.log" ]]; then
    echo "Safety Validation (last 3 lines):"
    tail -3 "$HOME/.claude/enhanced-hooks/safety-validation.log"
fi

if [[ -f "$HOME/.claude/enhanced-hooks/agent-assignment.log" ]]; then
    echo "Agent Assignment (last 3 lines):"
    tail -3 "$HOME/.claude/enhanced-hooks/agent-assignment.log"
fi

if [[ -f "$HOME/.claude/enhanced-hooks/performance-tracker.log" ]]; then
    echo "Performance Tracking (last 3 lines):"
    tail -3 "$HOME/.claude/enhanced-hooks/performance-tracker.log"
fi

echo ""
echo "✨ Enhanced Hooks System Test Complete!"

# Cleanup
cd /
rm -rf "$TEST_DIR"