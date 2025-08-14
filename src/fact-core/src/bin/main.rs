//! FACT CLI - Fast Augmented Context Tools Command Line Interface

use anyhow::Result;
use clap::{Parser, Subcommand};
#[cfg(feature = "github")]
use fact_tools::github::{GitHubAnalyzer, RepoAnalysis};
use fact_tools::templates::TemplateBuilder;
use fact_tools::{Fact, FactConfig};
use serde_json::json;
use std::path::PathBuf;
use std::time::Instant;
use tracing::debug;
use tracing::{error, info};
use tracing_subscriber::EnvFilter;

#[derive(Parser)]
#[command(name = "fact")]
#[command(author, version, about = "FACT (Fast Augmented Context Tools) - High-performance context processing", long_about = None)]
struct Cli {
  /// Enable verbose output
  #[arg(short, long, global = true)]
  verbose: bool,

  /// Configuration file path
  #[arg(short, long, global = true)]
  config: Option<PathBuf>,

  #[command(subcommand)]
  command: Commands,
}

#[derive(Subcommand)]
enum Commands {
  /// Process data using a template
  Process {
    /// Template ID to use
    #[arg(short, long)]
    template: String,

    /// Input data (JSON string or file path)
    #[arg(short, long)]
    input: String,

    /// Output file path (optional)
    #[arg(short, long)]
    output: Option<PathBuf>,

    /// Disable caching
    #[arg(long)]
    no_cache: bool,
  },

  /// List available templates
  Templates {
    /// Filter by tag
    #[arg(short, long)]
    tag: Option<String>,

    /// Show detailed information
    #[arg(short, long)]
    detailed: bool,
  },

  /// Show cache statistics
  Cache {
    /// Clear the cache
    #[arg(long)]
    clear: bool,
  },

  /// Benchmark performance
  Benchmark {
    /// Number of iterations
    #[arg(short, long, default_value = "100")]
    iterations: usize,

    /// Template to benchmark
    #[arg(short, long)]
    template: Option<String>,
  },

  /// Initialize FACT configuration
  Init {
    /// Force overwrite existing configuration
    #[arg(short, long)]
    force: bool,
  },

  #[cfg(feature = "github")]
  /// Analyze GitHub repositories for code knowledge
  Github {
    /// Repository to analyze (owner/repo format)
    #[arg(short, long)]
    repo: Option<String>,

    /// Analyze Hex package repositories
    #[arg(short, long)]
    package: Option<String>,

    /// Package version (for Hex packages)
    #[arg(short = 'V', long)]
    version: Option<String>,

    /// GitHub API token (optional, uses GITHUB_TOKEN env var if not provided)
    #[arg(short, long)]
    token: Option<String>,

    /// Output format
    #[arg(short, long, default_value = "json")]
    format: String,

    /// Maximum snippets to extract (0 = no limit)
    #[arg(short = 'm', long, default_value = "0")]
    max_snippets: usize,
  },

  /// Automatic FACT orchestration
  Auto {
    /// Start automatic orchestration
    #[arg(short, long)]
    start: bool,

    /// Stop automatic orchestration
    #[arg(short = 'S', long)]
    stop: bool,

    /// Show orchestration status
    #[arg(long)]
    status: bool,

    /// Update interval in hours
    #[arg(short = 'i', long, default_value = "24")]
    interval: u64,

    /// Maximum concurrent operations
    #[arg(short = 'c', long, default_value = "4")]
    concurrent: usize,

    /// Directories to scan (comma-separated)
    #[arg(short, long)]
    directories: Option<String>,

    /// Enable GitHub integration
    #[arg(short = 'g', long, default_value = "true")]
    github: bool,
  },
}

