
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/di/tokens/token-factory.ts
function createToken(name, type) {
  return {
    symbol: Symbol(name),
    name,
    ...type !== void 0 && { type }
  };
}
__name(createToken, "createToken");

// src/di/tokens/core-tokens.ts
var CORE_TOKENS = {
  Logger: createToken("Logger"),
  Config: createToken("Config"),
  EventBus: createToken("EventBus"),
  Database: createToken("Database"),
  HttpClient: createToken("HttpClient")
};
var MEMORY_TOKENS = {
  Backend: createToken("MemoryBackend"),
  Provider: createToken("MemoryProvider"),
  ProviderFactory: createToken("MemoryProviderFactory"),
  Config: createToken("MemoryConfig"),
  Controller: createToken("MemoryController")
};
var DATABASE_TOKENS = {
  Adapter: createToken("DatabaseAdapter"),
  Provider: createToken("DatabaseProvider"),
  ProviderFactory: createToken("DatabaseProviderFactory"),
  Config: createToken("DatabaseConfig"),
  Controller: createToken("DatabaseController"),
  DALFactory: createToken("DALFactory")
};
var SWARM_TOKENS = {
  DatabaseManager: createToken("SwarmDatabaseManager"),
  MaintenanceManager: createToken("SwarmMaintenanceManager"),
  BackupManager: createToken("SwarmBackupManager"),
  Config: createToken("SwarmConfig"),
  StoragePath: createToken("SwarmStoragePath")
};

export {
  createToken,
  CORE_TOKENS,
  MEMORY_TOKENS,
  DATABASE_TOKENS,
  SWARM_TOKENS
};
//# sourceMappingURL=chunk-NUAL3PFU.js.map
