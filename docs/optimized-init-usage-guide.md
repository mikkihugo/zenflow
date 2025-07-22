# Optimized Initialization Usage Guide

## Quick Start

The optimized initialization (`--sparc --force`) is the recommended way to set up Claude-Flow for maximum performance and productivity.

```bash
# ⭐ Recommended setup for new projects
npx -y claude-zen@latest init --sparc --force
```

## Complete Usage Guide

### 1. Pre-Installation Checklist

Before initializing, ensure your environment is ready:

```bash
# Verify system requirements
node --version    # Should be 16.0.0 or higher
npm --version     # Should be 8.0.0 or higher
git --version     # For version control integration

# Check directory permissions
pwd               # Confirm you're in the right directory
ls -la           # Verify write permissions
```

### 2. Initialization Commands

#### Recommended Optimized Setup
```bash
# For new projects (recommended)
npx -y claude-zen@latest init --sparc --force

# For existing projects with customizations
# (Backup first)
cp CLAUDE.md CLAUDE.md.backup 2>/dev/null || true
npx claude-zen@latest init --sparc --force
```

#### Alternative Setups
```bash
# Standard SPARC (without optimizations)
npx claude-zen@latest init --sparc

# Minimal setup (basic features only)
npx claude-zen@latest init --minimal

# Preview what will be created (dry run)
npx claude-zen@latest init --sparc --force --dry-run
```

### 3. Post-Installation Verification

After initialization, verify everything is working:

```bash
# Test local executable
./claude-zen --version

# Check SPARC modes are available
./claude-zen sparc modes

# Verify memory system
./claude-zen memory stats

# Test a simple SPARC command
./claude-zen sparc "create a hello world function"

# Check system status
./claude-zen status
```

### 4. Understanding What Gets Created

#### Directory Structure
```
your-project/
├── CLAUDE.md                 # AI-readable project instructions (optimized)
├── memory-bank.md           # Memory system documentation
├── coordination.md          # Agent coordination guide
├── .roomodes               # SPARC mode definitions (optimized prompts)
├── ./claude-zen           # Local executable wrapper
├── .claude/
│   ├── commands/           # Claude Code slash commands
│   │   ├── sparc/         # SPARC-specific commands
│   │   ├── sparc-architect.md
│   │   ├── sparc-code.md
│   │   ├── sparc-tdd.md
│   │   └── ... (20+ commands)
│   └── logs/              # Session logs
├── memory/
│   ├── agents/           # Agent-specific memory
│   ├── sessions/         # Session storage
│   └── claude-zen-data.json # Persistence database
└── coordination/
    ├── memory_bank/      # Shared memory
    ├── subtasks/         # Task breakdown
    └── orchestration/    # Workflow coordination
```

#### Key Files Explained

**CLAUDE.md (Optimized Version)**
- Enhanced with performance-tuned instructions
- Pre-configured best practices
- Optimized prompt patterns
- Quality gates and success criteria

**.roomodes (Optimized Version)**
- 20+ SPARC development modes
- Streamlined system prompts (20% fewer tokens)
- Mode-specific tool restrictions
- Performance-optimized context windows

**Claude Code Slash Commands**
- `/sparc` - Main SPARC orchestrator
- `/sparc-architect` - System design mode
- `/sparc-code` - Implementation mode
- `/sparc-tdd` - Test-driven development
- And 15+ more specialized modes

### 5. First Steps After Installation

#### Step 1: Customize for Your Project
```bash
# Edit CLAUDE.md to add project-specific context
echo "

## Project-Specific Context
- Project Type: [web-app/api/mobile/cli/etc]
- Tech Stack: [React, Node.js, PostgreSQL, etc]
- Team Size: [solo/small/large]
- Experience Level: [junior/mixed/senior]
" >> CLAUDE.md

# Configure project settings
./claude-zen config set project.type "web-app"
./claude-zen config set team.size 5
./claude-zen config set team.experience "mixed"
```

