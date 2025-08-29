/**
 * @fileoverview Svelte Integration Example for Central WebSocket Hub
 * 
 * Example showing how Svelte dashboard would connect to and use the
 * unified Central WebSocket Hub for real-time coordination updates.
 */

import { getLogger } from '@claude-zen/foundation';

const logger = getLogger('svelte-websocket-manager');

/**
 * Example Svelte WebSocket Manager
 * This would typically be in the Svelte app as a utility/store
 */
export class SvelteWebSocketManager {
  private ws: WebSocket | null = null;
  private connectionId: string | null = null;
  private subscribers = new Map<string, Function[]>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private availableServices: string[] = [];

  constructor(private hubEndpoint: string = 'ws://localhost:3000') {}

  /**
   * Connect to the Central WebSocket Hub
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.hubEndpoint);
        
        this.ws.onopen = () => {
          logger.info('🔌 Connected to Central WebSocket Hub');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };
        
        this.ws.onclose = () => {
          logger.info('❌ Disconnected from Central WebSocket Hub');
          this.handleReconnect();
        };
        
        this.ws.onerror = (error) => {
          logger.error('🚨 WebSocket error:', error);
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
      case 'service_discovery':
        this.handleServiceDiscovery(message.data);
        break;
      case 'task_updated':
        this.emit('task_updated', message.data);
        break;
      case 'approval_gate_changed':
        this.emit('approval_gate_changed', message.data);
        break;
      case 'pi_planning_progress':
        this.emit('pi_planning_progress', message.data);
        break;
      case 'flow_metrics_updated':
        this.emit('flow_metrics_updated', message.data);
        break;
      case 'system_health_update':
        this.emit('system_health_update', message.data);
        break;
      default:
        logger.warn('Unknown message type:', message.type);
    }
  }

  private handleServiceDiscovery(discoveryData: any): void {
    this.availableServices = discoveryData.services.map((s: any) => s.name);
    logger.info('🔍 Discovered services:', this.availableServices);
    logger.info('📡 Available message types:', discoveryData.totalMessageTypes);
    
    // Auto-subscribe to common dashboard events
    this.subscribe([
      'taskmaster',   // TaskMaster events
      'coordination'  // System coordination events
    ], [
      'task_updated',
      'approval_gate_changed',
      'pi_planning_progress',
      'flow_metrics_updated',
      'system_health_update'
    ]);
  }

  /**
   * Subscribe to services and message types
   */
  subscribe(services: string[], messageTypes: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('⚠️ WebSocket not connected, subscription queued');
      return;
    }

    this.ws.send(JSON.stringify({
      type: 'subscribe',
      services,
      messageTypes
    }));
  }

  /**
   * Add event listener
   */
  on(eventType: string, callback: Function): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    this.subscribers.get(eventType)?.push(callback);
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
          logger.error(`Error in event callback for ${eventType}:`, error);
        }
      });
    }
    
    // Also emit to wildcard listeners
    const wildcardCallbacks = this.subscribers.get('*');
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach(callback => {
        try {
          callback({ type: eventType, data });
        } catch (error) {
          logger.error('Error in wildcard callback:', error);
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
      logger.info(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch(error => {
          logger.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      logger.error('🚫 Max reconnection attempts reached');
    }
  }

  /**
   * Request service discovery
   */
  discoverServices(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    
    this.ws.send(JSON.stringify({
      type: 'discover_services'
    }));
  }

  /**
   * Get connection statistics
   */
  getStats():  {
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
   * Disconnect from the WebSocket hub
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscribers.clear();
    logger.info('🔌 Disconnected from Central WebSocket Hub');
  }
}

/**
 * Example usage patterns for Svelte integration
 */
export const svelteUsageExample = `
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
    wsManager.on('task_updated', (data) => tasks.set(data.tasks || []));
    wsManager.on('approval_gate_changed', (data) => approvalGates.set(data.gates || []));
    wsManager.on('pi_planning_progress', (data) => piProgress.set(data));
    wsManager.on('flow_metrics_updated', (data) => flowMetrics.set(data));
    wsManager.on('system_health_update', (data) => systemHealth.set(data));
  } catch (error) {
    logger.error('WebSocket connection failed:', error);
    connectionStatus.set(false);
  }
}

// Component usage:
// import { tasks, approvalGates, connectionStatus, initWebSocket } from 'stores/websocket'
// onMount(() => initWebSocket());
`;