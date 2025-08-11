#!/usr/bin/env npx tsx
/**
 * Minimal working version to test logger initialization
 */

import { parseArgs } from 'node:util';
import { configure } from '@logtape/logtape';
import { getLogger } from './src/config/logging-config.js';

console.log('🚀 Starting minimal test...');

async function setupLogging() {
  console.log('📝 Setting up logging...');

  try {
    const logger = getLogger('Test');
    console.log('✅ Logger created');

    // Test logger call
    logger.info('✅ Logger working!');
    console.log('✅ Logger info call completed');

    return logger;
  } catch (error) {
    console.error('❌ Logger setup failed:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting main function...');
    const logger = await setupLogging();
    console.log('✅ Logger setup completed');

    // Parse args
    console.log('📋 Parsing arguments...');
    const { values: args } = parseArgs({
      options: {
        mode: { type: 'string', default: 'tui' },
        port: { type: 'string', default: '3000' },
        help: { type: 'boolean', short: 'h' },
      },
      allowPositionals: true,
    });
    console.log('✅ Arguments parsed');

    const mode = process.argv[2] || args.mode || 'tui';
    console.log(`🎯 Mode: ${mode}, Port: ${args.port}`);
    logger.info(`Mode: ${mode}, Port: ${args.port}`);

    if (mode === 'core' || mode === 'integrated' || mode === 'web') {
      console.log('🌐 Would start web server here...');
      logger.info('🌐 Would start web server here...');
    }

    console.log('✅ Main function completed');
    logger.info('✅ Minimal test completed successfully');

    // Exit cleanly
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in main:', error);
    process.exit(1);
  }
}

main();
