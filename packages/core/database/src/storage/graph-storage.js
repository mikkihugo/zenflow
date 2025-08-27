/**
 * Graph Storage Implementation
 *
 * Provides graph database operations with node/edge management,
 * path traversal, and performance monitoring.
 */
import { getLogger } from "../logger.js";
import { QueryError, } from "../types/index.js";
const logger = getLogger("graph-storage");
export class GraphStorageImpl {
    connection;
    config;
    constructor(connection, config) {
        this.connection = connection;
        this.config = config;
    }
    async addNode(node) {
        try {
            const nodeId = node.id || this.generateNodeId();
            logger.debug("Creating graph node", {
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
            logger.debug("Graph node created", { labels: node.labels, nodeId });
            return nodeId;
        }
        catch (error) {
            logger.error("Failed to create graph node", {
                id: node.id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to create node: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async getNode(id) {
        try {
            logger.debug("Getting graph node", { id });
            await this.ensureNodesTable();
            const sql = `SELECT id, labels, properties FROM graph_nodes WHERE id = ?`;
            const result = await this.connection.query(sql, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return {
                id: row.id,
                labels: JSON.parse(row.labels),
                properties: JSON.parse(row.properties),
            };
        }
        catch (error) {
            logger.error("Failed to get graph node", {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to get node: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async updateNode(id, updates) {
        try {
            logger.debug("Updating graph node", {
                id,
                hasLabels: !!updates.labels,
                hasProperties: !!updates.properties,
            });
            await this.ensureNodesTable();
            const setParts = [];
            const params = [];
            if (updates.labels) {
                setParts.push("labels = ?");
                params.push(JSON.stringify(updates.labels));
            }
            if (updates.properties) {
                setParts.push("properties = ?");
                params.push(JSON.stringify(updates.properties));
            }
            if (setParts.length === 0) {
                logger.debug("No updates specified for node", { id });
                return;
            }
            params.push(id);
            const sql = `UPDATE graph_nodes SET ${setParts.join(", ")} WHERE id = ?`;
            await this.connection.execute(sql, params);
            logger.debug("Graph node updated", { id });
        }
        catch (error) {
            logger.error("Failed to update graph node", {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to update node: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async deleteNode(id) {
        try {
            logger.debug("Deleting graph node", { id });
            await this.ensureNodesTable();
            const result = await this.connection.execute(`DELETE FROM graph_nodes WHERE id = ?`, [id]);
            const deleted = (result.affectedRows ?? 0) > 0;
            logger.debug("Graph node deletion completed", { id, deleted });
            return deleted;
        }
        catch (error) {
            logger.error("Failed to delete graph node", {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to delete node: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async addEdge(edge) {
        try {
            const edgeId = edge.id || this.generateEdgeId();
            logger.debug("Creating graph edge", {
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
            logger.debug("Graph edge created", { type: edge.type, edgeId });
            return edgeId;
        }
        catch (error) {
            logger.error("Failed to create graph edge", {
                id: edge.id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to create edge: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async getEdge(id) {
        try {
            logger.debug("Getting graph edge", { id });
            await this.ensureEdgesTable();
            const sql = `SELECT id, from_id, to_id, type, properties FROM graph_edges WHERE id = ?`;
            const result = await this.connection.query(sql, [id]);
            if (result.rows.length === 0) {
                return null;
            }
            const row = result.rows[0];
            return {
                id: row.id,
                fromId: row.from_id,
                toId: row.to_id,
                type: row.type,
                properties: JSON.parse(row.properties),
            };
        }
        catch (error) {
            logger.error("Failed to get graph edge", {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to get edge: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async updateEdge(id, updates) {
        try {
            logger.debug("Updating graph edge", {
                id,
                hasType: !!updates.type,
                hasProperties: !!updates.properties,
            });
            await this.ensureEdgesTable();
            const setParts = [];
            const params = [];
            if (updates.type) {
                setParts.push("type = ?");
                params.push(updates.type);
            }
            if (updates.properties) {
                setParts.push("properties = ?");
                params.push(JSON.stringify(updates.properties));
            }
            if (updates.fromId) {
                setParts.push("from_id = ?");
                params.push(updates.fromId);
            }
            if (updates.toId) {
                setParts.push("to_id = ?");
                params.push(updates.toId);
            }
            if (setParts.length === 0) {
                logger.debug("No updates specified for edge", { id });
                return;
            }
            params.push(id);
            const sql = `UPDATE graph_edges SET ${setParts.join(", ")} WHERE id = ?`;
            await this.connection.execute(sql, params);
            logger.debug("Graph edge updated", { id });
        }
        catch (error) {
            logger.error("Failed to update graph edge", {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to update edge: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async deleteEdge(id) {
        try {
            logger.debug("Deleting graph edge", { id });
            await this.ensureEdgesTable();
            const result = await this.connection.execute(`DELETE FROM graph_edges WHERE id = ?`, [id]);
            const deleted = (result.affectedRows ?? 0) > 0;
            logger.debug("Graph edge deletion completed", { id, deleted });
            return deleted;
        }
        catch (error) {
            logger.error("Failed to delete graph edge", {
                id,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to delete edge: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async getConnections(nodeId, direction, edgeType) {
        try {
            logger.debug("Getting node connections", { nodeId, direction, edgeType });
            await this.ensureEdgesTable();
            let whereClause = "";
            const params = [];
            if (direction === "in") {
                whereClause = "WHERE to_id = ?";
                params.push(nodeId);
            }
            else if (direction === "out") {
                whereClause = "WHERE from_id = ?";
                params.push(nodeId);
            }
            else {
                whereClause = "WHERE from_id = ? OR to_id = ?";
                params.push(nodeId, nodeId);
            }
            if (edgeType) {
                whereClause += params.length > 0 ? " AND type = ?" : "WHERE type = ?";
                params.push(edgeType);
            }
            const sql = `SELECT id, from_id, to_id, type, properties FROM graph_edges ${whereClause}`;
            const result = await this.connection.query(sql, params);
            const edges = result.rows.map((row) => ({
                id: row.id,
                fromId: row.from_id,
                toId: row.to_id,
                type: row.type,
                properties: JSON.parse(row.properties),
            }));
            logger.debug("Node connections retrieved", {
                nodeId,
                edgeCount: edges.length,
            });
            return edges;
        }
        catch (error) {
            logger.error("Failed to get node connections", {
                nodeId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to get connections: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async findPath(fromId, toId, options) {
        try {
            logger.debug("Finding path between nodes", {
                fromId,
                toId,
                maxDepth: options?.maxDepth,
                algorithm: options?.algorithm,
            });
            // Simplified BFS implementation for SQLite fallback
            const visited = new Set();
            const queue = [
                { nodeId: fromId, path: [fromId] },
            ];
            const maxDepth = options?.maxDepth || 10;
            while (queue.length > 0) {
                const current = queue.shift();
                if (current.nodeId === toId) {
                    // Found path - get node details
                    const pathNodes = [];
                    for (const nodeId of current.path) {
                        const node = await this.getNode(nodeId);
                        if (node)
                            pathNodes.push(node);
                    }
                    return pathNodes;
                }
                if (current.path.length >= maxDepth || visited.has(current.nodeId)) {
                    continue;
                }
                visited.add(current.nodeId);
                // Get outgoing connections
                const connections = await this.getConnections(current.nodeId, "out");
                for (const edge of connections) {
                    if (!options?.edgeTypes || options.edgeTypes.includes(edge.type)) {
                        queue.push({
                            nodeId: edge.toId,
                            path: [...current.path, edge.toId],
                        });
                    }
                }
            }
            logger.debug("No path found between nodes", { fromId, toId });
            return [];
        }
        catch (error) {
            logger.error("Failed to find path", {
                fromId,
                toId,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to find path: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async query(cypher, params) {
        try {
            logger.debug("Executing graph query", {
                cypher: cypher.slice(0, 100),
                paramCount: Object.keys(params || {}).length,
            });
            // For SQLite fallback, we'll do a simplified translation of basic Cypher
            // In a real implementation, this would use a proper Cypher engine
            const startTime = Date.now();
            // Very basic Cypher-to-SQL translation for demonstration
            if (cypher.toLowerCase().includes("match") &&
                cypher.toLowerCase().includes("return")) {
                // Simple node query
                const nodeResult = await this.connection.query(`SELECT id, labels, properties FROM graph_nodes LIMIT 10`);
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
        }
        catch (error) {
            logger.error("Failed to execute graph query", {
                cypher: cypher.slice(0, 100),
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to execute query: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async createNodeLabel(label, properties) {
        try {
            logger.debug("Creating node label", {
                label,
                propertyCount: Object.keys(properties || {}).length,
            });
            // Create constraint for node uniqueness
            const constraintQuery = `CREATE TABLE IF NOT EXISTS node_labels_${label} (id TEXT PRIMARY KEY)`;
            await this.connection.execute(constraintQuery);
            logger.info("Node label created", {
                label,
                properties,
            });
        }
        catch (error) {
            logger.error("Failed to create node label", {
                label,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to create node label: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async createEdgeType(type, properties) {
        try {
            logger.debug("Creating edge type", {
                type,
                propertyCount: Object.keys(properties || {}).length,
            });
            // Create table for edge type
            const edgeTableQuery = `CREATE TABLE IF NOT EXISTS edge_types_${type} (from_id TEXT, to_id TEXT, properties TEXT)`;
            await this.connection.execute(edgeTableQuery);
            logger.info("Edge type created", {
                type,
                properties,
            });
        }
        catch (error) {
            logger.error("Failed to create edge type", {
                type,
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to create edge type: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async getStats() {
        try {
            await this.ensureNodesTable();
            await this.ensureEdgesTable();
            const nodeResult = await this.connection.query(`SELECT COUNT(*) as count FROM graph_nodes`);
            const edgeResult = await this.connection.query(`SELECT COUNT(*) as count FROM graph_edges`);
            // Get label counts
            const labelResult = await this.connection.query(`SELECT labels FROM graph_nodes`);
            const labelCounts = {};
            for (const row of labelResult.rows) {
                const labels = JSON.parse(row.labels);
                for (const label of labels) {
                    labelCounts[label] = (labelCounts[label] || 0) + 1;
                }
            }
            // Get edge type counts
            const typeResult = await this.connection.query(`SELECT type FROM graph_edges`);
            const edgeTypeCounts = {};
            for (const row of typeResult.rows) {
                edgeTypeCounts[row.type] = (edgeTypeCounts[row.type] || 0) + 1;
            }
            return {
                nodeCount: nodeResult.rows[0]?.count || 0,
                edgeCount: edgeResult.rows[0]?.count || 0,
                labelCounts,
                edgeTypeCounts,
            };
        }
        catch (error) {
            logger.error("Failed to get graph stats", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to get stats: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    // Private helper methods
    generateCorrelationId() {
        return `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateNodeId() {
        return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    generateEdgeId() {
        return `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async ensureNodesTable() {
        try {
            const sql = `CREATE TABLE IF NOT EXISTS graph_nodes (
        id TEXT PRIMARY KEY,
        labels TEXT NOT NULL,
        properties TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`;
            await this.connection.execute(sql);
        }
        catch (error) {
            logger.error("Failed to create nodes table", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to create nodes table: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
    async ensureEdgesTable() {
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
        }
        catch (error) {
            logger.error("Failed to create edges table", {
                error: error instanceof Error ? error.message : String(error),
            });
            throw new QueryError(`Failed to create edges table: ${error instanceof Error ? error.message : String(error)}`, {
                correlationId: this.generateCorrelationId(),
                cause: error instanceof Error ? error : undefined,
            });
        }
    }
}
