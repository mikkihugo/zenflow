#!/usr/bin/env bash
# Claude Code Zen - Template Installation Script
# Installs all hook templates and command templates to .claude/ directory

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Claude Code Zen Template Installation${NC}"
echo "========================================"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/templates/claude-zen"
CLAUDE_DIR="$SCRIPT_DIR/.claude"

# Create .claude directory structure
echo -e "${YELLOW}📁 Creating .claude directory structure...${NC}"
mkdir -p "$CLAUDE_DIR"/{hooks,commands,agents,scripts}
mkdir -p "$CLAUDE_DIR/hooks"/{enhanced,utils,config}

# Function to install template file
install_template() {
    local src="$1"
    local dest="$2"
    local name="$3"
    
    if [[ -f "$src" ]]; then
        # Remove .template extension and copy
        dest_file="${dest%%.template}"
        cp "$src" "$dest_file"
        
        # Make shell scripts executable
        if [[ "$dest_file" == *.sh ]]; then
            chmod +x "$dest_file"
        fi
        
        echo -e "${GREEN}✅ Installed: $name${NC}"
    else
        echo -e "${YELLOW}⚠️  Template not found: $src${NC}"
    fi
}

# Install hook templates
echo -e "\n${YELLOW}🔧 Installing hook templates...${NC}"

