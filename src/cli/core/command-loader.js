/**
 * @fileoverview Command Loader
 * Loads and registers all CLI commands with proper error handling
 * @module CommandLoader
 */

import { CommandRouter } from './command-router.js';

/**
 * Load and register all core commands
 * @returns {Promise<CommandRouter>} Configured command router
 */
export async function loadCommands() {
  const router = new CommandRouter();

  // Core system commands
  await registerCoreCommands(router);
  
  // Coordination commands  
  await registerCoordinationCommands(router);
  
  // Management commands
  await registerManagementCommands(router);
  
  // Development commands
  await registerDevelopmentCommands(router);

  return router;
}

/**
 * Register core system commands
 * @param {CommandRouter} router - Command router instance
 */
async function registerCoreCommands(router) {
  // Init command
  const { initCommand } = await import('../command-handlers/init-command.js');
  router.register('init', {
    handler: initCommand,
    description: 'Initialize Claude Zen project',
    usage: 'init [directory] [options]',
    examples: ['init', 'init my-project', 'init --force']
  });

  // Start command
  const { startCommand } = await import('../command-handlers/start-command.js');
  router.register('start', {
    handler: startCommand,
    description: 'Start the Claude-Flow orchestration system',
    usage: 'start [options]',
    examples: ['start', 'start --daemon', 'start --port 8080']
  });

  // Status command
  const { statusCommand } = await import('../command-handlers/status-command.js');
  router.register('status', {
    handler: statusCommand,
    description: 'Show system status and health',
    usage: 'status [options]',
    examples: ['status', 'status --verbose']
  });

  // Config command
  const { configCommand } = await import('../command-handlers/config-command.js');
  router.register('config', {
    handler: configCommand,
    description: 'Manage system configuration',
    usage: 'config [action] [options]',
    examples: ['config list', 'config set key value', 'config get key']
  });
}

/**
 * Register coordination commands
 * @param {CommandRouter} router - Command router instance
 */
async function registerCoordinationCommands(router) {
  // Hive Mind command
  const { handleHiveMindCommand } = await import('../command-handlers/simple-commands/hive-mind-refactored.js');
  router.register('hive-mind', {
    handler: handleHiveMindCommand,
    description: 'Advanced Hive Mind swarm intelligence',
    usage: 'hive-mind [subcommand] [options]',
    examples: ['hive-mind init', 'hive-mind spawn "Build API"', 'hive-mind status']
  });

  // Swarm command (alias)
  const { swarmCommand } = await import('../command-handlers/swarm-command.js');
  router.register('swarm', {
    handler: swarmCommand,
    description: 'Launch temporary swarm coordination',
    usage: 'swarm <objective> [options]',
    examples: ['swarm "Build REST API"', 'swarm "Create UI" --topology mesh'],
    aliases: ['sw']
  });

  // Agent command
  const { agentCommand } = await import('../command-handlers/agent-command.js');
  router.register('agent', {
    handler: agentCommand,
    description: 'Manage AI agents and hierarchies',
    usage: 'agent [action] [options]',
    examples: ['agent list', 'agent spawn --type researcher', 'agent metrics']
  });

  // Task command
  const { taskCommand } = await import('../command-handlers/task-command.js');
  router.register('task', {
    handler: taskCommand,
    description: 'Manage tasks and workflows',
    usage: 'task [action] [options]',
    examples: ['task list', 'task create "Build feature"', 'task status <id>']
  });
}

/**
 * Register management commands
 * @param {CommandRouter} router - Command router instance
 */
