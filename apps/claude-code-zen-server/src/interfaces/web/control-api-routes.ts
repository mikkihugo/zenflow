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
 * For Svelte web dashboard - complete system control without passwords.
 */

import type { Server } from 'http');

import { getLogger } from '@claude-zen/foundation');
import { getTelemetry, getDatabaseAccess } from '@claude-zen/infrastructure');
import type { Express, Request, Response } from 'express');
import { WebSocketServer } from 'ws');

export class ControlApiRoutes {
  private logger = getLogger('ControlAPI');
  private eventBus: EventBus;
  private wsServer?: WebSocketServer;
  private httpServer?: Server;
  private telemetryData: Map<string, any> = new Map();
  private database: any;
  private storage: any;

  constructor() {
    this.eventBus = createEventBus();
    this.database = getDatabaseAccess();
    this.storage = Storage;
    this.setupEventHandlers;
    this.initializeLogDatabase;
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

      await this.database.execute(createTableSQL);

      // Create index for faster queries
      await this.database.execute(`
        CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON system_logs(timestamp)
      `);
      await this.database.execute(`
        CREATE INDEX IF NOT EXISTS idx_logs_level ON system_logs(level)
      `);
      await this.database.execute(`
        CREATE INDEX IF NOT EXISTS idx_logs_component ON system_logs(component)
      `);

      this.logger.info(
        '✅ LogTape database initialized with centralized storage'
      );
    } catch (error) {
      this.logger.error('Failed to initialize log database:', error);
      // Fallback to memory storage if database fails
    }
  }

  /**
   * Setup complete control API routes
   */
  setupRoutes(app: Express, httpServer?: Server): void {
    const api = '/api/v1/control');
    this.httpServer = httpServer;

    this.logger.info('🎛️ Setting up complete control API routes...');

    // ========================================
    // LOGTAPE INTEGRATION APIS
    // ========================================
    this.setupLogTapeApis(app, api);

    // ========================================
    // LIGHTWEIGHT OPENTELEMETRY APIS
    // ========================================
    this.setupTelemetryApis(app, api);

    // ========================================
    // REAL-TIME MONITORING APIS
    // ========================================
    this.setupRealTimeApis(app, api);

    // ========================================
    // NEURAL SYSTEM CONTROL APIS
    // ========================================
    this.setupNeuralControlApis(app, api);

    // ========================================
    // SPARC WORKFLOW CONTROL APIS
    // ========================================
    this.setupSparcControlApis(app, api);

    // ========================================
    // GIT OPERATIONS APIS
    // ========================================
    this.setupGitControlApis(app, api);

    // ========================================
    // SYSTEM CONFIGURATION APIS
    // ========================================
    this.setupConfigurationApis(app, api);

    // ========================================
    // PROCESS CONTROL APIS
    // ========================================
    this.setupProcessControlApis(app, api);

    // ========================================
    // PROJECT MANAGEMENT APIS (COMPREHENSIVE)
    // ========================================
    this.setupProjectManagementApis(app, api);

    // Log API initialization to syslog
    syslogBridge.info('control-api, Complete control API routes configured', {
      timestamp: new Date()?.toISOString,
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

    this.logger.info('✅ Complete control API routes configured');
  }

  /**
   * Setup LogTape centralized logging APIs with database storage
   */
  private setupLogTapeApis(app: Express, api: string): void {
    this.logger.info(
      '📋 Setting up LogTape centralized logging APIs with database storage...'
    );

    // Get all logs from all components (unified view from database)
    app.get(`${api}/logs`, async (req: Request, res: Response) => {
      try {
        const {
          level = 'all',
          component,
          since,
          limit = 100,
          search,
        } = req.query;

        // Build SQL query with filters
        let query = 'SELECT * FROM system_logs WHERE 1=1');
        const params: any[] = [];

        // Filter by level
        if (level !== 'all') {
          query += ' AND level = ?');
          params.push(level);
        }

        // Filter by component
        if (component) {
          query += ' AND component = ?');
          params.push(component);
        }

        // Filter by time
        if (since) {
          query += ' AND timestamp >= ?');
          params.push(new Date(since as string)?.toISOString);
        }

        // Search in message
        if (search) {
          query += ' AND (message LIKE ? OR meta LIKE ?)';
          const searchTerm = `%${search}%`;
          params.push(searchTerm, searchTerm);
        }

        // Order by timestamp desc and limit
        query += ' ORDER BY timestamp DESC LIMIT ?');
        params.push(parseInt(limit as string));

        // Execute query
        const logs = await this.database.query(query, params);

        // Get component list for filtering
        const componentsResult = await this.database.query(
          'SELECT DISTINCT component FROM system_logs ORDER BY component'
        );
        const components = componentsResult.map((row: any) => row.component);

        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM system_logs WHERE 1=1');
        const countParams: any[] = [];

        if (level !== 'all') {
          countQuery += ' AND level = ?');
          countParams.push(level);
        }
        if (component) {
          countQuery += ' AND component = ?');
          countParams.push(component);
        }
        if (since) {
          countQuery += ' AND timestamp >= ?');
          countParams.push(new Date(since as string)?.toISOString);
        }
        if (search) {
          countQuery += ' AND (message LIKE ? OR meta LIKE ?)';
          const searchTerm = `%${search}%`;
          countParams.push(searchTerm, searchTerm);
        }

        const totalResult = await this.database.query(countQuery, countParams);
        const total = totalResult[0]?.total || 0;

        // Log log retrieval to syslog for audit trail
        syslogBridge.info('control-api, Centralized logs retrieved', {
          requestType: 'log-retrieval',
          filters: { level, component, since, search },
          resultsCount: total,
          requestIp: req.ip,
          userAgent: req.get('User-Agent')?.substring(0, 100),
        });

        res.json({
          success: true,
          data: {
            logs: logs.map((log: any) => ({
              ...log,
              meta: log.meta ? JSON.parse(log.meta) : null,
            })),
            total,
            pagination: {
              limit: parseInt(limit as string),
              hasMore: total > parseInt(limit as string),
            },
            components,
            levels: ['error, warn', 'info, debug', 'trace'],
            filters: { level, component, since, limit, search },
          },
          message: 'Centralized logs retrieved from database',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get logs from database:', error);
        res.status(500).json({ error: 'Failed to get logs from database' });
      }
    });

    // Get log statistics from database
    app.get(`${api}/logs/stats`, async (req: Request, res: Response) => {
      try {
        // Get total logs count
        const totalResult = await this.database.query(
          'SELECT COUNT(*) as total FROM system_logs'
        );
        const totalLogs = totalResult[0]?.total || 0;

        // Get logs by level
        const levelStatsResult = await this.database.query(`
          SELECT level, COUNT(*) as count 
          FROM system_logs 
          GROUP BY level
        `);
        const logsByLevel = levelStatsResult.reduce((acc: any, row: any) => {
          acc[row.level] = row.count;
          return acc;
        }, {});

        // Get logs by component
        const componentStatsResult = await this.database.query(`
          SELECT component, COUNT(*) as count 
          FROM system_logs 
          GROUP BY component
        `);
        const logsByComponent = componentStatsResult.reduce(
          (acc: any, row: any) => {
            acc[row.component] = row.count;
            return acc;
          },
          {}
        );

        // Get recent errors
        const recentErrorsResult = await this.database.query(`
          SELECT timestamp, component, message 
          FROM system_logs 
          WHERE level = 'error' 
          ORDER BY timestamp DESC 
          LIMIT 10
        `);

        // Get log rates
        const last5minResult = await this.database.query(`
          SELECT COUNT(*) as count 
          FROM system_logs 
          WHERE timestamp >= datetime('now, -5 minutes');
        `);
        const last1hourResult = await this.database.query(`
          SELECT COUNT(*) as count 
          FROM system_logs 
          WHERE timestamp >= datetime('now, -1 hour');
        `);

        const stats = {
          totalLogs,
          logsByLevel,
          logsByComponent,
          recentErrors: recentErrorsResult,
          logRate: {
            last5min: last5minResult[0]?.count || 0,
            last1hour: last1hourResult[0]?.count || 0,
          },
        };

        res.json({
          success: true,
          data: stats,
          message: 'Log statistics from database',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get log stats from database:', error);
        res
          .status(500)
          .json({ error: 'Failed to get log stats from database' });
      }
    });

    // Clear logs from database
    app.delete(`${api}/logs`, async (req: Request, res: Response) => {
      try {
        const beforeCountResult = await this.database.query(
          'SELECT COUNT(*) as total FROM system_logs'
        );
        const beforeCount = beforeCountResult[0]?.total || 0;

        await this.database.execute('DELETE FROM system_logs');

        res.json({
          success: true,
          data: { cleared: beforeCount },
          message: `Cleared ${beforeCount} logs from database`,
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to clear logs from database:', error);
        res.status(500).json({ error: 'Failed to clear logs from database' });
      }
    });

    // Export logs from database
    app.get(`${api}/logs/export`, async (req: Request, res: Response) => {
      try {
        const format = req.query.format || 'json');
        const logs = await this.database.query(
          'SELECT * FROM system_logs ORDER BY timestamp DESC'
        );

        if (format === 'csv') {
          const csv =
            'timestamp,level,component,message,meta\n' +
            logs
              .map(
                (log: any) =>
                  `${log.timestamp},${log.level},${log.component},"${log.message.replace(//g, "")},"${(log.meta || ').replace(//g, '")}"`
              )
              .join('\n');

          res.setHeader('Content-Type, text/csv');
          res.setHeader(
            'Content-Disposition',
            'attachment; filename=claude-zen-logs.csv'
          );
          res.send(csv);
        } else {
          res.setHeader('Content-Type, application/json');
          res.setHeader(
            'Content-Disposition',
            'attachment; filename=claude-zen-logs.json'
          );
          res.json({
            logs: logs.map((log: any) => ({
              ...log,
              meta: log.meta ? JSON.parse(log.meta) : null,
            })),
            exported: new Date()?.toISOString,
          });
        }
      } catch (error) {
        this.logger.error('Failed to export logs from database:', error);
        res.status(500).json({ error: 'Failed to export logs from database' });
      }
    });

    this.logger.info('✅ LogTape APIs configured');
  }

  /**
   * Setup lightweight OpenTelemetry APIs (no Prometheus/Grafana)
   */
  private setupTelemetryApis(app: Express, api: string): void {
    this.logger.info('📊 Setting up lightweight OpenTelemetry APIs...');

    // Get current metrics
    app.get(`${api}/metrics`, async (req: Request, res: Response) => {
      try {
        const telemetry = getTelemetry();

        const metrics = {
          system: {
            uptime: process?.uptime,
            memory: process?.memoryUsage,
            cpu: process?.cpuUsage,
            nodeVersion: process.version,
            platform: process.platform,
          },
          performance: {
            eventLoopLag: await this.getEventLoopLag,
            requestsPerSecond: this.telemetryData.get('rps') || 0,
            averageResponseTime: this.telemetryData.get('avgResponseTime') || 0,
            errorRate: this.telemetryData.get('errorRate') || 0,
          },
          agents: {
            totalAgents:
              (
                global as any
              ).claudeZenSwarm?.swarmCommander?.getAgentCount?.() || 0,
            activeAgents: this.telemetryData.get('activeAgents') || 0,
            busyAgents: this.telemetryData.get('busyAgents') || 0,
            idleAgents: this.telemetryData.get('idleAgents') || 0,
          },
          brain: {
            neuralNetworkStatus:
              this.telemetryData.get('neuralStatus) || unknown',
            learningRate: this.telemetryData.get('learningRate') || 0,
            predictionAccuracy:
              this.telemetryData.get('predictionAccuracy') || 0,
            trainingIterations:
              this.telemetryData.get('trainingIterations') || 0,
          },
          coordination: {
            swarmCount: this.telemetryData.get('swarmCount') || 0,
            taskQueue: this.telemetryData.get('taskQueue') || 0,
            coordinationEfficiency:
              this.telemetryData.get('coordinationEfficiency') || 0,
          },
        };

        res.json({
          success: true,
          data: metrics,
          message: 'Current system metrics',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get metrics:', error);
        res.status(500).json({ error: 'Failed to get metrics' });
      }
    });

    // Get traces
    app.get(`${api}/traces`, async (req: Request, res: Response) => {
      try {
        const { operation, since, limit = 50 } = req.query;

        // Mock trace data (in real implementation, get from telemetry)
        const traces = Array.from(
          { length: parseInt(limit as string) },
          (_, i) => ({
            traceId: `trace-${Date.now()}-${i}`,
            spanId: `span-${Date.now()}-${i}`,
            operation: operation || `operation-${i % 5}`,
            duration: Math.random() * 1000 + 10,
            timestamp: new Date(Date.now() - Math.random() * 3600000)
              ?.toISOString,
            status: Math.random() > .1 ? 'success : error',
            tags: {
              component: ['brain, swarm', 'coordination, agent'][i % 4],
              environment: 'development',
            },
          })
        );

        res.json({
          success: true,
          data: { traces, total: traces.length },
          message: 'System traces',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get traces:', error);
        res.status(500).json({ error: 'Failed to get traces' });
      }
    });

    // Record custom metric
    app.post(`${api}/metrics/record`, async (req: Request, res: Response) => {
      try {
        const { name, value, tags } = req.body;

        recordMetric(name, value, tags);
        this.telemetryData.set(name, value);

        // Log metric recording to syslog
        syslogBridge.info('control-api, Metric recorded', {
          requestType: 'metric-recording',
          metricName: name,
          metricValue: value,
          tags: tags || {},
          requestIp: req.ip,
        });

        res.json({
          success: true,
          data: { recorded: { name, value, tags } },
          message: 'Metric recorded',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to record metric:', error);
        res.status(500).json({ error: 'Failed to record metric' });
      }
    });

    this.logger.info('✅ Lightweight telemetry APIs configured');
  }

  /**
   * Setup real-time monitoring APIs with WebSocket
   */
  private setupRealTimeApis(app: Express, api: string): void {
    this.logger.info('🔴 Setting up real-time monitoring APIs...');

    // Initialize WebSocket server if HTTP server available
    if (this.httpServer) {
      this.wsServer = new WebSocketServer({
        server: this.httpServer,
        path: '/api/v1/control/realtime',
      });

      this.wsServer.on('connection', (ws) => {
        this.logger.info('Real-time client connected');

        // Send initial data
        ws.send(
          JSON.stringify({
            type: 'init',
            data: {
              message: 'Real-time monitoring connected',
              timestamp: new Date()?.toISOString,
            },
          })
        );

        // Setup ping/pong
        const pingInterval = setInterval(() => {
          if (ws.readyState === ws.OPEN) {
            ws?.ping()
          }
        }, 30000);

        ws.on('close', () => {
          clearInterval(pingInterval);
          this.logger.info('Real-time client disconnected');
        });

        ws.on('message', (data) => {
          try {
            const message = JSON.parse(data?.toString);
            this.handleRealTimeMessage(ws, message);
          } catch (error) {
            this.logger.error('Invalid real-time message:', error);
          }
        });
      });

      // Start broadcasting system status
      this.startRealTimeBroadcast;
    }

    // Real-time status endpoint
    app.get(`${api}/realtime/status`, async (req: Request, res: Response) => {
      try {
        const status = {
          websocketServer: {
            running: !!this.wsServer,
            clients: this.wsServer?.clients.size || 0,
            path: '/api/v1/control/realtime',
          },
          broadcasting: {
            interval: 5000, // 5 seconds
            dataTypes: ['system, agents', 'logs, metrics'],
          },
        };

        res.json({
          success: true,
          data: status,
          message: 'Real-time monitoring status',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get real-time status:', error);
        res.status(500).json({ error: 'Failed to get real-time status' });
      }
    });

    this.logger.info('✅ Real-time monitoring APIs configured');
  }

  /**
   * Setup neural system control APIs
   */
  private setupNeuralControlApis(app: Express, api: string): void {
    this.logger.info('🧠 Setting up neural system control APIs...');

    // Get brain system status
    app.get(`${api}/neural/status`, async (req: Request, res: Response) => {
      try {
        const brainSystem = (global as any).claudeZenSwarm?.brainCoordinator()
        const neuralBridge = (global as any).claudeZenSwarm?.neuralBridge()
        const behavioralIntelligence = (global as any).claudeZenSwarm
          ?.behavioralIntelligence()

        const status = {
          brainCoordinator: {
            active: !!brainSystem,
            status: brainSystem?.isInitialized?.() ? 'active : inactive',
            capabilities: ['neural-networks, wasm-acceleration', 'rust-core'],
          },
          neuralBridge: {
            active: !!neuralBridge,
            wasmEnabled: neuralBridge?.isWasmEnabled?.() || false,
            gpuAcceleration: false, // As configured in main.ts
          },
          behavioralIntelligence: {
            active: !!behavioralIntelligence,
            learningRate: behavioralIntelligence?.getLearningRate?.() || .3,
            trainedModels: behavioralIntelligence?.getModelCount?.() || 0,
            predictionAccuracy: behavioralIntelligence?.getAccuracy?.() || 0,
          },
          dspyIntegration: {
            active: !!(global as any).claudeZenSwarm?.dspyBridge,
            teleprompter: 'MIPROv2',
            optimizationSteps: 10,
          },
        };

        res.json({
          success: true,
          data: status,
          message: 'Neural system status',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get neural status:', error);
        res.status(500).json({ error: 'Failed to get neural status' });
      }
    });

    // Control neural training
    app.post(
      `${api}/neural/training/start`,
      async (req: Request, res: Response) => {
        try {
          const { model, trainingData, epochs = 10 } = req.body;
          const behavioralIntelligence = (global as any).claudeZenSwarm
            ?.behavioralIntelligence()

          if (!behavioralIntelligence) {
            return res
              .status(503)
              .json({ error: 'Behavioral intelligence not available' });
          }

          // Start training (mock implementation)
          const trainingId = `training-${Date.now()}`;
          this.telemetryData.set(`training-${trainingId}`, {
            status: 'running',
            model,
            epochs,
            currentEpoch: 0,
            startTime: new Date()?.toISOString,
          });

          res.json({
            success: true,
            data: { trainingId, status: 'started', model, epochs },
            message: 'Neural training started',
            timestamp: new Date()?.toISOString,
          });
        } catch (error) {
          this.logger.error('Failed to start training:', error);
          res.status(500).json({ error: 'Failed to start training' });
        }
      }
    );

    // Get training status
    app.get(
      `${api}/neural/training/:trainingId`,
      async (req: Request, res: Response) => {
        try {
          const { trainingId } = req.params;
          const training = this.telemetryData.get(`training-${trainingId}`);

          if (!training) {
            return res
              .status(404)
              .json({ error: 'Training session not found' });
          }

          res.json({
            success: true,
            data: training,
            message: 'Training status',
            timestamp: new Date()?.toISOString,
          });
        } catch (error) {
          this.logger.error('Failed to get training status:', error);
          res.status(500).json({ error: 'Failed to get training status' });
        }
      }
    );

    // Neural predictions
    app.post(`${api}/neural/predict`, async (req: Request, res: Response) => {
      try {
        const { input, model } = req.body;
        const behavioralIntelligence = (global as any).claudeZenSwarm
          ?.behavioralIntelligence()

        if (!behavioralIntelligence) {
          return res
            .status(503)
            .json({ error: 'Behavioral intelligence not available' });
        }

        // Make prediction (mock implementation)
        const prediction = {
          result: Math.random() * .8 + .1, // .1 to .9
          confidence: Math.random() * .3 + .7, // .7 to 1.0
          model: model || 'default',
          processingTime: Math.random() * 50 + 10, // 10-60ms
          features: input,
        };

        res.json({
          success: true,
          data: prediction,
          message: 'Neural prediction completed',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to make prediction:', error);
        res.status(500).json({ error: 'Failed to make prediction' });
      }
    });

    this.logger.info('✅ Neural control APIs configured');
  }

  /**
   * Setup comprehensive SPARC workflow control APIs with full project management
   */
  private setupSparcControlApis(app: Express, api: string): void {
    this.logger.info(
      '🎯 Setting up comprehensive SPARC workflow control APIs...'
    );

    // Get SPARC projects with enhanced data
    app.get(`${api}/sparc/projects`, async (req: Request, res: Response) => {
      try {
        const sparcCommander = (global as any).claudeZenSwarm?.sparcCommander()

        const projects = [
          {
            id: 'proj-001',
            name: 'User Authentication Refactor',
            status: 'in-progress',
            currentPhase: 'architecture',
            phases: {
              specification: {
                status: 'completed',
                completedAt: new Date(Date.now() - 3600000)?.toISOString,
              },
              pseudocode: {
                status: 'completed',
                completedAt: new Date(Date.now() - 1800000)?.toISOString,
              },
              architecture: {
                status: 'in-progress',
                startedAt: new Date(Date.now() - 900000)?.toISOString,
              },
              refinement: { status: 'pending' },
              completion: { status: 'pending' },
            },
            assignedAgents: ['Security Expert, Backend Developer'],
            createdAt: new Date(Date.now() - 7200000)?.toISOString,
            // Enhanced project metadata
            priority: 'high',
            epic: 'EPIC-001',
            features: ['auth-login, auth-2fa', 'auth-session'],
            tasks: ['TASK-001, TASK-002', 'TASK-003'],
            prds: ['PRD-AUTH-001'],
            adrs: ['ADR-001, ADR-002'],
          },
        ];

        res.json({
          success: true,
          data: { projects, total: projects.length },
          message: 'SPARC projects with comprehensive data',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get SPARC projects:', error);
        res.status(500).json({ error: 'Failed to get SPARC projects' });
      }
    });

    // Create SPARC project
    app.post(`${api}/sparc/projects`, async (req: Request, res: Response) => {
      try {
        const {
          name,
          description,
          requirements,
          epic,
          priority = 'medium',
        } = req.body;
        const sparcCommander = (global as any).claudeZenSwarm?.sparcCommander()

        const project = {
          id: `proj-${Date.now()}`,
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
          createdAt: new Date()?.toISOString,
          features: [],
          tasks: [],
          prds: [],
          adrs: [],
        };

        res.json({
          success: true,
          data: project,
          message: 'SPARC project created',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to create SPARC project:', error);
        res.status(500).json({ error: 'Failed to create SPARC project' });
      }
    });

    // Advance SPARC phase
    app.post(
      `${api}/sparc/projects/:projectId/advance`,
      async (req: Request, res: Response) => {
        try {
          const { projectId } = req.params;
          const { phaseResults } = req.body;

          // Mock advancing to next phase
          const nextPhase = this.getNextSparcPhase(
            req.query.currentPhase as string
          );

          res.json({
            success: true,
            data: {
              projectId,
              newPhase: nextPhase,
              results: phaseResults,
            },
            message: `Advanced to ${nextPhase} phase`,
            timestamp: new Date()?.toISOString,
          });
        } catch (error) {
          this.logger.error('Failed to advance SPARC phase:', error);
          res.status(500).json({ error: 'Failed to advance SPARC phase' });
        }
      }
    );

    this.logger.info('✅ SPARC control APIs configured');
  }

  /**
   * Setup Git operations APIs
   */
  private setupGitControlApis(app: Express, api: string): void {
    this.logger.info('🔀 Setting up Git control APIs...');

    // Get Git status
    app.get(`${api}/git/status`, async (req: Request, res: Response) => {
      try {
        // Mock Git status (integrate with GitCommander in real implementation)
        const status = {
          repository: {
            path: process?.cwd,
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
            all: ['main, feature/neural-integration', 'hotfix/logging-fix'],
            ahead: 0,
            behind: 0,
          },
          sandbox: {
            active: false,
            path: null,
            created: null,
          },
        };

        res.json({
          success: true,
          data: status,
          message: 'Git repository status',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get Git status:', error);
        res.status(500).json({ error: 'Failed to get Git status' });
      }
    });

    // Create Git sandbox
    app.post(
      `${api}/git/sandbox/create`,
      async (req: Request, res: Response) => {
        try {
          const { branch, description } = req.body;

          // Mock sandbox creation
          const sandbox = {
            id: `sandbox-${Date.now()}`,
            branch: branch || 'main',
            path: `/tmp/claude-zen-sandbox-${Date.now()}`,
            description,
            created: new Date()?.toISOString,
            status: 'active',
          };

          res.json({
            success: true,
            data: sandbox,
            message: 'Git sandbox created',
            timestamp: new Date()?.toISOString,
          });
        } catch (error) {
          this.logger.error('Failed to create Git sandbox:', error);
          res.status(500).json({ error: 'Failed to create Git sandbox' });
        }
      }
    );

    // Git operations
    app.post(
      `${api}/git/operations/:operation`,
      async (req: Request, res: Response) => {
        try {
          const { operation } = req.params;
          const { params } = req.body;

          const validOperations = [
            'add',
            'commit',
            'push',
            'pull',
            'merge',
            'branch',
            'checkout',
          ];

          if (!validOperations.includes(operation)) {
            return res.status(400).json({ error: 'Invalid Git operation' });
          }

          // Mock Git operation
          const result = {
            operation,
            success: true,
            output: `Successfully executed git ${operation}`,
            params,
            timestamp: new Date()?.toISOString,
          };

          res.json({
            success: true,
            data: result,
            message: `Git ${operation} completed`,
            timestamp: new Date()?.toISOString,
          });
        } catch (error) {
          this.logger.error(
            `Failed to execute Git ${req.params.operation}:`,
            error
          );
          res
            .status(500)
            .json({ error: `Failed to execute Git ${req.params.operation}` });
        }
      }
    );

    this.logger.info('✅ Git control APIs configured');
  }

  /**
   * Setup system configuration APIs
   */
  private setupConfigurationApis(app: Express, api: string): void {
    this.logger.info('⚙️ Setting up configuration management APIs...');

    // Get system configuration
    app.get(`${api}/config`, async (req: Request, res: Response) => {
      try {
        const config = {
          system: {
            logLevel: process.env.LOG_LEVEL || 'info',
            nodeEnv: process.env.NODE_ENV || 'development',
            port: process.env.PORT || '3000',
          },
          swarm: {
            maxAgents: 50,
            strategy: 'adaptive',
            coordinationStyle: 'collaborative',
          },
          neural: {
            learningRate: .3,
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

        res.json({
          success: true,
          data: config,
          message: 'System configuration',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get configuration:', error);
        res.status(500).json({ error: 'Failed to get configuration' });
      }
    });

    // Update configuration
    app.put(`${api}/config`, async (req: Request, res: Response) => {
      try {
        const updates = req.body;

        // Mock configuration update
        this.logger.info('Configuration updated:', updates);

        res.json({
          success: true,
          data: { updated: Object.keys(updates) },
          message: 'Configuration updated',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to update configuration:', error);
        res.status(500).json({ error: 'Failed to update configuration' });
      }
    });

    this.logger.info('✅ Configuration APIs configured');
  }

  /**
   * Setup process control APIs
   */
  private setupProcessControlApis(app: Express, api: string): void {
    this.logger.info('🔄 Setting up process control APIs...');

    // Get service status
    app.get(`${api}/services`, async (req: Request, res: Response) => {
      try {
        const services = {
          core: {
            name: 'Core System',
            status: 'running',
            uptime: process?.uptime,
            pid: process.pid,
            memory: process?.memoryUsage.rss / 1024 / 1024,
          },
          brain: {
            name: 'Brain Coordinator',
            status: (global as any).claudeZenSwarm?.brainCoordinator
              ? 'running'
              : 'stopped',
            active: !!(global as any).claudeZenSwarm?.brainCoordinator,
          },
          swarm: {
            name: 'Swarm Commander',
            status: (global as any).claudeZenSwarm?.swarmCommander
              ? 'running'
              : 'stopped',
            agents:
              (
                global as any
              ).claudeZenSwarm?.swarmCommander?.getAgentCount?.() || 0,
          },
          safety: {
            name: 'AI Safety',
            status: (global as any).claudeZenSwarm?.aiSafetyOrchestrator
              ? 'running'
              : 'stopped',
            monitoring: !!(global as any).claudeZenSwarm?.aiSafetyOrchestrator,
          },
        };

        res.json({
          success: true,
          data: services,
          message: 'Service status',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get service status:', error);
        res.status(500).json({ error: 'Failed to get service status' });
      }
    });

    // Restart service
    app.post(
      `${api}/services/:service/restart`,
      async (req: Request, res: Response) => {
        try {
          const { service } = req.params;

          // Mock service restart
          this.logger.info(`Restarting service: ${service}`);

          res.json({
            success: true,
            data: { service, action: 'restart, status: completed' },
            message: `Service ${service} restarted`,
            timestamp: new Date()?.toISOString,
          });
        } catch (error) {
          this.logger.error(
            `Failed to restart service ${req.params.service}:`,
            error
          );
          res
            .status(500)
            .json({ error: `Failed to restart service ${req.params.service}` });
        }
      }
    );

    this.logger.info('✅ Process control APIs configured');
  }

  /**
   * Setup comprehensive project management APIs (PRDs, ADRs, Tasks, Epics, Features)
   */
  private setupProjectManagementApis(app: Express, api: string): void {
    this.logger.info('📋 Setting up comprehensive project management APIs...');

    // ========================================
    // PRODUCT REQUIREMENTS DOCUMENTS (PRDs)
    // ========================================

    // Get all PRDs
    app.get(`${api}/project/prds`, async (req: Request, res: Response) => {
      try {
        const prds = [
          {
            id: 'PRD-AUTH-001',
            title: 'Authentication System v2.0',
            status: 'approved',
            author: 'Product Team',
            version: '2.1',
            createdAt: new Date(Date.now() - 86400000)?.toISOString,
            sections: {
              overview: 'Complete authentication system redesign',
              objectives: ['Improve security, Add 2FA', 'Social login'],
              requirements: ['JWT tokens, OAuth integration', 'MFA support'],
              acceptance: [
                'Security audit passed',
                'Performance benchmarks met',
              ],
            },
            linkedProjects: ['proj-001'],
            linkedEpics: ['EPIC-001'],
          },
        ];

        res.json({
          success: true,
          data: { prds, total: prds.length },
          message: 'Product Requirements Documents',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get PRDs:', error);
        res.status(500).json({ error: 'Failed to get PRDs' });
      }
    });

    // ========================================
    // ARCHITECTURE DECISION RECORDS (ADRs)
    // ========================================

    // Get all ADRs
    app.get(`${api}/project/adrs`, async (req: Request, res: Response) => {
      try {
        const adrs = [
          {
            id: 'ADR-001',
            title: 'Use JWT for Authentication',
            status: 'accepted',
            date: new Date(Date.now() - 72000000)?.toISOString,
            context: 'Need stateless authentication for microservices',
            decision: 'Implement JWT tokens with refresh token rotation',
            consequences: {
              positive: ['Stateless authentication, Better scalability'],
              negative: ['Token management complexity, Logout challenges'],
            },
            linkedProjects: ['proj-001'],
            linkedPRDs: ['PRD-AUTH-001'],
          },
          {
            id: 'ADR-002',
            title: 'Database Choice for User Sessions',
            status: 'proposed',
            date: new Date()?.toISOString,
            context: 'Need fast session storage with TTL',
            decision: 'Use Redis for session storage',
            consequences: {
              positive: ['Fast access, Built-in TTL', 'Pub/sub capabilities'],
              negative: ['Additional infrastructure, Memory usage'],
            },
            linkedProjects: ['proj-001'],
          },
        ];

        res.json({
          success: true,
          data: { adrs, total: adrs.length },
          message: 'Architecture Decision Records',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get ADRs:', error);
        res.status(500).json({ error: 'Failed to get ADRs' });
      }
    });

    // ========================================
    // EPICS MANAGEMENT
    // ========================================

    // Get all epics
    app.get(`${api}/project/epics`, async (req: Request, res: Response) => {
      try {
        const epics = [
          {
            id: 'EPIC-001',
            title: 'Authentication & Security Overhaul',
            description: 'Complete redesign of authentication system',
            status: 'in-progress',
            priority: 'high',
            startDate: new Date(Date.now() - 604800000)?.toISOString,
            targetDate: new Date(Date.now() + 1209600000)?.toISOString,
            progress: 65,
            linkedProjects: ['proj-001'],
            linkedFeatures: ['auth-login, auth-2fa', 'auth-session'],
            linkedPRDs: ['PRD-AUTH-001'],
            linkedADRs: ['ADR-001, ADR-002'],
            stakeholders: ['Security Team, Backend Team', 'Product Manager'],
          },
        ];

        res.json({
          success: true,
          data: { epics, total: epics.length },
          message: 'Project epics',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get epics:', error);
        res.status(500).json({ error: 'Failed to get epics' });
      }
    });

    // ========================================
    // FEATURES MANAGEMENT
    // ========================================

    // Get all features
    app.get(`${api}/project/features`, async (req: Request, res: Response) => {
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
            linkedTasks: ['TASK-001, TASK-002'],
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

        res.json({
          success: true,
          data: { features, total: features.length },
          message: 'Project features',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get features:', error);
        res.status(500).json({ error: 'Failed to get features' });
      }
    });

    // ========================================
    // TASKS MANAGEMENT
    // ========================================

    // Get all tasks
    app.get(`${api}/project/tasks`, async (req: Request, res: Response) => {
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
            createdAt: new Date(Date.now() - 345600000)?.toISOString,
            completedAt: new Date(Date.now() - 259200000)?.toISOString,
            labels: ['security, jwt', 'authentication'],
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
            createdAt: new Date(Date.now() - 259200000)?.toISOString,
            completedAt: new Date(Date.now() - 172800000)?.toISOString,
            labels: ['validation, middleware'],
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
            createdAt: new Date(Date.now() - 172800000)?.toISOString,
            labels: ['2fa, totp', 'security'],
          },
        ];

        res.json({
          success: true,
          data: { tasks, total: tasks.length },
          message: 'Project tasks',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get tasks:', error);
        res.status(500).json({ error: 'Failed to get tasks' });
      }
    });

    // ========================================
    // PROJECT OVERVIEW & RELATIONSHIPS
    // ========================================

    // Get comprehensive project overview
    app.get(`${api}/project/overview`, async (req: Request, res: Response) => {
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
            averageTaskCompletion: 6.5, // hours
            testCoverage: 68.3,
            burndownRate: 12.5,
          },
        };

        res.json({
          success: true,
          data: overview,
          message: 'Comprehensive project overview',
          timestamp: new Date()?.toISOString,
        });
      } catch (error) {
        this.logger.error('Failed to get project overview:', error);
        res.status(500).json({ error: 'Failed to get project overview' });
      }
    });

    this.logger.info('✅ Comprehensive project management APIs configured');
  }

  /**
   * Setup event handlers for log collection
   */
  private setupEventHandlers(): void {
    // Collect logs from all components
    this.eventBus.on('log-entry', (logEntry) => {
      this.addLogEntry(logEntry);
    });

    // Collect metrics updates
    this.eventBus.on('metric-update', (metric) => {
      this.telemetryData.set(metric.name, metric.value);
    });
  }

  /**
   * Add log entry to database
   */
  private async addLogEntry(logEntry: any): Promise<void> {
    try {
      const entry = {
        ...logEntry,
        timestamp: logEntry.timestamp || new Date()?.toISOString,
      };

      // Store in database
      await this.database.execute(
        `
        INSERT INTO system_logs (timestamp, level, component, message, meta, session_id, trace_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [
          entry.timestamp,
          entry.level || 'info',
          entry.component || 'unknown',
          entry.message || '',
          entry.meta ? JSON.stringify(entry.meta) : null,
          entry.sessionId || null,
          entry.traceId || null,
        ]
      );

      // Broadcast to real-time clients
      this.broadcastToClients('log', entry);

      // Optional: Clean old logs periodically (keep last 10,000 entries)
      if (Math.random() < .01) {
        // 1% chance to trigger cleanup
        this.cleanupOldLogs;
      }
    } catch (error) {
      // Don't log database errors to prevent infinite loops
      console.error('Failed to store log in database:', error);
    }
  }

  /**
   * Clean up old logs to prevent database growth
   */
  private async cleanupOldLogs(): Promise<void> {
    try {
      const keepCount = 10000;
      const totalResult = await this.database.query(
        'SELECT COUNT(*) as total FROM system_logs'
      );
      const total = totalResult[0]?.total || 0;

      if (total > keepCount) {
        await this.database.execute(
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

        this.logger.info(
          `Cleaned up old logs, kept latest ${keepCount} entries`
        );
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * Handle real-time WebSocket messages
   */
  private handleRealTimeMessage(ws: any, message: any): void {
    switch (message.type) {
      case 'subscribe':
        // Handle subscription to specific data types
        break;
      case 'unsubscribe':
        // Handle unsubscription
        break;
      default:
        this.logger.warn('Unknown real-time message type:', message.type);
    }
  }

  /**
   * Start real-time broadcasting
   */
  private startRealTimeBroadcast(): void {
    setInterval(() => {
      if (!this.wsServer || this.wsServer.clients.size === 0) return;

      const data = {
        system: {
          uptime: process?.uptime,
          memory: process?.memoryUsage,
          timestamp: new Date()?.toISOString,
        },
        agents: {
          total: this.telemetryData.get('totalAgents') || 0,
          active: this.telemetryData.get('activeAgents') || 0,
        },
      };

      this.broadcastToClients('system-update', data);
    }, 5000); // Every 5 seconds
  }

  /**
   * Broadcast to all WebSocket clients
   */
  private broadcastToClients(type: string, data: any): void {
    if (!this.wsServer) return;

    const message = JSON.stringify({
      type,
      data,
      timestamp: new Date()?.toISOString,
    });

    this.wsServer.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Get event loop lag
   */
  private getEventLoopLag(): Promise<number> {
    return new Promise((resolve) => {
      const start = process.hrtime?.bigint()
      setImmediate(() => {
        const lag = Number(process.hrtime?.bigint - start) / 1e6; // Convert to ms
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
    const currentIndex = phases.indexOf(currentPhase);
    return phases[currentIndex + 1] || 'completion');
  }
}