#### Step 2: Test Core Functionality
```bash
# Start with a simple task
./claude-zen sparc "create a simple calculator function with tests"

# Try different modes
./claude-zen sparc run architect "design user authentication system"
./claude-zen sparc run tdd "implement user registration"
./claude-zen sparc run security-review "review authentication code"
```

#### Step 3: Set Up Team Collaboration
```bash
# Initialize shared memory
./claude-zen memory store "project-start" "Project initialized with optimized Claude-Flow setup"

# Create team guidelines
./claude-zen sparc run docs-writer "create team development guidelines"

# Set up monitoring
./claude-zen start --daemon  # Optional: run orchestrator in background
```

### 6. Performance Optimization Tips

#### Monitor Performance
```bash
# Enable performance monitoring
./claude-zen config set monitoring.enabled true

# Track response times
./claude-zen monitor --focus performance

# Analyze token usage
./claude-zen memory query --stats
```

#### Optimize for Your Use Case
```bash
# Web development optimization
./claude-zen config set focus "frontend,backend,api-design"
./claude-zen config set testing.coverage 85
./claude-zen config set security.level "high"

# Mobile development optimization
./claude-zen config set platform "mobile"
./claude-zen config set performance.priority "battery-life"

# API development optimization
./claude-zen config set api.style "RESTful"
./claude-zen config set documentation.auto true
```

### 7. Advanced Configuration

#### Custom SPARC Modes
Create project-specific modes by editing `.roomodes`:

```json
{
  "database-design": {
    "description": "Database schema and query optimization",
    "systemPrompt": "You are a database architect. Focus on efficient schemas, proper indexing, and optimized queries. Always consider data normalization, performance implications, and scalability.",
    "tools": ["sql-analyzer", "schema-validator"],
    "configuration": {
      "temperature": 0.7,
      "maxTokens": 4000,
      "focusAreas": ["performance", "scalability", "data-integrity"]
    }
  }
}
```

#### Team-Specific Customizations
```bash
# Create team configuration file
cat > team-config.json << 'EOF'
{
  "codingStandards": {
    "maxLineLength": 120,
    "indentation": "2-space",
    "namingConvention": "camelCase",
    "testCoverage": 85
  },
  "workflowPreferences": {
    "commitFrequency": "feature",
    "reviewRequired": true,
    "deploymentStrategy": "continuous"
  },
  "qualityGates": {
    "linting": "strict",
    "typeChecking": "strict",
    "securityScan": "required"
  }
}
EOF

# Apply team configuration
./claude-zen config import team-config.json
```

### 8. Integration with Development Workflow

#### Git Integration
```bash
# Add Claude-Flow files to git
git add CLAUDE.md .roomodes .claude/ memory-bank.md coordination.md
git commit -m "feat: Add optimized Claude-Flow configuration

🤖 Generated with Claude-Flow v1.0.50
- Optimized SPARC modes for faster AI responses
- 20+ Claude Code slash commands
- Memory system for persistent context
- Complete development workflow integration"

# Create .gitignore entries
echo "
# Claude-Flow
memory/claude-zen-data.json
.claude/logs/
coordination/memory_bank/*.temp
" >> .gitignore
```

#### CI/CD Integration
```yaml
# .github/workflows/claude-zen-quality.yml
name: Claude-Flow Quality Check
on: [push, pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Claude-Flow
        run: npm install -g claude-zen
      
      - name: Validate Configuration
        run: |
          ./claude-zen config validate
          ./claude-zen sparc modes --validate
      
      - name: Run Quality Gates
        run: |
          ./claude-zen sparc run security-review "automated security scan"
          ./claude-zen sparc run code-review "automated code quality check"
```

### 9. Team Onboarding

