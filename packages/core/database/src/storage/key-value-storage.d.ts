/**
 * Key-Value Storage Implementation
 *
 * High-performance key-value storage with caching, TTL support, batch operations,
 * and comprehensive error handling for enterprise applications.
 */
import { type DatabaseConfig, type DatabaseConnection, type KeyValueStorage} from "../types/index.js";
export declare class KeyValueStorageImpl implements KeyValueStorage {
    private config;
    private readonly connection;
    private readonly memoryCache;
    private readonly cacheEnabled;
    private readonly maxCacheSize;
    private readonly defaultTtl?;
    private initialized;
    constructor(connection:DatabaseConnection, config:DatabaseConfig);
    get<T = unknown>(key:string): Promise<T | null>;
    set<T>(key:string, value:T, options?:{
        ttl?:number;
}):Promise<void>;
    delete(key:string): Promise<boolean>;
    has(key:string): Promise<boolean>;
    keys(pattern?:string): Promise<readonly string[]>;
    clear():Promise<void>;
    size():Promise<number>;
    mget<T = unknown>(keys:readonly string[]): Promise<ReadonlyMap<string, T>>;
    mset<T>(entries:ReadonlyMap<string, T>):Promise<void>;
    mdelete(keys:readonly string[]): Promise<number>;
    private ensureInitialized;
    private getFromCache;
    private setInCache;
    private isExpired;
    private startCacheCleanup;
    private generateCorrelationId;
}
//# sourceMappingURL=key-value-storage.d.ts.map