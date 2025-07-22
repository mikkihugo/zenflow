# Initialization Troubleshooting Guide

## Overview

This guide helps resolve common issues encountered during Claude-Flow initialization, particularly when using the optimized `--sparc --force` setup. Each issue includes symptoms, causes, and step-by-step solutions.

## Quick Diagnostic Commands

Before diving into specific issues, run these commands to gather diagnostic information:

```bash
# Check system environment
node --version
npm --version
npx --version

# Check Claude-Flow version
npx claude-zen@latest --version

# Check network connectivity
curl -I https://registry.npmjs.org/claude-zen

# Check directory permissions
ls -la
pwd
```

## Common Issues and Solutions

### 1. Permission Denied Errors

#### Symptoms
```
Error: EACCES: permission denied, mkdir '.claude'
Error: EACCES: permission denied, open 'CLAUDE.md'
```

#### Causes
- Insufficient directory permissions
- Running in read-only directory
- File ownership issues

#### Solutions

**Solution 1: Fix Directory Permissions**
```bash
# Check current permissions
ls -la

# Fix ownership (if needed)
sudo chown -R $USER:$USER .

# Set proper permissions
chmod 755 .
chmod 644 package.json 2>/dev/null || true

# Retry initialization
npx claude-zen@latest init --sparc --force
```

**Solution 2: Use Different Directory**
```bash
# Create new directory with proper permissions
mkdir ~/my-project
cd ~/my-project

# Initialize there
npx claude-zen@latest init --sparc --force
```

**Solution 3: Run with Sudo (NOT recommended)**
```bash
# Only if other solutions fail and you understand the security implications
sudo npx claude-zen@latest init --sparc --force
sudo chown -R $USER:$USER .
```

### 2. Network and Package Issues

#### Symptoms
```
npm ERR! network request to https://registry.npmjs.org/claude-zen failed
Error: create-sparc failed, creating basic SPARC structure manually...
```

#### Causes
- Network connectivity issues
- Corporate firewall blocking npm registry
- Proxy configuration problems
- npm cache corruption

#### Solutions

**Solution 1: Check and Fix Network**
```bash
# Test connectivity
ping registry.npmjs.org
curl -I https://registry.npmjs.org/claude-zen

# Check npm configuration
npm config list
npm config get registry

# If behind corporate firewall, configure proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

**Solution 2: Clear npm Cache**
```bash
# Clear npm cache
npm cache clean --force

# Clear npx cache
rm -rf ~/.npm/_npx/

# Retry initialization
npx -y claude-zen@latest init --sparc --force
```

**Solution 3: Use Alternative Registry**
```bash
# Temporarily use different registry
npm config set registry https://registry.yarnpkg.com/

# Or use yarn
yarn global add claude-zen
claude-zen init --sparc --force

# Restore original registry
npm config set registry https://registry.npmjs.org/
```

### 3. File Conflicts and Overwrites

#### Symptoms
```
Warning: The following files already exist: CLAUDE.md, .roomodes
Use --force to overwrite existing files
```

#### Causes
- Previous initialization attempt
- Existing project configuration
- Git merge conflicts

#### Solutions

**Solution 1: Safe Backup and Overwrite**
```bash
# Create timestamped backup
mkdir backup-$(date +%Y%m%d-%H%M%S)
cp CLAUDE.md .roomodes backup-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true
cp -r .claude backup-$(date +%Y%m%d-%H%M%S)/ 2>/dev/null || true

# Force overwrite with optimized templates
npx claude-zen@latest init --sparc --force

# Review and merge important customizations
# Compare backup files with new versions
diff backup-*/CLAUDE.md CLAUDE.md || echo "Files are different - review changes"
```

**Solution 2: Selective File Handling**
```bash
# Remove specific files you want to regenerate
rm CLAUDE.md .roomodes
rm -rf .claude/commands/

