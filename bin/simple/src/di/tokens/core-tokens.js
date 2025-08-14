import { createToken } from './token-factory.ts';
export const CORE_TOKENS = {
    Logger: createToken('Logger'),
    Config: createToken('Config'),
    EventBus: createToken('EventBus'),
    Database: createToken('Database'),
    HttpClient: createToken('HttpClient'),
};
export const MEMORY_TOKENS = {
    Backend: createToken('MemoryBackend'),
    Provider: createToken('MemoryProvider'),
    ProviderFactory: createToken('MemoryProviderFactory'),
    Config: createToken('MemoryConfig'),
    Controller: createToken('MemoryController'),
};
export const DATABASE_TOKENS = {
    Adapter: createToken('DatabaseAdapter'),
    Provider: createToken('DatabaseProvider'),
    ProviderFactory: createToken('DatabaseProviderFactory'),
    Config: createToken('DatabaseConfig'),
    Controller: createToken('DatabaseController'),
    DALFactory: createToken('DALFactory'),
};
export const SWARM_TOKENS = {
    DatabaseManager: createToken('SwarmDatabaseManager'),
    MaintenanceManager: createToken('SwarmMaintenanceManager'),
    BackupManager: createToken('SwarmBackupManager'),
    Config: createToken('SwarmConfig'),
    StoragePath: createToken('SwarmStoragePath'),
};
//# sourceMappingURL=core-tokens.js.map