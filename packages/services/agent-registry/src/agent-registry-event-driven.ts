/**
 * @fileoverview Agent Registry Implementation - Event-Driven with Foundation
 *
 * Event-based agent registry that coordinates via events but uses foundation internally.
 * Listens to brain events and responds with agent registry data via events.
 */

// =============================================================================
// FOUNDATION IMPORTS (ALLOWED FOR INTERNAL OPERATIONS)
// =============================================================================

import {
  createServiceContainer,
  err,
  getLogger,
  type Logger,
  ok,
  type Result,
  TypedEventBase,
  generateUUID,
  type UUID,
  createTimestamp,
  type Timestamp,
  recordMetric,
  recordHistogram,
  withTrace,
} from '@claude-zen/foundation';

// =============================================================================
// EVENT INTERFACES - BRAIN COORDINATION
// =============================================================================

export interface AgentRegistryEvents {
  // Brain requests
  'brain:agent-registry:register-agent': {
    requestId:string;
    registration:AgentRegistrationConfig;
    timestamp:number;
};
  'brain:agent-registry:unregister-agent': {
    requestId:string;
    agentId:string;
    timestamp:number;
};
  'brain:agent-registry:get-agent': {
    requestId:string;
    agentId:string;
    timestamp:number;
};
  'brain:agent-registry:find-agents': {
    requestId:string;
    criteria:AgentSearchCriteria;
    timestamp:number;
};
  'brain:agent-registry:update-agent-health': {
    requestId:string;
    agentId:string;
    health:AgentHealthStatus;
    timestamp:number;
};
  'brain:agent-registry:get-registry-stats': {
    requestId:string;
    timestamp:number;
};
  'brain:agent-registry:initialize': {
    requestId:string;
    options?:AgentRegistryOptions;
    timestamp:number;
};

  // Agent registry responses
  'agent-registry:agent-registered': {
    requestId:string;
    agentId:string;
    agent:AgentInstance;
    success:boolean;
    timestamp:number;
};
  'agent-registry:agent-unregistered': {
    requestId:string;
    agentId:string;
    success:boolean;
    timestamp:number;
};
  'agent-registry:agent-info': {
    requestId:string;
    agent: AgentInstance | null;
    timestamp:number;
  };
  'agent-registry:agents-found': {
    requestId:string;
    agents:AgentInstance[];
    totalCount:number;
    timestamp:number;
};
  'agent-registry:health-updated': {
    requestId:string;
    agentId:string;
    success:boolean;
    timestamp:number;
};
  'agent-registry:stats': {
    requestId:string;
    stats:RegistryStats;
    timestamp:number;
};
  'agent-registry:initialized': {
    requestId:string;
    success:boolean;
    timestamp:number;
};
  'agent-registry:error': {
    requestId:string;
    error:string;
    timestamp:number;
};
}

// =============================================================================
// TYPE DEFINITIONS - AGENT MANAGEMENT
// =============================================================================

interface AgentInstance {
  id:UUID;
  templateId:string;
  name:string;
  type:string;
  capabilities:string[];
  status:'active' | 'inactive' | 'busy' | 'error';
  health:AgentHealthStatus;
  config:Record<string, unknown>;
  metadata:Record<string, unknown>;
  registeredAt:Timestamp;
  lastSeen:Timestamp;
  version:number;
}

interface AgentRegistrationConfig {
  templateId:string;
  name:string;
  type:string;
  capabilities?:string[];
  config?:Record<string, unknown>;
  metadata?:Record<string, unknown>;
}

interface AgentHealthStatus {
  status:'healthy' | 'degraded' | 'unhealthy';
  responseTime:number;
  errorRate:number;
  memoryUsage:number;
  cpuUsage:number;
  lastCheck:Timestamp;
  details?:Record<string, unknown>;
}

interface AgentSearchCriteria {
  type?:string;
  capabilities?:string[];
  status?:AgentInstance['status'];
  templateId?:string;
  limit?:number;
  offset?:number;
}

interface RegistryStats {
  totalAgents:number;
  agentsByType:Record<string, number>;
  agentsByStatus:Record<string, number>;
  averageResponseTime:number;
  averageHealth:number;
  lastUpdated:Timestamp;
}

