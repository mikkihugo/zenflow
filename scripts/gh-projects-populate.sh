#!/usr/bin/env bash
set -euo pipefail

# Populate GitHub Projects (v2) from existing epics/issues and code TODOs
# - Adds open issues/PRs to projects based on labels or title prefixes
# - Sets Status=Backlog and Priority based on labels
# - Creates draft items for a limited set of TODO/FIXME findings
#
# Usage:
#   OWNER=mikkihugo REPO=zenflow bash scripts/gh-projects-populate.sh
#
# Requirements:
# - gh CLI with 'project' and 'repo' scopes
# - git available; ripgrep (rg) optional, fallback to git grep

command -v gh >/dev/null || { echo "Error: gh CLI not found"; exit 1; }

# Ensure we use gh's stored auth (not a low-scope env token)
unset GITHUB_TOKEN || true
retry_gh() {
  local tries=0 max=${GH_RETRY_MAX:-5} delay=${GH_RETRY_DELAY:-2}
  local out code
  while true; do
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

OWNER=${OWNER:-}
REPO=${REPO:-}

if [[ -z "${OWNER}" || -z "${REPO}" ]]; then
  if url=$(git config --get remote.origin.url 2>/dev/null); then
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

echo "==> Populating Projects for $OWNER/$REPO"

project_number_by_title() {
  local title=$1
  retry_gh "gh project list --owner \"$OWNER\" --format json --limit 100 --jq \".projects[] | select(.title==\\\"$title\\\") | .number\"" | head -n1
}

project_json_by_number() { gh project view "$1" --owner "$OWNER" --format json; }

field_map_json() { gh project field-list "$1" --owner "$OWNER" --format json; }

field_id_by_name() {
  local fmap=$1 name=$2
  echo "$fmap" | gh api --method GET -H "Accept: application/vnd.github+json" graphql -f query='{ __typename }' >/dev/null 2>&1 || true
  echo "$fmap" | sed -n "s/.*\"name\":\"$name\"[^\}]*\"id\":\"\([^"]*\)\".*/\1/p" | head -n1
}

option_id_by_name() {
  local fmap=$1 field=$2 optname=$3
  # Use a simple grep/sed chain to find the option id under the field name
  # This is a pragmatic approach to avoid jq dependency.
  echo "$fmap" | tr '\n' ' ' | sed -n "s/.*\"name\":\"$field\"[^{]*\"options\":\[\(.*\)\].*/\1/p" \
    | sed 's/},{/}\n{/g' | sed -n "s/.*\"name\":\"$optname\"[^\}]*\"id\":\"\([^"]*\)\".*/\1/p" | head -n1
}

add_issue_to_project() {
  local number=$1 url=$2
  retry_gh "gh project item-add \"$number\" --owner \"$OWNER\" --url \"$url\" --format json --jq '.id'" 2>/dev/null || true
}

set_item_single_select() {
  local project_id=$1 item_id=$2 field_id=$3 option_id=$4
  [[ -n "$option_id" ]] || return 0
  gh project item-edit --project-id "$project_id" --id "$item_id" \
    --field-id "$field_id" --single-select-option-id "$option_id" >/dev/null
}

set_item_text() {
  local project_id=$1 item_id=$2 field_id=$3 text=$4
  retry_gh "gh project item-edit --project-id \"$project_id\" --id \"$item_id\" --field-id \"$field_id\" --text \"$text\"" >/dev/null
}

create_draft_item() {
  local number=$1 title=$2 body=$3
  retry_gh "gh project item-create \"$number\" --owner \"$OWNER\" --title \"$title\" --body \"$body\" --format json --jq '.id'"
}

# Projects mapping by title
NEURAL_TITLE="🧠 Neural AI Platform (Zen Neural Stack)"
DISCOVERY_TITLE="🔍 Auto-Discovery & Domain Intelligence"
ENTERPRISE_TITLE="🏢 Enterprise Platform & SAFe Integration"
QUALITY_TITLE="🧪 Testing, Validation & Quality"

NEURAL_NUM=$(project_number_by_title "$NEURAL_TITLE" || true)
DISCOVERY_NUM=$(project_number_by_title "$DISCOVERY_TITLE" || true)
ENTERPRISE_NUM=$(project_number_by_title "$ENTERPRISE_TITLE" || true)
QUALITY_NUM=$(project_number_by_title "$QUALITY_TITLE" || true)

for t in NEURAL_NUM DISCOVERY_NUM ENTERPRISE_NUM QUALITY_NUM; do
  if [[ -z "${!t}" ]]; then
    echo "Error: Project not found for $t. Run scripts/gh-projects-setup.sh first." >&2
    exit 1
  fi
done

# Cache project IDs and field maps
NEURAL_JSON=$(project_json_by_number "$NEURAL_NUM")
DISCOVERY_JSON=$(project_json_by_number "$DISCOVERY_NUM")
ENTERPRISE_JSON=$(project_json_by_number "$ENTERPRISE_NUM")
QUALITY_JSON=$(project_json_by_number "$QUALITY_NUM")

