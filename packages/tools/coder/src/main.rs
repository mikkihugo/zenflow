use anyhow::Result;
use clap::Parser;
use tracing_subscriber::{fmt, EnvFilter};

#[derive(Parser, Debug)]
#[command(name = "coder", version, about = "Rust-only coder wrapper for code-mesh-core")]
struct Args {
    /// Show version and exit
    #[arg(long)]
    version_only: bool,
}

fn init_tracing() {
    let _ = fmt()
        .with_env_filter(EnvFilter::from_default_env())
        .with_target(false)
        .try_init();
}

fn main() -> Result<()> {
    init_tracing();
    let args = Args::parse();
    if args.version_only {
        println!("coder {}", env!("CARGO_PKG_VERSION"));
        return Ok(());
    }

    // Minimal smoke: ensure core crate links
    println!("coder: code-mesh-core available");
    Ok(())
}
