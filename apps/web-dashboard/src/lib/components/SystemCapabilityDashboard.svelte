<!--
  @component SystemCapabilityDashboard
  
  Displays comprehensive system capability status including facade health,
  package availability, installation suggestions, and real-time monitoring.
  
  Features:
  - Real-time system health monitoring
  - Facade status with detailed breakdowns
  - Installation suggestions with priorities
  - Interactive health score displays
  - Auto-refresh capabilities
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { webSocketManager } from '$lib/websocket';
  
  interface FacadeSummary {
    name: string;
    capability: string;
    healthScore: number;
    packages: string;
    missingPackages: string[];
    features: string[];
  }
  
  interface InstallationSuggestion {
    package: string;
    facade: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
    installCommand: string;
  }
  
  interface SystemCapabilityData {
    overall: string;
    systemHealthScore: number;
    timestamp: string;
    facades: FacadeSummary[];
    totalPackages: number;
    availablePackages: number;
    registeredServices: number;
    installationSuggestions: InstallationSuggestion[];
  }
  
  let capabilityData: SystemCapabilityData | null = null;
  let loading = true;
  let error: string | null = null;
  let autoRefresh = true;
  let unsubscribeSystem: (() => void) | null = null;
  
  // Use existing Socket.IO real-time updates instead of polling!
  function setupRealTimeUpdates() {
    // Subscribe to system status updates from existing WebSocket
    unsubscribeSystem = webSocketManager.systemStatus.subscribe((systemData) => {
      if (systemData) {
        console.log('📊 Real-time system data received:', systemData);
        // Transform the real-time data to match our interface
        capabilityData = transformSystemData(systemData);
        loading = false;
        error = null;
      }
    });

    // Subscribe to the 'system' channel for real-time updates
    webSocketManager.subscribe('system');
    
    // Set initial loading state
    loading = !webSocketManager.isConnected();
    
    // Listen for connection changes
    webSocketManager.connectionState.subscribe((connectionState) => {
      if (!connectionState.connected) {
        error = 'WebSocket disconnected - showing cached data';
      } else {
        error = null;
      }
    });
  }

  // Transform WebSocket system data to match our dashboard interface
  function transformSystemData(systemData: any): SystemCapabilityData {
    // Mock transform since we don't have real backend data structure yet
    return {
      overall: systemData.status || 'partial',
      systemHealthScore: systemData.healthScore || 75,
      timestamp: systemData.timestamp || new Date().toISOString(),
      facades: systemData.facades || [
        {
          name: 'Socket.IO WebSocket',
          capability: 'full',
          healthScore: webSocketManager.isConnected() ? 95 : 0,
          packages: 'socket.io-client',
          missingPackages: [],
          features: ['Real-time Updates', 'Auto-reconnection', 'Health Monitoring']
        }
      ],
      totalPackages: systemData.totalPackages || 50,
      availablePackages: systemData.availablePackages || 45,
      registeredServices: systemData.registeredServices || 12,
      installationSuggestions: systemData.installationSuggestions || []
    };
  }
  
  function toggleAutoRefresh() {
    autoRefresh = !autoRefresh;
    // Socket.IO is always real-time, no need for intervals
    console.log(`Auto-refresh ${autoRefresh ? 'enabled' : 'disabled'} (Socket.IO real-time)`);
  }

  // Manual refresh triggers a ping to get fresh data
  async function fetchCapabilityData() {
    loading = true;
    error = null;
    
    try {
      if (webSocketManager.isConnected()) {
        // Ping the WebSocket to trigger fresh data
        webSocketManager.ping();
        // Resubscribe to ensure we get fresh data
        webSocketManager.subscribe('system');
      } else {
        throw new Error('WebSocket not connected');
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Failed to refresh capability data:', err);
    } finally {
      loading = false;
    }
  }
  
  function getHealthScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
  
  function getCapabilityBadgeColor(capability: string): string {
    switch (capability) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'fallback': return 'bg-orange-100 text-orange-800';
      default: return 'bg-red-100 text-red-800';
    }
  }
  
  function getPriorityBadgeColor(priority: string): string {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }
  
  function getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⭐';
      default: return '💡';
    }
  }
  
  function getOverallStatusIcon(overall: string): string {
    switch (overall) {
      case 'full': return '✅';
      case 'partial': return '⚠️';
      default: return '❌';
    }
  }
  
  onMount(() => {
    setupRealTimeUpdates();
  });
  
  onDestroy(() => {
    if (unsubscribeSystem) unsubscribeSystem();
    // Optionally unsubscribe from the channel
    webSocketManager.unsubscribe('system');
  });
