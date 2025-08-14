#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { getLogger } from './config/logging-config.ts';
import { launchTerminalBrowser } from './interfaces/web/terminal-browser/terminal-browser.ts';
const logger = getLogger('WebTerminalLauncher');
class WebTerminalLauncher {
    webServer;
    port = 3000;
    baseUrl = `http://localhost:${this.port}`;
    async start() {
        try {
            logger.info('🚀 Starting hybrid web+terminal interface...');
            await this.startWebServer();
            await this.waitForServer();
            await this.launchTerminalBrowser();
        }
        catch (error) {
            logger.error('Failed to start web-terminal launcher:', error);
            await this.shutdown();
            process.exit(1);
        }
    }
    async startWebServer() {
        return new Promise((resolve, reject) => {
            logger.info('📡 Starting web server in background...');
            this.webServer = spawn('npx', ['tsx', 'minimal-server.ts'], {
                cwd: process.cwd(),
                stdio: ['ignore', 'pipe', 'pipe'],
                detached: false,
            });
            this.webServer.stdout?.on('data', (data) => {
                const output = data.toString();
                if (output.includes('Claude Code Zen running')) {
                    logger.info('✅ Web server started successfully');
                    resolve();
                }
            });
            this.webServer.stderr?.on('data', (data) => {
                logger.error('Web server error:', data.toString());
            });
            this.webServer.on('error', (error) => {
                logger.error('Failed to start web server:', error);
                reject(error);
            });
            this.webServer.on('exit', (code) => {
                if (code !== 0) {
                    reject(new Error(`Web server exited with code ${code}`));
                }
            });
            setTimeout(() => {
                if (this.webServer && !this.webServer.killed) {
                    resolve();
                }
            }, 10000);
        });
    }
    async waitForServer() {
        logger.info('⏳ Waiting for web server to be ready...');
        const maxAttempts = 30;
        const delay = 500;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const fetch = (await import('node-fetch')).default;
                const response = await fetch(this.baseUrl + '/health');
                if (response.ok) {
                    logger.info('✅ Web server is ready');
                    return;
                }
            }
            catch (error) {
            }
            if (attempt < maxAttempts) {
                await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        logger.warn('Web server health check failed, but proceeding...');
    }
    async launchTerminalBrowser() {
        logger.info('🖥️  Launching terminal browser...');
        await launchTerminalBrowser(this.baseUrl, {
            baseUrl: this.baseUrl,
            enableNavigation: true,
            enableForms: true,
            refreshInterval: 5000,
        });
    }
    async shutdown() {
        logger.info('🛑 Shutting down...');
        if (this.webServer && !this.webServer.killed) {
            this.webServer.kill('SIGTERM');
            await new Promise((resolve) => setTimeout(resolve, 2000));
            if (!this.webServer.killed) {
                this.webServer.kill('SIGKILL');
            }
        }
    }
    setupShutdownHandlers() {
        const cleanup = async () => {
            await this.shutdown();
            process.exit(0);
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        process.on('exit', cleanup);
    }
}
async function main() {
    const launcher = new WebTerminalLauncher();
    launcher.setupShutdownHandlers();
    await launcher.start();
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=web-terminal-launcher.js.map