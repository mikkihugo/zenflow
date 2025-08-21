/**
 * Terminal User Interface (TUI) Types
 * 
 * This module defines types and interfaces for terminal-based user interactions,
 * providing a rich command-line interface for swarm coordination and monitoring.
 */

export interface TUIConfig {
  /** Terminal dimensions */
  dimensions: {
    width: number;
    height: number;
  };
  /** Color scheme */
  colorScheme: 'dark' | 'light' | 'auto';
  /** Animation settings */
  animations: {
    enabled: boolean;
    speed: 'slow' | 'normal' | 'fast';
  };
  /** Refresh rate in milliseconds */
  refreshRate: number;
  /** Enable mouse support */
  mouseSupport: boolean;
}

export interface TUITheme {
  /** Primary colors */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  /** Typography settings */
  typography: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
  };
  /** Border styles */
  borders: {
    style: 'solid' | 'dashed' | 'dotted' | 'double';
    width: number;
    radius: number;
  };
}

export interface TUIWidget {
  /** Widget identifier */
  id: string;
  /** Widget type */
  type: 'panel' | 'list' | 'chart' | 'progress' | 'text' | 'input' | 'button' | 'table';
  /** Widget title */
  title: string;
  /** Widget position */
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  /** Widget visibility */
  visible: boolean;
  /** Widget content */
  content: unknown;
  /** Widget properties */
  properties: Record<string, unknown>;
  /** Event handlers */
  handlers: Record<string, (event: TUIEvent) => void>;
}

export interface TUILayout {
  /** Layout identifier */
  id: string;
  /** Layout name */
  name: string;
  /** Layout description */
  description: string;
  /** Widget arrangement */
  widgets: TUIWidget[];
  /** Layout grid settings */
  grid: {
    columns: number;
    rows: number;
    gap: number;
  };
  /** Layout theme */
  theme: TUITheme;
}

export interface TUIEvent {
  /** Event type */
  type: 'key' | 'mouse' | 'resize' | 'focus' | 'blur' | 'custom';
  /** Event timestamp */
  timestamp: Date;
  /** Event target widget ID */
  targetId?: string;
  /** Event data */
  data: {
    /** Key event data */
    key?: {
      name: string;
      code: string;
      ctrl: boolean;
      shift: boolean;
      alt: boolean;
    };
    /** Mouse event data */
    mouse?: {
      x: number;
      y: number;
      button: 'left' | 'right' | 'middle';
      action: 'click' | 'dblclick' | 'move' | 'scroll';
    };
    /** Resize event data */
    resize?: {
      width: number;
      height: number;
    };
    /** Custom event data */
    custom?: Record<string, unknown>;
  };
}

export interface TUICommand {
  /** Command name */
  name: string;
  /** Command description */
  description: string;
  /** Command aliases */
  aliases: string[];
  /** Command parameters */
  parameters: TUIParameter[];
  /** Command handler */
  handler: (args: string[], context: TUIContext) => Promise<TUICommandResult>;
  /** Command category */
  category: string;
  /** Command examples */
  examples: string[];
}

export interface TUIParameter {
  /** Parameter name */
  name: string;
  /** Parameter description */
  description: string;
  /** Parameter type */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** Parameter is required */
  required: boolean;
  /** Default value */
  defaultValue?: unknown;
  /** Parameter validation */
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    enum?: unknown[];
  };
}

export interface TUICommandResult {
  /** Command success status */
  success: boolean;
  /** Result message */
  message: string;
  /** Result data */
  data?: unknown;
  /** Execution time in milliseconds */
  executionTime: number;
  /** Error information */
  error?: {
    code: string;
    details: string;
    stack?: string;
  };
}

