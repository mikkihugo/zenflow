# Troubleshooting Guide

This comprehensive troubleshooting guide covers common issues, diagnostic procedures, and solutions for Claude-Flow system problems. Use this guide to quickly identify and resolve issues in your Claude-Flow deployment.

## Common Installation and Setup Issues

### Installation Problems

**Issue: Command not found after installation**
```bash
# Diagnosis
which claude-zen
echo $PATH
npm list -g claude-zen

# Solutions
# For NPM global installation
npm install -g claude-zen
npm bin -g  # Check global bin directory

# For Deno installation
deno info claude-zen
export PATH="$HOME/.deno/bin:$PATH"
echo 'export PATH="$HOME/.deno/bin:$PATH"' >> ~/.bashrc

# Verify installation
claude-zen --version
claude-zen help
```

**Issue: Permission denied errors**
```bash
# Diagnosis
ls -la $(which claude-zen)
id
groups

# Solutions
# Fix executable permissions
chmod +x $(which claude-zen)

# For NPM permission issues
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Use sudo for global installation (not recommended)
sudo npm install -g claude-zen

# Alternative: Use npx without global installation
npx claude-zen --version
```

**Issue: Deno compilation failures**
```bash
# Diagnosis
deno --version
deno check src/cli/index.ts
deno info

# Solutions
# Update Deno to latest version
curl -fsSL https://deno.land/x/install/install.sh | sh

# Clear Deno cache
deno cache --reload src/cli/index.ts

# Manual compilation
deno compile --allow-all --output bin/claude-zen src/cli/index.ts

# Check dependencies
deno info src/cli/index.ts
```

### Configuration Issues

**Issue: Configuration file not found or invalid**
```bash
# Diagnosis
claude-zen config show
ls -la claude-zen.config.json
claude-zen config validate

# Solutions
# Initialize default configuration
claude-zen config init

# Validate existing configuration
claude-zen config validate --fix-issues

# Use custom configuration path
claude-zen --config /path/to/config.json start

# Reset to defaults
claude-zen config init --force --backup-existing
```

**Issue: Environment variable conflicts**
```bash
# Diagnosis
env | grep CLAUDE_FLOW
printenv | grep -i claude

# Solutions
# Clear conflicting environment variables
unset CLAUDE_FLOW_CONFIG
unset CLAUDE_FLOW_DEBUG

# Set proper environment variables
export CLAUDE_FLOW_CONFIG_PATH=/path/to/config.json
export CLAUDE_FLOW_LOG_LEVEL=debug

# Verify environment
claude-zen config show --include-env
```

## Agent Management Issues

### Agent Spawning Problems

**Issue: Agents fail to spawn**
```bash
# Diagnosis
claude-zen agent list --all
claude-zen system resources
claude-zen logs --component orchestrator --level error

# Check system limits
ulimit -a
free -h
df -h

# Solutions
# Increase resource limits
claude-zen config set orchestrator.maxConcurrentAgents 5
claude-zen config set memory.cacheSizeMB 256

# Clear stuck agent processes
claude-zen agent cleanup --force
claude-zen system reset --soft

# Check for resource constraints
claude-zen system optimize --free-memory
```

**Issue: Agent communication failures**
```bash
# Diagnosis
claude-zen agent health --all
claude-zen network diagnose
claude-zen coordination queue status

# Solutions
# Restart coordination manager
claude-zen coordination restart

# Clear message queues
claude-zen coordination queue clear --confirm

# Reset agent communication
claude-zen agent reset-communication --all

# Check network connectivity
claude-zen network test --internal --external
```

**Issue: Agents consuming excessive resources**
```bash
# Diagnosis
claude-zen agent resources --top 10
claude-zen agent monitor <agent-id> --metrics memory,cpu
top -p $(pgrep -f claude-zen)

# Solutions
# Set resource limits
claude-zen agent update <agent-id> --memory-limit 1GB --cpu-limit 2

# Enable agent recycling
claude-zen config set orchestrator.agentRecycling true
claude-zen config set orchestrator.recycleThreshold 100

# Restart resource-heavy agents
claude-zen agent restart <agent-id> --graceful
```

### Agent Performance Issues

