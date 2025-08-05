#!/usr/bin/env node

/**
 * UACL Integration Validation Script
 * 
 * Tests the complete UACL integration to ensure everything is working correctly.
 */

const { printValidationReport } = require('../dist/interfaces/clients/validation');

async function main() {
  console.log('🔍 Starting UACL Integration Validation...\n');
  
  try {
    await printValidationReport();
  } catch (error) {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };