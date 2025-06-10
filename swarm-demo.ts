#!/usr/bin/env -S deno run --allow-all
/**
 * Claude Swarm Mode Demo - Standalone script bypassing Cliffy issues
 */

import { colors } from 'https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts';
import { generateId } from './src/utils/helpers.ts';

const VERSION = "1.0.2";

// Parse command line arguments manually
function parseArgs(): { objective: string; options: any } {
  const args = Deno.args;
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    Deno.exit(0);
  }
  
  // Find where flags start
  let objectiveEndIndex = args.length;
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('-')) {
      objectiveEndIndex = i;
      break;
    }
  }
  
  const objective = args.slice(0, objectiveEndIndex).join(' ');
  
  if (!objective) {
    console.error(colors.red('Error: No objective provided'));
    showHelp();
    Deno.exit(1);
  }
  
  // Parse options
  const options: any = {
    strategy: 'auto',
    maxAgents: 5,
    maxDepth: 3,
    research: false,
    parallel: false,
    memoryNamespace: 'swarm',
    timeout: 60,
    review: false,
    coordinator: false,
    verbose: false,
    dryRun: false,
  };
  
  for (let i = objectiveEndIndex; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--strategy':
      case '-s':
        options.strategy = args[++i] || 'auto';
        break;
      case '--max-agents':
        options.maxAgents = parseInt(args[++i]) || 5;
        break;
      case '--max-depth':
        options.maxDepth = parseInt(args[++i]) || 3;
        break;
      case '--research':
        options.research = true;
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--memory-namespace':
        options.memoryNamespace = args[++i] || 'swarm';
        break;
      case '--timeout':
        options.timeout = parseInt(args[++i]) || 60;
        break;
      case '--review':
        options.review = true;
        break;
      case '--coordinator':
        options.coordinator = true;
        break;
      case '--config':
      case '-c':
        options.config = args[++i];
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
    }
  }
  
  return { objective, options };
}

function showHelp() {
  console.log(colors.bold('Claude-Flow Swarm Mode Demo'));
  console.log();
  console.log('Usage: ./swarm-demo.ts <objective> [options]');
  console.log();
  console.log('Options:');
  console.log('  -s, --strategy <s>        Orchestration strategy (auto, research, development, analysis)');
  console.log('  --max-agents <n>          Maximum number of agents (default: 5)');
  console.log('  --max-depth <n>           Maximum delegation depth (default: 3)');
  console.log('  --research                Enable research capabilities for all agents');
  console.log('  --parallel                Enable parallel execution');
  console.log('  --memory-namespace <ns>   Shared memory namespace (default: swarm)');
  console.log('  --timeout <minutes>       Swarm timeout in minutes (default: 60)');
  console.log('  --review                  Enable peer review between agents');
  console.log('  --coordinator             Spawn dedicated coordinator agent');
  console.log('  -c, --config <file>       MCP config file');
  console.log('  -v, --verbose             Enable verbose output');
  console.log('  -d, --dry-run             Preview swarm configuration');
  console.log();
  console.log('Examples:');
  console.log('  ./swarm-demo.ts "Build a REST API"');
  console.log('  ./swarm-demo.ts "Research cloud architecture" --strategy research --research');
  console.log('  ./swarm-demo.ts "Migrate app to microservices" --coordinator --review');
}

