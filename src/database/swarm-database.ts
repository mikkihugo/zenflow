/**
 * Swarm Database - Production-ready database layer for swarm operations
 * Handles agent state, task persistence, metrics, and coordination data
 */

import { EventEmitter } from 'node:events';
import { Pool, type PoolClient, type PoolConfig } from 'pg';

// Types for swarm database operations
interface SwarmAgent {
  id: string;
  swarm_id: string;
  role: string;
  capabilities: string[];
  cognitive_pattern: string;
  status: 'active' | 'idle' | 'busy' | 'error' | 'maintenance';
  current_load: number;
  max_load: number;
  performance_score: number;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

interface SwarmTask {
  id: string;
  swarm_id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'queued' | 'assigned' | 'executing' | 'completed' | 'failed';
  requirements: {
    capabilities: string[];
    min_agents: number;
    max_agents: number;
    timeout?: number;
  };
  assigned_agents: string[];
  progress: number;
  result?: any;
  error_message?: string;
  dependencies: string[];
  created_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

interface SwarmMetrics {
  id: string;
  swarm_id: string;
  agent_id?: string;
  metric_name: string;
  metric_value: number;
  metadata: Record<string, any>;
  recorded_at: Date;
}

interface SwarmSession {
  id: string;
  swarm_id: string;
  session_data: Record<string, any>;
  created_at: Date;
  updated_at: Date;
  expires_at?: Date;
}

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  maxConnections: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

export class SwarmDatabase extends EventEmitter {
  private pool: Pool;
  private config: DatabaseConfig;
  private isInitialized = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor(config: Partial<DatabaseConfig> = {}) {
    super();

    this.config = {
      host: config.host || process.env.SWARM_DB_HOST || 'localhost',
      port: config.port || parseInt(process.env.SWARM_DB_PORT || '5432'),
      database: config.database || process.env.SWARM_DB_NAME || 'swarm_db',
      user: config.user || process.env.SWARM_DB_USER || 'swarm_user',
      password: config.password || process.env.SWARM_DB_PASSWORD || 'swarm_password',
      ssl: config.ssl || process.env.SWARM_DB_SSL === 'true',
      maxConnections: config.maxConnections || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      connectionTimeoutMillis: config.connectionTimeoutMillis || 5000,
    };

    const poolConfig: PoolConfig = {
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password,
      ssl: this.config.ssl,
      max: this.config.maxConnections,
      idleTimeoutMillis: this.config.idleTimeoutMillis,
      connectionTimeoutMillis: this.config.connectionTimeoutMillis,
    };

    this.pool = new Pool(poolConfig);

    // Set up pool event listeners
    this.pool.on('connect', (_client) => {
      this.emit('clientConnected');
    });

    this.pool.on('error', (err, _client) => {
      console.error('💥 Database pool error:', err);
      this.emit('poolError', err);
    });

    this.pool.on('acquire', (_client) => {
      this.emit('clientAcquired');
    });

    this.pool.on('release', (_client) => {
      this.emit('clientReleased');
    });
  }

