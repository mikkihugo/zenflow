<script lang="ts">
  import { onMount } from 'svelte';
  // import { ProgressRadial, ProgressBar } from '@skeletonlabs/skeleton-svelte';
  import SkeletonStatusCard from '$lib/components/SkeletonStatusCard.svelte';
  
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
    <!-- Enhanced Skeleton UI Status Card -->
    <SkeletonStatusCard 
      title="⚡ System Health"
      status={systemStatus.health}
      progress={Math.round((systemStatus.uptime / 3600) * 100) || 85}
      details={[
        { label: 'Uptime', value: formatUptime(systemStatus.uptime) },
        { label: 'Memory Usage', value: formatBytes(systemStatus.memoryUsage) },
        { label: 'Version', value: systemStatus.version },
        { label: 'Status', value: systemStatus.health }
      ]}
    />

    <!-- Active Swarms Card -->
    <div class="card variant-glass-surface">
      <header class="card-header">
        <h3 class="h3 text-primary-500">🐝 Active Swarms</h3>
      </header>
      <section class="p-4">
        <div class="space-y-3">
          {#each swarms as swarm}
            <div class="flex justify-between items-center p-3 bg-surface-100-800-token rounded-lg">
              <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full bg-{swarm.status === 'active' ? 'success' : swarm.status === 'warning' ? 'warning' : 'error'}-500"></div>
                <span class="text-surface-900-50-token font-medium">{swarm.name}</span>
              </div>
              <span class="badge variant-soft-primary">{swarm.agents} agents</span>
            </div>
          {/each}
        </div>
      </section>
      <footer class="card-footer">
        <button class="btn variant-filled-primary">
          <span>🚀</span>
          Initialize New Swarm
        </button>
      </footer>
    </div>

    <!-- Performance Metrics Card -->
    <div class="card variant-glass-surface">
      <header class="card-header">
        <h3 class="h3 text-primary-500">📊 Performance</h3>
      </header>
      <section class="p-4">
        <div class="space-y-6">
          <!-- CPU Usage -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-surface-600-300-token">CPU Usage</span>
              <span class="font-mono text-surface-900-50-token font-semibold">{performance.cpu.toFixed(1)}%</span>
            </div>
            <div class="w-full bg-surface-300-600-token rounded-full h-2">
              <div class="bg-primary-500 h-2 rounded-full transition-all duration-500" style="width: {performance.cpu}%"></div>
            </div>
          </div>
          
          <!-- Memory Usage -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="text-surface-600-300-token">Memory Usage</span>
              <span class="font-mono text-surface-900-50-token font-semibold">{performance.memory.toFixed(1)}%</span>
            </div>
            <div class="w-full bg-surface-300-600-token rounded-full h-2">
              <div class="bg-{performance.memory > 90 ? 'error' : performance.memory > 80 ? 'warning' : 'success'}-500 h-2 rounded-full transition-all duration-500" style="width: {performance.memory}%"></div>
            </div>
          </div>
          
          <!-- Quick Metrics -->
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-3 bg-surface-100-800-token rounded-lg">
              <div class="text-xl font-mono font-bold text-primary-500">{performance.requestsPerMin}</div>
              <div class="text-sm text-surface-600-300-token">Requests/min</div>
            </div>
            <div class="text-center p-3 bg-surface-100-800-token rounded-lg">
              <div class="text-xl font-mono font-bold text-primary-500">{performance.avgResponse}ms</div>
              <div class="text-sm text-surface-600-300-token">Avg Response</div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Recent Tasks Card -->
    <div class="card variant-glass-surface">
      <header class="card-header">
        <h3 class="h3 text-primary-500">✅ Recent Tasks</h3>
      </header>
      <section class="p-4">
        <div class="space-y-4">
          {#each recentTasks as task}
            <div class="p-4 bg-surface-100-800-token rounded-lg border-l-4 border-{task.status === 'active' ? 'primary' : task.status === 'pending' ? 'warning' : 'success'}-500">
              <div class="flex justify-between items-center mb-2">
                <h4 class="font-medium text-surface-900-50-token">{task.title}</h4>
                <span class="badge variant-soft-{task.status === 'active' ? 'primary' : task.status === 'pending' ? 'warning' : 'success'}">{task.progress}%</span>
              </div>
              <div class="w-full bg-surface-300-600-token rounded-full h-2 mb-2">
                <div class="bg-{task.status === 'active' ? 'primary' : task.status === 'pending' ? 'warning' : 'success'}-500 h-2 rounded-full transition-all duration-500" style="width: {task.progress}%"></div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-{task.status === 'active' ? 'primary' : task.status === 'pending' ? 'warning' : 'success'}-500"></div>
                <span class="text-xs text-surface-600-300-token capitalize">{task.status}</span>
              </div>
            </div>
          {/each}
        </div>
      </section>
      <footer class="card-footer">
        <button class="btn variant-ghost-surface">
          <span>📋</span>
          View All Tasks
        </button>
      </footer>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="card variant-glass-surface">
    <header class="card-header">
      <h3 class="h3 text-primary-500">⚡ Quick Actions</h3>
    </header>
    <section class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button class="btn variant-filled-primary">
          <span>🤖</span>
          Create New Swarm
        </button>
        <button class="btn variant-ghost-surface">
          <span>📝</span>
          Create New Task
        </button>
        <button class="btn variant-ghost-surface">
          <span>🔄</span>
          Refresh System
        </button>
        <button class="btn variant-ghost-surface">
          <span>📊</span>
          View Analytics
        </button>
        <button class="btn variant-ghost-surface">
          <span>⚙️</span>
          System Settings
        </button>
        <button class="btn variant-ghost-surface">
          <span>📋</span>
          View Logs
        </button>
      </div>
    </section>
  </div>

  <!-- Real-time Status -->
  <div class="alert variant-ghost-surface mt-6">
    <div class="alert-message flex items-center justify-center gap-2">
      <div class="w-3 h-3 rounded-full bg-success-500 animate-pulse"></div>
      <span class="text-surface-600-300-token">
        Real-time updates active • Last updated: {new Date().toLocaleTimeString()}
      </span>
    </div>
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