/**
 * @fileoverview Command Loader;
 * Loads and registers all CLI commands with proper error handling;
 * @module CommandLoader;
 */

import { CommandRouter } from './command-router.js';
/**
 * Load and register all core commands;
 * @returns {Promise<CommandRouter>} Configured command router;
    // */ // LINT: unreachable code removed
export async function loadCommands() {
  const _router = new CommandRouter();
  // Core system commands
// await registerCoreCommands(router);
  // Coordination commands
// await registerCoordinationCommands(router);
  // Management commands
// await registerManagementCommands(router);
  // Development commands
// await registerDevelopmentCommands(router);
  return router;
// }
/**
 * Register core system commands;
 * @param {CommandRouter} router - Command router instance;
 */
async function registerCoreCommands(router = await import('../command-handlers/init-command.js');
router.register('init', {handler = await import('../command-handlers/start-command.js');
router.register('start', {handler = await import('../command-handlers/status-command.js');
router.register('status', {handler = await import('../command-handlers/config-command.js');
router.register('config', {handler = await import('../command-handlers/simple-commands/hive-mind.js');
router.register('hive-mind', {handler = await import('../command-handlers/swarm-command.js');
router.register('swarm', {handler = await import('../command-handlers/agent-command.js');
router.register('agent', {handler = await import('../command-handlers/task-command.js');
router.register('task', {handler = await import('../command-handlers/memory-command.js');
router.register('memory', {handler = await import('../command-handlers/mcp-command.js');
router.register('mcp', {handler = await import('../command-handlers/monitor-command.js');
router.register('monitor', {handler = await import('../command-handlers/security-command.js');
router.register('security', {handler = await import('../command-handlers/backup-command.js');
router.register('backup', {handler = await import('../command-handlers/github-command.js');
router.register('github', {handler = await import('../command-handlers/deploy-command.js');
router.register('deploy', {handler = await import('../command-handlers/workflow-command.js');
router.register('workflow', {handler = await import('../command-handlers/analytics-command.js');
router.register('analytics', {handler = await import('../command-handlers/neural-command.js');
router.register('neural', {handler = await import('../command-handlers/queen-command.js');
router.register('queen', {handler = router.list();
// }

