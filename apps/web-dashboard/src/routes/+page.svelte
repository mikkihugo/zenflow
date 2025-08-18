<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { Chart, Line, Bar } from 'svelte-chartjs';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { apiClient, type HealthStatus, type PerformanceMetrics, type Agent, type Task } from '../lib/api';
	import { webSocketManager } from '../lib/websocket';
	import { createPerformanceChart, createAgentStatusChart, createRealTimeChart, formatChartTimestamp } from '../lib/charts';
	import { systemNotifications, notifyInfo } from '../lib/notifications';

	// Real API data (now using WebSocket stores)
	let systemStatus: HealthStatus | null = null;
	let agents: Agent[] = [];
	let tasks: Task[] = [];
	let performance: PerformanceMetrics | null = null;
	let swarmConfig: any = null;

	// Loading states
	let healthLoading = true;
	let agentsLoading = true;
	let tasksLoading = true;
	let performanceLoading = true;

	// Error states
	let healthError: string | null = null;
	let agentsError: string | null = null;
	let tasksError: string | null = null;
	let performanceError: string | null = null;

	// Chart data
	let performanceChart: any = null;
	let agentStatusChart: any = null;
	let realTimeChart = createRealTimeChart(30); // 30 data points

	// Real-time data stores
	let connectionState: any = null;
	let performanceHistory: Array<{timestamp: string; cpu: number; memory: number}> = [];

	// Health check interval
	let healthCheckInterval: NodeJS.Timeout | null = null;

	// Load real data from API and setup WebSocket
	onMount(async () => {
		// Subscribe to WebSocket stores for real-time updates
		webSocketManager.connectionState.subscribe(state => {
			connectionState = state;
		});

		webSocketManager.systemStatus.subscribe(status => {
			if (status) {
				systemStatus = status;
				healthLoading = false;
				healthError = null;
			}
		});

		webSocketManager.agents.subscribe(agentList => {
			if (agentList && agentList.length !== undefined) {
				agents = agentList;
				agentsLoading = false;
				agentsError = null;
				updateAgentStatusChart();
			}
		});

		webSocketManager.tasks.subscribe(taskList => {
			if (taskList && taskList.length !== undefined) {
				tasks = taskList;
				tasksLoading = false;
				tasksError = null;
			}
		});

		webSocketManager.performance.subscribe(perf => {
			if (perf) {
				performance = perf;
				performanceLoading = false;
				performanceError = null;
				updatePerformanceChart(perf);
				updateRealTimeChart(perf);
			}
		});

		// Connect to WebSocket and subscribe to channels
		await webSocketManager.connect();
		webSocketManager.subscribeToAll();

		// Load initial data from API as fallback
		await Promise.all([
			loadHealth(),
			loadAgents(),
			loadTasks(),
			loadPerformance(),
			loadSwarmConfig()
		]);

		// Setup health check monitoring
		healthCheckInterval = webSocketManager.startHealthCheck();

		// Listen for project changes and refresh data
		const handleProjectChange = async (event: CustomEvent) => {
			const { project, projectId } = event.detail;
			console.log('🎯 Dashboard received project change:', project.name, 'ID:', projectId);
			
			// Refresh all project-specific data
			await Promise.all([
				loadAgents(),
				loadTasks(),
				loadPerformance()
			]);
		};

		// Add event listener for project changes
		window.addEventListener('projectChanged', handleProjectChange as EventListener);

		// Set up real-time updates
		const interval = setInterval(async () => {
			try {
				// Refresh key metrics periodically
				await Promise.all([
					loadHealth(),
					loadPerformance()
				]);
			} catch (error) {
				console.warn('Failed to refresh real-time data:', error);
			}
		}, 10000); // Refresh every 10 seconds
		
		// Show connection status notification
		if (connectionState?.connected) {
			notifyInfo('Dashboard initialized with real-time updates');
		}

		// Cleanup function  
		return () => {
			clearInterval(interval);
			if (healthCheckInterval) clearInterval(healthCheckInterval);
			window.removeEventListener('projectChanged', handleProjectChange as EventListener);
		};
	});

	onDestroy(() => {
		if (healthCheckInterval) clearInterval(healthCheckInterval);
		webSocketManager.disconnect();
	});

	async function loadHealth() {
		try {
			healthLoading = true;
			systemStatus = await apiClient.getHealth();
			console.log('✅ Loaded health data:', systemStatus?.status);
		} catch (error) {
			healthError = error instanceof Error ? error.message : 'Failed to load health data';
			console.error('❌ Failed to load health:', error);
		} finally {
			healthLoading = false;
		}
	}

	async function loadAgents() {
		try {
			agentsLoading = true;
			agents = await apiClient.getAgents();
			console.log('🤖 Loaded agents:', agents.length);
		} catch (error) {
			agentsError = error instanceof Error ? error.message : 'Failed to load agents';
			console.error('❌ Failed to load agents:', error);
		} finally {
			agentsLoading = false;
		}
	}

	async function loadTasks() {
		try {
			tasksLoading = true;
			tasks = await apiClient.getTasks();
			console.log('✅ Loaded tasks:', tasks.length);
		} catch (error) {
			tasksError = error instanceof Error ? error.message : 'Failed to load tasks';
			console.error('❌ Failed to load tasks:', error);
		} finally {
			tasksLoading = false;
		}
	}

	async function loadPerformance() {
		try {
			performanceLoading = true;
			performance = await apiClient.getMetrics();
			console.log('📊 Loaded performance metrics:', performance);
		} catch (error) {
			performanceError = error instanceof Error ? error.message : 'Failed to load performance';
			console.error('❌ Failed to load performance:', error);
		} finally {
			performanceLoading = false;
		}
	}

	async function loadSwarmConfig() {
		try {
			swarmConfig = await apiClient.getSwarmConfig();
			console.log('🐝 Loaded swarm config:', swarmConfig);
		} catch (error) {
			console.warn('Failed to load swarm config:', error);
		}
	}

	function formatUptime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		
		if (days > 0) return `${days}d ${hours % 24}h`;
		if (hours > 0) return `${hours}h ${minutes % 60}m`;
		return `${minutes}m`;
	}

	function formatBytes(bytes: number): string {
		return `${Math.round(bytes / 1024 / 1024)}MB`;
	}

	function formatMemoryUsage(usage: number): string {
		return `${(usage * 100).toFixed(1)}%`;
	}

	// Group agents by status for swarm display
	$: activeAgents = agents.filter(a => a.status === 'active');
	$: swarms = [
		{ id: 1, name: 'Active Agents', agents: activeAgents.length, status: 'active' },
		{ id: 2, name: 'Total System', agents: agents.length, status: agents.length > 0 ? 'active' : 'warning' }
	];

	// Recent tasks from real data
	$: recentTasks = tasks.slice(0, 3).map(task => ({
		id: task.id,
		title: task.title,
		progress: task.progress,
		status: task.status
	}));

	// Quick action handlers
	async function createSwarm() {
		try {
			console.log('🤖 Creating new agent...');
			const agent = await apiClient.createAgent({
				type: 'general',
				capabilities: ['coordination', 'analysis'],
			});
			console.log('✅ Agent created:', agent);
			await loadAgents(); // Refresh agents list
		} catch (error) {
			console.error('❌ Failed to create agent:', error);
			alert('Failed to create agent. Please try again.');
		}
	}

	async function createTask() {
		try {
			console.log('📝 Creating new task...');
			const task = await apiClient.createTask({
				title: 'New Dashboard Task',
				type: 'general',
				priority: 'medium',
				status: 'pending',
				progress: 0
			});
			console.log('✅ Task created:', task);
			await loadTasks(); // Refresh tasks list
		} catch (error) {
			console.error('❌ Failed to create task:', error);
			alert('Failed to create task. Please try again.');
		}
	}

	async function refreshSystem() {
		console.log('🔄 Refreshing system data...');
		await Promise.all([
			loadHealth(),
			loadAgents(),
			loadTasks(),
			loadPerformance()
		]);
		console.log('✅ System data refreshed');
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'active': return 'success';
			case 'healthy': return 'success';
			case 'warning': return 'warning';
			case 'error': return 'error';
			default: return 'surface';
		}
	}

	// Chart update functions
	function updatePerformanceChart(perf: PerformanceMetrics): void {
		const now = new Date().toISOString();
		performanceHistory.push({
			timestamp: formatChartTimestamp(now),
			cpu: perf.cpu,
			memory: perf.memory
		});

		// Keep last 20 data points
		if (performanceHistory.length > 20) {
			performanceHistory = performanceHistory.slice(-20);
		}

		performanceChart = createPerformanceChart({
			timestamps: performanceHistory.map(h => h.timestamp),
			cpu: performanceHistory.map(h => h.cpu),
			memory: performanceHistory.map(h => h.memory)
		});
	}

	function updateAgentStatusChart(): void {
		const statusCounts = agents.reduce(
			(acc, agent) => {
				if (agent.status === 'active') acc.active++;
				else if (agent.status === 'idle') acc.idle++;
				else acc.error++;
				return acc;
			},
			{ active: 0, idle: 0, error: 0 }
		);

		agentStatusChart = createAgentStatusChart(statusCounts);
	}

	function updateRealTimeChart(perf: PerformanceMetrics): void {
		const timestamp = formatChartTimestamp(new Date());
		realTimeChart.addDataPoint(timestamp, perf.cpu, perf.memory);
	}
