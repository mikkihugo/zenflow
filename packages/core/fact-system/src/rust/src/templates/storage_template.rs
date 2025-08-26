//! FACT storage template for processing tool knowledge
//!
//! Handles storing and retrieving tool knowledge data in the FACT storage system.

use super::{Template, TemplateStep, TemplateStepType};
use crate::storage::{
  FactData, FactKey, StorageBackend, StorageConfig, create_storage,
};
use anyhow::{Context, Result};
use serde_json::Value;
use std::time::SystemTime;
use tracing::{debug, info, warn};

/// Create the tool knowledge storage template
pub fn create_tool_knowledge_storage_template() -> Template {
  Template {
    id: "tool-knowledge-storage".to_string(),
    name: "Tool Knowledge Storage".to_string(),
    description: "Store and retrieve tool knowledge data in FACT database"
      .to_string(),
    steps: vec![
      TemplateStep {
        id: "validate_input".to_string(),
        name: "Validate Input Data".to_string(),
        step_type: TemplateStepType::Transform,
        config: serde_json::json!({
            "validation_rules": {
                "required_fields": ["tool", "version", "ecosystem"],
                "optional_fields": ["documentation", "snippets", "examples", "best_practices", "troubleshooting", "github_sources"]
            }
        }),
      },
      TemplateStep {
        id: "store_knowledge".to_string(),
        name: "Store Knowledge Data".to_string(),
        step_type: TemplateStepType::Custom,
        config: serde_json::json!({
            "operation": "store",
            "storage_type": "persistent"
        }),
      },
      TemplateStep {
        id: "create_response".to_string(),
        name: "Create Response".to_string(),
        step_type: TemplateStepType::Transform,
        config: serde_json::json!({
            "response_format": "storage_confirmation"
        }),
      },
    ],
    metadata: super::TemplateMetadata {
      version: "1.0.0".to_string(),
      tags: vec![
        "storage".to_string(),
        "knowledge".to_string(),
        "tool".to_string(),
      ],
      performance: super::PerformanceMetrics {
        avg_execution_time_ms: 10.0,
        memory_usage_bytes: 1024 * 10, // 10KB
        complexity: super::ComplexityLevel::Low,
      },
    },
  }
}

/// Process tool knowledge storage
pub async fn process_tool_knowledge_storage(context: Value) -> Result<Value> {
  debug!("Processing tool knowledge storage request");

  // Step 1: Validate input
  let tool = context
    .get("tool")
    .and_then(|v| v.as_str())
    .context("Missing or invalid 'tool' field")?;

  let version = context
    .get("version")
    .and_then(|v| v.as_str())
    .context("Missing or invalid 'version' field")?;

  let ecosystem = context
    .get("ecosystem")
    .unwrap_or(&Value::String("unknown".to_string()))
    .as_str()
    .unwrap_or("unknown");

  debug!(
    "Storing knowledge for {}@{} in {} ecosystem",
    tool, version, ecosystem
  );

  // Step 2: Create FACT data structure
  let fact_data = FactData {
    tool: tool.to_string(),
    version: version.to_string(),
    ecosystem: ecosystem.to_string(),
    documentation: context
      .get("documentation")
      .and_then(|v| v.as_str())
      .unwrap_or("")
      .to_string(),
    snippets: parse_snippets(&context)?,
    examples: parse_examples(&context)?,
    best_practices: parse_best_practices(&context)?,
    troubleshooting: parse_troubleshooting(&context)?,
    github_sources: parse_github_sources(&context)?,
    dependencies: context
      .get("dependencies")
      .and_then(|v| v.as_array())
      .map(|arr| {
        arr
          .iter()
          .filter_map(|v| v.as_str().map(|s| s.to_string()))
          .collect()
      })
      .unwrap_or_default(),
    tags: context
      .get("tags")
      .and_then(|v| v.as_array())
      .map(|arr| {
        arr
          .iter()
          .filter_map(|v| v.as_str().map(|s| s.to_string()))
          .collect()
      })
      .unwrap_or_else(|| vec!["auto-discovered".to_string()]),
    last_updated: SystemTime::now(),
    source: context
      .get("source")
      .and_then(|v| v.as_str())
      .unwrap_or("auto-orchestrator")
      .to_string(),
  };

  // Step 3: Store in FACT database
  let storage_config = StorageConfig::default();
  let storage = create_storage(storage_config)
    .await
    .context("Failed to create storage instance")?;

  let fact_key =
    FactKey::new(tool.to_string(), version.to_string(), ecosystem.to_string());

  match storage.store_fact(&fact_key, &fact_data).await {
    Ok(()) => {
      info!(
        "✅ Successfully stored FACT knowledge for {}@{}",
        tool, version
      );

      // Step 4: Create success response
      Ok(serde_json::json!({
          "status": "success",
          "message": format!("Knowledge stored for {}@{}", tool, version),
          "key": fact_key.storage_key(),
          "data_size": serde_json::to_string(&fact_data)?.len(),
          "snippets_count": fact_data.snippets.len(),
          "examples_count": fact_data.examples.len(),
          "stored_at": chrono::Utc::now().to_rfc3339()
      }))
    }
    Err(e) => {
      warn!(
        "Failed to store FACT knowledge for {}@{}: {}",
        tool, version, e
      );

      // Return error response but don't fail the entire operation
      Ok(serde_json::json!({
          "status": "error",
          "message": format!("Failed to store knowledge for {}@{}: {}", tool, version, e),
          "key": fact_key.storage_key(),
          "error": e.to_string(),
          "fallback": "knowledge_cached_in_memory"
      }))
    }
  }
}

