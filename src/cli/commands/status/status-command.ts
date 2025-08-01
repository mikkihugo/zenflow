/**
 * Status Command Implementation
 * 
 * Shows swarm status, configuration, and active agents
 */

import { BaseCommand } from '../../core/base-command';
import type { CommandContext, CommandResult } from '../../types/index';

interface SwarmStatus {
  active: boolean;
  topology: string;
  agents: AgentInfo[];
  memory: MemoryInfo;
  performance: PerformanceMetrics;
}

interface AgentInfo {
  id: string;
  type: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  uptime: number;
  tasksCompleted: number;
  lastActivity: string;
}

interface MemoryInfo {
  provider: string;
  connected: boolean;
  size: string;
  entries: number;
}

interface PerformanceMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageResponseTime: number;
  currentLoad: number;
}

export class StatusCommand extends BaseCommand {
  constructor() {
    super({
      name: 'status',
      description: 'Show swarm status, configuration, and active agents',
      usage: 'claude-flow status [options]',
      category: 'core',
      minArgs: 0,
      maxArgs: 0,
      examples: [
        'claude-flow status',
        'claude-flow status --format json',
        'claude-flow status --detailed',
        'claude-flow status --watch'
      ],
      flags: {
        format: {
          type: 'string',
          description: 'Output format (table, json, yaml)',
          default: 'table'
        },
        detailed: {
          type: 'boolean',
          description: 'Show detailed status information',
          default: false
        },
        watch: {
          type: 'boolean',
          description: 'Watch status changes in real-time',
          default: false
        },
        'show-config': {
          type: 'boolean',
          description: 'Include configuration in output',
          default: false
        },
        'show-memory': {
          type: 'boolean',
          description: 'Include memory statistics',
          default: false
        }
      }
    });
  }

  protected async run(context: CommandContext): Promise<CommandResult> {
    try {
      const format = context.flags.format as string || 'table';
      const detailed = context.flags.detailed as boolean || false;
      const watch = context.flags.watch as boolean || false;
      const showConfig = context.flags['show-config'] as boolean || false;
      const showMemory = context.flags['show-memory'] as boolean || false;

      if (watch) {
        return await this.watchStatus(format, detailed, showConfig, showMemory);
      }

      const status = await this.getSwarmStatus(detailed, showConfig, showMemory);
      const output = this.formatOutput(status, format);

      return {
        success: true,
        exitCode: 0,
        message: output,
        data: status
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get status: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 1
      };
    }
  }

  private async getSwarmStatus(detailed: boolean, showConfig: boolean, showMemory: boolean): Promise<any> {
    // This would integrate with the actual swarm system
    // For now, we'll return mock data to demonstrate the structure
    
    const baseStatus = {
      swarm: {
        active: true,
        topology: 'mesh',
        agents: [
          {
            id: 'agent-001',
            type: 'researcher',
            status: 'active' as const,
            uptime: 1800000, // 30 minutes in ms
            tasksCompleted: 15,
            lastActivity: new Date(Date.now() - 30000).toISOString()
          },
          {
            id: 'agent-002',
            type: 'analyst',
            status: 'idle' as const,
            uptime: 1680000, // 28 minutes in ms
            tasksCompleted: 8,
            lastActivity: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: 'agent-003',
            type: 'coder',
            status: 'busy' as const,
            uptime: 900000, // 15 minutes in ms
            tasksCompleted: 22,
            lastActivity: new Date(Date.now() - 5000).toISOString()
          }
        ],
        performance: {
          totalTasks: 67,
          completedTasks: 45,
          failedTasks: 2,
          averageResponseTime: 1250,
          currentLoad: 0.65
        }
      },
      system: {
        version: '2.0.0',
        uptime: Date.now() - 2100000, // 35 minutes ago
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memoryUsage: process.memoryUsage()
      }
    };

    if (showMemory) {
      baseStatus.memory = {
        provider: 'sqlite',
        connected: true,
        size: '2.4 MB',
        entries: 156,
        connections: 3,
        queries: 1247
      };
    }

    if (showConfig) {
      baseStatus.configuration = {
        swarm: {
          topology: 'mesh',
          maxAgents: 8,
          strategy: 'balanced'
        },
        neural: {
          enabled: true,
          models: ['claude-3-haiku', 'claude-3-sonnet'],
          defaultModel: 'claude-3-haiku'
        },
        memory: {
          provider: 'sqlite',
          persistent: true,
          maxSize: '100MB'
        }
      };
    }

    if (detailed) {
      // Add detailed information for each agent
      baseStatus.swarm.agents = baseStatus.swarm.agents.map(agent => ({
        ...agent,
        memory: {
          heap: Math.floor(Math.random() * 50) + 10,
          external: Math.floor(Math.random() * 20) + 5
        },
        cpu: Math.floor(Math.random() * 30) + 5,
        tasks: {
          queued: Math.floor(Math.random() * 5),
          running: agent.status === 'busy' ? 1 : 0,
          completed: agent.tasksCompleted
        }
      }));
    }

    return baseStatus;
  }