interface AgentRegistryOptions {
  enableHealthMonitoring?:boolean;
  healthCheckInterval?:number;
  maxAgents?:number;
  enableMetrics?:boolean;
  persistentStorage?:boolean;
}

// =============================================================================
// EVENT-DRIVEN AGENT REGISTRY - FOUNDATION POWERED
// =============================================================================

export class EventDrivenAgentRegistry extends TypedEventBase {
  private logger:Logger;
  private serviceContainer:any;
  private initialized = false;
  private options:AgentRegistryOptions;
  private agents = new Map<UUID, AgentInstance>();
  private agentsByType = new Map<string, Set<UUID>>();
  private agentsByCapability = new Map<string, Set<UUID>>();
  private healthMonitorInterval:NodeJS.Timeout | null = null;

  constructor(options:AgentRegistryOptions = {}) {
    super();
    this.logger = getLogger('EventDrivenAgentRegistry');
    this.serviceContainer = createServiceContainer();
    
    // Default options with foundation-powered features
    this.options = {
      enableHealthMonitoring:true,
      healthCheckInterval:30000, // 30 seconds
      maxAgents:1000,
      enableMetrics:true,
      persistentStorage:false,
      ...options,
};
}

  // =============================================================================
  // BRAIN EVENT HANDLERS
  // =============================================================================

  private setupBrainEventHandlers():void {
    // Handle brain initialization requests
    this.on('brain:agent-registry:initialize', async (data) => {
      try {
        if (data.options) {
          this.options = { ...this.options, ...data.options};
}
        await this.initializeInternal();
        this.emit('agent-registry:initialized', {
          requestId:data.requestId,
          success:true,
          timestamp:Date.now(),
});
} catch (error) {
        this.emit('agent-registry:initialized', {
          requestId:data.requestId,
          success:false,
          timestamp:Date.now(),
});
        this.emit('agent-registry:error', {
          requestId:data.requestId,
          error:error instanceof Error ? error.message : String(error),
          timestamp:Date.now(),
});
}
});

    // Handle agent registration requests
    this.on('brain:agent-registry:register-agent', async (data) => {
      try {
        const result = await this.registerAgentInternal(data.registration);
        if (result.isOk()) {
          this.emit('agent-registry:agent-registered', {
            requestId:data.requestId,
            agentId:result.value.id,
            agent:result.value,
            success:true,
            timestamp:Date.now(),
          });
        } else {
          this.emit('agent-registry:agent-registered', {
            requestId:data.requestId,
            agentId: '',
            agent:{} as AgentInstance,
            success:false,
            timestamp:Date.now(),
          });
          this.emit('agent-registry:error', {
            requestId:data.requestId,
            error:result.error?.message || 'Registration failed',
            timestamp:Date.now(),
          });
        }
} catch (error) {
        this.emit('agent-registry:error', {
          requestId:data.requestId,
          error:error instanceof Error ? error.message : String(error),
          timestamp:Date.now(),
});
}
});

    // Handle agent unregistration requests
    this.on('brain:agent-registry:unregister-agent', async (data) => {
      try {
        const success = await this.unregisterAgentInternal(data.agentId);
        this.emit('agent-registry:agent-unregistered', {
          requestId:data.requestId,
          agentId:data.agentId,
          success,
          timestamp:Date.now(),
});
} catch (error) {
        this.emit('agent-registry:agent-unregistered', {
          requestId:data.requestId,
          agentId:data.agentId,
          success:false,
          timestamp:Date.now(),
});
        this.emit('agent-registry:error', {
          requestId:data.requestId,
          error:error instanceof Error ? error.message : String(error),
          timestamp:Date.now(),
});
}
});

    // Handle get agent requests
    this.on('brain:agent-registry:get-agent', async (data) => {
      try {
        const agent = await this.getAgentInternal(data.agentId);
        this.emit('agent-registry:agent-info', {
          requestId:data.requestId,
          agent,
          timestamp:Date.now(),
});
} catch (error) {
        this.emit('agent-registry:error', {
          requestId:data.requestId,
          error:error instanceof Error ? error.message : String(error),
          timestamp:Date.now(),
});
}
});

    // Handle find agents requests
    this.on('brain:agent-registry:find-agents', async (data) => {
      try {
        const { agents, totalCount} = await this.findAgentsInternal(data.criteria);
        this.emit('agent-registry:agents-found', {
          requestId:data.requestId,
          agents,
          totalCount,
          timestamp:Date.now(),
});
} catch (error) {
        this.emit('agent-registry:error', {
          requestId:data.requestId,
          error:error instanceof Error ? error.message : String(error),
          timestamp:Date.now(),
});
}
});

    // Handle health update requests
    this.on('brain:agent-registry:update-agent-health', async (data) => {
      try {
        const success = await this.updateAgentHealthInternal(data.agentId, data.health);
        this.emit('agent-registry:health-updated', {
          requestId:data.requestId,
          agentId:data.agentId,
          success,
          timestamp:Date.now(),
});
} catch (error) {
        this.emit('agent-registry:error', {
          requestId:data.requestId,
          error:error instanceof Error ? error.message : String(error),
          timestamp:Date.now(),
});
}
});

    // Handle stats requests
    this.on('brain:agent-registry:get-registry-stats', async (data) => {
      try {
        const stats = await this.getRegistryStatsInternal();
        this.emit('agent-registry:stats', {
          requestId:data.requestId,
          stats,
          timestamp:Date.now(),
        });
      } catch (error) {
        this.emit('agent-registry:error', {
          requestId:data.requestId,
          error:error instanceof Error ? error.message : String(error),
          timestamp:Date.now(),
        });
      }
    });
}

