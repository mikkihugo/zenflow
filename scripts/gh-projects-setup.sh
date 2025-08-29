#!/usr/bin/env bash
set -euo pipefail

# GitHub Projects (v2) automation using GitHub CLI
# - Creates 4 org/repo projects if missing
# - Adds common fields (Status, Priority, SPARC Phase, Team, Sprint)
# - Creates repo labels used by roadmap
#
# Requirements:
# - gh CLI authenticated with a token that has 'project' and 'repo' scopes
#
# Usage:
#   OWNER=mikkihugo REPO=zenflow bash scripts/gh-projects-setup.sh
#
# Notes:
# - Idempotent: re-runs are safe; it detects existing artifacts
# - Projects v2 don’t have columns; we model them via a SINGLE_SELECT Status field

echo "==> GitHub Projects setup (idempotent)"

command -v gh >/dev/null || { echo "Error: gh CLI not found"; exit 1; }

# Ensure we use gh's stored auth (not a low-scope env token)
unset GITHUB_TOKEN || true

OWNER=${OWNER:-}
REPO=${REPO:-}

if [[ -z "${OWNER}" || -z "${REPO}" ]]; then
  # Try to infer from git remote
  if url=$(git config --get remote.origin.url 2>/dev/null); then
    # Supports https and ssh
    # https://github.com/owner/repo.git or git@github.com:owner/repo.git
    if [[ "$url" =~ github.com[:/]{1}([^/]+)/([^/.]+) ]]; then
      OWNER=${OWNER:-"${BASH_REMATCH[1]}"}
      REPO=${REPO:-"${BASH_REMATCH[2]}"}
    fi
  fi
fi

if [[ -z "${OWNER}" || -z "${REPO}" ]]; then
  echo "Error: Set OWNER and REPO env vars (e.g., OWNER=mikkihugo REPO=zenflow)" >&2
  exit 1
fi

echo "Owner: $OWNER  Repo: $REPO"

# Check token scopes include 'project' and 'repo'
# Retry helper for GraphQL-heavy gh commands (Projects v2)
retry_gh() {
  local tries=0 max=${GH_RETRY_MAX:-5} delay=${GH_RETRY_DELAY:-2}
  local out code
  while true; do
    # shellcheck disable=SC2034
    out=$(bash -lc "$*" 2>&1); code=$?
    if [ $code -eq 0 ]; then printf "%s" "$out"; return 0; fi
    if echo "$out" | grep -qi 'API rate limit exceeded'; then
      tries=$((tries+1))
      if [ $tries -ge $max ]; then echo "$out" >&2; return $code; fi
      sleep $delay; delay=$((delay*2)); continue
    fi
    echo "$out" >&2; return $code
  done
}

# Quick capability checks (non-fatal)
retry_gh "gh project list --owner \"$OWNER\" --limit 1 >/dev/null" || true
gh api -H "Accept: application/vnd.github+json" \
  "/repos/$OWNER/$REPO/labels?per_page=1" >/dev/null 2>&1 || true

# Helpers
project_number_by_title() {
  local title=$1
  retry_gh "gh project list --owner \"$OWNER\" --format json --limit 100 --jq \".projects[] | select(.title==\\\"$title\\\") | .number\"" | head -n1
}

ensure_project() {
  local title=$1
  local num
  num=$(project_number_by_title "$title" || true)
  if [[ -n "$num" ]]; then
    echo "$num"
    return 0
  fi
  echo "Creating project: $title"
  retry_gh "gh project create --owner \"$OWNER\" --title \"$title\" --format json --jq '.number'"
}

ensure_project_link_repo() {
  local number=$1
  # Link project to the repository if not already linked
  # There is no direct list command for links; attempt link and ignore error if already linked
  retry_gh "gh project link --owner \"$OWNER\" \"$number\" --repo \"$OWNER/$REPO\"" >/dev/null 2>&1 || true
}

field_id_by_name() {
  local number=$1 name=$2
  retry_gh "gh project field-list \"$number\" --owner \"$OWNER\" --format json --jq \".fields[] | select(.name==\\\"$name\\\") | .id\"" | head -n1
}

