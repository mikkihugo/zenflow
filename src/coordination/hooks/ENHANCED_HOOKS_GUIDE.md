# Enhanced Hooks System - Documentation

## Overview

The Enhanced Hooks System for Claude Code Zen provides comprehensive safety validation, auto-agent assignment, performance tracking, and context loading capabilities. This system extends the existing template-based hooks with intelligent automation and safety features.

## Features

### 🛡️ Safety Validation
- **Dangerous Command Detection**: Automatically identifies and blocks potentially harmful bash commands
- **File Operation Validation**: Validates file access permissions and detects suspicious operations
- **Risk Assessment**: Provides detailed risk analysis with severity levels (LOW, MEDIUM, HIGH, CRITICAL)
- **Safer Alternatives**: Suggests safer command alternatives when risks are detected

### 🤖 Auto-Agent Assignment
- **Intelligent Selection**: Automatically assigns optimal agents based on file types and operation requirements
- **147+ Agent Types**: Leverages the full spectrum of available agent types in Claude Code Zen
- **Workload Balancing**: Considers current agent workload and availability
- **Confidence Scoring**: Provides confidence metrics for assignment decisions

### 📊 Performance Tracking
- **Real-time Monitoring**: Tracks operation performance in real-time
- **Resource Usage Analysis**: Monitors memory, CPU, disk, and network usage
- **Trend Analysis**: Identifies performance trends over time
- **Optimization Suggestions**: Provides actionable recommendations for improvement

### 🎯 Context Loading
- **Session Continuity**: Loads relevant context from previous sessions
- **Environment Preparation**: Prepares optimal environment for operations
- **Memory Restoration**: Restores agent memory and learning data
- **Project Context**: Analyzes project structure and dependencies

### 🎨 Auto-Formatting
- **Multi-Language Support**: Supports TypeScript, JavaScript, Python, Rust, Go, and more
- **Intelligent Detection**: Automatically detects file types and suggests appropriate formatters
- **Quality Assurance**: Ensures consistent code formatting across projects

## Architecture

### Core Components

```
src/coordination/hooks/
├── enhanced-hook-system.ts     # Core interfaces and types
├── enhanced-hook-manager.ts    # Central hook coordinator
├── safety-validator.ts         # Safety validation implementation
├── auto-agent-assignment.ts    # Intelligent agent assignment
├── performance-tracker.ts      # Performance monitoring and optimization
└── index.ts                   # Main exports
```

### Template Scripts

```
templates/claude-zen/hooks/enhanced/
├── safety-validation.sh        # Bash safety validation script
├── auto-agent-assignment.sh    # Agent assignment script
└── performance-tracker.sh      # Performance tracking script
```

## Usage

### TypeScript API Usage

```typescript
import { createEnhancedHookManager, HookContext } from 'claude-code-zen/coordination/hooks';

// Create enhanced hook manager
const hookManager = createEnhancedHookManager();

// Create hook context
const context: HookContext = {
  operation: {
    id: 'op-123',
    type: 'edit',
    description: 'Update React component',
    filePath: 'src/components/Button.tsx',
    parameters: {},
    metadata: {}
  },
  tool: {
    name: 'Edit',
    version: '1.0.0',
    input: { file_path: 'src/components/Button.tsx' }
  },
  environment: {
    workingDirectory: '/project',
    nodeVersion: 'v20.0.0',
    platform: 'linux',
    availableMemory: 8192,
    cpuUsage: 25
  },
  session: {
    id: 'session-456',
    startTime: new Date(),
    context: {},
    history: []
  },
  timestamp: new Date()
};

// Execute pre-tool hooks
const preResults = await hookManager.executeHooks('PreToolUse', context);

// Check if operation is allowed
const isAllowed = preResults.every(result => result.allowed);

if (isAllowed) {
  // Proceed with operation
  console.log('Operation approved by safety validation');
  
  // Get agent assignment
  const assignmentResult = preResults.find(r => r.data?.agentAssignment);
  if (assignmentResult) {
    console.log('Assigned agent:', assignmentResult.data.agentAssignment.agent.name);
  }
} else {
  // Operation blocked
  const errors = preResults.flatMap(r => r.errors);
  console.error('Operation blocked:', errors);
}

// Execute post-tool hooks for performance tracking
const postResults = await hookManager.executeHooks('PostToolUse', context);
```

### Shell Script Usage

