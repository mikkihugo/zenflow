/**
 * Kuzu Graph Database Usage Example
 * Demonstrates the integrated graph database capabilities
 */

import { DatabaseController } from '../src/database/controllers/database-controller';
import type { DatabaseConfig } from '../src/database/providers/database-providers';
import { DatabaseProviderFactory } from '../src/database/providers/database-providers';

// Mock logger for example
const logger = {
  info: (_msg: string) => {},
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  debug: (_msg: string) => {},
};

// Mock config
const config = {
  get: (_key: string) => undefined,
  set: (_key: string, _value: unknown) => {},
  has: (_key: string) => false,
};

/**
 * Example demonstrating Kuzu graph database integration
 */
export async function demonstrateKuzuIntegration() {
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
    const _status = await controller.getDatabaseStatus();

    // Create some nodes
    const _createPersons = await controller.executeGraphQuery({
      cypher: 'CREATE (alice:Person {name: "Alice", age: 30, role: "Developer"})',
      params: [],
    });

    const _createOrg = await controller.executeGraphQuery({
      cypher: 'CREATE (company:Organization {name: "TechCorp", type: "Technology"})',
      params: [],
    });

    // Create relationships
    const _createRelationship = await controller.executeGraphQuery({
      cypher:
        'MATCH (p:Person {name: "Alice"}), (o:Organization {name: "TechCorp"}) CREATE (p)-[:WORKS_FOR {since: "2022"}]->(o)',
      params: [],
    });
    const queryResult = await controller.executeGraphQuery({
      cypher: 'MATCH (p:Person)-[r:WORKS_FOR]->(o:Organization) RETURN p, r, o',
      params: [],
    });

    if (queryResult.success) {
    }
    const autoDetectResult = await controller.executeQuery({
      sql: 'MATCH (n) RETURN count(n) as totalNodes',
      params: [],
    });

    if (autoDetectResult.success) {
    }
    const schema = await controller.getGraphSchema();

    if (schema.success) {
      const _stats = schema.data.graphStatistics;
    }
    const analytics = await controller.getGraphAnalytics();

    if (analytics.success) {
      const _graphStats = analytics.data.graphStatistics;
      const _performance = analytics.data.performance;
    }
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
      const _summary = batchOps.data.summary;
    }
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
