use anyhow::Result;
use code_mesh_tui::{MinimalApp, Config};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    // Load configuration
    let config = Config::load_or_default();
    
    // Create and run the application
    let mut app = MinimalApp::new(&config).await?;
    app.run().await?;
    
    Ok(())
}