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
} from './interfaces';

/**
 * Check if value is a valid Priority
 */
export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && 
    ['low', 'medium', 'high', 'critical'].includes(value);
}

/**
 * Check if value is a valid RiskLevel
 */
export function isRiskLevel(value: unknown): value is RiskLevel {
  return typeof value === 'string' && 
    ['low', 'medium', 'high', 'critical'].includes(value);
}

/**
 * Check if value is a ServerInstance
 */
export function isServerInstance(value: unknown): value is ServerInstance {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ServerInstance).id === 'string' &&
    typeof (value as ServerInstance).status === 'string' &&
    ['starting', 'running', 'stopping', 'stopped', 'error'].includes(
      (value as ServerInstance).status
    )
  );
}

/**
 * Check if value is a BaseError
 */
export function isBaseError(value: unknown): value is BaseError {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as BaseError).code === 'string' &&
    typeof (value as BaseError).message === 'string' &&
    (value as BaseError).timestamp instanceof Date
  );
}

/**
 * Check if value is a TestResult
 */
export function isTestResult(value: unknown): value is TestResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as TestResult).id === 'string' &&
    typeof (value as TestResult).name === 'string' &&
    typeof (value as TestResult).status === 'string' &&
    ['passed', 'failed', 'skipped', 'pending'].includes(
      (value as TestResult).status
    )
  );
}

/**
 * Check if value is a CommandResult
 */
export function isCommandResult(value: unknown): value is CommandResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as CommandResult).success === 'boolean' &&
    (value as CommandResult).timestamp instanceof Date
  );
}

/**
 * Check if value is a BaseApiResponse
 */
export function isBaseApiResponse(value: unknown): value is BaseApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as BaseApiResponse).success === 'boolean' &&
    (value as BaseApiResponse).timestamp instanceof Date
  );
}

/**
 * Check if value is a valid NeuralConfig
 */
export function isNeuralConfig(value: unknown): value is NeuralConfig {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as NeuralConfig).modelType === 'string' &&
    ['feedforward', 'recurrent', 'transformer'].includes(
      (value as NeuralConfig).modelType
    ) &&
    Array.isArray((value as NeuralConfig).layers) &&
    Array.isArray((value as NeuralConfig).activations) &&
    typeof (value as NeuralConfig).learningRate === 'number'
  );
}

/**
 * Check if value is a NeuralNetworkInterface
 */
export function isNeuralNetworkInterface(
  value: unknown
): value is NeuralNetworkInterface {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as NeuralNetworkInterface).id === 'string' &&
    typeof (value as NeuralNetworkInterface).isInitialized === 'boolean' &&
    isNeuralConfig((value as NeuralNetworkInterface).config) &&
    typeof (value as NeuralNetworkInterface).initialize === 'function' &&
    typeof (value as NeuralNetworkInterface).train === 'function' &&
    typeof (value as NeuralNetworkInterface).predict === 'function' &&
    typeof (value as NeuralNetworkInterface).getStatus === 'function' &&
    typeof (value as NeuralNetworkInterface).destroy === 'function'
  );
}

/**
 * Check if value has an error code property
 */
export function hasErrorCode(value: unknown): value is { code: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { code: string }).code === 'string'
  );
}