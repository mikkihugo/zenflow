/**
 * Error Types and Classes
 *
 * Provides standardized error handling for the Claude-Zen system
 */

export class SystemError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'SystemError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(
    message: string,
    public readonly resource?: string
  ) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class TimeoutError extends Error {
  constructor(
    message: string,
    public readonly timeoutMs?: number
  ) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ConfigurationError extends Error {
  constructor(
    message: string,
    public readonly configKey?: string
  ) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class AgentError extends Error {
  constructor(
    message: string,
    public readonly agentId?: string
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

export class SwarmError extends Error {
  constructor(
    message: string,
    public readonly swarmId?: string
  ) {
    super(message);
    this.name = 'SwarmError';
  }
}

export class TaskError extends Error {
  constructor(
    message: string,
    public readonly taskId?: string
  ) {
    super(message);
    this.name = 'TaskError';
  }
}

export class MCPError extends Error {
  constructor(
    message: string,
    public readonly toolName?: string
  ) {
    super(message);
    this.name = 'MCPError';
  }
}
