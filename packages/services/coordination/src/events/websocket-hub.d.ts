/**
* Registered service information
*/
export interface RegisteredService {
name: 'services_available';
data: getLogger;
(: any): any;
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
')': any;
type: string;
data: any;
')}),': any;
approvalGateChanged: (gateData: any) => any;
piPlanningProgress: (progressData: any) => any;
flowMetricsUpdated: (metricsData: any) => any;
' data: metricsData': any;
};
//# sourceMappingURL=websocket-hub.d.ts.map