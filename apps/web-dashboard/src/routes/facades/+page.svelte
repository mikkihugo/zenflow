<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import { apiClient } from '../../lib/api';
	import { webSocketManager } from '../../lib/websocket';

	// Facade monitoring data
	let facadeStatus: any = null;
	let systemStatus: any = null;
	let loading = true;
	let error: string | null = null;

	// Real-time updates
	let updateInterval: NodeJS.Timeout | null = null;
	let connectionState: any = null;

	// Mock facade data for demonstration when API is unavailable
	const mockFacadeData = {
		overall: 'partial',
		facades: {
			foundation: {
				name: 'foundation',
				capability: 'full',
				healthScore: 95,
				packages: {
					'@claude-zen/foundation': { status: 'registered', version: '1.1.1' }
				},
				features: ['Core utilities', 'Logging', 'Error handling', 'Type-safe primitives'],
				missingPackages: [],
				registeredServices: ['logger', 'errorHandler', 'typeGuards']
			},
			infrastructure: {
				name: 'infrastructure',
				capability: 'partial',
				healthScore: 75,
				packages: {
					'@claude-zen/database': { status: 'fallback', version: null },
					'@claude-zen/event-system': { status: 'fallback', version: null },
					'@claude-zen/otel-collector': { status: 'fallback', version: null },
					'@claude-zen/service-container': { status: 'fallback', version: null }
				},
				features: ['Database abstraction', 'Event system', 'OpenTelemetry', 'Service container'],
				missingPackages: ['@claude-zen/database', '@claude-zen/event-system', '@claude-zen/otel-collector'],
				registeredServices: ['fallbackDatabase', 'fallbackEvents']
			},
			intelligence: {
				name: 'intelligence',
				capability: 'partial',
				healthScore: 60,
				packages: {
					'@claude-zen/brain': { status: 'fallback', version: null },
					'@claude-zen/neural-ml': { status: 'fallback', version: null },
					'@claude-zen/dspy': { status: 'fallback', version: null }
				},
				features: ['Neural coordination', 'Brain systems', 'DSPy optimization'],
				missingPackages: ['@claude-zen/brain', '@claude-zen/neural-ml', '@claude-zen/dspy'],
				registeredServices: ['fallbackBrain']
			},
			enterprise: {
				name: 'enterprise',
				capability: 'fallback',
				healthScore: 40,
				packages: {
					'@claude-zen/safe-framework': { status: 'fallback', version: null },
					'@claude-zen/workflows': { status: 'fallback', version: null },
					'@claude-zen/portfolio': { status: 'fallback', version: null }
				},
				features: ['SAFE framework', 'Business workflows', 'Portfolio management'],
				missingPackages: ['@claude-zen/safe-framework', '@claude-zen/workflows', '@claude-zen/portfolio'],
				registeredServices: ['fallbackWorkflows']
			},
			operations: {
				name: 'operations',
				capability: 'partial',
				healthScore: 70,
				packages: {
					'@claude-zen/system-monitoring': { status: 'fallback', version: null },
					'@claude-zen/chaos-engineering': { status: 'fallback', version: null },
					'@claude-zen/load-balancing': { status: 'fallback', version: null }
				},
				features: ['System monitoring', 'Chaos engineering', 'Load balancing'],
				missingPackages: ['@claude-zen/system-monitoring', '@claude-zen/chaos-engineering'],
				registeredServices: ['fallbackMonitoring']
			},
			development: {
				name: 'development',
				capability: 'partial',
				healthScore: 85,
				packages: {
					'@claude-zen/code-analyzer': { status: 'fallback', version: null },
					'@claude-zen/git-operations': { status: 'fallback', version: null },
					'@claude-zen/architecture': { status: 'fallback', version: null }
				},
				features: ['Code analysis', 'Git operations', 'Architecture validation'],
				missingPackages: ['@claude-zen/code-analyzer', '@claude-zen/git-operations'],
				registeredServices: ['fallbackCodeAnalyzer', 'fallbackGitOps']
			}
		},
		totalPackages: 18,
		availablePackages: 1,
		registeredServices: 8,
		healthScore: 71,
		lastUpdated: Date.now()
	};

	onMount(async () => {
		// Subscribe to WebSocket connection state
		webSocketManager.connectionState.subscribe(state => {
			connectionState = state;
		});

		// Load facade status from API or use mock data
		await loadFacadeStatus();

		// Set up periodic refresh
		updateInterval = setInterval(loadFacadeStatus, 30000); // Every 30 seconds
	});

	onDestroy(() => {
		if (updateInterval) {
			clearInterval(updateInterval);
		}
	});

	async function loadFacadeStatus() {
		try {
			loading = true;
			error = null;

			// Try to load from API first
			try {
				facadeStatus = await apiClient.getFacadeStatus();
				systemStatus = facadeStatus;
			} catch (apiError) {
				console.warn('API unavailable, using mock facade data:', apiError);
				// Use mock data when API is unavailable
				facadeStatus = mockFacadeData;
				systemStatus = mockFacadeData;
			}

			console.log('✅ Loaded facade status:', facadeStatus);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load facade status';
			console.error('❌ Failed to load facade status:', err);
			
			// Fallback to mock data on error
			facadeStatus = mockFacadeData;
			systemStatus = mockFacadeData;
		} finally {
			loading = false;
		}
	}

	function getCapabilityColor(capability: string): string {
		switch (capability) {
			case 'full': return 'success';
			case 'partial': return 'warning';
			case 'fallback': return 'secondary';
			case 'disabled': return 'error';
			default: return 'surface';
		}
	}

	function getHealthColor(score: number): string {
		if (score >= 90) return 'success';
		if (score >= 70) return 'warning';
		if (score >= 50) return 'secondary';
		return 'error';
	}

	function getStatusBadge(status: string): string {
		switch (status) {
			case 'registered': return '✅ Registered';
			case 'available': return '🟢 Available';
			case 'fallback': return '🟡 Fallback';
			case 'unavailable': return '🔴 Missing';
			case 'error': return '❌ Error';
			default: return '❓ Unknown';
		}
	}

	function formatPackageName(name: string): string {
		return name.replace('@claude-zen/', '');
	}

	$: overallHealthScore = systemStatus?.healthScore || 0;
	$: totalFacades = systemStatus ? Object.keys(systemStatus.facades).length : 0;
	$: healthyFacades = systemStatus ? Object.values(systemStatus.facades).filter((f: any) => f.healthScore >= 80).length : 0;
