//! # Code Mesh Core
//! 
//! **Code Mesh Core** is the foundational library for the Code Mesh AI coding assistant.
//! It provides a comprehensive set of abstractions and implementations for building
//! AI-powered development tools.
//! 
//! ## Features
//! 
//! - **🤖 Event-Driven LLM Integration**: Communicates with LLM providers via EventBus
//! - **🛠️ Extensible Tool System**: Built-in tools for file operations, code execution, web search, and custom extensions
//! - **💾 Session Management**: Persistent conversation history with intelligent context management
//! - **🔐 Secure Authentication**: OAuth and API key support with encrypted credential storage
//! - **🌐 Cross-Platform**: Native performance with WebAssembly compatibility
//! - **🧠 Agent Orchestration**: Multi-agent coordination for complex coding workflows
//! 
//! ## Quick Start
//! 
//! ```rust
//! use code_mesh_core::{Session, EventDrivenLLMClient, ToolRegistry};
//! use tokio;
//! 
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     // Initialize event bus
//!     let event_bus = EventBus::new();
//!     
//!     // Create event-driven LLM client
//!     let llm_client = EventDrivenLLMClient::new("claude-3-opus".to_string(), event_bus.clone());
//!     
//!     // Create a new session
//!     let mut session = Session::new();
//!     session.add_user_message("Help me implement a binary search function");
//!     
//!     // Generate response via events
//!     let response = llm_client.generate(
//!         session.to_llm_messages(),
//!         GenerateOptions::default()
//!     ).await?;
//!     
//!     session.add_assistant_message(response.content);
//!     println!("Assistant: {}", session.last_message().content);
//!     Ok(())
//! }
//! ```
//! 
//! ## Architecture Overview
//! 
//! Code Mesh Core is built around several key abstractions:
//! 
//! ### Language Models ([`llm`] module)
//! 
//! The [`EventDrivenLLMClient`] provides event-driven communication with LLM providers
//! through the platform's EventBus system. This ensures proper separation of concerns
//! and integration with the Claude Code Zen architecture.
//! 
//! ### Tools ([`tool`] module)
//! 
//! The [`Tool`] trait enables AI agents to interact with external systems:
//! 
//! - [`FileTools`] - Read, write, and search files
//! - [`BashTool`] - Execute shell commands safely
//! - [`WebTool`] - Search the web and fetch documentation
//! - [`GitTool`] - Git operations and repository management
//! 
//! ### Sessions ([`session`] module)
//! 
//! Sessions manage conversation state and context:
//! 
//! - [`Session`] - Core conversation management
//! - [`SessionManager`] - Persistence and retrieval
//! - [`Message`] - Individual conversation messages
//! 
//! ### Authentication ([`auth`] module)
//! 
//! Secure credential management for AI providers:
//! 
//! - [`Auth`] - Authentication interface
//! - [`CredentialStore`] - Encrypted credential storage
//! - [`OAuthFlow`] - OAuth authentication flows
//! 
//! ## Examples
//! 
//! ### Event-Driven LLM Setup
//! 
//! ```rust
//! use code_mesh_core::{EventDrivenLLMClient, EventBus};
//! 
//! let event_bus = EventBus::new();
//! 
//! // Create LLM client that communicates via events
//! let llm_client = EventDrivenLLMClient::new("claude-3-opus".to_string(), event_bus.clone());
//! 
//! // The client will emit events that are handled by the platform's LLM providers
//! ```
//! 
//! ## Feature Flags
//! 
//! Code Mesh Core supports conditional compilation based on target platform:
//! 
//! - `native` (default): Full native functionality including file system access
//! - `wasm`: WebAssembly-compatible subset with browser APIs
//! - `web`: Web functionality for HTTP and content processing
//! 
//! ## Error Handling
//! 
//! All public APIs use the [`Result`] type with [`Error`] for consistent error handling.
//! Errors are categorized by type and provide detailed context for debugging.
//! 
//! ## Performance Considerations
//! 
//! - **Async/Await**: All I/O operations are asynchronous for better performance
//! - **Connection Pooling**: HTTP clients use connection pooling for efficiency
//! - **Caching**: Intelligent caching of model responses and file contents
//! - **Memory Management**: Bounded memory usage with configurable limits

#![allow(warnings)]

// Core modules
pub mod agent;
pub mod auth;
pub mod llm;
pub mod memory;
pub mod planner;
pub mod session;
pub mod storage;
pub mod tool;

// Utility modules
pub mod config;
pub mod error;
pub mod events;
pub mod features;
pub mod permission;
pub mod sync;
pub mod utils;

// Generated prompts
pub mod prompts;

// Re-export commonly used types
pub use llm::{
    EventDrivenLLMClient, LanguageModel, EventDrivenLanguageModel,
    Message, MessageRole, MessageContent, GenerateOptions,
    GenerateResult, StreamChunk, Usage, FinishReason,
    LLMGenerateRequest, LLMGenerateResponse, LLMStreamRequest, LLMStreamChunk
};
pub use tool::{
    Tool, ToolContext, ToolResult, ToolRegistry, ToolError,
    ToolDefinition
};
pub use auth::{Auth, AuthCredentials, AuthStorage};
pub use storage::{Storage, StorageError};
pub use session::{
    Session, Message as SessionMessage, SessionManager, 
    MessageRole as SessionMessageRole, SessionMetadata
};
pub use config::{Config, ConfigManager, ProviderConfig, ToolConfig};
pub use permission::{PermissionManager, PermissionContext, PermissionLevel};

// Error types
pub use error::{Error, Result};

// Event system
pub use events::{Event, EventBus, EventHandler};

// Synchronization primitives
pub use sync::{AsyncMutex, AsyncRwLock, Debouncer};

// Version and build information
pub const VERSION: &str = env!("CARGO_PKG_VERSION");


/// Runtime compatibility layer
#[cfg(not(target_arch = "wasm32"))]
pub mod runtime {
    pub use tokio::*;
    pub type Runtime = tokio::runtime::Runtime;
    pub type Handle = tokio::runtime::Handle;
}

#[cfg(target_arch = "wasm32")]
pub mod runtime {
    pub use wasm_bindgen_futures::*;
    // WASM doesn't have a runtime concept like tokio
    pub type Runtime = ();
    pub type Handle = ();
}