# Enhanced hooks
if [[ -d "$TEMPLATE_DIR/hooks/enhanced" ]]; then
    for template in "$TEMPLATE_DIR/hooks/enhanced"/*.template; do
        if [[ -f "$template" ]]; then
            filename=$(basename "$template")
            name="${filename%.template}"
            install_template "$template" "$CLAUDE_DIR/hooks/enhanced/$filename" "Enhanced Hook: $name"
        fi
    done
fi

# Utility hooks  
if [[ -d "$TEMPLATE_DIR/hooks/utils" ]]; then
    for template in "$TEMPLATE_DIR/hooks/utils"/*.template; do
        if [[ -f "$template" ]]; then
            filename=$(basename "$template")
            name="${filename%.template}"
            install_template "$template" "$CLAUDE_DIR/hooks/utils/$filename" "Utility Hook: $name"
        fi
    done
fi

# Hook configuration
if [[ -d "$TEMPLATE_DIR/hooks/config" ]]; then
    for template in "$TEMPLATE_DIR/hooks/config"/*.template; do
        if [[ -f "$template" ]]; then
            filename=$(basename "$template")
            name="${filename%.template}"
            install_template "$template" "$CLAUDE_DIR/hooks/config/$filename" "Hook Config: $name"
        fi
    done
fi

# Root level hook templates
for template in "$TEMPLATE_DIR/hooks"/*.template; do
    if [[ -f "$template" ]]; then
        filename=$(basename "$template")
        name="${filename%.template}"
        install_template "$template" "$CLAUDE_DIR/hooks/$filename" "Hook: $name"
    fi
done

# Install command templates
echo -e "\n${YELLOW}⚡ Installing command templates...${NC}"

if [[ -d "$TEMPLATE_DIR/commands" ]]; then
    for template in "$TEMPLATE_DIR/commands"/*.template; do
        if [[ -f "$template" ]]; then
            filename=$(basename "$template")
            name="${filename%.template}"
            install_template "$template" "$CLAUDE_DIR/commands/$filename" "Command: $name"
        fi
    done
fi

# Install agent templates
echo -e "\n${YELLOW}🤖 Installing agent templates...${NC}"

if [[ -d "$TEMPLATE_DIR/sub-agents" ]]; then
    for template in "$TEMPLATE_DIR/sub-agents"/*.template; do
        if [[ -f "$template" ]]; then
            filename=$(basename "$template")
            name="${filename%.template}"
            install_template "$template" "$CLAUDE_DIR/agents/$filename" "Agent: $name"
        fi
    done
fi

# Install configuration templates
echo -e "\n${YELLOW}⚙️  Installing configuration templates...${NC}"

# Main configuration files
for config in "settings.json" "package.json"; do
    template="$TEMPLATE_DIR/$config.template"
    if [[ -f "$template" ]]; then
        # Only install if doesn't exist or user confirms overwrite
        if [[ ! -f "$CLAUDE_DIR/$config" ]]; then
            install_template "$template" "$CLAUDE_DIR/$config.template" "Config: $config"
        else
            echo -e "${YELLOW}⚠️  $config already exists, skipping...${NC}"
        fi
    fi
done

# Create additional enhanced hook scripts
echo -e "\n${YELLOW}🧠 Creating enhanced hook scripts...${NC}"

# Pattern Learning Hook
cat > "$CLAUDE_DIR/hooks/enhanced/pattern-learner.sh" << 'EOF'
#!/usr/bin/env bash
# Enhanced Claude Code Hook: Pattern Learning
# Learns from successful and failed operations to improve future performance

INPUT="$1"
OPERATION=$(echo "$INPUT" | jq -r '.operation // {}')
RESULT=$(echo "$INPUT" | jq -r '.result // {}')
CONTEXT=$(echo "$INPUT" | jq -r '.context // {}')

mkdir -p "$HOME/.claude/enhanced-hooks/learning"

# Store learning data
LEARNING_ENTRY="$HOME/.claude/enhanced-hooks/learning/pattern-$(date +%s).json"
cat > "$LEARNING_ENTRY" << EOL
{
    "timestamp": "$(date -Iseconds)",
    "operation": $OPERATION,
    "result": $RESULT,
    "context": $CONTEXT,
    "session_id": "${ZEN_SWARM_SESSION_ID:-unknown}"
}
EOL

echo "$(date -Iseconds): Pattern learning entry saved: $LEARNING_ENTRY" >> "$HOME/.claude/enhanced-hooks/pattern-learner.log"
echo '{"learning_updated": true, "entry_saved": "'$LEARNING_ENTRY'"}'
EOF

# Trust Evaluation Hook  
cat > "$CLAUDE_DIR/hooks/enhanced/trust-evaluator.sh" << 'EOF'
#!/usr/bin/env bash
# Enhanced Claude Code Hook: Trust Evaluation
# Evaluates trustworthiness of operations and entities

INPUT="$1"
ENTITY=$(echo "$INPUT" | jq -r '.entity // {}')
OPERATION=$(echo "$INPUT" | jq -r '.operation // {}')
HISTORY=$(echo "$INPUT" | jq -r '.history // []')

mkdir -p "$HOME/.claude/enhanced-hooks/trust"

# Simple trust calculation based on history
TRUST_SCORE=0.5  # Default neutral trust

if [[ "$HISTORY" != "[]" ]]; then
    # Calculate success rate from history
    SUCCESS_COUNT=$(echo "$HISTORY" | jq '[.[] | select(.success == true)] | length')
    TOTAL_COUNT=$(echo "$HISTORY" | jq 'length')
    
    if [[ "$TOTAL_COUNT" -gt 0 ]]; then
        TRUST_SCORE=$(echo "scale=2; $SUCCESS_COUNT / $TOTAL_COUNT" | bc -l)
    fi
fi

# Determine trust level
if (( $(echo "$TRUST_SCORE >= 0.8" | bc -l) )); then
    TRUST_LEVEL="high"
    RECOMMENDATION="proceed"
elif (( $(echo "$TRUST_SCORE >= 0.6" | bc -l) )); then
    TRUST_LEVEL="medium"  
    RECOMMENDATION="proceed_with_caution"
elif (( $(echo "$TRUST_SCORE >= 0.4" | bc -l) )); then
    TRUST_LEVEL="low"
    RECOMMENDATION="require_approval"
else
    TRUST_LEVEL="untrusted"
    RECOMMENDATION="block"
fi

TRUST_EVALUATION="{\"trust_score\":$TRUST_SCORE,\"trust_level\":\"$TRUST_LEVEL\",\"recommendation\":\"$RECOMMENDATION\"}"

echo "$(date -Iseconds): Trust evaluation - Score: $TRUST_SCORE, Level: $TRUST_LEVEL" >> "$HOME/.claude/enhanced-hooks/trust-evaluator.log"
echo "$TRUST_EVALUATION" | jq '.'

# Exit based on recommendation
case "$RECOMMENDATION" in
    "block") exit 1 ;;
    "require_approval") exit 2 ;;
    "proceed_with_caution") exit 3 ;;
    *) exit 0 ;;
esac
EOF

# Make hook scripts executable
chmod +x "$CLAUDE_DIR/hooks/enhanced"/*.sh

# Create hook configuration
echo -e "\n${YELLOW}⚙️  Creating hook configuration...${NC}"

cat > "$CLAUDE_DIR/hooks/config/hook-config.json" << 'EOF'
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./hooks/enhanced/safety-validation.sh",
            "description": "Validate dangerous bash commands"
          },
          {
            "type": "command", 
            "command": "./hooks/enhanced/deception-scanner.sh",
            "description": "Scan for deceptive or malicious patterns"
          }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "./hooks/enhanced/auto-agent-assignment.sh", 
            "description": "Auto-assign optimal agents based on file type"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "./hooks/enhanced/pattern-learner.sh",
            "description": "Learn from successful operations"
          },
          {
            "type": "command",
            "command": "./hooks/enhanced/performance-tracker.sh",
            "description": "Track performance metrics"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "./hooks/post-command-logging.sh",
            "description": "Log command execution results"
          }
        ]
      }
    ]
  },
  "zen_swarm": {
    "hooks_enabled": true,
    "learning_enabled": true,
    "deception_detection": true,
    "safety_validation": true,
    "performance_tracking": true
  }
}
EOF

echo -e "\n${GREEN}🎉 Template installation complete!${NC}"
echo -e "${BLUE}📁 Installed to: $CLAUDE_DIR${NC}"
echo -e "${BLUE}🔧 Hooks: $(find "$CLAUDE_DIR/hooks" -name "*.sh" | wc -l) scripts${NC}"
echo -e "${BLUE}⚡ Commands: $(find "$CLAUDE_DIR/commands" -name "*.md" -o -name "*.js" | wc -l) files${NC}"
echo -e "${BLUE}🤖 Agents: $(find "$CLAUDE_DIR/agents" -name "*.json" | wc -l) configurations${NC}"

echo -e "\n${YELLOW}💡 Next steps:${NC}"
echo "1. Enable hooks in .claude/settings.json: ZEN_SWARM_HOOKS=true"
echo "2. Test hooks with: npx claude-zen hook deception-scan --content 'test'"
echo "3. Initialize swarm with: npx claude-zen swarm init"

echo -e "\n${GREEN}✨ Enhanced hooks with learning and deception detection are ready!${NC}"