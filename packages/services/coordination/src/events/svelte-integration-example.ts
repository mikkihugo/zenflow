/**
 * @fileoverview Svelte Integration Example for Central WebSocket Hub
 * 
 * Example showing how Svelte dashboard would connect to and use the
 * unified Central WebSocket Hub for real-time coordination updates.
 */

/**
 * Example Svelte WebSocket Manager
 * This would typically be in the Svelte app as a utility/store
 */
export class SvelteWebSocketManager {
  private ws: WebSocket| null = null;
  private connectionId: string;
  private availableServices: string[] = [];
  private subscribers = new Map<string, Function[]>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private hubEndpoint: string ='ws://localhost:3000/ws/hub){
    this.connectionId = `svelte_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Connect to the Central WebSocket Hub
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.hubEndpoint);

        this.ws.onopen = () => {
          console.log('🔌 Connected to Central WebSocket Hub'');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data);
        };

        this.ws.onclose = () => {
          console.log('❌ Disconnected from Central WebSocket Hub'');
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('🚨 WebSocket error:,error');
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from the hub
   */
  private handleMessage(message: any): void {
    switch (message.type) {
      case'services_available:
        this.handleServiceDiscovery(message.data);
        break;

      case'task_updated:
        this.emit('task_updated,message.data');
        break;

      case'approval_gate_changed:
        this.emit('approval_gate_changed,message.data');
        break;

      case'pi_planning_progress:
        this.emit('pi_planning_progress,message.data');
        break;

      case'flow_metrics_updated:
        this.emit('flow_metrics_updated,message.data');
        break;

      case'system_health_update:
        this.emit('system_health_update,message.data');
        break;

      default:
        // Generic event handling
        this.emit(message.type, message.data);
    }
  }

  /**
   * Handle service discovery response
   */
  private handleServiceDiscovery(discoveryData: any): void {
    this.availableServices = discoveryData.services.map((s: any) => s.name);
    
    console.log('🔍 Discovered services:,this.availableServices');
    console.log('📡 Available message types:,discoveryData.totalMessageTypes');

    // Auto-subscribe to common dashboard events
    this.subscribe([
     'taskmaster,   // TaskMaster events
     'coordination '  // System coordination events
    ], [
     'task_updated,
     'approval_gate_changed,
     'pi_planning_progress,
     'flow_metrics_updated,
     'system_health_update'
    ]);
  }

  /**
   * Subscribe to services and message types
   */
  subscribe(services: string[], messageTypes: string[]): void {
    if (!this.ws|| this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket not connected, subscription queued'');
      return;
    }

    this.ws.send(JSON.stringify({
      type:'subscribe,
      services: services,
      messageTypes: messageTypes
    });

    console.log('✅ Subscribed to services:,services,'messageTypes:,messageTypes');
  }

  /**
   * Register event listener
   */
  on(eventType: string, callback: Function): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(eventType: string, callback: Function): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all subscribers
   */
  private emit(eventType: string, data: any): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${eventType}:`, error);
        }
      });
    }

    // Also emit to wildcard listeners
    const wildcardCallbacks = this.subscribers.get('*'');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => {
        try {
          callback({ type: eventType, data });
        } catch (error) {
          console.error(`Error in wildcard callback for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          console.error('Reconnection failed:,error');
        });
      }, delay);
    } else {
      console.error('🚫 Max reconnection attempts reached'');
    }
  }

  /**
   * Request service discovery
   */
  discoverServices(): void {
    if (!this.ws|| this.ws.readyState !== WebSocket.OPEN) return;

    this.ws.send(JSON.stringify({
      type:'discover_services'
    });
  }

  /**
   * Get connection statistics
   */
  getStats(): {
    connected: boolean;
    availableServices: string[];
    activeSubscriptions: number;
    reconnectAttempts: number;
  } {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      availableServices: this.availableServices,
      activeSubscriptions: this.subscribers.size,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  /**
   * Close the connection
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
    console.log('🔌 Disconnected from Central WebSocket Hub'');
  }
}

/**
 * Example Svelte usage in a component
 */
export const svelteUsageExample = `
<!-- Dashboard.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { SvelteWebSocketManager } from '$lib/websocket';
  let wsManager = new SvelteWebSocketManager();
  let dashboardData = {
    tasks: [],
    approvalGates: [],
    piProgress: null,
    flowMetrics: null,
    systemHealth: null
  };

  onMount(async () => {
    try {
      // Connect to Central WebSocket Hub
      await wsManager.connect();

      // Set up event listeners for different data types
      wsManager.on('task_updated,(data) => {
        console.log('📋 Task updated:,data');
        dashboardData.tasks = data.tasks|| [];
        dashboardData = dashboardData; // Trigger reactivity
      });

      wsManager.on('approval_gate_changed,(data) => {
        console.log('🚪 Approval gate changed:,data');
        dashboardData.approvalGates = data.gates|| [];
        dashboardData = dashboardData;
      });

      wsManager.on('pi_planning_progress,(data) => {
        console.log('📈 PI Planning progress:,data');
        dashboardData.piProgress = data;
        dashboardData = dashboardData;
      });

      wsManager.on('flow_metrics_updated,(data) => {
        console.log('📊 Flow metrics updated:,data');
        dashboardData.flowMetrics = data;
        dashboardData = dashboardData;
      });

      wsManager.on('system_health_update,(data) => {
        console.log('💚 System health update:,data');
        dashboardData.systemHealth = data;
        dashboardData = dashboardData;
      });

      // Wildcard listener for debugging
      wsManager.on('*,(event) => {
        console.log('🌐 WebSocket event:,event.type, event.data');
      });

    } catch (error) {
      console.error('Failed to connect to WebSocket hub:,error');
    }
  });

  onDestroy(() => {
    wsManager.disconnect();
  });
