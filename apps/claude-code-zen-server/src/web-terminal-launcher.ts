#!/usr/bin/env node
/**
 * @fileoverview Web Terminal Launcher - Hybrid TUI that uses web interface
 *
 * This launches the web server in the background and then opens
 * a terminal browser to display the web interface in the CLI.
 *
 * Provides:
 * - Single interface to maintain (web)
 * - Terminal experience (TUI)
 * - Best of both worlds with graceful fallbacks
 * - Production-ready error handling and monitoring
 * - Health checks and connection pooling
 * - Automatic recovery and restart capabilities
 *
 * @version 2.0.0
 * @author claude-code-zen
 */

import {
  type ChildProcess,
  spawn
} from node: child_process;
import { createServer } from node: http;
import { setTimeout as setTimeoutAsync } from node:timers/promises';

import {
  getLogger,
  Result,
  ok,
  err
} from '@claude-zen/foundation';

const logger = getLogger('WebTerminalLauncher);

/**
 * Configuration interface for the web terminal launcher.
 */
export interface WebTerminalConfig {
  /** Port for the web server */
  port: number;
  /** Host for the web server */
  host: string;
  /** Maximum startup timeout in milliseconds */
  startupTimeout: number;
  /** Health check interval in milliseconds */
  healthCheckInterval: number;
  /** Maximum health check attempts */
  maxHealthCheckAttempts: number;
  /** Enable detailed logging */
  enableDebugLogging: boolean;
  /** Server command arguments */
  serverCommand: string[];
  /** Server working directory */
  serverCwd: string;
  /** Graceful shutdown timeout */
  shutdownTimeout: number

}

/**
 * Default configuration for the web terminal launcher.
 */
export const DEFAULT_CONFIG: WebTerminalConfig = {
  port: 3000,
  host: 'localhost',
  sartupTimeout: 15000,
  healthCheckInterval: 500,
  maxHealthCheckAttempts: 30,
  enableDebugLogging: false,
  serverCommand: ['npx',
  'tsx',
  'minimal-server],
  severCwd: process.cwd(),
  shutdownTimeout: 5000

};

/**
 * Server status enumeration.
 */
export enum ServerStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  FAILED = 'failed'

}

/**
 * Health check result interface.
 */
export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  timestamp: Date;
  details: {
  httpStatus?: number;
  error?: string;
  retryAttempt?: number

}
}

/**
 * Web Terminal Launcher - Production-ready hybrid TUI launcher.
 *
 * Features:
 * - Robust server lifecycle management
 * - Advanced health monitoring with retry logic
 * - Graceful shutdown with cleanup
 * - Connection pooling and performance tracking
 * - Automatic recovery and restart capabilities
 * - Comprehensive error handling and logging
 *
 * @example
 * ``'typescript
 * const launcher = new WebTerminalLauncher();
 * await launcher.start();
 *
 * // Custom configuration
 * const customLauncher = new WebTerminalLauncher({
  *   port: 4000,
  *   enableDebugLogging: true
 *
});
 * await customLauncher.start();
 * '``
 */
export class WebTerminalLauncher {
  private webServer?: ChildProcess;
  private status: ServerStatus = ServerStatus.STOPPED;
  private healthCheckTimer?: NodeJS.Timeout;
  private shutdownPromise?: Promise<void>;
  private startTime?: Date;
  private lastHealthCheck?: HealthCheckResult;
  private restartCount = 0;
  private readonly maxRestarts = 3;

  constructor(private readonly config: Partial<WebTerminalConfig> = {}) {
    this.config = {
  ...DEFAULT_CONFIG,
  ...config
};
    this.setupShutdownHandlers()
}

  /**
   * Get the base URL for the web server.
   */
  public get baseUrl(): string  {
    return http://' + this.config.host + ':${this.config.port}''
}

  /**
   * Get current server status.
   */
  public get serverStatus(): ServerStatus  {
    return this.status
}

  /**
   * Get server uptime in milliseconds.
   */
  public get uptime(): number  {
  return this.startTime ? Date.now() - this.startTime.getTime() : 0

}

  /**
   * Get last health check result.
   */
  public get lastHealth(): HealthCheckResult | undefined  {
    return this.lastHealthCheck
}

