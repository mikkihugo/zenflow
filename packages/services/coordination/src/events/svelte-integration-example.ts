/**
 * @fileoverview Svelte Integration Example for Central WebSocket Hub
 *
 * Example showing how Svelte dashboard would connect to and use the
 * unified Central WebSocket Hub for real-time coordination updates.
 */

import { getLogger as _getLogger } from '@claude-zen/foundation';

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
          logger.error('🚨 WebSocket _error:', error);
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
    this.subscribe(
      [
        'taskmaster', // TaskMaster events
        'coordination', // System coordination events
      ],
      [
        'task_updated',
        'approval_gate_changed',
        'pi_planning_progress',
        'flow_metrics_updated',
        'system_health_update',
      ]
    );
  }

  /**
   * Subscribe to services and message types
   */
  subscribe(services: string[], messageTypes: string[]): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      logger.warn('⚠️ WebSocket not connected, subscription queued');
      return;
    }

    this.ws.send(
      JSON.stringify({
        type: 'subscribe',
        services,
        messageTypes,
      })
    );
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
  private emit(eventType: string, _data: any): void {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in event callback for ${eventType}:"Fixed unterminated template" `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})"Fixed unterminated template" "Fixed unterminated template"
"Fixed unterminated template"