function buildOrchestrationPrompt(objective: string, options: any): string {
  const strategies = {
    auto: 'Automatically determine the best approach',
    research: 'Focus on research and information gathering',
    development: 'Focus on implementation and coding',
    analysis: 'Focus on analysis and insights'
  };
  
  return `
# Claude Swarm Orchestration Task

You are the Master Orchestrator for a Claude agent swarm. Your objective is to coordinate multiple specialized agents to achieve the following goal:

**OBJECTIVE**: ${objective}

## Orchestration Parameters:
- Strategy: ${strategies[options.strategy as keyof typeof strategies] || strategies.auto}
- Maximum Agents: ${options.maxAgents}
- Maximum Delegation Depth: ${options.maxDepth}
- Parallel Execution: ${options.parallel ? 'Enabled' : 'Disabled'}
- Peer Review: ${options.review ? 'Enabled' : 'Disabled'}
- Research Capabilities: ${options.research ? 'Enabled' : 'Disabled'}

## Your Responsibilities:

1. **Task Decomposition**: Break down the objective into subtasks
2. **Agent Spawning**: Create specialized agents for each subtask
3. **Resource Allocation**: Assign appropriate tools and permissions
4. **Coordination**: Manage dependencies and communication
5. **Quality Control**: ${options.review ? 'Implement peer review processes' : 'Monitor task quality'}
6. **Progress Tracking**: Monitor and report on swarm progress

## Available Agent Types:
- **Researcher**: Information gathering, web research, analysis
- **Developer**: Code implementation, testing, debugging
- **Analyst**: Data analysis, pattern recognition, insights
- **Reviewer**: Code review, quality assurance, validation
- **Coordinator**: Sub-task coordination, dependency management

## Swarm Execution Process:

1. Analyze the objective and create a detailed execution plan
2. Identify required agent types and their responsibilities
3. Spawn agents with appropriate configurations using:
   \`\`\`
   claude-flow agent spawn <type> --name "<name>" --task "<specific task>"
   \`\`\`
4. Create tasks and assign them to agents:
   \`\`\`
   claude-flow task create <type> "<description>" --assign-to <agent-id>
   \`\`\`
5. Monitor progress and adjust as needed
6. ${options.review ? 'Implement peer review cycles between agents' : 'Validate outputs'}
7. Synthesize results and report completion

## Memory Coordination:
All agents share the memory namespace: "${options.memoryNamespace}"
Use this for:
- Sharing discoveries and insights
- Avoiding duplicate work
- Building on each other's findings
- Maintaining context across the swarm

## Special Instructions:
${options.coordinator ? '- Spawn a dedicated coordinator agent for complex subtasks' : ''}
${options.research ? '- All agents should have research capabilities enabled' : ''}
${options.parallel ? '- Maximize parallel execution where dependencies allow' : ''}
${options.maxDepth > 1 ? `- Agents can delegate to sub-agents up to depth ${options.maxDepth}` : ''}

## Output Format:
Provide regular status updates in this format:
\`\`\`
[SWARM STATUS]
- Active Agents: X/Y
- Tasks Completed: X/Y
- Current Phase: <phase>
- Next Actions: <list>
\`\`\`

Begin by analyzing the objective and presenting your execution plan.
`;
}

function buildOrchestratorTools(options: any): string {
  const tools = [
    'View',
    'Edit',
    'Replace',
    'GlobTool',
    'GrepTool',
    'LS',
    'Bash',
    'dispatch_agent'
  ];
  
  if (options.research) {
    tools.push('WebFetchTool');
  }
  
  if (options.parallel) {
    tools.push('BatchTool');
  }
  
  return tools.join(',');
}

