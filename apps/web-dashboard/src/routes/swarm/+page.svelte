<script lang="ts">
import { onMount, onDestroy } from "svelte";
import { webSocketManager } from "../../lib/websocket";
import { apiClient } from "../../lib/api";

// Swarm management data
let swarmStatus: any = null;
let swarmStats: any = null;
let swarmTasks: any[] = [];
let selectedTask: any = null;

// Loading states
let _statusLoading = true;
let _statsLoading = false;
let __tasksLoading = false;
let _taskDetailsLoading = false;
let _initLoading = false;
let _agentSpawningLoading = false;
let _taskCreationLoading = false;

// Error states
let _statusError: string | null = null;
let __statsError: string | null = null;
let __tasksError: string | null = null;
let _taskDetailsError: string | null = null;
let _initError: string | null = null;
let _agentSpawnError: string | null = null;
let _taskCreationError: string | null = null;

// WebSocket unsubscribe functions
let unsubscribeSwarms: (() => void) | null = null;
let unsubscribeSwarmStats: (() => void) | null = null;
let unsubscribeTasks: (() => void) | null = null;
let unsubscribeConnection: (() => void) | null = null;

// Form states
let activeTab = 0;

// Swarm initialization form
let swarmTopology = "mesh";
let swarmMaxAgents = 5;
let swarmStrategy = "adaptive";

// Agent spawning form
let agentSwarmId = "";
let agentType = "general";
let agentName = "";
let agentCapabilities = "coordination,analysis";

// Task orchestration form
let taskDescription = "";
let taskStrategy = "adaptive";
let taskPriority = "medium";
let taskMaxAgents = 3;

const _topologies = ["mesh", "hierarchical", "ring", "star"];
const _strategies = ["adaptive", "parallel", "sequential", "balanced"];
const _agentTypes = [
	"general",
	"researcher",
	"coder",
	"analyst",
	"tester",
	"coordinator",
];
const _priorities = ["low", "medium", "high", "critical"];

onMount(async () => {
	// Setup WebSocket subscriptions for real-time swarm updates
	setupWebSocketSubscriptions();
	
	// Subscribe to swarm, stats, and task data
	webSocketManager.subscribe('swarms');
	webSocketManager.subscribe('swarm-stats');
	webSocketManager.subscribe('tasks');
	
	console.log("✅ Swarm management initialized with WebSocket real-time updates");

	// Listen for project changes
	const handleProjectChange = async () => {
		// Refresh WebSocket subscriptions
		webSocketManager.subscribe('swarms');
		webSocketManager.subscribe('swarm-stats');
		webSocketManager.subscribe('tasks');
		// Clear cached data when project changes
		swarmStats = null;
		swarmTasks = [];
		selectedTask = null;
	};

	window.addEventListener(
		"projectChanged",
		handleProjectChange as EventListener,
	);

	return () => {
		window.removeEventListener(
			"projectChanged",
			handleProjectChange as EventListener,
		);
	};
});

onDestroy(() => {
	// Clean up WebSocket subscriptions
	if (unsubscribeSwarms) unsubscribeSwarms();
	if (unsubscribeSwarmStats) unsubscribeSwarmStats();
	if (unsubscribeTasks) unsubscribeTasks();
	if (unsubscribeConnection) unsubscribeConnection();
});

function setupWebSocketSubscriptions() {
	// Subscribe to swarm status updates
	unsubscribeSwarms = webSocketManager.swarms.subscribe((data) => {
		if (data) {
			console.log("🐝 Real-time swarm data received:", data);
			swarmStatus = Array.isArray(data) && data.length > 0 ? data[0] : data;
			_statusLoading = false;
			_statusError = null;
		}
	});

	// Subscribe to swarm stats updates
	unsubscribeSwarmStats = webSocketManager.swarmStats.subscribe((data) => {
		if (data) {
			console.log("📊 Real-time swarm stats received:", data);
			swarmStats = data;
			_statsLoading = false;
			__statsError = null;
		}
	});

	// Subscribe to task updates
	unsubscribeTasks = webSocketManager.tasks.subscribe((data) => {
		if (data) {
			console.log("📋 Real-time task data received:", data);
			swarmTasks = Array.isArray(data) ? data : [];
			__tasksLoading = false;
			__tasksError = null;
		}
	});

	// Subscribe to connection state
	unsubscribeConnection = webSocketManager.connectionState.subscribe((state) => {
		if (!state.connected) {
			_statusError = "WebSocket disconnected - data may be stale";
			__statsError = "WebSocket disconnected - data may be stale";
			__tasksError = "WebSocket disconnected - data may be stale";
		} else {
			// Clear errors when reconnected
			if (_statusError?.includes("WebSocket disconnected")) _statusError = null;
			if (__statsError?.includes("WebSocket disconnected")) __statsError = null;
			if (__tasksError?.includes("WebSocket disconnected")) __tasksError = null;
		}
	});
}

