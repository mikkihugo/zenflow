/**
 * @fileoverview Claude SDK Permission Handler - Security & Access Control
 *
 * Extracted permission handling logic from oversized claude-sdk.ts.
 * Handles tool access permissions and security validation.
 */

import { getLogger} from '@claude-zen/foundation';

import type { CanUseTool, PermissionMode, PermissionResult} from './types';

// Security audit trail
interface PermissionAuditEntry {
  timestamp:number;
  toolName:string;
  params:Record<string, unknown>;
  result:PermissionResult;
  sessionId?:string;
  source?:string;
}

class PermissionAuditor {
  private auditLog:PermissionAuditEntry[] = [];
  private logger = getLogger('permission-auditor');
  private maxEntries = 1000;

  logPermissionCheck(
    toolName:string,
    params:Record<string, unknown>,
    result:PermissionResult,
    sessionId?:string,
    source?:string
  ):void {
    const entry:PermissionAuditEntry = {
      timestamp:Date.now(),
      toolName,
      params:this.sanitizeParams(params),
      result,
      ...(sessionId && { sessionId}),
      ...(source && { source}),
};

    this.auditLog.push(entry);

    // Trim log if too large
    if (this.auditLog['length'] > this.maxEntries) {
      this['auditLog'] = this.auditLog.slice(-this.maxEntries);
}

    // Log security events
    if (!result.allowed) {
      this.logger.warn('Permission denied', {
        toolName,
        reason:result.reason,
        sessionId,
        timestamp:entry.timestamp,
});
} else if (this.isHighRiskTool(toolName)) {
      this.logger.info('High-risk tool allowed', {
        toolName,
        sessionId,
        timestamp:entry.timestamp,
});
}
}

  private sanitizeParams(
    params:Record<string, unknown>
  ):Record<string, unknown> {
    // Remove sensitive data from audit logs
    const sanitized = { ...params};
    const sensitiveKeys = ['password',    'token',    'key',    'secret',    'auth'];

    for (const key of Object.keys(sanitized)) {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        sanitized[key] = '[REDACTED]';
}
}

    return sanitized;
}

  private isHighRiskTool(toolName:string): boolean {
    const highRiskTools = [
      'write_file',      'execute_command',      'delete_file',      'network_request',      'modify_system',      'access_credentials',];
    return highRiskTools.includes(toolName);
}

  getAuditLog():PermissionAuditEntry[] {
    return [...this.auditLog];
}

  clearAuditLog():void {
    this['auditLog'] = [];
    this.logger.info('Audit log cleared');
}

  getSecuritySummary():{
    totalChecks:number;
    deniedCount:number;
    highRiskAllowed:number;
    timeRange:{ start: number; end: number} | null;
} {
    if (this.auditLog['length'] === 0) {
      return {
        totalChecks:0,
        deniedCount:0,
        highRiskAllowed:0,
        timeRange:null,
};
}

    const deniedCount = this.auditLog.filter(
      (entry) => !entry.result.allowed
    ).length;
    const highRiskAllowed = this.auditLog.filter(
      (entry) => entry.result['allowed'] && this.isHighRiskTool(entry.toolName)
    ).length;

    return {
      totalChecks:this.auditLog.length,
      deniedCount,
      highRiskAllowed,
      timeRange:{
        start:this.auditLog[0]?.timestamp || Date.now(),
        end:
          this.auditLog[this.auditLog['length'] - 1]?.timestamp || Date.now(),
},
};
}
}

// Global permission auditor for security monitoring
const globalAuditor = new PermissionAuditor();

// Export for external access and monitoring
export { globalAuditor};

const logger = getLogger('claude-permission-handler');

// =============================================================================
// Permission Handler Implementation
// =============================================================================

/**
 * Create permission handler based on mode
 */
export async function createPermissionHandler(
  mode:PermissionMode,
  _customHandler?:CanUseTool
):Promise<CanUseTool> {
  logger.debug(`Creating permission handler with mode:${mode}`);

  switch (mode) {
    case 'allow-all':
      return createAllowAllHandler();

    case 'deny-all':
      return createDenyAllHandler();

    case 'interactive':
      return createInteractiveHandler();

    case 'custom':
      if (!_customHandler) {
        throw new Error(
          'Custom permission handler is required when using "custom" mode'
        );
}
      return createCustomHandlerWrapper(_customHandler);

    default:
      logger.warn(
        `Unknown permission mode:${mode}, defaulting to interactive`
      );
      return createInteractiveHandler();
}
}

// =============================================================================
// Permission Handler Factories
// =============================================================================

/**
 * Allow all tools - USE WITH CAUTION
 */
function createAllowAllHandler():CanUseTool {
  logger.warn('Using allow-all permission handler - this may be unsafe');

  return async (
    toolName:string,
    params:Record<string, unknown>
  ):Promise<PermissionResult> => {
    logger.debug(`Allowing tool:${toolName}`, {
      toolName,
      paramCount:Object.keys(params).length,
      hasParams:Object.keys(params)['length'] > 0,
});

    const result:PermissionResult = { allowed: true};
    globalAuditor.logPermissionCheck(
      toolName,
      params,
      result,
      'system',
      'allow-all-handler'
    );
    return result;
};
}

/**
 * Deny all tools - Very restrictive
 */
function createDenyAllHandler():CanUseTool {
  logger.info('Using deny-all permission handler - all tools will be blocked');

  return async (
    toolName:string,
    params:Record<string, unknown>
  ):Promise<PermissionResult> => {
    logger.debug(`Denying tool:${toolName}`, {
      toolName,
      paramCount:Object.keys(params).length,
      securityPolicy: 'deny-all',});

    const result = {
      allowed:false,
      reason: 'All tools are denied by security policy',};

    globalAuditor.logPermissionCheck(
      toolName,
      params,
      result,
      'system',
      'deny-all-handler'
    );

    return result;
};
}