async function main() {
  const { objective, options } = parseArgs();
  
  const swarmId = generateId('swarm');
  
  if (options.dryRun) {
    console.log(colors.yellow('DRY RUN - Swarm Configuration:'));
    console.log(`Swarm ID: ${swarmId}`);
    console.log(`Objective: ${objective}`);
    console.log(`Strategy: ${options.strategy}`);
    console.log(`Max Agents: ${options.maxAgents}`);
    console.log(`Max Depth: ${options.maxDepth}`);
    console.log(`Research: ${options.research}`);
    console.log(`Parallel: ${options.parallel}`);
    console.log(`Review Mode: ${options.review}`);
    console.log(`Coordinator: ${options.coordinator}`);
    console.log(`Memory Namespace: ${options.memoryNamespace}`);
    console.log(`Timeout: ${options.timeout} minutes`);
    return;
  }
  
  console.log(colors.green(`🐝 Initializing Claude Swarm: ${swarmId}`));
  console.log(colors.cyan(`📋 Objective: ${objective}`));
  
  // Build the orchestration prompt
  const orchestrationPrompt = buildOrchestrationPrompt(objective, options);
  
  // Spawn the master orchestrator
  console.log(colors.blue('🎯 Spawning Master Orchestrator...'));
  
  const orchestratorTask = {
    id: `${swarmId}-orchestrator`,
    description: orchestrationPrompt,
    tools: buildOrchestratorTools(options),
    config: options.config,
    environment: {
      CLAUDE_SWARM_ID: swarmId,
      CLAUDE_SWARM_MODE: 'orchestrator',
      CLAUDE_SWARM_OBJECTIVE: objective,
      CLAUDE_SWARM_STRATEGY: options.strategy,
      CLAUDE_SWARM_MAX_AGENTS: options.maxAgents.toString(),
      CLAUDE_SWARM_MAX_DEPTH: options.maxDepth.toString(),
      CLAUDE_SWARM_MEMORY_NS: options.memoryNamespace,
    }
  };
  
  if (options.verbose) {
    console.log(colors.gray('Orchestrator configuration:'));
    console.log(JSON.stringify(orchestratorTask, null, 2));
  }
  
  // Check if Claude CLI is available
  try {
    const checkClaude = new Deno.Command('which', { args: ['claude'] });
    const checkResult = await checkClaude.output();
    
    if (!checkResult.success) {
      throw new Error('Claude CLI not found in PATH');
    }
  } catch (error) {
    console.error(colors.red('❌ Claude CLI not found!'));
    console.error(colors.yellow('Make sure Claude desktop app is installed and the claude command is available in your PATH'));
    console.error(colors.yellow('You can test with: which claude'));
    Deno.exit(1);
  }
  
  // Spawn the master orchestrator using Deno.Command
  try {
    // Build Claude command arguments
    const claudeArgs = [orchestrationPrompt];
    claudeArgs.push('--allowedTools', orchestratorTask.tools);
    
    if (orchestratorTask.config) {
      claudeArgs.push('--mcp-config', orchestratorTask.config);
    }
    
    if (options.verbose) {
      claudeArgs.push('--verbose');
    }
    
    // Show progress
    console.log(colors.gray('Launching orchestrator with Claude...'));
    
    // Create the command
    const command = new Deno.Command('claude', {
      args: claudeArgs,
      stdin: 'piped',
      stdout: 'inherit',
      stderr: 'inherit',
      env: {
        ...Deno.env.toObject(),
        ...orchestratorTask.environment,
      },
    });
    
    // Spawn the process
    const process = command.spawn();
    
    console.log(colors.green('✅ Master Orchestrator spawned successfully'));
    console.log(colors.blue('🚀 Swarm is now active and self-orchestrating...'));
    
    // Set up timeout if specified
    let timeoutId: number | undefined;
    if (options.timeout > 0) {
      timeoutId = setTimeout(() => {
        console.log(colors.yellow(`\n⏰ Swarm timeout reached (${options.timeout} minutes)`));
        process.kill("SIGTERM");
      }, options.timeout * 60 * 1000);
    }
    
    // Wait for the orchestrator to complete
    const status = await process.status;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (status.success) {
      console.log(colors.green(`\n✅ Swarm ${swarmId} completed successfully`));
    } else {
      console.log(colors.red(`\n❌ Swarm ${swarmId} exited with code ${status.code}`));
    }
    
  } catch (error) {
    console.error(colors.red('❌ Failed to spawn orchestrator:'), (error as Error).message);
    console.error(colors.yellow('Make sure Claude CLI is installed and available in your PATH'));
  }
}

// Run the demo
if (import.meta.main) {
  await main();
}