  /**
   * Initialize the database with schema creation
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('SwarmDatabase already initialized');
    }

    try {
      // Test connection
      await this.testConnection();

      // Create schema
      await this.createSchema();

      // Create indexes
      await this.createIndexes();

      // Start health checks
      this.startHealthChecks();

      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('❌ Failed to initialize SwarmDatabase:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const client = await this.pool.connect();
      const _result = await client.query('SELECT NOW() as connected_at');
      client.release();

      return true;
    } catch (error) {
      console.error('❌ Database connection test failed:', error);
      throw error;
    }
  }

  /**
   * Agent CRUD operations
   */
  async createAgent(agent: Omit<SwarmAgent, 'created_at' | 'updated_at'>): Promise<SwarmAgent> {
    const query = `
      INSERT INTO swarm_agents (
        id, swarm_id, role, capabilities, cognitive_pattern, 
        status, current_load, max_load, performance_score, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      agent.id,
      agent.swarm_id,
      agent.role,
      JSON.stringify(agent.capabilities),
      agent.cognitive_pattern,
      agent.status,
      agent.current_load,
      agent.max_load,
      agent.performance_score,
      JSON.stringify(agent.metadata),
    ];

    try {
      const result = await this.pool.query(query, values);
      const created = this.deserializeAgent(result.rows[0]);

      this.emit('agentCreated', { agentId: created.id });
      return created;
    } catch (error) {
      console.error('❌ Failed to create agent:', error);
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<SwarmAgent | null> {
    const query = 'SELECT * FROM swarm_agents WHERE id = $1';

    try {
      const result = await this.pool.query(query, [agentId]);
      return result.rows.length > 0 ? this.deserializeAgent(result.rows[0]) : null;
    } catch (error) {
      console.error('❌ Failed to get agent:', error);
      throw error;
    }
  }

  async updateAgent(agentId: string, updates: Partial<SwarmAgent>): Promise<SwarmAgent | null> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'id' || key === 'created_at') continue;

      if (key === 'capabilities' || key === 'metadata') {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(JSON.stringify(value));
      } else {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }

    if (setClause.length === 0) {
      return await this.getAgent(agentId);
    }

    setClause.push(`updated_at = NOW()`);
    values.push(agentId);

    const query = `
      UPDATE swarm_agents 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, values);
      const updated = result.rows.length > 0 ? this.deserializeAgent(result.rows[0]) : null;

      if (updated) {
        this.emit('agentUpdated', { agentId: updated.id });
      }

      return updated;
    } catch (error) {
      console.error('❌ Failed to update agent:', error);
      throw error;
    }
  }

  async deleteAgent(agentId: string): Promise<boolean> {
    const query = 'DELETE FROM swarm_agents WHERE id = $1';

    try {
      const result = await this.pool.query(query, [agentId]);
      const deleted = result.rowCount > 0;

      if (deleted) {
        this.emit('agentDeleted', { agentId });
      }

      return deleted;
    } catch (error) {
      console.error('❌ Failed to delete agent:', error);
      throw error;
    }
  }

  async getSwarmAgents(swarmId: string): Promise<SwarmAgent[]> {
    const query = 'SELECT * FROM swarm_agents WHERE swarm_id = $1 ORDER BY created_at';

    try {
      const result = await this.pool.query(query, [swarmId]);
      return result.rows.map((row) => this.deserializeAgent(row));
    } catch (error) {
      console.error('❌ Failed to get swarm agents:', error);
      throw error;
    }
  }

  /**
   * Task CRUD operations
   */
  async createTask(
    task: Omit<SwarmTask, 'created_at' | 'started_at' | 'completed_at'>
  ): Promise<SwarmTask> {
    const query = `
      INSERT INTO swarm_tasks (
        id, swarm_id, description, priority, status, requirements,
        assigned_agents, progress, result, error_message, dependencies
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      task.id,
      task.swarm_id,
      task.description,
      task.priority,
      task.status,
      JSON.stringify(task.requirements),
      JSON.stringify(task.assigned_agents),
      task.progress,
      JSON.stringify(task.result),
      task.error_message,
      JSON.stringify(task.dependencies),
    ];

    try {
      const result = await this.pool.query(query, values);
      const created = this.deserializeTask(result.rows[0]);

      this.emit('taskCreated', { taskId: created.id });
      return created;
    } catch (error) {
      console.error('❌ Failed to create task:', error);
      throw error;
    }
  }

  async getTask(taskId: string): Promise<SwarmTask | null> {
    const query = 'SELECT * FROM swarm_tasks WHERE id = $1';

    try {
      const result = await this.pool.query(query, [taskId]);
      return result.rows.length > 0 ? this.deserializeTask(result.rows[0]) : null;
    } catch (error) {
      console.error('❌ Failed to get task:', error);
      throw error;
    }
  }

  async updateTask(taskId: string, updates: Partial<SwarmTask>): Promise<SwarmTask | null> {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key === 'id' || key === 'created_at') continue;

      if (['requirements', 'assigned_agents', 'result', 'dependencies'].includes(key)) {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(JSON.stringify(value));
      } else {
        setClause.push(`${key} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }

