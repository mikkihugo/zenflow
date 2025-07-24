#!/bin/bash
# Node.js 22 execution wrapper script
# Ensures all commands run with the correct Node.js version

# Use mise to execute with Node.js 22
exec mise exec -- "$@"