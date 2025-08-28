#!/bin/bash

# Test script to check sub-pages for white screens
BASE_URL="https://fra-d1.in.centralcloud.net"
SUBPAGES=("/system" "/agents" "/safe" "/events" "/memory")

echo "Testing sub-pages on ${BASE_URL}"
echo "======================================="

for page in "${SUBPAGES[@]}"; do
    url="${BASE_URL}${page}"
    echo ""
    echo "=== Testing: ${url} ==="
    
    # Get the HTTP status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "${url}")
    echo "HTTP Status: ${status_code}"
    
    # Get the response content
    content=$(curl -s "${url}")
    content_length=${#content}
    echo "Content Length: ${content_length} characters"
    
    # Check if it's likely a white screen (very minimal content)
    if [ $content_length -lt 500 ]; then
        echo "🚨 POSSIBLE WHITE SCREEN - Very minimal content"
    else
        echo "✅ Content appears substantial"
    fi
    
    # Check for SvelteKit indicators
    if echo "$content" | grep -q "sveltekit\|__sveltekit__\|data-sveltekit"; then
        echo "✅ SvelteKit elements detected"
    else
        echo "⚠️  No SvelteKit elements found"
    fi
    
    # Check for error messages
    if echo "$content" | grep -qi "error\|404\|not found\|exception"; then
        echo "🚨 Error indicators found in content"
    fi
    
    # Check for JavaScript bundles
    js_bundles=$(echo "$content" | grep -o '<script[^>]*src="[^"]*"' | wc -l)
    echo "JavaScript bundles found: ${js_bundles}"
    
    # Check for CSS files
    css_files=$(echo "$content" | grep -o '<link[^>]*stylesheet[^>]*>' | wc -l)
    echo "CSS files found: ${css_files}"
    
    # Show first few lines of content (for debugging)
    echo "First few lines of content:"
    echo "$content" | head -n 5 | sed 's/^/  /'
    
    # Check if content is just whitespace or minimal
    content_without_whitespace=$(echo "$content" | tr -d '[:space:]')
    if [ ${#content_without_whitespace} -lt 100 ]; then
        echo "🚨 CONFIRMED WHITE SCREEN - Content is mostly whitespace"
    fi
    
    echo "---"
done

echo ""
echo "======================================="
echo "Test completed"