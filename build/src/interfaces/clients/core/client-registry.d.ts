/**
 * @file Client Registry.
 *
 * Core client registry to break circular dependencies.
 * Contains the main UACL class and client types without circular imports.
 */
import type { ClientInstance, ClientType } from '../types.ts';
/**
 * UACL Core Registry (extracted to break circular dependencies).
 *
 * @example
 */
export declare class UACLRegistry {
    private static instance;
    private clients;
    private clientTypes;
    private constructor();
    static getInstance(): UACLRegistry;
    registerClient(name: string, client: ClientInstance): void;
    getClient(name: string): ClientInstance | undefined;
    getAllClients(): ClientInstance[];
    registerClientType(name: string, type: ClientType): void;
    getClientType(name: string): ClientType | undefined;
    getAllClientTypes(): ClientType[];
    hasClient(name: string): boolean;
    removeClient(name: string): boolean;
    clear(): void;
    getStats(): {
        totalClients: number;
        totalClientTypes: number;
        clientNames: string[];
        clientTypeNames: string[];
    };
}
export declare const uaclRegistry: UACLRegistry;
//# sourceMappingURL=client-registry.d.ts.map