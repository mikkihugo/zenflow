# AI-Friendly Documentation Standards

## Overview

This document outlines the JSDoc/TSDoc standards optimized for AI consumption and human readability in the Claude Code Zen project.

## Core Principles

1. **Clarity First**: Descriptions should be clear and unambiguous
2. **Type Safety**: Always specify exact types, not generics
3. **Examples Always**: Concrete usage examples for complex APIs
4. **Event Documentation**: Use `@fires` for event-driven systems
5. **Error Conditions**: Document all possible error states

## Essential Tags for AI

### Required Tags

#### `@description`
Clear, detailed descriptions of what the function/class/interface does.

```typescript
/**
 * @description Manages swarm coordination and agent lifecycle in the Claude Code Zen system.
 * Provides high-level orchestration capabilities for multi-agent workflows.
 */
class SwarmManager {
```

#### `@param`
Type-safe parameter documentation with detailed descriptions.

```typescript
/**
 * @param {string} agentId - Unique identifier for the agent (UUID format)
 * @param {AgentConfig} config - Configuration object containing capabilities and constraints
 * @param {number} [timeout=30000] - Maximum time in milliseconds to wait for agent response
 */
async spawnAgent(agentId: string, config: AgentConfig, timeout?: number): Promise<Agent>
```

#### `@returns`
Specific return type information with detailed explanation.

```typescript
/**
 * @returns {Promise<SwarmResult<Agent>>} Promise that resolves to SwarmResult containing
 *   the spawned agent on success, or error details on failure
 */
```

#### `@example`
Concrete usage examples - most important for AI understanding.

```typescript
/**
 * @example
 * ```typescript
 * const swarm = new SwarmManager();
 * const agent = await swarm.spawnAgent('agent-001', {
 *   type: 'researcher',
 *   capabilities: ['web-search', 'document-analysis'],
 *   maxConcurrency: 5
 * });
 * 
 * if (agent.success) {
 *   console.log('Agent spawned:', agent.data.id);
 * }
 * ```
 */
```

### Event System Tags

#### `@fires` (Keep These!)
Document which events a method fires - critical for event-driven architectures.

```typescript
/**
 * @fires AgentSpawned When an agent is successfully created and initialized
 * @fires AgentSpawnFailed When agent creation fails due to resource constraints
 * @fires SwarmTopologyChanged When the swarm structure is modified
 */
async spawnAgent(agentId: string, config: AgentConfig): Promise<Agent>
```

#### `@listens`
Document which events a class/method listens to.

```typescript
/**
 * @listens AgentDisconnected Handles agent disconnection and cleanup
 * @listens ResourceExhausted Triggers load balancing when resources are low
 */
class SwarmManager {
```

### Error Documentation

#### `@throws`
Document all possible error conditions with specific types.

```typescript
/**
 * @throws {AgentSpawnError} When agent creation fails due to invalid configuration
 * @throws {ResourceExhaustionError} When system resources are insufficient
 * @throws {TimeoutError} When agent fails to respond within timeout period
 */
async spawnAgent(agentId: string, config: AgentConfig): Promise<Agent>
```

### Lifecycle and Version Tags

#### `@since`
Version/API stability information.

```typescript
/**
 * @since 1.0.0-alpha.43 Added support for dynamic topology reconfiguration
 */
```

#### `@deprecated`
Clear deprecation information with migration paths.

```typescript
/**
 * @deprecated Since v1.0.0-alpha.40. Use `spawnAgent()` instead.
 * @see {@link spawnAgent} for the new API
 */
```

## Advanced AI-Friendly Tags

### Semantic Tags

#### `@namespace`
Group related functionality.

```typescript
/**
 * @namespace SwarmCoordination
 * @description Core swarm coordination functionality
 */
```

#### `@memberof`
Indicate class/namespace membership.

```typescript
/**
 * @memberof SwarmCoordination
 */
```

#### `@override`
Indicate method overrides for inheritance clarity.

```typescript
/**
 * @override
 * @description Specialized agent spawning with neural capabilities
 */
```

