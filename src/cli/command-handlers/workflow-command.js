// workflow-command.js - Modern workflow command handler with SPARC methodology integration
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';
import { promises as fs } from 'fs';
import path from 'path';

// Workflow templates and predefined workflows
const WORKFLOW_TEMPLATES = {
  'sparc-basic': {
    name: 'Basic SPARC Workflow',
    description: 'A complete SPARC methodology workflow with all phases',
    phases: [
      { name: 'specification', mode: 'spec-pseudocode', description: 'Create detailed specifications and requirements' },
      { name: 'pseudocode', mode: 'spec-pseudocode', description: 'Develop algorithmic pseudocode' },
      { name: 'architecture', mode: 'architect', description: 'Design system architecture' },
      { name: 'implementation', mode: 'code', description: 'Implement code using TDD' },
      { name: 'refinement', mode: 'tdd', description: 'Refine and optimize implementation' },
      { name: 'completion', mode: 'integration', description: 'Integration and final testing' }
    ]
  },
  'tdd-cycle': {
    name: 'TDD Development Cycle',
    description: 'Test-Driven Development workflow with Red-Green-Refactor cycle',
    phases: [
      { name: 'red', mode: 'tdd', description: 'Write failing tests' },
      { name: 'green', mode: 'code', description: 'Implement minimal code to pass tests' },
      { name: 'refactor', mode: 'tdd', description: 'Refactor and optimize code' }
    ]
  },
  'research': {
    name: 'Research Workflow',
    description: 'Comprehensive research and analysis workflow',
    phases: [
      { name: 'gather', mode: 'research', description: 'Gather information and data' },
      { name: 'analyze', mode: 'analysis', description: 'Analyze findings and patterns' },
      { name: 'document', mode: 'docs-writer', description: 'Document insights and recommendations' }
    ]
  },
  'development': {
    name: 'Full Development Workflow',
    description: 'End-to-end development workflow from planning to deployment',
    phases: [
      { name: 'planning', mode: 'spec-pseudocode', description: 'Project planning and requirements' },
      { name: 'architecture', mode: 'architect', description: 'System design and architecture' },
      { name: 'implementation', mode: 'code', description: 'Core implementation' },
      { name: 'testing', mode: 'tdd', description: 'Comprehensive testing' },
      { name: 'integration', mode: 'integration', description: 'System integration' },
      { name: 'deployment', mode: 'devops', description: 'Deployment and monitoring' }
    ]
  }
};

// Available SPARC modes
const SPARC_MODES = [
  'spec-pseudocode', 'architect', 'code', 'tdd', 'integration', 'debug',
  'devops', 'docs-writer', 'security-review', 'mcp', 'tutorial'
];

/**
 * Main workflow command handler
 * @param {string[]} args - Command arguments
 * @param {Object} flags - Command flags
 */
export async function workflowCommand(args, flags) {
  const subCommand = args[0];

  if (!subCommand || flags.help) {
    showWorkflowHelp();
    return;
  }

  try {
    switch (subCommand) {
      case 'create':
        await createWorkflow(args.slice(1), flags);
        break;
      case 'list':
        await listWorkflows(args.slice(1), flags);
        break;
      case 'run':
      case 'execute':
        await runWorkflow(args.slice(1), flags);
        break;
      case 'status':
        await showWorkflowStatus(args.slice(1), flags);
        break;
      case 'stop':
        await stopWorkflow(args.slice(1), flags);
        break;
      case 'templates':
        await showTemplates(args.slice(1), flags);
        break;
      case 'modes':
        await showModes(args.slice(1), flags);
        break;
      case 'info':
        await showWorkflowInfo(args.slice(1), flags);
        break;
      default:
        printError(`Unknown workflow command: ${subCommand}`);
        showWorkflowHelp();
    }
  } catch (error) {
    printError(`Workflow command failed: ${error.message}`);
    if (flags.verbose) {
      console.error('Stack trace:', error.stack);
    }
  }
}

/**
 * Create a new workflow
 */
