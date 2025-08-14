/**
 * @fileoverview Zen Orchestrator Wrapper - Bindings Export Interface
 * 
 * This module provides type definitions and wrapper interfaces for the 
 * zen-orchestrator integration. It serves as the bridge between the bindings 
 * module and the full zen-orchestrator integration.
 * 
 * @since 1.0.0-alpha.43
 */

// Re-export types and interfaces from zen-orchestrator-integration
export interface A2AMessage {
  id: string;
  task_id?: string;
  message_type: string;
  content: string;
  role: string;
  timestamp: number;
  metadata?: string;
}

export interface DAAgentStatus {
  agent_id: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  last_activity: number;
  task_count: number;
  error_count: number;
}

export interface NeuralServiceResult {
  success: boolean;
  result?: string;
  error?: string;
  execution_time_ms: number;
  execution_path: string;
  resource_usage?: ResourceUsageInfo;
  neural_metadata?: string;
}

export interface TypedNeuralServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs?: number;
  metadata?: any;
}

export interface OrchestratorBindingConfig {
  host: string;
  port: number;
  storage_path: string;
  enabled: boolean;
  a2a_server_port: number;
  a2a_client_endpoint?: string;
  heartbeat_timeout_sec: number;
  message_timeout_ms: number;
  use_websocket_transport: boolean;
  websocket_port: number;
  websocket_endpoint?: string;
  enable_zen_neural: boolean;
  enable_zen_forecasting: boolean;
  enable_zen_compute: boolean;
  gpu_enabled: boolean;
  enable_quantum: boolean;
  quantum_backend?: string;
}

export interface OrchestratorMetrics {
  uptime_seconds: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time_ms: number;
  memory_usage_mb: number;
  cpu_usage_percent: number;
  neural_forward_passes: number;
  a2a_messages_sent: number;
  a2a_messages_received: number;
}

export interface OrchestratorStatus {
  initialized: boolean;
  services_available: string[];
  a2a_server_running: boolean;
  neural_services_enabled: boolean;
  quantum_backend_available: boolean;
  websocket_server_running: boolean;
  last_heartbeat: number;
}

interface ResourceUsageInfo {
  cpu_time_ms: number;
  memory_mb: number;
  gpu_time_ms?: number;
  vector_operations?: number;
  neural_forward_passes?: number;
}

export interface ZenOrchestratorConfig extends OrchestratorBindingConfig {
  // Additional configuration options for the wrapper
  debug_mode?: boolean;
  log_level?: 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Zen Orchestrator Wrapper Class
 * 
 * Provides a simplified interface to the zen-orchestrator integration
 * specifically designed for use within the bindings module.
 */
export class ZenOrchestratorWrapper {
  private integration: any; // Will be lazily loaded

  constructor(private config: Partial<ZenOrchestratorConfig> = {}) {
    // Configuration validation and defaults
    this.config = {
      enabled: true,
      host: 'localhost',
      port: 4003,
      storage_path: '.zen/collective',
      a2a_server_port: 4005,
      heartbeat_timeout_sec: 300,
      message_timeout_ms: 30000,
      use_websocket_transport: true,
      websocket_port: 4006,
      enable_zen_neural: true,
      enable_zen_forecasting: true,
      enable_zen_compute: true,
      gpu_enabled: false,
      enable_quantum: true,
      quantum_backend: 'ibmq_qasm_simulator',
      debug_mode: false,
      log_level: 'info',
      ...config
    };
  }

  /**
   * Initialize the zen-orchestrator integration
   */
  async initialize(): Promise<void> {
    if (!this.integration) {
      // Lazy load the integration to avoid circular dependencies
      const { getZenSwarmOrchestratorIntegration } = await import('../zen-orchestrator-integration.js');
      this.integration = getZenSwarmOrchestratorIntegration(this.config);
    }
    
    if (this.integration && typeof this.integration.initialize === 'function') {
      await this.integration.initialize();
    }
  }

  /**
   * Check if the wrapper is ready
   */
  async isReady(): Promise<boolean> {
    return this.integration?.isReady() ?? false;
  }

  /**
   * Get orchestrator status
   */
  async getStatus(): Promise<{ success: boolean; data?: OrchestratorStatus; error?: string }> {
    if (!this.integration) {
      return { success: false, error: 'Integration not initialized' };
    }
    return this.integration.getStatus();
  }

  /**
   * Send A2A message
   */
  async sendA2AMessage(
    messageType: string, 
    payload: any, 
    targetSwarm?: string
  ): Promise<{ success: boolean; data?: any; error?: string; executionTimeMs?: number }> {
    if (!this.integration) {
      return { success: false, error: 'Integration not initialized' };
    }
    return this.integration.sendA2AMessage(messageType, payload, targetSwarm);
  }

  /**
   * Execute neural service
   */
  async executeNeuralService<T = any>(
    taskType: string, 
    inputData: any, 
    config?: any
  ): Promise<TypedNeuralServiceResult<T>> {
    if (!this.integration) {
      return { success: false, error: 'Integration not initialized' };
    }
    return this.integration.executeNeuralService(taskType, inputData, config);
  }

  /**
   * List available services
   */
  async listServices(): Promise<{ success: boolean; data?: string[]; error?: string }> {
    if (!this.integration) {
      return { success: false, error: 'Integration not initialized' };
    }
    return this.integration.listServices();
  }

  /**
   * Get comprehensive metrics
   */
  async getMetrics(): Promise<{ success: boolean; data?: OrchestratorMetrics; error?: string }> {
    if (!this.integration) {
      return { success: false, error: 'Integration not initialized' };
    }
    return this.integration.getMetrics();
  }

  /**
   * Shutdown the orchestrator
   */
  async shutdown(): Promise<void> {
    if (this.integration) {
      await this.integration.shutdown();
      this.integration = null;
    }
  }
}

// Default export for convenience
export default ZenOrchestratorWrapper;