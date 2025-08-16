/**
 * @fileoverview Graph Database Repository Implementation (Kuzu)
 *
 * This module provides a specialized repository implementation for Kuzu graph database operations.
 * It extends the base repository pattern with graph-specific functionality including:
 *
 * - **Node Operations**: Create, read, update, delete graph nodes with labels and properties
 * - **Relationship Management**: Create and query relationships between nodes with type filtering
 * - **Graph Traversals**: Multi-hop traversals with configurable depth and relationship filtering
 * - **Cypher Query Execution**: Direct Cypher query support for complex graph operations
 * - **Graph Analytics**: Node degree calculations, shortest path finding, graph statistics
 * - **Schema Introspection**: Graph schema analysis and relationship type discovery
 *
 * The implementation leverages Kuzu's high-performance graph query engine optimized for
 * analytical workloads with columnar storage and vectorized query execution.
 *
 * @author Claude Code Zen Team
 * @version 1.0.0-alpha.43
 * @since 2024-01-01
 *
 * @example Basic Graph Operations
 * ```typescript
 * const graphDao = new GraphDao<User>(
 *   'users',
 *   graphDatabaseAdapter,
 *   logger,
 *   container
 * );
 *
 * // Find connected users within 2 hops
 * const connections = await graphDao.traverse('user123', 'FOLLOWS', 2);
 * console.log(`Found ${connections.nodes.length} connected users`);
 *
 * // Create relationship between users
 * const friendship = await graphDao.createRelationship(
 *   'user123', 'user456', 'FRIENDS',
 *   { since: '2024-01-01', strength: 0.8 }
 * );
 * ```
 *
 * @example Advanced Graph Analytics
 * ```typescript
 * // Calculate user influence (node degree)
 * const influence = await graphDao.getNodeDegree('user123', 'out');
 *
 * // Find shortest connection path
 * const path = await graphDao.findShortestPath('user123', 'user789', 'KNOWS');
 *
 * // Get graph statistics
 * const stats = await graphDao.getGraphStats();
 * console.log(`Graph has ${stats.nodeCount} nodes and ${stats.relationshipCount} edges`);
 * ```
 *
 * @example Complex Cypher Queries
 * ```typescript
 * const cypher = `
 *   MATCH (u:User)-[:FOLLOWS*1..3]->(influencer:User)
 *   WHERE u.id = $userId AND influencer.followerCount > 1000
 *   RETURN influencer, count(*) as connectionPaths
 *   ORDER BY connectionPaths DESC
 *   LIMIT 10
 * `;
 *
 * const result = await graphDao.executeCypher(cypher, { userId: 'user123' });
 * ```
 */
/**
 * @file Database layer: graph.dao - Kuzu graph database operations
 */
import { BaseDao } from '../base.dao';
import type { CustomQuery, GraphNode, GraphQueryResult, GraphRelationship, GraphTraversalResult, GraphRepository } from '../interfaces';
/**
 * Graph Database Repository implementation specialized for Kuzu graph database.
 *
 * This class extends the base repository pattern to provide comprehensive graph database
 * functionality. It acts as a bridge between the application domain layer and Kuzu's
 * high-performance graph query engine, offering both high-level graph operations and
 * direct Cypher query access.
 *
 * **Key Capabilities:**
 * - **Multi-hop Traversals**: Efficient path finding with configurable depth limits
 * - **Relationship Queries**: Type-filtered relationship discovery and creation
 * - **Node Management**: Label-based node operations with property filtering
 * - **Graph Analytics**: Degree calculations, shortest paths, connectivity analysis
 * - **Schema Introspection**: Dynamic graph schema and statistics discovery
 * - **Performance Optimization**: Leverages Kuzu's columnar storage and vectorization
 *
 * **Thread Safety**: This class is thread-safe for read operations but requires external
 * synchronization for write operations in concurrent environments.
 *
 * **Memory Management**: Uses Kuzu's memory-efficient storage with automatic memory
 * management for large graph datasets.
 *
 * @template T - The entity type this repository manages (e.g., User, Document, etc.)
 *
 * @class GraphDao
 * @extends {BaseDao<T>}
 * @implements {GraphRepository<T>}
 *
 * @example Domain Entity Mapping
 * ```typescript
 * interface User {
 *   id: string;
 *   name: string;
 *   email: string;
 *   followerCount: number;
 * }
 *
 * const userGraphDao = new GraphDao<User>(
 *   'User',                    // Node label in graph
 *   kuzuAdapter,              // Kuzu database adapter
 *   logger,                   // Application logger
 *   diContainer               // Dependency injection container
 * );
 * ```
 *
 * @example Advanced Graph Operations
 * ```typescript
 * // Find all users connected within 3 degrees of separation
 * const socialNetwork = await userGraphDao.traverse(
 *   'user123',
 *   'KNOWS|FOLLOWS|FRIENDS', // Multiple relationship types
 *   3                         // Maximum depth
 * );
 *
 * // Analyze network structure
 * for (const node of socialNetwork.nodes) {
 *   const degree = await userGraphDao.getNodeDegree(node.id, 'both');
 *   console.log(`${node.name} has ${degree} connections`);
 * }
 * ```
 *
 * @example Performance Considerations
 * ```typescript
 * // Efficient bulk operations
 * const batch = [];
 * for (const connection of connections) {
 *   batch.push({
 *     cypher: 'CREATE (a:User)-[:FOLLOWS]->(b:User) WHERE a.id = $from AND b.id = $to',
 *     params: { from: connection.from, to: connection.to }
 *   });
 * }
 *
 * // Execute as single transaction for better performance
 * const results = await graphDao.executeCypher(
 *   'UNWIND $batch as op CALL apoc.cypher.doIt(op.cypher, op.params)',
 *   { batch }
 * );
 * ```
 */
