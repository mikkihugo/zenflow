/**
 * Main System Plugin Manager
 * Manages swappable components for extensibility
 */

import { EventEmitter } from 'events';
import path from 'path';

export class PluginManager extends EventEmitter {
  constructor(options = {}) {
    super();
    this.plugins = new Map();
    this.loadedPlugins = new Map();
    this.options = {
      pluginDir: options.pluginDir || './src/plugins',
      autoLoad: options.autoLoad !== false,
      ...options
    };
  }

  /**
   * Register a plugin
   */
  async registerPlugin(name, pluginClass, config = {}) {
    const plugin = {
      name,
      class: pluginClass,
      config,
      instance: null,
      loaded: false,
      enabled: config.enabled !== false
    };

    this.plugins.set(name, plugin);
    
    if (plugin.enabled && this.options.autoLoad) {
      await this.loadPlugin(name);
    }

    this.emit('pluginRegistered', { name, plugin });
    return plugin;
  }

  /**
   * Load and initialize a plugin
   */
  async loadPlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin '${name}' not found`);
    }

    if (plugin.loaded) {
      return plugin.instance;
    }

    try {
      plugin.instance = new plugin.class(plugin.config);
      
      if (plugin.instance.initialize) {
        await plugin.instance.initialize();
      }

      plugin.loaded = true;
      this.loadedPlugins.set(name, plugin.instance);
      
      this.emit('pluginLoaded', { name, instance: plugin.instance });
      return plugin.instance;
    } catch (error) {
      this.emit('pluginError', { name, error });
      throw error;
    }
  }

  /**
   * Get a loaded plugin instance
   */
  getPlugin(name) {
    return this.loadedPlugins.get(name);
  }

  /**
   * Check if plugin is loaded
   */
  isLoaded(name) {
    return this.loadedPlugins.has(name);
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(name) {
    const plugin = this.plugins.get(name);
    if (!plugin || !plugin.loaded) {
      return;
    }

    if (plugin.instance.cleanup) {
      await plugin.instance.cleanup();
    }

    plugin.loaded = false;
    plugin.instance = null;
    this.loadedPlugins.delete(name);
    
    this.emit('pluginUnloaded', { name });
  }

  /**
   * Load all registered plugins
   */
  async loadAll() {
    const promises = Array.from(this.plugins.keys())
      .filter(name => this.plugins.get(name).enabled)
      .map(name => this.loadPlugin(name).catch(err => 
        console.warn(`Failed to load plugin '${name}':`, err.message)
      ));
    
    await Promise.all(promises);
  }

  /**
   * Get plugin system status
   */
  getStatus() {
    const registered = this.plugins.size;
    const loaded = this.loadedPlugins.size;
    const enabled = Array.from(this.plugins.values())
      .filter(p => p.enabled).length;

    return {
      registered,
      loaded,
      enabled,
      plugins: Array.from(this.plugins.entries()).map(([name, plugin]) => ({
        name,
        loaded: plugin.loaded,
        enabled: plugin.enabled,
        class: plugin.class.name
      }))
    };
  }
}

export default PluginManager;