import { BaseDao } from '../base.dao.ts';
export class GraphDao extends BaseDao {
    get graphAdapter() {
        return this.adapter;
    }
    async traverse(startNode, relationshipType, maxDepth = 3) {
        this.logger.debug(`Executing graph traversal from node ${startNode}, relationship: ${relationshipType}, maxDepth: ${maxDepth}`);
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
                paths: this.extractPathsFromResult(result),
            };
            this.logger.debug(`Traversal completed: ${traversalResult.nodes.length} nodes, ${traversalResult.relationships.length} relationships`);
            return traversalResult;
        }
        catch (error) {
            this.logger.error(`Graph traversal failed: ${error}`);
            throw new Error(`Graph traversal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findNodesByLabel(label, properties) {
        this.logger.debug(`Finding nodes by label: ${label}`, { properties });
        try {
            let cypher = `MATCH (n:${label})`;
            const parameters = {};
            if (properties && Object.keys(properties).length > 0) {
                const propertyConditions = Object.keys(properties)
                    .map((key, index) => {
                    const paramName = `prop${index}`;
                    parameters[paramName] = properties[key];
                    return `n.${key} = $${paramName}`;
                })
                    .join(' AND ');
                cypher += ` WHERE ${propertyConditions}`;
            }
            cypher += ' RETURN n';
            const result = await this.graphAdapter.queryGraph(cypher, Object.values(parameters));
            return result.nodes;
        }
        catch (error) {
            this.logger.error(`Find nodes by label failed: ${error}`);
            throw new Error(`Find nodes by label failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findRelationships(fromNodeId, toNodeId, relationshipType) {
        this.logger.debug(`Finding relationships between nodes: ${fromNodeId} -> ${toNodeId}`, {
            relationshipType,
        });
        try {
            let cypher = 'MATCH (a)-[r';
            const parameters = {
                fromNodeId,
                toNodeId,
            };
            if (relationshipType) {
                cypher += `:${relationshipType}`;
            }
            cypher += ']->(b) WHERE a.id = $fromNodeId AND b.id = $toNodeId RETURN r';
            const result = await this.graphAdapter.queryGraph(cypher, Object.values(parameters));
            return result.relationships;
        }
        catch (error) {
            this.logger.error(`Find relationships failed: ${error}`);
            throw new Error(`Find relationships failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createRelationship(fromNodeId, toNodeId, relationshipType, properties) {
        this.logger.debug(`Creating relationship: ${fromNodeId} -[:${relationshipType}]-> ${toNodeId}`, { properties });
        try {
            let cypher = `
        MATCH (a), (b)
        WHERE a.id = $fromNodeId AND b.id = $toNodeId
        CREATE (a)-[r:${relationshipType}
      `;
            const parameters = {
                fromNodeId,
                toNodeId,
            };
            if (properties && Object.keys(properties).length > 0) {
                const propertyAssignments = Object.keys(properties)
                    .map((key, index) => {
                    const paramName = `prop${index}`;
                    parameters[paramName] = properties[key];
                    return `${key}: $${paramName}`;
                })
                    .join(', ');
                cypher += ` {${propertyAssignments}}`;
            }
            cypher += ']->(b) RETURN r';
            const result = await this.graphAdapter.queryGraph(cypher, Object.values(parameters));
            if (result.relationships.length === 0) {
                throw new Error('Failed to create relationship - nodes may not exist');
            }
            return result.relationships[0];
        }
        catch (error) {
            this.logger.error(`Create relationship failed: ${error}`);
            throw new Error(`Create relationship failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async executeCypher(cypher, parameters) {
        this.logger.debug(`Executing Cypher query: ${cypher}`, { parameters });
        try {
            const paramArray = parameters ? Object.values(parameters) : [];
            const result = await this.graphAdapter.queryGraph(cypher, paramArray);
            return {
                nodes: result.nodes,
                relationships: result.relationships,
                results: [],
                executionTime: result.executionTime,
            };
        }
        catch (error) {
            this.logger.error(`Cypher query failed: ${error}`);
            throw new Error(`Cypher query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getNodeDegree(nodeId, direction = 'both') {
        this.logger.debug(`Getting node degree for ${nodeId}, direction: ${direction}`);
        try {
            let cypher;
            switch (direction) {
                case 'in':
                    cypher =
                        'MATCH (n)<-[]-(connected) WHERE n.id = $nodeId RETURN count(connected) as degree';
                    break;
                case 'out':
                    cypher =
                        'MATCH (n)-[]->(connected) WHERE n.id = $nodeId RETURN count(connected) as degree';
                    break;
                default:
                    cypher =
                        'MATCH (n)-[]-(connected) WHERE n.id = $nodeId RETURN count(connected) as degree';
            }
            const result = await this.graphAdapter.queryGraph(cypher, [nodeId]);
            return result.results[0]?.degree || 0;
        }
        catch (error) {
            this.logger.error(`Get node degree failed: ${error}`);
            throw new Error(`Get node degree failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async findShortestPath(fromNodeId, toNodeId, relationshipType) {
        this.logger.debug(`Finding shortest path: ${fromNodeId} -> ${toNodeId}`, { relationshipType });
        try {
            let cypher = 'MATCH path = shortestPath((a)-[';
            if (relationshipType) {
                cypher += `:${relationshipType}`;
            }
            cypher += '*]-(b)) WHERE a.id = $fromNodeId AND b.id = $toNodeId RETURN path';
            const result = await this.graphAdapter.queryGraph(cypher, [fromNodeId, toNodeId]);
            if (result.nodes.length === 0) {
                return null;
            }
            return {
                nodes: result.nodes,
                relationships: result.relationships,
                paths: this.extractPathsFromResult(result),
            };
        }
        catch (error) {
            this.logger.error(`Find shortest path failed: ${error}`);
            throw new Error(`Find shortest path failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getGraphStats() {
        this.logger.debug('Getting graph statistics');
        try {
            const nodeCount = await this.graphAdapter.getNodeCount();
            const relationshipCount = await this.graphAdapter.getRelationshipCount();
            const labelsResult = await this.graphAdapter.queryGraph('MATCH (n) RETURN DISTINCT labels(n) as labels');
            const nodeLabels = [...new Set(labelsResult.nodes.flatMap((n) => n.labels))];
            const typesResult = await this.graphAdapter.queryGraph('MATCH ()-[r]->() RETURN DISTINCT type(r) as relType');
            const relationshipTypes = typesResult.relationships.map((r) => r.type);
            return {
                nodeCount,
                relationshipCount,
                nodeLabels,
                relationshipTypes,
            };
        }
        catch (error) {
            this.logger.error(`Get graph stats failed: ${error}`);
            throw new Error(`Get graph stats failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    mapRowToEntity(row) {
        if (row.id && row.labels && row.properties) {
            return {
                id: row.id,
                labels: row.labels,
                ...row.properties,
            };
        }
        return row;
    }
    mapEntityToRow(entity) {
        if (!entity)
            return {};
        const { id, labels, ...properties } = entity;
        return {
            id,
            labels: labels || [this.tableName],
            properties,
        };
    }
    buildFindByIdQuery(id) {
        return {
            sql: `MATCH (n:${this.tableName} {id: $id}) RETURN n`,
            params: [id],
        };
    }
    async executeCustomQuery(customQuery) {
        if (customQuery.type === 'cypher') {
            const result = await this.executeCypher(customQuery.query, customQuery.parameters);
            return result;
        }
        return super.executeCustomQuery(customQuery);
    }
    extractPathsFromResult(_result) {
        return [];
    }
}
//# sourceMappingURL=graph.dao.js.map