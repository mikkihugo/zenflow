 
/**
* Registered service information
*/
export interface RegisteredService {
  name: 'services_available';
  data: any;
  handler: (data: any) => any;
}
/**
* WebSocket hub interface
*/
export interface WebSocketHub {
  broadcast: (event: string, data: any) => void;
  on: (event: string, handler: (data: any) => void) => void;
  off: (event: string, handler: (data: any) => void) => void;
}
/**
* Get the WebSocket hub instance
*/
export declare function getWebSocketHub(): WebSocketHub;
/**
* Helper functions for broadcasting to the WebSocket hub
*/
export declare const hubBroadcast: {
  taskUpdated: (taskData: any) => any;
  servicesAvailable: (data: any) => any;
  approvalGateChanged: (gateData: any) => any;
  piPlanningProgress: (progressData: any) => any;
  flowMetricsUpdated: (metricsData: any) => any;
};
//# sourceMappingURL=websocket-hub.d.ts.map