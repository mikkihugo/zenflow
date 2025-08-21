/**
 * API client for claude-code-zen backend
 * Connects to real API endpoints instead of using mock data
 */

const API_BASE_URL = 'http://localhost:3000/api';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
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
  timestamp: string;
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
    console.log('🎯 API client project context updated:', projectId);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Add project context as query parameter if available
    let url = `${this.baseUrl}${endpoint}`;
    if (this.currentProjectId) {
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}projectId=${encodeURIComponent(this.currentProjectId)}`;
    }
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        // Also add project context as header for server preference
        ...(this.currentProjectId && { 'X-Project-Context': this.currentProjectId }),
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // ===== COORDINATION API =====

  async getAgents(): Promise<Agent[]> {
    const response = await this.request<{ agents: Agent[]; total: number }>('/v1/coordination/agents');
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

  async getTasks(): Promise<Task[]> {
    // Note: Based on the API, we need to get tasks through other endpoints or implement a tasks list endpoint
    // For now, return empty array and implement when backend supports it
    return [];
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

  async initializeSwarm(config: { topology: string; maxAgents: number; strategy?: string }): Promise<any> {
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
    return await this.request<PerformanceMetrics>(`/v1/coordination/metrics${params}`);
  }

  // ===== MEMORY API =====

  async getMemoryHealth(): Promise<any> {
    return await this.request('/v1/memory/health');
  }

  async getMemoryStores(): Promise<any[]> {
    const response = await this.request<{ stores: any[]; total: number }>('/v1/memory/stores');
    return response.stores || [];
  }

  async getMemoryStats(storeId: string): Promise<any> {
    return await this.request(`/v1/memory/stores/${storeId}/stats`);
  }

  // ===== DATABASE API =====

  async getDatabaseHealth(): Promise<any> {
    return await this.request('/v1/database/health');
  }

  async getDatabaseStatus(): Promise<any> {
    return await this.request('/v1/database/status');
  }

  async getDatabaseAnalytics(): Promise<any> {
    return await this.request('/v1/database/analytics');
  }

  async getDatabaseSchema(): Promise<any> {
    return await this.request('/v1/database/schema');
  }

  async executeQuery(queryData: { sql: string; params?: unknown[] }): Promise<any> {
    return await this.request('/v1/database/query', {
      method: 'POST',
      body: JSON.stringify(queryData),
    });
  }

  async executeCommand(commandData: { sql: string; params?: unknown[] }): Promise<any> {
    return await this.request('/v1/database/execute', {
      method: 'POST',
      body: JSON.stringify(commandData),
    });
  }

  async executeTransaction(transactionData: {
    operations: Array<{ type: 'query' | 'execute'; sql: string; params?: unknown[] }>;
    useTransaction?: boolean;
  }): Promise<any> {
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
  }): Promise<any> {
    return await this.request('/v1/database/migrate', {
      method: 'POST',
      body: JSON.stringify(migrationData),
    });
  }

  // ===== ADVANCED MEMORY API =====

  async getMemoryKeys(storeId: string, pattern?: string, limit = 100): Promise<any> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (pattern) params.append('pattern', pattern);
    return await this.request(`/v1/memory/stores/${storeId}/keys?${params}`);
  }

  async getMemoryValue(storeId: string, key: string): Promise<any> {
    return await this.request(`/v1/memory/stores/${storeId}/keys/${encodeURIComponent(key)}`);
  }

  async setMemoryValue(storeId: string, key: string, value: any, ttl?: number): Promise<any> {
    return await this.request(`/v1/memory/stores/${storeId}/keys/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value, ttl }),
    });
  }

  async deleteMemoryKey(storeId: string, key: string): Promise<void> {
    await this.request(`/v1/memory/stores/${storeId}/keys/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
  }

  async batchGetMemoryValues(storeId: string, keys: string[]): Promise<any> {
    return await this.request(`/v1/memory/stores/${storeId}/batch/get`, {
      method: 'POST',
      body: JSON.stringify({ keys }),
    });
  }

  async batchSetMemoryValues(storeId: string, items: Array<{ key: string; value: any; ttl?: number }>): Promise<any> {
    return await this.request(`/v1/memory/stores/${storeId}/batch/set`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async syncMemoryStore(storeId: string, type = 'full'): Promise<any> {
    return await this.request(`/v1/memory/stores/${storeId}/sync`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
  }

  async createMemoryStore(storeData: { type: string; config?: any }): Promise<any> {
    return await this.request('/v1/memory/stores', {
      method: 'POST',
      body: JSON.stringify(storeData),
    });
  }

  // ===== ADVANCED COORDINATION API =====

  async getAgentTasks(agentId: string, status?: string): Promise<any> {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return await this.request(`/v1/coordination/agents/${agentId}/tasks${params}`);
  }

  async assignTask(taskId: string, agentId: string): Promise<any> {
    return await this.request(`/v1/coordination/tasks/${taskId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ agentId }),
    });
  }

  async updateAgentHeartbeat(agentId: string, heartbeatData: { workload?: any; status?: string }): Promise<any> {
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
  }): Promise<any> {
    return await this.request('/v1/swarm/init', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async spawnSwarmAgent(swarmId: string, config: {
    type: string;
    name: string;
    capabilities?: string[];
  }): Promise<any> {
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
  }): Promise<any> {
    return await this.request('/v1/swarm/tasks', {
      method: 'POST',
      body: JSON.stringify(taskConfig),
    });
  }

  async getSwarmStatus(swarmId?: string): Promise<any> {
    const endpoint = swarmId ? `/v1/swarm/${swarmId}/status` : '/v1/swarm/status';
    return await this.request(endpoint);
  }

  async getSwarmTasks(taskId?: string): Promise<any> {
    const endpoint = taskId ? `/v1/swarm/tasks/${taskId}` : '/v1/swarm/tasks';
    return await this.request(endpoint);
  }

  async getSwarmStats(): Promise<any> {
    return await this.request('/v1/swarm/stats');
  }

  async shutdownSwarm(): Promise<any> {
    return await this.request('/v1/swarm/shutdown', {
      method: 'POST',
    });
  }

  // ===== PROJECT MANAGEMENT (Enhanced) =====

  async getProjects(): Promise<Project[]> {
    const response = await this.request<{ projects: Project[]; total: number }>('/v1/projects');
    return response.projects || [];
  }

  async getCurrentProject(): Promise<Project> {
    return await this.request<Project>('/v1/projects/current');
  }

  async getProject(projectId: string): Promise<Project> {
    return await this.request<Project>(`/v1/projects/${projectId}`);
  }

  async switchProject(projectId: string, projectPath?: string): Promise<any> {
    return await this.request('/v1/projects/switch', {
      method: 'POST',
      body: JSON.stringify({ projectId, projectPath }),
    });
  }

  async switchToProject(projectId: string): Promise<any> {
    return await this.request(`/v1/projects/${projectId}/switch`, {
      method: 'POST',
    });
  }

  async getProjectStatus(): Promise<any> {
    return await this.request('/v1/projects/status');
  }

  async cleanupProjectRegistry(): Promise<any> {
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

  async getProjectModes(projectId: string): Promise<any> {
    return await this.request(`/v1/projects/${projectId}/modes`);
  }

  async getModeCapabilities(mode: string): Promise<any> {
    return await this.request(`/v1/projects/modes/${mode}/capabilities`);
  }

  async upgradeProjectMode(projectId: string, upgradeData: {
    toMode: string;
    preserveData?: boolean;
    backupBeforeMigration?: boolean;
    validateAfterMigration?: boolean;
  }): Promise<any> {
    return await this.request(`/v1/projects/${projectId}/modes/upgrade`, {
      method: 'POST',
      body: JSON.stringify(upgradeData),
    });
  }

  async getProjectUpgradePaths(projectId: string): Promise<any> {
    return await this.request(`/v1/projects/${projectId}/modes/upgrade-paths`);
  }

  async getSchemaMigrationPath(fromVersion: string, toVersion: string): Promise<any> {
    const params = new URLSearchParams({ fromVersion, toVersion });
    return await this.request(`/v1/projects/schema/migration-path?${params}`);
  }

  async getAllProjectModes(): Promise<any> {
    return await this.request('/v1/projects/modes');
  }

  // ========================================
  // ROADMAP SERVICE METHODS (COMPREHENSIVE)
  // ========================================

  async getRoadmaps(status?: string, priority?: string): Promise<any> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    const queryString = params.toString();
    return await this.request(`/roadmap/roadmaps${queryString ? `?${queryString}` : ''}`);
  }

  async createRoadmap(roadmapData: {
    title: string;
    description: string;
    vision?: string;
    status?: string;
    priority?: string;
    owner?: string;
    startDate?: string;
    endDate?: string;
    strategicThemes?: string[];
    stakeholders?: string[];
    riskLevel?: string;
    budget?: string;
    dependencies?: string[];
    kpis?: string[];
  }): Promise<any> {
    return await this.request('/roadmap/roadmaps', {
      method: 'POST',
      body: JSON.stringify(roadmapData),
    });
  }

  async getRoadmap(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}`);
  }

  async updateRoadmap(roadmapId: string, roadmapData: any): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}`, {
      method: 'PUT',
      body: JSON.stringify(roadmapData),
    });
  }

  async deleteRoadmap(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}`, {
      method: 'DELETE',
    });
  }

  async getMilestones(roadmapId?: string, status?: string, type?: string): Promise<any> {
    const params = new URLSearchParams();
    if (roadmapId) params.append('roadmapId', roadmapId);
    if (status) params.append('status', status);
    if (type) params.append('type', type);
    const queryString = params.toString();
    return await this.request(`/roadmap/milestones${queryString ? `?${queryString}` : ''}`);
  }

  async createMilestone(milestoneData: {
    roadmapId: string;
    title: string;
    description: string;
    type?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    owner?: string;
    deliverables?: string[];
    dependencies?: string[];
    riskFactors?: string[];
    successCriteria?: string[];
  }): Promise<any> {
    return await this.request('/roadmap/milestones', {
      method: 'POST',
      body: JSON.stringify(milestoneData),
    });
  }

  async getMilestone(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}`);
  }

  async updateMilestone(milestoneId: string, milestoneData: any): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(milestoneData),
    });
  }

  async deleteMilestone(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}`, {
      method: 'DELETE',
    });
  }

  async getVisionStatements(status?: string, timeframe?: string): Promise<any> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (timeframe) params.append('timeframe', timeframe);
    const queryString = params.toString();
    return await this.request(`/roadmap/vision${queryString ? `?${queryString}` : ''}`);
  }

  async createVisionStatement(visionData: {
    title: string;
    description: string;
    status?: string;
    timeframe?: string;
    objectives?: string[];
    stakeholders?: string[];
  }): Promise<any> {
    return await this.request('/roadmap/vision', {
      method: 'POST',
      body: JSON.stringify(visionData),
    });
  }

  async getVisionStatement(visionId: string): Promise<any> {
    return await this.request(`/roadmap/vision/${visionId}`);
  }

  async updateVisionStatement(visionId: string, visionData: any): Promise<any> {
    return await this.request(`/roadmap/vision/${visionId}`, {
      method: 'PUT',
      body: JSON.stringify(visionData),
    });
  }

  async deleteVisionStatement(visionId: string): Promise<any> {
    return await this.request(`/roadmap/vision/${visionId}`, {
      method: 'DELETE',
    });
  }

  async getRoadmapMetrics(): Promise<any> {
    return await this.request('/roadmap/metrics');
  }

  async getRoadmapAnalytics(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/analytics`);
  }

  async getMilestoneAnalytics(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/analytics`);
  }

  async getRoadmapProgress(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/progress`);
  }

  async updateRoadmapProgress(roadmapId: string, progress: number): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({ progress }),
    });
  }

  async getRoadmapDependencies(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/dependencies`);
  }

  async addRoadmapDependency(roadmapId: string, dependencyId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/dependencies`, {
      method: 'POST',
      body: JSON.stringify({ dependencyId }),
    });
  }

  async removeRoadmapDependency(roadmapId: string, dependencyId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/dependencies/${dependencyId}`, {
      method: 'DELETE',
    });
  }

  async getRoadmapStakeholders(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/stakeholders`);
  }

  async addRoadmapStakeholder(roadmapId: string, stakeholder: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/stakeholders`, {
      method: 'POST',
      body: JSON.stringify({ stakeholder }),
    });
  }

  async removeRoadmapStakeholder(roadmapId: string, stakeholder: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/stakeholders/${encodeURIComponent(stakeholder)}`, {
      method: 'DELETE',
    });
  }

  async getRoadmapKPIs(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/kpis`);
  }

  async updateRoadmapKPIs(roadmapId: string, kpis: string[]): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/kpis`, {
      method: 'PUT',
      body: JSON.stringify({ kpis }),
    });
  }

  async getMilestoneDeliverables(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/deliverables`);
  }

  async updateMilestoneDeliverables(milestoneId: string, deliverables: string[]): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/deliverables`, {
      method: 'PUT',
      body: JSON.stringify({ deliverables }),
    });
  }

  async getMilestoneRisks(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/risks`);
  }

  async updateMilestoneRisks(milestoneId: string, riskFactors: string[]): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/risks`, {
      method: 'PUT',
      body: JSON.stringify({ riskFactors }),
    });
  }

  async getMilestoneSuccessCriteria(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/success-criteria`);
  }

  async updateMilestoneSuccessCriteria(milestoneId: string, successCriteria: string[]): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/success-criteria`, {
      method: 'PUT',
      body: JSON.stringify({ successCriteria }),
    });
  }

  async getRoadmapTimeline(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/timeline`);
  }

  async getStrategicAlignment(): Promise<any> {
    return await this.request('/roadmap/strategic-alignment');
  }

  async getRoadmapReports(type: 'summary' | 'detailed' | 'executive'): Promise<any> {
    return await this.request(`/roadmap/reports/${type}`);
  }

  async exportRoadmap(roadmapId: string, format: 'pdf' | 'excel' | 'json'): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/export?format=${format}`);
  }

  async importRoadmap(fileData: FormData): Promise<any> {
    return await this.request('/roadmap/import', {
      method: 'POST',
      body: fileData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getRoadmapTemplates(): Promise<any> {
    return await this.request('/roadmap/templates');
  }

  async createRoadmapFromTemplate(templateId: string, customizations: any): Promise<any> {
    return await this.request('/roadmap/templates/create', {
      method: 'POST',
      body: JSON.stringify({ templateId, customizations }),
    });
  }

  async getRoadmapNotifications(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/notifications`);
  }

  async subscribeToRoadmapNotifications(roadmapId: string, email: string, types: string[]): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/notifications/subscribe`, {
      method: 'POST',
      body: JSON.stringify({ email, types }),
    });
  }

  async unsubscribeFromRoadmapNotifications(roadmapId: string, email: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/notifications/unsubscribe`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Advanced roadmap operations
  async cloneRoadmap(roadmapId: string, newTitle: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/clone`, {
      method: 'POST',
      body: JSON.stringify({ title: newTitle }),
    });
  }

  async archiveRoadmap(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/archive`, {
      method: 'POST',
    });
  }

  async restoreRoadmap(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/restore`, {
      method: 'POST',
    });
  }

  async getRoadmapHistory(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/history`);
  }

  async getRoadmapComments(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/comments`);
  }

  async addRoadmapComment(roadmapId: string, comment: string, author: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, author }),
    });
  }

  async updateRoadmapComment(roadmapId: string, commentId: string, comment: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ comment }),
    });
  }

  async deleteRoadmapComment(roadmapId: string, commentId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async getRoadmapAttachments(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/attachments`);
  }

  async uploadRoadmapAttachment(roadmapId: string, fileData: FormData): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/attachments`, {
      method: 'POST',
      body: fileData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async deleteRoadmapAttachment(roadmapId: string, attachmentId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  // Milestone-specific advanced operations
  async completeMilestone(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/complete`, {
      method: 'POST',
    });
  }

  async reopenMilestone(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/reopen`, {
      method: 'POST',
    });
  }

  async getMilestoneHistory(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/history`);
  }

  async getMilestoneComments(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/comments`);
  }

  async addMilestoneComment(milestoneId: string, comment: string, author: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment, author }),
    });
  }

  // Portfolio and strategic operations
  async getPortfolioOverview(): Promise<any> {
    return await this.request('/roadmap/portfolio/overview');
  }

  async getPortfolioRisks(): Promise<any> {
    return await this.request('/roadmap/portfolio/risks');
  }

  async getResourceAllocation(): Promise<any> {
    return await this.request('/roadmap/portfolio/resources');
  }

  async updateResourceAllocation(roadmapId: string, resources: any): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/resources`, {
      method: 'PUT',
      body: JSON.stringify(resources),
    });
  }

  async getStrategicInitiatives(): Promise<any> {
    return await this.request('/roadmap/strategic/initiatives');
  }

  async createStrategicInitiative(initiativeData: any): Promise<any> {
    return await this.request('/roadmap/strategic/initiatives', {
      method: 'POST',
      body: JSON.stringify(initiativeData),
    });
  }

  async linkRoadmapToInitiative(roadmapId: string, initiativeId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/initiatives/${initiativeId}`, {
      method: 'POST',
    });
  }

  async unlinkRoadmapFromInitiative(roadmapId: string, initiativeId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/initiatives/${initiativeId}`, {
      method: 'DELETE',
    });
  }

  // Collaboration and workflow operations
  async getRoadmapReviews(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/reviews`);
  }

  async requestRoadmapReview(roadmapId: string, reviewers: string[], deadline: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ reviewers, deadline }),
    });
  }

  async submitRoadmapReview(roadmapId: string, reviewId: string, review: any): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(review),
    });
  }

  async approveRoadmap(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/approve`, {
      method: 'POST',
    });
  }

  async rejectRoadmap(roadmapId: string, reason: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Advanced analytics and forecasting
  async getRoadmapForecast(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/forecast`);
  }

  async getPortfolioForecast(): Promise<any> {
    return await this.request('/roadmap/portfolio/forecast');
  }

  async getCapacityPlanning(): Promise<any> {
    return await this.request('/roadmap/planning/capacity');
  }

  async updateCapacityPlanning(planningData: any): Promise<any> {
    return await this.request('/roadmap/planning/capacity', {
      method: 'PUT',
      body: JSON.stringify(planningData),
    });
  }

  async getRoadmapBurndown(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/burndown`);
  }

  async getMilestoneBurndown(milestoneId: string): Promise<any> {
    return await this.request(`/roadmap/milestones/${milestoneId}/burndown`);
  }

  async getVelocityMetrics(): Promise<any> {
    return await this.request('/roadmap/metrics/velocity');
  }

  async getPredictiveAnalytics(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/analytics/predictive`);
  }

  async getAIRecommendations(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/ai/recommendations`);
  }

  async optimizeRoadmapSchedule(roadmapId: string): Promise<any> {
    return await this.request(`/roadmap/roadmaps/${roadmapId}/optimize/schedule`, {
      method: 'POST',
    });
  }

  // ===== SYSTEM CAPABILITY API =====

  async getSystemCapabilityStatus(): Promise<any> {
    return await this.request('/v1/system/capability/status');
  }

  async getSystemCapabilityFacades(): Promise<any> {
    return await this.request('/v1/system/capability/facades');
  }

  async getSystemCapabilitySuggestions(): Promise<any> {
    return await this.request('/v1/system/capability/suggestions');
  }

  async getSystemCapabilityDetailed(): Promise<any> {
    return await this.request('/v1/system/capability/detailed');
  }

  async getSystemCapabilityHealth(): Promise<any> {
    return await this.request('/v1/system/capability/health');
  }

  async getSystemCapabilityScores(): Promise<any> {
    return await this.request('/v1/system/capability/scores');
  }

  // ===== FACADE MONITORING API =====

  async getFacadeStatus(): Promise<any> {
    return await this.request('/v1/facades/status');
  }

  async getFacadeHealth(facadeName?: string): Promise<any> {
    const endpoint = facadeName ? `/v1/facades/${facadeName}/health` : '/v1/facades/health';
    return await this.request(endpoint);
  }

  async getFacadePackages(facadeName: string): Promise<any> {
    return await this.request(`/v1/facades/${facadeName}/packages`);
  }

  async getFacadeServices(facadeName: string): Promise<any> {
    return await this.request(`/v1/facades/${facadeName}/services`);
  }

  async refreshFacadeStatus(facadeName?: string): Promise<any> {
    const endpoint = facadeName ? `/v1/facades/${facadeName}/refresh` : '/v1/facades/refresh';
    return await this.request(endpoint, { method: 'POST' });
  }

  async getPackageStatus(packageName: string): Promise<any> {
    return await this.request(`/v1/facades/packages/${encodeURIComponent(packageName)}/status`);
  }

  async getServiceStatus(serviceName: string): Promise<any> {
    return await this.request(`/v1/facades/services/${encodeURIComponent(serviceName)}/status`);
  }

  async getFacadeMetrics(): Promise<any> {
    return await this.request('/v1/facades/metrics');
  }

  async getFacadeHistory(facadeName: string, timeRange?: string): Promise<any> {
    const params = timeRange ? `?timeRange=${timeRange}` : '';
    return await this.request(`/v1/facades/${facadeName}/history${params}`);
  }

  async getSystemDependencies(): Promise<any> {
    return await this.request('/v1/facades/dependencies');
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