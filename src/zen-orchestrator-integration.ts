/**
 * @fileoverview Full Zen Orchestrator Integration with Official A2A Protocol
 *
 * This module provides a comprehensive TypeScript wrapper around the full zen-orchestrator
 * native binding, including official A2A protocol support, direct neural library integration,
 * and complete zen-neural-stack capabilities.
 *
 * Architecture:
 * - Direct library access to zen-neural, zen-forecasting, zen-compute
 * - Official A2A protocol for zen-swarm communication
 * - Integration with THE COLLECTIVE's unified Cozy + Lance database
 * - Bridge to zen-code's existing LLM infrastructure
 */

import { getLogger } from '../config/logging-config.js';

const logger = getLogger('ZenSwarmOrchestrator');

// Native binding interfaces (imported from compiled Rust)
interface ZenSwarmOrchestrator {
  new (config: OrchestratorConfig): ZenSwarmOrchestrator;
  initialize(): Promise<boolean>;
  getStatus(): Promise<string>;
  sendA2AMessage(message: A2AProtocolMessage): Promise<ServiceResult>;
  executeNeuralService(task: NeuralTaskRequest): Promise<ServiceResult>;
  listServices(): Promise<string[]>;
  getA2AServerStatus(): Promise<string>;
  getMetrics(): Promise<string>;
  shutdown(): Promise<boolean>;
}

interface OrchestratorConfig {
  host: string;
  port: number;
  storage_path: string;
  enabled: boolean;

  // A2A Protocol Configuration
  a2a_server_port: number;
  a2a_client_endpoint?: string;
  heartbeat_timeout_sec: number;
  message_timeout_ms: number;

  // WebSocket Configuration for real-time coordination
  use_websocket_transport: boolean;
  websocket_port: number;
  websocket_endpoint?: string;

  // Neural Stack Configuration
  enable_zen_neural: boolean;
  enable_zen_forecasting: boolean;
  enable_zen_compute: boolean;
  gpu_enabled: boolean;

  // Quantum Computing Configuration
  enable_quantum: boolean;
  quantum_backend?: string;
}

interface A2AProtocolMessage {
  id: string;
  task_id?: string;
  message_type: string;
  content: string;
  role: string;
  timestamp: number;
  metadata?: string;
}

interface NeuralTaskRequest {
  task_type: string;
  input_data: string;
  config?: string;
  timeout_ms?: number;
}

interface ServiceResult {
  success: boolean;
  result?: string;
  error?: string;
  execution_time_ms: number;
  execution_path: string;
  resource_usage?: ResourceUsageInfo;
  neural_metadata?: string;
}

interface ResourceUsageInfo {
  cpu_time_ms: number;
  memory_mb: number;
  gpu_time_ms?: number;
  vector_operations?: number;
  neural_forward_passes?: number;
}

// Lazy loading of native binding
let nativeBinding: {
  ZenSwarmOrchestrator: typeof ZenSwarmOrchestrator;
} | null = null;

async function loadNativeBinding() {
  if (!nativeBinding) {
    try {
      // Import the compiled native binding
      nativeBinding = await import(
        '../bindings/zen-code-bindings.linux-x64-gnu.node'
      );
      logger.info(
        '✅ Native zen-swarm-orchestrator binding loaded successfully'
      );
    } catch (error) {
      logger.error(
        '❌ Failed to load zen-swarm-orchestrator native binding:',
        error
      );
      throw new Error(`Failed to load native binding: ${error}`);
    }
  }
  return nativeBinding;
}

/**
 * Zen Swarm Orchestrator Integration with Official A2A Protocol Support
 *
 * This class provides comprehensive access to zen-neural-stack capabilities:
 * - Direct zen-neural, zen-forecasting, zen-compute library integration
 * - Official A2A protocol for zen-swarm daemon communication
 * - Bridge to zen-code's existing LLM and database infrastructure
 */
export class ZenOrchestratorIntegration {
  private zenSwarmOrchestrator: ZenSwarmOrchestrator | null = null;
  private isInitialized = false;
  private config: OrchestratorConfig;

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      host: config?.host || 'localhost',
      port: config?.port || 4003,
      storage_path: config?.storage_path || '.zen/collective',
      enabled: config?.enabled ?? true,

      // A2A Protocol defaults
      a2a_server_port: config?.a2a_server_port || 4005,
      a2a_client_endpoint: config?.a2a_client_endpoint,
      heartbeat_timeout_sec: config?.heartbeat_timeout_sec || 300,
      message_timeout_ms: config?.message_timeout_ms || 30000,

      // WebSocket defaults for real-time coordination
      use_websocket_transport: config?.use_websocket_transport ?? true,
      websocket_port: config?.websocket_port || 4006,
      websocket_endpoint: config?.websocket_endpoint,

