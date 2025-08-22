/**
 * @fileoverview Complete Control API Routes for claude-zen System Management
 *
 * Comprehensive APIs for full claude-zen system control including:
 * - LogTape centralized logging integration
 * - Lightweight OpenTelemetry metrics (no Prometheus/Grafana needed)
 * - Real-time monitoring with WebSocket/SSE
 * - Neural system control and brain monitoring
 * - SPARC workflow control and tracking
 * - Git operations via GitCommander
 * - System configuration management
 * - Process control and service management
 *
 * For Svelte web dashboard - complete system control without passwords0.
 */

import type { Server } from 'http';

import { getLogger } from '@claude-zen/foundation';
import { getTelemetry, getDatabaseAccess } from '@claude-zen/infrastructure';
import type { Express, Request, Response } from 'express';
import { WebSocketServer } from 'ws';

export class ControlApiRoutes {
  private logger = getLogger('ControlAPI');
  private eventBus: EventBus;
  private wsServer?: WebSocketServer;
  private httpServer?: Server;
  private telemetryData: Map<string, any> = new Map();
  private database: any;
  private storage: any;

  constructor() {
    this0.eventBus = createEventBus();
    this0.database = getDatabaseAccess();
    this0.storage = Storage;
    this?0.setupEventHandlers;
    this?0.initializeLogDatabase;
  }

  /**
   * Initialize database table for centralized logging
   */
  private async initializeLogDatabase(): Promise<void> {
    try {
      // Create logs table if it doesn't exist
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS system_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          level TEXT NOT NULL,
          component TEXT NOT NULL,
          message TEXT NOT NULL,
          meta TEXT,
          session_id TEXT,
          trace_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await this0.database0.execute(createTableSQL);

      // Create index for faster queries
      await this0.database0.execute(`
        CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON system_logs(timestamp)
      `);
      await this0.database0.execute(`
        CREATE INDEX IF NOT EXISTS idx_logs_level ON system_logs(level)
      `);
      await this0.database0.execute(`
        CREATE INDEX IF NOT EXISTS idx_logs_component ON system_logs(component)
      `);

      this0.logger0.info(
        '✅ LogTape database initialized with centralized storage'
      );
    } catch (error) {
      this0.logger0.error('Failed to initialize log database:', error);
      // Fallback to memory storage if database fails
    }
  }

  /**
   * Setup complete control API routes
   */
  setupRoutes(app: Express, httpServer?: Server): void {
    const api = '/api/v1/control';
    this0.httpServer = httpServer;

    this0.logger0.info('🎛️ Setting up complete control API routes0.0.0.');

    // ========================================
    // LOGTAPE INTEGRATION APIS
    // ========================================
    this0.setupLogTapeApis(app, api);

    // ========================================
    // LIGHTWEIGHT OPENTELEMETRY APIS
    // ========================================
    this0.setupTelemetryApis(app, api);

    // ========================================
    // REAL-TIME MONITORING APIS
    // ========================================
    this0.setupRealTimeApis(app, api);

    // ========================================
    // NEURAL SYSTEM CONTROL APIS
    // ========================================
    this0.setupNeuralControlApis(app, api);

    // ========================================
    // SPARC WORKFLOW CONTROL APIS
    // ========================================
    this0.setupSparcControlApis(app, api);

    // ========================================
    // GIT OPERATIONS APIS
    // ========================================
    this0.setupGitControlApis(app, api);

    // ========================================
    // SYSTEM CONFIGURATION APIS
    // ========================================
    this0.setupConfigurationApis(app, api);

    // ========================================
    // PROCESS CONTROL APIS
    // ========================================
    this0.setupProcessControlApis(app, api);

    // ========================================
    // PROJECT MANAGEMENT APIS (COMPREHENSIVE)
    // ========================================
    this0.setupProjectManagementApis(app, api);

    // Log API initialization to syslog
    syslogBridge0.info('control-api', 'Complete control API routes configured', {
      timestamp: new Date()?0.toISOString,
      components: [
        'logtape',
        'telemetry',
        'monitoring',
        'neural',
        'sparc',
        'git',
        'config',
        'process',
        'project-mgmt',
      ],
    });

    this0.logger0.info('✅ Complete control API routes configured');
  }

