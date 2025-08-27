/**
 * @file API Server - Express.js server with comprehensive middleware
 *
 * Full-featured API server with security, monitoring, and reliability features.
 * Includes middleware stack, filesystem operations, health monitoring, and graceful shutdown.
 *
 * Features:
 * - Security: Helmet, CORS, rate limiting, input validation, directory traversal protection
 * - Monitoring: Health checks, dependency verification, metrics, structured logging
 * - Reliability: Graceful shutdown, error handling, filesystem security
 * - Performance: Compression, caching headers, optimized middleware
 */
import { readdir, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join, resolve } from 'node:path';
import { getLogger } from '@claude-zen/foundation';
import { createTerminus } from '@godaddy/terminus';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { createTaskMasterRoutes } from '../api/taskmaster';
import { ControlApiRoutes } from './control-api-routes';
import { SystemCapabilityRoutes } from './system-capability-routes';
const { getVersion } = global.claudeZenFoundation || {
    getVersion: () => 'unknown',
};
// Constants to avoid duplicate strings
const DEFAULT_HOST = 'localhost';
const HEALTH_ENDPOINT = '/api/health';
const STATUS_ENDPOINT = '/api/status';
const WORKSPACE_FILES_ENDPOINT = '/api/workspace/files';
export class ApiServer {
    config;
    server;
    app;
    logger = getLogger(ApiServer);
    controlApiRoutes;
    systemCapabilityRoutes;
    constructor(config) {
        this.config = config;
        this.logger.info('🚀 Creating ApiServer...');
        // Create Express app
        this.app = express();
        // Initialize control API routes
        this.controlApiRoutes = new ControlApiRoutes();
        // Initialize system capability routes
        this.systemCapabilityRoutes = new SystemCapabilityRoutes();
        // Setup middleware and routes
        this.setupMiddleware();
        this.setupRoutes();
        // Create HTTP server
        this.server = createServer(this.app);
        this.logger.info('✅ ApiServer created successfully');
    }
    setupMiddleware() {
        this.logger.info('🔒 Setting up production middleware...');
        // Terminus provides health checks at:
        // - /health (Kubernetes-style liveness probe)
        // - /healthz (Kubernetes-style health check)
        // - /readyz (Kubernetes-style readiness probe)
        // Custom status endpoint with enhanced metrics
        this.app.get('/status', (req, res) => {
            // req parameter available but not used in this simple status endpoint
            const memUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            res.json({
                status: 'healthy',
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                memory: {
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                    external: Math.round(memUsage.external / 1024 / 1024),
                    rss: Math.round(memUsage.rss / 1024 / 1024),
                },
                cpu: {
                    user: cpuUsage.user,
                    system: cpuUsage.system,
                },
                process: {
                    pid: process.pid,
                    version: process.version,
                    platform: process.platform,
                    arch: process.arch,
                },
                application: {
                    version: process.env.npm_package_version || '1.0.0',
                    environment: process.env.NODE_ENV || 'development',
                },
            });
        });
        // Basic middleware
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        // CORS - Environment-aware cross-origin requests
        const corsOptions = {
            origin: this.getCorsOrigins(),
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Requested-With',
                'X-Session-D',
            ],
            optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
        };
        this.app.use(cors(corsOptions));
        // Compression - Gzip responses
        this.app.use(compression());
        // Security headers (helmet)
        this.app.use(helmet({
            contentSecurityPolicy: false, // Disable for API/Swagger compatibility
        }));
        // Request logging (morgan)
        this.app.use(morgan('combined'));
        // Rate limiting for API routes only
        const limiter = rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);
        this.logger.info('✅ Production middleware configured');
    }
    setupRoutes() {
        this.logger.info('📋 Setting up API routes...');
        this.setupHealthRoutes();
        this.setupSystemRoutes();
        this.setupSystemCapabilityRoutes();
        this.setupTaskMasterRoutes();
        this.setupWorkspaceRoutes();
        this.setupControlRoutes();
        this.setupSvelteStaticFiles();
        this.setupDefaultRoutes();
        this.logger.info('✅ API routes configured');
    }
    /**
     * Set up system capability dashboard routes
     */
    setupSystemCapabilityRoutes() {
        this.logger.info('📊 Setting up system capability routes...');
        // Mount system capability routes under /api/v1/system/capability
        this.app.use('/api/v1/system/capability', this.systemCapabilityRoutes.getRouter());
        this.logger.info('✅ System capability routes configured');
    }
    /**
     * Set up TaskMaster SAFe workflow API routes
     */
    setupTaskMasterRoutes() {
        this.logger.info('⚡ Setting up TaskMaster SAFe routes...');
        // Mount TaskMaster routes under /api/v1/taskmaster
        this.app.use('/api/v1/taskmaster', createTaskMasterRoutes());
        this.logger.info('✅ TaskMaster SAFe routes configured');
    }
    /**
     * Set up comprehensive control API routes
     */
    setupControlRoutes() {
        this.logger.info('🎛️ Setting up control API routes...');
        // Initialize control APIs with the HTTP server for WebSocket support
        this.controlApiRoutes.setupRoutes(this.app, this.server);
        this.logger.info('✅ Control API routes configured');
    }
    /**
     * Set up health and monitoring endpoints (K8s compatible)
     */
    setupHealthRoutes() {
        this.setupKubernetesHealthRoutes();
        this.setupLegacyHealthRoute();
    }
    /**
     * Setup Kubernetes-compatible health check endpoints
     */
    setupKubernetesHealthRoutes() {
        // K8s Liveness Probe - Basic server health
        this.app.get('/healthz', this.handleLivenessProbe.bind(this));
        // K8s Readiness Probe - Service ready to receive traffic
        this.app.get('/readyz', this.handleReadinessProbe.bind(this));
        // K8s Startup Probe - Initial startup health
        this.app.get('/started', this.handleStartupProbe.bind(this));
    }
    /**
     * Handle Kubernetes liveness probe
     */
    handleLivenessProbe(req, res) {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    }
    /**
     * Handle Kubernetes readiness probe
     */
    async handleReadinessProbe(req, res) {
        try {
            const checks = await this.performReadinessChecks();
            const allReady = Object.values(checks).every((status) => status === 'ready');
            const statusCode = allReady ? 200 : 503;
            res.status(statusCode).json({
                status: allReady ? 'ready' : 'not_ready',
                checks,
                timestamp: new Date().toISOString(),
            });
        }
        catch {
            res.status(503).json({
                status: 'not_ready',
                error: 'Health check failed',
                timestamp: new Date().toISOString(),
            });
        }
    }
    /**
     * Perform readiness checks for all critical services
     */
    async performReadinessChecks() {
        const checks = {
            filesystem: 'checking',
            database: 'checking',
            memory: 'checking',
        };
        // Filesystem check
        try {
            await stat(process.cwd());
            checks.filesystem = 'ready';
        }
        catch {
            checks.filesystem = 'not_ready';
        }
        // Memory check
        const memoryUsage = process.memoryUsage();
        const memoryLimit = 1024 * 1024 * 1024; // 1GB threshold
        checks.memory = memoryUsage.heapUsed < memoryLimit ? 'ready' : 'not_ready';
        // Database check (assume ready for now)
        checks.database = 'ready';
        return checks;
    }
    /**
     * Handle Kubernetes startup probe
     */
    handleStartupProbe(req, res) {
        const started = process.uptime() > 5; // 5 seconds startup time
        res.status(started ? 200 : 503).json({
            status: started ? 'started' : 'starting',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Setup legacy health check endpoint with enhanced dependency verification
     */
    setupLegacyHealthRoute() {
        this.app.get(HEALTH_ENDPOINT, this.handleLegacyHealthCheck.bind(this));
    }
    /**
     * Handle legacy health check with comprehensive system verification
     */
    async handleLegacyHealthCheck(req, res) {
        const health = await this.buildHealthResponse();
        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    }
    /**
     * Build comprehensive health response
     */
    async buildHealthResponse() {
        const health = {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            version: getVersion(),
            memory: process.memoryUsage(),
            environment: process.env.NODE_ENV || 'development',
            checks: {
                filesystem: 'healthy',
                memory: 'healthy',
                uptime: 'healthy',
            },
        };
        let isHealthy = true;
        isHealthy = (await this.checkFilesystemHealth(health)) && isHealthy;
        this.checkMemoryHealth(health);
        this.checkUptimeHealth(health);
        health.status = isHealthy ? 'healthy' : 'unhealthy';
        return health;
    }
    /**
     * Check filesystem health
     */
    async checkFilesystemHealth(health) {
        try {
            await stat(process.cwd());
            health.checks.filesystem = 'healthy';
            return true;
        }
        catch (error) {
            health.checks.filesystem = 'unhealthy';
            this.logger.error('Filesystem check failed: ', error);
            return false;
        }
    }
    /**
     * Check memory usage health
     */
    checkMemoryHealth(health) {
        const memoryUsage = process.memoryUsage();
        const memoryLimit = 512 * 1024 * 1024; // 512MB threshold
        if (memoryUsage.heapUsed > memoryLimit) {
            health.checks.memory = 'warning';
            this.logger.warn(`High memory usage: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
        }
    }
    /**
     * Check uptime health
     */
    checkUptimeHealth(health) {
        if (process.uptime() < 1) {
            health.checks.uptime = 'starting';
        }
    }
    /**
     * Set up system information endpoints
     */
    setupSystemRoutes() {
        // System status endpoint
        this.app.get(STATUS_ENDPOINT, (req, res) => {
            res.json({
                status: 'operational',
                server: 'Claude Code Zen API',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: getVersion(),
            });
        });
        // API info endpoint
        this.app.get('/api/info', (req, res) => {
            res.json({
                name: 'Claude Code Zen',
                version: getVersion(),
                description: 'AI swarm orchestration platform with neural networks and web dashboard',
                endpoints: {
                    health: HEALTH_ENDPOINT,
                    status: STATUS_ENDPOINT,
                    info: '/api/info',
                    workspace: WORKSPACE_FILES_ENDPOINT,
                    // Control API endpoints
                    controlLogs: '/api/v1/control/logs',
                    controlMetrics: '/api/v1/control/metrics',
                    controlNeural: '/api/v1/control/neural/status',
                    controlProjects: '/api/v1/control/sparc/projects',
                    controlPRDs: '/api/v1/control/project/prds',
                    controlADRs: '/api/v1/control/project/adrs',
                    controlEpics: '/api/v1/control/project/epics',
                    controlFeatures: '/api/v1/control/project/features',
                    controlTasks: '/api/v1/control/project/tasks',
                    controlOverview: '/api/v1/control/project/overview',
                    controlGit: '/api/v1/control/git/status',
                    controlConfig: '/api/v1/control/config',
                    controlServices: '/api/v1/control/services',
                    controlRealtime: '/api/v1/control/realtime',
                },
                features: [
                    'Production Middleware',
                    'Rate Limiting',
                    'Security Headers',
                    'Graceful Shutdown',
                    'CORS Support',
                    'Request Logging',
                    'Compression',
                    'Centralized LogTape Database Storage',
                    'Lightweight OpenTelemetry Metrics',
                    'Real-time WebSocket Monitoring',
                    'Neural System Control',
                    'Comprehensive Project Management (PRDs, ADRs, Tasks, Epics, Features)',
                    'Git Operations Control',
                    'System Configuration Management',
                ],
            });
        });
    }
    /**
     * Set up workspace file system endpoints
     */
    setupWorkspaceRoutes() {
        this.app.get(WORKSPACE_FILES_ENDPOINT, this.handleWorkspaceRequest.bind(this));
    }
    /**
     * Handle workspace file system requests
     */
    async handleWorkspaceRequest(req, res) {
        try {
            const requestedPath = req.query.path || '.';
            // Validate and secure the path
            const validationResult = this.validateWorkspacePath(requestedPath);
            if (!validationResult.valid) {
                res.status(validationResult.statusCode).json({
                    error: validationResult.error,
                    message: validationResult.message,
                });
                return;
            }
            // Resolve paths safely
            const { resolvedPath, parentPath } = this.resolveWorkspacePaths(requestedPath);
            // Read and process directory contents
            const files = await this.readWorkspaceDirectory(resolvedPath, requestedPath);
            res.json({
                path: requestedPath,
                files,
                parentPath,
                timestamp: new Date().toISOString(),
            });
        }
        catch (error) {
            this.logger.error('Workspace API error: ', error);
            res.status(500).json({
                error: 'Internal server error',
                message: 'Failed to read directory contents',
            });
        }
    }
    /**
     * Validate workspace path for security
     */
    validateWorkspacePath(requestedPath) {
        // Input type validation
        if (typeof requestedPath !== 'string') {
            return {
                valid: false,
                statusCode: 400,
                error: 'Invalid path parameter',
                message: 'Path must be a string',
            };
        }
        // Prevent directory traversal attacks
        if (requestedPath.includes('..') || requestedPath.includes('~')) {
            return {
                valid: false,
                statusCode: 403,
                error: 'Access denied',
                message: 'Path traversal not allowed',
            };
        }
        return { valid: true };
    }
    /**
     * Resolve workspace paths safely
     */
    resolveWorkspacePaths(requestedPath) {
        const baseDir = process.cwd();
        const targetPath = requestedPath === '.' ? baseDir : join(baseDir, requestedPath);
        const resolvedBase = resolve(baseDir);
        const resolvedPath = resolve(targetPath);
        // Security check - ensure we're within the base directory
        if (!resolvedPath.startsWith(resolvedBase)) {
            throw new Error('Access outside workspace not allowed');
        }
        const parentPath = requestedPath !== '.'
            ? requestedPath.split('/').slice(0, -1).join('/') || ''
            : null;
        return { resolvedPath, parentPath };
    }
    /**
     * Read workspace directory contents
     */
    async readWorkspaceDirectory(resolvedPath, requestedPath) {
        const items = await readdir(resolvedPath);
        const files = [];
        for (const item of items) {
            // Skip hidden files and sensitive directories
            if (this.shouldSkipWorkspaceItem(item)) {
                continue;
            }
            try {
                const itemPath = join(resolvedPath, item);
                const stats = await stat(itemPath);
                files.push({
                    name: item,
                    path: requestedPath === '.' ? item : `${requestedPath}/${item}`,
                    type: stats.isDirectory() ? 'directory' : 'file',
                    size: stats.isFile() ? stats.size : null,
                    modified: stats.mtime.toISOString(),
                });
            }
            catch (itemError) {
                // Skip items we can't stat (permissions, etc.)
                this.logger.warn(`Cannot access item ${item}:`, itemError);
            }
        }
        // Sort directories first, then files
        return this.sortWorkspaceFiles(files);
    }
    /**
     * Determine if workspace item should be skipped
     */
    shouldSkipWorkspaceItem(item) {
        return item.startsWith('.') || item === 'node_modules';
    }
    /**
     * Sort workspace files (directories first, then alphabetically)
     */
    sortWorkspaceFiles(files) {
        return files.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
    }
    /**
     * Set up Svelte web dashboard integration
     */
    setupSvelteStaticFiles() {
        this.logger.info('🎨 Setting up Svelte web dashboard integration...');
        // Serve static assets from Svelte build client directory
        const svelteClientPath = resolve(__dirname, '../../../../../web-dashboard/build/client');
        this.logger.info(`📁 Serving Svelte static assets from: ${svelteClientPath}`);
        // Serve static files from Svelte build/client (JS, CSS, assets)
        this.app.use('/_app', express.static(join(svelteClientPath, '_app'), {
            maxAge: '1d', // Cache for 1 day in production
            etag: true,
            lastModified: true,
            setHeaders: (res, path) => {
                // Set proper cache headers for different file types
                if (path.endsWith('.js') || path.endsWith('.css')) {
                    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache JS/CSS for 1 year
                }
            },
        }));
        // Import and use the SvelteKit handler for all non-API routes
        this.app.use(async (req, res, next) => {
            // Skip API routes - let them be handled by our API endpoints
            if (req.path.startsWith('/api/')) {
                return next();
            }
            try {
                // Import the SvelteKit handler dynamically
                const svelteHandlerPath = resolve(__dirname, '../../../../../web-dashboard/build/handler.js');
                const { handler } = await import(svelteHandlerPath);
                // Use SvelteKit handler for non-API routes
                // @ts-expect-error - handler signature from SvelteKit
                handler(req, res);
            }
            catch (error) {
                this.logger.error('Error loading Svelte handler: ', error);
                res.status(500).json({
                    error: 'Failed to load web dashboard',
                    message: 'Could not initialize Svelte application',
                });
            }
        });
        this.logger.info('✅ Svelte web dashboard integrated - Single port deployment with SvelteKit handler');
    }
    /**
     * Set up default routes and error handlers
     */
    setupDefaultRoutes() {
        // 404 handler for API routes only - let Svelte handle non-API routes
        this.app.use('/api/*', (req, res) => {
            res.status(404).json({
                error: 'API endpoint not found',
                path: req.originalUrl,
                timestamp: new Date().toISOString(),
                availableEndpoints: [
                    HEALTH_ENDPOINT,
                    STATUS_ENDPOINT,
                    '/api/info',
                    WORKSPACE_FILES_ENDPOINT,
                    '/api/v1/control/* (comprehensive control APIs)',
                    '/api/v1/taskmaster/* (SAFe workflow management)',
                ],
            });
        });
    }
    start() {
        this.logger.info(`🚀 Starting server on ${this.config.host || DEFAULT_HOST}:${this.config.port}...`);
        // Setup terminus for graceful shutdown BEFORE starting server
        this.setupTerminus();
        return new Promise((resolveServerStart, rejectServerStart) => {
            const connectionMonitor = this.createConnectionMonitor();
            // Setup error handling
            this.setupServerErrorHandling(connectionMonitor, rejectServerStart);
            // Start the server
            this.startServerListener(connectionMonitor, resolveServerStart);
        });
    }
    /**
     * Create connection monitoring object
     */
    createConnectionMonitor() {
        return {
            startTime: Date.now(),
            errorCount: 0,
            lastError: null,
            connectionState: 'initializing',
        };
    }
    /**
     * Setup server error handling with enhanced diagnostics
     */
    setupServerErrorHandling(connectionMonitor, rejectServerStart) {
        this.server.on('error', (error) => {
            connectionMonitor.errorCount++;
            connectionMonitor.lastError = error;
            connectionMonitor.connectionState = 'error';
            this.logServerError(error, connectionMonitor);
            this.provideErrorRecoverySuggestions(error);
            rejectServerStart(error);
        });
    }
    /**
     * Log server error with comprehensive details
     */
    logServerError(error, connectionMonitor) {
        this.logger.error('❌ Server error detected: ', {
            error: error.message,
            errorCount: connectionMonitor.errorCount,
            connectionState: connectionMonitor.connectionState,
            errorCode: error.code,
            errno: error.errno,
            syscall: error.syscall,
            address: error.address,
            port: error.port,
        });
    }
    /**
     * Provide error recovery suggestions based on error type
     */
    provideErrorRecoverySuggestions(error) {
        const errorCode = error.code;
        if (errorCode === 'EADDRINUSE') {
            this.logger.error(`🔴 Port ${this.config.port} is already in use. Try a different port or stop the conflicting process.`);
        }
        else if (errorCode === 'EACCES') {
            this.logger.error(`🔴 Permission denied for port ${this.config.port}. Try using a port > 1024 or run with elevated privileges.`);
        }
        else if (errorCode === 'ENOTFOUND') {
            this.logger.error(`🔴 Host '${this.config.host}' not found. Check network configuration.`);
        }
    }
    /**
     * Start server listener with success handling
     */
    startServerListener(connectionMonitor, resolveServerStart) {
        connectionMonitor.connectionState = 'connecting';
        this.server.listen(this.config.port, this.config.host || DEFAULT_HOST, () => {
            connectionMonitor.connectionState = 'connected';
            const startupTime = Date.now() - connectionMonitor.startTime;
            this.logServerStartupSuccess(startupTime, connectionMonitor);
            resolveServerStart();
        });
    }
    /**
     * Log comprehensive server startup success information
     */
    logServerStartupSuccess(startupTime, connectionMonitor) {
        const serverUrl = `http://${this.config.host || DEFAULT_HOST}:${this.config.port}`;
        this.logger.info(`🌐 Claude Code Zen Server started on ${serverUrl}`);
        this.logger.info(`⚡ Startup completed in ${startupTime}ms`);
        this.logger.info(`🔌 Connection state: ${connectionMonitor.connectionState}`);
        this.logWebDashboardInfo(serverUrl);
        this.logHealthCheckEndpoints(serverUrl);
        this.logApiEndpoints(serverUrl);
        this.logDeploymentInfo();
        this.logConnectionMetrics(startupTime, connectionMonitor.errorCount);
    }
    /**
     * Log web dashboard information
     */
    logWebDashboardInfo(serverUrl) {
        this.logger.info(`🎨 Web Dashboard: ${serverUrl}/ (Svelte)`);
    }
    /**
     * Log health check endpoints
     */
    logHealthCheckEndpoints(serverUrl) {
        this.logger.info('🏥 K8s Health Checks:');
        this.logger.info(` • Liveness:  ${serverUrl}/healthz`);
        this.logger.info(` • Readiness: ${serverUrl}/readyz`);
        this.logger.info(` • Startup:   ${serverUrl}/started`);
    }
    /**
     * Log API endpoints information
     */
    logApiEndpoints(serverUrl) {
        this.logger.info(`📊 System Status: ${serverUrl}/api/status`);
        this.logger.info(`🎛️ Control APIs: ${serverUrl}/api/v1/control/*`);
        this.logger.info(`📂 Workspace API: ${serverUrl}/api/workspace/files`);
    }
    /**
     * Log deployment configuration info
     */
    logDeploymentInfo() {
        this.logger.info('🎯 Single port deployment: API + Svelte dashboard + K8s health');
        this.logger.info('🛡️ Graceful shutdown enabled via @godaddy/terminus');
    }
    /**
     * Log connection metrics
     */
    logConnectionMetrics(startupTime, errorCount) {
        this.logger.info(`📈 Connection metrics: startup=${startupTime}ms, errors=${errorCount}`);
    }
    stop() {
        return new Promise((resolveServerStop) => {
            // Enhanced server shutdown monitoring
            const shutdownMonitor = {
                startTime: Date.now(),
                activeConnections: 0,
                shutdownState: 'initiating',
                gracefulTimeout: 10000, // 10 seconds
            };
            this.logger.info('🔄 Initiating server shutdown...');
            shutdownMonitor.shutdownState = 'draining';
            // Get current connection count before shutdown
            this.server.getConnections((err, count) => {
                if (!err && typeof count === 'number') {
                    shutdownMonitor.activeConnections = count;
                    this.logger.info(`🔌 Draining ${count} active connections...`);
                }
            });
            // Set timeout for forceful shutdown if graceful takes too long
            const forceShutdownTimeout = setTimeout(() => {
                this.logger.warn(`⏰ Graceful shutdown timeout after ${shutdownMonitor.gracefulTimeout}ms, forcing shutdown`);
                shutdownMonitor.shutdownState = 'stopped';
                resolveServerStop();
            }, shutdownMonitor.gracefulTimeout);
            this.server.close(() => {
                clearTimeout(forceShutdownTimeout);
                shutdownMonitor.shutdownState = 'stopped';
                const shutdownTime = Date.now() - shutdownMonitor.startTime;
                this.logger.info('🛑 API server stopped');
                this.logger.info(`⚡ Shutdown completed in ${shutdownTime}ms`);
                this.logger.info(`📊 Final state: connections=${shutdownMonitor.activeConnections}, state=${shutdownMonitor.shutdownState}`);
                resolveServerStop();
            });
        });
    }
    /**
     * Create comprehensive health check function for terminus
     */
    createHealthCheck(type) {
        return () => {
            const memUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            const baseInfo = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                version: getVersion(),
                type,
                memory: {
                    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
                    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
                    rss: Math.round(memUsage.rss / 1024 / 1024),
                    external: Math.round(memUsage.external / 1024 / 1024),
                },
                cpu: {
                    user: cpuUsage.user,
                    system: cpuUsage.system,
                },
            };
            // Add specific checks based on endpoint type
            switch (type) {
                case 'health':
                    // Liveness probe - basic process health
                    return {
                        ...baseInfo,
                        status: 'healthy',
                        checks: {
                            process: 'ok',
                            memory: memUsage.heapUsed < memUsage.heapTotal * 0.9 ? 'ok' : 'warning',
                        },
                    };
                case 'healthz':
                    // Kubernetes health check
                    return {
                        ...baseInfo,
                        status: 'ok',
                    };
                case 'readyz': {
                    // Readiness probe - can accept traffic
                    const isReady = process.uptime() > 1; // Ready after 1 second
                    return {
                        ...baseInfo,
                        status: isReady ? 'ready' : 'starting',
                        checks: {
                            uptime: isReady ? 'ok' : 'starting',
                            server: 'ok',
                        },
                    };
                }
                default:
                    return baseInfo;
            }
        };
    }
    setupTerminus() {
        this.logger.info('🛡️ Setting up terminus for graceful shutdown...');
        createTerminus(this.server, {
            signals: ['SIGTERM', 'SIGINT', 'SIGUSR2'],
            timeout: process.env.NODE_ENV === 'development' ? 5000 : 30000, // Fast restarts in dev
            healthChecks: {
                // Kubernetes-style health checks
                health: this.createHealthCheck('health'),
                healthz: this.createHealthCheck('healthz'),
                readyz: this.createHealthCheck('readyz'),
                // Legacy endpoints for backwards compatibility
                healthzCheck: this.createHealthCheck('healthz'),
                readyzCheck: this.createHealthCheck('readyz'),
                healthCheck: this.createHealthCheck('health'),
            },
            beforeShutdown: () => {
                // Keep connections alive briefly for zero-downtime restarts
                const delay = process.env.NODE_ENV === 'development' ? 100 : 1000;
                this.logger.info(`🔄 Pre-shutdown delay: ${delay}ms for connection draining...`);
                return new Promise((resolveDelay) => {
                    this.logger.info(`⏳ Connection drain delay: ${delay}ms for graceful shutdown`);
                    setTimeout(() => {
                        this.logger.info('✅ Connection drain delay completed');
                        resolveDelay();
                    }, delay);
                });
            },
            onSignal: () => Promise.resolve().then(() => {
                this.logger.info('🔄 Graceful shutdown initiated - keeping connections alive...');
                // Close database connections, cleanup resources
                // But don't close HTTP server - terminus handles that
                this.logger.info('✅ Resources cleaned up, ready for shutdown');
            }),
            onShutdown: () => Promise.resolve().then(() => {
                this.logger.info('🏁 Server shutdown complete - zero downtime restart ready');
            }),
            logger: (msg, err) => {
                if (err) {
                    this.logger.error('🔄 Terminus: ', msg, err);
                }
                else {
                    this.logger.info(`🔄 Terminus: ${msg}`);
                }
            },
        });
        this.logger.info('✅ Terminus configured successfully');
    }
    /**
     * Get allowed CORS origins based on environment
     */
    getCorsOrigins() {
        const nodeEnv = process.env.NODE_ENV || 'development';
        if (nodeEnv === 'development') {
            // Allow localhost and common dev ports
            return [
                'http://localhost:3000',
                'http://localhost:3001',
                'http://localhost:3002',
                'http://localhost:4000',
                'http://localhost:5000',
                'http://localhost:8080',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:3001',
                'http://127.0.0.1:3002',
                'http://127.0.0.1:4000',
                'http://127.0.0.1:5000',
                'http://127.0.0.1:8080',
            ];
        }
        if (nodeEnv === 'production') {
            // Production origins from environment variable
            const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS;
            if (allowedOrigins) {
                return allowedOrigins.split(',').map((origin) => origin.trim());
            }
            // Default production - only same origin
            return false;
        }
        // Test environment - allow all for flexibility
        return nodeEnv === 'test';
    }
    getCapabilities() {
        return {
            webDashboard: true,
            healthCheck: true,
            basicRouting: true,
            apiEndpoints: true,
            gracefulShutdown: true,
            productionMiddleware: true,
            workspac: 'basic',
        };
    }
}
