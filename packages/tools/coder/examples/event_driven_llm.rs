//! Example: Event-Driven LLM Integration
//! 
//! This example demonstrates how the refactored Code Mesh Core
//! integrates with the platform's EventBus for LLM communication.

use code_mesh_core::{
    EventBus, EventDrivenLLMClient, Session, Message, MessageRole,
    GenerateOptions, ToolRegistry, ReadTool, EditTool, BashTool
};
use tokio;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("🚀 Code Mesh Core - Event-Driven LLM Integration");
    println!("================================================\n");

    // Initialize the event bus
    let event_bus = EventBus::new();
    
    // Create an event-driven LLM client
    let llm_client = EventDrivenLLMClient::new("claude-3-opus".to_string(), event_bus.clone());
    
    // Set up tool registry with core tools
    let mut tool_registry = ToolRegistry::with_defaults()?;
    
    // Create a new session
    let mut session = Session::new();
    session.add_message(Message::new(
        MessageRole::System,
        "You are a helpful AI coding assistant. You can read files, edit code, and execute commands safely."
    ));
    
    session.add_message(Message::new(
        MessageRole::User,
        "Help me create a simple Rust function that calculates fibonacci numbers"
    ));
    
    println!("📝 Session created with {} messages", session.messages.len());
    println!("🤖 LLM client ready for event-driven communication");
    println!("🛠️  Tool registry loaded with {} tools", tool_registry.tools.len());
    
    // Example: Generate response via events
    println!("\n🔄 Generating LLM response via EventBus...");
    
    // Note: In the real implementation, this would:
    // 1. Emit 'llm:generate-request' event
    // 2. LLM provider package would handle the request
    // 3. Response would come back via 'llm:generate-response' event
    
    let response = llm_client.generate(
        session.to_llm_messages(),
        GenerateOptions::default()
    ).await;
    
    match response {
        Ok(result) => {
            println!("✅ LLM Response: {}", result.content);
            session.add_message(Message::new(MessageRole::Assistant, result.content));
        }
        Err(e) => {
            println!("❌ LLM Error: {}", e);
            // In real implementation, this would be handled by the event system
        }
    }
    
    // Example: Using tools (these work independently of LLM)
    println!("\n🛠️  Demonstrating tool usage...");
    
    // Read tool example
    let read_tool = ReadTool;
    let read_context = code_mesh_core::ToolContext {
        session_id: session.id.clone(),
        message_id: "example".to_string(),
        working_directory: std::env::current_dir()?,
    };
    
    let read_result = read_tool.execute(
        serde_json::json!({
            "file_path": "Cargo.toml"
        }),
        read_context.clone()
    ).await;
    
    match read_result {
        Ok(result) => println!("📖 Read tool result: {}", result.title),
        Err(e) => println!("❌ Read tool error: {}", e),
    }
    
    // Edit tool example
    let edit_tool = EditTool;
    let edit_result = edit_tool.execute(
        serde_json::json!({
            "file_path": "example_output.txt",
            "old_string": "",
            "new_string": "Hello from Code Mesh Core!",
            "replace_all": true
        }),
        read_context
    ).await;
    
    match edit_result {
        Ok(result) => println!("✏️  Edit tool result: {}", result.title),
        Err(e) => println!("❌ Edit tool error: {}", e),
    }
    
    println!("\n🎯 Architecture Benefits:");
    println!("   • Event-driven: No direct LLM provider dependencies");
    println!("   • Platform integration: Works with Claude Code Zen EventBus");
    println!("   • Tool system: Comprehensive development tools");
    println!("   • Separation of concerns: LLM logic in provider packages");
    
    println!("\n✨ Example completed successfully!");
    Ok(())
}
