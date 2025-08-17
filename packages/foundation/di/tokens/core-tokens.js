/**
 * Core system tokens for dependency injection.
 * Defines tokens for fundamental system services.
 */
/**
 * @file Core-tokens implementation.
 */
import { createToken } from './token-factory';
// Core system tokens
export const CORE_TOKENS = {
    Logger: createToken('Logger'),
    Config: createToken('Config'),
    EventBus: createToken('EventBus'),
    Database: createToken('Database'),
    HttpClient: createToken('HttpClient'),
};
// Memory domain tokens
export const MEMORY_TOKENS = {
    Backend: createToken('MemoryBackend'),
    Provider: createToken('MemoryProvider'),
    ProviderFactory: createToken('MemoryProviderFactory'),
    Config: createToken('MemoryConfig'),
    Controller: createToken('MemoryController'),
};
// Database domain tokens
export const DATABASE_TOKENS = {
    Adapter: createToken('DatabaseAdapter'),
    Provider: createToken('DatabaseProvider'),
    ProviderFactory: createToken('DatabaseProviderFactory'),
    Config: createToken('DatabaseConfig'),
    Controller: createToken('DatabaseController'),
    DALFactory: createToken('DALFactory'),
};
// Swarm coordination tokens
export const SWARM_TOKENS = {
    DatabaseManager: createToken('SwarmDatabaseManager'),
    MaintenanceManager: createToken('SwarmMaintenanceManager'),
    BackupManager: createToken('SwarmBackupManager'),
    Config: createToken('SwarmConfig'),
    StoragePath: createToken('SwarmStoragePath'),
};
