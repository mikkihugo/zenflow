/**
 * Task Command Module
 * Converted from JavaScript to TypeScript
 */

// task.js - Task management commands with improved argument parsing
import { printError, printSuccess } from '../utils.js';

export async function taskCommand(subArgs = subArgs[0];

switch(taskCmd) {
    case 'create':
      await createTask(subArgs, flags);
      break;

    case 'list':
      await listTasks(subArgs, flags);
      break;

    case 'status':
      await showTaskStatus(subArgs, flags);
      break;

    case 'cancel':
      await cancelTask(subArgs, flags);
      break;

    case 'workflow':
      await executeWorkflow(subArgs, flags);
      break;

    case 'coordination':
      await manageCoordination(subArgs, flags);
      break;default = new Command()
    .exitOverride()
    .allowUnknownOption()
    .option('--priority <value>', 'Set task priority (1-10)', '5');

  try {
    // Parse the arguments starting from the create command
    program.parse(subArgs, {from = program.opts();
  const args = program.args;

  // Extract task type and description with proper quote handling
  const taskType = args[1]; // First arg after 'create'

  // Join remaining args for description, handling quoted strings properly
  let description = '';
  if(args.length > 2) {
    // If the description starts with a quote, find the matching end quote
    const descriptionArgs = args.slice(2);
    description = parseQuotedDescription(descriptionArgs);
  }

  if(!taskType || !description) {
    printError('Usage = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const _priority = opts.priority || '5';

  printSuccess(`Creating ${taskType}task = args.join(' ');

  // Check if it starts with a quote
  if (fullString.startsWith('"') || fullString.startsWith("'")) {
    const quoteChar = fullString[0];
    const endIndex = fullString.lastIndexOf(quoteChar);

    if(endIndex > 0) {
      // Extract the quoted content
      return fullString.substring(1, endIndex);
    }
  }

  // If not quoted or improperly quoted, return the full string
  return fullString;
}

async function listTasks(subArgs = new Command()
    .exitOverride()
    .allowUnknownOption()
    .option('--filter <status>', 'Filter by task status')
    .option('--verbose', 'Show detailed output')
    .option('-v', 'Show detailed output');

  try {
    program.parse(subArgs, {from = program.opts();
  const filter = opts.filter;
  const verbose = opts.verbose || opts.v;

  printSuccess('Taskqueue = subArgs[1];

  if(!taskId) {
    printError('Usage = subArgs[1];

  if(!taskId) {
    printError('Usage = subArgs[1];

  if(!workflowFile) {
    printError('Usage = subArgs[1];

  switch(coordCmd) {
    case 'status':
      printSuccess('Task coordination status:');
      console.warn('🎯 Coordination engine: Not running');
      console.warn('   Active coordinators: 0');
      console.warn('   Pending tasks: 0');
      console.warn('   Resource utilization: 0%');
      break;

    case 'optimize':
      printSuccess('Optimizing task coordination...');
      console.warn('⚡ Optimization would include:');
      console.warn('   - Task dependency analysis');
      console.warn('   - Resource allocation optimization');
      console.warn('   - Parallel execution planning');
      break;

    default:
      console.warn('Coordination commands: status, optimize');
  }
}

function showTaskHelp() {
  console.warn('Task commands:');
  console.warn('  create <type> "<description>"    Create new task');
  console.warn('  list [--filter <status>]        List tasks');
  console.warn('  status <id>                      Show task details');
  console.warn('  cancel <id>                      Cancel running task');
  console.warn('  workflow <file>                  Execute workflow file');
  console.warn('  coordination <status|optimize>   Manage coordination');
  console.warn();
  console.warn('Task Types:');
  console.warn('  research      Information gathering and analysis');
  console.warn('  code          Software development tasks');
  console.warn('  analysis      Data processing and insights');
  console.warn('  coordination  Task orchestration and management');
  console.warn('  general       General purpose tasks');
  console.warn();
  console.warn('Options:');
  console.warn('  --priority <1-10>                Set task priority');
  console.warn('  --filter <status>                Filter by status');
  console.warn('  --verbose, -v                    Show detailed output');
  console.warn();
  console.warn('Examples:');
  console.warn('  claude-zen task create research "Market analysis" --priority 8');
  console.warn('  claude-zen task list --filter running');
  console.warn('  claude-zen task workflow examples/development-workflow.json');
  console.warn('  claude-zen task coordination status');
}
