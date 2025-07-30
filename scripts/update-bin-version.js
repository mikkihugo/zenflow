#!/usr/bin/env node
/**
 * Updates the VERSION in bin/claude-zen shell script to match package.json;
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ___filename = fileURLToPath(import.meta.url); // eslint-disable-line
const ___dirname = path.dirname(__filename); // eslint-disable-line
// Read package.json
const _packagePath = path.join(__dirname, '..', 'package.json'); // eslint-disable-line
const _packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8')); // eslint-disable-line
const _version = packageJson.version; // eslint-disable-line
// Read bin/claude-zen
const _binPath = path.join(__dirname, '..', 'bin', 'claude-zen'); // eslint-disable-line
const _binContent = fs.readFileSync(binPath, 'utf8'); // eslint-disable-line
// Update VERSION line
binContent = binContent.replace(/^VERSION=".*"$/m, `VERSION="${version}"`); // eslint-disable-line
// Write back
fs.writeFileSync(binPath, binContent); // eslint-disable-line
console.warn(`✅ Updated bin/claude-zen VERSION to ${version}`); // eslint-disable-line
