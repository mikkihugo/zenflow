<script lang="ts">
import { onDestroy, onMount } from "svelte";
import { apiClient } from "../../lib/api";
import { webSocketManager } from "../../lib/websocket";

// Facade monitoring data
let facadeStatus: any = null;
let systemStatus: any = null;
let _loading = true;
let _error: string | null = null;

// Real-time updates
let updateInterval: NodeJS.Timeout | null = null;
let _connectionState: any = null;

// Mock facade data for demonstration when API is unavailable
const mockFacadeData = {
	overall: "partial",
	facades: {
		foundation: {
			name: "foundation",
			capability: "full",
			healthScore: 95,
			packages: {
				"@claude-zen/foundation": { status: "registered", version: "1.1.1" },
			},
			features: [
				"Core utilities",
				"Logging",
				"Error handling",
				"Type-safe primitives",
			],
			missingPackages: [],
			registeredServices: ["logger", "errorHandler", "typeGuards"],
		},
		infrastructure: {
			name: "infrastructure",
			capability: "partial",
			healthScore: 75,
			packages: {
				"@claude-zen/database": { status: "fallback", version: null },
				"@claude-zen/event-system": { status: "fallback", version: null },
				"@claude-zen/otel-collector": { status: "fallback", version: null },
				"@claude-zen/service-container": { status: "fallback", version: null },
			},
			features: [
				"Database abstraction",
				"Event system",
				"OpenTelemetry",
				"Service container",
			],
			missingPackages: [
				"@claude-zen/database",
				"@claude-zen/event-system",
				"@claude-zen/otel-collector",
			],
			registeredServices: ["fallbackDatabase", "fallbackEvents"],
		},
		intelligence: {
			name: "intelligence",
			capability: "partial",
			healthScore: 60,
			packages: {
				"@claude-zen/brain": { status: "fallback", version: null },
				"@claude-zen/neural-ml": { status: "fallback", version: null },
				"@claude-zen/dspy": { status: "fallback", version: null },
			},
			features: ["Neural coordination", "Brain systems", "DSPy optimization"],
			missingPackages: [
				"@claude-zen/brain",
				"@claude-zen/neural-ml",
				"@claude-zen/dspy",
			],
			registeredServices: ["fallbackBrain"],
		},
		enterprise: {
			name: "enterprise",
			capability: "fallback",
			healthScore: 40,
			packages: {
				"@claude-zen/coordination": { status: "active", version: null },
				"@claude-zen/workflows": { status: "fallback", version: null },
				"@claude-zen/portfolio": { status: "fallback", version: null },
			},
			features: [
				"SAFE framework",
				"Business workflows",
				"Portfolio management",
			],
			missingPackages: [
				// SAFe framework now included in coordination package
				"@claude-zen/workflows",
				"@claude-zen/portfolio",
			],
			registeredServices: ["fallbackWorkflows"],
		},
		operations: {
			name: "operations",
			capability: "partial",
			healthScore: 70,
			packages: {
				"@claude-zen/system-monitoring": { status: "fallback", version: null },
				"@claude-zen/chaos-engineering": { status: "fallback", version: null },
				"@claude-zen/load-balancing": { status: "fallback", version: null },
			},
			features: ["System monitoring", "Chaos engineering", "Load balancing"],
			missingPackages: [
				"@claude-zen/system-monitoring",
				"@claude-zen/chaos-engineering",
			],
			registeredServices: ["fallbackMonitoring"],
		},
		development: {
			name: "development",
			capability: "partial",
			healthScore: 85,
			packages: {
				"@claude-zen/code-analyzer": { status: "fallback", version: null },
				"@claude-zen/git-operations": { status: "fallback", version: null },
				"@claude-zen/architecture": { status: "fallback", version: null },
			},
			features: ["Code analysis", "Git operations", "Architecture validation"],
			missingPackages: [
				"@claude-zen/code-analyzer",
				"@claude-zen/git-operations",
			],
			registeredServices: ["fallbackCodeAnalyzer", "fallbackGitOps"],
		},
	},
	totalPackages: 18,
	availablePackages: 1,
	registeredServices: 8,
	healthScore: 71,
	lastUpdated: Date.now(),
};