      // Neural Stack defaults
      enable_zen_neural: config?.enable_zen_neural ?? true,
      enable_zen_forecasting: config?.enable_zen_forecasting ?? true,
      enable_zen_compute: config?.enable_zen_compute ?? true,
      gpu_enabled: config?.gpu_enabled ?? false,

      // Quantum Computing defaults
      enable_quantum: config?.enable_quantum ?? true,
      quantum_backend: config?.quantum_backend ?? 'ibmq_qasm_simulator',
    };

    logger.info('🚀 ZenSwarmOrchestratorIntegration created with config:', {
      ...this.config,
      // Don't log sensitive data
      a2a_client_endpoint: this.config.a2a_client_endpoint
        ? '[CONFIGURED]'
        : '[NOT_SET]',
    });
  }

  /**
   * Initialize the full zen-orchestrator with A2A protocol support
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('⚠️ zen-orchestrator already initialized');
      return;
    }

    try {
      const binding = await loadNativeBinding();

      this.zenSwarmOrchestrator = new binding.ZenSwarmOrchestrator(this.config);

      const result = await this.zenSwarmOrchestrator.initialize();
      if (!result) {
        throw new Error('zen-orchestrator initialization returned false');
      }

      this.isInitialized = true;
      logger.info('✅ zen-orchestrator initialized successfully');

      // Log initialization status
      const status = await this.getStatus();
      logger.info('📊 Initialization status:', JSON.parse(status.data || '{}'));
    } catch (error) {
      logger.error('❌ Failed to initialize zen-orchestrator:', error);
      throw error;
    }
  }

  /**
   * Check if zen-orchestrator is ready for operations
   */
  async isReady(): Promise<boolean> {
    return this.isInitialized && this.zenSwarmOrchestrator !== null;
  }

  /**
   * Get comprehensive zen-orchestrator status including A2A protocol info
   */
  async getStatus(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!(await this.isReady())) {
      return {
        success: false,
        error: 'zen-swarm-orchestrator not initialized',
      };
    }

    try {
      const statusJson = await this.zenSwarmOrchestrator!.getStatus();
      const statusData = JSON.parse(statusJson);

      return {
        success: true,
        data: statusData,
      };
    } catch (error) {
      logger.error('❌ Failed to get zen-orchestrator status:', error);
      return {
        success: false,
        error: `Status request failed: ${error}`,
      };
    }
  }

  /**
   * Send official A2A protocol message to zen-swarm daemon
   */
  async sendA2AMessage(
    messageType: string,
    payload: any,
    targetSwarm?: string
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    executionTimeMs?: number;
  }> {
    if (!(await this.isReady())) {
      return {
        success: false,
        error: 'zen-swarm-orchestrator not initialized',
      };
    }

    try {
      const message: A2AProtocolMessage = {
        id: `a2a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        task_id: targetSwarm ? `task-${targetSwarm}` : undefined,
        message_type: messageType,
        content: JSON.stringify(payload),
        role: 'user',
        timestamp: Date.now(),
        metadata: targetSwarm
          ? JSON.stringify({ target_swarm: targetSwarm })
          : undefined,
      };

      const result = await this.zenSwarmOrchestrator!.sendA2AMessage(message);

      return {
        success: result.success,
        data: result.result ? JSON.parse(result.result) : undefined,
        error: result.error,
        executionTimeMs: result.execution_time_ms,
      };
    } catch (error) {
      logger.error('❌ Failed to send A2A message:', error);
      return {
        success: false,
        error: `A2A message failed: ${error}`,
      };
    }
  }

  /**
   * Execute neural service with direct library integration
   */
  async executeNeuralService(
    taskType: string,
    inputData: any,
    config?: any
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    executionTimeMs?: number;
    metadata?: any;
  }> {
    if (!(await this.isReady())) {
      return {
        success: false,
        error: 'zen-swarm-orchestrator not initialized',
      };
    }

    try {
      const task: NeuralTaskRequest = {
        task_type: taskType,
        input_data: JSON.stringify(inputData),
        config: config ? JSON.stringify(config) : undefined,
        timeout_ms: 30000,
      };

      const result =
        await this.zenSwarmOrchestrator!.executeNeuralService(task);

      const response = {
        success: result.success,
        data: result.result ? JSON.parse(result.result) : undefined,
        error: result.error,
        executionTimeMs: result.execution_time_ms,
        metadata: {
          execution_path: result.execution_path,
          resource_usage: result.resource_usage,
          neural_metadata: result.neural_metadata
            ? JSON.parse(result.neural_metadata)
            : undefined,
        },
      };

      if (result.success) {
        logger.info(
          `✅ Neural service executed: ${taskType} via ${result.execution_path} in ${result.execution_time_ms}ms`
        );
      } else {
        logger.error(`❌ Neural service failed: ${taskType} - ${result.error}`);
      }

      return response;
    } catch (error) {
      logger.error('❌ Failed to execute neural service:', error);
      return {
        success: false,
        error: `Neural service execution failed: ${error}`,
      };
    }
  }

  /**
   * Execute service (legacy interface for compatibility)
   */
  async executeService(
    serviceName: string,
    parameters: any = {}
  ): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    executionTimeMs?: number;
  }> {
    // Map legacy service names to neural task types
    const taskTypeMap: { [key: string]: string } = {
      'neural-forecast': 'forecasting-predict',
      'neural-compute': 'compute-execute',
      'collective-intelligence': 'collective-intelligence',
      'health-check': 'neural-forward', // Use neural-forward for health check
      echo: 'neural-forward',
      'quantum-test': 'quantum-test',
      'quantum-execute': 'quantum-execute',
      'quantum-backends': 'quantum-backends',
      'quantum-submit': 'quantum-submit',
    };

    const taskType = taskTypeMap[serviceName] || serviceName;
    const result = await this.executeNeuralService(taskType, parameters);

    return {
      success: result.success,
      data: result.data,
      error: result.error,
      executionTimeMs: result.executionTimeMs,
    };
  }

  /**
   * List all available services including neural capabilities
   */
  async listServices(): Promise<{
    success: boolean;
    data?: string[];
    error?: string;
  }> {
    if (!(await this.isReady())) {
      return {
        success: false,
        error: 'zen-swarm-orchestrator not initialized',
      };
    }

    try {
      const services = await this.zenSwarmOrchestrator!.listServices();
      return {
        success: true,
        data: services,
      };
    } catch (error) {
      logger.error('❌ Failed to list services:', error);
      return {
        success: false,
        error: `List services failed: ${error}`,
      };
    }
  }

  /**
   * Get A2A server status information
   */
  async getA2AServerStatus(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    if (!(await this.isReady())) {
      return {
        success: false,
        error: 'zen-swarm-orchestrator not initialized',
      };
    }

    try {
      const statusJson = await this.zenSwarmOrchestrator!.getA2AServerStatus();
      const statusData = JSON.parse(statusJson);

      return {
        success: true,
        data: statusData,
      };
    } catch (error) {
      logger.error('❌ Failed to get A2A server status:', error);
      return {
        success: false,
        error: `A2A server status failed: ${error}`,
      };
    }
  }

  /**
   * Get comprehensive metrics including neural performance
   */
  async getMetrics(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    if (!(await this.isReady())) {
      return {
        success: false,
        error: 'zen-swarm-orchestrator not initialized',
      };
    }

    try {
      const metricsJson = await this.zenSwarmOrchestrator!.getMetrics();
      const metricsData = JSON.parse(metricsJson);

      return {
        success: true,
        data: metricsData,
      };
    } catch (error) {
      logger.error('❌ Failed to get metrics:', error);
      return {
        success: false,
        error: `Metrics request failed: ${error}`,
      };
    }
  }

  /**
   * Get version information
   */
  getVersion(): string {
    return 'zen-swarm-orchestrator-1.0.0';
  }

  /**
   * Shutdown zen-orchestrator gracefully
   */
  async shutdown(): Promise<void> {
    if (!this.isInitialized || !this.zenSwarmOrchestrator) {
      logger.warn(
        '⚠️ zen-swarm-orchestrator not initialized, nothing to shutdown'
      );
      return;
    }

    try {
      await this.zenSwarmOrchestrator.shutdown();
      this.zenSwarmOrchestrator = null;
      this.isInitialized = false;
      logger.info('✅ zen-orchestrator shutdown successfully');
    } catch (error) {
      logger.error('❌ Failed to shutdown zen-orchestrator:', error);
      throw error;
    }
  }
}

// Singleton instance for global access
let zenSwarmOrchestratorInstance: ZenOrchestratorIntegration | null = null;

/**
 * Get or create the global zen-swarm-orchestrator instance
 */
export function getZenSwarmOrchestratorIntegration(
  config?: Partial<OrchestratorConfig>
): ZenOrchestratorIntegration {
  if (!zenSwarmOrchestratorInstance) {
    zenSwarmOrchestratorInstance = new ZenOrchestratorIntegration(config);

    // Auto-initialize if enabled
    if (config?.enabled !== false) {
      zenSwarmOrchestratorInstance.initialize().catch((error) => {
        logger.error(
          '❌ Failed to auto-initialize zen-swarm-orchestrator:',
          error
        );
      });
    }
  }

  return zenSwarmOrchestratorInstance;
}

/**
 * Reset the global instance (primarily for testing)
 */
export function resetZenSwarmOrchestratorIntegration(): void {
  if (zenSwarmOrchestratorInstance) {
    zenSwarmOrchestratorInstance.shutdown().catch((error) => {
      logger.error(
        '❌ Failed to shutdown zen-swarm-orchestrator during reset:',
        error
      );
    });
  }
  zenSwarmOrchestratorInstance = null;
}

export { ZenOrchestratorIntegration };
