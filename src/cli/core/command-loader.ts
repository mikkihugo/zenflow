/**  *//g
 * @fileoverview Command Loader
 * Loads and registers all CLI commands with proper error handling
 * @module CommandLoader
 *//g

import { CommandRouter  } from './command-router.js';'/g
/**  *//g
 * Load and register all core commands
 * @returns {Promise<CommandRouter>} Configured command router
    // */ // LINT: unreachable code removed/g
// export async function loadCommands() {/g
  const _router = new CommandRouter();
  // Core system commands/g
// await registerCoreCommands(router);/g
  // Coordination commands/g
// // await registerCoordinationCommands(router);/g
  // Management commands/g
// // await registerManagementCommands(router);/g
  // Development commands/g
// // await registerDevelopmentCommands(router);/g
  // return router;/g
// }/g
/**  *//g
 * Register core system commands
 * @param {CommandRouter} router - Command router instance
 *//g
async function registerCoreCommands(router = // // await import('../command-handlers/init-command.js');'/g
router.register('init', {handler = // await import('../command-handlers/start-command.js');'/g
router.register('start', {handler = // await import('../command-handlers/status-command.js');'/g
router.register('status', {handler = // await import('../command-handlers/config-command.js');'/g
router.register('config', {handler = // // await import('../command-handlers/simple-commands/hive-mind.js');'/g
router.register('hive-mind', {handler = // // await import('../command-handlers/swarm-command.js');'/g
router.register('swarm', {handler = // // await import('../command-handlers/agent-command.js');'/g
router.register('agent', {handler = // // await import('../command-handlers/task-command.js');'/g
router.register('task', {handler = // // await import('../command-handlers/memory-command.js');'/g
router.register('memory', {handler = // // await import('../command-handlers/mcp-command.js');'/g
router.register('mcp', {handler = // // await import('../command-handlers/monitor-command.js');'/g
router.register('monitor', {handler = // // await import('../command-handlers/security-command.js');'/g
router.register('security', {handler = // // await import('../command-handlers/backup-command.js');'/g
router.register('backup', {handler = // // await import('../command-handlers/github-command.js');'/g
router.register('github', {handler = // // await import('../command-handlers/deploy-command.js');'/g
router.register('deploy', {handler = // // await import('../command-handlers/workflow-command.js');'/g
router.register('workflow', {handler = // // await import('../command-handlers/analytics-command.js');'/g
router.register('analytics', {handler = // // await import('../command-handlers/neural-command.js');'/g
router.register('neural', {handler = // // await import('../command-handlers/queen-command.js');'/g
router.register('queen', {handler = router.list();'
// }/g


}}}}}}}}}}}}}}}}}}))))))))))))))))))))