**Issue: Agents responding slowly**
```bash
# Diagnosis
claude-zen agent performance-analysis --all
claude-zen task queue-analysis
claude-zen system performance --detailed

# Solutions
# Optimize task distribution
claude-zen task rebalance --strategy performance
claude-zen coordination optimize

# Increase parallelism
claude-zen config set coordination.maxConcurrentTasks 10

# Clear performance bottlenecks
claude-zen performance optimize --focus agents
```

## Task Coordination Problems

### Task Queue Issues

**Issue: Tasks stuck in pending state**
```bash
# Diagnosis
claude-zen task list --status pending --detailed
claude-zen coordination deadlock-check
claude-zen task dependencies --check-cycles

# Solutions
# Resolve deadlocks automatically
claude-zen coordination deadlock-resolve --auto

# Manual task intervention
claude-zen task force-assign <task-id> --agent <agent-id>
claude-zen task clear-dependencies <task-id> --unsafe

# Reset task queue
claude-zen coordination queue reset --type pending --backup
```

**Issue: Task execution timeouts**
```bash
# Diagnosis
claude-zen task logs <task-id> --tail 100
claude-zen agent info <agent-id> --current-task
claude-zen coordination timeout-analysis

# Solutions
# Increase timeouts
claude-zen config set coordination.resourceTimeout 300000
claude-zen task update <task-id> --timeout 600s

# Optimize task execution
claude-zen task optimize <task-id> --strategy speed
claude-zen task split <task-id> --subtasks 3

# Force task completion
claude-zen task force-complete <task-id> --with-partial-results
```

**Issue: Dependency resolution failures**
```bash
# Diagnosis
claude-zen task dependencies <task-id> --validate
claude-zen task dependency-graph --check-cycles
claude-zen coordination dependency-analysis

# Solutions
# Fix circular dependencies
claude-zen task fix-dependencies <task-id> --break-cycles

# Manual dependency override
claude-zen task clear-dependencies <task-id> --selective
claude-zen task add-dependency <task-id> --depends-on <other-task-id>

# Reset dependency graph
claude-zen coordination reset-dependencies --rebuild
```

### Workflow Execution Issues

**Issue: Workflows failing to start**
```bash
# Diagnosis
claude-zen task workflow validate <workflow-file>
claude-zen task workflow simulate <workflow-file> --dry-run
claude-zen coordination workflow-analysis

# Solutions
# Fix workflow definition
claude-zen task workflow fix <workflow-file> --auto-correct
claude-zen task workflow validate <workflow-file> --strict

# Manual workflow execution
claude-zen task workflow execute <workflow-file> --force --ignore-warnings

# Workflow debugging
claude-zen task workflow debug <workflow-id> --step-by-step
```

## Memory System Issues

### Memory Synchronization Problems

**Issue: Memory conflicts between agents**
```bash
# Diagnosis
claude-zen memory conflicts --check-all
claude-zen memory integrity-check --detailed
claude-zen memory sync-status

# Solutions
# Resolve conflicts automatically
claude-zen memory resolve-conflicts --strategy crdt
claude-zen memory rebuild-index --force

# Manual conflict resolution
claude-zen memory conflicts list --unresolved
claude-zen memory resolve-conflict <conflict-id> --manual

# Reset memory synchronization
claude-zen memory sync-reset --full-rebuild
```

**Issue: Memory usage growing unchecked**
```bash
# Diagnosis
claude-zen memory stats --detailed --breakdown
claude-zen memory analyze --size-distribution
du -sh ~/.claude-zen/memory/*

# Solutions
# Immediate cleanup
claude-zen memory cleanup --aggressive
claude-zen memory compact --force

# Configure retention
claude-zen config set memory.retentionDays 14
claude-zen config set memory.compressionEnabled true

# Archive old data
claude-zen memory archive --older-than 30d --compress
```

**Issue: Memory corruption or data loss**
```bash
# Diagnosis
claude-zen memory integrity-check --full
claude-zen memory validate --all-entries
claude-zen memory backup-status

# Solutions
# Restore from backup
claude-zen memory restore --backup latest --verify
claude-zen memory rebuild-from-logs --since last-good-backup

# Repair corrupted data
claude-zen memory repair --fix-corruption --backup-first
claude-zen memory rebuild-index --verify-integrity

# Emergency data recovery
claude-zen memory emergency-recovery --from-fragments
```

