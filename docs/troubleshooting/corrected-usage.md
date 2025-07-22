# Claude Flow v2.0.0 - Correct Command Usage Guide

## ✅ CORRECT COMMAND USAGE

All commands must be prefixed with `claude-zen`:

### 🧠 Swarm Commands
```bash
# CORRECT:
claude-zen swarm "Build a REST API with authentication"
claude-zen swarm "Research cloud patterns" --strategy research
claude-zen swarm "Optimize performance" --max-agents 3 --parallel

# INCORRECT:
swarm "Build a REST API"  # ❌ Won't work
```

### 🐙 GitHub Commands
```bash
# CORRECT:
claude-zen github pr-manager "create feature PR with tests"
claude-zen github gh-coordinator "setup CI/CD pipeline"
claude-zen github release-manager "prepare v2.0.0 release"

# INCORRECT:
github pr-manager "create PR"  # ❌ Won't work
```

### 🤖 Agent Commands
```bash
# CORRECT:
claude-zen agent spawn researcher --name "DataBot"
claude-zen agent list --verbose
claude-zen agent terminate agent-123

# INCORRECT:
agent spawn researcher  # ❌ Won't work
spawn researcher  # ❌ Won't work
```

### 💾 Memory Commands
```bash
# CORRECT:
claude-zen memory store architecture "microservices pattern"
claude-zen memory get architecture
claude-zen memory query "API design"

# INCORRECT:
memory store key value  # ❌ Won't work
```

### 🚀 SPARC Commands
```bash
# CORRECT:
claude-zen sparc "design authentication system"
claude-zen sparc architect "design microservices"
claude-zen sparc tdd "user registration feature"

# INCORRECT:
sparc architect "design"  # ❌ Won't work
```

### 📋 Other Commands
```bash
# CORRECT:
claude-zen init --sparc
claude-zen start --ui --swarm
claude-zen status --verbose
claude-zen task create research "Market analysis"
claude-zen config set terminal.poolSize 15
claude-zen mcp status
claude-zen monitor --watch
claude-zen batch create-config my-batch.json

# INCORRECT:
init --sparc  # ❌ Won't work
start --ui  # ❌ Won't work
status  # ❌ Won't work
```

## 🔍 GET HELP

### Main Help
```bash
claude-zen --help
claude-zen help
claude-zen  # (no arguments also shows help)
```

### Command-Specific Help
```bash
claude-zen swarm --help
claude-zen github --help
claude-zen agent --help
claude-zen memory --help
claude-zen sparc --help
claude-zen init --help
claude-zen help swarm
claude-zen help github
# ... etc for any command
```

## 🚀 QUICK START

```bash
# 1. Initialize with SPARC
npx claude-zen@2.0.0 init --sparc

# 2. Start orchestration
claude-zen start --ui --swarm

# 3. Deploy a swarm
claude-zen swarm "Build REST API" --strategy development --parallel

# 4. Use GitHub automation
claude-zen github pr-manager "coordinate release"

# 5. Check status
claude-zen status --verbose
```

## 📝 IMPORTANT NOTES

1. **Always prefix with `claude-zen`** - The commands won't work without it
2. **Use quotes for objectives** - Especially with spaces: `"Build REST API"`
3. **Check help for options** - Each command has specific options
4. **Use --help liberally** - Detailed help is available for every command

## 🎯 INSTALLATION

### Global Installation (Recommended)
```bash
npm install -g claude-zen@2.0.0
claude-zen init --sparc
```

### Local Installation
```bash
npm install claude-zen@2.0.0
npx claude-zen init --sparc
```

### Direct NPX Usage
```bash
npx claude-zen@2.0.0 init --sparc
npx claude-zen@2.0.0 swarm "Build app"
```

---

Remember: All commands require the `claude-zen` prefix. When in doubt, use `claude-zen --help` or `claude-zen <command> --help` for guidance!