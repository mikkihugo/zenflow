<script lang="ts">
  import { onMount } from 'svelte';
  import { toast } from '@zerodevx/svelte-toast';
  
  interface EventCatalogEntry {
    name: string;
    type: string;
    flows: number;
    lastSeen?: Date;
    activeModules: string[];
    category: string;
  }
  
  interface EventFlow {
    id: string;
    eventName: string;
    source: string;
    target: string;
    payload?: any;
    timestamp: Date;
    latency: number;
    success: boolean;
  }
  
  // Component state
  let eventCatalog: EventCatalogEntry[] = [];
  let filteredEvents: EventCatalogEntry[] = [];
  let selectedEvent: EventCatalogEntry | null = null;
  let selectedEventFlows: EventFlow[] = [];
  let searchTerm = '';
  let selectedCategory = 'all';
  let selectedStatus = 'all';
  let showPayload = false;
  
  // Available categories
  const categories = ['all', 'sparc', 'llm', 'claude-code', 'teamwork', 'safe', 'git', 'dspy', 'brain', 'registry', 'system'];
  
  onMount(async () => {
    try {
      await loadEventCatalog();
      toast.push('Event catalog loaded', { theme: { '--toastColor': 'mintcream', '--toastBackground': 'rgba(34, 197, 94, 0.9)' } });
    } catch (error) {
      console.error('Failed to load event catalog:', error);
      toast.push('Failed to load event catalog', { theme: { '--toastColor': 'white', '--toastBackground': 'rgba(239, 68, 68, 0.9)' } });
    }
  });
  
  async function loadEventCatalog() {
    // Mock data - in real implementation this would fetch from the dynamic registry API
    eventCatalog = [
      // SPARC Events
      {
        name: 'sparc:phase-review-needed',
        type: 'SPARCPhaseReviewEvent',
        flows: 45,
        lastSeen: new Date(Date.now() - 30000),
        activeModules: ['SPARC Manager'],
        category: 'sparc'
      },
      {
        name: 'sparc:phase-complete',
        type: 'SPARCPhaseCompleteEvent',
        flows: 78,
        lastSeen: new Date(Date.now() - 5000),
        activeModules: ['SPARC Manager'],
        category: 'sparc'
      },
      {
        name: 'sparc:project-complete',
        type: 'SPARCProjectCompleteEvent',
        flows: 12,
        lastSeen: new Date(Date.now() - 120000),
        activeModules: ['SPARC Manager'],
        category: 'sparc'
      },
      
      // Brain Events
      {
        name: 'brain:predict-request',
        type: 'BrainPredictionRequest',
        flows: 34,
        lastSeen: new Date(Date.now() - 2000),
        activeModules: ['Brain System'],
        category: 'brain'
      },
      {
        name: 'brain:prediction-complete',
        type: 'BrainPredictionResult',
        flows: 32,
        lastSeen: new Date(Date.now() - 1500),
        activeModules: ['Brain System'],
        category: 'brain'
      },
      
      // DSPy Events
      {
        name: 'dspy:optimize-request',
        type: 'DspyOptimizationRequest',
        flows: 18,
        lastSeen: new Date(Date.now() - 8000),
        activeModules: ['DSPy Engine'],
        category: 'dspy'
      },
      {
        name: 'dspy:optimization-complete',
        type: 'DspyOptimizationResult',
        flows: 16,
        lastSeen: new Date(Date.now() - 7000),
        activeModules: ['DSPy Engine'],
        category: 'dspy'
      },
      {
        name: 'dspy:llm-request',
        type: 'DspyLlmRequest',
        flows: 67,
        lastSeen: new Date(Date.now() - 3000),
        activeModules: ['DSPy Engine'],
        category: 'dspy'
      },
      
      // LLM Events
      {
        name: 'llm:inference-request',
        type: 'LLMInferenceRequestEvent',
        flows: 234,
        lastSeen: new Date(Date.now() - 500),
        activeModules: ['LLM Provider'],
        category: 'llm'
      },
      {
        name: 'llm:inference-complete',
        type: 'LLMInferenceCompleteEvent',
        flows: 218,
        lastSeen: new Date(Date.now() - 1000),
        activeModules: ['LLM Provider'],
        category: 'llm'
      },
      {
        name: 'llm:inference-failed',
        type: 'LLMInferenceFailedEvent',
        flows: 16,
        lastSeen: new Date(Date.now() - 15000),
        activeModules: ['LLM Provider'],
        category: 'llm'
      },
      
      // Claude Code Events
      {
        name: 'claude-code:execute-task',
        type: 'ClaudeCodeExecuteTaskEvent',
        flows: 45,
        lastSeen: new Date(Date.now() - 2500),
        activeModules: ['Claude Code'],
        category: 'claude-code'
      },
      {
        name: 'claude-code:task-complete',
        type: 'ClaudeCodeTaskCompleteEvent',
        flows: 42,
        lastSeen: new Date(Date.now() - 3500),
        activeModules: ['Claude Code'],
        category: 'claude-code'
      },
      
      // Teamwork Events
      {
        name: 'teamwork:review-acknowledged',
        type: 'TeamworkReviewAcknowledgedEvent',
        flows: 8,
        lastSeen: new Date(Date.now() - 45000),
        activeModules: ['Teamwork Manager'],
        category: 'teamwork'
      },
      
      // Registry Events
      {
        name: 'registry:module-registered',
        type: 'ActiveModule',
        flows: 12,
        lastSeen: new Date(Date.now() - 60000),
        activeModules: ['Dynamic Registry'],
        category: 'registry'
      },
      {
        name: 'registry:heartbeat',
        type: 'BaseEvent',
        flows: 456,
        lastSeen: new Date(Date.now() - 100),
        activeModules: ['Dynamic Registry'],
        category: 'registry'
      },
      
      // System Events
      {
        name: 'system:error',
        type: 'SystemErrorEvent',
        flows: 7,
        lastSeen: new Date(Date.now() - 30000),
        activeModules: ['System Monitor'],
        category: 'system'
      }
    ];
    
    filterEvents();
  }
  
  function filterEvents() {
    filteredEvents = eventCatalog.filter(event => {
      const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      
      let matchesStatus = true;
      if (selectedStatus === 'active') {
        matchesStatus = event.lastSeen ? (Date.now() - event.lastSeen.getTime()) < 60000 : false;
      } else if (selectedStatus === 'inactive') {
        matchesStatus = event.lastSeen ? (Date.now() - event.lastSeen.getTime()) >= 60000 : true;
      }
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }
  
  async function selectEvent(event: EventCatalogEntry) {
    selectedEvent = event;
    await loadEventFlows(event.name);
  }
  
  async function loadEventFlows(eventName: string) {
    // Mock event flows data
    const mockFlows: EventFlow[] = [];
    const flowCount = Math.min(10, Math.floor(Math.random() * 15) + 5);
    
    for (let i = 0; i < flowCount; i++) {
      mockFlows.push({
        id: `flow-${eventName}-${i}`,
        eventName,
        source: getRandomSource(eventName),
        target: getRandomTarget(eventName),
        payload: generateMockPayload(eventName),
        timestamp: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
        latency: Math.random() * 1000 + 50,
        success: Math.random() > 0.1
      });
    }
    
    selectedEventFlows = mockFlows.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  function getRandomSource(eventName: string): string {
    const category = eventName.split(':')[0];
    const sources: Record<string, string[]> = {
      'sparc': ['SPARC Manager', 'Phase Controller'],
      'brain': ['Brain System', 'Neural Coordinator'],
      'dspy': ['DSPy Engine', 'Optimization Service'],
      'llm': ['LLM Provider', 'Model Router'],
      'claude-code': ['Claude Code', 'Task Manager'],
      'teamwork': ['Teamwork Manager', 'Agent Coordinator'],
      'registry': ['Dynamic Registry', 'Module Manager'],
      'system': ['System Monitor', 'Health Checker']
    };
    
    const categoryMods = sources[category] || ['Unknown Module'];
    return categoryMods[Math.floor(Math.random() * categoryMods.length)];
  }
  
  function getRandomTarget(eventName: string): string {
    const targets = ['System', 'Event Bus', 'Message Queue', 'Handler', 'Processor'];
    return targets[Math.floor(Math.random() * targets.length)];
  }
  
  function generateMockPayload(eventName: string): any {
    const category = eventName.split(':')[0];
    const payloads: Record<string, any> = {
      'sparc': {
        projectId: 'proj-' + Math.random().toString(36).substr(2, 9),
        phase: ['specification', 'pseudocode', 'architecture', 'refinement', 'completion'][Math.floor(Math.random() * 5)],
        artifacts: ['spec.md', 'pseudocode.txt', 'architecture.json']
      },
      'brain': {
        requestId: 'req-' + Math.random().toString(36).substr(2, 9),
        domain: 'sparc-optimization',
        targetMetrics: ['maxTokens', 'temperature', 'timeout']
      },
      'dspy': {
        requestId: 'dspy-' + Math.random().toString(36).substr(2, 9),
        domain: 'prompt-optimization',
        basePrompt: 'Analyze the following requirements...'
      },
      'llm': {
        requestId: 'llm-' + Math.random().toString(36).substr(2, 9),
        provider: ['claude', 'gemini', 'gpt'][Math.floor(Math.random() * 3)],
        tokens: Math.floor(Math.random() * 2000) + 100
      }
    };
    
    return payloads[category] || { data: 'Generic event data' };
  }
  
  function formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleTimeString();
  }
  
  function formatLatency(latency: number): string {
    return `${Math.round(latency)}ms`;
  }
  
  function formatLastSeen(lastSeen?: Date): string {
    if (!lastSeen) return 'Never';
    const diff = Date.now() - lastSeen.getTime();
    if (diff < 10000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  }
  
  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      'sparc': 'bg-blue-100 text-blue-800',
      'brain': 'bg-purple-100 text-purple-800',
      'dspy': 'bg-yellow-100 text-yellow-800',
      'llm': 'bg-green-100 text-green-800',
      'claude-code': 'bg-indigo-100 text-indigo-800',
      'teamwork': 'bg-pink-100 text-pink-800',
      'registry': 'bg-gray-100 text-gray-800',
      'system': 'bg-red-100 text-red-800'
    };
    
    return colors[category] || 'bg-gray-100 text-gray-800';
  }
  
  // Reactive filtering
  $: {
    filterEvents();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h2 class="text-2xl font-bold text-gray-900">Event Explorer</h2>
    <p class="text-gray-600">Browse and analyze events in the system catalog</p>
  </div>

  <!-- Filters -->
  <div class="bg-white p-6 rounded-lg shadow border">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search -->
      <div>
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Search Events</label>
        <input
          id="search"
          type="text"
          bind:value={searchTerm}
          placeholder="Search by name or type..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <!-- Category Filter -->
      <div>
        <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          id="category"
          bind:value={selectedCategory}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          {#each categories as category}
            <option value={category}>{category === 'all' ? 'All Categories' : category.toUpperCase()}</option>
          {/each}
        </select>
      </div>
      
      <!-- Status Filter -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Activity</label>
        <select
          id="status"
          bind:value={selectedStatus}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Events</option>
          <option value="active">Active (&lt; 1min ago)</option>
          <option value="inactive">Inactive (&gt; 1min ago)</option>
        </select>
      </div>
      
      <!-- Payload Toggle -->
      <div>
        <fieldset>
          <legend class="block text-sm font-medium text-gray-700 mb-1">Display Options</legend>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={showPayload}
              class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span class="ml-2 text-sm text-gray-700">Show Payloads</span>
          </label>
        </fieldset>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Event Catalog -->
    <div class="bg-white rounded-lg shadow border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">Event Catalog ({filteredEvents.length})</h3>
        <p class="text-sm text-gray-600">Click an event to view recent flows</p>
      </div>
      
      <div class="max-h-96 overflow-y-auto">
        {#each filteredEvents as event (event.name)}
          <div 
            class="p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors {selectedEvent?.name === event.name ? 'bg-blue-50 border-blue-200' : ''}"
            role="button"
            tabindex="0"
            on:click={() => selectEvent(event)}
            on:keydown={(e) => e.key === 'Enter' || e.key === ' ' ? selectEvent(event) : null}
          >
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-mono text-sm font-semibold text-gray-900">{event.name}</span>
                  <span class="text-xs px-2 py-1 rounded-full {getCategoryColor(event.category)}">{event.category}</span>
                </div>
                <div class="text-xs text-gray-600 mb-2">{event.type}</div>
                <div class="flex items-center gap-4 text-xs text-gray-500">
                  <span>Flows: {event.flows}</span>
                  <span>Modules: {event.activeModules.length}</span>
                  <span>Last: {formatLastSeen(event.lastSeen)}</span>
                </div>
              </div>
              
              <div class="w-3 h-3 rounded-full {event.lastSeen && (Date.now() - event.lastSeen.getTime()) < 60000 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}"></div>
            </div>
          </div>
        {/each}
        
        {#if filteredEvents.length === 0}
          <div class="p-8 text-center">
            <p class="text-gray-500">No events match the current filters</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Event Flows -->
    <div class="bg-white rounded-lg shadow border">
      <div class="p-6 border-b">
        <h3 class="text-lg font-semibold text-gray-900">
          {selectedEvent ? `Flows for ${selectedEvent.name}` : 'Event Flows'}
        </h3>
        <p class="text-sm text-gray-600">
          {selectedEvent ? `Recent activity for ${selectedEvent.name}` : 'Select an event to view flows'}
        </p>
      </div>
      
      <div class="max-h-96 overflow-y-auto">
        {#if selectedEvent && selectedEventFlows.length > 0}
          {#each selectedEventFlows as flow (flow.id)}
            <div class="p-4 border-b">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full {flow.success ? 'bg-green-500' : 'bg-red-500'}"></div>
                  <span class="text-sm font-medium text-gray-900">{flow.source} → {flow.target}</span>
                </div>
                <div class="text-right text-xs text-gray-500">
                  <div>{formatTimestamp(flow.timestamp)}</div>
                  <div>{formatLatency(flow.latency)}</div>
                </div>
              </div>
              
              {#if showPayload && flow.payload}
                <div class="mt-3 p-3 bg-gray-50 rounded text-xs">
                  <div class="font-medium text-gray-700 mb-1">Payload:</div>
                  <pre class="text-gray-600 overflow-x-auto">{JSON.stringify(flow.payload, null, 2)}</pre>
                </div>
              {/if}
            </div>
          {/each}
        {:else if selectedEvent}
          <div class="p-8 text-center">
            <p class="text-gray-500">No recent flows for this event</p>
          </div>
        {:else}
          <div class="p-8 text-center">
            <p class="text-gray-500">Select an event from the catalog to view its flows</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  pre {
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>