### Implementation Tags

#### `@internal`
Mark internal APIs not intended for external use.

```typescript
/**
 * @internal
 * @description Internal method for topology recalculation - do not use directly
 */
```

#### `@beta`
Mark experimental APIs.

```typescript
/**
 * @beta
 * @description Experimental neural pattern matching - API may change
 */
```

#### `@readonly`
Mark read-only properties.

```typescript
/**
 * @readonly
 * @description Current swarm topology - cannot be modified directly
 */
readonly topology: SwarmTopology;
```

## Template Example

Here's a complete example showing all AI-friendly documentation patterns:

```typescript
/**
 * @description High-performance swarm coordination manager for Claude Code Zen.
 * Orchestrates multi-agent workflows with neural pattern matching and automatic
 * load balancing across distributed compute resources.
 * 
 * @example
 * ```typescript
 * const swarm = new SwarmManager({
 *   topology: 'hierarchical',
 *   maxAgents: 100,
 *   loadBalancing: true
 * });
 * 
 * // Spawn specialized agents
 * const researcher = await swarm.spawnAgent('research-001', {
 *   type: 'researcher',
 *   capabilities: ['web-search', 'document-analysis']
 * });
 * 
 * // Handle events
 * swarm.on('AgentSpawned', (agent) => {
 *   console.log(`New agent: ${agent.id}`);
 * });
 * ```
 * 
 * @since 1.0.0-alpha.43
 * @fires AgentSpawned When new agent is successfully created
 * @fires SwarmTopologyChanged When topology is reconfigured
 * @listens ResourceExhausted Triggers automatic load balancing
 */
export class SwarmManager {
  /**
   * @description Creates a new specialized agent within the swarm
   * 
   * @param {string} agentId - Unique identifier (UUID format recommended)
   * @param {AgentConfig} config - Agent configuration with capabilities
   * @param {SwarmSpawnOptions} [options] - Optional spawn parameters
   * 
   * @returns {Promise<SwarmResult<Agent>>} Promise resolving to the spawned agent
   *   or error details if spawn fails
   * 
   * @throws {AgentSpawnError} Invalid configuration or duplicate ID
   * @throws {ResourceExhaustionError} Insufficient system resources
   * @throws {NetworkError} Communication failure in distributed setup
   * 
   * @example
   * ```typescript
   * const agent = await swarm.spawnAgent('coder-001', {
   *   type: 'coder',
   *   capabilities: ['typescript', 'react', 'testing'],
   *   resources: { memory: '512MB', cpu: 2 }
   * });
   * 
   * if (agent.success) {
   *   await agent.data.execute('implement user authentication');
   * }
   * ```
   * 
   * @fires AgentSpawned Emitted when agent is fully initialized
   * @since 1.0.0-alpha.43
   */
  async spawnAgent(
    agentId: string, 
    config: AgentConfig, 
    options?: SwarmSpawnOptions
  ): Promise<SwarmResult<Agent>> {
    // Implementation...
  }
}
```

## Documentation Generation Scripts

We maintain multiple TypeDoc configurations for different use cases:

- **`typedoc.minimal.cjs`** - Types only, fast generation
- **`typedoc.expanded.cjs`** - Comprehensive API docs with implementations
- **`typedoc.full.cjs`** - Complete codebase (may be slow)

Current configuration uses expanded approach for best balance of completeness and generation speed.

## AI Parsing Benefits

This documentation standard provides:

1. **Structured Information**: Clear patterns AI can reliably parse
2. **Type Safety**: Explicit types reduce ambiguity
3. **Usage Examples**: Concrete patterns for code generation
4. **Error Handling**: Complete error condition mapping
5. **Event Flow**: Clear event emission and handling patterns
6. **Version Tracking**: API evolution and stability indicators

## Maintenance Notes

- Keep `@fires` blocks - they're valuable for event-driven systems
- Always include `@example` for complex APIs
- Use `@throws` for all error conditions
- Update `@since` tags when APIs change
- Mark experimental features with `@beta`