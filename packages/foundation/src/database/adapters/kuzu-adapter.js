/**
 * Real Kuzu Database Adapter
 *
 * Real Kuzu adapter using kuzu library for production graph database operations
 */
import { Database, Connection } from 'kuzu';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { getLogger } from '@claude-zen/foundation';
const logger = getLogger('kuzu-adapter');
export class KuzuAdapter {
    database = null;
    connection = null;
    config;
    connected = false;
    constructor(config) {
        this.config = config;
    }
    async connect() {
        if (this.connected)
            return;
        try {
            // Ensure directory exists for database
            const dbDir = dirname(this.config.database);
            if (!existsSync(dbDir)) {
                mkdirSync(dbDir, { recursive: true });
            }
            // Create real Kuzu database
            this.database = new Database(this.config.database);
            // Create connection
            this.connection = new Connection(this.database);
            // Initialize default schema
            await this.initializeSchema();
            this.connected = true;
            logger.info(`✅ Connected to real Kuzu database: ${this.config.database}`);
        }
        catch (error) {
            logger.error(`❌ Failed to connect to Kuzu database: ${error}`);
            throw error;
        }
    }
    async disconnect() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        if (this.database) {
            this.database.close();
            this.database = null;
        }
        this.connected = false;
        logger.info('✅ Disconnected from Kuzu database');
    }
    async initializeSchema() {
        if (!this.connection)
            return;
        try {
            // Create node tables
            const nodeSchemas = [
                'CREATE NODE TABLE IF NOT EXISTS Document(id STRING, type STRING, title STRING, content STRING, status STRING, priority STRING, author STRING, project_id STRING, created_at TIMESTAMP, updated_at TIMESTAMP, PRIMARY KEY(id))',
                'CREATE NODE TABLE IF NOT EXISTS Project(id STRING, name STRING, description STRING, domain STRING, complexity STRING, author STRING, created_at TIMESTAMP, updated_at TIMESTAMP, PRIMARY KEY(id))',
                'CREATE NODE TABLE IF NOT EXISTS User(id STRING, name STRING, email STRING, role STRING, created_at TIMESTAMP, PRIMARY KEY(id))',
                'CREATE NODE TABLE IF NOT EXISTS Tag(id STRING, name STRING, category STRING, created_at TIMESTAMP, PRIMARY KEY(id))',
            ];
            // Create relationship tables
            const relationshipSchemas = [
                'CREATE REL TABLE IF NOT EXISTS RELATES_TO(FROM Document TO Document, strength DOUBLE, relationship_type STRING, created_at TIMESTAMP, metadata STRING)',
                'CREATE REL TABLE IF NOT EXISTS BELONGS_TO(FROM Document TO Project, assigned_at TIMESTAMP)',
                'CREATE REL TABLE IF NOT EXISTS AUTHORED_BY(FROM Document TO User, authored_at TIMESTAMP)',
                'CREATE REL TABLE IF NOT EXISTS TAGGED_WITH(FROM Document TO Tag, tagged_at TIMESTAMP)',
                'CREATE REL TABLE IF NOT EXISTS DEPENDS_ON(FROM Document TO Document, dependency_type STRING, strength DOUBLE, created_at TIMESTAMP)',
                'CREATE REL TABLE IF NOT EXISTS IMPLEMENTS(FROM Document TO Document, implementation_status STRING, created_at TIMESTAMP)',
                'CREATE REL TABLE IF NOT EXISTS SUPERSEDES(FROM Document TO Document, superseded_at TIMESTAMP, reason STRING)',
            ];
            // Execute schema creation
            for (const schema of [...nodeSchemas, ...relationshipSchemas]) {
                try {
                    await this.connection.query(schema);
                }
                catch (error) {
                    // Ignore "already exists" errors
                    if (!error.toString().includes('already exists')) {
                        logger.warn(`Schema creation warning: ${error}`);
                    }
                }
            }
            logger.info('✅ Kuzu schema initialized');
        }
        catch (error) {
            logger.error(`❌ Failed to initialize Kuzu schema: ${error}`);
            throw error;
        }
    }
    async createNode(label, properties) {
        if (!this.connected)
            await this.connect();
        if (!this.connection)
            throw new Error('Database not connected');
        try {
            const id = properties.id ||
                `${label}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const propsWithId = { id, ...properties };
            const propKeys = Object.keys(propsWithId);
            const propValues = Object.values(propsWithId);
            const propPlaceholders = propValues.map(() => '$').join(', ');
            const query = `CREATE (n:${label} {${propKeys.join(', ')}: ${propPlaceholders}}) RETURN n.id`;
            // Kuzu doesn't support parameterized queries like SQL - embed values directly
            const queryWithValues = this.embedParameters(query, propValues);
            const result = await this.connection.query(queryWithValues);
            logger.debug(`✅ Created node: ${label} with ID ${id}`);
            return id;
        }
        catch (error) {
            logger.error(`❌ Failed to create node: ${error}`);
            throw error;
        }
    }
    async createRelationship(fromId, toId, relationshipType, properties = {}) {
        if (!this.connected)
            await this.connect();
        if (!this.connection)
            throw new Error('Database not connected');
        try {
            const relationshipId = `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const propsWithTimestamp = {
                ...properties,
                created_at: new Date().toISOString(),
            };
            const propKeys = Object.keys(propsWithTimestamp);
            const propValues = Object.values(propsWithTimestamp);
            let query;
            let params;
            if (propKeys.length > 0) {
                const propAssignments = propKeys
                    .map((key) => `r.${key} = $`)
                    .join(', ');
                query = `MATCH (from {id: $}), (to {id: $}) CREATE (from)-[r:${relationshipType}]->(to) SET ${propAssignments} RETURN r`;
                params = [fromId, toId, ...propValues];
            }
            else {
                query = `MATCH (from {id: $}), (to {id: $}) CREATE (from)-[r:${relationshipType}]->(to) RETURN r`;
                params = [fromId, toId];
            }
            await this.connection.query(this.embedParameters(query, params));
            logger.debug(`✅ Created relationship: ${relationshipType} from ${fromId} to ${toId}`);
            return relationshipId;
        }
        catch (error) {
            logger.error(`❌ Failed to create relationship: ${error}`);
            throw error;
        }
    }
    async findNodes(label, properties = {}, options = {}) {
        if (!this.connected)
            await this.connect();
        if (!this.connection)
            throw new Error('Database not connected');
        try {
            let query = `MATCH (n:${label})`;
            const params = [];
            // Add WHERE clause for properties
            if (Object.keys(properties).length > 0) {
                const conditions = Object.entries(properties).map(([key, value]) => {
                    params.push(value);
                    return `n.${key} = $`;
                });
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            // Add WHERE clause from options
            if (options.where) {
                const additionalConditions = Object.entries(options.where).map(([key, value]) => {
                    params.push(value);
                    return `n.${key} = $`;
                });
                if (Object.keys(properties).length > 0) {
                    query += ` AND ${additionalConditions.join(' AND ')}`;
                }
                else {
                    query += ` WHERE ${additionalConditions.join(' AND ')}`;
                }
            }
            query += ' RETURN n';
            // Add ORDER BY
            if (options.orderBy) {
                query += ` ORDER BY n.${options.orderBy}`;
            }
            // Add LIMIT and OFFSET
            if (options.limit) {
                query += ` LIMIT ${options.limit}`;
            }
            if (options.offset) {
                query += ` OFFSET ${options.offset}`;
            }
            const result = await this.connection.query(this.embedParameters(query, params));
            const nodes = [];
            while (result.hasNext()) {
                const row = result.getNext();
                const nodeData = row[0]; // First column is the node
                nodes.push({
                    id: nodeData.id,
                    label: label,
                    properties: nodeData,
                });
            }
            logger.debug(`✅ Found ${nodes.length} nodes with label ${label}`);
            return nodes;
        }
        catch (error) {
            logger.error(`❌ Failed to find nodes: ${error}`);
            throw error;
        }
    }
    async findRelationships(fromId, toId, relationshipType, options = {}) {
        if (!this.connected)
            await this.connect();
        if (!this.connection)
            throw new Error('Database not connected');
        try {
            let query = 'MATCH (from)-[r';
            const params = [];
            if (relationshipType) {
                query += `:${relationshipType}`;
            }
            query += ']->(to)';
            // Add WHERE conditions
            const conditions = [];
            if (fromId) {
                conditions.push('from.id = $');
                params.push(fromId);
            }
            if (toId) {
                conditions.push('to.id = $');
                params.push(toId);
            }
            if (options.where) {
                Object.entries(options.where).forEach(([key, value]) => {
                    conditions.push(`r.${key} = $`);
                    params.push(value);
                });
            }
            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
            query += ' RETURN r, from.id, to.id';
            // Add ORDER BY
            if (options.orderBy) {
                query += ` ORDER BY r.${options.orderBy}`;
            }
            // Add LIMIT and OFFSET
            if (options.limit) {
                query += ` LIMIT ${options.limit}`;
            }
            if (options.offset) {
                query += ` OFFSET ${options.offset}`;
            }
            const result = await this.connection.query(this.embedParameters(query, params));
            const relationships = [];
            while (result.hasNext()) {
                const row = result.getNext();
                const relationshipData = row[0]; // Relationship
                const fromNodeId = row[1]; // From node ID
                const toNodeId = row[2]; // To node ID
                relationships.push({
                    id: `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    from: fromNodeId,
                    to: toNodeId,
                    type: relationshipType || 'UNKNOWN',
                    properties: relationshipData,
                });
            }
            logger.debug(`✅ Found ${relationships.length} relationships`);
            return relationships;
        }
        catch (error) {
            logger.error(`❌ Failed to find relationships: ${error}`);
            throw error;
        }
    }
    async getNeighbors(nodeId, depth = 1, relationshipType) {
        if (!this.connected)
            await this.connect();
        if (!this.connection)
            throw new Error('Database not connected');
        try {
            let query = `MATCH path = (start {id: $})-[r`;
            if (relationshipType) {
                query += `:${relationshipType}`;
            }
            query += `*1..${depth}]-(neighbor) RETURN nodes(path), relationships(path)`;
            const result = await this.connection.query(this.embedParameters(query, [nodeId]));
            const nodes = [];
            const relationships = [];
            const nodeIds = new Set();
            const relIds = new Set();
            while (result.hasNext()) {
                const row = result.getNext();
                const pathNodes = row[0]; // Nodes in path
                const pathRels = row[1]; // Relationships in path
                // Process nodes
                for (const node of pathNodes) {
                    if (!nodeIds.has(node.id)) {
                        nodes.push({
                            id: node.id,
                            label: 'Unknown', // Kuzu doesn't return label info in path results
                            properties: node,
                        });
                        nodeIds.add(node.id);
                    }
                }
                // Process relationships
                for (const rel of pathRels) {
                    const relId = `rel_${rel.id || Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    if (!relIds.has(relId)) {
                        relationships.push({
                            id: relId,
                            from: rel.src.id,
                            to: rel.dst.id,
                            type: rel.type || 'UNKNOWN',
                            properties: rel,
                        });
                        relIds.add(relId);
                    }
                }
            }
            logger.debug(`✅ Found ${nodes.length} neighbors and ${relationships.length} relationships for node ${nodeId}`);
            return { nodes, relationships };
        }
        catch (error) {
            logger.error(`❌ Failed to get neighbors: ${error}`);
            throw error;
        }
    }
    async updateNode(id, properties) {
        if (!this.connected)
            await this.connect();
        if (!this.connection)
            throw new Error('Database not connected');
        try {
            const propsWithUpdate = {
                ...properties,
                updated_at: new Date().toISOString(),
            };
            const setPairs = Object.keys(propsWithUpdate).map((key) => `n.${key} = $`);
            const query = `MATCH (n {id: $}) SET ${setPairs.join(', ')} RETURN n`;
            const queryWithValues = this.embedParameters(query, [
                id,
                ...Object.values(propsWithUpdate),
            ]);
            await this.connection.query(queryWithValues);
            logger.debug(`✅ Updated node ${id}`);
        }
        catch (error) {
            logger.error(`❌ Failed to update node: ${error}`);
            throw error;
        }
    }
    async deleteNode(id) {
        if (!this.connected)
            await this.connect();
        if (!this.connection)
            throw new Error('Database not connected');
        try {
            // Delete node and all its relationships
            const query = `MATCH (n {id: $}) DETACH DELETE n`;
            const queryWithValues = this.embedParameters(query, [id]);
            await this.connection.query(queryWithValues);
            logger.debug(`✅ Deleted node ${id}`);
        }
        catch (error) {
            logger.error(`❌ Failed to delete node: ${error}`);
            throw error;
        }
    }
    // Compatibility methods for database adapter interface
    async query(cypher, params = []) {
        if (!this.connected)
            await this.connect();
        if (!this.connection)
            throw new Error('Database not connected');
        logger.debug(`Executing Cypher query: ${cypher}`, { params });
        try {
            const queryWithValues = this.embedParameters(cypher, params);
            const result = await this.connection.query(queryWithValues);
            const rows = [];
            // Safely check for results before calling getNext()
            try {
                while (result.hasNext()) {
                    const row = result.getNext();
                    rows.push(row);
                }
            }
            catch (getNextError) {
                // If no results available, that's ok - just return empty array
                logger.debug('No results available from query');
            }
            return {
                rows: rows,
                rowCount: rows.length,
                fields: [],
                executionTime: 1,
            };
        }
        catch (error) {
            logger.error(`Query failed: ${error}`);
            throw error;
        }
    }
    async execute(cypher, params = []) {
        if (!this.connected)
            await this.connect();
        if (!this.connection)
            throw new Error('Database not connected');
        logger.debug(`Executing Cypher command: ${cypher}`, { params });
        try {
            const queryWithValues = this.embedParameters(cypher, params);
            const result = await this.connection.query(queryWithValues);
            return {
                affectedRows: 1, // Kuzu doesn't provide exact affected rows
                insertId: null,
                executionTime: 1,
            };
        }
        catch (error) {
            logger.error(`Execute failed: ${error}`);
            throw error;
        }
    }
    async transaction(fn) {
        // Kuzu doesn't support explicit transactions like SQL databases
        // Execute operations sequentially
        const tx = {
            query: this.query.bind(this),
            execute: this.execute.bind(this),
        };
        try {
            return await fn(tx);
        }
        catch (error) {
            logger.error('Transaction failed:', error);
            throw error;
        }
    }
    async health() {
        if (!this.connected || !this.connection)
            return false;
        try {
            // Test connection with simple query
            await this.connection.query('RETURN 1');
            return true;
        }
        catch {
            return false;
        }
    }
    async getSchema() {
        if (!this.connected || !this.connection)
            return { tables: [], views: [] };
        try {
            // Use fallback to known schema - safer approach for Kuzu
            return {
                tables: ['Document', 'Project', 'User', 'Tag'].map((name) => ({
                    name,
                    type: 'node_table',
                })),
                views: [],
            };
        }
        catch (error) {
            logger.error('Failed to get schema:', error);
            return { tables: [], views: [] };
        }
    }
    async getConnectionStats() {
        return {
            total: 1,
            active: this.connected ? 1 : 0,
            idle: this.connected ? 0 : 1,
            utilization: this.connected ? 100 : 0,
        };
    }
    // Helper method to parse buffer size string to bytes
    parseBufferSize(sizeStr) {
        const size = sizeStr.toLowerCase();
        const num = parseFloat(size);
        if (size.includes('gb')) {
            return Math.floor(num * 1024 * 1024 * 1024);
        }
        else if (size.includes('mb')) {
            return Math.floor(num * 1024 * 1024);
        }
        else if (size.includes('kb')) {
            return Math.floor(num * 1024);
        }
        else {
            // Assume bytes
            return Math.floor(num);
        }
    }
    // Helper method to embed parameters into Kuzu queries (since Kuzu doesn't support parameterized queries)
    embedParameters(query, params) {
        let result = query;
        let paramIndex = 0;
        // Replace $paramName or $ placeholders with actual values
        result = result.replace(/\$\w+|\$/g, (match) => {
            if (paramIndex < params.length) {
                const value = params[paramIndex++];
                if (Array.isArray(value)) {
                    // Handle array parameters (e.g., for IN clauses)
                    return `[${value.map((v) => (typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : v)).join(', ')}]`;
                }
                else if (typeof value === 'string') {
                    return `'${value.replace(/'/g, "''")}'`; // Escape single quotes
                }
                else if (typeof value === 'number') {
                    return value.toString();
                }
                else if (value === null || value === undefined) {
                    return 'NULL';
                }
                else {
                    return `'${String(value).replace(/'/g, "''")}'`;
                }
            }
            return match; // Keep the placeholder if no parameter available
        });
        return result;
    }
    // DAO compatibility methods
    async queryGraph(cypher, params = {}) {
        try {
            // Convert parameters to array format expected by our query method
            const paramArray = Object.values(params);
            const result = await this.query(cypher, paramArray);
            return {
                rows: result.rows,
                rowCount: result.rowCount,
                executionTime: result.executionTime,
                records: result.rows.map((row) => ({ fields: row })),
            };
        }
        catch (error) {
            logger.error(`❌ Graph query failed: ${error}`);
            return {
                rows: [],
                rowCount: 0,
                executionTime: 1,
                records: [],
            };
        }
    }
    // Graph-specific utility methods
    async getNodeCount(label) {
        try {
            const query = label
                ? `MATCH (n:${label}) RETURN count(n)`
                : 'MATCH (n) RETURN count(n)';
            const result = await this.connection.query(query);
            if (result.hasNext()) {
                const row = result.getNext();
                return row[0];
            }
            return 0;
        }
        catch (error) {
            logger.error('Failed to get node count:', error);
            return 0;
        }
    }
    async getRelationshipCount(relationshipType) {
        try {
            const query = relationshipType
                ? `MATCH ()-[r:${relationshipType}]->() RETURN count(r)`
                : 'MATCH ()-[r]->() RETURN count(r)';
            const result = await this.connection.query(query);
            if (result.hasNext()) {
                const row = result.getNext();
                return row[0];
            }
            return 0;
        }
        catch (error) {
            logger.error('Failed to get relationship count:', error);
            return 0;
        }
    }
    async getGraphStats() {
        try {
            const [nodeCount, relationshipCount] = await Promise.all([
                this.getNodeCount(),
                this.getRelationshipCount(),
            ]);
            return {
                nodeCount,
                relationshipCount,
                nodeLabels: ['Document', 'Project', 'User', 'Tag'], // Known labels from schema
                relationshipTypes: [
                    'RELATES_TO',
                    'BELONGS_TO',
                    'AUTHORED_BY',
                    'TAGGED_WITH',
                    'DEPENDS_ON',
                    'IMPLEMENTS',
                    'SUPERSEDES',
                ],
            };
        }
        catch (error) {
            logger.error('Failed to get graph stats:', error);
            return {
                nodeCount: 0,
                relationshipCount: 0,
                nodeLabels: [],
                relationshipTypes: [],
            };
        }
    }
}
//# sourceMappingURL=kuzu-adapter.js.map