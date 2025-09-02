# Code-Mesh Core 🦀⚡

[![Crates.io](https://img.shields.io/crates/v/code-mesh-core.svg)](https://crates.io/crates/code-mesh-core)
[![Documentation](https://docs.rs/code-mesh-core/badge.svg)](https://docs.rs/code-mesh-core)
[![License](https://img.shields.io/badge/license-MIT%2FApache--2.0-blue.svg)](https://github.com/ruvnet/code-mesh)
[![Rust](https://img.shields.io/badge/rust-1.70%2B-orange.svg)](https://www.rust-lang.org)

**High-performance, event-driven Rust library for AI-powered development tools with comprehensive tool system and platform integration.**

Code-Mesh Core is the foundational library that powers the Code-Mesh ecosystem - a next-generation multi-agent system designed for blazing-fast, concurrent operations with neural network capabilities and SIMD optimization.

## 🌟 Features

### 🚀 **High-Performance Engine**

- **🔐 Secure Authentication**: OAuth and API key support with encrypted credential storage
- **🔄 Event-Driven Architecture**: Communicates with LLM providers via platform EventBus
- **🌐 Cross-Platform**: Native performance with WebAssembly compatibility

### 🧠 **Event-Driven LLM Integration**

- **Platform Integration**: Works with Claude Code Zen EventBus system
- **Provider Agnostic**: No direct LLM dependencies - routes through platform providers
- **Real-time Communication**: Event-based request/response handling
- **Separation of Concerns**: LLM logic handled by dedicated provider packages

### ⚡ **Concurrent Swarm Operations**

- **Multi-Topology Support**: Mesh, hierarchical, ring, star architectures
- **Agent Types**: Researcher, Coder, Analyst, Optimizer, Coordinator
- **Parallel Task Execution**: Adaptive, sequential, and balanced strategies
- **Real-time Monitoring**: Nanosecond-precision performance tracking

### 🔧 **Advanced Tool Suite**

- **File Operations**: Concurrent read/write/edit with Unicode support
- **Search & Analysis**: Regex-powered grep, glob pattern matching
- **Web Integration**: HTTP client, search APIs, content extraction
- **Process Execution**: Secure bash command execution with validation
- **Task Management**: Advanced todo system with dependencies and priorities
- **Memory Management**: TTL-based storage with namespace isolation

## 🚀 Quick Start

Add this to your `Cargo.toml`:

```toml
[dependencies]
code-mesh-core = "0.1"
```

### Basic Usage

```rust
use code_mesh_core::{EventBus, EventDrivenLLMClient, Session, ToolRegistry};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize event bus for platform integration
    let event_bus = EventBus::new();
    
    // Create event-driven LLM client
    let llm_client = EventDrivenLLMClient::new("claude-3-opus".to_string(), event_bus.clone());
    
    // Set up tool registry
    let tool_registry = ToolRegistry::with_defaults()?;
    
    // Create session and generate response via events
    let mut session = Session::new();
    session.add_user_message("Help me write a Rust function");
    
    let response = llm_client.generate(
        session.to_llm_messages(),
        GenerateOptions::default()
    ).await?;
    
    println!("AI Response: {}", response.content);
    Ok(())
}
```

## 🏗️ Architecture

### Event-Driven Design

Code-Mesh Core follows the Claude Code Zen platform architecture:

```
┌─────────────────┐    Events    ┌──────────────────┐
│   Code-Mesh     │ ────────────→ │  LLM Providers  │
│     Core        │               │  (TypeScript)   │
│                 │ ←──────────── │                  │
└─────────────────┘   Responses  └──────────────────┘
```

- **No Direct LLM Dependencies**: All LLM communication via EventBus
- **Platform Integration**: Works seamlessly with Claude Code Zen
- **Tool System**: Comprehensive development tools independent of LLM
- **Event Types**: `llm:generate-request`, `llm:generate-response`, etc.

### Core Components

- **EventBus**: Platform event communication
- **ToolRegistry**: File operations, search, web tools, process execution
- **Session Management**: Conversation state and context
- **EventDrivenLLMClient**: LLM communication interface

## 🛠️ Tool System

### Available Tools

```rust
use code_mesh_core::tool::*;

let mut registry = ToolRegistry::with_defaults()?;

// File operations
registry.register(Box::new(ReadTool));
registry.register(Box::new(WriteTool));
registry.register(Box::new(EditTool));
registry.register(Box::new(MultiEditTool));

// Search and analysis
registry.register(Box::new(GrepTool));
registry.register(Box::new(GlobTool));
registry.register(Box::new(GlobAdvancedTool));

// Process execution
registry.register(Box::new(BashTool));

// Web tools
registry.register(Box::new(WebFetchTool::new()?));
registry.register(Box::new(WebSearchTool::new()?));

// Task management
registry.register(Box::new(TaskTool::new()));
registry.register(Box::new(TodoTool::new()));
```

### Tool Categories

- **File Operations**: Read, write, edit, multi-edit
- **Search & Analysis**: Grep, glob patterns, advanced search
- **Process Execution**: Secure bash execution with validation
- **Web Integration**: HTTP client, search, content extraction
- **Task Management**: Todo system with dependencies and priorities
- **Monitoring**: File watching, audit logging, permissions

## 🔧 Configuration

### Feature Flags

```toml
[features]
default = ["std", "auto-optimization", "native", "web"]
std = []
auto-optimization = []
native = ["rusqlite", "reqwest/native-tls", "tokio"]
wasm = ["dep:web-sys", "dep:js-sys", "dep:wasm-bindgen"]
web = ["html5ever", "markup5ever_rcdom", "html2md", "scraper"]
```

### Platform Support

- **Native**: Full performance with file system access
- **WASM**: Browser-compatible subset
- **Cross-Platform**: Automatic feature detection and optimization

## 📚 Examples

### Event-Driven LLM

```rust
use code_mesh_core::{EventBus, EventDrivenLLMClient, GenerateOptions};

let event_bus = EventBus::new();
let llm_client = EventDrivenLLMClient::new("claude-3-opus".to_string(), event_bus);

// Generate text via events
let result = llm_client.generate(
    vec![Message::new(MessageRole::User, "Hello, AI!")],
    GenerateOptions::default()
).await?;
```

### Tool Usage

```rust
use code_mesh_core::tool::{ReadTool, ToolContext};

let read_tool = ReadTool;
let context = ToolContext {
    session_id: "session_123".to_string(),
    message_id: "msg_456".to_string(),
    working_directory: std::env::current_dir()?,
};

let result = read_tool.execute(
    serde_json::json!({"file_path": "src/main.rs"}),
    context
).await?;
```

## 🔒 Security Features

- **Command Validation**: Blocks dangerous system commands
- **Permission System**: Risk-based access control
- **Audit Logging**: Complete operation tracking
- **SSRF Protection**: URL validation and sanitization
- **Rate Limiting**: Configurable request throttling

## 🚀 Performance

- **Rust Native**: Zero-cost abstractions and memory safety
- **Async/Await**: Non-blocking I/O operations
- **SIMD Optimization**: Automatic CPU instruction optimization
- **Memory Management**: Efficient usage with TTL-based storage
- **Concurrent Operations**: Parallel task execution

## 🔗 Platform Integration

Code-Mesh Core is designed to integrate seamlessly with the Claude Code Zen platform:

- **EventBus Integration**: Uses platform's event system
- **LLM Provider Routing**: All AI requests go through platform providers
- **Tool System**: Comprehensive development tools
- **Session Management**: Persistent conversation state
- **Security**: Platform-level authentication and permissions

## 📖 Documentation

- [API Reference](https://docs.rs/code-mesh-core)
- [Examples](examples/)
- [Architecture Guide](ARCHITECTURE.md)
- [Tool Reference](TOOLS.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under either of

- Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or https://www.apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or https://opensource.org/licenses/MIT)

at your option.

## 🙏 Acknowledgments

- Built with [Rust](https://www.rust-lang.org/)
- Integrates with [Claude Code Zen](https://github.com/mikkihugo/claude-code-zen)
- Inspired by modern AI development workflows