export interface TUIContext {
  /** Current user */
  user: {
    id: string;
    name: string;
    permissions: string[];
  };
  /** Current session */
  session: {
    id: string;
    startTime: Date;
    lastActivity: Date;
  };
  /** Current working directory */
  workingDirectory: string;
  /** Environment variables */
  environment: Record<string, string>;
  /** Command history */
  history: string[];
  /** TUI configuration */
  config: TUIConfig;
}

export interface TUIMenu {
  /** Menu identifier */
  id: string;
  /** Menu title */
  title: string;
  /** Menu items */
  items: TUIMenuItem[];
  /** Menu position */
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Menu visibility */
  visible: boolean;
  /** Menu shortcuts */
  shortcuts: Record<string, string>;
}

export interface TUIMenuItem {
  /** Item identifier */
  id: string;
  /** Item label */
  label: string;
  /** Item description */
  description?: string;
  /** Item type */
  type: 'action' | 'submenu' | 'separator' | 'toggle' | 'radio';
  /** Item action */
  action?: () => void;
  /** Item submenu */
  submenu?: TUIMenuItem[];
  /** Item enabled state */
  enabled: boolean;
  /** Item checked state (for toggle/radio) */
  checked?: boolean;
  /** Item shortcut key */
  shortcut?: string;
  /** Item icon */
  icon?: string;
}