onMount(async () => {
	// Subscribe to WebSocket connection state
	webSocketManager.connectionState.subscribe((state) => {
		_connectionState = state;
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
		_loading = true;
		_error = null;

		// Try to load from API first
		try {
			facadeStatus = await apiClient.getFacadeStatus();
			systemStatus = facadeStatus;
		} catch (apiError) {
			console.warn("API unavailable, using mock facade data:", apiError);
			// Use mock data when API is unavailable
			facadeStatus = mockFacadeData;
			systemStatus = mockFacadeData;
		}

		console.log("✅ Loaded facade status:", facadeStatus);
	} catch (err) {
		_error =
			err instanceof Error ? err.message : "Failed to load facade status";
		console.error("❌ Failed to load facade status:", err);

		// Fallback to mock data on error
		facadeStatus = mockFacadeData;
		systemStatus = mockFacadeData;
	} finally {
		_loading = false;
	}
}

function getCapabilityColor(capability: string): string {
	switch (capability) {
		case "full":
			return "green";
		case "partial":
			return "yellow";
		case "fallback":
			return "gray";
		case "disabled":
			return "red";
		default:
			return "gray";
	}
}

function getHealthColor(score: number): string {
	if (score >= 90) return "green";
	if (score >= 70) return "yellow";
	if (score >= 50) return "gray";
	return "red";
}

function getStatusBadge(status: string): string {
	switch (status) {
		case "registered":
			return "✅ Registered";
		case "available":
			return "🟢 Available";
		case "fallback":
			return "🟡 Fallback";
		case "unavailable":
			return "🔴 Missing";
		case "error":
			return "❌ Error";
		default:
			return "❓ Unknown";
	}
}

function formatPackageName(name: string): string {
	return name.replace("@claude-zen/", "");
}

$: overallHealthScore = systemStatus?.healthScore || 0;
$: totalFacades = systemStatus ? Object.keys(systemStatus.facades).length : 0;
$: healthyFacades = systemStatus
	? Object.values(systemStatus.facades).filter((f: any) => f.healthScore >= 80)
			.length
	: 0;
</script>

<svelte:head>
	<title>Facade Monitor - Claude Code Zen</title>
</svelte:head>

<!-- Dashboard Header -->
<div class="mb-8">
	<h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">🏗️ Strategic Facade Monitor</h1>
	<p class="text-gray-600 dark:text-gray-300">Real-time monitoring of strategic facade health and package availability</p>
</div>

<!-- Connection Status -->
{#if _connectionState && !_connectionState.connected}
	<div class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600/50 rounded-lg mb-6">
		<div class="p-4">
			<div class="flex items-center gap-3">
				<span>🔄</span>
				<span class="text-yellow-800 dark:text-yellow-200">Facade monitoring using fallback data (API offline)</span>
			</div>
		</div>
	</div>
{/if}

<!-- System Overview -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
	<!-- Overall Health -->
	<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
		<div class="p-4 border-b border-gray-200 dark:border-gray-700">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">🏥 System Health</h3>
		</div>
		<div class="p-4">
			{#if _loading}
				<div class="animate-pulse text-center">
					<div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-2"></div>
					<div class="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
				</div>
			{:else}
				<div class="text-center">
					<div class="text-2xl font-bold text-{getHealthColor(overallHealthScore)}-600 dark:text-{getHealthColor(overallHealthScore)}-400 mb-1">{overallHealthScore}%</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">Overall Score</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Active Facades -->
	<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
		<div class="p-4 border-b border-gray-200 dark:border-gray-700">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">📦 Active Facades</h3>
		</div>
		<div class="p-4">
			{#if _loading}
				<div class="animate-pulse text-center">
					<div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
					<div class="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
				</div>
			{:else}
				<div class="text-center">
					<div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalFacades}</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">Total Facades</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Package Status -->
	<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
		<div class="p-4 border-b border-gray-200 dark:border-gray-700">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">📊 Package Status</h3>
		</div>
		<div class="p-4">
			{#if _loading}
				<div class="animate-pulse space-y-2">
					<div class="flex justify-between">
						<div class="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
						<div class="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
					</div>
					<div class="flex justify-between">
						<div class="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
						<div class="w-6 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
					</div>
				</div>
			{:else if systemStatus}
				<div class="space-y-2">
					<div class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
						<span>Available</span>
						<span class="font-mono text-gray-900 dark:text-white">{systemStatus.availablePackages}</span>
					</div>
					<div class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
						<span>Total</span>
						<span class="font-mono text-gray-900 dark:text-white">{systemStatus.totalPackages}</span>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Services -->
	<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
		<div class="p-4 border-b border-gray-200 dark:border-gray-700">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">⚙️ Services</h3>
		</div>
		<div class="p-4">
			{#if _loading}
				<div class="animate-pulse text-center">
					<div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2"></div>
					<div class="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
				</div>
			{:else if systemStatus}
				<div class="text-center">
					<div class="text-2xl font-bold text-green-600 dark:text-green-400">{systemStatus.registeredServices}</div>
					<div class="text-sm text-gray-500 dark:text-gray-400">Registered</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Facade Details -->
{#if _loading}
	<div class="space-y-6">
		{#each Array(6) as _, i}
			<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
				<div class="p-4 border-b border-gray-200 dark:border-gray-700">
					<div class="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
				</div>
				<div class="p-4 space-y-4">
					<div class="flex items-center gap-4">
						<div class="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
						<div class="flex-1 space-y-2">
							<div class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
							<div class="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>
{:else if _error}
	<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600/50 rounded-lg">
		<div class="p-8 text-center">
			<h3 class="text-xl font-bold text-red-600 dark:text-red-400 mb-4">❌ Error Loading Facades</h3>
			<p class="text-red-700 dark:text-red-300 mb-4">{_error}</p>
			<button on:click={loadFacadeStatus} class="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-4 py-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-700 transition-colors">
				<span>🔄</span>
				<span>Retry</span>
			</button>
		</div>
	</div>
{:else if facadeStatus}
	<div class="space-y-6">
		{#each Object.entries(facadeStatus.facades) as [facadeName, facade]}
			<div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
				<div class="p-4 border-b border-gray-200 dark:border-gray-700">
					<div class="flex items-center justify-between">
						<h3 class="text-xl font-bold text-blue-600 dark:text-blue-400 capitalize">{facade.name} Facade</h3>
						<div class="flex items-center gap-2">
							<span class="bg-{getCapabilityColor(facade.capability)}-100 dark:bg-{getCapabilityColor(facade.capability)}-900 text-{getCapabilityColor(facade.capability)}-800 dark:text-{getCapabilityColor(facade.capability)}-200 px-2 py-1 rounded text-xs capitalize">
								{facade.capability}
							</span>
							<div class="relative w-10 h-10">
								<div class="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
								<div class="absolute inset-0 rounded-full border-4 border-{getHealthColor(facade.healthScore)}-500 dark:border-{getHealthColor(facade.healthScore)}-400" style="border-right-color: transparent; border-bottom-color: transparent; transform: rotate({(facade.healthScore / 100) * 360}deg);"></div>
								<span class="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-900 dark:text-white">{facade.healthScore}%</span>
							</div>
						</div>
					</div>
				</div>
				<div class="p-4">
					<!-- Facade Summary -->
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div class="text-center">
							<div class="text-xl font-bold text-{getHealthColor(facade.healthScore)}-600 dark:text-{getHealthColor(facade.healthScore)}-400">{facade.healthScore}%</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">Health Score</div>
						</div>
						<div class="text-center">
							<div class="text-xl font-bold text-green-600 dark:text-green-400">{facade.registeredServices.length}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">Services</div>
						</div>
						<div class="text-center">
							<div class="text-xl font-bold text-yellow-600 dark:text-yellow-400">{facade.missingPackages.length}</div>
							<div class="text-sm text-gray-500 dark:text-gray-400">Missing</div>
						</div>
					</div>

					<!-- Features -->
					<div class="mb-6">
						<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">✨ Features</h4>
						<div class="flex flex-wrap gap-2">
							{#each facade.features as feature}
								<span class="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">{feature}</span>
							{/each}
						</div>
					</div>

					<!-- Packages -->
					<div class="mb-6">
						<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">📦 Packages</h4>
						<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
							{#each Object.entries(facade.packages) as [packageName, packageInfo]}
								<div class="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
									<div class="flex items-center justify-between mb-2">
										<span class="text-sm font-medium text-gray-900 dark:text-white">{formatPackageName(packageName)}</span>
										<span class="text-xs text-gray-500 dark:text-gray-400">{getStatusBadge(packageInfo.status)}</span>
									</div>
									{#if packageInfo.version}
										<div class="text-xs text-gray-400 dark:text-gray-500">v{packageInfo.version}</div>
									{/if}
								</div>
							{/each}
						</div>
					</div>

					<!-- Registered Services -->
					{#if facade.registeredServices.length > 0}
						<div class="mb-4">
							<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">⚙️ Registered Services</h4>
							<div class="flex flex-wrap gap-2">
								{#each facade.registeredServices as service}
									<span class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">{service}</span>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Missing Packages -->
					{#if facade.missingPackages.length > 0}
						<div class="mb-4">
							<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">⚠️ Missing Packages</h4>
							<div class="flex flex-wrap gap-2">
								{#each facade.missingPackages as missing}
									<span class="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs">{formatPackageName(missing)}</span>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}

<!-- Refresh Controls -->
<div class="mt-8 text-center">
	<button 
		on:click={loadFacadeStatus} 
		class="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
		disabled={_loading}
	>
		<span>🔄</span>
		<span>{_loading ? 'Refreshing...' : 'Refresh Status'}</span>
	</button>
</div>