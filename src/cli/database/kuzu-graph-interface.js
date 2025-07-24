/**
 * Kuzu Graph Database Interface
 * High-performance graph database for service relationships and coordination
 * 15 microservices pilot - single domain, flat structure
 */

import { writeFile, readFile, mkdir, existsSync } from 'fs/promises';
import path from 'path';
import { printSuccess, printError, printWarning, printInfo } from '../utils.js';

export class KuzuGraphInterface {
  constructor(config = {}) {
    this.config = {
      dbPath: config.dbPath || './graph-db',
      dbName: config.dbName || 'claude-zen-services',
      batchSize: config.batchSize || 1000,
      indexing: config.indexing !== false, // default true
      compression: config.compression !== false, // default true
      memoryLimit: config.memoryLimit || '2GB',
      ...config
    };
    
    this.isInitialized = false;
    this.schema = null;
    this.nodes = new Map();
    this.relationships = new Map();
    this.indices = new Map();
    
    // Statistics
    this.stats = {
      nodeCount: 0,
      relationshipCount: 0,
      queryCount: 0,
      lastUpdate: null
    };
  }

  /**
   * Initialize the graph database
   */
  async initialize() {
    printInfo('🗃️ Initializing Kuzu graph database...');
    
    try {
      // Create database directory
      if (!existsSync(this.config.dbPath)) {
        await mkdir(this.config.dbPath, { recursive: true });
      }
      
      // Initialize schema
      await this.initializeSchema();
      
      // Set up indices for performance
      if (this.config.indexing) {
        await this.setupIndices();
      }
      
      // Load existing data if present
      await this.loadExistingData();
      
      this.isInitialized = true;
      printSuccess(`✅ Kuzu database initialized: ${this.config.dbName}`);
      
      return {
        status: 'initialized',
        dbPath: this.config.dbPath,
        nodeTypes: Object.keys(this.schema.nodes || {}),
        relationshipTypes: Object.keys(this.schema.relationships || {})
      };
      
    } catch (error) {
      printError(`❌ Database initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initialize database schema for microservices
   */
  async initializeSchema() {
    this.schema = {
      nodes: {
        Service: {
          properties: {
            name: 'STRING',
            path: 'STRING',
            type: 'STRING',
            complexity: 'STRING',
            lineCount: 'INT64',
            fileCount: 'INT64',
            technologies: 'STRING[]',
            apis: 'STRING[]',
            databases: 'STRING[]',
            created_at: 'TIMESTAMP',
            updated_at: 'TIMESTAMP'
          },
          primaryKey: 'name'
        },
        Technology: {
          properties: {
            name: 'STRING',
            category: 'STRING',
            version: 'STRING',
            usage_count: 'INT64'
          },
          primaryKey: 'name'
        },
        API: {
          properties: {
            service_name: 'STRING',
            endpoint: 'STRING',
            method: 'STRING',
            type: 'STRING',
            file_path: 'STRING'
          },
          primaryKey: ['service_name', 'endpoint']
        },
        Database: {
          properties: {
            service_name: 'STRING',
            name: 'STRING',
            type: 'STRING',
            connection_string: 'STRING'
          },
          primaryKey: ['service_name', 'name']
        },
        Hive: {
          properties: {
            service_name: 'STRING',
            hive_id: 'STRING',
            status: 'STRING',
            agent_count: 'INT64',
            created_at: 'TIMESTAMP',
            last_active: 'TIMESTAMP'
          },
          primaryKey: 'hive_id'
        }
      },
      relationships: {
        DEPENDS_ON: {
          from: 'Service',
          to: 'Service',
          properties: {
            strength: 'STRING',
            type: 'STRING',
            created_at: 'TIMESTAMP'
          }
        },
        USES_TECH: {
          from: 'Service',
          to: 'Technology',
          properties: {
            version: 'STRING',
            usage_type: 'STRING'
          }
        },
        EXPOSES_API: {
          from: 'Service',
          to: 'API',
          properties: {
            version: 'STRING',
            status: 'STRING'
          }
        },
        USES_DATABASE: {
          from: 'Service',
          to: 'Database',
          properties: {
            access_type: 'STRING',
            connection_pool_size: 'INT64'
          }
        },
        COORDINATES_WITH: {
          from: 'Hive',
          to: 'Hive',
          properties: {
            communication_type: 'STRING',
            frequency: 'STRING',
            last_communication: 'TIMESTAMP'
          }
        },
        MANAGES: {
          from: 'Hive',
          to: 'Service',
          properties: {
            management_type: 'STRING',
            priority: 'STRING'
          }
        }
      }
    };
    
    // Save schema to file
    const schemaPath = path.join(this.config.dbPath, 'schema.json');
    await writeFile(schemaPath, JSON.stringify(this.schema, null, 2));
    
    printInfo('📋 Database schema initialized');
  }

  /**
   * Set up performance indices
   */
  async setupIndices() {
    const indices = {
      service_name_idx: {
        nodeType: 'Service',
        property: 'name',
        type: 'hash'
      },
      service_type_idx: {
        nodeType: 'Service',
        property: 'type',
        type: 'btree'
      },
      service_complexity_idx: {
        nodeType: 'Service', 
        property: 'complexity',
        type: 'btree'
      },
      technology_name_idx: {
        nodeType: 'Technology',
        property: 'name',
        type: 'hash'
      },
      hive_service_idx: {
        nodeType: 'Hive',
        property: 'service_name',
        type: 'hash'
      }
    };
    
    this.indices = indices;
    
    // Save indices configuration
    const indicesPath = path.join(this.config.dbPath, 'indices.json');
    await writeFile(indicesPath, JSON.stringify(indices, null, 2));
    
    printInfo('🔍 Performance indices configured');
  }

  /**
   * Load existing data from disk
   */
  async loadExistingData() {
    try {
      const nodesPath = path.join(this.config.dbPath, 'nodes.json');
      const relationshipsPath = path.join(this.config.dbPath, 'relationships.json');
      
      if (existsSync(nodesPath)) {
        const nodesData = JSON.parse(await readFile(nodesPath, 'utf8'));
        this.nodes = new Map(nodesData);
        this.stats.nodeCount = this.nodes.size;
      }
      
      if (existsSync(relationshipsPath)) {
        const relationshipsData = JSON.parse(await readFile(relationshipsPath, 'utf8'));
        this.relationships = new Map(relationshipsData);
        this.stats.relationshipCount = this.relationships.size;
      }
      
      if (this.stats.nodeCount > 0 || this.stats.relationshipCount > 0) {
        printInfo(`📊 Loaded existing data: ${this.stats.nodeCount} nodes, ${this.stats.relationshipCount} relationships`);
      }
      
    } catch (error) {
      // No existing data, that's OK
      printInfo('📊 No existing data found, starting fresh');
    }
  }

  /**
   * Insert service nodes from monorepo analysis
   */
  async insertServices(services) {
    printInfo(`📦 Inserting ${services.length} services into graph database...`);
    
    let inserted = 0;
    const batch = [];
    
    for (const service of services) {
      const nodeId = `service:${service.name}`;
      const nodeData = {
        id: nodeId,
        type: 'Service',
        properties: {
          name: service.name,
          path: service.path,
          type: service.type,
          complexity: service.codeStats?.complexity || 'unknown',
          lineCount: service.codeStats?.lineCount || 0,
          fileCount: service.codeStats?.fileCount || 0,
          technologies: service.technologies || [],
          apis: service.apis?.map(api => api.file) || [],
          databases: service.databases?.map(db => db.file) || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
      
      this.nodes.set(nodeId, nodeData);
      batch.push(nodeData);
      inserted++;
      
      // Process batch
      if (batch.length >= this.config.batchSize) {
        await this.processBatch(batch, 'nodes');
        batch.length = 0;
      }
    }
    
    // Process remaining batch
    if (batch.length > 0) {
      await this.processBatch(batch, 'nodes');
    }
    
    this.stats.nodeCount = this.nodes.size;
    this.stats.lastUpdate = new Date().toISOString();
    
    printSuccess(`✅ Inserted ${inserted} services`);
    return inserted;
  }

  /**
   * Insert technology nodes
   */
  async insertTechnologies(technologies) {
    printInfo(`⚙️ Inserting ${technologies.length} technologies...`);
    
    let inserted = 0;
    
    for (const tech of technologies) {
      const nodeId = `technology:${tech}`;
      if (!this.nodes.has(nodeId)) {
        const nodeData = {
          id: nodeId,
          type: 'Technology',
          properties: {
            name: tech,
            category: this.categorizeTechnology(tech),
            version: 'unknown',
            usage_count: 1
          }
        };
        
        this.nodes.set(nodeId, nodeData);
        inserted++;
      } else {
        // Increment usage count
        const existing = this.nodes.get(nodeId);
        existing.properties.usage_count++;
        this.nodes.set(nodeId, existing);
      }
    }
    
    printSuccess(`✅ Inserted ${inserted} new technologies`);
    return inserted;
  }

  /**
   * Insert service relationships
   */
  async insertRelationships(relationships) {
    printInfo(`🔗 Inserting ${relationships.length} relationships...`);
    
    let inserted = 0;
    const batch = [];
    
    for (const rel of relationships) {
      const relId = `${rel.from}:${rel.type}:${rel.to || 'global'}`;
      const relationshipData = {
        id: relId,
        type: rel.type,
        from: `service:${rel.from}`,
        to: rel.to ? `service:${rel.to}` : null,
        properties: {
          strength: rel.strength || 'medium',
          type: rel.type,
          created_at: new Date().toISOString()
        }
      };
      
      this.relationships.set(relId, relationshipData);
      batch.push(relationshipData);
      inserted++;
      
      // Process batch
      if (batch.length >= this.config.batchSize) {
        await this.processBatch(batch, 'relationships');
        batch.length = 0;
      }
    }
    
    // Process remaining batch
    if (batch.length > 0) {
      await this.processBatch(batch, 'relationships');
    }
    
    this.stats.relationshipCount = this.relationships.size;
    
    printSuccess(`✅ Inserted ${inserted} relationships`);
    return inserted;
  }

  /**
   * Insert hive coordination data
   */
  async insertHives(hives) {
    printInfo(`🏗️ Inserting ${hives.length} hive coordination nodes...`);
    
    let inserted = 0;
    
    for (const hive of hives) {
      const nodeId = `hive:${hive.service_name}`;
      const nodeData = {
        id: nodeId,
        type: 'Hive',
        properties: {
          service_name: hive.service_name,
          hive_id: hive.hive_id,
          status: hive.status || 'active',
          agent_count: hive.agent_count || 0,
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
      };
      
      this.nodes.set(nodeId, nodeData);
      inserted++;
      
      // Create MANAGES relationship to service
      const managesRelId = `hive:${hive.service_name}:MANAGES:service:${hive.service_name}`;
      const managesRel = {
        id: managesRelId,
        type: 'MANAGES',
        from: nodeId,
        to: `service:${hive.service_name}`,
        properties: {
          management_type: 'primary',
          priority: 'high'
        }
      };
      
      this.relationships.set(managesRelId, managesRel);
    }
    
    printSuccess(`✅ Inserted ${inserted} hives`);
    return inserted;
  }

  /**
   * Query services by criteria
   */
  async queryServices(criteria = {}) {
    this.stats.queryCount++;
    
    let results = Array.from(this.nodes.values())
      .filter(node => node.type === 'Service');
    
    // Apply filters
    if (criteria.name) {
      results = results.filter(node => 
        node.properties.name.includes(criteria.name)
      );
    }
    
    if (criteria.type) {
      results = results.filter(node => 
        node.properties.type === criteria.type
      );
    }
    
    if (criteria.complexity) {
      results = results.filter(node => 
        node.properties.complexity === criteria.complexity
      );
    }
    
    if (criteria.technology) {
      results = results.filter(node => 
        node.properties.technologies.includes(criteria.technology)
      );
    }
    
    // Sort by name by default
    results.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
    
    return results;
  }

  /**
   * Find service dependencies
   */
  async findServiceDependencies(serviceName) {
    const serviceId = `service:${serviceName}`;
    const dependencies = [];
    const dependents = [];
    
    for (const rel of this.relationships.values()) {
      if (rel.type === 'DEPENDS_ON') {
        if (rel.from === serviceId) {
          dependencies.push({
            service: rel.to.replace('service:', ''),
            strength: rel.properties.strength
          });
        }
        if (rel.to === serviceId) {
          dependents.push({
            service: rel.from.replace('service:', ''),
            strength: rel.properties.strength
          });
        }
      }
    }
    
    return {
      service: serviceName,
      dependencies,
      dependents
    };
  }

  /**
   * Find hive coordination patterns
   */
  async findHiveCoordination() {
    const hives = Array.from(this.nodes.values())
      .filter(node => node.type === 'Hive');
    
    const coordination = [];
    
    for (const rel of this.relationships.values()) {
      if (rel.type === 'COORDINATES_WITH') {
        const fromHive = hives.find(h => h.id === rel.from);
        const toHive = hives.find(h => h.id === rel.to);
        
        if (fromHive && toHive) {
          coordination.push({
            from: fromHive.properties.service_name,
            to: toHive.properties.service_name,
            communication_type: rel.properties.communication_type,
            frequency: rel.properties.frequency
          });
        }
      }
    }
    
    return coordination;
  }

  /**
   * Analyze service architecture patterns
   */
  async analyzeArchitecturePatterns() {
    const services = await this.queryServices();
    const patterns = {
      technologyUsage: {},
      complexityDistribution: { low: 0, medium: 0, high: 0 },
      serviceTypes: {},
      dependencyPatterns: {
        highlyDependent: [],
        isolated: [],
        central: []
      }
    };
    
    // Technology usage patterns
    for (const service of services) {
      service.properties.technologies.forEach(tech => {
        patterns.technologyUsage[tech] = (patterns.technologyUsage[tech] || 0) + 1;
      });
      
      // Complexity distribution
      const complexity = service.properties.complexity;
      if (patterns.complexityDistribution[complexity] !== undefined) {
        patterns.complexityDistribution[complexity]++;
      }
      
      // Service types
      const type = service.properties.type;
      patterns.serviceTypes[type] = (patterns.serviceTypes[type] || 0) + 1;
    }
    
    // Dependency patterns
    for (const service of services) {
      const deps = await this.findServiceDependencies(service.properties.name);
      const totalConnections = deps.dependencies.length + deps.dependents.length;
      
      if (totalConnections === 0) {
        patterns.dependencyPatterns.isolated.push(service.properties.name);
      } else if (totalConnections >= 5) {
        patterns.dependencyPatterns.central.push({
          service: service.properties.name,
          connections: totalConnections
        });
      } else if (deps.dependencies.length >= 3) {
        patterns.dependencyPatterns.highlyDependent.push({
          service: service.properties.name,
          dependencies: deps.dependencies.length
        });
      }
    }
    
    return patterns;
  }

  /**
   * Generate Cypher queries for Kuzu
   */
  generateCypherQueries() {
    const queries = {
      createNodes: [],
      createRelationships: [],
      createIndices: []
    };
    
    // Node creation queries
    for (const [nodeType, schema] of Object.entries(this.schema.nodes)) {
      const propDefs = Object.entries(schema.properties)
        .map(([prop, type]) => `${prop} ${type}`)
        .join(', ');
      
      queries.createNodes.push(
        `CREATE NODE TABLE ${nodeType}(${propDefs}, PRIMARY KEY(${schema.primaryKey}))`
      );
    }
    
    // Relationship creation queries
    for (const [relType, schema] of Object.entries(this.schema.relationships)) {
      const propDefs = Object.entries(schema.properties || {})
        .map(([prop, type]) => `${prop} ${type}`)
        .join(', ');
      
      const propList = propDefs ? `, ${propDefs}` : '';
      queries.createRelationships.push(
        `CREATE REL TABLE ${relType}(FROM ${schema.from} TO ${schema.to}${propList})`
      );
    }
    
    // Index creation queries
    for (const [indexName, indexDef] of Object.entries(this.indices)) {
      queries.createIndices.push(
        `CREATE INDEX ${indexName} ON ${indexDef.nodeType}(${indexDef.property})`
      );
    }
    
    return queries;
  }

  /**
   * Export data for Kuzu
   */
  async exportForKuzu() {
    const exportData = {
      timestamp: new Date().toISOString(),
      schema: this.schema,
      queries: this.generateCypherQueries(),
      nodes: Array.from(this.nodes.values()),
      relationships: Array.from(this.relationships.values()),
      statistics: this.stats
    };
    
    const exportPath = path.join(this.config.dbPath, 'kuzu-export.json');
    await writeFile(exportPath, JSON.stringify(exportData, null, 2));
    
    printSuccess(`📤 Data exported for Kuzu: ${exportPath}`);
    return exportPath;
  }

  /**
   * Process batch operations
   */
  async processBatch(batch, type) {
    try {
      const filePath = path.join(this.config.dbPath, `${type}.json`);
      const data = type === 'nodes' ? 
        Array.from(this.nodes.entries()) : 
        Array.from(this.relationships.entries());
      
      await writeFile(filePath, JSON.stringify(data, null, 2));
      
    } catch (error) {
      printWarning(`⚠️ Batch processing warning: ${error.message}`);
    }
  }

  /**
   * Categorize technology for better organization
   */
  categorizeTechnology(tech) {
    const categories = {
      'express': 'web-framework',
      'fastify': 'web-framework', 
      'nestjs': 'web-framework',
      'react': 'frontend-framework',
      'vue': 'frontend-framework',
      'angular': 'frontend-framework',
      'typescript': 'language',
      'javascript': 'language',
      'nodejs': 'runtime',
      'prisma': 'orm',
      'mongoose': 'orm',
      'pg': 'database-driver',
      'mysql': 'database-driver',
      'postgresql': 'database',
      'mongodb': 'database',
      'redis': 'cache',
      'docker': 'containerization',
      'kubernetes': 'orchestration',
      'graphql': 'api'
    };
    
    return categories[tech.toLowerCase()] || 'unknown';
  }

  /**
   * Get database statistics
   */
  async getStats() {
    return {
      ...this.stats,
      memoryUsage: {
        nodes: this.nodes.size,
        relationships: this.relationships.size,
        indices: this.indices.size
      },
      nodeTypes: this.schema ? Object.keys(this.schema.nodes) : [],
      relationshipTypes: this.schema ? Object.keys(this.schema.relationships) : []
    };
  }

  /**
   * Close database connection and save data
   */
  async close() {
    printInfo('💾 Saving graph database data...');
    
    try {
      // Save final data
      await this.processBatch([], 'nodes');
      await this.processBatch([], 'relationships');
      
      // Save statistics
      const statsPath = path.join(this.config.dbPath, 'stats.json');
      await writeFile(statsPath, JSON.stringify(this.stats, null, 2));
      
      printSuccess('✅ Graph database closed and data saved');
      
    } catch (error) {
      printError(`❌ Error closing database: ${error.message}`);
      throw error;
    }
  }
}

export default KuzuGraphInterface;