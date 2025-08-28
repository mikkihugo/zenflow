<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { webSocketManager } from '$lib/websocket';
  
  let agents: Array<any> = [];
  let loading = true;
  let error = '';
  let unsubscribeAgents: (() => void) | null = null;

  onMount(async () => {
    // Connect to real WebSocket data
    setupRealTimeUpdates();
  });

  function setupRealTimeUpdates() {
    // Subscribe to agent updates from WebSocket
    unsubscribeAgents = webSocketManager.agents.subscribe((agentData) => {
      if (agentData && Array.isArray(agentData)) {
        console.log('🤖 Real-time agent data received:', agentData);
        agents = agentData;
        loading = false;
        error = '';
      } else if (agentData) {
        // If single object, wrap in array
        agents = [agentData];
        loading = false;
        error = '';
      }
    });

    // Subscribe to agents channel for real-time updates
    webSocketManager.subscribe('agents');

    // Set initial loading state
    loading = !webSocketManager.isConnected();

    // Listen for connection changes
    webSocketManager.connectionState.subscribe((connectionState) => {
      if (!connectionState.connected) {
        error = 'WebSocket disconnected - showing cached data';
        // Show fallback mock data when disconnected
        if (agents.length === 0) {
          agents = [
            { id: 1, name: 'Coordination Agent', status: 'offline', type: 'Coordination', lastActivity: 'Disconnected', capabilities: ['Planning', 'Task Management'] },
            { id: 2, name: 'Analysis Agent', status: 'offline', type: 'Analysis', lastActivity: 'Disconnected', capabilities: ['Data Processing', 'Insights'] },
            { id: 3, name: 'Processing Agent', status: 'offline', type: 'Processing', lastActivity: 'Disconnected', capabilities: ['File Processing', 'Automation'] }
          ];
        }
        loading = false;
      } else {
        error = '';
      }
    });
  }

  onDestroy(() => {
    if (unsubscribeAgents) unsubscribeAgents();
    webSocketManager.unsubscribe('agents');
  });
</script>

<div class="max-w-7xl mx-auto">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900">🤖 Agents Dashboard</h1>
    <p class="mt-2 text-lg text-gray-600">Monitor and manage AI agent coordination</p>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <span class="ml-3 text-gray-600">Loading agents...</span>
    </div>
  {:else if error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading agents</h3>
          <p class="mt-1 text-sm text-red-700">{error}</p>
        </div>
      </div>
    </div>
  {:else}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Agents Overview -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Agent Status Overview</h2>
        {#if agents.length > 0}
          <div class="space-y-4">
            {#each agents as agent, index}
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                  <div class="w-3 h-3 {agent.status === 'active' ? 'bg-green-400' : agent.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'} rounded-full mr-3"></div>
                  <span class="font-medium">{agent.name || `Agent ${index + 1}`}</span>
                </div>
                <div class="text-sm text-gray-600">
                  Status: {agent.status || 'offline'}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-gray-500">
            <div class="text-4xl mb-4">🤖</div>
            <p>No agents currently active</p>
            <p class="text-sm mt-2">Agents will appear here when coordination begins</p>
          </div>
        {/if}
      </div>

      <!-- Agent Coordination Stats -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Coordination Metrics</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl font-bold text-blue-600">{agents.length}</div>
            <div class="text-sm text-gray-600">Active Agents</div>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <div class="text-2xl font-bold text-green-600">0</div>
            <div class="text-sm text-gray-600">Tasks Completed</div>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl font-bold text-yellow-600">0</div>
            <div class="text-sm text-gray-600">In Progress</div>
          </div>
          <div class="text-center p-4 bg-purple-50 rounded-lg">
            <div class="text-2xl font-bold text-purple-600">100%</div>
            <div class="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Agent Information -->
    {#if agents.length > 0}
      <div class="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Agent Details</h2>
        </div>
        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each agents as agent, index}
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-2 h-2 {agent.status === 'active' ? 'bg-green-400' : agent.status === 'busy' ? 'bg-yellow-400' : 'bg-gray-400'} rounded-full mr-3"></div>
                        <div class="text-sm font-medium text-gray-900">{agent.name || `Agent ${index + 1}`}</div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {agent.status === 'active' ? 'bg-green-100 text-green-800' : agent.status === 'busy' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}">
                        {agent.status || 'offline'}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.type || 'Unknown'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {agent.lastActivity || 'Never'}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>