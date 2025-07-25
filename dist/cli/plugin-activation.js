/**
 * Plugin Activation System - Global initialization of enterprise plugins
 * This file handles the activation and registration of all valuable plugins
 */

import { PluginManager } from '../plugins/plugin-manager.js';

// All plugins are imported dynamically to handle missing ones gracefully

// Global plugin manager instance
let globalPluginManager = null;

/**
 * Initialize and activate all enterprise plugins
 */
export async function initializePlugins(config = {}) {
  if (globalPluginManager) {
    console.log('🔌 Plugin system already initialized');
    return globalPluginManager;
  }

  console.log('🚀 Initializing Claude Zen Plugin System...');
  
  try {
    // Create plugin manager with enhanced configuration
    globalPluginManager = new PluginManager({
      pluginDir: './src/plugins',
      autoLoad: true,
      errorHandling: 'graceful', // Continue loading even if some plugins fail
      ...config
    });

    // Register core plugins in priority order
    await registerCorePlugins(globalPluginManager, config);
    
    // Load all registered plugins
    await globalPluginManager.loadAll();
    
    // Display activation summary
    displayActivationSummary(globalPluginManager);
    
    return globalPluginManager;
    
  } catch (error) {
    console.error('❌ Plugin system initialization failed:', error.message);
    throw error;
  }
}

/**
 * Register core enterprise plugins
 */
async function registerCorePlugins(pluginManager, config) {
  // Define plugins with their import paths and configurations
  const pluginDefinitions = [
    // 1. Memory Backend - LanceDB integration (CRITICAL)
    {
      name: 'memory-backend',
      importPath: '../plugins/memory-backend/index.js',
      className: 'MemoryBackendPlugin',
      config: {
        backend: 'lance', // Use LanceDB as requested
        path: './memory',
        lanceConfig: {
          persistDirectory: './.hive-mind/memory/lance_db',
          collection: 'claude_zen_memory'
        },
        enabled: true,
        priority: 1
      }
    },

    // 2. Unified Interface - React/Ink TUI + Web UI (HIGH PRIORITY)
    {
      name: 'unified-interface',
      importPath: '../plugins/unified-interface/index.js',
      className: 'UnifiedInterfacePlugin',
      config: {
        defaultMode: 'auto',
        webPort: 3030, // Use different port to avoid conflicts
        webSocketPort: 3031,
        theme: 'dark',
        autoRefresh: true,
        enabled: true,
        priority: 2
      }
    },

    // 3. GitHub Integration - Enterprise repository management (HIGH PRIORITY)
    {
      name: 'github-integration',
      importPath: '../plugins/github-integration/index.js',
      className: 'GitHubIntegrationPlugin',
      config: {
        token: process.env.GITHUB_TOKEN,
        analysisDepth: 'standard',
        cacheTTL: 300000,
        enabled: !!process.env.GITHUB_TOKEN, // Only enable if token available
        priority: 3
      }
    },

    // 4. Security & Auth - Enterprise security (HIGH PRIORITY)
    {
      name: 'security-auth',
      importPath: '../plugins/security-auth/index.js',
      className: 'SecurityAuthPlugin',
      config: {
        enabled: true,
        priority: 4
      }
    },

    // 5. Workflow Engine - Advanced workflow automation (MEDIUM PRIORITY)
    {
      name: 'workflow-engine',
      importPath: '../plugins/workflow-engine/index.js',
      className: 'WorkflowEnginePlugin',
      config: {
        enabled: true,
        priority: 5
      }
    },

    // 6. AI Providers - Multiple AI provider support (MEDIUM PRIORITY)
    {
      name: 'ai-providers',
      importPath: '../plugins/ai-providers/index.js',
      className: 'default', // Default export
      config: {
        enabled: true,
        priority: 6
      }
    },

    // 7. Architect Advisor - System architecture guidance (MEDIUM PRIORITY) 
    {
      name: 'architect-advisor',
      importPath: '../plugins/architect-advisor/index.js',
      className: 'default', // Default export
      config: {
        enabled: true,
        priority: 7
      }
    },

    // 8. Notifications - Enterprise notification system (LOW PRIORITY)
    {
      name: 'notifications',
      importPath: '../plugins/notifications/index.js',
      className: 'default', // Default export
      config: {
        enabled: true,
        priority: 8
      }
    },

    // 9. Export System - Data export capabilities (LOW PRIORITY)
    {
      name: 'export-system',
      importPath: '../plugins/export-system/index.js',
      className: 'default', // Default export
      config: {
        enabled: true,
        priority: 9
      }
    },

    // 10. Documentation Linker - Smart documentation (LOW PRIORITY)
    {
      name: 'documentation-linker',
      importPath: '../plugins/documentation-linker/index.js',
      className: 'default', // Default export
      config: {
        enabled: true,
        priority: 10
      }
    }
  ];

  // Register plugins in priority order with dynamic imports
  for (const plugin of pluginDefinitions) {
    try {
      console.log(`📦 Registering plugin: ${plugin.name}`);
      
      // Dynamic import with error handling
      const module = await import(plugin.importPath);
      let PluginClass;
      
      if (plugin.className === 'default') {
        PluginClass = module.default;
      } else {
        PluginClass = module[plugin.className];
      }
      
      if (!PluginClass) {
        throw new Error(`Plugin class '${plugin.className}' not found in ${plugin.importPath}`);
      }
      
      await pluginManager.registerPlugin(plugin.name, PluginClass, plugin.config);
      
    } catch (error) {
      console.warn(`⚠️ Failed to register plugin '${plugin.name}': ${error.message}`);
      
      // Continue with other plugins even if one fails
      if (config.strictMode) {
        throw error;
      }
    }
  }
}

