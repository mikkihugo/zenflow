/**
 * @file Client Registry.
 * 
 * Core client registry to break circular dependencies.
 * Contains the main UACL class and client types without circular imports.
 */

import type { ClientInstance, ClientType } from '../types';

/**
 * UACL Core Registry (extracted to break circular dependencies).
 *
 * @example
 */
export class UACLRegistry {
  private static instance: UACLRegistry;
  private clients = new Map<string, ClientInstance>();
  private clientTypes = new Map<string, ClientType>();

  private constructor() {}

  static getInstance(): UACLRegistry {
    if (!UACLRegistry.instance) {
      UACLRegistry.instance = new UACLRegistry();
    }
    return UACLRegistry.instance;
  }

  // Client management
  registerClient(name: string, client: ClientInstance): void {
    this.clients.set(name, client);
  }

  getClient(name: string): ClientInstance | undefined {
    return this.clients.get(name);
  }

  getAllClients(): ClientInstance[] {
    return Array.from(this.clients.values());
  }

  // Client type management
  registerClientType(name: string, type: ClientType): void {
    this.clientTypes.set(name, type);
  }

  getClientType(name: string): ClientType | undefined {
    return this.clientTypes.get(name);
  }

  getAllClientTypes(): ClientType[] {
    return Array.from(this.clientTypes.values());
  }

  // Utility methods
  hasClient(name: string): boolean {
    return this.clients.has(name);
  }

  removeClient(name: string): boolean {
    return this.clients.delete(name);
  }

  clear(): void {
    this.clients.clear();
    this.clientTypes.clear();
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      totalClientTypes: this.clientTypes.size,
      clientNames: Array.from(this.clients.keys()),
      clientTypeNames: Array.from(this.clientTypes.keys())
    };
  }
}

// Export singleton instance
export const uaclRegistry = UACLRegistry.getInstance();