#!/bin/bash

# Comprehensive syntax fix for TypeScript files
echo "🔧 Starting comprehensive syntax fixes..."

# Fix basic patterns
find /home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i \
  -e "s/' | '/|/g" \
  -e "s/' ' | '/|/g" \
  -e "s/| '/|/g" \
  -e "s/'|/|/g" \
  -e "s/| |'/||/g" \
  -e "s/' ||'/||/g" \
  -e "s/' | ' | '/|/g" \
  -e "s/' ' | ' '/|/g" \
  -e "s/' | '  | '/|/g" \
  -e "s/' |  | '/||/g" \
  -e "s/'\]''/]/g" \
  -e "s/'')/)/g" \
  -e "s/''/'/g" \
  -e "s/'):/:)/g" \
  -e "s/'),/',/g" \
  -e "s/homedir(),'/.*/homedir(), '/g" \
  -e "s/process\.cwd(),'/.*/process.cwd(), '/g" \
  -e "s/:) Promise/): Promise/g" \
  -e "s/constructor'/constructor/g" \
  -e "s/'(/(/g" \
  -e "s/')'/)/g" \
  -e "s/'=/''/=/g" \
  -e "s/';//;/g" \
  -e "s/' |/ |/g" \
  -e "s/| '|/|/g" \
  -e "s/'\./\./g" \
  -e "s/\.'/''/./g" \
  {} \;

echo "✅ Basic pattern fixes completed"

# Fix specific type patterns
find /home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i \
  -e "s/'idle | busy'/'idle' | 'busy'/g" \
  -e "s/'pending | assigned'/'pending' | 'assigned'/g" \
  -e "s/'healthy | warning'/'healthy' | 'warning'/g" \
  -e "s/'low | medium'/'low' | 'medium'/g" \
  -e "s/'approve | reject'/'approve' | 'reject'/g" \
  {} \;

echo "✅ Type pattern fixes completed"

# Fix function parameters and returns
find /home/mhugo/code/claude-code-zen/apps/claude-code-zen-server/src -name "*.ts" -type f -exec sed -i \
  -e "s/Promise<string ' /Promise<string /g" \
  -e "s/Promise<void ' /Promise<void /g" \
  -e "s/Promise<any ' /Promise<any /g" \
  -e "s/: any ' |/ : any |/g" \
  -e "s/= any ' |/ = any |/g" \
  {} \;

echo "✅ Function signature fixes completed"

echo "🎉 Comprehensive syntax fixes completed!"