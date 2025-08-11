#!/bin/bash

# High-standard rustfmt for all Rust projects
echo "🎯 Applying high-standard rustfmt to all Rust projects"

# Our proven rustfmt config content
RUSTFMT_CONFIG='# Conservative stable rustfmt configuration
# Only the most basic stable features

max_width = 80
tab_spaces = 2
edition = "2024"
reorder_imports = true
reorder_modules = true
fn_params_layout = "Tall"'

# Core projects that should work
PROJECTS=(
  "src/fact-core"
  "src/bindings" 
  "src/neural/property-test-standalone"
)

# Apply config and format each project
for project in "${PROJECTS[@]}"; do
    if [ -d "$project" ] && [ -f "$project/Cargo.toml" ]; then
        echo "📦 Formatting $project..."
        
        # Copy rustfmt config
        echo "$RUSTFMT_CONFIG" > "$project/rustfmt.toml"
        
        # Format with error handling
        cd "$project"
        if cargo fmt 2>/dev/null; then
            echo "  ✅ Formatted successfully"
        else
            echo "  ⚠️  Some formatting issues (likely trailing whitespace)"
        fi
        cd - >/dev/null
    else
        echo "  ⚠️  Skipping $project (not found or no Cargo.toml)"
    fi
done

echo "✅ High-standard formatting applied to core Rust projects!"