  // =============================================================================
  // INTERNAL AGENT REGISTRY LOGIC - FOUNDATION POWERED
  // =============================================================================

  private async initializeInternal():Promise<void> {
    if (this.initialized) return;

    await withTrace('agent-registry-initialize', async () => {
      if (this.options.enableHealthMonitoring) {
        this.startHealthMonitoring();
}

      if (this.options.enableMetrics) {
        recordMetric('agent_registry_initialized', 1);
}

      this.initialized = true;
      this.logger.info('Event-driven agent registry initialized with foundation support', {
        options:this.options,
});
});
}

  private async registerAgentInternal(
    registration:AgentRegistrationConfig
  ):Promise<Result<AgentInstance, Error>> {
    return withTrace('agent-registry-register', async () => {
      try {
        // Check agent limit
        if (typeof this.options.maxAgents === 'number' && this.agents.size >= this.options.maxAgents) {
          return err(new Error('Maximum agent limit reached'));
}

        const agentId = generateUUID();
        const timestamp = createTimestamp();

        const agent:AgentInstance = {
          id:agentId,
          templateId:registration.templateId,
          name:registration.name,
          type:registration.type,
          capabilities:registration.capabilities || [],
          status: 'active',          health:{
            status: 'healthy',            responseTime:0,
            errorRate:0,
            memoryUsage:0,
            cpuUsage:0,
            lastCheck:timestamp,
},
          config:registration.config || {},
          metadata:registration.metadata || {},
          registeredAt:timestamp,
          lastSeen:timestamp,
          version:1,
};

        // Store agent
        this.agents.set(agentId, agent);

        // Update indexes
        this.updateIndexes(agent, 'add');

        // Record metrics
        if (this.options.enableMetrics) {
          recordMetric('agents_registered', 1);
          recordHistogram('agent_registration_duration', Date.now() - timestamp);
}

        this.logger.info('Agent registered successfully', {
          agentId,
          type:agent.type,
          capabilities:agent.capabilities,
});

        return ok(agent);
} catch (error) {
        this.logger.error('Agent registration failed', error);
        return err(error instanceof Error ? error:new Error(String(error)));
}
});
}

  private async unregisterAgentInternal(agentId:string): Promise<boolean> {
    return withTrace('agent-registry-unregister', async () => {
      const agent = this.agents.get(agentId);
      if (!agent) {
        return false;
}

      // Remove from indexes
      this.updateIndexes(agent, 'remove');

      // Remove from main store
      this.agents.delete(agentId);

      // Record metrics
      if (this.options.enableMetrics) {
        recordMetric('agents_unregistered', 1);
}

      this.logger.info('Agent unregistered successfully', { agentId});
      return true;
});
}

