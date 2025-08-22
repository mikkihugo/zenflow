#!/bin/bash

# Fix emit calls with single argument to include timestamp data
# Pattern: this.emit('event-name'); -> this.emit('event-name', { timestamp: new Date() });

find apps/claude-code-zen-server/src -name "*.ts" -type f | while read file; do
    if grep -q "this\.emit('[^']*');" "$file"; then
        echo "Fixing emit calls in: $file"
        sed -i "s/this\.emit('\([^']*\)');/this.emit('\1', { timestamp: new Date() });/g" "$file"
    fi
done

# Also fix some package files
find packages -name "*.ts" -type f | while read file; do
    if grep -q "this\.emit('[^']*');" "$file"; then
        echo "Fixing emit calls in: $file"
        sed -i "s/this\.emit('\([^']*\)');/this.emit('\1', { timestamp: new Date() });/g" "$file"
    fi
done

echo "Emit call fixes complete!"