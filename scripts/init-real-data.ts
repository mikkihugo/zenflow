#!/usr/bin/env node

/**
 * Initialize Real Data Environment
 *
 * Sets up the environment for real data operations:
 * - Creates data directories and files
 * - Initializes basic database structures
 * - Sets up MCP server to work with persistent data
 */

import { join } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { createLogger } from '../src/core/logger.js';

const logger = createLogger('real-data-init');

async function main() {
  console.log('🚀 Claude-Code-Zen Real Data Environment Setup');
  console.log('==============================================');

  try {
    // Setup data directories
    const dataDir = './data';
    setupDataDirectories(dataDir);

    // Create initial database files
    setupInitialDatabaseFiles(dataDir);

    // Create configuration files
    setupConfigurationFiles(dataDir);

    console.log('✅ Real data environment setup complete!');
    console.log('');
    console.log('🎯 Environment Ready:');
    console.log('  - 📁 Data directory: ./data/');
    console.log('  - 🗃️ SQLite databases: Ready for structured data');
    console.log('  - 🚀 Vector storage: Ready for embeddings');
    console.log('  - 🕸️ Graph storage: Ready for relationships');
    console.log('  - 🔧 Configuration: Production-ready settings');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log(
      '  1. Start MCP server: npx tsx src/interfaces/mcp-stdio/swarm-server.ts'
    );
    console.log('  2. Test ADR creation: Use adr_create tool');
    console.log('  3. Test semantic search: Use adr_semantic_search tool');
    console.log('  4. Create projects: Use sparc_project_init tool');
    console.log('');
    console.log('📊 Available MCP Tools:');
    console.log('  - adr_create: Create architecture decisions');
    console.log('  - adr_semantic_search: Search existing ADRs');
    console.log('  - adr_relationship_map: Map decision relationships');
    console.log('  - adr_stats: Get ADR statistics');
    console.log('  - hybrid_document_search: Search all documents');
    console.log('  - sparc_project_init: Initialize SPARC projects');
    console.log('  - sparc_workflow_status: Check workflow progress');
    console.log('  - decision_impact_analysis: Analyze decision impacts');
    console.log('  - generate_document_relationships: Create relationships');
  } catch (error) {
    console.error('❌ Real data environment setup failed:', error);
    process.exit(1);
  }
}

function setupDataDirectories(dataDir: string): void {
  console.log('📁 Setting up data directories...');

  const directories = [
    dataDir,
    join(dataDir, 'sqlite'),
    join(dataDir, 'lancedb'),
    join(dataDir, 'kuzu'),
    join(dataDir, 'backups'),
    join(dataDir, 'logs'),
    join(dataDir, 'cache'),
  ];

  directories.forEach((dir) => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`  ✅ Created: ${dir}`);
    } else {
      console.log(`  📂 Exists: ${dir}`);
    }
  });
}

function setupInitialDatabaseFiles(dataDir: string): void {
  console.log('🗄️ Setting up initial database files...');

  // Create placeholder database files
  const dbFiles = [
    {
      path: join(dataDir, 'sqlite', 'claude-zen-production.db'),
      type: 'SQLite',
      description: 'Structured document storage',
    },
    {
      path: join(dataDir, 'lancedb', 'claude-zen-vectors-production.lance'),
      type: 'LanceDB',
      description: 'Vector embeddings and semantic search',
    },
    {
      path: join(dataDir, 'kuzu', 'claude-zen-graph-production.kuzu'),
      type: 'Kuzu',
      description: 'Graph relationships and dependencies',
    },
  ];

  dbFiles.forEach((db) => {
    const dir = join(db.path, '..');
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Create empty database file or directory structure
    if (!existsSync(db.path)) {
      if (db.type === 'SQLite') {
        // Create empty SQLite database file
        writeFileSync(db.path, '');
      } else {
        // Create directory for LanceDB and Kuzu
        mkdirSync(db.path, { recursive: true });
      }
      console.log(`  ✅ Created ${db.type}: ${db.path} (${db.description})`);
    } else {
      console.log(`  📂 Exists ${db.type}: ${db.path}`);
    }
  });
}

function setupConfigurationFiles(dataDir: string): void {
  console.log('⚙️ Setting up configuration files...');

  // Create database configuration
  const dbConfig = {
    production: {
      sqlite: {
        path: join(dataDir, 'sqlite', 'claude-zen-production.db'),
        options: {
          readonly: false,
          fileMustExist: false,
          timeout: 5000,
        },
      },
      lancedb: {
        path: join(dataDir, 'lancedb', 'claude-zen-vectors-production.lance'),
        options: {
          vectorSize: 384,
          metricType: 'cosine',
          createIfNotExists: true,
        },
      },
      kuzu: {
        path: join(dataDir, 'kuzu', 'claude-zen-graph-production.kuzu'),
        options: {
          bufferPoolSize: '1GB',
          maxNumThreads: 4,
          createIfNotExists: true,
        },
      },
    },
    hybrid: {
      enableVectorSearch: true,
      enableGraphRelationships: true,
      vectorDimension: 384,
      logLevel: 'info',
    },
    mcp: {
      serverName: 'claude-code-zen-stdio',
      version: '1.0.0-alpha.43',
      capabilities: ['tools'],
      realDataMode: true,
    },
  };

  const configPath = join(dataDir, 'database-config.json');
  writeFileSync(configPath, JSON.stringify(dbConfig, null, 2));
  console.log(`  ✅ Created database config: ${configPath}`);

  // Create ADR templates
  const adrTemplate = {
    template: {
      title: 'ADR-{number}: {title}',
      sections: {
        context: 'Context and problem statement',
        decision: 'The decision that was made',
        consequences: 'Expected consequences and implications',
        alternatives: 'Alternative approaches considered',
        implementation_notes: 'Implementation guidance',
        success_criteria: 'Success criteria for this decision',
      },
    },
    defaults: {
      status: 'proposed',
      priority: 'medium',
      author: 'claude-zen-system',
      stakeholders: ['architecture-team'],
    },
  };

  const templatePath = join(dataDir, 'adr-template.json');
  writeFileSync(templatePath, JSON.stringify(adrTemplate, null, 2));
  console.log(`  ✅ Created ADR template: ${templatePath}`);

  // Create README
  const readme = `# Claude-Code-Zen Real Data Environment

This directory contains the real data files for the Claude-Code-Zen hybrid database system.

## Structure

- \`sqlite/\` - SQLite databases for structured document storage
- \`lancedb/\` - LanceDB vector databases for semantic search
- \`kuzu/\` - Kuzu graph databases for relationship modeling
- \`backups/\` - Database backups
- \`logs/\` - System logs
- \`cache/\` - Temporary cache files

## Configuration

- \`database-config.json\` - Database connection settings
- \`adr-template.json\` - ADR template configuration

## Usage

The MCP server automatically uses these databases when:
1. Tools are called through the stdio interface
2. Real data operations are performed
3. Persistent storage is required

## Tools Available

All SPARC hybrid tools work with this real data environment:
- \`adr_create\` - Creates ADRs in real SQLite database
- \`adr_semantic_search\` - Searches real vector embeddings
- \`hybrid_document_search\` - Queries across all real databases
- And more...
`;

  const readmePath = join(dataDir, 'README.md');
  writeFileSync(readmePath, readme);
  console.log(`  ✅ Created README: ${readmePath}`);
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as initializeRealDataEnvironment };
