/**
 * @fileoverview Generic LLM Provider with Pluggable CLI Tools
 *
 * **Enterprise-grade LLM provider abstraction with pluggable CLI tool backends**
 * 
 * This module provides a generic LLM provider that can use different CLI tools 
 * (Claude Code, Gemini CLI, Cursor CLI) through a pluggable provider architecture. 
 * Fully integrated with foundation's Result pattern, error handling, retry logic, 
 * and proper validation.
 *
 * **Key Features:**
 * - **Multi-Provider Support**:Claude Code, GitHub Copilot, Gemini CLI, Cursor CLI
 * - **Swarm Agent Coordination**:7 specialized agent roles for collaborative problem-solving
 * - **Enterprise Error Handling**:Result pattern with comprehensive error codes
 * - **Automatic Retry Logic**:Configurable retry with exponential backoff
 * - **Event-Driven Architecture**:TypedEventBase integration for real-time coordination
 * - **Battle-Tested Validation**:Zod schemas with detailed error messages
 *
 * **Architecture:**
 * ```
 * LLMProvider (Generic Interface)
 *     ├── ClaudeProvider (File operations, agentic development)
 *     ├── GeminiCLI (Reasoning, analysis)
 *     ├── CursorCLI (Code completion, IDE integration)  
 *     └── GitHubCopilotAPI (Conversational AI, inference)
 * ```
 *
 * @package @claude-zen/llm-providers
 * @version 2.1.0
 * @since 1.0.0
 * @access public
 *
 * @example Basic Usage
 * ```typescript`
 * import { LLMProvider} from '@claude-zen/llm-providers';
 *
 * // Create provider with default Claude Code backend
 * const provider = new LLMProvider();
 *
 * // Execute a coding task
 * const result = await provider.executeAsCoder(
 *   'Create a React component for user authentication', *   'TypeScript with hooks and error handling') * );
 *
 * if (result.isOk()) {
 *   logger.info('Code generated: ', result.value);
' *} else {
 *   logger.error('Error: ', result.error.message);
' *}
 * ```
 *
 * @example Swarm Coordination
 * ```typescript`
 * import { LLMProvider, executeSwarmTask} from '@claude-zen/llm-providers';
 *
 * // Multi-agent collaborative task
 * const result = await executeSwarmTask({
 *   description: 'Design and implement a user authentication system', *   agents:[
 *     { role: 'architect', model: ' opus'},
 *     { role: 'coder', model: ' sonnet'},
 *     { role: 'tester', model: ' sonnet'}
 *],
 *   coordination:'sequential') *});
 *
 * // Each agent contributes specialized expertise
 * logger.info('Architecture: ', result[0].output);
' * logger.info('Implementation: ', result[1].output);  
' * logger.info('Test Suite: ', result[2].output);
' * ```
 *
 * @example Advanced Configuration
 * ```typescript`
 * const provider = new LLMProvider('claude-code', {
 *   timeout:60000,          // 1 minute timeout
 *   retries:5,              // 5 retry attempts
 *   retryDelay:2000,        // 2 second delay between retries
 *   maxTokens:100000,       // Large context support
 *   temperature:0.1         // Precise, deterministic output
 *});
 * ```
 */

// Use CLI tools architecture with foundation integration
import {
  err,
  getLogger,
  ok,
  TypedEventBase,
  validateInput,
  withRetry,
  withTimeout,
  z,
} from '@claude-zen/foundation';

import { CLAUDE_SWARM_AGENT_ROLES} from './claude';
import type { CLIProviderConfig, CLIRequest} from './types/cli-providers';
import { CLI_ERROR_CODES} from './types/cli-providers';

// Export CLI types with proper names
export type {
  CLIError,
  CLIMessage,
  CLIProviderConfig,
  CLIRequest,
  CLIResponse,
  CLIResult,
  SwarmAgentRole,
} from './types/cli-providers';
export const SWARM_AGENT_ROLES = CLAUDE_SWARM_AGENT_ROLES;

