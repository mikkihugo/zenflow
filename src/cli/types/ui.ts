/**
 * UI Type Definitions
 *
 * This module defines interfaces for the CLI user interface system,
 * including themes, components, and screen state management.
 */

/**
 * UI theme configuration
 */
export interface UITheme {
  /** Theme identifier */
  name: string;

  /** Theme display name */
  displayName: string;

  /** Theme description */
  description?: string;

  /** Color palette */
  colors: UIColorPalette;

  /** Typography settings */
  typography: UITypography;

  /** Spacing configuration */
  spacing: UISpacing;

  /** Border configuration */
  borders: UIBorders;

  /** Animation settings */
  animations: UIAnimations;

  /** Component-specific styles */
  components: UIComponentStyles;
}

/**
 * UI color palette
 */
export interface UIColorPalette {
  /** Primary colors */
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };

  /** Secondary colors */
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };

  /** Semantic colors */
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };

  /** Background colors */
  background: {
    default: string;
    paper: string;
    elevated: string;
    overlay: string;
  };

  /** Text colors */
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    hint: string;
  };

  /** Border colors */
  border: {
    default: string;
    light: string;
    dark: string;
    focus: string;
  };

  /** Status colors */
  status: {
    active: string;
    inactive: string;
    pending: string;
    complete: string;
  };
}

/**
 * Typography configuration
 */
export interface UITypography {
  /** Font families */
  fontFamily: {
    primary: string;
    monospace: string;
    display: string;
  };

  /** Font sizes */
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };

  /** Font weights */
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    bold: number;
  };

  /** Line heights */
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };

  /** Letter spacing */
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

/**
 * Spacing configuration
 */
export interface UISpacing {
  /** Base spacing unit */
  unit: number;

  /** Spacing scale */
  scale: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };

  /** Component-specific spacing */
  component: {
    padding: number;
    margin: number;
    gap: number;
  };
}

/**
 * Border configuration
 */
export interface UIBorders {
  /** Border widths */
  width: {
    none: number;
    thin: number;
    medium: number;
    thick: number;
  };

  /** Border radius */
  radius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    full: number;
  };

  /** Border styles */
  style: {
    solid: string;
    dashed: string;
    dotted: string;
  };
}

/**
 * Animation configuration
 */
export interface UIAnimations {
  /** Animation durations */
  duration: {
    fast: number;
    normal: number;
    slow: number;
  };

  /** Easing functions */
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };

  /** Animation types */
  types: {
    fadeIn: UIAnimationConfig;
    fadeOut: UIAnimationConfig;
    slideIn: UIAnimationConfig;
    slideOut: UIAnimationConfig;
    scale: UIAnimationConfig;
    rotate: UIAnimationConfig;
  };
}

/**
 * Animation configuration
 */
export interface UIAnimationConfig {
  /** Animation duration */
  duration: number;

  /** Animation easing */
  easing: string;

  /** Animation keyframes */
  keyframes?: Record<string, Record<string, string>>;

  /** Animation delay */
  delay?: number;
}

/**
 * Component-specific styles
 */
export interface UIComponentStyles {
  /** Button styles */
  button: UIButtonStyles;

  /** Input styles */
  input: UIInputStyles;

  /** Table styles */
  table: UITableStyles;

  /** Modal styles */
  modal: UIModalStyles;

  /** Navigation styles */
  navigation: UINavigationStyles;

  /** Card styles */
  card: UICardStyles;

  /** Progress styles */
  progress: UIProgressStyles;
}

/**
 * Button styles
 */
export interface UIButtonStyles {
  /** Button variants */
  variants: {
    primary: UIComponentVariant;
    secondary: UIComponentVariant;
    outline: UIComponentVariant;
    ghost: UIComponentVariant;
    danger: UIComponentVariant;
  };

  /** Button sizes */
  sizes: {
    sm: UIComponentSize;
    md: UIComponentSize;
    lg: UIComponentSize;
  };
}

