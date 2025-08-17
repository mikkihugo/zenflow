<script lang="ts">
  import { onMount } from 'svelte';
  
  // Simulated real-time data (would connect to existing WebSocket)
  let systemStatus = {
    health: 'healthy',
    uptime: 0,
    memoryUsage: 0,
    version: '2.0.0-alpha.44'
  };
  
  let swarms = [
    { id: 1, name: 'Document Processing', agents: 4, status: 'active' },
    { id: 2, name: 'Feature Development', agents: 6, status: 'active' },
    { id: 3, name: 'Code Analysis', agents: 2, status: 'warning' }
  ];
  
  let performance = {
    cpu: 23.5,
    memory: 67.2,
    requestsPerMin: 127,
    avgResponse: 45
  };
  
  let recentTasks = [
    { id: 1, title: 'Process PRD: User Auth', progress: 75, status: 'active' },
    { id: 2, title: 'Generate ADR: Database', progress: 0, status: 'pending' },
    { id: 3, title: 'Code Review: API', progress: 50, status: 'active' }
  ];
  
  // Simulate real-time updates
  onMount(() => {
    const interval = setInterval(() => {
      systemStatus.uptime += 1;
      systemStatus.memoryUsage = Math.random() * 1000 + 500; // 500-1500 MB
      performance.cpu = Math.random() * 40 + 10; // 10-50%
      performance.memory = Math.random() * 30 + 50; // 50-80%
      performance.requestsPerMin = Math.floor(Math.random() * 50 + 100); // 100-150
      performance.avgResponse = Math.floor(Math.random() * 20 + 30); // 30-50ms
      
      // Trigger reactivity
      systemStatus = systemStatus;
      performance = performance;
    }, 2000);
    
    return () => clearInterval(interval);
  });
  
  function formatUptime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }
  
  function formatBytes(bytes: number): string {
    return `${Math.round(bytes)}MB`;
  }
  
  function getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'inactive';
    }
  }
</script>

<svelte:head>
  <title>Claude Code Zen - Dashboard</title>
</svelte:head>

<div class="dashboard">
  <div class="dashboard-header">
    <h1>Dashboard Overview</h1>
    <p class="text-secondary">Real-time system monitoring and swarm management</p>
  </div>

  <!-- System Status Grid -->
  <div class="grid grid-auto mb-5">
    <!-- System Health Card -->
    <div class="card">
      <h3>⚡ System Status</h3>
      <div class="metrics">
        <div class="metric">
          <span class="metric-label">System Health</span>
          <span class="metric-value flex items-center gap-2">
            <span class="status-dot {getStatusColor(systemStatus.health)}"></span>
            {systemStatus.health}
          </span>
        </div>
        <div class="metric">
          <span class="metric-label">Uptime</span>
          <span class="metric-value">{formatUptime(systemStatus.uptime)}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Memory Usage</span>
          <span class="metric-value">{formatBytes(systemStatus.memoryUsage)}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Version</span>
          <span class="metric-value">{systemStatus.version}</span>
        </div>
      </div>
    </div>

    <!-- Active Swarms Card -->
    <div class="card">
      <h3>🐝 Active Swarms</h3>
      <div class="swarms-list">
        {#each swarms as swarm}
          <div class="metric">
            <span class="metric-label flex items-center gap-2">
              <span class="status-dot {getStatusColor(swarm.status)}"></span>
              {swarm.name}
            </span>
            <span class="metric-value">{swarm.agents} agents</span>
          </div>
        {/each}
      </div>
      <div class="mt-3">
        <button class="btn primary">🚀 Initialize New Swarm</button>
      </div>
    </div>

    <!-- Performance Metrics Card -->
    <div class="card">
      <h3>📊 Performance</h3>
      <div class="performance-metrics">
        <div class="metric-item mb-3">
          <div class="flex justify-between items-center mb-1">
            <span class="metric-label">CPU Usage</span>
            <span class="metric-value">{performance.cpu.toFixed(1)}%</span>
          </div>
          <div class="progress">
            <div class="progress-fill" style="width: {performance.cpu}%"></div>
          </div>
        </div>
        
        <div class="metric-item mb-3">
          <div class="flex justify-between items-center mb-1">
            <span class="metric-label">Memory Usage</span>
            <span class="metric-value">{performance.memory.toFixed(1)}%</span>
          </div>
          <div class="progress">
            <div class="progress-fill {performance.memory > 80 ? 'warning' : performance.memory > 90 ? 'error' : 'success'}" 
                 style="width: {performance.memory}%"></div>
          </div>
        </div>
        
        <div class="metric">
          <span class="metric-label">Requests/min</span>
          <span class="metric-value">{performance.requestsPerMin}</span>
        </div>
        <div class="metric">
          <span class="metric-label">Avg Response</span>
          <span class="metric-value">{performance.avgResponse}ms</span>
        </div>
      </div>
    </div>

    <!-- Recent Tasks Card -->
    <div class="card">
      <h3>✅ Recent Tasks</h3>
      <div class="tasks-list">
        {#each recentTasks as task}
          <div class="task-item mb-3">
            <div class="flex justify-between items-center mb-1">
              <span class="metric-label">{task.title}</span>
              <span class="metric-value">{task.progress}%</span>
            </div>
            <div class="progress">
              <div class="progress-fill {task.status === 'active' ? 'success' : 'inactive'}" 
                   style="width: {task.progress}%"></div>
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span class="status-dot {getStatusColor(task.status)}"></span>
              <span class="text-muted" style="font-size: 0.75rem; text-transform: capitalize;">
                {task.status}
              </span>
            </div>
          </div>
        {/each}
      </div>
      <div class="mt-3">
        <button class="btn">📋 View All Tasks</button>
      </div>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="card">
    <h3>⚡ Quick Actions</h3>
    <div class="actions-grid">
      <button class="btn primary">🤖 Create New Swarm</button>
      <button class="btn">📝 Create New Task</button>
      <button class="btn">🔄 Refresh System</button>
      <button class="btn">📊 View Analytics</button>
      <button class="btn">⚙️ System Settings</button>
      <button class="btn">📋 View Logs</button>
    </div>
  </div>

  <!-- Real-time Status -->
  <div class="status-bar mt-4 text-center text-muted">
    <span class="flex items-center justify-center gap-2">
      <span class="status-dot active"></span>
      Real-time updates active • Last updated: {new Date().toLocaleTimeString()}
    </span>
  </div>
</div>

<style>
  .dashboard {
    animation: fadeIn 0.5s ease;
  }

  .dashboard-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .dashboard-header h1 {
    color: var(--accent-primary);
    margin-bottom: 0.5rem;
  }

  .metrics {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .metric-item {
    margin-bottom: 1rem;
  }

  .metric-item:last-child {
    margin-bottom: 0;
  }

  .swarms-list {
    margin-bottom: 1rem;
  }

  .tasks-list {
    margin-bottom: 1rem;
  }

  .task-item {
    padding: 0.75rem;
    background: var(--bg-tertiary);
    border-radius: 6px;
    border: 1px solid var(--border-primary);
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }

  .status-bar {
    padding: 1rem;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-primary);
    font-size: 0.875rem;
  }

  @media (max-width: 768px) {
    .actions-grid {
      grid-template-columns: 1fr;
    }
    
    .dashboard-header {
      margin-bottom: 1.5rem;
    }
  }
</style>