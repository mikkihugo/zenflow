// Adapter type definitions
export interface DatabaseAdapter {
  start?(): Promise<void>;
}
export interface EventAdapter {
  start?(): Promise<void>;
}
export interface HttpAdapter {
  start?(): Promise<void>;
}
export interface WebSocketAdapter {
  start?(): Promise<void>;
}
