#!/usr/bin/env node
/**
 * Quick corruption fixer for stray trailing backticks and malformed template literals
 * in packages/tools/singularity-coder/typescript-core/packages/opencode.
 *
 * It applies targeted regex replacements:
 * - Remove accidental trailing backticks after lines ending with `)` or `}` or string literals
 * - Fix double closing backticks after template literals }
 * - Remove lone lines containing only backticks
 * - Ensure common template expressions like ${...} are closed without extra backticks
 *
 * This is a best-effort mechanical cleanup to get ESLint parsing; manual review still recommended.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIR = path.join(
  ROOT,
  'packages/tools/singularity-coder/typescript-core'
);

/** Collect all .ts/.tsx files recursively under a directory */
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.isFile() && /\.(ts|tsx|jsx|js)$/.test(entry.name)) out.push(p);
  }
  return out;
}

function fixContent(src) {
  let s = src;
  const before = s;

  // 1) Remove dangling backticks that appear immediately after a closing paren/brace or string
  // e.g., ...))`  or ...}` or ..."`)` or ...'`)
  s = s.replace(/([)\}"'])(`)(?=\s*(?:\n|$))/g, '$1');

  // 2) Remove isolated lines that are just a backtick or backticks with whitespace
  s = s.replace(/^[\t ]*`+[\t ]*\r?\n/gm, '');

  // 3) Fix patterns like `${var}`` -> `${var}`
  s = s.replace(/(\$\{[^}]+\})(`)(?=\s)/g, '$1');

  // 4) Lines like output += `...\n`\n -> remove trailing extra backtick
  s = s.replace(/(`[^`\n]*?)(`)(\n)/g, '$1$3');

  // 5) Remove backtick after template literal within object literals: key:`value`,`
  s = s.replace(/(:\s*`[^`]*`)(,?)`/g, '$1$2');

  // 6) Remove stray backticks after function calls with template literals inside
  // fetch(`url`)` -> fetch(`url`)
  s = s.replace(/(\([^)]*`[^`]*`[^)]*\))`/g, '$1');

  // 7) Common message patterns: throw new Error(`...`)` -> throw new Error(`...`)
  s = s.replace(/(new\s+Error\([^)]*`[^`]*`[^)]*\))`/g, '$1');

  // 8) Ensure there is no triple closing quotes like ..."``
  s = s.replace(/"``/g, '"');
  s = s.replace(/'``/g, "'");

  // 9) Remove stray backticks after numeric/string literal followed by comma/paren
  s = s.replace(/([0-9A-Za-z_'\"])(`)\s*([,)}\]])/g, '$1$3');

  // 10) Fix cases like const a = $`git ...`.text()` -> remove trailing backtick after .text()
  s = s.replace(/(\.text\(\))(`)/g, '$1');
  s = s.replace(/(\.nothrow\(\))(`)/g, '$1');
  s = s.replace(/(\.quiet\(\))(`)/g, '$1');
  s = s.replace(/(\.cwd\([^)]*\))(`)/g, '$1');

  // 11) Fix key:`value`, trailing backtick in object/array literals
  s = s.replace(/(\}\)|\}\]|\)\]|\)\})(`)/g, '$1');

  return { changed: s !== before, content: s };
}

function main() {
  if (!fs.existsSync(TARGET_DIR)) {
    console.error('Target directory not found:', TARGET_DIR);
    process.exit(1);
  }
  const files = walk(TARGET_DIR);
  let changed = 0;
  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8');
    const { changed: didChange, content } = fixContent(src);
    if (didChange) {
      fs.writeFileSync(file, content, 'utf8');
      changed++;
    }
  }
  console.log(`Scanned ${files.length} files; fixed ${changed}.`);
}

main();
