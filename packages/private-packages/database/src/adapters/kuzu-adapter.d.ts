/**
 * Real Kuzu Database Adapter
 *
 * Real Kuzu adapter using kuzu library for production graph database operations
 */
export interface KuzuConfig {
    type: 'kuzu';
    database: string;
    options?: {
        bufferPoolSize?: string;
        maxNumThreads?: number;
        createIfNotExists?: boolean;
        enableOptimizer?: boolean;
        enableProfiler?: boolean;
    };
}
export interface GraphNode {
    id: string;
    label: string;
    properties: Record<string, unknown>;
}
export interface GraphRelationship {
    id: string;
    from: string;
    to: string;
    type: string;
    properties: Record<string, unknown>;
}
export interface GraphQueryOptions {
    limit?: number;
    offset?: number;
    orderBy?: string;
    where?: Record<string, unknown>;
}
export declare class KuzuAdapter {
    private database;
    private connection;
    private config;
    private connected;
    constructor(config: KuzuConfig);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private initializeSchema;
    createNode(label: string, properties: Record<string, unknown>): Promise<string>;
    createRelationship(fromId: string, toId: string, relationshipType: string, properties?: Record<string, unknown>): Promise<string>;
    findNodes(label: string, properties?: Record<string, unknown>, options?: GraphQueryOptions): Promise<GraphNode[]>;
    findRelationships(fromId?: string, toId?: string, relationshipType?: string, options?: GraphQueryOptions): Promise<GraphRelationship[]>;
    getNeighbors(nodeId: string, depth?: number, relationshipType?: string): Promise<{
        nodes: GraphNode[];
        relationships: GraphRelationship[];
    }>;
    updateNode(id: string, properties: Record<string, unknown>): Promise<void>;
    deleteNode(id: string): Promise<void>;
    query(cypher: string, params?: unknown[]): Promise<unknown>;
    execute(cypher: string, params?: unknown[]): Promise<unknown>;
    transaction<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
    health(): Promise<boolean>;
    getSchema(): Promise<unknown>;
    getConnectionStats(): Promise<unknown>;
    private parseBufferSize;
    private embedParameters;
    queryGraph(cypher: string, params?: any): Promise<unknown>;
    getNodeCount(label?: string): Promise<number>;
    getRelationshipCount(relationshipType?: string): Promise<number>;
    getGraphStats(): Promise<{
        nodeCount: number;
        relationshipCount: number;
        nodeLabels: string[];
        relationshipTypes: string[];
    }>;
}
//# sourceMappingURL=kuzu-adapter.d.ts.map