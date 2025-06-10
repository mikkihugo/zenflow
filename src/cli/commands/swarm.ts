/**
 * Claude Swarm Mode - Self-orchestrating agent swarms
 */

import { generateId } from '../../utils/helpers.ts';
import { success, error, warning, info } from "../cli-core.ts";
import type { CommandContext } from "../cli-core.ts";

export async function swarmAction(ctx: CommandContext) {
  // Get the objective from args
  const objective = ctx.args.join(' ');
  
  if (!objective) {
    error("Usage: swarm <objective>");
    console.log("\nExamples:");
    console.log('  claude-flow swarm "Build a REST API"');
    console.log('  claude-flow swarm "Research cloud architecture" --strategy research --research');
    return;
  }
  
  const options = {
    strategy: ctx.flags.strategy as string || 'auto',
    maxAgents: ctx.flags.maxAgents as number || ctx.flags['max-agents'] as number || 5,
    maxDepth: ctx.flags.maxDepth as number || ctx.flags['max-depth'] as number || 3,
    research: ctx.flags.research as boolean || false,
    parallel: ctx.flags.parallel as boolean || false,
    memoryNamespace: ctx.flags.memoryNamespace as string || ctx.flags['memory-namespace'] as string || 'swarm',
    timeout: ctx.flags.timeout as number || 60,
    review: ctx.flags.review as boolean || false,
    coordinator: ctx.flags.coordinator as boolean || false,
    config: ctx.flags.config as string || ctx.flags.c as string,
    verbose: ctx.flags.verbose as boolean || ctx.flags.v as boolean || false,
    dryRun: ctx.flags.dryRun as boolean || ctx.flags['dry-run'] as boolean || ctx.flags.d as boolean || false,
  };
  
  const swarmId = generateId('swarm');
  
  if (options.dryRun) {
    warning('DRY RUN - Swarm Configuration:');
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
  
  success(`🐝 Initializing Claude Swarm: ${swarmId}`);
  console.log(`📋 Objective: ${objective}`);
  
  // Build the orchestration prompt
  const orchestrationPrompt = buildOrchestrationPrompt(objective, options);
  
  // Spawn the master orchestrator
  info('🎯 Spawning Master Orchestrator...');
  
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
    console.log('Orchestrator configuration:');
    console.log(JSON.stringify(orchestratorTask, null, 2));
  }
  
  // Check if Claude CLI is available
  try {
    const checkClaude = new Deno.Command('which', { args: ['claude'] });
    const checkResult = await checkClaude.output();
    
    if (!checkResult.success) {
      throw new Error('Claude CLI not found in PATH');
    }
  } catch (err) {
    error('Claude CLI not found!');
    console.log('Make sure Claude desktop app is installed and the claude command is available in your PATH');
    console.log('You can test with: which claude');
    return;
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
    console.log('Launching orchestrator with Claude...');
    
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
    
    success('✅ Master Orchestrator spawned successfully');
    info('🚀 Swarm is now active and self-orchestrating...');
    
    // Set up timeout if specified
    let timeoutId: number | undefined;
    if (options.timeout > 0) {
      timeoutId = setTimeout(() => {
        warning(`⏰ Swarm timeout reached (${options.timeout} minutes)`);
        process.kill("SIGTERM");
      }, options.timeout * 60 * 1000);
    }
    
    // Wait for the orchestrator to complete
    const status = await process.status;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (status.success) {
      success(`✅ Swarm ${swarmId} completed successfully`);
    } else {
      error(`Swarm ${swarmId} exited with code ${status.code}`);
    }
    
  } catch (err) {
    error(`Failed to spawn orchestrator: ${(err as Error).message}`);
    console.log('Make sure Claude CLI is installed and available in your PATH');
  }
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