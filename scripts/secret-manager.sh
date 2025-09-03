#!/bin/bash
# Interactive TUI Secret Manager for GitHub Secrets
# Uses fzf for selection and gopass for local secret management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Secret categories with better naming
declare -A SECRET_CATEGORIES=(
    ["LLM"]="AI/Language Model providers"
    ["INFRA"]="Infrastructure and databases" 
    ["CLOUD"]="Cloud services and CDN"
    ["DEV"]="Development tools and CI/CD"
    ["AUTH"]="Authentication and security"
)

# Define secrets with better naming
declare -A LLM_SECRETS=(
    ["LLM_ANTHROPIC_API_KEY"]="Anthropic Claude API key"
    ["LLM_OPENAI_API_KEY"]="OpenAI GPT API key"
    ["LLM_GOOGLE_GEMINI_API_KEY"]="Google Gemini API key"
    ["LLM_MISTRAL_API_KEY"]="Mistral AI API key"
    ["LLM_COHERE_API_KEY"]="Cohere API key"
    ["LLM_GROQ_API_KEY"]="Groq API key"
    ["LLM_OPENROUTER_API_KEY"]="OpenRouter API key"
    ["LLM_HUGGINGFACE_TOKEN"]="Hugging Face token"
)

declare -A INFRA_SECRETS=(
    ["INFRA_DATABASE_URL"]="PostgreSQL connection string"
    ["INFRA_DB_PASSWORD"]="Database password"
    ["INFRA_VAULT_MASTER_KEY"]="Vault encryption master key"
    ["INFRA_JWT_SECRET"]="JWT signing secret"
    ["INFRA_SESSION_SECRET"]="Session encryption secret"
)

declare -A CLOUD_SECRETS=(
    ["CLOUD_CLOUDFLARE_API_TOKEN"]="Cloudflare API token"
    ["CLOUD_CLOUDFLARE_ZONE_ID"]="Cloudflare zone ID"
    ["CLOUD_VULTR_API_KEY"]="Vultr API key"
    ["CLOUD_VULTR_INFERENCE_KEY"]="Vultr inference API key"
)

declare -A DEV_SECRETS=(
    ["DEV_GITHUB_TOKEN"]="GitHub personal access token"
    ["DEV_GITHUB_COPILOT_TOKEN"]="GitHub Copilot OAuth token"
    ["DEV_CLAUDE_CODE_OAUTH_TOKEN"]="Claude Code OAuth token"
)

declare -A AUTH_SECRETS=(
    ["AUTH_ENCRYPTION_KEY"]="Data encryption key"
    ["AUTH_CF_AI_GATEWAY_TOKEN"]="Cloudflare AI Gateway token"
)

