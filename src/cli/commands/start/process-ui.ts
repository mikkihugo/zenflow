/**
 * Process UI - Text-based interface for process management
 */

import { colors } from '@cliffy/ansi/colors';
import { keypress, KeyPressEvent } from '@cliffy/keypress';
import { ProcessManager } from './process-manager.ts';
import { ProcessInfo, ProcessStatus, SystemStats, UIAction } from './types.ts';

export class ProcessUI {
  private processManager: ProcessManager;
  private selectedIndex = 0;
  private running = false;
  private viewMode: 'list' | 'details' | 'logs' = 'list';
  private selectedProcess?: string;
  private refreshInterval?: number;

  constructor(processManager: ProcessManager) {
    this.processManager = processManager;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.processManager.on('statusChanged', ({ processId, status }) => {
      if (this.running) {
        this.render();
      }
    });

    this.processManager.on('processError', ({ processId, error }) => {
      if (this.running) {
        this.showError(`Process ${processId} error: ${error.message}`);
      }
    });
  }

  async start(): Promise<void> {
    this.running = true;
    
    // Hide cursor
    await Deno.stdout.write(new TextEncoder().encode('\x1b[?25l'));
    
    // Clear screen
    console.clear();

    // Setup refresh interval
    this.refreshInterval = setInterval(() => {
      if (this.running && this.viewMode === 'list') {
        this.render();
      }
    }, 1000);

    // Initial render
    this.render();

    // Handle keyboard input
    for await (const event of keypress()) {
      if (!this.running) break;
      await this.handleKeypress(event);
    }
  }

  async stop(): Promise<void> {
    this.running = false;
    
    // Clear refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Show cursor
    await Deno.stdout.write(new TextEncoder().encode('\x1b[?25h'));
    
    // Clear screen
    console.clear();
  }

  private async handleKeypress(event: KeyPressEvent): Promise<void> {
    const { key, ctrlKey } = event;

    // Global shortcuts
    if (ctrlKey && key === 'c') {
      await this.handleExit();
      return;
    }

    if (ctrlKey && key === 'l') {
      console.clear();
      this.render();
      return;
    }

    switch (this.viewMode) {
      case 'list':
        await this.handleListModeKeys(key);
        break;
      case 'details':
        await this.handleDetailsModeKeys(key);
        break;
      case 'logs':
        await this.handleLogsModeKeys(key);
        break;
    }
  }

  private async handleListModeKeys(key: string): Promise<void> {
    const processes = this.processManager.getAllProcesses();

    switch (key) {
      case 'up':
      case 'k':
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
        this.render();
        break;

      case 'down':
      case 'j':
        this.selectedIndex = Math.min(processes.length - 1, this.selectedIndex + 1);
        this.render();
        break;

      case 'enter':
      case 'space':
        if (processes[this.selectedIndex]) {
          const process = processes[this.selectedIndex];
          if (process.status === ProcessStatus.STOPPED) {
            await this.startProcess(process.id);
          } else if (process.status === ProcessStatus.RUNNING) {
            await this.showProcessMenu(process);
          }
        }
        break;

      case 's':
        // Start selected process
        if (processes[this.selectedIndex]) {
          await this.startProcess(processes[this.selectedIndex].id);
        }
        break;

      case 'x':
        // Stop selected process
        if (processes[this.selectedIndex]) {
          await this.stopProcess(processes[this.selectedIndex].id);
        }
        break;

      case 'r':
        // Restart selected process
        if (processes[this.selectedIndex]) {
          await this.restartProcess(processes[this.selectedIndex].id);
        }
        break;

      case 'd':
        // Show details
        if (processes[this.selectedIndex]) {
          this.selectedProcess = processes[this.selectedIndex].id;
          this.viewMode = 'details';
          this.render();
        }
        break;

      case 'l':
        // Show logs
        if (processes[this.selectedIndex]) {
          this.selectedProcess = processes[this.selectedIndex].id;
          this.viewMode = 'logs';
          this.render();
        }
        break;

      case 'a':
        // Start all
        await this.startAll();
        break;

      case 'z':
        // Stop all
        await this.stopAll();
        break;

      case 'q':
        await this.handleExit();
        break;

      case 'h':
      case '?':
        this.showHelp();
        break;
    }
  }

  private async handleDetailsModeKeys(key: string): Promise<void> {
    switch (key) {
      case 'q':
      case 'escape':
        this.viewMode = 'list';
        this.render();
        break;

      case 'l':
        this.viewMode = 'logs';
        this.render();
        break;
    }
  }

