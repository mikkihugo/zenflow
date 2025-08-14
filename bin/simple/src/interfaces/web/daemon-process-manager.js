import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getLogger } from '../../config/logging-config.ts';
export class DaemonProcessManager {
    logger = getLogger('Daemon');
    config;
    constructor(config = {}) {
        this.config = {
            pidFile: config?.pidFile || join(process.cwd(), '.claude-zen-web.pid'),
            logFile: config?.logFile || join(process.cwd(), '.claude-zen-web.log'),
            errorFile: config?.errorFile || join(process.cwd(), '.claude-zen-web.error'),
            cwd: config?.cwd || process.cwd(),
            detached: config?.detached ?? true,
        };
    }
    async startDaemon(command, args = []) {
        const existing = await this.getRunningProcess();
        if (existing) {
            throw new Error(`Daemon already running with PID: ${existing.pid}`);
        }
        this.logger.info('Starting daemon process...', { command, args });
        await this.ensureDirectories();
        const child = spawn(command, args, {
            cwd: this.config.cwd,
            detached: this.config.detached,
            stdio: ['ignore', 'ignore', 'ignore'],
        });
        if (!child?.pid) {
            throw new Error('Failed to start daemon process');
        }
        const processInfo = {
            pid: child?.pid,
            startTime: new Date(),
            status: 'running',
            command,
            args,
        };
        await writeFile(this.config.pidFile, child?.pid.toString());
        child?.on('error', (error) => {
            this.logger.error('Daemon process error:', error);
            this.handleProcessError(error);
        });
        child?.on('exit', (code, signal) => {
            this.logger.info(`Daemon process exited with code ${code}, signal ${signal}`);
            this.cleanupPidFile();
        });
        if (this.config.detached) {
            child?.unref();
        }
        this.currentProcess = child;
        this.logger.info(`Daemon started with PID: ${child?.pid}`);
        return processInfo;
    }
    async stopDaemon(signal = 'SIGTERM') {
        const processInfo = await this.getRunningProcess();
        if (!processInfo) {
            this.logger.warn('No daemon process found to stop');
            return false;
        }
        this.logger.info(`Stopping daemon process: ${processInfo.pid}`);
        try {
            process.kill(processInfo.pid, signal);
            await this.waitForProcessStop(processInfo.pid, 10000);
            await this.cleanupPidFile();
            this.logger.info('Daemon process stopped successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Failed to stop daemon process:', error);
            if (signal !== 'SIGKILL') {
                this.logger.warn('Attempting force kill...');
                return this.stopDaemon('SIGKILL');
            }
            return false;
        }
    }
    async restartDaemon(command, args = []) {
        this.logger.info('Restarting daemon process...');
        await this.stopDaemon();
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.startDaemon(command, args);
    }
    async getRunningProcess() {
        if (!existsSync(this.config.pidFile)) {
            return null;
        }
        try {
            const pidContent = await readFile(this.config.pidFile, 'utf-8');
            const pid = Number.parseInt(pidContent.trim());
            if (Number.isNaN(pid)) {
                await this.cleanupPidFile();
                return null;
            }
            if (!this.isProcessRunning(pid)) {
                await this.cleanupPidFile();
                return null;
            }
            return {
                pid,
                startTime: new Date(),
                status: 'running',
                command: 'unknown',
                args: [],
            };
        }
        catch (error) {
            this.logger.error('Failed to read PID file:', error);
            await this.cleanupPidFile();
            return null;
        }
    }
    async isDaemonRunning() {
        const processInfo = await this.getRunningProcess();
        return processInfo !== null;
    }
    async getDaemonStatus() {
        const processInfo = await this.getRunningProcess();
        if (!processInfo) {
            return {
                running: false,
                status: 'stopped',
            };
        }
        try {
            const isRunning = this.isProcessRunning(processInfo.pid);
            return {
                running: isRunning,
                pid: processInfo.pid,
                uptime: Date.now() - processInfo.startTime.getTime(),
                memory: process.memoryUsage(),
                status: isRunning ? 'healthy' : 'unhealthy',
            };
        }
        catch (error) {
            this.logger.error('Failed to get daemon status:', error);
            return {
                running: false,
                status: 'unhealthy',
            };
        }
    }
    async readLogs(maxLines = 100) {
        if (!existsSync(this.config.logFile)) {
            return [];
        }
        try {
            const content = await readFile(this.config.logFile, 'utf-8');
            const lines = content.split('\n').filter((line) => line.trim());
            return lines.slice(-maxLines);
        }
        catch (error) {
            this.logger.error('Failed to read daemon logs:', error);
            return [];
        }
    }
    isProcessRunning(pid) {
        try {
            process.kill(pid, 0);
            return true;
        }
        catch (_error) {
            return false;
        }
    }
    async waitForProcessStop(pid, timeout) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            if (!this.isProcessRunning(pid)) {
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        throw new Error(`Process ${pid} did not stop within ${timeout}ms`);
    }
    async cleanupPidFile() {
        try {
            if (existsSync(this.config.pidFile)) {
                await unlink(this.config.pidFile);
                this.logger.debug('PID file cleaned up');
            }
        }
        catch (error) {
            this.logger.error('Failed to cleanup PID file:', error);
        }
    }
    async ensureDirectories() {
        const dirs = [
            this.config.pidFile,
            this.config.logFile,
            this.config.errorFile,
        ].map((file) => file.substring(0, file.lastIndexOf('/')));
        for (const dir of [...new Set(dirs)]) {
            if (dir && !existsSync(dir)) {
                await mkdir(dir, { recursive: true });
            }
        }
    }
    async handleProcessError(error) {
        const errorLog = {
            timestamp: new Date().toISOString(),
            error: error.message,
            stack: error.stack,
        };
        try {
            await writeFile(this.config.errorFile, `${JSON.stringify(errorLog, null, 2)}\n`, {
                flag: 'a',
            });
        }
        catch (writeError) {
            this.logger.error('Failed to write error log:', writeError);
        }
    }
}
export default DaemonProcessManager;
//# sourceMappingURL=daemon-process-manager.js.map