async function registerManagementCommands(router) {
  // Memory command
  const { memoryCommand } = await import('../command-handlers/memory-command.js');
  router.register('memory', {
    handler: memoryCommand,
    description: 'Memory management operations',
    usage: 'memory [action] [options]',
    examples: ['memory list', 'memory store key value', 'memory search pattern']
  });

  // MCP command
  const { mcpCommand } = await import('../command-handlers/mcp-command.js');
  router.register('mcp', {
    handler: mcpCommand,
    description: 'Manage MCP server and tools',
    usage: 'mcp [action] [options]',
    examples: ['mcp start', 'mcp status', 'mcp tools']
  });

  // Monitor command
  const { monitorCommand } = await import('../command-handlers/monitor-command.js');
  router.register('monitor', {
    handler: monitorCommand,
    description: 'Real-time system monitoring',
    usage: 'monitor [options]',
    examples: ['monitor', 'monitor --interval 5', 'monitor --metrics cpu,memory']
  });

  // Security command
  const { securityCommand } = await import('../command-handlers/security-command.js');
  router.register('security', {
    handler: securityCommand,
    description: 'Enterprise security management',
    usage: 'security [action] [options]',
    examples: ['security scan', 'security policies', 'security audit']
  });

  // Backup command
  const { backupCommand } = await import('../command-handlers/backup-command.js');
  router.register('backup', {
    handler: backupCommand,
    description: 'Data backup and disaster recovery',
    usage: 'backup [action] [options]',
    examples: ['backup create', 'backup restore <id>', 'backup list']
  });
}

/**
 * Register development commands
 * @param {CommandRouter} router - Command router instance
 */
async function registerDevelopmentCommands(router) {
  // GitHub command
  const { githubCommand } = await import('../command-handlers/github-command.js');
  router.register('github', {
    handler: githubCommand,
    description: 'GitHub workflow automation',
    usage: 'github [action] [options]',
    examples: ['github issues', 'github pr create', 'github workflow run']
  });

  // Deploy command
  const { deployCommand } = await import('../command-handlers/deploy-command.js');
  router.register('deploy', {
    handler: deployCommand,
    description: 'Deploy applications and services',
    usage: 'deploy [target] [options]',
    examples: ['deploy production', 'deploy staging --dry-run']
  });

  // Workflow command
  const { workflowCommand } = await import('../command-handlers/workflow-command.js');
  router.register('workflow', {
    handler: workflowCommand,
    description: 'Advanced workflow management',
    usage: 'workflow [action] [options]',
    examples: ['workflow create', 'workflow run <name>', 'workflow list']
  });

  // Analytics command
  const { analyticsCommand } = await import('../command-handlers/analytics-command.js');
  router.register('analytics', {
    handler: analyticsCommand,
    description: 'Performance and usage analytics',
    usage: 'analytics [report] [options]',
    examples: ['analytics performance', 'analytics usage', 'analytics export']
  });
}

/**
 * Create command help text for meow CLI
 * @param {CommandRouter} router - Command router instance
 * @returns {string} Help text
 */
export function createHelpText(router) {
  const commands = router.list();
  const sections = {
    core: [],
    coordination: [],
    management: [],
    development: []
  };

  // Categorize commands
  for (const cmd of commands) {
    if (['init', 'start', 'status', 'config'].includes(cmd.name)) {
      sections.core.push(cmd);
    } else if (['hive-mind', 'swarm', 'agent', 'task'].includes(cmd.name)) {
      sections.coordination.push(cmd);
    } else if (['memory', 'mcp', 'monitor', 'security', 'backup'].includes(cmd.name)) {
      sections.management.push(cmd);
    } else {
      sections.development.push(cmd);
    }
  }

  return `
Usage
  $ claude-zen <command> [options]

Core Commands
${formatCommandSection(sections.core)}

Coordination Commands  
${formatCommandSection(sections.coordination)}

Management Commands
${formatCommandSection(sections.management)}

Development Commands
${formatCommandSection(sections.development)}

Options
  --help              Show help information
  --version           Show version number
  --verbose           Enable verbose output
  --non-interactive   Disable interactive prompts

Examples
  claude-zen init                           # Initialize project
  claude-zen hive-mind spawn "Build API"    # Start swarm coordination
  claude-zen status --verbose              # Show detailed status
  claude-zen help <command>                # Get command-specific help
`;
}

/**
 * Format command section for help text
 * @param {Array<Object>} commands - Commands to format
 * @returns {string} Formatted section
 */
function formatCommandSection(commands) {
  return commands
    .map(cmd => `  ${cmd.name.padEnd(12)} ${cmd.description}`)
    .join('\n');
}