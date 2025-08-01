# ADR-0001: Dual MCP Architecture (HTTP + Stdio)

**Status**: Accepted  
**Date**: 2024-01-01  
**Deciders**: Technical Team  
**Technical Story**: Multi-interface MCP integration for Claude ecosystem

## Context and Problem Statement

Claude-Zen needs to integrate with both Claude Desktop (for human interaction) and Claude Code (for AI automation). The Model Context Protocol (MCP) supports different transport mechanisms, but each has distinct use cases and limitations.

### Problem
How should Claude-Zen implement MCP integration to support both human-driven planning via Claude Desktop and AI-driven execution via Claude Code?

### Goals
- Enable human project planning through Claude Desktop
- Support AI automation through Claude Code
- Maintain clean separation between human and AI workflows
- Maximize development velocity for both use cases

## Decision Drivers

* **Interface Separation** - Human vs AI interaction patterns are fundamentally different
* **Protocol Efficiency** - Different transports optimize for different use cases
* **Development Experience** - Seamless integration across Claude ecosystem
* **Scalability** - Support for complex multi-agent workflows
* **Maintainability** - Clear architectural boundaries and responsibilities

## Considered Options

* **Option 1**: Single HTTP MCP server for all interactions
* **Option 2**: Single Stdio MCP server for all interactions  
* **Option 3**: Dual MCP architecture (HTTP + Stdio)

## Decision Outcome

**Chosen option**: "Option 3: Dual MCP architecture (HTTP + Stdio)"

### Rationale
The dual MCP architecture provides optimal user experience by matching protocol characteristics to use cases:
- HTTP MCP excels at human-driven, request-response interactions
- Stdio MCP excels at AI-driven, streaming, and coordination workflows
- Clean separation enables specialized optimizations for each use case
- Maintains single codebase while supporting diverse interaction patterns

### Consequences

#### Positive Consequences
* **Optimized User Experience**: Each interface optimized for its intended use case
* **Protocol Efficiency**: HTTP for human interaction, Stdio for AI coordination
* **Clear Boundaries**: Separation between human planning and AI execution workflows
* **Specialized Features**: Can implement protocol-specific optimizations
* **Ecosystem Integration**: Native integration with both Claude Desktop and Claude Code

#### Negative Consequences  
* **Increased Complexity**: Two MCP servers to maintain instead of one
* **Code Duplication**: Some shared functionality between servers
* **Testing Overhead**: Need to test both protocol implementations

#### Neutral Consequences
* **Dual Configuration**: Users need to configure both MCP servers for full functionality

## Pros and Cons of the Options

### Option 1: Single HTTP MCP Server

**Pros**:
* Simpler architecture with single server
* Unified configuration and deployment
* Single protocol to maintain

**Cons**:
* HTTP overhead for high-frequency AI coordination
* Claude Code stdio integration less natural
* Mixed concerns in single server implementation
* Suboptimal for streaming/real-time coordination

### Option 2: Single Stdio MCP Server

**Pros**:
* Efficient for AI coordination workflows
* Natural integration with Claude Code
* Streaming and real-time capabilities

**Cons**:
* Poor fit for Claude Desktop integration
* HTTP-like request patterns awkward over stdio
* Limited tooling and debugging capabilities
* Web dashboard integration complications

### Option 3: Dual MCP Architecture

**Pros**:
* **Protocol Optimization**: Each protocol optimized for its use case
* **Clear Separation**: Human vs AI workflows clearly separated
* **Specialized Features**: Can implement protocol-specific optimizations
* **Ecosystem Native**: Natural integration with both Claude Desktop and Claude Code
* **Scalability**: Each server can scale independently

**Cons**:
* **Complexity**: Two servers to maintain and deploy
* **Potential Duplication**: Some shared code between implementations
* **Configuration**: Users need to set up both servers for full functionality

## Implementation

### Action Items
- [x] Implement HTTP MCP server for Claude Desktop integration (port 3000)
- [x] Implement Stdio MCP server for Claude Code integration  
- [x] Create shared tool registry and core functionality
- [x] Document setup procedures for both protocols
- [x] Implement proper separation of concerns

### Timeline
- **Immediate**: HTTP MCP server implementation
- **Short-term** (1-2 weeks): Stdio MCP server implementation
- **Long-term** (1-3 months): Protocol-specific optimizations

## Validation

### Success Criteria
How will we know this decision was correct?
- Claude Desktop integration works seamlessly via HTTP MCP
- Claude Code integration enables efficient swarm coordination via Stdio MCP
- Users can choose interface based on workflow needs
- Performance metrics show protocol efficiency gains
- Development velocity increases for both human and AI workflows

### Review Points
- **3 months**: Evaluate user adoption and protocol efficiency
- **6 months**: Assess maintenance overhead and development velocity impact

## Links

* [MCP Protocol Specification](https://modelcontextprotocol.io/)
* [Claude Desktop MCP Configuration](https://docs.anthropic.com/claude/desktop)
* [HTTP MCP Server Implementation](../src/interfaces/mcp/http-mcp-server.ts)
* [Stdio MCP Server Implementation](../src/swarm-zen/mcp-server.ts)

---

**Notes**: This decision enables Claude-Zen to be native to the Claude ecosystem while maintaining optimal performance for both human and AI workflows.