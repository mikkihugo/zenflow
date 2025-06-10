# Troubleshooting Guide

Comprehensive troubleshooting guide for diagnosing and resolving common issues with Claude-Flow.

## Quick Diagnostics

### System Health Check

```bash
# Run comprehensive health check
claude-flow status --health-check --detailed

# Check specific components
claude-flow status --component orchestrator
claude-flow status --component memory
claude-flow status --component terminal
claude-flow status --component mcp

# Export diagnostics
claude-flow diagnostics export ./claude-flow-diagnostics.json
```

### Common Commands for Troubleshooting

```bash
# View system logs
claude-flow logs --tail 100 --level error

# Check configuration
claude-flow config validate
claude-flow config show --format json

# Monitor real-time activity
claude-flow monitor --watch --interval 5

# Debug mode
claude-flow start --debug --log-level trace
```

## Installation and Setup Issues

### Issue: Installation Fails

**Error Messages:**
```bash
npm ERR! ENOENT: no such file or directory, open 'package.json'
Error: Failed to install claude-flow
```

**Solutions:**

1. **Update Node.js and npm:**
```bash
# Check versions
node --version  # Should be 18+ 
npm --version   # Should be 9+

# Update if needed
npm install -g npm@latest
```

2. **Clear npm cache:**
```bash
npm cache clean --force
npm install -g claude-flow
```

3. **Use alternative installation methods:**
```bash
# Try npx instead
npx claude-flow

# Or install from source
git clone https://github.com/ruvnet/claude-code-flow.git
cd claude-code-flow
deno task install
```

4. **Check permissions:**
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use a Node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Issue: Configuration File Not Found

**Error Messages:**
```bash
Error: Configuration file not found: ./claude-flow.config.json
Failed to load configuration
```

**Solutions:**

1. **Initialize configuration:**
```bash
claude-flow config init
```

2. **Use custom config path:**
```bash
claude-flow --config /path/to/config.json start
```

3. **Check file permissions:**
```bash
ls -la claude-flow.config.json
chmod 644 claude-flow.config.json
```

4. **Validate configuration:**
```bash
claude-flow config validate claude-flow.config.json
```

### Issue: Port Already in Use

**Error Messages:**
```bash
Error: Port 3000 is already in use
EADDRINUSE: address already in use :::3000
```

**Solutions:**

1. **Find and kill process using port:**
```bash
# Find process using port
lsof -i :3000
netstat -tulpn | grep :3000

# Kill the process
kill -9 <PID>
```

2. **Use different port:**
```bash
claude-flow start --port 3001
```

3. **Update configuration:**
```json
{
  "mcp": {
    "http": {
      "port": 3001
    }
  }
}
```

## Agent and Task Issues

### Issue: Agent Won't Start

**Error Messages:**
```bash
Error: Failed to spawn agent
Agent initialization timeout
No suitable agent found for task
```

**Diagnostic Steps:**

1. **Check agent configuration:**
```bash
claude-flow agent validate-config ./agent-config.json
```

2. **Verify system resources:**
```bash
claude-flow status --resources
free -h  # Check memory
df -h    # Check disk space
```

3. **Check agent logs:**
```bash
claude-flow logs --component agent --agent-id agent_123
```

4. **Test agent creation:**
```bash
claude-flow agent spawn researcher --name "Test Agent" --debug
```

**Common Solutions:**

1. **Insufficient resources:**
```bash
# Reduce concurrent agents
claude-flow config set orchestrator.maxConcurrentAgents 3

# Increase memory limit
claude-flow config set agents.defaults.memoryLimit 256
```

2. **Configuration issues:**
```bash
# Reset to defaults
claude-flow config init --force

# Use minimal configuration
claude-flow agent spawn researcher --minimal
```

3. **Clean up stuck agents:**
```bash
claude-flow agent cleanup --force
claude-flow agent terminate --all --force
```

### Issue: Tasks Failing or Timing Out

**Error Messages:**
```bash
Task execution timeout
Task failed with error: agent_unavailable
Task queue is full
```

**Diagnostic Steps:**

1. **Check task status:**
```bash
claude-flow task status task_123 --detailed
claude-flow task list --status failed --limit 10
```

2. **Monitor task execution:**
```bash
claude-flow task monitor task_123 --watch
```

3. **Check agent capacity:**
```bash
claude-flow agent list --format table
claude-flow agent load-balance --analyze
```

**Solutions:**

1. **Increase timeouts:**
```bash
claude-flow task update task_123 --timeout 600000
claude-flow config set tasks.defaults.timeout 900000
```

