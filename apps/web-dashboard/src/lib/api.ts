/* eslint-env browser */
/**
 * API client for claude-code-zen backend
 * Connects to real API endpoints instead of using mock data
 */

// Simple browser logger for web dashboard
const logger = {
  info: (msg: string, ...args: unknown[]) =>
    console.info(`[api-client] ${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) =>
    console.warn(`[api-client] ${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) =>
    console.error(`[api-client] ${msg}`, ...args),
};
const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string
}

interface Agent {
  id: string;
  type: string;
  status: string;
  capabilities: string[];
  created: string;
  lastActivity: string;
}

interface Task {
  id: string;
  title: string;
  type: string;
  status: string;
  progress: number;
  priority: string;
  created: string;
  assignedTo?: string;
}

interface SwarmConfig {
  topology: string;
  maxAgents: number;
  strategy: string;
  created: string;
}

interface HealthStatus {
  status: string;
  uptime: number;
  version: string;
  timestamp: string;
  services: Record<string, string>;
  metrics: {
    totalMemoryUsage: number;
    availableMemory: number;
    utilizationRate: number;
  };
}

interface PerformanceMetrics {
  cpu: number;
  memory: number;
  requestsPerMin: number;
  avgResponse: number;
  timestamp: string
}

interface Project {
  id: number;
  name: string;
  status: string;
  progress: number;
  currentPhase: string;
  description: string;
  created?: string;
  lastActivity?: string;
}

class ApiClient {
  private baseUrl: string;
  public currentProjectId: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Set current project context for all API calls
  setProjectContext(projectId: string | null) {
    this.currentProjectId = projectId;
    logger.info('API client project context updated', { projectId });
  }

  private async request<T>(
    endpoint: string,
    options: Record<string, unknown> = {}
  ): Promise<T> {
    // Add project context as query parameter if available
    let url = `${this.baseUrl}${endpoint}`;
    if (this.currentProjectId) {
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}projectId=${encodeURIComponent(this.currentProjectId)}`;
    }

    const defaultOptions: Record<string, unknown> = {
      headers: {
        'Content-Type': 'application/json',
        // Also add project context as header for server preference
        ...(this.currentProjectId && {
          'X-Project-Context': this.currentProjectId,
        }),
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}:${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('API request failed', { endpoint, error });
      throw error;
    }
  }

  // ===== COORDINATION API =====

  async getAgents(): Promise<Agent[]> {
    const response = await this.request<{ agents: Agent[]; total: number }>(
      '/v1/coordination/agents'
    );
    return response.agents || [];
  }

  async createAgent(agentData: Partial<Agent>): Promise<Agent> {
    return await this.request<Agent>('/v1/coordination/agents', {
      method: 'POST',
      body: JSON.stringify(agentData),
    });
  }

  async getAgent(agentId: string): Promise<Agent> {
    return await this.request<Agent>(`/v1/coordination/agents/${agentId}`);
  }

  async removeAgent(agentId: string): Promise<void> {
    await this.request<void>(`/v1/coordination/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  getTasks(): Promise<Task[]> {
    // Note:Based on the API, we need to get tasks through other endpoints or implement a tasks list endpoint
    // For now, return empty array and implement when backend supports it
    return Promise.resolve([]);
  }

  async createTask(taskData: Partial<Task>): Promise<Task> {
    return await this.request<Task>('/v1/coordination/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getTask(taskId: string): Promise<Task> {
    return await this.request<Task>(`/v1/coordination/tasks/${taskId}`);
  }

  async getSwarmConfig(): Promise<SwarmConfig> {
    return await this.request<SwarmConfig>('/v1/coordination/swarm/config');
  }

  async updateSwarmConfig(config: Partial<SwarmConfig>): Promise<SwarmConfig> {
    return await this.request<SwarmConfig>('/v1/coordination/swarm/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async initializeSwarm(config: {
    topology: string;
    maxAgents: number;
    strategy?: string;
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/coordination/swarm/initialize', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async getHealth(): Promise<HealthStatus> {
    return await this.request<HealthStatus>('/v1/coordination/health');
  }

  async getMetrics(timeRange?: string): Promise<PerformanceMetrics> {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return await this.request<PerformanceMetrics>(
      `/v1/coordination/metrics${params}`
    );
  }

  // ===== MEMORY API =====

  async getMemoryHealth(): Promise<Record<string, unknown>> {
    return await this.request('/v1/memory/health');
  }

  async getMemoryStores(): Promise<Array<Record<string, unknown>>> {
    const response = await this.request<{
      stores: Record<string, unknown>[];
      total: number;
    }>('/v1/memory/stores');
    return response.stores || [];
  }

  async getMemoryStats(storeId: string): Promise<Record<string, unknown>> {
    return await this.request(`/v1/memory/stores/${storeId}/stats`);
  }

  // ===== DATABASE API =====

  async getDatabaseHealth(): Promise<Record<string, unknown>> {
    return await this.request('/v1/database/health');
  }

  async getDatabaseStatus(): Promise<Record<string, unknown>> {
    return await this.request('/v1/database/status');
  }

  async getDatabaseAnalytics(): Promise<Record<string, unknown>> {
    return await this.request('/v1/database/analytics');
  }

  async getDatabaseSchema(): Promise<Record<string, unknown>> {
    return await this.request('/v1/database/schema');
  }

  async executeQuery(queryData: {
    sql: string;
    params?: Record<string, unknown>[];
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/database/query', {
      method: 'POST',
      body: JSON.stringify(queryData),
    });
  }

  async executeCommand(commandData: {
    sql: string;
    params?: Record<string, unknown>[];
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/database/execute', {
      method: 'POST',
      body: JSON.stringify(commandData),
    });
  }

  async executeTransaction(transactionData: {
    operations: Array<{
      type: 'query|execute';
      sql: string;
      params?: Record<string, unknown>[];
    }>;
    useTransaction?: boolean;
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/database/transaction', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  async executeMigration(migrationData: {
    statements: string[];
    version: string;
    description?: string;
    dryRun?: boolean;
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/database/migrate', {
      method: 'POST',
      body: JSON.stringify(migrationData),
    });
  }

