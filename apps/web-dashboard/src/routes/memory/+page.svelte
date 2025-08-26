<script lang="ts">
import { onMount } from "svelte";
import { apiClient } from "../../lib/api";

// Memory management data
let memoryHealth: any = null;
let memoryStores: any[] = [];
let selectedStore: any = null;
let storeKeys: string[] = [];
let selectedKey: string | null = null;
let keyValue: any = null;

// Loading and error states
let _healthLoading = true;
let _storesLoading = true;
let _keysLoading = false;
let _valueLoading = false;
let _healthError: string | null = null;
let _storesError: string | null = null;
let _keysError: string | null = null;
let _valueError: string | null = null;

// Form states
let newKeyName = "";
let newKeyValue = "";
let newKeyTTL = "";
let keyPattern = "";

onMount(async () => {
	await Promise.all([loadMemoryHealth(), loadMemoryStores()]);

	// Listen for project changes
	const handleProjectChange = async () => {
		await Promise.all([loadMemoryHealth(), loadMemoryStores()]);
		// Reset selections when project changes
		selectedStore = null;
		selectedKey = null;
		storeKeys = [];
		keyValue = null;
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

async function loadMemoryHealth() {
	try {
		_healthLoading = true;
		memoryHealth = await apiClient.getMemoryHealth();
		_healthError = null;
		console.log("✅ Loaded memory health:", memoryHealth);
	} catch (error) {
		_healthError =
			error instanceof Error ? error.message : "Failed to load memory health";
		console.error("❌ Failed to load memory health:", error);
	} finally {
		_healthLoading = false;
	}
}

async function loadMemoryStores() {
	try {
		_storesLoading = true;
		memoryStores = await apiClient.getMemoryStores();
		_storesError = null;
		console.log("💾 Loaded memory stores:", memoryStores.length);
	} catch (error) {
		_storesError =
			error instanceof Error ? error.message : "Failed to load memory stores";
		console.error("❌ Failed to load memory stores:", error);
	} finally {
		_storesLoading = false;
	}
}

async function _selectStore(store: any) {
	selectedStore = store;
	selectedKey = null;
	keyValue = null;
	await loadStoreKeys();
}

async function loadStoreKeys() {
	if (!selectedStore) return;

	try {
		_keysLoading = true;
		const result = await apiClient.getMemoryKeys(
			selectedStore.id,
			keyPattern || undefined,
		);
		storeKeys = result.keys || [];
		_keysError = null;
		console.log(`🔑 Loaded keys for ${selectedStore.id}:`, storeKeys.length);
	} catch (error) {
		_keysError =
			error instanceof Error ? error.message : "Failed to load store keys";
		console.error("❌ Failed to load store keys:", error);
	} finally {
		_keysLoading = false;
	}
}

async function _selectKey(key: string) {
	if (!selectedStore) return;

	selectedKey = key;
	try {
		_valueLoading = true;
		keyValue = await apiClient.getMemoryValue(selectedStore.id, key);
		_valueError = null;
		console.log(`📄 Loaded value for ${key}:`, keyValue);
	} catch (error) {
		_valueError =
			error instanceof Error ? error.message : "Failed to load key value";
		console.error("❌ Failed to load key value:", error);
	} finally {
		_valueLoading = false;
	}
}

async function _createNewKey() {
	if (!selectedStore || !newKeyName || !newKeyValue) return;

	try {
		const value = JSON.parse(newKeyValue);
		const ttl = newKeyTTL ? parseInt(newKeyTTL, 10) : undefined;

		await apiClient.setMemoryValue(selectedStore.id, newKeyName, value, ttl);

		// Clear form and reload keys
		newKeyName = "";
		newKeyValue = "";
		newKeyTTL = "";
		await loadStoreKeys();

		console.log("✅ Created new key:", newKeyName);
	} catch (error) {
		console.error("❌ Failed to create key:", error);
		alert(
			`Failed to create key: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

async function _deleteKey(key: string) {
	if (!selectedStore || !confirm(`Delete key "${key}"?`)) return;

	try {
		await apiClient.deleteMemoryKey(selectedStore.id, key);
		await loadStoreKeys();
		if (selectedKey === key) {
			selectedKey = null;
			keyValue = null;
		}
		console.log("🗑️ Deleted key:", key);
	} catch (error) {
		console.error("❌ Failed to delete key:", error);
		alert(
			`Failed to delete key: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}

async function _refreshData() {
	console.log("🔄 Refreshing memory data...");
	await Promise.all([loadMemoryHealth(), loadMemoryStores()]);
	if (selectedStore) {
		await loadStoreKeys();
	}
}

function _getStatusColor(status: string): string {
	switch (status?.toLowerCase()) {
		case "healthy":
		case "active":
			return "success";
		case "warning":
			return "warning";
		case "error":
			return "error";
		default:
			return "surface";
	}
}

function _formatBytes(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${Math.round((bytes / k ** i) * 100) / 100} ${sizes[i]}`;
}
</script>

<svelte:head>
	<title>Memory Management - Claude Code Zen</title>
</svelte:head>

<!-- Header -->
<div class="mb-8">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-bold text-primary-600 mb-2">💾 Memory Management</h1>
			<p class="text-gray-600 dark:text-gray-300">Distributed memory stores and key-value operations</p>
		</div>
		<button class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium" on:click={_refreshData}>
			<span>🔄</span>
			<span>Refresh</span>
		</button>
	</div>
</div>

<!-- Memory Health Overview -->
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
	<header class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
		<h3 class="text-xl font-semibold text-primary-600">⚡ Memory System Health</h3>
	</header>
	<section class="p-4">
		{#if _healthLoading}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4">
					<div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
					<p class="text-sm opacity-75">Loading memory health...</p>
				</div>
			</div>
		{:else if healthError}
			<div class="text-center text-error-500 py-8">
				<p class="text-sm">❌ {healthError}</p>
				<button on:click={loadMemoryHealth} class="text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm mt-2">Retry</button>
			</div>
		{:else if memoryHealth}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<!-- Status -->
				<div class="text-center">
					<div class="mb-2">
						<div class="w-16 h-16 mx-auto relative">
							<div class="w-full h-full bg-gray-200 rounded-full"></div>
							<div class="absolute inset-0 flex items-center justify-center">
								<span class="text-xs font-bold">{memoryHealth.status === 'healthy' ? '95%' : '50%'}</span>
							</div>
						</div>
					</div>
					<div class="font-medium text-sm">System Status</div>
					<div class="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 mt-1">{memoryHealth.status}</div>
				</div>

				<!-- Memory Usage -->
				<div class="text-center">
					<div class="text-xl font-bold text-secondary-500 mb-1">
						{_formatBytes(memoryHealth.metrics?.totalMemoryUsage || 0)}
					</div>
					<div class="text-sm opacity-75 mb-2">Memory Usage</div>
					<div class="progress-bar">
						<div class="progress-fill bg-secondary-500" style="width: {(memoryHealth.metrics?.utilizationRate || 0) * 100}%"></div>
					</div>
					<div class="text-xs mt-1">{((memoryHealth.metrics?.utilizationRate || 0) * 100).toFixed(1)}% utilized</div>
				</div>

				<!-- Performance -->
				<div class="text-center">
					<div class="text-xl font-bold text-tertiary-500 mb-1">
						{memoryHealth.performance?.avgResponseTime?.toFixed(1) || 0}ms
					</div>
					<div class="text-sm opacity-75 mb-2">Avg Response Time</div>
					<div class="text-xs">
						{memoryHealth.performance?.throughput?.toLocaleString() || 0} ops/sec
					</div>
				</div>
			</div>
		{/if}
	</section>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
	<!-- Memory Stores -->
	<div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
		<header class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
			<h3 class="text-lg font-medium">📦 Memory Stores</h3>
		</header>
		<section class="p-4 max-h-96 overflow-y-auto">
			{#if _storesLoading}
				<div class="space-y-3">
					{#each Array(3) as _}
						<div class="bg-gray-50 dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 animate-pulse">
							<div class="w-24 h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
							<div class="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
						</div>
					{/each}
				</div>
			{:else if storesError}
				<div class="text-center text-error-500">
					<p class="text-sm">❌ {storesError}</p>
					<button on:click={loadMemoryStores} class="text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm mt-2">Retry</button>
				</div>
			{:else if memoryStores.length > 0}
				<div class="space-y-2">
					{#each memoryStores as store}
						<button 
							class="w-full text-left p-3 rounded-lg border transition-colors"
							class:bg-primary-600={selectedStore?.id === store.id}
							class:text-white={selectedStore?.id === store.id}
							class:border-primary-600={selectedStore?.id === store.id}
							class:bg-gray-50={selectedStore?.id !== store.id}
							class:hover:bg-gray-100={selectedStore?.id !== store.id}
							class:text-gray-800={selectedStore?.id !== store.id}
							class:border-gray-200={selectedStore?.id !== store.id}
							on:click={() => _selectStore(store)}
						>
							<div class="flex flex-col gap-1">
								<div class="flex justify-between items-center">
									<span class="font-medium text-sm">{store.id}</span>
									<span class="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 text-xs">
										{store.status}
									</span>
								</div>
								<div class="flex justify-between text-xs opacity-75">
									<span>{store.type}</span>
									<span>{store.items?.toLocaleString()} keys</span>
								</div>
								<div class="text-xs opacity-75">{_formatBytes(store.size || 0)}</div>
							</div>
						</button>
					{/each}
				</div>
			{:else}
				<div class="text-center py-8">
					<p class="text-sm opacity-75">No memory stores found</p>
				</div>
			{/if}
		</section>
	</div>

	<!-- Store Keys -->
	<div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm border border-blue-200 dark:border-blue-700">
		<header class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
			<div class="flex justify-between items-center">
				<h3 class="text-lg font-medium">🔑 Keys</h3>
				{#if selectedStore}
					<span class="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 text-xs">{selectedStore.id}</span>
				{/if}
			</div>
		</header>
		<section class="p-4">
			{#if selectedStore}
				<!-- Key Pattern Filter -->
				<div class="mb-4">
					<div class="input-group input-group-divider grid-cols-[1fr_auto]">
						<input
							type="text"
							bind:value={keyPattern}
							placeholder="Filter keys by pattern..."
							class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
							on:input={loadStoreKeys}
						/>
						<button class="btn bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200" on:click={loadStoreKeys}>
							🔍
						</button>
					</div>
				</div>

				<!-- Keys List -->
				<div class="max-h-64 overflow-y-auto mb-4">
					{#if _keysLoading}
						<div class="space-y-2">
							{#each Array(5) as _}
								<div class="w-full h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
							{/each}
						</div>
					{:else if keysError}
						<div class="text-center text-error-500">
							<p class="text-sm">❌ {keysError}</p>
						</div>
					{:else if storeKeys.length > 0}
						<div class="space-y-1">
							{#each storeKeys as key}
								<div class="flex items-center gap-2">
									<button 
										class="flex-1 text-left px-3 py-2 rounded border text-sm transition-colors"
										class:bg-blue-600={selectedKey === key}
										class:text-white={selectedKey === key}
										class:border-blue-600={selectedKey === key}
										class:bg-gray-50={selectedKey !== key}
										class:hover:bg-gray-100={selectedKey !== key}
										class:text-gray-800={selectedKey !== key}
										class:border-gray-200={selectedKey !== key}
										on:click={() => _selectKey(key)}
									>
										<span class="text-xs font-mono">{key}</span>
									</button>
									<button 
										class="text-red-600 hover:bg-red-100 px-3 py-1 rounded text-sm"
										on:click={() => _deleteKey(key)}
										title="Delete key"
									>
										🗑️
									</button>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-4">
							<p class="text-sm opacity-75">No keys found</p>
						</div>
					{/if}
				</div>

				<!-- New Key Form -->
				<div class="space-y-2">
					<h5 class="text-sm font-medium">Create New Key</h5>
					<input
						type="text"
						bind:value={newKeyName}
						placeholder="Key name"
						class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
					/>
					<textarea
						bind:value={newKeyValue}
						placeholder="{`{\"example\": \"JSON value\"}`}"
						class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
						rows="3"
					></textarea>
					<input
						type="number"
						bind:value={newKeyTTL}
						placeholder="TTL (seconds, optional)"
						class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-xs"
					/>
					<button 
						class="btn btn-sm bg-blue-600 text-white border-blue-600 w-full" 
						on:click={_createNewKey}
						disabled={!newKeyName || !newKeyValue}
					>
						<span>➕</span>
						<span>Create Key</span>
					</button>
				</div>
			{:else}
				<div class="text-center py-8">
					<p class="text-sm opacity-75">Select a store to view keys</p>
				</div>
			{/if}
		</section>
	</div>

	<!-- Key Value Viewer -->
	<div class="bg-purple-50 dark:bg-purple-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-700">
		<header class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
			<div class="flex justify-between items-center">
				<h3 class="text-lg font-medium">📄 Value</h3>
				{#if selectedKey}
					<span class="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 text-xs font-mono">{selectedKey}</span>
				{/if}
			</div>
		</header>
		<section class="p-4">
			{#if _valueLoading}
				<div class="text-center py-8">
					<div class="w-8 h-8 border-2 border-tertiary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
					<p class="text-sm opacity-75">Loading value...</p>
				</div>
			{:else if valueError}
				<div class="text-center text-error-500 py-8">
					<p class="text-sm">❌ {valueError}</p>
				</div>
			{:else if keyValue}
				<div class="space-y-4">
					<!-- Value Metadata -->
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div>
							<span class="opacity-75">Exists:</span>
							<span class="inline-block px-2 py-1 text-xs rounded-full {keyValue.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs ml-2">
								{keyValue.exists ? 'Yes' : 'No'}
							</span>
						</div>
						{#if keyValue.ttl}
							<div>
								<span class="opacity-75">TTL:</span>
								<span class="font-mono ml-2">{keyValue.ttl}s</span>
							</div>
						{/if}
					</div>

					<!-- Value Content -->
					{#if keyValue.value}
						<div>
							<h6 class="text-sm font-medium mb-2">Content:</h6>
							<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm max-h-64 overflow-y-auto"><code>{JSON.stringify(keyValue.value, null, 2)}</code></pre>
						</div>
					{/if}

					<!-- Timestamps -->
					<div class="text-xs opacity-75">
						<div>Retrieved: {new Date(keyValue.retrieved).toLocaleString()}</div>
					</div>
				</div>
			{:else if selectedKey}
				<div class="text-center py-8">
					<p class="text-sm opacity-75">Loading value...</p>
				</div>
			{:else}
				<div class="text-center py-8">
					<p class="text-sm opacity-75">Select a key to view its value</p>
				</div>
			{/if}
		</section>
	</div>
</div>

<style lang="postcss">
	.progress-bar {
		@apply w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden;
	}
	.progress-fill {
		@apply h-full rounded-full transition-all duration-500;
	}
</style>