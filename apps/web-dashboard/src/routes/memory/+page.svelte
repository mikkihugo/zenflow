<script lang="ts">
	import { onMount } from 'svelte';
	import { ProgressRadial, CodeBlock } from '@skeletonlabs/skeleton';
	import { apiClient } from '../../lib/api';

	// Memory management data
	let memoryHealth: any = null;
	let memoryStores: any[] = [];
	let selectedStore: any = null;
	let storeKeys: string[] = [];
	let selectedKey: string | null = null;
	let keyValue: any = null;

	// Loading and error states
	let healthLoading = true;
	let storesLoading = true;
	let keysLoading = false;
	let valueLoading = false;
	let healthError: string | null = null;
	let storesError: string | null = null;
	let keysError: string | null = null;
	let valueError: string | null = null;

	// Form states
	let newKeyName = '';
	let newKeyValue = '';
	let newKeyTTL = '';
	let keyPattern = '';

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

		window.addEventListener('projectChanged', handleProjectChange as EventListener);

		return () => {
			window.removeEventListener('projectChanged', handleProjectChange as EventListener);
		};
	});

	async function loadMemoryHealth() {
		try {
			healthLoading = true;
			memoryHealth = await apiClient.getMemoryHealth();
			healthError = null;
			console.log('✅ Loaded memory health:', memoryHealth);
		} catch (error) {
			healthError = error instanceof Error ? error.message : 'Failed to load memory health';
			console.error('❌ Failed to load memory health:', error);
		} finally {
			healthLoading = false;
		}
	}

	async function loadMemoryStores() {
		try {
			storesLoading = true;
			memoryStores = await apiClient.getMemoryStores();
			storesError = null;
			console.log('💾 Loaded memory stores:', memoryStores.length);
		} catch (error) {
			storesError = error instanceof Error ? error.message : 'Failed to load memory stores';
			console.error('❌ Failed to load memory stores:', error);
		} finally {
			storesLoading = false;
		}
	}

	async function selectStore(store: any) {
		selectedStore = store;
		selectedKey = null;
		keyValue = null;
		await loadStoreKeys();
	}

	async function loadStoreKeys() {
		if (!selectedStore) return;

		try {
			keysLoading = true;
			const result = await apiClient.getMemoryKeys(selectedStore.id, keyPattern || undefined);
			storeKeys = result.keys || [];
			keysError = null;
			console.log(`🔑 Loaded keys for ${selectedStore.id}:`, storeKeys.length);
		} catch (error) {
			keysError = error instanceof Error ? error.message : 'Failed to load store keys';
			console.error('❌ Failed to load store keys:', error);
		} finally {
			keysLoading = false;
		}
	}

	async function selectKey(key: string) {
		if (!selectedStore) return;

		selectedKey = key;
		try {
			valueLoading = true;
			keyValue = await apiClient.getMemoryValue(selectedStore.id, key);
			valueError = null;
			console.log(`📄 Loaded value for ${key}:`, keyValue);
		} catch (error) {
			valueError = error instanceof Error ? error.message : 'Failed to load key value';
			console.error('❌ Failed to load key value:', error);
		} finally {
			valueLoading = false;
		}
	}

	async function createNewKey() {
		if (!selectedStore || !newKeyName || !newKeyValue) return;

		try {
			const value = JSON.parse(newKeyValue);
			const ttl = newKeyTTL ? parseInt(newKeyTTL) : undefined;
			
			await apiClient.setMemoryValue(selectedStore.id, newKeyName, value, ttl);
			
			// Clear form and reload keys
			newKeyName = '';
			newKeyValue = '';
			newKeyTTL = '';
			await loadStoreKeys();
			
			console.log('✅ Created new key:', newKeyName);
		} catch (error) {
			console.error('❌ Failed to create key:', error);
			alert('Failed to create key: ' + (error instanceof Error ? error.message : String(error)));
		}
	}

	async function deleteKey(key: string) {
		if (!selectedStore || !confirm(`Delete key "${key}"?`)) return;

		try {
			await apiClient.deleteMemoryKey(selectedStore.id, key);
			await loadStoreKeys();
			if (selectedKey === key) {
				selectedKey = null;
				keyValue = null;
			}
			console.log('🗑️ Deleted key:', key);
		} catch (error) {
			console.error('❌ Failed to delete key:', error);
			alert('Failed to delete key: ' + (error instanceof Error ? error.message : String(error)));
		}
	}

	async function refreshData() {
		console.log('🔄 Refreshing memory data...');
		await Promise.all([loadMemoryHealth(), loadMemoryStores()]);
		if (selectedStore) {
			await loadStoreKeys();
		}
	}

	function getStatusColor(status: string): string {
		switch (status?.toLowerCase()) {
			case 'healthy':
			case 'active': return 'success';
			case 'warning': return 'warning';
			case 'error': return 'error';
			default: return 'surface';
		}
	}

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
	}
</script>

<svelte:head>
	<title>Memory Management - Claude Code Zen</title>
</svelte:head>

<!-- Header -->
<div class="mb-8">
	<div class="flex justify-between items-center">
		<div>
			<h1 class="h1 text-primary-500 mb-2">💾 Memory Management</h1>
			<p class="text-surface-600-300-token">Distributed memory stores and key-value operations</p>
		</div>
		<button class="btn variant-filled-primary" on:click={refreshData}>
			<span>🔄</span>
			<span>Refresh</span>
		</button>
	</div>
</div>

