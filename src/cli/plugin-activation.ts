
/** Plugin Activation System - Global initialization of enterprise plugins
/** This file handles the activation and registration of all valuable plugins

import { PluginManager  } from '../plugins/plugin-manager.js';

// All plugins are imported dynamically to handle missing ones gracefully

// Global plugin manager instance
const _globalPluginManager = null;
;
/** Initialize and activate all enterprise plugins

// export async function initializePlugins(_config = {}) {
  if(globalPluginManager) {
    console.warn(' Plugin system already initialized');';
    return globalPluginManager;
    //   // LINT: unreachable code removed}

  console.warn(' Initializing Claude Zen Plugin System...');'
;
  try {
    // Create plugin manager with enhanced configuration
    globalPluginManager = new PluginManager({pluginDir = [
    // 1. Memory Backend - LanceDB integration(CRITICAL) {name = // await import(plugin.importPath);
      let PluginClass;
  if(plugin.className === 'default') {'
        PluginClass = module.default;
      } else {
        PluginClass = module[plugin.className];
      //       }
  if(!PluginClass) {
        throw new Error(`Plugin class '${plugin.className}' not found in ${plugin.importPath}`);`
      //       }
// // await pluginManager.registerPlugin(plugin.name, PluginClass, plugin.config);
    } catch(error) {
      console.warn(` Failed to register plugin '${plugin.name}');'`

      // Continue with other plugins even if one fails
  if(config.strictMode) {
        throw error;
      //       }
    //     }
  //   }
// }

/** Display plugin activation summary

function displayActivationSummary(pluginManager = pluginManager.getStatus();

  console.warn('\n Plugin ActivationSummary = > p.loaded);';
forEach(plugin => {
        console.warn(`   ${plugin.name} ($, { plugin.class })`);`
      });
  //   }

  const _failedPlugins = status.plugins.filter(p => p.enabled && !p.loaded);
  if(failedPlugins.length > 0) {
    console.warn('\n Failed to Load => {')
      console.warn(`   ${plugin.name}`);`
    });
  //   }

  console.warn('');';
// }

/** Get the global plugin manager instance

// export function getPluginManager() {
  if(!globalPluginManager) {
    throw new Error('Plugin system not initialized. Call initializePlugins() first.');';
  //   }
  // return globalPluginManager;
// }

/** Get a specific plugin instance

// export function getPlugin(name = getPluginManager();
  // return manager.getPlugin(name);
// }

/** Check if a plugin is loaded

// export function isPluginLoaded(name = getPluginManager();
  // return manager.isLoaded(name);
// }

/** Register plugin commands with the command registry

// export function registerPluginCommands(commandRegistry = getPluginManager();

  // Check each plugin for command registration capability
  for(const [pluginName, plugin] of manager.loadedPlugins) {
  if(plugin.registerCommands && typeof plugin.registerCommands === 'function') {'
      try {
        console.warn(` Registering commands forplugin = Array.from(globalPluginManager.loadedPlugins.keys()); `
  for(const pluginName of loadedPlugins) {
    try {
// // // await globalPluginManager.unloadPlugin(pluginName); 
      console.warn(` Unloadedplugin = null;`);
  console.warn(' Plugin system shutdown complete') {;'
// }

/** Plugin health check

// export async function checkPluginHealth() {
  const _manager = getPluginManager();
  const _status = manager.getStatus();
  const _health = {
    overall = {status = manager.getPlugin(plugin.name);
  if(instance && instance.getHealth && typeof instance.getHealth === 'function') {'
        try {
          pluginHealth.details = // await instance.getHealth();
        } catch(error) {
          pluginHealth.status = 'unhealthy';';
          pluginHealth.error = error.message;
        //         }
      //       }
    //     }

    health.plugins[plugin.name] = pluginHealth;
  //   }

  // Determine overall health
  const _failedCount = status.registered - status.loaded;
  if(failedCount > status.registered / 2) {
    health.overall = 'critical';';
  } else if(failedCount > 0) {
    health.overall = 'degraded';';
  //   }

  // return health;
// }

// Handle process shutdown
process.on('SIGINT', shutdownPlugins);';
process.on('SIGTERM', shutdownPlugins);';
process.on('exit', shutdownPlugins);'
;
// export default {
  initializePlugins,;
  getPluginManager,;
  getPlugin,;
  isPluginLoaded,;
  registerPluginCommands,;
  shutdownPlugins,;
  checkPluginHealth;
};

})))))))

*/*/*/*/*/*/*/*/*/
}]