/**
 * Display plugin activation summary
 */
function displayActivationSummary(pluginManager) {
  const status = pluginManager.getStatus();
  
  console.log('\n🎯 Plugin Activation Summary:');
  console.log(`📊 Total Registered: ${status.registered}`);
  console.log(`✅ Successfully Loaded: ${status.loaded}`);
  console.log(`🔌 Enabled: ${status.enabled}`);
  
  if (status.loaded > 0) {
    console.log('\n✅ Active Plugins:');
    status.plugins
      .filter(p => p.loaded)
      .forEach(plugin => {
        console.log(`  🟢 ${plugin.name} (${plugin.class})`);
      });
  }
  
  const failedPlugins = status.plugins.filter(p => p.enabled && !p.loaded);
  if (failedPlugins.length > 0) {
    console.log('\n⚠️ Failed to Load:');
    failedPlugins.forEach(plugin => {
      console.log(`  🔴 ${plugin.name}`);
    });
  }
  
  console.log('');
}

/**
 * Get the global plugin manager instance
 */
export function getPluginManager() {
  if (!globalPluginManager) {
    throw new Error('Plugin system not initialized. Call initializePlugins() first.');
  }
  return globalPluginManager;
}

/**
 * Get a specific plugin instance
 */
export function getPlugin(name) {
  const manager = getPluginManager();
  return manager.getPlugin(name);
}

/**
 * Check if a plugin is loaded
 */
export function isPluginLoaded(name) {
  const manager = getPluginManager();
  return manager.isLoaded(name);
}

/**
 * Register plugin commands with the command registry
 */
export function registerPluginCommands(commandRegistry) {
  const manager = getPluginManager();
  
  // Check each plugin for command registration capability
  for (const [pluginName, plugin] of manager.loadedPlugins) {
    if (plugin.registerCommands && typeof plugin.registerCommands === 'function') {
      try {
        console.log(`🔧 Registering commands for plugin: ${pluginName}`);
        plugin.registerCommands(commandRegistry);
      } catch (error) {
        console.warn(`⚠️ Failed to register commands for plugin '${pluginName}': ${error.message}`);
      }
    }
  }
}

/**
 * Graceful shutdown of all plugins
 */
export async function shutdownPlugins() {
  if (!globalPluginManager) {
    return;
  }
  
  console.log('🔌 Shutting down plugin system...');
  
  const loadedPlugins = Array.from(globalPluginManager.loadedPlugins.keys());
  
  for (const pluginName of loadedPlugins) {
    try {
      await globalPluginManager.unloadPlugin(pluginName);
      console.log(`✅ Unloaded plugin: ${pluginName}`);
    } catch (error) {
      console.warn(`⚠️ Error unloading plugin '${pluginName}': ${error.message}`);
    }
  }
  
  globalPluginManager = null;
  console.log('🔌 Plugin system shutdown complete');
}

/**
 * Plugin health check
 */
export async function checkPluginHealth() {
  const manager = getPluginManager();
  const status = manager.getStatus();
  const health = {
    overall: 'healthy',
    plugins: {},
    summary: {
      total: status.registered,
      loaded: status.loaded,
      failed: status.registered - status.loaded,
      loadRate: (status.loaded / status.registered * 100).toFixed(1)
    }
  };
  
  // Check individual plugin health
  for (const plugin of status.plugins) {
    const pluginHealth = {
      status: plugin.loaded ? 'loaded' : 'failed',
      enabled: plugin.enabled,
      class: plugin.class
    };
    
    // If plugin has health check method, call it
    if (plugin.loaded) {
      const instance = manager.getPlugin(plugin.name);
      if (instance && instance.getHealth && typeof instance.getHealth === 'function') {
        try {
          pluginHealth.details = await instance.getHealth();
        } catch (error) {
          pluginHealth.status = 'unhealthy';
          pluginHealth.error = error.message;
        }
      }
    }
    
    health.plugins[plugin.name] = pluginHealth;
  }
  
  // Determine overall health
  const failedCount = status.registered - status.loaded;
  if (failedCount > status.registered / 2) {
    health.overall = 'critical';
  } else if (failedCount > 0) {
    health.overall = 'degraded';
  }
  
  return health;
}

// Handle process shutdown
process.on('SIGINT', shutdownPlugins);
process.on('SIGTERM', shutdownPlugins);
process.on('exit', shutdownPlugins);

export default {
  initializePlugins,
  getPluginManager,
  getPlugin,
  isPluginLoaded,
  registerPluginCommands,
  shutdownPlugins,
  checkPluginHealth
};