### Memory Performance Issues

**Issue: Slow memory operations**
```bash
# Diagnosis
claude-zen memory performance-analysis
claude-zen memory cache-analysis
claude-zen memory index-analysis

# Solutions
# Optimize cache settings
claude-zen config set memory.cacheSizeMB 512
claude-zen memory cache-optimize --preload frequently-accessed

# Rebuild indexes
claude-zen memory rebuild-indexes --parallel
claude-zen memory optimize-queries --create-missing-indexes

# Database optimization
claude-zen memory vacuum --full
claude-zen memory analyze-statistics
```

## Terminal Management Issues

### Terminal Session Problems

**Issue: Terminal sessions not starting**
```bash
# Diagnosis
claude-zen terminal pool status
claude-zen terminal diagnose --all
claude-zen system check --terminal

# Solutions
# Reset terminal pool
claude-zen terminal pool reset --force
claude-zen terminal pool initialize --rebuild

# Check shell availability
which bash zsh sh
echo $SHELL

# Fix terminal configuration
claude-zen config set terminal.type auto
claude-zen config set terminal.shellPreference '["bash","zsh","sh"]'
```

**Issue: Commands hanging or timing out**
```bash
# Diagnosis
claude-zen terminal logs <session-id> --tail 50
claude-zen terminal performance <session-id>
ps aux | grep claude-zen

# Solutions
# Increase command timeout
claude-zen config set terminal.commandTimeout 600000

# Kill hanging processes
claude-zen terminal kill-hanging --force
pkill -f "claude-zen.*terminal"

# Restart terminal session
claude-zen terminal restart <session-id> --clean-state
```

**Issue: Terminal pool exhaustion**
```bash
# Diagnosis
claude-zen terminal pool stats --utilization
claude-zen terminal list --status all
claude-zen system resources --terminals

# Solutions
# Increase pool size
claude-zen config set terminal.poolSize 20

# Clean up idle sessions
claude-zen terminal cleanup --idle-timeout 30m
claude-zen terminal pool recycle --force

# Optimize session reuse
claude-zen config set terminal.recycleAfter 50
```

### Multi-Terminal Coordination Issues

**Issue: Multi-terminal workflows failing**
```bash
# Diagnosis
claude-zen terminal multi-status <workflow-name>
claude-zen terminal dependency-check <workflow-name>
claude-zen terminal logs-aggregate <workflow-name>

# Solutions
# Fix dependency issues
claude-zen terminal multi-fix-dependencies <workflow-name>
claude-zen terminal restart-failed <workflow-name>

# Manual workflow recovery
claude-zen terminal multi-recover <workflow-name> --from-checkpoint
claude-zen terminal multi-restart <workflow-name> --selective

# Simplify workflow
claude-zen terminal multi-optimize <workflow-name> --reduce-dependencies
```

## MCP Integration Issues

### MCP Server Problems

**Issue: MCP server not starting**
```bash
# Diagnosis
claude-zen mcp status --detailed
claude-zen mcp logs --tail 100
netstat -tulpn | grep 3000

# Solutions
# Change MCP port
claude-zen config set mcp.port 3001
claude-zen mcp restart

# Fix port conflicts
lsof -i :3000
kill -9 $(lsof -t -i:3000)

# Validate MCP configuration
claude-zen mcp validate-config --fix-issues
```

**Issue: Tools not responding or timing out**
```bash
# Diagnosis
claude-zen mcp tools list --health
claude-zen mcp tools test <tool-name> --verbose
claude-zen mcp monitor --tools all

# Solutions
# Restart MCP tools
claude-zen mcp tools restart <tool-name>
claude-zen mcp tools refresh-registry

# Increase timeouts
claude-zen config set mcp.requestTimeout 60000

# Tool debugging
claude-zen mcp tools debug <tool-name> --trace
```

