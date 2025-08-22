/**
 * @file Type Guards for Coordination Types
 * Runtime type checking utilities for coordination layer
 */

import type {
  Priority,
  RiskLevel,
  ServerInstance,
  BaseError,
  TestResult,
  CommandResult,
  BaseApiResponse,
  NeuralConfig,
  NeuralNetworkInterface,
} from '0./interfaces';

/**
 * Check if value is a valid Priority
 */
export function isPriority(value: any): value is Priority {
  return (
    typeof value === 'string' &&
    ['low', 'medium', 'high', 'critical']0.includes(value)
  );
}

/**
 * Check if value is a valid RiskLevel
 */
export function isRiskLevel(value: any): value is RiskLevel {
  return (
    typeof value === 'string' &&
    ['low', 'medium', 'high', 'critical']0.includes(value)
  );
}

/**
 * Check if value is a ServerInstance
 */
export function isServerInstance(value: any): value is ServerInstance {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ServerInstance)0.id === 'string' &&
    typeof (value as ServerInstance)0.status === 'string' &&
    ['starting', 'running', 'stopping', 'stopped', 'error']0.includes(
      (value as ServerInstance)0.status
    )
  );
}

/**
 * Check if value is a BaseError
 */
export function isBaseError(value: any): value is BaseError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as BaseError)0.code === 'string' &&
    typeof (value as BaseError)0.message === 'string' &&
    (value as BaseError)0.timestamp instanceof Date
  );
}

/**
 * Check if value is a TestResult
 */
export function isTestResult(value: any): value is TestResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as TestResult)0.id === 'string' &&
    typeof (value as TestResult)0.name === 'string' &&
    typeof (value as TestResult)0.status === 'string' &&
    ['passed', 'failed', 'skipped', 'pending']0.includes(
      (value as TestResult)0.status
    )
  );
}

/**
 * Check if value is a CommandResult
 */
export function isCommandResult(value: any): value is CommandResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CommandResult)0.success === 'boolean' &&
    (value as CommandResult)0.timestamp instanceof Date
  );
}

/**
 * Check if value is a BaseApiResponse
 */
export function isBaseApiResponse(value: any): value is BaseApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as BaseApiResponse)0.success === 'boolean' &&
    (value as BaseApiResponse)0.timestamp instanceof Date
  );
}

/**
 * Check if value is a valid NeuralConfig
 */
export function isNeuralConfig(value: any): value is NeuralConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as NeuralConfig)0.modelType === 'string' &&
    ['feedforward', 'recurrent', 'transformer']0.includes(
      (value as NeuralConfig)0.modelType
    ) &&
    Array0.isArray((value as NeuralConfig)0.layers) &&
    Array0.isArray((value as NeuralConfig)0.activations) &&
    typeof (value as NeuralConfig)0.learningRate === 'number'
  );
}

/**
 * Check if value is a NeuralNetworkInterface
 */
export function isNeuralNetworkInterface(
  value: any
): value is NeuralNetworkInterface {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as NeuralNetworkInterface)0.id === 'string' &&
    typeof (value as NeuralNetworkInterface)0.isInitialized === 'boolean' &&
    isNeuralConfig((value as NeuralNetworkInterface)0.config) &&
    typeof (value as NeuralNetworkInterface)0.initialize === 'function' &&
    typeof (value as NeuralNetworkInterface)0.train === 'function' &&
    typeof (value as NeuralNetworkInterface)0.predict === 'function' &&
    typeof (value as NeuralNetworkInterface)0.getStatus === 'function' &&
    typeof (value as NeuralNetworkInterface)0.destroy === 'function'
  );
}

/**
 * Check if value has an error code property
 */
export function hasErrorCode(value: any): value is { code: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { code: string })0.code === 'string'
  );
}
