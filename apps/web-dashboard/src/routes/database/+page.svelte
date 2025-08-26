<script lang="ts">
import { onMount } from "svelte";
import { apiClient } from "../../lib/api";

// Database management data
let databaseStatus: any = null;
let databaseSchema: any = null;
let databaseAnalytics: any = null;
let queryResult: any = null;
let commandResult: any = null;

// Loading states
let _statusLoading = true;
let _schemaLoading = false;
let _analyticsLoading = false;
let _queryLoading = false;
let _commandLoading = false;

// Error states
let _statusError: string | null = null;
let _schemaError: string | null = null;
let _analyticsError: string | null = null;
let _queryError: string | null = null;
let _commandError: string | null = null;

// Form states
let activeTab = 0;
let querySQL =
	"SELECT COUNT(*) as total_records FROM information_schema.tables;";
let queryParams = "[]";
let commandSQL = "";
let commandParams = "[]";

// Pre-defined queries
const _sampleQueries = [
	{
		name: "Table Count",
		sql: "SELECT COUNT(*) as total_records FROM information_schema.tables;",
		params: "[]",
	},
	{
		name: "Database Size",
		sql: "SELECT pg_size_pretty(pg_database_size(current_database())) as database_size;",
		params: "[]",
	},
	{
		name: "Table Sizes",
		sql: `SELECT 
				schemaname,
				tablename,
				pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
			FROM pg_tables 
			ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC 
			LIMIT 10;`,
		params: "[]",
	},
];

