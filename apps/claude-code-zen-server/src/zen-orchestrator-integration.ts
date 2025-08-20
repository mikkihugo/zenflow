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

import { getLogger } from './config/logging-config';

// Platform-specific binding resolution
import { platform, arch } from 'os';
import { resolve } from 'path';

const logger = getLogger('ZenSwarmOrchestrator');

// Native binding interfaces (imported from compiled Rust)
interface ZenSwarmOrchestratorInstance {
  initialize(): Promise<boolean>;
  getStatus(): Promise<string>;
  sendA2AMessage(message: A2AProtocolMessage): Promise<ServiceResult>;
  executeNeuralService(task: NeuralTaskRequest): Promise<ServiceResult>;
  listServices(): Promise<string[]>;
  getA2AServerStatus(): Promise<string>;
  getMetrics(): Promise<string>;
  shutdown(): Promise<boolean>;
}

interface ZenSwarmOrchestratorConstructor {
  new (config: OrchestratorConfig): ZenSwarmOrchestratorInstance;
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

// Interface for the native binding
interface NativeZenSwarmOrchestrator {
  ZenSwarmOrchestrator: ZenSwarmOrchestratorConstructor;
}

// Lazy loading of native binding with platform detection
let nativeBinding: NativeZenSwarmOrchestrator | null = null;
let fallbackMode = false;

/**
 * Reset binding state (for testing)
 */
export function resetBindingState(): void {
  nativeBinding = null;
  fallbackMode = false;
}

/**
 * Get platform-specific binding filename
 */
function getPlatformBindingName(): string {
  const platformMap: Record<string, string> = {
    'linux': 'linux',
    'darwin': 'darwin',
    'win32': 'win32'
  };
  
  const archMap: Record<string, string> = {
    'x64': 'x64',
    'arm64': 'arm64',
    'ia32': 'x86'
  };
  
  const platformName = platformMap[platform()] || 'linux';
  const archName = archMap[arch()] || 'x64';
  
  return `zen-code-bindings.${platformName}-${archName}-gnu.node`;
}

/**
 * Attempt to load native binding with multiple fallback strategies
 */
async function loadNativeBinding(): Promise<NativeZenSwarmOrchestrator> {
  if (nativeBinding && !fallbackMode) {
    return nativeBinding;
  }

  if (fallbackMode) {
    return createFallbackBinding();
  }

  const bindingPaths = [
    // Platform-specific binding
    `../bindings/${getPlatformBindingName()}`,
    // Fallback to linux x64 (most common)
    '../bindings/zen-code-bindings.linux-x64-gnu.node',
    // Alternative location
    '../bindings/2/zen-code-bindings.linux-x64-gnu.node',
    // Relative to current file
    './bindings/zen-code-bindings.linux-x64-gnu.node'
  ];

  // Try each binding path
  for (const bindingPath of bindingPaths) {
    try {
      logger.info(`🔄 Attempting to load native binding: ${bindingPath}`);
      
      // Check if file exists first (for better error messages)
      const resolvedPath = resolve(__dirname, bindingPath);
      
      // Dynamic import with proper error handling
      nativeBinding = await import(bindingPath) as NativeZenSwarmOrchestrator;
      
      logger.info(`✅ Native zen-swarm-orchestrator binding loaded successfully from: ${bindingPath}`);
      return nativeBinding;
    } catch (error) {
      logger.warn(`⚠️ Failed to load binding from ${bindingPath}:`, error);
      continue;
    }
  }

  // If all native bindings fail, enter fallback mode
  fallbackMode = true;
  logger.error('❌ All native binding attempts failed, entering fallback mode');
  
  // Create mock implementation for fallback
  return createFallbackBinding();
}

/**
 * Create a fallback implementation when native bindings are unavailable
 */
function createFallbackBinding(): NativeZenSwarmOrchestrator {
  logger.warn('🔄 Creating fallback zen-swarm-orchestrator implementation');
  
  // Mock ZenSwarmOrchestrator class for fallback
  class FallbackZenSwarmOrchestrator implements ZenSwarmOrchestratorInstance {
    constructor(private config: OrchestratorConfig) {
      logger.info('📦 Fallback ZenSwarmOrchestrator initialized with config:', {
        enabled: config.enabled,
        host: config.host,
        port: config.port
      });
    }

    async initialize(): Promise<boolean> {
      logger.warn('⚠️ Fallback mode: initialize() - returning true');
      return true;
    }

    async getStatus(): Promise<string> {
      const status = {
        mode: 'fallback',
        initialized: true,
        services_available: ['fallback-echo'],
        a2a_server_running: false,
        neural_services_enabled: false,
        quantum_backend_available: false,
        websocket_server_running: false,
        last_heartbeat: Date.now()
      };
      return JSON.stringify(status);
    }

    async sendA2AMessage(message: A2AProtocolMessage): Promise<ServiceResult> {
      logger.warn('⚠️ Fallback mode: sendA2AMessage() - returning mock response');
      return {
        success: false,
        error: 'A2A protocol not available in fallback mode',
        execution_time_ms: 1,
        execution_path: 'fallback'
      };
    }

    async executeNeuralService(task: NeuralTaskRequest): Promise<ServiceResult> {
      logger.warn('⚠️ Fallback mode: executeNeuralService() - returning mock response');
      
      // Basic echo service for testing
      if (task.task_type === 'echo' || task.task_type === 'neural-forward') {
        return {
          success: true,
          result: JSON.stringify({ echo: task.input_data, mode: 'fallback' }),
          execution_time_ms: 1,
          execution_path: 'fallback-echo'
        };
      }
      
      return {
        success: false,
        error: `Neural service '${task.task_type}' not available in fallback mode`,
        execution_time_ms: 1,
        execution_path: 'fallback'
      };
    }

    async listServices(): Promise<string[]> {
      return ['fallback-echo', 'fallback-status'];
    }

    async getA2AServerStatus(): Promise<string> {
      return JSON.stringify({ running: false, mode: 'fallback' });
    }

    async getMetrics(): Promise<string> {
      const metrics = {
        mode: 'fallback',
        uptime_seconds: 0,
        total_requests: 0,
        successful_requests: 0,
        failed_requests: 0,
        average_response_time_ms: 1
      };
      return JSON.stringify(metrics);
    }

    async shutdown(): Promise<boolean> {
      logger.info('📦 Fallback ZenSwarmOrchestrator shutdown');
      return true;
    }
  }

  return {
    ZenSwarmOrchestrator: FallbackZenSwarmOrchestrator as ZenSwarmOrchestratorConstructor
  };
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
  private zenSwarmOrchestrator: ZenSwarmOrchestratorInstance | null = null;
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
        if (fallbackMode) {
          logger.warn('⚠️ zen-orchestrator fallback mode initialization completed');
        } else {
          throw new Error('zen-orchestrator initialization returned false');
        }
      }

