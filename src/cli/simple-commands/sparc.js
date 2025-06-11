// sparc.js - SPARC development mode commands
import { printSuccess, printError, printWarning } from '../utils.js';

export async function sparcCommand(subArgs, flags) {
  const sparcCmd = subArgs[0];
  
  switch (sparcCmd) {
    case 'modes':
      await listSparcModes(subArgs);
      break;
      
    case 'info':
      await showModeInfo(subArgs);
      break;
      
    case 'run':
      await runSparcMode(subArgs);
      break;
      
    case 'tdd':
      await runTddWorkflow(subArgs);
      break;
      
    default:
      showSparcHelp();
  }
}

async function listSparcModes(subArgs) {
  try {
    const configPath = '.roomodes';
    let configContent;
    try {
      configContent = await Deno.readTextFile(configPath);
    } catch (error) {
      printError('SPARC configuration file (.roomodes) not found');
      console.log('Please ensure .roomodes file exists in the current directory');
      return;
    }
    
    const config = JSON.parse(configContent);
    const verbose = subArgs.includes('--verbose') || subArgs.includes('-v');
    
    printSuccess('Available SPARC Modes:');
    console.log();
    
    for (const mode of config.customModes) {
      console.log(`• ${mode.name} (${mode.slug})`);
      if (verbose) {
        console.log(`  ${mode.roleDefinition}`);
        console.log(`  Tools: ${mode.groups.join(', ')}`);
        console.log();
      }
    }
    
    if (!verbose) {
      console.log();
      console.log('Use --verbose for detailed descriptions');
    }
  } catch (err) {
    printError(`Failed to list SPARC modes: ${err.message}`);
  }
}

async function showModeInfo(subArgs) {
  const modeSlug = subArgs[1];
  if (!modeSlug) {
    printError('Usage: sparc info <mode-slug>');
    return;
  }
  
  try {
    const configContent = await Deno.readTextFile('.roomodes');
    const config = JSON.parse(configContent);
    const mode = config.customModes.find(m => m.slug === modeSlug);
    
    if (!mode) {
      printError(`Mode not found: ${modeSlug}`);
      console.log('Available modes:');
      for (const m of config.customModes) {
        console.log(`  ${m.slug} - ${m.name}`);
      }
      return;
    }
    
    printSuccess(`SPARC Mode: ${mode.name}`);
    console.log();
    console.log('Role Definition:');
    console.log(mode.roleDefinition);
    console.log();
    console.log('Custom Instructions:');
    console.log(mode.customInstructions);
    console.log();
    console.log('Tool Groups:');
    console.log(mode.groups.join(', '));
    console.log();
    console.log('Source:');
    console.log(mode.source);
    
  } catch (err) {
    printError(`Failed to show mode info: ${err.message}`);
  }
}