    if (setClause.length === 0) {
      return await this.getTask(taskId);
    }

    values.push(taskId);

    const query = `
      UPDATE swarm_tasks 
      SET ${setClause.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    try {
      const result = await this.pool.query(query, values);
      const updated = result.rows.length > 0 ? this.deserializeTask(result.rows[0]) : null;

      if (updated) {
        this.emit('taskUpdated', { taskId: updated.id });
      }

      return updated;
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      throw error;
    }
  }

  async getSwarmTasks(swarmId: string, status?: string): Promise<SwarmTask[]> {
    let query = 'SELECT * FROM swarm_tasks WHERE swarm_id = $1';
    const values = [swarmId];

    if (status) {
      query += ' AND status = $2';
      values.push(status);
    }

    query += ' ORDER BY created_at DESC';

    try {
      const result = await this.pool.query(query, values);
      return result.rows.map((row) => this.deserializeTask(row));
    } catch (error) {
      console.error('❌ Failed to get swarm tasks:', error);
      throw error;
    }
  }

  /**
   * Metrics operations
   */
  async recordMetric(metric: Omit<SwarmMetrics, 'id' | 'recorded_at'>): Promise<SwarmMetrics> {
    const query = `
      INSERT INTO swarm_metrics (swarm_id, agent_id, metric_name, metric_value, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      metric.swarm_id,
      metric.agent_id,
      metric.metric_name,
      metric.metric_value,
      JSON.stringify(metric.metadata),
    ];

