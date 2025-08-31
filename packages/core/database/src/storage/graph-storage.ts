/**
 * Graph Storage Implementation
 *
 * Provides graph database operations with node/edge management,
 * path traversal, and performance monitoring.
 */

import { getLogger } from '../logger.js';
import { createErrorOptions } from '../utils/error-helpers.js';
import {
  type DatabaseConnection,
  type GraphEdge,
  type GraphNode,
  type GraphResult,
  type GraphStorage,
  QueryError,
} from '../types/index.js';

const logger = getLogger('graph-storage');

export class GraphStorageImpl implements GraphStorage {
  constructor(
    private connection: DatabaseConnection
  ) {}

  async addNode(
    node: Omit<GraphNode, 'id'> & { id?: string }
  ): Promise<string> {
    try {
      const nodeId = node.id || this.generateNodeId();

      logger.debug('Creating graph node', {
        labels: node.labels,
        nodeId,
        propertyCount: Object.keys(node.properties || {}).length,
      });

      await this.ensureNodesTable();

      const sql = `INSERT INTO graph_nodes (id, labels, properties, created_at) VALUES (?, ?, ?, datetime('now'))`;
      await this.connection.execute(sql, [
        nodeId,
        JSON.stringify(node.labels || []),
        JSON.stringify(node.properties || {}),
      ]);

      logger.debug('Graph node created', { labels: node.labels, nodeId });
      return nodeId;
    } catch (error) {
      logger.error('Failed to create graph node', {
        id: node.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to create node:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error) as any
      );
    }
  }

