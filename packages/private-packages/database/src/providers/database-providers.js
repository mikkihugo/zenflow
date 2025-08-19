/**
 * Real Database Provider Factory using actual database implementations
 *
 * Updated to use real SQLite, LanceDB, and Kuzu adapters with no mocks
 */
import { getLogger } from '@claude-zen/foundation';
import { SQLiteAdapter, } from '../adapters/sqlite-adapter';
import { LanceDBAdapter, } from '../adapters/lancedb-adapter';
import { KuzuAdapter } from '../adapters/kuzu-adapter';
const logger = getLogger('database-providers');
export class DatabaseProviderFactory {
    logger;
    config;
    constructor(logger, config) {
        this.logger = logger;
        this.config = config;
    }
    async createAdapter(config) {
        this.logger.info(`Creating REAL ${config.type} adapter for: ${config.database}`);
        switch (config.type) {
            case 'sqlite':
                return new SQLiteAdapter(config);
            case 'lancedb':
                return new LanceDBAdapter(config);
            case 'kuzu':
                return new KuzuAdapter(config);
            default:
                throw new Error(`Unsupported database type: ${config.type}`);
        }
    }
}
//# sourceMappingURL=database-providers.js.map