NEURAL_ID=$(echo "$NEURAL_JSON" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n1)
DISCOVERY_ID=$(echo "$DISCOVERY_JSON" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n1)
ENTERPRISE_ID=$(echo "$ENTERPRISE_JSON" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n1)
QUALITY_ID=$(echo "$QUALITY_JSON" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -n1)

NEURAL_FIELDS=$(field_map_json "$NEURAL_NUM")
DISCOVERY_FIELDS=$(field_map_json "$DISCOVERY_NUM")
ENTERPRISE_FIELDS=$(field_map_json "$ENTERPRISE_NUM")
QUALITY_FIELDS=$(field_map_json "$QUALITY_NUM")

# Field IDs
status_field_id_neural=$(field_id_by_name "$NEURAL_FIELDS" "Status")
status_field_id_discovery=$(field_id_by_name "$DISCOVERY_FIELDS" "Status")
status_field_id_enterprise=$(field_id_by_name "$ENTERPRISE_FIELDS" "Status")
status_field_id_quality=$(field_id_by_name "$QUALITY_FIELDS" "Status")

priority_field_id_neural=$(field_id_by_name "$NEURAL_FIELDS" "Priority")
priority_field_id_discovery=$(field_id_by_name "$DISCOVERY_FIELDS" "Priority")
priority_field_id_enterprise=$(field_id_by_name "$ENTERPRISE_FIELDS" "Priority")
priority_field_id_quality=$(field_id_by_name "$QUALITY_FIELDS" "Priority")

# Option IDs
opt_status_backlog_neural=$(option_id_by_name "$NEURAL_FIELDS" "Status" "Backlog")
opt_status_backlog_discovery=$(option_id_by_name "$DISCOVERY_FIELDS" "Status" "Backlog")
opt_status_backlog_enterprise=$(option_id_by_name "$ENTERPRISE_FIELDS" "Status" "Backlog")
opt_status_backlog_quality=$(option_id_by_name "$QUALITY_FIELDS" "Status" "Backlog")

opt_pri_crit_neural=$(option_id_by_name "$NEURAL_FIELDS" "Priority" "Critical")
opt_pri_high_neural=$(option_id_by_name "$NEURAL_FIELDS" "Priority" "High")
opt_pri_med_neural=$(option_id_by_name "$NEURAL_FIELDS" "Priority" "Medium")
opt_pri_low_neural=$(option_id_by_name "$NEURAL_FIELDS" "Priority" "Low")

opt_pri_crit_discovery=$(option_id_by_name "$DISCOVERY_FIELDS" "Priority" "Critical")
opt_pri_high_discovery=$(option_id_by_name "$DISCOVERY_FIELDS" "Priority" "High")
opt_pri_med_discovery=$(option_id_by_name "$DISCOVERY_FIELDS" "Priority" "Medium")
opt_pri_low_discovery=$(option_id_by_name "$DISCOVERY_FIELDS" "Priority" "Low")

opt_pri_crit_enterprise=$(option_id_by_name "$ENTERPRISE_FIELDS" "Priority" "Critical")
opt_pri_high_enterprise=$(option_id_by_name "$ENTERPRISE_FIELDS" "Priority" "High")
opt_pri_med_enterprise=$(option_id_by_name "$ENTERPRISE_FIELDS" "Priority" "Medium")
opt_pri_low_enterprise=$(option_id_by_name "$ENTERPRISE_FIELDS" "Priority" "Low")

opt_pri_crit_quality=$(option_id_by_name "$QUALITY_FIELDS" "Priority" "Critical")
opt_pri_high_quality=$(option_id_by_name "$QUALITY_FIELDS" "Priority" "High")
opt_pri_med_quality=$(option_id_by_name "$QUALITY_FIELDS" "Priority" "Medium")
opt_pri_low_quality=$(option_id_by_name "$QUALITY_FIELDS" "Priority" "Low")

# Map issue to project by labels or title prefix
infer_project_number() {
  local title=$1 labels=$2
  shopt -s nocasematch
  if [[ "$title" =~ ^\[(NEURAL|N)\] || "$labels" =~ neural-platform|zen-neural-stack ]]; then
    echo "$NEURAL_NUM"; return
  fi
  if [[ "$title" =~ ^\[(DISCOVERY|D)\] || "$labels" =~ auto-discovery|domain-intelligence ]]; then
    echo "$DISCOVERY_NUM"; return
  fi
  if [[ "$title" =~ ^\[(ENTERPRISE|E)\] || "$labels" =~ enterprise-platform|safe-framework|production ]]; then
    echo "$ENTERPRISE_NUM"; return
  fi
  if [[ "$title" =~ ^\[(QUALITY|Q)\] || "$labels" =~ quality|testing ]]; then
    echo "$QUALITY_NUM"; return
  fi
  # Default: put epics without clear domain into Enterprise (planning)
  echo ""; return
}

