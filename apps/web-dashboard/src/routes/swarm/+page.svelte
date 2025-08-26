<script lang="ts">
import { onMount } from "svelte";
import { apiClient } from "../../lib/api";

// Swarm management data
let swarmStatus: any = null;
let swarmStats: any = null;
let swarmTasks: any[] = [];
let selectedTask: any = null;

// Loading states
let _statusLoading = true;
let _statsLoading = false;
let _tasksLoading = false;
let _taskDetailsLoading = false;
let _initLoading = false;
let _agentSpawningLoading = false;
let _taskCreationLoading = false;

// Error states
let _statusError: string | null = null;
let _statsError: string | null = null;
let _tasksError: string | null = null;
let _taskDetailsError: string | null = null;
let _initError: string | null = null;
let _agentSpawnError: string | null = null;
let _taskCreationError: string | null = null;

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
	await loadSwarmStatus();

	// Listen for project changes
	const handleProjectChange = async () => {
		await loadSwarmStatus();
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

async function loadSwarmStatus() {
	try {
		_statusLoading = true;
		swarmStatus = await apiClient.getSwarmStatus();
		_statusError = null;
		console.log("🐝 Loaded swarm status:", swarmStatus);
	} catch (error) {
		_statusError =
			error instanceof Error ? error.message : "Failed to load swarm status";
		console.error("❌ Failed to load swarm status:", error);
	} finally {
		_statusLoading = false;
	}
}

async function _loadSwarmStats() {
	try {
		_statsLoading = true;
		swarmStats = await apiClient.getSwarmStats();
		_statsError = null;
		console.log("📊 Loaded swarm stats:", swarmStats);
	} catch (error) {
		_statsError =
			error instanceof Error ? error.message : "Failed to load swarm stats";
		console.error("❌ Failed to load swarm stats:", error);
	} finally {
		_statsLoading = false;
	}
}

async function loadSwarmTasks() {
	try {
		_tasksLoading = true;
		const result = await apiClient.getSwarmTasks();
		swarmTasks = Array.isArray(result?.data)
			? result.data
			: result?.tasks || [];
		_tasksError = null;
		console.log("📋 Loaded swarm tasks:", swarmTasks.length);
	} catch (error) {
		_tasksError =
			error instanceof Error ? error.message : "Failed to load swarm tasks";
		console.error("❌ Failed to load swarm tasks:", error);
	} finally {
		_tasksLoading = false;
	}
}

async function _loadTaskDetails(taskId: string) {
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

async function _initializeSwarm() {
	try {
		_initLoading = true;
		_initError = null;

		const result = await apiClient.initializeAdvancedSwarm({
			topology: swarmTopology,
			maxAgents: swarmMaxAgents,
			strategy: swarmStrategy,
		});

		console.log("✅ Swarm initialized:", result);
		await loadSwarmStatus();

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

async function _spawnAgent() {
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
		await loadSwarmStatus();
	} catch (error) {
		_agentSpawnError =
			error instanceof Error ? error.message : "Failed to spawn agent";
		console.error("❌ Agent spawning failed:", error);
	} finally {
		_agentSpawningLoading = false;
	}
}

async function _orchestrateTask() {
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
		await loadSwarmTasks();
	} catch (error) {
		_taskCreationError =
			error instanceof Error ? error.message : "Failed to orchestrate task";
		console.error("❌ Task orchestration failed:", error);
	} finally {
		_taskCreationLoading = false;
	}
}

async function _shutdownSwarm() {
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
		await loadSwarmStatus();
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

function _formatUptime(seconds: number): string {
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
			<h1 class="h1 text-primary-500 mb-2">🐝 Swarm Management</h1>
			<p class="text-surface-600-300-token">Advanced swarm orchestration, agent management, and task coordination</p>
		</div>
		<div class="flex gap-2">
			<button class="btn variant-filled-primary" on:click={loadSwarmStatus}>
				<span>🔄</span>
				<span>Refresh</span>
			</button>
			<button class="btn variant-filled-error" on:click={shutdownSwarm}>
				<span>🛑</span>
				<span>Shutdown</span>
			</button>
		</div>
	</div>
</div>

<!-- Swarm Status Overview -->
<div class="card variant-glass-surface mb-8">
	<header class="card-header">
		<h3 class="h3 text-primary-500">🐝 Swarm Status</h3>
	</header>
	<section class="p-4">
		{#if statusLoading}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4">
					<div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
					<p class="text-sm opacity-75">Loading swarm status...</p>
				</div>
			</div>
		{:else if statusError}
			<div class="text-center text-error-500 py-8">
				<p class="text-sm">❌ {statusError}</p>
				<button on:click={loadSwarmStatus} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
			</div>
		{:else if swarmStatus}
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
				<!-- Swarm Status -->
				<div class="text-center">
					<div class="mb-2">
						<ProgressRadial 
							value={swarmStatus.data?.status === 'active' ? 95 : swarmStatus.data?.status === 'idle' ? 50 : 25} 
							width="w-16" 
							class="text-{getStatusColor(swarmStatus.data?.status)}-500 mx-auto"
						>
							<span class="text-xs font-bold">
								{swarmStatus.data?.status === 'active' ? '95%' : swarmStatus.data?.status === 'idle' ? '50%' : '25%'}
							</span>
						</ProgressRadial>
					</div>
					<div class="font-medium text-sm">Swarm Status</div>
					<div class="badge variant-soft-{getStatusColor(swarmStatus.data?.status)} text-xs mt-1">
						{swarmStatus.data?.status || 'Unknown'}
					</div>
				</div>

				<!-- Active Agents -->
				<div class="text-center">
					<div class="text-2xl font-bold text-secondary-500 mb-1">
						{swarmStatus.data?.activeAgents || 0}
					</div>
					<div class="text-sm font-medium">Active Agents</div>
					<div class="text-xs opacity-75 mt-1">
						{swarmStatus.data?.totalAgents || 0} total
					</div>
				</div>

				<!-- Active Tasks -->
				<div class="text-center">
					<div class="text-2xl font-bold text-tertiary-500 mb-1">
						{swarmStatus.data?.activeTasks || 0}
					</div>
					<div class="text-sm font-medium">Active Tasks</div>
					<div class="text-xs opacity-75 mt-1">
						{swarmStatus.data?.completedTasks || 0} completed
					</div>
				</div>

				<!-- Uptime -->
				<div class="text-center">
					<div class="text-xl font-bold text-warning-500 mb-1">
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
							<span class="badge variant-soft-surface">{swarmStatus.data.topology}</span>
							<div class="text-xs opacity-75 mt-1">Topology</div>
						</div>
					{/if}
					{#if swarmStatus.data.strategy}
						<div class="text-center">
							<span class="badge variant-soft-surface">{swarmStatus.data.strategy}</span>
							<div class="text-xs opacity-75 mt-1">Strategy</div>
						</div>
					{/if}
					{#if swarmStatus.data.maxAgents}
						<div class="text-center">
							<span class="badge variant-soft-surface">{swarmStatus.data.maxAgents}</span>
							<div class="text-xs opacity-75 mt-1">Max Agents</div>
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</section>
</div>

<!-- Swarm Operations -->
<div class="card variant-soft-surface">
	<header class="card-header">
		<h3 class="h3 text-primary-500">⚡ Swarm Operations</h3>
	</header>
	<section class="p-4">
		<TabGroup bind:active={activeTab}>
			<Tab value={0}>🚀 Initialize</Tab>
			<Tab value={1}>🤖 Spawn Agents</Tab>
			<Tab value={2}>📋 Tasks</Tab>
			<Tab value={3}>📊 Statistics</Tab>
		</TabGroup>

		<div class="mt-6">
			{#if activeTab === 0}
				<!-- Initialize Swarm Tab -->
				<div class="space-y-4">
					<h5 class="text-lg font-medium">Initialize New Swarm</h5>
					
					{#if initError}
						<div class="alert variant-filled-error">
							<div class="alert-message">
								<p>❌ {initError}</p>
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<label class="label">
							<span>Topology</span>
							<select bind:value={swarmTopology} class="select">
								{#each topologies as topology}
									<option value={topology}>{topology}</option>
								{/each}
							</select>
						</label>

						<label class="label">
							<span>Max Agents</span>
							<input
								type="number"
								bind:value={swarmMaxAgents}
								class="input"
								min="1"
								max="100"
							/>
						</label>

						<label class="label">
							<span>Strategy</span>
							<select bind:value={swarmStrategy} class="select">
								{#each strategies as strategy}
									<option value={strategy}>{strategy}</option>
								{/each}
							</select>
						</label>
					</div>

					<button 
						class="btn variant-filled-primary w-full md:w-auto" 
						on:click={initializeSwarm}
						disabled={initLoading}
					>
						{#if initLoading}
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
					
					{#if agentSpawnError}
						<div class="alert variant-filled-error">
							<div class="alert-message">
								<p>❌ {agentSpawnError}</p>
							</div>
						</div>
					{/if}

					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<label class="label">
							<span>Swarm ID *</span>
							<input
								type="text"
								bind:value={agentSwarmId}
								class="input"
								placeholder="swarm-xxx-xxx"
							/>
						</label>

						<label class="label">
							<span>Agent Type</span>
							<select bind:value={agentType} class="select">
								{#each agentTypes as type}
									<option value={type}>{type}</option>
								{/each}
							</select>
						</label>

						<label class="label">
							<span>Agent Name (optional)</span>
							<input
								type="text"
								bind:value={agentName}
								class="input"
								placeholder="Leave empty for auto-generated name"
							/>
						</label>

						<label class="label">
							<span>Capabilities (comma-separated)</span>
							<input
								type="text"
								bind:value={agentCapabilities}
								class="input"
								placeholder="coordination,analysis,planning"
							/>
						</label>
					</div>

					<button 
						class="btn variant-filled-secondary w-full md:w-auto" 
						on:click={spawnAgent}
						disabled={agentSpawningLoading || !agentSwarmId}
					>
						{#if agentSpawningLoading}
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
						
						{#if taskCreationError}
							<div class="alert variant-filled-error">
								<div class="alert-message">
									<p>❌ {taskCreationError}</p>
								</div>
							</div>
						{/if}

						<div class="space-y-3">
							<label class="label">
								<span>Task Description *</span>
								<textarea
									bind:value={taskDescription}
									class="textarea"
									rows="3"
									placeholder="Describe the task to be executed by the swarm..."
								></textarea>
							</label>

							<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
								<label class="label">
									<span>Strategy</span>
									<select bind:value={taskStrategy} class="select">
										{#each strategies as strategy}
											<option value={strategy}>{strategy}</option>
										{/each}
									</select>
								</label>

								<label class="label">
									<span>Priority</span>
									<select bind:value={taskPriority} class="select">
										{#each priorities as priority}
											<option value={priority}>{priority}</option>
										{/each}
									</select>
								</label>

								<label class="label">
									<span>Max Agents</span>
									<input
										type="number"
										bind:value={taskMaxAgents}
										class="input"
										min="1"
										max="20"
									/>
								</label>
							</div>

							<button 
								class="btn variant-filled-tertiary w-full md:w-auto" 
								on:click={orchestrateTask}
								disabled={taskCreationLoading || !taskDescription}
							>
								{#if taskCreationLoading}
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
								class="btn btn-sm variant-ghost-surface" 
								on:click={loadSwarmTasks}
								disabled={tasksLoading}
							>
								{#if tasksLoading}
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
								{#if tasksLoading}
									<div class="space-y-3">
										{#each Array(3) as _}
											<div class="card variant-soft-surface p-4 animate-pulse">
												<div class="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
												<div class="w-24 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
											</div>
										{/each}
									</div>
								{:else if tasksError}
									<div class="text-center text-error-500 py-8">
										<p class="text-sm">❌ {tasksError}</p>
										<button on:click={loadSwarmTasks} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
									</div>
								{:else if swarmTasks.length > 0}
									<div class="space-y-2">
										{#each swarmTasks as task}
											<button 
												class="card variant-soft-surface p-4 w-full text-left hover:variant-soft-primary transition-colors"
												on:click={() => loadTaskDetails(task.id)}
											>
												<div class="flex justify-between items-start mb-2">
													<h6 class="font-medium text-sm">{task.id}</h6>
													<span class="badge variant-soft-{getStatusColor(task.status)} text-xs">
														{task.status}
													</span>
												</div>
												<p class="text-xs opacity-75 line-clamp-2">
													{task.description || task.task || 'No description'}
												</p>
												{#if task.progress !== undefined}
													<div class="mt-2">
														<div class="progress-bar">
															<div class="progress-fill bg-primary-500" style="width: {task.progress}%"></div>
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
								<div class="card variant-soft-surface p-4">
									{#if taskDetailsLoading}
										<div class="text-center py-8">
											<div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
											<p class="text-sm opacity-75">Loading task details...</p>
										</div>
									{:else if taskDetailsError}
										<div class="text-center text-error-500 py-8">
											<p class="text-sm">❌ {taskDetailsError}</p>
										</div>
									{:else if selectedTask}
										<CodeBlock 
											language="json" 
											code={JSON.stringify(selectedTask, null, 2)} 
											class="max-h-64 overflow-y-auto"
										/>
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
							class="btn btn-sm variant-ghost-surface" 
							on:click={loadSwarmStats}
							disabled={statsLoading}
						>
							{#if statsLoading}
								<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
							{:else}
								<span>📊</span>
							{/if}
							<span>Load Stats</span>
						</button>
					</div>

					<div class="card variant-soft-surface p-4">
						{#if statsLoading}
							<div class="text-center py-12">
								<div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
								<p class="text-sm opacity-75">Loading swarm statistics...</p>
							</div>
						{:else if statsError}
							<div class="text-center text-error-500 py-8">
								<p class="text-sm">❌ {statsError}</p>
								<button on:click={loadSwarmStats} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
							</div>
						{:else if swarmStats}
							<CodeBlock 
								language="json" 
								code={JSON.stringify(swarmStats, null, 2)} 
								class="max-h-96 overflow-y-auto"
							/>
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