2. **Optimize task assignment:**
```bash
# Enable auto-assignment
claude-flow config set agents.policies.autoAssignment.enabled true

# Balance agent loads
claude-flow agent rebalance --algorithm weighted
```

3. **Scale agent pool:**
```bash
# Spawn additional agents
claude-flow agent spawn researcher --auto-assign
claude-flow config set orchestrator.maxConcurrentAgents 10
```

## Memory System Issues

### Issue: Memory Database Errors

**Error Messages:**
```bash
SQLite database is locked
Memory backend initialization failed
Database corruption detected
```

**Diagnostic Steps:**

1. **Check database status:**
```bash
claude-flow memory health --check-integrity
sqlite3 ./data/memory.db "PRAGMA integrity_check;"
```

2. **Check file permissions:**
```bash
ls -la ./data/memory.db
lsof ./data/memory.db  # Check if file is locked
```

3. **Analyze memory usage:**
```bash
claude-flow memory stats --detailed
claude-flow memory analyze --check-corruption
```

**Solutions:**

1. **Fix database locks:**
```bash
# Stop all processes using the database
claude-flow stop
pkill -f claude-flow

# Remove lock files if they exist
rm -f ./data/memory.db-wal
rm -f ./data/memory.db-shm

# Restart with WAL mode
claude-flow config set memory.backends.sqlite.options.journalMode WAL
claude-flow start
```

2. **Repair database corruption:**
```bash
# Backup current database
cp ./data/memory.db ./data/memory.db.backup

# Attempt repair
claude-flow memory repair --fix-corruption --rebuild-indexes

# If repair fails, restore from backup
claude-flow memory restore ./data/memory.db.backup
```

3. **Optimize database performance:**
```bash
# Vacuum database
claude-flow memory vacuum --full

# Rebuild indexes
claude-flow memory reindex --all

# Optimize configuration
claude-flow config set memory.backends.sqlite.options.cacheSize 20000
```

### Issue: Memory Search Not Working

**Error Messages:**
```bash
Vector search failed
No search results found
Embedding generation error
```

**Diagnostic Steps:**

1. **Check indexing status:**
```bash
claude-flow memory index status
claude-flow memory embeddings status
```

2. **Test search functionality:**
```bash
claude-flow memory search --text "test query" --debug
claude-flow memory query --category research --debug
```

3. **Verify embedding service:**
```bash
curl -X POST "https://api.openai.com/v1/embeddings" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": "test", "model": "text-embedding-ada-002"}'
```

**Solutions:**

1. **Rebuild indexes:**
```bash
claude-flow memory index rebuild --force
claude-flow memory embeddings regenerate --batch-size 50
```

2. **Fix embedding configuration:**
```json
{
  "memory": {
    "indexing": {
      "vectorSearch": {
        "enabled": true,
        "embeddingService": {
          "provider": "openai",
          "apiKey": "${OPENAI_API_KEY}",
          "timeout": 30000
        }
      }
    }
  }
}
```

3. **Fallback to alternative search:**
```bash
# Use full-text search instead
claude-flow memory search --text "query" --method fulltext

# Use basic query
claude-flow memory query --content-contains "keyword"
```

## Terminal and Execution Issues

### Issue: Terminal Won't Start

**Error Messages:**
```bash
Failed to initialize terminal
Terminal pool exhausted
VSCode terminal API not available
```

**Diagnostic Steps:**

1. **Check terminal configuration:**
```bash
claude-flow terminal config validate
claude-flow terminal pool status
```

2. **Test terminal creation:**
```bash
claude-flow terminal create --type native --test
claude-flow terminal test-connectivity
```

3. **Check VSCode integration:**
```bash
# Verify VSCode is running and extension is active
code --version
code --list-extensions | grep claude-flow
```

**Solutions:**

1. **Fix terminal pool issues:**
```bash
# Reset terminal pool
claude-flow terminal pool reset

# Increase pool size
claude-flow config set terminal.poolSize 10

# Use native terminals if VSCode fails
claude-flow config set terminal.type native
```

2. **Resolve VSCode integration:**
```bash
# Restart VSCode
code --relaunch

# Reinstall extension
code --uninstall-extension claude-flow
code --install-extension claude-flow

# Use alternative terminal type
claude-flow config set terminal.type auto
```

3. **Check shell configuration:**
```bash
# Verify shell exists
which zsh
which bash

# Test shell execution
claude-flow terminal exec "echo 'test'" --shell bash
```

### Issue: Command Execution Failures

**Error Messages:**
```bash
Command execution timeout
Permission denied
Command not found
Terminal session lost
```

**Diagnostic Steps:**

1. **Test basic commands:**
```bash
claude-flow terminal exec "echo 'hello'" --debug
claude-flow terminal exec "pwd" --timeout 10000
```