export declare class GraphDao<T> extends BaseDao<T> implements GraphRepository<T> {
    private get graphAdapter();
    /**
     * Executes a graph traversal starting from a specified node.
     *
     * This method performs multi-hop graph traversal using Cypher path matching
     * to discover nodes connected to the starting node through specified relationship types.
     * It supports configurable traversal depth and returns comprehensive path information
     * including intermediate nodes and relationships.
     *
     * **Algorithm**: Uses Kuzu's optimized path matching with early termination for
     * better performance on large graphs. The traversal is breadth-first by default
     * and includes cycle detection to prevent infinite loops.
     *
     * **Performance**: O(k^d) where k is average node degree and d is max depth.
     * Consider using pagination for large result sets.
     *
     * @async
     * @method traverse
     * @param {string|number} startNode - Starting node identifier (D field value)
     * @param {string} relationshipType - Relationship type to traverse (e.g., 'FOLLOWS', 'KNOWS')
     * @param {number} [maxDepth=3] - Maximum traversal depth (1-10 recommended, default 3)
     *
     * @returns {Promise<GraphTraversalResult>} Traversal results with nodes, relationships, and paths
     * @returns {GraphNode[]} returns.nodes - All nodes discovered during traversal
     * @returns {GraphRelationship[]} returns.relationships - All relationships traversed
     * @returns {Object[]} returns.paths - Path structures from start to each discovered node
     *
     * @throws {Error} When traversal fails due to invalid parameters or database errors
     * @throws {Error} When startNode doesn't exist or maxDepth exceeds limits
     *
     * @example Basic Traversal
     * ```typescript
     * // Find all users within 2 degrees of user123 via FOLLOWS relationships
     * const connections = await userDao.traverse('user123', 'FOLLOWS', 2);
     *
     * console.log(`Found ${connections.nodes.length} connected users`);
     * console.log(`Through ${connections.relationships.length} relationships`);
     *
     * // Process discovered connections
     * for (const node of connections.nodes) {
     *   console.log(`Connected user: ${node.properties.name}`);
     * }
     * ```
     *
     * @example Multi-type Traversal
     * ```typescript
     * // Traverse multiple relationship types (requires separate calls currently)
     * const followers = await userDao.traverse('user123', 'FOLLOWS', 2);
     * const friends = await userDao.traverse('user123', 'FRIENDS', 2);
     *
     * // Combine results for comprehensive social network analysis
     * const allConnections = [...followers.nodes, ...friends.nodes];
     * ```
     *
     * @example Deep Network Analysis
     * ```typescript
     * // Analyze influence propagation up to 4 degrees
     * const influence = await userDao.traverse('influencer456', 'NFLUENCES', 4);
     *
     * // Calculate reach by depth level
     * const reachByDepth = new Map();
     * for (const path of influence.paths) {
     *   const depth = path.length - 1;
     *   reachByDepth.set(depth, (reachByDepth.get(depth) || 0) + 1);
     * }
     * ```
     */
    traverse(startNode: string | number, relationshipType: string, maxDepth?: number): Promise<GraphTraversalResult>;
    /**
     * Find nodes by label and properties.
     *
     * @param label
     * @param properties
     */
    findNodesByLabel(label: string, properties?: Record<string, unknown>): Promise<GraphNode[]>;
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
    createRelationship(fromNodeId: string | number, toNodeId: string | number, relationshipType: string, properties?: Record<string, unknown>): Promise<GraphRelationship>;
    /**
     * Executes a custom Cypher query against the Kuzu graph database.
     *
     * This method provides direct access to Kuzu's Cypher query engine for complex
     * graph operations that cannot be easily expressed through the high-level repository methods.
     * It supports parameterized queries for security and performance optimization.
     *
     * **Security**: Always use parameterized queries to prevent Cypher injection attacks.
     * Raw string concatenation is strongly discouraged for user-provided input.
     *
     * **Performance**: Kuzu optimizes queries using columnar storage and vectorized execution.
     * Consider query structure and indexing for optimal performance on large graphs.
     *
     * **Transaction Handling**: Queries are executed within the current transaction context
     * or auto-commit mode if no transaction is active.
     *
     * @async
     * @method executeCypher
     * @param {string} cypher - Cypher query string with parameter placeholders ($param)
     * @param {Record<string, unknown>} [parameters] - Query parameters as key-value pairs
     *
     * @returns {Promise<GraphQueryResult>} Query results with nodes, relationships, and execution info
     * @returns {GraphNode[]} returns.nodes - Node results from query execution
     * @returns {GraphRelationship[]} returns.relationships - Relationship results from query
     * @returns {any[]} returns.results - Raw result rows from query execution
     * @returns {number} [returns.executionTime] - Query execution time in milliseconds
     *
     * @throws {Error} When query syntax is invalid or execution fails
     * @throws {Error} When parameters don't match query placeholders
     * @throws {Error} When database connection issues occur
     *
     * @example Basic Cypher Query
     * ```typescript
     * // Find users with high follower counts
     * const influencers = await graphDao.executeCypher(`
     *   MATCH (u:User)
     *   WHERE u.followerCount > $threshold
     *   RETURN u
     *   ORDER BY u.followerCount DESC
     *   LIMIT $limit
     * `, {
     *   threshold: 10000,
     *   limit: 50
     * });
     *
     * console.log(`Found ${influencers.nodes.length} influencers`);
     * ```
     *
     * @example Complex Graph Analysis
     * ```typescript
     * // Find communities using relationship patterns
     * const communities = await graphDao.executeCypher(`
     *   MATCH (u:User)-[:FOLLOWS]->(leader:User)
     *   WHERE leader.followerCount > $minFollowers
     *   WITH leader, count(u) as followerCount
     *   MATCH (leader)-[:FOLLOWS]->(peer:User)
     *   WHERE peer.followerCount > $minFollowers AND peer <> leader
     *   RETURN leader, peer, followerCount
     *   ORDER BY followerCount DESC
     * `, {
     *   minFollowers: 1000
     * });
     * ```
     *
     * @example Performance-Optimized Query
     * ```typescript
     * // Use indexes and limit results for better performance
     * const recentConnections = await graphDao.executeCypher(`
     *   MATCH (u:User {id: $userId})-[r:FOLLOWS]->(target:User)
     *   WHERE r.createdAt > $since
     *   RETURN target, r.createdAt
     *   ORDER BY r.createdAt DESC
     *   LIMIT 100
     * `, {
     *   userId: 'user123',
     *   since: '2024-01-01'
     * });
     * ```
     *
     * @example Batch Operations
     * ```typescript
     * // Process multiple operations efficiently
     * const batchResult = await graphDao.executeCypher(`
     *   UNWIND $operations as op
     *   MATCH (from:User {id: op.fromId}), (to:User {id: op.toId})
     *   CREATE (from)-[:FOLLOWS {createdAt: datetime()}]->(to)
     *   RETURN count(*) as created
     * `, {
     *   operations: [
     *     { fromId: 'user1', toId: 'user2' },
     *     { fromId: 'user1', toId: 'user3' }
     *   ]
     * });
     * ```
     */
    executeCypher(cypher: string, parameters?: Record<string, unknown>): Promise<GraphQueryResult>;
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
    protected mapRowToEntity(row: unknown): T;
    protected mapEntityToRow(entity: Partial<T>): Record<string, unknown>;
    protected buildFindByIdQuery(id: string | number): {
        sql: string;
        params: unknown[];
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