/**
 * Interactive handler - Prompts for permission (simplified for foundation)
 */
function createInteractiveHandler():CanUseTool {
  logger.info('Using interactive permission handler');

  return async (
    toolName:string,
    params:Record<string, unknown>
  ):Promise<PermissionResult> => {
    // In a real implementation, this would prompt the user
    // For foundation, we'll use a safe default policy
    const safeFunctions = [
      'read_file',      'list_directory',      'get_environment',      'check_system_info',];

    const riskyFunctions = [
      'write_file',      'execute_command',      'delete_file',      'network_request',      'install_package',];

    // Enhanced logging with parameter analysis for security auditing
    const paramKeys = Object.keys(params);
    const hasFileParams = paramKeys.some(
      (key) =>
        key.toLowerCase().includes('file') || key.toLowerCase().includes(' path')
    );
    const hasNetworkParams = paramKeys.some(
      (key) =>
        key.toLowerCase().includes('url') || key.toLowerCase().includes(' host')
    );

    if (safeFunctions.includes(toolName)) {
      logger.debug(`Auto-allowing safe tool:${toolName}`, {
        toolName,
        paramCount:paramKeys.length,
        hasFileParams,
        classification: 'safe',});

      const result:PermissionResult = { allowed: true};
      globalAuditor.logPermissionCheck(
        toolName,
        params,
        result,
        'system',        'interactive-handler');
      );

      return result;
}

    if (riskyFunctions.includes(toolName)) {
      logger.warn(`Auto-denying risky tool:${toolName}`, {
        toolName,
        paramCount:paramKeys.length,
        hasFileParams,
        hasNetworkParams,
        classification: 'risky',        requiresPermission:true,
});

      const result = {
        allowed:false,
        reason:`Tool ${toolName} requires explicit permission`,
};

      globalAuditor.logPermissionCheck(
        toolName,
        params,
        result,
        'system',        'interactive-handler');
      );

      return result;
}

    // Unknown tools - err on the side of caution
    logger.warn(`Denying unknown tool:${toolName}`, {
      toolName,
      paramCount:paramKeys.length,
      hasFileParams,
      hasNetworkParams,
      classification: 'unknown',});

    const result = {
      allowed:false,
      reason:`Unknown tool ${toolName} not in safe list`,
};

    globalAuditor.logPermissionCheck(
      toolName,
      params,
      result,
      'system',      'interactive-handler')    );

    return result;
};
}

/**
 * Custom handler wrapper with validation
 */
function createCustomHandlerWrapper(customHandler:CanUseTool): CanUseTool {
  logger.info('Using custom permission handler with validation wrapper');

  return async (
    toolName:string,
    params:Record<string, unknown>
  ):Promise<PermissionResult> => {
    try {
      // Validate inputs
      if (!toolName || typeof toolName !== 'string') {
        logger.error('Invalid tool name provided to permission handler');
        return {
          allowed:false,
          reason: 'Invalid tool name',};
}

      if (!params || typeof params !== 'object') {
        logger.error('Invalid parameters provided to permission handler');
        return {
          allowed:false,
          reason: 'Invalid parameters',};
}

      // Call custom handler with timeout
      const timeoutPromise = new Promise<PermissionResult>((_, reject) => {
        setTimeout(
          () => reject(new Error('Permission handler timeout')),
          30000
        );
});

      const handlerPromise = customHandler(toolName, params);

      const result = await Promise.race([handlerPromise, timeoutPromise]);

      // Validate result
      if (
        !result ||
        typeof result !== 'object' ||
        typeof result['allowed'] !== ' boolean')      ) {
        logger.error('Custom permission handler returned invalid result');
        return {
          allowed:false,
          reason: 'Invalid handler response',};
}

      if (!result['allowed'] && !result.reason) {
        logger.warn('Permission denied but no reason provided');
        return {
          ...result,
          reason:result.reason || 'Permission denied by custom handler',};
}

      logger.debug(
        `Custom handler result for ${toolName}:${result['allowed'] ? ' allowed' : ' denied'}`
      );

      globalAuditor.logPermissionCheck(
        toolName,
        params,
        result,
        'custom',        'custom-handler');

      return result;
} catch (error) {
      logger.error('Error in custom permission handler: ', error);
'
      const result = {
        allowed:false,
        reason:`Permission handler error: ${error instanceof Error ? error['message'] : ' Unknown error'}`,
};

      globalAuditor.logPermissionCheck(
        toolName,
        params,
        result,
        'custom',        'custom-handler-error');

      return result;
}
};
}

// =============================================================================
// Permission Validation Utilities
// =============================================================================

/**
 * Validate permission result
 */
export function validatePermissionResult(
  result:unknown
):result is PermissionResult {
  if (!result || typeof result !== 'object') {
    return false;
}

  const r = result as Record<string, unknown>;

  if (typeof r['allowed'] !== ' boolean') {
    return false;
}

  if (!r['allowed'] && typeof r[' reason'] !== ' string') {
    return false;
}

  return true;
}

/**
 * Check if tool is in safe list
 */
export function isToolSafe(toolName:string): boolean {
  const safeFunctions = [
    'read_file',    'list_directory',    'get_environment',    'check_system_info',    'validate_syntax',    'analyze_code',];

  return safeFunctions.includes(toolName);
}

/**
 * Check if tool requires elevated permissions
 */
export function requiresElevatedPermission(toolName:string): boolean {
  const elevatedFunctions = [
    'write_file',    'execute_command',    'delete_file',    'network_request',    'install_package',    'modify_system',    'access_credentials',];

  return elevatedFunctions.includes(toolName);
}
