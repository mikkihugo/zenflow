#!/usr/bin/env node

/**
 * Updates the VERSION in bin/claude-zen shell script to match package.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const version = packageJson.version;

// Read bin/claude-zen
const binPath = path.join(__dirname, '..', 'bin', 'claude-zen');
let binContent = fs.readFileSync(binPath, 'utf8');

// Update VERSION line
binContent = binContent.replace(
  /^VERSION=".*"$/m,
  `VERSION="${version}"`
);

// Write back
fs.writeFileSync(binPath, binContent);

console.log(`✅ Updated bin/claude-zen VERSION to ${version}`);