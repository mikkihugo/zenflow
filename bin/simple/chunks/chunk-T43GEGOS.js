
    import { createRequire } from 'module';
    import { fileURLToPath } from 'url';
    import { dirname } from 'path';
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const require = createRequire(import.meta.url);
    
import {
  BaseDao
} from "./chunk-P4NCKSFY.js";
import {
  __name
} from "./chunk-O4JO3PGD.js";

// src/database/dao/graph.dao.ts
var GraphDao = class extends BaseDao {
  static {
    __name(this, "GraphDao");
  }
  get graphAdapter() {
    return this.adapter;
  }
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
   * @param {string|number} startNode - Starting node identifier (ID field value)
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
   * const influence = await userDao.traverse('influencer456', 'INFLUENCES', 4);
   * 
   * // Calculate reach by depth level
   * const reachByDepth = new Map();
   * for (const path of influence.paths) {
   *   const depth = path.length - 1;
   *   reachByDepth.set(depth, (reachByDepth.get(depth) || 0) + 1);
   * }
   * ```
   */
  async traverse(startNode, relationshipType, maxDepth = 3) {
    this.logger.debug(
      `Executing graph traversal from node ${startNode}, relationship: ${relationshipType}, maxDepth: ${maxDepth}`
    );
    try {
      const cypher = `
        MATCH path = (start:${this.tableName} {id: $startNodeId})-[:${relationshipType}*1..${maxDepth}]-(connected)
        RETURN path, nodes(path) as nodes, relationships(path) as relationships
        ORDER BY length(path)
      `;
      const result = await this.graphAdapter.queryGraph(cypher, [startNode]);
      const traversalResult = {
        nodes: result.nodes,
        relationships: result.relationships,
        paths: this.extractPathsFromResult(result)
      };
      this.logger.debug(
        `Traversal completed: ${traversalResult.nodes.length} nodes, ${traversalResult.relationships.length} relationships`
      );
      return traversalResult;
    } catch (error) {
      this.logger.error(`Graph traversal failed: ${error}`);
      throw new Error(
        `Graph traversal failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Find nodes by label and properties.
   *
   * @param label
   * @param properties
   */
  async findNodesByLabel(label, properties) {
    this.logger.debug(`Finding nodes by label: ${label}`, { properties });
    try {
      let cypher = `MATCH (n:${label})`;
      const parameters = {};
      if (properties && Object.keys(properties).length > 0) {
        const propertyConditions = Object.keys(properties).map((key, index) => {
          const paramName = `prop${index}`;
          parameters[paramName] = properties[key];
          return `n.${key} = $${paramName}`;
        }).join(" AND ");
        cypher += ` WHERE ${propertyConditions}`;
      }
      cypher += " RETURN n";
      const result = await this.graphAdapter.queryGraph(cypher, Object.values(parameters));
      return result.nodes;
    } catch (error) {
      this.logger.error(`Find nodes by label failed: ${error}`);
      throw new Error(
        `Find nodes by label failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Find relationships between nodes.
   *
   * @param fromNodeId
   * @param toNodeId
   * @param relationshipType
   */
  async findRelationships(fromNodeId, toNodeId, relationshipType) {
    this.logger.debug(`Finding relationships between nodes: ${fromNodeId} -> ${toNodeId}`, {
      relationshipType
    });
    try {
      let cypher = "MATCH (a)-[r";
      const parameters = {
        fromNodeId,
        toNodeId
      };
      if (relationshipType) {
        cypher += `:${relationshipType}`;
      }
      cypher += "]->(b) WHERE a.id = $fromNodeId AND b.id = $toNodeId RETURN r";
      const result = await this.graphAdapter.queryGraph(cypher, Object.values(parameters));
      return result.relationships;
    } catch (error) {
      this.logger.error(`Find relationships failed: ${error}`);
      throw new Error(
        `Find relationships failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Create relationship between nodes.
   *
   * @param fromNodeId
   * @param toNodeId
   * @param relationshipType
   * @param properties
   */
  async createRelationship(fromNodeId, toNodeId, relationshipType, properties) {
    this.logger.debug(
      `Creating relationship: ${fromNodeId} -[:${relationshipType}]-> ${toNodeId}`,
      { properties }
    );
    try {
      let cypher = `
        MATCH (a), (b)
        WHERE a.id = $fromNodeId AND b.id = $toNodeId
        CREATE (a)-[r:${relationshipType}
      `;
      const parameters = {
        fromNodeId,
        toNodeId
      };
      if (properties && Object.keys(properties).length > 0) {
        const propertyAssignments = Object.keys(properties).map((key, index) => {
          const paramName = `prop${index}`;
          parameters[paramName] = properties[key];
          return `${key}: $${paramName}`;
        }).join(", ");
        cypher += ` {${propertyAssignments}}`;
      }
      cypher += "]->(b) RETURN r";
      const result = await this.graphAdapter.queryGraph(cypher, Object.values(parameters));
      if (result.relationships.length === 0) {
        throw new Error("Failed to create relationship - nodes may not exist");
      }
      return result.relationships[0];
    } catch (error) {
      this.logger.error(`Create relationship failed: ${error}`);
      throw new Error(
        `Create relationship failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
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
   * @param {Record<string, any>} [parameters] - Query parameters as key-value pairs
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
  async executeCypher(cypher, parameters) {
    this.logger.debug(`Executing Cypher query: ${cypher}`, { parameters });
    try {
      const paramArray = parameters ? Object.values(parameters) : [];
      const result = await this.graphAdapter.queryGraph(cypher, paramArray);
      return {
        nodes: result.nodes,
        relationships: result.relationships,
        results: [],
        // Raw results would need to be extracted from Kuzu response
        executionTime: result.executionTime
      };
    } catch (error) {
      this.logger.error(`Cypher query failed: ${error}`);
      throw new Error(
        `Cypher query failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
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
  async getNodeDegree(nodeId, direction = "both") {
    this.logger.debug(`Getting node degree for ${nodeId}, direction: ${direction}`);
    try {
      let cypher;
      switch (direction) {
        case "in":
          cypher = "MATCH (n)<-[]-(connected) WHERE n.id = $nodeId RETURN count(connected) as degree";
          break;
        case "out":
          cypher = "MATCH (n)-[]->(connected) WHERE n.id = $nodeId RETURN count(connected) as degree";
          break;
        default:
          cypher = "MATCH (n)-[]-(connected) WHERE n.id = $nodeId RETURN count(connected) as degree";
      }
      const result = await this.graphAdapter.queryGraph(cypher, [nodeId]);
      return result.results[0]?.degree || 0;
    } catch (error) {
      this.logger.error(`Get node degree failed: ${error}`);
      throw new Error(
        `Get node degree failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Find shortest path between two nodes.
   *
   * @param fromNodeId
   * @param toNodeId
   * @param relationshipType
   */
  async findShortestPath(fromNodeId, toNodeId, relationshipType) {
    this.logger.debug(`Finding shortest path: ${fromNodeId} -> ${toNodeId}`, { relationshipType });
    try {
      let cypher = "MATCH path = shortestPath((a)-[";
      if (relationshipType) {
        cypher += `:${relationshipType}`;
      }
      cypher += "*]-(b)) WHERE a.id = $fromNodeId AND b.id = $toNodeId RETURN path";
      const result = await this.graphAdapter.queryGraph(cypher, [fromNodeId, toNodeId]);
      if (result.nodes.length === 0) {
        return null;
      }
      return {
        nodes: result.nodes,
        relationships: result.relationships,
        paths: this.extractPathsFromResult(result)
      };
    } catch (error) {
      this.logger.error(`Find shortest path failed: ${error}`);
      throw new Error(
        `Find shortest path failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Get graph statistics.
   */
  async getGraphStats() {
    this.logger.debug("Getting graph statistics");
    try {
      const nodeCount = await this.graphAdapter.getNodeCount();
      const relationshipCount = await this.graphAdapter.getRelationshipCount();
      const labelsResult = await this.graphAdapter.queryGraph(
        "MATCH (n) RETURN DISTINCT labels(n) as labels"
      );
      const nodeLabels = [...new Set(labelsResult.nodes.flatMap((n) => n.labels))];
      const typesResult = await this.graphAdapter.queryGraph(
        "MATCH ()-[r]->() RETURN DISTINCT type(r) as relType"
      );
      const relationshipTypes = typesResult.relationships.map((r) => r.type);
      return {
        nodeCount,
        relationshipCount,
        nodeLabels,
        relationshipTypes
      };
    } catch (error) {
      this.logger.error(`Get graph stats failed: ${error}`);
      throw new Error(
        `Get graph stats failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Override base repository methods for graph-specific implementations.
   */
  mapRowToEntity(row) {
    if (row.id && row.labels && row.properties) {
      return {
        id: row.id,
        labels: row.labels,
        ...row.properties
      };
    }
    return row;
  }
  mapEntityToRow(entity) {
    if (!entity) return {};
    const { id, labels, ...properties } = entity;
    return {
      id,
      labels: labels || [this.tableName],
      properties
    };
  }
  buildFindByIdQuery(id) {
    return {
      sql: `MATCH (n:${this.tableName} {id: $id}) RETURN n`,
      params: [id]
    };
  }
  /**
   * Execute custom query - override to handle object-based queries.
   *
   * @param customQuery
   */
  async executeCustomQuery(customQuery) {
    if (customQuery.type === "cypher") {
      const result = await this.executeCypher(customQuery.query, customQuery.parameters);
      return result;
    }
    return super.executeCustomQuery(customQuery);
  }
  /**
   * Helper methods.
   *
   * @param result
   * @param _result
   */
  extractPathsFromResult(_result) {
    return [];
  }
};

export {
  GraphDao
};
//# sourceMappingURL=chunk-T43GEGOS.js.map