    try {
      const result = await this.pool.query(query, values);
      return this.deserializeMetric(result.rows[0]);
    } catch (error) {
      console.error('❌ Failed to record metric:', error);
      throw error;
    }
  }

  async getMetrics(
    swarmId: string,
    metricName?: string,
    agentId?: string
  ): Promise<SwarmMetrics[]> {
    let query = 'SELECT * FROM swarm_metrics WHERE swarm_id = $1';
    const values = [swarmId];
    let paramIndex = 2;

    if (metricName) {
      query += ` AND metric_name = $${paramIndex}`;
      values.push(metricName);
      paramIndex++;
    }

    if (agentId) {
      query += ` AND agent_id = $${paramIndex}`;
      values.push(agentId);
      paramIndex++;
    }

    query += ' ORDER BY recorded_at DESC LIMIT 1000';

    try {
      const result = await this.pool.query(query, values);
      return result.rows.map((row) => this.deserializeMetric(row));
    } catch (error) {
      console.error('❌ Failed to get metrics:', error);
      throw error;
    }
  }

  /**
   * Transaction management
   */
  async withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Health and monitoring
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      totalConnections: number;
      idleConnections: number;
      waitingClients: number;
      lastError?: string;
    };
  }> {
    try {
      const pool = this.pool as any; // Access private properties

      const status = {
        status: 'healthy' as const,
        details: {
          totalConnections: pool.totalCount || 0,
          idleConnections: pool.idleCount || 0,
          waitingClients: pool.waitingCount || 0,
        },
      };

      // Test with a simple query
      await this.pool.query('SELECT 1');

      return status;
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          totalConnections: 0,
          idleConnections: 0,
          waitingClients: 0,
          lastError: error instanceof Error ? error.message : String(error),
        },
      };
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    try {
      await this.pool.end();
      this.isInitialized = false;
      this.emit('shutdown');
    } catch (error) {
      console.error('❌ Error during database shutdown:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async createSchema(): Promise<void> {
    const schemas = [
      // Agents table
      `CREATE TABLE IF NOT EXISTS swarm_agents (
        id VARCHAR(255) PRIMARY KEY,
        swarm_id VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        capabilities JSONB NOT NULL DEFAULT '[]',
        cognitive_pattern VARCHAR(50) NOT NULL DEFAULT 'adaptive',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        current_load INTEGER NOT NULL DEFAULT 0,
        max_load INTEGER NOT NULL DEFAULT 10,
        performance_score DECIMAL(5,3) NOT NULL DEFAULT 1.0,
        metadata JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )`,

      // Tasks table
      `CREATE TABLE IF NOT EXISTS swarm_tasks (
        id VARCHAR(255) PRIMARY KEY,
        swarm_id VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        priority VARCHAR(20) NOT NULL DEFAULT 'medium',
        status VARCHAR(20) NOT NULL DEFAULT 'queued',
        requirements JSONB NOT NULL DEFAULT '{}',
        assigned_agents JSONB NOT NULL DEFAULT '[]',
        progress INTEGER NOT NULL DEFAULT 0,
        result JSONB,
        error_message TEXT,
        dependencies JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE
      )`,

      // Metrics table
      `CREATE TABLE IF NOT EXISTS swarm_metrics (
        id SERIAL PRIMARY KEY,
        swarm_id VARCHAR(255) NOT NULL,
        agent_id VARCHAR(255),
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(15,6) NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}',
        recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )`,

      // Sessions table
      `CREATE TABLE IF NOT EXISTS swarm_sessions (
        id VARCHAR(255) PRIMARY KEY,
        swarm_id VARCHAR(255) NOT NULL,
        session_data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE
      )`,
    ];

    for (const schema of schemas) {
      await this.pool.query(schema);
    }
  }

  private async createIndexes(): Promise<void> {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_swarm_agents_swarm_id ON swarm_agents(swarm_id)',
      'CREATE INDEX IF NOT EXISTS idx_swarm_agents_status ON swarm_agents(status)',
      'CREATE INDEX IF NOT EXISTS idx_swarm_tasks_swarm_id ON swarm_tasks(swarm_id)',
      'CREATE INDEX IF NOT EXISTS idx_swarm_tasks_status ON swarm_tasks(status)',
      'CREATE INDEX IF NOT EXISTS idx_swarm_tasks_priority ON swarm_tasks(priority)',
      'CREATE INDEX IF NOT EXISTS idx_swarm_metrics_swarm_id ON swarm_metrics(swarm_id)',
      'CREATE INDEX IF NOT EXISTS idx_swarm_metrics_agent_id ON swarm_metrics(agent_id)',
      'CREATE INDEX IF NOT EXISTS idx_swarm_metrics_name ON swarm_metrics(metric_name)',
      'CREATE INDEX IF NOT EXISTS idx_swarm_sessions_swarm_id ON swarm_sessions(swarm_id)',
    ];

    for (const index of indexes) {
      await this.pool.query(index);
    }
  }

  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getHealthStatus();
        this.emit('healthCheck', health);

        if (health.status !== 'healthy') {
          console.warn('⚠️ Database health check warning:', health.details);
        }
      } catch (error) {
        console.error('❌ Health check failed:', error);
        this.emit('healthCheckFailed', error);
      }
    }, 30000); // Every 30 seconds
  }

  private deserializeAgent(row: any): SwarmAgent {
    return {
      ...row,
      capabilities: JSON.parse(row.capabilities || '[]'),
      metadata: JSON.parse(row.metadata || '{}'),
    };
  }

  private deserializeTask(row: any): SwarmTask {
    return {
      ...row,
      requirements: JSON.parse(row.requirements || '{}'),
      assigned_agents: JSON.parse(row.assigned_agents || '[]'),
      result: row.result ? JSON.parse(row.result) : undefined,
      dependencies: JSON.parse(row.dependencies || '[]'),
    };
  }

  private deserializeMetric(row: any): SwarmMetrics {
    return {
      ...row,
      metadata: JSON.parse(row.metadata || '{}'),
    };
  }
}

// Export default instance
export const swarmDatabase = new SwarmDatabase();
export default SwarmDatabase;
