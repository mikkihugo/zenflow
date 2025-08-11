/**
 * @file Coordination system: swarm-providers.
 */
/**
 * Swarm Storage Providers for Dependency Injection.
 *
 * Provides DI registration for swarm storage components using.
 * The existing DAL Factory and repository patterns.
 */
import { DIContainer } from '../di/container/di-container';
import { type BackupConfig, SwarmBackupManager } from './backup-manager.ts';
import { type SwarmDatabaseConfig, SwarmDatabaseManager } from './swarm-database-manager.ts';
import { type MaintenanceConfig, SwarmMaintenanceManager } from './swarm-maintenance.ts';
/**
 * Default swarm storage configuration.
 */
export declare const defaultSwarmConfig: SwarmDatabaseConfig;
/**
 * Default maintenance configuration.
 */
export declare const defaultMaintenanceConfig: MaintenanceConfig;
/**
 * Default backup configuration.
 */
export declare const defaultBackupConfig: BackupConfig;
/**
 * Register swarm storage providers with DI container.
 *
 * @param container
 * @param customConfig
 * @example
 */
export declare function registerSwarmProviders(container: DIContainer, customConfig?: Partial<{
    swarm: Partial<SwarmDatabaseConfig>;
    maintenance: Partial<MaintenanceConfig>;
    backup: Partial<BackupConfig>;
}>): void;
/**
 * Initialize swarm storage system with DI.
 *
 * @param container
 * @example
 */
export declare function initializeSwarmStorage(container: DIContainer): Promise<{
    databaseManager: SwarmDatabaseManager;
    maintenanceManager: SwarmMaintenanceManager;
    backupManager: SwarmBackupManager;
}>;
/**
 * Utility function to create a pre-configured swarm DI container.
 *
 * @param customConfig
 * @example
 */
export declare function createSwarmContainer(customConfig?: Parameters<typeof registerSwarmProviders>[1]): DIContainer;
declare const _default: {
    registerSwarmProviders: typeof registerSwarmProviders;
    initializeSwarmStorage: typeof initializeSwarmStorage;
    createSwarmContainer: typeof createSwarmContainer;
    defaultSwarmConfig: SwarmDatabaseConfig;
    defaultMaintenanceConfig: MaintenanceConfig;
    defaultBackupConfig: BackupConfig;
};
export default _default;
//# sourceMappingURL=swarm-providers.d.ts.map