**Issue: Tool authentication failures**
```bash
# Diagnosis
claude-zen mcp auth status
claude-zen mcp tools permissions check <tool-name>
claude-zen mcp audit --auth-failures

# Solutions
# Regenerate tokens
claude-zen mcp auth regenerate-tokens --all
claude-zen mcp auth refresh-permissions

# Fix permission issues
claude-zen mcp permissions repair <tool-name>
claude-zen mcp auth validate --fix-invalid

# Reset authentication
claude-zen mcp auth reset --confirm
```

### Tool Integration Issues

**Issue: Custom tools not loading**
```bash
# Diagnosis
claude-zen mcp tools validate <tool-path>
claude-zen mcp tools registry status
ls -la /path/to/tools/

# Solutions
# Reinstall tools
claude-zen mcp tools reinstall <tool-name>
claude-zen mcp tools register --force <tool-path>

# Fix tool permissions
chmod +x /path/to/tools/*
claude-zen mcp tools fix-permissions --all

# Rebuild tool registry
claude-zen mcp tools rebuild-registry
```

## Network and Connectivity Issues

### Network Diagnostics

**Issue: Network connectivity problems**
```bash
# Diagnosis
claude-zen network test --comprehensive
ping -c 4 8.8.8.8
curl -I https://api.github.com

# Solutions
# Configure proxy settings
claude-zen config set network.proxy "http://proxy.company.com:8080"
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080

# DNS resolution issues
echo "nameserver 8.8.8.8" | sudo tee -a /etc/resolv.conf
systemctl restart systemd-resolved

# Firewall issues
sudo ufw allow 3000/tcp
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT
```

**Issue: SSL/TLS certificate problems**
```bash
# Diagnosis
openssl s_client -connect api.example.com:443
curl -v https://api.example.com

# Solutions
# Update CA certificates
sudo apt-get update && sudo apt-get install ca-certificates
sudo update-ca-certificates

# Disable SSL verification (development only)
claude-zen config set network.verifySSL false
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Custom certificate handling
claude-zen config set network.customCA "/path/to/ca-cert.pem"
```

## Performance and Resource Issues

### System Performance Problems

**Issue: High CPU or memory usage**
```bash
# Diagnosis
claude-zen system resources --detailed
top -p $(pgrep -f claude-zen)
htop

# Solutions
# Optimize performance settings
claude-zen performance optimize --profile production
claude-zen config set orchestrator.resourceAllocationStrategy memory-optimized

# Limit resource usage
claude-zen config set orchestrator.maxConcurrentAgents 5
claude-zen config set memory.cacheSizeMB 128

# Enable resource monitoring
claude-zen monitoring enable --alerts true
```

**Issue: Slow response times**
```bash
# Diagnosis
claude-zen performance analyze --duration 5m
claude-zen benchmark --comprehensive
claude-zen bottleneck-analysis

# Solutions
# Performance tuning
claude-zen performance tune --aggressive
claude-zen cache optimize --preload

# Parallel processing optimization
claude-zen config set coordination.maxConcurrentTasks 8
claude-zen config set terminal.maxConcurrentCommands 10

# Database optimization
claude-zen memory optimize --rebuild-indexes
```

### Resource Exhaustion

**Issue: Out of memory errors**
```bash
# Diagnosis
free -h
claude-zen memory usage --breakdown
dmesg | grep -i "out of memory"

# Solutions
# Free memory immediately
claude-zen memory cleanup --emergency
claude-zen cache clear --all

# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Optimize memory settings
claude-zen config set memory.cacheSizeMB 64
claude-zen config set orchestrator.maxConcurrentAgents 3
```

**Issue: Disk space exhaustion**
```bash
# Diagnosis
df -h
du -sh ~/.claude-zen/*
claude-zen disk-usage --analyze

# Solutions
# Clean up immediately
claude-zen cleanup --aggressive --logs --cache --temp
claude-zen memory archive --compress --older-than 7d

# Configure retention policies
claude-zen config set logging.maxFileSize "5MB"
claude-zen config set logging.maxFiles 3
claude-zen config set memory.retentionDays 7

# Move data to larger disk
claude-zen migrate --data-directory /mnt/large-disk/claude-zen
```

## Debugging and Diagnostic Tools

### System Diagnostics