      this.isInitialized = true;
      
      if (fallbackMode) {
        logger.warn('⚠️ zen-orchestrator initialized in FALLBACK MODE (limited functionality)');
      } else {
        logger.info('✅ zen-orchestrator initialized successfully with native bindings');
      }

      // Log initialization status
      const status = await this.getStatus();
      logger.info('📊 Initialization status:', status.data || {});
    } catch (error) {
      logger.error('❌ Failed to initialize zen-orchestrator:', error);
      
      // If not already in fallback mode, try to create a minimal fallback
      if (!fallbackMode) {
        logger.warn('🔄 Attempting to initialize minimal fallback mode...');
        try {
          fallbackMode = true;
          const fallbackBinding = createFallbackBinding();
          this.zenSwarmOrchestrator = new fallbackBinding.ZenSwarmOrchestrator(this.config);
          await this.zenSwarmOrchestrator.initialize();
          this.isInitialized = true;
          logger.warn('⚠️ zen-orchestrator initialized in EMERGENCY FALLBACK MODE');
          return;
        } catch (fallbackError) {
          logger.error('❌ Emergency fallback also failed:', fallbackError);
        }
      }
      
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
   * Check if running in fallback mode
   */
  isFallbackMode(): boolean {
    return fallbackMode;
  }

  /**
   * Get binding information
   */
  getBindingInfo(): { mode: 'native' | 'fallback', platform?: string, arch?: string } {
    if (fallbackMode) {
      return { mode: 'fallback' };
    }
    return { 
      mode: 'native', 
      platform: platform(), 
      arch: arch()
    };
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

      // Add binding information to status
      const bindingInfo = this.getBindingInfo();
      statusData.binding = bindingInfo;
      
      if (fallbackMode) {
        statusData.warnings = statusData.warnings || [];
        statusData.warnings.push('Running in fallback mode - limited functionality available');
      }

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
      
      // Handle both string (native) and object (fallback) responses
      let statusData;
      statusData = typeof statusJson === 'string' ? JSON.parse(statusJson) : statusJson;

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
      
      // Handle both string (native) and object (fallback) responses
      let metricsData;
      metricsData = typeof metricsJson === 'string' ? JSON.parse(metricsJson) : metricsJson;

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

// ZenOrchestratorIntegration is already exported as a class above
