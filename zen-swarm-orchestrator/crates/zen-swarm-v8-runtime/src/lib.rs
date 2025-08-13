//! # zen-swarm-v8-runtime
//!
//! High-performance V8 JavaScript/TypeScript runtime for zen-orchestrator AI plugins.
//!
//! This crate provides a sandboxed V8 environment for running TypeScript AI reasoning
//! plugins within the Rust zen-orchestrator system. It enables seamless integration
//! between high-performance Rust coordination and flexible TypeScript AI logic.
//!
//! ## Features
//!
//! - **V8 JavaScript Engine**: Full V8 integration with custom isolates
//! - **TypeScript Support**: Automatic TypeScript compilation via SWC
//! - **Plugin System**: Sandboxed plugin execution with controlled APIs
//! - **Async Bridge**: Rust async/await ↔ JavaScript Promise integration
//! - **Memory Management**: Controlled heap limits and garbage collection
//! - **Module System**: ES6/CommonJS module loading with dependency resolution
//! - **Security**: Sandbox isolation with restricted API surface
//!
//! ## Architecture
//!
//! ```text
//! ┌─────────────────────────────────────┐
//! │         Rust zen-orchestrator       │
//! ├─────────────────────────────────────┤
//! │  V8Runtime                          │
//! │  ├── Plugin Manager                 │
//! │  ├── TypeScript Compiler (SWC)      │
//! │  ├── Module Resolver                │
//! │  └── Security Sandbox              │
//! ├─────────────────────────────────────┤
//! │  V8 Isolates (Sandboxed)           │
//! │  ├── AI Reasoning Plugin            │
//! │  ├── RAG Retrieval Plugin           │
//! │  └── Decision Making Plugin         │
//! └─────────────────────────────────────┘
//! ```
//!
//! ## Example
//!
//! ```rust
//! use zen_swarm_v8_runtime::{V8Runtime, PluginConfig, AIPlugin};
//!
//! #[tokio::main]
//! async fn main() -> anyhow::Result<()> {
//!     // Initialize V8 runtime
//!     let mut runtime = V8Runtime::new().await?;
//!     
//!     // Load TypeScript AI plugin
//!     let plugin_source = r#"
//!         export class AIReasoningPlugin {
//!             async analyzeContext(context: string): Promise<Decision> {
//!                 // Complex AI reasoning logic here
//!                 return {
//!                     decision: "proceed",
//!                     confidence: 0.95,
//!                     reasoning: "Analysis complete"
//!                 };
//!             }
//!         }
//!     "#;
//!     
//!     let plugin = runtime.load_typescript_plugin("ai-reasoning", plugin_source).await?;
//!     
//!     // Call plugin method from Rust
//!     let context = "Complex decision context...";
//!     let result = plugin.call_method("analyzeContext", vec![context.into()]).await?;
//!     
//!     println!("AI Decision: {:?}", result);
//!     Ok(())
//! }
//! ```

pub mod error;
pub mod types;
pub mod config;
pub mod module;
pub mod sandbox;
pub mod node_runtime;  // External process-based JS/TS runtime (Node24/Bun)

pub use error::*;
pub use types::*;
pub use config::RuntimeConfig;
pub use node_runtime::{NodeRuntime as V8Runtime, AIPlugin, RuntimeStats};

// The V8Runtime is now implemented as BunRuntime (Node24/Bun/Deno-based)

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_runtime_creation() {
        let runtime = V8Runtime::new().await;
        assert!(runtime.is_ok());
    }
    
    #[tokio::test]
    async fn test_javascript_plugin_loading() {
        let runtime = V8Runtime::new().await.unwrap();
        
        let plugin_source = r#"
            function greet(name) {
                return "Hello, " + name + "!";
            }
            
            globalThis.greet = greet;
        "#;
        
        let plugin = runtime.load_javascript_plugin("greeting", plugin_source).await.unwrap();
        assert_eq!(plugin.name(), "greeting");
    }
    
    #[tokio::test]
    async fn test_typescript_plugin_loading() {
        let runtime = V8Runtime::new().await.unwrap();
        
        let plugin_source = r#"
            interface GreetingOptions {
                formal: boolean;
            }
            
            function greet(name: string, options?: GreetingOptions): string {
                if (options?.formal) {
                    return `Good day, ${name}!`;
                }
                return `Hello, ${name}!`;
            }
            
            (globalThis as any).greet = greet;
        "#;
        
        let plugin = runtime.load_typescript_plugin("greeting-ts", plugin_source).await.unwrap();
        assert_eq!(plugin.name(), "greeting-ts");
    }
    
    #[tokio::test]
    async fn test_plugin_management() {
        let runtime = V8Runtime::new().await.unwrap();
        
        // Load plugin
        let plugin_source = r#"globalThis.test = () => "success";"#;
        runtime.load_javascript_plugin("test", plugin_source).await.unwrap();
        
        // Check plugin exists
        assert!(runtime.get_plugin("test").await.is_some());
        
        // List plugins
        let plugins = runtime.list_plugins().await;
        assert!(plugins.contains(&"test".to_string()));
        
        // Unload plugin
        runtime.unload_plugin("test").await.unwrap();
        assert!(runtime.get_plugin("test").await.is_none());
    }
}