**Comprehensive System Check:**
```bash
# Full system diagnostic
claude-zen diagnose --comprehensive --output diagnostic-report.json

# Component-specific diagnostics
claude-zen diagnose --component orchestrator --verbose
claude-zen diagnose --component memory --include-performance
claude-zen diagnose --component terminal --check-compatibility
claude-zen diagnose --component mcp --test-tools
```

**Performance Diagnostics:**
```bash
# Performance profiling
claude-zen profile --duration 10m --output performance-profile.json
claude-zen benchmark --save-baseline baseline-$(date +%Y%m%d).json

# Resource monitoring
claude-zen monitor --real-time --all-components
claude-zen resources --continuous --alert-thresholds "cpu:80,memory:90"
```

### Log Analysis

**Centralized Log Analysis:**
```bash
# View all system logs
claude-zen logs --all-components --since 1h
claude-zen logs --level error --grep "failed\|timeout\|error"

# Export logs for analysis
claude-zen logs export --format json --output logs-$(date +%Y%m%d).json
claude-zen logs aggregate --time-range 24h --analysis true

# Search and filter logs
claude-zen logs search "memory" --component orchestrator --time-range 6h
claude-zen logs pattern-analysis --detect-anomalies
```

### Debug Information Collection

**Collecting Debug Information:**
```bash
# Generate comprehensive debug package
claude-zen debug-info collect \
  --include-system \
  --include-logs \
  --include-configs \
  --include-performance \
  --output debug-package-$(date +%Y%m%d).tar.gz

# Privacy-safe debug collection
claude-zen debug-info collect \
  --sanitize-sensitive \
  --exclude-data \
  --include-structure-only \
  --output safe-debug-package.tar.gz
```

## Recovery Procedures

### Emergency Recovery

**System Recovery Procedures:**
```bash
# Safe mode startup
claude-zen start --safe-mode --minimal-agents --read-only-memory

# System reset (soft)
claude-zen reset --soft --backup-data --preserve-config

# System reset (hard) - use with caution
claude-zen reset --hard --confirm --backup-location /tmp/claude-zen-backup

# Restore from backup
claude-zen restore --backup claude-zen-backup-20241215.tar.gz --verify
```

**Data Recovery:**
```bash
# Memory data recovery
claude-zen memory recover --from-logs --since last-backup
claude-zen memory rebuild --verify-integrity

# Configuration recovery
claude-zen config restore --from-backup --merge-with-current
claude-zen config repair --fix-corruption

# Emergency data export
claude-zen export --emergency --all-data --output emergency-export.json
```

## Getting Additional Help

### Built-in Help and Documentation

**Interactive Help:**
```bash
# General help
claude-zen help
claude-zen <command> --help

# Interactive troubleshooting wizard
claude-zen troubleshoot --interactive --guided

# Self-diagnostic with auto-fix
claude-zen self-check --fix-issues --report-problems
```

### Support Resources

**Community Support:**
- **GitHub Issues**: https://github.com/ruvnet/claude-code-flow/issues
- **Discussions**: https://github.com/ruvnet/claude-code-flow/discussions
- **Discord Community**: https://discord.gg/claude-zen

**Professional Support:**
- **Enterprise Support**: support@claude-zen.dev
- **Consulting Services**: consulting@claude-zen.dev
- **Training Programs**: training@claude-zen.dev

### Reporting Issues

**Issue Reporting:**
```bash
# Generate issue report
claude-zen report-issue \
  --title "Agent communication failures" \
  --description "Detailed problem description" \
  --include-diagnostics \
  --include-logs \
  --output issue-report.json

# Submit to GitHub (requires gh CLI)
gh issue create \
  --title "Claude-Flow Issue Report" \
  --body-file issue-report.json \
  --label "bug,needs-triage"
```

**Best Practices for Issue Reporting:**
1. Include Claude-Flow version: `claude-zen --version`
2. Provide system information: `claude-zen system-info`
3. Include relevant logs and error messages
4. Describe steps to reproduce the issue
5. Mention any recent configuration changes
6. Include diagnostic output when possible

This troubleshooting guide should help resolve most common issues with Claude-Flow. For persistent problems, don't hesitate to reach out to the community or professional support channels.