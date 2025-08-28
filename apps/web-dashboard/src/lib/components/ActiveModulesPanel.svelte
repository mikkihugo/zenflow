<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { toast } from '@zerodevx/svelte-toast';
  
  interface ActiveModule {
    id: string;
    name: string;
    type: 'sparc' | 'brain' | 'dspy' | 'teamwork' | 'llm' | 'git' | 'system' | 'safe' | 'claude-code';
    status: 'active' | 'idle' | 'error' | 'disconnected';
    lastSeen: Date;
    eventCount: number;
    events: string[];
    metadata: {
      version?: string;
      description?: string;
      uptime: number;
      memoryUsage?: number;
    };
  }
  
  // Component state
  let activeModules: ActiveModule[] = [];
  let selectedModule: ActiveModule | null = null;
  let updateInterval: ReturnType<typeof setInterval> | null = null;
  let isConnected = false;
  let websocket: WebSocket | null = null;
  
  onMount(async () => {
    try {
      await connectToModuleRegistry();
      startModuleUpdates();
    } catch (error) {
      console.error('Failed to load active modules:', error);
      toast.push('Failed to connect to module registry', { theme: { '--toastColor': 'white', '--toastBackground': 'rgba(239, 68, 68, 0.9)' } });
    }
  });
  
  onDestroy(() => {
    if (updateInterval) {
      clearInterval(updateInterval);
    }
    if (websocket) {
      websocket.close();
    }
  });
  
  async function connectToModuleRegistry() {
    console.log('Connecting to module registry via WebSocket...');
    
    try {
      // Determine WebSocket URL based on current location
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${location.host}/api/events/ws`;
      
      websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('Module registry WebSocket connected');
        isConnected = true;
        
        // Subscribe to module status updates
        websocket?.send(JSON.stringify({
          type: 'subscribe',
          eventTypes: ['module-status', 'module-update', 'module-registry']
        }));
        
        // Request current module list
        websocket?.send(JSON.stringify({
          type: 'request',
          eventType: 'module-list'
        }));
        
        toast.push('Module registry connected', { 
          theme: { '--toastColor': 'mintcream', '--toastBackground': 'rgba(34, 197, 94, 0.9)' } 
        });
      };
      
      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      websocket.onclose = () => {
        console.log('Module registry WebSocket connection closed');
        isConnected = false;
        toast.push('Module registry disconnected', { 
          theme: { '--toastColor': 'white', '--toastBackground': 'rgba(239, 68, 68, 0.9)' } 
        });
        
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
          if (!isConnected) {
            connectToModuleRegistry();
          }
        }, 5000);
      };
      
      websocket.onerror = (error) => {
        console.error('Module registry WebSocket error:', error);
        isConnected = false;
      };
      
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      toast.push('Failed to connect to module registry', { 
        theme: { '--toastColor': 'white', '--toastBackground': 'rgba(239, 68, 68, 0.9)' } 
      });
    }
  }
  
  function handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'module-status':
      case 'module-registry':
        if (Array.isArray(message.data)) {
          activeModules = message.data.map((module: any) => ({
            ...module,
            lastSeen: new Date(module.lastSeen)
          }));
        }
        break;
        
      case 'module-update':
        if (message.data?.id) {
          const moduleUpdate = {
            ...message.data,
            lastSeen: new Date(message.data.lastSeen)
          };
          
          const moduleIndex = activeModules.findIndex(m => m.id === moduleUpdate.id);
          if (moduleIndex !== -1) {
            activeModules[moduleIndex] = moduleUpdate;
            activeModules = [...activeModules]; // Trigger reactivity
          } else {
            activeModules = [...activeModules, moduleUpdate];
          }
        }
        break;
        
      case 'module-list':
        if (Array.isArray(message.data)) {
          activeModules = message.data.map((module: any) => ({
            ...module,
            lastSeen: new Date(module.lastSeen)
          }));
        }
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  function startModuleUpdates() {
    // Request updated module data periodically
    updateInterval = setInterval(() => {
      if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({
          type: 'request',
          eventType: 'module-list'
        }));
      }
    }, 10000); // Request updates every 10 seconds
  }
  
  function getStatusColor(status: ActiveModule['status']): string {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'disconnected': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  }
  
  function getStatusTextColor(status: ActiveModule['status']): string {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'idle': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'disconnected': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  }
  
  function getTypeIcon(type: ActiveModule['type']): string {
    switch (type) {
      case 'sparc': return '🎯';
      case 'brain': return '🧠';
      case 'dspy': return '⚡';
      case 'teamwork': return '👥';
      case 'llm': return '🤖';
      case 'git': return '📦';
      case 'system': return '⚙️';
      case 'safe': return '📊';
      case 'claude-code': return '💻';
      default: return '❓';
    }
  }
  
  function formatUptime(uptime: number): string {
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
  
  function formatLastSeen(lastSeen: Date): string {
    const diff = Date.now() - lastSeen.getTime();
    if (diff < 10000) return 'Just now';
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  }
  
  function selectModule(module: ActiveModule) {
    selectedModule = selectedModule?.id === module.id ? null : module;
  }
  
  function getModulesByStatus(status: ActiveModule['status']) {
    return activeModules.filter(module => module.status === status);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Active Modules</h2>
      <p class="text-gray-600">Real-time status of event-driven system modules</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 rounded-full {isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}"></div>
      <span class="text-sm {isConnected ? 'text-green-600' : 'text-red-600'}">
        {isConnected ? 'Registry Connected' : 'Registry Disconnected'}
      </span>
    </div>
  </div>

  <!-- Status Summary -->
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
        <div>
          <p class="text-sm text-gray-600">Active</p>
          <p class="text-xl font-bold text-green-600">{getModulesByStatus('active').length}</p>
        </div>
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div>
          <p class="text-sm text-gray-600">Idle</p>
          <p class="text-xl font-bold text-yellow-600">{getModulesByStatus('idle').length}</p>
        </div>
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
        <div>
          <p class="text-sm text-gray-600">Error</p>
          <p class="text-xl font-bold text-red-600">{getModulesByStatus('error').length}</p>
        </div>
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 bg-gray-500 rounded-full"></div>
        <div>
          <p class="text-sm text-gray-600">Disconnected</p>
          <p class="text-xl font-bold text-gray-600">{getModulesByStatus('disconnected').length}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Modules List -->
  <div class="bg-white rounded-lg shadow border">
    <div class="p-6 border-b">
      <h3 class="text-lg font-semibold text-gray-900">Module Registry</h3>
      <p class="text-sm text-gray-600">Click on a module to view detailed information</p>
    </div>
    
    <div class="divide-y">
      {#each activeModules as module (module.id)}
        <div 
          class="p-4 cursor-pointer hover:bg-gray-50 transition-colors {selectedModule?.id === module.id ? 'bg-blue-50' : ''}"
          role="button"
          tabindex="0"
          on:click={() => selectModule(module)}
          on:keydown={(e) => e.key === 'Enter' || e.key === ' ' ? selectModule(module) : null}
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-2">
                <span class="text-2xl">{getTypeIcon(module.type)}</span>
                <div class="w-3 h-3 rounded-full {getStatusColor(module.status)} {module.status === 'active' ? 'animate-pulse' : ''}"></div>
              </div>
              
              <div>
                <div class="flex items-center gap-2">
                  <h4 class="font-semibold text-gray-900">{module.name}</h4>
                  <span class="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">{module.type}</span>
                </div>
                <div class="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <span class="{getStatusTextColor(module.status)} font-medium">{module.status.toUpperCase()}</span>
                  <span>Events: {module.eventCount}</span>
                  <span>Last seen: {formatLastSeen(module.lastSeen)}</span>
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <div class="text-sm text-gray-600">v{module.metadata.version || '1.0.0'}</div>
              <div class="text-sm text-gray-500">Uptime: {formatUptime(module.metadata.uptime)}</div>
              {#if module.metadata.memoryUsage !== undefined}
                <div class="text-sm text-gray-500">Memory: {module.metadata.memoryUsage.toFixed(1)}%</div>
              {/if}
            </div>
          </div>
          
          {#if selectedModule?.id === module.id}
            <div class="mt-4 pt-4 border-t bg-gray-50 -mx-4 px-4 rounded-b">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 class="font-semibold text-gray-900 mb-2">Module Information</h5>
                  <div class="space-y-2 text-sm">
                    <div><span class="font-medium">ID:</span> {module.id}</div>
                    <div><span class="font-medium">Description:</span> {module.metadata.description || 'No description available'}</div>
                    <div><span class="font-medium">Type:</span> {module.type}</div>
                    <div><span class="font-medium">Version:</span> {module.metadata.version || '1.0.0'}</div>
                  </div>
                </div>
                
                <div>
                  <h5 class="font-semibold text-gray-900 mb-2">Supported Events ({module.events.length})</h5>
                  <div class="space-y-1">
                    {#each module.events as event}
                      <div class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-mono">{event}</div>
                    {/each}
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      {/each}
      
      {#if activeModules.length === 0}
        <div class="p-8 text-center">
          <p class="text-gray-500">No active modules found</p>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  :global(.animate-pulse) {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>