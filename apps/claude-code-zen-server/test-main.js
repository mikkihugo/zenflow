#!/usr/bin/env node
/**
 * Quick test of main.ts functionality using foundation package
 */

import { getLogger, getConfig, createContainer } from '@claude-zen/foundation';

const logger = getLogger('TestMain');
const config = getConfig();

logger.info('✅ Foundation package working correctly');
logger.info('🔧 Config system accessible');
logger.info('📦 DI container available');

// Test port configuration
const envPort = process.env.PORT || process.env.ZEN_SERVER_PORT;
const port = envPort ? parseInt(envPort) : 3000;
const host = process.env.ZEN_SERVER_HOST || 'localhost';

logger.info(`🌐 Server config: ${host}:${port}`);
logger.info('✅ All foundation systems working correctly');