  private formatOutput(status: any, format: string): string {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(status, null, 2);
      
      case 'yaml':
        return this.toYaml(status);
      
      case 'table':
      default:
        return this.formatAsTable(status);
    }
  }

  private formatAsTable(status: any): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Claude Flow Status');
    lines.push('='.repeat(50));
    lines.push('');

    // System information
    lines.push('System:');
    lines.push(`  Version: ${status.system.version}`);
    lines.push(`  Uptime: ${this.formatDuration(Date.now() - status.system.uptime)}`);
    lines.push(`  Platform: ${status.system.platform} (${status.system.arch})`);
    lines.push(`  Node.js: ${status.system.nodeVersion}`);
    lines.push(`  Memory: ${Math.round(status.system.memoryUsage.heapUsed / 1024 / 1024)}MB`);
    lines.push('');

    // Swarm information
    lines.push('Swarm:');
    lines.push(`  Status: ${status.swarm.active ? '🟢 Active' : '🔴 Inactive'}`);
    lines.push(`  Topology: ${status.swarm.topology}`);
    lines.push(`  Agents: ${status.swarm.agents.length} active`);
    lines.push('');

    // Performance metrics
    const perf = status.swarm.performance;
    lines.push('Performance:');
    lines.push(`  Total Tasks: ${perf.totalTasks}`);
    lines.push(`  Completed: ${perf.completedTasks} (${Math.round(perf.completedTasks / perf.totalTasks * 100)}%)`);
    lines.push(`  Failed: ${perf.failedTasks}`);
    lines.push(`  Avg Response: ${perf.averageResponseTime}ms`);
    lines.push(`  Current Load: ${Math.round(perf.currentLoad * 100)}%`);
    lines.push('');

    // Agents table
    lines.push('Active Agents:');
    lines.push('┌────────────┬────────────┬─────────┬─────────┬─────────────┬──────────────┐');
    lines.push('│ Agent ID   │ Type       │ Status  │ Tasks   │ Uptime      │ Last Active  │');
    lines.push('├────────────┼────────────┼─────────┼─────────┼─────────────┼──────────────┤');
    
    for (const agent of status.swarm.agents) {
      const statusEmoji = {
        active: '🟢',
        idle: '🟡',
        busy: '🔵',
        error: '🔴'
      }[agent.status] || '⚪';
      
      const id = agent.id.padEnd(10);
      const type = agent.type.padEnd(10);
      const statusText = `${statusEmoji} ${agent.status}`.padEnd(7);
      const tasks = agent.tasksCompleted.toString().padEnd(7);
      const uptime = this.formatDuration(agent.uptime).padEnd(11);
      const lastActive = this.formatTime(agent.lastActivity).padEnd(12);
      
      lines.push(`│ ${id} │ ${type} │ ${statusText} │ ${tasks} │ ${uptime} │ ${lastActive} │`);
    }
    
    lines.push('└────────────┴────────────┴─────────┴─────────┴─────────────┴──────────────┘');

    // Memory information (if requested)
    if (status.memory) {
      lines.push('');
      lines.push('Memory:');
      lines.push(`  Provider: ${status.memory.provider}`);
      lines.push(`  Status: ${status.memory.connected ? '🟢 Connected' : '🔴 Disconnected'}`);
      lines.push(`  Size: ${status.memory.size}`);
      lines.push(`  Entries: ${status.memory.entries}`);
    }

    // Configuration (if requested)
    if (status.configuration) {
      lines.push('');
      lines.push('Configuration:');
      lines.push(`  Swarm Topology: ${status.configuration.swarm.topology}`);
      lines.push(`  Max Agents: ${status.configuration.swarm.maxAgents}`);
      lines.push(`  Neural Models: ${status.configuration.neural.models.join(', ')}`);
      lines.push(`  Memory Provider: ${status.configuration.memory.provider}`);
    }

    return lines.join('\n');
  }

  private async watchStatus(format: string, detailed: boolean, showConfig: boolean, showMemory: boolean): Promise<CommandResult> {
    console.log('Watching status (Press Ctrl+C to exit)...\n');

    const updateInterval = 2000; // 2 seconds
    let running = true;

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      running = false;
      console.log('\nStatus watching stopped.');
      process.exit(0);
    });

    while (running) {
      // Clear console
      process.stdout.write('\x1B[2J\x1B[0f');
      
      try {
        const status = await this.getSwarmStatus(detailed, showConfig, showMemory);
        const output = this.formatOutput(status, format);
        
        console.log(output);
        console.log(`\nLast updated: ${new Date().toLocaleTimeString()}`);
        
        await new Promise(resolve => setTimeout(resolve, updateInterval));
      } catch (error) {
        console.error(`Error updating status: ${error instanceof Error ? error.message : String(error)}`);
        await new Promise(resolve => setTimeout(resolve, updateInterval));
      }
    }

    return {
      success: true,
      exitCode: 0,
      message: 'Status watching completed'
    };
  }

  private toYaml(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    let result = '';
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result += `${spaces}${key}:\n`;
        result += this.toYaml(value, indent + 1);
      } else if (Array.isArray(value)) {
        result += `${spaces}${key}:\n`;
        for (const item of value) {
          if (typeof item === 'object') {
            result += `${spaces}  -\n`;
            result += this.toYaml(item, indent + 2);
          } else {
            result += `${spaces}  - ${item}\n`;
          }
        }
      } else {
        result += `${spaces}${key}: ${value}\n`;
      }
    }
    
    return result;
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  private formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else {
      return date.toLocaleTimeString();
    }
  }

  getHelp(): string {
    return `Show swarm status, configuration, and active agents

USAGE:
  claude-flow status [options]

OPTIONS:
  --format <format>     Output format (table, json, yaml) [default: table]
  --detailed           Show detailed status information
  --watch              Watch status changes in real-time
  --show-config        Include configuration in output
  --show-memory        Include memory statistics
  -h, --help           Show help

EXAMPLES:
  claude-flow status
  claude-flow status --format json
  claude-flow status --detailed
  claude-flow status --watch
  claude-flow status --show-config --show-memory

The status command shows:
- System information (version, uptime, platform)
- Swarm status and topology
- Active agents and their status
- Performance metrics
- Memory usage (with --show-memory)
- Configuration (with --show-config)

Use --watch to monitor status changes in real-time.
Use --detailed for comprehensive agent information.
`;
  }
}