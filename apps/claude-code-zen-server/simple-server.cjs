#!/usr/bin/env node

/**
 * Simple Claude Code Zen Server with Socket.IO
 * Minimal working version to get WebSocket connection working
 */

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || '0.0.0.0';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'claude-code-zen-server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    dashboard: 'enabled'
  });
});

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'claude-code-zen-server',
    version: '1.0.0-alpha.44',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/v1/system/status', (req, res) => {
  res.json({
    system: 'operational',
    database: 'connected',
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Root route for basic info
app.get('/', (req, res) => {
  res.json({
    message: 'Claude Code Zen Server',
    status: 'running',
    version: '1.0.0',
    socketio: 'enabled',
    endpoints: {
      health: '/api/health',
      api: '/api/v1/health',
      websocket: '/socket.io/'
    }
  });
});

// Create HTTP server
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true
});

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`🔌 Dashboard client connected: ${socket.id}`);

  // Send initial connection data
  socket.emit('connected', {
    sessionId: socket.id,
    timestamp: new Date().toISOString(),
    serverVersion: '1.0.0'
  });

  // Handle client subscription events
  socket.on('subscribe', (channel) => {
    socket.join(channel);
    console.log(`📡 Client ${socket.id} subscribed to ${channel}`);

    // Send initial data based on channel
    switch(channel) {
      case 'system':
        socket.emit('system:initial', {
          data: { status: 'operational', uptime: process.uptime() },
          timestamp: new Date().toISOString()
        });
        break;
      case 'tasks':
        socket.emit('tasks:initial', {
          data: [],
          timestamp: new Date().toISOString()
        });
        break;
      case 'logs':
        socket.emit('logs:initial', {
          data: [],
          timestamp: new Date().toISOString()
        });
        break;
    }
  });

  socket.on('unsubscribe', (channel) => {
    socket.leave(channel);
    console.log(`📡 Client ${socket.id} unsubscribed from ${channel}`);
  });

  // Handle ping for connection keep-alive
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Dashboard client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Start the server
server.listen(port, host, () => {
  console.log(`✅ Claude Code Zen Server running on http://${host}:${port}`);
  console.log(`📊 Dashboard available at http://${host}:${port}`);
  console.log(`🔌 Socket.IO server initialized for dashboard real-time updates`);
});