2. **Check permissions:**
```bash
claude-flow terminal exec "whoami"
claude-flow terminal exec "groups"
```

3. **Verify PATH and environment:**
```bash
claude-flow terminal exec "echo \$PATH"
claude-flow terminal exec "env"
```

**Solutions:**

1. **Fix permission issues:**
```bash
# Add claude-flow to sudoers if needed
echo "claude-flow ALL=(ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/claude-flow

# Or run with specific user
claude-flow config set terminal.native.user $(whoami)
```

2. **Fix PATH issues:**
```bash
# Update PATH in configuration
claude-flow config set terminal.native.environment.PATH "/usr/local/bin:/usr/bin:/bin:$PATH"

# Or fix in shell profile
echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
```

3. **Increase timeouts:**
```bash
claude-flow config set terminal.commandTimeout 300000
```

## MCP and Tool Issues

### Issue: MCP Server Won't Start

**Error Messages:**
```bash
MCP server failed to start
Transport initialization failed
Tool registration failed
```

**Diagnostic Steps:**

1. **Check MCP configuration:**
```bash
claude-flow mcp config validate
claude-flow mcp status
```

2. **Test transport connectivity:**
```bash
claude-flow mcp test-transport --transport stdio
claude-flow mcp test-transport --transport http --port 3000
```

3. **Check tool registry:**
```bash
claude-flow mcp tool list
claude-flow mcp tool validate --all
```

**Solutions:**

1. **Fix transport issues:**
```bash
# Try different transport
claude-flow config set mcp.transport stdio

# Check port availability
netstat -tulpn | grep :3000
```

2. **Repair tool registry:**
```bash
# Clear and rebuild tool registry
claude-flow mcp tool registry clear
claude-flow mcp tool registry rebuild

# Re-register tools
claude-flow mcp tool register ./tools/ --recursive
```

3. **Reset MCP server:**
```bash
# Stop MCP server
claude-flow mcp stop

# Clear state
rm -rf ./data/mcp-state

# Restart with debug
claude-flow mcp start --debug --log-level trace
```

### Issue: Tool Execution Failures

**Error Messages:**
```bash
Tool not found
Tool execution timeout
Permission denied for tool
Tool sandbox error
```

**Diagnostic Steps:**

1. **Test tool directly:**
```bash
claude-flow mcp tool test file_search --input '{"pattern":"*.js"}'
claude-flow mcp tool execute web_request --input '{"url":"https://httpbin.org/get","method":"GET"}'
```

2. **Check tool permissions:**
```bash
claude-flow mcp tool permissions file_search
claude-flow mcp security check --tool file_search
```

3. **Verify tool implementation:**
```bash
claude-flow mcp tool validate file_search --detailed
```

**Solutions:**

1. **Fix tool permissions:**
```json
{
  "mcp": {
    "security": {
      "authorization": {
        "defaultPolicy": "allow"
      }
    }
  }
}
```

2. **Disable sandboxing for debugging:**
```bash
claude-flow config set mcp.security.sandbox.enabled false
```

3. **Update tool timeout:**
```bash
claude-flow config set mcp.security.resourceLimits.toolExecutionTimeout 600000
```

## Performance Issues

### Issue: High Memory Usage

**Symptoms:**
- System becoming slow
- Out of memory errors
- Agent crashes

**Diagnostic Steps:**

1. **Monitor memory usage:**
```bash
# System memory
free -h
top -p $(pgrep claude-flow)

# Claude-Flow memory
claude-flow monitor --metrics memory --watch
claude-flow memory stats --detailed
```

2. **Identify memory leaks:**
```bash
# Generate heap dump
claude-flow diagnostics heap-dump ./heap-dump.json

# Analyze memory usage by component
claude-flow diagnostics memory-analysis --breakdown component
```

**Solutions:**

1. **Reduce memory usage:**
```bash
# Reduce cache sizes
claude-flow config set memory.cacheSizeMB 50
claude-flow config set terminal.poolSize 3

# Limit concurrent operations
claude-flow config set orchestrator.maxConcurrentAgents 5
claude-flow config set tasks.defaults.maxParallel 2
```

2. **Enable garbage collection:**
```bash
# Force garbage collection
claude-flow gc --force

# Enable automatic cleanup
claude-flow config set system.cleanup.enabled true
claude-flow config set system.cleanup.interval 300000
```

3. **Restart components:**
```bash
# Restart specific components
claude-flow restart --component memory
claude-flow restart --component terminal

# Full restart
claude-flow restart --full
```

### Issue: Slow Performance

**Symptoms:**
- Tasks taking too long
- UI responsiveness issues
- High CPU usage