ensure_field() {
  local number=$1 name=$2 datatype=$3 options=${4:-}
  # Skip built-in field
  if [[ "$name" == "Status" ]]; then
    echo "Skip creating built-in field 'Status' on project #$number"
    return 0
  fi
  local id
  id=$(field_id_by_name "$number" "$name" || true)
  if [[ -n "$id" ]]; then
    return 0
  fi
  if [[ "$datatype" == "SINGLE_SELECT" && -n "$options" ]]; then
    retry_gh "gh project field-create \"$number\" --owner \"$OWNER\" --name \"$name\" --data-type SINGLE_SELECT --single-select-options \"$options\"" >/dev/null
  else
    retry_gh "gh project field-create \"$number\" --owner \"$OWNER\" --name \"$name\" --data-type \"$datatype\"" >/dev/null
  fi
}

ensure_label() {
  local name=$1 color=$2 desc=$3
  # Check if label exists
  if gh api -H "Accept: application/vnd.github+json" \
        "/repos/$OWNER/$REPO/labels/$name" >/dev/null 2>&1; then
    return 0
  fi
  echo "Creating label: $name"
  gh api -X POST -H "Accept: application/vnd.github+json" \
    "/repos/$OWNER/$REPO/labels" \
    -f name="$name" -f color="$color" -f description="$desc" >/dev/null || true
}

ensure_projects_and_fields() {
  local titles=(
    "🧠 Neural AI Platform (Zen Neural Stack)"
    "🔍 Auto-Discovery & Domain Intelligence"
    "🏢 Enterprise Platform & SAFe Integration"
    "🧪 Testing, Validation & Quality"
  )

  for title in "${titles[@]}"; do
    local num
    num=$(ensure_project "$title")
    echo "Project '$title' -> #$num"
    ensure_project_link_repo "$num"
    # Common fields
  # Status is built-in in Projects v2; we only ensure options via UI for now
    ensure_field "$num" "Priority" "SINGLE_SELECT" "Critical,High,Medium,Low"
    ensure_field "$num" "SPARC Phase" "SINGLE_SELECT" "Specification,Planning,Analysis,Research,Completion"
    ensure_field "$num" "Team" "SINGLE_SELECT" "Neural,Discovery,Enterprise,Quality,DevOps"
    ensure_field "$num" "Sprint" "TEXT"
  sleep ${GH_THROTTLE:-0.5}
  done
}

ensure_labels() {
  # Epic & Priority Labels
  ensure_label "epic" "d73a4a" "Epics / large initiatives"
  ensure_label "feature" "0075ca" "Feature-level work"
  ensure_label "critical" "b60205" "Critical priority"
  ensure_label "high-priority" "d93f0b" "High priority"
  ensure_label "medium-priority" "fbca04" "Medium priority"
  ensure_label "low-priority" "0e8a16" "Low priority"

  # Domain Labels
  ensure_label "neural-platform" "5319e7" "Neural platform domain"
  ensure_label "zen-neural-stack" "7057ff" "Zen neural stack"
  ensure_label "auto-discovery" "1d76db" "Auto discovery"
  ensure_label "domain-intelligence" "0969da" "Domain intelligence"
  ensure_label "enterprise-platform" "bf8700" "Enterprise platform"
  ensure_label "safe-framework" "d4801f" "SAFe framework"
  ensure_label "production" "8b5cf6" "Production readiness"

  # SPARC Phase Labels
  ensure_label "sparc-specification" "f85149" "SPARC: Specification"
  ensure_label "sparc-planning" "ff8c00" "SPARC: Planning"
  ensure_label "sparc-analysis" "ffd700" "SPARC: Analysis"
  ensure_label "sparc-research" "32cd32" "SPARC: Research"
  ensure_label "sparc-completion" "00ced1" "SPARC: Completion"
}

ensure_projects_and_fields
ensure_labels

echo "==> Done. Projects and labels are ensured."