  private async handleLogsModeKeys(key: string): Promise<void> {
    switch (key) {
      case 'q':
      case 'escape':
        this.viewMode = 'list';
        this.render();
        break;

      case 'd':
        this.viewMode = 'details';
        this.render();
        break;
    }
  }

  private render(): void {
    console.clear();

    switch (this.viewMode) {
      case 'list':
        this.renderListView();
        break;
      case 'details':
        this.renderDetailsView();
        break;
      case 'logs':
        this.renderLogsView();
        break;
    }
  }

  private renderListView(): void {
    const processes = this.processManager.getAllProcesses();
    const stats = this.processManager.getSystemStats();

    // Header
    console.log(colors.cyan.bold('🧠 Claude-Flow Process Manager'));
    console.log(colors.gray('─'.repeat(60)));
    
    // System stats
    console.log(colors.white('System Status:'), 
      colors.green(`${stats.runningProcesses}/${stats.totalProcesses} running`));
    
    if (stats.errorProcesses > 0) {
      console.log(colors.red(`⚠️  ${stats.errorProcesses} processes with errors`));
    }
    
    console.log();

    // Process list
    console.log(colors.white.bold('Processes:'));
    console.log(colors.gray('─'.repeat(60)));
    
    processes.forEach((process, index) => {
      const isSelected = index === this.selectedIndex;
      const prefix = isSelected ? colors.cyan('▶ ') : '  ';
      const status = this.getStatusDisplay(process.status);
      const name = isSelected ? colors.cyan.bold(process.name) : colors.white(process.name);
      
      console.log(`${prefix}${status} ${name}`);
      
      if (isSelected && process.metrics?.lastError) {
        console.log(colors.red(`     Error: ${process.metrics.lastError}`));
      }
    });

    // Footer
    console.log(colors.gray('─'.repeat(60)));
    console.log(colors.gray('Commands: [↑↓] Navigate [Enter] Toggle [a] Start All [z] Stop All'));
    console.log(colors.gray('[s] Start [x] Stop [r] Restart [d] Details [l] Logs [q] Quit [h] Help'));
  }

  private renderDetailsView(): void {
    if (!this.selectedProcess) return;
    
    const process = this.processManager.getProcess(this.selectedProcess);
    if (!process) return;

    console.log(colors.cyan.bold(`📋 Process Details: ${process.name}`));
    console.log(colors.gray('─'.repeat(60)));
    
    console.log(colors.white('ID:'), process.id);
    console.log(colors.white('Type:'), process.type);
    console.log(colors.white('Status:'), this.getStatusDisplay(process.status));
    
    if (process.pid) {
      console.log(colors.white('PID:'), process.pid);
    }
    
    if (process.startTime) {
      const uptime = Date.now() - process.startTime;
      console.log(colors.white('Uptime:'), this.formatUptime(uptime));
    }
    
    if (process.metrics) {
      console.log();
      console.log(colors.white.bold('Metrics:'));
      if (process.metrics.cpu !== undefined) {
        console.log(colors.white('CPU:'), `${process.metrics.cpu}%`);
      }
      if (process.metrics.memory !== undefined) {
        console.log(colors.white('Memory:'), `${process.metrics.memory} MB`);
      }
      if (process.metrics.restarts !== undefined) {
        console.log(colors.white('Restarts:'), process.metrics.restarts);
      }
    }
    
    if (process.config) {
      console.log();
      console.log(colors.white.bold('Configuration:'));
      console.log(JSON.stringify(process.config, null, 2));
    }

    console.log();
    console.log(colors.gray('─'.repeat(60)));
    console.log(colors.gray('[q] Back to list [l] View logs'));
  }

  private async renderLogsView(): Promise<void> {
    if (!this.selectedProcess) return;
    
    const process = this.processManager.getProcess(this.selectedProcess);
    if (!process) return;

    console.log(colors.cyan.bold(`📜 Process Logs: ${process.name}`));
    console.log(colors.gray('─'.repeat(60)));
    
    try {
      const logs = await this.processManager.getProcessLogs(this.selectedProcess, 30);
      logs.forEach(log => console.log(colors.gray(log)));
    } catch (error) {
      console.log(colors.red(`Error fetching logs: ${error.message}`));
    }

    console.log();
    console.log(colors.gray('─'.repeat(60)));
    console.log(colors.gray('[q] Back to list [d] View details'));
  }