```bash
# Safety validation
echo '{"tool_name":"Bash","tool_input":{"command":"rm file.txt","operation_type":"delete"}}' | \
  ./templates/claude-zen/hooks/enhanced/safety-validation.sh

# Agent assignment
echo '{"tool_name":"Edit","tool_input":{"file_path":"src/app.ts","operation_type":"edit"}}' | \
  ./templates/claude-zen/hooks/enhanced/auto-agent-assignment.sh

# Performance tracking
echo '{"tool_name":"Test","tool_input":{"operation_id":"test-123","start_time":"2024-01-01T10:00:00Z","end_time":"2024-01-01T10:00:05Z","success":"true"}}' | \
  ./templates/claude-zen/hooks/enhanced/performance-tracker.sh
```

## Configuration

### Environment Variables

```bash
# Enable debug logging
export CLAUDE_HOOKS_DEBUG=true

# Set custom log directory
export CLAUDE_HOOKS_LOG_DIR="$HOME/.claude/custom-hooks"

# Configure performance thresholds
export CLAUDE_HOOKS_MAX_DURATION=30000
export CLAUDE_HOOKS_MAX_MEMORY=512
```

### Hook Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash|Command|Shell",
        "hooks": [{
          "type": "command",
          "command": "bash ./templates/claude-zen/hooks/enhanced/safety-validation.sh"
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [{
          "type": "command",
          "command": "bash ./templates/claude-zen/hooks/enhanced/performance-tracker.sh"
        }]
      }
    ]
  }
}
```

## Safety Features

### Dangerous Command Patterns

The system automatically detects and blocks:

- **Destructive Operations**: `rm -rf /`, mass deletions
- **Device Access**: Writing to `/dev/` files
- **Remote Execution**: `curl ... | sh` patterns
- **Dynamic Evaluation**: `eval $(...)` constructs
- **Permission Abuse**: `chmod 777`, overly permissive settings
- **Privilege Escalation**: Dangerous `sudo` usage
- **Fork Bombs**: `:(){ :|:& };:` patterns
- **Disk Flooding**: Dangerous `dd` operations

### Risk Levels

- **CRITICAL**: Operation is blocked completely
- **HIGH**: Operation requires explicit confirmation
- **MEDIUM**: Operation proceeds with warnings
- **LOW**: Operation is considered safe

## Agent Assignment Logic

### File Type Mappings

- **TypeScript/JavaScript**: Frontend Developer, Full-Stack Developer
- **Python**: AI/ML Specialist, Python Developer
- **Rust**: Systems Specialist, Performance Expert
- **Go**: Backend Developer, API Specialist
- **Java**: Enterprise Developer
- **C++**: Systems Specialist, Performance Expert
- **Markdown**: Technical Writer, Documentation Specialist
- **SQL**: Database Architect, Analytics Specialist

### Operation Classifications

- **Testing**: Unit Tester, Integration Tester, E2E Tester
- **Documentation**: Technical Writer, Documentation Specialist
- **Security**: Security Analyst, Security Architect
- **Performance**: Performance Analyzer, Optimization Expert
- **Deployment**: DevOps Engineer, Infrastructure Specialist

## Performance Metrics

### Tracked Metrics

- **Execution Time**: Operation duration in milliseconds
- **Resource Usage**: Memory, CPU, disk I/O, network I/O
- **Success Rate**: Percentage of successful operations
- **Quality Score**: Composite quality metric (0.0 - 1.0)
- **User Satisfaction**: Estimated user satisfaction score

### Performance Thresholds

- **Max Execution Time**: 30 seconds (configurable)
- **Max Memory Usage**: 512 MB (configurable)
- **Max CPU Usage**: 80% (configurable)
- **Min Success Rate**: 95% (configurable)

### Optimization Suggestions

- **Slow Operations**: Break into smaller chunks, implement caching
- **High Memory Usage**: Use streaming processing, optimize algorithms
- **High CPU Usage**: Optimize computational complexity
- **Frequent Failures**: Improve error handling, add retry logic

## Monitoring and Logging

### Log Files

```
~/.claude/enhanced-hooks/
├── safety-validation.log      # Safety validation events
├── agent-assignment.log       # Agent assignment decisions
├── performance-tracker.log    # Performance tracking events
├── metrics/                   # Daily metrics files
│   └── 2024-01-01.jsonl
├── alerts/                    # Performance alerts
│   └── performance-alert-*.json
├── running-stats.json         # Aggregate statistics
└── trend-analysis.json        # Performance trends
```

### Monitoring Dashboard

The system generates performance reports and trend analysis:

```bash
# View current statistics
cat ~/.claude/enhanced-hooks/running-stats.json | jq '.'

# View recent performance trends
cat ~/.claude/enhanced-hooks/trend-analysis.json | jq '.trend_data'

# Check for performance alerts
ls ~/.claude/enhanced-hooks/alerts/
```

## Integration with Existing Systems

### Template Hook Integration

The enhanced hooks work alongside existing template hooks:

```bash
# Existing hooks continue to work
./templates/claude-zen/hooks/pre-task-coordination.sh
./templates/claude-zen/hooks/post-edit-optimization.sh

