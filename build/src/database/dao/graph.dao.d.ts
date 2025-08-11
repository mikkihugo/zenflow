/**
 * Graph Database Repository Implementation (Kuzu).
 *
 * Specialized repository for graph database operations including.
 * Node and relationship management, traversals, and Cypher queries.
 */
/**
 * @file Database layer: graph.dao.
 */
import { BaseDao } from '../base.dao.ts';
import type { CustomQuery, GraphNode, GraphQueryResult, GraphRelationship, GraphTraversalResult, IGraphRepository } from '../interfaces.ts';
/**
 * Graph database repository implementation for Kuzu.
 *
 * @template T The entity type this repository manages.
 * @example
 */
export declare class GraphDao<T> extends BaseDao<T> implements IGraphRepository<T> {
    private get graphAdapter();
    /**
     * Execute graph traversal query.
     *
     * @param startNode
     * @param relationshipType
     * @param maxDepth
     */
    traverse(startNode: string | number, relationshipType: string, maxDepth?: number): Promise<GraphTraversalResult>;
    /**
     * Find nodes by label and properties.
     *
     * @param label
     * @param properties
     */
    findNodesByLabel(label: string, properties?: Record<string, any>): Promise<GraphNode[]>;
    /**
     * Find relationships between nodes.
     *
     * @param fromNodeId
     * @param toNodeId
     * @param relationshipType
     */
    findRelationships(fromNodeId: string | number, toNodeId: string | number, relationshipType?: string): Promise<GraphRelationship[]>;
    /**
     * Create relationship between nodes.
     *
     * @param fromNodeId
     * @param toNodeId
     * @param relationshipType
     * @param properties
     */
    createRelationship(fromNodeId: string | number, toNodeId: string | number, relationshipType: string, properties?: Record<string, any>): Promise<GraphRelationship>;
    /**
     * Execute Cypher query.
     *
     * @param cypher
     * @param parameters
     */
    executeCypher(cypher: string, parameters?: Record<string, any>): Promise<GraphQueryResult>;
    /**
     * Enhanced graph-specific operations.
     */
    /**
     * Get node degree (number of connections).
     *
     * @param nodeId
     * @param direction.
     * @param direction
     */
    getNodeDegree(nodeId: string | number, direction?: 'in' | 'out' | 'both'): Promise<number>;
    /**
     * Find shortest path between two nodes.
     *
     * @param fromNodeId
     * @param toNodeId
     * @param relationshipType
     */
    findShortestPath(fromNodeId: string | number, toNodeId: string | number, relationshipType?: string): Promise<GraphTraversalResult | null>;
    /**
     * Get graph statistics.
     */
    getGraphStats(): Promise<{
        nodeCount: number;
        relationshipCount: number;
        nodeLabels: string[];
        relationshipTypes: string[];
    }>;
    /**
     * Override base repository methods for graph-specific implementations.
     */
    protected mapRowToEntity(row: any): T;
    protected mapEntityToRow(entity: Partial<T>): Record<string, any>;
    protected buildFindByIdQuery(id: string | number): {
        sql: string;
        params: any[];
    };
    /**
     * Execute custom query - override to handle object-based queries.
     *
     * @param customQuery
     */
    executeCustomQuery<R = any>(customQuery: CustomQuery): Promise<R>;
    /**
     * Helper methods.
     *
     * @param result
     * @param _result
     */
    private extractPathsFromResult;
}
//# sourceMappingURL=graph.dao.d.ts.map