export interface TUIPanel {
  /** Panel identifier */
  id: string;
  /** Panel title */
  title: string;
  /** Panel content */
  content: string | TUIWidget[];
  /** Panel border */
  border: {
    enabled: boolean;
    style: string;
    color: string;
  };
  /** Panel scrolling */
  scrolling: {
    enabled: boolean;
    horizontal: boolean;
    vertical: boolean;
  };
  /** Panel size */
  size: {
    width: number | 'auto';
    height: number | 'auto';
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
}

export interface TUITable {
  /** Table identifier */
  id: string;
  /** Table columns */
  columns: TUITableColumn[];
  /** Table rows */
  rows: TUITableRow[];
  /** Table selection */
  selection: {
    enabled: boolean;
    multiple: boolean;
    selectedRows: number[];
  };
  /** Table sorting */
  sorting: {
    enabled: boolean;
    column?: string;
    direction: 'asc' | 'desc';
  };
  /** Table pagination */
  pagination: {
    enabled: boolean;
    pageSize: number;
    currentPage: number;
    totalPages: number;
  };
}

export interface TUITableColumn {
  /** Column identifier */
  id: string;
  /** Column title */
  title: string;
  /** Column width */
  width: number | 'auto' | string;
  /** Column alignment */
  align: 'left' | 'center' | 'right';
  /** Column sortable */
  sortable: boolean;
  /** Column renderer */
  renderer?: (value: unknown, row: TUITableRow) => string;
}

export interface TUITableRow {
  /** Row identifier */
  id: string;
  /** Row data */
  data: Record<string, unknown>;
  /** Row selected state */
  selected: boolean;
  /** Row enabled state */
  enabled: boolean;
  /** Row style */
  style?: {
    backgroundColor?: string;
    textColor?: string;
    fontWeight?: string;
  };
}

export interface TUIChart {
  /** Chart identifier */
  id: string;
  /** Chart type */
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area' | 'histogram';
  /** Chart title */
  title: string;
  /** Chart data */
  data: TUIChartData;
  /** Chart options */
  options: {
    /** Chart dimensions */
    width: number;
    height: number;
    /** Chart margins */
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    /** Chart colors */
    colors: string[];
    /** Chart legend */
    legend: {
      enabled: boolean;
      position: 'top' | 'bottom' | 'left' | 'right';
    };
    /** Chart axes */
    axes: {
      x: TUIChartAxis;
      y: TUIChartAxis;
    };
  };
}

export interface TUIChartData {
  /** Data labels */
  labels: string[];
  /** Data series */
  series: TUIChartSeries[];
}

export interface TUIChartSeries {
  /** Series name */
  name: string;
  /** Series data points */
  data: number[];
  /** Series color */
  color?: string;
  /** Series style */
  style?: {
    lineWidth?: number;
    fillOpacity?: number;
    pointRadius?: number;
  };
}

export interface TUIChartAxis {
  /** Axis label */
  label: string;
  /** Axis type */
  type: 'linear' | 'logarithmic' | 'categorical' | 'time';
  /** Axis minimum value */
  min?: number;
  /** Axis maximum value */
  max?: number;
  /** Axis grid lines */
  grid: {
    enabled: boolean;
    color: string;
    style: 'solid' | 'dashed' | 'dotted';
  };
}

export interface TUIProgressBar {
  /** Progress bar identifier */
  id: string;
  /** Progress value (0-100) */
  value: number;
  /** Progress maximum value */
  max: number;
  /** Progress label */
  label: string;
  /** Progress color */
  color: string;
  /** Progress animation */
  animated: boolean;
  /** Progress style */
  style: 'bar' | 'circle' | 'spinner';
}

export interface TUIInput {
  /** Input identifier */
  id: string;
  /** Input type */
  type: 'text' | 'password' | 'number' | 'email' | 'url' | 'search' | 'textarea';
  /** Input placeholder */
  placeholder: string;
  /** Input value */
  value: string;
  /** Input validation */
  validation: {
    required: boolean;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  /** Input autocomplete */
  autocomplete: {
    enabled: boolean;
    source: string[] | (() => Promise<string[]>);
  };
}

export interface TUINotification {
  /** Notification identifier */
  id: string;
  /** Notification type */
  type: 'info' | 'success' | 'warning' | 'error';
  /** Notification title */
  title: string;
  /** Notification message */
  message: string;
  /** Notification duration in milliseconds */
  duration: number;
  /** Notification timestamp */
  timestamp: Date;
  /** Notification actions */
  actions: TUINotificationAction[];
}

export interface TUINotificationAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action handler */
  handler: () => void;
  /** Action style */
  style: 'primary' | 'secondary' | 'danger';
}

export interface TUIKeyBinding {
  /** Key combination */
  key: string;
  /** Key description */
  description: string;
  /** Key action */
  action: string | (() => void);
  /** Key context */
  context: string[];
  /** Key enabled state */
  enabled: boolean;
}

export interface TUIApplication {
  /** Application identifier */
  id: string;
  /** Application name */
  name: string;
  /** Application version */
  version: string;
  /** Application configuration */
  config: TUIConfig;
  /** Application layouts */
  layouts: TUILayout[];
  /** Application commands */
  commands: TUICommand[];
  /** Application menus */
  menus: TUIMenu[];
  /** Application key bindings */
  keyBindings: TUIKeyBinding[];
  /** Application state */
  state: Record<string, unknown>;
}

// Export type aliases for common usage patterns
export type TUIEventHandler = (event: TUIEvent) => void;
export type TUICommandHandler = (args: string[], context: TUIContext) => Promise<TUICommandResult>;
export type TUIWidgetRenderer = (widget: TUIWidget, context: TUIContext) => string;
export type TUIValidator = (value: unknown) => boolean | string;

// Export utility types
export type TUIWidgetType = TUIWidget['type'];
export type TUIEventType = TUIEvent['type'];
export type TUIChartType = TUIChart['type'];
export type TUINotificationType = TUINotification['type'];

// Export all types and interfaces
export type {
  TUIConfig,
  TUITheme,
  TUIWidget,
  TUILayout,
  TUIEvent,
  TUICommand,
  TUIParameter,
  TUICommandResult,
  TUIContext,
  TUIMenu,
  TUIMenuItem,
  TUIPanel,
  TUITable,
  TUITableColumn,
  TUITableRow,
  TUIChart,
  TUIChartData,
  TUIChartSeries,
  TUIChartAxis,
  TUIProgressBar,
  TUIInput,
  TUINotification,
  TUINotificationAction,
  TUIKeyBinding,
  TUIApplication
};