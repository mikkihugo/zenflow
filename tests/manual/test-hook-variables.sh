#!/bin/bash
# Test script for Claude Code hook variables
# This script helps determine which variable approach works with your Claude Code version

echo "🧪 Claude Code Hook Variable Test"
echo "================================="
echo ""
echo "This script will help you test which hook variable approach works with your Claude Code version."
echo ""

# Check Claude Code version
echo "📌 Claude Code Version:"
claude --version 2>/dev/null || echo "Claude Code not found in PATH"
echo ""

# Clean up previous test logs
rm -f .claude/hook-test-*.log

# Test 1: Environment Variables
echo "Test 1: Environment Variables Approach"
echo "--------------------------------------"
cat > .claude/test-env-vars.json << 'EOF'
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"[ENV_VAR_TEST] File: $CLAUDE_EDITED_FILE\" >> .claude/hook-test-env.log"
          }
        ]
      }
    ]
  }
}
EOF
echo "✅ Created .claude/test-env-vars.json"
echo ""

# Test 2: JQ JSON Parsing
echo "Test 2: JQ JSON Parsing Approach"
echo "--------------------------------"
cat > .claude/test-jq.json << 'EOF'
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "cat | jq -r '\"[JQ_TEST] File: \\(.tool_input.file_path // .tool_input.path // \\\"NONE\\\")\"' >> .claude/hook-test-jq.log 2>&1 || echo \"[JQ_TEST] Error parsing JSON\" >> .claude/hook-test-jq.log"
          }
        ]
      }
    ]
  }
}
EOF
echo "✅ Created .claude/test-jq.json"
echo ""

# Test 3: Comprehensive Test
echo "Test 3: Comprehensive Test (All Approaches)"
echo "------------------------------------------"
cat > .claude/test-comprehensive.json << 'EOF'
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo \"=== COMPREHENSIVE TEST $(date) ===\" >> .claude/hook-test-comprehensive.log"
          },
          {
            "type": "command",
            "command": "echo \"ENV: CLAUDE_EDITED_FILE='$CLAUDE_EDITED_FILE'\" >> .claude/hook-test-comprehensive.log"
          },
          {
            "type": "command",
            "command": "echo \"STDIN:\" >> .claude/hook-test-comprehensive.log && cat >> .claude/hook-test-comprehensive.log"
          }
        ]
      }
    ]
  }
}
EOF
echo "✅ Created .claude/test-comprehensive.json"
echo ""

echo "📋 Instructions:"
echo "1. Copy one of the test files to .claude/settings.json:"
echo "   cp .claude/test-env-vars.json .claude/settings.json"
echo ""
echo "2. Open Claude Code and create a test file:"
echo "   claude -c \"Create a file test.txt with content: Hello World\""
echo ""
echo "3. Check the corresponding log file:"
echo "   - Environment vars: .claude/hook-test-env.log"
echo "   - JQ parsing: .claude/hook-test-jq.log"
echo "   - Comprehensive: .claude/hook-test-comprehensive.log"
echo ""
echo "4. Report which approach worked at:"
echo "   https://github.com/ruvnet/claude-flow/issues/249"
echo ""
echo "🔍 To check results after testing:"
echo "   ls -la .claude/hook-test-*.log"
echo "   cat .claude/hook-test-*.log"