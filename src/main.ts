#!/usr/bin/env node
/**
 * @file Claude Code Zen - Unified Web Dashboard Entry Point
 * 
 * Simple, clean entry point for the web-only interface.
 * All TUI and MCP complexity removed for maximum simplicity.
 */

import { configure } from '@logtape/logtape';
import { getLogger } from './config/logging-config';
import { ProcessLifecycleManager } from './core/process-lifecycle';
import type { DIContainer } from './di/index';
import { createClaudeZenDIContainer, initializeDIServices, shutdownDIContainer } from './core/di-container';
import { WebDashboardServer } from './interfaces/web/web-dashboard-server';

// Logger will be initialized after LogTape configuration
let logger: any;

// Simple web-only configuration - no command line complexity
const config = {
  port: 3000,
  host: 'localhost'
};

async function checkIfRunning(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3000/health');
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  // Configure LogTape first, before any loggers are created
  await configure({
    sinks: {
      console: { type: 'console' },
    },
    loggers: [{ category: [], level: 'debug', sinks: ['console'] }],
  });

  logger = getLogger('Main');

  // Check if another instance is already running
  const isRunning = await checkIfRunning();

  if (isRunning) {
    logger.info(
      '📡 Claude-zen is already running - redirecting to existing web dashboard...'
    );
    logger.info('🌐 Access your dashboard at: http://localhost:3000');
    process.exit(0);
  }

  logger.info('🚀 Starting Claude Code Zen Web Dashboard');

  // Initialize DI container for all modes
  logger.info('📦 Creating DI container...');
  const container = createClaudeZenDIContainer();
  await initializeDIServices(container);

  // Setup process lifecycle management
  const lifecycleManager = new ProcessLifecycleManager({
    onShutdown: async () => {
      logger.info('🧹 Shutting down DI container...');
      await shutdownDIContainer(container);
    },
    onError: async (error: Error) => {
      logger.error('💥 Application error:', error);
      await shutdownDIContainer(container);
    },
  });

  try {
    // Simple web-only startup - no mode complexity
    logger.info('🚀 Starting Claude Code Zen Web Dashboard...');
    logger.info('🌐 Unified web interface with AI orchestration and swarm management');

    // Start web server with basic dashboard
    // WebDashboardServer imported statically at top
    const webApp = new WebDashboardServer({
      port: config.port,
      host: config.host,
    });

    await webApp.start();
    
    logger.info(`✅ Web Dashboard running at http://localhost:${config.port}`);
    logger.info(`🌐 Access your dashboard: http://localhost:${config.port}`);
    logger.info(`📊 Features: System Status • Swarm Management • Performance Monitor • Live Logs • Settings`);
    
    // Keep process alive
    await new Promise(() => {});
  } catch (error) {
    logger.error('💥 Application error:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