</script>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex justify-between items-center">
    <div>
      <h1 class="text-3xl font-bold text-gray-900">🐝 System Capability Dashboard</h1>
      <p class="text-gray-600">Monitor facade health, package availability, and system status</p>
    </div>
    
    <div class="flex items-center space-x-4">
      <!-- Auto-refresh toggle -->
      <button
        on:click={toggleAutoRefresh}
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <div class="w-2 h-2 mr-2 rounded-full {autoRefresh ? 'bg-green-400' : 'bg-gray-400'}"></div>
        Auto-refresh {autoRefresh ? 'On' : 'Off'}
      </button>
      
      <!-- Manual refresh -->
      <button
        on:click={fetchCapabilityData}
        disabled={loading}
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {#if loading}
          <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Refreshing...
        {:else}
          🔄 Refresh
        {/if}
      </button>
    </div>
  </div>
  
  <!-- Error State -->
  {#if error}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
          <p class="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {/if}
  
  <!-- Loading State -->
  {#if loading && !capabilityData}
    <div class="flex justify-center items-center py-12">
      <div class="text-center">
        <svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="mt-2 text-sm text-gray-500">Loading system capability data...</p>
      </div>
    </div>
  {/if}
  
  <!-- Dashboard Content -->
  {#if capabilityData}
    <!-- Overall Status Card -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <span class="text-2xl">{getOverallStatusIcon(capabilityData.overall)}</span>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Overall System Status</dt>
              <dd class="flex items-baseline">
                <div class="text-2xl font-semibold text-gray-900 capitalize">{capabilityData.overall}</div>
                <div class="ml-2 flex items-baseline text-sm">
                  <span class="{getHealthScoreColor(capabilityData.systemHealthScore)} font-medium">
                    {capabilityData.systemHealthScore}% Health
                  </span>
                </div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div class="bg-gray-50 px-5 py-3">
        <div class="text-sm">
          <div class="grid grid-cols-3 gap-4">
            <div>
              <span class="font-medium text-gray-900">📦 Packages:</span>
              <span class="ml-1">{capabilityData.availablePackages}/{capabilityData.totalPackages}</span>
            </div>
            <div>
              <span class="font-medium text-gray-900">🔧 Services:</span>
              <span class="ml-1">{capabilityData.registeredServices}</span>
            </div>
            <div>
              <span class="font-medium text-gray-900">📅 Updated:</span>
              <span class="ml-1">{new Date(capabilityData.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Facades Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {#each capabilityData.facades as facade}
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-medium text-gray-900 capitalize">{facade.name}</h3>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getCapabilityBadgeColor(facade.capability)}">
                {facade.capability}
              </span>
            </div>
            
            <div class="mt-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-500">Health Score</span>
                <span class="text-sm font-medium {getHealthScoreColor(facade.healthScore)}">{facade.healthScore}%</span>
              </div>
              <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div class="h-2 rounded-full {facade.healthScore >= 80 ? 'bg-green-500' : facade.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}" style="width: {facade.healthScore}%"></div>
              </div>
            </div>
            
            <div class="mt-4 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Packages:</span>
                <span class="font-medium">{facade.packages}</span>
              </div>
              
              {#if facade.missingPackages.length > 0}
                <div class="text-sm">
                  <span class="text-gray-500">Missing:</span>
                  <div class="mt-1 space-y-1">
                    {#each facade.missingPackages as pkg}
                      <div class="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">{pkg}</div>
                    {/each}
                  </div>
                </div>
              {/if}
              
              {#if facade.features.length > 0}
                <div class="text-sm">
                  <span class="text-gray-500">Features:</span>
                  <div class="mt-1 flex flex-wrap gap-1">
                    {#each facade.features.slice(0, 3) as feature}
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {feature}
                      </span>
                    {/each}
                    {#if facade.features.length > 3}
                      <span class="text-xs text-gray-400">+{facade.features.length - 3} more</span>
                    {/if}
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Installation Suggestions -->
    {#if capabilityData.installationSuggestions.length > 0}
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">💡 Installation Suggestions</h3>
          <p class="mt-1 text-sm text-gray-500">Recommended packages to improve system capabilities</p>
          
          <div class="mt-6 space-y-4">
            {#each capabilityData.installationSuggestions.slice(0, 8) as suggestion}
              <div class="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <div class="flex items-center">
                    <span class="text-lg mr-2">{getPriorityIcon(suggestion.priority)}</span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getPriorityBadgeColor(suggestion.priority)}">
                      {suggestion.priority}
                    </span>
                    <span class="ml-2 text-sm font-medium text-gray-900">{suggestion.facade}</span>
                  </div>
                  
                  <p class="mt-1 text-sm text-gray-600">{suggestion.reason}</p>
                  
                  <div class="mt-2">
                    <code class="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100 text-gray-800">
                      {suggestion.installCommand}
                    </code>
                  </div>
                </div>
              </div>
            {/each}
            
            {#if capabilityData.installationSuggestions.length > 8}
              <div class="text-center">
                <span class="text-sm text-gray-500">
                  +{capabilityData.installationSuggestions.length - 8} more suggestions available
                </span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  /* Custom scrollbar for small screens */
  @media (max-width: 640px) {
    .overflow-x-auto::-webkit-scrollbar {
      height: 4px;
    }
    
    .overflow-x-auto::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    
    .overflow-x-auto::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 2px;
    }
  }
</style>