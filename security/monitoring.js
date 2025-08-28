/**
 * Security Monitoring & Alerting System
 */

export class SecurityMonitor {
  constructor(options = {}) {
    this.alertWebhook = options.alertWebhook;
    this.logFile = options.logFile || '/var/log/claude-zen/security.log';
    this.alerts = [];
  }

  logSecurityEvent(event) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      severity: event.severity || 'info',
      type: event.type,
      source: event.source,
      message: event.message,
      metadata: event.metadata || {},
      ip: event.ip,
      userAgent: event.userAgent,
    };

    // Log to file
    this.writeToLog(logEntry);

    // Send alert if high severity
    if (event.severity === 'critical' || event.severity === 'high') {
      this.sendAlert(logEntry);
    }
  }

  writeToLog(entry) {
    const logLine = `${JSON.stringify(entry)}\n`;

    // Write to log file
    const fs = require('node:fs');
    fs.appendFileSync(this.logFile, logLine);
  }

  async sendAlert(event) {
    if (!this.alertWebhook) return;

    try {
      const alert = {
        title: `Security Alert: ${event.type}`,
        message: event.message,
        severity: event.severity,
        timestamp: event.timestamp,
        source: event.source,
        metadata: event.metadata,
      };

      // Send alert to webhook
      const fetch = require('node-fetch');
      await fetch(this.alertWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      logger.error('Failed to send security alert:', error);
    }
  }

  monitorFailedLogins(req, res, next) {
    const originalSend = res.send;
    res.send = function (data) {
      if (res.statusCode === 401) {
        this.logSecurityEvent({
          type: 'failed_login',
          severity: 'medium',
          source: 'authentication',
          message: 'Failed login attempt',
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: { path: req.path },
        });
      }
      originalSend.call(this, data);
    }.bind(this);

    next();
  }

  detectSuspiciousActivity(req, res, next) {
    const suspiciousPatterns = [
      /\.\.|\.\.[\\/]/, // Path traversal
      /<script|javascript:|data:text/html/i, // XSS attempts
      /union|select|insert|update|delete|drop/i, // SQL injection
      /cmd|eval|exec|system/i // Command injection
    ];

    const requestData = JSON.stringify({
      url: req.url,
      body: req.body,
      query: req.query,
      headers: req.headers,
    });

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestData)) {
        this.logSecurityEvent({
          type: 'suspicious_activity',
          severity: 'high',
          source: 'request_analysis',
          message: `Suspicious pattern detected: ${pattern}`,
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          metadata: {
            pattern: pattern.toString(),
            path: req.path,
            method: req.method,
          },
        });

        return res.status(400).json({ error: 'Suspicious activity detected' });
      }
    }

    next();
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor({
  alertWebhook: process.env.SECURITY_WEBHOOK_URL,
  logFile: process.env.SECURITY_LOG_FILE,
});
