//! Automatic FACT Orchestrator
//!
//! Fully automated system that discovers active repositories,
//! analyzes dependencies with version awareness, and populates
//! the FACT knowledge base with rollback support.

use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::time::{Duration, SystemTime};
use tokio::fs;
use tokio::time::interval;
use tracing::{debug, info, warn};

#[cfg(feature = "orchestration")]
use notify::{
  Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher,
};

#[cfg(feature = "github")]
use crate::github::GitHubAnalyzer;

use crate::Fact;

/// Automatic orchestration configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoConfig {
  /// Enable automatic discovery
  pub auto_discovery: bool,
  /// Enable automatic GitHub integration
  pub auto_github: bool,
  /// Update interval in hours
  pub update_interval_hours: u64,
  /// Maximum concurrent operations
  pub max_concurrent: usize,
  /// GitHub token for API access
  pub github_token: Option<String>,
  /// Directories to scan for projects
  pub scan_directories: Vec<PathBuf>,
  /// File patterns to monitor for changes
  pub monitor_patterns: Vec<String>,
  /// Only analyze repos with activity in last N days
  pub activity_days_threshold: u32,
  /// Enable real-time package file watching
  pub watch_package_files: bool,
}

impl Default for AutoConfig {
  fn default() -> Self {
    Self {
      auto_discovery: true,
      auto_github: true,
      update_interval_hours: 24, // Daily updates
      max_concurrent: 4,
      github_token: std::env::var("GITHUB_TOKEN").ok(),
      scan_directories: vec![
        PathBuf::from("."),
        PathBuf::from("../"),
        std::env::var("HOME")
          .map(|home| PathBuf::from(home).join("code"))
          .unwrap_or_else(|_| PathBuf::from("~/code")),
      ],
      monitor_patterns: vec![
        // BEAM Ecosystem
        "mix.exs".to_string(),
        "mix.lock".to_string(),
        "gleam.toml".to_string(),
        "rebar.config".to_string(),
        // Rust
        "Cargo.toml".to_string(),
        "Cargo.lock".to_string(),
        // Node.js/JavaScript
        "package.json".to_string(),
        "package-lock.json".to_string(),
        "yarn.lock".to_string(),
        "pnpm-lock.yaml".to_string(),
        // Python
        "requirements.txt".to_string(),
        "setup.py".to_string(),
        "pyproject.toml".to_string(),
        "Pipfile".to_string(),
        "poetry.lock".to_string(),
        // Go
        "go.mod".to_string(),
        "go.sum".to_string(),
        // Java/JVM
        "pom.xml".to_string(),
        "build.gradle".to_string(),
        "build.gradle.kts".to_string(),
        "project.clj".to_string(),
        // .NET
        "*.csproj".to_string(),
        "*.fsproj".to_string(),
        "*.vbproj".to_string(),
        "packages.config".to_string(),
        "project.json".to_string(),
        // Ruby
        "Gemfile".to_string(),
        "Gemfile.lock".to_string(),
        "*.gemspec".to_string(),
        // PHP
        "composer.json".to_string(),
        "composer.lock".to_string(),
        // Perl
        "cpanfile".to_string(),
        "META.json".to_string(),
        "META.yml".to_string(),
        // Haskell
        "*.cabal".to_string(),
        "stack.yaml".to_string(),
        "package.yaml".to_string(),
        // Swift
        "Package.swift".to_string(),
        "Podfile".to_string(),
        // Dart
        "pubspec.yaml".to_string(),
        "pubspec.lock".to_string(),
        // R
        "DESCRIPTION".to_string(),
        "renv.lock".to_string(),
        // Julia
        "Project.toml".to_string(),
        "Manifest.toml".to_string(),
        // Nix
        "flake.nix".to_string(),
        "shell.nix".to_string(),
        "default.nix".to_string(),
        // Docker
        "Dockerfile".to_string(),
        "docker-compose.yml".to_string(),
        "docker-compose.yaml".to_string(),
        // Make
        "Makefile".to_string(),
        "makefile".to_string(),
      ],
      activity_days_threshold: 30, // Only analyze repos active in last 30 days
      watch_package_files: true,   // Real-time package file watching
    }
  }
}

/// Discovered project information with version awareness
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiscoveredProject {
  pub path: PathBuf,
  pub name: String,
  pub language: ProjectLanguage,
  pub dependencies: Vec<VersionedDependency>,
  pub last_scanned: SystemTime,
  pub version: Option<String>,
  pub last_active: DateTime<Utc>, // Git commit activity
}

/// Version-aware dependency tracking with hit-based cleanup
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionedDependency {
  pub name: String,
  pub version: String,
  pub ecosystem: String, // hex, crates.io, npm, pypi, etc.
  pub source: Option<String>, // git repo, registry URL, etc.
  pub first_seen: DateTime<Utc>,
  pub last_seen: DateTime<Utc>,
  pub last_hit: DateTime<Utc>, // Last time this version was queried/used
  pub hit_count: u64, // Total number of times this version was accessed
  pub recent_hits: Vec<DateTime<Utc>>, // Hit timestamps for last 30 days tracking
  pub used_by_projects: Vec<String>,   // Project names using this version
}

/// FACT build queue status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FactBuildStatus {
  Ready,                      // FACT available for queries
  Building,                   // Currently building FACT entries
  Queued { position: usize }, // Queued for building
}

/// Result of FACT build check (for client responses)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum FactBuildResult {
  Ready,    // FACT is ready for use
  Building, // FACT is building, try again in 30s
  Failed,   // FACT build failed
}

