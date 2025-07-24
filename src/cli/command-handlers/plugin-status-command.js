/**
 * Plugin Status Command - Check plugin system health and status
 */

import { getPluginManager, checkPluginHealth, isPluginLoaded } from '../plugin-activation.js';

export async function pluginStatusCommand(args = [], flags = {}) {
  const subcommand = args[0] || 'status';

  switch (subcommand) {
    case 'status':
    case 'list':
      return await showPluginStatus(flags);
    
    case 'health':
      return await showPluginHealth(flags);
    
    case 'info':
      return await showPluginInfo(args[1], flags);
    
    case 'enable':
      return await enablePlugin(args[1], flags);
    
    case 'disable':
      return await disablePlugin(args[1], flags);
    
    case 'restart':
      return await restartPlugin(args[1], flags);
    
    default:
      console.error(`❌ Unknown plugin subcommand: ${subcommand}`);
      console.log('Available subcommands: status, health, info, enable, disable, restart');
      process.exit(1);
  }
}

async function showPluginStatus(flags) {
  try {
    const manager = getPluginManager();
    const status = manager.getStatus();
    
    console.log('🔌 Plugin System Status\n');
    console.log(`📊 Overview:`);
    console.log(`   Total Registered: ${status.registered}`);
    console.log(`   Successfully Loaded: ${status.loaded}`);
    console.log(`   Enabled: ${status.enabled}`);
    console.log(`   Load Success Rate: ${((status.loaded / status.registered) * 100).toFixed(1)}%\n`);
    
    if (flags.verbose || flags.v) {
      console.log('📋 Plugin Details:\n');
      
      // Group plugins by status
      const loadedPlugins = status.plugins.filter(p => p.loaded);
      const failedPlugins = status.plugins.filter(p => p.enabled && !p.loaded);
      const disabledPlugins = status.plugins.filter(p => !p.enabled);
      
      if (loadedPlugins.length > 0) {
        console.log('✅ Loaded Plugins:');
        loadedPlugins.forEach(plugin => {
          console.log(`   🟢 ${plugin.name.padEnd(20)} (${plugin.class})`);
        });
        console.log('');
      }
      
      if (failedPlugins.length > 0) {
        console.log('⚠️ Failed to Load:');
        failedPlugins.forEach(plugin => {
          console.log(`   🔴 ${plugin.name.padEnd(20)} (${plugin.class})`);
        });
        console.log('');
      }
      
      if (disabledPlugins.length > 0) {
        console.log('🔇 Disabled Plugins:');
        disabledPlugins.forEach(plugin => {
          console.log(`   ⚪ ${plugin.name.padEnd(20)} (${plugin.class})`);
        });
        console.log('');
      }
    } else {
      console.log('💡 Use --verbose for detailed plugin information');
    }
    
    // Show quick stats for key plugins
    const keyPlugins = ['memory-backend', 'unified-interface', 'github-integration'];
    const keyPluginStatus = keyPlugins.map(name => ({
      name,
      loaded: isPluginLoaded(name)
    }));
    
    console.log('🎯 Key Plugin Status:');
    keyPluginStatus.forEach(({ name, loaded }) => {
      const status = loaded ? '✅' : '❌';
      console.log(`   ${status} ${name}`);
    });
    
  } catch (error) {
    console.error('❌ Plugin system not initialized or error occurred:', error.message);
    console.log('\n💡 Try running a command to initialize the plugin system first');
  }
}