  private async getAgentInternal(agentId:string): Promise<AgentInstance | null> {
    return withTrace('agent-registry-get', async () => {
      const agent = this.agents.get(agentId);
      if (agent) {
        // Update last seen
        agent.lastSeen = createTimestamp();
        
        // Record metrics
        if (this.options.enableMetrics) {
          recordMetric('agent_lookups', 1);
}
}
      return agent || null;
});
}

  private async findAgentsInternal(
    criteria:AgentSearchCriteria
  ):Promise<{ agents: AgentInstance[]; totalCount: number}> {
    return withTrace('agent-registry-find', async () => {
      let candidateIds:Set<UUID> = new Set(this.agents.keys());

      // Apply type filter
      if (criteria.type) {
        const typeAgents = this.agentsByType.get(criteria.type);
        candidateIds = typeAgents ? new Set([...candidateIds].filter(id => typeAgents.has(id))) :new Set();
}

      // Apply capability filter
      if (criteria.capabilities && criteria.capabilities.length > 0) {
        for (const capability of criteria.capabilities) {
          const capabilityAgents = this.agentsByCapability.get(capability);
          if (capabilityAgents) {
            candidateIds = new Set([...candidateIds].filter(id => capabilityAgents.has(id)));
} else {
            candidateIds = new Set();
            break;
}
}
}

      // Get matching agents and apply additional filters
      let matchingAgents = Array.from(candidateIds)
        .map(id => {
          const agent = this.agents.get(id);
          if (!agent) {
            throw new Error(`Agent with id ${id} not found`);
          }
          return agent;
        })
        .filter(agent => {
          if (criteria.status && agent.status !== criteria.status) {
            return false;
}
          if (criteria.templateId && agent.templateId !== criteria.templateId) {
            return false;
}
          return true;
});

      // Sort by last seen (most recent first)
      matchingAgents.sort((a, b) => b.lastSeen - a.lastSeen);

      const totalCount = matchingAgents.length;

      // Apply pagination
      const offset = criteria.offset || 0;
      const limit = criteria.limit || matchingAgents.length;
      matchingAgents = matchingAgents.slice(offset, offset + limit);

      // Record metrics
      if (this.options.enableMetrics) {
        recordMetric('agent_searches', 1);
        recordHistogram('search_results_count', matchingAgents.length);
}

      return { agents:matchingAgents, totalCount};
});
}

  private async updateAgentHealthInternal(
    agentId:string,
    health:AgentHealthStatus
  ):Promise<boolean> {
    return withTrace('agent-registry-update-health', async () => {
      const agent = this.agents.get(agentId);
      if (!agent) {
        return false;
}

      // Update health
      agent.health = { ...health, lastCheck:createTimestamp()};
      agent.lastSeen = createTimestamp();
      agent.version += 1;

      // Update status based on health
      agent.status = health.status === 'healthy' ? 'active' :
                     health.status === 'degraded' ? 'busy' : 'error';

      // Record metrics
      if (this.options.enableMetrics) {
        recordMetric('agent_health_updates', 1);
        recordHistogram('agent_response_time', health.responseTime);
        recordHistogram('agent_error_rate', health.errorRate);
}

      this.logger.debug('Agent health updated', { agentId, health:health.status});
      return true;
});
}

  private async getRegistryStatsInternal():Promise<RegistryStats> {
    return withTrace('agent-registry-stats', async () => {
      const agents = Array.from(this.agents.values());
      
      const agentsByType:Record<string, number> = {};
      const agentsByStatus:Record<string, number> = {};
      let totalResponseTime = 0;
      let totalHealth = 0;

      for (const agent of agents) {
        // Count by type
        agentsByType[agent.type] = (agentsByType[agent.type] || 0) + 1;
        
        // Count by status
        agentsByStatus[agent.status] = (agentsByStatus[agent.status] || 0) + 1;
        
        // Accumulate metrics
        totalResponseTime += agent.health.responseTime;
        totalHealth += agent.health.status === 'healthy' ? 1:
                       agent.health.status === 'degraded' ? 0.5:0;
}

      const stats:RegistryStats = {
        totalAgents:agents.length,
        agentsByType,
        agentsByStatus,
        averageResponseTime:agents.length > 0 ? totalResponseTime / agents.length : 0,
        averageHealth:agents.length > 0 ? totalHealth / agents.length : 0,
        lastUpdated:createTimestamp(),
};

      // Record metrics
      if (this.options.enableMetrics) {
        recordMetric('registry_stats_requests', 1);
        recordHistogram('total_agents_count', stats.totalAgents);
}

      return stats;
});
}

