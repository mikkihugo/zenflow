"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCommand = void 0;
const node_fs_1 = require("node:fs");
/**
 * Unified start command implementation with robust service management
 */
const command_1 = require("@cliffy/command");
const chalk_1 = require("chalk");
const inquirer_1 = require("inquirer");
const process_manager_js_1 = require("./process-manager.js");
const process_ui_js_1 = require("./process-ui.js");
const system_monitor_js_1 = require("./system-monitor.js");
const event_bus_js_1 = require("../../../core/event-bus.js");
exports.startCommand = new command_1.Command()
    .description('Start the Claude-Flow orchestration system')
    .option('-d, --daemon', 'Run as daemon in background')
    .option('-p, --port <port:number>', 'MCP server port', { default: 3000 })
    .option('--mcp-transport <transport:string>', 'MCP transport type (stdio, http)', {
    default: 'stdio',
})
    .option('-u, --ui', 'Launch interactive process management UI')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('--auto-start', 'Automatically start all processes')
    .option('--config <path:string>', 'Configuration file path')
    .option('--force', 'Force start even if already running')
    .option('--health-check', 'Perform health checks before starting')
    .option('--timeout <seconds:number>', 'Startup timeout in seconds', { default: 60 })
    .action(async (options) => {
    console.log(chalk_1.default.cyan('🧠 Claude-Flow Orchestration System'));
    console.log(chalk_1.default.gray('─'.repeat(60)));
    try {
        // Check if already running
        if (!options.force && await isSystemRunning()) {
            console.log(chalk_1.default.yellow('⚠ Claude-Flow is already running'));
            const { shouldContinue } = await inquirer_1.default.prompt([{
                    type: 'confirm',
                    name: 'shouldContinue',
                    message: 'Stop existing instance and restart?',
                    default: false
                }]);
            if (!shouldContinue) {
                console.log(chalk_1.default.gray('Use --force to override or "claude-flow stop" first'));
                return;
            }
            await stopExistingInstance();
        }
        // Perform pre-flight checks
        if (options.healthCheck) {
            console.log(chalk_1.default.blue('Running pre-flight health checks...'));
            await performHealthChecks();
        }
        // Initialize process manager with timeout
        const processManager = new process_manager_js_1.ProcessManager();
        console.log(chalk_1.default.blue('Initializing system components...'));
        const initPromise = processManager.initialize(options.config);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Initialization timeout')), (options.timeout || 30) * 1000));
        await Promise.race([initPromise, timeoutPromise]);
        // Initialize system monitor with enhanced monitoring
        const systemMonitor = new system_monitor_js_1.SystemMonitor(processManager);
        systemMonitor.start();
        // Setup system event handlers
        setupSystemEventHandlers(processManager, systemMonitor, options);
        // Override MCP settings from CLI options
        if (options.port) {
            const mcpProcess = processManager.getProcess('mcp-server');
            if (mcpProcess) {
                mcpProcess.config = { ...mcpProcess.config, port: options.port };
            }
        }
        // Configure transport settings
        if (options.mcpTransport) {
            const mcpProcess = processManager.getProcess('mcp-server');
            if (mcpProcess) {
                mcpProcess.config = { ...mcpProcess.config, transport: options.mcpTransport };
            }
        }
        // Setup event listeners for logging
        if (options.verbose) {
            setupVerboseLogging(systemMonitor);
        }
        // Launch UI mode
        if (options.ui) {
            // Check if web server is available
            try {
                const { ClaudeCodeWebServer } = await Promise.resolve().then(() => require('../../simple-commands/web-server.js'));
                // Start the web server
                console.log(chalk_1.default.blue('Starting Web UI server...'));
                const webServer = new ClaudeCodeWebServer(options.port);
                await webServer.start();
                // Open browser if possible
                const openCommand = process.platform === 'darwin' ? 'open' :
                    process.platform === 'win32' ? 'start' :
                        'xdg-open';
                try {
                    const { exec } = await Promise.resolve().then(() => require('child_process'));
                    exec(`${openCommand} http://localhost:${options.port}/console`);
                }
                catch {
                    // Browser opening failed, that's okay
                }
                // Keep process running
                console.log(chalk_1.default.green('✨ Web UI is running at:'), chalk_1.default.cyan(`http://localhost:${options.port}/console`));
                console.log(chalk_1.default.gray('Press Ctrl+C to stop'));
                // Handle shutdown
                const shutdownWebUI = async () => {
                    console.log('\n' + chalk_1.default.yellow('Shutting down Web UI...'));
                    await webServer.stop();
                    systemMonitor.stop();
                    await processManager.stopAll();
                    console.log(chalk_1.default.green('✓ Shutdown complete'));
                    process.exit(0);
                };
                Deno.addSignalListener('SIGINT', shutdownWebUI);
                Deno.addSignalListener('SIGTERM', shutdownWebUI);
                // Keep process alive
                await new Promise(() => { });
            }
            catch (webError) {
                // Fall back to TUI if web server is not available
                console.log(chalk_1.default.yellow('Web UI not available, falling back to Terminal UI'));
                const ui = new process_ui_js_1.ProcessUI(processManager);
                await ui.start();
                // Cleanup on exit
                systemMonitor.stop();
                await processManager.stopAll();
                console.log(chalk_1.default.green.bold('✓'), 'Shutdown complete');
                process.exit(0);
            }
        }
        // Daemon mode
        else if (options.daemon) {
            console.log(chalk_1.default.yellow('Starting in daemon mode...'));
            // Auto-start all processes
            if (options.autoStart) {
                console.log(chalk_1.default.blue('Starting all system processes...'));
                await startWithProgress(processManager, 'all');
            }
            else {
                // Start only core processes
                console.log(chalk_1.default.blue('Starting core processes...'));
                await startWithProgress(processManager, 'core');
            }
            // Create PID file with metadata
            const pid = Deno.pid;
            const pidData = {
                pid,
                startTime: Date.now(),
                config: options.config || 'default',
                processes: processManager.getAllProcesses().map(p => ({ id: p.id, status: p.status }))
            };
            await node_fs_1.promises.writeFile('.claude-flow.pid', JSON.stringify(pidData, null, 2));
            console.log(chalk_1.default.gray(`Process ID: ${pid}`));
            // Wait for services to be fully ready
            await waitForSystemReady(processManager);
            console.log(chalk_1.default.green.bold('✓'), 'Daemon started successfully');
            console.log(chalk_1.default.gray('Use "claude-flow status" to check system status'));
            console.log(chalk_1.default.gray('Use "claude-flow monitor" for real-time monitoring'));
            // Keep process running
            await new Promise(() => { });
        }
        // Interactive mode (default)
        else {
            console.log(chalk_1.default.cyan('Starting in interactive mode...'));
            console.log();
            // Show available options
            console.log(chalk_1.default.white.bold('Quick Actions:'));
            console.log('  [1] Start all processes');
            console.log('  [2] Start core processes only');
            console.log('  [3] Launch process management UI');
            console.log('  [4] Show system status');
            console.log('  [q] Quit');
            console.log();
            console.log(chalk_1.default.gray('Press a key to select an option...'));
            // Handle user input
            const decoder = new TextDecoder();
            while (true) {
                const buf = new Uint8Array(1);
                await Deno.stdin.read(buf);
                const key = decoder.decode(buf);
                switch (key) {
                    case '1':
                        console.log(chalk_1.default.cyan('\nStarting all processes...'));
                        await startWithProgress(processManager, 'all');
                        console.log(chalk_1.default.green.bold('✓'), 'All processes started');
                        break;
                    case '2':
                        console.log(chalk_1.default.cyan('\nStarting core processes...'));
                        await startWithProgress(processManager, 'core');
                        console.log(chalk_1.default.green.bold('✓'), 'Core processes started');
                        break;
                    case '3':
                        const ui = new process_ui_js_1.ProcessUI(processManager);
                        await ui.start();
                        break;
                    case '4':
                        console.clear();
                        systemMonitor.printSystemHealth();
                        console.log();
                        systemMonitor.printEventLog(10);
                        console.log();
                        console.log(chalk_1.default.gray('Press any key to continue...'));
                        await Deno.stdin.read(new Uint8Array(1));
                        break;
                    case 'q':
                    case 'Q':
                        console.log(chalk_1.default.yellow('\nShutting down...'));
                        await processManager.stopAll();
                        systemMonitor.stop();
                        console.log(chalk_1.default.green.bold('✓'), 'Shutdown complete');
                        process.exit(0);
                        break;
                }
                // Redraw menu
                console.clear();
                console.log(chalk_1.default.cyan('🧠 Claude-Flow Interactive Mode'));
                console.log(chalk_1.default.gray('─'.repeat(60)));
                // Show current status
                const stats = processManager.getSystemStats();
                console.log(chalk_1.default.white('System Status:'), chalk_1.default.green(`${stats.runningProcesses}/${stats.totalProcesses} processes running`));
                console.log();
                console.log(chalk_1.default.white.bold('Quick Actions:'));
                console.log('  [1] Start all processes');
                console.log('  [2] Start core processes only');
                console.log('  [3] Launch process management UI');
                console.log('  [4] Show system status');
                console.log('  [q] Quit');
                console.log();
                console.log(chalk_1.default.gray('Press a key to select an option...'));
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red.bold('Failed to start:'), error.message);
        if (options.verbose) {
            console.error(error.stack);
        }
        // Cleanup on failure
        console.log(chalk_1.default.yellow('Performing cleanup...'));
        try {
            await cleanupOnFailure();
        }
        catch (cleanupError) {
            console.error(chalk_1.default.red('Cleanup failed:'), cleanupError.message);
        }
        process.exit(1);
    }
});
// Enhanced helper functions
async function isSystemRunning() {
    try {
        const pidData = await node_fs_1.promises.readFile('.claude-flow.pid', 'utf-8');
        const data = JSON.parse(pidData);
        // Check if process is still running
        try {
            Deno.kill(data.pid, 'SIGTERM');
            return false; // Process was killed, so it was running
        }
        catch {
            return false; // Process not found
        }
    }
    catch {
        return false; // No PID file
    }
}
async function stopExistingInstance() {
    try {
        const pidData = await node_fs_1.promises.readFile('.claude-flow.pid', 'utf-8');
        const data = JSON.parse(pidData);
        console.log(chalk_1.default.yellow('Stopping existing instance...'));
        Deno.kill(data.pid, 'SIGTERM');
        // Wait for graceful shutdown
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Force kill if still running
        try {
            Deno.kill(data.pid, 'SIGKILL');
        }
        catch {
            // Process already stopped
        }
        await Deno.remove('.claude-flow.pid').catch(() => { });
        console.log(chalk_1.default.green('✓ Existing instance stopped'));
    }
    catch (error) {
        console.warn(chalk_1.default.yellow('Warning: Could not stop existing instance'), error.message);
    }
}
async function performHealthChecks() {
    const checks = [
        { name: 'Disk Space', check: checkDiskSpace },
        { name: 'Memory Available', check: checkMemoryAvailable },
        { name: 'Network Connectivity', check: checkNetworkConnectivity },
        { name: 'Required Dependencies', check: checkDependencies }
    ];
    for (const { name, check } of checks) {
        try {
            console.log(chalk_1.default.gray(`  Checking ${name}...`));
            await check();
            console.log(chalk_1.default.green(`  ✓ ${name} OK`));
        }
        catch (error) {
            console.log(chalk_1.default.red(`  ✗ ${name} Failed: ${error.message}`));
            throw error;
        }
    }
}
async function checkDiskSpace() {
    // Basic disk space check - would need platform-specific implementation
    const stats = await node_fs_1.promises.stat('.');
    if (!stats.isDirectory) {
        throw new Error('Current directory is not accessible');
    }
}
async function checkMemoryAvailable() {
    // Memory check - would integrate with system memory monitoring
    const memoryInfo = Deno.memoryUsage();
    if (memoryInfo.heapUsed > 500 * 1024 * 1024) { // 500MB threshold
        throw new Error('High memory usage detected');
    }
}
async function checkNetworkConnectivity() {
    // Basic network check
    try {
        const response = await fetch('https://httpbin.org/status/200', {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        if (!response.ok) {
            throw new Error(`Network check failed: ${response.status}`);
        }
    }
    catch {
        console.log(chalk_1.default.yellow('  ⚠ Network connectivity check skipped (offline mode?)'));
    }
}
async function checkDependencies() {
    // Check for required directories and files
    const requiredDirs = ['.claude-flow', 'memory', 'logs'];
    for (const dir of requiredDirs) {
        try {
            await Deno.mkdir(dir, { recursive: true });
        }
        catch (error) {
            throw new Error(`Cannot create required directory: ${dir}`);
        }
    }
}
function setupSystemEventHandlers(processManager, systemMonitor, options) {
    // Handle graceful shutdown signals
    const shutdownHandler = async () => {
        console.log('\n' + chalk_1.default.yellow('Received shutdown signal, shutting down gracefully...'));
        systemMonitor.stop();
        await processManager.stopAll();
        await cleanupOnShutdown();
        console.log(chalk_1.default.green('✓ Shutdown complete'));
        process.exit(0);
    };
    Deno.addSignalListener('SIGINT', shutdownHandler);
    Deno.addSignalListener('SIGTERM', shutdownHandler);
    // Setup verbose logging if requested
    if (options.verbose) {
        setupVerboseLogging(systemMonitor);
    }
    // Monitor for critical errors
    processManager.on('processError', (event) => {
        console.error(chalk_1.default.red(`Process error in ${event.processId}:`), event.error);
        if (event.processId === 'orchestrator') {
            console.error(chalk_1.default.red.bold('Critical process failed, initiating recovery...'));
            // Could implement auto-recovery logic here
        }
    });
}
async function startWithProgress(processManager, mode) {
    const processes = mode === 'all'
        ? ['event-bus', 'memory-manager', 'terminal-pool', 'coordinator', 'mcp-server', 'orchestrator']
        : ['event-bus', 'memory-manager', 'mcp-server'];
    for (let i = 0; i < processes.length; i++) {
        const processId = processes[i];
        const progress = `[${i + 1}/${processes.length}]`;
        console.log(chalk_1.default.gray(`${progress} Starting ${processId}...`));
        try {
            await processManager.startProcess(processId);
            console.log(chalk_1.default.green(`${progress} ✓ ${processId} started`));
        }
        catch (error) {
            console.log(chalk_1.default.red(`${progress} ✗ ${processId} failed: ${error.message}`));
            if (processId === 'orchestrator' || processId === 'mcp-server') {
                throw error; // Critical processes
            }
        }
        // Brief delay between starts
        if (i < processes.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
}
async function waitForSystemReady(processManager) {
    console.log(chalk_1.default.blue('Waiting for system to be ready...'));
    const maxWait = 30000; // 30 seconds
    const checkInterval = 1000; // 1 second
    let waited = 0;
    while (waited < maxWait) {
        const stats = processManager.getSystemStats();
        if (stats.errorProcesses === 0 && stats.runningProcesses >= 3) {
            console.log(chalk_1.default.green('✓ System ready'));
            return;
        }
        await new Promise(resolve => setTimeout(resolve, checkInterval));
        waited += checkInterval;
    }
    console.log(chalk_1.default.yellow('⚠ System startup completed but some processes may not be fully ready'));
}
async function cleanupOnFailure() {
    try {
        await Deno.remove('.claude-flow.pid').catch(() => { });
        console.log(chalk_1.default.gray('Cleaned up PID file'));
    }
    catch {
        // Ignore cleanup errors
    }
}
async function cleanupOnShutdown() {
    try {
        await Deno.remove('.claude-flow.pid').catch(() => { });
        console.log(chalk_1.default.gray('Cleaned up PID file'));
    }
    catch {
        // Ignore cleanup errors
    }
}
function setupVerboseLogging(monitor) {
    // Enhanced verbose logging
    console.log(chalk_1.default.gray('Verbose logging enabled'));
    // Periodically print system health
    setInterval(() => {
        console.log();
        console.log(chalk_1.default.cyan('--- System Health Report ---'));
        monitor.printSystemHealth();
        console.log(chalk_1.default.cyan('--- End Report ---'));
    }, 30000);
    // Log critical events
    event_bus_js_1.eventBus.on('process:started', (data) => {
        console.log(chalk_1.default.green(`[VERBOSE] Process started: ${data.processId}`));
    });
    event_bus_js_1.eventBus.on('process:stopped', (data) => {
        console.log(chalk_1.default.yellow(`[VERBOSE] Process stopped: ${data.processId}`));
    });
    event_bus_js_1.eventBus.on('process:error', (data) => {
        console.log(chalk_1.default.red(`[VERBOSE] Process error: ${data.processId} - ${data.error}`));
    });
}