  private getStatusDisplay(status: ProcessStatus): string {
    switch (status) {
      case ProcessStatus.RUNNING:
        return colors.green('●');
      case ProcessStatus.STOPPED:
        return colors.gray('○');
      case ProcessStatus.STARTING:
        return colors.yellow('◐');
      case ProcessStatus.STOPPING:
        return colors.yellow('◑');
      case ProcessStatus.ERROR:
        return colors.red('✗');
      case ProcessStatus.CRASHED:
        return colors.red('☠');
      default:
        return colors.gray('?');
    }
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private async showProcessMenu(process: ProcessInfo): Promise<void> {
    console.clear();
    console.log(colors.cyan.bold(`Process: ${process.name}`));
    console.log(colors.gray('─'.repeat(40)));
    console.log('[s] Stop');
    console.log('[r] Restart');
    console.log('[d] Details');
    console.log('[l] Logs');
    console.log('[q] Cancel');
    
    // Wait for single keypress
    const event = await keypress().next();
    if (event.value) {
      switch (event.value.key) {
        case 's':
          await this.stopProcess(process.id);
          break;
        case 'r':
          await this.restartProcess(process.id);
          break;
        case 'd':
          this.selectedProcess = process.id;
          this.viewMode = 'details';
          break;
        case 'l':
          this.selectedProcess = process.id;
          this.viewMode = 'logs';
          break;
      }
    }
    
    this.render();
  }

  private showHelp(): void {
    console.clear();
    console.log(colors.cyan.bold('🧠 Claude-Flow Process Manager - Help'));
    console.log(colors.gray('─'.repeat(60)));
    console.log();
    console.log(colors.white.bold('Navigation:'));
    console.log('  ↑/k     - Move up');
    console.log('  ↓/j     - Move down');
    console.log('  Enter   - Toggle process (start/stop)');
    console.log();
    console.log(colors.white.bold('Process Control:'));
    console.log('  s       - Start selected process');
    console.log('  x       - Stop selected process');
    console.log('  r       - Restart selected process');
    console.log('  a       - Start all processes');
    console.log('  z       - Stop all processes');
    console.log();
    console.log(colors.white.bold('Views:'));
    console.log('  d       - Show process details');
    console.log('  l       - Show process logs');
    console.log('  q/Esc   - Return to list view');
    console.log();
    console.log(colors.white.bold('Other:'));
    console.log('  h/?     - Show this help');
    console.log('  Ctrl+L  - Clear screen');
    console.log('  Ctrl+C  - Exit');
    console.log();
    console.log(colors.gray('Press any key to continue...'));
    
    // Wait for keypress
    keypress().next();
    this.render();
  }

  private showError(message: string): void {
    const savedView = this.viewMode;
    console.clear();
    console.log(colors.red.bold('❌ Error'));
    console.log(colors.red(message));
    console.log();
    console.log(colors.gray('Press any key to continue...'));
    
    // Restore view after keypress
    keypress().next().then(() => {
      this.viewMode = savedView;
      this.render();
    });
  }

  private async startProcess(processId: string): Promise<void> {
    try {
      await this.processManager.startProcess(processId);
    } catch (error) {
      this.showError(error.message);
    }
  }

  private async stopProcess(processId: string): Promise<void> {
    try {
      await this.processManager.stopProcess(processId);
    } catch (error) {
      this.showError(error.message);
    }
  }

  private async restartProcess(processId: string): Promise<void> {
    try {
      await this.processManager.restartProcess(processId);
    } catch (error) {
      this.showError(error.message);
    }
  }

  private async startAll(): Promise<void> {
    try {
      await this.processManager.startAll();
    } catch (error) {
      this.showError(error.message);
    }
  }

  private async stopAll(): Promise<void> {
    try {
      await this.processManager.stopAll();
    } catch (error) {
      this.showError(error.message);
    }
  }

  private async handleExit(): Promise<void> {
    const processes = this.processManager.getAllProcesses();
    const hasRunning = processes.some(p => p.status === ProcessStatus.RUNNING);
    
    if (hasRunning) {
      console.clear();
      console.log(colors.yellow('⚠️  Some processes are still running.'));
      console.log('Stop all processes before exiting? [y/N]');
      
      const event = await keypress().next();
      if (event.value && event.value.key.toLowerCase() === 'y') {
        await this.stopAll();
      }
    }
    
    await this.stop();
  }
}