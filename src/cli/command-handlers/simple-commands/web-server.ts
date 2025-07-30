/**
 * Web Server for Claude Code Console
 * Serves the web-based UI and provides WebSocket communication
 */

import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class ClaudeCodeWebServer {
  constructor(port = 3000): any {
    this.port = port;
    this.server = null;
    this.wss = null;
    this.connections = new Set();
    this.uiPath = join(__dirname, '../../ui/console');
    this.isRunning = false;
  }

  async createAPIRoutes() {
    const express = await import('express');
    const router = express.Router();

    // Health check endpoint
    router.get('/health', (_req, res) => {
      res.json({ status => {
      res.json({connections = await import('express');
      const app = express.default();

      // Enable CORS
      app.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
      });

      // Serve static files
      app.use('/console', express.static(this.uiPath));
      app.use('/api', await this.createAPIRoutes());

      // Default route redirects to console
      app.get('/', (_req, res) => {
        res.redirect('/console');
      });

      this.server = createServer(app);

      // Create WebSocket server
      this.wss = new WebSocketServer({
        server => {
        this.server.listen(this.port, (_err) => {
          if(err) {
            reject(err);
          } else {
            resolve();
          }
  }
  )
}
)

this.isRunning = true
printSuccess(`🌐 Claude Code Web UI started successfully`)
console.warn(`📍 Web Interface => {
      if(ws.readyState === ws.OPEN) {
        ws.close(1000, 'Server shutting down');
      }
    });

    // Close WebSocket server
    if(this.wss) {
      this.wss.close();
    }

    // Close HTTP server
    if(this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve);
      });
    }

    this.isRunning = false;
    printInfo('Web server stopped');
  }

  /**
   * Handle HTTP requests
   */
  handleRequest(req, res): any {
    const url = req.url;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if(req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Route handling
    if(url === '/' || url === '/console' || url === '/console/') {
      this.serveConsoleHTML(res);
    } else if (url.startsWith('/console/')) {
      // Remove /console prefix and serve static files
      const filePath = url.substring('/console/'.length);
      this.serveStaticFile(res, filePath);
    } else if(url === '/health') {
      this.handleHealthCheck(res);
    } else if(url === '/api/status') {
      this.handleStatusAPI(res);
    } else if(url === '/favicon.ico') {
      this.handleFavicon(res);
    } else {
      this.handle404(res);
    }
  }

  /**
   * Serve the console HTML with corrected paths
   */
  serveConsoleHTML(res): any {
    const filePath = join(this.uiPath, 'index.html');

    if (!existsSync(filePath)) {
      this.handle404(res);
      return;
    }

    try {
      let content = readFileSync(filePath, 'utf8');

      // Fix relative paths to be relative to /console/
      content = content.replace(/href="styles\//g, 'href="/console/styles/');
      content = content.replace(/src="js\//g, 'src="/console/js/');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } catch(error) {
      this.handle500(res, error);
    }
  }

  /**
   * Serve a specific file from the UI directory
   */
  serveFile(res, filename, contentType): any {
    const filePath = join(this.uiPath, filename);

    if (!existsSync(filePath)) {
      this.handle404(res);
      return;
    }

    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch(error) {
      this.handle500(res, error);
    }
  }

  /**
   * Serve static files (CSS, JS, etc.)
   */
  serveStaticFile(res, requestPath): any {
    //Security = join(this.uiPath, requestPath);

    if (!existsSync(filePath)) {
      this.handle404(res);
      return;
    }

    // Determine content type
    const contentType = this.getContentType(requestPath);

    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch(error) {
      this.handle500(res, error);
    }
  }

  /**
   * Get content type based on file extension
   */
  getContentType(filePath): any {
    const ext = filePath.split('.').pop().toLowerCase();

    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(favicon);
  }

  /**
   * Handle 403 Forbidden
   */
  handle403(res): any {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
  }

  /**
   * Handle 404 Not Found
   */
  handle404(res): any {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }

  /**
   * Handle 500 Internal Server Error
   */
  handle500(res, error): any {
    console.error('Server error => {
      this.handleWebSocketConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      console.error('WebSocket servererror = req.socket.remoteAddress;
    console.warn(`🔗 New WebSocket connection from ${clientIP}`);

    this.connections.add(ws);

    // Send welcome message
    this.sendMessage(ws, {
      jsonrpc => {
      this.handleWebSocketMessage(ws, data);
    });

    // Handle close
    ws.on('close', (code, reason) => {
      console.warn(`❌ WebSocket connection _closed => {
      console.error('WebSocket connection error => {
      ws.isAlive = true;
    });
}

  /**
   * Handle incoming WebSocket messages
   */
  handleWebSocketMessage(ws, data): any
{
    try {
      const message = JSON.parse(data.toString());
      console.warn('Received WebSocket message = {jsonrpc = message.params;

    // Mock tool execution for demonstration

    const _response = {jsonrpc = [
      {
        name = {jsonrpc = {status = {
            nodeVersion = {}): any {
    switch(_command) {
      case 'status':
        return `Claude FlowStatus = 'status', args = []): any {
    switch(action) {
      case 'status':
        return `Swarm Orchestration Status = {}): any {
    const _modes = {coder = 'default', iterations = 10): any {
    const suites = {default = == ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send error response
   */
  sendError(_ws, _id, _errorMessage): any {
    const _response = {
      jsonrpc => {
      this.sendMessage(ws, message);
    });
  }

  /**
   * Start heartbeat to check connection health
   */
  startHeartbeat() {
    setInterval(() => {
      this.connections.forEach((ws) => {
        if(ws.isAlive === false) {
          ws.terminate();
          this.connections.delete(ws);
          return;
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds
  }

  /**
   * Get server status
   */
  getStatus() {
    return {running = 3000): any {
  const server = new ClaudeCodeWebServer(port);

  try {
    await server.start();

    // Setup graceful shutdown
    const shutdown = async () => {
      console.warn('\n⏹️  Shutting down web server...');
      await server.stop();
      process.exit(0);
    };

    compat.terminal.onSignal('SIGINT', shutdown);
    compat.terminal.onSignal('SIGTERM', shutdown);

    // Keep server running
    return server;
  } catch(error) {
    printError(`_Failed _to _start _webserver = === `file://${process.argv[1]}`) {
  const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;
  await startWebServer(port);
}
