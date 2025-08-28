<script lang="ts">
  import EventFlowVisualization from '$lib/components/EventFlowVisualization.svelte';
  import ActiveModulesPanel from '$lib/components/ActiveModulesPanel.svelte';
  import EventExplorer from '$lib/components/EventExplorer.svelte';
  import { onMount } from 'svelte';
  import { toast } from '@zerodevx/svelte-toast';
  
  let activeTab = 'overview';
  let isFullscreen = false;
  
  onMount(() => {
    toast.push('Event System Dashboard Loaded', { 
      theme: { 
        '--toastColor': 'mintcream', 
        '--toastBackground': 'rgba(59, 130, 246, 0.9)' 
      } 
    });
  });
  
  function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    if (isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
  
  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'flows', name: 'Event Flows', icon: '🔄' },
    { id: 'modules', name: 'Modules', icon: '🧩' },
    { id: 'explorer', name: 'Explorer', icon: '🔍' }
  ];
</script>

<svelte:head>
  <title>Event System Dashboard - Claude Code Zen</title>
  <meta name="description" content="Real-time event system monitoring and visualization dashboard" />
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <div class="bg-white shadow-sm border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Event System Dashboard</h1>
          <p class="text-sm text-gray-600">Real-time monitoring of event-driven architecture</p>
        </div>
        
        <div class="flex items-center gap-4">
          <button
            on:click={toggleFullscreen}
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? '🗗' : '⛶'}
          </button>
          
          <a href="/" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Navigation Tabs -->
  <div class="bg-white border-b">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav class="flex space-x-8">
        {#each tabs as tab}
          <button
            on:click={() => activeTab = tab.id}
            class="py-4 px-1 border-b-2 font-medium text-sm transition-colors {
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }"
          >
            <span class="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        {/each}
      </nav>
    </div>
  </div>

  <!-- Content -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {#if activeTab === 'overview'}
      <div class="space-y-8">
        <!-- System Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white p-6 rounded-lg shadow border">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span class="text-blue-600 font-semibold">🔄</span>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">Event Flows</div>
                <div class="text-2xl font-bold text-blue-600">3.2k</div>
                <div class="text-xs text-gray-500">Real-time event processing</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow border">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span class="text-green-600 font-semibold">🧩</span>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">Active Modules</div>
                <div class="text-2xl font-bold text-green-600">8</div>
                <div class="text-xs text-gray-500">Event-driven components</div>
              </div>
            </div>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow border">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span class="text-purple-600 font-semibold">📡</span>
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900">Event Types</div>
                <div class="text-2xl font-bold text-purple-600">24</div>
                <div class="text-xs text-gray-500">Registered event catalog</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Overview -->
        <div class="bg-white rounded-lg shadow border">
          <div class="p-6 border-b">
            <h3 class="text-lg font-semibold text-gray-900">Architecture Overview</h3>
            <p class="text-sm text-gray-600">Event-driven coordination system with dynamic discovery</p>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 class="font-semibold text-gray-900 mb-4">System Components</h4>
                <div class="space-y-3">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div class="font-medium text-sm">SPARC Manager</div>
                      <div class="text-xs text-gray-500">5-phase systematic development</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <div>
                      <div class="font-medium text-sm">Brain System</div>
                      <div class="text-xs text-gray-500">Neural ML coordination</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div class="font-medium text-sm">DSPy Engine</div>
                      <div class="text-xs text-gray-500">Prompt optimization</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div class="font-medium text-sm">LLM Provider</div>
                      <div class="text-xs text-gray-500">Multi-model inference</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-900 mb-4">Event Flow Patterns</h4>
                <div class="space-y-2 text-sm">
                  <div class="font-mono text-xs bg-gray-50 p-2 rounded">
                    SPARC → brain:predict-request → Brain System
                  </div>
                  <div class="font-mono text-xs bg-gray-50 p-2 rounded">
                    Brain → dspy:optimize-request → DSPy Engine
                  </div>
                  <div class="font-mono text-xs bg-gray-50 p-2 rounded">
                    DSPy → llm:inference-request → LLM Provider
                  </div>
                  <div class="font-mono text-xs bg-gray-50 p-2 rounded">
                    System → claude-code:execute-task → Claude Code
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    {#if activeTab === 'flows'}
      <EventFlowVisualization />
    {/if}

    {#if activeTab === 'modules'}
      <ActiveModulesPanel />
    {/if}

    {#if activeTab === 'explorer'}
      <EventExplorer />
    {/if}
  </div>
</div>

<style>
  :global(html:fullscreen) {
    background: white;
  }
  
  :global(:fullscreen .max-w-7xl) {
    max-width: 100%;
  }
</style>