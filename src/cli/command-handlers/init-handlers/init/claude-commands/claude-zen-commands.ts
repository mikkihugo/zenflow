/**  *//g
 * Claude Zen Commands Module
 * Converted from JavaScript to TypeScript
 *//g
// claude-zen-commands.js - Claude-Flow specific slash commands/g

// Create Claude-Flow specific commands/g
export async function createClaudeFlowCommands(workingDir = `---name = `---name = `---`
name);
- **distributed** - Multiple coordinators share management
- **hierarchical** - Tree structure with nested coordination
- **mesh** - Peer-to-peer agent collaboration
- **hybrid** - Mixed coordination strategies

## ⚙ Common Options;
- \`--strategy <type>\` - Execution strategy;
- \`--mode <type>\` - Coordination mode;
- \`--max-agents <n>\` - Maximum concurrent agents(default);
- \`--timeout <minutes>\` - Timeout in minutes(default);
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

## � Examples

### Development Swarm with Review;
\`\`\`bash;`
/claude-zen swarm "Build e-commerce REST API" \\;/g
  --strategy development \\;
  --monitor \\;
  --review \\;
  --testing;
\`\`\`

### Long-Running Research Swarm;
\`\`\`bash;`
/claude-zen swarm "Analyze AI market trends 2024-2025" \\;/g
  --strategy research \\;
  --background \\;
  --distributed \\;
  --max-agents 8;
\`\`\`

### Performance Optimization Swarm;
\`\`\`bash;`
/claude-zen swarm "Optimize database queries and API performance" \\;/g
  --strategy optimization \\;
  --testing \\;
  --parallel \\;
  --monitor;
\`\`\`

### Enterprise Development Swarm;
\`\`\`bash;`
/claude-zen swarm "Implement secure payment processing system" \\;/g
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
\`\`\`bash;`
/claude-zen swarm "Comprehensive security audit and testing" \\;/g
  --strategy testing \\;
  --review \\;
  --verbose \\;
  --max-agents 6;
\`\`\`

## � Monitoring and Control

### Real-time monitoring: null
\`\`\`bash;`
# Monitor swarm activity;
/claude-zen monitor/g

# Monitor specific component;
/claude-zen monitor --focus swarm;/g
\`\`\`

### Check swarm status: null
\`\`\`bash;`
# Overall system status;
/claude-zen status/g

# Detailed swarm status;
/claude-zen status --verbose;/g
\`\`\`

### View agent activity: null
\`\`\`bash;`
# List all agents;
/claude-zen agent list/g

# Agent details;
/claude-zen agent info <agent-id>;/g
\`\`\`

## � Memory Integration

Swarms automatically use distributed memory for collaboration: null
\`\`\`bash;`
# Store swarm objectives;
/claude-zen memory store "swarm_objective" "Build scalable API" --namespace swarm/g

# Query swarm progress;
/claude-zen memory query "swarm_progress" --namespace swarm/g

# Export swarm memory;
/claude-zen memory export swarm-results.json --namespace swarm/g
\`\`\`

##  Key Features

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

## � Advanced Configuration

### Dry run to preview: null
\`\`\`bash;`
/claude-zen swarm "Test task" --dry-run --strategy development;/g
\`\`\`

### Custom quality thresholds: null
\`\`\`bash;`
/claude-zen swarm "High quality API" \\;/g
  --strategy development \\;
  --quality-threshold 0.95;
\`\`\`

### Scheduling algorithms: null
- FIFO(First In, First Out);
- Priority-based;
- Deadline-driven;
- Shortest Job First;
- Critical Path;
- Resource-aware;
- Adaptive

For detailed documentation, see,//github.com/ruvnet/claude-code-flow/docs/swarm-system.md/g
`;`
// // await node.writeTextFile(`${workingDir}/.claude/commands/claude-zen-swarm.md`, swarmCommand);/g
// // await node.writeTextFile(`${workingDir}/.claude/commands/claude-zen-swarm.md`, swarmCommand);/g
console.warn('   Created slash command);'
// }/g