async function showPluginHealth(flags) {
  try {
    const health = await checkPluginHealth();
    
    console.log('🏥 Plugin Health Check\n');
    
    // Overall health
    const healthEmoji = {
      'healthy': '💚',
      'degraded': '💛', 
      'critical': '❤️'
    };
    
    console.log(`${healthEmoji[health.overall]} Overall Status: ${health.overall.toUpperCase()}\n`);
    
    // Summary stats
    console.log('📊 Health Summary:');
    console.log(`   Total Plugins: ${health.summary.total}`);
    console.log(`   Loaded: ${health.summary.loaded}`);
    console.log(`   Failed: ${health.summary.failed}`);
    console.log(`   Load Rate: ${health.summary.loadRate}%\n`);
    
    // Individual plugin health
    if (flags.verbose || flags.v) {
      console.log('🔍 Individual Plugin Health:\n');
      
      for (const [pluginName, pluginHealth] of Object.entries(health.plugins)) {
        const statusEmoji = pluginHealth.status === 'loaded' ? '🟢' : 
                           pluginHealth.status === 'failed' ? '🔴' : '⚪';
        
        console.log(`${statusEmoji} ${pluginName.padEnd(20)} - ${pluginHealth.status}`);
        
        if (pluginHealth.details) {
          console.log(`     └─ ${JSON.stringify(pluginHealth.details, null, 2).replace(/\n/g, '\n     ')}`);
        }
        
        if (pluginHealth.error) {
          console.log(`     └─ Error: ${pluginHealth.error}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function showPluginInfo(pluginName, flags) {
  if (!pluginName) {
    console.error('❌ Plugin name required');
    console.log('Usage: plugin info <plugin-name>');
    return;
  }
  
  try {
    const manager = getPluginManager();
    const plugin = manager.getPlugin(pluginName);
    
    if (!plugin) {
      console.error(`❌ Plugin '${pluginName}' not found or not loaded`);
      return;
    }
    
    console.log(`🔌 Plugin Information: ${pluginName}\n`);
    console.log(`📦 Class: ${plugin.constructor.name}`);
    console.log(`✅ Status: Loaded and Active`);
    
    // Show plugin capabilities if available
    if (plugin.getCapabilities && typeof plugin.getCapabilities === 'function') {
      try {
        const capabilities = await plugin.getCapabilities();
        console.log(`🚀 Capabilities: ${capabilities.join(', ')}`);
      } catch (error) {
        // Ignore capability errors
      }
    }
    
    // Show plugin configuration if available
    if (plugin.config) {
      console.log('\n⚙️ Configuration:');
      console.log(JSON.stringify(plugin.config, null, 2));
    }
    
    // Show plugin stats if available
    if (plugin.getStats && typeof plugin.getStats === 'function') {
      try {
        const stats = await plugin.getStats();
        console.log('\n📊 Statistics:');
        console.log(JSON.stringify(stats, null, 2));
      } catch (error) {
        console.log(`⚠️ Could not retrieve stats: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error getting plugin info:', error.message);
  }
}

async function enablePlugin(pluginName, flags) {
  console.log(`🔌 Enable plugin functionality not yet implemented for: ${pluginName}`);
  console.log('💡 Plugins are currently enabled/disabled through configuration');
}

async function disablePlugin(pluginName, flags) {
  console.log(`🔇 Disable plugin functionality not yet implemented for: ${pluginName}`);
  console.log('💡 Plugins are currently enabled/disabled through configuration');
}

async function restartPlugin(pluginName, flags) {
  try {
    const manager = getPluginManager();
    
    console.log(`🔄 Restarting plugin: ${pluginName}`);
    
    // Unload the plugin
    await manager.unloadPlugin(pluginName);
    console.log(`📤 Unloaded: ${pluginName}`);
    
    // Reload the plugin
    await manager.loadPlugin(pluginName);
    console.log(`📥 Reloaded: ${pluginName}`);
    
    console.log(`✅ Successfully restarted plugin: ${pluginName}`);
    
  } catch (error) {
    console.error(`❌ Failed to restart plugin '${pluginName}': ${error.message}`);
  }
}

// Export the configuration for the command registry
export const pluginStatusCommandConfig = {
  handler: pluginStatusCommand,
  description: 'Plugin system status and management',
  usage: 'plugin <subcommand> [options]',
  examples: [
    'plugin status',
    'plugin status --verbose',
    'plugin health',
    'plugin info memory-backend',
    'plugin restart unified-interface'
  ],
  details: `
Plugin Management Commands:
  status                     Show plugin system overview
  health                     Run comprehensive health check
  info <plugin-name>         Show detailed plugin information
  restart <plugin-name>      Restart a specific plugin
  
Status Options:
  --verbose, -v              Show detailed plugin information
  
Health Check:
  • Overall system health assessment
  • Individual plugin health status
  • Load success rate analysis
  • Error diagnosis and recommendations

Key Plugins:
  memory-backend            LanceDB vector database integration
  unified-interface         React/Ink TUI + Web interface
  github-integration        GitHub repository management
  security-auth             Enterprise security features
  workflow-engine           Advanced workflow automation

The plugin system provides enterprise-grade extensibility with graceful
error handling and comprehensive monitoring capabilities.`
};

export default pluginStatusCommand;