show_header() {
    clear
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                      🔐 Secret Manager TUI                          ║${NC}"
    echo -e "${BLUE}║                  GitHub Secrets + Local Management                  ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

show_menu() {
    echo -e "${YELLOW}Available actions:${NC}"
    echo "1. 📋 View existing GitHub secrets"
    echo "2. ➕ Add new secret"
    echo "3. 🔄 Migrate from gists"
    echo "4. 🧹 Clean up gists"
    echo "5. 📁 Manage local secrets (gopass)"
    echo "6. 🔍 Search secrets"
    echo "7. ❌ Exit"
    echo ""
}

view_secrets() {
    show_header
    echo -e "${GREEN}📋 Current GitHub Secrets:${NC}"
    echo ""
    gh secret list --json name,visibility,updatedAt | jq -r '.[] | "\(.name) (\(.visibility)) - Updated: \(.updatedAt)"' | sort
    echo ""
    echo -e "${PURPLE}Press any key to continue...${NC}"
    read -n 1
}

select_category() {
    local categories=()
    for category in "${!SECRET_CATEGORIES[@]}"; do
        categories+=("$category: ${SECRET_CATEGORIES[$category]}")
    done
    
    local selected=$(printf '%s\n' "${categories[@]}" | fzf --prompt="Select category: " --header="Choose secret category")
    echo "${selected%%:*}"
}

add_secret() {
    show_header
    echo -e "${GREEN}➕ Add New Secret${NC}"
    echo ""
    
    local category=$(select_category)
    if [ -z "$category" ]; then
        echo "No category selected"
        return 1
    fi
    
    # Get secrets for selected category
    local -n secrets_ref="${category}_SECRETS"
    local secret_options=()
    for key in "${!secrets_ref[@]}"; do
        secret_options+=("$key: ${secrets_ref[$key]}")
    done
    
    local selected_secret=$(printf '%s\n' "${secret_options[@]}" | fzf --prompt="Select secret: " --header="Choose secret to set")
    if [ -z "$selected_secret" ]; then
        echo "No secret selected"
        return 1
    fi
    
    local secret_name="${selected_secret%%:*}"
    local secret_desc="${secrets_ref[$secret_name]}"
    
    echo ""
    echo -e "${YELLOW}Setting: ${secret_name}${NC}"
    echo -e "${PURPLE}Description: ${secret_desc}${NC}"
    echo ""
    echo "Enter the secret value (input will be hidden):"
    read -s secret_value
    
    if [ -n "$secret_value" ]; then
        echo "$secret_value" | gh secret set "$secret_name" --repo mikkihugo/zenflow
        echo ""
        echo -e "${GREEN}✅ Secret '$secret_name' set successfully${NC}"
    else
        echo -e "${RED}❌ No value provided${NC}"
    fi
    
    echo ""
    echo -e "${PURPLE}Press any key to continue...${NC}"
    read -n 1
}

migrate_gists() {
    show_header
    echo -e "${GREEN}🔄 Migrate from Gists${NC}"
    echo ""
    
    local gists=(
        "b8b6952f58a9e543053d6201e9d98d33:Development Service Environment Variables"
        "b429c877f6b97080a394588ae57071a3:System Keys - Database, Encryption, Security"
        "a91f81273cfa80157a613259d01f977f:AI/Inference API Keys"
    )
    
    echo "Available gists to migrate:"
    for gist in "${gists[@]}"; do
        local id="${gist%%:*}"
        local desc="${gist##*:}"
        echo "  📄 $id - $desc"
    done
    
    echo ""
    echo "This will extract secrets from gists and show you what was found."
    echo "You can then use the 'Add secret' option to set them properly."
    echo ""
    echo -e "${YELLOW}Continue? (y/N)${NC}"
    read -r confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
        for gist in "${gists[@]}"; do
            local id="${gist%%:*}"
            local desc="${gist##*:}"
            echo ""
            echo -e "${BLUE}📄 $desc${NC}"
            echo "----------------------------------------"
            gh gist view "$id" --raw | grep "export " | head -10
            echo ""
        done
    fi
    
    echo ""
    echo -e "${PURPLE}Press any key to continue...${NC}"
    read -n 1
}

clean_gists() {
    show_header
    echo -e "${RED}🧹 Clean up Gists${NC}"
    echo ""
    
    echo "This will DELETE the following gists permanently:"
    echo "  📄 b8b6952f58a9e543053d6201e9d98d33 - Development Service Environment Variables"
    echo "  📄 b429c877f6b97080a394588ae57071a3 - System Keys - Database, Encryption, Security"
    echo "  📄 a91f81273cfa80157a613259d01f977f - AI/Inference API Keys"
    echo ""
    echo -e "${RED}⚠️  WARNING: This action cannot be undone!${NC}"
    echo ""
    echo "Type 'DELETE' to confirm:"
    read -r confirm
    
    if [ "$confirm" = "DELETE" ]; then
        echo ""
        echo "Deleting gists..."
        gh gist delete b8b6952f58a9e543053d6201e9d98d33 --confirm
        gh gist delete b429c877f6b97080a394588ae57071a3 --confirm  
        gh gist delete a91f81273cfa80157a613259d01f977f --confirm
        echo -e "${GREEN}✅ Gists deleted successfully${NC}"
    else
        echo -e "${YELLOW}❌ Cleanup cancelled${NC}"
    fi
    
    echo ""
    echo -e "${PURPLE}Press any key to continue...${NC}"
    read -n 1
}

manage_local_secrets() {
    show_header
    echo -e "${GREEN}📁 Local Secret Management (gopass)${NC}"
    echo ""
    
    if ! command -v gopass &> /dev/null; then
        echo -e "${RED}❌ gopass not found. Install with: mise install gopass${NC}"
        return 1
    fi
    
    echo "Local gopass store:"
    gopass ls 2>/dev/null || echo "No local secrets found. Initialize with: gopass init"
    
    echo ""
    echo -e "${PURPLE}Press any key to continue...${NC}"
    read -n 1
}

search_secrets() {
    show_header
    echo -e "${GREEN}🔍 Search Secrets${NC}"
    echo ""
    
    local all_secrets=()
    for category in LLM INFRA CLOUD DEV AUTH; do
        local -n secrets_ref="${category}_SECRETS"
        for key in "${!secrets_ref[@]}"; do
            all_secrets+=("[$category] $key: ${secrets_ref[$key]}")
        done
    done
    
    local selected=$(printf '%s\n' "${all_secrets[@]}" | fzf --prompt="Search secrets: " --header="All available secrets")
    
    if [ -n "$selected" ]; then
        local secret_name=$(echo "$selected" | sed 's/.*] \([^:]*\):.*/\1/')
        echo ""
        echo -e "${YELLOW}Selected: $secret_name${NC}"
        echo "$selected"
        
        echo ""
        echo "Actions:"
        echo "1. Set this secret"
        echo "2. Back to search" 
        echo "3. Main menu"
        
        read -n 1 action
        case $action in
            1) 
                echo ""
                echo "Enter the secret value:"
                read -s secret_value
                if [ -n "$secret_value" ]; then
                    echo "$secret_value" | gh secret set "$secret_name" --repo mikkihugo/zenflow
                    echo -e "${GREEN}✅ Secret set${NC}"
                fi
                ;;
            2) search_secrets; return ;;
            *) return ;;
        esac
    fi
    
    echo ""
    echo -e "${PURPLE}Press any key to continue...${NC}"
    read -n 1
}

main() {
    while true; do
        show_header
        show_menu
        
        echo -n "Select option (1-7): "
        read -n 1 choice
        echo ""
        
        case $choice in
            1) view_secrets ;;
            2) add_secret ;;
            3) migrate_gists ;;
            4) clean_gists ;;
            5) manage_local_secrets ;;
            6) search_secrets ;;
            7) echo -e "\n${GREEN}👋 Goodbye!${NC}"; exit 0 ;;
            *) echo -e "${RED}Invalid option${NC}"; sleep 1 ;;
        esac
    done
}

# Check dependencies
if ! command -v fzf &> /dev/null; then
    echo -e "${RED}❌ fzf not found. Install with: mise install fzf${NC}"
    exit 1
fi

if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ gh (GitHub CLI) not found. Install with: mise install gh${NC}"  
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq not found. Install with your package manager${NC}"
    exit 1
fi

main "$@"