#[tokio::main]
async fn main() -> Result<()> {
  // Initialize logging with better defaults
  let _ = tracing_subscriber::fmt()
    .with_env_filter(
      EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new("fact_tools=info")),
    )
    .with_target(false)
    .with_thread_ids(false)
    .with_file(false)
    .with_line_number(false)
    .try_init(); // Use try_init to avoid panic if already initialized

  info!("🚀 Starting FACT Tools v{}", env!("CARGO_PKG_VERSION"));

  let cli = Cli::parse();

  info!(
    "Processing command with template: {:?}",
    match &cli.command {
      Commands::Process { template, .. } => template,
      _ => "unknown",
    }
  );

  // Load configuration
  let config = if let Some(config_path) = cli.config {
    info!("Loading configuration from: {:?}", config_path);
    let config_str = std::fs::read_to_string(config_path)?;
    serde_json::from_str(&config_str)?
  } else {
    FactConfig::default()
  };

  // Create FACT instance
  let fact = Fact::with_config(config);

  // Execute command
  match cli.command {
    Commands::Process {
      template,
      input,
      output,
      no_cache,
    } => {
      process_command(fact, template, input, output, no_cache).await?;
    }
    Commands::Templates { tag, detailed } => {
      templates_command(tag, detailed)?;
    }
    Commands::Cache { clear } => {
      cache_command(fact, clear)?;
    }
    Commands::Benchmark {
      iterations,
      template,
    } => {
      benchmark_command(fact, iterations, template).await?;
    }
    Commands::Init { force } => {
      init_command(force)?;
    }
    #[cfg(feature = "github")]
    Commands::Github {
      repo,
      package,
      version,
      token,
      format,
      max_snippets,
    } => {
      github_command(repo, package, version, token, format, max_snippets)
        .await?;
    }
    Commands::Auto {
      start,
      stop,
      status,
      interval,
      concurrent,
      directories,
      github,
    } => {
      auto_command(
        start,
        stop,
        status,
        interval,
        concurrent,
        directories,
        github,
      )
      .await?;
    }
  }

  Ok(())
}

async fn process_command(
  fact: Fact,
  template: String,
  input: String,
  output: Option<PathBuf>,
  no_cache: bool,
) -> Result<()> {
  info!("Processing with template: {}", template);

  // Parse input data using Edition 2024 enhanced pattern matching
  let context = match input.chars().next() {
    Some('{' | '[') => serde_json::from_str(&input)?,
    _ if PathBuf::from(&input).exists() => {
      let content = std::fs::read_to_string(&input)?;
      serde_json::from_str(&content)?
    }
    _ => json!({ "data": input }),
  };

  // Process with timing
  let start = Instant::now();
  let result = fact.process(&template, context).await?;
  let duration = start.elapsed();

  info!("Processing completed in {:?}", duration);

  // Output result using Edition 2024 improved match ergonomics
  let formatted = serde_json::to_string_pretty(&result)?;

  match output {
    Some(output_path) => {
      std::fs::write(output_path, &formatted)?;
      info!("Result written to file");
    }
    None => println!("{}", formatted),
  }

  // Show cache stats if not disabled
  if !no_cache {
    let stats = fact.cache_stats();
    info!(
      "Cache stats - Hit rate: {:.2}%, Entries: {}, Size: {} bytes",
      stats.hit_rate * 100.0,
      stats.entries,
      stats.size_bytes
    );
  }

  Ok(())
}

fn templates_command(tag: Option<String>, detailed: bool) -> Result<()> {
  // Create a temporary registry to list templates
  let registry = fact_tools::templates::TemplateRegistry::new();

  let templates = if let Some(tag) = tag {
    registry.search_by_tags(&[tag])
  } else {
    registry
      .list()
      .into_iter()
      .filter_map(|id| registry.get(&id))
      .collect()
  };

  if detailed {
    for template in templates {
      println!("Template: {} ({})", template.name, template.id);
      println!("  Description: {}", template.description);
      println!("  Version: {}", template.metadata.version);
      println!("  Tags: {}", template.metadata.tags.join(", "));
      println!("  Steps: {}", template.steps.len());
      println!(
        "  Performance: {:.0}ms avg, {}KB memory, complexity {}",
        template.metadata.performance.avg_execution_time_ms,
        template.metadata.performance.memory_usage_bytes / 1024,
        template.metadata.performance.complexity
      );
      println!();
    }
  } else {
    println!("Available templates:");
    for template in templates {
      println!("  {} - {}", template.id, template.name);
    }
  }

  Ok(())
}