</script>

<svelte:head>
	<title>Claude Code Zen - Admin Dashboard</title>
</svelte:head>

<!-- Dashboard Header -->
<div class="mb-8">
	<h1 class="h1 text-primary-500 mb-2">Admin Dashboard</h1>
	<p class="text-surface-600-300-token">Real-time system monitoring and swarm management</p>
</div>

<!-- WebSocket Connection Status -->
{#if connectionState && !connectionState.connected}
	<div class="card variant-filled-warning mb-6">
		<section class="p-4">
			<div class="flex items-center gap-3">
				{#if connectionState.connecting}
					<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-warning-600"></div>
					<span>Connecting to real-time updates...</span>
				{:else if connectionState.reconnecting}
					<div class="animate-pulse rounded-full h-4 w-4 bg-warning-600"></div>
					<span>Reconnecting to server...</span>
				{:else if connectionState.error}
					<span>❌</span>
					<span>Connection error: {connectionState.error}</span>
				{:else}
					<span>🔄</span>
					<span>Real-time updates offline</span>
				{/if}
			</div>
		</section>
	</div>
{/if}

<!-- Performance Charts Section -->
<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
	<!-- Real-time Performance Chart -->
	<div class="card variant-glass-surface">
		<header class="card-header">
			<h3 class="h3 text-primary-500">📈 Real-time Metrics</h3>
		</header>
		<section class="p-4">
			<div class="h-64">
				{#if realTimeChart}
					<Line data={realTimeChart.data} options={realTimeChart.options} />
				{:else}
					<div class="flex items-center justify-center h-full animate-pulse">
						<div class="text-center">
							<div class="w-16 h-16 bg-surface-300-600-token rounded-full mb-4 mx-auto"></div>
							<div class="w-32 h-4 bg-surface-300-600-token rounded mx-auto mb-2"></div>
							<div class="w-24 h-3 bg-surface-300-600-token rounded mx-auto"></div>
						</div>
					</div>
				{/if}
			</div>
		</section>
	</div>

	<!-- Agent Status Distribution Chart -->
	<div class="card variant-glass-surface">
		<header class="card-header">
			<h3 class="h3 text-secondary-500">🤖 Agent Distribution</h3>
		</header>
		<section class="p-4">
			<div class="h-64">
				{#if agentStatusChart}
					<Bar data={agentStatusChart.data} options={agentStatusChart.options} />
				{:else}
					<div class="flex items-center justify-center h-full animate-pulse">
						<div class="flex items-end gap-3">
							<div class="w-8 bg-surface-300-600-token rounded-t" style="height: 60%"></div>
							<div class="w-8 bg-surface-300-600-token rounded-t" style="height: 80%"></div>
							<div class="w-8 bg-surface-300-600-token rounded-t" style="height: 40%"></div>
							<div class="w-8 bg-surface-300-600-token rounded-t" style="height: 70%"></div>
						</div>
					</div>
				{/if}
			</div>
		</section>
	</div>
</div>

<!-- System Status Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
	<!-- System Health Card -->
	<div class="card variant-soft-{healthLoading ? 'surface' : getStatusColor(systemStatus?.status || 'unknown')}">
		<header class="card-header pb-2">
			<div class="flex items-center justify-between">
				<h3 class="h4">⚡ System Health</h3>
				{#if healthLoading}
					<div class="w-12 h-12 border-2 border-surface-300 border-t-primary-500 rounded-full animate-spin"></div>
				{:else if systemStatus}
					<ProgressRadial value={systemStatus.status === 'healthy' ? 95 : 50} width="w-12" class="text-{getStatusColor(systemStatus.status)}-500">
						<span class="text-xs font-bold">{systemStatus.status === 'healthy' ? '95%' : '50%'}</span>
					</ProgressRadial>
				{:else}
					<ProgressRadial value={0} width="w-12" class="text-error-500">
						<span class="text-xs font-bold">0%</span>
					</ProgressRadial>
				{/if}
			</div>
		</header>
		<section class="p-4 pt-0">
			{#if healthLoading}
				<div class="space-y-2 animate-pulse">
					<div class="flex justify-between items-center">
						<span class="text-sm opacity-75">Status</span>
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 bg-surface-400 rounded-full animate-pulse"></div>
							<div class="w-16 h-4 bg-surface-300-600-token rounded"></div>
						</div>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-sm opacity-75">Uptime</span>
						<div class="w-12 h-4 bg-surface-300-600-token rounded font-mono"></div>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-sm opacity-75">Memory</span>
						<div class="flex items-center gap-1">
							<div class="w-12 h-3 bg-surface-300-600-token rounded"></div>
							<span class="text-xs opacity-50">MB</span>
							<div class="w-8 h-3 bg-surface-300-600-token rounded ml-1"></div>
						</div>
					</div>
				</div>
			{:else if healthError}
				<div class="text-center text-error-500">
					<p class="text-sm">❌ {healthError}</p>
					<button on:click={loadHealth} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
				</div>
			{:else if systemStatus}
				<div class="space-y-2">
					<div class="flex justify-between">
						<span class="text-sm opacity-75">Status</span>
						<span class="badge variant-soft-{getStatusColor(systemStatus.status)} text-xs capitalize">{systemStatus.status}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm opacity-75">Uptime</span>
						<span class="text-sm font-mono">{formatUptime(systemStatus.uptime)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-sm opacity-75">Memory</span>
						<span class="text-sm font-mono">{formatBytes(systemStatus.metrics.totalMemoryUsage)} ({formatMemoryUsage(systemStatus.metrics.utilizationRate)})</span>
					</div>
				</div>
			{:else}
				<div class="text-center">
					<p class="text-sm opacity-75">No data available</p>
				</div>
			{/if}
		</section>
	</div>

	<!-- Active Agents Card -->
	<div class="card variant-soft-primary">
		<header class="card-header pb-2">
			<h3 class="h4">🤖 Active Agents</h3>
		</header>
		<section class="p-4 pt-0">
			{#if agentsLoading}
				<div class="text-center mb-3 animate-pulse">
					<div class="text-2xl font-bold mb-1">
						<div class="w-8 h-8 bg-surface-300-600-token rounded mx-auto"></div>
					</div>
					<div class="text-sm opacity-75">
						<div class="w-12 h-3 bg-surface-300-600-token rounded mx-auto"></div>
					</div>
				</div>
				<div class="space-y-1 animate-pulse">
					<div class="flex justify-between items-center text-sm">
						<span>Total Agents</span>
						<div class="w-6 h-4 bg-surface-300-600-token rounded"></div>
					</div>
					<div class="flex justify-between items-center text-sm">
						<span>Active Agents</span>
						<div class="w-6 h-4 bg-surface-300-600-token rounded"></div>
					</div>
				</div>
			{:else if agentsError}
				<div class="text-center text-error-500">
					<p class="text-sm">❌ {agentsError}</p>
					<button on:click={loadAgents} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
				</div>
			{:else}
				<div class="text-center mb-3">
					<div class="text-2xl font-bold text-primary-500">{activeAgents.length}</div>
					<div class="text-sm opacity-75">Active</div>
				</div>
				<div class="space-y-1">
					<div class="flex justify-between items-center text-sm">
						<span>Total Agents</span>
						<span class="badge variant-soft-{agents.length > 0 ? 'success' : 'warning'} text-xs">{agents.length}</span>
					</div>
					<div class="flex justify-between items-center text-sm">
						<span>Active Agents</span>
						<span class="badge variant-soft-{activeAgents.length > 0 ? 'success' : 'warning'} text-xs">{activeAgents.length}</span>
					</div>
				</div>
			{/if}
		</section>
		<footer class="card-footer">
			<button class="btn btn-sm variant-ghost-primary w-full">View All Agents</button>
		</footer>
	</div>

	<!-- Performance Card -->
	<div class="card variant-soft-secondary">
		<header class="card-header pb-2">
			<h3 class="h4">📊 Performance</h3>
		</header>
		<section class="p-4 pt-0">
			{#if performanceLoading}
				<div class="space-y-3 animate-pulse">
					<div>
						<div class="flex justify-between text-sm mb-1">
							<span>CPU Usage</span>
							<div class="flex items-center gap-1">
								<div class="w-8 h-4 bg-surface-300-600-token rounded"></div>
								<span class="text-xs opacity-50">%</span>
							</div>
						</div>
						<div class="progress-bar">
							<div class="progress-fill bg-surface-300-600-token animate-pulse" style="width: 45%"></div>
						</div>
					</div>
					<div>
						<div class="flex justify-between text-sm mb-1">
							<span>Memory</span>
							<div class="flex items-center gap-1">
								<div class="w-8 h-4 bg-surface-300-600-token rounded"></div>
								<span class="text-xs opacity-50">%</span>
							</div>
						</div>
						<div class="progress-bar">
							<div class="progress-fill bg-surface-300-600-token animate-pulse" style="width: 35%"></div>
						</div>
					</div>
				</div>
			{:else if performanceError}
				<div class="text-center text-error-500">
					<p class="text-sm">❌ {performanceError}</p>
					<button on:click={loadPerformance} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
				</div>
			{:else if performance}
				<div class="space-y-3">
					<!-- CPU Usage -->
					<div>
						<div class="flex justify-between text-sm mb-1">
							<span>CPU Usage</span>
							<span class="font-mono">{performance.cpu.toFixed(1)}%</span>
						</div>
						<div class="progress-bar">
							<div class="progress-fill bg-secondary-500" style="width: {performance.cpu}%"></div>
						</div>
					</div>
					<!-- Memory Usage -->
					<div>
						<div class="flex justify-between text-sm mb-1">
							<span>Memory</span>
							<span class="font-mono">{performance.memory.toFixed(1)}%</span>
						</div>
						<div class="progress-bar">
							<div class="progress-fill bg-{performance.memory > 80 ? 'error' : 'secondary'}-500" style="width: {performance.memory}%"></div>
						</div>
					</div>
				</div>
			{:else}
				<div class="text-center">
					<p class="text-sm opacity-75">No performance data</p>
				</div>
			{/if}
		</section>
	</div>

	<!-- Quick Stats Card -->
	<div class="card variant-soft-tertiary">
		<header class="card-header pb-2">
			<h3 class="h4">📈 Quick Stats</h3>
		</header>
		<section class="p-4 pt-0">
			{#if performanceLoading}
				<div class="space-y-3 animate-pulse">
					<div class="text-center">
						<div class="text-xl font-bold text-tertiary-500 mb-1">
							<div class="w-12 h-6 bg-surface-300-600-token rounded mx-auto"></div>
						</div>
						<div class="text-xs opacity-75">
							<div class="w-20 h-3 bg-surface-300-600-token rounded mx-auto"></div>
						</div>
					</div>
					<div class="text-center">
						<div class="text-xl font-bold text-tertiary-500 mb-1">
							<div class="w-10 h-6 bg-surface-300-600-token rounded mx-auto"></div>
						</div>
						<div class="text-xs opacity-75">
							<div class="w-24 h-3 bg-surface-300-600-token rounded mx-auto"></div>
						</div>
					</div>
				</div>
			{:else if performance}
				<div class="space-y-3">
					<div class="text-center">
						<div class="text-xl font-bold text-tertiary-500">{performance.requestsPerMin}</div>
						<div class="text-xs opacity-75">Requests/min</div>
					</div>
					<div class="text-center">
						<div class="text-xl font-bold text-tertiary-500">{performance.avgResponse}ms</div>
						<div class="text-xs opacity-75">Avg Response</div>
					</div>
				</div>
			{:else}
				<div class="text-center">
					<p class="text-sm opacity-75">No stats available</p>
				</div>
			{/if}
		</section>
	</div>
</div>

<!-- Recent Tasks -->
<div class="card variant-glass-surface mb-8">
	<header class="card-header">
		<h3 class="h3 text-primary-500">✅ Recent Tasks</h3>
	</header>
	<section class="p-4">
		{#if tasksLoading}
			<div class="space-y-4">
				{#each Array(3) as _, i}
					<div class="card variant-soft-surface p-4 animate-pulse">
						<div class="flex justify-between items-center mb-2">
							<div class="w-32 h-4 bg-surface-300-600-token rounded"></div>
							<div class="w-12 h-4 bg-surface-300-600-token rounded"></div>
						</div>
						<div class="progress-bar mb-2">
							<div class="progress-fill bg-surface-300-600-token" style="width: 50%"></div>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 rounded-full bg-surface-300-600-token"></div>
							<div class="w-16 h-3 bg-surface-300-600-token rounded"></div>
						</div>
					</div>
				{/each}
			</div>
		{:else if tasksError}
			<div class="text-center text-error-500 py-8">
				<p class="text-sm">❌ {tasksError}</p>
				<button on:click={loadTasks} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
			</div>
		{:else if recentTasks.length > 0}
			<div class="space-y-4">
				{#each recentTasks as task}
					<div class="card variant-soft-surface p-4">
						<div class="flex justify-between items-center mb-2">
							<h4 class="font-medium">{task.title}</h4>
							<span class="badge variant-soft-{getStatusColor(task.status)} text-xs">{task.progress}%</span>
						</div>
						<div class="progress-bar mb-2">
							<div class="progress-fill bg-{getStatusColor(task.status)}-500" style="width: {task.progress}%"></div>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-2 h-2 rounded-full bg-{getStatusColor(task.status)}-500"></div>
							<span class="text-xs opacity-75 capitalize">{task.status}</span>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="text-center py-8">
				<p class="text-sm opacity-75">No tasks available</p>
				<button class="btn btn-sm variant-soft-primary mt-2">
					<span>➕</span>
					<span>Create First Task</span>
				</button>
			</div>
		{/if}
	</section>
	<footer class="card-footer">
		<button class="btn variant-ghost-surface">
			<span>📋</span>
			<span>View All Tasks ({tasks.length})</span>
		</button>
	</footer>
</div>

<!-- Quick Actions -->
<div class="card variant-glass-surface">
	<header class="card-header">
		<h3 class="h3 text-primary-500">⚡ Quick Actions</h3>
	</header>
	<section class="p-4">
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			<button class="btn variant-filled-primary" on:click={createSwarm}>
				<span>🤖</span>
				<span>Create New Agent</span>
			</button>
			<button class="btn variant-ghost-surface" on:click={createTask}>
				<span>📝</span>
				<span>Create New Task</span>
			</button>
			<button class="btn variant-ghost-surface" on:click={refreshSystem}>
				<span>🔄</span>
				<span>Refresh System</span>
			</button>
			<button class="btn variant-ghost-surface" on:click={() => window.location.href = '/performance'}>
				<span>📊</span>
				<span>View Analytics</span>
			</button>
			<button class="btn variant-ghost-surface" on:click={() => window.location.href = '/settings'}>
				<span>⚙️</span>
				<span>System Settings</span>
			</button>
			<button class="btn variant-ghost-surface" on:click={() => window.location.href = '/logs'}>
				<span>📋</span>
				<span>View Logs</span>
			</button>
		</div>
	</section>
</div>

<!-- Toast Notifications -->
<SvelteToast />

<style lang="postcss">
	.progress-bar {
		@apply w-full h-2 bg-surface-300-600-token rounded-full overflow-hidden;
	}
	.progress-fill {
		@apply h-full rounded-full transition-all duration-500;
	}
</style>
