#!/usr/bin/env node

/**
 * Database Initialization Script
 *
 * Standalone script to initialize the claude-code-zen database with all schemas.
 * Run this to set up the database before using ADR Manager, AGUI, or Vision services.
 */

import { join } from 'path';
import { initializeDatabase } from '../src/database/migrations/init-database.js';

async function main() {
  console.log('🚀 Claude-Code-Zen Database Initialization');
  console.log('==========================================');

  try {
    const databasePath =
      process.argv[2]||join(process.cwd(),'data', 'claude-zen.db');
    console.log(`📂 Database location: ${databasePath}`);

    const initializer = await initializeDatabase(databasePath);

    console.log('✅ Database initialization successful!');
    console.log('');
    console.log('🎯 Ready to use:');
    console.log('  - ADR Manager (Architecture Decision Records)');
    console.log('  - Strategic Vision Service');
    console.log('  - AGUI Workflow Validation');
    console.log('  - Document Management System');
    console.log('  - SPARC Integration');

    initializer.close();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
