/**
 * Notification system for dashboard user feedback
 * Provides toast notifications and alert management
 */

import { toast } from '@zerodevx/svelte-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  duration?: number;
  dismissible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  id?: number;
}

/**
 * Notification theme configurations
 */
const themes = {
  success: {
    '--toastBackground': '#10b981',
    '--toastColor': 'white',
    '--toastBarBackground': '#047857',
  },
  error: {
    '--toastBackground': '#ef4444',
    '--toastColor': 'white',
    '--toastBarBackground': '#dc2626',
  },
  warning: {
    '--toastBackground': '#f59e0b',
    '--toastColor': 'white',
    '--toastBarBackground': '#d97706',
  },
  info: {
    '--toastBackground': '#0ea5e9',
    '--toastColor': 'white',
    '--toastBarBackground': '#0284c7',
  },
};

/**
 * Notification icons
 */
const icons = {
  success: '',
  error: '',
  warning: '',
  info: 'ℹ️',
};

/**
 * Show success notification
 */
export function notifySuccess(
  message: string,
  options: NotificationOptions = {}
): number {
  return toast.push((icons.success) + ' ' + message, {
    theme: themes.success,
    duration: options.duration || 4000,
    dismissible: options.dismissible ?? true,
    ...options,
  });
}

/**
 * Show error notification
 */
export function notifyError(
  message: string,
  options: NotificationOptions = {}
): number {
  return toast.push((icons.error) + ' ' + message, {
    theme: themes.error,
    duration: options.duration || 6000,
    dismissible: options.dismissible ?? true,
    ...options,
  });
}

/**
 * Show warning notification
 */
export function notifyWarning(
  message: string,
  options: NotificationOptions = {}
): number {
  return toast.push((icons.warning) + ' ' + message, {
    theme: themes.warning,
    duration: options.duration || 5000,
    dismissible: options.dismissible ?? true,
    ...options,
  });
}

/**
 * Show info notification
 */
export function notifyInfo(
  message: string,
  options: NotificationOptions = {}
): number {
  return toast.push((icons.info) + ' ' + message, {
    theme: themes.info,
    duration: options.duration || 4000,
    dismissible: options.dismissible ?? true,
    ...options,
  });
}

/**
 * Show generic notification with custom type
 */
export function notify(
  message: string,
  type: NotificationType = 'info',
  options: NotificationOptions = {}
): number {
  const icon = icons[type];
  const theme = themes[type];

  return toast.push((icon) + ' ' + message, {
    theme,
    duration: options.duration || 4000,
    dismissible: options.dismissible ?? true,
    ...options,
  });
}

/**
 * Show loading notification (persistent until dismissed)
 */
export function notifyLoading(
  message: string,
  options: NotificationOptions = {}
): number {
  return toast.push('⏳ ' + message, {
    theme: {
      '--toastBackground': '#64748b',
      '--toastColor': 'white',
      '--toastBarBackground': '#475569',
    },
    duration: 0, // Persistent
    dismissible: options.dismissible ?? false,
    ...options,
  });
}

/**
 * Dismiss specific notification
 */
export function dismissNotification(id: number): void {
  toast.pop(id);
}

/**
 * Dismiss all notifications
 */
export function dismissAllNotifications(): void {
  toast.pop(0); // Pop all
}

/**
 * System event notifications
 */
export const systemNotifications = {
  /**
   * WebSocket connection events
   */
  websocket: {
    connected: () => notifySuccess('Real-time updates connected'),
    disconnected: () => notifyWarning('Real-time connection lost'),
    reconnected: () => notifySuccess('Real-time connection restored'),
    failed: (error?: string) =>
      notifyError('Connection failed' + error ? ':' + error : ''),
  },

  /**
   * API operation events
   */
  api: {
    success: (operation: string) =>
      notifySuccess(operation + ' completed successfully'),
    error: (operation: string, error?: string) =>
      notifyError((operation) + ' failed' + error ? ':' + error : ''),
    loading: (operation: string) =>
      notifyLoading(operation + ' in progress...'),
  },

  /**
   * System status events
   */
  system: {
    healthy: () => notifySuccess('System is healthy'),
    warning: (message: string) => notifyWarning('System warning: ' + message),
    error: (message: string) => notifyError('System error: ' + message),
    maintenance: () => notifyInfo('System maintenance mode active'),
  },

  /**
   * Agent events
   */
  agents: {
    created: (name: string) =>
      notifySuccess('Agent "' + name + '" created successfully'),
    removed: (name: string) => notifyWarning('Agent "' + name + '" removed'),
    error: (name: string, error: string) =>
      notifyError('Agent "' + (name) + '" error:' + error),
    statusChange: (name: string, status: string) =>
      notifyInfo('Agent "' + (name) + '" status changed to ' + status),
  },

  /**
   * Task events
   */
  tasks: {
    created: (title: string) => notifySuccess('Task "' + title + '" created'),
    completed: (title: string) => notifySuccess('Task "' + title + '" completed'),
    failed: (title: string, error?: string) =>
      notifyError('Task "' + (title) + '" failed' + error ? ':' + error : ''),
    assigned: (title: string, agent: string) =>
      notifyInfo('Task "' + (title) + '" assigned to ' + agent),
  },
};

/**
 * Notification queue for bulk operations
 */
export class NotificationQueue {
  private queue: Array<{
    message: string;
    type: NotificationType;
    options?: NotificationOptions;
  }> = [];
  private isProcessing = false;
  private delay = 300; // ms between notifications

  add(
    message: string,
    type: NotificationType = 'info',
    options?: NotificationOptions
  ): void {
    this.queue.push({ message, type, options });
    if (!this.isProcessing) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        notify(item.message, item.type, item.options);
        if (this.queue.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, this.delay));
        }
      }
    }

    this.isProcessing = false;
  }

  clear(): void {
    this.queue = [];
  }

  getQueueLength(): number {
    return this.queue.length;
  }
}

/**
 * Global notification queue instance
 */
export const notificationQueue = new NotificationQueue();
