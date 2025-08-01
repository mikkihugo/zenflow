/**
 * Notifications Plugin
 * Handles system notifications and alerts
 */

import { BasePlugin } from '../base-plugin.js';
import type { PluginManifest, PluginConfig, PluginContext } from '../types.js';

export class NotificationsPlugin extends BasePlugin {
  private notifications: any[] = [];

  constructor(manifest: PluginManifest, config: PluginConfig, context: PluginContext) {
    super(manifest, config, context);
  }

  async onInitialize(): Promise<void> {
    this.context.logger.info('Notifications Plugin initialized');
  }

  async onStart(): Promise<void> {
    this.context.logger.info('Notifications Plugin started');
  }

  async onStop(): Promise<void> {
    this.context.logger.info('Notifications Plugin stopped');
  }

  async onDestroy(): Promise<void> {
    this.notifications = [];
    this.context.logger.info('Notifications Plugin cleaned up');
  }

  async sendNotification(title: string, message: string, priority: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      priority,
      timestamp: new Date()
    };

    this.notifications.push(notification);
    this.context.logger.info(`Notification sent: ${title}`);
    this.emit('notification', notification);
  }

  getNotifications(): any[] {
    return [...this.notifications];
  }

  clearNotifications(): void {
    this.notifications = [];
  }
}

export default NotificationsPlugin;