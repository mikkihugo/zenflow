/**
 * TypeScript type definitions for Svelte dashboard
 * 
 * Provides type safety for all dashboard components and data structures
 */

export interface SystemStatus {
  health: 'healthy' | 'warning' | 'error' | 'critical';
  uptime: number;
  memoryUsage: number;
  version: string;
  lastUpdated?: Date;
}

export interface SwarmInfo {
  id: string | number;
  name: string;
  agents: number;
  status: 'active' | 'inactive' | 'warning' | 'error';
  topology?: 'hierarchical' | 'mesh' | 'ring' | 'star';
  created?: Date;
  lastActivity?: Date;
}

export interface PerformanceMetrics {
  cpu: number; // Percentage
  memory: number; // Percentage
  requestsPerMin: number;
  avgResponse: number; // Milliseconds
  cacheHitRate?: number;
  activeConnections?: number;
}

export interface TaskInfo {
  id: string | number;
  title: string;
  progress: number; // 0-100
  status: 'pending' | 'active' | 'completed' | 'error' | 'cancelled';
  assignedAgents?: string[];
  estimatedCompletion?: Date;
  created: Date;
}

export interface WebSocketMessage {
  type: string;
  channel: string;
  data: any;
  timestamp: Date;
}

export interface DashboardData {
  systemStatus: SystemStatus;
  swarms: SwarmInfo[];
  performance: PerformanceMetrics;
  recentTasks: TaskInfo[];
  llmStats?: LLMStatistics;
}

export interface LLMStatistics {
  totalCalls: number;
  successRate: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  costSavings: number;
  activeProviders: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
  data?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  timestamp: Date;
}

// WebSocket event types
export type WebSocketEventType =
  | 'system:status'
  | 'swarm:update'
  | 'swarm:created'
  | 'swarm:stopped'
  | 'performance:update'
  | 'task:created'
  | 'task:updated'
  | 'task:completed'
  | 'logs:new'
  | 'llm:stats';

// Component prop types
export interface CardProps {
  title?: string;
  icon?: string;
  loading?: boolean;
  error?: string;
}

export interface MetricProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status?: 'success' | 'warning' | 'error';
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export interface StatusDotProps {
  status: 'active' | 'inactive' | 'warning' | 'error' | 'success';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

// Form types
export interface SwarmConfig {
  topology: 'hierarchical' | 'mesh' | 'ring' | 'star';
  maxAgents: number;
  strategy: 'balanced' | 'specialized' | 'adaptive';
  description?: string;
}

export interface TaskConfig {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedSwarm?: string;
  estimatedHours?: number;
  tags?: string[];
}

// Settings types
export interface DashboardSettings {
  theme: 'light' | 'dark' | 'auto';
  refreshInterval: number; // seconds
  enableRealTime: boolean;
  enableNotifications: boolean;
  autoRefresh: boolean;
  compactMode: boolean;
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
    error: string;
  };
}

// API client types
export interface ApiClient {
  get<T>(endpoint: string): Promise<ApiResponse<T>>;
  post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  delete<T>(endpoint: string): Promise<ApiResponse<T>>;
}

// Store types
export interface DashboardStore {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  connected: boolean;
  lastUpdate: Date;
}

export interface WebSocketStore {
  connected: boolean;
  socket: WebSocket | null;
  lastMessage: WebSocketMessage | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
}

// Utility types
export type StatusColor = 'success' | 'warning' | 'error' | 'info' | 'default';
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Validation types
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'textarea';
  value: any;
  rules?: ValidationRule[];
  options?: { value: any; label: string }[];
}

// Chart/visualization types
export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: Date;
  metadata?: any;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'doughnut' | 'area';
  data: ChartDataPoint[];
  options?: {
    title?: string;
    color?: string;
    height?: number;
    showLegend?: boolean;
    showTooltip?: boolean;
  };
}

// Navigation types
export interface NavItem {
  path: string;
  title: string;
  icon: string;
  external?: boolean;
  children?: NavItem[];
}

export interface BreadcrumbItem {
  title: string;
  path?: string;
  active?: boolean;
}