async function runSparcMode(subArgs) {
  const runModeSlug = subArgs[1];
  const taskDescription = subArgs.slice(2).join(' ');
  
  if (!runModeSlug || !taskDescription) {
    printError('Usage: sparc run <mode-slug> <task-description>');
    return;
  }
  
  try {
    const configContent = await Deno.readTextFile('.roomodes');
    const config = JSON.parse(configContent);
    const mode = config.customModes.find(m => m.slug === runModeSlug);
    
    if (!mode) {
      printError(`Mode not found: ${runModeSlug}`);
      return;
    }
    
    // Build enhanced SPARC prompt
    const memoryNamespace = subArgs.includes('--namespace') ? 
      subArgs[subArgs.indexOf('--namespace') + 1] : mode.slug;
    
    const enhancedTask = createSparcPrompt(mode, taskDescription, memoryNamespace);
    
    // Build tools based on mode groups
    const tools = buildToolsFromGroups(mode.groups);
    const toolsList = Array.from(tools).join(',');
    const instanceId = `sparc-${runModeSlug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (subArgs.includes('--dry-run') || subArgs.includes('-d')) {
      printWarning('DRY RUN - SPARC Mode Configuration:');
      console.log(`Mode: ${mode.name} (${mode.slug})`);
      console.log(`Instance ID: ${instanceId}`);
      console.log(`Tools: ${toolsList}`);
      console.log(`Task: ${taskDescription}`);
      console.log();
      console.log('Enhanced prompt preview:');
      console.log(enhancedTask.substring(0, 300) + '...');
      return;
    }
    
    printSuccess(`Starting SPARC mode: ${mode.name}`);
    console.log(`📝 Instance ID: ${instanceId}`);
    console.log(`🎯 Mode: ${mode.slug}`);
    console.log(`🔧 Tools: ${toolsList}`);
    console.log(`📋 Task: ${taskDescription}`);
    console.log();
    
    // Execute Claude with SPARC configuration
    await executeClaude(enhancedTask, toolsList, instanceId, memoryNamespace, subArgs);
    
  } catch (err) {
    printError(`Failed to run SPARC mode: ${err.message}`);
  }
}

async function runTddWorkflow(subArgs) {
  const tddTaskDescription = subArgs.slice(1).join(' ');
  
  if (!tddTaskDescription) {
    printError('Usage: sparc tdd <task-description>');
    return;
  }
  
  printSuccess('Starting SPARC TDD Workflow');
  console.log('Following Test-Driven Development with SPARC methodology');
  console.log();
  
  const phases = [
    { name: 'Red', description: 'Write failing tests', mode: 'tdd' },
    { name: 'Green', description: 'Minimal implementation', mode: 'code' },
    { name: 'Refactor', description: 'Optimize and clean', mode: 'tdd' }
  ];
  
  console.log('TDD Phases:');
  for (const phase of phases) {
    console.log(`  ${phase.name}: ${phase.description} (${phase.mode} mode)`);
  }
  console.log();
  
  if (subArgs.includes('--interactive') || subArgs.includes('-i')) {
    printSuccess('Starting interactive TDD workflow');
    console.log('This would walk through each phase interactively');
    console.log('Run each phase with: sparc run <mode> "Phase: <task>"');
  } else {
    printSuccess('Starting full TDD workflow');
    console.log('This would execute all phases automatically');
    console.log('Use --interactive for step-by-step control');
  }
}

function createSparcPrompt(mode, taskDescription, memoryNamespace) {
  return `# SPARC Development Mode: ${mode.name}

## Your Role
${mode.roleDefinition}

## Your Task
${taskDescription}

## Mode-Specific Instructions
${mode.customInstructions}

## SPARC Development Environment

You are working within the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology using claude-flow orchestration features.

### Available Development Tools
- **Memory Persistence**: Use \`npx claude-flow memory store <key> "<value>"\` to save progress and findings
- **Memory Retrieval**: Use \`npx claude-flow memory query <search>\` to access previous work
- **Namespace**: Your work is stored in the "${memoryNamespace}" namespace

### SPARC Methodology Integration
Follow the SPARC methodology for systematic development:
1. **Specification**: Define clear requirements and constraints
2. **Pseudocode**: Create detailed logic flows and algorithms  
3. **Architecture**: Design system structure and components
4. **Refinement**: Implement, test, and optimize
5. **Completion**: Integrate, document, and validate

### Best Practices
1. **Modular Development**: Keep all files under 500 lines
2. **Environment Safety**: Never hardcode secrets or environment values
3. **Memory Usage**: Store key findings and decisions in memory for future reference
4. **Tool Integration**: Use \`new_task\` for subtasks and \`attempt_completion\` when finished

### Memory Commands Examples
\`\`\`bash
# Store your progress
npx claude-flow memory store ${memoryNamespace}_progress "Current status and findings"

# Check for previous work
npx claude-flow memory query ${memoryNamespace}

# Store results
npx claude-flow memory store ${memoryNamespace}_results "Implementation output and decisions"
\`\`\`

Now proceed with your task following the SPARC methodology and your specific role instructions.`;
}

function buildToolsFromGroups(groups) {
  const toolMappings = {
    read: ['View', 'LS', 'GlobTool', 'GrepTool'],
    edit: ['Edit', 'Replace', 'MultiEdit', 'Write'],
    browser: ['WebFetch'],
    mcp: ['mcp_tools'],
    command: ['Bash', 'Terminal']
  };
  
  const tools = new Set(['View', 'Edit', 'Bash']); // Always include basic tools
  
  for (const group of groups) {
    if (Array.isArray(group)) {
      const groupName = group[0];
      if (toolMappings[groupName]) {
        toolMappings[groupName].forEach(tool => tools.add(tool));
      }
    } else if (toolMappings[group]) {
      toolMappings[group].forEach(tool => tools.add(tool));
    }
  }
  
  return tools;
}

async function executeClaude(enhancedTask, toolsList, instanceId, memoryNamespace, subArgs) {
  const claudeArgs = [enhancedTask];
  claudeArgs.push('--allowedTools', toolsList);
  
  if (subArgs.includes('--no-permissions')) {
    claudeArgs.push('--dangerously-skip-permissions');
  }
  
  if (subArgs.includes('--config')) {
    const configIndex = subArgs.indexOf('--config');
    claudeArgs.push('--mcp-config', subArgs[configIndex + 1]);
  }
  
  if (subArgs.includes('--verbose') || subArgs.includes('-v')) {
    claudeArgs.push('--verbose');
  }
  
  try {
    const command = new Deno.Command('claude', {
      args: claudeArgs,
      env: {
        ...Deno.env.toObject(),
        CLAUDE_INSTANCE_ID: instanceId,
        CLAUDE_SPARC_MODE: 'true',
        CLAUDE_FLOW_MEMORY_ENABLED: 'true',
        CLAUDE_FLOW_MEMORY_NAMESPACE: memoryNamespace,
      },
      stdin: 'inherit',
      stdout: 'inherit',
      stderr: 'inherit',
    });
    
    const child = command.spawn();
    const status = await child.status;
    
    if (status.success) {
      printSuccess(`SPARC instance ${instanceId} completed successfully`);
    } else {
      printError(`SPARC instance ${instanceId} exited with code ${status.code}`);
    }
  } catch (err) {
    printError(`Failed to execute Claude: ${err.message}`);
  }
}

function showSparcHelp() {
  console.log('SPARC commands:');
  console.log('  modes         List available SPARC development modes');
  console.log('  info <mode>   Show detailed information about a mode');
  console.log('  run <mode> <task>  Execute a task in specified SPARC mode');
  console.log('  tdd <task>    Run Test-Driven Development workflow');
  console.log();
  console.log('Examples:');
  console.log('  claude-flow sparc modes --verbose');
  console.log('  claude-flow sparc info architect');
  console.log('  claude-flow sparc run code "implement user authentication"');
  console.log('  claude-flow sparc tdd "payment processing system"');
  console.log();
  console.log('Flags:');
  console.log('  --dry-run, -d     Show configuration without executing');
  console.log('  --verbose, -v     Show detailed output');
  console.log('  --interactive, -i Run TDD workflow interactively');
  console.log('  --no-permissions  Skip Claude permissions prompts');
  console.log('  --namespace <ns>  Use custom memory namespace');
}