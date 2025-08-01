/**
 * Swarm List Command Implementation
 * 
 * Lists all swarms with their status and information
 */

import { BaseCommand } from '../../core/base-command';
import type { CommandContext, CommandResult } from '../../types/index';

interface SwarmInfo {
  id: string;
  status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
  topology: string;
  agents: number;
  maxAgents: number;
  createdAt: Date;
  uptime?: number;
  port?: number;
  tasks: {
    total: number;
    completed: number;
    failed: number;
    active: number;
  };
  memory: {
    usage: string;
    entries: number;
  };
}

export class SwarmListCommand extends BaseCommand {
  constructor() {
    super({
      name: 'list',
      description: 'List all swarms with their status and information',
      usage: 'claude-flow swarm list [options]',
      category: 'swarm',
      minArgs: 0,
      maxArgs: 0,
      examples: [
        'claude-flow swarm list',
        'claude-flow swarm list --format json',
        'claude-flow swarm list --status running',
        'claude-flow swarm list --detailed'
      ],
      flags: {
        format: {
          type: 'string',
          description: 'Output format (table, json, yaml)',
          default: 'table'
        },
        status: {
          type: 'string',
          description: 'Filter by status (running, stopped, error, starting, stopping)'
        },
        detailed: {
          type: 'boolean', 
          description: 'Show detailed information',
          default: false
        },
        'show-history': {
          type: 'boolean',
          description: 'Include stopped swarms in results',
          default: false
        },
        sort: {
          type: 'string',
          description: 'Sort by field (created, status, agents, tasks)',
          default: 'created'
        },
        limit: {
          type: 'number',
          description: 'Limit number of results'
        }
      }
    });
  }

