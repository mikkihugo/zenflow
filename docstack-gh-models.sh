#!/bin/bash
# Document Stack - Process documents with GitHub Models CLI
# Uses `gh models run` to analyze documents and provide AI feedback

set -e

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed."
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if gh is authenticated
if ! gh auth status &> /dev/null; then
    echo "❌ GitHub CLI is not authenticated."
    echo "Run: gh auth login"
    exit 1
fi

# Available models
echo "🤖 Document Stack - GitHub Models Integration"
echo "==========================================="
echo
echo "Available models for document analysis:"
echo "1) gpt-4o - Best for complex document analysis"
echo "2) gpt-4o-mini - Faster, good for quick reviews"
echo "3) o1-preview - Advanced reasoning for architecture decisions"
echo "4) o1-mini - Efficient reasoning model"
echo
read -p "Select model (1-4): " model_choice

case $model_choice in
    1) MODEL="gpt-4o" ;;
    2) MODEL="gpt-4o-mini" ;;
    3) MODEL="o1-preview" ;;
    4) MODEL="o1-mini" ;;
    *) MODEL="gpt-4o-mini" ;;
esac

echo "Using model: $MODEL"
echo

# Function to analyze a document with gh models
analyze_document() {
    local doc_type=$1
    local doc_content=$2
    local service=$3
    
    echo "🔍 Analyzing $doc_type for $service..."
    
    # Create the prompt for document analysis
    local prompt="You are a document reviewer for a microservices architecture. Analyze this document and provide feedback.

Document Type: $doc_type
Service: $service

Document Content:
$doc_content

Please analyze and provide:
1. Document Quality Score (1-10)
2. Suggested Approvers (based on content)
3. Required Validations
4. Potential Issues or Improvements
5. Dependencies detected
6. Recommended tags

Format your response as JSON."

    # Run the model
    echo "$prompt" | gh models run $MODEL
}

# Function to process document for routing decisions
get_routing_feedback() {
    local doc_type=$1
    local service=$2
    local content=$3
    local current_approvers=$4
    
    local prompt="As an architecture reviewer, evaluate if these approvers are appropriate for this document:

Document Type: $doc_type
Service: $service
Current Approvers: $current_approvers

Document Summary:
$content

Should we:
1. Keep current approvers?
2. Add additional approvers?
3. Remove any approvers?
4. What validations should run?

Provide specific recommendations with reasoning."

    echo "$prompt" | gh models run $MODEL
}

# Main menu
while true; do
    echo
    echo "📚 Document Stack - GitHub Models Analysis"
    echo "========================================"
    echo "1) Analyze a single document"
    echo "2) Review routing decisions" 
    echo "3) Batch analyze multiple documents"
    echo "4) Generate document from requirements"
    echo "5) Exit"
    echo
    read -p "Choose an option: " choice

    case $choice in
        1)
            echo
            echo "📄 Single Document Analysis"
            echo "-------------------------"
            read -p "Document type (adr/api/security): " doc_type
            read -p "Service name: " service
            echo "Enter document content (press Ctrl+D when done):"
            doc_content=$(cat)
            
            echo
            analyze_document "$doc_type" "$doc_content" "$service"
            ;;
            
        2)
            echo
            echo "🔄 Routing Decision Review"
            echo "------------------------"
            read -p "Document type: " doc_type
            read -p "Service name: " service
            read -p "Current approvers (comma-separated): " approvers
            echo "Enter document summary (press Ctrl+D when done):"
            summary=$(cat)
            
            echo
            get_routing_feedback "$doc_type" "$service" "$summary" "$approvers"
            ;;
            
        3)
            echo
            echo "📦 Batch Document Analysis"
            echo "------------------------"
            echo "Reading documents from ./documents/ directory..."
            
            if [ -d "./documents" ]; then
                for file in ./documents/*.md; do
                    if [ -f "$file" ]; then
                        filename=$(basename "$file")
                        echo
                        echo "Processing: $filename"
                        content=$(cat "$file")
                        analyze_document "unknown" "$content" "batch-service"
                        echo "---"
                    fi
                done
            else
                echo "❌ No ./documents/ directory found"
            fi
            ;;
            
        4)
            echo
            echo "🎯 Generate Document from Requirements"
            echo "------------------------------------"
            read -p "Document type to generate (adr/api/security): " doc_type
            read -p "Service name: " service
            echo "Enter requirements (press Ctrl+D when done):"
            requirements=$(cat)
            
            local prompt="Generate a professional $doc_type document for $service based on these requirements:

$requirements

Use the appropriate template and best practices for $doc_type documents."
            
            echo
            echo "Generating document..."
            echo "$prompt" | gh models run $MODEL
            ;;
            
        5)
            echo "👋 Goodbye!"
            exit 0
            ;;
            
        *)
            echo "❌ Invalid choice"
            ;;
    esac
    
    echo
    read -p "Press Enter to continue..."
done