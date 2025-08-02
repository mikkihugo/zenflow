#!/bin/bash

# Dependency Security Monitoring Script
# Run daily to check for vulnerabilities

set -e

echo "🔍 Running dependency security audit..."

# Run npm audit
npm audit --audit-level=moderate --production > security/audits/npm-audit-$(date +%Y%m%d).json

# Check for high/critical vulnerabilities
if npm audit --audit-level=high --production; then
    echo "✅ No high/critical vulnerabilities found"
else
    echo "⚠️  High/critical vulnerabilities detected!"
    echo "Run 'npm audit fix' to resolve"
    exit 1
fi

# Generate dependency report
node security/scripts/dependency-analysis.js

echo "📊 Dependency audit complete"
