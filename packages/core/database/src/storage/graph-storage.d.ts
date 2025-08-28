/**
 * Graph Storage Implementation
 *
 * Provides graph database operations with node/edge management,
 * path traversal, and performance monitoring.
 */
import { type DatabaseConfig, type DatabaseConnection, type GraphEdge, type GraphNode, type GraphResult, type GraphStorage } from "../types/index.js";
export declare class GraphStorageImpl implements GraphStorage {
    private connection;
    private config;
    constructor(connection: DatabaseConnection, config: DatabaseConfig);
    addNode(node: Omit<GraphNode, "id"> & {
        id?: string;
    }): Promise<string>;
    getNode(id: string): Promise<GraphNode | null>;
    updateNode(id: string, updates: Partial<Omit<GraphNode, "id">>): Promise<void>;
    deleteNode(id: string): Promise<boolean>;
    addEdge(edge: Omit<GraphEdge, "id"> & {
        id?: string;
    }): Promise<string>;
    getEdge(id: string): Promise<GraphEdge | null>;
    updateEdge(id: string, updates: Partial<Omit<GraphEdge, "id">>): Promise<void>;
    deleteEdge(id: string): Promise<boolean>;
    getConnections(nodeId: string, direction?: "in" | "out" | "both", edgeType?: string): Promise<readonly GraphEdge[]>;
    findPath(fromId: string, toId: string, options?: {
        maxDepth?: number;
        edgeTypes?: readonly string[];
        algorithm?: "bfs" | "dfs" | "dijkstra" | "astar";
    }): Promise<readonly GraphNode[]>;
    private buildPathNodes;
    query(cypher: string, params?: Readonly<Record<string, unknown>>): Promise<GraphResult>;
    createNodeLabel(label: string, properties?: Readonly<Record<string, string>>): Promise<void>;
    createEdgeType(type: string, properties?: Readonly<Record<string, string>>): Promise<void>;
    getStats(): Promise<{
        nodeCount: number;
        edgeCount: number;
        labelCounts: Readonly<Record<string, number>>;
        edgeTypeCounts: Readonly<Record<string, number>>;
    }>;
    private generateCorrelationId;
    private generateNodeId;
    private generateEdgeId;
    private ensureNodesTable;
    private ensureEdgesTable;
}
//# sourceMappingURL=graph-storage.d.ts.map