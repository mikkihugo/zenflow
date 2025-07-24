/**
 * Notification System Plugin
 * Email and webhook notifications for Claude Zen events
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';

export class NotificationPlugin {
  constructor(config = {}) {
    this.config = {
      configFile: path.join(process.cwd(), '.hive-mind', 'notifications.json'),
      enabled: true,
      retryAttempts: 3,
      retryDelay: 5000,
      timeout: 10000,
      ...config
    };
    
    this.providers = new Map();
    this.notificationConfig = null;
    this.eventQueue = [];
    this.processing = false;
  }

  async initialize() {
    console.log('📧 Notification Plugin initialized');
    
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
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Create default configuration
        this.notificationConfig = {
          providers: {
            email: {
              enabled: false,
              type: 'smtp',
              config: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS
                },
                from: process.env.EMAIL_FROM || 'claude-zen@example.com',
                to: process.env.EMAIL_TO || 'admin@example.com'
              }
            },
            webhook: {
              enabled: true,
              type: 'webhook',
              config: {
                urls: [
                  // Add webhook URLs here
                ],
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'User-Agent': 'Claude-Zen-Notifications/1.0'
                },
                timeout: 10000,
                retryAttempts: 2
              }
            },
            console: {
              enabled: true,
              type: 'console',
              config: {
                colorize: true,
                timestamp: true,
                level: 'info'
              }
            }
          },
          events: {
            'task.completed': {
              enabled: true,
              providers: ['console', 'webhook'],
              template: 'task_completed'
            },
            'task.failed': {
              enabled: true,
              providers: ['console', 'email', 'webhook'],
              template: 'task_failed',
              priority: 'high'
            },
            'swarm.created': {
              enabled: true,
              providers: ['console'],
              template: 'swarm_created'
            },
            'agent.spawned': {
              enabled: false,
              providers: ['console'],
              template: 'agent_spawned'
            },
            'system.error': {
              enabled: true,
              providers: ['console', 'email', 'webhook'],
              template: 'system_error',
              priority: 'critical'
            },
            'health.check': {
              enabled: false,
              providers: ['webhook'],
              template: 'health_check'
            }
          },
          templates: {
            task_completed: {
              subject: '✅ Task Completed - {{task.name}}',
              body: 'Task "{{task.name}}" has been completed successfully.\n\nDetails:\n- Duration: {{task.duration}}\n- Status: {{task.status}}\n- Results: {{task.results}}'
            },
            task_failed: {
              subject: '❌ Task Failed - {{task.name}}',
              body: 'Task "{{task.name}}" has failed.\n\nError: {{error.message}}\nStack: {{error.stack}}\n\nPlease investigate and resolve the issue.'
            },
            swarm_created: {
              subject: '🐝 Swarm Created - {{swarm.name}}',
              body: 'New swarm "{{swarm.name}}" has been created.\n\nConfiguration:\n- Topology: {{swarm.topology}}\n- Max Agents: {{swarm.maxAgents}}\n- Strategy: {{swarm.strategy}}'
            },
            agent_spawned: {
              subject: '🤖 Agent Spawned - {{agent.name}}',
              body: 'New agent "{{agent.name}}" has been spawned.\n\nType: {{agent.type}}\nCapabilities: {{agent.capabilities}}'
            },
            system_error: {
              subject: '🚨 System Error - {{error.type}}',
              body: 'A system error has occurred.\n\nError: {{error.message}}\nStack: {{error.stack}}\nTimestamp: {{timestamp}}\n\nImmediate attention required.'
            },
            health_check: {
              subject: '🏥 Health Check - {{system.status}}',
              body: 'System health check completed.\n\nStatus: {{system.status}}\nServices: {{system.services}}\nMetrics: {{system.metrics}}'
            }
          }
        };
        await this.saveNotificationConfig();
      } else {
        throw error;
      }
    }
  }

  async saveNotificationConfig() {
    await writeFile(this.config.configFile, JSON.stringify(this.notificationConfig, null, 2));
  }

  async initializeProviders() {
    for (const [name, config] of Object.entries(this.notificationConfig.providers)) {
      if (!config.enabled) continue;
      
      try {
        const provider = await this.createProvider(name, config);
        if (provider) {
          this.providers.set(name, {
            instance: provider,
            config: config,
            healthy: true,
            lastUsed: null,
            errorCount: 0
          });
          console.log(`✅ ${name} notification provider initialized`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to initialize ${name} provider: ${error.message}`);
      }
    }
  }

  async createProvider(name, config) {
    switch (config.type) {
      case 'smtp':
        return await this.createEmailProvider(config.config);
      case 'webhook':
        return await this.createWebhookProvider(config.config);
      case 'console':
        return this.createConsoleProvider(config.config);
      default:
        throw new Error(`Unknown provider type: ${config.type}`);
    }
  }

  async createEmailProvider(config) {
    try {
      const nodemailer = await import('nodemailer');
      
      const transporter = nodemailer.default.createTransporter({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth
      });

      // Verify connection
      await transporter.verify();

      return {
        type: 'email',
        async send(notification) {
          const mailOptions = {
            from: config.from,
            to: config.to,
            subject: notification.subject,
            text: notification.body,
            html: notification.html || notification.body
          };

          const info = await transporter.sendMail(mailOptions);
          return { messageId: info.messageId, success: true };
        },

        async healthCheck() {
          try {
            await transporter.verify();
            return true;
          } catch (error) {
            return false;
          }
        }
      };
    } catch (error) {
      console.warn('Email provider not available:', error.message);
      return null;
    }
  }

  async createWebhookProvider(config) {
    return {
      type: 'webhook',
      async send(notification) {
        const results = [];
        
        for (const url of config.urls) {
          try {
            const response = await fetch(url, {
              method: config.method || 'POST',
              headers: config.headers,
              body: JSON.stringify({
                event: notification.event,
                timestamp: notification.timestamp,
                data: notification.data,
                subject: notification.subject,
                body: notification.body,
                priority: notification.priority
              }),
              timeout: config.timeout || 10000
            });

            if (response.ok) {
              results.push({ url, success: true, status: response.status });
            } else {
              results.push({ url, success: false, status: response.status, error: response.statusText });
            }
          } catch (error) {
            results.push({ url, success: false, error: error.message });
          }
        }

        return results;
      },

      async healthCheck() {
        // Simple health check - just verify URLs are reachable
        const healthResults = [];
        
        for (const url of config.urls) {
          try {
            const response = await fetch(url, { method: 'HEAD', timeout: 5000 });
            healthResults.push({ url, healthy: response.ok });
          } catch (error) {
            healthResults.push({ url, healthy: false, error: error.message });
          }
        }

        return healthResults.some(result => result.healthy);
      }
    };
  }

  createConsoleProvider(config) {
    const colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m'
    };

    const getColor = (priority) => {
      if (!config.colorize) return '';
      
      switch (priority) {
        case 'critical': return colors.red + colors.bright;
        case 'high': return colors.red;
        case 'medium': return colors.yellow;
        case 'low': return colors.cyan;
        default: return colors.reset;
      }
    };

    return {
      type: 'console',
      async send(notification) {
        const timestamp = config.timestamp ? 
          `[${new Date().toISOString()}] ` : '';
        const color = getColor(notification.priority);
        const reset = config.colorize ? colors.reset : '';

        console.log(`${color}${timestamp}📢 ${notification.subject}${reset}`);
        if (notification.body) {
          console.log(`${color}${notification.body}${reset}`);
        }

        return { success: true, output: 'console' };
      },

      async healthCheck() {
        return true; // Console is always available
      }
    };
  }

  async notify(event, data = {}) {
    const eventConfig = this.notificationConfig.events[event];
    if (!eventConfig || !eventConfig.enabled) {
      return { success: false, reason: 'Event not configured or disabled' };
    }

    const notification = await this.buildNotification(event, data, eventConfig);
    
    // Add to queue for processing
    this.eventQueue.push({
      notification,
      providers: eventConfig.providers,
      timestamp: Date.now(),
      attempts: 0
    });

    // Start processing if not already running
    if (!this.processing) {
      this.processEventQueue();
    }

    return { success: true, queued: true };
  }

  async buildNotification(event, data, eventConfig) {
    const template = this.notificationConfig.templates[eventConfig.template];
    if (!template) {
      throw new Error(`Template ${eventConfig.template} not found`);
    }

    const context = {
      event,
      timestamp: new Date().toISOString(),
      data,
      ...data // Flatten data for easier template access
    };

    return {
      event,
      timestamp: context.timestamp,
      data,
      subject: this.renderTemplate(template.subject, context),
      body: this.renderTemplate(template.body, context),
      priority: eventConfig.priority || 'medium'
    };
  }

  renderTemplate(template, context) {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getNestedValue(context, path.trim());
      return value !== undefined ? String(value) : match;
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  async processEventQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.eventQueue.length > 0) {
      const item = this.eventQueue.shift();
      await this.processNotification(item);
    }

    this.processing = false;
  }

  async processNotification(item) {
    const { notification, providers } = item;
    const results = [];

    for (const providerName of providers) {
      const providerInfo = this.providers.get(providerName);
      if (!providerInfo || !providerInfo.healthy) {
        results.push({ provider: providerName, success: false, reason: 'Provider unavailable' });
        continue;
      }

      try {
        const result = await providerInfo.instance.send(notification);
        results.push({ provider: providerName, success: true, result });
        
        // Update provider stats
        providerInfo.lastUsed = Date.now();
        providerInfo.errorCount = Math.max(0, providerInfo.errorCount - 1);
      } catch (error) {
        results.push({ provider: providerName, success: false, error: error.message });
        
        // Update error count
        providerInfo.errorCount++;
        if (providerInfo.errorCount >= 3) {
          providerInfo.healthy = false;
          console.warn(`⚠️ Notification provider ${providerName} marked as unhealthy`);
        }

        // Retry logic
        if (item.attempts < this.config.retryAttempts) {
          item.attempts++;
          setTimeout(() => {
            this.eventQueue.push(item);
            if (!this.processing) {
              this.processEventQueue();
            }
          }, this.config.retryDelay);
        }
      }
    }

    return results;
  }

  // Convenience methods for common events
  async notifyTaskCompleted(taskData) {
    return this.notify('task.completed', { task: taskData });
  }

  async notifyTaskFailed(taskData, error) {
    return this.notify('task.failed', { task: taskData, error });
  }

  async notifySwarmCreated(swarmData) {
    return this.notify('swarm.created', { swarm: swarmData });
  }

  async notifyAgentSpawned(agentData) {
    return this.notify('agent.spawned', { agent: agentData });
  }

  async notifySystemError(error, context = {}) {
    return this.notify('system.error', { error, ...context });
  }

  async notifyHealthCheck(systemData) {
    return this.notify('health.check', { system: systemData });
  }

  // Management methods
  async enableEvent(eventName) {
    if (this.notificationConfig.events[eventName]) {
      this.notificationConfig.events[eventName].enabled = true;
      await this.saveNotificationConfig();
      return `Event ${eventName} enabled`;
    }
    throw new Error(`Event ${eventName} not found`);
  }

  async disableEvent(eventName) {
    if (this.notificationConfig.events[eventName]) {
      this.notificationConfig.events[eventName].enabled = false;
      await this.saveNotificationConfig();
      return `Event ${eventName} disabled`;
    }
    throw new Error(`Event ${eventName} not found`);
  }

  async enableProvider(providerName) {
    if (this.notificationConfig.providers[providerName]) {
      this.notificationConfig.providers[providerName].enabled = true;
      await this.saveNotificationConfig();
      
      // Try to initialize the provider
      const config = this.notificationConfig.providers[providerName];
      try {
        const provider = await this.createProvider(providerName, config);
        if (provider) {
          this.providers.set(providerName, {
            instance: provider,
            config: config,
            healthy: true,
            lastUsed: null,
            errorCount: 0
          });
          console.log(`✅ ${providerName} notification provider enabled`);
        }
      } catch (error) {
        console.warn(`⚠️ Failed to initialize ${providerName}: ${error.message}`);
      }
      
      return `Provider ${providerName} enabled`;
    }
    throw new Error(`Provider ${providerName} not found`);
  }

  async disableProvider(providerName) {
    if (this.notificationConfig.providers[providerName]) {
      this.notificationConfig.providers[providerName].enabled = false;
      await this.saveNotificationConfig();
      
      // Remove from active providers
      this.providers.delete(providerName);
      
      return `Provider ${providerName} disabled`;
    }
    throw new Error(`Provider ${providerName} not found`);
  }

  async runHealthChecks() {
    const healthResults = {};
    
    for (const [name, info] of this.providers) {
      try {
        if (info.instance.healthCheck) {
          const isHealthy = await info.instance.healthCheck();
          info.healthy = isHealthy;
          healthResults[name] = { healthy: isHealthy, errorCount: info.errorCount };
        } else {
          healthResults[name] = { healthy: info.healthy, errorCount: info.errorCount };
        }
      } catch (error) {
        info.healthy = false;
        healthResults[name] = { healthy: false, error: error.message };
      }
    }
    
    return healthResults;
  }

  async getStats() {
    const stats = {
      providers: {},
      events: {},
      queue: {
        pending: this.eventQueue.length,
        processing: this.processing
      }
    };
    
    // Provider stats
    for (const [name, info] of this.providers) {
      stats.providers[name] = {
        type: info.instance.type,
        healthy: info.healthy,
        errorCount: info.errorCount,
        lastUsed: info.lastUsed,
        enabled: this.notificationConfig.providers[name]?.enabled || false
      };
    }
    
    // Event stats
    for (const [name, config] of Object.entries(this.notificationConfig.events)) {
      stats.events[name] = {
        enabled: config.enabled,
        providers: config.providers,
        priority: config.priority || 'medium',
        template: config.template
      };
    }
    
    return stats;
  }

  async cleanup() {
    // Clear event queue
    this.eventQueue = [];
    this.processing = false;
    
    // Clean up providers
    for (const [name, info] of this.providers) {
      if (info.instance.cleanup) {
        try {
          await info.instance.cleanup();
        } catch (error) {
          console.warn(`Warning: ${name} cleanup failed:`, error.message);
        }
      }
    }
    
    this.providers.clear();
    console.log('📧 Notification Plugin cleaned up');
  }
}

export default NotificationPlugin;