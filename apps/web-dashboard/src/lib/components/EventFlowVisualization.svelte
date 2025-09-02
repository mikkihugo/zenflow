<script lang="ts">
import { clearInterval } from 'timers';
import { onMount, onDestroy } from 'svelte';
import { toast } from '@zerodevx/svelte-toast';
import { eventSystemService, type EventFlow, type EventMetrics, type ActiveModule } from '../services/event-system.service.js';

// Component state
let eventFlows: EventFlow[] = [];
let eventMetrics: EventMetrics = {
  totalEvents: 0,
  eventsPerSecond: 0,
  averageLatency: 0,
  errorRate: 0,
  activeModules: 0,
  systemHealth: 'healthy'
};

let activeModules: ActiveModule[] = [];
let updateInterval: NodeJS.Timeout;
let isConnected = false;
  
  onMount(async () => {
    try {
      // Connect to event system service
      await eventSystemService.connect();
      
      // Subscribe to updates
      const unsubscribeStatus = eventSystemService.on('status', () => {
        const status = eventSystemService.status;
        isConnected = status.isConnected;
        
        if (status.isConnected) {
          toast.push('Connected to event system', { theme: { '--toastColor': 'mintcream', '--toastBackground': 'rgba(34, 197, 94, 0.9)' } });
        } else if (status.error) {
          toast.push(`Connection failed: ${status.error}`, { theme: { '--toastColor': 'white', '--toastBackground': 'rgba(239, 68, 68, 0.9)' } });
        }
      });
      
      const unsubscribeEventFlows = eventSystemService.on('eventFlows', () => {
        eventFlows = eventSystemService.eventFlows;
      });
      
      const unsubscribeEventMetrics = eventSystemService.on('eventMetrics', () => {
        const metrics = eventSystemService.eventMetrics;
        eventMetrics = {
          totalEvents: metrics.totalEvents,
          eventsPerSecond: metrics.avgProcessingTime > 0 ? 1000 / metrics.avgProcessingTime : 0,
          averageLatency: metrics.avgProcessingTime,
          errorRate: metrics.errorRate,
          activeModules: metrics.activeModules,
          systemHealth: metrics.errorRate > 0.1 ? 'degraded' : 'healthy'
        };
      });
      
      const unsubscribeActiveModules = eventSystemService.on('activeModules', () => {
        activeModules = eventSystemService.activeModules;
      });
      
      // Initial data load
      eventFlows = eventSystemService.eventFlows;
      const metrics = eventSystemService.eventMetrics;
      eventMetrics = {
        totalEvents: metrics.totalEvents,
        eventsPerSecond: metrics.avgProcessingTime > 0 ? 1000 / metrics.avgProcessingTime : 0,
        averageLatency: metrics.avgProcessingTime,
        errorRate: metrics.errorRate,
        activeModules: metrics.activeModules,
        systemHealth: metrics.errorRate > 0.1 ? 'degraded' : 'healthy'
      };
      activeModules = eventSystemService.activeModules;
      
      // Cleanup on destroy
      onDestroy(() => {
        unsubscribeStatus();
        unsubscribeEventFlows();
        unsubscribeEventMetrics();
        unsubscribeActiveModules();
        eventSystemService.disconnect();
      });
      
    } catch (error) {
      console.error('Failed to initialize event visualization:', error);
      toast.push('Failed to connect to event system', { theme: { '--toastColor': 'white', '--toastBackground': 'rgba(239, 68, 68, 0.9)' } });
    }
  });
  
  // onDestroy is now handled in onMount with proper cleanup
  
  // connectToEventSystem function removed - now handled by service
  
  function handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'event-flows':
        if (Array.isArray(message.data)) {
          eventFlows = message.data.map((flow: any) => ({
            ...flow,
            timestamp: new Date(flow.timestamp)
          }));
        }
        break;
        
      case 'event-metrics':
        if (message.data) {
          eventMetrics = { ...eventMetrics, ...message.data };
        }
        break;
        
      case 'module-status':
        if (message.data?.activeModules) {
          eventMetrics.activeModules = message.data.activeModules;
        }
        break;
        
      case 'event-flow':
        // Single new event flow
        if (message.data) {
          const newFlow = {
            ...message.data,
            timestamp: new Date(message.data.timestamp)
          };
          eventFlows = [newFlow, ...eventFlows.slice(0, 49)];
        }
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  // startDataUpdates function removed - now handled by service
  
  function getHealthColor(health: string): string {
    switch (health) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
  
  function getHealthIcon(health: string): string {
    switch (health) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'critical': return '❌';
      default: return '❓';
    }
  }
  
  function formatLatency(latency: number): string {
    return `${Math.round(latency)}ms`;
  }
  
  function formatTimestamp(timestamp: Date): string {
    return timestamp.toLocaleTimeString();
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">Event Flow Visualization</h2>
      <p class="text-gray-600">Real-time monitoring of event-driven architecture</p>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 rounded-full {isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}"></div>
      <span class="text-sm {isConnected ? 'text-green-600' : 'text-red-600'}">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  </div>

  <!-- System Health Overview -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white p-4 rounded-lg shadow border">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-gray-600">System Health</p>
          <div class="flex items-center gap-2">
            <span class="text-lg">{getHealthIcon(eventMetrics.systemHealth)}</span>
            <span class="text-xl font-bold {getHealthColor(eventMetrics.systemHealth)}">
              {eventMetrics.systemHealth.toUpperCase()}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow border">
      <div>
        <p class="text-sm text-gray-600">Active Modules</p>
        <p class="text-2xl font-bold text-blue-600">{eventMetrics.activeModules}</p>
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow border">
      <div>
        <p class="text-sm text-gray-600">Events/sec</p>
        <p class="text-2xl font-bold text-green-600">{eventMetrics.eventsPerSecond.toFixed(1)}</p>
      </div>
    </div>
    
    <div class="bg-white p-4 rounded-lg shadow border">
      <div>
        <p class="text-sm text-gray-600">Avg Latency</p>
        <p class="text-2xl font-bold text-purple-600">{formatLatency(eventMetrics.averageLatency)}</p>
      </div>
    </div>
  </div>

  <!-- Recent Event Flows -->
  <div class="bg-white rounded-lg shadow border">
    <div class="p-6 border-b">
      <h3 class="text-lg font-semibold text-gray-900">Recent Event Flows</h3>
      <p class="text-sm text-gray-600">Latest event activities across the system</p>
    </div>
    
    <div class="p-6">
      <div class="space-y-3 max-h-64 overflow-y-auto">
        {#if eventFlows.length === 0}
          <p class="text-gray-500">No events yet.</p>
        {:else}
          {#each eventFlows as flow}
            <div class="flex items-center justify-between p-3 rounded border">
              <div class="flex items-center gap-3">
                <span class="text-xl">📡</span>
                <div>
                  <p class="font-medium text-gray-900">{flow.type}</p>
                  <p class="text-sm text-gray-600">{flow.source} → {flow.target}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">{formatTimestamp(flow.timestamp)}</p>
                {#if flow.duration}
                  <p class="text-sm text-gray-500">{formatLatency(flow.duration)}</p>
                {/if}
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <!-- Active Modules -->
  <div class="bg-white rounded-lg shadow border">
    <div class="p-6 border-b">
      <h3 class="text-lg font-semibold text-gray-900">Active Modules</h3>
      <p class="text-sm text-gray-600">Currently registered modules in the event system</p>
    </div>
    
    <div class="p-6">
      <div class="space-y-3 max-h-64 overflow-y-auto">
        {#if activeModules.length === 0}
          <p class="text-gray-500">No active modules yet.</p>
        {:else}
          {#each activeModules as module}
            <div class="flex items-center justify-between p-3 rounded border">
              <div class="flex items-center gap-3">
                <span class="text-xl">{module.status === 'active' ? '🟢' : '🟡'}</span>
                <div>
                  <p class="font-medium text-gray-900">{module.name}</p>
                  <p class="text-sm text-gray-600">v{module.version} • {module.status}</p>
                  <p class="text-xs text-gray-500">
                    Capabilities: {module.capabilities.join(', ')}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">
                  Last heartbeat: {formatTimestamp(module.lastHeartbeat)}
                </p>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</div>