# Initialize (will only create missing files)
npx claude-zen@latest init --sparc --force
```

**Solution 3: Clean Slate Approach**
```bash
# For complete fresh start (CAREFUL - backs up everything)
mkdir ../project-backup-$(date +%Y%m%d)
cp -r . ../project-backup-$(date +%Y%m%d)/

# Remove Claude-Flow related files
rm -f CLAUDE.md memory-bank.md coordination.md .roomodes
rm -rf .claude/ memory/ coordination/
rm -f ./claude-zen

# Fresh initialization
npx claude-zen@latest init --sparc --force
```

### 4. Template Generation Errors

#### Symptoms
```
Error: Failed to generate template: ReferenceError: createSparcClaudeMd is not defined
TypeError: Cannot read property 'generateOptimizedTemplate' of undefined
```

#### Causes
- Corrupted package installation
- Version mismatch
- Missing dependencies

#### Solutions

**Solution 1: Force Fresh Installation**
```bash
# Uninstall any global installation
npm uninstall -g claude-zen

# Clear all caches
npm cache clean --force
rm -rf ~/.npm/

# Use latest version with -y flag
npx -y claude-zen@latest init --sparc --force
```

**Solution 2: Check Version Compatibility**
```bash
# Check what version is being used
npx claude-zen@latest --version

# If version is outdated, force latest
npx claude-zen@$(npm show claude-zen version) init --sparc --force
```

**Solution 3: Manual Template Generation**
```bash
# If automated generation fails, create basic structure manually
mkdir -p .claude/commands memory coordination

# Create minimal CLAUDE.md
cat > CLAUDE.md << 'EOF'
# Claude Code Configuration - SPARC Development Environment

## Project Overview
This project uses Claude-Flow with SPARC methodology for AI-assisted development.

## Quick Start
- Use `./claude-zen sparc "your task"` for development
- Available modes: architect, code, tdd, debug, security-review
- Memory system: `./claude-zen memory store/query`

## Best Practices
- Write tests first (TDD)
- Keep functions small and focused
- Document all public APIs
- Use TypeScript for type safety
EOF

# Create minimal .roomodes
cat > .roomodes << 'EOF'
{
  "architect": {
    "description": "System design and architecture",
    "systemPrompt": "You are a software architect. Design clean, scalable systems."
  },
  "code": {
    "description": "Code implementation",
    "systemPrompt": "You are a senior developer. Write clean, modular, well-tested code."
  },
  "tdd": {
    "description": "Test-driven development",
    "systemPrompt": "You are a TDD expert. Write tests first, then implement."
  }
}
EOF

echo "✅ Basic structure created manually"
```

### 5. SPARC Mode Loading Issues

#### Symptoms
```
Error: SPARC modes not found
./claude-zen sparc modes returns empty list
Command not found: ./claude-zen
```

#### Causes
- Incomplete initialization
- Missing executable wrapper
- Incorrect working directory

#### Solutions

**Solution 1: Verify Complete Installation**
```bash
# Check for required files
ls -la | grep -E "(CLAUDE.md|\.roomodes|claude-zen)"

# If claude-zen executable missing, recreate it
if [ ! -f "./claude-zen" ]; then
  npx claude-zen@latest init --sparc --force
fi

# Make executable if needed
chmod +x ./claude-zen

# Test SPARC modes
./claude-zen sparc modes
```

**Solution 2: Fix Path and Working Directory**
```bash
# Ensure you're in the right directory
pwd
ls -la CLAUDE.md || echo "Not in project directory"

# If in wrong directory, navigate to project root
cd /path/to/your/project

# Verify initialization
./claude-zen --version
```

**Solution 3: Regenerate SPARC Configuration**
```bash
# Remove and regenerate SPARC files
rm -f .roomodes
rm -rf .claude/

# Reinitialize SPARC components
npx claude-zen@latest init --sparc --force

# Verify modes are loaded
./claude-zen sparc modes --verbose
```

### 6. Memory System Initialization Issues

#### Symptoms
```
Error: Cannot initialize memory system
Memory directory not accessible
./claude-zen memory stats fails
```

#### Causes
- Permission issues with memory directory
- Disk space problems
- File system limitations

#### Solutions

**Solution 1: Fix Memory Directory Permissions**
```bash
# Check memory directory
ls -la memory/ 2>/dev/null || echo "Memory directory missing"

