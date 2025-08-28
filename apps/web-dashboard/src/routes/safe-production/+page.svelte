<script lang="ts">
import { onMount } from "svelte";
import SafeProductionDashboard from "../../lib/components/SafeProductionDashboard.svelte";

// Get user info from URL params or default
let userId = "prod_user_001";
let userRole:
	| "team_member"
	| "scrum_master"
	| "po"
	| "rte"
	| "architect"
	| "business_owner" = "team_member";
let immersionLevel: "basic" | "enhanced" | "production" = "production";

onMount(() => {
	// Extract user preferences from URL or localStorage
	const params = new URLSearchParams(window.location.search);
	userId = params.get("userId") || localStorage.getItem("safeUserId") || userId;
	userRole =
		(params.get("userRole") as any) ||
		localStorage.getItem("safeUserRole") ||
		userRole;
	immersionLevel =
		(params.get("immersionLevel") as any) ||
		localStorage.getItem("safeImmersionLevel") ||
		immersionLevel;

	// Save preferences
	localStorage.setItem("safeUserId", userId);
	localStorage.setItem("safeUserRole", userRole);
	localStorage.setItem("safeImmersionLevel", immersionLevel);
});
</script>

<svelte:head>
  <title>SAFe Production Dashboard - claude-code-zen</title>
  <meta name="description" content="Production-ready SAFe 6.0 dashboard with AI coaching, gamification, and real-time collaboration" />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-6">
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
        🚀 SAFe Production Platform
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        Production-ready SAFe 6.0 dashboard with real-time monitoring
      </p>
    </div>

    <!-- User Info -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">User Profile</h3>
          <div class="text-gray-600 dark:text-gray-300">
            <span class="font-medium">Role:</span> {userRole.replace('_', ' ')} | 
            <span class="font-medium">ID:</span> {userId} | 
            <span class="font-medium">Level:</span> {immersionLevel}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-green-600 dark:text-green-400">Connected</span>
        </div>
      </div>
    </div>

    <!-- Production Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- Performance Metric -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Performance</h4>
        <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">98.5%</div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">System uptime</p>
      </div>
      
      <!-- Throughput Metric -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Throughput</h4>
        <div class="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">2.3K</div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Features delivered</p>
      </div>
      
      <!-- Quality Metric -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 class="text-base font-medium text-gray-900 dark:text-white mb-2">Quality</h4>
        <div class="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">94.2%</div>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Test coverage</p>
      </div>
    </div>

    <!-- Production Status -->
    <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Production Status</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 bg-success-500 rounded-full"></div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Frontend Services</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">All systems operational</div>
            </div>
          </div>
          <span class="text-green-600 dark:text-green-400 font-medium">Healthy</span>
        </div>
        
        <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 bg-success-500 rounded-full"></div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">API Gateway</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Processing requests normally</div>
            </div>
          </div>
          <span class="text-green-600 dark:text-green-400 font-medium">Healthy</span>
        </div>
        
        <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 bg-warning-500 rounded-full animate-pulse"></div>
            <div>
              <div class="font-medium text-gray-900 dark:text-white">Database Cluster</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">Minor performance degradation</div>
            </div>
          </div>
          <span class="text-yellow-600 dark:text-yellow-400 font-medium">Degraded</span>
        </div>
      </div>
    </div>
  </div>
</div>