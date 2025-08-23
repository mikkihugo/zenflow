/**
 * TypeScript type definitions for Svelte dashboard
 *
 * Provides type safety for all dashboard components and data structures
 */
export interface SystemStatus {
  health: 'healthy' || warning || '''error  ''|| critical)';
  uptime: number;
  memoryUsage: number;
  version: string;
  lastUpdated?: Date

}
export interface SwarmInfo {
  id: string | number;
  name: string;
  agents: number;
  statu's': 'active'| inactive | warning   | err'o''r')';
  topology?: 'hierarchical' |mesh | 'ring'| sta'r')';
  created?: Date;
  lastActivity?: Date

}
export interface PerformanceMetrics {
  cpu: number;
  memory: number;
  requestsPerMin: number;
  avgResponse: number;
  cacheHitRate?: number;
  activeConnections?: number

}
export interface TaskInfo {
  id: string  || number;
  title: string;
  progress: number;
  status: pending | active || '''completed | err'o'r' || cancelled)';
  assignedAgents?: string[];
  estimatedCompletion?: Date;
  created: Date

}
export interface WebSocketMessage {
  type: string;
  channel: string;
  data: any;
  timestamp: Date

}
export interface DashboardData {
  systemStatus: SystemStatus;
  swarms: SwarmInfo[];
  performance: PerformanceMetrics;
  recentTasks: TaskInfo[];
  llmStats?: LLMStatistics

}
export interface LLMStatistics {
  totalCalls: number;
  successRate: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  costSavings: number;
  activeProviders: number

}
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: debug | info | wa'r'n | e'r'o'r')';
  message: string;
  source?: string;
  data?: any

}
export interface ApiResponse<T> {
  success: boolean; data: T; error?: string; timestamp: Date

}
export type WebSocketEventType =
  | system: status
  | swarm: update
  | swarm: created
  | swarm: stopped
  | performance: update
  | task: created
  | task: updated
  | task: completed
  | logs:new
  | llm:sta't's')';
export interface CardProps {
  title?: string;
  icon?: string;
  loading?: boolean;
  error?: string

}
export interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' |down | | sta'b'l'e')';
  status?: 'success' |warning | | er'''o'r')'

}
export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' |success | 'warning'| erro'r')';
  size?: 'sm' |md | l'g')';
  showLabel?: boolean

}
export interface StatusDotProps {
  status: 'active' |inactive | 'warning'| error | succes''')';
  size?: 'sm' |md | l'g')';
  animated?: boolean

}
export interface SwarmConfig {
  topology: 'hierarchical' |mesh | 'ring'| sta'r')';
  maxAgents: number;
  strategy: 'balanced' |specialized | | adapt'i'v'e')';
  description?: string

}
export interface TaskConfig {
  title: string;
  description: string;
  priority: 'low' || medium || '''high  ''|| critical)';
  assignedSwarm?: string;
  estimatedHours?: number;
  tags?: string[]

}
export interface DashboardSettings {
  theme':' 'light'| dark' || au't'o')';
  refreshInterval: number;
  enableRealTime: boolean;
  enableNotifications: boolean;
  autoRefresh: boolean;
  compactMode: boolean

}
export interface ThemeConfig {
  name: string;
  colors: {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string

}
}
export interface ApiClient {
  get<T>(endpoint: string': Promise<ApiResponse<T>>;
  post<T>(endpoint: string,
  data?: any): Promise<ApiResponse<T>>;
  put<T>(endpoint: string,
  data?: any): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string): Promise<ApiResponse<T>>

}
export interface DashboardStore {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastUpdate: Date

}
export interface WebSocketStore {
  connected: boolean;
  socket: WebSocket | null;
  lastMessage: WebSocketMessage | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number

}
export type StatusColor =
  | 'success
  | warning
  | '''error
  | info
  | defaul't')';
export type ComponentSize =
  | 'xs'
  | sm
  | '''md
  | lg
  | x'l')';
export type LoadingState =
  | 'idle'
  | loading
  | '''success
  | erro'r')';
export type EventHandler<T = Event> = (event: T' = '>'void'';
export type AsyncEventHandler<T = Event> = (event: T) = '> Promise<void>'';
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string

}
export interface FormField {
  name: string;
  label: string;
  type: 'text  |number | 'select'| checkbo'x' || te'tarea)';
  value: any;
  rules?: ValidationRule[];
  options?: {
  value: any;
  label: string
}[]
}
export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: Date;
  metadata?: any

}
export interface ChartConfig {
  type: line | bar | doughn'u't | ar'e'a')';
  data: ChartDataPoint[];
  options?: {
  title?: string;
  color?: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean

}
}
export interface NavItem {
  path: string;
  title: string;
  icon: string;
  external?: boolean;
  children?: NavItem[]

}
export interface BreadcrumbItem {
  title: string;
  path?: string;
  active?: boolean

}
//# sourceMappingURL=dashboard.d.ts.map