  protected async run(context: CommandContext): Promise<CommandResult> {
    try {
      const format = context.flags.format as string || 'table';
      const statusFilter = context.flags.status as string;
      const detailed = context.flags.detailed as boolean || false;
      const showHistory = context.flags['show-history'] as boolean || false;
      const sortBy = context.flags.sort as string || 'created';
      const limit = context.flags.limit as number;

      // Get swarm list
      let swarms = await this.getSwarms(showHistory);

      // Apply filters
      if (statusFilter) {
        swarms = swarms.filter(swarm => swarm.status === statusFilter);
      }

      // Apply sorting
      swarms = this.sortSwarms(swarms, sortBy);

      // Apply limit
      if (limit && limit > 0) {
        swarms = swarms.slice(0, limit);
      }

      // Format output
      const output = this.formatOutput(swarms, format, detailed);

      return {
        success: true,
        exitCode: 0,
        message: output,
        data: {
          swarms,
          count: swarms.length,
          filter: statusFilter,
          showHistory
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to list swarms: ${error instanceof Error ? error.message : String(error)}`,
        exitCode: 1
      };
    }
  }

  private async getSwarms(includeHistory: boolean): Promise<SwarmInfo[]> {
    // This would query the actual swarm registry
    // For now, return mock data
    const mockSwarms: SwarmInfo[] = [
      {
        id: 'swarm_1704067200_abc123def',
        status: 'running',
        topology: 'mesh',
        agents: 5,
        maxAgents: 8,
        createdAt: new Date(Date.now() - 600000), // 10 minutes ago
        uptime: 600000,
        port: 3000,
        tasks: {
          total: 45,
          completed: 38,
          failed: 2,
          active: 5
        },
        memory: {
          usage: '1.2 MB',
          entries: 234
        }
      },
      {
        id: 'swarm_1704063600_xyz789ghi',
        status: 'running',
        topology: 'hierarchical',
        agents: 3,
        maxAgents: 5,
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        uptime: 1800000,
        port: 3001,
        tasks: {
          total: 23,
          completed: 21,
          failed: 0,
          active: 2
        },
        memory: {
          usage: '856 KB',
          entries: 145
        }
      },
      {
        id: 'swarm_1704060000_def456jkl',
        status: 'starting',
        topology: 'star',
        agents: 1,
        maxAgents: 6,
        createdAt: new Date(Date.now() - 30000), // 30 seconds ago
        port: 3002,
        tasks: {
          total: 0,
          completed: 0,
          failed: 0,
          active: 0
        },
        memory: {
          usage: '124 KB',
          entries: 12
        }
      }
    ];

    if (includeHistory) {
      // Add some stopped swarms
      mockSwarms.push(
        {
          id: 'swarm_1704000000_old123abc',
          status: 'stopped',
          topology: 'mesh',
          agents: 0,
          maxAgents: 4,
          createdAt: new Date(Date.now() - 7200000), // 2 hours ago
          tasks: {
            total: 156,
            completed: 152,
            failed: 4,
            active: 0
          },
          memory: {
            usage: '2.8 MB',
            entries: 567
          }
        },
        {
          id: 'swarm_1703996400_err789xyz',
          status: 'error',
          topology: 'ring',
          agents: 0,
          maxAgents: 3,
          createdAt: new Date(Date.now() - 8100000), // 2.25 hours ago
          tasks: {
            total: 12,
            completed: 8,
            failed: 4,
            active: 0
          },
          memory: {
            usage: '445 KB',
            entries: 89
          }
        }
      );
    }

    return mockSwarms;
  }

  private sortSwarms(swarms: SwarmInfo[], sortBy: string): SwarmInfo[] {
    return [...swarms].sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime(); // Newest first
        case 'status':
          return a.status.localeCompare(b.status);
        case 'agents':
          return b.agents - a.agents; // Most agents first
        case 'tasks':
          return b.tasks.total - a.tasks.total; // Most tasks first
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });
  }

  private formatOutput(swarms: SwarmInfo[], format: string, detailed: boolean): string {
    if (swarms.length === 0) {
      return 'No swarms found';
    }

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(swarms, null, 2);
      
      case 'yaml':
        return this.toYaml(swarms);
      
      case 'table':
      default:
        return this.formatAsTable(swarms, detailed);
    }
  }

  private formatAsTable(swarms: SwarmInfo[], detailed: boolean): string {
    const lines: string[] = [];
    
    // Header
    lines.push('Swarm List');
    lines.push('='.repeat(80));
    lines.push('');

    if (detailed) {
      // Detailed view - one swarm per section
      for (const swarm of swarms) {
        lines.push(`Swarm: ${swarm.id}`);
        lines.push(`  Status: ${this.getStatusIcon(swarm.status)} ${swarm.status.toUpperCase()}`);
        lines.push(`  Topology: ${swarm.topology}`);
        lines.push(`  Agents: ${swarm.agents}/${swarm.maxAgents}`);
        lines.push(`  Created: ${swarm.createdAt.toLocaleString()}`);
        
        if (swarm.uptime) {
          lines.push(`  Uptime: ${this.formatDuration(swarm.uptime)}`);
        }
        
        if (swarm.port) {
          lines.push(`  Port: ${swarm.port}`);
        }
        
        lines.push(`  Tasks: ${swarm.tasks.total} total, ${swarm.tasks.completed} completed, ${swarm.tasks.failed} failed, ${swarm.tasks.active} active`);
        lines.push(`  Memory: ${swarm.memory.usage} (${swarm.memory.entries} entries)`);
        lines.push('');
      }
    } else {
      // Table view
      lines.push('┌─────────────────────────────┬─────────────┬─────────────┬───────────┬──────────┬─────────────┐');
      lines.push('│ Swarm ID                    │ Status      │ Topology    │ Agents    │ Tasks    │ Created     │');
      lines.push('├─────────────────────────────┼─────────────┼─────────────┼───────────┼──────────┼─────────────┤');
      
      for (const swarm of swarms) {
        const id = swarm.id.length > 27 ? swarm.id.substring(0, 24) + '...' : swarm.id.padEnd(27);
        const status = `${this.getStatusIcon(swarm.status)} ${swarm.status}`.padEnd(11);
        const topology = swarm.topology.padEnd(11);
        const agents = `${swarm.agents}/${swarm.maxAgents}`.padEnd(9);
        const tasks = `${swarm.tasks.completed}/${swarm.tasks.total}`.padEnd(8);
        const created = this.formatRelativeTime(swarm.createdAt).padEnd(11);
        
        lines.push(`│ ${id} │ ${status} │ ${topology} │ ${agents} │ ${tasks} │ ${created} │`);
      }
      
      lines.push('└─────────────────────────────┴─────────────┴─────────────┴───────────┴──────────┴─────────────┘');
    }

    // Summary
    const runningCount = swarms.filter(s => s.status === 'running').length;
    const stoppedCount = swarms.filter(s => s.status === 'stopped').length;
    const errorCount = swarms.filter(s => s.status === 'error').length;
    const otherCount = swarms.length - runningCount - stoppedCount - errorCount;

    lines.push('');
    lines.push('Summary:');
    lines.push(`  Total: ${swarms.length} swarms`);
    lines.push(`  Running: ${runningCount}`);
    if (stoppedCount > 0) lines.push(`  Stopped: ${stoppedCount}`);
    if (errorCount > 0) lines.push(`  Error: ${errorCount}`);
    if (otherCount > 0) lines.push(`  Other: ${otherCount}`);

    return lines.join('\n');
  }

  private getStatusIcon(status: string): string {
    const icons = {
      running: '🟢',
      stopped: '⚪',
      error: '🔴',
      starting: '🟡',
      stopping: '🟠'
    };
    return icons[status as keyof typeof icons] || '⚫';
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

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) { // Less than 24 hours
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  private toYaml(swarms: SwarmInfo[]): string {
    let result = 'swarms:\n';
    
    for (const swarm of swarms) {
      result += `  - id: ${swarm.id}\n`;
      result += `    status: ${swarm.status}\n`;
      result += `    topology: ${swarm.topology}\n`;
      result += `    agents: ${swarm.agents}\n`;
      result += `    maxAgents: ${swarm.maxAgents}\n`;
      result += `    createdAt: ${swarm.createdAt.toISOString()}\n`;
      
      if (swarm.uptime) {
        result += `    uptime: ${swarm.uptime}\n`;
      }
      
      if (swarm.port) {
        result += `    port: ${swarm.port}\n`;
      }
      
      result += `    tasks:\n`;
      result += `      total: ${swarm.tasks.total}\n`;
      result += `      completed: ${swarm.tasks.completed}\n`;
      result += `      failed: ${swarm.tasks.failed}\n`;
      result += `      active: ${swarm.tasks.active}\n`;
      
      result += `    memory:\n`;
      result += `      usage: ${swarm.memory.usage}\n`;
      result += `      entries: ${swarm.memory.entries}\n`;
    }
    
    return result;
  }

  getHelp(): string {
    return `List all swarms with their status and information

USAGE:
  claude-flow swarm list [options]

OPTIONS:
  --format <format>     Output format (table, json, yaml) [default: table]
  --status <status>     Filter by status (running, stopped, error, starting, stopping)
  --detailed           Show detailed information for each swarm
  --show-history       Include stopped swarms in results
  --sort <field>        Sort by field (created, status, agents, tasks) [default: created]
  --limit <number>      Limit number of results
  -h, --help           Show help

EXAMPLES:
  claude-flow swarm list
  claude-flow swarm list --format json
  claude-flow swarm list --status running
  claude-flow swarm list --detailed
  claude-flow swarm list --show-history --sort agents
  claude-flow swarm list --limit 5

STATUSES:
  🟢 running     Swarm is active and processing tasks
  🟡 starting    Swarm is initializing
  🟠 stopping    Swarm is shutting down gracefully
  ⚪ stopped     Swarm has been stopped
  🔴 error       Swarm encountered an error

SORT OPTIONS:
  created        Sort by creation time (newest first)
  status         Sort alphabetically by status
  agents         Sort by number of agents (most first)
  tasks          Sort by total tasks (most first)

The list command shows all swarms by default. Use --show-history to include
stopped swarms, or --status to filter by specific status.

Use --detailed for comprehensive information about each swarm.
Use --format json or --format yaml for programmatic consumption.
`;
  }
}