  async getNode(id: string): Promise<GraphNode | null> {
    try {
      logger.debug('Getting graph node', { id });

      await this.ensureNodesTable();

      const sql = `SELECT id, labels, properties FROM graph_nodes WHERE id = ?`;
      const result = await this.connection.query<{
        id: string;
        labels: string;
        properties: string;
      }>(sql, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      if (!row) {
        return null;
      }
      
      return {
        id: row.id,
        labels: JSON.parse(row.labels),
        properties: JSON.parse(row.properties),
      };
    } catch (error) {
      logger.error('Failed to get graph node', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to get node: ${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async updateNode(
    id: string,
    updates: Partial<Omit<GraphNode, 'id'>>
  ): Promise<void> {
    try {
      logger.debug('Updating graph node', {
        id,
        hasLabels: !!updates.labels,
        hasProperties: !!updates.properties,
      });

      await this.ensureNodesTable();

      const setParts: string[] = [];
      const params: unknown[] = [];

      if (updates.labels) {
        setParts.push('labels = ?');
        params.push(JSON.stringify(updates.labels));
      }

      if (updates.properties) {
        setParts.push('properties = ?');
        params.push(JSON.stringify(updates.properties));
      }

      if (setParts.length === 0) {
        logger.debug('No updates specified for node', { id });
        return;
      }

      params.push(id);
      const sql = `UPDATE graph_nodes SET ${setParts.join(', ')} WHERE id = ?`;
      await this.connection.execute(sql, params);

      logger.debug('Graph node updated', { id });
    } catch (error) {
      logger.error('Failed to update graph node', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to update node:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async deleteNode(id: string): Promise<boolean> {
    try {
      logger.debug('Deleting graph node', { id });

      await this.ensureNodesTable();

      const result = await this.connection.execute(
        `DELETE FROM graph_nodes WHERE id = ?`,
        [id]
      );

      const deleted = (result.affectedRows ?? 0) > 0;
      logger.debug('Graph node deletion completed', { id, deleted });

      return deleted;
    } catch (error) {
      logger.error('Failed to delete graph node', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to delete node:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async addEdge(
    edge: Omit<GraphEdge, 'id'> & { id?: string }
  ): Promise<string> {
    try {
      const edgeId = edge.id || this.generateEdgeId();

      logger.debug('Creating graph edge', {
        type: edge.type,
        edgeId,
        fromId: edge.fromId,
        toId: edge.toId,
      });

      await this.ensureEdgesTable();

      const sql = `INSERT INTO graph_edges (id, from_id, to_id, type, properties, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`;
      await this.connection.execute(sql, [
        edgeId,
        edge.fromId,
        edge.toId,
        edge.type,
        JSON.stringify(edge.properties || {}),
      ]);

      logger.debug('Graph edge created', { type: edge.type, edgeId });
      return edgeId;
    } catch (error) {
      logger.error('Failed to create graph edge', {
        id: edge.id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to create edge:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async getEdge(id: string): Promise<GraphEdge | null> {
    try {
      logger.debug('Getting graph edge', { id });

      await this.ensureEdgesTable();

      const sql = `SELECT id, from_id, to_id, type, properties FROM graph_edges WHERE id = ?`;
      const result = await this.connection.query<{
        id: string;
        from_id: string;
        to_id: string;
        type: string;
        properties: string;
      }>(sql, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      if (!row) {
        return null;
      }
      
      return {
        id: row.id,
        fromId: row.from_id,
        toId: row.to_id,
        type: row.type,
        properties: JSON.parse(row.properties),
      };
    } catch (error) {
      logger.error('Failed to get graph edge', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to get edge:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async updateEdge(
    id: string,
    updates: Partial<Omit<GraphEdge, 'id'>>
  ): Promise<void> {
    try {
      logger.debug('Updating graph edge', {
        id,
        hasType: !!updates.type,
        hasProperties: !!updates.properties,
      });

      await this.ensureEdgesTable();

      const setParts: string[] = [];
      const params: unknown[] = [];

      if (updates.type) {
        setParts.push('type = ?');
        params.push(updates.type);
      }

      if (updates.properties) {
        setParts.push('properties = ?');
        params.push(JSON.stringify(updates.properties));
      }

      if (updates.fromId) {
        setParts.push('from_id = ?');
        params.push(updates.fromId);
      }

      if (updates.toId) {
        setParts.push('to_id = ?');
        params.push(updates.toId);
      }

      if (setParts.length === 0) {
        logger.debug('No updates specified for edge', { id });
        return;
      }

      params.push(id);
      const sql = `UPDATE graph_edges SET ${setParts.join(', ')} WHERE id = ?`;
      await this.connection.execute(sql, params);

      logger.debug('Graph edge updated', { id });
    } catch (error) {
      logger.error('Failed to update graph edge', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to update edge:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async deleteEdge(id: string): Promise<boolean> {
    try {
      logger.debug('Deleting graph edge', { id });

      await this.ensureEdgesTable();

      const result = await this.connection.execute(
        `DELETE FROM graph_edges WHERE id = ?`,
        [id]
      );

      const deleted = (result.affectedRows ?? 0) > 0;
      logger.debug('Graph edge deletion completed', { id, deleted });

      return deleted;
    } catch (error) {
      logger.error('Failed to delete graph edge', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to delete edge:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async getConnections(
    nodeId: string,
    direction?: 'in' | 'out' | 'both',
    edgeType?: string
  ): Promise<readonly GraphEdge[]> {
    try {
      logger.debug('Getting node connections', { nodeId, direction, edgeType });

      await this.ensureEdgesTable();

      let whereClause = '';
      const params: unknown[] = [];

      if (direction === 'in') {
        whereClause = 'WHERE to_id = ?';
        params.push(nodeId);
      } else if (direction === 'out') {
        whereClause = 'WHERE from_id = ?';
        params.push(nodeId);
      } else {
        whereClause = 'WHERE from_id = ? OR to_id = ?';
        params.push(nodeId, nodeId);
      }

      if (edgeType) {
        whereClause += params.length > 0 ? ' AND type = ?' : 'WHERE type = ?';
        params.push(edgeType);
      }

      const sql = `SELECT id, from_id, to_id, type, properties FROM graph_edges ${whereClause}`;
      const result = await this.connection.query<{
        id: string;
        from_id: string;
        to_id: string;
        type: string;
        properties: string;
      }>(sql, params);

      const edges = result.rows.map((row) => ({
        id: row.id,
        fromId: row.from_id,
        toId: row.to_id,
        type: row.type,
        properties: JSON.parse(row.properties),
      }));

      logger.debug('Node connections retrieved', {
        nodeId,
        edgeCount: edges.length,
      });
      return edges;
    } catch (error) {
      logger.error('Failed to get node connections', {
        nodeId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to get connections:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async findPath(
    fromId: string,
    toId: string,
    options?: {
      maxDepth?: number;
      edgeTypes?: readonly string[];
      algorithm?: 'bfs' | 'dfs' | 'dijkstra' | 'astar';
    }
  ): Promise<readonly GraphNode[]> {
    try {
      logger.debug('Finding path between nodes', {
        fromId,
        toId,
        maxDepth: options?.maxDepth,
        algorithm: options?.algorithm,
      });

      // Simplified BFS implementation for SQLite fallback
      const visited = new Set<string>();
      const queue: { nodeId: string; path: string[] }[] = [
        { nodeId: fromId, path: [fromId] },
      ];
      const maxDepth = options?.maxDepth || 10;

      while (queue.length > 0) {
        const current = queue.shift()!;

        if (current.nodeId === toId) {
          return await this.buildPathNodes(current.path);
        }

        if (current.path.length >= maxDepth || visited.has(current.nodeId)) {
          continue;
        }

        visited.add(current.nodeId);

        // Get outgoing connections
        const connections = await this.getConnections(current.nodeId, 'out');
        for (const edge of connections) {
          if (!options?.edgeTypes || options.edgeTypes.includes(edge.type)) {
            queue.push({
              nodeId: edge.toId,
              path: [...current.path, edge.toId],
            });
          }
        }
      }

      logger.debug('No path found between nodes', { fromId, toId });
      return [];
    } catch (error) {
      logger.error('Failed to find path', {
        fromId,
        toId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to find path:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  private async buildPathNodes(path: string[]): Promise<readonly GraphNode[]> {
    const pathNodes: GraphNode[] = [];
    for (const nodeId of path) {
      const node = await this.getNode(nodeId);
      if (node) pathNodes.push(node);
    }
    return pathNodes;
  }

  async query(
    cypher: string,
    params?: Readonly<Record<string, unknown>>
  ): Promise<GraphResult> {
    try {
      logger.debug('Executing graph query', {
        cypher: cypher.slice(0, 100),
        paramCount: Object.keys(params || {}).length,
      });

      // For SQLite fallback, we'll do a simplified translation of basic Cypher
      // In a real implementation, this would use a proper Cypher engine
      const startTime = Date.now();

      // Very basic Cypher-to-SQL translation for demonstration
      if (
        cypher.toLowerCase().includes('match') &&
        cypher.toLowerCase().includes('return')
      ) {
        // Simple node query
        const nodeResult = await this.connection.query<{
          id: string;
          labels: string;
          properties: string;
        }>(`SELECT id, labels, properties FROM graph_nodes LIMIT 10`);

        const nodes = nodeResult.rows.map((row) => ({
          id: row.id,
          labels: JSON.parse(row.labels),
          properties: JSON.parse(row.properties),
        }));

        return {
          nodes,
          edges: [],
          executionTimeMs: Date.now() - startTime,
        };
      }

      return {
        nodes: [],
        edges: [],
        executionTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      logger.error('Failed to execute graph query', {
        cypher: cypher.slice(0, 100),
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to execute query:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async createNodeLabel(
    label: string,
    properties?: Readonly<Record<string, string>>
  ): Promise<void> {
    try {
      logger.debug('Creating node label', {
        label,
        propertyCount: Object.keys(properties || {}).length,
      });

      // Create constraint for node uniqueness
      const constraintQuery = `CREATE TABLE IF NOT EXISTS node_labels_${label} (id TEXT PRIMARY KEY)`;
      await this.connection.execute(constraintQuery);

      logger.info('Node label created', {
        label,
        properties,
      });
    } catch (error) {
      logger.error('Failed to create node label', {
        label,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to create node label:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async createEdgeType(
    type: string,
    properties?: Readonly<Record<string, string>>
  ): Promise<void> {
    try {
      logger.debug('Creating edge type', {
        type,
        propertyCount: Object.keys(properties || {}).length,
      });

      // Create table for edge type
      const edgeTableQuery = `CREATE TABLE IF NOT EXISTS edge_types_${type} (from_id TEXT, to_id TEXT, properties TEXT)`;
      await this.connection.execute(edgeTableQuery);

      logger.info('Edge type created', {
        type,
        properties,
      });
    } catch (error) {
      logger.error('Failed to create edge type', {
        type,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to create edge type:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  async getStats(): Promise<{
    nodeCount: number;
    edgeCount: number;
    labelCounts: Readonly<Record<string, number>>;
    edgeTypeCounts: Readonly<Record<string, number>>;
  }> {
    try {
      await this.ensureNodesTable();
      await this.ensureEdgesTable();

      const nodeResult = await this.connection.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM graph_nodes`
      );
      const edgeResult = await this.connection.query<{ count: number }>(
        `SELECT COUNT(*) as count FROM graph_edges`
      );

      // Get label counts
      const labelResult = await this.connection.query<{ labels: string }>(
        `SELECT labels FROM graph_nodes`
      );
      const labelCounts: Record<string, number> = {};
      for (const row of labelResult.rows) {
        const labels = JSON.parse(row.labels) as string[];
        for (const label of labels) {
          labelCounts[label] = (labelCounts[label] || 0) + 1;
        }
      }

      // Get edge type counts
      const typeResult = await this.connection.query<{ type: string }>(
        `SELECT type FROM graph_edges`
      );
      const edgeTypeCounts: Record<string, number> = {};
      for (const row of typeResult.rows) {
        edgeTypeCounts[row.type] = (edgeTypeCounts[row.type] || 0) + 1;
      }

      return {
        nodeCount: nodeResult.rows[0]?.count || 0,
        edgeCount: edgeResult.rows[0]?.count || 0,
        labelCounts,
        edgeTypeCounts,
      };
    } catch (error) {
      logger.error('Failed to get graph stats', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to get stats:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  // Private helper methods
  private generateCorrelationId(): string {
    return `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateNodeId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateEdgeId(): string {
    return `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async ensureNodesTable(): Promise<void> {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS graph_nodes (
        id TEXT PRIMARY KEY,
        labels TEXT NOT NULL,
        properties TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;

      await this.connection.execute(sql);
    } catch (error) {
      logger.error('Failed to create nodes table', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to create nodes table:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }

  private async ensureEdgesTable(): Promise<void> {
    try {
      const sql = `CREATE TABLE IF NOT EXISTS graph_edges (
        id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        type TEXT NOT NULL,
        properties TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_id) REFERENCES graph_nodes(id),
        FOREIGN KEY (to_id) REFERENCES graph_nodes(id)
      )`;

      await this.connection.execute(sql);
    } catch (error) {
      logger.error('Failed to create edges table', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new QueryError(
        `Failed to create edges table:${error instanceof Error ? error.message : String(error)}`,
        createErrorOptions(this.generateCorrelationId(), error)
      );
    }
  }
}
