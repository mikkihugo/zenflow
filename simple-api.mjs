#!/usr/bin/env node

/**
 * Ultra-simple API server without Express router
 * Direct routing to avoid path-to-regexp issues
 */

import http from 'http';
import url from 'url';

const PORT = 3000;

// Mock data
const workflows = [
  {
    id: 'wf-001',
    title: 'Authentication System Review',
    status: 'pending_approval',
    priority: 'high',
    submittedAt: '2024-01-15T10:30:00Z',
    description: 'Review and approve new JWT authentication implementation'
  },
  {
    id: 'wf-002', 
    title: 'Database Migration Strategy',
    status: 'in_review',
    priority: 'medium',
    submittedAt: '2024-01-14T14:20:00Z',
    description: 'Evaluate migration from SQLite to PostgreSQL'
  }
];

const roadmaps = [
  {
    id: 'rm-001',
    title: 'Q1 2024 Development Roadmap',
    status: 'active',
    progress: 75,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    milestones: 8,
    completedMilestones: 6
  }
];

const consultations = [
  {
    id: 'cons-001',
    title: 'React vs Vue Performance Analysis',
    expert: 'Dr. Sarah Chen - Frontend Architecture',
    status: 'completed',
    createdAt: '2024-01-10T09:00:00Z',
    recommendation: 'React with Next.js recommended for this use case'
  }
];

// Simple router function
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  console.log(`${new Date().toISOString()} - ${method} ${path}`);

  // API Routes
  if (path === '/api/health') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      message: 'Real API endpoints working!'
    }));
    return;
  }

  if (path === '/api/agu/workflows') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      data: {
        workflows,
        total: workflows.length,
        pending: workflows.filter(w => w.status === 'pending_approval').length,
        approved: workflows.filter(w => w.status === 'approved').length,
        rejected: workflows.filter(w => w.status === 'rejected').length
      }
    }));
    return;
  }

  if (path === '/api/roadmap/roadmaps') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      data: { roadmaps }
    }));
    return;
  }

  if (path === '/api/matron/consultations') {
    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      data: { consultations }
    }));
    return;
  }

  // API 404
  if (path.startsWith('/api/')) {
    res.statusCode = 404;
    res.end(JSON.stringify({
      success: false,
      error: 'Not Found',
      message: `API endpoint ${path} not found`
    }));
    return;
  }

  // Non-API routes - serve simple HTML
  res.setHeader('Content-Type', 'text/html');
  res.statusCode = 200;
  res.end(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Claude Code Zen API</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 40px; }
          .endpoint { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 5px; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>🚀 Claude Code Zen API Server</h1>
        <p>Working API endpoints:</p>
        <div class="endpoint"><strong>GET</strong> <a href="/api/health">/api/health</a> - Health check</div>
        <div class="endpoint"><strong>GET</strong> <a href="/api/agu/workflows">/api/agu/workflows</a> - AGU workflows</div>
        <div class="endpoint"><strong>GET</strong> <a href="/api/roadmap/roadmaps">/api/roadmap/roadmaps</a> - Roadmaps</div>
        <div class="endpoint"><strong>GET</strong> <a href="/api/matron/consultations">/api/matron/consultations</a> - Matron consultations</div>
        <p><em>✅ All endpoints return real JSON data (not Svelte 404 pages)</em></p>
      </body>
    </html>
  `);
}

// Create server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🚀 Simple API Server running on http://localhost:${PORT}`);
  console.log(`📊 Test endpoints:`);
  console.log(`   curl http://localhost:${PORT}/api/health`);
  console.log(`   curl http://localhost:${PORT}/api/agu/workflows`);
  console.log(`   curl http://localhost:${PORT}/api/roadmap/roadmaps`);
  console.log(`   curl http://localhost:${PORT}/api/matron/consultations`);
  console.log(`✅ Server ready - no Express routing issues`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down gracefully');
  server.close(() => process.exit(0));
});