# Recreate memory structure
rm -rf memory/
mkdir -p memory/{agents,sessions}

# Set proper permissions
chmod 755 memory/
chmod 755 memory/agents/
chmod 755 memory/sessions/

# Initialize memory database
echo '{"agents":[],"tasks":[],"lastUpdated":'$(date +%s)'}' > memory/claude-zen-data.json

# Test memory system
./claude-zen memory stats
```

**Solution 2: Check Disk Space**
```bash
# Check available disk space
df -h .

# If low on space, clean up
npm cache clean --force
rm -rf node_modules/
rm -rf .git/logs/ 2>/dev/null || true

# Retry initialization
npx claude-zen@latest init --sparc --force
```

### 7. Claude Code Integration Issues

#### Symptoms
```
Claude Code slash commands not appearing
/sparc command not found in Claude Code
.claude/commands/ directory empty
```

#### Causes
- Incomplete slash command generation
- Claude Code not reading configuration
- File permission issues

#### Solutions

**Solution 1: Regenerate Slash Commands**
```bash
# Remove and recreate slash commands
rm -rf .claude/commands/

# Force regeneration
npx claude-zen@latest init --sparc --force

# Verify slash commands created
ls -la .claude/commands/
ls -la .claude/commands/sparc/

# Check for specific commands
ls .claude/commands/ | grep sparc
```

**Solution 2: Verify Claude Code Integration**
```bash
# Check CLAUDE.md exists and is readable
cat CLAUDE.md | head -10

# Ensure .claude directory structure is correct
find .claude -type f -name "*.md" | head -5

# Restart Claude Code to pick up changes
# (In Claude Code, reload window or restart application)
```

**Solution 3: Manual Slash Command Creation**
```bash
# Create slash commands directory
mkdir -p .claude/commands/sparc

# Create basic /sparc command
cat > .claude/commands/sparc.md << 'EOF'
# SPARC Development Command

Execute SPARC methodology workflows for systematic development.

## Usage
Use this command to run SPARC development tasks with AI assistance.

## Examples
- `/sparc "build user authentication"`
- `/sparc "create REST API with tests"`
- `/sparc "design database schema"`

## Available Modes
Run `./claude-zen sparc modes` to see all available development modes.
EOF

echo "✅ Basic slash commands created"
```

### 8. Performance Issues with Optimized Setup

#### Symptoms
```
Slow response times even with --sparc --force
High token usage despite optimization claims
AI responses not meeting quality expectations
```

#### Causes
- Network latency
- Suboptimal prompts for specific use case
- Configuration not fully applied

#### Solutions

**Solution 1: Verify Optimized Configuration Applied**
```bash
# Check if optimized templates were used
grep -q "optimized" CLAUDE.md && echo "✅ Optimized template" || echo "❌ Standard template"

# Check .roomodes for optimization markers
grep -q "systemPrompt.*focus" .roomodes && echo "✅ Optimized prompts" || echo "❌ Standard prompts"

# Reinitialize if needed
if ! grep -q "optimized" CLAUDE.md; then
  npx claude-zen@latest init --sparc --force
fi
```

**Solution 2: Monitor Performance**
```bash
# Enable performance monitoring
./claude-zen config set monitoring.enabled true
./claude-zen config set logging.level debug

# Test with timing
time ./claude-zen sparc "simple hello world function"

# Check memory usage
./claude-zen memory stats
```

**Solution 3: Optimize for Your Use Case**
```bash
# Customize for your project type
./claude-zen config set project.type "web-app"  # or "api", "mobile", etc.
./claude-zen config set team.experience "senior"  # or "junior", "mixed"

# Update prompts for your domain
# Edit .roomodes to include domain-specific context
```

## Environment-Specific Issues

### Windows Users

#### Common Windows Issues
```powershell
# PowerShell execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Path issues with ./claude-zen
# Use .\claude-zen.cmd instead
npx claude-zen@latest init --sparc --force
.\claude-zen.cmd sparc modes