function refreshSwarmData() {
	// Re-subscribe to WebSocket channels to get latest data
	webSocketManager.subscribe('swarms');
	console.log("🔄 Refreshing swarm status via WebSocket");
}

function refreshSwarmStats() {
	// Re-subscribe to WebSocket channel to get latest stats
	webSocketManager.subscribe('swarm-stats');
	console.log("🔄 Refreshing swarm stats via WebSocket");
}

function refreshSwarmTasks() {
	// Re-subscribe to WebSocket channel to get latest tasks
	webSocketManager.subscribe('tasks');
	console.log("🔄 Refreshing swarm tasks via WebSocket");
}

async function loadTaskDetails(taskId: string) {
	try {
		_taskDetailsLoading = true;
		selectedTask = await apiClient.getSwarmTasks(taskId);
		_taskDetailsError = null;
		console.log("📄 Loaded task details:", selectedTask);
	} catch (error) {
		_taskDetailsError =
			error instanceof Error ? error.message : "Failed to load task details";
		console.error("❌ Failed to load task details:", error);
	} finally {
		_taskDetailsLoading = false;
	}
}

async function initializeSwarm() {
	try {
		_initLoading = true;
		_initError = null;

		const result = await apiClient.initializeAdvancedSwarm({
			topology: swarmTopology,
			maxAgents: swarmMaxAgents,
			strategy: swarmStrategy,
		});

		console.log("✅ Swarm initialized:", result);
		refreshSwarmData();

		// Update swarmId for agent spawning
		if (result?.data?.swarmId) {
			agentSwarmId = result.data.swarmId;
		}
	} catch (error) {
		_initError =
			error instanceof Error ? error.message : "Failed to initialize swarm";
		console.error("❌ Swarm initialization failed:", error);
	} finally {
		_initLoading = false;
	}
}

async function spawnAgent() {
	if (!agentSwarmId) {
		_agentSpawnError = "Please provide a swarm ID";
		return;
	}

	try {
		_agentSpawningLoading = true;
		_agentSpawnError = null;

		const capabilities = agentCapabilities
			.split(",")
			.map((c) => c.trim())
			.filter((c) => c);

		const result = await apiClient.spawnSwarmAgent(agentSwarmId, {
			type: agentType,
			name: agentName || `${agentType}-agent-${Date.now()}`,
			capabilities,
		});

		console.log("✅ Agent spawned:", result);

		// Clear form
		agentName = "";
		agentCapabilities = "coordination,analysis";

		// Refresh status
		refreshSwarmData();
	} catch (error) {
		_agentSpawnError =
			error instanceof Error ? error.message : "Failed to spawn agent";
		console.error("❌ Agent spawning failed:", error);
	} finally {
		_agentSpawningLoading = false;
	}
}

async function orchestrateTask() {
	if (!taskDescription) {
		_taskCreationError = "Please provide a task description";
		return;
	}

	try {
		_taskCreationLoading = true;
		_taskCreationError = null;

		const result = await apiClient.orchestrateSwarmTask({
			task: taskDescription,
			strategy: taskStrategy,
			priority: taskPriority,
			maxAgents: taskMaxAgents,
		});

		console.log("✅ Task orchestrated:", result);

		// Clear form
		taskDescription = "";

		// Refresh tasks
		refreshSwarmTasks();
	} catch (error) {
		_taskCreationError =
			error instanceof Error ? error.message : "Failed to orchestrate task";
		console.error("❌ Task orchestration failed:", error);
	} finally {
		_taskCreationLoading = false;
	}
}

