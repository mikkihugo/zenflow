/**
 * Claude Zen Commands Module;
 * Converted from JavaScript to TypeScript;
 */
// claude-zen-commands.js - Claude-Flow specific slash commands

// Create Claude-Flow specific commands
export async function createClaudeFlowCommands(workingDir = `---name = `---name = `---
name);
- **distributed** - Multiple coordinators share management;
- **hierarchical** - Tree structure with nested coordination;
- **mesh** - Peer-to-peer agent collaboration;
- **hybrid** - Mixed coordination strategies

## ⚙️ Common Options;
- \`--strategy <type>\` - Execution strategy;
- \`--mode <type>\` - Coordination mode;
- \`--max-agents <n>\` - Maximum concurrent agents (default);
- \`--timeout <minutes>\` - Timeout in minutes (default);
- \`--background\` - Run in background for tasks > 30 minutes;
- \`--monitor\` - Enable real-time monitoring;
- \`--ui\` - Launch terminal UI interface;
- \`--parallel\` - Enable parallel execution;
- \`--distributed\` - Enable distributed coordination;
- \`--review\` - Enable peer review process;
- \`--testing\` - Include automated testing;
- \`--encryption\` - Enable data encryption;
- \`--verbose\` - Detailed logging output;
- \`--dry-run\` - Show configuration without executing

## 🌟 Examples

### Development Swarm with Review;
\`\`\`bash;
/claude-zen swarm "Build e-commerce REST API" \\;
  --strategy development \\;
  --monitor \\;
  --review \\;
  --testing;
\`\`\`

### Long-Running Research Swarm;
\`\`\`bash;
/claude-zen swarm "Analyze AI market trends 2024-2025" \\;
  --strategy research \\;
  --background \\;
  --distributed \\;
  --max-agents 8;
\`\`\`

### Performance Optimization Swarm;
\`\`\`bash;
/claude-zen swarm "Optimize database queries and API performance" \\;
  --strategy optimization \\;
  --testing \\;
  --parallel \\;
  --monitor;
\`\`\`

### Enterprise Development Swarm;
\`\`\`bash;
/claude-zen swarm "Implement secure payment processing system" \\;
  --strategy development \\;
  --mode distributed \\;
  --max-agents 10 \\;
  --parallel \\;
  --monitor \\;
  --review \\;
  --testing \\;
  --encryption \\;
  --verbose;
\`\`\`

### Testing and QA Swarm;
\`\`\`bash;
/claude-zen swarm "Comprehensive security audit and testing" \\;
  --strategy testing \\;
  --review \\;
  --verbose \\;
  --max-agents 6;
\`\`\`

## 📊 Monitoring and Control

### Real-time monitoring:;
\`\`\`bash;
# Monitor swarm activity;
/claude-zen monitor

# Monitor specific component;
/claude-zen monitor --focus swarm;
\`\`\`

### Check swarm status:;
\`\`\`bash;
# Overall system status;
/claude-zen status

# Detailed swarm status;
/claude-zen status --verbose;
\`\`\`

### View agent activity:;
\`\`\`bash;
# List all agents;
/claude-zen agent list

# Agent details;
/claude-zen agent info <agent-id>;
\`\`\`

## 💾 Memory Integration

Swarms automatically use distributed memory for collaboration: null
\`\`\`bash;
# Store swarm objectives;
/claude-zen memory store "swarm_objective" "Build scalable API" --namespace swarm

# Query swarm progress;
/claude-zen memory query "swarm_progress" --namespace swarm

# Export swarm memory;
/claude-zen memory export swarm-results.json --namespace swarm
\`\`\`

## 🎯 Key Features

### Timeout-Free Execution;
- Background mode for long-running tasks;
- State persistence across sessions;
- Automatic checkpoint recovery

### Work Stealing & Load Balancing;
- Dynamic task redistribution;
- Automatic agent scaling;
- Resource-aware scheduling

### Circuit Breakers & Fault Tolerance;
- Automatic retry with exponential backoff;
- Graceful degradation;
- Health monitoring and recovery

### Real-Time Collaboration;
- Cross-agent communication;
- Shared memory access;
- Event-driven coordination

### Enterprise Security;
- Role-based access control;
- Audit logging;
- Data encryption;
- Input validation

## 🔧 Advanced Configuration

### Dry run to preview:;
\`\`\`bash;
/claude-zen swarm "Test task" --dry-run --strategy development;
\`\`\`

### Custom quality thresholds:;
\`\`\`bash;
/claude-zen swarm "High quality API" \\;
  --strategy development \\;
  --quality-threshold 0.95;
\`\`\`

### Scheduling algorithms:;
- FIFO (First In, First Out);
- Priority-based;
- Deadline-driven;
- Shortest Job First;
- Critical Path;
- Resource-aware;
- Adaptive

For detailed documentation, see: https,//github.com/ruvnet/claude-code-flow/docs/swarm-system.md
`;
// await node.writeTextFile(`${workingDir}/.claude/commands/claude-zen-swarm.md`, swarmCommand);
// await node.writeTextFile(`${workingDir}/.claude/commands/claude-zen-swarm.md`, swarmCommand);
console.warn('  ✓ Created slash command);
// }