# If .cmd file missing, create it
@echo off
npx claude-zen %*
```

### macOS Users

#### Common macOS Issues
```bash
# Gatekeeper issues
sudo spctl --master-disable  # Temporarily, not recommended for security

# Permission issues with ~/
sudo chown -R $(whoami) ~/.npm

# Path issues
echo 'export PATH="$PATH:./node_modules/.bin"' >> ~/.zshrc
source ~/.zshrc
```

### Linux Users

#### Common Linux Issues
```bash
# SELinux issues (CentOS/RHEL)
setsebool -P httpd_can_network_connect 1

# File descriptor limits
ulimit -n 4096

# Node.js version issues
# Use Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install --lts
nvm use --lts
```

## Advanced Troubleshooting

### Debug Mode

```bash
# Enable comprehensive debugging
export DEBUG=claude-zen:*
export NODE_ENV=development

# Run with debug output
npx claude-zen@latest init --sparc --force --verbose

# Check debug logs
ls -la .claude/logs/
tail -f .claude/logs/debug.log
```

### Clean Environment Test

```bash
# Test in completely clean environment
mkdir /tmp/claude-zen-test
cd /tmp/claude-zen-test

# Initialize fresh
npx -y claude-zen@latest init --sparc --force

# Test basic functionality
./claude-zen --version
./claude-zen sparc modes
./claude-zen status
```

### System Requirements Verification

```bash
# Check system requirements
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "OS: $(uname -a)"
echo "Available memory: $(free -h 2>/dev/null || vm_stat)"
echo "Disk space: $(df -h .)"

# Minimum requirements check
node -e "
const version = process.version.slice(1).split('.').map(Number);
if (version[0] < 16) {
  console.log('❌ Node.js 16+ required, found:', process.version);
  process.exit(1);
} else {
  console.log('✅ Node.js version OK:', process.version);
}
"
```

## Getting Help

### Community Support

1. **GitHub Issues**: https://github.com/ruvnet/claude-code-flow/issues
2. **Documentation**: https://github.com/ruvnet/claude-code-flow/docs
3. **Discussions**: https://github.com/ruvnet/claude-code-flow/discussions

### Reporting Bugs

When reporting issues, include:

```bash
# Generate diagnostic report
./claude-zen diagnostic > claude-zen-diagnostic.txt

# Include this information:
echo "Claude-Flow Version: $(npx claude-zen --version)"
echo "Node.js Version: $(node --version)"
echo "npm Version: $(npm --version)"
echo "Operating System: $(uname -a)"
echo "Working Directory: $(pwd)"
echo "Directory Contents: $(ls -la)"
echo "Environment Variables:" 
env | grep -E "(NODE|NPM|PATH)" | head -10
```

### Emergency Recovery

If everything fails and you need to start over:

```bash
# Complete cleanup script
#!/bin/bash
echo "🚨 Emergency cleanup - this will remove ALL Claude-Flow files"
read -p "Are you sure? (type 'yes'): " confirm

if [ "$confirm" = "yes" ]; then
  # Remove all Claude-Flow files
  rm -f CLAUDE.md memory-bank.md coordination.md .roomodes
  rm -rf .claude/ memory/ coordination/
  rm -f claude-zen claude-zen.cmd
  
  # Clear npm cache
  npm cache clean --force
  
  # Fresh start
  npx -y claude-zen@latest init --sparc --force
  
  echo "✅ Emergency recovery complete"
else
  echo "❌ Emergency recovery cancelled"
fi
```

## Prevention Best Practices

1. **Always backup before major changes**
2. **Use version control** to track configuration changes
3. **Test in development environment** before production
4. **Keep Claude-Flow updated** regularly
5. **Monitor performance** after changes
6. **Document customizations** for your team

For additional help or complex issues, consult the full documentation or open an issue on GitHub with diagnostic information.