infer_project_ids() {
  local number=$1
  case "$number" in
    $NEURAL_NUM) echo "$NEURAL_ID|$status_field_id_neural|$priority_field_id_neural|$opt_status_backlog_neural|$opt_pri_crit_neural|$opt_pri_high_neural|$opt_pri_med_neural|$opt_pri_low_neural" ;;
    $DISCOVERY_NUM) echo "$DISCOVERY_ID|$status_field_id_discovery|$priority_field_id_discovery|$opt_status_backlog_discovery|$opt_pri_crit_discovery|$opt_pri_high_discovery|$opt_pri_med_discovery|$opt_pri_low_discovery" ;;
    $ENTERPRISE_NUM) echo "$ENTERPRISE_ID|$status_field_id_enterprise|$priority_field_id_enterprise|$opt_status_backlog_enterprise|$opt_pri_crit_enterprise|$opt_pri_high_enterprise|$opt_pri_med_enterprise|$opt_pri_low_enterprise" ;;
    $QUALITY_NUM) echo "$QUALITY_ID|$status_field_id_quality|$priority_field_id_quality|$opt_status_backlog_quality|$opt_pri_crit_quality|$opt_pri_high_quality|$opt_pri_med_quality|$opt_pri_low_quality" ;;
    *) echo "" ;;
  esac
}

priority_option_for_labels() {
  local labels=$1 crit=$2 high=$3 med=$4 low=$5
  if [[ "$labels" =~ critical ]]; then echo "$crit"; return; fi
  if [[ "$labels" =~ high-priority ]]; then echo "$high"; return; fi
  if [[ "$labels" =~ medium-priority ]]; then echo "$med"; return; fi
  if [[ "$labels" =~ low-priority ]]; then echo "$low"; return; fi
  echo ""; return
}

echo "-- Adding open issues/PRs to projects"
issues_json=$(gh issue list --repo "$OWNER/$REPO" --state open --limit 200 --json number,title,labels,url,isPullRequest 2>/dev/null || echo '[]')

echo "$issues_json" | tr '\n' ' ' | sed 's/},\s*{/}\n{/g' | sed -n 's/^\s*{\(.*\)}\s*$/\1/p' | while read -r row; do
  title=$(echo "$row" | sed -n 's/.*"title":"\([^"]*\)".*/\1/p')
  url=$(echo "$row" | sed -n 's/.*"url":"\([^"]*\)".*/\1/p')
  labels=$(echo "$row" | sed -n 's/.*"labels":\[\(.*\)\].*/\1/p' | sed 's/},{/}\n{/g' | sed -n 's/.*"name":"\([^"]*\)".*/\1/p' | paste -sd ',' -)
  proj_num=$(infer_project_number "$title" "$labels")
  if [[ -z "$proj_num" ]]; then continue; fi

  item_id=$(add_issue_to_project "$proj_num" "$url" || true)
  ids=$(infer_project_ids "$proj_num")
  if [[ -z "$ids" ]]; then continue; fi
  IFS='|' read -r project_id status_field_id priority_field_id status_backlog opt_c opt_h opt_m opt_l <<<"$ids"

  # For existing items, we need the item id; if missing, try to find it via item-list
  if [[ -z "$item_id" || "$item_id" == "null" ]]; then
    # Find by content URL using built-in JSON filtering
    item_id=$(retry_gh "gh project item-list \"$proj_num\" --owner \"$OWNER\" --format json --jq \".items[] | select(.content.url==\\\"$url\\\") | .id\"" | head -n1 || true)
  fi

  [[ -n "$item_id" ]] || continue

  # Set Status = Backlog
  set_item_single_select "$project_id" "$item_id" "$status_field_id" "$status_backlog" || true

  # Set Priority based on labels
  pri_opt=$(priority_option_for_labels "$labels" "$opt_c" "$opt_h" "$opt_m" "$opt_l")
  if [[ -n "$pri_opt" ]]; then
    set_item_single_select "$project_id" "$item_id" "$priority_field_id" "$pri_opt" || true
  fi
done

echo "-- Creating draft TODO items (limited)"
search_cmd=""; if command -v rg >/dev/null; then search_cmd="rg -n --no-ignore -S --glob '!*dist*' --glob '!.git/*' --glob '!**/.svelte-kit/**' '(TODO|FIXME):?\s*(.+)'"; else search_cmd="git grep -n -I -E '(TODO|FIXME):?\s*(.+)'"; fi

# Limit to 20 draft items to avoid noise
eval "$search_cmd" 2>/dev/null | head -n 20 | while IFS=: read -r file line rest; do
  title="TODO: ${file}:${line}"
  body="${rest}\n\nFile: ${file}:${line}"
  # Put generic TODOs into Quality project
  draft_id=$(create_draft_item "$QUALITY_NUM" "$title" "$body" 2>/dev/null || true)
  if [[ -n "$draft_id" && "$draft_id" != "null" ]]; then
    set_item_single_select "$QUALITY_ID" "$draft_id" "$status_field_id_quality" "$opt_status_backlog_quality" || true
  fi
done

echo "==> Population complete"
