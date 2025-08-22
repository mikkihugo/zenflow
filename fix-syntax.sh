#!/bin/bash

# Fix common syntax error patterns in TypeScript files
find /home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i \
  -e "s/' | '/|/g" \
  -e "s/' ' | '/|/g" \
  -e "s/| '/|/g" \
  -e "s/'|/|/g" \
  -e "s/' | ' | '/|/g" \
  -e "s/' ' | ' '/|/g" \
  -e "s/' | '  | '/|/g" \
  -e "s/'\]''/]/g" \
  -e "s/'')/)/g" \
  -e "s/''/'/g" \
  -e "s/'):/:)/g" \
  {} \;

echo "Fixed common syntax errors"