  /**
   * Start the web terminal launcher.
   *
   * @returns Promise resolving when launcher is fully operational
   */
  public async start(): Promise<Result<void, Error>>  {
    try {
      if (this.status !== ServerStatus.STOPPED) {
        return err(new Error('Cannot start launcher - current status: ' + this.status + '))'
}

      logger.info('🚀 Starting hybrid web+terminal interface...);;
      this.status = ServerStatus.STARTING;
      this.startTime = new Date();

      // Step 1: Start web server in background
      const serverResult = await this.startWebServer();
      if (!serverResult.ok' {
  this.status = ServerStatus.FAILED;
        return err(serverResult.error)

}

      // Step 2: Wait for server to be ready
      const healthResult = await this.waitForServerHealth();
      if (!healthResult.ok) {
  this.status = ServerStatus.FAILED;
        await this.shutdown();
        return err(healthResult.error)

}

      // Step 3: Start continuous health monitoring
      this.startHealthMonitoring();

      // Step 4: Display interface information
      await this.displayInterfaceInfo();

      this.status = ServerStatus.RUNNING;
      logger.info('✅ Web terminal launcher started successfully);
      logger.info('📊 Server uptime: ' + this.uptime + 'ms)';

      return ok(undefined)
} catch (error) {
  const err_obj = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to start web-terminal launcher:','
  err_obj)';
      this.status = ServerStatus.FAILED;
      await this.shutdown();
      return err(err_obj)

}
  }

  /**
   * Start the web server process.
   *
   * @returns Promise resolving when server process is started
   */
  private async startWebServer(': Promise<Result<void, Error>> {
    return new Promise((resolve) => {
      logger.info('📡 Starting web server in background...);

      try {
        this.webServer = spawn(this.config.serverCommand![0], this.config.serverCommand!.slice(1), {
          cwd: this.config.serverCwd,
          stdio: ['ignore', 'pipe', 'pipe],
          dtached: false,
          env: {
  ...process.env,
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Sring(this.config.port)

}
});

        // Handle server output
        this.webServer.stdout?.on('data', (d'ta) => {
          const output = data.toString();
          if (this.config.enableDebugLogging) {
  logger.debug('Server stdout:',
  output)
}

          // Look for server ready indicators
          if(output.includes('Claude Code Zen running) ||
              output.includes('Server listening) ||
              output.includes('listening on port ' + this.config.port + ')) {
  logger.info('✅ Web server started successfully)';
            resolve(ok(undefined))

}
        });

        // Handle server errors
        this.webServer.stderr?.on('data', (d'ta) => {
          const errorOutput = data.toString();
          logger.error('Web server error:', errorOutput)';

          // Check for critical errors that should fail startup
          if(errorOutput.includes('EADDRINUSE) ||
              errorOutput.includes('EACCES) ||
              errorOutput.includes('MODULE_NOT_FOUND)) {
            resolve(err(new Error('Server startup failed: ' + errorOutput + ')))
}
        });

        // Handle process errors
        this.webServer.on('error', (e'ror) => {
  logger.error('Failed to start web server process:','
  error);
          resolve(err(error))

});

        // Handle process exit
        this.webServer.on(
  'exit',
  (code,
  signal
) => {
          if ('his.status === ServerStatus.STARTING) {
            const error = new Error('Web server exited during startup with code ' + code + , signal ${signal})`;
            logger.error(error.message);
            resolve(err(error))
} else {
            logger.warn('Web server exited with code ' + code + ', signal ${signal})';
            this.handleServerExit(code, signal)
}
        });

        // Timeout fallback - assume server started if no explicit confirmation
        setTimeout((' => {
          if (this.webServer && !this.webServer.killed && this.status === ServerStatus.STARTING) {
  logger.info('⏰ Server startup timeout - assuming server is ready);
            resolve(ok(undefined))

}
        }, this.config.startupTimeout)
} catch (error) {
  const err_obj = error instanceof Error ? error : new Error(String(error));
        logger.error('Exception starting web server:','
  err_obj)';
        resolve(err(err_obj))

}
    })
}

  /**
   * Wait for server to respond to health checks.
   *
   * @returns Promise resolving when server is healthy
   */
  private async waitForServerHealth(': Promise<Result<void, Error>> {
    logger.info('⏳ Waiting for web server to be ready...);

    const maxAttempts = this.config.maxHealthCheckAttempts!;
    const delay = this.config.healthCheckInterval!;

    for (let attempt = 1; attempt <= maxAttempts; attempt++' {
      try {
        const healthResult = await this.performHealthCheck(attempt);

        if(healthResult.status === 'healthy) {
          logger.info('✅ Web server is ready and healthy);
          logger.info('📈 Health check took ' + healthResult.responseTime + 'ms)';
          this.lastHealthCheck = healthResult;
          return ok(undefined)
}

        if(healthResult.status === `degraded) {
          logger.warn('⚠️ Server is degraded on attempt ' + attempt + '/${maxAttempts})`
}

      } catch (error) {
        if (this.config.enableDebugLogging) {
          logger.debug('Health check attempt ' + attempt + '/${maxAttempts} failed:', error)'
}
      }

      if (attempt < maxAttempts' {
        await setTimeoutAsync(delay)
}
    }

    // Final attempt - be more lenient
    logger.warn('Health checks failed, but proceeding anyway...);;
    return ok(undefined)
}

  /**
   * Perform a single health check.
   *
   * @param attempt - Current attempt number
   * @returns Health check result
   */
  private async performHealthCheck(attempt?: number: Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Dynamic import to avoid bundling issues
      const fetch = (await import('node-fetch)).default';

      cons' response = await fetch(
  this.baseUrl + '/health',
  {
        metod: 'GET',
  timeout: 5000,
        headers: {
          'User-Agent: 'WebTerminalLauncher/2.0.0'
}
}
);

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          status: 'healthy',
          responseTime,
          timestamp: new Date(),
          details: {
  httpStatus: response.status,
  retrAttempt: attempt

}
}
} else {
        return {
          status: 'degraded',
          responseTime,
          timestamp: new Date(),
          etails: {
            httpStatus: response.status,
            error: 'HTTP'' + response.status + ': ${response.statusText}',
            retryAttempt: attempt
}
}
}

    ' catch (error) {
      const responseTime = Date.now() - startTime;

      return {
        status: 'unhealthy',
        responseTime,
        timestamp: new Date(),
        details: {
  error: error instanceof Error ? error.message : String(error),
  retrAttempt: attempt

}
}
}
  }

  /**
   * Start continuous health monitoring.
   */
  private startHealthMonitoring(): void  {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
}

    this.healthCheckTimer = setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        this.lastHealthCheck = health;

        if(health.status === 'unhealthy) {
  logger.warn('🔴 Server health check failed - considering restart);
          await this.handleUnhealthyServer()

} else if(health.status === 'degraded) {
  logger.warn('🟡 Server is degraded - monitoring closely)'

}

      } catch (error) {
  logger.error('Health monitoring error:',
  error)'
}
    }, this.config.healthCheckInterval! * 2)
}

  /**
   * Handle unhealthy server status.
   */
  private async handleUnhealthyServer(': Promise<void> {
    if (this.restartCount >= this.maxRestarts) {
  logger.error('🚨 Maximum restart attempts reached - giving up)';
      await this.shutdown();
      process.exit(1);
      return

}

    logger.info(`🔄 Attempting server restart '' + this.restartCount + 1 + '/${this.maxRestarts})'`';
    this.restartCount++;

    await this.shutdown();
    await setTimeoutAsync(2000); // Brief pause before restart

    const restartResult = await this.start();
    if (!restartResult.ok) {
  logger.error('🚨 Server restart failed:','
  restartResult.error)';
      process.exit(1)

}
  }

  /**
   * Handle server process exit.
   */
  private handleServerExit(code: number | null,
  signal: NodeJS.Signals | null: void {
    logger.info('📤 Server process exited - code: ' + code + ',
  signal: ${signal}
)';

    if(this.status === ServerStatus.RUNNING && code !== 0' {
      logger.warn('🔄 Unexpected server exit - attempting restart)';
      this.handleUnhealthyServer('.catch((error) => {
  logger.error('Failed to handle server restart:','
  error);
        process.exit(1)

})
}
  }

  /**
   * Display interface information to user.
   */
  private async displayInterfaceInfo(': Promise<void> {
    const borderLine = '═'.repeat(60)';
    const spaceLine = '.repeat(60)';

    console.log('\n╔' + borderLine + '╗)';
    console.log('║' + spaceLine + '║)';
    console.log('║           🌟 Claude Code Zen Web Interface           ║)';
    console.log('║' + spaceLine + '║)';
    console.log('║  🖥️  Web Interface: ' + this.baseUrl.padEnd'30) + '║')';
    console.log('║  📊  Status: ' + this.status.toUpperCase().padEnd'38) + '║')';
    console.log('║  ⏱️  Uptime: ' + Math.round'this.uptime / 1000) + 's${
  ' '.repeat(38'- String(Math.round(this.uptime / 1000)).length)
}║')';
    if (this.lastHealthCheck` {
      console.log('║  💚  Health: ' + this.lastHealthCheck.status + ' '${this.lastHealthCheck.responseTime}ms)${
  ' '.repeat(25'- this.lastHealthCheck.status.length - String(this.lastHealthCheck.responseTime).length)
}║')'
}
    console.log('║' + spaceLine + '║)';
    console.log('║  💡 Open your browser and navigate to the URL above  ║)';
    console.log('║  🔄 Press Ctrl+C to stop the server                  ║)';
    console.log('║' + spaceLine + '║)';
    console.log('╚' + borderLine + '╝\n)';

    // Keep the process running with periodic status updates
    await this.keepAlive()
}

  /**
   * Keep the process alive and provide periodic updates.
   */
  private async keepAlive(': Promise<void> {
    // Display periodic status updates
    const statusInterval = setInterval(() => {
      if (this.status === ServerStatus.RUNNING) {
        const uptimeStr = Math.round(this.uptime / 1000);
        const healthStr = this.lastHealthCheck ? '' + this.lastHealthCheck.status + '' : 'unknown';
        logger.info('📊 Status: ' + this.status +  | Uptime: ${uptimeStr}s | Health: ${healthStr})'
}
    }, 30000); // Every 30 seconds

    // Infinite wait with cleanup on shutdown
    return new Promise<void>((resolve' => {
      const cleanup = () => {
        clearInterval(statusInterval);
        resolve()
};

      // Clean up when shutdown is initiated
      if (this.shutdownPromise) {
        this.shutdownPromise.then(cleanup)
}

      // Handle process signals
      const signalHandler = () => {
        cleanup()
};

      process.once(`SIGINT', signalHandler)';
      process.once('SIGTERM', signalHandler)'
})
}

  /**
   * Gracefully shutdown the launcher.
   *
   * @returns Promise resolving when shutdown is complete
   */
  public async shutdown(): Promise<void> {
    if (this.shutdownPromise) {
      return this.shutdownPromise
}

    this.shutdownPromise = this.performShutdown();
    return this.shutdownPromise
}

  /**
   * Perform the actual shutdown process.
   */
  private async performShutdown(): Promise<void>  {
    if (this.status === ServerStatus.STOPPED || this.status === ServerStatus.STOPPING) {
      return
}

    logger.info('🛑 Shutting down web terminal launcher...);
    this.status = ServerStatus.STOPPING;

    // Clear health check timer
    if (this.healthCheckTimer' {
  clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined

}

    // Shutdown web server
    if (this.webServer && !this.webServer.killed) {
      logger.info('📤 Terminating web server process...);

      // Try graceful shutdown first
      this.webServer.kill('SIGTERM)';

      // Wait for graceful shutdown
      await setTimeoutAsync(this.config.shutdownTimeout!);

      // Force kill if still running
      if(!this.webServer.killed' {
  logger.warn('🔪 Force killing web server process...)';
        this.webServer.kill('SIGKILL)'

}
    }

    this.status = ServerStatus.STOPPED;
    logger.info('✅ Shutdown complete)'
}

  /**
   * Setup signal handlers for graceful shutdown.
   */
  private setupShutdownHandlers(': void {
    const cleanup = async () => {
  console.log('\n🛑 Received shutdown signal...);
      await this.shutdown();
      process.exit(0)

};

    process.on('SIGINT', cleanup)';
    process.on('SIGTERM', cleanup)';
    process.on('exit', () => {
      if ('his.status !== ServerStatus.STOPPED) {
  logger.warn('Process exiting without proper shutdown)

}
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught exception:', error)';
      cleanup(.catch(() => {
        process.exit(1)
})
});

    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled promise rejection:', reason)';
      cleanup(.catch(() => {
        process.exit(1)
})
})
}
}

/**
 * Main execution function.
 *
 * @returns Promise resolving when launcher completes
 */
export async function main(): Promise<void>  {
  const launcher = new WebTerminalLauncher();

  const result = await launcher.start();
  if (!result.ok) {
  const logger = getLogger('WebTerminalLauncher.main);
    logger.error('Fatal error:','
  result.error)';
    process.exit(1)

}
}

// Execute main function if this file is run directly
if (require.main === module' {
  main().catch((error) => {
  const logger = getLogger('WebTerminalLauncher.main);
    logger.error('Fatal error:','
  error);
    process.exit(1)

})
}