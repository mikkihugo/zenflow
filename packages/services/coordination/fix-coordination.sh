#!/bin/bash

echo "Fixing coordination package syntax errors..."

# Fix corrupted constructor patterns
find src -name "*.ts" -exec sed -i "s/'}/}/g" {} +

# Fix missing opening braces
find src -name "*.ts" -exec sed -i "/constructor() {/a\\
  " {} +

# Fix corrupted method endings
find src -name "*.ts" -exec sed -i "s/'}$/}/g" {} +

echo "Basic syntax fixes applied"
