#!/bin/bash

echo "🚀 Document Stack Demo - GitHub Models Style"
echo "=========================================="
echo
echo "Choose how to run the document stack:"
echo
echo "1) Interactive CLI (Terminal-based)"
echo "2) Web Interface (Browser-based, like GitHub Models)"
echo "3) Run Tests"
echo
read -p "Enter your choice (1-3): " choice

case $choice in
  1)
    echo
    echo "Starting Interactive CLI..."
    echo "This provides a command-line interface for document management."
    echo
    node ./interactive-docstack.cjs
    ;;
    
  2)
    echo
    echo "Starting Web Server..."
    echo "This provides a GitHub Models-like web interface."
    echo
    node ./docstack-web-server.cjs
    ;;
    
  3)
    echo
    echo "Running Document Stack Tests..."
    echo
    node ./test-docstack.cjs
    ;;
    
  *)
    echo "Invalid choice. Please run again and select 1, 2, or 3."
    exit 1
    ;;
esac