**Diagnostic Steps:**

1. **Profile performance:**
```bash
claude-flow profile --duration 60 --output profile.json
claude-flow benchmark --run-all --export benchmark.json
```

2. **Analyze bottlenecks:**
```bash
claude-flow analyze performance --timeframe "last-hour"
claude-flow monitor --metrics cpu,latency,throughput
```

**Solutions:**

1. **Optimize configuration:**
```bash
# Use performance profile
claude-flow config load-profile performance

# Optimize database
claude-flow memory optimize --vacuum --reindex

# Optimize terminal pool
claude-flow terminal pool optimize
```

2. **Scale resources:**
```bash
# Increase worker processes
claude-flow config set orchestrator.workers 4

# Enable parallel processing
claude-flow config set tasks.defaults.parallel true

# Optimize task scheduling
claude-flow config set tasks.queue.strategy priority_round_robin
```

## Network and Connectivity Issues

### Issue: Cannot Connect to External Services

**Error Messages:**
```bash
Network timeout
Connection refused
DNS resolution failed
SSL certificate error
```

**Diagnostic Steps:**

1. **Test basic connectivity:**
```bash
ping google.com
curl -I https://api.openai.com
nslookup api.openai.com
```

2. **Check proxy settings:**
```bash
echo $HTTP_PROXY
echo $HTTPS_PROXY
echo $NO_PROXY
```

3. **Test SSL/TLS:**
```bash
openssl s_client -connect api.openai.com:443 -servername api.openai.com
```

**Solutions:**

1. **Configure proxy:**
```bash
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
export NO_PROXY=localhost,127.0.0.1
```

2. **Fix SSL issues:**
```bash
# Update certificates
sudo apt-get update && sudo apt-get install ca-certificates

# Skip SSL verification (not recommended for production)
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

3. **Use alternative endpoints:**
```json
{
  "memory": {
    "indexing": {
      "vectorSearch": {
        "embeddingService": {
          "provider": "local",
          "endpoint": "http://localhost:8080/embeddings"
        }
      }
    }
  }
}
```

## Data Corruption and Recovery

### Issue: Data Corruption

**Symptoms:**
- Inconsistent data
- Missing information
- Checksum failures

**Recovery Steps:**

1. **Stop all operations:**
```bash
claude-flow stop --graceful
```

2. **Backup current state:**
```bash
# Backup entire data directory
cp -r ./data ./data.backup.$(date +%Y%m%d_%H%M%S)

# Export what can be recovered
claude-flow memory export ./recovery/memory-backup.json --ignore-errors
```

3. **Assess damage:**
```bash
claude-flow diagnostics check-integrity --all
claude-flow memory verify --detailed
```

4. **Attempt repair:**
```bash
# Try automatic repair
claude-flow repair --auto --backup

# Manual repair
claude-flow memory repair --fix-corruption --rebuild-indexes
claude-flow terminal cleanup --fix-sessions
```

5. **Restore from backup if needed:**
```bash
# Restore from latest backup
claude-flow restore ./backups/latest-backup.tar.gz

# Or restore specific components
claude-flow memory restore ./backups/memory-backup.json
```

## Getting Additional Help

### Diagnostic Information Collection

Before seeking help, collect comprehensive diagnostic information:

```bash
# Generate full diagnostic report
claude-flow diagnostics generate-report \
  --include-logs \
  --include-config \
  --include-performance \
  --output claude-flow-diagnostics.zip

# System information
claude-flow diagnostics system-info > system-info.txt

# Configuration dump
claude-flow config export --format json > config-export.json
```

### Community Resources

1. **GitHub Issues**: [https://github.com/ruvnet/claude-code-flow/issues](https://github.com/ruvnet/claude-code-flow/issues)
2. **Discussions**: [https://github.com/ruvnet/claude-code-flow/discussions](https://github.com/ruvnet/claude-code-flow/discussions)
3. **Documentation**: [https://claude-flow.dev/docs](https://claude-flow.dev/docs)
4. **Discord**: Community chat for real-time help

### When Reporting Issues

Include the following information:

1. **Version information:**
```bash
claude-flow --version
node --version
deno --version  # if using Deno
```

2. **System information:**
```bash
uname -a
cat /etc/os-release  # Linux
sw_vers             # macOS
```

3. **Error logs:**
```bash
claude-flow logs --level error --tail 50
```

4. **Configuration (sanitized):**
```bash
claude-flow config show --sanitize
```

5. **Steps to reproduce the issue**

6. **Expected vs actual behavior**

This troubleshooting guide should help you resolve most common issues with Claude-Flow. For persistent problems, don't hesitate to reach out to the community for support.