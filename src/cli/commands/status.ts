/**
 * Status command for Claude-Flow
 */

import { Command } from '@cliffy/command';
import { colors } from '@cliffy/ansi/colors';
import { Table } from '@cliffy/table';
import { formatHealthStatus, formatDuration, formatStatusIndicator } from '../formatter.js';

export const statusCommand = new Command()
  .description('Show Claude-Flow system status')
  .option('-w, --watch', 'Watch mode - continuously update status')
  .option('-i, --interval <seconds:number>', 'Update interval in seconds', { default: 5 })
  .option('-c, --component <name:string>', 'Show status for specific component')
  .option('--json', 'Output in JSON format')
  .action(async (options: any) => {
    if (options.watch) {
      await watchStatus(options);
    } else {
      await showStatus(options);
    }
  });

async function showStatus(options: any): Promise<void> {
  try {
    // In a real implementation, this would connect to the running orchestrator
    const status = await getSystemStatus();
    
    if (options.json) {
      console.log(JSON.stringify(status, null, 2));
      return;
    }

    if (options.component) {
      showComponentStatus(status, options.component);
    } else {
      showFullStatus(status);
    }
  } catch (error) {
    if ((error as Error).message.includes('ECONNREFUSED') || (error as Error).message.includes('connection refused')) {
      console.error(colors.red('✗ Claude-Flow is not running'));
      console.log(colors.gray('Start it with: claude-flow start'));
    } else {
      console.error(colors.red('Error getting status:'), (error as Error).message);
    }
  }
}

