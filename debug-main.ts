#!/usr/bin/env node
/**
 * Minimal main.ts to debug the issue
 */

console.log('🚀 Starting debug main...');

// Test 1: Basic imports
try {
  console.log('1️⃣ Testing basic imports...');
  const { parseArgs } = await import('node:util');
  console.log('✅ node:util works');
  
  const { configure } = await import('@logtape/logtape');
  console.log('✅ @logtape/logtape works');
  
  const { getLogger } = await import('./src/config/logging-config');
  console.log('✅ logging-config works');
  
} catch (error) {
  console.error('❌ Basic imports failed:', error.message);
  process.exit(1);
}

// Test 2: LogTape configuration
try {
  console.log('2️⃣ Testing LogTape configuration...');
  const { configure } = await import('@logtape/logtape');
  await configure({
    sinks: {
      console: { type: 'console' },
    },
    loggers: [{ category: [], level: 'debug', sinks: ['console'] }],
  });
  console.log('✅ LogTape configured');
} catch (error) {
  console.error('❌ LogTape configuration failed:', error.message);
  process.exit(1);
}

// Test 3: DI Container
try {
  console.log('3️⃣ Testing DI container...');
  const { createClaudeZenDIContainer, initializeDIServices, shutdownDIContainer } = await import('./src/core/di-container');
  
  const container = createClaudeZenDIContainer();
  console.log('✅ Container created');
  
  await initializeDIServices(container);
  console.log('✅ Services initialized');
  
  await shutdownDIContainer(container);
  console.log('✅ Container shutdown');
  
} catch (error) {
  console.error('❌ DI container failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Test 4: WebDashboardServer
try {
  console.log('4️⃣ Testing WebDashboardServer...');
  const { WebDashboardServer } = await import('./src/interfaces/web');
  
  const webApp = new WebDashboardServer({
    port: 3001, // Use different port
    host: 'localhost',
  });
  console.log('✅ WebDashboardServer created');
  
  await webApp.start();
  console.log('✅ WebDashboardServer started');
  
  await webApp.stop();
  console.log('✅ WebDashboardServer stopped');
  
} catch (error) {
  console.error('❌ WebDashboardServer failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}

console.log('🎉 All tests passed! Issue must be in the integration');