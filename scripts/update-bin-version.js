#!/usr/bin/env node
/**
 * Updates the VERSION in bin/claude-zen shell script to match package.json;
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ___filename = fileURLToPath(import.meta.url);
const ___dirname = path.dirname(__filename);
// Read package.json
const _packagePath = path.join(__dirname, '..', 'package.json');
const _packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const _version = packageJson.version;
// Read bin/claude-zen
const _binPath = path.join(__dirname, '..', 'bin', 'claude-zen');
const _binContent = fs.readFileSync(binPath, 'utf8');
// Update VERSION line
binContent = binContent.replace(/^VERSION=".*"$/m, `VERSION="${version}"`);
// Write back
fs.writeFileSync(binPath, binContent);
console.warn(`✅ Updated bin/claude-zen VERSION to ${version}`);