/**
 * Input styles
 */
export interface UIInputStyles {
  /** Input variants */
  variants: {
    default: UIComponentVariant;
    filled: UIComponentVariant;
    outline: UIComponentVariant;
  };

  /** Input states */
  states: {
    default: UIComponentState;
    focus: UIComponentState;
    error: UIComponentState;
    disabled: UIComponentState;
  };
}

/**
 * Table styles
 */
export interface UITableStyles {
  /** Table header styles */
  header: UIComponentVariant;

  /** Table row styles */
  row: {
    default: UIComponentVariant;
    hover: UIComponentVariant;
    selected: UIComponentVariant;
  };

  /** Table cell styles */
  cell: UIComponentVariant;
}

/**
 * Modal styles
 */
export interface UIModalStyles {
  /** Modal overlay */
  overlay: UIComponentVariant;

  /** Modal content */
  content: UIComponentVariant;

  /** Modal header */
  header: UIComponentVariant;

  /** Modal footer */
  footer: UIComponentVariant;
}

/**
 * Navigation styles
 */
export interface UINavigationStyles {
  /** Navigation container */
  container: UIComponentVariant;

  /** Navigation items */
  item: {
    default: UIComponentVariant;
    active: UIComponentVariant;
    hover: UIComponentVariant;
  };

  /** Navigation dividers */
  divider: UIComponentVariant;
}

/**
 * Card styles
 */
export interface UICardStyles {
  /** Card container */
  container: UIComponentVariant;

  /** Card header */
  header: UIComponentVariant;

  /** Card body */
  body: UIComponentVariant;

  /** Card footer */
  footer: UIComponentVariant;
}

/**
 * Progress styles
 */
export interface UIProgressStyles {
  /** Progress bar container */
  container: UIComponentVariant;

  /** Progress bar fill */
  fill: UIComponentVariant;

  /** Progress text */
  text: UIComponentVariant;
}

/**
 * Component variant definition
 */
export interface UIComponentVariant {
  /** Background color */
  backgroundColor?: string;

  /** Text color */
  color?: string;

  /** Border style */
  border?: string;

  /** Border radius */
  borderRadius?: string;

  /** Padding */
  padding?: string;

  /** Margin */
  margin?: string;

  /** Font size */
  fontSize?: string;

  /** Font weight */
  fontWeight?: number | string;

  /** Additional CSS properties */
  [key: string]: string | number | undefined;
}

/**
 * Component size definition
 */
export interface UIComponentSize {
  /** Height */
  height: string;

  /** Padding */
  padding: string;

  /** Font size */
  fontSize: string;

  /** Icon size */
  iconSize?: string;
}

/**
 * Component state definition
 */
export interface UIComponentState {
  /** State styles */
  styles: UIComponentVariant;

  /** State animation */
  animation?: UIAnimationConfig;
}

/**
 * UI component type union
 */
export type UIComponent =
  | 'button'
  | 'input'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'textarea'
  | 'table'
  | 'modal'
  | 'navigation'
  | 'card'
  | 'progress'
  | 'spinner'
  | 'toast'
  | 'tooltip'
  | 'tabs'
  | 'accordion'
  | 'breadcrumb'
  | 'pagination'
  | 'dropdown'
  | 'sidebar'
  | 'header'
  | 'footer';

/**
 * Screen state interface for managing UI state
 */
export interface ScreenState {
  /** Current screen identifier */
  currentScreen: string;

  /** Screen history stack */
  history: string[];

  /** Screen data */
  data: Record<string, unknown>;

  /** Loading states */
  loading: Record<string, boolean>;

  /** Error states */
  errors: Record<string, string | null>;

  /** Form states */
  forms: Record<string, FormState>;

  /** Modal states */
  modals: Record<string, ModalState>;

  /** Notification states */
  notifications: NotificationState[];

  /** Selection states */
  selections: Record<string, unknown>;

