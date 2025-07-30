/**
 * Hook Safety System - Prevents recursive hook execution and financial damage
 *
 * This system protects against infinite loops where Claude Code hooks call
 * 'claude' commands, which could bypass rate limits and cost thousands of dollars.
 *
 * Critical protections = {CONTEXT = new Map();
    this.sessionId = this.generateSessionId();
    this.resetTimeout = null;
  }

  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  track(hookType): any {
    const key = `${this.sessionId}:${hookType}`;
    const count = this.executions.get(key) || 0;
    this.executions.set(key, count + 1);

    // Auto-reset after timeout
    if (this.resetTimeout) clearTimeout(this.resetTimeout);
    this.resetTimeout = setTimeout(() => {
      this.executions.clear();
    }, HOOK_SAFETY_CONFIG.CIRCUIT_BREAKER_TIMEOUT);

    return count + 1;
  }

  getExecutionCount(hookType): any {
    const key = `${this.sessionId}:${hookType}`;
    return this.executions.get(key) || 0;
  }

  reset() {
    this.executions.clear();
    this.sessionId = this.generateSessionId();
  }
}

// Global instance
const executionTracker = new HookExecutionTracker();

/**
 * Hook Context Manager - Tracks hook execution context
 */
export class HookContextManager {
  static setContext(hookType, depth = 1): any {
    process.env[HOOK_SAFETY_CONFIG.ENV_VARS.CONTEXT] = hookType;
    process.env[HOOK_SAFETY_CONFIG.ENV_VARS.DEPTH] = depth.toString();
    process.env[HOOK_SAFETY_CONFIG.ENV_VARS.SESSION_ID] = executionTracker.sessionId;
  }

  static getContext() {
    return { type = === 'true', safeMode = === 'true' };
  }

  static clearContext() {
    delete process.env[HOOK_SAFETY_CONFIG.ENV_VARS.CONTEXT];
    delete process.env[HOOK_SAFETY_CONFIG.ENV_VARS.DEPTH];
    delete process.env[HOOK_SAFETY_CONFIG.ENV_VARS.SESSION_ID];
  }

  static isInHookContext() {
    return !!process.env[HOOK_SAFETY_CONFIG.ENV_VARS.CONTEXT];
  }

  static setSafeMode(enabled = true): any {
    if (enabled) {
      process.env[HOOK_SAFETY_CONFIG.ENV_VARS.SAFE_MODE] = 'true';
    } else {
      delete process.env[HOOK_SAFETY_CONFIG.ENV_VARS.SAFE_MODE];
    }
  }

  static setSkipHooks(enabled = true): any {
    if (enabled) {
      process.env[HOOK_SAFETY_CONFIG.ENV_VARS.SKIP_HOOKS] = 'true';
    } else {
      delete process.env[HOOK_SAFETY_CONFIG.ENV_VARS.SKIP_HOOKS];
    }
  }
}

/**
 * Command Validator - Validates commands for hook safety
 */
