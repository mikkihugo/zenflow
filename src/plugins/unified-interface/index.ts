/**
 * Unified Interface Plugin
 * Provides a unified interface for plugin interactions
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class UnifiedInterfacePlugin extends BasePlugin {
  private registeredInterfaces = new Map();
  private activeConnections = new Set();

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Unified Interface Plugin initialized');
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Unified Interface Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Unified Interface Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.registeredInterfaces.clear();
    this.activeConnections.clear();
    this.context.logger.info('Unified Interface Plugin cleaned up');
  }

  registerInterface(name: string, interfaceDefinition: any): void {
    this.registeredInterfaces.set(name, {
      ...interfaceDefinition,
      registeredAt: new Date()
    });
    
    this.context.logger.info(`Interface registered: ${name}`);
    this.emit('interface-registered', { name, definition: interfaceDefinition });
  }

  unregisterInterface(name: string): void {
    if (this.registeredInterfaces.has(name)) {
      this.registeredInterfaces.delete(name);
      this.context.logger.info(`Interface unregistered: ${name}`);
      this.emit('interface-unregistered', { name });
    }
  }

  async callInterface(name: string, method: string, args: any[] = []): Promise<any> {
    const interfaceDef = this.registeredInterfaces.get(name);
    if (!interfaceDef) {
      throw new Error(`Interface '${name}' not found`);
    }

    if (!interfaceDef.methods || !interfaceDef.methods[method]) {
      throw new Error(`Method '${method}' not found in interface '${name}'`);
    }

    try {
      const result = await interfaceDef.methods[method](...args);
      this.emit('interface-call', { name, method, args, result });
      return result;
    } catch (error) {
      this.emit('interface-error', { name, method, args, error });
      throw error;
    }
  }

  getRegisteredInterfaces(): string[] {
    return Array.from(this.registeredInterfaces.keys());
  }

  getInterfaceDefinition(name: string): any {
    return this.registeredInterfaces.get(name);
  }

  createConnection(connectionId: string): any {
    const connection = {
      id: connectionId,
      createdAt: new Date(),
      lastActivity: new Date(),
      callCount: 0
    };

    this.activeConnections.add(connection);
    this.context.logger.info(`Connection created: ${connectionId}`);
    
    return {
      id: connectionId,
      call: async (interfaceName: string, method: string, args: any[] = []) => {
        connection.lastActivity = new Date();
        connection.callCount++;
        return await this.callInterface(interfaceName, method, args);
      },
      disconnect: () => {
        this.activeConnections.delete(connection);
        this.context.logger.info(`Connection closed: ${connectionId}`);
      }
    };
  }

  getConnectionStats(): any {
    return {
      totalConnections: this.activeConnections.size,
      registeredInterfaces: this.registeredInterfaces.size
    };
  }
}

export default UnifiedInterfacePlugin;