// Validation schemas using foundation's Zod integration
const cliRequestSchema = z.object({
  messages:z
    .array(
      z.object({
        role:z.enum(['system',    'user',    'assistant']),
        content:z.string().min(1, 'Message content cannot be empty'),
})
    )
    .min(1, 'At least one message is required'),
  model:z.string().optional(),
  temperature:z.number().min(0).max(2).optional(),
  maxTokens:z.number().min(1).max(200000).optional(),
  metadata:z.record(z.unknown()).optional(),
});

const cliProviderConfigSchema = z.object({
  timeout:z.number().min(1000).max(300000).default(30000),
  retries:z.number().min(0).max(5).default(3),
  retryDelay:z.number().min(100).max(10000).default(1000),
  maxTokens:z.number().min(1).max(200000).optional(),
  temperature:z.number().min(0).max(2).optional(),
  metadata:z.record(z.unknown()).optional(),
});

const logger = getLogger('llm-provider');

/**
 * **Enterprise-grade LLM Provider with Pluggable CLI Tool Backends**
 * 
 * Generic LLM provider that can use different CLI tools (Claude Code, Gemini CLI, 
 * Cursor CLI) through a pluggable provider architecture. Provides unified interface
 * for file operations, agentic development, conversational AI, and swarm coordination.
 *
 * **Features:**
 * - **Event-Driven**:Inherits from TypedEventBase for real-time coordination
 * - **Auto-Retry**:Configurable retry logic with exponential backoff  
 * - **Validation**:Zod schema validation for all inputs
 * - **Error Handling**:Result pattern with comprehensive error codes
 * - **Agent Roles**:7 specialized roles (architect, coder, analyst, etc.)
 * - **Provider Switching**:Hot-swap between different CLI tools
 *
 * **Supported Providers:**
 * - `claude-code`:File operations, agentic development (default)`
 * - `github-copilot-api`:Conversational AI, inference  `
 * - `gemini-cli`:Reasoning, analysis`
 * - `cursor-cli`:Code completion, IDE integration`
 *
 * @since 1.0.0
 */
export class LLMProvider extends TypedEventBase {
  private providerId:string;
  private llmConfig:CLIProviderConfig;
  private cliProvider:any;
  private requestCount:number = 0;
  private lastRequestTime:number = 0;

  /**
   * Create a new LLM Provider instance with pluggable CLI backend
   *
   * @param providerId - CLI provider identifier (defaults to 'claude-code')
   *   - `'claude-code'`:Best for file operations and agentic development`
   *   - `'github-copilot-api'`:Best for conversational AI and inference  `
   *   - `'gemini-cli'`:Best for reasoning and analysis`
   *   - `'cursor-cli'`:Best for code completion and IDE integration`
   *
   * @param config - Provider configuration options
   * @param config.timeout - Request timeout in milliseconds (1000-300000, default:30000)
   * @param config.retries - Number of retry attempts (0-5, default:3) 
   * @param config.retryDelay - Delay between retries in milliseconds (100-10000, default:1000)
   * @param config.maxTokens - Maximum tokens for responses (1-200000)
   * @param config.temperature - Randomness in responses (0-2, lower = more deterministic)
   * @param config.metadata - Additional provider-specific metadata
   *
   * @throws {Error} When configuration validation fails or provider initialization fails
   * 
   * @fires provider:initialized - When provider is successfully initialized
   * @fires provider:error - When provider initialization or operation fails
   * @fires provider:ready - When underlying CLI provider is ready for requests
   *
   * @example Basic Usage
   * ```typescript`
   * // Default Claude Code provider
   * const provider = new LLMProvider();
   * 
   * // GitHub Copilot for conversational AI
   * const copilot = new LLMProvider('github-copilot-api');
   * 
   * // Custom configuration  
   * const customProvider = new LLMProvider('claude-code', {
   *   timeout:60000,      // 1 minute timeout
   *   retries:5,          // More retry attempts
   *   temperature:0.1     // Very deterministic
   *});
   * ```
   *
   * @example Event Handling
   * ```typescript`
   * const provider = new LLMProvider();
   * 
   * provider.on('provider:ready', () => {
   *   logger.info('Provider is ready for requests');
   *});
   * 
   * provider.on('provider:error', (error) => {
   *   logger.error('Provider error: ', error.error);
'   *});
   * ```
   */
  constructor(
    providerId:string = 'claude-code',    config:Partial<CLIProviderConfig> = {}
  ) {
    super();
    this['providerId'] = providerId;

    // Validate and set configuration using foundation's validation
    const configResult = validateInput(cliProviderConfigSchema, config);
    if (configResult.isErr()) {
      const _error = new Error(
        `Invalid LLM provider configuration:${configResult.error.message}`
      );
      logger.error('Configuration validation failed', {
        error:configResult.error,
        providerId,
});
      throw error;
}
    this['llmConfig'] = configResult.value;

    // Initialize provider lazily to avoid circular dependencies
    this.initializeProvider().catch((error) => {
      logger.error('Failed to initialize provider', { error, providerId});
      this.emit('provider:error', {
        providerId:this.providerId,
        error:error instanceof Error ? error['message'] : ' Unknown error',        timestamp:Date.now(),
});
});

    // Emit provider initialization event
    this.emit('provider:initialized', {
      providerId:this.providerId,
      config:this.llmConfig,
      timestamp:Date.now(),
});
}