  // ===== ADVANCED MEMORY API =====

  async getMemoryKeys(
    storeId: string,
    pattern?: string,
    limit = 100
  ): Promise<Record<string, unknown>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (pattern) params.append('pattern', pattern);
    return await this.request(`/v1/memory/stores/${storeId}/keys?${params}`);
  }

  async getMemoryValue(
    storeId: string,
    key: string
  ): Promise<Record<string, unknown>> {
    return await this.request(
      `/v1/memory/stores/${storeId}/keys/${encodeURIComponent(key)}`
    );
  }

  async setMemoryValue(
    storeId: string,
    key: string,
    value: Record<string, unknown>,
    ttl?: number
  ): Promise<Record<string, unknown>> {
    return await this.request(
      `/v1/memory/stores/${storeId}/keys/${encodeURIComponent(key)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ value, ttl }),
      }
    );
  }

  async deleteMemoryKey(storeId: string, key: string): Promise<void> {
    await this.request(
      `/v1/memory/stores/${storeId}/keys/${encodeURIComponent(key)}`,
      {
        method: 'DELETE',
      }
    );
  }

  async batchGetMemoryValues(
    storeId: string,
    keys: string[]
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/memory/stores/${storeId}/batch/get`, {
      method: 'POST',
      body: JSON.stringify({ keys }),
    });
  }

  async batchSetMemoryValues(
    storeId: string,
    items: Array<{ key: string; value: Record<string, unknown>; ttl?: number }>
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/memory/stores/${storeId}/batch/set`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async syncMemoryStore(
    storeId: string,
    type = 'full'
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/memory/stores/${storeId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  async createMemoryStore(storeData: {
    type: string;
    config?: Record<string, unknown>;
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/memory/stores', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  // ===== ADVANCED COORDINATION API =====

  async getAgentTasks(
    agentId: string,
    status?: string
  ): Promise<Record<string, unknown>> {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return await this.request(
      `/v1/coordination/agents/${agentId}/tasks${params}`
    );
  }

  async assignTask(
    taskId: string,
    agentId: string
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/coordination/tasks/${taskId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    });
  }

  async updateAgentHeartbeat(
    agentId: string,
    heartbeatData: { workload?: Record<string, unknown>; status?: string }
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/coordination/agents/${agentId}/heartbeat`, {
      method: 'POST',
      body: JSON.stringify(heartbeatData),
    });
  }

  // ===== SWARM API (Enhanced) =====

  async initializeAdvancedSwarm(config: {
    topology: string;
    maxAgents: number;
    strategy?: string;
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/swarm/init', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async spawnSwarmAgent(
    swarmId: string,
    config: {
      type: string;
      name: string;
      capabilities?: string[];
    }
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/swarm/${swarmId}/agents`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async orchestrateSwarmTask(taskConfig: {
    task: string;
    strategy?: string;
    priority?: string;
    maxAgents?: number;
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/swarm/tasks', {
      method: 'POST',
      body: JSON.stringify(taskConfig),
    });
  }

  async getSwarmStatus(swarmId?: string): Promise<Record<string, unknown>> {
    const endpoint = swarmId
      ? `/v1/swarm/${swarmId}/status`
      : '/v1/swarm/status';
    return await this.request(endpoint);
  }

  async getSwarmTasks(taskId?: string): Promise<Record<string, unknown>> {
    const endpoint = taskId ? `/v1/swarm/tasks/${taskId}` : '/v1/swarm/tasks';
    return await this.request(endpoint);
  }

  async getSwarmStats(): Promise<Record<string, unknown>> {
    return await this.request('/v1/swarm/stats');
  }

  async shutdownSwarm(): Promise<Record<string, unknown>> {
    return await this.request('/v1/swarm/shutdown', {
      method: 'POST',
    });
  }

  // ===== PROJECT MANAGEMENT (Enhanced) =====

  async getProjects(): Promise<Project[]> {
    const response = await this.request<{ projects: Project[]; total: number }>(
      '/v1/projects'
    );
    return response.projects || [];
  }

  async getCurrentProject(): Promise<Project> {
    return await this.request<Project>('/v1/projects/current');
  }

  async getProject(projectId: string): Promise<Project> {
    return await this.request<Project>(`/v1/projects/${projectId}`);
  }

  async switchProject(
    projectId: string,
    projectPath?: string
  ): Promise<Record<string, unknown>> {
    return await this.request('/v1/projects/switch', {
      method: 'POST',
      body: JSON.stringify({ projectId, projectPath }),
    });
  }

  async switchToProject(projectId: string): Promise<Record<string, unknown>> {
    return await this.request(`/v1/projects/${projectId}/switch`, {
      method: 'POST',
    });
  }

  async getProjectStatus(): Promise<Record<string, unknown>> {
    return await this.request('/v1/projects/status');
  }

  async cleanupProjectRegistry(): Promise<Record<string, unknown>> {
    return await this.request('/v1/projects/cleanup', {
      method: 'POST',
    });
  }

  async createProject(projectData: Partial<Project>): Promise<Project> {
    return await this.request<Project>('/v1/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  // ===== PROJECT MODE MANAGEMENT API =====

  async getProjectModes(projectId: string): Promise<Record<string, unknown>> {
    return await this.request(`/v1/projects/${projectId}/modes`);
  }

  async getModeCapabilities(mode: string): Promise<Record<string, unknown>> {
    return await this.request(`/v1/projects/modes/${mode}/capabilities`);
  }

  async upgradeProjectMode(
    projectId: string,
    upgradeData: {
      toMode: string;
      preserveData?: boolean;
      backupBeforeMigration?: boolean;
      validateAfterMigration?: boolean;
    }
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/projects/${projectId}/modes/upgrade`, {
      method: 'POST',
      body: JSON.stringify(upgradeData),
    });
  }

  async getProjectUpgradePaths(
    projectId: string
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/projects/${projectId}/modes/upgrade-paths`);
  }

  async getSchemaMigrationPath(
    fromVersion: string,
    toVersion: string
  ): Promise<Record<string, unknown>> {
    const params = new URLSearchParams({ fromVersion, toVersion });
    return await this.request(`/v1/projects/schema/migration-path?${params}`);
  }

  async getAllProjectModes(): Promise<Record<string, unknown>> {
    return await this.request('/v1/projects/modes');
  }

  // ========================================
  // SAFe 6.0 ESSENTIAL API (REPLACES LEGACY ROADMAP/MILESTONE METHODS)
  // ========================================

  // ===== SYSTEM CAPABILITY API =====

  async getSystemCapabilityStatus(): Promise<Record<string, unknown>> {
    return await this.request('/v1/system/capability/status');
  }

  async getSystemCapabilityFacades(): Promise<Record<string, unknown>> {
    return await this.request('/v1/system/capability/facades');
  }

  async getSystemCapabilitySuggestions(): Promise<Record<string, unknown>> {
    return await this.request('/v1/system/capability/suggestions');
  }

  async getSystemCapabilityDetailed(): Promise<Record<string, unknown>> {
    return await this.request('/v1/system/capability/detailed');
  }

  async getSystemCapabilityHealth(): Promise<Record<string, unknown>> {
    return await this.request('/v1/system/capability/health');
  }

  async getSystemCapabilityScores(): Promise<Record<string, unknown>> {
    return await this.request('/v1/system/capability/scores');
  }

  // ===== FACADE MONITORING API =====

  async getFacadeStatus(): Promise<Record<string, unknown>> {
    return await this.request('/v1/facades/status');
  }

  async getFacadeHealth(facadeName?: string): Promise<Record<string, unknown>> {
    const endpoint = facadeName
      ? `/v1/facades/${facadeName}/health`
      : '/v1/facades/health';
    return await this.request(endpoint);
  }

  async getFacadePackages(
    facadeName: string
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/facades/${facadeName}/packages`);
  }

  async getFacadeServices(
    facadeName: string
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/facades/${facadeName}/services`);
  }

  async refreshFacadeStatus(
    facadeName?: string
  ): Promise<Record<string, unknown>> {
    const endpoint = facadeName
      ? `/v1/facades/${facadeName}/refresh`
      : '/v1/facades/refresh';
    return await this.request(endpoint, { method: 'POST' });
  }

  async getPackageStatus(
    packageName: string
  ): Promise<Record<string, unknown>> {
    return await this.request(
      `/v1/facades/packages/${encodeURIComponent(packageName)}/status`
    );
  }

  async getServiceStatus(
    serviceName: string
  ): Promise<Record<string, unknown>> {
    return await this.request(
      `/v1/facades/services/${encodeURIComponent(serviceName)}/status`
    );
  }

  async getFacadeMetrics(): Promise<Record<string, unknown>> {
    return await this.request('/v1/facades/metrics');
  }

  async getFacadeHistory(
    facadeName: string,
    timeRange?: string
  ): Promise<Record<string, unknown>> {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return await this.request(`/v1/facades/${facadeName}/history${params}`);
  }

  async getSystemDependencies(): Promise<Record<string, unknown>> {
    return await this.request('/v1/facades/dependencies');
  }

  // ===== TASKMASTER SAFE WORKFLOW API =====

  async getTaskMasterMetrics(): Promise<Record<string, unknown>> {
    return await this.request('/v1/taskmaster/metrics');
  }

  async getTaskMasterHealth(): Promise<Record<string, unknown>> {
    return await this.request('/v1/taskmaster/health');
  }

  async getTaskMasterDashboard(): Promise<Record<string, unknown>> {
    return await this.request('/v1/taskmaster/dashboard');
  }

  async createSAFeTask(taskData: {
    title: string;
    description?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    estimatedEffort: number;
    assignedAgent?: string;
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/taskmaster/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async getTaskMasterTask(taskId: string): Promise<Record<string, unknown>> {
    return await this.request(`/v1/taskmaster/tasks/${taskId}`);
  }

  async moveSAFeTask(
    taskId: string,
    toState: string
  ): Promise<Record<string, unknown>> {
    return await this.request(`/v1/taskmaster/tasks/${taskId}/move`, {
      method: 'PUT',
      body: JSON.stringify({ toState }),
    });
  }

  async getTasksByState(state: string): Promise<Record<string, unknown>> {
    return await this.request(`/v1/taskmaster/tasks/state/${state}`);
  }

  async createPIPlanningEvent(eventData: {
    planningIntervalNumber: number;
    artId: string;
    startDate: string;
    endDate: string;
    facilitator: string;
  }): Promise<Record<string, unknown>> {
    return await this.request('/v1/taskmaster/pi-planning', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  // Convenience methods for SAFe workflow states
  async getAllSAFeTasks(): Promise<{
    backlog: Record<string, unknown>[];
    analysis: Record<string, unknown>[];
    development: Record<string, unknown>[];
    testing: Record<string, unknown>[];
    review: Record<string, unknown>[];
    deployment: Record<string, unknown>[];
    done: Record<string, unknown>[];
    blocked: Record<string, unknown>[];
  }> {
    const dashboard = await this.getTaskMasterDashboard();
    return dashboard.data.tasksByState;
  }

  async getSAFeFlowMetrics(): Promise<Record<string, unknown>> {
    const metrics = await this.getTaskMasterMetrics();
    return metrics.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type {
  Agent,
  Task,
  SwarmConfig,
  HealthStatus,
  PerformanceMetrics,
  Project,
  ApiResponse,
};