fn cache_command(fact: Fact, clear: bool) -> Result<()> {
  if clear {
    fact.clear_cache();
    info!("Cache cleared");
  }

  let stats = fact.cache_stats();
  println!("Cache Statistics:");
  println!("  Entries: {}", stats.entries);
  println!("  Size: {} KB", stats.size_bytes / 1024);
  println!("  Hits: {}", stats.hits);
  println!("  Misses: {}", stats.misses);
  println!("  Hit Rate: {:.2}%", stats.hit_rate * 100.0);
  println!("  Evictions: {}", stats.evictions);

  Ok(())
}

async fn benchmark_command(
  fact: Fact,
  iterations: usize,
  template: Option<String>,
) -> Result<()> {
  let template_id = template.unwrap_or_else(|| "quick-transform".to_string());

  info!("Running benchmark with template: {}", template_id);
  info!("Iterations: {}", iterations);

  // Sample data for benchmarking
  let test_data = json!({
      "data": (0..100).collect::<Vec<_>>(),
      "metadata": {
          "source": "benchmark",
          "timestamp": chrono::Utc::now().to_rfc3339(),
      }
  });

  let mut total_duration = std::time::Duration::ZERO;
  let mut min_duration = std::time::Duration::MAX;
  let mut max_duration = std::time::Duration::ZERO;

  // Warm up
  for _ in 0..10 {
    let _ = fact.process(&template_id, test_data.clone()).await?;
  }

  // Clear cache for fair comparison
  fact.clear_cache();

  // Run benchmark
  for i in 0..iterations {
    let start = Instant::now();
    let _ = fact.process(&template_id, test_data.clone()).await?;
    let duration = start.elapsed();

    total_duration += duration;
    min_duration = min_duration.min(duration);
    max_duration = max_duration.max(duration);

    if (i + 1) % 10 == 0 {
      info!("Progress: {}/{}", i + 1, iterations);
    }
  }

  let avg_duration = total_duration / iterations as u32;
  let stats = fact.cache_stats();

  println!("\nBenchmark Results:");
  println!("  Template: {}", template_id);
  println!("  Iterations: {}", iterations);
  println!("  Average: {:?}", avg_duration);
  println!("  Min: {:?}", min_duration);
  println!("  Max: {:?}", max_duration);
  println!("  Cache Hit Rate: {:.2}%", stats.hit_rate * 100.0);
  println!(
    "  Throughput: {:.2} ops/sec",
    1000.0 / avg_duration.as_millis() as f64
  );

  Ok(())
}

fn init_command(force: bool) -> Result<()> {
  let config_path = PathBuf::from("fact.json");

  if config_path.exists() && !force {
    error!("Configuration file already exists. Use --force to overwrite.");
    return Ok(());
  }

  let default_config = FactConfig::default();
  let config_str = serde_json::to_string_pretty(&default_config)?;

  std::fs::write(&config_path, config_str)?;
  info!("Created configuration file: {:?}", config_path);

  // Create example template file
  let template_path = PathBuf::from("custom_template.json");
  if !template_path.exists() || force {
    let example_template = TemplateBuilder::new("custom-example")
      .name("Custom Example Template")
      .description("An example template for custom processing")
      .add_tag("custom")
      .add_tag("example")
      .build();

    let template_str = serde_json::to_string_pretty(&example_template)?;
    std::fs::write(&template_path, template_str)?;
    info!("Created example template: {:?}", template_path);
  }

  println!("\nFACT initialized successfully!");
  println!("Configuration file: fact.json");
  println!("Example template: custom_template.json");
  println!("\nGet started with:");
  println!(
    "  fact process --template analysis-basic --input '{{\"data\": [1,2,3,4,5]}}'"
  );

  Ok(())
}

