#!/bin/bash

echo "Fixing coordination package syntax errors..."

# Fix the corrupted constructor/method patterns
find src -name "*.ts" -exec sed -i 's/constructor() {/constructor() {/g' {} +
find src -name "*.ts" -exec sed -i "s/'}'/\n  }/g" {} +
find src -name "*.ts" -exec sed -i 's/async execute(): Promise<void> {/async execute(): Promise<void> {/g' {} +

# Fix missing opening braces after method declarations
find src -name "*.ts" -exec sed -i 's/constructor() {/constructor() {\n    /g' {} +
find src -name "*.ts" -exec sed -i 's/async execute(): Promise<void> {/async execute(): Promise<void> {\n    /g' {} +

# Fix corrupted closing patterns
find src -name "*.ts" -exec sed -i "s/'}'/\n  }\n}/g" {} +

# Clean up extra whitespace and formatting
find src -name "*.ts" -exec sed -i 's/^[[:space:]]*TODO:/    \/\/ TODO:/g' {} +

echo "Syntax fixes applied to coordination package"
