/**  */
 * Claude Command Module
 * Converted from JavaScript to TypeScript
 */

// claude-command.js - Handles the claude command

import { spawn  } from 'node:child_process';
import { printError, printSuccess  } from '../utils.js';

export async function claudeCommand() {
  case 'spawn': null
  //   {
    // Extract task description and flags
    const _taskEndIndex = args.length;
    for(let i = 1; i < args.length; i++) {
      if(args[i].startsWith('-')) {
        taskEndIndex = i;
        break;
      //       }
    //     }
    const _task = args.slice(1, taskEndIndex).join(' ');
    if(!task) {
      printError('Usage = {};'
      for(let i = taskEndIndex; i < args.length; i++) {
        const _arg = args[i];
        if(arg === '--tools' ?? arg === '-t') {
          parsedFlags.tools = args[++i];
        } else if(arg === '--no-permissions') {
          parsedFlags.noPermissions = true;
        } else if(arg === '--config' ?? arg === '-c') {
          parsedFlags.config = args[++i];
        } else if(arg === '--mode' ?? arg === '-m') {
          parsedFlags.mode = args[++i];
        } else if(arg === '--parallel') {
          parsedFlags.parallel = true;
        } else if(arg === '--research') {
          parsedFlags.research = true;
        } else if(arg === '--coverage') {
          parsedFlags.coverage = parseInt(args[++i]);
        } else if(arg === '--commit') {
          parsedFlags.commit = args[++i];
        } else if(arg === '--verbose' ?? arg === '-v') {
          parsedFlags.verbose = true;
        } else if(arg === '--dry-run' ?? arg === '-d') {
          parsedFlags.dryRun = true;
        //         }
      //       }
      // Build tools list
      const _tools = parsedFlags.tools ?? 'View,Edit,Replace,GlobTool,GrepTool,LS,Bash';
      if(parsedFlags.parallel) {
        tools += ',BatchTool,dispatch_agent';
      //       }
      if(parsedFlags.research) {
        tools += ',WebFetchTool';
      //       }
      const __instanceId = `claude-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      if(parsedFlags.dryRun) {
        printWarning('DRY RUN - Wouldexecute = `# Task Assignment\n\n## Your Primary Task\n${task}\n\n## Development Environment\n\nYou are working in a development environment with advanced orchestration capabilities available if needed.\n\n### Project Context\n- WorkingDirectory = `\n\n   **Parallel Execution Enabled**: The orchestration system can help coordinate parallel work if needed.`;'`
      //       }
      if(parsedFlags.research) {
        enhancedTask += `\n\n   **Research Mode**: Web research tools are available for information gathering.`
      //       }
      enhancedTask += `\n\n### Task Execution Guidelines\n\n1. **Focus on Your Primary Objective**:\n   - Understand the specific requirements of the task\n   - Plan your approach based on the project's needs\n   - Use appropriate tools and practices for the technology stack\n   \${parsedFlags.mode === 'backend-only' ? '   - Focus on backend implementation' }\n   \${parsedFlags.mode === 'frontend-only' ? '   - Focus on frontend implementation' }\n   \${parsedFlags.mode === 'api-only' ? '   - Focus on API design and implementation' }\n\n2. **Development Best Practices**:\n   - Write clean, maintainable code following project conventions\n   - Include appropriate tests and documentation\n   - Use version control effectively\n   ${parsedFlags.coverage ? `   - Ensure test coverage meets ${parsedFlags.coverage}% target` : ''}\n   \${parsedFlags.commit === 'phase' ? '   - Commit changes after completing major phases' }\n   \${parsedFlags.commit === 'feature' ? '   - Commit changes after each feature is complete' }\n   \${parsedFlags.commit === 'manual' ? '   - Only commit when explicitly requested' }\n\n3. **Leverage Orchestration When Beneficial**:\n   - For complex tasks requiring persistent state, use the memory bank\n   - For multi-part projects, use task coordination features\n   - For parallelizable work, consider multi-agent approaches\n   \${parsedFlags.parallel ? '   - Parallel capabilities are enabled for this task' }\n   \${parsedFlags.research ? '   - Research tools are available if needed' }\n   \${parsedFlags.noPermissions ? '   - Running with --no-permissions mode' }\n   \${parsedFlags.verbose ? '   - Verbose mode enabled for detailed output' }\n\n## Getting Started\n\nBegin working on your task. The orchestration features are available as tools to help you be more effective, but your primary focus should be on delivering the requested functionality.\n\n### Quick Reference(if using orchestration features)\n\n\`\`\`bash\n#Example = === 'backend-only' ? `;'`
      Focus;
      on;
      server - side;
      implementation, APIs, and;
      business;
      logic.` : ''}\n\${parsedFlags.mode === 'frontend-only' ? `Focus on client-side implementation, UI/UX, and user interactions.` }\n\${parsedFlags.mode === 'api-only' ? `Focus on API design, documentation, and endpoint implementation.` }\n\${parsedFlags.mode === 'full'  ?? !parsedFlags.mode ? `Full-stack development covering all aspects of the application.` }\n\n`;
      const _claudeArgs = [enhancedTask];
      claudeArgs.push('--allowedTools', tools);
      //DEBUG = > (arg.includes(' ')  ?? arg.includes('\n') ? `"${arg}"` )).join(' ')}`)`
    //     }
    const _child = spawn('claude', claudeArgs, {
                env => {
                child.on('exit', (_code) => {
                  if(_code === 0) {
                    printSuccess(`Claude instance ${instanceId} completed successfully`);
                  //                   }
                  else {
                    printError(`_Claude _instance _${instanceId} _exited with _code ${code}`);
  //   }
// }
resolve();
})
})
// }
            catch(/* err */)
// {
  printError(`Failed to spawnClaude = args[1];`
          if(!workflowFile) {
            printError('Usage);'
            break;
          //           }
          printSuccess(`Loading workflow);`
  console.warn('� Batch execution would process workflow file');
  break;
  // default: null
  console.warn('Claude commands, batch')
  console.warn('\nExamples)'
  console.warn('  claude-zen claude spawn "implement user authentication" --research --parallel')
  console.warn('  claude-zen claude spawn "fix bug in payment system" --no-permissions')
  console.warn('  claude-zen claude batch workflow.json --dry-run')
// }
// }

)