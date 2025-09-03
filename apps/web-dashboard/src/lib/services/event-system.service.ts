/**
 * Event System Service for Web Dashboard
 * 
 * Connects to the foundation DynamicEventRegistry through WebSocket Hub
 * and provides real-time event data for visualization.
 */

export interface EventFlow {
  id: string;
  type: string;
  source: string;
  target: string;
  data?: unknown;
  timestamp: Date;
  duration?: number;
}

export interface EventMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  activeModules: number;
  avgProcessingTime: number;
  errorRate: number;
}

export interface ActiveModule {
  name: string;
  version: string;
  status: string;
  capabilities: string[];
  lastHeartbeat: Date;
}

export interface EventSystemStatus {
  isConnected: boolean;
  lastUpdate: Date;
  error?: string;
}

class EventSystemService {
  private websocket: WebSocket | null = null;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  
  // State
  private _status: EventSystemStatus = {
    isConnected: false,
    lastUpdate: new Date()
  };
  
  private _eventFlows: EventFlow[] = [];
  private _eventMetrics: EventMetrics = {
    totalEvents: 0,
    eventsByType: {},
    activeModules: 0,
    avgProcessingTime: 0,
    errorRate: 0
  };
  
  private _activeModules: ActiveModule[] = [];

  constructor() {
    this.setupHeartbeat();
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Connect to the event system via WebSocket
   */
  async connect(): Promise<void> {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${location.host}/api/events/ws`;
      
      this.websocket = new WebSocket(wsUrl);
      this.setupWebSocketHandlers();
      
    } catch (error) {
      this.updateStatus({ isConnected: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Disconnect from the event system
   */
  disconnect(): void {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }
    
    this.updateStatus({ isConnected: false });
  }

  /**
   * Subscribe to event system updates
   */
  on(event: 'status' | 'eventFlows' | 'eventMetrics' | 'activeModules', callback: Function): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    
    this.eventListeners.get(event)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Get current event flows
   */
  get eventFlows(): EventFlow[] {
    return [...this._eventFlows];
  }

  /**
   * Get current event metrics
   */
  get eventMetrics(): EventMetrics {
    return { ...this._eventMetrics };
  }

  /**
   * Get current active modules
   */
  get activeModules(): ActiveModule[] {
    return [...this._activeModules];
  }

  /**
   * Get connection status
   */
  get status(): EventSystemStatus {
    return { ...this._status };
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private setupWebSocketHandlers(): void {
    if (!this.websocket) return;

    this.websocket.onopen = () => {
      console.log('WebSocket connected to event system');
      this.updateStatus({ isConnected: true });
      this.subscribeToEvents();
      this.startHeartbeat();
    };

    this.websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.websocket.onclose = () => {
      console.log('WebSocket connection closed');
      this.updateStatus({ isConnected: false });
      this.stopHeartbeat();
      this.scheduleReconnect();
    };

    this.websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.updateStatus({ isConnected: false, error: 'WebSocket error' });
    };
  }

  private subscribeToEvents(): void {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) return;

    // Subscribe to all event types
    this.websocket.send(JSON.stringify({
      type: 'subscribe',
      eventTypes: ['event-flows', 'event-metrics', 'module-status', 'event-flow']
    }));
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'event-flows':
        this.updateEventFlows(message.data);
        break;
        
      case 'event-metrics':
        this.updateEventMetrics(message.data);
        break;
        
      case 'module-status':
        this.updateActiveModules(message.data);
        break;
        
      case 'event-flow':
        this.addEventFlow(message.data);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private updateEventFlows(flows: any[]): void {
    if (Array.isArray(flows)) {
      this._eventFlows = flows.map(flow => ({
        ...flow,
        timestamp: new Date(flow.timestamp)
      }));
      this.notifyListeners('eventFlows');
    }
  }

  private updateEventMetrics(metrics: any): void {
    if (metrics) {
      this._eventMetrics = { ...this._eventMetrics, ...metrics };
      this.notifyListeners('eventMetrics');
    }
  }

  private updateActiveModules(data: any): void {
    if (data?.activeModules) {
      this._activeModules = data.activeModules.map((module: any) => ({
        ...module,
        lastHeartbeat: new Date(module.lastHeartbeat || Date.now())
      }));
      this.notifyListeners('activeModules');
    }
  }

  private addEventFlow(flow: any): void {
    if (flow) {
      const newFlow = {
        ...flow,
        timestamp: new Date(flow.timestamp)
      };
      
      // Add to beginning and keep only last 50
      this._eventFlows = [newFlow, ...this._eventFlows.slice(0, 49)];
      this.notifyListeners('eventFlows');
    }
  }

  private updateStatus(status: Partial<EventSystemStatus>): void {
    this._status = { ...this._status, ...status, lastUpdate: new Date() };
    this.notifyListeners('status');
  }

  private notifyListeners(event: string): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      for (const callback of listeners) {
        try {
          callback();
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.websocket?.readyState === WebSocket.OPEN) {
        this.websocket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectInterval) return;
    
    this.reconnectInterval = setInterval(() => {
      if (!this.websocket || this.websocket.readyState === WebSocket.CLOSED) {
        this.connect();
      }
    }, 5000); // 5 seconds
  }

  private setupHeartbeat(): void {
    // Keep service alive
    setInterval(() => {
      // This prevents the service from being garbage collected
    }, 60000); // 1 minute
  }
}

// Export singleton instance
export const eventSystemService = new EventSystemService();