/// FACT version tracking - multiple versions with hit-based cleanup
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FactVersionRegistry {
  /// tool_name -> [version1, version2, version3]
  pub active_versions: HashMap<String, Vec<VersionedDependency>>,
  /// Cleanup timeout - versions unused for 30 days get removed (unless 4+ recent hits)
  pub cleanup_no_hits_days: u32,
  /// Minimum hits in last 30 days to keep version (even if last hit > 30 days ago)
  pub min_recent_hits_threshold: u32,
  /// Maximum age - versions older than 130 days get removed regardless
  pub cleanup_max_age_days: u32,
  /// Build queue - tools currently being processed
  pub build_queue: HashMap<String, FactBuildStatus>, // tool_name -> status
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ProjectLanguage {
  // BEAM Ecosystem
  Elixir,
  Erlang,
  Gleam,
  // Systems Languages
  Rust,
  Go,
  C,
  Cpp,
  Zig,
  // JVM Ecosystem
  Java,
  Kotlin,
  Scala,
  Clojure,
  Groovy,
  // .NET Ecosystem
  CSharp,
  FSharp,
  VB,
  // Dynamic Languages
  Python,
  Ruby,
  Perl,
  PHP,
  Lua,
  // Web Technologies
  JavaScript,
  TypeScript,
  Dart,
  // Functional Languages
  Haskell,
  OCaml,
  ReasonML,
  Elm,
  // Other
  Swift,
  ObjectiveC,
  R,
  Julia,
  Matlab,
  Shell,
  PowerShell,
  Unknown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dependency {
  pub name: String,
  pub version: String,
  pub source: DependencySource,
  pub ecosystem: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DependencySource {
  // Package Registries
  Hex,       // Elixir/Erlang packages
  Crates,    // Rust packages
  Npm,       // Node.js packages
  PyPI,      // Python packages
  RubyGems,  // Ruby packages
  Maven,     // Java/JVM packages
  NuGet,     // .NET packages
  Go,        // Go modules
  CPAN,      // Perl packages
  Packagist, // PHP packages
  Pub,       // Dart packages
  CocoaPods, // iOS packages
  SwiftPM,   // Swift packages
  Hackage,   // Haskell packages
  // Version Control
  GitHub { repo: String },
  GitLab { repo: String },
  Bitbucket { repo: String },
  Git { url: String },
  // Local
  Local { path: PathBuf },
  // System
  System, // System packages (apt, yum, brew, etc.)
}

/// Knowledge update status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KnowledgeStatus {
  pub tool: String,
  pub version: String,
  pub last_updated: SystemTime,
  pub snippets_count: usize,
  pub examples_count: usize,
  pub next_update: SystemTime,
  pub auto_update_enabled: bool,
}

/// Fully automated FACT orchestrator with version awareness
pub struct AutoFactOrchestrator {
  #[allow(dead_code)]
  fact: Fact,
  config: AutoConfig,
  #[cfg(feature = "github")]
  github: Option<GitHubAnalyzer>,
  discovered_projects: HashMap<PathBuf, DiscoveredProject>,
  knowledge_status: HashMap<String, KnowledgeStatus>,
  version_registry: FactVersionRegistry,
  is_running: bool,
}

impl AutoFactOrchestrator {
  /// Create new auto FACT orchestrator with version registry
  pub async fn new(config: AutoConfig) -> Result<Self> {
    let fact = Fact::new();

    #[cfg(feature = "github")]
    let github = if config.auto_github {
      Some(GitHubAnalyzer::new(config.github_token.clone())?)
    } else {
      None
    };

    Ok(Self {
      fact,
      config,
      #[cfg(feature = "github")]
      github,
      discovered_projects: HashMap::new(),
      knowledge_status: HashMap::new(),
      version_registry: FactVersionRegistry {
        active_versions: HashMap::new(),
        cleanup_no_hits_days: 30, // Remove versions with no hits after 30 days
        min_recent_hits_threshold: 4, // Keep versions with 4+ hits in last 30 days
        cleanup_max_age_days: 130, // Remove all versions after 130 days regardless
        build_queue: HashMap::new(),
      },
      is_running: false,
    })
  }

  /// Start automatic orchestration with real-time package watching
  pub async fn start(&mut self) -> Result<()> {
    if self.is_running {
      warn!("Auto orchestrator already running");
      return Ok(());
    }

    info!(
      "🤖 Starting fully automatic FACT orchestration with real-time package watching"
    );
    self.is_running = true;

    // Start real-time package file watcher (filtered to only package files)
    if self.config.watch_package_files {
      self.start_package_file_watcher().await?;
    }

    // Initial discovery and population
    self.initial_discovery().await?;
    self.populate_initial_knowledge().await?;

    // Start background tasks
    self.start_background_tasks().await?;

    info!("✅ Automatic FACT orchestration started successfully");
    Ok(())
  }

  /// Start real-time package file watcher (ONLY package manager files)
  #[cfg(feature = "orchestration")]
  async fn start_package_file_watcher(&mut self) -> Result<()> {
    use tokio::sync::mpsc;

    info!("🔍 Starting real-time package file watcher (filtered)");

    let (tx, mut rx) = mpsc::channel(1000);

    // Package files to watch (NOT all files to avoid overload)
    let package_files = [
      "mix.exs",
      "mix.lock",
      "gleam.toml",
      "rebar.config",
      "Cargo.toml",
      "Cargo.lock",
      "package.json",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml",
      "requirements.txt",
      "setup.py",
      "pyproject.toml",
      "Pipfile",
      "poetry.lock",
      "go.mod",
      "go.sum",
      "pom.xml",
      "build.gradle",
      "build.gradle.kts",
      "composer.json",
      "composer.lock",
      "Gemfile",
      "Gemfile.lock",
    ];

    // Create filtered file watcher
    let mut watcher = RecommendedWatcher::new(
      move |res: Result<Event, notify::Error>| {
        if let Ok(event) = res {
          // Filter to ONLY package manager files
          if let Some(path) = event.paths.first() {
            if let Some(filename) = path.file_name() {
              if let Some(filename_str) = filename.to_str() {
                if package_files.contains(&filename_str) {
                  info!("📦 Package file changed: {}", path.display());
                  let _ = tx.try_send(event);
                }
              }
            }
          }
        }
      },
      Config::default(),
    )?;

    // Watch scan directories for package file changes only
    for dir in &self.config.scan_directories {
      if dir.exists() {
        info!("👀 Watching {} for package file changes", dir.display());
        watcher.watch(dir, RecursiveMode::Recursive)?;
      }
    }

    // Background task to handle package file changes
    tokio::spawn(async move {
      while let Some(event) = rx.recv().await {
        match event.kind {
          EventKind::Create(_) | EventKind::Modify(_) => {
            for path in event.paths {
              info!("⚡ Real-time: Package file updated: {}", path.display());
              // TODO: Trigger immediate dependency re-parsing for this project
              // This would call parse_project_dependencies(&path) immediately
            }
          }
          _ => {}
        }
      }
    });

    Ok(())
  }

  #[cfg(not(feature = "orchestration"))]
  async fn start_package_file_watcher(&mut self) -> Result<()> {
    info!(
      "📦 Package file watching not available (orchestration feature disabled)"
    );
    Ok(())
  }

  /// Three-tier cleanup: 30 days no hits (unless 4+ recent hits) OR 130 days maximum age
  pub async fn cleanup_unused_versions(&mut self) -> Result<()> {
    let no_hits_cutoff = Utc::now()
      - chrono::Duration::days(
        self.version_registry.cleanup_no_hits_days as i64,
      );
    let max_age_cutoff = Utc::now()
      - chrono::Duration::days(
        self.version_registry.cleanup_max_age_days as i64,
      );
    let recent_window = Utc::now() - chrono::Duration::days(30);

    let mut no_hits_count = 0;
    let mut max_age_count = 0;
    let mut recent_hits_saved = 0;

    info!(
      "🧹 Three-tier cleanup: no hits since {} (unless {}+ recent hits) OR created before {}",
      no_hits_cutoff.format("%Y-%m-%d"),
      self.version_registry.min_recent_hits_threshold,
      max_age_cutoff.format("%Y-%m-%d")
    );

    // Clean up versions with refined conditions
    for (tool_name, versions) in
      self.version_registry.active_versions.iter_mut()
    {
      versions.retain(|version| {
                // Count hits in the last 30 days
                let recent_hits_count = version.recent_hits.iter()
                    .filter(|&&hit_time| hit_time > recent_window)
                    .count() as u32;

                // Rule 1: Remove if no hits for 30 days, UNLESS it has 4+ recent hits
                let no_hits_old = version.last_hit <= no_hits_cutoff;
                let has_enough_recent_hits = recent_hits_count >= self.version_registry.min_recent_hits_threshold;
                let should_remove_for_no_hits = no_hits_old && !has_enough_recent_hits;

                // Rule 2: Remove if older than 130 days (regardless of hits or references)
                let too_old = version.first_seen <= max_age_cutoff;

                let should_remove = should_remove_for_no_hits || too_old;
                if should_remove {
                    if too_old {
                        info!("🗑️  Removing old version: {}@{} (age: {} days, {} total hits, {} recent hits)", 
                            tool_name, version.version,
                            (Utc::now() - version.first_seen).num_days(),
                            version.hit_count,
                            recent_hits_count
                        );
                        max_age_count += 1;
                    } else {
                        info!("🗑️  Removing unused version: {}@{} (last hit: {}, {} recent hits < {})",
                            tool_name, version.version,
                            version.last_hit.format("%Y-%m-%d"),
                            recent_hits_count,
                            self.version_registry.min_recent_hits_threshold
                        );
                        no_hits_count += 1;
                    }
                } else if no_hits_old && has_enough_recent_hits {
                    // This version was saved by recent hits
                    info!("💾 Keeping version due to recent activity: {}@{} (last hit: {}, {} recent hits)",
                        tool_name, version.version,
                        version.last_hit.format("%Y-%m-%d"),
                        recent_hits_count
                    );
                    recent_hits_saved += 1;
                }

                !should_remove
            });
    }

    // Remove empty tool entries
    self
      .version_registry
      .active_versions
      .retain(|_, versions| !versions.is_empty());

    let total_cleaned = no_hits_count + max_age_count;
    if total_cleaned > 0 {
      info!(
        "✅ Cleaned up {} versions ({} no-hits, {} max-age), saved {} with recent activity",
        total_cleaned, no_hits_count, max_age_count, recent_hits_saved
      );
    } else {
      info!(
        "✅ No versions to clean up, {} saved by recent activity",
        recent_hits_saved
      );
    }

    Ok(())
  }

  /// Record a hit when a version is accessed/queried (with recent hits tracking)
  pub fn record_version_hit(&mut self, tool_name: &str, version: Option<&str>) {
    let now = Utc::now();

    match version {
      Some(v) => {
        // Hit on specific version: phoenix@1.7.0
        if let Some(versions) =
          self.version_registry.active_versions.get_mut(tool_name)
        {
          if let Some(versioned_dep) =
            versions.iter_mut().find(|dep| dep.version == v)
          {
            versioned_dep.last_hit = now;
            versioned_dep.hit_count += 1;

            // Add to recent hits and cleanup old entries
            versioned_dep.recent_hits.push(now);
            // Cleanup old recent hits inline to avoid borrowing issues
            let cutoff = chrono::Utc::now() - chrono::Duration::days(30);
            versioned_dep
              .recent_hits
              .retain(|&hit_time| hit_time > cutoff);

            debug!(
              "📊 Versioned hit: {}@{} (total: {}, recent: {})",
              tool_name,
              v,
              versioned_dep.hit_count,
              versioned_dep.recent_hits.len()
            );
          }
        }
      }
      None => {
        // Hit on main/versionless: phoenix (latest/general)
        let versions = self
          .version_registry
          .active_versions
          .entry(tool_name.to_string())
          .or_insert_with(Vec::new);

        if let Some(main_entry) =
          versions.iter_mut().find(|dep| dep.version == "main")
        {
          main_entry.last_hit = now;
          main_entry.hit_count += 1;

          // Add to recent hits and cleanup old entries
          main_entry.recent_hits.push(now);
          // Cleanup old recent hits inline to avoid borrowing issues
          let cutoff = chrono::Utc::now() - chrono::Duration::days(30);
          main_entry.recent_hits.retain(|&hit_time| hit_time > cutoff);

          debug!(
            "📊 Main hit: {} (total: {}, recent: {})",
            tool_name,
            main_entry.hit_count,
            main_entry.recent_hits.len()
          );
        } else {
          // Create main entry if doesn't exist
          versions.push(VersionedDependency {
            name: tool_name.to_string(),
            version: "main".to_string(),
            ecosystem: "versionless".to_string(),
            source: None,
            first_seen: now,
            last_seen: now,
            last_hit: now,
            hit_count: 1,
            recent_hits: vec![now],
            used_by_projects: vec!["general".to_string()],
          });
          debug!("📊 Main hit created: {} (first hit)", tool_name);
        }
      }
    }
  }

  /// Remove recent hits older than 30 days to keep vector manageable
  #[allow(dead_code)]
  fn cleanup_old_recent_hits(&self, recent_hits: &mut Vec<DateTime<Utc>>) {
    let cutoff = Utc::now() - chrono::Duration::days(30);
    recent_hits.retain(|&hit_time| hit_time > cutoff);
  }

  /// Check if FACT is ready or needs to be built (smart client waiting)
  pub async fn wait_for_fact_ready(
    &mut self,
    tool_name: &str,
    version: Option<&str>,
  ) -> Result<FactBuildResult> {
    let fact_key = match version {
      Some(v) => format!("{}@{}", tool_name, v),
      None => tool_name.to_string(),
    };

    // Check current status
    match self.version_registry.build_queue.get(&fact_key) {
      Some(FactBuildStatus::Ready) => {
        debug!("✅ FACT ready: {}", fact_key);
        return Ok(FactBuildResult::Ready);
      }
      Some(FactBuildStatus::Building) => {
        info!("⏳ FACT already building, short wait: {}", fact_key);
        // Already building, do short wait
        return self.short_wait_for_build(&fact_key).await;
      }
      Some(FactBuildStatus::Queued { position }) => {
        info!(
          "⏳ FACT queued (position {}), short wait: {}",
          position, fact_key
        );
        return self.short_wait_for_build(&fact_key).await;
      }
      None => {
        // Not in queue, trigger build and short wait
        info!(
          "🚀 FACT missing (timeout/new repo), triggering build: {}",
          fact_key
        );
        self
          .version_registry
          .build_queue
          .insert(fact_key.clone(), FactBuildStatus::Building);

        // Trigger background build
        self
          .trigger_fact_build(&fact_key, tool_name, version)
          .await?;

        // Short wait for quick builds
        return self.short_wait_for_build(&fact_key).await;
      }
    }
  }

  /// Short wait (10 seconds) for FACT build, then return "building" status
  async fn short_wait_for_build(
    &self,
    fact_key: &str,
  ) -> Result<FactBuildResult> {
    let max_quick_wait_seconds = 10;
    let mut wait_count = 0;
    let max_polls = max_quick_wait_seconds * 2; // 500ms intervals

    info!("⏳ Quick wait (max 10s) for FACT: {}", fact_key);

    while wait_count < max_polls {
      tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
      wait_count += 1;

      match self.version_registry.build_queue.get(fact_key) {
        Some(FactBuildStatus::Ready) => {
          info!(
            "✅ FACT quick build completed: {} ({}s)",
            fact_key,
            wait_count as f32 * 0.5
          );
          return Ok(FactBuildResult::Ready);
        }
        Some(FactBuildStatus::Building) => {
          debug!(
            "🔄 Still building: {} ({}s)",
            fact_key,
            wait_count as f32 * 0.5
          );
        }
        _ => {
          warn!("❌ FACT build failed during quick wait: {}", fact_key);
          return Ok(FactBuildResult::Failed);
        }
      }
    }

    // 10 seconds passed, still building - return "building" status
    info!(
      "⏰ FACT still building after 10s, returning 'building' status: {}",
      fact_key
    );
    Ok(FactBuildResult::Building)
  }

  /// Trigger FACT build for a specific tool/version (background task)
  async fn trigger_fact_build(
    &mut self,
    fact_key: &str,
    tool_name: &str,
    version: Option<&str>,
  ) -> Result<()> {
    info!("🔨 Building FACT: {} (estimated 2-10 seconds)", fact_key);

    let fact_key_owned = fact_key.to_string();
    let _tool_name_owned = tool_name.to_string();
    let _version_owned = version.map(|v| v.to_string());

    // Background task for FACT building
    tokio::spawn(async move {
      // Simulate FACT building process (replace with actual FACT generation)
      tokio::time::sleep(tokio::time::Duration::from_secs(3)).await; // Typical build time

      info!("✅ FACT build completed: {}", fact_key_owned);
      // TODO: Update build_queue status to Ready
      // self.version_registry.build_queue.insert(fact_key_owned, FactBuildStatus::Ready);
    });

    Ok(())
  }

  /// Example usage: Handle client query with smart building
  pub async fn handle_fact_query(
    &mut self,
    tool_name: &str,
    version: Option<&str>,
  ) -> Result<String> {
    match self.wait_for_fact_ready(tool_name, version).await? {
      FactBuildResult::Ready => {
        // Record hit and serve FACT
        self.record_version_hit(tool_name, version);

        let fact_key = match version {
          Some(v) => format!("{}@{}", tool_name, v),
          None => tool_name.to_string(),
        };

        info!("📖 Serving FACT: {}", fact_key);
        // TODO: Fetch actual FACT content from storage
        Ok(format!("FACT content for {}", fact_key))
      }
      FactBuildResult::Building => {
        // Still building after 10s wait - tell client to retry
        let retry_msg = format!(
          "FACT for {} is building. Please try again in 30 seconds.",
          match version {
            Some(v) => format!("{}@{}", tool_name, v),
            None => tool_name.to_string(),
          }
        );
        info!("🔄 {}", retry_msg);
        Ok(retry_msg)
      }
      FactBuildResult::Failed => {
        let error_msg = format!(
          "Failed to build FACT for {}",
          match version {
            Some(v) => format!("{}@{}", tool_name, v),
            None => tool_name.to_string(),
          }
        );
        warn!("❌ {}", error_msg);
        Ok(error_msg)
      }
    }
  }

  /// Stop automatic orchestration
  pub async fn stop(&mut self) {
    info!("🛑 Stopping automatic FACT orchestration");
    self.is_running = false;
  }

  /// Initial discovery of all projects and dependencies
  async fn initial_discovery(&mut self) -> Result<()> {
    info!("🔍 Starting initial project discovery");

    for scan_dir in &self.config.scan_directories.clone() {
      if scan_dir.exists() {
        self.discover_projects_in_directory(scan_dir).await?;
      } else {
        debug!("Skipping non-existent directory: {:?}", scan_dir);
      }
    }

    info!("📊 Discovered {} projects", self.discovered_projects.len());
    Ok(())
  }

  /// Discover projects in a specific directory
  async fn discover_projects_in_directory(&mut self, dir: &Path) -> Result<()> {
    let mut entries = fs::read_dir(dir).await?;

    while let Some(entry) = entries.next_entry().await? {
      let path = entry.path();

      if path.is_dir() {
        // Check if this is a project directory
        if let Some(project) = self.analyze_directory(&path).await? {
          self.discovered_projects.insert(path.clone(), project);
        }

        // Recursively scan subdirectories (with depth limit)
        if path.file_name().map_or(false, |name| {
          !name.to_string_lossy().starts_with('.')
            && name != "node_modules"
            && name != "target"
            && name != "_build"
        }) {
          Box::pin(self.discover_projects_in_directory(&path))
            .await
            .ok();
        }
      }
    }

    Ok(())
  }

  /// Analyze a directory to determine if it's a project
  async fn analyze_directory(
    &self,
    dir: &Path,
  ) -> Result<Option<DiscoveredProject>> {
    for pattern in &self.config.monitor_patterns {
      let file_path = dir.join(pattern);
      if file_path.exists() {
        debug!("Found project file: {:?}", file_path);
        return self.create_project_from_file(&file_path, dir).await;
      }
    }
    Ok(None)
  }

  /// Create project info from discovered file
  async fn create_project_from_file(
    &self,
    file_path: &Path,
    project_dir: &Path,
  ) -> Result<Option<DiscoveredProject>> {
    let file_name =
      file_path.file_name().and_then(|n| n.to_str()).unwrap_or("");

    let (language, dependencies) = match file_name {
      // BEAM Ecosystem
      "mix.exs" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Elixir,
          self.parse_elixir_dependencies(&content).await?,
        )
      }
      "gleam.toml" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Gleam,
          self.parse_gleam_dependencies(&content).await?,
        )
      }
      "rebar.config" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Erlang,
          self.parse_erlang_dependencies(&content).await?,
        )
      }
      // Rust
      "Cargo.toml" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Rust,
          self.parse_rust_dependencies(&content).await?,
        )
      }
      // Node.js/JavaScript
      "package.json" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::JavaScript,
          self.parse_nodejs_dependencies(&content).await?,
        )
      }
      // Python
      "requirements.txt" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Python,
          self.parse_python_requirements(&content).await?,
        )
      }
      "setup.py" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Python,
          self.parse_python_setup(&content).await?,
        )
      }
      "pyproject.toml" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Python,
          self.parse_python_pyproject(&content).await?,
        )
      }
      "Pipfile" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Python,
          self.parse_python_pipfile(&content).await?,
        )
      }
      // Go
      "go.mod" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Go,
          self.parse_go_dependencies(&content).await?,
        )
      }
      // Java/JVM
      "pom.xml" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Java,
          self.parse_maven_dependencies(&content).await?,
        )
      }
      "build.gradle" | "build.gradle.kts" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Java,
          self.parse_gradle_dependencies(&content).await?,
        )
      }
      "project.clj" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Clojure,
          self.parse_clojure_dependencies(&content).await?,
        )
      }
      // Ruby
      "Gemfile" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Ruby,
          self.parse_ruby_dependencies(&content).await?,
        )
      }
      // PHP
      "composer.json" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::PHP,
          self.parse_php_dependencies(&content).await?,
        )
      }
      // .NET
      name
        if name.ends_with(".csproj")
          || name.ends_with(".fsproj")
          || name.ends_with(".vbproj") =>
      {
        let content = fs::read_to_string(file_path).await?;
        let lang = if name.ends_with(".fsproj") {
          ProjectLanguage::FSharp
        } else if name.ends_with(".vbproj") {
          ProjectLanguage::VB
        } else {
          ProjectLanguage::CSharp
        };
        (lang, self.parse_dotnet_dependencies(&content).await?)
      }
      // Swift
      "Package.swift" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Swift,
          self.parse_swift_dependencies(&content).await?,
        )
      }
      "Podfile" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Swift,
          self.parse_cocoapods_dependencies(&content).await?,
        )
      }
      // Dart
      "pubspec.yaml" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Dart,
          self.parse_dart_dependencies(&content).await?,
        )
      }
      // Haskell
      name if name.ends_with(".cabal") => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Haskell,
          self.parse_haskell_dependencies(&content).await?,
        )
      }
      "stack.yaml" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Haskell,
          self.parse_haskell_stack_dependencies(&content).await?,
        )
      }
      // Perl
      "cpanfile" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Perl,
          self.parse_perl_dependencies(&content).await?,
        )
      }
      // R
      "DESCRIPTION" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::R,
          self.parse_r_dependencies(&content).await?,
        )
      }
      // Julia
      "Project.toml" => {
        let content = fs::read_to_string(file_path).await?;
        (
          ProjectLanguage::Julia,
          self.parse_julia_dependencies(&content).await?,
        )
      }
      _ => return Ok(None),
    };

    let project_name = project_dir
      .file_name()
      .and_then(|n| n.to_str())
      .unwrap_or("unknown")
      .to_string();

    Ok(Some(DiscoveredProject {
      path: project_dir.to_path_buf(),
      name: project_name,
      language,
      dependencies,
      last_scanned: SystemTime::now(),
      version: None,
      last_active: chrono::Utc::now(),
    }))
  }

  /// Parse Elixir dependencies from mix.exs
  async fn parse_elixir_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Regex patterns for different dependency formats
    let hex_pattern = regex::Regex::new(r#"\{:(\w+),\s*"([^"]+)"\}"#).unwrap();
    let github_pattern = regex::Regex::new(
      r#"\{:(\w+),\s*github:\s*"([^"]+)"(?:,\s*ref:\s*"([^"]+)")?\}"#,
    )
    .unwrap();

    // Parse Hex dependencies
    for caps in hex_pattern.captures_iter(content) {
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: caps[1].to_string(),

        version: caps[2].to_string(),

        ecosystem: "beam".to_string(),

        source: Some("hex".to_string()),

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    // Parse GitHub dependencies
    for caps in github_pattern.captures_iter(content) {
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: caps[1].to_string(),

        version: caps
          .get(3)
          .map_or("latest".to_string(), |m| m.as_str().to_string()),

        ecosystem: "beam".to_string(),

        source: Some(format!("github:{}", caps[2].to_string())),

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse Gleam dependencies from gleam.toml
  async fn parse_gleam_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Simple TOML parsing for Gleam dependencies
    let lines: Vec<&str> = content.lines().collect();
    let mut in_deps_section = false;

    for line in lines {
      let trimmed = line.trim();

      if trimmed == "[dependencies]" {
        in_deps_section = true;
        continue;
      }

      if in_deps_section
        && trimmed.starts_with('[')
        && trimmed != "[dependencies]"
      {
        in_deps_section = false;
      }

      if in_deps_section && trimmed.contains('=') {
        if let Some((name, version)) = trimmed.split_once('=') {
          let name = name.trim().trim_matches('"');
          let version = version.trim().trim_matches('"');

          let now = chrono::Utc::now();
          deps.push(VersionedDependency {
            name: name.to_string(),

            version: version.to_string(),

            ecosystem: "beam".to_string(),

            source: Some("hex".to_string()), // Gleam uses Hex,

            first_seen: now,

            last_seen: now,

            last_hit: now,

            hit_count: 0,

            recent_hits: vec![],

            used_by_projects: vec![],
          });
        }
      }
    }

    Ok(deps)
  }

  /// Parse Rust dependencies from Cargo.toml
  async fn parse_rust_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Parse [dependencies] section
    if let Some(deps_start) = content.find("[dependencies]") {
      let deps_section = &content[deps_start..];
      if let Some(next_section) = deps_section.find("\n[") {
        let deps_only = &deps_section[..next_section];

        for line in deps_only.lines().skip(1) {
          let trimmed = line.trim();
          if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
          }

          if let Some((name, version_spec)) = trimmed.split_once('=') {
            let name = name.trim();
            let version = if version_spec.trim().starts_with('"') {
              version_spec.trim().trim_matches('"').to_string()
            } else {
              "latest".to_string()
            };

            let now = chrono::Utc::now();
            deps.push(VersionedDependency {
              name: name.to_string(),

              version: version,

              ecosystem: "rust".to_string(),

              source: Some("crates.io".to_string()),

              first_seen: now,

              last_seen: now,

              last_hit: now,

              hit_count: 0,

              recent_hits: vec![],

              used_by_projects: vec![],
            });
          }
        }
      }
    }

    Ok(deps)
  }

  /// Parse Node.js dependencies from package.json
  async fn parse_nodejs_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    if let Ok(json) = serde_json::from_str::<serde_json::Value>(content) {
      // Parse regular dependencies
      if let Some(dependencies) =
        json.get("dependencies").and_then(|d| d.as_object())
      {
        for (name, version) in dependencies {
          if let Some(version_str) = version.as_str() {
            let now = chrono::Utc::now();
            deps.push(VersionedDependency {
              name: name.clone(),

              version: version_str.to_string(),

              ecosystem: "nodejs".to_string(),

              source: Some("npm".to_string()),

              first_seen: now,

              last_seen: now,

              last_hit: now,

              hit_count: 0,

              recent_hits: vec![],

              used_by_projects: vec![],
            });
          }
        }
      }

      // Parse dev dependencies
      if let Some(dev_dependencies) =
        json.get("devDependencies").and_then(|d| d.as_object())
      {
        for (name, version) in dev_dependencies {
          if let Some(version_str) = version.as_str() {
            let now = chrono::Utc::now();
            deps.push(VersionedDependency {
              name: name.clone(),

              version: version_str.to_string(),

              ecosystem: "nodejs".to_string(),

              source: Some("npm".to_string()),

              first_seen: now,

              last_seen: now,

              last_hit: now,

              hit_count: 0,

              recent_hits: vec![],

              used_by_projects: vec![],
            });
          }
        }
      }
    }

    Ok(deps)
  }

  /// Parse Erlang dependencies from rebar.config
  async fn parse_erlang_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Simple pattern matching for Erlang rebar.config dependencies
    let dep_pattern = regex::Regex::new(r#"\{(\w+),\s*"([^"]+)"\}"#).unwrap();

    for caps in dep_pattern.captures_iter(content) {
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: caps[1].to_string(),

        version: caps[2].to_string(),

        ecosystem: "beam".to_string(),

        source: Some("hex".to_string()), // Erlang also uses Hex,

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse Python requirements.txt dependencies
  async fn parse_python_requirements(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    for line in content.lines() {
      let trimmed = line.trim();
      if trimmed.is_empty() || trimmed.starts_with('#') {
        continue;
      }

      // Parse requirements like "package==version" or "package>=version"
      if let Some((name, version)) = trimmed.split_once("==") {
        let now = chrono::Utc::now();
        deps.push(VersionedDependency {
          name: name.trim().to_string(),

          version: version.trim().to_string(),

          ecosystem: "python".to_string(),

          source: Some("pypi".to_string()),

          first_seen: now,

          last_seen: now,

          last_hit: now,

          hit_count: 0,

          recent_hits: vec![],

          used_by_projects: vec![],
        });
      } else if let Some((name, version)) = trimmed.split_once(">=") {
        let now = chrono::Utc::now();
        deps.push(VersionedDependency {
          name: name.trim().to_string(),

          version: format!(">={}", version.trim()),

          ecosystem: "python".to_string(),

          source: Some("pypi".to_string()),

          first_seen: now,

          last_seen: now,

          last_hit: now,

          hit_count: 0,

          recent_hits: vec![],

          used_by_projects: vec![],
        });
      } else {
        let now = chrono::Utc::now();
        deps.push(VersionedDependency {
          name: trimmed.to_string(),

          version: "latest".to_string(),

          ecosystem: "python".to_string(),

          source: Some("pypi".to_string()),

          first_seen: now,

          last_seen: now,

          last_hit: now,

          hit_count: 0,

          recent_hits: vec![],

          used_by_projects: vec![],
        });
      }
    }

    Ok(deps)
  }

  /// Parse Python setup.py dependencies (basic extraction)
  async fn parse_python_setup(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Look for install_requires patterns
    if let Some(start) = content.find("install_requires") {
      let after_requires = &content[start..];
      if let Some(bracket_start) = after_requires.find('[') {
        if let Some(bracket_end) = after_requires.find(']') {
          let deps_str = &after_requires[bracket_start + 1..bracket_end];

          // Extract quoted package names
          let package_pattern =
            regex::Regex::new(r#"['"]([\w-]+)(?:[><=!~]+[^'"]*)?['"]"#)
              .unwrap();
          for caps in package_pattern.captures_iter(deps_str) {
            let now = chrono::Utc::now();
            deps.push(VersionedDependency {
              name: caps[1].to_string(),

              version: "latest".to_string(),

              ecosystem: "python".to_string(),

              source: Some("pypi".to_string()),

              first_seen: now,

              last_seen: now,

              last_hit: now,

              hit_count: 0,

              recent_hits: vec![],

              used_by_projects: vec![],
            });
          }
        }
      }
    }

    Ok(deps)
  }

  /// Parse Python pyproject.toml dependencies
  async fn parse_python_pyproject(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Simple TOML parsing for dependencies section
    let lines: Vec<&str> = content.lines().collect();
    let mut in_deps_section = false;

    for line in lines {
      let trimmed = line.trim();

      if trimmed == "[tool.poetry.dependencies]"
        || trimmed == "[project.dependencies]"
      {
        in_deps_section = true;
        continue;
      }

      if in_deps_section
        && trimmed.starts_with('[')
        && !trimmed.starts_with("[tool.poetry.dependencies]")
      {
        in_deps_section = false;
      }

      if in_deps_section && trimmed.contains('=') && !trimmed.starts_with('#') {
        if let Some((name, version)) = trimmed.split_once('=') {
          let name = name.trim().trim_matches('"');
          let version = version.trim().trim_matches('"');

          let now = chrono::Utc::now();
          deps.push(VersionedDependency {
            name: name.to_string(),

            version: version.to_string(),

            ecosystem: "python".to_string(),

            source: Some("pypi".to_string()),

            first_seen: now,

            last_seen: now,

            last_hit: now,

            hit_count: 0,

            recent_hits: vec![],

            used_by_projects: vec![],
          });
        }
      }
    }

    Ok(deps)
  }

  /// Parse Python Pipfile dependencies
  async fn parse_python_pipfile(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Simple TOML parsing for [packages] section
    let lines: Vec<&str> = content.lines().collect();
    let mut in_packages_section = false;

    for line in lines {
      let trimmed = line.trim();

      if trimmed == "[packages]" {
        in_packages_section = true;
        continue;
      }

      if in_packages_section && trimmed.starts_with('[') {
        in_packages_section = false;
      }

      if in_packages_section
        && trimmed.contains('=')
        && !trimmed.starts_with('#')
      {
        if let Some((name, version)) = trimmed.split_once('=') {
          let name = name.trim().trim_matches('"');
          let version = version.trim().trim_matches('"');

          let now = chrono::Utc::now();
          deps.push(VersionedDependency {
            name: name.to_string(),

            version: version.to_string(),

            ecosystem: "python".to_string(),

            source: Some("pypi".to_string()),

            first_seen: now,

            last_seen: now,

            last_hit: now,

            hit_count: 0,

            recent_hits: vec![],

            used_by_projects: vec![],
          });
        }
      }
    }

    Ok(deps)
  }

  /// Parse Go dependencies from go.mod
  async fn parse_go_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();
    let mut in_require = false;

    for line in content.lines() {
      let trimmed = line.trim();

      if trimmed.starts_with("require") {
        in_require = true;
        continue;
      }

      if in_require && trimmed == ")" {
        in_require = false;
        continue;
      }

      if in_require && !trimmed.is_empty() && !trimmed.starts_with("//") {
        let parts: Vec<&str> = trimmed.split_whitespace().collect();
        if parts.len() >= 2 {
          let now = chrono::Utc::now();
          deps.push(VersionedDependency {
            name: parts[0].to_string(),

            version: parts[1].to_string(),

            ecosystem: "go".to_string(),

            source: Some("go".to_string()),

            first_seen: now,

            last_seen: now,

            last_hit: now,

            hit_count: 0,

            recent_hits: vec![],

            used_by_projects: vec![],
          });
        }
      }
    }

    Ok(deps)
  }

  /// Parse Maven dependencies from pom.xml (basic extraction)
  async fn parse_maven_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Simple XML parsing for <dependency> tags
    let dep_pattern = regex::Regex::new(
            r"<dependency>.*?<groupId>([^<]+)</groupId>.*?<artifactId>([^<]+)</artifactId>.*?<version>([^<]+)</version>.*?</dependency>"
        ).unwrap();

    for caps in dep_pattern.captures_iter(content) {
      let name = format!("{}:{}", caps[1].trim(), caps[2].trim());
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: name,

        version: caps[3].trim().to_string(),

        ecosystem: "java".to_string(),

        source: Some("maven".to_string()),

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse Gradle dependencies (basic extraction)
  async fn parse_gradle_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Simple pattern for Gradle dependencies like implementation 'group:artifact:version'
    let dep_pattern = regex::Regex::new(
      r#"(?:implementation|compile|api)\s+['"]([^:]+):([^:]+):([^'"]+)['"]"#,
    )
    .unwrap();

    for caps in dep_pattern.captures_iter(content) {
      let name = format!("{}:{}", caps[1].trim(), caps[2].trim());
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: name,

        version: caps[3].trim().to_string(),

        ecosystem: "java".to_string(),

        source: Some("maven".to_string()),

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse Clojure dependencies from project.clj
  async fn parse_clojure_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Simple pattern for Clojure dependencies like [group/artifact "version"]
    let dep_pattern =
      regex::Regex::new(r#"\[([^\s\]]+)\s+"([^"]+)"\]"#).unwrap();

    for caps in dep_pattern.captures_iter(content) {
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: caps[1].to_string(),

        version: caps[2].to_string(),

        ecosystem: "clojure".to_string(),

        source: Some("maven".to_string()), // Clojure uses Maven repos,

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse Ruby dependencies from Gemfile
  async fn parse_ruby_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Parse gem declarations like gem 'name', 'version'
    let gem_pattern = regex::Regex::new(
      r#"gem\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?"#,
    )
    .unwrap();

    for caps in gem_pattern.captures_iter(content) {
      let version = caps
        .get(2)
        .map(|m| m.as_str().to_string())
        .unwrap_or_else(|| "latest".to_string());
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: caps[1].to_string(),

        version: version,

        ecosystem: "ruby".to_string(),

        source: Some("rubygems".to_string()),

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse PHP dependencies from composer.json
  async fn parse_php_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    if let Ok(json) = serde_json::from_str::<serde_json::Value>(content) {
      // Parse require and require-dev sections
      for section in ["require", "require-dev"] {
        if let Some(dependencies) =
          json.get(section).and_then(|d| d.as_object())
        {
          for (name, version) in dependencies {
            if name != "php" {
              // Skip PHP version constraint
              if let Some(version_str) = version.as_str() {
                let now = chrono::Utc::now();
                deps.push(VersionedDependency {
                  name: name.clone(),

                  version: version_str.to_string(),

                  ecosystem: "php".to_string(),

                  source: Some("packagist".to_string()),

                  first_seen: now,

                  last_seen: now,

                  last_hit: now,

                  hit_count: 0,

                  recent_hits: vec![],

                  used_by_projects: vec![],
                });
              }
            }
          }
        }
      }
    }

    Ok(deps)
  }

  /// Parse .NET dependencies from project files
  async fn parse_dotnet_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Parse PackageReference elements
    let package_pattern = regex::Regex::new(
      r#"<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)""#,
    )
    .unwrap();

    for caps in package_pattern.captures_iter(content) {
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: caps[1].to_string(),

        version: caps[2].to_string(),

        ecosystem: "dotnet".to_string(),

        source: Some("nuget".to_string()),

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse Swift Package Manager dependencies
  async fn parse_swift_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Simple pattern for Swift Package Manager dependencies
    let dep_pattern = regex::Regex::new(
      r#"\.package\(url:\s*"([^"]+)",\s*from:\s*"([^"]+)"\)"#,
    )
    .unwrap();

    for caps in dep_pattern.captures_iter(content) {
      let name = caps[1].split('/').last().unwrap_or(&caps[1]).to_string();
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: name,

        version: caps[2].to_string(),

        ecosystem: "swift".to_string(),

        source: Some("swiftpm".to_string()),

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse CocoaPods dependencies from Podfile
  async fn parse_cocoapods_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Parse pod declarations
    let pod_pattern = regex::Regex::new(
      r#"pod\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?"#,
    )
    .unwrap();

    for caps in pod_pattern.captures_iter(content) {
      let version = caps
        .get(2)
        .map(|m| m.as_str().to_string())
        .unwrap_or_else(|| "latest".to_string());
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: caps[1].to_string(),

        version: version,

        ecosystem: "swift".to_string(),

        source: Some("cocoapods".to_string()),

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse Dart dependencies from pubspec.yaml
  async fn parse_dart_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    let lines: Vec<&str> = content.lines().collect();
    let mut in_deps_section = false;

    for line in lines {
      let trimmed = line.trim();

      if trimmed == "dependencies:" || trimmed == "dev_dependencies:" {
        in_deps_section = true;
        continue;
      }

      if in_deps_section && !trimmed.starts_with(' ') && trimmed.ends_with(':')
      {
        in_deps_section = false;
      }

      if in_deps_section && trimmed.contains(':') && !trimmed.starts_with('#') {
        if let Some((name, version)) = trimmed.split_once(':') {
          let name = name.trim();
          let version = version.trim().trim_matches('"').trim_matches('\'');

          if !name.is_empty() && !version.is_empty() {
            let now = chrono::Utc::now();
            deps.push(VersionedDependency {
              name: name.to_string(),

              version: version.to_string(),

              ecosystem: "dart".to_string(),

              source: Some("pub".to_string()),

              first_seen: now,

              last_seen: now,

              last_hit: now,

              hit_count: 0,

              recent_hits: vec![],

              used_by_projects: vec![],
            });
          }
        }
      }
    }

    Ok(deps)
  }

  /// Parse Haskell dependencies from .cabal files
  async fn parse_haskell_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Look for build-depends sections
    let lines: Vec<&str> = content.lines().collect();
    let mut in_build_depends = false;

    for line in lines {
      let trimmed = line.trim();

      if trimmed.starts_with("build-depends:") {
        in_build_depends = true;
        // Parse the same line
        if let Some(deps_part) = trimmed.strip_prefix("build-depends:") {
          self.parse_haskell_deps_line(deps_part, &mut deps).await;
        }
        continue;
      }

      if in_build_depends {
        if trimmed.is_empty() || !trimmed.starts_with(' ') {
          in_build_depends = false;
        } else {
          self.parse_haskell_deps_line(trimmed, &mut deps).await;
        }
      }
    }

    Ok(deps)
  }

  async fn parse_haskell_deps_line(
    &self,
    line: &str,
    deps: &mut Vec<VersionedDependency>,
  ) {
    for dep_spec in line.split(',') {
      let dep_spec = dep_spec.trim();
      if !dep_spec.is_empty() && dep_spec != "base" {
        let name = dep_spec.split_whitespace().next().unwrap_or(dep_spec);
        let now = chrono::Utc::now();
        deps.push(VersionedDependency {
          name: name.to_string(),

          version: "latest".to_string(),

          ecosystem: "haskell".to_string(),

          source: Some("hackage".to_string()),

          first_seen: now,

          last_seen: now,

          last_hit: now,

          hit_count: 0,

          recent_hits: vec![],

          used_by_projects: vec![],
        });
      }
    }
  }

  /// Parse Haskell Stack dependencies from stack.yaml
  async fn parse_haskell_stack_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    let lines: Vec<&str> = content.lines().collect();
    let mut in_extra_deps = false;

    for line in lines {
      let trimmed = line.trim();

      if trimmed == "extra-deps:" {
        in_extra_deps = true;
        continue;
      }

      if in_extra_deps && !trimmed.starts_with('-') && !trimmed.starts_with(' ')
      {
        in_extra_deps = false;
      }

      if in_extra_deps && trimmed.starts_with('-') {
        let dep = trimmed.trim_start_matches('-').trim();
        if let Some((name, version)) = dep.split_once('-') {
          let now = chrono::Utc::now();
          deps.push(VersionedDependency {
            name: name.to_string(),

            version: version.to_string(),

            ecosystem: "haskell".to_string(),

            source: Some("hackage".to_string()),

            first_seen: now,

            last_seen: now,

            last_hit: now,

            hit_count: 0,

            recent_hits: vec![],

            used_by_projects: vec![],
          });
        }
      }
    }

    Ok(deps)
  }

  /// Parse Perl dependencies from cpanfile
  async fn parse_perl_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    // Parse requires statements
    let requires_pattern = regex::Regex::new(
      r#"requires\s+['"]([^'"]+)['"](?:\s*,\s*['"]([^'"]+)['"])?"#,
    )
    .unwrap();

    for caps in requires_pattern.captures_iter(content) {
      let version = caps
        .get(2)
        .map(|m| m.as_str().to_string())
        .unwrap_or_else(|| "latest".to_string());
      let now = chrono::Utc::now();
      deps.push(VersionedDependency {
        name: caps[1].to_string(),

        version: version,

        ecosystem: "perl".to_string(),

        source: Some("cpan".to_string()),

        first_seen: now,

        last_seen: now,

        last_hit: now,

        hit_count: 0,

        recent_hits: vec![],

        used_by_projects: vec![],
      });
    }

    Ok(deps)
  }

  /// Parse R dependencies from DESCRIPTION file
  async fn parse_r_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    let lines: Vec<&str> = content.lines().collect();
    let mut in_imports = false;
    let mut in_depends = false;

    for line in lines {
      if line.starts_with("Imports:") {
        in_imports = true;
        in_depends = false;
        // Parse the same line
        if let Some(deps_part) = line.strip_prefix("Imports:") {
          self.parse_r_deps_line(deps_part, &mut deps).await;
        }
        continue;
      }

      if line.starts_with("Depends:") {
        in_depends = true;
        in_imports = false;
        if let Some(deps_part) = line.strip_prefix("Depends:") {
          self.parse_r_deps_line(deps_part, &mut deps).await;
        }
        continue;
      }

      if (in_imports || in_depends) && line.starts_with(' ') {
        self.parse_r_deps_line(line, &mut deps).await;
      } else if (in_imports || in_depends) && !line.starts_with(' ') {
        in_imports = false;
        in_depends = false;
      }
    }

    Ok(deps)
  }

  async fn parse_r_deps_line(
    &self,
    line: &str,
    deps: &mut Vec<VersionedDependency>,
  ) {
    for dep_spec in line.split(',') {
      let dep_spec = dep_spec.trim();
      if !dep_spec.is_empty() && dep_spec != "R" {
        let name = dep_spec.split_whitespace().next().unwrap_or(dep_spec);
        if !name.is_empty() {
          let now = chrono::Utc::now();
          deps.push(VersionedDependency {
            name: name.to_string(),

            version: "latest".to_string(),

            ecosystem: "r".to_string(),

            source: Some("maven".to_string()), // R uses CRAN, but we don't have that enum variant,

            first_seen: now,

            last_seen: now,

            last_hit: now,

            hit_count: 0,

            recent_hits: vec![],

            used_by_projects: vec![],
          });
        }
      }
    }
  }

  /// Parse Julia dependencies from Project.toml
  async fn parse_julia_dependencies(
    &self,
    content: &str,
  ) -> Result<Vec<VersionedDependency>> {
    let mut deps = Vec::new();

    let lines: Vec<&str> = content.lines().collect();
    let mut in_deps_section = false;

    for line in lines {
      let trimmed = line.trim();

      if trimmed == "[deps]" {
        in_deps_section = true;
        continue;
      }

      if in_deps_section && trimmed.starts_with('[') {
        in_deps_section = false;
      }

      if in_deps_section && trimmed.contains('=') && !trimmed.starts_with('#') {
        if let Some((name, _uuid)) = trimmed.split_once('=') {
          let name = name.trim().trim_matches('"');
          let now = chrono::Utc::now();
          deps.push(VersionedDependency {
            name: name.to_string(),

            version: "latest".to_string(),

            ecosystem: "julia".to_string(),

            source: Some("maven".to_string()), // Julia has its own registry, but we don't have that enum,

            first_seen: now,

            last_seen: now,

            last_hit: now,

            hit_count: 0,

            recent_hits: vec![],

            used_by_projects: vec![],
          });
        }
      }
    }

    Ok(deps)
  }

  /// Populate initial knowledge base automatically
  async fn populate_initial_knowledge(&mut self) -> Result<()> {
    info!("📚 Populating initial FACT knowledge base");

    // Collect all unique dependencies across all projects
    let mut all_dependencies: HashMap<String, String> = HashMap::new();

    for project in self.discovered_projects.values() {
      for dep in &project.dependencies {
        // Use latest version found for each dependency
        let current_version = all_dependencies.get(&dep.name);
        if current_version.is_none() || dep.version > *current_version.unwrap()
        {
          all_dependencies.insert(dep.name.clone(), dep.version.clone());
        }
      }
    }

    info!("Found {} unique dependencies", all_dependencies.len());

    // Auto-populate knowledge for each dependency sequentially to avoid borrowing issues
    #[cfg(feature = "github")]
    if let Some(_github) = &self.github {
      let max_concurrent = self.config.max_concurrent;
      let mut processed = 0;

      for (dep_name, version) in all_dependencies {
        if processed >= max_concurrent {
          // Small delay to respect rate limits
          tokio::time::sleep(Duration::from_millis(500)).await;
          processed = 0;
        }

        if let Err(e) =
          self.populate_single_dependency(&dep_name, &version).await
        {
          warn!(
            "Failed to populate knowledge for {}@{}: {}",
            dep_name, version, e
          );
        }

        processed += 1;
      }
    }

    info!("✅ Initial knowledge base population completed");
    Ok(())
  }

  /// Populate knowledge for a single dependency
  #[allow(dead_code)]
  async fn populate_single_dependency(
    &mut self,
    dep_name: &str,
    version: &str,
  ) -> Result<()> {
    info!("📖 Populating knowledge for {}@{}", dep_name, version);

    #[cfg(feature = "github")]
    if self.github.is_some() {
      // Extract the GitHub analysis first
      let github_result = {
        let github = self.github.as_ref().unwrap();
        self
          .analyze_dependency_with_github(github, dep_name, version)
          .await
      };

      // Then process the result and update state
      match github_result {
        Ok(Some((knowledge_data, status))) => {
          self
            .fact
            .process("tool-knowledge-storage", knowledge_data)
            .await?;
          self
            .knowledge_status
            .insert(format!("{}@{}", dep_name, version), status);
          return Ok(());
        }
        Ok(None) => {
          // Tool not found in BEAM ecosystem, continue with fallback
        }
        Err(e) => {
          warn!("GitHub analysis failed for {}@{}: {}", dep_name, version, e);
          // Continue with fallback
        }
      }
    }

    // Fallback: store basic dependency info without GitHub integration
    let knowledge_data = serde_json::json!({
        "tool": dep_name,
        "version": version,
        "documentation": format!("Basic knowledge entry for {}@{}", dep_name, version),
        "snippets": [],
        "examples": [],
        "source": "local_discovery"
    });

    self
      .fact
      .process("tool-knowledge-storage", knowledge_data)
      .await?;
    Ok(())
  }

  /// Analyze dependency with GitHub (no state mutation)
  #[cfg(feature = "github")]
  async fn analyze_dependency_with_github(
    &self,
    github: &GitHubAnalyzer,
    dep_name: &str,
    version: &str,
  ) -> Result<Option<(serde_json::Value, KnowledgeStatus)>> {
    // Check if this is a BEAM ecosystem tool (Elixir, Gleam, Erlang packages on Hex)
    let beam_tools = [
      "phoenix",
      "ecto",
      "plug",
      "cowboy",
      "jason",
      "tesla",
      "broadway",
      "oban",
      "libcluster",
      "guardian",
      "absinthe",
      "nerves",
      "scenic",
      "liveview",
      "live_view",
      "bandit",
      "finch",
      "bamboo",
      "swoosh",
      // Gleam packages
      "gleam_stdlib",
      "gleam_json",
      "gleam_http",
      "gleam_crypto",
      "gleam_otp",
      "gleam_regex",
      "gleam_erlang",
      "gleam_pgo",
      "gleeunit",
      "gleam_javascript",
      // Common Erlang packages
      "cowboy",
      "ranch",
      "hackney",
      "jsx",
      "lager",
      "recon",
    ];

    if !beam_tools.contains(&dep_name) {
      return Ok(None);
    }

    match github.analyze_hex_package_repos(dep_name, version).await {
      Ok(analysis) => {
        let fact_entries =
          github.generate_fact_entries(dep_name, version, &analysis);

        // Create knowledge data
        let knowledge_data = serde_json::json!({
            "tool": dep_name,
            "version": version,
            "documentation": fact_entries.documentation,
            "snippets": fact_entries.snippets,
            "examples": fact_entries.examples,
            "best_practices": fact_entries.best_practices,
            "troubleshooting": fact_entries.troubleshooting,
            "github_sources": fact_entries.github_sources,
        });

        // Create status
        let status = KnowledgeStatus {
          tool: dep_name.to_string(),
          version: version.to_string(),
          last_updated: SystemTime::now(),
          snippets_count: fact_entries.snippets.len(),
          examples_count: fact_entries.examples.len(),
          next_update: SystemTime::now()
            + Duration::from_secs(self.config.update_interval_hours * 3600),
          auto_update_enabled: true,
        };

        info!(
          "✅ Knowledge analyzed for {}@{}: {} snippets, {} examples",
          dep_name,
          version,
          fact_entries.snippets.len(),
          fact_entries.examples.len()
        );

        Ok(Some((knowledge_data, status)))
      }
      Err(e) => {
        warn!(
          "Failed to analyze knowledge for {}@{}: {}",
          dep_name, version, e
        );
        Err(e.into())
      }
    }
  }

  /// Start background tasks for continuous updates
  async fn start_background_tasks(&self) -> Result<()> {
    info!("🔄 Starting background update tasks");

    // File system watcher for project changes
    tokio::spawn(async move {
      let mut interval = interval(Duration::from_secs(300)); // Check every 5 minutes

      loop {
        interval.tick().await;
        // TODO: Implement file system watching
        debug!("Checking for project changes...");
      }
    });

    // Periodic knowledge updates
    tokio::spawn(async move {
      let mut interval = interval(Duration::from_secs(3600)); // Check every hour

      loop {
        interval.tick().await;
        // TODO: Check for knowledge updates needed
        debug!("Checking for knowledge updates...");
      }
    });

    Ok(())
  }

  /// Get current orchestration status
  pub fn get_status(&self) -> AutoOrchestrationStatus {
    AutoOrchestrationStatus {
      is_running: self.is_running,
      projects_discovered: self.discovered_projects.len(),
      knowledge_entries: self.knowledge_status.len(),
      last_discovery: SystemTime::now(), // TODO: Track actual last discovery time
      next_update: SystemTime::now()
        + Duration::from_secs(self.config.update_interval_hours * 3600),
    }
  }
}

/// Auto orchestration status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutoOrchestrationStatus {
  pub is_running: bool,
  pub projects_discovered: usize,
  pub knowledge_entries: usize,
  pub last_discovery: SystemTime,
  pub next_update: SystemTime,
}

#[cfg(test)]
mod tests {
  use super::*;
  use tempfile::tempdir;

  #[tokio::test]
  async fn test_auto_orchestrator_creation() {
    let config = AutoConfig::default();
    let orchestrator = AutoFactOrchestrator::new(config).await.unwrap();
    assert!(!orchestrator.is_running);
  }

  #[tokio::test]
  async fn test_dependency_parsing() {
    let config = AutoConfig::default();
    let orchestrator = AutoFactOrchestrator::new(config).await.unwrap();

    let mix_content = r#"
        defmodule MyApp.MixProject do
          def project do
            [
              deps: deps()
            ]
          end

          defp deps do
            [
              {:phoenix, "~> 1.7.0"},
              {:ecto_sql, "~> 3.6"},
              {:postgrex, ">= 0.0.0"},
              {:phoenix_html, "~> 3.0"}
            ]
          end
        end
        "#;

    let deps = orchestrator
      .parse_elixir_dependencies(mix_content)
      .await
      .unwrap();
    assert!(deps.len() >= 1);
    assert!(deps.iter().any(|d| d.name == "phoenix"));
  }
}