#### New Team Member Setup
```bash
# Quick onboarding script
#!/bin/bash
echo "🚀 Setting up Claude-Flow for new team member..."

# Clone project
git clone <project-repo>
cd <project-directory>

# Verify Claude-Flow setup
if [ ! -f "./claude-zen" ]; then
  echo "⚠️  Claude-Flow not initialized. Running setup..."
  npx -y claude-zen@latest init --sparc --force
fi

# Test functionality
./claude-zen --version
./claude-zen sparc modes

# Set up personal configuration
./claude-zen config set user.name "$(git config user.name)"
./claude-zen config set user.experience "junior"  # or senior/intermediate

echo "✅ Claude-Flow setup complete!"
echo "Try: ./claude-zen sparc 'hello world function'"
```

#### Team Training Materials
```bash
# Generate training documentation
./claude-zen sparc run docs-writer "create Claude-Flow training guide for new developers"

# Create example tasks
./claude-zen memory store "training-examples" "
1. Basic function: ./claude-zen sparc 'create utility function'
2. TDD workflow: ./claude-zen sparc tdd 'user validation'
3. Architecture: ./claude-zen sparc run architect 'system design'
4. Review process: ./claude-zen sparc run review 'code quality check'
"
```

### 10. Maintenance and Updates

#### Regular Maintenance
```bash
# Weekly maintenance script
#!/bin/bash
echo "🔧 Claude-Flow weekly maintenance..."

# Update to latest version
npx claude-zen@latest --version

# Clean up old memory entries
./claude-zen memory cleanup --days 30

# Backup configuration
./claude-zen memory export backup-$(date +%Y%m%d).json

# Check system health
./claude-zen status

echo "✅ Maintenance complete"
```

#### Update Process
```bash
# Before updating
./claude-zen memory export pre-update-backup.json
cp CLAUDE.md CLAUDE.md.backup
cp .roomodes .roomodes.backup

# Update to latest version
npm uninstall -g claude-zen
npm install -g claude-zen@latest

# Reinitialize with latest optimizations
npx claude-zen@latest init --sparc --force

# Merge customizations from backup
# (Manual review recommended)
```

### 11. Troubleshooting Common Issues

#### Performance Issues
```bash
# Debug slow responses
./claude-zen config set logging.level debug
./claude-zen monitor --performance

# Check token usage
./claude-zen memory stats --verbose

# Optimize prompts
./claude-zen config set prompts.optimize true
```

#### Configuration Issues
```bash
# Reset to defaults
./claude-zen config reset

# Validate configuration
./claude-zen config validate

# Regenerate corrupted files
rm .roomodes CLAUDE.md
npx claude-zen@latest init --sparc --force
```

### 12. Best Practices Summary

#### Do's
✅ Always use `--sparc --force` for new projects  
✅ Backup before major updates  
✅ Customize for your project type  
✅ Monitor performance regularly  
✅ Train team on optimized workflows  
✅ Use version control for configurations  

#### Don'ts
❌ Don't skip the verification steps  
❌ Don't ignore performance monitoring  
❌ Don't customize without understanding  
❌ Don't update without backing up  
❌ Don't use standard init for new projects  

### 13. Getting Help

#### Built-in Help
```bash
# Command help
./claude-zen init --help
./claude-zen sparc --help
./claude-zen --help

# Mode information
./claude-zen sparc info architect
./claude-zen sparc modes --verbose
```

#### Community Resources
- **Documentation**: https://github.com/ruvnet/claude-code-flow/docs
- **Issues**: https://github.com/ruvnet/claude-code-flow/issues
- **Discussions**: https://github.com/ruvnet/claude-code-flow/discussions

#### Success Metrics

Track these metrics to measure optimization success:
- Response time: Target <5s for simple tasks
- Token usage: ~20% reduction vs standard
- Success rate: >85% first-attempt success
- Code quality: >85/100 automated score
- Team satisfaction: >8/10 developer happiness

## Conclusion

The optimized initialization provides a powerful foundation for AI-assisted development. By following this guide, you'll maximize the benefits of Claude-Flow's enhanced performance while maintaining code quality and team productivity.

Remember: The optimization is just the beginning. Customize for your specific needs, monitor performance, and continuously improve your development workflow.