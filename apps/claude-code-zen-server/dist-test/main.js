#!/usr/bin/env node
/**
 * @file Claude Code Zen - Minimal Entry Point
 *
 * Simplified entry point that provides essential services without legacy web dashboard.
 * The workspace functionality is now handled by the standalone workspace server.
 */
import { getLogger, getConfig, createContainer } from '@claude-zen/foundation';
const logger = getLogger('Main');
// Use foundation's configuration system + command line args
const config = getConfig();
// Parse port from command line arguments or environment
const portArg = process.argv.find(arg => arg.startsWith('--port'));
const envPort = process.env.PORT || process.env.ZEN_SERVER_PORT;
const defaultPort = portArg
    ? parseInt(portArg.split('=')[1] || process.argv[process.argv.indexOf(portArg) + 1])
    : envPort
        ? parseInt(envPort)
        : 3000;
const port = defaultPort;
const host = process.env.ZEN_SERVER_HOST || 'localhost';
async function checkIfRunning() {
    try {
        const response = await fetch(`http://localhost:${port}/api/health`);
        return response.ok;
    }
    catch {
        return false;
    }
}
async function main() {
    // Check if another instance is already running
    const isRunning = await checkIfRunning();
    if (isRunning) {
        logger.info('📡 Claude-zen is already running - redirecting to existing web dashboard...');
        logger.info(`🌐 Access your dashboard at: http://localhost:${port}`);
        process.exit(0);
    }
    logger.info('🚀 Starting Claude Code Zen with API Services');
    // Use foundation's DI container
    const container = createContainer('claude-zen-main');
    logger.info('✅ DI container created successfully');
    try {
        logger.info('🚀 Starting Claude Code Zen Web Server...');
        logger.info('🌐 Web server with API endpoints and workspace functionality');
        // Import and start the API server
        logger.info('🔧 Importing ApiServer...');
        const { ApiServer } = await import('./interfaces/web/api-server');
        logger.info('✅ ApiServer imported successfully');
        logger.info('🏗️ Creating ApiServer instance...');
        const webApp = new ApiServer({
            port: port,
            host: host,
        });
        logger.info('✅ ApiServer instance created');
        logger.info('🚀 Starting ApiServer...');
        await webApp.start();
        logger.info('✅ ApiServer started successfully');
        logger.info(`✅ Web Server running at http://localhost:${config.port}`);
        logger.info(`🌐 Access your workspace: http://localhost:${config.port}/workspace`);
        logger.info(`📊 API Features: File Operations • Health Check • System Status • Workspace Management`);
        logger.info('✅ Claude Code Zen running successfully');
        logger.info(`🌐 Workspace: http://localhost:${config.port}/workspace`);
        logger.info(`🔗 API: http://localhost:${config.port}/api/`);
        logger.info('🎯 Ready for development');
        logger.info('🛡️ Graceful shutdown enabled - use Ctrl+C or SIGTERM to stop');
        // Since terminus handles shutdown, we can use a simple keep-alive
        // The server will handle graceful shutdown via terminus
        const keepAlive = () => new Promise(() => { }); // Infinite promise
        await keepAlive();
    }
    catch (error) {
        logger.error('💥 Application error:', error);
        process.exit(1);
    }
}
// Start the application
main().catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