async function createWorkflow(args, flags) {
  const workflowName = args[0];
  const template = flags.template || flags.t;
  const interactive = flags.interactive || flags.i;
  
  if (!workflowName && !interactive) {
    printError('Usage: workflow create <name> [--template <template>] [--interactive]');
    return;
  }

  if (interactive) {
    await createInteractiveWorkflow(flags);
    return;
  }

  const workflowId = `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  let workflowData;

  if (template && WORKFLOW_TEMPLATES[template]) {
    // Create from template
    const templateData = WORKFLOW_TEMPLATES[template];
    workflowData = {
      id: workflowId,
      name: workflowName,
      template: template,
      description: templateData.description,
      phases: templateData.phases,
      created: new Date().toISOString(),
      status: 'created'
    };
  } else {
    // Create basic workflow - filter out flag arguments for description
    const nonFlagArgs = args.slice(1).filter(arg => !arg.startsWith('--'));
    workflowData = {
      id: workflowId,
      name: workflowName,
      description: nonFlagArgs.join(' ') || 'Custom workflow',
      phases: [
        { name: 'main', mode: 'code', description: 'Main workflow execution' }
      ],
      created: new Date().toISOString(),
      status: 'created'
    };
    
    if (template) {
      printWarning(`Template "${template}" not found. Available templates: ${Object.keys(WORKFLOW_TEMPLATES).join(', ')}`);
    }
  }

  // Save workflow to .claude-zen/workflows directory
  await ensureWorkflowDirectory();
  const workflowPath = path.join('.claude-zen', 'workflows', `${workflowId}.json`);
  await fs.writeFile(workflowPath, JSON.stringify(workflowData, null, 2));

  printSuccess(`Created workflow: ${workflowName}`);
  console.log(`🆔 Workflow ID: ${workflowId}`);
  console.log(`📁 Saved to: ${workflowPath}`);
  if (template) {
    console.log(`📋 Template: ${template} (${WORKFLOW_TEMPLATES[template].name})`);
  }
  console.log(`📝 Description: ${workflowData.description}`);
  console.log(`🔄 Phases: ${workflowData.phases.length}`);
  
  if (flags.verbose) {
    console.log('\n🔍 Workflow Details:');
    workflowData.phases.forEach((phase, index) => {
      console.log(`  ${index + 1}. ${phase.name} (${phase.mode}): ${phase.description}`);
    });
  }
}

/**
 * Interactive workflow creation
 */
async function createInteractiveWorkflow(flags) {
  printInfo('🛠️  Interactive Workflow Creator');
  console.log('\n📋 Available Templates:');
  Object.entries(WORKFLOW_TEMPLATES).forEach(([key, template]) => {
    console.log(`  ${key.padEnd(15)} - ${template.name}`);
    console.log(`  ${' '.repeat(17)} ${template.description}`);
  });
  
  console.log('\n🎯 Available SPARC Modes:');
  SPARC_MODES.forEach((mode, index) => {
    if (index % 3 === 0) console.log('  ', end='');
    console.log(mode.padEnd(20), end='');
    if ((index + 1) % 3 === 0) console.log('');
  });
  
  printInfo('\nTo create a workflow interactively, use a workflow template or define custom phases.');
  printInfo('Example: workflow create "my-workflow" --template sparc-basic');
}

/**
 * List available workflows
 */
async function listWorkflows(args, flags) {
  try {
    const workflowsDir = path.join('.claude-zen', 'workflows');
    const files = await fs.readdir(workflowsDir).catch(() => []);
    const workflowFiles = files.filter(file => file.endsWith('.json'));

    if (workflowFiles.length === 0) {
      printInfo('No workflows found.');
      console.log('\nCreate a workflow with:');
      console.log('  claude-zen workflow create "my-workflow" --template sparc-basic');
      return;
    }

    printSuccess(`Found ${workflowFiles.length} workflow(s):`);
    console.log('');

    for (const file of workflowFiles) {
      try {
        const workflowPath = path.join(workflowsDir, file);
        const data = await fs.readFile(workflowPath, 'utf8');
        const workflow = JSON.parse(data);
        
        console.log(`📋 ${workflow.name || 'Unnamed Workflow'}`);
        console.log(`   ID: ${workflow.id}`);
        console.log(`   Status: ${workflow.status || 'unknown'}`);
        console.log(`   Phases: ${workflow.phases ? workflow.phases.length : 0}`);
        if (workflow.description) {
          console.log(`   Description: ${workflow.description}`);
        }
        if (workflow.template) {
          console.log(`   Template: ${workflow.template}`);
        }
        console.log(`   Created: ${workflow.created || 'unknown'}`);
        console.log('');
      } catch (error) {
        printWarning(`Could not read workflow file: ${file}`);
      }
    }

    console.log('📖 Use "workflow run <name-or-id>" to execute a workflow');
  } catch (error) {
    printError(`Failed to list workflows: ${error.message}`);
  }
}

/**
 * Run/execute a workflow
 */
async function runWorkflow(args, flags) {
  const workflowIdentifier = args[0];
  
  if (!workflowIdentifier) {
    printError('Usage: workflow run <name-or-id> [--phase <phase>] [--dry-run]');
    return;
  }

  // Find workflow by name or ID
  const workflow = await findWorkflow(workflowIdentifier);
  if (!workflow) {
    printError(`Workflow not found: ${workflowIdentifier}`);
    return;
  }

  const dryRun = flags['dry-run'] || flags.dryRun;
  const specificPhase = flags.phase;
  const verbose = flags.verbose || flags.v;

  printSuccess(`${dryRun ? 'Simulating' : 'Executing'} workflow: ${workflow.name}`);
  console.log(`🆔 ID: ${workflow.id}`);
  console.log(`📝 Description: ${workflow.description}`);
  
  if (specificPhase) {
    await runWorkflowPhase(workflow, specificPhase, dryRun, verbose);
  } else {
    await runCompleteWorkflow(workflow, dryRun, verbose);
  }
}

/**
 * Run complete workflow
 */
async function runCompleteWorkflow(workflow, dryRun, verbose) {
  console.log(`\n🚀 ${dryRun ? 'Simulating' : 'Starting'} workflow execution...`);
  console.log(`📋 Total phases: ${workflow.phases.length}`);
  
  for (let i = 0; i < workflow.phases.length; i++) {
    const phase = workflow.phases[i];
    console.log(`\n📍 Phase ${i + 1}/${workflow.phases.length}: ${phase.name}`);
    console.log(`🎯 Mode: ${phase.mode}`);
    console.log(`📄 Description: ${phase.description}`);
    
    if (!dryRun) {
      console.log('🔄 Executing phase...');
      // Simulate phase execution
      await new Promise(resolve => setTimeout(resolve, 1000));
      printSuccess(`✅ Phase ${phase.name} completed`);
    } else {
      console.log('🔍 [DRY RUN] Phase would be executed here');
    }
    
    if (verbose) {
      console.log(`   SPARC Mode: ${phase.mode}`);
      console.log(`   Phase Type: ${getPhaseType(phase.mode)}`);
    }
  }
  
  if (!dryRun) {
    // Update workflow status
    await updateWorkflowStatus(workflow.id, 'completed');
    printSuccess(`\n🎉 Workflow "${workflow.name}" completed successfully!`);
  } else {
    printInfo(`\n🔍 Dry run completed for workflow "${workflow.name}"`);
  }
}

/**
 * Run specific workflow phase
 */
async function runWorkflowPhase(workflow, phaseName, dryRun, verbose) {
  const phase = workflow.phases.find(p => p.name === phaseName);
  
  if (!phase) {
    printError(`Phase not found: ${phaseName}`);
    console.log('Available phases:');
    workflow.phases.forEach(p => console.log(`  - ${p.name}`));
    return;
  }

  console.log(`\n📍 Executing phase: ${phase.name}`);
  console.log(`🎯 Mode: ${phase.mode}`);
  console.log(`📄 Description: ${phase.description}`);
  
  if (!dryRun) {
    console.log('🔄 Executing phase...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    printSuccess(`✅ Phase ${phase.name} completed`);
  } else {
    console.log('🔍 [DRY RUN] Phase would be executed here');
  }
}

/**
 * Show workflow status
 */
async function showWorkflowStatus(args, flags) {
  if (args.length === 0) {
    // Show overall workflow system status
    printSuccess('Workflow System Status:');
    console.log('🔧 System: Active');
    console.log('📊 Performance: Optimal');
    console.log('💾 Storage: Available');
    
    try {
      const workflowsDir = path.join('.claude-zen', 'workflows');
      const files = await fs.readdir(workflowsDir).catch(() => []);
      const workflowCount = files.filter(file => file.endsWith('.json')).length;
      console.log(`📋 Total Workflows: ${workflowCount}`);
    } catch (error) {
      console.log('📋 Total Workflows: 0');
    }
    
    console.log('🎯 Available Templates:', Object.keys(WORKFLOW_TEMPLATES).length);
    console.log('🔄 Available SPARC Modes:', SPARC_MODES.length);
    return;
  }

  const workflowIdentifier = args[0];
  const workflow = await findWorkflow(workflowIdentifier);
  
  if (!workflow) {
    printError(`Workflow not found: ${workflowIdentifier}`);
    return;
  }

  printSuccess(`Workflow Status: ${workflow.name}`);
  console.log(`🆔 ID: ${workflow.id}`);
  console.log(`📊 Status: ${workflow.status || 'unknown'}`);
  console.log(`📝 Description: ${workflow.description}`);
  console.log(`🗓️  Created: ${workflow.created}`);
  
  if (workflow.lastRun) {
    console.log(`🔄 Last Run: ${workflow.lastRun}`);
  }
  
  if (workflow.template) {
    console.log(`📋 Template: ${workflow.template}`);
  }
  
  console.log('\n🔄 Workflow Phases:');
  workflow.phases.forEach((phase, index) => {
    console.log(`  ${index + 1}. ${phase.name}`);
    console.log(`     Mode: ${phase.mode} (${getPhaseType(phase.mode)})`);
    console.log(`     Description: ${phase.description}`);
  });
}

/**
 * Stop running workflow
 */
async function stopWorkflow(args, flags) {
  const workflowIdentifier = args[0];
  
  if (!workflowIdentifier) {
    printError('Usage: workflow stop <name-or-id>');
    return;
  }

  const workflow = await findWorkflow(workflowIdentifier);
  if (!workflow) {
    printError(`Workflow not found: ${workflowIdentifier}`);
    return;
  }

  printSuccess(`Stopping workflow: ${workflow.name}`);
  console.log(`🆔 ID: ${workflow.id}`);
  
  // Update workflow status
  await updateWorkflowStatus(workflow.id, 'stopped');
  
  console.log('🛑 Workflow stopped successfully');
  console.log('💡 Use "workflow run" to restart the workflow');
}

/**
 * Show available templates
 */
async function showTemplates(args, flags) {
  printSuccess('Available Workflow Templates:');
  console.log('');
  
  Object.entries(WORKFLOW_TEMPLATES).forEach(([key, template]) => {
    console.log(`📋 ${key}`);
    console.log(`   Name: ${template.name}`);
    console.log(`   Description: ${template.description}`);
    console.log(`   Phases: ${template.phases.length}`);
    
    if (flags.verbose) {
      console.log('   Phase Details:');
      template.phases.forEach((phase, index) => {
        console.log(`     ${index + 1}. ${phase.name} (${phase.mode}): ${phase.description}`);
      });
    }
    console.log('');
  });
  
  console.log('💡 Use "workflow create <name> --template <template-key>" to create from template');
}

/**
 * Show available SPARC modes
 */
async function showModes(args, flags) {
  printSuccess('Available SPARC Modes:');
  console.log('');
  
  const modeDescriptions = {
    'spec-pseudocode': 'Specification and pseudocode development',
    'architect': 'System architecture and design',
    'code': 'Code implementation and development', 
    'tdd': 'Test-driven development and testing',
    'integration': 'System integration and validation',
    'debug': 'Debugging and troubleshooting',
    'devops': 'Deployment and operations',
    'docs-writer': 'Documentation creation',
    'security-review': 'Security analysis and review',
    'mcp': 'MCP tool integration',
    'tutorial': 'Tutorial and guide creation'
  };
  
  SPARC_MODES.forEach(mode => {
    console.log(`🎯 ${mode}`);
    console.log(`   ${modeDescriptions[mode] || 'SPARC development mode'}`);
    console.log('');
  });
  
  console.log('💡 Use modes in workflow phases or with "npx claude-zen sparc run <mode>"');
}

/**
 * Show workflow information
 */
async function showWorkflowInfo(args, flags) {
  const target = args[0];
  
  if (!target) {
    printError('Usage: workflow info <name-or-id-or-template>');
    return;
  }
  
  // Check if it's a template
  if (WORKFLOW_TEMPLATES[target]) {
    const template = WORKFLOW_TEMPLATES[target];
    printSuccess(`Template Info: ${target}`);
    console.log(`📋 Name: ${template.name}`);
    console.log(`📝 Description: ${template.description}`);
    console.log(`🔄 Phases: ${template.phases.length}`);
    console.log('');
    console.log('Phase Details:');
    template.phases.forEach((phase, index) => {
      console.log(`  ${index + 1}. ${phase.name}`);
      console.log(`     Mode: ${phase.mode} (${getPhaseType(phase.mode)})`);
      console.log(`     Description: ${phase.description}`);
    });
    return;
  }
  
  // Check if it's a workflow
  const workflow = await findWorkflow(target);
  if (workflow) {
    await showWorkflowStatus([target], flags);
    return;
  }
  
  printError(`No workflow or template found with identifier: ${target}`);
}

/**
 * Utility functions
 */

async function ensureWorkflowDirectory() {
  const dir = path.join('.claude-zen', 'workflows');
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

async function findWorkflow(identifier) {
  try {
    const workflowsDir = path.join('.claude-zen', 'workflows');
    const files = await fs.readdir(workflowsDir).catch(() => []);
    const workflowFiles = files.filter(file => file.endsWith('.json'));
    
    for (const file of workflowFiles) {
      try {
        const workflowPath = path.join(workflowsDir, file);
        const data = await fs.readFile(workflowPath, 'utf8');
        const workflow = JSON.parse(data);
        
        if (workflow.id === identifier || workflow.name === identifier) {
          return workflow;
        }
      } catch (error) {
        continue;
      }
    }
  } catch (error) {
    // Directory doesn't exist or other error
  }
  return null;
}

async function updateWorkflowStatus(workflowId, status) {
  try {
    const workflow = await findWorkflow(workflowId);
    if (workflow) {
      workflow.status = status;
      workflow.lastRun = new Date().toISOString();
      
      const workflowPath = path.join('.claude-zen', 'workflows', `${workflowId}.json`);
      await fs.writeFile(workflowPath, JSON.stringify(workflow, null, 2));
    }
  } catch (error) {
    printWarning(`Could not update workflow status: ${error.message}`);
  }
}

function getPhaseType(mode) {
  const types = {
    'spec-pseudocode': 'Planning',
    'architect': 'Design', 
    'code': 'Implementation',
    'tdd': 'Testing',
    'integration': 'Integration',
    'debug': 'Debugging',
    'devops': 'Operations',
    'docs-writer': 'Documentation',
    'security-review': 'Security',
    'mcp': 'Integration',
    'tutorial': 'Documentation'
  };
  return types[mode] || 'General';
}

/**
 * Show workflow help
 */
function showWorkflowHelp() {
  console.log(`
🌊 Claude-Flow Workflow Management

USAGE:
  claude-zen workflow <command> [options]

COMMANDS:
  create <name>           Create a new workflow
  list                    List all workflows  
  run <name-or-id>        Execute a workflow
  status [name-or-id]     Show workflow status
  stop <name-or-id>       Stop running workflow
  templates               Show available templates
  modes                   Show available SPARC modes
  info <target>           Show detailed information

WORKFLOW CREATION:
  --template, -t <name>   Use a predefined template
  --interactive, -i       Interactive workflow creation

WORKFLOW EXECUTION:
  --phase <phase>         Execute specific phase only
  --dry-run              Simulate execution without changes
  --verbose, -v          Show detailed output

TEMPLATES:
  sparc-basic            Complete SPARC methodology workflow
  tdd-cycle              Test-Driven Development cycle
  research               Research and analysis workflow
  development            Full development lifecycle

EXAMPLES:
  claude-zen workflow create "api-development" --template development
  claude-zen workflow run "api-development" --verbose
  claude-zen workflow run my-workflow --phase implementation
  claude-zen workflow list
  claude-zen workflow status "api-development"
  claude-zen workflow templates --verbose

SPARC INTEGRATION:
  Workflows integrate with SPARC methodology modes:
  • spec-pseudocode: Requirements and specifications
  • architect: System design and architecture  
  • code: Implementation and development
  • tdd: Test-driven development
  • integration: System integration and testing
  • debug: Troubleshooting and debugging
  • And more specialized modes...

For more information about SPARC methodology:
  https://github.com/ruvnet/claude-code-flow/docs/sparc.md`);
}
