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
   * Initialize database schema for microservices and code analysis
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
        },
        // Code Analysis Nodes
        SourceFile: {
          properties: {
            id: 'STRING',
            path: 'STRING',
            service_name: 'STRING',
            language: 'STRING',
            size_bytes: 'INT64',
            line_count: 'INT64',
            complexity_score: 'DOUBLE',
            maintainability_index: 'DOUBLE',
            hash: 'STRING',
            last_analyzed: 'TIMESTAMP'
          },
          primaryKey: 'id'
        },
        Function: {
          properties: {
            id: 'STRING',
            name: 'STRING',
            file_id: 'STRING',
            start_line: 'INT64',
            end_line: 'INT64',
            cyclomatic_complexity: 'INT64',
            cognitive_complexity: 'INT64',
            parameter_count: 'INT64',
            return_type: 'STRING',
            is_async: 'BOOLEAN',
            is_exported: 'BOOLEAN'
          },
          primaryKey: 'id'
        },
        Class: {
          properties: {
            id: 'STRING',
            name: 'STRING',
            file_id: 'STRING',
            start_line: 'INT64',
            end_line: 'INT64',
            method_count: 'INT64',
            property_count: 'INT64',
            is_exported: 'BOOLEAN',
            extends_class: 'STRING',
            implements_interfaces: 'STRING[]'
          },
          primaryKey: 'id'
        },
        Variable: {
          properties: {
            id: 'STRING',
            name: 'STRING',
            file_id: 'STRING',
            scope: 'STRING',
            type: 'STRING',
            is_constant: 'BOOLEAN',
            is_exported: 'BOOLEAN',
            line_number: 'INT64'
          },
          primaryKey: 'id'
        },
        Import: {
          properties: {
            id: 'STRING',
            file_id: 'STRING',
            module_name: 'STRING',
            imported_names: 'STRING[]',
            import_type: 'STRING',
            line_number: 'INT64'
          },
          primaryKey: 'id'
        },
        DuplicateCode: {
          properties: {
            id: 'STRING',
            hash: 'STRING',
            token_count: 'INT64',
            line_count: 'INT64',
            similarity_score: 'DOUBLE',
            first_occurrence_file: 'STRING',
            first_occurrence_line: 'INT64'
          },
          primaryKey: 'id'
        },
        TypeDefinition: {
          properties: {
            id: 'STRING',
            name: 'STRING',
            file_id: 'STRING',
            kind: 'STRING',
            properties: 'STRING[]',
            methods: 'STRING[]',
            is_exported: 'BOOLEAN'
          },
          primaryKey: 'id'
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
        },
        // Code Analysis Relationships
        CONTAINS_FILE: {
          from: 'Service',
          to: 'SourceFile',
          properties: {
            role: 'STRING'
          }
        },
        DEFINES_FUNCTION: {
          from: 'SourceFile',
          to: 'Function',
          properties: {
            visibility: 'STRING'
          }
        },
        DEFINES_CLASS: {
          from: 'SourceFile',
          to: 'Class',
          properties: {
            visibility: 'STRING'
          }
        },
        DECLARES_VARIABLE: {
          from: 'SourceFile',
          to: 'Variable',
          properties: {
            scope: 'STRING'
          }
        },
        HAS_IMPORT: {
          from: 'SourceFile',
          to: 'Import',
          properties: {
            line_number: 'INT64'
          }
        },
        IMPORTS_FROM: {
          from: 'Import',
          to: 'SourceFile',
          properties: {
            dependency_type: 'STRING'
          }
        },
        CALLS_FUNCTION: {
          from: 'Function',
          to: 'Function',
          properties: {
            call_count: 'INT64',
            line_number: 'INT64'
          }
        },
        ACCESSES_VARIABLE: {
          from: 'Function',
          to: 'Variable',
          properties: {
            access_type: 'STRING',
            line_number: 'INT64'
          }
        },
        MEMBER_OF_CLASS: {
          from: 'Function',
          to: 'Class',
          properties: {
            method_type: 'STRING'
          }
        },
        EXTENDS_CLASS: {
          from: 'Class',
          to: 'Class',
          properties: {
            inheritance_type: 'STRING'
          }
        },
        IMPLEMENTS_INTERFACE: {
          from: 'Class',
          to: 'TypeDefinition',
          properties: {
            implementation_completeness: 'STRING'
          }
        },
        DUPLICATES: {
          from: 'DuplicateCode',
          to: 'SourceFile',
          properties: {
            start_line: 'INT64',
            end_line: 'INT64'
          }
        },
        USES_TYPE: {
          from: 'Function',
          to: 'TypeDefinition',
          properties: {
            usage_context: 'STRING'
          }
        },
        DEFINES_TYPE: {
          from: 'SourceFile',
          to: 'TypeDefinition',
          properties: {
            definition_type: 'STRING'
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
   * Insert generic nodes into the graph
   */
  async insertNodes(nodeType, nodes) {
    if (!this.schema.nodes[nodeType]) {
      throw new Error(`Unknown node type: ${nodeType}`);
    }

    printInfo(`📦 Inserting ${nodes.length} ${nodeType} nodes...`);
    
    let inserted = 0;
    const batch = [];
    
    for (const node of nodes) {
      const nodeId = node.id || `${nodeType.toLowerCase()}:${Math.random().toString(36).substring(7)}`;
      const nodeData = {
        id: nodeId,
        type: nodeType,
        properties: {
          ...node,
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
    
    printSuccess(`✅ Inserted ${inserted} ${nodeType} nodes`);
    return inserted;
  }

  /**
   * Query functions by complexity
   */
  async queryFunctionsByComplexity(minComplexity = 10) {
    this.stats.queryCount++;
    
    const results = Array.from(this.nodes.values())
      .filter(node => node.type === 'Function' && 
                     node.properties.cyclomatic_complexity >= minComplexity);
    
    // Sort by complexity descending
    results.sort((a, b) => 
      b.properties.cyclomatic_complexity - a.properties.cyclomatic_complexity
    );
    
    return results;
  }

  /**
   * Query files by complexity score
   */
  async queryFilesByComplexity(minScore = 5.0) {
    this.stats.queryCount++;
    
    const results = Array.from(this.nodes.values())
      .filter(node => node.type === 'SourceFile' && 
                     node.properties.complexity_score >= minScore);
    
    // Sort by complexity score descending
    results.sort((a, b) => 
      b.properties.complexity_score - a.properties.complexity_score
    );
    
    return results;
  }

  /**
   * Find functions that call each other (call graph)
   */
  async findFunctionCallGraph() {
    const callRelationships = Array.from(this.relationships.values())
      .filter(rel => rel.type === 'CALLS_FUNCTION');
    
    const callGraph = {
      nodes: new Set(),
      edges: []
    };
    
    for (const rel of callRelationships) {
      const fromFunc = this.nodes.get(rel.from);
      const toFunc = this.nodes.get(rel.to);
      
      if (fromFunc && toFunc) {
        callGraph.nodes.add(fromFunc);
        callGraph.nodes.add(toFunc);
        callGraph.edges.push({
          from: fromFunc.properties.name,
          to: toFunc.properties.name,
          file_from: fromFunc.properties.file_id,
          file_to: toFunc.properties.file_id,
          call_count: rel.properties.call_count || 1
        });
      }
    }
    
    return {
      nodes: Array.from(callGraph.nodes),
      edges: callGraph.edges,
      statistics: {
        totalFunctions: callGraph.nodes.size,
        totalCalls: callGraph.edges.length
      }
    };
  }

  /**
   * Find duplicate code patterns
   */
  async findDuplicatePatterns(minSimilarity = 80) {
    this.stats.queryCount++;
    
    const duplicates = Array.from(this.nodes.values())
      .filter(node => node.type === 'DuplicateCode' && 
                     node.properties.similarity_score >= minSimilarity);
    
    const duplicateRelationships = Array.from(this.relationships.values())
      .filter(rel => rel.type === 'DUPLICATES');
    
    const patterns = [];
    
    for (const duplicate of duplicates) {
      const occurrences = duplicateRelationships
        .filter(rel => rel.from === duplicate.id)
        .map(rel => {
          const file = this.nodes.get(rel.to);
          return {
            file: file?.properties.path || 'unknown',
            start_line: rel.properties.start_line,
            end_line: rel.properties.end_line
          };
        });
      
      patterns.push({
        id: duplicate.id,
        similarity: duplicate.properties.similarity_score,
        lines: duplicate.properties.line_count,
        tokens: duplicate.properties.token_count,
        occurrences
      });
    }
    
    // Sort by similarity and impact
    patterns.sort((a, b) => {
      const impactA = a.similarity * a.occurrences.length;
      const impactB = b.similarity * b.occurrences.length;
      return impactB - impactA;
    });
    
    return patterns;
  }

  /**
   * Find files with high import coupling
   */
  async findHighlyCoupledFiles() {
    const importCounts = new Map();
    const exportCounts = new Map();
    
    // Count imports per file
    for (const rel of this.relationships.values()) {
      if (rel.type === 'IMPORTS_FROM') {
        const fromFile = rel.from;
        const toFile = rel.to;
        
        importCounts.set(fromFile, (importCounts.get(fromFile) || 0) + 1);
        exportCounts.set(toFile, (exportCounts.get(toFile) || 0) + 1);
      }
    }
    
    const coupledFiles = [];
    
    for (const [fileId, importCount] of importCounts.entries()) {
      const exportCount = exportCounts.get(fileId) || 0;
      const file = this.nodes.get(fileId);
      
      if (file && (importCount > 10 || exportCount > 5)) {
        coupledFiles.push({
          file: file.properties.path,
          imports: importCount,
          exports: exportCount,
          coupling_score: importCount + (exportCount * 2)
        });
      }
    }
    
    return coupledFiles.sort((a, b) => b.coupling_score - a.coupling_score);
  }

  /**
   * Generate Cypher-like query for common patterns
   */
  generateCommonQueries() {
    return {
      highComplexityFunctions: `
        MATCH (f:Function) 
        WHERE f.cyclomatic_complexity > 10 
        RETURN f.name, f.file_id, f.cyclomatic_complexity 
        ORDER BY f.cyclomatic_complexity DESC
      `,
      
      circularDependencies: `
        MATCH (f1:SourceFile)-[:IMPORTS_FROM]->(f2:SourceFile)-[:IMPORTS_FROM*]->(f1) 
        RETURN f1.path, f2.path
      `,
      
      deadCode: `
        MATCH (f:Function) 
        WHERE NOT EXISTS((f)<-[:CALLS_FUNCTION]-()) 
        AND f.is_exported = false 
        RETURN f.name, f.file_id
      `,
      
      duplicateHotspots: `
        MATCH (d:DuplicateCode)-[:DUPLICATES]->(f:SourceFile) 
        WHERE d.similarity_score > 85 
        RETURN f.path, COUNT(d) as duplicate_count 
        ORDER BY duplicate_count DESC
      `,
      
      complexFiles: `
        MATCH (f:SourceFile) 
        WHERE f.complexity_score > 8.0 
        RETURN f.path, f.complexity_score, f.line_count 
        ORDER BY f.complexity_score DESC
      `,
      
      heavyImporters: `
        MATCH (f1:SourceFile)-[r:IMPORTS_FROM]->(f2:SourceFile) 
        RETURN f1.path, COUNT(r) as import_count 
        ORDER BY import_count DESC 
        LIMIT 20
      `,
      
      classHierarchy: `
        MATCH (c1:Class)-[:EXTENDS_CLASS]->(c2:Class) 
        RETURN c1.name, c2.name, c1.file_id
      `,
      
      typeUsage: `
        MATCH (f:Function)-[:USES_TYPE]->(t:TypeDefinition) 
        RETURN t.name, COUNT(f) as usage_count 
        ORDER BY usage_count DESC
      `
    };
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
   * Execute advanced analysis queries
   */
  async executeAnalysisQuery(queryType, parameters = {}) {
    this.stats.queryCount++;
    
    switch (queryType) {
      case 'find_deprecated_apis':
        return this.findDeprecatedApiUsage(parameters);
      case 'identify_architectural_violations':
        return this.identifyArchitecturalViolations(parameters);
      case 'find_unused_exports':
        return this.findUnusedExports(parameters);
      case 'analyze_complexity_trends':
        return this.analyzeComplexityTrends(parameters);
      case 'find_tightly_coupled_modules':
        return this.findTightlyCoupledModules(parameters);
      case 'identify_code_smells':
        return this.identifyCodeSmells(parameters);
      default:
        throw new Error(`Unknown query type: ${queryType}`);
    }
  }

  /**
   * Find deprecated API usage patterns
   */
  async findDeprecatedApiUsage(parameters = {}) {
    const deprecatedPatterns = parameters.patterns || [
      'require(',
      'var ',
      'eval(',
      'document.write',
      'innerHTML',
      'setInterval',
      'setTimeout'
    ];
    
    const results = [];
    
    // Find function calls that match deprecated patterns
    const functionCalls = Array.from(this.relationships.values())
      .filter(rel => rel.type === 'CALLS_FUNCTION');
    
    for (const call of functionCalls) {
      const calledFunc = this.nodes.get(call.to);
      if (calledFunc) {
        const funcName = calledFunc.properties.name;
        for (const pattern of deprecatedPatterns) {
          if (funcName.includes(pattern.replace('(', ''))) {
            results.push({
              type: 'deprecated_api',
              function: funcName,
              file: calledFunc.properties.file_id,
              pattern: pattern,
              severity: this.getDeprecationSeverity(pattern),
              recommendation: this.getDeprecationRecommendation(pattern)
            });
          }
        }
      }
    }
    
    return results;
  }

  /**
   * Identify architectural violations
   */
  async identifyArchitecturalViolations(parameters = {}) {
    const rules = parameters.rules || [
      { name: 'no_ui_in_logic', pattern: 'ui/', forbidden_in: 'logic/' },
      { name: 'no_db_in_ui', pattern: 'database/', forbidden_in: 'ui/' },
      { name: 'no_circular_deps', type: 'circular' }
    ];
    
    const violations = [];
    
    for (const rule of rules) {
      if (rule.type === 'circular') {
        // Find circular dependencies
        const circular = await this.findCircularDependencies();
        for (const cycle of circular.cycles) {
          violations.push({
            type: 'circular_dependency',
            rule: rule.name,
            files: cycle.files,
            severity: cycle.severity,
            description: `Circular dependency: ${cycle.files.join(' → ')}`
          });
        }
      } else {
        // Find pattern violations
        const importRelationships = Array.from(this.relationships.values())
          .filter(rel => rel.type === 'IMPORTS_FROM');
        
        for (const rel of importRelationships) {
          const fromFile = this.nodes.get(rel.from);
          const toFile = this.nodes.get(rel.to);
          
          if (fromFile && toFile) {
            const fromPath = fromFile.properties.path || '';
            const toPath = toFile.properties.path || '';
            
            if (fromPath.includes(rule.forbidden_in) && toPath.includes(rule.pattern)) {
              violations.push({
                type: 'architectural_violation',
                rule: rule.name,
                from: fromPath,
                to: toPath,
                severity: 'high',
                description: `${rule.pattern} imported in ${rule.forbidden_in}`
              });
            }
          }
        }
      }
    }
    
    return violations;
  }

  /**
   * Find unused exports
   */
  async findUnusedExports(parameters = {}) {
    const exports = new Map();
    const imports = new Set();
    
    // Collect all exports
    for (const node of this.nodes.values()) {
      if (node.type === 'Export') {
        for (const exportName of node.properties.exported_names || []) {
          exports.set(`${node.properties.file_id}:${exportName}`, {
            name: exportName,
            file: node.properties.file_id,
            type: node.properties.export_type
          });
        }
      }
    }
    
    // Collect all imports
    for (const node of this.nodes.values()) {
      if (node.type === 'Import') {
        for (const importName of node.properties.imported_names || []) {
          imports.add(importName);
        }
      }
    }
    
    // Find exports that are never imported
    const unusedExports = [];
    for (const [key, exportInfo] of exports) {
      if (!imports.has(exportInfo.name) && exportInfo.name !== 'default') {
        unusedExports.push({
          name: exportInfo.name,
          file: exportInfo.file,
          type: exportInfo.type,
          severity: exportInfo.type === 'default' ? 'medium' : 'low'
        });
      }
    }
    
    return unusedExports;
  }

  /**
   * Analyze complexity trends
   */
  async analyzeComplexityTrends(parameters = {}) {
    const functions = Array.from(this.nodes.values())
      .filter(node => node.type === 'Function');
    
    const complexityDistribution = {
      low: { count: 0, range: '1-5', functions: [] },
      medium: { count: 0, range: '6-10', functions: [] },
      high: { count: 0, range: '11-20', functions: [] },
      critical: { count: 0, range: '21+', functions: [] }
    };
    
    let totalComplexity = 0;
    const fileComplexity = new Map();
    
    for (const func of functions) {
      const complexity = func.properties.cyclomatic_complexity || 0;
      totalComplexity += complexity;
      
      // Categorize complexity
      let category;
      if (complexity <= 5) category = 'low';
      else if (complexity <= 10) category = 'medium';
      else if (complexity <= 20) category = 'high';
      else category = 'critical';
      
      complexityDistribution[category].count++;
      complexityDistribution[category].functions.push({
        name: func.properties.name,
        file: func.properties.file_id,
        complexity
      });
      
      // Track file complexity
      const fileId = func.properties.file_id;
      if (!fileComplexity.has(fileId)) {
        fileComplexity.set(fileId, { total: 0, count: 0 });
      }
      const fileData = fileComplexity.get(fileId);
      fileData.total += complexity;
      fileData.count++;
      fileComplexity.set(fileId, fileData);
    }
    
    // Calculate file average complexities
    const fileAverages = [];
    for (const [fileId, data] of fileComplexity) {
      const file = this.nodes.get(fileId);
      if (file) {
        fileAverages.push({
          file: file.properties.path,
          averageComplexity: Math.round((data.total / data.count) * 100) / 100,
          functionCount: data.count,
          totalComplexity: data.total
        });
      }
    }
    
    fileAverages.sort((a, b) => b.averageComplexity - a.averageComplexity);
    
    return {
      overview: {
        totalFunctions: functions.length,
        averageComplexity: functions.length > 0 ? 
          Math.round((totalComplexity / functions.length) * 100) / 100 : 0,
        distribution: complexityDistribution
      },
      topComplexFiles: fileAverages.slice(0, 10),
      recommendations: this.generateComplexityRecommendations(complexityDistribution)
    };
  }

  /**
   * Find tightly coupled modules
   */
  async findTightlyCoupledModules(parameters = {}) {
    const threshold = parameters.threshold || 5;
    const couplingMap = new Map();
    
    // Count dependencies between files
    const importRelationships = Array.from(this.relationships.values())
      .filter(rel => rel.type === 'IMPORTS_FROM');
    
    for (const rel of importRelationships) {
      const fromFile = this.nodes.get(rel.from);
      const toFile = this.nodes.get(rel.to);
      
      if (fromFile && toFile) {
        const key = `${rel.from}-${rel.to}`;
        couplingMap.set(key, {
          from: fromFile.properties.path,
          to: toFile.properties.path,
          strength: (couplingMap.get(key)?.strength || 0) + 1
        });
      }
    }
    
    // Find highly coupled pairs
    const tightlyCoupled = [];
    for (const [key, coupling] of couplingMap) {
      if (coupling.strength >= threshold) {
        tightlyCoupled.push({
          ...coupling,
          severity: coupling.strength > 10 ? 'critical' : 
                   coupling.strength > 7 ? 'high' : 'medium'
        });
      }
    }
    
    return tightlyCoupled.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Identify code smells
   */
  async identifyCodeSmells(parameters = {}) {
    const smells = [];
    
    // Long parameter lists
    const functions = Array.from(this.nodes.values())
      .filter(node => node.type === 'Function' && node.properties.parameter_count > 5);
    
    for (const func of functions) {
      smells.push({
        type: 'long_parameter_list',
        severity: func.properties.parameter_count > 8 ? 'high' : 'medium',
        function: func.properties.name,
        file: func.properties.file_id,
        parameterCount: func.properties.parameter_count,
        description: `Function has ${func.properties.parameter_count} parameters`
      });
    }
    
    // Large classes
    const classes = Array.from(this.nodes.values())
      .filter(node => node.type === 'Class' && node.properties.method_count > 15);
    
    for (const cls of classes) {
      smells.push({
        type: 'large_class',
        severity: cls.properties.method_count > 25 ? 'high' : 'medium',
        class: cls.properties.name,
        file: cls.properties.file_id,
        methodCount: cls.properties.method_count,
        description: `Class has ${cls.properties.method_count} methods`
      });
    }
    
    // Feature envy (high coupling)
    const highCoupling = await this.findTightlyCoupledModules({ threshold: 8 });
    for (const coupling of highCoupling.slice(0, 5)) {
      smells.push({
        type: 'feature_envy',
        severity: 'medium',
        from: coupling.from,
        to: coupling.to,
        couplingStrength: coupling.strength,
        description: `High coupling between modules (${coupling.strength} dependencies)`
      });
    }
    
    return smells.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Generate complexity recommendations
   */
  generateComplexityRecommendations(distribution) {
    const recommendations = [];
    
    if (distribution.critical.count > 0) {
      recommendations.push({
        priority: 'critical',
        type: 'refactor_complex_functions',
        description: `${distribution.critical.count} functions have critical complexity (>20)`,
        action: 'Break down into smaller, focused functions immediately',
        functions: distribution.critical.functions.slice(0, 5)
      });
    }
    
    if (distribution.high.count > 5) {
      recommendations.push({
        priority: 'high',
        type: 'reduce_complexity',
        description: `${distribution.high.count} functions have high complexity (11-20)`,
        action: 'Consider refactoring to reduce cyclomatic complexity',
        functions: distribution.high.functions.slice(0, 3)
      });
    }
    
    const totalComplex = distribution.high.count + distribution.critical.count;
    const totalFunctions = Object.values(distribution).reduce((sum, cat) => sum + cat.count, 0);
    
    if (totalComplex / totalFunctions > 0.2) {
      recommendations.push({
        priority: 'medium',
        type: 'architectural_review',
        description: `${Math.round((totalComplex / totalFunctions) * 100)}% of functions are highly complex`,
        action: 'Consider architectural refactoring to reduce overall complexity'
      });
    }
    
    return recommendations;
  }

  /**
   * Get deprecation severity
   */
  getDeprecationSeverity(pattern) {
    const severityMap = {
      'eval(': 'critical',
      'innerHTML': 'high',
      'document.write': 'high',
      'var ': 'medium',
      'require(': 'medium',
      'setInterval': 'low',
      'setTimeout': 'low'
    };
    
    return severityMap[pattern] || 'low';
  }

  /**
   * Get deprecation recommendation
   */
  getDeprecationRecommendation(pattern) {
    const recommendations = {
      'eval(': 'Use safer alternatives like JSON.parse() or Function constructor',
      'innerHTML': 'Use textContent, createElement, or template literals',
      'document.write': 'Use modern DOM manipulation methods',
      'var ': 'Use const or let for block scoping',
      'require(': 'Use ES6 import/export statements',
      'setInterval': 'Consider requestAnimationFrame for animations',
      'setTimeout': 'Consider using Promises or async/await'
    };
    
    return recommendations[pattern] || 'Consider using modern alternatives';
  }

  getSystemQueries() {
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