</script>

<!-- Dashboard UI -->
<div class="dashboard">
  <div class="stats-panel">
    <h2>Connection Status</h2>
    <div class="connection-stats">
      {@const stats = wsManager.getStats()}
      <div class="stat">
        <span class="label">Connected:</span>
        <span class="value {stats.connected ?'connected:'disconnected}">
          {stats.connected ?'Yes:'No}
        </span>
      </div>
      <div class="stat">
        <span class="label">Services:</span>
        <span class="value">{stats.availableServices.join(,')}</span>
      </div>
    </div>
  </div>

  <div class="content-panels">
    <div class="panel">
      <h3>📋 Tasks ({dashboardData.tasks.length})</h3>
      {#each dashboardData.tasks as task}
        <div class="task-item">
          <strong>{task.title}</strong>
          <span class="status">{task.status}</span>
        </div>
      {/each}
    </div>

    <div class="panel">
      <h3>🚪 Approval Gates ({dashboardData.approvalGates.length})</h3>
      {#each dashboardData.approvalGates as gate}
        <div class="gate-item">
          <span>{gate.name}</span>
          <span class="pending">{gate.pendingCount} pending</span>
        </div>
      {/each}
    </div>

    <div class="panel">
      <h3>📈 PI Planning</h3>
      {#if dashboardData.piProgress}
        <div class="progress-bar">
          <div class="progress-fill" style="width: {dashboardData.piProgress.percentage}%"></div>
          <span class="progress-text">{dashboardData.piProgress.percentage}%</span>
        </div>
      {:else}
        <p>No PI planning in progress</p>
      {/if}
    </div>

    <div class="panel">
      <h3>💚 System Health</h3>
      {#if dashboardData.systemHealth}
        <div class="health-indicator {dashboardData.systemHealth.status}">
          {dashboardData.systemHealth.status.toUpperCase()}
        </div>
        <div class="health-details">
          Score: {dashboardData.systemHealth.score}/100
        </div>
      {:else}
        <p>Health data not available</p>
      {/if}
    </div>
  </div>
</div>

<style>
  .dashboard { display: grid; gap: 1rem; padding: 1rem; }
  .stats-panel { background: #f5f5f5; padding: 1rem; border-radius: 8px; }
  .content-panels { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
  .panel { background: white; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .connected { color: green; font-weight: bold; }
  .disconnected { color: red; font-weight: bold; }
  .health-indicator.healthy { color: green; font-weight: bold; }
  .health-indicator.warning { color: orange; font-weight: bold; }
  .health-indicator.critical { color: red; font-weight: bold; }
  .progress-bar { position: relative; background: #eee; height: 20px; border-radius: 10px; }
  .progress-fill { background: #4caf50; height: 100%; border-radius: 10px; }
  .progress-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; }
</style>
`;

/**
 * Example usage with Svelte stores
 */
export const svelteStoreExample = \`
// stores/websocket.js
import { writable } from 'svelte/store';
import { SvelteWebSocketManager } from './websocket-manager';
const wsManager = new SvelteWebSocketManager();

// Reactive stores for different data types
export const tasks = writable([]);
export const approvalGates = writable([]);
export const piProgress = writable(null);
export const flowMetrics = writable(null);
export const systemHealth = writable(null);
export const connectionStatus = writable(false);

// Initialize WebSocket connection
export async function initWebSocket() {
  try {
    await wsManager.connect();
    connectionStatus.set(true);

    // Update stores based on WebSocket events
    wsManager.on('task_updated,(data) => tasks.set(data.tasks|| '[])');
    wsManager.on('approval_gate_changed,(data) => approvalGates.set(data.gates|| '[])');
    wsManager.on('pi_planning_progress,(data) => piProgress.set(data)');
    wsManager.on('flow_metrics_updated,(data) => flowMetrics.set(data)');
    wsManager.on('system_health_update,(data) => systemHealth.set(data)');

  } catch (error) {
    console.error('WebSocket connection failed:,error');
    connectionStatus.set(false);
  }
}

// Component usage:
// import { tasks, approvalGates, connectionStatus, initWebSocket } from '$stores/websocket';
// onMount(() => initWebSocket();
\`;