  private async initializeProvider():Promise<void> {
    try {
      // Lazy load based on provider type
      switch (this.providerId) {
        case 'claude-code':{
          const { ClaudeProvider} = await import('./claude/claude-provider');
          this['cliProvider'] = new ClaudeProvider();
          break;
}
        case 'github-models-api':
        case 'github-copilot-api':
          throw new Error(
            `Provider ${this.providerId} is an API provider, not a CLI provider. Use createAPIProvider() instead.`
          );
        case 'cursor-cli':{
          const { CursorCLI} = await import('./cursor');
          this['cliProvider'] = new CursorCLI();
          break;
}
        case 'gemini-cli':{
          const { GeminiCLI} = await import('./gemini');
          this['cliProvider'] = new GeminiCLI();
          break;
}
        default:{
          // Fallback to Claude Code
          const { ClaudeProvider:DefaultProvider} = await import(
            './claude/claude-provider')          );
          this['cliProvider'] = new DefaultProvider();
          break;
}
}

      this.emit('provider:ready', {
        providerId:this.providerId,
        timestamp:Date.now(),
});
} catch (error) {
      this.emit('provider:error', {
        providerId:this.providerId,
        error:error instanceof Error ? error['message'] : ' Unknown error',        timestamp:Date.now(),
});
      throw error;
}
}

  /**
   * Set the agent role for specialized behavior and expertise
   *
   * Changes the provider's behavior to match a specific agent role, enabling
   * specialized responses and capabilities. Essential for swarm coordination
   * where different agents handle different aspects of complex tasks.
   *
   * **Available Roles:**
   * - `'assistant'`:General-purpose conversational assistance`
   * - `'coder'`:Code generation, debugging, file operations  `
   * - `'analyst'`:Data analysis, pattern recognition, insights`
   * - `'researcher'`:Information gathering, fact-checking, citations`
   * - `'coordinator'`:Task delegation, workflow management, team coordination`
   * - `'tester'`:Test case generation, quality assurance, validation`
   * - `'architect'`:System design, technical architecture, scalability`
   *
   * @param roleName - The agent role to adopt from SWARM_AGENT_ROLES
   * 
   * @returns Result<void, CLIError> - Success or detailed error information
   *   - **Success**:Role successfully set, provider behavior updated
   *   - **Error**:Invalid role name or provider not initialized
   *
   * @throws Never throws - all errors returned via Result pattern
   *
   * @example Role-Specific Behavior
   * ```typescript`
   * const provider = new LLMProvider();
   * 
   * // Set as code specialist
   * const result = provider.setRole('coder');
   * if (result.isOk()) {
   *   // Provider now optimized for code generation
   *   const code = await provider.complete('Create a React component');
   *}
   * 
   * // Switch to architecture role  
   * provider.setRole('architect');
   * const design = await provider.complete('Design a microservices architecture');
   * ```
   *
   * @example Swarm Coordination
   * ```typescript`
   * const agents = [
   *   { provider:new LLMProvider(), role:'architect' as const},
   *   { provider:new LLMProvider(), role:'coder' as const},
   *   { provider:new LLMProvider(), role:'tester' as const}
   *];
   * 
   * // Each agent specializes in their domain
   * for (const agent of agents) {
   *   agent.provider.setRole(agent.role);
   *}
   * ```
   *
   * @see {@link SWARM_AGENT_ROLES} for complete role definitions
   * @see {@link getRole} to retrieve current role
   * @see {@link executeSwarmTask} for multi-agent coordination
   */
  setRole(roleName:keyof typeof SWARM_AGENT_ROLES): Result<void, CLIError> {
    if (!this.cliProvider) {
      return err({
        code:CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',        details:{ providerId: this['providerId']},
});
}

    if (!(roleName in SWARM_AGENT_ROLES)) {
      return err({
        code:CLI_ERROR_CODES.ROLE_ERROR,
        message:`Invalid role: ${roleName}`,
        details:{
          providerId:this.providerId,
          availableRoles:Object.keys(SWARM_AGENT_ROLES),
},
});
}

    try {
      const result = this.cliProvider.setRole(roleName);
      logger.debug('Role set successfully', {
        providerId:this.providerId,
        role:roleName,
});
      return result;
} catch (error) {
      return err({
        code:CLI_ERROR_CODES.ROLE_ERROR,
        message:`Failed to set role: ${error instanceof Error ? error['message'] : ' Unknown error'}`,
        details:{ providerId: this.providerId, role:roleName},
        cause:error instanceof Error ? error : undefined,
});
}
}

  // Get current role
  getRole():SwarmAgentRole | undefined {
    return this.cliProvider?.getRole();
}

  // Switch CLI provider
  async switchProvider(providerId:string): Promise<void> {
    if (!this.cliProvider) {
      await this.initializeProvider();
}

    const currentRole = this.cliProvider?.getRole();
    this['providerId'] = providerId;
    this['cliProvider'] = null; // Reset provider
    await this.initializeProvider();

    if (
      currentRole &&
      this['cliProvider'] &&
      'setRole' in this[' cliProvider'] &&
      typeof this.cliProvider['setRole'] === ' function')    )
      this.cliProvider.setRole(currentRole.role);
}

  // Get current provider info
  getProviderInfo():{
    id:string;
    name:string;
    capabilities:CLIProviderCapabilities;
} {
    if (!this.cliProvider) {
      throw new Error(
        'Provider not initialized. Call initializeProvider() first.')      );
}
    return {
      id:this.cliProvider.id,
      name:this.cliProvider.name,
      capabilities:this.cliProvider.getCapabilities(),
};
}

  // Delegate to CLI provider for tool permissions (backward compatibility)

  async chat(request:CLIRequest): Promise<CLIResult> {
    // Validate and prepare the request
    const validationResult = this.validateRequest(request);
    if (validationResult.isErr()) {
      return validationResult;
}

    if (!this.cliProvider) {
      return err({
        code:CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',        details:{ providerId: this['providerId']},
});
}

    this.updateRequestStats();

    try {
      return await this.executeWithRetryAndTimeout(validationResult.value);
} catch (error) {
      return err(this.createErrorFromException(error));
}
}

  private validateRequest(request:CLIRequest): Result<CLIRequest, CLIError> {
    const validationResult = validateInput(cliRequestSchema, request);
    if (validationResult.isErr()) {
      return err({
        code:CLI_ERROR_CODES.VALIDATION_ERROR,
        message:`Invalid request: ${validationResult.error.message}`,
        details:{ providerId: this['providerId']},
});
}
    return ok(validationResult.value);
}

  private updateRequestStats():void {
    this.requestCount++;
    this['lastRequestTime'] = Date.now();
}

  private async executeWithRetryAndTimeout(
    request:CLIRequest
  ):Promise<CLIResult> {
    // Execute with retry logic
    const retryResult = await withRetry(
      async () => await this.cliProvider?.execute(request),
      {
        retries:this.llmConfig.retries,
        minTimeout:this.llmConfig.retryDelay,
}
    );

    if (retryResult.isErr()) {
      return err({
        code:CLI_ERROR_CODES.UNKNOWN_ERROR,
        message:retryResult.error.message,
        cause:retryResult.error,
});
}

    // Apply timeout protection
    const timeout = this.llmConfig['timeout'] || 30000;
    const _result = await withTimeout(
      () => Promise.resolve(retryResult.value),
      timeout,
      `LLM request timed out after ${timeout}ms`
    );

    return this.processResult(result);
}

  private processResult(result:Result<unknown, Error>):CLIResult {
    if (result.isErr()) {
      return err({
        code:CLI_ERROR_CODES.TIMEOUT_ERROR,
        message:result.error.message,
        cause:result.error,
});
}

    this.logSuccessfulRequest(result);

    // Handle successful result
    const actualResult = result.value;
    if (
      actualResult &&
      typeof actualResult === 'object' &&
      'isOk' in actualResult
    ) {
      return actualResult as CLIResult;
}

    return ok(actualResult as CLIResponse);
}

  private logSuccessfulRequest(result:Result<unknown, Error>):void {
    logger.debug('Request completed successfully', {
      providerId:this.providerId,
      requestCount:this.requestCount,
      responseLength:
        result &&
        typeof result === 'object' &&
        'isOk' in result &&
        result.isOk() &&
        typeof result['value'] === ' string')          ? result.value.length
          :0,
});
}

  private createErrorFromException(error:unknown): CLIError {
    const cliError:CLIError = {
      code:CLI_ERROR_CODES.UNKNOWN_ERROR,
      message:`LLM request failed: ${error instanceof Error ? error['message'] : ' Unknown error'}`,
      details:{
        providerId:this.providerId,
        requestCount:this.requestCount,
        configuredTimeout:this.llmConfig.timeout,
        configuredRetries:this.llmConfig.retries,
},
      cause:error instanceof Error ? error : undefined,
};

    if (error instanceof Error) {
      cliError['code'] = this.determineErrorCode(error.message);
}

    logger.error('CLI provider call failed', {
      error:cliError,
      providerId:this.providerId,
});

    return cliError;
}

  private determineErrorCode(message:string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('timeout')) {
      return CLI_ERROR_CODES.TIMEOUT_ERROR;
}
    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('connection')
    ) {
      return CLI_ERROR_CODES.NETWORK_ERROR;
}
    if (
      lowerMessage.includes('auth') ||
      lowerMessage.includes('unauthorized')
    ) {
      return CLI_ERROR_CODES.AUTH_ERROR;
}
    if (lowerMessage.includes('rate limit')) {
      return CLI_ERROR_CODES.RATE_LIMIT_ERROR;
}

    return CLI_ERROR_CODES.UNKNOWN_ERROR;
}

  // =============================================================================
  // ROLE-SPECIFIC EXECUTION METHODS - Specialized agent behaviors
  // =============================================================================

  /**
   * Execute a task using the Assistant agent role
   *
   * General-purpose conversational assistance for open-ended tasks, 
   * Q&A, explanations, and general problem-solving. Best for tasks
   * that don't require specialized domain expertise.
   *
   * @param prompt - The task or question to process
   * @param options - Optional CLI request configuration
   * @param options.model - Specific model to use ('sonnet' | ' opus')
   * @param options.temperature - Randomness level (0-2, default varies by provider)  
   * @param options.maxTokens - Maximum response length
   *
   * @returns Promise<Result<string, CLIError>> - Assistant response or error details
   *
   * @example General Assistance
   * ```typescript`
   * const provider = new LLMProvider();
   * const result = await provider.executeAsAssistant(
   *   "Explain the concept of microservices architecture"
   * );
   * 
   * if (result.isOk()) {
   *   logger.info('Explanation: ', result.value);
'   *}
   * ```
   */
  executeAsAssistant(
    prompt:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('assistant');
    if (roleResult.isErr()) {
      return err(roleResult.error);
}
    return this.complete(prompt, options);
}

  /**
   * Execute a task using the Coder agent role  
   *
   * **Specialized for code generation, debugging, and file operations.** 
   * Optimized for software development tasks including writing functions,
   * debugging issues, code reviews, and technical implementations.
   *
   * @param task - The coding task to accomplish
   * @param context - Optional context about the codebase, requirements, or constraints
   * @param options - Optional CLI request configuration
   * @param options.model - Specific model to use ('sonnet' recommended for code)
   * @param options.temperature - Lower values (0.1-0.3) recommended for deterministic code
   *
   * @returns Promise<Result<string, CLIError>> - Generated code or error details
   *
   * @example Basic Code Generation
   * ```typescript`
   * const provider = new LLMProvider();
   * const result = await provider.executeAsCoder(
   *   "Create a React component for user authentication",
   *   "TypeScript, use hooks, include error handling"
   * );
   * 
   * if (result.isOk()) {
   *   logger.info('Generated code: ', result.value);
'   *}
   * ```
   *
   * @example Complex Implementation
   * ```typescript`
   * const context = `
   * Existing codebase uses:
   * - Next.js 14 with app router
   * - Tailwind CSS for styling  
   * - Zod for validation
   * - Custom auth context at /lib/auth
   * `;
   * 
   * const result = await provider.executeAsCoder(
   *   "Create a protected route HOC with role-based access",
   *   context,
   *   { temperature:0.1} // Very deterministic for code
   * );
   * ```
   */
  executeAsCoder(
    task:string,
    context?:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('coder');
    if (roleResult.isErr()) {
      return err(roleResult.error);
}

    const prompt = context
      ? `Coding task:${task}\n\nContext:\n${context}\n\nPlease provide the code solution:`
      :`Coding task: ${task}`;
    return this.complete(prompt, options);
}

  executeAsAnalyst(
    data:string,
    analysisType:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('analyst');
    if (roleResult.isErr()) {
      return err(roleResult.error);
}

    const prompt = `Analysis type:${analysisType}\n\nData to analyze:\n${data}\n\nPlease provide your analysis:`;
    return this.complete(prompt, options);
}

  executeAsResearcher(
    topic:string,
    scope?:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('researcher');
    if (roleResult.isErr()) {
      return err(roleResult.error);
}

    const prompt = scope
      ? `Research topic:${topic}\nScope:${scope}\n\nPlease provide comprehensive research:`
      :`Research topic: ${topic}\n\nPlease provide comprehensive research:`;
    return this.complete(prompt, options);
}

  executeAsCoordinator(
    task:string,
    teamContext?:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('coordinator');
    if (roleResult.isErr()) {
      return err(roleResult.error);
}

    const prompt = teamContext
      ? `Coordination task:${task}\nTeam context:${teamContext}\n\nPlease provide coordination plan:`
      :`Coordination task: ${task}\n\nPlease provide coordination plan:`;
    return this.complete(prompt, options);
}

  executeAsTester(
    feature:string,
    requirements?:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('tester');
    if (roleResult.isErr()) {
      return err(roleResult.error);
}

    const prompt = requirements
      ? `Feature to test:${feature}\nRequirements:${requirements}\n\nPlease provide test plan and cases:`
      :`Feature to test: ${feature}\n\nPlease provide test plan and cases:`;
    return this.complete(prompt, options);
}

  executeAsArchitect(
    system:string,
    requirements?:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>> {
    const roleResult = this.setRole('architect');
    if (roleResult.isErr()) {
      return err(roleResult.error);
}

    const prompt = requirements
      ? `System to architect:${system}\nRequirements:${requirements}\n\nPlease provide architectural design:`
      :`System to architect: ${system}\n\nPlease provide architectural design:`;
    return this.complete(prompt, options);
}

  // Helper for simple text completion with Result pattern
  complete(
    prompt:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>> {
    if (!this.cliProvider) {
      return err({
        code:CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',        details:{ providerId: this['providerId']},
});
}

    return this.cliProvider.complete(prompt, options);
}

  // Helper for analysis tasks with Result pattern
  async analyze(
    task:string,
    data:string,
    options?:Partial<CLIRequest>
  ):Promise<Result<string, CLIError>> {
    const prompt = `Task:${task}\n\nData to analyze:\n${data}\n\nPlease provide your analysis:`;
    return this.complete(prompt, options);
}

  // Direct task execution using CLI provider with Result pattern
  executeTask(
    prompt:string,
    options?:Record<string, unknown>
  ):Promise<Result<unknown, CLIError>> {
    if (!this.cliProvider) {
      return err({
        code:CLI_ERROR_CODES.UNKNOWN_ERROR,
        message: 'CLI provider not initialized',        details:{ providerId: this['providerId']},
});
}

    return this.cliProvider.executeTask(prompt, options);
}

  // Get usage statistics
  getUsageStats():{
    requestCount:number;
    lastRequestTime:number;
    currentRole?:string;
    provider?:string;
} {
    const providerStats = this.cliProvider?.getUsageStats() || {
      requestCount:0,
      lastRequestTime:0,
};
    return {
      requestCount:this['requestCount'] + (providerStats.requestCount || 0),
      lastRequestTime:Math.max(
        this.lastRequestTime,
        providerStats.lastRequestTime || 0
      ),
      currentRole:providerStats.currentRole,
      provider:this.cliProvider?.id || this.providerId,
};
}

  // All CLI implementation now handled by pluggable providers
}

// Singleton instance for shared usage
let globalLLM:LLMProvider | null = null;

export function getGlobalLLM(providerId?:string): LLMProvider {
  if (!globalLLM || providerId) {
    globalLLM = new LLMProvider(providerId); // Defaults to Claude provider with'coder' role
    globalLLM.setRole('coder'); // Set coder role with dangerous permissions
}
  return globalLLM;
}

export function setGlobalLLM(llm:LLMProvider): void {
  globalLLM = llm;
}

// Provider-specific convenience functions
export function getClaudeLLM():LLMProvider {
  return getGlobalLLM('claude-code');
}

export function getGeminiLLM():LLMProvider {
  return getGlobalLLM('gemini-cli');
}

export function getCursorLLM():LLMProvider {
  return getGlobalLLM('cursor-cli');
}

// =============================================================================
// SWARM COORDINATION - Multi-agent collaborative task execution
// =============================================================================

/**
 * **Configuration for multi-agent collaborative task execution**
 * 
 * Defines a complex task that requires multiple specialized agents working
 * together. Each agent brings domain expertise and the coordination strategy
 * determines how they interact.
 */
export interface SwarmTask {
  /** The main task description that all agents will work on */
  description:string;
  
  /** Array of specialized agents with their roles and model preferences */
  agents:Array<{
    /** Agent role determining behavior and expertise area */
    role:keyof typeof SWARM_AGENT_ROLES;
    /** Preferred model for this agent ('sonnet' for speed, ' opus' for quality) */
    model?:'sonnet' | ' opus';
}>;
  
  /** Coordination strategy - 'sequential' builds on previous work, ' parallel' works independently */
  coordination?:'parallel' | ' sequential';
}

/**
 * **Result from a single agent in a swarm task**
 * 
 * Contains the agent's contribution to the overall task, including
 * their specialized perspective and any errors encountered.
 */
export interface SwarmTaskResult {
  /** The agent role that produced this result */
  role:string;
  /** The agent's contribution or error message */
  output:string;
}

/**
 * Execute a complex task using multiple specialized AI agents
 *
 * **Multi-agent swarm coordination for complex problem-solving.** Leverages
 * specialized agent roles working together on a single task. Each agent contributes
 * their domain expertise, and the coordination strategy determines how they interact.
 *
 * **Agent Specializations:**
 * - `architect`:System design, technical architecture, scalability planning`
 * - `coder`:Implementation, debugging, code generation  `
 * - `analyst`:Data analysis, pattern recognition, insights`
 * - `researcher`:Information gathering, fact-checking, citations`
 * - `coordinator`:Task delegation, workflow management, team coordination`
 * - `tester`:Test case generation, quality assurance, validation`
 * - `assistant`:General support, documentation, explanations`
 *
 * **Coordination Strategies:**
 * - `sequential`:Agents build on each other's work (default)`
 * - `parallel`:Agents work independently for diverse perspectives`
 *
 * @param task - Swarm task configuration with agents and coordination strategy
 * @param task.description - The main task all agents will work on
 * @param task.agents - Array of agents with roles and model preferences  
 * @param task.coordination - How agents coordinate ('sequential' | ' parallel')
 *
 * @returns Promise<SwarmTaskResult[]> - Results from each agent in execution order
 *
 * @example Software Architecture Design
 * ```typescript`
 * import { executeSwarmTask} from '@claude-zen/llm-providers';
 * 
 * const results = await executeSwarmTask({
 *   description: 'Design a scalable e-commerce platform architecture', *   agents:[
 *     { role: 'architect', model: ' opus'},    // High-level design
 *     { role: 'coder', model: ' sonnet'},      // Implementation details  
 *     { role: 'tester', model: ' sonnet'}      // Testing strategy
 *],
 *   coordination:'sequential'  // Each builds on the previous
 *});
 * 
 * logger.info('Architecture: ', results[0].output);
' * logger.info('Implementation Plan: ', results[1].output);
' * logger.info('Testing Strategy: ', results[2].output);
' * ```
 *
 * @example Research and Analysis  
 * ```typescript`
 * const results = await executeSwarmTask({
 *   description: 'Analyze market trends for AI development tools', *   agents:[
 *     { role: 'researcher', model: ' opus'},   // Gather information
 *     { role: 'analyst', model: ' opus'},      // Analyze data
 *     { role: 'coordinator', model: ' sonnet'} // Synthesize insights
 *],
 *   coordination:'sequential') *});
 * ```
 *
 * @example Parallel Perspectives
 * ```typescript  `
 * const results = await executeSwarmTask({
 *   description: 'Evaluate database options for high-traffic application', *   agents:[
 *     { role: 'architect', model: ' opus'},    // Architecture perspective
 *     { role: 'coder', model: ' sonnet'},      // Implementation perspective
 *     { role: 'analyst', model: ' opus'}       // Performance perspective
 *],
 *   coordination:'parallel'  // Independent evaluations
 *});
 * ```
 *
 * @since 1.0.0
 */
export async function executeSwarmTask(
  task:SwarmTask
):Promise<SwarmTaskResult[]> {
  const results:SwarmTaskResult[] = [];

  if (task['coordination'] === ' sequential') {
    // Sequential execution - reuse global LLM
    const llm = getGlobalLLM();
    for (const agent of task.agents) {
      const roleResult = llm.setRole(agent.role);
      if (roleResult.isErr()) {
        results.push({
          role:agent.role,
          output:`Role error: ${roleResult.error.message}`,
});
        continue;
}

      const result = await llm.complete(task.description, {
        model:agent.model || 'sonnet',});

      results.push({
        role:agent.role,
        output:result.isOk()
          ? result['value']
          :`Error: ${result.error.message}`,
});
}
} else {
    // Parallel execution - create separate LLM instances
    const promises = task.agents.map(async (agent) => {
      const agentLLM = new LLMProvider();
      const roleResult = agentLLM.setRole(agent.role);
      if (roleResult.isErr()) {
        return {
          role:agent.role,
          output:`Role error: ${roleResult.error.message}`,
};
}

      const result = await agentLLM.complete(task.description, {
        model:agent.model || 'sonnet',});

      return {
        role:agent.role,
        output:result.isOk()
          ? result['value']
          :`Error: ${result.error.message}`,
};
});

    results.push(...(await Promise.all(promises)));
}

  return results;
}