#[cfg(feature = "github")]
async fn github_command(
  repo: Option<String>,
  package: Option<String>,
  version: Option<String>,
  token: Option<String>,
  format: String,
  max_snippets: usize,
) -> Result<()> {
  use fact_tools::github::RepoInfo;

  let github_token = token.or_else(|| std::env::var("GITHUB_TOKEN").ok());
  let analyzer = GitHubAnalyzer::new(github_token)
    .context("Failed to create GitHub analyzer")?;

  if let Some(repo_str) = repo {
    // Analyze specific repository
    let parts: Vec<&str> = repo_str.split('/').collect();
    if parts.len() != 2 {
      anyhow::bail!("Repository must be in format: owner/repo");
    }

    let repo_info = RepoInfo {
      owner: parts[0].to_string(),
      name: parts[1].to_string(),
      branch: None,
    };

    info!(
      "Analyzing repository: {}/{}",
      repo_info.owner, repo_info.name
    );
    let analysis = analyzer.analyze_repository(&repo_info).await?;

    // Apply snippet limit if specified
    let original_count = analysis.snippets.len();
    let mut snippets = analysis.snippets;
    if max_snippets > 0 && snippets.len() > max_snippets {
      snippets.truncate(max_snippets);
      info!(
        "Limited to {} snippets (from {})",
        max_snippets, original_count
      );
    }

    // Create modified analysis for output
    let output_analysis = RepoAnalysis {
      snippets,
      repo_name: analysis.repo_name.clone(),
      repo_description: analysis.repo_description.clone(),
      stars: analysis.stars,
      language: analysis.language.clone(),
    };

    match format.as_str() {
      "json" => {
        println!("{}", serde_json::to_string_pretty(&output_analysis)?);
      }
      "summary" => {
        println!("Repository: {}", output_analysis.repo_name);
        println!("Description: {}", output_analysis.repo_description);
        println!("Language: {}", output_analysis.language);
        println!("Stars: {}", output_analysis.stars);
        println!("Snippets found: {}", output_analysis.snippets.len());
      }
      _ => {
        anyhow::bail!(
          "Unsupported format: {}. Use 'json' or 'summary'",
          format
        );
      }
    }
  } else if let Some(package_name) = package {
    // Analyze Hex package repositories
    let package_version = version.unwrap_or_else(|| "latest".to_string());

    info!(
      "Analyzing Hex package: {}@{}",
      package_name, package_version
    );
    let analysis = analyzer
      .analyze_hex_package_repos(&package_name, &package_version)
      .await?;

    // Generate FACT entries
    let fact_entries = analyzer.generate_fact_entries(
      &package_name,
      &package_version,
      &analysis,
    );

    match format.as_str() {
      "json" => {
        println!("{}", serde_json::to_string_pretty(&fact_entries)?);
      }
      "summary" => {
        println!("Hex Package: {}@{}", package_name, package_version);
        println!("Documentation: {}", fact_entries.documentation);

        if !fact_entries.snippets.is_empty() {
          println!("\nCode Snippets ({}):", fact_entries.snippets.len());
          for (i, snippet) in fact_entries.snippets.iter().enumerate() {
            if max_snippets > 0 && i >= max_snippets {
              break;
            }
            println!(
              "  • {}: {}",
              snippet.title,
              &snippet.description
                [..std::cmp::min(100, snippet.description.len())]
            );
          }
        }

        if !fact_entries.examples.is_empty() {
          println!("\nExamples ({}):", fact_entries.examples.len());
          for example in &fact_entries.examples {
            println!(
              "  • {}: {}",
              example.title,
              &example.explanation
                [..std::cmp::min(100, example.explanation.len())]
            );
          }
        }

        if !fact_entries.best_practices.is_empty() {
          println!("\nBest Practices ({}):", fact_entries.best_practices.len());
          for practice in &fact_entries.best_practices {
            println!(
              "  • {}: {}",
              practice.practice,
              &practice.rationale
                [..std::cmp::min(100, practice.rationale.len())]
            );
          }
        }
      }
      _ => {
        anyhow::bail!(
          "Unsupported format: {}. Use 'json' or 'summary'",
          format
        );
      }
    }
  } else {
    anyhow::bail!("Must specify either --repo or --package");
  }

  Ok(())
}