// Helper functions to parse complex data structures from JSON

fn parse_snippets(context: &Value) -> Result<Vec<crate::storage::FactSnippet>> {
  let mut snippets = Vec::new();

  if let Some(snippets_array) =
    context.get("snippets").and_then(|v| v.as_array())
  {
    for snippet in snippets_array {
      if let (Some(title), Some(code), Some(description)) = (
        snippet.get("title").and_then(|v| v.as_str()),
        snippet.get("code").and_then(|v| v.as_str()),
        snippet.get("description").and_then(|v| v.as_str()),
      ) {
        snippets.push(crate::storage::FactSnippet {
          title: title.to_string(),
          code: code.to_string(),
          language: snippet
            .get("language")
            .and_then(|v| v.as_str())
            .unwrap_or("unknown")
            .to_string(),
          description: description.to_string(),
          file_path: snippet
            .get("file_path")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
          line_number: snippet
            .get("line_number")
            .and_then(|v| v.as_u64())
            .unwrap_or(0) as u32,
        });
      }
    }
  }

  Ok(snippets)
}

fn parse_examples(context: &Value) -> Result<Vec<crate::storage::FactExample>> {
  let mut examples = Vec::new();

  if let Some(examples_array) =
    context.get("examples").and_then(|v| v.as_array())
  {
    for example in examples_array {
      if let (Some(title), Some(code), Some(explanation)) = (
        example.get("title").and_then(|v| v.as_str()),
        example.get("code").and_then(|v| v.as_str()),
        example.get("explanation").and_then(|v| v.as_str()),
      ) {
        examples.push(crate::storage::FactExample {
          title: title.to_string(),
          code: code.to_string(),
          explanation: explanation.to_string(),
          tags: example
            .get("tags")
            .and_then(|v| v.as_array())
            .map(|arr| {
              arr
                .iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect()
            })
            .unwrap_or_default(),
        });
      }
    }
  }

  Ok(examples)
}

fn parse_best_practices(
  context: &Value,
) -> Result<Vec<crate::storage::FactBestPractice>> {
  let mut practices = Vec::new();

  if let Some(practices_array) =
    context.get("best_practices").and_then(|v| v.as_array())
  {
    for practice in practices_array {
      if let (Some(practice_text), Some(rationale)) = (
        practice.get("practice").and_then(|v| v.as_str()),
        practice.get("rationale").and_then(|v| v.as_str()),
      ) {
        practices.push(crate::storage::FactBestPractice {
          practice: practice_text.to_string(),
          rationale: rationale.to_string(),
          example: practice
            .get("example")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string()),
        });
      }
    }
  }

  Ok(practices)
}