async function shutdownSwarm() {
	if (
		!confirm(
			"Are you sure you want to shutdown the swarm? This will stop all agents and tasks.",
		)
	) {
		return;
	}

	try {
		await apiClient.shutdownSwarm();
		console.log("🛑 Swarm shutdown initiated");
		refreshSwarmData();
	} catch (error) {
		console.error("❌ Swarm shutdown failed:", error);
		alert(
			`Failed to shutdown swarm: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

function _getStatusColor(status: string): string {
	switch (status?.toLowerCase()) {
		case "active":
		case "healthy":
		case "running":
			return "success";
		case "idle":
		case "paused":
			return "warning";
		case "error":
		case "failed":
			return "error";
		case "initializing":
			return "tertiary";
		default:
			return "surface";
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
</script>

<svelte:head>
	<title>Swarm Management - Claude Code Zen</title>
</svelte:head>

<!-- Header -->
<div class="mb-8">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">🐝 Swarm Management</h1>
			<p class="text-gray-600 dark:text-gray-300">Advanced swarm orchestration, agent management, and task coordination</p>
		</div>
		<div class="flex gap-2">
			<button class="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors" on:click={refreshSwarmData}>
				<span>🔄</span>
				<span>Refresh</span>
			</button>
			<button class="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors" on:click={shutdownSwarm}>
				<span>🛑</span>
				<span>Shutdown</span>
			</button>
		</div>
	</div>
</div>

<!-- Swarm Status Overview -->
<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-8">
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<h3 class="text-xl font-bold text-blue-600 dark:text-blue-400">🐝 Swarm Status</h3>
	</div>
	<section class="p-4">
		{#if _statusLoading}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4">
					<div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
					<p class="text-sm opacity-75">Loading swarm status...</p>
				</div>
			</div>
		{:else if statusError}
			<div class="text-center text-red-600 dark:text-red-400 py-8">
				<p class="text-sm">❌ {statusError}</p>
				<button on:click={refreshSwarmData} class="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors mt-2">Retry</button>
			</div>
		{:else if swarmStatus}
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
				<!-- Swarm Status -->
				<div class="text-center">
					<div class="mb-2">
						<div class="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mx-auto relative">
							<div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-pulse"></div>
							<span class="text-xs font-bold text-blue-600 dark:text-blue-400">
								{swarmStatus.data?.status === 'active' ? '95%' : swarmStatus.data?.status === 'idle' ? '50%' : '25%'}
							</span>
						</div>
					</div>
					<div class="font-medium text-sm">Swarm Status</div>
					<div class="bg-{_getStatusColor(swarmStatus.data?.status)}-100 dark:bg-{_getStatusColor(swarmStatus.data?.status)}-900 text-{_getStatusColor(swarmStatus.data?.status)}-800 dark:text-{_getStatusColor(swarmStatus.data?.status)}-200 px-2 py-1 rounded text-xs mt-1">
						{swarmStatus.data?.status || 'Unknown'}
					</div>
				</div>

				<!-- Active Agents -->
				<div class="text-center">
					<div class="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
						{swarmStatus.data?.activeAgents || 0}
					</div>
					<div class="text-sm font-medium">Active Agents</div>
					<div class="text-xs opacity-75 mt-1">
						{swarmStatus.data?.totalAgents || 0} total
					</div>
				</div>

				<!-- Active Tasks -->
				<div class="text-center">
					<div class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">
						{swarmStatus.data?.activeTasks || 0}
					</div>
					<div class="text-sm font-medium">Active Tasks</div>
					<div class="text-xs opacity-75 mt-1">
						{swarmStatus.data?.completedTasks || 0} completed
					</div>
				</div>

				<!-- Uptime -->
				<div class="text-center">
					<div class="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
						{swarmStatus.data?.uptime ? formatUptime(swarmStatus.data.uptime) : 'N/A'}
					</div>
					<div class="text-sm font-medium">Uptime</div>
				</div>
			</div>

			{#if swarmStatus.data?.topology || swarmStatus.data?.strategy}
				<hr class="opacity-50 my-4" />
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
					{#if swarmStatus.data.topology}
						<div class="text-center">
							<span class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">{swarmStatus.data.topology}</span>
							<div class="text-xs opacity-75 mt-1">Topology</div>
						</div>
					{/if}
					{#if swarmStatus.data.strategy}
						<div class="text-center">
							<span class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">{swarmStatus.data.strategy}</span>
							<div class="text-xs opacity-75 mt-1">Strategy</div>
						</div>
					{/if}
					{#if swarmStatus.data.maxAgents}
						<div class="text-center">
							<span class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-xs">{swarmStatus.data.maxAgents}</span>
							<div class="text-xs opacity-75 mt-1">Max Agents</div>
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</section>
</div>

<!-- Swarm Operations -->
<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
	<div class="p-4 border-b border-gray-200 dark:border-gray-700">
		<h3 class="text-xl font-bold text-blue-600 dark:text-blue-400">⚡ Swarm Operations</h3>
	</div>
	<section class="p-4">
		<div class="border-b border-gray-200 dark:border-gray-700">
			<nav class="-mb-px flex space-x-8">
				<button class="{activeTab === 0 ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm" on:click={() => activeTab = 0}>🚀 Initialize</button>
				<button class="{activeTab === 1 ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm" on:click={() => activeTab = 1}>🤖 Spawn Agents</button>
				<button class="{activeTab === 2 ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm" on:click={() => activeTab = 2}>📋 Tasks</button>
				<button class="{activeTab === 3 ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm" on:click={() => activeTab = 3}>📊 Statistics</button>
			</nav>
		</div>

		<div class="mt-6">
			{#if activeTab === 0}
				<!-- Initialize Swarm Tab -->
				<div class="space-y-4">
					<h5 class="text-lg font-medium">Initialize New Swarm</h5>
					
					{#if _initError}
						<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600/50 rounded-lg p-4">
							<div class="alert-message">
								<p>❌ {_initError}</p>
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<label class="block">
							<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topology</span>
							<select bind:value={swarmTopology} class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
								{#each _topologies as topology}
									<option value={topology}>{topology}</option>
								{/each}
							</select>
						</label>

						<label class="block">
							<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Agents</span>
							<input
								type="number"
								bind:value={swarmMaxAgents}
								class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								min="1"
								max="100"
							/>
						</label>

						<label class="block">
							<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strategy</span>
							<select bind:value={swarmStrategy} class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
								{#each _strategies as strategy}
									<option value={strategy}>{strategy}</option>
								{/each}
							</select>
						</label>
					</div>

					<button 
						class="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors w-full md:w-auto" 
						on:click={initializeSwarm}
						disabled={_initLoading}
					>
						{#if _initLoading}
							<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
						{:else}
							<span>🚀</span>
						{/if}
						<span>Initialize Swarm</span>
					</button>
				</div>

			{:else if activeTab === 1}
				<!-- Spawn Agents Tab -->
				<div class="space-y-4">
					<h5 class="text-lg font-medium">Spawn New Agent</h5>
					
					{#if _agentSpawnError}
						<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600/50 rounded-lg p-4">
							<div class="alert-message">
								<p>❌ {_agentSpawnError}</p>
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<label class="block">
							<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Swarm ID *</span>
							<input
								type="text"
								bind:value={agentSwarmId}
								class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="swarm-xxx-xxx"
							/>
						</label>

						<label class="block">
							<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Type</span>
							<select bind:value={agentType} class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
								{#each _agentTypes as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</label>

						<label class="block">
							<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Agent Name (optional)</span>
							<input
								type="text"
								bind:value={agentName}
								class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Leave empty for auto-generated name"
							/>
						</label>

						<label class="block">
							<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capabilities (comma-separated)</span>
							<input
								type="text"
								bind:value={agentCapabilities}
								class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="coordination,analysis,planning"
							/>
						</label>
					</div>

					<button 
						class="bg-purple-600 dark:bg-purple-700 text-white px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors w-full md:w-auto" 
						on:click={spawnAgent}
						disabled={_agentSpawningLoading || !agentSwarmId}
					>
						{#if _agentSpawningLoading}
							<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
						{:else}
							<span>🤖</span>
						{/if}
						<span>Spawn Agent</span>
					</button>
				</div>

			{:else if activeTab === 2}
				<!-- Tasks Tab -->
				<div class="space-y-6">
					<!-- Task Orchestration -->
					<div class="space-y-4">
						<h5 class="text-lg font-medium">Orchestrate New Task</h5>
						
						{#if _taskCreationError}
							<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600/50 rounded-lg p-4">
								<div class="alert-message">
									<p>❌ {_taskCreationError}</p>
								</div>
							</div>
						{/if}

						<div class="space-y-3">
							<label class="block">
								<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Task Description *</span>
								<textarea
									bind:value={taskDescription}
									class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									rows="3"
									placeholder="Describe the task to be executed by the swarm..."
								></textarea>
							</label>

							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<label class="block">
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strategy</span>
									<select bind:value={taskStrategy} class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
										{#each _strategies as strategy}
											<option value={strategy}>{strategy}</option>
										{/each}
									</select>
								</label>

								<label class="block">
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</span>
									<select bind:value={taskPriority} class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
										{#each _priorities as priority}
											<option value={priority}>{priority}</option>
										{/each}
									</select>
								</label>

								<label class="block">
									<span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Agents</span>
									<input
										type="number"
										bind:value={taskMaxAgents}
										class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										min="1"
										max="20"
									/>
								</label>
							</div>

							<button 
								class="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors w-full md:w-auto" 
								on:click={orchestrateTask}
								disabled={_taskCreationLoading || !taskDescription}
							>
								{#if _taskCreationLoading}
									<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
								{:else}
									<span>📋</span>
								{/if}
								<span>Orchestrate Task</span>
							</button>
						</div>
					</div>

					<!-- Task List -->
					<hr class="opacity-50" />
					<div class="space-y-4">
						<div class="flex justify-between items-center">
							<h5 class="text-lg font-medium">Active Tasks</h5>
							<button 
								class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
								on:click={refreshSwarmTasks}
								disabled={__tasksLoading}
							>
								{#if _tasksLoading}
									<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
								{:else}
									<span>🔄</span>
								{/if}
								<span>Refresh</span>
							</button>
						</div>

						<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
							<!-- Task List -->
							<div>
								{#if _tasksLoading}
									<div class="space-y-3">
										{#each Array(3) as _}
											<div class="card gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 animate-pulse">
												<div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
												<div class="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
											</div>
										{/each}
									</div>
								{:else if _tasksError}
									<div class="text-center text-red-600 dark:text-red-400 py-8">
										<p class="text-sm">❌ {_tasksError}</p>
										<button on:click={refreshSwarmTasks} class="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors mt-2">Retry</button>
									</div>
								{:else if swarmTasks.length > 0}
									<div class="space-y-2">
										{#each swarmTasks as task}
											<button 
												class="card gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 w-full text-left hover:bg-blue-50 dark:hover:bg-blue-800/20 transition-colors"
												on:click={() => loadTaskDetails(task.id)}
											>
												<div class="flex justify-between items-start mb-2">
													<h6 class="font-medium text-sm">{task.id}</h6>
													<span class="bg-{_getStatusColor(task.status)}-100 dark:bg-{_getStatusColor(task.status)}-900 text-{_getStatusColor(task.status)}-800 dark:text-{_getStatusColor(task.status)}-200 px-2 py-1 rounded text-xs">
														{task.status}
													</span>
												</div>
												<p class="text-xs opacity-75 line-clamp-2">
													{task.description || task.task || 'No description'}
												</p>
												{#if task.progress !== undefined}
													<div class="mt-2">
														<div class="progress-bar">
															<div class="progress-fill bg-blue-500" style="width: {task.progress}%"></div>
														</div>
													</div>
												{/if}
											</button>
										{/each}
									</div>
								{:else}
									<div class="text-center py-8">
										<p class="text-sm opacity-75">No active tasks found</p>
										<p class="text-xs opacity-50">Create a task to get started</p>
									</div>
								{/if}
							</div>

							<!-- Task Details -->
							<div>
								<h6 class="text-sm font-medium mb-2">Task Details</h6>
								<div class="card gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
									{#if _taskDetailsLoading}
										<div class="text-center py-8">
											<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
											<p class="text-sm opacity-75">Loading task details...</p>
										</div>
									{:else if _taskDetailsError}
										<div class="text-center text-red-600 dark:text-red-400 py-8">
											<p class="text-sm">❌ {_taskDetailsError}</p>
										</div>
									{:else if selectedTask}
										<pre class="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto max-h-64 overflow-y-auto">{JSON.stringify(selectedTask, null, 2)}</pre>
									{:else}
										<p class="text-sm opacity-75 text-center py-8">Select a task to view its details</p>
									{/if}
								</div>
							</div>
						</div>
					</div>
				</div>

			{:else if activeTab === 3}
				<!-- Statistics Tab -->
				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<h5 class="text-lg font-medium">Swarm Statistics</h5>
						<button 
							class="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors" 
							on:click={refreshSwarmStats}
							disabled={_statsLoading}
						>
							{#if _statsLoading}
								<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
							{:else}
								<span>📊</span>
							{/if}
							<span>Load Stats</span>
						</button>
					</div>

					<div class="card gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
						{#if _statsLoading}
							<div class="text-center py-12">
								<div class="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
								<p class="text-sm opacity-75">Loading swarm statistics...</p>
							</div>
						{:else if _statsError}
							<div class="text-center text-red-600 dark:text-red-400 py-8">
								<p class="text-sm">❌ {_statsError}</p>
								<button on:click={refreshSwarmStats} class="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm hover:bg-red-200 dark:hover:bg-red-700 transition-colors mt-2">Retry</button>
							</div>
						{:else if swarmStats}
							<pre class="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto max-h-96 overflow-y-auto">{JSON.stringify(swarmStats, null, 2)}</pre>
						{:else}
							<p class="text-sm opacity-75 text-center py-8">Click "Load Stats" to retrieve swarm performance statistics</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</section>
</div>

<style lang="postcss">
	.progress-bar {
		@apply w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden;
	}
	.progress-fill {
		@apply h-full rounded-full transition-all duration-500;
	}
</style>