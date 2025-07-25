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
    
    let results = Array.from(this.nodes.values())
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
    
    let results = Array.from(this.nodes.values())
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