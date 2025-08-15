#!/usr/bin/env node
/**
 * Simplified main.ts to test the DI container issue
 */

import { configure } from '@logtape/logtape';
import { getLogger } from './src/config/logging-config';

console.log('🚀 Starting simplified test...');

async function main() {
  // Configure LogTape first
  await configure({
    sinks: {
      console: { type: 'console' },
    },
    loggers: [{ category: [], level: 'debug', sinks: ['console'] }],
  });

  const logger = getLogger('Main');
  logger.info('🚀 Starting test');

  // Test DI container import
  logger.info('📦 Importing DI container...');
  try {
    const diModule = await import('./src/core/di-container');
    logger.info('✅ Import successful');
    
    const container = diModule.createClaudeZenDIContainer();
    logger.info('✅ Container created');
    
    await diModule.initializeDIServices(container);
    logger.info('✅ Services initialized');
    
    logger.info('✅ All tests passed - main.ts should work!');
    
    // Cleanup
    await diModule.shutdownDIContainer(container);
    
  } catch (error) {
    logger.error('❌ DI container error:', error);
    throw error;
  }
}

main().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});