  // =============================================================================
  // HELPER METHODS - FOUNDATION POWERED
  // =============================================================================

  private updateIndexes(agent:AgentInstance, operation:'add' | 'remove'): void {
    if (operation === 'add') {
      // Update type index
      if (!this.agentsByType.has(agent.type)) {
        this.agentsByType.set(agent.type, new Set());
}
      const typeSet = this.agentsByType.get(agent.type);
      if (typeSet) {
        typeSet.add(agent.id);
      }

      // Update capability indexes
      for (const capability of agent.capabilities) {
        if (!this.agentsByCapability.has(capability)) {
          this.agentsByCapability.set(capability, new Set());
        }
        const capSet = this.agentsByCapability.get(capability);
        if (capSet) {
          capSet.add(agent.id);
        }
      }
} else {
      // Remove from type index
      const typeSet = this.agentsByType.get(agent.type);
      if (typeSet) {
        typeSet.delete(agent.id);
        if (typeSet.size === 0) {
          this.agentsByType.delete(agent.type);
}
}

      // Remove from capability indexes
      for (const capability of agent.capabilities) {
        const capabilitySet = this.agentsByCapability.get(capability);
        if (capabilitySet) {
          capabilitySet.delete(agent.id);
          if (capabilitySet.size === 0) {
            this.agentsByCapability.delete(capability);
}
}
}
}
}

  private startHealthMonitoring():void {
    if (!this.options.enableHealthMonitoring || this.healthMonitorInterval) {
      return;
}

    if (typeof this.options.healthCheckInterval === 'number') {
      this.healthMonitorInterval = setInterval(() => {
        this.performHealthChecks();
      }, this.options.healthCheckInterval);
    }

    this.logger.info('Health monitoring started', {
      interval:this.options.healthCheckInterval,
});
}

  private performHealthChecks():void {
    const now = createTimestamp();
    const staleThreshold = typeof this.options.healthCheckInterval === 'number'
      ? now - (this.options.healthCheckInterval * 2)
      : now - 60000; // fallback to 1min if not set

    for (const [agentId, agent] of this.agents.entries()) {
      if (agent.lastSeen < staleThreshold) {
        // Mark as offline if not seen recently
        agent.status = 'inactive';
        agent.health.status = 'unhealthy';
        agent.health.lastCheck = now;
        
        this.logger.warn('Agent marked as stale', { agentId, lastSeen:agent.lastSeen});
        
        // Record metric
        if (this.options.enableMetrics) {
          recordMetric('stale_agents_detected', 1);
}
}
}
}

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  async initialize():Promise<void> {
    this.setupBrainEventHandlers();
    this.logger.info('Event-driven agent registry ready to receive brain events');
}

  async shutdown():Promise<void> {
    if (this.healthMonitorInterval) {
      clearInterval(this.healthMonitorInterval);
      this.healthMonitorInterval = null;
}

    this.agents.clear();
    this.agentsByType.clear();
    this.agentsByCapability.clear();
    this.removeAllListeners();
    this.initialized = false;

    if (this.options.enableMetrics) {
      recordMetric('agent_registry_shutdowns', 1);
}

    this.logger.info('Event-driven agent registry shutdown complete');
}
}

// =============================================================================
// FACTORY AND EXPORTS
// =============================================================================

export function createEventDrivenAgentRegistry(
  options?:AgentRegistryOptions
):EventDrivenAgentRegistry {
  return new EventDrivenAgentRegistry(options);
}

export default EventDrivenAgentRegistry;