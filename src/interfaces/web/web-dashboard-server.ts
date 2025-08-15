/**
 * @file Auto-Generated Web Dashboard Server Implementation
 * 
 * Advanced HTTP server using existing WebHtmlGenerator and panels.
 */

import { createServer, type Server } from 'node:http';
import { getLogger } from '../../config/logging-config';
import { WebHtmlGenerator } from './web-html-generator';
import { WebConfig } from './web-config';

interface WebDashboardConfig {
  port: number;
  host?: string;
}

export class WebDashboardServer {
  private server: Server;
  private readonly logger = getLogger('WebDashboardServer');
  private htmlGenerator: WebHtmlGenerator;
  
  constructor(private config: WebDashboardConfig) {
    // Initialize web config for the HTML generator
    const webConfig: WebConfig = {
      port: config.port,
      host: config.host || 'localhost',
      realTime: true,
      cors: true,
      theme: 'dark'
    };
    
    this.htmlGenerator = new WebHtmlGenerator(webConfig);
    
    this.server = createServer((req, res) => {
      this.handleRequest(req, res);
    });
  }

  private handleRequest(req: any, res: any): void {
    const url = req.url || '/';
    
    try {
      // Health check endpoint
      if (url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          service: 'claude-code-zen',
          dashboard: 'auto-generated'
        }));
        return;
      }
      
      // API endpoints
      if (url.startsWith('/api/')) {
        this.handleApiRequest(url, req, res);
        return;
      }
      
      // Main dashboard (auto-generated)
      if (url === '/' || url === '/dashboard') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        const dashboardHtml = this.htmlGenerator.generateDashboardHtml();
        res.end(dashboardHtml);
        return;
      }
      
      // Status page
      if (url === '/status') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        const statusHtml = this.htmlGenerator.generateStatusPageHtml();
        res.end(statusHtml);
        return;
      }
      
      // Metrics page
      if (url === '/metrics') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        const metricsHtml = this.htmlGenerator.generateMetricsHtml();
        res.end(metricsHtml);
        return;
      }
      
      // 404 for other routes
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      
    } catch (error) {
      this.logger.error('Request handling error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  }

  private handleApiRequest(url: string, req: any, res: any): void {
    // Basic API routing
    if (url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: require('../../../package.json').version || '1.0.0'
      }));
      return;
    }
    
    // API 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }

  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.host || 'localhost', () => {
        this.logger.info(`🌐 Web dashboard server started on http://${this.config.host || 'localhost'}:${this.config.port}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        this.logger.info('🛑 Web dashboard server stopped');
        resolve();
      });
    });
  }

  static getCapabilities() {
    return {
      webDashboard: true,
      healthCheck: true,
      basicRouting: true
    };
  }
}