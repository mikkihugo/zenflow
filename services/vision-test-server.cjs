#!/usr/bin/env node
/**
 * Vision-to-Code Test Server
 * Simple HTTP server to verify staging deployment infrastructure
 */

const express = require('express');

class VisionTestServer {
  constructor(port) {
    this.port = port;
    this.app = express();
    this.setupRoutes();
  }

  setupRoutes() {
    // Health endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'vision-test-server',
        port: this.port,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
      });
    });

    // Info endpoint
    this.app.get('/info', (req, res) => {
      res.json({
        service: 'vision-test-server',
        version: '1.0.0',
        description: 'Vision-to-Code deployment test server',
        port: this.port,
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
          health: 'GET /health',
          info: 'GET /info',
          status: 'GET /status'
        }
      });
    });

    // Status endpoint
    this.app.get('/status', (req, res) => {
      res.json({
        status: 'running',
        service: 'vision-test-server',
        port: this.port,
        pid: process.pid,
        platform: process.platform,
        node_version: process.version,
        timestamp: new Date().toISOString()
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log(`🚀 Vision Test Server running on port ${this.port}`);
          console.log(`📊 Health check: http://localhost:${this.port}/health`);
          console.log(`ℹ️  Service info: http://localhost:${this.port}/info`);
          resolve(this.server);
        }
      });
    });
  }

  stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log(`🛑 Vision Test Server stopped`);
          resolve();
        });
      });
    }
  }
}

// Start server if run directly
if (require.main === module) {
  const port = process.env.PORT || 4106;
  const server = new VisionTestServer(port);
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  // Start server
  server.start().catch((error) => {
    console.error('Failed to start Vision Test Server:', error);
    process.exit(1);
  });
}

module.exports = VisionTestServer;