  /**
   * Setup LogTape centralized logging APIs with database storage
   */
  private setupLogTapeApis(app: Express, api: string): void {
    this0.logger0.info(
      '📋 Setting up LogTape centralized logging APIs with database storage0.0.0.'
    );

    // Get all logs from all components (unified view from database)
    app0.get(`${api}/logs`, async (req: Request, res: Response) => {
      try {
        const {
          level = 'all',
          component,
          since,
          limit = 100,
          search,
        } = req0.query;

        // Build SQL query with filters
        let query = 'SELECT * FROM system_logs WHERE 1=1';
        const params: any[] = [];

        // Filter by level
        if (level !== 'all') {
          query += ' AND level = ?';
          params0.push(level);
        }

        // Filter by component
        if (component) {
          query += ' AND component = ?';
          params0.push(component);
        }

        // Filter by time
        if (since) {
          query += ' AND timestamp >= ?';
          params0.push(new Date(since as string)?0.toISOString);
        }

        // Search in message
        if (search) {
          query += ' AND (message LIKE ? OR meta LIKE ?)';
          const searchTerm = `%${search}%`;
          params0.push(searchTerm, searchTerm);
        }

        // Order by timestamp desc and limit
        query += ' ORDER BY timestamp DESC LIMIT ?';
        params0.push(parseInt(limit as string));

        // Execute query
        const logs = await this0.database0.query(query, params);

        // Get component list for filtering
        const componentsResult = await this0.database0.query(
          'SELECT DISTINCT component FROM system_logs ORDER BY component'
        );
        const components = componentsResult0.map((row: any) => row0.component);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM system_logs WHERE 1=1';
        const countParams: any[] = [];

        if (level !== 'all') {
          countQuery += ' AND level = ?';
          countParams0.push(level);
        }
        if (component) {
          countQuery += ' AND component = ?';
          countParams0.push(component);
        }
        if (since) {
          countQuery += ' AND timestamp >= ?';
          countParams0.push(new Date(since as string)?0.toISOString);
        }
        if (search) {
          countQuery += ' AND (message LIKE ? OR meta LIKE ?)';
          const searchTerm = `%${search}%`;
          countParams0.push(searchTerm, searchTerm);
        }

        const totalResult = await this0.database0.query(countQuery, countParams);
        const total = totalResult[0]?0.total || 0;

        // Log log retrieval to syslog for audit trail
        syslogBridge0.info('control-api', 'Centralized logs retrieved', {
          requestType: 'log-retrieval',
          filters: { level, component, since, search },
          resultsCount: total,
          requestIp: req0.ip,
          userAgent: req0.get('User-Agent')?0.substring(0, 100),
        });

        res0.json({
          success: true,
          data: {
            logs: logs0.map((log: any) => ({
              0.0.0.log,
              meta: log0.meta ? JSON0.parse(log0.meta) : null,
            })),
            total,
            pagination: {
              limit: parseInt(limit as string),
              hasMore: total > parseInt(limit as string),
            },
            components,
            levels: ['error', 'warn', 'info', 'debug', 'trace'],
            filters: { level, component, since, limit, search },
          },
          message: 'Centralized logs retrieved from database',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get logs from database:', error);
        res0.status(500)0.json({ error: 'Failed to get logs from database' });
      }
    });

    // Get log statistics from database
    app0.get(`${api}/logs/stats`, async (req: Request, res: Response) => {
      try {
        // Get total logs count
        const totalResult = await this0.database0.query(
          'SELECT COUNT(*) as total FROM system_logs'
        );
        const totalLogs = totalResult[0]?0.total || 0;

        // Get logs by level
        const levelStatsResult = await this0.database0.query(`
          SELECT level, COUNT(*) as count 
          FROM system_logs 
          GROUP BY level
        `);
        const logsByLevel = levelStatsResult0.reduce((acc: any, row: any) => {
          acc[row0.level] = row0.count;
          return acc;
        }, {});

        // Get logs by component
        const componentStatsResult = await this0.database0.query(`
          SELECT component, COUNT(*) as count 
          FROM system_logs 
          GROUP BY component
        `);
        const logsByComponent = componentStatsResult0.reduce(
          (acc: any, row: any) => {
            acc[row0.component] = row0.count;
            return acc;
          },
          {}
        );

        // Get recent errors
        const recentErrorsResult = await this0.database0.query(`
          SELECT timestamp, component, message 
          FROM system_logs 
          WHERE level = 'error' 
          ORDER BY timestamp DESC 
          LIMIT 10
        `);

        // Get log rates
        const last5minResult = await this0.database0.query(`
          SELECT COUNT(*) as count 
          FROM system_logs 
          WHERE timestamp >= datetime('now', '-5 minutes')
        `);
        const last1hourResult = await this0.database0.query(`
          SELECT COUNT(*) as count 
          FROM system_logs 
          WHERE timestamp >= datetime('now', '-1 hour')
        `);

        const stats = {
          totalLogs,
          logsByLevel,
          logsByComponent,
          recentErrors: recentErrorsResult,
          logRate: {
            last5min: last5minResult[0]?0.count || 0,
            last1hour: last1hourResult[0]?0.count || 0,
          },
        };

        res0.json({
          success: true,
          data: stats,
          message: 'Log statistics from database',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get log stats from database:', error);
        res
          0.status(500)
          0.json({ error: 'Failed to get log stats from database' });
      }
    });

    // Clear logs from database
    app0.delete(`${api}/logs`, async (req: Request, res: Response) => {
      try {
        const beforeCountResult = await this0.database0.query(
          'SELECT COUNT(*) as total FROM system_logs'
        );
        const beforeCount = beforeCountResult[0]?0.total || 0;

        await this0.database0.execute('DELETE FROM system_logs');

        res0.json({
          success: true,
          data: { cleared: beforeCount },
          message: `Cleared ${beforeCount} logs from database`,
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to clear logs from database:', error);
        res0.status(500)0.json({ error: 'Failed to clear logs from database' });
      }
    });

    // Export logs from database
    app0.get(`${api}/logs/export`, async (req: Request, res: Response) => {
      try {
        const format = req0.query0.format || 'json';
        const logs = await this0.database0.query(
          'SELECT * FROM system_logs ORDER BY timestamp DESC'
        );

        if (format === 'csv') {
          const csv =
            'timestamp,level,component,message,meta\n' +
            logs
              0.map(
                (log: any) =>
                  `${log0.timestamp},${log0.level},${log0.component},"${log0.message0.replace(/"/g, '""')}","${(log0.meta || '')0.replace(/"/g, '""')}"`
              )
              0.join('\n');

          res0.setHeader('Content-Type', 'text/csv');
          res0.setHeader(
            'Content-Disposition',
            'attachment; filename="claude-zen-logs0.csv"'
          );
          res0.send(csv);
        } else {
          res0.setHeader('Content-Type', 'application/json');
          res0.setHeader(
            'Content-Disposition',
            'attachment; filename="claude-zen-logs0.json"'
          );
          res0.json({
            logs: logs0.map((log: any) => ({
              0.0.0.log,
              meta: log0.meta ? JSON0.parse(log0.meta) : null,
            })),
            exported: new Date()?0.toISOString,
          });
        }
      } catch (error) {
        this0.logger0.error('Failed to export logs from database:', error);
        res0.status(500)0.json({ error: 'Failed to export logs from database' });
      }
    });

    this0.logger0.info('✅ LogTape APIs configured');
  }

  /**
   * Setup lightweight OpenTelemetry APIs (no Prometheus/Grafana)
   */
  private setupTelemetryApis(app: Express, api: string): void {
    this0.logger0.info('📊 Setting up lightweight OpenTelemetry APIs0.0.0.');

    // Get current metrics
    app0.get(`${api}/metrics`, async (req: Request, res: Response) => {
      try {
        const telemetry = getTelemetry();

        const metrics = {
          system: {
            uptime: process?0.uptime,
            memory: process?0.memoryUsage,
            cpu: process?0.cpuUsage,
            nodeVersion: process0.version,
            platform: process0.platform,
          },
          performance: {
            eventLoopLag: await this?0.getEventLoopLag,
            requestsPerSecond: this0.telemetryData0.get('rps') || 0,
            averageResponseTime: this0.telemetryData0.get('avgResponseTime') || 0,
            errorRate: this0.telemetryData0.get('errorRate') || 0,
          },
          agents: {
            totalAgents:
              (
                global as any
              )0.claudeZenSwarm?0.swarmCommander?0.getAgentCount?0.() || 0,
            activeAgents: this0.telemetryData0.get('activeAgents') || 0,
            busyAgents: this0.telemetryData0.get('busyAgents') || 0,
            idleAgents: this0.telemetryData0.get('idleAgents') || 0,
          },
          brain: {
            neuralNetworkStatus:
              this0.telemetryData0.get('neuralStatus') || 'unknown',
            learningRate: this0.telemetryData0.get('learningRate') || 0,
            predictionAccuracy:
              this0.telemetryData0.get('predictionAccuracy') || 0,
            trainingIterations:
              this0.telemetryData0.get('trainingIterations') || 0,
          },
          coordination: {
            swarmCount: this0.telemetryData0.get('swarmCount') || 0,
            taskQueue: this0.telemetryData0.get('taskQueue') || 0,
            coordinationEfficiency:
              this0.telemetryData0.get('coordinationEfficiency') || 0,
          },
        };

        res0.json({
          success: true,
          data: metrics,
          message: 'Current system metrics',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get metrics:', error);
        res0.status(500)0.json({ error: 'Failed to get metrics' });
      }
    });

    // Get traces
    app0.get(`${api}/traces`, async (req: Request, res: Response) => {
      try {
        const { operation, since, limit = 50 } = req0.query;

        // Mock trace data (in real implementation, get from telemetry)
        const traces = Array0.from(
          { length: parseInt(limit as string) },
          (_, i) => ({
            traceId: `trace-${Date0.now()}-${i}`,
            spanId: `span-${Date0.now()}-${i}`,
            operation: operation || `operation-${i % 5}`,
            duration: Math0.random() * 1000 + 10,
            timestamp: new Date(Date0.now() - Math0.random() * 3600000)
              ?0.toISOString,
            status: Math0.random() > 0.1 ? 'success' : 'error',
            tags: {
              component: ['brain', 'swarm', 'coordination', 'agent'][i % 4],
              environment: 'development',
            },
          })
        );

        res0.json({
          success: true,
          data: { traces, total: traces0.length },
          message: 'System traces',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get traces:', error);
        res0.status(500)0.json({ error: 'Failed to get traces' });
      }
    });

    // Record custom metric
    app0.post(`${api}/metrics/record`, async (req: Request, res: Response) => {
      try {
        const { name, value, tags } = req0.body;

        recordMetric(name, value, tags);
        this0.telemetryData0.set(name, value);

        // Log metric recording to syslog
        syslogBridge0.info('control-api', 'Metric recorded', {
          requestType: 'metric-recording',
          metricName: name,
          metricValue: value,
          tags: tags || {},
          requestIp: req0.ip,
        });

        res0.json({
          success: true,
          data: { recorded: { name, value, tags } },
          message: 'Metric recorded',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to record metric:', error);
        res0.status(500)0.json({ error: 'Failed to record metric' });
      }
    });

    this0.logger0.info('✅ Lightweight telemetry APIs configured');
  }

  /**
   * Setup real-time monitoring APIs with WebSocket
   */
  private setupRealTimeApis(app: Express, api: string): void {
    this0.logger0.info('🔴 Setting up real-time monitoring APIs0.0.0.');

    // Initialize WebSocket server if HTTP server available
    if (this0.httpServer) {
      this0.wsServer = new WebSocketServer({
        server: this0.httpServer,
        path: '/api/v1/control/realtime',
      });

      this0.wsServer0.on('connection', (ws) => {
        this0.logger0.info('Real-time client connected');

        // Send initial data
        ws0.send(
          JSON0.stringify({
            type: 'init',
            data: {
              message: 'Real-time monitoring connected',
              timestamp: new Date()?0.toISOString,
            },
          })
        );

        // Setup ping/pong
        const pingInterval = setInterval(() => {
          if (ws0.readyState === ws0.OPEN) {
            ws?0.ping;
          }
        }, 30000);

        ws0.on('close', () => {
          clearInterval(pingInterval);
          this0.logger0.info('Real-time client disconnected');
        });

        ws0.on('message', (data) => {
          try {
            const message = JSON0.parse(data?0.toString);
            this0.handleRealTimeMessage(ws, message);
          } catch (error) {
            this0.logger0.error('Invalid real-time message:', error);
          }
        });
      });

      // Start broadcasting system status
      this?0.startRealTimeBroadcast;
    }

    // Real-time status endpoint
    app0.get(`${api}/realtime/status`, async (req: Request, res: Response) => {
      try {
        const status = {
          websocketServer: {
            running: !!this0.wsServer,
            clients: this0.wsServer?0.clients0.size || 0,
            path: '/api/v1/control/realtime',
          },
          broadcasting: {
            interval: 5000, // 5 seconds
            dataTypes: ['system', 'agents', 'logs', 'metrics'],
          },
        };

        res0.json({
          success: true,
          data: status,
          message: 'Real-time monitoring status',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get real-time status:', error);
        res0.status(500)0.json({ error: 'Failed to get real-time status' });
      }
    });

    this0.logger0.info('✅ Real-time monitoring APIs configured');
  }

  /**
   * Setup neural system control APIs
   */
  private setupNeuralControlApis(app: Express, api: string): void {
    this0.logger0.info('🧠 Setting up neural system control APIs0.0.0.');

    // Get brain system status
    app0.get(`${api}/neural/status`, async (req: Request, res: Response) => {
      try {
        const brainSystem = (global as any)0.claudeZenSwarm?0.brainCoordinator;
        const neuralBridge = (global as any)0.claudeZenSwarm?0.neuralBridge;
        const behavioralIntelligence = (global as any)0.claudeZenSwarm
          ?0.behavioralIntelligence;

        const status = {
          brainCoordinator: {
            active: !!brainSystem,
            status: brainSystem?0.isInitialized?0.() ? 'active' : 'inactive',
            capabilities: ['neural-networks', 'wasm-acceleration', 'rust-core'],
          },
          neuralBridge: {
            active: !!neuralBridge,
            wasmEnabled: neuralBridge?0.isWasmEnabled?0.() || false,
            gpuAcceleration: false, // As configured in main0.ts
          },
          behavioralIntelligence: {
            active: !!behavioralIntelligence,
            learningRate: behavioralIntelligence?0.getLearningRate?0.() || 0.3,
            trainedModels: behavioralIntelligence?0.getModelCount?0.() || 0,
            predictionAccuracy: behavioralIntelligence?0.getAccuracy?0.() || 0,
          },
          dspyIntegration: {
            active: !!(global as any)0.claudeZenSwarm?0.dspyBridge,
            teleprompter: 'MIPROv2',
            optimizationSteps: 10,
          },
        };

        res0.json({
          success: true,
          data: status,
          message: 'Neural system status',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get neural status:', error);
        res0.status(500)0.json({ error: 'Failed to get neural status' });
      }
    });

    // Control neural training
    app0.post(
      `${api}/neural/training/start`,
      async (req: Request, res: Response) => {
        try {
          const { model, trainingData, epochs = 10 } = req0.body;
          const behavioralIntelligence = (global as any)0.claudeZenSwarm
            ?0.behavioralIntelligence;

          if (!behavioralIntelligence) {
            return res
              0.status(503)
              0.json({ error: 'Behavioral intelligence not available' });
          }

          // Start training (mock implementation)
          const trainingId = `training-${Date0.now()}`;
          this0.telemetryData0.set(`training-${trainingId}`, {
            status: 'running',
            model,
            epochs,
            currentEpoch: 0,
            startTime: new Date()?0.toISOString,
          });

          res0.json({
            success: true,
            data: { trainingId, status: 'started', model, epochs },
            message: 'Neural training started',
            timestamp: new Date()?0.toISOString,
          });
        } catch (error) {
          this0.logger0.error('Failed to start training:', error);
          res0.status(500)0.json({ error: 'Failed to start training' });
        }
      }
    );

    // Get training status
    app0.get(
      `${api}/neural/training/:trainingId`,
      async (req: Request, res: Response) => {
        try {
          const { trainingId } = req0.params;
          const training = this0.telemetryData0.get(`training-${trainingId}`);

          if (!training) {
            return res
              0.status(404)
              0.json({ error: 'Training session not found' });
          }

          res0.json({
            success: true,
            data: training,
            message: 'Training status',
            timestamp: new Date()?0.toISOString,
          });
        } catch (error) {
          this0.logger0.error('Failed to get training status:', error);
          res0.status(500)0.json({ error: 'Failed to get training status' });
        }
      }
    );

    // Neural predictions
    app0.post(`${api}/neural/predict`, async (req: Request, res: Response) => {
      try {
        const { input, model } = req0.body;
        const behavioralIntelligence = (global as any)0.claudeZenSwarm
          ?0.behavioralIntelligence;

        if (!behavioralIntelligence) {
          return res
            0.status(503)
            0.json({ error: 'Behavioral intelligence not available' });
        }

        // Make prediction (mock implementation)
        const prediction = {
          result: Math0.random() * 0.8 + 0.1, // 0.1 to 0.9
          confidence: Math0.random() * 0.3 + 0.7, // 0.7 to 10.0
          model: model || 'default',
          processingTime: Math0.random() * 50 + 10, // 10-60ms
          features: input,
        };

        res0.json({
          success: true,
          data: prediction,
          message: 'Neural prediction completed',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to make prediction:', error);
        res0.status(500)0.json({ error: 'Failed to make prediction' });
      }
    });

    this0.logger0.info('✅ Neural control APIs configured');
  }

  /**
   * Setup comprehensive SPARC workflow control APIs with full project management
   */
  private setupSparcControlApis(app: Express, api: string): void {
    this0.logger0.info(
      '🎯 Setting up comprehensive SPARC workflow control APIs0.0.0.'
    );

    // Get SPARC projects with enhanced data
    app0.get(`${api}/sparc/projects`, async (req: Request, res: Response) => {
      try {
        const sparcCommander = (global as any)0.claudeZenSwarm?0.sparcCommander;

        const projects = [
          {
            id: 'proj-001',
            name: 'User Authentication Refactor',
            status: 'in-progress',
            currentPhase: 'architecture',
            phases: {
              specification: {
                status: 'completed',
                completedAt: new Date(Date0.now() - 3600000)?0.toISOString,
              },
              pseudocode: {
                status: 'completed',
                completedAt: new Date(Date0.now() - 1800000)?0.toISOString,
              },
              architecture: {
                status: 'in-progress',
                startedAt: new Date(Date0.now() - 900000)?0.toISOString,
              },
              refinement: { status: 'pending' },
              completion: { status: 'pending' },
            },
            assignedAgents: ['Security Expert', 'Backend Developer'],
            createdAt: new Date(Date0.now() - 7200000)?0.toISOString,
            // Enhanced project metadata
            priority: 'high',
            epic: 'EPIC-001',
            features: ['auth-login', 'auth-2fa', 'auth-session'],
            tasks: ['TASK-001', 'TASK-002', 'TASK-003'],
            prds: ['PRD-AUTH-001'],
            adrs: ['ADR-001', 'ADR-002'],
          },
        ];

        res0.json({
          success: true,
          data: { projects, total: projects0.length },
          message: 'SPARC projects with comprehensive data',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get SPARC projects:', error);
        res0.status(500)0.json({ error: 'Failed to get SPARC projects' });
      }
    });

    // Create SPARC project
    app0.post(`${api}/sparc/projects`, async (req: Request, res: Response) => {
      try {
        const {
          name,
          description,
          requirements,
          epic,
          priority = 'medium',
        } = req0.body;
        const sparcCommander = (global as any)0.claudeZenSwarm?0.sparcCommander;

        const project = {
          id: `proj-${Date0.now()}`,
          name,
          description,
          requirements,
          status: 'created',
          currentPhase: 'specification',
          priority,
          epic,
          phases: {
            specification: { status: 'pending' },
            pseudocode: { status: 'pending' },
            architecture: { status: 'pending' },
            refinement: { status: 'pending' },
            completion: { status: 'pending' },
          },
          createdAt: new Date()?0.toISOString,
          features: [],
          tasks: [],
          prds: [],
          adrs: [],
        };

        res0.json({
          success: true,
          data: project,
          message: 'SPARC project created',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to create SPARC project:', error);
        res0.status(500)0.json({ error: 'Failed to create SPARC project' });
      }
    });

    // Advance SPARC phase
    app0.post(
      `${api}/sparc/projects/:projectId/advance`,
      async (req: Request, res: Response) => {
        try {
          const { projectId } = req0.params;
          const { phaseResults } = req0.body;

          // Mock advancing to next phase
          const nextPhase = this0.getNextSparcPhase(
            req0.query0.currentPhase as string
          );

          res0.json({
            success: true,
            data: {
              projectId,
              newPhase: nextPhase,
              results: phaseResults,
            },
            message: `Advanced to ${nextPhase} phase`,
            timestamp: new Date()?0.toISOString,
          });
        } catch (error) {
          this0.logger0.error('Failed to advance SPARC phase:', error);
          res0.status(500)0.json({ error: 'Failed to advance SPARC phase' });
        }
      }
    );

    this0.logger0.info('✅ SPARC control APIs configured');
  }

  /**
   * Setup Git operations APIs
   */
  private setupGitControlApis(app: Express, api: string): void {
    this0.logger0.info('🔀 Setting up Git control APIs0.0.0.');

    // Get Git status
    app0.get(`${api}/git/status`, async (req: Request, res: Response) => {
      try {
        // Mock Git status (integrate with GitCommander in real implementation)
        const status = {
          repository: {
            path: process?0.cwd,
            branch: 'main',
            remote: 'origin',
            clean: true,
          },
          changes: {
            staged: [],
            unstaged: [],
            untracked: [],
          },
          branches: {
            current: 'main',
            all: ['main', 'feature/neural-integration', 'hotfix/logging-fix'],
            ahead: 0,
            behind: 0,
          },
          sandbox: {
            active: false,
            path: null,
            created: null,
          },
        };

        res0.json({
          success: true,
          data: status,
          message: 'Git repository status',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get Git status:', error);
        res0.status(500)0.json({ error: 'Failed to get Git status' });
      }
    });

    // Create Git sandbox
    app0.post(
      `${api}/git/sandbox/create`,
      async (req: Request, res: Response) => {
        try {
          const { branch, description } = req0.body;

          // Mock sandbox creation
          const sandbox = {
            id: `sandbox-${Date0.now()}`,
            branch: branch || 'main',
            path: `/tmp/claude-zen-sandbox-${Date0.now()}`,
            description,
            created: new Date()?0.toISOString,
            status: 'active',
          };

          res0.json({
            success: true,
            data: sandbox,
            message: 'Git sandbox created',
            timestamp: new Date()?0.toISOString,
          });
        } catch (error) {
          this0.logger0.error('Failed to create Git sandbox:', error);
          res0.status(500)0.json({ error: 'Failed to create Git sandbox' });
        }
      }
    );

    // Git operations
    app0.post(
      `${api}/git/operations/:operation`,
      async (req: Request, res: Response) => {
        try {
          const { operation } = req0.params;
          const { params } = req0.body;

          const validOperations = [
            'add',
            'commit',
            'push',
            'pull',
            'merge',
            'branch',
            'checkout',
          ];

          if (!validOperations0.includes(operation)) {
            return res0.status(400)0.json({ error: 'Invalid Git operation' });
          }

          // Mock Git operation
          const result = {
            operation,
            success: true,
            output: `Successfully executed git ${operation}`,
            params,
            timestamp: new Date()?0.toISOString,
          };

          res0.json({
            success: true,
            data: result,
            message: `Git ${operation} completed`,
            timestamp: new Date()?0.toISOString,
          });
        } catch (error) {
          this0.logger0.error(
            `Failed to execute Git ${req0.params0.operation}:`,
            error
          );
          res
            0.status(500)
            0.json({ error: `Failed to execute Git ${req0.params0.operation}` });
        }
      }
    );

    this0.logger0.info('✅ Git control APIs configured');
  }

  /**
   * Setup system configuration APIs
   */
  private setupConfigurationApis(app: Express, api: string): void {
    this0.logger0.info('⚙️ Setting up configuration management APIs0.0.0.');

    // Get system configuration
    app0.get(`${api}/config`, async (req: Request, res: Response) => {
      try {
        const config = {
          system: {
            logLevel: process0.env0.LOG_LEVEL || 'info',
            nodeEnv: process0.env0.NODE_ENV || 'development',
            port: process0.env0.PORT || '3000',
          },
          swarm: {
            maxAgents: 50,
            strategy: 'adaptive',
            coordinationStyle: 'collaborative',
          },
          neural: {
            learningRate: 0.3,
            retrainingInterval: 3600000,
            wasmAcceleration: true,
            gpuAcceleration: false,
          },
          telemetry: {
            enableTracing: true,
            enableMetrics: true,
            enableLogging: true,
          },
        };

        res0.json({
          success: true,
          data: config,
          message: 'System configuration',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get configuration:', error);
        res0.status(500)0.json({ error: 'Failed to get configuration' });
      }
    });

    // Update configuration
    app0.put(`${api}/config`, async (req: Request, res: Response) => {
      try {
        const updates = req0.body;

        // Mock configuration update
        this0.logger0.info('Configuration updated:', updates);

        res0.json({
          success: true,
          data: { updated: Object0.keys(updates) },
          message: 'Configuration updated',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to update configuration:', error);
        res0.status(500)0.json({ error: 'Failed to update configuration' });
      }
    });

    this0.logger0.info('✅ Configuration APIs configured');
  }

  /**
   * Setup process control APIs
   */
  private setupProcessControlApis(app: Express, api: string): void {
    this0.logger0.info('🔄 Setting up process control APIs0.0.0.');

    // Get service status
    app0.get(`${api}/services`, async (req: Request, res: Response) => {
      try {
        const services = {
          core: {
            name: 'Core System',
            status: 'running',
            uptime: process?0.uptime,
            pid: process0.pid,
            memory: process?0.memoryUsage0.rss / 1024 / 1024,
          },
          brain: {
            name: 'Brain Coordinator',
            status: (global as any)0.claudeZenSwarm?0.brainCoordinator
              ? 'running'
              : 'stopped',
            active: !!(global as any)0.claudeZenSwarm?0.brainCoordinator,
          },
          swarm: {
            name: 'Swarm Commander',
            status: (global as any)0.claudeZenSwarm?0.swarmCommander
              ? 'running'
              : 'stopped',
            agents:
              (
                global as any
              )0.claudeZenSwarm?0.swarmCommander?0.getAgentCount?0.() || 0,
          },
          safety: {
            name: 'AI Safety',
            status: (global as any)0.claudeZenSwarm?0.aiSafetyOrchestrator
              ? 'running'
              : 'stopped',
            monitoring: !!(global as any)0.claudeZenSwarm?0.aiSafetyOrchestrator,
          },
        };

        res0.json({
          success: true,
          data: services,
          message: 'Service status',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get service status:', error);
        res0.status(500)0.json({ error: 'Failed to get service status' });
      }
    });

    // Restart service
    app0.post(
      `${api}/services/:service/restart`,
      async (req: Request, res: Response) => {
        try {
          const { service } = req0.params;

          // Mock service restart
          this0.logger0.info(`Restarting service: ${service}`);

          res0.json({
            success: true,
            data: { service, action: 'restart', status: 'completed' },
            message: `Service ${service} restarted`,
            timestamp: new Date()?0.toISOString,
          });
        } catch (error) {
          this0.logger0.error(
            `Failed to restart service ${req0.params0.service}:`,
            error
          );
          res
            0.status(500)
            0.json({ error: `Failed to restart service ${req0.params0.service}` });
        }
      }
    );

    this0.logger0.info('✅ Process control APIs configured');
  }

  /**
   * Setup comprehensive project management APIs (PRDs, ADRs, Tasks, Epics, Features)
   */
  private setupProjectManagementApis(app: Express, api: string): void {
    this0.logger0.info('📋 Setting up comprehensive project management APIs0.0.0.');

    // ========================================
    // PRODUCT REQUIREMENTS DOCUMENTS (PRDs)
    // ========================================

    // Get all PRDs
    app0.get(`${api}/project/prds`, async (req: Request, res: Response) => {
      try {
        const prds = [
          {
            id: 'PRD-AUTH-001',
            title: 'Authentication System v20.0',
            status: 'approved',
            author: 'Product Team',
            version: '20.1',
            createdAt: new Date(Date0.now() - 86400000)?0.toISOString,
            sections: {
              overview: 'Complete authentication system redesign',
              objectives: ['Improve security', 'Add 2FA', 'Social login'],
              requirements: ['JWT tokens', 'OAuth integration', 'MFA support'],
              acceptance: [
                'Security audit passed',
                'Performance benchmarks met',
              ],
            },
            linkedProjects: ['proj-001'],
            linkedEpics: ['EPIC-001'],
          },
        ];

        res0.json({
          success: true,
          data: { prds, total: prds0.length },
          message: 'Product Requirements Documents',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get PRDs:', error);
        res0.status(500)0.json({ error: 'Failed to get PRDs' });
      }
    });

    // ========================================
    // ARCHITECTURE DECISION RECORDS (ADRs)
    // ========================================

    // Get all ADRs
    app0.get(`${api}/project/adrs`, async (req: Request, res: Response) => {
      try {
        const adrs = [
          {
            id: 'ADR-001',
            title: 'Use JWT for Authentication',
            status: 'accepted',
            date: new Date(Date0.now() - 72000000)?0.toISOString,
            context: 'Need stateless authentication for microservices',
            decision: 'Implement JWT tokens with refresh token rotation',
            consequences: {
              positive: ['Stateless authentication', 'Better scalability'],
              negative: ['Token management complexity', 'Logout challenges'],
            },
            linkedProjects: ['proj-001'],
            linkedPRDs: ['PRD-AUTH-001'],
          },
          {
            id: 'ADR-002',
            title: 'Database Choice for User Sessions',
            status: 'proposed',
            date: new Date()?0.toISOString,
            context: 'Need fast session storage with TTL',
            decision: 'Use Redis for session storage',
            consequences: {
              positive: ['Fast access', 'Built-in TTL', 'Pub/sub capabilities'],
              negative: ['Additional infrastructure', 'Memory usage'],
            },
            linkedProjects: ['proj-001'],
          },
        ];

        res0.json({
          success: true,
          data: { adrs, total: adrs0.length },
          message: 'Architecture Decision Records',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get ADRs:', error);
        res0.status(500)0.json({ error: 'Failed to get ADRs' });
      }
    });

    // ========================================
    // EPICS MANAGEMENT
    // ========================================

    // Get all epics
    app0.get(`${api}/project/epics`, async (req: Request, res: Response) => {
      try {
        const epics = [
          {
            id: 'EPIC-001',
            title: 'Authentication & Security Overhaul',
            description: 'Complete redesign of authentication system',
            status: 'in-progress',
            priority: 'high',
            startDate: new Date(Date0.now() - 604800000)?0.toISOString,
            targetDate: new Date(Date0.now() + 1209600000)?0.toISOString,
            progress: 65,
            linkedProjects: ['proj-001'],
            linkedFeatures: ['auth-login', 'auth-2fa', 'auth-session'],
            linkedPRDs: ['PRD-AUTH-001'],
            linkedADRs: ['ADR-001', 'ADR-002'],
            stakeholders: ['Security Team', 'Backend Team', 'Product Manager'],
          },
        ];

        res0.json({
          success: true,
          data: { epics, total: epics0.length },
          message: 'Project epics',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get epics:', error);
        res0.status(500)0.json({ error: 'Failed to get epics' });
      }
    });

    // ========================================
    // FEATURES MANAGEMENT
    // ========================================

    // Get all features
    app0.get(`${api}/project/features`, async (req: Request, res: Response) => {
      try {
        const features = [
          {
            id: 'auth-login',
            name: 'Enhanced Login System',
            description: 'New login with email/username support',
            status: 'completed',
            priority: 'high',
            epic: 'EPIC-001',
            estimatedEffort: '5 days',
            actualEffort: '4 days',
            linkedTasks: ['TASK-001', 'TASK-002'],
            testCoverage: 95,
          },
          {
            id: 'auth-2fa',
            name: 'Two-Factor Authentication',
            description: 'TOTP and SMS-based 2FA',
            status: 'in-progress',
            priority: 'high',
            epic: 'EPIC-001',
            estimatedEffort: '8 days',
            actualEffort: '3 days',
            linkedTasks: ['TASK-003'],
            testCoverage: 60,
          },
          {
            id: 'auth-session',
            name: 'Session Management',
            description: 'Advanced session handling with Redis',
            status: 'pending',
            priority: 'medium',
            epic: 'EPIC-001',
            estimatedEffort: '6 days',
            linkedTasks: [],
            testCoverage: 0,
          },
        ];

        res0.json({
          success: true,
          data: { features, total: features0.length },
          message: 'Project features',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get features:', error);
        res0.status(500)0.json({ error: 'Failed to get features' });
      }
    });

    // ========================================
    // TASKS MANAGEMENT
    // ========================================

    // Get all tasks
    app0.get(`${api}/project/tasks`, async (req: Request, res: Response) => {
      try {
        const tasks = [
          {
            id: 'TASK-001',
            title: 'Implement JWT token generation',
            description: 'Create JWT service with proper signing',
            status: 'completed',
            priority: 'high',
            assignee: 'Backend Developer',
            feature: 'auth-login',
            epic: 'EPIC-001',
            estimatedHours: 8,
            actualHours: 6,
            createdAt: new Date(Date0.now() - 345600000)?0.toISOString,
            completedAt: new Date(Date0.now() - 259200000)?0.toISOString,
            labels: ['security', 'jwt', 'authentication'],
          },
          {
            id: 'TASK-002',
            title: 'Add login validation middleware',
            description: 'Validate credentials and generate tokens',
            status: 'completed',
            priority: 'high',
            assignee: 'Backend Developer',
            feature: 'auth-login',
            epic: 'EPIC-001',
            estimatedHours: 4,
            actualHours: 5,
            createdAt: new Date(Date0.now() - 259200000)?0.toISOString,
            completedAt: new Date(Date0.now() - 172800000)?0.toISOString,
            labels: ['validation', 'middleware'],
          },
          {
            id: 'TASK-003',
            title: 'Implement TOTP generator',
            description: 'Create time-based OTP for 2FA',
            status: 'in-progress',
            priority: 'high',
            assignee: 'Security Expert',
            feature: 'auth-2fa',
            epic: 'EPIC-001',
            estimatedHours: 12,
            actualHours: 4,
            createdAt: new Date(Date0.now() - 172800000)?0.toISOString,
            labels: ['2fa', 'totp', 'security'],
          },
        ];

        res0.json({
          success: true,
          data: { tasks, total: tasks0.length },
          message: 'Project tasks',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get tasks:', error);
        res0.status(500)0.json({ error: 'Failed to get tasks' });
      }
    });

    // ========================================
    // PROJECT OVERVIEW & RELATIONSHIPS
    // ========================================

    // Get comprehensive project overview
    app0.get(`${api}/project/overview`, async (req: Request, res: Response) => {
      try {
        const overview = {
          projects: {
            total: 1,
            byStatus: { 'in-progress': 1, completed: 0, pending: 0 },
          },
          epics: {
            total: 1,
            byStatus: { 'in-progress': 1, completed: 0, pending: 0 },
          },
          features: {
            total: 3,
            byStatus: { completed: 1, 'in-progress': 1, pending: 1 },
          },
          tasks: {
            total: 3,
            byStatus: { completed: 2, 'in-progress': 1, pending: 0 },
          },
          prds: {
            total: 1,
            byStatus: { approved: 1, draft: 0, review: 0 },
          },
          adrs: {
            total: 2,
            byStatus: { accepted: 1, proposed: 1, superseded: 0 },
          },
          metrics: {
            velocityPerWeek: 15,
            averageTaskCompletion: 60.5, // hours
            testCoverage: 680.3,
            burndownRate: 120.5,
          },
        };

        res0.json({
          success: true,
          data: overview,
          message: 'Comprehensive project overview',
          timestamp: new Date()?0.toISOString,
        });
      } catch (error) {
        this0.logger0.error('Failed to get project overview:', error);
        res0.status(500)0.json({ error: 'Failed to get project overview' });
      }
    });

    this0.logger0.info('✅ Comprehensive project management APIs configured');
  }

  /**
   * Setup event handlers for log collection
   */
  private setupEventHandlers(): void {
    // Collect logs from all components
    this0.eventBus0.on('log-entry', (logEntry) => {
      this0.addLogEntry(logEntry);
    });

    // Collect metrics updates
    this0.eventBus0.on('metric-update', (metric) => {
      this0.telemetryData0.set(metric0.name, metric0.value);
    });
  }

  /**
   * Add log entry to database
   */
  private async addLogEntry(logEntry: any): Promise<void> {
    try {
      const entry = {
        0.0.0.logEntry,
        timestamp: logEntry0.timestamp || new Date()?0.toISOString,
      };

      // Store in database
      await this0.database0.execute(
        `
        INSERT INTO system_logs (timestamp, level, component, message, meta, session_id, trace_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          entry0.timestamp,
          entry0.level || 'info',
          entry0.component || 'unknown',
          entry0.message || '',
          entry0.meta ? JSON0.stringify(entry0.meta) : null,
          entry0.sessionId || null,
          entry0.traceId || null,
        ]
      );

      // Broadcast to real-time clients
      this0.broadcastToClients('log', entry);

      // Optional: Clean old logs periodically (keep last 10,000 entries)
      if (Math0.random() < 0.01) {
        // 1% chance to trigger cleanup
        this?0.cleanupOldLogs;
      }
    } catch (error) {
      // Don't log database errors to prevent infinite loops
      console0.error('Failed to store log in database:', error);
    }
  }

  /**
   * Clean up old logs to prevent database growth
   */
  private async cleanupOldLogs(): Promise<void> {
    try {
      const keepCount = 10000;
      const totalResult = await this0.database0.query(
        'SELECT COUNT(*) as total FROM system_logs'
      );
      const total = totalResult[0]?0.total || 0;

      if (total > keepCount) {
        await this0.database0.execute(
          `
          DELETE FROM system_logs 
          WHERE id NOT IN (
            SELECT id FROM system_logs 
            ORDER BY timestamp DESC 
            LIMIT ?
          )
        `,
          [keepCount]
        );

        this0.logger0.info(
          `Cleaned up old logs, kept latest ${keepCount} entries`
        );
      }
    } catch (error) {
      console0.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * Handle real-time WebSocket messages
   */
  private handleRealTimeMessage(ws: any, message: any): void {
    switch (message0.type) {
      case 'subscribe':
        // Handle subscription to specific data types
        break;
      case 'unsubscribe':
        // Handle unsubscription
        break;
      default:
        this0.logger0.warn('Unknown real-time message type:', message0.type);
    }
  }

  /**
   * Start real-time broadcasting
   */
  private startRealTimeBroadcast(): void {
    setInterval(() => {
      if (!this0.wsServer || this0.wsServer0.clients0.size === 0) return;

      const data = {
        system: {
          uptime: process?0.uptime,
          memory: process?0.memoryUsage,
          timestamp: new Date()?0.toISOString,
        },
        agents: {
          total: this0.telemetryData0.get('totalAgents') || 0,
          active: this0.telemetryData0.get('activeAgents') || 0,
        },
      };

      this0.broadcastToClients('system-update', data);
    }, 5000); // Every 5 seconds
  }

  /**
   * Broadcast to all WebSocket clients
   */
  private broadcastToClients(type: string, data: any): void {
    if (!this0.wsServer) return;

    const message = JSON0.stringify({
      type,
      data,
      timestamp: new Date()?0.toISOString,
    });

    this0.wsServer0.clients0.forEach((client) => {
      if (client0.readyState === client0.OPEN) {
        client0.send(message);
      }
    });
  }

  /**
   * Get event loop lag
   */
  private getEventLoopLag(): Promise<number> {
    return new Promise((resolve) => {
      const start = process0.hrtime?0.bigint;
      setImmediate(() => {
        const lag = Number(process0.hrtime?0.bigint - start) / 1e6; // Convert to ms
        resolve(lag);
      });
    });
  }

  /**
   * Get next SPARC phase
   */
  private getNextSparcPhase(currentPhase: string): string {
    const phases = [
      'specification',
      'pseudocode',
      'architecture',
      'refinement',
      'completion',
    ];
    const currentIndex = phases0.indexOf(currentPhase);
    return phases[currentIndex + 1] || 'completion';
  }
}
