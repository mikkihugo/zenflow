/**
 * @file Client Registry.
 *
 * Core client registry to break circular dependencies.
 * Contains the main UACL class and client types without circular imports.
 */
/**
 * UACL Core Registry (extracted to break circular dependencies).
 *
 * @example
 */
export class UACLRegistry {
    static instance;
    clients = new Map();
    clientTypes = new Map();
    constructor() { }
    static getInstance() {
        if (!UACLRegistry.instance) {
            UACLRegistry.instance = new UACLRegistry();
        }
        return UACLRegistry.instance;
    }
    // Client management
    registerClient(name, client) {
        this.clients.set(name, client);
    }
    getClient(name) {
        return this.clients.get(name);
    }
    getAllClients() {
        return Array.from(this.clients.values());
    }
    // Client type management
    registerClientType(name, type) {
        this.clientTypes.set(name, type);
    }
    getClientType(name) {
        return this.clientTypes.get(name);
    }
    getAllClientTypes() {
        return Array.from(this.clientTypes.values());
    }
    // Utility methods
    hasClient(name) {
        return this.clients.has(name);
    }
    removeClient(name) {
        return this.clients.delete(name);
    }
    clear() {
        this.clients.clear();
        this.clientTypes.clear();
    }
    getStats() {
        return {
            totalClients: this.clients.size,
            totalClientTypes: this.clientTypes.size,
            clientNames: Array.from(this.clients.keys()),
            clientTypeNames: Array.from(this.clientTypes.keys()),
        };
    }
}
// Export singleton instance
export const uaclRegistry = UACLRegistry.getInstance();
