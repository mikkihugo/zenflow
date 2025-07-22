// claude-command.js - Handles the claude command

import { printSuccess, printError, printWarning } from '../utils.js';
import { spawn } from 'child_process';

export async function claudeCommand(args, flags) {
  const claudeCmd = args[0];
      switch (claudeCmd) {
        case 'spawn':
          // Extract task description and flags
          let taskEndIndex = args.length;
          for (let i = 1; i < args.length; i++) {
            if (args[i].startsWith('-')) {
              taskEndIndex = i;
              break;
            }
          }

          const task = args.slice(1, taskEndIndex).join(' ');
          if (!task) {
            printError('Usage: claude spawn <task description> [options]');
            break;
          }

          // Parse flags
          const parsedFlags = {};
          for (let i = taskEndIndex; i < args.length; i++) {
            const arg = args[i];
            if (arg === '--tools' || arg === '-t') {
              parsedFlags.tools = args[++i];
            } else if (arg === '--no-permissions') {
              parsedFlags.noPermissions = true;
            } else if (arg === '--config' || arg === '-c') {
              parsedFlags.config = args[++i];
            } else if (arg === '--mode' || arg === '-m') {
              parsedFlags.mode = args[++i];
            } else if (arg === '--parallel') {
              parsedFlags.parallel = true;
            } else if (arg === '--research') {
              parsedFlags.research = true;
            } else if (arg === '--coverage') {
              parsedFlags.coverage = parseInt(args[++i]);
            } else if (arg === '--commit') {
              parsedFlags.commit = args[++i];
            } else if (arg === '--verbose' || arg === '-v') {
              parsedFlags.verbose = true;
            } else if (arg === '--dry-run' || arg === '-d') {
              parsedFlags.dryRun = true;
            }
          }

          // Build tools list
          let tools = parsedFlags.tools || 'View,Edit,Replace,GlobTool,GrepTool,LS,Bash';
          if (parsedFlags.parallel) {
            tools += ',BatchTool,dispatch_agent';
          }
          if (parsedFlags.research) {
            tools += ',WebFetchTool';
          }

          const instanceId = `claude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          if (parsedFlags.dryRun) {
            printWarning('DRY RUN - Would execute:');
            console.log(`Command: claude "<enhanced task with guidance>" --allowedTools ${tools}`);
            console.log(`Instance ID: ${instanceId}`);
            console.log(`Task: ${task}`);
            console.log(`Tools: ${tools}`);
            console.log(`Mode: ${parsedFlags.mode || 'full'}`);
            console.log(`Coverage: ${parsedFlags.coverage || 80}%`);
            console.log(`Commit: ${parsedFlags.commit || 'phase'}`);
            console.log(`\nEnhanced Features:`);
            console.log(`  - Memory Bank enabled via: npx claude-zen memory commands`);
            console.log(`  - Coordination ${parsedFlags.parallel ? 'enabled' : 'disabled'}`);
            console.log(`  - Access Claude-Flow features through Bash tool`);
          } else {
            printSuccess(`Spawning Claude instance: ${instanceId}`);
            console.log(`📝 Original Task: ${task}`);
            console.log(`🔧 Tools: ${tools}`);
            console.log(`⚙️  Mode: ${parsedFlags.mode || 'full'}`);
            console.log(`📊 Coverage: ${parsedFlags.coverage || 80}%`);
            console.log(`💾 Commit: ${parsedFlags.commit || 'phase'}`);
            console.log(`✨ Enhanced with Claude-Flow guidance for memory and coordination`);
            console.log('');
            console.log('📋 Task will be enhanced with:');
            console.log('  - Memory Bank instructions (store/retrieve)');
            console.log('  - Coordination capabilities (swarm management)');
            console.log('  - Best practices for multi-agent workflows');
            console.log('');

            // Build the actual claude command with enhanced guidance
            let enhancedTask = `# Task Assignment\n\n## Your Primary Task\n${task}\n\n## Development Environment\n\nYou are working in a development environment with advanced orchestration capabilities available if needed.\n\n### Project Context\n- Working Directory: ${process.cwd()}\n- Instance ID: ${instanceId}\n- Development Mode: ${parsedFlags.mode || 'full'}\n${parsedFlags.coverage ? `- Test Coverage Target: ${parsedFlags.coverage}%` : ''}\n${parsedFlags.commit ? `- Git Commit Strategy: ${parsedFlags.commit}` : ''}\n${parsedFlags.config ? `- MCP Config: ${parsedFlags.config}` : ''}\n\n### Available Tools\n- You have access to these tools: ${tools}\n${parsedFlags.tools ? `- Custom tools specified: ${parsedFlags.tools}` : ''}\n\n### Optional Orchestration Features\n\nIf this task requires complex coordination, memory persistence, or multi-agent collaboration, you can use the claude-zen system:\n\n1. **Persistent Memory** (if needed for your task)\n   - Store project data: \`npx claude-zen memory store <key> "<value>"\`\n   - Retrieve stored data: \`npx claude-zen memory query <key>\`\n   - Export/Import memory: \`npx claude-zen memory export/import <file>\`\n\n2. **Task Coordination** (if working on complex multi-part tasks)\n   - Check task status: \`npx claude-zen status\`\n   - Monitor progress: \`npx claude-zen monitor\`\n   - List active tasks: \`npx claude-zen task list\`\n\n3. **Multi-Agent Collaboration** (if task benefits from parallelization)\n   - Spawn specialized agents: \`npx claude-zen agent spawn <type> --name <name>\`\n   - Create subtasks: \`npx claude-zen task create <type> "<description>"\`\n   - Coordinate work: \`npx claude-zen task assign <task-id> <agent-id>\``;

            if (parsedFlags.parallel) {
              enhancedTask += `\n\n   **Parallel Execution Enabled**: The orchestration system can help coordinate parallel work if needed.`;
            }

            if (parsedFlags.research) {
              enhancedTask += `\n\n   **Research Mode**: Web research tools are available for information gathering.`;
            }

            enhancedTask += `\n\n### Task Execution Guidelines\n\n1. **Focus on Your Primary Objective**:\n   - Understand the specific requirements of the task\n   - Plan your approach based on the project's needs\n   - Use appropriate tools and practices for the technology stack\n   ${parsedFlags.mode === 'backend-only' ? '   - Focus on backend implementation' : ''}\n   ${parsedFlags.mode === 'frontend-only' ? '   - Focus on frontend implementation' : ''}\n   ${parsedFlags.mode === 'api-only' ? '   - Focus on API design and implementation' : ''}\n\n2. **Development Best Practices**:\n   - Write clean, maintainable code following project conventions\n   - Include appropriate tests and documentation\n   - Use version control effectively\n   ${parsedFlags.coverage ? `   - Ensure test coverage meets ${parsedFlags.coverage}% target` : ''}\n   ${parsedFlags.commit === 'phase' ? '   - Commit changes after completing major phases' : ''}\n   ${parsedFlags.commit === 'feature' ? '   - Commit changes after each feature is complete' : ''}\n   ${parsedFlags.commit === 'manual' ? '   - Only commit when explicitly requested' : ''}\n\n3. **Leverage Orchestration When Beneficial**:\n   - For complex tasks requiring persistent state, use the memory bank\n   - For multi-part projects, use task coordination features\n   - For parallelizable work, consider multi-agent approaches\n   ${parsedFlags.parallel ? '   - Parallel capabilities are enabled for this task' : ''}\n   ${parsedFlags.research ? '   - Research tools are available if needed' : ''}\n   ${parsedFlags.noPermissions ? '   - Running with --no-permissions mode' : ''}\n   ${parsedFlags.verbose ? '   - Verbose mode enabled for detailed output' : ''}\n\n## Getting Started\n\nBegin working on your task. The orchestration features are available as tools to help you be more effective, but your primary focus should be on delivering the requested functionality.\n\n### Quick Reference (if using orchestration features)\n\n\`\`\`bash\n# Example: Storing project-specific data\nBash(\"npx claude-zen memory store project_config '{\\\"name\\\": \\\"my-app\\\", \\\"version\\\": \\\"1.0.0\\\"}'\")\n\n# Example: Checking for previous work\nBash(\"npx claude-zen memory query previous_implementation\")\n\n# Example: Creating subtasks for complex projects\nBash(\"npx claude-zen task create frontend 'Build React components'\")\nBash(\"npx claude-zen task create backend 'Implement API endpoints'\")\n\`\`\`\n\nRemember: These are optional tools. Use them when they add value to your development process.\n\n## Development Mode: ${parsedFlags.mode || 'full'}\n${parsedFlags.mode === 'backend-only' ? `Focus on server-side implementation, APIs, and business logic.` : ''}\n${parsedFlags.mode === 'frontend-only' ? `Focus on client-side implementation, UI/UX, and user interactions.` : ''}\n${parsedFlags.mode === 'api-only' ? `Focus on API design, documentation, and endpoint implementation.` : ''}\n${parsedFlags.mode === 'full' || !parsedFlags.mode ? `Full-stack development covering all aspects of the application.` : ''}\n\n`;

            const claudeArgs = [enhancedTask];
            claudeArgs.push('--allowedTools', tools);

            // DEBUG: Log what we're about to pass
            console.log('\n🔍 DEBUG - Command Construction:');
            console.log(`First arg length: ${claudeArgs[0].length} chars`);
            console.log(`First 100 chars: ${claudeArgs[0].substring(0, 100)}...`);
            console.log(`Args count: ${claudeArgs.length}`);

            if (parsedFlags.noPermissions) {
              claudeArgs.push('--dangerously-skip-permissions');
            }

            if (parsedFlags.config) {
              claudeArgs.push('--mcp-config', parsedFlags.config);
            }

            if (parsedFlags.verbose) {
              claudeArgs.push('--verbose');
            }

            // Execute the actual claude command
            try {
              // Debug: Log the actual command being executed
              if (parsedFlags.verbose) {
                console.log('Debug - Executing command:');
                console.log(
                  `claude ${claudeArgs.map((arg) => (arg.includes(' ') || arg.includes('\n') ? `"${arg}"` : arg)).join(' ')}`,
                );
              }

              const child = spawn('claude', claudeArgs, {
                env: {
                  ...process.env,
                  CLAUDE_INSTANCE_ID: instanceId,
                  CLAUDE_FLOW_MODE: parsedFlags.mode || 'full',
                  CLAUDE_FLOW_COVERAGE: (parsedFlags.coverage || 80).toString(),
                  CLAUDE_FLOW_COMMIT: parsedFlags.commit || 'phase',
                  // Add claude-zen specific features
                  CLAUDE_FLOW_MEMORY_ENABLED: 'true',
                  CLAUDE_FLOW_MEMORY_NAMESPACE: 'default',
                  CLAUDE_FLOW_COORDINATION_ENABLED: parsedFlags.parallel ? 'true' : 'false',
                  CLAUDE_FLOW_FEATURES: 'memory,coordination,swarm',
                },
                stdio: 'inherit',
              });

              // Wait for process to exit
              await new Promise((resolve) => {
                child.on('exit', (code) => {
                  if (code === 0) {
                    printSuccess(`Claude instance ${instanceId} completed successfully`);
                  }
                  else {
                    printError(`Claude instance ${instanceId} exited with code ${code}`);
                  }
                  resolve();
                });
              });
            }
            catch (err) {
              printError(`Failed to spawn Claude: ${err.message}`);
              console.log('Make sure you have the Claude CLI installed.');
            }
          }
          break;

        case 'batch':
          const workflowFile = args[1];
          if (!workflowFile) {
            printError('Usage: claude batch <workflow-file>');
            break;
          }
          printSuccess(`Loading workflow: ${workflowFile}`);
          console.log('📋 Batch execution would process workflow file');
          break;

        default:
          console.log('Claude commands: spawn, batch');
          console.log('\nExamples:');
          console.log(
            '  claude-zen claude spawn "implement user authentication" --research --parallel',
          );
          console.log('  claude-zen claude spawn "fix bug in payment system" --no-permissions');
          console.log('  claude-zen claude batch workflow.json --dry-run');
      }
}