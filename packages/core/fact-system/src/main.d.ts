/**
 * @fileoverview FACT System Package Main Implementation
 *
 * Central export point for all FACT system functionality including
 * TypeScript coordination, Rust engine integration, and multi-source fact gathering.
 */
import type { FactSystemConfig } from "./typescript/types";
export declare class FactClient {
    private config;
    constructor(config?: FactSystemConfig);
    search(query: any): Promise<any>;
    gatherFromSources(sources: any[], options?: any): Promise<any>;
    getStats(): any;
    shutdown?(): void;
}
export declare function createFactClient(config?: FactSystemConfig): Promise<FactClient>;
export declare function createSQLiteFactClient(path?: string): Promise<FactClient>;
export declare function createLanceDBFactClient(path?: string): Promise<FactClient>;
export declare function createKuzuFactClient(path?: string): Promise<FactClient>;
export declare class FactBridge {
}
export declare class IntelligentCache {
    private cache;
    constructor();
    clear(): void;
    set(key: string, value: any): void;
    get(key: string): any;
}
export declare class NaturalLanguageQuery {
    constructor();
    processQuery(query: string): Promise<any>;
}
export declare class LiveAPIConnector {
    constructor();
    fetchData(source: string): Promise<any>;
}
export declare class DocumentationProcessor {
    constructor();
    process(content: string): any;
}
export type { APIDocumentationFactResult, BitbucketRepoFactResult, FactCacheEntry, FactProcessingOptions, FactQuery, FactResult, FactSearchQuery, FactSearchResult, FactSourceType, FactSystemConfig, FactSystemStats, GitHubFactResult, GitLabRepoFactResult, GoModuleFactResult, HexFactResult, JavaPackageFactResult, NPMFactResult, PerlPackageFactResult, RustCrateFactResult, RustEngineConfig, SecurityFactResult, } from "./typescript/types";
export declare function getFactSystemAccess(config?: FactSystemConfig): Promise<any>;
export declare function getFactClient(config?: FactSystemConfig): Promise<FactClient>;
export declare function getFactGathering(config?: FactSystemConfig): Promise<any>;
export declare function getFactProcessing(config?: FactSystemConfig): Promise<any>;
export declare function getFactSources(config?: FactSystemConfig): Promise<any>;
export declare function getFactIntelligence(config?: FactSystemConfig): Promise<any>;
export declare const factSystem: {
    getAccess: typeof getFactSystemAccess;
    getClient: typeof getFactClient;
    getGathering: typeof getFactGathering;
    getProcessing: typeof getFactProcessing;
    getSources: typeof getFactSources;
    getIntelligence: typeof getFactIntelligence;
    createClient: typeof createFactClient;
    createBridge: () => FactBridge;
};
export declare const FACT_MAIN_INFO: {
    readonly version: "1.0.0";
    readonly description: "FACT system main implementation entry point";
    readonly components: readonly ["FactClient - Core fact gathering system", "FactBridge - Rust/TypeScript integration", "IntelligentCache - Smart caching layer", "LiveAPIConnector - External data sources", "DocumentationProcessor - Content processing"];
};
//# sourceMappingURL=main.d.ts.map