onMount(async () => {
	await loadDatabaseStatus();

	// Listen for project changes
	const handleProjectChange = async () => {
		await loadDatabaseStatus();
		// Clear cached data when project changes
		databaseSchema = null;
		databaseAnalytics = null;
		queryResult = null;
		commandResult = null;
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

async function loadDatabaseStatus() {
	try {
		_statusLoading = true;
		databaseStatus = await apiClient.getDatabaseStatus();
		_statusError = null;
		console.log("✅ Loaded database status:", databaseStatus);
	} catch (error) {
		_statusError =
			error instanceof Error ? error.message : "Failed to load database status";
		console.error("❌ Failed to load database status:", error);
	} finally {
		_statusLoading = false;
	}
}

async function _loadDatabaseSchema() {
	try {
		_schemaLoading = true;
		databaseSchema = await apiClient.getDatabaseSchema();
		_schemaError = null;
		console.log("📋 Loaded database schema:", databaseSchema);
	} catch (error) {
		_schemaError =
			error instanceof Error ? error.message : "Failed to load database schema";
		console.error("❌ Failed to load database schema:", error);
	} finally {
		_schemaLoading = false;
	}
}

async function _loadDatabaseAnalytics() {
	try {
		_analyticsLoading = true;
		databaseAnalytics = await apiClient.getDatabaseAnalytics();
		_analyticsError = null;
		console.log("📊 Loaded database analytics:", databaseAnalytics);
	} catch (error) {
		_analyticsError =
			error instanceof Error
				? error.message
				: "Failed to load database analytics";
		console.error("❌ Failed to load database analytics:", error);
	} finally {
		_analyticsLoading = false;
	}
}

async function _executeQuery() {
	try {
		_queryLoading = true;
		_queryError = null;

		let params = [];
		try {
			params = JSON.parse(queryParams);
		} catch (_e) {
			params = [];
		}

		queryResult = await apiClient.executeQuery({
			sql: querySQL,
			params,
		});
		console.log("🔍 Query executed:", queryResult);
	} catch (error) {
		_queryError =
			error instanceof Error ? error.message : "Failed to execute query";
		console.error("❌ Query execution failed:", error);
	} finally {
		_queryLoading = false;
	}
}

async function _executeCommand() {
	try {
		_commandLoading = true;
		_commandError = null;

		let params = [];
		try {
			params = JSON.parse(commandParams);
		} catch (_e) {
			params = [];
		}

		commandResult = await apiClient.executeCommand({
			sql: commandSQL,
			params,
		});
		console.log("⚡ Command executed:", commandResult);
	} catch (error) {
		_commandError =
			error instanceof Error ? error.message : "Failed to execute command";
		console.error("❌ Command execution failed:", error);
	} finally {
		_commandLoading = false;
	}
}

function _loadSampleQuery(query: any) {
	querySQL = query.sql;
	queryParams = query.params;
}

function _getStatusColor(status: string): string {
	switch (status?.toLowerCase()) {
		case "healthy":
		case "connected":
		case "success":
			return "success";
		case "warning":
			return "warning";
		case "error":
		case "failed":
			return "error";
		default:
			return "surface";
	}
}

function _formatDuration(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(2)}s`;
}
</script>

<svelte:head>
	<title>Database Management - Claude Code Zen</title>
</svelte:head>

<!-- Header -->
<div class="mb-8">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="h1 text-primary-500 mb-2">🗃️ Database Management</h1>
			<p class="text-surface-600-300-token">Database operations, schema management, and analytics</p>
		</div>
		<button class="btn variant-filled-primary" on:click={loadDatabaseStatus}>
			<span>🔄</span>
			<span>Refresh</span>
		</button>
	</div>
</div>

<!-- Database Status -->
<div class="card variant-glass-surface mb-8">
	<header class="card-header">
		<h3 class="h3 text-primary-500">⚡ Database Status</h3>
	</header>
	<section class="p-4">
		{#if statusLoading}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4">
					<div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
					<p class="text-sm opacity-75">Loading database status...</p>
				</div>
			</div>
		{:else if statusError}
			<div class="text-center text-error-500 py-8">
				<p class="text-sm">❌ {statusError}</p>
				<button on:click={loadDatabaseStatus} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
			</div>
		{:else if databaseStatus}
			<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
				<!-- Connection Status -->
				<div class="text-center">
					<div class="badge variant-soft-{getStatusColor(databaseStatus.data?.status)} text-lg mb-2">
						{databaseStatus.data?.status || 'Unknown'}
					</div>
					<div class="text-sm font-medium">Connection Status</div>
				</div>

				<!-- Response Time -->
				<div class="text-center">
					<div class="text-2xl font-bold text-secondary-500 mb-1">
						{databaseStatus.data?.responseTime ? formatDuration(databaseStatus.data.responseTime) : 'N/A'}
					</div>
					<div class="text-sm font-medium">Response Time</div>
				</div>

				<!-- Database Type -->
				<div class="text-center">
					<div class="text-lg font-bold text-tertiary-500 mb-1">
						{databaseStatus.data?.type || 'Unknown'}
					</div>
					<div class="text-sm font-medium">Database Type</div>
				</div>

				<!-- Version -->
				<div class="text-center">
					<div class="text-lg font-bold text-warning-500 mb-1">
						{databaseStatus.data?.version || 'Unknown'}
					</div>
					<div class="text-sm font-medium">Version</div>
				</div>
			</div>

			{#if databaseStatus.data?.config}
				<hr class="opacity-50 my-4" />
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<h6 class="text-sm font-medium mb-2">Configuration</h6>
						<CodeBlock language="json" code={JSON.stringify(databaseStatus.data.config, null, 2)} class="max-h-32 overflow-y-auto" />
					</div>
					{#if databaseStatus.data.metadata}
						<div>
							<h6 class="text-sm font-medium mb-2">Metadata</h6>
							<CodeBlock language="json" code={JSON.stringify(databaseStatus.data.metadata, null, 2)} class="max-h-32 overflow-y-auto" />
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</section>
</div>

<!-- Database Operations -->
<div class="card variant-soft-surface">
	<header class="card-header">
		<h3 class="h3 text-primary-500">⚡ Database Operations</h3>
	</header>
	<section class="p-4">
		<TabGroup bind:active={activeTab}>
			<Tab value={0}>🔍 Query</Tab>
			<Tab value={1}>⚡ Commands</Tab>
			<Tab value={2}>📋 Schema</Tab>
			<Tab value={3}>📊 Analytics</Tab>
		</TabGroup>

		<div class="mt-6">
			{#if activeTab === 0}
				<!-- Query Tab -->
				<div class="space-y-4">
					<!-- Sample Queries -->
					<div>
						<h5 class="text-sm font-medium mb-2">Sample Queries</h5>
						<div class="flex flex-wrap gap-2">
							{#each sampleQueries as query}
								<button 
									class="btn btn-sm variant-ghost-surface"
									on:click={() => loadSampleQuery(query)}
								>
									{query.name}
								</button>
							{/each}
						</div>
					</div>

					<!-- Query Form -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div class="space-y-2">
							<label class="label">
								<span>SQL Query</span>
								<textarea
									bind:value={querySQL}
									class="textarea"
									rows="6"
									placeholder="SELECT * FROM table_name;"
								></textarea>
							</label>
							<label class="label">
								<span>Parameters (JSON array)</span>
								<input
									type="text"
									bind:value={queryParams}
									class="input"
									placeholder="[]"
								/>
							</label>
							<button 
								class="btn variant-filled-secondary w-full" 
								on:click={executeQuery}
								disabled={queryLoading || !querySQL}
							>
								{#if queryLoading}
									<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
								{:else}
									<span>🔍</span>
								{/if}
								<span>Execute Query</span>
							</button>
						</div>

						<div>
							<h6 class="text-sm font-medium mb-2">Query Result</h6>
							<div class="card variant-soft-surface p-4 max-h-80 overflow-y-auto">
								{#if queryLoading}
									<div class="text-center py-8">
										<div class="w-8 h-8 border-2 border-secondary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
										<p class="text-sm opacity-75">Executing query...</p>
									</div>
								{:else if queryError}
									<div class="text-error-500">
										<p class="text-sm font-medium">Error:</p>
										<p class="text-xs">{queryError}</p>
									</div>
								{:else if queryResult}
									<CodeBlock language="json" code={JSON.stringify(queryResult, null, 2)} />
								{:else}
									<p class="text-sm opacity-75">Execute a query to see results here</p>
								{/if}
							</div>
						</div>
					</div>
				</div>

			{:else if activeTab === 1}
				<!-- Commands Tab -->
				<div class="space-y-4">
					<div class="alert variant-filled-warning">
						<div class="alert-message">
							<h6 class="font-bold">⚠️ Warning</h6>
							<p class="text-sm">Commands can modify your database. Use with caution!</p>
						</div>
					</div>

					<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<div class="space-y-2">
							<label class="label">
								<span>SQL Command</span>
								<textarea
									bind:value={commandSQL}
									class="textarea"
									rows="6"
									placeholder="INSERT INTO table_name (column1, column2) VALUES (?, ?);"
								></textarea>
							</label>
							<label class="label">
								<span>Parameters (JSON array)</span>
								<input
									type="text"
									bind:value={commandParams}
									class="input"
									placeholder="[]"
								/>
							</label>
							<button 
								class="btn variant-filled-warning w-full" 
								on:click={executeCommand}
								disabled={commandLoading || !commandSQL}
							>
								{#if commandLoading}
									<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
								{:else}
									<span>⚡</span>
								{/if}
								<span>Execute Command</span>
							</button>
						</div>

						<div>
							<h6 class="text-sm font-medium mb-2">Command Result</h6>
							<div class="card variant-soft-surface p-4 max-h-80 overflow-y-auto">
								{#if commandLoading}
									<div class="text-center py-8">
										<div class="w-8 h-8 border-2 border-warning-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
										<p class="text-sm opacity-75">Executing command...</p>
									</div>
								{:else if commandError}
									<div class="text-error-500">
										<p class="text-sm font-medium">Error:</p>
										<p class="text-xs">{commandError}</p>
									</div>
								{:else if commandResult}
									<CodeBlock language="json" code={JSON.stringify(commandResult, null, 2)} />
								{:else}
									<p class="text-sm opacity-75">Execute a command to see results here</p>
								{/if}
							</div>
						</div>
					</div>
				</div>

			{:else if activeTab === 2}
				<!-- Schema Tab -->
				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<h5 class="text-sm font-medium">Database Schema</h5>
						<button 
							class="btn btn-sm variant-ghost-surface" 
							on:click={loadDatabaseSchema}
							disabled={schemaLoading}
						>
							{#if schemaLoading}
								<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
							{:else}
								<span>📋</span>
							{/if}
							<span>Load Schema</span>
						</button>
					</div>

					<div class="card variant-soft-surface p-4">
						{#if schemaLoading}
							<div class="text-center py-12">
								<div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
								<p class="text-sm opacity-75">Loading database schema...</p>
							</div>
						{:else if schemaError}
							<div class="text-center text-error-500 py-8">
								<p class="text-sm">❌ {schemaError}</p>
								<button on:click={loadDatabaseSchema} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
							</div>
						{:else if databaseSchema}
							<CodeBlock 
								language="json" 
								code={JSON.stringify(databaseSchema, null, 2)} 
								class="max-h-96 overflow-y-auto"
							/>
						{:else}
							<p class="text-sm opacity-75 text-center py-8">Click "Load Schema" to retrieve database schema information</p>
						{/if}
					</div>
				</div>

			{:else if activeTab === 3}
				<!-- Analytics Tab -->
				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<h5 class="text-sm font-medium">Database Analytics</h5>
						<button 
							class="btn btn-sm variant-ghost-surface" 
							on:click={loadDatabaseAnalytics}
							disabled={analyticsLoading}
						>
							{#if analyticsLoading}
								<div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
							{:else}
								<span>📊</span>
							{/if}
							<span>Load Analytics</span>
						</button>
					</div>

					<div class="card variant-soft-surface p-4">
						{#if analyticsLoading}
							<div class="text-center py-12">
								<div class="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
								<p class="text-sm opacity-75">Loading database analytics...</p>
							</div>
						{:else if analyticsError}
							<div class="text-center text-error-500 py-8">
								<p class="text-sm">❌ {analyticsError}</p>
								<button on:click={loadDatabaseAnalytics} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
							</div>
						{:else if databaseAnalytics}
							<CodeBlock 
								language="json" 
								code={JSON.stringify(databaseAnalytics, null, 2)} 
								class="max-h-96 overflow-y-auto"
							/>
						{:else}
							<p class="text-sm opacity-75 text-center py-8">Click "Load Analytics" to retrieve database performance and usage analytics</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</section>
</div>