<!-- Memory Health Overview -->
<div class="card variant-glass-surface mb-8">
	<header class="card-header">
		<h3 class="h3 text-primary-500">⚡ Memory System Health</h3>
	</header>
	<section class="p-4">
		{#if healthLoading}
			<div class="flex items-center justify-center py-12">
				<div class="flex flex-col items-center gap-4">
					<div class="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
					<p class="text-sm opacity-75">Loading memory health...</p>
				</div>
			</div>
		{:else if healthError}
			<div class="text-center text-error-500 py-8">
				<p class="text-sm">❌ {healthError}</p>
				<button on:click={loadMemoryHealth} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
			</div>
		{:else if memoryHealth}
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
				<!-- Status -->
				<div class="text-center">
					<div class="mb-2">
						<ProgressRadial value={memoryHealth.status === 'healthy' ? 95 : 50} width="w-16" class="text-{getStatusColor(memoryHealth.status)}-500 mx-auto">
							<span class="text-xs font-bold">{memoryHealth.status === 'healthy' ? '95%' : '50%'}</span>
						</ProgressRadial>
					</div>
					<div class="font-medium text-sm">System Status</div>
					<div class="badge variant-soft-{getStatusColor(memoryHealth.status)} text-xs mt-1">{memoryHealth.status}</div>
				</div>

				<!-- Memory Usage -->
				<div class="text-center">
					<div class="text-xl font-bold text-secondary-500 mb-1">
						{formatBytes(memoryHealth.metrics?.totalMemoryUsage || 0)}
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
	<div class="card variant-soft-surface">
		<header class="card-header">
			<h3 class="h4">📦 Memory Stores</h3>
		</header>
		<section class="p-4 max-h-96 overflow-y-auto">
			{#if storesLoading}
				<div class="space-y-3">
					{#each Array(3) as _}
						<div class="card variant-soft-surface p-3 animate-pulse">
							<div class="w-24 h-4 bg-surface-300-600-token rounded mb-2"></div>
							<div class="w-16 h-3 bg-surface-300-600-token rounded"></div>
						</div>
					{/each}
				</div>
			{:else if storesError}
				<div class="text-center text-error-500">
					<p class="text-sm">❌ {storesError}</p>
					<button on:click={loadMemoryStores} class="btn btn-sm variant-ghost-error mt-2">Retry</button>
				</div>
			{:else if memoryStores.length > 0}
				<div class="space-y-2">
					{#each memoryStores as store}
						<button 
							class="btn w-full text-left p-3"
							class:variant-filled-primary={selectedStore?.id === store.id}
							class:variant-soft-surface={selectedStore?.id !== store.id}
							on:click={() => selectStore(store)}
						>
							<div class="flex flex-col gap-1">
								<div class="flex justify-between items-center">
									<span class="font-medium text-sm">{store.id}</span>
									<span class="badge variant-soft-{getStatusColor(store.status)} text-xs">
										{store.status}
									</span>
								</div>
								<div class="flex justify-between text-xs opacity-75">
									<span>{store.type}</span>
									<span>{store.items?.toLocaleString()} keys</span>
								</div>
								<div class="text-xs opacity-75">{formatBytes(store.size || 0)}</div>
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
	<div class="card variant-soft-secondary">
		<header class="card-header">
			<div class="flex justify-between items-center">
				<h3 class="h4">🔑 Keys</h3>
				{#if selectedStore}
					<span class="badge variant-soft-secondary text-xs">{selectedStore.id}</span>
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
							class="input"
							on:input={loadStoreKeys}
						/>
						<button class="btn variant-soft-surface" on:click={loadStoreKeys}>
							🔍
						</button>
					</div>
				</div>

				<!-- Keys List -->
				<div class="max-h-64 overflow-y-auto mb-4">
					{#if keysLoading}
						<div class="space-y-2">
							{#each Array(5) as _}
								<div class="w-full h-8 bg-surface-300-600-token rounded animate-pulse"></div>
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
										class="btn btn-sm flex-1 text-left"
										class:variant-filled-secondary={selectedKey === key}
										class:variant-soft-surface={selectedKey !== key}
										on:click={() => selectKey(key)}
									>
										<span class="text-xs font-mono">{key}</span>
									</button>
									<button 
										class="btn btn-sm variant-ghost-error"
										on:click={() => deleteKey(key)}
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
						class="input text-xs"
					/>
					<textarea
						bind:value={newKeyValue}
						placeholder="{&quot;example&quot;: &quot;JSON value&quot;}"
						class="textarea text-xs"
						rows="3"
					></textarea>
					<input
						type="number"
						bind:value={newKeyTTL}
						placeholder="TTL (seconds, optional)"
						class="input text-xs"
					/>
					<button 
						class="btn btn-sm variant-filled-secondary w-full" 
						on:click={createNewKey}
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
	<div class="card variant-soft-tertiary">
		<header class="card-header">
			<div class="flex justify-between items-center">
				<h3 class="h4">📄 Value</h3>
				{#if selectedKey}
					<span class="badge variant-soft-tertiary text-xs font-mono">{selectedKey}</span>
				{/if}
			</div>
		</header>
		<section class="p-4">
			{#if valueLoading}
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
							<span class="badge variant-soft-{keyValue.exists ? 'success' : 'error'} text-xs ml-2">
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
							<CodeBlock 
								language="json" 
								code={JSON.stringify(keyValue.value, null, 2)}
								class="max-h-64 overflow-y-auto"
							/>
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
		@apply w-full h-2 bg-surface-300-600-token rounded-full overflow-hidden;
	}
	.progress-fill {
		@apply h-full rounded-full transition-all duration-500;
	}
</style>