# Enhanced hooks add new capabilities
./templates/claude-zen/hooks/enhanced/safety-validation.sh
./templates/claude-zen/hooks/enhanced/auto-agent-assignment.sh
./templates/claude-zen/hooks/enhanced/performance-tracker.sh
```

### MCP Integration

The hooks integrate with MCP (Model Context Protocol) servers:

```typescript
// HTTP MCP Server (port 3000)
const mcpServer = new HTTPMCPServer({
  hooks: {
    preToolUse: [safetyValidator, agentAssignor],
    postToolUse: [performanceTracker, autoFormatter]
  }
});

// Stdio MCP Server  
const stdioServer = new StdioMCPServer({
  tools: {
    'enhanced-hooks': new EnhancedHooksToolRegistry()
  }
});
```

## Testing

### Unit Tests

```bash
# Run enhanced hooks system tests
npm test src/__tests__/unit/london/coordination/hooks/

# Run specific test suite
npm test enhanced-hook-system.test.ts
```

### Integration Tests

```bash
# Test hook scripts directly
./test-enhanced-hooks.sh

# Test with sample operations
echo '{"tool_name":"Edit","tool_input":{"file_path":"test.ts"}}' | \
  ./templates/claude-zen/hooks/enhanced/auto-agent-assignment.sh
```

### Performance Tests

```bash
# Benchmark hook execution
time echo '{"tool_name":"Test"}' | ./templates/claude-zen/hooks/enhanced/safety-validation.sh

# Load test with multiple operations
for i in {1..100}; do
  echo '{"tool_name":"Edit","tool_input":{"operation_id":"load-test-'$i'"}}' | \
    ./templates/claude-zen/hooks/enhanced/performance-tracker.sh &
done
wait
```

## Migration Guide

### From Basic to Enhanced Hooks

1. **Install Enhanced Hooks**:
   ```bash
   # Scripts are automatically available in templates/claude-zen/hooks/enhanced/
   chmod +x templates/claude-zen/hooks/enhanced/*.sh
   ```

2. **Update Hook Configuration**:
   ```json
   {
     "hooks": {
       "PreToolUse": [
         {"matcher": "Bash", "hooks": [{"type": "command", "command": "bash ./templates/claude-zen/hooks/enhanced/safety-validation.sh"}]},
         {"matcher": ".*", "hooks": [{"type": "command", "command": "bash ./templates/claude-zen/hooks/enhanced/auto-agent-assignment.sh"}]}
       ],
       "PostToolUse": [
         {"matcher": "Edit|Write", "hooks": [{"type": "command", "command": "bash ./templates/claude-zen/hooks/enhanced/performance-tracker.sh"}]}
       ]
     }
   }
   ```

3. **Verify Installation**:
   ```bash
   ./test-enhanced-hooks.sh
   ```

### Backward Compatibility

Enhanced hooks are fully backward compatible with existing template hooks. You can:

- Use both systems simultaneously
- Gradually migrate from basic to enhanced hooks
- Customize which enhanced features to enable

## Troubleshooting

### Common Issues

1. **Permission Denied**:
   ```bash
   chmod +x templates/claude-zen/hooks/enhanced/*.sh
   ```

2. **Missing Dependencies**:
   ```bash
   # Ensure jq is installed
   sudo apt-get install jq  # Ubuntu/Debian
   brew install jq          # macOS
   ```

3. **Log Directory Issues**:
   ```bash
   mkdir -p ~/.claude/enhanced-hooks
   ```

### Debug Mode

Enable debug logging:

```bash
export CLAUDE_HOOKS_DEBUG=true
./templates/claude-zen/hooks/enhanced/safety-validation.sh
```

### Performance Issues

If hooks are slow:

1. Check system resources
2. Review log file sizes
3. Consider reducing history retention
4. Optimize hook script logic

## Support

For issues, feature requests, or contributions:

- **GitHub Issues**: [claude-code-zen/issues](https://github.com/mikkihugo/claude-code-zen/issues)
- **Documentation**: [Enhanced Hooks Guide](./ENHANCED_HOOKS_GUIDE.md)
- **Examples**: [hooks-examples/](./examples/)

## Future Enhancements

Planned features for future releases:

- **Machine Learning Integration**: AI-powered risk assessment
- **Advanced Analytics**: Predictive performance modeling
- **Custom Hook Plugins**: User-defined hook extensions
- **Real-time Dashboards**: Web-based monitoring interface
- **Integration APIs**: RESTful APIs for external integration
- **Cloud Synchronization**: Cross-device hook configuration sync