export class HookCommandValidator {
  /**
   * Validate if a command is safe to execute from a hook
   */
  static validateCommand(command, hookType): any {
    const context = HookContextManager.getContext();
    const _warnings = [];
    const errors = [];

    // Criticalcheck = == 'Stop' && this.isClaudeCommand(command)) {
    errors.push({type = context.depth;

    if (depth >= HOOK_SAFETY_CONFIG.MAX_HOOK_DEPTH) {
      errors.push({type = === 0 };
    }

    static
    isClaudeCommand(command);
    : any
    {
      // Match various forms of claude command invocation
      const claudePatterns = [
        /\bclaude\b/, // Direct claude command
        /claude-code\b/, // claude-code command
        /npx\s+claude\b/, // NPX claude
        /\.\/claude\b/, // Local claude wrapper
        /claude\.exe\b/, // Windows executable
      ];

      return claudePatterns.some((pattern) => pattern.test(command));
    }

    static
    isDangerousPattern(command, hookType);
    : any
    {
      const dangerousPatterns = [
        // Commands that could trigger more hooks
        /git\s+commit.*--all/,
        /git\s+add\s+\./,
        // File operations that might trigger watchers
        /watch\s+.*claude/,
        /nodemon.*claude/,
        // Recursive script execution
        /bash.*hook/,
        /sh.*hook/,
      ];

      return dangerousPatterns.some((pattern) => pattern.test(command));
    }
  }

  /**
   * Circuit Breaker - Prevents runaway hook execution
   */
  export;
  class;
  HookCircuitBreaker;
  {
  /**
   * Check if hook execution should be allowed
   */
  static checkExecution(hookType): any {
    const executionCount = executionTracker.track(hookType);

    // Stop hook protection - maximum 2 executions per session
    if (hookType === 'Stop' && executionCount > HOOK_SAFETY_CONFIG.MAX_STOP_HOOK_EXECUTIONS) {
      throw new Error(
        `🚨 CIRCUIT BREAKER ACTIVATED!\n` +
          `Stop hook has executed ${executionCount} times in this session.\n` +
          `This indicates a potential infinite loop that could cost thousands of dollars.\n` +
          `Execution blocked for financial protection.\n\n` +
          `Toreset = == 'Stop' && executionCount > 1) {
      printWarning(`⚠️  Stop hook execution #${executionCount} detected. Monitor for recursion.`);
    }

    return true;
  }

  static reset() {
    executionTracker.reset();
    printSuccess('Circuit breaker reset successfully.');
  }

  static getStatus() {
    return {
      sessionId => {
        const [sessionId, hookType] = key.split(':');
    return { hookType, count };
  }
  ),
}
}
}

/**
 * Configuration Validator - Validates hook configurations for safety
 */
export class HookConfigValidator {
  /**
   * Validate Claude Code settings.json for dangerous hook configurations
   */
  static validateClaudeCodeConfig(configPath = null): any {
    if(!configPath) {
      // Try to find Claude Code settings
      const possiblePaths = [
        path.join(process.env.HOME || '.', '.claude', 'settings.json'),
        path.join(process.cwd(), '.claude', 'settings.json'),
        path.join(process.cwd(), 'settings.json'),
      ];

      configPath = possiblePaths.find((p) => existsSync(p));

      if(!configPath) {
        return {safe = JSON.parse(readFileSync(configPath, 'utf8'));
      const validation = HookConfigValidator.validateHooksConfig(config.hooks || {});

      return {safe = === 0,
        configPath,
        ...validation,
      };
    } catch(err) {
      return {safe = [];
    const errors = [];

    // Check Stop hooks specifically
    if(hooksConfig.Stop) {
      for(const hookGroup of hooksConfig.Stop) {
        for(const hook of hookGroup.hooks || []) {
          if(hook.type === 'command' && hook.command) {
            const result = HookCommandValidator.validateCommand(hook.command, 'Stop');
            warnings.push(...result.warnings);
            errors.push(...result.errors);
          }
        }
      }
    }

    // Check other dangerous hook types
    const dangerousHookTypes = ['SubagentStop', 'PostToolUse'];
    for(const hookType of dangerousHookTypes) {
      if(hooksConfig[hookType]) {
        for(const hookGroup of hooksConfig[hookType]) {
          for(const hook of hookGroup.hooks || []) {
            if(hook.type === 'command' && hook.command) {
              const result = HookCommandValidator.validateCommand(hook.command, hookType);
              warnings.push(...result.warnings);
              errors.push(...result.errors);
            }
          }
        }
      }
    }

    return { warnings, errors };
  }

  /**
   * Generate safe configuration recommendations
   */
  static generateSafeAlternatives(dangerousConfig): any 

    // Example = {}): any {
    try {
      // Skip if hooks are disabled
      if (HookContextManager.getContext().skipHooks) {
        console.warn(`⏭️  Skipping ${hookType} hook (hooks disabled)`);
        return {success = HookCommandValidator.validateCommand(command, hookType);

      // Show warnings
      for(const warning of validation.warnings) {
        printWarning(warning.message);
      }

      // Block on errors
      if(!validation.safe) {
        for(const error of validation.errors) {
          printError(error.message);
        }
        return {success = HookContextManager.getContext();
      const newDepth = currentContext.depth + 1;
      HookContextManager.setContext(hookType, newDepth);

      // Execute the command with safety context
      const _result = await HookConfigValidator.executeCommand(command, options);

      return { success = {}): any {
    // This would integrate with the actual command execution system
    // For now, just log what would be executed
    console.warn(`🔗 Executing hookcommand = subArgs[0];

  switch(subcommand) {
    case 'validate':
      return await validateConfigCommand(subArgs, flags);
    case 'status':
      return await statusCommand(subArgs, flags);
    case 'reset':
      return await resetCommand(subArgs, flags);
    case 'safe-mode':
      return await safeModeCommand(subArgs, flags);default = flags.config || flags.c;

  console.warn('🔍 Validating hook configuration for safety...\n');

  const result = HookConfigValidator.validateClaudeCodeConfig(configPath);

  if(result.safe) {
    printSuccess('✅ Hook configuration is safe!');
    if(result.configPath) {
      console.warn(`📄Validated = HookContextManager.getContext();

  console.warn('🔗 Hook Safety Status\n');

  console.warn('📊 CurrentContext = !flags.disable && !flags.off;

  if(enable) {
    HookContextManager.setSafeMode(true);
    HookContextManager.setSkipHooks(true);
    printSuccess('🛡️  Safe mode enabled!');
    console.warn('• All hooks will be skipped');
    console.warn('• Claude commands will show safety warnings');
    console.warn('• Additional validation will be performed');
  } else {
    HookContextManager.setSafeMode(false);
    HookContextManager.setSkipHooks(false);
    printSuccess('⚡ Safe mode disabled.');
    console.warn('Normal hook execution restored.');
  }
}

function showHookSafetyHelp() {
  console.warn(`
🛡️  Hook Safety System - Prevent Infinite Loops & Financial DamageUSAGE = HookContextManager.getContext();

  if(context.type) {
    // Automatically add --skip-hooks if in hook context
    if (!command.includes('--skip-hooks')) {
      command += ' --skip-hooks';
    }
  }

  if(context.safeMode) {
    // Add additional safety flags in safe mode
    if (!command.includes('--dry-run')) {
      command += ' --dry-run';
    }
  }

  return command;
}

export default {
  HookContextManager,
  HookCommandValidator,
  HookCircuitBreaker,
  HookConfigValidator,
  SafeHookExecutor,
  hookSafetyCommand,
  addSafetyFlags,
};