async function watchStatus(options: any): Promise<void> {
  const interval = options.interval * 1000;
  
  console.log(colors.cyan('Watching Claude-Flow status...'));
  console.log(colors.gray(`Update interval: ${options.interval}s`));
  console.log(colors.gray('Press Ctrl+C to stop\n'));

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // Clear screen and show status
    console.clear();
    console.log(colors.cyan.bold('Claude-Flow Status Monitor'));
    console.log(colors.gray(`Last updated: ${new Date().toLocaleTimeString()}\n`));
    
    try {
      await showStatus({ ...options, json: false });
    } catch (error) {
      console.error(colors.red('Status update failed:'), (error as Error).message);
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

function showFullStatus(status: any): void {
  // System overview
  console.log(colors.cyan.bold('System Overview'));
  console.log('─'.repeat(50));
  
  const statusIcon = formatStatusIndicator(status.overall);
  console.log(`${statusIcon} Overall Status: ${getStatusColor(status.overall)(status.overall.toUpperCase())}`);
  console.log(`${colors.white('Uptime:')} ${formatDuration(status.uptime)}`);
  console.log(`${colors.white('Version:')} ${status.version}`);
  console.log(`${colors.white('Started:')} ${new Date(status.startTime).toLocaleString()}`);
  console.log();

  // Components status
  console.log(colors.cyan.bold('Components'));
  console.log('─'.repeat(50));
  
  const componentTable = new Table()
    .header(['Component', 'Status', 'Uptime', 'Details'])
    .border(true);

  for (const [name, component] of Object.entries(status.components)) {
    const comp = component as any;
    const statusIcon = formatStatusIndicator(comp.status);
    const statusText = getStatusColor(comp.status)(comp.status.toUpperCase());
    
    componentTable.push([
      colors.white(name),
      `${statusIcon} ${statusText}`,
      formatDuration(comp.uptime || 0),
      comp.details || '-'
    ]);
  }
  
  componentTable.render();
  console.log();

  // Resource usage
  if (status.resources) {
    console.log(colors.cyan.bold('Resource Usage'));
    console.log('─'.repeat(50));
    
    const resourceTable = new Table()
      .header(['Resource', 'Used', 'Total', 'Percentage'])
      .border(true);

    for (const [name, resource] of Object.entries(status.resources)) {
      const res = resource as any;
      const percentage = ((res.used / res.total) * 100).toFixed(1);
      const color = getResourceColor(parseFloat(percentage));
      
      resourceTable.push([
        colors.white(name),
        res.used.toString(),
        res.total.toString(),
        color(`${percentage}%`)
      ]);
    }
    
    resourceTable.render();
    console.log();
  }

  // Active agents
  if (status.agents) {
    console.log(colors.cyan.bold(`Active Agents (${status.agents.length})`));
    console.log('─'.repeat(50));
    
    if (status.agents.length > 0) {
      const agentTable = new Table()
        .header(['ID', 'Name', 'Type', 'Status', 'Tasks'])
        .border(true);

      for (const agent of status.agents) {
        const statusIcon = formatStatusIndicator(agent.status);
        const statusText = getStatusColor(agent.status)(agent.status);
        
        agentTable.push([
          colors.gray(agent.id.substring(0, 8) + '...'),
          colors.white(agent.name),
          colors.cyan(agent.type),
          `${statusIcon} ${statusText}`,
          agent.activeTasks.toString()
        ]);
      }
      
      agentTable.render();
    } else {
      console.log(colors.gray('No active agents'));
    }
    console.log();
  }

  // Recent tasks
  if (status.recentTasks) {
    console.log(colors.cyan.bold(`Recent Tasks (${status.recentTasks.length})`));
    console.log('─'.repeat(50));
    
    if (status.recentTasks.length > 0) {
      const taskTable = new Table()
        .header(['ID', 'Type', 'Status', 'Agent', 'Duration'])
        .border(true);

      for (const task of status.recentTasks.slice(0, 10)) { // Show last 10
        const statusIcon = formatStatusIndicator(task.status);
        const statusText = getStatusColor(task.status)(task.status);
        
        taskTable.push([
          colors.gray(task.id.substring(0, 8) + '...'),
          colors.white(task.type),
          `${statusIcon} ${statusText}`,
          task.agent ? colors.cyan(task.agent.substring(0, 12) + '...') : '-',
          task.duration ? formatDuration(task.duration) : '-'
        ]);
      }
      
      taskTable.render();
    } else {
      console.log(colors.gray('No recent tasks'));
    }
  }
}

function showComponentStatus(status: any, componentName: string): void {
  const component = status.components[componentName];
  
  if (!component) {
    console.error(colors.red(`Component '${componentName}' not found`));
    console.log(colors.gray('Available components:'), Object.keys(status.components).join(', '));
    return;
  }

  console.log(colors.cyan.bold(`${componentName} Status`));
  console.log('─'.repeat(30));
  
  const statusIcon = formatStatusIndicator(component.status);
  console.log(`${statusIcon} Status: ${getStatusColor(component.status)(component.status.toUpperCase())}`);
  
  if (component.uptime) {
    console.log(`${colors.white('Uptime:')} ${formatDuration(component.uptime)}`);
  }
  
  if (component.details) {
    console.log(`${colors.white('Details:')} ${component.details}`);
  }
  
  if (component.metrics) {
    console.log('\n' + colors.cyan.bold('Metrics'));
    console.log('─'.repeat(20));
    
    for (const [metric, value] of Object.entries(component.metrics)) {
      console.log(`${colors.white(metric + ':')} ${value}`);
    }
  }
  
  if (component.errors && component.errors.length > 0) {
    console.log('\n' + colors.red.bold('Recent Errors'));
    console.log('─'.repeat(20));
    
    for (const error of component.errors.slice(0, 5)) {
      console.log(colors.red(`• ${error.message}`));
      console.log(colors.gray(`  ${new Date(error.timestamp).toLocaleString()}`));
    }
  }
}

async function getSystemStatus(): Promise<any> {
  // Mock status for now - in production, this would call the orchestrator API
  return {
    overall: 'healthy',
    version: '1.0.49',
    uptime: Date.now() - (Date.now() - 3600000), // 1 hour ago
    startTime: new Date(Date.now() - 3600000),
    components: {
      orchestrator: {
        status: 'healthy',
        uptime: 3600000,
        details: 'Managing 3 agents'
      },
      terminal: {
        status: 'healthy',
        uptime: 3600000,
        details: 'Pool: 2/5 active sessions'
      },
      memory: {
        status: 'healthy',
        uptime: 3600000,
        details: 'SQLite + 95MB cache'
      },
      coordination: {
        status: 'healthy',
        uptime: 3600000,
        details: '12 active tasks'
      },
      mcp: {
        status: 'healthy',
        uptime: 3600000,
        details: 'Listening on stdio'
      }
    },
    resources: {
      'Memory (MB)': { used: 256, total: 1024 },
      'CPU (%)': { used: 15, total: 100 },
      'Agents': { used: 3, total: 10 },
      'Tasks': { used: 12, total: 100 }
    },
    agents: [
      {
        id: 'agent-001',
        name: 'Coordinator Agent',
        type: 'coordinator',
        status: 'active',
        activeTasks: 2
      },
      {
        id: 'agent-002',
        name: 'Research Agent',
        type: 'researcher',
        status: 'active',
        activeTasks: 5
      },
      {
        id: 'agent-003',
        name: 'Implementation Agent',
        type: 'implementer',
        status: 'idle',
        activeTasks: 0
      }
    ],
    recentTasks: [
      {
        id: 'task-001',
        type: 'research',
        status: 'completed',
        agent: 'agent-002',
        duration: 45000
      },
      {
        id: 'task-002',
        type: 'coordination',
        status: 'running',
        agent: 'agent-001',
        duration: null
      }
    ]
  };
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'healthy':
    case 'active':
    case 'completed':
      return colors.green;
    case 'degraded':
    case 'warning':
    case 'idle':
      return colors.yellow;
    case 'unhealthy':
    case 'error':
    case 'failed':
      return colors.red;
    case 'running':
      return colors.cyan;
    default:
      return colors.white;
  }
}

function getResourceColor(percentage: number) {
  if (percentage >= 90) return colors.red;
  if (percentage >= 75) return colors.yellow;
  return colors.green;
}