  /** Filter states */
  filters: Record<string, FilterState>;

  /** Pagination states */
  pagination: Record<string, PaginationState>;
}

/**
 * Form state interface
 */
export interface FormState {
  /** Form values */
  values: Record<string, unknown>;

  /** Form errors */
  errors: Record<string, string>;

  /** Form touched fields */
  touched: Record<string, boolean>;

  /** Form validation state */
  isValid: boolean;

  /** Form submission state */
  isSubmitting: boolean;

  /** Form dirty state */
  isDirty: boolean;
}

/**
 * Modal state interface
 */
export interface ModalState {
  /** Whether modal is open */
  isOpen: boolean;

  /** Modal data */
  data?: unknown;

  /** Modal size */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Modal type */
  type?: 'default' | 'confirmation' | 'alert' | 'form';
}

/**
 * Notification state interface
 */
export interface NotificationState {
  /** Notification ID */
  id: string;

  /** Notification type */
  type: 'success' | 'warning' | 'error' | 'info';

  /** Notification title */
  title: string;

  /** Notification message */
  message: string;

  /** Auto-dismiss timeout */
  timeout?: number;

  /** Whether notification is persistent */
  persistent?: boolean;

  /** Notification actions */
  actions?: NotificationAction[];
}

/**
 * Notification action interface
 */
export interface NotificationAction {
  /** Action label */
  label: string;

  /** Action handler */
  onClick: () => void;

  /** Action style */
  style?: 'primary' | 'secondary' | 'danger';
}

/**
 * Filter state interface
 */
export interface FilterState {
  /** Filter values */
  values: Record<string, unknown>;

  /** Active filters */
  active: string[];

  /** Filter options */
  options: Record<string, FilterOption[]>;
}

/**
 * Filter option interface
 */
export interface FilterOption {
  /** Option value */
  value: unknown;

  /** Option label */
  label: string;

  /** Option count */
  count?: number;

  /** Whether option is disabled */
  disabled?: boolean;
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  /** Current page */
  currentPage: number;

  /** Total pages */
  totalPages: number;

  /** Items per page */
  itemsPerPage: number;

  /** Total items */
  totalItems: number;

  /** Whether there is a next page */
  hasNext: boolean;

  /** Whether there is a previous page */
  hasPrevious: boolean;
}

/**
 * UI event handler types
 */
export interface UIEventHandlers {
  /** Click event handler */
  onClick?: (event: UIClickEvent) => void;

  /** Change event handler */
  onChange?: (event: UIChangeEvent) => void;

  /** Focus event handler */
  onFocus?: (event: UIFocusEvent) => void;

  /** Blur event handler */
  onBlur?: (event: UIBlurEvent) => void;

  /** Keydown event handler */
  onKeyDown?: (event: UIKeyboardEvent) => void;

  /** Submit event handler */
  onSubmit?: (event: UISubmitEvent) => void;
}

/**
 * UI event interfaces
 */
export interface UIClickEvent {
  /** Event target */
  target: unknown;

  /** Click coordinates */
  coordinates?: { x: number; y: number };

  /** Modifier keys */
  modifiers?: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
}

export interface UIChangeEvent {
  /** Event target */
  target: unknown;

  /** New value */
  value: unknown;

  /** Previous value */
  previousValue?: unknown;
}

export interface UIFocusEvent {
  /** Event target */
  target: unknown;

  /** Related target */
  relatedTarget?: unknown;
}

export interface UIBlurEvent {
  /** Event target */
  target: unknown;

  /** Related target */
  relatedTarget?: unknown;
}

export interface UIKeyboardEvent {
  /** Event target */
  target: unknown;

  /** Key code */
  key: string;

  /** Key code */
  keyCode: number;

  /** Modifier keys */
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
}

export interface UISubmitEvent {
  /** Event target */
  target: unknown;

  /** Form data */
  data: Record<string, unknown>;

  /** Prevent default behavior */
  preventDefault: () => void;
}
