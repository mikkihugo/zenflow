#!/usr/bin/env node
/**
 * Simple API Server - Bypassing problematic packages
 */
const express = require('express');
const { createTerminus } = require('@godaddy/terminus');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');

console.log('🚀 Starting Simple API Server...');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Essential middleware without problematic packages
console.log('🔒 Setting up essential middleware...');

// CORS
app.use(cors({
  origin: true,
  credentials: true,
}));

// Compression
app.use(compression());

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
}));

console.log('✅ Essential middleware configured');

// Simple health check (no express-healthcheck)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(), 
    timestamp: new Date().toISOString(),
    version: '1.0.0-alpha.44'
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    server: 'Claude Code Zen API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Claude Code Zen API Server',
    version: '1.0.0-alpha.44',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ API routes configured');

// Create server
const server = app.listen(port, host, () => {
  console.log(`🌐 Simple server started on http://${host}:${port}`);
  console.log(`🏥 Health check: http://${host}:${port}/api/health`);
  console.log('✅ Server ready');
});

// Setup terminus
createTerminus(server, {
  signals: ['SIGTERM', 'SIGINT'],
  timeout: 5000,
  healthChecks: {
    '/health': () => ({ status: 'ok' }),
  },
  onSignal: async () => {
    console.log('🔄 Graceful shutdown...');
  },
  logger: (msg) => console.log('Terminus:', msg)
});

console.log('🛡️ Terminus configured');
console.log('✅ Server fully ready');