</script>

<svelte:head>
	<title>Facade Monitor - Claude Code Zen</title>
</svelte:head>

<!-- Dashboard Header -->
<div class="mb-8">
	<h1 class="h1 text-primary-500 mb-2">🏗️ Strategic Facade Monitor</h1>
	<p class="text-surface-600-300-token">Real-time monitoring of strategic facade health and package availability</p>
</div>

<!-- Connection Status -->
{#if connectionState && !connectionState.connected}
	<div class="card variant-filled-warning mb-6">
		<section class="p-4">
			<div class="flex items-center gap-3">
				<span>🔄</span>
				<span>Facade monitoring using fallback data (API offline)</span>
			</div>
		</section>
	</div>
{/if}

<!-- System Overview -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
	<!-- Overall Health -->
	<div class="card variant-soft-{getHealthColor(overallHealthScore)}">
		<header class="card-header pb-2">
			<h3 class="h4">🏥 System Health</h3>
		</header>
		<section class="p-4 pt-0">
			{#if loading}
				<div class="animate-pulse text-center">
					<div class="w-16 h-16 bg-surface-300-600-token rounded-full mx-auto mb-2"></div>
					<div class="w-12 h-4 bg-surface-300-600-token rounded mx-auto"></div>
				</div>
			{:else}
				<div class="text-center">
					<ProgressRadial value={overallHealthScore} width="w-16" class="text-{getHealthColor(overallHealthScore)}-500 mx-auto mb-2">
						<span class="text-sm font-bold">{overallHealthScore}%</span>
					</ProgressRadial>
					<div class="text-sm opacity-75">Overall Score</div>
				</div>
			{/if}
		</section>
	</div>

	<!-- Active Facades -->
	<div class="card variant-soft-primary">
		<header class="card-header pb-2">
			<h3 class="h4">📦 Active Facades</h3>
		</header>
		<section class="p-4 pt-0">
			{#if loading}
				<div class="animate-pulse text-center">
					<div class="w-8 h-8 bg-surface-300-600-token rounded mx-auto mb-2"></div>
					<div class="w-12 h-3 bg-surface-300-600-token rounded mx-auto"></div>
				</div>
			{:else}
				<div class="text-center">
					<div class="text-2xl font-bold text-primary-500">{totalFacades}</div>
					<div class="text-sm opacity-75">Total Facades</div>
				</div>
			{/if}
		</section>
	</div>

	<!-- Package Status -->
	<div class="card variant-soft-secondary">
		<header class="card-header pb-2">
			<h3 class="h4">📊 Package Status</h3>
		</header>
		<section class="p-4 pt-0">
			{#if loading}
				<div class="animate-pulse space-y-2">
					<div class="flex justify-between">
						<div class="w-12 h-3 bg-surface-300-600-token rounded"></div>
						<div class="w-8 h-3 bg-surface-300-600-token rounded"></div>
					</div>
					<div class="flex justify-between">
						<div class="w-16 h-3 bg-surface-300-600-token rounded"></div>
						<div class="w-6 h-3 bg-surface-300-600-token rounded"></div>
					</div>
				</div>
			{:else if systemStatus}
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span>Available</span>
						<span class="font-mono">{systemStatus.availablePackages}</span>
					</div>
					<div class="flex justify-between text-sm">
						<span>Total</span>
						<span class="font-mono">{systemStatus.totalPackages}</span>
					</div>
				</div>
			{/if}
		</section>
	</div>

	<!-- Services -->
	<div class="card variant-soft-tertiary">
		<header class="card-header pb-2">
			<h3 class="h4">⚙️ Services</h3>
		</header>
		<section class="p-4 pt-0">
			{#if loading}
				<div class="animate-pulse text-center">
					<div class="w-8 h-8 bg-surface-300-600-token rounded mx-auto mb-2"></div>
					<div class="w-16 h-3 bg-surface-300-600-token rounded mx-auto"></div>
				</div>
			{:else if systemStatus}
				<div class="text-center">
					<div class="text-2xl font-bold text-tertiary-500">{systemStatus.registeredServices}</div>
					<div class="text-sm opacity-75">Registered</div>
				</div>
			{/if}
		</section>
	</div>
</div>

<!-- Facade Details -->
{#if loading}
	<div class="space-y-6">
		{#each Array(6) as _, i}
			<div class="card variant-glass-surface animate-pulse">
				<header class="card-header">
					<div class="w-32 h-6 bg-surface-300-600-token rounded"></div>
				</header>
				<section class="p-4 space-y-4">
					<div class="flex items-center gap-4">
						<div class="w-16 h-16 bg-surface-300-600-token rounded-full"></div>
						<div class="flex-1 space-y-2">
							<div class="w-20 h-4 bg-surface-300-600-token rounded"></div>
							<div class="w-32 h-3 bg-surface-300-600-token rounded"></div>
						</div>
					</div>
				</section>
			</div>
		{/each}
	</div>
{:else if error}
	<div class="card variant-filled-error">
		<section class="p-8 text-center">
			<h3 class="h3 text-error-500 mb-4">❌ Error Loading Facades</h3>
			<p class="mb-4">{error}</p>
			<button on:click={loadFacadeStatus} class="btn variant-ghost-error">
				<span>🔄</span>
				<span>Retry</span>
			</button>
		</section>
	</div>
{:else if facadeStatus}
	<div class="space-y-6">
		{#each Object.entries(facadeStatus.facades) as [facadeName, facade]}
			<div class="card variant-glass-surface">
				<header class="card-header">
					<div class="flex items-center justify-between">
						<h3 class="h3 text-primary-500 capitalize">{facade.name} Facade</h3>
						<div class="flex items-center gap-2">
							<span class="badge variant-soft-{getCapabilityColor(facade.capability)} text-xs capitalize">
								{facade.capability}
							</span>
							<ProgressRadial value={facade.healthScore} width="w-10" class="text-{getHealthColor(facade.healthScore)}-500">
								<span class="text-xs font-bold">{facade.healthScore}%</span>
							</ProgressRadial>
						</div>
					</div>
				</header>
				<section class="p-4">
					<!-- Facade Summary -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div class="text-center">
							<div class="text-xl font-bold text-{getHealthColor(facade.healthScore)}-500">{facade.healthScore}%</div>
							<div class="text-sm opacity-75">Health Score</div>
						</div>
						<div class="text-center">
							<div class="text-xl font-bold text-success-500">{facade.registeredServices.length}</div>
							<div class="text-sm opacity-75">Services</div>
						</div>
						<div class="text-center">
							<div class="text-xl font-bold text-warning-500">{facade.missingPackages.length}</div>
							<div class="text-sm opacity-75">Missing</div>
						</div>
					</div>

					<!-- Features -->
					<div class="mb-6">
						<h4 class="h4 mb-3">✨ Features</h4>
						<div class="flex flex-wrap gap-2">
							{#each facade.features as feature}
								<span class="badge variant-soft-primary text-xs">{feature}</span>
							{/each}
						</div>
					</div>

					<!-- Packages -->
					<div class="mb-6">
						<h4 class="h4 mb-3">📦 Packages</h4>
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{#each Object.entries(facade.packages) as [packageName, packageInfo]}
								<div class="card variant-soft-surface p-3">
									<div class="flex items-center justify-between mb-2">
										<span class="text-sm font-medium">{formatPackageName(packageName)}</span>
										<span class="text-xs opacity-75">{getStatusBadge(packageInfo.status)}</span>
									</div>
									{#if packageInfo.version}
										<div class="text-xs opacity-50">v{packageInfo.version}</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<!-- Registered Services -->
					{#if facade.registeredServices.length > 0}
						<div class="mb-4">
							<h4 class="h4 mb-3">⚙️ Registered Services</h4>
							<div class="flex flex-wrap gap-2">
								{#each facade.registeredServices as service}
									<span class="badge variant-soft-success text-xs">{service}</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Missing Packages -->
					{#if facade.missingPackages.length > 0}
						<div class="mb-4">
							<h4 class="h4 mb-3">⚠️ Missing Packages</h4>
							<div class="flex flex-wrap gap-2">
								{#each facade.missingPackages as missing}
									<span class="badge variant-soft-warning text-xs">{formatPackageName(missing)}</span>
								{/each}
							</div>
						</div>
					{/if}
				</section>
			</div>
		{/each}
	</div>
{/if}

<!-- Refresh Controls -->
<div class="mt-8 text-center">
	<button 
		on:click={loadFacadeStatus} 
		class="btn variant-filled-primary"
		disabled={loading}
	>
		<span>🔄</span>
		<span>{loading ? 'Refreshing...' : 'Refresh Status'}</span>
	</button>
</div>