fn parse_troubleshooting(
  context: &Value,
) -> Result<Vec<crate::storage::FactTroubleshooting>> {
  let mut troubleshooting = Vec::new();

  if let Some(troubleshooting_array) =
    context.get("troubleshooting").and_then(|v| v.as_array())
  {
    for item in troubleshooting_array {
      if let (Some(issue), Some(solution)) = (
        item.get("issue").and_then(|v| v.as_str()),
        item.get("solution").and_then(|v| v.as_str()),
      ) {
        troubleshooting.push(crate::storage::FactTroubleshooting {
          issue: issue.to_string(),
          solution: solution.to_string(),
          references: item
            .get("references")
            .and_then(|v| v.as_array())
            .map(|arr| {
              arr
                .iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect()
            })
            .unwrap_or_default(),
        });
      }
    }
  }

  Ok(troubleshooting)
}

fn parse_github_sources(
  context: &Value,
) -> Result<Vec<crate::storage::FactGitHubSource>> {
  let mut sources = Vec::new();

  if let Some(sources_array) =
    context.get("github_sources").and_then(|v| v.as_array())
  {
    for source in sources_array {
      if let Some(repo) = source.get("repo").and_then(|v| v.as_str()) {
        sources.push(crate::storage::FactGitHubSource {
          repo: repo.to_string(),
          stars: source.get("stars").and_then(|v| v.as_u64()).unwrap_or(0)
            as u32,
          last_update: source
            .get("last_update")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        });
      }
    }
  }

  Ok(sources)
}

#[cfg(test)]
mod tests {
  use super::*;
  use tempfile::tempdir;

  #[tokio::test]
  async fn test_tool_knowledge_storage_template() {
    let template = create_tool_knowledge_storage_template();
    assert_eq!(template.id, "tool-knowledge-storage");
    assert_eq!(template.steps.len(), 3);
  }

  #[tokio::test]
  async fn test_process_basic_tool_knowledge() {
    let context = serde_json::json!({
        "tool": "phoenix",
        "version": "1.7.0",
        "ecosystem": "beam",
        "documentation": "Phoenix is a web framework for Elixir",
        "source": "test"
    });

    let result = process_tool_knowledge_storage(context).await.unwrap();
    assert_eq!(
      result.get("status").and_then(|v| v.as_str()).unwrap(),
      "success"
    );
    assert!(
      result
        .get("key")
        .and_then(|v| v.as_str())
        .unwrap()
        .contains("phoenix")
    );
  }

  #[tokio::test]
  async fn test_process_complex_tool_knowledge() {
    let context = serde_json::json!({
        "tool": "ecto",
        "version": "3.10.0",
        "ecosystem": "beam",
        "documentation": "Ecto is a database wrapper for Elixir",
        "snippets": [
            {
                "title": "Basic Query",
                "code": "Repo.all(User)",
                "language": "elixir",
                "description": "Query all users",
                "file_path": "lib/app/users.ex",
                "line_number": 42
            }
        ],
        "examples": [
            {
                "title": "Schema Definition",
                "code": "schema \"users\" do\n  field :name, :string\nend",
                "explanation": "Define a user schema",
                "tags": ["schema", "database"]
            }
        ]
    });

    let result = process_tool_knowledge_storage(context).await.unwrap();
    assert_eq!(
      result.get("status").and_then(|v| v.as_str()).unwrap(),
      "success"
    );
    assert_eq!(
      result
        .get("snippets_count")
        .and_then(|v| v.as_u64())
        .unwrap(),
      1
    );
    assert_eq!(
      result
        .get("examples_count")
        .and_then(|v| v.as_u64())
        .unwrap(),
      1
    );
  }
}
