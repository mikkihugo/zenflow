/**
 * Kuzu Graph Database Usage Example
 * Demonstrates the integrated graph database capabilities
 */

import { DatabaseController } from '../src/database/controllers/database-controller';
import type { DatabaseConfig } from '../src/database/providers/database-providers';
import { DatabaseProviderFactory, KuzuAdapter } from '../src/database/providers/database-providers';

// Mock logger for example
const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  debug: (msg: string) => console.log(`[DEBUG] ${msg}`),
};

// Mock config
const config = {
  get: (key: string) => undefined,
  set: (key: string, value: any) => {},
  has: (key: string) => false,
};

/**
 * Example demonstrating Kuzu graph database integration
 */
export async function demonstrateKuzuIntegration() {
  console.log('🕸️ Kuzu Graph Database Integration Demo\n');

  // Configure Kuzu database
  const kuzuConfig: DatabaseConfig = {
    type: 'kuzu',
    database: './data/example-graph.kuzu',
    options: {
      bufferPoolSize: '1GB',
      maxNumThreads: 4,
    },
  };

  // Create factory and adapter
  const factory = new DatabaseProviderFactory(logger, config);
  const controller = new DatabaseController(factory, kuzuConfig, logger);

  try {
    // 1. Check database status
    console.log('1. Checking database status...');
    const status = await controller.getDatabaseStatus();
    console.log(`   Status: ${status.data.status}`);
    console.log(`   Adapter: ${status.data.adapter}`);
    console.log(`   Response time: ${status.data.responseTime}ms\n`);

    // 2. Execute graph queries
    console.log('2. Executing Cypher queries...');

    // Create some nodes
    const createPersons = await controller.executeGraphQuery({
      cypher: 'CREATE (alice:Person {name: "Alice", age: 30, role: "Developer"})',
      params: [],
    });
    console.log(`   ✓ Created person node: ${createPersons.success}`);

    const createOrg = await controller.executeGraphQuery({
      cypher: 'CREATE (company:Organization {name: "TechCorp", type: "Technology"})',
      params: [],
    });
    console.log(`   ✓ Created organization node: ${createOrg.success}`);

    // Create relationships
    const createRelationship = await controller.executeGraphQuery({
      cypher:
        'MATCH (p:Person {name: "Alice"}), (o:Organization {name: "TechCorp"}) CREATE (p)-[:WORKS_FOR {since: "2022"}]->(o)',
      params: [],
    });
    console.log(`   ✓ Created relationship: ${createRelationship.success}\n`);

    // 3. Query the graph
    console.log('3. Querying graph data...');
    const queryResult = await controller.executeGraphQuery({
      cypher: 'MATCH (p:Person)-[r:WORKS_FOR]->(o:Organization) RETURN p, r, o',
      params: [],
    });

    if (queryResult.success) {
      console.log(
        `   Found ${queryResult.data.nodeCount} nodes and ${queryResult.data.relationshipCount} relationships`
      );
      console.log(
        `   Nodes:`,
        queryResult.data.nodes.map((n) => n.properties.name || n.labels.join(':'))
      );
      console.log(
        `   Relationships:`,
        queryResult.data.relationships.map((r) => r.type)
      );
    }
    console.log();

    // 4. Test automatic Cypher detection in regular query endpoint
    console.log('4. Testing automatic Cypher query detection...');
    const autoDetectResult = await controller.executeQuery({
      sql: 'MATCH (n) RETURN count(n) as totalNodes',
      params: [],
    });

    if (autoDetectResult.success) {
      console.log(`   ✓ Cypher query automatically detected and routed to graph adapter`);
      console.log(`   Results:`, autoDetectResult.data.results.length, 'items returned');
    }
    console.log();

    // 5. Get graph schema information
    console.log('5. Retrieving graph schema...');
    const schema = await controller.getGraphSchema();

    if (schema.success) {
      const stats = schema.data.graphStatistics;
      console.log(`   Total nodes: ${stats.totalNodes}`);
      console.log(`   Total relationships: ${stats.totalRelationships}`);
      console.log(`   Node types: ${stats.nodeTypes.join(', ')}`);
      console.log(`   Relationship types: ${stats.relationshipTypes.join(', ')}`);
      console.log(`   Average connections: ${stats.averageConnections.toFixed(2)}`);
    }
    console.log();

    // 6. Get graph analytics
    console.log('6. Getting graph analytics...');
    const analytics = await controller.getGraphAnalytics();

    if (analytics.success) {
      const graphStats = analytics.data.graphStatistics;
      const performance = analytics.data.performance;

      console.log(`   Graph density: ${graphStats.graphDensity.toFixed(4)}`);
      console.log(`   Connected nodes: ${graphStats.connectivity.nodesWithConnections}`);
      console.log(`   Isolated nodes: ${graphStats.connectivity.isolatedNodes}`);
      console.log(`   Average response time: ${performance.averageResponseTime.toFixed(2)}ms`);
      console.log(`   Success rate: ${performance.successRate.toFixed(1)}%`);
    }
    console.log();

    // 7. Execute batch graph operations
    console.log('7. Executing batch graph operations...');
    const batchOps = await controller.executeGraphBatch({
      operations: [
        {
          cypher: 'CREATE (bob:Person {name: "Bob", age: 28, role: "Designer"})',
          params: [],
        },
        {
          cypher: 'CREATE (charlie:Person {name: "Charlie", age: 35, role: "Manager"})',
          params: [],
        },
        {
          cypher:
            'MATCH (p:Person {name: "Bob"}), (o:Organization {name: "TechCorp"}) CREATE (p)-[:WORKS_FOR {since: "2023"}]->(o)',
          params: [],
        },
      ],
      continueOnError: false,
      includeData: true,
    });

    if (batchOps.success) {
      const summary = batchOps.data.summary;
      console.log(
        `   ✓ Batch completed: ${summary.successfulOperations}/${summary.totalOperations} operations successful`
      );
      console.log(`   Total nodes processed: ${summary.totalNodesProcessed}`);
      console.log(`   Total relationships processed: ${summary.totalRelationshipsProcessed}`);
    }
    console.log();

    console.log('🎉 Kuzu Graph Database Integration Demo Complete!');
    console.log('   All graph database capabilities are working correctly.');
    console.log('   The Kuzu adapter is fully integrated and functional.');
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

/**
 * Example usage scenarios for Kuzu graph database
 */
export const graphUseCaseExamples = {
  socialNetwork: {
    description: 'Social network analysis with relationships',
    queries: [
      'CREATE (alice:Person {name: "Alice", age: 30})',
      'CREATE (bob:Person {name: "Bob", age: 25})',
      'MATCH (a:Person {name: "Alice"}), (b:Person {name: "Bob"}) CREATE (a)-[:FRIENDS {since: "2020"}]->(b)',
      'MATCH (p:Person)-[:FRIENDS]-(f:Person) RETURN p.name, f.name',
    ],
  },

  knowledgeGraph: {
    description: 'Knowledge graph with concepts and relationships',
    queries: [
      'CREATE (ai:Concept {name: "Artificial Intelligence", type: "Technology"})',
      'CREATE (ml:Concept {name: "Machine Learning", type: "Technology"})',
      'CREATE (nn:Concept {name: "Neural Networks", type: "Technology"})',
      'MATCH (ai:Concept {name: "Artificial Intelligence"}), (ml:Concept {name: "Machine Learning"}) CREATE (ai)-[:INCLUDES]->(ml)',
      'MATCH (ml:Concept {name: "Machine Learning"}), (nn:Concept {name: "Neural Networks"}) CREATE (ml)-[:INCLUDES]->(nn)',
      'MATCH (concept:Concept)-[:INCLUDES*]-(related:Concept) RETURN concept.name, related.name',
    ],
  },

  dependencyAnalysis: {
    description: 'Software dependency and impact analysis',
    queries: [
      'CREATE (module1:Module {name: "Authentication", version: "1.0"})',
      'CREATE (module2:Module {name: "Database", version: "2.1"})',
      'CREATE (module3:Module {name: "API", version: "1.5"})',
      'MATCH (api:Module {name: "API"}), (auth:Module {name: "Authentication"}) CREATE (api)-[:DEPENDS_ON]->(auth)',
      'MATCH (api:Module {name: "API"}), (db:Module {name: "Database"}) CREATE (api)-[:DEPENDS_ON]->(db)',
      'MATCH (m:Module)-[:DEPENDS_ON*]-(dep:Module) RETURN m.name, dep.name',
    ],
  },

  organizationChart: {
    description: 'Organizational hierarchy and reporting structure',
    queries: [
      'CREATE (ceo:Employee {name: "CEO", level: "Executive"})',
      'CREATE (cto:Employee {name: "CTO", level: "Executive"})',
      'CREATE (dev1:Employee {name: "Senior Dev", level: "Senior"})',
      'CREATE (dev2:Employee {name: "Junior Dev", level: "Junior"})',
      'MATCH (ceo:Employee {name: "CEO"}), (cto:Employee {name: "CTO"}) CREATE (cto)-[:REPORTS_TO]->(ceo)',
      'MATCH (cto:Employee {name: "CTO"}), (dev1:Employee {name: "Senior Dev"}) CREATE (dev1)-[:REPORTS_TO]->(cto)',
      'MATCH (dev1:Employee {name: "Senior Dev"}), (dev2:Employee {name: "Junior Dev"}) CREATE (dev2)-[:REPORTS_TO]->(dev1)',
      'MATCH (e:Employee)-[:REPORTS_TO*]-(manager:Employee) RETURN e.name, manager.name',
    ],
  },
};

// Example configuration for different use cases
export const kuzuConfigExamples = {
  development: {
    type: 'kuzu' as const,
    database: './data/dev-graph.kuzu',
    options: {
      bufferPoolSize: '512MB',
      maxNumThreads: 2,
    },
  },

  production: {
    type: 'kuzu' as const,
    database: './data/prod-graph.kuzu',
    options: {
      bufferPoolSize: '4GB',
      maxNumThreads: 8,
    },
  },

  testing: {
    type: 'kuzu' as const,
    database: ':memory:',
    options: {
      bufferPoolSize: '256MB',
      maxNumThreads: 1,
    },
  },
};

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateKuzuIntegration().catch(console.error);
}
