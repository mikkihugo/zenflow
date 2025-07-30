/**
 * Notification System Plugin
 * Email and webhook notifications for Claude Zen events
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

export class NotificationPlugin {
  constructor(config = {}): any {
    this.config = {configFile = new Map();
    this.notificationConfig = null;
    this.eventQueue = [];
    this.processing = false;
  }

  async initialize() {
    console.warn('📧 Notification Plugin initialized');
    
    // Load notification configuration
    await this.loadNotificationConfig();
    
    // Initialize available providers
    await this.initializeProviders();
    
    // Start event processing
    this.startEventProcessing();
  }

  async loadNotificationConfig() {
    try {
      const content = await readFile(this.config.configFile, 'utf8');
      this.notificationConfig = JSON.parse(content);
    } catch(error) {
      if(error.code === 'ENOENT') {
        // Create default configuration
        this.notificationConfig = {providers = await this.createProvider(name, config);
        if(provider) {
          this.providers.set(name, {instance = await import('nodemailer');
      
      const transporter = nodemailer.default.createTransporter({
        host = {from = await transporter.sendMail(mailOptions);
          return {messageId = [];
        
        for(const url of config.urls) {
          try {
            const _response = await fetch(url, {method = [];
        
        for(const url of config.urls) {
          try {
            const _response = await fetch(url, {method = > result.healthy);
      }
    };
  }

  createConsoleProvider(config): any {
    const _colors = {reset = (priority) => {
      if (!config.colorize) return '';
      
      switch(priority) {
        case 'critical': return _colors.red + _colors.bright;
        case 'high': return _colors.red;
        case 'medium': return _colors.yellow;
        case 'low': return _colors.cyan;default = config.timestamp ? 
          `[${new Date().toISOString()}] ` : '';
        const _color = getColor(notification.priority);
        const _reset = config.colorize ? _colors.reset = {}): any {
    const eventConfig = this.notificationConfig.events[event];
    if(!eventConfig || !eventConfig.enabled) {
      return {success = await this.buildNotification(event, data, eventConfig);
    
    // Add to queue for processing
    this.eventQueue.push({
      notification,providers = this.notificationConfig.templates[eventConfig.template];
    if(!template) {
      throw new Error(`Template ${eventConfig.template} not found`);
    }

    const context = {
      event,
      timestamp => {
      const value = this.getNestedValue(context, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  getNestedValue(obj, path): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  async processEventQueue() {
    if (this.processing) return;
    this.processing = true;

    while(this.eventQueue.length > 0) {
      const item = this.eventQueue.shift();
      await this.processNotification(item);
    }

    this.processing = false;
  }

  async processNotification(item): any {
    const { notification, providers } = item;
    const results = [];

    for(const providerName of providers) {
      const providerInfo = this.providers.get(providerName);
      if(!providerInfo || !providerInfo.healthy) {
        results.push({provider = await providerInfo.instance.send(notification);
        results.push({provider = Date.now();
        providerInfo.errorCount = Math.max(0, providerInfo.errorCount - 1);
      } catch(error) 
        results.push(provider = 3) 
          providerInfo.healthy = false;
          console.warn(`⚠️ Notification provider ${providerName} marked as unhealthy`);

        // Retry logic
        if(item.attempts < this.config.retryAttempts) {
          item.attempts++;
          setTimeout(() => {
            this.eventQueue.push(item);
            if(!this.processing) {
              this.processEventQueue();
            }
          }, this.config.retryDelay);
        }

    return results;
  }

  // Convenience methods for common events
  async notifyTaskCompleted(taskData): any 
    return this.notify('task.completed', { task = {}): any {
    return this.notify('system.error', { error, ...context });

  async notifyHealthCheck(systemData): any 
    return this.notify('health.check', {system = true;
      await this.saveNotificationConfig();
      return `Event ${eventName} enabled`;
    throw new Error(`Event ${eventName} not found`);
  }

  async disableEvent(eventName): any {
    if(this.notificationConfig.events[eventName]) {
      this.notificationConfig.events[eventName].enabled = false;
      await this.saveNotificationConfig();
      return `Event ${eventName} disabled`;
    }
    throw new Error(`Event ${eventName} not found`);
  }

  async enableProvider(providerName): any {
    if(this.notificationConfig.providers[providerName]) {
      this.notificationConfig.providers[providerName].enabled = true;
      await this.saveNotificationConfig();
      
      // Try to initialize the provider
      const config = this.notificationConfig.providers[providerName];
      try {
        const provider = await this.createProvider(providerName, config);
        if(provider) {
          this.providers.set(providerName, {instance = false;
      await this.saveNotificationConfig();
      
      // Remove from active providers
      this.providers.delete(providerName);
      
      return `Provider ${providerName} disabled`;
    }
    throw new Error(`Provider ${providerName} not found`);
  }

  async runHealthChecks() {
    const healthResults = {};
    
    for(const [name, info] of this.providers) {
      try {
        if(info.instance.healthCheck) {
          const isHealthy = await info.instance.healthCheck();
          info.healthy = isHealthy;
          healthResults[name] = { healthy, errorCount = {healthy = false;
        healthResults[name] = { healthy, error = {providers = {type = {enabled = true;
    
    // Process event queue every 1 second
    setInterval(async () => {
      if(this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        try {
          await this.processNotification(event.notification, event.providers);
        } catch(_error) {
          console.warn('📧 Event processingerror = [];
    
    for(const providerName of providers) {
      const providerInfo = this.providers.get(providerName);
      if(!providerInfo || !providerInfo.enabled) {
        continue;
      }
      
      try {
        const _result = await providerInfo.instance.send(notification);
        results.push({provider = [];
    this.processing = false;
    
    // Clean up providers
    for(const [name, info] of this.providers) {
      if(info.instance.cleanup) {
        try {
          await info.instance.cleanup();
        } catch(error) {
          console.warn(`Warning: ${name} cleanup failed:`, error.message);
        }
      }
    }
    
    this.providers.clear();
    console.warn('📧 Notification Plugin cleaned up');
  }
}

export default NotificationPlugin;