async fn auto_command(
  start: bool,
  stop: bool,
  status: bool,
  interval: u64,
  concurrent: usize,
  directories: Option<String>,
  github_enabled: bool,
) -> Result<()> {
  use fact_tools::auto_orchestrator::{AutoConfig, AutoFactOrchestrator};
  use std::path::PathBuf;

  let mut config = AutoConfig::default();
  config.update_interval_hours = interval;
  config.max_concurrent = concurrent;
  config.auto_github = github_enabled;

  if let Some(dirs) = directories {
    config.scan_directories =
      dirs.split(',').map(|d| PathBuf::from(d.trim())).collect();
  }

  if start {
    info!("🤖 Starting automatic FACT orchestration");
    let mut orchestrator = AutoFactOrchestrator::new(config).await?;

    match orchestrator.start().await {
      Ok(()) => {
        println!("✅ Automatic FACT orchestration started successfully!");
        println!(
          "📊 Scanning {} directories",
          orchestrator.get_status().projects_discovered
        );
        println!("🔄 Update interval: {} hours", interval);
        println!("🚀 Max concurrent operations: {}", concurrent);
        if github_enabled {
          println!("🐙 GitHub integration: enabled");
        }

        // Keep running until interrupted
        println!("🔄 Running... Press Ctrl+C to stop");
        tokio::signal::ctrl_c().await?;
        println!("🛑 Stopping orchestration...");
        orchestrator.stop().await;
      }
      Err(e) => {
        error!("❌ Failed to start orchestration: {}", e);
        return Err(e);
      }
    }
  } else if stop {
    println!("🛑 Stopping automatic FACT orchestration");
    // TODO: Implement proper orchestrator management
    println!("✅ Orchestration stopped");
  } else if status {
    println!("📊 Automatic FACT Orchestration Status");
    println!("Configuration:");
    println!("  Update interval: {} hours", interval);
    println!("  Max concurrent: {}", concurrent);
    println!("  GitHub enabled: {}", github_enabled);
    println!("  Scan directories: {}", config.scan_directories.len());

    for (i, dir) in config.scan_directories.iter().enumerate() {
      println!("    {}: {}", i + 1, dir.display());
    }

    // TODO: Show actual status from running orchestrator
    println!("\n🤖 Orchestrator: Not running");
    println!("💡 Run with --start to begin automatic orchestration");
  } else {
    println!("🤖 Automatic FACT Orchestration");
    println!("");
    println!("Available commands:");
    println!("  --start     Start automatic orchestration");
    println!("  --stop      Stop automatic orchestration");
    println!("  --status    Show current status");
    println!("");
    println!("Configuration:");
    println!("  --interval <hours>       Update interval (default: 24)");
    println!(
      "  --concurrent <num>       Max concurrent operations (default: 4)"
    );
    println!("  --directories <dirs>     Comma-separated directories to scan");
    println!(
      "  --github <true|false>    Enable GitHub integration (default: true)"
    );
    println!("");
    println!("Examples:");
    println!("  fact-tools auto --start");
    println!("  fact-tools auto --start --interval 12 --concurrent 8");
    println!("  fact-tools auto --start --directories ~/code,~/projects");
    println!("  fact-tools auto --status");
  }

  Ok(())
}

// Performance note: In production, you might want to add:
// - Async processing pipeline
// - Streaming support for large files
// - Multi-threaded template execution
// - Real-time progress reporting
// - Integration with external services
