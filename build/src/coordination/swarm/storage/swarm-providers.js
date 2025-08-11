/**
 * @file Coordination system: swarm-providers.
 */
import { getLogger } from '../../../config/logging-config.ts';
const logger = getLogger('coordination-swarm-storage-swarm-providers');
/**
 * Swarm Storage Providers for Dependency Injection.
 *
 * Provides DI registration for swarm storage components using.
 * The existing DAL Factory and repository patterns.
 */
import { DIContainer } from '../di/container/di-container';
import { CORE_TOKENS, DATABASE_TOKENS, SWARM_TOKENS } from '../di/tokens/core-tokens';
import { SwarmBackupManager } from './backup-manager.ts';
import { SwarmDatabaseManager } from './swarm-database-manager.ts';
import { SwarmMaintenanceManager } from './swarm-maintenance.ts';
/**
 * Default swarm storage configuration.
 */
export const defaultSwarmConfig = {
    central: {
        type: 'sqlite',
        database: './.claude-zen/system/swarm-registry.db',
    },
    basePath: './.claude-zen',
    swarmsPath: './.claude-zen/swarms/active',
};
/**
 * Default maintenance configuration.
 */
export const defaultMaintenanceConfig = {
    archiveAfterDays: 30,
    deleteAfterDays: 90,
    compressAfterMB: 100,
    maintenanceIntervalHours: 24,
};
/**
 * Default backup configuration.
 */
export const defaultBackupConfig = {
    dailyBackupHour: 2,
    keepDailyBackups: 7,
    compressionLevel: 6,
    useEncryption: false,
    enableRemoteSync: false,
};
/**
 * Register swarm storage providers with DI container.
 *
 * @param container
 * @param customConfig
 * @example
 */
export function registerSwarmProviders(container, customConfig) {
    // Register swarm configuration
    container.register(SWARM_TOKENS.Config, {
        type: 'singleton',
        create: () => ({
            ...defaultSwarmConfig,
            ...customConfig?.swarm,
        }),
    });
    // Register storage path for convenience
    container.register(SWARM_TOKENS.StoragePath, {
        type: 'singleton',
        create: (container) => {
            const config = container.resolve(SWARM_TOKENS.Config);
            return config.basePath;
        },
    });
    // Register swarm database manager
    container.register(SWARM_TOKENS.DatabaseManager, {
        type: 'singleton',
        create: (container) => new SwarmDatabaseManager(container.resolve(SWARM_TOKENS.Config), container.resolve(DATABASE_TOKENS?.DALFactory), container.resolve(CORE_TOKENS.Logger)),
    });
    // Register maintenance manager
    container.register(SWARM_TOKENS.MaintenanceManager, {
        type: 'singleton',
        create: (container) => {
            const config = container.resolve(SWARM_TOKENS.Config);
            return new SwarmMaintenanceManager(config?.basePath, {
                ...defaultMaintenanceConfig,
                ...customConfig?.maintenance,
            });
        },
    });
    // Register backup manager
    container.register(SWARM_TOKENS.BackupManager, {
        type: 'singleton',
        create: (container) => {
            const config = container.resolve(SWARM_TOKENS.Config);
            return new SwarmBackupManager(config?.basePath, {
                ...defaultBackupConfig,
                ...customConfig?.backup,
            });
        },
    });
}
/**
 * Initialize swarm storage system with DI.
 *
 * @param container
 * @example
 */
export async function initializeSwarmStorage(container) {
    // Resolve all swarm services
    const databaseManager = container.resolve(SWARM_TOKENS.DatabaseManager);
    const maintenanceManager = container.resolve(SWARM_TOKENS.MaintenanceManager);
    const backupManager = container.resolve(SWARM_TOKENS.BackupManager);
    // Initialize in order
    await databaseManager?.initialize();
    await maintenanceManager.initialize();
    await backupManager.initialize();
    return {
        databaseManager,
        maintenanceManager,
        backupManager,
    };
}
/**
 * Utility function to create a pre-configured swarm DI container.
 *
 * @param customConfig
 * @example
 */
export function createSwarmContainer(customConfig) {
    const container = new DIContainer();
    // Register core services (would normally come from main app)
    container.register(CORE_TOKENS.Logger, {
        type: 'singleton',
        create: () => ({
            debug: (_msg) => { },
            info: (_msg) => { },
            warn: (msg) => logger.warn(`[WARN] ${msg}`),
            error: (msg) => logger.error(`[ERROR] ${msg}`),
        }),
    });
    container.register(CORE_TOKENS.Config, {
        type: 'singleton',
        create: () => ({
            get: (_key, defaultValue) => defaultValue,
            set: (_key, _value) => { },
            has: (_key) => false,
        }),
    });
    // Register DAL Factory (would normally come from database domain)
    container.register(DATABASE_TOKENS?.DALFactory, {
        type: 'singleton',
        create: (container) => {
            const { DALFactory } = require('../../../database/factory.js');
            const { DatabaseProviderFactory, } = require('../../../database/providers/database-providers.js');
            return new DALFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config), new DatabaseProviderFactory(container.resolve(CORE_TOKENS.Logger), container.resolve(CORE_TOKENS.Config)));
        },
    });
    // Register swarm providers
    registerSwarmProviders(container, customConfig);
    return container;
}
export default {
    registerSwarmProviders,
    initializeSwarmStorage,
    createSwarmContainer,
    defaultSwarmConfig,
    defaultMaintenanceConfig,
    defaultBackupConfig,
};
